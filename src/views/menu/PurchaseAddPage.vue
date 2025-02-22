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
          <div v-for="(purchase, purchaseIndex) in purchase.spareparts" :key="purchaseIndex" class="list row">
            <div class="col-11">
              <div class="row">
                <div class="col-4">
                  <input type="text" class="form-control mt-2" v-model="purchase.partName" placeholder="Part Name"
                    data-bs-toggle="dropdown" aria-expanded="false" @change="handleInputSearch"
                    @keyup="handleInputSearch">
                  <ul class="dropdown-menu">
                    <li v-for="(sparepart, index) in searchedSparepart" :key="index" class="dropdown-item"
                      @click="selectItem(purchaseIndex, purchase, sparepart)">
                      {{ sparepart.partName }}
                    </li>
                  </ul>
                </div>
                <div class="col-2">
                  <input type="text" class="form-control mt-2" v-model="purchase.partNumber" placeholder="Part Number"
                    data-bs-toggle="dropdown" aria-expanded="false" @change="handleInputSearch"
                    @keyup="handleInputSearch">
                  <ul class="dropdown-menu">
                    <li v-for="(sparepart, index) in searchedSparepart" :key="index" class="dropdown-item"
                      @click="selectItem(purchaseIndex, purchase, sparepart)">
                      {{ sparepart.partNumber }}
                    </li>
                  </ul>
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="purchase.quantity"
                    @input="selectItem(purchaseIndex, purchase, sparepart)">
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Unit Price" v-model="purchase.unitPrice"
                    disabled>
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Total Price" v-model="purchase.totalPrice"
                    disabled>
                </div>
              </div>
            </div>
            <div class="col-1">
              <button type="button" class="btn btn-outline-danger" @click="removeSparepart(purchaseIndex)"><i
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
      <button type="button" class="btn btn-process" @click="doPurchaseConfirmation">Add</button>
    </div>
  </div>
</template>

<script setup>
import { common } from '@/config'
import { usePurchaseStore } from '@/stores/purchase'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import debounce from '@/utils/debouncer'
import { useModalStore } from '@/stores/modal'

const purchaseStore = usePurchaseStore()
const modalStore = useModalStore()

const { purchase } = storeToRefs(purchaseStore)

const searchedSparepart = ref([{
  partName: 'NEW BEARING SET, CON ROD',
  partNumber: '30L19-342289',
  unitPrice: 500000
},
{
  partName: 'BEARING SET, CON ROD',
  partNumber: '30L19-342289',
  unitPrice: 494000
},
])

const totalPurchase = computed(() => purchase.value.spareparts.reduce((sum, item) => sum + item.totalPrice, 0))

onMounted(() => {
  addSparepart()
})

const searchSparepart = () => {
  console.log('SEARCH SPAREPART')
}

const handleInputSearch = () => {
  debounce(searchSparepart, 500, 'search-purchase-sparepart')
}

const selectItem = (index, purchaseData, sparepartData) => {
  const data = {
    ...purchaseData,
    ...sparepartData
  }
  data.totalPrice = data.quantity * data.unitPrice
  purchase.value.spareparts.splice(index, 1, data)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  }).format(value)
}

const addSparepart = () => {
  purchase.value.spareparts.push({
    partName: '',
    partNumber: '',
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0
  })
}
const removeSparepart = (index) => {
  purchase.value.spareparts.splice(index, 1)
}
const doPurchase = async () => {
  await purchaseStore.addPurchase()
}

const doPurchaseConfirmation = () => {
  purchase.value.spareparts = purchase.value.spareparts.filter((item) => item.quantity > 0)
  modalStore.openConfirmationModal(`You want to Purchase ${purchase.value.spareparts.length} Spareparts ?`, doPurchase)
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

.dropdown-menu {
  text-align: center;
}
</style>
