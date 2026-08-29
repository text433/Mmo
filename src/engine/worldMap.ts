import { Zone } from '../types/game';

export interface WorldObstacle {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'tree' | 'rock' | 'ruin_pillar' | 'crystal' | 'chest' | 'shrine' | 'torch';
  color?: string;
  interactable?: boolean;
}

export interface WorldShrine {
  id: string;
  x: number;
  y: number;
  radius: number;
  name: string;
  buffType: 'haste' | 'might' | 'regeneration' | 'shield';
  color: string;
}

export const WORLD_WIDTH = 5000;
export const WORLD_HEIGHT = 5000;

export const ZONES: Zone[] = [
  {
    id: 'sanctuary',
    name: 'Sanctuary of Light',
    minLevel: 1,
    recommendedLevel: 'Lv. 1+',
    bounds: { x: 2000, y: 2000, width: 1000, height: 1000 },
    color: '#38bdf8',
    bgColor: '#0f172a',
    dangerLevel: 'Safe',
    description: 'Safe haven with healing fountain, training dummies, and travelers.',
  },
  {
    id: 'forest',
    name: 'Whispering Woods',
    minLevel: 1,
    recommendedLevel: 'Lv. 1-8',
    bounds: { x: 200, y: 200, width: 2200, height: 1800 },
    color: '#4ade80',
    bgColor: '#064e3b',
    dangerLevel: 'Low',
    description: 'Lush woodland populated by Slimes, Forest Wolves, and Goblins.',
    bossName: 'Elder Mossbeast',
  },
  {
    id: 'ruins',
    name: 'Forgotten Crypts',
    minLevel: 8,
    recommendedLevel: 'Lv. 8-16',
    bounds: { x: 2600, y: 200, width: 2200, height: 1800 },
    color: '#c084fc',
    bgColor: '#3b0764',
    dangerLevel: 'Moderate',
    description: 'Ancient stony ruins overrun by Skeletal Knights and Dark Necromancers.',
    bossName: 'Lich King Malakar',
  },
  {
    id: 'inferno',
    name: 'Molten Core',
    minLevel: 16,
    recommendedLevel: 'Lv. 16-25',
    bounds: { x: 200, y: 3000, width: 2200, height: 1800 },
    color: '#f97316',
    bgColor: '#451a03',
    dangerLevel: 'Extreme',
    description: 'Burning volcanic wasteland guarded by Lava Elementals and the World Titan.',
    bossName: 'Ignis the World Scourge',
  },
  {
    id: 'arena',
    name: 'Outlaw Colosseum',
    minLevel: 10,
    recommendedLevel: 'Lv. 10+ (PvP)',
    bounds: { x: 2600, y: 3000, width: 2200, height: 1800 },
    color: '#ef4444',
    bgColor: '#450a0a',
    dangerLevel: 'PvP Arena',
    description: 'Open PvP combat zone where brave heroes battle for triple bounty rewards.',
    bossName: 'Warlord Bloodfang',
  },
];

// Helper to find zone from coordinates
export function getZoneAt(x: number, y: number): Zone {
  for (const zone of ZONES) {
    if (
      x >= zone.bounds.x &&
      x <= zone.bounds.x + zone.bounds.width &&
      y >= zone.bounds.y &&
      y <= zone.bounds.y + zone.bounds.height
    ) {
      return zone;
    }
  }
  return ZONES[0];
}

// Generate static decorative obstacles & trees across the world
export function generateWorldObstacles(): WorldObstacle[] {
  const obstacles: WorldObstacle[] = [];
  let idCounter = 1;

  // Sanctuary decorative pillars and fountain
  obstacles.push({ id: `obs-${idCounter++}`, x: 2500, y: 2500, radius: 45, type: 'shrine', color: '#38bdf8' }); // Central Fountain

  // Torches around sanctuary
  const torchPositions = [
    { x: 2300, y: 2300 }, { x: 2700, y: 2300 },
    { x: 2300, y: 2700 }, { x: 2700, y: 2700 },
    { x: 2500, y: 2200 }, { x: 2500, y: 2800 },
    { x: 2200, y: 2500 }, { x: 2800, y: 2500 },
  ];
  torchPositions.forEach((pos) => {
    obstacles.push({ id: `obs-${idCounter++}`, x: pos.x, y: pos.y, radius: 14, type: 'torch', color: '#f59e0b' });
  });

  // Procedurally generate trees in forest zone (avoiding exact center of sanctuary)
  for (let i = 0; i < 90; i++) {
    const x = 300 + Math.random() * 2000;
    const y = 300 + Math.random() * 1600;
    obstacles.push({
      id: `tree-${idCounter++}`,
      x,
      y,
      radius: 26 + Math.random() * 12,
      type: 'tree',
      color: '#166534',
    });
  }

  // Ancient ruins pillars and rocks in crypts zone
  for (let i = 0; i < 70; i++) {
    const x = 2700 + Math.random() * 2000;
    const y = 300 + Math.random() * 1600;
    const isPillar = Math.random() > 0.4;
    obstacles.push({
      id: `ruin-${idCounter++}`,
      x,
      y,
      radius: isPillar ? 22 : 18,
      type: isPillar ? 'ruin_pillar' : 'rock',
      color: isPillar ? '#7e22ce' : '#64748b',
    });
  }

  // Obsidian rocks and magma crystals in inferno
  for (let i = 0; i < 65; i++) {
    const x = 300 + Math.random() * 2000;
    const y = 3100 + Math.random() * 1600;
    obstacles.push({
      id: `magma-${idCounter++}`,
      x,
      y,
      radius: 20 + Math.random() * 14,
      type: Math.random() > 0.5 ? 'crystal' : 'rock',
      color: '#ea580c',
    });
  }

  // Spikes and arena pillars in PvP zone
  for (let i = 0; i < 50; i++) {
    const x = 2700 + Math.random() * 2000;
    const y = 3100 + Math.random() * 1600;
    obstacles.push({
      id: `arena-${idCounter++}`,
      x,
      y,
      radius: 20 + Math.random() * 10,
      type: 'ruin_pillar',
      color: '#991b1b',
    });
  }

  return obstacles;
}

export const WORLD_SHRINES: WorldShrine[] = [
  { id: 'shrine-1', x: 1200, y: 1100, radius: 30, name: 'Shrine of Swiftness', buffType: 'haste', color: '#22d3ee' },
  { id: 'shrine-2', x: 3700, y: 1100, radius: 30, name: 'Shrine of Dark Might', buffType: 'might', color: '#a855f7' },
  { id: 'shrine-3', x: 1200, y: 3900, radius: 30, name: 'Shrine of Flame Guard', buffType: 'shield', color: '#f97316' },
  { id: 'shrine-4', x: 3700, y: 3900, radius: 30, name: 'Shrine of Blood Vitality', buffType: 'regeneration', color: '#ef4444' },
];
