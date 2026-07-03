import { useGameStore } from '@/store/gameStore';
import { Star, RotateCcw, Home, ChevronLeft } from 'lucide-react';
import type { Player } from '@/types/game';

export default function MatchEndScreen() {
  const {
    matchWinner,
    matchScores,
    players,
    currentLevel,
    setScreen,
    setCurrentLevel,
    resetMatch,
    completeLevel,
  } = useGameStore();

  const humanPlayer = players.find((p: Player) => p.isHuman);
  const humanWon = humanPlayer?.id === matchWinner;
  const winnerIndex = players.findIndex((p: Player) => p.id === matchWinner);
  const margin = winnerIndex >= 0 ? matchScores[winnerIndex] - Math.max(...matchScores.filter((_: number, i: number) => i !== winnerIndex)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0E08] to-[#2D1810] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Confetti effect */}
        {humanWon && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }, (_: number, i: number) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  backgroundColor: ['#C9A84C', '#27AE60', '#E74C3C', '#3498DB'][i % 4],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Trophy or result */}
          <div className="mb-6">
            {humanWon ? (
              <div className="text-8xl animate-bounce">馃弳</div>
            ) : (
              <div className="text-8xl animate-pulse">馃様</div>
            )}
          </div>

          {/* Result text */}
          <h1 className={`text-4xl font-bold mb-2 ${humanWon ? 'text-[#C9A84C]' : 'text-gray-400'}`}>
            {humanWon ? '賮夭鬲!' : '禺爻乇鬲!'}
          </h1>

          {/* Level name */}
          <p className="text-[#B8A080] text-lg font-arabic mb-4">
            丕賱賲乇丨賱丞 {currentLevel}
          </p>

          {/* Stars */}
          {humanWon && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-10 h-10 ${
                    s <= (margin >= 40 ? 3 : margin >= 20 ? 2 : 1)
                      ? 'text-[#C9A84C] fill-[#C9A84C]'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Score panel */}
          <div className="glass-panel rounded-xl p-4 mb-6">
            <h3 className="text-[#C9A84C] font-bold mb-3 font-arabic">丕賱賳鬲賷噩丞 丕賱賳賴丕卅賷丞</h3>
            {players.map((player, i) => (
              <div key={player.id} className="flex items-center justify-between py-2 border-b border-[#3D2817] last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{player.isHuman ? '馃懁' : '馃'}</span>
                  <span className="text-white font-arabic">{player.name}</span>
                </div>
                <span className={`font-bold text-lg ${i === winnerIndex ? 'text-[#C9A84C]' : 'text-white/70'}`}>
                  {matchScores[i] || 0}
                </span>
              </div>
            ))}
          </div>

          {/* Margin */}
          {humanWon && (
            <p className="text-green-400 text-sm mb-6 font-arabic">
              賮丕乇賯 丕賱賳賯丕胤: +{margin}
            </p>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                resetMatch();
                setScreen('playing');
              }}
              className="btn-gold w-full flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              廿毓丕丿丞 丕賱賱毓亘
            </button>
            {humanWon && currentLevel < 10 && (
              <button
                onClick={() => {
                  setCurrentLevel(currentLevel + 1);
                  resetMatch();
                  setScreen('playing');
                }}
                className="btn-green w-full"
              >
                丕賱賲乇丨賱丞 丕賱鬲丕賱賷丞
              </button>
            )}
            <button
              onClick={() => setScreen('menu')}
              className="btn-blue w-full flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              丕賱賯丕卅賲丞 丕賱乇卅賷爻賷丞
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
