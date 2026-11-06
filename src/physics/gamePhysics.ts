import Matter from 'matter-js';
import { BirdType, MaterialType, PigType, StageDef, Particle, FloatingText } from '../types/game';
import { BIRD_PROFILES } from '../levels/stages';
import { soundManager } from '../audio/soundManager';

const { Engine, World, Bodies, Body } = Matter;

export interface GamePhysicsCallbacks {
  onScoreAdd: (points: number, x: number, y: number, text?: string) => void;
  onPigDestroyed: (pigType: PigType, remainingPigs: number) => void;
  onHitstop: (durationMs: number) => void;
  onCameraShake: (intensity: number) => void;
  spawnParticles: (particles: Particle[]) => void;
}

export interface CustomBodyData {
  entityType: 'bird' | 'pig' | 'block' | 'tnt' | 'egg' | 'ground';
  birdType?: BirdType;
  pigType?: PigType;
  material?: MaterialType;
  health: number;
  maxHealth: number;
  points: number;
  hasUsedAbility?: boolean;
  isDead?: boolean;
  spawnTime?: number;
  fearTimer?: number;
}

export class GamePhysics {
  public engine: Matter.Engine;
  public world: Matter.World;
  private callbacks: GamePhysicsCallbacks;

  public ground: Matter.Body | null = null;
  public activeBird: Matter.Body | null = null;
  public extraBirds: Matter.Body[] = [];
  public blocks: Matter.Body[] = [];
  public pigs: Matter.Body[] = [];
  public eggs: Matter.Body[] = [];

  private isExploding: boolean = false;
  private pendingRemovals: Set<Matter.Body> = new Set();

  constructor(callbacks: GamePhysicsCallbacks) {
    this.callbacks = callbacks;
    this.engine = Engine.create({
      enableSleeping: false,
    });
    this.world = this.engine.world;
    // Standard realistic cartoon gravity
    this.world.gravity.y = 1.0;
    this.world.gravity.scale = 0.001;

    this.setupCollisionHandlers();
  }

  public initStage(stage: StageDef) {
    // Clear existing world
    World.clear(this.world, false);
    Engine.clear(this.engine);
    this.pendingRemovals.clear();
    this.activeBird = null;
    this.extraBirds = [];
    this.blocks = [];
    this.pigs = [];
    this.eggs = [];

    // 1. Create Ground (Ground level is at y: 550)
    const groundY = 550;
    this.ground = Bodies.rectangle(1200, groundY + 50, 4000, 100, {
      isStatic: true,
      friction: 0.9,
      restitution: 0.1,
      label: 'ground',
    });
    (this.ground as unknown as { customData: CustomBodyData }).customData = {
      entityType: 'ground',
      health: 999999,
      maxHealth: 999999,
      points: 0,
    };

    // Right boundary far out to prevent infinite flight
    const rightWall = Bodies.rectangle(2600, 300, 100, 1200, {
      isStatic: true,
      label: 'wall',
    });

    World.add(this.world, [this.ground, rightWall]);

    // 2. Spawn Blocks
    stage.blocks.forEach((bDef, index) => {
      let density = 0.0015;
      let friction = 0.6;
      let restitution = 0.12;
      let health = 45;
      let points = 500;

      if (bDef.material === 'wood') {
        density = 0.002;
        friction = 0.65;
        restitution = 0.15;
        health = 50;
        points = 500;
      } else if (bDef.material === 'ice') {
        density = 0.0012;
        friction = 0.15;
        restitution = 0.1;
        health = 25;
        points = 400;
      } else if (bDef.material === 'stone') {
        density = 0.0045;
        friction = 0.85;
        restitution = 0.05;
        health = 110;
        points = 1000;
      } else if (bDef.material === 'tnt') {
        density = 0.0018;
        friction = 0.7;
        restitution = 0.2;
        health = 20;
        points = 1500;
      }

      if (bDef.health) health = bDef.health;

      const body = Bodies.rectangle(bDef.x, bDef.y, bDef.width, bDef.height, {
        density,
        friction,
        restitution,
        angle: bDef.angle || 0,
        label: `block_${index}`,
      });

      (body as unknown as { customData: CustomBodyData }).customData = {
        entityType: bDef.material === 'tnt' ? 'tnt' : 'block',
        material: bDef.material,
        health,
        maxHealth: health,
        points,
      };

      this.blocks.push(body);
      World.add(this.world, body);
    });

    // 3. Spawn Pigs
    stage.pigs.forEach((pDef, index) => {
      let radius = 18;
      let health = pDef.health || 35;
      let points = 5000;
      let density = 0.002;

      if (pDef.type === 'minion_small') {
        radius = 16;
        health = 25;
        points = 5000;
      } else if (pDef.type === 'minion_medium') {
        radius = 20;
        health = 45;
        points = 7000;
      } else if (pDef.type === 'helmet') {
        radius = 22;
        health = 85;
        points = 10000;
        density = 0.0028;
      } else if (pDef.type === 'corporal') {
        radius = 23;
        health = 110;
        points = 12000;
        density = 0.003;
      } else if (pDef.type === 'king') {
        radius = 32;
        health = 200;
        points = 25000;
        density = 0.004;
      }

      const body = Bodies.circle(pDef.x, pDef.y, radius, {
        density,
        friction: 0.65,
        restitution: 0.25,
        label: `pig_${index}`,
      });

      (body as unknown as { customData: CustomBodyData }).customData = {
        entityType: 'pig',
        pigType: pDef.type,
        health,
        maxHealth: health,
        points,
        fearTimer: 0,
      };

      this.pigs.push(body);
      World.add(this.world, body);
    });
  }

