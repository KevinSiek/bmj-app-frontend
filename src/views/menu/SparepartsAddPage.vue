<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="title">Sparepart Information</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Sparepart Name</label><br>
              <input type="text" class="form-control mt-2" v-model="sparepart.sparepartName"
                placeholder="Sparepart Name">
            </div>
            <div class="input form-group col-12">
              <label for="">Stock</label><br>
              <div class="branch">
                <template v-for="(branch, index) in sparepart.totalUnit" :key="index">
                  <label for="">{{ branch.name }}</label><br>
                  <input type="text" class="form-control mt-2" v-model="branch.stock" placeholder="Stock" disabled>
                </template>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="branch">Branch</label><br>
              <select class="form-select mt-2" id="branch" v-model="sparepart.branch">
                <option value="" disabled selected>Select Branch</option>
                <option v-for="(branch, index) in common.branch" :key="index" :value="branch">
                  {{ branch }}
                </option>
              </select>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Part Number</label><br>
              <input type="text" class="form-control mt-2" v-model="sparepart.sparepartNumber"
                placeholder="Sparepart Number">
            </div>
            <div class="input form-group col-12">
              <label for="">Buy Price</label><br>
              <input type="number" class="form-control mt-2" v-model="sparepart.unitPriceBuy" placeholder="Buy Price">
            </div>
            <div class="input form-group col-12">
              <label for="">Selling Price</label><br>
              <input type="number" class="form-control mt-2" v-model="sparepart.unitPriceSell"
                placeholder="Selling Price">
            </div>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="title">Purchase Price</div>
        <div class="lists" v-for="(list, index) in sparepart.unitPriceSeller" :key="index">
          <div class="row">
            <div class="col-11">
              <div class="data row">
                <div class="input form-group col-5">
                  <label for="">Seller</label><br>
                  <select class="form-select mt-2" id="branch" v-model="list.seller">
                    <option value="" disabled selected>Select Seller</option>
                    <option v-for="(seller, index) in sellers" :key="index" :value="seller.name">
                      {{ seller.name }}
                    </option>
                  </select>
                </div>
                <div class="input form-group col-3">
                  <label for="">Puchase Price</label><br>
                  <input type="number" class="form-control mt-2" v-model="list.price" placeholder="Purchase Price">
                </div>
                <div class="input form-group col-3">
                  <label for="">Quantity</label><br>
                  <input type="number" class="form-control mt-2" v-model="list.quantity" placeholder="Quantity">
                </div>
              </div>
            </div>
            <div class="col-1 button-remove">
              <button type="button" class="btn btn-outline-danger" @click="removeSeller(index)"><i
                  class="bi bi-trash3"></i></button>
            </div>
          </div>
        </div>
      </div>
      <div class="add-btn mt-3">
        <button type="button" class="btn btn-outline-dark" @click="addSeller">
          <i class="bi bi-plus-lg"></i>
          <span class="mx-2">Add Seller</span>
        </button>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="back">Back</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="addSparepartConfirmation"
        :disabled="isProcessing">Add</button>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import { useRouter } from 'vue-router'
import { useSparepartStore } from '@/stores/sparepart'
import { storeToRefs } from 'pinia'
import { useModalStore } from '@/stores/modal'
import { onBeforeMount, onMounted, ref } from 'vue'
import { common } from '@/config'
import { useSellerStore } from '@/stores/seller'

const router = useRouter()
const sparepartStore = useSparepartStore()
const sellerStore = useSellerStore()
const modalStore = useModalStore()

const { sparepart } = storeToRefs(sparepartStore)
const { sellers } = storeToRefs(sellerStore)

const isProcessing = ref(false)

onBeforeMount(() => {
  if (!sparepart.value) sparepartStore.$resetSparepart()
  console.log(sparepart.value)
})

onMounted(() => {
  sellerStore.getSellers()
})

const addSeller = () => {
  sparepart.value.unitPriceSeller.push({
    seller: '',
    quantity: 0,
    price: 0
  })
}

const addSparepart = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await sparepartStore.addSparepart()
    router.push(menuConfig.spareparts)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}

const removeSeller = (index) => {
  sparepart.value.unitPriceSeller.splice(index, 1)
}

const addSparepartConfirmation = () => {
  modalStore.openConfirmationModal('to Add this Sparepart ?', 'Add Sparepart Success', addSparepart)
}
const back = () => {
  router.back()
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.contain {
  padding: 2.5% 5%;
  height: 72vh;

  .title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 1%;
  }

  .input {
    margin: 2% 0%;
  }

  .upper {
    .data {
      display: flex;
      justify-content: space-between;

      .branch {
        font-size: 14px;
        margin-left: 20px;
      }
    }

    .left,
    .right {
      width: 48%;
    }
  }

  .lower {
    display: flex;
    flex-direction: column;

    .lists {
      display: flex;

      .row {
        width: 100%;
      }

      // .input {
      //   margin: 0.5% 5% 0.5% 0%;
      // }
    }
  }
}

.add-btn {
  display: flex;
  justify-content: center;
}

.button-remove {
  display: flex;
  align-items: flex-end;
  margin: 2% 0%;
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
</style>
