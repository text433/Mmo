import Phaser from 'phaser';

const W = 1280;
const H = 720;
const GROUND_Y = 590;

class GameScene extends Phaser.Scene {
  hero!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  rightHeld = false;
  leftHeld = false;
  runHeld = false;
  title!: Phaser.GameObjects.Text;

  constructor() { super('game'); }

  create() {
    this.cameras.main.setBackgroundColor('#07101d');
    this.physics.world.setBounds(0, 0, 5000, H);
    this.drawWorld();
    this.makeHeroTextures();

    this.hero = this.physics.add.sprite(240, GROUND_Y - 70, 'hero-idle-0');
    this.hero.setCollideWorldBounds(true);
    this.hero.setDepth(20);
    this.hero.body!.setSize(42, 94).setOffset(22, 18);

    this.anims.create({ key:'idle', frames:[0,1].map(i=>({key:`hero-idle-${i}`})), frameRate:2, repeat:-1 });
    this.anims.create({ key:'walk', frames:[0,1,2,3].map(i=>({key:`hero-walk-${i}`})), frameRate:8, repeat:-1 });
    this.hero.play('idle');

    this.cameras.main.startFollow(this.hero, true, 0.08, 0.08, -220, 80);
    this.cameras.main.setBounds(0, 0, 5000, H);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard!.addKey('D').on('down',()=>this.rightHeld=true).on('up',()=>this.rightHeld=false);
    this.input.keyboard!.addKey('A').on('down',()=>this.leftHeld=true).on('up',()=>this.leftHeld=false);

    this.createHud();
    this.createTouchControls();
  }

  drawWorld() {
    const far = this.add.graphics().setScrollFactor(0.15).setDepth(0);
    far.fillStyle(0x0b1a34,1).fillRect(0,0,7000,H);
    far.fillStyle(0x102854,1);
    for(let x=0;x<7000;x+=360){
      const peak=220+(x%720===0?70:0);
      far.fillTriangle(x,440,x+180,peak,x+360,440);
    }
    far.fillStyle(0x163565,1);
    for(let x=0;x<7000;x+=260){far.fillTriangle(x,500,x+130,330+(x%520?40:0),x+260,500);}

    const moon=this.add.circle(990,120,58,0xd9ecff,0.95).setScrollFactor(0.08).setDepth(1);
    moon.setStrokeStyle(4,0x8ac5ff,0.45);

    const mid=this.add.graphics().setScrollFactor(0.45).setDepth(2);
    mid.fillStyle(0x071628,1);
    for(let x=0;x<6200;x+=120){
      const h=110+(x%360===0?60:0);
      mid.fillTriangle(x,GROUND_Y-25,x+36,GROUND_Y-h,x+72,GROUND_Y-25);
      mid.fillRect(x+31,GROUND_Y-h,10,h);
    }

    const castle=this.add.graphics().setScrollFactor(0.22).setDepth(1);
    const cx=1250, cy=250;
    castle.fillStyle(0x171b32,1).fillRect(cx,cy,210,205);
    castle.fillRect(cx+25,cy-85,44,290).fillRect(cx+142,cy-115,42,320);
    castle.fillStyle(0xff9d35,0.8);
    for(const ox of [45,100,160]) castle.fillRect(cx+ox,cy+65,8,20);

    const near=this.add.graphics().setDepth(4);
    near.fillStyle(0x10281e,1).fillRect(0,GROUND_Y-28,5000,160);
    near.fillStyle(0x37653b,1).fillRect(0,GROUND_Y-28,5000,14);
    near.fillStyle(0x6b5133,1).fillRect(0,GROUND_Y-14,5000,34);
    near.fillStyle(0x2e251e,1);
    for(let x=0;x<5000;x+=42){near.fillRect(x,GROUND_Y+12,30,22);}

    const deco=this.add.graphics().setDepth(5);
    for(let x=420;x<4800;x+=520){
      deco.fillStyle(0x3a2a20,1).fillRect(x,GROUND_Y-70,12,70);
      deco.fillStyle(0xff6b1a,1).fillCircle(x+6,GROUND_Y-78,9);
      deco.fillStyle(0xffc24d,1).fillCircle(x+6,GROUND_Y-82,5);
    }
  }

