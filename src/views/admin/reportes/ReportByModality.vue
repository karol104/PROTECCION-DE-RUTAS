<template>
  <q-page class="q-pa-md report-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Reporte por Modalidad" 
              description="Genera reportes filtrados por modalidad." 
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
                  <label>Año</label>
                  <q-select
                    v-model="formData.year"
                    :options="years"
                    outlined
                    placeholder="Seleccionar año"
                    dense
                    clearable
                  />
                </div>

                <div class="form-item">
                  <label>Modalidad</label>
                  <q-select
                    v-model="formData.modality"
                    :options="modalities"
                    option-label="nombre"
                    option-value="id"
                    outlined
                    placeholder="Seleccionar modalidad"
                    dense
                    emit-value
                    map-options
                    clearable
                  />
                </div>

                <div class="form-item">
                  <label>Fecha desde</label>
                  <q-input
                    v-model="formData.startDate"
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
                  <label>Fecha hasta</label>
                  <q-input
                    v-model="formData.endDate"
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

// 1️⃣ Form structure
const getDefaultFormData = () => ({
  _id: '',
  year: null,
  modality: null,
  startDate: '',
  endDate: ''
})

// 2️⃣ API endpoints
const endpoints = {
  list: '/modalities/listModalities' // Ajusta según tu API
}

// 3️⃣ Custom messages
const customMessages = {
  listError: 'Error al cargar modalidades',
  noData: 'No hay modalidades disponibles'
}

// 4️⃣ Function to process API response
const processModalitiesResponse = (response) => {
  const payload = response?.msg ?? response?.data ?? response ?? {}
  
  const modalitiesArray = Array.isArray(payload)
    ? payload
    : payload?.modalities || payload?.modalidades || payload?.list || []
  
  return {
    data: Array.isArray(modalitiesArray) ? modalitiesArray : [],
    total: payload?.totalDocuments ?? payload?.total ?? modalitiesArray.length
  }
}

// 5️⃣ Initialize composable with standardized names
const {
  // States
  loading,
  formData,
  filtersData,

  // Functions for form
  resetForm,

  // Functions for API
  fetchEntities
} = useEntityManager({
  entityName: 'modality',
  entityNamePlural: 'modalities',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processModalitiesResponse
})

// ==================== ALIAS WITH STANDARDIZED NAMES ====================

// Functions for form
const resetFormModality = resetForm

// Functions for API
const fetchModalities = fetchEntities

// ==================== LOCAL STATE ====================

const years = ref([])
const modalities = ref([])

// ==================== COMPUTED ====================

/**
 * Checks if all required fields are filled to generate report
 */
const canGenerateReport = computed(() => {
  return !!(
    formData.value.year &&
    formData.value.modality &&
    formData.value.startDate &&
    formData.value.endDate
  )
})

// ==================== DATE VALIDATION ====================

/**
 * Validates date format and ensures start date is before end date
 */
function validateDate(dateStr, field) {
  if (!dateStr) return

  // Validate format DD/MM/YYYY
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
  const match = dateStr.match(dateRegex)
  
  if (!match) {
    warning('Formato de fecha inválido. Use DD/MM/AAAA')
    formData.value[field] = ''
    return
  }

  const [, day, month, year] = match
  const dateObj = new Date(year, month - 1, day)
  
  // Validate if date is valid
  if (
    dateObj.getDate() !== parseInt(day) ||
    dateObj.getMonth() !== parseInt(month) - 1 ||
    dateObj.getFullYear() !== parseInt(year)
  ) {
    warning('Fecha inválida')
    formData.value[field] = ''
    return
  }

  // Validate start date is before end date
  if (field === 'endDate' && formData.value.startDate) {
    const startParts = formData.value.startDate.split('/')
    const startDate = new Date(startParts[2], startParts[1] - 1, startParts[0])
    
    if (dateObj < startDate) {
      warning('La fecha de fin debe ser posterior a la fecha de inicio')
      formData.value.endDate = ''
    }
  }
}

/**
 * Options for start date picker - disable future dates
 */
function validateStartDateOptions(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selectedDate = new Date(date)
  
  // Disable dates after today
  if (selectedDate > today) return false
  
  // If end date is set, disable dates after end date
  if (formData.value.endDate) {
    const endParts = formData.value.endDate.split('/')
    const endDate = new Date(endParts[2], endParts[1] - 1, endParts[0])
    return selectedDate <= endDate
  }
  
  return true
}

/**
 * Options for end date picker - disable dates before start date
 */
function validateEndDateOptions(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selectedDate = new Date(date)
  
  // Disable dates after today
  if (selectedDate > today) return false
  
  // If start date is set, disable dates before start date
  if (formData.value.startDate) {
    const startParts = formData.value.startDate.split('/')
    const startDate = new Date(startParts[2], startParts[1] - 1, startParts[0])
    return selectedDate >= startDate
  }
  
  return true
}

// ==================== EVENT HANDLERS ====================

/**
 * Clears all filters
 */
function handleClearFilters() {
  resetFormModality()
  formData.value.year = null
  formData.value.modality = null
  formData.value.startDate = ''
  formData.value.endDate = ''
}

/**
 * Generates report and navigates to report view
 */
function handleGenerateReport() {
  if (!canGenerateReport.value) {
    warning('Por favor complete todos los campos')
    return
  }

  // Navigate to report view with query parameters
  router.push({
    path: '/app/admin/vistareportepormodalidad',
    query: {
      anio: formData.value.year,
      modalidad: formData.value.modality,
      fechaInicio: formData.value.startDate,
      fechaFin: formData.value.endDate
    }
  })
}

// ==================== DATA LOADING ====================

/**
 * Loads available years
 */
function loadYears() {
  const currentYear = new Date().getFullYear()
  years.value = []
  
  // Generate years from current year to 5 years back
  for (let i = 0; i <= 5; i++) {
    years.value.push(String(currentYear - i))
  }
}

/**
 * Loads available modalities
 */
async function loadModalities() {
  // TODO: Replace with actual API call when ready
  // await fetchModalities()
  // modalities.value = rows.value
  
  // Temporary hardcoded data
  modalities.value = [
    { id: 1, nombre: 'Contrato de aprendizaje' },
    { id: 2, nombre: 'Vinculo laboral' },
    { id: 3, nombre: 'Proyecto productivo' },
    { id: 4, nombre: 'Pasantía U.P. Familiar' }
  ]
}

// ==================== LIFECYCLE ====================

onMounted(() => {
  loadYears()
  loadModalities()
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