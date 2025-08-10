import { ref } from 'vue'
import { defineStore } from 'pinia'
import proformaInvoiceApi from '@/api/pi'

export const useProformaInvoiceStore = defineStore('proforma-invoice', () => {
  const proformaInvoice = ref(null)
  const proformaInvoices = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  function mapProformaInvoice(data) {
    return {
      id: data?.id || '',
      status: data?.status || [],
      currentStatus: data?.current_status || '',
      version: data?.version || 0,
      project: {
        proformaInvoiceNumber: data?.project?.proforma_invoice_number || '',
        purchaseOrderNumber: data?.project?.purchase_order_number || '',
        purchaseOrderDate: data?.project?.purchase_order_date || '',
        date: data?.project?.date || '',
        type: data?.project?.type || ''
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
      downPayment: data?.down_payment || 0,
      notes: data?.notes || '',
      spareparts: (data?.spareparts || []).map(sparepart => ({
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

  async function getAllProformaInvoices(param) {
    isLoading.value = true
    const { data } = await proformaInvoiceApi.getAllProformaInvoice(param)
    console.log("data :", data)
    // Group by proforma invoice number
    const grouped = {}
    data.data.forEach(item => {
      const key = item.project.proforma_invoice_number
      if (!grouped[key]) {
        grouped[key] = {
          proformaInvoiceNumber: key,
          versions: []
        }
      }
      grouped[key].versions.push(mapProformaInvoice(item))
    })
    proformaInvoices.value = Object.values(grouped)
    paginationData.value = data
    isLoading.value = false
  }

  async function getProformaInvoice(id) {
    const { data } = await proformaInvoiceApi.getProformaInvoiceById(id)
    proformaInvoice.value = mapProformaInvoice(data)
  }

  async function addProformaInvoice() {
    await proformaInvoiceApi.addProformaInvoice(proformaInvoice.value)
  }

  async function setProformaInvoice(selectedProformaInvoice) {
    proformaInvoice.value = selectedProformaInvoice
  }

  async function updateProformaInvoice() {
    console.log(proformaInvoice.value)
    const { data } = await proformaInvoiceApi.updateProformaInvoice(proformaInvoice.value.id, proformaInvoice.value)
  }

  async function deleteProformaInvoice(id) {
    await proformaInvoiceApi.deleteProformaInvoice(id)
  }

  async function processToInvoice(id) {
    const response = await proformaInvoiceApi.processToInvoice(id)
  }

  async function dpPaid(id) {
    const response = await proformaInvoiceApi.dpPaid(id)
  }

  async function $resetProformaInvoice() {
    proformaInvoice.value = mapProformaInvoice()
  }

  return {
    proformaInvoice,
    proformaInvoices,
    paginationData,
    isLoading,
    getAllProformaInvoices,
    getProformaInvoice,
    updateProformaInvoice,
    deleteProformaInvoice,
    addProformaInvoice,
    setProformaInvoice,
    processToInvoice,
    dpPaid,
    $resetProformaInvoice
  }
})
