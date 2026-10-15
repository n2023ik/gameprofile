import type { EnemyKind } from './rules';
import type { Ledge } from './world';

export interface Island {x:number;y:number;width:number}
export interface CareerLevel {id:number;name:string;objective:string;width:number;goal:number;spawn:{x:number;y:number};islands:Island[];ledges:Ledge[];enemies:{kind:EnemyKind;x:number;y:number;min:number;max:number;speed:number}[];checkpoints:number[]}
const names=['Enchanted Village','Lynkit Industrial District','Cyberpunk Coding City','Magical Library','Trophy Castle','University Kingdom','Portal Fortress'];
const objectives=['Reach the house and explore About Me','Cross the industrial district and explore Lynkit','Find the coding tower and explore the projects','Reach the magical library and explore certificates','Reach the trophy castle and explore achievements','Reach the university and explore education','Reach the portal and open contact & resume'];
const routes=[
  [[180,480,360],[530,466,260],[849,450,290],[1209,474,310],[1561,456,280],[1887,440,250],[2210,440,360]],
  [[180,480,360],[532,460,260],[847,442,270],[1182,470,300],[1510,440,260],[1846,456,310],[2210,440,360]],
  [[180,480,360],[540,450,270],[874,478,280],[1207,440,250],[1531,458,290],[1869,432,270],[2210,440,360]],
  [[180,480,360],[540,458,280],[868,434,250],[1197,468,290],[1548,446,300],[1880,426,260],[2210,440,360]],
  [[180,480,360],[523,460,250],[843,438,270],[1165,466,250],[1497,436,300],[1855,458,290],[2210,440,360]],
  [[180,480,360],[540,462,280],[866,438,260],[1199,460,300],[1535,432,260],[1864,454,290],[2210,440,360]],
  [[180,480,360],[530,458,260],[858,436,280],[1198,468,280],[1533,448,290],[1873,426,270],[2210,440,360]],
];
export const levels:CareerLevel[]=names.map((name,id)=>{
  const islands=(routes[id]??routes[0]??[]).map(([x=0,y=440,width=280])=>({x,y,width}));
  const ledges:Ledge[]=[];
  islands.slice(1,6).forEach((p,n)=>{
    const key=id===1?'cargo':id===3||id===5?'book':id===4||id===6?'stone':id===2?'moving':'terrain';
    ledges.push({x:p.x+15,y:p.y-96,width:64,key:id===3?'magic':key,timed:id===3});
    if((id===2||id===6)&&n%2===0)ledges.push({x:p.x-92,y:p.y-8,width:26,key:'spring',spring:true});
    if((id===1||id===2)&&n%2===0)ledges.push({x:p.x+85,y:p.y-60,width:56,key:'moving',moving:true});
    if(id===1&&n===2)ledges.push({x:p.x,y:p.y,width:90,key:'conveyor',conveyor:true});
    if(id===1&&n===1){for(let k=0;k<3;k++)ledges.push({x:p.x+104+k*24,y:p.y-70,width:24,key:'plank'});}
    if(id===4&&n===3)ledges.push({x:p.x+102,y:p.y-53,width:24,key:'stone'});
  });
  const kinds:EnemyKind[][]=[['bug'],['drone','bug'],['slime','drone'],['firefly','slime'],['armor','bug'],['bug','slime'],['drone','armor']];
  const enemies=(kinds[id]??[]).map((kind,n)=>{const p=islands[n*2+2]??{x:850,y:440};const elevated=kind==='armor';return {kind,x:p.x+35,y:p.y-(kind==='drone'?100:kind==='firefly'?150:elevated?54:0),min:p.x+12,max:p.x+90,speed:kind==='drone'?42:kind==='armor'?15:kind==='bug'?23:29};});
  return {id,name,objective:objectives[id]??'',width:2420,goal:2210,spawn:{x:90,y:462},islands,ledges,enemies,checkpoints:[islands[2]?.x??850,islands[4]?.x??1550,2210]};
});
export function canPlayLevel(id:number,completed:number[]) {return id>=0&&id<7&&(id===0||completed.includes(id)||completed.includes(id-1));}
export function completeLevel(id:number,completed:number[]) {return canPlayLevel(id,completed)?Array.from(new Set([...completed,id])).sort((a,b)=>a-b):completed;}
export function readProgress(raw:string|null) {try{const value:unknown=JSON.parse(raw??'[]');if(!Array.isArray(value))return [];const valid=new Set(value.filter((id:unknown):id is number=>typeof id==='number'&&Number.isInteger(id)&&id>=0&&id<7));const result:number[]=[];for(let id=0;id<7&&valid.has(id);id++)result.push(id);return result;}catch{return [];}}