import { useState } from 'react';
import AuthPromptModal from '@/components/shared/authPromptModal/AuthPromptModal';
import PremiumUpsell from '@/components/shared/premiumUpsell/PremiumUpsell';
import '@/features/decks/studySetsSelect/studySetsSelect.css';

/**
 * Cấu hình danh sách các chế độ trộn bài (Mixed Modes).
 * Mỗi chế độ sẽ có độ khó khác nhau dựa trên số lượng bộ bài mặc định được trộn chung.
 * key: Định danh của chế độ (để xử lý logic)
 * label: Tên chế độ hiển thị trên nút bấm
 * emoji: Biểu tượng minh họa
 * desc: Mô tả chi tiết về chế độ
 * color: Màu sắc chủ đạo (nếu cần dùng cho UI sau này)
 */
const MODES = [
  { key: 'easy', label: 'Easy', emoji: '🌱', desc: 'Mix 2 random default decks', color: '#16a34a', premiumRequired: false },
  { key: 'normal', label: 'Normal', emoji: '🔥', desc: 'Mix 4 random default decks', color: '#ea580c', premiumRequired: true },
  { key: 'hard', label: 'Hard', emoji: '⚡️', desc: 'Mix all 6 default decks', color: '#dc2626', premiumRequired: true },
];

/**
 * Component: StudySetsSelect
 * Màn hình cho phép người dùng chọn một chế độ học "Trộn bộ bài" (Study Sets).
 * Thay vì học 1 bộ cố định, tính năng này sẽ gom thẻ từ nhiều bộ bài ngẫu nhiên 
 * để tăng độ khó và kiểm tra khả năng phản xạ.
 * 
 * @param {function} onSelectMode - Hàm callback được gọi khi người dùng chọn xong chế độ và nhấn Bắt đầu
 */
export default function StudySetsSelect({ user, isPremium, onRedirectToLogin, onSelectMode, onUpgrade }) {
  // State lưu trữ chế độ (key) mà người dùng đang chọn (easy, normal, hard)
  // Ban đầu là null (chưa chọn gì)
  const [selectedMode, setSelectedMode] = useState(null);
  
  // State quản lý việc hiển thị modal yêu cầu đăng nhập
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showPremiumUpsell, setShowPremiumUpsell] = useState(false);

  /**
   * Hàm xử lý sự kiện khi người dùng nhấn nút "Start Session".
   * Gọi hàm onSelectMode truyền từ component cha (App.jsx) để bắt đầu khởi tạo dữ liệu phiên học.
   */
  const handleStart = () => {
    // Chỉ chạy khi đã có một chế độ được chọn
    if (selectedMode) {
      if (!user) {
        setShowAuthPrompt(true);
      } else {
        onSelectMode(selectedMode);
      }
    }
  };

  return (
    <div className="study-sets-select">
      {/* Tiêu đề trang */}
      <div className="study-sets-header">
        <h2 className="study-sets-title">Study Sets</h2>
        <p className="study-sets-subtitle">
          Challenge yourself by mixing cards from multiple default categories
        </p>
      </div>
      
      {/* Khu vực chọn độ khó (Chế độ trộn) */}
      <div className="mode-selector">
        <p className="mode-selector-label">Choose Difficulty</p>
        
        {/* Nhóm các nút chọn (Toggle buttons) */}
        <div className="mode-toggle">
          {MODES.map((mode) => {
            const isLocked = mode.premiumRequired && (!user || !isPremium);
            return (
              <button
                key={mode.key}
                // Thêm class --active nếu nút này đang được chọn
                className={`mode-toggle-btn ${selectedMode === mode.key ? 'mode-toggle-btn--active' : ''} ${isLocked ? 'mode-toggle-btn--locked' : ''}`}
                onClick={() => {
                  if (isLocked) {
                    setShowPremiumUpsell(true);
                  } else {
                    setSelectedMode(mode.key);
                  }
                }}
              >
                <span className="mode-toggle-emoji">{isLocked ? '🔒' : mode.emoji}</span>
                <span className="mode-toggle-label">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Khung thông tin mô tả chi tiết của chế độ (Chỉ hiện khi đã chọn) */}
      {selectedMode && (
        <div className="mode-info">
          {/* Tìm và hiển thị emoji của chế độ đang chọn */}
          <span className="mode-info-emoji">
            {MODES.find(m => m.key === selectedMode)?.emoji}
          </span>
          {/* Tìm và hiển thị dòng mô tả của chế độ đang chọn */}
          <span className="mode-info-text">
            {MODES.find(m => m.key === selectedMode)?.desc}
          </span>
        </div>
      )}
      
      {/* Nút Bắt đầu phiên học */}
      <button
        // Làm mờ nút nếu chưa chọn chế độ nào
        className={`start-session-btn ${selectedMode ? '' : 'start-session-btn--disabled'}`}
        onClick={handleStart}
        disabled={!selectedMode} // Vô hiệu hóa tính năng click nếu chưa chọn
      >
        Start Session →
      </button>

      {/* Modal yêu cầu đăng nhập */}
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        onLogin={() => onRedirectToLogin()}
      />
      
      {/* Màn hình Upsell Premium */}
      {showPremiumUpsell && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0, 0, 0, 0.5)', 
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <PremiumUpsell featureName="Advanced Study Modes" onBack={() => setShowPremiumUpsell(false)} onUpgrade={onUpgrade} onLoginForUpgrade={onRedirectToLogin} />
        </div>
      )}
    </div>
  );
}
