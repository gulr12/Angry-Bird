export type BirdType = 'red' | 'chuck' | 'bomb' | 'blues' | 'matilda' | 'terence';

export type MaterialType = 'wood' | 'ice' | 'stone' | 'tnt';

export type PigType = 'minion_small' | 'minion_medium' | 'helmet' | 'corporal' | 'king';

export interface BirdDef {
  type: BirdType;
  radius: number;
  mass: number;
  color: string;
  name: string;
  abilityName: string;
  abilityDesc: string;
}

export interface BlockDef {
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  material: MaterialType;
  health?: number;
  shape?: 'rectangle' | 'circle';
}

export interface PigDef {
  x: number;
  y: number;
  type: PigType;
  health?: number;
}

export interface StageDef {
  id: number;
  title: string;
  world: string;
  description: string;
  slingshotPos: { x: number; y: number };
  birds: BirdType[];
  blocks: BlockDef[];
  pigs: PigDef[];
  starThresholds: [number, number, number]; // 1-star, 2-star, 3-star
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  rotation: number;
  vRot: number;
  type?: 'debris' | 'feather' | 'smoke' | 'spark' | 'egg';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  vy: number;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
}

export interface StageProgress {
  unlocked: boolean;
  stars: number;
  highScore: number;
}

export type ProgressMap = Record<number, StageProgress>;
