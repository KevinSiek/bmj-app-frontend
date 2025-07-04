import { ref } from 'vue'
import { defineStore } from 'pinia'
import purchaseOrderApi from '@/api/purchase-order'

export const usePurchaseOrderStore = defineStore('purchase-order', () => {
  const purchaseOrder = ref(null)
  const purchaseOrders = ref([])
  const returnPurchaseOrders = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  function mapPurchaseOrder (data) {
    return {
      id: data?.id || '',
      status: data?.status || [],
      currentStatus: data?.current_status || '',
      purchaseOrder: {
        purchaseOrderNumber: data?.purchase_order?.purchase_order_number || '',
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
        advancePayment: data?.price?.advance_payment || 0,
        total: data?.price?.total || 0,
        vat: data?.price?.vat || 0,
        totalAmount: data?.price?.total_amount || 0
      },
      notes: data?.notes || '',
      downPayment: data?.down_payment || 0,
      spareparts: (data?.spareparts || []).map(sparepart => ({
        sparepartName: sparepart?.sparepart_name || '',
        sparepartNumber: sparepart?.sparepart_number || '',
        quantity: sparepart?.quantity || 0,
        unitPriceSell: sparepart?.unit_price_sell || 0,
        totalPrice: sparepart?.total_price || 0,
        stock: sparepart?.stock || ''
      }))
    }
  }

  async function getAllPurchaseOrders(param) {
    isLoading.value = true
    const { data } = await purchaseOrderApi.getAllPurchaseOrder(param)
    purchaseOrders.value = data.data.map(mapPurchaseOrder)
    paginationData.value = data
    isLoading.value = false
  }
  async function getAllReturnPurchaseOrders(param) {
    isLoading.value = true
    const { data } = await purchaseOrderApi.getAllReturnPurchaseOrder(param)
    returnPurchaseOrders.value = data.data.map(mapPurchaseOrder)
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

  async function setPurchaseOrder (selectedPurchaseOrder) {
    purchaseOrder.value = selectedPurchaseOrder
  }

  async function updatePurchaseOrder() {
    const { data } = await purchaseOrderApi.updatePurchaseOrder(purchaseOrder.value.id, purchaseOrder)
  }

  async function deletePurchaseOrder(id) {
    await purchaseOrderApi.deletePurchaseOrder(id)
  }

  async function processToProformaInvoice (id) {
    const response = await purchaseOrderApi.processToProformaInvoice(id)
  }

  async function updateStatus (id, status) {
    const response = await purchaseOrderApi.updateStatusPurchaseOrder(id, { status })
  }

  async function $resetPurchaseOrder () {
    purchaseOrder.value = mapPurchaseOrder()
  }

  async function fullPaid (id) {
    const response = await purchaseOrderApi.fullPaid(id)
  }

  async function ready (id) {
    const response = await purchaseOrderApi.ready(id)
  }

  async function release (id, workOrder) {
    const response = await purchaseOrderApi.release(id, workOrder)
  }

  async function done (id) {
    const response = await purchaseOrderApi.done(id)
  }

  async function returnPurchaseOrder (id) {
    const response = await purchaseOrderApi.return(id)
  }

  async function approveReturn (id) {
    const response = await purchaseOrderApi.approveReturn(id)
  }

  async function rejectReturn (id) {
    const response = await purchaseOrderApi.rejectReturn(id)
  }

  return {
    purchaseOrder,
    purchaseOrders,
    returnPurchaseOrders,
    paginationData,
    isLoading,
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
    returnPurchaseOrder,
    approveReturn,
    rejectReturn,
    $resetPurchaseOrder
  }
})
