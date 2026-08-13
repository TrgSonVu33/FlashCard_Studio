import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import '@/components/layout/navbar/navbar.css';

/**
 * Component: Navbar
 * Thanh điều hướng chính (Navigation Bar) luôn hiển thị ở phía trên cùng của ứng dụng.
 * Hỗ trợ menu dạng ngang trên màn hình lớn và menu dạng hamburger (thu gọn) trên màn hình di động.
 * 
 * @param {function} onNavClick - Hàm callback được gọi khi người dùng click vào một đường link trên thanh điều hướng
 * @param {string} currentView - Trạng thái màn hình hiện tại (Ví dụ: 'home', 'deckSelect') dùng để làm nổi bật (highlight) link đang kích hoạt
 */
export default function Navbar({ onNavClick, currentView }) {
  // State quản lý trạng thái mở/đóng của menu thả xuống trên giao diện điện thoại di động
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  /**
   * Hàm xử lý chung khi người dùng click vào một mục trên Navbar.
   * Gửi sự kiện chuyển trang lên component cha và tự động đóng menu (nếu đang ở màn hình nhỏ).
   * 
   * @param {string} view - Tên màn hình cần chuyển đến
   */
  const handleNav = (view) => {
    onNavClick(view);
    setMenuOpen(false); // Đảm bảo menu điện thoại đóng lại sau khi chọn
  };

  return (
    <header className="navbar" id="navbar">
      <div className="navbar-inner">
        
        {/* LOGO & BRAND NAME */}
        {/* Bấm vào Logo sẽ đưa người dùng về trang chủ ('home') */}
        <div 
          className="navbar-brand" 
          onClick={() => handleNav('home')}
          style={{ cursor: 'pointer' }}
        >
          {/* Chấm màu (dot) làm logo cách điệu */}
          <span className="navbar-logo-dot" aria-hidden="true"></span>
          <span className="navbar-title">FlashCard Studio</span>
        </div>
        
        {/* NÚT TOGGLE CHO GIAO DIỆN DI ĐỘNG (Hamburger Menu) */}
        {/* Nút này mặc định bị ẩn bằng CSS trên màn hình máy tính và chỉ hiện trên điện thoại */}
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)} // Bấm để Đảo ngược trạng thái đóng/mở
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className={`navbar-toggle-icon ${menuOpen ? 'open' : ''}`}></span>
        </button>
        
        {/* CÁC ĐƯỜNG LINK ĐIỀU HƯỚNG */}
        {/* Trên điện thoại, thêm class `navbar-menu--open` để trượt menu ra khi menuOpen = true */}
        <nav className={`navbar-menu ${menuOpen ? 'navbar-menu--open' : ''}`}>
          <ul className="navbar-links">
            
            {/* Link: Study Sets */}
            <li>
              <button 
                // Thêm class 'active' nếu màn hình hiện tại đang là studySets
                className={`navbar-link ${currentView === 'studySets' ? 'active' : ''}`}
                onClick={() => handleNav('studySets')}
              >
                Study Sets
              </button>
            </li>
            
            {/* Link: Decks */}
            <li>
              <button 
                className={`navbar-link ${currentView === 'deckSelect' ? 'active' : ''}`}
                onClick={() => handleNav('deckSelect')}
              >
                Decks
              </button>
            </li>
            
            {/* Link: History */}
            <li>
              <button 
                className={`navbar-link ${currentView === 'history' ? 'active' : ''}`}
                onClick={() => handleNav('history')}
              >
                History
              </button>
            </li>
            
          </ul>
          
          {/* CÁC NÚT HÀNH ĐỘNG (Call-to-Action) */}
          <div className="navbar-actions">
            <button 
              onClick={toggleTheme} 
              className={`theme-switch ${theme === 'dark' ? 'theme-switch--dark' : ''}`}
              aria-label="Toggle Dark Mode"
            >
              <div className="theme-switch-track">
                <div className="theme-switch-thumb">
                  {theme === 'dark' ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{color: '#f8fafc'}}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{color: '#eab308'}}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                  )}
                </div>
              </div>
            </button>
            
            {/* Nút Log In: Hiện tại là giao diện tĩnh (mockup), chưa có logic xử lý đăng nhập */}
            <button className="navbar-btn navbar-btn--ghost" id="nav-login-btn">
              Log In
            </button>
            
            {/* Nút Bắt đầu học: Điều hướng nhanh sang trang chọn bộ bài */}
            <button
              className="navbar-btn navbar-btn--primary"
              id="nav-start-btn"
              onClick={() => handleNav('deckSelect')}
            >
              Start Studying
            </button>
          </div>
        </nav>
        
      </div>
    </header>
  );
}
