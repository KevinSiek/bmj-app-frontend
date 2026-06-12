<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="left">
          <div class="title">Borrow</div>
          <div class="input form-group col-12">
            <label>No</label><br>
            <input type="text" class="form-control mt-2" v-model="borrow.borrowNumber" disabled>
          </div>
          <div class="input form-group col-12">
            <label>Service PO</label><br>
            <input type="text" class="form-control mt-2"
              :value="borrow.purchaseOrder.poNumber || borrow.purchaseOrder.purchaseOrderNumber" disabled>
          </div>
          <div class="input form-group col-12">
            <label>Work Order</label><br>
            <input type="text" class="form-control mt-2" :value="borrow.workOrder.workOrderNumber" disabled>
          </div>
        </div>
        <div class="right">
          <div class="title">Detail</div>
          <div class="input form-group col-12">
            <label>Branch</label><br>
            <input type="text" class="form-control mt-2" v-model="borrow.branch.name" disabled>
          </div>
          <div class="input form-group col-12">
            <label>Status</label><br>
            <input type="text" class="form-control mt-2" v-model="borrow.currentStatus" disabled>
          </div>
        </div>
      </div>

      <div class="my-2">
        <div class="title">Sparepart</div>
        <div class="table-placeholder">
          <table class="table table-hover">
            <thead>
              <tr class="align-middle">
                <th class="table-number">NO</th>
                <th class="table-name">DESCRIPTION</th>
                <th class="table-name">PART NUMBER</th>
                <th class="table-name">QUANTITY</th>
                <th class="table-name">QUANTITY RETURN</th>
                <th class="table-name">STOCK IN BRANCH</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-for="(sparepart, index) in borrow.spareparts" :key="index" class="align-middle">
                <td class="table-col table-number">{{ index + 1 }}</td>
                <td class="table-col table-name">{{ sparepart.sparepartName }}</td>
                <td class="table-col table-name">{{ sparepart.sparepartNumber }}</td>
                <td class="table-col table-name">{{ sparepart.quantity }}</td>
                <td class="table-col table-name">
                  <input v-if="canReconcile" type="number" class="form-control return-input"
                    min="0" :max="sparepart.quantity" v-model.number="returnQuantities[index]">
                  <span v-else>{{ sparepart.quantityReturn ?? '-' }}</span>
                </td>
                <td class="table-col table-name">{{ sparepart.stockInBranch }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="canReconcile && hasShortfall" class="shortfall my-3">
        <div class="title">Sparepart PO (shortfall justification)</div>
        <p class="text-muted small">
          Returned quantity is less than borrowed — select a Sparepart PO that covers the missing
          items (sold spareparts).
        </p>
        <PoSelect type="Spareparts" placeholder="Search Sparepart PO" @select="selectSparepartPo" />
      </div>

      <div class="notes my-2">
        <div class="title">Notes Marketing</div>
        <textarea class="form-control" v-model="borrow.notes" style="height: 100px" disabled></textarea>
      </div>

      <div v-if="borrow.returnNotes" class="notes my-2">
        <div class="title">Return Notes</div>
        <textarea class="form-control" v-model="borrow.returnNotes" style="height: 80px" disabled></textarea>
      </div>

      <div v-if="borrow.rejectNotes" class="notes my-2">
        <div class="title">Reject Notes</div>
        <textarea class="form-control" v-model="borrow.rejectNotes" style="height: 80px" disabled></textarea>
      </div>
    </form>
  </div>

  <div class="button">
    <div class="right">
      <button v-if="canCancel" type="button" class="btn btn-edit" @click="goToEdit"
        :disabled="isProcessing">Edit</button>
      <button v-if="canCancel" type="button" class="btn btn-danger" @click="cancelConfirmation"
        :disabled="isProcessing">Cancel</button>
      <button v-if="canReview" type="button" class="btn btn-danger" @click="rejectPrompt"
        :disabled="isProcessing">Reject</button>
      <button v-if="canReview" type="button" class="btn btn-process" @click="approveConfirmation"
        :disabled="isProcessing">Approve</button>
      <button v-if="canHandover" type="button" class="btn btn-secondary" @click="printPdfPrompt"
        :disabled="isProcessing">Print PDF</button>
      <button v-if="canHandover" type="button" class="btn btn-process" @click="sendConfirmation"
        :disabled="isProcessing">Send</button>
      <button v-if="canKembali" type="button" class="btn btn-success" @click="kembaliPrompt"
        :disabled="isProcessing">Kembali</button>
      <button v-if="canReconcile" type="button" class="btn btn-process" @click="doneConfirmation"
        :disabled="isProcessing">Done</button>
    </div>
  </div>
</template>

<script setup>
import { useBorrowStore } from '@/stores/borrow'
import { useModalStore } from '@/stores/modal'
import { useTrackStore } from '@/stores/track'
import { useRole } from '@/composeable/useRole'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { common, menuMapping as menuConfig } from '@/config'
import { createPdf } from '@/utils/pdf/borrow'

const route = useRoute()
const router = useRouter()
const borrowStore = useBorrowStore()
const modalStore = useModalStore()
const trackStore = useTrackStore()
const { isRoleMarketing, isRoleDirector, isRoleHeadInventory, isRoleInventoryAdmin, isRoleInventoryPurchase, user } = useRole()

const { borrow } = storeToRefs(borrowStore)

const isProcessing = ref(false)
const status = common.status.borrow

// Per-line returned quantity inputs (reconciliation only).
const returnQuantities = ref([])
const sparepartPoId = ref('')

const isInventory = computed(() =>
  isRoleInventoryAdmin.value || isRoleInventoryPurchase.value || isRoleHeadInventory.value || isRoleDirector.value)
const isMarketing = computed(() => isRoleMarketing.value || isRoleDirector.value)
const isReviewer = computed(() => isRoleHeadInventory.value || isRoleDirector.value)

const canCancel = computed(() => isMarketing.value && borrow.value?.currentStatus === status.created)
const canReview = computed(() => isReviewer.value && borrow.value?.currentStatus === status.created)
const canHandover = computed(() => isInventory.value && borrow.value?.currentStatus === status.approved)
const canKembali = computed(() => isMarketing.value && borrow.value?.currentStatus === status.borrowed)
const canReconcile = computed(() => isInventory.value && borrow.value?.currentStatus === status.returned)

const hasShortfall = computed(() =>
  borrow.value?.spareparts?.some((sp, i) => Number(returnQuantities.value[i]) < Number(sp.quantity)))

const fetchData = async () => {
  await borrowStore.getBorrow(route.params.id)
  await trackStore.setTrackData(borrow.value.status, 'borrow')
  // Seed reconciliation inputs with the borrowed quantity (assume full return by default).
  returnQuantities.value = borrow.value.spareparts.map(sp => sp.quantityReturn ?? sp.quantity)
  sparepartPoId.value = ''
}

onBeforeMount(() => {
  if (!borrow.value) borrowStore.$resetBorrow()
  borrowStore.resetPurchaseOrderOptions()
})

onMounted(fetchData)

const runAction = async (fn) => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await fn()
    await fetchData()
  } catch (error) {
    throw error.data?.error || error.data?.message || 'Action failed'
  } finally {
    isProcessing.value = false
  }
}

