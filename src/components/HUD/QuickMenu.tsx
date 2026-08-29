import React from 'react';
import { User, Briefcase, Zap, Scroll, Map, HelpCircle } from 'lucide-react';

interface QuickMenuProps {
  onOpenCharacter: () => void;
  onOpenInventory: () => void;
  onOpenSkillTree: () => void;
  onOpenQuests: () => void;
  onOpenWorldMap: () => void;
  onOpenHelp: () => void;
  unspentPoints: number;
  completedQuestsCount: number;
}

export const QuickMenu: React.FC<QuickMenuProps> = ({
  onOpenCharacter,
  onOpenInventory,
  onOpenSkillTree,
  onOpenQuests,
  onOpenWorldMap,
  onOpenHelp,
  unspentPoints,
  completedQuestsCount,
}) => {
  return (
    <div id="hud-quick-menu" className="absolute right-6 bottom-6 z-20 pointer-events-auto select-none flex flex-col gap-2">
      <div className="bg-black/60 border border-white/10 p-2 rounded-xl backdrop-blur-md shadow-2xl flex flex-col gap-2">
        {/* Character Sheet */}
        <button
          onClick={onOpenCharacter}
          className="relative w-10 h-10 rounded-lg bg-gray-800 border border-white/15 hover:border-white/40 text-gray-200 hover:text-white transition-all hover:scale-105 flex items-center justify-center group"
          title="Character Attributes (C)"
        >
          <User className="w-4 h-4 text-blue-400" />
          <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold text-gray-400 bg-black border border-white/20 px-1 rounded">C</span>
          {unspentPoints > 0 && (
            <div className="absolute -top-1 -left-1 bg-red-500 text-white font-mono font-bold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse border border-black">
              +
            </div>
          )}
        </button>

        {/* Inventory */}
        <button
          onClick={onOpenInventory}
          className="relative w-10 h-10 rounded-lg bg-gray-800 border border-white/15 hover:border-white/40 text-gray-200 hover:text-white transition-all hover:scale-105 flex items-center justify-center group"
          title="Equipment & Bag (I)"
        >
          <Briefcase className="w-4 h-4 text-yellow-400" />
          <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold text-gray-400 bg-black border border-white/20 px-1 rounded">I</span>
        </button>

        {/* Skill Tree */}
        <button
          onClick={onOpenSkillTree}
          className="relative w-10 h-10 rounded-lg bg-gray-800 border border-white/15 hover:border-white/40 text-gray-200 hover:text-white transition-all hover:scale-105 flex items-center justify-center group"
          title="Spells & Abilities (K)"
        >
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold text-gray-400 bg-black border border-white/20 px-1 rounded">K</span>
        </button>

        {/* Quests */}
        <button
          onClick={onOpenQuests}
          className="relative w-10 h-10 rounded-lg bg-gray-800 border border-white/15 hover:border-white/40 text-gray-200 hover:text-white transition-all hover:scale-105 flex items-center justify-center group"
          title="Quests & Bounties (L)"
        >
          <Scroll className="w-4 h-4 text-green-400" />
          <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold text-gray-400 bg-black border border-white/20 px-1 rounded">L</span>
          {completedQuestsCount > 0 && (
            <div className="absolute -top-1 -left-1 bg-green-500 text-white font-mono font-bold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse border border-black">
              {completedQuestsCount}
            </div>
          )}
        </button>

        {/* World Map */}
        <button
          onClick={onOpenWorldMap}
          className="relative w-10 h-10 rounded-lg bg-gray-800 border border-white/15 hover:border-white/40 text-gray-200 hover:text-white transition-all hover:scale-105 flex items-center justify-center group"
          title="World Map (M)"
        >
          <Map className="w-4 h-4 text-red-400" />
          <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold text-gray-400 bg-black border border-white/20 px-1 rounded">M</span>
        </button>

        {/* Help */}
        <button
          onClick={onOpenHelp}
          className="relative w-10 h-10 rounded-lg bg-gray-800 border border-white/15 hover:border-white/40 text-gray-200 hover:text-white transition-all hover:scale-105 flex items-center justify-center group"
          title="Controls & Guide (H)"
        >
          <HelpCircle className="w-4 h-4 text-teal-400" />
          <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold text-gray-400 bg-black border border-white/20 px-1 rounded">H</span>
        </button>
      </div>
    </div>
  );
};
