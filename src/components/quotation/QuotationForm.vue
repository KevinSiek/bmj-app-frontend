<template>
  <form class="row form" @click.capture="onRootClick">
    <!-- ... (unchanged upper and lower sections) ... -->
    <div v-if="quotation.project.type === 'Spareparts'" class="sparepart my-2">
      <div class="title">Sparepart</div>
      <div v-if="isTypeEdit" class="table-placeholder">
        <!-- table (unchanged) -->
      </div>
      <div v-else class="add-sparepart">
        <!-- headers (unchanged) -->
        <div class="form-group col-12 mx-3">
          <div v-for="(sparepart, sparepartIndex) in quotation.spareparts" :key="sparepartIndex" class="list row">
            <div class="col-11">
              <div class="row">
                <!-- Sparepart Name with Dropdown Control -->
                <div class="col-3 sparepart-container" :data-index="sparepartIndex">
                  <input
                    type="text"
                    class="form-control mt-2"
                    v-model="sparepart.sparepartName"
                    placeholder="Part Name"
                    @focus="openDropdown(sparepartIndex)"
                    @input="onNameInput(sparepartIndex, sparepart.sparepartName)"
                    @keydown.esc.prevent="closeDropdown(sparepartIndex)"
                    @blur="onInputBlur(sparepartIndex)"
                    :class="{ 'is-invalid': !sparepart.sparepartId && sparepart.sparepartName }"
                  />

                  <div
                    v-if="showDropdown[sparepartIndex] && searchedSpareparts.length > 0"
                    class="sparepart-dropdown"
                  >
                    <button
                      v-for="(item, index) in searchedSpareparts"
                      :key="index"
                      type="button"
                      class="sparepart-suggestion-btn"
                      @mousedown.prevent
                      @click="onSelect(sparepartIndex, sparepart, item)"
                    >
                      {{ item.sparepartName }}
                    </button>
                  </div>

                  <div v-if="!sparepart.sparepartId && sparepart.sparepartName" class="invalid-feedback">
                    Please select from suggestions to link sparepart ID
                  </div>
                </div>

                <!-- Part Number with Dropdown Control -->
                <div class="col-3 sparepart-container" :data-index="sparepartIndex">
                  <input
                    type="text"
                    class="form-control mt-2"
                    v-model="sparepart.sparepartNumber"
                    placeholder="Part Number"
                    @focus="openDropdown(sparepartIndex)"
                    @input="onNumberInput(sparepartIndex, sparepart.sparepartNumber)"
                    @keydown.esc.prevent="closeDropdown(sparepartIndex)"
                    @blur="onInputBlur(sparepartIndex)"
                  />

                  <div
                    v-if="showDropdown[sparepartIndex] && searchedSpareparts.length > 0"
                    class="sparepart-dropdown"
                  >
                    <button
                      v-for="(item, index) in searchedSpareparts"
                      :key="index"
                      type="button"
                      class="sparepart-suggestion-btn"
                      @mousedown.prevent
                      @click="onSelect(sparepartIndex, sparepart, item)"
                    >
                      {{ item.sparepartNumber }}
                    </button>
                  </div>
                </div>

                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="sparepart.quantity"
                    @input="updateSparepartCalculation(sparepartIndex, sparepart)">
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Unit Price"
                    v-model="sparepart.unitPriceSell" @change="updateSparepartCalculation(sparepartIndex, sparepart)">
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Total Price"
                    v-model="sparepart.totalPrice" disabled>
                </div>
              </div>
            </div>
            <div class="col-1">
              <button type="button" class="btn btn-outline-danger" @click="removeSparepart(sparepartIndex)"><i
                  class="bi bi-trash3"></i></button>
            </div>
          </div>
          <div class="add-btn mt-3">
            <button type="button" class="btn btn-outline-dark" @click="addSparepart">
              <i class="bi bi-plus-lg"></i>
              <span class="mx-2">Add Sparepart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
import { computed, onBeforeMount, reactive } from 'vue'
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

const { isRoleDirector, isRoleMarketing, user } = useRole()

const props = defineProps({
  type: String,
  action: Function
})

const isTypeEdit = props.type == common.form.type.view
const isTypeAdd = props.type == common.form.type.add
const disabled = computed(() => isTypeEdit ? true : false)

// Dropdown visibility state per row index
const showDropdown = reactive([])

const openDropdown = (index) => {
  showDropdown[index] = true
}
const closeDropdown = (index) => {
  showDropdown[index] = false
  // Clear search results to force dropdown to hide
  // Note: quotationStore may refetch if input changes; clearing keeps UI closed
  searchedSpareparts.value = []
}

