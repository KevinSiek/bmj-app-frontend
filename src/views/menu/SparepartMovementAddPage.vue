<template>
  <div class="contain" @click.capture="onRootClick">
    <div class="header">
      <div class="d-flex align-items-center">
        <button class="btn btn-outline-secondary me-3" @click="goBack">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h3>Add Sparepart Movement</h3>
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
      </div>

      <div class="form-group col-12">
        <div class="row header-row">
          <div class="col-5"><label>Sparepart Name</label></div>
          <div class="col-4"><label>Part Number</label></div>
          <div class="col-2"><label>Quantity</label></div>
          <div class="col-1"></div>
        </div>

        <div v-for="(item, index) in form.details" :key="index" class="list row">
          <!-- Sparepart Name typeahead -->
          <div class="col-5 sparepart-container" :data-index="index">
            <input type="text" class="form-control mt-2" v-model="item.sparepartName" placeholder="Part Name"
              @focus="openDropdown(index, 'name')"
              @input="onNameInput(index, item.sparepartName)"
              @keydown.esc.prevent="closeDropdown(index, 'name')"
              @blur="onNameBlur(index)"
              :class="{ 'is-invalid': !item.sparepart_id && item.sparepartName }" />

            <ul v-if="showDropdown[index] && showDropdown[index].name && spareparts.length > 0"
              class="dropdown-menu" style="display: block;">
              <li v-for="(sp, i) in spareparts" :key="i" class="dropdown-item"
                @mousedown.prevent @click="onSelect(index, sp)">
                {{ sp.sparepartName }}
              </li>
            </ul>

            <div v-if="!item.sparepart_id && item.sparepartName" class="invalid-feedback">
              Please select from suggestions to link sparepart
            </div>
          </div>

          <!-- Part Number typeahead -->
          <div class="col-4 sparepart-container" :data-index="index">
            <input type="text" class="form-control mt-2" v-model="item.sparepartNumber" placeholder="Part Number"
              @focus="openDropdown(index, 'number')"
              @input="onNumberInput(index, item.sparepartNumber)"
              @keydown.esc.prevent="closeDropdown(index, 'number')"
              @blur="onNumberBlur(index)" />

            <ul v-if="showDropdown[index] && showDropdown[index].number && spareparts.length > 0"
              class="dropdown-menu" style="display: block;">
              <li v-for="(sp, i) in spareparts" :key="i" class="dropdown-item"
                @mousedown.prevent @click="onSelect(index, sp)">
                {{ sp.sparepartNumber }}
              </li>
            </ul>
          </div>

          <div class="col-2">
            <input type="number" class="form-control mt-2" placeholder="Quantity" v-model.number="item.quantity" min="1" />
          </div>

          <div class="col-1 d-flex align-items-end">
            <button type="button" class="btn btn-outline-danger mt-2" @click="removeItem(index)">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>

        <p v-if="form.details.length === 0" class="text-center text-muted my-3">No items added</p>

        <div class="add-btn mt-3">
          <button type="button" class="btn btn-outline-dark" @click="addItem">
            <i class="bi bi-plus-lg"></i>
            <span class="mx-2">Add Sparepart</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="resetForm" :disabled="isSubmitting">Reset Value</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="submitConfirmation"
        :disabled="isSubmitting || form.details.length === 0">Add Movement</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useSparepartStore } from '@/stores/sparepart'
import { useSparepartMovementStore } from '@/stores/sparepart-movement'
import { common, menuMapping } from '@/config'
import { useModalStore } from '@/stores/modal'
import debounce from '@/utils/debouncer'

const router = useRouter()
const authStore = useAuthStore()
const sparepartStore = useSparepartStore()
const movementStore = useSparepartMovementStore()
const modalStore = useModalStore()

const { spareparts } = storeToRefs(sparepartStore)

const isSubmitting = ref(false)

const userBranch = computed(() => authStore.user?.branch)
const targetBranchOption = computed(() => {
  return userBranch.value === common.branch.jakarta ? common.branch.semarang : common.branch.jakarta
})

const form = ref({
  target_branch: '',
  reason: '',
  details: []
})

onMounted(() => {
  form.value.target_branch = targetBranchOption.value
})

