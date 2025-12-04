<template>
  <q-page class="q-pa-md validate-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Validar Solicitudes" description="Revisa y aprueba o rechaza solicitudes pendientes." />
          </q-card-section>
        </q-card>

        <div class="filters-wrapper flex items-center justify-between q-mb-lg">
          <div class="filters-left flex items-center bg-white">
            <div class="filter-item search">
              <q-input
                v-model="searchTerm"
                outlined
                dense
                clearable
                debounce="600"
                placeholder="Buscar solicitud..."
              >
                <template #append>
                  <q-icon name="search" color="grey-7" />
                </template>
              </q-input>
            </div>

            <div class="filter-item status">
              <q-select
                v-model="statusFilter"
                :options="statusOptions"
                outlined
                dense
                emit-value
                map-options
                clearable
                label="Estado"
              >
                <template #prepend>
                  <q-icon name="filter_list" color="green-8" />
                </template>
              </q-select>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <Table
            :rows="filteredItems"
            :columns="columns"
            row-key="_id"
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
                <q-icon name="assignment" size="2.5em" color="positive" />
                <div class="text-subtitle2 q-mt-sm">
                  No hay solicitudes registradas
                </div>
              </div>
            </template>
          </Table>
        </div>
      </div>
    </div>

    <Modal v-model="showDetailDialog" variant="view" width="1200px" max-width="98vw">
      <template #header>
        <div class="modal-header">
          <div class="text-h6">Detalles de la Solicitud</div>
        </div>
      </template>

      <template #body>
        <div v-if="selectedRequest" class="row q-col-gutter-lg">
          <!-- Detalles de la solicitud -->
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
import { ref, onMounted } from 'vue'
import { apiClient } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Table from 'src/components/Table.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Modal from 'src/components/Modal.vue'

// Composables
const notifications = useNotifications()

// State
const isLoading = ref(false)
const requests = ref([])
const selectedRequest = ref(null)
const showDetailDialog = ref(false)

// Filtrado debe hacerse en el backend - usar queryParams
const searchTerm = ref('')
// Los datos vienen filtrados del backend
const filteredItems = requests

// Status Filter
const statusFilter = ref(null)
const statusOptions = [
  { label: 'Todos los estados', value: null },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Aprobada', value: 'approved' },
  { label: 'Rechazada', value: 'rejected' }
]

// Table Columns
const columns = [
  { name: 'applicant', align: 'left', label: 'Solicitante', field: 'applicant', sortable: true },
  { name: 'type', align: 'left', label: 'Tipo', field: 'type', sortable: true },
  { name: 'description', align: 'left', label: 'Descripción', field: 'description', sortable: true },
  { name: 'status', align: 'center', label: 'Estado', field: 'status', sortable: true },
  { name: 'date', align: 'center', label: 'Fecha', field: 'date', sortable: true },
  { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' }
]

// API Functions
async function fetchRequests() {
  isLoading.value = true
  try {
    // TODO: Replace with actual endpoint
    // const response = await apiClient.get('/requests/list')
    // requests.value = response.data || []
    
    // Placeholder
    requests.value = []
  } catch (error) {    const errorMsg = error.response?.data?.message 
      || error.response?.data?.msg 
      || error.message 
      || 'Error al cargar las solicitudes'
    notifications.error(errorMsg)
    requests.value = []
  } finally {
    isLoading.value = false
  }
}

// Event Handlers
function handleViewDetails(request) {
  selectedRequest.value = request
  showDetailDialog.value = true
}

// Lifecycle
onMounted(() => {
  fetchRequests()
})
</script>

<style lang="sass" scoped>
.validate-page
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
  flex-wrap: wrap

.filters-left
  gap: 12px
  padding: 12px 16px
  border-radius: 16px
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08)
  flex-wrap: wrap

.filter-item
  min-width: 220px

.filter-item.search
  width: 280px

.filter-item.status
  width: 220px

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

.modal-header
  display: flex
  justify-content: space-between
  align-items: center
  background: var(--color-primary)
  color: white
  padding: 16px 24px

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

@media (max-width: 1024px)
  .filters-left
    width: 100%

@media (max-width: 768px)
  .filters-wrapper
    flex-direction: column
  .filter-item,
  .filter-item.search,
  .filter-item.status
    width: 100%
    min-width: unset
  .table-wrapper
    padding: 16px

@media (max-width: 480px)
  .table-wrapper
    padding: 12px
</style>

