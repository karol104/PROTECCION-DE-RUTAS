<template>
  <q-page class="q-pa-md registrations-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Registros de Etapa Productiva" description="Gestiona inscripciones y estados de etapa productiva." />
          </q-card-section>
        </q-card>

        <div class="filters-wrapper row items-center justify-center q-mb-lg q-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filtersData.search"
              dense
              outlined
              clearable
              debounce="600"
              placeholder="Buscar por número de registro..."
              @keyup.enter="applyFilters"
              @clear="clearFilters"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
              <template #hint>
                Ejemplo: REG-2025-001
              </template>
            </q-input>
          </div>
          <div class="col-auto">
            <Button
              label="Filtrar"
              icon="filter_list"
              custom-class="gradient-btn"
              :loading="loadingTable"
              @click="applyFilters"
            />
          </div>
          <div class="col-auto">
            <Button
              label="Limpiar"
              icon="clear"
              custom-class="boton-cerrar"
              :loading="loadingTable"
              @click="clearFilters"
            />
          </div>
        </div>

        <div class="table-wrapper">
          <Table
            :rows="rowsRegistrations"
            :columns="columns"
            row-key="_id"
            :loading="loadingTable"
            :pagination="pagination"
            @request="handlePaginationRequestRegistrations"
          >
            <template #body-cell-registrationNumber="props">
              <q-td :props="props">
                {{ props.row.registration_number || props.row.registrationNumber || 'N/A' }}
              </q-td>
            </template>

            <template #body-cell-registrationStatus="props">
              <q-td :props="props">
                <q-badge :color="getStatusColor(props.row.registrationStatus || props.row.registration_status)">
                  {{ getStatusLabel(props.row.registrationStatus || props.row.registration_status) }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-modality="props">
              <q-td :props="props">
                {{ props.row.modality_id?.name || props.row.modality_id?.Name || props.row.modality?.name || props.row.modality || 'N/A' }}
              </q-td>
            </template>

            <template #body-cell-apprentice="props">
              <q-td :props="props">
                {{ getApprenticeName(props.row) }}
              </q-td>
            </template>

            <template #body-cell-company="props">
              <q-td :props="props">
                {{ props.row.company_id?.name || props.row.company_id?.Name || props.row.company?.name || props.row.company || 'N/A' }}
              </q-td>
            </template>

            <template #body-cell-scheduledStartDate="props">
              <q-td :props="props">
                {{ formatDate(props.row.scheduledStartDate || props.row.scheduled_start_date) }}
              </q-td>
            </template>

            <template #body-cell-opciones="props">
              <q-td :props="props" class="text-center table-options">
                <ButtonTableOptions
                  icon="visibility"
                  color="grey"
                  tooltip="Ver detalles"
                  @click="openDetailsDialogRegistrations(props.row)"
                />
                <ButtonTableOptions
                  icon="edit"
                  color="grey-7"
                  tooltip="Editar observaciones"
                  @click="handleEdit(props.row)"
                />
                <ButtonTableOptions
                  v-if="(props.row.registrationStatus || props.row.registration_status) === REGISTRATION_STATUS.PENDING"
                  icon="check"
                  color="positive"
                  tooltip="Aprobar registro"
                  @click="handleValidate(props.row, REGISTRATION_STATUS.APPROVED)"
                />
                <ButtonTableOptions
                  v-if="(props.row.registrationStatus || props.row.registration_status) === REGISTRATION_STATUS.PENDING"
                  icon="close"
                  color="negative"
                  tooltip="Rechazar registro"
                  @click="handleValidate(props.row, REGISTRATION_STATUS.REJECTED)"
                />
              </q-td>
            </template>

            <template #no-data>
              <div class="q-pa-md flex flex-center column text-grey full-width">
                <q-icon name="assignment" size="2.5em" color="positive" />
                <div class="text-subtitle2 q-mt-sm">
                  No hay registros de EP
                </div>
              </div>
            </template>
          </Table>
        </div>
      </div>
    </div>

    <Modal
      v-model="showDetailDialog"
      width="1200px"
      max-width="98vw"
    >
      <template #header>
        <div class="modal-header-content">
          <div class="text-h6">Detalles del Registro EP</div>
        </div>
      </template>
      <template #body>
        <div v-if="selectedRegistration" class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md section-title">Información del Registro</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Número de Registro:</div>
                <div class="data-value">{{ selectedRegistration.registrationNumber || selectedRegistration.registration_number || 'N/A' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Aprendiz:</div>
                <div class="data-value">{{ getApprenticeName(selectedRegistration) }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Modalidad:</div>
                <div class="data-value">{{ selectedRegistration.modality_id?.name || selectedRegistration.modality_id?.Name || selectedRegistration.modality?.name || selectedRegistration.modality || 'N/A' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Empresa:</div>
                <div class="data-value">{{ selectedRegistration.company_id?.name || selectedRegistration.company_id?.Name || selectedRegistration.company?.name || selectedRegistration.company || 'N/A' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Fecha de Inicio:</div>
                <div class="data-value">{{ formatDate(selectedRegistration.scheduled_start_date || selectedRegistration.scheduledStartDate) }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Estado:</div>
                <div class="data-value">
                  <q-badge :color="getStatusColor(selectedRegistration.registration_status ?? selectedRegistration.registrationStatus)">
                    {{ getStatusLabel(selectedRegistration.registration_status ?? selectedRegistration.registrationStatus) }}
                  </q-badge>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md section-title">Detalles de Horario</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Total Horas Solicitadas:</div>
                <div class="data-value">{{ (selectedRegistration.total_requested_hours ?? selectedRegistration.totalRequestedHours ?? '-') }} horas</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Días Laborales:</div>
                <div class="data-value">{{ selectedRegistration.working_days ?? selectedRegistration.workingDays ?? '-' }} días/semana</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Horas Diarias:</div>
                <div class="data-value">{{ selectedRegistration.daily_hours ?? selectedRegistration.dailyHours ?? '-' }} horas/día</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Fecha de Registro:</div>
                <div class="data-value">{{ formatDate(selectedRegistration.registration_date || selectedRegistration.registrationDate) }}</div>
              </div>
            </div>
          </div>

          <div v-if="selectedRegistration.apprentice_observations?.length > 0" class="col-12">
            <div class="text-h6 q-mb-md section-title">Observaciones del Aprendiz</div>
            <div class="data-grid">
              <q-timeline color="primary">
                <q-timeline-entry
                  v-for="(obs, index) in selectedRegistration.apprentice_observations"
                  :key="index"
                  :title="formatDate(obs.fecha)"
                  :subtitle="obs.escrito_por"
                >
                  <div>{{ obs.descripcion }}</div>
                </q-timeline-entry>
              </q-timeline>
            </div>
          </div>

          <div v-if="selectedRegistration.admin_observations?.length > 0" class="col-12">
            <div class="text-h6 q-mb-md section-title">Observaciones Administrativas</div>
            <div class="data-grid">
              <q-timeline color="secondary">
                <q-timeline-entry
                  v-for="(obs, index) in selectedRegistration.admin_observations"
                  :key="index"
                  :title="formatDate(obs.fecha)"
                  :subtitle="obs.escrito_por"
                >
                  <div>{{ obs.descripcion }}</div>
                </q-timeline-entry>
              </q-timeline>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <Button 
          label="Cerrar"
          custom-class="boton-cerrar"
          @click="showDetailDialog = false" 
        />
      </template>
    </Modal>

    <Modal
      v-model="showEditDialog"
      width="900px"
      max-width="98vw"
    >
      <template #header>
        <div class="modal-header-content">
          <div class="text-h6">Agregar Observación Administrativa</div>
        </div>
      </template>
      <template #body>
        <q-form ref="formRef" @submit.prevent="handleSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md section-title">Información del Registro</div>
              <div class="data-grid">
                <div class="data-row">
                  <div class="text-weight-bold">Registro:</div>
                  <div class="data-value">{{ itemBeingEdited.registration_number }}</div>
                </div>
                <div class="data-row">
                  <div class="text-weight-bold">Aprendiz:</div>
                  <div class="data-value">{{ getApprenticeName(itemBeingEdited) }}</div>
                </div>
                <div class="data-row">
                  <div class="text-weight-bold">Modalidad:</div>
                  <div class="data-value">{{ itemBeingEdited.modalityName }}</div>
                </div>
                <div class="data-row">
                  <div class="text-weight-bold">Empresa:</div>
                  <div class="data-value">{{ itemBeingEdited.companyName }}</div>
                </div>
              </div>
            </div>

            <div class="col-12">
              <div class="text-h6 q-mb-md section-title">Nueva Observación</div>
              <q-input
                filled
                v-model="itemBeingEdited.admin_observations"
                label="Observación Administrativa *"
                type="textarea"
                rows="4"
                :rules="[requiredRule]"
                hint="Agrega una observación sobre este registro"
                counter
                maxlength="500"
              />
            </div>
          </div>
        </q-form>
      </template>
      <template #footer>
        <Button 
          label="Cancelar" 
          custom-class="boton-cerrar"
          @click="showEditDialog = false" 
        />
        <Button 
          label="Guardar" 
          @click="handleSubmit" 
          :loading="loading" 
        />
      </template>
    </Modal>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { putData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import { useAuthStore } from 'src/stores/authStore'
import { useEntityManager } from 'src/composables/useEntityManager'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Table from 'src/components/Table.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Modal from 'src/components/Modal.vue'

const REGISTRATION_STATUS = { PENDING: 3, REJECTED: 1, APPROVED: 0 }
const REGISTRATION_STATUS_LABELS = {
  [REGISTRATION_STATUS.PENDING]: 'Pendiente',
  [REGISTRATION_STATUS.REJECTED]: 'Rechazado',
  [REGISTRATION_STATUS.APPROVED]: 'Aprobado'
}

const $q = useQuasar()
const notifications = useNotifications()
const requiredRule = (value) => !!value || 'Este campo es requerido'
const authStore = useAuthStore()

// ==================== COMPOSABLE CONFIGURATION ====================

// 1️⃣ Form structure (not used for registrations in composable, but required)
const getDefaultFormData = () => ({
  _id: '',
  registration_number: '',
  apprentice_id: null,
  modality_id: '',
  company_id: '',
  modalityName: 'N/A',
  companyName: 'N/A',
  scheduled_start_date: '',
  total_requested_hours: 0,
  working_days: 5,
  daily_hours: 8,
  admin_observations: '',
  registration_status: 0
})

// 2️⃣ API endpoints
const endpoints = {
  list: '/registrations/listRegistrations',
  update: (id) => `/registrations/updateRegistration/${id}`,
  validate: (id) => `/registrations/validateRegistration/${id}`
}

// 3️⃣ Custom messages
const customMessages = {
  listError: 'Error al cargar los registros',
  noData: 'No hay registros de EP'
}

// 4️⃣ Function to process API response
const processRegistrationsResponse = (response) => {
  let data = []
  
  if (response?.msg && Array.isArray(response.msg)) {
    data = response.msg
  } else if (Array.isArray(response)) {
    data = response
  } else if (Array.isArray(response?.data)) {
    data = response.data
  } else if (response?.registrations && Array.isArray(response.registrations)) {
    data = response.registrations
  } else if (response?.data?.registrations && Array.isArray(response.data.registrations)) {
    data = response.data.registrations
  }
  
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
  showDetailDialog,
  selectedEntity,
  pagination,
  filtersData,
  formData,
  // Functions for pagination
  handlePaginationRequest,
  // Functions for modals
  openDetailsDialog,
  // Functions for API
  fetchEntities
} = useEntityManager({
  entityName: 'registration',
  entityNamePlural: 'registrations',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processRegistrationsResponse
})

// ==================== ALIAS WITH STANDARDIZED NAMES ====================
// Following convention: functionName + Entity

// States
const rowsRegistrations = rows
const selectedRegistration = selectedEntity

// Functions for modals
const openDetailsDialogRegistrations = openDetailsDialog

// Functions for pagination
const handlePaginationRequestRegistrations = (props) => {
  // Override to include registrationNumber filter
  if (filtersData.value.search) {
    filtersData.value.registrationNumber = filtersData.value.search
  }
  handlePaginationRequest(props)
}

// Functions for filters
const applyFilters = () => {
  if (filtersData.value.search) {
    filtersData.value.registrationNumber = filtersData.value.search
  }
  pagination.value.page = 1
  fetchRegistrations()
}

const clearFilters = () => {
  filtersData.value.search = ''
  filtersData.value.registrationNumber = ''
  pagination.value.page = 1
  fetchRegistrations()
  notifications.info('Filtros limpiados')
}

// ==================== REGISTRATION SPECIFIC DATA ====================

// State for edit modal (custom logic)
const formRef = ref(null)
const showEditDialog = ref(false)

const itemBeingEdited = ref({ 
  _id: '', 
  registration_number: '', 
  apprentice_id: null, 
  modality_id: '', 
  company_id: '', 
  modalityName: 'N/A', 
  companyName: 'N/A', 
  scheduled_start_date: '', 
  total_requested_hours: 0, 
  working_days: 5, 
  daily_hours: 8, 
  admin_observations: '', 
  registration_status: 0 
})

const columns = [
  { 
    name: 'registrationNumber', 
    label: 'Número Registro', 
    field: 'registration_number',
    sortable: true, 
    align: 'left' 
  },
  { 
    name: 'apprentice', 
    label: 'Aprendiz', 
    field: 'apprentice',
    sortable: true, 
    align: 'left' 
  },
  { 
    name: 'modality', 
    label: 'Modalidad', 
    field: 'modality',
    sortable: true, 
    align: 'left' 
  },
  { 
    name: 'company', 
    label: 'Empresa', 
    field: 'company',
    sortable: true, 
    align: 'left' 
  },
  { 
    name: 'scheduledStartDate', 
    label: 'Fecha Inicio', 
    field: 'scheduled_start_date',
    sortable: true, 
    align: 'center' 
  },
  { 
    name: 'registrationStatus', 
    label: 'Estado', 
    field: 'registration_status',
    sortable: true, 
    align: 'center' 
  },
  { name: 'opciones', label: 'Opciones', align: 'center' }
]

// ==================== CUSTOM API FUNCTIONS ====================

// Override fetchEntities to include registrationNumber filter
const fetchRegistrations = async () => {
  // Add registrationNumber to filters if search exists
  if (filtersData.value.search) {
    filtersData.value.registrationNumber = filtersData.value.search
  }
  await fetchEntities()
}

function getStatusLabel(status) { 
  return REGISTRATION_STATUS_LABELS[status] || 'Desconocido' 
}

function getStatusColor(status) {
  const colors = { 
    [REGISTRATION_STATUS.PENDING]: 'orange', 
    [REGISTRATION_STATUS.REJECTED]: 'negative', 
    [REGISTRATION_STATUS.APPROVED]: 'positive' 
  }
  return colors[status] || 'grey'
}

function getApprenticeName(record) {
  const ap = record.apprentice_id || record.apprenticeId || record.apprentice || null
  if (!ap) return 'N/A'
  const first = ap.firstName || ap.first_name || ap.first || ''
  const last = ap.lastName || ap.last_name || ap.last || ''
  const full = `${first} ${last}`.trim()
  if (full) return full
  return ap.name || ap.nombre || 'N/A'
}

function formatDate(date) {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// ==================== HELPER FUNCTIONS ====================

function handleEdit(record) {
  itemBeingEdited.value = {
    _id: record._id || '',
    registration_number: record.registration_number || '',
    apprentice_id: record.apprentice_id || null,
    modality_id: record.modality_id?._id || '',
    company_id: record.company_id?._id || '',
    modalityName: record.modality_id?.name || 'N/A',
    companyName: record.company_id?.name || 'N/A',
    scheduled_start_date: record.scheduled_start_date ? (record.scheduled_start_date.split('T')[0]) : (record.scheduledStartDate ? (record.scheduledStartDate.split('T')[0]) : ''),
    total_requested_hours: record.total_requested_hours ?? 0,
    working_days: record.working_days ?? 5,
    daily_hours: record.daily_hours ?? 8,
    admin_observations: '',
    registration_status: record.registration_status ?? 0
  }
  showEditDialog.value = true
}

function handleCloseDialog() { 
  showEditDialog.value = false
  if (formRef.value) { 
    formRef.value.resetValidation() 
  } 
}

async function handleSubmit() {
  const isValid = await formRef.value.validate()
  if (!isValid) { 
    notifications.error('Por favor complete todos los campos correctamente')
    return 
  }
  await updateRegistration()
}

async function updateRegistration() {
  try {
    loading.value = true
    const updateData = { 
      admin_observations: itemBeingEdited.value.admin_observations 
    }
    // Use composable's endpoint structure
    await putData(endpoints.update(itemBeingEdited.value._id), updateData)
    notifications.success('Observación agregada exitosamente')
    showEditDialog.value = false
    if (formRef.value) { 
      formRef.value.resetValidation() 
    }
    await fetchRegistrations()
  } catch (error) {
    notifications.error(
      error.response?.data?.message || 
      error.response?.data?.msg || 
      error?.message || 
      'Error al actualizar el registro'
    )
  } finally { 
    loading.value = false 
  }
}

async function handleValidate(record, newStatus) {
  const isApprove = newStatus === REGISTRATION_STATUS.APPROVED
  const statusText = isApprove ? 'aprobar' : 'rechazar'
  const confirmMessage = isApprove
    ? '¿Estás seguro de aprobar este registro de etapa productiva?'
    : '¿Estás seguro de rechazar este registro de etapa productiva?'

  const proceed = async () => {
    try {
      loading.value = true
      const validationData = {
        registration_status: newStatus,
        admin_observations: isApprove
          ? 'Documentos completos y verificados'
          : 'Faltan documentos requeridos'
      }
      // Use composable's endpoint structure
      await putData(endpoints.validate(record._id), validationData)
      notifications.success(`Registro ${isApprove ? 'aprobado' : 'rechazado'} exitosamente`)
      await fetchRegistrations()
    } catch (error) {
      notifications.error(
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error?.message ||
        'Error al validar el registro'
      )
    } finally {
      loading.value = false
    }
  }

  if (!$q || !$q.dialog) {
    if (window.confirm(confirmMessage)) {
      await proceed()
    }
    return
  }

  $q.dialog({
    title: `¿Confirmar ${statusText} registro?`,
    message: confirmMessage,
    cancel: { label: 'Cancelar', color: 'negative', flat: true },
    ok: { label: 'Confirmar', color: 'primary' },
    persistent: true
  }).onOk(async () => {
    await proceed()
  })
}

// ==================== LIFECYCLE HOOKS ====================

onMounted(() => {
  fetchRegistrations()
})
</script>

<style lang="sass" scoped>
.registrations-page
  background: #f5f7fb
  min-height: 100vh

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.container
  max-width: 1600px
  margin: 0 auto

.filters-wrapper
  gap: 12px
  flex-wrap: wrap

.filters-left
  gap: 12px
  padding: 12px 16px
  border-radius: 16px
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08)
  flex-wrap: wrap

.filter-item
  min-width: 240px

.filter-item.search
  width: 320px

.table-wrapper
  background: #fff
  border-radius: 20px
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08)
  padding: 20px

.table-options
  display: flex
  align-items: center
  justify-content: center
  gap: 8px

.modal-footer-actions
  display: flex
  justify-content: flex-end
  gap: 12px
  padding: 0 8px

@media (max-width: 1024px)
  .filters-left
    width: 100%
  .table-wrapper
    padding: 16px

@media (max-width: 768px)
  .filters-wrapper
    flex-direction: column
  .filter-item,
  .filter-item.search
    width: 100%
    min-width: unset
  .table-wrapper
    padding: 16px

@media (max-width: 480px)
  .table-wrapper
    padding: 12px
  .modal-footer-actions
    flex-direction: column
    align-items: stretch

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
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)

:deep(.q-btn.boton-enviar:hover),
:deep(.q-btn.boton-ingresar:hover)
  background: linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary) 100%)

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