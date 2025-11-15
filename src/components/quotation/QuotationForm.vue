<template>
  <form class="row form" @click.capture="onRootClick">
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
        <div v-else-if="isRoleDirector" class="left">
          <div class="input form-group col-12">
            <label for="">Branch</label><br>
            <select class="form-select mt-2" aria-label="Branch" v-model="quotation.project.branch"
              :disabled="disabled">
              <option value="" disabled selected>Select Branch</option>
              <option value="Semarang">Semarang</option>
              <option value="Jakarta">Jakarta</option>
            </select>
          </div>
        </div>
        <div v-else-if="isRoleMarketing" class="left">
          <div class="input form-group col-12">
            <label for="">Branch</label><br>
            <input type="text" class="form-control mt-2" :value="quotation.project.branch" placeholder="Branch" disabled
              readonly>
            <small class="text-muted">Branch automatically set based on your profile</small>
          </div>
        </div>
        <div class="right">
          <div class="input form-group col-12">
            <label for="">Project Type</label><br>
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
    <div class="lower my-2">
      <div class="title">Customer</div>
      <div class="data">
        <div class="left">
          <div class="input form-group col-12">
            <label for="">Company Name</label><br>
            <input type="text" class="form-control mt-2" v-model="quotation.customer.companyName"
              placeholder="Company Name" data-bs-toggle="dropdown" aria-expanded="false"
              @change="handleInputSearchCustomer(quotation.customer.companyName)"
              @keyup="handleInputSearchCustomer(quotation.customer.companyName)" :disabled="disabled">
            <ul class="dropdown-menu dropdown-menu-customer">
              <li v-for="(item, index) in customers" :key="index" class="dropdown-item"
                @click="selectItemCustomer(item)">
                {{ item.companyName }}
              </li>
            </ul>
          </div>
          <div class="input form-group col-12">
            <label for="">Address</label><br>
            <input type="text" class="form-control mt-2" v-model="quotation.customer.address" placeholder="Address"
              :disabled="disabled">
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">City</label><br>
                <input type="text" class="form-control mt-2" v-model="quotation.customer.city" placeholder="City"
                  :disabled="disabled">
              </div>
              <div class="col-6">
                <label for="">Province</label><br>
                <input type="text" class="form-control mt-2" v-model="quotation.customer.province"
                  placeholder="Province" :disabled="disabled">
              </div>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="input form-group col-12">
            <label for="">Office</label><br>
            <input type="text" class="form-control mt-2" v-model="quotation.customer.office" placeholder="Office"
              :disabled="disabled">
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">Urban</label><br>
                <input type="text" class="form-control mt-2" v-model="quotation.customer.urban" placeholder="Urban"
                  :disabled="disabled">
              </div>
              <div class="col-6">
                <label for="">Subdistrict</label><br>
                <input type="text" class="form-control mt-2" v-model="quotation.customer.subdistrict"
                  placeholder="Subdistrict" :disabled="disabled">
              </div>
            </div>
          </div>
          <div class="input form-group col-12">
            <label for="">Postal Code</label><br>
            <input type="text" class="form-control mt-2" v-model="quotation.customer.postalCode"
              placeholder="Postal Code" :disabled="disabled">
          </div>
        </div>
      </div>
    </div>
    <div v-if="quotation.project.type === 'Spareparts'" class="sparepart my-2">
      <div class="title">Sparepart</div>
      <div v-if="isTypeEdit" class="table-placeholder">
        <table class="table table-hover">
          <thead>
            <tr class="align-middle">
              <th scope="col-1" class="table-number">NO</th>
              <th scope="col" class="table-name">PART NAME</th>
              <th scope="col" class="table-part-number">PART NUMBER</th>
              <th scope="col" class="table-name">QUANTITY</th>
              <th scope="col" class="table-name">UNIT</th>
              <th scope="col" class="table-name">UNIT PRICE</th>
              <th scope="col" class="table-name">TOTAL PRICE</th>
              <th scope="col" class="table-name">STOCK</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <tr v-for="(sparepart, index) in quotation.spareparts" :key="index" class="align-middle">
              <td scope="row" class="table-col table-number">{{ index + 1 }}</td>
              <td class="table-col table-part-number">{{ sparepart.sparepartName }}</td>
              <td class="table-col table-name">{{ sparepart.sparepartNumber }}</td>
              <td class="table-col table-name">{{ sparepart.quantity }}</td>
              <td class="table-col table-name">{{ sparepart.unit || 'pcs' }}</td>
              <td class="table-col table-name">{{ formatCurrency(sparepart.unitPriceSell) }}</td>
              <td class="table-col table-name">{{ formatCurrency(sparepart.totalPrice) }}</td>
              <td class="table-col table-name">{{ sparepart.stock }}</td>
            </tr>
            <tr class="align-middle">
              <td scope="row" class="table-col table-number"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-part-number">SubTotal</td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">{{ formatCurrency(quotation.price.subtotal) }}</td>
              <td class="table-col table-name"></td>
            </tr>
            <tr class="align-middle">
              <td scope="row" class="table-col table-number"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">PPN 11%</td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">{{ formatCurrency(quotation.price.ppn) }}</td>
              <td class="table-col table-name"></td>
            </tr>
            <tr class="align-middle">
              <td scope="row" class="table-col table-number"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">Grand Total</td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">{{ formatCurrency(quotation.price.grandTotal) }}</td>
              <td class="table-col table-name"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="add-sparepart">
        <div class="form-group col-12 mx-3">
          <div class="row">
            <div class="col-11">
              <div class="row">
                <div class="col-3">
                  <label for="">Sparepart Name</label>
                </div>
                <div class="col-3">
                  <label for="">Part Number</label>
                </div>
                <div class="col-2">
                  <label for="">Quantity</label>
                </div>
                <div class="col-2">
                  <label for="">Unit Price</label>
                </div>
                <div class="col-2">
                  <label for="">Total Price</label>
                </div>
              </div>
            </div>
            <div class="col-1">
              <div class="button-placeholder"></div>
            </div>
          </div>
        </div>
        <div class="form-group col-12 mx-3">
          <div v-for="(sparepart, sparepartIndex) in quotation.spareparts" :key="sparepartIndex" class="list row">
            <div class="col-11">
              <div class="row">
                <!-- FIXED: Sparepart Name with Controlled Dropdown -->
                <div class="col-3 sparepart-container" :data-index="sparepartIndex">
                  <input type="text" class="form-control mt-2" v-model="sparepart.sparepartName" placeholder="Part Name"
                    @focus="openDropdown(sparepartIndex, 'name')"
                    @input="onNameInput(sparepartIndex, sparepart.sparepartName)"
                    @keydown.esc.prevent="closeDropdown(sparepartIndex, 'name')" @blur="onNameBlur(sparepartIndex)"
                    :class="{ 'is-invalid': !sparepart.sparepartId && sparepart.sparepartName }" />

                  <!-- FIXED: Controlled dropdown visibility (Bootstrap-style list like Purchase page) -->
                  <ul
                    v-if="showDropdown[sparepartIndex] && showDropdown[sparepartIndex].name && searchedSpareparts.length > 0"
                    class="dropdown-menu" style="display: block;">
                    <li v-for="(item, index) in searchedSpareparts" :key="index" class="dropdown-item"
                      @mousedown.prevent @click="onSelect(sparepartIndex, sparepart, item)">
                      {{ item.sparepartName }}
                    </li>
                  </ul>

                  <div v-if="!sparepart.sparepartId && sparepart.sparepartName" class="invalid-feedback">
                    Please select from suggestions to link sparepart ID
                  </div>
                </div>

                <!-- FIXED: Part Number with Controlled Dropdown -->
                <div class="col-3 sparepart-container" :data-index="sparepartIndex">
                  <input type="text" class="form-control mt-2" v-model="sparepart.sparepartNumber"
                    placeholder="Part Number" @focus="openDropdown(sparepartIndex, 'number')"
                    @input="onNumberInput(sparepartIndex, sparepart.sparepartNumber)"
                    @keydown.esc.prevent="closeDropdown(sparepartIndex, 'number')"
                    @blur="onNumberBlur(sparepartIndex)" />

                  <!-- FIXED: Controlled dropdown visibility (Bootstrap-style list like Purchase page) -->
                  <ul
                    v-if="showDropdown[sparepartIndex] && showDropdown[sparepartIndex].number && searchedSpareparts.length > 0"
                    class="dropdown-menu" style="display: block;">
                    <li v-for="(item, index) in searchedSpareparts" :key="index" class="dropdown-item"
                      @mousedown.prevent @click="onSelect(sparepartIndex, sparepart, item)">
                      {{ item.sparepartNumber }}
                    </li>
                  </ul>
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
    <div v-if="quotation.project.type === 'Service'" class="service my-2">
      <div class="title">Service</div>
      <div v-if="isTypeEdit" class="table-placeholder">
        <table class="table table-hover">
          <thead>
            <tr class="align-middle">
              <th scope="col-1" class="table-number">NO</th>
              <th scope="col" class="table-name">SERVICE NAME</th>
              <th scope="col" class="table-name">QUANTITY</th>
              <th scope="col" class="table-name">UNIT PRICE</th>
              <th scope="col" class="table-name">TOTAL PRICE</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <tr v-for="(service, index) in quotation.services" :key="index" class="align-middle">
              <td scope="row" class="table-col table-number">{{ index + 1 }}</td>
              <td class="table-col table-name">{{ service.service }}</td>
              <td class="table-col table-name">{{ service.quantity }}</td>
              <td class="table-col table-name">{{ formatCurrency(service.unitPriceSell) }}</td>
              <td class="table-col table-name">{{ formatCurrency(service.totalPrice) }}</td>
            </tr>
            <tr class="align-middle">
              <td scope="row" class="table-col table-number"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">SubTotal</td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">{{ formatCurrency(quotation.price.subtotal) }}</td>
            </tr>
            <tr class="align-middle">
              <td scope="row" class="table-col table-number"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">PPN 11%</td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">{{ formatCurrency(quotation.price.ppn) }}</td>
            </tr>
            <tr class="align-middle">
              <td scope="row" class="table-col table-number"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">Grand Total</td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">{{ formatCurrency(quotation.price.grandTotal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="add-service">
        <div class="form-group col-12 mx-3">
          <div class="row">
            <div class="col-11">
              <div class="row">
                <div class="col-4">
                  <label for="">Service Name</label>
                </div>
                <div class="col-3">
                  <label for="">Quantity</label>
                </div>
                <div class="col-3">
                  <label for="">Unit Price</label>
                </div>
                <div class="col-2">
                  <label for="">Total Price</label>
                </div>
              </div>
            </div>
            <div class="col-1">
              <div class="button-placeholder"></div>
            </div>
          </div>
        </div>
        <div class="form-group col-12 mx-3">
          <div v-for="(service, serviceIndex) in quotation.services" :key="serviceIndex" class="list row">
            <div class="col-11">
              <div class="row">
                <div class="col-4">
                  <input type="text" class="form-control mt-2" v-model="service.service" placeholder="Service Name">
                </div>
                <div class="col-3">
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="service.quantity"
                    @input="selectService(serviceIndex, service)">
                </div>
                <div class="col-3">
                  <input type="number" class="form-control mt-2" placeholder="Unit Price"
                    v-model="service.unitPriceSell" @change="selectService(serviceIndex, service)">
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Total Price" v-model="service.totalPrice"
                    disabled>
                </div>
              </div>
            </div>
            <div class="col-1">
              <button type="button" class="btn btn-outline-danger" @click="removeService(serviceIndex)"><i
                  class="bi bi-trash3"></i></button>
            </div>
          </div>
          <div class="add-btn mt-3">
            <button type="button" class="btn btn-outline-dark" @click="addService">
              <i class="bi bi-plus-lg"></i>
              <span class="mx-2">Add Service</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="price my-2">
      <div class="amount type">
        <div class="label">Total Amount</div>
        <div>: {{ formatCurrency(quotation.price.amount) }}</div>
      </div>
      <template v-if="!isTypeAdd && isTypeEdit">
        <div class="discount type">
          <div class="label">Discount</div>
          <div>: {{ formatCurrency(quotation.price.discount) }}</div>
        </div>
        <div class="subtotal type">
          <div class="label">Subtotal</div>
          <div>: {{ formatCurrency(quotation.price.subtotal) }}</div>
        </div>
        <div class="ppn type">
          <div class="label">PPN</div>
          <div>: {{ formatCurrency(quotation.price.ppn) }}</div>
        </div>
        <div class="grand-total type">
          <div class="label">Grand Total</div>
          <div>: {{ formatCurrency(quotation.price.grandTotal) }}</div>
        </div>
      </template>
    </div>
    <div class="notes my-2">
      <div class="title">Notes</div>
      <div class="inputform-floating">
        <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
          v-model="quotation.notes" :disabled="disabled"></textarea>
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

// FIXED: Import both isRoleDirector and isRoleMarketing
const { isRoleDirector, isRoleMarketing, user } = useRole()

const props = defineProps({
  type: String,
  action: Function
})

const isTypeEdit = props.type == common.form.type.view
const isTypeAdd = props.type == common.form.type.add
const disabled = computed(() => isTypeEdit ? true : false)

// FIXED: Dropdown visibility state per row index and field (name/number)
// showDropdown[index] = { name: boolean, number: boolean }
const showDropdown = reactive({})

// FIXED: Dropdown control functions (per-field)
const openDropdown = (index, field = 'name') => {
  if (!showDropdown[index]) showDropdown[index] = { name: false, number: false }
  showDropdown[index][field] = true
}

const closeDropdown = (index, field) => {
  if (!showDropdown[index]) return
  if (field) {
    showDropdown[index][field] = false
  } else {
    // close both
    showDropdown[index].name = false
    showDropdown[index].number = false
  }
  // Clear search results to force dropdown to hide when no field open
  const anyOpen = Object.values(showDropdown[index] || {}).some(Boolean)
  if (!anyOpen) searchedSpareparts.value = []
}

// FIXED: Root click handler to close dropdown on outside click
const onRootClick = (evt) => {
  const container = evt.target.closest('.sparepart-container')
  if (!container) {
    // Clicked outside any sparepart container → close all dropdowns
    Object.keys(showDropdown).forEach((k) => {
      if (showDropdown[k]) {
        showDropdown[k].name = false
        showDropdown[k].number = false
      }
    })
    searchedSpareparts.value = []
  }
}

// FIXED: Enhanced input handlers with dropdown control
const searchSparepart = (search) => {
  if (search !== '') quotationStore.getSpareparts({ page: 1, search })
}

const onNameInput = (index, search) => {
  openDropdown(index, 'name')
  debounce(() => searchSparepart(search), 300, `search-quotation-sparepart-name-${index}`)
}

const onNumberInput = (index, search) => {
  openDropdown(index, 'number')
  debounce(() => searchSparepart(search), 300, `search-quotation-sparepart-number-${index}`)
}

// Separate blur handlers so closing one field doesn't immediately close the other if it's active
const onNameBlur = (index) => {
  setTimeout(() => closeDropdown(index, 'name'), 150)
}

const onNumberBlur = (index) => {
  setTimeout(() => closeDropdown(index, 'number'), 150)
}

// Customer search handlers (unchanged)
const handleInputSearchCustomer = (search) => {
  if (search !== '') debounce(() => customerStore.getCustomers({ search }), 500, 'search-quotation-customer')
}

const selectItemCustomer = (customerData) => {
  quotation.value.customer = customerData
}

// FIXED: Auto-populate branch for Marketing users based on user profile
onBeforeMount(() => {
  console.log('quotation review', quotation.value)
  if (!quotation.value) quotationStore.$resetQuotation()

  if (isRoleMarketing.value && user.value) {
    const userBranch = user.value.branch || 'Semarang'
    quotation.value.project.branch = userBranch
  }
})

const amount = computed(() => {
  if (quotation.value.project.type === 'Spareparts') {
    return quotation.value.spareparts.reduce((sum, item) => sum + item.totalPrice, 0)
  } else {
    return quotation.value.services.reduce((sum, item) => sum + item.totalPrice, 0)
  }
})

// FIXED: Enhanced selectItem with dropdown close
const onSelect = (index, purchaseData, sparepartData) => {
  // Ensure we have sparepartData (from dropdown selection)
  if (!sparepartData) {
    console.warn('No sparepart data provided for selection')
    return
  }

  console.log('Selecting sparepart:', sparepartData)
  console.log('Current purchase data:', purchaseData)

  // CRITICAL: Map sparepartId with comprehensive fallbacks
  const data = {
    ...purchaseData,
    // CRITICAL: Set sparepartId - try multiple possible field names
    sparepartId: sparepartData.id || sparepartData.sparepartId || sparepartData.sparepart_id,
    sparepartName: sparepartData.sparepartName || sparepartData.sparepart_name || sparepartData.name,
    sparepartNumber: sparepartData.sparepartNumber || sparepartData.sparepart_number || sparepartData.part_number,
    unitPriceSell: sparepartData.unitPriceSell || sparepartData.unit_price_sell || sparepartData.selling_price || purchaseData.unitPriceSell || 0,
    quantity: purchaseData.quantity || 1,
    stock: sparepartData.stock || sparepartData.available_stock || 'available'
  }

  // Calculate total price
  data.totalPrice = (data.quantity || 0) * (data.unitPriceSell || 0)

  console.log('Final sparepart data with ID:', data.sparepartId, data)

  // CRITICAL: Validate sparepartId is properly set
  if (!data.sparepartId) {
    console.error('CRITICAL ERROR: sparepartId not set after selection!')
    console.error('Original sparepartData:', sparepartData)
    alert('Error: Could not get sparepart ID from selection. Please check the sparepart data format.')
    return
  }

  // Update the sparepart in the array
  quotation.value.spareparts.splice(index, 1, data)
  updatePrice()

  // FIXED: Close dropdown after successful selection
  closeDropdown(index)

  console.log('Sparepart selection completed successfully with sparepartId:', data.sparepartId)
}

// Added separate function for quantity/price updates without sparepartData
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
    sparepartId: '', // CRITICAL: Initialize as empty string, will be set on selection
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
</script>

<style lang="scss" scoped>
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 1%;
  display: flex;
  justify-content: space-between;
}

.input {
  margin: 2% 0%;
}

.sparepart,
.service {
  .list {
    display: flex;
    align-items: flex-end;
  }

  .add-btn {
    display: flex;
    justify-content: center;
  }

  .btn-request {
    background-color: $primary-color;
    color: white;
  }
}

.upper,
.lower {
  .data {
    display: flex;
    justify-content: space-between;
  }

  .left,
  .right {
    width: 48%;
  }
}

.price {
  .type {
    display: flex;
  }

  .label {
    width: 180px;
  }
}

.table-placeholder {
  text-align: center;
  border: 2px solid $primary-color;
  border-radius: 20px;
  overflow: auto;
}

// CRITICAL FIX: Sparepart container for dropdown positioning
.sparepart-container {
  position: relative;
}

// CRITICAL FIX: Proper sparepart dropdown styling
.sparepart-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1050;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-top: 2px;
}

// CRITICAL FIX: Clickable sparepart suggestion buttons
.sparepart-suggestion-btn {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: #212529;
  border-bottom: 1px solid #f8f9fa;

  &:hover {
    background-color: #e9ecef;
    color: #16181b;
  }

  &:focus {
    outline: none;
    background-color: #f8f9fa;
  }

  &:active {
    background-color: #dee2e6;
  }

  &:last-child {
    border-bottom: none;
  }
}

.dropdown-menu {
  width: 200px;
  max-height: 300px;
  overflow-y: auto;
  margin-right: -10%;
}

.dropdown-menu-customer {
  width: 400px;
}

.dropdown-menu::-webkit-scrollbar {
  margin-right: -10px;
  width: 10px;
}

.dropdown-menu::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: grey;
  border-radius: 10px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #696969;
}

@media only screen and (max-width: 767px) {

  .upper,
  .lower {
    .data {
      flex-direction: column;
    }

    .left,
    .right {
      width: 100%;
    }
  }

  .sparepart,
  .service {
    .row {
      .col-4 {
        width: 100%;
      }

      .col-2,
      .col-3 {
        width: 33.33%;
        margin-top: 10px;
        padding: 0 5px;
      }
    }

    .list {
      margin-bottom: 20px;
    }
  }

  .table-placeholder {
    font-size: 14px;

    .table {
      min-width: 800px;
    }
  }
}
</style>
