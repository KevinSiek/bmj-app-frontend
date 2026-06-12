import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getStockMovements = async (param) => {
  return httpApi.getDataViaApi(api.stock_movement, param)
}

const getSuggestions = async (q) => {
  return httpApi.getDataViaApi(`${api.stock_movement}/suggestions`, { q })
}

export default {
  getStockMovements,
  getSuggestions
}

export {
  getStockMovements,
  getSuggestions
}
