import { useState, useCallback } from 'react';
import { FLASHCARDS } from '../data/flashcardData';

/**
 * Custom hook for managing flashcard navigation, answers, and scoring.
 * Handles card index, answer tracking, category selection, and session flow.
 */
export function useFlashcards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showBegin, setShowBegin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const cards = selectedCategory ? FLASHCARDS[selectedCategory] : [];
  const currentCard = cards[currentIndex];
  const correctCount = Object.values(answers).filter(v => v === 'yes').length;

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleAnswerCheck = useCallback((value) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: value }));
  }, [currentIndex]);

  const handleCategorySelect = useCallback((categoryKey) => {
    setSelectedCategory(categoryKey);
    setAnswers({});
    setCurrentIndex(0);
  }, []);

  const handleFinish = useCallback(() => {
    setShowResult(true);
  }, []);

  const resetSession = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
    setSelectedCategory(null);
  }, []);

  const beginSession = useCallback(() => {
    setShowBegin(true);
  }, []);

  const goBack = useCallback(() => {
    setShowBegin(false);
  }, []);

  return {
    currentIndex,
    answers,
    showResult,
    showBegin,
    selectedCategory,
    cards,
    currentCard,
    correctCount,
    handleNext,
    handlePrev,
    handleAnswerCheck,
    handleCategorySelect,
    handleFinish,
    resetSession,
    beginSession,
    goBack,
  };
}
