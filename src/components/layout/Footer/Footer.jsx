import '@/components/layout/footer/footer.css';

/**
 * Component: Footer
 * Phần chân trang (Footer) của ứng dụng, thường chứa các thông tin bản quyền, 
 * liên kết mạng xã hội và mô tả ngắn gọn về sản phẩm.
 * 
 * Component này là giao diện tĩnh (Static UI), không chứa logic phức tạp.
 */
export default function Footer() {
  return (
    <footer className="saas-footer">
      <div className="footer-content">
        
        {/* Nửa bên trái Footer: Chứa Logo và Mô tả sản phẩm */}
        <div className="footer-left">
          <div className="footer-brand">
            
            {/* Logo dạng text đi kèm một dấu chấm trang trí */}
            <div className="footer-logo">
              <span className="footer-logo-dot"></span>
              <span className="footer-title">FlashCard Studio</span>
            </div>
            
            {/* Slogan / Mô tả ngắn gọn */}
            <p className="footer-desc">
              The most professional way to master new vocabulary with spaced repetition.
            </p>
          </div>
          
          {/* Nửa bên phải (hoặc bên cạnh): Các liên kết hữu ích (Links) */}
          <div className="footer-links">
            {/* Cột liên kết "Connect" (Mạng xã hội) */}
            <div className="footer-column">
              <div className="footer-column-header">
                <span className="footer-logo-dot"></span>
                <h4 className="footer-column-title">Connect</h4>
              </div>
              <div className="footer-link-group">
                {/* Hiện tại các link này đang để trống (#) */}
                <a href="#" className="footer-link" aria-label="X (Twitter)">
                  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="footer-icon"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                </a>
                <a href="#" className="footer-link" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="footer-icon"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="#" className="footer-link" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="footer-icon"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Dòng chữ bản quyền (Copyright) ở dưới cùng */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} FlashCard Studio. All rights reserved.</p>
      </div>
    </footer>
  );
}
