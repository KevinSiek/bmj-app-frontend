<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <div class="title-block">
        <h1>Director Dashboard</h1>
        <p v-if="dateRangeText" class="subtitle">
          {{ dateRangeText }} • {{ branchLabel }}
        </p>
      </div>
      <div class="filter-bar">
        <div class="interval-group">
          <button
            v-for="interval in intervalOptions"
            :key="interval.value"
            type="button"
            :class="{ active: selectedInterval === interval.value }"
            @click="selectInterval(interval.value)"
          >
            {{ interval.label }}
          </button>
        </div>
        <label class="branch-select">
          <span>Branch</span>
          <select :value="branchSelection" @change="selectBranch($event.target.value)">
            <option
              v-for="option in branchOptions"
              :key="option.code"
              :value="option.code"
            >
              {{ option.name }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <div v-if="isLoading" class="status-card">
      <p>Loading dashboard data…</p>
    </div>
    <div v-else-if="!summary" class="status-card error">
      <p>Unable to load dashboard data. Please try again or contact support.</p>
    </div>
    <div v-else class="dashboard-content">
      <section class="headline-grid">
        <article
          v-for="headline in headlineCards"
          :key="headline.label"
          class="headline-card card"
        >
          <span class="label">{{ headline.label }}</span>
          <div class="value">{{ formatHeadlineValue(headline) }}</div>
          <span
            v-if="headline.change_percent !== null"
            class="change"
            :class="changeClass(headline.change_percent)"
          >
            {{ formatChange(headline.change_percent) }}
          </span>
        </article>
      </section>

      <section class="sales-section">
        <div class="pipeline card">
          <header>
            <h2>Sales Pipeline</h2>
            <p class="caption">Blends funnel velocity with conversion insights</p>
          </header>
          <div v-if="pipelineMetrics" class="pipeline-metrics">
            <div class="metric">
              <span class="metric-label">Potential Value</span>
              <strong>{{ formatCurrency(pipelineMetrics.potential_value) }}</strong>
            </div>
            <div class="metric">
              <span class="metric-label">Quote → PO</span>
              <strong>{{ formatPercent(pipelineMetrics.quote_to_po_conversion) }}</strong>
              <span
                v-if="pipelineMetrics.quote_to_po_change !== null"
                class="change"
                :class="changeClass(pipelineMetrics.quote_to_po_change)"
              >
                {{ formatChange(pipelineMetrics.quote_to_po_change) }}
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">Paid Invoices</span>
              <div class="invoice-breakdown">
                <span>Current: {{ pipelineMetrics.paid_invoices.current }}</span>
                <span>Prev: {{ pipelineMetrics.paid_invoices.previous }}</span>
              </div>
            </div>
          </div>
          <div class="funnel">
            <div
              v-for="stage in funnelStages"
              :key="stage.stage"
              class="funnel-stage"
            >
              <div class="stage-header">
                <span class="stage-title">{{ stage.stage }}</span>
                <span class="stage-value">{{ stage.count }}</span>
              </div>
              <div class="progress">
                <div
                  class="progress-fill"
                  :style="{ width: funnelWidth(stage.count) }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="leaderboard card">
          <header>
            <h2>Team Leaderboard</h2>
            <p class="caption">Top performers by invoiced revenue</p>
          </header>
          <ol>
            <li v-for="(member, index) in teamLeaderboard" :key="member.name">
              <span class="rank">#{{ index + 1 }}</span>
              <span class="member-name">{{ member.name }}</span>
              <span class="member-value">{{ formatCurrency(member.revenue) }}</span>
            </li>
            <li v-if="teamLeaderboard.length === 0" class="empty-state">
              No paid invoices for the selected interval.
            </li>
          </ol>
        </div>
      </section>

      <section class="finance-section">
        <div class="card chart-card">
          <header>
            <h2>Revenue Trend</h2>
            <p class="caption">Paid vs unpaid invoices by month</p>
          </header>
          <div class="chart-wrapper">
            <LineChart :data="revenueTrendData" :options="revenueTrendOptions" />
          </div>
        </div>

        <div class="card chart-card">
          <header>
            <h2>Branch Mix</h2>
            <p class="caption">Share of revenue by branch</p>
          </header>
          <div class="chart-wrapper doughnut">
            <DoughnutChart :data="branchMixData" :options="branchMixOptions" />
          </div>
          <div v-if="branchMixHighlight" class="branch-highlight">
            <span class="dot" />
            <span>
              {{ branchMixHighlight.name }} contributes
              {{ formatPercent(branchShare(branchMixHighlight)) }} of headline revenue.
            </span>
          </div>
        </div>

        <div class="card chart-card">
          <header>
            <h2>Receivables Aging</h2>
            <p class="caption">Outstanding balance by bucket</p>
          </header>
          <div class="chart-wrapper">
            <BarChart
              :data="receivablesAgingData"
              :options="receivablesAgingOptions"
            />
          </div>
        </div>
      </section>

      <section class="operations card">
        <header>
          <h2>Operations Snapshot</h2>
          <p class="caption">Pipeline blockers and stock alerts</p>
        </header>
        <div class="operations-grid">
          <div
            v-for="item in operationCounters"
            :key="item.key"
            class="operations-tile"
          >
            <span class="tile-label">{{ item.label }}</span>
            <span class="tile-value">{{ item.value }}</span>
          </div>
        </div>
        <div class="inventory-alerts">
          <h3>Inventory Alerts</h3>
          <table>
            <thead>
              <tr>
                <th>Sparepart</th>
                <th>Branch</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="alert in inventoryAlerts" :key="alertKey(alert)">
                <td>{{ alert.sparepart }}</td>
                <td>{{ alert.branch }}</td>
                <td>{{ alert.quantity }}</td>
              </tr>
              <tr v-if="inventoryAlerts.length === 0">
                <td colspan="3">All spareparts are above threshold.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="customers card">
        <header>
          <h2>Top Customers</h2>
          <p class="caption">Last quarter of paid revenue</p>
        </header>
        <ul>
          <li v-for="customer in topCustomers" :key="customer.customer">
            <span>{{ customer.customer }}</span>
            <span class="customer-value">{{ formatCurrency(customer.revenue) }}</span>
          </li>
          <li v-if="topCustomers.length === 0" class="empty-state">
            No customers captured in this window.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Bar as BarChart, Line as LineChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js'
import { useDashboardStore } from '@/stores/dashboard'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
)

