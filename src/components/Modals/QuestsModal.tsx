import React from 'react';
import { Quest } from '../../types/game';
import { RARITY_COLORS } from '../../engine/itemsData';
import { X, Scroll, CheckCircle2, Gift, Coins, Sparkles } from 'lucide-react';

interface QuestsModalProps {
  quests: Quest[];
  onClaimReward: (questId: string) => void;
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({ quests, onClaimReward, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-[#121417] border border-white/15 rounded-xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Scroll className="w-5 h-5 text-green-400" />
            <h2 className="font-bold text-base tracking-tight text-white">
              Bounties & Objectives
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded bg-black/40 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quests List */}
        <div className="flex flex-col gap-2.5">
          {quests.map((quest) => {
            const progress = Math.min(100, (quest.currentCount / quest.targetCount) * 100);

            return (
              <div
                key={quest.id}
                className={`p-3.5 rounded-lg border flex flex-col gap-2 transition-all ${
                  quest.isClaimed
                    ? 'bg-black/30 border-white/5 opacity-50'
                    : quest.isCompleted
                    ? 'bg-black/60 border-green-500/60 shadow-lg'
                    : 'bg-black/50 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {quest.isClaimed ? (
                      <CheckCircle2 className="w-4 h-4 text-gray-500" />
                    ) : quest.isCompleted ? (
                      <Sparkles className="w-4 h-4 text-green-400 animate-pulse" />
                    ) : (
                      <Scroll className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className="font-bold text-xs text-white">{quest.title}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                      quest.isClaimed
                        ? 'bg-black/40 border-white/10 text-gray-500'
                        : quest.isCompleted
                        ? 'bg-green-950 border-green-500 text-green-300'
                        : 'bg-black/40 border-white/10 text-yellow-400'
                    }`}
                  >
                    {quest.isClaimed
                      ? 'Claimed'
                      : quest.isCompleted
                      ? 'Ready'
                      : `${quest.currentCount}/${quest.targetCount}`}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">{quest.description}</p>

                {/* Progress Bar */}
                {!quest.isClaimed && (
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* Rewards & Claim Button */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-bold">+{quest.rewardExp} XP</span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Coins className="w-3 h-3" />
                      <span>+{quest.rewardGold}g</span>
                    </div>
                    {quest.rewardItem && (
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: RARITY_COLORS[quest.rewardItem.rarity].text }}
                      >
                        [{quest.rewardItem.name}]
                      </span>
                    )}
                  </div>

                  {quest.isCompleted && !quest.isClaimed && (
                    <button
                      onClick={() => onClaimReward(quest.id)}
                      className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white font-mono font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Gift className="w-3 h-3" />
                      <span>Claim</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
