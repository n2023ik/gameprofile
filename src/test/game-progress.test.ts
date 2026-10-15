import { describe, it, expect } from 'vitest';
import { collect, discover, freshProgress, xp } from '@/game/store';
import { districts, links } from '@/game/data';
describe('Career adventure progress', () => {
 it('begins with zero of seven badges', () => { expect(freshProgress().badges).toHaveLength(0); expect(districts).toHaveLength(7); });
 it('collects each physical coin only once', () => { const one = collect(freshProgress(), 4); expect(collect(one, 4).coins).toEqual([4]); expect(collect(one, 5).coins).toEqual([4,5]); });
 it('unlocks one badge per district and never an eighth', () => { let p = freshProgress(); for(let i=0;i<7;i++) p=discover(p,i); expect(p.badges).toEqual([0,1,2,3,4,5,6]); expect(discover(p,7).badges).toHaveLength(7); expect(discover(p,2).badges).toHaveLength(7); });
 it('awards XP for discoveries and coins', () => { expect(xp(collect(discover(freshProgress(),0),3))).toBe(110); });
 it('preserves the supplied five project destinations', () => { expect(districts.find(d=>d.id===2)?.entries.flatMap(e=>e.url ? [e.url] : [])).toEqual(['https://quick-commerce-sla-diagnosis.vercel.app/auth','https://chatterbox-vly4.onrender.com/','https://resume-bulder-app.vercel.app/','https://packman-aj2d.vercel.app/','https://harmony-player.vercel.app/']); });
 it('keeps the supplied resume available', () => { expect(links.resume).toBe('https://drive.google.com/file/d/1SBd48_gHIOT9XYck-kKVsc5kwEsTmczB/view?usp=sharing'); });
});
