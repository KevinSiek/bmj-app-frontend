<template>
  <div class="contain background shadow">
    <form @submit.prevent="action()" class="row form" autocomplete="off">
      <div class="input form-group col-12">
        <label for="name">FullName</label><br>
        <input type="text" class="form-control mt-2" :class="{ 'is-invalid': errors.fullname }" v-model="employee.fullname" placeholder="Fullname" autocomplete="off">
        <div class="invalid-feedback">{{ errors.fullname }}</div>
      </div>
      <div class="input form-group col-12">
        <label for="username">Username</label><br>
        <input type="text" class="form-control mt-2" :class="{ 'is-invalid': errors.username }" v-model="employee.username" placeholder="Username" autocomplete="off">
        <div class="invalid-feedback">{{ errors.username }}</div>
      </div>
      <div class="input form-group col-12">
        <label for="email">Email</label><br>
        <input type="email" class="form-control mt-2" :class="{ 'is-invalid': errors.email }" v-model="employee.email" placeholder="Email" autocomplete="off">
        <div class="invalid-feedback">{{ errors.email }}</div>
      </div>
      <div class="input form-group col-12">
        <label for="role">Role</label><br>
        <select class="form-select mt-2" :class="{ 'is-invalid': errors.role }" id="role" v-model="employee.role">
          <option v-for="(role, index) in roles" :key="index" :value="role">
            {{ role }}
          </option>
        </select>
        <div class="invalid-feedback">{{ errors.role }}</div>
      </div>
      <div class="input form-group col-12">
        <label>Group</label><br>
        <input type="text" class="form-control mt-2" v-model="employee.group" placeholder="Group" autocomplete="off"
          data-bs-toggle="dropdown" aria-expanded="false">
        <ul class="dropdown-menu">
          <li v-for="g in filteredGroupOptions" :key="g" class="dropdown-item" @click="employee.group = g">{{ g }}</li>
        </ul>
      </div>
      <div class="input form-group col-12">
        <label for="branch">Branch</label><br>
        <select class="form-select mt-2" :class="{ 'is-invalid': errors.branch }" id="branch" v-model="employee.branch">
          <option value="" disabled selected>Select Branch</option>
          <option v-for="(branch, index) in common.branch" :key="index" :value="branch">
            {{ branch }}
          </option>
        </select>
        <div class="invalid-feedback">{{ errors.branch }}</div>
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
import { computed, onBeforeMount, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { common } from '@/config'

const route = useRoute()
const router = useRouter()
const modalStore = useModalStore()
const employeeStore = useEmployeeStore()

const { employee, groupOptions } = storeToRefs(employeeStore)

const isProcessing = ref(false)
const filteredGroupOptions = computed(() =>
  groupOptions.value.filter(g => g.toLowerCase().includes((employee.value?.group || '').toLowerCase()))
)

const roles = [
  common.role.director,
  common.role.marketing,
  common.role.finance,
  common.role.inventory_admin,
  common.role.inventory_purchase,
  common.role.head_inventory,
  common.role.service
]

const errors = computed(() => {
  const errs = {}
  if (!employeeStore.isDirty) return errs
  const e = employee.value
  if (!e) return errs

  if (!e.fullname?.trim()) errs.fullname = 'Full Name is required.'
  if (!e.username?.trim()) errs.username = 'Username is required.'
  if (!e.email?.trim()) {
    errs.email = 'Email is required.'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(e.email.trim())) {
      errs.email = 'Email format is invalid.'
    }
  }
  if (!e.role) errs.role = 'Role is required.'
  if (!e.branch) errs.branch = 'Branch is required.'
  return errs
})

watch(
  () => employee.value,
  (newVal, oldVal) => {
    if (newVal !== null && oldVal !== null) {
      employeeStore.isDirty = true
    }
  },
  { deep: true }
)

onBeforeMount(() => {
  if (!employee.value) employeeStore.$resetEmployee()
  employeeStore.getGroups()
})
onMounted(async () => {
  await employeeStore.getEmployee(route.params.id)
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
  const errorMsg = employeeStore.validateEmployee(true)
  if (errorMsg) {
    employeeStore.isDirty = true
    return
  }
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

@media only screen and (max-width: 767px) {
  .button {
    margin: 4% 6%;
    flex-direction: column;
    gap: 15px;

    .btn {
      padding: 1.2vh 4vw;
      font-size: 3vw;
      width: 100%;
      margin: 0;
    }

    .left,
    .right {
      display: flex;
      flex-direction: row;
      gap: 10px;
      width: 100%;

      .btn {
        width: calc(50% - 5px);
      }
    }
  }
}
</style>
