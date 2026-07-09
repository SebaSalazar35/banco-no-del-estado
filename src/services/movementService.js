import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'

function mergeMovements(sentDocs, receivedDocs) {
  const movementsMap = new Map()

  sentDocs.forEach((movementDoc) => {
    movementsMap.set(movementDoc.id, {
      id: movementDoc.id,
      ...movementDoc.data(),
    })
  })

  receivedDocs.forEach((movementDoc) => {
    movementsMap.set(movementDoc.id, {
      id: movementDoc.id,
      ...movementDoc.data(),
    })
  })

  return Array.from(movementsMap.values()).sort((a, b) => {
    const dateA = a.fecha?.toMillis?.() ?? 0
    const dateB = b.fecha?.toMillis?.() ?? 0
    return dateB - dateA
  })
}

export function subscribeToMovements(uid, onData, onError) {
  const sentQuery = query(
    collection(db, 'movimientos'),
    where('emisorUid', '==', uid),
  )
  const receivedQuery = query(
    collection(db, 'movimientos'),
    where('receptorUid', '==', uid),
  )

  let sentMovements = []
  let receivedMovements = []
  let sentReady = false
  let receivedReady = false

  const emitMovements = () => {
    if (sentReady && receivedReady) {
      onData(mergeMovements(sentMovements, receivedMovements))
    }
  }

  const unsubscribeSent = onSnapshot(
    sentQuery,
    (snapshot) => {
      sentMovements = snapshot.docs
      sentReady = true
      emitMovements()
    },
    onError,
  )

  const unsubscribeReceived = onSnapshot(
    receivedQuery,
    (snapshot) => {
      receivedMovements = snapshot.docs
      receivedReady = true
      emitMovements()
    },
    onError,
  )

  return () => {
    unsubscribeSent()
    unsubscribeReceived()
  }
}
