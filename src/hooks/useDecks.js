/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';

/**
 * Custom Hook: useDecks
 * Chịu trách nhiệm quản lý trạng thái và các thao tác lấy dữ liệu liên quan đến các bộ bài (decks) từ Supabase.
 * Tách biệt logic xử lý dữ liệu khỏi giao diện người dùng.
 * 
 * @returns {Object} Trả về danh sách bộ bài, tổng số thẻ, hàm tải lại bộ bài và số lượng bộ bài hệ thống/tùy chỉnh.
 */
export const useDecks = () => {
  const { user } = useAuth();
  
  // State lưu trữ toàn bộ danh sách các bộ bài lấy được từ cơ sở dữ liệu
  const [allDecks, setAllDecks] = useState([]);
  
  // State lưu trữ tổng số lượng thẻ (flashcards) của tất cả các bộ bài cộng lại
  const [totalCards, setTotalCards] = useState(0);

  /**
   * Hàm lấy danh sách các bộ bài từ cơ sở dữ liệu Supabase.
   * Sử dụng useCallback để tránh việc hàm bị tạo lại (re-created) ở mỗi lần render, 
   * giúp tối ưu hiệu suất khi truyền hàm này vào useEffect.
   */
  const fetchDecks = useCallback(async () => {
    // Truy vấn bảng 'decks', lấy tất cả các cột và đếm số lượng thẻ (cards) tương ứng với mỗi bộ bài
    let query = supabase
      .from('decks')
      .select('*, cards(count)')
      .order('created_at', { ascending: true }); // Sắp xếp theo thời gian tạo cũ nhất đến mới nhất
      
    if (user) {
      // User đã đăng nhập: lấy bộ bài hệ thống HOẶC bộ bài do user này tạo
      query = query.or(`is_system.eq.true,user_id.eq.${user.id}`);
    } else {
      // Chưa đăng nhập: chỉ lấy bộ bài hệ thống
      query = query.eq('is_system', true);
    }

    const { data: decksData, error } = await query;

    // Xử lý lỗi nếu việc truy vấn thất bại
    if (error) {
      console.error('Error fetching decks:', error);
      return;
    }
    
    // Biến tạm để cộng dồn tổng số lượng thẻ của tất cả bộ bài
    let tCards = 0;
    
    // Định dạng lại cấu trúc dữ liệu trả về từ Supabase cho dễ sử dụng trong ứng dụng
    const formattedDecks = decksData.map(d => {
      // Lấy ra số lượng thẻ từ mảng cards trả về (nếu không có thì mặc định là 0)
      const count = d.cards[0]?.count || 0;
      tCards += count;
      // Trả về object bộ bài đã được thêm thuộc tính card_count
      return { ...d, card_count: count };
    });
    
    // Cập nhật state với dữ liệu đã được định dạng
    setAllDecks(formattedDecks);
    setTotalCards(tCards);
  }, [user]);

  /**
   * Effect hook: Tự động tải danh sách bộ bài ngay sau khi component sử dụng hook này được mount (khởi tạo).
   */
  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  // Đếm số lượng các bộ bài mặc định của hệ thống (is_system = true)
  const systemDeckCount = allDecks.filter(d => d.is_system).length;
  
  // Đếm số lượng các bộ bài do người dùng tự tạo (is_system = false)
  const customDeckCount = allDecks.filter(d => !d.is_system).length;

  return {
    allDecks,
    setAllDecks,
    totalCards,
    fetchDecks,
    systemDeckCount,
    customDeckCount
  };
};
