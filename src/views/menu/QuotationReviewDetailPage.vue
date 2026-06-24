<template>
  <div class="contain background shadow">
    <QuotationForm :type="common.form.type.view" />
  </div>
  <div class="button">
    <div class="right">
      <button type="button" class="btn btn-danger" @click="rejectQuotationConfirmation"
        :disabled="isProcessing">Reject</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-approve" @click="needChangeQuotationConfirmation"
        :disabled="isProcessing">Need Change</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-success" @click="approveQuotationConfirmation"
        :disabled="isProcessing">Approve</button>
    </div>
  </div>
</template>

<script setup>
import { useQuotationStore } from '@/stores/quotation'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTrackStore } from '@/stores/track'
import { useRoute } from 'vue-router'
import { useModalStore } from '@/stores/modal'
import { common } from '@/config'
import QuotationForm from '@/components/quotation/QuotationForm.vue'

const quotationStore = useQuotationStore()
const modalStore = useModalStore()

const route = useRoute()
const { quotation, quotationReview } = storeToRefs(quotationStore)

const isProcessing = ref(false)

const fetchData = async () => {
  await quotationStore.getQuotationReview(route.params.id)
  quotation.value = quotationReview.value
}

onBeforeMount(() => {
  if (!quotationReview.value) quotationStore.$resetQuotationReview()
})

onMounted(async () => {
  await fetchData()
})

onBeforeUnmount(() => {
  quotationStore.$resetQuotation()
})

const approveQuotation = async (notes) => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await quotationStore.approveQuotation(route.params.id, notes)
    await fetchData()
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const approveQuotationConfirmation = () => {
  modalStore.openNotesModal('Approve', async () => {
    modalStore.openConfirmationModal('to approve this quotation ?', 'Approve Quotation Success', async () => {
      await approveQuotation(modalStore.notes)
    })
  }, { label: 'Notes (optional)' })
}

const needChangeQuotation = async (notes) => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await quotationStore.needChangeQuotation(route.params.id, notes)
    await fetchData()
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const needChangeQuotationConfirmation = () => {
  modalStore.openNotesModal('Need Change', async () => {
    modalStore.openConfirmationModal('to mark this quotation as need change ?', 'Need Change Quotation Success', async () => {
      await needChangeQuotation(modalStore.notes)
    })
  })
}

const rejectQuotation = async (notes) => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await quotationStore.rejectQuotation(route.params.id, notes)
    await fetchData()
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const rejectQuotationConfirmation = () => {
  modalStore.openNotesModal('Reject', async () => {
    modalStore.openConfirmationModal('to reject this quotation ?', 'Reject Quotation Success', async () => {
      await rejectQuotation(modalStore.notes)
    })
  })
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;

.contain {
  padding: 2.5% 5%;
  height: 72vh;
  overflow: auto;
}

.button {
  display: flex;
  margin: 2% 4%;
  justify-content: flex-end;

  .btn {
    padding: 1.5vh 3vw 1.5vh 3vw;
    margin: 0vw 1vw;
    font-weight: 500;
    color: white;
    font-size: 1.1vw;
    letter-spacing: 0.03vw;
  }

  .btn-approve {
    background-color: $primary-color;
  }
}
</style>
