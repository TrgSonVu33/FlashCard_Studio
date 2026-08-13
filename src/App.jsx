import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/navbar/navbar';
import Footer from '@/components/layout/footer/footer';
import ContactDropdown from '@/components/shared/contactDropdown/contactDropdown';
import ProtectedRoute from '@/components/shared/protectedRoute/ProtectedRoute';
import Login from '@/features/auth/login/Login';
import SignUp from '@/features/auth/signup/SignUp';
import ForgotPassword from '@/features/auth/forgotPassword/ForgotPassword';
import ResetPassword from '@/features/auth/resetPassword/ResetPassword';
import AuthFloatingActions from '@/features/auth/authFloatingActions/AuthFloatingActions';
import CreateDeck from '@/features/decks/createDeck/createDeck';
import EditDeck from '@/features/decks/editDeck/editDeck';
import StudySetsSelect from '@/features/decks/studySetsSelect/studySetsSelect';
import DeckSelect from '@/features/decks/deckSelect/deckSelect';
import { HomeView } from '@/features/home/homeView/homeView';
import { HistoryView } from '@/features/history/historyView/historyView';
import { StudySession } from '@/features/study/studySession/studySession';
import { useFlashCards } from '@/hooks/useFlashCards';
import { useHistory } from '@/hooks/useHistory';
import { useDecks } from '@/hooks/useDecks';
import '@/assets/styles/App.css';

/**
 * Component chính (App)
 * Đóng vai trò là container và router cấp cao nhất của ứng dụng.
 * Quản lý toàn bộ luồng điều hướng, trạng thái giao diện hiện tại và 
 * kết nối dữ liệu từ các custom hooks (useFlashcards, useHistory, useDecks)
 * xuống các component con.
 * 
 * Phiên bản SaaS: Tích hợp xác thực (authentication) với Supabase Auth.
 * Người dùng chưa đăng nhập sẽ được chuyển hướng đến trang Login.
 */
