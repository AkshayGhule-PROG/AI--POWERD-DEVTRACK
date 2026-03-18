import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon, RocketLaunchIcon, ChartBarIcon, CodeBracketIcon,
  UserGroupIcon, ArrowRightIcon, CheckIcon, BoltIcon,
  BeakerIcon, CloudArrowUpIcon, SunIcon, MoonIcon,
} from '@heroicons/react/24/outline'
import { useThemeStore } from '@/store/themeStore'

gsap.registerPlugin(ScrollTrigger)

/* ── Neural-network canvas background ─────────────────────────── */
function NeuralCanvas({ isLight }) {
  const canvasRef = useRef(null)
  const isLightRef = useRef(isLight)
  useEffect(() => { isLightRef.current = isLight }, [isLight])
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W, H, nodes, raf
    const mouse = { x: -999, y: -999 }
    const init = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      nodes = Array.from({ length: Math.min(Math.floor(W / 13), 90) }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6,
        hue: [Math.random() > 0.6 ? [99, 102, 241] : Math.random() > 0.5 ? [139, 92, 246] : [59, 130, 246]][0],
        a: Math.random() * 0.45 + 0.1,
      }))
    }
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const lm = isLightRef.current ? 4 : 1
      nodes.forEach((n, i) => {
        const mdx = n.x - mouse.x, mdy = n.y - mouse.y
        const md = Math.sqrt(mdx * mdx + mdy * mdy)
        if (md < 130) { n.vx += mdx / md * 0.025; n.vy += mdy / md * 0.025 }
        const sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
        if (sp > 1.1) { n.vx *= 0.92; n.vy *= 0.92 }
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
        // Connections
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j]
          const ex = n.x - m.x, ey = n.y - m.y
          const d = ex * ex + ey * ey
          if (d < 20000) {
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y)
            ctx.strokeStyle = `rgba(${n.hue[0]},${n.hue[1]},${n.hue[2]},${(1 - d / 20000) * 0.22 * lm})`
            ctx.lineWidth = isLightRef.current ? 1 : 0.65; ctx.stroke()
          }
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (isLightRef.current ? 1.4 : 1), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${n.hue[0]},${n.hue[1]},${n.hue[2]},${Math.min(n.a * lm, 0.9)})`; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
    init(); draw()
    window.addEventListener('resize', init)
    window.addEventListener('mousemove', onMouse)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', init); window.removeEventListener('mousemove', onMouse) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: isLight ? 0.9 : 0.5 }} />
}

/* ── Magnetic button ────────────────────────────────────────────── */
function MagBtn({ to, children, style, ...rest }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.35, ease: 'power2.out' })
  }
  const onLeave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1,0.5)' })
  return <Link ref={ref} to={to} style={style} onMouseMove={onMove} onMouseLeave={onLeave} {...rest}>{children}</Link>
}

/* ── Theme toggle (home navbar) ───────────────────────────────── */
function HomeThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: '32px', height: '32px', borderRadius: '9px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-card)', border: '1px solid var(--border-card)',
        color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme}
          initial={{ rotate: -45, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 45, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {theme === 'dark'
            ? <SunIcon style={{ width: '14px', height: '14px' }} />
            : <MoonIcon style={{ width: '14px', height: '14px' }} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

/* ── Animated count-up ──────────────────────────────────────────── */
function CountUp({ target, suffix = '', prefix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const num = parseFloat(target)
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.disconnect()
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / 1600, 1)
        const e = 1 - Math.pow(1 - p, 3)
        setVal(Number.isInteger(num) ? Math.round(num * e) : (num * e).toFixed(1))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{prefix}{val}{suffix}</span>
}

/* ── Glitch headline span ───────────────────────────────────────── */
function Glitch({ children }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const id = setInterval(() => { setOn(true); setTimeout(() => setOn(false), 180) }, 4500)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{ position: 'relative', display: 'inline-block' }} className={on ? 'glitch' : ''} data-text={children}>
      {children}
    </span>
  )
}

/* ── 3D-tilt card ───────────────────────────────────────────────── */
function TiltCard({ children, style, glow = 'rgba(99,102,241,0.3)' }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2
    gsap.to(ref.current, { rotationY: x * 0.018, rotationX: -y * 0.018, transformPerspective: 900, duration: 0.35, ease: 'power2.out' })
    const sh = ref.current.querySelector('[data-shine]')
    if (sh) { sh.style.opacity = '1' }
  }
  const onLeave = () => {
    gsap.to(ref.current, { rotationY: 0, rotationX: 0, duration: 0.65, ease: 'elastic.out(1,0.5)' })
    const sh = ref.current.querySelector('[data-shine]')
    if (sh) { sh.style.opacity = '0' }
  }
  return (
    <div ref={ref} style={{ ...style, transformStyle: 'preserve-3d', position: 'relative' }} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div data-shine="1" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', background: `radial-gradient(circle at 50% 50%, ${glow} 0%, transparent 65%)`, opacity: 0, pointerEvents: 'none', transition: 'opacity 0.3s', zIndex: 1 }} />
      {children}
    </div>
  )
}

/* ── Animated terminal ──────────────────────────────────────────── */
function Terminal() {
  const lines = [
    { d: 0, t: '$ devtrack generate --module "Authentication"', c: '#818cf8' },
    { d: 500, t: '  → Indexing requirements_v2.pdf...', c: '#475569' },
    { d: 1050, t: '  → Embedding 47 requirements…', c: '#475569' },
    { d: 1650, t: '  → GPT-4o generating stories...', c: '#475569' },
    { d: 2200, t: '  ✓ Epic: User Auth  (3 stories)', c: '#10b981' },
    { d: 2700, t: '  ✓ Epic: OAuth Flows  (2 stories)', c: '#10b981' },
    { d: 3150, t: '  ✓ Epic: Security  (2 stories)', c: '#10b981' },
    { d: 3700, t: '  → Pushing to Jira...', c: '#475569' },
    { d: 4400, t: '  ✓ 14 stories synced in 3.8s  🚀', c: '#a78bfa' },
  ]
  const [count, setCount] = useState(0)
  useEffect(() => {
    const ids = lines.map((l, i) => setTimeout(() => setCount(i + 1), l.d))
    const reset = setTimeout(() => setCount(0), 6000)
    return () => { ids.forEach(clearTimeout); clearTimeout(reset) }
  }, [count === 0 && count])

  useEffect(() => {
    if (count > 0) return
    const ids = lines.map((l, i) => setTimeout(() => setCount(i + 1), l.d + 200))
    return () => ids.forEach(clearTimeout)
  }, [count])

  return (
    <div style={{ background: '#04040d', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '14px', overflow: 'hidden', fontFamily: '"Fira Code", "JetBrains Mono", monospace', fontSize: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.8 }} />)}
        <span style={{ marginLeft: '8px', color: '#475569', fontSize: '11px' }}>devtrack — zsh</span>
      </div>
      <div style={{ padding: '16px 18px', minHeight: '200px', lineHeight: '1.9' }}>
        {lines.slice(0, count).map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }} style={{ color: l.c }}>{l.t}</motion.div>
        ))}
        {count < lines.length && <span style={{ color: '#6366f1' }} className="cursor-blink">▊</span>}
      </div>
    </div>
  )
}

/* ── Tech ticker ────────────────────────────────────────────────── */
const TECH = [
  { l: 'React 18', c: '#61dafb' }, { l: 'FastAPI', c: '#009688' }, { l: 'GPT-4o', c: '#10a37f' },
  { l: 'LangChain', c: '#818cf8' }, { l: 'ChromaDB', c: '#f59e0b' }, { l: 'Three.js', c: '#ffffff' },
  { l: 'Framer Motion', c: '#ff4e8c' }, { l: 'GSAP', c: '#88ce02' }, { l: 'Lenis', c: '#a78bfa' },
  { l: 'Socket.io', c: '#94a3b8' }, { l: 'MongoDB', c: '#00ed64' }, { l: 'Vite 5', c: '#c084fc' },
]

/* ── Data ────────────────────────────────────────────────────────── */
const FEATS = [
  { Icon: SparklesIcon, grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', glow: 'rgba(99,102,241,0.35)', border: 'rgba(99,102,241,0.22)', title: 'AI Story Generation', tag: 'GPT-4o', desc: 'GPT-4o drafts a complete sprint backlog — epics, stories, tasks and ACs — directly from your requirements document in under 30 s.' },
  { Icon: BeakerIcon, grad: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', glow: 'rgba(14,165,233,0.3)', border: 'rgba(14,165,233,0.2)', title: 'RAG-Powered Precision', tag: 'ChromaDB + LangChain', desc: 'Every story is grounded in your actual SRS via a ChromaDB vector store. Zero hallucinations — each AC maps to a real requirement.' },
  { Icon: CodeBracketIcon, grad: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.3)', border: 'rgba(16,185,129,0.2)', title: 'GitHub Code Analysis', tag: 'GitHub API', desc: "Connect your repo — AI cross-references every commit against each story's acceptance criteria and marks code evidence automatically." },
  { Icon: RocketLaunchIcon, grad: 'linear-gradient(135deg,#f97316,#ef4444)', glow: 'rgba(249,115,22,0.3)', border: 'rgba(249,115,22,0.2)', title: 'One-Click Jira Sync', tag: 'Jira REST API', desc: 'Push your entire backlog — epics, stories, sub-tasks — to Jira with all metadata, story points and acceptance criteria intact.' },
  { Icon: ChartBarIcon, grad: 'linear-gradient(135deg,#ec4899,#e11d48)', glow: 'rgba(236,72,153,0.3)', border: 'rgba(236,72,153,0.2)', title: 'Live Burndown Charts', tag: 'Socket.io', desc: 'Real-time sprint tracking with velocity metrics, burndown visualization and WebSocket-powered progress updates without page refresh.' },
  { Icon: UserGroupIcon, grad: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', glow: 'rgba(139,92,246,0.3)', border: 'rgba(139,92,246,0.2)', title: 'Role-Based Collaboration', tag: 'JWT + RBAC', desc: 'Admin, Scrum Master and Developer roles with scoped permissions, member invites, audit log and OAuth via GitHub or Google.' },
]
const STEPS = [
  { n: '01', Icon: CloudArrowUpIcon, title: 'Upload SRS', desc: 'Drop a PDF, DOCX or Markdown requirements file into the project documents panel.', col: '#6366f1' },
  { n: '02', Icon: BeakerIcon, title: 'AI indexes it', desc: 'RAG pipeline embeds every requirement into ChromaDB using OpenAI embeddings.', col: '#0ea5e9' },
  { n: '03', Icon: SparklesIcon, title: 'Generate backlog', desc: 'GPT-4o structures module into epics, stories, tasks and ACs in under 30 s.', col: '#10b981' },
  { n: '04', Icon: RocketLaunchIcon, title: 'Push to Jira', desc: 'One click syncs your full backlog with story points and sprints to your Jira board.', col: '#f59e0b' },
]

/* ── Page ────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { theme } = useThemeStore()
  const rootRef = useRef(null)
  const headRef = useRef(null), subRef = useRef(null), ctaRef = useRef(null), mockRef = useRef(null)
  const orb1 = useRef(null), orb2 = useRef(null), orb3 = useRef(null)
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -55])
  const heroO = useTransform(scrollYProgress, [0, 0.22], [1, 0])

  /* Lenis smooth scroll */
  useEffect(() => {
    let lenis
    ;(async () => {
      try {
        const { default: Lenis } = await import('lenis')
        lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
        const tick = (t) => { lenis.raf(t); requestAnimationFrame(tick) }
        requestAnimationFrame(tick)
        lenis.on('scroll', ScrollTrigger.update)
      } catch (e) { /* fallback */ }
    })()
    return () => lenis?.destroy()
  }, [])

  /* GSAP timeline */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo('.hero-badge', { opacity: 0, y: 20, scale: 0.88 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 })
        .fromTo(headRef.current, { opacity: 0, y: 55, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1 }, '-=0.4')
        .fromTo(subRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.75 }, '-=0.6')
        .fromTo(ctaRef.current, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.45')
        .fromTo(mockRef.current, { opacity: 0, y: 80, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: 'power2.out' }, '-=0.4')
      gsap.to(orb1.current, { y: -45, x: 22, duration: 7.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(orb2.current, { y: 35, x: -28, duration: 9.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.5 })
      gsap.to(orb3.current, { y: -28, x: 18, duration: 6.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 3 })
      gsap.fromTo('.stat-card', { opacity: 0, y: 55, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.12, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.stats-row', start: 'top 82%' } })
      if (document.querySelector('.feats-grid')) {
        gsap.fromTo('.feat-card', { opacity: 0, y: 65, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.feats-grid', start: 'top 80%' } })
      }
      if (document.querySelector('.steps-grid')) {
        gsap.fromTo('.step-item', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.75, stagger: 0.15, ease: 'power2.out', scrollTrigger: { trigger: '.steps-grid', start: 'top 80%' } })
      }
      gsap.utils.toArray('.sec-head').forEach(el => gsap.fromTo(el, { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }))
      gsap.fromTo('.cta-box', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.95, ease: 'power2.out', scrollTrigger: { trigger: '.cta-box', start: 'top 84%' } })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef} style={{ background: 'var(--bg-page)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <NeuralCanvas isLight={theme === 'light'} />

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-header)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 22px rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => gsap.to(e.currentTarget, { rotation: -10, scale: 1.12, duration: 0.25 })}
              onMouseLeave={e => gsap.to(e.currentTarget, { rotation: 0, scale: 1, duration: 0.4, ease: 'elastic.out(1,0.5)' })}>
              <BoltIcon style={{ width: '15px', height: '15px', color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Dev<span style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Track</span>
            </span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
            {['Features', 'How it works'].map(n => (
              <a key={n} href={`#${n.toLowerCase().replace(/ /g, '-')}`} style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' }}>{n}</a>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HomeThemeToggle />
            <Link to="/login" style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' }}>Sign in</Link>
            <MagBtn to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 26px rgba(99,102,241,0.45)', textDecoration: 'none' }}>
              Get started <ArrowRightIcon style={{ width: '13px', height: '13px' }} />
            </MagBtn>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 60px', overflow: 'hidden', zIndex: 1 }}>
        {/* Mesh gradients */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 65% at 50% -5%,rgba(99,102,241,0.22) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 40% at 80% 65%,rgba(139,92,246,0.13) 0%,transparent 55%)', pointerEvents: 'none' }} />
        {/* Dot grid */}
        <div className="hero-dot-grid" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
        {/* Orbs */}
        <div ref={orb1} style={{ position: 'absolute', width: '520px', height: '520px', top: '-130px', left: '-160px', background: 'radial-gradient(circle,rgba(99,102,241,0.16) 0%,transparent 70%)', filter: 'blur(65px)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div ref={orb2} style={{ position: 'absolute', width: '620px', height: '620px', bottom: '-160px', right: '-190px', background: 'radial-gradient(circle,rgba(139,92,246,0.14) 0%,transparent 70%)', filter: 'blur(75px)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div ref={orb3} style={{ position: 'absolute', width: '360px', height: '360px', top: '35%', left: '60%', background: 'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)', filter: 'blur(55px)', borderRadius: '50%', pointerEvents: 'none' }} />

        <motion.div style={{ opacity: heroO, y: heroY, position: 'relative', zIndex: 10, width: '100%', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          {/* Badge */}
          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '8px 20px', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.28)', color: '#a5b4fc', fontSize: '12px', fontWeight: 600, backdropFilter: 'blur(14px)' }}>
            <span style={{ display: 'flex', position: 'relative', width: '8px', height: '8px', flexShrink: 0 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#818cf8', opacity: 0.65, animation: 'ping 1.5s ease-out infinite' }} />
              <span style={{ position: 'relative', width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', display: 'block' }} />
            </span>
            GPT-4o · LangChain · ChromaDB · React 18 · Socket.io
            <span style={{ padding: '1px 7px', borderRadius: '5px', background: 'rgba(99,102,241,0.22)', border: '1px solid rgba(99,102,241,0.4)', fontSize: '10px', fontWeight: 700 }}>v2.0</span>
          </div>

          {/* Headline */}
          <h1 ref={headRef} style={{ fontSize: 'clamp(2.9rem,6.5vw,5.8rem)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.045em', marginBottom: '28px', color: 'var(--text-primary)' }}>
            Ship faster<br />
            with AI-powered<br />
            <span style={{ background: 'linear-gradient(135deg,#818cf8 0%,#a78bfa 40%,#c084fc 75%,#f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              <Glitch>project management</Glitch>
            </span>
          </h1>

          <p ref={subRef} style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 40px', lineHeight: 1.78 }}>
            Upload your requirements doc. DevTrack generates a complete sprint backlog —
            epics, stories, tasks and ACs — then syncs it straight to Jira in seconds.
          </p>

          <div ref={ctaRef} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
            <MagBtn to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 34px', borderRadius: '14px', fontWeight: 700, fontSize: '15px', color: '#fff', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 6px 38px rgba(99,102,241,0.55),0 0 0 1px rgba(99,102,241,0.35)', textDecoration: 'none' }}>
              Start for free <ArrowRightIcon style={{ width: '16px', height: '16px' }} />
            </MagBtn>
            <MagBtn to="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 34px', borderRadius: '14px', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border-card)', backdropFilter: 'blur(12px)', textDecoration: 'none' }}>
              View dashboard
            </MagBtn>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '22px', marginBottom: '72px' }}>
            {['No credit card required', 'Jira & GitHub ready', 'Real-time WebSocket', 'RBAC'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <CheckIcon style={{ width: '14px', height: '14px', color: '#10b981' }} />{t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Split mockup */}
        <div ref={mockRef} style={{ maxWidth: '1100px', width: '100%', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(99,102,241,0.05)', filter: 'blur(70px)', borderRadius: '24px', transform: 'scale(0.92)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '16px', position: 'relative' }}>
            {/* Dashboard panel */}
            <div style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.65)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: 'rgba(10,10,22,0.98)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '5px' }}>{['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.8 }} />)}</div>
                <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '8px' }}>devtrack.ai / stories</span>
              </div>
              <div style={{ background: '#0d0d1a', display: 'flex', minHeight: '280px' }}>
                <div style={{ width: '44px', background: '#070710', borderRight: '1px solid rgba(255,255,255,0.04)', padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  {[true, false, false, false, false].map((a, i) => <div key={i} style={{ width: '26px', height: '26px', borderRadius: '7px', background: a ? 'rgba(99,102,241,0.22)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: a ? '#6366f1' : '#2d3748' }} /></div>)}
                </div>
                <div style={{ flex: 1, padding: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '12px' }}>
                    {[{ v: '48', l: 'Stories', c: '#818cf8' }, { v: '31', l: 'Done', c: '#10b981' }, { v: '6', l: 'Epics', c: '#a78bfa' }, { v: '12', l: 'Active', c: '#38bdf8' }].map(s => (
                      <div key={s.l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '7px 9px' }}>
                        <div style={{ fontSize: '17px', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</div>
                        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '3px' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' }}>
                    {[{ e: 'Auth', t: 'Login with email & password', p: 3, c: '#10b981' }, { e: 'Auth', t: 'JWT refresh token rotation', p: 5, c: '#38bdf8' }, { e: 'AI', t: 'AI generate burndown charts', p: 8, c: '#a78bfa' }, { e: 'Dash', t: 'Display project analytics', p: 5, c: '#f59e0b' }].map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 10px', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.03)' : 'none', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.c, flexShrink: 0 }} />
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>{s.e}</span>
                        <span style={{ fontSize: '10px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#94a3b8' }}>{s.t}</span>
                        <span style={{ fontSize: '9px', color: '#64748b', flexShrink: 0 }}>{s.p}p</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <SparklesIcon style={{ width: '12px', height: '12px', color: '#818cf8', flexShrink: 0 }} />
                    <span style={{ fontSize: '10px', color: '#a5b4fc' }}>AI generated <strong>14 stories</strong> from req_v2.pdf in <strong>24 s</strong></span>
                  </div>
                </div>
              </div>
            </div>
            {/* Terminal panel */}
            <Terminal />
          </div>
        </div>
      </section>

      {/* ── Tech ticker ──────────────────────────────────────────── */}
      <div style={{ padding: '28px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div style={{ maskImage: 'linear-gradient(to right,transparent,black 10%,black 90%,transparent)', WebkitMaskImage: 'linear-gradient(to right,transparent,black 10%,black 90%,transparent)' }}>
          <div style={{ display: 'flex', gap: '10px', animation: 'ticker 30s linear infinite', width: 'max-content' }}>
            {[...TECH, ...TECH].map((b, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '999px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', fontSize: '12px', fontWeight: 600, color: b.c, whiteSpace: 'nowrap', backdropFilter: 'blur(8px)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: b.c, display: 'block', boxShadow: `0 0 7px ${b.c}` }} />{b.l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.007) 3px,rgba(255,255,255,0.007) 4px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="sec-head" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#818cf8', marginBottom: '12px' }}>By the numbers</p>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>Results that speak</h2>
          </div>
          <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '20px' }}>
            {[{ v: 10, s: '×', l: 'faster backlog creation', sub: 'vs manual sprint planning' }, { v: 30, p: '<', s: 's', l: 'AI generation time', sub: 'per module / SRS section' }, { v: 100, s: '%', l: 'requirements traceability', sub: 'every AC sourced from doc' }, { v: 0, s: '', l: 'context switching', sub: 'stories → code → Jira' }].map(({ v, s, p, l, sub }) => (
              <div key={l} className="stat-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '20px', padding: '32px', textAlign: 'center', transition: 'all 0.3s', cursor: 'default', boxShadow: 'var(--shadow-card)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.22)'; e.currentTarget.style.transform = 'translateY(-5px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <p style={{ fontSize: 'clamp(2.5rem,5vw,3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', background: 'linear-gradient(135deg,#818cf8,#a78bfa,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>
                  <CountUp target={v} prefix={p || ''} suffix={s} />
                </p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{l}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 20px', background: 'var(--bg-card)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="sec-head" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#818cf8', marginBottom: '12px' }}>Features</p>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '14px' }}>Everything in one place</h2>
            <p style={{ maxWidth: '480px', margin: '0 auto', color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '15px' }}>From AI story generation to GitHub code analysis — DevTrack handles your entire agile workflow.</p>
          </div>
          <div className="feats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '20px' }}>
            {FEATS.map(({ Icon, grad, glow, border, title, tag, desc }) => (
              <TiltCard key={title} glow={glow} style={{ borderRadius: '20px', padding: '28px', background: 'var(--bg-card)', border: `1px solid ${border}`, backdropFilter: 'blur(12px)', overflow: 'hidden', cursor: 'default', boxShadow: 'var(--shadow-card)' }}
                className="feat-card">
                {/* Corner glow */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '160px', height: '160px', background: `radial-gradient(circle,${glow} 0%,transparent 70%)`, filter: 'blur(30px)', opacity: 0.25, pointerEvents: 'none', zIndex: 0 }} />
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px', background: grad, boxShadow: `0 6px 26px ${glow}`, position: 'relative', zIndex: 2 }}>
                  <Icon style={{ width: '22px', height: '22px', color: '#fff' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
                  <h3 style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>{title}</h3>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', whiteSpace: 'nowrap', flexShrink: 0 }}>{tag}</span>
                </div>
                <p style={{ fontSize: '13px', lineHeight: 1.72, color: 'var(--text-muted)', position: 'relative', zIndex: 2 }}>{desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.025) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
          <div className="sec-head" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#10b981', marginBottom: '12px' }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>Document to backlog in 4 steps</h2>
          </div>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '36px', left: '12.5%', right: '12.5%', height: '2px', background: 'linear-gradient(90deg,rgba(99,102,241,0.5),rgba(14,165,233,0.5),rgba(16,185,129,0.5),rgba(245,158,11,0.5))', pointerEvents: 'none' }} className="hidden lg:block" />
            {STEPS.map(({ n, Icon, title, desc, col }) => (
              <motion.div key={n} className="step-item" style={{ textAlign: 'center' }} whileHover={{ y: -10 }} transition={{ type: 'spring', stiffness: 280, damping: 16 }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', background: 'var(--bg-card)', border: `2px solid ${col}45`, boxShadow: `0 0 0 8px ${col}12,0 8px 30px ${col}22`, position: 'relative' }}>
                  <Icon style={{ width: '28px', height: '28px', color: col }} />
                  <span style={{ position: 'absolute', top: '-10px', right: '-10px', width: '22px', height: '22px', borderRadius: '50%', background: col, color: '#06060f', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.slice(-1)}</span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="cta-box" style={{ position: 'relative', borderRadius: '28px', padding: '72px 48px', textAlign: 'center', overflow: 'hidden', background: 'linear-gradient(135deg,rgba(99,102,241,0.14) 0%,rgba(139,92,246,0.09) 50%,rgba(59,130,246,0.07) 100%)', border: '1px solid rgba(99,102,241,0.25)', backdropFilter: 'blur(24px)' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(99,102,241,0.07) 1px,transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none', borderRadius: '28px' }} />
            <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.38) 0%,transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.38) 0%,transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.06, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '62px', height: '62px', borderRadius: '18px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 6px 36px rgba(99,102,241,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <RocketLaunchIcon style={{ width: '28px', height: '28px', color: '#fff' }} />
              </motion.div>
              <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '14px' }}>Ready to ship faster?</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.72, marginBottom: '36px', fontSize: '15px' }}>Create your account and have your first AI-generated backlog in under a minute. No credit card needed.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                <MagBtn to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 34px', borderRadius: '14px', fontWeight: 700, fontSize: '15px', color: '#fff', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 6px 36px rgba(99,102,241,0.55)', textDecoration: 'none' }}>
                  Create free account <ArrowRightIcon style={{ width: '16px', height: '16px' }} />
                </MagBtn>
                <MagBtn to="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 34px', borderRadius: '14px', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border-card)', backdropFilter: 'blur(12px)', textDecoration: 'none' }}>
                  Sign in
                </MagBtn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer style={{ padding: '32px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BoltIcon style={{ width: '12px', height: '12px', color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>Dev<span style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Track</span></span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>© 2026 DevTrack · AI-Powered Project Management</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[['Sign In', '/login'], ['Register', '/register']].map(([l, h]) => (
              <Link key={l} to={h} style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
