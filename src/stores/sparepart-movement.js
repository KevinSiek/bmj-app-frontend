import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/sparepart-movement'
import { getAllSparepart } from '@/api/sparepart'

export const useSparepartMovementStore = defineStore('sparepartMovement', () => {
  const list = ref([])
  const detail = ref(null)
  const meta = ref(null)
  const searchedSpareparts = ref([])

  const mapToModel = (item) => {
    return {
      id: item.id,
      movementNumber: item.movement_number,
      employee: {
        id: item.employee?.id,
        name: item.employee?.fullname
      },
      sourceBranch: item.source_branch,
      targetBranch: item.target_branch,
      currentStatus: item.current_status,
      status: item.status,
      reason: item.reason,
      details: item.detail_sparepart_movements?.map((detail) => ({
        id: detail.id,
        sparepart: detail.sparepart,
        quantity: detail.quantity
      })),
      createdAt: item.created_at
    }
  }

  const mapSparepart = (data) => {
    return {
      sparepartId: data?.sparepart_id || data?.id || '',
      slug: data?.slug || '',
      sparepartNumber: data?.sparepart_number || '',
      sparepartName: data?.sparepart_name || '',
      totalUnit: Object.fromEntries(
        (data?.total_unit || []).map(branch => [branch?.name || '', branch?.stock || 0])
      ),
      unitPriceBuy: data?.unit_price_buy || 0,
      unitPriceSell: data?.unit_price_sell || 0,
      unitPriceSeller: (data?.unit_price_seller || []).map(seller => ({
        seller: seller?.seller || '',
        price: seller?.price || 0
      }))
    }
  }

  const fetchList = async (params = {}) => {
    const data = await api.getAll(params)
    list.value = data.data.map(mapToModel)
    meta.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      per_page: data.per_page,
      total: data.total
    }
  }

  const fetchDetail = async (id) => {
    const data = await api.get(id)
    detail.value = mapToModel(data)
  }

  const getSpareparts = async (param) => {
    const { data } = await getAllSparepart(param)
    searchedSpareparts.value = data.data.map(mapSparepart)
  }

  const create = async (payload) => {
    const response = await api.create(payload)
    return response
  }

  const send = async (id) => {
    const response = await api.send(id)
    await fetchDetail(id)
    return response
  }

  const cancel = async (id) => {
    const response = await api.cancel(id)
    await fetchDetail(id)
    return response
  }

  const receive = async (id) => {
    const response = await api.receive(id)
    await fetchDetail(id)
    return response
  }

  const $resetList = () => {
    list.value = []
    meta.value = null
  }

  const $resetDetail = () => {
    detail.value = null
  }

  return {
    list,
    detail,
    meta,
    searchedSpareparts,
    fetchList,
    fetchDetail,
    create,
    getSpareparts,
    send,
    cancel,
    receive,
    $resetList,
    $resetDetail
  }
})
