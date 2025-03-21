
const updateQuery = (router, route, params, replace = true) => {
  const newRoute = {
    query: {
      ...route.query,
      ...params
    }
  }

  if (replace) {
    router.replace(newRoute)
    return
  }
  router.push(route)
}

export {
  updateQuery
}
