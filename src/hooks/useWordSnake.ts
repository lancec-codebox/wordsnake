import { useState, useCallback, useEffect, useRef } from 'react';
import { WordPair, WORD_BANK, generateRound } from '../data/words';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

export interface FoodItem {
  position: Position;
  word: WordPair;
  id: number;
}

const GRID_SIZE = 10;
const NUM_OPTIONS = 5;

const SPEED_MAP: Record<Difficulty, number> = {
  easy: 280,
  medium: 200,
  hard: 140,
};

let foodIdCounter = 0;

function getInitialSnake(): Position[] {
  const mid = Math.floor(GRID_SIZE / 2);
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
}

function getOccupiedPositions(snake: Position[], foods: FoodItem[]): Set<string> {
  const occupied = new Set<string>();
  snake.forEach(s => occupied.add(`${s.x},${s.y}`));
  foods.forEach(f => occupied.add(`${f.position.x},${f.position.y}`));
  return occupied;
}

function getRandomFreePosition(occupied: Set<string>): Position {
  const free: Position[] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y });
      }
    }
  }
  if (free.length === 0) return { x: 0, y: 0 };
  return free[Math.floor(Math.random() * free.length)];
}

function placeFoods(snake: Position[], options: WordPair[]): FoodItem[] {
  const occupied = getOccupiedPositions(snake, []);
  const foods: FoodItem[] = [];
  
  for (const word of options) {
    const pos = getRandomFreePosition(occupied);
    occupied.add(`${pos.x},${pos.y}`);
    foods.push({
      position: pos,
      word,
      id: foodIdCounter++,
    });
  }
  return foods;
}

