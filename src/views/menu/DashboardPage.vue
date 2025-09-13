<template>
  <div class="upper">
    <!-- Header: Title and Time Interval Selector -->
    <div class="dashboard-header">
      <h1 class="dashboard-title"></h1>
      <div class="time-interval-selector">
        <button @click="selectInterval('7d')" :class="{ active: selectedInterval === '7d' }">Last 7 Days</button>
        <button @click="selectInterval('30d')" :class="{ active: selectedInterval === '30d' }">Last 30 Days</button>
        <button @click="selectInterval('quarter')" :class="{ active: selectedInterval === 'quarter' }">This
          Quarter</button>
        <button @click="selectInterval('6m')" :class="{ active: selectedInterval === '6m' }">Last 6 Months</button>
        <button @click="selectInterval('12m')" :class="{ active: selectedInterval === '12m' }">Last year</button>
      </div>
    </div>
  </div>
  <div class="contain">
    <!-- Loading and No Data States -->
    <div v-if="isLoading" class="loading-text">
      <p class="text-xl text-gray-600">Loading dashboard data...</p>
    </div>
    <div v-else-if="!summary || Object.keys(summary).length === 0" class="no-data-text">
      <p class="text-xl text-red-600">No data available. Please check the backend connection or data source.</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- KPI Cards -->
      <div class="kpi-container">
        <div class="kpi-card revenue">
          <h3 class="kpi-title">Revenue</h3>
          <p class="kpi-value">{{ formatCurrency(summary.revenueInInterval) }}</p>
        </div>
        <div class="kpi-card potential-revenue">
          <h3 class="kpi-title">Potential Revenue</h3>
          <p class="kpi-value">{{ formatCurrency(summary.potentialRevenue) }}</p>
        </div>
        <div class="kpi-card margin">
          <h3 class="kpi-title">Gross Profit Margin (Parts)</h3>
          <p class="kpi-value">{{ summary.grossProfitMargin.toFixed(1) }}%</p>
        </div>
        <div class="kpi-card quote-to-po">
          <h3 class="kpi-title">Quote-to-PO Conversion</h3>
          <p class="kpi-value">{{ summary.quoteToPoConversionRate.toFixed(1) }}%</p>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-container">
        <!-- Line Chart: 6-Month Revenue Trend -->
        <div class="chart-card md-col-span-3">
          <h2 class="chart-title">6-Month Revenue Trend</h2>
          <div class="chart-wrapper">
            <LineChart :data="revenueTrendData" :options="revenueTrendOptions" />
          </div>
        </div>

        <!-- Dynamic Charts Row -->
        <div class="chart-card">
          <h2 class="chart-title">Sales Funnel</h2>
          <div class="chart-wrapper">
            <BarChart :data="salesFunnelData" :options="salesFunnelOptions" />
          </div>
        </div>
        <div class="chart-card">
          <h2 class="chart-title">Revenue by Type</h2>
          <div class="chart-wrapper">
            <DoughnutChart :data="revenueByTypeData" :options="doughnutOptions" />
          </div>
        </div>
        <div class="chart-card">
          <h2 class="chart-title">Sales Team Performance</h2>
          <div class="chart-wrapper">
            <BarChart :data="salesTeamPerformanceData" :options="salesTeamPerformanceOptions" />
          </div>
        </div>

        <!-- Static Operational Charts Row -->
        <div class="chart-card">
          <h2 class="chart-title">Operational Bottlenecks</h2>
          <div class="chart-wrapper">
            <DoughnutChart :data="operationalBottlenecksData" :options="doughnutOptions" />
          </div>
        </div>
        <div class="chart-card">
          <h2 class="chart-title">Accounts Receivable Aging</h2>
          <div class="chart-wrapper">
            <BarChart :data="arAgingData" :options="arAgingOptions" />
          </div>
        </div>
        <div class="chart-card">
          <h2 class="chart-title">Top 5 Customers (Last 90d)</h2>
          <div class="chart-wrapper">
            <BarChart :data="topCustomersData" :options="topCustomersOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Bar as BarChart, Line as LineChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement } from 'chart.js'
import { useDashboardStore } from '@/stores/dashboard'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement)

const dashboardStore = useDashboardStore()
const { summary, isLoading, selectedInterval } = storeToRefs(dashboardStore)

const selectInterval = (interval) => {
  dashboardStore.getDashboardSummary(interval)
}

