import { useEffect } from 'react';
import { controls, useGame } from './store';
import { unlockAudio } from './audio';
export function useControls() {
  useEffect(() => {
    const clear = () => { controls.left = controls.right = controls.jump = controls.sprint = controls.jumpPressed = false; };
    const key = (event: KeyboardEvent, down: boolean) => {
      if (!down) {
        if (['KeyA', 'ArrowLeft'].includes(event.code)) controls.left = false;
        if (['KeyD', 'ArrowRight'].includes(event.code)) controls.right = false;
        if (['Space', 'KeyW', 'ArrowUp'].includes(event.code)) controls.jump = false;
        if (event.code.startsWith('Shift')) controls.sprint = false;
        return;
      }
      if (event.defaultPrevented || document.querySelector('[role="dialog"]')) return;
      if ((event.target instanceof HTMLElement) && event.target.closest('input,textarea,select,[role="dialog"]')) return;
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(event.code)) event.preventDefault();
      unlockAudio();
      if (['KeyA', 'ArrowLeft'].includes(event.code)) controls.left = down;
      if (['KeyD', 'ArrowRight'].includes(event.code)) controls.right = down;
      if (['Space', 'KeyW', 'ArrowUp'].includes(event.code)) { if (!event.repeat) controls.jumpPressed = true; controls.jump = down; }
      if (event.code.startsWith('Shift')) controls.sprint = down;
      const s = useGame.getState();
      if (down && !event.repeat && event.code === 'KeyE' && s.nearby !== null && !s.paused) { s.discover(s.nearby); s.setPanel(s.nearby); clear(); }
      if (down && !event.repeat && event.code === 'Escape') { if (s.panel !== null) s.setPanel(null); else useGame.setState({ paused: !s.paused, map: false }); clear(); }
    };
    const down = (e: KeyboardEvent) => key(e, true); const up = (e: KeyboardEvent) => key(e, false);
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', clear);
    return () => { clear(); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', clear); };
  }, []);
}
