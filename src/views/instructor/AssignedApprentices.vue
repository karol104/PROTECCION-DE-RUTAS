<template>
  <q-page class="q-pa-md">
    <BackButton />
    
    <PageHeader 
      title="Mis Aprendices" 
      description="Listado y gestión de aprendices asignados." 
    />
    
    <div class="container">
      <!-- Filtros de búsqueda -->
      <div class="filters-wrapper q-mb-lg">
        <div class="filters-section">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="filtersData.search"
                dense
                outlined
                placeholder="Buscar por nombre, documento o email"
                clearable
                debounce="600"
                class="custom-green-icons"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="green-7" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="filtersData.status"
                :options="STATUS_OPTIONS"
                dense
                outlined
                label="Estado"
                clearable
                emit-value
                map-options
                class="custom-green-icons"
              >
                <template v-slot:prepend>
                  <q-icon name="filter_list" color="green-7" />
                </template>
              </q-select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de aprendices -->
      <Table
        card
        :rows="rows"
        :columns="columns"
        row-key="_id"
        :loading="loadingTable"
        :pagination="pagination"
        :rows-per-page-options="[10, 20, 50, 100]"
        @request="handlePaginationRequest"
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
            <div class="row q-gutter-xs justify-center">
              <ButtonTableOptions
                icon="visibility"
                tooltip="Ver detalles"
                color="primary"
                @click="openDetailsDialog(props.row)"
              />
              <ButtonTableOptions
                icon="edit"
                tooltip="Editar"
                color="primary"
                @click="handleEdit(props.row)"
              />
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="q-pa-md flex flex-center column text-grey full-width">
            <q-icon name="person_off" size="2.5em" color="grey-5" />
            <div class="text-subtitle2 q-mt-sm">
              No hay aprendices registrados
            </div>
          </div>
        </template>
      </Table>
    </div>

    <!-- Modal de Detalles -->
    <Modal
      v-model="showDetailDialog"
      variant="view"
      width="1200px"
      max-width="98vw"
    >
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="person" class="q-mr-sm" />
            Detalles del Aprendiz
          </div>
        </div>
      </template>
      <template #body>
        <div v-if="selectedEntity" class="modal-content-grid">
          <div class="modal-column">
            <div class="section-title">Datos Personales</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Tipo de Documento:</div>
                <div class="data-value">{{ selectedEntity.documentType || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Número de Documento:</div>
                <div class="data-value">{{ selectedEntity.documentNumber || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Nombres:</div>
                <div class="data-value">{{ selectedEntity.firstName || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Apellidos:</div>
                <div class="data-value">{{ selectedEntity.lastName || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Estado:</div>
                <div class="data-value">
                  <q-badge :color="getStatusColor(selectedEntity.status)">
                    {{ getStatusLabel(selectedEntity.status) }}
                  </q-badge>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-column">
            <div class="section-title">Datos de Contacto</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Teléfono:</div>
                <div class="data-value">{{ selectedEntity.phone || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Email Personal:</div>
                <div class="data-value">{{ getPersonalEmail(selectedEntity) || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Email Institucional:</div>
                <div class="data-value">{{ getInstitutionalEmail(selectedEntity) || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Número de Ficha:</div>
                <div class="data-value">{{ getRecordNumber(selectedEntity) || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <Button 
          label="Cerrar"
          custom-class="boton-cerrar"
          @click="closeDetailsDialog"
        />
      </template>
    </Modal>

    <!-- Modal de Edición -->
    <Modal
      v-model="showEditModal"
      variant="edit"
      width="900px"
      max-width="98vw"
      persistent
    >
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="edit" class="q-mr-sm" />
            Editar Aprendiz
          </div>
        </div>
      </template>
      <template #body>
        <q-form ref="formRef" @submit.prevent="handleSubmit">
          <div class="modal-content-grid">
            <div class="modal-column">
              <div class="section-title">Datos de Identificación</div>
              <q-select
                filled
                v-model="itemBeingEdited.documentType"
                :options="DOCUMENT_TYPE_OPTIONS"
                label="Tipo de Documento *"
                :rules="[requiredRule]"
                disable
                hint="El tipo de documento no se puede editar"
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
                hint="El número de documento no se puede editar"
              />
              <div class="section-title q-mt-md">Nombres</div>
              <q-input
                filled
                v-model="itemBeingEdited.firstName"
                label="Nombres *"
                :rules="[
                  requiredRule,
                  minLengthRule(VALIDATION_RULES.MIN_NAME_LENGTH),
                  maxLengthRule(VALIDATION_RULES.MAX_NAME_LENGTH),
                  lettersOnlyRule
                ]"
              />
              <q-input
                filled
                v-model="itemBeingEdited.lastName"
                label="Apellidos *"
                :rules="[
                  requiredRule,
                  minLengthRule(VALIDATION_RULES.MIN_NAME_LENGTH),
                  maxLengthRule(VALIDATION_RULES.MAX_NAME_LENGTH),
                  lettersOnlyRule
                ]"
              />
            </div>
            <div class="modal-column">
              <div class="section-title">Datos de Contacto</div>
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
                  maxLengthRule(VALIDATION_RULES.MAX_EMAIL_LENGTH),
                  noSpacesRule
                ]"
              />
              <div class="section-title q-mt-md">Email Institucional</div>
              <q-input
                filled
                v-model="itemBeingEdited.emailInstitutional"
                label="Email Institucional *"
                type="email"
                :rules="[
                  requiredRule,
                  emailRule,
                  maxLengthRule(VALIDATION_RULES.MAX_EMAIL_LENGTH),
                  noSpacesRule
                ]"
                hint="Debe terminar en @sena.edu.co"
              />
              <div class="section-title q-mt-md">Número de Ficha</div>
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
          custom-class="gradient-btn"
          @click="handleSubmit" 
          :loading="loading" 
        />
      </template>
    </Modal>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getData, putData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import { useEntityManager } from 'src/composables/useEntityManager'
import { useAuthStore } from 'src/stores/authStore'
import BackButton from 'src/components/BackButton.vue'
import Button from 'src/components/Button.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import PageHeader from 'src/components/PageHeader.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'

// ==================== CONSTANTS ====================
const STATUS = { ACTIVE: 0, INACTIVE: 1 }
const STATUS_LABELS = { ACTIVE: 'Activo', INACTIVE: 'Inactivo' }
const STATUS_OPTIONS = [
  { label: 'Todos los estados', value: '' },
  { label: 'Activo', value: STATUS.ACTIVE },
  { label: 'Inactivo', value: STATUS.INACTIVE }
]
const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  PHONE_LENGTH: 10,
  MAX_EMAIL_LENGTH: 100
}
const DOCUMENT_TYPE_OPTIONS = [
  { label: 'Cédula de Ciudadanía', value: 'CC' },
  { label: 'Tarjeta de Identidad', value: 'TI' },
  { label: 'Cédula de Extranjería', value: 'CE' },
  { label: 'Pasaporte', value: 'PA' }
]

// ==================== ROUTER AND COMPOSABLES ====================
const route = useRoute()
const router = useRouter()
const { success, error: showError, info, warning } = useNotifications()
const authStore = useAuthStore()

// Get instructor ID from token/store
const instructorId = computed(() => {
  const user = authStore.user
  if (user?._id) return user._id
  if (user?.id) return user.id
  if (user?.uid?._id) return user.uid._id
  if (user?.uid?.id) return user.uid.id
  
  try {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    const token = authStore.token || auth?.token
    if (token) {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        return payload?.uid?._id || payload?.uid?.id || payload?.uid
      }
    }
  } catch (e) {
    // Ignore decoding errors
  }
  return null
})

// ==================== VALIDATIONS ====================
const requiredRule = (value) => !!value || 'Este campo es requerido'
const numericRule = (value) => {
  if (!value && value !== 0) return true
  return !isNaN(value) || 'Debe ser un número'
}
const minLengthRule = (min) => (value) => {
  if (!value) return true
  return value.length >= min || `Debe tener al menos ${min} caracteres`
}
const maxLengthRule = (max) => (value) => {
  if (!value) return true
  return value.length <= max || `No debe exceder ${max} caracteres`
}
const noSpacesRule = (value) => {
  if (!value) return true
  let index = 0
  while (index < value.length) {
    if (value[index] === ' ') {
      return 'No debe contener espacios'
    }
    index++
  }
  return true
}
const lettersOnlyRule = (value) => {
  if (!value) return true
  const regex = /^[a-zA-ZÀ-ÿ\s]+$/
  return regex.test(value) || 'Solo debe contener letras y espacios'
}
const phoneRule = (value) => {
  if (!value) return true
  const phoneRegex = /^3\d{9}$/
  return phoneRegex.test(value) || 'El teléfono debe tener 10 dígitos y comenzar con 3'
}
const emailRule = (value) => {
  if (!value) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value) || 'Email inválido'
}

// ==================== COMPOSABLE CONFIGURATION ====================

const getDefaultFormData = () => ({
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

const endpoints = {
  list: '/apprentices/listApprentice',
  update: (id) => `/apprentices/updateEntireApprentice/${id}`
}

const customMessages = {
  listError: 'Error al cargar aprendices',
  updateSuccess: 'Aprendiz actualizado exitosamente',
  updateError: 'Error al actualizar el aprendiz',
  noData: 'No hay aprendices registrados'
}

const processApprenticesResponse = (response) => {
  let data = response?.Apprentice || response?.apprentices || response?.data || response?.msg || []
  
  if (!Array.isArray(data) && typeof data === 'object') {
    const keys = Object.keys(data)
    for (const key of keys) {
      if (Array.isArray(data[key])) {
        data = data[key]
        break
      }
    }
  }
  
  const apprenticesArray = Array.isArray(data) ? data : []
  
  return {
    data: apprenticesArray,
    total: response?.total || response?.totalDocuments || response?.totalApprentices || apprenticesArray.length
  }
}

// Custom function to build filter params
const buildApprenticeFilterParams = (filters, baseParams) => {
  const params = { ...baseParams }
  
  if (filters.search?.trim()) {
    params.search = filters.search.trim()
  }
  
  if (filters.status !== '' && filters.status !== null && filters.status !== undefined) {
    params.status = filters.status
  }
  
  return params
}

const {
  loadingTable,
  loading,
  rows,
  showDetailDialog,
  selectedEntity,
  formData,
  filtersData,
  pagination,
  handlePaginationRequest,
  resetPaginationState,
  openDetailsDialog,
  closeDetailsDialog,
  handleSearchChange,
  handleStatusChange,
  fetchEntities
} = useEntityManager({
  entityName: 'apprentice',
  entityNamePlural: 'apprentices',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processApprenticesResponse,
  buildFilterParams: buildApprenticeFilterParams
})

// ==================== INSTRUCTOR SPECIFIC DATA ====================

const formRef = ref(null)
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

// ==================== TABLE COLUMNS ====================
const columns = [
  { name: 'documentNumber', label: 'Documento', field: 'documentNumber', sortable: true, align: 'left' },
  { name: 'firstName', label: 'Nombres', field: 'firstName', sortable: true, align: 'left' },
  { name: 'lastName', label: 'Apellidos', field: 'lastName', sortable: true, align: 'left' },
  { name: 'phone', label: 'Teléfono', field: 'phone', sortable: true, align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', sortable: true, align: 'center' },
  { name: 'opciones', label: 'Opciones', align: 'center' }
]

// ==================== HELPER FUNCTIONS ====================
const getPersonalEmail = (apprentice) => apprentice?.email?.personal || ''
const getInstitutionalEmail = (apprentice) => apprentice?.email?.institutional || ''
const getRecordNumber = (apprentice) => {
  const records = apprentice?.recordNumber
  return Array.isArray(records) && records.length > 0 
    ? records[0]?.fiche || records[0] || ''
    : ''
}
const getStatusLabel = (status) => status === STATUS.ACTIVE ? STATUS_LABELS.ACTIVE : STATUS_LABELS.INACTIVE
const getStatusColor = (status) => status === STATUS.ACTIVE ? 'positive' : 'negative'

// ==================== CUSTOM API FUNCTIONS ====================

const fetchApprentices = async (requestProps = null) => {
  loadingTable.value = true
  try {
    let projectApprenticeIds = []
    
    if (instructorId.value) {
      try {
        const projectsResponse = await getData('/projects/getProject')
        const projects = projectsResponse?.data || projectsResponse?.msg || projectsResponse || []
        const projectsArray = Array.isArray(projects) ? projects : []
        
        const instructorProjects = projectsArray.filter(project => {
          if (!project.instructors || !Array.isArray(project.instructors)) return false
          
          return project.instructors.some(inst => {
            const instId = inst.id || inst._id || (typeof inst === 'string' ? inst : null)
            return instId === instructorId.value || instId === String(instructorId.value)
          })
        })
        
        instructorProjects.forEach(project => {
          if (project.apprentices && Array.isArray(project.apprentices)) {
            project.apprentices.forEach(apprentice => {
              const apprenticeId = apprentice.id || apprentice._id || (typeof apprentice === 'string' ? apprentice : null)
              if (apprenticeId && !projectApprenticeIds.includes(apprenticeId)) {
                projectApprenticeIds.push(apprenticeId)
              }
            })
          }
        })
      } catch (projectsError) {
        console.warn('Error al obtener proyectos del instructor:', projectsError)
        warning('No se pudieron obtener los proyectos. Mostrando todos los aprendices.')
      }
    }
    
    let allApprentices = []
    
    if (projectApprenticeIds.length > 0) {
      const apprenticePromises = projectApprenticeIds.map(async (apprenticeId) => {
        try {
          const apprenticeResponse = await getData(`/apprentices/apprenticeById/${apprenticeId}`)
          const apprenticeData = apprenticeResponse?.data || apprenticeResponse?.msg || apprenticeResponse
          return apprenticeData
        } catch (error) {
          return null
        }
      })
      
      const apprenticeResults = await Promise.all(apprenticePromises)
      allApprentices = apprenticeResults.filter(a => a !== null)
      
      if (allApprentices.length < projectApprenticeIds.length) {
        const listResponse = await getData('/apprentices/listApprentice')
        let listData = listResponse?.Apprentice || listResponse?.apprentices || listResponse?.data || listResponse?.msg || []
        
        if (!Array.isArray(listData) && typeof listData === 'object') {
          const keys = Object.keys(listData)
          for (const key of keys) {
            if (Array.isArray(listData[key])) {
              listData = listData[key]
              break
            }
          }
        }
        
        const listApprentices = Array.isArray(listData) ? listData : []
        const filteredApprentices = listApprentices.filter(apprentice => {
          const apprenticeId = apprentice._id || apprentice.id
          return projectApprenticeIds.includes(apprenticeId) || projectApprenticeIds.includes(String(apprenticeId))
        })
        
        const existingIds = allApprentices.map(a => a._id || a.id)
        filteredApprentices.forEach(apprentice => {
          const apprenticeId = apprentice._id || apprentice.id
          if (!existingIds.includes(apprenticeId)) {
            allApprentices.push(apprentice)
          }
        })
      }
    } else {
      await fetchEntities(requestProps)
      return
    }
    
    if (filtersData.value.search && projectApprenticeIds.length > 0) {
      const search = filtersData.value.search.toLowerCase()
      allApprentices = allApprentices.filter(apprentice => {
        const fullName = `${apprentice.firstName || ''} ${apprentice.lastName || ''}`.toLowerCase()
        const document = (apprentice.documentNumber || '').toString().toLowerCase()
        const emailPersonal = (getPersonalEmail(apprentice) || '').toLowerCase()
        const emailInstitutional = (getInstitutionalEmail(apprentice) || '').toLowerCase()
        
        return fullName.includes(search) ||
               document.includes(search) ||
               emailPersonal.includes(search) ||
               emailInstitutional.includes(search)
      })
    }
    
    if (filtersData.value.status !== '' && filtersData.value.status !== null && projectApprenticeIds.length > 0) {
      allApprentices = allApprentices.filter(apprentice => apprentice.status === filtersData.value.status)
    }
    
    if (requestProps?.pagination) {
      pagination.value.page = requestProps.pagination.page
      pagination.value.rowsPerPage = requestProps.pagination.rowsPerPage
    }
    
    if (projectApprenticeIds.length > 0) {
      pagination.value.rowsNumber = allApprentices.length
    }
    
    rows.value = allApprentices
    
    if (rows.value.length === 0) {
      if (instructorId.value && projectApprenticeIds.length === 0) {
        info('No hay aprendices asignados a tus proyectos')
      } else {
        info('No se encontraron aprendices')
      }
    }
  } catch (error) {
    rows.value = []
    pagination.value.rowsNumber = 0
    showError(error.response?.data?.message || error.response?.data?.msg || 'Error al cargar aprendices')
  } finally {
    loadingTable.value = false
  }
}

// ==================== UI HANDLERS ====================

const handleEdit = (apprentice) => {
  const hasEditRoute = route.matched.some(r => 
    r.path.includes('aprendices') || 
    r.name === 'Apprentices' ||
    r.path.includes('admin/aprendices')
  )
  
  if (hasEditRoute && apprentice._id) {
    router.push({
      name: 'Apprentices',
      params: { ficheId: apprentice._id },
      query: { edit: true, apprenticeId: apprentice._id }
    })
  } else {
    itemBeingEdited.value = {
      _id: apprentice._id || '',
      documentNumber: apprentice.documentNumber || '',
      documentType: apprentice.documentType || '',
      firstName: apprentice.firstName || apprentice.firstname || '',
      lastName: apprentice.lastName || apprentice.lastname || '',
      emailPersonal: getPersonalEmail(apprentice),
      emailInstitutional: getInstitutionalEmail(apprentice),
      phone: apprentice.phone || '',
      recordNumber: getRecordNumber(apprentice)
    }
    showEditModal.value = true
  }
}

const buildApprenticeUpdatePayload = () => ({
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
})

const handleSubmit = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    showError('Por favor complete todos los campos correctamente')
    return
  }
  
  const apprenticeId = itemBeingEdited.value._id
  if (!apprenticeId) {
    showError('ID del aprendiz no válido')
    return
  }
  
  loading.value = true
  try {
    const payload = buildApprenticeUpdatePayload()
    await putData(endpoints.update(apprenticeId), payload)
    success('Aprendiz actualizado exitosamente')
    showEditModal.value = false
    formRef.value?.resetValidation()
    await fetchApprentices()
  } catch (error) {
    const data = error.response?.data
    const errorMsg = Array.isArray(data?.errors) 
      ? data.errors.join('\n')
      : data?.message || data?.msg || data?.error || 'Error al actualizar el aprendiz'
    showError(errorMsg)
  } finally {
    loading.value = false
  }
}

// ==================== LIFECYCLE HOOKS ====================
onMounted(() => {
  fetchApprentices()
})

// ==================== WATCHERS ====================

/**
 * Los watchers no son necesarios porque el composable ya los maneja
 * PERO como tenemos lógica especial de instructor/proyectos,
 * necesitamos llamar a fetchApprentices() en lugar de fetchEntities()
 */
watch(() => filtersData.value.search, () => {
  resetPaginationState()
  fetchApprentices()
})

watch(() => filtersData.value.status, () => {
  resetPaginationState()
  fetchApprentices()
})
</script>

<style lang="sass" scoped>
.container
  max-width: 1400px
  margin: 0 auto

.filters-wrapper
  display: flex
  gap: 16px
  flex-wrap: wrap
  align-items: flex-start

  @media (max-width: 1024px)
    flex-direction: column

.filters-section
  flex: 1
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)
  padding: 20px
  border-radius: 12px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
  border: 1px solid #E0E0E0

  @media (max-width: 768px)
    padding: 15px

:deep(.custom-green-icons)
  .q-field__append .q-icon
    color: #4caf50 !important
  
  .q-field__append button:hover .q-icon
    color: #388e3c !important

@media (max-width: 768px)
  .data-row
    grid-template-columns: 1fr
    gap: 8px
  
  .filters-section
    padding: 15px

@media (max-width: 480px)
  .modal-scrollable
    max-height: 45vh
</style>