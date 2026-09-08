import { useRef, useCallback, useEffect, useState } from 'react';
import { useWordSnake, Direction, Difficulty } from './hooks/useWordSnake';

function App() {
  const {
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
    gridSize,
    setDifficulty,
    startGame,
    togglePause,
    resetGame,
    changeDirection,
  } = useWordSnake();

  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [cellSize, setCellSize] = useState(48);
  const [showWords, setShowWords] = useState(false);

  // Calculate responsive cell size
  useEffect(() => {
    const updateSize = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 560);
      const maxHeight = window.innerHeight - 320;
      const sizeFromWidth = Math.floor(maxWidth / gridSize);
      const sizeFromHeight = Math.floor(maxHeight / gridSize);
      const size = Math.max(36, Math.min(sizeFromWidth, sizeFromHeight, 56));
      setCellSize(size);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [gridSize]);

  // Touch/swipe controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minSwipe = 20;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      changeDirection(dy > 0 ? 'DOWN' : 'UP');
    }
    touchStartRef.current = null;
  }, [changeDirection]);

  // D-pad button handler
  const handleDPad = useCallback((dir: Direction) => {
    if (gameState === 'playing') {
      changeDirection(dir);
    }
  }, [gameState, changeDirection]);

  const boardPixelSize = cellSize * gridSize;

  // Determine snake segment opacity for gradient effect
  const getSegmentStyle = (index: number) => {
    const opacity = 1 - (index / snake.length) * 0.5;
    return opacity;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-start py-4 px-2 select-none overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-xl mb-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            <span className="text-emerald-400">蛇</span> Word Snake
          </h1>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-amber-300 font-semibold">
              🏆 {highScore}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`text-lg transition-all duration-300 ${i < lives ? 'scale-100 opacity-100' : 'scale-75 opacity-30 grayscale'}`}>
                {i < lives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
          <div className="text-white font-bold text-lg">
            {score} <span className="text-white/50 text-sm font-normal">pts</span>
          </div>
          <div className="text-white/70 text-sm">
            Round {round}
            {streak >= 2 && (
              <span className="ml-2 text-amber-400 font-semibold">
                🔥×{streak}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Target word display */}
      <div className={`w-full max-w-xl mb-3 transition-all duration-300 ${feedback === 'correct' ? 'scale-105' : feedback === 'wrong' ? 'animate-shake' : ''}`}>
        <div className={`rounded-xl px-4 py-3 text-center border transition-all duration-300 ${
          feedback === 'correct' 
            ? 'bg-emerald-500/20 border-emerald-400/50 shadow-lg shadow-emerald-500/20' 
            : feedback === 'wrong'
            ? 'bg-red-500/20 border-red-400/50 shadow-lg shadow-red-500/20'
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="text-white/60 text-xs uppercase tracking-wider mb-1">
            Find the Chinese for:
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white">
            {targetWord ? targetWord.en : '—'}
          </div>
          {feedback === 'correct' && (
            <div className="text-emerald-400 text-sm mt-1 font-medium">
              ✓ Correct! {targetWord?.pinyin && `(${targetWord.pinyin})`}
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="text-red-400 text-sm mt-1 font-medium">
              ✗ Wrong! Try again
            </div>
          )}
        </div>
      </div>

      {/* Game Board */}
      <div 
        ref={boardRef}
        className="relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-purple-900/50"
        style={{ width: boardPixelSize, height: boardPixelSize }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid background */}
        <div className="absolute inset-0 bg-slate-800/80">
          {Array.from({ length: gridSize }).map((_, row) => (
            <div key={row} className="flex">
              {Array.from({ length: gridSize }).map((_, col) => (
                <div
                  key={col}
                  className={`border border-white/[0.03] ${
                    (row + col) % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
                  }`}
                  style={{ width: cellSize, height: cellSize }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Food items (word apples) */}
        {foods.map((food) => (
          <div
            key={food.id}
            className="absolute flex items-center justify-center transition-all duration-200"
            style={{
              left: food.position.x * cellSize,
              top: food.position.y * cellSize,
              width: cellSize,
              height: cellSize,
            }}
          >
            <div className="w-[90%] h-[90%] rounded-full bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 animate-food-pulse border-2 border-rose-300/50">
              <span 
                className="text-white font-bold leading-none text-center"
                style={{ fontSize: Math.max(10, cellSize * 0.32) }}
              >
                {food.word.zh}
              </span>
            </div>
          </div>
        ))}

        {/* Snake */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          const opacity = getSegmentStyle(index);
          return (
            <div
              key={index}
              className="absolute transition-all duration-75 ease-linear"
              style={{
                left: segment.x * cellSize + 1,
                top: segment.y * cellSize + 1,
                width: cellSize - 2,
                height: cellSize - 2,
                zIndex: snake.length - index,
              }}
            >
              <div
                className={`w-full h-full rounded-lg ${
                  isHead 
                    ? 'bg-gradient-to-br from-emerald-300 to-emerald-500 shadow-lg shadow-emerald-400/40 border border-emerald-200/50' 
                    : 'bg-gradient-to-br from-emerald-400 to-emerald-600 border border-emerald-300/30'
                }`}
                style={{ opacity }}
              >
                {isHead && (
                  <div className="w-full h-full flex items-center justify-center relative">
                    {/* Eyes */}
                    <div className={`absolute flex gap-1 ${
                      direction === 'UP' ? 'top-1' :
                      direction === 'DOWN' ? 'bottom-1' :
                      direction === 'LEFT' ? 'left-1 flex-col' :
                      'right-1 flex-col'
                    } ${
                      direction === 'LEFT' || direction === 'RIGHT' ? 'top-1/2 -translate-y-1/2' : ''
                    }`}>
                      <div className="w-2 h-2 bg-white rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-slate-900 rounded-full" />
                      </div>
                      <div className="w-2 h-2 bg-white rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-slate-900 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Overlays */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="text-4xl mb-3">🐍</div>
            <h2 className="text-2xl font-bold text-white mb-2">Word Snake</h2>
            <p className="text-white/70 text-sm text-center px-6 mb-1">
              Eat the Chinese word that matches the English word shown above!
            </p>
            <p className="text-white/50 text-xs text-center px-6 mb-4">
              Arrow keys / WASD / Swipe to move
            </p>
            
            {/* Difficulty selector */}
            <div className="flex gap-2 mb-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    difficulty === d
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {d === 'easy' ? '🐢 Easy' : d === 'medium' ? '🐍 Medium' : '⚡ Hard'}
                </button>
              ))}
            </div>
            
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all active:scale-95"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="text-4xl mb-3">⏸️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Paused</h2>
            <button
              onClick={togglePause}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all active:scale-95"
            >
              Resume
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4">
            <div className="text-4xl mb-2">💀</div>
            <h2 className="text-2xl font-bold text-white mb-1">Game Over</h2>
            <p className="text-white/70 mb-1">Score: <span className="text-emerald-400 font-bold">{score}</span></p>
            <p className="text-white/50 text-sm mb-1">Words learned: {wordsLearned.length}</p>
            {score >= highScore && score > 0 && (
              <p className="text-amber-400 font-semibold text-sm mb-2">🎉 New High Score!</p>
            )}
            
            {/* Words learned */}
            {wordsLearned.length > 0 && (
              <div className="mb-3 max-h-24 overflow-y-auto w-full max-w-xs">
                <div className="flex flex-wrap gap-1 justify-center">
                  {wordsLearned.slice(-10).map((w, i) => (
                    <span key={i} className="bg-white/10 text-white/80 text-xs px-2 py-0.5 rounded-full">
                      {w.en} = {w.zh}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={startGame}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all active:scale-95"
              >
                Play Again
              </button>
              <button
                onClick={resetGame}
                className="px-6 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
              >
                Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile D-pad controls */}
      <div className="mt-4 md:hidden">
        <div className="grid grid-cols-3 gap-2 w-40 mx-auto">
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPad('UP'); }}
            onClick={() => handleDPad('UP')}
            className="bg-white/10 active:bg-emerald-500/30 rounded-xl p-3.5 flex items-center justify-center text-white text-2xl border border-white/10 transition-colors"
          >
            ↑
          </button>
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPad('LEFT'); }}
            onClick={() => handleDPad('LEFT')}
            className="bg-white/10 active:bg-emerald-500/30 rounded-xl p-3.5 flex items-center justify-center text-white text-2xl border border-white/10 transition-colors"
          >
            ←
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); togglePause(); }}
            onClick={togglePause}
            className="bg-white/10 active:bg-emerald-500/30 rounded-xl p-3.5 flex items-center justify-center text-white text-sm border border-white/10 transition-colors"
          >
            {gameState === 'paused' ? '▶️' : '⏸️'}
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPad('RIGHT'); }}
            onClick={() => handleDPad('RIGHT')}
            className="bg-white/10 active:bg-emerald-500/30 rounded-xl p-3.5 flex items-center justify-center text-white text-2xl border border-white/10 transition-colors"
          >
            →
          </button>
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPad('DOWN'); }}
            onClick={() => handleDPad('DOWN')}
            className="bg-white/10 active:bg-emerald-500/30 rounded-xl p-3.5 flex items-center justify-center text-white text-2xl border border-white/10 transition-colors"
          >
            ↓
          </button>
          <div />
        </div>
      </div>

      {/* Desktop controls hint */}
      <div className="hidden md:flex mt-4 items-center gap-4 text-white/40 text-xs">
        <span>← ↑ ↓ → or WASD to move</span>
        <span>•</span>
        <span>Space to pause</span>
        <span>•</span>
        <button
          onClick={() => setShowWords(!showWords)}
          className="text-emerald-400/70 hover:text-emerald-400 transition-colors"
        >
          {showWords ? 'Hide' : 'Show'} word list
        </button>
      </div>

      {/* Word list (toggleable) */}
      {showWords && (
        <div className="mt-3 w-full max-w-xl bg-white/5 rounded-xl p-3 border border-white/10 max-h-32 overflow-y-auto">
          <div className="text-white/50 text-xs mb-2 uppercase tracking-wider">All vocabulary</div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
            {wordsLearned.length > 0 ? (
              wordsLearned.map((w, i) => (
                <div key={i} className="text-white/70 text-xs">
                  <span className="text-emerald-400">{w.en}</span> = {w.zh}
                </div>
              ))
            ) : (
              <div className="text-white/40 text-xs col-span-full">
                Learn words by playing! Start the game to begin.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
