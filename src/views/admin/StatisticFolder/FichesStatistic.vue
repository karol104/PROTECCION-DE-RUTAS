<template>
  <q-page class="q-pa-md fiches-statistics-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Estadísticas de Fichas" 
              description="Indicadores y análisis de fichas del sistema." 
            />
          </q-card-section>
        </q-card>

        <!-- Botón para cargar estadísticas -->
        <div class="actions-wrapper flex justify-end q-my-lg">
          <Button
            label="Cargar Estadísticas"
            custom-class="gradient-btn"
            icon="analytics"
            @click="loadAllStatistics"
            :loading="loading"
          />
        </div>

        <!-- Loader mientras carga -->
        <div v-if="loading" class="loading-state">
          <q-card class="shadow-1">
            <q-card-section class="text-center q-pa-xl">
              <q-spinner-dots size="64px" color="primary" />
              <div class="text-h6 q-mt-md text-grey-7">
                Cargando estadísticas de fichas...
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Contenido de estadísticas -->
        <template v-else-if="statisticsLoaded">
          <div class="row q-col-gutter-md">
            <!-- Fichas por Programa -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Fichas por Programa (Top 10)</div>
                  <div class="chart-container-medium">
                    <canvas ref="programChart"></canvas>
                    <div v-if="!hasProgramData" class="empty-chart-message">
                      <q-icon name="pie_chart" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de fichas por programa
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Fichas por Modalidad -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Fichas por Modalidad</div>
                  <div class="chart-container-medium">
                    <canvas ref="modalityChart"></canvas>
                    <div v-if="!hasModalityData" class="empty-chart-message">
                      <q-icon name="donut_small" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de fichas por modalidad
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Fichas por Coordinación -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Fichas por Coordinación</div>
                  <div class="chart-container-medium">
                    <canvas ref="coordinationChart"></canvas>
                    <div v-if="!hasCoordinationData" class="empty-chart-message">
                      <q-icon name="bar_chart" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de fichas por coordinación
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Fichas Activas vs Inactivas -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Fichas Activas vs Inactivas</div>
                  <div class="chart-container-medium">
                    <canvas ref="activeChart"></canvas>
                    <div v-if="!hasActiveData" class="empty-chart-message">
                      <q-icon name="donut_large" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de fichas activas vs inactivas
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Fichas - Alerta de Vencimiento -->
            <div class="col-12">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Alerta de Vencimiento de Fichas</div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    Fichas próximas a vencer (30 días) y vencidas
                  </div>
                  <div class="chart-container-large">
                    <canvas ref="expirationChart"></canvas>
                    <div v-if="!hasExpirationData" class="empty-chart-message">
                      <q-icon name="event" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de fichas próximas a vencer
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="hasExpirationData" class="q-mt-md">
                    <Table
                      card
                      :rows="expirationAlert.fiches || []"
                      :columns="expirationColumns"
                      row-key="_id"
                    />
                  </div>
                  <div v-else class="text-center q-pa-md text-grey-6">
                    No hay datos para mostrar en la tabla
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </template>

        <!-- Estado Vacío -->
        <div v-else-if="!loading" class="empty-state">
          <q-card class="shadow-1">
            <q-card-section class="text-center q-pa-xl">
              <q-icon name="folder" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md text-grey-7">
                No hay estadísticas disponibles
              </div>
              <div class="text-body2 text-grey-6 q-mt-sm">
                Presiona "Cargar Estadísticas" para visualizar los datos
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { getData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import Chart from 'chart.js/auto'
import BackButton from 'src/components/BackButton.vue'
import Button from 'src/components/Button.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Table from 'src/components/Table.vue'

// ==================== NOTIFICACIONES ====================
const { error, success } = useNotifications()

// ==================== ESTADOS ====================
const loading = ref(false)
const statisticsLoaded = ref(false)
const byProgram = ref(null)
const byModality = ref(null)
const byCoordination = ref(null)
const expirationAlert = ref(null)
const activeVsInactive = ref(null)

// Referencias para gráficas
const programChart = ref(null)
const modalityChart = ref(null)
const coordinationChart = ref(null)
const expirationChart = ref(null)
const activeChart = ref(null)

let programChartInstance = null
let modalityChartInstance = null
let coordinationChartInstance = null
let expirationChartInstance = null
let activeChartInstance = null

// ==================== COMPUTED ====================
const hasProgramData = computed(() => {
  return byProgram.value && Array.isArray(byProgram.value) && byProgram.value.length > 0
})

const hasModalityData = computed(() => {
  return byModality.value && Array.isArray(byModality.value) && byModality.value.length > 0
})

const hasCoordinationData = computed(() => {
  return byCoordination.value && Array.isArray(byCoordination.value) && byCoordination.value.length > 0
})

const hasExpirationData = computed(() => {
  if (!expirationAlert.value) return false
  if (typeof expirationAlert.value === 'object' && !Array.isArray(expirationAlert.value)) {
    return (expirationAlert.value.expiringSoon > 0 || expirationAlert.value.expired > 0)
  }
  return false
})

const hasActiveData = computed(() => {
  if (!activeVsInactive.value) return false
  if (typeof activeVsInactive.value === 'object' && !Array.isArray(activeVsInactive.value)) {
    return (activeVsInactive.value.active !== undefined || activeVsInactive.value.inactive !== undefined)
  }
  return false
})

// ==================== COLUMNAS DE TABLAS ====================
const expirationColumns = [
  { 
    name: 'number', 
    label: 'Número de Ficha', 
    align: 'left', 
    field: 'number' 
  },
  { 
    name: 'program', 
    label: 'Programa', 
    align: 'left', 
    field: row => row.program?.name || 'Sin programa' 
  },
  { 
    name: 'owner', 
    label: 'Responsable', 
    align: 'left', 
    field: row => row.owner?.name || 'Sin responsable' 
  },
  { 
    name: 'fend', 
    label: 'Fecha de Fin', 
    align: 'center', 
    field: 'fend',
    format: val => {
      if (!val) return 'N/A'
      const date = new Date(val)
      return date.toLocaleDateString('es-ES')
    }
  }
]

// ==================== FUNCIONES PRINCIPALES ====================

const loadAllStatistics = async () => {
  loading.value = true
  statisticsLoaded.value = false
  
  try {
    const [
      programRes,
      modalityRes,
      coordinationRes,
      expirationRes,
      activeRes
    ] = await Promise.all([
      getData('/statistics/fiches/by-program').catch(err => {
        console.error('Error en by-program:', err)
        return null
      }),
      getData('/statistics/fiches/by-modality').catch(err => {
        console.error('Error en by-modality:', err)
        return null
      }),
      getData('/statistics/fiches/by-coordination').catch(err => {
        console.error('Error en by-coordination:', err)
        return null
      }),
      getData('/statistics/fiches/expiration-alert').catch(err => {
        console.error('Error en expiration-alert:', err)
        return null
      }),
      getData('/statistics/fiches/active-vs-inactive').catch(err => {
        console.error('Error en active-vs-inactive:', err)
        return null
      })
    ])

    const processResponse = (res) => {
      if (!res) return null
      const data = res.data || res
      if (Array.isArray(data)) return data
      if (typeof data === 'object') return data
      return data
    }

    byProgram.value = processResponse(programRes)
    byModality.value = processResponse(modalityRes)
    byCoordination.value = processResponse(coordinationRes)
    expirationAlert.value = processResponse(expirationRes)
    activeVsInactive.value = processResponse(activeRes)
    
    statisticsLoaded.value = true
    
    console.log('Estadísticas cargadas:', {
      byProgram: byProgram.value,
      byModality: byModality.value,
      byCoordination: byCoordination.value,
      expirationAlert: expirationAlert.value,
      activeVsInactive: activeVsInactive.value
    })
    
    success('Estadísticas cargadas correctamente')
    
    await nextTick()
    renderCharts()
  } catch (err) {
    console.error('Error general al cargar estadísticas:', err)
    const message = err?.response?.data?.msg || err?.message || 'Error al cargar estadísticas'
    error(message)
  } finally {
    loading.value = false
  }
}

// ==================== FUNCIONES DE GRÁFICAS ====================

const destroyCharts = () => {
  if (programChartInstance) {
    programChartInstance.destroy()
    programChartInstance = null
  }
  if (modalityChartInstance) {
    modalityChartInstance.destroy()
    modalityChartInstance = null
  }
  if (coordinationChartInstance) {
    coordinationChartInstance.destroy()
    coordinationChartInstance = null
  }
  if (expirationChartInstance) {
    expirationChartInstance.destroy()
    expirationChartInstance = null
  }
  if (activeChartInstance) {
    activeChartInstance.destroy()
    activeChartInstance = null
  }
}

const renderCharts = () => {
  destroyCharts()
  
  // Esperar un tick adicional para asegurar que los canvas estén en el DOM
  setTimeout(() => {
    if (hasProgramData.value && programChart.value) {
      console.log('Renderizando programChart con datos:', byProgram.value)
      renderProgramChart()
    }
    
    if (hasModalityData.value && modalityChart.value) {
      console.log('Renderizando modalityChart con datos:', byModality.value)
      renderModalityChart()
    }
    
    if (hasCoordinationData.value && coordinationChart.value) {
      console.log('Renderizando coordinationChart con datos:', byCoordination.value)
      renderCoordinationChart()
    }
    
    if (hasExpirationData.value && expirationChart.value) {
      console.log('Renderizando expirationChart con datos:', expirationAlert.value)
      renderExpirationChart()
    }
    
    if (hasActiveData.value && activeChart.value) {
      console.log('Renderizando activeChart con datos:', activeVsInactive.value)
      renderActiveChart()
    }
  }, 100)
}

const renderProgramChart = () => {
  const ctx = programChart.value.getContext('2d')
  // Limitar a top 10 programas para que el gráfico sea legible
  const data = byProgram.value.slice(0, 10)

  programChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map(item => {
        if (typeof item._id === 'object' && item._id !== null) {
          return item._id.programName || 'Sin programa'
        }
        return item._id || 'Sin programa'
      }),
      datasets: [{
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(45, 178, 0, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(155, 89, 182, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(231, 76, 60, 0.8)',
          'rgba(26, 188, 156, 0.8)',
          'rgba(230, 126, 34, 0.8)',
          'rgba(52, 73, 94, 0.8)',
          'rgba(149, 165, 166, 0.8)',
          'rgba(243, 156, 18, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            maxWidth: 200,
            font: {
              size: 10
            },
            padding: 5
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || ''
              if (label) {
                label += ': '
              }
              label += context.parsed + ' fichas'
              return label
            }
          }
        }
      }
    }
  })
}

