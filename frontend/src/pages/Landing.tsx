import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '💬',
    title: 'Plain English in, SQL out',
    body: "Ask the way you'd ask a colleague. A chain of agents turns the question into a clean, working PostgreSQL query.",
  },
  {
    icon: '🧠',
    title: 'Knows your schema',
    body: 'Upload your schema once. QueryMind embeds your tables and relationships so every question is answered in context.',
  },
  {
    icon: '✅',
    title: 'Checked before it runs',
    body: 'Every generated query is parsed and validated before it ever touches your database.',
  },
  {
    icon: '💡',
    title: 'An answer, not just rows',
    body: 'Alongside the query and the results table, QueryMind writes a short summary of what the data actually shows.',
  },
  {
    icon: '🔀',
    title: 'Multi-agent under the hood',
    body: 'Built on LangGraph, separate agents plan, write, validate, and explain each query rather than one model guessing in one shot.',
  },
  {
    icon: '⚡',
    title: 'Fast enough to feel like chat',
    body: 'Inference runs on Groq, so the gap between asking and answering stays in seconds, not minutes.',
  },
];

const steps = [
  {
    title: 'Connect your schema',
    body: 'Upload a .sql file describing your tables. QueryMind reads the structure once and remembers it.',
  },
  {
    title: 'Ask in plain English',
    body: "Type a business question the way you'd ask a teammate — no joins, no syntax to remember.",
  },
  {
    title: 'Read the answer',
    body: 'Get the SQL, the result table, and a written takeaway, all in one place.',
  },
];

const chartBars = [
  { label: 'Acme', h: 100 },
  { label: 'Northwind', h: 74 },
  { label: 'Globex', h: 61 },
  { label: 'Initech', h: 52 },
  { label: 'Umbrella', h: 38 },
];

