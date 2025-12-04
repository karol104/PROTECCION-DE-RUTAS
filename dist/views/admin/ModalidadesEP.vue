<template>
  <div class="q-pa-md">
    <BackButton />
    
    <div class="text-center q-mb-lg">
      <h1 class="text-weight-bold text-black q-my-md" style="font-size: 3rem;">MODALIDADES DE ETAPA PRODUCTIVA</h1>
    </div>
    
    <div class="container">
      <div class="row items-center q-mb-md q-gutter-y-sm">
        <div class="col-12 col-md-4">
          <q-input
            v-model="searchTerm"
            dense
            outlined
            placeholder="Buscar modalidad..."
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-4">
          <q-select
            outlined
            dense
            v-model="statusFilter"
            :options="STATUS_OPTIONS"
            emit-value
            map-options
            label="Estado"
          />
        </div>
        <div class="col-12 col-md-4 text-right">
          <div class="row q-gutter-sm justify-end no-wrap">
            <BotonIngresar
              label="Carga Masiva"
              @click="handleOpenUploadDialog"
              icon="upload_file"
              style="height: 36px;"
            />
            <BotonIngresar
              label="+ Nueva Modalidad"
              @click="handleOpenCreateDialog"
              style="height: 36px; padding: 8px 6px;"
            />
          </div>
        </div>
      </div>

      <maintable
        :datos="filteredItems"
        :columnas="columns"
        row-key="_id"
        no-data-label="No hay modalidades registradas"
        :rows-per-page-options="[10, 20, 50]"
        :initial-rows-per-page="10"
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
              flat
              round
              color="primary"
              icon="edit"
              @click="handleEdit(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #body-cell-activar="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              :color="props.row.status === STATUS.ACTIVE ? 'positive' : 'negative'"
              :icon="props.row.status === STATUS.ACTIVE ? 'check' : 'close'"
              @click="handleToggleStatus(props.row)"
            >
              <q-tooltip>{{ props.row.status === STATUS.ACTIVE ? 'Desactivar' : 'Activar' }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </maintable>

      <!-- Modal de Detalles -->
      <modalComponent
        ref="detailsModalRef"
        width="700px"
        max-width="95vw"
      >
        <template #header>
          <div class="text-h6">Detalles de Modalidad</div>
        </template>
        <template #body>
          <div v-if="selectedItem" class="details-container">
            <div class="detail-row">
              <div class="detail-label">Nombre:</div>
              <div class="detail-value">{{ selectedItem.name || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Descripción:</div>
              <div class="detail-value">{{ selectedItem.description || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Horas Estándar:</div>
              <div class="detail-value">{{ selectedItem.standardHours || selectedItem.standard_hours || '-' }} horas</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Requiere Instructor de Seguimiento:</div>
              <div class="detail-value">{{ selectedItem.requires_follow_up_instructor ? 'Sí' : 'No' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Requiere Instructor Técnico:</div>
              <div class="detail-value">{{ selectedItem.requires_technical_instructor ? 'Sí' : 'No' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Requiere Instructor de Proyecto:</div>
              <div class="detail-value">{{ selectedItem.requires_project_instructor ? 'Sí' : 'No' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Estado:</div>
              <div class="detail-value">
                <q-badge :color="getStatusColor(selectedItem.status)">
                  {{ getStatusLabel(selectedItem.status) }}
                </q-badge>
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <BotonCerrar label="Cerrar" @click="detailsModalRef?.closeDialog()" />
        </template>
      </modalComponent>

      <!-- Modal de Editar/Crear -->
      <modalComponent
        ref="editModalRef"
        width="800px"
        max-width="95vw"
      >
        <template #header>
          <div class="text-h6">{{ isEditing ? 'Editar Modalidad' : 'Nueva Modalidad' }}</div>
        </template>
        <template #body>
          <q-form ref="formRef" @submit.prevent="handleSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  filled
                  v-model="itemBeingEdited.name"
                  label="Nombre de Modalidad *"
                  :rules="[
                    validation.requiredRule,
                    validation.maxLengthRule(100)
                  ]"
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  v-model="itemBeingEdited.description"
                  label="Descripción"
                  type="textarea"
                  rows="4"
                  :rules="[validation.maxLengthRule(500)]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  filled
                  v-model.number="itemBeingEdited.standard_hours"
                  label="Horas Estándar *"
                  type="number"
                  min="0"
                  :rules="[validation.requiredRule]"
                  hint="Número de horas estándar de la modalidad"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  filled
                  v-model="itemBeingEdited.requires_follow_up_instructor"
                  :options="[
                    { label: 'Sí', value: 1 },
                    { label: 'No', value: 0 }
                  ]"
                  emit-value
                  map-options
                  label="¿Requiere Instructor de Seguimiento?"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  filled
                  v-model="itemBeingEdited.requires_technical_instructor"
                  :options="[
                    { label: 'Sí', value: 1 },
                    { label: 'No', value: 0 }
                  ]"
                  emit-value
                  map-options
                  label="¿Requiere Instructor Técnico?"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  filled
                  v-model="itemBeingEdited.requires_project_instructor"
                  :options="[
                    { label: 'Sí', value: 1 },
                    { label: 'No', value: 0 }
                  ]"
                  emit-value
                  map-options
                  label="¿Requiere Instructor de Proyecto?"
                />
              </div>
            </div>
          </q-form>
        </template>
        <template #footer>
          <BotonCerrar label="Cancelar" @click="editModalRef?.closeDialog()" />
          <BotonEnviar label="Guardar" @click="handleSubmit" :loading="isSaving" />
        </template>
      </modalComponent>

      <!-- Modal de Carga Masiva -->
      <modalComponent
        ref="uploadModalRef"
        width="600px"
        max-width="95vw"
      >
        <template #header>
          <div class="text-h6">Carga Masiva de Modalidades</div>
        </template>
        <template #body>
          <div class="q-mb-md">
            <p class="text-body1 q-mb-sm">
              Sube un archivo Excel (.xlsx) o CSV (.csv) con la información de las modalidades.
            </p>
            <p class="text-caption text-grey-7">
              El archivo debe contener las siguientes columnas: name, description, standard_hours, requires_follow_up_instructor, requires_technical_instructor, requires_project_instructor
            </p>
          </div>
          <q-file
            v-model="uploadFile"
            outlined
            label="Seleccionar archivo"
            accept=".xlsx,.xls,.csv"
            :max-file-size="FILE_SIZE_LIMITS.MAX_UPLOAD_SIZE"
            @rejected="fileUpload.handleFileRejected"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
            <template v-slot:hint>
              Formatos permitidos: Excel (.xlsx, .xls) o CSV (.csv). Tamaño máximo: {{ FILE_SIZE_LIMITS.MAX_UPLOAD_SIZE_MB }}MB
            </template>
          </q-file>
          <div v-if="uploadFile" class="q-mt-md">
            <q-banner class="bg-green-1 text-green-8" rounded>
              <template v-slot:avatar>
                <q-icon name="check_circle" color="green" />
              </template>
              Archivo seleccionado: {{ uploadFile.name }}
              ({{ fileUpload.formatFileSize(uploadFile.size) }})
            </q-banner>
          </div>
        </template>
        <template #footer>
          <BotonCerrar label="Cancelar" @click="uploadModalRef?.closeDialog()" />
          <BotonEnviar
            label="Cargar Modalidades"
            @click="handleMassiveUpload"
            :loading="isSaving"
            :disable="!uploadFile"
          />
        </template>
      </modalComponent>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { postData } from '../../services/apiClient'
import { useNotifications } from '../../composables/useNotifications'
import { useFormValidation } from '../../composables/useFormValidation'
import { useFileUpload } from '../../composables/useFileUpload'
// useTableFiltering está deprecado - el filtrado debe hacerse en el backend
import { useApiData } from '../../composables/useApiData'
import { useApiMutations } from '../../composables/useApiMutations'
import { STATUS, STATUS_LABELS, STATUS_OPTIONS, VALIDATION_RULES, FILE_SIZE_LIMITS } from '../../constants/index'
import BackButton from '../../components/BackButton.vue'
import BotonIngresar from '../../components/BotonIngresar.vue'
import BotonEnviar from '../../components/BotonEnviar.vue'
import BotonCerrar from '../../components/BotonCerrar.vue'
import maintable from '../../components/tables/maintable.vue'
import modalComponent from '../../components/modals/modalComponent.vue'

const notifications = useNotifications()
const validation = useFormValidation()
const fileUpload = useFileUpload()

// Usar composables para datos y mutaciones
const { 
  data: modalities, 
  isLoading, 
  fetchData: fetchModalities 
} = useApiData('/modalities/listModalities', {
  showEmptyInfo: true,
  emptyMessage: 'No hay modalidades registradas',
  errorMessage: 'Error al cargar modalidades'
})

const { 
  isSaving,
  create: createModality,
  update: updateModality,
  toggleStatus
} = useApiMutations('/modalities', {
  createSuccessMessage: 'Modalidad creada exitosamente',
  updateSuccessMessage: 'Modalidad actualizada exitosamente',
  errorMessage: 'Error en la operación'
})

const selectedItem = ref(null)
const isEditing = ref(false)
const formRef = ref(null)
const uploadFile = ref(null)

const detailsModalRef = ref(null)
const editModalRef = ref(null)
const uploadModalRef = ref(null)

const itemBeingEdited = ref({
  _id: '',
  name: '',
  description: '',
  standard_hours: 0,
  requires_follow_up_instructor: 1,
  requires_technical_instructor: 1,
  requires_project_instructor: 0,
  status: STATUS.INACTIVE
})

// ==================== COMPOSABLES ====================

// Filtrado debe hacerse en el backend - usar queryParams en fetchModalities
const searchTerm = ref('')
const statusFilter = ref('all')
// Los datos vienen filtrados del backend
const filteredItems = modalities

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', sortable: true, align: 'left' },
  { name: 'standardHours', label: 'Horas Estándar', field: 'standardHours', sortable: true, align: 'center' },
  { name: 'status', label: 'Estado', field: 'status', sortable: true, align: 'center' },
  { name: 'opciones', label: 'Opciones', align: 'center' },
  { name: 'activar', label: 'Activar/Desactivar', align: 'center' }
]

// ==================== FUNCIONES DE UI ====================

/**
 * Obtiene la etiqueta del estado
 * @param {number} status - Estado de la modalidad (0=activo, 1=inactivo)
 * @returns {string} Etiqueta del estado
 */
function getStatusLabel(status) {
  return status === STATUS.ACTIVE ? STATUS_LABELS.ACTIVE : STATUS_LABELS.INACTIVE
}

/**
 * Obtiene el color del badge según el estado
 * @param {number} status - Estado de la modalidad (0=activo, 1=inactivo)
 * @returns {string} Color del badge ('positive' o 'negative')
 */
function getStatusColor(status) {
  return status === STATUS.ACTIVE ? 'positive' : 'negative'
}

// ==================== MANEJADORES DE MODALES ====================

/**
 * Abre el modal de detalles de la modalidad
 * @param {Object} modality - Objeto modalidad a mostrar
 */
function handleViewDetails(modality) {
  selectedItem.value = modality
  detailsModalRef.value?.openDialog()
}

/**
 * Abre el modal de edición con los datos de la modalidad
 * @param {Object} modality - Objeto modalidad a editar
 */
function handleEdit(modality) {
  isEditing.value = true
  itemBeingEdited.value = {
    _id: modality._id || '',
    name: modality.name || '',
    description: modality.description || '',
    standard_hours: modality.standard_hours || 0,
    requires_follow_up_instructor: modality.requires_follow_up_instructor ?? 1,
    requires_technical_instructor: modality.requires_technical_instructor ?? 1,
    requires_project_instructor: modality.requires_project_instructor ?? 0
  }
  
  editModalRef.value?.openDialog()
}

/**
 * Abre el modal para crear una nueva modalidad
 */
function handleOpenCreateDialog() {
  isEditing.value = false
  itemBeingEdited.value = {
    _id: '',
    name: '',
    description: '',
    standard_hours: 0,
    requires_follow_up_instructor: 1,
    requires_technical_instructor: 1,
    requires_project_instructor: 0,
    status: STATUS.INACTIVE
  }
  editModalRef.value?.openDialog()
}

/**
 * Abre el modal de carga masiva
 */
function handleOpenUploadDialog() {
  uploadFile.value = null
  uploadModalRef.value?.openDialog()
}

// ==================== FUNCIONES DE FORMULARIO ====================

/**
 * Maneja el envío del formulario (crear o actualizar)
 */
async function handleSubmit() {
  if (formRef.value) {
    formRef.value.resetValidation()
  }
  
  const isValid = await formRef.value.validate()
  if (!isValid) {
    notifications.warning('Por favor, completa todos los campos requeridos')
    return
  }
  
  const payload = {
    name: itemBeingEdited.value.name,
    description: itemBeingEdited.value.description,
    standard_hours: itemBeingEdited.value.standard_hours,
    requires_follow_up_instructor: itemBeingEdited.value.requires_follow_up_instructor,
    requires_technical_instructor: itemBeingEdited.value.requires_technical_instructor,
    requires_project_instructor: itemBeingEdited.value.requires_project_instructor
  }
  
  if (isEditing.value) {
    await updateModality(
      itemBeingEdited.value._id,
      payload,
      () => {
        editModalRef.value?.closeDialog()
        if (formRef.value) {
          formRef.value.resetValidation()
        }
        fetchModalities()
      },
      'updateModalities'
    )
  } else {
    await createModality(
      payload,
      () => {
        editModalRef.value?.closeDialog()
        if (formRef.value) {
          formRef.value.resetValidation()
        }
        fetchModalities()
      },
      'saveModalities'
    )
  }
}

// ==================== FUNCIONES DE ESTADO ====================

/**
 * Activa o desactiva una modalidad
 * @param {Object} modality - Modalidad a cambiar de estado
 */
async function handleToggleStatus(modality) {
  const isActive = modality.status === STATUS.ACTIVE
  const action = isActive ? 'inactiveModalities' : 'activeModalities'
  const successMessage = `Modalidad ${isActive ? 'desactivada' : 'activada'} exitosamente`
  
  await toggleStatus(
    modality._id,
    action,
    successMessage,
    fetchModalities
  )
}

// ==================== FUNCIONES DE CARGA MASIVA ====================

/**
 * Maneja la carga masiva de modalidades desde un archivo
 */
async function handleMassiveUpload() {
  if (!uploadFile.value) {
    notifications.warning('Por favor, selecciona un archivo')
    return
  }
  
  if (!fileUpload.validateFile(uploadFile.value)) {
    return
  }
  
  try {
    isSaving.value = true
    const fileToSend = uploadFile.value
    const formData = new FormData()
    formData.append('file', fileToSend, fileToSend.name)
    
    const data = await postData('/modalities/loadMassive', formData, { timeout: 120000 })
    
    notifications.success(data.msg || 'Modalidades cargadas exitosamente')
    uploadModalRef.value?.closeDialog()
    uploadFile.value = null
    
    await fetchModalities()
  } catch (error) {    
    let errorMessage = 'Error al cargar el archivo'
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'La carga del archivo excedió el tiempo límite de 2 minutos. El servidor puede estar inactivo (Render free tier). Por favor, intenta nuevamente en unos minutos.'
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.msg || 'Archivo inválido o formato incorrecto'
    } else if (error.response?.status === 401) {
      errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.'
    } else if (error.response?.status === 413) {
      errorMessage = 'El archivo es demasiado grande'
    } else if (error.response?.status === 422) {
      errorMessage = error.response?.data?.msg || 'Error de validación en los datos del archivo'
    } else if (error.response?.status === 500) {
      errorMessage = 'Error interno del servidor. Por favor, intenta de nuevo más tarde.'
    } else if (error.message) {
      errorMessage = error.response?.data?.msg || error.message
    }
    
    notifications.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}

// ==================== LIFECYCLE HOOKS ====================

onMounted(() => {
  fetchModalities()
})
</script>

<style scoped>
/* ========== ESTILOS ESTANDARIZADOS PARA MODALES ========== */

/* Estilos base para modales */
:deep(.q-dialog__inner > .q-card) {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

:deep(.q-card__section--vert) {
  padding: 0;
}

/* Headers de modales con gradiente verde */
:deep(.q-dialog .q-card > .q-card__section:first-child) {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover-dark) 100%);
  padding: 20px 24px;
  border-radius: 12px 12px 0 0;
}

:deep(.q-dialog .text-h6) {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

/* Modal Body */
:deep(.q-dialog .q-card__section:not(:first-child):not(:last-child)) {
  padding: 24px 28px;
  background: white;
}

/* Modal Footer */
:deep(.q-dialog .q-card__section:last-child) {
  background: #F8F9FA;
  border-radius: 0 0 12px 12px;
  padding: 20px 24px;
  border-top: 1px solid #E0E0E0;
}

/* Detalles Container */
.details-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
  border-radius: 8px;
  border: 1px solid #E0E0E0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.detail-row:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.detail-label {
  font-weight: 600;
  color: #2C3E50;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  color: #34495e;
  font-weight: 500;
}

.data-value {
  font-size: 1rem;
  color: #34495e;
  font-weight: 500;
}

/* Formularios en modales */
:deep(.q-form) {
  padding: 0;
}

:deep(.q-field--filled .q-field__control) {
  border-radius: 8px;
  background: #F8F9FA;
  transition: all 0.3s ease;
}

:deep(.q-field--filled.q-field--focused .q-field__control) {
  background: white;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

:deep(.q-field--filled .q-field__control:before) {
  border-bottom: 2px solid #E0E0E0;
}

:deep(.q-field--filled.q-field--focused .q-field__control:before) {
  border-bottom-color: var(--color-primary);
}

/* File input */
:deep(.q-file .q-field__control) {
  border-radius: 8px;
  border: 2px dashed #E0E0E0;
  transition: all 0.3s ease;
}

:deep(.q-file.q-field--focused .q-field__control) {
  border-color: var(--color-primary);
  background: #F8F9FA;
}

/* Banners */
:deep(.q-banner) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Badges */
:deep(.q-badge) {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.85rem;
}

/* Botones */
:deep(.q-btn.boton-cerrar),
:deep(.q-btn.boton-enviar),
:deep(.q-btn.boton-ingresar) {
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.q-btn.boton-cerrar:hover),
:deep(.q-btn.boton-enviar:hover),
:deep(.q-btn.boton-ingresar:hover) {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

:deep(.q-btn.boton-enviar),
:deep(.q-btn.boton-ingresar) {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover-dark) 100%);
}

:deep(.q-btn.boton-enviar:hover),
:deep(.q-btn.boton-ingresar:hover) {
  background: linear-gradient(135deg, var(--color-primary-hover-dark) 0%, var(--color-primary) 100%);
}

/* Responsive */
@media (max-width: 768px) {
  :deep(.q-dialog .q-card > .q-card__section:first-child) {
    padding: 18px 20px;
  }

  :deep(.q-dialog .text-h6) {
    font-size: 16px;
  }

  :deep(.q-dialog .q-card__section:not(:first-child):not(:last-child)) {
    padding: 20px 24px;
  }

  :deep(.q-dialog .q-card__section:last-child) {
    padding: 18px 20px;
  }

  .detail-row {
    padding: 12px 14px;
  }

  .detail-label {
    font-size: 0.8rem;
  }

  .detail-value,
  .data-value {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  :deep(.q-dialog .q-card > .q-card__section:first-child) {
    padding: 16px 18px;
  }

  :deep(.q-dialog .text-h6) {
    font-size: 15px;
  }

  :deep(.q-dialog .q-card__section:not(:first-child):not(:last-child)) {
    padding: 16px 20px;
  }

  :deep(.q-dialog .q-card__section:last-child) {
    padding: 16px 18px;
  }

  .details-container {
    gap: 12px;
  }

  .detail-row {
    padding: 10px 12px;
    gap: 6px;
  }

  .detail-label {
    font-size: 0.75rem;
  }

  .detail-value,
  .data-value {
    font-size: 0.9rem;
  }

  :deep(.q-btn.boton-cerrar),
  :deep(.q-btn.boton-enviar),
  :deep(.q-btn.boton-ingresar) {
    padding: 10px 20px;
    font-size: 13px;
  }
}

/* Ajustes específicos para modales grandes */
@media (min-width: 769px) {
  :deep(.q-dialog__inner) {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  :deep(.q-dialog__inner) {
    padding: 16px;
  }

  :deep(.q-card) {
    margin: 0;
  }
}

@media (max-width: 480px) {
  :deep(.q-dialog__inner) {
    padding: 12px;
  }

  :deep(.q-card) {
    width: 98vw !important;
    max-width: 98vw !important;
    margin: 0 !important;
  }
}
</style>

