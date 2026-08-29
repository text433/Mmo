import React from 'react';
import { Entity, PlayerStats } from '../../types/game';
import { CLASS_DEFINITIONS } from '../../engine/classData';
import { X, Shield, Swords, Zap, Activity, Plus, Award } from 'lucide-react';

interface CharacterModalProps {
  player: Entity;
  stats: PlayerStats;
  onAllocatePoint: (stat: keyof Omit<PlayerStats, 'unspentPoints'>) => void;
  onClose: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  player,
  stats,
  onAllocatePoint,
  onClose,
}) => {
  const classDef = CLASS_DEFINITIONS[player.classType || 'warrior'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-[#121417] border border-white/15 rounded-xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-black/60 border border-white/20"
              style={{ borderColor: classDef.color }}
            >
              {player.classType === 'warrior' && '⚔️'}
              {player.classType === 'mage' && '🔮'}
              {player.classType === 'ranger' && '🏹'}
              {player.classType === 'paladin' && '🛡️'}
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight text-white">
                {player.name}
              </h2>
              <p className="text-[11px] text-gray-400 font-mono">
                Level {player.level} • {classDef.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded bg-black/40 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unspent Points Banner */}
        {stats.unspentPoints > 0 ? (
          <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/40 px-3 py-2 rounded-lg text-yellow-300 text-xs font-mono">
            <span className="flex items-center gap-1.5 font-bold">
              <Award className="w-4 h-4 text-yellow-400" />
              {stats.unspentPoints} Unspent Points
            </span>
            <span className="text-[10px] text-yellow-400/80 uppercase">Click + to assign</span>
          </div>
        ) : null}

        {/* 4 Core Attributes Allocation */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Strength */}
          <div className="bg-black/50 border border-white/10 p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-red-400">
                <Swords className="w-3.5 h-3.5" />
                <span>Strength</span>
              </div>
              <div className="text-lg font-mono font-bold text-white mt-0.5">{stats.strength}</div>
              <div className="text-[9px] font-mono text-gray-400">+Physical & HP</div>
            </div>
            {stats.unspentPoints > 0 && (
              <button
                onClick={() => onAllocatePoint('strength')}
                className="w-7 h-7 rounded bg-red-600 hover:bg-red-500 text-white flex items-center justify-center font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Agility */}
          <div className="bg-black/50 border border-white/10 p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-green-400">
                <Activity className="w-3.5 h-3.5" />
                <span>Agility</span>
              </div>
              <div className="text-lg font-mono font-bold text-white mt-0.5">{stats.agility}</div>
              <div className="text-[9px] font-mono text-gray-400">+Speed & Crit</div>
            </div>
            {stats.unspentPoints > 0 && (
              <button
                onClick={() => onAllocatePoint('agility')}
                className="w-7 h-7 rounded bg-green-600 hover:bg-green-500 text-white flex items-center justify-center font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Intelligence */}
          <div className="bg-black/50 border border-white/10 p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-blue-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Intelligence</span>
              </div>
              <div className="text-lg font-mono font-bold text-white mt-0.5">{stats.intelligence}</div>
              <div className="text-[9px] font-mono text-gray-400">+Spell & MP</div>
            </div>
            {stats.unspentPoints > 0 && (
              <button
                onClick={() => onAllocatePoint('intelligence')}
                className="w-7 h-7 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Vitality */}
          <div className="bg-black/50 border border-white/10 p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-yellow-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Vitality</span>
              </div>
              <div className="text-lg font-mono font-bold text-white mt-0.5">{stats.vitality}</div>
              <div className="text-[9px] font-mono text-gray-400">+Max HP & Armor</div>
            </div>
            {stats.unspentPoints > 0 && (
              <button
                onClick={() => onAllocatePoint('vitality')}
                className="w-7 h-7 rounded bg-yellow-600 hover:bg-yellow-500 text-white flex items-center justify-center font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Combat Stats Overview */}
        <div className="bg-black/50 p-3.5 rounded-lg border border-white/10 flex flex-col gap-1.5 text-xs">
          <div className="text-gray-400 font-mono font-bold uppercase text-[10px] tracking-wider mb-1">
            Combat Parameters
          </div>
          <div className="flex items-center justify-between py-1 border-b border-white/5 font-mono">
            <span className="text-gray-400">Max Health (HP)</span>
            <span className="font-bold text-red-400">{player.maxHp}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-white/5 font-mono">
            <span className="text-gray-400">Max Mana (MP)</span>
            <span className="font-bold text-blue-400">{player.maxMp}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-white/5 font-mono">
            <span className="text-gray-400">Move Speed</span>
            <span className="font-bold text-white">{player.speed.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-400 font-mono">Passive</span>
            <span className="text-[11px] text-yellow-300 font-sans text-right max-w-[220px]">
              {classDef.passiveText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