function App() {
  // === AUTH: Lấy thông tin xác thực từ AuthProvider ===
  const { user, loading: authLoading, isRecovery, clearRecovery } = useAuth();

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

  // State quản lý việc điều hướng (view hiện tại đang hiển thị) dưới dạng Stack
  const [viewStack, setViewStack] = useState(['home']);
  const currentView = viewStack[viewStack.length - 1];

  // State quản lý tab (system/custom) hiện tại đang được chọn ở màn hình DeckSelect
  const [deckTab, setDeckTab] = useState('system');

  /**
   * Effect: Khi sự kiện PASSWORD_RECOVERY xảy ra (người dùng click link reset từ email),
   * tự động chuyển sang trang đặt lại mật khẩu.
   */
  useEffect(() => {
    if (isRecovery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewStack(['resetPassword']);
    }
  }, [isRecovery]);

  /**
   * Effect: Khi user thay đổi (đăng nhập/đăng xuất), 
   * tự động chuyển hướng phù hợp.
   */
  useEffect(() => {
    if (!authLoading && !user) {
      // Nếu chưa đăng nhập và không đang ở trang auth → chuyển về login
      const authViews = ['login', 'signup', 'forgotPassword', 'resetPassword'];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewStack(prev => {
        const current = prev[prev.length - 1];
        if (!authViews.includes(current)) {
          return ['login'];
        }
        return prev;
      });
    } else if (!authLoading && user && !isRecovery) {
      // Nếu đã đăng nhập và đang ở trang auth → chuyển về home
      const authViews = ['login', 'signup', 'forgotPassword'];
      setViewStack(prev => {
        const current = prev[prev.length - 1];
        if (authViews.includes(current)) {
          return ['home'];
        }
        return prev;
      });
    }
  }, [user, authLoading, isRecovery]);

  /**
   * Hàm điều hướng tiến (push view mới vào stack)
   */
  const navigateTo = (view) => {
    setViewStack(prev => [...prev, view]);
  };

  /**
   * Hàm quay lại trang trước đó (pop view khỏi stack)
   */
  const goBack = () => {
    setViewStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };
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
    setViewStack([view]); // Chuyển view cấp cao nhất, reset stack
  };
  
  /**
   * Hàm xử lý khi người dùng chọn một bộ bài cụ thể để học
   * @param {object} deck - Thông tin bộ bài được chọn
   */
  const onDeckSelect = (deck) => {
    handleDeckSelect(deck); // Gọi hàm khởi tạo phiên học với bộ bài này
    navigateTo('study'); // Chuyển sang màn hình học
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
    navigateTo('study');
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
    navigateTo('deckSelect');
  };
  
  /**
   * Hàm thoát khỏi phiên học giữa chừng và quay về trang chủ
   */
  const onQuit = () => {
    resetSession();
    goBack();
  };
  
  /**
   * Hàm callback được gọi sau khi tạo mới bộ bài thành công
   * Cập nhật lại danh sách bộ bài và chuyển về màn hình chọn bài
   */
  const handleDeckCreated = () => {
    fetchDecks(); // Tải lại danh sách từ Supabase
    navigateTo('deckSelect');
  };

  /**
   * Callback cho ProtectedRoute: Chuyển hướng sang trang đăng nhập
   */
  const redirectToLogin = useCallback(() => {
    setViewStack(['login']);
  }, []);

  /**
   * Callback khi người dùng đặt lại mật khẩu thành công
   */
  const handleResetPasswordComplete = useCallback(() => {
    clearRecovery();
    setViewStack(['home']);
  }, [clearRecovery]);

  // Hiển thị spinner khi đang tải thông tin xác thực ban đầu
  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner"></div>
      </div>
    );
  }

  // === RENDER CÁC TRANG XÁC THỰC (không cần đăng nhập) ===

  // Trang đặt lại mật khẩu (từ link email)
  if (currentView === 'resetPassword') {
    return (
      <>
        <ResetPassword onComplete={handleResetPasswordComplete} />
        <AuthFloatingActions />
      </>
    );
  }

  // Trang đăng nhập
  if (currentView === 'login') {
    return (
      <>
        <Login onNavigate={(view) => setViewStack([view])} />
        <AuthFloatingActions />
      </>
    );
  }

  // Trang đăng ký
  if (currentView === 'signup') {
    return (
      <>
        <SignUp onNavigate={(view) => setViewStack([view])} />
        <AuthFloatingActions />
      </>
    );
  }

  // Trang quên mật khẩu
  if (currentView === 'forgotPassword') {
    return (
      <>
        <ForgotPassword onNavigate={(view) => setViewStack([view])} />
        <AuthFloatingActions />
      </>
    );
  }

  // === RENDER ỨNG DỤNG CHÍNH (cần đăng nhập) ===
  return (
    <ProtectedRoute onRedirectToLogin={redirectToLogin}>
      <div className="page-wrapper">
        {/* Thanh điều hướng chính */}
        <Navbar onNavClick={handleNavClick} currentView={currentView} />
        
        <main className="app-container">
          {/* Render màn hình Home */}
          {currentView === 'home' && (
            <HomeView 
              systemDeckCount={systemDeckCount}
              customDeckCount={customDeckCount}
              onNavigate={navigateTo}
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
              onBack={goBack}
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
                activeTab={deckTab}
                onTabChange={setDeckTab}
              />
              <button className="quit-button" onClick={goBack}>← Back</button>
            </div>
          )}
          
          {/* Render màn hình Chọn chế độ trộn bài */}
          {currentView === 'studySets' && (
            <div className="view-centered view-full-height">
              <StudySetsSelect onSelectMode={onStudySetSelect} />
              <button className="quit-button" onClick={goBack}>← Back</button>
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
              onViewHistory={() => setViewStack(['history'])}
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
    </ProtectedRoute>
  );
}

export default App;