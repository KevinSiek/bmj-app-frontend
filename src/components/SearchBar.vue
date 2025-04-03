<template>
  <div class="search-bar">
    <div class="input-group">
      <input type="text" class="form-control input-search" v-model="search" @change="handleInputSearch"
        @keyup="handleInputSearch" placeholder="Search">
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['searched'])

const search = ref('')
const handleInputSearch = () => {
  emit('searched', search.value)
}
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;

  .input-search {
    padding: 0.8vw 4vw 0.8vw 2vw;
  }
}

@media only screen and (max-width: 769px) {
  .search-bar {}
}

@media only screen and (max-width: 767px) {

  /* For mobile phones: */
  .search-bar {
    margin-left: 8%;
  }
}
</style>
