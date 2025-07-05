<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="title">Customer</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Company Name</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.customer.companyName"
                placeholder="Company Name" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.customer.address"
                placeholder="Address" disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="deliveryOrder.customer.city" placeholder="City"
                    disabled>
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="deliveryOrder.customer.province"
                    placeholder="Province" disabled>
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.customer.office" placeholder="Office"
                disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="deliveryOrder.customer.urban"
                    placeholder="Urban" disabled>
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="deliveryOrder.customer.subdistrict"
                    placeholder="Subdistrict" disabled>
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.customer.postalCode"
                placeholder="Postal Code" disabled>
            </div>
          </div>
        </div>
      </div>
      <div class="upper my-2">
        <div class="title">Delivery Order</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">No</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.deliveryOrderNumber"
                placeholder="No" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Date</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.deliveryOrderDate"
                placeholder="Date" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Prepared By</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.preparedBy"
                placeholder="Prepared By" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Received By</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.receivedBy"
                placeholder="Received By" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Picked By</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.pickedBy"
                placeholder="Picked By" disabled>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Ship Mode</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.shipMode"
                placeholder="Ship Mode" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Order Type</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.orderType"
                placeholder="Order Type" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Delivery</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.delivery"
                placeholder="Delivery" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">NPWP</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.npwp" placeholder="NPWP"
                disabled>
            </div>
          </div>
        </div>
      </div>
      <div class="upper my-2">
        <div class="title">Purchase Order</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">No</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.purchaseOrder.purchaseOrderNumber"
                placeholder="No" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Date</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.purchaseOrder.purchaseOrderDate"
                placeholder="Date" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Type</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.purchaseOrder.type" placeholder="Type"
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
                <th scope="col" class="table-name">PART NAME</th>
                <th scope="col" class="table-part-number">PART NUMBER</th>
                <th scope="col" class="table-name">Quantity</th>
                <th scope="col" class="table-name">UNIT</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-for="(sparepart, index) in deliveryOrder.spareparts" :key="index" class="align-middle">
                <td scope="row" class="table-col table-number">{{ index + 1 }}</td>
                <td class="table-col table-part-number">{{ sparepart.sparepartName }}
                </td>
                <td class="table-col table-name"> {{ sparepart.sparepartNumber }}</td>
                <td class="table-col table-name">{{ sparepart.quantity }}</td>
                <td class="table-col table-name">{{ sparepart.unit || 'PCS' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="deliveryOrder.notes" disabled></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="back">Back</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process mx-3" @click="download">Print</button>
      <button v-if="isShowDone" type="button" class="btn btn-process mx-3" @click="setDoneConfirmation">Done</button>
    </div>
  </div>
</template>

<script setup>
import { useRole } from '@/composeable/useRole'
import { common, menuMapping as menuConfig } from '@/config'
import { useDeliveryOrderStore } from '@/stores/delivery-order'
import { useModalStore } from '@/stores/modal'
import { useTrackStore } from '@/stores/track'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createPdf } from '@/utils/pdf/delivery-note'

const route = useRoute()
const router = useRouter()
const deliveryOrderStore = useDeliveryOrderStore()
const trackStore = useTrackStore()
const modalStore = useModalStore()

const { deliveryOrder } = storeToRefs(deliveryOrderStore)
const { isRoleDirector, isRoleInventory, isRoleService } = useRole()

const isShowDone = computed(() =>
  (isRoleInventory.value || isRoleService.value || isRoleDirector.value) &&
  deliveryOrder.value.currentStatus !== common.status.work_order.done
  // !workOrder.value.status.some(item => item.state === common.status.work_order.done)
)

onBeforeMount(() => {
  if (!deliveryOrder.value) deliveryOrderStore.$resetDeliveryOrder()
})
onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  await deliveryOrderStore.getDeliveryOrder(route.params.id)
  await trackStore.setTrackData(deliveryOrder)
}

const done = async () => {
  try {
    await deliveryOrderStore.process(route.params.id)
    await fetchData()
  } catch (error) {
    throw error.data.error || error.data.message
  }
}
const setDoneConfirmation = () => {
  modalStore.openConfirmationModal('to this Puchase Order is Done ?', 'Purchase Order Done', done)
}
const download = () => {
  createPdf(deliveryOrder.value)
}
const back = () => {
  router.push(menuConfig.delivery_order.path)
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

    .list {
      display: flex;
      align-items: flex-end;
    }

    .add-btn {
      display: flex;
      justify-content: center;
    }
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
