import StatusBadge from './StatusBadge';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** "2025-09-14" → "14/09/2025" */
function fmtDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

/** "14:30" → "2:30 PM" */
function fmtTime(str) {
  if (!str) return '—';
  const [h, m] = str.split(':');
  const hr = parseInt(h, 10);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const hr12 = hr % 12 || 12;
  return `${hr12}:${m} ${ampm}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AppointmentTable({
  appointments,
  loading,
  onStatusChange,
  onDelete,
}) {
  // Loading skeleton
  if (loading) {
    return (
      <div className="card">
        <div className="loading">Loading appointments…</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">
        📊 Appointments
        {appointments.length > 0 && (
          <span className="count-badge">{appointments.length}</span>
        )}
      </h2>

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
                <th>#</th>
                <th>Patient</th>
                <th>Mobile</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt, index) => (
                <tr key={appt.id}>
                  <td>{index + 1}</td>

                  {/* Patient + optional AI Summary card */}
                  <td>
                    <span className="patient-name">{appt.patient_name}</span>
                    {appt.ai_summary && (
                      <div className="ai-summary-card">
                        <span className="ai-summary-label">✦ AI Summary</span>
                        <p className="ai-summary-text">{appt.ai_summary}</p>
                      </div>
                    )}
                  </td>

                  <td>{appt.mobile_number}</td>
                  <td>{appt.doctor_name}</td>
                  <td>{fmtDate(appt.appointment_date)}</td>
                  <td>{fmtTime(appt.appointment_time)}</td>

                  <td>
                    <StatusBadge status={appt.status} />
                  </td>

                  {/* Action buttons */}
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => onStatusChange(appt.id, 'Completed')}
                        disabled={appt.status !== 'Pending'}
                        title={
                          appt.status !== 'Pending'
                            ? `Already ${appt.status}`
                            : 'Mark as Completed'
                        }
                      >
                        ✓ Complete
                      </button>

                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => onStatusChange(appt.id, 'Cancelled')}
                        disabled={appt.status !== 'Pending'}
                        title={
                          appt.status !== 'Pending'
                            ? `Already ${appt.status}`
                            : 'Cancel Appointment'
                        }
                      >
                        ✕ Cancel
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete appointment for ${appt.patient_name}? This cannot be undone.`
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
