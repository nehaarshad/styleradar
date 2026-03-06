import { saveUser, findUserByEmail, createSession, getCurrentUser, logout as storageLogout } from '../lib/userStorage'
import { v4 as uuidv4 } from 'uuid'

export const signup = (name: string, email: string) => {

  if (!name || !email ) {
    return { success: false, error: 'All fields are required' }
  }
  
  
  try {
    const user = saveUser({ id: uuidv4(), username: name, email })
    createSession(user)
    return { success: true, user }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

export const login = (email: string) => {
  if (!email ) {
    return { success: false, error: 'Email is required' }
  }
  
  const user = findUserByEmail(email)
  
  if (!user ) { // In real app, use bcrypt
    return { success: false, error: 'Invalid email' }
  }
  
  createSession(user)
  return { success: true, user }
}

export const logout = () => {
  storageLogout()
}

export const getSession = () => {
  return getCurrentUser()
}