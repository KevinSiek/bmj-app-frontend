import httpApi from '@/utils/http-api'
import { api } from '@/config'

// const backOrder = {
//   id: 'id',
//   back_order_number: 'back_order_number',
//   date: 'date',
//   status: 'indent',
//   purchase_order: {
//     purchase_order_number: 'purchase_order_number',
//     purchase_order_date: 'purchase_order_date',
//     order_type: 'order_type'
//   },
//   delivery_order: {
//     delivery_order_number: 'delivery_order_number',
//     delivery_order_date: 'delivery_order_date',
//     ship_mode: 'ship_mode'
//   },
//   customer: {
//     company_name: 'company_name',
//     address: 'address',
//     city: 'city',
//     province: 'province',
//     office: 'office',
//     urban: 'urban',
//     subdistrict: 'subdistrict',
//     postal_code: 'postal_code',
//     npwp: 'npwp',
//     delivery: 'delivery'
//   },
//   notes: 'notes',
//   spareparts: [
//     {
//       sparepart_name: 'sparepart_name',
//       sparepart_number: 'sparepart_number',
//       quantity: 10,
//       unit_price_sell: 1000000,
//       total_price: 10000000,
//       stock: 100,
//       order: 2,
//       delivery_order: 1,
//       back_order: 1
//     }
//   ]
// }

const getAllBackOrder = async (param) => {
  return httpApi.getDataViaApi(api.back_order, param)
}

const addBackOrder = (bo) => {
  return httpApi.postDataViaApi(api.back_order, bo)
}

const getBackOrderById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.back_order}/${id}`)
}

const updateBackOrder = (id, bo) => {
  return httpApi.putDataViaApi(`${api.back_order}/${id}`, bo)
}

const deleteBackOrder = (id) => {
  return httpApi.deleteDataViaApi(`${api.back_order}/${id}`)
}

const processBackOrder = (id) => {
  return httpApi.postDataViaApi(`${api.back_order}/process/${id}`)
}


export default {
	getAllBackOrder,
  addBackOrder,
  getBackOrderById,
  updateBackOrder,
  deleteBackOrder,
  processBackOrder
}
