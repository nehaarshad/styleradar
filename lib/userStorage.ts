// Session functions
export const createSession = (id:unknown,username:string) => {
  localStorage.setItem('currentUser', JSON.stringify({
    id: id,
    username: username,
  }))

  console.log('Session created for user:', { id, username })
}

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser')
  console.log('Retrieving current user from storage:', user) // Debug log
  return user ? JSON.parse(user) : null
}

export const endSession = () => {
  localStorage.removeItem('currentUser')
}