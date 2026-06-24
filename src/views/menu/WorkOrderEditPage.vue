<template>
  <div class="contain background shadow">
    <form class="row form" autocomplete="off">
      <div class="upper my-2">
        <div class="title">Customer</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Company Name</label><br>
              <input type="text" class="form-control mt-2" v-model="workOrder.customer.companyName"
                placeholder="Company Name" autocomplete="off">
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="workOrder.customer.address" placeholder="Address" autocomplete="off">
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="workOrder.customer.city" placeholder="City" autocomplete="off">
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="workOrder.customer.province"
                    placeholder="Province" autocomplete="off">
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="workOrder.customer.office" placeholder="Office" autocomplete="off">
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="workOrder.customer.urban" placeholder="Urban" autocomplete="off">
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="workOrder.customer.subdistrict"
                    placeholder="Subdistrict" autocomplete="off">
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="workOrder.customer.postalCode"
                placeholder="Postal Code" autocomplete="off">
            </div>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="left">
          <div class="title">Proforma Invoice</div>
          <div class="input form-group col-12">
            <label for="">No</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.proformaInvoice.proformaInvoiceNumber"
              placeholder="No" autocomplete="off">
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="date" class="form-control mt-2" v-model="workOrder.proformaInvoice.proformaInvoiceDate"
              placeholder="Date">
          </div>
        </div>
        <div class="right">
          <div class="title">Service Order</div>
          <div class="input form-group col-12">
            <label for="">No</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.serviceOrder.serviceOrderNumber"
              placeholder="No" autocomplete="off">
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="date" class="form-control mt-2" v-model="workOrder.serviceOrder.date" placeholder="Date">
          </div>
          <div class="input form-group col-12">
            <label for="">Received by</label><br>
            <input type="text" class="form-control mt-2" :class="{ 'is-invalid': errors.receivedBy }" v-model="workOrder.serviceOrder.receivedBy"
              placeholder="Payment Due" autocomplete="off">
            <div class="invalid-feedback">{{ errors.receivedBy }}</div>
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">Expected Start Date</label><br>
                <input type="date" class="form-control mt-2" v-model="workOrder.serviceOrder.startDate"
                  placeholder="Expected Start Date">
              </div>
              <div class="col-6">
                <label for="">Expected End Date</label><br>
                <input type="date" class="form-control mt-2" v-model="workOrder.serviceOrder.endDate"
                  placeholder="Expected End Date">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="left">
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
                    <input type="text" class="form-control mt-2" placeholder="Job Desc" v-model="unit.jobDescriptions" autocomplete="off">
                  </div>
                  <div class="col-5">
                    <input type="text" class="form-control mt-2" placeholder="Unit Type" v-model="unit.unitType" autocomplete="off">
                  </div>
                  <div class="col-3">
                    <input type="number" class="form-control mt-2" :class="{ 'is-invalid': errors[`unit_${unitIndex}_quantity`] }" placeholder="Quantity" v-model="unit.quantity" @wheel.prevent>
                    <div class="invalid-feedback">{{ errors[`unit_${unitIndex}_quantity`] }}</div>
                  </div>
                </div>
              </div>
              <div class="col-1">
                <button type="button" class="btn btn-outline-danger" @click="removeUnit(unitIndex)"><i
                    class="bi bi-trash3"></i></button>
              </div>
            </div>
            <div v-if="errors.unitsEmpty" class="text-danger mt-2 small">{{ errors.unitsEmpty }}</div>
            <div class="add-btn mt-3">
              <button type="button" class="btn btn-outline-dark" @click="addUnit">
                <i class="bi bi-plus-lg"></i>
                <span class="mx-2">Add Unit</span>
              </button>
            </div>
          </div>
          <div class="input form-group col-12 mt-4">
            <label for="">Compiled By (Admin CSO)</label><br>
            <input type="text" class="form-control mt-2" :class="{ 'is-invalid': errors.compiled }" v-model="workOrder.poc.compiled" placeholder="Compiled by" autocomplete="off">
            <div class="invalid-feedback">{{ errors.compiled }}</div>
          </div>
          <div class="input form-group col-12">
            <label for="">Authorized by</label><br>
            <div class="row px-3">
              <div class="col-6">
                <label for="">Dept Head Service</label><br>
                <input type="text" class="form-control mt-2" :class="{ 'is-invalid': errors.headOfService }" v-model="workOrder.poc.headOfService"
                  placeholder="Dept Head Service" autocomplete="off">
                <div class="invalid-feedback">{{ errors.headOfService }}</div>
              </div>
              <div class="col-6">
                <label for="">Director</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.poc.director" placeholder="Director" autocomplete="off">
              </div>
            </div>
          </div>
          <div class="input form-group col-12">
            <label for="">Date Completed</label><br>
            <div class="row px-3">
              <div class="col-6">
                <label for="">Start Date</label><br>
                <input type="date" class="form-control mt-2" v-model="workOrder.date.startDate"
                  placeholder="Start Date">
              </div>
              <div class="col-6">
                <label for="">End Date</label><br>
                <input type="date" class="form-control mt-2" v-model="workOrder.date.endDate" placeholder="End Date">
              </div>
            </div>
          </div>
          <div class="input form-group col-12">
            <label for="">Work Performed by</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.poc.worker" placeholder="Work Performed by" autocomplete="off">
          </div>
          <div class="input form-group col-12">
            <label for="">Approved by</label><br>
            <input type="text" class="form-control mt-2" :class="{ 'is-invalid': errors.approver }" v-model="workOrder.poc.approver" placeholder="Approved by" autocomplete="off">
            <div class="invalid-feedback">{{ errors.approver }}</div>
          </div>
        </div>
        <div class="right">
          <div class="title">Additional Comments</div>
          <div class="input form-group col-12">
            <label for="">List sparepart replaced</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.additional.spareparts"
              placeholder="List sparepart replaced" autocomplete="off">
          </div>
          <div class="input form-group col-12">
            <label for="">List backup sparepart</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.additional.backupSparepart"
              placeholder="List backup sparepart" autocomplete="off">
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">Scope of Work</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.additional.scope"
                  placeholder="Scope of Work" autocomplete="off">
              </div>
              <div class="col-6">
                <label for="">APD</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.additional.apd" placeholder="APD" autocomplete="off">
              </div>
            </div>
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">Vaccine</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.additional.vaccine"
                  placeholder="Vaccine" autocomplete="off">
              </div>
              <div class="col-6">
                <label for="">Peduli Lindungi</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.additional.peduliLindungi"
                  placeholder="Peduli Lindungi" autocomplete="off">
              </div>
            </div>
          </div>
          <div class="input form-group col-12">
            <label for="">Execution Time</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.additional.executionTime"
              placeholder="Execution Time" autocomplete="off">
          </div>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="workOrder.description" autocomplete="off"></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit">Back</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process">Print</button>
    </div>
  </div>
