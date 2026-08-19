import { useState, useEffect } from 'react';
import AuthPromptModal from '@/components/shared/authPromptModal/AuthPromptModal';
import PremiumUpsell from '@/components/shared/premiumUpsell/PremiumUpsell';
import '@/features/decks/deckSelect/deckSelect.css';

/**
 * Component: DeckSelect
 * Màn hình cho phép người dùng xem và chọn bộ bài để học.
 * Danh sách bộ bài được chia làm 2 tab: 
 * - System Decks: Các bộ bài mặc định của hệ thống.
 * - Custom Decks: Các bộ bài do chính người dùng tạo ra.
 * Tại tab Custom, người dùng có thể tạo thêm bộ bài mới hoặc chỉnh sửa các bộ bài hiện có.
 * 
 * @param {Array} decks - Danh sách toàn bộ các bộ bài được tải từ cơ sở dữ liệu
 * @param {function} onSelect - Hàm callback được gọi khi người dùng bấm chọn một bộ bài để học
 * @param {function} onCreateDeck - Hàm callback được gọi khi bấm nút "Create New Deck"
 * @param {function} onEditDeck - Hàm callback được gọi khi chọn "Edit Deck"
 * @param {function} onDeleteDeck - Hàm callback được gọi khi chọn "Delete Deck"
 */
export default function DeckSelect({ user, isPremium, onRedirectToLogin, decks, loadingDecks, onSelect, onLoginForStudy, onCreateDeck, onEditDeck, onDeleteDeck, activeTab = 'system', onTabChange, onUpgrade }) {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [pendingDeck, setPendingDeck] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    if (menuOpenId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpenId]);

  // Lọc danh sách bộ bài thành 2 loại: System (Hệ thống) và Custom (Tự tạo)
  const systemDecks = decks.filter(d => d.is_system);
  const customDecks = decks.filter(d => !d.is_system); // Bộ bài do người dùng tạo
  
  /**
   * Hàm xác định biểu tượng (emoji) đại diện cho từng bộ bài.
   * Nếu người dùng có chọn icon lúc tạo, ưu tiên dùng icon đó.
   * Nếu là bộ bài hệ thống chưa có icon, tự động gán icon dựa vào từ khóa trong tiêu đề.
   * 
   * @param {Object} deck - Dữ liệu của một bộ bài
   * @returns {string} Emoji tương ứng
   */
  const getDeckEmoji = (deck) => {
    if (deck.icon) return deck.icon; // Ưu tiên icon đã được lưu trong DB
    if (!deck.is_system) return '✨'; // Mặc định cho Custom Deck nếu không có icon
    
    // Gán icon tự động cho System Deck dựa vào tên
    const t = deck.title.toLowerCase();
    if (t.includes('animal')) return '🐾';
    if (t.includes('fruit')) return '🥭';
    if (t.includes('color')) return '🎨';
    if (t.includes('body')) return '🫀';
    if (t.includes('drink')) return '🥤';
    if (t.includes('school')) return '🏫';
    return '📚'; // Icon mặc định cuối cùng
  };
  
  // Xác định danh sách bộ bài nào sẽ được hiển thị trên lưới (Grid) dựa theo tab đang mở
  const visibleDecks = activeTab === 'system' ? systemDecks : customDecks;
  
  return (
    <div className="deck-select">
      
      {/* === THANH TAB ĐIỀU HƯỚNG === */}
      <div className="deck-tabs">
        {/* Tab System Decks */}
        <button
          className={`deck-tab ${activeTab === 'system' ? 'deck-tab--active' : ''}`}
          onClick={() => onTabChange ? onTabChange('system') : null}
        >
          System Decks
          {/* Hiển thị số lượng bộ bài bên cạnh */}
          <span className="deck-tab-count">{systemDecks.length}</span>
        </button>
        
        {/* Tab Custom Decks */}
        <button
          className={`deck-tab ${activeTab === 'custom' ? 'deck-tab--active' : ''}`}
          onClick={() => onTabChange ? onTabChange('custom') : null}
        >
          Custom Decks
          <span className="deck-tab-count">{customDecks.length}</span>
        </button>
      </div>
      
      {/* === NỘI DUNG LƯỚI BỘ BÀI === */}
      {/* Hiển thị trạng thái đang tải nếu đang load và chưa có data */}
      {loadingDecks && visibleDecks.length === 0 ? (
        <div className="deck-empty">
          <div className="auth-spinner" style={{ marginBottom: '16px', borderTopColor: '#ff7043' }}></div>
          <p className="deck-empty-title">Loading decks...</p>
          <p className="deck-empty-desc">Please wait while we fetch your study topics.</p>
        </div>
      ) : activeTab === 'system' && decks.length === 0 ? (
        <div className="deck-empty">
          <span className="deck-empty-icon">📭</span>
          <p className="deck-empty-title">No decks available</p>
          <p className="deck-empty-desc">Check back later for new study topics.</p>
        </div>
      ) : activeTab === 'custom' && !isPremium ? (
        <PremiumUpsell featureName="Custom Decks" onUpgrade={onUpgrade} onLoginForUpgrade={onRedirectToLogin} />
      ) : visibleDecks.length > 0 || activeTab === 'custom' ? (
        <div className="deck-grid">
          
          {/* Nút Tạo bộ bài mới (Chỉ hiện trong tab Custom) */}
          {activeTab === 'custom' && (
            <div className="deck-card-wrapper">
              <button
                className="deck-card"
                onClick={onCreateDeck}
                style={{ borderStyle: 'dashed', background: 'transparent' }}
              >
                <span className="deck-emoji">✚</span>
                <span className="deck-label">Create New Deck</span>
              </button>
            </div>
          )}
          
          {/* Duyệt qua danh sách bộ bài đang chọn để render thành các thẻ (Card) */}
          {visibleDecks.map((deck) => (
            <div key={deck.id} className="deck-card-wrapper">
              {/* Thẻ bộ bài chính (Bấm vào để học) */}
              <button
                className="deck-card"
                onClick={() => {
                  if (deck.is_system && !user) {
                    setPendingDeck(deck);
                    setShowAuthPrompt(true);
                  } else {
                    onSelect(deck);
                  }
                }}
              >
                <span className="deck-emoji">{getDeckEmoji(deck)}</span>
                <span className="deck-label">{deck.title}</span>
              </button>
              
              {/* Nút tùy chọn (Dấu ba chấm) - Chỉ hiển thị cho Custom Decks */}
              {activeTab === 'custom' && (
                <div className="deck-menu-container">
                  <button
                    className="deck-edit-btn"
                    onClick={(e) => { 
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === deck.id ? null : deck.id);
                    }}
                    title="Deck Options"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {menuOpenId === deck.id && (
                    <div className="deck-menu-dropdown">
                      <button 
                        className="deck-menu-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                          onEditDeck?.(deck);
                        }}
                      >
                        Edit Deck
                      </button>
                      <button 
                        className="deck-menu-item deck-menu-item--delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                          onDeleteDeck?.(deck);
                        }}
                      >
                        Delete Deck
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Trạng thái khi không có bộ bài nào (Chỉ xảy ra ở tab System nếu DB rỗng)
        <div className="deck-empty">
          <span className="deck-empty-icon">📚</span>
          <p className="deck-empty-title">No system decks found</p>
          <p className="deck-empty-desc">System decks will appear once added to the database.</p>
        </div>
      )}

      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        onLogin={() => {
          if (pendingDeck && onLoginForStudy) {
            onLoginForStudy(pendingDeck);
          } else {
            onRedirectToLogin();
          }
        }}
      />
    </div>
  );
}
