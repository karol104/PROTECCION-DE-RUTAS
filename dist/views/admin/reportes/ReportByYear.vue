<template>
  <q-page class="q-pa-md report-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Reporte por Año" description="Analiza la información agregada por año." />
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
                  <label>Año Académico</label>
                  <q-select
                    v-model="anioSeleccionado"
                    :options="anios"
                    outlined
                    placeholder="Seleccionar año"
                    dense
                  />
                </div>

                <div class="form-item">
                  <label>Estado de Fichas</label>
                  <q-select
                    v-model="estadoSeleccionado"
                    :options="estados"
                    option-label="nombre"
                    option-value="id"
                    outlined
                    placeholder="Seleccionar estado"
                    dense
                    emit-value
                    map-options
                  />
                </div>

                <div class="form-item full-width">
                  <label>Tipo de Programa</label>
                  <q-select
                    v-model="programaSeleccionado"
                    :options="programas"
                    option-label="nombre"
                    option-value="id"
                    outlined
                    placeholder="Seleccionar programa"
                    dense
                    emit-value
                    map-options
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
                    path: '/app/admin/vistareporteporaño',
                    query: { anio: anioSeleccionado }
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
const anioSeleccionado = ref(null)
const estadoSeleccionado = ref(null)
const programaSeleccionado = ref(null)

//Listas dinámicas
const anios = ref([])
const estados = ref([])
const programas = ref([])

//Función para obtener años desde el backend
const obtenerAnios = async () => {
  try {
    // Ejemplo: reemplaza con tu endpoint real
    // const response = await axios.get('/api/anios')
    // anios.value = response.data
    anios.value = ['2022', '2023', '2024', '2025'] // temporal
  } catch (error) {  }
}

//Función para obtener estados de fichas desde el backend
const obtenerEstados = async () => {
  try {
    // const response = await axios.get('/api/estados-fichas')
    // estados.value = response.data
    estados.value = [
      { id: 1, nombre: 'Activas' },
      { id: 2, nombre: 'Finalizadas' },
      { id: 3, nombre: 'En pausa' },
      { id: 4, nombre: 'Canceladas' }
    ]
  } catch (error) {  }
}

//Función para obtener programas desde el backend
const obtenerProgramas = async () => {
  try {
    // const response = await axios.get('/api/programas')
    // programas.value = response.data
    programas.value = [
      { id: 1, nombre: 'Técnico' },
      { id: 2, nombre: 'Tecnólogo' },
      { id: 3, nombre: 'Especialización' }
    ]
  } catch (error) {  }
}

//Función para limpiar los campos
const limpiarCampos = () => {
  anioSeleccionado.value = null
  estadoSeleccionado.value = null
  programaSeleccionado.value = null
}

//Cargar datos del backend al montar el componente
onMounted(() => {
  obtenerAnios()
  obtenerEstados()
  obtenerProgramas()
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

.form-item.full-width
  grid-column: 1 / -1

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