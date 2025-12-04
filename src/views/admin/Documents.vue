<template>
  <q-page class="q-pa-md documents-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Documentos" description="Carga y gestión de documentos y anexos." />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="container">
      <!-- Search and Filters -->
      <div class="filters-wrapper row items-center q-mb-md q-gutter-y-sm">
        <div class="col-12 col-md-6">
          <q-input
            v-model="filtersData.search"
            dense
            outlined
            placeholder="Buscar documento..."
            debounce="600"
            clearable
            @update:model-value="handleSearchChange"
          >
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-6">
          <q-select
            v-model="filtersData.status"
            :options="statusOptions"
            label="Estado"
            outlined
            dense
            clearable
            emit-value
            map-options
            option-label="label"
            option-value="value"
            @update:model-value="handleStatusChange"
          />
        </div>
      </div>

      <!-- Table -->
        <Table
          card
          :rows="filteredItems"
          :columns="columns"
          v-model:pagination="pagination"
          :loanding-table="isLoading"
          row-key="_id"
          @request="handlePaginationRequest"
        >
          <template #body-cell-acciones="props">
            <q-td :props="props" class="text-center table-options">
              <ButtonTableOptions
                icon="visibility"
                color="grey"
                tooltip="Ver detalles"
                @click="handleViewDetails(props.row)"
              />
            </q-td>
          </template>

          <template #no-data>
            <div class="q-pa-md flex flex-center column text-grey full-width">
              <q-icon name="description" size="2.5em" color="positive" />
              <div class="text-subtitle2 q-mt-sm">
                No hay documentos registrados
              </div>
            </div>
          </template>
        </Table>
    </div>

    <!-- Modal de Detalles -->
    <Modal v-model="showDetailDialog" width="1200px" max-width="98vw">
      <template #header>
        <div class="modal-header">
          <div class="text-h6">Detalles del Documento</div>
          />
        </div>
      </template>

      <template #body>
        <div v-if="selectedDocument" class="row q-col-gutter-lg">
          <!-- Details content here -->
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
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useEntityManager } from 'src/composables/useEntityManager'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Table from 'src/components/Table.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Modal from 'src/components/Modal.vue'

// ==================== COMPOSABLE CONFIGURATION ====================

// 1️⃣ Form structure (not used for documents, but required)
const getDefaultFormData = () => ({
  _id: '',
  name: '',
  type: '',
  description: '',
  status: ''
})

// 2️⃣ API endpoints
const endpoints = {
  list: '/documents/list'
}

// 3️⃣ Custom messages
const customMessages = {
  listError: 'Error al cargar documentos',
  noData: 'No hay documentos registrados'
}

// 4️⃣ Function to process API response
const processDocumentsResponse = (response) => {
  function extractDocuments(payload) {
    if (Array.isArray(payload)) return payload
    if (payload?.documents && Array.isArray(payload.documents)) return payload.documents
    if (payload?.msg && Array.isArray(payload.msg)) return payload.msg
    if (payload?.data && Array.isArray(payload.data)) return payload.data
    if (payload?.data?.documents && Array.isArray(payload.data.documents)) return payload.data.documents
    return []
  }

  const documentsArray = extractDocuments(response)
  
  return {
    data: documentsArray,
    total: documentsArray.length
  }
}

// 5️⃣ Initialize composable
const {
  // States
  loadingTable,
  rows,
  showDetailDialog,
  selectedEntity,
  filtersData,
  pagination,

  // Functions for pagination
  handlePaginationRequest,
  resetPaginationState,

  // Functions for filters
  handleSearchChange,
  handleStatusChange,

  // Functions for modals
  openDetailsDialog,

  // Functions for API
  fetchEntities
} = useEntityManager({
  entityName: 'document',
  entityNamePlural: 'documents',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processDocumentsResponse
})

// ==================== ALIAS WITH STANDARDIZED NAMES ====================

// States
const filteredItems = rows
const selectedDocument = selectedEntity
const isLoading = loadingTable

// Functions for modals
const openDetailsDialogDocuments = openDetailsDialog

// Functions for API
const fetchDocuments = fetchEntities

// ==================== DOCUMENTS SPECIFIC FUNCTIONS ====================

// Handle view details
const handleViewDetails = (document) => {
  openDetailsDialogDocuments(document)
}

// ==================== DOCUMENTS SPECIFIC DATA ====================

// Status options
const statusOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' }
]

// Table columns
const columns = [
  { name: 'name', align: 'left', label: 'Nombre', field: 'name', sortable: true },
  { name: 'type', align: 'left', label: 'Tipo', field: 'type', sortable: true },
  { name: 'description', align: 'left', label: 'Descripción', field: 'description', sortable: true },
  { name: 'status', align: 'center', label: 'Estado', field: 'status', sortable: true },
  { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' }
]

// ==================== LIFECYCLE ====================

onMounted(async () => {
  await fetchDocuments()
})
</script>

<style lang="sass" scoped>
.documents-page
  background: #f5f7fb
  min-height: 100vh

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.container
  max-width: 1400px
  margin: 0 auto

.filters-wrapper
  gap: 12px

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

.icon-button
  min-height: 36px
  width: 36px
  padding: 0
  border-radius: 50%
  background: transparent !important
  box-shadow: none !important
  color: white
  display: flex
  align-items: center
  justify-content: center

  &:hover
    background-color: rgba(255, 255, 255, 0.15)
    box-shadow: none !important

@media (max-width: 768px)
  .table-wrapper
    padding: 16px

@media (max-width: 480px)
  .table-wrapper
    padding: 12px
</style>
