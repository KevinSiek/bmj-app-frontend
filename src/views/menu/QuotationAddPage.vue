<template>
  <div class="contain background shadow">
    <QuotationForm :type="common.form.type.add" :action="addQuotation" />
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="quotationStore.$resetQuotation">Reset Value</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="addQuotationConfirmation">Add Quotation</button>
    </div>
  </div>
</template>

<script setup>
import { common } from '@/config'
import QuotationForm from '@/components/quotation/QuotationForm.vue'
import { useQuotationStore } from '@/stores/quotation'
import { useModalStore } from '@/stores/modal'

const modalStore = useModalStore()
const quotationStore = useQuotationStore()

const addQuotation = () => {
  return quotationStore.addQuotation()
}

const addQuotationConfirmation = () => {
  modalStore.openConfirmationModal('Are you sure to Add this Quotation ?', addQuotation)
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
