import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MovementHistory from '../../src/components/MovementHistory'

const CURRENT_UID = 'user-1'

const movementsFixture = [
  {
    id: 'm1',
    tipo: 'transferencia',
    emisorUid: 'user-1',
    receptorUid: 'user-2',
    emisorRut: '11111111-1',
    receptorRut: '22222222-2',
    monto: 5000,
    descripcion: 'Almuerzo',
    fecha: new Date('2026-01-01T10:00:00'),
  },
  {
    id: 'm2',
    tipo: 'transferencia',
    emisorUid: 'user-2',
    receptorUid: 'user-1',
    emisorRut: '22222222-2',
    receptorRut: '11111111-1',
    monto: 12000,
    descripcion: 'Devolución',
    fecha: new Date('2026-03-15T12:00:00'),
  },
  {
    id: 'm3',
    tipo: 'transferencia',
    emisorUid: 'user-1',
    receptorUid: 'user-3',
    emisorRut: '11111111-1',
    receptorRut: '33333333-3',
    monto: 3000,
    descripcion: 'Taxi',
    fecha: new Date('2026-02-10T09:00:00'),
  },
]

describe('MovementHistory', () => {
  it('muestra estado vacío cuando no hay movimientos', () => {
    // Arrange / Act
    render(
      <MovementHistory
        movements={[]}
        loading={false}
        error={null}
        currentUid={CURRENT_UID}
      />,
    )

    // Assert
    expect(
      screen.getByText(/aún no tienes movimientos/i),
    ).toBeInTheDocument()
  })

  it('renderiza movimientos ordenados del más reciente al más antiguo', () => {
    // Arrange / Act
    render(
      <MovementHistory
        movements={movementsFixture}
        loading={false}
        error={null}
        currentUid={CURRENT_UID}
      />,
    )

    // Assert
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(within(items[0]).getByText(/devolución/i)).toBeInTheDocument()
    expect(within(items[1]).getByText(/taxi/i)).toBeInTheDocument()
    expect(within(items[2]).getByText(/almuerzo/i)).toBeInTheDocument()
  })

  it('distingue envíos de recepciones', () => {
    // Arrange / Act
    render(
      <MovementHistory
        movements={movementsFixture}
        loading={false}
        error={null}
        currentUid={CURRENT_UID}
      />,
    )

    // Assert
    expect(screen.getAllByText('Envío')).toHaveLength(2)
    expect(screen.getByText('Recepción')).toBeInTheDocument()
  })
})
