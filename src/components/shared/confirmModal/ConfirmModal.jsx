import './ConfirmModal.css';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  isDestructive = false 
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-container">
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="confirm-modal-btn confirm-modal-btn--cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`confirm-modal-btn ${isDestructive ? 'confirm-modal-btn--destructive' : 'confirm-modal-btn--primary'}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
