import React, { useEffect, useState, useRef } from 'react';
import { GameEngine } from '../../engine/gameEngine';
import { Entity } from '../../types/game';
import { sound } from '../../engine/soundEngine';
import { Skull, Flame, ShieldAlert, Crosshair, Navigation, AlertTriangle, Sparkles, CheckCircle2, Swords } from 'lucide-react';

interface BossEncounterFrameProps {
  engine: GameEngine;
  onTargetBoss: (boss: Entity) => void;
  onClearTarget: () => void;
}

interface BossConfig {
  icon: string;
  zone: string;
  element: string;
  accentColor: string;
  borderColor: string;
  gradient: string;
  barGradient: string;
  glowColor: string;
  mechanics: string[];
}

const BOSS_CONFIGS: Record<string, BossConfig> = {
  'boss-forest': {
    icon: '🌳',
    zone: 'Whispering Woods',
    element: 'Ancient Earth & Flora',
    accentColor: '#4ade80',
    borderColor: 'border-emerald-500/50',
    gradient: 'from-emerald-950/95 via-stone-950/95 to-emerald-950/95',
    barGradient: 'from-emerald-600 via-green-500 to-lime-400',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    mechanics: ['Earthquake Slam (AoE)', 'Thorn Spikes', 'Regenerative Sap'],
  },
  'boss-crypt': {
    icon: '👑',
    zone: 'Forgotten Crypts',
    element: 'Necrotic Shadow',
    accentColor: '#c084fc',
    borderColor: 'border-purple-500/50',
    gradient: 'from-purple-950/95 via-slate-950/95 to-purple-950/95',
    barGradient: 'from-purple-600 via-fuchsia-500 to-violet-400',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    mechanics: ['Death Nova (Curse)', 'Soul Drain Wave', 'Undead Minions'],
  },
  'boss-inferno': {
    icon: '🐉',
    zone: 'Molten Core',
    element: 'Infernal Calamity',
    accentColor: '#f87171',
    borderColor: 'border-red-500/60',
    gradient: 'from-red-950/95 via-zinc-950/95 to-red-950/95',
    barGradient: 'from-red-600 via-orange-500 to-amber-400',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    mechanics: ['Dragon Hellfire (Meteor)', 'Magma Eruption', 'Infernal Roar'],
  },
};

const DEFAULT_BOSS_CONFIG: BossConfig = {
  icon: '💀',
  zone: 'Wilderness',
  element: 'Mythic Beast',
  accentColor: '#fbbf24',
  borderColor: 'border-yellow-500/50',
  gradient: 'from-yellow-950/95 via-zinc-950/95 to-yellow-950/95',
  barGradient: 'from-yellow-600 via-amber-500 to-orange-400',
  glowColor: 'rgba(234, 179, 8, 0.4)',
  mechanics: ['Devastating Strike', 'Enrage Mode', 'Area Shockwave'],
};

// Detection range in world space units
const BOSS_DETECTION_RANGE = 850;
const BOSS_LEASH_RANGE = 1250;

