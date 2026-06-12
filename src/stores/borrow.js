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

  function mapBorrow(data = {}) {
    return {
      id: data?.id || '',
      borrowNumber: data?.borrow_number || '',
      currentStatus: data?.current_status || '',
      borrowerName: data?.borrower_name || '',
      branch: {
        id: data?.branch?.id || '',
        name: data?.branch?.name || ''
      },
      status: data?.status || [],
      notes: data?.notes || '',
      spareparts: (data?.spareparts || []).map(sparepart => ({
        sparepartId: sparepart?.sparepart_id || '',
        sparepartName: sparepart?.sparepart_name || '',
        sparepartNumber: sparepart?.sparepart_number || '',
        quantity: sparepart?.quantity || 0,
        stockInBranch: sparepart?.stock_in_branch || 0
      }))
    }
  }

  function mapSparepart(data) {
    return {
      sparepartId: data?.sparepart_id || data?.id || '',
      sparepartNumber: data?.sparepart_number || '',
      sparepartName: data?.sparepart_name || ''
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

  async function addBorrow() {
    const payload = {
      borrowerName: borrow.value.borrowerName,
      notes: borrow.value.notes,
      spareparts: borrow.value.spareparts.map(sparepart => ({
        sparepartId: sparepart.sparepartId,
        quantity: Number(sparepart.quantity)
      }))
    }
    await borrowApi.addBorrow(payload)
  }

  async function updateBorrow() {
    const payload = {
      borrowerName: borrow.value.borrowerName,
      notes: borrow.value.notes,
      spareparts: borrow.value.spareparts.map(sparepart => ({
        sparepartId: sparepart.sparepartId,
        quantity: Number(sparepart.quantity)
      }))
    }
    await borrowApi.updateBorrow(borrow.value.id, payload)
  }

  async function getSpareparts(param) {
    const { data } = await getAllSparepart(param)
    searchedSpareparts.value = data.data.map(mapSparepart)
  }

  async function borrowBorrow(id) {
    return borrowApi.borrowBorrow(id)
  }

  async function returnBorrow(id) {
    return borrowApi.returnBorrow(id)
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
    getAllBorrow,
    getBorrow,
    setBorrow,
    addBorrow,
    updateBorrow,
    getSpareparts,
    borrowBorrow,
    returnBorrow,
    cancelBorrow,
    $resetBorrow,
    $resetBorrows
  }
})
