import { saveUser, findUserByEmail, createSession, getCurrentUser, logout as storageLogout } from '../lib/userStorage'
import { v4 as uuidv4 } from 'uuid'

export const signup = (name: string, email: string, password: string) => {

  if (!name || !email || !password) {
    return { success: false, error: 'All fields are required' }
  }
  
  
  try {
    const user = saveUser({ id: uuidv4(), username: name, email, password })
    createSession(user)
    return { success: true, user }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

export const login = (email: string, password: string) => {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' }
  }
  
  const user = findUserByEmail(email)
  
  if (!user ) { // In real app, use bcrypt
    return { success: false, error: 'Invalid email or password' }
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