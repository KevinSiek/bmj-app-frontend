<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="left">
          <div class="title">Purchase Order</div>
          <div class="input form-group col-12">
            <label for="">No</label><br>
            <input type="text" class="form-control mt-2" v-model="backOrder.purchaseOrder.purchaseOrderNumber"
              placeholder="No" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="date" class="form-control mt-2" v-model="backOrder.purchaseOrder.purchaseOrderDate"
              placeholder="Date" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Order Type</label><br>
            <input type="text" class="form-control mt-2" v-model="backOrder.purchaseOrder.orderType"
              placeholder="Order Type" disabled>
          </div>
        </div>
        <div class="right">
          <div class="title">Delivery Order</div>
          <div class="input form-group col-12">
            <label for="name">No</label><br>
            <input type="text" class="form-control mt-2" v-model="backOrder.deliveryOrder.no" placeholder="No" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="date" class="form-control mt-2" v-model="backOrder.deliveryOrder.date" placeholder="Date"
              disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Ship Mode</label><br>
            <input type="text" class="form-control mt-2" v-model="backOrder.deliveryOrder.shipMode"
              placeholder="Ship Mode" disabled>
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
                placeholder="Company Name" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="backOrder.customer.address" placeholder="Address"
                disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="backOrder.customer.city" placeholder="City"
                    disabled>
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="backOrder.customer.province"
                    placeholder="Province" disabled>
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">NPWP</label><br>
              <input type="text" class="form-control mt-2" v-model="backOrder.customer.npwp" placeholder="NPWP"
                disabled>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="backOrder.customer.office" placeholder="Office"
                disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="backOrder.customer.urban" placeholder="Urban"
                    disabled>
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="backOrder.customer.subdistrict"
                    placeholder="Subdistrict" disabled>
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="backOrder.customer.postalCode"
                placeholder="Postal Code" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Delivery</label><br>
              <input type="text" class="form-control mt-2" v-model="backOrder.customer.delivery" placeholder="Delivery"
                disabled>
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
                <td class="table-col table-part-number">{{ sparepart.sparepartName }} {{ sparepart.sparepartNumber }}
                </td>
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
            v-model="backOrder.notes" disabled></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="right">
      <button type="button" class="btn btn-process" @click="processBackOrderConfirmation"
        :disabled="isProcessing">Ready</button>
    </div>
  </div>
</template>

<script setup>
import { useBackOrderStore } from '@/stores/back-order'
import { useModalStore } from '@/stores/modal'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const backOrderStore = useBackOrderStore()
const modalStore = useModalStore()

const { backOrder } = storeToRefs(backOrderStore)

const isProcessing = ref(false)

onBeforeMount(() => {
  if (!backOrder.value) backOrderStore.$resetBackOrder()
})
onMounted(() => {
  backOrderStore.getBackOrder(route.params.id)
})

const processBackOrder = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await backOrderStore.processBackOrder(route.params.id)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}

const processBackOrderConfirmation = () => {
  modalStore.openConfirmationModal('to process this Back Order ?', 'Back Order Processed', processBackOrder)
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
  justify-content: flex-end;

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
    flex-direction: column;
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
      justify-content: flex-end;
      gap: 10px;
      width: 100%;

      .btn {
        width: calc(50% - 5px);
      }
    }
  }
}
</style>
