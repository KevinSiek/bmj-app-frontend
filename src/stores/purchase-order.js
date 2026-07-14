import { ref } from 'vue'
import { defineStore } from 'pinia'
import purchaseOrderApi from '@/api/purchase-order'
import borrowApi from '@/api/borrow'

export const usePurchaseOrderStore = defineStore('purchase-order', () => {
  const purchaseOrder = ref(null)
  const purchaseOrders = ref([])
  const returnPurchaseOrders = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  // PO option pickers (Service for the request, Spareparts for reconciliation). Kept as an
  // appendable list so the dropdown can "load more" by incrementing the page.
  const poOptions = ref([])
  const poOptionsPage = ref(1)
  const poOptionsLastPage = ref(1)

  function mapPurchaseOrder(data) {
    return {
      id: data?.id || '',
      status: data?.status || [],
      currentStatus: data?.current_status || '',
      purchaseOrderNumber: data?.purchase_order_number || '',
      purchaseOrder: {
        purchaseOrderNumber: data?.purchase_order?.purchase_order_number || '', // This is for Internal Request Number
        poNumber: data?.purchase_order?.po_number || '', // This is PO From Customer
        purchaseOrderDate: data?.purchase_order?.purchase_order_date || '',
        type: data?.purchase_order?.type || ''
      },
      proformaInvoice: {
        proformaInvoiceNumber: data?.proforma_invoice?.proforma_invoice_number || '',
        proformaInvoiceDate: data?.proforma_invoice?.proforma_invoice_date || '',
        isDpPaid: data?.proforma_invoice?.is_dp_paid || false,
        isFullPaid: data?.proforma_invoice?.is_full_paid || false
      },
      customer: {
        companyName: data?.customer?.company_name || '',
        address: data?.customer?.address || '',
        city: data?.customer?.city || '',
        province: data?.customer?.province || '',
        office: data?.customer?.office || '',
        urban: data?.customer?.urban || '',
        subdistrict: data?.customer?.subdistrict || '',
        postalCode: data?.customer?.postal_code || ''
      },
      price: {
        amount: data?.price?.amount || 0,
        discount: data?.price?.discount || 0,
        subtotal: data?.price?.subtotal || 0,
        ppn: data?.price?.ppn || 0,
        grandTotal: data?.price?.grand_total || 0
      },
      notes: data?.notes || '',
      downPayment: data?.down_payment || 0,
      version: data?.version || 0,
      spareparts: (data?.spareparts || []).map(sparepart => ({
        id: sparepart?.sparepart_id || '', // Add sparepart ID
        sparepartName: sparepart?.sparepart_name || '',
        sparepartNumber: sparepart?.sparepart_number || '',
        quantity: sparepart?.quantity || 0,
        unitPriceSell: sparepart?.unit_price_sell || 0,
        totalPrice: sparepart?.total_price || 0,
        stock: sparepart?.stock || ''
      })),
      services: (data?.services || []).map(service => ({
        service: service?.service || '',
        quantity: service?.quantity || 0,
        unitPriceSell: service?.unit_price_sell || 0,
        totalPrice: service?.total_price || 0
      }))
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

  async function getAllPurchaseOrders(param) {
    isLoading.value = true
    const { data } = await purchaseOrderApi.getAllPurchaseOrder(param)
    // Group by purchase order number
    const grouped = {}
    data.data.forEach(item => {
      const key = item.purchase_order.purchase_order_number
      if (!grouped[key]) {
        grouped[key] = {
          purchaseOrderNumber: key,
          versions: []
        }
      }
      grouped[key].versions.push(mapPurchaseOrder(item))
    })
    purchaseOrders.value = Object.values(grouped)
    paginationData.value = data
    isLoading.value = false
  }
  async function getAllReturnPurchaseOrders(param) {
    isLoading.value = true
    const { data } = await purchaseOrderApi.getAllReturnPurchaseOrder(param)
     // Group by purchase order number
    const grouped = {}
    data.data.forEach(item => {
      const key = item.purchase_order.purchase_order_number
      if (!grouped[key]) {
        grouped[key] = {
          purchaseOrderNumber: key,
          versions: []
        }
      }
      grouped[key].versions.push(mapPurchaseOrder(item))
    })
    returnPurchaseOrders.value = Object.values(grouped)
    paginationData.value = data
    isLoading.value = false
  }

  async function getPurchaseOrder(id) {
    const { data } = await purchaseOrderApi.getPurchaseOrderById(id)
    console.log(data)
    purchaseOrder.value = mapPurchaseOrder(data)
  }

  async function addPurchaseOrder() {
    await purchaseOrderApi.addPurchaseOrder(purchaseOrder)
  }

  async function setPurchaseOrder(selectedPurchaseOrder) {
    purchaseOrder.value = selectedPurchaseOrder
  }

  async function updatePurchaseOrder() {
    const { data } = await purchaseOrderApi.updatePurchaseOrder(purchaseOrder.value.id, purchaseOrder)
  }

  async function deletePurchaseOrder(id) {
    await purchaseOrderApi.deletePurchaseOrder(id)
  }

  async function processToProformaInvoice(id, notes) {
    const response = await purchaseOrderApi.processToProformaInvoice(id, { notes })
  }

  async function updateStatus(id, status) {
    const response = await purchaseOrderApi.updateStatusPurchaseOrder(id, { status })
  }

  async function $resetPurchaseOrder() {
    purchaseOrder.value = mapPurchaseOrder()
  }

  async function $resetPurchaseOrders() {
    purchaseOrders.value = []
  }

  async function fullPaid(id) {
    const response = await purchaseOrderApi.fullPaid(id)
  }

  async function ready(id) {
    const response = await purchaseOrderApi.ready(id)
  }

  async function release(id, workOrder) {
    const response = await purchaseOrderApi.release(id, workOrder)
  }

  async function done(id) {
    const response = await purchaseOrderApi.done(id)
  }

  async function reject(id, notes) {
    const response = await purchaseOrderApi.reject(id, { notes })
  }

  async function updateNotes(id, notes) {
    await purchaseOrderApi.updatePurchaseOrder(id, { notes })
  }

  async function returnPurchaseOrder(id, returnedItems) {
    const response = await purchaseOrderApi.returnPurchaseOrder(id, returnedItems)
  }

  async function approveReturn(id) {
    const response = await purchaseOrderApi.approveReturn(id)
  }

  async function rejectReturn(id) {
    const response = await purchaseOrderApi.rejectReturn(id)
  }

  /**
   * Load PO options. page === 1 replaces the list; higher pages append (load-more).
   * type is 'Service' (request link) or 'Spareparts' (reconciliation).
   */
  async function getPurchaseOrderOptions({ type, search = '', page = 1 } = {}) {
    const { data } = await purchaseOrderApi.getPurchaseOrderOptions({ type, search, page })
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

  return {
    purchaseOrder,
    purchaseOrders,
    returnPurchaseOrders,
    paginationData,
    isLoading,
    poOptions,
    poOptionsPage,
    poOptionsLastPage,
    getAllPurchaseOrders,
    getAllReturnPurchaseOrders,
    getPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    addPurchaseOrder,
    setPurchaseOrder,
    processToProformaInvoice,
    updateStatus,
    fullPaid,
    ready,
    release,
    done,
    reject,
    returnPurchaseOrder,
    approveReturn,
    rejectReturn,
    updateNotes,
    getPurchaseOrderOptions,
    resetPurchaseOrderOptions,
    $resetPurchaseOrder,
    $resetPurchaseOrders
  }
})
