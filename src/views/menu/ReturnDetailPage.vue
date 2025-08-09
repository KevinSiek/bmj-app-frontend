<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="left">
          TESTING
          <div class="title">Purchase Order</div>
          <div class="input form-group col-12">
            <label for="">No</label><br>
            <input type="text" class="form-control mt-2" v-model="purchaseOrder.purchaseOrder.purchaseOrderNumber"
              placeholder="No" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="date" class="form-control mt-2" v-model="purchaseOrder.purchaseOrder.purchaseOrderDate"
              placeholder="Date" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Project Type</label><br>
            <input type="text" class="form-control mt-2" v-model="purchaseOrder.purchaseOrder.type"
              placeholder="Project Type" disabled>
          </div>
        </div>
        <div class="right">
          <div class="title">Proforma Invoice</div>
          <div class="input form-group col-12">
            <label for="name">No</label><br>
            <input type="text" class="form-control mt-2" v-model="purchaseOrder.proformaInvoice.proformaInvoiceNumber"
              placeholder="No" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="date" class="form-control mt-2" v-model="purchaseOrder.proformaInvoice.proformaInvoiceDate"
              placeholder="Date" disabled>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="title">Customer</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Company Name</label><br>
              <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.companyName"
                placeholder="Company Name" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.address"
                placeholder="Address" disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.city" placeholder="City"
                    disabled>
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.province"
                    placeholder="Province" disabled>
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.office" placeholder="Office"
                disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.urban"
                    placeholder="Urban" disabled>
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.subdistrict"
                    placeholder="Subdistrict" disabled>
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.postalCode"
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
                <th scope="col" class="table-name">PART NUMBER</th>
                <th scope="col" class="table-name">QUANTITY</th>
                <th scope="col" class="table-name">UNIT</th>
                <th scope="col" class="table-name">UNIT PRICE</th>
                <th scope="col" class="table-name">AMOUNT</th>
                <th scope="col" class="table-name">STATUS</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-for="(sparepart, index) in purchaseOrder.spareparts" :key="index" class="align-middle borderless">
                <td scope="row" class="table-col table-number">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ index + 1 }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.sparepartName }}
                  </div>
                </td>
                <td class="table-col table-part-number">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.sparepartNumber }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.quantity }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.unit || 'pcs' }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.unitPriceSell }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.totalPrice }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.stock }}
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody>
              <tr class="align-middle">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
            <tbody>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">1</td>
                <td class="table-col table-part-number">Amount</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ purchaseOrder.price.amount }}</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">2</td>
                <td class="table-col table-name">Less: Discount</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ purchaseOrder.price.discount }}</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">3</td>
                <td class="table-col table-name">Sub Total (1-2)</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ purchaseOrder.price.subtotal }}</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">4</td>
                <td class="table-col table-name">Less: Advance Payment</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ purchaseOrder.price.advancePayment }}</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">5</td>
                <td class="table-col table-name">Total (3-4)</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ purchaseOrder.price.total }}</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">6</td>
                <td class="table-col table-name">VAT</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ purchaseOrder.price.vat }}</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">7</td>
                <td class="table-col table-name">TOTAL AMOUNT(5+6)</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ purchaseOrder.price.totalAmount }}</td>
                <td class="table-col table-name"></td>
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
            v-model="purchaseOrder.notes" disabled></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="down-payment background background-dp">
    <div class="title">
      Advance Payment:
    </div>
    <div class="value">
      {{ purchaseOrder.downPayment }} %
    </div>
  </div>
  <div class="button">
    <div class="right">
      <button type="button" class="btn btn-danger" @click="rejectConfirmation" :disabled="isProcessing">Reject</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-success" @click="approveConfirmation"
        :disabled="isProcessing">Approve</button>
    </div>
  </div>
</template>

<script setup>
import { usePurchaseOrderStore } from '@/stores/purchase-order'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { menuMapping as menuConfig } from '@/config'
import { useModalStore } from '@/stores/modal'
import { useTrackStore } from '@/stores/track'

const router = useRouter()
const route = useRoute()
const purchaseOrderStore = usePurchaseOrderStore()
const modalStore = useModalStore()
const trackStore = useTrackStore()

const { purchaseOrder } = storeToRefs(purchaseOrderStore)

const isProcessing = ref(false)

const fetchData = async () => {
  await purchaseOrderStore.getPurchaseOrder(route.params.id)
  await trackStore.setTrackData(purchaseOrder.value.status)
}
onBeforeMount(() => {
  if (!purchaseOrder.value) purchaseOrderStore.$resetPurchaseOrder()
})
onMounted(async () => {
  await fetchData()
})

const reject = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await purchaseOrderStore.rejectReturn(route.params.id)
    router.push(menuConfig.return.path)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const rejectConfirmation = () => {
  modalStore.openConfirmationModal('reject this return ?', 'Return has been Rejected', reject)
}
const approve = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await purchaseOrderStore.approveReturn(route.params.id)
    router.push(menuConfig.return.path)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const approveConfirmation = () => {
  modalStore.openConfirmationModal('approve this return ?', 'Return has been Approved', approve)
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

  .upper {
    display: flex;
    justify-content: space-between;

    .left,
    .right {
      width: 48%;
    }
  }

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

    .space {
      min-height: 100px;
    }

    .borderless th,
    .borderless td {
      border: none !important;
    }
  }
}

.down-payment {
  font-size: 20px;
  height: 8vh;
  padding: 0 4%;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
