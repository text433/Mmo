import {
  Entity,
  PlayerStats,
  Item,
  ItemSlot,
  CharacterClassType,
  Projectile,
  GroundTelegraph,
  LootDrop,
  FloatingText,
  Particle,
  Quest,
  ChatMessage,
  Ability,
  StatusEffect,
  WeatherState,
  WeatherType,
} from '../types/game';
import { CLASS_DEFINITIONS } from './classData';
import { generateLootItem, getStarterGear } from './itemsData';
import { sound } from './soundEngine';
import { ZONES, getZoneAt, WORLD_WIDTH, WORLD_HEIGHT, WorldObstacle, generateWorldObstacles, WORLD_SHRINES } from './worldMap';
import { WEATHER_CONFIGS, WEATHER_CYCLE_ORDER } from './weatherData';

const BOT_NAMES = [
  'Valkyrie99', 'Shadowblade', 'AuraKnight', 'FrostMage_Pro', 'DragonSlayer',
  'Zenith', 'PyroClasm', 'IronClad', 'NightStalker', 'BlazeMaster',
  'Ragnarok', 'Moonlight', 'StormBringer', 'NovaQueen', 'Excalibur',
  'TitanSlayer', 'PhantomRogue', 'SilverArrow', 'HolyAvenger', 'BloodSeeker'
];

const BOT_GUILDS = ['[SOLARIS]', '[NIGHTFALL]', '[MYTHIC]', '[VOID]', '[IMMORTALS]', '[VALHALLA]'];

const BOT_CHAT_PHRASES = [
  'Boss is spawning in Molten Core! Group up!',
  'Need healer for Forgotten Crypts run!',
  'Just dropped an Epic broadsword! LFG!',
  'Watch out for the dragon fire breath telegraph!',
  'Gg wp on the world boss everyone!',
  'PvP arena is crazy right now lol',
  'Anyone want to trade some legendary rings?',
  'Level 15 reached! New ultimate unlocked!',
];

export class GameEngine {
  public player: Entity;
  public playerStats: PlayerStats;
  public inventory: (Item | null)[] = new Array(24).fill(null);
  public abilities: Ability[] = [];
  public gold: number = 250;
  public healthPotions: number = 5;
  public manaPotions: number = 5;
  public exp: number = 0;
  public nextLevelExp: number = 100;
  public killsCount: number = 0;
  public deathCount: number = 0;

  public entities: Map<string, Entity> = new Map();
  public projectiles: Projectile[] = [];
  public groundTelegraphs: GroundTelegraph[] = [];
  public lootDrops: LootDrop[] = [];
  public floatingTexts: FloatingText[] = [];
  public particles: Particle[] = [];
  public obstacles: WorldObstacle[] = [];
  public quests: Quest[] = [];
  public chatMessages: ChatMessage[] = [];

  public targetEntity: Entity | null = null;
  public cameraX: number = 2500;
  public cameraY: number = 2500;
  public cameraZoom: number = 1.0;

  // Input states
  public keys: Record<string, boolean> = {};
  public mouseX: number = 0;
  public mouseY: number = 0;
  public mouseWorldX: number = 2500;
  public mouseWorldY: number = 2500;
  public isMouseDown: boolean = false;

  // Casting & Dash
  public isCasting: boolean = false;
  public currentCast: { ability: Ability; progress: number; duration: number } | null = null;
  public dashCooldown: number = 0;
  public isDashing: boolean = false;
  public dashDurationRemaining: number = 0;

  // Gameplay Settings
  public autoLoot: boolean = true;

  // Dynamic Weather System
  public weather: WeatherState = {
    current: 'sunny',
    timer: 0,
    duration: 65, // 65 seconds per weather cycle
    transitionProgress: 0,
    nextWeather: 'rain',
    lightningTimer: 0,
    lightningActive: false,
    lightningAlpha: 0,
    windAngle: 0.28,
    windSpeed: 1.0,
  };

  private lastTime: number = performance.now();
  private botChatTimer: number = 0;
  private mobRespawnTimer: number = 0;
  private regenTimer: number = 0;
  private questCheckTimer: number = 0;

  constructor(playerName: string = 'Hero', chosenClass: CharacterClassType = 'warrior') {
    const classDef = CLASS_DEFINITIONS[chosenClass];

    this.playerStats = {
      strength: chosenClass === 'warrior' ? 14 : chosenClass === 'paladin' ? 12 : 8,
      agility: chosenClass === 'ranger' ? 15 : 9,
      intelligence: chosenClass === 'mage' ? 16 : chosenClass === 'paladin' ? 10 : 6,
      vitality: chosenClass === 'paladin' ? 15 : chosenClass === 'warrior' ? 14 : 10,
      unspentPoints: 0,
    };

    this.abilities = JSON.parse(JSON.stringify(classDef.abilities));

    const starterGear = getStarterGear(chosenClass);

    this.player = {
      id: 'player',
      name: playerName,
      type: 'player',
      classType: chosenClass,
      x: 2500,
      y: 2500,
      vx: 0,
      vy: 0,
      radius: 20,
      angle: 0,
      level: 1,
      hp: classDef.baseHp,
      maxHp: classDef.baseHp,
      mp: classDef.baseMp,
      maxMp: classDef.baseMp,
      speed: classDef.baseSpeed,
      isDead: false,
      color: classDef.color,
      skinTint: '#fbcfe8',
      equipped: starterGear,
      statusEffects: [],
      score: 0,
      kills: 0,
      guildTag: '[HEROES]',
      isPvpEnabled: false,
    };

    // Populate initial inventory with some starter potions & test item
    this.inventory[0] = generateLootItem(1, 'magic');
    this.inventory[1] = generateLootItem(2, 'rare');

    this.obstacles = generateWorldObstacles();
    this.initQuests();
    this.initWorldEntities();

    try {
      const savedAutoLoot = localStorage.getItem('realmio_auto_loot');
      if (savedAutoLoot !== null) {
        this.autoLoot = savedAutoLoot === 'true';
      }
    } catch (e) {
      this.autoLoot = true;
    }

    this.addChatMessage('System', 'system', `Welcome to RealmIO MMORPG! Explore the world, slay monsters, craft gear, and conquer the bosses.`, '#38bdf8');
    this.recalculatePlayerStats();
  }

  public setAutoLoot(enabled: boolean) {
    this.autoLoot = enabled;
    try {
      localStorage.setItem('realmio_auto_loot', String(enabled));
    } catch (e) {
      // ignore
    }
    this.addFloatingText(
      this.player.x,
      this.player.y - 35,
      `Auto-Loot: ${enabled ? 'ON' : 'OFF'}`,
      enabled ? '#22c55e' : '#f97316',
      16
    );
    this.addChatMessage(
      'System',
      'system',
      `Auto-Loot is now ${enabled ? 'ENABLED (walk over items & gold to collect)' : 'DISABLED (press [F] or click to loot)'}.`,
      enabled ? '#22c55e' : '#f97316'
    );
  }

  public pickupNearbyLoot() {
    if (this.player.isDead) return;
    const pickupRadius = this.player.radius + 65;
    const nearbyLoot = this.lootDrops.filter((loot) => {
      const dist = Math.hypot(loot.x - this.player.x, loot.y - this.player.y);
      return dist <= pickupRadius;
    });

    if (nearbyLoot.length === 0) {
      const closeLoot = this.lootDrops.some((loot) => Math.hypot(loot.x - this.player.x, loot.y - this.player.y) <= 160);
      if (closeLoot) {
        this.addFloatingText(this.player.x, this.player.y - 25, 'Walk closer to loot', '#94a3b8', 13);
      }
      return;
    }

    nearbyLoot.forEach((loot) => {
      this.pickupLoot(loot);
    });
  }

  public initQuests() {
    this.quests = [
      {
        id: 'q1',
        title: 'Forest Pest Control',
        description: 'Slay 5 Forest Slimes or Wolves in Whispering Woods.',
        type: 'kill',
        targetCount: 5,
        currentCount: 0,
        targetName: 'Forest Slime / Wolf',
        rewardExp: 150,
        rewardGold: 100,
        rewardItem: generateLootItem(2, 'rare'),
        isCompleted: false,
        isClaimed: false,
      },
      {
        id: 'q2',
        title: 'Crypt Cleansing',
        description: 'Defeat 4 Skeletal Knights in Forgotten Crypts.',
        type: 'kill',
        targetCount: 4,
        currentCount: 0,
        targetName: 'Skeletal Knight',
        rewardExp: 350,
        rewardGold: 220,
        rewardItem: generateLootItem(5, 'epic'),
        isCompleted: false,
        isClaimed: false,
      },
      {
        id: 'q3',
        title: 'Bane of the Behemoth',
        description: 'Defeat the world boss Elder Mossbeast in the forest.',
        type: 'boss',
        targetCount: 1,
        currentCount: 0,
        targetName: 'Elder Mossbeast',
        rewardExp: 800,
        rewardGold: 500,
        rewardItem: generateLootItem(8, 'legendary'),
        isCompleted: false,
        isClaimed: false,
      },
      {
        id: 'q4',
        title: 'Trial of Flame',
        description: 'Defeat Ignis the World Scourge in the Molten Core.',
        type: 'boss',
        targetCount: 1,
        currentCount: 0,
        targetName: 'Ignis the World Scourge',
        rewardExp: 2000,
        rewardGold: 1200,
        rewardItem: generateLootItem(15, 'mythic'),
        isCompleted: false,
        isClaimed: false,
      },
    ];
  }

