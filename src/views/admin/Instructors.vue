<template>
  <q-page class="q-pa-md instructors-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Gestión y Control de Instructores"
              description="Administra perfiles, horarios y asignaciones de instructores." 
            />
          </q-card-section>
        </q-card>

        <div class="statistics-section">
          <div class="statistics-grid">
            <StatsCard
              title="CARGA DE TRABAJO"
              :value="loadingStats ? null : (statsData.workload?.data?.length || 0)"
              subtitle="Instructores con carga"
              color="var(--color-primary)"
              icon="schedule"
              :loading="loadingStats"
              class="cursor-pointer"
              @click="showWorkloadStats = true"
            />
            
            <StatsCard
              title="CAPACIDAD VS TRABAJADO"
              :value="loadingStats ? null : statsData.capacityVsWorked?.total || 0"
              subtitle="Total de instructores"
              color="var(--color-primary)"
              icon="trending_up"
              :loading="loadingStats"
              class="cursor-pointer"
              @click="showCapacityVsWorkedStats = true"
            />
            
            <StatsCard
              title="ÁREAS TEMÁTICAS"
              :value="loadingStats ? null : (statsData.byThematicArea?.length || 0)"
              subtitle="Áreas diferentes"
              color="var(--color-primary)"
              icon="category"
              :loading="loadingStats"
              class="cursor-pointer"
              @click="showThematicAreaStats = true"
            />
            
            <StatsCard
              title="TIPOS DE VINCULACIÓN"
              :value="loadingStats ? null : (statsData.byBindingType?.length || 0)"
              subtitle="Tipos diferentes"
              color="var(--color-primary)"
              icon="link"
              :loading="loadingStats"
              class="cursor-pointer"
              @click="showBindingTypeStats = true"
            />
            
            <StatsCard
              title="PROMEDIO DE HORAS"
              :value="loadingStats ? null : Math.round(statsData.hoursDistribution?.avgWorkedHours || 0)"
              subtitle="Trabajadas por instructor"
              color="var(--color-primary)"
              icon="access_time"
              :loading="loadingStats"
              class="cursor-pointer"
              @click="showHoursDistributionStats = true"
            />
            
            <StatsCard
              title="TOP INSTRUCTORES"
              :value="loadingStats ? null : (statsData.topByHours?.length || 0)"
              subtitle="Con más horas"
              color="var(--color-primary)"
              icon="emoji_events"
              :loading="loadingStats"
              class="cursor-pointer"
              @click="showTopInstructorsStats = true"
            />
          </div>
        </div>

        <div class="filters-wrapper flex items-center q-mb-lg">
          <div class="filters-left flex items-center bg-white">
            <div class="filter-item search">
              <q-input
                v-model="filtersData.search"
                outlined
                dense
                clearable
                debounce="600"
                placeholder="Buscar por Documento, Nombre, Email y Programa"
                @update:model-value="handleSearchChange"
              >
                <template #prepend>
                  <q-icon name="search" color="green-8" />
                </template>
              </q-input>
            </div>

            <div class="filter-item status">
              <q-select
                v-model="filtersData.status"
                :options="statusAvailable"
                outlined
                dense
                emit-value
                map-options
                clearable
                label="Filtrar por Estado"
                @update:model-value="handleStatusChange"
              >
                <template #prepend>
                  <q-icon name="filter_list" color="green-8" />
                </template>
              </q-select>
            </div>
          </div>
        </div>

        <Table
          card
          :rows="rowsInstructors"
          :columns="columns"
          v-model:pagination="pagination"
          :loanding-table="loadingTable"
          row-key="_id"
          @request="handlePaginationRequest"
        >
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)">
                {{ getStatusLabel(props.row.status) }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-acciones="props">
            <q-td :props="props" class="text-center table-options">
              <ButtonTableOptions
                icon="visibility"
                color="grey"
                tooltip="Ver"
                @click="openDetailsDialogInstructors(props.row)"
              />
            </q-td>
          </template>

          <template #no-data>
            <div class="q-pa-md flex flex-center column text-grey full-width">
              <q-icon name="group" size="2.5em" color="positive" />
              <div class="text-subtitle2 q-mt-sm">
                No hay instructores registrados
              </div>
            </div>
          </template>
        </Table>

        <Modal v-model="showDetailDialog" variant="view" width="1100px" max-width="98vw">
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="person" class="q-mr-sm" />
                {{ selectedInstructors?.name || 'Instructor' }}
              </div>
            </div>
          </template>

          <template #body>
            <div v-if="selectedInstructors" class="modal-content-grid">
              <div class="modal-column">
                <div class="section-title">Información Personal</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Nombre:</div>
                    <div class="data-value">{{ selectedInstructors?.name || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Documento:</div>
                    <div class="data-value">{{ selectedInstructors?.numdocument || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Email:</div>
                    <div class="data-value">{{ selectedInstructors?.email || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Teléfono:</div>
                    <div class="data-value">{{ selectedInstructors?.phone || '-' }}</div>
                  </div>
                </div>
              </div>

              <div class="modal-column">
                <div class="section-title">Información Académica</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Programa:</div>
                    <div class="data-value">{{ selectedInstructors?.knowledge || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Estado:</div>
                    <div class="data-value">
                      <q-badge :color="getStatusColor(selectedInstructors?.status)">
                        {{ getStatusLabel(selectedInstructors?.status) }}
                      </q-badge>
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

        <Modal v-model="showCapacityVsWorkedStats" variant="view" width="800px" max-width="98vw">
          <template #header>
            <div class="text-h6">Capacidad vs Horas Trabajadas</div>
          </template>
          <template #body>
            <div v-if="statsData.capacityVsWorked" class="capacity-content">
              <div class="capacity-summary">
                <div class="summary-item total-item">
                  <q-icon name="groups" size="32px" color="primary" />
                  <div class="summary-info">
                    <div class="summary-label">Total de Instructores</div>
                    <div class="summary-value primary-text">{{ statsData.capacityVsWorked.total || 0 }}</div>
                  </div>
                </div>
              </div>

              <q-separator class="q-my-lg" />

              <div class="capacity-categories">
                <div class="category-item overloaded">
                  <div class="category-header">
                    <q-icon name="trending_up" size="28px" />
                    <div class="category-title">Sobrecargados</div>
                  </div>
                  <div class="category-body">
                    <div class="category-value">{{ statsData.capacityVsWorked.overloaded || 0 }}</div>
                    <div class="category-description">Instructores con más horas trabajadas que su capacidad</div>
                    <div class="category-percentage">
                      {{ ((statsData.capacityVsWorked.overloaded / statsData.capacityVsWorked.total) * 100).toFixed(1) }}%
                    </div>
                  </div>
                  <q-linear-progress 
                    :value="statsData.capacityVsWorked.overloaded / statsData.capacityVsWorked.total"
                    color="negative"
                    size="8px"
                  />
                </div>

                <div class="category-item optimal">
                  <div class="category-header">
                    <q-icon name="verified" size="28px" />
                    <div class="category-title">Óptimo</div>
                  </div>
                  <div class="category-body">
                    <div class="category-value">{{ statsData.capacityVsWorked.optimal || 0 }}</div>
                    <div class="category-description">Instructores trabajando dentro de su capacidad óptima</div>
                    <div class="category-percentage">
                      {{ ((statsData.capacityVsWorked.optimal / statsData.capacityVsWorked.total) * 100).toFixed(1) }}%
                    </div>
                  </div>
                  <q-linear-progress 
                    :value="statsData.capacityVsWorked.optimal / statsData.capacityVsWorked.total"
                    color="positive"
                    size="8px"
                  />
                </div>

                <div class="category-item underutilized">
                  <div class="category-header">
                    <q-icon name="trending_down" size="28px" />
                    <div class="category-title">Sub-utilizados</div>
                  </div>
                  <div class="category-body">
                    <div class="category-value">{{ statsData.capacityVsWorked.underutilized || 0 }}</div>
                    <div class="category-description">Instructores con capacidad disponible</div>
                    <div class="category-percentage">
                      {{ ((statsData.capacityVsWorked.underutilized / statsData.capacityVsWorked.total) * 100).toFixed(1) }}%
                    </div>
                  </div>
                  <q-linear-progress 
                    :value="statsData.capacityVsWorked.underutilized / statsData.capacityVsWorked.total"
                    color="warning"
                    size="8px"
                  />
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <Button label="Cerrar" custom-class="boton-cerrar" v-close-popup />
          </template>
        </Modal>

        <Modal v-model="showHoursDistributionStats" variant="view" width="900px" max-width="98vw">
          <template #header>
            <div class="text-h6">Distribución de Horas - Estadísticas Generales</div>
          </template>
          <template #body>
            <div v-if="statsData.hoursDistribution" class="distribution-content">
              <div class="distribution-section">
                <div class="section-title-dist">
                  <q-icon name="schedule" size="24px" color="primary" class="q-mr-sm" />
                  <span>Capacidad Total del Sistema</span>
                </div>
                <div class="distribution-grid">
                  <div class="distribution-item">
                    <div class="dist-label">Total de Horas de Capacidad</div>
                    <div class="dist-value primary-value">
                      {{ statsData.hoursDistribution.totalCapacityHours?.toLocaleString() || 0 }} hrs
                    </div>
                  </div>
                  <div class="distribution-item">
                    <div class="dist-label">Promedio de Capacidad por Instructor</div>
                    <div class="dist-value">
                      {{ Math.round(statsData.hoursDistribution.avgCapacityHours || 0) }} hrs
                    </div>
                  </div>
                  <div class="distribution-item">
                    <div class="dist-label">Capacidad Máxima</div>
                    <div class="dist-value">
                      {{ statsData.hoursDistribution.maxCapacityHours || 0 }} hrs
                    </div>
                  </div>
                  <div class="distribution-item">
                    <div class="dist-label">Capacidad Mínima</div>
                    <div class="dist-value">
                      {{ statsData.hoursDistribution.minCapacityHours || 0 }} hrs
                    </div>
                  </div>
                </div>
              </div>

              <q-separator class="q-my-lg" />

              <div class="distribution-section">
                <div class="section-title-dist">
                  <q-icon name="work_history" size="24px" color="positive" class="q-mr-sm" />
                  <span>Horas Trabajadas</span>
                </div>
                <div class="distribution-grid">
                  <div class="distribution-item">
                    <div class="dist-label">Total de Horas Trabajadas</div>
                    <div class="dist-value positive-value">
                      {{ Math.round(statsData.hoursDistribution.totalWorkedHours || 0).toLocaleString() }} hrs
                    </div>
                  </div>
                  <div class="distribution-item">
                    <div class="dist-label">Promedio Trabajado por Instructor</div>
                    <div class="dist-value">
                      {{ Math.round(statsData.hoursDistribution.avgWorkedHours || 0) }} hrs
                    </div>
                  </div>
                  <div class="distribution-item">
                    <div class="dist-label">Máximo de Horas Trabajadas</div>
                    <div class="dist-value">
                      {{ Math.round(statsData.hoursDistribution.maxWorkedHours || 0) }} hrs
                    </div>
                  </div>
                  <div class="distribution-item">
                    <div class="dist-label">Mínimo de Horas Trabajadas</div>
                    <div class="dist-value">
                      {{ Math.round(statsData.hoursDistribution.minWorkedHours || 0) }} hrs
                    </div>
                  </div>
                </div>
              </div>

              <q-separator class="q-my-lg" />

              <div class="distribution-section">
                <div class="section-title-dist">
                  <q-icon name="analytics" size="24px" color="info" class="q-mr-sm" />
                  <span>Utilización del Sistema</span>
                </div>
                <div class="distribution-grid single-column">
                  <div class="distribution-item utilization-item">
                    <div class="dist-label">Porcentaje de Utilización</div>
                    <div class="dist-value info-value">
                      {{ ((statsData.hoursDistribution.totalWorkedHours / statsData.hoursDistribution.totalCapacityHours) * 100).toFixed(2) }}%
                    </div>
                    <q-linear-progress 
                      :value="(statsData.hoursDistribution.totalWorkedHours / statsData.hoursDistribution.totalCapacityHours)" 
                      color="info"
                      size="12px"
                      class="q-mt-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <Button label="Cerrar" custom-class="boton-cerrar" v-close-popup />
          </template>
        </Modal>

        <Modal v-model="showWorkloadStats" variant="view" width="900px" max-width="98vw">
          <template #header>
            <div class="text-h6">Carga de Trabajo por Instructor</div>
          </template>
          <template #body>
            <div class="statistics-content workload-content">
              <div v-for="item in statsData.workload?.data || []" :key="item._id" class="stat-item workload-item">
                <div class="instructor-info">
                  <q-icon name="person" size="24px" color="primary" class="q-mr-sm" />
                  <div class="stat-label">{{ item.name || 'Sin nombre' }}</div>
                </div>
                <div class="workload-stats">
                  <div class="stat-detail">
                    <q-icon name="schedule" size="20px" color="positive" class="q-mr-xs" />
                    <span class="stat-detail-label">Horas:</span>
                    <span class="stat-detail-value">{{ item.hourswork || 0 }}</span>
                  </div>
                  <div class="stat-detail">
                    <q-icon name="trending_up" size="20px" color="info" class="q-mr-xs" />
                    <span class="stat-detail-label">Capacidad:</span>
                    <span class="stat-detail-value">{{ item.caphour || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <Button label="Cerrar" custom-class="boton-cerrar" v-close-popup />
          </template>
        </Modal>

        <Modal v-model="showThematicAreaStats" variant="view" width="800px">
          <template #header>
            <div class="text-h6">Estadísticas por Área Temática</div>
          </template>
          <template #body>
            <div class="statistics-content">
              <div v-for="item in statsData.byThematicArea" :key="item._id" class="stat-item">
                <div class="stat-label">{{ item._id || 'Sin especificar' }}</div>
                <div class="stat-count">{{ item.count }}</div>
              </div>
            </div>
          </template>
          <template #footer>
            <Button label="Cerrar" custom-class="boton-cerrar" v-close-popup />
          </template>
        </Modal>

        <Modal v-model="showBindingTypeStats" variant="view" width="800px">
          <template #header>
            <div class="text-h6">Estadísticas por Tipo de Vinculación</div>
          </template>
          <template #body>
            <div class="statistics-content">
              <div v-for="item in statsData.byBindingType" :key="item._id" class="stat-item">
                <div class="stat-label">{{ item._id || 'Sin especificar' }}</div>
                <div class="stat-count">{{ item.count }}</div>
              </div>
            </div>
          </template>
          <template #footer>
            <Button label="Cerrar" custom-class="boton-cerrar" v-close-popup />
          </template>
        </Modal>

        <Modal v-model="showTopInstructorsStats" variant="view" width="800px">
          <template #header>
            <div class="text-h6">Top Instructores con más Horas</div>
          </template>
          <template #body>
            <div class="statistics-content">
              <div v-for="(item, index) in statsData.topByHours" :key="item._id" class="stat-item">
                <div class="stat-label">
                  <q-icon 
                    v-if="index < 3" 
                    :name="index === 0 ? 'emoji_events' : 'military_tech'" 
                    :color="index === 0 ? 'amber' : index === 1 ? 'grey' : 'orange'"
                    class="q-mr-sm"
                  />
                  {{ item.name || 'Sin nombre' }}
                </div>
                <div class="stat-count">{{ item.hourswork || 0 }} hrs</div>
              </div>
            </div>
          </template>
          <template #footer>
            <Button label="Cerrar" custom-class="boton-cerrar" v-close-popup />
          </template>
        </Modal>
      </div>
    </div>
  </q-page>
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

const STATUS = { ACTIVE: 0, INACTIVE: 1 }

const { error } = useNotifications()

const statsData = ref({
  byThematicArea: [],
  byBindingType: [],
  workload: null,
  hoursDistribution: null,
  topByHours: [],
  capacityVsWorked: null
})
const loadingStats = ref(false)

const showThematicAreaStats = ref(false)
const showBindingTypeStats = ref(false)
const showTopInstructorsStats = ref(false)
const showWorkloadStats = ref(false)
const showHoursDistributionStats = ref(false)
const showCapacityVsWorkedStats = ref(false)

const getDefaultFormData = () => ({
  _id: '',
  name: '',
  numdocument: '',
  email: '',
  phone: '',
  status: STATUS.ACTIVE,
  knowledge: ''
})

const endpoints = {
  list: '/instructors/listInstructor',
  update: (id) => `/instructors/updateInstructor/${id}`
}

const customMessages = {
  listError: 'Error al cargar instructores',
  noData: 'No hay instructores registrados'
}

const processInstructorsResponse = (response) => {
  const payload = response?.msg ?? response?.data ?? response ?? {}
  
  const instructorsArray = Array.isArray(payload)
    ? payload
    : payload?.instructores || payload?.instructors || payload?.list || []
  
  return {
    data: Array.isArray(instructorsArray) ? instructorsArray : [],
    total: payload?.totalDocuments ?? payload?.total ?? payload?.totalInstructors ?? instructorsArray.length
  }
}

const {
  loadingTable,
  rows,
  showDetailDialog,
  selectedEntity,
  filtersData,
  pagination,
  handlePaginationRequest,
  handleSearchChange,
  handleStatusChange,
  openDetailsDialog,
  fetchEntities
} = useEntityManager({
  entityName: 'instructor',
  entityNamePlural: 'instructors',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processInstructorsResponse
})

const rowsInstructors = rows
const selectedInstructors = selectedEntity
const openDetailsDialogInstructors = openDetailsDialog
const fetchInstructors = fetchEntities

const statusAvailable = [
  { label: 'Todos los estados', value: '' },
  { label: 'Activo', value: STATUS.ACTIVE },
  { label: 'Inactivo', value: STATUS.INACTIVE }
]

const columns = [
  { name: 'numdocument', align: 'left', label: 'Cédula', field: 'numdocument', sortable: true },
  { name: 'name', align: 'left', label: 'Nombre', field: 'name', sortable: true },
  { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true },
  { name: 'knowledge', align: 'left', label: 'Programa', field: 'knowledge', sortable: true },
  { name: 'status', align: 'center', label: 'Estado', field: 'status' },
  { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' }
]

function getStatusLabel(status) {
  return status === STATUS.ACTIVE ? 'Activo' : 'Inactivo'
}

function getStatusColor(status) {
  return status === STATUS.ACTIVE ? 'positive' : 'negative'
}

const fetchStatistics = async () => {
  loadingStats.value = true
  try {
    const endpoints = [
      { key: 'byThematicArea', url: '/statistics/instructors/by-thematic-area' },
      { key: 'byBindingType', url: '/statistics/instructors/by-binding-type' },
      { key: 'workload', url: '/statistics/instructors/workload' },
      { key: 'hoursDistribution', url: '/statistics/instructors/hours-distribution' },
      { key: 'topByHours', url: '/statistics/instructors/top-by-hours?limit=10' },
      { key: 'capacityVsWorked', url: '/statistics/instructors/capacity-vs-worked' }
    ]

    const promises = endpoints.map(async ({ key, url }) => {
      try {
        const response = await getData(url)
        const data = response?.data || response || []
        
        if (key === 'byThematicArea' || key === 'byBindingType' || key === 'topByHours') {
          statsData.value[key] = Array.isArray(data) ? data : []
        } else if (key === 'workload') {
          statsData.value[key] = { data: Array.isArray(data) ? data : [] }
        } else if (key === 'hoursDistribution') {
          statsData.value[key] = data?.data || data || null
        } else if (key === 'capacityVsWorked') {
          statsData.value[key] = data?.data || data || null
        } else {
          statsData.value[key] = data
        }
      } catch (err) {
        console.error(`Error fetching ${key}:`, err)
        if (key === 'byThematicArea' || key === 'byBindingType' || key === 'topByHours') {
          statsData.value[key] = []
        } else if (key === 'workload') {
          statsData.value[key] = { data: [] }
        } else {
          statsData.value[key] = null
        }
      }
    })

    await Promise.all(promises)
  } catch (err) {
    console.error('Error fetching statistics:', err)
    error('Error al cargar las estadísticas')
  } finally {
    loadingStats.value = false
  }
}

onMounted(async () => {
  await fetchInstructors()
  await fetchStatistics()
})
</script>

<style lang="sass" scoped>
.instructors-page
  background: #f5f7fb
  min-height: 100vh

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.statistics-section
  margin-bottom: 2rem
  max-width: 1400px
  margin-left: auto
  margin-right: auto
  padding: 0 2rem
  padding-left: 9rem

.statistics-grid
  display: grid
  grid-template-columns: repeat(3, 1fr)
  gap: 1.5rem
  margin-bottom: 1.5rem

.cursor-pointer
  cursor: pointer
  transition: transform 0.2s ease, box-shadow 0.2s ease

  &:hover
    transform: translateY(-2px)
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15)

.filters-wrapper
  gap: 12px
  flex-wrap: wrap
  margin-left: 110px
  justify-content: flex-start

.filters-left
  gap: 12px
  padding: 12px 16px 12px 8px
  border-radius: 16px
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08)
  flex-wrap: wrap

.filter-item
  min-width: 160px

.filter-item.search
  flex: 0 1 auto
  min-width: 450px
  max-width: 700px

.filter-item.status
  width: 180px

.table-options
  display: flex
  align-items: center
  justify-content: center
  gap: 8px

:deep(.q-table)
  tbody td
    white-space: normal !important
    word-wrap: break-word !important
    word-break: break-word !important
    overflow-wrap: break-word !important
    vertical-align: top
    line-height: 1.6
    padding: 16px 12px

  tbody tr
    height: auto !important
    min-height: 60px

  tbody td:nth-child(2)
    max-width: 200px
    min-width: 150px

  tbody td:nth-child(3)
    max-width: 250px
    min-width: 180px

  tbody td:nth-child(4)
    max-width: 250px
    min-width: 180px

  tbody td:nth-child(1)
    min-width: 100px

  thead th
    white-space: normal !important
    word-wrap: break-word !important
    vertical-align: middle
    padding: 14px 12px
    font-weight: 600

  tbody tr:not(:last-child)
    border-bottom: 1px solid #e0e0e0

.statistics-content
  max-height: 400px
  overflow-y: auto

.workload-content
  max-height: 500px

.stat-item
  display: flex
  justify-content: space-between
  align-items: center
  padding: 12px 16px
  margin-bottom: 8px
  background-color: #f8f9fa
  border-radius: 8px
  border-left: 4px solid var(--color-primary)

.workload-item
  flex-direction: column
  align-items: stretch
  gap: 12px
  padding: 16px

.instructor-info
  display: flex
  align-items: center
  width: 100%

.workload-stats
  display: flex
  gap: 24px
  padding-left: 32px

.stat-detail
  display: flex
  align-items: center
  gap: 8px

.stat-detail-label
  font-weight: 500
  color: #666
  font-size: 0.9rem

.stat-detail-value
  font-weight: 700
  color: var(--color-primary)
  font-size: 1.1rem

.distribution-content
  padding: 16px

.distribution-section
  margin-bottom: 24px

.section-title-dist
  display: flex
  align-items: center
  font-size: 1.1rem
  font-weight: 600
  color: #2c3e50
  margin-bottom: 16px

.distribution-grid
  display: grid
  grid-template-columns: repeat(2, 1fr)
  gap: 16px

  &.single-column
    grid-template-columns: 1fr

.distribution-item
  background-color: #f8f9fa
  padding: 16px
  border-radius: 8px
  border-left: 4px solid #e0e0e0

.utilization-item
  border-left-color: var(--q-info)

.dist-label
  font-size: 0.9rem
  color: #666
  margin-bottom: 8px
  font-weight: 500

.dist-value
  font-size: 1.5rem
  font-weight: 700
  color: #2c3e50

  &.primary-value
    color: var(--q-primary)

  &.positive-value
    color: var(--q-positive)

  &.info-value
    color: var(--q-info)

.capacity-content
  padding: 16px

.capacity-summary
  display: flex
  justify-content: center
  margin-bottom: 24px

.summary-item
  display: flex
  align-items: center
  gap: 16px
  padding: 20px 32px
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)
  border-radius: 12px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

  &.total-item
    border-left: 4px solid var(--q-primary)

.summary-info
  display: flex
  flex-direction: column
  gap: 4px

.summary-label
  font-size: 0.9rem
  color: #666
  font-weight: 500

.summary-value
  font-size: 2rem
  font-weight: 700

  &.primary-text
    color: var(--q-primary)

.capacity-categories
  display: flex
  flex-direction: column
  gap: 20px

.category-item
  background-color: #fff
  border-radius: 12px
  padding: 20px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
  transition: transform 0.2s ease, box-shadow 0.2s ease

  &:hover
    transform: translateY(-2px)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12)

  &.overloaded
    border-left: 4px solid var(--q-negative)

    .category-header
      color: var(--q-negative)

    .category-value
      color: var(--q-negative)

  &.optimal
    border-left: 4px solid var(--q-positive)

    .category-header
      color: var(--q-positive)

    .category-value
      color: var(--q-positive)

  &.underutilized
    border-left: 4px solid var(--q-warning)

    .category-header
      color: var(--q-warning)

    .category-value
      color: var(--q-warning)

.category-header
  display: flex
  align-items: center
  gap: 12px
  margin-bottom: 16px

.category-title
  font-size: 1.2rem
  font-weight: 600

.category-body
  display: flex
  flex-direction: column
  gap: 8px
  margin-bottom: 12px

.category-value
  font-size: 2.5rem
  font-weight: 700
  line-height: 1

.category-description
  font-size: 0.9rem
  color: #666
  margin-bottom: 4px

.category-percentage
  font-size: 1.1rem
  font-weight: 600
  color: #2c3e50

.stat-label
  font-weight: 600
  color: #2c3e50
  flex: 1
  display: flex
  align-items: center

.stat-count
  font-weight: 700
  color: var(--color-primary)
  font-size: 1.2rem
  margin-right: 8px

@media (max-width: 1200px)
  .statistics-grid
    grid-template-columns: repeat(2, 1fr)
    gap: 1rem

@media (max-width: 1024px)
  .filters-left
    width: 100%

  .filter-item.search
    min-width: 300px

  .modal-content-grid
    gap: 24px

  .data-row
    grid-template-columns: 180px 1fr
    gap: 16px

@media (max-width: 768px)
  .statistics-section
    padding-left: 2rem

  .statistics-grid
    grid-template-columns: 1fr
    gap: 1rem

  .filters-wrapper
    flex-direction: column

  .filter-item,
  .filter-item.search,
  .filter-item.status
    width: 100%
    min-width: unset
    flex: none

  .modal-content-grid
    grid-template-columns: 1fr
    gap: 20px
    padding: 5px

  .data-row
    grid-template-columns: 1fr
    gap: 8px
    padding: 10px 0

  .data-row .text-weight-bold
    margin-bottom: 4px

  .text-weight-bold
    font-size: 0.95rem

  .data-value
    font-size: 0.95rem

  .section-title
    font-size: 1.25rem
    margin-bottom: 16px
    padding-left: 12px
    border-left: 4px solid var(--color-primary)

  .data-grid
    gap: 16px
    padding: 20px

  .distribution-grid
    grid-template-columns: 1fr

  .summary-item
    padding: 16px 20px

  .category-value
    font-size: 2rem

@media (max-width: 480px)
  .statistics-grid
    gap: 0.75rem

  .filters-left
    padding: 10px 12px

  .section-title
    font-size: 1.15rem
    margin-bottom: 14px
    padding-left: 10px

  .data-grid
    padding: 16px

  .text-weight-bold
    font-size: 0.9rem

  .data-value
    font-size: 0.9rem

@media (max-width: 360px)
  .filters-left
    padding: 8px 10px

  .section-title
    font-size: 1.05rem
    margin-bottom: 12px
    padding-left: 8px

  .data-grid
    padding: 14px
</style>