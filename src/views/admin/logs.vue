<template>
  <div class="q-pa-md">
    <BackButton />
    
     <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
            title="Registros" 
            description="Registro de Actividades del Sistema."
            />
          </q-card-section>
        </q-card>

    <div class="container">
      <!-- Sección de Estadísticas -->
      <div class="statistics-section q-mb-xl">
        <div class="statistics-grid">
          <StatsCard
            title="POR ACCIÓN"
            :value="statisticsData.byAction.uniqueCount"
            color="var(--color-primary)"
            @click="showActionStats = true"
            class="cursor-pointer"
          />
          <StatsCard
            title="POR MÓDULO"
            :value="statisticsData.byModule.uniqueCount"
            color="var(--color-primary)"
            @click="showModuleStats = true"
            class="cursor-pointer"
          />
          <StatsCard
            title="POR NIVEL"
            :value="statisticsData.byLevel.uniqueCount"
            color="var(--color-primary)"
            @click="showLevelStats = true"
            class="cursor-pointer"
          />
          <StatsCard
            title="POR USUARIO"
            :value="statisticsData.byUser.uniqueCount"
            color="var(--color-primary)"
            @click="showUserStats = true"
            class="cursor-pointer"
          />
        </div>
      </div>

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
        card
        :rows="logs"
        :columns="columns"
        row-key="_id"
        :loanding-table="isLoading"
        :rows-per-page-options="[10, 20, 50]"
        v-model:pagination="pagination"
        @request="handlePaginationRequestLogs"
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
              color="grey"
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
      variant="view"
      width="1200px"
      max-width="98vw"
    >
      <template #header>
        <div class="text-h6">Detalles del Log</div>
      </template>

      <template #body>
        <div v-if="selectedLog" class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md section-title">Información General</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">ID:</div>
                <div class="data-value">{{ selectedLog._id || '-' }}</div>
              </div>
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
                <div class="text-weight-bold">Nivel:</div>
                <div class="data-value">
                  <q-chip
                    :color="getLevelColor(selectedLog.nivel)"
                    text-color="white"
                    dense
                    :label="selectedLog.nivel"
                  />
                </div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Tabla Afectada:</div>
                <div class="data-value">{{ selectedLog.tabla_afectada || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">ID Registro:</div>
                <div class="data-value">{{ selectedLog.registro_afectado || 'null' }}</div>
              </div>
            </div>
          </div>

          <!-- Datos Anteriores -->
          <div v-if="selectedLog.datos_anteriores" class="col-12">
            <div class="text-h6 q-mb-md section-title">Datos Anteriores</div>
            <div class="modal-content-grid">
              <div class="modal-column" style="grid-column: 1 / -1;">
                <div class="data-grid">
                  <div class="data-row">
                    <div class="data-value">
                      <pre class="json-content">{{ formatJSON(selectedLog.datos_anteriores) }}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Datos Nuevos -->
          <div v-if="selectedLog.datos_nuevos" class="col-12">
            <div class="text-h6 q-mb-md section-title">Datos Nuevos</div>
            <div class="modal-content-grid">
              <div class="modal-column" style="grid-column: 1 / -1;">
                <div class="data-grid">
                  <div class="data-row">
                    <div class="data-value">{{ renderNestedData(selectedLog.datos_nuevos) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <Button
          label="Cerrar"
          custom-class="boton-cerrar"
          v-close-popup
        />
      </template>
    </Modal>

    <!-- Modales de Estadísticas -->
    <!-- Modal de Estadísticas por Acción -->
    <Modal v-model="showActionStats" variant="view" width="800px">
      <template #header>
        <div class="text-h6">Estadísticas por Acción</div>
      </template>
      <template #body>
        <div class="statistics-content">
          <div v-for="item in statisticsData.byAction.data" :key="item._id" class="stat-item">
            <div class="stat-label">{{ item._id || 'Sin especificar' }}</div>
            <div class="stat-count">{{ item.count }}</div>
          </div>
        </div>
      </template>
      <template #footer>
        <Button label="Cerrar" custom-class="boton-cerrar" v-close-popup />
      </template>
    </Modal>

    <!-- Modal de Estadísticas por Módulo -->
    <Modal v-model="showModuleStats" variant="view" width="800px">
      <template #header>
        <div class="text-h6">Estadísticas por Módulo</div>
      </template>
      <template #body>
        <div class="statistics-content">
          <div v-for="item in statisticsData.byModule.data" :key="item._id" class="stat-item">
            <div class="stat-label">{{ item._id || 'Sin especificar' }}</div>
            <div class="stat-count">{{ item.count }}</div>
          </div>
        </div>
      </template>
      <template #footer>
        <Button label="Cerrar" custom-class="boton-cerrar" v-close-popup />
      </template>
    </Modal>

    <!-- Modal de Estadísticas por Nivel -->
    <Modal v-model="showLevelStats" variant="view" width="800px">
      <template #header>
        <div class="text-h6">Estadísticas por Nivel</div>
      </template>
      <template #body>
        <div class="statistics-content">
          <div v-for="item in statisticsData.byLevel.data" :key="item._id" class="stat-item">
            <div class="stat-label">{{ item._id || 'Sin especificar' }}</div>
            <div class="stat-count">{{ item.count }}</div>
            <q-chip
              :color="getLevelColor(item._id)"
              text-color="white"
              dense
              :label="item._id"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <Button label="Cerrar" custom-class="boton-cerrar" v-close-popup />
      </template>
    </Modal>

    <!-- Modal de Estadísticas por Usuario -->
    <Modal v-model="showUserStats" variant="view" width="800px">
      <template #header>
        <div class="text-h6">Estadísticas por Usuario</div>
      </template>
      <template #body>
        <div class="statistics-content">
          <div v-for="item in statisticsData.byUser.data" :key="item._id" class="stat-item">
            <div class="stat-label">{{ item._id || 'Sin especificar' }}</div>
            <div class="stat-count">{{ item.count }}</div>
          </div>
        </div>
      </template>
      <template #footer>
        <Button label="Cerrar" custom-class="boton-cerrar" v-close-popup />
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useEntityManager } from 'src/composables/useEntityManager'
import { useNotifications } from 'src/composables/useNotifications'
import { getData } from 'src/services/apiClient'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import StatsCard from 'src/components/cards/StatsCard.vue'

// Composables
const { error } = useNotifications()

// ==================== ESTADÍSTICAS ====================
// Estados para las estadísticas
const statisticsData = ref({
  byAction: { data: [], uniqueCount: 0, totalCount: 0 },
  byModule: { data: [], uniqueCount: 0, totalCount: 0 },
  byLevel: { data: [], uniqueCount: 0, totalCount: 0 },
  byUser: { data: [], uniqueCount: 0, totalCount: 0 }
})

// Estados para los modales
const showActionStats = ref(false)
const showModuleStats = ref(false)
const showLevelStats = ref(false)
const showUserStats = ref(false)

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
  
  // Extract pagination info from backend response
  const paginationInfo = response?.pagination || {}
  const total = paginationInfo.totalRecords || response?.total || response?.totalCount || logsArray.length
  
  return {
    data: logsArray,
    total: total
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

// ==================== ESTADÍSTICAS FUNCTIONS ====================

// Función para obtener estadísticas
const fetchStatistics = async () => {
  try {
    const endpoints = [
      { key: 'byAction', url: '/statistics/logs/by-action' },
      { key: 'byModule', url: '/statistics/logs/by-module' },
      { key: 'byLevel', url: '/statistics/logs/by-level' },
      { key: 'byUser', url: '/statistics/logs/by-user' }
    ]

    const promises = endpoints.map(async ({ key, url }) => {
      try {
        const response = await getData(url)
        
        let data = []
        
        if (response?.data && Array.isArray(response.data)) {
          data = response.data
        } else if (response?.statistics && Array.isArray(response.statistics)) {
          data = response.statistics
        } else if (response?.data?.statistics && Array.isArray(response.data.statistics)) {
          data = response.data.statistics
        } else {
          console.warn(`No statistics found for ${key}`, response)
          data = []
        }
        
        
        const validStats = data.filter(item => {
          const hasId = item._id !== null && item._id !== undefined && item._id !== ''
          const hasCount = typeof item.count === 'number' && item.count > 0
          return hasId && hasCount
        })
        
        const uniqueCount = validStats.length
        const totalCount = validStats.reduce((sum, item) => sum + (item.count || 0), 0)
        
        statisticsData.value[key] = {
          data: validStats,
          uniqueCount: uniqueCount,
          totalCount: totalCount
        }
      } catch (err) {
        console.error(`Error fetching ${key}:`, err)
        statisticsData.value[key] = { data: [], uniqueCount: 0, totalCount: 0 }
      }
    })

    await Promise.all(promises)
  } catch (err) {
    console.error('Error fetching statistics:', err)
    error('Error al cargar las estadísticas')
  }
}

// ==================== LOGS SPECIFIC FUNCTIONS ====================

// Override fetchEntities to add date filters
const fetchLogs = async () => {
  const { page, rowsPerPage } = pagination.value
  loadingTable.value = true
  
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

    const response = await getData(endpoints.list, { params })
    
    // Process response
    const processed = processLogsResponse(response)
    rows.value = processed.data
    pagination.value.rowsNumber = processed.total
    
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
  if (!props?.pagination) return
  pagination.value = {
    page: props.pagination.page,
    rowsPerPage: props.pagination.rowsPerPage,
    rowsNumber: props.pagination.rowsNumber ?? pagination.value.rowsNumber
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

function formatJSON(data) {
  if (!data) return ''
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

function renderNestedData(data, level = 0) {
  if (!data) return ''
  
  const indent = '  '.repeat(level)
  let result = ''
  
  if (typeof data === 'object' && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data)) {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
      result += `${indent}${formattedKey}:\n`
      
      if (typeof value === 'object' && value !== null) {
        result += renderNestedData(value, level + 1)
      } else {
        result += `${indent}  ${value}\n`
      }
      result += '\n'
    }
  } else if (Array.isArray(data)) {
    data.forEach((item, index) => {
      result += `${indent}${index + 1}.\n`
      if (typeof item === 'object' && item !== null) {
        result += renderNestedData(item, level + 1)
      } else {
        result += `${indent}  ${item}\n`
      }
      result += '\n'
    })
  } else {
    result = `${indent}${data}\n`
  }
  
  return result
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
  fetchStatistics()
})
</script>

<style lang="sass" scoped>
.container
  max-width: 1400px
  margin: 0 auto

.filters-wrapper
  gap: 12px
  flex-wrap: wrap
  margin-left: -1px

.filters-left
  gap: 12px
  padding: 12px 16px 12px 8px
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

// Estilo para agregar "Records per page:" antes del selector de paginación
:deep(.q-table__bottom)
  .q-table__control
    &:first-child::before
      content: "Records per page:"
      margin-right: 8px
      font-weight: 500

// Estilos para las celdas de la tabla con responsividad
:deep(.q-table)
  tbody td
    white-space: normal !important
    word-wrap: break-word !important
    word-break: break-word !important
    overflow-wrap: break-word !important
    max-width: 200px
    padding: 16px 12px
    vertical-align: top
    line-height: 1.6

  tbody tr
    height: auto !important
    min-height: 60px

  // Columnas específicas con anchos máximos diferentes
  tbody td:nth-child(1)
    max-width: 180px
    min-width: 140px

  tbody td:nth-child(2)
    max-width: 150px
    min-width: 120px

  tbody td:nth-child(3),
  tbody td:nth-child(4)
    max-width: 140px
    min-width: 100px

  tbody td:nth-child(5)
    max-width: 120px
    min-width: 80px

  tbody td:nth-child(6)
    max-width: 300px
    min-width: 200px

  tbody td:nth-child(7)
    max-width: 100px
    min-width: 80px

  thead th
    white-space: normal !important
    word-wrap: break-word !important
    vertical-align: middle
    padding: 14px 12px
    font-weight: 600

  tbody tr:not(:last-child)
    border-bottom: 1px solid #e0e0e0

// Estilo para el pre tag dentro de data-value
.data-value pre
  margin: 0
  white-space: pre-wrap
  word-break: break-all
  background-color: #f8f9fa
  padding: 8px
  border-radius: 4px
  font-size: 0.85rem

.modal-content-grid
  display: grid
  grid-template-columns: repeat(2, 1fr)
  gap: 24px

.modal-column
  display: flex
  flex-direction: column
  gap: 16px

  .text-weight-bold
    font-size: 0.9rem
    color: #495057
    font-weight: 600

  .data-value
    color: #2c3e50
    word-break: break-word
    white-space: pre-wrap
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
    line-height: 1.6

.json-container
  background-color: #f8f9fa
  border-radius: 8px
  padding: 16px
  border: 1px solid #e0e0e0
  max-height: 400px
  overflow-y: auto

.json-content
  margin: 0
  white-space: pre-wrap
  word-break: break-word
  font-family: 'Courier New', monospace
  font-size: 0.85rem
  line-height: 1.5
  color: #2c3e50

@media (max-width: 768px)
  .modal-content-grid
    grid-template-columns: 1fr

// ==================== ESTILOS PARA ESTADÍSTICAS ====================
.statistics-section
  margin-bottom: 2rem

.statistics-grid
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))
  gap: 1.5rem
  margin-bottom: 1.5rem

@media (max-width: 1200px)
  .statistics-grid
    grid-template-columns: repeat(2, 1fr)
    gap: 1rem

@media (max-width: 768px)
  .statistics-grid
    grid-template-columns: 1fr
    gap: 1rem

@media (max-width: 480px)
  .statistics-grid
    gap: 0.75rem

// Estilos para los modales de estadísticas
.statistics-content
  max-height: 400px
  overflow-y: auto

.stat-item
  display: flex
  justify-content: space-between
  align-items: center
  padding: 12px 16px
  margin-bottom: 8px
  background-color: #f8f9fa
  border-radius: 8px
  border-left: 4px solid var(--color-primary)

.stat-label
  font-weight: 600
  color: #2c3e50
  flex: 1

.stat-count
  font-weight: 700
  color: var(--color-primary)
  font-size: 1.2rem
  margin-right: 8px

// Hacer las cards clicables
.cursor-pointer
  cursor: pointer
  transition: transform 0.2s ease, box-shadow 0.2s ease

  &:hover
    transform: translateY(-2px)
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15)
</style>