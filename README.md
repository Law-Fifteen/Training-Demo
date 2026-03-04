> **⚠️ IMPORTANT:** In this directory you will find the Next.js training application. Please use this directory as the working directory for any operations related to this project.

# Training Cards Application

An interactive training platform built with Next.js, Tailwind CSS, and TanStack Query.

## Features

- **Card-Based Learning**: Navigate through conversation scenarios with flashcard-style interactions
- **Talk Paths**: Structured training paths with multiple cards and branching scenarios
- **Dark Mode**: Automatic system preference detection with manual toggle
- **Progress Tracking**: Real-time score, accuracy, and completion tracking
- **Visual Feedback**: Green highlighting for correct answers, red for incorrect

## Tech Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- next-themes (dark mode)
- Lucide React (icons)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
  app/              # Next.js app router
  components/       # React components
  data/            # Training data/talk paths
  hooks/           # Custom React hooks
  lib/             # Utility functions
  types/           # TypeScript types
```

## Adding New Talk Paths

Edit `src/data/talkPaths.ts` to add new training scenarios. Each path contains:
- Info cards (instructional content)
- Scenario cards (interactive situations with multiple choice)
- Question cards (knowledge checks)

Each scenario card can have multiple options with correct/incorrect designations and explanations.
