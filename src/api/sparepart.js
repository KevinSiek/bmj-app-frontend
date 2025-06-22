import httpApi from '@/utils/http-api'
import { api } from '@/config'

// const sparepart = {
//   id: 'id',
//   slug: 'slug',
//   sparepart_number: 'sparepart_number',
//   sparepart_name: 'sparepart_name',
//   total_unit: 1000,
//   unit_price_sell: 1000000,
//   unit_price_buy: [
//     {
//       seller: 'seller 1',
//       price: 11111
//     },
//     {
//       seller: 'seller 2',
//       price: 22222
//     }
//   ]
// }

export const getAllSparepart = async (param) => {
  return httpApi.getDataViaApi(api.sparepart, param)
}

const addSparepart = (sparepart) => {
  return httpApi.postDataViaApi(api.sparepart, sparepart)
}

const getSparepartById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.sparepart}/${id}`)
}

const updateSparepart = (id, sparepart) => {
  return httpApi.putDataViaApi(`${api.sparepart}/${id}`, sparepart)
}

const deleteSparepart = (id) => {
  return httpApi.deleteDataViaApi(`${api.sparepart}/${id}`)
}

const addSparepartInBulk = (spareparts) => {
  return httpApi.postDataViaApi(`${api.sparepart}/insert`, spareparts)
}


export default {
	getAllSparepart,
  addSparepart,
  getSparepartById,
  updateSparepart,
  deleteSparepart,
  addSparepartInBulk
}
