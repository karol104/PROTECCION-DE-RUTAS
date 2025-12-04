<template>
  <q-page class="q-pa-md apprentices-by-fiche-page">
    <div class="q-mb-lg">
      <BackButton />
    </div>

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Aprendices por Ficha" 
              description="Visualiza los aprendices asociados a la ficha seleccionada." 
            />
          </q-card-section>
        </q-card>

        <!-- Sección de Aprendices -->
        <div v-if="selectedFiche" class="apprentices-section">
          <q-card class="shadow-1">
            <q-card-section>
              <div class="section-header flex items-center justify-between q-mb-lg">
                <div>
                  <div class="text-h5 text-weight-bold">
                    <q-icon name="school" class="q-mr-sm" color="primary" />
                    Aprendices de la Ficha {{ selectedFiche }}
                  </div>
                  <div class="text-subtitle2 text-grey-7 q-mt-xs">
                    Total de aprendices: {{ pagination.rowsNumber }}
                  </div>
                </div>
                <div class="flex items-center q-gutter-sm">
                  <Button
                    label="Añadir Aprendiz"
                    custom-class="gradient-btn"
                    icon="person_add"
                    @click="openFormDialogApprentices"
                  />
                  <q-btn
                    flat
                    round
                    icon="close"
                    color="green-7"
                    size="md"
                    @click="clearSelection"
                  >
                    <q-tooltip>Limpiar búsqueda</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!-- Filtros -->
              <div class="filters-wrapper flex items-center justify-between q-mb-lg">
                <div class="filters-left flex items-center bg-white">
                  <div class="filter-item search">
                    <q-input
                      v-model="filtersData.search"
                      outlined
                      dense
                      clearable
                      debounce="600"
                      placeholder="Buscar por nombre o documento..."
                      class="custom-green-icons"
                    >
                      <template #prepend>
                        <q-icon name="search" color="green-7" />
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
                      class="custom-green-icons"
                    >
                      <template #prepend>
                        <q-icon name="filter_list" color="green-7" />
                      </template>
                    </q-select>
                  </div>
                </div>
              </div>

              <Table
                card
                :rows="rows"
                :columns="columns"
                v-model:pagination="pagination"
                :loading-table="loadingTable"
                row-key="_id"
                @request="handlePaginationRequestApprentices"
              >
                <template #body-cell-status="props">
                  <q-td :props="props">
                    <q-badge
                      :color="props.row.status === 0 ? 'positive' : 'negative'"
                      class="text-uppercase"
                    >
                      {{ props.row.status === 0 ? 'Activo' : 'Inactivo' }}
                    </q-badge>
                  </q-td>
                </template>

                <template #body-cell-options="props">
                  <q-td :props="props" class="text-center table-options">
                    <ButtonTableOptions
                      icon="visibility"
                      color="primary"
                      tooltip="Ver detalles"
                      @click="openDetailsDialogApprentices(props.row)"
                    />
                  </q-td>
                </template>

                <template #no-data>
                  <div class="q-pa-md flex flex-center column text-grey full-width">
                    <q-icon name="school" size="2.5em" color="grey-5" />
                    <div class="text-subtitle2 q-mt-sm">
                      No hay aprendices registrados en esta ficha
                    </div>
                  </div>
                </template>
              </Table>
            </q-card-section>
          </q-card>
        </div>

        <!-- Modal de Añadir Aprendiz -->
        <Modal
          v-model="showAddDialog"
          variant="edit"
          width="900px"
          max-width="95vw"
          persistent
          @update:model-value="handleAddDialogVisibility"
        >
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="person_add" class="q-mr-sm" />
                Agregar aprendiz a la ficha {{ selectedFiche }}
              </div>
              <div class="text-caption text-grey-7 q-mt-xs">
                Ingresa el documento del aprendiz. Si ya existe en otra ficha, se mostrará un error.
              </div>
            </div>
          </template>

          <template #body>
            <q-form ref="apprenticeFormRef" @submit.prevent="submitFormApprenticesCustom">
              <div class="modal-content-grid">
                <div class="modal-column">
                  <div class="section-title">Datos personales</div>
                  <q-select
                    v-model="formData.documentType"
                    filled
                    dense
                    label="Tipo de documento *"
                    :options="documentTypes"
                    emit-value
                    map-options
                    :rules="[val => !!val || 'El tipo de documento es requerido']"
                  />
                  <q-input
                    v-model="formData.documentNumber"
                    filled
                    dense
                    label="Número de documento *"
                    mask="##########"
                    :rules="[
                      val => !!val || 'El número de documento es requerido',
                      val => /^\d{7,10}$/.test(val) || 'Debe tener entre 7 y 10 dígitos'
                    ]"
                  />
                  <q-input
                    v-model="formData.firstName"
                    filled
                    dense
                    label="Nombres *"
                    :rules="[
                      val => !!val || 'Los nombres son requeridos',
                      val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras'
                    ]"
                  />
                  <q-input
                    v-model="formData.lastName"
                    filled
                    dense
                    label="Apellidos *"
                    :rules="[
                      val => !!val || 'Los apellidos son requeridos',
                      val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras'
                    ]"
                  />
                  <q-input
                    v-model="formData.phone"
                    filled
                    dense
                    label="Teléfono *"
                    mask="##########"
                    :rules="[
                      val => !!val || 'El teléfono es requerido',
                      val => /^3[0-9]{9}$/.test(val) || 'Debe tener 10 dígitos y comenzar con 3'
                    ]"
                  />
                </div>

                <div class="modal-column">
                  <div class="section-title">Información de contacto</div>
                  <q-input
                    v-model="formData.emailInstitutional"
                    filled
                    dense
                    label="Email institucional *"
                    type="email"
                    lazy-rules
                    :rules="[
                      val => !!val?.trim() || 'El email institucional es requerido',
                      val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((val || '').trim()) || 'Email inválido'
                    ]"
                  />
                  <q-input
                    v-model="formData.emailPersonal"
                    filled
                    dense
                    label="Email personal *"
                    type="email"
                    lazy-rules
                    :rules="[
                      val => !!val?.trim() || 'El email personal es requerido',
                      val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((val || '').trim()) || 'Email inválido'
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
                @click="closeFormDialogApprentices"
              />
              <Button
                label="Agregar Aprendiz"
                custom-class="gradient-btn"
                :loading="loading"
                @click="submitFormApprenticesCustom"
              />
            </div>
          </template>
        </Modal>

        <!-- Modal de Detalles del Aprendiz -->
        <Modal v-model="showDetailDialog" variant="view" width="900px" max-width="90vw">
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="person" class="q-mr-sm" />
                {{ selectedApprentice?.firstName || 'Aprendiz' }} {{ selectedApprentice?.lastName || '' }}
              </div>
            </div>
          </template>

          <template #body>
            <div v-if="selectedApprentice" class="modal-content-grid">
              <div class="modal-column">
                <div class="section-title">Datos personales</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Tipo de documento:</div>
                    <div class="data-value">{{ selectedApprentice?.documentType || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Número de documento:</div>
                    <div class="data-value">{{ selectedApprentice?.documentNumber || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Nombres:</div>
                    <div class="data-value">{{ selectedApprentice?.firstName || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Apellidos:</div>
                    <div class="data-value">{{ selectedApprentice?.lastName || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Teléfono:</div>
                    <div class="data-value">{{ selectedApprentice?.phone || '-' }}</div>
                  </div>
                </div>
              </div>

              <div class="modal-column">
                <div class="section-title">Información de contacto</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Email institucional:</div>
                    <div class="data-value">{{ selectedApprentice?.email?.institutional || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Email personal:</div>
                    <div class="data-value">{{ selectedApprentice?.email?.personal || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Ficha:</div>
                    <div class="data-value">{{ selectedFiche || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Estado:</div>
                    <div class="data-value">
                      <q-badge
                        :color="selectedApprentice?.status === 0 ? 'positive' : 'negative'"
                        class="text-uppercase"
                      >
                        {{ selectedApprentice?.status === 0 ? 'Activo' : 'Inactivo' }}
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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getData, postData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import { useEntityManager } from 'src/composables/useEntityManager'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'

// ==================== ROUTER ====================
const route = useRoute()
const router = useRouter()

// ==================== GESTIÓN DE FICHAS ====================
const selectedFiche = ref(null)
const fichesMap = ref({})
const apprenticeFormRef = ref(null)

const { error, success } = useNotifications()

// ==================== CONFIGURACIÓN DEL COMPOSABLE ====================

/**
 * Función que retorna el objeto por defecto del formulario de aprendiz
 */
const getDefaultFormData = () => ({
  _id: '',
  documentType: '',
  documentNumber: '',
  firstName: '',
  lastName: '',
  phone: '',
  emailInstitutional: '',
  emailPersonal: '',
  fiche: ''
})

/**
 * Endpoints del API para aprendices
 */
const endpoints = {
  list: '/apprentices/listApprentice',
  create: '/apprentices/saveApprentice'
}

/**
 * Mensajes personalizados
 */
const customMessages = {
  listError: 'Error al listar aprendices',
  createSuccess: 'Aprendiz agregado correctamente',
  createError: 'Error al agregar el aprendiz',
  noData: 'No hay aprendices registrados en esta ficha'
}

/**
 * Función personalizada para construir el payload
 * IMPORTANTE: El backend espera el NÚMERO de ficha, no el ID
 */
const buildApprenticePayload = (formDataValue) => {
  // Siempre enviar el número de ficha (selectedFiche.value), NO el ID
  const ficheNumber = selectedFiche.value
  
  return {
    documentNumber: formDataValue.documentNumber?.trim(),
    documentType: formDataValue.documentType,
    recordNumber: [{ fiche: ficheNumber }],
    firstName: formDataValue.firstName?.trim(),
    lastName: formDataValue.lastName?.trim(),
    email: {
      institutional: formDataValue.emailInstitutional?.trim(),
      personal: formDataValue.emailPersonal?.trim()
    },
    phone: formDataValue.phone?.trim(),
    password: formDataValue.documentNumber?.trim()
  }
}

/**
 * Extrae el valor de la ficha desde un registro
 */
const extractFicheValue = (record) => {
  if (!record || !record.fiche) return null
  
  if (typeof record.fiche === 'string' || typeof record.fiche === 'number') {
    return record.fiche.toString().trim()
  }
  
  if (typeof record.fiche === 'object') {
    return (record.fiche.number || record.fiche.code || record.fiche._id || record.fiche.fiche)?.toString().trim()
  }
  
  return (record.number || record.code)?.toString().trim()
}

/**
 * Filtra por ficha, búsqueda y estado del lado del cliente
 */
const processApprenticeResponse = (response) => {
  const allApprentices = response?.msg?.Apprentice || []
  
  if (!selectedFiche.value) {
    return {
      data: [],
      total: 0
    }
  }
  
  // 1. Filtrar aprendices por la ficha seleccionada
  let apprenticesByFiche = allApprentices.filter(apprentice => {
    if (!apprentice.recordNumber || !Array.isArray(apprentice.recordNumber)) {
      return false
    }
    
    return apprentice.recordNumber.some(record => {
      const ficheValue = extractFicheValue(record)
      return ficheValue === selectedFiche.value.toString().trim()
    })
  })
  
  // 2. Filtrar por búsqueda (nombre o documento)
  const searchTerm = filtersData.value.search?.trim().toLowerCase()
  if (searchTerm) {
    apprenticesByFiche = apprenticesByFiche.filter(apprentice => {
      const fullName = `${apprentice.firstName || ''} ${apprentice.lastName || ''}`.toLowerCase()
      const document = (apprentice.documentNumber || '').toString().toLowerCase()
      return fullName.includes(searchTerm) || document.includes(searchTerm)
    })
  }
  
  // 3. Filtrar por estado
  if (filtersData.value.status !== '' && filtersData.value.status !== null) {
    apprenticesByFiche = apprenticesByFiche.filter(apprentice => 
      apprentice.status === filtersData.value.status
    )
  }
  
  // 4. Paginación del lado del cliente
  const { page, rowsPerPage } = pagination.value
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedApprentices = apprenticesByFiche.slice(startIndex, endIndex)
  
  return {
    data: paginatedApprentices,
    total: apprenticesByFiche.length
  }
}

// ==================== INICIALIZAR COMPOSABLE ====================
const {
  loading,
  loadingTable,
  rows,
  showAddDialog,
  showDetailDialog,
  selectedEntity,
  formData,
  filtersData,
  pagination,
  handlePaginationRequest,
  resetPaginationState,
  openFormDialog,
  closeFormDialog,
  openDetailsDialog,
  closeDetailsDialog,
  handleAddDialogVisibility,
  resetForm,
  fetchEntities,
  submitForm
} = useEntityManager({
  entityName: 'aprendiz',
  entityNamePlural: 'apprentices',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  buildPayload: buildApprenticePayload,
  processResponse: processApprenticeResponse
})

// ==================== ALIAS CON NOMBRES ESTANDARIZADOS ====================
const selectedApprentice = selectedEntity
const openFormDialogApprentices = openFormDialog
const closeFormDialogApprentices = closeFormDialog
const openDetailsDialogApprentices = openDetailsDialog
const closeDetailsDialogApprentices = closeDetailsDialog
const handlePaginationRequestApprentices = handlePaginationRequest
const fetchApprentices = fetchEntities

// ==================== FUNCIÓN PERSONALIZADA PARA FETCH ====================
const fetchApprenticesByFiche = async () => {
  if (!selectedFiche.value) {
    rows.value = []
    pagination.value.rowsNumber = 0
    return
  }
  
  loadingTable.value = true
  
  try {
    const params = {
      page: 1,
      limit: 1000
    }

    const response = await getData(endpoints.list, { params })
    const processed = processApprenticeResponse(response)
    rows.value = processed.data
    pagination.value.rowsNumber = processed.total
  } catch (err) {
    const message = err?.response?.data?.msg || err?.message || customMessages.listError
    error(message)
    rows.value = []
    pagination.value.rowsNumber = 0
  } finally {
    loadingTable.value = false
  }
}

const checkIfApprenticeExists = async (documentNumber) => {
  try {
    const params = { page: 1, limit: 10, search: documentNumber }
    const response = await getData('/apprentices/listApprentice', { params })
    const apprentices = response?.msg?.Apprentice || []
    return apprentices.find(a => a.documentNumber?.toString() === documentNumber.toString()) || null
  } catch (err) {
    return null
  }
}

const submitFormApprenticesCustom = async () => {
  if (apprenticeFormRef.value) {
    const isValid = await apprenticeFormRef.value.validate()
    if (!isValid) {
      error('Por favor complete todos los campos requeridos correctamente')
      return
    }
  }

  // Validar que haya una ficha seleccionada
  if (!selectedFiche.value) {
    error('No hay una ficha seleccionada. Por favor selecciona una ficha primero.')
    return
  }

  loading.value = true
  
  const existingApprentice = await checkIfApprenticeExists(formData.value.documentNumber?.trim())
  
  if (existingApprentice) {
    const currentFiches = existingApprentice.recordNumber?.map(extractFicheValue).filter(Boolean)
    
    if (currentFiches && currentFiches.length > 0) {
      const fichesText = currentFiches.join(', ')
      error(`El aprendiz con documento ${formData.value.documentNumber} ya está registrado en la(s) ficha(s): ${fichesText}. Un aprendiz solo puede estar en una ficha a la vez.`)
      loading.value = false
      return
    }
  }
  
  const payload = buildApprenticePayload(formData.value)

  try {
    const response = await postData(endpoints.create, payload)
    const successMessage = response?.msg || response?.message || response?.data?.msg || customMessages.createSuccess
    success(successMessage)
    
    showAddDialog.value = false
    handleAddDialogVisibility(false)
    
    setTimeout(async () => {
      await fetchApprenticesByFiche()
    }, 300)
    
  } catch (err) {
    if (err?.response?.status === 500) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const wasCreated = await checkIfApprenticeExists(formData.value.documentNumber?.trim())
      
      if (wasCreated) {
        success('Aprendiz agregado correctamente')
        showAddDialog.value = false
        handleAddDialogVisibility(false)
        
        setTimeout(async () => {
          await fetchApprenticesByFiche()
        }, 300)
        
        loading.value = false
        return
      }
    }
    
    let errorMessage = customMessages.createError
    
    if (err?.response?.data?.errors) {
      const errors = err.response.data.errors
      
      if (Array.isArray(errors)) {
        const errorMessages = errors.map(e => {
          if (typeof e === 'string') return e
          if (e.msg) return e.msg
          if (e.message) return e.message
          return JSON.stringify(e)
        })
        errorMessage = errorMessages.join(', ')
      } else if (typeof errors === 'string') {
        errorMessage = errors
      }
    } else if (err?.response?.data?.msg) {
      errorMessage = err.response.data.msg
    } else if (err?.message) {
      errorMessage = err.message
    }
    
    error(errorMessage)
  } finally {
    loading.value = false
  }
}

// ==================== DATOS ESPECÍFICOS DE APRENDICES ====================
const documentTypes = [
  { label: 'Cédula de Ciudadanía', value: 'CC' },
  { label: 'Tarjeta de Identidad', value: 'TI' },
  { label: 'Cédula de Extranjería', value: 'CE' }
]

const statusAvailable = [
  { label: 'Todos los estados', value: '' },
  { label: 'Activo', value: 0 },
  { label: 'Inactivo', value: 1 }
]

const columns = [
  { name: 'documentType', label: 'Tipo Doc.', align: 'center', field: 'documentType' },
  { name: 'documentNumber', label: 'N° Documento', align: 'center', field: 'documentNumber' },
  { name: 'firstName', label: 'Nombres', align: 'center', field: 'firstName' },
  { name: 'lastName', label: 'Apellidos', align: 'center', field: 'lastName' },
  { name: 'phone', label: 'Teléfono', align: 'center', field: 'phone' },
  { name: 'status', label: 'Estado', align: 'center', field: 'status' },
  { name: 'options', label: 'Acciones', align: 'center' }
]

// ==================== NAVEGACIÓN ====================
const clearSelection = () => {
  selectedFiche.value = null
  filtersData.value.search = ''
  filtersData.value.status = ''
  rows.value = []
  pagination.value.rowsNumber = 0
  pagination.value.page = 1
  
  // Limpiar el query de la URL
  router.replace({ query: {} })
}

const fetchFicheIdByNumber = async (ficheNumber) => {
  try {
    const response = await getData(`/fiches/listFiche?number=${ficheNumber}`)
    const fiches = response?.msg || []
    
    if (Array.isArray(fiches) && fiches.length > 0) {
      const fiche = fiches[0]
      fichesMap.value[ficheNumber] = fiche._id || fiche.id
      return fiche._id || fiche.id
    }
    return null
  } catch (err) {
    console.error('Error al obtener ID de ficha:', err)
    return null
  }
}

// ==================== WATCHERS ====================
watch(() => route.query.recordNumber, async (newRecordNumber) => {
  if (newRecordNumber) {
    selectedFiche.value = newRecordNumber
    await fetchFicheIdByNumber(newRecordNumber)
    await fetchApprenticesByFiche()
  }
}, { immediate: true })

watch(() => filtersData.value.search, () => {
  resetPaginationState()
  fetchApprenticesByFiche()
})

watch(() => filtersData.value.status, () => {
  resetPaginationState()
  fetchApprenticesByFiche()
})

// ==================== LIFECYCLE ====================
onMounted(async () => {
  if (route.query.recordNumber) {
    selectedFiche.value = route.query.recordNumber
    await fetchFicheIdByNumber(route.query.recordNumber)
    await fetchApprenticesByFiche()
  }
})
</script>

<style lang="scss" scoped>
.apprentices-by-fiche-page {
  background: #f5f7fb;
  min-height: 100vh;
}

.hero-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%);
}

.apprentices-section {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 16px;
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

// Estilos para iconos verdes en inputs
:deep(.custom-green-icons) {
  .q-field__append .q-icon {
    color: #4caf50 !important;
  }
  
  .q-field__append button:hover .q-icon {
    color: #388e3c !important;
  }
}

.table-options {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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

}

@media (max-width: 480px) {
  .apprentices-by-fiche-page {
    padding: 20px 10px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>