import React, { useState } from 'react';
import { CharacterClassType } from '../../types/game';
import { CLASS_DEFINITIONS } from '../../engine/classData';
import { Play, Crown, Flame } from 'lucide-react';
import { sound } from '../../engine/soundEngine';

interface HeroSelectModalProps {
  onStartGame: (name: string, chosenClass: CharacterClassType) => void;
}

export const HeroSelectModal: React.FC<HeroSelectModalProps> = ({ onStartGame }) => {
  const [name, setName] = useState('Hero');
  const [selectedClass, setSelectedClass] = useState<CharacterClassType>('warrior');
  const classes: CharacterClassType[] = ['warrior', 'mage', 'ranger', 'paladin'];
  const activeDef = CLASS_DEFINITIONS[selectedClass];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playLevelUp();
    onStartGame(name.trim() || 'Hero', selectedClass);
  };

  const iconFor = (c: CharacterClassType) => ({ warrior: '⚔', mage: '✦', ranger: '➶', paladin: '♜' }[c]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050403] text-[#e7d8b1] select-none">
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% 18%, rgba(125,67,24,.30), transparent 34%), radial-gradient(circle at 20% 80%, rgba(74,22,12,.20), transparent 38%), linear-gradient(180deg,#100b07 0%,#050403 55%,#090604 100%)'
      }} />
      <div className="fixed inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(115deg, transparent 0 48px, rgba(198,139,62,.035) 49px 50px)' }} />

      <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-4xl border border-[#6f4a25] bg-black/70 shadow-[0_0_70px_rgba(0,0,0,.9),inset_0_0_50px_rgba(128,69,24,.12)]">
          <div className="h-[3px] bg-gradient-to-r from-transparent via-[#c28a42] to-transparent" />

          <div className="px-5 pt-6 pb-4 text-center border-b border-[#4c351f] bg-gradient-to-b from-[#24150b]/80 to-transparent">
            <div className="flex justify-center items-center gap-3 text-[#b9823d] text-[10px] sm:text-xs tracking-[.35em] uppercase font-bold">
              <Flame className="w-4 h-4" /> Ancient realms await <Flame className="w-4 h-4" />
            </div>
            <h1 className="mt-2 font-serif text-4xl sm:text-6xl font-black tracking-[.08em] text-[#e2bf79] drop-shadow-[0_3px_2px_#000]">DARKFALL</h1>
            <div className="text-[#8f6738] tracking-[.55em] text-[10px] sm:text-xs font-bold">RPG.IO</div>
          </div>

          <form onSubmit={handleStart} className="p-4 sm:p-7 grid lg:grid-cols-[1.2fr_.8fr] gap-5">
            <section>
              <div className="text-[10px] tracking-[.28em] uppercase text-[#9d7544] mb-2">Choose your calling</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {classes.map((c) => {
                  const def = CLASS_DEFINITIONS[c];
                  const selected = c === selectedClass;
                  return <button key={c} type="button" onClick={() => { setSelectedClass(c); sound.playLootPickup('magic'); }}
                    className={`relative min-h-32 p-3 border transition-all ${selected ? 'border-[#d09a4d] bg-[#2b190d] shadow-[inset_0_0_25px_rgba(202,137,55,.18),0_0_16px_rgba(161,99,35,.18)]' : 'border-[#49331e] bg-[#0c0906] hover:border-[#805a30]'}`}>
                    <div className={`text-4xl font-serif ${selected ? 'text-[#efc36e]' : 'text-[#745638]'}`}>{iconFor(c)}</div>
                    <div className="mt-3 font-serif font-bold text-sm uppercase tracking-wider text-[#dbc18f]">{def.name}</div>
                    <div className="text-[9px] mt-1 text-[#7f705e] uppercase tracking-widest">{def.title}</div>
                    {selected && <div className="absolute left-2 right-2 bottom-0 h-[2px] bg-[#d09a4d]" />}
                  </button>;
                })}
              </div>

              <div className="mt-4 border border-[#49331e] bg-[#090705]/90 p-4">
                <div className="flex items-center justify-between gap-3 border-b border-[#39291a] pb-3">
                  <div>
                    <div className="font-serif text-xl font-bold text-[#dfbd7d]">{activeDef.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-[#846a4c]">{activeDef.title}</div>
                  </div>
                  <div className="font-mono text-[10px] text-[#aa895d] text-right">VITALITY {activeDef.baseHp}<br/>ARCANA {activeDef.baseMp}</div>
                </div>
                <p className="text-xs leading-relaxed text-[#a99b87] mt-3">{activeDef.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  {activeDef.abilities.map(ab => <div key={ab.id} className="border border-[#3c2b1b] bg-black/60 p-2 text-center">
                    <div className="text-xl text-[#d3a04e]">{ab.icon}</div>
                    <div className="text-[9px] font-bold text-[#cbb58c] truncate">{ab.name}</div>
                    <div className="text-[8px] text-[#665b4d]">[{ab.key}]</div>
                  </div>)}
                </div>
              </div>
            </section>

            <section className="border border-[#49331e] bg-gradient-to-b from-[#171008] to-[#080604] p-5 flex flex-col justify-between shadow-[inset_0_0_35px_rgba(111,67,25,.12)]">
              <div>
                <Crown className="w-8 h-8 mx-auto text-[#a7783d] mb-3" />
                <h2 className="font-serif text-center text-xl font-bold text-[#dbc18f]">Forge Your Legend</h2>
                <p className="text-center text-[10px] text-[#776b5c] mt-2 leading-relaxed">Name your champion. Enter the fallen realm. Hunt, loot and grow stronger.</p>

                <label className="block mt-6 mb-2 text-[9px] uppercase tracking-[.25em] text-[#9c7545]">Character name</label>
                <input value={name} onChange={e => setName(e.target.value)} maxLength={18} required placeholder="Enter name..."
                  className="w-full bg-black border border-[#5b3e21] px-4 py-3 text-sm text-[#e4c990] outline-none focus:border-[#c18a43] placeholder-[#4f463a]" />
              </div>

              <button type="submit" className="mt-6 w-full border border-[#d09a4d] bg-gradient-to-b from-[#9b632a] to-[#5b3518] hover:from-[#b77b37] hover:to-[#70431e] py-4 font-serif font-black uppercase tracking-[.2em] text-[#fff0c7] shadow-[inset_0_0_15px_rgba(255,205,111,.15),0_5px_20px_rgba(0,0,0,.6)] flex justify-center items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Enter Darkfall
              </button>
            </section>
          </form>

          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#70491f] to-transparent" />
        </div>
      </div>
    </div>
  );
};