const dashboardStore = useDashboardStore()
const { summary, isLoading, selectedInterval, selectedBranch } = storeToRefs(dashboardStore)

const branchSelection = ref(selectedBranch.value ?? 'ALL')

watch(selectedBranch, (value) => {
  if (value) {
    branchSelection.value = value
  }
})

watch(
  summary,
  (value) => {
    if (value?.filters?.branch) {
      branchSelection.value = value.filters.branch.code ?? value.filters.branch.name ?? 'ALL'
    }
  },
  { immediate: true },
)

const intervalOptions = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: 'quarter', label: 'Quarter' },
  { value: '6m', label: '6m' },
  { value: '12m', label: '12m' },
]

const selectInterval = (interval) => {
  if (interval === selectedInterval.value) return
  dashboardStore.getDashboardSummary({ interval, branch: branchSelection.value })
}

const selectBranch = (code) => {
  branchSelection.value = code
  dashboardStore.getDashboardSummary({ interval: selectedInterval.value, branch: code })
}

onMounted(() => {
  if (!summary.value) {
    dashboardStore.getDashboardSummary({
      interval: selectedInterval.value,
      branch: branchSelection.value,
    })
  }
})

const branchOptions = computed(() => {
  const branches = summary.value?.filters?.available_branches ?? []
  const mapped = branches.map((branch) => ({
    code: branch.code ?? branch.name,
    name: branch.name ?? branch.code,
  }))

  const hasAll = mapped.some((branch) => branch.code?.toUpperCase() === 'ALL')
  if (!hasAll) {
    mapped.unshift({ code: 'ALL', name: 'All Branches' })
  }

  return mapped
})

const branchLabel = computed(() => {
  const branch = summary.value?.filters?.branch
  if (!branch) return 'All Branches'
  if (branch.name) return branch.name
  return branch.code ?? 'All Branches'
})

const dateRangeText = computed(() => {
  const range = summary.value?.filters?.date_range
  if (!range) return ''
  return `${formatDate(range.start)} – ${formatDate(range.end)}`
})

const headlineCards = computed(() => summary.value?.headline ?? [])
const pipelineMetrics = computed(() => summary.value?.sales?.pipeline ?? null)
const funnelStages = computed(() => summary.value?.sales?.funnel ?? [])
const teamLeaderboard = computed(() => summary.value?.sales?.team_performance ?? [])
const branchMixHighlight = computed(() =>
  (summary.value?.finance?.branch_mix ?? []).find((branch) => branch.is_selected),
)

const operationCounters = computed(() => {
  const operations = summary.value?.operations ?? {}
  return Object.entries(operations)
    .filter(([key]) => key !== 'inventory_alerts')
    .map(([key, value]) => ({
      key,
      label: toTitleCase(key.replace(/_/g, ' ')),
      value,
    }))
})

const inventoryAlerts = computed(() => summary.value?.operations?.inventory_alerts ?? [])
const topCustomers = computed(() => summary.value?.customers?.top_customers ?? [])

