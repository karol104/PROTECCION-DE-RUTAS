<template>
  <q-page class="q-pa-md report-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Reporte por Empresa" description="Informes agrupados por empresa." />
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
                  <label>Empresa</label>
                  <q-select
                    v-model="empresaSeleccionada"
                    :options="empresas"
                    option-label="nombre"
                    option-value="id"
                    outlined
                    placeholder="Seleccionar empresa"
                    dense
                    emit-value
                    map-options
                  />
                </div>

                <div class="form-item">
                  <label>Tipo de Contrato</label>
                  <q-select
                    v-model="tipoContratoSeleccionado"
                    :options="tiposContrato"
                    outlined
                    placeholder="Todos los tipos"
                    dense
                  />
                </div>

                <div class="form-item">
                  <label>Estado del Contrato</label>
                  <q-select
                    v-model="estadoContratoSeleccionado"
                    :options="estadosContrato"
                    outlined
                    placeholder="Todos los estados"
                    dense
                  />
                </div>

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
                    path: '/app/admin/vistareporteporempresa',
                    query: {
                      empresa: empresaSeleccionada,
                      tipoContrato: tipoContratoSeleccionado,
                      estadoContrato: estadoContratoSeleccionado,
                      anio: anioSeleccionado
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
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Button from 'src/components/Button.vue'
import axios from 'axios'

// Variables reactivas
const empresaSeleccionada = ref(null)
const tipoContratoSeleccionado = ref(null)
const estadoContratoSeleccionado = ref(null)
const anioSeleccionado = ref(null)

// Listas
const empresas = ref([])
const tiposContrato = ref([])
const estadosContrato = ref([])
const anios = ref([])

// Cargar datos del backend
const obtenerEmpresas = async () => {
  try {
    // const response = await axios.get('/api/empresas')
    // empresas.value = response.data
    empresas.value = [
      { id: 1, nombre: 'Empresa A S.A.S' },
      { id: 2, nombre: 'Empresa B Ltda' },
      { id: 3, nombre: 'Empresa C & Cía' },
      { id: 4, nombre: 'Corporación XYZ' }
    ] // ejemplo temporal
  } catch (error) {  }
}

const obtenerTiposContrato = async () => {
  try {
    // const response = await axios.get('/api/tiposcontrato')
    // tiposContrato.value = response.data
    tiposContrato.value = [
      'Todos los tipos',
      'Contrato de aprendizaje',
      'Vínculo laboral',
      'Pasantía'
    ] // ejemplo temporal
  } catch (error) {  }
}

const obtenerEstadosContrato = async () => {
  try {
    // const response = await axios.get('/api/estadoscontrato')
    // estadosContrato.value = response.data
    estadosContrato.value = [
      'Todos los estados',
      'Activo',
      'Finalizado',
      'En proceso',
      'Cancelado'
    ] // ejemplo temporal
  } catch (error) {  }
}

const obtenerAnios = async () => {
  try {
    // const response = await axios.get('/api/anios')
    // anios.value = response.data
    anios.value = ['2023', '2024', '2025'] // ejemplo temporal
  } catch (error) {  }
}

const limpiarCampos = () => {
  empresaSeleccionada.value = null
  tipoContratoSeleccionado.value = null
  estadoContratoSeleccionado.value = null
  anioSeleccionado.value = null
}

// Ejecutar al montar
onMounted(() => {
  obtenerEmpresas()
  obtenerTiposContrato()
  obtenerEstadosContrato()
  obtenerAnios()
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