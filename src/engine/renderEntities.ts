import { Entity } from '../types/game';

/**
 * Draws detailed, animated humanoid characters (Player and Bots)
 */
export function drawDetailedHumanoid(
  ctx: CanvasRenderingContext2D,
  color: string,
  classType: string,
  time: number,
  isMoving: boolean = false,
  isMainPlayer: boolean = false
) {
  // Walking bob cycle
  const walkBob = isMoving ? Math.sin(time * 12) * 2 : 0;
  const capeWave = Math.sin(time * 8) * 3;

  // 1. Flowing Cloak / Cape
  ctx.save();
  ctx.translate(-8, walkBob);
  const capeColor = classType === 'paladin' ? '#f59e0b' : classType === 'mage' ? '#3b0764' : '#991b1b';
  ctx.fillStyle = capeColor;
  ctx.beginPath();
  ctx.moveTo(-4, -12);
  ctx.lineTo(-14 + capeWave, -14);
  ctx.lineTo(-18 + capeWave * 1.5, 0);
  ctx.lineTo(-14 + capeWave, 14);
  ctx.lineTo(-4, 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // 2. Main Torso / Armor Body
  ctx.fillStyle = '#0f172a'; // Under-suit
  ctx.beginPath();
  ctx.arc(0, walkBob, 17, 0, Math.PI * 2);
  ctx.fill();

  // Cuirass Plate / Robe Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, walkBob, 15, 0, Math.PI * 2);
  ctx.fill();

  // Armor Chestplate Trim / Embroidery
  ctx.strokeStyle = classType === 'paladin' ? '#fde047' : '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(2, walkBob, 11, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();

  // 3. Heavy Shoulder Pauldrons
  ctx.fillStyle = classType === 'mage' ? '#4c1d95' : '#475569';
  ctx.strokeStyle = classType === 'paladin' ? '#fde047' : '#94a3b8';
  ctx.lineWidth = 1.5;

  // Left Pauldron
  ctx.beginPath();
  ctx.arc(2, -14 + walkBob, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Pauldron
  ctx.beginPath();
  ctx.arc(2, 14 + walkBob, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Class-Specific Weapons & Off-hands
  if (classType === 'warrior' || classType === 'paladin') {
    const isPaladin = classType === 'paladin';

    // Off-hand Shield
    ctx.save();
    ctx.translate(4, -18 + walkBob);
    ctx.fillStyle = isPaladin ? '#1e3a8a' : '#334155';
    ctx.strokeStyle = isPaladin ? '#fde047' : '#cbd5e1';
    ctx.lineWidth = 2;
    // Kite / Heater Shield Shape
    ctx.beginPath();
    ctx.moveTo(8, -6);
    ctx.lineTo(8, 6);
    ctx.lineTo(-4, 9);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-4, -9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shield Emblem (Cross / Lion)
    ctx.fillStyle = isPaladin ? '#fde047' : '#ef4444';
    ctx.fillRect(0, -2, 6, 4);
    ctx.fillRect(2, -5, 2, 10);
    ctx.restore();

    // Main-hand Weapon (Two-handed broadsword or Holy Warhammer)
    ctx.save();
    ctx.translate(10, 14 + walkBob);
    if (isPaladin) {
      // Golden Holy Warhammer
      ctx.fillStyle = '#78350f'; // Handle
      ctx.fillRect(0, -2, 18, 4);
      ctx.fillStyle = '#fbbf24'; // Hammer head
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.fillRect(14, -8, 10, 16);
      ctx.strokeRect(14, -8, 10, 16);
    } else {
      // Steel Broadsword with glowing runic fuller
      ctx.fillStyle = '#475569'; // Crossguard
      ctx.fillRect(0, -6, 4, 12);
      ctx.fillStyle = '#cbd5e1'; // Blade
      ctx.beginPath();
      ctx.moveTo(4, -3);
      ctx.lineTo(26, -2);
      ctx.lineTo(30, 0);
      ctx.lineTo(26, 2);
      ctx.lineTo(4, 3);
      ctx.closePath();
      ctx.fill();
      // Glowing fuller rune
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(22, 0);
      ctx.stroke();
    }
    ctx.restore();

  } else if (classType === 'mage') {
    // Arcane Staff with Swirling Elemental Crystal Orb
    ctx.save();
    ctx.translate(8, 14 + walkBob);
    // Wooden / Mithril Staff Shaft
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-4, -2, 26, 4);

    // Ornate Golden Head Piece
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(24, 0, 7, 0, Math.PI * 2);
    ctx.stroke();

    // Swirling Glowing Arcane Crystal Orb
    const orbHover = Math.sin(time * 6) * 1.5;
    const orbGrad = ctx.createRadialGradient(24, orbHover, 1, 24, orbHover, 6);
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(0.5, '#c084fc');
    orbGrad.addColorStop(1, '#7e22ce');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(24, orbHover, 5, 0, Math.PI * 2);
    ctx.fill();

    // Revolving Magic Ring Motes
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(24, orbHover, 9, 3, time * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Off-hand Floating Spellbook / Arcane Focus
    ctx.save();
    const bookFloat = Math.sin(time * 4) * 2;
    ctx.translate(2, -18 + walkBob + bookFloat);
    ctx.fillStyle = '#581c87';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.fillRect(-5, -4, 10, 8);
    ctx.strokeRect(-5, -4, 10, 8);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-2, -3, 4, 6);
    ctx.restore();

  } else {
    // Ranger: Composite Recurve Bow + Quiver on Back
    // Quiver with arrows
    ctx.save();
    ctx.translate(-8, -8 + walkBob);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-3, -8, 6, 16);
    // Feather fletching
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-2, -12, 4, 4);
    ctx.fillRect(-2, 8, 4, 4);
    ctx.restore();

    // Recurve Longbow
    ctx.save();
    ctx.translate(10, 0 + walkBob);
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 16, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // Bowstring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(-Math.PI * 0.45) * 16, Math.sin(-Math.PI * 0.45) * 16);
    ctx.lineTo(0, 0);
    ctx.lineTo(Math.cos(Math.PI * 0.45) * 16, Math.sin(Math.PI * 0.45) * 16);
    ctx.stroke();
    ctx.restore();
  }

  // 5. Head, Helmet & Hood
  ctx.save();
  ctx.translate(3, walkBob);
  if (classType === 'warrior' || classType === 'paladin') {
    // Knight Greathelm
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
    ctx.fill();

    // Golden / Steel Visor Eyeglass Slit
    ctx.fillStyle = classType === 'paladin' ? '#fde047' : '#38bdf8';
    ctx.fillRect(4, -3, 5, 6);

    // Helmet Crest / Wing Plume
    ctx.fillStyle = classType === 'paladin' ? '#fbbf24' : '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fill();
  } else if (classType === 'mage') {
    // Wizard Hood with Shadow Void & Glowing Arcane Eyes
    ctx.fillStyle = '#2e1065';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Shadow face mask
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(2, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Cyan Eyes
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(5, -2.5, 1.8, 0, Math.PI * 2);
    ctx.arc(5, 2.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Ranger Hood & Feathers
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
    ctx.fill();

    // Scout eyes
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(5, -2.5, 1.5, 0, Math.PI * 2);
    ctx.arc(5, 2.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Holy Paladin Radiant Aura Ring
  if (classType === 'paladin') {
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * Draws detailed, expressive monsters based on their name & type
 */
export function drawDetailedMonster(ctx: CanvasRenderingContext2D, entity: Entity, time: number) {
  const name = entity.name.toLowerCase();

  if (name.includes('slime')) {
    // Gelatinous Slime with Wobble & Specular Glow
    const wobbleX = Math.sin(time * 8 + entity.x) * 2.5;
    const wobbleY = Math.cos(time * 8 + entity.x) * 2;

    // Translucent Jelly Body
    const slimeGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, entity.radius);
    slimeGrad.addColorStop(0, '#86efac');
    slimeGrad.addColorStop(0.7, '#22c55e');
    slimeGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = slimeGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, entity.radius + wobbleX, entity.radius - wobbleY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Floating Core Nucleus
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.arc(wobbleX * 0.5, wobbleY * 0.5, entity.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(entity.radius * 0.4, -entity.radius * 0.25, 3, 0, Math.PI * 2);
    ctx.arc(entity.radius * 0.4, entity.radius * 0.25, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(entity.radius * 0.45, -entity.radius * 0.3, 1.2, 0, Math.PI * 2);
    ctx.arc(entity.radius * 0.45, entity.radius * 0.2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Specular Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(-entity.radius * 0.3, -entity.radius * 0.3, entity.radius * 0.35, entity.radius * 0.15, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

  } else if (name.includes('wolf')) {
    // Timber Wolf Beast
    ctx.fillStyle = '#57534e';
    ctx.beginPath();
    ctx.ellipse(0, 0, entity.radius * 1.1, entity.radius * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head and Snout
    ctx.fillStyle = '#44403c';
    ctx.beginPath();
    ctx.arc(entity.radius * 0.7, 0, entity.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Pointed Wolf Ears
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.moveTo(entity.radius * 0.5, -entity.radius * 0.5);
    ctx.lineTo(entity.radius * 0.8, -entity.radius * 0.9);
    ctx.lineTo(entity.radius * 0.9, -entity.radius * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(entity.radius * 0.5, entity.radius * 0.5);
    ctx.lineTo(entity.radius * 0.8, entity.radius * 0.9);
    ctx.lineTo(entity.radius * 0.9, entity.radius * 0.4);
    ctx.closePath();
    ctx.fill();

    // Glowing Amber Eyes
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(entity.radius * 0.85, -entity.radius * 0.2, 2.5, 0, Math.PI * 2);
    ctx.arc(entity.radius * 0.85, entity.radius * 0.2, 2.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (name.includes('skelet')) {
    // Skeletal Knight
    // Bone Ribcage
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, 0, entity.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-entity.radius * 0.4, -entity.radius * 0.3, entity.radius * 0.8, 3);
    ctx.fillRect(-entity.radius * 0.4, 0, entity.radius * 0.8, 3);
    ctx.fillRect(-entity.radius * 0.4, entity.radius * 0.3, entity.radius * 0.8, 3);

    // Bone Skull
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(entity.radius * 0.5, 0, entity.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Blue Soul-flame Eye Sockets
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(entity.radius * 0.65, -entity.radius * 0.2, 2.5, 0, Math.PI * 2);
    ctx.arc(entity.radius * 0.65, entity.radius * 0.2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Rusted Jagged Sword
    ctx.fillStyle = '#64748b';
    ctx.fillRect(entity.radius * 0.5, entity.radius * 0.6, entity.radius * 1.2, 4);

  } else if (name.includes('necro')) {
    // Dark Necromancer
    // Tattered Dark Shadow Robes
    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.arc(0, 0, entity.radius, 0, Math.PI * 2);
    ctx.fill();

    // Ragged Cloak Hem
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(-entity.radius * 0.3, 0, entity.radius * 0.8, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fill();

    // Skull Face Mask & Glowing Purple Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(entity.radius * 0.3, 0, entity.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(entity.radius * 0.5, -entity.radius * 0.2, 2.8, 0, Math.PI * 2);
    ctx.arc(entity.radius * 0.5, entity.radius * 0.2, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Shadow Skull Staff
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(entity.radius * 0.2, entity.radius * 0.6, entity.radius * 1.4, 4);

  } else if (name.includes('drake')) {
    // Fire Drake / Wyvern
    // Flapping Wings
    const wingFlap = Math.sin(time * 10) * 0.4;
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(0, -entity.radius * 0.4);
    ctx.lineTo(entity.radius * 0.2, -entity.radius * (1.6 + wingFlap));
    ctx.lineTo(-entity.radius * 0.8, -entity.radius * (1.2 + wingFlap));
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, entity.radius * 0.4);
    ctx.lineTo(entity.radius * 0.2, entity.radius * (1.6 + wingFlap));
    ctx.lineTo(-entity.radius * 0.8, entity.radius * (1.2 + wingFlap));
    ctx.closePath();
    ctx.fill();

    // Drake Dragon Body
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(0, 0, entity.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Horned Snout
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.moveTo(entity.radius * 0.4, -entity.radius * 0.4);
    ctx.lineTo(entity.radius * 1.2, 0);
    ctx.lineTo(entity.radius * 0.4, entity.radius * 0.4);
    ctx.closePath();
    ctx.fill();

    // Fiery Eyes
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(entity.radius * 0.7, -entity.radius * 0.2, 2.5, 0, Math.PI * 2);
    ctx.arc(entity.radius * 0.7, entity.radius * 0.2, 2.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (name.includes('colossus') || name.includes('magma')) {
    // Magma Colossus (Segmented Basalt Golem)
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, 0, entity.radius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Fiery Molten Veins
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-entity.radius * 0.5, -entity.radius * 0.3);
    ctx.lineTo(entity.radius * 0.2, 0);
    ctx.lineTo(-entity.radius * 0.4, entity.radius * 0.4);
    ctx.stroke();

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Molten Glowing Eyes
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(entity.radius * 0.5, -entity.radius * 0.25, 4, 0, Math.PI * 2);
    ctx.arc(entity.radius * 0.5, entity.radius * 0.25, 4, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // Outlaw Gladiator or Default Mob
    ctx.fillStyle = entity.color;
    ctx.beginPath();
    ctx.arc(0, 0, entity.radius, 0, Math.PI * 2);
    ctx.fill();

    // Iron executioner mask
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(entity.radius * 0.2, -entity.radius * 0.4, entity.radius * 0.6, entity.radius * 0.8);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(entity.radius * 0.5, -entity.radius * 0.2, 2.5, 0, Math.PI * 2);
    ctx.arc(entity.radius * 0.5, entity.radius * 0.2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws majestic, multi-layered World Boss models
 */
export function drawDetailedBoss(ctx: CanvasRenderingContext2D, boss: Entity, time: number) {
  const name = boss.name.toLowerCase();

  // Pulsing Boss Threat Aura on Ground
  const auraPulse = Math.sin(time * 3) * 6;
  const threatGrad = ctx.createRadialGradient(0, 0, boss.radius * 0.8, 0, 0, boss.radius * 1.5 + auraPulse);
  threatGrad.addColorStop(0, boss.color + '55');
  threatGrad.addColorStop(1, boss.color + '00');
  ctx.fillStyle = threatGrad;
  ctx.beginPath();
  ctx.arc(0, 0, boss.radius * 1.5 + auraPulse, 0, Math.PI * 2);
  ctx.fill();

  if (name.includes('mossbeast')) {
    // 1. Elder Mossbeast (Forest Ancient Treant Titan)
    // Giant rocky mossy bark body
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
    ctx.fill();

    // Stone plates on shoulders
    ctx.fillStyle = '#3f3f46';
    ctx.beginPath();
    ctx.arc(0, -boss.radius * 0.5, boss.radius * 0.45, 0, Math.PI * 2);
    ctx.arc(0, boss.radius * 0.5, boss.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Giant Wooden Antler Horns
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(boss.radius * 0.4, -boss.radius * 0.5);
    ctx.lineTo(boss.radius * 1.3, -boss.radius * 1.2);
    ctx.lineTo(boss.radius * 0.7, -boss.radius * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(boss.radius * 0.4, boss.radius * 0.5);
    ctx.lineTo(boss.radius * 1.3, boss.radius * 1.2);
    ctx.lineTo(boss.radius * 0.7, boss.radius * 0.3);
    ctx.closePath();
    ctx.fill();

    // Glowing Ancient Emerald Runes
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, boss.radius * 0.6, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();

    // Piercing Green Eyes
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(boss.radius * 0.5, -boss.radius * 0.25, 5.5, 0, Math.PI * 2);
    ctx.arc(boss.radius * 0.5, boss.radius * 0.25, 5.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (name.includes('malakar') || name.includes('lich')) {
    // 2. Lich King Malakar (Archlich of the Crypts)
    // Levitation sway
    const leviY = Math.sin(time * 3) * 3;

    // Tattered Dark Astral Robes
    ctx.fillStyle = '#2e1065';
    ctx.beginPath();
    ctx.arc(0, leviY, boss.radius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Bone Crown
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(boss.radius * 0.3, -boss.radius * 0.6 + leviY);
    ctx.lineTo(boss.radius * 0.8, -boss.radius * 0.8 + leviY);
    ctx.lineTo(boss.radius * 0.6, 0 + leviY);
    ctx.lineTo(boss.radius * 0.8, boss.radius * 0.8 + leviY);
    ctx.lineTo(boss.radius * 0.3, boss.radius * 0.6 + leviY);
    ctx.closePath();
    ctx.fill();

    // Skull Face with Burning Void Flames
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(boss.radius * 0.4, leviY, boss.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(boss.radius * 0.55, -boss.radius * 0.2 + leviY, 5, 0, Math.PI * 2);
    ctx.arc(boss.radius * 0.55, boss.radius * 0.2 + leviY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Revolving Spectral Skull Array
    for (let i = 0; i < 3; i++) {
      const orbAngle = time * 2 + (i / 3) * Math.PI * 2;
      const ox = Math.cos(orbAngle) * (boss.radius * 1.35);
      const oy = Math.sin(orbAngle) * (boss.radius * 1.35) + leviY;
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(ox, oy, 7, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (name.includes('ignis')) {
    // 3. Ignis the World Scourge (Molten Titan Demon)
    // Giant Flaming Wings
    const wingAngle = Math.sin(time * 6) * 0.3;
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(0, -boss.radius * 0.5);
    ctx.lineTo(boss.radius * 0.4, -boss.radius * (1.8 + wingAngle));
    ctx.lineTo(-boss.radius * 1.1, -boss.radius * (1.3 + wingAngle));
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, boss.radius * 0.5);
    ctx.lineTo(boss.radius * 0.4, boss.radius * (1.8 + wingAngle));
    ctx.lineTo(-boss.radius * 1.1, boss.radius * (1.3 + wingAngle));
    ctx.closePath();
    ctx.fill();

    // Obsidian Demon Body
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
    ctx.fill();

    // Giant Curved Obsidian Horns
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.moveTo(boss.radius * 0.5, -boss.radius * 0.6);
    ctx.lineTo(boss.radius * 1.5, -boss.radius * 1.1);
    ctx.lineTo(boss.radius * 0.8, -boss.radius * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(boss.radius * 0.5, boss.radius * 0.6);
    ctx.lineTo(boss.radius * 1.5, boss.radius * 1.1);
    ctx.lineTo(boss.radius * 0.8, boss.radius * 0.3);
    ctx.closePath();
    ctx.fill();

    // Blazing Core Chest
    const magmaCore = ctx.createRadialGradient(boss.radius * 0.2, 0, 2, boss.radius * 0.2, 0, boss.radius * 0.6);
    magmaCore.addColorStop(0, '#fef08a');
    magmaCore.addColorStop(0.5, '#ea580c');
    magmaCore.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = magmaCore;
    ctx.beginPath();
    ctx.arc(boss.radius * 0.2, 0, boss.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Blazing Eyes
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(boss.radius * 0.65, -boss.radius * 0.25, 6, 0, Math.PI * 2);
    ctx.arc(boss.radius * 0.65, boss.radius * 0.25, 6, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // 4. Warlord Bloodfang (Arena Conqueror)
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
    ctx.fill();

    // Dragonplate Spikes
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(boss.radius * 0.2, -boss.radius * 0.6, boss.radius * 0.4, 0, Math.PI * 2);
    ctx.arc(boss.radius * 0.2, boss.radius * 0.6, boss.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Dual Massive Cleavers
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(boss.radius * 0.4, -boss.radius * 0.9, boss.radius * 1.2, 10);
    ctx.fillRect(boss.radius * 0.4, boss.radius * 0.8, boss.radius * 1.2, 10);

    // Glowing Blood Eyes
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(boss.radius * 0.6, -boss.radius * 0.25, 5.5, 0, Math.PI * 2);
    ctx.arc(boss.radius * 0.6, boss.radius * 0.25, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws stylized overhead UI (Name, Level, Guild badge, Metallic Health Bar, Cast Bar)
 */
export function drawDecoratedOverhead(
  ctx: CanvasRenderingContext2D,
  entity: Entity,
  isMainPlayer: boolean = false
) {
  const yOffset = entity.radius + 20;

  // Speech bubble if active
  if (entity.sayBubble) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    const textWidth = ctx.measureText(entity.sayBubble.text).width + 20;
    const bx = entity.x - textWidth / 2;
    const by = entity.y - yOffset - 42;

    ctx.beginPath();
    ctx.roundRect(bx, by, textWidth, 24, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(entity.sayBubble.text, entity.x, by + 12);
    ctx.restore();
  }

  // Name & Level Badge
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const nameColor = isMainPlayer
    ? '#38bdf8'
    : entity.isBoss
    ? '#fbbf24'
    : entity.type === 'bot'
    ? '#e2e8f0'
    : '#f87171';

  // Text shadow for crisp visibility
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 4;

  ctx.font = entity.isBoss
    ? "900 13px 'Cinzel', 'Outfit', sans-serif"
    : "bold 11px 'Outfit', sans-serif";
  ctx.fillStyle = nameColor;

  const prefix = entity.isBoss ? '👑 ' : entity.guildTag ? `[${entity.guildTag}] ` : '';
  const displayName = `${prefix}${entity.name} (Lv.${entity.level})`;
  ctx.fillText(displayName, entity.x, entity.y - yOffset);
  ctx.restore();

  // Metallic Health Bar
  const barWidth = entity.isBoss ? 110 : 48;
  const barHeight = entity.isBoss ? 8 : 6;
  const barX = entity.x - barWidth / 2;
  const barY = entity.y - yOffset + 7;
  const hpRatio = Math.max(0, Math.min(1, entity.hp / entity.maxHp));

  // Background Frame
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

  // Health fill gradient
  const hpColor = entity.isBoss
    ? '#dc2626'
    : isMainPlayer
    ? '#22c55e'
    : entity.type === 'bot'
    ? '#38bdf8'
    : '#ef4444';

  ctx.fillStyle = hpColor;
  ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

  // Specular top highlight on health bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(barX, barY, barWidth * hpRatio, Math.max(1, barHeight * 0.35));

  // Outer border
  ctx.strokeStyle = entity.isBoss ? '#f59e0b' : '#334155';
  ctx.lineWidth = entity.isBoss ? 1.5 : 1;
  ctx.strokeRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
}
