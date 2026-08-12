import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';

/**
 * Custom hook: useFlashCards
 * Đóng vai trò là trung tâm (brain) xử lý toàn bộ logic liên quan đến một phiên học flashcard.
 * Phiên bản đã đơn giản hóa: Không còn lịch trình ôn tập (SRS), 
 * chỉ lặp qua toàn bộ danh sách thẻ.
 */
export const useFlashCards = () => {
  // === 1. STATE ĐIỀU HƯỚNG VÀ HIỂN THỊ (UI & Navigation State) ===
  
  // Vị trí (index) của thẻ hiện tại trong mảng cards
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Lưu trữ kết quả đúng/sai (true/false) của người dùng cho từng thẻ. 
  // Key là index của thẻ, Value là boolean.
  const [answers, setAnswers] = useState({});        
  
  // Cờ hiệu kiểm soát việc hiển thị màn hình kết quả cuối cùng
  const [showResult, setShowResult] = useState(false);
  
  // Cờ hiệu kiểm soát việc hiển thị màn hình bắt đầu (nếu có)
  const [showBegin, setShowBegin] = useState(false);
  
  // Xác định xem người dùng đã hoàn thành tất cả các thẻ hay chưa
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  
  // Lưu trữ thông tin về bộ bài (deck) đang được người dùng chọn để học
  const [selectedDeck, setSelectedDeck] = useState(null);
  
  // Chế độ học ('standard' cho bộ bài đơn, 'easy'/'normal'/'hard' cho chế độ trộn bài)
  const [studyMode, setStudyMode] = useState('standard');
  
  // === 2. STATE DỮ LIỆU THẺ (Data State) ===
  
  // Danh sách toàn bộ các thẻ thuộc về (các) bộ bài đã chọn
  const [cards, setCards] = useState([]);             
  
  // Trạng thái đang tải dữ liệu thẻ từ cơ sở dữ liệu
  const [loadingCards, setLoadingCards] = useState(false);
  
  // === 3. CÁC BIẾN TÍNH TOÁN (Computed Values) ===
  
  // Lấy ra object của thẻ hiện tại đang được hiển thị trên giao diện.
  const currentCard = cards[currentIndex];
  
  // Đếm số lượng thẻ được trả lời đúng để tính điểm số
  const correctCount = Object.values(answers).filter(Boolean).length;
  
  // === 4. CÁC HÀM XỬ LÝ CHÍNH (Core Functions) ===

  /**
   * Hàm: fetchStudyCards
   * Lấy dữ liệu thẻ từ CSDL dựa trên danh sách deckId, 
   * xáo trộn (shuffle) nếu là chế độ mixed.
   * 
   * @param {string|string[]} deckIds - ID của một hoặc nhiều bộ bài
   */
  const fetchStudyCards = useCallback(async (deckIds) => {
    setLoadingCards(true);
    // Đảm bảo đầu vào luôn là một mảng để dễ truy vấn IN trong SQL
    const idsToFetch = Array.isArray(deckIds) ? deckIds : [deckIds];
    
    // Bước 1: Lấy toàn bộ thẻ thuộc về các bộ bài đã chọn
    const { data: fetchedCards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .in('deck_id', idsToFetch);
      
    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      setLoadingCards(false);
      return;
    }
    
    const deckCards = fetchedCards || [];
    
    // Nếu chế độ nhiều bộ bài thì nên xáo trộn thứ tự
    if (Array.isArray(deckIds) && deckIds.length > 1) {
      deckCards.sort(() => Math.random() - 0.5);
    }
    
    // Giới hạn số lượng thẻ trong một phiên học (VD: 20 thẻ) để người dùng không bị mỏi
    const limitedCards = deckCards.slice(0, 20);
    
    setCards(limitedCards);
    setCurrentIndex(0);
    setLoadingCards(false);
  }, []);

  /**
   * Hàm: handleAnswer
   * Xử lý khi người dùng ấn nút Yes hoặc No.
   * Cập nhật điểm và chuyển sang thẻ tiếp theo.
   * 
   * @param {boolean} isCorrect - Trạng thái đúng/sai
   */
  const handleAnswer = useCallback((isCorrect) => {
    if (!selectedDeck || !currentCard) return;
    
    // Cập nhật kết quả vào state nội bộ để thống kê ở màn hình kết quả
    setAnswers(prev => ({ ...prev, [currentIndex]: isCorrect }));
    
    // Chuyển sang thẻ tiếp theo
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsSessionComplete(true); // Hết thẻ -> Kết thúc phiên học
    }
  }, [selectedDeck, currentCard, cards.length, currentIndex]);

  /**
   * Hàm: handleDeckSelect
   * Khởi tạo một phiên học mới dựa trên bộ bài được chọn.
   * Hỗ trợ chọn 1 bộ bài ('standard') hoặc trộn nhiều bộ bài ('mixed').
   * 
   * @param {Object|Array} deckInput - Một object bộ bài hoặc mảng các bộ bài
   * @param {string} mode - Chế độ học ('standard', 'easy', 'normal', 'hard')
   */
  const handleDeckSelect = useCallback((deckInput, mode = 'standard') => {
    // Kiểm tra xem đầu vào là mảng (chế độ trộn bài) hay một object đơn
    const isMixedMode = Array.isArray(deckInput);
    
    // Tạo đối tượng bộ bài ảo (activeDeck) đại diện cho phiên học
    const activeDeck = isMixedMode 
      ? { id: 'mixed', title: `Mixed Study Set (${deckInput.length} Decks)` }
      : deckInput;
      
    // Đặt lại các trạng thái về trạng thái ban đầu để chuẩn bị phiên học
    setSelectedDeck(activeDeck);
    setStudyMode(mode);
    setAnswers({});
    setCurrentIndex(0);
    setIsSessionComplete(false);
    
    // Lấy ID của các bộ bài để truyền vào hàm fetch
    const deckIds = isMixedMode ? deckInput.map(d => d.id) : deckInput.id;
    fetchStudyCards(deckIds);
  }, [fetchStudyCards]);

  /**
   * Hàm: handleFinish
   * Được gọi khi người dùng muốn hoàn thành phiên học và xem màn hình kết quả.
   */
  const handleFinish = useCallback(() => {
    setShowResult(true);
  }, []);

  /**
   * Hàm: resetSession
   * Xóa sạch (Clear) toàn bộ các trạng thái phiên học hiện tại 
   * khi người dùng thoát ra ngoài hoặc hủy học.
   */
  const resetSession = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
    setIsSessionComplete(false);
    setSelectedDeck(null);
    setCards([]);
  }, []);

  /**
   * Hàm: beginSession (Tuỳ chọn hiển thị màn hình Start)
   */
  const beginSession = useCallback(() => {
    setShowBegin(true);
  }, []);

  /**
   * Hàm: goBack (Hủy bỏ việc bắt đầu phiên học)
   */
  const goBack = useCallback(() => {
    setShowBegin(false);
  }, []);

  // Trả về toàn bộ các state và hàm xử lý để Component giao diện có thể sử dụng
  return {
    currentIndex,
    answers,
    showResult,
    isSessionComplete,
    showBegin,
    selectedDeck,
    studyMode,
    cards,
    currentCard,
    correctCount,
    loadingCards,
    handleAnswer, // Truyền xuống thay vì handleSrsRating
    handleDeckSelect,
    handleFinish,
    resetSession,
    beginSession,
    goBack,
  };
}
