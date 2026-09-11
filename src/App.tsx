import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import { isFirstRun } from './crypto/vault'
import LockScreen from './pages/LockScreen'
import Settings from './pages/Settings'
import ToolsHome from './pages/ToolsHome'
import Welcome from './pages/Welcome'
import { JournalProvider, useJournalContext, useToolData } from './store/journal'
import { getPeriodKey } from './tools/periodicity'
import { registry } from './tools/registry'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { key } = useJournalContext()
  const location = useLocation()

  if (!key && location.pathname !== '/lock' && location.pathname !== '/welcome') {
    return <Navigate to={isFirstRun() ? '/welcome' : '/lock'} replace />
  }
  return <>{children}</>
}

function ToolRoute({ toolId }: { toolId: string }) {
  const { t } = useTranslation()
  const tool = registry.find((tool) => tool.id === toolId)!
  const [offset, setOffset] = useState(0)
  const periodKey = getPeriodKey(tool.periodicity, new Date(), offset)
  const [data] = useToolData(tool)

  const ToolComponent = tool.component
  return (
    <Layout
      title={t(tool.name)}
      periodicity={tool.periodicity}
      periodKey={periodKey}
      onPeriodChange={setOffset}
      periodOffset={offset}
      entryData={data}
    >
      <ToolComponent periodKey={periodKey} />
    </Layout>
  )
}

function AppRoutes() {
  const { t } = useTranslation()
  const { key } = useJournalContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (key) navigate('/', { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Routes>
      <Route path="/lock" element={<LockScreen />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route
        path="/"
        element={
          <AuthGate>
            <Layout title={t('lock.app_name')} periodicity="ongoing" periodKey={null} onPeriodChange={() => {}} periodOffset={0}>
              <ToolsHome />
            </Layout>
          </AuthGate>
        }
      />
      <Route
        path="/settings"
        element={
          <AuthGate>
            <Layout title={t('nav.settings')} periodicity="ongoing" periodKey={null} onPeriodChange={() => {}} periodOffset={0}>
              <Settings />
            </Layout>
          </AuthGate>
        }
      />
      {registry.map((tool) => (
        <Route
          key={tool.id}
          path={tool.route}
          element={
            <AuthGate>
              <ToolRoute toolId={tool.id} />
            </AuthGate>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <JournalProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </JournalProvider>
  )
}
