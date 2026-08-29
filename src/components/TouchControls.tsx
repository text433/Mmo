import React, { useRef, useState, useEffect } from 'react';
import { GameEngine } from '../engine/gameEngine';
import { Swords } from 'lucide-react';

interface TouchControlsProps {
  engine: GameEngine;
  onUseAbility: (index: number) => void;
  onBasicAttack: () => void;
  onDash: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  engine,
  onUseAbility,
  onBasicAttack,
  onDash,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [stickPos, setStickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const touchIdRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
        setStickPos({ x: 0, y: 0 });
        // Clear simulated keys
        engine.keys['KeyW'] = false;
        engine.keys['KeyS'] = false;
        engine.keys['KeyA'] = false;
        engine.keys['KeyD'] = false;
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 45;

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxRadius);

    const stickX = Math.cos(angle) * clampedDist;
    const stickY = Math.sin(angle) * clampedDist;
    setStickPos({ x: stickX, y: stickY });

    // Map to movement keys in engine
    const deadzone = 12;
    if (dist > deadzone) {
      engine.keys['KeyD'] = dx > deadzone;
      engine.keys['KeyA'] = dx < -deadzone;
      engine.keys['KeyS'] = dy > deadzone;
      engine.keys['KeyW'] = dy < -deadzone;
    } else {
      engine.keys['KeyW'] = false;
      engine.keys['KeyS'] = false;
      engine.keys['KeyA'] = false;
      engine.keys['KeyD'] = false;
    }
  };

  return (
    <div id="touch-controls-container" className="md:hidden fixed inset-0 pointer-events-none z-30 select-none">
      {/* Left Virtual Joystick */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="absolute left-6 bottom-8 w-28 h-28 rounded-full bg-black/60 border-2 border-white/20 backdrop-blur-md pointer-events-auto flex items-center justify-center shadow-2xl"
      >
        <div
          className="w-12 h-12 rounded-full bg-blue-500/90 border-2 border-white shadow-lg pointer-events-none transition-transform duration-75"
          style={{
            transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
          }}
        />
      </div>

      {/* Right Action & Attack Buttons */}
      <div className="absolute right-6 bottom-8 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Dash Button */}
        <button
          onTouchStart={(e) => {
            e.stopPropagation();
            onDash();
          }}
          className="w-12 h-12 rounded-full bg-black/80 border-2 border-purple-400 text-purple-300 font-mono font-bold flex items-center justify-center shadow-lg active:scale-95 text-base backdrop-blur-md"
        >
          💨
        </button>

        {/* Primary Attack Button */}
        <button
          onTouchStart={(e) => {
            e.stopPropagation();
            onBasicAttack();
          }}
          className="w-16 h-16 rounded-full bg-black/80 border-2 border-yellow-500 text-yellow-400 font-bold flex items-center justify-center shadow-2xl active:scale-95 backdrop-blur-md"
        >
          <Swords className="w-7 h-7 text-yellow-400" />
        </button>
      </div>
    </div>
  );
};
