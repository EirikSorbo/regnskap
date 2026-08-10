import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { AccountingProvider } from './context/AccountingContext'
import { PanelsProvider } from './context/PanelsContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppLayout } from './components/AppLayout'

const RELOAD_KEY = 'chunk-reload'

/** Rutene lastes on-demand (code-splitting), så oppstartsbunten ikke bærer alle
 *  sidene på én gang. Vite lager en egen chunk per side.
 *
 *  Filnavnene inneholder en hash, og tjenestearbeideren oppdaterer seg selv.
 *  Står appen åpen på telefonen når en ny versjon deployes, ber den derfor om en
 *  chunk som ikke finnes lenger, og du får blank skjerm. Her fanger vi den
 *  feilen og laster siden på nytt én gang. Flagget i sessionStorage hindrer at
 *  en varig feil blir en evig omlastingssløyfe. */
function lazyPage<T extends ComponentType<object>>(factory: () => Promise<{ default: T }>) {
  return lazy(() => factory()
    .then((mod) => { sessionStorage.removeItem(RELOAD_KEY); return mod })
    .catch((err) => {
      if (!sessionStorage.getItem(RELOAD_KEY)) {
        sessionStorage.setItem(RELOAD_KEY, '1')
        window.location.reload()
        return new Promise<{ default: T }>(() => {})  // henger til omlastingen tar over
      }
      throw err
    }))
}

const LoginPage = lazyPage(() => import('./pages/LoginPage'))
const DashboardPage = lazyPage(() => import('./pages/DashboardPage'))
const AddReceiptPage = lazyPage(() => import('./pages/AddReceiptPage'))
const ReportPage = lazyPage(() => import('./pages/ReportPage'))
const InvoiceListPage = lazyPage(() => import('./pages/InvoiceListPage'))
const InvoiceEditPage = lazyPage(() => import('./pages/InvoiceEditPage'))
const InvoiceViewPage = lazyPage(() => import('./pages/InvoiceViewPage'))

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
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            {/* Regnskapet og panelene ligger over rutene, ikke inni forsiden,
                slik at samme topp kan åpne dem fra alle sidene. */}
            <AccountingProvider>
              <PanelsProvider>
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

                    {/* Sidene som deler topp. Toppen tegnes én gang, i AppLayout. */}
                    <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/fakturaer" element={<InvoiceListPage />} />
                      <Route path="/faktura/ny" element={<InvoiceEditPage />} />
                      <Route path="/faktura/:id/rediger" element={<InvoiceEditPage />} />
                    </Route>

                    {/* Egen topp: skjemaflyt og de to utskriftsvisningene. */}
                    <Route path="/add" element={<PrivateRoute><AddReceiptPage /></PrivateRoute>} />
                    <Route path="/rapport" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
                    <Route path="/faktura/:id" element={<PrivateRoute><InvoiceViewPage /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </PanelsProvider>
            </AccountingProvider>
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
