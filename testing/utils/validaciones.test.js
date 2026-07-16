import { describe, expect, it } from 'vitest'
import {
  validarDestinatario,
  validarMonto,
  validarTransferencia,
} from '../../src/utils/validaciones'

const EMISOR_RUT = '11.111.111-1'
const DESTINATARIO_RUT = '22.222.222-2'

describe('validarMonto', () => {
  it.each([
    ['-1000', 'El monto no puede ser negativo.'],
    ['0', 'El monto debe ser mayor a 0.'],
    ['', 'El monto debe ser mayor a 0.'],
    ['abc', 'El monto debe ser un número válido.'],
    ['10.50', 'El monto no puede tener decimales.'],
    ['10,5', 'El monto debe ser un número válido.'],
  ])('rechaza monto inválido (%s)', (monto, mensajeEsperado) => {
    // Arrange
    const entrada = monto

    // Act
    const resultado = validarMonto(entrada)

    // Assert
    expect(resultado.ok).toBe(false)
    expect(resultado.error).toBe(mensajeEsperado)
  })

  it('acepta un monto entero positivo', () => {
    // Arrange
    const monto = '15000'

    // Act
    const resultado = validarMonto(monto)

    // Assert
    expect(resultado).toEqual({ ok: true, monto: 15000 })
  })
})

describe('validarDestinatario', () => {
  it('rechaza destinatario vacío', () => {
    // Arrange / Act
    const resultado = validarDestinatario('', EMISOR_RUT)

    // Assert
    expect(resultado.ok).toBe(false)
    expect(resultado.error).toBe('Debes ingresar un RUT de destinatario válido.')
  })

  it('rechaza destinatario con RUT inválido', () => {
    // Arrange / Act
    const resultado = validarDestinatario('12.345.678-0', EMISOR_RUT)

    // Assert
    expect(resultado.ok).toBe(false)
    expect(resultado.error).toBe('Debes ingresar un RUT de destinatario válido.')
  })

  it('rechaza transferencia a uno mismo', () => {
    // Arrange / Act
    const resultado = validarDestinatario(EMISOR_RUT, EMISOR_RUT)

    // Assert
    expect(resultado.ok).toBe(false)
    expect(resultado.error).toBe('No puedes transferir dinero a ti mismo.')
  })

  it('acepta un RUT de destinatario válido distinto al emisor', () => {
    // Arrange / Act
    const resultado = validarDestinatario(DESTINATARIO_RUT, EMISOR_RUT)

    // Assert
    expect(resultado.ok).toBe(true)
    expect(resultado.destinatarioRut).toBe('22222222-2')
  })
})

describe('validarTransferencia', () => {
  it('rechaza cuando el monto supera el saldo disponible', () => {
    // Arrange
    const datos = {
      monto: '50000',
      saldo: 10000,
      destinatarioRut: DESTINATARIO_RUT,
      emisorRut: EMISOR_RUT,
    }

    // Act
    const resultado = validarTransferencia(datos)

    // Assert
    expect(resultado.ok).toBe(false)
    expect(resultado.error).toBe('Saldo insuficiente para completar la transferencia.')
  })

  it('acepta transferencia válida con saldo suficiente (caso feliz)', () => {
    // Arrange
    const datos = {
      monto: '10000',
      saldo: 100000,
      destinatarioRut: DESTINATARIO_RUT,
      emisorRut: EMISOR_RUT,
    }

    // Act
    const resultado = validarTransferencia(datos)

    // Assert
    expect(resultado).toEqual({
      ok: true,
      monto: 10000,
      destinatarioRut: '22222222-2',
    })
  })

  it.each([
    {
      caso: 'monto negativo',
      datos: {
        monto: '-50000',
        saldo: 100000,
        destinatarioRut: DESTINATARIO_RUT,
        emisorRut: EMISOR_RUT,
      },
      error: 'El monto no puede ser negativo.',
    },
    {
      caso: 'destinatario vacío',
      datos: {
        monto: '1000',
        saldo: 100000,
        destinatarioRut: '',
        emisorRut: EMISOR_RUT,
      },
      error: 'Debes ingresar un RUT de destinatario válido.',
    },
    {
      caso: 'auto-transferencia',
      datos: {
        monto: '1000',
        saldo: 100000,
        destinatarioRut: EMISOR_RUT,
        emisorRut: EMISOR_RUT,
      },
      error: 'No puedes transferir dinero a ti mismo.',
    },
  ])('rechaza transferencia por $caso', ({ datos, error }) => {
    // Arrange / Act
    const resultado = validarTransferencia(datos)

    // Assert
    expect(resultado.ok).toBe(false)
    expect(resultado.error).toBe(error)
  })
})
