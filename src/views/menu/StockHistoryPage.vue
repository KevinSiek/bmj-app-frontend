<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchAutocomplete @searched="handleUpdateSearch" @selected="handleAutocompleteSelect" />
        <select class="form-select filter" v-model="branch" @change="applyFilter('branch', branch)">
          <option value="">All Branches</option>
          <option v-for="(name, key) in common.branch" :key="key" :value="name">
            {{ name }}
          </option>
        </select>
        <select class="form-select filter" v-model="sourceType" @change="applyFilter('source_type', sourceType)">
          <option value="">All Sources</option>
          <option v-for="(type, index) in sourceTypes" :key="index" :value="type">
            {{ type }}
          </option>
        </select>
        <RefreshButton @refresh="fetchStockMovements" />
      </div>
    </div>
    <div class="lower paginate shadow">
      <LoaderOverlaySmall v-if="isLoading" />
      <DateRangeFilter />
      <div>
        <div v-if="stockMovements?.length == 0">
          <div class="no-data-text">
            No stock movements found
          </div>
        </div>
        <div v-else class="list">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Sparepart</th>
                <th>Change</th>
                <th>Source</th>
                <th>Reason</th>
                <th>Branch</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="movement in stockMovements" :key="movement.id">
                <td>{{ formatDate(movement.createdAt) }}</td>
                <td>
                  <div>{{ movement.sparepart.sparepartName || '-' }}</div>
                  <div class="sub">{{ movement.sparepart.sparepartNumber || '-' }}</div>
                </td>
                <td :class="movement.delta >= 0 ? 'delta-in' : 'delta-out'">
                  {{ movement.delta > 0 ? `+${movement.delta}` : movement.delta }}
                </td>
                <td>
                  {{ movement.sourceType }}
                  <router-link v-if="movement.sourceId && getSourceRoute(movement.sourceType, movement.sourceId)"
                    :to="getSourceRoute(movement.sourceType, movement.sourceId)" class="source-link">
                    #{{ movement.sourceId }}
                  </router-link>
                  <span v-else-if="movement.sourceId">
                    #{{ movement.sourceId }}
                  </span>
                </td>
                <td>{{ movement.reason || '-' }}</td>
                <td>{{ movement.branch.name || '-' }}</td>
                <td>{{ movement.employee.name || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <Pagination :first-page="paginationData.from" :last-page="paginationData.last_page" />
  </div>
</template>

<script setup>
import LoaderOverlaySmall from '@/components/LoaderOverlaySmall.vue'
import { common, menuMapping } from '@/config'
import DateRangeFilter from '@/components/DateRangeFilter.vue'
import SearchAutocomplete from '@/components/SearchAutocomplete.vue'
import Pagination from '@/components/Pagination.vue'
import RefreshButton from '@/components/RefreshButton.vue'
import { useRoute, useRouter } from 'vue-router'
import { useStockMovementStore } from '@/stores/stock-movement'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'

const route = useRoute()
const router = useRouter()
const stockMovementStore = useStockMovementStore()
const { selectedMonth, selectedYear } = useDate()

const { stockMovements, paginationData, isLoading } = storeToRefs(stockMovementStore)

const sourceTypes = common.sourceTypes

const branch = ref(route.query.branch || '')
const sourceType = ref(route.query.source_type || '')

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-')

const getSourceRoute = (type, id) => {
  if (!id) return null
  const key = common.sourceRouteMap[type]
  if (!key || !menuMapping[key]) return null
  return { name: menuMapping[key].name, params: { id: id.toString() } }
}

onBeforeMount(() => {
  isLoading.value = true
  stockMovementStore.$resetStockMovements()
})

onMounted(async () => {
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { page: 1, month: selectedMonth.value, year: selectedYear.value })
    return
  }
  fetchStockMovements()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    debounce(() => fetchStockMovements(), 500, 'fetch-stock-movement')
  }
})

const fetchStockMovements = async () => {
  const { page, search, branch: branchQuery, source_type, month, year, filter_type, filter_id, start_date, end_date } = route.query
  stockMovementStore.getStockMovements({ page, search, branch: branchQuery, source_type, month, year, filter_type, filter_id, start_date, end_date })
}

const applyFilter = (key, value) => {
  updateQuery(router, route, { ...route.query, page: 1, [key]: value })
}

const searchStockMovement = (search) => {
  // Clear specific autocomplete filters when doing a text search
  const query = { ...route.query, page: 1, search }
  delete query.filter_type
  delete query.filter_id
  updateQuery(router, route, query)
}

const handleUpdateSearch = (search) => {
  searchStockMovement(search)
}

const handleAutocompleteSelect = ({ filter_type, filter_id }) => {
  // Use specific autocomplete filter instead of text search
  const query = { ...route.query, page: 1, filter_type, filter_id }
  delete query.search
  updateQuery(router, route, query)
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';

$secondary-color: rgb(98, 98, 98);

.upper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
  gap: 20px;

  .filter {
    width: auto;
    min-width: 12vw;
  }
}

.list {
  padding: 0 2vw;

  .table {
    font-size: 14px;

    th {
      font-weight: 600;
    }

    .sub {
      color: $secondary-color;
      font-size: 12px;
    }

    .delta-in {
      color: #1a7f37;
      font-weight: 600;
    }

    .delta-out {
      color: #c0392b;
      font-weight: 600;
    }

    .source-link {
      color: #0d6efd;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
