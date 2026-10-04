import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, Check, Download, Mail, Menu, Moon, Phone, Sun, Trophy, X } from 'lucide-react';
import './styles.css';

const awardText = 'Team Excellence Award · Darwinbox';
const nav = [['About', '#about'], ['Experience', '#experience'], ['Projects', '#projects'], ['Skills', '#skills'], ['Contact', '#contact']];

function useTheme() {
  const [light, setLight] = useState(() => localStorage.getItem('portfolio-theme') === 'light');
  useEffect(() => { document.documentElement.dataset.theme = light ? 'light' : 'dark'; localStorage.setItem('portfolio-theme', light ? 'light' : 'dark'); }, [light]);
  return [light, () => setLight(v => !v)];
}

function Reveal({ children, className = '' }) { return <div className={`reveal ${className}`}>{children}</div>; }
function Badge({ children, accent = false }) { return <span className={`badge ${accent ? 'badge-accent' : ''}`}>{children}</span>; }

function Shell({ children, caseStudy = false }) {
  const [light, toggle] = useTheme();
  const [open, setOpen] = useState(false);
  return <>
    <header className="nav-wrap"><nav className="nav container">
      <a className="wordmark" href="/portfolio.html">PN<span>.</span></a>
      <div className={`nav-links ${open ? 'open' : ''}`}>{nav.map(([label, href]) => <a key={label} href={caseStudy ? `/portfolio.html${href}` : href} onClick={() => setOpen(false)}>{label}</a>)}</div>
      <div className="nav-actions"><button className="icon-btn menu-btn" aria-label="Toggle navigation" onClick={() => setOpen(v => !v)}>{open ? <X size={18}/> : <Menu size={18}/>}</button><button className="icon-btn" aria-label="Toggle theme" onClick={toggle}>{light ? <Moon size={16}/> : <Sun size={16}/>}</button></div>
    </nav></header>{children}
  </>;
}

function Hero() {
  const stats = [['Six-figure annual savings', '~1,000 guides replaced in-house'], ['Ticket routing', '~3 hours → a few minutes'], ['AI agents', '15+ clients · 8+ industries · 192 QA cases · ~95.8% pass']];
  return <section className="hero container" id="hero"><div className="hero-copy"><Badge accent>Product Builder · Product Analyst @ Darwinbox · BITS Pilani '26</Badge><h1>Pranav <em>Narasimhan</em></h1><p className="hero-lede">I take ambiguous problems to shipped products and measure the result.</p><div className="hero-actions"><a className="btn btn-primary" href="/spotlight.html">See Spotlight case study <ArrowUpRight size={16}/></a><a className="btn btn-secondary" href="/Pranav_N_Resume.pdf" download>Download resume <Download size={16}/></a></div><a className="current-link" href="/custom-objects.html">Currently: sole PM building Custom Objects at Darwinbox, from use case to client onboarding. →</a></div><div className="hero-side"><div className="stats">{stats.map(([value, label]) => <div className="stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="award"><Trophy size={14}/> {awardText}</div></div></section>;
}

const experiences = [
  ['Spotlight', 'Full-time', 'Darwinbox needed lower vendor cost and more control over in-product guidance.', ['Led product and built the guide-creation module in-house.', 'Shipped tooltips, walkthroughs, and banners for all clients.'], 'Outcome: six-figure annual vendor savings · ~1,000 guides replaced in-house · live for all clients.', '/spotlight.html'],
  ['AI Agents / Superagent', 'Full-time · Superagent integration and context graph: Internship', 'Teams needed support for knowledge, GTM, and internal queries.', ['Built agents and shipped Superagent on Slack, WhatsApp, and Microsoft Teams.', 'Tested 192 cases across WhatsApp and web.'], 'Outcome: 15+ clients across 8+ industries · ~95.8% QA pass rate.'],
  ['Custom Objects', 'Current · Full-time', 'Customers use spreadsheets or custom development for business-specific records.', ['Define the use case and scope the product as the sole PM.', 'Client conversations have not started yet.'], 'Status: Current · In progress', '/custom-objects.html'],
  ['Ticket Routing', 'Full-time', 'Manual routing took about 3 hours across module-specific queues for 15 users.', ['Built allocation with Jira APIs and Darwinbox Automation Hub for 150+ tickets.', 'Shipped a reusable routing framework.'], 'Outcome: ~3 hours → a few minutes.'],
  ['Verification Webhook', 'Internship', 'Verified background-check data needed manual re-entry.', ['Built a webhook pipeline that sends verified data into employee profiles.'], 'Outcome: Zero manual re-entry across 3 integrated workflows.']
];

