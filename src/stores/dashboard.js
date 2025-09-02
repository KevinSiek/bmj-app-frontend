import { ref } from 'vue'
import { defineStore } from 'pinia'
import dashboardApi from '@/api/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref(null)
  const isLoading = ref(false)
  const selectedInterval = ref('30d'); // Default time interval

  // Maps the new, richer data structure from the API
  function mapDashboardSummary(data) {
    return {
      // KPIs
      revenueInInterval: data?.revenue_in_interval || 0,
      potentialRevenue: data?.potential_revenue || 0,
      openWorkOrders: data?.open_work_orders || 0,
      quoteToPoConversionRate: data?.quote_to_po_conversion_rate || 0,
      grossProfitMargin: data?.gross_profit_margin || 0,

      // Dynamic Chart Data
      salesFunnel: data?.sales_funnel || { quotations: 0, purchase_orders: 0, paid_invoices: 0 },
      revenueByType: data?.revenue_by_type || [],
      salesTeamPerformance: data?.sales_team_performance || [],

      // Static Chart Data
      revenueTrend: data?.revenue_trend || { series: [], target: 0 },
      arAging: data?.ar_aging || { current: 0, '31_60_days': 0, '61_90_days': 0, 'over_90_days': 0 },
      operationalBottlenecks: data?.operational_bottlenecks || {
        pending_quotations: 0, pending_returns: 0, pending_purchase_orders: 0,
        pending_work_orders: 0, pending_back_orders: 0, low_stock_spareparts: 0
      },
      topCustomersByRevenue: data?.top_customers_by_revenue || []
    }
  }

  async function getDashboardSummary(interval = '30d') {
    isLoading.value = true
    selectedInterval.value = interval;
    try {
      const { data } = await dashboardApi.getSummary(interval);
      summary.value = mapDashboardSummary(data);
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
    getDashboardSummary
  }
})
