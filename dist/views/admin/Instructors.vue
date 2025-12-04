<template>
  <q-page class="q-pa-md instructors-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Gestión y Control de Instructores"
              description="Administra perfiles, horarios y asignaciones de instructores." 
            />
          </q-card-section>
        </q-card>

        <div class="filters-wrapper flex items-center justify-between q-mb-lg">
          <div class="filters-left flex items-center bg-white">
            <div class="filter-item search">
              <q-input
                v-model="filtersData.search"
                outlined
                dense
                clearable
                debounce="600"
                placeholder="Buscar por Documento, Nombre, Email (Institucional o Personal), Programa"
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
          :rows="rowsInstructors"
          :columns="columns"
          v-model:pagination="pagination"
          :loanding-table="loadingTable"
          row-key="_id"
          @request="handlePaginationRequest"
        >
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)">
                {{ getStatusLabel(props.row.status) }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-acciones="props">
            <q-td :props="props" class="text-center table-options">
              <ButtonTableOptions
                icon="visibility"
                color="grey"
                tooltip="Ver"
                @click="openDetailsDialogInstructors(props.row)"
              />
            </q-td>
          </template>

          <template #no-data>
            <div class="q-pa-md flex flex-center column text-grey full-width">
              <q-icon name="group" size="2.5em" color="positive" />
              <div class="text-subtitle2 q-mt-sm">
                No hay instructores registrados
              </div>
            </div>
          </template>
        </Table>

        <!-- Modal de Detalles -->
        <Modal v-model="showDetailDialog" width="1100px" max-width="98vw">
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="person" class="q-mr-sm" />
                {{ selectedInstructors?.name || 'Instructor' }}
              </div>
            </div>
          </template>

          <template #body>
            <div v-if="selectedInstructors" class="modal-content-grid">
              <div class="modal-column">
                <div class="section-title">Información Personal</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Nombre:</div>
                    <div class="data-value">{{ selectedInstructors?.name || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Documento:</div>
                    <div class="data-value">{{ selectedInstructors?.numdocument || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Email:</div>
                    <div class="data-value">{{ selectedInstructors?.email || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Teléfono:</div>
                    <div class="data-value">{{ selectedInstructors?.phone || '-' }}</div>
                  </div>
                </div>
              </div>

              <div class="modal-column">
                <div class="section-title">Información Académica</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Programa:</div>
                    <div class="data-value">{{ selectedInstructors?.knowledge || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Estado:</div>
                    <div class="data-value">
                      <q-badge :color="getStatusColor(selectedInstructors?.status)">
                        {{ getStatusLabel(selectedInstructors?.status) }}
                      </q-badge>
                    </div>
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
import { onMounted } from 'vue'
import { useEntityManager } from 'src/composables/useEntityManager'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'


const STATUS = { ACTIVE: 0, INACTIVE: 1 }


const getDefaultFormData = () => ({
  _id: '',
  name: '',
  numdocument: '',
  email: '',
  phone: '',
  status: STATUS.ACTIVE,
  knowledge: ''
})

// 2️⃣ API endpoints
const endpoints = {
  list: '/instructors/listInstructor',
  update: (id) => `/instructors/updateInstructor/${id}`
}

// 3️⃣ Custom messages
const customMessages = {
  listError: 'Error al cargar instructores',
  noData: 'No hay instructores registrados'
}

// 4️⃣ Function to process API response

const processInstructorsResponse = (response) => {
  const payload = response?.msg ?? response?.data ?? response ?? {}
  
  const instructorsArray = Array.isArray(payload)
    ? payload
    : payload?.instructores || payload?.instructors || payload?.list || []
  
  return {
    data: Array.isArray(instructorsArray) ? instructorsArray : [],
    total: payload?.totalDocuments ?? payload?.total ?? payload?.totalInstructors ?? instructorsArray.length
  }
}

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
  entityName: 'instructor',
  entityNamePlural: 'instructors',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processInstructorsResponse
})

// ==================== ALIAS WITH STANDARDIZED NAMES ====================

// States
const rowsInstructors = rows
const selectedInstructors = selectedEntity

// Functions for modals
const openDetailsDialogInstructors = openDetailsDialog

// Functions for API
const fetchInstructors = fetchEntities


const statusAvailable = [
  { label: 'Todos los estados', value: '' },
  { label: 'Activo', value: STATUS.ACTIVE },
  { label: 'Inactivo', value: STATUS.INACTIVE }
]

const columns = [
  { name: 'numdocument', align: 'left', label: 'Cédula', field: 'numdocument', sortable: true },
  { name: 'name', align: 'left', label: 'Nombre', field: 'name', sortable: true },
  { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true },
  { name: 'knowledge', align: 'left', label: 'Programa', field: 'knowledge', sortable: true },
  { name: 'status', align: 'center', label: 'Estado', field: 'status' },
  { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' }
]


function getStatusLabel(status) {
  return status === STATUS.ACTIVE ? 'Activo' : 'Inactivo'
}

function getStatusColor(status) {
  return status === STATUS.ACTIVE ? 'positive' : 'negative'
}


onMounted(async () => {
  await fetchInstructors()
})
</script>

<style lang="scss" scoped>
.instructors-page {
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
  flex: 1;
  min-width: 400px;
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

.modal-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 10px;
}

.modal-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 1.4rem;
  margin-bottom: 22px;
  padding-left: 14px;
  border-left: 5px solid var(--color-primary);
  margin-top: 0;
}

.data-grid {
  display: grid;
  gap: 20px;
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #E8E8E8;
  margin-bottom: 20px;
}

.data-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 2px solid #F0F0F0;
}

.data-row:last-child {
  border-bottom: none;
}

.text-weight-bold {
  color: #2c3e50;
  font-size: 1.05rem;
  font-weight: 600;
}

.data-value {
  color: #34495e;
  font-size: 1.05rem;
  font-weight: 500;
  word-break: break-word;
}

@media (max-width: 1024px) {
  .filters-left {
    width: 100%;
  }
  
  .filter-item.search {
    min-width: 300px;
  }

  .modal-content-grid {
    gap: 24px;
  }

  .data-row {
    grid-template-columns: 180px 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .filters-wrapper {
    flex-direction: column;
  }
  
  .filter-item,
  .filter-item.search,
  .filter-item.status {
    width: 100%;
    min-width: unset;
    flex: none;
  }

  .modal-content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 5px;
  }

  .data-row {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 10px 0;
  }

  .data-row .text-weight-bold {
    margin-bottom: 4px;
  }

  .text-weight-bold {
    font-size: 0.95rem;
  }

  .data-value {
    font-size: 0.95rem;
  }

  .section-title {
    font-size: 1.25rem;
    margin-bottom: 16px;
    padding-left: 12px;
    border-left: 4px solid var(--color-primary);
  }

  .data-grid {
    gap: 16px;
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .filters-left {
    padding: 10px 12px;
  }
  
  .section-title {
    font-size: 1.15rem;
    margin-bottom: 14px;
    padding-left: 10px;
  }

  .data-grid {
    padding: 16px;
  }

  .text-weight-bold {
    font-size: 0.9rem;
  }

  .data-value {
    font-size: 0.9rem;
  }
}

@media (max-width: 360px) {
  .filters-left {
    padding: 8px 10px;
  }
  
  .section-title {
    font-size: 1.05rem;
    margin-bottom: 12px;
    padding-left: 8px;
  }

  .data-grid {
    padding: 14px;
  }
}
</style>