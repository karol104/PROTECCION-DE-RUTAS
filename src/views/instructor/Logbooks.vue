<template>
  <q-page class="bitacora-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <!-- Header Card -->
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Bitácoras de Aprendices"
              description="Visualiza y gestiona las bitácoras de seguimiento de los aprendices."
            />
          </q-card-section>
        </q-card>

        <!-- Filtros y Acciones -->
        <div class="filters-wrapper q-my-lg">
          <div class="filters-left bg-white">
            <q-input
              v-model="filtersData.search"
              outlined
              dense
              clearable
              debounce="600"
              placeholder="Buscar por aprendiz o ficha"
              @update:model-value="handleSearchChange"
              class="search-input"
            >
              <template #prepend>
                <q-icon name="search" color="green-8" />
              </template>
              <template #append v-if="filtersData.search">
                <q-icon 
                  name="info_outline" 
                  color="grey-6" 
                  size="sm"
                  class="cursor-pointer"
                >
                  <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                    Busca en: Nombre del aprendiz y número de ficha
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="actions-right row items-center q-gutter-sm">
            <Button
              label="Filtros Avanzados"
              icon="tune"
              custom-class="gradient-btn"
              :no-caps="true"
              @click="openAdvancedFilters"
            />
            <Button
              label="Plantillas"
              icon="description"
              custom-class="gradient-btn"
              :no-caps="true"
              @click="openPlantillasDialog"
            />
          </div>
        </div>

        <!-- Tabla de Bitácoras -->
        <Table
          card
          :rows="rows"
          :columns="columnasBitacoras"
          v-model:pagination="pagination"
          :loading="loadingTable"
          row-key="id"
          @request="handlePaginationRequest"
        >
          <!-- Columna de Acciones -->
          <template #body-cell-acciones="props">
            <q-td :props="props" class="text-center table-options">
              <ButtonTableOptions
                icon="visibility"
                color="grey-7"
                tooltip="Ver bitácoras"
                @click="verDetalleBitacora(props.row)"
              />
            </q-td>
          </template>

          <!-- Mensaje cuando no hay datos -->
          <template #no-data>
            <div class="q-pa-md flex flex-center column text-grey full-width">
              <q-icon name="description" size="2.5em" color="grey-5" />
              <div class="text-subtitle2 q-mt-sm">
                No hay bitácoras registradas
              </div>
            </div>
          </template>
        </Table>

        <!-- Modal de Filtros Avanzados -->
        <Modal v-model="showAdvancedFiltersDialog" variant="edit" width="700px" max-width="95vw">
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="tune" class="q-mr-sm" />
                Filtros Avanzados
              </div>
            </div>
          </template>

          <template #body>
            <div class="advanced-filters-grid">
              <q-select
                v-model="advancedFilters.programa"
                :options="programaOptions"
                outlined
                dense
                clearable
                label="Programa de Formación"
                emit-value
                map-options
              />

              <q-select
                v-model="advancedFilters.modalidad"
                :options="modalidadOptions"
                outlined
                dense
                clearable
                label="Modalidad"
                emit-value
                map-options
              />

              <q-input
                v-model="advancedFilters.fechaDesde"
                outlined
                dense
                type="date"
                label="Fecha Desde"
              />

              <q-input
                v-model="advancedFilters.fechaHasta"
                outlined
                dense
                type="date"
                label="Fecha Hasta"
              />

              <q-select
                v-model="advancedFilters.progresoMin"
                :options="progresoOptions"
                outlined
                dense
                clearable
                label="Progreso Mínimo"
                emit-value
                map-options
              />

              <q-select
                v-model="advancedFilters.progresoMax"
                :options="progresoOptions"
                outlined
                dense
                clearable
                label="Progreso Máximo"
                emit-value
                map-options
              />
            </div>
          </template>

          <template #footer>
            <div class="row justify-end q-gutter-sm full-width">
              <Button
                label="Limpiar"
                icon="clear"
                custom-class="boton-cerrar"
                @click="clearAdvancedFilters"
              />
              <Button
                label="Aplicar Filtros"
                icon="check"
                custom-class="gradient-btn"
                @click="applyAdvancedFilters"
              />
            </div>
          </template>
        </Modal>

        <!-- Modal Plantillas -->
        <Modal 
          v-model="showPlantillasDialog" 
          variant="view"
          width="600px"
          max-width="95vw"
        >
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="description" class="q-mr-sm" />
                Plantillas de Bitácora
              </div>
            </div>
          </template>

          <template #body>
            <div class="plantillas-list">
              <q-list>
                <q-item 
                  v-for="plantilla in plantillasList" 
                  :key="plantilla.id"
                  class="plantilla-item"
                  clickable
                  v-ripple
                  @click="descargarPlantilla(plantilla)"
                >
                  <q-item-section avatar>
                    <q-icon :name="plantilla.icon" color="grey-7" size="md" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="plantilla-nombre">{{ plantilla.nombre }}</q-item-label>
                    <q-item-label caption>{{ plantilla.descripcion }}</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="plantilla-actions">
                      <ButtonTableOptions
                        icon="download"
                        color="grey-7"
                        tooltip="Descargar"
                        @click.stop="descargarPlantilla(plantilla)"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
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
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useEntityManager } from 'src/composables/useEntityManager'
import { useNotifications } from 'src/composables/useNotifications'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'

