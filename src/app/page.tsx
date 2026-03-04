"use client";

import { useState, useEffect } from "react";
import { useTraining } from "@/hooks/useTraining";
import { PathSelector } from "@/components/path-selector";
import { TrainingCard } from "@/components/training-card";
import { ProgressTracker } from "@/components/progress-tracker";
import { NavSidebar } from "@/components/nav-sidebar";
import { IncorrectQuestionsModal } from "@/components/incorrect-questions-modal";
import { Trophy, RotateCcw, CheckCircle, Target, Menu, XCircle } from "lucide-react";

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isIncorrectModalOpen, setIsIncorrectModalOpen] = useState(false);
  const [timerBypass, setTimerBypass] = useState(false);
  const [isReviewingIncorrect, setIsReviewingIncorrect] = useState(false);
  const [reviewQueue, setReviewQueue] = useState<string[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [resumeCardId, setResumeCardId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const {
    progress,
    currentResponse,
    hasAnswered,
    talkPaths,
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
  } = useTraining();

  const currentCard = getCurrentCard();
  const currentPath = getCurrentPath();

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading state until mounted to prevent hydration errors
  if (!isMounted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  // Show path selector if no path is active
  if (!currentPath || !currentCard) {
    return (
      <main className="min-h-screen py-12 px-4">
        <PathSelector
          paths={talkPaths}
          currentPathId={progress.currentPathId}
          completedCards={progress.completedCards}
          onSelectPath={startPath}
          getPathProgress={getPathProgress}
        />
      </main>
    );
  }

  const currentPathProgress = getPathProgress(currentPath.id);
  const currentCardIndex = currentPath.cards.findIndex(c => c.id === currentCard.id);
  const isLastCard = !currentCard.nextCardId;
  
  // Count ALL cards in the path for completion (not just interactive ones)
  const totalCards = currentPath.cards.length;
  const completedCards = currentPathProgress.completedCards.filter(id => 
    currentPath.cards.some(c => c.id === id)
  ).length;
  
  // Also track interactive cards for scoring/display purposes
  const interactiveCards = currentPath.cards.filter(c => c.type !== 'info');
  const totalQuestions = interactiveCards.length;
  const completedQuestions = currentPathProgress.completedCards.filter(id => 
    interactiveCards.some(c => c.id === id)
  ).length;

  const incorrectAnswersForPath = getIncorrectAnswersForPath(currentPath.id);
  const uniqueIncorrectCount = (() => {
    const latestByCardId = new Map<string, { timestamp: number }>();
    for (const ia of incorrectAnswersForPath) {
      const existing = latestByCardId.get(ia.cardId);
      if (!existing || ia.timestamp > existing.timestamp) {
        latestByCardId.set(ia.cardId, { timestamp: ia.timestamp });
      }
    }
    return latestByCardId.size;
  })();

  // Check if path is completed - show completion when ALL cards are completed
  // This includes both info cards and interactive questions
  const isPathCompleted = !isReviewingIncorrect && (completedCards === totalCards || reviewCompleted);

  if (isPathCompleted) {
    const accuracy = progress.totalAttempts > 0 
      ? Math.round((progress.correctAttempts / progress.totalAttempts) * 100) 
      : 0;

    return (
      <main className="min-h-screen py-12 px-4">
        {/* Top Right Buttons */}
        <div className="fixed top-20 right-4 z-40 flex items-center gap-2">
          {/* Incorrect Button */}
          <button
            onClick={() => setIsIncorrectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
          >
            <XCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Incorrect</span>
          </button>

          {/* Nav Toggle Button */}
          <button
            onClick={() => setIsNavOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm font-medium">Nav</span>
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Training Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Great job completing <span className="font-semibold">{currentPath.name}</span>
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {accuracy}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Accuracy</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progress.correctAttempts}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Correct</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progress.score}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Points</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setReviewCompleted(false);
                  resetPath();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Restart Training
              </button>
              <button
                onClick={() => {
                  setReviewCompleted(false);
                  startPath('');
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors"
              >
                Back to Paths
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar */}
        <NavSidebar
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
          cards={currentPath.cards}
          currentCardId={currentCard.id}
          completedCards={currentPathProgress.completedCards}
          onJumpToCard={(cardId) => {
            if (isReviewingIncorrect && !reviewQueue.includes(cardId)) {
              setIsReviewingIncorrect(false);
              setReviewQueue([]);
              setCurrentReviewIndex(0);
              setReviewCompleted(false);
              setResumeCardId(null);
            }
            resetAnswerState();
            jumpToCard(cardId);
          }}
          onRestart={restartPath}
          pathName={currentPath.name}
          timerBypass={timerBypass}
          onToggleTimerBypass={() => setTimerBypass(!timerBypass)}
          isReviewMode={isReviewingIncorrect}
        />

        {/* Incorrect Questions Modal */}
        <IncorrectQuestionsModal
          isOpen={isIncorrectModalOpen}
          onClose={() => setIsIncorrectModalOpen(false)}
          incorrectAnswers={getIncorrectAnswersForPath(currentPath.id)}
          onJumpToQuestion={(cardId) => {
            const incorrectAnswers = getIncorrectAnswersForPath(currentPath.id);
            const incorrectCardIdSet = new Set(incorrectAnswers.map(ia => ia.cardId));
            const queue = currentPath.cards
              .filter(c => incorrectCardIdSet.has(c.id))
              .map(c => c.id);
            if (queue.length === 0) return;

            const index = queue.indexOf(cardId);
            setResumeCardId(currentCard.id);
            setIsReviewingIncorrect(true);
            setReviewCompleted(false);
            setReviewQueue(queue);
            setCurrentReviewIndex(index >= 0 ? index : 0);
            resetAnswerState();
            jumpToCard(index >= 0 ? queue[index] : queue[0]);
          }}
          onRetryAll={() => {
            const incorrectAnswers = getIncorrectAnswersForPath(currentPath.id);
            const incorrectCardIdSet = new Set(incorrectAnswers.map(ia => ia.cardId));
            const queue = currentPath.cards
              .filter(c => incorrectCardIdSet.has(c.id))
              .map(c => c.id);
            if (queue.length === 0) return;

            setResumeCardId(currentCard.id);
            setIsReviewingIncorrect(true);
            setReviewCompleted(false);
            setReviewQueue(queue);
            setCurrentReviewIndex(0);
            resetAnswerState();
            jumpToCard(queue[0]);
            setIsIncorrectModalOpen(false);
          }}
          pathName={currentPath.name}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Top Right Buttons */}
      <div className="fixed top-20 right-4 z-40 flex items-center gap-2">
        {/* Incorrect Button */}
        <button
          onClick={() => setIsIncorrectModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
        >
          <XCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Incorrect</span>
        </button>

        {/* Nav Toggle Button */}
        <button
          onClick={() => setIsNavOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Menu className="w-5 h-5" />
          <span className="text-sm font-medium">Nav</span>
        </button>
      </div>

      <ProgressTracker
        score={progress.score}
        totalAttempts={progress.totalAttempts}
        correctAttempts={progress.correctAttempts}
        incorrectCount={uniqueIncorrectCount}
        currentCardIndex={isReviewingIncorrect ? currentReviewIndex : currentCardIndex}
        totalCards={isReviewingIncorrect ? reviewQueue.length : totalCards}
        pathName={currentPath.name}
        onReset={resetPath}
        onBack={() => {
           if (isReviewingIncorrect) {
             // Exit review mode and resume where you left off
             setIsReviewingIncorrect(false);
             setReviewQueue([]);
             setCurrentReviewIndex(0);
             setReviewCompleted(false);
             resetAnswerState();
             if (resumeCardId) {
               jumpToCard(resumeCardId);
             }
             setResumeCardId(null);
           } else {
             setReviewCompleted(false);
             startPath('');
           }
         }}
        isReviewingIncorrect={isReviewingIncorrect}
      />

      <div className="py-8 px-4">
        <TrainingCard
          card={currentCard}
          hasAnswered={hasAnswered}
          selectedOptionId={currentResponse?.selectedOptionId}
          isCorrect={currentResponse?.isCorrect}
          onSelectOption={(optionId, isCorrect) => {
            if (isReviewingIncorrect) {
              // In review mode, track locally without affecting totals
              setReviewResponse({
                cardId: currentCard.id,
                selectedOptionId: optionId,
                isCorrect: isCorrect,
                timestamp: Date.now(),
              });
              return;
            }
            const selectedOption = currentCard.options?.find(o => o.id === optionId);
            submitAnswer(
              currentCard.id, 
              optionId, 
              isCorrect,
              currentCard.title,
              selectedOption?.text,
              currentCard.correctOptionId
            );
          }}
           onNext={() => {
             if (isReviewingIncorrect) {
               // In review mode, navigate through incorrect questions only
               const nextIndex = currentReviewIndex + 1;
               if (nextIndex < reviewQueue.length) {
                 setCurrentReviewIndex(nextIndex);
                 resetAnswerState();
                 jumpToCard(reviewQueue[nextIndex]);
               } else {
                 // Review finished: resume normal progress (do NOT show completion)
                 setIsReviewingIncorrect(false);
                 setReviewQueue([]);
                 setCurrentReviewIndex(0);
                 setReviewCompleted(false);
                 resetAnswerState();
                 if (resumeCardId) {
                   jumpToCard(resumeCardId);
                 }
                 setResumeCardId(null);
               }
               return;
             }
             nextCard();
           }}
          isLastCard={isReviewingIncorrect ? currentReviewIndex === reviewQueue.length - 1 : isLastCard}
          timerBypass={timerBypass}
          isReviewingIncorrect={isReviewingIncorrect}
        />
      </div>

      {/* Navigation Sidebar */}
      <NavSidebar
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        cards={currentPath.cards}
        currentCardId={currentCard.id}
        completedCards={currentPathProgress.completedCards}
        onJumpToCard={(cardId) => {
          // If jumping to a card not in the review queue during review mode, exit review mode
          if (isReviewingIncorrect && !reviewQueue.includes(cardId)) {
            setIsReviewingIncorrect(false);
            setReviewQueue([]);
            setCurrentReviewIndex(0);
            setReviewCompleted(false);
            setResumeCardId(null);
          }
          resetAnswerState();
          jumpToCard(cardId);
        }}
        onRestart={restartPath}
        pathName={currentPath.name}
        timerBypass={timerBypass}
        onToggleTimerBypass={() => setTimerBypass(!timerBypass)}
        isReviewMode={isReviewingIncorrect}
      />

      {/* Incorrect Questions Modal */}
      <IncorrectQuestionsModal
        isOpen={isIncorrectModalOpen}
        onClose={() => setIsIncorrectModalOpen(false)}
        incorrectAnswers={getIncorrectAnswersForPath(currentPath.id)}
         onJumpToQuestion={(cardId) => {
           const incorrectAnswers = getIncorrectAnswersForPath(currentPath.id);
           const incorrectCardIdSet = new Set(incorrectAnswers.map(ia => ia.cardId));
           const queue = currentPath.cards
             .filter(c => incorrectCardIdSet.has(c.id))
             .map(c => c.id);
           if (queue.length === 0) return;

           const index = queue.indexOf(cardId);
           setResumeCardId(currentCard.id);
           setIsReviewingIncorrect(true);
           setReviewCompleted(false);
           setReviewQueue(queue);
           setCurrentReviewIndex(index >= 0 ? index : 0);
           resetAnswerState();
           jumpToCard(index >= 0 ? queue[index] : queue[0]);
         }}
         onRetryAll={() => {
           const incorrectAnswers = getIncorrectAnswersForPath(currentPath.id);
           const incorrectCardIdSet = new Set(incorrectAnswers.map(ia => ia.cardId));
           const queue = currentPath.cards
             .filter(c => incorrectCardIdSet.has(c.id))
             .map(c => c.id);
           if (queue.length === 0) return;

           setResumeCardId(currentCard.id);
           setIsReviewingIncorrect(true);
           setReviewCompleted(false);
           setReviewQueue(queue);
           setCurrentReviewIndex(0);
           resetAnswerState();
           jumpToCard(queue[0]);
           setIsIncorrectModalOpen(false);
         }}
        pathName={currentPath.name}
      />
    </main>
  );
}