// Per-row dropdown visibility: showDropdown[index] = { name: bool, number: bool }
const showDropdown = reactive({})

const openDropdown = (index, field = 'name') => {
  if (!showDropdown[index]) showDropdown[index] = { name: false, number: false }
  showDropdown[index][field] = true
}

const closeDropdown = (index, field) => {
  if (!showDropdown[index]) return
  if (field) {
    showDropdown[index][field] = false
  } else {
    showDropdown[index].name = false
    showDropdown[index].number = false
  }
  const anyOpen = Object.values(showDropdown[index] || {}).some(Boolean)
  if (!anyOpen) sparepartStore.$resetSpareparts()
}

const onRootClick = (evt) => {
  if (!evt.target.closest('.sparepart-container')) {
    Object.keys(showDropdown).forEach((k) => {
      if (showDropdown[k]) {
        showDropdown[k].name = false
        showDropdown[k].number = false
      }
    })
    sparepartStore.$resetSpareparts()
  }
}

const searchSparepart = (search) => {
  if (search !== '') sparepartStore.getAllSpareparts({ page: 1, search })
}

const onNameInput = (index, search) => {
  openDropdown(index, 'name')
  debounce(() => searchSparepart(search), 300, `search-movement-sparepart-name-${index}`)
}

const onNumberInput = (index, search) => {
  openDropdown(index, 'number')
  debounce(() => searchSparepart(search), 300, `search-movement-sparepart-number-${index}`)
}

const onNameBlur = (index) => setTimeout(() => closeDropdown(index, 'name'), 150)
const onNumberBlur = (index) => setTimeout(() => closeDropdown(index, 'number'), 150)

const onSelect = (index, sp) => {
  form.value.details.splice(index, 1, {
    ...form.value.details[index],
    sparepart_id: sp.sparepartId,
    sparepartName: sp.sparepartName,
    sparepartNumber: sp.sparepartNumber
  })
  closeDropdown(index)
}

const addItem = () => {
  form.value.details.push({ sparepart_id: '', sparepartName: '', sparepartNumber: '', quantity: 1 })
}

const removeItem = (index) => {
  form.value.details.splice(index, 1)
}

const goBack = () => {
  router.back()
}

const resetForm = () => {
  form.value.details = []
  form.value.reason = ''
}

const submit = async () => {
  if (isSubmitting.value) return
  try {
    isSubmitting.value = true
    await movementStore.create(form.value)
    router.push(menuMapping.sparepart_movement.path)
  } catch (error) {
    modalStore.openMessageModal(common.modal.failed, error.response?.data?.message || 'Failed to create movement')
  } finally {
    isSubmitting.value = false
  }
}

const submitConfirmation = () => {
  if (!form.value.target_branch) {
    return modalStore.openMessageModal(common.modal.failed, 'Target branch is required')
  }
  for (let i = 0; i < form.value.details.length; i++) {
    if (!form.value.details[i].sparepart_id || form.value.details[i].quantity < 1) {
      return modalStore.openMessageModal(common.modal.failed, 'Please select a sparepart and quantity for every row')
    }
  }

  modalStore.openConfirmationModal('to add this Stock Movement ?', 'Stock Movement created successfully', submit)
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.contain {
  padding: 2rem;
  background: white;
  border-radius: 8px;
}
.header {
  display: flex;
  justify-content: space-between;
}

.button {
  display: flex;
  margin: 1% 2rem 2rem;
  justify-content: space-between;

  .btn {
    padding: 1.3vh 2.2vw;
    font-weight: 500;
    color: white;
    font-size: 1.1vw;
    letter-spacing: 0.03vw;
  }

  .btn-edit {
    background-color: $secondary-color;
  }

  .btn-process {
    background-color: $primary-color;
  }
}

@media only screen and (max-width: 767px) {
  .button {
    margin: 4% 6%;

    .btn {
      padding: 1vh 4vw;
      font-size: 3.5vw;
    }
  }
}

.items {
  .list {
    display: flex;
    align-items: flex-start;
  }
  .header-row label {
    font-weight: 600;
  }
  .add-btn {
    display: flex;
    justify-content: center;
  }
}

.sparepart-container {
  position: relative;
}

.dropdown-menu {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
}
</style>
