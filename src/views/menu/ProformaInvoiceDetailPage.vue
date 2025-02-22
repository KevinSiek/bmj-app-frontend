<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="title">Project</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">No Proforma Invoice</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.project.noProformaInvoice"
                placeholder="No Proforma Invoice">
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Project Type</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.project.type" placeholder="Type">
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
                placeholder="Company Name">
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.address"
                placeholder="Address">
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.city"
                    placeholder="City">
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.province"
                    placeholder="Province">
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.office"
                placeholder="Office">
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.urban"
                    placeholder="Urban">
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.subdistrict"
                    placeholder="Subdistrict">
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="proformaInvoice.customer.postalCode"
                placeholder="Postal Code">
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
                <td class="table-col table-part-number">{{ sparepart.partName }}</td>
                <td class="table-col table-name">{{ sparepart.partNumber }}</td>
                <td class="table-col table-name">{{ sparepart.quantity }}</td>
                <td class="table-col table-name">{{ sparepart.unit }}</td>
                <td class="table-col table-name">{{ sparepart.unitPrice }}</td>
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
            v-model="proformaInvoice.notes"></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="down-payment background background-dp">
    <div class="title">
      Advance Payment:
    </div>
    <div class="value">
      {{ proformaInvoice.downPayment }}
    </div>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit">Edit</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process">Process</button>
    </div>
  </div>
</template>

<script setup>
import { useProformaInvoiceStore } from '@/stores/proforma-invoice'
import { storeToRefs } from 'pinia'

const proformaInvoiceStore = useProformaInvoiceStore()

const { proformaInvoice } = storeToRefs(proformaInvoiceStore)

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
</style>
