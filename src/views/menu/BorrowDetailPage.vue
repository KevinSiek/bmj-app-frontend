<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="left">
          <div class="title">Borrow</div>
          <div class="input form-group col-12">
            <label for="">No</label><br>
            <input type="text" class="form-control mt-2" v-model="borrow.borrowNumber" placeholder="No" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Borrower</label><br>
            <input type="text" class="form-control mt-2" v-model="borrow.borrowerName" placeholder="Borrower" disabled>
          </div>
        </div>
        <div class="right">
          <div class="title">Detail</div>
          <div class="input form-group col-12">
            <label for="">Branch</label><br>
            <input type="text" class="form-control mt-2" v-model="borrow.branch.name" placeholder="Branch" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Status</label><br>
            <input type="text" class="form-control mt-2" v-model="borrow.currentStatus" placeholder="Status" disabled>
          </div>
        </div>
      </div>
      <div class="my-2">
        <div class="title">Sparepart</div>
        <div class="table-placeholder">
          <table class="table table-hover">
            <thead>
              <tr class="align-middle">
                <th scope="col-1" class="table-number">NO</th>
                <th scope="col" class="table-name">DESCRIPTION</th>
                <th scope="col" class="table-name">PART NUMBER</th>
                <th scope="col" class="table-name">QUANTITY</th>
                <th scope="col" class="table-name">STOCK IN BRANCH</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-for="(sparepart, index) in borrow.spareparts" :key="index" class="align-middle">
                <td scope="row" class="table-col table-number">{{ index + 1 }}</td>
                <td class="table-col table-name">{{ sparepart.sparepartName }}</td>
                <td class="table-col table-name">{{ sparepart.sparepartNumber }}</td>
                <td class="table-col table-name">{{ sparepart.quantity }}</td>
                <td class="table-col table-name">{{ sparepart.stockInBranch }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="borrow.notes" disabled></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="right">
      <button v-if="canCancel" type="button" class="btn btn-danger" @click="cancelConfirmation"
        :disabled="isProcessing">Cancel</button>
      <button v-if="canBorrow" type="button" class="btn btn-process" @click="borrowConfirmation"
        :disabled="isProcessing">Borrow</button>
      <button v-if="canReturn" type="button" class="btn btn-success" @click="returnConfirmation"
        :disabled="isProcessing">Return</button>
    </div>
  </div>
</template>

<script setup>
import { useBorrowStore } from '@/stores/borrow'
import { useModalStore } from '@/stores/modal'
import { useTrackStore } from '@/stores/track'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { common } from '@/config'

const route = useRoute()
const borrowStore = useBorrowStore()
const modalStore = useModalStore()
const trackStore = useTrackStore()

const { borrow } = storeToRefs(borrowStore)

const isProcessing = ref(false)

const status = common.status.borrow

const canBorrow = computed(() => borrow.value?.currentStatus === status.created)
const canReturn = computed(() => borrow.value?.currentStatus === status.borrowed)
const canCancel = computed(() =>
  borrow.value?.currentStatus === status.created || borrow.value?.currentStatus === status.borrowed)

const fetchData = async () => {
  await borrowStore.getBorrow(route.params.id)
  await trackStore.setTrackData(borrow.value.status)
}

onBeforeMount(() => {
  if (!borrow.value) borrowStore.$resetBorrow()
})

onMounted(async () => {
  await fetchData()
})

const doBorrow = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await borrowStore.borrowBorrow(route.params.id)
    await fetchData()
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const borrowConfirmation = () => {
  modalStore.openConfirmationModal('to Borrow these Spareparts ?', 'Borrow Success', doBorrow)
}

const doReturn = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await borrowStore.returnBorrow(route.params.id)
    await fetchData()
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const returnConfirmation = () => {
  modalStore.openConfirmationModal('to Return these Spareparts ?', 'Return Success', doReturn)
}

const doCancel = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await borrowStore.cancelBorrow(route.params.id)
    await fetchData()
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const cancelConfirmation = () => {
  modalStore.openConfirmationModal('to Cancel this Borrow ?', 'Cancel Success', doCancel)
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
    display: flex;
    justify-content: space-between;

    .left,
    .right {
      width: 48%;
    }
  }

  .table-placeholder {
    text-align: center;
    border: 2px solid $primary-color;
    border-radius: 20px;
    overflow: auto;
  }
}

.button {
  display: flex;
  margin: 2% 4%;
  justify-content: flex-end;

  .right {
    display: flex;
    gap: 15px;
  }

  .btn {
    padding: 1.5vh 3vw 1.5vh 3vw;
    font-weight: 500;
    color: white;
    font-size: 1.1vw;
    letter-spacing: 0.03vw;
  }

  .btn-process {
    background-color: $primary-color;
  }
}

@media only screen and (max-width: 767px) {
  .contain {
    padding: 4% 5%;
    height: 78vh;

    .upper {
      flex-direction: column;

      .left,
      .right {
        width: 100%;
      }
    }

    .table-placeholder {
      .table {
        min-width: 600px;
        font-size: 14px;
      }
    }
  }

  .button {
    margin: 4% 6%;

    .btn {
      padding: 1.2vh 4vw;
      font-size: 3vw;
    }
  }
}
</style>
