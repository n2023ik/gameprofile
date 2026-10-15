import * as Phaser from "phaser";
import { ink, texture } from './art';
import { enemyContact, patrolStep, type EnemyKind } from './rules';

const specs: {kind:EnemyKind;x:number;y:number;min:number;max:number;speed:number}[] = [
  {kind:'bug',x:287,y:440,min:266,max:303,speed:23},
  {kind:'drone',x:491,y:320,min:405,max:518,speed:42},
  {kind:'slime',x:742,y:440,min:716,max:747,speed:18},
  {kind:'firefly',x:928,y:253,min:862,max:958,speed:29},
  {kind:'armor',x:1137,y:302,min:1128,max:1162,speed:15},
];
export function enemyTextures(scene:Phaser.Scene) {
  for(const kind of ['bug','drone','slime','firefly','armor'] as const)for(let frame=0;frame<2;frame++)texture(scene,`${kind}${frame}`,32,28,c=>{
    const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    if(kind==='slime'){r(4,12+frame*2,24,13-frame*2,ink.outline);r(8,7+frame*3,16,16-frame*3,ink.grass);r(4,16,24,7,ink.grass);r(9,9+frame*3,6,3,ink.grassSun);}
    else if(kind==='drone'){r(6,12,20,11,ink.outline);r(8,13,16,8,ink.blue);r(1,4+frame*2,12,3,ink.border);r(19,4+frame*2,12,3,ink.border);r(6,7,3,8,ink.gold);r(23,7,3,8,ink.gold);r(12,23,8,3,ink.cyan);}
    else if(kind==='firefly'){r(12,8,10,16,ink.outline);r(14,10,6,8,ink.purple);r(14,18,6,6,ink.gold);r(2,4+frame*5,10,8,ink.cyan);r(21,4+frame*5,9,8,ink.pink);}
    else {r(4,9,24,15,ink.outline);r(8,5,17,16,kind==='armor'?ink.rockLight:ink.pink);r(5,14,23,8,kind==='armor'?ink.border:ink.purple);r(8,7,5,4,kind==='armor'?ink.cyan:ink.white);r(15,6,2,16,ink.outline);for(let n=0;n<3;n++)r(5+n*8,23-(n%2?frame:1-frame)*2,4,4,ink.outline);if(kind==='armor'){r(9,2,3,6,ink.gold);r(19,2,3,6,ink.gold);}}
    r(21,12,3,4,ink.white);r(23,13,2,2,ink.outline);
  });
}
interface Enemy { sprite:Phaser.Physics.Arcade.Sprite; spec:typeof specs[number]; direction:number; baseY:number; phase:number; defeated:boolean }
export class Enemies {
  private entries:Enemy[]=[];
  constructor(private scene:Phaser.Scene, spawns: typeof specs = specs) {
    for(const [id,spec] of spawns.entries()){
      const sprite=scene.physics.add.sprite(spec.x,spec.y-14,`${spec.kind}0`).setDepth(4).setImmovable(true);
      const body=sprite.body;if(body instanceof Phaser.Physics.Arcade.Body){body.setAllowGravity(false);body.setSize(spec.kind==='firefly'?16:24,18);body.setOffset(4,9);}
      this.entries.push({sprite,spec,direction:1,baseY:spec.y-14,phase:id*300,defeated:false});
    }
  }
  update(dt:number,now:number,hero:Phaser.Physics.Arcade.Sprite,onDamage:()=>void,onStomp:()=>void) {
    const body=hero.body;if(!(body instanceof Phaser.Physics.Arcade.Body))return;
    for(const e of this.entries){
      if(e.defeated)continue;
      const step=patrolStep(e.sprite.x,e.direction,e.spec.speed,dt/1000,e.spec.min,e.spec.max);e.direction=step.direction;e.sprite.setX(step.x).setFlipX(e.direction<0).setTexture(`${e.spec.kind}${Math.floor(now/180)%2}`);
      const phase=(now+e.phase)%1900;
      e.sprite.y=e.baseY-(e.spec.kind==='slime'&&phase<750?Math.sin(phase/750*Math.PI)*45:e.spec.kind==='firefly'?Math.sin(now/520)*18:e.spec.kind==='drone'?Math.sin(now/700)*8:0);
      const eb=e.sprite.body;if(!(eb instanceof Phaser.Physics.Arcade.Body))continue;eb.updateFromGameObject();
      if(!this.scene.physics.overlap(hero,e.sprite))continue;
      if(enemyContact(e.spec.kind,body.velocity.y,body.prev.y+body.height,eb.top)==='stomp'){
        e.defeated=true;e.sprite.disableBody(false,false);this.scene.tweens.add({targets:e.sprite,scaleY:.2,alpha:0,y:e.sprite.y+8,duration:180});hero.setVelocityY(-225);onStomp();
      } else onDamage();
    }
  }
  reset(){for(const e of this.entries){e.defeated=false;e.direction=1;this.scene.tweens.killTweensOf(e.sprite);e.sprite.setScale(1).setAlpha(1).enableBody(true,e.spec.x,e.baseY,true,true);}}
  debug(){return this.entries.map(e=>({kind:e.spec.kind,x:e.sprite.x,y:e.sprite.y,defeated:e.defeated,direction:e.direction,min:e.spec.min,max:e.spec.max}));}
}