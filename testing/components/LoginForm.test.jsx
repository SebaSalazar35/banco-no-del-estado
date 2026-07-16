import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginForm from '../../src/components/LoginForm'

vi.mock('../../src/services/authService', () => ({
  loginUser: vi.fn(),
}))

import { loginUser } from '../../src/services/authService'

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('no llama al servicio de autenticación con campos vacíos', async () => {
    // Arrange
    const userEvt = userEvent.setup()
    render(<LoginForm onSwitchToRegister={vi.fn()} />)

    // Act
    await userEvt.click(screen.getByRole('button', { name: /ingresar/i }))

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(/debes ingresar tu rut/i)
    expect(loginUser).not.toHaveBeenCalled()
  })

  it('no llama al servicio si falta la contraseña', async () => {
    // Arrange
    const userEvt = userEvent.setup()
    render(<LoginForm onSwitchToRegister={vi.fn()} />)

    // Act
    await userEvt.type(screen.getByLabelText(/^rut$/i), '11.111.111-1')
    await userEvt.click(screen.getByRole('button', { name: /ingresar/i }))

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /debes ingresar tu contraseña/i,
    )
    expect(loginUser).not.toHaveBeenCalled()
  })

  it('muestra mensaje de error cuando el servicio rechaza las credenciales', async () => {
    // Arrange
    const userEvt = userEvent.setup()
    loginUser.mockRejectedValue({ code: 'auth/invalid-credential' })
    render(<LoginForm onSwitchToRegister={vi.fn()} />)

    // Act
    await userEvt.type(screen.getByLabelText(/^rut$/i), '11.111.111-1')
    await userEvt.type(screen.getByLabelText(/contraseña/i), 'clave-incorrecta')
    await userEvt.click(screen.getByRole('button', { name: /ingresar/i }))

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /rut o contraseña incorrectos/i,
    )
    expect(loginUser).toHaveBeenCalledTimes(1)
    expect(loginUser).toHaveBeenCalledWith('11.111.111-1', 'clave-incorrecta')
  })

  it('llama al servicio de login con RUT y contraseña válidos', async () => {
    // Arrange
    const userEvt = userEvent.setup()
    loginUser.mockResolvedValue({ uid: 'user-1' })
    render(<LoginForm onSwitchToRegister={vi.fn()} />)

    // Act
    await userEvt.type(screen.getByLabelText(/^rut$/i), '11.111.111-1')
    await userEvt.type(screen.getByLabelText(/contraseña/i), 'Test1234')
    await userEvt.click(screen.getByRole('button', { name: /ingresar/i }))

    // Assert
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('11.111.111-1', 'Test1234')
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
