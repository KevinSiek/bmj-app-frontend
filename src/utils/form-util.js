const validatePassword = (password, confirmPassword) => {
  if(password === confirmPassword) return true
  return false
}

export {
  validatePassword
}
