import { useEffect, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { ExternalLink, Blocks, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Block } from './scenery';
import { palette as p } from './palette';
import { playerPosition, useGame } from './store';

export const MCSERV = { directory: 'https://mcserv.org/', documentation: 'https://mcserv.org/docapi', x: 114 };
export function ServerDiscoveryBuilding() {
 return <group position={[MCSERV.x, 0, -1.8]}>
  <Block at={[0, .1, 0]} size={[4.2, .25, 3.2]} color={p.stone} />
  {[-1, 1].map(side => <group key={side}><Block at={[side * 1.5, 1.6, 0]} size={[.65, 3, 2.5]} color={p.stoneDark} />{[.5, 1.2, 1.9, 2.6].map(y => <Block key={y} at={[side * 1.5, y, 1.3]} size={[.5, .2, .12]} color={p.stoneLight} />)}<Block at={[side * 1.5, 3.2, 0]} size={[.95, .4, 2.7]} color={p.grass} /></group>)}
  {[0, 1, 2].map(i => <Block key={i} at={[0, 3.3 + i * .38, -.2]} size={[3.2 - i * .7, .38, 2.7]} color={i % 2 ? p.grassLight : p.grass} />)}
  <Block at={[0, 1.6, -.4]} size={[2.3, 2.7, .3]} color={p.trunk} />
  {[-.65, 0, .65].map(x => <group key={x}><Block at={[x, 1.7, 1]} size={[.42, 1.8, .3]} color={p.dark} />{[1.1, 1.65, 2.2].map(y => <Block key={y} at={[x, y, 1.18]} size={[.26, .11, .06]} color={p.grass} glow />)}</group>)}
  <Html position={[0, 5.8, 0]} center distanceFactor={25} zIndexRange={[5, 0]}><div className="world-sign"><span>DISCOVERY OUTPOST</span><strong>McServ</strong><small>Minecraft server directory</small></div></Html>
 </group>;
}
export function McServPanel() {
 const [nearby, setNearby] = useState(false); const [open, setOpen] = useState(false); const opened = useRef(false);
 useEffect(() => {
  const timer = window.setInterval(() => setNearby(Math.abs(playerPosition.x - MCSERV.x) < 2.2 && playerPosition.y < 3 && useGame.getState().started), 100);
  const key = (event: KeyboardEvent) => { const s = useGame.getState(); if (event.code !== 'KeyE' || event.repeat || !s.started || playerPosition.y >= 3 || Math.abs(playerPosition.x - MCSERV.x) >= 2.2 || s.paused || s.panel !== null || s.map || (event.target instanceof HTMLElement && event.target.closest('input,textarea,select,button,a')) || document.querySelector('[role="dialog"]')) return; event.preventDefault(); opened.current = true; useGame.setState({ paused: true }); setOpen(true); };
  window.addEventListener('keydown', key, true); return () => { clearInterval(timer); window.removeEventListener('keydown', key, true); };
 }, []);
 const show = () => { opened.current = true; useGame.setState({ paused: true }); setOpen(true); };
 return <>{nearby && !open && !useGame.getState().paused && <Button className="interaction-prompt" variant="secondary" onClick={show}><kbd>E</kbd>Server Discovery<ArrowRight /></Button>}<Dialog open={open} onOpenChange={value => { setOpen(value); if (!value && opened.current) { useGame.setState({ paused: false }); opened.current = false; } }}><DialogContent className="portfolio-dialog" onEscapeKeyDown={e => e.stopPropagation()}><div className="panel-eyebrow">CAREER CITY · DISCOVERY OUTPOST</div><DialogTitle><Blocks className="inline-icon" />Minecraft Server Discovery</DialogTitle><DialogDescription>Explore the independent McServ.org server directory.</DialogDescription><div className="mcserv-editions"><section><strong>Java Edition</strong><p>Explore Minecraft Java server information on McServ.</p></section><section><strong>Bedrock Edition</strong><p>Check each server’s supported editions and connection details on McServ before joining.</p></section></div><p className="mcserv-note">No live listings or player counts are displayed here. McServ’s documented API checks votes; it does not document a server-listing feed. This outpost opens the directory, not a playable Minecraft client.</p><Button asChild><a href={MCSERV.directory} target="_blank" rel="noopener noreferrer">Open McServ.org<ExternalLink /></a></Button><Button asChild variant="ghost"><a href={MCSERV.documentation} target="_blank" rel="noopener noreferrer"><BookOpen />Official API documentation<ExternalLink /></a></Button></DialogContent></Dialog></>;
}