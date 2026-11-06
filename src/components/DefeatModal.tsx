import React, { useEffect } from 'react';
import { RotateCcw, Grid, AlertCircle } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface DefeatModalProps {
  stageId: number;
  stageTitle: string;
  score: number;
  onRetry: () => void;
  onOpenStageSelect: () => void;
}

export const DefeatModal: React.FC<DefeatModalProps> = ({
  stageId,
  stageTitle,
  score,
  onRetry,
  onOpenStageSelect,
}) => {
  useEffect(() => {
    soundManager.playFail();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-4 border-red-500 rounded-3xl shadow-2xl p-6 text-center text-white overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Header Banner */}
        <div className="inline-block px-6 py-2 bg-gradient-to-r from-red-600 to-rose-500 text-white font-game text-xl rounded-full border-2 border-white shadow-lg mb-2">
          LEVEL FAILED
        </div>

        <h3 className="font-game text-2xl text-slate-200 text-comic-stroke mb-3">
          Stage {stageId}: {stageTitle}
        </h3>

        <div className="my-4 p-4 bg-slate-800/90 border-2 border-red-500/40 rounded-2xl text-slate-300 font-game text-sm space-y-2">
          <p className="text-red-300 text-base">
            The greedy pigs survived!
          </p>
          <p className="text-xs text-slate-400">
            Tip: Aim for the bottom supporting stilts or detonate TNT barrels for maximum destruction!
          </p>
          <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm">
            <span>Score Achieved:</span>
            <span className="text-amber-400 font-bold tabular-nums text-base">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-5">
          <button
            onClick={() => {
              soundManager.playClick();
              onRetry();
            }}
            className="btn-cartoon-yellow py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 font-game text-xl tracking-wide text-slate-900 cursor-pointer transition-transform hover:scale-102 active:scale-98 border-2 border-yellow-200 shadow-lg"
          >
            <RotateCcw className="w-6 h-6 text-slate-900" />
            TRY AGAIN
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenStageSelect();
            }}
            className="btn-cartoon-blue py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-game text-base text-white cursor-pointer transition-transform hover:scale-102 active:scale-98 border-2 border-blue-200"
          >
            <Grid className="w-5 h-5 text-white" />
            STAGE SELECT
          </button>
        </div>
      </div>
    </div>
  );
};
