import httpApi from '@/utils/http-api'
import { api } from '@/config'

// const invoice = {
//   id: 'id',
//   purchase_order: {
//     purchase_order_number: 'purchase_order_number',
//     purchase_order_date: 'purchase_order_date',
//     purchase_order_type: 'purchase_order_type',
//     payment_due: 'payment_due',
//     discount: 'discount'
//   },
//   invoice: {
//     invoice_number: 'invoice_number',
//     date: 'date',
//     type: 'type',
//     term_of_payment: 'term_of_payment',
//     sub_total: 1000000,
//     grand_total: 10000000
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
//   price: {
//     subtotal: 100000,
//     ppn: 10,
//     grand_total: 1000000
//   },
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

const getAllInvoice = async (param) => {
  return httpApi.getDataViaApi(api.invoice, param)
}

const addInvoice = (invoice) => {
  return httpApi.postDataViaApi(api.invoice, invoice)
}

const getInvoiceById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.invoice}/${id}`)
}

const updateInvoice = (id, invoice) => {
  return httpApi.putDataViaApi(`${api.invoice}/${id}`, invoice)
}

const deleteInvoice = (id) => {
  return httpApi.deleteDataViaApi(`${api.invoice}/${id}`)
}


export default {
	getAllInvoice,
  addInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
}
