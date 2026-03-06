import { userModel } from '../model/user'
import { v4 as uuidv4 } from 'uuid'

// User functions
export const getUsers = (): userModel[] => {
  if (typeof window === 'undefined') return []
  const users = localStorage.getItem('users')
  return users ? JSON.parse(users) : []
}

export const saveUser = (user: userModel) => {
  const users = getUsers()
  
  // Check if email exists
  const existingUser = users.find(u => u.email === user.email)
  if (existingUser) {
    throw new Error('User already exists')
  }

  const newUser: userModel = {
    ...user,
    id: uuidv4(),
  }
  
  users.push(newUser)
  localStorage.setItem('users', JSON.stringify(users))
  return newUser
}

export const findUserByEmail = (email: string): userModel | undefined => {
  const users = getUsers()
  return users.find(u => u.email === email)
}

// Session functions
export const createSession = (user: userModel) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('currentUser', JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
    loggedInAt: Date.now()
  }))
}

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
}

export const logout = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('currentUser')
}