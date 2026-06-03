import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AddReceiptPage from './pages/AddReceiptPage'
import ReportPage from './pages/ReportPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Laster...</div>
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Laster...</div>
  return !user ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/add" element={<PrivateRoute><AddReceiptPage /></PrivateRoute>} />
          <Route path="/rapport" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}
