"use client";

import { CheckCircle, XCircle, Trophy, Target, ChevronLeft, ArrowLeft } from 'lucide-react';

interface ProgressTrackerProps {
  score: number;
  totalAttempts: number;
  correctAttempts: number;
  incorrectCount?: number;
  currentCardIndex: number;
  totalCards: number;
  pathName: string;
  onReset: () => void;
  onBack: () => void;
  isReviewingIncorrect?: boolean;
}

export function ProgressTracker({
  score,
  totalAttempts,
  correctAttempts,
  incorrectCount,
  currentCardIndex,
  totalCards,
  pathName,
  onReset,
  onBack,
  isReviewingIncorrect = false,
}: ProgressTrackerProps) {
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const progress = ((currentCardIndex + 1) / totalCards) * 100;
  const incorrectValue = typeof incorrectCount === "number" ? incorrectCount : (totalAttempts - correctAttempts);
  const incorrectSubtext = typeof incorrectCount === "number" ? "questions" : "answers";

  return (
    <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="nav-link flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isReviewingIncorrect ? 'Exit Review' : 'Back to Paths'}</span>
          </button>
          
          <span className="text-xs text-muted uppercase tracking-wider">{pathName}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Trophy className="w-4 h-4 text-yellow-500" />}
            label="Score"
            value={score.toString()}
            subtext="points"
          />
          <StatCard
            icon={<Target className="w-4 h-4 text-accent" />}
            label="Accuracy"
            value={`${accuracy}%`}
            subtext={`${correctAttempts}/${totalAttempts} correct`}
          />
          <StatCard
            icon={<CheckCircle className="w-4 h-4 text-green-500" />}
            label="Correct"
            value={correctAttempts.toString()}
            subtext="answers"
          />
          <StatCard
            icon={<XCircle className="w-4 h-4 text-red-500" />}
            label="Incorrect"
            value={incorrectValue.toString()}
            subtext={incorrectSubtext}
          />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Progress</span>
            <span className="text-foreground font-medium">
              Card {currentCardIndex + 1} of {totalCards}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}

function StatCard({ icon, label, value, subtext }: StatCardProps) {
  return (
    <div className="bg-background/50 rounded-xl p-3 border border-border">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted">{subtext}</span>
      </div>
    </div>
  );
}
