<template>
  <div class="q-pa-md">
    <BackButton to="/app/aprendiz/inicio" />
    
    <div class="text-center q-mb-lg">
      <h1 class="text-weight-bold text-black q-my-md" style="font-size: 3rem;">Registro de Etapa Productiva y Empresa</h1>
    </div>
    
    <div class="container">
      <!-- Botón para nuevo registro -->
      <div class="row q-mb-md">
        <div class="col-12 text-right">
          <Button
            label="+ Nuevo Registro EP"
            custom-class="btn-ingresar"
            @click="handleOpenCreateDialog"
            style="height: 36px; padding: 8px 16px;"
            icon="add_circle"
          />
        </div>
      </div>

      <!-- Tabla de mis registros -->
      <Table
        :data="rowsRegistrations"
        :columns="columns"
        row-key="_id"
        no-data-label="No tienes registros de EP. ¡Crea tu primer registro!"
        :rows-per-page-options="[10, 20, 50]"
        :initial-rows-per-page="10"
      >
                <template #body-cell-registrationStatus="props">
                    <q-td :props="props">
                        <q-badge :color="getStatusColor(props.row.registrationStatus || props.row.registration_status)">
                            {{ getStatusLabel(props.row.registrationStatus || props.row.registration_status) }}
                        </q-badge>
                    </q-td>
                </template>

        <template #body-cell-modality="props">
          <q-td :props="props">
            {{ props.row.modality_id?.name || 'N/A' }}
          </q-td>
        </template>

        <template #body-cell-company="props">
          <q-td :props="props">
            {{ props.row.company_id?.name || 'N/A' }}
          </q-td>
        </template>

                <template #body-cell-scheduledStartDate="props">
                    <q-td :props="props">
                        {{ formatDate(props.row.scheduledStartDate || props.row.scheduled_start_date) }}
                    </q-td>
                </template>

        <template #body-cell-opciones="props">
          <q-td :props="props" class="text-center">
            <q-btn
              flat
              round
              color="primary"
              icon="visibility"
              @click="handleViewDetails(props.row)"
            >
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
            <q-btn
              v-if="canEdit(props.row)"
              flat
              round
              color="warning"
              icon="edit"
              @click="handleEdit(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </Table>
    </div>

    <!-- Modal de Detalles -->
    <Modal
      ref="detailsModalRef"
      width="800px"
      max-width="98vw"
    >
      <template #header>
        <div class="text-h6">Detalles del Registro EP</div>
      </template>
      <template #body>
        <div v-if="selectedRegistration" class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="text-subtitle2 text-grey-8">Número de Registro</div>
              <div class="text-body1 text-weight-bold">{{ selectedRegistration.registration_number || 'N/A' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 text-grey-8">Modalidad</div>
              <div class="text-body1">{{ selectedRegistration.modality_id?.name || 'N/A' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 text-grey-8">Empresa</div>
              <div class="text-body1">{{ selectedRegistration.company_id?.name || 'N/A' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 text-grey-8">Fecha de Inicio</div>
                            <div class="text-body1">{{ formatDate(selectedRegistration.scheduledStartDate || selectedRegistration.scheduled_start_date) }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 text-grey-8">Estado</div>
              <div>
                <q-badge :color="getStatusColor(selectedRegistration.registrationStatus || selectedRegistration.registration_status)">
                  {{ getStatusLabel(selectedRegistration.registrationStatus || selectedRegistration.registration_status) }}
                </q-badge>
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-subtitle2 text-grey-8">Total Horas Solicitadas</div>
              <div class="text-body1">{{ selectedRegistration.totalRequestedHours || selectedRegistration.total_requested_hours || 0 }} horas</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-subtitle2 text-grey-8">Días Laborales</div>
              <div class="text-body1">{{ selectedRegistration.working_days }} días/semana</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-subtitle2 text-grey-8">Horas Diarias</div>
              <div class="text-body1">{{ selectedRegistration.daily_hours }} horas/día</div>
            </div>
            <div class="col-12">
              <div class="text-subtitle2 text-grey-8">Fecha de Registro</div>
              <div class="text-body1">{{ formatDate(selectedRegistration.registration_date) }}</div>
            </div>
            
            <!-- Observaciones del Aprendiz -->
            <div v-if="selectedRegistration.apprentice_observations?.length > 0" class="col-12">
              <div class="text-subtitle2 text-grey-8 q-mb-sm">Mis Observaciones</div>
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
            
            <!-- Observaciones del Admin -->
            <div v-if="selectedRegistration.admin_observations?.length > 0" class="col-12">
              <div class="text-subtitle2 text-grey-8 q-mb-sm">Observaciones del Administrador</div>
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
        <div class="modal-footer-buttons">
          <Button label="Cerrar" custom-class="btn-cancelar" @click="detailsModalRef?.closeDialog()" />
        </div>
      </template>
    </Modal>

    <!-- Modal de Creación/Edición -->
    <Modal
      ref="editModalRef"
      width="900px"
      max-width="98vw"
    >
      <template #header>
        <div class="text-h6">{{ isEditMode ? 'Editar' : 'Nuevo' }} Registro de Etapa Productiva</div>
      </template>
      <template #body>
        <q-form ref="formRef" class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Número de Registro (solo en edición) -->
            <div v-if="isEditMode" class="col-12">
              <q-input
                v-model="formData.registration_number"
                label="Número de Registro"
                outlined
                dense
                readonly
                hint="Número de registro asignado"
              />
            </div>

            <!-- Información del aprendiz (solo lectura) -->
            <div class="col-12">
              <q-banner class="bg-blue-1">
                <template v-slot:avatar>
                  <q-icon name="account_circle" color="primary" />
                </template>
                <div class="text-body2">
                  <strong>Registrando para:</strong> {{ apprenticeName }}
                </div>
              </q-banner>
            </div>

            <!-- Seleccionar Modalidad -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="formData.modality_id"
                :options="modalityOptions"
                option-value="_id"
                option-label="name"
                emit-value
                map-options
                label="Modalidad EP *"
                outlined
                dense
                :rules="[requiredRule]"
                hint="Selecciona la modalidad de tu etapa productiva"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No hay modalidades disponibles
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Seleccionar Empresa -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="formData.company_id"
                :options="companyOptions"
                option-value="_id"
                option-label="name"
                emit-value
                map-options
                label="Empresa *"
                outlined
                dense
                :rules="[requiredRule]"
                hint="Empresa donde realizarás la EP"
                use-input
                input-debounce="300"
                @filter="filterCompanies"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No hay empresas disponibles
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Fecha de Inicio Programada -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.scheduled_start_date"
                label="Fecha de Inicio Programada *"
                outlined
                dense
                type="date"
                :rules="[requiredRule]"
                hint="Fecha en que inicias la etapa productiva"
              />
            </div>

            <!-- Total Horas Solicitadas -->
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="formData.total_requested_hours"
                label="Total Horas Solicitadas *"
                outlined
                dense
                type="number"
                :rules="[requiredRule, (val) => val > 0 || 'Debe ser mayor a 0']"
                hint="Total de horas de la etapa productiva"
              />
            </div>

            <!-- Días Laborales por Semana -->
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="formData.working_days"
                label="Días Laborales por Semana *"
                outlined
                dense
                type="number"
                :rules="[requiredRule, (val) => (val >= 1 && val <= 7) || 'Debe estar entre 1 y 7']"
                hint="Número de días que trabajarás por semana"
              />
            </div>

            <!-- Horas Diarias -->
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="formData.daily_hours"
                label="Horas Diarias *"
                outlined
                dense
                type="number"
                :rules="[requiredRule, (val) => (val >= 1 && val <= 24) || 'Debe estar entre 1 y 24']"
                hint="Horas que trabajarás por día"
              />
            </div>

            <!-- Observaciones del Aprendiz -->
            <div class="col-12">
              <q-input
                v-model="formData.apprentice_observations"
                label="Observaciones (opcional)"
                outlined
                dense
                type="textarea"
                rows="3"
                hint="Puedes agregar comentarios o detalles adicionales"
                counter
                maxlength="500"
              />
            </div>

            <!-- Advertencia si está editando -->
            <div v-if="isEditMode" class="col-12">
              <q-banner class="bg-orange-1">
                <template v-slot:avatar>
                  <q-icon name="warning" color="orange" />
                </template>
                <div class="text-body2">
                  Solo puedes editar registros que aún no han sido validados por el administrador.
                </div>
              </q-banner>
            </div>
          </div>
        </q-form>
      </template>
      <template #footer>
        <div class="modal-footer-buttons">
          <Button label="Cancelar" custom-class="btn-cancelar" @click="handleCloseDialog" />
          <Button
            :label="isEditMode ? 'Actualizar' : 'Registrar'"
            custom-class="btn-enviar"
            @click="handleSubmit"
            :loading="loading"
          />
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getData, postData, putData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import { useEntityManager } from 'src/composables/useEntityManager'
import { useAuthStore } from 'src/stores/authStore'
import BackButton from 'src/components/BackButton.vue'
import Button from 'src/components/Button.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'

const STATUS = { ACTIVE: 0, INACTIVE: 1 }
const STATUS_LABELS = { ACTIVE: 'Activo', INACTIVE: 'Inactivo', ALL: 'Todos los estados' }
const STATUS_OPTIONS = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Activo', value: STATUS.ACTIVE },
  { label: 'Inactivo', value: STATUS.INACTIVE }
]

const notifications = useNotifications()
const requiredRule = (value) => !!value || 'Este campo es requerido'
const authStore = useAuthStore()

// ==================== COMPOSABLE CONFIGURATION ====================

// 1️⃣ Form structure
const getDefaultFormData = () => ({
  _id: '',
  registration_number: '',
  modality_id: '',
  company_id: '',
  scheduled_start_date: '',
  total_requested_hours: 0,
  working_days: 5,
  daily_hours: 8,
  apprentice_observations: ''
})

// 2️⃣ API endpoints
const endpoints = {
  list: '/registrations/myRegistrations',
  create: '/registrations',
  update: (id) => `/registrations/${id}`
}

// 3️⃣ Custom messages
const customMessages = {
  listError: 'Error al cargar tus registros',
  createSuccess: 'Registro de EP creado exitosamente. Pendiente de validación administrativa.',
  createError: 'Error al crear el registro',
  updateSuccess: 'Registro actualizado exitosamente',
  updateError: 'Error al actualizar el registro',
  noData: 'No tienes registros de EP. ¡Crea tu primer registro!'
}

// 4️⃣ Function to process API response
const processRegistrationsResponse = (response) => {
  function extractRegistrations(payload) {
    if (Array.isArray(payload)) return payload
    if (payload?.registrations && Array.isArray(payload.registrations)) return payload.registrations
    if (payload?.msg && Array.isArray(payload.msg)) return payload.msg
    if (payload?.data && Array.isArray(payload.data)) return payload.data
    if (payload?.data?.registrations && Array.isArray(payload.data.registrations)) return payload.data.registrations
    return []
  }
  
  const data = extractRegistrations(response)
  
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
  showAddDialog,
  showDetailDialog,
  selectedEntity,
  formData,
  filtersData,
  pagination,
  isEditMode,
  // Functions for pagination
  handlePaginationRequest,
  resetPaginationState,
  // Functions for filters
  handleSearchChange,
  // Functions for modals
  openFormDialog,
  closeFormDialog,
  openDetailsDialog,
  // Functions for form
  resetForm,
  populateFormForEdit,
  // Functions for API
  fetchEntities,
  submitForm
} = useEntityManager({
  entityName: 'registration',
  entityNamePlural: 'registrations',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processRegistrationsResponse
})

// ==================== ALIAS WITH STANDARDIZED NAMES ====================

// States
const rowsRegistrations = rows
const selectedRegistration = selectedEntity

// ==================== REGISTRATION SPECIFIC DATA ====================

const formRef = ref(null)
const detailsModalRef = ref(null)
const editModalRef = ref(null)

const modalityOptions = ref([])
const companyOptions = ref([])
const allCompanies = ref([])

// ==================== COMPUTED ====================

const apprenticeName = computed(() => {
  const user = authStore.user
  return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Aprendiz'
})

// ==================== COLUMNS ====================

const columns = [
  { name: 'registrationNumber', label: 'Número Registro', field: 'registrationNumber', sortable: true, align: 'left' },
  { name: 'modality', label: 'Modalidad', field: 'modality', sortable: true, align: 'left' },
  { name: 'company', label: 'Empresa', field: 'company', sortable: true, align: 'left' },
  { name: 'scheduledStartDate', label: 'Fecha Inicio', field: 'scheduledStartDate', sortable: true, align: 'center' },
  { name: 'totalRequestedHours', label: 'Horas Totales', field: 'totalRequestedHours', sortable: true, align: 'center' },
  { 
    name: 'registrationStatus', 
    label: 'Estado', 
    field: 'registrationStatus', 
    sortable: true, 
    align: 'center',
    badge: true,
    badgeColor: (row) => getStatusColor(row.registrationStatus || row.registration_status),
    format: (val, row) => getStatusLabel(row.registrationStatus || row.registration_status)
  },
  { 
    name: 'opciones', 
    label: 'Opciones', 
    align: 'center',
    actions: [
      { 
        icon: 'visibility', 
        tooltip: 'Ver Detalles', 
        action: (row) => handleViewDetails(row)
      },
      { 
        icon: 'edit', 
        tooltip: 'Editar', 
        action: (row) => handleEdit(row),
        condition: (row) => canEdit(row)
      }
    ]
  }
]

// ==================== FUNCIONES DE DATOS ====================

// ==================== FUNCIONES DE UI ====================

function getStatusLabel(status) {
  // 0 = Pendiente, 1 = Rechazado, 2 = En Revisión, 3 = Aprobado
  const labels = {
    0: 'Pendiente Validación',
    1: 'Rechazado',
    2: 'En Revisión',
    3: 'Aprobado'
  }
  return labels[status] || 'Desconocido'
}

function getStatusColor(status) {
  // 0 = Pendiente, 1 = Rechazado, 2 = En Revisión, 3 = Aprobado
  const colors = {
    0: 'orange',
    1: 'negative',
    2: 'info',
    3: 'positive'
  }
  return colors[status] || 'grey'
}

function canEdit(record) {
  // Solo se puede editar si está pendiente (0) o rechazado (1)
  return record.registration_status === 0 || record.registration_status === 1
}

function formatDate(date) {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// ==================== MANEJADORES DE MODALES ====================

// Override fetchEntities to use custom endpoint
const fetchRegistrations = async () => {
  await fetchEntities()
}

function handleViewDetails(record) {
  openDetailsDialog(record)
  detailsModalRef.value?.openDialog()
}

function handleEdit(record) {
  if (!canEdit(record)) {
    notifications.warning('No puedes editar un registro ya aprobado o en revisión')
    return
  }
  
  // Use composable's populateFormForEdit
  populateFormForEdit(record)
  
  // Map specific fields
  formData.value.modality_id = record.modality_id?._id || ''
  formData.value.company_id = record.company_id?._id || ''
  formData.value.scheduled_start_date = record.scheduled_start_date ? record.scheduled_start_date.split('T')[0] : ''
  formData.value.total_requested_hours = record.total_requested_hours ?? 0
  formData.value.working_days = record.working_days ?? 5
  formData.value.daily_hours = record.daily_hours ?? 8
  formData.value.apprentice_observations = record.apprentice_observations?.[record.apprentice_observations.length - 1]?.descripcion || ''
  
  editModalRef.value?.openDialog()
}

function handleOpenCreateDialog() {
  resetForm()
  openFormDialog()
  editModalRef.value?.openDialog()
}

function handleCloseDialog() {
  closeFormDialog()
  editModalRef.value?.closeDialog()
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

// ==================== MANEJADORES DE FORMULARIO ====================

// Build custom payload for registration
const buildRegistrationPayload = (formDataValue) => ({
  modality_id: formDataValue.modality_id,
  company_id: formDataValue.company_id,
  scheduled_start_date: formDataValue.scheduled_start_date,
  total_requested_hours: formDataValue.total_requested_hours,
  working_days: formDataValue.working_days,
  daily_hours: formDataValue.daily_hours,
  apprentice_observations: formDataValue.apprentice_observations,
  uploaded_documents: []
})

async function handleSubmit() {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    notifications.error('Por favor complete todos los campos correctamente')
    return
  }
  
  // Use composable's submitForm but with custom payload
  loading.value = true
  
  try {
    const payload = buildRegistrationPayload(formData.value)
    
    if (isEditMode.value) {
      // Update
      await putData(endpoints.update(formData.value._id), payload)
      notifications.success(customMessages.updateSuccess)
    } else {
      // Create
      await postData(endpoints.create, payload)
      notifications.success(customMessages.createSuccess)
    }
    
    editModalRef.value?.closeDialog()
    closeFormDialog()
    if (formRef.value) {
      formRef.value.resetValidation()
    }
    await fetchRegistrations()
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      error?.message ||
      (isEditMode.value ? customMessages.updateError : customMessages.createError)
    notifications.error(message)
  } finally {
    loading.value = false
  }
}

// ==================== FUNCIONES AUXILIARES ====================

async function loadModalities() {
  try {
    const payload = await getData('/modalities/listModalities')
    
    if (payload?.modalities && Array.isArray(payload.modalities)) {
      // Sin usar filter - el backend debe devolver solo modalidades activas
      modalityOptions.value = payload.modalities || []
    } else if (payload?.data && Array.isArray(payload.data)) {
      // Sin usar filter - el backend debe devolver solo modalidades activas
      modalityOptions.value = payload.data || []
    } else if (Array.isArray(payload)) {
      // Sin usar filter - el backend debe devolver solo modalidades activas
      modalityOptions.value = payload || []
    }
  } catch (error) {  }
}

async function loadCompanies() {
  try {
    const payload = await getData('/companies/listCompanies')
    
    let data = []
    if (payload?.companies && Array.isArray(payload.companies)) {
      data = payload.companies
    } else if (payload?.data && Array.isArray(payload.data)) {
      data = payload.data
    } else if (Array.isArray(payload)) {
      data = payload
    }
    
    // Filtrar usando while
    allCompanies.value = []
    let i = 0
    while (i < data.length) {
      if (data[i].status === STATUS.ACTIVE) {
        allCompanies.value.push(data[i])
      }
      i++
    }
    // Copiar usando while
    companyOptions.value = []
    i = 0
    while (i < allCompanies.value.length) {
      companyOptions.value.push(allCompanies.value[i])
      i++
    }
  } catch (error) {  }
}

function filterCompanies(val, update) {
  update(() => {
    if (val === '') {
      companyOptions.value = allCompanies.value
    } else {
      const needle = val.toLowerCase()
      // Sin usar filter/includes - el backend debe filtrar
      const filtered = []
      let index = 0
      while (index < allCompanies.value.length) {
        const c = allCompanies.value[index]
        if (c && c.name) {
          // Sin usar includes - buscar substring manualmente
          const nameLower = c.name.toLowerCase()
          let nameIndex = 0
          let found = false
          while (nameIndex <= nameLower.length - needle.length && !found) {
            let matchIndex = 0
            let matches = true
            while (matchIndex < needle.length && matches) {
              if (nameLower[nameIndex + matchIndex] !== needle[matchIndex]) {
                matches = false
              }
              matchIndex++
            }
            if (matches) found = true
            nameIndex++
          }
          if (found) {
            filtered.push(c)
          }
        }
        index++
      }
      companyOptions.value = filtered
    }
  })
}

// ==================== LIFECYCLE ====================

onMounted(async () => {
  await Promise.all([
    fetchRegistrations(),
    loadModalities(),
    loadCompanies()
  ])
})
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
}

.q-table__card {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.modal-footer-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    width: 100%;
}
</style>