const renderModalityChart = () => {
  const ctx = modalityChart.value.getContext('2d')
  const data = byModality.value

  modalityChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(item => {
        if (item._id === null || item._id === undefined) {
          return 'Sin modalidad'
        }
        return item._id
      }),
      datasets: [{
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(46, 204, 113, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(155, 89, 182, 0.8)',
          'rgba(241, 196, 15, 0.8)'
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

const renderCoordinationChart = () => {
  const ctx = coordinationChart.value.getContext('2d')
  const data = byCoordination.value

  coordinationChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => {
        if (typeof item._id === 'object' && item._id !== null) {
          return item._id.coordinationName || 'Sin coordinación'
        }
        return item._id || 'Sin coordinación'
      }),
      datasets: [{
        label: 'Fichas',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(155, 89, 182, 0.7)',
        borderColor: 'rgba(155, 89, 182, 1)',
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

const renderExpirationChart = () => {
  const ctx = expirationChart.value.getContext('2d')
  const data = expirationAlert.value

  const labels = ['Próximas a vencer', 'Vencidas']
  const chartData = [data.expiringSoon || 0, data.expired || 0]

  expirationChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Fichas',
        data: chartData,
        backgroundColor: [
          'rgba(241, 196, 15, 0.7)',
          'rgba(231, 76, 60, 0.7)'
        ],
        borderColor: [
          'rgba(241, 196, 15, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}

const renderActiveChart = () => {
  const ctx = activeChart.value.getContext('2d')
  const data = activeVsInactive.value

  const labels = ['Activas', 'Inactivas']
  const chartData = [data.active || 0, data.inactive || 0]

  activeChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: chartData,
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
</script>

<style lang="sass" scoped>
.fiches-statistics-page
  background: #f5f7fb
  min-height: 100vh

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.actions-wrapper
  margin-left: 80px

.chart-container-medium
  height: 300px
  position: relative

.chart-container-large
  height: 400px
  position: relative

.empty-chart-message
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  text-align: center
  z-index: 10

.loading-state,
.empty-state
  .q-card
    border-radius: 16px

@media (max-width: 1024px)
  .actions-wrapper
    margin-left: 0

@media (max-width: 768px)
  .chart-container-medium
    height: 250px

  .chart-container-large
    height: 300px
</style>