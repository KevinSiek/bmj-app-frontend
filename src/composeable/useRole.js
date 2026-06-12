
import { common } from '@/config'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

export function useRole() {
  const authStore = useAuthStore()

  const { user } = storeToRefs(authStore)

  const isRole = (role) => computed(() => user.value?.role === role)

  const isRoleDirector = isRole(common.role.director)
  const isRoleMarketing = isRole(common.role.marketing)
  const isRoleFinance = isRole(common.role.finance)
  const isRoleInventoryAdmin = isRole(common.role.inventory_admin)
  const isRoleService = isRole(common.role.service)
  const isRoleInventoryPurchase = isRole(common.role.inventory_purchase)
  const isRoleHeadInventory = isRole(common.role.head_inventory)

  return {
    user,
    isRoleDirector,
    isRoleMarketing,
    isRoleFinance,
    isRoleInventoryAdmin,
    isRoleInventoryPurchase,
    isRoleHeadInventory,
    isRoleService
  }
}
