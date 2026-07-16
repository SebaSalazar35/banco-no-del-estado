import { useState } from 'react'
import { transferMoney } from '../services/transferService'
import { translateErrorMessage } from '../utils/formatters'
import { formatRut } from '../utils/rut'
import { validarTransferencia } from '../utils/validaciones'
import ErrorMessage from './ErrorMessage'

export default function TransferForm({ user, profile }) {
  const [destinatarioRut, setDestinatarioRut] = useState('')
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleDestinatarioChange = (event) => {
    setDestinatarioRut(event.target.value)
    setError(null)
    setSuccessMessage(null)
  }

  const handleDestinatarioBlur = () => {
    if (destinatarioRut.trim()) {
      setDestinatarioRut(formatRut(destinatarioRut))
    }
  }

  const handleAmountChange = (event) => {
    setMonto(event.target.value)
    setError(null)
    setSuccessMessage(null)
  }

  const handleDescripcionChange = (event) => {
    setDescripcion(event.target.value)
  }

  const handleTransferSubmit = async (event) => {
    event.preventDefault()

    const validacion = validarTransferencia({
      monto,
      saldo: profile.saldo,
      destinatarioRut,
      emisorRut: profile.rut,
    })

    if (!validacion.ok) {
      setError(validacion.error)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await transferMoney({
        emisorUid: user.uid,
        emisorRut: profile.rut,
        destinatarioRut: validacion.destinatarioRut,
        monto: validacion.monto,
        descripcion,
      })

      setDestinatarioRut('')
      setMonto('')
      setDescripcion('')
      setSuccessMessage('Transferencia realizada con éxito.')
    } catch (transferError) {
      setError(translateErrorMessage(transferError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="panel">
      <h3>Transferir dinero</h3>
      <p className="panel-description">Envía fondos a otro usuario usando su RUT.</p>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      {successMessage && (
        <div className="alert alert-success" role="status">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleTransferSubmit} noValidate>
        <label htmlFor="transfer-rut">RUT del destinatario</label>
        <input
          id="transfer-rut"
          type="text"
          value={destinatarioRut}
          onChange={handleDestinatarioChange}
          onBlur={handleDestinatarioBlur}
          placeholder="12.345.678-9"
        />

        <label htmlFor="transfer-amount">Monto</label>
        <input
          id="transfer-amount"
          type="number"
          min="1"
          step="1"
          value={monto}
          onChange={handleAmountChange}
          placeholder="10000"
        />

        <label htmlFor="transfer-description">Descripción (opcional)</label>
        <input
          id="transfer-description"
          type="text"
          value={descripcion}
          onChange={handleDescripcionChange}
          placeholder="Ej: Pago de almuerzo"
        />

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Transfiriendo...' : 'Transferir'}
        </button>
      </form>
    </section>
  )
}
