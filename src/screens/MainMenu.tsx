import { useGameStore } from '@/store/gameStore';
import { Settings, BarChart2, Trophy, Globe, Wifi, Bot } from 'lucide-react';

export default function MainMenu() {
  const { setScreen, setGameMode, setCurrentLevel } = useGameStore();

  const handlePlayAI = () => {
    setGameMode('ai');
    setCurrentLevel(1);
    setScreen('levelSelect');
  };

  const handlePlayTournament = () => {
    setGameMode('tournament');
    setScreen('playing');
  };

  const buttons = [
    {
      id: 'ai',
      label: '賱毓亘 囟丿 丕賱賰賲亘賷賵鬲乇',
      sublabel: '鬲丨丿賷 丕賱賰賲亘賷賵鬲乇 賮賷 賲亘丕乇丕丞 賰賱丕爻賷賰賷丞',
      icon: Bot,
      gradient: 'from-[#2D8A3E] to-[#1A5C28]',
      shadow: '#0F3D18',
      onClick: handlePlayAI,
    },
    {
      id: 'network',
      label: '丕賱賱毓亘 毓亘乇 丕賱卮亘賰丞',
      sublabel: '鬲賵丕氐賱 賲毓 丕賱兀氐丿賯丕亍 毓亘乇 WiFi',
      icon: Wifi,
      gradient: 'from-[#2563EB] to-[#1D4ED8]',
      shadow: '#1E3A5F',
      badge: '賯乇賷亘丕賸!',
      disabled: true,
    },
    {
      id: 'tournament',
      label: '亘胤賵賱丞',
      sublabel: '鬲賳丕賮爻 賮賷 亘胤賵賱丞 賲鬲毓丿丿丞 丕賱噩賵賱丕鬲',
      icon: Trophy,
      gradient: 'from-[#7C3AED] to-[#5B21B6]',
      shadow: '#4C1D95',
      onClick: handlePlayTournament,
    },
    {
      id: 'online',
      label: '兀賵賳賱丕賷賳',
      sublabel: '丕賱毓亘 囟丿 賱丕毓亘賷賳 丨賯賷賯賷賷賳',
      icon: Globe,
      gradient: 'from-[#DC2626] to-[#991B1B]',
      shadow: '#7F1D1D',
      badge: '賯乇賷亘丕賸!',
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0E08] to-[#2D1810] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => setScreen('settings')}
          className="w-12 h-12 rounded-full bg-[#2A1A10] border border-[#3D2817] flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Settings className="w-6 h-6 text-[#C9A84C]" />
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => setScreen('statistics')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2A1A10] border border-[#3D2817] text-[#B8A080] hover:scale-105 transition-transform"
          >
            <BarChart2 className="w-4 h-4" />
            <span className="text-sm font-arabic">丕賱廿丨氐丕卅賷丕鬲</span>
          </button>
          <button
            onClick={() => setScreen('settings')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2A1A10] border border-[#3D2817] text-[#B8A080] hover:scale-105 transition-transform"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-arabic">丕賱廿毓丿丕丿丕鬲</span>
          </button>
        </div>
      </div>

      {/* Logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-24 bg-[#F5E6D3] rounded-lg shadow-lg transform -rotate-12 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2 h-2 rounded-full bg-[#1A0E08]" />
                <div className="w-2 h-2 rounded-full bg-[#1A0E08]" />
                <div className="w-2 h-2 rounded-full bg-[#1A0E08]" />
                <div className="w-2 h-2 rounded-full bg-[#1A0E08]" />
              </div>
            </div>
            <div className="text-6xl">馃憫</div>
            <div className="w-16 h-24 bg-[#F5E6D3] rounded-lg shadow-lg transform rotate-12 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2 h-2 rounded-full bg-[#1A0E08]" />
                <div className="w-2 h-2 rounded-full bg-[#1A0E08]" />
                <div className="w-2 h-2 rounded-full bg-[#1A0E08]" />
                <div className="w-2 h-2 rounded-full bg-[#1A0E08]" />
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-[#C9A84C] tracking-wider mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          DOMINO
        </h1>
        <p className="text-[#B8A080] text-lg font-arabic mb-8">丿賵賲賷賳賵</p>

        {/* Menu buttons */}
        <div className="w-full max-w-sm space-y-3">
          {buttons.map((btn) => (
            <button
              key={btn.id}
              onClick={btn.onClick}
              disabled={btn.disabled}
              className={`w-full relative overflow-hidden rounded-xl p-4 text-right transition-all duration-200 ${
                btn.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-[1.02] active:scale-[0.98]'
              }`}
              style={{
                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${btn.gradient} opacity-90`} />
              <div className="relative flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: btn.shadow }}
                >
                  <btn.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-lg font-arabic">{btn.label}</h3>
                    {btn.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                        {btn.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm font-arabic">{btn.sublabel}</p>
                </div>
                <span className="text-white/70 text-lg">鈫�</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="p-4 flex justify-center gap-2 opacity-30">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-8 h-12 bg-[#F5E6D3] rounded" />
        ))}
      </div>
    </div>
  );
}
