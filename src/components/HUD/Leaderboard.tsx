import React, { useState } from 'react';
import { Entity } from '../../types/game';
import { Trophy, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface LeaderboardProps {
  player: Entity;
  entities: Map<string, Entity>;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ player, entities }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Compile list of players and bots sorted by score / level
  const list: { id: string; name: string; level: number; score: number; kills: number; isPlayer: boolean; color: string }[] = [];

  list.push({
    id: player.id,
    name: player.name,
    level: player.level,
    score: player.score || 0,
    kills: player.kills || 0,
    isPlayer: true,
    color: player.color,
  });

  entities.forEach((ent) => {
    if (ent.type === 'bot') {
      list.push({
        id: ent.id,
        name: ent.name,
        level: ent.level,
        score: ent.score || 0,
        kills: ent.kills || 0,
        isPlayer: false,
        color: ent.color,
      });
    }
  });

  list.sort((a, b) => b.score - a.score || b.level - a.level);
  const topList = list.slice(0, 6);
  const playerRank = list.findIndex((p) => p.isPlayer) + 1;

  return (
    <div id="hud-leaderboard" className="absolute top-6 right-6 z-20 pointer-events-auto select-none flex flex-col items-end">
      <div className="bg-black/60 border border-white/10 p-3 rounded-lg backdrop-blur-md w-56 shadow-2xl">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
          <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-xs uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Leaderboard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] text-green-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              <span>{list.length} Online</span>
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-400 hover:text-white"
            >
              {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="flex flex-col gap-1 mt-2">
            {topList.map((entry, idx) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between px-2 py-1 rounded text-xs ${
                  entry.isPlayer
                    ? 'bg-blue-500/20 border border-blue-500/50 text-blue-200'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-3.5 text-center font-mono font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[90px]">{entry.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <span className="text-gray-400">Lv.{entry.level}</span>
                  <span className="text-yellow-400 font-bold">{entry.score}</span>
                </div>
              </div>
            ))}

            {playerRank > 6 && (
              <div className="mt-1 pt-1 border-t border-white/10 flex items-center justify-between px-2 py-0.5 rounded bg-blue-500/15 border border-blue-400/30 text-[11px] font-mono text-blue-300">
                <span>#{playerRank} {player.name} (You)</span>
                <span className="text-yellow-400 font-bold">{player.score || 0}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
