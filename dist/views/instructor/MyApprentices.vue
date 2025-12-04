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
              description="Busca una ficha y visualiza los aprendices asociados." 
            />
          </q-card-section>
        </q-card>

        <!-- Buscador de Fichas -->
        <div class="container q-mb-xl">
          <div class="row justify-center">
            <div class="col-12 col-md-8">
              <q-select
                v-model="selectedFiche"
                :options="filteredFiches"
                :loading="loadingFiches"
                use-input
                input-debounce="300"
                placeholder="Buscar número de ficha..."
                outlined
                class="search-select"
                behavior="menu"
                @filter="handleFilterFiches"
                @update:model-value="handleSelectFiche"
              >
                <template #prepend>
                  <q-icon name="search" color="grey-6" size="20px" />
                </template>

                

                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No hay resultados
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>
        </div>

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
                    color="grey-7"
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
                      @update:model-value="handleSearchChangeCustom"
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
                      @update:model-value="handleStatusChangeCustom"
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
                :rows="rowsApprentices"
                :columns="columns"
                v-model:pagination="pagination"
                :loading-table="loadingTable"
                row-key="_id"
                @request="handlePaginationRequestCustom"
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
            <Button
              label="Cancelar"
              custom-class="boton-cerrar"
              @click="closeFormDialogApprentices"
            />
            <Button
              label="Guardar"
              custom-class="gradient-btn"
              :loading="loading"
              @click="submitFormApprenticesCustom"
            />
          </template>
        </Modal>

        <!-- Modal de Detalles del Aprendiz -->
        <Modal v-model="showDetailDialog" width="900px" max-width="90vw">
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="person" class="q-mr-sm" />
                {{ selectedApprentice?.firstName }} {{ selectedApprentice?.lastName }}
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
import { ref, onMounted } from 'vue'
import { getData, postData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import { useEntityManager } from 'src/composables/useEntityManager'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'

// ==================== GESTIÓN DE FICHAS ====================
const selectedFiche = ref(null)
const allFiches = ref([])
const filteredFiches = ref([])
const loadingFiches = ref(false)
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
 * El payload debe tener una estructura específica con recordNumber y email como objetos
 */
const buildApprenticePayload = (formDataValue) => {
  const ficheId = fichesMap.value[selectedFiche.value]
  const ficheValue = ficheId || selectedFiche.value
  
  return {
    documentNumber: formDataValue.documentNumber?.trim(),
    documentType: formDataValue.documentType,
    recordNumber: [{ fiche: ficheValue }],
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

/*
 * Filtra por ficha, búsqueda y estado del lado del cliente
 */
const processApprenticeResponse = (response) => {
  const allApprentices = response?.msg?.Apprentice || []
  
  // Si no hay ficha seleccionada, retornar vacío
  if (!selectedFiche.value) {
    return {
      data: [],
      total: 0
    }
  }
  
  //  Filtrar aprendices por la ficha seleccionada
  let apprenticesByFiche = allApprentices.filter(apprentice => {
    if (!apprentice.recordNumber || !Array.isArray(apprentice.recordNumber)) {
      return false
    }
    
    return apprentice.recordNumber.some(record => {
      const ficheValue = extractFicheValue(record)
      return ficheValue === selectedFiche.value.toString().trim()
    })
  })
  
  //  Filtrar por búsqueda (nombre o documento)
  const searchTerm = filtersData.value.search?.trim().toLowerCase()
  if (searchTerm) {
    apprenticesByFiche = apprenticesByFiche.filter(apprentice => {
      const fullName = `${apprentice.firstName || ''} ${apprentice.lastName || ''}`.toLowerCase()
      const document = (apprentice.documentNumber || '').toString().toLowerCase()
      return fullName.includes(searchTerm) || document.includes(searchTerm)
    })
  }
  
  // Filtrar por estado
  if (filtersData.value.status !== '' && filtersData.value.status !== null) {
    apprenticesByFiche = apprenticesByFiche.filter(apprentice => 
      apprentice.status === filtersData.value.status
    )
  }
  
  // Paginación del lado del cliente
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
  // Estados
  loading,
  loadingTable,
  rows,
  showAddDialog,
  showDetailDialog,
  selectedEntity,
  formData,
  filtersData,
  pagination,

  // Funciones de paginación
  handlePaginationRequest,
  resetPaginationState,

  // Funciones de filtros
  handleSearchChange,
  handleStatusChange,

  // Funciones de modales
  openFormDialog,
  closeFormDialog,
  openDetailsDialog,
  handleAddDialogVisibility,

  // Funciones de formulario
  resetForm,

  // Funciones de API
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


// Estados
const rowsApprentices = rows
const selectedApprentice = selectedEntity

// Funciones de modales
const openFormDialogApprentices = openFormDialog
const closeFormDialogApprentices = closeFormDialog
const openDetailsDialogApprentices = openDetailsDialog

// Funciones de API
const fetchApprentices = fetchEntities
const submitFormApprentices = submitForm

// ==================== FUNCIÓN PERSONALIZADA PARA FETCH ====================


const fetchApprenticesByFiche = async () => {
  if (!selectedFiche.value) {
    rowsApprentices.value = []
    pagination.value.rowsNumber = 0
    return
  }
  
  loadingTable.value = true
  
  try {
    // Obtener TODOS los aprendices sin filtros de servidor
    const params = {
      page: 1,
      limit: 10000
    }

    const response = await getData(endpoints.list, { params })

   
    console.log('Response from API:', response)
    console.log('Aprendices recibidos:', response?.msg?.Apprentice?.length || 0)

    // Procesar respuesta con todos los filtros del lado del cliente
    const processed = processApprenticeResponse(response)
    

    console.log('Aprendices procesados:', processed.data.length)
    console.log('Total después de filtrar:', processed.total)
    
    rowsApprentices.value = processed.data
    pagination.value.rowsNumber = processed.total
  } catch (err) {
    const message = err?.response?.data?.msg || err?.message || customMessages.listError
    error(message)
    rowsApprentices.value = []
    pagination.value.rowsNumber = 0
  } finally {
    loadingTable.value = false
  }
}
/**
 * Sobrescribe handlePaginationRequest para usar paginación del lado del cliente
 */
const handlePaginationRequestCustom = (props) => {
  if (!props?.pagination) return
  pagination.value = {
    page: props.pagination.page,
    rowsPerPage: props.pagination.rowsPerPage,
    rowsNumber: props.pagination.rowsNumber ?? pagination.value.rowsNumber
  }
  fetchApprenticesByFiche()
}

/**
 * Sobrescribe handleSearchChange
 */
const handleSearchChangeCustom = () => {
  resetPaginationState()
  fetchApprenticesByFiche()
}

/**
 * Sobrescribe handleStatusChange
 */
const handleStatusChangeCustom = () => {
  resetPaginationState()
  fetchApprenticesByFiche()
}

/**
 * Verifica si un aprendiz ya existe en el sistema
 */
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

/**
 * Sobrescribe submitForm para recargar con fetchApprenticesByFiche
 * Incluye validación de aprendiz existente y manejo completo de errores
 */
const submitFormApprenticesCustom = async () => {
  // Validar el formulario primero
  if (apprenticeFormRef.value) {
    const isValid = await apprenticeFormRef.value.validate()
    if (!isValid) {
      error('Por favor complete todos los campos requeridos correctamente')
      return
    }
  }

  loading.value = true
  
  // Verificar si el aprendiz ya existe
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
  
  // Construir payload
  const payload = buildApprenticePayload(formData.value)

  try {
    const response = await postData(endpoints.create, payload)
    
    const successMessage = response?.msg || response?.message || response?.data?.msg || customMessages.createSuccess
    success(successMessage)
    
    showAddDialog.value = false
    handleAddDialogVisibility(false)
    
    // Esperar un momento antes de recargar para asegurar que el servidor procesó
    setTimeout(async () => {
      await fetchApprenticesByFiche()
    }, 300)
    
  } catch (err) {
    // Manejo especial para errores 500 (a veces el servidor responde 500 pero sí creó el registro)
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
    
    // Manejo de errores
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

// Tipos de documento
const documentTypes = [
  { label: 'Cédula de Ciudadanía', value: 'CC' },
  { label: 'Tarjeta de Identidad', value: 'TI' },
  { label: 'Cédula de Extranjería', value: 'CE' }
]

// Opciones de filtro de estado
const statusAvailable = [
  { label: 'Todos los estados', value: '' },
  { label: 'Activo', value: 0 },
  { label: 'Inactivo', value: 1 }
]

// Columnas de la tabla
const columns = [
  { name: 'documentType', label: 'Tipo Doc.', align: 'center', field: 'documentType' },
  { name: 'documentNumber', label: 'N° Documento', align: 'center', field: 'documentNumber' },
  { name: 'firstName', label: 'Nombres', align: 'center', field: 'firstName' },
  { name: 'lastName', label: 'Apellidos', align: 'center', field: 'lastName' },
  { name: 'phone', label: 'Teléfono', align: 'center', field: 'phone' },
  { name: 'status', label: 'Estado', align: 'center', field: 'status' },
  { name: 'options', label: 'Acciones', align: 'center' }
]

// ==================== FUNCIONES ESPECÍFICAS DE FICHAS ====================

/**
 * Filtra las fichas según el input del usuario
 */
const handleFilterFiches = (val, update) => {
  update(() => {
    if (val === '') {
      filteredFiches.value = [...allFiches.value]
    } else {
      const needle = val.toLowerCase()
      filteredFiches.value = allFiches.value.filter(
        fiche => fiche.toLowerCase().includes(needle)
      )
    }
  })
}

/**
 * Maneja la selección de una ficha
 */
const handleSelectFiche = async (ficheNumber) => {
  if (!ficheNumber) return
  
  selectedFiche.value = ficheNumber
  
  // Resetear paginación
  resetPaginationState()
  
  // Cargar aprendices de esa ficha
  await fetchApprenticesByFiche()
}

/**
 * Limpia la selección de ficha
 */
const clearSelection = () => {
  selectedFiche.value = null
  filtersData.value.search = ''
  filtersData.value.status = ''
  rowsApprentices.value = []
  pagination.value.rowsNumber = 0
  pagination.value.page = 1
}

/**
 * Carga la lista de fichas disponibles
 */
const fetchFiches = async () => {
  loadingFiches.value = true
  
  try {
    const params = { page: 1, limit: 1000 }
    const response = await getData('/fiches/listFiche', { params })
    const fiches = response?.msg?.fiches || response?.msg || []
    
    fichesMap.value = {}
    
    if (Array.isArray(fiches)) {
      allFiches.value = fiches.map(fiche => {
        let ficheNumber = null
        let ficheId = null
        
        if (fiche && typeof fiche === 'object') {
          ficheNumber = fiche.number || fiche.fiche || fiche.code
          ficheId = fiche._id || fiche.id
          
          if (ficheNumber && ficheId) {
            fichesMap.value[ficheNumber.toString()] = ficheId
          }
          
          if (ficheNumber) {
            return ficheNumber.toString()
          }
        } else if (fiche) {
          return fiche.toString()
        }
        return null
      }).filter(f => f)
      
      // Agregar fichas especiales si no están
      const fichesEspeciales = ['2926076', '2926065', '2926034', '2589667']
      fichesEspeciales.forEach(ficheEspecial => {
        if (!allFiches.value.includes(ficheEspecial)) {
          allFiches.value.push(ficheEspecial)
        }
      })
      
      allFiches.value.sort((a, b) => parseInt(a) - parseInt(b))
      filteredFiches.value = [...allFiches.value]
    }
    
    // Fallback a fichas especiales si no hay datos
    if (allFiches.value.length === 0) {
      allFiches.value = ['2926076', '2926065', '2926034', '2589667']
      filteredFiches.value = [...allFiches.value]
    }
  } catch (err) {
    error('Error al cargar las fichas disponibles')
    allFiches.value = ['2926076', '2926065', '2926034', '2589667']
    filteredFiches.value = [...allFiches.value]
  } finally {
    loadingFiches.value = false
  }
}



onMounted(async () => {
  await fetchFiches()
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

.container {
  max-width: 800px;
  margin: 0 auto;
}

.search-select {
  width: 100%;
}

.suggestions-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.fiche-item {
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  font-weight: 500;

  &:hover {
    background-color: #f0f7ff;
    transform: translateX(4px);
  }
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
}
</style>