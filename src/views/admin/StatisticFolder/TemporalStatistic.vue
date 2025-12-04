<template>
  <q-page class="q-pa-md temporal-statistics-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Estadísticas Temporales" 
              description="Indicadores y análisis temporales de registros en el sistema." 
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
                Cargando estadísticas temporales...
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Contenido de estadísticas -->
        <template v-else-if="statisticsLoaded">
          <div class="row q-col-gutter-md">
            <!-- Registros por Mes -->
            <div class="col-12">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Registros de Aprendices por Mes</div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    Últimos 12 meses
                  </div>
                  <div class="chart-container-large">
                    <canvas ref="monthChart"></canvas>
                    <div v-if="!hasMonthData" class="empty-chart-message">
                      <q-icon name="calendar_month" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de registros por mes
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Registros por Año -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Registros de Aprendices por Año</div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    Últimos 5 años
                  </div>
                  <div class="chart-container-medium">
                    <canvas ref="yearChart"></canvas>
                    <div v-if="!hasYearData" class="empty-chart-message">
                      <q-icon name="calendar_today" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de registros por año
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Comparación Mensual -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Comparación Mensual</div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    Mes actual vs mes anterior
                  </div>
                  <div class="chart-container-medium">
                    <div v-if="hasComparisonData" class="q-pa-md">
                      <div class="row q-col-gutter-md">
                        <div class="col-6 text-center">
                          <q-card flat bordered>
                            <q-card-section>
                              <div class="text-h4 text-primary">{{ monthlyComparison.currentMonth?.count || 0 }}</div>
                              <div class="text-subtitle2 text-grey-7">Mes Actual</div>
                              <div class="text-caption text-grey-6">{{ formatMonth(monthlyComparison.currentMonth) }}</div>
                            </q-card-section>
                          </q-card>
                        </div>
                        <div class="col-6 text-center">
                          <q-card flat bordered>
                            <q-card-section>
                              <div class="text-h4 text-grey-7">{{ monthlyComparison.previousMonth?.count || 0 }}</div>
                              <div class="text-subtitle2 text-grey-7">Mes Anterior</div>
                              <div class="text-caption text-grey-6">{{ formatMonth(monthlyComparison.previousMonth) }}</div>
                            </q-card-section>
                          </q-card>
                        </div>
                      </div>
                      <q-separator class="q-my-md" />
                      <div class="text-center">
                        <div :class="getComparisonClass()">
                          <q-icon :name="getComparisonIcon()" size="32px" />
                          <div class="text-h6">{{ getComparisonText() }}</div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="empty-chart-message">
                      <q-icon name="compare_arrows" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de comparación mensual
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
const registrationsByMonth = ref(null)
const registrationsByYear = ref(null)
const monthlyComparison = ref(null)

// Referencias para gráficas
const monthChart = ref(null)
const yearChart = ref(null)

let monthChartInstance = null
let yearChartInstance = null

// ==================== COMPUTED ====================
const hasMonthData = computed(() => {
  return registrationsByMonth.value && Array.isArray(registrationsByMonth.value) && registrationsByMonth.value.length > 0
})

const hasYearData = computed(() => {
  return registrationsByYear.value && Array.isArray(registrationsByYear.value) && registrationsByYear.value.length > 0
})

const hasComparisonData = computed(() => {
  if (!monthlyComparison.value) return false
  if (typeof monthlyComparison.value === 'object' && !Array.isArray(monthlyComparison.value)) {
    return monthlyComparison.value.currentMonth !== undefined || monthlyComparison.value.previousMonth !== undefined
  }
  return false
})

// ==================== FUNCIONES AUXILIARES ====================

const formatMonth = (monthData) => {
  if (!monthData || !monthData._id) return 'N/A'
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  if (monthData._id.year && monthData._id.month) {
    return `${monthNames[monthData._id.month - 1]} ${monthData._id.year}`
  }
  return 'N/A'
}

