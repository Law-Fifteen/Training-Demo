"use client";

import { IncorrectAnswer } from '@/types/training';
import { X, AlertCircle, ArrowRight, RotateCcw, MessageSquare } from 'lucide-react';

interface IncorrectQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  incorrectAnswers: IncorrectAnswer[];
  onJumpToQuestion: (cardId: string) => void;
  onRetryAll: () => void;
  pathName: string;
}

export function IncorrectQuestionsModal({
  isOpen,
  onClose,
  incorrectAnswers,
  onJumpToQuestion,
  onRetryAll,
  pathName,
}: IncorrectQuestionsModalProps) {
  if (!isOpen) return null;

  // Remove duplicates (keep only the most recent attempt for each card)
  const uniqueIncorrectAnswers = incorrectAnswers.reduce((acc, current) => {
    const existing = acc.find(item => item.cardId === current.cardId);
    if (!existing || current.timestamp > existing.timestamp) {
      // Remove existing if present and add current
      const filtered = acc.filter(item => item.cardId !== current.cardId);
      return [...filtered, current];
    }
    return acc;
  }, [] as IncorrectAnswer[]);

  // Sort by most recent first
  const sortedAnswers = uniqueIncorrectAnswers.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-800 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Incorrect Answers
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pathName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                {sortedAnswers.length}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                question{sortedAnswers.length !== 1 ? 's' : ''} missed
              </span>
            </div>
            {sortedAnswers.length > 0 && (
              <button
                onClick={onRetryAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Review All
              </button>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedAnswers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Great job!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't missed any questions yet. Keep it up!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAnswers.map((answer, index) => (
                <div
                  key={answer.cardId}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Number */}
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        {sortedAnswers.length - index}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {answer.cardTitle}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <MessageSquare className="w-4 h-4" />
                        <span>Your answer:</span>
                        <span className="text-red-600 dark:text-red-400 font-medium truncate">
                          {answer.selectedOptionText}
                        </span>
                      </div>

                      {/* Jump Button */}
                      <button
                        onClick={() => {
                          onJumpToQuestion(answer.cardId);
                          onClose();
                        }}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        <span>Go to question</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
