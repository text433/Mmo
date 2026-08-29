import React from 'react';
import { Entity, Ability } from '../../types/game';
import { CLASS_DEFINITIONS } from '../../engine/classData';
import { X, Zap, Clock, Shield, Sparkles } from 'lucide-react';

interface SkillTreeModalProps {
  player: Entity;
  abilities: Ability[];
  onClose: () => void;
}

export const SkillTreeModal: React.FC<SkillTreeModalProps> = ({ player, abilities, onClose }) => {
  const classDef = CLASS_DEFINITIONS[player.classType || 'warrior'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-[#121417] border border-white/15 rounded-xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-base tracking-tight text-white">
              {classDef.name} Abilities & Spells
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded bg-black/40 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Passive Skill Card */}
        <div className="bg-black/50 p-3.5 rounded-lg border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black/60 border border-purple-500 flex items-center justify-center text-xl shrink-0">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-purple-300">Innate Class Passive</span>
              <span className="text-[9px] font-mono font-bold uppercase bg-purple-950 border border-purple-800 text-purple-200 px-1.5 py-0.2 rounded">
                Active
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{classDef.passiveText}</p>
          </div>
        </div>

        {/* Active Abilities List */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
            Active Combat Spells
          </span>

          {abilities.map((ability) => (
            <div
              key={ability.id}
              className="bg-black/50 border border-white/10 p-3 rounded-lg flex items-start gap-3 hover:border-white/20 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border shrink-0 bg-black/60"
                style={{ borderColor: ability.effectColor }}
              >
                {ability.icon}
              </div>

              <div className="flex-1 flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{ability.name}</span>
                    <span className="text-[9px] font-mono font-bold bg-black/60 text-yellow-400 px-1.5 py-0.2 rounded border border-white/10">
                      Key [{ability.key}]
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-blue-400">
                    {ability.manaCost} MP
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">{ability.description}</p>

                <div className="flex items-center gap-3 text-[10px] font-mono font-semibold text-gray-400 mt-1">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3 h-3" />
                    CD: {ability.cooldown}s
                  </span>
                  {ability.castTime > 0 && (
                    <span className="text-yellow-400">Cast: {ability.castTime}s</span>
                  )}
                  {ability.range > 0 && (
                    <span className="text-green-400">Range: {ability.range}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
