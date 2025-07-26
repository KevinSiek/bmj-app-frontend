import { ref } from 'vue'
import { defineStore } from 'pinia'
import summaryApi from '@/api/summary'

export const useBackOrderStore = defineStore('summary', () => {
  const summaryDirector = ref({})
  const summaryFinance = ref({})
  const summaryMarketing = ref({})
  const summaryInventory = ref({})
  const summaryService = ref({})
  const paginationData = ref({})

  function mapBackOrder (data) {
    return {
      id: data?.id || '',
      date: data?.date || '',
      currentStatus: data?.current_status || '',
      backOrderNumber: data?.back_order_number || '',
      status: data?.status || [],
      purchaseOrder: {
        purchaseOrderNumber: data?.purchase_order?.purchase_order_number || '',
        purchaseOrderDate: data?.purchase_order?.purchase_order_date || '',
        orderType: data?.purchase_order?.order_type || ''
      },
      deliveryOrder: {
        no: data?.delivery_order?.delivery_order_number || '',
        date: data?.delivery_order?.delivery_order_date || '',
        shipMode: data?.delivery_order?.ship_mode || ''
      },
      customer: {
        companyName: data?.customer?.company_name || '',
        address: data?.customer?.address || '',
        city: data?.customer?.city || '',
        province: data?.customer?.province || '',
        office: data?.customer?.office || '',
        urban: data?.customer?.urban || 'x',
        subdistrict: data?.customer?.subdistrict || '',
        postalCode: data?.customer?.postal_code || '',
        npwp: data?.customer?.npwp || '',
        delivery: data?.customer?.delivery || ''
      },
      notes: data?.notes || '',
      spareparts: (data?.spareparts || []).map(sparepart => ({
        sparepartName: sparepart?.sparepart_name || '',
        sparepartNumber: sparepart?.sparepart_number || '',
        unitPriceSell: sparepart?.unit_price_sell || 0,
        totalPrice: sparepart?.total_price || 0,
        totalUnit: sparepart?.total_unit || '',
        order: sparepart?.order || 0,
        deliveryOrder: sparepart?.delivery_order || 0,
        backOrder: sparepart?.back_order || 0
      }))
    }
  }

  async function getSummary (param) {
    // const { data } = await summaryApi.get(param)
    // backOrders.value = data.data.map(mapBackOrder)
    // paginationData.value = data
    // isLoading.value = false
    // console.log(data)
  }

  return {
    summaryDirector,
    summaryFinance,
    summaryInventory,
    summaryMarketing,
    summaryService,
    paginationData,
    getSummary
  }
})
