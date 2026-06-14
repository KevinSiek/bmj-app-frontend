<template>
  <div class="contain" v-if="detail">
    <div class="header mb-4 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <button class="btn btn-outline-secondary me-3" @click="goBack">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h3>Stock Movement Detail - {{ detail.movementNumber }}</h3>
      </div>
    </div>

    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4 mb-2">
            <span class="text-muted d-block text-uppercase small">Status</span>
            <strong>{{ detail.currentStatus }}</strong>
          </div>
          <div class="col-md-4 mb-2">
            <span class="text-muted d-block text-uppercase small">Date</span>
            <strong>{{ new Date(detail.createdAt).toLocaleDateString('id-ID') }}</strong>
          </div>
          <div class="col-md-4 mb-2">
            <span class="text-muted d-block text-uppercase small">Created By</span>
            <strong>{{ detail.employee?.name }}</strong>
          </div>
          <div class="col-md-4 mb-2">
            <span class="text-muted d-block text-uppercase small">Source Branch</span>
            <strong>{{ detail.sourceBranch }}</strong>
          </div>
          <div class="col-md-4 mb-2">
            <span class="text-muted d-block text-uppercase small">Target Branch</span>
            <strong>{{ detail.targetBranch }}</strong>
          </div>
          <div class="col-md-4 mb-2">
            <span class="text-muted d-block text-uppercase small">Reason</span>
            <strong>{{ detail.reason || '-' }}</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-header bg-white">
        <h5 class="mb-0">Items</h5>
      </div>
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Part Number</th>
              <th>Part Name</th>
              <th class="text-center">Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in detail.details" :key="item.id">
              <td>{{ item.sparepart.sparepart_number }}</td>
              <td>{{ item.sparepart.sparepart_name }}</td>
              <td class="text-center">{{ item.quantity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="card shadow-sm">
      <div class="card-header bg-white">
        <h5 class="mb-0">History</h5>
      </div>
      <div class="card-body">
        <ul class="list-group list-group-flush">
          <li class="list-group-item px-0" v-for="(hist, idx) in detail.status" :key="idx">
            <strong>{{ hist.status }}</strong> by {{ hist.by }} at {{ new Date(hist.date).toLocaleString('id-ID') }}
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div v-else class="p-5 text-center">
    Loading...
  </div>

  <div v-if="detail" class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="printPdf">Print PDF</button>
    </div>
    <div class="right">
      <button v-if="canCancel" type="button" class="btn btn-edit me-3" @click="handleCancel"
        :disabled="isProcessing">Cancel</button>
      <button v-if="canSend" type="button" class="btn btn-process" @click="handleSend"
        :disabled="isProcessing">Send</button>
      <button v-if="canReceive" type="button" class="btn btn-process" @click="handleReceive"
        :disabled="isProcessing">Receive</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSparepartMovementStore } from '@/stores/sparepart-movement'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'
import { common } from '@/config'
import { generateSparepartMovementPdf } from '@/utils/pdf/sparepart-movement'

const route = useRoute()
const router = useRouter()
const store = useSparepartMovementStore()
const authStore = useAuthStore()
const modalStore = useModalStore()

const detail = computed(() => store.detail)
const isProcessing = ref(false)

onMounted(async () => {
  try {
    await store.fetchDetail(route.params.id)
  } catch (error) {
    modalStore.openMessageModal(common.modal.failed, 'Failed to fetch detail')
    router.back()
  }
})

onBeforeUnmount(() => {
  store.$resetDetail()
})

const goBack = () => {
  router.back()
}

const canSend = computed(() => {
  return detail.value?.currentStatus === 'Created' && detail.value?.sourceBranch === authStore.user?.branch
})

const canCancel = computed(() => {
  return detail.value?.currentStatus === 'Created' && detail.value?.sourceBranch === authStore.user?.branch
})

const canReceive = computed(() => {
  return detail.value?.currentStatus === 'Send' && (detail.value?.targetBranch === authStore.user?.branch || authStore.user?.role === 'Director')
})

const runTransition = async (fn, failMessage) => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await fn(route.params.id)
  } catch (error) {
    modalStore.openMessageModal(common.modal.failed, error.response?.data?.message || failMessage)
  } finally {
    isProcessing.value = false
  }
}

const handleSend = () => {
  modalStore.openConfirmationModal('to send these spareparts ?', 'Movement sent successfully',
    () => runTransition(store.send, 'Failed to send'))
}

const handleCancel = () => {
  modalStore.openConfirmationModal('to cancel this movement ?', 'Movement cancelled successfully',
    () => runTransition(store.cancel, 'Failed to cancel'))
}

const handleReceive = () => {
  modalStore.openConfirmationModal('to receive these spareparts ? Stock will be updated.', 'Movement received and stock updated',
    () => runTransition(store.receive, 'Failed to receive'))
}

const printPdf = () => {
  if (detail.value) {
    generateSparepartMovementPdf(detail.value)
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.contain {
  padding: 2rem;
}
.small {
  font-size: 0.8rem;
}

.button {
  display: flex;
  margin: 1% 2rem 2rem;
  justify-content: space-between;

  .btn {
    padding: 1.3vh 2.2vw;
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

@media only screen and (max-width: 767px) {
  .button {
    margin: 4% 6%;

    .btn {
      padding: 1vh 4vw;
      font-size: 3.5vw;
    }
  }
}
</style>
