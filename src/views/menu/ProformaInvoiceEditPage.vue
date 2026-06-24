<template>
  <div class="contain background shadow">
    <form class="row form" autocomplete="off">
      <div class="upper my-2">
        <div class="title">Project</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">No Proforma Invoice</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.project.proformaInvoiceNumber"
                placeholder="No Proforma Invoice" disabled autocomplete="off">
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Project Type</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.project.type" placeholder="Type"
                disabled autocomplete="off">
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
                placeholder="Company Name" disabled autocomplete="off">
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.address"
                placeholder="Address" disabled autocomplete="off">
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.city"
                    placeholder="City" disabled autocomplete="off">
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.province"
                    placeholder="Province" disabled autocomplete="off">
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.office"
                placeholder="Office" disabled autocomplete="off">
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.urban"
                    placeholder="Urban" disabled autocomplete="off">
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.subdistrict"
                    placeholder="Subdistrict" disabled autocomplete="off">
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.postalCode"
                placeholder="Postal Code" disabled autocomplete="off">
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
                <td class="table-col table-name"><PriceDisplay :value="sparepart.unitPriceSell" /></td>
                <td class="table-col table-name"><PriceDisplay :value="sparepart.totalPrice" /></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">1</td>
                <td class="table-col table-part-number">Amount</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"><PriceDisplay :value="proformaInvoice.price.amount" /></td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">2</td>
                <td class="table-col table-name">Less: Discount</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"><PriceDisplay :value="proformaInvoice.price.discount" /></td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">3</td>
                <td class="table-col table-name">Sub Total (1-2)</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"><PriceDisplay :value="proformaInvoice.price.subtotal" /></td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">4</td>
                <td class="table-col table-name">Less: Advance Payment</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"><PriceDisplay :value="proformaInvoice.price.advancePayment" /></td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">5</td>
                <td class="table-col table-name">Total (3-4)</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"><PriceDisplay :value="proformaInvoice.price.total" /></td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">6</td>
                <td class="table-col table-name">VAT</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"><PriceDisplay :value="proformaInvoice.price.ppn" /></td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">7</td>
                <td class="table-col table-name">TOTAL AMOUNT(5+6)</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"><PriceDisplay :value="proformaInvoice.price.totalAmount" /></td>
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
            v-model="proformaInvoice.notes" disabled autocomplete="off"></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="down-payment background background-dp">
    <div class="title">
      Advance Payment:
    </div>
    <div class="value flex-column align-items-end">
      <div class="d-flex align-items-center">
        <input type="text" class="form-control" :class="{ 'is-invalid': errors.downPayment }" v-model="proformaInvoice.downPayment" placeholder="Advance Payment" autocomplete="off">
        <span class="ms-1">%</span>
      </div>
      <div class="invalid-feedback d-block text-end mt-1" v-if="errors.downPayment">{{ errors.downPayment }}</div>
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
import { onBeforeMount, onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatCurrency } from '@/utils/form-util'
import PriceDisplay from '@/components/PriceDisplay.vue'

const route = useRoute()
const router = useRouter()
const proformaInvoiceStore = useProformaInvoiceStore()
const modalStore = useModalStore()

const { proformaInvoice } = storeToRefs(proformaInvoiceStore)

const isProcessing = ref(false)

const errors = computed(() => {
  const errs = {}
  if (!proformaInvoiceStore.isDirty) return errs
  const pi = proformaInvoice.value
  if (!pi) return errs

  const dp = Number(pi.downPayment)
  if (pi.downPayment === '' || pi.downPayment === null || pi.downPayment === undefined) {
    errs.downPayment = 'Advance Payment is required.'
  } else if (isNaN(dp)) {
    errs.downPayment = 'Advance Payment must be a number.'
  } else if (dp < 0 || dp > 100) {
    errs.downPayment = 'Advance Payment must be between 0 and 100.'
  }
  return errs
})

watch(
  () => proformaInvoice.value,
  (newVal, oldVal) => {
    if (newVal !== null && oldVal !== null) {
      proformaInvoiceStore.isDirty = true
    }
  },
  { deep: true }
)

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
  proformaInvoiceStore.isDirty = true
  if (Object.keys(errors.value).length > 0) {
    return
  }
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
