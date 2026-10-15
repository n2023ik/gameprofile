import { useEffect, useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, FileText, Gamepad2, Mail, MessageCircle, Moon, Send, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortfolioContent, SocialLinks } from '@/components/portfolio/PortfolioContent';
import { districts, links } from '@/game/data';

export const Route = createFileRoute('/portfolio')({
  head: () => ({
    meta: [
      { title: 'Nikhil Pandey — Product, Data & Development Portfolio' },
      { name: 'description', content: 'Nikhil Pandey’s experience at Lynkit, live projects, certificates, education and contact details.' },
      { property: 'og:title', content: 'Nikhil Pandey — Product, Data & Development' },
      { property: 'og:description', content: 'Product thinking, data discipline and practical software. Explore Nikhil’s professional portfolio.' },
      { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;600;800&display=swap' },
    ],
  }),
  component: Portfolio,
});

const nav = ['About', 'Experience', 'Projects', 'Certificates', 'Achievements', 'Education', 'Contact'];
const filters = ['All', 'Product & Apps', 'Data & Analytics', 'Business & Media'] as const;
type Filter = (typeof filters)[number];
const category = (title: string): Filter => /SLA|SmartStock/.test(title) ? 'Data & Analytics' : /ShopEase|Rental/.test(title) ? 'Business & Media' : 'Product & Apps';
const roles = ['Data & Analytics Builder', 'Product Success Intern', 'Practical Web Developer'];
const answers: [RegExp, string][] = [
  [/skill|tool|stack/i, 'SQL, Excel, React.js, Google Sheets, Apps Script, Supabase, Vercel and CapCut — plus Next.js, Node.js and MongoDB.'],
  [/lynkit|experience|work|intern/i, 'Product Success Intern at Lynkit (Jan–Jul 2026): quality checks, root-cause analysis, SQL/Excel validation and real-time dashboards. Received a full-time offer.'],
  [/project/i, 'Highlights: Quick Commerce SLA Diagnosis (KPI dashboard) and TalkNest, a real-time chat app with Socket.IO and OAuth.'],
  [/educat|study|degree|college/i, 'Diploma in CSE from GLA University (2023–2026), now pursuing a B.Tech in CSE at Mangalayatan University.'],
  [/contact|email|hire|reach/i, 'Email pandeynikhil429@gmail.com or find Nikhil on LinkedIn and GitHub — links are in the Contact section.'],
];

function Typing() {
  const [i, setI] = useState(0); const [n, setN] = useState(0);
  useEffect(() => {
    const word = roles[i % roles.length] ?? '';
    const t = setTimeout(() => { if (n < word.length) setN(n + 1); else { setN(0); setI(i + 1); } }, n < word.length ? 70 : 1800);
    return () => clearTimeout(t);
  }, [i, n]);
  return <span className="cl-typing">{(roles[i % roles.length] ?? '').slice(0, n)}<span aria-hidden>|</span></span>;
}

function Chatbot() {
  const [open, setOpen] = useState(false); const [q, setQ] = useState('');
  const [log, setLog] = useState<{ me: boolean; text: string }[]>([{ me: false, text: 'Hi! Ask me about Nikhil’s skills, experience, projects, education or contact.' }]);
  const ask = () => { if (!q.trim()) return; const a = answers.find(([r]) => r.test(q))?.[1] ?? 'I can answer about skills, experience, projects, education and contact.'; setLog(l => [...l, { me: true, text: q }, { me: false, text: a }]); setQ(''); };
  return <div className="cl-chat">
    {open && <div className="cl-chat-panel" role="dialog" aria-label="Ask about Nikhil"><div className="cl-chat-head"><strong>Ask about Nikhil</strong><button aria-label="Close chat" onClick={() => setOpen(false)}><X size={16} /></button></div><div className="cl-chat-log">{log.map((m, k) => <p key={k} className={m.me ? 'me' : ''}>{m.text}</p>)}</div><form onSubmit={e => { e.preventDefault(); ask(); }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. What are his skills?" aria-label="Your question" /><button aria-label="Send"><Send size={16} /></button></form></div>}
    <button className="cl-chat-btn" aria-label="Open chat" onClick={() => setOpen(!open)}><MessageCircle /></button>
  </div>;
}

function Portfolio() {
  const [dark, setDark] = useState(false); const [filter, setFilter] = useState<Filter>('All');
  useEffect(() => { try { setDark(localStorage.getItem('classic-theme') === 'dark'); localStorage.setItem('portfolio-mode', 'classic'); } catch { /* optional */ } }, []);
  const toggle = () => { setDark(d => { try { localStorage.setItem('classic-theme', d ? 'light' : 'dark'); } catch { /* optional */ } return !d; }); };
  const projects = useMemo(() => (districts[2]?.entries ?? []).filter(p => filter === 'All' || category(p.title) === filter), [filter]);
  return <div className={`classic ${dark ? 'cl-dark' : ''}`}>
    <header className="cl-nav"><a href="#top" className="cl-logo">N<span>P</span></a><nav aria-label="Sections">{nav.map(s => <a key={s} href={`#${s.toLowerCase()}`}>{s}</a>)}</nav><div className="cl-nav-actions"><Button asChild variant="ghost" size="sm"><Link to="/"><Gamepad2 />Switch mode</Link></Button><button className="cl-theme" onClick={toggle} aria-label="Toggle dark mode">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><Button asChild size="sm" className="cl-gold"><a href={links.resume} target="_blank" rel="noopener noreferrer"><FileText />Resume</a></Button></div></header>
    <section id="top" className="cl-hero">
      <div><span className="cl-badge"><span className="cl-dot" />Open to product, data, business roles</span><h1>Nikhil <em>Pandey</em></h1><p className="cl-lead">I work as a <Typing /></p><p className="cl-sub">I turn messy operational data into clearer decisions and build practical web tools. Based in Agra, India.</p>
        <div className="cl-cta"><Button asChild className="cl-gold"><a href={links.resume} target="_blank" rel="noopener noreferrer"><FileText />View Resume</a></Button><Button asChild variant="outline"><a href="#projects">See Selected Work<ArrowUpRight /></a></Button><Button asChild variant="ghost"><a href="#contact"><Mail />Contact</a></Button></div><SocialLinks /></div>
      <div className="cl-photo-wrap"><div className="cl-photo" role="img" aria-label="Nikhil Pandey monogram">NP</div><span className="cl-chip c1">SQL & Excel</span><span className="cl-chip c2">Live Dashboards</span><span className="cl-chip c3">Root-Cause Analysis</span></div>
    </section>
    {districts.map(d => d.id === 2
      ? <section id="projects" key={d.id} className="cl-section"><span className="cl-eyebrow">0{d.id + 1} — Selected work</span><h2>Projects</h2><div className="cl-tabs" role="tablist">{filters.map(f => <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>{f}</button>)}</div><div className="cl-grid">{projects.map(p => <article key={p.title} className="cl-card"><div className="cl-shot" aria-hidden>{p.title.split(/\s|\//).filter(Boolean).slice(0, 2).map(w => w[0]).join('')}</div><span className="cl-cat">{category(p.title)}</span><h3>{p.title}</h3><p>{p.detail}</p>{p.tags && <div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>}<div className="cl-card-links">{p.url && <a href={p.url} target="_blank" rel="noopener noreferrer">{p.action ?? 'Live'}<ArrowUpRight size={14} /></a>}<a href={links.github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={14} /></a></div></article>)}</div></section>
      : <section id={(nav[d.id] ?? '').toLowerCase()} key={d.id} className="cl-section"><span className="cl-eyebrow">0{d.id + 1} — {d.place}</span><h2>{d.name}</h2><PortfolioContent id={d.id} /></section>)}
    <footer className="cl-footer">Nikhil Pandey · Agra, India<SocialLinks /></footer>
    <Chatbot />
  </div>;
}
