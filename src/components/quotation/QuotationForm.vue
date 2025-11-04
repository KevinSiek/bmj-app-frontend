<template>
  <form class="row form">
    <div class="upper my-2">
      <div class="title">Project</div>
      <div class="data">
        <div v-if="!isTypeAdd" class="left">
          <div class="input form-group col-12">
            <label for="">No Quotation</label><br>
            <input type="text" class="form-control mt-2" v-model="quotation.project.quotationNumber"
              placeholder="No Quotation" :disabled="disabled">
          </div>
          <div class="input form-group col-12">
            <label for="">Date Quotation</label><br>
            <input type="date" class="form-control mt-2" v-model="quotation.project.date" placeholder="Date"
              :disabled="disabled">
          </div>
        </div>
        <!-- CRITICAL FIX v2.1: Preserve grid layout: two equal columns -->
        <div v-else class="left">
          <div class="row g-3 align-items-start">
            <!-- Left column: Branch -->
            <div class="col-12 col-md-6">
              <div class="input form-group">
                <label class="form-label">Branch</label>
                <template v-if="isRoleDirector">
                  <select class="form-select mt-2" aria-label="Branch" v-model="quotation.project.branch"
                    :disabled="disabled">
                    <option value="" disabled selected>Select Branch</option>
                    <option value="Semarang">Semarang</option>
                    <option value="Jakarta">Jakarta</option>
                  </select>
                </template>
                <template v-else>
                  <input type="text" class="form-control mt-2 readonly-branch" :value="quotation.project.branch" disabled>
                </template>
              </div>
            </div>
            <!-- Right column: Project Type -->
            <div class="col-12 col-md-6">
              <div class="input form-group">
                <label class="form-label">Project Type</label>
                <select class="form-select mt-2" aria-label="Project Type" v-model="quotation.project.type"
                  :disabled="disabled">
                  <option value="" disabled selected>Select Project Type</option>
                  <option value="Spareparts">Spareparts</option>
                  <option value="Service">Service</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- rest unchanged -->
  </form>
</template>

<script setup>
import { computed, onBeforeMount } from 'vue'
import { common } from '@/config'
import { useQuotationStore } from '@/stores/quotation'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { formatCurrency } from '@/utils/form-util'
import { useCustomerStore } from '@/stores/customer'
import { useRole } from '@/composeable/useRole'

const quotationStore = useQuotationStore()
const customerStore = useCustomerStore()

const { quotation, searchedSpareparts } = storeToRefs(quotationStore)
const { customers } = storeToRefs(customerStore)

const { user, isRoleDirector, isRoleMarketing, isRoleFinance, isRoleInventory, isRoleService } = useRole()

const props = defineProps({ type: String, action: Function })

const isTypeEdit = props.type == common.form.type.view
const isTypeAdd = props.type == common.form.type.add
const disabled = computed(() => isTypeEdit ? true : false)

onBeforeMount(() => {
  if (!quotation.value) quotationStore.$resetQuotation()
  // Auto-fill/lock branch for non-Director
  try {
    if (!isRoleDirector.value) {
      const branch = user.value?.branch || user.value?.employee?.branch || ''
      if (branch) quotation.value.project.branch = branch
    }
  } catch (e) { console.warn('Branch auto-fill failed', e) }
})

// rest of script unchanged
</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.title { font-size: 22px; font-weight: 600; margin-bottom: 1%; display: flex; justify-content: space-between; }
.input { margin: 2% 0%; }
.upper, .lower { .data { display: flex; justify-content: space-between; } .left, .right { width: 48%; } }

/* NEW: Keep Branch + Project Type aligned on one row; stack on mobile */
.readonly-branch { background: #f8f9fa; cursor: not-allowed; }

@media (max-width: 767px) { .upper, .lower { .data { flex-direction: column; } .left, .right { width: 100%; } } }
</style>