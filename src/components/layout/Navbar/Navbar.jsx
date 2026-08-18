import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import '@/components/layout/navbar/navbar.css';

/**
 * Component: Navbar
 * Thanh điều hướng chính (Navigation Bar) luôn hiển thị ở phía trên cùng của ứng dụng.
 * Hỗ trợ menu dạng ngang trên màn hình lớn và menu dạng hamburger (thu gọn) trên màn hình di động.
 * 
 * Phiên bản SaaS: Hiển thị email người dùng đã đăng nhập và nút Log Out.
 * Ẩn các link điều hướng khi chưa đăng nhập.
 * 
 * @param {function} onNavClick - Hàm callback được gọi khi người dùng click vào một đường link trên thanh điều hướng
 * @param {string} currentView - Trạng thái màn hình hiện tại (Ví dụ: 'home', 'deckSelect') dùng để làm nổi bật (highlight) link đang kích hoạt
 */
export default function Navbar({ onNavClick, currentView }) {
  // State quản lý trạng thái mở/đóng của menu thả xuống trên giao diện điện thoại di động
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isPremium, signOut } = useAuth();
  
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

  /**
   * Hàm xử lý đăng xuất. Gọi signOut() từ AuthContext rồi đóng menu.
   */
  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
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
                Study
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

            {/* Link: Pricing */}
            <li>
              <button 
                className={`navbar-link ${currentView === 'pricing' ? 'active' : ''}`}
                onClick={() => handleNav('pricing')}
              >
                Pricing
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
            
            {/* Hiển thị email người dùng và nút Log Out khi đã đăng nhập */}
            {user ? (
              <>
                <div className="navbar-user-info">
                  <span className="navbar-user-email" title={user.email}>
                    {user.email}
                  </span>
                  <span 
                    className={`navbar-plan-badge ${isPremium ? 'navbar-plan-badge--premium' : 'navbar-plan-badge--basic'}`}
                    onClick={() => handleNav('pricing')}
                    style={{ cursor: 'pointer' }}
                    title="View Plans"
                  >
                    {isPremium ? 'Premium' : 'Basic'}
                  </span>
                </div>
                <button 
                  className="navbar-btn navbar-btn--logout" 
                  id="nav-logout-btn"
                  onClick={handleSignOut}
                >
                  Log Out
                </button>
              </>
            ) : (
              <button 
                className="navbar-btn navbar-btn--primary" 
                id="nav-login-btn"
                onClick={() => handleNav('login')}
              >
                Log In
              </button>
            )}
            
          </div>
        </nav>
        
      </div>
    </header>
  );
}
