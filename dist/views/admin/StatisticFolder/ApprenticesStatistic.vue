<template>
  <q-page class="q-pa-md apprentices-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Estadísticas de Aprendices" description="Métricas y análisis del desempeño de los aprendices." />
          </q-card-section>
        </q-card>

        <div class="filters-wrapper flex items-center justify-between q-my-lg">
          <div class="filters-left flex items-center bg-white">
            <div class="filter-item">
              <q-select
                v-model="filtersData.groupId"
                :options="groupOptions"
                outlined
                dense
                emit-value
                map-options
                clearable
                label="Filtrar por Ficha"
                @update:model-value="handleFilterChange"
              >
                <template #prepend>
                  <q-icon name="groups" color="green-8" />
                </template>
              </q-select>
            </div>

            <div class="filter-item">
              <q-input
                v-model="filtersData.startDate"
                outlined
                dense
                type="date"
                label="Fecha Inicio"
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
                label="Fecha Fin"
                clearable
                @update:model-value="handleFilterChange"
              >
                <template #prepend>
                  <q-icon name="event" color="green-8" />
                </template>
              </q-input>
            </div>
          </div>

          <div class="actions-right row items-center q-gutter-sm">
            <Button
              label="Generar Estadísticas"
              custom-class="gradient-btn"
              icon="analytics"
              @click="generateStatistics"
              :loading="loading"
            />
          </div>
        </div>

        <!-- Loader mientras carga -->
        <div v-if="loandingTable" class="loading-state">
          <q-card class="shadow-1">
            <q-card-section class="text-center q-pa-xl">
              <q-spinner-dots size="64px" color="primary" />
              <div class="text-h6 q-mt-md text-grey-7">
                Cargando estadísticas...
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Contenido de estadísticas -->
        <template v-else-if="statistics">
          <!-- Resumen Principal -->
          <div class="q-mb-lg">
            <q-card class="shadow-1 summary-card">
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-3">
                    <div class="summary-item">
                      <q-icon name="school" size="48px" color="primary" />
                      <div class="summary-value">{{ statistics.totalApprentices || 0 }}</div>
                      <div class="summary-label">Total Aprendices</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="summary-item">
                      <q-icon name="check_circle" size="48px" color="positive" />
                      <div class="summary-value">{{ statistics.activeApprentices || 0 }}</div>
                      <div class="summary-label">Activos</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="summary-item">
                      <q-icon name="pause_circle" size="48px" color="warning" />
                      <div class="summary-value">{{ statistics.inactiveApprentices || 0 }}</div>
                      <div class="summary-label">Inactivos</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="summary-item">
                      <q-icon name="groups" size="48px" color="secondary" />
                      <div class="summary-value">{{ statistics.totalGroups || 0 }}</div>
                      <div class="summary-label">Fichas</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Estadísticas de Etapa Productiva -->
          <div v-if="statistics?.productiveStage" class="q-mb-lg">
            <q-card class="shadow-1">
              <q-card-section>
                <div class="text-h6 q-mb-md">Etapa Productiva</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-3">
                    <q-card flat bordered class="stat-mini-card">
                      <q-card-section>
                        <div class="text-caption text-grey-7">Con Registro EP</div>
                        <div class="text-h5 text-primary">
                          {{ statistics.productiveStage.withRegistration || 0 }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                  <div class="col-12 col-md-3">
                    <q-card flat bordered class="stat-mini-card">
                      <q-card-section>
                        <div class="text-caption text-grey-7">Sin Registro EP</div>
                        <div class="text-h5 text-negative">
                          {{ statistics.productiveStage.withoutRegistration || 0 }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                  <div class="col-12 col-md-3">
                    <q-card flat bordered class="stat-mini-card">
                      <q-card-section>
                        <div class="text-caption text-grey-7">Aprobados</div>
                        <div class="text-h5 text-positive">
                          {{ statistics.productiveStage.approved || 0 }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                  <div class="col-12 col-md-3">
                    <q-card flat bordered class="stat-mini-card">
                      <q-card-section>
                        <div class="text-caption text-grey-7">Pendientes</div>
                        <div class="text-h5 text-warning">
                          {{ statistics.productiveStage.pending || 0 }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Gráficas -->
          <div class="row q-col-gutter-md q-mb-lg">
            <!-- Por Estado -->
            <div v-if="statistics.byStatus?.length" class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Por Estado</div>
                  <div class="chart-container-medium">
                    <canvas ref="statusChart"></canvas>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Por Modalidad EP -->
            <div v-if="statistics.byModality?.length" class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Por Modalidad EP</div>
                  <div class="chart-container-medium">
                    <canvas ref="modalityChart"></canvas>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Por Género -->
            <div v-if="statistics.byGender?.length" class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Por Género</div>
                  <div class="chart-container-medium">
                    <canvas ref="genderChart"></canvas>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Aprendices por Ficha -->
            <div v-if="statistics.byGroup?.length" class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Top 10 Fichas</div>
                  <div class="chart-container-medium">
                    <canvas ref="groupChart"></canvas>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Tabla de Aprendices Destacados -->
          <div v-if="statistics?.topApprentices?.length" class="q-mb-lg">
            <q-card class="shadow-1">
              <q-card-section>
                <div class="text-h6 q-mb-md">Aprendices Destacados (Con más bitácoras)</div>
                    <Table
                      card
                  :rows="statistics.topApprentices"
                  :columns="topApprenticesColumns"
                  row-key="_id"
                  :hide-pagination="true"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Resumen por Fichas -->
          <div v-if="statistics?.groupsSummary?.length" class="q-mb-lg">
            <q-card class="shadow-1">
              <q-card-section>
                <div class="text-h6 q-mb-md">Resumen por Fichas</div>
                  <Table
                    card
                  :rows="statistics.groupsSummary"
                  :columns="groupsSummaryColumns"
                  row-key="_id"
                  v-model:pagination="groupsPagination"
                />
              </q-card-section>
            </q-card>
          </div>
        </template>

        <!-- Estado Vacío -->
        <div v-else-if="!loandingTable && !statistics" class="empty-state">
          <q-card class="shadow-1">
            <q-card-section class="text-center q-pa-xl">
              <q-icon name="school" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md text-grey-7">
                No hay estadísticas disponibles
              </div>
              <div class="text-body2 text-grey-6 q-mt-sm">
                No se encontraron datos para mostrar en este momento
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getData, postData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import BackButton from 'src/components/BackButton.vue'
import Button from 'src/components/Button.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Table from 'src/components/Table.vue'
import Chart from 'chart.js/auto'

// ==================== NOTIFICACIONES ====================
const { error } = useNotifications()

// ==================== ESTADOS PRINCIPALES ====================
const loading = ref(false)
const loandingTable = ref(false)
const statistics = ref(null)
const groupOptions = ref([])

// Referencias para gráficas
const statusChart = ref(null)
const modalityChart = ref(null)
const genderChart = ref(null)
const groupChart = ref(null)

let statusChartInstance = null
let modalityChartInstance = null
let genderChartInstance = null
let groupChartInstance = null

const filtersData = ref({
  groupId: '',
  startDate: '',
  endDate: ''
})

const topApprenticesColumns = [
  { name: 'name', label: 'Nombre', align: 'left', field: 'name' },
  { name: 'email', label: 'Email', align: 'left', field: 'email' },
  { name: 'group', label: 'Ficha', align: 'center', field: 'group' },
  { name: 'logbooks', label: 'Bitácoras', align: 'center', field: 'logbooks' }
]

const groupsSummaryColumns = [
  { name: 'group', label: 'Ficha', align: 'left', field: 'group' },
  { name: 'total', label: 'Total', align: 'center', field: 'total' },
  { name: 'active', label: 'Activos', align: 'center', field: 'active' },
  { name: 'withEP', label: 'Con EP', align: 'center', field: 'withEP' },
  { name: 'approved', label: 'Aprobados', align: 'center', field: 'approved' }
]

const groupsPagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const fetchGroups = async () => {
  try {
    let response = null
    let fichasData = []
    
    // Intentar diferentes endpoints posibles
    const endpoints = [
      '/fiches/listFiche',
      '/fichas',
      '/fiches'
    ]
    
    for (const endpoint of endpoints) {
      try {
        response = await getData(endpoint)
        break // Si funciona, salir del loop
      } catch (err) {
        // Continuar con el siguiente endpoint
        continue
      }
    }
    
    if (!response) {
      throw new Error('No se pudo obtener la lista de fichas desde ningún endpoint')
    }
    
    // El backend puede devolver los datos en diferentes formatos
    if (Array.isArray(response)) {
      fichasData = response
    } else if (response?.msg && Array.isArray(response.msg)) {
      fichasData = response.msg
    } else if (response?.data && Array.isArray(response.data)) {
      fichasData = response.data
    } else if (response?.fiches && Array.isArray(response.fiches)) {
      fichasData = response.fiches
    } else if (response && typeof response === 'object') {
      // Buscar cualquier propiedad que sea un array
      const keys = Object.keys(response)
      for (const key of keys) {
        if (Array.isArray(response[key])) {
          fichasData = response[key]
          break
        }
      }
    }
    
    // Mapear las fichas a opciones del select
    groupOptions.value = [
      { label: 'Todas las fichas', value: '' },
      ...fichasData.map(group => ({
        label: group.number || group.name || `Ficha ${group._id}`,
        value: group._id
      }))
    ]
  } catch (err) {
    console.error('Error al cargar fichas:', err)
    error('Error al cargar la lista de fichas. Por favor, intenta nuevamente.')
    groupOptions.value = [{ label: 'Todas las fichas', value: '' }]
  }
}

const generateStatistics = async () => {
  loading.value = true
  loandingTable.value = true
  
  try {
    const payload = {}
    
    // Enviar el filtro de ficha si está seleccionado
    if (filtersData.value.groupId && filtersData.value.groupId !== '') {
      payload.groupId = filtersData.value.groupId
    }
    
    // Enviar filtros de fecha si ambos están presentes
    if (filtersData.value.startDate && filtersData.value.endDate) {
      payload.startDate = filtersData.value.startDate
      payload.endDate = filtersData.value.endDate
    } else if (filtersData.value.startDate || filtersData.value.endDate) {
      error('Debes especificar ambas fechas o ninguna')
      loading.value = false
      loandingTable.value = false
      return
    }

    const response = await postData('/statistics/generate/apprentices', payload)
    
    // El backend puede devolver los datos en diferentes formatos
    if (response?.data) {
      statistics.value = response.data
    } else if (response && typeof response === 'object' && !response.msg) {
      // Si response es directamente el objeto de estadísticas
      statistics.value = response
    } else {
      statistics.value = null
    }
    
    // Asegurar que todos los campos estén presentes y mapear la estructura del backend
    if (statistics.value) {
      // Mapear campos básicos que vienen del backend
      statistics.value.totalApprentices = statistics.value.totalApprentices || 0
      
      // Intentar derivar totalGroups de fichestatistics si está disponible
      if (statistics.value.fichestatistics) {
        // Si hay estadísticas de fichas, intentar obtener el total
        // El backend puede devolver avgActiveFiches, maxFiches, etc.
        // Por ahora, si no hay totalGroups explícito, lo dejamos en 0
        statistics.value.totalGroups = statistics.value.totalGroups || 
                                      statistics.value.fichestatistics.totalFiches || 
                                      statistics.value.fichestatistics.totalGroups || 0
      } else {
        statistics.value.totalGroups = statistics.value.totalGroups || 0
      }
      
      // Campos que el backend debería devolver pero pueden no estar presentes
      statistics.value.activeApprentices = statistics.value.activeApprentices || 
                                           statistics.value.active || 0
      statistics.value.inactiveApprentices = statistics.value.inactiveApprentices || 
                                             statistics.value.inactive || 0
      
      // Mapear arrays que pueden venir con diferentes nombres
      statistics.value.byStatus = statistics.value.byStatus || 
                                  statistics.value.byStatusCount || 
                                  statistics.value.statusStatistics || []
      
      statistics.value.byModality = statistics.value.byModality || 
                                   statistics.value.byModalityCount || 
                                   statistics.value.modalityStatistics || []
      
      statistics.value.byGender = statistics.value.byGender || 
                                 statistics.value.byGenderCount || 
                                 statistics.value.genderStatistics || []
      
      statistics.value.byGroup = statistics.value.byGroup || 
                                statistics.value.byGroupCount || 
                                statistics.value.groupStatistics || 
                                statistics.value.byFiche || []
      
      statistics.value.topApprentices = statistics.value.topApprentices || 
                                       statistics.value.topApprenticesList || 
                                       statistics.value.destacados || []
      
      statistics.value.groupsSummary = statistics.value.groupsSummary || 
                                      statistics.value.groupsResume || 
                                      statistics.value.fichesSummary || 
                                      statistics.value.fichesResume || []
      
      // Normalizar datos de topApprentices para asegurar que tengan los campos correctos
      if (statistics.value.topApprentices && Array.isArray(statistics.value.topApprentices)) {
        statistics.value.topApprentices = statistics.value.topApprentices.map(apprentice => ({
          _id: apprentice._id || apprentice.id,
          name: apprentice.name || apprentice.fullName || apprentice.nombre || '-',
          email: apprentice.email || apprentice.correo || '-',
          group: apprentice.group || apprentice.groupName || apprentice.ficha || apprentice.groupNumber || '-',
          logbooks: apprentice.logbooks || apprentice.bitacoras || apprentice.totalLogbooks || 0
        }))
      }
      
      // Normalizar datos de groupsSummary para asegurar que tengan los campos correctos
      if (statistics.value.groupsSummary && Array.isArray(statistics.value.groupsSummary)) {
        statistics.value.groupsSummary = statistics.value.groupsSummary.map(group => ({
          _id: group._id || group.id || group.groupId,
          group: group.group || group.groupName || group.name || group.number || group.ficha || '-',
          total: group.total || group.totalApprentices || 0,
          active: group.active || group.activeApprentices || 0,
          withEP: group.withEP || group.withRegistration || group.conEP || 0,
          approved: group.approved || group.aprobados || 0
        }))
      }
      
      // Mapear etapa productiva - puede venir con diferentes nombres
      if (!statistics.value.productiveStage) {
        statistics.value.productiveStage = statistics.value.productiveStageStats || {
          withRegistration: statistics.value.withEP || statistics.value.conRegistroEP || 0,
          withoutRegistration: statistics.value.withoutEP || statistics.value.sinRegistroEP || 0,
          approved: statistics.value.approvedEP || statistics.value.aprobadosEP || 0,
          pending: statistics.value.pendingEP || statistics.value.pendientesEP || 0
        }
      }
      
      if (statistics.value.groupsSummary && Array.isArray(statistics.value.groupsSummary)) {
        groupsPagination.value.rowsNumber = statistics.value.groupsSummary.length
      }
    }
    
    await nextTick()
    renderCharts()
  } catch (err) {
    const message = err?.response?.data?.msg || err?.response?.data?.message || err?.message || 'Error al generar estadísticas'
    error(message)
    statistics.value = null
  } finally {
    loading.value = false
    loandingTable.value = false
  }
}

const handleFilterChange = () => {
  // Los filtros se aplican cuando el usuario hace clic en "Generar Estadísticas"
}

const destroyCharts = () => {
  if (statusChartInstance) {
    statusChartInstance.destroy()
    statusChartInstance = null
  }
  if (modalityChartInstance) {
    modalityChartInstance.destroy()
    modalityChartInstance = null
  }
  if (genderChartInstance) {
    genderChartInstance.destroy()
    genderChartInstance = null
  }
  if (groupChartInstance) {
    groupChartInstance.destroy()
    groupChartInstance = null
  }
}

const renderCharts = () => {
  destroyCharts()
  
  if (statistics.value?.byStatus?.length && statusChart.value) {
    renderStatusChart()
  }
  
  if (statistics.value?.byModality?.length && modalityChart.value) {
    renderModalityChart()
  }
  
  if (statistics.value?.byGender?.length && genderChart.value) {
    renderGenderChart()
  }
  
  if (statistics.value?.byGroup?.length && groupChart.value) {
    renderGroupChart()
  }
}

const renderStatusChart = () => {
  const ctx = statusChart.value.getContext('2d')
  const data = statistics.value.byStatus

  statusChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map(item => item._id ? 'Activo' : 'Inactivo'),
      datasets: [{
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(46, 204, 113, 0.8)',
          'rgba(231, 76, 60, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

const renderModalityChart = () => {
  const ctx = modalityChart.value.getContext('2d')
  const data = statistics.value.byModality

  modalityChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(item => item._id || 'Sin modalidad'),
      datasets: [{
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(45, 178, 0, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(155, 89, 182, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(231, 76, 60, 0.8)',
          'rgba(26, 188, 156, 0.8)',
          'rgba(243, 156, 18, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

const renderGenderChart = () => {
  const ctx = genderChart.value.getContext('2d')
  const data = statistics.value.byGender

  genderChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item._id || 'No especificado'),
      datasets: [{
        label: 'Aprendices',
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(52, 152, 219, 0.7)',
          'rgba(231, 76, 60, 0.7)',
          'rgba(149, 165, 166, 0.7)'
        ],
        borderColor: [
          'rgba(52, 152, 219, 1)',
          'rgba(231, 76, 60, 1)',
          'rgba(149, 165, 166, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}

const renderGroupChart = () => {
  const ctx = groupChart.value.getContext('2d')
  const data = statistics.value.byGroup.slice(0, 10)

  groupChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item._id),
      datasets: [{
        label: 'Aprendices',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(45, 178, 0, 0.7)',
        borderColor: 'rgba(45, 178, 0, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      indexAxis: 'y'
    }
  })
}


onMounted(async () => {
  await fetchGroups()
  await generateStatistics()
})
</script>

<style lang="scss" scoped>
.apprentices-page {
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

.summary-card {
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);

  .summary-item {
    text-align: center;
    padding: 20px;

    .summary-value {
      font-size: 36px;
      font-weight: 700;
      color: #2c3e50;
      margin: 12px 0 8px;
    }

    .summary-label {
      font-size: 14px;
      color: #7f8c8d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

.stat-mini-card {
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.chart-container-medium {
  height: 300px;
  position: relative;
}

.loading-state,
.empty-state {
  .q-card {
    border-radius: 16px;
  }
}

@media (max-width: 1024px) {
  .filters-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-left {
    width: 100%;
  }

  .actions-right {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .chart-container-medium {
    height: 250px;
  }

  .summary-item {
    .summary-value {
      font-size: 28px;
    }
  }

  .filter-item {
    width: 100%;
    min-width: unset;
  }

  .actions-right {
    width: 100%;
  }
}
</style>