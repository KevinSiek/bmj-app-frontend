<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="title">Customer</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Company Name</label><br>
              <input type="text" class="form-control mt-2" v-model="invoice.customer.companyName"
                placeholder="Company Name" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="invoice.customer.address" placeholder="Address"
                disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="invoice.customer.city" placeholder="City"
                    disabled>
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="invoice.customer.province"
                    placeholder="Province" disabled>
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="invoice.customer.office" placeholder="Office"
                disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="invoice.customer.urban" placeholder="Urban"
                    disabled>
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="invoice.customer.subdistrict"
                    placeholder="Subdistrict" disabled>
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="invoice.customer.postalCode"
                placeholder="Postal Code" disabled>
            </div>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="left">
          <div class="title">Invoice</div>
          <div class="input form-group col-12">
            <label for="">No</label><br>
            <input type="text" class="form-control mt-2" v-model="invoice.invoice.invoiceNumber" placeholder="No"
              disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="date" class="form-control mt-2" v-model="invoice.invoice.date" placeholder="Date" disabled>
          </div>
          <!-- <div class="input form-group col-12">
            <label for="">Term of Payment</label><br>
            <input type="text" class="form-control mt-2" v-model="invoice.invoice.termOfPayment"
              placeholder="Term of Payment" disabled>
          </div> -->
          <div class="input form-group col-12">
            <label for="">Sub Total</label><br>
            <input type="text" class="form-control mt-2" v-model="invoice.invoice.subTotal" placeholder="Sub Total"
              disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Grand Total</label><br>
            <input type="text" class="form-control mt-2" v-model="invoice.invoice.grandTotal" placeholder="Grand Total"
              disabled>
          </div>
        </div>
        <div class="right">
          <div class="title">Purchase Order</div>
          <div class="input form-group col-12">
            <label for="name">No</label><br>
            <input type="text" class="form-control mt-2" v-model="invoice.purchaseOrder.purchaseOrderNumber"
              placeholder="No" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="date" class="form-control mt-2" v-model="invoice.purchaseOrder.purchaseOrderDate"
              placeholder="Date" disabled>
          </div>
          <!-- <div class="input form-group col-12">
            <label for="">Payment Due</label><br>
            <input type="text" class="form-control mt-2" v-model="invoice.purchaseOrder.paymentDue"
              placeholder="Payment Due" disabled>
          </div> -->
          <div class="input form-group col-12">
            <label for="">Discount</label><br>
            <input type="text" class="form-control mt-2" v-model="invoice.purchaseOrder.discount" placeholder="Discount"
              disabled>
          </div>
        </div>
      </div>
      <div class="my-2">
        <div class="title">{{ invoice.purchaseOrder.purchaseOrderType }}</div>
        <div class="table-placeholder">
          <table class="table table-hover">
            <thead>
              <tr class="align-middle" v-if="invoice.purchaseOrder.purchaseOrderType === 'Spareparts'">
                <th scope="col-1" class="table-number">NO</th>
                <th scope="col" class="table-name">PART NAME</th>
                <th scope="col" class="table-part-number">PART NUMBER</th>
                <th scope="col" class="table-name">QUANTITY</th>
                <th scope="col" class="table-name">UNIT</th>
                <th scope="col" class="table-name">UNIT PRICE</th>
                <th scope="col" class="table-name">TOTAL PRICE</th>
              </tr>
              <tr class="align-middle" v-else>
                <th scope="col-1" class="table-number">NO</th>
                <th scope="col" class="table-name">SERVICE</th>
                <th scope="col" class="table-name">QUANTITY</th>
                <th scope="col" class="table-name">UNIT PRICE</th>
                <th scope="col" class="table-name">TOTAL PRICE</th>
              </tr>
            </thead>
            <tbody class="table-group-divider" v-if="invoice.purchaseOrder.purchaseOrderType === 'Spareparts'">
              <tr v-for="(sparepart, index) in invoice.spareparts" :key="index" class="align-middle">
                <td scope="row" class="table-col table-number">{{ index + 1 }}</td>
                <td class="table-col table-part-number">{{ sparepart.sparepartName }}</td>
                <td class="table-col table-name">{{ sparepart.sparepartNumber }}</td>
                <td class="table-col table-name">{{ sparepart.quantity }}</td>
                <td class="table-col table-name">{{ sparepart.unit || 'pcs' }}</td>
                <td class="table-col table-name">{{ formatCurrency(sparepart.unitPriceSell) }}</td>
                <td class="table-col table-name">{{ formatCurrency(sparepart.totalPrice) }}</td>
                <td class="table-col table-name">{{ sparepart.stock }}</td>
              </tr>
            </tbody>
            <tbody class="table-group-divider" v-else>
              <tr v-for="(service, index) in invoice.services" :key="index" class="align-middle">
                <td scope="row" class="table-col table-number">{{ index + 1 }}</td>
                <td class="table-col table-name">{{ service.service }}</td>
                <td class="table-col table-name">{{ service.quantity }}</td>
                <td class="table-col table-name">{{ formatCurrency(service.unitPriceSell) }}</td>
                <td class="table-col table-name">{{ formatCurrency(service.totalPrice) }}</td>
              </tr>
            </tbody>
            <tbody>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">1</td>
                <td class="table-col table-part-number">SubTotal</td>
                <td class="table-col table-name"></td>
                <td v-if="invoice.purchaseOrder.purchaseOrderType === 'Spareparts'" class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td v-if="invoice.purchaseOrder.purchaseOrderType === 'Spareparts'" class="table-col table-name"></td>
                <td class="table-col table-name">{{ formatCurrency(invoice.price.subtotal) }}</td>
                <td v-if="invoice.purchaseOrder.purchaseOrderType === 'Spareparts'" class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">2</td>
                <td class="table-col table-name">PPN 12%</td>
                <td class="table-col table-name"></td>
                <td v-if="invoice.purchaseOrder.purchaseOrderType === 'Spareparts'" class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td v-if="invoice.purchaseOrder.purchaseOrderType === 'Spareparts'" class="table-col table-name"></td>
                <td class="table-col table-name">{{ formatCurrency(invoice.price.ppn) }}</td>
                <td v-if="invoice.purchaseOrder.purchaseOrderType === 'Spareparts'" class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">3</td>
                <td class="table-col table-name">Grand Total</td>
                <td class="table-col table-name"></td>
                <td v-if="invoice.purchaseOrder.purchaseOrderType === 'Spareparts'" class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td v-if="invoice.purchaseOrder.purchaseOrderType === 'Spareparts'" class="table-col table-name"></td>
                <td class="table-col table-name">{{ formatCurrency(invoice.price.grandTotal) }}</td>
                <td v-if="invoice.purchaseOrder.purchaseOrderType === 'Spareparts'" class="table-col table-name"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="invoice.notes" disabled></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="back">Back</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="openDownloadModal">Download</button>
    </div>
  </div>
  <transition name="fade">
    <div v-if="isShowDownloadModal" class="modal fade show" style="display: block;" id="downloadModal" tabindex="-1"
      aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Download Invoice</h5>
          </div>
          <div class="modal-body">
            <div class="input form-group col-12 my-2">
              <label for="">Term of Payment</label><br>
              <input type="text" class="form-control mt-2" v-model="termOfPayment" placeholder="Term of Payment">
            </div>
            <div class="input form-group col-12 my-2">
              <label for="">Payment Due</label><br>
              <input type="text" class="form-control mt-2" v-model="paymentDue" placeholder="Payment Due">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
              @click="closeDownloadModal">Close</button>
            <button type="button" class="btn btn-dark" data-bs-dismiss="modal" @click="download">Download</button>
          </div>
        </div>
      </div>
      <!-- <div class="modal-backdrop fade show" @click.self="closeDeleteModal"></div> -->
    </div>
  </transition>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoice'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useTrackStore } from '@/stores/track'
