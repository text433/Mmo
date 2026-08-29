import React, { useState } from 'react';
import { Item, ItemSlot, Entity } from '../../types/game';
import { RARITY_COLORS } from '../../engine/itemsData';
import { X, Shield, Swords, Coins, Sparkles, Trash2 } from 'lucide-react';

interface InventoryModalProps {
  player: Entity;
  inventory: (Item | null)[];
  gold: number;
  onEquipItem: (item: Item, index: number) => void;
  onUnequipItem: (slot: ItemSlot) => void;
  onSellItem: (index: number) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  player,
  inventory,
  gold,
  onEquipItem,
  onUnequipItem,
  onSellItem,
  onClose,
}) => {
  const [selectedItem, setSelectedItem] = useState<{ item: Item; index?: number; isEquipped?: boolean; slot?: ItemSlot } | null>(null);

  const equipped = player.equipped || {};

  const equipmentSlots: { slot: ItemSlot; label: string; icon: string }[] = [
    { slot: 'helmet', label: 'Head', icon: '👑' },
    { slot: 'amulet', label: 'Neck', icon: '📿' },
    { slot: 'weapon', label: 'Main Hand', icon: '🗡️' },
    { slot: 'armor', label: 'Chest', icon: '🥋' },
    { slot: 'offhand', label: 'Off Hand', icon: '🛡️' },
    { slot: 'ring', label: 'Finger', icon: '💍' },
    { slot: 'boots', label: 'Feet', icon: '👢' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-[#121417] border border-white/15 rounded-xl p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <h2 className="font-bold text-base tracking-tight text-white">
              Equipment & Bag
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-yellow-400 font-mono font-bold text-xs bg-black/50 px-3 py-1 rounded border border-white/10">
              <Coins className="w-3.5 h-3.5" />
              <span>{gold.toLocaleString()} Gold</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded bg-black/40 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Layout: Left = Paperdoll Gear, Right = Bag Slots */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Paperdoll Equipment Slots (5 Cols) */}
          <div className="md:col-span-5 bg-black/50 border border-white/10 p-3.5 rounded-lg flex flex-col gap-2">
            <div className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider text-center">
              Equipped Loadout
            </div>

            <div className="grid grid-cols-3 gap-2 justify-items-center py-2">
              {/* Helmet */}
              <div className="col-start-2">
                <EquipSlotCard
                  slot="helmet"
                  item={equipped.helmet}
                  icon="👑"
                  onSelect={() => setSelectedItem(equipped.helmet ? { item: equipped.helmet, isEquipped: true, slot: 'helmet' } : null)}
                  isSelected={selectedItem?.slot === 'helmet'}
                />
              </div>

              {/* Weapon, Armor, Offhand */}
              <EquipSlotCard
                slot="weapon"
                item={equipped.weapon}
                icon="🗡️"
                onSelect={() => setSelectedItem(equipped.weapon ? { item: equipped.weapon, isEquipped: true, slot: 'weapon' } : null)}
                isSelected={selectedItem?.slot === 'weapon'}
              />
              <EquipSlotCard
                slot="armor"
                item={equipped.armor}
                icon="🥋"
                onSelect={() => setSelectedItem(equipped.armor ? { item: equipped.armor, isEquipped: true, slot: 'armor' } : null)}
                isSelected={selectedItem?.slot === 'armor'}
              />
              <EquipSlotCard
                slot="offhand"
                item={equipped.offhand}
                icon="🛡️"
                onSelect={() => setSelectedItem(equipped.offhand ? { item: equipped.offhand, isEquipped: true, slot: 'offhand' } : null)}
                isSelected={selectedItem?.slot === 'offhand'}
              />

              {/* Amulet, Boots, Ring */}
              <EquipSlotCard
                slot="amulet"
                item={equipped.amulet}
                icon="📿"
                onSelect={() => setSelectedItem(equipped.amulet ? { item: equipped.amulet, isEquipped: true, slot: 'amulet' } : null)}
                isSelected={selectedItem?.slot === 'amulet'}
              />
              <EquipSlotCard
                slot="boots"
                item={equipped.boots}
                icon="👢"
                onSelect={() => setSelectedItem(equipped.boots ? { item: equipped.boots, isEquipped: true, slot: 'boots' } : null)}
                isSelected={selectedItem?.slot === 'boots'}
              />
              <EquipSlotCard
                slot="ring"
                item={equipped.ring}
                icon="💍"
                onSelect={() => setSelectedItem(equipped.ring ? { item: equipped.ring, isEquipped: true, slot: 'ring' } : null)}
                isSelected={selectedItem?.slot === 'ring'}
              />
            </div>
          </div>

          {/* 24-Slot Bag Grid (7 Cols) */}
          <div className="md:col-span-7 bg-black/50 border border-white/10 p-3.5 rounded-lg flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                Inventory Grid ({inventory.filter(Boolean).length}/24)
              </span>
              <span className="text-[10px] font-mono text-gray-500">Select to inspect</span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {inventory.map((item, idx) => {
                const rarityStyle = item ? RARITY_COLORS[item.rarity] : null;
                const isSelected = selectedItem?.index === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (item) setSelectedItem({ item, index: idx, isEquipped: false });
                    }}
                    className={`relative w-10 h-10 rounded flex items-center justify-center cursor-pointer transition-all border ${
                      item
                        ? 'hover:border-white/50'
                        : 'bg-black/40 border-white/5 cursor-default'
                    } ${isSelected ? 'ring-2 ring-yellow-400 border-transparent' : ''}`}
                    style={{
                      backgroundColor: rarityStyle ? rarityStyle.bg : undefined,
                      borderColor: rarityStyle ? rarityStyle.border : undefined,
                    }}
                  >
                    {item ? (
                      <span className="text-lg select-none">{item.icon}</span>
                    ) : (
                      <span className="text-[9px] text-gray-700 font-mono select-none">{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Item Inspect & Action Card */}
        {selectedItem?.item && (
          <div className="bg-black/60 p-3.5 rounded-lg border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl border"
                style={{
                  backgroundColor: RARITY_COLORS[selectedItem.item.rarity].bg,
                  borderColor: RARITY_COLORS[selectedItem.item.rarity].border,
                }}
              >
                {selectedItem.item.icon}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span
                    className="font-bold text-xs"
                    style={{ color: RARITY_COLORS[selectedItem.item.rarity].text }}
                  >
                    {selectedItem.item.name}
                  </span>
                  <span
                    className="text-[9px] font-mono font-bold uppercase px-1 py-0.2 rounded border"
                    style={{
                      borderColor: RARITY_COLORS[selectedItem.item.rarity].border,
                      color: RARITY_COLORS[selectedItem.item.rarity].text,
                    }}
                  >
                    {selectedItem.item.rarity}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-gray-400">
                  {selectedItem.item.slot.toUpperCase()} • Req Lv. {selectedItem.item.levelReq}
                </div>
                {/* Stats */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono font-semibold text-green-400 mt-0.5">
                  {selectedItem.item.stats.attack && <span>+{selectedItem.item.stats.attack} ATK</span>}
                  {selectedItem.item.stats.defense && <span>+{selectedItem.item.stats.defense} ARM</span>}
                  {selectedItem.item.stats.maxHp && <span>+{selectedItem.item.stats.maxHp} HP</span>}
                  {selectedItem.item.stats.maxMp && <span>+{selectedItem.item.stats.maxMp} MP</span>}
                  {selectedItem.item.stats.critChance && (
                    <span>+{(selectedItem.item.stats.critChance * 100).toFixed(0)}% Crit</span>
                  )}
                  {selectedItem.item.stats.moveSpeed && (
                    <span>+{selectedItem.item.stats.moveSpeed} Spd</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {selectedItem.isEquipped && selectedItem.slot ? (
                <button
                  onClick={() => {
                    onUnequipItem(selectedItem.slot!);
                    setSelectedItem(null);
                  }}
                  className="px-3 py-1.5 rounded bg-black/40 hover:bg-white/10 text-gray-200 font-mono font-bold text-xs transition-colors border border-white/20"
                >
                  Unequip
                </button>
              ) : selectedItem.index !== undefined ? (
                <>
                  <button
                    onClick={() => {
                      onEquipItem(selectedItem.item, selectedItem.index!);
                      setSelectedItem(null);
                    }}
                    className="px-3.5 py-1.5 rounded bg-white/15 hover:bg-white/25 text-white font-mono font-bold text-xs transition-all border border-white/20"
                  >
                    Equip
                  </button>
                  <button
                    onClick={() => {
                      onSellItem(selectedItem.index!);
                      setSelectedItem(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 font-mono font-bold text-xs border border-yellow-500/30 transition-colors"
                  >
                    <Coins className="w-3 h-3" />
                    <span>Sell (+{selectedItem.item.sellValue}g)</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EquipSlotCard: React.FC<{
  slot: ItemSlot;
  item?: Item;
  icon: string;
  onSelect: () => void;
  isSelected?: boolean;
}> = ({ slot, item, icon, onSelect, isSelected }) => {
  const rarityStyle = item ? RARITY_COLORS[item.rarity] : null;

  return (
    <div
      onClick={onSelect}
      className={`relative w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer border transition-all ${
        item ? 'hover:scale-105 hover:border-amber-400' : 'bg-slate-900 border-slate-800 text-slate-600'
      } ${isSelected ? 'ring-2 ring-amber-400' : ''}`}
      style={{
        backgroundColor: rarityStyle ? rarityStyle.bg : undefined,
        borderColor: rarityStyle ? rarityStyle.border : undefined,
      }}
      title={item ? `${item.name} (${item.rarity})` : `${slot.toUpperCase()} Slot`}
    >
      <span className="text-xl">{item ? item.icon : icon}</span>
      {!item && (
        <span className="absolute bottom-0.5 text-[8px] font-bold text-slate-600 uppercase">
          {slot.slice(0, 3)}
        </span>
      )}
    </div>
  );
};
