import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BoltIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
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

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      setAuth(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch {}
    finally { setLoading(false) }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    toast.success(`Password reset link sent to ${forgotEmail}`, { duration: 4000 })
    setForgotMode(false)
  }

  const handleSocial = (provider) => {
    toast(`${provider} OAuth coming soon`, { icon: '🔧' })
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f5f7fa' }}>

      {/* ── Left decorative panel (hidden on mobile) ────── */}
      <div className="hidden lg:flex w-[44%] relative flex-col justify-between p-12 overflow-hidden"
           style={{ background: 'linear-gradient(145deg, #eef2ff, #f5f3ff)', borderRight: '1px solid #e2e8f0' }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(rgba(99,102,241,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow"
               style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <BoltIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">Dev<span className="text-indigo-600">Track</span></span>
        </div>

        {/* Center quote */}
        <div className="relative z-10">
          <p className="text-2xl font-semibold text-gray-800 leading-snug tracking-tight mb-5">
            "The most efficient teams use AI to write stories before writing code."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">A</div>
            <div>
              <p className="text-sm font-medium text-gray-800">Aryan Ghule</p>
              <p className="text-xs text-gray-500">Lead Engineer · DevTrack</p>
            </div>
          </div>
        </div>

        {/* Bottom feature pills */}
        <div className="relative flex flex-wrap gap-2">
          {['GPT-4o powered', 'Jira sync', 'GitHub analysis', 'RAG pipeline'].map(t => (
            <span key={t} className="text-xs px-3 py-1.5 rounded-full text-indigo-700"
                  style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right auth panel ────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Back to home */}
        <div className="absolute top-6 left-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition-colors group">
            <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Home
          </Link>
        </div>

        <div className="w-full max-w-[380px] animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <BoltIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-gray-900">Dev<span className="text-indigo-600">Track</span></span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1.5">
              {forgotMode ? 'Reset your password' : 'Welcome back'}
            </h1>
            <p className="text-sm text-gray-500">
              {forgotMode ? 'Enter your email and we\'ll send a reset link' : 'Sign in to your DevTrack account'}
            </p>
          </div>

          {/* Forgot password form */}
          {forgotMode ? (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-1.5">
                <label className="input-label">Email address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="input"
                  placeholder="you@company.com"
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-[0.9375rem] text-white transition-all hover:-translate-y-[1px] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.25)' }}>
                Send reset link
              </button>
              <button type="button" onClick={() => setForgotMode(false)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors mt-2">
                ← Back to sign in
              </button>
            </form>
          ) : (
          <>
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="input-label">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="you@company.com"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="input-label mb-0">Password</label>
                <button type="button" onClick={() => setForgotMode(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-[0.9375rem] text-white transition-all hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.12)' }}
            >
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
                  Signing in...</>
              ) : <><span>Sign in</span><ArrowRightIcon className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social login buttons */}
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
            No account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Create one free</Link>
          </p>

          {/* Demo creds */}
          <div className="mt-4 px-4 py-3 rounded-xl text-center bg-gray-50 border border-gray-200">
            <p className="text-[11px] text-gray-400 mb-1">Demo credentials</p>
            <p className="text-xs text-gray-500">
              <span className="text-gray-700 font-medium">admin@devtrack.app</span>
              {' '}·{' '}
              <span className="text-gray-700 font-medium">password123</span>
            </p>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
