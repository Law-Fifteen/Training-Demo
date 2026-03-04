"use client";

import { Card, Option } from '@/types/training';
import { CheckCircle, XCircle, ArrowRight, HelpCircle, MessageSquare, Info, Timer, Square, CheckSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TrainingCardProps {
  card: Card;
  hasAnswered: boolean;
  selectedOptionId?: string;
  isCorrect?: boolean;
  onSelectOption: (optionId: string, isCorrect: boolean) => void;
  onNext: () => void;
  isLastCard: boolean;
  timerBypass?: boolean;
  isReviewingIncorrect?: boolean;
}

export function TrainingCard({
  card,
  hasAnswered,
  selectedOptionId,
  isCorrect,
  onSelectOption,
  onNext,
  isLastCard,
  timerBypass = false,
  isReviewingIncorrect = false,
}: TrainingCardProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const minReadTime = card.minReadTime || 0;
  const canProceed = timerBypass || elapsedTime >= minReadTime;

  useEffect(() => {
    setElapsedTime(0);
    setHasAcknowledged(false);
  }, [card.id]);

  useEffect(() => {
    if (card.type === 'info' && minReadTime > 0 && !timerBypass) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [card.id, card.type, minReadTime, timerBypass]);

  const getCardIcon = () => {
    switch (card.type) {
      case 'info':
        return <Info className="w-5 h-5 text-accent" />;
      case 'scenario':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'question':
        return <HelpCircle className="w-5 h-5 text-green-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-muted" />;
    }
  };

  const getCardTypeLabel = () => {
    switch (card.type) {
      case 'info':
        return 'Information';
      case 'scenario':
        return 'Scenario';
      case 'question':
        return 'Question';
      default:
        return 'Card';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Card Header */}
      <div className="flex items-center gap-3 mb-6">
        {getCardIcon()}
        <div className="flex-1">
          <span className="text-xs text-muted uppercase tracking-wider font-medium">
            {getCardTypeLabel()}
          </span>
          {card.minReadTime && card.minReadTime > 0 && (
            <span className="ml-2 text-xs px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full">
              <Timer className="w-3 h-3 inline mr-1" />
              {card.minReadTime}s review time
            </span>
          )}
          {card.category && (
            <span className="ml-2 text-xs px-2 py-1 bg-card border border-border rounded-full text-muted">
              {card.category}
            </span>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="training-card">
        {/* Card Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {card.title}
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            {card.content}
          </p>
        </div>

        {/* Options Section */}
        {card.options && card.options.length > 0 && (
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted mb-4 uppercase tracking-wider">
              Choose the best response:
            </p>
            <div className="space-y-3">
              {card.options.map((option) => {
                const isCorrectOption = card.correctOptionId === option.id;
                return (
                  <OptionButton
                    key={option.id}
                    option={option}
                    isSelected={selectedOptionId === option.id}
                    hasAnswered={hasAnswered}
                    isCorrectOption={isCorrectOption}
                    onClick={() => !hasAnswered && onSelectOption(option.id, isCorrectOption)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {hasAnswered && selectedOptionId && (
          <div className={`mt-6 p-6 rounded-xl border ${
            isCorrect 
              ? 'bg-green-500/5 border-green-500/20' 
              : 'bg-red-500/5 border-red-500/20'
          }`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${
                  isCorrect 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {isCorrect ? 'Correct!' : 'Not quite right'}
                </h3>
                {card.options?.find(o => o.id === selectedOptionId)?.explanation && (
                  <p className={`text-sm leading-relaxed ${
                    isCorrect 
                      ? 'text-green-400/80' 
                      : 'text-red-400/80'
                  }`}>
                    {card.options.find(o => o.id === selectedOptionId)?.explanation}
                  </p>
                )}
                
                {!isReviewingIncorrect && card.options?.find(o => o.id === selectedOptionId)?.explanation && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => setHasAcknowledged(!hasAcknowledged)}
                      className="flex items-start gap-3 text-left w-full group"
                    >
                      {hasAcknowledged ? (
                        <CheckSquare className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-5 h-5 text-muted flex-shrink-0 mt-0.5 group-hover:text-foreground transition-colors" />
                      )}
                      <span className={`text-sm ${
                        hasAcknowledged 
                          ? 'text-foreground' 
                          : 'text-muted'
                      }`}>
                        I have reviewed and understand this explanation
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reading Timer */}
        {card.type === 'info' && minReadTime > 0 && (
          timerBypass ? (
            <div className="mt-6 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center justify-center gap-2 text-yellow-500">
                <Timer className="w-5 h-5" />
                <span className="font-medium">Timer restrictions bypassed</span>
              </div>
            </div>
          ) : !canProceed && (
            <div className="mt-6 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center justify-center gap-2 text-yellow-500">
                <Timer className="w-5 h-5 animate-pulse" />
                <span className="font-medium">
                  Please review this material... ({Math.ceil(minReadTime - elapsedTime)}s remaining)
                </span>
              </div>
              <div className="mt-3 progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min((elapsedTime / minReadTime) * 100, 100)}%` }}
                />
              </div>
            </div>
          )
        )}

        {/* Action Button */}
        {(card.type === 'info' || hasAnswered) && (
          <div className="mt-6 pt-6 border-t border-border">
            {hasAnswered && !hasAcknowledged && !isReviewingIncorrect && card.options?.find(o => o.id === selectedOptionId)?.explanation && (
              <p className="text-sm text-yellow-500 mb-3 text-center">
                Please acknowledge the explanation above to continue
              </p>
            )}
            <button
              onClick={onNext}
              disabled={
                (card.type === 'info' && minReadTime > 0 && !canProceed) ||
                (hasAnswered && !hasAcknowledged && !isReviewingIncorrect && !!card.options?.find(o => o.id === selectedOptionId)?.explanation)
              }
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
                (card.type === 'info' && minReadTime > 0 && !canProceed) ||
                (hasAnswered && !hasAcknowledged && !isReviewingIncorrect && !!card.options?.find(o => o.id === selectedOptionId)?.explanation)
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLastCard ? 'Finish Training' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface OptionButtonProps {
  option: Option;
  isSelected: boolean;
  hasAnswered: boolean;
  isCorrectOption: boolean;
  onClick: () => void;
}

function OptionButton({ option, isSelected, hasAnswered, isCorrectOption, onClick }: OptionButtonProps) {
  const getButtonStyles = () => {
    if (!hasAnswered) {
      return isSelected
        ? 'border-blue-500 bg-blue-500/10'
        : 'border-gray-300 hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-white';
    }

    if (isCorrectOption) {
      return 'border-green-500 bg-green-500/10';
    }

    if (isSelected && !isCorrectOption) {
      return 'border-red-500 bg-red-500/10';
    }

    return 'border-gray-800 opacity-50';
  };

  const getIconStyles = () => {
    if (hasAnswered && isCorrectOption) {
      return 'border-green-500 text-green-500';
    }
    if (hasAnswered && isSelected && !isCorrectOption) {
      return 'border-red-500 text-red-500';
    }
    if (isSelected) {
      return 'border-blue-500 text-blue-500';
    }
    return 'border-gray-700 text-gray-500';
  };

  return (
    <button
      onClick={onClick}
      disabled={hasAnswered}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${getButtonStyles()}`}
    >
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-sm font-medium ${getIconStyles()}`}>
          {hasAnswered && isCorrectOption ? (
            <CheckCircle className="w-4 h-4" />
          ) : hasAnswered && isSelected && !isCorrectOption ? (
            <XCircle className="w-4 h-4" />
          ) : (
            option.id.split('-').pop()?.toUpperCase()
          )}
        </span>
        <span className="leading-relaxed text-current">
          {option.text}
        </span>
      </div>
    </button>
  );
}
