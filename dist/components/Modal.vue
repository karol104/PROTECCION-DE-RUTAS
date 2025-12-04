<template>
  <q-dialog
    v-model="internalValue"
    :persistent="persistent"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card :style="cardStyles">
      <q-card-section class="modal-header" v-if="$slots.header">
        <div class="modal-header-content">
          <slot name="header" />
        </div>
        <q-btn 
          flat 
          round 
          dense 
          icon="close" 
          color="white"
          @click="internalValue = false"
          class="modal-close-btn"
        />
      </q-card-section>

      <q-card-section class="modal-body">
        <slot name="body" />
      </q-card-section>

      <q-separator v-if="$slots.footer" />

      <q-card-actions align="right" class="modal-footer" v-if="$slots.footer">
        <slot name="footer" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  width: {
    type: [Number, String],
    default: '600px'
  },
  maxWidth: {
    type: [Number, String],
    default: '95vw'
  },
  persistent: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  value => {
    internalValue.value = value
  }
)

watch(internalValue, value => {
  emit('update:modelValue', value)
})

const cardStyles = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  maxWidth: typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
  borderRadius: '16px',
  overflow: 'hidden'
}))
</script>

<style scoped>
.modal-body {
  padding: 24px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-primary);
  color: white;
  padding: 16px 24px;
  white-space: nowrap;
}

.modal-header-content {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
}

.modal-close-btn {
  color: white !important;
  margin-left: 20px;
}  

.modal-footer {
  padding: 16px 24px;
  gap: 12px;
}

@media (max-width: 768px) {
  .modal-body {
    padding: 18px;
  }

  .modal-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

