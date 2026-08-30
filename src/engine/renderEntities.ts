import { Entity } from '../types/game';

const OUTLINE = '#241127';

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function poly(ctx: CanvasRenderingContext2D, color: string, points: Array<[number, number]>) {
  if (!points.length) return;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function oval(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, rx: number, ry: number) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function shadow(ctx: CanvasRenderingContext2D, r: number) {
  ctx.fillStyle = 'rgba(0,0,0,.34)';
  ctx.beginPath();
  ctx.ellipse(0, r * .78, r * 1.05, r * .28, 0, 0, Math.PI * 2);
  ctx.fill();
}

function walkPhase(time: number, isMoving: boolean) {
  if (!isMoving) return 0;
  return Math.floor(time * 7) % 2 === 0 ? -1 : 1;
}

function drawSword(ctx: CanvasRenderingContext2D, angle = 0) {
  ctx.save();
  ctx.rotate(angle);
  px(ctx, OUTLINE, 6, -4, 35, 8);
  px(ctx, '#7d2b3c', 5, -3, 12, 6);
  px(ctx, '#f2c94c', 15, -6, 5, 12);
  poly(ctx, '#c8d0e0', [[20,-3],[51,-3],[58,0],[51,3],[20,3]]);
  ctx.restore();
}

function drawBow(ctx: CanvasRenderingContext2D, pulled = false) {
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(24, 0, 25, -1.15, 1.15);
  ctx.stroke();
  ctx.strokeStyle = '#6b4a32';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = '#e8dcc0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(34,-23);
  ctx.lineTo(pulled ? 8 : 20,0);
  ctx.lineTo(34,23);
  ctx.stroke();
  if (pulled) {
    px(ctx, '#e8dcc0', 8, -1, 32, 2);
    poly(ctx, '#e8dcc0', [[40,-4],[47,0],[40,4]]);
  }
}

function drawStaff(ctx: CanvasRenderingContext2D, casting = false) {
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(4,20);
  ctx.lineTo(28,-28);
  ctx.stroke();
  ctx.strokeStyle = '#6b4a32';
  ctx.lineWidth = 3;
  ctx.stroke();
  oval(ctx, casting ? '#7fe8ff' : '#58b8dc', 28, -30, casting ? 8 : 6, casting ? 8 : 6);
  if (casting) {
    px(ctx, '#7fe8ff', 39, -35, 4, 4);
    px(ctx, '#7fe8ff', 35, -43, 3, 3);
    px(ctx, '#7fe8ff', 45, -28, 3, 3);
  }
}

export function drawDetailedHumanoid(ctx: CanvasRenderingContext2D, color: string, classType: string, time: number, isMoving: boolean, isPlayer: boolean) {
  const step = walkPhase(time, isMoving);
  const bob = isMoving ? (step > 0 ? -1 : 0) : 0;
  ctx.save();
  ctx.translate(0, bob);
  shadow(ctx, 18);

  const isMage = classType === 'mage';
  const isRanger = classType === 'ranger';
  const isPaladin = classType === 'paladin';
  const main = isMage ? '#8b7ae8' : isRanger ? '#5fc47d' : isPaladin ? '#d7b45a' : '#d8455f';
  const dark = isMage ? '#514690' : isRanger ? '#356e49' : isPaladin ? '#79652f' : '#7d2b3c';
  const attackPose = false;

  // cape / mantle
  poly(ctx, dark, [[-12,-10],[-20,20],[-4,24],[5,20],[12,-10]]);

  // walking legs
  const lx = isMoving ? step * 5 : -4;
  const rx = isMoving ? -step * 5 : 5;
  px(ctx, OUTLINE, lx - 4, 12, 8, 15);
  px(ctx, dark, lx - 3, 13, 6, 13);
  px(ctx, OUTLINE, rx - 4, 12, 8, 15);
  px(ctx, dark, rx - 3, 13, 6, 13);
  px(ctx, '#4a3020', lx - 5, 23, 10, 5);
  px(ctx, '#4a3020', rx - 5, 23, 10, 5);

  // torso
  poly(ctx, main, [[-13,-14],[-18,1],[-11,14],[0,17],[11,14],[18,1],[13,-14]]);
  px(ctx, '#f2c94c', -13, 8, 26, 4);
  px(ctx, dark, -4, -8, 8, 17);

  // shoulders
  oval(ctx, dark, -15, -9, 8, 6);
  oval(ctx, dark, 15, -9, 8, 6);

  // head
  px(ctx, OUTLINE, -8, -29, 16, 16);
  px(ctx, '#e8b48c', -6, -27, 12, 12);

  if (isMage) {
    poly(ctx, main, [[-15,-29],[-2,-47],[9,-31],[17,-27],[-15,-27]]);
    px(ctx, '#f2c94c', -12, -31, 24, 3);
    drawStaff(ctx, attackPose);
  } else if (isRanger) {
    poly(ctx, main, [[-11,-30],[0,-40],[11,-30],[8,-17],[-8,-17]]);
    drawBow(ctx, attackPose);
  } else {
    // helmet with red crest for warrior
    poly(ctx, dark, [[-10,-28],[-6,-38],[6,-38],[10,-28],[8,-16],[-8,-16]]);
    if (!isPaladin) poly(ctx, '#d8455f', [[-3,-38],[2,-51],[8,-38]]);
    px(ctx, '#f2c94c', 5, -27, 5, 4);
    drawSword(ctx, .18);
  }

  // tiny armor highlights, kept blocky
  px(ctx, isPlayer ? '#f2c94c' : color, -10, -3, 4, 3);
  px(ctx, isPlayer ? '#f2c94c' : color, 7, 0, 3, 3);
  ctx.restore();
}

function monsterFrame(entity: Entity, time: number) {
  if (entity.aiState === 'attack' || entity.aiState === 'cast') return 2;
  return Math.floor(time * 6 + entity.x * .01) % 2;
}

function drawWolf(ctx: CanvasRenderingContext2D, r: number, frame: number) {
  const step = frame === 0 ? -5 : 5;
  const attack = frame === 2;
  ctx.save();
  if (attack) ctx.translate(-5, 1);
  oval(ctx, '#3f465b', -2, 0, r * 1.05, r * .55);
  poly(ctx, '#31384d', [[-r*.65,-r*.28],[-r*.92,-r*.9],[-r*.3,-r*.55]]);
  poly(ctx, '#3f465b', [[-r*.75,-r*.18],[-r*1.35,-r*.48],[-r*1.25,r*.12],[-r*.55,r*.2]]);
  poly(ctx, '#d8d2b0', [[-r*1.35,-r*.45],[-r*1.65,-r*.25],[-r*1.35,-r*.05]]);
  px(ctx, '#d8455f', -r*1.2, -r*.35, 4, 3);
  const legs = attack ? [-12, 10] : [step, -step];
  for (let i = 0; i < 2; i++) {
    px(ctx, OUTLINE, legs[i] - 5, r*.24, 9, r*.75);
    px(ctx, '#31384d', legs[i] - 3, r*.25, 6, r*.67);
  }
  if (attack) {
    poly(ctx, '#d8d2b0', [[-r*1.62,-r*.14],[-r*1.82,-r*.05],[-r*1.58,0]]);
    poly(ctx, '#d8d2b0', [[-r*1.58,.02],[-r*1.78,.12],[-r*1.52,.14]]);
  }
  ctx.restore();
}

function drawBoar(ctx: CanvasRenderingContext2D, r: number, frame: number) {
  const attack = frame === 2;
  const step = frame === 0 ? -5 : 5;
  ctx.save();
  if (attack) ctx.translate(-4, 4);
  oval(ctx, '#6b4a32', 0, 0, r * 1.15, r * .65);
  poly(ctx, '#4a3020', [[-r*.7,-r*.4],[-r*.35,-r*.95],[r*.1,-r*.55],[r*.55,-r*.65],[r*.72,-r*.28]]);
  poly(ctx, '#6b4a32', [[-r*.7,-r*.25],[-r*1.35,-r*.5],[-r*1.55,-r*.08],[-r*1.2,r*.25],[-r*.65,r*.2]]);
  px(ctx, '#d8455f', -r*1.25, -r*.3, 4, 3);
  poly(ctx, '#e8dcc0', [[-r*1.35,0],[-r*1.68,r*.12],[-r*1.4,r*.2]]);
  poly(ctx, '#e8dcc0', [[-r*1.27,r*.08],[-r*1.52,r*.31],[-r*1.2,r*.22]]);
  const offsets = attack ? [-15, 12] : [step, -step];
  for (let i = 0; i < 2; i++) {
    px(ctx, OUTLINE, offsets[i]-5, r*.28, 9, r*.58);
    px(ctx, '#4a3020', offsets[i]-3, r*.3, 6, r*.48);
  }
  ctx.restore();
}

function drawSpider(ctx: CanvasRenderingContext2D, r: number, frame: number) {
  const attack = frame === 2;
  oval(ctx, '#3a2f4a', r*.28, 0, r*.88, r*.65);
  oval(ctx, '#5a4a72', -r*.62, -2, r*.62, r*.5);
  px(ctx, '#5fc47d', -r*.95, -8, 4, 4);
  px(ctx, '#5fc47d', -r*.74, -8, 4, 4);
  px(ctx, '#5fc47d', -r*.95, -1, 4, 4);
  px(ctx, '#5fc47d', -r*.74, -1, 4, 4);
  poly(ctx, '#5a4a72', [[r*.2,-r*.16],[r*.42,-r*.34],[r*.62,-r*.1],[r*.4,r*.08]]);
  poly(ctx, '#5a4a72', [[r*.38,r*.1],[r*.62,r*.34],[r*.38,r*.48],[r*.16,r*.2]]);
  const lift = attack ? -r*.7 : 0;
  const phase = frame === 0 ? 1 : -1;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 7;
  for (let i = 0; i < 4; i++) {
    const y = -8 + i * 7;
    const ex = i < 2 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(-5 + i*4, y);
    ctx.lineTo(-r*.7 - i*3, y + phase*ex*5 + (i===0?lift:0));
    ctx.lineTo(-r*1.12 - i*2, r*.45 + i*2 + (i===0?lift:0));
    ctx.stroke();
    ctx.strokeStyle = '#5a4a72';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 7;
  }
  poly(ctx, '#e8dcc0', [[-r*1.02,6],[-r*1.2,17],[-r*.95,13]]);
  poly(ctx, '#e8dcc0', [[-r*.78,7],[-r*.88,19],[-r*.66,13]]);
}

function drawSkeleton(ctx: CanvasRenderingContext2D, r: number, frame: number) {
  const attack = frame === 2;
  const step = frame === 0 ? -4 : 4;
  const bone = '#d8d2b0';
  const shade = '#8a8470';
  // legs and spine
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(0,13); ctx.stroke();
  ctx.strokeStyle = bone; ctx.lineWidth = 4; ctx.stroke();
  for (const s of [-1,1]) {
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(s*2,11); ctx.lineTo(s*(8+step),28); ctx.stroke();
    ctx.strokeStyle = bone; ctx.lineWidth = 4; ctx.stroke();
  }
  oval(ctx, bone, 0, -19, r*.5, r*.48);
  px(ctx, OUTLINE, -7, -23, 5, 5); px(ctx, OUTLINE, 2, -23, 5, 5);
  px(ctx, '#d8455f', -5, -21, 2, 2); px(ctx, '#d8455f', 4, -21, 2, 2);
  poly(ctx, '#6b5a4a', [[-13,-8],[-8,-18],[11,-15],[15,-4],[8,7],[-10,5]]);
  ctx.save();
  ctx.translate(-4,-2);
  drawSword(ctx, attack ? -1.25 : -.2);
  ctx.restore();
  px(ctx, shade, -3, -3, 6, 4);
}

function drawGolem(ctx: CanvasRenderingContext2D, r: number, frame: number) {
  const attack = frame === 2;
  const stone = '#5a5a62';
  const shade = '#3a3a42';
  oval(ctx, stone, 0, -2, r*.86, r*.86);
  poly(ctx, shade, [[-r*.6,-r*.4],[-r*.2,-r*.9],[r*.25,-r*.78],[r*.65,-r*.38],[r*.58,r*.32],[0,r*.64],[-r*.6,r*.35]]);
  // magma seams
  ctx.strokeStyle = '#ff8b3a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-r*.25,-r*.72); ctx.lineTo(-r*.1,-r*.25); ctx.lineTo(r*.12,-r*.02); ctx.lineTo(r*.02,r*.45); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(r*.2,-r*.52); ctx.lineTo(r*.42,-r*.18); ctx.lineTo(r*.28,r*.22); ctx.stroke();
  px(ctx, '#ff8b3a', -r*.52, -r*.33, 4, 4);
  // legs
  for (const s of [-1,1]) {
    px(ctx, OUTLINE, s*7-6, r*.42, 12, r*.48);
    px(ctx, stone, s*7-4, r*.44, 8, r*.4);
  }
  // huge arms
  if (attack) {
    oval(ctx, stone, -r*.66, r*.02, r*.35, r*.55);
    oval(ctx, stone, r*.42, -r*.78, r*.38, r*.64);
    oval(ctx, shade, r*.5, -r*1.35, r*.48, r*.42);
  } else {
    const swing = frame === 0 ? -5 : 5;
    oval(ctx, stone, -r*.72, r*.08+swing*.15, r*.34, r*.62);
    oval(ctx, stone, r*.72, r*.08-swing*.15, r*.34, r*.62);
    oval(ctx, shade, -r*.82, r*.55, r*.42, r*.36);
    oval(ctx, shade, r*.82, r*.55, r*.42, r*.36);
  }
}

function drawGenericBeast(ctx: CanvasRenderingContext2D, r: number, frame: number, level: number) {
  const dark = level >= 20 ? '#241617' : level >= 10 ? '#343028' : '#3f4432';
  const mid = level >= 20 ? '#6d2f25' : level >= 10 ? '#5f5237' : '#5c6745';
  oval(ctx, dark, 0, 0, r, r*.7);
  poly(ctx, mid, [[-r*.7,-r*.15],[-r*.45,-r*.75],[0,-r*.9],[r*.5,-r*.7],[r*.75,-r*.1],[r*.45,r*.5],[-r*.45,r*.5]]);
  px(ctx, '#d8455f', -r*.35, -r*.25, 4, 3);
  if (level > 10) {
    ctx.save(); ctx.translate(-3,-2); drawSword(ctx, frame===2 ? -1 : -.1); ctx.restore();
  }
}

export function drawDetailedMonster(ctx: CanvasRenderingContext2D, entity: Entity, time: number) {
  const r = Math.max(14, entity.radius);
  const frame = monsterFrame(entity, time);
  const name = entity.name.toLowerCase();
  ctx.save();
  shadow(ctx, r);
  if (name.includes('wolf')) drawWolf(ctx, r, frame);
  else if (name.includes('boar') || name.includes('mežac') || name.includes('meza')) drawBoar(ctx, r, frame);
  else if (name.includes('spider') || name.includes('zirnek')) drawSpider(ctx, r, frame);
  else if (name.includes('skeleton') || name.includes('skelet') || name.includes('necrom')) drawSkeleton(ctx, r, frame);
  else if (name.includes('golem') || name.includes('ash')) drawGolem(ctx, r, frame);
  else drawGenericBeast(ctx, r, frame, entity.level);
  ctx.restore();
}

export function drawDetailedBoss(ctx: CanvasRenderingContext2D, entity: Entity, time: number) {
  const r = Math.max(34, entity.radius * 1.08);
  const phase = entity.bossPhase || 1;
  ctx.save();
  ctx.strokeStyle = phase >= 2 ? '#d8455f' : '#a46f37';
  ctx.lineWidth = 3;
  ctx.setLineDash([10,8]);
  ctx.beginPath(); ctx.arc(0, r*.48, r*1.3, time*.2, time*.2 + Math.PI*2); ctx.stroke();
  ctx.setLineDash([]);
  shadow(ctx, r*1.1);

  poly(ctx, phase >= 2 ? '#6e2a29' : '#50402f', [[-r*.72,r*.66],[-r*.9,-r*.15],[-r*.55,-r*.88],[0,-r*1.1],[r*.55,-r*.88],[r*.9,-r*.15],[r*.72,r*.66]]);
  poly(ctx, '#2b2320', [[-r*.5,-r*.55],[-r*1.18,-r*.72],[-r*.72,-r*.1]]);
  poly(ctx, '#2b2320', [[r*.5,-r*.55],[r*1.18,-r*.72],[r*.72,-r*.1]]);
  poly(ctx, '#3a3026', [[-r*.34,-r*.82],[-r*.15,-r*1.28],[0,-r*1.05],[r*.15,-r*1.28],[r*.34,-r*.82],[r*.25,-r*.48],[-r*.25,-r*.48]]);
  px(ctx, phase >= 2 ? '#ff8b3a' : '#d8a84d', -r*.17, -r*.8, 5, 4);
  px(ctx, phase >= 2 ? '#ff8b3a' : '#d8a84d', r*.08, -r*.8, 5, 4);
  ctx.save(); ctx.translate(r*.15, 0); drawSword(ctx, .12); ctx.scale(1.25,1.25); ctx.restore();
  ctx.restore();
}

export function drawDecoratedOverhead(ctx: CanvasRenderingContext2D, entity: Entity, isPlayer: boolean) {
  const y = entity.y - entity.radius - 26;
  const w = Math.max(52, entity.radius * 2.2);
  const hp = Math.max(0, Math.min(1, entity.hp / Math.max(1, entity.maxHp)));
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = "700 10px Georgia, serif";
  const title = entity.isBoss ? `${entity.name.toUpperCase()}  ·  LV ${entity.level}` : `${entity.name}  ·  ${entity.level}`;
  ctx.fillStyle = 'rgba(6,5,4,.9)';
  ctx.strokeStyle = entity.isBoss ? '#7f3923' : '#4f3822';
  ctx.lineWidth = 1;
  ctx.fillRect(entity.x-w/2-10, y-13, w+20, 14);
  ctx.strokeRect(entity.x-w/2-10, y-13, w+20, 14);
  ctx.fillStyle = entity.isBoss ? '#d08a4a' : isPlayer ? '#d0a564' : '#b7a27d';
  ctx.fillText(title, entity.x, y-6);
  ctx.fillStyle = '#090706';
  ctx.fillRect(entity.x-w/2, y+4, w, 7);
  ctx.fillStyle = entity.isBoss ? '#a33b22' : '#7d2a1d';
  ctx.fillRect(entity.x-w/2+1, y+5, (w-2)*hp, 5);
  ctx.strokeStyle = '#6a5234';
  ctx.strokeRect(entity.x-w/2, y+4, w, 7);
  if (entity.guildTag) {
    ctx.font = "8px Georgia, serif";
    ctx.fillStyle = '#8f7b5b';
    ctx.fillText(`<${entity.guildTag}>`, entity.x, y-19);
  }
  ctx.restore();
}
