import { GameEngine } from './gameEngine';
import { WeatherType } from '../types/game';

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  thickness: number;
  alpha: number;
  splashTimer: number;
  splashMax: number;
  groundY: number;
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobbleOffset: number;
  alpha: number;
  layer: number; // 0 = far/small, 1 = mid, 2 = near/big
  rotation: number;
  rotSpeed: number;
}

interface SunMote {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  alpha: number;
  maxAlpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}

export class WeatherRenderer {
  private rainDrops: RainDrop[] = [];
  private snowflakes: Snowflake[] = [];
  private sunMotes: SunMote[] = [];
  private lastWidth: number = 0;
  private lastHeight: number = 0;
  private initialized: boolean = false;

  constructor() {
    this.initPools(1920, 1080);
  }

  private initPools(width: number, height: number) {
    this.lastWidth = width;
    this.lastHeight = height;

    // Rain Pool
    this.rainDrops = [];
    const rainCount = 300;
    for (let i = 0; i < rainCount; i++) {
      this.rainDrops.push({
        x: Math.random() * (width + 400) - 200,
        y: Math.random() * height,
        length: 16 + Math.random() * 22,
        speed: 18 + Math.random() * 14,
        thickness: 1 + Math.random() * 1.2,
        alpha: 0.35 + Math.random() * 0.45,
        splashTimer: 0,
        splashMax: 0.15 + Math.random() * 0.1,
        groundY: height - Math.random() * 120,
      });
    }

    // Snow Pool
    this.snowflakes = [];
    const snowCount = 220;
    for (let i = 0; i < snowCount; i++) {
      const layer = Math.random() < 0.25 ? 2 : Math.random() < 0.6 ? 1 : 0;
      const radius = layer === 2 ? 3.5 + Math.random() * 2.5 : layer === 1 ? 2.0 + Math.random() * 1.5 : 1.0 + Math.random() * 1.0;
      const speedY = layer === 2 ? 2.2 + Math.random() * 1.4 : layer === 1 ? 1.4 + Math.random() * 0.9 : 0.8 + Math.random() * 0.6;
      this.snowflakes.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height,
        radius,
        speedY,
        speedX: 0.4 + Math.random() * 0.8,
        wobbleSpeed: 1.2 + Math.random() * 2.0,
        wobbleAmp: 1.5 + Math.random() * 2.5,
        wobbleOffset: Math.random() * Math.PI * 2,
        alpha: layer === 2 ? 0.85 : layer === 1 ? 0.65 : 0.45,
        layer,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
      });
    }

    // Sun Mote Pool
    this.sunMotes = [];
    const moteCount = 60;
    for (let i = 0; i < moteCount; i++) {
      this.sunMotes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 2 + Math.random() * 4,
        speedY: -(0.2 + Math.random() * 0.4),
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: 0.2,
        maxAlpha: 0.35 + Math.random() * 0.4,
        pulseSpeed: 1.0 + Math.random() * 2.0,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    this.initialized = true;
  }

  /**
   * Main weather draw call (in screen coordinate space for crisp screen-space particle effects and overlays)
   */
  public renderScreenWeather(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    width: number,
    height: number,
    time: number
  ) {
    if (!this.initialized || width !== this.lastWidth || height !== this.lastHeight) {
      this.initPools(width, height);
    }

    const weather = engine.weather;
    const current = weather.current;

    // 1. Draw atmospheric ambient tint and sky color
    this.drawAtmosphericTint(ctx, current, width, height, time, weather.transitionProgress);

    // 2. Weather-specific particle systems
    if (current === 'rain') {
      this.renderRain(ctx, engine, width, height, time);
    } else if (current === 'snow') {
      this.renderSnow(ctx, engine, width, height, time);
    } else if (current === 'sunny') {
      this.renderSunny(ctx, engine, width, height, time);
    }

    // 3. Lightning flash overlay (during thunderstorms)
    if (weather.lightningAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.85, weather.lightningAlpha)})`;
      ctx.fillRect(0, 0, width, height);

      // Subtle cyan/blue electric secondary bloom
      const flashGrad = ctx.createRadialGradient(
        width * 0.5 + Math.sin(time * 10) * 100,
        height * 0.2,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.7
      );
      flashGrad.addColorStop(0, `rgba(186, 230, 253, ${weather.lightningAlpha * 0.6})`);
      flashGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = flashGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }

  /**
   * Draws weather-specific ground decals / wetness / frost before entities
   */
  public renderWorldWeatherGround(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    time: number
  ) {
    const weather = engine.weather.current;
    if (weather === 'snow') {
      // Subtle frost ground dust in player vicinity
      ctx.save();
      ctx.fillStyle = 'rgba(224, 242, 254, 0.04)';
      ctx.beginPath();
      ctx.arc(engine.player.x, engine.player.y, 450, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (weather === 'rain') {
      // Wet reflective sheen in player area
      ctx.save();
      const pGrad = ctx.createRadialGradient(
        engine.player.x,
        engine.player.y,
        30,
        engine.player.x,
        engine.player.y,
        380
      );
      pGrad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
      pGrad.addColorStop(0.8, 'rgba(30, 58, 138, 0.03)');
      pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pGrad;
      ctx.fillRect(engine.player.x - 380, engine.player.y - 380, 760, 760);
      ctx.restore();
    }
  }

  private drawAtmosphericTint(
    ctx: CanvasRenderingContext2D,
    weather: WeatherType,
    width: number,
    height: number,
    time: number,
    transitionProgress: number
  ) {
    ctx.save();

    if (weather === 'sunny') {
      // Warm golden sunshine ambient overlay
      const sunTint = ctx.createLinearGradient(0, 0, width, height);
      sunTint.addColorStop(0, 'rgba(251, 191, 36, 0.06)');
      sunTint.addColorStop(0.5, 'rgba(245, 158, 11, 0.03)');
      sunTint.addColorStop(1, 'rgba(217, 119, 6, 0.02)');
      ctx.fillStyle = sunTint;
      ctx.fillRect(0, 0, width, height);
    } else if (weather === 'rain') {
      // Moody cool blue-slate storm overlay
      const rainTint = ctx.createLinearGradient(0, 0, 0, height);
      rainTint.addColorStop(0, 'rgba(15, 23, 42, 0.22)');
      rainTint.addColorStop(0.7, 'rgba(30, 41, 59, 0.16)');
      rainTint.addColorStop(1, 'rgba(15, 23, 42, 0.25)');
      ctx.fillStyle = rainTint;
      ctx.fillRect(0, 0, width, height);
    } else if (weather === 'snow') {
      // Crisp pale icy cyan frost overlay & frosted border vignette
      const snowTint = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.25,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      snowTint.addColorStop(0, 'rgba(224, 242, 254, 0.02)');
      snowTint.addColorStop(0.7, 'rgba(186, 230, 253, 0.08)');
      snowTint.addColorStop(1, 'rgba(147, 197, 253, 0.18)');
      ctx.fillStyle = snowTint;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }

  private renderRain(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    width: number,
    height: number,
    time: number
  ) {
    ctx.save();

    // Wind angle gives slanted rain
    const windSlant = 0.28; // x drift per y pixel

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
    ctx.lineCap = 'round';

    for (let i = 0; i < this.rainDrops.length; i++) {
      const drop = this.rainDrops[i];

      // Update position
      drop.y += drop.speed;
      drop.x += drop.speed * windSlant;

      // Wrap around
      if (drop.y > height + 50) {
        drop.y = -drop.length - Math.random() * 40;
        drop.x = Math.random() * (width + 300) - 150;
      }
      if (drop.x > width + 100) {
        drop.x = -50;
      }

      // Draw Rain Streak
      ctx.lineWidth = drop.thickness;
      ctx.strokeStyle = `rgba(186, 230, 253, ${drop.alpha})`;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + drop.length * windSlant, drop.y + drop.length);
      ctx.stroke();

      // Occasional Ground Splash ripples
      if (i % 4 === 0 && drop.y > height * 0.65) {
        const ripplePhase = ((time * 3 + i * 0.4) % 1);
        const splashRadius = 3 + ripplePhase * 8;
        const splashAlpha = (1 - ripplePhase) * 0.4;
        ctx.strokeStyle = `rgba(186, 230, 253, ${splashAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(
          drop.x + drop.length * windSlant,
          drop.y + drop.length,
          splashRadius * 1.5,
          splashRadius * 0.6,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private renderSnow(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    width: number,
    height: number,
    time: number
  ) {
    ctx.save();

    for (let i = 0; i < this.snowflakes.length; i++) {
      const flake = this.snowflakes[i];

      // Sine-wave wobble horizontal drift
      const wobble = Math.sin(time * flake.wobbleSpeed + flake.wobbleOffset) * flake.wobbleAmp;
      flake.y += flake.speedY;
      flake.x += flake.speedX + wobble * 0.4;
      flake.rotation += flake.rotSpeed;

      // Wrap around
      if (flake.y > height + 20) {
        flake.y = -10 - Math.random() * 30;
        flake.x = Math.random() * (width + 100) - 50;
      }
      if (flake.x > width + 50) {
        flake.x = -20;
      } else if (flake.x < -50) {
        flake.x = width + 20;
      }

      ctx.save();
      ctx.translate(flake.x, flake.y);
      ctx.rotate(flake.rotation);

      if (flake.layer === 2) {
        // Detailed close-up 6-pointed ice crystal
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.alpha})`;
        ctx.strokeStyle = `rgba(224, 242, 254, ${flake.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let p = 0; p < 6; p++) {
          const a = (p / 6) * Math.PI * 2;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * flake.radius, Math.sin(a) * flake.radius);
        }
        ctx.stroke();
        // Central snowflake dot
        ctx.beginPath();
        ctx.arc(0, 0, flake.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Soft glowing circular snow dot with radial soft edge
        ctx.fillStyle = `rgba(240, 249, 255, ${flake.alpha})`;
        ctx.shadowColor = '#bae6fd';
        ctx.shadowBlur = flake.layer === 1 ? 4 : 0;
        ctx.beginPath();
        ctx.arc(0, 0, flake.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Frosted screen-edge corners
    const edgeGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.45,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72
    );
    edgeGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    edgeGrad.addColorStop(0.8, 'rgba(224, 242, 254, 0.05)');
    edgeGrad.addColorStop(1, 'rgba(186, 230, 253, 0.16)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  private renderSunny(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    width: number,
    height: number,
    time: number
  ) {
    ctx.save();

    // 1. Volumetric God Rays slanting from top-left (Sun source)
    const sunOriginX = width * 0.15;
    const sunOriginY = -50;

    ctx.globalCompositeOperation = 'screen';

    for (let r = 0; r < 4; r++) {
      const rayAngle = 0.75 + (r - 1.5) * 0.22 + Math.sin(time * 0.4 + r) * 0.04;
      const rayWidth = 140 + r * 40;
      const rayLength = Math.max(width, height) * 1.5;

      const endX = sunOriginX + Math.cos(rayAngle) * rayLength;
      const endY = sunOriginY + Math.sin(rayAngle) * rayLength;

      const rayGrad = ctx.createLinearGradient(sunOriginX, sunOriginY, endX, endY);
      rayGrad.addColorStop(0, 'rgba(253, 224, 71, 0.15)');
      rayGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.07)');
      rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(sunOriginX - rayWidth * 0.2, sunOriginY);
      ctx.lineTo(sunOriginX + rayWidth * 0.2, sunOriginY);
      ctx.lineTo(endX + rayWidth, endY);
      ctx.lineTo(endX - rayWidth, endY);
      ctx.closePath();
      ctx.fill();
    }

    // 2. Solar Lens Flare Halo at sun origin
    const flareGrad = ctx.createRadialGradient(sunOriginX, sunOriginY, 10, sunOriginX, sunOriginY, 350);
    flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    flareGrad.addColorStop(0.2, 'rgba(254, 240, 138, 0.2)');
    flareGrad.addColorStop(0.6, 'rgba(251, 191, 36, 0.06)');
    flareGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = flareGrad;
    ctx.beginPath();
    ctx.arc(sunOriginX, sunOriginY, 350, 0, Math.PI * 2);
    ctx.fill();

    // 3. Floating Sunbeam Glitter Motes
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < this.sunMotes.length; i++) {
      const mote = this.sunMotes[i];

      mote.y += mote.speedY;
      mote.x += mote.speedX;

      const alphaPulse = Math.sin(time * mote.pulseSpeed + mote.pulseOffset);
      const currentAlpha = (alphaPulse * 0.5 + 0.5) * mote.maxAlpha;

      if (mote.y < -20) {
        mote.y = height + 20;
        mote.x = Math.random() * width;
      }

      ctx.fillStyle = `rgba(254, 240, 138, ${currentAlpha})`;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export const weatherRenderer = new WeatherRenderer();
