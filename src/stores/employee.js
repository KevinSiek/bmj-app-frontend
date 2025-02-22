import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getAllEmployee as getAllEmployeeFromAPI } from '@/api/employee'

export const useEmployeeStore = defineStore('employee', () => {
  const employee = reactive({
    fullname: '',
    email: '',
    role: '',
    password: '',
    password_confirmation: ''
  })
  const employees = ref([
    {
      id: '1',
      name: 'Kevin Siek',
      type: 'Finance',
      status: 'Detail'
    },
    {
      id: '2',
      name: 'Lukas Kurniawan',
      type: 'Finance',
      status: 'Detail'
    },
    {
      id: '3',
      name: 'Budi Bekti',
      type: 'Director',
      status: 'Detail'
    }
  ])

  function $resetEmployee () {
    employee.fullname = ''
    employee.email = ''
    employee.role = ''
    employee.password = ''
    employee.password_confirmation = ''
  }

  async function getAllEmployee () {
    console.log('FETCH EMPLOYEE')
    // const response = await getAllEmployeeFromAPI()
    // employees.value = response.body
  }

  return { employee, employees, $resetEmployee, getAllEmployee }
})
