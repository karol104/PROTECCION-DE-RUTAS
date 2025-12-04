<template>
  <q-page class="q-pa-md programs-statistics-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Estadísticas de Programas" 
              description="Indicadores y análisis de programas formativos del sistema." 
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
                Cargando estadísticas de programas...
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Contenido de estadísticas -->
        <template v-else-if="statisticsLoaded">
          <div class="row q-col-gutter-md">
            <!-- Programas por Nivel -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Programas por Nivel</div>
                  <div class="chart-container-medium">
                    <canvas ref="levelChart"></canvas>
                    <div v-if="!hasLevelData" class="empty-chart-message">
                      <q-icon name="pie_chart" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de programas por nivel
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Matrícula por Programa -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Matrícula por Programa</div>
                  <div class="chart-container-medium">
                    <canvas ref="enrollmentChart"></canvas>
                    <div v-if="!hasEnrollmentData" class="empty-chart-message">
                      <q-icon name="bar_chart" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de matrícula por programa
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Tasa de Completitud por Programa -->
            <div class="col-12">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Tasa de Completitud por Programa</div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    En desarrollo
                  </div>
                  <div class="chart-container-large">
                    <canvas ref="completionChart"></canvas>
                    <div v-if="!hasCompletionData" class="empty-chart-message">
                      <q-icon name="trending_up" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de tasa de completitud
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
const byLevel = ref(null)
const enrollment = ref(null)
const completionRate = ref(null)

// Referencias para gráficas
const levelChart = ref(null)
const enrollmentChart = ref(null)
const completionChart = ref(null)

let levelChartInstance = null
let enrollmentChartInstance = null
let completionChartInstance = null

// ==================== COMPUTED ====================
const hasLevelData = computed(() => {
  return byLevel.value && Array.isArray(byLevel.value) && byLevel.value.length > 0
})

const hasEnrollmentData = computed(() => {
  return enrollment.value && Array.isArray(enrollment.value) && enrollment.value.length > 0
})

const hasCompletionData = computed(() => {
  return completionRate.value && Array.isArray(completionRate.value) && completionRate.value.length > 0
})

// ==================== FUNCIONES PRINCIPALES ====================

const loadAllStatistics = async () => {
  loading.value = true
  statisticsLoaded.value = false
  
  try {
    const [
      levelRes,
      enrollmentRes,
      completionRes
    ] = await Promise.all([
      getData('/statistics/programs/by-level').catch(err => {
        console.error('Error en by-level:', err)
        return null
      }),
      getData('/statistics/programs/enrollment').catch(err => {
        console.error('Error en enrollment:', err)
        return null
      }),
      getData('/statistics/programs/completion-rate').catch(err => {
        console.error('Error en completion-rate:', err)
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

    byLevel.value = processResponse(levelRes)
    enrollment.value = processResponse(enrollmentRes)
    completionRate.value = processResponse(completionRes)
    
    statisticsLoaded.value = true
    
    console.log('Estadísticas cargadas:', {
      byLevel: byLevel.value,
      enrollment: enrollment.value,
      completionRate: completionRate.value
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
  if (levelChartInstance) {
    levelChartInstance.destroy()
    levelChartInstance = null
  }
  if (enrollmentChartInstance) {
    enrollmentChartInstance.destroy()
    enrollmentChartInstance = null
  }
  if (completionChartInstance) {
    completionChartInstance.destroy()
    completionChartInstance = null
  }
}

const renderCharts = () => {
  destroyCharts()
  
  setTimeout(() => {
    if (hasLevelData.value && levelChart.value) {
      console.log('Renderizando levelChart con datos:', byLevel.value)
      renderLevelChart()
    }
    
    if (hasEnrollmentData.value && enrollmentChart.value) {
      console.log('Renderizando enrollmentChart con datos:', enrollment.value)
      renderEnrollmentChart()
    }
    
    if (hasCompletionData.value && completionChart.value) {
      console.log('Renderizando completionChart con datos:', completionRate.value)
      renderCompletionChart()
    }
  }, 100)
}

const renderLevelChart = () => {
  const ctx = levelChart.value.getContext('2d')
  const data = byLevel.value

  levelChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(item => {
        if (typeof item._id === 'object' && item._id !== null) {
          return item._id.name || item._id.level || 'Sin nivel'
        }
        if (item._id === null || item._id === undefined) {
          return 'Sin nivel'
        }
        return item._id
      }),
      datasets: [{
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(52, 152, 219, 0.8)',
          'rgba(46, 204, 113, 0.8)',
          'rgba(155, 89, 182, 0.8)',
          'rgba(241, 196, 15, 0.8)',
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

const renderEnrollmentChart = () => {
  const ctx = enrollmentChart.value.getContext('2d')
  const data = enrollment.value

  enrollmentChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => {
        if (typeof item._id === 'object' && item._id !== null) {
          return item._id.name || item._id.program || 'Sin programa'
        }
        if (item._id === null || item._id === undefined) {
          return 'Sin programa'
        }
        return item._id
      }),
      datasets: [{
        label: 'Aprendices',
        data: data.map(item => item.count || item.enrollment || 0),
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
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}

const renderCompletionChart = () => {
  const ctx = completionChart.value.getContext('2d')
  const data = completionRate.value

  completionChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => {
        if (typeof item._id === 'object' && item._id !== null) {
          return item._id.name || item._id.program || 'Sin programa'
        }
        if (item._id === null || item._id === undefined) {
          return 'Sin programa'
        }
        return item._id
      }),
      datasets: [{
        label: 'Tasa de Completitud (%)',
        data: data.map(item => item.completionRate || item.rate || 0),
        backgroundColor: 'rgba(46, 204, 113, 0.7)',
        borderColor: 'rgba(46, 204, 113, 1)',
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
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%'
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.x.toFixed(1) + '%'
            }
          }
        }
      }
    }
  })
}
</script>

<style lang="sass" scoped>
.programs-statistics-page
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