// --- Marketing ---
const goToEdit = () => router.push(menuConfig.borrow_edit.path.replace(':id', route.params.id))

const cancelConfirmation = () =>
  modalStore.openConfirmationModal('to Cancel this Borrow ?', 'Cancel Success',
    () => runAction(() => borrowStore.cancelBorrow(route.params.id)))

const kembaliPrompt = () =>
  modalStore.openNotesModal('Kembali', async () => {
    await runAction(() => borrowStore.kembaliBorrow(route.params.id, modalStore.notes))
    modalStore.closeModal()
  })

// --- Reviewer ---
const approveConfirmation = () =>
  modalStore.openConfirmationModal('to Approve this Borrow ?', 'Approve Success',
    () => runAction(() => borrowStore.approveBorrow(route.params.id)))

const rejectPrompt = () =>
  modalStore.openNotesModal('Reject', async () => {
    await runAction(() => borrowStore.rejectBorrow(route.params.id, modalStore.notes))
    modalStore.closeModal()
  })

// --- Inventory: handover ---
const printPdfPrompt = () =>
  modalStore.openNotesModal('Print PDF', async () => {
    // The notes field carries the receiver name (Yang Menerima); the handover name is the user.
    await createPdf(borrow.value, user.value?.fullname || user.value?.username || '', modalStore.notes)
    modalStore.closeModal()
  }, { label: 'Nama Penerima' })

const sendConfirmation = () =>
  modalStore.openConfirmationModal('to Send (handover) these Spareparts ? Stock will be deducted.',
    'Send Success', () => runAction(() => borrowStore.sendBorrow(route.params.id)))

const selectSparepartPo = (po) => { sparepartPoId.value = po.id }

// --- Inventory: reconciliation ---
const doDone = async () => {
  const payload = {
    returned: borrow.value.spareparts.map((sp, i) => ({
      sparepartId: sp.sparepartId,
      quantityReturn: Number(returnQuantities.value[i] ?? 0)
    }))
  }
  if (hasShortfall.value) {
    if (!sparepartPoId.value) {
      throw 'A Sparepart PO is required when returned quantity is less than borrowed.'
    }
    payload.sparepartPoId = sparepartPoId.value
  }
  await borrowStore.doneBorrow(route.params.id, payload)
}

const doneConfirmation = () => {
  const invalid = borrow.value.spareparts.some((sp, i) => {
    const q = Number(returnQuantities.value[i])
    return Number.isNaN(q) || q < 0 || q > Number(sp.quantity)
  })
  if (invalid) {
    modalStore.openMessageModal(common.modal.failed, 'Each returned quantity must be between 0 and the borrowed quantity.')
    return
  }
  modalStore.openConfirmationModal('to mark this Borrow as Done ?', 'Done Success',
    () => runAction(doDone))
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.contain {
  padding: 2.5% 5%;
  height: 72vh;
  overflow: auto;

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

  .return-input {
    max-width: 100px;
    margin: 0 auto;
  }
}

.button {
  display: flex;
  margin: 2% 4%;
  justify-content: flex-end;

  .right {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
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

  .btn-edit {
    background-color: $secondary-color;
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
  }
}
</style>
