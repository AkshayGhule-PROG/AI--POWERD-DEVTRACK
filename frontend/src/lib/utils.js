import { clsx } from 'clsx'

export const cn = (...args) => clsx(args)

export const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export const formatRelativeTime = (date) => {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(date)
}

export const getProgressColor = (pct) => {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-primary-500'
  if (pct >= 25) return 'bg-yellow-500'
  return 'bg-red-500'
}

export const getPriorityColor = (priority) => {
  const map = {
    highest: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
    lowest: 'text-gray-400',
  }
  return map[priority] || 'text-gray-400'
}

export const getStatusBadgeClass = (status) => {
  const map = {
    done: 'badge-done',
    in_progress: 'badge-in-progress',
    to_do: 'badge-to-do',
    partial: 'badge-partial',
    not_started: 'badge-not-started',
    draft: 'badge-draft',
    approved: 'badge-approved',
    cancelled: 'badge-not-started',
  }
  return map[status] || 'badge-not-started'
}

export const getCodeStatusLabel = (status) => {
  const map = {
    done: '✅ Done',
    partial: '🔶 Partial',
    not_started: '⬜ Not Started',
  }
  return map[status] || status
}

export const truncate = (str, n = 80) =>
  str && str.length > n ? str.slice(0, n) + '...' : str || ''

export const generateProjectKey = (name) =>
  name
    .split(' ')
    .map((w) => w[0]?.toUpperCase())
    .join('')
    .slice(0, 6) || 'PRJ'
