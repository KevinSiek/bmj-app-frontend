<template>
  <input type="text" inputmode="numeric" :class="inputClass" :placeholder="placeholder" :disabled="disabled"
    :value="display" @input="onInput" @blur="onBlur">
</template>

<script setup>
import { ref, watch } from 'vue'

/**
 * Currency input that shows the value formatted as "1.250.000" inside an input-group with a static "Rp." prefix.
 * Keeps v-model as a raw Number.
 */
const props = defineProps({
  modelValue: { type: [Number, String], default: 0 },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  inputClass: { type: String, default: 'form-control' },
})

const emit = defineEmits(['update:modelValue'])

const format = (num) => {
  if (num === null || num === undefined || num === '' || isNaN(num)) return ''
  return new Intl.NumberFormat('id-ID').format(Math.round(Number(num) || 0))
}

const display = ref(format(props.modelValue ?? 0))

// Keep the display in sync when the bound value changes from the outside (e.g. form reset,
// loading an existing record, a calculation overwriting the field).
watch(
  () => props.modelValue,
  (val) => {
    const raw = digitsToNumber(display.value)
    // Only reformat if the external value actually differs from what's already shown, so we
    // don't fight the user's caret while they type.
    if (Number(val) !== raw) display.value = format(val === '' || val === null ? '' : val)
  }
)

function digitsToNumber(str) {
  const digits = String(str).replace(/[^\d]/g, '')
  return digits === '' ? 0 : Number(digits)
}

function onInput(e) {
  const num = digitsToNumber(e.target.value)
  display.value = e.target.value === '' ? '' : format(num)
  emit('update:modelValue', e.target.value === '' ? 0 : num)
}

function onBlur() {
  // Normalize on blur (e.g. an empty field shows blank, a value shows the clean format).
  display.value = display.value === '' ? '' : format(digitsToNumber(display.value))
}
</script>

<style scoped>
.custom-currency-input {
  width: 100%;
}

.custom-currency-input .input-group-text {
  color: inherit;
}

.custom-currency-input input::placeholder {
  text-align: right;
}
</style>
