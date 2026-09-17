import Phaser from 'phaser';

const W=1280,H=720;
const S={stage:1,hp:100,maxHp:100,xp:0,gold:0,kills:0,gear:0};

class Game extends Phaser.Scene{
 create(){
  this.cameras.main.setBackgroundColor('#08090b');
  this.drawWorld(); this.hero=this.makeHero(250,470); this.spawn(); this.hud();
  this.time.addEvent({delay:650,loop:true,callback:()=>this.tick()});
 }
 drawWorld(){
  const g=this.add.graphics();
  g.fillGradientStyle(0x090b10,0x090b10,0x24100d,0x100b0b,1);g.fillRect(0,0,W,H);
  g.fillStyle(0x6e1714,.28);g.fillCircle(1050,120,105);
  g.fillStyle(0x050609,1);g.fillTriangle(900,330,1010,90,1120,330);g.fillRect(960,190,100,150);
  for(let x=0;x<W;x+=95){g.fillStyle(x%190?0x171416:0x211719,1);g.fillRect(x,510,92,80);g.lineStyle(2,0x39282a,.6);g.strokeRect(x,510,92,80)}
  for(let x=40;x<W;x+=180){g.fillStyle(0x151217,1);g.fillRect(x,280,25,230);g.fillStyle(0x3a2923,1);g.fillRect(x-8,275,41,15);g.fillStyle(0xb54b20,.8);g.fillCircle(x+12,330,8);g.fillStyle(0xff8a38,.35);g.fillCircle(x+12,330,25)}
  g.fillStyle(0x050506,.8);g.fillRect(0,590,W,130);
 }
 makeHero(x,y){const c=this.add.container(x,y);let g=this.add.graphics();
  g.fillStyle(0x17191d);g.fillCircle(0,-105,25);g.fillStyle(0x4b5058);g.fillTriangle(-25,-118,0,-150,25,-118);
  g.fillStyle(0x30343a);g.fillRoundedRect(-30,-90,60,85,10);g.lineStyle(5,0x8a6238);g.strokeRoundedRect(-30,-90,60,85,10);
  g.fillStyle(0x22252a);g.fillRect(-23,-5,18,55);g.fillRect(8,-5,18,55);
  g.lineStyle(9,0x7b552d);g.lineBetween(30,-75,64,-12);g.lineStyle(5,0xb7a06b);g.lineBetween(55,-95,78,-5);
  g.fillStyle(0x3a2d25);g.fillCircle(-43,-55,34);g.lineStyle(5,0x9b7445);g.strokeCircle(-43,-55,34);g.fillStyle(0x9b7445);g.fillTriangle(-58,-60,-28,-60,-43,-35);
  c.add(g); return c}
 makeEnemy(x,y,boss){const c=this.add.container(x,y);let g=this.add.graphics();
  if(boss){g.fillStyle(0x09090b);g.fillRoundedRect(-50,-150,100,155,16);g.lineStyle(6,0x7b201b);g.strokeRoundedRect(-50,-150,100,155,16);g.fillStyle(0x202126);g.fillCircle(0,-165,40);g.fillStyle(0xb42019);g.fillCircle(-14,-170,5);g.fillCircle(14,-170,5);g.lineStyle(11,0x3b3030);g.lineBetween(45,-120,80,-15)}
  else{g.lineStyle(12,0xb7ad96);g.lineBetween(0,-90,0,-15);g.lineBetween(0,-65,-35,-25);g.lineBetween(0,-65,35,-25);g.lineBetween(0,-15,-25,40);g.lineBetween(0,-15,25,40);g.fillStyle(0xd3c8aa);g.fillCircle(0,-112,25);g.fillStyle(0x170b09);g.fillCircle(-8,-115,4);g.fillCircle(8,-115,4);}
  c.add(g);return c}
 spawn(){this.boss=S.kills>0&&S.kills%5===0;this.enemyHp=this.boss?180:55+S.stage*10;this.enemyMax=this.enemyHp;this.enemy=this.makeEnemy(1000,470,this.boss);this.enemyName=this.add.text(1000,245,this.boss?'THE FALLEN WARDEN':'CRYPT SKELETON',{fontFamily:'serif',fontSize:this.boss?'24px':'17px',color:this.boss?'#c94a3e':'#c8b99b',fontStyle:'bold'}).setOrigin(.5);this.eb=this.add.graphics();this.drawEB()}
 drawEB(){this.eb.clear();this.eb.fillStyle(0x160b0b).fillRect(910,275,180,10);this.eb.fillStyle(this.boss?0xa92820:0x6f1f1b).fillRect(910,275,180*Math.max(0,this.enemyHp/this.enemyMax),10)}
 tick(){if(!this.enemy)return;let d=this.enemy.x-this.hero.x;if(d>190){this.hero.x+=16;return}this.enemyHp-=10+S.stage*1.5;S.hp-=this.boss?9:4;this.drawEB();if(S.hp<=0){S.hp=S.maxHp;S.gold=Math.max(0,S.gold-10);this.hero.x=250}if(this.enemyHp<=0){S.kills++;S.gold+=this.boss?100:12;S.xp+=this.boss?80:20;if(this.boss){S.stage++;S.gear=Math.min(3,S.gear+1)}this.enemy.destroy();this.enemyName.destroy();this.eb.destroy();this.hero.x=250;this.spawn()}this.updateHud()}
 hud(){const g=this.add.graphics();g.fillStyle(0x08090c,.96).fillRect(0,0,W,78);g.lineStyle(3,0x6e4b2d).lineBetween(0,77,W,77);g.fillStyle(0x09090b,.96).fillRect(0,610,W,110);g.lineStyle(3,0x6e4b2d).lineBetween(0,610,W,610);
  this.title=this.add.text(28,16,'DARK IDLE RPG',{fontFamily:'serif',fontSize:'25px',color:'#c5a66b',fontStyle:'bold'});this.stats=this.add.text(28,50,'',{fontFamily:'monospace',fontSize:'15px',color:'#c8b99b'});
  this.add.text(460,630,'⚔  CHARACTER     🎒  INVENTORY     ✦  SKILLS     ☠  BOSS',{fontFamily:'serif',fontSize:'20px',color:'#b99961'});
  this.add.text(1040,22,'AUTO PROGRESS',{fontFamily:'monospace',fontSize:'14px',color:'#8e7858'});this.updateHud()}
 updateHud(){this.stats.setText(`STAGE ${S.stage}    HP ${S.hp}/${S.maxHp}    XP ${S.xp}    GOLD ${S.gold}    KILLS ${S.kills}`)}
}
new Phaser.Game({type:Phaser.AUTO,width:W,height:H,parent:'game',backgroundColor:'#08090b',scene:Game,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH}});
