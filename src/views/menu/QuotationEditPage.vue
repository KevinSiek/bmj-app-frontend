<template>
  <div class="contain background shadow">
    <QuotationForm :type="common.form.type.edit" :action="editQuotation" />
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="back">Back</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="editQuotationConfirmation">Edit Quotation</button>
    </div>
  </div>
</template>

<script setup>
import { common } from '@/config'
import { useRouter } from 'vue-router'
import QuotationForm from '@/components/quotation/QuotationForm.vue'
import { useQuotationStore } from '@/stores/quotation'
import { useModalStore } from '@/stores/modal'

const router = useRouter()
const modalStore = useModalStore()
const quotationStore = useQuotationStore()

const editQuotation = async () => {
  await quotationStore.editQuotation()
}

const editQuotationConfirmation = () => {
  modalStore.openConfirmationModal('You want to Edit this Quotation', 'Edit Quotation Success', editQuotation)
}

const back = () => {
  router.back()
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

@media only screen and (max-width: 769px) {
  /* For mobile phones: */
}

@media only screen and (max-width: 767px) {}
</style>
