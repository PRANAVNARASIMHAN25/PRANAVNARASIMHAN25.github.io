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
  const stats = [['~1,000', 'in-product guides replaced in-house'], ['80%', 'faster assignment'], ['15+', 'clients · 8+ industries']];
  return <section className="hero container" id="hero"><div className="hero-copy"><Badge accent>Product Builder · Product Analyst @ Darwinbox · BITS Pilani '26</Badge><h1>Pranav <em>Narasimhan</em></h1><p className="hero-lede">I take ambiguous problems to shipped products and measure the result.</p><div className="hero-actions"><a className="btn btn-primary" href="/spotlight.html">See Spotlight case study <ArrowUpRight size={16}/></a><a className="btn btn-secondary" href="/Pranav_N_Resume.pdf" download>Download resume <Download size={16}/></a></div><a className="current-link" href="/custom-objects.html">Currently: sole PM building Custom Objects at Darwinbox, from use case to client onboarding. →</a></div><div className="hero-side"><div className="stats">{stats.map(([value, label]) => <div className="stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="award"><Trophy size={14}/> {awardText}</div><span className="micro">28 September 2026 · Team-level award for the Spotlight team</span></div></section>;
}

const experiences = [
  ['Custom Objects', 'Current · Full-time', 'Customers need to track business-specific records that do not fit Darwinbox’s standard modules, so they fall back on spreadsheets or custom development.', ['Define the use case and scope the product as the only PM.', 'Onboard clients myself.'], 'Status: Current · In progress', '/custom-objects.html'],
  ['Spotlight', 'Full-time', 'Vendor cost and limited control over in-product guidance.', ['Led product and built the in-house guide-creation module.', 'Shipped tooltips, walkthroughs, and banners.'], 'Outcome: ~1,000 in-product guides replaced in-house.', '/spotlight.html'],
  ['AI Agents / Superagent', 'Full-time · Superagent integration and context graph: Internship', 'Teams lost time to repeat knowledge, GTM, and internal query work.', ['Built AI agents for knowledge management, GTM support, and internal queries.', 'Shipped Superagent for Slack, WhatsApp, and Microsoft Teams.'], 'Outcome: 15+ clients across 8+ industries.'],
  ['Ticket Routing', 'Full-time', 'Manual ticket triage delayed assignment and created uneven workloads.', ['Built automated ticket allocation with Jira APIs and Darwinbox Automation Hub.', 'Built a reusable routing framework.'], 'Outcome: Cut assignment time by 80%.'],
  ['Verification Webhook', 'Internship', 'Verified background-check data needed manual re-entry into employee profiles.', ['Built a real-time webhook pipeline for verified data.', 'Sent data into Darwinbox employee profiles.'], 'Outcome: Reduced manual re-entry to zero across 3 integrated workflows.']
];

