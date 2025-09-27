import httpApi from '@/utils/http-api'
import { api } from '@/config'

// const pi = {
//   id: 'id',
//   project: {
//     proforma_invoice_number: 'proforma_invoice_number',
//     date: 'date',
//     type: 'type'
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
//   price: {
//     amount: 1000000,
//     discount: 10,
//     subtotal: 1000000,
//     advance_payment: 100000,
//     total: 1000000,
//     ppn: 10000,
//     total_amount: 100000000
//   },
//   down_payment: 10,
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

const getAllProformaInvoice = async (param) => {
  return httpApi.getDataViaApi(api.proforma_invoice, param)
}

const addProformaInvoice = (pi) => {
  return httpApi.postDataViaApi(api.proforma_invoice, pi)
}

const getProformaInvoiceById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.proforma_invoice}/${id}`)
}

const updateProformaInvoice = (id, pi) => {
  return httpApi.putDataViaApi(`${api.proforma_invoice}/${id}`, pi)
}

const deleteProformaInvoice = (id) => {
  return httpApi.deleteDataViaApi(`${api.proforma_invoice}/${id}`)
}

const processToInvoice = (id) => {
  return httpApi.postDataViaApi(`${api.proforma_invoice}/moveToInvoice/${id}`)
}

const dpPaid = (id) => {
  return httpApi.postDataViaApi(`${api.proforma_invoice}/dpPaid/${id}`)
}


export default {
	getAllProformaInvoice,
  addProformaInvoice,
  getProformaInvoiceById,
  updateProformaInvoice,
  deleteProformaInvoice,
  processToInvoice,
  dpPaid
}
