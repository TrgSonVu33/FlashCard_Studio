
/**
 * Component: HomeView
 * Màn hình trang chủ (Dashboard) của ứng dụng.
 * Hiển thị lời chào mừng và cung cấp lưới các nút bấm lớn (Dashboard Grid)
 * để người dùng điều hướng nhanh chóng đến các tính năng chính.
 * 
 * @param {number} systemDeckCount - Số lượng bộ bài mặc định của hệ thống
 * @param {number} customDeckCount - Số lượng bộ bài do người dùng tự tạo
 * @param {function} onNavigate - Hàm điều hướng (thay đổi state currentView ở App.jsx)
 * @param {function} onShowCreateDeck - Hàm kích hoạt modal "Create Deck" (Tạo bộ bài mới)
 */
export const HomeView = ({ 
  systemDeckCount, 
  customDeckCount, 
  onNavigate, 
  onShowCreateDeck 
}) => {
  return (
    <div className="view-centered">
      
      {/* === PHẦN GIỚI THIỆU (Hero Section) === */}
      <section className="hero-section">
        <h1 className="hero-title">
          Welcome to your <br /> Study Workspace
        </h1>
        <p className="hero-subtitle">
          Build decks, mix categories, and master new vocabulary with spaced repetition, all in one place.
        </p>
      </section>
      
      {/* === LƯỚI TÍNH NĂNG CHÍNH (Dashboard Grid) === */}
      <div className="dashboard-grid">
        
        {/* Nút 1: Xem tất cả bộ bài (Browse Decks) */}
        <button className="dashboard-card" onClick={() => onNavigate('deckSelect')}>
          <div className="dashboard-card-icon">📚</div>
          <span className="dashboard-card-title">Browse Decks</span>
          {/* Hiển thị số liệu thống kê sơ bộ về số lượng bộ bài */}
          <span className="dashboard-card-desc">
            {systemDeckCount} default · {customDeckCount} custom
          </span>
        </button>
        
        {/* Nút 2: Trộn bộ bài và học theo chế độ (Study Sets) */}
        <button className="dashboard-card" onClick={() => onNavigate('studySets')}>
          <div className="dashboard-card-icon">🎯</div>
          <span className="dashboard-card-title">Study Sets</span>
          <span className="dashboard-card-desc">
            Mix decks in Easy, Normal, or Hard mode
          </span>
        </button>
        
        {/* Nút 3: Tạo bộ bài mới (Create Deck) */}
        {/* Nút này không chuyển trang mà bật trực tiếp Modal lên */}
        <button className="dashboard-card" onClick={onShowCreateDeck}>
          <div className="dashboard-card-icon">✚</div>
          <span className="dashboard-card-title">Create Deck</span>
          <span className="dashboard-card-desc">
            Build a custom flashcard deck
          </span>
        </button>
        
        {/* Nút 4: Xem lịch sử (History) */}
        <button className="dashboard-card" onClick={() => onNavigate('history')}>
          <div className="dashboard-card-icon">📊</div>
          <span className="dashboard-card-title">History</span>
          <span className="dashboard-card-desc">
            Review your past study sessions
          </span>
        </button>
        
      </div>
    </div>
  );
};
