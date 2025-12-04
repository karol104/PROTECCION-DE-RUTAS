<template>
  <q-page class="q-pa-md report-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Reporte por Modalidad" description="Genera reportes filtrados por modalidad." />
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
                  <label>Año</label>
                  <q-select
                    v-model="anioSeleccionado"
                    :options="anios"
                    outlined
                    placeholder="Seleccionar año"
                    dense
                  />
                </div>

                <div class="form-item">
                  <label>Modalidad</label>
                  <q-select
                    v-model="modalidadSeleccionada"
                    :options="modalidades"
                    option-label="nombre"
                    option-value="id"
                    outlined
                    placeholder="Seleccionar modalidad"
                    dense
                    emit-value
                    map-options
                  />
                </div>

                <div class="form-item">
                  <label>Fecha inicio</label>
                  <q-input
                    v-model="fechaInicio"
                    type="date"
                    outlined
                    dense
                    placeholder="Seleccionar fecha"
                  />
                </div>

                <div class="form-item">
                  <label>Fecha fin</label>
                  <q-input
                    v-model="fechaFin"
                    type="date"
                    outlined
                    dense
                    placeholder="Seleccionar fecha"
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
                    path: '/app/admin/vistareportepormodalidad',
                    query: {
                      anio: anioSeleccionado,
                      modalidad: modalidadSeleccionada,
                      fechaInicio,
                      fechaFin
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
const anioSeleccionado = ref(null)
const modalidadSeleccionada = ref(null)
const fechaInicio = ref(null)
const fechaFin = ref(null)

//Listas
const anios = ref([])
const modalidades = ref([])

// Cargar datos del backend (simulado)
const obtenerAnios = async () => {
  try {
    // const response = await axios.get('/api/anios')
    // anios.value = response.data
    anios.value = ['2023', '2024', '2025'] // ejemplo temporal
  } catch (error) {  }
}

const obtenerModalidades = async () => {
  try {
    // const response = await axios.get('/api/modalidades')
    // modalidades.value = response.data
    modalidades.value = [
      { id: 1, nombre: 'Contrato de aprendizaje' },
      { id: 2, nombre: 'Vinculo laboral' },
      { id: 3, nombre: 'Proyecto productivo' },
      { id: 4, nombre: 'Pasantía U.P. Familiar' }
    ]
  } catch (error) {  }
}

const limpiarCampos = () => {
  anioSeleccionado.value = null
  modalidadSeleccionada.value = null
  fechaInicio.value = null
  fechaFin.value = null
}

// Ejecutar al montar
onMounted(() => {
  obtenerAnios()
  obtenerModalidades()
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