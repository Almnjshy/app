export interface Tile {
  id: string;
  top: number;
  bottom: number;
  isDouble: boolean;
  total: number;
}

export interface PlacedTile {
  tile: Tile;
  x: number;
  y: number;
  rotation: number;
  connectLeft: number;
  connectRight: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHuman: boolean;
  tiles: Tile[];
  score: number;
  isActive: boolean;
  tileCount: number;
}

export type ScreenType =
  | 'title'
  | 'menu'
  | 'levelSelect'
  | 'playing'
  | 'matchEnd'
  | 'settings'
  | 'statistics';

export type GameMode = 'ai' | 'tournament' | 'online' | 'local';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  language: 'ar' | 'en';
}

export interface GameProgress {
  unlockedLevel: number;
  levelStars: Record<number, number>;
  totalScore: number;
  totalWins: number;
  totalLosses: number;
  longestChain: number;
  highestScore: number;
}

export interface PowerUp {
  type: string;
  name: string;
  nameAr: string;
  icon: string;
  uses: number;
  maxUses: number;
}

export interface LevelConfig {
  level: number;
  name: string;
  nameAr: string;
  targetScore: number;
  aiCount: number;
  aiDifficulty: string;
  timeLimit: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, name: 'First Steps', nameAr: 'الخطوات الأولى', targetScore: 50, aiCount: 1, aiDifficulty: 'random', timeLimit: 30 },
  { level: 2, name: 'The Beginning', nameAr: 'البداية', targetScore: 60, aiCount: 1, aiDifficulty: 'basic', timeLimit: 30 },
  { level: 3, name: 'Rising Star', nameAr: 'النجم الصاعد', targetScore: 70, aiCount: 1, aiDifficulty: 'basic', timeLimit: 25 },
  { level: 4, name: 'The Skilled', nameAr: 'الماهر', targetScore: 80, aiCount: 1, aiDifficulty: 'counting', timeLimit: 25 },
  { level: 5, name: 'Half Expert', nameAr: 'نصف محترف', targetScore: 100, aiCount: 2, aiDifficulty: 'counting', timeLimit: 20 },
  { level: 6, name: 'The Expert', nameAr: 'المحترف', targetScore: 100, aiCount: 2, aiDifficulty: 'tracking', timeLimit: 20 },
  { level: 7, name: 'The Master', nameAr: 'الخبير', targetScore: 150, aiCount: 2, aiDifficulty: 'tracking', timeLimit: 15 },
  { level: 8, name: 'The Champion', nameAr: 'البطل', targetScore: 150, aiCount: 3, aiDifficulty: 'advanced', timeLimit: 15 },
  { level: 9, name: 'Grandmaster', nameAr: 'الغراند ماستر', targetScore: 200, aiCount: 3, aiDifficulty: 'perfect', timeLimit: 10 },
  { level: 10, name: 'Domino King', nameAr: 'ملك الدومينو', targetScore: 200, aiCount: 3, aiDifficulty: 'champion', timeLimit: 10 },
];

export const DIFFICULTY_SETTINGS: Record<string, { thinkTimeMin: number; thinkTimeMax: number }> = {
  random: { thinkTimeMin: 500, thinkTimeMax: 1500 },
  basic: { thinkTimeMin: 800, thinkTimeMax: 2000 },
  counting: { thinkTimeMin: 1000, thinkTimeMax: 2500 },
  tracking: { thinkTimeMin: 1200, thinkTimeMax: 3000 },
  advanced: { thinkTimeMin: 1500, thinkTimeMax: 3500 },
  perfect: { thinkTimeMin: 2000, thinkTimeMax: 4000 },
  champion: { thinkTimeMin: 2500, thinkTimeMax: 5000 },
};

export const AI_NAMES = [
  'أحمد',
  'محمد',
  'علي',
  'خالد',
  'عمر',
  'يوسف',
  'سلطان',
  'فيصل',
];