  makeHeroTextures() {
    const make=(key:string,step:number,idle=false)=>{
      const g=this.make.graphics({x:0,y:0,add:false});
      g.clear();
      const bob=idle?Math.sin(step*Math.PI)*1:(step%2?2:0);
      g.fillStyle(0x000000,0.35).fillEllipse(48,112,62,16);
      // cape
      g.fillStyle(0x6d1731,1).fillTriangle(24,48+bob,8-(step%2?5:0),90,35,82);
      g.fillStyle(0x991f3e,1).fillTriangle(30,50+bob,14,84,43,77);
      // legs
      g.fillStyle(0x18253b,1).fillRect(37+(step%2?3:-2),78+bob,10,26);
      g.fillRect(52+(step%2?-3:2),78+bob,10,26);
      g.fillStyle(0x3d2b22,1).fillRect(34+(step%2?3:-2),100+bob,16,8);
      g.fillRect(49+(step%2?-3:2),100+bob,16,8);
      // torso armor
      g.fillStyle(0x1d3558,1).fillRoundedRect(31,43+bob,36,42,7);
      g.fillStyle(0x355f8f,1).fillRoundedRect(35,47+bob,28,20,5);
      g.fillStyle(0xb9873e,1).fillRect(33,69+bob,32,5);
      // shoulders
      g.fillStyle(0x7695b8,1).fillCircle(30,50+bob,9).fillCircle(68,50+bob,9);
      g.fillStyle(0x293e5f,1).fillCircle(30,50+bob,6).fillCircle(68,50+bob,6);
      // head
      g.fillStyle(0xd49a73,1).fillCircle(50,31+bob,12);
      g.fillStyle(0x3a2016,1).fillTriangle(38,30+bob,45,12+bob,60,24+bob);
      g.fillTriangle(43,18+bob,62,17+bob,59,31+bob);
      // arm + sword
      g.lineStyle(7,0x203454,1).lineBetween(61,57+bob,76,67+bob);
      g.lineStyle(4,0xd7e8f5,1).lineBetween(75,67+bob,105,78+bob);
      g.lineStyle(2,0x7fd7ff,1).lineBetween(76,66+bob,107,77+bob);
      g.fillStyle(0xe7c66a,1).fillRect(69,61+bob,5,15);
      g.generateTexture(key,120,120);
      g.destroy();
    };
    make('hero-idle-0',0,true); make('hero-idle-1',1,true);
    for(let i=0;i<4;i++) make(`hero-walk-${i}`,i,false);
  }

  createHud(){
    const hud=this.add.container(0,0).setScrollFactor(0).setDepth(100);
    const panel=this.add.rectangle(175,72,330,112,0x050912,0.82).setStrokeStyle(2,0x80643d);
    const hpBg=this.add.rectangle(196,52,250,20,0x1b1b22).setOrigin(.5);
    const hp=this.add.rectangle(196,52,236,14,0xb81f2b).setOrigin(.5);
    const mpBg=this.add.rectangle(196,80,250,16,0x1b1b22).setOrigin(.5);
    const mp=this.add.rectangle(196,80,205,10,0x2468c8).setOrigin(.5);
    const portrait=this.add.circle(48,67,34,0x202a38).setStrokeStyle(3,0xb08a52);
    const name=this.add.text(92,19,'KAROTĀJS  •  Lv. 1',{fontFamily:'serif',fontSize:'18px',color:'#f2d695'});
    const hpT=this.add.text(104,41,'120 / 120',{fontSize:'14px',color:'#ffffff'});
    const mpT=this.add.text(104,71,'50 / 50',{fontSize:'13px',color:'#ffffff'});
    const zone=this.add.text(W/2,28,'MIGLAS MEŽS — 1. CEĻŠ',{fontFamily:'serif',fontSize:'24px',color:'#f3d895',stroke:'#000',strokeThickness:5}).setOrigin(.5,0);
    hud.add([panel,hpBg,hp,mpBg,mp,portrait,name,hpT,mpT,zone]);
  }

  createTouchControls(){
    const ui=this.add.container(0,0).setScrollFactor(0).setDepth(120);
    const mkBtn=(x:number,y:number,label:string,down:()=>void,up:()=>void)=>{
      const c=this.add.circle(x,y,48,0x07111f,0.78).setStrokeStyle(3,0x7a879b).setInteractive();
      const t=this.add.text(x,y,label,{fontSize:'32px',color:'#dbe9ff'}).setOrigin(.5);
      c.on('pointerdown',down); c.on('pointerup',up); c.on('pointerout',up);
      ui.add([c,t]);
    };
    mkBtn(86,H-86,'◀',()=>this.leftHeld=true,()=>this.leftHeld=false);
    mkBtn(190,H-86,'▶',()=>this.rightHeld=true,()=>this.rightHeld=false);
    mkBtn(W-92,H-92,'⚔',()=>this.runHeld=true,()=>this.runHeld=false);
  }

  update(){
    const right=this.rightHeld||this.cursors.right.isDown;
    const left=this.leftHeld||this.cursors.left.isDown;
    const speed=this.runHeld?250:170;
    if(right&&!left){
      this.hero.setVelocityX(speed); this.hero.setFlipX(false);
      if(this.hero.anims.currentAnim?.key!=='walk') this.hero.play('walk');
    } else if(left&&!right){
      this.hero.setVelocityX(-speed); this.hero.setFlipX(true);
      if(this.hero.anims.currentAnim?.key!=='walk') this.hero.play('walk');
    } else {
      this.hero.setVelocityX(0);
      if(this.hero.anims.currentAnim?.key!=='idle') this.hero.play('idle');
    }
    this.hero.y=GROUND_Y-70;
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: W,
  height: H,
  backgroundColor: '#08111f',
  physics:{default:'arcade',arcade:{gravity:{x:0,y:0},debug:false}},
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  scene:[GameScene]
});
