import { Item, ItemRarity, ItemSlot, CharacterClassType } from '../types/game';

export const RARITY_COLORS: Record<ItemRarity, { text: string; bg: string; border: string; glow: string }> = {
  common: { text: '#94a3b8', bg: '#1e293b', border: '#475569', glow: 'rgba(148, 163, 184, 0.2)' },
  magic: { text: '#38bdf8', bg: '#082f49', border: '#0284c7', glow: 'rgba(56, 189, 248, 0.4)' },
  rare: { text: '#c084fc', bg: '#3b0764', border: '#9333ea', glow: 'rgba(192, 132, 252, 0.4)' },
  epic: { text: '#f472b6', bg: '#500724', border: '#db2777', glow: 'rgba(244, 114, 182, 0.5)' },
  legendary: { text: '#fbbf24', bg: '#451a03', border: '#d97706', glow: 'rgba(251, 191, 36, 0.6)' },
  mythic: { text: '#f43f5e', bg: '#4c0519', border: '#e11d48', glow: 'rgba(244, 63, 94, 0.7)' },
};

const ITEM_NAMES: Record<ItemSlot, string[]> = {
  weapon: ['Blade', 'Broadsword', 'Spellstaff', 'Recurve Bow', 'Warhammer', 'Scythe', 'Dagger'],
  offhand: ['Kite Shield', 'Arcane Tome', 'Quiver of Speed', 'Holy Relic', 'Buckler'],
  helmet: ['Iron Greathelm', 'Shadow Hood', 'Crown of Embers', 'Dragon Crest', 'Wizard Hat'],
  armor: ['Steel Plate', 'Robe of the Archmage', 'Leather Jerkin', 'Sunforged Cuirass'],
  boots: ['Boots of Haste', 'Heavy Greaves', 'Treads of the Wind', 'Arcane Slippers'],
  ring: ['Band of Fortitude', 'Ring of Destruction', 'Signet of the Phoenix', 'Ring of Vitality'],
  amulet: ['Amulet of the Stars', 'Heart of the Titan', 'Talisman of Swiftness', 'Eye of the Storm'],
};

const ICONS: Record<ItemSlot, string> = {
  weapon: '🗡️',
  offhand: '🛡️',
  helmet: '👑',
  armor: '🥋',
  boots: '👢',
  ring: '💍',
  amulet: '📿',
};

const AFFIXES = [
  { suffix: 'of Might', stat: 'attack', mult: 1.3 },
  { suffix: 'of the Titan', stat: 'maxHp', mult: 1.4 },
  { suffix: 'of Celerity', stat: 'moveSpeed', mult: 0.3 },
  { suffix: 'of Precision', stat: 'critChance', mult: 0.05 },
  { suffix: 'of Iron', stat: 'defense', mult: 1.3 },
  { suffix: 'of Wisdom', stat: 'maxMp', mult: 1.4 },
];

export function generateLootItem(level: number, forceRarity?: ItemRarity): Item {
  const slots: ItemSlot[] = ['weapon', 'offhand', 'helmet', 'armor', 'boots', 'ring', 'amulet'];
  const slot = slots[Math.floor(Math.random() * slots.length)];

  // Determine rarity
  let rarity: ItemRarity = 'common';
  if (forceRarity) {
    rarity = forceRarity;
  } else {
    const roll = Math.random();
    if (roll < 0.03) rarity = 'mythic';
    else if (roll < 0.10) rarity = 'legendary';
    else if (roll < 0.25) rarity = 'epic';
    else if (roll < 0.50) rarity = 'rare';
    else if (roll < 0.75) rarity = 'magic';
    else rarity = 'common';
  }

  const rarityMult = {
    common: 1.0,
    magic: 1.3,
    rare: 1.6,
    epic: 2.1,
    legendary: 2.8,
    mythic: 3.8,
  }[rarity];

  const baseNames = ITEM_NAMES[slot];
  const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
  const affix = AFFIXES[Math.floor(Math.random() * AFFIXES.length)];

  const fullName = `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${baseName} ${affix.suffix}`;

  const stats: Item['stats'] = {};
  const baseScale = Math.max(1, level);

  if (slot === 'weapon') {
    stats.attack = Math.round((12 + baseScale * 5) * rarityMult);
    if (rarity !== 'common') stats.critChance = Number((0.04 * rarityMult).toFixed(2));
  } else if (slot === 'offhand' || slot === 'armor' || slot === 'helmet') {
    stats.defense = Math.round((8 + baseScale * 3) * rarityMult);
    stats.maxHp = Math.round((25 + baseScale * 12) * rarityMult);
  } else if (slot === 'boots') {
    stats.moveSpeed = Number((0.3 + 0.1 * rarityMult).toFixed(2));
    stats.maxHp = Math.round((15 + baseScale * 8) * rarityMult);
  } else {
    // ring / amulet
    stats.maxHp = Math.round((20 + baseScale * 10) * rarityMult);
    stats.maxMp = Math.round((15 + baseScale * 8) * rarityMult);
    stats.attack = Math.round((4 + baseScale * 2) * rarityMult);
  }

  const sellValue = Math.round(15 * level * rarityMult);

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: fullName,
    slot,
    rarity,
    levelReq: Math.max(1, level),
    icon: ICONS[slot],
    description: `A forged ${rarity} equipment imbued with ancient energies.`,
    stats,
    sellValue,
    glowColor: RARITY_COLORS[rarity].text,
  };
}

export function getStarterGear(classType: CharacterClassType): Partial<Record<ItemSlot, Item>> {
  const weaponName = {
    warrior: 'Recruit Broadsword',
    mage: 'Apprentice Wand',
    ranger: 'Huntsman Bow',
    paladin: 'Knight Mace',
  }[classType];

  return {
    weapon: {
      id: 'starter-wep',
      name: weaponName,
      slot: 'weapon',
      rarity: 'common',
      levelReq: 1,
      icon: '🗡️',
      description: 'Standard issue starting weapon.',
      stats: { attack: 14, critChance: 0.05 },
      sellValue: 10,
    },
    armor: {
      id: 'starter-armor',
      name: 'Padded Tunic',
      slot: 'armor',
      rarity: 'common',
      levelReq: 1,
      icon: '🥋',
      description: 'Simple protective cloth.',
      stats: { defense: 6, maxHp: 30 },
      sellValue: 10,
    },
    boots: {
      id: 'starter-boots',
      name: 'Traveler Boots',
      slot: 'boots',
      rarity: 'common',
      levelReq: 1,
      icon: '👢',
      description: 'Comfortable road boots.',
      stats: { moveSpeed: 0.2, maxHp: 15 },
      sellValue: 10,
    },
  };
}
