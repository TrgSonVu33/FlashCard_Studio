import PremiumUpsell from '@/components/shared/premiumUpsell/PremiumUpsell';

/**
 * Component: HistoryView
 * Chịu trách nhiệm hiển thị trang Lịch sử học tập (History) dưới dạng danh sách, 
 * nơi người dùng có thể xem lại kết quả các phiên học trước đó.
 * Hỗ trợ tải thêm (Load More) và ẩn bớt (Show Less) để quản lý phân trang.
 * 
 * @param {Array} history - Danh sách các bản ghi lịch sử đã được tải về.
 * @param {boolean} loadingHistory - Cờ trạng thái đang tải dữ liệu từ server.
 * @param {number} page - Chỉ số trang hiện tại đang hiển thị (phân trang 0-indexed).
 * @param {number} PAGE_SIZE - Hằng số cấu hình số lượng bản ghi tối đa hiển thị trên 1 trang.
 * @param {Array} allDecks - Danh sách toàn bộ các bộ bài hiện có, dùng để tra cứu thông tin (Tên bộ bài, icon).
 * @param {function} loadMore - Hàm được gọi khi người dùng nhấn nút "Show More" để tải trang kế tiếp.
 * @param {function} showLess - Hàm được gọi khi người dùng nhấn nút "Show Less" để quay lại trang đầu.
 * @param {function} onBack - Hàm callback quay lại màn hình trước đó (thường là Dashboard/Home).
 */
export const HistoryView = ({ 

  isPremium,
  onRedirectToLogin,
  onUpgrade,
  history, 
  loadingHistory, 
  page, 
  PAGE_SIZE, 
  allDecks, 
  loadMore, 
  showLess, 
  onBack 
}) => {
  return (
    <div className="view-centered view-full-height">
      <div className="history-page">
        
        {/* === PHẦN ĐẦU (Header) === */}
        <div className="history-page-header">
          <button className="quit-button header-back-btn" onClick={onBack}>
            ← Back
          </button>
          <div className="history-page-title-container">
            <h1 className="history-page-title">History</h1>
            <p className="history-page-subtitle">Review your past study sessions</p>
          </div>
        </div>
        
        {/* === NỘI DUNG CHÍNH (Dashboard) === */}
        <div className="history-dashboard">
          
          {/* TRƯỜNG HỢP 0: Chưa đăng nhập hoặc chưa có Premium */}
          {!isPremium ? (
            <PremiumUpsell 
              featureName="Practice History" 
              onUpgrade={onUpgrade} 
              onLoginForUpgrade={onRedirectToLogin}
            />
          ) : loadingHistory && page === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">⏳</span>
              <p className="empty-state-title">Loading history...</p>
            </div>
            
          ) : history.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📭</span>
              <p className="empty-state-title">No history yet</p>
              <p className="empty-state-desc">Complete a study session to see your results here.</p>
            </div>
            
          ) : (
            <>
              <ul className="history-list">
                {history.map((item) => {
                  
                  // -- 1. ĐỊNH DẠNG NGÀY THÁNG --
                  // Nếu trường created_at là chuẩn ISO string (có chữ T), 
                  // thì chuyển đổi về chuỗi dạng DD/MM/YYYY cho dễ đọc.
                  let displayDate = item.created_at;
                  if (typeof item.created_at === 'string' && item.created_at.includes('T')) {
                    const dateObj = new Date(item.created_at);
                    if (!isNaN(dateObj)) {
                      displayDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
                    }
                  }
                  
                  // -- 2. LẤY THÔNG TIN BỘ BÀI (DECK) --
                  // Tìm kiếm bộ bài tương ứng trong danh sách `allDecks` bằng cách đối chiếu ID hoặc tên.
                  const deckInfo = allDecks.find(
                    d => d.id === item.categories || 
                         (d.title && item.categories && d.title.toLowerCase() === item.categories.toLowerCase())
                  );
                  
                  // -- 3. ĐỊNH DẠNG HIỂN THỊ DANH MỤC (CATEGORY) --
                  let displayCategory = null;
                  
                  // Trường hợp 3a: Phiên học ở chế độ Trộn (Mixed mode: easy, normal, hard)
                  if (['easy', 'normal', 'hard'].includes(item.mode)) {
                    // Viết hoa chữ cái đầu (VD: 'easy' -> 'Easy')
                    const modeName = item.mode.charAt(0).toUpperCase() + item.mode.slice(1);
                    displayCategory = <span className="history-category">&nbsp;🎯 {modeName} Study Set</span>;
                    
                  // Trường hợp 3b: Phiên học một bộ bài cụ thể (Tìm thấy thông tin bộ bài)
                  } else if (deckInfo) {
                    const icon = deckInfo.icon || '🌄'; // Sử dụng icon của bộ bài, nếu không có thì dùng mặc định '📚'
                    displayCategory = <span className="history-category">&nbsp;{icon} : {deckInfo.title}</span>;
                    
                  // Trường hợp 3c: Phiên học nhưng không tìm thấy bộ bài (Có thể bộ bài đã bị xóa)
                  } else if (item.categories) {
                    displayCategory = <span className="history-category">&nbsp;🗑️ : Deleted Deck</span>;
                  }
                  
                  // -- 4. RENDER MỘT BẢN GHI LỊCH SỬ --
                  return (
                    <li key={item.id} className="history-item">
                      {/* Phần thông tin (Cột trái) */}
                      <div className="history-info">
                        <span className="history-id">{item.id}.&nbsp;</span>
                        <span className="history-date">{displayDate}</span>
                        {displayCategory}
                      </div>
                      
                      {/* Phần điểm số (Cột phải) */}
                      <span className="history-score">
                        Score: <strong>{item.score} / {item.total}</strong>
                      </span>
                    </li>
                  );
                })}
              </ul>
              
              {/* === KHU VỰC CÁC NÚT PHÂN TRANG === */}
              <div className="history-buttons">
                {/* Nút "Show Less" (Ẩn bớt): Chỉ hiện khi danh sách dài hơn 1 trang */}
                {history.length > PAGE_SIZE && (
                  <button className="show-more-button" onClick={showLess}>Show Less</button>
                )}
                
                {/* Nút "Show More" (Tải thêm): Chỉ hiện khi danh sách hiện tại đã đạt đủ số lượng bản ghi của (tất cả các trang) */}
                {history.length >= (page + 1) * PAGE_SIZE && (
                  <button className="show-more-button" onClick={loadMore} disabled={loadingHistory}>
                    {loadingHistory ? 'Loading...' : 'Show More'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
};
