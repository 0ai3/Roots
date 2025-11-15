import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Clock, Target, Flame, Zap } from 'lucide-react';
import QuizGame from '../components/games/QuizGame';
import { QuizConfig } from '../services/geminiQuizService';

interface GameCard {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: string;
  icon: React.ElementType;
  config: QuizConfig;
  timeLimit?: number;
}

const games: GameCard[] = [
  {
    id: 'cultural',
    title: 'Cultural Quiz',
    description: 'Answer questions about world cultures and traditions',
    difficulty: 'medium',
    points: '50-200 pts',
    icon: Star,
    config: { type: 'cultural', difficulty: 'medium', questionCount: 10 }
  },
  {
    id: 'geography',
    title: 'Geography Master',
    description: 'Identify countries, capitals, and landmarks',
    difficulty: 'easy',
    points: '30-150 pts',
    icon: Target,
    config: { type: 'geography', difficulty: 'easy', questionCount: 10 }
  },
  {
    id: 'tradition',
    title: 'Tradition Matcher',
    description: 'Match cultural practices to their origins',
    difficulty: 'hard',
    points: '100-300 pts',
    icon: Flame,
    config: { type: 'tradition', difficulty: 'hard', questionCount: 8 }
  },
  {
    id: 'language',
    title: 'Language Challenge',
    description: 'Learn basic phrases from different languages',
    difficulty: 'medium',
    points: '75-250 pts',
    icon: Trophy,
    config: { type: 'language', difficulty: 'medium', questionCount: 10 }
  },
  {
    id: 'history',
    title: 'History Timeline',
    description: 'Arrange historical events in correct order',
    difficulty: 'hard',
    points: '150-400 pts',
    icon: Clock,
    config: { type: 'history', difficulty: 'hard', questionCount: 8 }
  },
  {
    id: 'speed',
    title: 'Speed Round',
    description: 'Quick-fire questions with time pressure',
    difficulty: 'easy',
    points: '20-100 pts',
    icon: Zap,
    config: { type: 'speed', difficulty: 'easy', questionCount: 15 },
    timeLimit: 15
  }
];

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<GameCard | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState({ correct: 0, points: 0, total: 0 });

  const handleGameComplete = (correct: number, points: number) => {
    setFinalScore({ correct, points, total: selectedGame?.config.questionCount || 0 });
    setShowResults(true);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
    setShowResults(false);
    setFinalScore({ correct: 0, points: 0, total: 0 });
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  };

  if (showResults) {
    const percentage = (finalScore.correct / finalScore.total) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
            <p className="text-gray-600 mb-8">Great job on completing {selectedGame?.title}!</p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
                <p className="text-2xl font-bold text-blue-600">
                  {finalScore.correct}/{finalScore.total}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Points Earned</p>
                <p className="text-2xl font-bold text-green-600">{finalScore.points}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-purple-600">{percentage.toFixed(0)}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowResults(false);
                  // Keep selectedGame to replay
                }}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={handleBackToMenu}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Games
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (selectedGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedGame.title}</h1>
            <p className="text-gray-600">{selectedGame.description}</p>
          </div>
          
          <QuizGame
            config={selectedGame.config}
            onComplete={handleGameComplete}
            onBack={handleBackToMenu}
            timeLimit={selectedGame.timeLimit}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cultural Games</h1>
          <p className="text-xl text-gray-600">Test your knowledge and earn points!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => {
            const Icon = game.icon;
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[game.difficulty]}`}>
                      {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{game.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{game.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-primary-600">{game.points}</span>
                    {game.timeLimit && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {game.timeLimit}s per question
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setSelectedGame(game)}
                    className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Play Now
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
