<template>
  <div class="general-page">
    <form @submit.prevent="action()" class="form">
      <div class="currency-converter background">
        <div class="input form-group col-12">
          <label for="">Currency Converter</label>
          <input type="text" class="form-control mt-2" v-model="currencyConverter" placeholder="Currecy Converter">
          <div class="description mt-2">
            <span>*This is currency converter for all of the sparepart</span>
          </div>
        </div>
      </div>
      <div class="discount background">
        <div class="input form-group col-12">
          <label for="">Discount</label>
          <div class="value mt-2">
            <input type="text" class="form-control" v-model="discount" placeholder="Discount">
            <div>%</div>
          </div>
          <div class="description mt-2">
            <span>*This is discount rate for all of the sparepart</span>
          </div>
        </div>
      </div>
      <div class="ppn background">
        <div class="input form-group col-12">
          <label for="">VAT</label>
          <div class="value mt-2">
            <input type="text" class="form-control" v-model="vat" placeholder="VAT">
            <span>%</span>
          </div>
          <div class="description mt-2">
            <span>*This is VAT rate for all of the sparepart</span>
          </div>
        </div>
      </div>
    </form>
    <div class="button">
      <button type="submit" class="btn btn-update" @click="updateGeneralDataConfirmation">
        Update Data
      </button>
    </div>
  </div>
</template>

<script setup>
import { useGeneralStore } from '@/stores/general'
import { useModalStore } from '@/stores/modal';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

const generalStore = useGeneralStore()
const modalStore = useModalStore()

const { discount, currencyConverter, vat } = storeToRefs(generalStore)

onMounted(() => {
  generalStore.getGeneralData()
})

const updateGeneralData = async () => {
  try {
    await generalStore.updateGeneralData()
  } catch (error) {
    throw error.data.error || error.data.message
  }
}

const updateGeneralDataConfirmation = () => {
  modalStore.openConfirmationModal('to Update this General Data ?', 'Update General Data Success', updateGeneralData)
}
</script>

<style lang="scss" scoped>
$primary-color: black;

.general-page {
  height: 84vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.background {
  margin: 2% 4%;
  padding: 2%;
  border-radius: 20px;
  background-color: white;

  .input {
    display: flex;
    flex-direction: column;
    width: 50%;

    .value {
      display: flex;
      align-items: center;
      justify-content: space-between;

      input {
        width: 95%
      }
    }
  }
}


.button {
  margin: 2% 4%;
  display: flex;
  justify-content: end;

  .btn {
    padding: 1.5vh 2vw 1.5vh 2vw;
    font-weight: 500;
    color: white;
    font-size: 1.1vw;
    letter-spacing: 0.03vw;
  }

  .btn-update {
    background-color: $primary-color;
  }
}
</style>
