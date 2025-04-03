<template>
  <nav aria-label="page navigation">
    <ul class="pagination">
      <li class="page-item" :class="{ disabled: currentPage === 1 }" @click="onClickPrevious()">
        <a class="page-link" href="#" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
      <li v-for="page in visiblePage" :key="page" class="page-item" :class="{ active: currentPage === page }"
        @click="onClickPage(page)">
        <a class="page-link" href="#">{{ page }}</a>
      </li>
      <li class="page-item" @click="onClickNext()">
        <a class="page-link" :class="{ disabled: currentPage === props.lastPage }" href="#" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { updateQuery } from '@/utils/route-util'
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  firstPage: Number,
  lastPage: {
    type: Number,
    default: 1
  }
})
const currentPage = ref(1)
const maxVisiblePages = 3
const visiblePage = computed(() => {
  let start = Math.max(1, currentPage.value - 1);
  let end = Math.min(props.lastPage, start + maxVisiblePages - 1);

  // Ensure the last 3 pages are always shown correctly
  if (end === props.lastPage) {
    start = Math.max(1, props.lastPage - maxVisiblePages + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
})

const onClickPrevious = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    updateQuery(router, route, { page: currentPage.value })
  }
}
const onClickNext = () => {
  if (currentPage.value < props.lastPage) {
    currentPage.value++
    updateQuery(router, route, { page: currentPage.value })
  }
}
const onClickPage = (page) => {
  currentPage.value = page
  updateQuery(router, route, { page })
}
</script>

<style lang="scss" scoped>
.pagination {
  display: flex;
  justify-content: center;

  .page-link {
    color: black;
  }

  .active .page-link {
    color: white;
    background-color: black;
  }
}
</style>
