import './footer.css';

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
                <a href="#" className="footer-link">Twitter / X</a>
                <a href="#" className="footer-link">LinkedIn</a>
                <a href="#" className="footer-link">GitHub</a>
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
