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

      <q-card-section 
        :class="[
          'modal-body',
          {
            'modal-body--view': variant === 'view',
            'modal-body--edit': variant === 'edit'
          }
        ]"
      >
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
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'view', 'edit'].includes(value)
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
  minWidth: '280px',
  borderRadius: '16px',
  maxHeight: '90vh',
  overflow: 'hidden',
  margin: '8px',
  display: 'flex',
  flexDirection: 'column'
}))
</script>

<style lang="scss" scoped>
:deep(.q-card) {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

:deep(.q-card__section) {
  flex-shrink: 0;
}

:deep(.q-card__actions) {
  flex-shrink: 0;
}
.modal-body {
  padding: 24px;
  overflow-x: hidden;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: var(--color-primary);
  color: white;
  padding: 20px 24px;
  min-height: 60px;
}

.modal-header-content {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  padding-right: 8px;
}

.modal-close-btn {
  color: white !important;
  margin-left: 12px;
  flex-shrink: 0;
  margin-top: -4px;
}  

.modal-footer {
  padding: 16px 24px;
  gap: 12px;
}

/* Estilos específicos para el modal de detalles */
.modal-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  overflow-x: hidden;
  height: fit-content;
}

.modal-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 1.3rem;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid var(--color-primary);
  margin-top: 0;
}

.data-grid {
  display: grid;
  gap: 16px;
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #E0E0E0;
  margin-bottom: 16px;
  overflow-x: hidden;
  min-width: 0;
  height: fit-content;
}

.data-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-bottom: 1px solid #F0F0F0;
  min-width: 0;
}

.data-row:last-child {
  border-bottom: none;
}

.text-weight-bold {
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 2px;
}

.data-value {
  color: #34495e;
  font-size: 0.95rem;
  font-weight: 500;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  line-height: 1.4;
}

/* Estilos para formularios en modales */
:deep(.q-field--filled .q-field__control) {
  border-radius: 8px;
  background: #F8F9FA;
  transition: all 0.3s ease;
}