onMounted(() => {
  if (!summary.value) {
    selectInterval(selectedInterval.value)
  }
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

// --- Chart Options ---
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' }, tooltip: { /*...*/ } }
};

const revenueTrendOptions = computed(() => ({
  ...baseOptions,
  plugins: { ...baseOptions.plugins, legend: { position: 'bottom' } },
  scales: { y: { beginAtZero: true, ticks: { callback: (value) => `${value / 1000}k` }, title: { display: true, text: 'Amount (IDR)' } } }
}));

const salesFunnelOptions = computed(() => ({
  ...baseOptions,
  scales: { y: { beginAtZero: true, title: { display: true, text: 'Count' } } }
}));

const doughnutOptions = computed(() => ({
  ...baseOptions,
  plugins: { ...baseOptions.plugins, legend: { position: 'right' }, tooltip: { callbacks: { label: (c) => `${c.label}: ${c.raw}` } } }
}));

const horizontalBarOptions = (title) => ({
  ...baseOptions,
  indexAxis: 'y',
  scales: { x: { beginAtZero: true, title: { display: true, text: title } } },
  plugins: { ...baseOptions.plugins, legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${formatCurrency(c.raw)}` } } }
});

const salesTeamPerformanceOptions = computed(() => horizontalBarOptions('Revenue (IDR)'));
const arAgingOptions = computed(() => horizontalBarOptions('Amount (IDR)'));
const topCustomersOptions = computed(() => horizontalBarOptions('Revenue (IDR)'));

// --- Chart Data ---
const defaultChartData = { labels: [], datasets: [{ data: [] }] };

const revenueTrendData = computed(() => {
  if (!summary.value?.revenueTrend?.series) return defaultChartData;
  const { series, target } = summary.value.revenueTrend;
  const labels = series.map(d => d.month);
  return {
    labels,
    datasets: [
      { label: 'Revenue Target', data: Array(labels.length).fill(target), borderColor: 'rgba(255, 206, 86, 1)', borderDash: [5, 5], pointRadius: 0, fill: false },
      { label: 'Paid Invoices', data: series.map(d => d.paid), borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)', fill: true, tension: 0.3 },
      { label: 'Unpaid Invoices', data: series.map(d => d.unpaid), borderColor: 'rgba(255, 99, 132, 1)', fill: false, tension: 0.3 }
    ]
  };
});

const salesFunnelData = computed(() => {
  if (!summary.value?.salesFunnel) return defaultChartData;
  const data = summary.value.salesFunnel;
  return {
    labels: ['Quotations', 'Purchase Orders', 'Paid Invoices'],
    datasets: [{
      label: 'Count',
      data: [data.quotations, data.purchase_orders, data.paid_invoices],
      backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)'],
    }]
  };
});

const revenueByTypeData = computed(() => {
  if (!summary.value?.revenueByType) return defaultChartData;
  const data = summary.value.revenueByType;
  console.log('Revenue by Type Data:', data);
  return {
    labels: data.map(item => item.type),
    datasets: [{
      label: 'Revenue',
      data: data.map(item => item.total_revenue),
      backgroundColor: ['rgba(255, 159, 64, 0.8)', 'rgba(75, 192, 192, 0.8)'],
    }]
  };
});

const salesTeamPerformanceData = computed(() => {
  if (!summary.value?.salesTeamPerformance) return defaultChartData;
  const data = summary.value.salesTeamPerformance;
  return {
    labels: data.map(c => c.fullname),
    datasets: [{ label: 'Revenue', data: data.map(c => c.total_revenue), backgroundColor: 'rgba(153, 102, 255, 0.7)' }]
  };
});

const operationalBottlenecksData = computed(() => {
  if (!summary.value?.operationalBottlenecks) return defaultChartData;
  const data = summary.value.operationalBottlenecks;
  return {
    labels: ['Pending Quotes', 'Pending Returns', 'Pending POs', 'Pending WOs', 'Pending BOs', 'Low Stock'],
    datasets: [{
      label: 'Count',
      data: [
        data.pending_quotations, data.pending_returns, data.pending_purchase_orders,
        data.pending_work_orders, data.pending_back_orders, data.low_stock_spareparts
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)', 'rgba(255, 159, 64, 0.8)', 'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(153, 102, 255, 0.8)'
      ],
    }]
  };
});

const arAgingData = computed(() => {
  if (!summary.value?.arAging) return defaultChartData;
  const data = summary.value.arAging;
  return {
    labels: ['0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'],
    datasets: [{ label: 'Unpaid Amount', data: [data.current, data['31_60_days'], data['61_90_days'], data.over_90_days], backgroundColor: 'rgba(255, 99, 132, 0.7)' }]
  };
});

const topCustomersData = computed(() => {
  if (!summary.value?.topCustomersByRevenue) return defaultChartData;
  const data = summary.value.topCustomersByRevenue;
  return {
    labels: data.map(c => c.company_name),
    datasets: [{ label: 'Revenue', data: data.map(c => c.total_revenue), backgroundColor: 'rgba(54, 162, 235, 0.7)' }]
  };
});
</script>

<style lang="scss" scoped>
.upper {
  margin: 1% 4%;
}

.contain {
  margin: 1% 4%;
  background-color: #f9fafb;
  height: 72vh;
  overflow-y: auto;
}

.loading-text,
.no-data-text {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.dashboard-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    text-align: center;
  }
}

.time-interval-selector {
  display: flex;
  gap: 0.5rem;
  background-color: #e5e7eb;
  padding: 0.25rem;
  border-radius: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    background-color: transparent;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    color: #4b5563;
    transition: all 0.2s ease-in-out;

    &.active {
      background-color: #ffffff;
      color: #1f2937;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }
  }
}

.kpi-container {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  .kpi-card {
    background-color: #ffffff;
    padding: 1.25rem;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.07);
    text-align: left;

    &.revenue,
    &.potential-revenue {
      width: 35%;

      @media (max-width: 768px) {
        width: 100%;
      }
    }

    &.margin,
    &.quote-to-po {
      width: 15%;

      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .kpi-title {
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .kpi-value {
      font-size: 1.875rem;
      font-weight: 700;
      color: #1f2937;
      margin-top: 0.25rem;
    }
  }
}


.charts-container {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 15px;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  >* {
    min-width: 0;
    box-sizing: border-box;
  }
}

.chart-card {
  background-color: #ffffff;
  padding: 1.5rem;
  box-sizing: border-box;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.07);

  &.md-col-span-3 {
    @media (min-width: 1024px) {
      grid-column: span 3 / span 3;
    }
  }

  .chart-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .chart-wrapper {
    position: relative;
    height: 20rem;
  }
}
</style>
