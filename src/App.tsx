import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useOrgState, OrgContext } from './hooks/useOrg'
import { AuthScreen } from './screens/AuthScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { PipelineScreen } from './screens/PipelineScreen'
import { ItemDetailScreen } from './screens/ItemDetailScreen'
import { NewItemScreen } from './screens/intake/NewItemScreen'
import { StageListScreen } from './screens/StageListScreen'
import { ArtifactScreen } from './screens/ArtifactScreen'
import { Spinner } from './components/ui'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
      <Spinner />
    </div>
  )
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function RequireOrg({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const orgState = useOrgState(user?.id)
  if (orgState.loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
      <Spinner />
    </div>
  )
  if (!orgState.org) return <Navigate to="/onboarding" replace />
  return (
    <OrgContext.Provider value={orgState}>
      {children}
    </OrgContext.Provider>
  )
}

function AuthCallback() {
  return <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PipelineScreen />} />
      <Route path="/intake" element={<StageListScreen stage="intake" />} />
      <Route path="/intake/new" element={<NewItemScreen />} />
      <Route path="/discovery" element={<StageListScreen stage="discovery" />} />
      <Route path="/shaping" element={<StageListScreen stage="shaping" />} />
      <Route path="/delivery" element={<StageListScreen stage="delivery" />} />
      <Route path="/live" element={<StageListScreen stage="live" />} />
      <Route path="/retirement" element={<StageListScreen stage="retirement" />} />
      <Route path="/items/:id" element={<ItemDetailScreen />} />
      <Route path="/items/:id/artifacts/:artifactPath" element={<ArtifactScreen />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={
          <RequireAuth><OnboardingScreen /></RequireAuth>
        } />
        <Route path="/*" element={
          <RequireAuth>
            <RequireOrg>
              <AppRoutes />
            </RequireOrg>
          </RequireAuth>
        } />
      </Routes>
    </BrowserRouter>
  )
}
