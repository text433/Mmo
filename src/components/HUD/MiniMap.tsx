import React, { useRef, useEffect } from 'react';
import { GameEngine } from '../../engine/gameEngine';
import { ZONES, getZoneAt, WORLD_WIDTH, WORLD_HEIGHT, WORLD_SHRINES } from '../../engine/worldMap';
import { Compass, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';

interface MiniMapProps {
  engine: GameEngine;
  onOpenWorldMap: () => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({ engine, onOpenWorldMap }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentZone = getZoneAt(engine.player.x, engine.player.y);

  useEffect(() => {
    let animId: number;

    const drawRadar = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      ctx.clearRect(0, 0, size, size);

      // Draw Zone Rectangles Scaled to radar size
      const scale = size / WORLD_WIDTH;

      ZONES.forEach((zone) => {
        ctx.fillStyle = zone.bgColor;
        ctx.fillRect(zone.bounds.x * scale, zone.bounds.y * scale, zone.bounds.width * scale, zone.bounds.height * scale);
        ctx.strokeStyle = zone.color + '44';
        ctx.lineWidth = 1;
        ctx.strokeRect(zone.bounds.x * scale, zone.bounds.y * scale, zone.bounds.width * scale, zone.bounds.height * scale);
      });

      // Draw Shrines
      WORLD_SHRINES.forEach((s) => {
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x * scale - 2, s.y * scale - 2, 4, 4);
      });

      // Draw Monsters (Red dots) & Bots (Blue dots)
      engine.entities.forEach((ent) => {
        if (ent.isDead) return;
        if (ent.isBoss) {
          // Boss: Big Pulsing Marker
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(ent.x * scale, ent.y * scale, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (ent.type === 'bot') {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(ent.x * scale - 1.5, ent.y * scale - 1.5, 3, 3);
        } else if (ent.type === 'monster') {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(ent.x * scale - 1, ent.y * scale - 1, 2, 2);
        }
      });

      // Draw Player (Glowing Cyan Circle with Direction)
      const px = engine.player.x * scale;
      const py = engine.player.y * scale;

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Viewport bounds indicator
      const viewW = (window.innerWidth / engine.cameraZoom) * scale;
      const viewH = (window.innerHeight / engine.cameraZoom) * scale;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px - viewW / 2, py - viewH / 2, viewW, viewH);

      animId = requestAnimationFrame(drawRadar);
    };

    animId = requestAnimationFrame(drawRadar);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  return (
    <div id="hud-minimap" className="absolute top-44 right-6 z-20 pointer-events-auto select-none flex flex-col items-end gap-1.5">
      {/* Dynamic Weather System Widget */}
      <WeatherWidget engine={engine} />

      <div className="bg-black/60 border border-white/10 p-2.5 rounded-xl backdrop-blur-md shadow-2xl flex flex-col items-center gap-1.5">
        {/* Zone Name & Danger Tag */}
        <div className="flex items-center justify-between w-full px-1 text-xs">
          <span className="font-bold text-gray-200 truncate max-w-[100px] flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            {currentZone.name}
          </span>
          <span
            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/10"
            style={{ backgroundColor: `${currentZone.color}22`, color: currentZone.color }}
          >
            {currentZone.dangerLevel}
          </span>
        </div>

        {/* Mini Radar Circular Canvas */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 bg-black/80 shadow-inner">
          <canvas ref={canvasRef} width={128} height={128} className="w-full h-full" />
          
          {/* Geometric Radar Crosshairs & Range Rings */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/15 pointer-events-none" />
          <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/15 pointer-events-none" />
          <div className="absolute inset-4 rounded-full border border-white/10 pointer-events-none" />
          
          <button
            onClick={onOpenWorldMap}
            className="absolute bottom-1 right-1 p-1 rounded bg-black/80 hover:bg-black text-gray-300 border border-white/20 transition-colors z-10"
            title="Expand Full Map (M)"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        {/* Coordinates & Zoom Controls */}
        <div className="flex items-center justify-between w-full text-[10px] font-mono text-gray-400 px-1">
          <span>
            {Math.round(engine.player.x)}, {Math.round(engine.player.y)}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                engine.cameraZoom = Math.max(0.6, engine.cameraZoom - 0.1);
              }}
              className="w-4 h-4 rounded bg-black/40 border border-white/10 hover:border-white/30 text-gray-300 flex items-center justify-center font-mono"
            >
              -
            </button>
            <button
              onClick={() => {
                engine.cameraZoom = Math.min(1.5, engine.cameraZoom + 0.1);
              }}
              className="w-4 h-4 rounded bg-black/40 border border-white/10 hover:border-white/30 text-gray-300 flex items-center justify-center font-mono"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
