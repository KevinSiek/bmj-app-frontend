<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="input form-group col-4 my-2">
        <div class="title">Branch</div>
        <select class="form-select mt-2" aria-label="Branch" v-model="purchase.branch">
          <option value="" disabled selected>Select Branch</option>
          <option value="Semarang">Semarang</option>
          <option value="Jakarta">Jakarta</option>
        </select>
        <!-- <div v-if="isRoleInventoryPurchase">
          <input type="text" class="form-control mt-2" :value="purchase.branch" placeholder="Branch" disabled readonly>
          <small class="text-muted">Branch automatically set based on your profile</small>
        </div> -->
      </div>
      <div class="my-2">
        <div class="title">Purchase List</div>
        <div class="purchase-scroll">
          <div class="input form-group col-12 mx-3">
            <div class="row flex-nowrap">
              <div class="col-3">
                <label for="">Sparepart Name</label>
              </div>
              <div class="col-3">
                <label for="">Part Number</label>
              </div>
              <div class="col-3">
                <label for="">Seller</label>
              </div>
              <div class="col-2">
                <label for="">Quantity</label>
              </div>
              <div class="col-3">
                <label for="">Unit Price</label>
              </div>
              <div class="col-3">
                <label for="">Total Price</label>
              </div>
              <div class="col-1">
                <div class="button-placeholder"></div>
              </div>
            </div>
          </div>
          <div class="input form-group col-12 mx-3">
            <div v-for="(sparepart, sparepartIndex) in purchase.spareparts" :key="sparepartIndex"
              class="row flex-nowrap">
              <div class="col-3">
                <input type="text" class="form-control mt-2" v-model="sparepart.sparepartName" placeholder="Part Name"
                  data-bs-toggle="dropdown" aria-expanded="false" @change="handleInputSearch(sparepart.sparepartName)"
                  @keyup="handleInputSearch(sparepart.sparepartName)">
                <ul class="dropdown-menu">
                  <li v-for="(item, index) in searchedSpareparts" :key="index" class="dropdown-item"
                    @click="selectItem(sparepartIndex, sparepart, item)">
                    {{ item.sparepartName }}
                  </li>
                </ul>
              </div>
              <div class="col-3">
                <input type="text" class="form-control mt-2" v-model="sparepart.sparepartNumber"
                  placeholder="Part Number" data-bs-toggle="dropdown" aria-expanded="false"
                  @change="handleInputSearch(sparepart.sparepartNumber)"
                  @keyup="handleInputSearch(sparepart.sparepartNumber)">
                <ul class="dropdown-menu">
                  <li v-for="(item, index) in searchedSpareparts" :key="index" class="dropdown-item"
                    @click="selectItem(sparepartIndex, sparepart, item)">
                    {{ item.sparepartNumber }}
                  </li>
                </ul>
              </div>
              <div class="col-3">
                <select class="form-select mt-2" v-model="sparepart.seller"
                  @change="selectItem(sparepartIndex, sparepart)">
                  <option value="" disabled selected>Select Seller</option>
                  <option v-for="(sellerOption, idx) in sparepart.unitPriceSeller" :key="idx"
                    :value="sellerOption.seller">
                    {{ sellerOption.seller }}
                  </option>
                </select>
              </div>
              <div class="col-2">
                <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="sparepart.quantity"
                  @input="selectItem(sparepartIndex, sparepart)">
              </div>
              <div class="col-3">
                <CurrencyInput placeholder="Unit Price" v-model="sparepart.unitPriceBuy"
                  @update:model-value="selectItem(sparepartIndex, sparepart)" />
              </div>
              <div class="col-3">
                <CurrencyInput placeholder="Total Price" v-model="sparepart.totalPrice"
                  @update:model-value="selectItem(sparepartIndex, sparepart)" :disabled="true" />
              </div>
              <div class="col-1 d-flex justify-content-center align-items-end">
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
import CurrencyInput from '@/components/CurrencyInput.vue'
import { useRouter } from 'vue-router'
import { useRole } from '@/composeable/useRole'

const { isRoleDirector, isRoleInventoryPurchase, user } = useRole()

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

const selectItem = (index, purchaseData, sparepartData) => {
  const data = {
    ...purchaseData,
    ...sparepartData
  }
  data.unitPriceBuy = data.unitPriceSeller?.find(s => s.seller === data.seller)?.price ?? data.unitPriceBuy
  data.totalPrice = data.quantity * data.unitPriceBuy
  purchase.value.spareparts.splice(index, 1, data)
}

const addSparepart = () => {
  purchase.value.spareparts.push({
    sparepartId: '',
    sparepartName: '',
    sparepartNumber: '',
    quantity: 0,
    unitPriceSell: 0,
    unitPriceBuy: 0,
    totalPrice: 0,
    stock: '',
    unitPriceSeller: [],
    selectedSeller: undefined,
    seller: ''
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

.purchase-scroll {
  overflow-x: auto;
  width: 100%;
}

.button-placeholder {
  width: 20px;
}

.dropdown-menu {
  overflow-y: auto;
  max-height: 300px;
}

@media only screen and (max-width: 767px) {}
</style>
