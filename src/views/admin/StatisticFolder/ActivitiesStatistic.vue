<template>
  <q-page class="q-pa-md activities-statistics-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Estadísticas de Actividades" 
              description="Indicadores y análisis de actividades del sistema." 
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
                Cargando estadísticas de actividades...
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Contenido de estadísticas - SIEMPRE SE MUESTRA después de cargar -->
        <template v-else-if="statisticsLoaded">
          <div class="row q-col-gutter-md">
            <!-- Actividades por Tipo -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Actividades por Tipo</div>
                  <div class="chart-container-medium">
                    <canvas ref="typeChart"></canvas>
                    <div v-if="!hasTypeData" class="empty-chart-message">
                      <q-icon name="pie_chart" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de actividades por tipo
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Actividades por Estado -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Actividades por Estado</div>
                  <div class="chart-container-medium">
                    <canvas ref="statusChart"></canvas>
                    <div v-if="!hasStatusData" class="empty-chart-message">
                      <q-icon name="donut_small" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de actividades por estado
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Actividades por Estado de Pago -->
            <div class="col-12 col-md-6">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Actividades por Estado de Pago</div>
                  <div class="chart-container-medium">
                    <canvas ref="paymentStatusChart"></canvas>
                    <div v-if="!hasPaymentStatusData" class="empty-chart-message">
                      <q-icon name="bar_chart" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de actividades por estado de pago
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

            <!-- Actividades Pendientes por Instructor -->
            <div class="col-12">
              <q-card class="shadow-1">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Actividades Pendientes por Instructor</div>
                  <div class="chart-container-large">
                    <canvas ref="instructorChart"></canvas>
                    <div v-if="!hasInstructorData" class="empty-chart-message">
                      <q-icon name="person" size="48px" color="grey-4" />
                      <div class="text-body2 text-grey-6 q-mt-sm">
                        No hay datos de actividades pendientes por instructor
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="hasInstructorData" class="q-mt-md">
                    <Table
                      card
                      :rows="pendingByInstructor"
                      :columns="instructorColumns"
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

        <!-- Estado Vacío - Solo antes de cargar por primera vez -->
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
const byType = ref(null)
const byStatus = ref(null)
const byPaymentStatus = ref(null)
const completionRate = ref(null)
const pendingByInstructor = ref(null)

// Referencias para gráficas
const typeChart = ref(null)
const statusChart = ref(null)
const paymentStatusChart = ref(null)
const completionChart = ref(null)
const instructorChart = ref(null)

let typeChartInstance = null
let statusChartInstance = null
let paymentStatusChartInstance = null
let completionChartInstance = null
let instructorChartInstance = null

// ==================== COMPUTED ====================
const hasTypeData = computed(() => {
  return byType.value && Array.isArray(byType.value) && byType.value.length > 0
})

const hasStatusData = computed(() => {
  return byStatus.value && Array.isArray(byStatus.value) && byStatus.value.length > 0
})

const hasPaymentStatusData = computed(() => {
  return byPaymentStatus.value && Array.isArray(byPaymentStatus.value) && byPaymentStatus.value.length > 0
})

const hasCompletionData = computed(() => {
  if (!completionRate.value) return false
  // Si es un objeto, verificar que al menos tenga un valor mayor que 0
  if (typeof completionRate.value === 'object' && !Array.isArray(completionRate.value)) {
    const values = Object.values(completionRate.value)
    return values.some(v => typeof v === 'number' && v > 0)
  }
  // Si es un array, verificar que no esté vacío
  if (Array.isArray(completionRate.value)) {
    return completionRate.value.length > 0
  }
  return true
})

const hasInstructorData = computed(() => {
  return pendingByInstructor.value && Array.isArray(pendingByInstructor.value) && pendingByInstructor.value.length > 0
})

// ==================== COLUMNAS DE TABLAS ====================
const instructorColumns = [
  { name: '_id', label: 'Instructor', align: 'left', field: '_id' },
  { name: 'count', label: 'Actividades Pendientes', align: 'center', field: 'count' }
]

// ==================== FUNCIONES PRINCIPALES ====================

