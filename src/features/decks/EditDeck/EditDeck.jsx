/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { supabase } from '@/services/supabase';
import '../CreateDeck/CreateDeck.css'; // Tái sử dụng chung CSS với component CreateDeck

/**
 * Component: EditDeck
 * Modal (Hộp thoại) cho phép người dùng chỉnh sửa thông tin của một bộ bài (deck) ĐÃ CÓ.
 * Tính năng:
 * - Tải dữ liệu bộ bài và danh sách thẻ (flashcards) từ CSDL.
 * - Cho phép sửa tên, mô tả, biểu tượng (icon).
 * - Sửa, thêm mới, hoặc xóa các thẻ trong bộ bài.
 * - Lưu đồng bộ mọi thay đổi lên Supabase.
 * 
 * @param {boolean} isOpen - Cờ hiệu kiểm soát việc hiển thị modal
 * @param {function} onClose - Hàm callback được gọi khi đóng modal
 * @param {function} onDeckUpdated - Hàm callback được gọi sau khi lưu thành công dữ liệu mới lên server
 * @param {Object} deck - Object chứa thông tin bộ bài hiện tại cần chỉnh sửa (từ thẻ được click)
 */
export default function EditDeck({ isOpen, onClose, onDeckUpdated, deck }) {
  // === 1. STATES QUẢN LÝ THÔNG TIN BỘ BÀI ===
  const [deckName, setDeckName] = useState('');                 // Tên bộ bài
  const [description, setDescription] = useState('');           // Mô tả bộ bài
  const [selectedIcon, setSelectedIcon] = useState('📁');       // Biểu tượng hiện tại
  const [showPicker, setShowPicker] = useState(false);          // Cờ hiệu bật/tắt bảng chọn Emoji
  
  // State quản lý danh sách các thẻ. Mỗi thẻ lấy từ CSDL sẽ có thêm thuộc tính `id`.
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  
  // State đặc biệt: Lưu danh sách ID của các thẻ bị người dùng xóa khỏi giao diện.
  // Các thẻ này sẽ được gọi API để xóa thật sự trên CSDL khi người dùng bấm "Save".
  const [cardsToDelete, setCardsToDelete] = useState([]);
  
  // === 2. STATES QUẢN LÝ TRẠNG THÁI GIAO DIỆN ===
  const [saving, setSaving] = useState(false);                  // Trạng thái đang lưu dữ liệu (hiển thị loading trên nút)
  const [loading, setLoading] = useState(false);                // Trạng thái đang tải dữ liệu thẻ từ CSDL
  const [error, setError] = useState('');                       // Thông báo lỗi nếu có
  
  /**
   * Hàm gọi API Supabase để tải danh sách các thẻ thuộc về bộ bài đang sửa.
   */
  const fetchCards = async () => {
    if (!deck) return;
    setLoading(true); // Bật trạng thái Loading
    
    try {
      // Truy vấn bảng 'cards' lấy các thẻ có deck_id khớp với id của bộ bài hiện tại
      const { data, error } = await supabase
        .from('cards')
        .select('id, front, back')
        .eq('deck_id', deck.id)
        .order('id', { ascending: true }); // Sắp xếp theo thứ tự tạo
        
      if (error) throw error;
      
      // Nếu có dữ liệu, gán vào state cards
      if (data && data.length > 0) {
        setCards(data);
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load cards.');
    } finally {
      setLoading(false); // Tắt trạng thái Loading
    }
  };

  /**
   * Effect hook: Lấy dữ liệu bộ bài và các thẻ từ cơ sở dữ liệu
   * Được kích hoạt mỗi khi modal mở ra (isOpen = true) và có truyền vào một bộ bài cụ thể (deck).
   */
  useEffect(() => {
    if (isOpen && deck) {
      // 1. Điền thông tin cơ bản của bộ bài vào form
      setDeckName(deck.title || '');
      setDescription(deck.description || '');
      setSelectedIcon(deck.icon || '📁');
      
      // 2. Reset lại các trạng thái phụ
      setCards([{ front: '', back: '' }]); 
      setCardsToDelete([]);
      setError('');
      
      // 3. Tải danh sách các thẻ (Flashcards) thuộc về bộ bài này
      fetchCards();
    }
  }, [isOpen, deck]);

  // Nếu isOpen = false, ẩn hoàn toàn component
  if (!isOpen) return null;
  
  // === 3. CÁC HÀM XỬ LÝ SỰ KIỆN TƯƠNG TÁC (Event Handlers) ===

  /**
   * Hàm thêm một thẻ trắng mới vào danh sách.
   * Thẻ mới được tạo ra trên giao diện chưa có thuộc tính `id`.
   */
  const addCard = () => {
    setCards(prev => [...prev, { front: '', back: '' }]);
  };
  
  /**
   * Hàm xóa một thẻ khỏi giao diện.
   * 
   * @param {number} index - Vị trí thẻ muốn xóa
   */
  const removeCard = (index) => {
    if (cards.length <= 1) return; // Không cho phép xóa nếu chỉ còn 1 thẻ
    
    const cardToRemove = cards[index];
    
    // NẾU THẺ ĐÃ CÓ ID (Thẻ cũ tải từ CSDL về):
    // Đưa ID của nó vào mảng cardsToDelete để tí nữa gọi API DELETE.
    if (cardToRemove.id) {
      setCardsToDelete(prev => [...prev, cardToRemove.id]);
    }
    
    // NẾU LÀ THẺ MỚI THÊM (Chưa có ID): 
    // Chỉ cần lọc bỏ khỏi mảng state cards (không cần gọi API xóa).
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Hàm cập nhật nội dung mặt trước hoặc sau của thẻ.
   */
  const updateCard = (index, field, value) => {
    setCards(prev => prev.map((card, i) =>
      i === index ? { ...card, [field]: value } : card
    ));
  };
  
  /**
   * Hàm xử lý chính khi người dùng nhấn nút "Save Changes".
   * Gồm 3 phần: Cập nhật thông tin bộ bài, Xóa thẻ, và Cập nhật/Thêm mới thẻ.
   */
  const handleSave = async () => {
    // Validate 1: Tên bộ bài không được để trống
    if (!deckName.trim()) {
      setError('Please enter a deck name.');
      return;
    }
    
    // Lọc ra các thẻ hợp lệ (có cả câu hỏi và câu trả lời)
    const validCards = cards.filter(c => c.front.trim() && c.back.trim());
    
    // Validate 2: Phải có ít nhất 1 thẻ hợp lệ
    if (validCards.length === 0) {
      setError('Please add at least one card with both front and back content.');
      return;
    }
    
    setError(''); // Xóa lỗi cũ
    setSaving(true); // Bật trạng thái Loading khi đang lưu
    
    try {
      // === BƯỚC 1: CẬP NHẬT THÔNG TIN CƠ BẢN CỦA BỘ BÀI ===
      const deckPayload = {
        title: deckName.trim(),
        description: description.trim() || null,
        icon: selectedIcon,
      };
      
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .update(deckPayload)
        .eq('id', deck.id)
        .select()
        .single();
        
      // Fallback: Tương thích ngược với CSDL cũ chưa có cột 'icon'
      if (deckError && (deckError.code === '42703' || deckError.code === 'PGRST204' || deckError.message?.includes('icon'))) {
        console.warn('Icon column not found, falling back to legacy update.');
        const fallbackPayload = { ...deckPayload };
        delete fallbackPayload.icon;
        const fallbackRes = await supabase.from('decks').update(fallbackPayload).eq('id', deck.id).select().single();
        if (fallbackRes.error) throw fallbackRes.error;
      } else if (deckError) {
        throw deckError;
      }
      
      // === BƯỚC 2: XÓA CÁC THẺ TRÊN DATABASE ===
      // Nếu có thẻ nào bị người dùng ấn nút ✕, ta gọi hàm delete với toán tử IN
      if (cardsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('cards')
          .delete()
          .in('id', cardsToDelete);
        if (deleteError) throw deleteError;
      }
      
      // === BƯỚC 3: XỬ LÝ CÁC THẺ CÒN LẠI ===
      // Chuẩn bị payload chuẩn xác cho các thẻ hợp lệ
      const cardsToUpsert = validCards.map(c => ({
        id: c.id,          // (Có thể có hoặc không tuỳ vào thẻ cũ hay mới)
        deck_id: deck.id,
        front: c.front.trim(),
        back: c.back.trim(),
      }));
      
      // Phân tách thành 2 mảng:
      // - cardsToUpdate: Những thẻ ĐÃ CÓ id (Sử dụng lệnh upsert/update)
      // - cardsToInsert: Những thẻ CHƯA CÓ id (Người dùng vừa ấn "+ Add Card") (Sử dụng lệnh insert)
      const cardsToUpdate = cardsToUpsert.filter(c => c.id);
      const cardsToInsert = cardsToUpsert.filter(c => !c.id);
      
      // Chạy lệnh cập nhật (Upsert) cho thẻ cũ
      if (cardsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('cards')
          .upsert(cardsToUpdate);
        if (updateError) throw updateError;
      }
      
      // Chạy lệnh chèn thêm (Insert) cho thẻ mới
      if (cardsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('cards')
          .insert(cardsToInsert);
        if (insertError) throw insertError;
      }
      
      // === BƯỚC 4: HOÀN TẤT ===
      // Trả dữ liệu bộ bài mới về component cha và đóng modal
      onDeckUpdated?.(deckData || { ...deck, ...deckPayload });
      onClose();
      
    } catch (err) {
      console.error('Error updating deck:', err);
      setError(err.message || 'Failed to update deck. Please try again.');
    } finally {
      setSaving(false); // Tắt trạng thái Loading
    }
  };

  /**
   * Hàm đóng modal khi người dùng click vào phần nền tối bên ngoài.
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // === 4. RENDER GIAO DIỆN ===
  return (
    <div className="create-deck-overlay" onClick={handleOverlayClick}>
      {/* Khung modal chính */}
      <div className="create-deck-modal" role="dialog" aria-labelledby="edit-deck-title">
        
        {/* Header Modal */}
        <div className="create-deck-header">
          <h2 id="edit-deck-title" className="create-deck-title">Edit Deck</h2>
          <button className="create-deck-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        
        {/* Body Modal */}
        <div className="create-deck-body">
          {error && (
            <div className="create-deck-error" role="alert">{error}</div>
          )}
          
          {/* Màn hình chờ khi đang gọi API để lấy thẻ (fetchCards) */}
          {loading ? (
             <div className="create-deck-field" style={{ textAlign: 'center', padding: '20px' }}>
                Loading deck data...
             </div>
          ) : (
            // Form chỉnh sửa (Chỉ hiện khi đã tải dữ liệu xong)
            <>
              {/* Chọn Biểu tượng */}
              <div className="create-deck-field">
                <label className="create-deck-label">Deck Icon</label>
                <div className="create-deck-icon-picker-container">
                  <button
                    className="create-deck-icon-trigger"
                    onClick={() => setShowPicker(!showPicker)}
                    title="Choose an icon"
                  >
                    {selectedIcon}
                  </button>
                  {showPicker && (
                    <div className="create-deck-emoji-popover">
                      <div className="create-deck-emoji-overlay" onClick={() => setShowPicker(false)} />
                      <div className="create-deck-picker-wrapper">
                        <Picker 
                          data={data} 
                          native={true}
                          onEmojiSelect={(emoji) => {
                            setSelectedIcon(emoji.native);
                            setShowPicker(false);
                          }} 
                          theme="light"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Nhập Tên bộ bài */}
              <div className="create-deck-field">
                <label htmlFor="deck-name" className="create-deck-label">Deck Name</label>
                <input
                  id="deck-name"
                  type="text"
                  className="create-deck-input"
                  placeholder="e.g. Japanese Vocabulary"
                  value={deckName}
                  onChange={e => setDeckName(e.target.value)}
                  autoFocus
                />
              </div>
              
              {/* Nhập Mô tả */}
              <div className="create-deck-field">
                <label htmlFor="deck-desc" className="create-deck-label">
                  Description <span className="create-deck-optional">(optional)</span>
                </label>
                <textarea
                  id="deck-desc"
                  className="create-deck-textarea"
                  placeholder="What is this deck about?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              
              {/* Đường ngăn cách (Divider) */}
              <div className="create-deck-divider">
                <span>Cards ({cards.length})</span>
              </div>
              
              {/* Danh sách Thẻ */}
              <div className="create-deck-cards">
                {cards.map((card, index) => (
                  <div key={index} className="create-deck-card-row">
                    <div className="create-deck-card-number">{index + 1}</div>
                    <div className="create-deck-card-fields">
                      <input
                        type="text"
                        className="create-deck-input"
                        placeholder="Front (Question)"
                        value={card.front}
                        onChange={e => updateCard(index, 'front', e.target.value)}
                      />
                      <input
                        type="text"
                        className="create-deck-input"
                        placeholder="Back (Answer)"
                        value={card.back}
                        onChange={e => updateCard(index, 'back', e.target.value)}
                      />
                    </div>
                    <button
                      className="create-deck-remove-card"
                      onClick={() => removeCard(index)}
                      disabled={cards.length <= 1} // Không cho phép xóa nếu chỉ còn 1 thẻ
                      aria-label={`Remove card ${index + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Nút thêm thẻ mới */}
              <button className="create-deck-add-card" onClick={addCard}>
                + Add Card
              </button>
            </>
          )}
        </div>
        
        {/* Footer chứa các nút hành động */}
        <div className="create-deck-footer">
          <button
            className="create-deck-btn create-deck-btn--cancel"
            onClick={onClose}
            disabled={saving || loading}
          >
            Cancel
          </button>
          <button
            className="create-deck-btn create-deck-btn--save"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
