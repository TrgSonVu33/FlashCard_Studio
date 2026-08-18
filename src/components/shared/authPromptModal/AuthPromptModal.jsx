import { useEffect } from 'react';
import './AuthPromptModal.css';

export default function AuthPromptModal({ isOpen, onClose, onLogin }) {
  // Ngăn scroll nền khi modal đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="auth-prompt-overlay" onClick={handleOverlayClick}>
      <div className="auth-prompt-modal" role="dialog" aria-labelledby="auth-prompt-title">
        <div className="auth-prompt-icon-wrapper">
          <span className="auth-prompt-icon">🔒</span>
        </div>
        <h2 id="auth-prompt-title" className="auth-prompt-title">Login Required</h2>
        <p className="auth-prompt-desc">
          Please log in to your account to start the study session and save your progress.
        </p>
        <div className="auth-prompt-actions">
          <button className="auth-prompt-btn auth-prompt-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="auth-prompt-btn auth-prompt-btn--login" onClick={onLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
