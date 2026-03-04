"use client";

import { TalkPath } from '@/types/training';
import { BookOpen, ChevronRight, Award, Clock, BarChart3, RotateCcw, ArrowRight } from 'lucide-react';

interface PathSelectorProps {
  paths: TalkPath[];
  currentPathId: string | null;
  completedCards: string[];
  onSelectPath: (pathId: string, restart?: boolean) => void;
  getPathProgress: (pathId: string) => { completedCards: string[]; currentCardIndex: number };
}

export function PathSelector({ paths, currentPathId, completedCards, onSelectPath, getPathProgress }: PathSelectorProps) {
  const completedPaths = paths.filter(path => {
    const progress = getPathProgress(path.id);
    const totalCards = path.cards.length;
    const completedCount = progress.completedCards.filter(id =>
      path.cards.some(c => c.id === id)
    ).length;
    return totalCards > 0 && completedCount === totalCards;
  }).length;

  const totalPaths = paths.length;
  const overallProgress = Math.round((completedPaths / totalPaths) * 100);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Law Nine</span>
            <br />
            <span className="text-foreground">Sales Methodology</span>
          </h1>
          
          <p className="text-xl text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Master the art of sales through proven methodologies.
            <br />
            Complete training paths to earn certifications.
          </p>

          {/* Overall Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted">Overall Progress</span>
              <span className="text-foreground font-medium">{completedPaths} of {totalPaths} completed</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider max-w-5xl mx-auto" />

      {/* Training Paths Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Training Paths</h2>
            <span className="text-sm text-muted">{paths.length} paths available</span>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {paths.map((path, index) => {
              const progress = getPathProgress(path.id);
              const totalCards = path.cards.length;
              const completedCount = progress.completedCards.filter(id =>
                path.cards.some(c => c.id === id)
              ).length;
              const progressPercentage = totalCards > 0 ? Math.round((completedCount / totalCards) * 100) : 0;
              const isCompleted = totalCards > 0 && completedCount === totalCards;
              const isInProgress = completedCount > 0 && !isCompleted;
              const isCurrentPath = currentPathId === path.id;

              return (
                <div
                  key={path.id}
                  className={`training-card card-hover cursor-pointer ${
                    isCurrentPath ? 'ring-2 ring-accent' : ''
                  }`}
                  onClick={() => onSelectPath(path.id)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <span className="badge badge-completed">
                          <Award className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      )}
                      {isInProgress && (
                        <span className="badge badge-in-progress">
                          <Clock className="w-3 h-3 mr-1" />
                          In Progress
                        </span>
                      )}
                      {!isCompleted && !isInProgress && (
                        <span className="badge bg-card border border-border text-muted">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Not Started
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted uppercase tracking-wider">{path.category}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                    {path.name.includes(': ') ? (
                      <>
                        {path.name.split(': ')[0]}
                        <span className="text-muted">: {path.name.split(': ')[1]}</span>
                      </>
                    ) : (
                      path.name
                    )}
                  </h3>

                  {/* Description */}
                  <p className="text-muted text-sm mb-6 line-clamp-2">
                    {path.description}
                  </p>

                  {/* Progress */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        Progress
                      </span>
                      <span className="text-foreground font-medium">
                        {completedCount}/{totalCards}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  {isInProgress ? (
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPath(path.id, false);
                        }}
                        className="btn-primary flex-1 text-sm"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to restart? Your progress will be reset.')) {
                            onSelectPath(path.id, true);
                          }
                        }}
                        className="btn-secondary px-4"
                        title="Restart"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button className="btn-primary w-full text-sm">
                      {isCompleted ? 'Review Training' : 'Start Training'}
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
