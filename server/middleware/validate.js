export function validateAppointment(req, res, next) {
  const {
    patient_name,
    mobile_number,
    doctor_name,
    appointment_date,
    appointment_time,
  } = req.body;
  const errors = [];

  if (!patient_name || !patient_name.trim()) {
    errors.push("Patient name is required");
  } else if (patient_name.trim().length < 2) {
    errors.push("Patient name must be at least 2 characters");
  }

  const mobile = (mobile_number || "").replace(/\s/g, "");
  if (!mobile) {
    errors.push("Mobile number is required");
  } else if (!/^[0-9]{10}$/.test(mobile)) {
    errors.push("Mobile number must be exactly 10 digits");
  }

  if (!doctor_name || !doctor_name.trim()) {
    errors.push("Doctor name is required");
  } else if (doctor_name.trim().length < 2) {
    errors.push("Doctor name must be at least 2 characters");
  }

  if (!appointment_date) {
    errors.push("Appointment date is required");
  }

  if (!appointment_time) {
    errors.push("Appointment time is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}
