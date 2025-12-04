<template>
  <q-page class="q-pa-md general-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Estadísticas Generales" description="Visión general de los indicadores del sistema." />
          </q-card-section>
        </q-card>

        <div class="filters-wrapper flex items-center justify-between q-my-lg">
          <div class="filters-left flex items-center bg-white">
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
                Cargando estadísticas generales...
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
                      <q-icon name="person" size="48px" color="secondary" />
                      <div class="summary-value">{{ statistics.totalInstructors || 0 }}</div>
                      <div class="summary-label">Total Instructores</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="summary-item">
                      <q-icon name="business" size="48px" color="accent" />
                      <div class="summary-value">{{ statistics.totalCompanies || 0 }}</div>
                      <div class="summary-label">Total Empresas</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="summary-item">
                      <q-icon name="groups" size="48px" color="positive" />
                      <div class="summary-value">{{ statistics.totalGroups || 0 }}</div>
                      <div class="summary-label">Total Fichas</div>
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
                  <div class="col-12 col-md-4">
                    <q-card flat bordered class="stat-mini-card">
                      <q-card-section>
                        <div class="text-caption text-grey-7">Total Registros</div>
                        <div class="text-h5 text-primary">
                          {{ statistics.productiveStage.totalRegistrations || 0 }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-card flat bordered class="stat-mini-card">
                      <q-card-section>
                        <div class="text-caption text-grey-7">Pendientes</div>
                        <div class="text-h5 text-warning">
                          {{ statistics.productiveStage.pending || 0 }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-card flat bordered class="stat-mini-card">
                      <q-card-section>
                        <div class="text-caption text-grey-7">Aprobados</div>
                        <div class="text-h5 text-positive">
                          {{ statistics.productiveStage.approved || 0 }}
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

            <!-- Top 10 Fichas -->
            <div v-if="statistics.apprenticesByGroup?.length" class="col-12">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Top 10 Fichas (Aprendices)</div>
                  <div class="chart-container-large">
                    <canvas ref="groupsChart"></canvas>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Resumen por Fichas -->
          <div v-if="statistics?.groupsSummary?.length" class="q-mb-lg">
            <q-card class="shadow-1">
              <q-card-section>
                <div class="text-h6 q-mb-md">Resumen por Fichas</div>
                <Table
                  card
                  :rows="statistics.groupsSummary"
                  :columns="groupsColumns"
                  row-key="_id"
                />
              </q-card-section>
            </q-card>
          </div>
        </template>

        <!-- Estado Vacío -->
        <div v-else-if="!loandingTable && !statistics" class="empty-state">
          <q-card class="shadow-1">
            <q-card-section class="text-center q-pa-xl">
              <q-icon name="analytics" size="64px" color="grey-5" />
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
import { postData } from 'src/services/apiClient'
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

// Referencias para gráficas
const modalityChart = ref(null)
const statusChart = ref(null)
const groupsChart = ref(null)

let modalityChartInstance = null
let statusChartInstance = null
let groupsChartInstance = null

const filtersData = ref({
  startDate: '',
  endDate: ''
})

const groupsColumns = [
  { name: 'name', label: 'Ficha', align: 'left', field: 'name' },
  { name: 'apprentices', label: 'Aprendices', align: 'center', field: 'apprentices' },
  { name: 'registrations', label: 'Registros EP', align: 'center', field: 'registrations' },
  { name: 'approved', label: 'Aprobados', align: 'center', field: 'approved' },
  { name: 'pending', label: 'Pendientes', align: 'center', field: 'pending' }
]

const groupsPagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const generateStatistics = async () => {
  loading.value = true
  loandingTable.value = true
  
  try {
    const payload = {}
    
    if (filtersData.value.startDate && filtersData.value.endDate) {
      payload.startDate = filtersData.value.startDate
      payload.endDate = filtersData.value.endDate
    } else if (filtersData.value.startDate || filtersData.value.endDate) {
      error('Debes especificar ambas fechas o ninguna')
      loading.value = false
      loandingTable.value = false
      return
    }

    const response = await postData('/statistics/generate/general', payload)
    
    statistics.value = response?.data || null
    
    if (statistics.value?.groupsSummary) {
      groupsPagination.value.rowsNumber = statistics.value.groupsSummary.length
    }
    
    await nextTick()
    renderCharts()
  } catch (err) {
    const message = err?.response?.data?.msg || err?.message || 'Error al generar estadísticas'
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
  if (modalityChartInstance) {
    modalityChartInstance.destroy()
    modalityChartInstance = null
  }
  if (statusChartInstance) {
    statusChartInstance.destroy()
    statusChartInstance = null
  }
  if (groupsChartInstance) {
    groupsChartInstance.destroy()
    groupsChartInstance = null
  }
}

const renderCharts = () => {
  destroyCharts()
  
  if (statistics.value?.byModality?.length && modalityChart.value) {
    renderModalityChart()
  }
  
  if (statistics.value?.byStatus?.length && statusChart.value) {
    renderStatusChart()
  }
  
  if (statistics.value?.apprenticesByGroup?.length && groupsChart.value) {
    renderGroupsChart()
  }
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

const renderStatusChart = () => {
  const ctx = statusChart.value.getContext('2d')
  const data = statistics.value.byStatus

  statusChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map(item => item._id || 'Sin estado'),
      datasets: [{
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(46, 204, 113, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(231, 76, 60, 0.8)',
          'rgba(149, 165, 166, 0.8)'
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

const renderGroupsChart = () => {
  const ctx = groupsChart.value.getContext('2d')
  const data = statistics.value.apprenticesByGroup.slice(0, 10)

  groupsChartInstance = new Chart(ctx, {
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
      }
    }
  })
}

onMounted(async () => {
  await generateStatistics()
})
</script>

<style lang="scss" scoped>
.general-page {
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

.chart-container-large {
  height: 400px;
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

  .chart-container-large {
    height: 300px;
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