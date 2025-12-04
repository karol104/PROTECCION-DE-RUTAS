<template>
  <div class="q-pa-md">
    <BackButton />
    
    <div class="text-center q-mb-lg">
      <h1 class="text-weight-bold text-black q-my-md" style="font-size: 3rem;">VALIDAR SOLICITUDES</h1>
    </div>

    <div class="container">
      <!-- Search and Filters -->
      <div class="row items-center q-mb-md q-gutter-y-sm">
        <div class="col-12 col-md-6">
          <q-input
            v-model="searchTerm"
            dense
            outlined
            placeholder="Buscar solicitud..."
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-6">
          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            label="Estado"
            outlined
            dense
            clearable
            emit-value
            map-options
            option-label="label"
            option-value="value"
          />
        </div>
      </div>

      <!-- Table -->
      <maintable
        :datos="filteredItems"
        :columnas="columns"
        row-key="_id"
        no-data-label="No hay solicitudes registradas"
        :rows-per-page-options="[10, 20, 50]"
        :initial-rows-per-page="10"
      >
        <template #body-cell-acciones="props">
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
          </q-td>
        </template>
      </maintable>
    </div>

    <!-- Modal de Detalles -->
    <modalComponent
      ref="detailsModalRef"
      width="1200px"
      max-width="98vw"
    >
      <template #header>
        <div class="text-h6">Detalles de la Solicitud</div>
      </template>

      <template #body>
        <div v-if="selectedRequest" class="row q-col-gutter-lg">
          <!-- Details content here -->
        </div>
      </template>

      <template #footer>
        <BotonCerrar @click="detailsModalRef?.closeDialog()" />
      </template>
    </modalComponent>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { apiClient } from '../../services/apiClient'
import { useNotifications } from '../../composables/useNotifications'
// useTableFiltering está deprecado - el filtrado debe hacerse en el backend
import BackButton from '../../components/BackButton.vue'
import BotonCerrar from '../../components/BotonCerrar.vue'
import maintable from '../../components/tables/maintable.vue'
import modalComponent from '../../components/modals/modalComponent.vue'

// Composables
const notifications = useNotifications()

// State
const isLoading = ref(false)
const requests = ref([])
const selectedRequest = ref(null)

// Modals
const detailsModalRef = ref(null)

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
  detailsModalRef.value?.openDialog()
}

// Lifecycle
onMounted(() => {
  fetchRequests()
})
</script>

<style lang="sass" scoped>
.container
  max-width: 1400px
  margin: 0 auto

/* ========== ESTILOS ESTANDARIZADOS PARA MODALES ========== */

/* Estilos base para modales */
:deep(.q-dialog__inner > .q-card)
  border-radius: 12px
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15)

:deep(.q-card__section--vert)
  padding: 0

/* Headers de modales con gradiente verde */
:deep(.q-dialog .q-card > .q-card__section:first-child)
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover-dark) 100%)
  padding: 20px 24px
  border-radius: 12px 12px 0 0

:deep(.q-dialog .text-h6)
  color: white
  font-size: 18px
  font-weight: 600
  margin: 0

/* Modal Body */
:deep(.q-dialog .q-card__section:not(:first-child):not(:last-child))
  padding: 24px 28px
  background: white

/* Modal Footer */
:deep(.q-dialog .q-card__section:last-child)
  background: #F8F9FA
  border-radius: 0 0 12px 12px
  padding: 20px 24px
  border-top: 1px solid #E0E0E0

/* Section Titles */
.section-title
  color: var(--color-primary)
  font-weight: 600
  font-size: 1.3rem
  margin-bottom: 20px
  padding-left: 12px
  border-left: 4px solid var(--color-primary)

/* Data Grid */
.data-grid
  display: grid
  gap: 16px
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)
  padding: 20px
  border-radius: 8px
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05)
  border: 1px solid #E0E0E0

.data-row
  display: grid
  grid-template-columns: 180px 1fr
  gap: 16px
  align-items: center
  padding: 8px 0
  border-bottom: 1px solid #F0F0F0

.data-row:last-child
  border-bottom: none

