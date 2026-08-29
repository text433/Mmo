import { GameEngine } from './gameEngine';
import { ZONES, WORLD_WIDTH, WORLD_HEIGHT, WORLD_SHRINES, WorldObstacle, WorldShrine } from './worldMap';

// Cache for procedural pattern canvases to ensure buttery 60 FPS performance
const patternCache: { [key: string]: CanvasPattern | null } = {};

/**
 * Creates procedural texture patterns for ground biomes
 */
function getOrCreatePattern(ctx: CanvasRenderingContext2D, type: string): CanvasPattern | null {
  if (patternCache[type] !== undefined) {
    return patternCache[type];
  }

  const pCanvas = document.createElement('canvas');
  const pCtx = pCanvas.getContext('2d');
  if (!pCtx) return null;

  if (type === 'sanctuary') {
    // Marble tiles with gold inlay borders
    pCanvas.width = 64;
    pCanvas.height = 64;
    pCtx.fillStyle = '#0f172a';
    pCtx.fillRect(0, 0, 64, 64);
    pCtx.fillStyle = '#1e293b';
    pCtx.fillRect(2, 2, 60, 60);
    pCtx.fillStyle = '#172554';
    pCtx.fillRect(8, 8, 48, 48);
    // Gold corner accents
    pCtx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    pCtx.lineWidth = 1;
    pCtx.strokeRect(4, 4, 56, 56);
    pCtx.fillStyle = 'rgba(251, 191, 36, 0.4)';
    pCtx.fillRect(2, 2, 4, 4);
    pCtx.fillRect(58, 2, 4, 4);
    pCtx.fillRect(2, 58, 4, 4);
    pCtx.fillRect(58, 58, 4, 4);
  } else if (type === 'forest') {
    // Lush multi-tone grass with flower motes
    pCanvas.width = 64;
    pCanvas.height = 64;
    pCtx.fillStyle = '#064e3b';
    pCtx.fillRect(0, 0, 64, 64);
    pCtx.fillStyle = '#065f46';
    pCtx.fillRect(4, 4, 28, 28);
    pCtx.fillRect(36, 36, 24, 24);
    // Grass tufts
    pCtx.fillStyle = '#10b981';
    pCtx.fillRect(12, 14, 2, 6);
    pCtx.fillRect(15, 12, 2, 8);
    pCtx.fillRect(44, 42, 2, 6);
    pCtx.fillRect(47, 40, 2, 8);
    // Tiny blue & yellow woodland flowers
    pCtx.fillStyle = '#38bdf8';
    pCtx.fillRect(24, 48, 3, 3);
    pCtx.fillStyle = '#fbbf24';
    pCtx.fillRect(52, 18, 3, 3);
  } else if (type === 'ruins') {
    // Ancient weathered stone crypt flagstones with purple veins
    pCanvas.width = 80;
    pCanvas.height = 80;
    pCtx.fillStyle = '#2e1065';
    pCtx.fillRect(0, 0, 80, 80);
    pCtx.fillStyle = '#3b0764';
    pCtx.fillRect(3, 3, 74, 74);
    pCtx.fillStyle = '#1e1b4b';
    pCtx.fillRect(10, 10, 60, 60);
    pCtx.strokeStyle = 'rgba(192, 132, 252, 0.2)';
    pCtx.lineWidth = 1;
    pCtx.beginPath();
    pCtx.moveTo(10, 10);
    pCtx.lineTo(70, 70);
    pCtx.stroke();
    // Glowing rune speck
    pCtx.fillStyle = '#a855f7';
    pCtx.fillRect(38, 38, 4, 4);
  } else if (type === 'inferno') {
    // Basalt rock plates with fiery molten veins
    pCanvas.width = 64;
    pCanvas.height = 64;
    pCtx.fillStyle = '#451a03';
    pCtx.fillRect(0, 0, 64, 64);
    pCtx.fillStyle = '#291102';
    pCtx.fillRect(3, 3, 58, 58);
    pCtx.fillStyle = '#1c0c02';
    pCtx.fillRect(8, 8, 48, 48);
    // Fiery magma crack
    pCtx.strokeStyle = '#ea580c';
    pCtx.lineWidth = 2;
    pCtx.beginPath();
    pCtx.moveTo(0, 32);
    pCtx.lineTo(24, 28);
    pCtx.lineTo(40, 36);
    pCtx.lineTo(64, 32);
    pCtx.stroke();
    pCtx.strokeStyle = '#fde047';
    pCtx.lineWidth = 1;
    pCtx.stroke();
  } else if (type === 'arena') {
    // Blood-stained colosseum sand
    pCanvas.width = 64;
    pCanvas.height = 64;
    pCtx.fillStyle = '#450a0a';
    pCtx.fillRect(0, 0, 64, 64);
    pCtx.fillStyle = '#3b0707';
    pCtx.fillRect(2, 2, 60, 60);
    pCtx.fillStyle = '#290606';
    pCtx.fillRect(10, 10, 44, 44);
    pCtx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
    pCtx.lineWidth = 1;
    pCtx.strokeRect(6, 6, 52, 52);
  } else if (type === 'road') {
    // Cobblestone paved walkway
    pCanvas.width = 32;
    pCanvas.height = 32;
    pCtx.fillStyle = '#334155';
    pCtx.fillRect(0, 0, 32, 32);
    pCtx.fillStyle = '#475569';
    pCtx.fillRect(2, 2, 12, 12);
    pCtx.fillRect(18, 2, 12, 12);
    pCtx.fillRect(2, 18, 12, 12);
    pCtx.fillRect(18, 18, 12, 12);
    pCtx.fillStyle = '#64748b';
    pCtx.fillRect(4, 4, 8, 8);
    pCtx.fillRect(20, 20, 8, 8);
  }

  const pattern = ctx.createPattern(pCanvas, 'repeat');
  patternCache[type] = pattern;
  return pattern;
}

