
<template>
  <div class="q-pa-md">
    <BackButton />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Gestión de Alertas y Notificaciones Automáticas" description="Administra reglas de notificación y alertas automáticas." />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="container">
      <q-card class="section-card q-mb-lg">
        <div class="section-header">
          <div class="header-title">Configuración de Fichas</div>
        </div>

        <q-card-section class="section-content">
          <div class="config-row">
            <div class="config-label-group">
              <div class="config-label">Fichas nuevas (posterior a noviembre 2024)</div>
              <div class="config-sublabel">Tiempo límite sin registrar etapa productiva</div>
            </div>
            <div class="config-input-group">
              <q-input 
                v-model="formData.newRecordsTime" 
                type="number" 
                outlined 
                dense 
                class="custom-select"
                min="1"
                oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                :rules="[
                  val => !!val || 'Campo obligatorio',
                  val => val > 0 || 'Debe ser mayor a 0'
                ]"
              />
              <span class="input-hint">Meses</span>
            </div>
          </div>

          <div class="config-row">
            <div class="config-label-group">
              <div class="config-label">Fichas antiguas (anterior a noviembre 2024)</div>
              <div class="config-sublabel">Tiempo límite sin registrar etapa productiva</div>
            </div>
            <div class="config-input-group">
              <q-input 
                v-model="formData.oldRecordsTime" 
                type="number" 
                outlined 
                dense 
                class="custom-select"
                min="1"
                oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                :rules="[
                  val => !!val || 'Campo obligatorio',
                  val => val > 0 || 'Debe ser mayor a 0'
                ]"
              />
              <span class="input-hint">Meses</span>
            </div>
          </div>

          <div class="config-row">
            <div class="config-label-group">
              <div class="config-label">Máximo de registros por aprendiz/ficha</div>
              <div class="config-sublabel">Número máximo de registros permitidos por aprendiz en una ficha</div>
            </div>
            <div class="config-input-group">
              <q-input 
                v-model="formData.maxRecordsPerApprentice" 
                type="number" 
                outlined 
                dense 
                class="custom-select"
                min="1"
                oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                :rules="[
                  val => !!val || 'Campo obligatorio',
                  val => val > 0 || 'Debe ser mayor a 0'
                ]"
              />
              <span class="input-hint">Registros</span>
            </div>
          </div>

          <div class="config-row">
            <div class="config-label-group">
              <div class="config-label">Horas mensuales instructores</div>
              <div class="config-sublabel">Límite de horas mensuales asignables por instructor</div>
            </div>
            <div class="config-input-group">
              <q-input 
                v-model="formData.monthlyInstructorHours" 
                type="number" 
                outlined 
                dense 
                class="custom-select"
                min="1"
                oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                :rules="[
                  val => !!val || 'Campo obligatorio',
                  val => val > 0 || 'Debe ser mayor a 0'
                ]"
              />
              <span class="input-hint">Horas</span>
            </div>
          </div>

          <div class="form-actions">
            <Button 
              label="Guardar Configuración" 
              @click="openConfirmationDialog(SECTION_TYPES.FICHE)"
              custom-class="gradient-btn"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card class="section-card q-mb-lg">
        <div class="section-header">
          <div class="header-title">Alertas Escalonadas</div>
        </div>

        <q-card-section class="section-content">
          <div class="alert-box alert-yellow q-mb-md">
            <div class="alert-content">
              <div class="alert-label-group">
                <div class="alert-title">Amarilla</div>
                <div class="alert-subtitle">Primera notificación preventiva</div>
              </div>
              <div class="alert-input-group">
                <q-input 
                  v-model="formData.yellowAlertDays" 
                  type="number" 
                  outlined 
                  dense 
                  class="alert-select"
                  min="16"
                  oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                  :rules="[
                    val => !!val || 'Campo obligatorio',
                    val => val > 15 || 'Debe ser mayor a 15 días'
                  ]"
                />
                <span class="alert-hint">días antes del vencimiento</span>
              </div>
            </div>
          </div>

          <div class="alert-box alert-orange q-mb-md">
            <div class="alert-content">
              <div class="alert-label-group">
                <div class="alert-title">Naranja</div>
                <div class="alert-subtitle">Notificación de atención urgente</div>
              </div>
              <div class="alert-input-group">
                <q-input 
                  v-model="formData.orangeAlertDays" 
                  type="number" 
                  outlined 
                  dense 
                  class="alert-select"
                  min="7"
                  max="15"
                  oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                  :rules="[
                    val => !!val || 'Campo obligatorio',
                    val => val > 7 || 'Debe ser mayor a 7 días',
                    val => val <= 15 || 'Debe ser menor o igual a 15 días'
                  ]"
                />
                <span class="alert-hint">días antes del vencimiento</span>
              </div>
            </div>
          </div>

          <div class="alert-box alert-red q-mb-md">
            <div class="alert-content">
              <div class="alert-label-group">
                <div class="alert-title">Roja</div>
                <div class="alert-subtitle">Notificación crítica inmediata</div>
              </div>
              <div class="alert-input-group">
                <q-input 
                  v-model="formData.redAlertDays" 
                  type="number" 
                  outlined 
                  dense 
                  class="alert-select"
                  min="1"
                  max="7"
                  oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                  :rules="[
                    val => !!val || 'Campo obligatorio',
                    val => val <= 7 || 'Debe ser menor o igual a 7 días',
                    val => val > 0 || 'Debe ser mayor a 0'
                  ]"
                />
                <span class="alert-hint">días antes del vencimiento</span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <Button 
              label="Guardar Configuración" 
              @click="openConfirmationDialog(SECTION_TYPES.ESCALATED)"
              custom-class="gradient-btn"
            />
          </div>
        </q-card-section>
      </q-card>

    </div>

    <Modal v-model="showConfirmationModal" width="500px" max-width="95vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="help" class="q-mr-sm" />
            Confirmación de Cambios
          </div>
        </div>
      </template>

      <template #body>
        <div class="q-pa-md text-center">
          <div class="text-h6 q-mb-md">¿Está seguro de que desea guardar los cambios?</div>
          <p class="confirmation-text text-body1" v-html="getConfirmationMessage()">
          </p>
        </div>
      </template>

      <template #footer>
        <div class="row justify-end q-gutter-sm full-width">
          <Button
            label="Cancelar"
            custom-class="boton-cerrar"
            @click="closeConfirmationDialog"
          />
          <Button
            label="Aceptar"
            custom-class="gradient-btn"
            @click="submitConfiguration"
            :loading="loading"
          />
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { putData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import { useEntityManager } from 'src/composables/useEntityManager'
import BackButton from 'src/components/BackButton.vue'
import Button from 'src/components/Button.vue'
import Modal from 'src/components/Modal.vue'
import PageHeader from 'src/components/PageHeader.vue'

// ==================== COMPOSABLE CONFIGURATION ====================

// 1️⃣ Form structure (not used for parameters in composable, but required)
const getDefaultFormData = () => ({
  _id: '',
  name: '',
  value: 0,
  description: '',
  category: 'SYSTEM'
})

// 2️⃣ API endpoints
const endpoints = {
  list: '/parameters/filterParameters',
  update: (id) => `/parameters/updateParameter/${id}`
}

// 3️⃣ Custom messages
const customMessages = {
  listError: 'Error al cargar los parámetros de alerta.',
  noData: 'No hay parámetros registrados'
}

// 4️⃣ Function to process API response
const processParametersResponse = (response) => {
  const data = response?.data?.data || response?.data?.parameters || response?.data || []
  return {
    data,
    total: data.length
  }
}

// 5️⃣ Initialize composable
const {
  // States
  loadingTable,
  loading,
  rows,
  filtersData,
  // Functions for API
  fetchEntities
} = useEntityManager({
  entityName: 'parameter',
  entityNamePlural: 'parameters',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processParametersResponse
})

// ==================== ALERTS SPECIFIC DATA ====================

const { error, success, warning } = useNotifications()

const PARAMETER_NAMES = {
  ALERTAS_FICHAS_NUEVAS: 'ALERTAS FICHAS NUEVAS',
  EXPIRACION_FICHAS_ANTIGUAS: 'EXPIRACION FICHAS ANTIGUAS',
  ALERTA_AMARILLA: 'ALERTA AMARILLA',
  ALERTA_NARANJA: 'ALERTA NARANJA',
  ALERTA_ROJA_CRITICA: 'ALERTA ROJA CRITICA',
  HORAS_MENSUALES_INSTRUCTORES: 'HORAS MENSUALES INSTRUCTORES',
  MAXIMO_REGISTROS_POR_APRENDIZ: 'MAXIMO DE REGISTROS POR APRENDIZ/FICHA'
}

const SECTION_TYPES = {
  FICHE: 'fiche',
  ESCALATED: 'escalated'
}

const showConfirmationModal = ref(false)
const currentSection = ref('')
const parameterIds = ref({})

const formData = ref({
  newRecordsTime: null,
  oldRecordsTime: null,
  maxRecordsPerApprentice: null,
  monthlyInstructorHours: null,
  yellowAlertDays: null,
  orangeAlertDays: null,
  redAlertDays: null
})

// Extend filtersData with category filter
filtersData.value.category = 'SYSTEM'

// ==================== CUSTOM API FUNCTIONS ====================

// Override fetchEntities to include category filter and process parameters
const fetchParameterConfiguration = async () => {
  filtersData.value.category = 'SYSTEM'
  await fetchEntities()
  
  const data = rows.value

  if (!data.length) {
    warning('No se encontraron parámetros de alertas en el sistema.')
    return
  }

  data.forEach(parameter => {
    if (!parameter?.name || !parameter?._id) return

    parameterIds.value[parameter.name] = parameter._id

    switch (parameter.name) {
      case PARAMETER_NAMES.ALERTAS_FICHAS_NUEVAS:
        formData.value.newRecordsTime = parameter.value
        break
      case PARAMETER_NAMES.EXPIRACION_FICHAS_ANTIGUAS:
        formData.value.oldRecordsTime = parameter.value
        break
      case PARAMETER_NAMES.MAXIMO_REGISTROS_POR_APRENDIZ:
        formData.value.maxRecordsPerApprentice = parameter.value
        break
      case PARAMETER_NAMES.HORAS_MENSUALES_INSTRUCTORES:
        formData.value.monthlyInstructorHours = parameter.value
        break
      case PARAMETER_NAMES.ALERTA_AMARILLA:
        formData.value.yellowAlertDays = parameter.value
        break
      case PARAMETER_NAMES.ALERTA_NARANJA:
        formData.value.orangeAlertDays = parameter.value
        break
      case PARAMETER_NAMES.ALERTA_ROJA_CRITICA:
        formData.value.redAlertDays = parameter.value
        break
      default:
        break
    }
  })
}

const openConfirmationDialog = section => {
  currentSection.value = section
  showConfirmationModal.value = true
}

const closeConfirmationDialog = () => {
  showConfirmationModal.value = false
}

const getConfirmationMessage = () => {
  if (currentSection.value === SECTION_TYPES.FICHE) {
    return '¿Desea guardar la configuración de <strong>FICHAS</strong>?'
  }
  if (currentSection.value === SECTION_TYPES.ESCALATED) {
    return '¿Desea guardar la configuración de <strong>ALERTAS ESCALADAS</strong>?'
  }
  return ''
}

const validateValues = (updates) => {
  const errors = []
  
  for (const [paramName, updateData] of Object.entries(updates)) {
    const value = updateData.value
    const fieldName = getFieldDisplayName(paramName)
    
    if (value === null || value === undefined || value === '') {
      errors.push(`${fieldName} es obligatorio`)
      continue
    }
    
    const numericValue = Number(value)
    
    if (isNaN(numericValue)) {
      errors.push(`${fieldName} debe ser un número válido`)
    } else if (numericValue < 0) {
      errors.push(`${fieldName} no puede ser negativo`)
    } else if (numericValue === 0) {
      errors.push(`${fieldName} debe ser mayor a 0`)
    }

    // Validaciones específicas para alertas escalonadas
    if (paramName === PARAMETER_NAMES.ALERTA_AMARILLA && numericValue <= 15) {
      errors.push(`${fieldName} debe ser mayor a 15 días`)
    }
    
    if (paramName === PARAMETER_NAMES.ALERTA_NARANJA && numericValue <= 7) {
      errors.push(`${fieldName} debe ser mayor a 7 días`)
    }
    
    if (paramName === PARAMETER_NAMES.ALERTA_NARANJA && numericValue > 15) {
      errors.push(`${fieldName} debe ser menor o igual a 15 días`)
    }
    
    if (paramName === PARAMETER_NAMES.ALERTA_ROJA_CRITICA && numericValue > 7) {
      errors.push(`${fieldName} debe ser menor o igual a 7 días`)
    }
  }
  
  return errors
}

const getFieldDisplayName = (paramName) => {
  switch (paramName) {
    case PARAMETER_NAMES.ALERTAS_FICHAS_NUEVAS:
      return 'El tiempo límite para fichas nuevas'
    case PARAMETER_NAMES.EXPIRACION_FICHAS_ANTIGUAS:
      return 'El tiempo límite para fichas antiguas'
    case PARAMETER_NAMES.MAXIMO_REGISTROS_POR_APRENDIZ:
      return 'El máximo de registros por aprendiz'
    case PARAMETER_NAMES.HORAS_MENSUALES_INSTRUCTORES:
      return 'Las horas mensuales de instructores'
    case PARAMETER_NAMES.ALERTA_AMARILLA:
      return 'Los días para alerta amarilla'
    case PARAMETER_NAMES.ALERTA_NARANJA:
      return 'Los días para alerta naranja'
    case PARAMETER_NAMES.ALERTA_ROJA_CRITICA:
      return 'Los días para alerta roja'
    default:
      return 'El valor'
  }
}

const submitConfiguration = async () => {
  loading.value = true
  try {
    const updates = {}

    if (currentSection.value === SECTION_TYPES.FICHE) {
      updates[PARAMETER_NAMES.ALERTAS_FICHAS_NUEVAS] = { value: formData.value.newRecordsTime }
      updates[PARAMETER_NAMES.EXPIRACION_FICHAS_ANTIGUAS] = { value: formData.value.oldRecordsTime }
      updates[PARAMETER_NAMES.MAXIMO_REGISTROS_POR_APRENDIZ] = { value: formData.value.maxRecordsPerApprentice }
      updates[PARAMETER_NAMES.HORAS_MENSUALES_INSTRUCTORES] = { value: formData.value.monthlyInstructorHours }
    } else if (currentSection.value === SECTION_TYPES.ESCALATED) {
      updates[PARAMETER_NAMES.ALERTA_AMARILLA] = { value: formData.value.yellowAlertDays }
      updates[PARAMETER_NAMES.ALERTA_NARANJA] = { value: formData.value.orangeAlertDays }
      updates[PARAMETER_NAMES.ALERTA_ROJA_CRITICA] = { value: formData.value.redAlertDays }
    }

    const validationErrors = validateValues(updates)
    if (validationErrors.length > 0) {
      error('Error de validación: ' + validationErrors.join(', '))
      return
    }

    const parameterNames = Object.keys(updates)
    for (const paramName of parameterNames) {
      const parameterId = parameterIds.value[paramName]
      const updateData = updates[paramName]

      if (!parameterId || updateData.value === null || updateData.value === undefined) continue

      const numericValue = Number(updateData.value)
      if (!Number.isNaN(numericValue) && numericValue > 0) {
        await putData(endpoints.update(parameterId), { value: numericValue })
      }
    }

    success('Configuración guardada exitosamente.')
    closeConfirmationDialog()
    await fetchParameterConfiguration()
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.msg ||
      err?.message ||
      'Error al guardar la configuración.'
    error(message)
  } finally {
    loading.value = false
  }
}

// ==================== LIFECYCLE HOOKS ====================

onMounted(() => {
  fetchParameterConfiguration()
})
</script>


<style lang="sass" scoped>
.container
  max-width: 1200px
  margin: 0 auto

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.section-card
  border-radius: 12px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
  overflow: hidden

.section-header
  background: #44b900
  color: white
  padding: 15px 20px
  font-size: 16px
  font-weight: 600
  text-align: center
  border-radius: 10px 10px 0 0
  display: flex
  justify-content: center
  align-items: center

.header-title
  font-size: 18px
  font-weight: 700
  ext-align: center
  width: 100%
  margin: 0

.section-content
  padding: 25px 20px

.config-row,
.alert-content
  display: flex
  align-items: center
  justify-content: space-between
  gap: 15px
  min-height: 60px

.config-row
  margin-bottom: 25px
  gap: 20px

.alert-content
  min-height: 50px

.config-label-group,
.alert-label-group
  flex: 1
  display: flex
  flex-direction: column
  justify-content: center

.config-label,
.alert-title
  font-size: 14px
  font-weight: 600
  color: #000
  margin-bottom: 3px
  line-height: 1.2

.alert-title
  font-weight: 700

.config-label
  margin-bottom: 5px

.config-sublabel,
.alert-subtitle
  font-size: 12px
  color: #666
  line-height: 1.2

.alert-subtitle
  font-size: 11px

.config-input-group,
.alert-input-group
  display: flex
  align-items: center
  gap: 10px
  flex-shrink: 0
  min-width: 150px

.alert-input-group
  gap: 8px
  min-width: 180px

.custom-select,
.alert-select
  width: 100px
  min-width: 100px

.alert-select
  width: 80px
  min-width: 80px

.input-hint,
.alert-hint
  font-size: 12px
  color: #666
  white-space: nowrap
  min-width: 50px

.alert-hint
  font-size: 11px
  min-width: 120px

.alert-box
  border-radius: 8px
  padding: 15px
  border-left: 6px solid

.alert-yellow
  background-color: #fff9e6
  border-left-color: #ffd700

.alert-orange
  background-color: #fff4e6
  border-left-color: #ff8c00

.alert-red
  background-color: #ffe6e6
  border-left-color: #ff0000

.form-actions
  display: flex
  justify-content: center
  margin-top: 30px


@media (max-width: 600px)
  .config-row,
  .alert-content
    flex-direction: column
    align-items: flex-start
    min-height: auto

  .config-input-group,
  .alert-input-group
    width: 100%
    justify-content: space-between
    margin-top: 10px

@media (max-width: 480px)
  .container
    padding: 0 10px

  .section-content
    padding: 20px 15px

  .config-label,
  .alert-title
    font-size: 13px

  .custom-select,
  .alert-select
    width: 100px

  .form-actions
    margin-top: 20px
</style>