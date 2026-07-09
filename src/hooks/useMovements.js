import { useEffect, useState } from 'react'
import { subscribeToMovements } from '../services/movementService'
import { translateErrorMessage } from '../utils/formatters'

export function useMovements(uid) {
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!uid) {
      setMovements([])
      setLoading(false)
      return undefined
    }

    setLoading(true)
    setError(null)

    const unsubscribe = subscribeToMovements(
      uid,
      (movementList) => {
        setMovements(movementList)
        setLoading(false)
      },
      (snapshotError) => {
        setError(translateErrorMessage(snapshotError))
        setLoading(false)
      },
    )

    return unsubscribe
  }, [uid])

  return { movements, loading, error }
}
