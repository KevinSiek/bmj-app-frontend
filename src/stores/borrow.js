import { ref } from 'vue'
import { defineStore } from 'pinia'
import borrowApi from '@/api/borrow'
import { getAllSparepart } from '@/api/sparepart'

export const useBorrowStore = defineStore('borrow', () => {
  const borrow = ref(null)
  const borrows = ref([])
  const paginationData = ref({})
  const searchedSpareparts = ref([])
  const isLoading = ref(false)

  // PO option pickers (Service for the request, Spareparts for reconciliation). Kept as an
  // appendable list so the dropdown can "load more" by incrementing the page.
  const poOptions = ref([])
  const poOptionsPage = ref(1)
  const poOptionsLastPage = ref(1)

  function mapBorrow(data = {}) {
    return {
      id: data?.id || '',
      borrowNumber: data?.borrow_number || '',
      currentStatus: data?.current_status || '',
      branch: {
        id: data?.branch?.id || '',
        name: data?.branch?.name || ''
      },
      purchaseOrder: {
        id: data?.purchase_order?.id || '',
        poNumber: data?.purchase_order?.po_number || '',
        purchaseOrderNumber: data?.purchase_order?.purchase_order_number || '',
        type: data?.purchase_order?.type || ''
      },
      workOrder: {
        id: data?.work_order?.id || '',
        workOrderNumber: data?.work_order?.work_order_number || '',
        worker: data?.work_order?.worker || ''
      },
      sparepartPoId: data?.sparepart_po_id || '',
      sparepartPoNumber: data?.sparepart_po_number || '',
      status: data?.status || [],
      notes: data?.notes || '',
      returnNotes: data?.return_notes || '',
      rejectNotes: data?.reject_notes || '',
      spareparts: (data?.spareparts || []).map(sparepart => ({
        sparepartId: sparepart?.sparepart_id || '',
        sparepartName: sparepart?.sparepart_name || '',
        sparepartNumber: sparepart?.sparepart_number || '',
        quantity: sparepart?.quantity || 0,
        quantityReturn: sparepart?.quantity_return ?? null,
        stockInBranch: sparepart?.stock_in_branch || 0
      }))
    }
  }

  function mapSparepart(data) {
    return {
      sparepartId: data?.sparepart_id || data?.id || '',
      sparepartNumber: data?.sparepart_number || '',
      sparepartName: data?.sparepart_name || '',
      totalUnit: Object.fromEntries(
        (data?.total_unit || []).map(branch => [branch?.name || '', branch?.stock || 0])
      ),
    }
  }

  function mapPoOption(data) {
    return {
      id: data?.id || '',
      poNumber: data?.po_number || '',
      purchaseOrderNumber: data?.purchase_order_number || '',
      purchaseOrderDate: data?.purchase_order_date || '',
      version: data?.version || 1,
      workOrder: {
        id: data?.work_order?.id || '',
        workOrderNumber: data?.work_order?.work_order_number || '',
        worker: data?.work_order?.worker || ''
      },
      spareparts: (data?.spareparts || []).map(s => ({
        sparepartId: s?.sparepart_id || '',
        sparepartName: s?.sparepart_name || '',
        sparepartNumber: s?.sparepart_number || '',
        quantity: s?.quantity || 0
      }))
    }
  }

  async function getAllBorrow(param) {
    isLoading.value = true
    const { data } = await borrowApi.getAllBorrow(param)
    borrows.value = data.data.map(mapBorrow)
    paginationData.value = data
    isLoading.value = false
  }

  async function getBorrow(id) {
    const { data } = await borrowApi.getBorrowById(id)
    borrow.value = mapBorrow(data)
  }

  async function setBorrow(selectedBorrow) {
    borrow.value = selectedBorrow
  }

  function buildPayload() {
    return {
      purchaseOrderId: borrow.value.purchaseOrder.id,
      notes: borrow.value.notes,
      spareparts: borrow.value.spareparts.map(sparepart => ({
        sparepartId: sparepart.sparepartId,
        quantity: Number(sparepart.quantity)
      }))
    }
  }

  async function addBorrow() {
    await borrowApi.addBorrow(buildPayload())
  }

  async function updateBorrow() {
    await borrowApi.updateBorrow(borrow.value.id, buildPayload())
  }

  async function getSpareparts(param) {
    const { data } = await getAllSparepart(param)
    searchedSpareparts.value = data.data.map(mapSparepart)
  }

  /**
   * Load PO options. page === 1 replaces the list; higher pages append (load-more).
   * type is 'Service' (request link) or 'Spareparts' (reconciliation).
   */
  async function getPurchaseOrderOptions({ type, search = '', page = 1 } = {}) {
    const { data } = await borrowApi.getPurchaseOrderOptions({ type, search, page })
    const mapped = data.data.map(mapPoOption)
    poOptions.value = page === 1 ? mapped : [...poOptions.value, ...mapped]
    poOptionsPage.value = data.current_page
    poOptionsLastPage.value = data.last_page
  }

  function resetPurchaseOrderOptions() {
    poOptions.value = []
    poOptionsPage.value = 1
    poOptionsLastPage.value = 1
  }

  async function approveBorrow(id) {
    return borrowApi.approveBorrow(id)
  }

  async function rejectBorrow(id, notes) {
    return borrowApi.rejectBorrow(id, { notes })
  }

  async function sendBorrow(id) {
    return borrowApi.sendBorrow(id)
  }

  async function returnBorrow(id, payload) {
    return borrowApi.returnBorrow(id, payload)
  }

  async function receiveBorrow(id, payload) {
    return borrowApi.receiveBorrow(id, payload)
  }

  async function doneBorrow(id) {
    return borrowApi.doneBorrow(id)
  }

  async function cancelBorrow(id) {
    return borrowApi.cancelBorrow(id)
  }

  async function $resetBorrow() {
    borrow.value = mapBorrow()
  }

  async function $resetBorrows() {
    borrows.value = []
  }

  return {
    borrow,
    borrows,
    paginationData,
    searchedSpareparts,
    isLoading,
    poOptions,
    poOptionsPage,
    poOptionsLastPage,
    getAllBorrow,
    getBorrow,
    setBorrow,
    addBorrow,
    updateBorrow,
    getSpareparts,
    getPurchaseOrderOptions,
    resetPurchaseOrderOptions,
    approveBorrow,
    rejectBorrow,
    sendBorrow,
    returnBorrow,
    receiveBorrow,
    cancelBorrow,
    doneBorrow,
    $resetBorrow,
    $resetBorrows
  }
})
