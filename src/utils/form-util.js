const validatePassword = (password, confirmPassword) => {
  if(password === confirmPassword) return true
  return false
}

const formatCurrency = (value) => {
  if(!value) return 0
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  }).format(value)
}

const formatDate = (timestamp) => {
  if(!timestamp) return null
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(timestamp))
}

const formatDateAndTime = (timestamp) => {
  if(!timestamp) return null
  const options = {
    year: 'numeric',
    month: 'long', // or '2-digit'
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // use 24-hour format
  };
  return new Date(timestamp).toLocaleString('en-US', options);
}

export {
  validatePassword,
  formatCurrency,
  formatDate,
  formatDateAndTime
}
