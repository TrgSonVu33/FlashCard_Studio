import { useState, useRef, useEffect } from 'react';
import './contactDropdown.css';

/**
 * Component: ContactDropdown
 * Hiển thị một nút "Get in Touch" và mở ra một form liên hệ dạng Popover (Dropdown) khi click vào.
 * Tích hợp tính năng tự động đóng (Click outside to close) khi người dùng bấm ra ngoài vùng form.
 */
export default function ContactDropdown() {
  // State quản lý việc mở/đóng của dropdown
  const [isOpen, setIsOpen] = useState(false);
  
  // Ref dùng để tham chiếu tới thẻ div bao bọc toàn bộ component này.
  // Nhờ đó ta có thể kiểm tra xem cú click chuột có nằm bên ngoài component hay không.
  const dropdownRef = useRef(null);
  
  /**
   * Effect hook: Lắng nghe sự kiện click chuột trên toàn bộ document (trang web).
   * Giúp thực hiện tính năng "Click outside to close".
   */
  useEffect(() => {
    function handleClickOutside(event) {
      // Nếu ref đã được gán VÀ phần tử bị click KHÔNG nằm bên trong dropdownRef
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); // Thì đóng dropdown lại
      }
    }
    
    // Đăng ký sự kiện mousedown (khi nhấn chuột xuống)
    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup function: Xóa sự kiện khi component bị unmount để tránh rò rỉ bộ nhớ
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  /**
   * Hàm xử lý khi người dùng nhấn nút Submit gửi form.
   * Hiện tại do chưa tích hợp backend nhận email, hàm này chỉ chặn hành vi load lại trang mặc định
   * và đóng dropdown để tạo cảm giác form đã được gửi.
   * 
   * @param {Object} e - Sự kiện submit của form
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn trình duyệt tự động gửi form và tải lại trang
    // Thực tế sẽ gọi API gửi email tại đây...
    setIsOpen(false); // Đóng modal sau khi submit
  };

  return (
    // Gắn ref vào container bọc ngoài cùng
    <div className="contact-dropdown-wrapper" ref={dropdownRef}>
      
      {/* Nút bấm bật/tắt form */}
      <button 
        className={`contact-toggle-btn ${isOpen ? 'contact-toggle-btn--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="contact-toggle-icon">💬</span>
        Get in Touch
      </button>
      
      {/* Giao diện Popup Form chỉ hiện khi isOpen = true */}
      {isOpen && (
        <div className="contact-dropdown-popover">
          <div className="contact-dropdown-header">
            <h4>Send us a message</h4>
            <p>We'll get back to you as soon as possible.</p>
          </div>
          
          {/* Form thu thập thông tin */}
          <form className="contact-dropdown-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Name" required className="contact-input" />
            <input type="email" placeholder="Email" required className="contact-input" />
            <input type="text" placeholder="Reason for Contact" required className="contact-input" />
            <textarea placeholder="How can we help you?" rows="4" required className="contact-textarea"></textarea>
            
            <button type="submit" className="contact-submit-btn">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
}