  // Launch bird dynamically from drag position
  public launchBird(birdType: BirdType, startX: number, startY: number, vx: number, vy: number): Matter.Body {
    const profile = BIRD_PROFILES[birdType];
    const body = Bodies.circle(startX, startY, profile.radius, {
      density: 0.0035 * profile.mass,
      friction: 0.5,
      restitution: 0.3,
      label: 'bird',
    });

    (body as unknown as { customData: CustomBodyData }).customData = {
      entityType: 'bird',
      birdType,
      health: 9999,
      maxHealth: 9999,
      points: 0,
      hasUsedAbility: false,
      spawnTime: performance.now(),
    };

    Body.setVelocity(body, { x: vx, y: vy });
    Body.setAngularVelocity(body, vx * 0.012);

    this.activeBird = body;
    World.add(this.world, body);
    return body;
  }

  // Trigger special mid-flight ability
  public triggerBirdAbility(): boolean {
    if (!this.activeBird) return false;
    const data = (this.activeBird as unknown as { customData: CustomBodyData }).customData;
    if (!data || data.hasUsedAbility) return false;

    data.hasUsedAbility = true;
    soundManager.playAbility(data.birdType!);

    const vel = this.activeBird.velocity;
    const pos = this.activeBird.position;

    if (data.birdType === 'chuck') {
      // Supersonic Yellow Dash
      const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
      const dirX = speed > 0 ? vel.x / speed : 1;
      const dirY = speed > 0 ? vel.y / speed : -0.2;
      const boostSpeed = Math.max(speed * 2.5, 38);
      Body.setVelocity(this.activeBird, { x: dirX * boostSpeed, y: dirY * boostSpeed });

      this.callbacks.onHitstop(35);
      this.callbacks.onCameraShake(5);
      this.spawnSpeedTrail(pos.x, pos.y, '#fde047');
      return true;
    }

    if (data.birdType === 'bomb') {
      // Immediate bomb explosion
      this.explodeAt(pos.x, pos.y, 240, 200, false);
      this.removeBody(this.activeBird);
      this.activeBird = null;
      return true;
    }

    if (data.birdType === 'blues') {
      // Triple Split: duplicate 2 new blue birds
      const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
      const angle = Math.atan2(vel.y, vel.x);

      const angles = [angle - 0.22, angle + 0.22];
      angles.forEach((a) => {
        const newBird = Bodies.circle(pos.x, pos.y, 14, {
          density: 0.0025,
          friction: 0.5,
          restitution: 0.35,
          label: 'bird_sub',
        });
        (newBird as unknown as { customData: CustomBodyData }).customData = {
          entityType: 'bird',
          birdType: 'blues',
          health: 9999,
          maxHealth: 9999,
          points: 0,
          hasUsedAbility: true,
        };
        Body.setVelocity(newBird, {
          x: Math.cos(a) * speed,
          y: Math.sin(a) * speed,
        });
        World.add(this.world, newBird);
        this.extraBirds.push(newBird);
      });
      return true;
    }

    if (data.birdType === 'matilda') {
      // Egg Bomb: drop explosive egg straight down and launch Matilda up-forward!
      const egg = Bodies.circle(pos.x, pos.y + 20, 16, {
        density: 0.006,
        friction: 0.8,
        restitution: 0.05,
        label: 'egg',
      });
      (egg as unknown as { customData: CustomBodyData }).customData = {
        entityType: 'egg',
        health: 10,
        maxHealth: 10,
        points: 0,
      };
      Body.setVelocity(egg, { x: vel.x * 0.2, y: 18 });
      World.add(this.world, egg);
      this.eggs.push(egg);

      // Matilda boost up and right
      Body.setVelocity(this.activeBird, { x: Math.max(vel.x * 1.1, 10), y: -16 });
      this.callbacks.onCameraShake(4);
      return true;
    }

    if (data.birdType === 'red') {
      // Red Battle Cry
      Body.setVelocity(this.activeBird, { x: vel.x * 1.35, y: vel.y * 1.35 });
      this.callbacks.onCameraShake(3);
      return true;
    }

    return false;
  }