export const BossEncounterFrame: React.FC<BossEncounterFrameProps> = ({
  engine,
  onTargetBoss,
  onClearTarget,
}) => {
  const [activeBoss, setActiveBoss] = useState<Entity | null>(null);
  const [damageLagHp, setDamageLagHp] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [bearingAngle, setBearingAngle] = useState<number>(0);
  const [isNewEncounter, setIsNewEncounter] = useState<boolean>(false);
  const prevBossIdRef = useRef<string | null>(null);
  const lagTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for nearby bosses on every tick
  useEffect(() => {
    const player = engine.player;
    if (!player) return;

    let selectedBoss: Entity | null = null;
    let closestDist = Infinity;

    // Prioritize currently targeted boss if within leash range
    if (engine.player.targetId) {
      const targeted = engine.entities.get(engine.player.targetId);
      if (targeted && targeted.isBoss && !targeted.isDead) {
        const d = Math.hypot(targeted.x - player.x, targeted.y - player.y);
        if (d <= BOSS_LEASH_RANGE) {
          selectedBoss = targeted;
          closestDist = d;
        }
      }
    }

    // Otherwise find closest boss within detection radius
    if (!selectedBoss) {
      engine.entities.forEach((entity) => {
        if (entity.isBoss && !entity.isDead) {
          const d = Math.hypot(entity.x - player.x, entity.y - player.y);
          if (d <= BOSS_DETECTION_RANGE && d < closestDist) {
            closestDist = d;
            selectedBoss = entity;
          }
        }
      });
    }

    if (selectedBoss) {
      const dist = Math.round(closestDist);
      const angle = Math.atan2(selectedBoss.y - player.y, selectedBoss.x - player.x) * (180 / Math.PI);
      setDistance(dist);
      setBearingAngle(angle);

      // Trigger encounter fanfare on first sighting of a boss
      if (prevBossIdRef.current !== selectedBoss.id) {
        prevBossIdRef.current = selectedBoss.id;
        setIsNewEncounter(true);
        sound.playBossEncounter();
        setTimeout(() => setIsNewEncounter(false), 2400);
      }

      // Smooth lag HP bar
      if (damageLagHp === 0 || selectedBoss.hp > damageLagHp) {
        setDamageLagHp(selectedBoss.hp);
      } else if (selectedBoss.hp < damageLagHp) {
        if (lagTimeoutRef.current) clearTimeout(lagTimeoutRef.current);
        lagTimeoutRef.current = setTimeout(() => {
          setDamageLagHp(selectedBoss!.hp);
        }, 500);
      }

      setActiveBoss(selectedBoss);
    } else {
      if (prevBossIdRef.current !== null) {
        prevBossIdRef.current = null;
        setDamageLagHp(0);
      }
      setActiveBoss(null);
    }

    return () => {
      if (lagTimeoutRef.current) clearTimeout(lagTimeoutRef.current);
    };
  }, [engine.entities, engine.player.x, engine.player.y, engine.player.targetId]);

  if (!activeBoss) return null;

  const config = BOSS_CONFIGS[activeBoss.id] || DEFAULT_BOSS_CONFIG;
  const hpPercent = Math.max(0, Math.min(100, (activeBoss.hp / activeBoss.maxHp) * 100));
  const lagPercent = Math.max(0, Math.min(100, (damageLagHp / activeBoss.maxHp) * 100));
  const isEnraged = hpPercent < 35;
  const isTargeted = engine.player.targetId === activeBoss.id;

  // Compass direction name
  const getDirectionText = (deg: number) => {
    const normalized = (deg + 360) % 360;
    if (normalized >= 337.5 || normalized < 22.5) return 'East';
    if (normalized >= 22.5 && normalized < 67.5) return 'South-East';
    if (normalized >= 67.5 && normalized < 112.5) return 'South';
    if (normalized >= 112.5 && normalized < 157.5) return 'South-West';
    if (normalized >= 157.5 && normalized < 202.5) return 'West';
    if (normalized >= 202.5 && normalized < 247.5) return 'North-West';
    if (normalized >= 247.5 && normalized < 292.5) return 'North';
    return 'North-East';
  };

  return (
    <div
      id="boss-encounter-frame"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl lg:max-w-3xl pointer-events-auto select-none transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      {/* Dramatic New Encounter Flash Banner */}
      {isNewEncounter && (
        <div
          id="boss-entrance-announcement"
          className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 rounded-full bg-red-600/90 border border-yellow-400 text-yellow-100 font-extrabold text-xs tracking-widest uppercase shadow-2xl flex items-center gap-2 animate-bounce"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
          <span>WORLD BOSS APPROACHING — {activeBoss.name.toUpperCase()}</span>
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
        </div>
      )}

      {/* Main Boss Card Chassis */}
      <div
        className={`relative w-full rounded-2xl bg-gradient-to-b ${config.gradient} border-2 ${
          isEnraged ? 'border-red-500 shadow-2xl shadow-red-950/80 animate-pulse' : `${config.borderColor} shadow-2xl`
        } backdrop-blur-xl p-3 md:p-4 text-white overflow-hidden`}
        style={{
          boxShadow: isEnraged
            ? '0 0 35px rgba(239, 68, 68, 0.45), inset 0 0 15px rgba(239, 68, 68, 0.2)'
            : `0 0 25px ${config.glowColor}, inset 0 0 10px rgba(255, 255, 255, 0.05)`,
        }}
      >
        {/* Subtle Ornamental Top Edge Glow */}
        <div
          className="absolute top-0 left-1/4 right-1/4 h-[2px] opacity-75 blur-[1px]"
          style={{ backgroundColor: isEnraged ? '#ef4444' : config.accentColor }}
        />

        {/* Top Header Row: Boss Icon, Name, Title, Level, Threat Status */}
        <div className="flex items-center justify-between gap-3 mb-2">
          {/* Left: Portrait & Boss Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Avatar Crest */}
            <div
              className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center text-xl sm:text-2xl border-2 shadow-inner transition-transform ${
                isEnraged ? 'border-red-400 bg-red-950/80 scale-105' : `${config.borderColor} bg-black/60`
              }`}
            >
              <span>{config.icon}</span>
              {isEnraged && (
                <span className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-600 text-white animate-pulse">
                  <Flame className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* Boss Name & Epithet */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white drop-shadow-md truncate max-w-[200px] sm:max-w-[280px]">
                  {activeBoss.name}
                </span>

                {/* Level & World Boss Badge */}
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-black/70 border border-yellow-500/40 text-[10px] sm:text-[11px] font-mono font-bold text-yellow-400">
                    Lv. {activeBoss.level}
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-[9px] font-mono font-extrabold text-red-300 uppercase tracking-wider">
                    World Boss
                  </span>
                </div>
              </div>

              {/* Title / Zone lore */}
              <div className="flex items-center gap-2 text-[11px] text-gray-300 truncate">
                <span
                  className="font-semibold tracking-wide"
                  style={{ color: isEnraged ? '#fca5a5' : config.accentColor }}
                >
                  {activeBoss.bossTitle || config.element}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 font-mono hidden xs:inline">{config.zone}</span>
              </div>
            </div>
          </div>

          {/* Right: Enrage status, Distance tracker, Target Action */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Phase / Enraged Pill */}
            {isEnraged ? (
              <div
                id="boss-enrage-badge"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/90 border border-red-400 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg animate-pulse"
              >
                <Flame className="w-3.5 h-3.5 text-yellow-300" />
                <span className="hidden sm:inline">PHASE 2 :</span> ENRAGED
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 border border-white/10 text-[10px] font-mono text-gray-400 uppercase">
                <ShieldAlert className="w-3 h-3 text-yellow-400" />
                <span>Phase 1</span>
              </div>
            )}

            {/* Radar / Distance meter */}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-gray-300 text-[11px] font-mono"
              title={`Boss is located ${getDirectionText(bearingAngle)} from your position`}
            >
              <Navigation
                className="w-3 h-3 text-blue-400 transition-transform duration-300"
                style={{ transform: `rotate(${bearingAngle}deg)` }}
              />
              <span>{distance}m</span>
            </div>

            {/* Target Button */}
            <button
              id="boss-lock-target-btn"
              onClick={() => (isTargeted ? onClearTarget() : onTargetBoss(activeBoss))}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 border transition-all ${
                isTargeted
                  ? 'bg-blue-600/80 border-blue-400 text-white shadow-md shadow-blue-900/50'
                  : 'bg-black/60 border-white/20 hover:border-yellow-400 text-gray-200 hover:text-white'
              }`}
              title={isTargeted ? 'Targeted' : 'Click to lock onto Boss'}
            >
              <Crosshair className={`w-3.5 h-3.5 ${isTargeted ? 'text-blue-200' : 'text-yellow-400'}`} />
              <span className="hidden md:inline">{isTargeted ? 'Targeted' : 'Lock Target'}</span>
            </button>
          </div>
        </div>

        {/* Grand Multi-Tier Health Bar Container */}
        <div className="relative flex flex-col gap-1 w-full">
          {/* Main Bar Track */}
          <div
            id="boss-health-bar-track"
            className="relative w-full h-5 sm:h-6 bg-gray-950 rounded-lg border-2 border-black/80 overflow-hidden shadow-inner flex items-center"
          >
            {/* 1. Trailing Damage Lag Bar (White/Amber ghosting) */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-yellow-100/60 transition-all duration-500 ease-out"
              style={{ width: `${lagPercent}%` }}
            />

            {/* 2. Primary Animated Health Fill */}
            <div
              className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${
                isEnraged ? 'from-red-700 via-rose-600 to-amber-500' : config.barGradient
              } transition-all duration-150 ease-out`}
              style={{ width: `${hpPercent}%` }}
            >
              {/* Animated Sheen sweep */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/25" />
            </div>

            {/* 3. Health Gate Markers (25%, 50%, 75% tick notches) */}
            <div className="absolute inset-0 flex justify-between pointer-events-none px-0">
              <div className="w-[1px] h-full bg-black/50 ml-[25%]" />
              <div className="w-[1px] h-full bg-black/50 ml-[25%]" />
              <div className="w-[1px] h-full bg-black/50 ml-[25%]" />
            </div>

            {/* 4. Real-time Centered Numbers Readout */}
            <div className="relative z-10 w-full flex items-center justify-between px-3 text-[10px] sm:text-xs font-mono font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              <span className="flex items-center gap-1">
                <Swords className="w-3 h-3 text-red-300" />
                <span>HP: {activeBoss.hp.toLocaleString()} / {activeBoss.maxHp.toLocaleString()}</span>
              </span>
              <span className="bg-black/60 px-1.5 py-0.2 rounded border border-white/15">
                {hpPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Bottom Mechanic Tags & Status Effects Strip */}
          <div className="flex items-center justify-between text-[10px] text-gray-300 px-1 pt-0.5 flex-wrap gap-2">
            {/* Mechanics list */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-gray-400 font-mono uppercase text-[9px] tracking-wider hidden sm:inline">
                Abilities:
              </span>
              {config.mechanics.map((mech, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-[9px] sm:text-[10px] text-gray-300 font-sans"
                >
                  {mech}
                </span>
              ))}
            </div>

            {/* Active Status Effects on Boss */}
            {activeBoss.statusEffects && activeBoss.statusEffects.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-gray-400 font-mono">Debuffs:</span>
                {activeBoss.statusEffects.map((effect) => (
                  <span
                    key={effect.id}
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1"
                    style={{
                      backgroundColor: `${effect.color}22`,
                      borderColor: effect.color,
                      color: effect.color,
                    }}
                  >
                    <span>{effect.icon}</span>
                    <span>{Math.ceil(effect.remaining)}s</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
