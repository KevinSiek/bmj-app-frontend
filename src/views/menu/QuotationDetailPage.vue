<template>
  <div class="contain background shadow">
    <QuotationForm :type="common.form.type.view" />
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="goToEdit">Edit</button>
      <button type="button" class="btn btn-process mx-3" @click="download">Print</button>
    </div>
    <div class="right" v-if="canCreatePO">
      <button type="button" class="btn btn-process" @click="processQuotationConfirmation"
        :disabled="isProcessing">Create PO</button>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig, common } from '@/config'
import { useRoute, useRouter } from 'vue-router'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useQuotationStore } from '@/stores/quotation'
import { storeToRefs } from 'pinia'
import { useTrackStore } from '@/stores/track'
import { useModalStore } from '@/stores/modal'
import { useAuthStore } from '@/stores/auth'
import { createPdf } from '@/utils/pdf/quotation'

import QuotationForm from '@/components/quotation/QuotationForm.vue'

const route = useRoute()
const router = useRouter()
const quotationStore = useQuotationStore()
const trackStore = useTrackStore()
const modalStore = useModalStore()
const authStore = useAuthStore()

const { user } = storeToRefs(authStore)
const { quotation } = storeToRefs(quotationStore)

const isProcessing = ref(false)

const canCreatePO = computed(() => !quotation.value?.status?.some(s => s.state === 'Po'))

onBeforeMount(() => {
  if (!quotation.value) quotationStore.$resetQuotation()
})
onMounted(async () => {
  await quotationStore.getQuotation(route.params.id)
  await trackStore.setTrackData(quotation.value.status)
})

const goToEdit = () => {
  router.push(`${menuConfig.quotation.path}/${quotation.value.slug}/edit`)
}

const processQuotation = async (notes, poNumber) => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await quotationStore.processQuotation(route.params.id, notes, poNumber)
    router.push(menuConfig.purchase_order.path)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}

const processQuotationConfirmation = () => {
  // moveToPo now collects both the notes and the real PO number ("No PO"). Capture them when
  // the notes modal is submitted — the confirmation modal that follows resets the modal store.
  modalStore.openNotesModal('Create PO', () => {
    const notes = modalStore.notes
    const poNumber = modalStore.poNumber
    modalStore.openConfirmationModal('to process this Quotation to Purchase Order ?', `Purchase Order Created with quotation ${quotation.value.project.quotationNumber}`, () => processQuotation(notes, poNumber))
  }, { requirePo: true })
}

const download = () => {
  modalStore.openNotesModal('Print Quotation', async () => {
    await createPdf(quotation.value, modalStore.notes, user.value)
    modalStore.closeModal()
  })
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.contain {
  padding: 2.5% 5%;
  height: 72vh;
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

@media only screen and (max-width: 769px) {
  .contain {}
}

@media only screen and (max-width: 767px) {

  /*   mobile phones: */
  .contain {
    height: 80vh;
  }

  .button {
    margin: 4% 6%;

    .btn {
      padding: 1vh 4vw;
      font-size: 3.5vw;
    }

    .left {
      display: flex;
    }
  }
}
</style>
