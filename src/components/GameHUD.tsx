import React from 'react';
import { Pause, RotateCcw, Volume2, VolumeX, Grid, Star, Target } from 'lucide-react';
import { BirdType, StageDef } from '../types/game';
import { BIRD_PROFILES } from '../levels/stages';
import { soundManager } from '../audio/soundManager';

interface GameHUDProps {
  stage: StageDef;
  score: number;
  highScore: number;
  remainingBirds: BirdType[];
  activeBirdType: BirdType | null;
  pigsRemaining: number;
  isInFlight: boolean;
  canUseAbility: boolean;
  onPause: () => void;
  onRestart: () => void;
  onOpenStageSelect: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleCameraTarget: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stage,
  score,
  highScore,
  remainingBirds,
  activeBirdType,
  pigsRemaining,
  isInFlight,
  canUseAbility,
  onPause,
  onRestart,
  onOpenStageSelect,
  isMuted,
  onToggleMute,
  onToggleCameraTarget,
  onZoomIn,
  onZoomOut,
}) => {
  // Star progress calculations
  const [t1, t2, t3] = stage.starThresholds;
  const currentStars = score >= t3 ? 3 : score >= t2 ? 2 : score >= t1 ? 1 : 0;
  const progressPercent = Math.min(100, Math.round((score / t3) * 100));

  const activeProfile = activeBirdType ? BIRD_PROFILES[activeBirdType] : null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 select-none">
      {/* Top Status Bar Cluster */}
      <div className="flex justify-between items-start gap-3">
        {/* Left: Stage Title & Star Tracker */}
        <div className="pointer-events-auto bg-slate-900/85 border-2 border-amber-400/60 rounded-2xl p-3 shadow-lg flex flex-col gap-1.5 min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="font-game text-xs text-amber-300 uppercase tracking-wider">
              {stage.world}
            </span>
            <span className="font-game text-xs text-emerald-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              {pigsRemaining} {pigsRemaining === 1 ? 'Pig' : 'Pigs'} left
            </span>
          </div>

          <h2 className="font-game text-lg text-white text-comic-shadow leading-tight">
            Stage {stage.id}: {stage.title}
          </h2>

          {/* Star Threshold Gauge */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-[11px] font-game text-slate-300">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= currentStars
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="tabular-nums text-amber-200">
                {score.toLocaleString()} / {t3.toLocaleString()} pts
              </span>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Score Board */}
        <div className="pointer-events-auto bg-slate-900/90 border-2 border-yellow-400/70 rounded-2xl px-5 py-2.5 shadow-xl text-center">
          <div className="text-[10px] font-game text-slate-400 uppercase tracking-widest">
            SCORE
          </div>
          <div className="font-game text-3xl text-yellow-300 tabular-nums text-comic-shadow">
            {score.toLocaleString()}
          </div>
          {highScore > 0 && (
            <div className="text-[11px] font-game text-amber-300/80 tabular-nums">
              BEST: {highScore.toLocaleString()}
            </div>
          )}
        </div>

        {/* Right: Quick Action Buttons & Camera Zoom */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Camera View Switch */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleCameraTarget();
            }}
            className="px-3 py-2 bg-slate-900/85 hover:bg-slate-800 border-2 border-cyan-400/50 hover:border-cyan-400 rounded-xl shadow-md transition cursor-pointer text-cyan-300 font-game text-xs active:scale-95"
            title="Toggle Camera View (Slingshot / Fort)"
          >
            👁️ VIEW
          </button>

          {/* Zoom controls */}
          <button
            onClick={() => {
              soundManager.playClick();
              onZoomIn();
            }}
            className="w-9 h-9 flex items-center justify-center bg-slate-900/85 hover:bg-slate-800 border-2 border-slate-600 rounded-xl shadow-md transition cursor-pointer text-white font-game text-base active:scale-95"
            title="Zoom In"
          >
            +
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onZoomOut();
            }}
            className="w-9 h-9 flex items-center justify-center bg-slate-900/85 hover:bg-slate-800 border-2 border-slate-600 rounded-xl shadow-md transition cursor-pointer text-white font-game text-base active:scale-95"
            title="Zoom Out"
          >
            -
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="p-2.5 bg-slate-900/85 hover:bg-slate-800 border-2 border-amber-400/50 hover:border-amber-400 rounded-xl shadow-md transition cursor-pointer text-yellow-400 active:scale-95"
            title="Restart Stage (R)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenStageSelect();
            }}
            className="p-2.5 bg-slate-900/85 hover:bg-slate-800 border-2 border-blue-400/50 hover:border-blue-400 rounded-xl shadow-md transition cursor-pointer text-blue-400 active:scale-95"
            title="Stages (1-20)"
          >
            <Grid className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleMute();
            }}
            className="p-2.5 bg-slate-900/85 hover:bg-slate-800 border-2 border-slate-600 hover:border-slate-500 rounded-xl shadow-md transition cursor-pointer text-slate-300 active:scale-95"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onPause();
            }}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 border-2 border-yellow-200 rounded-xl shadow-lg transition cursor-pointer text-slate-950 font-game active:scale-95 flex items-center gap-1.5"
            title="Pause (Esc)"
          >
            <Pause className="w-5 h-5 fill-slate-950" />
            <span className="hidden sm:inline text-xs">PAUSE</span>
          </button>
        </div>
      </div>

      {/* Mid-flight Ability Banner Prompt */}
      {isInFlight && canUseAbility && activeProfile && activeProfile.type !== 'red' && activeProfile.type !== 'terence' && (
        <div className="self-center pointer-events-none animate-bounce">
          <div className="bg-amber-500/95 border-2 border-yellow-200 px-6 py-2.5 rounded-full shadow-2xl text-slate-950 font-game text-base flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping" />
            TAP SCREEN: {activeProfile.abilityName}! ({activeProfile.abilityDesc})
          </div>
        </div>
      )}

      {/* Bottom Perimeter: Bird Reserve Lineup */}
      <div className="flex justify-between items-end">
        <div className="pointer-events-auto bg-slate-900/85 border-2 border-amber-400/50 rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-3">
          <span className="font-game text-xs text-amber-300 uppercase tracking-wider">
            RESERVE:
          </span>

          <div className="flex items-center gap-2">
            {remainingBirds.length === 0 ? (
              <span className="font-game text-xs text-slate-400">Last Bird in Slingshot!</span>
            ) : (
              remainingBirds.map((bType, idx) => {
                const prof = BIRD_PROFILES[bType] || BIRD_PROFILES.red;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center"
                    title={`${prof.name} (${prof.abilityName})`}
                  >
                    <div
                      className="w-7 h-7 rounded-full border-2 border-white/60 shadow flex items-center justify-center font-game text-[10px] text-white"
                      style={{ backgroundColor: prof.color }}
                    >
                      {prof.name[0]}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Slingshot pull hint */}
        <div className="hidden sm:block text-slate-700/80 font-game text-xs bg-white/60 px-3.5 py-1.5 rounded-full border border-slate-300 shadow-sm">
          Pull slingshot backward & release · Tap mid-flight for special ability!
        </div>
      </div>
    </div>
  );
};
