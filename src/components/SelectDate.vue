<template>
  <div class="date m-1">
    <div class="month m-3">
      <select class="form-select" v-model="selectedMonth" @change="selectMonth()">
        <option v-for="(month, index) in months" :key="index" :value="index">
          {{ month }}
        </option>
      </select>
    </div>
    <div class="year m-3">
      <select class="form-select" v-model="selectedYear" @change="selectYear()">
        <option v-for="n in yearRange" :key="n" :value="n">
          {{ n }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { updateQuery } from '@/utils/route-util'
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const date = new Date()
const months = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
]

const currentYear = ref(date.getFullYear())
const selectedMonth = ref(date.getMonth())
const selectedYear = ref(date.getFullYear())
const yearRange = computed(() => {
  const startYear = 2020;
  const endYear = currentYear;
  return Array.from({ length: endYear.value - startYear + 1 }, (_, i) => startYear + i);
})

const selectMonth = () => {
  console.log('Select month', months[selectedMonth.value])
  updateQuery(router, route, { month: months[selectedMonth.value].toLowerCase() })
}
const selectYear = () => {
  console.log('Select year', selectedYear.value)
  updateQuery(router, route, { year: selectedYear.value })
}
</script>

<style lang="scss" scoped>
.date {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  padding-left: 2%;

  select {
    width: 100%;
    border-color: black;
    text-align: left;
  }

  .month {
    width: 15%;

    select {
      padding-left: 2.2vw;
    }
  }

  .year {
    width: 10%;

    select {
      text-align: center;
    }
  }
}

@media only screen and (max-width: 768px) {
  .date {
    .month {
      width: 35%;
    }

    .year {
      width: 25%;
    }
  }
}

@media only screen and (max-width: 766px) {}
</style>
