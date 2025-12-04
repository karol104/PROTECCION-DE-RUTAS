<template>
  <q-btn
    dense
    flat
    round
    v-bind="attrs"
    :size="size"
    :color="color"
    :icon="icon"
    :disable="disable"
    @click="handleClick"
  >
    <q-tooltip v-if="tooltip">
      {{ tooltip }}
    </q-tooltip>
  </q-btn>
</template>

<script setup>
import { useAttrs } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: 'visibility'
  },
  size: {
    type: String,
    default: 'sm'
  },
  color: {
    type: String,
    default: 'grey-7'
  },
  tooltip: {
    type: String,
    default: ''
  },
  disable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])
const attrs = useAttrs()

function handleClick(event) {
  if (!props.disable) {
    emit('click', event)
  }
}
</script>

