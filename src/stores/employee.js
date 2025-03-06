import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import employeeApi from '@/api/employee'

export const useEmployeeStore = defineStore('employee', () => {
  const employee = reactive({
    id: '',
    fullname: '',
    email: '',
    role: '',
    password: '',
    password_confirmation: ''
  })
  const employees = ref([])
  const paginationData = ref({})

  function $resetEmployee () {
    employee.fullname = ''
    employee.email = ''
    employee.role = ''
    employee.password = ''
    employee.password_confirmation = ''
  }

  async function getAllEmployee (param) {
    const response = await employeeApi.getAllEmployee(param)
    employees.value = response.data
    paginationData.value = response
    console.log('FETCH EMPLOYEE', response)
  }

  async function getEmployee (id) {
    const response = await employeeApi.getEmployeeById(id)
    employee.id = response.id
    employee.fullname = response.fullname
    employee.email = response.email
    employee.password = response.password
    employee.role = response.role
  }

  async function setEmployee (data) {
    employee.fullname = data.fullname
    employee.email = data.email
    employee.password = data.password
    employee.role = data.role
  }

  async function updateEmployee () {
    await employeeApi.updateEmployee(employee.id, employee)
  }

  async function addEmployee () {
    await employeeApi.addEmployee(employee)
    $resetEmployee()
  }

  async function deleteEmployee (id) {
    await employeeApi.deleteEmployee(id)
  }

  return {
    employee,
    employees,
    paginationData,
    $resetEmployee,
    getAllEmployee,
    getEmployee,
    setEmployee,
    updateEmployee,
    deleteEmployee,
    addEmployee
  }
})
