import { ref } from 'vue'
import { defineStore } from 'pinia'
import invoiceApi from '@/api/invoice'

export const useInvoiceStore = defineStore('invoice', () => {
  const invoice = ref(null)
  const invoices = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  function mapInvoice(data) {
    return {
      id: data?.id || '',
      currentStatus: data?.current_status || '',
      purchaseOrder: {
        purchaseOrderNumber: data?.purchase_order?.purchase_order_number || '',
        purchaseOrderDate: data?.purchase_order?.purchase_order_date || '',
        purchaseOrderType: data?.purchase_order?.purchase_order_type || '',
        paymentDue: data?.purchase_order?.payment_due || '',
        discount: data?.purchase_order?.discount || ''
      },
      invoice: {
        invoiceNumber: data?.invoice?.invoice_number || '',
        date: data?.invoice?.date || '',
        termOfPayment: data?.invoice?.term_of_payment || '',
        subTotal: data?.invoice?.sub_total || '',
        grandTotal: data?.invoice?.grand_total || ''
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
      notes: data?.notes || '',
      price: {
        subtotal: data?.price?.subtotal || 0,
        discount: data?.price?.discount || 0,
        ppn: data?.price?.ppn || 0,
        grandTotal: data?.price?.grand_total || 0
      },
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

  async function getAllInvoices(param) {
    isLoading.value = true
    const { data } = await invoiceApi.getAllInvoice(param)
    console.log("data :", data)
    invoices.value = data.data.map(mapInvoice)
    paginationData.value = data
    isLoading.value = false
  }

  async function getInvoice(id) {
    const { data } = await invoiceApi.getInvoiceById(id)
    console.log("data :", data)
    invoice.value = mapInvoice(data)
  }

  async function addInvoice() {
    await invoiceApi.addInvoice(invoice)
  }

  async function setInvoice(selectedInvoice) {
    invoice.value = selectedInvoice
  }

  async function updateInvoice() {
    const { data } = await invoiceApi.updateInvoice(invoice.value.id, invoice)
  }

  async function deleteInvoice(id) {
    await invoiceApi.deleteInvoice(id)
  }

  async function $resetInvoice() {
    invoice.value = mapInvoice()
  }

  return {
    invoice,
    invoices,
    paginationData,
    isLoading,
    getAllInvoices,
    getInvoice,
    setInvoice,
    updateInvoice,
    deleteInvoice,
    addInvoice,
    $resetInvoice
  }
})
