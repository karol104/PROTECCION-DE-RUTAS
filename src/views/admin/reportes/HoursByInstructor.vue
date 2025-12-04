<template>
  <q-page class="q-pa-md report-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Horas por Instructor" 
              description="Consulta las horas asignadas y registradas por instructor." 
            />
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
                    v-model="formData.instructor"
                    :options="rowsInstructor"
                    option-label="nombre"
                    option-value="id"
                    outlined
                    placeholder="Seleccionar instructor"
                    dense
                    emit-value
                    map-options
                    clearable
                  />
                </div>

                <div class="form-item">
                  <label>Periodo</label>
                  <q-input
                    v-model="formData.periodo"
                    outlined
                    dense
                    type="date"
                    @update:model-value="handleDateChange"
                  >
                    <template #prepend>
                      <q-icon name="event" color="green-8" />
                    </template>
                  </q-input>
                </div>

                <div class="form-item">
                  <label>Tipo de seguimiento</label>
                  <q-select
                    v-model="formData.tipoSeguimiento"
                    :options="tiposSeguimiento"
                    outlined
                    placeholder="Seleccionar tipo de seguimiento"
                    dense
                    clearable
                  />
                </div>
              </div>

              <div class="actions">
                <Button
                  label="Limpiar"
                  custom-class="boton-cerrar"
                  @click="handleClearFilters"
                />
                <Button
                  label="Ver reporte"
                  custom-class="gradient-btn"
                  :disable="!canGenerateReport"
                  @click="handleGenerateReport"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEntityManager } from 'src/composables/useEntityManager'
import { useNotifications } from 'src/composables/useNotifications'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Button from 'src/components/Button.vue'

const router = useRouter()
const { warning } = useNotifications()

// ==================== COMPOSABLE CONFIGURATION ====================

// 1️⃣ Estructura del formulario
const getDefaultFormData = () => ({
  _id: '',
  instructor: null,
  periodo: '',
  tipoSeguimiento: null
})

// 2️⃣ Endpoints de la API
const endpoints = {
  list: '/instructors/listInstructors' // Ajusta según tu API
}

// 3️⃣ Mensajes personalizados
const customMessages = {
  listError: 'Error al cargar instructores',
  noData: 'No hay instructores disponibles'
}

// 4️⃣ Función para procesar respuesta de la API
const processInstructorsResponse = (response) => {
  const payload = response?.msg ?? response?.data ?? response ?? {}
  
  const instructorsArray = Array.isArray(payload)
    ? payload
    : payload?.instructors || payload?.instructores || payload?.list || []
  
  return {
    data: Array.isArray(instructorsArray) ? instructorsArray : [],
    total: payload?.totalDocuments ?? payload?.total ?? instructorsArray.length
  }
}

// 5️⃣ Inicializar composable con nombres estandarizados
const {
  // Estados
  loading,
  formData,
  filtersData,

  // Funciones de formulario
  resetForm,

  // Funciones de API
  fetchEntities
} = useEntityManager({
  entityName: 'instructor',
  entityNamePlural: 'instructors',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processInstructorsResponse
})

// ==================== ALIAS CON NOMBRES ESTANDARIZADOS ====================

// Funciones de formulario
const resetFormInstructor = resetForm

// Funciones de API
const fetchInstructor = fetchEntities

// ==================== ESTADO LOCAL ====================

const rowsInstructor = ref([])
const tiposSeguimiento = ref([])

// ==================== COMPUTED ====================

/**
 * Verifica si todos los campos requeridos están llenos para generar el reporte
 */
const canGenerateReport = computed(() => {
  return !!(
    formData.value.instructor &&
    formData.value.periodo &&
    formData.value.tipoSeguimiento
  )
})

// ==================== VALIDACIÓN DE FECHA ====================

/**
 * Maneja cambios en el campo de fecha
 */
function handleDateChange() {
  validateDate(formData.value.periodo, 'periodo')
}

/**
 * Valida el formato de fecha y que no sea futura
 */
function validateDate(dateStr, field) {
  if (!dateStr) return

  const selectedDate = new Date(dateStr)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  
  // Validar que la fecha no sea futura
  if (selectedDate > today) {
    warning('No se pueden seleccionar fechas futuras')
    formData.value[field] = ''
    return
  }
}

// ==================== MANEJADORES DE EVENTOS ====================

/**
 * Limpia todos los filtros
 */
function handleClearFilters() {
  resetFormInstructor()
  formData.value.instructor = null
  formData.value.periodo = ''
  formData.value.tipoSeguimiento = null
}

/**
 * Genera el reporte y navega a la vista del reporte
 */
function handleGenerateReport() {
  if (!canGenerateReport.value) {
    warning('Por favor complete todos los campos')
    return
  }

  // Navegar a la vista del reporte con parámetros de consulta
  router.push({
    path: '/app/admin/vistareporteporinstructor',
    query: {
      instructor: formData.value.instructor,
      periodo: formData.value.periodo,
      tipoSeguimiento: formData.value.tipoSeguimiento
    }
  })
}

// ==================== CARGA DE DATOS ====================

/**
 * Carga los instructores disponibles
 */
async function loadInstructors() {
  // TODO: Descomentar cuando la API esté lista
  // await fetchInstructor()
  // rowsInstructor.value = rows.value
  
  // Datos temporales de ejemplo
  rowsInstructor.value = [
    { id: 1, nombre: 'Juan Pérez García' },
    { id: 2, nombre: 'María López Rodríguez' },
    { id: 3, nombre: 'Carlos Martínez Díaz' },
    { id: 4, nombre: 'Ana Gómez Sánchez' }
  ]
}

/**
 * Carga los tipos de seguimiento disponibles
 */
async function loadTiposSeguimiento() {
  // TODO: Reemplazar con llamada real a la API cuando esté lista
  tiposSeguimiento.value = [
    'Instructor Tecnico',
    'Instructor Seguimiento',
    'Instructor Proyecto'
  ]
}

// ==================== CICLO DE VIDA ====================

onMounted(() => {
  loadInstructors()
  loadTiposSeguimiento()
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

// Estilos para los iconos del calendario
:deep(.q-field__prepend .q-icon)
  color: #4CAF50 !important

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