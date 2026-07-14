<template>
  <div class="contain">
    <LoaderOverlaySmall v-if="isLoading" />
    <template v-if="detail">
      <div class="header mb-2 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <h3>{{ detail.movementNumber }}</h3>
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
          </div>
          <div class="row">
            <span class="text-muted d-block text-uppercase small">Reason</span>
            <strong>{{ detail.reason || '-' }}</strong>
          </div>
        </div>
      </div>

      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white">
          <h5 class="mb-0">Spareparts</h5>
        </div>
        <div class="card-body p-0" style="height: 33vh; overflow-y: auto;">
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
    </template>
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
import LoaderOverlaySmall from '@/components/LoaderOverlaySmall.vue'
import { onMounted, computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSparepartMovementStore } from '@/stores/sparepart-movement'
import { useModalStore } from '@/stores/modal'
import { useTrackStore } from '@/stores/track'
import { useRole } from '@/composeable/useRole'
import { common } from '@/config'
import { generateSparepartMovementPdf } from '@/utils/pdf/sparepart-movement'

const route = useRoute()
const router = useRouter()
const sparepartMovementStore = useSparepartMovementStore()
const modalStore = useModalStore()
const trackStore = useTrackStore()

const { isRoleDirector, isRoleHeadInventory, isRoleInventoryAdmin, user } = useRole()

const detail = computed(() => sparepartMovementStore.detail)
const isProcessing = ref(false)
const isLoading = ref(true)

const fetchData = async () => {
  await sparepartMovementStore.fetchDetail(route.params.id)
  await trackStore.setTrackData(detail.value.status, 'SparepartMovement')
}

onMounted(async () => {
  try {
    await fetchData()
  } catch (error) {
    modalStore.openMessageModal(common.modal.failed, 'Failed to fetch detail')
    router.back()
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  sparepartMovementStore.$resetDetail()
})

const goBack = () => {
  router.back()
}

const isInventory = computed(() =>
  isRoleInventoryAdmin.value || isRoleHeadInventory.value || isRoleDirector.value)

const canSend = computed(() => isInventory.value && detail.value?.currentStatus === 'Created')

const canCancel = computed(() => isInventory.value && detail.value?.currentStatus === 'Created')

const canReceive = computed(() => isInventory.value && detail.value?.currentStatus === 'Send')

const runTransition = async (fn, failMessage) => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await fn(route.params.id)
  } catch (error) {
    throw error?.data?.message || failMessage
  } finally {
    isProcessing.value = false
    fetchData()
  }
}

const handleSend = () => {
  modalStore.openConfirmationModal('to send these spareparts ?', 'Movement sent successfully',
    () => runTransition(sparepartMovementStore.send, 'Failed to send'))
}

const handleCancel = () => {
  modalStore.openConfirmationModal('to cancel this movement ?', 'Movement cancelled successfully',
    () => runTransition(sparepartMovementStore.cancel, 'Failed to cancel'))
}

const handleReceive = () => {
  modalStore.openConfirmationModal('to receive these spareparts ? Stock will be updated.', 'Movement received and stock updated',
    () => runTransition(sparepartMovementStore.receive, 'Failed to receive'))
}

const printPdf = () => {
  if (detail.value) {
    generateSparepartMovementPdf(detail.value, user.value)
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.contain {
  padding: 0 2rem;
  position: relative;
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

.loading-text {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
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
