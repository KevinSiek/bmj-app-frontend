<template>
  <div class="item">
    <div class="number">
      {{ number }}
    </div>
    <div class="content">
      <div class="first-section">
        {{ firstSection }}
      </div>
      <div v-if="hasSecondSection" class="second-section">
        {{ secondSection }}
      </div>
      <div v-if="hasThirdSection" class="third-section">
        {{ thirdSection }}
      </div>
      <div v-if="hasStatus" class="status-default" :class="classStatus">
        {{ item.status }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMainStore } from '@/stores/main'
import { storeToRefs } from 'pinia'
import { common } from '@/config'

const props = defineProps({
  number: Number,
  item: Object,
  bigRow: Boolean,
  color: String
})

const mainStore = useMainStore()

const { isMobile } = storeToRefs(mainStore)

const firstSection = computed(() => props.item?.customer || props.item?.name || props.item?.partName)
const secondSection = computed(() => props.item?.date || props.item?.partNumber)
const thirdSection = computed(() => props.item?.type)

const hasSecondSection = computed(() => (!!secondSection.value && !isMobile.value) || (!hasStatus.value && isMobile.value))
const hasThirdSection = computed(() => !!thirdSection.value && !isMobile.value)
const hasStatus = computed(() => !!props.item?.status)

const { status } = common

const statusColour = {
  green: [status.quotation.po, status.po.release, status.work_order.on_progress],
  red: [status.quotation.cancelled],
  blue: [status.quotation.on_review, status.po.prepare, status.work_order.sparepart_ready]
}

const classStatus = computed(() => ({
  'status-default': !props.bigRow,
  'status-big': props.bigRow,
  'red': statusColour.red.includes(props.item.status),
  'blue': statusColour.blue.includes(props.item.status),
  'green': statusColour.green.includes(props.item.status),
}))

</script>

<style lang="scss" scoped>
$primary-color: black;

.item {
  display: flex;
  border: 1px solid $primary-color;
  border-radius: 5px;
  padding: 0.8% 3%;
  margin: 0% 4% 1.5% 4%;
  align-items: center;
  min-height: 7.5vh;

  .number {
    width: 5%;
  }

  .content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .first-section {
      width: 40%;
      font-size: 16px;
    }

    .second-section {
      width: 20%;
      color: rgb(164, 164, 164);
    }

    .third-section {
      width: 15%;
    }

    .status-default {
      width: 20%;
      text-align: center;
      background-color: $primary-color;
      color: white;
      border-radius: 5px;
      padding: 1% 5%;

    }

    .status-big {
      width: 25%;
      text-align: center;
      background-color: $primary-color;
      color: white;
      border-radius: 5px;
      padding: 1% 5%;
      justify-self: flex-end;
    }

    .green {
      background-color: #00BC03;
    }

    .blue {
      background-color: #27487C;
    }

    .red {
      background-color: #D70000;
    }
  }
}

@media only screen and (max-width: 768px) {
  .item {
    .content {
      .customer {
        width: 55%;
      }

      .date {
        width: 35%;
      }

      .status-default {
        width: 35%;
      }

      .status-big {
        width: 40%;
      }
    }
  }
}

@media only screen and (max-width: 766px) {}
</style>