function Experience() { return <section className="section container" id="experience"><SectionHeading eyebrow="// work experience" title={<>Where I've <em>learned</em></>}/><div className="timeline">{experiences.map(([name, phase, problem, bullets, result, href], i) => <Reveal key={name}><article className="experience-card"><div className="timeline-dot"/><div className="project-head"><div><h3>{name}</h3><span>Darwinbox Digital Solutions</span></div><Badge>{phase}</Badge></div><p className="problem">Problem: {problem}</p><ul>{bullets.map(b => <li key={b}><Check size={14}/>{b}</li>)}</ul><p className={name === 'Custom Objects' ? 'status-line' : 'outcome-line'}><b>{result.split(':')[0]}:</b>{result.split(':').slice(1).join(':')}</p>{href && <a className="text-link" href={href}>Read the {name} case study <ArrowUpRight size={14}/></a>}</article></Reveal>)}</div></section>; }
function SectionHeading({ eyebrow, title }) { return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>; }

const projects = [
  ['01', 'Travel · Product Strategy', 'Tripzy: Travel Planning', 'Users spend 3–7 hours across 5+ platforms before choosing a destination, and group coordination adds 3–5 days.', 'Limit curated options to exactly 3; no on-platform booking in the MVP.', 'tripzy'],
  ['02', 'Marketplace · Product Strategy', 'FoodSwift: Fulfillment Reliability', 'Numbers from a provided case brief: Orders/Month 3.2→2.8 and NPS 42→35; post-confirmation cancellations drive silent churn.', 'Prioritize fulfillment reliability by reducing post-confirmation cancellations over acquisition or discounts.', 'foodswift'],
  ['03', 'Campus Ops · Product Optimization', 'Library Seat & Book Management System', 'User research identified pain points in the library reservation flow and informed product requirements.', 'Automate booking workflows and shape a campus-wide rollout.', 'library-system']
];
const additionalProjects = [
  ['04', 'Campus · Product Roadmap', 'Findster: Campus Lost & Found App', 'Research included 30+ surveys and 8 interviews.', 'Make photo search, categories, and real-time alerts the core MVP.', 'findster'],
  ['05', 'FMCG · GTM Strategy', 'Biphasic Cosmetic Product', 'Performed market analysis to identify target segments and competitor positioning.', 'Built a go-to-market plan across product development, distribution, and marketing.', 'biphasic-cosmetic']
];
function ProjectTile({ item }) { const [num, domain, title, insight, decision, key] = item; return <Reveal><article className="project-tile"><span className="project-number">{num}</span><span className="eyebrow">{domain}</span><h3>{title}</h3><Badge>Self-initiated case study</Badge><p><b>Key insight:</b> {insight}</p><p><b>Decision I made:</b> {decision}</p><a className="tile-link" href={`/?page=project&project=${key}`}>View in Detail <ArrowUpRight size={15}/></a></article></Reveal>; }
function Projects() { return <section className="section projects-section" id="projects"><div className="container"><SectionHeading eyebrow="// featured projects" title={<>What I've <em>built</em></>}/><div className="project-grid">{projects.map(item => <ProjectTile key={item[5]} item={item}/>)}</div><a className="btn btn-secondary" href="/projects.html" style={{marginTop:'28px'}}>View all Projects <ArrowUpRight size={15}/></a></div></section>; }

const projectDetails = {
  tripzy: ['Tripzy: Travel Planning', 'Travel · Product Strategy', 'Defined a decision-first travel recommendation platform to reduce choice overload and help groups align on a destination.', 'docs/Tripzy_PRD_Document.pdf', 'docs/Tripzy_PM_Slides.pdf'],
  foodswift: ['FoodSwift: Fulfillment Reliability', 'Marketplace · Product Strategy', 'Numbers from a provided case brief: Orders/Month 3.2→2.8 and NPS 42→35. Identified post-confirmation cancellations as a driver of silent churn and proposed reliability-first interventions.', 'docs/FoodSwift_PRD.pdf', 'docs/FoodSwift_PM_Slides.pdf'],
  findster: ['Findster: Campus Lost & Found App', 'Campus · Product Roadmap', 'Research included 30+ surveys and 8 interviews. Built a campus lost and found concept around photo search, categories, and real-time alerts.', 'docs/Findster_Enhanced_PRD.pdf', 'docs/Findster_Enhanced_PPT.pdf'],
  'library-system': ['Library Seat & Book Management System', 'Campus Ops · Product Optimization', 'Conducted user research to identify pain points in the library reservation flow, defined actionable product requirements, and analyzed feature adoption metrics to drive data-informed improvements. Collaborated cross-functionally to automate booking workflows and shape a campus-wide rollout.', 'docs/LibSeat_PRD_Document.pdf', 'docs/LibSeat_PRD (1).pdf'],
  'biphasic-cosmetic': ['Biphasic Cosmetic Product', 'FMCG · GTM Strategy', 'Performed market analysis to identify target segments and competitor positioning, then converted insights into product differentiation and brand strategy.', 'docs/Sylver_PRD_Final.pdf', 'docs/Sylver_PM_Slides.pdf'],
};
function ProjectDetail({ project }) { const [title, domain, description, prd, slides] = projectDetails[project] || projectDetails.tripzy; return <Shell><main className="case-page container"><article className="case-content detail-page"><a className="text-link" href="/?section=projects">← Back to Featured Projects</a><span className="eyebrow">{domain}</span><h1>{title}</h1><Badge>Self-initiated case study</Badge><p className="hero-lede">{description}</p><div className="detail-links"><a className="btn btn-primary" href={`/${prd}`} target="_blank" rel="noreferrer">View PRD <ArrowUpRight size={16}/></a><a className="btn btn-secondary" href={`/${slides}`} target="_blank" rel="noreferrer">View slides <ArrowUpRight size={16}/></a></div></article></main><footer>© 2026 Pranav Narasimhan · Project detail</footer></Shell>; }
function AllProjects() { return <Shell><main><section className="section projects-section"><div className="container"><SectionHeading eyebrow="// all projects" title={<>More work I've <em>built</em></>}/><div className="project-grid">{[...projects, ...additionalProjects].map(item => <ProjectTile key={item[5]} item={item}/>)}</div></div></section></main><footer>© 2026 Pranav Narasimhan · All projects</footer></Shell>; }

function Skills() { return <section className="section container" id="skills"><SectionHeading eyebrow="// how I work" title={<>How I <em>work</em></>}/><div className="skills-grid">{[['Product', ['Problem decomposition', 'Metrics & guardrails', 'PRDs/specs', 'User research']], ['Technical', ['Python', 'SQL', 'REST APIs', 'Webhooks']], ['Tools', ['Figma', 'Jira', 'Power BI']]].map(([title, items]) => <div className="skill-group" key={title}><h3>{title}</h3><div>{items.map(item => <Badge key={item}>{item}</Badge>)}</div></div>)}</div></section>; }

function Contact() { return <section className="contact section" id="contact"><div className="container"><SectionHeading eyebrow="// say hello" title={<>Let's <em>connect</em></>}/><p>Open to Associate Product Manager roles.</p><div className="contact-links"><a href="mailto:pranav.n2535@gmail.com"><Mail size={17}/>pranav.n2535@gmail.com</a><a href="tel:+917660874948"><Phone size={17}/>+91 7660874948</a><a href="https://www.linkedin.com/in/pranav-narasimhan-33a631255" target="_blank" rel="noreferrer"><ArrowUpRight size={17}/>LinkedIn</a><a href="/Pranav_N_Resume.pdf" download><Download size={17}/>Download Resume</a></div></div></section>; }

function Home() { return <Shell><main><Hero/><section className="section container" id="about"><SectionHeading eyebrow="// about me" title={<>Product meets<br/>engineering & <em>analytics</em></>}/><div className="about-copy"><p>I build products for people who need clearer guidance, flexible records, or faster answers at work. At Darwinbox, I led Spotlight from vendor dependency to an in-house guide module, I am shaping Custom Objects from internal discussions, and I have shipped AI agents across Slack, WhatsApp, and Microsoft Teams.</p><p>My EEE degree shapes how I think about systems: make constraints explicit, choose the smallest useful scope, and measure whether the change helps the people using it.</p></div></section><Experience/><Projects/><Skills/><Contact/></main><footer>© 2026 Pranav Narasimhan · Curious enough to question. Bold enough to build.</footer></Shell>; }

function Spotlight() { return <Shell caseStudy><main className="case-page container"><div className="case-layout"><aside className="toc"><span className="eyebrow">On this page</span><a href="#context">Context</a><a href="#users">Users</a><a href="#role">My role</a><a href="#decisions">Decisions</a><a href="#scope">Scope</a><a href="#outcome">Outcome</a></aside><article className="case-content"><Badge accent>// Darwinbox · product case study</Badge><h1>Spotlight: <em>in-product guidance</em>, built in-house.</h1><p className="hero-lede">I led product and built the in-house guide-creation module for tooltips, walkthroughs, and banners.</p><div className="scope"><Badge>Tooltips</Badge><Badge>Walkthroughs</Badge><Badge>Banners</Badge><Badge>~1,000 guides replaced in-house</Badge></div><CaseSection id="context" n="01 — Context & problem" title="Vendor cost and limited control."><p>Darwinbox used a third-party vendor for in-product guidance. The build aimed to reduce vendor cost and give the team more control over how guides were created, managed, and changed.</p></CaseSection><CaseSection id="users" n="02 — Users & job to be done" title="Guides for the people using the product."><p>Guide creators: Darwinbox product, implementation, and customer success teams who author in-product guides.</p><p>Guide consumers: End users of the Darwinbox platform, including employees, managers, and HR admins.</p><p>Job to be done: Help users complete a task inside the product without leaving to read documentation.</p></CaseSection><CaseSection id="role" n="03 — My role" title="I led product and built it."><p>I led product and built the in-house guide-creation module. The team supported delivery; I owned the product decisions and wrote the features myself.</p></CaseSection><CaseSection id="decisions" n="04 — Key decisions & trade-offs" title="Focus the first release."><div className="decision-flow"><div>Problem<br/><small>Vendor cost and limited control.</small></div><i>→</i><div>Build in-house<br/><small>Reduce annual vendor cost and gain control.</small></div><i>→</i><div>First release<br/><small>Guide creation only; the rest of Pendo’s suite was left out.</small></div></div><p>Scope trade-off: Replaced only the guide creation module—not the whole vendor product—to ship faster and cover the highest-volume need first.</p></CaseSection><CaseSection id="scope" n="05 — Scope" title="Three guide formats, one completed migration."><p>The scope covered tooltips, walkthroughs, and banners. Approximately 1,000 existing in-product guides were replaced in-house.</p></CaseSection><CaseSection id="outcome" n="06 — Outcome" title="Live for every Darwinbox client."><p>Live for all Darwinbox clients.</p><p>~1,000 guides replaced in-house.</p><p>Six-figure annual vendor savings.</p></CaseSection><CaseSection n="07 — What I’d do next / learned" title="Measure guide performance before expanding scope."><p>Next, I would measure guide performance before adding more modules. I learned to reduce scope around the first job users need done, then use evidence to choose what comes next.</p><p><b>Recognition:</b> Awarded Team Excellence at Darwinbox for Spotlight. My part: I led product and built Spotlight’s guide-creation features.</p></CaseSection></article></div></main><footer>© 2026 Pranav Narasimhan · Spotlight case study</footer></Shell>; }
function CaseSection({ id, n, title, children }) { return <section id={id} className="case-section"><span className="eyebrow">{n}</span><h2>{title}</h2>{children}</section>; }

function App() {
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname;
  const isSpotlight = path.endsWith('/spotlight.html') || params.get('page') === 'spotlight';
  const project = params.get('project');
  const isProject = params.get('page') === 'project' || Boolean(project);
  const isAllProjects = params.get('page') === 'all-projects';
  useEffect(() => {
    if (!isSpotlight && params.get('section') === 'projects') requestAnimationFrame(() => document.getElementById('projects')?.scrollIntoView());
  }, [isSpotlight, params]);
  return isSpotlight ? <Spotlight/> : isAllProjects ? <AllProjects/> : isProject ? <ProjectDetail project={project || 'tripzy'}/> : <Home/>;
}
createRoot(document.getElementById('root')).render(<App/>);
