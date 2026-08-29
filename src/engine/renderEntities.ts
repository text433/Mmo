import { Entity } from '../types/game';

function metal(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, dark='#17130f', mid='#4d3a26', light='#a9783d') {
  const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,dark);g.addColorStop(.5,mid);g.addColorStop(1,light);return g;
}

function shadow(ctx: CanvasRenderingContext2D, r:number){
  ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(0,r*.7,r*1.05,r*.35,0,0,Math.PI*2);ctx.fill();
}

function drawSword(ctx: CanvasRenderingContext2D, scale=1){
  ctx.save();ctx.scale(scale,scale);
  ctx.fillStyle='#2b2117';ctx.fillRect(8,-4,17,8);
  ctx.fillStyle='#8c6335';ctx.fillRect(20,-7,5,14);
  ctx.fillStyle=metal(ctx,25,-3,55,3,'#302b25','#7c7468','#c7b58e');
  ctx.beginPath();ctx.moveTo(25,-4);ctx.lineTo(53,-2);ctx.lineTo(61,0);ctx.lineTo(53,2);ctx.lineTo(25,4);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#15120f';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
}

function drawBow(ctx: CanvasRenderingContext2D){
  ctx.strokeStyle='#6d4524';ctx.lineWidth=3;ctx.beginPath();ctx.arc(24,0,27,-1.15,1.15);ctx.stroke();
  ctx.strokeStyle='#b9a781';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(35,-24);ctx.lineTo(20,0);ctx.lineTo(35,24);ctx.stroke();
}

function drawStaff(ctx: CanvasRenderingContext2D){
  ctx.strokeStyle='#3a2516';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(8,18);ctx.lineTo(34,-28);ctx.stroke();
  ctx.strokeStyle='#87582b';ctx.lineWidth=2;ctx.stroke();
  const g=ctx.createRadialGradient(34,-30,1,34,-30,12);g.addColorStop(0,'#e0a04e');g.addColorStop(.35,'#7a331d');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(34,-30,12,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#5f2717';ctx.beginPath();ctx.moveTo(34,-40);ctx.lineTo(41,-28);ctx.lineTo(34,-20);ctx.lineTo(27,-28);ctx.closePath();ctx.fill();
}

export function drawDetailedHumanoid(ctx: CanvasRenderingContext2D, color: string, classType: string, time: number, isMoving: boolean, isPlayer: boolean) {
  const bob=isMoving?Math.sin(time*10)*1.5:Math.sin(time*2)*.5;
  ctx.save();ctx.translate(0,bob);shadow(ctx,18);

  // cloak silhouette
  ctx.fillStyle=isPlayer?'#18100d':'#12100e';ctx.beginPath();ctx.moveTo(-11,-11);ctx.lineTo(-19,20);ctx.lineTo(0,25);ctx.lineTo(19,20);ctx.lineTo(11,-11);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#3d2819';ctx.lineWidth=2;ctx.stroke();

  // armored legs
  ctx.fillStyle='#211b16';ctx.fillRect(-10,10,7,15);ctx.fillRect(3,10,7,15);
  ctx.fillStyle='#4f3824';ctx.fillRect(-11,20,9,5);ctx.fillRect(2,20,9,5);

  // torso breastplate
  const torso=metal(ctx,-16,-15,16,16,'#13110f','#3b3024',isPlayer?'#8a6233':'#62482e');
  ctx.fillStyle=torso;ctx.beginPath();ctx.moveTo(-14,-13);ctx.lineTo(-19,0);ctx.lineTo(-11,15);ctx.lineTo(0,18);ctx.lineTo(11,15);ctx.lineTo(19,0);ctx.lineTo(14,-13);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#1a140f';ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle='#8b5e2d';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-10,-4);ctx.lineTo(0,2);ctx.lineTo(10,-4);ctx.moveTo(0,2);ctx.lineTo(0,14);ctx.stroke();

  // pauldrons
  ctx.fillStyle=metal(ctx,-24,-14,-10,0,'#17130f','#4e3825','#9a6730');
  ctx.beginPath();ctx.arc(-16,-9,8,2.8,6.1);ctx.lineTo(-8,-6);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(16,-9,8,3.3,.35);ctx.lineTo(8,-6);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#22160f';ctx.stroke();

  // head + hood/helmet is class-specific
  if(classType==='mage'){
    ctx.fillStyle='#171016';ctx.beginPath();ctx.moveTo(-10,-15);ctx.lineTo(0,-33);ctx.lineTo(11,-15);ctx.lineTo(7,-5);ctx.lineTo(-7,-5);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#69402a';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#b37b3a';ctx.beginPath();ctx.arc(0,-14,2.3,0,Math.PI*2);ctx.fill();
    drawStaff(ctx);
  } else if(classType==='ranger'){
    ctx.fillStyle='#171611';ctx.beginPath();ctx.moveTo(-11,-16);ctx.quadraticCurveTo(0,-31,11,-16);ctx.lineTo(7,-7);ctx.lineTo(-7,-7);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#4e4227';ctx.lineWidth=2;ctx.stroke();drawBow(ctx);
  } else {
    ctx.fillStyle=metal(ctx,-11,-27,11,-7,'#151310','#4a4032','#8e754f');ctx.beginPath();ctx.arc(0,-16,11,Math.PI,Math.PI*2);ctx.lineTo(9,-7);ctx.lineTo(-9,-7);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#211a13';ctx.lineWidth=2;ctx.stroke();
    if(classType==='paladin'){
      ctx.strokeStyle='#aa7838';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(0,-8);ctx.moveTo(-5,-17);ctx.lineTo(5,-17);ctx.stroke();
    }
    drawSword(ctx,1);
  }

  // class accent engraved into armor, not a neon blob
  ctx.strokeStyle=color;ctx.globalAlpha=.28;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,2,6,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
  ctx.restore();
}

function monsterPalette(level:number){
  if(level>=22)return {skin:'#17100e',mid:'#3d2119',edge:'#8b3c25',eye:'#e06a2f'};
  if(level>=14)return {skin:'#171513',mid:'#332a22',edge:'#6f4b2c',eye:'#c98a3d'};
  if(level>=7)return {skin:'#1d2119',mid:'#35402a',edge:'#58653a',eye:'#aa8b46'};
  return {skin:'#24261f',mid:'#3c4232',edge:'#566046',eye:'#8e7b47'};
}

function claw(ctx:CanvasRenderingContext2D,x:number,y:number,flip=1){
  ctx.save();ctx.translate(x,y);ctx.scale(flip,1);ctx.fillStyle='#73644e';
  for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(0,i*4-4);ctx.lineTo(11,i*4-2);ctx.lineTo(1,i*4);ctx.closePath();ctx.fill();}
  ctx.restore();
}

