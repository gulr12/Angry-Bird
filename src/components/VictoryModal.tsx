import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, ArrowRight, Grid, Trophy, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface VictoryModalProps {
  stageId: number;
  stageTitle: string;
  score: number;
  birdsLeftBonus: number;
  totalScore: number;
  stars: number;
  highScore: number;
  isNewHighScore: boolean;
  onNextStage: () => void;
  onReplay: () => void;
  onOpenStageSelect: () => void;
  isLastStage: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stageId,
  stageTitle,
  score,
  birdsLeftBonus,
  totalScore,
  stars,
  highScore,
  isNewHighScore,
  onNextStage,
  onReplay,
  onOpenStageSelect,
  isLastStage,
}) => {
  const [revealedStars, setRevealedStars] = useState(0);

  useEffect(() => {
    // Fire sound fanfare
    soundManager.playWin();

    // Trigger confetti bursts
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#facc15', '#ef4444', '#22c55e', '#3b82f6', '#f97316'],
    });

    // Staggered star chime animations
    const timeouts: NodeJS.Timeout[] = [];
    for (let i = 1; i <= stars; i++) {
      const t = setTimeout(() => {
        setRevealedStars(i);
        soundManager.playStar(i - 1);
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.45, x: 0.38 + i * 0.06 },
        });
      }, 350 * i);
      timeouts.push(t);
    }

    return () => timeouts.forEach(clearTimeout);
  }, [stars]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-4 border-yellow-400 rounded-3xl shadow-2xl p-6 text-center text-white overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Header Banner */}
        <div className="inline-block px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-game text-xl rounded-full border-2 border-white shadow-lg mb-2">
          ★ STAGE {stageId} CLEARED! ★
        </div>

        <h3 className="font-game text-2xl text-yellow-300 text-comic-stroke mb-4">
          {stageTitle}
        </h3>

        {/* 3 Animated Stars Container */}
        <div className="flex justify-center items-center gap-3 my-4 py-2">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            const isVisible = starIdx <= revealedStars;
            const isMiddle = starIdx === 2;

            return (
              <div
                key={starIdx}
                className={`relative transition-all duration-300 transform ${
                  isVisible
                    ? 'scale-100 opacity-100 rotate-0'
                    : 'scale-50 opacity-40 -rotate-12'
                } ${isMiddle ? '-translate-y-2' : ''}`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center border-3 ${
                    isEarned && isVisible
                      ? 'bg-amber-500 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.7)]'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <Star
                    className={`w-10 h-10 ${
                      isEarned && isVisible
                        ? 'text-yellow-300 fill-yellow-300 drop-shadow'
                        : 'text-slate-600'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Score Breakdown Card */}
        <div className="bg-slate-800/90 border-2 border-amber-400/40 rounded-2xl p-4 my-4 space-y-2 text-left font-game">
          <div className="flex justify-between items-center text-sm text-slate-300">
            <span>Destruction Score:</span>
            <span className="tabular-nums text-white font-bold">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-emerald-300">
            <span>Bird Reserve Bonus:</span>
            <span className="tabular-nums font-bold">+{birdsLeftBonus.toLocaleString()}</span>
          </div>
          <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-lg">
            <span className="text-yellow-400">Total Score:</span>
            <span className="tabular-nums font-extrabold text-2xl text-yellow-300">
              {totalScore.toLocaleString()}
            </span>
          </div>
          {isNewHighScore && (
            <div className="text-center pt-1 text-xs text-amber-300 font-bold flex items-center justify-center gap-1 animate-pulse">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              NEW HIGH SCORE!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-5">
          {!isLastStage ? (
            <button
              onClick={() => {
                soundManager.playClick();
                onNextStage();
              }}
              className="btn-cartoon-green py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 font-game text-xl tracking-wide text-white cursor-pointer transition-transform hover:scale-102 active:scale-98 border-2 border-green-200 shadow-lg"
            >
              NEXT STAGE
              <ArrowRight className="w-6 h-6" />
            </button>
          ) : (
            <div className="py-2 text-emerald-400 font-game text-lg animate-bounce">
              👑 ALL 20 STAGES CONQUERED! YOU ARE THE ULTIMATE SLINGSHOT MASTER!
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundManager.playClick();
                onReplay();
              }}
              className="flex-1 btn-cartoon-yellow py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-game text-base text-slate-900 cursor-pointer transition-transform hover:scale-102 active:scale-98 border-2 border-yellow-200"
            >
              <RotateCcw className="w-5 h-5 text-slate-900" />
              REPLAY
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenStageSelect();
              }}
              className="flex-1 btn-cartoon-blue py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-game text-base text-white cursor-pointer transition-transform hover:scale-102 active:scale-98 border-2 border-blue-200"
            >
              <Grid className="w-5 h-5 text-white" />
              STAGES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
