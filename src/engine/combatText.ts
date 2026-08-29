import { Entity, CharacterClassType } from '../types/game';
import { GameEngine } from './gameEngine';

export interface EntityHealthSnapshot {
  hp: number;
  maxHp: number;
  isDead: boolean;
  type: Entity['type'];
  name: string;
}

export const COMBAT_TEXT_COLORS = {
  playerDamage: '#ef4444', // Red for incoming damage to player
  playerHeal: '#22c55e', // Lush green for healing
  criticalHit: '#fbbf24', // Vibrant gold for critical strikes
  bossDamage: '#fb923c', // Amber-Orange for boss strikes
  warriorSlash: '#f87171', // Coral / Fury red
  mageArcane: '#c084fc', // Arcane purple
  mageFire: '#f97316', // Fire orange
  mageIce: '#38bdf8', // Frost cyan
  rangerPrecision: '#fde047', // Yellow precision
  paladinHoly: '#facc15', // Radiant gold
  standardDamage: '#f8fafc', // Clean crisp white / silver
  manaRegen: '#38bdf8', // Mana blue
};

/**
 * Determines the color and visual details for floating combat text numbers.
 */
export function getCombatTextDetails(
  target: Entity,
  amount: number,
  isCrit: boolean,
  playerClass?: CharacterClassType
): { color: string; size: number; text: string; isCrit: boolean } {
  // 1. Damage to the player is highlighted in crimson red
  if (target.type === 'player' || target.id === 'player') {
    return {
      color: COMBAT_TEXT_COLORS.playerDamage,
      size: 18,
      text: `-${amount}`,
      isCrit: false,
    };
  }

  // 2. Critical Hits on enemies are large and vibrant golden amber
  if (isCrit) {
    return {
      color: COMBAT_TEXT_COLORS.criticalHit,
      size: target.isBoss ? 26 : 22,
      text: `💥 ${amount}`,
      isCrit: true,
    };
  }

  // 3. Boss hits get distinctive amber-orange styling
  if (target.isBoss || target.type === 'boss') {
    return {
      color: COMBAT_TEXT_COLORS.bossDamage,
      size: 20,
      text: `${amount}`,
      isCrit: false,
    };
  }

  // 4. Color-coded based on attacking class archetype / elemental nature
  let color = COMBAT_TEXT_COLORS.standardDamage;
  if (playerClass === 'mage') {
    color = COMBAT_TEXT_COLORS.mageArcane;
  } else if (playerClass === 'ranger') {
    color = COMBAT_TEXT_COLORS.rangerPrecision;
  } else if (playerClass === 'paladin') {
    color = COMBAT_TEXT_COLORS.paladinHoly;
  } else if (playerClass === 'warrior') {
    color = COMBAT_TEXT_COLORS.warriorSlash;
  }

  return {
    color,
    size: 16,
    text: `${amount}`,
    isCrit: false,
  };
}

/**
 * Tracks entity health changes across all entities in the game engine loop
 * and dispatches floating, color-coded combat text numbers directly above attacked targets.
 */
export function trackEntityHealthChanges(
  engine: GameEngine,
  prevHealthMap: Map<string, EntityHealthSnapshot>
): void {
  const allEntities: Entity[] = [engine.player, ...Array.from(engine.entities.values())];
  const activeIds = new Set<string>();

  for (let i = 0; i < allEntities.length; i++) {
    const entity = allEntities[i];
    activeIds.add(entity.id);

    const prev = prevHealthMap.get(entity.id);

    if (prev) {
      // If neither state is dead, check for health reduction (attack/damage) or increase (heal)
      if (!entity.isDead && !prev.isDead) {
        const hpDelta = prev.hp - entity.hp;

        if (hpDelta > 0) {
          // Entity took damage!
          const damageAmount = Math.round(hpDelta);
          const isCrit =
            Boolean(entity.lastHitCrit) ||
            damageAmount >= 50 ||
            (entity.maxHp > 0 && damageAmount / entity.maxHp >= 0.28);

          const { color, size, text, isCrit: finalCrit } = getCombatTextDetails(
            entity,
            damageAmount,
            isCrit,
            engine.player.classType
          );

          // Use custom hit color if set by spell, otherwise resolved color
          const finalColor = entity.lastHitColor || color;

          // Spread floating numbers slightly so overlapping rapid hits remain clearly readable
          const offsetX = (Math.random() - 0.5) * (Math.max(16, entity.radius) * 0.9);
          const offsetY = -(entity.radius + 14 + Math.random() * 8);
          const vx = (Math.random() - 0.5) * 1.6;
          const vy = finalCrit ? -2.8 : -2.0;

          engine.addFloatingText(
            entity.x + offsetX,
            entity.y + offsetY,
            text,
            finalColor,
            size,
            finalCrit,
            vx,
            vy,
            finalCrit ? 'crit' : 'damage'
          );

          // Clear transient entity flags
          entity.lastHitCrit = undefined;
          entity.lastHitColor = undefined;
        } else if (hpDelta < 0) {
          // Entity was healed / regenerated
          const healAmount = Math.round(Math.abs(hpDelta));
          // Only show floating text for notable heals (ignore 1-3 baseline passive ticks to prevent spam)
          if (healAmount >= 8 && healAmount < prev.maxHp * 0.9) {
            const offsetX = (Math.random() - 0.5) * 12;
            const offsetY = -(entity.radius + 12);
            engine.addFloatingText(
              entity.x + offsetX,
              entity.y + offsetY,
              `+${healAmount} HP`,
              COMBAT_TEXT_COLORS.playerHeal,
              15,
              false,
              (Math.random() - 0.5) * 0.6,
              -1.6,
              'heal'
            );
          }
        }
      }

      // Update stored snapshot
      prev.hp = entity.hp;
      prev.maxHp = entity.maxHp;
      prev.isDead = entity.isDead;
      prev.type = entity.type;
      prev.name = entity.name;
    } else {
      // First time encountering entity: store baseline snapshot
      prevHealthMap.set(entity.id, {
        hp: entity.hp,
        maxHp: entity.maxHp,
        isDead: entity.isDead,
        type: entity.type,
        name: entity.name,
      });
    }
  }

  // Clean up despawned entities
  if (prevHealthMap.size > allEntities.length + 10) {
    for (const id of prevHealthMap.keys()) {
      if (!activeIds.has(id)) {
        prevHealthMap.delete(id);
      }
    }
  }
}