const loadAllStatistics = async () => {
  loading.value = true
  statisticsLoaded.value = false
  
  try {
    // Cargar todas las estadísticas
    const [
      typeRes,
      statusRes,
      paymentStatusRes,
      completionRes,
      pendingByInstructorRes
    ] = await Promise.all([
      getData('/statistics/activities/by-type').catch(err => {
        console.error('Error en by-type:', err)
        return null
      }),
      getData('/statistics/activities/by-status').catch(err => {
        console.error('Error en by-status:', err)
        return null
      }),
      getData('/statistics/activities/by-payment-status').catch(err => {
        console.error('Error en by-payment-status:', err)
        return null
      }),
      getData('/statistics/activities/completion-rate').catch(err => {
        console.error('Error en completion-rate:', err)
        return null
      }),
      getData('/statistics/activities/pending-by-instructor').catch(err => {
        console.error('Error en pending-by-instructor:', err)
        return null
      })
    ])

    // Procesar respuestas - pueden venir con o sin .data
    const processResponse = (res) => {
      if (!res) return null
      const data = res.data || res
      // NO retornar null para arrays vacíos, queremos mantenerlos
      if (Array.isArray(data)) return data
      // NO retornar null para objetos vacíos en completion rate
      if (typeof data === 'object') return data
      return data
    }

    byType.value = processResponse(typeRes)
    byStatus.value = processResponse(statusRes)
    byPaymentStatus.value = processResponse(paymentStatusRes)
    completionRate.value = processResponse(completionRes)
    pendingByInstructor.value = processResponse(pendingByInstructorRes)
    
    // Marcar que las estadísticas fueron cargadas
    statisticsLoaded.value = true
    
    // Log para debug
    console.log('Estadísticas cargadas:', {
      byType: byType.value,
      byStatus: byStatus.value,
      byPaymentStatus: byPaymentStatus.value,
      completionRate: completionRate.value,
      pendingByInstructor: pendingByInstructor.value
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
  if (typeChartInstance) {
    typeChartInstance.destroy()
    typeChartInstance = null
  }
  if (statusChartInstance) {
    statusChartInstance.destroy()
    statusChartInstance = null
  }
  if (paymentStatusChartInstance) {
    paymentStatusChartInstance.destroy()
    paymentStatusChartInstance = null
  }
  if (completionChartInstance) {
    completionChartInstance.destroy()
    completionChartInstance = null
  }
  if (instructorChartInstance) {
    instructorChartInstance.destroy()
    instructorChartInstance = null
  }
}

const renderCharts = () => {
  destroyCharts()
  
  // Renderizar cada gráfico, incluso si no tiene datos mostraremos el mensaje
  if (hasTypeData.value && typeChart.value) {
    console.log('Renderizando typeChart con datos:', byType.value)
    renderTypeChart()
  }
  
  if (hasStatusData.value && statusChart.value) {
    console.log('Renderizando statusChart con datos:', byStatus.value)
    renderStatusChart()
  }
  
  if (hasPaymentStatusData.value && paymentStatusChart.value) {
    console.log('Renderizando paymentStatusChart con datos:', byPaymentStatus.value)
    renderPaymentStatusChart()
  }
  
  // Para completion rate, intentar renderizar si tiene el objeto (aunque tenga 0s)
  if (completionRate.value && completionChart.value) {
    console.log('Renderizando completionChart con datos:', completionRate.value)
    renderCompletionChart()
  }
  
  if (hasInstructorData.value && instructorChart.value) {
    console.log('Renderizando instructorChart con datos:', pendingByInstructor.value)
    renderInstructorChart()
  }
}

const renderTypeChart = () => {
  const ctx = typeChart.value.getContext('2d')
  const data = byType.value

  typeChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map(item => item._id || 'Sin tipo'),
      datasets: [{
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(45, 178, 0, 0.8)',
          'rgba(52, 152, 219, 0.8)',
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

const renderStatusChart = () => {
  const ctx = statusChart.value.getContext('2d')
  const data = byStatus.value

  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
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

const renderPaymentStatusChart = () => {
  const ctx = paymentStatusChart.value.getContext('2d')
  const data = byPaymentStatus.value

  paymentStatusChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item._id || 'Sin estado de pago'),
      datasets: [{
        label: 'Actividades',
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

const renderCompletionChart = () => {
  const ctx = completionChart.value.getContext('2d')
  const data = completionRate.value

  let chartData = []
  let labels = []

  console.log('Datos de completion rate:', data)

  // Manejar diferentes estructuras de respuesta
  if (Array.isArray(data)) {
    // Si es un array de objetos con _id y count
    labels = data.map(item => item._id || item.status || item.label || 'Sin estado')
    chartData = data.map(item => item.count || item.value || item.percentage || 0)
  } else if (typeof data === 'object' && data !== null) {
    // Si es un objeto con propiedades (como el que viene del endpoint)
    // Formatear las claves para que sean más legibles
    const keyTranslations = {
      'approved': 'Aprobadas',
      'rejected': 'Rechazadas',
      'pending': 'Pendientes',
      'total': 'Total',
      'completionRate': 'Tasa de Completitud (%)',
      'rejectionRate': 'Tasa de Rechazo (%)'
    }
    
    // Filtrar solo los datos relevantes para el gráfico (approved, rejected, pending)
    const relevantKeys = ['approved', 'rejected', 'pending']
    labels = relevantKeys.map(key => keyTranslations[key] || key)
    chartData = relevantKeys.map(key => data[key] || 0)
    
    // Si todos los valores son 0, poner valores mínimos para que se vea el gráfico
    if (chartData.every(val => val === 0)) {
      chartData = [1, 1, 1] // Valores iguales para que se vea el gráfico vacío
    }
  } else {
    console.warn('Estructura de datos no reconocida para completion rate')
    return
  }

  completionChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: chartData,
        backgroundColor: [
          'rgba(46, 204, 113, 0.8)',
          'rgba(231, 76, 60, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(52, 152, 219, 0.8)',
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
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || ''
              if (label) {
                label += ': '
              }
              // Si todos eran 0, mostrar 0
              const originalData = data[Object.keys(data)[context.dataIndex]]
              if (chartData.every(val => val === 1) && originalData === 0) {
                label += '0'
              } else {
                label += context.parsed
              }
              return label
            }
          }
        }
      }
    }
  })
}

const renderInstructorChart = () => {
  const ctx = instructorChart.value.getContext('2d')
  const data = pendingByInstructor.value

  instructorChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item._id || 'Sin instructor'),
      datasets: [{
        label: 'Actividades Pendientes',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(78, 205, 196, 0.7)',
        borderColor: 'rgba(78, 205, 196, 1)',
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
</script>

<style lang="sass" scoped>
.activities-statistics-page
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