// Root click to close any open dropdown when clicking outside suggestions/inputs
const onRootClick = (evt) => {
  const container = evt.target.closest('.sparepart-container')
  if (!container) {
    // Clicked outside any sparepart container → close all
    Object.keys(showDropdown).forEach((k) => (showDropdown[k] = false))
    searchedSpareparts.value = []
  }
}

// Input handlers with debounced search and dropdown control
const searchSparepart = (search) => {
  if (search !== '') quotationStore.getSpareparts({ page: 1, search })
}
const onNameInput = (index, search) => {
  openDropdown(index)
  debounce(() => searchSparepart(search), 300, `search-quotation-sparepart-name-${index}`)
}
const onNumberInput = (index, search) => {
  openDropdown(index)
  debounce(() => searchSparepart(search), 300, `search-quotation-sparepart-number-${index}`)
}
const onInputBlur = (index) => {
  // Defer closing to allow click on suggestion (since it uses mousedown)
  setTimeout(() => closeDropdown(index), 150)
}

const handleInputSearchCustomer = (search) => {
  if (search) debounce(() => customerStore.getCustomers({ search }), 300, 'search-quotation-customer')
}
const selectItemCustomer = (customerData) => {
  quotation.value.customer = customerData
}

const amount = computed(() => {
  if (quotation.value.project.type === 'Spareparts') {
    return quotation.value.spareparts.reduce((sum, item) => sum + item.totalPrice, 0)
  } else {
    return quotation.value.services.reduce((sum, item) => sum + item.totalPrice, 0)
  }
})

const onSelect = (index, purchaseData, sparepartData) => {
  if (!sparepartData) return
  const data = {
    ...purchaseData,
    sparepartId: sparepartData.id || sparepartData.sparepartId || sparepartData.sparepart_id,
    sparepartName: sparepartData.sparepartName || sparepartData.sparepart_name || sparepartData.name,
    sparepartNumber: sparepartData.sparepartNumber || sparepartData.sparepart_number || sparepartData.part_number,
    unitPriceSell: sparepartData.unitPriceSell || sparepartData.unit_price_sell || sparepartData.selling_price || purchaseData.unitPriceSell || 0,
    quantity: purchaseData.quantity || 1,
    stock: sparepartData.stock || sparepartData.available_stock || 'available'
  }
  data.totalPrice = (data.quantity || 0) * (data.unitPriceSell || 0)
  if (!data.sparepartId) {
    alert('Error: Could not get sparepart ID from selection. Please check the sparepart data format.')
    return
  }
  quotation.value.spareparts.splice(index, 1, data)
  updatePrice()
  // Close dropdown and clear results after selection
  closeDropdown(index)
}

const updateSparepartCalculation = (index, sparepartData) => {
  const data = { ...sparepartData }
  data.totalPrice = (data.quantity || 0) * (data.unitPriceSell || 0)
  quotation.value.spareparts.splice(index, 1, data)
  updatePrice()
}

const selectService = (index, serviceData) => {
  const data = { ...serviceData }
  data.totalPrice = data.quantity * data.unitPriceSell
  quotation.value.services.splice(index, 1, data)
  updatePrice()
}

const updatePrice = () => {
  quotation.value.price.amount = amount.value
  quotation.value.price.subtotal = amount.value - quotation.value.price.discount
  const ppn = quotation.value.price.subtotal * 11 / 100
  quotation.value.price.ppn = ppn
  quotation.value.price.grandTotal = quotation.value.price.subtotal + ppn
}

const addSparepart = () => {
  quotation.value.spareparts.push({
    sparepartId: '',
    sparepartName: '',
    sparepartNumber: '',
    quantity: 0,
    unitPriceSell: 0,
    totalPrice: 0,
    stock: ''
  })
}

const addService = () => {
  quotation.value.services.push({
    service: '',
    quantity: 0,
    unitPriceSell: 0,
    totalPrice: 0
  })
}

const removeSparepart = (index) => {
  quotation.value.spareparts.splice(index, 1)
  updatePrice()
}

const removeService = (index) => {
  quotation.value.services.splice(index, 1)
  updatePrice()
}

onBeforeMount(() => {
  if (!quotation.value) quotationStore.$resetQuotation()
  if (isRoleMarketing.value && user.value) {
    let userBranch = 'Jakarta'
    if (user.value.email) {
      if (user.value.email.includes('citra.k@bmj.com')) {
        userBranch = 'Jakarta'
      } else if (user.value.branch) {
        userBranch = user.value.branch
      } else if (user.value.email.includes('semarang') || user.value.email.includes('smg')) {
        userBranch = 'Semarang'
      }
    }
    quotation.value.project.branch = userBranch
  }
})
</script>

<style lang="scss" scoped>
/* existing styles unchanged */
</style>
