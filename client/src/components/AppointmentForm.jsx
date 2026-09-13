import { useState } from 'react';

// ── Doctor list ───────────────────────────────────────────────────────────────

const DOCTORS = [
  'Dr. Arjun Mehta',
  'Dr. Priya Sharma',
  'Dr. Rajesh Kumar',
  'Dr. Sunita Patel',
  'Dr. Vikram Singh',
  'Dr. Ananya Gupta',
  'Dr. Sanjay Reddy',
];

// ── Time slots: 9:00 AM – 6:30 PM in 30-min steps ────────────────────────────

function buildTimeSlots() {
  const slots = [];
  for (let h = 9; h <= 18; h++) {
    for (const m of [0, 30]) {
      if (h === 18 && m > 30) break;
      const hh   = String(h).padStart(2, '0');
      const mm   = String(m).padStart(2, '0');
      const hr12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      slots.push({ value: `${hh}:${mm}`, label: `${hr12}:${mm} ${ampm}` });
    }
  }
  return slots;
}

const TIME_SLOTS = buildTimeSlots();

// ── Initial form state ────────────────────────────────────────────────────────

const INITIAL = {
  patient_name:     '',
  mobile_number:    '',
  doctor_name:      '',
  appointment_date: '',
  appointment_time: '',
  reason_for_visit: '',
};

// ── Validation ────────────────────────────────────────────────────────────────

function validate(values) {
  const errors = {};

  if (!values.patient_name.trim()) {
    errors.patient_name = 'Patient name is required';
  } else if (values.patient_name.trim().length < 2) {
    errors.patient_name = 'Must be at least 2 characters';
  }

  const mobile = values.mobile_number.replace(/\s/g, '');
  if (!mobile) {
    errors.mobile_number = 'Mobile number is required';
  } else if (!/^[0-9]{10}$/.test(mobile)) {
    errors.mobile_number = 'Must be exactly 10 digits';
  }

  if (!values.doctor_name) {
    errors.doctor_name = 'Please select a doctor';
  }

  if (!values.appointment_date) {
    errors.appointment_date = 'Date is required';
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(values.appointment_date) < today) {
      errors.appointment_date = 'Date cannot be in the past';
    }
  }

  if (!values.appointment_time) {
    errors.appointment_time = 'Please select a time slot';
  }

  return errors;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AppointmentForm({ onSubmit }) {
  const [values,      setValues]      = useState(INITIAL);
  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name])  setErrors((prev) => ({ ...prev, [name]: '' }));
    if (submitError)   setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await onSubmit(values);
      setValues(INITIAL);
      setErrors({});
    } catch (err) {
      // 409 conflict → show as a time-field error
      if (err?.field === 'appointment_time') {
        setErrors((prev) => ({ ...prev, appointment_time: err.error }));
        return;
      }
      const msg =
        (Array.isArray(err?.errors) ? err.errors.join(', ') : null) ||
        err?.error ||
        'Failed to book appointment. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">📝 Book New Appointment</h2>

      {submitError && (
        <div className="alert-error" role="alert">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">

          {/* Patient Name */}
          <div className="form-group">
            <label htmlFor="patient_name">
              Patient Name <span className="required">*</span>
            </label>
            <input
              id="patient_name"
              name="patient_name"
              type="text"
              placeholder="e.g. John Doe"
              value={values.patient_name}
              onChange={handleChange}
              className={errors.patient_name ? 'has-error' : ''}
              disabled={submitting}
              autoComplete="off"
            />
            {errors.patient_name && (
              <span className="error-msg">⚠ {errors.patient_name}</span>
            )}
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label htmlFor="mobile_number">
              Mobile Number <span className="required">*</span>
            </label>
            <input
              id="mobile_number"
              name="mobile_number"
              type="tel"
              placeholder="10-digit number"
              value={values.mobile_number}
              onChange={handleChange}
              className={errors.mobile_number ? 'has-error' : ''}
              maxLength={10}
              disabled={submitting}
              autoComplete="off"
            />
            {errors.mobile_number && (
              <span className="error-msg">⚠ {errors.mobile_number}</span>
            )}
          </div>

          {/* Doctor — dropdown */}
          <div className="form-group">
            <label htmlFor="doctor_name">
              Doctor <span className="required">*</span>
            </label>
            <select
              id="doctor_name"
              name="doctor_name"
              value={values.doctor_name}
              onChange={handleChange}
              className={errors.doctor_name ? 'has-error' : ''}
              disabled={submitting}
            >
              <option value="">— Select a doctor —</option>
              {DOCTORS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.doctor_name && (
              <span className="error-msg">⚠ {errors.doctor_name}</span>
            )}
          </div>

          {/* Appointment Date */}
          <div className="form-group">
            <label htmlFor="appointment_date">
              Appointment Date <span className="required">*</span>
            </label>
            <input
              id="appointment_date"
              name="appointment_date"
              type="date"
              min={today}
              value={values.appointment_date}
              onChange={handleChange}
              className={errors.appointment_date ? 'has-error' : ''}
              disabled={submitting}
            />
            {errors.appointment_date && (
              <span className="error-msg">⚠ {errors.appointment_date}</span>
            )}
          </div>

          {/* Time Slot — dropdown, 9 AM–6:30 PM, 30-min steps */}
          <div className="form-group">
            <label htmlFor="appointment_time">
              Time Slot <span className="required">*</span>
            </label>
            <select
              id="appointment_time"
              name="appointment_time"
              value={values.appointment_time}
              onChange={handleChange}
              className={errors.appointment_time ? 'has-error' : ''}
              disabled={submitting}
            >
              <option value="">— Select a time —</option>
              {TIME_SLOTS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.appointment_time && (
              <span className="error-msg">⚠ {errors.appointment_time}</span>
            )}
          </div>

          {/* Reason for Visit — optional, triggers AI summary */}
          <div className="form-group full-width">
            <label htmlFor="reason_for_visit">Reason for Visit</label>
            <textarea
              id="reason_for_visit"
              name="reason_for_visit"
              placeholder="Describe symptoms or reason for visiting…"
              value={values.reason_for_visit}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

        </div>

        <div className="form-footer">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner" />
                Booking…
              </>
            ) : (
              'Book Appointment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
