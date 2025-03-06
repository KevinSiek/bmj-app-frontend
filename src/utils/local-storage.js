const setToken = async (key, value, ttl) => {
  const now = new Date()
  const item = {
      value: value,
      expiry: now.getTime() + (ttl*60*60*24*1000) //in ms
  }
  localStorage.setItem(key, JSON.stringify(item))
}

const getToken = (key) => {
  const itemStr = localStorage.getItem(key)
    if (!itemStr) return null

    const item = JSON.parse(itemStr)
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
