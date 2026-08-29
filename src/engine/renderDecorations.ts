import { GameEngine } from './gameEngine';
import { ZONES, WORLD_WIDTH, WORLD_HEIGHT, WorldObstacle, WorldShrine } from './worldMap';

const patterns: Record<string, CanvasPattern | null> = {};

function pattern(ctx: CanvasRenderingContext2D, id: string) {
  if (patterns[id] !== undefined) return patterns[id];
  const c = document.createElement('canvas');
  c.width = 96; c.height = 96;
  const p = c.getContext('2d');
  if (!p) return null;

  const crack = (stroke: string, count: number) => {
    p.strokeStyle = stroke; p.lineWidth = 1;
    for (let i = 0; i < count; i++) {
      const x = (i * 37) % 96; const y = (i * 53) % 96;
      p.beginPath(); p.moveTo(x, y); p.lineTo(x + 10, y + 4); p.lineTo(x + 15, y - 2); p.stroke();
    }
  };

  if (id === 'sanctuary') {
    p.fillStyle = '#100d09'; p.fillRect(0, 0, 96, 96);
    p.fillStyle = '#1a1610'; p.fillRect(3, 3, 42, 42); p.fillRect(51, 51, 42, 42);
    p.fillStyle = '#211a12'; p.fillRect(51, 3, 42, 42); p.fillRect(3, 51, 42, 42);
    p.strokeStyle = '#5c4124'; p.lineWidth = 2; p.strokeRect(2, 2, 92, 92);
    crack('rgba(178,124,57,.18)', 5);
  } else if (id === 'forest') {
    p.fillStyle = '#10140d'; p.fillRect(0, 0, 96, 96);
    p.fillStyle = '#172014'; p.beginPath(); p.arc(18, 28, 16, 0, Math.PI * 2); p.fill();
    p.fillStyle = '#1d2517'; p.beginPath(); p.arc(69, 62, 22, 0, Math.PI * 2); p.fill();
    p.strokeStyle = '#3f3320'; p.lineWidth = 3;
    p.beginPath(); p.moveTo(0, 75); p.bezierCurveTo(24, 62, 38, 90, 96, 70); p.stroke();
    crack('rgba(80,100,55,.2)', 8);
  } else if (id === 'ruins') {
    p.fillStyle = '#111011'; p.fillRect(0, 0, 96, 96);
    for (let y = 0; y < 96; y += 24) for (let x = (y / 24) % 2 ? -16 : 0; x < 96; x += 32) {
      p.fillStyle = '#1b191a'; p.fillRect(x + 1, y + 1, 30, 22);
      p.strokeStyle = '#30282a'; p.strokeRect(x + 1, y + 1, 30, 22);
    }
    crack('rgba(96,54,58,.36)', 7);
  } else if (id === 'inferno') {
    p.fillStyle = '#120b07'; p.fillRect(0, 0, 96, 96);
    p.fillStyle = '#1e120b'; p.beginPath(); p.arc(26, 30, 24, 0, Math.PI * 2); p.fill();
    p.fillStyle = '#26150c'; p.beginPath(); p.arc(74, 70, 28, 0, Math.PI * 2); p.fill();
    p.strokeStyle = '#7d3215'; p.lineWidth = 2;
    p.beginPath(); p.moveTo(0, 52); p.lineTo(25, 45); p.lineTo(43, 56); p.lineTo(68, 42); p.lineTo(96, 50); p.stroke();
    p.strokeStyle = '#c15f21'; p.lineWidth = 1; p.stroke();
  } else if (id === 'arena') {
    p.fillStyle = '#150b09'; p.fillRect(0, 0, 96, 96);
    p.fillStyle = '#24120e'; p.fillRect(4, 4, 88, 88);
    p.fillStyle = 'rgba(74,17,13,.5)'; p.beginPath(); p.arc(30, 55, 19, 0, Math.PI * 2); p.fill();
    crack('rgba(110,65,38,.35)', 10);
  } else {
    p.fillStyle = '#171410'; p.fillRect(0, 0, 96, 96);
    for (let y = 0; y < 96; y += 24) for (let x = (y / 24) % 2 ? -24 : 0; x < 96; x += 48) {
      p.fillStyle = '#26211a'; p.fillRect(x + 2, y + 2, 44, 20);
      p.strokeStyle = '#3b3023'; p.strokeRect(x + 2, y + 2, 44, 20);
    }
  }

  patterns[id] = ctx.createPattern(c, 'repeat');
  return patterns[id];
}

