import React from 'react';
import { Entity } from '../../types/game';
import { Skull, ShieldAlert } from 'lucide-react';

interface TargetFrameProps {
  target: Entity | null;
  onClearTarget: () => void;
}

export const TargetFrame: React.FC<TargetFrameProps> = ({ target, onClearTarget }) => {
  if (!target || target.isDead) return null;

  // Boss entities are handled by the dedicated large-scale BossEncounterFrame
  if (target.isBoss) {
    return null;
  }

  const hpPercent = Math.max(0, Math.min(100, (target.hp / target.maxHp) * 100));

  return (
    <div
      id="hud-target-frame"
      className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/60 border border-white/10 px-4 py-2 rounded-lg backdrop-blur-md shadow-xl pointer-events-auto select-none min-w-[260px]"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base border"
        style={{ borderColor: target.color, backgroundColor: `${target.color}22` }}
      >
        {target.type === 'monster' ? '👾' : target.type === 'bot' ? '🧙' : '🎯'}
      </div>

      <div className="flex flex-col flex-1 gap-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-gray-200 truncate max-w-[120px]">
            {target.name}
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            Lv. {target.level}
          </span>
        </div>

        {/* Health Bar */}
        <div className="relative w-full h-2.5 bg-gray-900 rounded-full border border-black overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-150"
            style={{ width: `${hpPercent}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white drop-shadow">
            {target.hp} / {target.maxHp}
          </span>
        </div>
      </div>

      <button
        onClick={onClearTarget}
        className="text-gray-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-black/40 border border-white/10 hover:border-white/30"
      >
        ✕
      </button>
    </div>
  );
};
