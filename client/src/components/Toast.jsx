/**
 * Toast notification component.
 * Renders a fixed stack of dismissable toasts in the top-right corner.
 */
export default function Toast({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(({ id, message, type }) => (
        <div key={id} className={`toast toast-${type}`} role="alert">
          <span className="toast-icon">
            {type === 'success' ? '✓' : '✕'}
          </span>
          <span>{message}</span>
        </div>
      ))}
    </div>
  );
}