function rune(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    const px = Math.cos(a) * r, py = Math.sin(a) * r;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
  ctx.restore();
}

export function drawDecoratedTerrain(ctx: CanvasRenderingContext2D, _engine: GameEngine, _canvasWidth: number, _canvasHeight: number) {
  const time = performance.now() / 1000;
  ctx.fillStyle = '#070605'; ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  ZONES.forEach(zone => {
    ctx.save();
    ctx.fillStyle = pattern(ctx, zone.id) || zone.bgColor;
    ctx.fillRect(zone.bounds.x, zone.bounds.y, zone.bounds.width, zone.bounds.height);

    // Broken boundary instead of glowing neon boxes.
    ctx.strokeStyle = zone.id === 'arena' ? 'rgba(120,34,22,.65)' : 'rgba(102,72,40,.48)';
    ctx.lineWidth = 5; ctx.setLineDash([28, 16, 7, 12]);
    ctx.strokeRect(zone.bounds.x + 6, zone.bounds.y + 6, zone.bounds.width - 12, zone.bounds.height - 12);
    ctx.setLineDash([]);

    // Large embedded sigils make each biome read like a designed RPG area.
    ctx.strokeStyle = zone.id === 'inferno' ? 'rgba(164,67,23,.16)' : 'rgba(158,111,52,.10)';
    ctx.lineWidth = 3;
    rune(ctx, zone.bounds.x + zone.bounds.width * .5, zone.bounds.y + zone.bounds.height * .5, 170, time * .02);
    ctx.restore();
  });

  // Roads are rebuilt as fractured causeways with curb stones and worn center tracks.
  const road = pattern(ctx, 'road');
  ctx.fillStyle = road || '#211c16';
  const roads = [
    [2432, 180, 136, 1830], [2432, 2990, 136, 1830],
    [180, 2432, 1830, 136], [2990, 2432, 1830, 136],
  ];
  roads.forEach(([x,y,w,h]) => {
    ctx.fillRect(x,y,w,h);
    ctx.strokeStyle = '#594126'; ctx.lineWidth = 5; ctx.strokeRect(x,y,w,h);
    ctx.strokeStyle = 'rgba(197,142,65,.18)'; ctx.lineWidth = 1; ctx.strokeRect(x+8,y+8,w-16,h-16);
  });

  // Fortress-like central hub, replacing the bright circular fountain plaza.
  const cx = 2500, cy = 2500;
  ctx.fillStyle = '#0d0b09'; ctx.strokeStyle = '#6c4a27'; ctx.lineWidth = 10;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 8 + i * Math.PI / 4;
    const r = i % 2 ? 310 : 270;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.strokeStyle = '#b07735'; ctx.lineWidth = 3;
  rune(ctx, cx, cy, 205, -time * .06);
  ctx.strokeStyle = 'rgba(180,117,49,.35)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, 115, 0, Math.PI*2); ctx.stroke();

  // Dark sacrificial well / waypoint core.
  const well = ctx.createRadialGradient(cx, cy, 8, cx, cy, 96);
  well.addColorStop(0, 'rgba(190,102,35,.7)');
  well.addColorStop(.28, 'rgba(91,45,21,.55)');
  well.addColorStop(.72, 'rgba(12,9,7,.95)');
  well.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = well; ctx.beginPath(); ctx.arc(cx, cy, 96, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#0a0806'; ctx.strokeStyle = '#7a552e'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#c37f34'; ctx.lineWidth = 2;
  for (let i=0;i<6;i++) rune(ctx, cx + Math.cos(i*Math.PI/3)*78, cy + Math.sin(i*Math.PI/3)*78, 10, i);

  // World wall now reads as old fortress masonry rather than red rectangle.
  ctx.strokeStyle = '#2d251c'; ctx.lineWidth = 28; ctx.strokeRect(14,14,WORLD_WIDTH-28,WORLD_HEIGHT-28);
  ctx.strokeStyle = '#7a5630'; ctx.lineWidth = 3; ctx.strokeRect(30,30,WORLD_WIDTH-60,WORLD_HEIGHT-60);
}

function drawTree(ctx: CanvasRenderingContext2D, o: WorldObstacle, time: number) {
  const r = o.radius; const sway = Math.sin(time * .75 + o.x * .01) * 2;
  // roots
  ctx.strokeStyle = '#2a1c10'; ctx.lineWidth = Math.max(3, r*.16); ctx.lineCap = 'round';
  for (let i=0;i<5;i++) {
    const a = -Math.PI*.1 + i*Math.PI*.3;
    ctx.beginPath(); ctx.moveTo(o.x, o.y+r*.25); ctx.lineTo(o.x+Math.cos(a)*r*.9, o.y+r*.72+Math.sin(a)*r*.18); ctx.stroke();
  }
  // crooked trunk
  const g = ctx.createLinearGradient(o.x-r*.3,o.y,o.x+r*.3,o.y);
  g.addColorStop(0,'#1a110a'); g.addColorStop(.5,'#4a2e17'); g.addColorStop(1,'#21140b');
  ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(o.x-r*.24,o.y+r*.45); ctx.lineTo(o.x-r*.12+sway,o.y-r*.78); ctx.lineTo(o.x+r*.17+sway,o.y-r*.7); ctx.lineTo(o.x+r*.3,o.y+r*.45); ctx.closePath(); ctx.fill();
  // dead branches give a real silhouette
  ctx.strokeStyle='#332112'; ctx.lineWidth=Math.max(3,r*.13);
  [[-.1,-.48,-.72,-.98],[.05,-.38,.72,-.82],[-.05,-.66,.35,-1.15]].forEach(v=>{
    ctx.beginPath(); ctx.moveTo(o.x+v[0]*r+sway,o.y+v[1]*r); ctx.lineTo(o.x+v[2]*r+sway,o.y+v[3]*r); ctx.stroke();
  });
  // irregular canopy clusters instead of circles
  const clusters = [[-.48,-.82,.62],[.05,-1.02,.74],[.55,-.77,.58],[-.05,-.55,.68]];
  clusters.forEach((v,i)=>{
    ctx.fillStyle = i%2 ? '#182016' : '#10170f';
    ctx.beginPath();
    for(let k=0;k<9;k++){
      const a=k*Math.PI*2/9; const rr=r*v[2]*(.78 + ((k*13)%5)*.055);
      const x=o.x+sway+v[0]*r+Math.cos(a)*rr, y=o.y+v[1]*r+Math.sin(a)*rr;
      k?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.closePath(); ctx.fill();
  });
  ctx.strokeStyle='rgba(100,89,48,.24)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(o.x-r*.4+sway,o.y-r*.98); ctx.lineTo(o.x+r*.35+sway,o.y-r*1.15); ctx.stroke();
}

export function drawDecoratedObstacle(ctx: CanvasRenderingContext2D, obs: WorldObstacle, time: number) {
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,.55)'; ctx.beginPath(); ctx.ellipse(obs.x+5,obs.y+obs.radius*.62,obs.radius*1.2,obs.radius*.45,0,0,Math.PI*2); ctx.fill();

  if (obs.type === 'tree') drawTree(ctx, obs, time);
  else if (obs.type === 'torch') {
    ctx.fillStyle='#171513'; ctx.fillRect(obs.x-5,obs.y-8,10,25);
    ctx.strokeStyle='#6a5132'; ctx.lineWidth=2; ctx.strokeRect(obs.x-5,obs.y-8,10,25);
    const flick=Math.sin(time*11+obs.x)*3;
    const glow=ctx.createRadialGradient(obs.x,obs.y-18,2,obs.x,obs.y-18,58+flick);
    glow.addColorStop(0,'rgba(255,177,67,.42)'); glow.addColorStop(.35,'rgba(179,73,24,.2)'); glow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(obs.x,obs.y-18,62+flick,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#7c250d'; ctx.beginPath(); ctx.moveTo(obs.x-7,obs.y-12); ctx.quadraticCurveTo(obs.x+flick,obs.y-35,obs.x+6,obs.y-12); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#e38a2f'; ctx.beginPath(); ctx.moveTo(obs.x-3,obs.y-13); ctx.quadraticCurveTo(obs.x,obs.y-27,obs.x+3,obs.y-13); ctx.closePath(); ctx.fill();
  } else if (obs.type === 'ruin_pillar') {
    const r=obs.radius;
    ctx.fillStyle='#151413'; ctx.fillRect(obs.x-r*.72,obs.y-r*.85,r*1.44,r*1.25);
    ctx.fillStyle='#292623'; ctx.fillRect(obs.x-r*.52,obs.y-r*.95,r*1.04,r*1.34);
    ctx.strokeStyle='#514637'; ctx.lineWidth=3; ctx.strokeRect(obs.x-r*.52,obs.y-r*.95,r*1.04,r*1.34);
    ctx.fillStyle='#34302b'; ctx.fillRect(obs.x-r*.82,obs.y-r, r*1.64,r*.22);
    ctx.strokeStyle='#7e3b2d'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(obs.x-r*.2,obs.y-r*.55); ctx.lineTo(obs.x+r*.15,obs.y-r*.35); ctx.lineTo(obs.x-r*.12,obs.y-r*.05); ctx.stroke();
  } else if (obs.type === 'crystal') {
    const r=obs.radius, pulse=.75+Math.sin(time*2.2+obs.x)*.12;
    ctx.globalAlpha=pulse; ctx.fillStyle='#6f2e14';
    [[0,-1.25,.72,.55],[-.55,-.72,.44,.7],[.55,-.75,.42,.62]].forEach(v=>{
      ctx.beginPath(); ctx.moveTo(obs.x+v[0]*r,obs.y+v[1]*r); ctx.lineTo(obs.x+(v[0]+v[2])*r,obs.y+.5*r); ctx.lineTo(obs.x+v[0]*r,obs.y+.72*r); ctx.lineTo(obs.x+(v[0]-v[2])*.7*r,obs.y+.5*r); ctx.closePath(); ctx.fill();
    });
    ctx.globalAlpha=1; ctx.strokeStyle='#bf6b27'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(obs.x,obs.y-r*1.2);ctx.lineTo(obs.x,obs.y+r*.6);ctx.stroke();
  } else if (obs.type === 'shrine') {
    ctx.fillStyle='#12100d'; ctx.strokeStyle='#73502b'; ctx.lineWidth=4;
    ctx.beginPath(); ctx.arc(obs.x,obs.y,obs.radius,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle='#b47430'; ctx.lineWidth=2; rune(ctx,obs.x,obs.y,obs.radius*.55,time*.12);
  } else {
    const r=obs.radius;
    ctx.fillStyle='#1a1917'; ctx.beginPath(); ctx.moveTo(obs.x-r,obs.y+r*.35);ctx.lineTo(obs.x-r*.55,obs.y-r*.65);ctx.lineTo(obs.x+r*.2,obs.y-r*.9);ctx.lineTo(obs.x+r*.92,obs.y-r*.15);ctx.lineTo(obs.x+r*.6,obs.y+r*.62);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#403a32';ctx.lineWidth=2;ctx.stroke();
    ctx.strokeStyle='#0c0b0a';ctx.beginPath();ctx.moveTo(obs.x-r*.45,obs.y-r*.35);ctx.lineTo(obs.x+r*.1,obs.y);ctx.lineTo(obs.x+r*.35,obs.y+r*.4);ctx.stroke();
  }
  ctx.restore();
}

export function drawDecoratedShrine(ctx: CanvasRenderingContext2D, shrine: WorldShrine, time: number) {
  const pulse=.72+Math.sin(time*2+shrine.x*.01)*.12;
  ctx.save();
  const g=ctx.createRadialGradient(shrine.x,shrine.y,8,shrine.x,shrine.y,82);
  g.addColorStop(0,`rgba(166,92,35,${.24*pulse})`); g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(shrine.x,shrine.y,82,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#0d0b09';ctx.strokeStyle='#76512c';ctx.lineWidth=5;ctx.beginPath();ctx.arc(shrine.x,shrine.y,shrine.radius+7,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#b77732';ctx.lineWidth=2;rune(ctx,shrine.x,shrine.y,shrine.radius*.68,-time*.35);
  // iron obelisk
  ctx.translate(shrine.x,shrine.y-6+Math.sin(time*1.7)*3);
  ctx.fillStyle='#25211c';ctx.strokeStyle='#9a6430';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,-28);ctx.lineTo(11,-8);ctx.lineTo(7,20);ctx.lineTo(-7,20);ctx.lineTo(-11,-8);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#d18a39';ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(0,11);ctx.moveTo(-5,-2);ctx.lineTo(5,-2);ctx.stroke();
  ctx.restore();

  ctx.save();ctx.font="700 11px Georgia, serif";ctx.textAlign='center';ctx.textBaseline='middle';
  const w=Math.max(108,ctx.measureText(shrine.name).width+22);
  ctx.fillStyle='rgba(8,6,4,.94)';ctx.strokeStyle='#60401f';ctx.lineWidth=1.5;ctx.fillRect(shrine.x-w/2,shrine.y-shrine.radius-34,w,19);ctx.strokeRect(shrine.x-w/2,shrine.y-shrine.radius-34,w,19);
  ctx.fillStyle='#c79550';ctx.fillText(shrine.name.toUpperCase(),shrine.x,shrine.y-shrine.radius-24);ctx.restore();
}