  public initWorldEntities() {
    this.entities.clear();

    // 1. Training Dummies in Sanctuary
    this.spawnEntity({
      id: 'dummy-1',
      name: 'Training Target',
      type: 'dummy',
      x: 2420,
      y: 2380,
      vx: 0,
      vy: 0,
      radius: 22,
      angle: 0,
      level: 1,
      hp: 10000,
      maxHp: 10000,
      mp: 0,
      maxMp: 0,
      speed: 0,
      isDead: false,
      color: '#fbbf24',
      statusEffects: [],
    });
    this.spawnEntity({
      id: 'dummy-2',
      name: 'Training Target',
      type: 'dummy',
      x: 2580,
      y: 2380,
      vx: 0,
      vy: 0,
      radius: 22,
      angle: 0,
      level: 1,
      hp: 10000,
      maxHp: 10000,
      mp: 0,
      maxMp: 0,
      speed: 0,
      isDead: false,
      color: '#fbbf24',
      statusEffects: [],
    });

    // 2. Simulated Online Players (Bots)
    const classes: CharacterClassType[] = ['warrior', 'mage', 'ranger', 'paladin'];
    for (let i = 0; i < 18; i++) {
      const bClass = classes[i % classes.length];
      const bName = BOT_NAMES[i % BOT_NAMES.length];
      const bGuild = BOT_GUILDS[i % BOT_GUILDS.length];
      const bLevel = 1 + Math.floor(Math.random() * 15);
      const startZone = ZONES[Math.floor(Math.random() * ZONES.length)];
      const bx = startZone.bounds.x + 100 + Math.random() * (startZone.bounds.width - 200);
      const by = startZone.bounds.y + 100 + Math.random() * (startZone.bounds.height - 200);

      this.spawnEntity({
        id: `bot-${i}`,
        name: bName,
        type: 'bot',
        classType: bClass,
        x: bx,
        y: by,
        spawnX: bx,
        spawnY: by,
        vx: 0,
        vy: 0,
        radius: 20,
        angle: Math.random() * Math.PI * 2,
        level: bLevel,
        hp: 300 + bLevel * 40,
        maxHp: 300 + bLevel * 40,
        mp: 200 + bLevel * 25,
        maxMp: 200 + bLevel * 25,
        speed: 4.2 + Math.random() * 0.8,
        isDead: false,
        color: CLASS_DEFINITIONS[bClass].color,
        guildTag: bGuild,
        aiState: 'roam',
        aggroRadius: 280,
        attackRange: bClass === 'mage' || bClass === 'ranger' ? 320 : 90,
        attackCooldown: 1.2,
        lastAttackTime: 0,
        statusEffects: [],
        score: bLevel * 120 + Math.floor(Math.random() * 80),
        kills: Math.floor(Math.random() * 10),
      });
    }

    // 3. Populate Monsters across zones
    this.spawnForestMonsters();
    this.spawnCryptMonsters();
    this.spawnInfernoMonsters();
    this.spawnArenaMonsters();

    // 4. Spawn Bosses
    this.spawnBosses();
  }

  private spawnForestMonsters() {
    for (let i = 0; i < 22; i++) {
      const isWolf = i % 2 === 0;
      const x = 300 + Math.random() * 1900;
      const y = 300 + Math.random() * 1500;
      this.spawnEntity({
        id: `forest-mob-${i}`,
        name: isWolf ? 'Timber Wolf' : 'Emerald Slime',
        type: 'monster',
        x,
        y,
        spawnX: x,
        spawnY: y,
        vx: 0,
        vy: 0,
        radius: isWolf ? 22 : 18,
        angle: 0,
        level: 1 + Math.floor(Math.random() * 4),
        hp: isWolf ? 160 : 100,
        maxHp: isWolf ? 160 : 100,
        mp: 0,
        maxMp: 0,
        speed: isWolf ? 3.8 : 2.4,
        isDead: false,
        color: isWolf ? '#78716c' : '#22c55e',
        aiState: 'roam',
        aggroRadius: 220,
        attackRange: 65,
        attackCooldown: 1.4,
        lastAttackTime: 0,
        expReward: 35,
        goldReward: 18,
        statusEffects: [],
      });
    }
  }

  private spawnCryptMonsters() {
    for (let i = 0; i < 20; i++) {
      const isNecro = i % 3 === 0;
      const x = 2700 + Math.random() * 1900;
      const y = 300 + Math.random() * 1500;
      this.spawnEntity({
        id: `crypt-mob-${i}`,
        name: isNecro ? 'Dark Necromancer' : 'Skeletal Knight',
        type: 'monster',
        x,
        y,
        spawnX: x,
        spawnY: y,
        vx: 0,
        vy: 0,
        radius: isNecro ? 20 : 24,
        angle: 0,
        level: 8 + Math.floor(Math.random() * 6),
        hp: isNecro ? 280 : 420,
        maxHp: isNecro ? 280 : 420,
        mp: 200,
        maxMp: 200,
        speed: isNecro ? 3.0 : 3.4,
        isDead: false,
        color: isNecro ? '#a855f7' : '#94a3b8',
        aiState: 'roam',
        aggroRadius: 250,
        attackRange: isNecro ? 300 : 75,
        attackCooldown: isNecro ? 2.0 : 1.5,
        lastAttackTime: 0,
        expReward: 85,
        goldReward: 45,
        statusEffects: [],
      });
    }
  }

  private spawnInfernoMonsters() {
    for (let i = 0; i < 20; i++) {
      const isDrake = i % 2 === 0;
      const x = 300 + Math.random() * 1900;
      const y = 3100 + Math.random() * 1500;
      this.spawnEntity({
        id: `inferno-mob-${i}`,
        name: isDrake ? 'Fire Drake' : 'Magma Colossus',
        type: 'monster',
        x,
        y,
        spawnX: x,
        spawnY: y,
        vx: 0,
        vy: 0,
        radius: isDrake ? 25 : 30,
        angle: 0,
        level: 16 + Math.floor(Math.random() * 6),
        hp: isDrake ? 600 : 950,
        maxHp: isDrake ? 600 : 950,
        mp: 100,
        maxMp: 100,
        speed: isDrake ? 4.0 : 2.5,
        isDead: false,
        color: isDrake ? '#f97316' : '#dc2626',
        aiState: 'roam',
        aggroRadius: 280,
        attackRange: isDrake ? 240 : 85,
        attackCooldown: 1.8,
        lastAttackTime: 0,
        expReward: 160,
        goldReward: 90,
        statusEffects: [],
      });
    }
  }

  private spawnArenaMonsters() {
    for (let i = 0; i < 16; i++) {
      const x = 2700 + Math.random() * 1900;
      const y = 3100 + Math.random() * 1500;
      this.spawnEntity({
        id: `arena-mob-${i}`,
        name: 'Outlaw Gladiator',
        type: 'monster',
        x,
        y,
        spawnX: x,
        spawnY: y,
        vx: 0,
        vy: 0,
        radius: 22,
        angle: 0,
        level: 12 + Math.floor(Math.random() * 8),
        hp: 550,
        maxHp: 550,
        mp: 100,
        maxMp: 100,
        speed: 4.2,
        isDead: false,
        color: '#e11d48',
        aiState: 'roam',
        aggroRadius: 300,
        attackRange: 80,
        attackCooldown: 1.2,
        lastAttackTime: 0,
        expReward: 130,
        goldReward: 80,
        statusEffects: [],
      });
    }
  }

  public spawnBosses() {
    // Forest Boss: Elder Mossbeast
    this.spawnEntity({
      id: 'boss-forest',
      name: 'Elder Mossbeast',
      type: 'boss',
      isBoss: true,
      bossTitle: 'Ancient Guardian of the Grove',
      x: 1300,
      y: 1100,
      spawnX: 1300,
      spawnY: 1100,
      vx: 0,
      vy: 0,
      radius: 46,
      angle: 0,
      level: 6,
      hp: 3200,
      maxHp: 3200,
      mp: 500,
      maxMp: 500,
      speed: 2.8,
      isDead: false,
      color: '#15803d',
      aiState: 'idle',
      aggroRadius: 350,
      attackRange: 120,
      attackCooldown: 2.2,
      lastAttackTime: 0,
      expReward: 650,
      goldReward: 350,
      statusEffects: [],
    });

    // Crypt Boss: Lich King Malakar
    this.spawnEntity({
      id: 'boss-crypt',
      name: 'Lich King Malakar',
      type: 'boss',
      isBoss: true,
      bossTitle: 'Lord of the Undead Realm',
      x: 3700,
      y: 1100,
      spawnX: 3700,
      spawnY: 1100,
      vx: 0,
      vy: 0,
      radius: 42,
      angle: 0,
      level: 14,
      hp: 6800,
      maxHp: 6800,
      mp: 1000,
      maxMp: 1000,
      speed: 3.2,
      isDead: false,
      color: '#7e22ce',
      aiState: 'idle',
      aggroRadius: 380,
      attackRange: 360,
      attackCooldown: 2.0,
      lastAttackTime: 0,
      expReward: 1400,
      goldReward: 800,
      statusEffects: [],
    });

    // Inferno Boss: Ignis the World Scourge
    this.spawnEntity({
      id: 'boss-inferno',
      name: 'Ignis the World Scourge',
      type: 'boss',
      isBoss: true,
      bossTitle: 'Ancient Dragon of Calamity',
      x: 1300,
      y: 3900,
      spawnX: 1300,
      spawnY: 3900,
      vx: 0,
      vy: 0,
      radius: 58,
      angle: 0,
      level: 22,
      hp: 14000,
      maxHp: 14000,
      mp: 2000,
      maxMp: 2000,
      speed: 3.6,
      isDead: false,
      color: '#dc2626',
      aiState: 'idle',
      aggroRadius: 420,
      attackRange: 320,
      attackCooldown: 2.4,
      lastAttackTime: 0,
      expReward: 3500,
      goldReward: 2000,
      statusEffects: [],
    });
  }

