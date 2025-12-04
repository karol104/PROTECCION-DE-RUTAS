<template>
  <q-page class="q-pa-md modalities-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Modalidades de Etapa Productiva" />
          </q-card-section>
        </q-card>

        <div class="filters-wrapper flex items-center justify-between q-my-lg">
          <div class="filters-left flex items-center bg-white">
            <div class="filter-item search">
              <q-input
                v-model="filtersData.search"
                outlined
                dense
                clearable
                debounce="600"
                placeholder="Buscar por nombre..."
                @update:model-value="handleSearchChange"
              >
                <template #prepend>
                  <q-icon name="search" color="grey-7" />
                </template>
              </q-input>
            </div>

            <div class="filter-item">
              <q-select
                v-model="filtersData.technicalInstructor"
                outlined
                dense
                :options="[
                  { label: 'Todos', value: '' },
                  { label: 'Req. Técnico', value: 1 },
                  { label: 'No Req. Técnico', value: 0 }
                ]"
                emit-value
                map-options
                clearable
                label="Instructor Técnico"
                @update:model-value="handleTechnicalInstructorChange"
              >
                <template #prepend>
                  <q-icon name="filter_list" color="green-8" />
                </template>
              </q-select>
            </div>

            <div class="filter-item">
              <q-select
                v-model="filtersData.projectInstructor"
                outlined
                dense
                :options="[
                  { label: 'Todos', value: '' },
                  { label: 'Req. Proyecto', value: 1 },
                  { label: 'No Req. Proyecto', value: 0 }
                ]"
                emit-value
                map-options
                clearable
                label="Instructor Proyecto"
                @update:model-value="handleProjectInstructorChange"
              >
                <template #prepend>
                  <q-icon name="filter_list" color="green-8" />
                </template>
              </q-select>
            </div>
          </div>

          <div class="actions-right row items-center q-gutter-sm">
            <Button
              label="Nueva Modalidad"
              custom-class="gradient-btn"
              icon="add"
              @click="openModalityFormDialog"
            />
          </div>
        </div>

        <Table
          boxed
          :rows="rowsModalities"
          :columns="columns"
          v-modelpagination="pagination"
          :loanding-table="loandingTable"
          row-key="_id"
          @request="handlePaginationRequest"
        >
          <template #body-cell-standardHours="props">
            <q-td :props="props">
              {{ props.row.standard_hours || props.row.standardHours || 0 }} horas
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.status === STATUS.ACTIVE ? 'positive' : 'negative'"
                class="text-uppercase"
              >
                {{ props.row.status === STATUS.ACTIVE ? 'Activa' : 'Inactiva' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-options="props">
            <q-td :props="props" class="text-center table-options">
              <ButtonTableOptions
                icon="edit"
                color="grey-7"
                tooltip="Editar"
                @click="populateModalityFormForEdit(props.row)"
              />
              <ButtonTableOptions
                :icon="props.row.status === STATUS.ACTIVE ? 'block' : 'check_circle'"
                :color="props.row.status === STATUS.ACTIVE ? 'negative' : 'positive'"
                :tooltip="props.row.status === STATUS.ACTIVE ? 'Desactivar' : 'Activar'"
                @click="toggleModalityStatus(props.row)"
              />
              <ButtonTableOptions
                icon="visibility"
                color="grey"
                tooltip="Ver"
                @click="openModalityDetailsDialog(props.row)"
              />
            </q-td>
          </template>

          <template #no-data>
            <div class="q-pa-md flex flex-center column text-grey full-width">
              <q-icon name="assignment" size="2.5em" color="positive" />
              <div class="text-subtitle2 q-mt-sm">
                No hay modalidades registradas
              </div>
            </div>
          </template>
        </Table>

        <Modal v-model="showDetailDialog" width="900px" max-width="90vw">
          <template #header>
            <q-icon name="assignment" class="q-mr-sm" />
            <span class="modal-title-white">{{ selectedModality?.name || 'Modalidad' }}</span>
          </template>

          <template #body>
            <div v-if="selectedModality" class="modal-content-grid">
              <div class="modal-column">
                <div class="section-title">Información General</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Nombre:</div>
                    <div class="data-value">{{ selectedModality?.name || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Descripción:</div>
                    <div class="data-value">{{ selectedModality?.description || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Horas Estándar:</div>
                    <div class="data-value">{{ selectedModality?.standard_hours || selectedModality?.standardHours || 0 }} horas</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Estado:</div>
                    <div class="data-value">
                      <q-badge :color="selectedModality?.status === STATUS.ACTIVE ? 'positive' : 'negative'">
                        {{ selectedModality?.status === STATUS.ACTIVE ? 'Activa' : 'Inactiva' }}
                      </q-badge>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-column">
                <div class="section-title">Requisitos de Instructores</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Instructor de Seguimiento:</div>
                    <div class="data-value">{{ selectedModality?.requires_follow_up_instructor ? 'Sí' : 'No' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Instructor Técnico:</div>
                    <div class="data-value">{{ selectedModality?.requires_technical_instructor ? 'Sí' : 'No' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Instructor de Proyecto:</div>
                    <div class="data-value">{{ selectedModality?.requires_project_instructor ? 'Sí' : 'No' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <Button label="Cerrar" custom-class="boton-cerrar" v-close-popup />
          </template>
        </Modal>

        <Modal
          v-model="showAddDialog"
          width="900px"
          max-width="95vw"
          persistent
          @update:model-value="handleAddDialogVisibility"
        >
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="assignment" class="q-mr-sm" />
                {{ isEditMode ? 'Editar Modalidad' : 'Nueva Modalidad' }}
              </div>
            </div>
          </template>

          <template #body>
            <q-form ref="modalityForm" @submit.prevent="submitModalityForm">
              <div class="modal-content-grid">
                <div class="modal-column">
                  <div class="section-title">Información General</div>
                  <q-input
                    v-model="formData.name"
                    filled
                    dense
                    label="Nombre de Modalidad *"
                    :rules="[val => !!val || 'El nombre es requerido']"
                  />

                  <q-input
                    v-model="formData.description"
                    filled
                    dense
                    label="Descripción"
                    type="textarea"
                    rows="6"
                  />

                  <q-input
                    v-model.number="formData.standard_hours"
                    filled
                    dense
                    label="Horas Estándar *"
                    type="number"
                    min="0"
                    :rules="[
                      val => (val !== null && val !== undefined && val !== '') || 'Campo horas estandar obligatorio',
                      val => val >= 0 || 'Las horas deben ser positivas'
                    ]"
                  />
                </div>

                <div class="modal-column">
                  <div class="section-title">Requisitos de Instructores</div>

                  <q-select
                    v-model="formData.requires_follow_up_instructor"
                    filled
                    dense
                    :options="[
                      { label: 'Sí', value: 1 },
                      { label: 'No', value: 0 }
                    ]"
                    emit-value
                    map-options
                    label="Instructor de Seguimiento"
                    :rules="[val => val === 0 || val === 1 || val === '0' || val === '1' || 'Campo requiere instructor de seguimiento obligatorio']"
                  />

                  <q-select
                    v-model="formData.requires_technical_instructor"
                    filled
                    dense
                    :options="[
                      { label: 'Sí', value: 1 },
                      { label: 'No', value: 0 }
                    ]"
                    emit-value
                    map-options
                    label="Instructor Técnico"
                    :rules="[val => val === 0 || val === 1 || val === '0' || val === '1' || 'Campo requiere instructor tecnico obligatorio']"
                  />

                  <q-select
                    v-model="formData.requires_project_instructor"
                    filled
                    dense
                    :options="[
                      { label: 'Sí', value: 1 },
                      { label: 'No', value: 0 }
                    ]"
                    emit-value
                    map-options
                    label="Instructor de Proyecto"
                    :rules="[val => val === 0 || val === 1 || val === '0' || val === '1' || 'Campo requiere instructor de proyecto obligatorio']"
                  />

                  <div class="q-mt-lg row justify-end q-gutter-sm">
                    <Button
                      custom-class="boton-cerrar"
                      label="Cancelar"
                      @click="closeModalityFormDialog"
                    />
                    <Button
                      :label="isEditMode ? 'Actualizar' : 'Crear Modalidad'"
                      type="submit"
                      custom-class="gradient-btn"
                      :loading="loading"
                    />
                  </div>
                </div>
              </div>
            </q-form>
          </template>
        </Modal>

        <Modal v-model="showUploadDialog" width="600px" max-width="95vw" persistent>
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="upload_file" class="q-mr-sm" />
                Carga Masiva de Modalidades
              </div>
              <Button icon="close" flat round dense v-close-popup />
            </div>
          </template>

          <template #body>
            <div class="q-pa-md">
              <div class="q-mb-md">
                <p class="text-body1 q-mb-sm">
                  Sube un archivo Excel (.xlsx) o CSV (.csv) con la información de las modalidades.
                </p>
                <p class="text-caption text-grey-7">
                  El archivo debe contener las siguientes columnas: name, description, standard_hours, 
                  requires_follow_up_instructor, requires_technical_instructor, requires_project_instructor.
                </p>
              </div>

              <q-file
                v-model="selectedFile"
                outlined
                label="Seleccionar archivo"
                accept=".xlsx,.xls,.csv"
                max-file-size="5242880"
                clearable
              >
                <template #prepend>
                  <q-icon name="attach_file" />
                </template>
                <template #hint>
                  Formatos permitidos: Excel (.xlsx, .xls) o CSV (.csv). Tamaño máximo: 5MB.
                </template>
              </q-file>

              <div v-if="selectedFile" class="q-my-md">
                <q-banner class="bg-green-1 text-green-8" rounded>
                  <template #avatar>
                    <q-icon name="check_circle" color="green" />
                  </template>
                  Archivo seleccionado: {{ selectedFile.name }}
                </q-banner>
              </div>

              <div class="q-mt-md flex justify-end">
                <Button
                  label="Subir Archivo"
                  custom-class="gradient-btn"
                  :loading="loading"
                  :disable="!selectedFile"
                  @click="submitBulkUpload"
                />
              </div>
            </div>
          </template>
        </Modal>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getData, postData, putData } from '../../services/apiClient'
import { useNotifications } from '../../composables/useNotifications'
import BackButton from '../../components/BackButton.vue'
import Table from '../../components/Table.vue'
import Button from '../../components/Button.vue'
import ButtonTableOptions from '../../components/ButtonTableOptions.vue'
import Modal from '../../components/Modal.vue'
import PageHeader from '../../components/PageHeader.vue'

const STATUS = { ACTIVE: 0, INACTIVE: 1 }

// ==================== NOTIFICACIONES ====================
const { error, success } = useNotifications()

// ==================== ESTADOS PRINCIPALES ====================
const loading = ref(false)
const loandingTable = ref(false)

const rowsModalities = ref([])
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const showUploadDialog = ref(false)
const isEditMode = ref(false)
const selectedModality = ref(null)
const selectedFile = ref(null)

const getDefaultFormData = () => ({
  _id: '',
  name: '',
  description: '',
  standard_hours: 0,
  requires_follow_up_instructor: 1,
  requires_technical_instructor: 1,
  requires_project_instructor: 0
})

const formData = ref(getDefaultFormData())

const filtersData = ref({
  search: '',
  technicalInstructor: '',
  projectInstructor: ''
})

const columns = [
  { name: 'name', label: 'Nombre', align: 'center', field: 'name' },
  { name: 'standardHours', label: 'Horas Estándar', align: 'center', field: row => row.standard_hours ?? row.standardHours ?? 0 },
  { name: 'status', label: 'Estado', align: 'center', field: 'status' },
  { name: 'options', label: 'Acciones', align: 'center' }
]

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const handlePaginationRequest = props => {
  if (!props?.pagination) return
  pagination.value = {
    page: props.pagination.page,
    rowsPerPage: props.pagination.rowsPerPage,
    rowsNumber: props.pagination.rowsNumber ?? pagination.value.rowsNumber
  }
  fetchModalities()
}

const resetPaginationState = () => {
  pagination.value.page = 1
}

const handleSearchChange = () => {
  resetPaginationState()
  fetchModalities()
}

const handleTechnicalInstructorChange = () => {
  resetPaginationState()
  fetchModalities()
}

const handleProjectInstructorChange = () => {
  resetPaginationState()
  fetchModalities()
}

const handleAddDialogVisibility = value => {
  if (!value) {
    isEditMode.value = false
    resetModalityForm()
  }
}

const fetchModalities = async () => {
  const { page, rowsPerPage } = pagination.value
  loandingTable.value = true
  try {
    const params = {
      page,
      limit: rowsPerPage
    }

    const trimmedSearch = filtersData.value.search?.trim()
    if (trimmedSearch) {
      params.name = trimmedSearch
    }

    if (filtersData.value.technicalInstructor !== '' && filtersData.value.technicalInstructor !== null) {
      params.requiresTechnicalInstructor = filtersData.value.technicalInstructor
    }

    if (filtersData.value.projectInstructor !== '' && filtersData.value.projectInstructor !== null) {
      params.requiresProjectInstructor = filtersData.value.projectInstructor
    }

    const response = await getData('/modalities/listModalities', { params })

    const modalities = response?.msg ?? []
    rowsModalities.value = Array.isArray(modalities) ? modalities : []
    pagination.value.rowsNumber = response?.totalDocuments ?? rowsModalities.value.length
  } catch (err) {
    const message = err?.response?.data?.msg || err?.message || 'Error al listar las modalidades'
    error(message)
    rowsModalities.value = []
    pagination.value.rowsNumber = 0
  } finally {
    loandingTable.value = false
  }
}

const openModalityFormDialog = () => {
  isEditMode.value = false
  resetModalityForm()
  showAddDialog.value = true
}

const closeModalityFormDialog = () => {
  showAddDialog.value = false
  handleAddDialogVisibility(false)
}

const openModalityDetailsDialog = row => {
  selectedModality.value = row
  showDetailDialog.value = true
}

const resetModalityForm = () => {
  formData.value = getDefaultFormData()
}

const populateModalityFormForEdit = row => {
  showAddDialog.value = true
  isEditMode.value = true
  formData.value = {
    _id: row._id,
    name: row.name ?? '',
    description: row.description ?? '',
    standard_hours: row.standard_hours ?? 0,
    requires_follow_up_instructor: row.requires_follow_up_instructor ?? 1,
    requires_technical_instructor: row.requires_technical_instructor ?? 1,
    requires_project_instructor: row.requires_project_instructor ?? 0
  }
}

const buildModalityPayload = () => ({
  name: formData.value.name?.trim(),
  description: formData.value.description?.trim(),
  standard_hours: formData.value.standard_hours,
  requires_follow_up_instructor: formData.value.requires_follow_up_instructor,
  requires_technical_instructor: formData.value.requires_technical_instructor,
  requires_project_instructor: formData.value.requires_project_instructor
})

const submitModalityForm = async () => {
  // Client-side validation (clean, explicit checks)
  const errors = []

  if (!formData.value.name || !formData.value.name.toString().trim()) {
    errors.push('Nombre obligatorio')
  }

  const sh = formData.value.standard_hours
  if (sh === null || sh === undefined || sh === '') {
    errors.push('Campo horas estandar obligatorio')
  } else if (isNaN(Number(sh))) {
    errors.push('Horas estandar debe ser un número')
  } else if (Number(sh) < 0) {
    errors.push('Las horas deben ser positivas')
  }

  const checkBinary = (val) => (val === 0 || val === 1 || val === '0' || val === '1')
  if (!checkBinary(formData.value.requires_follow_up_instructor)) {
    errors.push('Campo requiere instructor de seguimiento obligatorio')
  }
  if (!checkBinary(formData.value.requires_technical_instructor)) {
    errors.push('Campo requiere instructor tecnico obligatorio')
  }
  if (!checkBinary(formData.value.requires_project_instructor)) {
    errors.push('Campo requiere instructor de proyecto obligatorio')
  }

  if (errors.length) {
    error(errors.join(' '))
    return
  }

  // Build payload with both snake_case and camelCase keys so backend accepts either convention
  loading.value = true
  const numericStandardHours = Number(formData.value.standard_hours)
  const numericRequiresFollow = Number(formData.value.requires_follow_up_instructor)
  const numericRequiresTechnical = Number(formData.value.requires_technical_instructor)
  const numericRequiresProject = Number(formData.value.requires_project_instructor)

  const payload = {
    // snake_case
    standard_hours: numericStandardHours,
    requires_follow_up_instructor: numericRequiresFollow,
    requires_technical_instructor: numericRequiresTechnical,
    requires_project_instructor: numericRequiresProject,
    // camelCase (some endpoints expect this)
    standardHours: numericStandardHours,
    requiresFollowUpInstructor: numericRequiresFollow,
    requiresTechnicalInstructor: numericRequiresTechnical,
    requiresProjectInstructor: numericRequiresProject,
    // common
    name: formData.value.name?.trim(),
    description: formData.value.description?.trim()
  }

  if (!isEditMode.value) {
    try {
      const response = await postData('/modalities/saveModalities', payload)
      success(response?.msg || 'Modalidad creada correctamente')
      showAddDialog.value = false
      handleAddDialogVisibility(false)
      await fetchModalities()
    } catch (err) {
      // Mejor parseo de errores del servidor
      const srv = err?.response?.data || {}
      if (srv.errors) {
        // puede ser array o objeto
        if (Array.isArray(srv.errors)) {
          error(srv.errors.join(' '))
        } else if (typeof srv.errors === 'object') {
          const msgs = Object.values(srv.errors).flat().join(' ')
          error(msgs)
        } else {
          error(String(srv.errors))
        }
      } else if (srv.msg) {
        error(srv.msg)
      } else {
        error(err?.message || 'Error al crear la modalidad')
      }
    } finally {
      loading.value = false
    }
    return
  }

  try {
    const response = await putData(`/modalities/updateModalities/${formData.value._id}`, payload)
    success(response?.msg || 'Modalidad actualizada correctamente')
    showAddDialog.value = false
    handleAddDialogVisibility(false)
    await fetchModalities()
  } catch (err) {
    const srv = err?.response?.data || {}
    error(srv.msg || err?.message || 'Error al actualizar la modalidad')
  } finally {
    loading.value = false
  }
}

const toggleModalityStatus = async row => {
  loading.value = true
  try {
    const isInactive = row.status == STATUS.INACTIVE
    const endpoint = isInactive
      ? `/modalities/activeModalities/${row._id}`
      : `/modalities/inactiveModalities/${row._id}`
    const response = await putData(endpoint)
    success(response?.msg || 'Estado actualizado correctamente')
    await fetchModalities()
  } catch (err) {
    error(err?.response?.data?.msg || err?.message || 'No fue posible cambiar el estado')
  } finally {
    loading.value = false
  }
}

const openUploadDialog = () => {
  selectedFile.value = null
  showUploadDialog.value = true
}

const submitBulkUpload = async () => {
  loading.value = true
  try {
    const dataUpload = new FormData()
    dataUpload.append('file', selectedFile.value)
    const response = await postData('/modalities/loadMassive', dataUpload)
    success(response?.msg || 'Carga masiva realizada correctamente')
    showUploadDialog.value = false
    selectedFile.value = null
    await fetchModalities()
  } catch (err) {
    error(err?.response?.data?.msg || err?.message || 'Error al cargar el archivo')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchModalities()
})
</script>

<style lang="scss" scoped>
.modalities-page {
  background: #f5f7fb;
  min-height: 100vh;
}

.hero-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%);
}

.filters-wrapper {
  gap: 12px;
  flex-wrap: wrap;
}

.filters-left {
  gap: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
}

.filter-item {
  min-width: 200px;
}

.filter-item.search {
  width: 280px;
}

.table-options {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-primary);
  color: white;
  padding: 16px 24px;
}

.detail-item {
  padding: 8px 0;
}

.detail-item strong {
  display: block;
  color: var(--color-primary);
  margin-bottom: 4px;
}

/* Modal detalle estilo similar a Companies.vue */
.modal-header--line {
  background: transparent;
  padding: 12px 20px;
  border-left: 6px solid var(--color-primary);
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px; /* keep header height stable */
}
.modal-header--line .modal-title-line {
  color: var(--color-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: normal; /* allow wrapping */
  overflow: auto; /* allow scrolling if too long */
}
.modal-header--line .q-icon {
  flex: none; /* keep icon from shrinking */
}

.modal-content-grid {
  display: grid;
  /* allow columns to shrink properly inside the modal */
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  padding: 18px;
}

.modal-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 4px solid var(--color-primary);
}

.data-grid {
  display: grid;
  gap: 12px;
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
  padding: 14px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  border: 1px solid #E6E6E6;
  min-width: 0; /* allow grid children to shrink properly */
}

.data-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #F0F0F0;
}
.data-row > .data-value {
  /* allow long text to wrap and not force the grid to overflow */
  min-width: 0;
  white-space: normal;
  word-break: break-word;
}
.data-row:last-child { border-bottom: none; }

.text-weight-bold { color: #2c3e50; font-weight: 600; }
.data-value { color: #34495e; }

.modal-title-white {
  color: white !important;
  font-weight: 700;
  font-size: 1.05rem;
  white-space: normal;
  overflow: auto;
}

@media (max-width: 1024px) {
  .filters-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-left {
    width: 100%;
  }

  .actions-right {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .filter-item,
  .filter-item.search {
    width: 100%;
    min-width: unset;
  }

  .actions-right {
    width: 100%;
  }
}
</style>