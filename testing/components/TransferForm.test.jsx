import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TransferForm from '../../src/components/TransferForm'

vi.mock('../../src/services/transferService', () => ({
  transferMoney: vi.fn(),
}))

import { transferMoney } from '../../src/services/transferService'

const user = { uid: 'user-emisor' }
const profile = { rut: '11.111.111-1', saldo: 100000 }

describe('TransferForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza los campos y el botón de enviar', () => {
    // Arrange / Act
    render(<TransferForm user={user} profile={profile} />)

    // Assert
    expect(screen.getByLabelText(/rut del destinatario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^monto$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /transferir/i })).toBeInTheDocument()
  })

  it('muestra error con monto inválido y no llama al servicio', async () => {
    // Arrange
    const userEvt = userEvent.setup()
    render(<TransferForm user={user} profile={profile} />)

    // Act
    await userEvt.type(screen.getByLabelText(/rut del destinatario/i), '22.222.222-2')
    await userEvt.type(screen.getByLabelText(/^monto$/i), '-50000')
    await userEvt.click(screen.getByRole('button', { name: /transferir/i }))

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /el monto no puede ser negativo/i,
    )
    expect(transferMoney).not.toHaveBeenCalled()
  })

  it('llama al servicio una vez con argumentos correctos cuando los datos son válidos', async () => {
    // Arrange
    const userEvt = userEvent.setup()
    transferMoney.mockResolvedValue(undefined)
    render(<TransferForm user={user} profile={profile} />)

    // Act
    await userEvt.type(screen.getByLabelText(/rut del destinatario/i), '22.222.222-2')
    await userEvt.type(screen.getByLabelText(/^monto$/i), '10000')
    await userEvt.type(screen.getByLabelText(/descripción/i), 'Pago prueba')
    await userEvt.click(screen.getByRole('button', { name: /transferir/i }))

    // Assert
    await waitFor(() => {
      expect(transferMoney).toHaveBeenCalledTimes(1)
    })
    expect(transferMoney).toHaveBeenCalledWith({
      emisorUid: 'user-emisor',
      emisorRut: '11.111.111-1',
      destinatarioRut: '22222222-2',
      monto: 10000,
      descripcion: 'Pago prueba',
    })
    expect(await screen.findByRole('status')).toHaveTextContent(
      /transferencia realizada con éxito/i,
    )
  })

  it('deshabilita el botón mientras la transferencia está en curso', async () => {
    // Arrange
    const userEvt = userEvent.setup()
    let resolver
    transferMoney.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolver = resolve
        }),
    )
    render(<TransferForm user={user} profile={profile} />)

    // Act
    await userEvt.type(screen.getByLabelText(/rut del destinatario/i), '22.222.222-2')
    await userEvt.type(screen.getByLabelText(/^monto$/i), '5000')
    await userEvt.click(screen.getByRole('button', { name: /transferir/i }))

    // Assert
    const boton = screen.getByRole('button', { name: /transfiriendo/i })
    expect(boton).toBeDisabled()

    resolver()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /transferir/i })).toBeEnabled()
    })
  })

  it('muestra error cuando el servicio mockeado rechaza la transferencia', async () => {
    // Arrange
    const userEvt = userEvent.setup()
    transferMoney.mockRejectedValue(new Error('No existe un usuario con ese RUT.'))
    render(<TransferForm user={user} profile={profile} />)

    // Act
    await userEvt.type(screen.getByLabelText(/rut del destinatario/i), '22.222.222-2')
    await userEvt.type(screen.getByLabelText(/^monto$/i), '1000')
    await userEvt.click(screen.getByRole('button', { name: /transferir/i }))

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /no existe un usuario con ese rut/i,
    )
    expect(transferMoney).toHaveBeenCalledTimes(1)
  })
})
