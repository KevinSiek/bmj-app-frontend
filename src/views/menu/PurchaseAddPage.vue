<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="my-2">
        <div class="title">Purchase List</div>
        <div class="input form-group col-12 mx-3">
          <div class="row">
            <div class="col-11">
              <div class="row">
                <div class="col-4">
                  <label for="">Sparepart Name</label>
                </div>
                <div class="col-2">
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
        <div class="input form-group col-12 mx-3">
          <div v-for="(sparepart, sparepartIndex) in purchase.spareparts" :key="sparepartIndex" class="list row">
            <div class="col-11">
              <div class="row">
                <!-- CRITICAL FIX: Sparepart Name with Clickable Button Suggestions -->
                <div class="col-4 sparepart-container">
                  <input type="text" class="form-control mt-2" v-model="sparepart.sparepartName" placeholder="Part Name"
                    @input="handleInputSearch(sparepart.sparepartName)"
                    @keyup="handleInputSearch(sparepart.sparepartName)"
                    :class="{ 'is-invalid': !sparepart.sparepartId && sparepart.sparepartName }">
                  
                  <!-- CRITICAL FIX: Button-based suggestions instead of li dropdown -->
                  <div v-if="searchedSpareparts.length > 0" class="sparepart-dropdown">
                    <button
                      v-for="(item, index) in searchedSpareparts"
                      :key="index"
                      type="button"
                      class="sparepart-suggestion-btn"
                      @mousedown.prevent
                      @click="selectItem(sparepartIndex, sparepart, item)"
                    >
                      {{ item.sparepartName }}
                    </button>
                  </div>
                  
                  <div v-if="!sparepart.sparepartId && sparepart.sparepartName" class="invalid-feedback">
                    Please select from suggestions to link sparepart ID
                  </div>
                </div>
                
                <!-- CRITICAL FIX: Part Number with Clickable Button Suggestions -->
                <div class="col-2 sparepart-container">
                  <input type="text" class="form-control mt-2" v-model="sparepart.sparepartNumber"
                    placeholder="Part Number"
                    @input="handleInputSearch(sparepart.sparepartNumber)"
                    @keyup="handleInputSearch(sparepart.sparepartNumber)">
                  
                  <!-- CRITICAL FIX: Button-based suggestions -->
                  <div v-if="searchedSpareparts.length > 0" class="sparepart-dropdown">
                    <button
                      v-for="(item, index) in searchedSpareparts"
                      :key="index"
                      type="button"
                      class="sparepart-suggestion-btn"
                      @mousedown.prevent
                      @click="selectItem(sparepartIndex, sparepart, item)"
                    >
                      {{ item.sparepartNumber }}
                    </button>
                  </div>
                </div>
                
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="sparepart.quantity"
                    @input="updateCalculation(sparepartIndex, sparepart)">
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Unit Price"
                    v-model="sparepart.unitPriceBuy" @change="updateCalculation(sparepartIndex, sparepart)">
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
      <div class="notes my-2">
        <div class="title">Description</div>
        <textarea class="form-control" placeholder="Description" id="floatingTextarea2" style="height: 100px"
          v-model="purchase.notes"></textarea>
      </div>
      <div class="total my-2">
        <div class="title">Total Purchase</div>
        <div class="text">{{ formatCurrency(totalPurchase) }}</div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="right">
      <button type="button" class="btn btn-process" @click="doPurchaseConfirmation"
        :disabled="isProcessing">Add</button>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import { usePurchaseStore } from '@/stores/purchase'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, ref } from 'vue'
import debounce from '@/utils/debouncer'
import { useModalStore } from '@/stores/modal'
import { formatCurrency } from '@/utils/form-util'
import { useRouter } from 'vue-router'

const purchaseStore = usePurchaseStore()
const modalStore = useModalStore()
const router = useRouter()

const { purchase, searchedSpareparts } = storeToRefs(purchaseStore)

const isProcessing = ref(false)

const totalPurchase = computed(() => purchase.value.spareparts.reduce((sum, item) => sum + item.totalPrice, 0))

