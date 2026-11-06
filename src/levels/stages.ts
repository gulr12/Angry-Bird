import { StageDef, BirdDef } from '../types/game';

export const BIRD_PROFILES: Record<string, BirdDef> = {
  red: {
    type: 'red',
    radius: 20,
    mass: 1.0,
    color: '#ef4444',
    name: 'Red',
    abilityName: 'Battle Cry',
    abilityDesc: 'Standard balanced flyer with strong impact!',
  },
  chuck: {
    type: 'chuck',
    radius: 18,
    mass: 0.9,
    color: '#eab308',
    name: 'Chuck',
    abilityName: 'Speed Dash',
    abilityDesc: 'Tap in flight to trigger a supersonic rocket dash!',
  },
  bomb: {
    type: 'bomb',
    radius: 24,
    mass: 1.6,
    color: '#1e293b',
    name: 'Bomb',
    abilityName: 'Explosion',
    abilityDesc: 'Tap in flight or upon impact for a devastating explosion!',
  },
  blues: {
    type: 'blues',
    radius: 14,
    mass: 0.6,
    color: '#3b82f6',
    name: 'The Blues',
    abilityName: 'Triple Split',
    abilityDesc: 'Tap in flight to split into 3 birds — lethal against glass/ice!',
  },
  matilda: {
    type: 'matilda',
    radius: 23,
    mass: 1.2,
    color: '#f8fafc',
    name: 'Matilda',
    abilityName: 'Egg Bomb',
    abilityDesc: 'Tap in flight to drop an explosive egg and launch upward!',
  },
  terence: {
    type: 'terence',
    radius: 32,
    mass: 3.5,
    color: '#b91c1c',
    name: 'Terence',
    abilityName: 'Heavy Crusher',
    abilityDesc: 'Massive wrecking ball that crushes entire structures!',
  },
};

