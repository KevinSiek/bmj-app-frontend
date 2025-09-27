import httpApi from '@/utils/http-api'
import { api } from '@/config'

// const po = {
//   id: 'id',
//   status: 'Finished',
//   purchase_order: {
//     purchase_order_number: 'purchase_order_number',
//     purchase_order_date: 'purchase_order_date',
//     type: 'type'
//   },
//   proforma_invoice: {
//     proforma_invoice_number: 'proforma_invoice_number',
//     proforma_invoice_date: 'proforma_invoice_date',
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
//       stock: 100
//     }
//   ]
// }

const getAllPurchaseOrder = async (param) => {
  return httpApi.getDataViaApi(api.purchase_order, param)
}

const addPurchaseOrder = (purchaseOrder) => {
  return httpApi.postDataViaApi(api.purchase_order, purchaseOrder)
}

const getPurchaseOrderById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.purchase_order}/${id}`)
}

const updatePurchaseOrder = (id, purchaseOrder) => {
  return httpApi.putDataViaApi(`${api.purchase_order}/${id}`, purchaseOrder)
}

const deletePurchaseOrder = (id) => {
  return httpApi.deleteDataViaApi(`${api.purchase_order}/${id}`)
}

const processToProformaInvoice = (id, param) => {
  return httpApi.postDataViaApi(`${api.purchase_order}/moveToPi/${id}`, param)
}

const updateStatusPurchaseOrder = (id, status) => {
  return httpApi.postDataViaApi(`${api.purchase_order}/status/${id}`, status)
}

const ready = (id) => {
  return httpApi.postDataViaApi(`${api.purchase_order}/ready/${id}`)
}

const fullPaid = (id) => {
  return httpApi.postDataViaApi(`${api.proforma_invoice}/fullPaid/${id}`)
}

const release = (id, workOrder) => {
  return httpApi.postDataViaApi(`${api.purchase_order}/release/${id}`, workOrder)
}

const done = (id) => {
  return httpApi.postDataViaApi(`${api.purchase_order}/done/${id}`)
}

const reject = (id, param) => {
  return httpApi.postDataViaApi(`${api.purchase_order}/reject/${id}`, param)
}

// Return Purchase Order
const getAllReturnPurchaseOrder = async (param) => {
  return httpApi.getDataViaApi(`${api.quotation}/return/1`, param)
}

const returnPurchaseOrder = (id, returnedItems) => {
  return httpApi.postDataViaApi(`${api.quotation}/return/${id}`, { returned: returnedItems })
}

const approveReturn = (id) => {
  return httpApi.postDataViaApi(`${api.quotation}/approveReturn/${id}`)
}

const rejectReturn = (id) => {
  return httpApi.postDataViaApi(`${api.quotation}/rejectReturn/${id}`)
}

export default {
  getAllPurchaseOrder,
  getAllReturnPurchaseOrder,
  addPurchaseOrder,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  processToProformaInvoice,
  updateStatusPurchaseOrder,
  fullPaid,
  ready,
  release,
  done,
  reject,
  returnPurchaseOrder,
  approveReturn,
  rejectReturn
}
