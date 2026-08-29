import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from './engine/gameEngine';
import { CanvasRenderer } from './engine/canvasRenderer';
import { sound } from './engine/soundEngine';
import { trackEntityHealthChanges, EntityHealthSnapshot } from './engine/combatText';
import { CharacterClassType, Item, ItemSlot } from './types/game';

import { PlayerFrame } from './components/HUD/PlayerFrame';
import { TargetFrame } from './components/HUD/TargetFrame';
import { BossEncounterFrame } from './components/HUD/BossEncounterFrame';
import { Leaderboard } from './components/HUD/Leaderboard';
import { MiniMap } from './components/HUD/MiniMap';
import { SkillHotbar } from './components/HUD/SkillHotbar';
import { ChatBox } from './components/HUD/ChatBox';
import { QuickMenu } from './components/HUD/QuickMenu';

import { HeroSelectModal } from './components/Modals/HeroSelectModal';
import { CharacterModal } from './components/Modals/CharacterModal';
import { InventoryModal } from './components/Modals/InventoryModal';
import { SkillTreeModal } from './components/Modals/SkillTreeModal';
import { QuestsModal } from './components/Modals/QuestsModal';
import { WorldMapModal } from './components/Modals/WorldMapModal';
import { DeathModal } from './components/Modals/DeathModal';
import { HelpModal } from './components/Modals/HelpModal';
import { TouchControls } from './components/TouchControls';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const prevHealthMapRef = useRef<Map<string, EntityHealthSnapshot>>(new Map());

  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [tick, setTick] = useState<number>(0);

  // Modal open states
  const [showCharacter, setShowCharacter] = useState<boolean>(false);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showSkillTree, setShowSkillTree] = useState<boolean>(false);
  const [showQuests, setShowQuests] = useState<boolean>(false);
  const [showWorldMap, setShowWorldMap] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Start game with chosen hero name & class
  const handleStartGame = (name: string, chosenClass: CharacterClassType) => {
    const engine = new GameEngine(name, chosenClass);
    engineRef.current = engine;
    prevHealthMapRef.current.clear();
    setGameStarted(true);

    if (canvasRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current);
    }
  };

  // Main Canvas & Game Loop
  useEffect(() => {
    if (!gameStarted || !engineRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    if (!rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvas);
    }

    const engine = engineRef.current;
    const renderer = rendererRef.current;

    // Handle responsive resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    let lastTime = performance.now();
    let syncUiCounter = 0;

    const loop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // Update Engine state
      engine.update(dt);

      // Track entity health changes and spawn floating color-coded combat damage text
      trackEntityHealthChanges(engine, prevHealthMapRef.current);

      // Render Canvas frame
      renderer.render(engine);

      // Trigger UI sync every ~4 frames for buttery 60fps performance without React overhead
      syncUiCounter++;
      if (syncUiCounter % 4 === 0) {
        setTick(currentTime);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [gameStarted]);

  // Mouse & Keyboard Input Listeners
  useEffect(() => {
    if (!gameStarted || !engineRef.current) return;

    const engine = engineRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger game keys if typing in chat input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      engine.keys[e.code] = true;

      // Abilities hotkeys 1, 2, 3, 4
      if (e.key === '1') engine.useAbility(0);
      if (e.key === '2') engine.useAbility(1);
      if (e.key === '3') engine.useAbility(2);
      if (e.key === '4') engine.useAbility(3);

      // Dash
      if (e.code === 'Space') {
        e.preventDefault();
        engine.triggerDash();
      }

      // Potions
      if (e.code === 'KeyQ') engine.useHealthPotion();
      if (e.code === 'KeyE') engine.useManaPotion();

      // Loot / Pick Up
      if (e.code === 'KeyF') engine.pickupNearbyLoot();

      // Modals
      if (e.code === 'KeyC') setShowCharacter((prev) => !prev);
      if (e.code === 'KeyI') setShowInventory((prev) => !prev);
      if (e.code === 'KeyK') setShowSkillTree((prev) => !prev);
      if (e.code === 'KeyL') setShowQuests((prev) => !prev);
      if (e.code === 'KeyM') setShowWorldMap((prev) => !prev);
      if (e.code === 'KeyH') setShowHelp((prev) => !prev);

      if (e.code === 'Escape') {
        setShowCharacter(false);
        setShowInventory(false);
        setShowSkillTree(false);
        setShowQuests(false);
        setShowWorldMap(false);
        setShowHelp(false);
        engine.targetEntity = null;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      engine.mouseX = e.clientX;
      engine.mouseY = e.clientY;

      // Transform screen coordinates to world coordinates based on camera position & zoom
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      engine.mouseWorldX = engine.cameraX + (e.clientX - centerX) / engine.cameraZoom;
      engine.mouseWorldY = engine.cameraY + (e.clientY - centerY) / engine.cameraZoom;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.tagName !== 'CANVAS') return;
      if (e.button === 0) {
        engine.isMouseDown = true;

        // Check if clicked directly on dropped loot
        let clickedLoot = false;
        engine.lootDrops.forEach((loot) => {
          if (clickedLoot) return;
          const dist = Math.hypot(loot.x - engine.mouseWorldX, loot.y - engine.mouseWorldY);
          if (dist <= 30) {
            const playerDist = Math.hypot(loot.x - engine.player.x, loot.y - engine.player.y);
            if (playerDist <= engine.player.radius + 80) {
              engine.pickupLoot(loot);
              clickedLoot = true;
            } else {
              engine.addFloatingText(loot.x, loot.y - 20, 'Walk closer to pick up', '#94a3b8', 12);
              clickedLoot = true;
            }
          }
        });

        if (clickedLoot) return;

        // Check if clicked directly on an entity to target it
        let clickedTarget = false;
        engine.entities.forEach((ent) => {
          if (clickedTarget || ent.isDead) return;
          const dist = Math.hypot(ent.x - engine.mouseWorldX, ent.y - engine.mouseWorldY);
          if (dist <= ent.radius + 15) {
            engine.targetEntity = ent;
            clickedTarget = true;
          }
        });

        // Trigger basic attack if not clicking UI
        engine.triggerBasicAttack();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        engine.isMouseDown = false;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement)?.tagName !== 'CANVAS') return;
      e.preventDefault();
      if (e.deltaY < 0) {
        engine.cameraZoom = Math.min(1.5, engine.cameraZoom + 0.05);
      } else {
        engine.cameraZoom = Math.max(0.6, engine.cameraZoom - 0.05);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [gameStarted]);

  const toggleSound = () => {
    const isMuted = sound.toggleMute();
    setSoundEnabled(isMuted);
  };

  const engine = engineRef.current;
  const completedQuestsCount = engine ? engine.quests.filter((q) => q.isCompleted && !q.isClaimed).length : 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#121417] text-white font-sans select-none">
      {/* Geometric Dot Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#2a2d35 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.3,
        }}
      />

      {/* HTML5 Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair z-0"
      />

      {/* Start Hero Selection Screen */}
      {!gameStarted && <HeroSelectModal onStartGame={handleStartGame} />}

      {/* In-Game HUD Overlays */}
      {gameStarted && engine && (
        <>
          {/* Top-Left Player Profile */}
          <PlayerFrame
            player={engine.player}
            playerStats={engine.playerStats}
            gold={engine.gold}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            onOpenCharacter={() => setShowCharacter(true)}
          />

          {/* Dedicated Large-Scale World Boss Encounter Frame */}
          <BossEncounterFrame
            engine={engine}
            onTargetBoss={(boss) => {
              engine.targetEntity = boss;
              engine.player.targetId = boss.id;
            }}
            onClearTarget={() => {
              if (engine.targetEntity?.isBoss) {
                engine.targetEntity = null;
              }
              engine.player.targetId = null;
            }}
          />

          {/* Top-Center Targeted Enemy Frame (Non-Boss Enemies) */}
          <TargetFrame
            target={engine.targetEntity}
            onClearTarget={() => {
              engine.targetEntity = null;
              engine.player.targetId = null;
            }}
          />

          {/* Top-Right IO Leaderboard */}
          <Leaderboard player={engine.player} entities={engine.entities} />

          {/* Top-Right Radar MiniMap */}
          <MiniMap
            engine={engine}
            onOpenWorldMap={() => setShowWorldMap(true)}
          />

          {/* Bottom-Center Abilities & Potion Hotbar */}
          <SkillHotbar
            engine={engine}
            onUseAbility={(idx) => engine.useAbility(idx)}
            onUseHealthPotion={() => engine.useHealthPotion()}
            onUseManaPotion={() => engine.useManaPotion()}
            onDash={() => engine.triggerDash()}
          />

          {/* Bottom-Left Live Chat & Combat Log */}
          <ChatBox
            messages={engine.chatMessages}
            onSendMessage={(txt) => engine.sendPlayerChat(txt)}
          />

          {/* Quick Action Side Buttons */}
          <QuickMenu
            onOpenCharacter={() => setShowCharacter(true)}
            onOpenInventory={() => setShowInventory(true)}
            onOpenSkillTree={() => setShowSkillTree(true)}
            onOpenQuests={() => setShowQuests(true)}
            onOpenWorldMap={() => setShowWorldMap(true)}
            onOpenHelp={() => setShowHelp(true)}
            unspentPoints={engine.playerStats.unspentPoints}
            completedQuestsCount={completedQuestsCount}
          />

          {/* Touch Controls for Mobile / Tablets */}
          <TouchControls
            engine={engine}
            onUseAbility={(idx) => engine.useAbility(idx)}
            onBasicAttack={() => engine.triggerBasicAttack()}
            onDash={() => engine.triggerDash()}
          />

          {/* Modals */}
          {showCharacter && (
            <CharacterModal
              player={engine.player}
              stats={engine.playerStats}
              onAllocatePoint={(stat) => engine.allocateStatPoint(stat)}
              onClose={() => setShowCharacter(false)}
            />
          )}

          {showInventory && (
            <InventoryModal
              player={engine.player}
              inventory={engine.inventory}
              gold={engine.gold}
              onEquipItem={(item, idx) => engine.equipItem(item, idx)}
              onUnequipItem={(slot) => engine.unequipItem(slot)}
              onSellItem={(idx) => engine.sellItem(idx)}
              onClose={() => setShowInventory(false)}
            />
          )}

          {showSkillTree && (
            <SkillTreeModal
              player={engine.player}
              abilities={engine.abilities}
              onClose={() => setShowSkillTree(false)}
            />
          )}

          {showQuests && (
            <QuestsModal
              quests={engine.quests}
              onClaimReward={(qId) => engine.claimQuestReward(qId)}
              onClose={() => setShowQuests(false)}
            />
          )}

          {showWorldMap && (
            <WorldMapModal
              player={engine.player}
              onClose={() => setShowWorldMap(false)}
            />
          )}

          {showHelp && (
            <HelpModal
              engine={engine}
              onClose={() => setShowHelp(false)}
            />
          )}

          {/* Player Death Respawn Modal */}
          {engine.player.isDead && (
            <DeathModal
              player={engine.player}
              onRespawn={() => engine.respawnPlayer()}
            />
          )}
        </>
      )}
    </div>
  );
}
