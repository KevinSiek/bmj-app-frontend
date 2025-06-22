
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

export function useDate() {

  const route = useRoute()
  const date = new Date()

  const months = [
    'january', 'february', 'march', 'april',
    'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december'
  ]
  const initMonth = (route.query.month)?.toLowerCase() || months[date.getMonth()]
  const initYear = route.query.year || date.getFullYear()

  const currentYear = ref(date.getFullYear())
  const selectedMonth = ref(initMonth)
  const selectedYear = ref(initYear)
  const yearRange = computed(() => {
    const startYear = 2020;
    const endYear = currentYear;
    return Array.from({ length: endYear.value - startYear + 1 }, (_, i) => startYear + i);
  })

  return {
    months,
    selectedMonth,
    selectedYear,
    yearRange
  }
}
