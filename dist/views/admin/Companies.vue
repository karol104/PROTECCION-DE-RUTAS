<template>
  <q-page class="q-pa-md companies-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Gestión de Empresas" 
              description="Lista, crea y administra las empresas registradas en el sistema." 
            />
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
                placeholder="Buscar por nombre o NIT..."
                @update:model-value="handleSearchChange"
              >
                <template #prepend>
                  <q-icon name="search"  color="#4CAF50"  />
                </template>
              </q-input>
            </div>

            <div class="filter-item status">
              <q-select
                v-model="filtersData.status"
                :options="statusAvailable"
                outlined
                dense
                emit-value
                map-options
                clearable
                label="Filtrar por Estado"
                @update:model-value="handleStatusChange"
              >
                <template #prepend>
                  <q-icon name="filter_list" color="green-8" />
                </template>
              </q-select>
            </div>
          </div>

          <div class="actions-right row items-center q-gutter-sm">
            <Button
              label="Carga Masiva"
              custom-class="gradient-btn"
              icon="cloud_upload"
              @click="openBulkUploadDialog"
            />
            <Button
              label="Añadir Empresa"
              custom-class="gradient-btn"
              icon="domain_add"
              @click="openFormDialogCompanies"
            />
          </div>
        </div>

        <Table
          card
          :rows="rowsCompanies"
          :columns="columns"
          v-model:pagination="pagination"
          :loanding-table="loadingTable"
          row-key="_id"
          @request="handlePaginationRequest"
        >
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.status === 0 ? 'positive' : 'negative'"
                class="text-uppercase"
              >
                {{ props.row.status === 0 ? 'Activa' : 'Inactiva' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-options="props">
            <q-td :props="props" class="text-center table-options">
              <ButtonTableOptions
                icon="edit"
                color="grey-7"
                tooltip="Editar"
                @click="populateFormForEditCompanies(props.row)"
              />
              <ButtonTableOptions
                :icon="props.row.status === 0 ? 'block' : 'check_circle'"
                :color="props.row.status === 0 ? 'negative' : 'positive'"
                :tooltip="props.row.status === 0 ? 'Desactivar' : 'Activar'"
                @click="toggleStatusCompanies(props.row)"
              />
              <ButtonTableOptions
                icon="visibility"
                color="grey"
                tooltip="Ver"
                @click="openDetailsDialogCompanies(props.row)"
              />
            </q-td>
          </template>

          <template #no-data>
            <div class="q-pa-md flex flex-center column text-grey full-width">
              <q-icon name="business" size="2.5em" color="positive" />
              <div class="text-subtitle2 q-mt-sm">
                No hay empresas registradas
              </div>
            </div>
          </template>
        </Table>

        <!-- Modal de Detalles -->
        <Modal v-model="showDetailDialog" width="900px" max-width="90vw">
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="business" class="q-mr-sm" />
                {{ selectedCompanies?.name || 'Empresa' }}
              </div>
            </div>
          </template>

          <template #body>
            <div v-if="selectedCompanies" class="modal-content-grid">
              <div class="modal-column">
                <div class="section-title">Datos de la empresa</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Número NIT:</div>
                    <div class="data-value">{{ selectedCompanies?.companyNit || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Razón social:</div>
                    <div class="data-value">{{ selectedCompanies?.name || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Dirección:</div>
                    <div class="data-value">{{ selectedCompanies?.location || '-' }}</div>
                  </div>
                </div>
              </div>

              <div class="modal-column">
                <div class="section-title">Contacto de la empresa</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Jefe inmediato:</div>
                    <div class="data-value">{{ selectedCompanies?.legalRepresentativeName || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Cargo:</div>
                    <div class="data-value">{{ selectedCompanies?.legalRepresentativePosition || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Teléfono:</div>
                    <div class="data-value">{{ selectedCompanies?.legalRepresentativePhone || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Email:</div>
                    <div class="data-value">{{ selectedCompanies?.legalRepresentativeEmail || '-' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <Button
              label="Cerrar"
              custom-class="boton-cerrar"
              v-close-popup
            />
          </template>
        </Modal>

        <!-- Modal de Añadir/Editar -->
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
                <q-icon name="business" class="q-mr-sm" />
                {{ isEditMode ? 'Editar Empresa' : 'Añadir nueva empresa' }}
              </div>
            </div>
          </template>

          <template #body>
            <q-form @submit.prevent="submitFormCompanies">
              <div class="modal-content-grid">
                <div class="modal-column">
                  <div class="section-title">Datos de la empresa</div>
                  <q-input
                    v-model="formData.companyNit"
                    filled
                    dense
                    label="Número NIT *"
                    :disable="isEditMode"
                    :rules="[
                      val => !!val || 'El NIT es requerido',
                      val => nitRegex.test(val) || 'El NIT debe contener solo números y mínimo 9 dígitos'
                    ]"
                  />
                  <q-input
                    v-model="formData.name"
                    filled
                    dense
                    label="Razón social *"
                    :rules="[
                      val => !!val || 'El nombre es requerido',
                      val => nameRegex.test(val) || 'El nombre solo debe contener letras'
                    ]"
                  />
                  <q-select
                    v-model="formData.location"
                    filled
                    dense
                    label="Departamento *"
                    :options="departments"
                    emit-value
                    map-options
                    :rules="[val => !!val || 'El departamento es requerido']"
                  />
                </div>

                <div class="modal-column">
                  <div class="section-title">Contacto de la empresa</div>
                  <q-input
                    v-model="formData.legalRepresentativeName"
                    filled
                    dense
                    label="Jefe inmediato *"
                    :rules="[
                      val => !!val || 'El jefe inmediato es requerido',
                      val => nameRegex.test(val) || 'El nombre solo debe contener letras'
                    ]"
                  />
                  <q-input
                    v-model="formData.legalRepresentativePosition"
                    filled
                    dense
                    label="Cargo *"
                    :rules="[val => !!val || 'El cargo es requerido']"
                  />
                  <q-input
                    v-model="formData.legalRepresentativePhone"
                    filled
                    dense
                    label="Teléfono *"
                    mask="##########"
                    :rules="[
                      val => !!val || 'El teléfono es requerido',
                      val => phoneRegex.test(val) || 'El teléfono debe tener 10 dígitos y comenzar con 3'
                    ]"
                  />
                  <q-input
                    v-model="formData.legalRepresentativeEmail"
                    filled
                    dense
                    label="Email *"
                    type="email"
                    lazy-rules
                    :rules="[
                      val => !!val?.trim() || 'El email es requerido',
                      val => emailRegex.test((val || '').trim()) || 'Email inválido'
                    ]"
                  />
                </div>
              </div>
            </q-form>
          </template>

          <template #footer>
            <div class="row justify-end q-gutter-sm full-width">
              <Button
                custom-class="boton-cerrar"
                label="Cancelar"
                @click="closeFormDialogCompanies"
              />
              <Button
                :label="isEditMode ? 'Actualizar' : 'Añadir Empresa'"
                type="submit"
                custom-class="gradient-btn"
                :loading="loading"
                @click="submitFormCompanies"
              />
            </div>
          </template>
        </Modal>

        <!-- Modal de Carga Masiva -->
        <Modal v-model="showUploadDialog" width="600px" max-width="95vw" persistent>
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="cloud_upload" class="q-mr-sm" />
                Carga Masiva de Empresas
              </div>
            </div>
          </template>

          <template #body>
            <div class="q-pa-md">
              <div class="q-mb-md">
                <p class="text-body1 q-mb-sm">
                  Sube un archivo Excel (.xlsx) o CSV (.csv) con la información de las empresas.
                </p>
                <p class="text-caption text-grey-7">
                  El archivo debe contener las siguientes columnas: NIT, Razón Social,
                  Ubicación, Nombre Representante, Cargo, Teléfono, Email.
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
import { onMounted } from 'vue'
import { useEntityManager } from 'src/composables/useEntityManager'
import { useColombia } from 'src/composables/useColombia'
import BackButton from 'src/components/BackButton.vue'
import Table from 'src/components/Table.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Modal from 'src/components/Modal.vue'
import PageHeader from 'src/components/PageHeader.vue'

// ==================== COMPOSABLE CONFIGURATION ====================

// 1️⃣ Form structure
const getDefaultFormData = () => ({
  _id: '',
  companyNit: '',
  name: '',
  location: '',
  legalRepresentativeName: '',
  legalRepresentativePhone: '',
  legalRepresentativeEmail: '',
  legalRepresentativePosition: ''
})

// 2️⃣ API endpoints
const endpoints = {
  list: '/companies/listCompanies',
  create: '/companies/saveCompanies',
  update: (id) => `/companies/updateCompanies/${id}`,
  activate: (id) => `/companies/activeCompanies/${id}`,
  deactivate: (id) => `/companies/inActiveCompanies/${id}`,
  bulkUpload: '/companies/loadMassiveCompanie'
}

// 3️⃣ Custom messages
const customMessages = {
  createSuccess: 'Empresa creada correctamente',
  updateSuccess: 'Empresa actualizada correctamente',
  listError: 'Error al listar las empresas',
  statusSuccess: 'Estado actualizado correctamente',
  statusError: 'No fue posible cambiar el estado',
  bulkUploadSuccess: 'Carga masiva realizada correctamente',
  bulkUploadError: 'Error al cargar el archivo',
  noData: 'No hay empresas registradas'
}

// 4️⃣ Function to build payload
const buildCompaniesPayload = (formData) => ({
  companyNit: formData.companyNit?.trim(),
  name: formData.name?.trim(),
  location: formData.location?.trim(),
  legalRepresentativeName: formData.legalRepresentativeName?.trim(),
  legalRepresentativePhone: formData.legalRepresentativePhone?.trim(),
  legalRepresentativeEmail: formData.legalRepresentativeEmail?.trim(),
  legalRepresentativePosition: formData.legalRepresentativePosition?.trim()
})

// 5️⃣ Initialize composable with standardized names
const {
  // States
  loading,
  loadingTable,
  rows,
  showAddDialog,
  showDetailDialog,
  showUploadDialog,
  isEditMode,
  selectedEntity,
  selectedFile,
  formData,
  filtersData,
  pagination,

  // Functions for pagination
  handlePaginationRequest,
  resetPaginationState,

  // Functions for filters
  handleSearchChange,
  handleStatusChange,

  // Functions for modals
  openFormDialog,
  closeFormDialog,
  openDetailsDialog,
  openBulkUploadDialog,
  handleAddDialogVisibility,

  // Functions for form
  resetForm,
  populateFormForEdit,

  // Functions for API
  fetchEntities,
  submitForm,
  toggleStatus,
  submitBulkUpload
} = useEntityManager({
  entityName: 'company',
  entityNamePlural: 'companies',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  buildPayload: buildCompaniesPayload
})

// ==================== ALIAS WITH STANDARDIZED NAMES ====================
// Following convention: functionName + Entity

// States
const rowsCompanies = rows
const selectedCompanies = selectedEntity

// Functions for modals
const openFormDialogCompanies = openFormDialog
const closeFormDialogCompanies = closeFormDialog
const openDetailsDialogCompanies = openDetailsDialog

// Functions for form
const resetFormCompanies = resetForm
const populateFormForEditCompanies = populateFormForEdit

// Functions for API
const fetchCompanies = fetchEntities
const submitFormCompanies = submitForm
const toggleStatusCompanies = toggleStatus

// ==================== COMPANY SPECIFIC DATA ====================

// Colombia departments
const { departments } = useColombia()

// Status filter options
const statusAvailable = [
  { label: 'Todos los estados', value: '' },
  { label: 'Activo', value: 0 },
  { label: 'Inactivo', value: 1 }
]

// Table columns
const columns = [
  { name: 'companyNit', label: 'NIT', align: 'center', field: 'companyNit' },
  { name: 'name', label: 'Nombre', align: 'center', field: 'name' },
  { name: 'location', label: 'Locación', align: 'center', field: 'location' },
  { name: 'legalRepresentativePhone', label: 'Teléfono', align: 'center', field: 'legalRepresentativePhone' },
  { name: 'legalRepresentativeName', label: 'Nombre Jefe', align: 'center', field: 'legalRepresentativeName' },
  { name: 'legalRepresentativeEmail', label: 'Email', align: 'center', field: 'legalRepresentativeEmail' },
  { name: 'legalRepresentativePosition', label: 'Cargo', align: 'center', field: 'legalRepresentativePosition' },
  { name: 'status', label: 'Estado', align: 'center', field: 'status' },
  { name: 'options', label: 'Acciones', align: 'center' }
]

// Expresiones regulares para validación
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
const nitRegex = /^[0-9]{9,}$/
const phoneRegex = /^3[0-9]{9}$/

// ==================== LIFECYCLE ====================

onMounted(async () => {
  await fetchCompanies()
})
</script>

<style lang="scss" scoped>
.companies-page {
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

.filter-item.status {
  width: 200px;
}

.table-options {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Estilos específicos para el modal de detalles */
.modal-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.modal-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 1.3rem;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid var(--color-primary);
  margin-top: 0;
}

.data-grid {
  display: grid;
  gap: 16px;
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #E0E0E0;
  margin-bottom: 16px;
}

.data-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F0F0F0;
}




.data-row:last-child {
  border-bottom: none;
}

.text-weight-bold {
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 600;
}

.data-value {
  color: #34495e;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Estilos para formularios en modales */
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
  .filter-item.search,
  .filter-item.status,
  .filter-item.location {
    width: 100%;
    min-width: unset;
  }

  .actions-right {
    width: 100%;
  }

  /* Responsive para el modal - convertir a una sola columna en móviles */
  .modal-content-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .data-row {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 6px 0;
  }

  .data-row .text-weight-bold {
    margin-bottom: 4px;
  }

  .text-weight-bold {
    font-size: 0.9rem;
  }

  .data-value {
    font-size: 0.9rem;
  }

  .section-title {
    font-size: 1.2rem;
    margin-bottom: 15px;
    padding-left: 10px;
  }

  .data-grid {
    gap: 12px;
    padding: 15px;
  }
}
</style>