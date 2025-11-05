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
          <!-- REFACTORED: Use shared SparepartRow component -->
          <SparepartRow
            v-for="(sparepart, sparepartIndex) in purchase.spareparts"
            :key="sparepartIndex"
            v-model="purchase.spareparts[sparepartIndex]"
            :suggestions="searchedSpareparts"
            mode="purchase"
            @search="handleInputSearch"
            @remove="removeSparepart(sparepartIndex)"
          />
          
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
import SparepartRow from '@/components/SparepartRow.vue'

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

const addSparepart = () => {
  purchase.value.spareparts.push({
    sparepartId: '', // Initialize as empty string, will be set on selection
    sparepartName: '',
    sparepartNumber: '',
    quantity: 0,
    unitPriceSell: 0,
    unitPrice: 0, // Use unitPrice for consistency with component
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

@media only screen and (max-width: 767px) {}
</style>