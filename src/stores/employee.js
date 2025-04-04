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
    // Reset basic properties
    employee.id = ''
    employee.fullname = ''
    employee.email = ''
    employee.role = ''
    employee.password = ''
    employee.password_confirmation = ''
  }

  function setEmployee (data) {
    // Set basic properties with fallback values
    employee.id = data.id || ''
    employee.fullname = data.fullname || ''
    employee.email = data.email || ''
    employee.role = data.role || ''
    employee.password = data.password || ''
    employee.password_confirmation = ''
  }

  async function getAllEmployee (param) {
    const { data } = await employeeApi.getAllEmployee(param)
    employees.value = data.data
    paginationData.value = data
    console.log('FETCH EMPLOYEE', data)
  }

  async function getEmployee (id) {
    const { data } = await employeeApi.getEmployeeById(id)
    setEmployee(data)
  }

  async function addEmployee () {
    await employeeApi.addEmployee(employee)
    $resetEmployee()
  }

  async function updateEmployee () {
    const { data } = await employeeApi.updateEmployee(employee.id, employee)
    setEmployee(data)
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
