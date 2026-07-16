import { getRutValidationMessage, normalizeRut } from './rut'

/**
 * Valida el monto de una transferencia (función pura).
 * @returns {{ ok: true, monto: number } | { ok: false, error: string }}
 */
export function validarMonto(monto) {
  if (monto === '' || monto === null || monto === undefined) {
    return { ok: false, error: 'El monto debe ser mayor a 0.' }
  }

  const valorTexto = String(monto).trim()

  if (valorTexto === '' || Number.isNaN(Number(valorTexto))) {
    return { ok: false, error: 'El monto debe ser un número válido.' }
  }

  // Rechaza decimales (CLP usa enteros) y notación no numérica simple
  if (!/^-?\d+$/.test(valorTexto)) {
    return { ok: false, error: 'El monto no puede tener decimales.' }
  }

  const montoNumerico = Number(valorTexto)

  if (montoNumerico < 0) {
    return { ok: false, error: 'El monto no puede ser negativo.' }
  }

  if (montoNumerico === 0) {
    return { ok: false, error: 'El monto debe ser mayor a 0.' }
  }

  return { ok: true, monto: montoNumerico }
}

/**
 * Valida el destinatario de una transferencia (RUT en esta app).
 * @returns {{ ok: true, destinatarioRut: string } | { ok: false, error: string }}
 */
export function validarDestinatario(destinatarioRut, emisorRut) {
  if (!destinatarioRut || !String(destinatarioRut).trim()) {
    return { ok: false, error: 'Debes ingresar un RUT de destinatario válido.' }
  }

  const rutError = getRutValidationMessage(destinatarioRut)
  if (rutError) {
    return { ok: false, error: 'Debes ingresar un RUT de destinatario válido.' }
  }

  if (normalizeRut(destinatarioRut) === normalizeRut(emisorRut)) {
    return { ok: false, error: 'No puedes transferir dinero a ti mismo.' }
  }

  return { ok: true, destinatarioRut: normalizeRut(destinatarioRut) }
}

/**
 * Valida una transferencia completa contra el saldo disponible.
 * @returns {{ ok: true, monto: number, destinatarioRut: string } | { ok: false, error: string }}
 */
export function validarTransferencia({ monto, saldo, destinatarioRut, emisorRut }) {
  const destinatario = validarDestinatario(destinatarioRut, emisorRut)
  if (!destinatario.ok) {
    return destinatario
  }

  const montoValidado = validarMonto(monto)
  if (!montoValidado.ok) {
    return montoValidado
  }

  if (montoValidado.monto > saldo) {
    return { ok: false, error: 'Saldo insuficiente para completar la transferencia.' }
  }

  return {
    ok: true,
    monto: montoValidado.monto,
    destinatarioRut: destinatario.destinatarioRut,
  }
}
