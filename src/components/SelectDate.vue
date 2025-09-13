<template>
  <div class="date m-1">
    <div class="month m-3">
      <select class="form-select" v-model="selectedMonth" @change="selectMonth()">
        <option v-for="(month) in months" :key="month" :value="month">
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
import { useDate } from '@/composeable/useDate'
import { updateQuery } from '@/utils/route-util'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const { selectedMonth, selectedYear, yearRange, months } = useDate()

const selectMonth = () => {
  console.log('Select month', selectedMonth.value)
  updateQuery(router, route, { page: 1, month: selectedMonth.value })
}
const selectYear = () => {
  console.log('Select year', selectedYear.value)
  updateQuery(router, route, { page: 1, year: selectedYear.value })
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
    width: 17%;

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

@media only screen and (max-width: 766px) {
  .date {

    .month,
    .year {
      select {
        font-size: 14px;
      }
    }

  }
}
</style>
