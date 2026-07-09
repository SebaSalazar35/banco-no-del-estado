import { useState } from 'react'
import { adjustBalance } from '../services/userService'
import { translateErrorMessage } from '../utils/formatters'
import ErrorMessage from './ErrorMessage'

export default function DepositWithdrawForm({ uid, profile }) {
  const [monto, setMonto] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleAmountChange = (event) => {
    setMonto(event.target.value)
    setError(null)
    setSuccessMessage(null)
  }

  const validateAmount = () => {
    const montoNumerico = Number(monto)

    if (Number.isNaN(montoNumerico) || montoNumerico <= 0) {
      setError('El monto debe ser mayor a 0.')
      return null
    }

    return montoNumerico
  }

  const handleDepositClick = async () => {
    const montoNumerico = validateAmount()
    if (!montoNumerico) {
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await adjustBalance(uid, profile.rut, montoNumerico, 'deposito')
      setMonto('')
      setSuccessMessage('Depósito simulado realizado con éxito.')
    } catch (depositError) {
      setError(translateErrorMessage(depositError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWithdrawClick = async () => {
    const montoNumerico = validateAmount()
    if (!montoNumerico) {
      return
    }

    if (montoNumerico > profile.saldo) {
      setError('Saldo insuficiente para realizar el retiro.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await adjustBalance(uid, profile.rut, -montoNumerico, 'retiro')
      setMonto('')
      setSuccessMessage('Retiro simulado realizado con éxito.')
    } catch (withdrawError) {
      setError(translateErrorMessage(withdrawError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="panel">
      <h3>Depósito / Retiro simulado</h3>
      <p className="panel-description">Funcionalidad adicional para ajustar saldo localmente.</p>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      {successMessage && (
        <div className="alert alert-success" role="status">
          {successMessage}
        </div>
      )}

      <label htmlFor="adjust-amount">Monto</label>
      <input
        id="adjust-amount"
        type="number"
        min="1"
        step="1"
        value={monto}
        onChange={handleAmountChange}
        placeholder="5000"
      />

      <div className="button-row">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleDepositClick}
          disabled={isSubmitting}
        >
          Depositar
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleWithdrawClick}
          disabled={isSubmitting}
        >
          Retirar
        </button>
      </div>
    </section>
  )
}