onBeforeMount(() => {
  if (!purchase.value) purchaseStore.$resetPurchase()
})

const searchSparepart = (search) => {
  if (search !== '') purchaseStore.getSpareparts({ page: 1, search })
}

const handleInputSearch = (search) => {
  debounce(() => searchSparepart(search), 500, 'search-purchase-sparepart')
}

// CRITICAL FIX: Enhanced selectItem function with proper sparepartId mapping
const selectItem = (index, purchaseData, sparepartData) => {
  // Handle case when called without sparepartData (for quantity/price updates)
  if (!sparepartData) {
    updateCalculation(index, purchaseData)
    return
  }
  
  console.log('Selecting sparepart for purchase:', sparepartData)
  console.log('Current purchase data:', purchaseData)
  
  // CRITICAL: Map sparepartId with comprehensive fallbacks
  const data = {
    ...purchaseData,
    // CRITICAL: Set sparepartId - try multiple possible field names
    sparepartId: sparepartData.sparepartId || sparepartData.id || sparepartData.sparepart_id,
    sparepartName: sparepartData.sparepartName || sparepartData.sparepart_name || sparepartData.name,
    sparepartNumber: sparepartData.sparepartNumber || sparepartData.sparepart_number || sparepartData.part_number,
    // Use buy price for purchase, not sell price
    unitPriceBuy: sparepartData.unitPriceBuy || sparepartData.unit_price_buy || sparepartData.purchase_price || purchaseData.unitPriceBuy || 0,
    quantity: purchaseData.quantity || 1,
    stock: sparepartData.stock || sparepartData.available_stock || 'available'
  }
  
  // Calculate total price
  data.totalPrice = (data.quantity || 0) * (data.unitPriceBuy || 0)
  
  console.log('Final purchase sparepart data with ID:', data.sparepartId, data)
  
  // CRITICAL: Validate sparepartId is properly set
  if (!data.sparepartId) {
    console.error('CRITICAL ERROR: sparepartId not set after selection!')
    console.error('Original sparepartData:', sparepartData)
    alert('Error: Could not get sparepart ID from selection. Please check the sparepart data format.')
    return
  }
  
  // Update the sparepart in the array
  purchase.value.spareparts.splice(index, 1, data)
  
  console.log('Purchase sparepart selection completed successfully with sparepartId:', data.sparepartId)
}

// CRITICAL FIX: Separate function for quantity/price updates without sparepartData
const updateCalculation = (index, sparepartData) => {
  const data = { ...sparepartData }
  data.totalPrice = (data.quantity || 0) * (data.unitPriceBuy || 0)
  
  purchase.value.spareparts.splice(index, 1, data)
}

const addSparepart = () => {
  purchase.value.spareparts.push({
    sparepartId: '', // CRITICAL: Initialize as empty string, will be set on selection
    sparepartName: '',
    sparepartNumber: '',
    quantity: 0,
    unitPriceSell: 0,
    unitPriceBuy: 0,
    totalPrice: 0,
    stock: ''
  })
}

const removeSparepart = (index) => {
  purchase.value.spareparts.splice(index, 1)
}

const doPurchase = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await purchaseStore.addPurchase()
    router.push(menuConfig.purchase.path)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}

const doPurchaseConfirmation = () => {
  purchase.value.spareparts = purchase.value.spareparts.filter((item) => item.quantity > 0)
  modalStore.openConfirmationModal(`to Purchase ${purchase.value.spareparts.length} Spareparts ?`, 'Purchase Spareparts Success', doPurchase)
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.contain {
  padding: 2% 3%;
  height: 72vh;

  .title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 1%;
  }

  .list {
    display: flex;
    align-items: flex-end;
  }

  .add-btn {
    display: flex;
    justify-content: center;
  }
}

.status {
  margin: 2% 4%;
  font-size: 18px;
  height: 8vh;
  padding: 0 4%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button {
  display: flex;
  margin: 2% 4%;
  justify-content: flex-end;

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

.button-placeholder {
  width: 20px;
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
  text-align: center;
}

@media only screen and (max-width: 767px) {}
</style>