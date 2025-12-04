<template>
  <q-page class="q-pa-md projects-statistics-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Estadísticas de Proyectos" 
              description="Indicadores y análisis de proyectos formativos del sistema." 
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
                Cargando estadísticas de proyectos...
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Contenido de estadísticas -->
        <template v-else-if="statisticsLoaded">
          <div class="row q-col-gutter-md">
            <!-- Proyectos por Tipo -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Proyectos por Tipo</div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    Individuales vs grupales
                  </div>
                  <div class="chart-container-medium">
                    <canvas ref="typeChart"></canvas>
                    <div v-if="!hasTypeData" class="empty-chart-message">
                      <q-icon name="pie_chart" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de proyectos por tipo
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Proyectos por Modalidad -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Proyectos por Modalidad</div>
                  <div class="chart-container-medium">
                    <canvas ref="modalityChart"></canvas>
                    <div v-if="!hasModalityData" class="empty-chart-message">
                      <q-icon name="donut_small" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de proyectos por modalidad
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Proyectos por Estado -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Proyectos por Estado</div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    Activos, completados y cancelados
                  </div>
                  <div class="chart-container-medium">
                    <canvas ref="statusChart"></canvas>
                    <div v-if="!hasStatusData" class="empty-chart-message">
                      <q-icon name="donut_large" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de proyectos por estado
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Análisis de Duración -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Análisis de Duración</div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    Duración promedio de proyectos
                  </div>
                  <div class="chart-container-medium">
                    <div v-if="hasDurationData" class="q-pa-md">
                      <div class="text-center">
                        <div class="text-h3 text-primary">{{ formatDays(durationAnalysis.avgDuration) }}</div>
                        <div class="text-subtitle2 text-grey-7">Promedio de días</div>
                      </div>
                      <q-separator class="q-my-md" />
                      <div class="row q-col-gutter-sm">
                        <div class="col-6 text-center">
                          <div class="text-h6">{{ formatDays(durationAnalysis.minDuration) }}</div>
                          <div class="text-caption text-grey-7">Mínimo</div>
                        </div>
                        <div class="col-6 text-center">
                          <div class="text-h6">{{ formatDays(durationAnalysis.maxDuration) }}</div>
                          <div class="text-caption text-grey-7">Máximo</div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="empty-chart-message">
                      <q-icon name="schedule" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de duración
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Tasa de Completitud -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Tasa de Completitud</div>
                  <div class="chart-container-medium">
                    <canvas ref="completionChart"></canvas>
                    <div v-if="!hasCompletionData" class="empty-chart-message">
                      <q-icon name="donut_large" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de tasa de completitud
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Proyectos por Empresa -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Proyectos por Empresa (Top 20)</div>
                  <div class="chart-container-medium">
                    <canvas ref="companyChart"></canvas>
                    <div v-if="!hasCompanyData" class="empty-chart-message">
                      <q-icon name="business" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de proyectos por empresa
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

// ==================== COMPOSABLES ====================
const { error, success } = useNotifications()

// ==================== ESTADOS ====================
const loading = ref(false)
const statisticsLoaded = ref(false)
const byType = ref(null)
const byModality = ref(null)
const byStatus = ref(null)
const durationAnalysis = ref(null)
const completionRate = ref(null)
const byCompany = ref(null)

// Referencias para gráficas
const typeChart = ref(null)
const modalityChart = ref(null)
const statusChart = ref(null)
const completionChart = ref(null)
const companyChart = ref(null)

let typeChartInstance = null
let modalityChartInstance = null
let statusChartInstance = null
let completionChartInstance = null
let companyChartInstance = null

// ==================== COMPUTED ====================
const hasTypeData = computed(() => {
  return byType.value && Array.isArray(byType.value) && byType.value.length > 0
})

const hasModalityData = computed(() => {
  return byModality.value && Array.isArray(byModality.value) && byModality.value.length > 0
})

const hasStatusData = computed(() => {
  return byStatus.value && Array.isArray(byStatus.value) && byStatus.value.length > 0
})

const hasDurationData = computed(() => {
  if (!durationAnalysis.value) return false
  if (typeof durationAnalysis.value === 'object' && !Array.isArray(durationAnalysis.value)) {
    return durationAnalysis.value.avgDuration !== undefined
  }
  return false
})

const hasCompletionData = computed(() => {
  if (!completionRate.value) return false
  if (Array.isArray(completionRate.value) && completionRate.value.length > 0) {
    return true
  }
  if (typeof completionRate.value === 'object' && !Array.isArray(completionRate.value)) {
    return true
  }
  return false
})

const hasCompanyData = computed(() => {
  return byCompany.value && Array.isArray(byCompany.value) && byCompany.value.length > 0
})

// ==================== FUNCIONES AUXILIARES ====================
const formatDays = (days) => {
  if (days === null || days === undefined) return 'N/A'
  return `${Math.round(days)} días`
}

