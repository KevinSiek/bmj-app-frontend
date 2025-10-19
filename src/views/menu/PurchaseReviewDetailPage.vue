<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="my-2">
        <div class="title">Purchase List</div>
        <div class="table-placeholder">
          <table class="table table-hover">
            <thead>
              <tr class="align-middle">
                <th scope="col-1" class="table-number">No</th>
                <th scope="col" class="table-name">Sparepart Name</th>
                <th scope="col" class="table-part-number">Sparepart Number</th>
                <th scope="col" class="table-name">Quantity</th>
                <th scope="col" class="table-name">Unit Price</th>
                <th scope="col" class="table-name">Total Price</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-for="(sparepart, index) in purchase.spareparts" :key="index" class="align-middle">
                <td scope="row" class="table-col table-number">{{ index + 1 }}</td>
                <td class="table-col table-part-number">{{ sparepart.sparepartName }}</td>
                <td class="table-col table-part-number">{{ sparepart.sparepartNumber }}</td>
                <td class="table-col table-name">{{ sparepart.quantity }}</td>
                <td class="table-col table-name">{{ formatCurrency(sparepart.unitPriceBuy) }}</td>
                <td class="table-col table-name">{{ formatCurrency(sparepart.totalPrice) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Description</div>
        <div class="text">{{ purchase.notes }}</div>
      </div>
      <div class="total my-2">
        <div class="title">Total Purchase</div>
        <div class="text">Rp. {{ purchase.totalAmount }}</div>
      </div>
    </form>
  </div>
  <div class="status background">
    Status: {{ purchase.currentStatus }}
  </div>
  <div class="button">
    <div class="right">
      <button type="button" class="btn btn-danger mx-3" @click="rejectConfirmation"
        :disabled="isProcessing">Reject</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-needChange mx-3" @click="needChangeConfirmation"
        :disabled="isProcessing">Need Change</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-success mx-3" @click="approveConfirmation"
        :disabled="isProcessing">Approve</button>
    </div>
  </div>
</template>

<script setup>
import { useModalStore } from '@/stores/modal'
import { usePurchaseStore } from '@/stores/purchase'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { formatCurrency } from '@/utils/form-util'

const route = useRoute()
const purchaseStore = usePurchaseStore()
const modalStore = useModalStore()

const { purchase } = storeToRefs(purchaseStore)

const isProcessing = ref(false)

onMounted(() => {
  purchaseStore.getPurchase(route.params.id)
})

const reject = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await purchaseStore.rejectPurchase(route.params.id)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const rejectConfirmation = () => {
  modalStore.openConfirmationModal('reject this purchase ?', 'Purchase has been Rejected', reject)
}
const needChange = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await purchaseStore.needChangePurchase(route.params.id)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const needChangeConfirmation = () => {
  modalStore.openConfirmationModal('this purchase need change ?', 'Purchase need to be changed', needChange)
}
const approve = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await purchaseStore.approvePurchase(route.params.id)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const approveConfirmation = () => {
  modalStore.openConfirmationModal('approve this purchase ?', 'Purchase has been Approved', approve)
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.contain {
  padding: 2.5% 5%;
  height: 62vh;

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

  .lower {
    .data {
      display: flex;
      justify-content: space-between;
    }

    .left,
    .right {
      width: 48%;
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

  .btn-needChange {
    background-color: $primary-color;
  }
}
</style>
