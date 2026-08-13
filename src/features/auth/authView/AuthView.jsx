import { useState } from 'react';

/**
 * Component: AuthView
 * Panel bên trái của trang xác thực (Login/SignUp/ForgotPass).
 * Hiển thị logo, tagline và các mock card giới thiệu ứng dụng FlashCard Studio.
 * Panel này chỉ xuất hiện trên màn hình lớn (ẩn trên di động bằng CSS).
 */
export default function AuthView() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="auth-branding">
      {/* Logo & Tên ứng dụng */}
      <div className="auth-branding-logo">
        <span className="auth-branding-dot" aria-hidden="true"></span>
        <span className="auth-branding-name">FlashCard Studio</span>
      </div>

      {/* Tagline */}
      <p className="auth-branding-tagline">
        Master anything with smart flashcards. Track your progress and study smarter, not harder.
      </p>

      {/* Mock flashcard trang trí có thể lật */}
      <div 
        className={`auth-mock-card-container ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="auth-mock-card-inner">
          {/* Mặt trước */}
          <div className="auth-mock-card-front">
            <span className="auth-mock-card-text">Nice to meet you !!</span>
            <div className="auth-mock-card-footer">
              <span className="auth-mock-card-accent"></span>
              <span className="auth-mock-card-hint">Click to flip</span>
            </div>
          </div>
          {/* Mặt sau */}
          <div className="auth-mock-card-back">
            <span className="auth-mock-card-text">Good to see you !! </span>
            <div className="auth-mock-card-footer">
              <span className="auth-mock-card-accent"></span>
              <span className="auth-mock-card-hint">Click to flip</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature pills */}
      <div className="auth-branding-features">
        <span className="auth-feature-pill">
          <span className="auth-feature-pill-icon">📚</span> Custom Decks
        </span>
        <span className="auth-feature-pill">
          <span className="auth-feature-pill-icon">📊</span> Progress Tracking
        </span>
        <span className="auth-feature-pill">
          <span className="auth-feature-pill-icon">🔀</span> Study Sets
        </span>
      </div>
    </div>
  );
}
