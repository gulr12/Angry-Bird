import React from 'react';
import { X, Lock, Star, Trophy, Sparkles } from 'lucide-react';
import { STAGES } from '../levels/stages';
import { ProgressMap } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface StageSelectModalProps {
  progress: ProgressMap;
  onSelectStage: (stageId: number) => void;
  onClose: () => void;
  currentStageId: number;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  progress,
  onSelectStage,
  onClose,
  currentStageId,
}) => {
  // Group stages by world
  const worlds = [
    { name: 'Sunny Plains', stages: STAGES.slice(0, 5), color: 'from-amber-400 to-emerald-500' },
    { name: 'Frozen Glacier', stages: STAGES.slice(5, 10), color: 'from-cyan-400 to-blue-600' },
    { name: 'Rocky Stronghold', stages: STAGES.slice(10, 15), color: 'from-orange-500 to-amber-700' },
    { name: "King's Domain", stages: STAGES.slice(15, 20), color: 'from-purple-500 to-indigo-700' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-4 border-amber-400 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 border-b-4 border-amber-600 text-white">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-300 drop-shadow" />
            <h2 className="font-game text-3xl tracking-wide text-comic-stroke">
              SELECT STAGE (1 – 20)
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 bg-black/25 hover:bg-black/40 rounded-xl transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-7 h-7 text-white" />
          </button>
        </div>

        {/* Stages Grid Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {worlds.map((world, wIdx) => (
            <div key={world.name} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <h3 className="font-game text-xl text-amber-300 uppercase tracking-wider">
                  World {wIdx + 1}: {world.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {world.stages.map((stage) => {
                  const stageProg = progress[stage.id] || { unlocked: stage.id === 1, stars: 0, highScore: 0 };
                  const isCurrent = stage.id === currentStageId;
                  const isLocked = !stageProg.unlocked;

                  return (
                    <button
                      key={stage.id}
                      disabled={isLocked}
                      onClick={() => {
                        soundManager.playClick();
                        onSelectStage(stage.id);
                      }}
                      className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        isLocked
                          ? 'bg-slate-800/80 border-slate-700 opacity-60 cursor-not-allowed'
                          : isCurrent
                          ? 'bg-amber-500 border-yellow-200 shadow-lg scale-105 ring-4 ring-yellow-400/50'
                          : 'bg-slate-800 hover:bg-slate-700 border-amber-400/50 hover:border-amber-400 hover:scale-102'
                      }`}
                    >
                      {/* Stage Number Badge */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-game text-xl shadow-inner mb-1 bg-slate-900 border-2 border-amber-400 text-amber-300">
                        {isLocked ? <Lock className="w-5 h-5 text-slate-400" /> : stage.id}
                      </div>

                      {/* Stage Title */}
                      <span className="font-game text-xs text-center text-slate-200 line-clamp-1 mb-2">
                        {stage.title}
                      </span>

                      {/* Stars Earned */}
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3].map((starNum) => (
                          <Star
                            key={starNum}
                            className={`w-4 h-4 ${
                              starNum <= stageProg.stars
                                ? 'text-yellow-400 fill-yellow-400 drop-shadow'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>

                      {/* High Score readout */}
                      <span className="font-game text-[11px] text-amber-200/80 tabular-nums">
                        {stageProg.highScore > 0 ? `${stageProg.highScore.toLocaleString()} pts` : '-'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t-2 border-slate-800 flex justify-between items-center text-xs text-slate-400 font-game">
          <span>Complete stages with high scores to earn up to 3 stars per stage!</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-600 transition cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
