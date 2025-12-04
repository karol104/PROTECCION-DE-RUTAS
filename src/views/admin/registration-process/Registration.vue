<template>
  <q-page class="q-pa-md registro-ep-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Registros de Etapa Productiva" 
              description="Visualiza y gestiona los registros de etapa productiva de los aprendices." 
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
                placeholder="Buscar por documento de aprendiz..."
                @update:model-value="handleSearchChange"
              >
                <template #prepend>
                  <q-icon name="search" color="grey-7" />
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
              label="Actualizar Lista"
              custom-class="gradient-btn"
              icon="refresh"
              @click="fetchRegistroEP"
            />
          </div>
        </div>

        <Table
          card
          :rows="rowsRegistroEP"
          :columns="columns"
          v-model:pagination="pagination"
          :loading-table="loadingTable"
          row-key="_id"
          @request="handlePaginationRequest"
        >
          <template #body-cell-apprentice="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ getApprenticeName(props.row) }}</div>
              <div class="text-caption text-grey-7">{{ getApprenticeDocument(props.row) }}</div>
            </q-td>
          </template>

          <template #body-cell-modality="props">
            <q-td :props="props">
              <q-chip
                :color="getModalityColor(props.row.modalityId)"
                text-color="white"
                dense
                class="text-uppercase"
              >
                {{ getModalityName(props.row.modalityId) }}
              </q-chip>
            </q-td>
          </template>

          <template #body-cell-company="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ getCompanyName(props.row) }}</div>
              <div class="text-caption text-grey-7">{{ getCompanyNit(props.row) }}</div>
            </q-td>
          </template>

          <template #body-cell-dates="props">
            <q-td :props="props">
              <div class="text-caption">
                <strong>Inicio:</strong> {{ formatDate(props.row.scheduledStartDate) }}
              </div>
              <div class="text-caption">
                <strong>Horas:</strong> {{ props.row.totalRequestedHours || 'N/A' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="getStatusColor(props.row.status)"
                class="text-uppercase"
              >
                {{ getStatusLabel(props.row.status) }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-options="props">
            <q-td :props="props" class="text-center table-options">
              <ButtonTableOptions
                icon="visibility"
                color="primary"
                tooltip="Ver Detalles"
                @click="openDetailsDialogRegistroEP(props.row)"
              />
            </q-td>
          </template>

          <template #no-data>
            <div class="q-pa-md flex flex-center column text-grey full-width">
              <q-icon name="assignment" size="2.5em" color="positive" />
              <div class="text-subtitle2 q-mt-sm">
                No hay registros de etapa productiva
              </div>
            </div>
          </template>
        </Table>

        <!-- Modal de Detalles -->
        <Modal v-model="showDetailDialog" width="900px" max-width="90vw">
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="assignment" class="q-mr-sm" />
                Detalles del Registro de Etapa Productiva
              </div>
            </div>
          </template>

          <template #body>
            <div v-if="selectedRegistroEP" class="modal-content-grid">
              <div class="modal-column">
                <div class="section-title">Información del Registro</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Número de Registro:</div>
                    <div class="data-value">{{ selectedRegistroEP?.registrationNumber || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Estado:</div>
                    <div class="data-value">
                      <q-badge
                        :color="getStatusColor(selectedRegistroEP?.status)"
                        class="text-uppercase"
                      >
                        {{ getStatusLabel(selectedRegistroEP?.status) }}
                      </q-badge>
                    </div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Fecha de Creación:</div>
                    <div class="data-value">{{ formatDate(selectedRegistroEP?.createdAt) }}</div>
                  </div>
                </div>
              </div>

              <div class="modal-column">
                <div class="section-title">Información del Aprendiz</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Nombre:</div>
                    <div class="data-value">{{ getApprenticeName(selectedRegistroEP) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Documento:</div>
                    <div class="data-value">{{ getApprenticeDocument(selectedRegistroEP) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Email:</div>
                    <div class="data-value">{{ getApprenticeEmail(selectedRegistroEP) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Teléfono:</div>
                    <div class="data-value">{{ getApprenticePhone(selectedRegistroEP) }}</div>
                  </div>
                </div>
              </div>

              <div class="modal-column">
                <div class="section-title">Información de la Empresa</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Empresa:</div>
                    <div class="data-value">{{ getCompanyName(selectedRegistroEP) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">NIT:</div>
                    <div class="data-value">{{ getCompanyNit(selectedRegistroEP) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Ubicación:</div>
                    <div class="data-value">{{ getCompanyLocation(selectedRegistroEP) }}</div>
                  </div>
                </div>
              </div>

              <div class="modal-column">
                <div class="section-title">Detalles de la Etapa Productiva</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Modalidad:</div>
                    <div class="data-value">
                      <q-chip
                        :color="getModalityColor(selectedRegistroEP?.modalityId)"
                        text-color="white"
                        dense
                      >
                        {{ getModalityName(selectedRegistroEP?.modalityId) }}
                      </q-chip>
                    </div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Fecha Programada:</div>
                    <div class="data-value">{{ formatDate(selectedRegistroEP?.scheduledStartDate) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Horas Solicitadas:</div>
                    <div class="data-value">{{ selectedRegistroEP?.totalRequestedHours || 'N/A' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Días Laborales:</div>
                    <div class="data-value">{{ selectedRegistroEP?.workingDays || 'N/A' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Horas Diarias:</div>
                    <div class="data-value">{{ selectedRegistroEP?.dailyHours || 'N/A' }}</div>
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
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEntityManager } from 'src/composables/useEntityManager'
import Button from 'src/components/Button.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import PageHeader from 'src/components/PageHeader.vue'
import BackButton from 'src/components/BackButton.vue'

/* ========================================
   CONFIGURACIÃ"N DEL COMPOSABLE
======================================== */

const getDefaultFormData = () => ({
  _id: '',
  registrationNumber: '',
  modalityId: null,
  companyId: null,
  apprenticeId: null,
  scheduledStartDate: '',
  totalRequestedHours: 0,
  workingDays: 5,
  dailyHours: 8,
  status: 0
})

const endpoints = {
  list: '/registrations/listRegistrations',
  create: '/registrations/saveRegistration',
  update: (id) => `/registrations/updateRegistration/${id}`,
  activate: (id) => `/registrations/activateRegistration/${id}`,
  deactivate: (id) => `/registrations/deactivateRegistration/${id}`
}

const customMessages = {
  listError: 'Error al listar registros de etapa productiva',
  createSuccess: 'Registro de etapa productiva creado correctamente',
  createError: 'Error al crear registro',
  updateSuccess: 'Registro actualizado correctamente',
  updateError: 'Error al actualizar registro',
  statusSuccess: 'Estado actualizado correctamente',
  statusError: 'No fue posible cambiar el estado',
  noData: 'No hay registros de etapa productiva'
}

const processResponse = (response) => {
  // Adaptar la respuesta del API al formato esperado
  const registrations = response?.msg?.registrations || response?.msg || []
  const total = response?.msg?.totalDocuments || registrations.length
  
  return {
    data: Array.isArray(registrations) ? registrations : [],
    total
  }
}

/* ========================================
   USO DEL COMPOSABLE
======================================== */

const {
  loading,
  loadingTable,
  rows,
  showDetailDialog,
  selectedEntity,
  formData,
  filtersData,
  pagination,
  handlePaginationRequest,
  handleSearchChange,
  handleStatusChange,
  openDetailsDialog,
  fetchEntities
} = useEntityManager({
  entityName: 'registro',
  entityNamePlural: 'registros',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse
})

// Aliases para mejor legibilidad
const rowsRegistroEP = rows
const selectedRegistroEP = selectedEntity
const openDetailsDialogRegistroEP = openDetailsDialog
const fetchRegistroEP = fetchEntities

/* ========================================
   CONFIGURACIÃ"N DE LA TABLA
======================================== */

const columns = [
  { 
    name: 'registrationNumber', 
    label: 'Nº Registro', 
    align: 'center', 
    field: 'registrationNumber',
    sortable: true
  },
  { 
    name: 'apprentice', 
    label: 'Aprendiz', 
    align: 'left', 
    field: row => getApprenticeName(row),
    sortable: true
  },
  { 
    name: 'company', 
    label: 'Empresa', 
    align: 'left', 
    field: row => getCompanyName(row)
  },
  { 
    name: 'modality', 
    label: 'Modalidad', 
    align: 'center', 
    field: 'modalityId'
  },
  { 
    name: 'dates', 
    label: 'Información', 
    align: 'center', 
    field: 'scheduledStartDate'
  },
  { 
    name: 'status', 
    label: 'Estado', 
    align: 'center', 
    field: 'status',
    sortable: true
  },
  { 
    name: 'options', 
    label: 'Acciones', 
    align: 'center' 
  }
]

const statusAvailable = [
  { label: 'Todos los estados', value: '' },
  { label: 'Activo', value: 0 },
  { label: 'Inactivo', value: 1 }
]

/* ========================================
   FUNCIONES AUXILIARES
======================================== */

// Funciones para obtener información del aprendiz
const getApprenticeName = (row) => {
  if (!row) return '-'
  const apprentice = row.apprenticeId
  if (typeof apprentice === 'object' && apprentice !== null) {
    return `${apprentice.firstName || ''} ${apprentice.lastName || ''}`.trim() || '-'
  }
  return '-'
}

const getApprenticeDocument = (row) => {
  if (!row) return '-'
  const apprentice = row.apprenticeId
  if (typeof apprentice === 'object' && apprentice !== null) {
    return apprentice.documentNumber || '-'
  }
  return '-'
}

const getApprenticeEmail = (row) => {
  if (!row) return '-'
  const apprentice = row.apprenticeId
  if (typeof apprentice === 'object' && apprentice !== null) {
    return apprentice.email?.personal || apprentice.email?.institutional || '-'
  }
  return '-'
}

const getApprenticePhone = (row) => {
  if (!row) return '-'
  const apprentice = row.apprenticeId
  if (typeof apprentice === 'object' && apprentice !== null) {
    return apprentice.phone || '-'
  }
  return '-'
}

// Funciones para obtener información de la empresa
const getCompanyName = (row) => {
  if (!row) return '-'
  const company = row.companyId
  if (typeof company === 'object' && company !== null) {
    return company.name || '-'
  }
  return '-'
}

const getCompanyNit = (row) => {
  if (!row) return '-'
  const company = row.companyId
  if (typeof company === 'object' && company !== null) {
    return company.companyNit || '-'
  }
  return '-'
}

const getCompanyLocation = (row) => {
  if (!row) return '-'
  const company = row.companyId
  if (typeof company === 'object' && company !== null) {
    return company.location || '-'
  }
  return '-'
}

// Funciones para obtener información de modalidad
const getModalityName = (modalityId) => {
  if (!modalityId) return '-'
  if (typeof modalityId === 'object' && modalityId !== null) {
    return modalityId.name || '-'
  }
  return modalityId
}

const getModalityColor = (modalityId) => {
  const modalityName = getModalityName(modalityId)
  const colors = {
    'Contrato de Aprendizaje': 'blue',
    'Pasantía': 'green',
    'Vinculación Laboral': 'purple',
    'Proyecto Productivo': 'orange',
    'Monitoría': 'teal',
    'Unidad Productiva Familiar': 'pink'
  }
  
  for (const [key, color] of Object.entries(colors)) {
    if (modalityName.toLowerCase().includes(key.toLowerCase())) {
      return color
    }
  }
  
  return 'grey'
}

// Funciones de estado
const getStatusColor = (status) => status === 0 ? 'positive' : 'negative'
const getStatusLabel = (status) => status === 0 ? 'Activo' : 'Inactivo'

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return '-'
  }
}

/* ========================================
   CICLO DE VIDA
======================================== */

onMounted(async () => {
  await fetchRegistroEP()
})
</script>

<style lang="scss" scoped>
.registro-ep-page {
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
  width: 320px;
}

.filter-item.status {
  width: 220px;
}

.table-options {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Estilos para el modal de detalles */
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
  .filter-item.status {
    width: 100%;
    min-width: unset;
  }

  .actions-right {
    width: 100%;
    flex-direction: column;
  }

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