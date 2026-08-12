import { useState, useEffect } from 'react';
import { Navbar, Footer, ContactDropdown } from '@/components';
import { CreateDeck, EditDeck, StudySetsSelect, DeckSelect } from '@/features/decks';
import { HomeView } from '@/features/home';
import { HistoryView } from '@/features/history';
import { StudySession } from '@/features/study';
import { useFlashCards, useHistory, useDecks } from '@/hooks';
import '@/assets/styles/App.css';

/**
 * Component chính (App)
 * Đóng vai trò là container và router cấp cao nhất của ứng dụng.
 * Quản lý toàn bộ luồng điều hướng, trạng thái giao diện hiện tại và 
 * kết nối dữ liệu từ các custom hooks (useFlashcards, useHistory, useDecks)
 * xuống các component con.
 */
function App() {
  // Lấy các state và hàm xử lý liên quan đến phiên học flashcard từ custom hook useFlashcards
  const {
    currentIndex,
    showResult,
    isSessionComplete,
    selectedDeck,
    studyMode,
    cards,
    currentCard,
    correctCount,
    loadingCards,
    handleAnswer,
    handleDeckSelect,
    handleFinish,
    resetSession,
  } = useFlashCards();

  // Lấy các state và hàm xử lý liên quan đến lịch sử học tập từ custom hook useHistory
  const {
    history,
    loadingHistory,
    page,
    PAGE_SIZE,
    fetchHistory,
    saveResult,
    loadMore,
    showLess,
    resetPagination,
  } = useHistory();

  // Lấy danh sách bộ bài và số lượng tổng hợp từ custom hook useDecks
  const {
    allDecks,
    setAllDecks,
    fetchDecks,
    systemDeckCount,
    customDeckCount
  } = useDecks();

  // State quản lý việc điều hướng (view hiện tại đang hiển thị)
  const [currentView, setCurrentView] = useState('home');
  // State quản lý việc hiển thị modal tạo bộ bài mới
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  // State quản lý việc hiển thị modal chỉnh sửa bộ bài
  const [showEditDeck, setShowEditDeck] = useState(false);
  // State lưu trữ thông tin bộ bài đang được chọn để chỉnh sửa
  const [deckToEdit, setDeckToEdit] = useState(null);

  /**
   * Effect hook: Tự động tải lại lịch sử khi người dùng chuyển sang tab 'history'
   * Giúp dữ liệu lịch sử luôn được cập nhật mới nhất từ trang 0.
   */
  useEffect(() => {
    if (currentView === 'history') {
      resetPagination();
      fetchHistory(0);
    }
  }, [currentView, fetchHistory, resetPagination]);

  /**
   * Hàm xử lý khi người dùng click vào các mục trên thanh Navbar
   * @param {string} view - Tên màn hình cần chuyển đến
   */
  const handleNavClick = (view) => {
    resetSession(); // Reset lại toàn bộ tiến trình học dang dở
    setCurrentView(view); // Chuyển view
  };
  
  /**
   * Hàm xử lý khi người dùng chọn một bộ bài cụ thể để học
   * @param {object} deck - Thông tin bộ bài được chọn
   */
  const onDeckSelect = (deck) => {
    handleDeckSelect(deck); // Gọi hàm khởi tạo phiên học với bộ bài này
    setCurrentView('study'); // Chuyển sang màn hình học
  };
  
  /**
   * Hàm xử lý khi người dùng chọn chế độ trộn bài ngẫu nhiên (Study Sets)
   * Lọc ra các bộ bài hệ thống, trộn ngẫu nhiên và cắt số lượng tương ứng với độ khó.
   * @param {string} mode - Độ khó: 'easy' (2 bộ), 'normal' (4 bộ), 'hard' (6 bộ)
   */
  const onStudySetSelect = (mode) => {
    // Chỉ lấy các bộ bài mặc định của hệ thống (is_system = true)
    const defaultDecks = allDecks.filter(d => d.is_system);
    // Trộn ngẫu nhiên danh sách bằng thuật toán sort
    const shuffled = [...defaultDecks].sort(() => 0.5 - Math.random());
    
    let selectedDecks = [];
    if (mode === 'easy') selectedDecks = shuffled.slice(0, 2);
    if (mode === 'normal') selectedDecks = shuffled.slice(0, 4);
    if (mode === 'hard') selectedDecks = shuffled.slice(0, 6);
    
    // Khởi tạo phiên học với danh sách các bộ bài đã trộn
    handleDeckSelect(selectedDecks, mode);
    setCurrentView('study');
  };
  
  /**
   * Hàm xử lý khi người dùng hoàn thành một phiên học
   * Tính toán tổng số thẻ đã học và lưu kết quả vào CSDL
   */
  const onFinishSession = () => {
    // Lưu kết quả phiên học
    saveResult(selectedDeck?.title || 'Unknown', correctCount, cards.length, studyMode);
    // Đánh dấu kết thúc phiên
    handleFinish();
  };

  /**
   * Hàm reset phiên học hiện tại và quay về màn hình chọn bộ bài
   */
  const onReset = () => {
    resetSession();
    setCurrentView('deckSelect');
  };
  
  /**
   * Hàm thoát khỏi phiên học giữa chừng và quay về trang chủ
   */
  const onQuit = () => {
    resetSession();
    setCurrentView('home');
  };
  
  /**
   * Hàm callback được gọi sau khi tạo mới bộ bài thành công
   * Cập nhật lại danh sách bộ bài và chuyển về màn hình chọn bài
   */
  const handleDeckCreated = () => {
    fetchDecks(); // Tải lại danh sách từ Supabase
    setCurrentView('deckSelect');
  };

  return (
    <div className="page-wrapper">
      {/* Thanh điều hướng chính */}
      <Navbar onNavClick={handleNavClick} currentView={currentView} />
      
      <main className="app-container">
        {/* Render màn hình Home */}
        {currentView === 'home' && (
          <HomeView 
            systemDeckCount={systemDeckCount}
            customDeckCount={customDeckCount}
            onNavigate={setCurrentView}
            onShowCreateDeck={() => setShowCreateDeck(true)}
          />
        )}
        
        {/* Render màn hình Lịch sử học */}
        {currentView === 'history' && (
          <HistoryView 
            history={history}
            loadingHistory={loadingHistory}
            page={page}
            PAGE_SIZE={PAGE_SIZE}
            allDecks={allDecks}
            loadMore={loadMore}
            showLess={showLess}
            onBack={() => setCurrentView('home')}
          />
        )}
        
        {/* Render màn hình Chọn bộ bài cụ thể */}
        {currentView === 'deckSelect' && (
          <div className="view-centered view-full-height">
            <div className="study-header">
              <h2 className="study-title">Select a Deck</h2>
              <p className="study-subtitle">Pick a topic to practice</p>
            </div>
            <DeckSelect 
              decks={allDecks} 
              onSelect={onDeckSelect} 
              onCreateDeck={() => setShowCreateDeck(true)}
              onEditDeck={(deck) => { setDeckToEdit(deck); setShowEditDeck(true); }}
            />
            <button className="quit-button" onClick={() => setCurrentView('home')}>← Back</button>
          </div>
        )}
        
        {/* Render màn hình Chọn chế độ trộn bài */}
        {currentView === 'studySets' && (
          <div className="view-centered view-full-height">
            <StudySetsSelect onSelectMode={onStudySetSelect} />
            <button className="quit-button" onClick={() => setCurrentView('home')}>← Back</button>
          </div>
        )}
        
        {/* Render màn hình Phiên học Flashcard */}
        {currentView === 'study' && (
          <StudySession 
            loadingCards={loadingCards}
            showResult={showResult}
            selectedDeck={selectedDeck}
            currentIndex={currentIndex}
            cards={cards}
            currentCard={currentCard}
            handleAnswer={handleAnswer}
            isSessionComplete={isSessionComplete}
            onFinishSession={onFinishSession}
            onQuit={onQuit}
            correctCount={correctCount}
            studyMode={studyMode}
            onReset={onReset}
            onViewHistory={() => setCurrentView('history')}
          />
        )}
      </main>
      
      {/* Modal tạo bộ bài mới */}
      <CreateDeck
        isOpen={showCreateDeck}
        onClose={() => setShowCreateDeck(false)}
        onDeckCreated={handleDeckCreated}
      />
      {/* Modal chỉnh sửa bộ bài */}
      <EditDeck
        isOpen={showEditDeck}
        deck={deckToEdit}
        onClose={() => setShowEditDeck(false)}
        onDeckUpdated={(updatedDeck) => {
          // Cập nhật lại state danh sách bộ bài sau khi sửa thành công
          setAllDecks((prev) => prev.map(d => d.id === updatedDeck.id ? updatedDeck : d));
        }}
      />
      
      {/* Nút dropdown liên hệ */}
      <ContactDropdown />
      {/* Chân trang */}
      <Footer />
    </div>
  );
}

export default App;