:deep(.q-field--filled.q-field--focused .q-field__control) {
  background: white;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

:deep(.q-field--filled .q-field__control:before) {
  border-bottom: 2px solid #E0E0E0;
}

:deep(.q-field--filled.q-field--focused .q-field__control:before) {
  border-bottom-color: var(--color-primary);
}

/* Estilos específicos para modal de vista */
.modal-body--view {
  :deep(.modal-content-grid) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  :deep(.modal-column) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  :deep(.section-title) {
    color: var(--color-primary);
    font-weight: 600;
    font-size: 1.3rem;
    margin-bottom: 20px;
    padding-left: 12px;
    border-left: 4px solid var(--color-primary);
    margin-top: 0;
  }

  :deep(.data-grid) {
    display: grid;
    gap: 16px;
    background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #E0E0E0;
    margin-bottom: 16px;
  }

  :deep(.data-row) {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 0;
    border-bottom: 1px solid #F0F0F0;
    min-width: 0;
  }

  :deep(.data-row:last-child) {
    border-bottom: none;
  }

  :deep(.text-weight-bold) {
    color: #2c3e50;
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 2px;
  }

  :deep(.data-value) {
    color: #34495e;
    font-size: 0.95rem;
    font-weight: 500;
    word-wrap: break-word;
    overflow-wrap: anywhere;
    word-break: break-all;
    line-height: 1.4;
    max-width: 100%;
    white-space: normal;
  }
}

/* Estilos específicos para modal de edición */
.modal-body--edit {
  :deep(.modal-content-grid) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  :deep(.modal-column) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  :deep(.section-title) {
    color: var(--color-primary);
    font-weight: 600;
    font-size: 1.3rem;
    margin-bottom: 20px;
    padding-left: 12px;
    border-left: 4px solid var(--color-primary);
    margin-top: 0;
  }

  /* Estilos para formularios en modales de edición */
  :deep(.q-field--filled .q-field__control) {
    border-radius: 8px;
    background: #F8F9FA;
    transition: all 0.3s ease;
  }

  :deep(.q-field--filled.q-field--focused .q-field__control) {
    background: white;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }

  :deep(.q-field--filled .q-field__control:before) {
    border-bottom: 2px solid #E0E0E0;
  }

  :deep(.q-field--filled.q-field--focused .q-field__control:before) {
    border-bottom-color: var(--color-primary);
  }
}

/* Media queries para responsive */
@media (max-width: 1024px) {
  .modal-body--view,
  .modal-body--edit {
    :deep(.modal-content-grid) {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
}

@media (max-width: 768px) {
  .modal-body {
    padding: 18px;
  }

  .modal-header {
    padding: 18px 20px;
    min-height: 56px;
  }

  .modal-header-content {
    font-size: 15px;
    line-height: 1.3;
  }

  .modal-footer {
    flex-direction: column;
    align-items: stretch;
    padding: 16px 20px;
  }

  .modal-body--view {
    :deep(.data-row) {
      gap: 6px;
      padding: 10px 0;
    }

    :deep(.data-row .text-weight-bold) {
      margin-bottom: 4px;
    }

    :deep(.text-weight-bold) {
      font-size: 0.9rem;
    }

    :deep(.data-value) {
      font-size: 0.9rem;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }

    :deep(.section-title) {
      font-size: 1.2rem;
      margin-bottom: 15px;
      padding-left: 10px;
    }

    :deep(.data-grid) {
      gap: 12px;
      padding: 15px;
    }
  }
}

@media (max-width: 480px) {
  .modal-body {
    padding: 16px;
  }

  .modal-header {
    padding: 16px;
    min-height: 52px;
  }

  .modal-header-content {
    font-size: 14px;
    line-height: 1.3;
  }

  .modal-close-btn {
    margin-left: 10px;
    margin-top: -2px;
  }

  .modal-footer {
    padding: 14px 16px;
    gap: 10px;
  }

  .modal-body--view,
  .modal-body--edit {
    :deep(.modal-content-grid) {
      gap: 12px;
    }

    :deep(.section-title) {
      font-size: 1.1rem;
      margin-bottom: 12px;
      padding-left: 8px;
    }

    :deep(.data-grid) {
      padding: 12px;
      gap: 10px;
    }
  }

  .modal-body--view {
    :deep(.data-row) {
      padding: 4px 0;
    }

    :deep(.text-weight-bold) {
      font-size: 0.85rem;
    }

    :deep(.data-value) {
      font-size: 0.85rem;
    }
  }
}

@media (max-width: 360px) {
  .modal-body {
    padding: 14px;
  }

  .modal-header {
    padding: 14px;
    min-height: 48px;
  }

  .modal-header-content {
    font-size: 13px;
    line-height: 1.2;
  }

  .modal-close-btn {
    margin-left: 8px;
    width: 32px;
    height: 32px;
    margin-top: -2px;
  }

  .modal-footer {
    padding: 12px 14px;
    gap: 8px;
  }

  .modal-body--view,
  .modal-body--edit {
    :deep(.section-title) {
      font-size: 1rem;
      margin-bottom: 10px;
      padding-left: 6px;
    }

    :deep(.data-grid) {
      padding: 10px;
      gap: 8px;
    }
  }

  .modal-body--view {
    :deep(.text-weight-bold) {
      font-size: 0.8rem;
    }

    :deep(.data-value) {
      font-size: 0.8rem;
    }
  }

  :deep(.q-field--filled .q-field__control) {
    font-size: 0.9rem;
  }

  :deep(.q-field__label) {
    font-size: 0.85rem;
  }
}

@media (max-width: 320px) {
  .modal-body {
    padding: 12px;
  }

  .modal-header {
    padding: 12px;
    min-height: 44px;
  }

  .modal-header-content {
    font-size: 12px;
    line-height: 1.2;
  }

  .modal-close-btn {
    margin-left: 6px;
    width: 30px;
    height: 30px;
    min-width: 30px;
    margin-top: -2px;
  }

  .modal-footer {
    padding: 10px 12px;
    gap: 6px;
  }

  .modal-body--view,
  .modal-body--edit {
    :deep(.section-title) {
      font-size: 0.95rem;
      margin-bottom: 8px;
      padding-left: 4px;
    }

    :deep(.data-grid) {
      padding: 8px;
      gap: 6px;
    }
  }

  .modal-body--view {
    :deep(.text-weight-bold) {
      font-size: 0.75rem;
    }

    :deep(.data-value) {
      font-size: 0.75rem;
    }
  }

  :deep(.q-field--filled .q-field__control) {
    font-size: 0.85rem;
    min-height: 40px;
  }

  :deep(.q-field__label) {
    font-size: 0.8rem;
  }

  :deep(.q-btn) {
    font-size: 0.85rem;
    padding: 8px 12px;
    min-height: 36px;
  }
}
</style>

