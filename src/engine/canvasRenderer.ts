import { GameEngine } from './gameEngine';
import { ZONES, WORLD_WIDTH, WORLD_HEIGHT, WORLD_SHRINES } from './worldMap';
import { Entity } from '../types/game';
import { drawDecoratedTerrain, drawDecoratedObstacle, drawDecoratedShrine } from './renderDecorations';
import { drawDetailedHumanoid, drawDetailedMonster, drawDetailedBoss, drawDecoratedOverhead } from './renderEntities';
import { weatherRenderer } from './renderWeather';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
  }

  public render(engine: GameEngine) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;
    const time = performance.now() / 1000;

    // Deep Dark Canvas Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Camera Transform (Centered on player with smooth zoom)
    ctx.translate(width / 2, height / 2);
    ctx.scale(engine.cameraZoom, engine.cameraZoom);
    ctx.translate(-engine.cameraX, -engine.cameraY);

    // 1. Draw Decorated Biome Zones, Roads & Central Sanctuary Plaza
    drawDecoratedTerrain(ctx, engine, width, height);

    // 1.5 Draw Ground Weather Wetness & Frost Sheen Decals
    weatherRenderer.renderWorldWeatherGround(ctx, engine, time);

    // 2. Draw World Shrines & Interactive Points
    this.drawShrines(time);

    // 3. Draw Ground Telegraphs (Boss AOEs, Spells)
    this.drawTelegraphs(engine);

    // 4. Draw Loot Drops
    this.drawLootDrops(engine, time);

    // 5. Draw Obstacles (Animated Trees, Carved Stone Pillars, Torches, Glowing Crystals)
    this.drawObstacles(engine, time);

    // 6. Draw Entities (Detailed Monsters, Bots, Bosses, Dummies)
    this.drawEntities(engine, time);

    // 7. Draw Player
    this.drawPlayer(engine, time);

    // 8. Draw Projectiles with trails & glowing cores
    this.drawProjectiles(engine, time);

    // 9. Draw Particle FX (Sparks, Rings, Glows, Stars, Smoke)
    this.drawParticles(engine);

    // 10. Draw Floating Combat Text
    this.drawFloatingTexts(engine);

    // 11. Draw Dynamic Torch / Shrine / Boss Lighting Overlay
    this.drawLightingOverlay(engine, time);

    ctx.restore();

    // 12. Draw Screen-Space Atmospheric Weather (Rays, Raindrops, Snowflakes, Thunder flash)
    weatherRenderer.renderScreenWeather(ctx, engine, width, height, time);
  }

  private drawShrines(time: number) {
    const ctx = this.ctx;
    WORLD_SHRINES.forEach((shrine) => {
      drawDecoratedShrine(ctx, shrine, time);
    });
  }

  private drawTelegraphs(engine: GameEngine) {
    const ctx = this.ctx;

    engine.groundTelegraphs.forEach((t) => {
      const progress = Math.min(1, t.elapsed / t.duration);

      // Warning Background
      ctx.fillStyle = t.color + '22';
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fill();

      // Expanding / filling progress circle
      ctx.fillStyle = t.color + '44';
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius * progress, 0, Math.PI * 2);
      ctx.fill();

      // Outer Danger Ring with pulsing dash
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Spell Label
      ctx.fillStyle = t.color;
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`⚠️ ${t.effectName}`, t.x, t.y - t.radius - 8);
    });
  }

  private drawObstacles(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    engine.obstacles.forEach((obs) => {
      drawDecoratedObstacle(ctx, obs, time);
    });
  }

  private drawLootDrops(engine: GameEngine, time: number) {
    const ctx = this.ctx;

    engine.lootDrops.forEach((loot) => {
      const hover = Math.sin(time * 4 + loot.x) * 5;

      // Vertical Light Beam
      const beamGrad = ctx.createLinearGradient(loot.x, loot.y - 90, loot.x, loot.y);
      beamGrad.addColorStop(0, 'transparent');
      beamGrad.addColorStop(1, loot.color + 'aa');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(loot.x - 10, loot.y - 90, 20, 90);

      // Rotating Aura Ring
      ctx.strokeStyle = loot.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(loot.x, loot.y + 12, 18, 9, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Floating Bag / Chest / Coin Icon
      ctx.font = '22px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = loot.gold ? '🪙' : loot.item?.icon || '🎁';
      ctx.fillText(icon, loot.x, loot.y + hover);

      // Name Label with dark background tag
      const labelText = loot.gold ? `+${loot.gold} Gold` : loot.item ? loot.item.name : 'Loot';
      ctx.save();
      ctx.font = 'bold 11px Outfit, sans-serif';
      const txtW = ctx.measureText(labelText).width + 14;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = loot.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(loot.x - txtW / 2, loot.y - 28 + hover, txtW, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = loot.color;
      ctx.fillText(labelText, loot.x, loot.y - 19 + hover);

      // If Auto-Loot is disabled and player is in nearby range, show interaction prompt
      if (!engine.autoLoot && !engine.player.isDead) {
        const dist = Math.hypot(loot.x - engine.player.x, loot.y - engine.player.y);
        if (dist <= engine.player.radius + 65) {
          ctx.font = 'bold 9px monospace';
          const promptW = ctx.measureText('[F] Pick Up').width + 10;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(loot.x - promptW / 2, loot.y - 45 + hover, promptW, 14, 3);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#38bdf8';
          ctx.fillText('[F] Pick Up', loot.x, loot.y - 38 + hover);
        }
      }

      ctx.restore();
    });
  }

  private drawEntities(engine: GameEngine, time: number) {
    const ctx = this.ctx;

    engine.entities.forEach((entity) => {
      if (entity.isDead) return;

      // Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(entity.x, entity.y + entity.radius * 0.7, entity.radius * 1.15, entity.radius * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Target selection ring
      if (engine.targetEntity?.id === entity.id) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, entity.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.save();
      ctx.translate(entity.x, entity.y);
      ctx.rotate(entity.angle);

      const isMoving = Math.hypot(entity.vx, entity.vy) > 0.5;

      if (entity.isBoss) {
        // Detailed Boss Models
        drawDetailedBoss(ctx, entity, time);
      } else if (entity.type === 'bot') {
        // Detailed Player Bot Model
        drawDetailedHumanoid(ctx, entity.color, entity.classType || 'warrior', time, isMoving, false);
      } else if (entity.type === 'dummy') {
        // Wooden Training Dummy with Straw Padding & Bullseye
        ctx.fillStyle = '#78350f'; // Wood post
        ctx.fillRect(-6, -14, 12, 28);
        ctx.fillStyle = '#d97706'; // Straw torso
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444'; // Red Bullseye
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Detailed Monster Models (Slimes, Wolves, Skeletons, Necromancers, Drakes, Golems)
        drawDetailedMonster(ctx, entity, time);
      }

      ctx.restore();

      // Entity UI: Name, Guild, Level, Metallic Health Bar
      drawDecoratedOverhead(ctx, entity, false);
    });
  }

  private drawPlayer(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    const player = engine.player;
    if (player.isDead) return;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(player.x, player.y + player.radius * 0.7, player.radius * 1.2, player.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dashing trail ring
    if (engine.isDashing) {
      ctx.strokeStyle = player.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    const isMoving = Math.hypot(player.vx, player.vy) > 0.5;

    // Player Humanoid Character with detailed armor, flowing cape & weapons
    drawDetailedHumanoid(ctx, player.color, player.classType || 'warrior', time, isMoving, true);

    ctx.restore();

    // Overhead UI for player
    drawDecoratedOverhead(ctx, player, true);
  }

  private drawProjectiles(engine: GameEngine, time: number) {
    const ctx = this.ctx;

    engine.projectiles.forEach((p) => {
      ctx.save();
      const angle = Math.atan2(p.vy, p.vx);
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);

      if (p.effectType === 'arrow') {
        // Detailed Wooden Scout Arrow with Steel Head & Feathered Fletching
        ctx.fillStyle = '#78350f'; // Shaft
        ctx.fillRect(-12, -1.5, 20, 3);
        ctx.fillStyle = '#e2e8f0'; // Steel Tip
        ctx.beginPath();
        ctx.moveTo(8, -4);
        ctx.lineTo(16, 0);
        ctx.lineTo(8, 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#22c55e'; // Green Fletching
        ctx.fillRect(-12, -4, 4, 8);
      } else {
        // Fireball / Arcane Orb / Ice Spear
        const isFire = (p.color || '').includes('f97316') || (p.color || '').includes('ea580c') || (p.color || '').includes('ef4444');
        const isIce = (p.color || '').includes('38bdf8') || (p.color || '').includes('0284c7');

        // Outer Glow Corona
        const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, p.radius * 1.6);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Fiery / Arcane core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Trailing Flame Streamers
        ctx.strokeStyle = p.color + 'aa';
        ctx.lineWidth = p.radius * 0.9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-p.radius * 2.5, 0);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  private drawParticles(engine: GameEngine) {
    const ctx = this.ctx;

    for (let i = 0; i < engine.particles.length; i++) {
      const part = engine.particles[i];
      const alpha = Math.max(0, Math.min(1, part.alpha));
      if (alpha <= 0.01) continue;

      ctx.save();
      ctx.globalAlpha = alpha;
      if (part.blendMode) {
        ctx.globalCompositeOperation = part.blendMode;
      }

      const shape = part.shape || 'circle';

      if (shape === 'spark' || shape === 'line') {
        // High-velocity directional spark streak
        const speed = Math.hypot(part.vx, part.vy);
        const angle = Math.atan2(part.vy, part.vx);
        const streakLen = Math.max(part.radius * 2, speed * 2.8);

        ctx.translate(part.x, part.y);
        ctx.rotate(angle);

        // Outer glow streak
        ctx.strokeStyle = part.color;
        ctx.lineWidth = Math.max(1.5, part.radius);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-streakLen * 0.6, 0);
        ctx.lineTo(streakLen * 0.4, 0);
        ctx.stroke();

        // Inner white-hot core
        ctx.strokeStyle = part.innerColor || '#ffffff';
        ctx.lineWidth = Math.max(1, part.radius * 0.5);
        ctx.beginPath();
        ctx.moveTo(-streakLen * 0.3, 0);
        ctx.lineTo(streakLen * 0.3, 0);
        ctx.stroke();
      } else if (shape === 'ring') {
        // Expanding shockwave ring
        ctx.strokeStyle = part.color;
        ctx.lineWidth = Math.max(1, part.strokeWidth || 2.5);
        ctx.beginPath();
        ctx.arc(part.x, part.y, Math.max(1, part.radius), 0, Math.PI * 2);
        ctx.stroke();
      } else if (shape === 'glow') {
        // Luminous radial glow orb
        const grad = ctx.createRadialGradient(
          part.x,
          part.y,
          0,
          part.x,
          part.y,
          Math.max(1, part.radius)
        );
        grad.addColorStop(0, part.innerColor || '#ffffff');
        grad.addColorStop(0.4, part.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(part.x, part.y, Math.max(1, part.radius), 0, Math.PI * 2);
        ctx.fill();
      } else if (shape === 'dust' || shape === 'smoke') {
        // Soft ground dust / smoke puff
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, Math.max(1, part.radius), 0, Math.PI * 2);
        ctx.fill();
      } else if (shape === 'star') {
        // 4-point glittering sparkle
        ctx.translate(part.x, part.y);
        if (part.rotation !== undefined) {
          ctx.rotate(part.rotation);
        }
        ctx.fillStyle = part.color;
        const r = Math.max(1, part.radius);
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.5);
        ctx.quadraticCurveTo(0, 0, r * 1.5, 0);
        ctx.quadraticCurveTo(0, 0, 0, r * 1.5);
        ctx.quadraticCurveTo(0, 0, -r * 1.5, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r * 1.5);
        ctx.fill();

        // Small inner core
        ctx.fillStyle = part.innerColor || '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard circle
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, Math.max(0.5, part.radius), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawFloatingTexts(engine: GameEngine) {
    const ctx = this.ctx;

    engine.floatingTexts.forEach((f) => {
      ctx.save();
      const alpha = Math.max(0, Math.min(1, f.opacity));
      ctx.globalAlpha = alpha;

      const fontSize = f.isCrit ? Math.round(f.size * 1.15) : f.size;
      ctx.font = f.isCrit
        ? `900 ${fontSize}px 'Cinzel', 'Outfit', sans-serif`
        : `800 ${fontSize}px 'Outfit', 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Thick dark outline for pristine legibility across any biome or ground telegraph
      ctx.lineWidth = f.isCrit ? 4.5 : 3.5;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(f.text, f.x, f.y);

      // Glowing colored text fill
      ctx.shadowColor = f.color;
      ctx.shadowBlur = f.isCrit ? 10 : 5;
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);

      ctx.restore();
    });
  }

  private drawLightingOverlay(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    const p = engine.player;

    // Atmospheric dynamic vignette focusing light on player position
    const lightRadius = 480;
    const grad = ctx.createRadialGradient(p.x, p.y, 60, p.x, p.y, lightRadius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.42)');

    ctx.fillStyle = grad;
    ctx.fillRect(p.x - lightRadius, p.y - lightRadius, lightRadius * 2, lightRadius * 2);
  }
}
