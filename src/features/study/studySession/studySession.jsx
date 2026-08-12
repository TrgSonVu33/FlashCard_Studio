import { FlashCard, ResultScreen } from '../';

/**
 * Component: StudySession
 * Chịu trách nhiệm hiển thị giao diện chính của một phiên học Flashcard.
 * Component này nhận vào toàn bộ state và các hàm xử lý từ hook `useFlashcards` 
 * (thông qua App.jsx) và điều hướng luồng hiển thị: Đang tải -> Phiên học -> Kết quả.
 * 
 * @param {Object} props - Các state và hàm điều khiển phiên học
 */
export const StudySession = ({
  loadingCards,       // (boolean) Trạng thái đang tải dữ liệu thẻ từ CSDL
  showResult,         // (boolean) Cờ hiệu cho biết đã đến lúc hiển thị màn hình kết quả chưa
  selectedDeck,       // (object) Thông tin bộ bài đang được học
  currentIndex,       // (number) Vị trí hiện tại của thẻ
  cards,              // (array) Danh sách toàn bộ thẻ
  currentCard,        // (object) Thẻ flashcard hiện tại đang được hiển thị
  handleAnswer,       // (function) Hàm xử lý khi người dùng chọn Yes/No
  isSessionComplete,  // (boolean) Cờ hiệu cho biết người dùng đã học hết danh sách thẻ chưa
  onFinishSession,    // (function) Hàm xử lý để kết thúc phiên và lưu điểm số
  onQuit,             // (function) Hàm xử lý khi người dùng muốn thoát ngang
  correctCount,       // (number) Tổng số lượng thẻ đã trả lời đúng (isCorrect = true)
  studyMode,          // (string) Chế độ học hiện tại (standard, easy, normal, hard)
  onReset,            // (function) Hàm xử lý để làm lại từ đầu
  onViewHistory       // (function) Hàm xử lý điều hướng sang trang lịch sử học tập
}) => {
  // 1. TRẠNG THÁI ĐANG TẢI (LOADING STATE)
  if (loadingCards) {
    return (
      <div className="study-header">
        <h2 className="study-title">Loading cards...</h2>
      </div>
    );
  }

  // 2. MÀN HÌNH KẾT QUẢ (RESULT SCREEN)
  if (showResult) {
    return (
      <ResultScreen
        correctCount={correctCount}
        total={cards.length}
        mode={studyMode}
        onReset={onReset}
        onViewHistory={onViewHistory}
      />
    );
  }

  // 3. MÀN HÌNH PHIÊN HỌC CHÍNH (MAIN STUDY INTERFACE)
  return (
    <>
      <div className="study-header">
        <h2 className="study-title">{selectedDeck?.title}</h2>
        <p className="study-subtitle">Flip the card, then answer if you got it right</p>
      </div>
      
      {/* Thanh tiến trình (Progress indicator) */}
      <div className="progress">
        Card {currentIndex + 1} of {cards.length}
      </div>
      
      {/* Khu vực hiển thị thẻ (Flashcard Area) */}
      <div className="flashcards">
        {currentCard && (
          <FlashCard
            // Dùng key kết hợp giữa deck id và card id để ép React render lại hoàn toàn một component mới khi thẻ thay đổi
            key={`${selectedDeck?.id}-${currentCard.id}`}
            question={
              <>
                <span>Question {currentIndex + 1} </span>
                <br />
                {currentCard.front}
              </>
            }
            answer={currentCard.back}
            showRating={true} // Bật tính năng AnswerCheck
            onAnswer={handleAnswer} // Truyền callback xử lý đúng/sai
          />
        )}
      </div>
      
      {/* Nút Hoàn thành (Finish Session) 
          Chỉ hiện ra khi đã học qua toàn bộ danh sách thẻ (isSessionComplete = true) */}
      {isSessionComplete && (
        <div className="button-group">
          <button
            className="finish-session-btn"
            onClick={onFinishSession}
          >
            Finish Session
          </button>
        </div>
      )}
      
      {/* Nút Hủy / Thoát (Quit) */}
      <button className="quit-button" onClick={onQuit}>✕ Quit</button>
    </>
  );
};
