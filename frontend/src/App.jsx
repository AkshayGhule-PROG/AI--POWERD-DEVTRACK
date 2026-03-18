import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import HomePage from '@/pages/Home'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import ResetPasswordPage from '@/pages/ResetPassword'
import AuthCallbackPage from '@/pages/AuthCallback'
import VerifyEmailPage from '@/pages/VerifyEmail'
import DashboardPage from '@/pages/Dashboard'
import ProjectsPage from '@/pages/Projects'
import ProjectDetailPage from '@/pages/ProjectDetail'
import StoriesPage from '@/pages/Stories'
import DocumentsPage from '@/pages/Documents'
import SettingsPage from '@/pages/Settings'
import SprintsPage from '@/pages/Sprints'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { token } = useAuthStore()
  return !token ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Password reset — public, no auth needed */}
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Email verification — public */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* OAuth callback — handles token from backend redirect */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Protected app */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="projects/:id/stories" element={<StoriesPage />} />
        <Route path="projects/:id/documents" element={<DocumentsPage />} />
        <Route path="projects/:id/sprints" element={<SprintsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
