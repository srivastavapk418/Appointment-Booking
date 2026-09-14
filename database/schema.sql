
CREATE TABLE IF NOT EXISTS appointments (
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
);

CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON appointments (status);

CREATE INDEX IF NOT EXISTS idx_appointments_date
  ON appointments (appointment_date, appointment_time);
