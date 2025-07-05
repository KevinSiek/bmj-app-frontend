<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="left">
          <div class="title">Service Order</div>
          <div class="input form-group col-12">
            <label for="">Received by</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.serviceOrder.receivedBy"
              placeholder="Received by">
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">Expected Start Date</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.serviceOrder.startDate"
                  placeholder="Expected Start Date">
              </div>
              <div class="col-6">
                <label for="">Expected End Date</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.serviceOrder.endDate"
                  placeholder="Expected End Date">
              </div>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="title">Work Description</div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-11">
                <div class="row">
                  <div class="col-4">
                    <label for="">Job Desc</label>
                  </div>
                  <div class="col-5">
                    <label for="">Unit Type</label>
                  </div>
                  <div class="col-3">
                    <label for="">Quantity</label>
                  </div>
                </div>
              </div>
              <div class="col-1">
                <div class="button-placeholder"></div>
              </div>
            </div>
          </div>
          <div class="input form-group col-12">
            <div v-for="(unit, unitIndex) in workOrder.units" :key="unitIndex" class="list row">
              <div class="col-11">
                <div class="row">
                  <div class="col-4">
                    <input type="text" class="form-control mt-2" placeholder="Job Desc" v-model="unit.jobDescriptions">
                  </div>
                  <div class="col-5">
                    <input type="text" class="form-control mt-2" placeholder="Unit Type" v-model="unit.unitType">
                  </div>
                  <div class="col-3">
                    <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="unit.quantity">
                  </div>
                </div>
              </div>
              <div class="col-1">
                <button type="button" class="btn btn-outline-danger" @click="removeUnit(unitIndex)"><i
                    class="bi bi-trash3"></i></button>
              </div>
            </div>
            <div class="add-btn mt-3">
              <button type="button" class="btn btn-outline-dark" @click="addUnit">
                <i class="bi bi-plus-lg"></i>
                <span class="mx-2">Add Unit</span>
              </button>
            </div>
          </div>
          <div class="input form-group col-12 mt-4">
            <label for="">Compiled By (Admin CSO)</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.poc.compiled" placeholder="Compiled by">
          </div>
          <div class="input form-group col-12">
            <label for="">Authorized by</label><br>
            <div class="row px-3">
              <div class="col-6">
                <label for="">Dept Head Service</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.poc.headOfService"
                  placeholder="Dept Head Service">
              </div>
              <div class="col-6">
                <label for="">Director</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.poc.director" placeholder="Director">
              </div>
            </div>
          </div>
          <div class="input form-group col-12">
            <label for="">Date Completed</label><br>
            <div class="row px-3">
              <div class="col-6">
                <label for="">Start Date</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.date.startDate"
                  placeholder="Start Date">
              </div>
              <div class="col-6">
                <label for="">End Date</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.date.endDate" placeholder="End Date">
              </div>
            </div>
          </div>
          <div class="input form-group col-12">
            <label for="">Work Performed by</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.poc.worker" placeholder="Work Performed by">
          </div>
          <div class="input form-group col-12">
            <label for="">Approved by</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.poc.approver" placeholder="Approved by">
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="title">Additional Comments</div>
        <div class="data">
          <div class="input form-group col-12">
            <label for="">List sparepart replaced</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.additional.spareparts"
              placeholder="List sparepart replaced">
          </div>
          <div class="input form-group col-12">
            <label for="">List backup sparepart</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.additional.backupSparepart"
              placeholder="List backup sparepart">
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">Scope of Work</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.additional.scope"
                  placeholder="Scope of Work">
              </div>
              <div class="col-6">
                <label for="">APD</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.additional.apd" placeholder="APD">
              </div>
            </div>
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">Vaccine</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.additional.vaccine"
                  placeholder="Vaccine">
              </div>
              <div class="col-6">
                <label for="">Peduli Lindungi</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.additional.peduliLindungi"
                  placeholder="Peduli Lindungi">
              </div>
            </div>
          </div>
          <div class="input form-group col-12">
            <label for="">Execution Time</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.additional.executionTime"
              placeholder="Execution Time">
          </div>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="workOrder.description"></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="back">Back</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="doReleaseConfirmation">Release</button>
    </div>
  </div>
</template>

<script setup>
import { useModalStore } from '@/stores/modal'
import { usePurchaseOrderStore } from '@/stores/purchase-order'
import { useWorkOrderStore } from '@/stores/work-order'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { common, menuMapping as menuConfig } from '@/config'
import { useEmployeeStore } from '@/stores/employee'

const route = useRoute()
const router = useRouter()
const workOrderStore = useWorkOrderStore()
const purchaseOrderStore = usePurchaseOrderStore()
const modalStore = useModalStore()

const { workOrder } = storeToRefs(workOrderStore)
const { purchaseOrder } = storeToRefs(purchaseOrderStore)

onBeforeMount(() => {
  if (!workOrder.value) workOrderStore.$resetWorkOrder()
})
onMounted(() => {
  // workOrderStore.getWorkOrder(route.params.id)
})

const addUnit = () => {
  workOrder.value.units.push({
    jobDescriptions: '',
    unitType: '',
    quantity: 0
  })
}
const removeUnit = (index) => {
  workOrder.value.units.splice(index, 1)
}

const doRelease = async () => {
  try {
    await purchaseOrderStore.release(route.params.id, workOrder.value)
    router.push(menuConfig.work_order.path)
  } catch (error) {
    throw error.data.error || error.data.message
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
    display: flex;
    justify-content: space-between;

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
