<template>
  <form class="row form">
    <div class="upper my-2">
      <div class="title">Project</div>
      <div class="data">
        <div v-if="!isTypeAdd" class="left">
          <div class="input form-group col-12">
            <label for="">No Quotation</label><br>
            <input type="text" class="form-control mt-2" v-model="quotation.project.quotationNumber"
              placeholder="No Quotation" :disabled="disabled">
          </div>
          <div class="input form-group col-12">
            <label for="">Date Quotation</label><br>
            <input type="date" class="form-control mt-2" v-model="quotation.project.date" placeholder="Date"
              :disabled="disabled">
          </div>
        </div>
        <div class="right">
          <div class="input form-group col-12">
            <label for="">Project Type</label><br>
            <select class="form-select mt-2" aria-label="Project Type" v-model="quotation.project.type"
              :disabled="disabled">
              <option value="" disabled selected>Select Project Type</option>
              <option value="Spareparts">Spareparts</option>
              <option value="Service">Service</option>
            </select>
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
            <input type="text" class="form-control mt-2" v-model="quotation.customer.companyName"
              placeholder="Company Name" :disabled="disabled">
          </div>
          <div class="input form-group col-12">
            <label for="">Address</label><br>
            <input type="text" class="form-control mt-2" v-model="quotation.customer.address" placeholder="Address"
              :disabled="disabled">
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">City</label><br>
                <input type="text" class="form-control mt-2" v-model="quotation.customer.city" placeholder="City"
                  :disabled="disabled">
              </div>
              <div class="col-6">
                <label for="">Province</label><br>
                <input type="text" class="form-control mt-2" v-model="quotation.customer.province"
                  placeholder="Province" :disabled="disabled">
              </div>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="input form-group col-12">
            <label for="">Office</label><br>
            <input type="text" class="form-control mt-2" v-model="quotation.customer.office" placeholder="Office"
              :disabled="disabled">
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">Urban</label><br>
                <input type="text" class="form-control mt-2" v-model="quotation.customer.urban" placeholder="Urban"
                  :disabled="disabled">
              </div>
              <div class="col-6">
                <label for="">Subdistrict</label><br>
                <input type="text" class="form-control mt-2" v-model="quotation.customer.subdistrict"
                  placeholder="Subdistrict" :disabled="disabled">
              </div>
            </div>
          </div>
          <div class="input form-group col-12">
            <label for="">Postal Code</label><br>
            <input type="text" class="form-control mt-2" v-model="quotation.customer.postalCode"
              placeholder="Postal Code" :disabled="disabled">
          </div>
        </div>
      </div>
    </div>
    <div v-if="quotation.project.type === 'Spareparts'" class="sparepart my-2">
      <div class="title">Sparepart</div>
      <div v-if="isTypeEdit" class="table-placeholder">
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
            <tr v-for="(sparepart, index) in quotation.spareparts" :key="index" class="align-middle">
              <td scope="row" class="table-col table-number">{{ index + 1 }}</td>
              <td class="table-col table-part-number">{{ sparepart.sparepartName }}</td>
              <td class="table-col table-name">{{ sparepart.sparepartNumber }}</td>
              <td class="table-col table-name">{{ sparepart.quantity }}</td>
              <td class="table-col table-name">{{ sparepart.unit || 'pcs' }}</td>
              <td class="table-col table-name">{{ sparepart.unitPriceSell }}</td>
              <td class="table-col table-name">{{ sparepart.totalPrice }}</td>
              <td class="table-col table-name">{{ sparepart.stock }}</td>
            </tr>
            <tr class="align-middle">
              <td scope="row" class="table-col table-number"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-part-number">SubTotal</td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">{{ quotation.price.subtotal }}</td>
              <td class="table-col table-name"></td>
            </tr>
            <tr class="align-middle">
              <td scope="row" class="table-col table-number"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">PPN 12%</td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">{{ quotation.price.ppn }}</td>
              <td class="table-col table-name"></td>
            </tr>
            <tr class="align-middle">
              <td scope="row" class="table-col table-number"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">Grand Total</td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">{{ quotation.price.grandTotal }}</td>
              <td class="table-col table-name"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="add-sparepart">
        <div class="form-group col-12 mx-3">
          <div class="row">
            <div class="col-11">
              <div class="row">
                <div class="col-4">
                  <label for="">Sparepart Name</label>
                </div>
                <div class="col-2">
                  <label for="">Part Number</label>
                </div>
                <div class="col-2">
                  <label for="">Quantity</label>
                </div>
                <div class="col-2">
                  <label for="">Unit Price</label>
                </div>
                <div class="col-2">
                  <label for="">Total Price</label>
                </div>
              </div>
            </div>
            <div class="col-1">
              <div class="button-placeholder"></div>
            </div>
          </div>
        </div>
        <div class="form-group col-12 mx-3">
          <div v-for="(sparepart, sparepartIndex) in quotation.spareparts" :key="sparepartIndex" class="list row">
            <div class="col-11">
              <div class="row">
                <div class="col-4">
                  <input type="text" class="form-control mt-2" v-model="sparepart.sparepartName" placeholder="Part Name"
                    data-bs-toggle="dropdown" aria-expanded="false" @change="handleInputSearch(sparepart.sparepartName)"
                    @keyup="handleInputSearch(sparepart.sparepartName)">
                  <ul class="dropdown-menu">
                    <li v-for="(item, index) in searchedSpareparts" :key="index" class="dropdown-item"
                      @click="selectItem(sparepartIndex, sparepart, item)">
                      {{ item.sparepartName }}
                    </li>
                  </ul>
                </div>
                <div class="col-2">
                  <input type="text" class="form-control mt-2" v-model="sparepart.sparepartNumber"
                    placeholder="Part Number" data-bs-toggle="dropdown" aria-expanded="false"
                    @change="handleInputSearch(sparepart.sparepartNumber)"
                    @keyup="handleInputSearch(sparepart.sparepartNumber)">
                  <ul class="dropdown-menu">
                    <li v-for="(item, index) in searchedSpareparts" :key="index" class="dropdown-item"
                      @click="selectItem(sparepartIndex, sparepart, item)">
                      {{ item.sparepartNumber }}
                    </li>
                  </ul>
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="sparepart.quantity"
                    @input="selectItem(sparepartIndex, sparepart)">
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Unit Price"
                    v-model="sparepart.unitPriceSell" @change="selectItem(sparepartIndex, sparepart)">
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Total Price"
                    v-model="sparepart.totalPrice" disabled>
                </div>
              </div>
            </div>
            <div class="col-1

