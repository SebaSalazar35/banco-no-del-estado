import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db, SALDO_INICIAL } from '../firebase/config'
import { normalizeRut, rutToAuthEmail } from '../utils/rut'

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function registerUser(nombre, rut, password) {
  const rutNormalizado = normalizeRut(rut)
  const authEmail = rutToAuthEmail(rutNormalizado)

  const credential = await createUserWithEmailAndPassword(auth, authEmail, password)

  await updateProfile(credential.user, { displayName: nombre })

  await setDoc(doc(db, 'users', credential.user.uid), {
    nombre,
    rut: rutNormalizado,
    saldo: SALDO_INICIAL,
  })

  return credential.user
}

export async function loginUser(rut, password) {
  const authEmail = rutToAuthEmail(rut)
  const credential = await signInWithEmailAndPassword(auth, authEmail, password)
  return credential.user
}

export async function logoutUser() {
  await signOut(auth)
}
