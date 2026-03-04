import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProjectStore } from '@/store/projectStore'
import api from '@/lib/api'
import {
  FolderIcon, RocketLaunchIcon, DocumentTextIcon, SparklesIcon,
  ArrowTrendingUpIcon, ClockIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { getProgressColor, formatDate, formatRelativeTime } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { setProjects } = useProjectStore()

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects')
      setProjects(data.data)
      return data.data
    },
  })

  const { data: overviewData } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/overview')
      return data.data
    },
  })

  const projects = projectsData || []
  const activeProjects = projects.filter((p) => p.status === 'active')

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderIcon, color: 'text-primary-400', bg: 'bg-primary-600/10' },
    { label: 'Active Projects', value: activeProjects.length, icon: ArrowTrendingUpIcon, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
    { label: 'Total Stories', value: overviewData?.totalStories || 0, icon: RocketLaunchIcon, color: 'text-yellow-400', bg: 'bg-yellow-600/10' },
    { label: 'Completed', value: overviewData?.completedStories || 0, icon: SparklesIcon, color: 'text-purple-400', bg: 'bg-purple-600/10' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's your DevTrack overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Projects list */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Active Projects</h2>
            <Link to="/projects" className="text-sm text-primary-400 hover:text-primary-300">
              View all →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="card p-12 text-center">
              <FolderIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No projects yet. Create your first project!</p>
              <Link to="/projects" className="btn-primary">
                Create Project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="card p-4 flex items-center gap-4 hover:border-gray-700 transition-colors block"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: project.color || '#6366f1' }}
                  >
                    {project.key?.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white truncate">{project.name}</p>
                      <StatusBadge status={project.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 progress-bar">
                        <div
                          className={`progress-fill ${getProgressColor(project.completionPercentage)}`}
                          style={{ width: `${project.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {project.completionPercentage}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/projects" className="card p-4 flex items-center gap-3 hover:border-gray-700 transition-colors block group">
              <div className="p-2 rounded-lg bg-primary-600/10 text-primary-400 group-hover:bg-primary-600/20">
                <FolderIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-white">New Project</p>
                <p className="text-xs text-gray-500">Start a new DevTrack project</p>
              </div>
            </Link>

            {/* Upload SRS — admin & scrum_master only */}
            {['admin', 'scrum_master'].includes(user?.role) ? (
              <Link
                to={projects.length > 0 ? `/projects/${projects[0]._id}/documents` : '/projects'}
                className="card p-4 flex items-center gap-3 hover:border-gray-700 transition-colors block group"
              >
                <div className="p-2 rounded-lg bg-yellow-600/10 text-yellow-400 group-hover:bg-yellow-600/20">
                  <DocumentTextIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Upload SRS</p>
                  <p className="text-xs text-gray-500">Ingest your requirements document</p>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shrink-0">
                  {user?.role === 'admin' ? 'Admin' : 'Scrum Master'}
                </span>
              </Link>
            ) : (
              <div className="card p-4 flex items-center gap-3 opacity-60 cursor-not-allowed">
                <div className="p-2 rounded-lg bg-gray-600/10 text-gray-500">
                  <DocumentTextIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Upload SRS</p>
                  <p className="text-xs text-gray-500">Only Admin or Scrum Master can upload</p>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-500 border border-gray-500/20 shrink-0">Restricted</span>
              </div>
            )}

            <Link
              to={projects.length > 0 ? `/projects/${projects[0]._id}/stories` : '/projects'}
              className="card p-4 flex items-center gap-3 hover:border-gray-700 transition-colors block group"
            >
              <div className="p-2 rounded-lg bg-purple-600/10 text-purple-400 group-hover:bg-purple-600/20">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-white">Generate Stories</p>
                <p className="text-xs text-gray-500">AI-powered Jira story generation</p>
              </div>
            </Link>
          </div>

          {/* Recent activity */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Projects</h3>
            <div className="space-y-2">
              {projects.slice(0, 3).map((p) => (
                <div key={p._id} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                  <span className="text-gray-300 truncate">{p.name}</span>
                  <span className="text-gray-600 shrink-0 ml-auto">{formatRelativeTime(p.updatedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const map = {
    active: 'badge-done',
    planning: 'badge-draft',
    paused: 'badge-partial',
    completed: 'badge-in-progress',
    archived: 'badge-not-started',
  }
  return <span className={`badge ${map[status] || 'badge-not-started'} capitalize`}>{status}</span>
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
