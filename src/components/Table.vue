<template>
  <div v-if="card || boxed" class="tabla-container">
    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      :row-key="rowKey"
      :pagination="internalPagination"
      :loading="loandingTable || loading"
      :rows-per-page-options="rowsPerPageOptions"
      binary-state-sort
      @request="forwardRequest"
      @update:pagination="updatePagination"
    >
      <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>
    </q-table>
  </div>
  <q-table
    v-else
    flat
    bordered
    :rows="rows"
    :columns="columns"
    :row-key="rowKey"
    :pagination="internalPagination"
    :loading="loandingTable || loading"
    :rows-per-page-options="rowsPerPageOptions"
    binary-state-sort
    @request="forwardRequest"
    @update:pagination="updatePagination"
  >
    <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps" />
    </template>
  </q-table>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: () => ({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })
  },
  loandingTable: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  rowKey: {
    type: String,
    default: '_id'
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  card: {
    type: Boolean,
    default: false
  },
  boxed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:pagination', 'request'])

const internalPagination = ref({ 
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

watch(
  () => props.pagination,
  newVal => {
    internalPagination.value = { ...newVal }
  },
  { deep: true, immediate: true }
)

function updatePagination(pagination) {
  internalPagination.value = { ...pagination }
  emit('update:pagination', internalPagination.value)
}

function forwardRequest(evt) {
  emit('request', evt)
}
</script>

<style scoped>
.tabla-container {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 30px auto;
  width: 88%;
  box-sizing: border-box;
  overflow-x: auto;
}

/* ==== CONFIGURACIÓN DE ANCHOS IGUALES ==== */
:deep(.q-table) {
  table-layout: fixed !important;
  width: 100% !important;
}

:deep(.q-table thead tr th),
:deep(.q-table tbody tr td) {
 
 
  white-space: normal !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
  overflow-wrap: break-word !important;
}

/* ==== Encabezado verde ==== */
:deep(.q-table thead tr th) {
  background-color: var(--color-primary) !important;
  color: white !important;
  font-weight: bold;
  text-align: center;
  border: none !important;
  padding: 10px;
  font-size: 14px;
  vertical-align: middle;
}

:deep(.q-table thead tr:first-child th:first-child) {
  border-top-left-radius: 10px;
}

:deep(.q-table thead tr:first-child th:last-child) {
  border-top-right-radius: 10px;
}

/* ==== Cuerpo ==== */
:deep(.q-table tbody tr td) {
  text-align: center;
  border: none !important;
  font-size: 13px;
  padding: 10px 8px;
  vertical-align: middle;
  line-height: 1.4;
}

:deep(.q-table tbody tr) {
  border: none !important;
  box-shadow: none !important;
  height: auto !important;
  min-height: 52px;
}

/* ==== Botones ==== */
:deep(.actions-column .q-btn) {
  margin: 0 5px;
  color: #6b7280;
}

/* Responsive - Tablets */
@media (max-width: 1024px) {
  .tabla-container {
    padding: 14px;
    margin: 16px auto 16px auto;
    width: 88%;
  }
  
  :deep(.q-table thead tr th) {
    padding: 8px 6px;
    font-size: clamp(12px, 1.5vw, 14px);
  }
  
  :deep(.q-table tbody tr td) {
    padding: 8px 6px;
    font-size: clamp(11px, 1.5vw, 13px);
  }
  
  :deep(.actions-column .q-btn) {
    margin: 0 3px;
    padding: 4px;
    color: #6b7280;
  }
}

/* Responsive - Móviles grandes */
@media (max-width: 768px) {
  .tabla-container {
    padding: 12px;
    margin: 14px auto 14px auto;
    width: 88%;
    border-radius: 10px;
  }
  
  :deep(.q-table thead tr th) {
    padding: 8px 4px;
    font-size: clamp(11px, 2vw, 13px);
  }
  
  :deep(.q-table tbody tr td) {
    padding: 8px 4px;
    font-size: clamp(10px, 2vw, 12px);
  }
  
  :deep(.actions-column .q-btn) {
    margin: 0 2px;
    padding: 3px;
    min-width: 32px;
    min-height: 32px;
    color: #6b7280;
  }
  
  :deep(.q-table) {
    font-size: 0.875rem;
  }
}

/* Responsive - Móviles medianos */
@media (max-width: 480px) {
  .tabla-container {
    padding: 10px;
    margin: 12px auto 12px auto;
    width: 88%;
    border-radius: 8px;
  }
  
  :deep(.q-table thead tr th) {
    padding: 6px 3px;
    font-size: clamp(10px, 2.5vw, 12px);
  }
  
  :deep(.q-table tbody tr td) {
    padding: 6px 3px;
    font-size: clamp(9px, 2.5vw, 11px);
  }
  
  :deep(.actions-column) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
  }
  
  :deep(.actions-column .q-btn) {
    margin: 0;
    padding: 4px;
    min-width: 36px;
    min-height: 36px;
    color: #6b7280;
  }
  
  :deep(.q-table) {
    font-size: 0.8rem;
  }
}

/* Responsive - Móviles pequeños */
@media (max-width: 360px) {
  .tabla-container {
    padding: 8px;
    margin: 10px auto 10px auto;
    width: 88%;
  }
  
  :deep(.q-table thead tr th) {
    padding: 5px 2px;
    font-size: clamp(9px, 3vw, 11px);
  }
  
  :deep(.q-table tbody tr td) {
    padding: 5px 2px;
    font-size: clamp(8px, 3vw, 10px);
  }
  
  :deep(.actions-column .q-btn) {
    min-width: 32px;
    min-height: 32px;
    padding: 3px;
    color: #6b7280;
  }
}

/* Responsive - Pantallas muy pequeñas (300px) */
@media (max-width: 300px) {
  .tabla-container {
    padding: 6px;
    margin: 8px auto 8px auto;
    width: 88%;
    border-radius: 6px;
  }
  
  :deep(.q-table thead tr th) {
    padding: 4px 1px;
    font-size: clamp(8px, 3.5vw, 10px);
    line-height: 1.2;
  }
  
  :deep(.q-table tbody tr td) {
    padding: 4px 1px;
    font-size: clamp(7px, 3.5vw, 9px);
    line-height: 1.3;
  }
  
  :deep(.actions-column) {
    flex-direction: column;
    gap: 2px;
  }
  
  :deep(.actions-column .q-btn) {
    min-width: 28px;
    min-height: 28px;
    padding: 2px;
    color: #6b7280;
  }
  
  :deep(.q-table) {
    font-size: 0.75rem;
  }
}

</style>