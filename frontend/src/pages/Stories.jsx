import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  SparklesIcon, ChevronDownIcon, ChevronRightIcon,
  RocketLaunchIcon, TrashIcon, ArrowUpTrayIcon,
  ExclamationTriangleIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { getStatusBadgeClass, getCodeStatusLabel, getPriorityColor } from '@/lib/utils'
import toast from 'react-hot-toast'

// Type badge config
const TYPE_CONFIG = {
  story:   { label: 'Story',   bg: 'bg-blue-900/40',   text: 'text-blue-300',   border: 'border-blue-700/50' },
  task:    { label: 'Task',    bg: 'bg-yellow-900/40', text: 'text-yellow-300', border: 'border-yellow-700/50' },
  subtask: { label: 'Subtask', bg: 'bg-purple-900/40', text: 'text-purple-300', border: 'border-purple-700/50' },
  bug:     { label: 'Bug',     bg: 'bg-red-900/40',    text: 'text-red-300',    border: 'border-red-700/50' },
}

export default function StoriesPage() {
  const { id: projectId } = useParams()
  const { isScrumMaster } = useAuthStore()
  const qc = useQueryClient()
  const [expandedEpics, setExpandedEpics] = useState({})
  const [expandedStories, setExpandedStories] = useState({})
  const [showGenerate, setShowGenerate] = useState(false)
  const [generateForm, setGenerateForm] = useState({ moduleName: '', additionalContext: '' })
  const [generatedResult, setGeneratedResult] = useState(null)
  const [showPushJira, setShowPushJira] = useState(false)
  const [filter, setFilter] = useState('all')

  // Check for processed SRS documents
  const { data: documents = [] } = useQuery({
    queryKey: ['documents', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/documents/project/${projectId}`)
      return data.data
    },
  })
  const processedDocs = documents.filter((d) => d.status === 'processed')
  const hasSRS = processedDocs.length > 0

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
      toast.success('✨ AI stories generated!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Generation failed'),
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
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
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
      toast.success('Deleted')
    },
  })

  const pushJiraMutation = useMutation({
    mutationFn: (body) => api.post(`/jira/push/${projectId}`, body),
    onSuccess: ({ data }) => {
      qc.invalidateQueries(['stories', projectId])
      toast.success(`Pushed ${data.data.stories.length} stories to Jira!`)
      setShowPushJira(false)
    },
  })

  const toggleEpic = (id) => setExpandedEpics((p) => ({ ...p, [id]: !p[id] }))
  const toggleStory = (id) => setExpandedStories((p) => ({ ...p, [id]: !p[id] }))

  const filteredStories = filter === 'all' ? stories : stories.filter((s) => s.status === filter || s.type === filter)
  const rootStories = (epicId) =>
    filteredStories.filter((s) => (s.epic?._id === epicId || s.epic === epicId) && s.type !== 'subtask')
  const subtasksOf = (storyId) =>
    stories.filter((s) => s.parentStory === storyId || s.parentStory?._id === storyId)
  const orphanStories = filteredStories.filter((s) => !s.epic && s.type !== 'subtask')

  const unpushedEpicIds = epics.filter((e) => !e.pushedToJira).map((e) => e._id)
  const unpushedStoryIds = stories.filter((s) => !s.pushedToJira && s.status === 'approved').map((s) => s._id)

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Stories & Epics</h1>
          <p className="text-gray-400 text-sm">
            {stories.filter((s) => s.type === 'story').length} stories ·{' '}
            {stories.filter((s) => s.type === 'task').length} tasks ·{' '}
            {stories.filter((s) => s.type === 'subtask').length} subtasks across {epics.length} epics
          </p>
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

      {/* SRS status banner */}
      {!hasSRS && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/50 flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-300">No processed SRS document</p>
            <p className="text-xs text-yellow-500 mt-0.5">
              Upload and process an SRS/MD document in the <strong>Documents</strong> tab before generating stories. AI needs the document context to generate meaningful epics, stories, and tasks.
            </p>
          </div>
        </div>
      )}
      {hasSRS && (
        <div className="mb-4 p-2.5 rounded-lg bg-emerald-900/20 border border-emerald-700/40 flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-400">
            {processedDocs.length} processed SRS document{processedDocs.length > 1 ? 's' : ''} ready — AI will use this context to generate stories.
          </p>
        </div>
      )}

      {/* Type legend */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(TYPE_CONFIG).slice(0, 3).map(([key, cfg]) => (
          <span key={key} className={`text-[11px] font-medium px-2 py-1 rounded border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {cfg.label}
          </span>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['all', 'story', 'task', 'subtask', 'in_progress', 'done'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn-sm rounded-full whitespace-nowrap ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            <span className="ml-1 text-xs opacity-70">
              ({f === 'all' ? stories.length : stories.filter((s) => s.type === f || s.status === f).length})
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
          {epics.map((epic) => {
            const epicStories = rootStories(epic._id)
            const isOpen = expandedEpics[epic._id] !== false
            return (
              <div key={epic._id} className="card overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleEpic(epic._id)}
                >
                  {isOpen ? <ChevronDownIcon className="w-4 h-4 text-gray-400" /> : <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: epic.color || '#6366f1' }} />
                  <span className="font-semibold text-white flex-1">{epic.title}</span>
                  <div className="flex items-center gap-3 ml-auto">
                    <span className="text-xs text-gray-500">{epic.completedStories}/{epic.totalStories}</span>
                    <div className="w-24 progress-bar">
                      <div className="progress-fill bg-primary-500" style={{ width: `${epic.completionPercentage}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-400">{epic.completionPercentage}%</span>
                    <span className={`badge ${getStatusBadgeClass(epic.status)}`}>{epic.status}</span>
                  </div>
                </div>

                {isOpen && epicStories.length > 0 && (
                  <div className="border-t border-gray-800">
                    {epicStories.map((story) => (
                      <StoryRow
                        key={story._id}
                        story={story}
                        subtasks={subtasksOf(story._id)}
                        expanded={!!expandedStories[story._id]}
                        onToggle={() => toggleStory(story._id)}
                        onStatusChange={(status) => updateMutation.mutate({ id: story._id, status })}
                        onDelete={() => deleteMutation.mutate(story._id)}
                      />
                    ))}
                  </div>
                )}
                {isOpen && epicStories.length === 0 && (
                  <div className="border-t border-gray-800 px-6 py-3 text-sm text-gray-500">No stories in this epic yet.</div>
                )}
              </div>
            )
          })}

          {orphanStories.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <span className="font-semibold text-gray-400">Other Stories</span>
              </div>
              {orphanStories.map((story) => (
                <StoryRow
                  key={story._id}
                  story={story}
                  subtasks={subtasksOf(story._id)}
                  expanded={!!expandedStories[story._id]}
                  onToggle={() => toggleStory(story._id)}
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
              <p className="text-gray-500 text-sm mb-6">
                {hasSRS ? 'Click "AI Generate" to create stories from your SRS document.' : 'Upload an SRS document first, then use AI to generate stories.'}
              </p>
              {isScrumMaster() && hasSRS && (
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
              {!hasSRS && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/50 flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">
                    No processed SRS document found. Go to the <strong>Documents</strong> tab, upload an SRS/MD file, and wait for it to be processed before generating stories.
                  </p>
                </div>
              )}
              {hasSRS && (
                <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/40 text-xs text-emerald-400">
                  ✓ Using context from: {processedDocs.map((d) => d.name || d.originalName).join(', ')}
                </div>
              )}
              <p className="text-sm text-gray-400">
                AI will generate <strong className="text-white">Epics → Stories → Tasks → Subtasks</strong> from your SRS context.
              </p>
              <div>
                <label className="input-label">Module Name *</label>
                <input
                  type="text"
                  value={generateForm.moduleName}
                  onChange={(e) => setGenerateForm({ ...generateForm, moduleName: e.target.value })}
                  className="input"
                  placeholder="e.g. Appointment Booking, User Authentication, Payment Gateway..."
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
                  placeholder="Tech stack, constraints, team size..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGenerate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={generateMutation.isPending || !hasSRS} className="btn-primary flex-1">
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
            <GeneratedPreview
              result={generatedResult}
              onRegenerate={() => setGeneratedResult(null)}
              onSave={() => saveMutation.mutate(generatedResult)}
              saving={saveMutation.isPending}
            />
          )}
        </Modal>
      )}

      {/* Push to Jira modal */}
      {showPushJira && (
        <Modal title="Push to Jira" onClose={() => setShowPushJira(false)}>
          <p className="text-sm text-gray-400 mb-4">
            Push {unpushedEpicIds.length} unpushed epics and {unpushedStoryIds.length} approved stories to Jira.
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

// Story/Task/Subtask row with expandable AC and subtask list
const StoryRow = ({ story, subtasks = [], expanded, onToggle, onStatusChange, onDelete, indent = false }) => {
  const cfg = TYPE_CONFIG[story.type] || TYPE_CONFIG.story
  const hasAC = story.acceptanceCriteria?.length > 0
  const hasSubtasks = subtasks.length > 0
  const canExpand = hasAC || hasSubtasks

  return (
    <>
      <div className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-800/30 transition-colors border-b border-gray-800/50 last:border-0 group ${indent ? 'pl-12 bg-gray-900/30' : ''}`}>
        {/* Expand toggle */}
        <button
          onClick={canExpand ? onToggle : undefined}
          className={`mt-0.5 shrink-0 ${canExpand ? 'text-gray-500 hover:text-gray-300 cursor-pointer' : 'text-gray-800 cursor-default'}`}
        >
          {canExpand ? (
            expanded ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronRightIcon className="w-3.5 h-3.5" />
          ) : (
            <div className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Status dot */}
        <div className="w-4 h-4 rounded border-2 border-gray-600 shrink-0 mt-0.5 flex items-center justify-center">
          {story.status === 'done' && <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />}
          {story.status === 'in_progress' && <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />}
          {story.status === 'in_review' && <div className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              {cfg.label}
            </span>
            {story.storyKey && <span className="text-[10px] text-gray-500 font-mono">{story.storyKey}</span>}
            {story.pushedToJira && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800">Jira</span>
            )}
          </div>
          <p className={`text-sm ${story.status === 'done' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
            {story.title}
          </p>

          {/* Acceptance Criteria (expanded) */}
          {expanded && hasAC && (
            <div className="mt-2 pl-1 border-l-2 border-gray-700 space-y-0.5">
              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Acceptance Criteria</p>
              {story.acceptanceCriteria.map((ac, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className={`text-[10px] mt-0.5 ${ac.met ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {ac.met ? '✓' : '○'}
                  </span>
                  <p className={`text-xs ${ac.met ? 'text-emerald-400 line-through' : 'text-gray-400'}`}>
                    {ac.criterion}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Subtasks (expanded) */}
          {expanded && hasSubtasks && (
            <div className="mt-2 space-y-0">
              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Subtasks ({subtasks.length})</p>
              {subtasks.map((sub) => (
                <div key={sub._id} className="flex items-center gap-2 py-1 border-b border-gray-800/50 last:border-0">
                  <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${TYPE_CONFIG.subtask.bg} ${TYPE_CONFIG.subtask.text} ${TYPE_CONFIG.subtask.border}`}>
                    Sub
                  </div>
                  <p className="text-xs text-gray-300 flex-1">{sub.title}</p>
                  <span className="text-[10px] text-gray-500">{sub.storyPoints}p</span>
                  <span className={`badge ${getStatusBadgeClass(sub.status)} text-[10px]`}>{sub.status?.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {story.storyPoints > 0 && (
            <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">{story.storyPoints}p</span>
          )}
          <span className={`text-xs font-medium ${getPriorityColor(story.priority)}`}>
            {story.priority?.slice(0, 3).toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">{story.sprint}</span>
          <span className={`badge ${getStatusBadgeClass(story.status)} text-xs`}>{story.status?.replace('_', ' ')}</span>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <select
              value={story.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-gray-300"
            >
              {['draft', 'approved', 'to_do', 'in_progress', 'in_review', 'done', 'cancelled'].map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            <button onClick={onDelete} className="btn-ghost btn-sm p-1 text-red-400">
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Preview of AI-generated results before saving
const GeneratedPreview = ({ result, onRegenerate, onSave, saving }) => {
  const totalItems = (result.epics?.length || 0) + (result.stories?.length || 0) + (result.tasks?.length || 0) + (result.subtasks?.length || 0)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Epics', count: result.epics?.length || 0, color: 'text-indigo-400' },
          { label: 'Stories', count: result.stories?.length || 0, color: 'text-blue-400' },
          { label: 'Tasks', count: result.tasks?.length || 0, color: 'text-yellow-400' },
          { label: 'Subtasks', count: result.subtasks?.length || 0, color: 'text-purple-400' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-gray-800/60 rounded-lg p-2">
            <p className={`text-xl font-bold ${color}`}>{count}</p>
            <p className="text-[11px] text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
        {/* Epics */}
        {result.epics?.map((epic, i) => (
          <div key={i} className="border border-indigo-700/40 rounded-lg p-3 bg-indigo-900/10">
            <p className="text-[10px] font-semibold text-indigo-400 uppercase mb-1">EPIC · {epic.sprint}</p>
            <p className="font-semibold text-white text-sm">{epic.title}</p>
            <p className="text-xs text-gray-400 mt-1">{epic.description}</p>
          </div>
        ))}

        {/* Stories */}
        {result.stories?.map((s, i) => (
          <PreviewItem key={i} item={s} cfg={TYPE_CONFIG.story} />
        ))}

        {/* Tasks */}
        {result.tasks?.map((s, i) => (
          <PreviewItem key={i} item={s} cfg={TYPE_CONFIG.task} />
        ))}

        {/* Subtasks */}
        {result.subtasks?.length > 0 && (
          <div className="border border-purple-700/40 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-purple-900/20">
              <p className="text-[10px] font-semibold text-purple-400 uppercase">Subtasks ({result.subtasks.length})</p>
            </div>
            {result.subtasks.map((s, i) => (
              <div key={i} className="px-3 py-2 border-t border-purple-800/30 flex items-start gap-2">
                <span className="text-purple-500 text-[10px] mt-0.5 shrink-0">↳</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-200">{s.title}</p>
                  {s.acceptanceCriteria?.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {s.acceptanceCriteria.map((ac, j) => (
                        <li key={j} className="text-[10px] text-gray-500">✓ {ac}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 shrink-0">{s.storyPoints}p</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={onRegenerate} className="btn-secondary flex-1">← Regenerate</button>
        <button onClick={onSave} disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving...' : `✅ Approve & Save (${totalItems} items)`}
        </button>
      </div>
    </div>
  )
}

const PreviewItem = ({ item, cfg }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-lg ${cfg.border} ${cfg.bg.replace('/40', '/10')}`}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full text-left p-3 flex items-start gap-2"
      >
        <span className="mt-0.5 text-gray-500 shrink-0">
          {open ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label.toUpperCase()}</span>
            <span className="text-[10px] text-gray-500">{item.sprint} · {item.storyPoints}p · {item.priority}</span>
          </div>
          <p className="text-sm text-white">{item.title}</p>
        </div>
      </button>
      {open && item.acceptanceCriteria?.length > 0 && (
        <div className="px-8 pb-3 border-t border-gray-800/50 pt-2">
          <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1.5">Acceptance Criteria</p>
          <ul className="space-y-1">
            {item.acceptanceCriteria.map((ac, j) => (
              <li key={j} className="flex items-start gap-1.5">
                <span className="text-emerald-500 text-[11px] mt-0.5">✓</span>
                <span className="text-xs text-gray-400">{ac}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
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
