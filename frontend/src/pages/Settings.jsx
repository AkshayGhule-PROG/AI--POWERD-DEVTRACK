import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  UserCircleIcon, KeyIcon, CodeBracketIcon, LinkIcon,
  CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const Section = ({ icon: Icon, title, description, children }) => (
  <div className="card p-6">
    <div className="flex items-start gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg bg-primary-900/40 border border-primary-800/40 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary-400" />
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    {children}
  </div>
)

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
  </div>
)

const SecretInput = ({ value, onChange, placeholder, name }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        name={name}
        placeholder={placeholder}
        className="input pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
      >
        {show ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()

  // Profile form
  const [profile, setProfile] = useState({ name: user?.name || '' })

  // Jira form
  const [jira, setJira] = useState({
    jiraEmail: user?.jiraEmail || '',
    jiraDomain: user?.jiraDomain || '',
    jiraApiToken: '',
  })

  // GitHub form
  const [github, setGithub] = useState({
    githubToken: '',
    githubUsername: user?.githubUsername || '',
  })

  // Jira test result
  const [jiraTestStatus, setJiraTestStatus] = useState(null)

  const profileMutation = useMutation({
    mutationFn: (body) => api.put('/auth/profile', body),
    onSuccess: ({ data }) => {
      updateUser(data.data)
      toast.success('Profile updated!')
    },
  })

  const integrationsMutation = useMutation({
    mutationFn: (body) => api.put('/auth/integrations', body),
    onSuccess: ({ data }) => {
      updateUser(data.data)
      toast.success('Integrations saved!')
    },
  })

  const testJiraMutation = useMutation({
    mutationFn: () => api.get('/jira/test'),
    onSuccess: ({ data }) => {
      setJiraTestStatus('success')
      toast.success(`Jira connected as ${data.data?.displayName || 'unknown user'}`)
    },
    onError: () => {
      setJiraTestStatus('error')
      toast.error('Jira connection failed. Check credentials.')
    },
  })

  const handleSaveJira = (e) => {
    e.preventDefault()
    const payload = {
      jiraEmail: jira.jiraEmail,
      jiraDomain: jira.jiraDomain,
    }
    if (jira.jiraApiToken) payload.jiraApiToken = jira.jiraApiToken
    integrationsMutation.mutate(payload)
  }

  const handleSaveGitHub = (e) => {
    e.preventDefault()
    const payload = { githubUsername: github.githubUsername }
    if (github.githubToken) payload.githubToken = github.githubToken
    integrationsMutation.mutate(payload)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your profile and integrations</p>
      </div>

      {/* Profile */}
      <Section icon={UserCircleIcon} title="Profile" description="Update your display name and account details">
        <form
          onSubmit={(e) => { e.preventDefault(); profileMutation.mutate(profile) }}
          className="space-y-4"
        >
          <Field label="Full Name">
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="input"
              placeholder="Your name"
            />
          </Field>

          <Field label="Email Address" hint="Email cannot be changed">
            <input type="email" value={user?.email || ''} className="input opacity-50 cursor-not-allowed" disabled />
          </Field>

          <Field label="Role" hint="Role is assigned by your project admin">
            <input
              type="text"
              value={user?.role?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || ''}
              className="input opacity-50 cursor-not-allowed"
              disabled
            />
          </Field>

          <div className="flex justify-end">
            <button type="submit" disabled={profileMutation.isPending} className="btn-primary">
              {profileMutation.isPending ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Section>

      {/* Jira Integration */}
      <Section
        icon={LinkIcon}
        title="Jira Integration"
        description="Connect your Atlassian account to push stories and epics directly to Jira"
      >
        <form onSubmit={handleSaveJira} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Jira Email" hint="Your Atlassian account email">
              <input
                type="email"
                value={jira.jiraEmail}
                onChange={(e) => setJira({ ...jira, jiraEmail: e.target.value })}
                className="input"
                placeholder="you@company.com"
              />
            </Field>
            <Field label="Jira Domain" hint="e.g. mycompany.atlassian.net">
              <input
                type="text"
                value={jira.jiraDomain}
                onChange={(e) => setJira({ ...jira, jiraDomain: e.target.value })}
                className="input"
                placeholder="mycompany.atlassian.net"
              />
            </Field>
          </div>

          <Field label="Jira API Token" hint="Generate at id.atlassian.com → Security → API tokens. Leave blank to keep existing.">
            <SecretInput
              value={jira.jiraApiToken}
              onChange={(e) => setJira({ ...jira, jiraApiToken: e.target.value })}
              placeholder="Enter new API token..."
              name="jiraApiToken"
            />
          </Field>

          {/* Status indicator */}
          {(user?.jiraEmail || jiraTestStatus) && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
              jiraTestStatus === 'success'
                ? 'bg-emerald-900/20 text-emerald-400'
                : jiraTestStatus === 'error'
                ? 'bg-red-900/20 text-red-400'
                : user?.jiraEmail
                ? 'bg-gray-800 text-gray-400'
                : ''
            }`}>
              {jiraTestStatus === 'success'
                ? <CheckCircleIcon className="w-4 h-4" />
                : jiraTestStatus === 'error'
                ? <XCircleIcon className="w-4 h-4" />
                : <LinkIcon className="w-4 h-4" />}
              {jiraTestStatus === 'success'
                ? 'Jira connection successful'
                : jiraTestStatus === 'error'
                ? 'Jira connection failed'
                : `Configured for ${user?.jiraDomain}`}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => testJiraMutation.mutate()}
              disabled={testJiraMutation.isPending || !jira.jiraEmail}
              className="btn-secondary"
            >
              {testJiraMutation.isPending ? 'Testing...' : 'Test Connection'}
            </button>
            <button type="submit" disabled={integrationsMutation.isPending} className="btn-primary">
              {integrationsMutation.isPending ? 'Saving...' : 'Save Jira'}
            </button>
          </div>
        </form>
      </Section>

      {/* GitHub Integration */}
      <Section
        icon={CodeBracketIcon}
        title="GitHub Integration"
        description="Connect GitHub to analyze code commits against user story acceptance criteria"
      >
        <form onSubmit={handleSaveGitHub} className="space-y-4">
          <Field label="GitHub Username" hint="Your GitHub username">
            <input
              type="text"
              value={github.githubUsername}
              onChange={(e) => setGithub({ ...github, githubUsername: e.target.value })}
              className="input"
              placeholder="octocat"
            />
          </Field>

          <Field label="Personal Access Token" hint="Needs repo and read:user scopes. Leave blank to keep existing.">
            <SecretInput
              value={github.githubToken}
              onChange={(e) => setGithub({ ...github, githubToken: e.target.value })}
              placeholder="ghp_..."
              name="githubToken"
            />
          </Field>

          {user?.githubUsername && (
            <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-gray-800 text-gray-400">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              Connected as @{user.githubUsername}
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={integrationsMutation.isPending} className="btn-primary">
              {integrationsMutation.isPending ? 'Saving...' : 'Save GitHub'}
            </button>
          </div>
        </form>
      </Section>

      {/* Security */}
      <Section icon={KeyIcon} title="Security" description="Manage your password and security settings">
        <ChangePasswordForm />
      </Section>
    </div>
  )
}

function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [show, setShow] = useState(false)

  const mutation = useMutation({
    mutationFn: (body) => api.put('/auth/profile', body),
    onSuccess: () => {
      toast.success('Password changed!')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    mutation.mutate({ password: form.newPassword })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="New Password">
        <SecretInput
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          placeholder="New password (min 6 chars)"
        />
      </Field>
      <Field label="Confirm New Password">
        <SecretInput
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          placeholder="Repeat new password"
        />
      </Field>
      <div className="flex justify-end">
        <button type="submit" disabled={mutation.isPending || !form.newPassword} className="btn-primary">
          {mutation.isPending ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </form>
  )
}
