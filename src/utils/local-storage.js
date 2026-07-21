const setToken = async (key, value, ttl) => {
  const now = new Date()
  const item = {
      value: value,
      expiry: now.getTime() + (ttl*60*60*24*1000) //in ms
  }
  try {
    localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    console.error(`Failed to store token for key "${key}":`, error)
  }
}

const getToken = (key) => {
  const itemStr = localStorage.getItem(key)
    if (!itemStr) return null

    let item
    try {
      item = JSON.parse(itemStr)
    } catch (error) {
      console.error(`Failed to parse token for key "${key}":`, error)
      localStorage.removeItem(key)
      return null
    }

    const now = new Date()

    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key)
        return null
    }
    return item.value
}

const removeToken = (key) => {
  localStorage.removeItem(key)
}

export {
  setToken,
  getToken,
  removeToken
}
