<template>
  <q-page class="q-pa-md instructors-statistics-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Estadísticas de Instructores" description="Indicadores del desempeño y carga de instructores." />
          </q-card-section>
        </q-card>

        <!-- Filtros y Acciones -->
        <div class="filters-wrapper q-my-lg">
          <q-card class="shadow-1">
            <q-card-section>
              <div class="row q-col-gutter-md items-end">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="filters.startDate"
                    outlined
                    dense
                    type="date"
                    label="Fecha Inicio"
                    clearable
                  >
                    <template #prepend>
                      <q-icon name="event" color="primary" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="filters.endDate"
                    outlined
                    dense
                    type="date"
                    label="Fecha Fin"
                    clearable
                  >
                    <template #prepend>
                      <q-icon name="event" color="primary" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <div class="row q-gutter-sm">
                    <Button
                      label="Generar"
                      custom-class="gradient-btn"
                      icon="analytics"
                      @click="generateStatistics"
                      :loading="loading"
                    />
                    <Button
                      label="Repfora EP"
                      custom-class="gradient-btn"
                      icon="school"
                      @click="fetchRepforaStats"
                      :loading="loadingRepfora"
                    />
                    <Button
                      label="Limpiar"
                      custom-class="boton-cerrar"
                      icon="clear"
                      @click="clearFilters"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Resumen Principal -->
        <div v-if="statistics" class="q-mb-lg">
          <q-card class="shadow-1 summary-card">
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <div class="summary-item">
                    <q-icon name="school" size="48px" color="primary" />
                    <div class="summary-value">{{ statistics.totalInstructors || 0 }}</div>
                    <div class="summary-label">Total Instructores</div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="summary-item">
                    <q-icon name="access_time" size="48px" color="secondary" />
                    <div class="summary-value">
                      {{ statistics.hoursStatistics?.totalCapacityHours || 0 }}
                    </div>
                    <div class="summary-label">Horas Capacidad Total</div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="summary-item">
                    <q-icon name="schedule" size="48px" color="accent" />
                    <div class="summary-value">
                      {{ statistics.hoursStatistics?.totalWorkedHours || 0 }}
                    </div>
                    <div class="summary-label">Horas Trabajadas Total</div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="summary-item">
                    <q-icon name="timeline" size="48px" color="positive" />
                    <div class="summary-value">
                      {{ statistics.hoursStatistics?.avgWorkedHours?.toFixed(1) || 0 }}
                    </div>
                    <div class="summary-label">Promedio Horas Trabajadas</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráficas -->
        <div v-if="statistics" class="row q-col-gutter-md q-mb-lg">
          <!-- Por Área Temática -->
          <div v-if="statistics.byThematicArea?.length" class="col-12 col-md-6">
            <q-card class="shadow-1">
              <q-card-section>
                <div class="text-h6 q-mb-md">Por Área Temática</div>
                <div class="chart-container-medium">
                  <canvas ref="thematicAreaChart"></canvas>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Por Tipo de Vinculación -->
          <div v-if="statistics.byBindingType?.length" class="col-12 col-md-6">
            <q-card class="shadow-1">
              <q-card-section>
                <div class="text-h6 q-mb-md">Por Tipo de Vinculación</div>
                <div class="chart-container-medium">
                  <canvas ref="bindingTypeChart"></canvas>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Top Instructores -->
        <div v-if="statistics?.topInstructors?.length" class="q-mb-lg">
          <q-card class="shadow-1">
            <q-card-section>
              <div class="text-h6 q-mb-md">Top 10 Instructores (Horas Trabajadas)</div>
              <Table
                card
                :rows="statistics.topInstructors"
                :columns="topInstructorsColumns"
                row-key="_id"
                :hide-pagination="true"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Estadísticas REPFORA EP -->
        <div v-if="repforaStats" class="q-mb-lg">
          <q-card class="shadow-1">
            <q-card-section>
              <div class="text-h6 q-mb-md">Instructores en REPFORA EP</div>
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-3">
                  <q-card flat bordered class="stat-mini-card">
                    <q-card-section>
                      <div class="text-caption text-grey-7">Total Únicos</div>
                      <div class="text-h5 text-primary">
                        {{ repforaStats.uniqueInstructors || 0 }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-3">
                  <q-card flat bordered class="stat-mini-card">
                    <q-card-section>
                      <div class="text-caption text-grey-7">Técnicos</div>
                      <div class="text-h5 text-secondary">
                        {{ repforaStats.technicalInstructors || 0 }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-3">
                  <q-card flat bordered class="stat-mini-card">
                    <q-card-section>
                      <div class="text-caption text-grey-7">Proyecto</div>
                      <div class="text-h5 text-accent">
                        {{ repforaStats.projectInstructors || 0 }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-3">
                  <q-card flat bordered class="stat-mini-card">
                    <q-card-section>
                      <div class="text-caption text-grey-7">Seguimiento</div>
                      <div class="text-h5 text-positive">
                        {{ repforaStats.followInstructors || 0 }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Tabla de instructores por área temática -->
              <div v-if="repforaStats.instructorsByThematicArea?.length">
                <div class="text-subtitle1 q-mb-sm">Distribución por Área Temática</div>
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="area in repforaStats.instructorsByThematicArea"
                    :key="area._id"
                    class="col-12 col-md-6 col-lg-4"
                  >
                    <q-card flat bordered>
                      <q-card-section class="q-pa-sm">
                        <div class="text-weight-bold">{{ area._id }}</div>
                        <div class="text-caption text-grey-7">
                          {{ area.count }} instructor(es)
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Estado Vacío -->
        <div v-if="!statistics && !repforaStats && !loading && !loadingRepfora" class="empty-state">
          <q-card class="shadow-1">
            <q-card-section class="text-center q-pa-xl">
              <q-icon name="analytics" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md text-grey-7">
                No hay estadísticas para mostrar
              </div>
              <div class="text-body2 text-grey-6 q-mt-sm">
                Presiona "Generar" para estadísticas generales o "Repfora EP" para instructores asignados
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

const { error, success } = useNotifications()

const loading = ref(false)
const loadingRepfora = ref(false)
const statistics = ref(null)
const repforaStats = ref(null)
const thematicAreaChart = ref(null)
const bindingTypeChart = ref(null)

let thematicChartInstance = null
let bindingChartInstance = null

const filters = ref({
  startDate: '',
  endDate: ''
})

const topInstructorsColumns = [
  { name: 'name', label: 'Nombre', align: 'left', field: 'name' },
  { name: 'thematicarea', label: 'Área Temática', align: 'center', field: 'thematicarea' },
  { name: 'bindingtype', label: 'Tipo Vinculación', align: 'center', field: 'bindingtype' },
  { name: 'caphour', label: 'Cap. Horas', align: 'center', field: 'caphour' },
  { name: 'hourswork', label: 'Horas Trabajadas', align: 'center', field: 'hourswork' }
]

const generateStatistics = async () => {
  loading.value = true
  try {
    const payload = {}
    
    if (filters.value.startDate && filters.value.endDate) {
      payload.startDate = filters.value.startDate
      payload.endDate = filters.value.endDate
    } else if (filters.value.startDate || filters.value.endDate) {
      error('Debes especificar ambas fechas o ninguna')
      loading.value = false
      return
    }

    const response = await postData('/statistics/generate/instructors', payload)
    success(response?.msg || 'Estadísticas generadas correctamente')
    
    statistics.value = response?.data || null
    await nextTick()
    renderCharts()
  } catch (err) {
    const message = err?.response?.data?.msg || err?.message || 'Error al generar estadísticas'
    error(message)
  } finally {
    loading.value = false
  }
}

const fetchRepforaStats = async () => {
  loadingRepfora.value = true
  try {
    const response = await getData('/statistics/instructors/repfora')
    repforaStats.value = response?.data || null
    success('Estadísticas de REPFORA EP obtenidas correctamente')
  } catch (err) {
    const message = err?.response?.data?.msg || err?.message || 'Error al obtener estadísticas'
    error(message)
  } finally {
    loadingRepfora.value = false
  }
}

const clearFilters = () => {
  filters.value.startDate = ''
  filters.value.endDate = ''
  statistics.value = null
  repforaStats.value = null
  destroyCharts()
}

const destroyCharts = () => {
  if (thematicChartInstance) {
    thematicChartInstance.destroy()
    thematicChartInstance = null
  }
  if (bindingChartInstance) {
    bindingChartInstance.destroy()
    bindingChartInstance = null
  }
}

const renderCharts = () => {
  destroyCharts()
  
  if (statistics.value?.byThematicArea?.length && thematicAreaChart.value) {
    renderThematicAreaChart()
  }
  
  if (statistics.value?.byBindingType?.length && bindingTypeChart.value) {
    renderBindingTypeChart()
  }
}

const renderThematicAreaChart = () => {
  const ctx = thematicAreaChart.value.getContext('2d')
  const data = statistics.value.byThematicArea

  thematicChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(item => item._id),
      datasets: [{
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(45, 178, 0, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(155, 89, 182, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(231, 76, 60, 0.8)',
          'rgba(26, 188, 156, 0.8)'
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

const renderBindingTypeChart = () => {
  const ctx = bindingTypeChart.value.getContext('2d')
  const data = statistics.value.byBindingType

  bindingChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item._id),
      datasets: [{
        label: 'Instructores',
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
</script>

<style lang="scss" scoped>
.instructors-statistics-page {
  background: #f5f7fb;
  min-height: 100vh;
}

.hero-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%);
}

.filters-wrapper {
  .q-card {
    border-radius: 16px;
  }
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

.chart-container-medium {
  height: 300px;
  position: relative;
}

.stat-mini-card {
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.empty-state {
  .q-card {
    border-radius: 16px;
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
}
</style>