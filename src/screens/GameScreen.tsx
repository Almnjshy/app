import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  generateAllTiles,
  dealTiles,
  determineFirstPlayer,
  getPlayableTiles,
  canPlayTile,
  placeTileOnBoard,
  getValidSides,
  aiSelectTile,
  calculateRoundWinner,
} from '@/lib/gameEngine';
import { LEVELS, DIFFICULTY_SETTINGS, AI_NAMES } from '@/types/game';
import type { Tile, Player, PowerUp } from '@/types/game';
import { DominoTile } from '@/components/DominoTile';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { Board } from '@/components/Board';
import {
  Settings,
  BarChart2,
  MessageCircle,
  Smile,
  Trophy,
  Undo2,
  LogOut,
  Pause,
  Eye,
  Clock,
  Lightbulb,
} from 'lucide-react';

export default function GameScreen() {
  const {
    currentLevel,
    players,
    setPlayers,
    boardTiles,
    setBoardTiles,
    boneyard,
    setBoneyard,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    matchScores,
    setMatchScores,
    setTurnTimer,
    isTimerRunning,
    setIsTimerRunning,
    setRoundWinner,
    matchWinner,
    setMatchWinner,
    isPaused,
    setIsPaused,
    canUndo,
    setCanUndo,
    lastMove,
    setLastMove,
    gameMessage,
    setGameMessage,
    powerUps,
    usePowerUp,
    setScreen,
    completeLevel,
  } = useGameStore();

  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [hintTile, setHintTile] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [scorePopup, setScorePopup] = useState<{ text: string; x: number; y: number } | null>(null);
  const [localTimer, setLocalTimer] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameInitialized = useRef(false);

  const levelConfig = LEVELS[currentLevel - 1] || LEVELS[0];
  const difficulty = levelConfig.aiDifficulty;
  const targetScore = levelConfig.targetScore;

  // Initialize game
  useEffect(() => {
    if (gameInitialized.current) return;
    gameInitialized.current = true;

    const allTiles = generateAllTiles();
    const tilesPerPlayer = (levelConfig.aiCount + 1) <= 2 ? 7 : 5;
    const { hands, boneyard: newBoneyard } = dealTiles(allTiles, levelConfig.aiCount + 1, tilesPerPlayer);

    const newPlayers: Player[] = [
      {
        id: 'human',
        name: '兀賳鬲',
        avatar: '/assets/avatar_player.png',
        isHuman: true,
        tiles: hands[0],
        score: 0,
        isActive: false,
        tileCount: hands[0].length,
      },
      ...hands.slice(1).map((hand, i) => ({
        id: `ai-${i}`,
        name: AI_NAMES[i % AI_NAMES.length],
        avatar: '/assets/avatar_ai.png',
        isHuman: false,
        tiles: hand,
        score: 0,
        isActive: false,
        tileCount: hand.length,
      })),
    ];

    setPlayers(newPlayers);
    setBoneyard(newBoneyard);
    setBoardTiles([]);
    setMatchScores(new Array(newPlayers.length).fill(0));
    setCurrentPlayerIndex(0);
    setTurnTimer(30);
    setIsTimerRunning(true);
    setRoundWinner(null);
    setMatchWinner(null);
    setCanUndo(false);
    setLastMove(null);
    setGameMessage('');
    setSelectedTile(null);

    const firstPlayer = determineFirstPlayer(newPlayers);
    setCurrentPlayerIndex(firstPlayer);
    setPlayers(newPlayers.map((p: Player, i: number) => ({ ...p, isActive: i === firstPlayer })));
  }, []);

  // Timer
  useEffect(() => {
    if (!isTimerRunning || isPaused || matchWinner) return;

    setLocalTimer(30);
    timerRef.current = setInterval(() => {
      setLocalTimer((prev: number) => {
        if (prev <= 1) {
          handleTurnTimeout();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isPaused, matchWinner, currentPlayerIndex]);

  // AI Turn
  useEffect(() => {
    if (matchWinner || players[currentPlayerIndex]?.isHuman) return;

    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer || currentPlayer.isHuman) return;

    const diffSettings = DIFFICULTY_SETTINGS[difficulty];
    const thinkTime = diffSettings.thinkTimeMin + Math.random() * (diffSettings.thinkTimeMax - diffSettings.thinkTimeMin);

    aiTimeoutRef.current = setTimeout(() => {
      handleAIPlay();
    }, thinkTime);

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [currentPlayerIndex, players, boardTiles, matchWinner]);

  const handleTurnTimeout = useCallback(() => {
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer) return;

    // Try to draw from boneyard
    if (boneyard.length > 0) {
      const drawn = boneyard[0];
      const newBoneyard = boneyard.slice(1);
      const newTiles = [...currentPlayer.tiles, drawn];

      setBoneyard(newBoneyard);
      setPlayers(players.map((p: Player, i: number) =>
        i === currentPlayerIndex ? { ...p, tiles: newTiles, tileCount: newTiles.length } : p
      ));

      if (canPlayTile(drawn, boardTiles)) {
        setGameMessage('爻丨亘鬲 賯胤毓丞 - 賷賲賰賳賰 丕賱賱毓亘!');
        setTurnTimer(30);
      } else {
        nextTurn();
      }
    } else {
      nextTurn();
    }
  }, [players, currentPlayerIndex, boneyard, boardTiles, nextTurn]);

  const handleAIPlay = useCallback(() => {
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer || currentPlayer.isHuman) return;

    const playable = getPlayableTiles(currentPlayer.tiles, boardTiles);

    if (playable.length > 0) {
      const move = aiSelectTile(currentPlayer.tiles, boardTiles, difficulty, new Set());
      if (move) {
        const newBoard = placeTileOnBoard(move.tile, boardTiles, move.side);
        const newTiles = currentPlayer.tiles.filter((t: Tile) => t.id !== move.tile.id);

        setBoardTiles(newBoard);
        setPlayers(players.map((p: Player, i: number) =>
          i === currentPlayerIndex ? { ...p, tiles: newTiles, tileCount: newTiles.length } : p
        ));
        setLastMove({ tile: move.tile, fromBoneyard: false });
        setCanUndo(false);

        checkRoundEnd(newTiles, currentPlayerIndex);
      }
    } else {
      // Try to draw
      if (boneyard.length > 0) {
        const drawn = boneyard[0];
        const newBoneyard = boneyard.slice(1);
        const newTiles = [...currentPlayer.tiles, drawn];

        setBoneyard(newBoneyard);
        setPlayers(players.map((p: Player, i: number) =>
          i === currentPlayerIndex ? { ...p, tiles: newTiles, tileCount: newTiles.length } : p
        ));

        if (canPlayTile(drawn, boardTiles)) {
          // AI will play the drawn tile
          setTimeout(() => handleAIPlay(), 1500);
          return;
        } else {
          setGameMessage(`${currentPlayer.name} 爻丨亘 賵賲乇乇`);
        }
      } else {
        setGameMessage(`${currentPlayer.name} 賲乇乇`);
      }
      nextTurn();
    }
  }, [players, currentPlayerIndex, boardTiles, boneyard, difficulty, nextTurn]);

  const checkRoundEnd = useCallback((playerTiles: Tile[], _playerIndex?: number) => {
    if (playerTiles.length === 0) {
      // Player emptied their hand - round over
      const { winnerIndex, points } = calculateRoundWinner(players);
      const bonus = 10; // Domino bonus
      const totalPoints = points + bonus;

      const newScores = [...matchScores];
      newScores[winnerIndex] += totalPoints;
      setMatchScores(newScores);

      setRoundWinner(players[winnerIndex].name);
      setScorePopup({ text: `+${totalPoints}`, x: 50, y: 50 });
      setTimeout(() => setScorePopup(null), 2000);

      // Check match winner
      if (newScores[winnerIndex] >= targetScore) {
        setMatchWinner(players[winnerIndex].id);
        setIsTimerRunning(false);
        if (players[winnerIndex].isHuman) {
          const margin = newScores[winnerIndex] - Math.max(...newScores.filter((_: number, i: number) => i !== winnerIndex));
          const stars = margin >= 40 ? 3 : margin >= 20 ? 2 : 1;
          completeLevel(currentLevel, stars, newScores[winnerIndex]);
        }
        setTimeout(() => setScreen('matchEnd'), 2000);
        return;
      }

      // Start new round
      setTimeout(() => startNewRound(), 2000);
    } else {
      nextTurn();
    }
  }, [players, matchScores, targetScore, currentLevel]);

  const startNewRound = useCallback(() => {
    const allTiles = generateAllTiles();
    const tilesPerPlayer = players.length <= 2 ? 7 : 5;
    const { hands, boneyard: newBoneyard } = dealTiles(allTiles, players.length, tilesPerPlayer);

    const newPlayers = players.map((p: Player, i: number) => ({
      ...p,
      tiles: hands[i],
      tileCount: hands[i].length,
      isActive: false,
    }));

    setPlayers(newPlayers);
    setBoneyard(newBoneyard);
    setBoardTiles([]);
    setRoundWinner(null);
    setCanUndo(false);
    setLastMove(null);
    setGameMessage('');
    setSelectedTile(null);

    const firstPlayer = determineFirstPlayer(newPlayers);
    setCurrentPlayerIndex(firstPlayer);
    setPlayers(newPlayers.map((p: Player, i: number) => ({ ...p, isActive: i === firstPlayer })));
    setTurnTimer(30);
    setIsTimerRunning(true);
  }, [players]);

  const nextTurn = useCallback(() => {
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    setPlayers(players.map((p: Player, i: number) => ({ ...p, isActive: i === nextIndex })));
    setTurnTimer(30);
  }, [currentPlayerIndex, players, setTurnTimer]);

  const handleTileClick = (tile: Tile) => {
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer?.isHuman || matchWinner) return;

    if (!canPlayTile(tile, boardTiles)) {
      setGameMessage('賱丕 賷賲賰賳 賱毓亘 賴匕賴 丕賱賯胤毓丞!');
      setTimeout(() => setGameMessage(''), 1500);
      return;
    }

    if (selectedTile?.id === tile.id) {
      // Play the tile
      const sides = getValidSides(tile, boardTiles);
      const side = sides[0] || 'right';
      const newBoard = placeTileOnBoard(tile, boardTiles, side);
      const newTiles = currentPlayer.tiles.filter((t: Tile) => t.id !== tile.id);

      setBoardTiles(newBoard);
      setPlayers(players.map((p: Player, i: number) =>
        i === currentPlayerIndex ? { ...p, tiles: newTiles, tileCount: newTiles.length } : p
      ));
      setLastMove({ tile, fromBoneyard: false });
      setCanUndo(true);
      setSelectedTile(null);
      setHintTile(null);

      checkRoundEnd(newTiles, currentPlayerIndex);
    } else {
      setSelectedTile(tile);
    }
  };

  const handleDrawFromBoneyard = () => {
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer?.isHuman || matchWinner || boneyard.length === 0) return;

    const drawn = boneyard[0];
    const newBoneyard = boneyard.slice(1);
    const newTiles = [...currentPlayer.tiles, drawn];

    setBoneyard(newBoneyard);
    setPlayers(players.map((p: Player, i: number) =>
      i === currentPlayerIndex ? { ...p, tiles: newTiles, tileCount: newTiles.length } : p
    ));
    setLastMove({ tile: drawn, fromBoneyard: true });

    if (canPlayTile(drawn, boardTiles)) {
      setGameMessage('賷賲賰賳賰 賱毓亘 丕賱賯胤毓丞 丕賱賲爻丨賵亘丞!');
    } else {
      setTimeout(() => nextTurn(), 1000);
    }
  };

  const handleUndo = () => {
    if (!canUndo || !lastMove) return;
    // Implementation would restore previous state
    setCanUndo(false);
  };

  const handleUsePowerUp = (type: string) => {
    const powerUp = powerUps.find((p) => p.type === type);
    if (!powerUp || powerUp.uses <= 0) return;

    usePowerUp(type);

    switch (type) {
      case 'hint': {
        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer?.isHuman) {
          const playable = getPlayableTiles(currentPlayer.tiles, boardTiles);
          if (playable.length > 0) {
            setHintTile(playable[0].id);
            setTimeout(() => setHintTile(null), 3000);
          }
        }
        break;
      }
      case 'extraTime':
        setLocalTimer((prev: number) => Math.min(prev + 15, 60));
        break;
      case 'peek':
        setGameMessage(' peeking at opponent tiles...');
        setTimeout(() => setGameMessage(''), 3000);
        break;
    }
  };

  const handleQuit = () => {
    setIsPaused(true);
    setIsTimerRunning(false);
    setScreen('menu');
  };

  const timerProgress = localTimer / 30;
  const currentPlayer = players[currentPlayerIndex];
  const humanPlayer = players.find((p: Player) => p.isHuman);
  const playableTiles = humanPlayer ? getPlayableTiles(humanPlayer.tiles, boardTiles) : [];

  const emojis = ['馃榾', '馃槀', '馃槑', '馃', '馃憤', '馃憦', '馃敟', '馃挴', '馃幆', '猸�', '馃帀', '馃槺'];

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#0D7A3A]">
      {/* Table background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/assets/table_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* Top HUD */}
      <div className="relative z-10 flex items-center justify-between p-3">
        {/* Left - Stats */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(true)}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Pause className="w-5 h-5 text-[#C9A84C]" />
          </button>
          <div className="glass-panel rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-white text-sm font-bold">
                {matchScores[0] || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Center - Score */}
        <div className="glass-panel rounded-xl px-4 py-2 text-center">
          <p className="text-[#C9A84C] text-xs font-arabic mb-0.5">
            賱毓亘 {targetScore} 賳賯胤丞
          </p>
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-bold text-lg">
              {matchScores[0] || 0}
            </span>
            <span className="text-white/50">|</span>
            <span className="text-red-400 font-bold text-lg">
              {matchScores[1] || 0}
            </span>
          </div>
        </div>

        {/* Right - Settings */}
        <div className="flex items-center gap-2">
          <div className="glass-panel rounded-lg px-3 py-1.5">
            <span className="text-[#B8A080] text-xs font-arabic">
              賯胤毓 {boneyard.length}
            </span>
          </div>
          <button
            onClick={() => setScreen('settings')}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Settings className="w-5 h-5 text-[#C9A84C]" />
          </button>
        </div>
      </div>

      {/* Game area */}
      <div className="relative z-10 flex-1 flex flex-col px-4">
        {/* Top player (AI) */}
        {players.length > 1 && (
          <div className="flex items-center justify-center gap-4 py-2">
            <PlayerAvatar
              player={players[1]}
              isActive={currentPlayerIndex === 1}
              timerProgress={timerProgress}
              position="top"
              tileCount={players[1]?.tileCount}
            />
            {players[2] && (
              <PlayerAvatar
                player={players[2]}
                isActive={currentPlayerIndex === 2}
                timerProgress={timerProgress}
                position="top"
                tileCount={players[2]?.tileCount}
              />
            )}
          </div>
        )}

        {/* Board */}
        <div className="flex-1 flex items-center justify-center py-2">
          <Board boardTiles={boardTiles} className="w-full h-full" />
        </div>

        {/* Bottom player (Human) */}
        <div className="flex items-center justify-center gap-3 py-2">
          <PlayerAvatar
            player={humanPlayer || players[0]}
            isActive={currentPlayerIndex === 0}
            timerProgress={timerProgress}
            position="bottom"
            showTiles
            tileCount={humanPlayer?.tiles.length || 0}
          />
        </div>

        {/* Game message */}
        {gameMessage && (
          <div className="text-center py-1">
            <span className="text-[#C9A84C] text-sm font-arabic animate-fade-in">
              {gameMessage}
            </span>
          </div>
        )}

        {/* Player hand */}
        <div className="py-2">
          <div className="flex items-center justify-center gap-1 overflow-x-auto pb-2 px-2">
            {humanPlayer?.tiles.map((tile: Tile) => {
              const isPlayable = playableTiles.some((t: Tile) => t.id === tile.id);
              const isSelected = selectedTile?.id === tile.id;
              const isHint = hintTile === tile.id;

              return (
                <div
                  key={tile.id}
                  className={`flex-shrink-0 transition-all duration-200 ${
                    isSelected ? '-translate-y-3' : isPlayable ? 'hover:-translate-y-2' : ''
                  } ${isHint ? 'animate-pulse' : ''}`}
                  onClick={() => handleTileClick(tile)}
                >
                  <DominoTile
                    tile={tile}
                    size="sm"
                    faceUp={true}
                    selected={isSelected}
                    playable={isPlayable}
                  />
                </div>
              );
            })}
          </div>

          {/* Boneyard draw button */}
          {currentPlayer?.isHuman && playableTiles.length === 0 && boneyard.length > 0 && (
            <div className="text-center mt-2">
              <button
                onClick={handleDrawFromBoneyard}
                className="px-6 py-2 bg-[#C9A84C] text-[#1A0E08] rounded-lg font-bold text-sm font-arabic hover:scale-105 transition-transform"
              >
                爻丨亘 賯胤毓丞 ({boneyard.length} 賲鬲亘賯賷丞)
              </button>
            </div>
          )}

          {/* Pass button */}
          {currentPlayer?.isHuman && playableTiles.length === 0 && boneyard.length === 0 && (
            <div className="text-center mt-2">
              <button
                onClick={nextTurn}
                className="px-6 py-2 bg-[#E74C3C] text-white rounded-lg font-bold text-sm font-arabic hover:scale-105 transition-transform"
              >
                鬲賲乇賷乇
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Power-ups bar */}
      <div className="relative z-10 flex items-center justify-center gap-2 px-4 py-2">
        {powerUps.map((pu: PowerUp) => (
          <button
            key={pu.type}
            onClick={() => handleUsePowerUp(pu.type)}
            disabled={pu.uses <= 0 || !currentPlayer?.isHuman}
            className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              pu.uses > 0 && currentPlayer?.isHuman
                ? 'bg-[#2D1810]/80 border border-[#C9A84C]/40 hover:scale-110'
                : 'bg-[#2D1810]/40 border border-white/10 opacity-40'
            }`}
          >
            {pu.type === 'peek' && <Eye className="w-5 h-5 text-[#C9A84C]" />}
            {pu.type === 'undo' && <Undo2 className="w-5 h-5 text-[#C9A84C]" />}
            {pu.type === 'extraTime' && <Clock className="w-5 h-5 text-[#C9A84C]" />}
            {pu.type === 'hint' && <Lightbulb className="w-5 h-5 text-[#C9A84C]" />}
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C9A84C] text-[10px] text-[#1A0E08] font-bold flex items-center justify-center">
              {pu.uses}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom action bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/60 to-transparent">
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-transform"
        >
          <MessageCircle className="w-5 h-5 text-[#C9A84C]" />
        </button>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Smile className="w-5 h-5 text-[#C9A84C]" />
        </button>
        <button
          onClick={() => {}}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#A08030] text-[#1A0E08] font-bold text-sm font-arabic hover:scale-105 transition-transform"
        >
          <Trophy className="w-4 h-4 inline ml-1" />
          胤丕賵賱丞
        </button>
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
            canUndo ? 'glass-panel hover:scale-110' : 'bg-white/5 opacity-30'
          }`}
        >
          <Undo2 className="w-5 h-5 text-[#C9A84C]" />
        </button>
        <button
          onClick={handleQuit}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-transform"
        >
          <LogOut className="w-5 h-5 text-[#C9A84C]" />
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 right-4 z-50 glass-panel rounded-xl p-3 animate-slide-up">
          <div className="flex flex-wrap gap-2 justify-center">
            {emojis.map((emoji: string) => (
              <button
                key={emoji}
                onClick={() => {
                  setGameMessage(emoji);
                  setShowEmojiPicker(false);
                  setTimeout(() => setGameMessage(''), 2000);
                }}
                className="text-2xl hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Score popup */}
      {scorePopup && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: `${scorePopup.x}%`,
            top: `${scorePopup.y}%`,
            transform: 'translate(-50%, -50%)',
            animation: 'scorePopup 1.5s ease-out forwards',
          }}
        >
          <span className="text-4xl font-bold text-[#C9A84C] drop-shadow-lg">
            {scorePopup.text}
          </span>
        </div>
      )}

      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in">
          <div className="glass-panel rounded-2xl p-6 w-80 max-w-[90%]">
            <h2 className="text-2xl font-bold text-white text-center font-arabic mb-6">廿賷賯丕賮 賲丐賯鬲</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsPaused(false);
                  setIsTimerRunning(true);
                }}
                className="btn-primary w-full"
              >
                丕爻鬲卅賳丕賮
              </button>
              <button
                onClick={() => {
                  setIsPaused(false);
                  gameInitialized.current = false;
                  setScreen('playing');
                }}
                className="btn-green w-full"
              >
                廿毓丕丿丞 丕賱賱毓亘
              </button>
              <button
                onClick={() => setScreen('settings')}
                className="btn-blue w-full"
              >
                丕賱廿毓丿丕丿丕鬲
              </button>
              <button
                onClick={handleQuit}
                className="w-full py-3 rounded-xl bg-[#E74C3C] text-white font-bold font-arabic hover:scale-105 transition-transform"
              >
                禺乇賵噩
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}