/**
 * Draws ground terrain, biomes, paved cobblestone roads, and central sanctuary plaza
 */
export function drawDecoratedTerrain(ctx: CanvasRenderingContext2D, engine: GameEngine, canvasWidth: number, canvasHeight: number) {
  const time = performance.now() / 1000;

  // 1. Draw Biome Grounds with procedural patterns
  ZONES.forEach((zone) => {
    const pattern = getOrCreatePattern(ctx, zone.id);
    if (pattern) {
      ctx.fillStyle = pattern;
    } else {
      ctx.fillStyle = zone.bgColor;
    }
    ctx.fillRect(zone.bounds.x, zone.bounds.y, zone.bounds.width, zone.bounds.height);

    // Subtle atmospheric biome border glow
    ctx.strokeStyle = zone.color + '55';
    ctx.lineWidth = 6;
    ctx.strokeRect(zone.bounds.x, zone.bounds.y, zone.bounds.width, zone.bounds.height);
  });

  // 2. Draw Paved Cobblestone Roads connecting Sanctuary to all 4 zones
  const roadPattern = getOrCreatePattern(ctx, 'road');
  if (roadPattern) {
    ctx.fillStyle = roadPattern;
    // North Road to Forest & Crypts
    ctx.fillRect(2440, 200, 120, 1800);
    // South Road to Inferno & Arena
    ctx.fillRect(2440, 3000, 120, 1800);
    // West Road to Forest & Inferno
    ctx.fillRect(200, 2440, 1800, 120);
    // East Road to Crypts & Arena
    ctx.fillRect(3000, 2440, 1800, 120);

    // Road stone curbs
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    // North/South curbs
    ctx.strokeRect(2440, 200, 120, 1800);
    ctx.strokeRect(2440, 3000, 120, 1800);
    // West/East curbs
    ctx.strokeRect(200, 2440, 1800, 120);
    ctx.strokeRect(3000, 2440, 1800, 120);
  }

  // 3. Central Sanctuary Grand Plaza
  const cx = 2500;
  const cy = 2500;

  // Outer plaza stone ring
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 280, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner plaza gold runic circle
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 220, 0, Math.PI * 2);
  ctx.stroke();

  // Rotating Runic Sacred Array
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.2);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 90, Math.sin(angle) * 90);
    ctx.lineTo(Math.cos(angle) * 190, Math.sin(angle) * 190);
    ctx.stroke();
    // Rune node
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 190, Math.sin(angle) * 190, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. Healing Fountain with Animated Caustics & Multi-tier Basin
  const fountainGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 150);
  fountainGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
  fountainGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.3)');
  fountainGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = fountainGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 150, 0, Math.PI * 2);
  ctx.fill();

  // Outer Marble Basin
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 75, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Water Surface with Animated Ripple Rings
  const waterGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 65);
  waterGrad.addColorStop(0, '#7dd3fc');
  waterGrad.addColorStop(0.6, '#0284c7');
  waterGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = waterGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 68, 0, Math.PI * 2);
  ctx.fill();

  // Expanding Water Ripples
  for (let i = 0; i < 3; i++) {
    const ripplePhase = ((time * 0.8 + i * 0.33) % 1);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * (1 - ripplePhase)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 10 + ripplePhase * 55, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Center Fountain Core & Golden Angel Spire
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fill();

  // World Boundary Wall with decorative stone battlements
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
}

