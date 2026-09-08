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
  easy: 420,
  medium: 300,
  hard: 200,
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

function getDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function placeFoods(snake: Position[], options: WordPair[]): FoodItem[] {
  const snakeSet = new Set(snake.map(s => `${s.x},${s.y}`));
  const allCells: Position[] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!snakeSet.has(`${x},${y}`)) {
        allCells.push({ x, y });
      }
    }
  }

  // Shuffle cells for randomness
  for (let i = allCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
  }

  // Minimum Manhattan distance between food items
  const MIN_DISTANCE = 3;
  const foods: FoodItem[] = [];
  const placed: Position[] = [];

  for (const word of options) {
    let bestPos: Position | null = null;
    let bestMinDist = -1;

    // Try to find a cell that's far enough from all placed foods
    for (const cell of allCells) {
      if (foods.some(f => f.position.x === cell.x && f.position.y === cell.y)) continue;

      const minDist = placed.length === 0
        ? Infinity
        : Math.min(...placed.map(p => getDistance(cell, p)));

      if (minDist >= MIN_DISTANCE && (bestPos === null || minDist > bestMinDist)) {
        bestPos = cell;
        bestMinDist = minDist;
      }
    }

    // Fallback: if no cell meets minimum distance, pick the one with max min-distance
    if (!bestPos) {
      for (const cell of allCells) {
        if (foods.some(f => f.position.x === cell.x && f.position.y === cell.y)) continue;
        const minDist = placed.length === 0
          ? Infinity
          : Math.min(...placed.map(p => getDistance(cell, p)));
        if (minDist > bestMinDist) {
          bestPos = cell;
          bestMinDist = minDist;
        }
      }
    }

    if (bestPos) {
      placed.push(bestPos);
      foods.push({
        position: bestPos,
        word,
        id: foodIdCounter++,
      });
    }
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
    const usedZh = new Set([...remainingFoods.map(f => f.word.zh)]);
    if (targetZh) usedZh.add(targetZh);
    const available = WORD_BANK.filter(w => !usedZh.has(w.zh));
    
    if (available.length > 0) {
      const newWord = available[Math.floor(Math.random() * available.length)];
      // Find a free cell far from other foods
      const occupiedSet = new Set([
        ...currentSnake.map(s => `${s.x},${s.y}`),
        ...remainingFoods.map(f => `${f.position.x},${f.position.y}`),
      ]);
      const freeCells: Position[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          if (!occupiedSet.has(`${x},${y}`)) {
            freeCells.push({ x, y });
          }
        }
      }
      if (freeCells.length > 0) {
        // Pick the cell furthest from existing foods
        let bestPos = freeCells[0];
        let bestDist = -1;
        for (const cell of freeCells) {
          const minDist = remainingFoods.length === 0
            ? Infinity
            : Math.min(...remainingFoods.map(f => getDistance(cell, f.position)));
          if (minDist > bestDist) {
            bestDist = minDist;
            bestPos = cell;
          }
        }
        remainingFoods.push({
          position: bestPos,
          word: newWord,
          id: foodIdCounter++,
        });
      }
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

    // Wrap around edges (toroidal board)
    newHead = {
      x: ((newHead.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
      y: ((newHead.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
    };

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
