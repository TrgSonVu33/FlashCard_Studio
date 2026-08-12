import { useState } from 'react';
import AnswerCheck from '../answerCheck/answerCheck';
import './flashCard.css';

/**
 * Component: Flashcard
 * Hiển thị một thẻ flashcard với 2 mặt (Mặt trước: Câu hỏi, Mặt sau: Câu trả lời).
 * Cho phép người dùng nhấp vào thẻ để lật (flip) và xác nhận xem họ có trả lời đúng không 
 * sau khi xem mặt sau của thẻ.
 * 
 * @param {string|ReactNode} question - Nội dung mặt trước (Câu hỏi)
 * @param {string|ReactNode} answer - Nội dung mặt sau (Câu trả lời)
 * @param {function} onAnswer - Hàm callback được gọi khi người dùng bấm nút Yes/No
 * @param {boolean} showRating - Cờ hiệu bật/tắt thanh đánh giá (True trong phiên học, False nếu chỉ xem trước)
 */
const FlashCard = ({ question, answer, onAnswer, showRating = false }) => {
  // State quản lý trạng thái lật của thẻ (false: mặt trước, true: mặt sau)
  const [isFlipped, setIsFlipped] = useState(false);
  
  /**
   * Hàm xử lý khi người dùng chọn Yes/No từ component AnswerCheck
   * 
   * @param {boolean} isCorrect - Trạng thái đúng/sai
   */
  const handleAnswerClick = (isCorrect) => {
    if (onAnswer) {
      onAnswer(isCorrect); // Gửi kết quả lên component cha (StudySession)
      setIsFlipped(false); // Đặt lại trạng thái lật thẻ về mặt trước để chuẩn bị cho thẻ tiếp theo
    }
  };

  return (
    <div className="flashcard-wrapper">
      {/* Container chính của thẻ, xử lý hiệu ứng lật 3D (CSS) và sự kiện click */}
      <div
        className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)} // Bấm vào bất cứ đâu trên thẻ để lật
      >
        <div className="flashcard-inner">
          {/* Mặt trước của thẻ (Câu hỏi) */}
          <div className="flashcard-front">
            <p>{question}</p>
            {/* Gợi ý click chỉ hiện khi thẻ đang ở mặt trước */}
            {!isFlipped && (
              <span className="flashcard-hint">Click to reveal answer</span>
            )}
          </div>
          
          {/* Mặt sau của thẻ (Câu trả lời) */}
          <div className="flashcard-back">
            <p>{answer}</p>
          </div>
        </div>
      </div>
      
      {/* Thanh công cụ xác nhận đáp án (Answer Check)
          Chỉ hiển thị khi: showRating = true VÀ thẻ đã lật sang mặt sau (isFlipped = true) */}
      {showRating && isFlipped && (
        <div className="answer-check-bar">
          <AnswerCheck onAnswer={handleAnswerClick} />
        </div>
      )}
    </div>
  );
}

export default FlashCard;
