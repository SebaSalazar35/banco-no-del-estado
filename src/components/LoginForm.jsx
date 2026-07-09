import { useState } from 'react'
import { loginUser } from '../services/authService'
import { getFirebaseErrorMessage } from '../utils/formatters'
import { formatRut, getRutValidationMessage } from '../utils/rut'
import ErrorMessage from './ErrorMessage'

export default function LoginForm({ onSwitchToRegister }) {
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleRutChange = (event) => {
    setRut(event.target.value)
    setError(null)
  }

  const handleRutBlur = () => {
    if (rut.trim()) {
      setRut(formatRut(rut))
    }
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
    setError(null)
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()

    const rutError = getRutValidationMessage(rut)
    if (rutError) {
      setError(rutError)
      return
    }

    if (!password.trim()) {
      setError('Debes ingresar tu contraseña.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await loginUser(rut, password)
    } catch (loginError) {
      setError(getFirebaseErrorMessage(loginError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <h2>Iniciar sesión</h2>
      <p className="auth-subtitle">Accede con tu RUT y contraseña</p>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      <form onSubmit={handleLoginSubmit} noValidate>
        <label htmlFor="login-rut">RUT</label>
        <input
          id="login-rut"
          type="text"
          value={rut}
          onChange={handleRutChange}
          onBlur={handleRutBlur}
          placeholder="12.345.678-9"
          autoComplete="username"
        />

        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="auth-switch">
        ¿No tienes cuenta?{' '}
        <button type="button" className="link-button" onClick={onSwitchToRegister}>
          Regístrate aquí
        </button>
      </p>
    </section>
  )
}
