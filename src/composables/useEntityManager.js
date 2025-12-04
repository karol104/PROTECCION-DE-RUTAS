// ========================================
// GENERIC COMPOSABLE FOR ENTITY MANAGEMENT
// ========================================
// Location: src/composables/useEntityManager.js

import { ref } from 'vue'
import { getData, postData, putData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'

/**
 * Generic composable to handle CRUD operations for any entity
 * 
 * @param {Object} config - Composable configuration
 * @param {string} config.entityName - Singular entity name (e.g: "company", "instructor")
 * @param {string} config.entityNamePlural - Plural entity name (e.g: "companies", "instructors")
 * @param {Function} config.getDefaultFormData - Function that returns the default form object
 * @param {Object} config.endpoints - Object with API endpoints
 * @param {string} config.endpoints.list - Endpoint to list entities
 * @param {string} config.endpoints.create - Endpoint to create entity
 * @param {Function} config.endpoints.update - Function that returns update endpoint (receives ID)
 * @param {Function} config.endpoints.activate - Function that returns activate endpoint (receives ID)
 * @param {Function} config.endpoints.deactivate - Function that returns deactivate endpoint (receives ID)
 * @param {string} config.endpoints.bulkUpload - Bulk upload endpoint (optional)
 * @param {Object} config.messages - Custom messages (optional)
 * @param {Function} config.buildPayload - Custom function to build payload (optional)
 * @param {Function} config.processResponse - Function to process API response (optional)
 * @param {Function} config.buildFilterParams - Custom function to build filter params (optional)
 */
export function useEntityManager(config) {
  // ==================== CONFIGURATION VALIDATION ====================
  if (!config.entityName || !config.entityNamePlural) {
    throw new Error('entityName and entityNamePlural are required in configuration')
  }
  if (!config.endpoints || !config.endpoints.list) {
    throw new Error('At least the "list" endpoint is required in configuration')
  }
  if (!config.getDefaultFormData || typeof config.getDefaultFormData !== 'function') {
    throw new Error('getDefaultFormData function is required in configuration')
  }

  // ==================== CONFIGURATION ====================
  const {
    entityName,
    entityNamePlural,
    getDefaultFormData,
    endpoints: apiEndpoints,
    messages = {},
    buildPayload = null,
    processResponse = null,
    buildFilterParams = null
  } = config

  // Default messages (can be overridden)
  const defaultMessages = {
    listError: `Error al listar ${entityNamePlural}`,
    createSuccess: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} creada correctamente`,
    createError: `Error al crear ${entityName}`,
    updateSuccess: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} actualizada correctamente`,
    updateError: `Error al actualizar ${entityName}`,
    statusSuccess: 'Estado actualizado correctamente',
    statusError: 'No fue posible cambiar el estado',
    bulkUploadSuccess: 'Carga masiva realizada correctamente',
    bulkUploadError: 'Error al cargar el archivo',
    noData: `No hay ${entityNamePlural} registradas`
  }

  const finalMessages = { ...defaultMessages, ...messages }
  const { error, success } = useNotifications()

  // ==================== REACTIVE STATES ====================
  const loading = ref(false)
  const loadingTable = ref(false)
  const rows = ref([])
  const showAddDialog = ref(false)
  const showDetailDialog = ref(false)
  const showUploadDialog = ref(false)
  const isEditMode = ref(false)
  const selectedEntity = ref(null)
  const selectedFile = ref(null)

  const formData = ref(getDefaultFormData())

  const filtersData = ref({
    search: '',
    status: ''
  })

  const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0
  })

  // ==================== PAGINATION FUNCTIONS ====================
  
  /**
   * Handles page change request from table
   */
  const handlePaginationRequest = (props) => {
    if (!props?.pagination) return
    pagination.value = {
      page: props.pagination.page,
      rowsPerPage: props.pagination.rowsPerPage,
      rowsNumber: props.pagination.rowsNumber ?? pagination.value.rowsNumber
    }
    fetchEntities()
  }

  /**
   * Resets pagination to page 1
   */
  const resetPaginationState = () => {
    pagination.value.page = 1
  }

  // ==================== FILTER FUNCTIONS ====================
  
  /**
   * Handles changes in search field
   */
  const handleSearchChange = () => {
    resetPaginationState()
    fetchEntities()
  }

  /**
   * Handles changes in status filter
   */
  const handleStatusChange = () => {
    resetPaginationState()
    fetchEntities()
  }

  /**
   * Applies multiple filters at once
   */
  const applyFilters = () => {
    resetPaginationState()
    fetchEntities()
  }

  /**
   * Clears all filters
   */
  const clearFilters = () => {
    filtersData.value = {
      search: '',
      status: ''
    }
    resetPaginationState()
    fetchEntities()
  }

  // ==================== MODAL FUNCTIONS ====================
  
  /**
   * Opens form modal to create new entity
   */
  const openFormDialog = () => {
    isEditMode.value = false
    resetForm()
    showAddDialog.value = true
  }

  /**
   * Closes form modal
   */
  const closeFormDialog = () => {
    showAddDialog.value = false
    handleAddDialogVisibility(false)
  }

  /**
   * Opens details modal for an entity
   */
  const openDetailsDialog = (row) => {
    selectedEntity.value = row
    showDetailDialog.value = true
  }

  /**
   * Closes details modal
   */
  const closeDetailsDialog = () => {
    showDetailDialog.value = false
    selectedEntity.value = null
  }

  /**
   * Opens bulk upload modal
   */
  const openBulkUploadDialog = () => {
    selectedFile.value = null
    showUploadDialog.value = true
  }

  /**
   * Closes bulk upload modal
   */
  const closeBulkUploadDialog = () => {
    showUploadDialog.value = false
    selectedFile.value = null
  }

  /**
   * Handles add/edit modal visibility
   */
  const handleAddDialogVisibility = (value) => {
    if (!value) {
      isEditMode.value = false
      resetForm()
    }
  }

  // ==================== FORM FUNCTIONS ====================
  
  /**
   * Resets form to default values
   */
  const resetForm = () => {
    formData.value = getDefaultFormData()
  }

  /**
   * Populates form with entity data for editing
   */
  const populateFormForEdit = (row) => {
    showAddDialog.value = true
    isEditMode.value = true
    
    // Copy all fields from row object to formData
    const defaultData = getDefaultFormData()
    Object.keys(defaultData).forEach(key => {
      formData.value[key] = row[key] ?? ''
    })
  }

  /**
   * Builds payload to send to API
   */
  const buildDefaultPayload = () => {
    const payload = {}
    const defaultData = getDefaultFormData()
    
    Object.keys(defaultData).forEach(key => {
      if (key !== '_id') {
        const value = formData.value[key]
        payload[key] = typeof value === 'string' ? value.trim() : value
      }
    })
    
    return payload
  }

  // ==================== API FUNCTIONS ====================
  
  /**
   * Gets entity list from API
   */
  const fetchEntities = async () => {
    const { page, rowsPerPage } = pagination.value
    loadingTable.value = true
    
    try {
      let params = {
        page,
        limit: rowsPerPage
      }

      // Si existe función personalizada de filtros, usarla
      if (buildFilterParams) {
        params = buildFilterParams(filtersData.value, params)
      } else {
        // Comportamiento por defecto
        // Add search if exists
        const trimmedSearch = filtersData.value.search?.trim()
        if (trimmedSearch) {
          params.search = trimmedSearch
        }

        // Add status filter if exists
        if (filtersData.value.status !== '' && filtersData.value.status !== null) {
          params.status = filtersData.value.status
        }

        // Add other custom filters if they exist
        Object.keys(filtersData.value).forEach(key => {
          if (key !== 'search' && key !== 'status' && filtersData.value[key] !== '' && filtersData.value[key] !== null && filtersData.value[key] !== undefined) {
            params[key] = filtersData.value[key]
          }
        })
      }

      const response = await getData(apiEndpoints.list, { params })

      // Process response (allows customization)
      if (processResponse) {
        const processed = processResponse(response)
        rows.value = processed.data
        pagination.value.rowsNumber = processed.total
      } else {
        // Default processing (assumes structure similar to your API)
        const entities = response?.msg?.[entityNamePlural] ?? []
        rows.value = entities
        pagination.value.rowsNumber = response?.msg?.totalDocuments ?? entities.length
      }
    } catch (err) {
      const message = err?.response?.data?.msg || err?.message || finalMessages.listError
      error(message)
      rows.value = []
      pagination.value.rowsNumber = 0
    } finally {
      loadingTable.value = false
    }
  }

  /**
   * Submits form to create or update an entity
   */
  const submitForm = async () => {
    loading.value = true
    
    // Build payload (allows customization)
    const payload = buildPayload ? buildPayload(formData.value) : buildDefaultPayload()

    // CREATE new entity
    if (!isEditMode.value) {
      try {
        const response = await postData(apiEndpoints.create, payload)
        success(response?.msg || finalMessages.createSuccess)
        showAddDialog.value = false
        handleAddDialogVisibility(false)
        await fetchEntities()
      } catch (err) {
        error(err?.response?.data?.errors || err?.message || finalMessages.createError)
      } finally {
        loading.value = false
      }
      return
    }

    // UPDATE existing entity
    try {
      const updateEndpoint = typeof apiEndpoints.update === 'function' 
        ? apiEndpoints.update(formData.value._id)
        : `${apiEndpoints.update}/${formData.value._id}`
      
      const response = await putData(updateEndpoint, payload)
      success(response?.msg || finalMessages.updateSuccess)
      showAddDialog.value = false
      handleAddDialogVisibility(false)
      await fetchEntities()
    } catch (err) {
      error(err?.response?.data?.msg || err?.message || finalMessages.updateError)
    } finally {
      loading.value = false
    }
  }

  /**
   * Changes entity status (active/inactive)
   */
  const toggleStatus = async (row) => {
    loading.value = true
    
    try {
      const isInactive = row.status == 1
      
      // Determine endpoint
      let endpoint
      if (isInactive) {
        endpoint = typeof apiEndpoints.activate === 'function'
          ? apiEndpoints.activate(row._id)
          : `${apiEndpoints.activate}/${row._id}`
      } else {
        endpoint = typeof apiEndpoints.deactivate === 'function'
          ? apiEndpoints.deactivate(row._id)
          : `${apiEndpoints.deactivate}/${row._id}`
      }
      
      const response = await putData(endpoint)
      success(response?.msg || finalMessages.statusSuccess)
      await fetchEntities()
    } catch (err) {
      error(err?.response?.data?.msg || err?.message || finalMessages.statusError)
    } finally {
      loading.value = false
    }
  }

  /**
   * Performs bulk upload from file
   */
  const submitBulkUpload = async () => {
    if (!apiEndpoints.bulkUpload) {
      error('Bulk upload endpoint not configured')
      return
    }

    loading.value = true
    
    try {
      const dataUpload = new FormData()
      dataUpload.append('file', selectedFile.value)
      
      const response = await postData(apiEndpoints.bulkUpload, dataUpload)
      success(response?.msg || finalMessages.bulkUploadSuccess)
      showUploadDialog.value = false
      selectedFile.value = null
      await fetchEntities()
    } catch (err) {
      error(err?.response?.data?.msg || err?.message || finalMessages.bulkUploadError)
    } finally {
      loading.value = false
    }
  }

  // ==================== COMPOSABLE RETURN ====================
  return {
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

    // Pagination functions
    handlePaginationRequest,
    resetPaginationState,

    // Filter functions
    handleSearchChange,
    handleStatusChange,
    applyFilters,
    clearFilters,

    // Modal functions
    openFormDialog,
    closeFormDialog,
    openDetailsDialog,
    closeDetailsDialog,
    openBulkUploadDialog,
    closeBulkUploadDialog,
    handleAddDialogVisibility,

    // Form functions
    resetForm,
    populateFormForEdit,

    // API functions
    fetchEntities,
    submitForm,
    toggleStatus,
    submitBulkUpload
  }
}