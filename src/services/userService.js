import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { normalizeRut } from '../utils/rut'

export function subscribeToUser(uid, onData, onError) {
  const userRef = doc(db, 'users', uid)

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData({ uid, ...snapshot.data() })
      } else {
        onData(null)
      }
    },
    onError,
  )
}

export async function findUserByRut(rut) {
  const rutNormalizado = normalizeRut(rut)
  const usersQuery = query(
    collection(db, 'users'),
    where('rut', '==', rutNormalizado),
  )
  const snapshot = await getDocs(usersQuery)

  if (snapshot.empty) {
    return null
  }

  const userDoc = snapshot.docs[0]
  return { uid: userDoc.id, ...userDoc.data() }
}

export async function adjustBalance(uid, rut, amount, tipo) {
  const userRef = doc(db, 'users', uid)
  const movimientoRef = doc(collection(db, 'movimientos'))
  const montoAbsoluto = Math.abs(amount)
  const rutNormalizado = normalizeRut(rut)

  await runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef)

    if (!userSnapshot.exists()) {
      throw new Error('Usuario no encontrado.')
    }

    const saldoActual = userSnapshot.data().saldo
    const nuevoSaldo = saldoActual + amount

    if (nuevoSaldo < 0) {
      throw new Error('Saldo insuficiente para realizar el retiro.')
    }

    transaction.update(userRef, { saldo: nuevoSaldo })
    transaction.set(movimientoRef, {
      emisorUid: uid,
      receptorUid: uid,
      emisorRut: rutNormalizado,
      receptorRut: rutNormalizado,
      monto: montoAbsoluto,
      fecha: serverTimestamp(),
      descripcion: tipo === 'deposito' ? 'Depósito simulado' : 'Retiro simulado',
      tipo,
    })
  })

  return { tipo, monto: montoAbsoluto }
}
