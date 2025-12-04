<template>
  <q-page class="q-pa-md preregistrations-statistics-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Estadísticas de Pre-Registros" 
              description="Indicadores y análisis de pre-registros del sistema." 
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
                Cargando estadísticas de pre-registros...
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Contenido de estadísticas -->
        <template v-else-if="statisticsLoaded">
          <div class="row q-col-gutter-md">
            <!-- Pre-Registros por Estado -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Pre-Registros por Estado</div>
                  <div class="chart-container-medium">
                    <canvas ref="statusChart"></canvas>
                    <div v-if="!hasStatusData" class="empty-chart-message">
                      <q-icon name="pie_chart" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de pre-registros por estado
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Pre-Registros por Modalidad -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Pre-Registros por Modalidad</div>
                  <div class="chart-container-medium">
                    <canvas ref="modalityChart"></canvas>
                    <div v-if="!hasModalityData" class="empty-chart-message">
                      <q-icon name="donut_small" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de pre-registros por modalidad
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Tasa de Aprobación -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Tasa de Aprobación</div>
                  <div class="chart-container-medium">
                    <canvas ref="approvalChart"></canvas>
                    <div v-if="!hasApprovalData" class="empty-chart-message">
                      <q-icon name="donut_large" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de tasa de aprobación
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Tiempo de Procesamiento -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Tiempo de Procesamiento</div>
                  <div class="chart-container-medium">
                    <div v-if="hasProcessingData" class="q-pa-md">
                      <div class="text-center">
                        <div class="text-h3 text-primary">{{ formatDays(processingTime.avgProcessingTime) }}</div>
                        <div class="text-subtitle2 text-grey-7">Promedio de días</div>
                      </div>
                      <q-separator class="q-my-md" />
                      <div class="row q-col-gutter-sm">
                        <div class="col-6 text-center">
                          <div class="text-h6">{{ formatDays(processingTime.minProcessingTime) }}</div>
                          <div class="text-caption text-grey-7">Mínimo</div>
                        </div>
                        <div class="col-6 text-center">
                          <div class="text-h6">{{ formatDays(processingTime.maxProcessingTime) }}</div>
                          <div class="text-caption text-grey-7">Máximo</div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="empty-chart-message">
                      <q-icon name="schedule" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de tiempo de procesamiento
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Tendencia de Pre-Registros -->
            <div class="col-12">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Tendencia de Pre-Registros (Últimos 12 meses)</div>
                  <div class="chart-container-large">
                    <canvas ref="trendChart"></canvas>
                    <div v-if="!hasTrendData" class="empty-chart-message">
                      <q-icon name="trending_up" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de tendencia
                      </div>
                    </div>
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

// ==================== NOTIFICACIONES ====================
const { error, success } = useNotifications()

// ==================== ESTADOS ====================
const loading = ref(false)
const statisticsLoaded = ref(false)
const byStatus = ref(null)
const byModality = ref(null)
const approvalRate = ref(null)
const processingTime = ref(null)
const trend = ref(null)

// Referencias para gráficas
const statusChart = ref(null)
const modalityChart = ref(null)
const approvalChart = ref(null)
const trendChart = ref(null)

let statusChartInstance = null
let modalityChartInstance = null
let approvalChartInstance = null
let trendChartInstance = null

// ==================== COMPUTED ====================
const hasStatusData = computed(() => {
  return byStatus.value && Array.isArray(byStatus.value) && byStatus.value.length > 0
})

const hasModalityData = computed(() => {
  return byModality.value && Array.isArray(byModality.value) && byModality.value.length > 0
})

const hasApprovalData = computed(() => {
  if (!approvalRate.value) return false
  if (typeof approvalRate.value === 'object' && !Array.isArray(approvalRate.value)) {
    return true
  }
  if (Array.isArray(approvalRate.value) && approvalRate.value.length > 0) {
    return true
  }
  return false
})

const hasProcessingData = computed(() => {
  if (!processingTime.value) return false
  if (typeof processingTime.value === 'object' && !Array.isArray(processingTime.value)) {
    return processingTime.value.avgProcessingTime !== undefined
  }
  return false
})

const hasTrendData = computed(() => {
  return trend.value && Array.isArray(trend.value) && trend.value.length > 0
})

// ==================== FUNCIONES PRINCIPALES ====================

