import React from 'react';
import { Entity } from '../../types/game';
import { ZONES, getZoneAt, WORLD_WIDTH, WORLD_HEIGHT, WORLD_SHRINES } from '../../engine/worldMap';
import { X, Map, Compass, Skull, ShieldCheck, Swords } from 'lucide-react';

interface WorldMapModalProps {
  player: Entity;
  onClose: () => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({ player, onClose }) => {
  const currentZone = getZoneAt(player.x, player.y);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-[#121417] border border-white/15 rounded-xl p-6 w-full max-w-3xl shadow-2xl flex flex-col gap-4 text-white max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-red-400" />
            <h2 className="font-bold text-base tracking-tight text-white">
              Realm Topography & Zones
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded bg-black/40 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Stylized Map Graphic */}
        <div className="relative w-full aspect-square max-h-[380px] bg-black/60 rounded-xl border border-white/15 overflow-hidden flex flex-col justify-between p-2">
          {/* 4 Quadrants & Central Sanctuary */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1.5 p-2">
            {/* Top Left: Whispering Woods */}
            <div className="bg-black/50 border border-green-500/30 rounded-lg p-2.5 flex flex-col justify-between">
              <div>
                <span className="font-bold text-xs text-green-400 uppercase tracking-wider font-mono">
                  Whispering Woods
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Lv. 1-8 • Slimes, Wolves</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-yellow-300 font-mono">
                <Skull className="w-3 h-3 text-green-400" />
                <span>Boss: Mossbeast</span>
              </div>
            </div>

            {/* Top Right: Forgotten Crypts */}
            <div className="bg-black/50 border border-purple-500/30 rounded-lg p-2.5 flex flex-col justify-between">
              <div>
                <span className="font-bold text-xs text-purple-400 uppercase tracking-wider font-mono">
                  Forgotten Crypts
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Lv. 8-16 • Skeletons, Liches</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-yellow-300 font-mono">
                <Skull className="w-3 h-3 text-purple-400" />
                <span>Boss: Lich King</span>
              </div>
            </div>

            {/* Bottom Left: Molten Core */}
            <div className="bg-black/50 border border-orange-500/30 rounded-lg p-2.5 flex flex-col justify-between">
              <div>
                <span className="font-bold text-xs text-orange-400 uppercase tracking-wider font-mono">
                  Molten Core
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Lv. 16-25 • Drakes, Titans</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-yellow-300 font-mono">
                <Skull className="w-3 h-3 text-orange-400" />
                <span>Boss: Ignis Titan</span>
              </div>
            </div>

            {/* Bottom Right: Outlaw Colosseum */}
            <div className="bg-black/50 border border-red-500/30 rounded-lg p-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <Swords className="w-3 h-3 text-red-400" />
                  <span className="font-bold text-xs text-red-400 uppercase tracking-wider font-mono">
                    Colosseum (PvP)
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Lv. 10+ • Open PvP Arena</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-yellow-300 font-mono">
                <Skull className="w-3 h-3 text-red-400" />
                <span>Boss: Bloodfang</span>
              </div>
            </div>
          </div>

          {/* Central Safe Haven: Sanctuary */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-black/80 border border-blue-400/60 rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-md z-10">
            <ShieldCheck className="w-5 h-5 text-blue-400 mb-0.5" />
            <span className="font-bold text-xs text-blue-300 uppercase tracking-wider font-mono">
              Sanctuary
            </span>
            <span className="text-[9px] font-mono text-gray-400 mt-0.5">Safe Zone • Rest Area</span>
          </div>

          {/* Player Live Marker Pin */}
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
            style={{
              left: `${(player.x / WORLD_WIDTH) * 100}%`,
              top: `${(player.y / WORLD_HEIGHT) * 100}%`,
            }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-blue-400 border-2 border-white shadow-lg animate-ping absolute" />
            <div className="w-3.5 h-3.5 rounded-full bg-blue-400 border-2 border-white shadow-lg relative flex items-center justify-center text-[7px] font-mono font-bold text-black">
              YOU
            </div>
          </div>
        </div>

        {/* Current Location Footer Info */}
        <div className="bg-black/50 p-3 rounded-lg border border-white/10 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-gray-400">Current Zone: </span>
              <span className="font-bold text-white">{currentZone.name}</span>
              <span className="text-gray-500 ml-1.5">({currentZone.recommendedLevel})</span>
            </div>
          </div>
          <div className="text-gray-400">
            X: {Math.round(player.x)} | Y: {Math.round(player.y)}
          </div>
        </div>
      </div>
    </div>
  );
};
