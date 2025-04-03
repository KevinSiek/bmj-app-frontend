<template>
  <form class="row form">
    <div class="upper my-2">
      <div class="title">Project</div>
      <div class="data">
        <div class="left">
          <div class="input form-group col-12">
            <label for="">No Quotation</label><br>
            <input type="text" class="form-control mt-2" v-model="quotation.project.noQuotation"
              placeholder="No Quotation" :disabled="disabled">
          </div>
        </div>
        <div class="right">
          <div class="input form-group col-12">
            <label for="">Project Type</label><br>
            <input type="text" class="form-control mt-2" v-model="quotation.project.type" placeholder="Type"
              :disabled="disabled">
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
    <div class="sparepart my-2">
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
              <td class="table-col table-part-number">{{ sparepart.partName }}</td>
              <td class="table-col table-name">{{ sparepart.partNumber }}</td>
              <td class="table-col table-name">{{ sparepart.quantity }}</td>
              <td class="table-col table-name">{{ sparepart.unit }}</td>
              <td class="table-col table-name">{{ sparepart.unitPrice }}</td>
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
                  <input type="text" class="form-control mt-2" v-model="sparepart.partName" placeholder="Part Name"
                    data-bs-toggle="dropdown" aria-expanded="false" @change="handleInputSearch(sparepart.partName)"
                    @keyup="handleInputSearch(sparepart.partName)">
                  <ul class="dropdown-menu">
                    <li v-for="(item, index) in searchedSpareparts" :key="index" class="dropdown-item"
                      @click="selectItem(sparepartIndex, sparepart, item)">
                      {{ item.name }}
                    </li>
                  </ul>
                </div>
                <div class="col-2">
                  <input type="text" class="form-control mt-2" v-model="sparepart.partNumber" placeholder="Part Number"
                    data-bs-toggle="dropdown" aria-expanded="false" @change="handleInputSearch(sparepart.partNumber)"
                    @keyup="handleInputSearch(sparepart.partNumber)">
                  <ul class="dropdown-menu">
                    <li v-for="(item, index) in searchedSpareparts" :key="index" class="dropdown-item"
                      @click="selectItem(sparepartIndex, sparepart, item)">
                      {{ item.no_sparepart }}
                    </li>
                  </ul>
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="sparepart.quantity"
                    @input="selectItem(sparepartIndex, sparepart)">
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Unit Price" v-model="sparepart.unitPrice"
                    @change="selectItem(sparepartIndex, sparepart)">
                </div>
                <div class="col-2">
                  <input type="number" class="form-control mt-2" placeholder="Total Price"
                    v-model="sparepart.totalPrice" disabled>
                </div>
              </div>
            </div>
            <div class="col-1">
              <button type="button" class="btn btn-outline-danger" @click="removeSparepart(quotationIndex)"><i
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
    <div class="price my-2">
      <div class="subtotal">
        Subtotal: {{ quotation.price.subtotal }}
      </div>
      <div class="ppn">
        PPN: {{ quotation.price.ppn }}
      </div>
      <div class="grand-total">
        Grand Total: {{ quotation.price.grandTotal }}
      </div>
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
import { computed, ref } from 'vue'
import { common } from '@/config'
import { useQuotationStore } from '@/stores/quotation'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { useModalStore } from '@/stores/modal'

const quotationStore = useQuotationStore()
const modalStore = useModalStore()

const { quotation, searchedSpareparts } = storeToRefs(quotationStore)

const props = defineProps({
  type: String,
  action: Function
})

const isTypeEdit = props.type == common.form.type.view
const disabled = computed(() => isTypeEdit ? true : false)

// const searchedSparepart = ref([{
//   partName: 'NEW BEARING SET, CON ROD',
//   partNumber: '30L19-342289',
//   unitPrice: 500000
// },
// {
//   partName: 'BEARING SET, CON ROD',
//   partNumber: '30L19-342289',
//   unitPrice: 494000
// },
// ])

const subtotal = computed(() => quotation.value.spareparts.reduce((sum, item) => sum + item.totalPrice, 0))

const searchSparepart = (search) => {
  if (search !== '') quotationStore.getSpareparts({ page: 1, search })
}

const handleInputSearch = (search) => {
  debounce(() => searchSparepart(search), 500, 'search-quotation-sparepart')
}

const selectItem = (index, purchaseData, sparepartData) => {
  const data = {
    ...purchaseData,
    partNumber: sparepartData?.no_sparepart || purchaseData.partNumber,
    partName: sparepartData?.name || purchaseData.partName,
    unitPrice: sparepartData?.unit_price_sell || purchaseData.unitPrice
  }
  data.totalPrice = data.quantity * data.unitPrice

  quotation.value.spareparts.splice(index, 1, data)
  quotation.value.price.subtotal = subtotal.value
  const ppn = subtotal.value * 11 / 100
  quotation.value.price.ppn = ppn
  quotation.value.price.grandTotal = subtotal.value + ppn
}

const addSparepart = () => {
  quotation.value.spareparts.push({
    partName: '',
    partNumber: '',
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
    stock: ''
  })
}
const removeSparepart = (index) => {
  quotation.value.spareparts.splice(index, 1)
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

.sparepart {
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
</style>
