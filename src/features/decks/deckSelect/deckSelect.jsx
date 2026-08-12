import './deckSelect.css';

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
 * @param {function} onEditDeck - Hàm callback được gọi khi bấm nút cài đặt (dấu 3 chấm) trên một custom deck
 */
export default function DeckSelect({ decks, onSelect, onCreateDeck, onEditDeck, activeTab = 'system', onTabChange }) {
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
      {/* Hiển thị lưới nếu có dữ liệu HOẶC đang ở tab Custom (để hiện nút Create) */}
      {visibleDecks.length > 0 || activeTab === 'custom' ? (
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
                onClick={() => onSelect(deck)}
              >
                <span className="deck-emoji">{getDeckEmoji(deck)}</span>
                <span className="deck-label">{deck.title}</span>
              </button>
              
              {/* Nút chỉnh sửa bộ bài (Dấu ba chấm) - Chỉ hiển thị cho Custom Decks */}
              {activeTab === 'custom' && (
                <button
                  className="deck-edit-btn"
                  onClick={(e) => { 
                    e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền ra thẻ lớn (tránh bị nhảy vào học luôn)
                    onEditDeck?.(deck);  // Gọi hàm mở Modal Edit
                  }}
                  title="Edit Deck Settings"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
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
    </div>
  );
}
