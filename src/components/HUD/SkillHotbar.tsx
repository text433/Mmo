import React from 'react';
import { GameEngine } from '../../engine/gameEngine';
import { Sparkles, Heart, Zap, Shield, Flame } from 'lucide-react';

interface SkillHotbarProps {
  engine: GameEngine;
  onUseAbility: (index: number) => void;
  onUseHealthPotion: () => void;
  onUseManaPotion: () => void;
  onDash: () => void;
}

export const SkillHotbar: React.FC<SkillHotbarProps> = ({
  engine,
  onUseAbility,
  onUseHealthPotion,
  onUseManaPotion,
  onDash,
}) => {
  const player = engine.player;
  const expPercent = Math.max(0, Math.min(100, (engine.exp / engine.nextLevelExp) * 100));

  return (
    <div id="hud-skill-hotbar" className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto select-none flex flex-col items-center gap-2">
      {/* Active Casting Bar */}
      {engine.isCasting && engine.currentCast && (
        <div className="flex flex-col items-center gap-1 w-64 bg-black/80 border border-yellow-500/50 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg">
          <div className="flex items-center justify-between w-full text-[11px] font-mono font-bold text-yellow-300">
            <span>Casting {engine.currentCast.ability.name}...</span>
            <span>{(engine.currentCast.duration - engine.currentCast.progress).toFixed(1)}s</span>
          </div>
          <div className="w-full h-1.5 bg-gray-900 rounded-full border border-black overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-300 transition-all duration-75"
              style={{
                width: `${Math.min(100, (engine.currentCast.progress / engine.currentCast.duration) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Main Action Bar Frame */}
      <div className="flex items-center gap-2 p-2 bg-black/60 border border-white/20 rounded-xl backdrop-blur-md shadow-2xl">
        {/* Quick Potions: Q = Health, E = Mana */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-white/10">
          {/* Health Potion */}
          <button
            onClick={onUseHealthPotion}
            className="relative w-11 h-11 rounded-lg bg-gray-800 border-2 border-white/10 hover:border-green-500/60 flex flex-col items-center justify-center hover:scale-105 transition-all group"
            title="Health Potion (Press Q)"
          >
            <span className="text-lg">🧪</span>
            <div className="absolute -top-1.5 -left-1.5 text-[9px] font-mono font-bold text-green-400 bg-black border border-white/20 px-1 rounded">
              Q
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-600 text-white font-mono font-bold text-[9px] px-1 rounded border border-black">
              {engine.healthPotions}
            </div>
          </button>

          {/* Mana Potion */}
          <button
            onClick={onUseManaPotion}
            className="relative w-11 h-11 rounded-lg bg-gray-800 border-2 border-white/10 hover:border-blue-500/60 flex flex-col items-center justify-center hover:scale-105 transition-all group"
            title="Mana Potion (Press E)"
          >
            <span className="text-lg">💧</span>
            <div className="absolute -top-1.5 -left-1.5 text-[9px] font-mono font-bold text-blue-400 bg-black border border-white/20 px-1 rounded">
              E
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white font-mono font-bold text-[9px] px-1 rounded border border-black">
              {engine.manaPotions}
            </div>
          </button>
        </div>

        {/* 4 Class Active Abilities */}
        <div className="flex items-center gap-1.5">
          {engine.abilities.map((ability, idx) => {
            const isOnCooldown = ability.currentCooldown > 0;
            const notEnoughMana = player.mp < ability.manaCost;

            return (
              <button
                key={ability.id}
                onClick={() => onUseAbility(idx)}
                disabled={isOnCooldown || notEnoughMana}
                className={`relative w-12 h-12 rounded-lg flex flex-col items-center justify-center border-2 transition-all hover:scale-105 ${
                  isOnCooldown
                    ? 'bg-gray-900 border-white/10 opacity-70 cursor-not-allowed'
                    : notEnoughMana
                    ? 'bg-gray-900 border-blue-900 opacity-60'
                    : 'bg-gray-800 border-white/15 hover:border-yellow-500/70'
                }`}
                style={{ borderColor: !isOnCooldown ? ability.effectColor : undefined }}
                title={`${ability.name} (${ability.key}) - ${ability.description} [Mana: ${ability.manaCost}]`}
              >
                <span className="text-xl drop-shadow">{ability.icon}</span>

                {/* Hotkey Badge */}
                <div className="absolute -top-1.5 -left-1.5 text-[9px] font-mono font-bold text-yellow-400 bg-black border border-white/20 px-1 rounded">
                  {ability.key}
                </div>

                {/* Mana Cost Badge */}
                <div className="absolute -bottom-1 -right-1 text-[8px] font-mono text-blue-300 bg-black/80 px-1 rounded border border-black">
                  {ability.manaCost}
                </div>

                {/* Cooldown Overlay */}
                {isOnCooldown && (
                  <div className="absolute inset-0 bg-black/80 rounded-lg flex items-center justify-center text-yellow-400 font-mono font-bold text-xs">
                    {ability.currentCooldown.toFixed(1)}s
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Dash Skill (Spacebar) */}
        <div className="pl-2 border-l border-white/10">
          <button
            onClick={onDash}
            disabled={engine.dashCooldown > 0}
            className={`relative w-12 h-12 rounded-lg flex flex-col items-center justify-center border-2 transition-all hover:scale-105 ${
              engine.dashCooldown > 0
                ? 'bg-gray-900 border-white/10 opacity-70 cursor-not-allowed'
                : 'bg-gray-800 border-purple-500/80 hover:border-purple-400'
            }`}
            title="Dash / Dodge Roll (Spacebar)"
          >
            <span className="text-xl">💨</span>
            <div className="absolute -top-1.5 -left-1.5 text-[8px] font-mono font-bold text-purple-300 bg-black border border-white/20 px-1 rounded">
              SPC
            </div>
            {engine.dashCooldown > 0 && (
              <div className="absolute inset-0 bg-black/80 rounded-lg flex items-center justify-center text-purple-300 font-mono font-bold text-xs">
                {engine.dashCooldown.toFixed(1)}s
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div className="relative w-80 h-2 bg-gray-900 rounded-full overflow-hidden border border-black shadow">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 transition-all duration-300"
          style={{ width: `${expPercent}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white drop-shadow">
          XP: {engine.exp} / {engine.nextLevelExp} ({expPercent.toFixed(0)}%)
        </span>
      </div>
    </div>
  );
};
