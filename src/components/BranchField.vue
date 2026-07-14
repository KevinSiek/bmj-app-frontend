<template>
  <template v-if="finalShowDirector || finalShowReadonly">
    <select v-if="finalShowDirector" class="form-select mt-2" aria-label="Branch" v-model="branchValue"
      :disabled="disabled">
      <option value="" disabled selected>{{ selectPlaceholder }}</option>
      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>

    <template v-else>
      <input type="text" class="form-control mt-2" :value="branchValue" :placeholder="label" disabled readonly>
      <small class="text-muted">{{ readonlyMessage }}</small>
    </template>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useRole } from '@/composeable/useRole'

const branchValue = defineModel({
  type: String,
  default: ''
})

const { isRoleDirector, isRoleMarketing } = useRole()

const props = defineProps({
  label: {
    type: String,
    default: 'Branch'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showDirector: {
    type: Boolean,
    default: undefined
  },
  showReadonly: {
    type: Boolean,
    default: undefined
  },
  readonlyMessage: {
    type: String,
    default: 'Branch automatically set based on your profile'
  },
  selectPlaceholder: {
    type: String,
    default: 'Select Branch'
  },
  options: {
    type: Array,
    default: () => ['Semarang', 'Jakarta']
  },
  containerClass: {
    type: String,
    default: 'input form-group col-12'
  }
})

const finalShowDirector = computed(() => {
  return props.showDirector !== undefined ? props.showDirector : isRoleDirector.value
})

const finalShowReadonly = computed(() => {
  return props.showReadonly !== undefined ? props.showReadonly : isRoleMarketing.value
})
</script>