export const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT',
}

export const initialAuthState = {
  user: null,
  loading: true,
  error: null,
}

export function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    case AUTH_ACTIONS.SET_USER:
      return { ...state, user: action.payload, loading: false, error: null }
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null }
    case AUTH_ACTIONS.LOGOUT:
      return { ...initialAuthState, loading: false }
    default:
      return state
  }
}
