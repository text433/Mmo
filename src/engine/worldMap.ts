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
    name: 'Ashen Sanctuary',
    minLevel: 1,
    recommendedLevel: 'Lv. 1+',
    bounds: { x: 2000, y: 2000, width: 1000, height: 1000 },
    color: '#b9823f',
    bgColor: '#17110b',
    dangerLevel: 'Safe',
    description: 'A dying refuge lit by braziers, old bronze shrines and the last guarded fountain.',
  },
  {
    id: 'forest',
    name: 'Blackroot Wilds',
    minLevel: 1,
    recommendedLevel: 'Lv. 1-8',
    bounds: { x: 200, y: 200, width: 2200, height: 1800 },
    color: '#69783d',
    bgColor: '#172015',
    dangerLevel: 'Low',
    description: 'Twisted woodland drowned in moss, fog and corrupted beasts.',
    bossName: 'Elder Mossbeast',
  },
  {
    id: 'ruins',
    name: 'Graveborn Crypts',
    minLevel: 8,
    recommendedLevel: 'Lv. 8-16',
    bounds: { x: 2600, y: 200, width: 2200, height: 1800 },
    color: '#80658d',
    bgColor: '#19131d',
    dangerLevel: 'Moderate',
    description: 'Cold burial halls of cracked stone, dead kings and forbidden sorcery.',
    bossName: 'Lich King Malakar',
  },
  {
    id: 'inferno',
    name: 'Cinder Wastes',
    minLevel: 16,
    recommendedLevel: 'Lv. 16-25',
    bounds: { x: 200, y: 3000, width: 2200, height: 1800 },
    color: '#a94d25',
    bgColor: '#24100b',
    dangerLevel: 'Extreme',
    description: 'Obsidian fields split by old magma scars and ash storms.',
    bossName: 'Ignis the World Scourge',
  },
  {
    id: 'arena',
    name: 'Bloodiron Pit',
    minLevel: 10,
    recommendedLevel: 'Lv. 10+ (PvP)',
    bounds: { x: 2600, y: 3000, width: 2200, height: 1800 },
    color: '#8d302b',
    bgColor: '#210d0c',
    dangerLevel: 'PvP Arena',
    description: 'A ruined war arena of iron stakes, broken standards and bounty hunters.',
    bossName: 'Warlord Bloodfang',
  },
];

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

export function generateWorldObstacles(): WorldObstacle[] {
  const obstacles: WorldObstacle[] = [];
  let idCounter = 1;

  obstacles.push({ id: `obs-${idCounter++}`, x: 2500, y: 2500, radius: 45, type: 'shrine', color: '#9b713d' });

  const torchPositions = [
    { x: 2300, y: 2300 }, { x: 2700, y: 2300 },
    { x: 2300, y: 2700 }, { x: 2700, y: 2700 },
    { x: 2500, y: 2200 }, { x: 2500, y: 2800 },
    { x: 2200, y: 2500 }, { x: 2800, y: 2500 },
  ];
  torchPositions.forEach((pos) => {
    obstacles.push({ id: `obs-${idCounter++}`, x: pos.x, y: pos.y, radius: 14, type: 'torch', color: '#b65f24' });
  });

  for (let i = 0; i < 90; i++) {
    const x = 300 + Math.random() * 2000;
    const y = 300 + Math.random() * 1600;
    obstacles.push({
      id: `tree-${idCounter++}`,
      x,
      y,
      radius: 26 + Math.random() * 12,
      type: 'tree',
      color: i % 4 === 0 ? '#26351f' : '#1d2b1b',
    });
  }

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
      color: isPillar ? '#4b3e4e' : '#494746',
    });
  }

  for (let i = 0; i < 65; i++) {
    const x = 300 + Math.random() * 2000;
    const y = 3100 + Math.random() * 1600;
    obstacles.push({
      id: `magma-${idCounter++}`,
      x,
      y,
      radius: 20 + Math.random() * 14,
      type: Math.random() > 0.5 ? 'crystal' : 'rock',
      color: Math.random() > 0.55 ? '#9f3f20' : '#38211b',
    });
  }

  for (let i = 0; i < 50; i++) {
    const x = 2700 + Math.random() * 2000;
    const y = 3100 + Math.random() * 1600;
    obstacles.push({
      id: `arena-${idCounter++}`,
      x,
      y,
      radius: 20 + Math.random() * 10,
      type: 'ruin_pillar',
      color: '#5e2925',
    });
  }

  return obstacles;
}

export const WORLD_SHRINES: WorldShrine[] = [
  { id: 'shrine-1', x: 1200, y: 1100, radius: 30, name: 'Shrine of the Hunt', buffType: 'haste', color: '#9d8b59' },
  { id: 'shrine-2', x: 3700, y: 1100, radius: 30, name: 'Altar of Dark Might', buffType: 'might', color: '#75566e' },
  { id: 'shrine-3', x: 1200, y: 3900, radius: 30, name: 'Cinder Ward', buffType: 'shield', color: '#a74f25' },
  { id: 'shrine-4', x: 3700, y: 3900, radius: 30, name: 'Bloodwell', buffType: 'regeneration', color: '#8f332d' },
];
