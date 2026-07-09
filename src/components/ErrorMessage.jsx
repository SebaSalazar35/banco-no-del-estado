export default function ErrorMessage({ message, onClose }) {
  if (!message) {
    return null
  }

  return (
    <div className="alert alert-error" role="alert">
      <span>{message}</span>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Cerrar mensaje">
          ×
        </button>
      )}
    </div>
  )
}
