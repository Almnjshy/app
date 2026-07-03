import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function TitleScreen() {
  const { setScreen } = useGameStore();
  const [showTap, setShowTap] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    size: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowTap(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      size: 20 + Math.random() * 40,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  const handleTap = () => {
    setScreen('menu');
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden cursor-pointer"
      onClick={handleTap}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A0E08] via-[#2D1810] to-[#1A0E08]" />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute opacity-10"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            transform: `rotate(${p.rotation}deg)`,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        >
          <div className="w-full h-full bg-[#F5E6D3] rounded-lg" />
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-6">
        {/* Domino pieces animation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div
            className="w-16 h-24 bg-[#F5E6D3] rounded-lg shadow-2xl transform -rotate-12 animate-float"
            style={{ animationDelay: '0s' }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="grid grid-cols-2 gap-2 p-3">
                <div className="w-3 h-3 rounded-full bg-[#1A0E08]" />
                <div className="w-3 h-3 rounded-full bg-[#1A0E08]" />
                <div className="w-3 h-3 rounded-full bg-[#1A0E08]" />
                <div className="w-3 h-3 rounded-full bg-[#1A0E08]" />
              </div>
            </div>
          </div>

          <div className="text-6xl animate-pulse">馃憫</div>

          <div
            className="w-16 h-24 bg-[#F5E6D3] rounded-lg shadow-2xl transform rotate-12 animate-float"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="grid grid-cols-2 gap-2 p-3">
                <div className="w-3 h-3 rounded-full bg-[#1A0E08]" />
                <div className="w-3 h-3 rounded-full bg-[#1A0E08]" />
                <div className="w-3 h-3 rounded-full bg-[#1A0E08]" />
                <div className="w-3 h-3 rounded-full bg-[#1A0E08]" />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-6xl md:text-7xl font-bold text-[#C9A84C] tracking-[0.2em] mb-4"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          DOMINO
        </h1>

        {/* Arabic subtitle */}
        <p className="text-2xl text-[#B8A080] font-arabic mb-12">丿賵賲賷賳賵</p>

        {/* Tap to start */}
        {showTap && (
          <div className="animate-fade-in">
            <p className="text-[#C9A84C] text-lg font-arabic animate-pulse">
              丕囟睾胤 賱賱亘丿亍
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C] flex items-center justify-center animate-bounce">
                <span className="text-[#C9A84C] text-2xl">鈫�</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 opacity-20">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-6 h-10 bg-[#F5E6D3] rounded animate-float"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
