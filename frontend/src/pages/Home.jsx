import { Link } from 'react-router-dom'
import {
  SparklesIcon, RocketLaunchIcon, ChartBarIcon, CodeBracketIcon,
  DocumentTextIcon, UserGroupIcon, ArrowRightIcon, CheckIcon, BoltIcon,
} from '@heroicons/react/24/outline'

const nav = ['Features', 'How it works', 'Integrations']

const features = [
  { icon: SparklesIcon,    color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', title: 'AI Story Generation',     desc: 'Upload a requirements doc. GPT-4o drafts a full sprint backlog, epics, stories, tasks and ACs in under 30 seconds.' },
  { icon: DocumentTextIcon,color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', title: 'RAG-Powered Precision',    desc: 'Stories are grounded in your actual SRS via a ChromaDB vector store. Zero hallucinations. Every AC maps to a real requirement.' },
  { icon: CodeBracketIcon, color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', title: 'GitHub Code Analysis',     desc: "Connect a repo and AI cross-references commits against each story's acceptance criteria, marking code evidence automatically." },
  { icon: RocketLaunchIcon,color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', title: 'One-Click Jira Sync',      desc: 'Push your entire backlog, epics, stories, sub-tasks to Jira with all metadata, sprint assignments and AC intact.' },
  { icon: ChartBarIcon,    color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8', title: 'Live Burndown Charts',     desc: 'Real-time sprint tracking with velocity metrics, burndown visualization and WebSocket-powered progress updates.' },
  { icon: UserGroupIcon,   color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', title: 'Role-Based Collaboration', desc: 'Admin, Scrum Master and Developer roles with scoped permissions, member invites and a full audit log.' },
]

const steps = [
  { n: '1', title: 'Upload your SRS',        desc: 'Drop a PDF or DOCX requirements file into the project.' },
  { n: '2', title: 'AI reads your document', desc: 'The RAG pipeline embeds and indexes every requirement.' },
  { n: '3', title: 'Generate the backlog',   desc: 'Name a module. AI structures it into epics, stories and tasks.' },
  { n: '4', title: 'Review and push to Jira',desc: 'Approve, adjust story points, and sync to Jira in one click.' },
]

const stats = [
  { v: '10x',   l: 'faster backlog creation' },
  { v: '<30s',  l: 'AI generation time' },
  { v: '100%',  l: 'requirements traceability' },
  { v: '0',     l: 'context switching' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen text-gray-900 overflow-x-hidden bg-white">

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-[60px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <BoltIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-gray-900">
              Dev<span className="text-indigo-600">Track</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map(n => (
              <a key={n} href={`#${n.toLowerCase().replace(' ', '-')}`}
                 className="px-3.5 py-1.5 rounded-lg text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
                {n}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login"
                  className="px-4 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all">
              Sign in
            </Link>
            <Link to="/register"
                  className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold text-white rounded-lg transition-all"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              Get started <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-16 px-5 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="max-w-3xl mx-auto relative">
          <div className="inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200">
            <SparklesIcon className="w-3.5 h-3.5" />
            GPT-4o &middot; LangChain &middot; ChromaDB &middot; Socket.io
          </div>

          <h1 className="text-[3rem] sm:text-[3.75rem] lg:text-[4.5rem] font-extrabold leading-[1.08] tracking-[-0.03em] mb-6 text-gray-900">
            Ship faster<br />
            <span style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              with AI-powered
            </span>
            <br />project management
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your requirements document. DevTrack generates a complete sprint backlog —
            epics, stories, tasks and acceptance criteria — then syncs it straight to Jira.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/register"
                  className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white transition-all hover:-translate-y-[2px]"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
              Start for free
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/login"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all hover:-translate-y-[2px] shadow-sm">
              Sign in to dashboard
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-5 mt-10">
            {['No credit card required', 'Jira and GitHub ready', 'Real-time WebSocket', 'Role-based access'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-gray-500">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />{t}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-16 max-w-5xl mx-auto relative">
          <div className="absolute bottom-0 inset-x-0 h-28 pointer-events-none z-10"
               style={{ background: 'linear-gradient(to bottom, transparent, #ffffff)' }} />
          <div className="rounded-2xl overflow-hidden"
               style={{ border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
              <div className="flex gap-[6px]">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 h-6 rounded-md flex items-center px-3 bg-white border border-gray-200">
                <span className="text-xs text-gray-400">app.devtrack.ai / projects</span>
              </div>
            </div>
            <div className="flex bg-gray-50" style={{ minHeight: '320px' }}>
              <div className="w-48 shrink-0 flex flex-col gap-0.5 p-3 bg-white border-r border-gray-100">
                <div className="flex items-center gap-2 px-2 py-2 mb-2">
                  <div className="w-5 h-5 rounded" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }} />
                  <span className="text-[11px] font-bold text-gray-800">DevTrack</span>
                </div>
                {[{ l: 'Dashboard', a: false }, { l: 'Projects', a: true }, { l: 'Stories', a: false }, { l: 'Sprints', a: false }, { l: 'Documents', a: false }].map(({ l, a }) => (
                  <div key={l} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs"
                       style={{ background: a ? '#eef2ff' : 'transparent', color: a ? '#4338ca' : '#64748b', fontWeight: a ? 600 : 400 }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: a ? '#6366f1' : '#cbd5e1' }} />
                    {l}
                  </div>
                ))}
              </div>
              <div className="flex-1 p-5 space-y-3 overflow-hidden">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Total Stories', val: '48', col: '#4f46e5' },
                    { label: 'Completed',     val: '31', col: '#059669' },
                    { label: 'In Progress',   val: '12', col: '#0ea5e9' },
                    { label: 'Epics',         val: '6',  col: '#7c3aed' },
                  ].map(({ label, val, col }) => (
                    <div key={label} className="rounded-xl p-3 bg-white border border-gray-100">
                      <p className="text-xl font-bold" style={{ color: col }}>{val}</p>
                      <p className="text-[10px] mt-0.5 text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl overflow-hidden bg-white border border-gray-100">
                  {[
                    { epic: 'Auth',      title: 'User can login with email and password', pts: 3, col: '#059669' },
                    { epic: 'Auth',      title: 'Implement JWT refresh token rotation',   pts: 5, col: '#0ea5e9' },
                    { epic: 'Dashboard', title: 'Display project completion analytics',   pts: 8, col: '#94a3b8' },
                    { epic: 'Dashboard', title: 'AI generate burndown projections',       pts: 5, col: '#cbd5e1' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5"
                         style={{ borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.col }} />
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">{s.epic}</span>
                      <span className="text-[11px] flex-1 truncate text-gray-700">{s.title}</span>
                      <span className="text-[10px] shrink-0 text-gray-300">{s.pts}p</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                  <SparklesIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-[11px] text-indigo-700">
                    AI generated <strong>14 stories</strong> from <em>requirements_v2.pdf</em> in 24s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="integrations" className="py-14 px-5 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {stats.map(({ v, l }) => (
            <div key={l}>
              <p className="text-4xl font-extrabold tracking-tight mb-1 text-indigo-600">{v}</p>
              <p className="text-sm text-gray-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-600 mb-3">Features</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Everything in one place</h2>
            <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
              From AI-powered story generation to code evidence tracking — DevTrack handles your entire agile workflow.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, color, bg, border, title, desc }) => (
              <div key={title}
                   className="group rounded-2xl p-6 bg-white border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                     style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-semibold text-gray-900 text-[0.9375rem] mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-5 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3">How it works</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Document to backlog in 4 steps</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="absolute hidden lg:block top-7 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px"
                 style={{ background: 'linear-gradient(to right, #c7d2fe, #ddd6fe, #c7d2fe)' }} />
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 relative z-10 bg-white border-2 border-indigo-200 shadow-sm">
                  <span className="text-xl font-extrabold text-indigo-600">{n}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-[0.9375rem] mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative rounded-3xl p-14 overflow-hidden border border-indigo-100"
               style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 50%, #f0f9ff 100%)' }}>
            <div className="absolute inset-0 pointer-events-none"
                 style={{ backgroundImage: 'radial-gradient(rgba(99,102,241,0.06) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                   style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
                <RocketLaunchIcon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Ready to ship faster?</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Create your account and have your first AI-generated backlog in under a minute. No credit card needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register"
                      className="group flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white transition-all hover:-translate-y-[2px]"
                      style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
                  Create free account
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/login"
                      className="flex items-center justify-center px-7 py-3.5 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-8 border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <BoltIcon className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Dev<span className="text-indigo-600">Track</span></span>
          </div>
          <p className="text-xs text-gray-400">2026 DevTrack &middot; AI-Powered Project Management</p>
          <div className="flex gap-5 text-xs text-gray-500">
            <Link to="/login"    className="hover:text-gray-900 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-gray-900 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}