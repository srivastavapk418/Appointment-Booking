import { useState, useCallback } from "react";
import AppointmentForm from "./components/AppointmentForm";
import AppointmentTable from "./components/AppointmentTable";
import Toast from "./components/Toast";
import useAppointments from "./hooks/useAppointments";

const TOAST_DURATION = 4000;

function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  return { toasts, addToast };
}

export default function App() {
  const {
    appointments,
    loading,
    error,
    addAppointment,
    changeStatus,
    removeAppointment,
  } = useAppointments();

  const { toasts, addToast } = useToasts();

  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === "Pending").length;
  const completed = appointments.filter((a) => a.status === "Completed").length;
  const cancelled = appointments.filter((a) => a.status === "Cancelled").length;

  const handleSubmit = async (formData) => {
    await addAppointment(formData);
    addToast("Appointment booked successfully!", "success");
  };

  const handleStatusChange = async (id, status) => {
    try {
      await changeStatus(id, status);
      addToast(`Appointment marked as ${status}`, "success");
    } catch {
      addToast("Failed to update status. Please try again.", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeAppointment(id);
      addToast("Appointment deleted", "success");
    } catch {
      addToast("Failed to delete appointment. Please try again.", "error");
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <span className="header-icon">🏥</span>
          <div>
            <h1>Appointment Booking System</h1>
            <p>Schedule, track, and manage patient appointments</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div
            className="alert-error"
            role="alert"
            style={{ marginBottom: "1.25rem" }}
          >
            ⚠ Could not connect to the server: {error}
          </div>
        )}

        <div className="stats-bar">
          <div className="stat-card total">
            <span className="stat-label">Total</span>
            <span className="stat-value">{total}</span>
          </div>
          <div className="stat-card pending">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pending}</span>
          </div>
          <div className="stat-card completed">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{completed}</span>
          </div>
          <div className="stat-card cancelled">
            <span className="stat-label">Cancelled</span>
            <span className="stat-value">{cancelled}</span>
          </div>
        </div>

        <AppointmentForm onSubmit={handleSubmit} />

        <AppointmentTable
          appointments={appointments}
          loading={loading}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </main>

      <Toast toasts={toasts} />
    </>
  );
}
