import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { generateQuiz, QuizQuestion, QuizConfig } from '../../services/geminiQuizService';

interface QuizGameProps {
  config: QuizConfig;
  onComplete: (score: number, totalPoints: number) => void;
  onBack: () => void;
  timeLimit?: number; // seconds per question, optional
}

export default function QuizGame({ config, onComplete, onBack, timeLimit }: QuizGameProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);
  const [gameStarted, setGameStarted] = useState(false);

  const loadQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const generatedQuestions = await generateQuiz(config);
      setQuestions(generatedQuestions);
      setGameStarted(true);
      if (timeLimit) setTimeLeft(timeLimit);
    } catch {
      alert('Failed to load quiz. Please try again.');
      onBack();
    } finally {
      setLoading(false);
    }
  }, [config, timeLimit, onBack]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  useEffect(() => {
    if (gameStarted && timeLimit && timeLeft > 0 && !showExplanation) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted && !showExplanation && timeLimit) {
      handleTimeout();
    }
  }, [timeLeft, gameStarted, showExplanation, timeLimit]);

  const handleTimeout = () => {
    setShowExplanation(true);
    setSelectedAnswer(-1); // Mark as timed out
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showExplanation) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      const points = questions[currentQuestion].points;
      setScore(score + 1);
      setTotalPoints(totalPoints + points);
    }
    
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      if (timeLimit) setTimeLeft(timeLimit);
    } else {
      onComplete(score + (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0), 
                 totalPoints + (selectedAnswer === questions[currentQuestion].correctAnswer ? questions[currentQuestion].points : 0));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Generating your quiz...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isCorrect = selectedAnswer === currentQ.correctAnswer;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span className="font-semibold text-primary-600">{totalPoints} pts</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Timer */}
      {timeLimit && (
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
          <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-600'}`} />
          <span className={`font-mono text-lg font-semibold ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-900'}`}>
            {timeLeft}s
          </span>
        </div>
      )}

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQ.question}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === currentQ.correctAnswer;
              const showResult = showExplanation;

              let buttonClass = 'w-full p-4 text-left rounded-lg border-2 transition-all ';
              
              if (!showResult) {
                buttonClass += isSelected 
                  ? 'border-primary-600 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-white';
              } else {
                if (isCorrectAnswer) {
                  buttonClass += 'border-green-500 bg-green-50';
                } else if (isSelected && !isCorrect) {
                  buttonClass += 'border-red-500 bg-red-50';
                } else {
                  buttonClass += 'border-gray-200 bg-gray-50';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showResult && isCorrectAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && currentQ.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <p className="text-sm text-blue-900">
                <strong>Explanation:</strong> {currentQ.explanation}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next Button */}
      {showExplanation && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleNext}
          className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          {currentQuestion + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}
        </motion.button>
      )}

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full mt-3 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
      >
        Exit Quiz
      </button>
    </div>
  );
}
