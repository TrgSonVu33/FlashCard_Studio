import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

const PAGE_SIZE = 5;

/**
 * Custom hook for managing session history with Supabase.
 * Handles fetching, pagination, and toggling the history dashboard.
 */
export function useHistory() {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [page, setPage] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  // Pure data query — no state management
  const queryHistory = useCallback(async (pageNum, categoryKey) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('history')
      .select('*')
      .order('id', { ascending: false });

    // Filter by category if provided
    if (categoryKey) {
      query = query.eq('categories', categoryKey);
    }

    return query.range(from, to);
  }, []);

  // State-managing wrapper for user-triggered fetches
  const fetchHistory = useCallback(async (pageNum, categoryKey) => {
    setLoadingHistory(true);
    const { data, error } = await queryHistory(pageNum, categoryKey);

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      if (pageNum === 0) {
        setHistory(data || []);
      } else {
        setHistory(prev => [...prev, ...data]);
      }
    }
    setLoadingHistory(false);
  }, [queryHistory]);

  // Initial fetch on mount — setState only in async callback
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
    return () => { cancelled = true; };
  }, [queryHistory]);

  const saveResult = useCallback(async (selectedCategory, correct, totalAmount) => {
    console.log('Saving result:', { score: correct, total: totalAmount, category: selectedCategory });

    // Format the date as dd/mm/yyyy
    const dateObj = new Date();
    const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

    const { data, error } = await supabase
      .from('history')
      .insert([{
        created_at: formattedDate,
        categories: selectedCategory,
        score: correct,
        total: totalAmount
      }])
      .select();

    if (error) {
      console.error('Error saving result:', error);
    } else {
      console.log('Result saved successfully:', data);
    }
  }, []);

  const toggleHistory = useCallback(() => {
    setShowHistory(prev => {
      if (!prev) {
        setPage(0);
        fetchHistory(0);
      }
      return !prev;
    });
  }, [fetchHistory]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage);
  }, [page, fetchHistory]);

  const showLess = useCallback(() => {
    setPage(0);
    fetchHistory(0);
  }, [fetchHistory]);

  const resetPagination = useCallback(() => {
    setPage(0);
  }, []);

  return {
    history,
    loadingHistory,
    page,
    showHistory,
    PAGE_SIZE,
    fetchHistory,
    saveResult,
    toggleHistory,
    loadMore,
    showLess,
    resetPagination,
  };
}
