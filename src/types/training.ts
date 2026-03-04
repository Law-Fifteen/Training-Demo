export type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
};

export type Card = {
  id: string;
  type: 'question' | 'info' | 'scenario';
  title: string;
  content: string;
  options?: Option[];
  correctOptionId?: string;
  nextCardId?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  minReadTime?: number; // Minimum seconds user must spend on this card before continuing
};

export type TalkPath = {
  id: string;
  name: string;
  description: string;
  cards: Card[];
  category: string;
};

export type IncorrectAnswer = {
  cardId: string;
  cardTitle: string;
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionId: string;
  timestamp: number;
};

export type UserProgress = {
  currentPathId: string | null;
  currentCardId: string | null;
  completedCards: string[];
  score: number;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAnswers: IncorrectAnswer[];
  pathProgress: Record<string, {
    completedCards: string[];
    currentCardIndex: number;
    incorrectAnswers?: IncorrectAnswer[];
  }>;
};

export type CardResponse = {
  cardId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timestamp: number;
};
