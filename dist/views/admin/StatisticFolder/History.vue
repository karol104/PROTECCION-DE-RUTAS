<template>
  <q-page class="q-pa-md history-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Historial de Estadísticas" description="Revisa el historial de métricas y cambios a lo largo del tiempo." />
          </q-card-section>
        </q-card>

        <div class="filters-wrapper flex items-center justify-between q-my-lg">
          <div class="filters-left flex items-center bg-white">
            <div class="filter-item">
              <q-select
                v-model="filtersData.type"
                :options="typeOptions"
                outlined
                dense
                emit-value
                map-options
                clearable
                label="Tipo de Estadística"
                @update:model-value="handleFilterChange"
              >
                <template #prepend>
                  <q-icon name="category" color="green-8" />
                </template>
              </q-select>
            </div>

            <div class="filter-item">
              <q-select
                v-model="filtersData.period"
                :options="periodOptions"
                outlined
                dense
                emit-value
                map-options
                clearable
                label="Período"
                @update:model-value="handleFilterChange"
              >
                <template #prepend>
                  <q-icon name="date_range" color="green-8" />
                </template>
              </q-select>
            </div>

            <div class="filter-item">
              <q-input
                v-model="filtersData.startDate"
                outlined
                dense
                type="date"
                label="Desde"
                clearable
                @update:model-value="handleFilterChange"
              >
                <template #prepend>
                  <q-icon name="event" color="green-8" />
                </template>
              </q-input>
            </div>

            <div class="filter-item">
              <q-input
                v-model="filtersData.endDate"
                outlined
                dense
                type="date"
                label="Hasta"
                clearable
                @update:model-value="handleFilterChange"
              >
                <template #prepend>
                  <q-icon name="event" color="green-8" />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- Tabla de Estadísticas -->
        <Table
          card
          :rows="rowsStatistics"
          :columns="columns"
          v-model:pagination="pagination"
          :loading="loadingTable"
          row-key="_id"
          @request="handlePaginationRequestHistory"
        >
          <template #body-cell-type="props">
            <q-td :props="props">
              <q-badge
                :color="getTypeColor(props.row.type)"
                class="text-uppercase"
              >
                {{ getTypeLabel(props.row.type) }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-period="props">
            <q-td :props="props">
              <q-badge color="grey-7" class="text-uppercase">
                {{ getPeriodLabel(props.row.period) }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-createdAt="props">
            <q-td :props="props">
              {{ formatDate(props.row.createdAt) }}
            </q-td>
          </template>

          <template #body-cell-options="props">
            <q-td :props="props" class="text-center table-options">
              <ButtonTableOptions
                icon="visibility"
                color="primary"
                tooltip="Ver Detalles"
                @click="openDetailDialogHistory(props.row)"
              />
              <ButtonTableOptions
                icon="download"
                color="secondary"
                tooltip="Descargar"
                @click="downloadStatistic(props.row)"
              />
            </q-td>
          </template>

          <template #no-data>
            <div class="q-pa-md flex flex-center column text-grey full-width">
              <q-icon name="analytics" size="2.5em" color="grey-5" />
              <div class="text-subtitle2 q-mt-sm">
                No hay estadísticas guardadas
              </div>
            </div>
          </template>
        </Table>

        <!-- Modal de Detalles -->
        <Modal v-model="showDetailDialog" width="1000px" max-width="95vw">
          <template #header>
            <div class="modal-header-content">
              <div class="text-h6">Detalle de Estadística</div>
            </div>
          </template>

          <template #body>
            <div v-if="selectedStatistic" class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <div class="text-h6 q-mb-md section-title">Información General</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Tipo:</div>
                    <div class="data-value">{{ getTypeLabel(selectedStatistic.type) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Período:</div>
                    <div class="data-value">{{ getPeriodLabel(selectedStatistic.period) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Fecha Generación:</div>
                    <div class="data-value">{{ formatDate(selectedStatistic.createdAt) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Descripción:</div>
                    <div class="data-value">{{ selectedStatistic.description || '-' }}</div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-h6 q-mb-md section-title">Datos de la Estadística</div>
                <div class="data-grid">
                  <q-scroll-area style="height: 300px;">
                    <pre class="data-preview">{{ JSON.stringify(selectedStatistic.data, null, 2) }}</pre>
                  </q-scroll-area>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <Button
              label="Cerrar"
              custom-class="boton-cerrar"
              @click="showDetailDialog = false"
            />
          </template>
        </Modal>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotifications } from 'src/composables/useNotifications'
import { useEntityManager } from 'src/composables/useEntityManager'
import BackButton from 'src/components/BackButton.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'

// ==================== COMPOSABLE CONFIGURATION ====================

// 1️⃣ Form structure (not used for statistics history in composable, but required)
const getDefaultFormData = () => ({
  _id: '',
  type: '',
  period: '',
  description: '',
  createdAt: '',
  data: null
})

// 2️⃣ API endpoints
const endpoints = {
  list: '/statistics'
}

// 3️⃣ Custom messages
const customMessages = {
  listError: 'Error al obtener historial',
  noData: 'No hay estadísticas guardadas'
}

// 4️⃣ Function to process API response
const processStatisticsHistoryResponse = (response) => {
  const data = response?.data || []
  return {
    data,
    total: data.length
  }
}

// 5️⃣ Initialize composable
const {
  // States
  loadingTable,
  rows,
  showDetailDialog,
  selectedEntity,
  pagination,
  filtersData,
  // Functions for pagination
  handlePaginationRequest,
  // Functions for modals
  openDetailsDialog,
  // Functions for API
  fetchEntities
} = useEntityManager({
  entityName: 'statistic',
  entityNamePlural: 'statistics',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processStatisticsHistoryResponse
})

// ==================== ALIAS WITH STANDARDIZED NAMES ====================
// Following convention: functionName + Entity

// States
const rowsStatistics = rows
const selectedStatistic = selectedEntity

// Functions for modals
const openDetailDialogHistory = openDetailsDialog

// ==================== STATISTICS HISTORY SPECIFIC DATA ====================

// Extend filtersData with custom filters
filtersData.value = {
  ...filtersData.value,
  type: '',
  period: '',
  startDate: '',
  endDate: ''
}

const typeOptions = [
  { label: 'Todas', value: '' },
  { label: 'Generales', value: 'general' },
  { label: 'Aprendices', value: 'apprentices' },
  { label: 'Instructores', value: 'instructors' }
]

const periodOptions = [
  { label: 'Todos', value: '' },
  { label: 'Diario', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensual', value: 'monthly' },
  { label: 'Anual', value: 'yearly' },
  { label: 'Personalizado', value: 'custom' }
]

const columns = [
  { name: 'type', label: 'Tipo', align: 'center', field: 'type' },
  { name: 'period', label: 'Período', align: 'center', field: 'period' },
  { name: 'description', label: 'Descripción', align: 'left', field: 'description' },
  { name: 'createdAt', label: 'Fecha Creación', align: 'center', field: 'createdAt' },
  { name: 'options', label: 'Acciones', align: 'center' }
]

// Functions for pagination
const handlePaginationRequestHistory = (props) => {
  handlePaginationRequest(props)
}

// Functions for filters
const handleFilterChange = () => {
  pagination.value.page = 1
  fetchStatisticsHistory()
}

// ==================== CUSTOM API FUNCTIONS ====================

// Override fetchEntities to include custom filters
const fetchStatisticsHistory = async () => {
  await fetchEntities()
}

const downloadStatistic = row => {
  try {
    const exportData = {
      tipo: getTypeLabel(row.type),
      periodo: getPeriodLabel(row.period),
      descripcion: row.description || '-',
      fechaGeneracion: formatDate(row.createdAt),
      datos: row.data
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `estadistica_${row.type}_${new Date(row.createdAt).getTime()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    success('Estadística descargada correctamente')
  } catch (err) {
    error('Error al descargar la estadística')
  }
}

const getTypeLabel = type => {
  const labels = {
    general: 'Generales',
    apprentices: 'Aprendices',
    instructors: 'Instructores'
  }
  return labels[type] || type
}

const getTypeColor = type => {
  const colors = {
    general: 'primary',
    apprentices: 'secondary',
    instructors: 'accent'
  }
  return colors[type] || 'grey-7'
}

const getPeriodLabel = period => {
  const labels = {
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual',
    yearly: 'Anual',
    custom: 'Personalizado'
  }
  return labels[period] || period || '-'
}

const formatDate = dateString => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ==================== HELPER FUNCTIONS ====================

// ==================== LIFECYCLE HOOKS ====================

onMounted(() => {
  fetchStatisticsHistory()
})
</script>

<style lang="scss" scoped>
.history-page {
  background: #f5f7fb;
  min-height: 100vh;
}

.hero-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%);
}

.filters-wrapper {
  gap: 12px;
  flex-wrap: wrap;
}

.filters-left {
  gap: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
}

.filter-item {
  min-width: 200px;
}

.table-options {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-primary);
  color: white;
  padding: 16px 24px;
}

.detail-item {
  padding: 8px 0;

  strong {
    display: block;
    color: var(--color-primary);
    margin-bottom: 4px;
  }
}

.data-preview {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  overflow-x: auto;
}

@media (max-width: 1024px) {
  .filters-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-left {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .filter-item {
    width: 100%;
    min-width: unset;
  }
}

/* Estilos base para modales */
/* Section Titles */
.section-title {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 1.3rem;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid var(--color-primary);
}

/* Data Grid */
.data-grid {
  display: grid;
  gap: 16px;
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #E0E0E0;
}

.data-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F0F0F0;
}

.data-row:last-child {
  border-bottom: none;
}

.text-weight-bold {
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 600;
}

.data-value {
  color: #34495e;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Formularios en modales */
:deep(.q-form) {
  padding: 0;
}

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

/* File input */
:deep(.q-file .q-field__control) {
  border-radius: 8px;
  border: 2px dashed #E0E0E0;
  transition: all 0.3s ease;
}

:deep(.q-file.q-field--focused .q-field__control) {
  border-color: var(--color-primary);
  background: #F8F9FA;
}

/* Banners */
:deep(.q-banner) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Badges */
:deep(.q-badge) {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.85rem;
}

/* Botones */
:deep(.q-btn.boton-cerrar),
:deep(.q-btn.boton-enviar),
:deep(.q-btn.boton-ingresar) {
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.q-btn.boton-cerrar:hover),
:deep(.q-btn.boton-enviar:hover),
:deep(.q-btn.boton-ingresar:hover) {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

:deep(.q-btn.boton-enviar),
:deep(.q-btn.boton-ingresar) {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
}

:deep(.q-btn.boton-enviar:hover),
:deep(.q-btn.boton-ingresar:hover) {
  background: linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary) 100%);
}

/* Estilos base para modales */
/* Section Titles */
.section-title {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 1.3rem;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid var(--color-primary);
}

/* Data Grid */
.data-grid {
  display: grid;
  gap: 16px;
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #E0E0E0;
}

.data-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F0F0F0;
}

.data-row:last-child {
  border-bottom: none;
}

.text-weight-bold {
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 600;
}

.data-value {
  color: #34495e;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Formularios en modales */
:deep(.q-form) {
  padding: 0;
}

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

/* File input */
:deep(.q-file .q-field__control) {
  border-radius: 8px;
  border: 2px dashed #E0E0E0;
  transition: all 0.3s ease;
}

:deep(.q-file.q-field--focused .q-field__control) {
  border-color: var(--color-primary);
  background: #F8F9FA;
}

/* Banners */
:deep(.q-banner) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Badges */
:deep(.q-badge) {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.85rem;
}

/* Botones */
:deep(.q-btn.boton-cerrar),
:deep(.q-btn.boton-enviar),
:deep(.q-btn.boton-ingresar) {
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.q-btn.boton-cerrar:hover),
:deep(.q-btn.boton-enviar:hover),
:deep(.q-btn.boton-ingresar:hover) {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

:deep(.q-btn.boton-enviar),
:deep(.q-btn.boton-ingresar) {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
}

:deep(.q-btn.boton-enviar:hover),
:deep(.q-btn.boton-ingresar:hover) {
  background: linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary) 100%);
}
</style>