<template>
  <div class="q-pa-md">
    <BackButton />
    
    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section class="flex flex-center">
            <PageHeader title="Administración de Espacio y Rutas de Archivos" description="Gestiona rutas, almacenamiento y limpieza de archivos." align="center" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="container">
      <q-card class="section-card">
        <div class="section-header">
          <div class="header-title">Validaciones de Documentos</div>
        </div>
        
        <q-card-section class="section-content">
          <div class="form-row">
            <label class="form-label">Validación de firmas, docs firmados</label>
            <div class="form-input-group">
              <q-checkbox
                v-model="signedDocsValidation"
                color="green"
                :disable="loading"
                @update:model-value="updateSignedDocsValidation"
              />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label">Frecuencia cargue archivos</label>
            <div class="form-input-group">
              <q-input
                v-model.number="fileUploadFrequency"
                type="number"
                outlined
                dense
                class="custom-input"
                :loading="loadingTable"
                @update:model-value="updateFileUploadFrequency"
                :min="1"
                :max="365"
              />
              <span class="input-hint">días</span>
            </div>
          </div>

          <div class="form-actions">
            <Button
              label="Guardar Configuración"
              custom-class="gradient-btn"
              :loading="loadingTable"
              @click="openConfirmationDialog"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Confirmation Modal -->
    <Modal v-model="showConfirmationModal" width="500px" max-width="95vw" persistent :show-footer-separator="false">
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
          <p class="confirmation-text text-body1">
            ¿Desea guardar la configuración de <strong>VALIDACIONES</strong>?
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
            :loading="loading"
            @click="submitFileValidationConfiguration"
          />
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotifications } from 'src/composables/useNotifications'
import { useEntityManager } from 'src/composables/useEntityManager'
import { putData } from 'src/services/apiClient'
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
  category: 'FILES'
})

// 2️⃣ API endpoints
const endpoints = {
  list: '/parameters/filterParameters',
  update: (id) => `/parameters/updateParameter/${id}`
}

// 3️⃣ Custom messages
const customMessages = {
  listError: 'Error al cargar los parámetros de validación',
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

// ==================== STORAGE SPECIFIC DATA ====================

const { error, success } = useNotifications()

const showConfirmationModal = ref(false)
const signedDocsValidation = ref(true)
const fileUploadFrequency = ref(15)
const parameterIds = ref({})

// Extend filtersData with category filter
filtersData.value.category = 'FILES'

// ==================== CUSTOM API FUNCTIONS ====================

// Override fetchEntities to include category filter and process parameters
const fetchFileValidationParameters = async () => {
  filtersData.value.category = 'FILES'
  await fetchEntities()
  
  // Process parameters from rows
  const data = rows.value
  data.forEach(parameter => {
    if (!parameter?.name || !parameter?._id) return

    parameterIds.value[parameter.name] = parameter._id

    if (parameter.name === 'VERIFICACION DE DOCUMENTOS FIRMADOS') {
      signedDocsValidation.value = parameter.value
    }

    if (parameter.name === 'FRECUENCIA CARGUE ARCHIVOS') {
      fileUploadFrequency.value = parameter.value
    }
  })
}

const updateSignedDocsValidation = value => {
  signedDocsValidation.value = value
}

const updateFileUploadFrequency = value => {
  fileUploadFrequency.value = value
}

const openConfirmationDialog = () => {
  showConfirmationModal.value = true
}

const closeConfirmationDialog = () => {
  showConfirmationModal.value = false
}

const submitFileValidationConfiguration = async () => {
  loading.value = true
  try {
    const signedDocsParamId = parameterIds.value['VERIFICACION DE DOCUMENTOS FIRMADOS']
    const frequencyParamId = parameterIds.value['FRECUENCIA CARGUE ARCHIVOS']

    const updates = []

    if (signedDocsParamId) {
      updates.push(
        putData(endpoints.update(signedDocsParamId), {
          value: signedDocsValidation.value
        })
      )
    }

    if (frequencyParamId) {
      updates.push(
        putData(endpoints.update(frequencyParamId), {
          value: Number(fileUploadFrequency.value)
        })
      )
    }

    if (!updates.length) {
      error('No se encontraron los parámetros para actualizar')
      return
    }

    await Promise.all(updates)

    success('Configuración guardada exitosamente')
    closeConfirmationDialog()
    await fetchFileValidationParameters()
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.msg ||
      err?.message ||
      'Error al guardar la configuración'
    error(message)
  } finally {
    loading.value = false
  }
}

// ==================== LIFECYCLE HOOKS ====================

onMounted(() => {
  fetchFileValidationParameters()
})
</script>

<style lang="sass" scoped>
.container
  max-width: 1200px
  margin: 0 auto

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)
  min-height: 120px

.section-card
  background: white
  border-radius: 12px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
  margin-bottom: 20px
  overflow: hidden

.section-header
  background: #44b900
  color: white
  padding: 15px 20px
  font-size: 16px
  font-weight: 600
  text-align: center
  display: flex
  justify-content: center
  align-items: center

.header-title
  color: white
  font-size: 16px
  font-weight: 600
  text-align: center
  width: 100%
  margin: 0

.section-content
  padding: 25px 20px

.form-row
  display: flex
  align-items: center
  justify-content: space-between
  margin-bottom: 20px
  gap: 15px
  min-height: 56px

.form-label
  font-size: 14px
  font-weight: 500
  color: #333
  flex: 1
  min-width: 200px

.form-input-group
  display: flex
  align-items: center
  gap: 10px
  flex: 0 0 auto

.form-input-group > *
  align-self: center

.custom-input
  width: 120px

.input-hint
  font-size: 12px
  color: #666
  white-space: nowrap
  min-width: 30px
  line-height: 1.4

.form-actions
  display: flex
  justify-content: center
  margin-top: 30px


@media (max-width: 600px)
  .form-row
    flex-direction: column
    align-items: flex-start

  .form-label
    min-width: 100%
    margin-bottom: 10px

  .form-input-group
    width: 100%
    justify-content: space-between

  .custom-input
    flex: 1
</style>