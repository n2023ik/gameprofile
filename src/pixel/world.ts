import type * as Phaser from 'phaser';
import { ink, texture } from './art';
import { destinations } from './state';
import { islandTops } from './rules';

export interface Ledge { x: number; y: number; width: number; key: string; timed?: boolean; moving?: boolean; spring?: boolean; conveyor?: boolean }
export const ledges: Ledge[] = [
  {x:145,y:462,width:36,key:'terrain'},
  {x:203,y:371,width:44,key:'terrain'}, {x:288,y:334,width:40,key:'terrain'},
  {x:419,y:352,width:54,key:'cargo'}, {x:488,y:298,width:50,key:'cargo'},
  {x:444,y:432,width:64,key:'conveyor',conveyor:true},
  {x:543,y:390,width:24,key:'plank'}, {x:567,y:390,width:24,key:'plank'},
  {x:650,y:346,width:42,key:'moving',moving:true}, {x:710,y:275,width:38,key:'moving'},
  {x:626,y:434,width:22,key:'spring',spring:true},
  {x:852,y:353,width:48,key:'book'}, {x:928,y:295,width:44,key:'magic',timed:true}, {x:968,y:364,width:36,key:'magic',timed:true},
  {x:1082,y:360,width:28,key:'stone'}, {x:1145,y:302,width:48,key:'stone'}, {x:1177,y:361,width:24,key:'stone'},
  {x:1291,y:386,width:36,key:'book'}, {x:1321,y:349,width:36,key:'stone'}, {x:1380,y:307,width:52,key:'book'},
  {x:1505,y:375,width:34,key:'moving',moving:true}, {x:1585,y:326,width:38,key:'stone'},
];
export function worldTextures(scene: Phaser.Scene) {
  for (const key of ['cargo','book','stone','magic','spring','conveyor']) texture(scene,key,64,20,c=>{
    c.fillStyle=ink.outline;c.fillRect(0,0,64,20);c.fillStyle=key==='cargo'?ink.blue:key==='book'?ink.pink:key==='stone'?ink.rockLight:key==='spring'?ink.grass:ink.purple;c.fillRect(2,2,60,16);
    c.fillStyle=key==='spring'?ink.gold:ink.cyan;c.fillRect(2,2,60,3);
    for(let x=6;x<60;x+=9){c.fillStyle=ink.outline;c.fillRect(x,7,2,9);if(key==='book'){c.fillStyle=ink.gold;c.fillRect(x+3,8,3,2);}if(key==='spring'){c.fillStyle=ink.gold;c.fillRect(x,10,7,3);}}
  });
  for(const key of ['butterfly','truck','crane','pages','trophy','cap','shield','speed']) texture(scene,key,key==='crane'?70:32,key==='crane'?94:32,c=>{
    const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    if(key==='butterfly'){r(14,10,3,16,ink.outline);r(3,7,10,10,ink.pink);r(18,7,10,10,ink.cyan);r(7,18,6,8,ink.gold);r(18,18,6,8,ink.purple);}
    if(key==='truck'){r(1,11,19,13,ink.blue);r(20,15,11,9,ink.gold);r(23,16,6,4,ink.cyan);r(4,24,6,6,ink.outline);r(23,24,6,6,ink.outline);r(3,13,15,2,ink.cyan);}
    if(key==='crane'){r(8,5,8,87,ink.gold);r(3,1,66,7,ink.gold);r(56,8,2,42,ink.border);r(51,47,12,5,ink.gold);for(let y=12;y<85;y+=12)r(9,y,6,3,ink.outline);r(0,90,28,4,ink.rockLight);}
    if(key==='pages'){r(5,2,23,28,ink.white);r(2,5,3,26,ink.purple);for(let y=8;y<25;y+=5)r(10,y,13,2,ink.blue);r(21,22,8,8,ink.gold);}
    if(key==='trophy'){r(8,3,16,15,ink.gold);r(2,5,6,10,ink.gold);r(24,5,6,10,ink.gold);r(13,18,6,9,ink.gold);r(6,27,20,4,ink.gold);r(10,5,4,10,ink.white);}
    if(key==='cap'){r(3,7,26,5,ink.outline);r(8,3,16,5,ink.blue);r(9,12,15,8,ink.blue);r(27,11,2,15,ink.gold);r(25,25,6,5,ink.gold);}
    if(key==='shield'){for(let y=3;y<26;y+=3)r(4+Math.max(0,y-15)/2,y,24-Math.max(0,y-15),3,ink.cyan);r(14,8,4,17,ink.white);r(9,13,14,4,ink.white);}
    if(key==='speed'){r(12,2,13,7,ink.gold);r(7,9,14,9,ink.gold);r(12,18,9,3,ink.gold);r(8,21,9,8,ink.gold);r(2,10,6,2,ink.white);r(0,17,6,2,ink.white);}
  });
}
export function decorateWorld(scene: Phaser.Scene, theme?:number, points?:{x:number;y:number}[]) {
  const add=(x:number,y:number,key:string,scale=1)=>scene.add.image(x,y,key).setOrigin(.5,1).setScale(scale).setDepth(1);
  for(let n=0;n<2;n++)add(30+n*32,480,'flower');
  (points??destinations.map((x,id)=>({x,y:islandTops[id]??440}))).forEach((point,index)=>{
    const {x,y}=point;const id=theme??index;
    if(index%2===0&&index!==0)return;
    if(id===0){add(x-100,y,'tree',.85);for(let n=0;n<2;n++)add(x+75+n*20,y,'flower');}
    if(id===1){add(x-66,y,'truck',1.3);add(x+76,y,'crane');add(x-42,y-15,'cargo',.7);}
    if(id===2){for(let n=0;n<3;n++){const tower=scene.add.tileSprite(x-65+n*57,y,24,90+n*35,'moving').setOrigin(.5,1).setDepth(-2);scene.tweens.add({targets:tower,alpha:.6,duration:900+n*250,yoyo:true,repeat:-1});}scene.add.text(x-30,y-170,'</>',{fontFamily:'monospace',fontSize:'26px',color:ink.cyan}).setDepth(2);}
    if(id===3){add(x-66,y,'book',1.2);for(let n=0;n<4;n++){const p=add(x-50+n*32,y-90-(n%2)*40,'pages',.6);scene.tweens.add({targets:p,y:p.y-12,duration:1300+n*100,yoyo:true,repeat:-1});}}
    if(id===4){add(x-62,y,'trophy',1.3);add(x+62,y,'trophy',.8);add(x+30,300,'trophy',.65);}
    if(id===5){add(x-57,y,'cap',1.1);add(x+52,y,'book');add(x,198,'cap',1.2);}
    if(id===6){for(let n=0;n<5;n++){const p=add(x+Math.sin(n)*26,y-40-n*24,'pages',.3);scene.tweens.add({targets:p,alpha:.2,duration:650+n*130,yoyo:true,repeat:-1});}}
    if(index%3===1)add(x+100,y,'lantern');
    const moteKey=id===4?'sparkle':id===2?'star':'sparkle';
    for(let n=0;n<4;n++){const mote=scene.add.image(x-70+n*42,y-30-(n%3)*38,moteKey).setDepth(3).setScale(.6).setAlpha(.7);scene.tweens.add({targets:mote,y:mote.y-14,alpha:.2,duration:1400+n*220,yoyo:true,repeat:-1,delay:n*180});}
  });
}