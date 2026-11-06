import { BirdType, MaterialType, PigType, Particle, FloatingText, TrajectoryPoint, StageDef } from '../types/game';
import { CustomBodyData, GamePhysics } from '../physics/gamePhysics';
import { BIRD_PROFILES } from '../levels/stages';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(
    stage: StageDef,
    physics: GamePhysics,
    camera: { x: number; y: number; zoom: number },
    slingshot: {
      isDragging: boolean;
      dragPos: { x: number; y: number };
      anchor: { x: number; y: number };
      trajectory: TrajectoryPoint[];
      currentBirdType: BirdType | null;
      waitingBirds: BirdType[];
    },
    particles: Particle[],
    floatingTexts: FloatingText[],
    time: number
  ) {
    const { ctx } = this;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // Apply camera transform
    ctx.translate(width / 2, height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // 1. Render World Background & Parallax
    this.renderBackground(stage.world, camera, width, height, time);

    // 2. Render Reserve Birds waiting on the ground to the left of slingshot
    slingshot.waitingBirds.forEach((bType, idx) => {
      const waitX = stage.slingshotPos.x - 70 - idx * 45;
      const waitY = 535;
      this.renderBird(bType, waitX, waitY, 0, false);
    });

    // 3. Render Slingshot Back Fork & Band
    this.renderSlingshotBack(stage.slingshotPos, slingshot);

    // 4. Render Blocks
    physics.blocks.forEach((body) => {
      const data = (body as unknown as { customData?: CustomBodyData }).customData;
      if (!data) return;
      this.renderBlock(body, data);
    });

    // 5. Render Eggs
    physics.eggs.forEach((egg) => {
      this.renderEgg(egg.position.x, egg.position.y, egg.angle);
    });

    // 6. Render Pigs
    physics.pigs.forEach((pig) => {
      const data = (pig as unknown as { customData?: CustomBodyData }).customData;
      if (!data) return;
      this.renderPig(pig, data, time);
    });

    // 7. Render Extra Birds (from Blues split)
    physics.extraBirds.forEach((b) => {
      this.renderBird('blues', b.position.x, b.position.y, b.angle, false);
    });

    // 8. Render Flying Active Bird OR Slingshot Loaded Bird
    if (physics.activeBird) {
      const bData = (physics.activeBird as unknown as { customData?: CustomBodyData }).customData;
      if (bData) {
        this.renderBird(
          bData.birdType || 'red',
          physics.activeBird.position.x,
          physics.activeBird.position.y,
          physics.activeBird.angle,
          false
        );
      }
    } else if (slingshot.currentBirdType) {
      // Bird loaded on slingshot
      const dx = slingshot.dragPos.x - slingshot.anchor.x;
      const dy = slingshot.dragPos.y - slingshot.anchor.y;
      const angle = slingshot.isDragging ? Math.atan2(dy, dx) + Math.PI : 0;

      this.renderBird(
        slingshot.currentBirdType,
        slingshot.dragPos.x,
        slingshot.dragPos.y,
        angle,
        slingshot.isDragging
      );
    }

    // 9. Render Slingshot Front Fork & Front Band
    this.renderSlingshotFront(stage.slingshotPos, slingshot);

    // 10. Render Trajectory Dots (when aiming)
    if (slingshot.isDragging && slingshot.trajectory.length > 0) {
      this.renderTrajectory(slingshot.trajectory);
    }

    // 11. Render Aim Guide Prompt if ready
    if (!physics.activeBird && slingshot.currentBirdType && !slingshot.isDragging) {
      this.renderAimPrompt(stage.slingshotPos.x, stage.slingshotPos.y, time);
    }

    // 12. Render Particles
    this.renderParticles(particles);

    // 13. Render Floating Texts
    this.renderFloatingTexts(floatingTexts);

    ctx.restore();
  }

  // --- Background Rendering ---
  private renderBackground(
    world: string,
    camera: { x: number; y: number },
    width: number,
    height: number,
    time: number
  ) {
    const { ctx } = this;

    let skyTop = '#38bdf8';
    let skyBottom = '#bae6fd';
    let hillBack = '#86efac';
    let hillFront = '#22c55e';
    let groundTop = '#16a34a';
    let groundBase = '#78350f';

    if (world === 'Frozen Glacier') {
      skyTop = '#0284c7';
      skyBottom = '#e0f2fe';
      hillBack = '#93c5fd';
      hillFront = '#bfdbfe';
      groundTop = '#e2e8f0';
      groundBase = '#334155';
    } else if (world === 'Rocky Stronghold') {
      skyTop = '#ea580c';
      skyBottom = '#fef08a';
      hillBack = '#b45309';
      hillFront = '#d97706';
      groundTop = '#92400e';
      groundBase = '#451a03';
    } else if (world === "King's Domain") {
      skyTop = '#4338ca';
      skyBottom = '#fbbf24';
      hillBack = '#6366f1';
      hillFront = '#4f46e5';
      groundTop = '#15803d';
      groundBase = '#3b0764';
    }

    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, -400, 0, 550);
    skyGrad.addColorStop(0, skyTop);
    skyGrad.addColorStop(1, skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(-1500, -900, 5000, 1600);

    // Distant Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 9; i++) {
      const cx = (i * 380 - camera.x * 0.15 + (time * 0.015)) % 3400 - 600;
      const cy = 50 + Math.sin(i * 1.5) * 35;
      this.drawCloud(cx, cy, 50 + (i % 3) * 15);
    }

    // Distant Hills
    ctx.fillStyle = hillBack;
    ctx.beginPath();
    ctx.moveTo(-1500, 550);
    for (let x = -1500; x <= 3500; x += 120) {
      const y = 370 + Math.sin((x + camera.x * 0.3) * 0.0035) * 70;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(3500, 600);
    ctx.lineTo(-1500, 600);
    ctx.fill();

    // Midground Hills
    ctx.fillStyle = hillFront;
    ctx.beginPath();
    ctx.moveTo(-1500, 550);
    for (let x = -1500; x <= 3500; x += 90) {
      const y = 450 + Math.sin((x + camera.x * 0.5) * 0.005) * 45;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(3500, 600);
    ctx.lineTo(-1500, 600);
    ctx.fill();

    // Foreground Solid Ground (Ground level is at y: 550)
    const groundGrad = ctx.createLinearGradient(0, 550, 0, 750);
    groundGrad.addColorStop(0, groundTop);
    groundGrad.addColorStop(0.1, groundBase);
    groundGrad.addColorStop(1, '#1c1917');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(-1500, 550, 5000, 400);

    // Grass fringe details
    ctx.fillStyle = groundTop;
    ctx.beginPath();
    for (let x = -1500; x <= 3500; x += 20) {
      ctx.lineTo(x, 550);
      ctx.lineTo(x + 10, 542);
      ctx.lineTo(x + 20, 550);
    }
    ctx.fill();

    // Subsoil pebbles
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let x = -1200; x <= 3200; x += 130) {
      ctx.beginPath();
      ctx.arc(x, 580 + (x % 30), 8 + (x % 7), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawCloud(x: number, y: number, r: number) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.arc(x + r * 0.7, y - r * 0.3, r * 0.75, 0, Math.PI * 2);
    ctx.arc(x + r * 1.4, y, r * 0.6, 0, Math.PI * 2);
    ctx.arc(x + r * 0.8, y + r * 0.2, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Slingshot Rendering ---
  private renderSlingshotBack(
    pos: { x: number; y: number },
    slingshot: { isDragging: boolean; dragPos: { x: number; y: number }; anchor: { x: number; y: number }; currentBirdType: BirdType | null }
  ) {
    const { ctx } = this;
    const { x, y } = pos;

    ctx.save();
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;

    // Back arm of the Y fork
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x - 22, y - 48);
    ctx.lineTo(x - 12, y - 52);
    ctx.lineTo(x - 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Back rubber band
    if (slingshot.currentBirdType) {
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x - 17, y - 50);
      ctx.lineTo(slingshot.dragPos.x, slingshot.dragPos.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderSlingshotFront(
    pos: { x: number; y: number },
    slingshot: { isDragging: boolean; dragPos: { x: number; y: number }; anchor: { x: number; y: number }; currentBirdType: BirdType | null }
  ) {
    const { ctx } = this;
    const { x, y } = pos;

    ctx.save();

    // Front rubber band
    if (slingshot.currentBirdType) {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(slingshot.dragPos.x, slingshot.dragPos.y);
      ctx.lineTo(x + 18, y - 48);
      ctx.stroke();

      // Leather pouch holding the bird
      ctx.fillStyle = '#3f1d0b';
      ctx.beginPath();
      ctx.arc(slingshot.dragPos.x, slingshot.dragPos.y, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Slingshot Post & Front Arm
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;

    // Main pillar down to ground
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x - 14, 550);
    ctx.lineTo(x + 14, 550);
    ctx.lineTo(x + 10, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Front fork arm
    ctx.beginPath();
    ctx.moveTo(x + 2, y);
    ctx.lineTo(x + 14, y - 50);
    ctx.lineTo(x + 24, y - 46);
    ctx.lineTo(x + 12, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wood knot detail
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(x, y + 25, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- Aim Guide Prompt ---
  private renderAimPrompt(x: number, y: number, time: number) {
    const { ctx } = this;
    const bounce = Math.sin(time * 0.006) * 6;

    ctx.save();
    ctx.translate(x, y - 80 + bounce);

    // Glowing comic arrow pointing down at bird
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-5, -14);
    ctx.lineTo(5, -14);
    ctx.lineTo(5, 0);
    ctx.lineTo(12, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text: PULL!
    ctx.font = 'bold 13px "Lilita One", sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeText('PULL & AIM!', 0, -20);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PULL & AIM!', 0, -20);

    ctx.restore();
  }

  // --- Trajectory Preview Dots ---
  private renderTrajectory(points: TrajectoryPoint[]) {
    const { ctx } = this;
    ctx.save();

    points.forEach((pt, i) => {
      const alpha = Math.max(0.15, 1 - i / points.length);
      const radius = Math.max(2.5, 6.0 - (i * 0.14));

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.35})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();
  }

  // --- Birds Rendering ---
  public renderBird(type: BirdType, x: number, y: number, angle: number, isBeingDragged: boolean = false) {
    const { ctx } = this;
    const profile = BIRD_PROFILES[type] || BIRD_PROFILES.red;
    const r = profile.radius;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (type === 'red') {
      this.drawRedBird(r);
    } else if (type === 'chuck') {
      this.drawChuckBird(r);
    } else if (type === 'bomb') {
      this.drawBombBird(r);
    } else if (type === 'blues') {
      this.drawBluesBird(r);
    } else if (type === 'matilda') {
      this.drawMatildaBird(r);
    } else if (type === 'terence') {
      this.drawTerenceBird(r);
    }

    ctx.restore();
  }

  // 1. Red
  private drawRedBird(r: number) {
    const { ctx } = this;

    // Tail Feathers
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.2);
    ctx.lineTo(-r * 1.5, -r * 0.5);
    ctx.lineTo(-r * 1.4, 0);
    ctx.lineTo(-r * 1.6, r * 0.3);
    ctx.lineTo(-r * 0.8, 0.1);
    ctx.fill();

    // Body
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cream Belly Patch
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(r * 0.2, r * 0.35, r * 0.6, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.fill();

    // Crest Feathers
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r * 0.8);
    ctx.lineTo(-r * 0.5, -r * 1.4);
    ctx.lineTo(r * 0.1, -r * 1.3);
    ctx.lineTo(0, -r * 0.8);
    ctx.fill();
    ctx.stroke();

    // Angry Eyebrows
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(r * 0.05, -r * 0.1);
    ctx.lineTo(r * 0.65, -r * 0.4);
    ctx.lineTo(r * 0.5, -r * 0.55);
    ctx.lineTo(-r * 0.1, -r * 0.2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.25, -r * 0.05, r * 0.25, 0, Math.PI * 2);
    ctx.arc(r * 0.65, -r * 0.1, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(r * 0.35, -r * 0.05, r * 0.1, 0, Math.PI * 2);
    ctx.arc(r * 0.72, -r * 0.1, r * 0.09, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(r * 0.45, 0);
    ctx.lineTo(r * 1.25, r * 0.15);
    ctx.lineTo(r * 0.4, r * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 2. Chuck
  private drawChuckBird(r: number) {
    const { ctx } = this;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, -r * 0.2);
    ctx.lineTo(-r * 1.6, -r * 0.4);
    ctx.lineTo(-r * 1.4, 0);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, r * 0.9);
    ctx.lineTo(r * 1.2, 0);
    ctx.lineTo(-r * 0.9, -r * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, r * 0.8);
    ctx.lineTo(r * 0.8, 0.1);
    ctx.lineTo(-r * 0.4, r * 0.85);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.7);
    ctx.lineTo(-r * 1.4, -r * 1.1);
    ctx.lineTo(-r * 0.3, -r * 0.8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.15, r * 0.22, 0, Math.PI * 2);
    ctx.arc(r * 0.58, -r * 0.15, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(r * 0.3, -r * 0.15, r * 0.08, 0, Math.PI * 2);
    ctx.arc(r * 0.66, -r * 0.15, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#854d0e';
    ctx.fillRect(r * 0.05, -r * 0.45, r * 0.7, 4);

    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(r * 0.4, -r * 0.05);
    ctx.lineTo(r * 1.35, 0.05);
    ctx.lineTo(r * 0.35, r * 0.25);
    ctx.closePath();
    ctx.fill();
  }

  // 3. Bomb
  private drawBombBird(r: number) {
    const { ctx } = this;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.2, -r * 1.4, r * 0.1, -r * 1.5);
    ctx.stroke();

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 1.5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, r * 0.4, r * 0.55, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(r * 0.35, -r * 0.4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.1, r * 0.22, 0, Math.PI * 2);
    ctx.arc(r * 0.58, -r * 0.1, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(r * 0.28, -r * 0.1, r * 0.09, 0, Math.PI * 2);
    ctx.arc(r * 0.64, -r * 0.1, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(r * 0.05, -r * 0.4, r * 0.65, 4.5);

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(r * 0.4, 0);
    ctx.lineTo(r * 1.1, r * 0.1);
    ctx.lineTo(r * 0.35, r * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  // 4. Blues
  private drawBluesBird(r: number) {
    const { ctx } = this;

    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.1, r * 0.35, 0, Math.PI * 2);
    ctx.arc(r * 0.65, -r * 0.1, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.1, r * 0.25, 0, Math.PI * 2);
    ctx.arc(r * 0.65, -r * 0.1, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(r * 0.26, -r * 0.1, r * 0.1, 0, Math.PI * 2);
    ctx.arc(r * 0.7, -r * 0.1, r * 0.09, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(r * 0.35, 0.05);
    ctx.lineTo(r * 1.1, r * 0.15);
    ctx.lineTo(r * 0.35, r * 0.35);
    ctx.closePath();
    ctx.fill();
  }

  // 5. Matilda
  private drawMatildaBird(r: number) {
    const { ctx } = this;

    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.arc(r * 0.3, r * 0.2, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r * 1.1);
    ctx.lineTo(-r * 0.5, -r * 1.5);
    ctx.lineTo(0.1, -r * 1.2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(r * 0.25, -r * 0.15, r * 0.12, 0, Math.PI * 2);
    ctx.arc(r * 0.65, -r * 0.15, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(r * 0.4, 0);
    ctx.lineTo(r * 1.2, r * 0.1);
    ctx.lineTo(r * 0.4, r * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  // 6. Terence
  private drawTerenceBird(r: number) {
    const { ctx } = this;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, 0);
    ctx.lineTo(-r * 1.5, -r * 0.3);
    ctx.lineTo(-r * 1.4, r * 0.3);
    ctx.fill();

    ctx.fillStyle = '#991b1b';
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.3, r * 0.2, 0, Math.PI * 2);
    ctx.arc(-r * 0.4, r * 0.25, r * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(r * 0.05, -r * 0.4, r * 0.8, 8);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.25, -r * 0.1, r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * 0.65, -r * 0.1, r * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(r * 0.32, -r * 0.1, r * 0.08, 0, Math.PI * 2);
    ctx.arc(r * 0.72, -r * 0.1, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(r * 0.45, 0.05);
    ctx.lineTo(r * 0.9, r * 0.15);
    ctx.lineTo(r * 0.45, r * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  // --- Egg Bomb Rendering ---
  private renderEgg(x: number, y: number, angle: number) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-12, -4, 24, 8);
    ctx.restore();
  }

  // --- Pigs Rendering ---
  private renderPig(pig: Matter.Body, data: CustomBodyData, time: number) {
    const { ctx } = this;
    const { x, y } = pig.position;
    const r = (pig as unknown as { circleRadius: number }).circleRadius || 18;
    const pigType = data.pigType || 'minion_small';

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(pig.angle);

    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(-r * 0.65, -r * 0.8, r * 0.28, 0, Math.PI * 2);
    ctx.arc(r * 0.65, -r * 0.8, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const blink = Math.sin(time * 0.005 + x) > 0.96;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.15, r * 0.26, 0, Math.PI * 2);
    ctx.arc(r * 0.35, -r * 0.15, r * 0.26, 0, Math.PI * 2);
    ctx.fill();

    if (!blink) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.15, r * 0.11, 0, Math.PI * 2);
      ctx.arc(r * 0.3, -r * 0.15, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.55, -r * 0.15);
      ctx.lineTo(-r * 0.15, -r * 0.15);
      ctx.moveTo(r * 0.15, -r * 0.15);
      ctx.lineTo(r * 0.55, -r * 0.15);
      ctx.stroke();
    }

    ctx.fillStyle = '#4ade80';
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.22, r * 0.42, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.arc(-r * 0.14, r * 0.22, r * 0.09, 0, Math.PI * 2);
    ctx.arc(r * 0.14, r * 0.22, r * 0.09, 0, Math.PI * 2);
    ctx.fill();

    if (pigType === 'helmet') {
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -r * 0.35, r * 1.05, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-r * 0.8, -r * 0.35, r * 1.6, 4);
    } else if (pigType === 'corporal') {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, r * 0.3);
      ctx.quadraticCurveTo(-r * 0.1, r * 0.15, 0, r * 0.4);
      ctx.quadraticCurveTo(r * 0.1, r * 0.15, 0.6, 0.3);
      ctx.quadraticCurveTo(0, r * 0.65, -r * 0.6, r * 0.3);
      ctx.fill();
    } else if (pigType === 'king') {
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.7);
      ctx.lineTo(-r * 0.7, -r * 1.4);
      ctx.lineTo(-r * 0.35, -r * 1.0);
      ctx.lineTo(0, -r * 1.55);
      ctx.lineTo(r * 0.35, -r * 1.0);
      ctx.lineTo(r * 0.7, -r * 1.4);
      ctx.lineTo(r * 0.7, -r * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -r * 1.15, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- Blocks Rendering ---
  private renderBlock(body: Matter.Body, data: CustomBodyData) {
    const { ctx } = this;
    const { x, y } = body.position;
    const angle = body.angle;
    const material = data.material || 'wood';

    const bounds = body.bounds;
    const w = bounds.max.x - bounds.min.x;
    const h = bounds.max.y - bounds.min.y;
    const halfW = w / 2;
    const halfH = h / 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (material === 'wood') {
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      ctx.strokeStyle = 'rgba(120, 53, 15, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-halfW + 4, 0);
      ctx.lineTo(halfW - 4, 0);
      ctx.stroke();

      ctx.fillStyle = '#451a03';
      const inset = 4;
      ctx.fillRect(-halfW + inset, -halfH + inset, 3, 3);
      ctx.fillRect(halfW - inset - 3, -halfH + inset, 3, 3);
      ctx.fillRect(-halfW + inset, halfH - inset - 3, 3, 3);
      ctx.fillRect(halfW - inset - 3, halfH - inset - 3, 3, 3);
    } else if (material === 'ice') {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.75)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(-halfW, -halfH);
      ctx.lineTo(-halfW + 12, -halfH);
      ctx.lineTo(halfW, halfH - 12);
      ctx.lineTo(halfW, halfH);
      ctx.closePath();
      ctx.fill();
    } else if (material === 'stone') {
      ctx.fillStyle = '#64748b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      ctx.fillStyle = '#475569';
      ctx.fillRect(-halfW + 6, -halfH + 6, 4, 4);
      ctx.fillRect(halfW - 10, halfH - 10, 5, 4);
      ctx.fillRect(0, 0, 4, 4);
    } else if (material === 'tnt') {
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2.5;
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 15px "Lilita One", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TNT', 0, 0);

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.strokeRect(-halfW + 3, -halfH + 3, w - 6, h - 6);
    }

    if (data.health < data.maxHealth * 0.6) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-halfW * 0.4, -halfH * 0.4);
      ctx.lineTo(0, 0);
      ctx.lineTo(halfW * 0.5, -halfH * 0.2);
      ctx.moveTo(0, 0);
      ctx.lineTo(-halfW * 0.2, halfH * 0.5);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- Particles ---
  private renderParticles(particles: Particle[]) {
    const { ctx } = this;
    particles.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'smoke') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    });
  }

  // --- Floating Texts ---
  private renderFloatingTexts(floatingTexts: FloatingText[]) {
    const { ctx } = this;
    floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `bold ${ft.size}px "Lilita One", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);

      ctx.restore();
    });
  }
}
