import { useEffect, useState } from 'react'
import { subscribeToUser } from '../services/userService'
import { translateErrorMessage } from '../utils/formatters'

export function useUserProfile(uid) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!uid) {
      setProfile(null)
      setLoading(false)
      return undefined
    }

    setLoading(true)
    setError(null)

    const unsubscribe = subscribeToUser(
      uid,
      (userData) => {
        setProfile(userData)
        setLoading(false)
      },
      (snapshotError) => {
        setError(translateErrorMessage(snapshotError))
        setLoading(false)
      },
    )

    return unsubscribe
  }, [uid])

  return { profile, loading, error }
}
