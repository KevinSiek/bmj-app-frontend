const validatePassword = (password, confirmPassword) => {
  if(password === confirmPassword) return true
  return false
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  }).format(value)
}

export {
  validatePassword,
  formatCurrency
}
