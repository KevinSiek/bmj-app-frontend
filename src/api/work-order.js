import httpApi from '@/utils/http-api'
import { api } from '@/config'

// const workOrder = {
//   id: 'id',
//   date: 'date',
//   work_order_number: 'work_order_number',
//   service_order: {
//     no: 'no',
//     date: 'date',
//     received_by: 'received_by',
//     start_date: 'start_date',
//     end_date: 'end_date'
//   },
//   proforma_invoice: {
//     proforma_invoice_number: 'proforma_invoice_number',
//     proforma_invoice_date: 'proforma_invoice_date'
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
//   units: [
//     {
//       job_description: 'job_description',
//       unit_type: 'unit_type',
//       quantity: 10
//     }
//   ],
//   poc: {
//     compiled: 'compiled',
//     head_of_service: 'head_of_service',
//     director: 'director',
//     worker: 'worker',
//     approver: 'approver'
//   },
//   work_date: {
//     start: 'start',
//     end: 'end'
//   },
//   description: 'description',
//   additional: {
//     spareparts: 'spareparts',
//     backup_sparepart: 'backup_sparepart',
//     scope: 'scope',
//     vaccine: 'vaccine',
//     apd: 'apd',
//     peduli_lindungi: 'peduli_lindungi',
//     execution_time: 'execution_time'
//   }
// }

const getAllWorkOrder = async (param) => {
  return httpApi.getDataViaApi(api.work_order, param)
}

const addWorkOrder = (workOrder) => {
  return httpApi.postDataViaApi(api.work_order, workOrder)
}

const getWorkOrderById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.work_order}/${id}`)
}

const updateWorkOrder = (id, workOrder) => {
  return httpApi.putDataViaApi(`${api.work_order}/${id}`, workOrder)
}

const deleteWorkOrder = (id) => {
  return httpApi.deleteDataViaApi(`${api.work_order}/${id}`)
}

const process = (id) => {
  return httpApi.postDataViaApi(`${api.work_order}/process/${id}`)
}


export default {
	getAllWorkOrder,
  addWorkOrder,
  getWorkOrderById,
  updateWorkOrder,
  deleteWorkOrder,
  process
}