export const STAGES: StageDef[] = [
  // --- WORLD 1: Sunny Plains (Stages 1 - 5) ---
  {
    id: 1,
    title: 'First Flight',
    world: 'Sunny Plains',
    description: 'Aim and pull back the slingshot to eliminate the sneaky pigs!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['red', 'red', 'red'],
    starThresholds: [10000, 20000, 28000],
    pigs: [
      { x: 880, y: 520, type: 'minion_small', health: 30 },
      { x: 1040, y: 520, type: 'minion_small', health: 30 },
    ],
    blocks: [
      // Left wooden stand
      { x: 880, y: 480, width: 80, height: 16, material: 'wood' },
      { x: 850, y: 520, width: 16, height: 60, material: 'wood' },
      { x: 910, y: 520, width: 16, height: 60, material: 'wood' },
      // Right wooden stand
      { x: 1040, y: 480, width: 80, height: 16, material: 'wood' },
      { x: 1010, y: 520, width: 16, height: 60, material: 'wood' },
      { x: 1070, y: 520, width: 16, height: 60, material: 'wood' },
      // Top connector
      { x: 960, y: 440, width: 160, height: 16, material: 'wood' },
    ],
  },
  {
    id: 2,
    title: 'Woodpecker Ridge',
    world: 'Sunny Plains',
    description: 'Use Chuck’s Speed Dash by tapping mid-flight to pierce through wood!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['chuck', 'red', 'chuck'],
    starThresholds: [12000, 24000, 32000],
    pigs: [
      { x: 920, y: 520, type: 'minion_small', health: 30 },
      { x: 920, y: 410, type: 'minion_medium', health: 50 },
    ],
    blocks: [
      // Base pillars
      { x: 860, y: 510, width: 20, height: 80, material: 'wood' },
      { x: 980, y: 510, width: 20, height: 80, material: 'wood' },
      { x: 920, y: 460, width: 160, height: 20, material: 'wood' },
      // Upper tier
      { x: 880, y: 400, width: 20, height: 80, material: 'wood' },
      { x: 960, y: 400, width: 20, height: 80, material: 'wood' },
      { x: 920, y: 350, width: 120, height: 18, material: 'wood' },
      { x: 920, y: 320, width: 40, height: 40, material: 'wood' },
    ],
  },
  {
    id: 3,
    title: 'TNT Surprise',
    world: 'Sunny Plains',
    description: 'Ignite the TNT crate to trigger a giant explosive chain reaction!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['red', 'chuck', 'red'],
    starThresholds: [15000, 28000, 38000],
    pigs: [
      { x: 870, y: 480, type: 'minion_small', health: 30 },
      { x: 990, y: 480, type: 'minion_small', health: 30 },
      { x: 930, y: 370, type: 'minion_medium', health: 50 },
    ],
    blocks: [
      // Center TNT
      { x: 930, y: 525, width: 44, height: 44, material: 'tnt' },
      // Left and right support columns
      { x: 850, y: 510, width: 24, height: 80, material: 'wood' },
      { x: 1010, y: 510, width: 24, height: 80, material: 'wood' },
      // First floor beam
      { x: 930, y: 460, width: 200, height: 20, material: 'wood' },
      // Upper pillars
      { x: 880, y: 405, width: 20, height: 80, material: 'wood' },
      { x: 980, y: 405, width: 20, height: 80, material: 'wood' },
      // Roof
      { x: 930, y: 355, width: 140, height: 18, material: 'wood' },
      { x: 930, y: 325, width: 36, height: 36, material: 'wood' },
    ],
  },
  {
    id: 4,
    title: 'Bunker Break',
    world: 'Sunny Plains',
    description: 'Knock down the supporting stilts to collapse the pig fortress!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['chuck', 'red', 'chuck'],
    starThresholds: [18000, 32000, 42000],
    pigs: [
      { x: 850, y: 520, type: 'minion_small', health: 30 },
      { x: 980, y: 520, type: 'minion_small', health: 30 },
      { x: 915, y: 430, type: 'helmet', health: 90 },
    ],
    blocks: [
      // Front and back pillars
      { x: 810, y: 500, width: 22, height: 100, material: 'wood' },
      { x: 890, y: 500, width: 22, height: 100, material: 'wood' },
      { x: 940, y: 500, width: 22, height: 100, material: 'wood' },
      { x: 1020, y: 500, width: 22, height: 100, material: 'wood' },
      // Decks
      { x: 850, y: 440, width: 110, height: 18, material: 'wood' },
      { x: 980, y: 440, width: 110, height: 18, material: 'wood' },
      { x: 915, y: 420, width: 220, height: 20, material: 'wood' },
      // Roof shelter
      { x: 870, y: 370, width: 20, height: 70, material: 'wood' },
      { x: 960, y: 370, width: 20, height: 70, material: 'wood' },
      { x: 915, y: 325, width: 130, height: 18, material: 'wood' },
    ],
  },
  {
    id: 5,
    title: 'Plains Citadel',
    world: 'Sunny Plains',
    description: 'The Corporal Pig commands the fort. Bring it crumbling down!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['red', 'chuck', 'red', 'chuck'],
    starThresholds: [22000, 38000, 48000],
    pigs: [
      { x: 820, y: 520, type: 'minion_small', health: 30 },
      { x: 1040, y: 520, type: 'minion_small', health: 30 },
      { x: 930, y: 440, type: 'corporal', health: 120 },
      { x: 930, y: 320, type: 'minion_medium', health: 50 },
    ],
    blocks: [
      // Base triple towers
      { x: 790, y: 505, width: 22, height: 90, material: 'wood' },
      { x: 850, y: 505, width: 22, height: 90, material: 'wood' },
      { x: 900, y: 505, width: 22, height: 90, material: 'wood' },
      { x: 960, y: 505, width: 22, height: 90, material: 'wood' },
      { x: 1010, y: 505, width: 22, height: 90, material: 'wood' },
      { x: 1070, y: 505, width: 22, height: 90, material: 'wood' },
      // Deck 1
      { x: 930, y: 450, width: 310, height: 20, material: 'wood' },
      // Middle fort
      { x: 890, y: 385, width: 20, height: 90, material: 'wood' },
      { x: 970, y: 385, width: 20, height: 90, material: 'wood' },
      { x: 930, y: 330, width: 120, height: 18, material: 'wood' },
      // Top blocks
      { x: 930, y: 285, width: 36, height: 50, material: 'wood' },
    ],
  },

  // --- WORLD 2: Frozen Glacier (Stages 6 - 10) ---
  {
    id: 6,
    title: 'Ice Shards',
    world: 'Frozen Glacier',
    description: 'Meet The Blues! Tap in flight to split into 3 birds — perfect for shattering ice!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['blues', 'blues', 'red'],
    starThresholds: [14000, 26000, 35000],
    pigs: [
      { x: 900, y: 520, type: 'minion_small', health: 30 },
      { x: 1000, y: 520, type: 'minion_small', health: 30 },
    ],
    blocks: [
      // Ice columns
      { x: 860, y: 505, width: 20, height: 90, material: 'ice' },
      { x: 940, y: 505, width: 20, height: 90, material: 'ice' },
      { x: 1040, y: 505, width: 20, height: 90, material: 'ice' },
      // Ice roofs
      { x: 900, y: 450, width: 100, height: 18, material: 'ice' },
      { x: 990, y: 450, width: 100, height: 18, material: 'ice' },
      { x: 950, y: 420, width: 140, height: 18, material: 'ice' },
      { x: 950, y: 380, width: 35, height: 45, material: 'ice' },
    ],
  },
  {
    id: 7,
    title: 'Glass Castle',
    world: 'Frozen Glacier',
    description: 'A multi-tier crystalline ice palace. Split the blues at the right moment!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['blues', 'blues', 'chuck'],
    starThresholds: [18000, 32000, 44000],
    pigs: [
      { x: 860, y: 520, type: 'minion_small', health: 30 },
      { x: 960, y: 520, type: 'minion_small', health: 30 },
      { x: 910, y: 410, type: 'helmet', health: 80 },
    ],
    blocks: [
      // Base pillars
      { x: 820, y: 505, width: 20, height: 90, material: 'ice' },
      { x: 900, y: 505, width: 20, height: 90, material: 'ice' },
      { x: 970, y: 505, width: 20, height: 90, material: 'ice' },
      { x: 1020, y: 505, width: 20, height: 90, material: 'ice' },
      // Floor
      { x: 920, y: 450, width: 220, height: 18, material: 'ice' },
      // Mid pillars
      { x: 860, y: 395, width: 18, height: 80, material: 'ice' },
      { x: 960, y: 395, width: 18, height: 80, material: 'ice' },
      // Upper roof
      { x: 910, y: 345, width: 130, height: 18, material: 'ice' },
      { x: 910, y: 310, width: 35, height: 40, material: 'ice' },
    ],
  },
  {
    id: 8,
    title: 'Frost & TNT',
    world: 'Frozen Glacier',
    description: 'Ice walls protect the TNT. Shatter the ice to ignite the blast!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['blues', 'chuck', 'red'],
    starThresholds: [20000, 35000, 46000],
    pigs: [
      { x: 860, y: 520, type: 'minion_small', health: 30 },
      { x: 980, y: 520, type: 'minion_medium', health: 50 },
      { x: 920, y: 370, type: 'corporal', health: 120 },
    ],
    blocks: [
      // TNT in center
      { x: 920, y: 525, width: 44, height: 44, material: 'tnt' },
      // Outer ice columns
      { x: 830, y: 505, width: 22, height: 90, material: 'ice' },
      { x: 890, y: 505, width: 18, height: 90, material: 'ice' },
      { x: 950, y: 505, width: 18, height: 90, material: 'ice' },
      { x: 1010, y: 505, width: 22, height: 90, material: 'ice' },
      // Wood crossbeams
      { x: 920, y: 450, width: 200, height: 20, material: 'wood' },
      // Top structure
      { x: 880, y: 395, width: 20, height: 80, material: 'ice' },
      { x: 960, y: 395, width: 20, height: 80, material: 'ice' },
      { x: 920, y: 345, width: 120, height: 18, material: 'ice' },
    ],
  },
  {
    id: 9,
    title: 'Igloo Bastion',
    world: 'Frozen Glacier',
    description: 'A dome of ice blocks reinforced with wooden struts.',
    slingshotPos: { x: 200, y: 440 },
    birds: ['blues', 'blues', 'chuck', 'red'],
    starThresholds: [22000, 38000, 50000],
    pigs: [
      { x: 840, y: 520, type: 'minion_small', health: 30 },
      { x: 930, y: 520, type: 'helmet', health: 90 },
      { x: 1020, y: 520, type: 'minion_small', health: 30 },
      { x: 930, y: 410, type: 'minion_medium', health: 50 },
    ],
    blocks: [
      // 4 base pillars
      { x: 800, y: 505, width: 22, height: 90, material: 'ice' },
      { x: 880, y: 505, width: 22, height: 90, material: 'ice' },
      { x: 980, y: 505, width: 22, height: 90, material: 'ice' },
      { x: 1060, y: 505, width: 22, height: 90, material: 'ice' },
      // Planks
      { x: 840, y: 450, width: 110, height: 18, material: 'wood' },
      { x: 1020, y: 450, width: 110, height: 18, material: 'wood' },
      { x: 930, y: 440, width: 280, height: 20, material: 'ice' },
      // Upper tier
      { x: 890, y: 380, width: 20, height: 90, material: 'ice' },
      { x: 970, y: 380, width: 20, height: 90, material: 'ice' },
      { x: 930, y: 325, width: 130, height: 18, material: 'ice' },
      { x: 930, y: 285, width: 40, height: 40, material: 'ice' },
    ],
  },
  {
    id: 10,
    title: 'Glacier Gate',
    world: 'Frozen Glacier',
    description: 'Twin icy towers bridged over a fortified command post.',
    slingshotPos: { x: 200, y: 440 },
    birds: ['chuck', 'blues', 'blues', 'red'],
    starThresholds: [24000, 42000, 54000],
    pigs: [
      { x: 830, y: 460, type: 'minion_small', health: 30 },
      { x: 940, y: 520, type: 'corporal', health: 120 },
      { x: 1050, y: 460, type: 'minion_small', health: 30 },
      { x: 940, y: 340, type: 'helmet', health: 80 },
    ],
    blocks: [
      // Left ice tower
      { x: 800, y: 505, width: 22, height: 90, material: 'ice' },
      { x: 860, y: 505, width: 22, height: 90, material: 'ice' },
      { x: 830, y: 450, width: 90, height: 18, material: 'wood' },
      { x: 830, y: 395, width: 22, height: 80, material: 'ice' },
      // Right ice tower
      { x: 1020, y: 505, width: 22, height: 90, material: 'ice' },
      { x: 1080, y: 505, width: 22, height: 90, material: 'ice' },
      { x: 1050, y: 450, width: 90, height: 18, material: 'wood' },
      { x: 1050, y: 395, width: 22, height: 80, material: 'ice' },
      // Center bridge
      { x: 940, y: 390, width: 240, height: 20, material: 'wood' },
      // Center top post
      { x: 910, y: 335, width: 20, height: 80, material: 'ice' },
      { x: 970, y: 335, width: 20, height: 80, material: 'ice' },
      { x: 940, y: 285, width: 90, height: 18, material: 'ice' },
    ],
  },

  // --- WORLD 3: Rocky Stronghold (Stages 11 - 15) ---
  {
    id: 11,
    title: 'Heavy Boulders',
    world: 'Rocky Stronghold',
    description: 'Meet Bomb! Tap in flight or let him impact to blow through solid rock!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['bomb', 'red', 'bomb'],
    starThresholds: [18000, 32000, 42000],
    pigs: [
      { x: 880, y: 520, type: 'helmet', health: 90 },
      { x: 980, y: 520, type: 'helmet', health: 90 },
    ],
    blocks: [
      // Heavy stone pillars
      { x: 830, y: 505, width: 30, height: 90, material: 'stone' },
      { x: 930, y: 505, width: 30, height: 90, material: 'stone' },
      { x: 1030, y: 505, width: 30, height: 90, material: 'stone' },
      // Stone slabs
      { x: 880, y: 450, width: 120, height: 24, material: 'stone' },
      { x: 980, y: 450, width: 120, height: 24, material: 'stone' },
      { x: 930, y: 410, width: 180, height: 24, material: 'stone' },
      { x: 930, y: 360, width: 50, height: 50, material: 'stone' },
    ],
  },
  {
    id: 12,
    title: 'Stone Citadel',
    world: 'Rocky Stronghold',
    description: 'A heavily fortified fortress of solid stone and wood.',
    slingshotPos: { x: 200, y: 440 },
    birds: ['bomb', 'chuck', 'bomb'],
    starThresholds: [22000, 38000, 48000],
    pigs: [
      { x: 850, y: 520, type: 'minion_medium', health: 50 },
      { x: 970, y: 520, type: 'minion_medium', health: 50 },
      { x: 910, y: 410, type: 'corporal', health: 120 },
    ],
    blocks: [
      { x: 800, y: 500, width: 30, height: 100, material: 'stone' },
      { x: 910, y: 500, width: 30, height: 100, material: 'stone' },
      { x: 1020, y: 500, width: 30, height: 100, material: 'stone' },
      { x: 910, y: 440, width: 250, height: 24, material: 'stone' },
      { x: 870, y: 380, width: 25, height: 80, material: 'stone' },
      { x: 950, y: 380, width: 25, height: 80, material: 'stone' },
      { x: 910, y: 330, width: 140, height: 22, material: 'wood' },
      { x: 910, y: 290, width: 44, height: 44, material: 'tnt' },
    ],
  },
  {
    id: 13,
    title: 'TNT Vault',
    world: 'Rocky Stronghold',
    description: 'Pigs hid TNT inside a stone bunker. One precise detonation will level it!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['chuck', 'bomb', 'blues'],
    starThresholds: [24000, 42000, 56000],
    pigs: [
      { x: 860, y: 520, type: 'minion_small', health: 30 },
      { x: 940, y: 460, type: 'helmet', health: 90 },
      { x: 1020, y: 520, type: 'minion_small', health: 30 },
      { x: 940, y: 360, type: 'corporal', health: 120 },
    ],
    blocks: [
      // Base TNT boxes
      { x: 910, y: 525, width: 44, height: 44, material: 'tnt' },
      { x: 970, y: 525, width: 44, height: 44, material: 'tnt' },
      // Side stone supports
      { x: 830, y: 500, width: 28, height: 100, material: 'stone' },
      { x: 1050, y: 500, width: 28, height: 100, material: 'stone' },
      // Stone bridge over TNT
      { x: 940, y: 440, width: 240, height: 24, material: 'stone' },
      // Middle wood pillars
      { x: 890, y: 380, width: 20, height: 80, material: 'wood' },
      { x: 990, y: 380, width: 20, height: 80, material: 'wood' },
      { x: 940, y: 330, width: 150, height: 20, material: 'wood' },
      { x: 940, y: 285, width: 44, height: 44, material: 'stone' },
    ],
  },
  {
    id: 14,
    title: 'The High Rise',
    world: 'Rocky Stronghold',
    description: 'Meet Matilda! Tap in flight to drop an explosive egg and boost skyward!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['matilda', 'bomb', 'red'],
    starThresholds: [26000, 45000, 60000],
    pigs: [
      { x: 920, y: 520, type: 'minion_medium', health: 50 },
      { x: 920, y: 420, type: 'helmet', health: 90 },
      { x: 920, y: 310, type: 'corporal', health: 120 },
    ],
    blocks: [
      // Level 1: Stone
      { x: 860, y: 505, width: 28, height: 90, material: 'stone' },
      { x: 980, y: 505, width: 28, height: 90, material: 'stone' },
      { x: 920, y: 450, width: 160, height: 22, material: 'stone' },
      // Level 2: Wood
      { x: 870, y: 395, width: 20, height: 80, material: 'wood' },
      { x: 970, y: 395, width: 20, height: 80, material: 'wood' },
      { x: 920, y: 345, width: 140, height: 18, material: 'wood' },
      // Level 3: Ice Penthouse
      { x: 880, y: 290, width: 18, height: 75, material: 'ice' },
      { x: 960, y: 290, width: 18, height: 75, material: 'ice' },
      { x: 920, y: 245, width: 110, height: 16, material: 'ice' },
      { x: 920, y: 215, width: 36, height: 36, material: 'ice' },
    ],
  },
  {
    id: 15,
    title: 'Fortress Ramparts',
    world: 'Rocky Stronghold',
    description: 'A heavily defended garrison with fortified bunkers.',
    slingshotPos: { x: 200, y: 440 },
    birds: ['matilda', 'bomb', 'chuck', 'blues'],
    starThresholds: [30000, 50000, 68000],
    pigs: [
      { x: 830, y: 520, type: 'helmet', health: 90 },
      { x: 950, y: 520, type: 'helmet', health: 90 },
      { x: 1070, y: 520, type: 'minion_small', health: 30 },
      { x: 890, y: 410, type: 'corporal', health: 120 },
      { x: 1010, y: 410, type: 'helmet', health: 90 },
    ],
    blocks: [
      // 4 stone pillars base
      { x: 790, y: 500, width: 26, height: 100, material: 'stone' },
      { x: 870, y: 500, width: 26, height: 100, material: 'stone' },
      { x: 990, y: 500, width: 26, height: 100, material: 'stone' },
      { x: 1110, y: 500, width: 26, height: 100, material: 'stone' },
      // Lower stone roofs
      { x: 830, y: 440, width: 120, height: 22, material: 'stone' },
      { x: 1050, y: 440, width: 120, height: 22, material: 'stone' },
      // TNT between platforms
      { x: 950, y: 450, width: 44, height: 44, material: 'tnt' },
      // Upper tier
      { x: 890, y: 375, width: 20, height: 80, material: 'wood' },
      { x: 1010, y: 375, width: 20, height: 80, material: 'wood' },
      { x: 950, y: 325, width: 180, height: 20, material: 'wood' },
      { x: 950, y: 285, width: 40, height: 40, material: 'stone' },
    ],
  },

  // --- WORLD 4: King's Domain (Stages 16 - 20) ---
  {
    id: 16,
    title: 'The Juggernaut',
    world: "King's Domain",
    description: 'Unleash Terence! His colossal mass demolishes anything in his path!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['terence', 'bomb', 'chuck'],
    starThresholds: [28000, 48000, 65000],
    pigs: [
      { x: 850, y: 520, type: 'helmet', health: 100 },
      { x: 960, y: 520, type: 'helmet', health: 100 },
      { x: 1070, y: 520, type: 'corporal', health: 140 },
    ],
    blocks: [
      // Giant multi-layer walls
      { x: 800, y: 500, width: 34, height: 100, material: 'stone' },
      { x: 900, y: 500, width: 34, height: 100, material: 'stone' },
      { x: 1010, y: 500, width: 34, height: 100, material: 'stone' },
      { x: 1120, y: 500, width: 34, height: 100, material: 'stone' },
      { x: 960, y: 440, width: 340, height: 24, material: 'stone' },
      // Upper stone blocks
      { x: 860, y: 380, width: 28, height: 80, material: 'stone' },
      { x: 960, y: 380, width: 28, height: 80, material: 'stone' },
      { x: 1060, y: 380, width: 28, height: 80, material: 'stone' },
      { x: 960, y: 330, width: 230, height: 22, material: 'wood' },
      { x: 960, y: 285, width: 50, height: 50, material: 'stone' },
    ],
  },
  {
    id: 17,
    title: 'Pendulum Peril',
    world: "King's Domain",
    description: 'Pigs hanging in precariously balanced multi-tier towers.',
    slingshotPos: { x: 200, y: 440 },
    birds: ['matilda', 'terence', 'blues', 'chuck'],
    starThresholds: [32000, 52000, 72000],
    pigs: [
      { x: 840, y: 520, type: 'minion_medium', health: 50 },
      { x: 950, y: 520, type: 'helmet', health: 90 },
      { x: 1060, y: 520, type: 'minion_medium', health: 50 },
      { x: 950, y: 390, type: 'corporal', health: 130 },
      { x: 950, y: 270, type: 'helmet', health: 80 },
    ],
    blocks: [
      // Base pillars
      { x: 800, y: 500, width: 24, height: 100, material: 'wood' },
      { x: 890, y: 500, width: 24, height: 100, material: 'wood' },
      { x: 1010, y: 500, width: 24, height: 100, material: 'wood' },
      { x: 1100, y: 500, width: 24, height: 100, material: 'wood' },
      // Decks with TNT
      { x: 845, y: 440, width: 110, height: 18, material: 'wood' },
      { x: 1055, y: 440, width: 110, height: 18, material: 'wood' },
      { x: 950, y: 525, width: 44, height: 44, material: 'tnt' },
      { x: 950, y: 430, width: 320, height: 20, material: 'stone' },
      // Tier 2
      { x: 890, y: 360, width: 22, height: 100, material: 'ice' },
      { x: 1010, y: 360, width: 22, height: 100, material: 'ice' },
      { x: 950, y: 300, width: 160, height: 18, material: 'wood' },
      // Tier 3
      { x: 920, y: 235, width: 18, height: 80, material: 'wood' },
      { x: 980, y: 235, width: 18, height: 80, material: 'wood' },
      { x: 950, y: 185, width: 90, height: 18, material: 'ice' },
    ],
  },
  {
    id: 18,
    title: 'Iron & Ice Fortress',
    world: "King's Domain",
    description: 'An impregnable composite citadel of rock, ice, and explosives.',
    slingshotPos: { x: 200, y: 440 },
    birds: ['bomb', 'terence', 'chuck', 'blues'],
    starThresholds: [35000, 58000, 78000],
    pigs: [
      { x: 830, y: 520, type: 'helmet', health: 90 },
      { x: 950, y: 520, type: 'corporal', health: 130 },
      { x: 1070, y: 520, type: 'helmet', health: 90 },
      { x: 890, y: 410, type: 'minion_medium', health: 50 },
      { x: 1010, y: 410, type: 'minion_medium', health: 50 },
    ],
    blocks: [
      // Base rock columns
      { x: 780, y: 500, width: 30, height: 100, material: 'stone' },
      { x: 880, y: 500, width: 26, height: 100, material: 'ice' },
      { x: 1020, y: 500, width: 26, height: 100, material: 'ice' },
      { x: 1120, y: 500, width: 30, height: 100, material: 'stone' },
      // TNT traps
      { x: 890, y: 525, width: 44, height: 44, material: 'tnt' },
      { x: 1010, y: 525, width: 44, height: 44, material: 'tnt' },
      // Stone bridge
      { x: 950, y: 440, width: 360, height: 24, material: 'stone' },
      // Upper tier
      { x: 850, y: 380, width: 22, height: 80, material: 'wood' },
      { x: 950, y: 380, width: 28, height: 80, material: 'stone' },
      { x: 1050, y: 380, width: 22, height: 80, material: 'wood' },
      { x: 950, y: 330, width: 240, height: 20, material: 'wood' },
      { x: 950, y: 285, width: 50, height: 50, material: 'stone' },
    ],
  },
  {
    id: 19,
    title: 'Royal Guard Bastion',
    world: "King's Domain",
    description: 'The King’s elite guard stands between you and the throne room!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['terence', 'bomb', 'matilda', 'chuck', 'red'],
    starThresholds: [40000, 65000, 85000],
    pigs: [
      { x: 820, y: 520, type: 'helmet', health: 110 },
      { x: 940, y: 520, type: 'corporal', health: 150 },
      { x: 1060, y: 520, type: 'helmet', health: 110 },
      { x: 880, y: 410, type: 'helmet', health: 90 },
      { x: 1000, y: 410, type: 'helmet', health: 90 },
      { x: 940, y: 300, type: 'corporal', health: 140 },
    ],
    blocks: [
      // Multi-column stone foundation
      { x: 770, y: 500, width: 32, height: 100, material: 'stone' },
      { x: 870, y: 500, width: 32, height: 100, material: 'stone' },
      { x: 1010, y: 500, width: 32, height: 100, material: 'stone' },
      { x: 1110, y: 500, width: 32, height: 100, material: 'stone' },
      // Twin TNT barrels
      { x: 940, y: 525, width: 44, height: 44, material: 'tnt' },
      { x: 940, y: 475, width: 44, height: 44, material: 'tnt' },
      // First floor stone slab
      { x: 940, y: 440, width: 360, height: 24, material: 'stone' },
      // Second floor
      { x: 840, y: 380, width: 24, height: 80, material: 'stone' },
      { x: 940, y: 380, width: 24, height: 80, material: 'stone' },
      { x: 1040, y: 380, width: 24, height: 80, material: 'stone' },
      { x: 940, y: 330, width: 230, height: 20, material: 'wood' },
      // Top watchtower
      { x: 900, y: 275, width: 20, height: 75, material: 'wood' },
      { x: 980, y: 275, width: 20, height: 75, material: 'wood' },
      { x: 940, y: 230, width: 110, height: 18, material: 'stone' },
    ],
  },
  {
    id: 20,
    title: "King Pig's Grand Castle",
    world: "King's Domain",
    description: 'The Ultimate Showdown! Bring down King Pig’s palace and rescue all the eggs!',
    slingshotPos: { x: 200, y: 440 },
    birds: ['red', 'chuck', 'bomb', 'blues', 'matilda', 'terence'],
    starThresholds: [50000, 85000, 110000],
    pigs: [
      { x: 800, y: 520, type: 'helmet', health: 100 },
      { x: 940, y: 520, type: 'corporal', health: 150 },
      { x: 1080, y: 520, type: 'helmet', health: 100 },
      { x: 870, y: 420, type: 'corporal', health: 130 },
      { x: 1010, y: 420, type: 'corporal', health: 130 },
      { x: 940, y: 320, type: 'king', health: 260 }, // THE KING!
    ],
    blocks: [
      // Monumental foundation: 5 stone fortress pilings
      { x: 740, y: 500, width: 34, height: 100, material: 'stone' },
      { x: 840, y: 500, width: 30, height: 100, material: 'wood' },
      { x: 940, y: 470, width: 44, height: 44, material: 'tnt' },
      { x: 1040, y: 500, width: 30, height: 100, material: 'wood' },
      { x: 1140, y: 500, width: 34, height: 100, material: 'stone' },
      // Giant lower stone span
      { x: 940, y: 440, width: 420, height: 24, material: 'stone' },
      // Castle second floor (Ice & Stone pillars)
      { x: 800, y: 380, width: 28, height: 80, material: 'ice' },
      { x: 890, y: 380, width: 28, height: 80, material: 'stone' },
      { x: 990, y: 380, width: 28, height: 80, material: 'stone' },
      { x: 1080, y: 380, width: 28, height: 80, material: 'ice' },
      // Royal throne deck
      { x: 940, y: 330, width: 320, height: 22, material: 'wood' },
      // Throne room pillars
      { x: 870, y: 265, width: 24, height: 90, material: 'stone' },
      { x: 1010, y: 265, width: 24, height: 90, material: 'stone' },
      // Royal canopy roof & crown spire
      { x: 940, y: 215, width: 190, height: 22, material: 'stone' },
      { x: 940, y: 170, width: 50, height: 50, material: 'stone' },
      { x: 940, y: 130, width: 24, height: 40, material: 'wood' },
    ],
  },
];
