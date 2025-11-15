import { ref } from 'vue'
import { defineStore } from 'pinia'
import employeeApi from '@/api/employee'

export const useEmployeeStore = defineStore('employee', () => {
  const employee = ref(null)
  const employees = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  function mapEmployee (data) {
    return {
      id: data?.id || '',
      slug: data?.slug || '',
      branch: data?.branch || '',
      fullname: data?.fullname || '',
      username: data?.username || '',
      email: data?.email || '',
      role: data?.role || '',
      password: data?.password || '',
      passwordConfirmation: data?.password_confirmation || ''
    }
  }

  async function getAllEmployee (param) {
    isLoading.value = true
    const { data } = await employeeApi.getAllEmployee(param)
    console.log('getEmployee', data)
    employees.value = data.data.map(mapEmployee)
    paginationData.value = data
    isLoading.value = false
  }

  async function getEmployee (id) {
    const { data } = await employeeApi.getEmployeeById(id)
    employee.value = mapEmployee(data)
  }

  async function addEmployee () {
    const data = await employeeApi.addEmployee(employee.value)
  }

  async function setEmployee (selectedEmployee) {
    employee.value = selectedEmployee
  }

  async function updateEmployee (id) {
    const { data } = await employeeApi.updateEmployee(id, employee.value)
  }

  async function deleteEmployee (id) {
    await employeeApi.deleteEmployee(id)
  }

  async function resetPassword(id) {
    const { data } = await employeeApi.resetPassword(id)
    employee.value = mapEmployee({
      ...data,
      password: data.temp_password,
      passwordConfirmation: ''
    })
  }

  async function $resetEmployee () {
    employee.value = mapEmployee()
  }

  async function $resetEmployees() {
    employees.value = []
  }

  return {
    employee,
    employees,
    paginationData,
    isLoading,
    getAllEmployee,
    getEmployee,
    updateEmployee,
    deleteEmployee,
    addEmployee,
    $resetEmployee,
    $resetEmployees,
    setEmployee,
    resetPassword
  }
})
