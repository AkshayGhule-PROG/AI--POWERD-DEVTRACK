import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BoltIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path fill="#F25022" d="M1 1h10v10H1z"/>
    <path fill="#00A4EF" d="M13 1h10v10H13z"/>
    <path fill="#7FBA00" d="M1 13h10v10H1z"/>
    <path fill="#FFB900" d="M13 13h10v10H13z"/>
  </svg>
)

const roles = [
  { value: 'admin',        label: 'Admin',        desc: 'Full access, manage team & settings' },
  { value: 'scrum_master', label: 'Scrum Master',  desc: 'Manage sprints, generate stories' },
  { value: 'developer',   label: 'Developer',     desc: 'View & update assigned stories' },
]

export default function RegisterPage() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'developer' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      setAuth(data.user, data.token)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch {}
    finally { setLoading(false) }
  }

  const handleSocial = (provider) => {
    toast(`${provider} OAuth coming soon`, { icon: '🔧' })
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f5f7fa' }}>

      {/* ── Left decorative panel ────────────────────────── */}
      <div className="hidden lg:flex w-[44%] relative flex-col justify-between p-12 overflow-hidden"
           style={{ background: 'linear-gradient(145deg, #f5f3ff, #eef2ff)', borderRight: '1px solid #e2e8f0' }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(rgba(124,58,237,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow"
               style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <BoltIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">Dev<span className="text-indigo-600">Track</span></span>
        </div>

        {/* Highlights */}
        <div className="relative z-10 space-y-5">
          {[
            { title: 'AI-Powered Backlog', desc: 'Generate epics, stories and tasks from your SRS in seconds.' },
            { title: 'Jira & GitHub Ready', desc: 'Push your backlog to Jira and track code evidence automatically.' },
            { title: 'Real-time Updates',   desc: 'Live sprint boards and WebSocket-powered status changes.' },
          ].map(({ title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0"
                   style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative text-xs text-gray-400">Trusted by engineering teams worldwide</p>
      </div>

      {/* ── Right auth panel ────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-6 left-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition-colors group">
            <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Home
          </Link>
        </div>

        <div className="w-full max-w-[400px] animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <BoltIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-gray-900">Dev<span className="text-indigo-600">Track</span></span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1.5">Create your account</h1>
            <p className="text-sm text-gray-500">Free forever — no credit card required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="input-label">Full name</label>
              <input type="text" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input" placeholder="Aryan Ghule" required autoFocus />
            </div>

            <div className="space-y-1.5">
              <label className="input-label">Email address</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input" placeholder="you@company.com" required />
            </div>

            <div className="space-y-1.5">
              <label className="input-label">Password</label>
              <input type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="input" placeholder="Min 6 characters" minLength={6} required />
            </div>

            {/* Role selector */}
            <div className="space-y-1.5">
              <label className="input-label">Your role</label>
              <div className="grid grid-cols-1 gap-2">
                {roles.map(({ value, label, desc }) => (
                  <label key={value}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                    style={{
                    background: form.role === value ? '#eef2ff' : '#ffffff',
                      border: form.role === value ? '1px solid #a5b4fc' : '1px solid #e5e7eb',
                    }}>
                    <input type="radio" name="role" value={value} checked={form.role === value}
                      onChange={() => setForm({ ...form, role: value })} className="sr-only" />
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                         style={{ border: form.role === value ? '2px solid #6366f1' : '2px solid #d1d5db' }}>
                      {form.role === value && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-[11px] text-gray-500 truncate">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-[0.9375rem] text-white transition-all hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.12)' }}
            >
              {loading ? 'Creating account...' : <><span>Create account</span><ArrowRightIcon className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social signup buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => handleSocial('GitHub')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all hover:-translate-y-[1px] active:scale-[0.98] bg-white border border-gray-200">
              <GitHubIcon />
              <span className="hidden sm:inline">GitHub</span>
            </button>
            <button type="button" onClick={() => handleSocial('Google')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all hover:-translate-y-[1px] active:scale-[0.98] bg-white border border-gray-200">
              <GoogleIcon />
              <span className="hidden sm:inline">Google</span>
            </button>
            <button type="button" onClick={() => handleSocial('Microsoft')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all hover:-translate-y-[1px] active:scale-[0.98] bg-white border border-gray-200">
              <MicrosoftIcon />
              <span className="hidden sm:inline">Microsoft</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