  // Handle Collisions
  private setupCollisionHandlers() {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA as unknown as { customData?: CustomBodyData; label: string };
        const bodyB = pair.bodyB as unknown as { customData?: CustomBodyData; label: string };

        const dataA = bodyA.customData;
        const dataB = bodyB.customData;

        // Calculate impact speed
        const vx = pair.bodyA.velocity.x - pair.bodyB.velocity.x;
        const vy = pair.bodyA.velocity.y - pair.bodyB.velocity.y;
        const relSpeed = Math.sqrt(vx * vx + vy * vy);

        // Check egg collision
        if (dataA?.entityType === 'egg' || dataB?.entityType === 'egg') {
          const eggBody = dataA?.entityType === 'egg' ? pair.bodyA : pair.bodyB;
          this.explodeAt(eggBody.position.x, eggBody.position.y, 220, 180, false);
          this.removeBody(eggBody);
          return;
        }

        // Damage calculation
        const damageA = this.calculateDamage(dataB, dataA, relSpeed);
        const damageB = this.calculateDamage(dataA, dataB, relSpeed);

        if (damageA > 0 && dataA) {
          this.applyDamage(pair.bodyA, dataA, damageA);
        }
        if (damageB > 0 && dataB) {
          this.applyDamage(pair.bodyB, dataB, damageB);
        }

        // Impact camera shake
        if (relSpeed > 7) {
          this.callbacks.onCameraShake(Math.min(relSpeed * 0.45, 8));
        }
      });
    });
  }

  private calculateDamage(attackerData?: CustomBodyData, victimData?: CustomBodyData, relSpeed: number = 0): number {
    if (!victimData || victimData.entityType === 'ground' || victimData.entityType === 'bird') return 0;

    let baseDamage = relSpeed * 8;

    // Crushing damage when heavy blocks fall on pigs
    if (victimData.entityType === 'pig') {
      if (attackerData?.entityType === 'block' || attackerData?.material === 'stone' || attackerData?.material === 'wood') {
        baseDamage = Math.max(baseDamage, relSpeed * 12 + 10);
      }
    }

    // Attacker multipliers
    if (attackerData?.entityType === 'bird') {
      if (attackerData.birdType === 'terence') {
        baseDamage *= 3.8; // Devastating juggernaut
      } else if (attackerData.birdType === 'chuck' && victimData.material === 'wood') {
        baseDamage *= 3.2; // Chuck shreds wood
      } else if (attackerData.birdType === 'blues' && victimData.material === 'ice') {
        baseDamage *= 3.4; // Blues shatter ice
      } else if (attackerData.birdType === 'bomb') {
        baseDamage *= 2.5;
      }
    } else if (attackerData?.material === 'stone') {
      baseDamage *= 2.0; // Falling stone is lethal
    }

    // Victim defenses
    if (victimData.material === 'stone') {
      baseDamage *= 0.45;
    } else if (victimData.material === 'ice') {
      baseDamage *= 1.5;
    } else if (victimData.entityType === 'tnt') {
      if (relSpeed > 2.5) {
        return 9999; // Detonate TNT easily on solid impact
      }
    }

    return baseDamage;
  }

  private applyDamage(body: Matter.Body, data: CustomBodyData, damage: number) {
    if (data.isDead) return;

    data.health -= damage;

    // Sound feedback
    if (data.entityType === 'pig') {
      soundManager.playPigHit();
      data.fearTimer = 35;
    } else if (data.material) {
      soundManager.playHit(data.material, damage / 35);
    }

    if (data.health <= 0) {
      data.isDead = true;
      this.pendingRemovals.add(body);

      const pos = body.position;

      if (data.entityType === 'tnt') {
        // Explode TNT!
        this.explodeAt(pos.x, pos.y, 230, 180, true);
      } else if (data.entityType === 'pig') {
        // Destroy Pig!
        soundManager.playPigPoof();
        this.callbacks.onScoreAdd(data.points, pos.x, pos.y, `+${data.points}`);
        this.spawnPigDebris(pos.x, pos.y, data.pigType!);
        this.callbacks.onHitstop(40);
        this.callbacks.onCameraShake(5);
      } else if (data.entityType === 'block') {
        // Destroy Block!
        this.callbacks.onScoreAdd(data.points, pos.x, pos.y);
        this.spawnBlockDebris(pos.x, pos.y, data.material!);
      }
    }
  }

  // Explosion logic (TNT or Bomb Bird)
  public explodeAt(x: number, y: number, radius: number, maxForce: number, isTNT: boolean = false) {
    if (this.isExploding) return;
    this.isExploding = true;

    soundManager.playExplosion();
    this.callbacks.onCameraShake(12);
    this.callbacks.onHitstop(60);

    // Visual particles
    this.spawnExplosionVisuals(x, y);

    const allBodies = [...this.blocks, ...this.pigs, ...this.extraBirds];
    if (this.activeBird) allBodies.push(this.activeBird);

    allBodies.forEach((body) => {
      const data = (body as unknown as { customData?: CustomBodyData }).customData;
      if (!data || data.isDead) return;

      const dx = body.position.x - x;
      const dy = body.position.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius && dist > 1) {
        const factor = (1 - dist / radius);
        const impulseMag = (maxForce * factor * factor) / (body.mass || 1);
        const normX = dx / dist;
        const normY = (dy / dist) - 0.25; // Upward cartoon blast

        Body.applyForce(body, body.position, {
          x: normX * impulseMag * 0.035,
          y: normY * impulseMag * 0.035,
        });

        // Explosive damage
        const blastDamage = factor * 240;
        this.applyDamage(body, data, blastDamage);
      }
    });

    if (isTNT) {
      this.callbacks.onScoreAdd(1500, x, y, '+1500 TNT!');
    }

    setTimeout(() => {
      this.isExploding = false;
    }, 100);
  }

  // Clean up destroyed bodies
  public flushRemovals() {
    if (this.pendingRemovals.size === 0) return;

    this.pendingRemovals.forEach((body) => {
      const data = (body as unknown as { customData?: CustomBodyData }).customData;

      if (data?.entityType === 'pig') {
        const idx = this.pigs.indexOf(body);
        if (idx !== -1) {
          this.pigs.splice(idx, 1);
          this.callbacks.onPigDestroyed(data.pigType!, this.pigs.length);
        }
      } else if (data?.entityType === 'block' || data?.entityType === 'tnt') {
        const idx = this.blocks.indexOf(body);
        if (idx !== -1) {
          this.blocks.splice(idx, 1);
        }
      } else if (data?.entityType === 'egg') {
        const idx = this.eggs.indexOf(body);
        if (idx !== -1) {
          this.eggs.splice(idx, 1);
        }
      }

      World.remove(this.world, body);
    });

    this.pendingRemovals.clear();
  }

  // Update physics step with out-of-bounds sanitation
  public update(dtMs: number) {
    const clampedDt = Math.min(dtMs, 32);
    Engine.update(this.engine, clampedDt);

    // Check for pigs falling off stage or crushed below ground
    for (let i = this.pigs.length - 1; i >= 0; i--) {
      const pig = this.pigs[i];
      const data = (pig as unknown as { customData?: CustomBodyData }).customData;
      if (data && !data.isDead) {
        if (pig.position.y > 580 || pig.position.x > 2400 || pig.position.x < -100) {
          // Out of bounds / crushed pig -> defeat!
          this.applyDamage(pig, data, 9999);
        }
      }
    }

    this.flushRemovals();
  }

  // Check if physics world has settled
  public isSettled(): boolean {
    if (this.pendingRemovals.size > 0) return false;

    // Check active bird
    if (this.activeBird) {
      const v = this.activeBird.velocity;
      const speed = Math.sqrt(v.x * v.x + v.y * v.y);
      if (speed > 0.5) return false;
    }

    // Check extra birds
    for (const b of this.extraBirds) {
      const v = b.velocity;
      if (Math.sqrt(v.x * v.x + v.y * v.y) > 0.5) return false;
    }

    // Check pigs
    for (const p of this.pigs) {
      const v = p.velocity;
      if (Math.sqrt(v.x * v.x + v.y * v.y) > 0.6) return false;
    }

    // Check blocks
    for (const blk of this.blocks) {
      const v = blk.velocity;
      if (Math.sqrt(v.x * v.x + v.y * v.y) > 0.6) return false;
    }

    return true;
  }

  public removeBody(body: Matter.Body) {
    World.remove(this.world, body);
  }

  // Particle Generators
  private spawnPigDebris(x: number, y: number, pigType: PigType) {
    const particles: Particle[] = [];
    const color = '#22c55e';

    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 14 + Math.random() * 16,
        color: '#f8fafc',
        alpha: 0.85,
        life: 0,
        maxLife: 28 + Math.random() * 15,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
        type: 'smoke',
      });
    }

    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 6 + Math.random() * 8,
        color,
        alpha: 1,
        life: 0,
        maxLife: 35 + Math.random() * 15,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        type: 'debris',
      });
    }

    if (pigType === 'helmet' || pigType === 'corporal') {
      particles.push({
        x,
        y: y - 10,
        vx: (Math.random() - 0.5) * 3,
        vy: -5,
        size: 16,
        color: '#64748b',
        alpha: 1,
        life: 0,
        maxLife: 50,
        rotation: 0,
        vRot: 0.15,
        type: 'debris',
      });
    } else if (pigType === 'king') {
      particles.push({
        x,
        y: y - 15,
        vx: 0,
        vy: -7,
        size: 24,
        color: '#fbbf24',
        alpha: 1,
        life: 0,
        maxLife: 60,
        rotation: 0,
        vRot: 0.1,
        type: 'debris',
      });
    }

    this.callbacks.spawnParticles(particles);
  }

  private spawnBlockDebris(x: number, y: number, material: MaterialType) {
    const particles: Particle[] = [];
    let color = '#d97706';
    if (material === 'ice') color = '#93c5fd';
    if (material === 'stone') color = '#94a3b8';

    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 5 + Math.random() * 7,
        color,
        alpha: 1,
        life: 0,
        maxLife: 25 + Math.random() * 15,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        type: 'debris',
      });
    }
    this.callbacks.spawnParticles(particles);
  }

  private spawnExplosionVisuals(x: number, y: number) {
    const particles: Particle[] = [];

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 16 + Math.random() * 20,
        color: i % 2 === 0 ? '#f97316' : '#facc15',
        alpha: 0.9,
        life: 0,
        maxLife: 20 + Math.random() * 10,
        rotation: 0,
        vRot: 0,
        type: 'spark',
      });
    }

    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 20 + Math.random() * 25,
        color: '#475569',
        alpha: 0.8,
        life: 0,
        maxLife: 35 + Math.random() * 15,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
        type: 'smoke',
      });
    }

    this.callbacks.spawnParticles(particles);
  }

  private spawnSpeedTrail(x: number, y: number, color: string) {
    const particles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 10 + Math.random() * 12,
        color,
        alpha: 0.8,
        life: 0,
        maxLife: 18,
        rotation: 0,
        vRot: 0,
        type: 'spark',
      });
    }
    this.callbacks.spawnParticles(particles);
  }
}
