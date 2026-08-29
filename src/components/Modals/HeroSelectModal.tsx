import React, { useState } from 'react';
import { CharacterClassType } from '../../types/game';
import { CLASS_DEFINITIONS } from '../../engine/classData';
import { Swords, Zap, Shield, Target, Play, Sparkles } from 'lucide-react';
import { sound } from '../../engine/soundEngine';

interface HeroSelectModalProps {
  onStartGame: (name: string, chosenClass: CharacterClassType) => void;
}

export const HeroSelectModal: React.FC<HeroSelectModalProps> = ({ onStartGame }) => {
  const [name, setName] = useState<string>('Hero');
  const [selectedClass, setSelectedClass] = useState<CharacterClassType>('warrior');

  const classes: CharacterClassType[] = ['warrior', 'mage', 'ranger', 'paladin'];
  const activeDef = CLASS_DEFINITIONS[selectedClass];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playLevelUp();
    onStartGame(name.trim() || 'Hero', selectedClass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-[#121417] border border-white/15 rounded-2xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl flex flex-col gap-6 text-white max-h-[95vh] overflow-y-auto">
        {/* Title */}
        <div className="text-center flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-yellow-400 font-mono font-bold text-xs uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top-Down HTML5 MMORPG</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            REALM.IO MMORPG
          </h1>
          <p className="text-xs text-gray-400 max-w-md">
            Select your hero archetype, enter your character name, and start your journey in a vast multiplayer sandbox world.
          </p>
        </div>

        <form onSubmit={handleStart} className="flex flex-col gap-5">
          {/* Hero Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-bold text-gray-300 uppercase tracking-wider">
              Character Identifier
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter character name..."
              maxLength={18}
              required
              className="bg-black/50 border border-white/15 rounded-lg px-4 py-2.5 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-white/40"
            />
          </div>

          {/* 4 Class Options Cards */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-mono font-bold text-gray-300 uppercase tracking-wider">
              Class Specialization
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {classes.map((c) => {
                const def = CLASS_DEFINITIONS[c];
                const isSelected = selectedClass === c;

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedClass(c);
                      sound.playLootPickup('magic');
                    }}
                    className={`p-3.5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-black/80 border-yellow-400 shadow-xl'
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">
                      {c === 'warrior' && '⚔️'}
                      {c === 'mage' && '🔮'}
                      {c === 'ranger' && '🏹'}
                      {c === 'paladin' && '🛡️'}
                    </span>
                    <span className="font-bold text-xs text-white">{def.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{def.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Class Preview Panel */}
          <div className="bg-black/50 p-4 rounded-xl border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-200">{activeDef.name} Attributes</span>
              <span className="text-[11px] font-mono text-gray-400">
                HP: {activeDef.baseHp} | MP: {activeDef.baseMp}
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{activeDef.description}</p>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-yellow-400">
                Starting Abilities
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activeDef.abilities.map((ab) => (
                  <div
                    key={ab.id}
                    className="p-2 rounded-lg bg-black/40 border border-white/10 flex items-center gap-2"
                  >
                    <span className="text-base">{ab.icon}</span>
                    <div className="flex flex-col truncate">
                      <span className="font-bold text-[10px] text-gray-200 truncate">{ab.name}</span>
                      <span className="text-[9px] font-mono text-gray-400">Key [{ab.key}]</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-mono font-bold text-sm uppercase tracking-wider transition-all hover:scale-[1.01] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Enter the Game</span>
          </button>
        </form>
      </div>
    </div>
  );
};
