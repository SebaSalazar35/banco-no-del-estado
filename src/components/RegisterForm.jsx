import { useState } from 'react'
import { registerUser } from '../services/authService'
import { getFirebaseErrorMessage } from '../utils/formatters'
import { formatRut, getRutValidationMessage } from '../utils/rut'
import ErrorMessage from './ErrorMessage'

export default function RegisterForm({ onSwitchToLogin }) {
  const [nombre, setNombre] = useState('')
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleNombreChange = (event) => {
    setNombre(event.target.value)
    setError(null)
  }

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

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value)
    setError(null)
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()

    if (!nombre.trim()) {
      setError('Debes ingresar tu nombre.')
      return
    }

    const rutError = getRutValidationMessage(rut)
    if (rutError) {
      setError(rutError)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await registerUser(nombre.trim(), rut, password)
    } catch (registerError) {
      setError(getFirebaseErrorMessage(registerError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <h2>Crear cuenta</h2>
      <p className="auth-subtitle">Saldo inicial de $100.000 al registrarte</p>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      <form onSubmit={handleRegisterSubmit} noValidate>
        <label htmlFor="register-name">Nombre completo</label>
        <input
          id="register-name"
          type="text"
          value={nombre}
          onChange={handleNombreChange}
          placeholder="Tu nombre"
          autoComplete="name"
        />

        <label htmlFor="register-rut">RUT</label>
        <input
          id="register-rut"
          type="text"
          value={rut}
          onChange={handleRutChange}
          onBlur={handleRutBlur}
          placeholder="12.345.678-9"
          autoComplete="username"
        />

        <label htmlFor="register-password">Contraseña</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
        />

        <label htmlFor="register-confirm-password">Confirmar contraseña</label>
        <input
          id="register-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
        />

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes cuenta?{' '}
        <button type="button" className="link-button" onClick={onSwitchToLogin}>
          Inicia sesión
        </button>
      </p>
    </section>
  )
}
