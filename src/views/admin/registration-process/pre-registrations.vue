<template>
  <q-page class="q-pa-md solicitudes-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Gestión de Solicitudes" 
              description="Revisa, aprueba o rechaza las solicitudes de registro de etapa productiva." 
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
                placeholder="Buscar por aprendiz o empresa..."
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
        </div>

        <Table
          card
          :rows="rowsSolicitudes"
          :columns="columns"
          v-model:pagination="pagination"
          :loanding-table="loadingTable"
          row-key="_id"
          @request="handlePaginationRequest"
        >
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

          <template #body-cell-apprentice="props">
            <q-td :props="props">
              {{ props.row.apprenticeId?.firstName || '-' }} 
              {{ props.row.apprenticeId?.lastName || '' }}
            </q-td>
          </template>

          <template #body-cell-modality="props">
            <q-td :props="props">
              {{ props.row.modalityId?.name || '-' }}
            </q-td>
          </template>

          <template #body-cell-company="props">
            <q-td :props="props">
              {{ props.row.companyId?.name || props.row.companyData?.name || '-' }}
            </q-td>
          </template>

          <template #body-cell-options="props">
            <q-td :props="props" class="text-center table-options">
              <ButtonTableOptions
                icon="visibility"
                color="grey-7"
                tooltip="Ver Detalles"
                @click="openDetailsDialogSolicitudes(props.row)"
              />
              <ButtonTableOptions
                v-if="props.row.status === 0"
                icon="check_circle"
                color="positive"
                tooltip="Aprobar"
                @click="openApproveDialog(props.row)"
              />
              <ButtonTableOptions
                v-if="props.row.status === 0"
                icon="cancel"
                color="negative"
                tooltip="Rechazar"
                @click="openRejectDialog(props.row)"
              />
              <ButtonTableOptions
                v-if="props.row.status === 0"
                icon="comment"
                color="warning"
                tooltip="Agregar Observación"
                @click="openObservationDialog(props.row)"
              />
            </q-td>
          </template>

          <template #no-data>
            <div class="q-pa-md flex flex-center column text-grey full-width">
              <q-icon name="description" size="2.5em" color="positive" />
              <div class="text-subtitle2 q-mt-sm">
                No hay solicitudes registradas
              </div>
            </div>
          </template>
        </Table>

        <!-- Modal de Detalles -->
        <Modal v-model="showDetailDialog" width="1000px" max-width="95vw">
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="description" class="q-mr-sm" />
                Detalles de la Solicitud
              </div>
            </div>
          </template>

          <template #body>
            <div v-if="selectedSolicitud" class="modal-content-grid">
              <div class="modal-column">
                <div class="section-title">Información del Aprendiz</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Nombre:</div>
                    <div class="data-value">
                      {{ selectedSolicitud.apprenticeId?.firstName || '-' }} 
                      {{ selectedSolicitud.apprenticeId?.lastName || '' }}
                    </div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Documento:</div>
                    <div class="data-value">
                      {{ selectedSolicitud.apprenticeId?.documentType || '-' }} 
                      {{ selectedSolicitud.apprenticeId?.documentNumber || '-' }}
                    </div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Email:</div>
                    <div class="data-value">
                      {{ selectedSolicitud.apprenticeId?.email?.institutional || 
                         selectedSolicitud.apprenticeId?.email?.personal || '-' }}
                    </div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Teléfono:</div>
                    <div class="data-value">
                      {{ selectedSolicitud.apprenticeId?.phone || '-' }}
                    </div>
                  </div>
                </div>

                <div class="section-title q-mt-lg">Información de la Empresa</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Razón Social:</div>
                    <div class="data-value">
                      {{ selectedSolicitud.companyId?.name || selectedSolicitud.companyData?.name || '-' }}
                    </div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">NIT:</div>
                    <div class="data-value">
                      {{ selectedSolicitud.companyId?.companyNit || selectedSolicitud.companyData?.companyNit || '-' }}
                    </div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Ubicación:</div>
                    <div class="data-value">
                      {{ selectedSolicitud.companyId?.location || selectedSolicitud.companyData?.location || '-' }}
                    </div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Representante Legal:</div>
                    <div class="data-value">
                      {{ selectedSolicitud.companyId?.legalRepresentativeName || 
                         selectedSolicitud.companyData?.legalRepresentativeName || '-' }}
                    </div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Cargo:</div>
                    <div class="data-value">
                      {{ selectedSolicitud.companyId?.legalRepresentativePosition || 
                         selectedSolicitud.companyData?.legalRepresentativePosition || '-' }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-column">
                <div class="section-title">Detalles de la Solicitud</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Modalidad:</div>
                    <div class="data-value">{{ selectedSolicitud.modalityId?.name || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Fecha Inicio:</div>
                    <div class="data-value">{{ formatDate(selectedSolicitud.scheduledStartDate) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Horas Solicitadas:</div>
                    <div class="data-value">{{ selectedSolicitud.totalRequestedHours || 0 }} horas</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Meses Solicitados:</div>
                    <div class="data-value">{{ selectedSolicitud.totalRequestedMonths || 0 }} meses</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Días Laborales:</div>
                    <div class="data-value">{{ selectedSolicitud.workingDays || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Horas Diarias:</div>
                    <div class="data-value">{{ selectedSolicitud.dailyHours || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Requiere ARL SENA:</div>
                    <div class="data-value">
                      {{ selectedSolicitud.senaRequiredArl ? 'Sí' : 'No' }}
                    </div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Estado:</div>
                    <div class="data-value">
                      <q-badge :color="getStatusColor(selectedSolicitud.status)">
                        {{ getStatusLabel(selectedSolicitud.status) }}
                      </q-badge>
                    </div>
                  </div>
                </div>

                <div v-if="selectedSolicitud.observation?.length" class="section-title q-mt-lg">
                  Observaciones
                </div>
                <div v-if="selectedSolicitud.observation?.length" class="data-grid">
                  <div 
                    v-for="(obs, idx) in selectedSolicitud.observation" 
                    :key="idx"
                    class="observation-item"
                  >
                    <div class="text-caption text-grey-7">
                      {{ formatDate(obs.createdAt) }}
                    </div>
                    <div class="text-body2">{{ obs.observation }}</div>
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

        <!-- Modal de Aprobar -->
        <Modal v-model="showApproveDialog" width="600px" max-width="95vw" persistent>
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="check_circle" class="q-mr-sm" />
                Aprobar Solicitud
              </div>
            </div>
          </template>

          <template #body>
            <q-form @submit.prevent="submitApprove">
              <div class="q-pa-md">
                <p class="text-body1 q-mb-md">
                  ¿Estás seguro de aprobar esta solicitud?
                </p>
                <q-input
                  v-model="observationText"
                  filled
                  type="textarea"
                  label="Observación (opcional)"
                  rows="4"
                  hint="Puedes agregar comentarios adicionales"
                />
              </div>
            </q-form>
          </template>

          <template #footer>
            <div class="row justify-end q-gutter-sm full-width">
              <Button
                label="Cancelar"
                custom-class="boton-cerrar"
                @click="closeApproveDialog"
              />
              <Button
                label="Aprobar"
                custom-class="gradient-btn"
                :loading="loading"
                @click="submitApprove"
              />
            </div>
          </template>
        </Modal>

        <!-- Modal de Rechazar -->
        <Modal v-model="showRejectDialog" width="600px" max-width="95vw" persistent>
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="cancel" class="q-mr-sm" />
                Rechazar Solicitud
              </div>
            </div>
          </template>

          <template #body>
            <q-form @submit.prevent="submitReject">
              <div class="q-pa-md">
                <p class="text-body1 q-mb-md text-negative">
                  Estás a punto de rechazar esta solicitud.
                </p>
                <q-input
                  v-model="observationText"
                  filled
                  type="textarea"
                  label="Motivo del rechazo *"
                  rows="4"
                  :rules="[val => !!val?.trim() || 'Debes especificar el motivo del rechazo']"
                  hint="Explica claramente por qué se rechaza la solicitud"
                />
              </div>
            </q-form>
          </template>

          <template #footer>
            <div class="row justify-end q-gutter-sm full-width">
              <Button
                label="Cancelar"
                custom-class="boton-cerrar"
                @click="closeRejectDialog"
              />
              <Button
                label="Rechazar"
                custom-class="gradient-btn"
                :loading="loading"
                @click="submitReject"
              />
            </div>
          </template>
        </Modal>

        <!-- Modal de Observación -->
        <Modal v-model="showObservationDialog" width="600px" max-width="95vw" persistent>
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="comment" class="q-mr-sm" />
                Agregar Observación
              </div>
            </div>
          </template>

          <template #body>
            <q-form @submit.prevent="submitObservation">
              <div class="q-pa-md">
                <p class="text-body1 q-mb-md">
                  Agrega una observación o solicitud de corrección al aprendiz.
                </p>
                <q-input
                  v-model="observationText"
                  filled
                  type="textarea"
                  label="Observación *"
                  rows="4"
                  :rules="[val => !!val?.trim() || 'La observación es requerida']"
                  hint="El aprendiz recibirá esta observación y podrá corregir su solicitud"
                />
              </div>
            </q-form>
          </template>

          <template #footer>
            <div class="row justify-end q-gutter-sm full-width">
              <Button
                label="Cancelar"
                custom-class="boton-cerrar"
                @click="closeObservationDialog"
              />
              <Button
                label="Enviar"
                custom-class="gradient-btn"
                :loading="loading"
                @click="submitObservation"
              />
            </div>
          </template>
        </Modal>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useEntityManager } from 'src/composables/useEntityManager'
import { useNotifications } from 'src/composables/useNotifications'
import { putData } from 'src/services/apiClient'
import BackButton from 'src/components/BackButton.vue'
import Table from 'src/components/Table.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Modal from 'src/components/Modal.vue'
import PageHeader from 'src/components/PageHeader.vue'

// ==================== CONFIGURACIÓN DEL COMPOSABLE ====================

const getDefaultFormData = () => ({
  _id: '',
  apprenticeId: null,
  modalityId: null,
  companyId: null,
  companyData: null,
  scheduledStartDate: '',
  totalRequestedHours: 0,
  totalRequestedMonths: 0,
  workingDays: 5,
  dailyHours: 8,
  senaRequiredArl: false,
  status: 0
})

// 🔧 CAMBIO PRINCIPAL: Usar el endpoint de registrations que SÍ existe en el Postman
const endpoints = {
  list: '/registrations/listRegistrations', // ← CAMBIADO de /preRegistrations/listPreRegistration
  approve: (id) => `/preRegistrations/aprovedPreRegistration/${id}`,
  reject: (id) => `/preRegistrations/rejectedPreRegistration/${id}`,
  observation: (id) => `/preRegistrations/createObservation/${id}`
}

const customMessages = {
  listError: 'Error al listar las solicitudes',
  approveSuccess: 'Solicitud aprobada correctamente',
  rejectSuccess: 'Solicitud rechazada correctamente',
  observationSuccess: 'Observación agregada correctamente'
}

const {
  loading,
  loadingTable,
  rows,
  showDetailDialog,
  selectedEntity,
  filtersData,
  pagination,
  handlePaginationRequest,
  handleSearchChange,
  handleStatusChange,
  openDetailsDialog,
  fetchEntities
} = useEntityManager({
  entityName: 'solicitud',
  entityNamePlural: 'registrations', // ← CAMBIADO de 'preRegistrations'
  getDefaultFormData,
  endpoints,
  messages: customMessages
})

// ==================== ALIAS ESTANDARIZADOS ====================
const rowsSolicitudes = rows
const selectedSolicitud = selectedEntity
const openDetailsDialogSolicitudes = openDetailsDialog
const fetchSolicitudes = fetchEntities

// ==================== ESTADOS ADICIONALES ====================
const { error, success } = useNotifications()
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const showObservationDialog = ref(false)
const observationText = ref('')
const currentSolicitudId = ref(null)

// ==================== DATOS ESPECÍFICOS ====================

const statusAvailable = [
  { label: 'Todos los estados', value: '' },
  { label: 'Pendiente', value: 0 },
  { label: 'Aprobado', value: 1 },
  { label: 'Rechazado', value: 2 }
]

const columns = [
  { name: 'apprentice', label: 'Aprendiz', align: 'center', field: 'apprenticeId' },
  { name: 'modality', label: 'Modalidad', align: 'center', field: 'modalityId' },
  { name: 'company', label: 'Empresa', align: 'center', field: 'companyId' },
  { name: 'scheduledStartDate', label: 'Fecha Inicio', align: 'center', field: 'scheduledStartDate' },
  { name: 'status', label: 'Estado', align: 'center', field: 'status' },
  { name: 'options', label: 'Acciones', align: 'center' }
]

// ==================== FUNCIONES AUXILIARES ====================

const getStatusColor = (status) => {
  const colors = {
    0: 'warning',
    1: 'positive',
    2: 'negative'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    0: 'Pendiente',
    1: 'Aprobado',
    2: 'Rechazado'
  }
  return labels[status] || 'Desconocido'
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// ==================== FUNCIONES DE MODALES ====================

const openApproveDialog = (row) => {
  currentSolicitudId.value = row._id
  observationText.value = ''
  showApproveDialog.value = true
}

const closeApproveDialog = () => {
  showApproveDialog.value = false
  currentSolicitudId.value = null
  observationText.value = ''
}

const openRejectDialog = (row) => {
  currentSolicitudId.value = row._id
  observationText.value = ''
  showRejectDialog.value = true
}

const closeRejectDialog = () => {
  showRejectDialog.value = false
  currentSolicitudId.value = null
  observationText.value = ''
}

const openObservationDialog = (row) => {
  currentSolicitudId.value = row._id
  observationText.value = ''
  showObservationDialog.value = true
}

const closeObservationDialog = () => {
  showObservationDialog.value = false
  currentSolicitudId.value = null
  observationText.value = ''
}

// ==================== FUNCIONES DE API ====================

const submitApprove = async () => {
  loading.value = true
  try {
    const payload = observationText.value?.trim() 
      ? { observation: observationText.value.trim() }
      : {}
    
    const response = await putData(
      endpoints.approve(currentSolicitudId.value),
      payload
    )
    success(response?.msg || customMessages.approveSuccess)
    closeApproveDialog()
    await fetchSolicitudes()
  } catch (err) {
    error(err?.response?.data?.msg || err?.message || 'Error al aprobar la solicitud')
  } finally {
    loading.value = false
  }
}

const submitReject = async () => {
  if (!observationText.value?.trim()) {
    error('Debes especificar el motivo del rechazo')
    return
  }

  loading.value = true
  try {
    const response = await putData(
      endpoints.reject(currentSolicitudId.value),
      { 
        observation: {
          observation: observationText.value.trim()
        }
      }
    )
    success(response?.msg || customMessages.rejectSuccess)
    closeRejectDialog()
    await fetchSolicitudes()
  } catch (err) {
    error(err?.response?.data?.msg || err?.message || 'Error al rechazar la solicitud')
  } finally {
    loading.value = false
  }
}

const submitObservation = async () => {
  if (!observationText.value?.trim()) {
    error('La observación es requerida')
    return
  }

  loading.value = true
  try {
    const response = await putData(
      endpoints.observation(currentSolicitudId.value),
      { observation: observationText.value.trim() }
    )
    success(response?.msg || customMessages.observationSuccess)
    closeObservationDialog()
    await fetchSolicitudes()
  } catch (err) {
    error(err?.response?.data?.msg || err?.message || 'Error al agregar la observación')
  } finally {
    loading.value = false
  }
}

// ==================== LIFECYCLE ====================

onMounted(async () => {
  await fetchSolicitudes()
})
</script>

<style lang="scss" scoped>
.solicitudes-page {
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

.observation-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid var(--color-primary);
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

@media (max-width: 1024px) {
  .filters-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-left {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .filter-item,
  .filter-item.search,
  .filter-item.status {
    width: 100%;
    min-width: unset;
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
}
</style>