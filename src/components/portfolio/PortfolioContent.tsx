import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Send, Github, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { districts, links } from '@/game/data';
export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const data = new FormData(form); setStatus('sending');
    try { const response = await fetch('https://formspree.io/f/mgvyzegz', { method: 'POST', body: data, headers: { Accept: 'application/json' } }); if (!response.ok) throw new Error('Message not accepted'); setStatus('success'); form.reset(); } catch { setStatus('error'); }
  }
  return <form onSubmit={submit} className="contact-form"><h3>Send a message</h3><label>Your name<input name="name" required maxLength={100} autoComplete="name" /></label><label>Email address<input name="email" type="email" required maxLength={254} autoComplete="email" /></label><label>Message<textarea name="message" required minLength={10} maxLength={5000} rows={4} /></label><Button type="submit" disabled={status === 'sending'}><Send />{status === 'sending' ? 'Sending…' : 'Send message'}</Button><p role="status">{status === 'success' ? 'Message sent. Thank you for reaching out!' : status === 'error' ? 'Your message could not be sent. Please email pandeynikhil429@gmail.com directly.' : ''}</p></form>;
}
export function PortfolioContent({ id }: { id: number }) {
  const district = districts[id]; if (!district) return null;
  return <div className="portfolio-content"><p className="panel-intro">{district.subtitle}</p>{district.entries.map((entry, i) => <article className="portfolio-entry" key={entry.title}><span className="entry-index">{String(i + 1).padStart(2, '0')}</span><div><h3>{entry.title}</h3><p>{entry.detail}</p>{entry.tags && <div className="tags">{entry.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}{entry.url && <Button asChild variant="outline" size="sm"><a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.action ?? 'Live demo'}<ArrowUpRight /></a></Button>}</div></article>)}{id === 2 && <Button asChild variant="secondary"><a href={links.github} target="_blank" rel="noopener noreferrer"><Github />More on GitHub<ArrowUpRight /></a></Button>}{id === 3 && <p className="source-note">Additional credentials are listed in the supplied portfolio. Verification links are shown only where available.</p>}{id === 6 && <ContactForm />}</div>;
}
export function SocialLinks() { return <div className="social-links"><a href={links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={18} /></a><a href={links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a><a href={links.email} aria-label="Email Nikhil"><Mail size={18} /></a></div>; }
