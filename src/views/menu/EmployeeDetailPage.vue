<template>
  <div class="contain background shadow">
    <div class="title">
      Employee
    </div>
    <form @submit.prevent="action()" class="row form">
      <div class="input form-group col-12">
        <label for="name">Full Name</label><br>
        <input type="text" class="form-control mt-2" v-model="employee.fullname" placeholder="Full name">
      </div>
      <div class="input form-group col-12">
        <label for="email">Email</label><br>
        <input type="email" class="form-control mt-2" v-model="employee.email" placeholder="Email">
      </div>
      <div class="input form-group col-12">
        <label for="role">Role</label><br>
        <select class="form-select" id="role" v-model="employee.role">
          <option v-for="(role, index) in roles" :key="index" :value="role">
            {{ role }}
          </option>
        </select>
      </div>
      <div class="input form-group col-6">
        <label for="password">Password</label><br>
        <input type="password" class="form-control mt-2" v-model="employee.password" placeholder="Password">
      </div>
      <div class="input form-group col-6">
        <label for="password">Confirm Password</label><br>
        <input type="password" class="form-control mt-2" v-model="employee.password_confirmation"
          placeholder="Retype Password">
      </div>
    </form>
  </div>
  <div class="button">
    <button type="button" class="btn btn-danger" @click="resetPassword()">
      Reset Password
    </button>
    <button type="submit" class="btn btn-update">
      Update Employee
    </button>
  </div>
</template>

<script setup>
import { useEmployeeStore } from '@/stores/employee'
import { storeToRefs } from 'pinia'

const employeeStore = useEmployeeStore()

const { employee } = storeToRefs(employeeStore)

const roles = [
  'Director',
  'Marketing',
  'Finance',
  'Inventory',
  'Service'
]

const resetPassword = () => {

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
