"use client";

import { useState, useCallback, useEffect } from 'react';
import { Card, CardResponse, TalkPath, UserProgress } from '@/types/training';
import { sampleTalkPaths } from '@/data/talkPaths';

const STORAGE_KEY = 'cogo-training-progress';

const initialProgress: UserProgress = {
  currentPathId: null,
  currentCardId: null,
  completedCards: [],
  score: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  incorrectAnswers: [],
  pathProgress: {},
};

function loadProgressFromStorage(): UserProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with initialProgress to ensure all fields exist (handles schema updates)
      return {
        ...initialProgress,
        ...parsed,
        // Ensure nested arrays/objects are properly merged
        incorrectAnswers: parsed.incorrectAnswers || [],
        pathProgress: parsed.pathProgress || {},
      };
    }
  } catch (error) {
    console.error('Failed to load progress from storage:', error);
  }
  return null;
}

function saveProgressToStorage(progress: UserProgress) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress to storage:', error);
  }
}

export function useTraining() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = loadProgressFromStorage();
    return saved || initialProgress;
  });
  const [currentResponse, setCurrentResponse] = useState<CardResponse | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    saveProgressToStorage(progress);
  }, [progress]);

  const startPath = useCallback((pathId: string, restart: boolean = false) => {
    if (!pathId) {
      // Exit to path selector
      setProgress(prev => ({
        ...prev,
        currentPathId: null,
        currentCardId: null,
      }));
      setCurrentResponse(null);
      setHasAnswered(false);
      return;
    }

    const path = sampleTalkPaths.find(p => p.id === pathId);
    if (!path || path.cards.length === 0) return;

    // Check if there's saved progress for this path
    const savedPathProgress = progress.pathProgress[pathId];
    const hasProgress = savedPathProgress && savedPathProgress.completedCards.length > 0 && !restart;
    
    // Determine which card to start from
    let targetCard = path.cards[0];
    let targetIndex = 0;
    
    if (hasProgress && savedPathProgress.currentCardIndex < path.cards.length) {
      // Resume from where they left off
      targetIndex = savedPathProgress.currentCardIndex;
      targetCard = path.cards[targetIndex];
    }
    
    if (restart) {
      // Complete reset - set ALL global counters to 0, clear this path's progress
      const pathCardIds = path.cards.map(c => c.id);
      
      setProgress(prev => {
        const newState = {
          ...prev,
          currentPathId: pathId,
          currentCardId: targetCard.id,
          completedCards: prev.completedCards.filter(id => !pathCardIds.includes(id)),
          score: 0,
          totalAttempts: 0,
          correctAttempts: 0,
          incorrectAnswers: prev.incorrectAnswers.filter(ia => !pathCardIds.includes(ia.cardId)),
          pathProgress: {
            ...prev.pathProgress,
            [pathId]: {
              completedCards: [],
              currentCardIndex: 0,
              incorrectAnswers: [],
            },
          },
        };
        
        // Explicitly save to localStorage on restart
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
        }
        
        return newState;
      });
    } else {
      setProgress(prev => ({
        ...prev,
        currentPathId: pathId,
        currentCardId: targetCard.id,
        pathProgress: {
          ...prev.pathProgress,
          [pathId]: {
            completedCards: prev.pathProgress[pathId]?.completedCards || [],
            currentCardIndex: targetIndex,
            incorrectAnswers: prev.pathProgress[pathId]?.incorrectAnswers || [],
          },
        },
      }));
    }
    setCurrentResponse(null);
    setHasAnswered(false);
  }, [progress.pathProgress]);

  const submitAnswer = useCallback((cardId: string, optionId: string, isCorrect: boolean, cardTitle?: string, selectedOptionText?: string, correctOptionId?: string) => {
    const response: CardResponse = {
      cardId,
      selectedOptionId: optionId,
      isCorrect,
      timestamp: Date.now(),
    };

    setCurrentResponse(response);
    setHasAnswered(true);

    setProgress(prev => {
      const newProgress = {
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        correctAttempts: isCorrect ? prev.correctAttempts + 1 : prev.correctAttempts,
        score: isCorrect ? prev.score + 10 : prev.score,
      };

      // Track incorrect answers
      if (!isCorrect && cardTitle && selectedOptionText && correctOptionId) {
        const incorrectAnswer = {
          cardId,
          cardTitle,
          selectedOptionId: optionId,
          selectedOptionText,
          correctOptionId,
          timestamp: Date.now(),
        };
        // Safety check: ensure incorrectAnswers exists
        const existingIncorrectAnswers = prev.incorrectAnswers || [];
        newProgress.incorrectAnswers = [...existingIncorrectAnswers, incorrectAnswer];
      }

      return newProgress;
    });
  }, []);

  const nextCard = useCallback(() => {
    if (!progress.currentPathId || !progress.currentCardId) return;

    const path = sampleTalkPaths.find(p => p.id === progress.currentPathId);
    if (!path) return;

    const currentCardIndex = path.cards.findIndex(c => c.id === progress.currentCardId);
    const currentCard = path.cards[currentCardIndex];
    
    if (!currentCard) return;

    const nextCardId = currentCard.nextCardId;
    
    // Get incorrect answers for current path
    const pathIncorrectAnswers = progress.incorrectAnswers.filter(ia => 
      path.cards.some(c => c.id === ia.cardId)
    );
    
    if (!nextCardId) {
      // End of path - mark last card as completed
      setProgress(prev => ({
        ...prev,
        completedCards: [...prev.completedCards, progress.currentCardId!],
        currentCardId: null,
        pathProgress: {
          ...prev.pathProgress,
          [progress.currentPathId!]: {
            completedCards: [...(prev.pathProgress[progress.currentPathId!]?.completedCards || []), progress.currentCardId!],
            currentCardIndex: currentCardIndex,
            incorrectAnswers: pathIncorrectAnswers,
          },
        },
      }));
    } else {
      const nextCardIndex = path.cards.findIndex(c => c.id === nextCardId);
      
      setProgress(prev => ({
        ...prev,
        completedCards: [...prev.completedCards, progress.currentCardId!],
        currentCardId: nextCardId,
        pathProgress: {
          ...prev.pathProgress,
          [progress.currentPathId!]: {
            completedCards: [...(prev.pathProgress[progress.currentPathId!]?.completedCards || []), progress.currentCardId!],
            currentCardIndex: nextCardIndex,
            incorrectAnswers: pathIncorrectAnswers,
          },
        },
      }));
    }

    setCurrentResponse(null);
    setHasAnswered(false);
  }, [progress.currentPathId, progress.currentCardId, progress.incorrectAnswers]);

  const resetPath = useCallback(() => {
    if (!progress.currentPathId) return;
    
    const pathId = progress.currentPathId;
    const path = sampleTalkPaths.find(p => p.id === pathId);
    
    if (path) {
      const firstCard = path.cards[0];
      const pathCardIds = path.cards.map(c => c.id);
      setProgress(prev => {
        const newState = {
          ...prev,
          currentCardId: firstCard.id,
          completedCards: prev.completedCards.filter(id => !pathCardIds.includes(id)),
          score: 0,
          totalAttempts: 0,
          correctAttempts: 0,
          incorrectAnswers: prev.incorrectAnswers.filter(ia => !pathCardIds.includes(ia.cardId)),
          pathProgress: {
            ...prev.pathProgress,
            [pathId]: {
              completedCards: [],
              currentCardIndex: 0,
              incorrectAnswers: [],
            },
          },
        };
        
        // Also explicitly clear localStorage to ensure clean restart
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
        }
        
        return newState;
      });
    }
    setCurrentResponse(null);
    setHasAnswered(false);
  }, [progress.currentPathId]);

  const getCurrentCard = useCallback((): Card | null => {
    if (!progress.currentPathId || !progress.currentCardId) return null;
    
    const path = sampleTalkPaths.find(p => p.id === progress.currentPathId);
    if (!path) return null;
    
    return path.cards.find(c => c.id === progress.currentCardId) || null;
  }, [progress.currentPathId, progress.currentCardId]);

  const getCurrentPath = useCallback((): TalkPath | null => {
    if (!progress.currentPathId) return null;
    return sampleTalkPaths.find(p => p.id === progress.currentPathId) || null;
  }, [progress.currentPathId]);

  const getPathProgress = useCallback((pathId: string) => {
    return progress.pathProgress[pathId] || { completedCards: [], currentCardIndex: 0, incorrectAnswers: [] };
  }, [progress.pathProgress]);

  const getIncorrectAnswersForPath = useCallback((pathId: string) => {
    const path = sampleTalkPaths.find(p => p.id === pathId);
    if (!path) return [];
    
    // Get incorrect answers that belong to this path
    // Safety check: ensure incorrectAnswers exists (handles old saved data)
    const incorrectAnswers = progress.incorrectAnswers || [];
    return incorrectAnswers.filter(ia => 
      path.cards.some(c => c.id === ia.cardId)
    );
  }, [progress.incorrectAnswers]);

  const restartPath = useCallback(() => {
    if (!progress.currentPathId) return;
    startPath(progress.currentPathId, true);
  }, [progress.currentPathId, startPath]);

  const jumpToCard = useCallback((cardId: string) => {
    if (!progress.currentPathId) return;
    
    const path = sampleTalkPaths.find(p => p.id === progress.currentPathId);
    if (!path) return;
    
    const cardIndex = path.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;
    
    const targetCard = path.cards[cardIndex];
    
    // Reset answer state FIRST before updating progress
    setCurrentResponse(null);
    setHasAnswered(false);
    
    setProgress(prev => ({
      ...prev,
      currentCardId: cardId,
      pathProgress: {
        ...prev.pathProgress,
        [progress.currentPathId!]: {
          ...prev.pathProgress[progress.currentPathId!],
          currentCardIndex: cardIndex,
        },
      },
    }));
  }, [progress.currentPathId]);

  const setReviewResponse = useCallback((response: CardResponse | null) => {
    setCurrentResponse(response);
    setHasAnswered(response !== null);
  }, []);

  const resetAnswerState = useCallback(() => {
    setCurrentResponse(null);
    setHasAnswered(false);
  }, []);

  const clearIncorrectAnswers = useCallback(() => {
    if (!progress.currentPathId) return;
    
    const pathId = progress.currentPathId;
    const path = sampleTalkPaths.find(p => p.id === pathId);
    if (!path) return;
    
    const pathCardIds = path.cards.map(c => c.id);
    
    setProgress(prev => ({
      ...prev,
      incorrectAnswers: prev.incorrectAnswers.filter(ia => !pathCardIds.includes(ia.cardId)),
      pathProgress: {
        ...prev.pathProgress,
        [pathId]: {
          ...prev.pathProgress[pathId],
          incorrectAnswers: [],
        },
      },
    }));
  }, [progress.currentPathId]);

  return {
    progress,
    currentResponse,
    hasAnswered,
    talkPaths: sampleTalkPaths,
    startPath,
    submitAnswer,
    nextCard,
    resetPath,
    restartPath,
    jumpToCard,
    getCurrentCard,
    getCurrentPath,
    getPathProgress,
    getIncorrectAnswersForPath,
    setReviewResponse,
    resetAnswerState,
    clearIncorrectAnswers,
  };
}