const loadAllStatistics = async () => {
  loading.value = true
  statisticsLoaded.value = false
  
  try {
    const [
      statusRes,
      modalityRes,
      approvalRes,
      processingRes,
      trendRes
    ] = await Promise.all([
      getData('/statistics/preregistrations/by-status').catch(err => {
        console.error('Error en by-status:', err)
        return null
      }),
      getData('/statistics/preregistrations/by-modality').catch(err => {
        console.error('Error en by-modality:', err)
        return null
      }),
      getData('/statistics/preregistrations/approval-rate').catch(err => {
        console.error('Error en approval-rate:', err)
        return null
      }),
      getData('/statistics/preregistrations/processing-time').catch(err => {
        console.error('Error en processing-time:', err)
        return null
      }),
      getData('/statistics/preregistrations/trend?months=12').catch(err => {
        console.error('Error en trend:', err)
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

    byStatus.value = processResponse(statusRes)
    byModality.value = processResponse(modalityRes)
    approvalRate.value = processResponse(approvalRes)
    processingTime.value = processResponse(processingRes)
    trend.value = processResponse(trendRes)
    
    statisticsLoaded.value = true
    
    console.log('Estadísticas cargadas:', {
      byStatus: byStatus.value,
      byModality: byModality.value,
      approvalRate: approvalRate.value,
      processingTime: processingTime.value,
      trend: trend.value
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

// ==================== FUNCIONES AUXILIARES ====================

const formatDays = (days) => {
  if (days === null || days === undefined) return 'N/A'
  return `${Math.round(days)} días`
}

// ==================== FUNCIONES DE GRÁFICAS ====================

const destroyCharts = () => {
  if (statusChartInstance) {
    statusChartInstance.destroy()
    statusChartInstance = null
  }
  if (modalityChartInstance) {
    modalityChartInstance.destroy()
    modalityChartInstance = null
  }
  if (approvalChartInstance) {
    approvalChartInstance.destroy()
    approvalChartInstance = null
  }
  if (trendChartInstance) {
    trendChartInstance.destroy()
    trendChartInstance = null
  }
}

const renderCharts = () => {
  destroyCharts()
  
  setTimeout(() => {
    if (hasStatusData.value && statusChart.value) {
      console.log('Renderizando statusChart con datos:', byStatus.value)
      renderStatusChart()
    }
    
    if (hasModalityData.value && modalityChart.value) {
      console.log('Renderizando modalityChart con datos:', byModality.value)
      renderModalityChart()
    }
    
    if (hasApprovalData.value && approvalChart.value) {
      console.log('Renderizando approvalChart con datos:', approvalRate.value)
      renderApprovalChart()
    }
    
    if (hasTrendData.value && trendChart.value) {
      console.log('Renderizando trendChart con datos:', trend.value)
      renderTrendChart()
    }
  }, 100)
}

const renderStatusChart = () => {
  const ctx = statusChart.value.getContext('2d')
  const data = byStatus.value

  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(item => {
        if (typeof item._id === 'object' && item._id !== null) {
          return item._id.name || item._id.status || 'Sin estado'
        }
        if (item._id === null || item._id === undefined) {
          return 'Sin estado'
        }
        return item._id
      }),
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

const renderModalityChart = () => {
  const ctx = modalityChart.value.getContext('2d')
  const data = byModality.value

  modalityChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => {
        if (typeof item._id === 'object' && item._id !== null) {
          return item._id.name || item._id.modality || 'Sin modalidad'
        }
        if (item._id === null || item._id === undefined) {
          return 'Sin modalidad'
        }
        return item._id
      }),
      datasets: [{
        label: 'Pre-Registros',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: 'rgba(52, 152, 219, 1)',
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

const renderApprovalChart = () => {
  const ctx = approvalChart.value.getContext('2d')
  const data = approvalRate.value

  let labels = []
  let chartData = []

  if (Array.isArray(data)) {
    labels = data.map(item => item._id || item.status || 'Sin estado')
    chartData = data.map(item => item.count || item.value || 0)
  } else if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data)
    labels = keys.map(key => {
      const translations = {
        'approved': 'Aprobados',
        'rejected': 'Rechazados',
        'pending': 'Pendientes',
        'approvalRate': 'Tasa de Aprobación (%)',
        'rejectionRate': 'Tasa de Rechazo (%)'
      }
      return translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    })
    chartData = keys.map(key => data[key] || 0)
  }

  approvalChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: chartData,
        backgroundColor: [
          'rgba(46, 204, 113, 0.8)',
          'rgba(231, 76, 60, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(52, 152, 219, 0.8)'
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

const renderTrendChart = () => {
  const ctx = trendChart.value.getContext('2d')
  const data = trend.value

  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(item => {
        if (item._id && item._id.year && item._id.month) {
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
          return `${monthNames[item._id.month - 1]} ${item._id.year}`
        }
        return item._id || 'Sin fecha'
      }),
      datasets: [{
        label: 'Pre-Registros',
        data: data.map(item => item.count),
        borderColor: 'rgba(52, 152, 219, 1)',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
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
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}
</script>

<style lang="sass" scoped>
.preregistrations-statistics-page
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