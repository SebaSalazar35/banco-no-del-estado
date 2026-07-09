const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use': 'Este RUT ya está registrado.',
  'auth/invalid-email': 'El correo ingresado no es válido.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/user-not-found': 'No existe una cuenta con ese RUT.',
  'auth/wrong-password': 'Contraseña incorrecta.',
  'auth/invalid-credential': 'RUT o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  'auth/network-request-failed': 'Error de conexión. Revisa tu internet.',
  'auth/invalid-api-key': 'Clave de API inválida. Revisa tu archivo .env.',
  'auth/operation-not-allowed': 'El inicio de sesión con correo no está habilitado en Firebase.',
  'auth/configuration-not-found':
    'Authentication no está configurado. En Firebase Console ve a Authentication → Comenzar y habilita Correo/Contraseña.',
}

const FIRESTORE_ERROR_MESSAGES = {
  'permission-denied': 'No tienes permisos para realizar esta acción. Revisa las reglas de Firestore.',
  unavailable: 'El servicio no está disponible. Intenta de nuevo en unos segundos.',
  'not-found': 'No se encontró la información solicitada.',
  'already-exists': 'El registro que intentas crear ya existe.',
  'failed-precondition': 'No se pudo completar la operación en este momento.',
  unauthenticated: 'Debes iniciar sesión para continuar.',
  'resource-exhausted': 'Se excedió el límite de solicitudes. Intenta más tarde.',
  cancelled: 'La operación fue cancelada.',
  'deadline-exceeded': 'La operación tardó demasiado. Intenta de nuevo.',
}

const MESSAGE_TRANSLATIONS = [
  {
    pattern: /missing or insufficient permissions/i,
    message: 'Permisos insuficientes. Verifica las reglas de Firestore en Firebase Console.',
  },
  {
    pattern: /invalid-api-key/i,
    message: 'Clave de API inválida. Revisa las credenciales en tu archivo .env.',
  },
  {
    pattern: /network error/i,
    message: 'Error de red. Comprueba tu conexión a internet.',
  },
  {
    pattern: /failed to get document/i,
    message: 'No se pudo obtener el documento desde la base de datos.',
  },
  {
    pattern: /user not found/i,
    message: 'Usuario no encontrado.',
  },
  {
    pattern: /insufficient funds|insufficient balance/i,
    message: 'Saldo insuficiente para completar la operación.',
  },
]

function translateMessageText(message) {
  if (!message) {
    return null
  }

  for (const entry of MESSAGE_TRANSLATIONS) {
    if (entry.pattern.test(message)) {
      return entry.message
    }
  }

  return message
}

export function translateErrorMessage(error) {
  if (!error) {
    return 'Ocurrió un error inesperado.'
  }

  if (typeof error === 'string') {
    return translateMessageText(error) || error
  }

  if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code]
  }

  if (error.code && FIRESTORE_ERROR_MESSAGES[error.code]) {
    return FIRESTORE_ERROR_MESSAGES[error.code]
  }

  return translateMessageText(error.message) || error.message || 'Ocurrió un error inesperado.'
}

export function getFirebaseErrorMessage(error) {
  return translateErrorMessage(error)
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount ?? 0)
}

export function formatSignedCurrency(amount) {
  const absoluteAmount = Math.abs(amount ?? 0)
  const formatted = formatCurrency(absoluteAmount)

  if (amount > 0) {
    return `+${formatted}`
  }

  if (amount < 0) {
    return `-${formatted}`
  }

  return formatted
}

import { formatRut } from './rut'

function getCounterpartyLabel(movement, isSent) {
  if (isSent) {
    return movement.receptorRut
      ? formatRut(movement.receptorRut)
      : movement.receptorEmail || 'Destinatario desconocido'
  }

  return movement.emisorRut
    ? formatRut(movement.emisorRut)
    : movement.emisorEmail || 'Emisor desconocido'
}

export function getMovementInfo(movement, currentUid) {
  if (movement.tipo === 'deposito') {
    return {
      label: 'Depósito',
      counterparty: 'Cuenta propia',
      signedAmount: movement.monto,
      variant: 'received',
      isOutgoing: false,
      isIncoming: true,
    }
  }

  if (movement.tipo === 'retiro') {
    return {
      label: 'Retiro',
      counterparty: 'Cuenta propia',
      signedAmount: -movement.monto,
      variant: 'sent',
      isOutgoing: true,
      isIncoming: false,
    }
  }

  const isSent = movement.emisorUid === currentUid

  return {
    label: isSent ? 'Envío' : 'Recepción',
    counterparty: getCounterpartyLabel(movement, isSent),
    signedAmount: isSent ? -movement.monto : movement.monto,
    variant: isSent ? 'sent' : 'received',
    isOutgoing: isSent,
    isIncoming: !isSent,
  }
}

export function formatDate(timestamp) {
  if (!timestamp) {
    return 'Fecha pendiente'
  }

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}
