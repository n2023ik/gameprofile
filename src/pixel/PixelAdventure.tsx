import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, BookOpen, Check, Coins, FileText, Heart, Lock, Map, Pause, Play, RotateCcw, Star, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PortfolioContent } from '@/components/portfolio/PortfolioContent';
import { districts, links } from '@/game/data';
import { touch, usePixel } from './state';
import { levels, canPlayLevel, readProgress } from './levels';
import avatar from '@/assets/pixel-avatar.asset.json';

export default function PixelAdventure() {
  const host=useRef<HTMLDivElement>(null);const s=usePixel();const [error,setError]=useState(false);const [ready,setReady]=useState(false);const [guide,setGuide]=useState(true);const [progressReady,setProgressReady]=useState(false);
  useEffect(()=>{
    let disposed=false;let game:{destroy:(removeCanvas:boolean)=>void}|undefined;
    void import('./CityScene').then(({mountCity})=>{if(disposed||!host.current)return;game=mountCity(host.current);setReady(true);}).catch(()=>setError(true));
    const clear=()=>{touch.left=false;touch.right=false;touch.jump=false;touch.interact=false;};window.addEventListener('blur',clear);
    return()=>{disposed=true;game?.destroy(true);clear();window.removeEventListener('blur',clear);};
  },[]);
  useEffect(()=>{try{const completed=readProgress(localStorage.getItem('career-city-levels-v1'));usePixel.getState().set({completed,badges:completed});}catch{}setProgressReady(true);},[]);
  useEffect(()=>{if(!progressReady)return;try{localStorage.setItem('career-city-levels-v1',JSON.stringify(s.completed));}catch{}},[s.completed,progressReady]);
  const level=levels[s.level];
  const close=()=>s.set({panel:null});
  return <main className="pixel-adventure">
    <div className="pixel-world" ref={host} aria-label="Playable Career City pixel-art adventure" tabIndex={0} />
    {!ready&&<div className="pixel-loading">{error?'The city could not load. Please refresh.':'Entering Career City…'}</div>}
    <header className="pixel-hud" onPointerDown={event=>event.stopPropagation()} onPointerUp={event=>event.stopPropagation()}>
      <div className="pixel-player"><div className="pixel-avatar"><img src={avatar.url} width={40} height={40} alt="Nikhil’s adventurer" /></div><div><div className="pixel-hearts" aria-label={`${s.hearts} of 3 hearts`}>{[0,1,2].map(i=><Heart key={i} opacity={i<s.hearts?1:.25}/>)}</div><strong>NIKHIL</strong><div className="pixel-level">Level {s.level+1}/7 <progress max={100} value={s.distance} aria-label="Current level progress" /></div></div></div>
      <div className="pixel-count"><Coins/><strong>× {s.coins.length}</strong><Star/><strong>{s.badges.length}/7</strong>{s.score>0&&<small>{s.score} pts</small>}{s.power&&<small>{s.power}</small>}</div>
      <div className="pixel-objective"><strong>{level?.name.toUpperCase()}</strong><div>{districts.map(d=><span key={d.id} className={s.badges.includes(d.id)?'earned':''} title={d.name}>{s.badges.includes(d.id)?<Star/>:null}</span>)}</div></div>
      <Button size="icon" variant="outline" className="pixel-tool" title="Career map" aria-label="Career map" onClick={()=>s.set({map:true})}><Map/></Button>
    </header>
    <div className="pixel-controls-top" onPointerDown={event=>event.stopPropagation()} onPointerUp={event=>event.stopPropagation()}><Button size="icon" variant="outline" title="Pause" aria-label="Pause" onClick={()=>s.set({paused:true})}><Pause/></Button><Button size="icon" variant="outline" title="Restart" aria-label="Restart" onClick={s.restart}><RotateCcw/></Button><Button size="icon" variant="outline" title={s.muted?'Turn sound on':'Mute sound'} aria-label={s.muted?'Turn sound on':'Mute sound'} onClick={()=>s.set({muted:!s.muted})}>{s.muted?<VolumeX/>:<Volume2/>}</Button></div>
    {s.warning&&<div className="pixel-bridge-warning" role="status">BRIDGE BREAKING — KEEP MOVING!</div>}
    {s.nearby!==null&&s.panel===null&&!s.paused&&!s.map&&!s.levelDone&&<Button variant="outline" className="pixel-explore" onClick={()=>{if(s.nearby!==null)s.visit(s.nearby);}}><kbd>E</kbd> Explore {districts[s.nearby]?.name}</Button>}
    {guide&&s.started&&s.checkpoint<0&&<div className="pixel-tutorial"><strong>YOUR ADVENTURE STARTS HERE</strong><p><kbd>A</kbd> <kbd>D</kbd> Move <kbd>SPACE</kbd> Jump · Double jump <kbd>SHIFT</kbd> Sprint <kbd>E</kbd> Explore</p><Button variant="ghost" size="sm" onClick={()=>setGuide(false)}>Let’s go <ArrowRight/></Button></div>}
    <footer className="pixel-footer"><div><strong>{level?.objective}</strong><span>{s.checkpoint<0?`Level ${s.level+1}/7 · ${level?.name}`:`⚑ Checkpoint saved · Level ${s.level+1}/7`}</span></div><nav><Button variant="secondary" size="sm" asChild><a href={links.portfolio}><BookOpen/>Explore Portfolio<ArrowUpRight/></a></Button><Button variant="outline" size="sm" asChild><a href={links.resume} target="_blank" rel="noopener noreferrer"><FileText/>View Resume</a></Button></nav></footer>
    <div className="pixel-touch"><div>{(['left','right'] as const).map(direction=><Button key={direction} variant="outline" size="icon" aria-label={`Move ${direction}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);touch[direction]=true;}} onPointerUp={()=>touch[direction]=false} onPointerCancel={()=>touch[direction]=false}>{direction==='left'?<ArrowLeft/>:<ArrowRight/>}</Button>)}</div><Button variant="outline" size="icon" aria-label="Jump" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);touch.jump=true;}} onPointerUp={()=>touch.jump=false} onPointerCancel={()=>touch.jump=false}><ArrowUp/></Button></div>
    <Dialog open={s.panel!==null} onOpenChange={open=>{if(!open)close();}}><DialogContent className="pixel-portfolio-panel"><DialogTitle>{s.panel!==null?districts[s.panel]?.name:''}</DialogTitle><DialogDescription>Nikhil Pandey · Career City</DialogDescription>{s.panel!==null&&<PortfolioContent id={s.panel}/>}<Button onClick={()=>{s.finish();}}><Check/>Complete level <ArrowRight/></Button><Button variant="outline" onClick={close}>Back to adventure</Button></DialogContent></Dialog>
    <Dialog open={!s.started||s.paused||s.map||s.levelDone} onOpenChange={open=>{if(!open)s.dismissMenu();}}><DialogContent className={`pixel-menu ${!s.started?'pixel-start-menu':''}`}>
      {!s.started&&<div className="pixel-menu-identity"><span>NIKHIL PANDEY</span><span>PLAYER 01</span></div>}
      {(!s.started||s.levelDone)&&<div className={`pixel-menu-art ${s.levelDone?'pixel-victory-art':''}`} aria-hidden="true"><Star className="pixel-art-star"/><img src={avatar.url} alt=""/><Coins className="pixel-art-coin"/></div>}
      <DialogTitle>{!s.started?<>Career<span>City.</span></>:s.levelDone?s.level===6?'CAREER ADVENTURE COMPLETE!':`LEVEL ${s.level+1} COMPLETE!`:s.map?'CAREER CITY MAP':'ADVENTURE PAUSED'}</DialogTitle><DialogDescription>{!s.started?'Seven worlds. One career adventure.':s.levelDone?`${districts[s.level]?.name} explored · ${s.coins.length} coins · ${s.score} points`:level?.objective}</DialogDescription>
      {!s.started&&<div className="pixel-world-trail" aria-label="Seven career worlds">{districts.map(d=><span key={d.id} title={d.name}>{String(d.id+1).padStart(2,'0')}</span>)}</div>}
      {s.map&&<div className="pixel-map-list">{districts.map(d=><Button key={d.id} variant="ghost" disabled={!canPlayLevel(d.id,s.completed)} onClick={()=>s.loadLevel(d.id)}><span>0{d.id+1}</span>{d.name}{s.completed.includes(d.id)?<Check/>:!canPlayLevel(d.id,s.completed)?<Lock/>:null}</Button>)}</div>}
      {!s.started?<Button className="pixel-start-action" onClick={()=>s.loadLevel(0)}><Play/>Start Game<ArrowRight/></Button>:s.levelDone?<>{s.level<6&&<Button onClick={()=>s.loadLevel(s.level+1)}>Next Level <ArrowRight/></Button>}<Button variant="outline" onClick={()=>s.loadLevel(s.level)}><RotateCcw/>Replay level</Button></>:<><Button onClick={()=>s.set({paused:false,map:false})}><Play/>Resume adventure</Button><Button variant="outline" onClick={s.restart}><RotateCcw/>Restart level</Button></>}
      <Button variant="outline" asChild><a href={links.portfolio}><BookOpen/>Explore Portfolio<ArrowUpRight/></a></Button><Button variant="ghost" asChild><a href={links.resume} target="_blank" rel="noopener noreferrer"><FileText/>View Resume</a></Button></DialogContent></Dialog>
  </main>;
}
