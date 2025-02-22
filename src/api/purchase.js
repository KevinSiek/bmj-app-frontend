import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getAllPurchase = async (param) => {
  return httpApi.getDataViaApi(api.purchase, param)
}

const addPurchase = (purchase) => {
  return httpApi.postDataViaApi(api.purchase, purchase)
}

const getPurchaseById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.purchase}/${id}`)
}

const updatePurchase = (id, purchase) => {
  return httpApi.putDataViaApi(`${api.purchase}/${id}`, purchase)
}

const deletePurchase = (id) => {
  return httpApi.deleteDataViaApi(`${api.purchase}/${id}`)
}


export {
	getAllPurchase,
  addPurchase,
  getPurchaseById,
  updatePurchase,
  deletePurchase
}
