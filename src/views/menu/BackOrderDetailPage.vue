<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="left">
          <div class="title">Purchase Order</div>
          <div class="input form-group col-12">
            <label for="">No</label><br>
            <input type="text" class="form-control mt-2" v-model="backOrder.purchaseOrder.no" placeholder="No">
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="text" class="form-control mt-2" v-model="backOrder.purchaseOrder.date" placeholder="Date">
          </div>
          <div class="input form-group col-12">
            <label for="">Order Type</label><br>
            <input type="text" class="form-control mt-2" v-model="backOrder.purchaseOrder.orderType"
              placeholder="Order Type">
          </div>
        </div>
        <div class="right">
          <div class="title">Delivery Order</div>
          <div class="input form-group col-12">
            <label for="name">No</label><br>
            <input type="text" class="form-control mt-2" v-model="backOrder.deliveryOrder.no" placeholder="No">
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="text" class="form-control mt-2" v-model="backOrder.deliveryOrder.date" placeholder="Date">
          </div>
          <div class="input form-group col-12">
            <label for="">Ship Mode</label><br>
            <input type="text" class="form-control mt-2" v-model="backOrder.deliveryOrder.shipMode"
              placeholder="Ship Mode">
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="title">Customer</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Company Name</label><br>
              <input type="text" class="form-control mt-2" v-model="backOrder.customer.companyName"
                placeholder="Company Name">
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="backOrder.customer.address" placeholder="Address">
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="backOrder.customer.city" placeholder="City">
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="backOrder.customer.province"
                    placeholder="Province">
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">NPWP</label><br>
              <input type="text" class="form-control mt-2" v-model="backOrder.customer.npwp" placeholder="NPWP">
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="backOrder.customer.office" placeholder="Office">
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="backOrder.customer.urban" placeholder="Urban">
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="backOrder.customer.subdistrict"
                    placeholder="Subdistrict">
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="backOrder.customer.postalCode"
                placeholder="Postal Code">
            </div>
            <div class="input form-group col-12">
              <label for="">Delivery</label><br>
              <input type="text" class="form-control mt-2" v-model="backOrder.customer.delivery" placeholder="Delivery">
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
                <th scope="col" class="table-part-number">Order</th>
                <th scope="col" class="table-name">Delivery Order</th>
                <th scope="col" class="table-name">Back Order</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-for="(sparepart, index) in backOrder.spareparts" :key="index" class="align-middle">
                <td scope="row" class="table-col table-number">{{ index + 1 }}</td>
                <td class="table-col table-part-number">{{ sparepart.partName }} {{ sparepart.partNumber }}</td>
                <td class="table-col table-name">{{ sparepart.order }}</td>
                <td class="table-col table-name">{{ sparepart.deliveryOrder }}</td>
                <td class="table-col table-name">{{ sparepart.backOrder }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="backOrder.notes"></textarea>
        </div>
      </div>
    </form>
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
import { useBackOrderStore } from '@/stores/back-order'
import { storeToRefs } from 'pinia'

const backOrderStore = useBackOrderStore()

const { backOrder } = storeToRefs(backOrderStore)

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
