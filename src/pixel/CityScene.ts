import * as Phaser from "phaser";
import skyline from '@/assets/pixel-calm-sky.jpg';
import buildings from '@/assets/pixel-buildings.png';
import { districts } from '@/game/data';
import { sound, unlockAudio } from '@/game/audio';
import { ink, makeTextures } from './art';
import { Enemies, enemyTextures } from './enemies';
import { worldTextures, decorateWorld } from './world';
import { combatRules, damageHearts } from './rules';
import { levels } from './levels';
import { bridgeStage, nextJump, PIXEL_RULES, touch, usePixel } from './state';

type Surface = Phaser.Physics.Arcade.Image & { born?: number; homeX?: number; homeY?: number; moving?: boolean; previousX?: number; timed?: boolean; spring?: boolean; conveyor?: boolean };
export class CityScene extends Phaser.Scene {
  private hero?: Phaser.Physics.Arcade.Sprite;
  private surfaces: Surface[] = [];
  private coins: Phaser.Physics.Arcade.Image[] = [];
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private jumps = 0;
  private jumpLatch = false;
  private wasBlocked = false;
  private interactLatch = false;
  private checkpointX = 68;
  private restartKey = 0;
  private clock = 0;
  private dust?: Phaser.GameObjects.Graphics;
  private falls: Phaser.GameObjects.TileSprite[] = [];
  private bg?: Phaser.GameObjects.Image;
  private sign: Phaser.GameObjects.Text[] = [];
  private enemies?: Enemies;
  private immuneUntil = 0;
  private shieldUntil = 0;
  private speedUntil = 0;
  private wasGrounded = true;
  private springUntil = 0;
  private pickups: Phaser.Physics.Arcade.Image[] = [];
  private activeLevel = levels[0];
  private checkpointY = 480;
  private openedGoal = false;
  constructor() { super('CareerCity'); }
  preload() { this.load.image('skyline', skyline); this.load.spritesheet('buildings', buildings, { frameWidth: 274, frameHeight: 640 }); }
  create() {
    if(!this.textures.exists('terrain')){makeTextures(this);worldTextures(this);enemyTextures(this);}
    this.activeLevel=levels[usePixel.getState().level]??levels[0];if(!this.activeLevel)return;
    this.surfaces=[];this.coins=[];this.falls=[];this.pickups=[];this.sign=[];this.clock=0;this.immuneUntil=0;this.shieldUntil=0;this.speedUntil=0;this.jumps=0;this.checkpointX=90;this.checkpointY=480;this.openedGoal=false;this.jumpLatch=false;this.interactLatch=false;this.wasGrounded=false;this.wasBlocked=false;this.springUntil=0;
     this.cameras.main.setBackgroundColor(ink.sky).setOrigin(0,0);
    this.bg = this.add.image(0, 0, 'skyline').setOrigin(0).setScrollFactor(0).setDepth(-20);
    const moon=this.add.image(120,60,'moon').setScrollFactor(0).setDepth(-19);this.tweens.add({targets:moon,y:52,duration:4200,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    for(let n=0;n<26;n++){const star=this.add.image(20+((n*137)%700),8+((n*53)%150),'star').setScrollFactor(0).setDepth(-18).setAlpha(.4+(n%4)*.2).setScale(n%3===0?1:.6);this.tweens.add({targets:star,alpha:.15,duration:600+(n%5)*260,yoyo:true,repeat:-1,delay:n*90});}
    for(let n=0;n<4;n++){const cloud=this.add.image(n*190+40,50+n*34,'cloud').setScrollFactor(0).setDepth(-17).setAlpha(.8).setScale(.9+(n%2)*.5);this.tweens.add({targets:cloud,x:cloud.x+70+n*25,duration:9000+n*3500,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});}
    const ground = 440;
    const createSurface = (x:number,y:number,width:number,key='terrain') => {
      const platform = this.physics.add.image(x, y, key) as Surface;
      if(key==='terrain'){this.add.tileSprite(x,y,width,100,'terrain').setOrigin(.5,0);platform.setVisible(false);}
      platform.setOrigin(.5,0).setDisplaySize(width,key==='terrain'?100:16).setImmovable(true);
      const body=platform.body; if(body instanceof Phaser.Physics.Arcade.Body){body.setAllowGravity(false);body.setSize(platform.width, key==='terrain'?8:platform.height);body.setOffset(0,0);}
      this.surfaces.push(platform); return platform;
    };
    const level=this.activeLevel;
    for(const [index,island] of level.islands.entries()){
      createSurface(island.x,island.y,island.width);
      for(let n=0;n<3;n++){const coin=this.physics.add.image(island.x-45+n*45,island.y-38-(n%2)*12,'coin').setDepth(4).setImmovable(true);const body=coin.body;if(body instanceof Phaser.Physics.Arcade.Body)body.setAllowGravity(false);this.coins.push(coin);this.tweens.add({targets:coin,y:coin.y-5,duration:700+n*100,yoyo:true,repeat:-1});this.tweens.add({targets:coin,scaleX:.25,duration:420,yoyo:true,repeat:-1,delay:n*140,ease:'Sine.easeInOut'});}
      if(index%2===1){const fall=this.add.tileSprite(island.x+45,island.y+6,18,240,'waterfall').setOrigin(.5,0).setDepth(2);this.falls.push(fall);for(let n=0;n<3;n++){const drop=this.add.image(island.x+38+n*7,island.y+230,'sparkle').setDepth(3).setScale(.7);this.tweens.add({targets:drop,y:island.y+10,alpha:0,duration:900+n*300,repeat:-1,delay:n*320});}}
      if(level.checkpoints.includes(island.x)){const flag=this.add.image(island.x-60,island.y,'flag').setOrigin(.5,1);this.tweens.add({targets:flag,scaleX:.8,duration:500,yoyo:true,repeat:-1});}
    }
    const goal=level.goal;
    const building=this.add.image(goal,442,'buildings',level.id).setOrigin(.5,1).setDisplaySize(180,level.id===2?300:260).setDepth(0);
    building.setInteractive({useHandCursor:true}).on('pointerdown',(pointer:Phaser.Input.Pointer)=>{const target=pointer.event?.target;if(target!==this.game.canvas)return;const s=usePixel.getState();if(s.nearby===level.id&&!s.map&&!s.paused&&!s.levelDone&&s.panel===null)s.visit(level.id);});
    const glow=this.add.ellipse(goal,442,230,26,Phaser.Display.Color.HexStringToColor(ink.cyan).color,.28).setDepth(-1);this.tweens.add({targets:glow,alpha:.1,scaleX:1.15,duration:1100,yoyo:true,repeat:-1});
    const marker=this.add.text(goal,168,'▼',{fontFamily:'monospace',fontSize:'22px',color:ink.gold}).setOrigin(.5).setDepth(3);this.tweens.add({targets:marker,y:156,duration:600,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    this.add.text(goal,140,level.name.toUpperCase(),{fontFamily:'monospace',fontSize:'13px',color:ink.white,backgroundColor:ink.outline,padding:{x:8,y:6}}).setOrigin(.5).setDepth(3);
    decorateWorld(this,level.id,level.islands.map(p=>({x:p.x,y:p.y})));
    for(const layout of level.ledges){const platform=createSurface(layout.x,layout.y,layout.width,layout.key);platform.timed=Boolean(layout.timed);platform.spring=Boolean(layout.spring);platform.conveyor=Boolean(layout.conveyor);if(layout.key==='plank'){platform.born=-1;platform.homeX=platform.x;platform.homeY=platform.y;}if(layout.moving){platform.moving=true;platform.homeX=platform.x;platform.homeY=platform.y;platform.previousX=platform.x;}}
    const reward=level.ledges[3];if(reward){const pickup=this.physics.add.image(reward.x,reward.y-25,level.id%2?'speed':'shield').setDepth(4).setScale(.65).setImmovable(true).setData('power',level.id%2?'speed':'shield');const body=pickup.body;if(body instanceof Phaser.Physics.Arcade.Body)body.setAllowGravity(false);this.pickups.push(pickup);}
    this.add.text(90,443,'START',{fontFamily:'monospace',fontSize:'16px',color:ink.white,backgroundColor:ink.bark,padding:{x:8,y:5}}).setOrigin(.5);
    this.hero=this.physics.add.sprite(90,462,'hero0').setDepth(5);
    this.hero.setCollideWorldBounds(false);this.hero.setMaxVelocity(230,600);this.hero.setDragX(1000);
    const heroBody=this.hero.body;if(heroBody instanceof Phaser.Physics.Arcade.Body){heroBody.setSize(14,32);heroBody.setOffset(5,4);}
    this.physics.add.collider(this.hero,this.surfaces,(_player,object)=>{
      const surface=object as Surface;const hero=this.hero;if(!hero || !(hero.body instanceof Phaser.Physics.Arcade.Body))return;
      if(hero.body.touching.down && hero.y < surface.y){if(surface.born===-1)surface.born=this.clock;if(surface.spring&&this.clock>this.springUntil){this.springUntil=this.clock+300;hero.setVelocityY(-440);this.play('double');}}
    },(_player,object)=>{const hero=this.hero;const surface=object as Surface;if(!hero||!(hero.body instanceof Phaser.Physics.Arcade.Body))return false;return hero.body.velocity.y>=0&&hero.body.prev.y+hero.body.height<=surface.y+8;});
    this.physics.add.overlap(this.hero,this.coins,(_hero,coin)=>{
      const id=this.coins.indexOf(coin as Phaser.Physics.Arcade.Image);if(id<0)return;usePixel.getState().collect(id);(coin as Phaser.Physics.Arcade.Image).disableBody(true,true);this.burst((coin as Phaser.Physics.Arcade.Image).x,(coin as Phaser.Physics.Arcade.Image).y,ink.gold);this.play('coin');
    });
    this.enemies=new Enemies(this,level.enemies);
    this.physics.add.overlap(this.hero,this.pickups,(_hero,item)=>{const pickup=item as Phaser.Physics.Arcade.Image;if(pickup.getData('power')==='shield')this.shieldUntil=this.clock+combatRules.shieldDuration;else this.speedUntil=this.clock+combatRules.speedDuration;pickup.disableBody(true,true);this.burst(pickup.x,pickup.y,ink.cyan);this.play('checkpoint');});
    if(this.input.keyboard){const K=Phaser.Input.Keyboard.KeyCodes;this.keys=this.input.keyboard.addKeys({A:K.A,D:K.D,LEFT:K.LEFT,RIGHT:K.RIGHT,SPACE:K.SPACE,W:K.W,UP:K.UP,SHIFT:K.SHIFT,E:K.E,ESC:K.ESC}) as Record<string,Phaser.Input.Keyboard.Key>;this.input.keyboard.on('keydown-ESC',()=>{const s=usePixel.getState();if(s.panel!==null)s.set({panel:null});else if(s.map)s.set({map:false});else s.set({paused:!s.paused});});}
    this.dust=this.add.graphics().setDepth(6);
    this.scale.on('resize',this.frame,this);this.events.once('shutdown',()=>{this.scale.off('resize',this.frame,this);this.input.keyboard?.removeAllListeners('keydown-ESC');});this.frame();this.restartKey=usePixel.getState().restartKey;
  }
  private frame() {
    const {width,height}=this.scale;const zoom=width<700?1:2;
    this.cameras.main.setZoom(zoom);this.cameras.main.scrollY=440-height/zoom*.68;this.cameras.main.scrollX=0;
    this.bg?.setDisplaySize(width/zoom+220,height/zoom).setPosition(0,0);
  }
  private burst(x:number,y:number,color:string) {for(let n=0;n<7;n++){const p=this.add.rectangle(x,y,3,3,Phaser.Display.Color.HexStringToColor(color).color).setDepth(6);this.tweens.add({targets:p,x:x+Math.cos(n)*22,y:y+Math.sin(n)*22,alpha:0,duration:380,onComplete:()=>p.destroy()});}}
  private respawn(){this.hero?.setPosition(this.checkpointX,this.checkpointY-70).setVelocity(0,0);this.jumps=0;this.immuneUntil=this.clock+combatRules.immunity;this.enemies?.reset();usePixel.getState().set({hearts:3});this.play('land');}
  private hurt(){const state=usePixel.getState();const result=damageHearts(state.hearts,this.clock,this.immuneUntil,this.shieldUntil);if(!result.damaged)return;state.set({hearts:result.hearts});this.immuneUntil=this.clock+combatRules.immunity;this.hero?.setVelocityY(-135);this.burst(this.hero?.x??0,this.hero?.y??0,ink.pink);this.cameras.main.shake(110,.002);this.play('break');if(result.respawn)this.respawn();}
  private play(kind: Parameters<typeof sound>[0]) { if(usePixel.getState().muted)return;unlockAudio();sound(kind); }
  override update(_time:number,rawDelta:number) {
    const hero=this.hero;if(!hero || !(hero.body instanceof Phaser.Physics.Arcade.Body))return;
    const state=usePixel.getState();
    if(state.restartKey!==this.restartKey){this.scene.restart();return;}
    const blocked=!state.started||state.levelDone||state.paused||state.panel!==null||state.map||state.complete;
    if(blocked){this.wasBlocked=true;this.physics.world.pause();hero.setAccelerationX(0);this.keys && Object.values(this.keys).forEach(key=>key.reset());this.jumpLatch=false;touch.jump=false;this.interactLatch=true;return;}
    if(this.wasBlocked){this.wasBlocked=false;this.keys && Object.values(this.keys).forEach(key=>key.reset());this.interactLatch=false;}
    this.physics.world.resume();
    const dt=Math.min(rawDelta,50);this.clock+=dt;
    const keys=this.keys;const left=keys?.['A']?.isDown||keys?.['LEFT']?.isDown||touch.left;const right=keys?.['D']?.isDown||keys?.['RIGHT']?.isDown||touch.right;
    const sprint=keys?.['SHIFT']?.isDown||touch.sprint;hero.setMaxVelocity(this.clock<this.speedUntil?210:sprint?225:155,600);hero.setAccelerationX(left?-1100:right?1100:0);
    if(left)hero.setFlipX(true);if(right)hero.setFlipX(false);
    const grounded=hero.body.blocked.down||hero.body.touching.down;if(grounded)this.jumps=0;if(grounded&&!this.wasGrounded){this.burst(hero.x,hero.y+16,ink.border);this.play('land');}this.wasGrounded=grounded;if(grounded&&Math.abs(hero.body.velocity.x)>70&&Math.floor(this.clock/100)!==Math.floor((this.clock-dt)/100))this.burst(hero.x,hero.y+16,ink.border);
    const jumping=Boolean(keys?.['SPACE']?.isDown||keys?.['W']?.isDown||keys?.['UP']?.isDown||touch.jump);
    if(jumping&&!this.jumpLatch){const next=nextJump(grounded,this.jumps);if(next!==null){this.jumps=next;hero.setVelocityY(-(next===1?PIXEL_RULES.jumpSpeed:PIXEL_RULES.doubleJumpSpeed));this.play('jump');if(next===2){this.dust?.clear().lineStyle(2,Phaser.Display.Color.HexStringToColor(ink.cyan).color).strokeCircle(hero.x,hero.y+10,16);this.time.delayedCall(200,()=>this.dust?.clear());}}}this.jumpLatch=jumping;
    hero.setTexture(`hero${!grounded?(this.jumps===2?4:3):Math.abs(hero.body.velocity.x)>10?1+Math.floor(this.clock/110)%2:0}`);
    let warning=false;
    for(const s of this.surfaces){
      if(s.timed){const enabled=(this.clock%3200)<2200;if(s.body)s.body.enable=enabled;s.setVisible(enabled).setAlpha(this.clock%3200>1800?.5:1);}
      if(s.conveyor&&grounded&&Math.abs(hero.x-s.x)<s.displayWidth/2&&Math.abs(hero.body.bottom-s.y)<5)hero.x+=dt*.025;
      if(s.moving){const next=(s.homeX??0)+Math.sin(this.clock/1100)*16;const diff=next-(s.previousX??next);if(hero.body.touching.down&&Math.abs(hero.x-s.x)<s.displayWidth/2&&Math.abs(hero.body.bottom-s.y)<3)hero.x+=diff;s.setX(next);const body=s.body;if(body instanceof Phaser.Physics.Arcade.Body)body.updateFromGameObject();s.previousX=next;}
      if(s.born!==undefined&&s.born>=0){const stage=bridgeStage(this.clock-s.born);if(stage==='warning'){warning=true;s.setX((s.homeX??0)+Math.sin(this.clock*.08)*1.5);s.setTint(Phaser.Display.Color.HexStringToColor(ink.pink).color);}else if(stage==='fallen'){if(s.body?.enable){s.disableBody(false,false);this.cameras.main.shake(130,.0025);this.burst(s.x,s.y,ink.soil);this.play('break');}s.y=(s.homeY??440)+Math.pow((this.clock-s.born-850)/100,2)*2;s.setAlpha(Math.max(0,1-(s.y-440)/180));}else if(stage==='reset'){s.born=-1;s.setPosition(s.homeX??0,s.homeY??440).setAlpha(1).clearTint();s.enableBody(false,s.x,s.y,true,true);}}
    }
    if(warning!==state.warning)state.set({warning});
    const level=this.activeLevel;if(!level)return;
    const near=Math.abs(hero.x-level.goal)<100&&hero.y<470&&hero.y>330?level.id:null;
    if(near!==state.nearby)state.set({nearby:near});
    if(near!==null&&!this.openedGoal){this.openedGoal=true;usePixel.getState().visit(near);this.burst(hero.x,hero.y-20,ink.gold);this.play('checkpoint');}
    for(const x of level.checkpoints){if(Math.abs(hero.x-x)<75&&hero.y<500&&x>this.checkpointX){this.checkpointX=x;this.checkpointY=level.islands.find(p=>p.x===x)?.y??440;state.set({checkpoint:x});this.burst(hero.x,hero.y-20,ink.cyan);this.play('checkpoint');}}
    const distance=Math.min(100,Math.round(hero.x/level.goal*100));if(distance!==state.distance)state.set({distance});
    const interact=Boolean(keys?.['E']?.isDown||touch.interact);if(interact&&!this.interactLatch&&near!==null){state.visit(near);this.play('coin');}this.interactLatch=interact;
    this.enemies?.update(dt,this.clock,hero,()=>this.hurt(),()=>{const s=usePixel.getState();s.set({score:s.score+100});s.collect(100+(this.enemies?.debug().filter(e=>e.defeated).length??0));this.burst(hero.x,hero.y,ink.gold);this.play('coin');});
    hero.setAlpha(this.clock<this.immuneUntil?(Math.floor(this.clock/90)%2?.35:1):1);if(this.clock<this.shieldUntil)hero.setTint(Phaser.Display.Color.HexStringToColor(ink.cyan).color);else hero.clearTint();
    const power=this.clock<this.shieldUntil?'SHIELD':this.clock<this.speedUntil?'SPEED':null;if(power!==state.power)state.set({power});
    if(hero.y>720)this.respawn();
    hero.x=Phaser.Math.Clamp(hero.x,12,level.width-12);
    const camera=this.cameras.main;const visible=this.scale.width/camera.zoom;const target=Phaser.Math.Clamp(hero.x-visible*.35,0,Math.max(0,level.width-visible));camera.scrollX=Phaser.Math.Linear(camera.scrollX,target,1-Math.exp(-dt*.005));
    const baseY=440-this.scale.height/camera.zoom*.68;const vertical=Math.min(baseY,hero.y-this.scale.height/camera.zoom*.45);camera.scrollY=Phaser.Math.Linear(camera.scrollY,vertical,1-Math.exp(-dt*.004));
    if(this.bg)this.bg.x=-camera.scrollX*.12;this.falls.forEach(f=>{f.tilePositionY-=dt*.09;});
    if(import.meta.env.DEV){this.game.canvas.dataset['pixelPlayer']=JSON.stringify({level:state.level,width:level.width,goal:level.goal,cameraX:camera.scrollX,zoom:camera.zoom,x:hero.x,y:hero.y,jumps:this.jumps,grounded,checkpoint:state.checkpoint,hearts:usePixel.getState().hearts,score:usePixel.getState().score,power:usePixel.getState().power,enemies:this.enemies?.debug(),coins:state.coins.length,badges:state.badges.length,broken:this.surfaces.filter(s=>s.born!==undefined&&!s.body?.enable).length,moving:this.surfaces.filter(s=>s.moving).map(s=>s.x)});}
  }
}
export function mountCity(parent:HTMLElement) {const game=new Phaser.Game({type:Phaser.CANVAS,parent,backgroundColor:ink.sky,pixelArt:true,roundPixels:true,scale:{mode:Phaser.Scale.RESIZE,width:parent.clientWidth,height:parent.clientHeight},physics:{default:'arcade',arcade:{gravity:{x:0,y:760},fps:60}},scene:CityScene,input:{keyboard:true},audio:{noAudio:true},banner:false});if(import.meta.env.DEV)(game.canvas as HTMLCanvasElement & {careerGame?:Phaser.Game}).careerGame=game;return game;}