</template>

<script setup>
import { useWorkOrderStore } from '@/stores/work-order'
import { storeToRefs } from 'pinia'
import { onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const workOrderStore = useWorkOrderStore()

const { workOrder } = storeToRefs(workOrderStore)

const errors = computed(() => {
  const errs = {}
  if (!workOrderStore.isDirty) return errs
  const wo = workOrder.value
  if (!wo) return errs

  if (!wo.serviceOrder?.receivedBy?.trim()) {
    errs.receivedBy = 'Received By is required.'
  }
  if (!wo.poc?.compiled?.trim()) {
    errs.compiled = 'Compiled By is required.'
  }
  if (!wo.poc?.approver?.trim()) {
    errs.approver = 'Approved By is required.'
  }
  if (!wo.poc?.headOfService?.trim()) {
    errs.headOfService = 'Dept Head Service is required.'
  }
  if (!wo.units || wo.units.length === 0) {
    errs.unitsEmpty = 'At least one unit is required.'
  } else {
    wo.units.forEach((unit, index) => {
      if (!unit.quantity || Number(unit.quantity) <= 0) {
        errs[`unit_${index}_quantity`] = 'Quantity must be greater than 0.'
      }
    })
  }
  return errs
})

watch(
  () => workOrder.value,
  (newVal, oldVal) => {
    if (newVal !== null && oldVal !== null) {
      workOrderStore.isDirty = true
    }
  },
  { deep: true }
)

onMounted(async () => {
  await workOrderStore.getWorkOrder(route.params.id)
  workOrderStore.isDirty = false
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
