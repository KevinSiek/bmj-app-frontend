import httpApi from '@/utils/http-api'
import { api } from '@/config'

// const quotation = {
//   id: 'id',
//   slug: 'slug',
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
//   project: {
//     date: 'date',
//     quotation_number: 'quotation_number',
//     type: 'type'
//   },
//   price: {
//     subtotal: 100000,
//     ppn: 1000,
//     grand_total: 1000000
//   },
//   status: 'status',
//   notes: 'notes',
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

const getAllQuotations = async (param) => {
  return httpApi.getDataViaApi(api.quotation, param)
}

const getAllReviewQuotations = async (param) => {
  return httpApi.getDataViaApi(`${api.quotation}/review/1`, param)
}

const addQuotation = (quotation) => {
  return httpApi.postDataViaApi(api.quotation, quotation)
}

const getQuotationyId = (id) => {
  return httpApi.getDataByIdViaApi(`${api.quotation}/${id}`)
}

const updateQuotation = (id, quotation) => {
  return httpApi.putDataViaApi(`${api.quotation}/${id}`, quotation)
}

const deleteQuotation = (id) => {
  return httpApi.deleteDataViaApi(`${api.quotation}/${id}`)
}

const processQuotation = (id, param) => {
  return httpApi.postDataViaApi(`${api.quotation}/moveToPo/${id}`, param)
}

const approveQuotation = (id) => {
  return httpApi.postDataViaApi(`${api.quotation}/approve/${id}`)
}
const rejectQuotation = (id) => {
  return httpApi.postDataViaApi(`${api.quotation}/reject/${id}`)
}
const needChangeQuotation = (id) => {
  return httpApi.postDataViaApi(`${api.quotation}/needChange/${id}`)
}


export default {
  getAllQuotations,
  getAllReviewQuotations,
  addQuotation,
  getQuotationyId,
  updateQuotation,
  deleteQuotation,
  processQuotation,
  approveQuotation,
  needChangeQuotation,
  rejectQuotation
}
