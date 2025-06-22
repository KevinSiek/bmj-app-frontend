
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
  const isRoleInventory = isRole(common.role.inventory)
  const isRoleService = isRole(common.role.service)

  console.log(user.value)
  return {
    user,
    isRoleDirector,
    isRoleMarketing,
    isRoleFinance,
    isRoleInventory,
    isRoleService
  }
}
