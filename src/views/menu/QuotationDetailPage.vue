<template>
  <div class="contain background shadow">
    <QuotationForm :type="common.form.type.view" />
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="goToEdit">Edit</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="process">Process</button>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig, common } from '@/config'
import QuotationForm from '@/components/quotation/QuotationForm.vue'
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useQuotationStore } from '@/stores/quotation'

const route = useRoute()
const router = useRouter()
const quotationStore = useQuotationStore()

onMounted(() => {
  quotationStore.getQuotation(route.params.id)
})

const goToEdit = () => {
  router.push(menuConfig.quotation_edit.path)
}
const process = () => {
  quotationStore.processQuotation(route.params.id)
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
