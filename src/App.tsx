import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'

// Rutene lastes on-demand (code-splitting), så oppstartsbunten ikke bærer alle
// sidene på én gang. Vite lager en egen chunk per side.
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AddReceiptPage = lazy(() => import('./pages/AddReceiptPage'))
const ReportPage = lazy(() => import('./pages/ReportPage'))
const InvoiceListPage = lazy(() => import('./pages/InvoiceListPage'))
const InvoiceEditPage = lazy(() => import('./pages/InvoiceEditPage'))
const InvoiceViewPage = lazy(() => import('./pages/InvoiceViewPage'))

function Loading() {
  return <div className="min-h-screen flex items-center justify-center text-slate-400">Laster...</div>
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  return !user ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/add" element={<PrivateRoute><AddReceiptPage /></PrivateRoute>} />
            <Route path="/rapport" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
            <Route path="/fakturaer" element={<PrivateRoute><InvoiceListPage /></PrivateRoute>} />
            <Route path="/faktura/ny" element={<PrivateRoute><InvoiceEditPage /></PrivateRoute>} />
            <Route path="/faktura/:id" element={<PrivateRoute><InvoiceViewPage /></PrivateRoute>} />
            <Route path="/faktura/:id/rediger" element={<PrivateRoute><InvoiceEditPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}
