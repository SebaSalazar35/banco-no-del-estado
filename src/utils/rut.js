export function cleanRut(value) {
  return value.replace(/[^0-9kK]/g, '').toUpperCase()
}

export function normalizeRut(value) {
  const cleaned = cleanRut(value)

  if (cleaned.length < 2) {
    return ''
  }

  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)

  return `${body}-${dv}`
}

export function formatRut(value) {
  const normalized = normalizeRut(value)

  if (!normalized) {
    return value
  }

  const [body, dv] = normalized.split('-')
  const reversed = body.split('').reverse().join('')
  const grouped = reversed.match(/.{1,3}/g)?.join('.') ?? reversed
  const formattedBody = grouped.split('').reverse().join('')

  return `${formattedBody}-${dv}`
}

export function isValidRut(value) {
  const normalized = normalizeRut(value)

  if (!normalized) {
    return false
  }

  const [body, dv] = normalized.split('-')

  if (!/^\d{7,8}$/.test(body)) {
    return false
  }

  let sum = 0
  let multiplier = 2

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = 11 - (sum % 11)
  const expectedDv =
    remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder)

  return dv === expectedDv
}

export function rutToAuthEmail(rut) {
  const normalized = normalizeRut(rut)
  return `${normalized.toLowerCase()}@bne.internal`
}

export function getRutValidationMessage(rut) {
  if (!rut.trim()) {
    return 'Debes ingresar tu RUT.'
  }

  if (!isValidRut(rut)) {
    return 'El RUT ingresado no es válido.'
  }

  return null
}
