<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="title">Delivery Order</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Date</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.deliveryOrderDate"
                placeholder="No">
            </div>
            <div class="input form-group col-12">
              <label for="">Received by</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.receivedBy"
                placeholder="Received by">
            </div>
            <div class="input form-group col-12">
              <label for="">Picked by</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.pickedBy"
                placeholder="Received by">
            </div>
            <div class="input form-group col-12">
              <label for="">Prepared by</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.preparedBy"
                placeholder="Prepared by">
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Ship Mode</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.shipMode"
                placeholder="Ship Mode">
            </div>
            <div class="input form-group col-12">
              <label for="">Order Type</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.orderType"
                placeholder="Order Type">
            </div>
            <div class="input form-group col-12">
              <label for="">Delivery</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.delivery"
                placeholder="Delivery">
            </div>
            <div class="input form-group col-12">
              <label for="">NPWP</label><br>
              <input type="text" class="form-control mt-2" v-model="deliveryOrder.deliveryOrder.npwp"
                placeholder="NPWP">
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="back">Back</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="doReleaseConfirmation"
        :disabled="isProcessing">Release</button>
    </div>
  </div>
</template>

<script setup>
import { useModalStore } from '@/stores/modal'
import { usePurchaseOrderStore } from '@/stores/purchase-order'
import { useDeliveryOrderStore } from '@/stores/delivery-order'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { menuMapping as menuConfig } from '@/config'

const route = useRoute()
const router = useRouter()
const deliveryOrderStore = useDeliveryOrderStore()
const purchaseOrderStore = usePurchaseOrderStore()
const modalStore = useModalStore()

const { deliveryOrder } = storeToRefs(deliveryOrderStore)
const { purchaseOrder } = storeToRefs(purchaseOrderStore)

const isProcessing = ref(false)

onBeforeMount(() => {
  if (!deliveryOrder.value) deliveryOrderStore.$resetDeliveryOrder()
})

const doRelease = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await purchaseOrderStore.release(route.params.id, deliveryOrder.value)
    router.push(menuConfig.delivery_order.path)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const doReleaseConfirmation = () => {
  modalStore.openConfirmationModal('to release this Purchase Order?', 'Releasing', doRelease)
}

const back = () => {
  router.push(menuConfig.work_order.path)
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
    .input {
      margin: 0.5% 0%;
    }

    .data {
      display: flex;
      flex-direction: column;
    }

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
