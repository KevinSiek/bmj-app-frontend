<template>
  <div class="contain background shadow">
    <div class="row mt-4">
      <div class="col-md-6 mb-3">
        <label class="form-label">Source Branch</label>
        <select class="form-select" :class="{ 'is-invalid': errors.source_branch }" aria-label="Branch" v-model="form.source_branch" :disabled="isSubmitting">
          <option value="" disabled selected>Select Branch</option>
          <option value="Semarang">Semarang</option>
          <option value="Jakarta">Jakarta</option>
        </select>
        <div class="invalid-feedback">{{ errors.source_branch }}</div>
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">Target Branch</label>
        <select class="form-select" :class="{ 'is-invalid': errors.target_branch }" aria-label="Branch" v-model="form.target_branch" :disabled="isSubmitting">
          <option value="" disabled selected>Select Branch</option>
          <option value="Semarang">Semarang</option>
          <option value="Jakarta">Jakarta</option>
        </select>
        <div class="invalid-feedback">{{ errors.target_branch }}</div>
      </div>
      <div class="col-md-12 mb-3">
        <label class="form-label">Reason</label>
        <textarea class="form-control" v-model="form.reason"></textarea>
      </div>
    </div>

    <div class="items mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4>Spareparts</h4>
      </div>

      <div class="form-group col-12">
        <div class="row header-row">
          <div class="col-4"><label>Sparepart Name</label></div>
          <div class="col-3"><label>Part Number</label></div>
          <div class="col-2"><label>Stock {{ form.source_branch }}</label></div>
          <div class="col-2"><label>Quantity</label></div>
          <div class="col-1"></div>
        </div>

        <div v-for="(item, index) in form.details" :key="index" class="list row">
          <!-- Sparepart Name typeahead -->
          <div class="col-4">
            <input type="text" class="form-control mt-2" :class="{ 'is-invalid': errors[`item_${index}_id`] }" v-model="item.sparepartName" placeholder="Part Name"
              data-bs-toggle="dropdown" aria-expanded="false" @change="onNameInput(index, item.sparepartName)"
              @keyup="onNameInput(index, item.sparepartName)" />
            <ul class="dropdown-menu">
              <li v-for="(sp, i) in searchedSpareparts" :key="i" class="dropdown-item" @click="onSelect(index, sp)">
                {{ sp.sparepartName }}
              </li>
            </ul>
            <div class="invalid-feedback">{{ errors[`item_${index}_id`] }}</div>
          </div>

          <!-- Part Number typeahead -->
          <div class="col-3">
            <input type="text" class="form-control mt-2" :class="{ 'is-invalid': errors[`item_${index}_id`] }" v-model="item.sparepartNumber" placeholder="Part Number"
              data-bs-toggle="dropdown" aria-expanded="false" @change="onNumberInput(index, item.sparepartNumber)"
              @keyup="onNumberInput(index, item.sparepartNumber)" />
            <ul class="dropdown-menu">
              <li v-for="(sp, i) in searchedSpareparts" :key="i" class="dropdown-item" @click="onSelect(index, sp)">
                {{ sp.sparepartNumber }}
              </li>
            </ul>
            <div class="invalid-feedback">{{ errors[`item_${index}_id`] }}</div>
          </div>

          <div class="col-2">
            <input type="text" class="form-control mt-2"
              :value="isSearching ? 'Loading...' : (item.totalUnit?.[form?.source_branch] ?? '')"
              :placeholder="isSearching ? 'Loading...' : 'Stock'" disabled />
          </div>

          <div class="col-2">
            <input type="number" class="form-control mt-2" :class="{ 'is-invalid': errors[`item_${index}_quantity`] }" placeholder="Quantity" v-model.number="item.quantity"
              min="1" @wheel.prevent />
            <div class="invalid-feedback">{{ errors[`item_${index}_quantity`] }}</div>
          </div>

          <div class="col-1 d-flex align-items-end">
            <button type="button" class="btn btn-outline-danger mt-2" @click="removeItem(index)">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>

        <p v-if="form.details.length === 0" class="text-center text-muted my-3">No items added</p>
        <div v-if="errors.detailsEmpty" class="text-danger mt-2 small text-center">{{ errors.detailsEmpty }}</div>

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
        :disabled="isSubmitting">Add Movement</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSparepartMovementStore } from '@/stores/sparepart-movement'
import { common, menuMapping } from '@/config'
import { useModalStore } from '@/stores/modal'
import debounce from '@/utils/debouncer'

const router = useRouter()
const movementStore = useSparepartMovementStore()
const modalStore = useModalStore()

const { searchedSpareparts } = storeToRefs(movementStore)

const isSubmitting = ref(false)
const isSearching = ref(false)
const isDirty = ref(false)

const form = ref({
  source_branch: '',
  target_branch: '',
  reason: '',
  details: []
})

const errors = computed(() => {
  const errs = {}
  if (!isDirty.value) return errs
  const f = form.value

  if (!f.source_branch) {
    errs.source_branch = 'Source branch is required.'
  }
  if (!f.target_branch) {
    errs.target_branch = 'Target branch is required.'
  }
  if (!f.details || f.details.length === 0) {
    errs.detailsEmpty = 'At least one sparepart is required.'
  } else {
    f.details.forEach((item, index) => {
      if (!item.sparepart_id) {
        errs[`item_${index}_id`] = 'Please select from suggestions.'
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        errs[`item_${index}_quantity`] = 'Quantity must be greater than 0.'
      }
    })
  }
  return errs
})

const opposite = (branch) => branch === common.branch.jakarta ? common.branch.semarang : common.branch.jakarta

watch(() => form.value.source_branch, (val) => {
  const opp = opposite(val)
  if (form.value.target_branch !== opp) form.value.target_branch = opp
})

watch(() => form.value.target_branch, (val) => {
  const opp = opposite(val)
  if (form.value.source_branch !== opp) form.value.source_branch = opp
})

watch(
  () => form.value,
  () => {
    isDirty.value = true
  },
  { deep: true }
)

const searchSparepart = async (search) => {
  if (search !== '') {
    isSearching.value = true
    await movementStore.getSpareparts({ page: 1, search })
    isSearching.value = false
  }
}

const onNameInput = (index, search) => {
  debounce(() => searchSparepart(search), 300, `search-movement-sparepart-name-${index}`)
}

const onNumberInput = (index, search) => {
  debounce(() => searchSparepart(search), 300, `search-movement-sparepart-number-${index}`)
}

const onSelect = (index, sp) => {
  form.value.details.splice(index, 1, {
    ...form.value.details[index],
    sparepart_id: sp.sparepartId,
    sparepartName: sp.sparepartName,
    sparepartNumber: sp.sparepartNumber,
    totalUnit: sp.totalUnit || {}
  })
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
  isDirty.value = false
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
  isDirty.value = true
  if (Object.keys(errors.value).length > 0) {
    return
  }

  modalStore.openConfirmationModal('to add this Stock Movement ?', 'Stock Movement created successfully', submit)
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);


.contain {
  padding: 2% 3%;
  height: 72vh;
}


.button {
  display: flex;
  margin: 2% 4%;
  justify-content: space-between;

  .btn {
    padding: 1.5vh 3vw 1.5vh 3vw;
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
  overflow-y: auto;
  max-height: 300px;
}
</style>
