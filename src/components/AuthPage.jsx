import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function AuthPage() {
  const [authMode, setAuthMode] = useState('login')

  const handleSwitchToRegister = () => {
    setAuthMode('register')
  }

  const handleSwitchToLogin = () => {
    setAuthMode('login')
  }

  return (
    <main className="auth-layout">
      <header className="brand-header">
        <div className="brand-logo" aria-hidden="true">BNE</div>
        <div>
          <h1>Banco No del Estado</h1>
          <p>Banca en línea para personas</p>
        </div>
      </header>

      {authMode === 'login' ? (
        <LoginForm onSwitchToRegister={handleSwitchToRegister} />
      ) : (
        <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
      )}
    </main>
  )
}