">
              <button type="button" class="btn btn-outline-danger" @click="removeSparepart(sparepartIndex)"><i
                  class="bi bi-trash3"></i></button>
            </div>
          </div>
          <div class="add-btn mt-3">
            <button type="button" class="btn btn-outline-dark" @click="addSparepart">
              <i class="bi bi-plus-lg"></i>
              <span class="mx-2">Add Sparepart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="quotation.project.type === 'Service'" class="service my-2">
      <div class="title">Service</div>
      <div v-if="isTypeEdit" class="table-placeholder">
        <table class="table table-hover">
          <thead>
            <tr class="align-middle">
              <th scope="col-1" class="table-number">NO</th>
              <th scope="col" class="table-name">SERVICE NAME</th>
              <th scope="col" class="table-name">QUANTITY</th>
              <th scope="col" class="table-name">UNIT PRICE</th>
              <th scope="col" class="table-name">TOTAL PRICE</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <tr v-for="(service, index) in quotation.services" :key="index" class="align-middle">
              <td scope="row" class="table-col table-number">{{ index + 1 }}</td>
              <td class="table-col table-name">{{ service.service }}</td>
              <td class="table-col table-name">{{ service.quantity }}</td>
              <td class="table-col table-name">{{ service.unitPriceSell }}</td>
              <td class="table-col table-name">{{ service.totalPrice }}</td>
            </tr>
            <tr class="align-middle">
              <td scope="row" class="table-col table-number"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">SubTotal</td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">{{ quotation.price.subtotal }}</td>
            </tr>
            <tr class="align-middle">
              <td scope="row" class="table-col table-number"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">PPN 12%</td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">{{ quotation.price.ppn }}</td>
            </tr>
            <tr class="align-middle">
              <td scope="row" class="table-col table-number"></td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">Grand Total</td>
              <td class="table-col table-name"></td>
              <td class="table-col table-name">{{ quotation.price.grandTotal }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="add-service">
        <div class="form-group col-12 mx-3">
          <div class="row">
            <div class="col-11">
              <div class="row">
                <div class="col-4">
                  <label for="">Service Name</label>
                </div>
                <div class="col-3">
                  <label for="">Quantity</label>
                </div>
                <div class="col-3">
                  <label for="">Unit Price</label>
                </div>
                <div class="col-2">
                  <label for="">Total Price</label>
                </div>
              </div>
            </div>
            <div class="col-1">
              <div class="button-placeholder"></div>
            </div>
          </div>
        </div>
        <div class="form-group col-12 mx-3">
          <div v-for="(service, serviceIndex) in quotation.services" :key="serviceIndex" class="list row">
            <div class="col-11">
              <div class="row">
                <div class="col-4">
                  <input type="text" class="form-control mt-2" v-model="service.service" placeholder="Service Name">
                </div>
                <div class="col-3">
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="service.quantity"
                    @input="selectService(serviceIndex, service)">
                </div>
                <div class="col-3">
                  <input type="number" class="form-control mt-2" placeholder="Unit Price"
                    v-model="service.unitPriceSell" @change="selectService(serviceIndex, service)">
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Total Price" v-model="service.totalPrice"
                    disabled>
                </div>
              </div>
            </div>
            <div class="col-1">
              <button type="button" class="btn btn-outline-danger" @click="removeService(serviceIndex)"><i
                  class="bi bi-trash3"></i></button>
            </div>
          </div>
          <div class="add-btn mt-3">
            <button type="button" class="btn btn-outline-dark" @click="addService">
              <i class="bi bi-plus-lg"></i>
              <span class="mx-2">Add Service</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="price my-2">
      <div class="amount">
        Total Amount: {{ formatCurrency(quotation.price.amount) }}
      </div>
      <template v-if="!isTypeAdd">
        <div class="discount">
          Discount: {{ formatCurrency(quotation.price.discount) }}
        </div>
        <div class="subtotal">
          Subtotal: {{ formatCurrency(quotation.price.subtotal) }}
        </div>
        <div class="ppn">
          PPN: {{ formatCurrency(quotation.price.ppn) }}
        </div>
        <div class="grand-total">
          Grand Total: {{ formatCurrency(quotation.price.grandTotal) }}
        </div>
      </template>
    </div>
    <div class="notes my-2">
      <div class="title">Notes</div>
      <div class="inputform-floating">
        <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
          v-model="quotation.notes" :disabled="disabled"></textarea>
      </div>
    </div>
  </form>
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue'
import { common } from '@/config'
import { useQuotationStore } from '@/stores/quotation'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { useModalStore } from '@/stores/modal'
import { formatCurrency } from '@/utils/form-util'

const quotationStore = useQuotationStore()
const modalStore = useModalStore()

const { quotation, searchedSpareparts } = storeToRefs(quotationStore)

const props = defineProps({
  type: String,
  action: Function
})

const isTypeEdit = props.type == common.form.type.view
const isTypeAdd = props.type == common.form.type.add
const disabled = computed(() => isTypeEdit ? true : false)

onBeforeMount(() => {
  console.log('quotation review', quotation.value)
  if (!quotation.value) quotationStore.$resetQuotation()
})

const amount = computed(() => {
  if (quotation.value.project.type === 'Spareparts') {
    return quotation.value.spareparts.reduce((sum, item) => sum + item.totalPrice, 0)
  } else {
    return quotation.value.services.reduce((sum, item) => sum + item.totalPrice, 0)
  }
})

const searchSparepart = (search) => {
  if (search !== '') quotationStore.getSpareparts({ page: 1, search })
}

const handleInputSearch = (search) => {
  debounce(() => searchSparepart(search), 500, 'search-quotation-sparepart')
}

const selectItem = (index, purchaseData, sparepartData) => {
  const data = {
    ...purchaseData,
    ...sparepartData
  }
  data.totalPrice = data.quantity * data.unitPriceSell

  quotation.value.spareparts.splice(index, 1, data)
  updatePrice()
}

const selectService = (index, serviceData) => {
  const data = { ...serviceData }
  data.totalPrice = data.quantity * data.unitPriceSell

  quotation.value.services.splice(index, 1, data)
  updatePrice()
}

const updatePrice = () => {
  quotation.value.price.amount = amount.value
  quotation.value.price.subtotal = amount.value - quotation.value.price.discount
  const ppn = quotation.value.price.subtotal * 11 / 100
  quotation.value.price.ppn = ppn
  quotation.value.price.grandTotal = quotation.value.price.subtotal + ppn
}

const addSparepart = () => {
  quotation.value.spareparts.push({
    sparepartId: '',
    sparepartName: '',
    sparepartNumber: '',
    quantity: 0,
    unitPriceSell: 0,
    totalPrice: 0,
    stock: ''
  })
}

const addService = () => {
  quotation.value.services.push({
    service: '',
    quantity: 0,
    unitPriceSell: 0,
    totalPrice: 0
  })
}

const removeSparepart = (index) => {
  quotation.value.spareparts.splice(index, 1)
  updatePrice()
}

const removeService = (index) => {
  quotation.value.services.splice(index, 1)
  updatePrice()
}
</script>

<style lang="scss" scoped>
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 1%;
  display: flex;
  justify-content: space-between;
}

.input {
  margin: 2% 0%;
}

.sparepart,
.service {
  .list {
    display: flex;
    align-items: flex-end;
  }

  .add-btn {
    display: flex;
    justify-content: center;
  }

  .btn-request {
    background-color: $primary-color;
    color: white;
  }
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

.dropdown-menu {
  text-align: center;
  max-height: 300px;
  overflow-y: auto;
  margin-right: -10%;
}

.dropdown-menu::-webkit-scrollbar {
  margin-right: -10px;
  width: 10px;
}

.dropdown-menu::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: grey;
  border-radius: 10px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #696969;
}

@media only screen and (max-width: 767px) {

  .upper,
  .lower {
    .data {
      flex-direction: column;
    }

    .left,
    .right {
      width: 100%;
    }
  }

  .sparepart,
  .service {
    .row {
      .col-4 {
        width: 100%;
      }

      .col-2,
      .col-3 {
        width: 33.33%;
        margin-top: 10px;
        padding: 0 5px;
      }
    }

    .list {
      margin-bottom: 20px;
    }
  }

  .table-placeholder {
    font-size: 14px;

    .table {
      min-width: 800px;
    }
  }
}
</style>
