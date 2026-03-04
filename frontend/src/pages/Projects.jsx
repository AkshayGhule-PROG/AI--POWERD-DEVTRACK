import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, FolderIcon, MagnifyingGlassIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { useProjectStore } from '@/store/projectStore'
import { getProgressColor, formatDate, generateProjectKey } from '@/lib/utils'
import toast from 'react-hot-toast'

const PROJECT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6']

export default function ProjectsPage() {
  const qc = useQueryClient()
  const { setProjects, setCurrentProject } = useProjectStore()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', key: '', color: '#6366f1', budget: '', deadline: '', technology: '', status: 'active' })

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects')
      setProjects(data.data)
      return data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/projects', body),
    onSuccess: () => {
      qc.invalidateQueries(['projects'])
      setShowCreate(false)
      resetForm()
      toast.success('Project created!')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['projects'])
      toast.success('Project deleted')
    },
  })

  const resetForm = () => setForm({ name: '', description: '', key: '', color: '#6366f1', budget: '', deadline: '', technology: '', status: 'active' })

  const handleNameChange = (name) => {
    setForm({ ...form, name, key: form.key || generateProjectKey(name) })
  }

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.key.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 text-sm mt-0.5">{projects.length} projects</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <PlusIcon className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="input pl-9"
        />
      </div>

      {/* Projects grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 h-44 animate-pulse bg-gray-900" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <FolderIcon className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-300 font-medium mb-1">No projects found</p>
          <p className="text-gray-500 text-sm mb-6">Create your first project to get started with DevTrack</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <PlusIcon className="w-4 h-4" /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onDelete={() => deleteMutation.mutate(project._id)}
              onSelect={() => setCurrentProject(project)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal title="Create New Project" onClose={() => { setShowCreate(false); resetForm() }}>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-4">
            <div>
              <label className="input-label">Project Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="input"
                placeholder="e.g. Hospital Management System"
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Project Key *</label>
                <input
                  type="text"
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value.toUpperCase().slice(0, 10) })}
                  className="input uppercase"
                  placeholder="HMS"
                  required
                />
              </div>
              <div>
                <label className="input-label">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>
            <div>
              <label className="input-label">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input resize-none"
                rows={2}
                placeholder="Brief project description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Budget ($)</label>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="input"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="input-label">Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="input-label">Technology Stack</label>
              <input
                type="text"
                value={form.technology}
                onChange={(e) => setForm({ ...form, technology: e.target.value })}
                className="input"
                placeholder="React, Node.js, MongoDB..."
              />
            </div>
            <div>
              <label className="input-label">Project Color</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowCreate(false); resetForm() }} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
                {createMutation.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

const ProjectCard = ({ project, onDelete, onSelect }) => (
  <div className="card p-5 hover:border-gray-700 transition-colors group">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: project.color || '#6366f1' }}
        >
          {project.key?.slice(0, 2)}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{project.name}</p>
          <p className="text-xs text-gray-500">{project.key}</p>
        </div>
      </div>
      <button
        onClick={(e) => { e.preventDefault(); onDelete() }}
        className="btn-ghost btn-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>

    <p className="text-xs text-gray-400 mb-3 line-clamp-2 min-h-[2rem]">
      {project.description || 'No description provided'}
    </p>

    <div className="mb-3">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>{project.completedStories} / {project.totalStories} stories done</span>
        <span className="font-medium text-white">{project.completionPercentage}%</span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill ${getProgressColor(project.completionPercentage)}`}
          style={{ width: `${project.completionPercentage}%` }}
        />
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {project.jiraConnected && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800">Jira</span>
        )}
        {project.githubConnected && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">GitHub</span>
        )}
      </div>
      <Link
        to={`/projects/${project._id}`}
        onClick={onSelect}
        className="btn-primary btn-sm text-xs"
      >
        Open →
      </Link>
    </div>
  </div>
)

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-lg card p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button onClick={onClose} className="btn-ghost btn-sm p-1">✕</button>
      </div>
      {children}
    </div>
  </div>
)
