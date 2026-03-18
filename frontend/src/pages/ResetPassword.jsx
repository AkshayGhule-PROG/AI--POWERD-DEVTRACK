import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { BoltIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await api.put(`/auth/reset-password/${token}`, { password: form.password })
      setDone(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f5f7fa' }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-[44%] relative flex-col justify-between p-12 overflow-hidden"
           style={{ background: 'linear-gradient(145deg,#eef2ff,#f5f3ff)', borderRight: '1px solid #e2e8f0' }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(rgba(99,102,241,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <BoltIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">Dev<span className="text-indigo-600">Track</span></span>
        </div>
        <div className="relative z-10">
          <p className="text-2xl font-semibold text-gray-800 leading-snug mb-5">
            "Security first — your account is in safe hands."
          </p>
        </div>
        <div className="relative flex flex-wrap gap-2">
          {['GPT-4o powered', 'Jira sync', 'GitHub analysis', 'RAG pipeline'].map((t) => (
            <span key={t} className="text-xs px-3 py-1.5 rounded-full text-indigo-700"
                  style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-6 left-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition-colors group">
            <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to sign in
          </Link>
        </div>

        <div className="w-full max-w-[380px] animate-fade-in">
          {done ? (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircleIcon className="w-9 h-9 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Password updated!</h1>
              <p className="text-gray-500 text-sm mb-6">
                Your password has been reset successfully. Redirecting you to sign in…
              </p>
              <Link to="/login"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-lg font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1.5">Set new password</h1>
                <p className="text-sm text-gray-500">Choose a strong password for your DevTrack account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all pr-10"
                      placeholder="••••••••"
                      required
                      autoFocus
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                      {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  {form.confirm && form.password !== form.confirm && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400" />
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    </div>
                  )}
                </div>

                {/* Strength hints */}
                {form.password && (
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{
                          background: form.password.length > i * 3
                            ? i < 2 ? '#f59e0b' : '#10b981'
                            : '#e5e7eb',
                        }}
                      />
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (form.confirm && form.password !== form.confirm)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-[0.9375rem] text-white transition-all hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.25)' }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                      </svg>
                      Updating…
                    </>
                  ) : 'Set New Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