const processResponse = (res) => {
  if (!res) return null
  const data = res.data || res
  if (Array.isArray(data)) return data
  if (typeof data === 'object') return data
  return data
}

// ==================== FUNCIONES PRINCIPALES ====================
const loadAllStatistics = async () => {
  loading.value = true
  statisticsLoaded.value = false
  
  try {
    const [
      typeRes,
      modalityRes,
      statusRes,
      durationRes,
      completionRes,
      companyRes
    ] = await Promise.all([
      getData('/statistics/projects/by-type').catch(err => {
        console.error('Error en by-type:', err)
        return null
      }),
      getData('/statistics/projects/by-modality').catch(err => {
        console.error('Error en by-modality:', err)
        return null
      }),
      getData('/statistics/projects/by-status').catch(err => {
        console.error('Error en by-status:', err)
        return null
      }),
      getData('/statistics/projects/duration-analysis').catch(err => {
        console.error('Error en duration-analysis:', err)
        return null
      }),
      getData('/statistics/projects/completion-rate').catch(err => {
        console.error('Error en completion-rate:', err)
        return null
      }),
      getData('/statistics/projects/by-company').catch(err => {
        console.error('Error en by-company:', err)
        return null
      })
    ])

    byType.value = processResponse(typeRes)
    byModality.value = processResponse(modalityRes)
    byStatus.value = processResponse(statusRes)
    durationAnalysis.value = processResponse(durationRes)
    completionRate.value = processResponse(completionRes)
    byCompany.value = processResponse(companyRes)
    
    statisticsLoaded.value = true
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
  if (typeChartInstance) {
    typeChartInstance.destroy()
    typeChartInstance = null
  }
  if (modalityChartInstance) {
    modalityChartInstance.destroy()
    modalityChartInstance = null
  }
  if (statusChartInstance) {
    statusChartInstance.destroy()
    statusChartInstance = null
  }
  if (completionChartInstance) {
    completionChartInstance.destroy()
    completionChartInstance = null
  }
  if (companyChartInstance) {
    companyChartInstance.destroy()
    companyChartInstance = null
  }
}

const renderCharts = () => {
  destroyCharts()
  
  setTimeout(() => {
    if (hasTypeData.value && typeChart.value) {
      renderTypeChart()
    }
    
    if (hasModalityData.value && modalityChart.value) {
      renderModalityChart()
    }
    
    if (hasStatusData.value && statusChart.value) {
      renderStatusChart()
    }
    
    if (hasCompletionData.value && completionChart.value) {
      renderCompletionChart()
    }
    
    if (hasCompanyData.value && companyChart.value) {
      renderCompanyChart()
    }
  }, 100)
}

const renderTypeChart = () => {
  const ctx = typeChart.value.getContext('2d')
  const data = byType.value

  typeChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(item => {
        if (typeof item._id === 'object' && item._id !== null) {
          return item._id.name || item._id.type || 'Sin tipo'
        }
        if (item._id === null || item._id === undefined) {
          return 'Sin tipo'
        }
        return item._id
      }),
      datasets: [{
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(52, 152, 219, 0.8)',
          'rgba(46, 204, 113, 0.8)',
          'rgba(155, 89, 182, 0.8)'
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
    type: 'doughnut',
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
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(241, 196, 15, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(46, 204, 113, 0.8)',
          'rgba(155, 89, 182, 0.8)'
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
          'rgba(52, 152, 219, 0.8)',
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

const renderCompletionChart = () => {
  const ctx = completionChart.value.getContext('2d')
  const data = completionRate.value

  let labels = []
  let chartData = []

  if (Array.isArray(data)) {
    labels = data.map(item => item._id || item.status || 'Sin estado')
    chartData = data.map(item => item.count || item.value || 0)
  } else if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data)
    labels = keys.map(key => {
      const translations = {
        'completed': 'Completados',
        'active': 'Activos',
        'cancelled': 'Cancelados',
        'completionRate': 'Tasa de Completitud (%)'
      }
      return translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    })
    chartData = keys.map(key => data[key] || 0)
  }

  completionChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: chartData,
        backgroundColor: [
          'rgba(46, 204, 113, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(231, 76, 60, 0.8)',
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

const renderCompanyChart = () => {
  const ctx = companyChart.value.getContext('2d')
  const data = byCompany.value

  companyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => {
        if (typeof item._id === 'object' && item._id !== null) {
          return item._id.name || item._id.company || 'Sin empresa'
        }
        if (item._id === null || item._id === undefined) {
          return 'Sin empresa'
        }
        return item._id
      }),
      datasets: [{
        label: 'Proyectos',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(155, 89, 182, 0.7)',
        borderColor: 'rgba(155, 89, 182, 1)',
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
.projects-statistics-page
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