import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { calculateNextReview } from '../utils/srs';

/**
 * Custom hook for managing flashcard navigation, SRS ratings, and scoring.
 * Handles card index, SRS progress tracking, deck selection, and session flow.
 *
 * Queue logic: Prioritizes cards where due_date <= NOW() or cards with no progress
 * (new cards). Cards are sorted by due_date ascending so the most overdue come first.
 */
export function useFlashcards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState({});        // { cardIndex: rating (1-4) }
  const [showResult, setShowResult] = useState(false);
  const [showBegin, setShowBegin] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [studyMode, setStudyMode] = useState('standard');
  const [cards, setCards] = useState([]);             // Fetched from DB
  const [progressMap, setProgressMap] = useState({}); // { card_id: progressRow }
  const [dueQueue, setDueQueue] = useState([]);       // Ordered card indices
  const [dueIndex, setDueIndex] = useState(0);        // Position within dueQueue
  const [loadingCards, setLoadingCards] = useState(false);

  // Current card follows the due queue order
  const currentCard = dueQueue.length > 0
    ? cards[dueQueue[dueIndex]]
    : cards[currentIndex];

  const actualIndex = dueQueue.length > 0 ? dueQueue[dueIndex] : currentIndex;

  // Count ratings >= 3 (Good/Easy) as correct
  const correctCount = Object.values(ratings).filter(r => r >= 3).length;
  const dueCount = dueQueue.length;

  /**
   * Fetch cards for a given deck (or multiple decks), then fetch existing progress rows,
   * then build the due queue.
   */
  const buildDueQueue = useCallback(async (deckIds) => {
    setLoadingCards(true);

    // Normalize to array
    const idsToFetch = Array.isArray(deckIds) ? deckIds : [deckIds];

    // 1. Fetch Cards for the Deck(s)
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
    setCards(deckCards);
    const cardIds = deckCards.map(c => c.id);

    // 2. Fetch Existing Progress for those cards
    let progressData = [];
    if (cardIds.length > 0) {
      const { data, error } = await supabase
        .from('user_card_progress')
        .select('*')
        .in('card_id', cardIds);

      if (error) {
        console.error('Error fetching card progress:', error);
      } else {
        progressData = data || [];
      }
    }

    // Build progress map: { card_id: row }
    const pMap = {};
    progressData.forEach(row => {
      pMap[row.card_id] = row;
    });
    setProgressMap(pMap);

    // 3. Build due queue: indices of cards that are due or new
    const now = new Date();
    const queue = [];

    deckCards.forEach((card, index) => {
      const progress = pMap[card.id];

      if (!progress) {
        // New card — always include, sort last
        queue.push({ index, dueDate: null, isNew: true });
      } else {
        const dueDate = new Date(progress.due_date);
        if (dueDate <= now) {
          queue.push({ index, dueDate, isNew: false });
        }
      }
    });

    // Sort: overdue cards first (by due_date ascending), then new cards
    queue.sort((a, b) => {
      if (a.isNew && b.isNew) return a.index - b.index;
      if (a.isNew) return 1;
      if (b.isNew) return -1;
      return a.dueDate - b.dueDate;
    });

    // Limit session to exactly 10 questions
    const orderedIndices = queue.map(q => q.index).slice(0, 10);
    
    setDueQueue(orderedIndices);
    setDueIndex(0);
    setLoadingCards(false);
  }, []);

  /**
   * Handle SRS rating: calculate next review, upsert progress, advance queue.
   */
  const handleSrsRating = useCallback(async (rating) => {
    if (!selectedDeck || !currentCard) return;

    const cardId = currentCard.id;
    const existing = progressMap[cardId];

    // Calculate next review using SM-2
    const result = calculateNextReview(
      rating,
      existing?.interval_days || 0,
      existing?.repetitions || 0,
      existing?.ease_factor || 2.5,
    );

    // Store rating for scoring
    setRatings(prev => ({ ...prev, [actualIndex]: rating }));

    // Upsert to Supabase
    const { error } = await supabase
      .from('user_card_progress')
      .upsert({
        card_id: cardId,
        ease_factor: result.easeFactor,
        interval_days: result.intervalDays,
        repetitions: result.repetitions,
        due_date: result.dueDate,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id, card_id', // Adjust if unique constraint changes
      });

    if (error) {
      console.error('Error upserting card progress:', error);
    }

    // Update local progress map
    setProgressMap(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        card_id: cardId,
        ease_factor: result.easeFactor,
        interval_days: result.intervalDays,
        repetitions: result.repetitions,
        due_date: result.dueDate,
      },
    }));

    // Advance to next due card or show results
    if (dueQueue.length > 0) {
      if (dueIndex < dueQueue.length - 1) {
        setDueIndex(prev => prev + 1);
      } else {
        // All due cards reviewed
        setIsSessionComplete(true);
      }
    } else {
      // Manual study mode (no due cards)
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsSessionComplete(true);
      }
    }
  }, [selectedDeck, currentCard, progressMap, dueIndex, dueQueue, actualIndex, cards.length, currentIndex]);



  const handleDeckSelect = useCallback((deckInput, mode = 'standard') => {
    // deckInput could be a single deck object OR an array of deck objects (Study Sets)
    const isMixedMode = Array.isArray(deckInput);
    
    // Set selected deck for UI title (if mixed, just use a dummy object)
    const activeDeck = isMixedMode 
      ? { id: 'mixed', title: `Mixed Study Set (${deckInput.length} Decks)` }
      : deckInput;
      
    setSelectedDeck(activeDeck);
    setStudyMode(mode);
    setRatings({});
    setCurrentIndex(0);
    setDueIndex(0);
    setIsSessionComplete(false);
    
    // Extract IDs
    const deckIds = isMixedMode ? deckInput.map(d => d.id) : deckInput.id;
    buildDueQueue(deckIds);
  }, [buildDueQueue]);

  const handleFinish = useCallback(() => {
    setShowResult(true);
  }, []);

  const resetSession = useCallback(() => {
    setRatings({});
    setCurrentIndex(0);
    setDueIndex(0);
    setDueQueue([]);
    setProgressMap({});
    setShowResult(false);
    setIsSessionComplete(false);
    setSelectedDeck(null);
    setCards([]);
  }, []);

  const beginSession = useCallback(() => {
    setShowBegin(true);
  }, []);

  const goBack = useCallback(() => {
    setShowBegin(false);
  }, []);

  return {
    currentIndex: actualIndex,
    answers: ratings,
    ratings,
    showResult,
    isSessionComplete,
    showBegin,
    selectedDeck,
    studyMode,
    cards,
    currentCard,
    correctCount,
    dueCount,
    dueIndex,
    dueQueue,
    loadingCards,
    handleSrsRating,
    handleDeckSelect,
    handleFinish,
    resetSession,
    beginSession,
    goBack,
  };
}