const maxFunnel = computed(() =>
  funnelStages.value.length > 0
    ? Math.max(...funnelStages.value.map((stage) => Number(stage.count) || 0))
    : 0,
)

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0))
const formatPercent = (value) => `${percentFormatter.format(Number(value || 0))}%`

const formatHeadlineValue = (headline) => {
  if (headline.unit === 'IDR') {
    return formatCurrency(headline.value)
  }

  if (headline.unit === '%') {
    return formatPercent(headline.value)
  }

  return `${percentFormatter.format(Number(headline.value || 0))} ${headline.unit ?? ''}`.trim()
}

const formatChange = (value) => {
  const numeric = Number(value || 0)
  const prefix = numeric > 0 ? '+' : ''
  return `${prefix}${percentFormatter.format(numeric)}%`
}

const changeClass = (value) => {
  if (Number(value) > 0) return 'up'
  if (Number(value) < 0) return 'down'
  return 'flat'
}

const funnelWidth = (count) => {
  if (!maxFunnel.value) return '0%'
  return `${Math.max((Number(count) / maxFunnel.value) * 100, 8).toFixed(0)}%`
}

const branchShare = (branch) => {
  const total = (summary.value?.finance?.branch_mix ?? []).reduce(
    (sum, item) => sum + Number(item.revenue || 0),
    0,
  )
  if (!total) return 0
  return (Number(branch.revenue || 0) / total) * 100
}

const alertKey = (alert) => `${alert.sparepart}-${alert.branch}`

const toTitleCase = (value) =>
  value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1))

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    date,
  )
}

const defaultChartData = { labels: [], datasets: [{ data: [] }] }

const revenueTrendData = computed(() => {
  const trend = summary.value?.finance?.revenue_trend ?? []
  if (!trend.length) return defaultChartData

  const labels = trend.map((row) => row.month)
  const paid = trend.map((row) => Number(row.paid || 0))
  const unpaid = trend.map((row) => Number(row.unpaid || 0))

  return {
    labels,
    datasets: [
      {
        label: 'Paid',
        data: paid,
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.25)',
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Unpaid',
        data: unpaid,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.35,
        fill: true,
      },
    ],
  }
})

const branchMixData = computed(() => {
  const mix = summary.value?.finance?.branch_mix ?? []
  if (!mix.length) return defaultChartData

  return {
    labels: mix.map((branch) => branch.code ?? branch.name),
    datasets: [
      {
        label: 'Revenue',
        data: mix.map((branch) => Number(branch.revenue || 0)),
        backgroundColor: ['#34d399', '#60a5fa', '#f97316', '#a855f7', '#facc15', '#f87171'],
      },
    ],
  }
})

const receivablesAgingData = computed(() => {
  const aging = summary.value?.finance?.receivables_aging
  if (!aging) return defaultChartData

  return {
    labels: ['Receivables'],
    datasets: [
      { label: '0-30', data: [Number(aging.current || 0)], backgroundColor: '#34d399' },
      { label: '31-60', data: [Number(aging['31_60_days'] || 0)], backgroundColor: '#facc15' },
      { label: '61-90', data: [Number(aging['61_90_days'] || 0)], backgroundColor: '#fb7185' },
      { label: '90+', data: [Number(aging.over_90_days || 0)], backgroundColor: '#7c3aed' },
    ],
  }
})

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: {},
  },
}

const revenueTrendOptions = computed(() => ({
  ...baseOptions,
  plugins: {
    ...baseOptions.plugins,
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) =>
          new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(
            value,
          ),
      },
    },
  },
}))

const branchMixOptions = computed(() => ({
  ...baseOptions,
  plugins: {
    ...baseOptions.plugins,
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (context) => `${context.label}: ${formatCurrency(context.raw)}`,
      },
    },
  },
}))