// ==================== COMPOSABLES ====================
const router = useRouter()
const $q = useQuasar()
const { error, success, warning } = useNotifications()

// ==================== CONFIGURACIÓN DEL COMPOSABLE ====================

const getDefaultFormData = () => ({
  _id: '',
  aprendizId: '',
  observaciones: ''
})

const endpoints = {
  list: '/bitacoras/list',
  update: (id) => `/bitacoras/update/${id}`
}

const customMessages = {
  listError: 'Error al listar bitácoras',
  updateSuccess: 'Bitácora actualizada correctamente',
  updateError: 'Error al actualizar bitácora',
  noData: 'No hay bitácoras registradas'
}

// Función para construir parámetros de filtro
const buildBitacorasFilterParams = (filters, baseParams) => {
  const params = { ...baseParams }
  
  // Un solo filtro que busca en aprendiz y ficha
  if (filters.search?.trim()) {
    params.search = filters.search.trim()
    // El backend debe buscar en: nombre del aprendiz y número de ficha
  }
  
  return params
}

const {
  loading,
  loadingTable,
  rows,
  formData,
  filtersData,
  pagination,
  handlePaginationRequest,
  handleSearchChange,
  fetchEntities
} = useEntityManager({
  entityName: 'bitacora',
  entityNamePlural: 'bitacoras',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  buildFilterParams: buildBitacorasFilterParams
})

// ==================== ESTADOS ADICIONALES ====================
const showAdvancedFiltersDialog = ref(false)
const showPlantillasDialog = ref(false)

const advancedFilters = ref({
  programa: null,
  modalidad: null,
  fechaDesde: null,
  fechaHasta: null,
  progresoMin: null,
  progresoMax: null
})

// ==================== DATOS DE EJEMPLO ====================
const bitacorasData = ref([
  {
    id: 1,
    aprendiz: 'Juana María Torres Perez',
    ficha: '2926021'
  },
  {
    id: 2,
    aprendiz: 'María Andréa Rodríguez Ordóñez',
    ficha: '2926021'
  }
])

const plantillasList = ref([
  {
    id: 1,
    nombre: 'Plantilla Bitácora Semanal',
    descripcion: 'Formato estándar para registro semanal',
    icon: 'description'
  },
  {
    id: 2,
    nombre: 'Plantilla Bitácora Mensual',
    descripcion: 'Formato para reporte mensual',
    icon: 'event_note'
  },
  {
    id: 3,
    nombre: 'Guía de Diligenciamiento',
    descripcion: 'Instrucciones para llenar la bitácora',
    icon: 'help_outline'
  }
])

// ==================== OPCIONES PARA FILTROS AVANZADOS ====================
const programaOptions = [
  { label: 'Análisis y Desarrollo de Software', value: 'software' },
  { label: 'Gestión de Redes', value: 'redes' },
  { label: 'Desarrollo Web', value: 'web' },
  { label: 'Diseño Gráfico', value: 'diseño' }
]

const modalidadOptions = [
  { label: 'Proyecto Productivo', value: 'proyecto' },
  { label: 'Pasantía', value: 'pasantia' },
  { label: 'Contrato Aprendizaje', value: 'contrato' },
  { label: 'Monitoria', value: 'monitoria' }
]

const progresoOptions = [
  { label: '0%', value: 0 },
  { label: '25%', value: 25 },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: '100%', value: 100 }
]

// ==================== COLUMNAS DE TABLA ====================
const columnasBitacoras = [
  {
    name: 'aprendiz',
    label: 'Aprendiz',
    field: 'aprendiz',
    align: 'left',
    sortable: true
  },
  {
    name: 'ficha',
    label: 'Ficha',
    field: 'ficha',
    align: 'left',
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Opciones',
    field: 'acciones',
    align: 'center'
  }
]

// ==================== COMPUTED - SOLO PARA DATOS LOCALES ====================
// Este computed solo se usa si trabajas con datos locales
// Si usas el API real, rows ya viene filtrado del backend
const bitacorasFiltradas = computed(() => {
  let resultado = [...bitacorasData.value]
  
  if (filtersData.value.search?.trim()) {
    const needle = filtersData.value.search.toLowerCase().trim()
    resultado = resultado.filter(item => 
      (item.aprendiz && item.aprendiz.toLowerCase().includes(needle)) ||
      (item.ficha && item.ficha.toLowerCase().includes(needle))
    )
  }
  
  return resultado
})

