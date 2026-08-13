import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';

// Hằng số quy định số lượng mục lịch sử hiển thị trên mỗi trang (phân trang)
const PAGE_SIZE = 5;

/**
 * Custom hook: useHistory
 * Đóng vai trò quản lý việc tải, lưu trữ và hiển thị dữ liệu lịch sử các phiên học của người dùng.
 * Cung cấp khả năng phân trang (Load More, Show Less) để không tải toàn bộ dữ liệu cùng một lúc gây nặng ứng dụng.
 */
export function useHistory() {
  // === 1. STATES (Trạng thái) ===
  
  // Mảng chứa các bản ghi lịch sử đã tải về từ database
  const [history, setHistory] = useState([]);
  
  // Cờ hiệu báo hiệu đang trong quá trình tải dữ liệu lịch sử
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Chỉ số trang hiện tại (0 là trang đầu tiên)
  const [page, setPage] = useState(0);
  
  // Cờ hiệu quản lý việc modal/giao diện lịch sử có đang được mở hay không (dùng cho UI cũ hoặc modal)
  const [showHistory, setShowHistory] = useState(false);

  // === 2. CÁC HÀM XỬ LÝ (Functions) ===

  /**
   * Hàm: queryHistory
   * Xây dựng câu truy vấn dữ liệu từ bảng 'history' của Supabase.
   * Tính toán offset (từ vị trí nào đến vị trí nào) dựa vào số trang hiện tại (pageNum) và PAGE_SIZE.
   * 
   * @param {number} pageNum - Trang cần tải dữ liệu (Bắt đầu từ 0)
   * @param {string} categoryKey - (Tùy chọn) Khóa danh mục để lọc lịch sử theo bộ bài cụ thể
   * @returns {Promise} Trả về Promise của truy vấn Supabase
   */
  const queryHistory = useCallback(async (pageNum, categoryKey) => {
    // Tính toán khoảng index để lấy dữ liệu. Ví dụ trang 0: từ 0 đến 4
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    // Khởi tạo truy vấn: Chọn tất cả cột, sắp xếp giảm dần theo id (bản ghi mới nhất lên đầu)
    let query = supabase
      .from('history')
      .select('*')
      .order('id', { ascending: false });
    
    // Nếu có truyền vào categoryKey, thêm điều kiện lọc vào câu truy vấn
    if (categoryKey) {
      query = query.eq('categories', categoryKey);
    }
    
    // Trả về lệnh gọi lấy dữ liệu trong khoảng (range) đã tính
    return query.range(from, to);
  }, []);

  /**
   * Hàm: fetchHistory
   * Gọi hàm queryHistory để lấy dữ liệu thực tế từ API và cập nhật vào state.
   * Xử lý cả 2 trường hợp: Tải lần đầu (pageNum = 0) và Tải thêm (Load More).
   * 
   * @param {number} pageNum - Trang cần tải dữ liệu
   * @param {string} categoryKey - (Tùy chọn) Danh mục bộ bài
   */
  const fetchHistory = useCallback(async (pageNum, categoryKey) => {
    setLoadingHistory(true); // Bật hiệu ứng tải
    
    const { data, error } = await queryHistory(pageNum, categoryKey);
    
    if (error) {
      console.error('Error fetching history:', error);
    } else {
      // Nếu là tải trang đầu tiên thì ghi đè toàn bộ mảng lịch sử hiện tại
      if (pageNum === 0) {
        setHistory(data || []);
      } else {
        // Nếu là tải trang tiếp theo, nối (append) dữ liệu mới vào mảng cũ bằng spread operator
        setHistory(prev => [...prev, ...data]);
      }
    }
    setLoadingHistory(false); // Tắt hiệu ứng tải
  }, [queryHistory]);

  /**
   * Effect hook: Tự động tải trang lịch sử đầu tiên (page 0) khi hook này được khởi tạo.
   * Sử dụng biến cờ 'cancelled' để tránh lỗi memory leak nếu component bị unmount 
   * trước khi API trả về kết quả.
   */
  useEffect(() => {
    let cancelled = false;
    
    queryHistory(0).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.error('Error fetching history:', error);
      } else {
        setHistory(data || []);
      }
      setLoadingHistory(false);
    });
    
    // Cleanup function: Đánh dấu là đã huỷ nếu component chứa hook này bị gỡ bỏ
    return () => { cancelled = true; };
  }, [queryHistory]);

  /**
   * Hàm: saveResult
   * Được gọi ở cuối mỗi phiên học để lưu điểm số, tổng số câu và loại bộ bài vào database.
   * 
   * @param {string} selectedCategory - Tên danh mục / Bộ bài (VD: "TOEIC Vocabulary")
   * @param {number} correct - Điểm số (Số câu trả lời từ mức Good trở lên)
   * @param {number} totalAmount - Tổng số câu trong phiên học
   * @param {string} mode - Chế độ học ('standard', 'easy', 'normal', 'hard')
   */
  const saveResult = useCallback(async (selectedCategory, correct, totalAmount, mode = 'standard') => {
    console.log('Saving result:', { score: correct, total: totalAmount, category: selectedCategory, mode });
    
    // Lấy thông tin user hiện tại để gắn user_id vào bản ghi lịch sử (bắt buộc cho RLS)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Cannot save result: User not authenticated');
      return;
    }
    
    // Định dạng chuỗi ngày tháng năm theo chuẩn DD/MM/YYYY để lưu vào DB (dạng chuỗi)
    const dateObj = new Date();
    const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
    
    // Cấu trúc dữ liệu chuẩn bị gửi lên Supabase (bao gồm user_id cho multi-user)
    const payload = {
      user_id: user.id,
      created_at: formattedDate,
      categories: selectedCategory,
      score: correct,
      total: totalAmount,
      mode: mode
    };
    
    // Thực hiện lệnh INSERT vào bảng 'history'
    let { data, error } = await supabase.from('history').insert([payload]).select();
    
    // Fallback: Xử lý tương thích ngược cho CSDL cũ. 
    // Nếu bảng 'history' trong CSDL chưa có cột 'mode' (Lỗi mã 42703), thử lưu lại mà không có cột 'mode'.
    if (error && error.code === '42703') {
      console.warn('Mode column not found, falling back to legacy insert without mode.');
      const fallbackPayload = { ...payload };
      delete fallbackPayload.mode; // Xóa key mode
      const fallbackRes = await supabase.from('history').insert([fallbackPayload]).select();
      data = fallbackRes.data;
      error = fallbackRes.error;
    }
    
    if (error) {
      console.error('Error saving result:', error);
    } else {
      console.log('Result saved successfully:', data);
    }
  }, []);

  /**
   * Hàm: toggleHistory
   * Bật/Tắt trạng thái hiển thị của giao diện lịch sử.
   * Nếu đang từ trạng thái đóng chuyển sang mở, thì làm mới dữ liệu (tải lại trang 0).
   */
  const toggleHistory = useCallback(() => {
    setShowHistory(prev => {
      if (!prev) {
        setPage(0);
        fetchHistory(0);
      }
      return !prev;
    });
  }, [fetchHistory]);
  
  /**
   * Hàm: loadMore
   * Tăng số trang lên 1 và tải thêm dữ liệu của trang tiếp theo.
   * Được gọi khi người dùng nhấn nút "Show More" (Tải thêm).
   */
  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage);
  }, [page, fetchHistory]);
  
  /**
   * Hàm: showLess
   * Thu gọn danh sách lịch sử bằng cách reset về trang 0 và chỉ tải trang 0.
   * Được gọi khi người dùng muốn ẩn bớt lịch sử đã tải thêm.
   */
  const showLess = useCallback(() => {
    setPage(0);
    fetchHistory(0);
  }, [fetchHistory]);

  /**
   * Hàm: resetPagination
   * Chỉ đặt lại bộ đếm trang về 0 mà không gọi API tải dữ liệu.
   * Dùng khi chuyển đổi các màn hình để đảm bảo lần vào lịch sử kế tiếp sẽ bắt đầu từ đầu.
   */
  const resetPagination = useCallback(() => {
    setPage(0);
  }, []);

  // Trả về các trạng thái và hàm để giao diện sử dụng
  return {
    history,
    loadingHistory,
    page,
    showHistory,
    PAGE_SIZE,       // Hằng số xuất ra để component UI tự tính toán phân trang
    fetchHistory,
    saveResult,
    toggleHistory,
    loadMore,
    showLess,
    resetPagination,
  };
}