.text-weight-bold
  color: #2c3e50
  font-size: 0.95rem
  font-weight: 600

.data-value
  color: #34495e
  font-size: 0.95rem
  font-weight: 500

/* Details Container */
.details-container
  display: flex
  flex-direction: column
  gap: 16px

.detail-row
  display: flex
  flex-direction: column
  gap: 8px
  padding: 14px 16px
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)
  border-radius: 8px
  border: 1px solid #E0E0E0
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05)
  transition: all 0.3s ease

.detail-row:hover
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)
  transform: translateY(-2px)

.detail-label
  font-weight: 600
  color: #2C3E50
  font-size: 0.875rem
  text-transform: uppercase
  letter-spacing: 0.5px

.detail-value
  font-size: 1rem
  color: #34495e
  font-weight: 500

/* Badges */
:deep(.q-badge)
  padding: 6px 12px
  border-radius: 6px
  font-weight: 500
  font-size: 0.85rem

/* Botones */
:deep(.q-btn.boton-cerrar),
:deep(.q-btn.boton-enviar)
  border-radius: 8px
  padding: 10px 24px
  font-size: 14px
  font-weight: 600
  text-transform: none
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
  transition: all 0.3s ease

:deep(.q-btn.boton-cerrar:hover),
:deep(.q-btn.boton-enviar:hover)
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15)
  transform: translateY(-2px)

:deep(.q-btn.boton-enviar)
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover-dark) 100%)

:deep(.q-btn.boton-enviar:hover)
  background: linear-gradient(135deg, var(--color-primary-hover-dark) 0%, var(--color-primary) 100%)

/* Responsive */
@media (max-width: 768px)
  :deep(.q-dialog .q-card > .q-card__section:first-child)
    padding: 18px 20px

  :deep(.q-dialog .text-h6)
    font-size: 16px

  :deep(.q-dialog .q-card__section:not(:first-child):not(:last-child))
    padding: 20px 24px

  :deep(.q-dialog .q-card__section:last-child)
    padding: 18px 20px

  .section-title
    font-size: 1.2rem
    margin-bottom: 15px
    padding-left: 10px

  .data-grid
    gap: 12px
    padding: 15px

  .data-row
    grid-template-columns: 1fr
    gap: 8px
    padding: 6px 0

  .data-row .text-weight-bold
    margin-bottom: 4px

  .text-weight-bold
    font-size: 0.9rem

  .data-value
    font-size: 0.9rem

  .detail-row
    padding: 12px 14px

  .detail-label
    font-size: 0.8rem

  .detail-value
    font-size: 0.95rem

@media (max-width: 480px)
  :deep(.q-dialog .q-card > .q-card__section:first-child)
    padding: 16px 18px

  :deep(.q-dialog .text-h6)
    font-size: 15px

  :deep(.q-dialog .q-card__section:not(:first-child):not(:last-child))
    padding: 16px 20px

  :deep(.q-dialog .q-card__section:last-child)
    padding: 16px 18px

  .section-title
    font-size: 1.1rem !important
    margin-bottom: 12px
    padding-left: 8px

  .data-grid
    gap: 10px
    padding: 12px

  .data-row
    padding: 4px 0

  .text-weight-bold
    font-size: 0.85rem

  .data-value
    font-size: 0.85rem

  .details-container
    gap: 12px

  .detail-row
    padding: 10px 12px
    gap: 6px

  .detail-label
    font-size: 0.75rem

  .detail-value
    font-size: 0.9rem

  :deep(.q-btn.boton-cerrar),
  :deep(.q-btn.boton-enviar)
    padding: 10px 20px
    font-size: 13px

/* Ajustes específicos para modales grandes */
@media (min-width: 769px)
  :deep(.q-dialog__inner)
    padding: 24px

@media (max-width: 768px)
  :deep(.q-dialog__inner)
    padding: 16px

  :deep(.q-card)
    margin: 0

@media (max-width: 480px)
  :deep(.q-dialog__inner)
    padding: 12px

  :deep(.q-card)
    width: 98vw !important
    max-width: 98vw !important
    margin: 0 !important
</style>

