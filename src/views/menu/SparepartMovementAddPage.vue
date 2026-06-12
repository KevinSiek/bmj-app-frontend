<template>
  <div class="contain">
    <div class="header">
      <div class="d-flex align-items-center">
        <button class="btn btn-outline-secondary me-3" @click="goBack">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h3>Add Sparepart Movement</h3>
      </div>
      <div>
        <button class="btn btn-primary" @click="submit" :disabled="isSubmitting || form.details.length === 0">
          Save
        </button>
      </div>
    </div>
    
    <div class="body row mt-4">
      <div class="col-md-6 mb-3">
        <label class="form-label">Source Branch</label>
        <input type="text" class="form-control" :value="userBranch" disabled />
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">Target Branch</label>
        <select class="form-select" v-model="form.target_branch">
          <option :value="targetBranchOption">{{ targetBranchOption }}</option>
        </select>
      </div>
      <div class="col-md-12 mb-3">
        <label class="form-label">Reason</label>
        <textarea class="form-control" v-model="form.reason"></textarea>
      </div>
    </div>

    <div class="items mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4>Items</h4>
        <button class="btn btn-sm btn-outline-primary" @click="addItem">
          <i class="bi bi-plus"></i> Add Item
        </button>
      </div>
      
      <table class="table">
        <thead>
          <tr>
            <th>Sparepart</th>
            <th width="150">Quantity</th>
            <th width="50"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in form.details" :key="index">
            <td>
              <select class="form-select" v-model="item.sparepart_id">
                <option value="">Select Sparepart</option>
                <option v-for="sp in spareparts" :key="sp.id" :value="sp.id">
                  {{ sp.sparepart_number }} - {{ sp.sparepart_name }}
                </option>
              </select>
            </td>
            <td>
              <input type="number" class="form-control" v-model="item.quantity" min="1" />
            </td>
            <td>
              <button class="btn btn-sm btn-danger" @click="removeItem(index)">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="form.details.length === 0">
            <td colspan="3" class="text-center">No items added</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSparepartStore } from '@/stores/sparepart'
import { useSparepartMovementStore } from '@/stores/sparepart-movement'
import { common, menuMapping } from '@/config'
import { useModalStore } from '@/stores/modal'

const router = useRouter()
const authStore = useAuthStore()
const sparepartStore = useSparepartStore()
const movementStore = useSparepartMovementStore()
const modalStore = useModalStore()

const isSubmitting = ref(false)

const userBranch = computed(() => authStore.user?.branch)
const targetBranchOption = computed(() => {
  return userBranch.value === common.branch.jakarta ? common.branch.semarang : common.branch.jakarta
})

const spareparts = computed(() => sparepartStore.spareparts)

const form = ref({
  target_branch: '',
  reason: '',
  details: []
})

onMounted(async () => {
  form.value.target_branch = targetBranchOption.value
  await sparepartStore.getAllSpareparts({ no_pagination: true })
})

const addItem = () => {
  form.value.details.push({ sparepart_id: '', quantity: 1 })
}

const removeItem = (index) => {
  form.value.details.splice(index, 1)
}

const goBack = () => {
  router.back()
}

const submit = async () => {
  // validation
  if (!form.value.target_branch) {
    return modalStore.setModalMessage('Error', 'Target branch is required', false)
  }
  for (let i = 0; i < form.value.details.length; i++) {
    if (!form.value.details[i].sparepart_id || form.value.details[i].quantity < 1) {
      return modalStore.setModalMessage('Error', 'Please fill all sparepart details correctly', false)
    }
  }

  try {
    isSubmitting.value = true
    await movementStore.create(form.value)
    modalStore.setModalMessage('Success', 'Stock Movement created successfully', true)
    router.push(menuMapping.sparepart_movement.path)
  } catch (error) {
    modalStore.setModalMessage('Failed', error.response?.data?.message || 'Failed to create movement', false)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
.contain {
  padding: 2rem;
  background: white;
  border-radius: 8px;
}
.header {
  display: flex;
  justify-content: space-between;
}
</style>
