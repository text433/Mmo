import React from 'react';
import { Entity } from '../../types/game';
import { Skull, RotateCcw } from 'lucide-react';

interface DeathModalProps {
  player: Entity;
  onRespawn: () => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({ player, onRespawn }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="bg-[#121417] border-2 border-red-500/80 rounded-xl p-6 w-full max-w-md shadow-2xl flex flex-col items-center gap-4 text-center text-white">
        <div className="w-12 h-12 rounded-lg bg-black/60 border border-red-500 flex items-center justify-center text-2xl animate-pulse">
          💀
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="font-extrabold text-xl tracking-tight text-red-500">
            YOU HAVE FALLEN
          </h2>
          <p className="text-xs text-gray-400">
            The monsters of the realm overpowered your defenses. Respawn in the Sanctuary to restore your health and re-enter the battle.
          </p>
        </div>

        <div className="bg-black/50 border border-white/10 p-2.5 rounded-lg w-full flex items-center justify-around text-xs font-mono">
          <div>
            <span className="text-gray-400">Level: </span>
            <span className="font-bold text-white">{player.level}</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div>
            <span className="text-gray-400">Total Kills: </span>
            <span className="font-bold text-yellow-400">{player.kills || 0}</span>
          </div>
        </div>

        <button
          onClick={onRespawn}
          className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Respawn at Sanctuary</span>
        </button>
      </div>
    </div>
  );
};
