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
              <input type="text" class="form-control mt-2" v-model="sparepart.totalUnit" placeholder="Stock">
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Part Number</label><br>
              <input type="text" class="form-control mt-2" v-model="sparepart.sparepartNumber"
                placeholder="Sparepart Number">
            </div>
            <div class="input form-group col-12">
              <label for="">Selling Price</label><br>
              <input type="text" class="form-control mt-2" v-model="sparepart.unitPriceSell"
                placeholder="Selling Price">
            </div>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="title">Purchase Price</div>
        <div class="data row">
          <div class="lists" v-for="(list, index) in sparepart.unitPriceBuy" :key="index">
            <div class="input form-group col-6">
              <label for="">Seller</label><br>
              <input type="text" class="form-control mt-2" v-model="list.seller" placeholder="Seller">
            </div>
            <div class="input form-group col-3">
              <label for="">Puchase Price</label><br>
              <input type="text" class="form-control mt-2" v-model="list.price" placeholder="Purchase Price">
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
      <button type="button" class="btn btn-process" @click="editSparepartConfirmation">Edit</button>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import { useRouter } from 'vue-router'
import { useSparepartStore } from '@/stores/sparepart'
import { storeToRefs } from 'pinia'
import { useModalStore } from '@/stores/modal'
import { onBeforeMount } from 'vue'

const router = useRouter()
const sparepartStore = useSparepartStore()
const modalStore = useModalStore()

const { sparepart } = storeToRefs(sparepartStore)

onBeforeMount(() => {
  if (!sparepart.value) sparepartStore.$resetSparepart()
  console.log(sparepart.value)
})

const addSeller = () => {
  sparepart.value.unitPriceBuy.push({
    seller: '',
    price: 0
  })
}

const addSparepart = async () => {
  try {
    await sparepartStore.addSparepart()
    router.push(menuConfig.spareparts)
  } catch (error) {
    throw error.data.error || error.data.message
  }
}

const editSparepartConfirmation = () => {
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

.add-btn {
  display: flex;
  justify-content: center;
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
