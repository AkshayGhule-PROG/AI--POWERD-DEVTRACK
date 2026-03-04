import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  PlusIcon, RocketLaunchIcon, ClockIcon, CheckBadgeIcon,
  PlayIcon, TrashIcon, ChevronDownIcon,
} from '@heroicons/react/24/outline'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { getStatusBadgeClass } from '@/lib/utils'
import toast from 'react-hot-toast'

const SprintStatusIcon = ({ status }) => {
  switch (status) {
    case 'active': return <PlayIcon className="w-4 h-4 text-emerald-400" />
    case 'completed': return <CheckBadgeIcon className="w-4 h-4 text-blue-400" />
    default: return <ClockIcon className="w-4 h-4 text-gray-500" />
  }
}

const sprintColors = {
  future: 'border-gray-700 bg-gray-800/40',
  active: 'border-emerald-700/50 bg-emerald-900/10',
  completed: 'border-blue-700/30 bg-blue-900/10',
}

export default function SprintsPage() {
  const { id: projectId } = useParams()
  const { isScrumMaster } = useAuthStore()
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    status: 'future',
  })
  const [expandedSprint, setExpandedSprint] = useState(null)

  const { data: sprints = [], isLoading } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/sprints/project/${projectId}`)
      return data.data
    },
  })

  const { data: stories = [] } = useQuery({
    queryKey: ['stories', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/stories/project/${projectId}`)
      return data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (body) => api.post(`/sprints/project/${projectId}`, body),
    onSuccess: () => {
      qc.invalidateQueries(['sprints', projectId])
      setShowCreate(false)
      setCreateForm({ name: '', goal: '', startDate: '', endDate: '', status: 'future' })
      toast.success('Sprint created!')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/sprints/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries(['sprints', projectId])
      toast.success('Sprint updated!')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/sprints/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['sprints', projectId])
      toast.success('Sprint deleted')
    },
  })

  const activeSprint = sprints.find((s) => s.status === 'active')

  const getSprintStories = (sprintName) =>
    stories.filter((s) => s.sprint === sprintName)

  const completedCount = (sprintName) =>
    getSprintStories(sprintName).filter((s) => s.status === 'done').length

  // Build burndown data from sprint
  const buildBurndown = (sprint) => {
    if (!sprint?.burndownData?.length) {
      // synthetic placeholder
      const total = getSprintStories(sprint?.name || '').length
      return [
        { day: 'Start', ideal: total, actual: total },
        { day: 'Day 3', ideal: Math.ceil(total * 0.75), actual: Math.ceil(total * 0.80) },
        { day: 'Day 6', ideal: Math.ceil(total * 0.5), actual: Math.ceil(total * 0.55) },
        { day: 'Day 9', ideal: Math.ceil(total * 0.25), actual: Math.ceil(total * 0.30) },
        { day: 'End', ideal: 0, actual: completedCount(sprint?.name) > 0 ? Math.max(0, total - completedCount(sprint?.name)) : total },
      ]
    }
    return sprint.burndownData.map((d, i) => ({
      day: `Day ${i + 1}`,
      ideal: d.ideal,
      actual: d.actual,
    }))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Sprints</h1>
          <p className="text-gray-400 text-sm">{sprints.length} sprints · {activeSprint ? `Sprint "${activeSprint.name}" active` : 'No active sprint'}</p>
        </div>
        {isScrumMaster() && (
          <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">
            <PlusIcon className="w-4 h-4" /> New Sprint
          </button>
        )}
      </div>

      {/* Active sprint burndown chart */}
      {activeSprint && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Sprint: {activeSprint.name}
              </h3>
              {activeSprint.goal && <p className="text-sm text-gray-400 mt-0.5">{activeSprint.goal}</p>}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {completedCount(activeSprint.name)}/{getSprintStories(activeSprint.name).length}
              </p>
              <p className="text-xs text-gray-500">stories done</p>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={buildBurndown(activeSprint)}>
                <defs>
                  <linearGradient id="idealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Area type="monotone" dataKey="ideal" stroke="#6366f1" fill="url(#idealGrad)" strokeDasharray="5 5" name="Ideal" />
                <Area type="monotone" dataKey="actual" stroke="#10b981" fill="url(#actualGrad)" name="Actual" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <div className="w-4 h-0.5 bg-primary-500" style={{ borderTop: '2px dashed #6366f1' }} />
              Ideal Burndown
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <div className="w-4 h-0.5 bg-emerald-500" />
              Actual Burndown
            </div>
          </div>
        </div>
      )}

      {/* Sprint cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : sprints.length === 0 ? (
        <div className="card p-16 text-center">
          <RocketLaunchIcon className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-300 font-medium">No sprints yet</p>
          <p className="text-gray-500 text-sm mt-1">Create your first sprint to organize stories into iterations</p>
          {isScrumMaster() && (
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-6">
              <PlusIcon className="w-4 h-4" /> Create Sprint
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sprints.map((sprint) => {
            const sprintStories = getSprintStories(sprint.name)
            const done = completedCount(sprint.name)
            const pct = sprintStories.length > 0 ? Math.round((done / sprintStories.length) * 100) : 0
            const isExpanded = expandedSprint === sprint._id

            return (
              <div key={sprint._id} className={`card overflow-hidden border ${sprintColors[sprint.status]}`}>
                {/* Sprint header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800/20 transition-colors"
                  onClick={() => setExpandedSprint(isExpanded ? null : sprint._id)}
                >
                  <SprintStatusIcon status={sprint.status} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{sprint.name}</span>
                      <span className={`badge ${getStatusBadgeClass(sprint.status)}`}>{sprint.status}</span>
                      {sprint.aiGenerated && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-900/40 text-primary-400">AI</span>}
                    </div>
                    {sprint.goal && <p className="text-xs text-gray-500 mt-0.5">{sprint.goal}</p>}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-white">{done}/{sprintStories.length}</p>
                      <p className="text-[10px] text-gray-500">stories done</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 progress-bar hidden sm:block">
                        <div
                          className={`progress-fill ${sprint.status === 'active' ? 'bg-emerald-500' : 'bg-gray-600'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8">{pct}%</span>
                    </div>

                    {isScrumMaster() && sprint.status !== 'completed' && (
                      <div className="flex gap-1">
                        {sprint.status === 'future' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: sprint._id, status: 'active' }) }}
                            className="btn-primary btn-sm py-1"
                          >
                            <PlayIcon className="w-3.5 h-3.5" /> Start
                          </button>
                        )}
                        {sprint.status === 'active' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: sprint._id, status: 'completed' }) }}
                            className="btn-secondary btn-sm py-1"
                          >
                            <CheckBadgeIcon className="w-3.5 h-3.5" /> Complete
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(sprint._id) }}
                          className="btn-ghost btn-sm p-1 text-red-400"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded stories */}
                {isExpanded && (
                  <div className="border-t border-gray-800">
                    {sprintStories.length === 0 ? (
                      <div className="px-6 py-4 text-sm text-gray-500">No stories assigned to this sprint</div>
                    ) : (
                      <div>
                        {/* Status mini-bar */}
                        <div className="px-5 py-3 flex gap-4 border-b border-gray-800/50 text-xs text-gray-400 flex-wrap">
                          {['to_do', 'in_progress', 'in_review', 'done'].map((st) => {
                            const count = sprintStories.filter((s) => s.status === st).length
                            return count > 0 ? (
                              <span key={st} className={`${count > 0 ? '' : 'opacity-30'}`}>
                                <span className={`badge ${getStatusBadgeClass(st)} mr-1`}>{count}</span>
                                {st.replace('_', ' ')}
                              </span>
                            ) : null
                          })}
                        </div>

                        {sprintStories.map((story) => (
                          <div
                            key={story._id}
                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-800/20 transition-colors border-b border-gray-800/30 last:border-0"
                          >
                            <span className={`badge ${getStatusBadgeClass(story.status)} text-xs shrink-0`}>
                              {story.status?.replace('_', ' ')}
                            </span>
                            <p className="text-sm text-gray-300 flex-1 truncate">{story.title}</p>
                            {story.storyPoints > 0 && (
                              <span className="text-xs text-gray-500 shrink-0">{story.storyPoints}p</span>
                            )}
                            {story.assignee && (
                              <span className="text-xs text-gray-600 shrink-0">{story.assignee.name ?? story.assignee}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {sprint.velocityPlanned > 0 && (
                      <div className="px-5 py-3 flex gap-6 bg-gray-900/40 text-xs text-gray-500">
                        <span>Planned velocity: <strong className="text-gray-300">{sprint.velocityPlanned}p</strong></span>
                        {sprint.velocityActual > 0 && (
                          <span>Actual: <strong className="text-gray-300">{sprint.velocityActual}p</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create sprint modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md card p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">New Sprint</h3>
              <button onClick={() => setShowCreate(false)} className="btn-ghost btn-sm p-1">✕</button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate(createForm) }}
              className="space-y-4"
            >
              <div>
                <label className="input-label">Sprint Name *</label>
                <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="input" placeholder="e.g. Sprint 1" required autoFocus />
              </div>
              <div>
                <label className="input-label">Sprint Goal</label>
                <textarea value={createForm.goal} onChange={(e) => setCreateForm({ ...createForm, goal: e.target.value })} className="input resize-none" rows={2} placeholder="What will be achieved in this sprint?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Start Date</label>
                  <input type="date" value={createForm.startDate} onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="input-label">End Date</label>
                  <input type="date" value={createForm.endDate} onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })} className="input" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
                  {createMutation.isPending ? 'Creating...' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
