<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="title">Project</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">No Proforma Invoice</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.project.proformaInvoiceNumber"
                placeholder="No Proforma Invoice" disabled>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Project Type</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.project.type" placeholder="Type"
                disabled>
            </div>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="title">Customer</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Company Name</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.companyName"
                placeholder="Company Name" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.address"
                placeholder="Address" disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.city"
                    placeholder="City" disabled>
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.province"
                    placeholder="Province" disabled>
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.office"
                placeholder="Office" disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.urban"
                    placeholder="Urban" disabled>
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.subdistrict"
                    placeholder="Subdistrict" disabled>
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.postalCode"
                placeholder="Postal Code" disabled>
            </div>
          </div>
        </div>
      </div>
      <div class="my-2">
        <div class="title">Sparepart</div>
        <div class="table-placeholder">
          <table class="table table-hover">
            <thead>
              <tr class="align-middle">
                <th scope="col-1" class="table-number">NO</th>
                <th scope="col" class="table-name">DESCRIPTION</th>
                <th scope="col" class="table-name">QUANTITY</th>
                <th scope="col" class="table-name">UNIT</th>
                <th scope="col" class="table-name">UNIT PRICE</th>
                <th scope="col" class="table-name">AMOUNT</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-for="(sparepart, index) in proformaInvoice.spareparts" :key="index" class="align-middle">
                <td scope="row" class="table-col table-number">{{ index + 1 }}</td>
                <td class="table-col table-part-number">{{ sparepart.sparepartName }}</td>
                <td class="table-col table-name">{{ sparepart.sparepartNumber }}</td>
                <td class="table-col table-name">{{ sparepart.quantity }}</td>
                <td class="table-col table-name">{{ sparepart.unit }}</td>
                <td class="table-col table-name">{{ sparepart.unitPriceSell }}</td>
                <td class="table-col table-name">{{ sparepart.totalPrice }}</td>
                <td class="table-col table-name">{{ sparepart.stock }}</td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">1</td>
                <td class="table-col table-part-number">Amount</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ proformaInvoice.price.amount }}</td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">2</td>
                <td class="table-col table-name">Less: Discount</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ proformaInvoice.price.discount }}</td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">3</td>
                <td class="table-col table-name">Sub Total (1-2)</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ proformaInvoice.price.subtotal }}</td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">4</td>
                <td class="table-col table-name">Less: Advance Payment</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ proformaInvoice.price.advancePayment }}</td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">5</td>
                <td class="table-col table-name">Total (3-4)</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ proformaInvoice.price.total }}</td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">6</td>
                <td class="table-col table-name">VAT</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ proformaInvoice.price.vat }}</td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">7</td>
                <td class="table-col table-name">TOTAL AMOUNT(5+6)</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ proformaInvoice.price.totalAmount }}</td>
                <td class="table-col table-name"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="proformaInvoice.notes" disabled></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="down-payment background background-dp">
    <div class="title">
      Advance Payment:
    </div>
    <div class="value">
      <input type="text" class="form-control" v-model="proformaInvoice.downPayment" placeholder="Advance Payment">
      %
    </div>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="back">Back</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="updatePiConfirmation" :disabled="isProcessing">Save</button>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import { useModalStore } from '@/stores/modal'
import { useProformaInvoiceStore } from '@/stores/proforma-invoice'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const proformaInvoiceStore = useProformaInvoiceStore()
const modalStore = useModalStore()

const { proformaInvoice } = storeToRefs(proformaInvoiceStore)

const isProcessing = ref(false)

onBeforeMount(() => {
  if (!proformaInvoice.value) proformaInvoiceStore.$resetProformaInvoice()
})
onMounted(() => {
  proformaInvoiceStore.getProformaInvoice(route.params.id)
})

const back = () => {
  router.back()
}

const updatePi = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await proformaInvoiceStore.updateProformaInvoice()
    router.push(`${menuConfig.proforma_invoice.path}/${route.params.id}`)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const updatePiConfirmation = () => {
  modalStore.openConfirmationModal('to Update Proforma Invoice', 'Update PI Success', updatePi)
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.contain {
  padding: 2.5% 5%;
  height: 62vh;

  .title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 1%;
  }

  .input {
    margin: 2% 0%;
  }

  .upper,
  .lower {
    .data {
      display: flex;
      justify-content: space-between;
    }

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
}

.down-payment {
  font-size: 20px;
  height: 8vh;
  padding: 0 4%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .value {
    display: flex;
    align-items: center;
  }
}

.button {
  display: flex;
  margin: 1.5% 4%;
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

@media only screen and (max-width: 767px) {
  .contain {
    padding: 4% 5%;
    height: 66vh;

    .upper,
    .lower {
      flex-direction: column;

      .left,
      .right {
        width: 100%;
      }

      .data {
        flex-direction: column;
      }
    }

    .table-placeholder {
      .table {
        min-width: 800px;
        font-size: 14px;
      }
    }
  }

  .button {
    margin: 4% 6%;
    // flex-direction: column;
    gap: 15px;

    .btn {
      padding: 1.2vh 4vw;
      font-size: 3vw;
      width: 100%;
      margin: 0;
    }

    .left,
    .right {
      gap: 10px;
      width: 100%;

      .btn {
        width: 100%;
      }
    }
  }

  .down-payment {
    font-size: 16px;
    height: auto;
    padding: 3% 4%;
  }
}
</style>
