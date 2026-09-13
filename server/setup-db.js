/**
 * setup-db-via-rpc.js — Creates the appointments table via Supabase REST.
 * Uses the supabase-js client to call a raw query through the REST layer.
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const statements = [
  `CREATE TABLE IF NOT EXISTS appointments (
    id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_name     TEXT        NOT NULL,
    mobile_number    TEXT        NOT NULL,
    doctor_name      TEXT        NOT NULL,
    appointment_date DATE        NOT NULL,
    appointment_time TIME        NOT NULL,
    reason_for_visit TEXT,
    ai_summary       TEXT,
    status           TEXT        NOT NULL DEFAULT 'Pending'
                     CHECK (status IN ('Pending', 'Completed', 'Cancelled')),
    created_at       TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status)`,
  `CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date, appointment_time)`,
];

async function run() {
  for (const stmt of statements) {
    // Execute each SQL statement via the supabase REST SQL endpoint
    const resp = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/sql`,
      {
        method: 'POST',
        headers: {
          apikey: process.env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ query: stmt }),
      }
    );

    const text = await resp.text();
    console.log(resp.status, stmt.slice(0, 40).trim(), '->', text || 'OK');
  }
}

run().catch(console.error);
