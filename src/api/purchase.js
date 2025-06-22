import httpApi from '@/utils/http-api'
import { api } from '@/config'

// const purchase = {
//   id: 'id',
//   buy_number: 'buy_number',
//   date: 'date',
//   notes: 'notes',
//   status: 'Approved',
//   total_amount: 1000000,
//   spareparts: [
//     {
//       sparepart_name: 'sparepart_name',
//       sparepart_number: 'sparepart_number',
//       quantity: 10,
//       unit_price_sell: 1000000,
//       total_price: 10000000,
//       stock: 100
//     }
//   ]
// }

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

export default {
	getAllPurchase,
  addPurchase,
  getPurchaseById,
  updatePurchase,
  deletePurchase
}
