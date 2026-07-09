import { useMemo, useState } from 'react'
import {
  formatDate,
  formatSignedCurrency,
  getMovementInfo,
} from '../utils/formatters'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

const FILTER_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'enviados', label: 'Enviados' },
  { value: 'recibidos', label: 'Recibidos' },
]

export default function MovementHistory({ movements, loading, error, currentUid }) {
  const [filterType, setFilterType] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

  const handleFilterChange = (event) => {
    setFilterType(event.target.value)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const info = getMovementInfo(movement, currentUid)

      if (filterType === 'enviados' && !info.isOutgoing) {
        return false
      }

      if (filterType === 'recibidos' && !info.isIncoming) {
        return false
      }

      if (!searchTerm.trim()) {
        return true
      }

      const normalizedSearch = searchTerm.trim().toLowerCase()

      return (
        info.counterparty.toLowerCase().includes(normalizedSearch) ||
        info.label.toLowerCase().includes(normalizedSearch) ||
        movement.descripcion?.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [movements, filterType, searchTerm, currentUid])

  const emptyMessage = useMemo(() => {
    if (movements.length === 0) {
      return 'Aún no tienes movimientos. Realiza una transferencia para ver tu historial.'
    }

    if (searchTerm.trim() || filterType !== 'todos') {
      return 'No hay movimientos que coincidan con tu búsqueda o filtro.'
    }

    return 'No hay movimientos para mostrar.'
  }, [movements.length, searchTerm, filterType])

  return (
    <section className="panel movement-panel">
      <div className="panel-header">
        <div>
          <h3>Historial de movimientos</h3>
          <p className="panel-description">
            {loading
              ? 'Cargando transacciones...'
              : `${filteredMovements.length} movimiento${filteredMovements.length === 1 ? '' : 's'} · actualizado en tiempo real`}
          </p>
        </div>
      </div>

      <div className="filters-row">
        <label htmlFor="movement-filter">Filtrar por tipo</label>
        <select id="movement-filter" value={filterType} onChange={handleFilterChange}>
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor="movement-search">Buscar RUT o descripción</label>
        <input
          id="movement-search"
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="RUT o descripción"
        />
      </div>

      {loading && <LoadingSpinner message="Cargando movimientos..." />}

      {!loading && error && <ErrorMessage message={error} />}

      {!loading && !error && filteredMovements.length === 0 && (
        <p className="empty-state">{emptyMessage}</p>
      )}

      {!loading && !error && filteredMovements.length > 0 && (
        <>
          <div className="movement-table-header" aria-hidden="true">
            <span>Tipo / Contraparte</span>
            <span>Monto</span>
            <span>Fecha</span>
          </div>

          <ul className="movement-list">
            {filteredMovements.map((movement) => {
              const info = getMovementInfo(movement, currentUid)

              return (
                <li
                  key={movement.id}
                  className={`movement-item ${info.variant}`}
                >
                  <div className="movement-main">
                    <p className="movement-type">{info.label}</p>
                    <p className="movement-counterparty">{info.counterparty}</p>
                    {movement.descripcion && (
                      <p className="movement-description">{movement.descripcion}</p>
                    )}
                  </div>

                  <div className="movement-amount">
                    <strong className={info.variant}>
                      {formatSignedCurrency(info.signedAmount)}
                    </strong>
                  </div>

                  <div className="movement-date">
                    <span>{formatDate(movement.fecha)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
