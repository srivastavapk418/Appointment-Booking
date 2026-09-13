/** Color-coded pill badge for appointment status. */
export default function StatusBadge({ status }) {
  const classMap = {
    Pending:   'badge badge-pending',
    Completed: 'badge badge-completed',
    Cancelled: 'badge badge-cancelled',
  };

  return (
    <span className={classMap[status] ?? 'badge'}>
      {status}
    </span>
  );
}
