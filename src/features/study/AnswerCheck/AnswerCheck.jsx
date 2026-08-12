import './answerCheck.css';

/**
 * Component: AnswerCheck
 * Cung cấp giao diện xác nhận câu trả lời đúng/sai đơn giản.
 * Gồm hai nút: "Yes (I got it right)" và "No (I got it wrong)".
 * 
 * @param {function} onAnswer - Hàm callback kích hoạt khi người dùng chọn, truyền true cho "Yes" và false cho "No"
 */
export default function AnswerCheck({ onAnswer }) {
  return (
    <div className="answerCheck-container">
      {/* Tiêu đề hỏi thăm */}
      <p className="answerCheck-title">Did you get it right?</p>
      
      {/* Nhóm các lựa chọn (Options) */}
      <div className="answerCheck-options">
        
        {/* Nút kiểm tra "Có" (Đã trả lời đúng) */}
        <button
          className="answerCheck-btn answerCheck-btn-yes"
          onClick={(e) => {
            e.stopPropagation();
            onAnswer(true);
          }}
        >
          Yes (I got it right)
        </button>
        
        {/* Nút kiểm tra "Không" (Trả lời sai) */}
        <button
          className="answerCheck-btn answerCheck-btn-no"
          onClick={(e) => {
            e.stopPropagation();
            onAnswer(false);
          }}
        >
          No (I got it wrong)
        </button>
        
      </div>
    </div>
  );
}
