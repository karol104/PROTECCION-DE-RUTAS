<template>
  <q-page class="q-pa-md report-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Horas por Instructor" description="Consulta las horas asignadas y registradas por instructor." />
          </q-card-section>
        </q-card>

        <div class="container">
          <div class="reporte-card">
            <div class="reporte-header">
              <span>Filtros del reporte</span>
            </div>

            <div class="reporte-body">
              <div class="form-grid">
                <div class="form-item">
                  <label>Instructor</label>
                  <q-select
                    v-model="instructorSeleccionado"
                    :options="instructores"
                    option-label="nombre"
                    option-value="id"
                    outlined
                    placeholder="Seleccionar instructor"
                    dense
                    emit-value
                    map-options
                  />
                </div>

                <div class="form-item">
                  <label>Periodo</label>
                  <q-input
                    v-model="periodo"
                    type="date"
                    outlined
                    dense
                    placeholder="Seleccionar fecha"
                  />
                </div>

                <div class="form-item">
                  <label>Tipo de seguimiento</label>
                  <q-select
                    v-model="tipoSeguimientoSeleccionado"
                    :options="tiposSeguimiento"
                    outlined
                    placeholder="Seleccionar tipo de seguimiento"
                    dense
                  />
                </div>
              </div>

              <div class="actions">
                <Button
                  label="Limpiar"
                  custom-class="boton-cerrar"
                  @click="limpiarCampos"
                />
                <Button
                  label="Ver reporte"
                  custom-class="gradient-btn"
                  :to="{
                    path: '/app/admin/vistareporteporinstructor',
                    query: {
                      instructor: instructorSeleccionado,
                      periodo,
                      tipoSeguimiento: tipoSeguimientoSeleccionado
                    }
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Button from 'src/components/Button.vue'

//Variables reactivas
const instructorSeleccionado = ref(null)
const periodo = ref(null)
const tipoSeguimientoSeleccionado = ref(null)

//Listas
const instructores = ref([])
const tiposSeguimiento = ref([])

//Cargar datos del backend
const obtenerInstructores = async () => {
  try {
    // const response = await axios.get('/api/instructores')
    // instructores.value = response.data
    instructores.value = [
      { id: 1, nombre: 'Juan Pérez García' },
      { id: 2, nombre: 'María López Rodríguez' },
      { id: 3, nombre: 'Carlos Martínez Díaz' },
      { id: 4, nombre: 'Ana Gómez Sánchez' }
    ] // ejemplo temporal
  } catch (error) {  }
}

const obtenerTiposSeguimiento = async () => {
  try {
    // const response = await axios.get('/api/tiposseguimiento')
    // tiposSeguimiento.value = response.data
    tiposSeguimiento.value = [
      'Instructor Tecnico',
      'Instructor Seguimiento',
      'Instructor Proyecto'
    ] // ejemplo temporal
  } catch (error) {  }
}

const limpiarCampos = () => {
  instructorSeleccionado.value = null
  periodo.value = null
  tipoSeguimientoSeleccionado.value = null
}

// Ejecutar al montar
onMounted(() => {
  obtenerInstructores()
  obtenerTiposSeguimiento()
})
</script>

<style lang="sass" scoped>
.report-page
  background: #f5f7fb
  min-height: 100vh

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.container
  max-width: 900px
  margin: 0 auto

.reporte-card
  background: #fff
  border-radius: 16px
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08)
  overflow: hidden

.reporte-header
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)
  color: white
  padding: 18px 24px
  font-weight: 600
  font-size: 16px

.reporte-body
  padding: 24px

.form-grid
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))
  gap: 20px

.form-item label
  display: block
  font-weight: 600
  font-size: 14px
  margin-bottom: 8px
  color: #2c3e50
  text-transform: uppercase

.actions
  margin-top: 30px
  display: flex
  justify-content: flex-end
  gap: 12px

@media (max-width: 768px)
  .reporte-body
    padding: 20px
  .form-grid
    grid-template-columns: 1fr
    gap: 16px
  .actions
    justify-content: center
    flex-wrap: wrap

@media (max-width: 480px)
  .reporte-body
    padding: 16px
  .actions
    gap: 10px
</style>