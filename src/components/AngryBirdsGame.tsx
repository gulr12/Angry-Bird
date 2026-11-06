import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BirdType, StageDef, ProgressMap, Particle, FloatingText, TrajectoryPoint } from '../types/game';
import { STAGES } from '../levels/stages';
import { GamePhysics } from '../physics/gamePhysics';
import { GameRenderer } from '../render/gameRenderer';
import { soundManager } from '../audio/soundManager';
import { TitleScreen } from './TitleScreen';
import { GameHUD } from './GameHUD';
import { StageSelectModal } from './StageSelectModal';
import { VictoryModal } from './VictoryModal';
import { DefeatModal } from './DefeatModal';
import { PauseModal } from './PauseModal';

type GameFlowState = 'title' | 'playing' | 'paused' | 'victory' | 'defeat';

const STORAGE_KEY = 'angry_birds_20stages_save_v1';

export const AngryBirdsGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level App State
  const [flowState, setFlowState] = useState<GameFlowState>('title');
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  const [showStageSelect, setShowStageSelect] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

  // Game Progress State
  const [progress, setProgress] = useState<ProgressMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    const initial: ProgressMap = {};
    for (let i = 1; i <= 20; i++) {
      initial[i] = { unlocked: i === 1, stars: 0, highScore: 0 };
    }
    return initial;
  });

  // Gameplay Run State
  const [score, setScore] = useState<number>(0);
  const [pigsCount, setPigsCount] = useState<number>(0);
  const [remainingBirdQueue, setRemainingBirdQueue] = useState<BirdType[]>([]);
  const [activeBirdType, setActiveBirdType] = useState<BirdType | null>(null);
  const [isInFlight, setIsInFlight] = useState<boolean>(false);
  const [canUseAbility, setCanUseAbility] = useState<boolean>(false);

  // Victory / Defeat Breakdown State
  const [victoryData, setVictoryData] = useState<{
    score: number;
    birdsBonus: number;
    totalScore: number;
    stars: number;
    isNewHigh: boolean;
  } | null>(null);

  // Mutable Game References (isolated from React state for 60fps loop)
  const currentStage = STAGES.find((s) => s.id === currentStageId) || STAGES[0];
  const stageRef = useRef<StageDef>(currentStage);
  stageRef.current = currentStage;

  const physicsRef = useRef<GamePhysics | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  const cameraRef = useRef({ x: 500, y: 390, zoom: 0.95 });
  const targetCameraX = useRef<number>(500);
  const shakeRef = useRef<number>(0);
  const hitstopRef = useRef<number>(0);

  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const floatingIdCounter = useRef<number>(0);

  // Slingshot Interaction State
  const slingshotRef = useRef({
    isDragging: false,
    dragPos: { x: 200, y: 440 },
    anchor: { x: 200, y: 440 },
    trajectory: [] as TrajectoryPoint[],
    currentBirdType: null as BirdType | null,
    waitingBirds: [] as BirdType[],
    lastStretchSoundTime: 0,
  });

  // Pan interaction
  const panRef = useRef({
    isPanning: false,
    startX: 0,
    startY: 0,
    camStartX: 0,
    camStartY: 0,
  });

  // Turn management timers
  const flightTimerRef = useRef<number>(0);
  const turnPhaseRef = useRef<'ready' | 'flying' | 'settling' | 'finished'>('ready');

  // Sync Audio Mute
  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  // Update Progress in LocalStorage
  const saveStageResult = useCallback(
    (stageId: number, totalScore: number, starsEarned: number) => {
      setProgress((prev) => {
        const current = prev[stageId] || { unlocked: true, stars: 0, highScore: 0 };
        const newStars = Math.max(current.stars, starsEarned);
        const newHighScore = Math.max(current.highScore, totalScore);

        const updated: ProgressMap = {
          ...prev,
          [stageId]: {
            unlocked: true,
            stars: newStars,
            highScore: newHighScore,
          },
        };

        if (stageId < 20 && updated[stageId + 1]) {
          updated[stageId + 1].unlocked = true;
        }

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }

        return updated;
      });
    },
    []
  );

  // --- Load Next Bird onto Slingshot ---
  const loadNextBird = useCallback(() => {
    const stage = stageRef.current;
    setRemainingBirdQueue((prev) => {
      if (prev.length === 0) {
        setActiveBirdType(null);
        slingshotRef.current.currentBirdType = null;
        slingshotRef.current.waitingBirds = [];
        return [];
      }

      const nextType = prev[0];
      const remaining = prev.slice(1);

      setActiveBirdType(nextType);
      slingshotRef.current.currentBirdType = nextType;
      slingshotRef.current.waitingBirds = remaining;
      slingshotRef.current.anchor = { ...stage.slingshotPos };
      slingshotRef.current.dragPos = { ...stage.slingshotPos };
      slingshotRef.current.trajectory = [];
      slingshotRef.current.isDragging = false;

      setIsInFlight(false);
      setCanUseAbility(false);
      turnPhaseRef.current = 'ready';
      targetCameraX.current = stage.slingshotPos.x + 280;

      return remaining;
    });
  }, []);

  // --- Initialize or Reset Stage ---
  const initStage = useCallback(
    (stageId: number) => {
      const stage = STAGES.find((s) => s.id === stageId) || STAGES[0];
      setCurrentStageId(stage.id);
      stageRef.current = stage;

      setScore(0);
      setPigsCount(stage.pigs.length);
      setVictoryData(null);
      setIsInFlight(false);
      setCanUseAbility(false);
      turnPhaseRef.current = 'ready';

      particlesRef.current = [];
      floatingTextsRef.current = [];

      // Slingshot setup
      const birdList = [...stage.birds];
      const firstBird = birdList.shift()!;

      slingshotRef.current.anchor = { ...stage.slingshotPos };
      slingshotRef.current.dragPos = { ...stage.slingshotPos };
      slingshotRef.current.trajectory = [];
      slingshotRef.current.isDragging = false;
      slingshotRef.current.currentBirdType = firstBird;
      slingshotRef.current.waitingBirds = birdList;

      setActiveBirdType(firstBird);
      setRemainingBirdQueue(birdList);

      // Camera reset
      targetCameraX.current = stage.slingshotPos.x + 280;
      cameraRef.current = { x: stage.slingshotPos.x + 280, y: 390, zoom: 0.95 };

      // Initialize Physics
      if (physicsRef.current) {
        physicsRef.current.initStage(stage);
      }
    },
    []
  );

  // --- Initialize Physics Engine Once ---
  useEffect(() => {
    const physics = new GamePhysics({
      onScoreAdd: (points, x, y, text) => {
        setScore((prev) => prev + points);
        if (text) {
          floatingIdCounter.current += 1;
          floatingTextsRef.current.push({
            id: floatingIdCounter.current,
            x,
            y,
            text,
            color: '#fbbf24',
            size: 26,
            alpha: 1,
            life: 0,
            maxLife: 45,
            vy: -1.8,
          });
        }
      },
      onPigDestroyed: (pigType, remainingPigs) => {
        setPigsCount(remainingPigs);
      },
      onHitstop: (durationMs) => {
        hitstopRef.current = durationMs;
      },
      onCameraShake: (intensity) => {
        shakeRef.current = Math.min(shakeRef.current + intensity, 14);
      },
      spawnParticles: (newParticles) => {
        particlesRef.current.push(...newParticles);
      },
    });

    physicsRef.current = physics;

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        rendererRef.current = new GameRenderer(ctx);
      }
    }

    initStage(1);
  }, [initStage]);

  // --- Main 60fps Animation Loop ---
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      const canvas = canvasRef.current;
      const physics = physicsRef.current;
      const renderer = rendererRef.current;
      if (!canvas || !physics || !renderer) return;

      // Hitstop delay check
      if (hitstopRef.current > 0) {
        hitstopRef.current -= dt * 1000;
        return;
      }

      // Physics update if playing
      if (flowState === 'playing') {
        physics.update(dt * 1000);

        // Turn Phase logic
        if (turnPhaseRef.current === 'flying') {
          flightTimerRef.current += dt;

          const isSettled = physics.isSettled();
          if (isSettled || flightTimerRef.current > 6.0) {
            turnPhaseRef.current = 'settling';
          }
        } else if (turnPhaseRef.current === 'settling') {
          // Check win / lose condition
          if (physics.pigs.length === 0) {
            // Victory!
            turnPhaseRef.current = 'finished';
            const bonus = remainingBirdQueue.length * 10000;
            const total = score + bonus;
            const stage = stageRef.current;
            const stars = total >= stage.starThresholds[2] ? 3 : total >= stage.starThresholds[1] ? 2 : 1;

            const curHigh = progress[stage.id]?.highScore || 0;
            const isNewHigh = total > curHigh;

            saveStageResult(stage.id, total, stars);

            setVictoryData({
              score,
              birdsBonus: bonus,
              totalScore: total,
              stars,
              isNewHigh,
            });

            setTimeout(() => {
              setFlowState('victory');
            }, 1200);
          } else if (remainingBirdQueue.length > 0) {
            // Wait 1 second and load next bird
            turnPhaseRef.current = 'finished';
            setTimeout(() => {
              loadNextBird();
            }, 1000);
          } else {
            // No birds left and pigs survive -> Defeat
            turnPhaseRef.current = 'finished';
            setTimeout(() => {
              setFlowState('defeat');
            }, 1400);
          }
        }
      }

      // --- Camera Tracking ---
      if (flowState === 'playing') {
        if (turnPhaseRef.current === 'flying' && physics.activeBird) {
          const birdPos = physics.activeBird.position;
          targetCameraX.current = Math.max(stageRef.current.slingshotPos.x + 100, Math.min(birdPos.x, 1400));
        }

        // Smooth camera lerp towards target
        cameraRef.current.x += (targetCameraX.current - cameraRef.current.x) * 0.08;
        cameraRef.current.y += (390 - cameraRef.current.y) * 0.08;

        // Camera shake
        if (shakeRef.current > 0.1) {
          const sx = (Math.random() - 0.5) * shakeRef.current * 2;
          const sy = (Math.random() - 0.5) * shakeRef.current * 2;
          cameraRef.current.x += sx;
          cameraRef.current.y += sy;
          shakeRef.current *= 0.88;
        } else {
          shakeRef.current = 0;
        }
      }

      // --- Update Particles ---
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.type === 'debris') {
          p.vy += 0.3;
        } else if (p.type === 'smoke') {
          p.size += 0.25;
          p.vy *= 0.95;
        }

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      // --- Update Floating Texts ---
      const floating = floatingTextsRef.current;
      for (let i = floating.length - 1; i >= 0; i--) {
        const ft = floating[i];
        ft.life += 1;
        ft.y += ft.vy;
        ft.alpha = 1 - ft.life / ft.maxLife;
        if (ft.life >= ft.maxLife) {
          floating.splice(i, 1);
        }
      }

      // --- Render Frame ---
      renderer.render(
        stageRef.current,
        physics,
        cameraRef.current,
        slingshotRef.current,
        particles,
        floating,
        currentTime
      );
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [flowState, loadNextBird, remainingBirdQueue.length, score, progress, saveStageResult]);

  // --- Resize Canvas to Viewport ---
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Coordinate Converter (Screen -> World) with Bounding Rect ---
  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: clientX, y: clientY };

    const rect = canvas.getBoundingClientRect();
    const screenX = (clientX - rect.left) * (canvas.width / rect.width);
    const screenY = (clientY - rect.top) * (canvas.height / rect.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const { x: camX, y: camY, zoom } = cameraRef.current;

    const worldX = (screenX - cx) / zoom + camX;
    const worldY = (screenY - cy) / zoom + camY;
    return { x: worldX, y: worldY };
  }, []);

  // --- Slingshot & Input Handlers ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (flowState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const worldPos = screenToWorld(e.clientX, e.clientY);
    const slingshot = slingshotRef.current;

    // 1. Check if clicking mid-flight to trigger special ability
    if (turnPhaseRef.current === 'flying' && canUseAbility && physicsRef.current) {
      const used = physicsRef.current.triggerBirdAbility();
      if (used) {
        setCanUseAbility(false);
        return;
      }
    }

    // 2. Check if grabbing slingshot anchor or bird
    const dx = worldPos.x - slingshot.anchor.x;
    const dy = worldPos.y - slingshot.anchor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 110 && turnPhaseRef.current === 'ready' && activeBirdType) {
      slingshot.isDragging = true;
      slingshot.dragPos = { ...worldPos };
    } else {
      // 3. Otherwise, start camera pan
      panRef.current = {
        isPanning: true,
        startX: e.clientX,
        startY: e.clientY,
        camStartX: cameraRef.current.x,
        camStartY: cameraRef.current.y,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (flowState !== 'playing') return;

    const slingshot = slingshotRef.current;

    if (slingshot.isDragging) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const dx = worldPos.x - slingshot.anchor.x;
      const dy = worldPos.y - slingshot.anchor.y;
      const angle = Math.atan2(dy, dx);
      const rawDist = Math.sqrt(dx * dx + dy * dy);
      const maxPull = 95;
      const dist = Math.min(rawDist, maxPull);

      const clampedX = slingshot.anchor.x + Math.cos(angle) * dist;
      const clampedY = slingshot.anchor.y + Math.sin(angle) * dist;
      slingshot.dragPos = { x: clampedX, y: clampedY };

      // Calculate launch velocity
      const speedFactor = 0.40;
      const vx = -Math.cos(angle) * dist * speedFactor;
      const vy = -Math.sin(angle) * dist * speedFactor;

      // Realistic trajectory arc prediction matching Matter.js physics step
      const trajectory: TrajectoryPoint[] = [];
      const gStep = 0.277; // Exactly matches Matter.js delta = 16.666
      for (let t = 0; t < 38; t += 1.3) {
        const tx = clampedX + vx * t;
        const ty = clampedY + vy * t + 0.5 * gStep * (t * t);
        if (ty > 550) break;
        trajectory.push({ x: tx, y: ty });
      }
      slingshot.trajectory = trajectory;

      // Play audio stretch feedback
      const now = performance.now();
      if (now - slingshot.lastStretchSoundTime > 160 && dist > 20) {
        soundManager.playStretch(dist / maxPull);
        slingshot.lastStretchSoundTime = now;
      }
    } else if (panRef.current.isPanning) {
      const dx = (e.clientX - panRef.current.startX) / cameraRef.current.zoom;
      const dy = (e.clientY - panRef.current.startY) / cameraRef.current.zoom;

      cameraRef.current.x = Math.max(200, Math.min(panRef.current.camStartX - dx, 1600));
      cameraRef.current.y = Math.max(240, Math.min(panRef.current.camStartY - dy, 520));
      targetCameraX.current = cameraRef.current.x;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    const slingshot = slingshotRef.current;

    if (slingshot.isDragging) {
      slingshot.isDragging = false;
      const dx = slingshot.dragPos.x - slingshot.anchor.x;
      const dy = slingshot.dragPos.y - slingshot.anchor.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 18 && activeBirdType && physicsRef.current) {
        // Fire bird!
        const angle = Math.atan2(dy, dx);
        const speedFactor = 0.40;
        const vx = -Math.cos(angle) * dist * speedFactor;
        const vy = -Math.sin(angle) * dist * speedFactor;

        // Dynamically spawn dynamic bird body in Matter.js
        physicsRef.current.launchBird(
          activeBirdType,
          slingshot.dragPos.x,
          slingshot.dragPos.y,
          vx,
          vy
        );

        soundManager.playLaunch(activeBirdType);

        turnPhaseRef.current = 'flying';
        flightTimerRef.current = 0;
        setIsInFlight(true);
        setCanUseAbility(true);

        slingshot.trajectory = [];
        slingshot.currentBirdType = null;
      } else {
        // Snap back to anchor if pull was too short
        slingshot.dragPos = { ...slingshot.anchor };
        slingshot.trajectory = [];
      }
    }

    panRef.current.isPanning = false;
  };

  // Zoom via wheel
  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    cameraRef.current.zoom = Math.max(0.65, Math.min(cameraRef.current.zoom + delta, 1.35));
  };

  // Toggle Camera View between Slingshot and Fortress
  const handleToggleCameraTarget = () => {
    if (targetCameraX.current < 600) {
      targetCameraX.current = 980; // View fortress
    } else {
      targetCameraX.current = stageRef.current.slingshotPos.x + 280; // View slingshot
    }
  };

  const handleZoomIn = () => {
    cameraRef.current.zoom = Math.min(cameraRef.current.zoom + 0.1, 1.35);
  };

  const handleZoomOut = () => {
    cameraRef.current.zoom = Math.max(cameraRef.current.zoom - 0.1, 0.65);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (flowState === 'playing') {
          soundManager.playClick();
          setFlowState('paused');
        } else if (flowState === 'paused') {
          soundManager.playClick();
          setFlowState('playing');
        }
      } else if (e.code === 'KeyR' && (flowState === 'playing' || flowState === 'paused')) {
        soundManager.playClick();
        initStage(currentStageId);
        setFlowState('playing');
      } else if (e.code === 'KeyM') {
        handleToggleMute();
      } else if (e.code === 'Space') {
        if (flowState === 'playing' && turnPhaseRef.current === 'flying' && canUseAbility) {
          if (physicsRef.current?.triggerBirdAbility()) {
            setCanUseAbility(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flowState, currentStageId, initStage, handleToggleMute, canUseAbility]);

  // Aggregate Stats
  const totalStars = Object.values(progress).reduce((acc, curr) => acc + curr.stars, 0);
  const unlockedCount = Object.values(progress).filter((p) => p.unlocked).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 font-game">
      {/* 60fps Physics & Canvas Playfield */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
      />

      {/* Title Screen Overlay */}
      {flowState === 'title' && (
        <TitleScreen
          onStartGame={() => {
            initStage(currentStageId);
            setFlowState('playing');
          }}
          onOpenStageSelect={() => setShowStageSelect(true)}
          totalStars={totalStars}
          unlockedStageCount={unlockedCount}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Gameplay HUD */}
      {flowState === 'playing' && (
        <GameHUD
          stage={currentStage}
          score={score}
          highScore={progress[currentStage.id]?.highScore || 0}
          remainingBirds={remainingBirdQueue}
          activeBirdType={activeBirdType}
          pigsRemaining={pigsCount}
          isInFlight={isInFlight}
          canUseAbility={canUseAbility}
          onPause={() => setFlowState('paused')}
          onRestart={() => initStage(currentStage.id)}
          onOpenStageSelect={() => setShowStageSelect(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onToggleCameraTarget={handleToggleCameraTarget}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      )}

      {/* Pause Modal */}
      {flowState === 'paused' && (
        <PauseModal
          stageId={currentStage.id}
          stageTitle={currentStage.title}
          onResume={() => setFlowState('playing')}
          onRestart={() => {
            initStage(currentStage.id);
            setFlowState('playing');
          }}
          onOpenStageSelect={() => setShowStageSelect(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Victory Modal */}
      {flowState === 'victory' && victoryData && (
        <VictoryModal
          stageId={currentStage.id}
          stageTitle={currentStage.title}
          score={victoryData.score}
          birdsLeftBonus={victoryData.birdsBonus}
          totalScore={victoryData.totalScore}
          stars={victoryData.stars}
          highScore={progress[currentStage.id]?.highScore || 0}
          isNewHighScore={victoryData.isNewHigh}
          onNextStage={() => {
            const nextId = Math.min(20, currentStage.id + 1);
            initStage(nextId);
            setFlowState('playing');
          }}
          onReplay={() => {
            initStage(currentStage.id);
            setFlowState('playing');
          }}
          onOpenStageSelect={() => setShowStageSelect(true)}
          isLastStage={currentStage.id === 20}
        />
      )}

      {/* Defeat Modal */}
      {flowState === 'defeat' && (
        <DefeatModal
          stageId={currentStage.id}
          stageTitle={currentStage.title}
          score={score}
          onRetry={() => {
            initStage(currentStage.id);
            setFlowState('playing');
          }}
          onOpenStageSelect={() => setShowStageSelect(true)}
        />
      )}

      {/* Stage Select Modal */}
      {showStageSelect && (
        <StageSelectModal
          progress={progress}
          currentStageId={currentStage.id}
          onSelectStage={(stageId) => {
            setShowStageSelect(false);
            initStage(stageId);
            setFlowState('playing');
          }}
          onClose={() => setShowStageSelect(false)}
        />
      )}
    </div>
  );
};