/**
 * Draws detailed, animated trees, stone pillars, torches, and crystals
 */
export function drawDecoratedObstacle(ctx: CanvasRenderingContext2D, obs: WorldObstacle, time: number) {
  // Ground Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(obs.x + 4, obs.y + obs.radius * 0.7, obs.radius * 1.15, obs.radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  if (obs.type === 'tree') {
    // Gentle canopy sway with wind
    const swayX = Math.sin(time * 1.5 + obs.x * 0.05) * 3;
    const swayY = Math.cos(time * 1.2 + obs.y * 0.05) * 1.5;

    // Tree Roots & Trunk
    ctx.fillStyle = '#3f1a04';
    ctx.beginPath();
    ctx.arc(obs.x, obs.y + obs.radius * 0.3, obs.radius * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // Bark highlight & roots
    ctx.strokeStyle = '#271003';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(obs.x - obs.radius * 0.3, obs.y + obs.radius * 0.4);
    ctx.lineTo(obs.x, obs.y + obs.radius * 0.2);
    ctx.lineTo(obs.x + obs.radius * 0.3, obs.y + obs.radius * 0.4);
    ctx.stroke();

    // Multi-layer lush canopy (Dark shadow layer -> Main green -> Specular highlight)
    const treeColor = obs.color || '#166534';

    // Layer 1 (Dark bottom shadow)
    ctx.fillStyle = '#052e16';
    ctx.beginPath();
    ctx.arc(obs.x + swayX * 0.5, obs.y - 4 + swayY * 0.5, obs.radius * 1.05, 0, Math.PI * 2);
    ctx.fill();

    // Layer 2 (Main lush foliage)
    ctx.fillStyle = treeColor;
    ctx.beginPath();
    ctx.arc(obs.x + swayX * 0.8, obs.y - 8 + swayY * 0.8, obs.radius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Layer 3 (High-canopy cluster highlights)
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(obs.x - obs.radius * 0.25 + swayX, obs.y - obs.radius * 0.35 + swayY, obs.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(obs.x + obs.radius * 0.2 + swayX, obs.y - obs.radius * 0.25 + swayY, obs.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

  } else if (obs.type === 'torch') {
    // Iron Torch Sconce Stand
    ctx.fillStyle = '#334155';
    ctx.fillRect(obs.x - 4, obs.y - 8, 8, 20);
    ctx.fillStyle = '#475569';
    ctx.fillRect(obs.x - 6, obs.y - 12, 12, 6);

    // Warm radial firelight glow on ground
    const flicker = Math.sin(time * 15 + obs.x) * 4;
    const lightRadius = 75 + flicker;
    const torchGrad = ctx.createRadialGradient(obs.x, obs.y - 14, 5, obs.x, obs.y - 14, lightRadius);
    torchGrad.addColorStop(0, 'rgba(251, 146, 60, 0.45)');
    torchGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.18)');
    torchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = torchGrad;
    ctx.beginPath();
    ctx.arc(obs.x, obs.y - 14, lightRadius, 0, Math.PI * 2);
    ctx.fill();

    // Multi-tier dancing flame
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(obs.x + flicker * 0.2, obs.y - 15, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(obs.x + flicker * 0.3, obs.y - 17, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(obs.x, obs.y - 18, 3.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (obs.type === 'ruin_pillar') {
    // Detailed 3D fluted stone column
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(obs.x, obs.y + obs.radius * 0.2, obs.radius, 0, Math.PI * 2);
    ctx.fill();

    // Column shaft
    ctx.fillStyle = '#475569';
    ctx.fillRect(obs.x - obs.radius * 0.7, obs.y - obs.radius * 0.9, obs.radius * 1.4, obs.radius * 1.2);

    // Fluting ridges
    ctx.fillStyle = '#64748b';
    ctx.fillRect(obs.x - obs.radius * 0.3, obs.y - obs.radius * 0.9, obs.radius * 0.6, obs.radius * 1.2);

    // Carved capital topper
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(obs.x, obs.y - obs.radius * 0.9, obs.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Glowing runic inscription on pillar
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(obs.x - 4, obs.y - 8);
    ctx.lineTo(obs.x + 4, obs.y - 2);
    ctx.lineTo(obs.x - 4, obs.y + 4);
    ctx.stroke();

  } else if (obs.type === 'crystal') {
    // Multi-faceted glowing crystal cluster
    const cColor = obs.color || '#ea580c';
    const hoverY = Math.sin(time * 3 + obs.x) * 3;

    // Glowing aura
    const cGrad = ctx.createRadialGradient(obs.x, obs.y, 4, obs.x, obs.y, obs.radius * 1.8);
    cGrad.addColorStop(0, cColor + '88');
    cGrad.addColorStop(1, cColor + '00');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.arc(obs.x, obs.y, obs.radius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Main Crystal Spire
    ctx.fillStyle = cColor;
    ctx.beginPath();
    ctx.moveTo(obs.x, obs.y - obs.radius * 1.3 + hoverY);
    ctx.lineTo(obs.x + obs.radius * 0.75, obs.y + obs.radius * 0.5);
    ctx.lineTo(obs.x, obs.y + obs.radius * 0.75);
    ctx.lineTo(obs.x - obs.radius * 0.75, obs.y + obs.radius * 0.5);
    ctx.closePath();
    ctx.fill();

    // Specular crystal facet highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(obs.x, obs.y - obs.radius * 1.3 + hoverY);
    ctx.lineTo(obs.x - obs.radius * 0.3, obs.y);
    ctx.lineTo(obs.x, obs.y + obs.radius * 0.5);
    ctx.closePath();
    ctx.fill();

  } else {
    // Textured boulder with stone cracks
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(obs.x - obs.radius * 0.2, obs.y - obs.radius * 0.2, obs.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obs.x - obs.radius * 0.4, obs.y);
    ctx.lineTo(obs.x + obs.radius * 0.2, obs.y + obs.radius * 0.3);
    ctx.stroke();
  }
}

/**
 * Draws shrines with sacred runic glyphs and hovering crystal obelisks
 */
export function drawDecoratedShrine(ctx: CanvasRenderingContext2D, shrine: WorldShrine, time: number) {
  // Radiant ground aura
  const grad = ctx.createRadialGradient(shrine.x, shrine.y, 10, shrine.x, shrine.y, 90);
  grad.addColorStop(0, shrine.color + '66');
  grad.addColorStop(0.6, shrine.color + '22');
  grad.addColorStop(1, shrine.color + '00');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(shrine.x, shrine.y, 90, 0, Math.PI * 2);
  ctx.fill();

  // Stone altar pedestal
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = shrine.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(shrine.x, shrine.y, shrine.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner Runic Ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(shrine.x, shrine.y, shrine.radius * 0.65, 0, Math.PI * 2);
  ctx.stroke();

  // Floating rotating sacred obelisk crystal
  const hoverY = Math.sin(time * 3 + shrine.x) * 8;
  ctx.save();
  ctx.translate(shrine.x, shrine.y + hoverY);
  ctx.rotate(time * 1.8);

  // Crystal diamond body
  ctx.fillStyle = shrine.color;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(12, 0);
  ctx.lineTo(0, 16);
  ctx.lineTo(-12, 0);
  ctx.closePath();
  ctx.fill();

  // Inner white gleam
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(6, 0);
  ctx.lineTo(0, 10);
  ctx.lineTo(-6, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Shrine title plaque with buff type
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = shrine.color;
  ctx.lineWidth = 1.5;
  ctx.fillRect(shrine.x - 65, shrine.y - shrine.radius - 28, 130, 20);
  ctx.strokeRect(shrine.x - 65, shrine.y - shrine.radius - 28, 130, 20);

  ctx.fillStyle = shrine.color;
  ctx.font = 'bold 11px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`⚡ ${shrine.name}`, shrine.x, shrine.y - shrine.radius - 18);
}