// ==================== FUNCIONES DE FILTROS ====================
const openAdvancedFilters = () => {
  showAdvancedFiltersDialog.value = true
}

const clearAdvancedFilters = () => {
  advancedFilters.value = {
    programa: null,
    modalidad: null,
    fechaDesde: null,
    fechaHasta: null,
    progresoMin: null,
    progresoMax: null
  }
}

const applyAdvancedFilters = () => {
  showAdvancedFiltersDialog.value = false
  success('Filtros aplicados correctamente')
  pagination.value.page = 1
  // En producción con API real: fetchEntities()
  // Por ahora con datos locales no hace nada
}

// ==================== FUNCIONES PRINCIPALES ====================
const verDetalleBitacora = (row) => {
  router.push({
    name: 'InstructorLogbooksDetails',
    params: { id: row.id },
    query: {
      aprendiz: row.aprendiz,
      ficha: row.ficha
    }
  })
}

const openPlantillasDialog = () => {
  showPlantillasDialog.value = true
}

const descargarPlantilla = (plantilla) => {
  success(`Descargando ${plantilla.nombre}`)
  // Aquí iría la lógica real de descarga
}

// ==================== FUNCIONES DE UTILIDAD ====================
const getEstadoColor = (estado) => {
  const colors = {
    'En Progreso': 'orange',
    'Completo': 'green',
    'Pendiente': 'grey',
    'Atrasado': 'red'
  }
  return colors[estado] || 'grey'
}

const getProgresoColor = (progreso) => {
  if (progreso >= 75) return 'green'
  if (progreso >= 50) return 'orange'
  if (progreso >= 25) return 'yellow'
  return 'red'
}

// ==================== LIFECYCLE ====================
onMounted(() => {
  // Inicializar con datos de ejemplo
  rows.value = bitacorasData.value
  
  // En producción con API real, descomentar:
  // fetchEntities()
})

// ==================== WATCHERS ====================
// Solo necesario si usas datos locales
watch(bitacorasFiltradas, (newValue) => {
  rows.value = newValue
}, { immediate: true })
</script>

<style lang="sass" scoped>
.bitacora-page
  background: #f5f7fb
  min-height: 100vh
  padding: 20px

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.filters-wrapper
  display: flex
  gap: 16px
  align-items: center
  justify-content: space-between
  flex-wrap: wrap

.filters-left
  flex: 1
  padding: 12px 16px
  border-radius: 16px
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08)
  min-width: 300px

.search-input
  width: 100%

.actions-right
  gap: 8px
  flex-wrap: wrap

.table-options
  display: flex
  align-items: center
  justify-content: center
  gap: 8px

.aprendiz-cell
  text-align: left

.aprendiz-nombre
  font-weight: 600
  color: #333
  margin-bottom: 2px

.aprendiz-ficha
  font-size: 12px
  color: #666

.programa-cell
  text-align: left

.programa-nombre
  font-weight: 600
  color: #333
  margin-bottom: 2px

.programa-modalidad
  font-size: 12px
  color: #666

.estado-badge
  padding: 6px 12px
  border-radius: 12px
  font-size: 12px
  font-weight: 500

.fecha-cell
  display: flex
  align-items: center
  justify-content: center
  gap: 4px
  font-size: 13px

.progreso-cell
  display: flex
  flex-direction: column
  align-items: center
  gap: 4px

.progreso-text
  font-size: 12px
  font-weight: 600

.advanced-filters-grid
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 16px

.plantillas-list
  max-height: 400px
  overflow-y: auto

.plantilla-item
  border-bottom: 1px solid #e0e0e0
  transition: background-color 0.2s

  &:hover
    background-color: #f5f5f5

  &:last-child
    border-bottom: none

.plantilla-nombre
  font-weight: 600
  color: #333

@media (max-width: 1024px)
  .filters-wrapper
    flex-direction: column
    align-items: stretch

  .filters-left
    width: 100%
    min-width: unset

  .actions-right
    justify-content: flex-start
    width: 100%

@media (max-width: 768px)
  .actions-right
    flex-direction: column
    align-items: stretch

    :deep(.app-button)
      width: 100%

  .advanced-filters-grid
    grid-template-columns: 1fr
    gap: 12px

@media (max-width: 480px)
  .bitacora-page
    padding: 10px

  .filters-left
    padding: 10px 12px

  .progreso-cell
    :deep(.q-linear-progress)
      width: 80px
</style>