<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="notes my-2">
        <div class="title">Branch</div>
        <div class="text">{{ purchase.branch }}</div>
      </div>
      <div class="my-2">
        <div class="title">Purchase List</div>
        <div class="table-placeholder">
          <table class="table table-hover">
            <thead>
              <tr class="align-middle">
                <th scope="col-1" class="table-number">No</th>
                <th scope="col" class="table-name">Sparepart Name</th>
                <th scope="col" class="table-part-number">Sparepart Number</th>
                <th scope="col" class="table-name">Seller</th>
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
                <td class="table-col table-name">{{ sparepart.seller || '-' }}</td>
                <td class="table-col table-name">{{ sparepart.quantity }}</td>
                <td class="table-col table-name"><PriceDisplay :value="sparepart.unitPriceBuy" /></td>
                <td class="table-col table-name"><PriceDisplay :value="sparepart.totalPrice" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Description</div>
        <div class="text">{{ purchase.notes }}</div>
      </div>
      <div class="total my-2 d-flex align-items-center">
        <div class="title" style="width: 180px;">Total Purchase</div>
        <div class="d-flex align-items-center flex-grow-1" style="max-width: 250px;">
          <span class="me-2">:</span>
          <PriceDisplay :value="purchase.totalAmount" />
        </div>
      </div>
    </form>
  </div>
  <div class="status background">
    Status: {{ purchase.currentStatus }}
  </div>
  <div class="button">
    <div class="left" v-if="isShowEdit">
      <button type="button" class="btn btn-process" @click="goToEdit" :disabled="isProcessing">Edit</button>
    </div>
    <div class="right" v-if="purchase.currentStatus == common.status.approved">
      <button type="button" class="btn btn-process" @click="receiveConfirmation"
        :disabled="isProcessing">Receive</button>
    </div>
  </div>
</template>

<script setup>
import { common, menuMapping as menuConfig } from '@/config'
import { useModalStore } from '@/stores/modal'
import { usePurchaseStore } from '@/stores/purchase'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatCurrency } from '@/utils/form-util'
import PriceDisplay from '@/components/PriceDisplay.vue'

const route = useRoute()
const router = useRouter()
const purchaseStore = usePurchaseStore()
const modalStore = useModalStore()

const { purchase } = storeToRefs(purchaseStore)

const isProcessing = ref(false)

const HIDDEN_EDIT_STATUSES = [
  common.status.purchase.received,
  common.status.rejected,
  common.status.purchase.approved,
]

const isShowEdit = computed(() => {
  const status = purchase.value.currentStatus
  return status && !HIDDEN_EDIT_STATUSES.includes(status)
})

onBeforeMount(() => {
  if (!purchase.value) purchaseStore.$resetPurchase()
})
onMounted(() => {
  purchaseStore.getPurchase(route.params.id)
})

const goToEdit = () => {
  router.push(`${menuConfig.purchase.path}/${purchase.value.id}/edit`)
}
const receive = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await purchaseStore.receive(route.params.id)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    await purchaseStore.getPurchase(route.params.id)
    isProcessing.value = false
  }
}
const receiveConfirmation = () => {
  modalStore.openConfirmationModal('receive this purchase ?', 'Purchase has been Received', receive)
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
