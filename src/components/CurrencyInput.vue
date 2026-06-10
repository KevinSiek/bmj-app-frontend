<template>
  <input
    type="text"
    inputmode="numeric"
    :class="inputClass"
    :placeholder="placeholder"
    :disabled="disabled"
    :value="display"
    @input="onInput"
    @blur="onBlur"
  >
</template>

<script setup>
import { ref, watch } from 'vue'

/**
 * Currency input that shows the value formatted as "Rp 1.250.000" while the user types, but
 * keeps v-model as a raw Number — so every existing price calculation (quantity * unitPrice,
 * subtotal, ppn, ...) keeps receiving plain numbers and nothing downstream has to change.
 *
 * Indonesian formatting: "." is the thousands separator. We strip every non-digit on input,
 * parse to a Number for v-model, and re-format the digits for the display.
 */
const props = defineProps({
  modelValue: { type: [Number, String], default: 0 },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  inputClass: { type: String, default: 'form-control mt-2' },
})

const emit = defineEmits(['update:modelValue'])

const format = (num) => {
  if (num === null || num === undefined || num === '' || isNaN(num)) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

const display = ref(format(Number(props.modelValue) || 0 ? props.modelValue : ''))

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
