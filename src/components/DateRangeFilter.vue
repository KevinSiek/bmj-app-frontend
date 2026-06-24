<template>
  <div class="date-range-filter d-flex align-items-center m-1">
    <div class="d-flex align-items-center m-3">
      <label class="me-2 small fw-bold text-muted">From</label>
      <input type="date" class="form-control" v-model="startDate" @change="handleChange" />
    </div>
    <div class="d-flex align-items-center m-3">
      <label class="me-2 small fw-bold text-muted">To</label>
      <input type="date" class="form-control" v-model="endDate" @change="handleChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { updateQuery } from '@/utils/route-util'

const router = useRouter()
const route = useRoute()

const startDate = ref('')
const endDate = ref('')

onMounted(() => {
  // If dates exist in the URL query, use them
  if (route.query.start_date && route.query.end_date) {
    startDate.value = route.query.start_date
    endDate.value = route.query.end_date
  } else {
    // Otherwise default to start and end of current month
    const now = new Date()

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0) // 0th day of next month is last day of current month

    // Format to YYYY-MM-DD for input[type="date"]
    startDate.value = formatDate(firstDay)
    endDate.value = formatDate(lastDay)

    // Also push to route immediately so the initial load is correctly filtered
    updateQuery(router, route, { page: 1, start_date: startDate.value, end_date: endDate.value, month: undefined, year: undefined })
  }
})

const formatDate = (date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const handleChange = () => {
  if (startDate.value && endDate.value) {
    updateQuery(router, route, { page: 1, start_date: startDate.value, end_date: endDate.value, month: undefined, year: undefined })
  }
}
</script>

<style lang="scss" scoped>
.date-range-filter {
  padding-left: 2%;

  input[type="date"] {
    max-width: 150px;
    font-size: 0.9rem;
  }
}

@media only screen and (max-width: 768px) {
  .date-range-filter {
    flex-direction: column;
    align-items: flex-start !important;

    >div {
      margin-bottom: 8px;
    }
  }
}
</style>