function monsterWeapon(ctx:CanvasRenderingContext2D,level:number){
  if(level<=10)return;
  if(level<18){
    ctx.save();ctx.rotate(.25);ctx.fillStyle='#24180f';ctx.fillRect(12,-3,28,6);ctx.fillStyle='#6d6457';ctx.beginPath();ctx.moveTo(38,-9);ctx.lineTo(51,0);ctx.lineTo(38,9);ctx.closePath();ctx.fill();ctx.restore();
  }else{
    ctx.save();ctx.rotate(.18);ctx.strokeStyle='#7c5027';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(46,0);ctx.stroke();ctx.fillStyle='#692718';ctx.beginPath();ctx.moveTo(37,-13);ctx.lineTo(56,0);ctx.lineTo(37,13);ctx.lineTo(43,0);ctx.closePath();ctx.fill();ctx.restore();
  }
}

export function drawDetailedMonster(ctx: CanvasRenderingContext2D, entity: Entity, time: number) {
  const r=Math.max(12,entity.radius);const p=monsterPalette(entity.level);const pulse=Math.sin(time*3+entity.x*.01)*.04;
  ctx.save();shadow(ctx,r);

  if(entity.name.toLowerCase().includes('wolf')){
    ctx.fillStyle=p.skin;ctx.beginPath();ctx.ellipse(0,2,r*1.05,r*.62,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=p.mid;ctx.beginPath();ctx.moveTo(r*.45,-7);ctx.lineTo(r*1.2,-13);ctx.lineTo(r*1.0,7);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-r*.7,-4);ctx.lineTo(-r*1.25,-15);ctx.lineTo(-r*1.05,2);ctx.closePath();ctx.fill();
    ctx.fillStyle=p.eye;ctx.beginPath();ctx.arc(r*.85,-7,2.3,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=p.edge;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.6,r*.35);ctx.lineTo(-r*.72,r*.95);ctx.moveTo(r*.25,r*.4);ctx.lineTo(r*.3,r*.98);ctx.stroke();
  } else if(entity.name.toLowerCase().includes('skeleton') || entity.name.toLowerCase().includes('necrom')){
    ctx.strokeStyle='#8e8169';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(0,12);ctx.moveTo(-12,-2);ctx.lineTo(12,2);ctx.moveTo(0,12);ctx.lineTo(-9,24);ctx.moveTo(0,12);ctx.lineTo(9,24);ctx.stroke();
    ctx.fillStyle='#a49678';ctx.beginPath();ctx.arc(0,-16,r*.48,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#120d0a';ctx.beginPath();ctx.arc(-4,-18,2.5,0,Math.PI*2);ctx.arc(4,-18,2.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=p.eye;ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(4,-18,1.3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    monsterWeapon(ctx,entity.level);
  } else {
    // goblin/slime/golem become a hunched armored beast silhouette instead of blobs
    ctx.fillStyle=p.skin;ctx.beginPath();ctx.moveTo(-r*.9,r*.6);ctx.quadraticCurveTo(-r*1.05,-r*.5,0,-r*.8);ctx.quadraticCurveTo(r*1.1,-r*.45,r*.9,r*.6);ctx.closePath();ctx.fill();
    ctx.fillStyle=p.mid;ctx.beginPath();ctx.moveTo(-r*.65,-r*.1);ctx.lineTo(0,-r*.55);ctx.lineTo(r*.68,-r*.08);ctx.lineTo(r*.45,r*.42);ctx.lineTo(-r*.48,r*.42);ctx.closePath();ctx.fill();
    ctx.strokeStyle=p.edge;ctx.lineWidth=2.5;ctx.stroke();
    // horns / jagged head
    ctx.fillStyle='#51432f';ctx.beginPath();ctx.moveTo(-r*.55,-r*.48);ctx.lineTo(-r*.88,-r*1.05);ctx.lineTo(-r*.18,-r*.62);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(r*.55,-r*.48);ctx.lineTo(r*.88,-r*1.05);ctx.lineTo(r*.18,-r*.62);ctx.closePath();ctx.fill();
    ctx.fillStyle=p.eye;ctx.globalAlpha=.9+pulse;ctx.beginPath();ctx.arc(-r*.23,-r*.28,2.2,0,Math.PI*2);ctx.arc(r*.23,-r*.28,2.2,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    claw(ctx,-r*.85,r*.15,-1);claw(ctx,r*.85,r*.15,1);monsterWeapon(ctx,entity.level);
  }
  ctx.restore();
}

export function drawDetailedBoss(ctx: CanvasRenderingContext2D, entity: Entity, time: number) {
  const r=Math.max(30,entity.radius*1.08);const phase=entity.bossPhase||1;
  ctx.save();
  // ritual aura under boss
  ctx.strokeStyle=phase>=2?'rgba(162,55,27,.65)':'rgba(148,91,39,.55)';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(0,r*.45,r*1.45,0,Math.PI*2);ctx.stroke();
  ctx.setLineDash([14,9]);ctx.beginPath();ctx.arc(0,r*.45,r*1.12,time*.2,time*.2+Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  shadow(ctx,r*1.1);

  // giant plated body
  ctx.fillStyle=metal(ctx,-r,-r,r,r,'#0d0b09','#322018',phase>=2?'#7e3020':'#6f4a28');
  ctx.beginPath();ctx.moveTo(-r*.78,r*.65);ctx.lineTo(-r*.95,-r*.2);ctx.lineTo(-r*.55,-r*.92);ctx.lineTo(0,-r*1.16);ctx.lineTo(r*.55,-r*.92);ctx.lineTo(r*.95,-r*.2);ctx.lineTo(r*.78,r*.65);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#150e0a';ctx.lineWidth=4;ctx.stroke();

  // huge spiked pauldrons
  ctx.fillStyle='#241713';
  for(const s of [-1,1]){
    ctx.beginPath();ctx.moveTo(s*r*.42,-r*.64);ctx.lineTo(s*r*1.25,-r*.74);ctx.lineTo(s*r*.78,-r*.25);ctx.closePath();ctx.fill();
    ctx.fillStyle='#6b4326';ctx.beginPath();ctx.moveTo(s*r*.78,-r*.68);ctx.lineTo(s*r*1.32,-r*1.16);ctx.lineTo(s*r*.97,-r*.5);ctx.closePath();ctx.fill();ctx.fillStyle='#241713';
  }

  // horned helm
  ctx.fillStyle='#17120f';ctx.beginPath();ctx.moveTo(-r*.38,-r*.92);ctx.lineTo(-r*.18,-r*1.35);ctx.lineTo(0,-r*1.14);ctx.lineTo(r*.18,-r*1.35);ctx.lineTo(r*.38,-r*.92);ctx.lineTo(r*.28,-r*.52);ctx.lineTo(-r*.28,-r*.52);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#85552c';ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle=phase>=2?'#e05b2c':'#d09945';ctx.beginPath();ctx.arc(-r*.13,-r*.82,3.5,0,Math.PI*2);ctx.arc(r*.13,-r*.82,3.5,0,Math.PI*2);ctx.fill();

  // massive cleaver
  ctx.save();ctx.rotate(.18);ctx.strokeStyle='#4a2d18';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(r*.15,0);ctx.lineTo(r*1.22,0);ctx.stroke();
  ctx.fillStyle=metal(ctx,r*.85,-r*.35,r*1.55,r*.35,'#221b16','#5e5142','#a28b66');ctx.beginPath();ctx.moveTo(r*.83,-r*.22);ctx.lineTo(r*1.5,-r*.42);ctx.lineTo(r*1.65,0);ctx.lineTo(r*1.46,r*.34);ctx.lineTo(r*.86,r*.2);ctx.closePath();ctx.fill();ctx.strokeStyle='#160f0b';ctx.lineWidth=3;ctx.stroke();ctx.restore();

  // ember vents
  ctx.fillStyle='rgba(191,73,28,.7)';for(let i=0;i<4;i++){const a=time*1.2+i*Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(a)*r*.58,Math.sin(a)*r*.32,2+i%2,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

export function drawDecoratedOverhead(ctx: CanvasRenderingContext2D, entity: Entity, isPlayer: boolean) {
  const y=entity.y-entity.radius-26;const w=Math.max(52,entity.radius*2.2);const hp=Math.max(0,Math.min(1,entity.hp/Math.max(1,entity.maxHp)));
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font="700 10px Georgia, serif";
  const title=entity.isBoss?`${entity.name.toUpperCase()}  ·  LV ${entity.level}`:`${entity.name}  ·  ${entity.level}`;
  ctx.fillStyle='rgba(6,5,4,.9)';ctx.strokeStyle=entity.isBoss?'#7f3923':'#4f3822';ctx.lineWidth=1;ctx.fillRect(entity.x-w/2-10,y-13,w+20,14);ctx.strokeRect(entity.x-w/2-10,y-13,w+20,14);
  ctx.fillStyle=entity.isBoss?'#d08a4a':isPlayer?'#d0a564':'#b7a27d';ctx.fillText(title,entity.x,y-6);
  ctx.fillStyle='#090706';ctx.fillRect(entity.x-w/2,y+4,w,7);
  const hg=ctx.createLinearGradient(entity.x-w/2,y,entity.x+w/2,y);hg.addColorStop(0,'#4d120e');hg.addColorStop(1,entity.isBoss?'#a33b22':'#7d2a1d');ctx.fillStyle=hg;ctx.fillRect(entity.x-w/2+1,y+5,(w-2)*hp,5);
  ctx.strokeStyle='#6a5234';ctx.strokeRect(entity.x-w/2,y+4,w,7);
  if(entity.guildTag){ctx.font="8px Georgia, serif";ctx.fillStyle='#8f7b5b';ctx.fillText(`<${entity.guildTag}>`,entity.x,y-19);}
  ctx.restore();
}
