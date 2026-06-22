<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="my-2">
        <div class="title">Current Back Order Sparepart</div>
        <div class="table-placeholder">
          <table class="table table-hover">
            <thead>
              <tr class="align-middle">
                <th>NO</th>
                <th>Sparepart Name</th>
                <th>Part Number</th>
                <th>Order</th>
                <th>Delivery Order</th>
                <th>Back Order</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-for="(sparepart, sparepartIndex) in backOrder.spareparts" :key="sparepartIndex"
                class="align-middle">
                <td>{{ sparepartIndex + 1 }}</td>
                <td><input type="text" class="form-control" v-model="sparepart.sparepartName" disabled></td>
                <td><input type="text" class="form-control" v-model="sparepart.sparepartNumber" disabled></td>
                <td><input type="number" class="form-control" v-model="sparepart.order" disabled></td>
                <td>
                  <CurrencyInput v-model="sparepart.deliveryOrder" :disabled="true" inputClass="form-control" />
                </td>
                <td>
                  <CurrencyInput v-model="sparepart.backOrder" :disabled="true" inputClass="form-control" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="my-2">
        <div class="title">Adjust Sparepart</div>
        <div class="table-placeholder">
          <table class="table table-hover">
            <thead>
              <tr class="align-middle">
                <th>NO</th>
                <th>Sparepart Name</th>
                <th>Part Number</th>
                <th>Stock</th>
                <th>Order</th>
                <th>Back Order</th>
                <th></th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-for="(sparepart, sparepartIndex) in newBackOrder.spareparts" :key="sparepartIndex"
                class="align-middle">
                <td>{{ sparepartIndex + 1 }}</td>
                <td>
                  <input type="text" class="form-control" v-model="sparepart.sparepartName" placeholder="Part Name"
                    data-bs-toggle="dropdown" aria-expanded="false" @change="handleInputSearch(sparepart.sparepartName)"
                    @keyup="handleInputSearch(sparepart.sparepartName)">
                  <ul class="dropdown-menu">
                    <li v-for="(item, index) in searchedSpareparts" :key="index" class="dropdown-item"
                      @click="selectItem(sparepartIndex, sparepart, item)">{{ item.sparepartName }}</li>
                  </ul>
                </td>
                <td>
                  <input type="text" class="form-control" v-model="sparepart.sparepartNumber" placeholder="Part Number"
                    data-bs-toggle="dropdown" aria-expanded="false"
                    @change="handleInputSearch(sparepart.sparepartNumber)"
                    @keyup="handleInputSearch(sparepart.sparepartNumber)">
                  <ul class="dropdown-menu">
                    <li v-for="(item, index) in searchedSpareparts" :key="index" class="dropdown-item"
                      @click="selectItem(sparepartIndex, sparepart, item)">{{ item.sparepartNumber }}</li>
                  </ul>
                </td>
                <td>
                  <input type="number" class="form-control"
                    v-model="sparepart.totalUnit[backOrder?.purchaseOrder?.branch]"
                    @input="selectItem(sparepartIndex, sparepart)" disabled>
                </td>
                <td>
                  <input type="number" class="form-control" placeholder="Order" v-model="sparepart.order" @wheel.prevent
                    @input="selectItem(sparepartIndex, sparepart)">
                </td>
                <td>
                  <input type="number" class="form-control" placeholder="Back Order" v-model="sparepart.backOrder"
                    @input="selectItem(sparepartIndex, sparepart)" disabled>
                </td>
                <td>
                  <button type="button" class="btn btn-outline-danger" @click="removeSparepart(sparepartIndex)">
                    <i class="bi bi-trash3"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="add-btn my-2">
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
          v-model="backOrder.notes"></textarea>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="right">
      <button type="button" class="btn btn-process" @click="adjustBackOrderConfirmation"
        :disabled="isProcessing">Adjust</button>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import debounce from '@/utils/debouncer'
import { useModalStore } from '@/stores/modal'
import CurrencyInput from '@/components/CurrencyInput.vue'
import { useRouter, useRoute } from 'vue-router'
import { useRole } from '@/composeable/useRole'
import { useBackOrderStore } from '@/stores/back-order'

const { isRoleDirector, isRoleInventoryPurchase, user } = useRole()

const backOrderStore = useBackOrderStore()
const modalStore = useModalStore()
const router = useRouter()
const route = useRoute()

const { backOrder, newBackOrder, searchedSpareparts } = storeToRefs(backOrderStore)

const isProcessing = ref(false)

const totalPurchase = computed(() => newBackOrder.value.spareparts?.reduce((sum, item) => sum + item.totalPrice, 0) || 0)

onBeforeMount(() => {
  if (!backOrder.value) backOrderStore.$resetBackOrder()
})

onMounted(async () => {
  await backOrderStore.getBackOrderForAdjustment(route.params.id)
})

const searchSparepart = (search) => {
  if (search !== '') backOrderStore.getSpareparts({ page: 1, search })
}

const handleInputSearch = (search) => {
  debounce(() => searchSparepart(search), 500, 'search-back-order-sparepart')
}

const selectItem = (index, backOrderData, sparepartData) => {
  const data = {
    ...backOrderData,
    ...sparepartData
  }
  console.log('selectItem', data)
  if (data.new) {
    const stock = data.totalUnit[backOrder.value?.purchaseOrder?.branch] ?? 0
    data.backOrder = data.order > 0 ? (stock >= data.order ? 0 : data.order - stock) : 0
    console.log(data)
  }
  else {
    data.backOrder = data.order - data.deliveryOrder
  }

  data.totalPrice = data.backOrder * data.unitPriceBuy
  newBackOrder.value.spareparts.splice(index, 1, data)
}

const addSparepart = () => {
  newBackOrder.value.spareparts.push({
    sparepartId: '',
    sparepartName: '',
    sparepartNumber: '',
    order: 0,
    deliveryOrder: 0,
    backOrder: 0,
    unitPriceSell: 0,
    unitPriceBuy: 0,
    totalPrice: 0,
    totalUnit: {},
    new: true
  })
}
const removeSparepart = (index) => {
  newBackOrder.value.spareparts.splice(index, 1)
}
const adjustBackOrder = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await backOrderStore.adjustBackOrder(newBackOrder.value.id)
    router.push(menuConfig.back_order.path)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}

const adjustBackOrderConfirmation = () => {
  const totalOriginalOrder = backOrder.value.spareparts.reduce((sum, item) => sum + item.order, 0)
  const totalNewOrder = newBackOrder.value.spareparts.reduce((sum, item) => sum + item.order, 0)
  if (totalOriginalOrder !== totalNewOrder) {
    modalStore.openMessageModal('Failed', `Total order mismatch: existing (${totalOriginalOrder}) ≠ adjusted (${totalNewOrder})`)
    return
  }
  modalStore.openConfirmationModal(`to adjust ${newBackOrder.value.spareparts.length} Spareparts ?`, 'Adjust Spareparts Success', adjustBackOrder)
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

  .scroll-container {
    overflow-x: auto;

    .header-row,
    .list {
      min-width: 800px;
      flex-wrap: nowrap;
    }

    .header-row {
      margin-top: 4px;
    }
  }

  .table-placeholder {
    border: 2px solid $primary-color;
    border-radius: 20px;
    overflow-x: auto;

    table {
      min-width: 700px;
    }
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

.dropdown-menu {
  overflow-y: auto;
  max-height: 300px;
}

@media only screen and (max-width: 767px) {}
</style>
