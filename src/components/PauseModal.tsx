import React from 'react';
import { Play, RotateCcw, Grid, Volume2, VolumeX, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseModalProps {
  stageId: number;
  stageTitle: string;
  onResume: () => void;
  onRestart: () => void;
  onOpenStageSelect: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  stageId,
  stageTitle,
  onResume,
  onRestart,
  onOpenStageSelect,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-slate-900 border-4 border-amber-400 rounded-3xl shadow-2xl p-6 text-center text-white">
        <h3 className="font-game text-3xl text-amber-300 text-comic-stroke mb-1">
          GAME PAUSED
        </h3>
        <p className="font-game text-sm text-slate-300 mb-6">
          Stage {stageId}: {stageTitle}
        </p>

        <div className="flex flex-col gap-3 font-game">
          <button
            onClick={() => {
              soundManager.playClick();
              onResume();
            }}
            className="btn-cartoon-green py-3 px-5 rounded-2xl flex items-center justify-center gap-2 text-xl tracking-wide cursor-pointer border-2 border-green-200"
          >
            <Play className="w-6 h-6 fill-white" />
            RESUME
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="btn-cartoon-yellow py-3 px-5 rounded-2xl flex items-center justify-center gap-2 text-slate-900 text-lg tracking-wide cursor-pointer border-2 border-yellow-200"
          >
            <RotateCcw className="w-5 h-5 text-slate-900" />
            RESTART STAGE
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenStageSelect();
            }}
            className="btn-cartoon-blue py-3 px-5 rounded-2xl flex items-center justify-center gap-2 text-white text-lg tracking-wide cursor-pointer border-2 border-blue-200"
          >
            <Grid className="w-5 h-5 text-white" />
            SELECT STAGE
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleMute();
            }}
            className="mt-2 py-2 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-2 text-sm text-slate-300 border border-slate-700 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            {isMuted ? 'UNMUTE SOUND' : 'MUTE SOUND'}
          </button>
        </div>
      </div>
    </div>
  );
};
