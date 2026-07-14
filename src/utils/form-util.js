const validatePassword = (password, confirmPassword) => {
  if(password === confirmPassword) return true
  return false
}

// Keeps "Rp" — used by PDF documents, which are official financial documents.
const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return ''
  const num = Math.round(Number(value) || 0)
  return new Intl.NumberFormat('id-ID').format(num)
}

// No "Rp", Indonesian thousands grouping (1250000 -> "1.250.000"). Web UI display only.
const formatMoney = (value) => formatCurrency(value)

const formatPDFPrice = (value, extraStyles = {}, layoutStyles = {}) => {
  if (value === null || value === undefined || value === '') return ''
  const num = Math.round(Number(value) || 0)
  const formattedNum = new Intl.NumberFormat('id-ID').format(num)
  return {
    columns: [
      { text: 'Rp.', width: 'auto', alignment: 'left', ...extraStyles },
      { text: formattedNum, alignment: 'right', ...extraStyles }
    ],
    columnGap: 0,
    ...layoutStyles
  }
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
  formatMoney,
  formatPDFPrice,
  formatDate,
  formatDateAndTime
}
