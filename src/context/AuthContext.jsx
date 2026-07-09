import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { subscribeToAuthChanges, logoutUser } from '../services/authService'
import { translateErrorMessage } from '../utils/formatters'
import { AUTH_ACTIONS, authReducer, initialAuthState } from './authReducer'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: firebaseUser })
    })

    return unsubscribe
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: translateErrorMessage(error),
      })
    }
  }

  const value = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      error: state.error,
      dispatch,
      handleLogout,
    }),
    [state.user, state.loading, state.error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
