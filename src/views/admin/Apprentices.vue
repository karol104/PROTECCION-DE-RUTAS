<template>
  <div class="q-pa-md">
    <BackButton />
    
  <PageHeader title="APRENDICES" description="Listado y gestión de aprendices inscritos." />
    
    <div class="container">

      <Table
        card
        :rows="filteredItems"
        :columns="columns"
        row-key="_id"
        :loading="isLoading"
        :rows-per-page-options="[10, 20, 50]"
      >
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.row.status)">
              {{ getStatusLabel(props.row.status) }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-opciones="props">
          <q-td :props="props">
            <ButtonTableOptions
              icon="visibility"
              tooltip="Ver detalles"
              color="primary"
              @click="handleViewDetails(props.row)"
            />
            <ButtonTableOptions
              icon="edit"
              tooltip="Editar"
              color="primary"
              @click="handleEdit(props.row)"
            />
            <ButtonTableOptions
              :color="props.row.status === STATUS.ACTIVE ? 'positive' : 'negative'"
              :icon="props.row.status === STATUS.ACTIVE ? 'check' : 'close'"
              :tooltip="props.row.status === STATUS.ACTIVE ? 'Desactivar' : 'Activar'"
              @click="handleToggleStatus(props.row)"
            />
          </q-td>
        </template>
      </Table>
    </div>

    <Modal
      v-model="showDetailsModal"
      width="1200px"
      max-width="98vw"
    >
      <template #header>
        <div class="modal-header-content">
          <div class="text-h6">Detalles del Aprendiz</div>
        </div>
      </template>
      <template #body>
        <div v-if="selectedItem" class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md section-title">Datos Personales</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Tipo de Documento:</div>
                <div class="data-value">{{ selectedItem.documentType || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Número de Documento:</div>
                <div class="data-value">{{ selectedItem.documentNumber || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Nombres:</div>
                <div class="data-value">{{ selectedItem.firstName || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Apellidos:</div>
                <div class="data-value">{{ selectedItem.lastName || '-' }}</div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md section-title">Datos de Contacto</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Teléfono:</div>
                <div class="data-value">{{ selectedItem.phone || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Email Personal:</div>
                <div class="data-value">{{ getPersonalEmail(selectedItem) || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Email Institucional:</div>
                <div class="data-value">{{ getInstitutionalEmail(selectedItem) || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <Button 
          label="Ver proceso EP"
          custom-class="boton"
          :to="`/admin/ep-processes?apprenticeId=${selectedItem ? selectedItem._id : ''}`"
        />
        <Button 
          label="Cerrar"
          custom-class="boton-cerrar"
          @click="showDetailsModal = false" 
        />
      </template>
    </Modal>

    <Modal
      v-model="showEditModal"
      width="900px"
      max-width="98vw"
    >
      <template #header>
        <div class="modal-header-content">
          <div class="text-h6">Editar Aprendiz</div>
        </div>
      </template>
      <template #body>
        <q-form ref="formRef" @submit.prevent="handleSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <div class="text-h6 q-mb-md section-title">Datos de Identificación</div>
              <q-select
                filled
                v-model="itemBeingEdited.documentType"
                :options="DOCUMENT_TYPE_OPTIONS"
                label="Tipo de Documento *"
                :rules="[requiredRule]"
                disable
                emit-value
                map-options
              />
              <q-input
                filled
                v-model="itemBeingEdited.documentNumber"
                label="Número de Documento *"
                :rules="[
                  requiredRule,
                  numericRule,
                  minLengthRule(7),
                  maxLengthRule(20),
                  noSpacesRule
                ]"
                disable
              />
              <div class="text-h6 q-mb-md q-mt-lg section-title">Nombres</div>
              <q-input
                filled
                v-model="itemBeingEdited.firstName"
                label="Nombres *"
                :rules="[
                  requiredRule,
                  minLengthRule(2),
                  maxLengthRule(50),
                  lettersOnlyRule
                ]"
              />
              <q-input
                filled
                v-model="itemBeingEdited.lastName"
                label="Apellidos *"
                :rules="[
                  requiredRule,
                  minLengthRule(2),
                  maxLengthRule(50),
                  lettersOnlyRule
                ]"
              />
            </div>
            <div class="col-12 col-md-6">
              <div class="text-h6 q-mb-md section-title">Datos de Contacto</div>
              <q-input
                filled
                v-model="itemBeingEdited.phone"
                label="Teléfono *"
                type="tel"
                :rules="[requiredRule, phoneRule, noSpacesRule]"
              />
              <q-input
                filled
                v-model="itemBeingEdited.emailPersonal"
                label="Email Personal *"
                type="email"
                :rules="[
                  requiredRule,
                  emailRule,
                  maxLengthRule(100),
                  noSpacesRule
                ]"
              />
              <div class="text-h6 q-mb-md q-mt-lg section-title">Email Institucional</div>
              <q-input
                filled
                v-model="itemBeingEdited.emailInstitutional"
                label="Email Institucional *"
                type="email"
                :rules="[
                  requiredRule,
                  emailRule,
                  maxLengthRule(100),
                  noSpacesRule
                ]"
                hint="Debe terminar en @sena.edu.co"
              />
              <div class="text-h6 q-mb-md q-mt-lg section-title">Número de Ficha</div>
              <q-input
                filled
                v-model="itemBeingEdited.recordNumber"
                label="Número de Ficha *"
                :rules="[requiredRule, numericRule, noSpacesRule]"
                hint="Número de ficha del aprendiz"
              />
            </div>
          </div>
        </q-form>
      </template>
      <template #footer>
        <Button 
          label="Cancelar" 
          custom-class="boton-cerrar"
          @click="showEditModal = false" 
        />
        <Button 
          label="Guardar" 
          @click="handleSubmit" 
          :loading="isSaving" 
        />
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getData, putData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import BackButton from 'src/components/BackButton.vue'
import Button from 'src/components/Button.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import PageHeader from 'src/components/PageHeader.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'

const route = useRoute()
const notifications = useNotifications()

// Constantes locales
const STATUS = {
  ACTIVE: 0,
  INACTIVE: 1
}

const DOCUMENT_TYPE_OPTIONS = [
  { label: 'Cédula de Ciudadanía', value: 'CC' },
  { label: 'Tarjeta de Identidad', value: 'TI' },
  { label: 'Cédula de Extranjería', value: 'CE' },
  { label: 'Pasaporte', value: 'PP' }
]

// Validaciones locales
const requiredRule = (val) => (val && val.length > 0) || 'Este campo es requerido'
const numericRule = (val) => /^\d+$/.test(val) || 'Solo se permiten números'
const lettersOnlyRule = (val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras'
const emailRule = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Ingrese un email válido'
const phoneRule = (val) => /^\d{7,15}$/.test(val) || 'Ingrese un teléfono válido (7-15 dígitos)'
const noSpacesRule = (val) => !/\s/.test(val) || 'No se permiten espacios'
const minLengthRule = (min) => (val) => (val && val.length >= min) || `Mínimo ${min} caracteres`
const maxLengthRule = (max) => (val) => (val && val.length <= max) || `Máximo ${max} caracteres`

// State
const apprentices = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const selectedItem = ref(null)
const formRef = ref(null)
const showDetailsModal = ref(false)
const showEditModal = ref(false)

const itemBeingEdited = ref({
  _id: '',
  documentNumber: '',
  documentType: '',
  firstName: '',
  lastName: '',
  emailPersonal: '',
  emailInstitutional: '',
  phone: '',
  recordNumber: ''
})

// ==================== COMPOSABLES ====================

// Filtrado debe hacerse en el backend - usar queryParams en fetchApprentices
const searchTerm = ref('')
const statusFilter = ref('all')
const ficheFilter = ref('') // Número de ficha desde la URL

// Computed para construir los query params como objeto
const queryParams = computed(() => {
  const params = {}
  if (ficheFilter.value) {
    params.recordNumber = ficheFilter.value
  }
  return params
})

// Los datos vienen filtrados del backend
const filteredItems = apprentices

const columns = [
  { name: 'documentNumber', label: 'Documento', field: 'documentNumber', sortable: true, align: 'left' },
  { name: 'firstName', label: 'Nombres', field: 'firstName', sortable: true, align: 'left' },
  { name: 'lastName', label: 'Apellidos', field: 'lastName', sortable: true, align: 'left' },
  { name: 'phone', label: 'Teléfono', field: 'phone', sortable: true, align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', sortable: true, align: 'center' },
  { name: 'opciones', label: 'Opciones', align: 'center' }
]

// Funciones helper para obtener datos del aprendiz
const getPersonalEmail = (apprentice) => apprentice?.email?.personal || ''
const getInstitutionalEmail = (apprentice) => apprentice?.email?.institutional || ''
const getRecordNumber = (apprentice) => {
  const records = apprentice?.recordNumber
  if (Array.isArray(records) && records.length > 0) {
    // Si es un objeto con fiche dentro
    if (records[0]?.fiche?.number) {
      return records[0].fiche.number
    }
    // Si es un objeto con _id (objeto de ficha directamente)
    if (records[0]?.fiche?._id) {
      return records[0].fiche.number || records[0].fiche._id
    }
    // Si es solo un string o número
    return records[0]?.fiche || records[0] || ''
  }
  return ''
}

// ==================== FUNCIONES DE UI ====================

// Función para cargar aprendices
const fetchApprentices = async (params = {}) => {
  isLoading.value = true
  try {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/apprentices/listApprentice?${queryString}` : '/apprentices/listApprentice'
    const response = await getData(url)
    
    // Extraer datos según diferentes estructuras de respuesta - asegurar que sea un array
    let data = response?.Apprentice || response?.apprentices || response?.data || response?.msg || []
    
    // Si data es un objeto y no un array, buscar arrays dentro del objeto
    if (!Array.isArray(data) && typeof data === 'object') {
      const keys = Object.keys(data)
      for (const key of keys) {
        if (Array.isArray(data[key])) {
          data = data[key]
          break
        }
      }
    }
    
    apprentices.value = Array.isArray(data) ? data : []
    
    if (apprentices.value.length === 0 && Object.keys(params).length === 0) {
      notifications.info('No hay aprendices registrados')
    }
  } catch (error) {
    apprentices.value = []
    notifications.error(error.response?.data?.message || error.response?.data?.msg || 'Error al cargar aprendices')
  } finally {
    isLoading.value = false
  }
}

// Funciones de estado
const getStatusLabel = (status) => status === STATUS.ACTIVE ? 'Activo' : 'Inactivo'
const getStatusColor = (status) => status === STATUS.ACTIVE ? 'positive' : 'negative'

// ==================== MANEJADORES DE MODALES ====================

const handleViewDetails = (apprentice) => {
  selectedItem.value = apprentice
  showDetailsModal.value = true
}

const handleEdit = (apprentice) => {
  const recordNum = getRecordNumber(apprentice)
  console.log('Apprentice data:', apprentice)
  console.log('Record number extracted:', recordNum)
  
  itemBeingEdited.value = {
    _id: apprentice._id || '',
    documentNumber: apprentice.documentNumber || '',
    documentType: apprentice.documentType || '',
    firstName: apprentice.firstName || '',
    lastName: apprentice.lastName || '',
    emailPersonal: getPersonalEmail(apprentice),
    emailInstitutional: getInstitutionalEmail(apprentice),
    phone: apprentice.phone || '',
    recordNumber: recordNum
  }
  showEditModal.value = true
}

const handleSubmit = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    notifications.error('Por favor complete todos los campos correctamente')
    return
  }
  
  isSaving.value = true
  
  const apprenticeData = {
    documentNumber: itemBeingEdited.value.documentNumber,
    documentType: itemBeingEdited.value.documentType,
    firstName: itemBeingEdited.value.firstName,
    lastName: itemBeingEdited.value.lastName,
    email: {
      personal: itemBeingEdited.value.emailPersonal,
      institutional: itemBeingEdited.value.emailInstitutional
    },
    phone: itemBeingEdited.value.phone,
    recordNumber: [itemBeingEdited.value.recordNumber]
  }
  
  try {
    await putData(`/apprentices/updateEntireApprentice/${itemBeingEdited.value._id}`, apprenticeData)
    notifications.success('Aprendiz actualizado exitosamente')
    showEditModal.value = false
    formRef.value?.resetValidation()
    await fetchApprentices(queryParams.value)
  } catch (error) {
    const data = error.response?.data
    const errorMsg = Array.isArray(data?.errors) 
      ? data.errors.join('\n')
      : data?.message || data?.msg || data?.error || 'Error al actualizar el aprendiz'
    notifications.error(errorMsg)
  } finally {
    isSaving.value = false
  }
}

const handleToggleStatus = async (apprentice) => {
  const isActive = apprentice.status === STATUS.ACTIVE
  const action = isActive ? 'desactivar' : 'activar'
  
  try {
    const endpoint = isActive ? 'disableApprentice' : 'activateApprentice'
    console.log(`Attempting to ${action} apprentice:`, apprentice._id)
    
    const response = await putData(`/apprentices/${endpoint}/${apprentice._id}`)
    console.log('Toggle status response:', response)
    
    notifications.success(`Aprendiz ${isActive ? 'desactivado' : 'activado'} exitosamente`)
    await fetchApprentices(queryParams.value)
  } catch (error) {
    console.error('Error toggling status:', error)
    const errorMsg = error.response?.data?.message || error.response?.data?.msg || error.response?.data?.error || `Error al ${action} el aprendiz`
    notifications.error(errorMsg)
  }
}

// ==================== LIFECYCLE HOOKS ====================

onMounted(() => {
  ficheFilter.value = route.query.recordNumber || ''
  fetchApprentices(queryParams.value)
})

watch(() => route.query.recordNumber, (newRecordNumber) => {
  ficheFilter.value = newRecordNumber || ''
  fetchApprentices(newRecordNumber ? queryParams.value : {})
})
</script>

<style lang="sass" scoped>
.container
  max-width: 1400px
  margin: 0 auto

/* Estilos base para modales */
/* Section Titles */
.section-title
  color: var(--color-primary)
  font-weight: 600
  font-size: 1.3rem
  margin-bottom: 20px
  padding-left: 12px
  border-left: 4px solid var(--color-primary)

/* Data Grid */
.data-grid
  display: grid
  gap: 16px
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)
  padding: 20px
  border-radius: 8px
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05)
  border: 1px solid #E0E0E0

.data-row
  display: grid
  grid-template-columns: 180px 1fr
  gap: 16px
  align-items: center
  padding: 8px 0
  border-bottom: 1px solid #F0F0F0

.data-row:last-child
  border-bottom: none

.text-weight-bold
  color: #2c3e50
  font-size: 0.95rem
  font-weight: 600

.data-value
  color: #34495e
  font-size: 0.95rem
  font-weight: 500

/* Formularios en modales */
:deep(.q-form)
  padding: 0

:deep(.q-field--filled .q-field__control)
  border-radius: 8px
  background: #F8F9FA
  transition: all 0.3s ease

:deep(.q-field--filled.q-field--focused .q-field__control)
  background: white
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1)

:deep(.q-field--filled .q-field__control:before)
  border-bottom: 2px solid #E0E0E0

:deep(.q-field--filled.q-field--focused .q-field__control:before)
  border-bottom-color: var(--color-primary)

/* File input */
:deep(.q-file .q-field__control)
  border-radius: 8px
  border: 2px dashed #E0E0E0
  transition: all 0.3s ease

:deep(.q-file.q-field--focused .q-field__control)
  border-color: var(--color-primary)
  background: #F8F9FA

/* Banners */
:deep(.q-banner)
  border-radius: 8px
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05)

/* Badges */
:deep(.q-badge)
  padding: 6px 12px
  border-radius: 6px
  font-weight: 500
  font-size: 0.85rem

/* Botones */
:deep(.q-btn.boton-cerrar),
:deep(.q-btn.boton-enviar),
:deep(.q-btn.boton-ingresar)
  border-radius: 8px
  padding: 10px 24px
  font-size: 14px
  font-weight: 600
  text-transform: none
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
  transition: all 0.3s ease

:deep(.q-btn.boton-cerrar:hover),
:deep(.q-btn.boton-enviar:hover),
:deep(.q-btn.boton-ingresar:hover)
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15)
  transform: translateY(-2px)

:deep(.q-btn.boton-enviar),
:deep(.q-btn.boton-ingresar)
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover-dark) 100%)

:deep(.q-btn.boton-enviar:hover),
:deep(.q-btn.boton-ingresar:hover)
  background: linear-gradient(135deg, var(--color-primary-hover-dark) 0%, var(--color-primary) 100%)

/* Responsive */
@media (max-width: 768px)
  :deep(.q-dialog .q-card > .q-card__section:first-child)
    padding: 18px 20px

  :deep(.q-dialog .text-h6)
    font-size: 16px

  :deep(.q-dialog .q-card__section:not(:first-child):not(:last-child))
    padding: 20px 24px

  :deep(.q-dialog .q-card__section:last-child)
    padding: 18px 20px

  .section-title
    font-size: 1.2rem
    margin-bottom: 15px
    padding-left: 10px

  .data-grid
    gap: 12px
    padding: 15px

  .data-row
    grid-template-columns: 1fr
    gap: 8px
    padding: 6px 0

  .data-row .text-weight-bold
    margin-bottom: 4px

  .text-weight-bold
    font-size: 0.9rem

  .data-value
    font-size: 0.9rem

@media (max-width: 480px)
  :deep(.q-dialog .q-card > .q-card__section:first-child)
    padding: 16px 18px

  :deep(.q-dialog .text-h6)
    font-size: 15px

  :deep(.q-dialog .q-card__section:not(:first-child):not(:last-child))
    padding: 16px 20px

  :deep(.q-dialog .q-card__section:last-child)
    padding: 16px 18px

  .section-title
    font-size: 1.1rem !important
    margin-bottom: 12px
    padding-left: 8px

  .data-grid
    gap: 10px
    padding: 12px

  .data-row
    padding: 4px 0

  .text-weight-bold
    font-size: 0.85rem

  .data-value
    font-size: 0.85rem

  :deep(.q-btn.boton-cerrar),
  :deep(.q-btn.boton-enviar),
  :deep(.q-btn.boton-ingresar)
    padding: 10px 20px
    font-size: 13px

/* Ajustes específicos para modales grandes */
@media (min-width: 769px)
  :deep(.q-dialog__inner)
    padding: 24px

@media (max-width: 768px)
  :deep(.q-dialog__inner)
    padding: 16px

  :deep(.q-card)
    margin: 0

@media (max-width: 480px)
  :deep(.q-dialog__inner)
    padding: 12px

  :deep(.q-card)
    width: 98vw !important
    max-width: 98vw !important
    margin: 0 !important
</style>