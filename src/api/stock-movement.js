import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getStockMovements = async (param) => {
  return httpApi.getDataViaApi(api.stock_movement, param)
}

export default {
  getStockMovements
}

export {
  getStockMovements
}
