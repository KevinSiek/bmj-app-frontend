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
            <input type="text" class="form-control mt-2" v-model="invoice.invoice.date" placeholder="Date" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Term of Payment</label><br>
            <input type="text" class="form-control mt-2" v-model="invoice.invoice.termOfPayment"
              placeholder="Term of Payment" disabled>
          </div>
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
            <input type="text" class="form-control mt-2" v-model="invoice.purchaseOrder.purchaseOrderDate"
              placeholder="Date" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Payment Due</label><br>
            <input type="text" class="form-control mt-2" v-model="invoice.purchaseOrder.paymentDue"
              placeholder="Payment Due" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Discount</label><br>
            <input type="text" class="form-control mt-2" v-model="invoice.purchaseOrder.discount" placeholder="Discount"
              disabled>
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
                <th scope="col" class="table-name">PART NAME</th>
                <th scope="col" class="table-part-number">PART NUMBER</th>
                <th scope="col" class="table-name">QUANTITY</th>
                <th scope="col" class="table-name">UNIT</th>
                <th scope="col" class="table-name">UNIT PRICE</th>
                <th scope="col" class="table-name">TOTAL PRICE</th>
                <th scope="col" class="table-name">STOCK</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-for="(sparepart, index) in invoice.spareparts" :key="index" class="align-middle">
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
                <td class="table-col table-part-number">SubTotal</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ invoice.price.subtotal }}</td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">2</td>
                <td class="table-col table-name">PPN 12%</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ invoice.price.ppn }}</td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">3</td>
                <td class="table-col table-name">Grand Total</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ invoice.price.grandTotal }}</td>
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
      <button type="button" class="btn btn-process" @click="download">Download</button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoice'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onMounted } from 'vue'
import { useTrackStore } from '@/stores/track'
import { createPdf } from '@/utils/invoice'

const route = useRoute()
const router = useRouter()
const invoiceStore = useInvoiceStore()
const trackStore = useTrackStore()

const { invoice } = storeToRefs(invoiceStore)

onBeforeMount(() => {
  if (!invoice.value) invoiceStore.$resetInvoice()
})
onMounted(() => {
  invoiceStore.getInvoice(route.params.id)
  trackStore.setTrackData(invoice)
})

const back = () => {
  router.back()
}
const download = () => {
  createPdf(invoice.value)
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
</style>
