import express from 'express';
import supabase from '../supabase.js';
import { validateAppointment } from '../middleware/validate.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Calls the Groq API (free tier) to generate a brief clinical appointment summary.
 * Model: qwen/qwen3.8-27b — confirmed working on this API key.
 * Returns null silently if the call fails so booking is never blocked.
 */
async function generateAISummary(patientName, doctorName, reason) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !reason?.trim()) return null;

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'system',
              content:
                'You are a clinical documentation assistant. Write concise, professional appointment summaries in 1-2 sentences only. No greetings, no bullet points.',
            },
            {
              role: 'user',
              content: `Generate a brief appointment summary for patient ${patientName} visiting ${doctorName} for: "${reason}".`,
            },
          ],
          max_tokens: 120,
          temperature: 0.3,
        }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error('[AI] Groq API error:', response.status, text);
      return null;
    }

    const data = JSON.parse(text);
    const raw = data.choices?.[0]?.message?.content || '';
    // Qwen3 may wrap reasoning in <think>…</think> — strip it before storing
    const summary = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim() || null;
    console.log('[AI] Summary generated:', summary);
    return summary;
  } catch (err) {
    console.error('[AI] Summary generation failed:', err.message);
    return null;
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/appointments — fetch all, ordered by date & time
router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments — create a new appointment
router.post('/', validateAppointment, async (req, res, next) => {
  try {
    const {
      patient_name,
      mobile_number,
      doctor_name,
      appointment_date,
      appointment_time,
      reason_for_visit,
    } = req.body;

    // ── Time-slot conflict check ──────────────────────────────────────────────
    // A 30-min slot is exclusively held by one patient per doctor per day.
    // Cancelled appointments release the slot.
    const { data: conflict } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_name', doctor_name.trim())
      .eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time)
      .neq('status', 'Cancelled')
      .limit(1);

    if (conflict && conflict.length > 0) {
      return res.status(409).json({
        error: `This time slot is already booked for ${doctor_name}. Please choose a different time.`,
        field: 'appointment_time',
      });
    }

    // ── AI summary ────────────────────────────────────────────────────────────
    const ai_summary = await generateAISummary(
      patient_name.trim(),
      doctor_name.trim(),
      reason_for_visit
    );

    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          patient_name: patient_name.trim(),
          mobile_number: mobile_number.replace(/\s/g, ''),
          doctor_name: doctor_name.trim(),
          appointment_date,
          appointment_time,
          reason_for_visit: reason_for_visit?.trim() || null,
          ai_summary,
          status: 'Pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/appointments/:id/status — update status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const VALID_STATUSES = ['Completed', 'Cancelled'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Appointment not found' });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/appointments/:id — delete an appointment
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
