import httpApi from '@/utils/http-api'
import { api } from '@/config'

// const employee = {
//   id: 'id',
//   fullname: 'fullname',
//   username: 'username',
//   email: 'email',
//   role: 'Director',
//   password: 'password'
// }

const getAllEmployee = async (param) => {
  return httpApi.getDataViaApi(api.employee, param)
}

const addEmployee = (employee) => {
  return httpApi.postDataViaApi(api.employee, employee)
}

const getEmployeeById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.employee}/${id}`)
}

const updateEmployee = (id, employee) => {
  return httpApi.putDataViaApi(`${api.employee}/${id}`, employee)
}

const deleteEmployee = (id) => {
  return httpApi.deleteDataViaApi(`${api.employee}/${id}`)
}


export default {
	getAllEmployee,
  addEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
}