  public spawnEntity(entity: Entity) {
    this.entities.set(entity.id, entity);
  }

  public addChatMessage(sender: string, senderType: 'player' | 'system' | 'world' | 'guild' | 'combat', text: string, color?: string) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.chatMessages.push({
      id: `msg-${Date.now()}-${Math.random()}`,
      sender,
      senderType,
      text,
      color,
      timestamp: timeStr,
    });
    if (this.chatMessages.length > 50) {
      this.chatMessages.shift();
    }
  }

  public sendPlayerChat(text: string) {
    if (!text.trim()) return;
    this.addChatMessage(this.player.name, 'world', text.trim(), '#ffffff');
    this.player.sayBubble = { text: text.trim(), time: 4.0 };
  }

  // Weather System Controls & Transitions
  public setWeather(newWeather: WeatherType, isManual: boolean = false) {
    if (this.weather.current === newWeather && !isManual) return;

    this.weather.current = newWeather;
    this.weather.timer = 0;
    this.weather.lightningTimer = 0;
    this.weather.lightningActive = false;
    this.weather.lightningAlpha = 0;

    const nextIndex = (WEATHER_CYCLE_ORDER.indexOf(newWeather) + 1) % WEATHER_CYCLE_ORDER.length;
    this.weather.nextWeather = WEATHER_CYCLE_ORDER[nextIndex];

    const cfg = WEATHER_CONFIGS[newWeather];

    // Atmospheric sound chime
    sound.playWeatherChange(newWeather);

    // Weather announcement in chat & floating banner text
    this.addChatMessage(
      'World',
      'world',
      `🌤️ [WEATHER] The realm shifts to ${cfg.name}! (${cfg.effects.statDescription})`,
      cfg.color
    );
    this.addFloatingText(this.player.x, this.player.y - 45, `Weather: ${cfg.name}`, cfg.color, 18, true);

    // If thunderstorm begins, trigger immediate ambient rumbling thunder
    if (newWeather === 'rain') {
      setTimeout(() => {
        if (this.weather.current === 'rain') {
          sound.playThunder();
          this.weather.lightningAlpha = 0.75;
        }
      }, 700);
    }
  }

  public cycleNextWeather() {
    const nextIndex = (WEATHER_CYCLE_ORDER.indexOf(this.weather.current) + 1) % WEATHER_CYCLE_ORDER.length;
    this.setWeather(WEATHER_CYCLE_ORDER[nextIndex], true);
  }

  // Stat calculation from base, points, and equipped gear
  public recalculatePlayerStats() {
    const classDef = CLASS_DEFINITIONS[this.player.classType || 'warrior'];
    let bonusHp = 0;
    let bonusMp = 0;
    let bonusSpeed = 0;
    let bonusAttack = 0;
    let bonusCrit = 0;

    // From stat points
    bonusHp += this.playerStats.vitality * 18 + this.playerStats.strength * 6;
    bonusMp += this.playerStats.intelligence * 14;
    bonusAttack += this.playerStats.strength * 2.5 + this.playerStats.intelligence * 2.0;
    bonusCrit += this.playerStats.agility * 0.006;
    bonusSpeed += this.playerStats.agility * 0.04;

    // From equipped gear
    if (this.player.equipped) {
      Object.values(this.player.equipped).forEach((item) => {
        if (!item) return;
        if (item.stats.maxHp) bonusHp += item.stats.maxHp;
        if (item.stats.maxMp) bonusMp += item.stats.maxMp;
        if (item.stats.attack) bonusAttack += item.stats.attack;
        if (item.stats.critChance) bonusCrit += item.stats.critChance;
        if (item.stats.moveSpeed) bonusSpeed += item.stats.moveSpeed;
      });
    }

    const oldMaxHp = this.player.maxHp;
    this.player.maxHp = Math.round(classDef.baseHp + bonusHp + (this.player.level - 1) * 35);
    this.player.maxMp = Math.round(classDef.baseMp + bonusMp + (this.player.level - 1) * 20);
    this.player.speed = Number((classDef.baseSpeed + bonusSpeed).toFixed(2));

    // Scale current HP proportionally if max changed
    if (oldMaxHp > 0 && oldMaxHp !== this.player.maxHp) {
      this.player.hp = Math.min(this.player.maxHp, Math.round((this.player.hp / oldMaxHp) * this.player.maxHp));
    }
  }

  public allocateStatPoint(stat: keyof Omit<PlayerStats, 'unspentPoints'>) {
    if (this.playerStats.unspentPoints > 0) {
      this.playerStats[stat] += 1;
      this.playerStats.unspentPoints -= 1;
      this.recalculatePlayerStats();
      sound.playLootPickup('magic');
    }
  }

  public equipItem(item: Item, inventoryIndex: number) {
    if (item.levelReq > this.player.level) {
      this.addFloatingText(this.player.x, this.player.y - 30, `Requires Lv. ${item.levelReq}!`, '#ef4444');
      return;
    }
    const currentEquipped = this.player.equipped?.[item.slot];
    if (!this.player.equipped) this.player.equipped = {};

    this.player.equipped[item.slot] = item;
    this.inventory[inventoryIndex] = currentEquipped || null;
    this.recalculatePlayerStats();
    sound.playLootPickup(item.rarity);
    this.addChatMessage('System', 'system', `Equipped ${item.name}!`, item.glowColor);
  }

  public unequipItem(slot: ItemSlot) {
    const equippedItem = this.player.equipped?.[slot];
    if (!equippedItem) return;

    // Find free inventory slot
    const freeIndex = this.inventory.findIndex((s) => s === null);
    if (freeIndex === -1) {
      this.addFloatingText(this.player.x, this.player.y - 30, 'Inventory Full!', '#ef4444');
      return;
    }

    this.inventory[freeIndex] = equippedItem;
    delete this.player.equipped[slot];
    this.recalculatePlayerStats();
    sound.playLootPickup('common');
  }

  public sellItem(inventoryIndex: number) {
    const item = this.inventory[inventoryIndex];
    if (!item) return;
    this.gold += item.sellValue;
    this.inventory[inventoryIndex] = null;
    sound.playLootPickup('common');
    this.addChatMessage('System', 'system', `Sold ${item.name} for +${item.sellValue} Gold.`, '#eab308');
  }

  public useHealthPotion() {
    if (this.healthPotions <= 0) return;
    if (this.player.hp >= this.player.maxHp) return;
    this.healthPotions -= 1;
    const healVal = Math.round(this.player.maxHp * 0.45);
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healVal);
    this.addFloatingText(this.player.x, this.player.y - 20, `+${healVal} HP`, '#22c55e');
    sound.playPotion();

    // Radiant green healing sparkles and aura ring
    this.createImpactShockwave(this.player.x, this.player.y, '#22c55e', 8, 36, 2.5);
    this.createSparks(this.player.x, this.player.y, '#4ade80', 12, -Math.PI / 2, Math.PI * 0.8, 1.5, 4.5, 'spark');
  }

  public useManaPotion() {
    if (this.manaPotions <= 0) return;
    if (this.player.mp >= this.player.maxMp) return;
    this.manaPotions -= 1;
    const manaVal = Math.round(this.player.maxMp * 0.5);
    this.player.mp = Math.min(this.player.maxMp, this.player.mp + manaVal);
    this.addFloatingText(this.player.x, this.player.y - 20, `+${manaVal} MP`, '#38bdf8');
    sound.playPotion();

    // Arcane mana sparkles and aura ring
    this.createImpactShockwave(this.player.x, this.player.y, '#38bdf8', 8, 36, 2.5);
    this.createSparks(this.player.x, this.player.y, '#38bdf8', 12, -Math.PI / 2, Math.PI * 0.8, 1.5, 4.5, 'spark');
  }

  public triggerDash() {
    if (this.dashCooldown > 0 || this.player.isDead) return;
    // Snow weather grants -0.5s dash cooldown (ice sliding)
    const baseDashCooldown = this.weather.current === 'snow' ? 3.0 : 3.5;
    this.dashCooldown = baseDashCooldown;
    this.isDashing = true;
    this.dashDurationRemaining = 0.25;

    // Dash towards mouse direction or movement direction
    const angle = Math.atan2(this.mouseWorldY - this.player.y, this.mouseWorldX - this.player.x);
    this.player.vx = Math.cos(angle) * this.player.speed * 2.8;
    this.player.vy = Math.sin(angle) * this.player.speed * 2.8;

    sound.playSpellCast('dash');
    this.createDashGhostParticles();
    this.createDustPuff(this.player.x, this.player.y, 8);
    this.createImpactShockwave(this.player.x, this.player.y, this.player.color, 6, 28, 2);
  }

  private createDashGhostParticles() {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.player.x + (Math.random() - 0.5) * 16,
        y: this.player.y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 14,
        color: this.player.color,
        innerColor: '#ffffff',
        alpha: 0.75,
        decay: 0.08,
        shape: 'glow',
        blendMode: 'lighter',
      });
    }
  }

  public useAbility(index: number) {
    const ability = this.abilities[index];
    if (!ability || this.player.isDead) return;
    if (ability.currentCooldown > 0) {
      this.addFloatingText(this.player.x, this.player.y - 25, 'On Cooldown!', '#94a3b8', 12);
      return;
    }
    if (this.player.mp < ability.manaCost) {
      this.addFloatingText(this.player.x, this.player.y - 25, 'Not Enough Mana!', '#38bdf8', 12);
      return;
    }

    if (ability.castTime > 0) {
      this.isCasting = true;
      this.currentCast = { ability, progress: 0, duration: ability.castTime };
      return;
    }

    this.executeAbility(ability);
  }

  private executeAbility(ability: Ability) {
    this.player.mp -= ability.manaCost;
    ability.currentCooldown = ability.cooldown;
    sound.playSpellCast(ability.sound);

    // Weather elemental spell multipliers
    let weatherSpellMultiplier = 1.0;
    const wType = this.weather.current;
    if (wType === 'sunny' && (ability.effectColor === '#fbbf24' || ability.effectColor === '#f59e0b' || ability.effectColor === '#ea580c' || ability.id.includes('fire') || ability.id.includes('holy') || ability.id.includes('smite'))) {
      weatherSpellMultiplier = 1.15;
    } else if (wType === 'rain' && (ability.effectColor === '#38bdf8' || ability.effectColor === '#0284c7' || ability.effectColor === '#a855f7' || ability.id.includes('arcane') || ability.id.includes('multishot') || ability.id.includes('meteor'))) {
      weatherSpellMultiplier = 1.20;
    } else if (wType === 'snow' && (ability.effectColor === '#93c5fd' || ability.effectColor === '#60a5fa' || ability.id.includes('frost') || ability.id.includes('ice') || ability.id.includes('nova'))) {
      weatherSpellMultiplier = 1.25;
    }

    const angle = Math.atan2(this.mouseWorldY - this.player.y, this.mouseWorldX - this.player.x);

    if (ability.type === 'teleport') {
      const dist = Math.min(ability.range, Math.hypot(this.mouseWorldX - this.player.x, this.mouseWorldY - this.player.y));
      const targetX = Math.max(100, Math.min(WORLD_WIDTH - 100, this.player.x + Math.cos(angle) * dist));
      const targetY = Math.max(100, Math.min(WORLD_HEIGHT - 100, this.player.y + Math.sin(angle) * dist));

      // Departure implosion & shockwave
      this.createImpactShockwave(this.player.x, this.player.y, ability.effectColor, 10, 40, 3);
      this.createSparks(this.player.x, this.player.y, ability.effectColor, 16, undefined, Math.PI * 2, 2, 6);
      this.createDustPuff(this.player.x, this.player.y, 4);

      this.player.x = targetX;
      this.player.y = targetY;

      // Arrival explosion & radiant sparks
      this.createImpactShockwave(this.player.x, this.player.y, ability.effectColor, 6, 50, 3.5);
      this.createSparks(this.player.x, this.player.y, ability.effectColor, 20, undefined, Math.PI * 2, 3, 8);
      this.createDustPuff(this.player.x, this.player.y, 6);
    } else if (ability.type === 'buff' || ability.type === 'heal') {
      if (ability.healAmount) {
        const boostedHeal = Math.round(ability.healAmount * (wType === 'sunny' ? 1.2 : 1.0));
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + boostedHeal);
        this.addFloatingText(this.player.x, this.player.y - 30, `+${boostedHeal} HP`, '#4ade80', 18);
      }
      this.player.statusEffects.push({
        id: `buff-${ability.id}`,
        name: ability.name,
        icon: ability.icon,
        type: 'buff',
        duration: 5,
        remaining: 5,
        color: ability.effectColor,
      });
      // Radiant aura shockwave & rising motes
      this.createImpactShockwave(this.player.x, this.player.y, ability.effectColor, 8, 45, 3);
      this.createSparks(this.player.x, this.player.y, ability.effectColor, 24, -Math.PI / 2, Math.PI * 0.75, 2, 6);
    } else if (ability.type === 'aoe') {
      // Ground telegraph or instant AOE
      if (ability.range > 200) {
        // Ranged AOE (Meteor / Arrow Storm)
        this.groundTelegraphs.push({
          id: `telegraph-${Date.now()}`,
          ownerId: this.player.id,
          x: this.mouseWorldX,
          y: this.mouseWorldY,
          radius: ability.aoeRadius || 150,
          shape: 'circle',
          duration: 0.8,
          elapsed: 0,
          damage: Math.round(this.getEffectiveAttack() * (ability.damageMultiplier || 3) * weatherSpellMultiplier),
          color: ability.effectColor,
          effectName: ability.name,
        });
        // Initial ground beacon glow & charge sparks at target zone
        this.createImpactShockwave(this.mouseWorldX, this.mouseWorldY, ability.effectColor, 6, ability.aoeRadius || 150, 1.5);
      } else {
        // Point-blank AOE (Frost Nova / Whirlwind)
        this.createImpactShockwave(this.player.x, this.player.y, ability.effectColor, 12, (ability.aoeRadius || 140) * 1.05, 4);
        this.createSparks(this.player.x, this.player.y, ability.effectColor, 35, undefined, Math.PI * 2, 4, 9);
        this.createDustPuff(this.player.x, this.player.y, 8);

        const radius = ability.aoeRadius || 140;
        const dmg = Math.round(this.getEffectiveAttack() * (ability.damageMultiplier || 2) * weatherSpellMultiplier);

        this.entities.forEach((ent) => {
          if (ent.id === this.player.id || ent.isDead || ent.type === 'npc') return;
          const dist = Math.hypot(ent.x - this.player.x, ent.y - this.player.y);
          if (dist <= radius + ent.radius) {
            this.damageEntity(ent, dmg, false, this.player);
          }
        });
      }
    } else if (ability.type === 'damage') {
      // Projectiles (Fireball / Tripleshot / Smite) or Melee Cleave
      if (ability.range > 150) {
        // Muzzle flash sparks & shockwave
        this.createSparks(this.player.x, this.player.y, ability.effectColor, 8, angle, 0.5, 3, 7);
        this.createDustPuff(this.player.x, this.player.y, 3);

        if (ability.id === 'r_multishot') {
          // 3 spread arrows
          for (let i = -1; i <= 1; i++) {
            const spreadAngle = angle + i * 0.18;
            this.projectiles.push({
              id: `proj-${Date.now()}-${i}`,
              ownerId: this.player.id,
              x: this.player.x,
              y: this.player.y,
              vx: Math.cos(spreadAngle) * 14,
              vy: Math.sin(spreadAngle) * 14,
              radius: 6,
              damage: Math.round(this.getEffectiveAttack() * (ability.damageMultiplier || 1.4) * weatherSpellMultiplier),
              isCrit: Math.random() < this.getEffectiveCrit(),
              color: ability.effectColor,
              rangeRemaining: ability.range,
              effectType: 'arrow',
            });
          }
        } else {
          // Single heavy projectile (Fireball / Hammer)
          this.projectiles.push({
            id: `proj-${Date.now()}`,
            ownerId: this.player.id,
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(angle) * 12,
            vy: Math.sin(angle) * 12,
            radius: 10,
            damage: Math.round(this.getEffectiveAttack() * (ability.damageMultiplier || 1.8) * weatherSpellMultiplier),
            isCrit: Math.random() < this.getEffectiveCrit(),
            color: ability.effectColor,
            rangeRemaining: ability.range,
            aoeRadius: ability.aoeRadius,
            effectType: 'fire',
          });
        }
      } else {
        // Melee frontal cleave / strike
        const cleaveRange = ability.range;
        const cleaveAngleSpan = Math.PI * 0.65;
        this.createMeleeSlashArc(this.player.x, this.player.y, angle, cleaveRange, ability.effectColor);

        this.entities.forEach((ent) => {
          if (ent.id === this.player.id || ent.isDead || ent.type === 'npc') return;
          const dist = Math.hypot(ent.x - this.player.x, ent.y - this.player.y);
          if (dist <= cleaveRange + ent.radius) {
            const angleToTarget = Math.atan2(ent.y - this.player.y, ent.x - this.player.x);
            let diff = Math.abs(angle - angleToTarget);
            while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
            if (diff <= cleaveAngleSpan / 2) {
              const dmg = Math.round(this.getEffectiveAttack() * (ability.damageMultiplier || 1.6) * weatherSpellMultiplier);
              this.damageEntity(ent, dmg, Math.random() < this.getEffectiveCrit(), this.player);
            }
          }
        });
      }
    }
  }

  public triggerBasicAttack() {
    if (this.player.isDead || this.isCasting) return;
    const isRanged = this.player.classType === 'mage' || this.player.classType === 'ranger';
    const angle = Math.atan2(this.mouseWorldY - this.player.y, this.mouseWorldX - this.player.x);

    if (isRanged) {
      sound.playAttack(this.player.classType === 'mage' ? 'fire' : 'arrow');
      this.createSparks(this.player.x, this.player.y, this.player.color, 6, angle, 0.4, 2, 6);
      this.createDustPuff(this.player.x, this.player.y, 2);

      this.projectiles.push({
        id: `proj-basic-${Date.now()}`,
        ownerId: this.player.id,
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * 13,
        vy: Math.sin(angle) * 13,
        radius: 6,
        damage: this.getEffectiveAttack(),
        isCrit: Math.random() < this.getEffectiveCrit(),
        color: this.player.color,
        rangeRemaining: 450,
        effectType: this.player.classType === 'mage' ? 'arcane' : 'arrow',
      });
    } else {
      sound.playAttack('slash');
      this.createMeleeSlashArc(this.player.x, this.player.y, angle, 95, this.player.color);

      this.entities.forEach((ent) => {
        if (ent.id === this.player.id || ent.isDead || ent.type === 'npc') return;
        const dist = Math.hypot(ent.x - this.player.x, ent.y - this.player.y);
        if (dist <= 95 + ent.radius) {
          const angleToTarget = Math.atan2(ent.y - this.player.y, ent.x - this.player.x);
          let diff = Math.abs(angle - angleToTarget);
          while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
          if (diff <= Math.PI * 0.4) {
            this.damageEntity(ent, this.getEffectiveAttack(), Math.random() < this.getEffectiveCrit(), this.player);
          }
        }
      });
    }
  }

  public getEffectiveAttack(): number {
    const classDef = CLASS_DEFINITIONS[this.player.classType || 'warrior'];
    let val = classDef.baseAttack + this.playerStats.strength * 2.2 + this.playerStats.intelligence * 2.0;
    if (this.player.equipped) {
      Object.values(this.player.equipped).forEach((item) => {
        if (item?.stats.attack) val += item.stats.attack;
      });
    }
    return Math.round(val);
  }

  public getEffectiveCrit(): number {
    const classDef = CLASS_DEFINITIONS[this.player.classType || 'warrior'];
    let crit = classDef.baseCrit + this.playerStats.agility * 0.007;
    if (this.player.equipped) {
      Object.values(this.player.equipped).forEach((item) => {
        if (item?.stats.critChance) crit += item.stats.critChance;
      });
    }
    // Sunny weather grants +5% radiant precision crit bonus
    const weatherCritBonus = this.weather.current === 'sunny' ? 0.05 : 0;
    return Math.min(0.75, crit + weatherCritBonus);
  }

  public damageEntity(target: Entity, baseDamage: number, isCrit: boolean, attacker: Entity) {
    if (target.isDead) return;

    let finalDamage = baseDamage;
    if (isCrit) finalDamage = Math.round(finalDamage * 1.85);

    // Apply some slight randomness
    finalDamage = Math.max(1, Math.round(finalDamage * (0.9 + Math.random() * 0.2)));

    // Snow weather grants player +15% armor reduction on incoming damage
    if (target.id === this.player.id && this.weather.current === 'snow') {
      finalDamage = Math.max(1, Math.round(finalDamage * 0.85));
    }

    target.hp = Math.max(0, target.hp - finalDamage);
    target.lastHitCrit = isCrit;
    target.lastAttackerId = attacker.id;
    sound.playHit(isCrit);

    // Dynamic Combat Impact Particles (sparks, target-color burst, dust, and crit stars)
    this.createHitImpactEffects(target.x, target.y, isCrit, target.color, attacker);

    // Target aggro transfer
    if (target.type === 'monster' || target.type === 'boss') {
      target.targetId = attacker.id;
      target.aiState = 'chase';
    }

    if (target.hp <= 0 && !target.isDead) {
      this.handleEntityDeath(target, attacker);
    }
  }

  private handleEntityDeath(deadEntity: Entity, killer: Entity) {
    deadEntity.isDead = true;
    deadEntity.hp = 0;

    // Death explosion FX
    if (deadEntity.isBoss) {
      this.createImpactShockwave(deadEntity.x, deadEntity.y, deadEntity.color, 15, 140, 5);
      this.createImpactShockwave(deadEntity.x, deadEntity.y, '#fbbf24', 25, 180, 4);
      this.createSparks(deadEntity.x, deadEntity.y, deadEntity.color, 35, undefined, Math.PI * 2, 4, 11);
      this.createSparks(deadEntity.x, deadEntity.y, '#fbbf24', 25, undefined, Math.PI * 2, 3, 9, 'spark');
      this.createDustPuff(deadEntity.x, deadEntity.y, 14);

      // Boss death starbursts
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const spd = 3 + Math.random() * 3;
        this.particles.push({
          x: deadEntity.x,
          y: deadEntity.y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: 5 + Math.random() * 4,
          color: '#fbbf24',
          innerColor: '#ffffff',
          alpha: 1.0,
          decay: 0.025,
          shape: 'star',
          rotation: Math.random() * Math.PI,
          rotationSpeed: 0.15,
          blendMode: 'lighter',
          drag: 0.96,
        });
      }
    } else {
      this.createImpactShockwave(deadEntity.x, deadEntity.y, deadEntity.color, 8, 45, 2.5);
      this.createSparks(deadEntity.x, deadEntity.y, deadEntity.color, 16, undefined, Math.PI * 2, 2.5, 7);
      this.createDustPuff(deadEntity.x, deadEntity.y, 6);
    }

    if (deadEntity.isBoss) {
      this.addChatMessage('World', 'world', `💀 [BOSS SLAIN] ${deadEntity.name} has been vanquished by ${killer.name}!`, '#fbbf24');
    }

    if (killer.id === this.player.id) {
      this.killsCount += 1;
      this.player.kills = (this.player.kills || 0) + 1;
      this.player.score = (this.player.score || 0) + (deadEntity.level * 50);

      const expGain = deadEntity.expReward || deadEntity.level * 40;
      const goldGain = deadEntity.goldReward || deadEntity.level * 20;

      this.gainExp(expGain);
      this.addFloatingText(deadEntity.x, deadEntity.y - 40, `+${expGain} XP`, '#38bdf8', 16);

      // Quest tracking update
      this.checkQuestsOnKill(deadEntity);

      // Roll for Loot drops (items & gold coin piles)
      this.dropLoot(deadEntity.x, deadEntity.y, deadEntity.level, deadEntity.isBoss, goldGain);
    } else if (deadEntity.id === this.player.id) {
      this.deathCount += 1;
      this.addChatMessage('Combat', 'combat', `You were defeated by ${killer.name}!`, '#ef4444');
    }
  }

  public respawnPlayer() {
    this.player.isDead = false;
    this.player.x = 2500;
    this.player.y = 2500;
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;
    this.player.statusEffects = [];
    this.addFloatingText(2500, 2460, 'Revived at Sanctuary!', '#38bdf8');
    sound.playLevelUp();
  }

  private dropLoot(x: number, y: number, level: number, isBoss?: boolean, goldAmount?: number) {
    // Drop gold coin pile
    if (goldAmount && goldAmount > 0) {
      const offsetX = (Math.random() - 0.5) * 32;
      const offsetY = (Math.random() - 0.5) * 32;
      this.lootDrops.push({
        id: `gold-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        x: x + offsetX,
        y: y + offsetY,
        gold: goldAmount,
        rarity: 'common',
        createdAt: performance.now(),
        duration: 60000,
        color: '#fbbf24',
      });
    }

    const rollCount = isBoss ? 3 : 1;
    for (let i = 0; i < rollCount; i++) {
      const offsetX = (Math.random() - 0.5) * 50;
      const offsetY = (Math.random() - 0.5) * 50;
      const forceRarity = isBoss ? (Math.random() > 0.4 ? 'legendary' : 'epic') : undefined;
      const item = generateLootItem(level, forceRarity);

      this.lootDrops.push({
        id: `loot-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        x: x + offsetX,
        y: y + offsetY,
        item,
        rarity: item.rarity,
        createdAt: performance.now(),
        duration: 60000,
        color: item.glowColor || '#fbbf24',
      });
    }
  }

  public pickupLoot(loot: LootDrop) {
    // 1. Gold Pickup
    if (loot.gold && loot.gold > 0) {
      this.gold += loot.gold;
      sound.playLootPickup('common');
      this.addFloatingText(loot.x, loot.y - 20, `+${loot.gold} Gold`, '#fbbf24', 15);
      this.addChatMessage('System', 'system', `Collected ${loot.gold} Gold!`, '#fbbf24');
      this.createSparks(loot.x, loot.y, '#fbbf24', 10, undefined, Math.PI * 2, 2, 5, 'spark');
      this.lootDrops = this.lootDrops.filter((l) => l.id !== loot.id);
      return;
    }

    // 2. Equipment / Item Pickup
    if (!loot.item) return;
    const freeIndex = this.inventory.findIndex((s) => s === null);
    if (freeIndex === -1) {
      this.addFloatingText(this.player.x, this.player.y - 30, 'Inventory Full!', '#ef4444');
      return;
    }

    this.inventory[freeIndex] = loot.item;
    sound.playLootPickup(loot.rarity);
    this.addChatMessage('System', 'system', `Looted [${loot.item.name}]!`, loot.color);
    this.addFloatingText(loot.x, loot.y - 20, `+ ${loot.item.name}`, loot.color, 15);
    this.createSparks(loot.x, loot.y, loot.color, 12, undefined, Math.PI * 2, 2, 6, 'spark');

    // Remove from drops list
    this.lootDrops = this.lootDrops.filter((l) => l.id !== loot.id);
  }

  public gainExp(amount: number) {
    this.exp += amount;
    if (this.exp >= this.nextLevelExp) {
      this.levelUp();
    }
  }

  private levelUp() {
    this.exp -= this.nextLevelExp;
    this.player.level += 1;
    this.nextLevelExp = Math.round(this.nextLevelExp * 1.55);
    this.playerStats.unspentPoints += 3;
    this.recalculatePlayerStats();
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;

    sound.playLevelUp();
    this.createImpactShockwave(this.player.x, this.player.y, '#fbbf24', 10, 90, 4);
    this.createImpactShockwave(this.player.x, this.player.y, '#f59e0b', 20, 140, 3);
    this.createSparks(this.player.x, this.player.y, '#fde047', 40, undefined, Math.PI * 2, 3, 9, 'spark');

    // Golden celebration stars
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 2 + Math.random() * 3.5;
      this.particles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 4.5 + Math.random() * 3,
        color: '#fbbf24',
        innerColor: '#ffffff',
        alpha: 1.0,
        decay: 0.02,
        shape: 'star',
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.1,
        blendMode: 'lighter',
        drag: 0.95,
      });
    }

    this.addFloatingText(this.player.x, this.player.y - 50, `LEVEL UP! Lv. ${this.player.level}`, '#fbbf24', 24, true);
    this.addChatMessage('World', 'world', `🎉 ${this.player.name} reached Level ${this.player.level}!`, '#fbbf24');
  }

  private checkQuestsOnKill(killed: Entity) {
    this.quests.forEach((q) => {
      if (q.isCompleted) return;
      if (q.type === 'kill' && (killed.name.includes(q.targetName.split('/')[0].trim()) || killed.type === 'monster')) {
        q.currentCount += 1;
        if (q.currentCount >= q.targetCount) {
          q.isCompleted = true;
          this.addChatMessage('System', 'system', `Quest Complete: "${q.title}"! Open Quests to claim reward.`, '#22c55e');
          sound.playLevelUp();
        }
      } else if (q.type === 'boss' && killed.name === q.targetName) {
        q.currentCount = 1;
        q.isCompleted = true;
        this.addChatMessage('System', 'system', `Quest Complete: "${q.title}"! Open Quests to claim reward.`, '#22c55e');
        sound.playLevelUp();
      }
    });
  }

  public claimQuestReward(questId: string) {
    const quest = this.quests.find((q) => q.id === questId);
    if (!quest || !quest.isCompleted || quest.isClaimed) return;

    quest.isClaimed = true;
    this.gainExp(quest.rewardExp);
    this.gold += quest.rewardGold;

    if (quest.rewardItem) {
      const freeIdx = this.inventory.findIndex((s) => s === null);
      if (freeIdx !== -1) {
        this.inventory[freeIdx] = quest.rewardItem;
        this.addChatMessage('System', 'system', `Received ${quest.rewardItem.name}!`, quest.rewardItem.glowColor);
      }
    }
    sound.playLootPickup('legendary');
    this.addFloatingText(this.player.x, this.player.y - 30, `Claimed: +${quest.rewardExp} XP, +${quest.rewardGold} Gold`, '#22c55e');
  }

  // Visual Helper Utilities
  public createSparks(
    x: number,
    y: number,
    color: string,
    count: number = 8,
    baseAngle?: number,
    spread: number = Math.PI * 2,
    speedMin: number = 2,
    speedMax: number = 7,
    shape: 'spark' | 'circle' = 'spark'
  ) {
    for (let i = 0; i < count; i++) {
      const angle = baseAngle !== undefined ? baseAngle + (Math.random() - 0.5) * spread : Math.random() * Math.PI * 2;
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2.5,
        color,
        innerColor: '#ffffff',
        alpha: 1.0,
        decay: 0.035 + Math.random() * 0.035,
        shape,
        blendMode: 'lighter',
        drag: 0.92,
        gravity: 0.08,
      });
    }
  }

  public createDustPuff(x: number, y: number, count: number = 5, color: string = 'rgba(180, 160, 140, 0.45)') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.6;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.2,
        radius: 4 + Math.random() * 5,
        color,
        alpha: 0.5 + Math.random() * 0.3,
        decay: 0.025 + Math.random() * 0.02,
        shape: 'dust',
        scaleRate: 1.04,
        drag: 0.94,
      });
    }
  }

  public createImpactShockwave(
    x: number,
    y: number,
    color: string,
    initialRadius: number = 6,
    maxRadius: number = 40,
    strokeWidth: number = 3
  ) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: initialRadius,
      maxRadius,
      color,
      alpha: 0.9,
      decay: 0.05,
      shape: 'ring',
      scaleRate: 1.18,
      strokeWidth,
      blendMode: 'lighter',
    });
  }

  public createCastChargeParticles(x: number, y: number, color: string, count: number = 2) {
    for (let i = 0; i < count; i++) {
      const spawnAngle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 25;
      const px = x + Math.cos(spawnAngle) * dist;
      const py = y + Math.sin(spawnAngle) * dist;
      const toCenterX = x - px;
      const toCenterY = y - py;
      const mag = Math.hypot(toCenterX, toCenterY) || 1;
      const speed = 2.5 + Math.random() * 2;

      this.particles.push({
        x: px,
        y: py,
        vx: (toCenterX / mag) * speed + (Math.random() - 0.5) * 0.8,
        vy: (toCenterY / mag) * speed + (Math.random() - 0.5) * 0.8,
        radius: 2.5 + Math.random() * 2,
        color,
        innerColor: '#ffffff',
        alpha: 0.85,
        decay: 0.04,
        shape: 'glow',
        blendMode: 'lighter',
        drag: 0.96,
      });
    }
  }

  public createHitImpactEffects(
    x: number,
    y: number,
    isCrit: boolean,
    targetColor: string,
    attacker?: Entity
  ) {
    // Directional spark burst away from attacker
    let attackAngle = Math.random() * Math.PI * 2;
    if (attacker) {
      attackAngle = Math.atan2(y - attacker.y, x - attacker.x);
    }

    const sparkColor = isCrit ? '#fbbf24' : '#f8fafc';
    this.createSparks(x, y, sparkColor, isCrit ? 16 : 8, attackAngle, isCrit ? Math.PI : Math.PI * 0.65, 3, isCrit ? 9 : 6);
    this.createSparks(x, y, targetColor, isCrit ? 10 : 5, undefined, Math.PI * 2, 1.5, 4.5, 'circle');
    this.createDustPuff(x, y, isCrit ? 5 : 2);

    if (isCrit) {
      this.createImpactShockwave(x, y, '#fbbf24', 8, 48, 3.5);
      // Glittering crit stars
      for (let i = 0; i < 4; i++) {
        const starAngle = Math.random() * Math.PI * 2;
        const starSpeed = 1.5 + Math.random() * 3.5;
        this.particles.push({
          x,
          y,
          vx: Math.cos(starAngle) * starSpeed,
          vy: Math.sin(starAngle) * starSpeed,
          radius: 4 + Math.random() * 3,
          color: '#fde047',
          innerColor: '#ffffff',
          alpha: 1.0,
          decay: 0.03,
          shape: 'star',
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          blendMode: 'lighter',
          drag: 0.94,
        });
      }
    }
  }

  private createBurstParticles(x: number, y: number, color: string, count: number = 10) {
    this.createSparks(x, y, color, count, undefined, Math.PI * 2, 1.5, 5.5);
  }

  private createMeleeSlashArc(x: number, y: number, angle: number, range: number, color: string) {
    // 1. Curved slash blade trail
    for (let i = -7; i <= 7; i++) {
      const a = angle + i * 0.07;
      const dist = range * (0.85 + Math.random() * 0.15);
      this.particles.push({
        x: x + Math.cos(a) * dist,
        y: y + Math.sin(a) * dist,
        vx: Math.cos(a) * 1.8,
        vy: Math.sin(a) * 1.8,
        radius: 3.5,
        color,
        innerColor: '#ffffff',
        alpha: 0.95,
        decay: 0.08,
        shape: 'glow',
        blendMode: 'lighter',
      });
    }

    // 2. Flying weapon swing sparks thrown forward
    this.createSparks(
      x + Math.cos(angle) * (range * 0.6),
      y + Math.sin(angle) * (range * 0.6),
      color,
      8,
      angle,
      Math.PI * 0.45,
      3,
      7
    );

    // 3. Foot dust kick-up
    this.createDustPuff(x, y, 4);
  }

  public addFloatingText(
    x: number,
    y: number,
    text: string,
    color: string = '#ffffff',
    size: number = 16,
    isCrit: boolean = false,
    vx: number = (Math.random() - 0.5) * 0.8,
    vy: number = -1.8,
    type: FloatingText['type'] = 'damage'
  ) {
    this.floatingTexts.push({
      id: `float-${Date.now()}-${Math.random()}`,
      x,
      y,
      text,
      color,
      size,
      opacity: 1.0,
      vx,
      vy: isCrit ? vy * 1.3 : vy,
      lifetime: 1.3,
      createdAt: performance.now(),
      isCrit,
      type,
    });
  }

  // Main Loop Tick
  public update(dt: number) {
    const now = performance.now();

    // 0. Weather Cycle Tick
    this.weather.timer += dt;
    if (this.weather.lightningAlpha > 0) {
      this.weather.lightningAlpha = Math.max(0, this.weather.lightningAlpha - dt * 2.8);
      if (this.weather.lightningAlpha === 0) {
        this.weather.lightningActive = false;
      }
    }

    if (this.weather.current === 'rain') {
      this.weather.lightningTimer += dt;
      if (this.weather.lightningTimer >= 9.0) {
        this.weather.lightningTimer = 0;
        if (Math.random() < 0.7) {
          this.weather.lightningActive = true;
          this.weather.lightningAlpha = 0.85;
          sound.playThunder();

          // Lightning ground strike effects
          const lx = this.player.x + (Math.random() - 0.5) * 500;
          const ly = this.player.y + (Math.random() - 0.5) * 500;
          this.createImpactShockwave(lx, ly, '#38bdf8', 8, 45, 2.5);
          this.createSparks(lx, ly, '#38bdf8', 16, undefined, Math.PI * 2, 2.5, 7, 'spark');
        }
      }
    }

    if (this.weather.timer >= this.weather.duration) {
      const nextIndex = (WEATHER_CYCLE_ORDER.indexOf(this.weather.current) + 1) % WEATHER_CYCLE_ORDER.length;
      this.setWeather(WEATHER_CYCLE_ORDER[nextIndex]);
    }

    // 1. Ability & Dash cooldown ticks
    this.abilities.forEach((ab) => {
      if (ab.currentCooldown > 0) {
        ab.currentCooldown = Math.max(0, ab.currentCooldown - dt);
      }
    });
    if (this.dashCooldown > 0) {
      this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    }
    if (this.dashDurationRemaining > 0) {
      this.dashDurationRemaining -= dt;
      if (this.dashDurationRemaining <= 0) {
        this.isDashing = false;
      }
    }

    // 2. Casting progress tick
    if (this.isCasting && this.currentCast) {
      this.currentCast.progress += dt;
      // Emit converging charge particles around the player while channeling
      if (Math.random() < 0.6) {
        this.createCastChargeParticles(this.player.x, this.player.y, this.currentCast.ability.effectColor, 2);
      }
      if (this.currentCast.progress >= this.currentCast.duration) {
        this.isCasting = false;
        this.executeAbility(this.currentCast.ability);
        this.currentCast = null;
      }
    }

    // 3. Player Movement & Input handling
    if (!this.player.isDead) {
      let moveX = 0;
      let moveY = 0;
      if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

      if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
      }

      // Weather speed modifiers
      let weatherSpeedMult = 1.0;
      if (this.weather.current === 'sunny') {
        weatherSpeedMult = 1.10;
      } else if (this.weather.current === 'rain') {
        // Off-road rain mud slows down by 10%
        const inSanctuary = this.player.x >= 2300 && this.player.x <= 2700 && this.player.y >= 2300 && this.player.y <= 2700;
        const onNorthSouthRoad = Math.abs(this.player.x - 2500) <= 65;
        const onWestEastRoad = Math.abs(this.player.y - 2500) <= 65;
        weatherSpeedMult = (inSanctuary || onNorthSouthRoad || onWestEastRoad) ? 1.0 : 0.90;
      }

      const currentSpeed = (this.isDashing ? this.player.speed * 2.6 : this.player.speed) * weatherSpeedMult;
      this.player.vx = moveX * currentSpeed;
      this.player.vy = moveY * currentSpeed;

      this.player.x = Math.max(50, Math.min(WORLD_WIDTH - 50, this.player.x + this.player.vx));
      this.player.y = Math.max(50, Math.min(WORLD_HEIGHT - 50, this.player.y + this.player.vy));

      // Update player facing angle towards mouse
      this.player.angle = Math.atan2(this.mouseWorldY - this.player.y, this.mouseWorldX - this.player.x);

      // Auto-loot nearby items & gold (within 40 units) when enabled in settings
      if (this.autoLoot) {
        this.lootDrops.forEach((loot) => {
          const dist = Math.hypot(loot.x - this.player.x, loot.y - this.player.y);
          if (dist <= this.player.radius + 35) {
            this.pickupLoot(loot);
          }
        });
      }
    }

    // 4. Update Camera to smoothly follow player
    this.cameraX += (this.player.x - this.cameraX) * 0.12;
    this.cameraY += (this.player.y - this.cameraY) * 0.12;

    // 5. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rangeRemaining -= Math.hypot(p.vx, p.vy);

      // Spawn projectile trailing particles
      if (this.particles.length < 450) {
        const trailColor = p.color || '#38bdf8';
        this.particles.push({
          x: p.x - p.vx * 0.4 + (Math.random() - 0.5) * 4,
          y: p.y - p.vy * 0.4 + (Math.random() - 0.5) * 4,
          vx: -p.vx * 0.15 + (Math.random() - 0.5) * 0.5,
          vy: -p.vy * 0.15 + (Math.random() - 0.5) * 0.5,
          radius: p.radius * 0.65,
          color: trailColor,
          innerColor: '#ffffff',
          alpha: 0.75,
          decay: 0.09,
          shape: p.effectType === 'arrow' ? 'spark' : 'glow',
          blendMode: 'lighter',
          drag: 0.9,
        });
      }

      // Check collision with entities
      let hit = false;
      this.entities.forEach((target) => {
        if (hit || target.isDead || target.id === p.ownerId || target.type === 'npc') return;
        const dist = Math.hypot(target.x - p.x, target.y - p.y);
        if (dist <= target.radius + p.radius) {
          hit = true;
          const owner = p.ownerId === this.player.id ? this.player : this.entities.get(p.ownerId) || this.player;
          this.damageEntity(target, p.damage, p.isCrit, owner);

          // Projectile impact effects
          if (p.aoeRadius) {
            this.createImpactShockwave(p.x, p.y, p.color, 10, p.aoeRadius, 3);
            this.createSparks(p.x, p.y, p.color, 18, undefined, Math.PI * 2, 3, 8);
            this.createDustPuff(p.x, p.y, 6);
          } else {
            this.createSparks(p.x, p.y, p.color, 8, Math.atan2(p.vy, p.vx), Math.PI * 0.8, 2, 6);
          }
        }
      });

      if (hit || p.rangeRemaining <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // 6. Update Ground Telegraphs (Boss AOEs & Player Spells)
    for (let i = this.groundTelegraphs.length - 1; i >= 0; i--) {
      const g = this.groundTelegraphs[i];
      g.elapsed += dt;

      if (g.elapsed >= g.duration) {
        // Detonate!
        sound.playSpellCast('meteor');
        this.createImpactShockwave(g.x, g.y, g.color, 12, g.radius * 1.1, 4);
        this.createSparks(g.x, g.y, g.color, 32, undefined, Math.PI * 2, 3.5, 9);
        this.createDustPuff(g.x, g.y, 10);

        // Damage all in radius
        const owner = g.ownerId === this.player.id ? this.player : this.entities.get(g.ownerId) || this.player;
        this.entities.forEach((target) => {
          if (target.isDead || target.type === 'npc') return;
          if (g.ownerId !== this.player.id && target.id !== this.player.id && target.type === 'monster') return;
          const dist = Math.hypot(target.x - g.x, target.y - g.y);
          if (dist <= g.radius + target.radius) {
            this.damageEntity(target, g.damage, false, owner);
          }
        });
        if (g.ownerId !== this.player.id && !this.player.isDead) {
          const dist = Math.hypot(this.player.x - g.x, this.player.y - g.y);
          if (dist <= g.radius + this.player.radius) {
            this.damageEntity(this.player, g.damage, false, owner);
          }
        }

        this.groundTelegraphs.splice(i, 1);
      }
    }

    // 7. Update Particles with Physics (drag, gravity, scaling, rotation, alpha)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.x += part.vx;
      part.y += part.vy;

      if (part.drag) {
        part.vx *= part.drag;
        part.vy *= part.drag;
      }
      if (part.gravity) {
        part.vy += part.gravity;
      }
      if (part.scaleRate) {
        part.radius *= part.scaleRate;
        if (part.maxRadius && part.radius > part.maxRadius) {
          part.radius = part.maxRadius;
        }
      }
      if (part.rotationSpeed) {
        part.rotation = (part.rotation || 0) + part.rotationSpeed;
      }

      part.alpha -= part.decay;
      if (part.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Cap particles array to prevent performance degradation
    if (this.particles.length > 500) {
      this.particles.splice(0, this.particles.length - 500);
    }

    // 8. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const f = this.floatingTexts[i];
      f.x += f.vx || 0;
      f.y += f.vy;
      f.vy *= 0.94; // Gentle upward deceleration
      if (f.vx) f.vx *= 0.95;
      f.opacity -= dt * 0.75;
      if (f.opacity <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 9. Update Entities & Bot AI
    this.updateEntitiesAI(dt, now);

    // 10. Natural Health/Mana Regen & Shrine Buff checks
    this.regenTimer += dt;
    if (this.regenTimer >= 1.0) {
      this.regenTimer = 0;
      if (!this.player.isDead) {
        const zone = getZoneAt(this.player.x, this.player.y);
        const inSanctuary = zone.id === 'sanctuary';
        let hpRegen = inSanctuary ? Math.round(this.player.maxHp * 0.12) : 3;
        let mpRegen = inSanctuary ? Math.round(this.player.maxMp * 0.15) : 5;

        // Sunny weather +25% HP regen, Rain weather +35% MP regen
        if (this.weather.current === 'sunny') {
          hpRegen = Math.max(1, Math.round(hpRegen * 1.25));
        } else if (this.weather.current === 'rain') {
          mpRegen = Math.max(1, Math.round(mpRegen * 1.35));
        }

        this.player.hp = Math.min(this.player.maxHp, this.player.hp + hpRegen);
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRegen);
      }
    }

    // 11. Bot simulated world chat & mob respawns
    this.botChatTimer += dt;
    if (this.botChatTimer >= 14.0) {
      this.botChatTimer = 0;
      const randomBot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      const phrase = BOT_CHAT_PHRASES[Math.floor(Math.random() * BOT_CHAT_PHRASES.length)];
      this.addChatMessage(randomBot, 'world', phrase);
    }

    this.mobRespawnTimer += dt;
    if (this.mobRespawnTimer >= 20.0) {
      this.mobRespawnTimer = 0;
      this.respawnDeadMonsters();
    }
  }

  private updateEntitiesAI(dt: number, now: number) {
    this.entities.forEach((entity) => {
      if (entity.isDead || entity.type === 'npc' || entity.type === 'dummy') return;

      // Status effect duration countdown
      if (entity.statusEffects) {
        for (let s = entity.statusEffects.length - 1; s >= 0; s--) {
          entity.statusEffects[s].remaining -= dt;
          if (entity.statusEffects[s].remaining <= 0) {
            entity.statusEffects.splice(s, 1);
          }
        }
      }

      // Say bubble timer
      if (entity.sayBubble) {
        entity.sayBubble.time -= dt;
        if (entity.sayBubble.time <= 0) entity.sayBubble = null;
      }

      // Boss AI Attacks & Telegraphs
      if (entity.isBoss) {
        this.updateBossAI(entity, dt, now);
        return;
      }

      // Bot Player AI
      if (entity.type === 'bot') {
        this.updateBotAI(entity, dt, now);
        return;
      }

      // Standard Monster AI
      if (entity.type === 'monster') {
        this.updateMonsterAI(entity, dt, now);
      }
    });
  }

  private updateMonsterAI(mob: Entity, dt: number, now: number) {
    // Find closest player or bot to attack
    let target = this.player.isDead ? null : this.player;
    let minDist = target ? Math.hypot(target.x - mob.x, target.y - mob.y) : 9999;

    // Also consider bots as targets
    this.entities.forEach((other) => {
      if (other.type === 'bot' && !other.isDead) {
        const d = Math.hypot(other.x - mob.x, other.y - mob.y);
        if (d < minDist) {
          minDist = d;
          target = other;
        }
      }
    });

    if (target && minDist <= (mob.aggroRadius || 250)) {
      mob.angle = Math.atan2(target.y - mob.y, target.x - mob.x);
      if (minDist > (mob.attackRange || 70)) {
        mob.x += Math.cos(mob.angle) * mob.speed;
        mob.y += Math.sin(mob.angle) * mob.speed;
      } else {
        // Attack target
        if (now - (mob.lastAttackTime || 0) >= (mob.attackCooldown || 1.5) * 1000) {
          mob.lastAttackTime = now;
          const dmg = Math.round(15 + mob.level * 6);
          this.damageEntity(target, dmg, false, mob);
        }
      }
    } else {
      // Roam back to spawn
      if (mob.spawnX && mob.spawnY) {
        const distToSpawn = Math.hypot(mob.spawnX - mob.x, mob.spawnY - mob.y);
        if (distToSpawn > 150) {
          mob.angle = Math.atan2(mob.spawnY - mob.y, mob.spawnX - mob.x);
          mob.x += Math.cos(mob.angle) * (mob.speed * 0.6);
          mob.y += Math.sin(mob.angle) * (mob.speed * 0.6);
        }
      }
    }
  }

  private updateBossAI(boss: Entity, dt: number, now: number) {
    // Aggro target
    let target: Entity | null = !this.player.isDead ? this.player : null;
    let minDist = target ? Math.hypot(target.x - boss.x, target.y - boss.y) : 9999;

    this.entities.forEach((ent) => {
      if ((ent.type === 'bot' || ent.type === 'player') && !ent.isDead) {
        const d = Math.hypot(ent.x - boss.x, ent.y - boss.y);
        if (d < minDist) {
          minDist = d;
          target = ent;
        }
      }
    });

    if (!target) return;

    boss.angle = Math.atan2(target.y - boss.y, target.x - boss.x);

    // Chase target
    if (minDist > 140) {
      boss.x += Math.cos(boss.angle) * boss.speed;
      boss.y += Math.sin(boss.angle) * boss.speed;
    }

    // Cast Boss Special Telegraph Attacks every 4-5s
    if (now - (boss.lastAttackTime || 0) >= (boss.attackCooldown || 2.5) * 1000) {
      boss.lastAttackTime = now;
      sound.playBossRoar();

      if (boss.id === 'boss-inferno') {
        // Calamity Dragon Meteor / Fire Ring
        this.groundTelegraphs.push({
          id: `boss-tel-${now}`,
          ownerId: boss.id,
          x: target.x,
          y: target.y,
          radius: 200,
          shape: 'circle',
          duration: 1.2,
          elapsed: 0,
          damage: 180 + boss.level * 10,
          color: '#ef4444',
          effectName: 'Dragon Hellfire',
        });
      } else if (boss.id === 'boss-crypt') {
        // Lich Death Ring
        this.groundTelegraphs.push({
          id: `boss-tel-${now}`,
          ownerId: boss.id,
          x: target.x,
          y: target.y,
          radius: 170,
          shape: 'circle',
          duration: 1.0,
          elapsed: 0,
          damage: 130 + boss.level * 8,
          color: '#a855f7',
          effectName: 'Death Nova',
        });
      } else {
        // Forest Mossbeast Ground Slam
        this.groundTelegraphs.push({
          id: `boss-tel-${now}`,
          ownerId: boss.id,
          x: boss.x,
          y: boss.y,
          radius: 220,
          shape: 'circle',
          duration: 1.1,
          elapsed: 0,
          damage: 90 + boss.level * 6,
          color: '#22c55e',
          effectName: 'Earthquake Slam',
        });
      }
    }
  }

  private updateBotAI(bot: Entity, dt: number, now: number) {
    // Find nearby monster to attack
    let targetMob: Entity | null = null;
    let minDist = 9999;

    this.entities.forEach((m) => {
      if ((m.type === 'monster' || m.type === 'boss') && !m.isDead) {
        const d = Math.hypot(m.x - bot.x, m.y - bot.y);
        if (d < minDist && d <= (bot.aggroRadius || 280)) {
          minDist = d;
          targetMob = m;
        }
      }
    });

    if (targetMob) {
      bot.angle = Math.atan2(targetMob.y - bot.y, targetMob.x - bot.x);
      if (minDist > (bot.attackRange || 80)) {
        bot.x += Math.cos(bot.angle) * bot.speed;
        bot.y += Math.sin(bot.angle) * bot.speed;
      } else {
        // Bot attack
        if (now - (bot.lastAttackTime || 0) >= (bot.attackCooldown || 1.2) * 1000) {
          bot.lastAttackTime = now;
          const dmg = Math.round(20 + bot.level * 5);
          this.damageEntity(targetMob, dmg, Math.random() < 0.15, bot);
        }
      }
    } else {
      // Roam around slightly
      if (!bot.roamTargetX || Math.hypot(bot.roamTargetX - bot.x, (bot.roamTargetY || 0) - bot.y) < 40) {
        bot.roamTargetX = Math.max(200, Math.min(WORLD_WIDTH - 200, bot.x + (Math.random() - 0.5) * 400));
        bot.roamTargetY = Math.max(200, Math.min(WORLD_HEIGHT - 200, bot.y + (Math.random() - 0.5) * 400));
      }
      bot.angle = Math.atan2((bot.roamTargetY || 0) - bot.y, bot.roamTargetX - bot.x);
      bot.x += Math.cos(bot.angle) * (bot.speed * 0.5);
      bot.y += Math.sin(bot.angle) * (bot.speed * 0.5);
    }
  }

  private respawnDeadMonsters() {
    this.entities.forEach((entity) => {
      if (entity.isDead && (entity.type === 'monster' || entity.type === 'boss' || entity.type === 'bot')) {
        entity.isDead = false;
        entity.hp = entity.maxHp;
        entity.x = entity.spawnX || entity.x;
        entity.y = entity.spawnY || entity.y;
        this.addFloatingText(entity.x, entity.y - 20, 'Respawned', '#38bdf8', 12);
      }
    });
  }
}
