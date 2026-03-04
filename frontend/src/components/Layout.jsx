import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  HomeIcon, FolderIcon, DocumentTextIcon, CogIcon, ArrowRightOnRectangleIcon,
  BellIcon, ChevronUpDownIcon, Bars3Icon, XMarkIcon,
  RocketLaunchIcon, CodeBracketIcon, ChartBarIcon, BoltIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useProjectStore } from '@/store/projectStore'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { currentProject } = useProjectStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f5f7fa' }}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '220px', background: '#ffffff', borderRight: '1px solid #e5e7eb', flexShrink: 0 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-[18px]"
             style={{ borderBottom: '1px solid #e5e7eb' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 0 12px rgba(99,102,241,0.25)' }}>
            <BoltIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-gray-900">Dev<span className="text-primary-600">Track</span></span>
          <button className="ml-auto lg:hidden text-gray-400 hover:text-gray-700" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
          <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <HomeIcon className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FolderIcon className="w-4 h-4 shrink-0" />
            <span>Projects</span>
          </NavLink>

          {currentProject && (
            <div className="pt-4 pb-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                 style={{ color: '#9ca3af' }}>
                {currentProject.name.length > 18 ? currentProject.name.slice(0, 18) + '…' : currentProject.name}
              </p>
              <NavLink to={`/projects/${currentProject._id}`} end
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                <ChartBarIcon className="w-4 h-4 shrink-0" />
                <span>Overview</span>
              </NavLink>
              <NavLink to={`/projects/${currentProject._id}/stories`}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                <RocketLaunchIcon className="w-4 h-4 shrink-0" />
                <span>Stories</span>
              </NavLink>
              <NavLink to={`/projects/${currentProject._id}/documents`}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                <DocumentTextIcon className="w-4 h-4 shrink-0" />
                <span>Documents</span>
              </NavLink>
              <NavLink to={`/projects/${currentProject._id}/sprints`}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                <CodeBracketIcon className="w-4 h-4 shrink-0" />
                <span>Sprints</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Bottom nav */}
        <div className="px-2 pb-2 space-y-0.5" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
          <NavLink to="/settings" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <CogIcon className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </NavLink>
          <button onClick={logout}
            className="sidebar-item w-full text-left"
            style={{ color: '#dc2626' }}
            onMouseEnter={e => e.currentTarget.style.color = '#b91c1c'}
            onMouseLeave={e => e.currentTarget.style.color = '#dc2626'}
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User chip */}
        <div className="px-3 py-3 flex items-center gap-2.5"
             style={{ borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
               style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-gray-800 truncate">{user?.name}</p>
            <p className="text-[11px] text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <ChevronUpDownIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-12 flex items-center px-4 gap-3 shrink-0"
                style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #e5e7eb' }}>
          <button className="lg:hidden text-gray-400 hover:text-gray-700 transition-colors"
                  onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <BellIcon className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                 style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="hidden md:block text-sm text-gray-600">{user?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#f5f7fa' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
