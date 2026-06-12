<template>
  <div class="menu-item-content w-100 h-100 shadow">
    <div class="title w-100">
      <div class="fw-bold fs-5">Stock Transfer</div>
    </div>
    <div class="information w-100 h-100">
      <div class="d-flex justify-content-center align-items-center w-100 h-100">
        <i class="bi bi-arrow-left-right fs-1 text-muted"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.menu-item-content {
  border-radius: 15px;
  background-color: white;
  display: flex;
  flex-direction: column;
  padding: 10px;

  .title {
    text-align: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }
}
</style>
