import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { normalizeRut } from '../utils/rut'
import { findUserByRut } from './userService'

export async function transferMoney({
  emisorUid,
  emisorRut,
  destinatarioRut,
  monto,
  descripcion = '',
}) {
  const montoNumerico = Number(monto)

  if (Number.isNaN(montoNumerico) || montoNumerico <= 0) {
    throw new Error('El monto debe ser mayor a 0.')
  }

  const rutDestino = normalizeRut(destinatarioRut)
  const rutEmisor = normalizeRut(emisorRut)

  if (rutDestino === rutEmisor) {
    throw new Error('No puedes transferir dinero a ti mismo.')
  }

  const receptor = await findUserByRut(rutDestino)

  if (!receptor) {
    throw new Error('No existe un usuario con ese RUT.')
  }

  const emisorRef = doc(db, 'users', emisorUid)
  const receptorRef = doc(db, 'users', receptor.uid)
  const movimientoRef = doc(collection(db, 'movimientos'))

  await runTransaction(db, async (transaction) => {
    const emisorSnapshot = await transaction.get(emisorRef)
    const receptorSnapshot = await transaction.get(receptorRef)

    if (!emisorSnapshot.exists()) {
      throw new Error('No se encontró la cuenta del emisor.')
    }

    if (!receptorSnapshot.exists()) {
      throw new Error('No se encontró la cuenta del destinatario.')
    }

    const saldoEmisor = emisorSnapshot.data().saldo

    if (saldoEmisor < montoNumerico) {
      throw new Error('Saldo insuficiente para completar la transferencia.')
    }

    transaction.update(emisorRef, { saldo: saldoEmisor - montoNumerico })
    transaction.update(receptorRef, {
      saldo: receptorSnapshot.data().saldo + montoNumerico,
    })

    transaction.set(movimientoRef, {
      emisorUid,
      receptorUid: receptor.uid,
      emisorRut: rutEmisor,
      receptorRut: rutDestino,
      monto: montoNumerico,
      fecha: serverTimestamp(),
      descripcion: descripcion.trim(),
      tipo: 'transferencia',
    })
  })
}
