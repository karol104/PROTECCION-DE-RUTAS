<template>
  <div class="q-pa-md">
    <BackButton />
    
    <PageHeader title="LOGS" />

    <div class="container">
      <!-- Filtros (Solo Fechas) -->
      <div class="filters-wrapper flex items-center justify-between q-my-lg">
        <div class="filters-left flex items-center bg-white">
          <div class="filter-item">
            <label class="filter-label">FECHA DESDE</label>
            <q-input
              v-model="filtersData.startDate"
              outlined
              dense
              type="date"
              placeholder="DD/MM/AAAA"
              @update:model-value="handleFilterChange"
            >
              <template #prepend>
                <q-icon name="event" color="green-8" />
              </template>
              <template #append>
                <q-icon 
                  v-if="filtersData.startDate"
                  name="close" 
                  class="cursor-pointer" 
                  @click.stop="clearStartDate"
                />
              </template>
            </q-input>
          </div>

          <div class="filter-item">
            <label class="filter-label">FECHA HASTA</label>
            <q-input
              v-model="filtersData.endDate"
              outlined
              dense
              type="date"
              placeholder="DD/MM/AAAA"
              @update:model-value="handleFilterChange"
            >
              <template #prepend>
                <q-icon name="event" color="green-8" />
              </template>
              <template #append>
                <q-icon 
                  v-if="filtersData.endDate"
                  name="close" 
                  class="cursor-pointer" 
                  @click.stop="clearEndDate"
                />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <Table
        :rows="logs"
        :columns="columns"
        row-key="_id"
        :loanding-table="isLoading"
        :rows-per-page-options="[10, 20, 50]"
        v-model:pagination="pagination"
        @request="handlePaginationRequestLogs"
        :pagination="pagination"
      >
        <template #body-cell-nivel="props">
          <q-td :props="props">
            <q-chip
              :color="getLevelColor(props.value)"
              text-color="white"
              dense
              :label="props.value"
            />
          </q-td>
        </template>

        <template #body-cell-opciones="props">
          <q-td :props="props">
            <ButtonTableOptions
              icon="visibility"
              color="primary"
              tooltip="Ver detalles"
              @click="handleViewDetails(props.row)"
            />
          </q-td>
        </template>

        <template #no-data>
          <div class="q-pa-md flex flex-center column text-grey full-width">
            <q-icon name="history" size="2.5em" color="primary" />
            <div class="text-subtitle2 q-mt-sm">
              {{ filtersData.startDate || filtersData.endDate ? 'No se encontraron logs con los filtros aplicados' : 'No hay logs registrados' }}
            </div>
          </div>
        </template>
      </Table>
    </div>

    <!-- Modal de Detalles -->
    <Modal
      v-model="showDetailsModal"
      width="1200px"
      max-width="98vw"
    >
      <template #header>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Detalles del Log</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showDetailsModal = false" />
        </q-card-section>
      </template>

      <template #body>
        <div v-if="selectedLog" class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md section-title">Información General</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Fecha:</div>
                <div class="data-value">{{ formatDate(selectedLog.fecha) }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Usuario:</div>
                <div class="data-value">{{ selectedLog.usuario || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Acción:</div>
                <div class="data-value">{{ selectedLog.accion || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Módulo:</div>
                <div class="data-value">{{ selectedLog.modulo || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">IP:</div>
                <div class="data-value">{{ selectedLog.ip || '-' }}</div>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md section-title">Detalles Técnicos</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Descripción:</div>
                <div class="data-value">{{ selectedLog.descripcion || 'Sin descripción' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Tabla Afectada:</div>
                <div class="data-value">{{ selectedLog.tabla_afectada || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">ID Registro:</div>
                <div class="data-value">{{ selectedLog.registro_afectado || '-' }}</div>
              </div>
              <div v-if="selectedLog.datos_anteriores" class="data-row">
                <div class="text-weight-bold">Datos Anteriores:</div>
                <pre class="data-value">{{ JSON.stringify(selectedLog.datos_anteriores, null, 2) }}</pre>
              </div>
              <div v-if="selectedLog.datos_nuevos" class="data-row">
                <div class="text-weight-bold">Datos Nuevos:</div>
                <pre class="data-value">{{ JSON.stringify(selectedLog.datos_nuevos, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <Button
          label="Cerrar"
          color="negative"
          @click="showDetailsModal = false"
        />
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useEntityManager } from 'src/composables/useEntityManager'
import { useNotifications } from 'src/composables/useNotifications'
import { getData } from 'src/services/apiClient'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'

// Composables
const { error } = useNotifications()

// ==================== COMPOSABLE CONFIGURATION ====================

// 1️⃣ Form structure (not used for logs, but required)
const getDefaultFormData = () => ({
  _id: '',
  fecha: '',
  usuario: '',
  accion: '',
  modulo: '',
  nivel: '',
  descripcion: '',
  tabla_afectada: '',
  registro_afectado: '',
  datos_anteriores: null,
  datos_nuevos: null,
  ip: ''
})

// 2️⃣ API endpoints
const endpoints = {
  list: '/logs/filterLogs'
}

// 3️⃣ Custom messages
const customMessages = {
  listError: 'Error al cargar los logs',
  noData: 'No hay logs registrados'
}

// 4️⃣ Function to process API response
const processLogsResponse = (response) => {
  console.log('Response completa del backend:', response)
  
  const data = response?.data || []
  
  // Map backend data to expected frontend format
  const logsArray = Array.isArray(data) ? data.map(log => ({
    _id: log._id,
    fecha: log.createdAt,
    usuario: log.user,
    accion: log.action,
    modulo: log.module,
    nivel: log.level,
    descripcion: log.description,
    tabla_afectada: log.affectedTable,
    registro_afectado: log.affectedRecordId,
    datos_anteriores: log.previousData,
    datos_nuevos: log.newData,
    ip: log.ipAddress
  })) : []
  
  console.log('Total de registros:', response?.total)
  console.log('Logs procesados:', logsArray.length)
  
  return {
    data: logsArray,
    total: response?.total || response?.totalCount || response?.count || logsArray.length
  }
}

// 6️⃣ Initialize composable
const {
  // States
  loadingTable,
  rows,
  showDetailDialog,
  selectedEntity,
  filtersData,
  pagination,

  // Functions for pagination
  handlePaginationRequest,
  resetPaginationState,

  // Functions for filters
  handleSearchChange,
  handleStatusChange,

  // Functions for modals
  openDetailsDialog,

  // Functions for API
  fetchEntities
} = useEntityManager({
  entityName: 'log',
  entityNamePlural: 'logs',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processLogsResponse
})

// ==================== EXTEND FILTERS FOR LOGS ====================
// Add date fields to filtersData
filtersData.value.startDate = ''
filtersData.value.endDate = ''

// Initialize pagination properly
pagination.value = {
  sortBy: 'fecha',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
}

// ==================== ALIAS WITH STANDARDIZED NAMES ====================

// States
const logs = rows
const selectedLog = selectedEntity
const showDetailsModal = showDetailDialog
const isLoading = loadingTable

// Functions for modals
const openDetailsDialogLogs = openDetailsDialog

// ==================== LOGS SPECIFIC FUNCTIONS ====================

// Override fetchEntities to add date filters
const fetchLogs = async () => {
  const { page, rowsPerPage } = pagination.value
  loadingTable.value = true
  
  console.log('Fetching logs - Página:', page, 'Límite:', rowsPerPage)
  
  try {
    const params = {
      page,
      limit: rowsPerPage
    }

    // Add date filters if they exist
    if (filtersData.value.startDate) {
      params.startDate = filtersData.value.startDate
    }
    if (filtersData.value.endDate) {
      params.endDate = filtersData.value.endDate
    }

    console.log('Parámetros enviados al backend:', params)

    const response = await getData(endpoints.list, { params })
    
    console.log('Respuesta del backend:', response)
    
    // Process response
    const processed = processLogsResponse(response)
    rows.value = processed.data
    pagination.value.rowsNumber = processed.total
    
    console.log('Registros mostrados:', rows.value.length, 'Total:', pagination.value.rowsNumber)
  } catch (err) {
    const message = err?.response?.data?.msg || err?.message || customMessages.listError
    error(message)
    rows.value = []
    pagination.value.rowsNumber = 0
  } finally {
    loadingTable.value = false
  }
}

// Handle date filter changes
const handleFilterChange = () => {
  resetPaginationState()
  fetchLogs()
}

// Clear date filters
const clearStartDate = () => {
  filtersData.value.startDate = ''
  handleFilterChange()
}

const clearEndDate = () => {
  filtersData.value.endDate = ''
  handleFilterChange()
}

// Override handlePaginationRequest to use fetchLogs
const handlePaginationRequestLogs = (props) => {
  console.log('handlePaginationRequestLogs llamado con:', props)
  
  if (!props?.pagination) {
    console.log('No hay props.pagination, usando valores actuales')
    fetchLogs()
    return
  }
  
  const { page, rowsPerPage, rowsNumber } = props.pagination
  
  console.log('Actualizando paginación:', { page, rowsPerPage, rowsNumber })
  
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  if (rowsNumber !== undefined) {
    pagination.value.rowsNumber = rowsNumber
  }
  
  fetchLogs()
}

// ==================== FUNCIONES AUXILIARES ====================

function formatDate(dateString) {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  } catch {
    return '-'
  }
}

function getLevelColor(level) {
  const colors = {
    'INFO': 'blue',
    'WARNING': 'orange',
    'ERROR': 'red',
    'CRITICAL': 'deep-orange',
    'DEBUG': 'grey'
  }
  return colors[level] || 'grey'
}

function handleViewDetails(log) {
  openDetailsDialogLogs(log)
}

// Table Columns
const columns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', sortable: true, align: 'left', format: (val) => formatDate(val) },
  { name: 'usuario', label: 'Usuario', field: 'usuario', sortable: true, align: 'left' },
  { name: 'accion', label: 'Acción', field: 'accion', sortable: true, align: 'center' },
  { name: 'modulo', label: 'Módulo', field: 'modulo', sortable: true, align: 'center' },
  { name: 'nivel', label: 'Nivel', field: 'nivel', sortable: true, align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', sortable: false, align: 'left' },
  { name: 'opciones', label: 'Opciones', align: 'center' }
]

// Lifecycle
onMounted(() => {
  fetchLogs()
})
</script>

<style lang="sass" scoped>
.container
  max-width: 1400px
  margin: 0 auto

.filters-wrapper
  gap: 12px
  flex-wrap: wrap

.filters-left
  gap: 12px
  padding: 12px 16px
  border-radius: 16px
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08)
  flex-wrap: wrap

.filter-item
  min-width: 200px

.filter-item .filter-label
  display: block
  font-weight: 600
  font-size: 14px
  margin-bottom: 8px
  color: #2c3e50
  text-transform: uppercase

// Estilos para los iconos del calendario
:deep(.q-field__prepend .q-icon)
  color: #4CAF50 !important

// Estilo para el icono de limpiar fecha
:deep(.q-field__append .q-icon)
  color: #999
  font-size: 18px
  
  &:hover
    color: #666

// Forzar placeholder en mayúsculas para inputs de fecha
:deep(.q-field__native)
  text-transform: uppercase

:deep(input[type="date"])
  text-transform: uppercase
  
:deep(input[type="date"]::-webkit-datetime-edit-text),
:deep(input[type="date"]::-webkit-datetime-edit-month-field),
:deep(input[type="date"]::-webkit-datetime-edit-day-field),
:deep(input[type="date"]::-webkit-datetime-edit-year-field)
  text-transform: uppercase

.section-title
  color: var(--color-primary)
  font-weight: 600
  font-size: 1.3rem
  margin-bottom: 20px
  padding-left: 8px
  border-left: 4px solid var(--color-primary)

.data-grid
  display: grid
  gap: 16px
  background-color: white
  padding: 20px
  border-radius: 8px
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05)

.data-row
  display: grid
  grid-template-columns: 180px 1fr
  gap: 16px
  align-items: center

.text-weight-bold
  color: #2c3e50
  font-size: 0.95rem
  font-weight: 600

.data-value
  color: #34495e
  font-size: 0.95rem
  word-break: break-all

// Estilo para el pre tag dentro de data-value
.data-value pre
  margin: 0
  white-space: pre-wrap
  word-break: break-all
  background-color: #f8f9fa
  padding: 8px
  border-radius: 4px
  font-size: 0.85rem

@media (max-width: 1024px)
  .filters-wrapper
    flex-direction: column
    align-items: stretch
  
  .filters-left
    width: 100%

@media (max-width: 768px)
  .filter-item
    width: 100%
    min-width: unset
</style>