import React, { useState } from 'react';
import { GameEngine } from '../../engine/gameEngine';
import { X, Keyboard, Sparkles, Sliders, Check, Ban, Coins, PackageCheck, Info } from 'lucide-react';

interface HelpModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ engine, onClose }) => {
  const [autoLoot, setAutoLoot] = useState<boolean>(engine.autoLoot);

  const handleToggleAutoLoot = () => {
    const nextVal = !autoLoot;
    setAutoLoot(nextVal);
    engine.setAutoLoot(nextVal);
  };

  return (
    <div
      id="help-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none"
    >
      <div
        id="help-modal-panel"
        className="bg-[#121417] border border-white/15 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight text-white leading-none">
                Settings & Combat Manual
              </h2>
              <span className="text-[11px] text-gray-400">Controls, automation options & realm mechanics</span>
            </div>
          </div>
          <button
            id="close-help-modal-btn"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gameplay Settings Section - Auto-Loot Toggle */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-yellow-400" />
            <span>Gameplay Settings</span>
          </div>

          <div
            id="setting-auto-loot-card"
            onClick={handleToggleAutoLoot}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
              autoLoot
                ? 'bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-black/60 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                : 'bg-black/50 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border flex items-center justify-center transition-colors ${
                  autoLoot
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                {autoLoot ? <PackageCheck className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Auto-Loot Items & Gold</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                      autoLoot
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}
                  >
                    {autoLoot ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-snug mt-0.5">
                  Automatically collects gold coins and dropped equipment when walking over them.
                </p>
              </div>
            </div>

            {/* Interactive Switch Component */}
            <button
              type="button"
              role="switch"
              aria-checked={autoLoot}
              id="auto-loot-toggle-switch"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleAutoLoot();
              }}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoLoot ? 'bg-emerald-500 shadow-md shadow-emerald-500/40' : 'bg-gray-700'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoLoot ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Keybinds Grid */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider">
            <Keyboard className="w-3.5 h-3.5 text-blue-400" />
            <span>Controls & Shortcuts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
              <span className="text-gray-300 font-sans">Move Hero</span>
              <span className="font-bold bg-black/60 px-2 py-0.5 rounded text-yellow-400 border border-white/10">
                W A S D
              </span>
            </div>

            <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
              <span className="text-gray-300 font-sans">Basic Attack</span>
              <span className="font-bold bg-black/60 px-2 py-0.5 rounded text-yellow-400 border border-white/10">
                Left Click
              </span>
            </div>

            <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
              <span className="text-gray-300 font-sans">Class Spells</span>
              <span className="font-bold bg-black/60 px-2 py-0.5 rounded text-yellow-400 border border-white/10">
                1, 2, 3, 4
              </span>
            </div>

            <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
              <span className="text-gray-300 font-sans">Dash / Roll</span>
              <span className="font-bold bg-black/60 px-2 py-0.5 rounded text-yellow-400 border border-white/10">
                Spacebar
              </span>
            </div>

            <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
              <span className="text-gray-300 font-sans">Loot / Pick Up</span>
              <span className="font-bold bg-black/60 px-2 py-0.5 rounded text-yellow-400 border border-white/10">
                Key F
              </span>
            </div>

            <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
              <span className="text-gray-300 font-sans">Potions</span>
              <span className="font-bold bg-black/60 px-2 py-0.5 rounded text-yellow-400 border border-white/10">
                Q (HP) / E (MP)
              </span>
            </div>

            <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
              <span className="text-gray-300 font-sans">Attributes</span>
              <span className="font-bold bg-black/60 px-2 py-0.5 rounded text-yellow-400 border border-white/10">
                Key C
              </span>
            </div>

            <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
              <span className="text-gray-300 font-sans">Inventory</span>
              <span className="font-bold bg-black/60 px-2 py-0.5 rounded text-yellow-400 border border-white/10">
                Key I
              </span>
            </div>

            <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
              <span className="text-gray-300 font-sans">World Map</span>
              <span className="font-bold bg-black/60 px-2 py-0.5 rounded text-yellow-400 border border-white/10">
                Key M
              </span>
            </div>

            <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
              <span className="text-gray-300 font-sans">Manual / Help</span>
              <span className="font-bold bg-black/60 px-2 py-0.5 rounded text-yellow-400 border border-white/10">
                Key H
              </span>
            </div>
          </div>
        </div>

        {/* Gameplay Tips */}
        <div className="bg-black/50 p-3.5 rounded-xl border border-white/10 flex flex-col gap-1.5 text-xs font-sans">
          <span className="font-mono font-bold text-yellow-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Realm Mechanics & Tips
          </span>
          <p className="text-gray-300 leading-relaxed">
            • <strong>Auto-Loot:</strong> With Auto-Loot enabled, walking over gold and items scoops them up instantly. If disabled, press <strong>[F]</strong> or click on the loot.
          </p>
          <p className="text-gray-300 leading-relaxed">
            • <strong>Sanctuary:</strong> Return to the central fountain to rapidly regenerate health and mana.
          </p>
          <p className="text-gray-300 leading-relaxed">
            • <strong>Boss Telegraphs:</strong> Dodge out of glowing red indicator rings to avoid massive area damage.
          </p>
          <p className="text-gray-300 leading-relaxed">
            • <strong>Item Tiers:</strong> Common &lt; Magic &lt; Rare &lt; Epic &lt; Legendary &lt; Mythic.
          </p>
        </div>
      </div>
    </div>
  );
};
