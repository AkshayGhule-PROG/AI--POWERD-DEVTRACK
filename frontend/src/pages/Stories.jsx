import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  SparklesIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon,
  RocketLaunchIcon, TrashIcon, PencilIcon, ArrowUpTrayIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { getStatusBadgeClass, getCodeStatusLabel, getPriorityColor, truncate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function StoriesPage() {
  const { id: projectId } = useParams()
  const { isScrumMaster } = useAuthStore()
  const qc = useQueryClient()
  const [expandedEpics, setExpandedEpics] = useState({})
  const [showGenerate, setShowGenerate] = useState(false)
  const [generateForm, setGenerateForm] = useState({ moduleName: '', additionalContext: '' })
  const [generatedResult, setGeneratedResult] = useState(null)
  const [showPushJira, setShowPushJira] = useState(false)
  const [filter, setFilter] = useState('all')

  const { data: epics = [] } = useQuery({
    queryKey: ['epics', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/stories/epics/${projectId}`)
      return data.data
    },
  })

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/stories/project/${projectId}`)
      return data.data
    },
  })

  const generateMutation = useMutation({
    mutationFn: (body) => api.post(`/stories/generate/${projectId}`, body),
    onSuccess: ({ data }) => {
      setGeneratedResult(data.data)
      toast.success(data.data.mock ? '📝 Mock stories generated (AI service offline)' : '✨ AI stories generated!')
    },
  })

  const saveMutation = useMutation({
    mutationFn: (body) => api.post(`/stories/save/${projectId}`, body),
    onSuccess: () => {
      qc.invalidateQueries(['stories', projectId])
      qc.invalidateQueries(['epics', projectId])
      setGeneratedResult(null)
      setShowGenerate(false)
      setGenerateForm({ moduleName: '', additionalContext: '' })
      toast.success('Stories saved!')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/stories/${id}`, body),
    onSuccess: () => qc.invalidateQueries(['stories', projectId]),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/stories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['stories', projectId])
      qc.invalidateQueries(['epics', projectId])
      toast.success('Story deleted')
    },
  })

  const pushJiraMutation = useMutation({
    mutationFn: (body) => api.post(`/jira/push/${projectId}`, body),
    onSuccess: ({ data }) => {
      qc.invalidateQueries(['stories', projectId])
      toast.success(`Pushed ${data.data.stories.length} stories, ${data.data.epics.length} epics to Jira!`)
      setShowPushJira(false)
    },
  })

  const toggleEpic = (epicId) => setExpandedEpics((p) => ({ ...p, [epicId]: !p[epicId] }))

  const filteredStories = filter === 'all' ? stories : stories.filter((s) => s.codeStatus === filter || s.status === filter)

  const storiesByEpic = (epicId) => filteredStories.filter((s) => s.epic?._id === epicId || s.epic === epicId)
  const orphanStories = filteredStories.filter((s) => !s.epic)

  const unpushedEpicIds = epics.filter((e) => !e.pushedToJira).map((e) => e._id)
  const unpushedStoryIds = stories.filter((s) => !s.pushedToJira && s.status === 'approved').map((s) => s._id)

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Stories & Epics</h1>
          <p className="text-gray-400 text-sm">{stories.length} stories across {epics.length} epics</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isScrumMaster() && (
            <>
              <button onClick={() => setShowPushJira(true)} className="btn-secondary btn-sm">
                <ArrowUpTrayIcon className="w-4 h-4" /> Push to Jira
              </button>
              <button onClick={() => setShowGenerate(true)} className="btn-primary btn-sm">
                <SparklesIcon className="w-4 h-4" /> AI Generate
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['all', 'draft', 'approved', 'in_progress', 'done'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn-sm rounded-full whitespace-nowrap ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f === 'all' ? 'All Stories' : f.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            <span className="ml-1 text-xs opacity-70">
              ({f === 'all' ? stories.length : stories.filter((s) => s.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Epics */}
          {epics.map((epic) => {
            const epicStories = storiesByEpic(epic._id)
            const isOpen = expandedEpics[epic._id] !== false

            return (
              <div key={epic._id} className="card overflow-hidden">
                {/* Epic header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleEpic(epic._id)}
                >
                  {isOpen ? <ChevronDownIcon className="w-4 h-4 text-gray-400" /> : <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: epic.color || '#6366f1' }} />
                  <span className="font-semibold text-white flex-1">{epic.title}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{epic.completedStories}/{epic.totalStories}</span>
                    <div className="w-24 progress-bar">
                      <div
                        className="progress-fill bg-primary-500"
                        style={{ width: `${epic.completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-400">{epic.completionPercentage}%</span>
                    {epic.pushedToJira && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800">Jira</span>
                    )}
                    <span className={`badge ${getStatusBadgeClass(epic.status)}`}>{epic.status}</span>
                  </div>
                </div>

                {isOpen && epicStories.length > 0 && (
                  <div className="border-t border-gray-800">
                    {epicStories.map((story) => (
                      <StoryRow
                        key={story._id}
                        story={story}
                        onStatusChange={(status) => updateMutation.mutate({ id: story._id, status })}
                        onDelete={() => deleteMutation.mutate(story._id)}
                      />
                    ))}
                  </div>
                )}

                {isOpen && epicStories.length === 0 && (
                  <div className="border-t border-gray-800 px-6 py-3 text-sm text-gray-500">
                    No stories in this epic yet.
                  </div>
                )}
              </div>
            )
          })}

          {/* Orphan stories */}
          {orphanStories.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <span className="font-semibold text-gray-400">Other Stories</span>
              </div>
              {orphanStories.map((story) => (
                <StoryRow
                  key={story._id}
                  story={story}
                  onStatusChange={(status) => updateMutation.mutate({ id: story._id, status })}
                  onDelete={() => deleteMutation.mutate(story._id)}
                />
              ))}
            </div>
          )}

          {stories.length === 0 && (
            <div className="card p-16 text-center">
              <RocketLaunchIcon className="w-14 h-14 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-300 font-medium mb-1">No stories yet</p>
              <p className="text-gray-500 text-sm mb-6">Upload an SRS document and use AI to generate stories</p>
              {isScrumMaster() && (
                <button onClick={() => setShowGenerate(true)} className="btn-primary">
                  <SparklesIcon className="w-4 h-4" /> Generate with AI
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI Generate Modal */}
      {showGenerate && (
        <Modal title="🧠 AI Story Generator" onClose={() => { setShowGenerate(false); setGeneratedResult(null) }} wide>
          {!generatedResult ? (
            <form onSubmit={(e) => { e.preventDefault(); generateMutation.mutate(generateForm) }} className="space-y-4">
              <p className="text-sm text-gray-400">
                Enter a module name and the AI will generate Epics, User Stories, and Tasks based on your uploaded SRS documents.
              </p>
              <div>
                <label className="input-label">Module Name *</label>
                <input
                  type="text"
                  value={generateForm.moduleName}
                  onChange={(e) => setGenerateForm({ ...generateForm, moduleName: e.target.value })}
                  className="input"
                  placeholder="e.g. User Authentication, Patient Management, Payment Gateway..."
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="input-label">Additional Context (optional)</label>
                <textarea
                  value={generateForm.additionalContext}
                  onChange={(e) => setGenerateForm({ ...generateForm, additionalContext: e.target.value })}
                  className="input resize-none"
                  rows={3}
                  placeholder="Any specific requirements, constraints, or tech stack details..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGenerate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={generateMutation.isPending} className="btn-primary flex-1">
                  {generateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                      </svg>
                      Generating...
                    </span>
                  ) : '✨ Generate Stories'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {generatedResult.mock && (
                <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-800 text-xs text-yellow-400">
                  ⚠️ {generatedResult.message}
                </div>
              )}
              <p className="text-sm text-gray-400">
                Generated {generatedResult.epics?.length || 0} epics, {generatedResult.stories?.length || 0} stories, {generatedResult.tasks?.length || 0} tasks.
                Review and approve to save.
              </p>

              <div className="max-h-80 overflow-y-auto space-y-3">
                {generatedResult.epics?.map((epic, i) => (
                  <div key={i} className="border border-primary-700/50 rounded-lg p-3 bg-primary-900/10">
                    <p className="text-xs font-medium text-primary-400 uppercase mb-1">EPIC</p>
                    <p className="font-semibold text-white">{epic.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{epic.description}</p>
                  </div>
                ))}
                {[...(generatedResult.stories || []), ...(generatedResult.tasks || [])].map((story, i) => (
                  <div key={i} className={`border rounded-lg p-3 ${story.type === 'task' ? 'border-yellow-700/50 bg-yellow-900/10' : 'border-gray-700 bg-gray-800/50'}`}>
                    <p className={`text-xs font-medium uppercase mb-1 ${story.type === 'task' ? 'text-yellow-400' : 'text-gray-400'}`}>{story.type}</p>
                    <p className="font-medium text-white text-sm">{story.title}</p>
                    {story.acceptanceCriteria?.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {story.acceptanceCriteria.map((ac, j) => (
                          <li key={j} className="text-xs text-gray-400">✓ {ac}</li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{story.sprint}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{story.storyPoints} pts</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setGeneratedResult(null)} className="btn-secondary flex-1">← Regenerate</button>
                <button
                  onClick={() => saveMutation.mutate(generatedResult)}
                  disabled={saveMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {saveMutation.isPending ? 'Saving...' : '✅ Approve & Save'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Push to Jira modal */}
      {showPushJira && (
        <Modal title="Push to Jira" onClose={() => setShowPushJira(false)}>
          <p className="text-sm text-gray-400 mb-4">
            This will push {unpushedEpicIds.length} unpushed epics and {unpushedStoryIds.length} approved stories to Jira.
          </p>
          {unpushedEpicIds.length === 0 && unpushedStoryIds.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">All stories are already pushed to Jira.</p>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setShowPushJira(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => pushJiraMutation.mutate({ epicIds: unpushedEpicIds, storyIds: unpushedStoryIds })}
                disabled={pushJiraMutation.isPending}
                className="btn-primary flex-1"
              >
                {pushJiraMutation.isPending ? 'Pushing...' : '🔗 Push to Jira'}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

const StoryRow = ({ story, onStatusChange, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/30 transition-colors border-b border-gray-800/50 last:border-0 group">
      <div className="w-5 h-5 rounded border-2 border-gray-600 shrink-0 flex items-center justify-center">
        {story.status === 'done' && <div className="w-3 h-3 rounded-sm bg-emerald-500" />}
        {story.status === 'in_progress' && <div className="w-3 h-3 rounded-sm bg-blue-500" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${story.type === 'task' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-400'}`}>
            {story.type}
          </span>
          {story.storyKey && <span className="text-[10px] text-gray-500">{story.storyKey}</span>}
        </div>
        <p className={`text-sm mt-0.5 ${story.status === 'done' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
          {story.title}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {story.storyPoints > 0 && (
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{story.storyPoints}p</span>
        )}
        <span className={`text-xs ${getPriorityColor(story.priority)}`}>
          {story.priority?.slice(0, 3).toUpperCase()}
        </span>
        <span className={`badge ${getStatusBadgeClass(story.status)} text-xs`}>{story.status?.replace('_', ' ')}</span>
        {story.codeStatus !== 'not_started' && (
          <span className="text-xs">{getCodeStatusLabel(story.codeStatus)}</span>
        )}
        {story.pushedToJira && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800">Jira</span>
        )}

        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <select
            value={story.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-gray-300"
          >
            {['draft', 'approved', 'to_do', 'in_progress', 'in_review', 'done', 'cancelled'].map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <button onClick={onDelete} className="btn-ghost btn-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400">
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

const Modal = ({ title, children, onClose, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className={`relative ${wide ? 'w-full max-w-2xl' : 'w-full max-w-md'} card p-6 max-h-[90vh] overflow-y-auto animate-slide-up`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button onClick={onClose} className="btn-ghost btn-sm p-1">✕</button>
      </div>
      {children}
    </div>
  </div>
)
