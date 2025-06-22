  <template>
    <div class="item">
      <div class="number">
        {{ number }}
      </div>
      <div class="content">
        <div class="first-section">
          {{ props.firstSection }}
        </div>
        <div v-if="hasSecondSection" class="second-section">
          {{ props.secondSection }}
        </div>
        <div v-if="hasThirdSection" class="third-section">
          {{ props.thirdSection }}
        </div>
        <div v-if="hasStatus" class="status-default" :class="classStatus">
          {{ props.currentStatus }}
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
  firstSection: String || Number,
  secondSection: String || Number,
  thirdSection: String || Number,
  firstSectionKey: String,
  secondSectionKey: String,
  thirdSectionKey: String,
  item: Object,
  bigRow: Boolean,
  wideRow: Boolean,
  color: String,
  currentStatus: String
})

const mainStore = useMainStore()

const { isMobile } = storeToRefs(mainStore)

const hasSecondSection = computed(() => (!!props.secondSection && !isMobile.value) || (!hasStatus.value && isMobile.value))
const hasThirdSection = computed(() => !!props.thirdSection && !isMobile.value)
const hasStatus = computed(() => !!props.currentStatus)

const { status } = common

const statusColour = {
  green: [status.quotation.po, status.po.release, status.work_order.on_progress, status.purchase.approved],
  red: [status.quotation.cancelled, status.purchase.rejected],
  blue: [status.quotation.on_review, status.po.prepare, status.work_order.sparepart_ready, status.purchase.waitReview]
}

const classStatus = computed(() => ({
  'status-big': props.bigRow,
  'status-wide': props.wideRow,
  'red': statusColour.red.some(status => props.currentStatus.includes(status)),
  'blue': statusColour.blue.some(status => props.currentStatus.includes(status)),
  'green': statusColour.green.some(status => props.currentStatus.includes(status))
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
      // text-align: center;
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
      justify-self: flex-end;
    }

    .status-wide {
      width: 25%;
      padding: 1% 1%;
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