const receivablesAgingOptions = computed(() => ({
  ...baseOptions,
  indexAxis: 'y',
  scales: {
    x: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        callback: (value) =>
          new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(
            value,
          ),
      },
    },
    y: { stacked: true },
  },
  plugins: {
    ...baseOptions.plugins,
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`,
      },
    },
  },
}))
</script>

<style scoped lang="scss">
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 2rem 0;
  background-color: #f3f4f6;
  height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.dashboard-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-end;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  h1 {
    margin: 0;
    font-size: 1.75rem;
    color: #111827;
    font-weight: 700;
  }

  .subtitle {
    margin: 0;
    color: #6b7280;
    font-size: 0.95rem;
  }
}

.filter-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  .interval-group {
    display: inline-flex;
    gap: 0.25rem;
    padding: 0.25rem;
    border-radius: 9999px;
    background-color: #e5e7eb;

    button {
      border: none;
      padding: 0.45rem 0.9rem;
      border-radius: 9999px;
      background-color: transparent;
      color: #374151;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease;

      &.active {
        background-color: #111827;
        color: #ffffff;
      }
    }
  }

  .branch-select {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #374151;

    select {
      padding: 0.4rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid #d1d5db;
      background-color: #ffffff;
      color: #111827;
    }
  }
}

.status-card {
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 1rem;
  text-align: center;
  color: #4b5563;
  font-weight: 500;

  &.error {
    color: #b91c1c;
  }
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.headline-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.headline-card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  .label {
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .value {
    font-size: 1.4rem;
    font-weight: 700;
    color: #111827;
  }

  .change {
    font-size: 0.85rem;
    font-weight: 600;
  }

  .change.up {
    color: #059669;
  }

  .change.down {
    color: #dc2626;
  }

  .change.flat {
    color: #6b7280;
  }
}

.sales-section {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.pipeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    h2 {
      margin: 0;
      font-size: 1.1rem;
      color: #111827;
    }

    .caption {
      margin: 0;
      color: #6b7280;
      font-size: 0.85rem;
    }
  }

  .pipeline-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;

    .metric {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      color: #111827;

      .metric-label {
        font-size: 0.85rem;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      strong {
        font-size: 1.15rem;
      }

      .invoice-breakdown {
        display: flex;
        flex-direction: column;
        font-size: 0.85rem;
        color: #374151;
      }
    }
  }

  .funnel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .funnel-stage {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;

      .stage-header {
        display: flex;
        justify-content: space-between;
        font-weight: 600;
        color: #111827;
      }

      .progress {
        width: 100%;
        height: 0.6rem;
        border-radius: 9999px;
        background-color: #e5e7eb;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #1d4ed8, #60a5fa);
      }
    }
  }
}

.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    h2 {
      margin: 0;
      font-size: 1.1rem;
      color: #111827;
    }

    .caption {
      margin: 0;
      font-size: 0.85rem;
      color: #6b7280;
    }
  }

  ol {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;

    li {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 0.75rem;
      align-items: center;
      background-color: #f9fafb;
      padding: 0.6rem 0.9rem;
      border-radius: 0.75rem;

      .rank {
        font-weight: 700;
        color: #2563eb;
      }

      .member-name {
        font-weight: 600;
        color: #111827;
      }

      .member-value {
        font-weight: 600;
        color: #047857;
      }
    }

    .empty-state {
      justify-content: center;
      color: #6b7280;
      background-color: #f3f4f6;
    }
  }
}

.finance-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.chart-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    h2 {
      margin: 0;
      font-size: 1.1rem;
      color: #111827;
    }

    .caption {
      margin: 0;
      font-size: 0.85rem;
      color: #6b7280;
    }
  }

  .chart-wrapper {
    position: relative;
    height: 260px;
  }

  .chart-wrapper.doughnut {
    height: 220px;
  }
}

.branch-highlight {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background-color: #f9fafb;
  color: #374151;
  font-size: 0.9rem;

  .dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 9999px;
    background-color: #111827;
  }
}

.operations {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    h2 {
      margin: 0;
      font-size: 1.1rem;
      color: #111827;
    }

    .caption {
      margin: 0;
      font-size: 0.85rem;
      color: #6b7280;
    }
  }
}

.operations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.operations-tile {
  display: flex;
  flex-direction: column;
  padding: 0.85rem;
  border-radius: 0.85rem;
  background-color: #f9fafb;
  gap: 0.25rem;

  .tile-label {
    color: #6b7280;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tile-value {
    font-size: 1.3rem;
    font-weight: 700;
    color: #111827;
  }
}

.inventory-alerts {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h3 {
    margin: 0;
    font-size: 1rem;
    color: #111827;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    overflow: hidden;
    border-radius: 0.75rem;
    font-size: 0.9rem;

    th,
    td {
      padding: 0.6rem 0.75rem;
      text-align: left;
    }

    thead {
      background-color: #f3f4f6;
      color: #4b5563;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    tbody tr:nth-child(odd) {
      background-color: #f9fafb;
    }

    tbody tr:nth-child(even) {
      background-color: #ffffff;
    }

    tbody tr td:last-child {
      font-weight: 600;
      color: #1f2937;
    }
  }
}

.customers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    h2 {
      margin: 0;
      font-size: 1.1rem;
      color: #111827;
    }

    .caption {
      margin: 0;
      font-size: 0.85rem;
      color: #6b7280;
    }
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;

    li {
      display: flex;
      justify-content: space-between;
      background-color: #f9fafb;
      padding: 0.6rem 0.9rem;
      border-radius: 0.75rem;
      font-weight: 600;
      color: #111827;

      .customer-value {
        color: #2563eb;
      }
    }

    .empty-state {
      justify-content: center;
      color: #6b7280;
      background-color: #f3f4f6;
    }
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 1.25rem;
  }
}
</style>
