<template>
  <q-page class="q-pa-md hours-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Resumen de horas" />
          </q-card-section>
        </q-card>

        <div class="container">
          <div class="table-wrapper">
            <Table
              :rows="rowsHoras"
              :columns="columns"
              row-key="actividad"
              :loading="isLoading"
            />
          </div>

          <div class="summary-wrapper">
            <div class="summary-card">
              <span>Total ejecutado :</span>
              <strong>{{ totalEjecutado }}h</strong>
            </div>
            <div class="summary-card">
              <span>Disponibles :</span>
              <strong>{{ horasDisponibles }}h</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Table from 'src/components/Table.vue'

const route = useRoute()

const filtros = ref({
  instructor: route.query.instructor || null,
  anio: route.query.anio || null
})

const columns = [
  { name: 'actividad', label: 'Actividad', field: 'actividad', align: 'center' },
  { name: 'asignadas', label: 'Horas Asignadas', field: 'asignadas', align: 'center' },
  { name: 'ejecutadas', label: 'Horas Ejecutadas', field: 'ejecutadas', align: 'center' },
  { name: 'pendientes', label: 'Horas Pendientes', field: 'pendientes', align: 'center' }
]

const rowsHoras = ref([
  { actividad: 'Bitácoras', asignadas: '2H', ejecutadas: '10H', pendientes: '5H' },
  { actividad: 'Seguimientos', asignadas: '2H', ejecutadas: '10H', pendientes: '5H' },
  { actividad: 'Seguimientos extraordinarios', asignadas: '2H', ejecutadas: '10H', pendientes: '5H' },
  { actividad: 'Certificación', asignadas: '2H', ejecutadas: '10H', pendientes: '5H' }
])

const totalEjecutado = ref(80)
const horasDisponibles = ref(100)
const isLoading = ref(false)

const obtenerDatos = async () => {
  isLoading.value = true
  try {
    // const response = await getData('/api/instructor/horas', { params: filtros.value })
    // rowsHoras.value = response.data.detalle
    // totalEjecutado.value = response.data.totalEjecutado
    // horasDisponibles.value = response.data.horasDisponibles
  } catch (error) {
    // TODO: Manejar error
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  obtenerDatos()
})
</script>

<style lang="sass" scoped>
.hours-page
  background: #f5f7fb
  min-height: 100vh

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.container
  max-width: 900px
  margin: 0 auto

.table-wrapper
  background: #fff
  border-radius: 20px
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08)
  padding: 20px

.summary-wrapper
  display: flex
  justify-content: center
  gap: 60px
  margin-top: 32px
  flex-wrap: wrap

.summary-card
  background: #f5f5f5
  padding: 16px 24px
  border-radius: 16px
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08)
  font-size: 1.1rem
  display: flex
  align-items: center
  gap: 8px
  color: #4a4a4a

.summary-card strong
  font-size: 1.4rem
  color: #222

@media (max-width: 768px)
  .table-wrapper
    padding: 16px
  .summary-wrapper
    gap: 16px
    margin-top: 24px
  .summary-card
    width: 100%
    justify-content: space-between

@media (max-width: 480px)
  .table-wrapper
    padding: 12px
  .summary-card
    flex-direction: column
    align-items: flex-start
    gap: 4px
</style>