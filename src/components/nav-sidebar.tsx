"use client";

import { Card } from '@/types/training';
import { 
  X, 
  CheckCircle, 
  Circle, 
  Info, 
  MessageSquare, 
  HelpCircle,
  RotateCcw,
  ChevronRight,
  Square,
  CheckSquare,
  Timer,
  AlertCircle
} from 'lucide-react';

interface NavSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  currentCardId: string;
  completedCards: string[];
  onJumpToCard: (cardId: string) => void;
  onRestart: () => void;
  pathName: string;
  timerBypass: boolean;
  onToggleTimerBypass: () => void;
  isReviewMode?: boolean;
}

export function NavSidebar({
  isOpen,
  onClose,
  cards,
  currentCardId,
  completedCards,
  onJumpToCard,
  onRestart,
  pathName,
  timerBypass,
  onToggleTimerBypass,
  isReviewMode = false,
}: NavSidebarProps) {
  if (!isOpen) return null;

  const getCardIcon = (type: Card['type']) => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'scenario':
        return <MessageSquare className="w-4 h-4" />;
      case 'question':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getCardStatus = (cardId: string, index: number) => {
    const currentIndex = cards.findIndex(c => c.id === currentCardId);
    
    if (cardId === currentCardId) {
      return 'current';
    }
    if (completedCards.includes(cardId)) {
      return 'completed';
    }
    if (index < currentIndex) {
      return 'passed';
    }
    return 'future';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900/90 dark:backdrop-blur-md shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/80">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
              Navigation
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {pathName}
          </p>
        </div>

        {/* Progress Summary */}
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 dark:text-blue-400">
              Progress
            </span>
            <span className="font-medium text-blue-900 dark:text-blue-300">
              {completedCards.length}/{cards.length} cards
            </span>
          </div>
          <div className="mt-2 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(completedCards.length / cards.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Review Mode Banner */}
        {isReviewMode && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Review Mode - All cards accessible
              </span>
            </div>
          </div>
        )}

        {/* Timer Bypass Toggle */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onToggleTimerBypass}
            className="flex items-start gap-3 text-left w-full group"
          >
            {timerBypass ? (
              <CheckSquare className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Square className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className={`text-sm font-medium ${
                  timerBypass
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Skip Timer Restrictions
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {timerBypass
                  ? 'Reading time requirements are disabled'
                  : 'Enable to bypass mandatory reading times'}
              </p>
            </div>
          </button>
        </div>

        {/* Card List */}
        <div className="flex-1 overflow-y-auto py-2">
          {cards.map((card, index) => {
            const status = getCardStatus(card.id, index);
            // In review mode, all cards are clickable
            const isClickable = isReviewMode || status === 'completed' || status === 'current' || status === 'passed';
            
            return (
              <button
                key={card.id}
                onClick={() => {
                  if (isClickable) {
                    onJumpToCard(card.id);
                    onClose();
                  }
                }}
                disabled={!isClickable}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                  status === 'current'
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                    : status === 'completed'
                    ? 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                    : status === 'passed'
                    ? 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent opacity-70'
                    : 'opacity-40 cursor-not-allowed border-l-4 border-transparent'
                }`}
              >
                {/* Status Icon */}
                <div className={`flex-shrink-0 mt-0.5 ${
                  status === 'completed'
                    ? 'text-green-500'
                    : status === 'current'
                    ? 'text-blue-500'
                    : 'text-gray-400 dark:text-gray-600'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    getCardIcon(card.type)
                  )}
                </div>

                {/* Card Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${
                      status === 'current'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {card.type === 'info' ? 'Info' : card.type === 'scenario' ? 'Scenario' : 'Question'} {index + 1}
                    </span>
                    {status === 'current' && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-0.5 truncate ${
                    status === 'current'
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {card.title}
                  </p>
                </div>

                {/* Arrow for clickable */}
                {isClickable && status !== 'current' && (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/80">
          <button
            onClick={() => {
              onRestart();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Training
          </button>
        </div>
      </div>
    </>
  );
}
