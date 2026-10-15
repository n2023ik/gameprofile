import { ArrowRight, BookOpen, FileText, Play, Settings2, Volume2, VolumeX, RotateCcw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { links } from './data';
import { useGame } from './store';
import { muteAudio, unlockAudio } from './audio';

export function SoundButton() {
 const muted = useGame(s => s.muted);
 return <Button size="icon" variant="secondary" aria-label={muted ? 'Unmute sound' : 'Mute sound'} title={muted ? 'Unmute sound' : 'Mute sound'} onClick={() => { unlockAudio(); muteAudio(!muted); useGame.setState({ muted: !muted }); }}>{muted ? <VolumeX /> : <Volume2 />}</Button>;
}
export function OpeningMenu({ settings }: { settings: () => void }) {
 const started = useGame(s => s.started);
 if (started) return null;
 return <div className="opening-layer"><div className="opening-content"><span className="chapter-eyebrow">NIKHIL PANDEY · A CAREER IN MOTION</span><h1>The Career<br /><em>Adventure</em></h1><p>Seven islands. A world of possibilities.</p><div className="opening-actions"><Button size="lg" onClick={() => { unlockAudio(); useGame.setState({ started: true, paused: false }); }}><Play />Play Adventure<ArrowRight /></Button><Button asChild variant="secondary" size="lg"><a href={links.portfolio}><BookOpen />Explore Portfolio</a></Button><Button asChild variant="ghost"><a href={links.resume} target="_blank" rel="noopener noreferrer"><FileText />View Resume</a></Button><Button variant="ghost" onClick={settings}><Settings2 />Settings</Button></div></div><div className="opening-stamp"><span>01 / 07</span>THE FLOATING FRONTIER</div></div>;
}
export function Tutorial() {
 const visible = useGame(s => s.started && s.tutorial && !s.paused && s.panel === null);
 if (!visible) return null;
 return <div className="jump-tutorial"><div><span className="chapter-eyebrow">FIRST STEPS</span><strong>Find your footing.</strong><p>A / D to move · Space, W or ↑ to jump.<br />Press jump again in the air for a double jump.<br />Pink-marked bridges collapse — keep moving.</p></div><Button size="icon" variant="ghost" aria-label="Dismiss tutorial" onClick={() => useGame.setState({ tutorial: false })}><X /></Button></div>;
}
export function Completion() {
 const complete = useGame(s => s.complete);
 if (!complete) return null;
 return <div className="completion-layer"><div className="completion-content"><Check className="completion-icon" /><span className="chapter-eyebrow">ALL SEVEN CHAPTERS DISCOVERED</span><h2>Adventure complete.</h2><p>The next chapter starts with a conversation.</p><Button onClick={() => useGame.setState({ complete: false, panel: 6 })}>Let’s connect<ArrowRight /></Button><Button variant="ghost" onClick={() => useGame.getState().reset()}><RotateCcw />Play again</Button></div></div>;
}