import { createPdf } from '@/utils/pdf/invoice'
import { formatCurrency } from '@/utils/form-util'

const route = useRoute()
const router = useRouter()
const invoiceStore = useInvoiceStore()
const trackStore = useTrackStore()

const { invoice } = storeToRefs(invoiceStore)

const isShowDownloadModal = ref(false)
const termOfPayment = ref('')
const paymentDue = ref('')

onBeforeMount(() => {
  if (!invoice.value) invoiceStore.$resetInvoice()
})
onMounted(() => {
  invoiceStore.getInvoice(route.params.id)
  trackStore.setTrackData(invoice.value.status)
})

const openDownloadModal = () => {
  isShowDownloadModal.value = true
}
const closeDownloadModal = () => {
  isShowDownloadModal.value = false
}

const back = () => {
  router.back()
}
const download = () => {
  createPdf({ termOfPayment: termOfPayment.value, paymentDue: paymentDue.value, ...invoice.value })
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.contain {
  padding: 2.5% 5%;
  height: 72vh;

  .title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 1%;
  }

  .input {
    margin: 2% 0%;
  }

  .upper {
    .data {
      display: flex;
      justify-content: space-between;
    }

    .left,
    .right {
      width: 48%;
    }
  }

  .lower {
    display: flex;
    justify-content: space-between;

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

@media only screen and (max-width: 767px) {
  .contain {
    padding: 4% 5%;
    height: 78vh;

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
    gap: 15px;

    .btn {
      padding: 1.2vh 4vw;
      font-size: 3vw;
      width: 100%;
      margin: 0;
    }

    .left,
    .right {
      display: flex;
      flex-direction: row;
      gap: 10px;
      width: 100%;
    }
  }

  .down-payment {
    font-size: 16px;
    height: auto;
    padding: 3% 4%;
  }
}
</style>