const Landing = () => {
  const navigate = useNavigate();
  const goToApp = () => navigate('/login');

  return (
    <div style={styles.page}>
      <style>{globalCss}</style>

      {/* --- Nav --- */}
      <header style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}>✨</span> QueryMind
          </div>
          <nav className="nav-links" style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#how-it-works" style={styles.navLink}>How it works</a>
          </nav>
          <button className="btn-primary" style={styles.navCta} onClick={goToApp}>
            Open QueryMind
          </button>
        </div>
      </header>

      {/* --- Hero --- */}
      <section style={styles.hero}>
        <div style={styles.heroGlowA} />
        <div style={styles.heroGlowB} />
        <div className="hero-grid" style={styles.heroGrid}>
          <div style={styles.heroCopy}>
            <div style={styles.eyebrow}>AI SQL ANALYST</div>
            <h1 style={styles.h1}>
              Type the question.
              <br />
              Skip the SQL.
            </h1>
            <p style={styles.heroSub}>
              QueryMind reads your database schema, writes the query, runs it, and
              tells you what the result means — from a single line of plain
              English.
            </p>
            <div style={styles.heroActions}>
              <button className="btn-primary-lg" style={styles.ctaPrimary} onClick={goToApp}>
                Open QueryMind →
              </button>
              <a href="#how-it-works" className="btn-ghost" style={styles.ctaGhost}>
                See how it works
              </a>
            </div>
            <p style={styles.heroCaption}>
              No SQL experience required · Works with your PostgreSQL database
            </p>
          </div>

          {/* Signature element: live "ask → SQL → chart → insight" demo */}
          <div style={styles.demoWrap}>
            <div style={styles.demoCard}>
              <div style={styles.demoHeader}>
                <span style={{ ...styles.dot, background: '#ef4444' }} />
                <span style={{ ...styles.dot, background: '#f59e0b' }} />
                <span style={{ ...styles.dot, background: '#10b981' }} />
                <span style={styles.demoLabel}>querymind — ask</span>
              </div>

              <div style={styles.demoBody}>
                <div className="reveal r1" style={styles.askRow}>
                  <span style={styles.askLabel}>You asked</span>
                  <p style={styles.askText}>
                    "Show me the top 5 customers by revenue this quarter"
                    <span className="cursor">▍</span>
                  </p>
                </div>

                <div className="reveal r2" style={styles.sqlBlock}>
                  <div style={styles.sqlHeaderRow}>
                    <span>Generated SQL</span>
                    <span style={styles.langTag}>POSTGRESQL</span>
                  </div>
                  <pre style={styles.sqlCode}>{`SELECT customer_name, SUM(revenue) AS total
FROM orders
WHERE quarter = 'Q2-2026'
GROUP BY customer_name
ORDER BY total DESC
LIMIT 5;`}</pre>
                </div>

                <div className="reveal r3" style={styles.chartBlock}>
                  <div style={styles.chartBars}>
                    {chartBars.map((b, i) => (
                      <div key={b.label} style={styles.barCol}>
                        <div
                          className="chart-bar"
                          style={{
                            ...styles.bar,
                            height: `${b.h}%`,
                            animationDelay: `${2.1 + i * 0.12}s`,
                          }}
                        />
                        <span style={styles.barLabel}>{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="reveal r4" style={styles.insightBox}>
                  <span style={styles.insightTag}>Insight</span>
                  <p style={styles.insightText}>
                    Acme leads with $128,400 — 34% ahead of the next account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Trust strip --- */}
      <section style={styles.trustStrip}>
        <div style={styles.trustInner}>
          <span style={styles.trustLabel}>Built on</span>
          <div style={styles.trustBadges}>
            {['FastAPI', 'PostgreSQL', 'LangGraph', 'Groq', 'ChromaDB', 'sqlglot'].map((t) => (
              <span key={t} style={styles.trustBadge}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* --- Features --- */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.eyebrowDark}>WHAT IT DOES</div>
          <h2 style={styles.h2}>Everything between your question and your answer</h2>
          <div className="feature-grid" style={styles.featureGrid}>
            {features.map((f) => (
              <div key={f.title} className="feature-card" style={styles.featureCard}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureBody}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- How it works --- */}
      <section id="how-it-works" style={styles.sectionAlt}>
        <div style={styles.sectionInner}>
          <div style={styles.eyebrowDark}>THE FLOW</div>
          <h2 style={styles.h2}>Three steps from schema to insight</h2>
          <div className="steps-row" style={styles.stepsRow}>
            {steps.map((s, i) => (
              <div key={s.title} style={styles.stepCol}>
                <div style={styles.stepNum}>0{i + 1}</div>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepBody}>{s.body}</p>
                {i < steps.length - 1 && <div className="step-line" style={styles.stepLine} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA band --- */}
      <section style={styles.ctaBand}>
        <h2 style={styles.ctaH2}>Stop writing SQL by hand.</h2>
        <p style={styles.ctaP}>Sign in and ask your first question in under a minute.</p>
        <button className="btn-primary-lg" style={styles.ctaPrimary} onClick={goToApp}>
          Open QueryMind →
        </button>
      </section>

      {/* --- Footer --- */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div>
            <div style={styles.brand}>
              <span style={styles.brandIcon}>✨</span> QueryMind
            </div>
            <p style={styles.footerTagline}>Natural language analysis for PostgreSQL.</p>
          </div>
          <div style={styles.footerLinks}>
            <a href="#features" style={styles.footerLink}>Features</a>
            <a href="#how-it-works" style={styles.footerLink}>How it works</a>
            <a onClick={goToApp} style={{ ...styles.footerLink, cursor: 'pointer' }}>Open QueryMind</a>
          </div>
          <div style={styles.footerCredits}>
            Built by <strong>Mohsin Moiz Ali</strong> &amp; <strong>Ilham Shaikh</strong>
            <div style={styles.footerCopy}>© 2026 QueryMind</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Global CSS: keyframes, hover states, focus rings, responsive overrides ---
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Fira+Code:wght@400;500&display=swap');

  html { scroll-behavior: smooth; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes barGrow {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }
  @keyframes blink {
    0%, 50% { opacity: 1; }
    50.01%, 100% { opacity: 0; }
  }
  @keyframes drift {
    0% { transform: translate(0, 0); }
    100% { transform: translate(30px, -20px); }
  }

  .reveal { opacity: 0; animation: fadeUp 0.7s ease forwards; }
  .r1 { animation-delay: 0.3s; }
  .r2 { animation-delay: 1.0s; }
  .r3 { animation-delay: 1.8s; }
  .r4 { animation-delay: 3.0s; }

  .chart-bar { transform-origin: bottom; animation: barGrow 0.5s cubic-bezier(.2,.8,.2,1) both; }
  .cursor { display: inline-block; margin-left: 2px; animation: blink 1s steps(1) infinite; }

  .btn-primary, .btn-primary-lg {
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
  .btn-primary:hover, .btn-primary-lg:hover { transform: translateY(-2px); opacity: 0.92; }
  .btn-ghost { transition: color 0.15s ease, border-color 0.15s ease; }
  .btn-ghost:hover { color: #ffffff !important; border-color: #94a3b8 !important; }

  .nav-links a { transition: color 0.15s ease; }
  .nav-links a:hover { color: #ffffff !important; }

  .feature-card { transition: transform 0.2s ease, border-color 0.2s ease; }
  .feature-card:hover { transform: translateY(-4px); border-color: #cbd5e1 !important; }

  a:focus-visible, button:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 3px;
  }

  @media (max-width: 860px) {
    .hero-grid { grid-template-columns: 1fr !important; }
    .nav-links { display: none !important; }
    .feature-grid { grid-template-columns: 1fr !important; }
    .steps-row { flex-direction: column !important; gap: 2.5rem !important; }
    .step-line { display: none !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal { opacity: 1 !important; animation: none !important; }
    .chart-bar { animation: none !important; transform: scaleY(1) !important; }
    .cursor { animation: none !important; }
  }
`;

// --- Styles (same pattern as Login.tsx / Dashboard.tsx) ---
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    background: '#ffffff',
    color: '#0f172a',
    overflowX: 'hidden',
  },

  // Nav
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: 'rgba(2, 6, 23, 0.85)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(148,163,184,0.15)',
  },
  navInner: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '0.9rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  brandIcon: { fontSize: '1.1rem' },
  navLinks: { display: 'flex', gap: '2rem' },
  navLink: { color: '#94a3b8', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none' },
  navCta: {
    padding: '9px 18px',
    borderRadius: '8px',
    border: 'none',
    background: '#ffffff',
    color: '#0f172a',
    fontSize: '0.88rem',
    fontWeight: 700,
    cursor: 'pointer',
  },

  // Hero
  hero: {
    position: 'relative',
    background: '#020617',
    padding: 'clamp(3rem, 8vw, 6.5rem) 2rem clamp(4rem, 8vw, 7rem)',
    overflow: 'hidden',
  },
  heroGlowA: {
    position: 'absolute',
    top: '-10%',
    right: '-5%',
    width: '50vw',
    height: '50vw',
    maxWidth: '600px',
    maxHeight: '600px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.28), transparent 65%)',
    filter: 'blur(30px)',
    animation: 'drift 16s ease-in-out infinite alternate',
    pointerEvents: 'none',
  },
  heroGlowB: {
    position: 'absolute',
    bottom: '-15%',
    left: '-10%',
    width: '45vw',
    height: '45vw',
    maxWidth: '550px',
    maxHeight: '550px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.24), transparent 65%)',
    filter: 'blur(30px)',
    animation: 'drift 20s ease-in-out infinite alternate-reverse',
    pointerEvents: 'none',
  },
  heroGrid: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '1180px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    gap: 'clamp(2.5rem, 5vw, 4rem)',
    alignItems: 'center',
  },
  heroCopy: { maxWidth: '560px' },
  eyebrow: {
    fontFamily: "'Fira Code', monospace",
    fontSize: '0.78rem',
    letterSpacing: '2px',
    color: '#60a5fa',
    fontWeight: 600,
    marginBottom: '1.25rem',
  },
  h1: {
    fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)',
    fontWeight: 800,
    lineHeight: 1.08,
    letterSpacing: '-1.5px',
    margin: '0 0 1.25rem',
    background: 'linear-gradient(to bottom right, #ffffff, #cbd5e1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: 'clamp(1rem, 1.1vw + 0.7rem, 1.2rem)',
    color: '#94a3b8',
    lineHeight: 1.6,
    marginBottom: '2rem',
  },
  heroActions: { display: 'flex', flexWrap: 'wrap', gap: '0.9rem', marginBottom: '1.1rem' },
  ctaPrimary: {
    padding: '14px 26px',
    borderRadius: '10px',
    border: 'none',
    background: '#ffffff',
    color: '#0f172a',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  ctaGhost: {
    padding: '14px 22px',
    borderRadius: '10px',
    border: '1px solid #334155',
    background: 'transparent',
    color: '#cbd5e1',
    fontSize: '1rem',
    fontWeight: 600,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
  },
  heroCaption: { fontSize: '0.85rem', color: '#64748b' },

  // Demo card
  demoWrap: { position: 'relative' },
  demoCard: {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  },
  demoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '12px 16px',
    background: '#0b1222',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  dot: { width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' },
  demoLabel: {
    marginLeft: '8px',
    fontFamily: "'Fira Code', monospace",
    fontSize: '0.75rem',
    color: '#64748b',
  },
  demoBody: { padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  askRow: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  askLabel: {
    fontFamily: "'Fira Code', monospace",
    fontSize: '0.7rem',
    letterSpacing: '1px',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  askText: { margin: 0, color: '#e2e8f0', fontSize: '0.98rem', lineHeight: 1.5 },
  sqlBlock: {
    background: '#1e293b',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  sqlHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 14px',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#94a3b8',
    background: '#0f172a',
    borderBottom: '1px solid #334155',
  },
  langTag: {
    fontSize: '0.65rem',
    background: '#334155',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#94a3b8',
  },
  sqlCode: {
    margin: 0,
    padding: '14px',
    fontFamily: "'Fira Code', monospace",
    fontSize: '0.82rem',
    lineHeight: 1.6,
    color: '#a5d6ff',
    whiteSpace: 'pre-wrap',
  },
  chartBlock: { background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '1rem' },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    height: '90px',
  },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' },
  bar: {
    width: '100%',
    background: 'linear-gradient(to top, #3b82f6, #8b5cf6)',
    borderRadius: '3px 3px 0 0',
  },
  barLabel: { fontSize: '0.62rem', color: '#64748b', whiteSpace: 'nowrap' },
  insightBox: {
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.25)',
    borderRadius: '10px',
    padding: '0.9rem 1.1rem',
  },
  insightTag: {
    fontFamily: "'Fira Code', monospace",
    fontSize: '0.68rem',
    letterSpacing: '1px',
    color: '#93c5fd',
    fontWeight: 600,
  },
  insightText: { margin: '0.35rem 0 0', color: '#dbeafe', fontSize: '0.92rem', lineHeight: 1.5 },

  // Trust strip
  trustStrip: { background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  trustInner: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '1.4rem 2rem',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.2rem',
  },
  trustLabel: { fontFamily: "'Fira Code', monospace", fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.5px' },
  trustBadges: { display: 'flex', flexWrap: 'wrap', gap: '0.6rem' },
  trustBadge: {
    fontFamily: "'Fira Code', monospace",
    fontSize: '0.78rem',
    color: '#94a3b8',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '4px 10px',
  },

  // Light sections
  section: { background: '#ffffff', padding: 'clamp(3.5rem, 7vw, 6rem) 2rem' },
  sectionAlt: { background: '#f8fafc', padding: 'clamp(3.5rem, 7vw, 6rem) 2rem' },
  sectionInner: { maxWidth: '1180px', margin: '0 auto' },
  eyebrowDark: {
    fontFamily: "'Fira Code', monospace",
    fontSize: '0.78rem',
    letterSpacing: '2px',
    color: '#3b82f6',
    fontWeight: 600,
    marginBottom: '0.8rem',
  },
  h2: {
    fontSize: 'clamp(1.65rem, 3vw, 2.5rem)',
    fontWeight: 800,
    letterSpacing: '-1px',
    color: '#0f172a',
    margin: '0 0 2.8rem',
    maxWidth: '640px',
  },

  // Features
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.3rem' },
  featureCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1.6rem',
  },
  featureIcon: { fontSize: '1.5rem', marginBottom: '0.9rem' },
  featureTitle: { fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' },
  featureBody: { fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6, margin: 0 },

  // Steps
  stepsRow: { display: 'flex', gap: '2rem' },
  stepCol: { flex: 1, position: 'relative' },
  stepNum: {
    fontFamily: "'Fira Code', monospace",
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#3b82f6',
    marginBottom: '0.9rem',
  },
  stepTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.6rem' },
  stepBody: { fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6, margin: 0 },
  stepLine: {
    position: 'absolute',
    top: '8px',
    left: 'calc(100% + 1rem)',
    width: 'calc(2rem - 1rem)',
    height: '1px',
    background: '#cbd5e1',
  },

  // CTA band
  ctaBand: {
    background: '#0f172a',
    padding: 'clamp(3rem, 7vw, 5rem) 2rem',
    textAlign: 'center',
  },
  ctaH2: { fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', margin: '0 0 0.7rem' },
  ctaP: { color: '#94a3b8', fontSize: '1rem', marginBottom: '1.8rem' },

  // Footer
  footer: { background: '#020617', padding: '3rem 2rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' },
  footerInner: {
    maxWidth: '1180px',
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  footerTagline: { color: '#64748b', fontSize: '0.88rem', marginTop: '0.6rem' },
  footerLinks: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  footerLink: { color: '#94a3b8', fontSize: '0.88rem', textDecoration: 'none' },
  footerCredits: { color: '#64748b', fontSize: '0.85rem', textAlign: 'right' },
  footerCopy: { marginTop: '0.6rem', color: '#475569', fontSize: '0.8rem' },
};

export default Landing;
