import { GameEngine } from './gameEngine';

/** Darkfall visual pass layered over the world without changing gameplay. */
export function drawDarkfallAtmosphere(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  width: number,
  height: number,
  time: number,
) {
  // Warm pools of dying torchlight around the player.
  const px = width / 2;
  const py = height / 2;
  const vignette = ctx.createRadialGradient(px, py, 70, px, py, Math.max(width, height) * 0.72);
  vignette.addColorStop(0, 'rgba(67,38,16,0.02)');
  vignette.addColorStop(0.55, 'rgba(12,8,5,0.12)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.58)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // Slow ash/dust gives the world an old, hostile atmosphere.
  ctx.save();
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 28; i++) {
    const seed = i * 91.73;
    const x = (seed * 17 + time * (5 + i % 4)) % (width + 40) - 20;
    const y = (seed * 7 + Math.sin(time * .35 + i) * 35 + i * 43) % (height + 40) - 20;
    const r = 0.7 + (i % 3) * 0.45;
    ctx.fillStyle = i % 5 === 0 ? '#b77a35' : '#817260';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Forged-metal screen edge.
  ctx.strokeStyle = 'rgba(128,82,37,.48)';
  ctx.lineWidth = 2;
  ctx.strokeRect(3, 3, width - 6, height - 6);
  ctx.strokeStyle = 'rgba(220,164,81,.13)';
  ctx.lineWidth = 1;
  ctx.strokeRect(7, 7, width - 14, height - 14);

  // Subtle danger pulse while the hero is badly wounded.
  const hpRatio = engine.player.maxHp > 0 ? engine.player.hp / engine.player.maxHp : 1;
  if (hpRatio < .3 && !engine.player.isDead) {
    const pulse = .05 + (Math.sin(time * 5) + 1) * .035;
    ctx.fillStyle = `rgba(110,8,5,${pulse})`;
    ctx.fillRect(0, 0, width, height);
  }
}