const getComparisonClass = () => {
  if (!monthlyComparison.value) return ''
  const current = monthlyComparison.value.currentMonth?.count || 0
  const previous = monthlyComparison.value.previousMonth?.count || 0
  
  if (current > previous) return 'text-positive'
  if (current < previous) return 'text-negative'
  return 'text-grey-7'
}

const getComparisonIcon = () => {
  if (!monthlyComparison.value) return 'remove'
  const current = monthlyComparison.value.currentMonth?.count || 0
  const previous = monthlyComparison.value.previousMonth?.count || 0
  
  if (current > previous) return 'trending_up'
  if (current < previous) return 'trending_down'
  return 'trending_flat'
}

const getComparisonText = () => {
  if (!monthlyComparison.value) return 'Sin cambios'
  const current = monthlyComparison.value.currentMonth?.count || 0
  const previous = monthlyComparison.value.previousMonth?.count || 0
  
  if (current === previous) return 'Sin cambios'
  
  const diff = current - previous
  const percentage = previous === 0 ? 100 : ((diff / previous) * 100).toFixed(1)
  
  if (diff > 0) {
    return `+${diff} (${percentage}%)`
  } else {
    return `${diff} (${percentage}%)`
  }
}

// ==================== FUNCIONES PRINCIPALES ====================

const loadAllStatistics = async () => {
  loading.value = true
  statisticsLoaded.value = false
  
  try {
    const [
      monthRes,
      yearRes,
      comparisonRes
    ] = await Promise.all([
      getData('/statistics/registrations-by-month?months=12').catch(err => {
        console.error('Error en registrations-by-month:', err)
        return null
      }),
      getData('/statistics/registrations-by-year?years=5').catch(err => {
        console.error('Error en registrations-by-year:', err)
        return null
      }),
      getData('/statistics/monthly-comparison').catch(err => {
        console.error('Error en monthly-comparison:', err)
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

    registrationsByMonth.value = processResponse(monthRes)
    registrationsByYear.value = processResponse(yearRes)
    monthlyComparison.value = processResponse(comparisonRes)
    
    statisticsLoaded.value = true
    
    console.log('Estadísticas cargadas:', {
      registrationsByMonth: registrationsByMonth.value,
      registrationsByYear: registrationsByYear.value,
      monthlyComparison: monthlyComparison.value
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
  if (monthChartInstance) {
    monthChartInstance.destroy()
    monthChartInstance = null
  }
  if (yearChartInstance) {
    yearChartInstance.destroy()
    yearChartInstance = null
  }
}

const renderCharts = () => {
  destroyCharts()
  
  setTimeout(() => {
    if (hasMonthData.value && monthChart.value) {
      console.log('Renderizando monthChart con datos:', registrationsByMonth.value)
      renderMonthChart()
    }
    
    if (hasYearData.value && yearChart.value) {
      console.log('Renderizando yearChart con datos:', registrationsByYear.value)
      renderYearChart()
    }
  }, 100)
}

const renderMonthChart = () => {
  const ctx = monthChart.value.getContext('2d')
  const data = registrationsByMonth.value

  monthChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(item => {
        if (item._id && item._id.year && item._id.month) {
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
          return `${monthNames[item._id.month - 1]} ${item._id.year}`
        }
        return 'Sin fecha'
      }),
      datasets: [{
        label: 'Registros',
        data: data.map(item => item.count),
        borderColor: 'rgba(52, 152, 219, 1)',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(52, 152, 219, 1)'
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

const renderYearChart = () => {
  const ctx = yearChart.value.getContext('2d')
  const data = registrationsByYear.value

  yearChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => {
        if (item._id && item._id.year) {
          return item._id.year.toString()
        }
        return 'Sin año'
      }),
      datasets: [{
        label: 'Registros',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(46, 204, 113, 0.7)',
        borderColor: 'rgba(46, 204, 113, 1)',
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
</script>

<style lang="sass" scoped>
.temporal-statistics-page
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