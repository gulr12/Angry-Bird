import React, { useEffect } from 'react';
import { Volume2, VolumeX, Play, Grid, Trophy, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenStageSelect: () => void;
  totalStars: number;
  unlockedStageCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenStageSelect,
  totalStars,
  unlockedStageCount,
  isMuted,
  onToggleMute,
}) => {
  // Listen for Space / Enter to start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        soundManager.playClick();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="absolute inset-0 flex flex-col justify-between items-center z-30 pointer-events-auto select-none overflow-hidden">
      {/* Cartoon Sky Backdrop Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100 opacity-90 -z-10" />

      {/* Floating clouds in background */}
      <div className="absolute top-12 left-10 w-44 h-16 bg-white/50 rounded-full blur-[1px] animate-pulse" />
      <div className="absolute top-24 right-16 w-56 h-20 bg-white/40 rounded-full blur-[1px]" />
      <div className="absolute top-48 left-1/3 w-36 h-12 bg-white/45 rounded-full blur-[1px]" />

      {/* Top Bar Status */}
      <header className="w-full px-6 pt-5 flex justify-between items-center max-w-5xl">
        <div className="flex items-center gap-3 bg-black/35 backdrop-blur-sm border-2 border-amber-300/40 px-4 py-2 rounded-2xl shadow-lg text-white">
          <Trophy className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="font-game text-lg tracking-wide">
            STARS: <span className="text-yellow-300">{totalStars} / 60</span>
          </span>
          <span className="text-white/40">|</span>
          <span className="font-game text-sm text-emerald-300">
            STAGES UNLOCKED: {unlockedStageCount} / 20
          </span>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onToggleMute();
          }}
          className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 rounded-2xl shadow-lg transition-transform active:scale-95 text-white cursor-pointer"
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-6 h-6 text-red-300" /> : <Volume2 className="w-6 h-6 text-emerald-300" />}
        </button>
      </header>

      {/* Centerpiece: Title Lockup & Character Centerpiece */}
      <main className="flex flex-col items-center justify-center my-auto px-4 text-center">
        {/* Animated Bird Lineup SVG Lockup */}
        <div className="relative mb-3 flex items-center justify-center">
          {/* Bespoke Inline SVG Title Lockup */}
          <svg viewBox="0 0 650 160" className="w-[85vw] max-w-[620px] drop-shadow-[0_12px_16px_rgba(0,0,0,0.45)]">
            <defs>
              <linearGradient id="titleRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4d4d" />
                <stop offset="50%" stopColor="#e60000" />
                <stop offset="100%" stopColor="#990000" />
              </linearGradient>
              <linearGradient id="titleYellow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff385" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Background comic banner */}
            <path
              d="M 25,45 Q 325,25 625,45 L 610,135 Q 325,155 40,135 Z"
              fill="#1e293b"
              stroke="#fbbf24"
              strokeWidth="5"
            />

            {/* Word: ANGRY */}
            <text
              x="180"
              y="92"
              fontFamily="'Lilita One', 'Fredoka', Impact, sans-serif"
              fontSize="68"
              fontWeight="900"
              fill="url(#titleRed)"
              stroke="#0f172a"
              strokeWidth="8"
              paintOrder="stroke fill"
              textAnchor="middle"
              transform="rotate(-4 180 92)"
            >
              ANGRY
            </text>

            {/* Word: BIRDS */}
            <text
              x="440"
              y="98"
              fontFamily="'Lilita One', 'Fredoka', Impact, sans-serif"
              fontSize="74"
              fontWeight="900"
              fill="url(#titleYellow)"
              stroke="#0f172a"
              strokeWidth="8"
              paintOrder="stroke fill"
              textAnchor="middle"
              transform="rotate(3 440 98)"
            >
              BIRDS
            </text>

            {/* Sub-badge: 20 STAGES */}
            <rect x="230" y="105" width="190" height="34" rx="17" fill="#ef4444" stroke="#ffffff" strokeWidth="3" />
            <text
              x="325"
              y="128"
              fontFamily="'Lilita One', sans-serif"
              fontSize="20"
              fill="#ffffff"
              textAnchor="middle"
              fontWeight="bold"
            >
              ★ 20 EPIC STAGES ★
            </text>
          </svg>
        </div>

        {/* Playable CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <button
            onClick={() => {
              soundManager.playClick();
              onStartGame();
            }}
            className="btn-cartoon-yellow px-10 py-4 rounded-2xl flex items-center gap-3 text-slate-900 font-game text-2xl tracking-wide cursor-pointer transition-transform hover:scale-105 active:scale-95 border-2 border-yellow-200"
          >
            <Play className="w-8 h-8 fill-slate-900" />
            START GAME
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenStageSelect();
            }}
            className="btn-cartoon-blue px-7 py-4 rounded-2xl flex items-center gap-3 text-white font-game text-xl tracking-wide cursor-pointer transition-transform hover:scale-105 active:scale-95 border-2 border-blue-200"
          >
            <Grid className="w-6 h-6 text-white" />
            STAGES (1–20)
          </button>
        </div>

        {/* Flat control-hint line per guidelines */}
        <p className="mt-8 text-slate-800 font-game text-sm bg-white/70 px-5 py-2 rounded-full border border-slate-300 shadow-sm">
          Click & Drag Slingshot · Tap Mid-Flight for Ability · Esc Pause · Enter Start
        </p>
      </main>

      {/* Decorative Bottom Grass Edge */}
      <footer className="w-full h-12 bg-emerald-600 border-t-4 border-emerald-400 flex items-center justify-center text-white/80 font-game text-xs tracking-wider">
        20 HANDCRAFTED PHYSICS STAGES · UNIQUE BIRD POWERS · DESTRUCTIBLE FORTRESSES
      </footer>
    </div>
  );
};
