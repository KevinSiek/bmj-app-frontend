import { ref } from 'vue'
import { defineStore } from 'pinia'
import dashboardApi from '@/api/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref(null)
  const isLoading = ref(false)
  const selectedInterval = ref('30d')
  const selectedBranch = ref('ALL')

  function mapDashboardSummary(response) {
    return response?.data ?? null
  }

  async function getDashboardSummary(params = {}) {
    isLoading.value = true

    const interval = params.interval ?? selectedInterval.value ?? '30d'
    const branch = params.branch ?? selectedBranch.value ?? 'ALL'

    selectedInterval.value = interval
    selectedBranch.value = branch ?? 'ALL'

    try {
      const response = await dashboardApi.getSummary({
        interval,
        branch: branch ?? 'ALL',
      })
      summary.value = mapDashboardSummary(response)

      if (summary.value?.filters?.interval) {
        selectedInterval.value = summary.value.filters.interval
      }

      if (summary.value?.filters?.branch) {
        selectedBranch.value =
          summary.value.filters.branch.code ??
          summary.value.filters.branch.name ??
          'ALL'
      }
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error)
      summary.value = null
    } finally {
      isLoading.value = false
    }
  }

  return {
    summary,
    isLoading,
    selectedInterval,
    selectedBranch,
    getDashboardSummary,
  }
})
