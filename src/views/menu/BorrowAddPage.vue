<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="input form-group col-6 my-2">
        <div class="title">Borrower</div>
        <input type="text" class="form-control mt-2" v-model="borrow.borrowerName" placeholder="Borrower Name">
      </div>
      <div class="my-2">
        <div class="title">Sparepart List</div>
        <div class="input form-group col-12 mx-3">
          <div class="row">
            <div class="col-11">
              <div class="row">
                <div class="col-5">
                  <label for="">Sparepart Name</label>
                </div>
                <div class="col-4">
                  <label for="">Part Number</label>
                </div>
                <div class="col-3">
                  <label for="">Quantity</label>
                </div>
              </div>
            </div>
            <div class="col-1">
              <div class="button-placeholder"></div>
            </div>
          </div>
        </div>
        <div class="input form-group col-12 mx-3">
          <div v-for="(sparepart, sparepartIndex) in borrow.spareparts" :key="sparepartIndex" class="list row">
            <div class="col-11">
              <div class="row">
                <div class="col-5">
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
                <div class="col-4">
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
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="sparepart.quantity">
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
        <div class="title">Notes</div>
        <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 100px"
          v-model="borrow.notes"></textarea>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="back" :disabled="isProcessing">Back</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="doBorrowConfirmation" :disabled="isProcessing">Add</button>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import { useBorrowStore } from '@/stores/borrow'
import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import debounce from '@/utils/debouncer'
import { useModalStore } from '@/stores/modal'
import { useRouter } from 'vue-router'

const borrowStore = useBorrowStore()
const modalStore = useModalStore()
const router = useRouter()

const { borrow, searchedSpareparts } = storeToRefs(borrowStore)

const isProcessing = ref(false)

onBeforeMount(() => {
  borrowStore.$resetBorrow()
})

const searchSparepart = (search) => {
  if (search !== '') borrowStore.getSpareparts({ page: 1, search })
}

const handleInputSearch = (search) => {
  debounce(() => searchSparepart(search), 500, 'search-borrow-sparepart')
}

const selectItem = (index, borrowData, sparepartData) => {
  const data = {
    ...borrowData,
    ...sparepartData
  }
  borrow.value.spareparts.splice(index, 1, data)
}

const addSparepart = () => {
  borrow.value.spareparts.push({
    sparepartId: '',
    sparepartName: '',
    sparepartNumber: '',
    quantity: 0,
    stockInBranch: 0
  })
}

const removeSparepart = (index) => {
  borrow.value.spareparts.splice(index, 1)
}

const doBorrow = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await borrowStore.addBorrow()
    router.push(menuConfig.borrow.path)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}

const doBorrowConfirmation = () => {
  borrow.value.spareparts = borrow.value.spareparts.filter((item) => item.quantity > 0)
  modalStore.openConfirmationModal(`to Add this Borrow with ${borrow.value.spareparts.length} Spareparts ?`, 'Add Borrow Success', doBorrow)
}

const back = () => {
  router.push(menuConfig.borrow.path)
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

.button-placeholder {
  width: 20px;
}

.dropdown-menu {
  text-align: center;
}

@media only screen and (max-width: 767px) {}
</style>
