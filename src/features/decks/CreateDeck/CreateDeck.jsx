import { useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { supabase } from '@/services/supabase';
import './createDeck.css';

/**
 * Component: CreateDeck
 * Modal (Hộp thoại) cho phép người dùng tạo một bộ bài (deck) mới.
 * Hỗ trợ chọn biểu tượng (emoji) cho bộ bài, nhập tên, mô tả và thêm danh sách các thẻ (flashcards) ban đầu.
 * 
 * @param {boolean} isOpen - Cờ hiệu kiểm soát việc hiển thị modal
 * @param {function} onClose - Hàm callback được gọi khi đóng modal
 * @param {function} onDeckCreated - Hàm callback được gọi sau khi bộ bài được tạo thành công trên CSDL
 */
export default function CreateDeck({ isOpen, onClose, onDeckCreated }) {
  // === 1. STATES QUẢN LÝ THÔNG TIN BỘ BÀI ===
  const [deckName, setDeckName] = useState('');                 // Tên bộ bài
  const [description, setDescription] = useState('');           // Mô tả ngắn gọn về bộ bài
  const [selectedIcon, setSelectedIcon] = useState('📁');       // Biểu tượng của bộ bài (mặc định là thư mục)
  const [showPicker, setShowPicker] = useState(false);          // Cờ hiệu bật/tắt bảng chọn Emoji
  
  // State quản lý danh sách các thẻ. Khởi tạo mặc định với 1 thẻ trống.
  // Mỗi phần tử là một object có dạng: { front: 'câu hỏi', back: 'câu trả lời' }
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  
  // === 2. STATES QUẢN LÝ TRẠNG THÁI GIAO DIỆN ===
  const [saving, setSaving] = useState(false);                  // Trạng thái đang lưu dữ liệu (hiển thị loading)
  const [error, setError] = useState('');                       // Thông báo lỗi nếu có

  // Nếu isOpen = false, không render gì cả để ẩn modal
  if (!isOpen) return null;
  
  // === 3. CÁC HÀM XỬ LÝ SỰ KIỆN TƯƠNG TÁC (Event Handlers) ===

  /**
   * Hàm thêm một thẻ trắng mới vào cuối danh sách hiện tại.
   */
  const addCard = () => {
    setCards(prev => [...prev, { front: '', back: '' }]);
  };

  /**
   * Hàm xóa một thẻ khỏi danh sách dựa trên vị trí (index).
   * Yêu cầu: Luôn phải giữ lại ít nhất 1 thẻ trong danh sách.
   * 
   * @param {number} index - Vị trí của thẻ cần xóa
   */
  const removeCard = (index) => {
    if (cards.length <= 1) return; // Không cho phép xóa nếu chỉ còn 1 thẻ
    setCards(prev => prev.filter((_, i) => i !== index)); // Lọc bỏ thẻ ở vị trí tương ứng
  };
  
  /**
   * Hàm cập nhật nội dung mặt trước hoặc mặt sau của một thẻ cụ thể.
   * 
   * @param {number} index - Vị trí của thẻ đang được chỉnh sửa
   * @param {string} field - Trường cần cập nhật ('front' hoặc 'back')
   * @param {string} value - Giá trị mới do người dùng nhập vào
   */
  const updateCard = (index, field, value) => {
    setCards(prev => prev.map((card, i) =>
      i === index ? { ...card, [field]: value } : card
    ));
  };

  /**
   * Hàm xử lý khi người dùng nhấn nút lưu (Save Deck).
   * Thực hiện validate dữ liệu, sau đó gọi API Supabase để lưu bộ bài và các thẻ bên trong.
   */
  const handleSave = async () => {
    // Validate 1: Tên bộ bài không được để trống
    if (!deckName.trim()) {
      setError('Please enter a deck name.');
      return;
    }
    
    // Lọc ra các thẻ hợp lệ (cả mặt trước và mặt sau đều phải có dữ liệu sau khi xóa khoảng trắng 2 đầu)
    const validCards = cards.filter(c => c.front.trim() && c.back.trim());
    
    // Validate 2: Phải có ít nhất 1 thẻ hợp lệ
    if (validCards.length === 0) {
      setError('Please add at least one card with both front and back content.');
      return;
    }
    
    setError(''); // Xóa lỗi cũ
    setSaving(true); // Bật trạng thái đang lưu
    
    try {
      // 1. Chuẩn bị payload (dữ liệu) để tạo bộ bài mới
      const deckPayload = {
        title: deckName.trim(),
        description: description.trim() || null, // Nếu rỗng thì gửi lên là null
        is_system: false, // Bộ bài do người dùng tạo thì is_system = false
        icon: selectedIcon,
      };
      
      // Gọi API chèn bộ bài vào bảng 'decks'
      let { data: deckData, error: deckError } = await supabase
        .from('decks')
        .insert([deckPayload])
        .select() // Yêu cầu trả về dữ liệu vừa chèn (để lấy được ID sinh tự động)
        .single();
        
      // Xử lý tương thích ngược (Fallback): 
      // Nếu CSDL cũ chưa cập nhật cột 'icon', API sẽ báo lỗi (Mã 42703 hoặc PGRST204).
      // Khi đó, ta sẽ thử gửi lại dữ liệu mà không có thuộc tính 'icon'.
      if (deckError && (deckError.code === '42703' || deckError.code === 'PGRST204' || deckError.message?.includes('icon'))) {
        console.warn('Icon column not found, falling back to legacy insert.');
        const fallbackPayload = { ...deckPayload };
        delete fallbackPayload.icon; // Xóa thuộc tính icon
        
        // Gọi lại API
        const fallbackRes = await supabase.from('decks').insert([fallbackPayload]).select().single();
        deckData = fallbackRes.data;
        deckError = fallbackRes.error;
      }
      
      if (deckError) throw deckError; // Nếu vẫn lỗi thì ném ra Exception
      
      // 2. Chèn danh sách các thẻ vào bảng 'cards' 
      // Ánh xạ các thẻ hợp lệ thành dạng payload, gắn kèm với ID của bộ bài (deck_id) vừa tạo ở bước 1.
      const cardRows = validCards.map(c => ({
        deck_id: deckData.id,
        front: c.front.trim(),
        back: c.back.trim(),
      }));
      
      const { error: cardsError } = await supabase
        .from('cards')
        .insert(cardRows);
        
      if (cardsError) throw cardsError;
      
      // 3. Reset form về trạng thái ban đầu sau khi lưu thành công
      setDeckName('');
      setDescription('');
      setSelectedIcon('📁');
      setCards([{ front: '', back: '' }]);
      
      // Gọi callback thông báo thành công cho component cha (App.jsx) và đóng modal
      onDeckCreated?.(deckData);
      onClose();
      
    } catch (err) {
      console.error('Error saving deck:', err);
      setError(err.message || 'Failed to save deck. Please try again.');
    } finally {
      setSaving(false); // Tắt trạng thái đang lưu
    }
  };

  /**
   * Hàm đóng modal khi người dùng click vào phần nền tối (overlay) bên ngoài hộp thoại chính.
   */
  const handleOverlayClick = (e) => {
    // Chỉ đóng khi phần tử được click chính là overlay (chứ không phải các phần tử con bên trong)
    if (e.target === e.currentTarget) onClose();
  };

  // === 4. RENDER GIAO DIỆN ===
  return (
    <div className="create-deck-overlay" onClick={handleOverlayClick}>
      {/* Khung modal chính */}
      <div className="create-deck-modal" role="dialog" aria-labelledby="create-deck-title">
        
        {/* Phần đầu Modal (Header) */}
        <div className="create-deck-header">
          <h2 id="create-deck-title" className="create-deck-title">Create New Deck</h2>
          <button className="create-deck-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        
        {/* Phần nội dung Modal (Body) */}
        <div className="create-deck-body">
          {/* Thông báo lỗi */}
          {error && (
            <div className="create-deck-error" role="alert">{error}</div>
          )}
          
          {/* Vùng chọn Icon */}
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
              
              {/* Bảng chọn Emoji sử dụng thư viện @emoji-mart/react */}
              {showPicker && (
                <div className="create-deck-emoji-popover">
                  <div className="create-deck-emoji-overlay" onClick={() => setShowPicker(false)} />
                  <div className="create-deck-picker-wrapper">
                    <Picker 
                      data={data} 
                      native={true}
                      onEmojiSelect={(emoji) => {
                        setSelectedIcon(emoji.native); // Lưu emoji người dùng chọn
                        setShowPicker(false);          // Đóng bảng
                      }} 
                      theme="light"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Trình nhập Tên bộ bài */}
          <div className="create-deck-field">
            <label htmlFor="deck-name" className="create-deck-label">Deck Name</label>
            <input
              id="deck-name"
              type="text"
              className="create-deck-input"
              placeholder="e.g. Japanese Vocabulary"
              value={deckName}
              onChange={e => setDeckName(e.target.value)}
              autoFocus // Tự động đưa con trỏ chuột vào ô này khi modal mở
            />
          </div>
          
          {/* Trình nhập Mô tả */}
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
          
          {/* Đường kẻ phân cách (Divider) */}
          <div className="create-deck-divider">
            <span>Cards ({cards.length})</span>
          </div>
          
          {/* Danh sách các thẻ Flashcards nhập vào */}
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
                {/* Nút xóa thẻ */}
                <button
                  className="create-deck-remove-card"
                  onClick={() => removeCard(index)}
                  disabled={cards.length <= 1} // Vô hiệu hóa nếu chỉ còn 1 thẻ
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
        </div>
        
        {/* Phần Footer chứa các nút hành động */}
        <div className="create-deck-footer">
          <button
            className="create-deck-btn create-deck-btn--cancel"
            onClick={onClose}
            disabled={saving} // Chặn bấm khi đang lưu
          >
            Cancel
          </button>
          <button
            className="create-deck-btn create-deck-btn--save"
            onClick={handleSave}
            disabled={saving} // Chặn bấm nhiều lần
          >
            {saving ? 'Saving…' : 'Save Deck'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
