import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  future:    'border-gray-200',
  active:    'border-emerald-300',
  completed: 'border-indigo-200',
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

  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } }
  const stagger = { show: { transition: { staggerChildren: 0.07 } } }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-6 flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sprints</h1>
          <p className="text-gray-500 text-sm">{sprints.length} sprints · {activeSprint ? `Sprint "${activeSprint.name}" active` : 'No active sprint'}</p>
        </div>
        {isScrumMaster() && (
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(true)} className="btn-primary btn-sm">
            <PlusIcon className="w-4 h-4" /> New Sprint
          </motion.button>
        )}
      </motion.div>

      {/* Active sprint burndown chart */}
      <AnimatePresence>
      {activeSprint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="card p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Sprint: {activeSprint.name}
              </h3>
              {activeSprint.goal && <p className="text-sm text-gray-500 mt-0.5">{activeSprint.goal}</p>}
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-gray-900">
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#0d0d1e', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', color: '#e2e8f0' }}
                  labelStyle={{ color: '#a5b4fc', fontWeight: 600 }}
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
        </motion.div>
      )}
      </AnimatePresence>

      {/* Sprint cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : sprints.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
               style={{ background:'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(109,40,217,0.08))' }}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
              <RocketLaunchIcon className="w-8 h-8 text-indigo-400" />
            </motion.div>
          </div>
          <p className="text-gray-800 font-semibold">No sprints yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first sprint to organize stories into iterations</p>
          {isScrumMaster() && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(true)} className="btn-primary mt-6">
              <PlusIcon className="w-4 h-4" /> Create Sprint
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-3">
          {sprints.map((sprint) => {
            const sprintStories = getSprintStories(sprint.name)
            const done = completedCount(sprint.name)
            const pct = sprintStories.length > 0 ? Math.round((done / sprintStories.length) * 100) : 0
            const isExpanded = expandedSprint === sprint._id

            return (
              <motion.div key={sprint._id} variants={fadeUp} whileHover={{ y: -2 }} className={`card overflow-hidden border ${sprintColors[sprint.status]}`}>
                {/* Sprint header */}
              <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedSprint(isExpanded ? null : sprint._id)}
                >
                  <SprintStatusIcon status={sprint.status} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{sprint.name}</span>
                      <span className={`badge ${getStatusBadgeClass(sprint.status)}`}>{sprint.status}</span>
                      {sprint.aiGenerated && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">AI</span>}
                    </div>
                    {sprint.goal && <p className="text-xs text-gray-500 mt-0.5">{sprint.goal}</p>}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-gray-900">{done}/{sprintStories.length}</p>
                      <p className="text-[10px] text-gray-500">stories done</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 progress-bar hidden sm:block">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: '0%' }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                          style={{ background: sprint.status === 'active' ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{pct}%</span>
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

                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded stories */}
                <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                    className="border-t border-gray-100"
                  >
                    {sprintStories.length === 0 ? (
                      <div className="px-6 py-4 text-sm text-gray-400">No stories assigned to this sprint</div>
                    ) : (
                      <div>
                        {/* Status mini-bar */}
                        <div className="px-5 py-3 flex gap-4 border-b border-gray-100 text-xs text-gray-500 flex-wrap">
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

                        {sprintStories.map((story, idx) => (
                          <motion.div
                            key={story._id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <span className={`badge ${getStatusBadgeClass(story.status)} text-xs shrink-0`}>
                              {story.status?.replace('_', ' ')}
                            </span>
                            <p className="text-sm text-gray-800 flex-1 truncate">{story.title}</p>
                            {story.storyPoints > 0 && (
                              <span className="text-xs text-gray-500 shrink-0">{story.storyPoints}p</span>
                            )}
                            {story.assignee && (
                              <span className="text-xs text-gray-600 shrink-0">{story.assignee.name ?? story.assignee}</span>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {sprint.velocityPlanned > 0 && (
                      <div className="px-5 py-3 flex gap-6 bg-gray-50 text-xs text-gray-500">
                        <span>Planned velocity: <strong className="text-gray-700">{sprint.velocityPlanned}p</strong></span>
                        {sprint.velocityActual > 0 && (
                          <span>Actual: <strong className="text-gray-700">{sprint.velocityActual}p</strong></span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Create sprint modal */}
      <AnimatePresence>
      {showCreate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0" style={{ background:'rgba(15,23,42,0.4)', backdropFilter:'blur(6px)' }} onClick={() => setShowCreate(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md card p-6"
            style={{ boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">New Sprint</h3>
              <button onClick={() => setShowCreate(false)} className="btn-ghost btn-sm p-1.5">✕</button>
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
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}
