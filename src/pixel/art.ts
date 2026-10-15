import type * as Phaser from 'phaser';

// Palette roles for canvas artwork; DOM equivalents live in the global theme.
export const ink = { dark: '#10264D', outline: '#07182B', sky: '#2678E8', purple: '#6947C7', cyan: '#49DDF5', pink: '#F17EC8', gold: '#FFC94A', grass: '#58C94D', border: '#5A91B8', white: '#FFFFFF', rock: '#344458', rockLight: '#566478', rockShade: '#1B2B41', soil: '#736047', leaf: '#245F46', leafLight: '#3C9A4F', grassSun: '#B0DE62', bark: '#624332', skin: '#F4BC8B', hair: '#392B29', shirt: '#E8784D', blue: '#358AD0', boot: '#312E3B' };
type Painter = (c: CanvasRenderingContext2D) => void;
export function texture(scene: Phaser.Scene, key: string, w: number, h: number, draw: Painter) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const c = canvas.getContext('2d'); if (!c) return; c.imageSmoothingEnabled = false; draw(c); scene.textures.addCanvas(key, canvas);
}
export function makeTextures(scene: Phaser.Scene) {
  texture(scene,'waterfall',18,48,c=>{c.fillStyle=ink.blue;c.fillRect(0,0,18,48);c.fillStyle=ink.cyan;for(let i=0;i<6;i++)c.fillRect(i*3,(i*13)%38,2,18);c.fillStyle=ink.white;c.fillRect(2,5,1,21);c.fillRect(12,27,2,16);});
  texture(scene, 'terrain', 176, 108, c => {
    c.fillStyle = ink.rockShade; c.fillRect(0, 7, 176, 101);
    for (let row = 0; row < 7; row++) for (let col = 0; col < 8; col++) {
      const x = col * 24 - (row % 2) * 12, y = row * 15 + 12;
      c.fillStyle = (col+row)%5===0?ink.rockLight:ink.rock;
      c.globalAlpha=.55;c.fillRect(x+1, y, 21, 12);c.globalAlpha=1;
    }
    c.fillStyle = ink.soil; c.fillRect(0, 5, 176, 7); c.fillStyle = ink.leaf; c.fillRect(0, 0, 176, 7);
    for (let x = 0; x < 176; x += 4) { c.fillStyle = x % 12 ? ink.grass : ink.grassSun; c.fillRect(x, 1 + x % 3, 4, 4); if (x % 16 === 0) c.fillRect(x, 6, 2, 7); }
    c.clearRect(0, 99, 10, 9); c.clearRect(164, 95, 12, 13);
  });
  texture(scene, 'tree', 78, 98, c => {
    c.fillStyle = ink.outline; c.fillRect(34, 35, 10, 63); c.fillStyle = ink.bark; c.fillRect(37, 35, 5, 63); c.fillRect(24, 60, 18, 4); c.fillRect(42, 49, 16, 4);
    const clusters = [[23,6,30,24],[9,20,32,26],[40,20,30,25],[2,36,31,25],[26,32,31,26],[49,37,26,22],[15,48,32,24]];
    for (const [x = 0,y = 0,w = 0,h = 0] of clusters) {
      c.fillStyle = ink.outline; c.fillRect(x+5,y,w-10,h);c.fillRect(x,y+5,w,h-10); c.fillStyle = ink.leaf; c.fillRect(x+5,y+2,w-10,h-4);c.fillRect(x+2,y+6,w-4,h-12); c.fillStyle = ink.leafLight; c.fillRect(x+6,y+4,w-12,5);
      for (let i=0;i<8;i++) { c.fillStyle = i%3 ? ink.grass : ink.grassSun; c.fillRect(x+5+(i*7)%(w-8),y+4+(i*11)%(h-7),3,2); }
    }
  });
  texture(scene, 'lantern', 16, 46, c => {
    c.fillStyle=ink.outline;c.fillRect(7,12,3,34);c.fillRect(3,5,11,16);c.fillStyle=ink.gold;c.fillRect(5,8,7,10);c.fillStyle=ink.white;c.fillRect(6,9,2,6);c.fillStyle=ink.soil;c.fillRect(2,4,13,3);
  });
  texture(scene, 'coin', 12, 16, c => { c.fillStyle=ink.soil;c.fillRect(3,1,6,14);c.fillRect(1,4,10,8);c.fillStyle=ink.gold;c.fillRect(3,2,6,12);c.fillRect(2,5,8,6);c.fillStyle=ink.white;c.fillRect(3,4,2,6);c.fillStyle='#FFE9A8';c.fillRect(4,3,3,3);c.fillStyle='#C98A1E';c.fillRect(4,10,5,3); });
  texture(scene, 'star', 7, 7, c => { c.fillStyle=ink.white;c.fillRect(3,0,1,7);c.fillRect(0,3,7,1);c.fillStyle=ink.cyan;c.fillRect(2,2,3,3); });
  texture(scene, 'cloud', 64, 22, c => { c.fillStyle=ink.white;c.globalAlpha=.85;c.fillRect(10,8,44,10);c.fillRect(18,4,26,8);c.fillRect(4,12,56,8);c.globalAlpha=.4;c.fillStyle=ink.purple;c.fillRect(8,16,48,5);c.globalAlpha=1; });
  texture(scene, 'moon', 40, 40, c => { c.fillStyle=ink.gold;c.globalAlpha=.25;c.fillRect(4,4,32,32);c.globalAlpha=1;c.fillStyle='#FFF3C4';c.fillRect(10,6,20,28);c.fillRect(6,10,28,20);c.fillStyle='#F0D68A';c.fillRect(14,12,5,5);c.fillRect(22,22,4,4);c.fillRect(12,24,3,3); });
  texture(scene, 'sparkle', 9, 9, c => { c.fillStyle=ink.white;c.fillRect(4,0,1,9);c.fillRect(0,4,9,1);c.fillStyle=ink.gold;c.fillRect(3,3,3,3); });
  texture(scene, 'plank', 24, 12, c => {c.fillStyle=ink.outline;c.fillRect(0,0,24,12);c.fillStyle=ink.soil;c.fillRect(1,1,22,8);c.fillStyle=ink.gold;c.fillRect(2,2,20,2);c.fillStyle=ink.bark;c.fillRect(6,5,9,2);});
  texture(scene, 'moving', 48, 14, c => {c.fillStyle=ink.outline;c.fillRect(0,0,48,14);c.fillStyle=ink.purple;c.fillRect(2,2,44,10);c.fillStyle=ink.cyan;c.fillRect(3,2,42,3);for(let x=4;x<44;x+=8)c.fillRect(x,8,4,2);});
  texture(scene, 'flower', 8, 12, c => {c.fillStyle=ink.grass;c.fillRect(3,5,2,7);c.fillStyle=ink.pink;c.fillRect(1,2,6,4);c.fillRect(3,0,2,8);c.fillStyle=ink.gold;c.fillRect(3,3,2,2);});
  texture(scene, 'flag', 20, 34, c => {c.fillStyle=ink.border;c.fillRect(2,0,3,34);c.fillStyle=ink.cyan;c.fillRect(5,1,14,10);c.fillStyle=ink.white;c.fillRect(6,3,3,5);c.fillStyle=ink.outline;c.fillRect(0,31,10,3);});
  for(let frame=0;frame<6;frame++) texture(scene, `hero${frame}`, 24, 36, c => {
    const rect=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    const stride=frame===1?3:frame===2?-3:frame===3?2:0;
    rect(6,1,13,14,ink.outline);rect(4,4,17,9,ink.outline);rect(6,3,13,7,ink.hair);rect(8,7,11,8,ink.skin);rect(7,6,4,4,ink.hair);rect(17,8,2,3,ink.outline);rect(19,11,3,3,ink.skin);rect(11,14,6,3,ink.skin);
    rect(7,16,12,11,ink.outline);rect(8,16,10,9,ink.shirt);rect(9,17,3,5,ink.gold);rect(5,17,4,9,ink.outline);rect(6,18,2,7,ink.skin);rect(18,17,4,8,ink.outline);rect(19,19,2,6,ink.skin);
    rect(7,15,11,2,ink.pink);if(frame===1||frame===3)rect(3,15,4,2,ink.pink);if(frame===2)rect(4,14,3,2,ink.pink);
    rect(8,26,5,7,ink.blue);rect(14,26,5,7,ink.blue);rect(7-stride,31,7,4,ink.boot);rect(14+stride,31-(frame===3?4:0),7,4,ink.boot);rect(8-stride,31,4,1,ink.border);
    if(frame===4){rect(2,22,4,3,ink.skin);rect(19,12,3,5,ink.skin);}
  });
}