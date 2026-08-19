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
  
  // State lưu trữ danh sách các bộ bài hệ thống (public)
  const [systemDecks, setSystemDecks] = useState([]);
  
  // State lưu trữ danh sách các bộ bài do người dùng tạo (private)
  const [userDecks, setUserDecks] = useState([]);
  
  // State lưu trữ tổng số lượng thẻ (flashcards) của tất cả các bộ bài cộng lại
  const [totalCards, setTotalCards] = useState(0);

  // State theo dõi trạng thái đang tải dữ liệu
  const [loadingDecks, setLoadingDecks] = useState(true);

  /**
   * Hàm lấy danh sách các bộ bài từ cơ sở dữ liệu Supabase.
   * Sử dụng useCallback để tránh việc hàm bị tạo lại (re-created) ở mỗi lần render, 
   * giúp tối ưu hiệu suất khi truyền hàm này vào useEffect.
   */
  const fetchDecks = useCallback(async (fetchState = { isActive: true }) => {
    setLoadingDecks(true);

    // Truy vấn bộ bài hệ thống
    const systemQuery = supabase
      .from('decks')
      .select('*, cards(count)')
      .eq('is_system', true)
      .order('created_at', { ascending: true });

    const queries = [systemQuery];

    // Truy vấn bộ bài của người dùng (nếu đã đăng nhập)
    if (user) {
      queries.push(
        supabase
          .from('decks')
          .select('*, cards(count)')
          .eq('is_system', false)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
      );
    }

    const results = await Promise.all(queries);

    // Ngăn chặn ghi đè state nếu component đã unmount hoặc user đã thay đổi
    if (!fetchState.isActive) return;

    let tCards = 0;

    // 1. Xử lý kết quả system decks
    const sysRes = results[0];
    if (sysRes.error) {
      console.error('Error fetching system decks:', sysRes.error);
    } else {
      const formattedSysDecks = sysRes.data.map(d => {
        const count = d.cards[0]?.count || 0;
        tCards += count;
        return { ...d, card_count: count };
      });
      setSystemDecks(formattedSysDecks);
    }

    // 2. Xử lý kết quả user decks
    if (user && results[1]) {
      const userRes = results[1];
      if (userRes.error) {
        console.error('Error fetching user decks:', userRes.error);
      } else {
        const formattedUserDecks = userRes.data.map(d => {
          const count = d.cards[0]?.count || 0;
          tCards += count;
          return { ...d, card_count: count };
        });
        setUserDecks(formattedUserDecks);
      }
    } else {
      // Đảm bảo xóa sạch custom decks khi user không đăng nhập (đã log out)
      setUserDecks([]);
    }

    setTotalCards(tCards);
    setLoadingDecks(false);
  }, [user]);

  /**
   * Effect hook: Tự động tải danh sách bộ bài ngay sau khi component sử dụng hook này được mount (khởi tạo).
   * Có tích hợp cleanup để ngăn race condition khi auth state thay đổi.
   */
  useEffect(() => {
    const fetchState = { isActive: true };
    
    // Clear userDecks ngay lập tức nếu auth thay đổi sang logout để tránh nhấp nháy UI
    // Không clear systemDecks vì chúng vẫn phải hiển thị cho anonymous users
    if (!user) {
      setUserDecks([]);
    }
    
    fetchDecks(fetchState);
    
    return () => {
      fetchState.isActive = false;
    };
  }, [fetchDecks, user]);

  // Hợp nhất 2 danh sách lại cho các components cần hiển thị tất cả
  const allDecks = [...systemDecks, ...userDecks];

  // Đếm số lượng
  const systemDeckCount = systemDecks.length;
  const customDeckCount = userDecks.length;

  return {
    allDecks, // Xuất mảng hợp nhất để tương thích với các component cũ
    systemDecks,
    userDecks,
    setSystemDecks,
    setUserDecks,
    totalCards,
    fetchDecks,
    systemDeckCount,
    customDeckCount,
    loadingDecks
  };
};
