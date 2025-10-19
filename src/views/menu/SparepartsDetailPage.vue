<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="title">Sparepart Information</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Sparepart Name</label><br>
              <input type="text" class="form-control mt-2" v-model="sparepart.sparepartName" placeholder="Company Name"
                disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Stock</label><br>
              <input type="text" class="form-control mt-2" v-model="sparepart.totalUnit" placeholder="Stock" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="branch">Branch</label><br>
              <select class="form-select mt-2" id="branch" v-model="sparepart.branch" disabled>
                <option value="" disabled selected>Select Branch</option>
                <option v-for="(branch, index) in common.branch" :key="index" :value="branch">
                  {{ branch }}
                </option>
              </select>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Sparepart Number</label><br>
              <input type="text" class="form-control mt-2" v-model="sparepart.sparepartNumber" placeholder="Part Number"
                disabled>
            </div>
            <div v-if="isRoleDirector || isRoleFinance" class="input form-group col-12">
              <label for="">Buy Price</label><br>
              <input type="text" class="form-control mt-2" v-model="sparepart.unitPriceBuy" placeholder="Buy Price"
                disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Selling Price</label><br>
              <input type="text" class="form-control mt-2" v-model="sparepart.unitPriceSell" placeholder="Selling Price"
                disabled>
            </div>
          </div>
        </div>
      </div>
      <div v-if="isRoleDirector || isRoleFinance" class="lower my-2">
        <div class="title">Purchase Price</div>
        <div class="data row">
          <div class="lists" v-for="(list, index) in sparepart.unitPriceSeller" :key="index">
            <div class="input form-group col-5">
              <label for="">Seller</label><br>
              <input type="text" class="form-control mt-2" v-model="list.seller" placeholder="Seller" disabled>
            </div>
            <div class="input form-group col-3">
              <label for="">Puchase Price</label><br>
              <input type="text" class="form-control mt-2" v-model="list.price" placeholder="Purchase Price" disabled>
            </div>
            <div class="input form-group col-3">
              <label for="">Quantity</label><br>
              <input type="text" class="form-control mt-2" v-model="list.quantity" placeholder="Quantity" disabled>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="back">Back</button>
      <button type="button" class="btn btn-danger mx-5" @click="deleteSparepartConfirmation">Delete</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="goToEdit">Edit</button>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import { useRoute, useRouter } from 'vue-router'
import { useSparepartStore } from '@/stores/sparepart'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useModalStore } from '@/stores/modal'
import { common } from '@/config'
import { useRole } from '@/composeable/useRole'

const route = useRoute()
const router = useRouter()
const modalStore = useModalStore()
const sparepartStore = useSparepartStore()
const isProcessing = ref(false)

const { sparepart } = storeToRefs(sparepartStore)

const { isRoleDirector, isRoleFinance } = useRole()

onBeforeMount(() => {
  if (!sparepart.value) sparepartStore.$resetSparepart()
  console.log(sparepart.value)
})
onMounted(() => {
  sparepartStore.getSparepart(route.params.id)
})

const deleteSparepart = async () => {
  try {
    if (isProcessing.value) return
    await sparepartStore.deleteSparepart(route.params.id)
    isProcessing.value = false
    router.push(menuConfig.spareparts.path)
  } catch (error) {
    throw error.data.error || error.data.message
  }
}

const goToEdit = async () => {
  router.push(`${menuConfig.spareparts.path}/${sparepart.id}/edit`)
}

const deleteSparepartConfirmation = () => {
  modalStore.openConfirmationModal('to delete sparepart ?', 'Delete Sparepart Success', deleteSparepart)
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

      .input {
        margin: 0.5% 5% 0.5% 0%;
      }
    }
  }
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
