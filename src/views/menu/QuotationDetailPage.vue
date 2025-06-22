<template>
  <div class="contain background shadow">
    <QuotationForm :type="common.form.type.view" />
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="goToEdit">Edit</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="processQuotationConfirmation">Create PO</button>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig, common } from '@/config'
import { useRoute, useRouter } from 'vue-router'
import { defineAsyncComponent, onBeforeMount, onMounted } from 'vue'
import { useQuotationStore } from '@/stores/quotation'
import { storeToRefs } from 'pinia'
import { useTrackStore } from '@/stores/track'
import { useModalStore } from '@/stores/modal'
const QuotationForm = defineAsyncComponent(() => import('@/components/quotation/QuotationForm.vue'))

const route = useRoute()
const router = useRouter()
const quotationStore = useQuotationStore()
const trackStore = useTrackStore()
const modalStore = useModalStore()

const { quotation } = storeToRefs(quotationStore)

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

const processQuotation = async () => {
  try {
    await quotationStore.processQuotation(route.params.id)
    router.push(menuConfig.purchase_order)
  } catch (error) {
    throw error.data.error || error.data.message
  }
}

const processQuotationConfirmation = () => {
  modalStore.openConfirmationModal('to process this Quotation to Purchase Order ?', `Purchase Order Created with quotation ${route.params.id}`, processQuotation)
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
</style>
