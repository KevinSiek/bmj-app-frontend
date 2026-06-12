<template>
  <div class="contain" v-if="detail">
    <div class="header mb-4 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <button class="btn btn-outline-secondary me-3" @click="goBack">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h3>Stock Movement Detail - {{ detail.movementNumber }}</h3>
      </div>
      <div class="actions">
        <button v-if="canCancel" class="btn btn-outline-danger me-2" @click="handleCancel">Cancel</button>
        <button v-if="canSend" class="btn btn-primary me-2" @click="handleSend">Send</button>
        <button v-if="canReceive" class="btn btn-success me-2" @click="handleReceive">Receive</button>
        <button class="btn btn-outline-dark" @click="printPdf">
          <i class="bi bi-printer"></i> Print PDF
        </button>
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
</template>

<script setup>
import { onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSparepartMovementStore } from '@/stores/sparepart-movement'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'
import { generateSparepartMovementPdf } from '@/utils/pdf/sparepart-movement'

const route = useRoute()
const router = useRouter()
const store = useSparepartMovementStore()
const authStore = useAuthStore()
const modalStore = useModalStore()

const detail = computed(() => store.detail)

onMounted(async () => {
  try {
    await store.fetchDetail(route.params.id)
  } catch (error) {
    modalStore.setModalMessage('Error', 'Failed to fetch detail', false)
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

const handleSend = () => {
  modalStore.setModalConfirmation('Send Movement', 'Are you sure you want to send these spareparts?', async () => {
    try {
      await store.send(route.params.id)
      modalStore.setModalMessage('Success', 'Movement sent successfully', true)
    } catch (error) {
      modalStore.setModalMessage('Failed', error.response?.data?.message || 'Failed to send', false)
    }
  })
}

const handleCancel = () => {
  modalStore.setModalConfirmation('Cancel Movement', 'Are you sure you want to cancel this movement?', async () => {
    try {
      await store.cancel(route.params.id)
      modalStore.setModalMessage('Success', 'Movement cancelled successfully', true)
    } catch (error) {
      modalStore.setModalMessage('Failed', error.response?.data?.message || 'Failed to cancel', false)
    }
  })
}

const handleReceive = () => {
  modalStore.setModalConfirmation('Receive Movement', 'Are you sure you want to receive these spareparts? Stock will be updated.', async () => {
    try {
      await store.receive(route.params.id)
      modalStore.setModalMessage('Success', 'Movement received and stock updated', true)
    } catch (error) {
      modalStore.setModalMessage('Failed', error.response?.data?.message || 'Failed to receive', false)
    }
  })
}

const printPdf = () => {
  if (detail.value) {
    generateSparepartMovementPdf(detail.value)
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
.contain {
  padding: 2rem;
}
.small {
  font-size: 0.8rem;
}
</style>