function Experience() { return <section className="section container" id="experience"><SectionHeading eyebrow="// work experience" title={<>Where I've <em>learned</em></>}/><div className="timeline">{experiences.map(([name, phase, problem, bullets, result, href], i) => <Reveal key={name}><article className="experience-card"><div className="timeline-dot"/><div className="project-head"><div><h3>{name}</h3><span>Darwinbox Digital Solutions</span></div><Badge>{phase}</Badge></div><p className="problem">Problem: {problem}</p><ul>{bullets.map(b => <li key={b}><Check size={14}/>{b}</li>)}</ul><p className={name === 'Custom Objects' ? 'status-line' : 'outcome-line'}><b>{result.split(':')[0]}:</b>{result.split(':').slice(1).join(':')}</p>{href && <a className="text-link" href={href}>Read the {name} case study <ArrowUpRight size={14}/></a>}</article></Reveal>)}</div></section>; }
function SectionHeading({ eyebrow, title }) { return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>; }

const projects = [
  ['01', 'Decision Science · Analytics', 'Tripzy: Decision Intelligence for Travel Planning', 'Users spend 3–7 hours across 5+ platforms before choosing a destination, and group coordination adds 3–5 days.', 'Limit curated options to exactly 3; no on-platform booking in the MVP.', 'tripzy'],
  ['02', 'Marketplace · Product Strategy', 'FoodSwift: Fulfillment Reliability & Retention', 'Orders/Month fell from 3.2 to 2.8 and NPS from 42 to 35; post-confirmation cancellations drive silent churn.', 'Prioritize fulfillment reliability by reducing post-confirmation cancellations that drive silent churn, over acquisition or discounts.', 'foodswift'],
  ['03', 'Campus · Product Roadmap & Market Validation', 'Finds: Campus Lost & Found App', 'Research included 30+ surveys and 8 interviews.', 'Make photo search, categories, and real-time alerts the core MVP; defer map-based tracking and resale of unclaimed items to the roadmap.', 'findster']
  ,['04', 'Campus Ops · Product Optimization', 'Library Seat & Book Management System', 'Conducted user research to identify pain points in the library reservation flow, defined actionable product requirements, and analyzed feature adoption metrics to drive data-informed improvements.', 'Collaborated cross-functionally to automate booking workflows and shape a campus-wide rollout.', 'library-system']
  ,['05', 'FMCG · GTM Strategy', 'Biphasic Cosmetic Product', 'Performed market analysis to identify target segments and competitor positioning, then converted insights into product differentiation and brand strategy.', 'Built a go-to-market plan across product development, distribution, and marketing to support sustainable growth and investor appeal.', 'biphasic-cosmetic']
];
function Projects() { return <section className="section projects-section" id="projects"><div className="container"><SectionHeading eyebrow="// featured projects" title={<>What I've <em>built</em></>}/><div className="project-grid">{projects.map(([num, domain, title, insight, decision, key]) => <Reveal key={key}><article className="project-tile"><span className="project-number">{num}</span><span className="eyebrow">{domain}</span><h3>{title}</h3><Badge>Self-initiated case study</Badge><p><b>Key insight:</b> {insight}</p><p><b>Decision I made:</b> {decision}</p><a className="tile-link" href={`/project-detail.html?project=${key}`}>View in Detail <ArrowUpRight size={15}/></a></article></Reveal>)}</div></div></section>; }

function Skills() { return <section className="section container" id="skills"><SectionHeading eyebrow="// how I work" title={<>How I <em>work</em></>}/><div className="skills-grid">{[['Product', ['Problem decomposition', 'Metrics & guardrails', 'PRDs/specs', 'User research']], ['Technical', ['Python', 'SQL', 'REST APIs', 'Webhooks']], ['Tools', ['Figma', 'Jira', 'Power BI']]].map(([title, items]) => <div className="skill-group" key={title}><h3>{title}</h3><div>{items.map(item => <Badge key={item}>{item}</Badge>)}</div></div>)}</div></section>; }

function Contact() { return <section className="contact section" id="contact"><div className="container"><SectionHeading eyebrow="// say hello" title={<>Let's <em>connect</em></>}/><p>Open to Associate Product Manager roles.</p><div className="contact-links"><a href="mailto:pranav.n2535@gmail.com"><Mail size={17}/>pranav.n2535@gmail.com</a><a href="tel:+917660874948"><Phone size={17}/>+91 7660874948</a><a href="https://www.linkedin.com/in/pranav-narasimhan-33a631255" target="_blank" rel="noreferrer"><ArrowUpRight size={17}/>LinkedIn</a><a href="/Pranav_N_Resume.pdf" download><Download size={17}/>Download Resume</a></div></div></section>; }

function Home() { return <Shell><main><Hero/><section className="section container" id="about"><SectionHeading eyebrow="// about me" title={<>Product meets<br/>engineering & <em>analytics</em></>}/><div className="about-copy"><p><b>I don’t ship features. I ship systems that remove dependency and reclaim time.</b></p><p>I'm a product analyst at <b>Darwinbox (AI &amp; Studio)</b> and a B.E. student at <b>BITS Pilani</b> (EEE). I build automation pipelines, AI agents, and API integrations — and I’m comfortable owning <b>0→1 work</b> across fast-moving, cross-functional environments.</p><p>From replacing a third-party analytics vendor with an in-house Spotlight platform to routing 150+ tickets automatically and deploying AI agents across 15+ clients, I focus on ambiguous, high-stakes problems with clear, measurable outcomes.</p></div></section><Experience/><Projects/><Skills/><Contact/></main><footer>© 2026 Pranav Narasimhan · Curious enough to question. Bold enough to build.</footer></Shell>; }

function Spotlight() { return <Shell caseStudy><main className="case-page container"><div className="case-layout"><aside className="toc"><span className="eyebrow">On this page</span><a href="#context">Context</a><a href="#users">Users</a><a href="#role">My role</a><a href="#decisions">Decisions</a><a href="#scope">Scope</a><a href="#outcome">Outcome</a></aside><article className="case-content"><Badge accent>// Darwinbox · product case study</Badge><h1>Spotlight: <em>in-product guidance</em>, built in-house.</h1><p className="hero-lede">I led product and built Spotlight from scratch, writing the features myself to replace a third-party in-product guidance vendor.</p><div className="scope"><Badge>Tooltips</Badge><Badge>Walkthroughs</Badge><Badge>Banners</Badge><Badge>~1,000 guides to replace</Badge></div><CaseSection id="context" n="01 — Context & problem" title="Vendor cost and limited control."><p>Darwinbox used a third-party vendor for in-product guidance. That created recurring vendor cost and limited control over how guides were created, managed, and changed.</p></CaseSection><CaseSection id="users" n="02 — Users & job to be done" title="Guides for the people using the product."><p>Guide creators: Darwinbox product, implementation, and customer success teams who author in-product guides.</p><p>Guide consumers: End users of the Darwinbox platform, including employees, managers, and HR admins.</p><p>Job to be done: Help users complete a task inside the product without leaving to read documentation.</p></CaseSection><CaseSection id="role" n="03 — My role" title="I led product and built it."><p>I led product and built Spotlight from scratch. I wrote the features myself, taking the work from the problem through the guide-creation scope.</p></CaseSection><CaseSection id="decisions" n="04 — Key decisions & trade-offs" title="Focus the first release."><div className="decision-flow"><div>Problem<br/><small>Vendor cost and limited control.</small></div><i>→</i><div>Build in-house<br/><small>Cut recurring licensing cost and gain control.</small></div><i>→</i><div>First release<br/><small>Guide creation only; the rest of Pendo’s suite was left out.</small></div></div><p>Scope trade-off: Replaced only the guide creation module—tooltips, walkthroughs, and banners—not the whole vendor product, to ship faster and cover the highest-volume need first.</p></CaseSection><CaseSection id="scope" n="05 — Scope" title="Three guide formats, one migration target."><p>The initial scope covered tooltips, walkthroughs, and banners. The migration target was approximately 1,000 existing in-product guides.</p></CaseSection><CaseSection id="outcome" n="06 — Outcome" title="Results to validate."><p>Licensing cost saved: $100K+</p><p>Adoption: all clients</p><p>Migration status: ~1,000 in-product guides in scope</p><p>Time to launch: 2 months for building, testing, and going live</p></CaseSection><CaseSection n="07 — What I’d do next / learned" title="Measure guide performance before expanding scope."><p>Next, I would validate guide creation and migration outcomes before adding more modules. I learned to reduce scope around the first job users need done, then use evidence to choose what comes next.</p><p><b>Recognition:</b> Awarded Team Excellence at Darwinbox for Spotlight. My part: I led product and built Spotlight’s guide-creation features.</p></CaseSection></article></div></main><footer>© 2026 Pranav Narasimhan · Spotlight case study</footer></Shell>; }
function CaseSection({ id, n, title, children }) { return <section id={id} className="case-section"><span className="eyebrow">{n}</span><h2>{title}</h2>{children}</section>; }

function App() {
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname;
  const isSpotlight = path.endsWith('/spotlight.html') || params.get('page') === 'spotlight';
  useEffect(() => {
    if (!isSpotlight && params.get('section') === 'projects') requestAnimationFrame(() => document.getElementById('projects')?.scrollIntoView());
  }, [isSpotlight, params]);
  return isSpotlight ? <Spotlight/> : <Home/>;
}
createRoot(document.getElementById('root')).render(<App/>);
