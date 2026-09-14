import { Fragment } from "react";
import StatusBadge from "./StatusBadge";

function fmtDate(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

function fmtTime(str) {
  if (!str) return "—";
  const [h, m] = str.split(":");
  const hr = parseInt(h, 10);
  const ampm = hr >= 12 ? "PM" : "AM";
  const hr12 = hr % 12 || 12;
  return `${hr12}:${m} ${ampm}`;
}

export default function AppointmentTable({
  appointments,
  loading,
  onStatusChange,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="card">
        <div className="loading">Loading appointments…</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-title-row">
          <h2 className="card-title">
            Scheduled Appointments
            {appointments.length > 0 && (
              <span className="count-badge">{appointments.length}</span>
            )}
          </h2>
        </div>
        <p className="card-subtitle">
          List of all scheduled visits and patient status
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No appointments yet. Book your first appointment above.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th className="col-patient">Patient</th>
                <th className="col-mobile">Mobile</th>
                <th className="col-doctor">Doctor</th>
                <th className="col-date">Date</th>
                <th className="col-time">Time</th>
                <th className="col-status">Status</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt, index) => (
                <Fragment key={appt.id}>
                  <tr
                    className={
                      appt.ai_summary
                        ? "appointment-row has-ai-summary"
                        : "appointment-row"
                    }
                  >
                    <td className="col-num">{index + 1}</td>

                    <td className="col-patient">
                      <span className="patient-name">{appt.patient_name}</span>
                    </td>

                    <td className="col-mobile">{appt.mobile_number}</td>
                    <td className="col-doctor">{appt.doctor_name}</td>
                    <td className="col-date">
                      {fmtDate(appt.appointment_date)}
                    </td>
                    <td className="col-time">
                      {fmtTime(appt.appointment_time)}
                    </td>

                    <td className="col-status">
                      <StatusBadge status={appt.status} />
                    </td>

                    <td className="col-actions">
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() => onStatusChange(appt.id, "Completed")}
                          disabled={appt.status !== "Pending"}
                          title={
                            appt.status !== "Pending"
                              ? `Already ${appt.status}`
                              : "Mark as Completed"
                          }
                        >
                          ✓ Complete
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-warning"
                          onClick={() => onStatusChange(appt.id, "Cancelled")}
                          disabled={appt.status !== "Pending"}
                          title={
                            appt.status !== "Pending"
                              ? `Already ${appt.status}`
                              : "Cancel Appointment"
                          }
                        >
                          ✕ Cancel
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete appointment for ${appt.patient_name}? This cannot be undone.`,
                              )
                            ) {
                              onDelete(appt.id);
                            }
                          }}
                          title="Delete Appointment"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {appt.ai_summary && (
                    <tr className="ai-summary-row">
                      <td colSpan={8}>
                        <div className="ai-summary-box">
                          <span className="ai-summary-label">
                            <span className="ai-sparkle">✦</span> AI Summary:
                          </span>
                          <span className="ai-summary-text">
                            {appt.ai_summary}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
