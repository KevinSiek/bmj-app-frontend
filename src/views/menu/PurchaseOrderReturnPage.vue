<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="add-sparepart">
        <div class="title">List Sparepart</div>
        <div class="form-group col-12 mx-3">
          <div class="row">
            <div class="col-11">
              <div class="row">
                <div class="col-4">
                  <label for="">Sparepart Name</label>
                </div>
                <div class="col-3">
                  <label for="">Part Number</label>
                </div>
                <div class="col-2">
                  <label for="">PO Quantity</label>
                </div>
                <div class="col-3">
                  <label for="">Returned Quantity</label>
                </div>
              </div>
            </div>
            <div class="col-1">
              <div class="button-placeholder"></div>
            </div>
          </div>
        </div>
        <div class="form-group col-12 mx-3">
          <div v-for="(sparepart, sparepartIndex) in listSparepart" :key="sparepartIndex" class="list row">
            <div class="col-11">
              <div class="row">
                <div class="col-4">
                  <input type="text" class="form-control mt-2" v-model="sparepart.sparepartName" placeholder="Part Name"
                    data-bs-toggle="dropdown" aria-expanded="false" disabled>
                </div>
                <div class="col-3">
                  <input type="text" class="form-control mt-2" v-model="sparepart.sparepartNumber"
                    placeholder="Part Number" data-bs-toggle="dropdown" aria-expanded="false" disabled>
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="sparepart.quantity"
                    disabled>
                </div>
                <div class="col-3">
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="sparepart.return">
                </div>
              </div>
            </div>
            <div class="col-1">
              <button type="button" class="btn btn-outline-dark" @click="addSparepart(sparepart)">
                <i class="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="returned-sparepart my-4">
        <div class="title">Returned Sparepart</div>
        <div class="form-group col-12 mx-3">
          <div class="row">
            <div class="col-11">
              <div class="row">
                <div class="col-5">
                  <label for="">Sparepart Name</label>
                </div>
                <div class="col-4">
                  <label for="">Part Number</label>
                </div>
                <div class="col-3">
                  <label for="">Returned Quantity</label>
                </div>
              </div>
            </div>
            <div class="col-1">
              <div class="button-placeholder"></div>
            </div>
          </div>
        </div>
        <div class="form-group col-12 mx-3">
          <div v-for="(sparepart, sparepartIndex) in returnedSparepart" :key="sparepartIndex" class="list row">
            <div class="col-11">
              <div class="row">
                <div class="col-5">
                  <input type="text" class="form-control mt-2" v-model="sparepart.sparepartName" placeholder="Part Name"
                    data-bs-toggle="dropdown" aria-expanded="false" disabled>
                </div>
                <div class="col-4">
                  <input type="text" class="form-control mt-2" v-model="sparepart.sparepartNumber"
                    placeholder="Part Number" data-bs-toggle="dropdown" aria-expanded="false" disabled>
                </div>
                <div class="col-3">
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="sparepart.return"
                    disabled>
                </div>
              </div>
            </div>
            <div class="col-1">
              <button type="button" class="btn btn-outline-danger" @click="removeSparepart(sparepartIndex)"><i
                  class="bi bi-trash3"></i></button>
            </div>
          </div>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="purchaseOrder.notes"></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="left">
    </div>
    <div class="right">
      <button type="button" class="btn btn-process mx-3" @click="setToReturnConfirmation">Return</button>
    </div>
  </div>
</template>

<script setup>
import { usePurchaseOrderStore } from '@/stores/purchase-order'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { common, menuMapping as menuConfig } from '@/config'
import { useRole } from '@/composeable/useRole'
import { useModalStore } from '@/stores/modal'
import { useTrackStore } from '@/stores/track'

const router = useRouter()
const route = useRoute()
const purchaseOrderStore = usePurchaseOrderStore()
const modalStore = useModalStore()
const trackStore = useTrackStore()

const { purchaseOrder } = storeToRefs(purchaseOrderStore)

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

const returnedSparepart = ref([])
const listSparepart = computed(() => {
  return purchaseOrder.value.spareparts.map(sparepart => ({
    id: sparepart.id,  // Add sparepart ID
    sparepartName: sparepart.sparepartName,
    sparepartNumber: sparepart.sparepartNumber,
    quantity: sparepart.quantity,
    return: 0
  }))
})

const addSparepart = (sparepart) => {
  if (returnedSparepart.value.some(item => item.sparepartName === sparepart.sparepartName)) {
    modalStore.openMessageModal(common.modal.failed, 'Sparepart already added to return list')
    return
  }
  if (sparepart.return > sparepart.quantity) {
    modalStore.openMessageModal(common.modal.failed, 'Returned quantity cannot be greater than PO quantity')
    return
  }
  if (sparepart.return <= 0) {
    modalStore.openMessageModal(common.modal.failed, 'Returned quantity must be greater than zero')
    return
  }
  returnedSparepart.value.push({...sparepart})
}
const removeSparepart = (index) => {
  returnedSparepart.value.splice(index, 1)
}

const setToReturn = async () => {
  try {
    // Map to API expected format: { sparepart_id, quantity }
    const returnedItems = returnedSparepart.value.map(item => ({
      sparepart_id: item.id,
      quantity: item.return
    }))

    await purchaseOrderStore.returnPurchaseOrder(route.params.id, returnedItems)
    router.push(menuConfig.purchase_order.path)
    fetchData()
  } catch (error) {
    throw error.data.error || error.data.message
  }
}
const setToReturnConfirmation = () => {
  modalStore.openConfirmationModal('to return Purchase Order ?', 'Purchase Order Returned', setToReturn)
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

    .space {
      min-height: 100px;
    }

    .borderless th,
    .borderless td {
      border: none !important;
    }
  }
}

.list {
  display: flex;
  align-items: flex-end;
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
