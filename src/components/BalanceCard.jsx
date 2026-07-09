import { formatCurrency } from '../utils/formatters'
import { formatRut } from '../utils/rut'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

export default function BalanceCard({ profile, loading, error }) {
  if (loading) {
    return (
      <section className="panel balance-panel">
        <LoadingSpinner message="Actualizando saldo..." />
      </section>
    )
  }

  if (error) {
    return (
      <section className="panel balance-panel">
        <ErrorMessage message={error} />
      </section>
    )
  }

  if (!profile) {
    return (
      <section className="panel balance-panel">
        <ErrorMessage message="No se encontró información de la cuenta." />
      </section>
    )
  }

  return (
    <section className="panel balance-panel balance-panel-highlight">
      <p className="panel-label">Saldo disponible</p>
      <h2 className="balance-amount">{formatCurrency(profile.saldo)}</h2>
      <p className="balance-user">Hola, {profile.nombre}</p>
      <p className="balance-email">RUT: {formatRut(profile.rut)}</p>
    </section>
  )
}
