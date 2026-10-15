export const links = {
  portfolio: 'https://n2023ik.github.io/my-portfoli/',
  resume: 'https://drive.google.com/file/d/1SBd48_gHIOT9XYck-kKVsc5kwEsTmczB/view?usp=sharing',
  download: 'https://drive.google.com/uc?export=download&id=1SBd48_gHIOT9XYck-kKVsc5kwEsTmczB',
  github: 'https://github.com/n2023ik', linkedin: 'https://www.linkedin.com/in/nikhil-pandey-45b276276',
  email: 'mailto:pandeynikhil429@gmail.com', whatsapp: 'https://wa.me/918273646729',
};
export interface Entry { title: string; detail: string; tags?: string[]; url?: string; action?: string }
export interface District { id: number; name: string; place: string; subtitle: string; x: number; entries: Entry[] }
export const districts: District[] = [
  { id: 0, name: 'About Me', place: 'The beginning', subtitle: 'Product thinking. Data discipline.', x: 0, entries: [
    { title: 'Hello, I’m Nikhil Pandey.', detail: 'A Computer Science Engineering professional based in Agra, India. I turn messy operational data into clearer decisions and build practical web applications. My interests span product development, software engineering, data analytics and business problem-solving.' },
    { title: 'Product & operations', detail: 'Product quality checks, defect identification, root-cause analysis, complaint investigation and stakeholder coordination.', tags: ['Product QC', 'RCA', 'Reporting'] },
    { title: 'Data & development', detail: 'SQL and Excel validation, real-time dashboards, workflow automation and full-stack web applications.', tags: ['SQL', 'Excel', 'React.js', 'Google Apps Script', 'JavaScript'] },
    { title: 'Business & media', detail: 'Product explainers, presentations and operational reporting that connect technical teams with business needs.', tags: ['CapCut', 'Communication', 'Product thinking'] },
    { title: 'Development toolkit', detail: 'HTML, CSS, JavaScript, React, Next.js, Node.js, Express.js, PHP, MySQL, MongoDB, Socket.IO, Git, GitHub, OAuth 2.0 and JWT.', tags: ['Frontend', 'Backend', 'Authentication', 'Databases'] },
  ] },
  { id: 1, name: 'Experience', place: 'Lynkit HQ', subtitle: 'Where ideas meet impact', x: 18, entries: [
    { title: 'Product Success Intern', detail: 'Lynkit Solutions Pvt. Ltd. · Delhi, India · January 2026 – July 2026. End-to-end product quality assurance, operational reporting and data validation.' },
    { title: 'Quality & root-cause investigation', detail: 'Ran quality checks before client distribution, identified defects, investigated product complaints, classified tampered events and coordinated fixes with engineering.' },
    { title: 'Data & real-time dashboards', detail: 'Validated SQL and Excel data before client reports. Built a tracking dashboard with React.js, Google Sheets and Apps Script to replace manual multi-sheet reporting. Coordinated updates across product, engineering and operations.' },
    { title: 'Lynkit animated explainer', detail: 'Scripted, designed and animated a product explainer in CapCut to simplify IoT logistics concepts and support marketing.', tags: ['CapCut', 'Product communication'], url: 'https://lnkd.in/p/diW-ueZe', action: 'Watch explainer' },
  ] },
  { id: 2, name: 'Projects', place: 'Project District', subtitle: 'Built from curiosity', x: 36, entries: [
    { title: 'Quick Commerce SLA Diagnosis', detail: 'Helps operations teams understand SLA performance, identify breaches and delays, locate bottlenecks and track KPI trends.', tags: ['Supabase', 'SLA monitoring', 'KPI dashboard', 'Vercel'], url: 'https://quick-commerce-sla-diagnosis.vercel.app/auth' },
    { title: 'TalkNest / ChatterBox', detail: 'Full-stack real-time messaging with OAuth sign-in, WebSocket chat, online presence, profiles and recent message history.', tags: ['Next.js', 'Socket.IO', 'MongoDB', 'OAuth 2.0'], url: 'https://chatterbox-vly4.onrender.com/' },
    { title: 'Resume Builder', detail: 'Draft and format ATS-friendly resumes with a live preview and PDF export.', tags: ['React', 'JavaScript'], url: 'https://resume-bulder-app.vercel.app/' },
    { title: 'Pacman Game', detail: 'A browser-playable Pac-Man-style arcade game.', tags: ['Flutter', 'Dart', 'Vercel'], url: 'https://packman-aj2d.vercel.app/', action: 'Play game' },
    { title: 'Harmony Music Player', detail: 'A web music player with playlists, album art, a current-track display and a progress timer.', tags: ['JavaScript', 'Audio', 'Vercel'], url: 'https://harmony-player.vercel.app/' },
    { title: 'AI-Assisted Rental & Asset Management System', detail: 'A project in my development portfolio. Contact me for more information.' },
    { title: 'ShopEase', detail: 'A project in my development portfolio. Contact me for more information.' },
    { title: 'PlacementPrep+', detail: 'A placement-preparation application. Contact me for more information.' },
    { title: 'SmartStock', detail: 'A project in my development portfolio. Contact me for more information.' },
  ] },
  { id: 3, name: 'Certificates', place: 'Certificate Arcade', subtitle: 'Always levelling up', x: 54, entries: [
    { title: 'Python Essentials 1', detail: 'Cisco Networking Academy & Python Institute.' },
    { title: 'SQL (Basic)', detail: 'HackerRank · Queries, joins and aggregations.', url: 'https://www.hackerrank.com/certificates/d15db3e7830f', action: 'Verify certificate' },
    { title: 'ACE Coding Interviews: DSA', detail: 'Data structures and algorithms with Java.' },
    { title: 'Lynkit Product Success Internship', detail: 'Six-month internship in product quality, dashboards and media.' },
    { title: 'Deviathon 2025 Hackathon', detail: 'Built a placement-preparation web application with real-time tracking.' },
  ] },
  { id: 4, name: 'Achievements', place: 'Achievement Garden', subtitle: 'Small wins. Real impact.', x: 72, entries: [
    { title: 'Creative Genius — Lynkit Solutions', detail: 'Internal recognition for contributions to real-time analytics dashboards, creative problem-solving and marketing video work.' },
    { title: 'Selected for full-time employment', detail: 'Received a full-time offer from Lynkit in July 2026 based on internship performance, including operational dashboards and product communication work.' },
  ] },
  { id: 5, name: 'Education', place: 'Education Campus', subtitle: 'A foundation for what’s next', x: 90, entries: [
    { title: 'B.Tech · Computer Science Engineering', detail: 'Mangalayatan University · Working Professional Program · 2026–2029 · Pursuing. Software development methodologies, networks, database management and business applications.' },
    { title: 'Diploma · Computer Science Engineering', detail: 'GLA University, Mathura · 2023–April 2026 · Completed. Foundations in computer science, software design, database handling and software architecture.' },
  ] },
  { id: 6, name: 'Contact & Resume', place: 'The next chapter', subtitle: 'Let’s build something meaningful', x: 108, entries: [
    { title: 'Let’s connect', detail: 'Open to Product, Data Analytics and Business Development opportunities. Based in Agra, Uttar Pradesh, India; open to relocation and remote opportunities.' },
    { title: 'Resume', detail: 'Experience, skills and selected work in one place.', url: links.resume, action: 'View resume' },
    { title: 'Download resume', detail: 'Keep a PDF copy.', url: links.download, action: 'Download PDF' },
    { title: 'GitHub', detail: 'Explore my code and projects.', url: links.github, action: 'Open GitHub' },
    { title: 'LinkedIn', detail: 'Professional updates and product work.', url: links.linkedin, action: 'Open LinkedIn' },
    { title: 'Email', detail: 'pandeynikhil429@gmail.com', url: links.email, action: 'Write an email' },
    { title: 'WhatsApp', detail: '+91 82736 46729', url: links.whatsapp, action: 'Start a conversation' },
  ] },
];
