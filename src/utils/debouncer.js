const debouncerIds = {}

export default function debounce (func, delay, id) {
  const debouncerId = func + id
  // Reset debounce
  clearTimeout(debouncerIds[debouncerId])
  // Start debounce timer
  debouncerIds[debouncerId] = setTimeout(func, delay)
}
