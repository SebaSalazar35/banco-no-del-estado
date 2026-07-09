import { useAuth } from '../context/AuthContext'
import { useMovements } from '../hooks/useMovements'
import { useTheme } from '../hooks/useTheme'
import { useUserProfile } from '../hooks/useUserProfile'
import BalanceCard from './BalanceCard'
import DepositWithdrawForm from './DepositWithdrawForm'
import ErrorMessage from './ErrorMessage'
import LoadingSpinner from './LoadingSpinner'
import MovementHistory from './MovementHistory'
import TransferForm from './TransferForm'

export default function Dashboard() {
  const { user, handleLogout, error: authError } = useAuth()
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(user?.uid)
  const { movements, loading: movementsLoading, error: movementsError } = useMovements(user?.uid)
  const { theme, toggleTheme } = useTheme()

  if (!user) {
    return null
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="brand-header compact">
          <div className="brand-logo" aria-hidden="true">BNE</div>
          <div>
            <h1>Banco No del Estado</h1>
            <p>Panel de cliente</p>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" className="btn btn-secondary" onClick={toggleTheme}>
            Modo {theme === 'dark' ? 'claro' : 'oscuro'}
          </button>
          <button type="button" className="btn btn-danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {authError && <ErrorMessage message={authError} />}

      <BalanceCard profile={profile} loading={profileLoading} error={profileError} />

      {profileLoading && !profile ? (
        <LoadingSpinner message="Preparando tu panel principal..." />
      ) : profile ? (
        <>
          <div className="dashboard-grid">
            <TransferForm user={user} profile={profile} />
            <DepositWithdrawForm uid={user.uid} profile={profile} />
          </div>

          <MovementHistory
            movements={movements}
            loading={movementsLoading}
            error={movementsError}
            currentUid={user.uid}
          />
        </>
      ) : null}
    </div>
  )
}
