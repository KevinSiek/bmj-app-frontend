<template>
  <div class="contain background shadow">
    <form class="row form" autocomplete="off">
      <div class="upper my-2">
        <div class="title">Sparepart Information</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Sparepart Name</label><br>
              <input type="text" class="form-control mt-2" :class="{ 'is-invalid': errors.sparepartName }" v-model="sparepart.sparepartName"
                placeholder="Sparepart Name" autocomplete="off">
              <div class="invalid-feedback">{{ errors.sparepartName }}</div>
            </div>
            <template v-for="(branch, index) in sparepart.totalUnit" :key="index">
              <div class="input form-group col-12">
                <div class="branch">
                  <label for="">Stock {{ branch.name }}</label><br>
                  <input type="number" class="form-control mt-2" :class="{ 'is-invalid': getBranchError(index) }" v-model="branch.stock" placeholder="Stock">
                  <div class="invalid-feedback">{{ getBranchError(index) }}</div>
                </div>
              </div>
            </template>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Part Number</label><br>
              <input type="text" class="form-control mt-2" :class="{ 'is-invalid': errors.sparepartNumber }" v-model="sparepart.sparepartNumber"
                placeholder="Sparepart Number" autocomplete="off">
              <div class="invalid-feedback">{{ errors.sparepartNumber }}</div>
            </div>
            <div class="input form-group col-12">
              <label for="">Buy Price</label><br>
              <CurrencyInput :class="{ 'is-invalid': errors.unitPriceBuy }" v-model="sparepart.unitPriceBuy" placeholder="Buy Price" />
              <div class="invalid-feedback">{{ errors.unitPriceBuy }}</div>
            </div>
            <div class="input form-group col-12">
              <label for="">Selling Price</label><br>
              <CurrencyInput :class="{ 'is-invalid': errors.unitPriceSell }" v-model="sparepart.unitPriceSell" placeholder="Selling Price" />
              <div class="invalid-feedback">{{ errors.unitPriceSell }}</div>
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
                  <select class="form-select mt-2" :class="{ 'is-invalid': getSellerError(index, 'seller') }" id="branch" v-model="list.seller">
                    <option value="" disabled selected>Select Seller</option>
                    <option v-for="(seller, index) in sellers" :key="index" :value="seller.name">
                      {{ seller.name }}
                    </option>
                  </select>
                  <div class="invalid-feedback">{{ getSellerError(index, 'seller') }}</div>
                </div>
                <div class="input form-group col-3">
                  <label for="">Puchase Price</label><br>
                  <CurrencyInput :class="{ 'is-invalid': getSellerError(index, 'price') }" v-model="list.price" placeholder="Purchase Price" />
                  <div class="invalid-feedback">{{ getSellerError(index, 'price') }}</div>
                </div>
                <div class="input form-group col-3">
                  <label for="">Quantity</label><br>
                  <input type="number" class="form-control mt-2" :class="{ 'is-invalid': getSellerError(index, 'quantity') }" v-model="list.quantity" placeholder="Quantity" @wheel.prevent>
                  <div class="invalid-feedback">{{ getSellerError(index, 'quantity') }}</div>
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
      <button type="button" class="btn btn-process" @click="editSparepartConfirmation"
        :disabled="isProcessing">Edit</button>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import { useRoute, useRouter } from 'vue-router'
import { useSparepartStore } from '@/stores/sparepart'
import { storeToRefs } from 'pinia'
import { useModalStore } from '@/stores/modal'
import CurrencyInput from '@/components/CurrencyInput.vue'
import { onBeforeMount, onMounted, ref, computed, watch } from 'vue'
import { common } from '@/config'
import { useSellerStore } from '@/stores/seller'

const route = useRoute()
const router = useRouter()
const sparepartStore = useSparepartStore()
const modalStore = useModalStore()
const sellerStore = useSellerStore()

const { sparepart } = storeToRefs(sparepartStore)
const { sellers } = storeToRefs(sellerStore)

const isProcessing = ref(false)

const errors = computed(() => {
  const errs = {}
  if (!sparepartStore.isDirty) return errs
  const sp = sparepart.value
  if (!sp) return errs

  if (!sp.sparepartName?.trim()) errs.sparepartName = 'Name is required.'
  if (!sp.sparepartNumber?.trim()) errs.sparepartNumber = 'Part Number is required.'
  if (sp.unitPriceBuy === '' || isNaN(Number(sp.unitPriceBuy)) || Number(sp.unitPriceBuy) < 1) {
    errs.unitPriceBuy = 'Must be >= 1.'
  }
  if (sp.unitPriceSell === '' || isNaN(Number(sp.unitPriceSell)) || Number(sp.unitPriceSell) < 1) {
    errs.unitPriceSell = 'Must be >= 1.'
  }
  return errs
})

const getBranchError = (index) => {
  if (!sparepartStore.isDirty) return null
  const b = sparepart.value?.totalUnit?.[index]
  if (!b) return null
  if (b.stock === '' || isNaN(Number(b.stock)) || Number(b.stock) < 0) {
    return 'Must be >= 0.'
  }
  return null
}

const getSellerError = (index, field) => {
  if (!sparepartStore.isDirty) return null
  const s = sparepart.value?.unitPriceSeller?.[index]
  if (!s) return null
  if (field === 'seller' && !s.seller) return 'Required.'
  if (field === 'price' && (s.price === '' || isNaN(Number(s.price)) || Number(s.price) < 1)) return 'Min 1.'
  if (field === 'quantity' && (s.quantity === '' || isNaN(Number(s.quantity)) || Number(s.quantity) < 1 || !Number.isInteger(Number(s.quantity)))) return 'Min 1.'
  return null
}

watch(
  () => sparepart.value,
  (newVal, oldVal) => {
    if (newVal !== null && oldVal !== null) {
      sparepartStore.isDirty = true
    }
  },
  { deep: true }
)

onBeforeMount(() => {
  if (!sparepart.value) sparepartStore.$resetSparepart()
})

onMounted(() => {
  sparepartStore.getSparepart(route.params.id)
  sellerStore.getSellers()
})

const addSeller = () => {
  sparepart.value.unitPriceSeller.push({
    seller: '',
    price: 0,
    quantity: 0
  })
}

const removeSeller = (index) => {
  sparepart.value.unitPriceSeller.splice(index, 1)
}

const editSparepart = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await sparepartStore.updateSparepart()
    router.push(`${menuConfig.spareparts.path}/${route.params.id}`)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}

const editSparepartConfirmation = () => {
  const errorMsg = sparepartStore.validateSparepart()
  if (errorMsg) {
    sparepartStore.isDirty = true
    return
  }
  modalStore.openConfirmationModal('to edit this Sparepart ?', 'Edit Sparepart Success', editSparepart)
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
