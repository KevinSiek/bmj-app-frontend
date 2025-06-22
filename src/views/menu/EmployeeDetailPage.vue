<template>
  <div class="contain background shadow">
    <div class="title">
      Employee
    </div>
    <form @submit.prevent="action()" class="row form">
      <div class="input form-group col-12">
        <label for="name">FullName</label><br>
        <input type="text" class="form-control mt-2" v-model="employee.fullname" placeholder="Fullname" disabled>
      </div>
      <div class="input form-group col-12">
        <label for="username">Username</label><br>
        <input type="text" class="form-control mt-2" v-model="employee.username" placeholder="Username" disabled>
      </div>
      <div class="input form-group col-12">
        <label for="email">Email</label><br>
        <input type="email" class="form-control mt-2" v-model="employee.email" placeholder="Email" disabled>
      </div>
      <div class="input form-group col-12">
        <label for="role">Role</label><br>
        <select class="form-select mt-2" id="role" v-model="employee.role" disabled>
          <option v-for="(role, index) in roles" :key="index" :value="role">
            {{ role }}
          </option>
        </select>
      </div>
      <div class="input form-group col-6">
        <label for="password">Password</label><br>
        <div class="input-group mt-2">
          <input v-if="!isPassShow" type="password" class="input form-control" v-model="employee.password"
            placeholder="Password">
          <input v-else type="text" class="input form-control" v-model="employee.password" placeholder="Password">
          <span class="input input-group-text">
            <button type="button" @click="showHidePass()" class="showHideBtn">
              <svg v-if="!isPassShow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                class="bi bi-eye" viewBox="0 0 16 16">
                <path
                  d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                class="bi bi-eye-slash" viewBox="0 0 16 16">
                <path
                  d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                <path
                  d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                <path
                  d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
              </svg>
            </button>
          </span>
        </div>
      </div>
      <div class="input form-group col-6">
        <label for="password">Confirm Password</label><br>
        <div class="input-group mt-2">
          <input v-if="!isConfPassShow" type="password" class="input form-control"
            v-model="employee.password_confirmation" placeholder="Retype Password">
          <input v-else type="text" class="input form-control" v-model="employee.password_confirmation"
            placeholder="Retype Password">
          <span class="input input-group-text">
            <button type="button" @click="showHideConfPass()" class="showHideBtn">
              <svg v-if="!isConfPassShow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                class="bi bi-eye" viewBox="0 0 16 16">
                <path
                  d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                class="bi bi-eye-slash" viewBox="0 0 16 16">
                <path
                  d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                <path
                  d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                <path
                  d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-danger mx-3" @click="deleteEmployeeConfirmation">
        Delete Employee
      </button>
      <button type="button" class="btn btn-secondary mx-3" @click="resetPassword">
        Reset Password
      </button>
    </div>
    <button type="submit" class="btn btn-update" @click="goToEdit">
      Edit Employee
    </button>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig, common } from '@/config'
import { useEmployeeStore } from '@/stores/employee'
import { useModalStore } from '@/stores/modal'
import { validatePassword } from '@/utils/form-util'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const modalStore = useModalStore()
const employeeStore = useEmployeeStore()

const { employee } = storeToRefs(employeeStore)
const isPassShow = ref(false)
const isConfPassShow = ref(false)

const roles = [
  common.role.director,
  common.role.marketing,
  common.role.finance,
  common.role.inventory,
  common.role.service
]

onBeforeMount(() => {
  if (!employee.value) employeeStore.$resetEmployee()
})
onMounted(() => {
  employeeStore.getEmployee(route.params.id)
})

const resetPassword = () => {
}

const showHidePass = () => {
  isPassShow.value = !isPassShow.value
}
const showHideConfPass = () => {
  isConfPassShow.value = !isConfPassShow.value
}

const goToEdit = async () => {
  router.push(`${menuConfig.employee.path}/${employee.id}/edit`)
}

const deleteEmployee = async () => {
  if (validatePassword(employee.value.password, employee.value.password_confirmation)) {
    await employeeStore.deleteEmployee(employee.value.id)
    router.push(menuConfig.employee.path)
  }
  else {
    throw new Error('Confirm Password is not Match')
  }
}
const deleteEmployeeConfirmation = () => {
  modalStore.openConfirmationModal('to Delete this Employee ?', 'Delete Employee Success', deleteEmployee)
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

    .showHideBtn {
      background-color: transparent;
      border-color: transparent;
      display: flex;
    }
  }
}

.button {
  display: flex;
  margin: 2% 4%;
  justify-content: space-between;

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
