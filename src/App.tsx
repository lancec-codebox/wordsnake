import { useRef, useCallback, useEffect, useState } from 'react';
import { useSnakeGame, Direction, Difficulty } from './hooks/useSnakeGame';

function App() {
  const {
    snake,
    food,
    gameState,
    score,
    highScore,
    difficulty,
    justAte,
    gridSize,
    setDifficulty,
    startGame,
    togglePause,
    resetGame,
    changeDirection,
  } = useSnakeGame();

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [showNewHighScore, setShowNewHighScore] = useState(false);

  // Check for new high score
  useEffect(() => {
    if (gameState === 'gameover' && score > 0 && score >= highScore) {
      setShowNewHighScore(true);
      setTimeout(() => setShowNewHighScore(false), 3000);
    }
  }, [gameState, score, highScore]);

  // Touch controls (swipe)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minSwipe = 30;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      changeDirection(dy > 0 ? 'DOWN' : 'UP');
    }
    touchStartRef.current = null;
  }, [changeDirection]);

  const handleDirectionButton = useCallback((dir: Direction) => {
    if (gameState === 'playing') {
      changeDirection(dir);
    }
  }, [gameState, changeDirection]);

  const getCellContent = (x: number, y: number) => {
    const isHead = snake[0].x === x && snake[0].y === y;
    const isBody = snake.slice(1).some(s => s.x === x && s.y === y);
    const isFood = food.x === x && food.y === y;

    if (isHead) {
      return (
        <div className="w-full h-full rounded-md bg-emerald-400 shadow-lg shadow-emerald-400/50 transition-all duration-100 scale-105" />
      );
    }
    if (isBody) {
      const index = snake.findIndex(s => s.x === x && s.y === y);
      const opacity = Math.max(0.4, 1 - (index / snake.length) * 0.6);
      return (
        <div
          className="w-full h-full rounded-sm bg-emerald-500 transition-all duration-75"
          style={{ opacity }}
        />
      );
    }
    if (isFood) {
      return (
        <div className="w-full h-full flex items-center justify-center animate-pulse">
          <div className="w-3/4 h-3/4 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-bounce" />
        </div>
      );
    }
    return null;
  };

  const difficulties: { label: string; value: Difficulty; color: string }[] = [
    { label: 'Easy', value: 'easy', color: 'bg-green-500' },
    { label: 'Medium', value: 'medium', color: 'bg-yellow-500' },
    { label: 'Hard', value: 'hard', color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 select-none overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-lg mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-white mb-2 tracking-tight">
          <span className="text-emerald-400">🐍</span> Snake Game
        </h1>

        {/* Score Board */}
        <div className="flex justify-between items-center mb-3">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Score</div>
            <div className={`text-2xl font-bold text-white transition-all duration-200 ${justAte ? 'scale-125 text-emerald-400' : ''}`}>
              {score}
            </div>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Best</div>
            <div className="text-2xl font-bold text-amber-400">
              {highScore}
            </div>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="flex gap-2 justify-center mb-3">
          {difficulties.map(d => (
            <button
              key={d.value}
              onClick={() => {
                setDifficulty(d.value);
                if (gameState === 'idle' || gameState === 'gameover') {
                  resetGame();
                }
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                difficulty === d.value
                  ? `${d.color} text-white shadow-lg scale-105`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          {gameState === 'idle' && (
            <button
              onClick={startGame}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-emerald-500/30"
            >
              ▶ Start Game
            </button>
          )}
          {gameState === 'playing' && (
            <button
              onClick={togglePause}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-amber-500/30"
            >
              ⏸ Pause
            </button>
          )}
          {gameState === 'paused' && (
            <>
              <button
                onClick={togglePause}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-emerald-500/30"
              >
                ▶ Resume
              </button>
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              >
                ↺ Restart
              </button>
            </>
          )}
          {gameState === 'gameover' && (
            <>
              <button
                onClick={startGame}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-emerald-500/30"
              >
                ↺ Play Again
              </button>
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              >
                Menu
              </button>
            </>
          )}
        </div>
      </div>

      {/* Game Board */}
      <div
        ref={boardRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border-2 border-gray-700 p-1 shadow-2xl shadow-black/50"
      >
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            width: 'min(80vw, 400px)',
            height: 'min(80vw, 400px)',
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const isCheckerDark = (x + y) % 2 === 0;
            return (
              <div
                key={i}
                className={`aspect-square ${isCheckerDark ? 'bg-gray-800/40' : 'bg-gray-800/20'} rounded-sm`}
              >
                {getCellContent(x, y)}
              </div>
            );
          })}
        </div>

        {/* Overlay States */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
            <div className="text-6xl mb-4 animate-bounce">🐍</div>
            <p className="text-white text-lg font-semibold mb-2">Ready to Play!</p>
            <p className="text-gray-300 text-sm">Press Start or Spacebar</p>
            <p className="text-gray-400 text-xs mt-2">Use Arrow Keys / WASD / Swipe</p>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
            <div className="text-5xl mb-4">⏸️</div>
            <p className="text-white text-xl font-bold mb-2">Paused</p>
            <p className="text-gray-300 text-sm">Press Space or Resume to continue</p>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl">
            <div className="text-5xl mb-3">💀</div>
            <p className="text-white text-xl font-bold mb-1">Game Over!</p>
            <p className="text-emerald-400 text-2xl font-bold mb-1">Score: {score}</p>
            {showNewHighScore && (
              <p className="text-amber-400 text-sm font-bold animate-pulse">
                🏆 New High Score! 🏆
              </p>
            )}
            {score === highScore && score > 0 && !showNewHighScore && (
              <p className="text-amber-400 text-sm">🏆 Tied your best!</p>
            )}
            <p className="text-gray-400 text-sm mt-2">Press Space to play again</p>
          </div>
        )}
      </div>

      {/* Touch Controls (Mobile) */}
      <div className="mt-4 md:hidden">
        <div className="grid grid-cols-3 gap-2 w-40 mx-auto">
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('UP'); }}
            className="bg-gray-700/80 active:bg-emerald-500 text-white rounded-xl p-3 flex items-center justify-center text-xl transition-colors touch-none"
          >
            ↑
          </button>
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('LEFT'); }}
            className="bg-gray-700/80 active:bg-emerald-500 text-white rounded-xl p-3 flex items-center justify-center text-xl transition-colors touch-none"
          >
            ←
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('DOWN'); }}
            className="bg-gray-700/80 active:bg-emerald-500 text-white rounded-xl p-3 flex items-center justify-center text-xl transition-colors touch-none"
          >
            ↓
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('RIGHT'); }}
            className="bg-gray-700/80 active:bg-emerald-500 text-white rounded-xl p-3 flex items-center justify-center text-xl transition-colors touch-none"
          >
            →
          </button>
        </div>
      </div>

      {/* Controls hint for desktop */}
      <div className="hidden md:flex mt-4 gap-4 text-gray-500 text-xs">
        <span>⬆⬇⬅➡ or WASD to move</span>
        <span>Space to pause</span>
        <span>Esc to pause</span>
      </div>
    </div>
  );
}

export default App;
