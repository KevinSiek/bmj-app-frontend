<template>
  <div class="refresh-icon">
    <button class="btn btn-light border" @click="$emit('refresh')">
      <i class="bi bi-arrow-clockwise text-dark"></i>
    </button>
  </div>
</template>

<script setup>
defineEmits(['refresh'])
</script>

<style lang="scss" scoped>
.refresh-icon {
  .btn {
    background-color: white;
    padding: 0.6vw 1.6vw;

    i {
      font-size: 20px;
    }
  }
}
</style>
