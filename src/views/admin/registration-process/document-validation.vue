<template>
  <q-page class="q-pa-md validations-page">
    <div class="q-mb-lg">
      <BackButton />
    </div>

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Validaciones de Documentos"
            />
            <p class="text-body2 text-grey-7 text-center q-mt-sm">
              Visualiza el estado de validación de tus documentos por parte del administrador.
            </p>
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
                placeholder="Buscar por aprendiz..."
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
          :rows="rowsValidations"
          :columns="columns"
          v-model:pagination="pagination"
          :loanding-table="loadingTable"
          row-key="_id"
          @request="handlePaginationRequest"
        >
          <template #body-cell-time="props">
            <q-td :props="props">
              <div class="flex items-center q-gutter-xs">
                <q-icon name="schedule" size="18px" color="grey-7" />
                <span>{{ formatTime(props.row.time) }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-date="props">
            <q-td :props="props">
              <div class="flex items-center q-gutter-xs">
                <q-icon name="event" size="18px" color="grey-7" />
                <span>{{ formatDate(props.row.date) }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="getStatusColor(props.row.status)"
                class="text-uppercase status-badge"
              >
                <q-icon 
                  :name="getStatusIcon(props.row.status)" 
                  size="14px" 
                  class="q-mr-xs" 
                />
                {{ getStatusLabel(props.row.status) }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-options="props">
            <q-td :props="props" class="text-center table-options">
              <ButtonTableOptions
                icon="description"
                color="primary"
                tooltip="Ver Documento"
                @click="openDocumentDialog(props.row)"
              />
              <ButtonTableOptions
                icon="visibility"
                color="grey"
                tooltip="Ver Detalles"
                @click="openDetailsDialogValidations(props.row)"
              />
            </q-td>
          </template>

          <template #no-data>
            <div class="q-pa-md flex flex-center column text-grey full-width">
              <q-icon name="assignment_turned_in" size="2.5em" color="positive" />
              <div class="text-subtitle2 q-mt-sm">
                No tienes validaciones registradas
              </div>
            </div>
          </template>
        </Table>

        <!-- Modal de Detalles -->
        <Modal v-model="showDetailDialog" variant="view" width="900px" max-width="90vw">
          <template #header>
            <div class="text-h6 flex items-center">
              <q-icon name="assignment_turned_in" class="q-mr-sm" />
              {{ selectedValidations?.apprentice || 'Validación' }}
            </div>
          </template>

          <template #body>
            <div v-if="selectedValidations" class="modal-content-grid">
              <div class="modal-column">
                <div class="section-title">Información del Aprendiz</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Aprendiz:</div>
                    <div class="data-value">{{ selectedValidations?.apprentice || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Fecha:</div>
                    <div class="data-value">{{ formatDate(selectedValidations?.date) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Hora:</div>
                    <div class="data-value">{{ formatTime(selectedValidations?.time) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Fecha de envío:</div>
                    <div class="data-value">{{ formatDateTime(selectedValidations?.submittedAt) }}</div>
                  </div>
                </div>
              </div>

              <div class="modal-column">
                <div class="section-title">Estado de Validación</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Estado:</div>
                    <div class="data-value">
                      <q-badge :color="getStatusColor(selectedValidations?.status)" class="status-badge-large">
                        <q-icon 
                          :name="getStatusIcon(selectedValidations?.status)" 
                          size="18px" 
                          class="q-mr-xs" 
                        />
                        {{ getStatusLabel(selectedValidations?.status) }}
                      </q-badge>
                    </div>
                  </div>
                  <div class="data-row" v-if="selectedValidations?.validatedAt">
                    <div class="text-weight-bold">Fecha de validación:</div>
                    <div class="data-value">{{ formatDateTime(selectedValidations?.validatedAt) }}</div>
                  </div>
                  <div class="data-row" v-if="selectedValidations?.validatedBy">
                    <div class="text-weight-bold">Validado por:</div>
                    <div class="data-value">{{ selectedValidations?.validatedBy }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Documento:</div>
                    <div class="data-value">
                      <Button
                        label="Ver documento"
                        icon="description"
                        flat
                        dense
                        color="primary"
                        @click="openDocumentDialog(selectedValidations)"
                      />
                    </div>
                  </div>
                </div>

                <div v-if="selectedValidations?.observations" class="observations-section">
                  <div class="section-title">Observaciones del Administrador</div>
                  <div class="observations-content">
                    <q-icon name="comment" size="20px" color="grey-7" class="q-mr-sm" />
                    <span>{{ selectedValidations?.observations }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="action-buttons-footer">
              <Button
                label="Rechazar"
                custom-class="btn-reject"
                @click="handleValidation(STATUS.REJECTED)"
              />
              <Button
                label="Aprobar"
                custom-class="btn-approve"
                @click="handleValidation(STATUS.APPROVED)"
              />
            </div>
          </template>
        </Modal>

        <!-- Modal de Documento -->
        <Modal v-model="showDocumentDialog" variant="view" width="1000px" max-width="95vw">
          <template #header>
            <div class="text-h6 flex items-center">
              <q-icon name="description" class="q-mr-sm" />
              Documento - {{ selectedDocument?.apprentice || 'Validación' }}
            </div>
          </template>

          <template #body>
            <div class="document-viewer">
              <div v-if="selectedDocument?.documentUrl" class="document-container">
                <div v-if="isImageFile(selectedDocument?.documentUrl)" class="image-preview">
                  <img :src="selectedDocument.documentUrl" alt="Documento" />
                </div>
                
                <div v-else-if="isPdfFile(selectedDocument?.documentUrl)" class="pdf-preview">
                  <iframe 
                    :src="selectedDocument.documentUrl" 
                    width="100%" 
                    height="600px"
                    frameborder="0"
                  ></iframe>
                </div>

                <div v-else class="file-info">
                  <q-icon name="insert_drive_file" size="64px" color="grey-6" />
                  <div class="text-h6 q-mt-md">Archivo no previsualizable</div>
                  <div class="text-caption text-grey-7">
                    Descarga el archivo para verlo
                  </div>
                </div>
              </div>

              <div v-else class="no-document">
                <q-icon name="cloud_off" size="64px" color="grey-5" />
                <div class="text-subtitle1 q-mt-md text-grey-7">
                  No hay documento disponible
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="row justify-between full-width">
              <Button
                label="Cerrar"
                custom-class="boton-cerrar"
                @click="closeDocumentDialog"
              />
              <Button
                v-if="selectedDocument?.documentUrl"
                label="Descargar"
                custom-class="gradient-btn"
                @click="downloadDocument"
              />
            </div>
          </template>
        </Modal>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEntityManager } from 'src/composables/useEntityManager'
import { useNotifications } from 'src/composables/useNotifications'
import { date } from 'quasar'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'

// Constants
const STATUS = { 
  PENDING: 0,      
  APPROVED: 1,    
  REJECTED: 2,     
  IN_REVIEW: 3     
}

const getDefaultFormData = () => ({
  _id: '',
  apprentice: '',
  time: '',
  date: '',
  status: STATUS.PENDING,
  documentUrl: '',
  observations: '',
  submittedAt: '',
  validatedAt: '',
  validatedBy: ''
})

const endpoints = {
  list: '/validations/myValidations',
  update: '/validations/validate'
}

const customMessages = {
  listError: 'Error al cargar tus validaciones',
  noData: 'No tienes validaciones registradas',
  updateSuccess: 'Validación actualizada correctamente',
  updateError: 'Error al actualizar la validación'
}

const {
  loadingTable,
  rows,
  showDetailDialog,
  selectedEntity,
  filtersData,
  pagination,

  handlePaginationRequest,
  openDetailsDialog,
  fetchEntities,
  updateEntity
} = useEntityManager({
  entityName: 'validation',
  entityNamePlural: 'validations',
  getDefaultFormData,
  endpoints,
  messages: customMessages
})

const rowsValidations = rows
const selectedValidations = selectedEntity
const openDetailsDialogValidations = openDetailsDialog
const fetchValidations = fetchEntities

const notifications = useNotifications()
const showDocumentDialog = ref(false)
const selectedDocument = ref(null)

const statusAvailable = [
  { label: 'Todos los estados', value: '' },
  { label: 'Aprobado', value: STATUS.APPROVED },
  { label: 'Rechazado', value: STATUS.REJECTED }
]

const columns = [
  { name: 'apprentice', align: 'left', label: 'Aprendiz', field: 'apprentice', sortable: true },
  { name: 'date', align: 'center', label: 'Fecha que llegó el documento', field: 'date', sortable: true },
  { name: 'time', align: 'center', label: 'Hora', field: 'time', sortable: true },
  { name: 'status', align: 'center', label: 'Estado', field: 'status' },
  { name: 'options', align: 'center', label: 'Opciones' }
]

function getStatusLabel(status) {
  switch (status) {
    case STATUS.PENDING: return 'Pendiente'
    case STATUS.IN_REVIEW: return 'En Revisión'
    case STATUS.APPROVED: return 'Aprobado'
    case STATUS.REJECTED: return 'Rechazado'
    default: return 'Desconocido'
  }
}

function getStatusColor(status) {
  switch (status) {
    case STATUS.PENDING: return 'orange'
    case STATUS.IN_REVIEW: return 'info'
    case STATUS.APPROVED: return 'positive'
    case STATUS.REJECTED: return 'negative'
    default: return 'grey'
  }
}

function getStatusIcon(status) {
  switch (status) {
    case STATUS.PENDING: return 'schedule'
    case STATUS.IN_REVIEW: return 'visibility'
    case STATUS.APPROVED: return 'check_circle'
    case STATUS.REJECTED: return 'cancel'
    default: return 'help'
  }
}

function formatTime(time) {
  if (!time) return '-'
  return time
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    return date.formatDate(dateStr, 'DD/MM/YYYY')
  } catch (error) {
    return dateStr
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  try {
    return date.formatDate(dateStr, 'DD/MM/YYYY HH:mm')
  } catch (error) {
    return dateStr
  }
}

function isImageFile(url) {
  if (!url) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext))
}

function isPdfFile(url) {
  if (!url) return false
  return url.toLowerCase().endsWith('.pdf')
}

function openDocumentDialog(validation) {
  selectedDocument.value = validation
  showDocumentDialog.value = true
}

function closeDocumentDialog() {
  showDocumentDialog.value = false
  selectedDocument.value = null
}

async function handleValidation(status) {
  if (!selectedValidations.value) return

  try {
    const validationIndex = rows.value.findIndex(v => v._id === selectedValidations.value._id)
    
    if (validationIndex !== -1) {
      rows.value[validationIndex] = {
        ...rows.value[validationIndex],
        status: status,
        validatedAt: new Date().toISOString(),
        validatedBy: 'Administrador'
      }
    }

    showDetailDialog.value = false
    
    const statusText = status === STATUS.APPROVED ? 'aprobado' : 'rechazado'
    notifications.showSuccess(`Documento ${statusText} correctamente`)

    // Cuando tengas el backend listo, descomenta estas líneas:
    // const updatedData = {
    //   ...selectedValidations.value,
    //   status: status,
    //   validatedAt: new Date().toISOString(),
    //   validatedBy: 'Administrador'
    // }
    // await updateEntity(updatedData)
    // await fetchValidations()
    
  } catch (error) {
    notifications.showError('Error al validar el documento')
  }
}

function downloadDocument() {
  if (!selectedDocument.value?.documentUrl) {
    notifications.showError('No hay documento disponible para descargar')
    return
  }

  try {
    const link = document.createElement('a')
    link.href = selectedDocument.value.documentUrl
    link.download = selectedDocument.value.apprentice || 'documento'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notifications.showSuccess('Descarga iniciada')
  } catch (error) {
    notifications.showError('Error al descargar el documento')
  }
}

const mockValidations = [
  {
    _id: '1',
    apprentice: 'Juan Pérez García',
    time: '14:30',
    date: '2024-01-15',
    status: STATUS.PENDING,
    documentUrl: 'https://gc.scalahed.com/recursos/files/r161r/w25720w/Analisis%20de%20Estados%20Financieros_Bonson%20y%20Cortijo-15-28.pdf',
    submittedAt: '2024-01-15T10:30:00'
  },
  {
    _id: '2',
    apprentice: 'María González López',
    time: '09:15',
    date: '2024-01-16',
    status: STATUS.APPROVED,
    documentUrl: 'https://gc.scalahed.com/recursos/files/r161r/w25720w/Analisis%20de%20Estados%20Financieros_Bonson%20y%20Cortijo-15-28.pdf',
    submittedAt: '2024-01-16T09:15:00',
    validatedAt: '2024-01-16T10:30:00',
    validatedBy: 'Admin Principal'
  },
  {
    _id: '3',
    apprentice: 'Carlos Rodríguez Martínez',
    time: '16:45',
    date: '2024-01-17',
    status: STATUS.REJECTED,
    documentUrl: 'https://gc.scalahed.com/recursos/files/r161r/w25720w/Analisis%20de%20Estados%20Financieros_Bonson%20y%20Cortijo-15-28.pdf',
    submittedAt: '2024-01-17T16:45:00',
    validatedAt: '2024-01-17T17:00:00',
    validatedBy: 'Admin Principal'
  }
]

function loadMockData() {
  rows.value = mockValidations
  pagination.value.rowsNumber = mockValidations.length
  loadingTable.value = false
}

onMounted(async () => {
  loadMockData()
  // Cuando tengas el backend listo, descomenta esta línea:
  // await fetchValidations()
})
</script>

<style lang="scss" scoped>
.validations-page {
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
  width: 100%;
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

.status-badge {
  padding: 6px 12px;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
}

.status-badge-large {
  padding: 8px 16px;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
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
  word-break: break-word;
}

.observations-section {
  margin-top: 20px;
}

.observations-content {
  background: linear-gradient(135deg, #FFF3E0 0%, #FFFFFF 100%);
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #FF9800;
  display: flex;
  align-items: flex-start;
  font-size: 0.95rem;
  color: #5d4037;
  line-height: 1.6;
}

.action-buttons-footer {
  display: flex;
  gap: 16px;
  justify-content: center;
  width: 100%;
}

.btn-reject {
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%) !important;
  color: white !important;
  padding: 12px 32px !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(239, 83, 80, 0.3) !important;
  transition: all 0.3s ease !important;
}

.btn-reject:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 83, 80, 0.4) !important;
}

.btn-approve {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%) !important;
  color: white !important;
  padding: 12px 32px !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3) !important;
  transition: all 0.3s ease !important;
}

.btn-approve:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 187, 106, 0.4) !important;
}

.document-viewer {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.document-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview {
  width: 100%;
  max-height: 700px;
  overflow: auto;
  display: flex;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
}

.image-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pdf-preview {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.file-info,
.no-document {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
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

  .pdf-preview iframe {
    height: 400px;
  }

  .observations-content {
    font-size: 0.9rem;
  }

  .action-buttons-footer {
    flex-direction: column;
    gap: 12px;
  }

  .btn-reject,
  .btn-approve {
    width: 100%;
    padding: 14px 24px !important;
  }
}
</style>