export function useWordSnake() {
  const [snake, setSnake] = useState<Position[]>(getInitialSnake());
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [targetWord, setTargetWord] = useState<WordPair | null>(null);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('word-snake-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [wordsLearned, setWordsLearned] = useState<WordPair[]>([]);

  const directionRef = useRef<Direction>(direction);
  const gameStateRef = useRef<GameState>(gameState);
  const snakeRef = useRef<Position[]>(snake);
  const foodsRef = useRef<FoodItem[]>(foods);
  const targetRef = useRef<WordPair | null>(targetWord);
  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const streakRef = useRef(streak);
  const lastDirectionRef = useRef<Direction>(direction);

  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodsRef.current = foods; }, [foods]);
  useEffect(() => { targetRef.current = targetWord; }, [targetWord]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { streakRef.current = streak; }, [streak]);

  const startNewRound = useCallback((currentSnake: Position[]) => {
    const { target, options } = generateRound(NUM_OPTIONS);
    const newFoods = placeFoods(currentSnake, options);
    setTargetWord(target);
    setFoods(newFoods);
    setRound(r => r + 1);
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = getInitialSnake();
    setSnake(initialSnake);
    setDirection('RIGHT');
    setScore(0);
    setLives(3);
    setGameState('idle');
    setFeedback(null);
    setStreak(0);
    setRound(0);
    setWordsLearned([]);
    setFoods([]);
    setTargetWord(null);
  }, []);

  const startGame = useCallback(() => {
    const initialSnake = getInitialSnake();
    setSnake(initialSnake);
    setDirection('RIGHT');
    setScore(0);
    setLives(3);
    setFeedback(null);
    setStreak(0);
    setRound(0);
    setWordsLearned([]);
    
    const { target, options } = generateRound(NUM_OPTIONS);
    const newFoods = placeFoods(initialSnake, options);
    setTargetWord(target);
    setFoods(newFoods);
    setGameState('playing');
  }, []);

  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  const changeDirection = useCallback((newDir: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };
    if (opposites[newDir] !== lastDirectionRef.current) {
      setDirection(newDir);
    }
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    const currentScore = scoreRef.current;
    const savedHigh = parseInt(localStorage.getItem('word-snake-high-score') || '0', 10);
    if (currentScore > savedHigh) {
      localStorage.setItem('word-snake-high-score', currentScore.toString());
      setHighScore(currentScore);
    }
  }, []);

  const replaceWrongFood = useCallback((eatenFoodId: number, currentSnake: Position[], currentFoods: FoodItem[], targetZh: string | undefined) => {
    const remainingFoods = currentFoods.filter(f => f.id !== eatenFoodId);
    const occupied = getOccupiedPositions(currentSnake, remainingFoods);
    const usedZh = new Set([...remainingFoods.map(f => f.word.zh)]);
    if (targetZh) usedZh.add(targetZh);
    const available = WORD_BANK.filter(w => !usedZh.has(w.zh));
    
    if (available.length > 0) {
      const newWord = available[Math.floor(Math.random() * available.length)];
      const pos = getRandomFreePosition(occupied);
      remainingFoods.push({
        position: pos,
        word: newWord,
        id: foodIdCounter++,
      });
    }
    return remainingFoods;
  }, []);

  const moveSnake = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    const currentSnake = snakeRef.current;
    const currentFoods = foodsRef.current;
    const currentDirection = directionRef.current;
    const currentTarget = targetRef.current;
    const head = currentSnake[0];

    let newHead: Position;
    switch (currentDirection) {
      case 'UP':
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case 'DOWN':
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case 'LEFT':
        newHead = { x: head.x - 1, y: head.y };
        break;
      case 'RIGHT':
        newHead = { x: head.x + 1, y: head.y };
        break;
    }

    lastDirectionRef.current = currentDirection;

    // Check wall collision
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      handleGameOver();
      return;
    }

    // Check self collision
    if (currentSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
      handleGameOver();
      return;
    }

    // Check food collision
    const eatenFood = currentFoods.find(f => f.position.x === newHead.x && f.position.y === newHead.y);

    if (eatenFood) {
      const isCorrect = currentTarget && eatenFood.word.zh === currentTarget.zh;
      
      if (isCorrect) {
        // Correct answer - grow snake, add score, new round
        const newSnake = [newHead, ...currentSnake];
        setSnake(newSnake);
        const currentStreak = streakRef.current;
        const bonus = currentStreak >= 3 ? 2 : 1;
        setScore(s => s + 10 * bonus);
        setStreak(s => s + 1);
        setWordsLearned(prev => [...prev, currentTarget!]);
        setFeedback('correct');
        setTimeout(() => setFeedback(null), 500);
        
        // Start new round after brief delay
        setTimeout(() => {
          startNewRound(newSnake);
        }, 300);
      } else {
        // Wrong answer - lose a life, don't grow
        const newSnake = [newHead, ...currentSnake];
        newSnake.pop(); // Don't grow
        setSnake(newSnake);
        setStreak(0);
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 500);
        
        const newLives = livesRef.current - 1;
        setLives(newLives);
        
        if (newLives <= 0) {
          handleGameOver();
          return;
        }
        
        // Replace wrong food with a new random word
        const updatedFoods = replaceWrongFood(eatenFood.id, newSnake, currentFoods, currentTarget?.zh);
        setFoods(updatedFoods);
      }
    } else {
      // No food eaten, just move
      const newSnake = [newHead, ...currentSnake];
      newSnake.pop();
      setSnake(newSnake);
    }
  }, [handleGameOver, startNewRound, replaceWrongFood]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(moveSnake, SPEED_MAP[difficulty]);
    return () => clearInterval(interval);
  }, [gameState, difficulty, moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          if (gameStateRef.current === 'idle' || gameStateRef.current === 'gameover') {
            startGame();
          } else {
            togglePause();
          }
          break;
        case 'Escape':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, startGame, togglePause]);

  return {
    snake,
    foods,
    targetWord,
    direction,
    gameState,
    score,
    lives,
    highScore,
    difficulty,
    round,
    feedback,
    streak,
    wordsLearned,
    gridSize: GRID_SIZE,
    setDifficulty,
    startGame,
    togglePause,
    resetGame,
    changeDirection,
  };
}
