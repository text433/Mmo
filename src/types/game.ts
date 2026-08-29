export type CharacterClassType = 'warrior' | 'mage' | 'ranger' | 'paladin';

export type ItemRarity = 'common' | 'magic' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type ItemSlot = 'weapon' | 'offhand' | 'helmet' | 'armor' | 'boots' | 'ring' | 'amulet';

export interface Item {
  id: string;
  name: string;
  slot: ItemSlot;
  rarity: ItemRarity;
  levelReq: number;
  icon: string;
  description: string;
  stats: {
    attack?: number;
    defense?: number;
    maxHp?: number;
    maxMp?: number;
    critChance?: number; // 0.05 = 5%
    moveSpeed?: number;
    cooldownReduction?: number;
  };
  sellValue: number;
  glowColor?: string;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  icon: string;
  key: string;
  manaCost: number;
  cooldown: number; // in seconds
  currentCooldown: number; // current timer remaining
  castTime: number; // in seconds (0 for instant)
  range: number;
  type: 'damage' | 'heal' | 'buff' | 'aoe' | 'dash' | 'teleport';
  aoeRadius?: number;
  damageMultiplier?: number;
  healAmount?: number;
  effectColor: string;
  sound: string;
}

export interface StatusEffect {
  id: string;
  name: string;
  icon: string;
  type: 'buff' | 'debuff';
  duration: number;
  remaining: number;
  color: string;
  statModifier?: {
    speedMultiplier?: number;
    damageMultiplier?: number;
    defenseBoost?: number;
  };
}

export interface PlayerStats {
  strength: number; // + Physical dmg, + HP
  agility: number; // + Attack speed, + Crit chance, + Move speed
  intelligence: number; // + Spell dmg, + Max MP, + MP Regen
  vitality: number; // + Max HP, + HP Regen, + Armor
  unspentPoints: number;
}

export interface Entity {
  id: string;
  name: string;
  type: 'player' | 'bot' | 'monster' | 'boss' | 'npc' | 'dummy';
  classType?: CharacterClassType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number; // rotation in radians
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  speed: number;
  isDead: boolean;
  color: string;
  skinTint?: string;
  equipped?: Partial<Record<ItemSlot, Item>>;
  statusEffects: StatusEffect[];
  targetId?: string | null;
  // Bot / Monster specific
  aiState?: 'idle' | 'roam' | 'chase' | 'attack' | 'flee' | 'cast';
  spawnX?: number;
  spawnY?: number;
  roamTargetX?: number;
  roamTargetY?: number;
  aggroRadius?: number;
  attackRange?: number;
  attackCooldown?: number;
  lastAttackTime?: number;
  isBoss?: boolean;
  bossPhase?: number;
  bossTitle?: string;
  expReward?: number;
  goldReward?: number;
  guildTag?: string;
  isPvpEnabled?: boolean;
  score?: number;
  kills?: number;
  sayBubble?: { text: string; time: number } | null;
  lastHitCrit?: boolean;
  lastHitColor?: string;
  lastAttackerId?: string;
}

export interface Projectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isCrit: boolean;
  color: string;
  rangeRemaining: number;
  aoeRadius?: number;
  effectType?: 'fire' | 'ice' | 'holy' | 'arrow' | 'slash' | 'poison' | 'arcane';
  penetrate?: boolean;
}

export interface GroundTelegraph {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  radius: number;
  angle?: number;
  coneAngle?: number;
  shape: 'circle' | 'cone' | 'line';
  length?: number;
  duration: number;
  elapsed: number;
  damage: number;
  color: string;
  effectName: string;
}

export interface LootDrop {
  id: string;
  x: number;
  y: number;
  item?: Item;
  gold?: number;
  rarity: ItemRarity;
  createdAt: number;
  duration: number; // 60 seconds
  color: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  opacity: number;
  vy: number;
  vx?: number;
  type?: 'damage' | 'crit' | 'heal' | 'mana' | 'exp' | 'gold' | 'info' | 'boss_damage';
  lifetime: number;
  createdAt: number;
  isCrit?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'spark' | 'ring' | 'glow' | 'dust' | 'line' | 'star' | 'smoke';
  scaleRate?: number;
  drag?: number;
  gravity?: number;
  rotation?: number;
  rotationSpeed?: number;
  blendMode?: 'source-over' | 'lighter';
  innerColor?: string;
  maxRadius?: number;
  strokeWidth?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'kill' | 'boss' | 'collect' | 'explore';
  targetCount: number;
  currentCount: number;
  targetName: string;
  rewardExp: number;
  rewardGold: number;
  rewardItem?: Item;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderType: 'player' | 'system' | 'world' | 'guild' | 'combat';
  text: string;
  color?: string;
  timestamp: string;
}

export interface Zone {
  id: string;
  name: string;
  minLevel: number;
  recommendedLevel: string;
  bounds: { x: number; y: number; width: number; height: number };
  color: string;
  bgColor: string;
  dangerLevel: 'Safe' | 'Low' | 'Moderate' | 'High' | 'Extreme' | 'PvP Arena';
  description: string;
  bossName?: string;
}

export type WeatherType = 'sunny' | 'rain' | 'snow';

export interface WeatherConfig {
  name: string;
  type: WeatherType;
  icon: string;
  description: string;
  color: string;
  ambientTint: string;
  effects: {
    statDescription: string;
    moveSpeedMultiplier: number;
    critBonus: number;
    hpRegenBonus: number;
    mpRegenBonus: number;
    frostDamageMultiplier: number;
    fireHolyDamageMultiplier: number;
    arcaneLightningDamageMultiplier: number;
    defenseMultiplier: number;
    dashCooldownReduction: number;
  };
}

export interface WeatherState {
  current: WeatherType;
  timer: number;
  duration: number;
  transitionProgress: number;
  nextWeather: WeatherType;
  lightningTimer: number;
  lightningActive: boolean;
  lightningAlpha: number;
  windAngle: number;
  windSpeed: number;
}
