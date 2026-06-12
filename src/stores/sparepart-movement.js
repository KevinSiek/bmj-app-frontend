import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/sparepart-movement'

export const useSparepartMovementStore = defineStore('sparepartMovement', () => {
  const list = ref([])
  const detail = ref(null)
  const meta = ref(null)

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
    fetchList,
    fetchDetail,
    create,
    send,
    cancel,
    receive,
    $resetList,
    $resetDetail
  }
})
