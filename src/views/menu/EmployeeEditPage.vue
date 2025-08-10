<template>
  <div class="contain background shadow">
    <form @submit.prevent="action()" class="row form">
      <div class="input form-group col-12">
        <label for="name">FullName</label><br>
        <input type="text" class="form-control mt-2" v-model="employee.fullname" placeholder="Fullname">
      </div>
      <div class="input form-group col-12">
        <label for="username">Username</label><br>
        <input type="text" class="form-control mt-2" v-model="employee.username" placeholder="Username">
      </div>
      <div class="input form-group col-12">
        <label for="email">Email</label><br>
        <input type="email" class="form-control mt-2" v-model="employee.email" placeholder="Email">
      </div>
      <div class="input form-group col-12">
        <label for="role">Role</label><br>
        <select class="form-select mt-2" id="role" v-model="employee.role">
          <option v-for="(role, index) in roles" :key="index" :value="role">
            {{ role }}
          </option>
        </select>
      </div>
      <div class="input form-group col-12">
        <label for="branch">Branch</label><br>
        <select class="form-select mt-2" id="branch" v-model="employee.branch">
          <option value="" disabled selected>Select Branch</option>
          <option v-for="(branch, index) in common.branch" :key="index" :value="branch">
            {{ branch }}
          </option>
        </select>
      </div>
    </form>
  </div>
  <div class="button">
    <button type="submit" class="btn btn-update" @click="updateEmployeeConfirmation" :disabled="isProcessing">
      Edit Employee
    </button>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import { useEmployeeStore } from '@/stores/employee'
import { useModalStore } from '@/stores/modal'
import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { common } from '@/config'

const route = useRoute()
const router = useRouter()
const modalStore = useModalStore()
const employeeStore = useEmployeeStore()

const { employee } = storeToRefs(employeeStore)

const isProcessing = ref(false)

const roles = [
  'Director',
  'Marketing',
  'Finance',
  'Inventory',
  'Service'
]

onBeforeMount(() => {
  if (!employee.value) employeeStore.$resetEmployee()
})

const updateEmployee = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await employeeStore.updateEmployee(route.params.id)
    router.push(`${menuConfig.employee.path}/${route.params.id}`)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}

const updateEmployeeConfirmation = () => {
  modalStore.openConfirmationModal('to Update this Employee ?', 'Update Employee Success', updateEmployee)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;

.contain {
  padding: 2.3% 5%;
  height: 72vh;

  .title {
    font-size: 35px;
    margin-bottom: 2%;
  }

  .input {
    margin: 1% 0%;
  }
}

.button {
  display: flex;
  margin: 2% 4%;
  justify-content: flex-end;

  .btn {
    padding: 1.5vh 2vw 1.5vh 2vw;
    font-weight: 500;
    color: white;
    font-size: 1.1vw;
    letter-spacing: 0.03vw;
  }

  .btn-update {
    background-color: $primary-color;
  }
}
</style>
