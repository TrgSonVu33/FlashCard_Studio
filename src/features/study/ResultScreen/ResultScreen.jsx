import './resultScreen.css';

/**
 * Component: ResultScreen
 * Hiển thị màn hình tổng kết sau khi người dùng hoàn thành một phiên học flashcard.
 * Thông báo số câu trả lời đúng trên tổng số câu và cung cấp các nút điều hướng 
 * để xem lịch sử hoặc bắt đầu phiên mới.
 * 
 * @param {number} correctCount - Điểm số (số lượng thẻ người dùng đánh giá từ mức Good trở lên)
 * @param {number} total - Tổng số lượng thẻ đã xuất hiện trong phiên học
 * @param {string} mode - Chế độ học ('standard' cho bộ mặc định, hoặc 'easy', 'normal', 'hard' cho bộ trộn)
 * @param {function} onReset - Hàm callback được gọi khi người dùng muốn bắt đầu phiên học mới (quay về chọn bài)
 * @param {function} onViewHistory - Hàm callback được gọi khi người dùng muốn xem lại lịch sử học tập
 */
export default function ResultScreen({ correctCount, total, mode, onReset, onViewHistory }) {
  // Xử lý chuỗi chế độ học (mode) để hiển thị đẹp hơn
  // Nếu mode khác 'standard' (VD: 'easy', 'normal'), viết hoa chữ cái đầu tiên (Easy, Normal).
  // Nếu là 'standard' (hoặc không có mode), hiển thị mặc định là 'Standard'.
  const displayMode = mode && mode !== 'standard' 
    ? mode.charAt(0).toUpperCase() + mode.slice(1) 
    : 'Standard';

  return (
    <div className="result-container">
      {/* Biểu tượng chúc mừng */}
      <div className="result-icon">🎉</div>
      
      {/* Tiêu đề chính */}
      <h2 className="result-title">Session Complete!</h2>
      
      {/* Dòng chữ tổng kết điểm số */}
      <p className="result-text">
        You scored <strong>{correctCount}</strong> out of <strong>{total}</strong> in <strong>{displayMode}</strong> Mode.
      </p>
      
      {/* Nhóm các nút thao tác */}
      <div className="result-actions">
        {/* Nút Xem Lịch Sử (Nút phụ) */}
        <button className="result-btn-primary" onClick={onViewHistory}>
          View History
        </button>
        {/* Nút Bắt Đầu Lại (Nút chính) */}
        <button className="result-btn-secondary" onClick={onReset}>
          Start New Session
        </button>
      </div>
    </div>
  );
}