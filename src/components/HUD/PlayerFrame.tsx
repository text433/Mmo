import React from 'react';
import { Entity, PlayerStats } from '../../types/game';
import { CLASS_DEFINITIONS } from '../../engine/classData';
import { Volume2, VolumeX, Shield, Swords, Sparkles, Coins } from 'lucide-react';
import { sound } from '../../engine/soundEngine';

interface PlayerFrameProps {
  player: Entity;
  playerStats: PlayerStats;
  gold: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenCharacter: () => void;
}

export const PlayerFrame: React.FC<PlayerFrameProps> = ({
  player,
  playerStats,
  gold,
  soundEnabled,
  onToggleSound,
  onOpenCharacter,
}) => {
  const classDef = CLASS_DEFINITIONS[player.classType || 'warrior'];
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const mpPercent = Math.max(0, Math.min(100, (player.mp / player.maxMp) * 100));

  return (
    <div id="hud-player-frame" className="absolute top-6 left-6 z-20 flex flex-col gap-2 pointer-events-auto select-none">
      <div className="bg-black/60 border border-white/10 p-3 rounded-lg backdrop-blur-md w-64 shadow-2xl">
        {/* Character Title & Class info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              onClick={onOpenCharacter}
              className="relative w-8 h-8 rounded-lg bg-gray-800 border border-white/20 flex items-center justify-center cursor-pointer hover:border-white/50 transition-colors"
              title="View Character Sheet (C)"
            >
              <span className="text-base">
                {player.classType === 'warrior' && '⚔️'}
                {player.classType === 'mage' && '🔮'}
                {player.classType === 'ranger' && '🏹'}
                {player.classType === 'paladin' && '🛡️'}
              </span>
              {playerStats.unspentPoints > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-black animate-pulse">
                  +
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                {player.name}
              </div>
              <div className="text-[10px] text-gray-400 font-mono">
                Lv. {player.level} • {classDef.name}
              </div>
            </div>
          </div>

          {/* Sound Toggle Button */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleSound}
            className="w-7 h-7 rounded bg-black/40 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-green-400" /> : <VolumeX className="w-3.5 h-3.5 text-gray-500" />}
          </button>
        </div>

        {/* Health Section */}
        <div className="mb-2.5">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Health</span>
            <span className="text-[10px] font-mono text-gray-200">
              {player.hp.toLocaleString()} / {player.maxHp.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-900 rounded-full border border-black overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Mana Section */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Mana</span>
            <span className="text-[10px] font-mono text-gray-200">
              {player.mp.toLocaleString()} / {player.maxMp.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-900 rounded-full border border-black overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-200"
              style={{ width: `${mpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Gold & Kills Status Bar */}
      <div className="flex items-center gap-3 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg backdrop-blur-md w-fit text-xs font-mono">
        <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <span>{gold.toLocaleString()}g</span>
        </div>
        <div className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-1.5 text-gray-300">
          <Swords className="w-3.5 h-3.5 text-red-400" />
          <span>{player.kills || 0} Kills</span>
        </div>
      </div>

      {/* Status Buffs */}
      {player.statusEffects.length > 0 && (
        <div className="flex items-center gap-1 mt-0.5">
          {player.statusEffects.map((buff) => (
            <div
              key={buff.id}
              className="p-1 rounded bg-black/60 border border-white/20 text-xs flex items-center justify-center shadow backdrop-blur-sm"
              style={{ borderColor: buff.color }}
              title={`${buff.name} (${buff.remaining.toFixed(1)}s)`}
            >
              <span>{buff.icon}</span>
              <span className="text-[9px] font-mono font-bold ml-1 text-gray-200">{buff.remaining.toFixed(0)}s</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
