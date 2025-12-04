﻿<template>
  <q-page class="q-pa-md news-page">
    <div class="q-mb-lg">
      <BackButton />
    </div>

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Novedades y Alertas Administrativas"
             description="Se resuelve las novenades de los aprendices"  />
          </q-card-section>
        </q-card>

        <!-- Stats Cards -->
        <div class="stats-container q-mb-lg">
          <div class="stats-grid">
            <StatsCard
              v-for="(stat, index) in stats"
              :key="index"
              :title="stat.title"
              :value="stat.value"
              class="stat-card"
            />
          </div>
        </div>

        <div class="text-center q-mb-lg">
          <p class="text-body2 text-grey-7">
            Las novedades tienen un plazo máximo de 15 días hábiles para ser resueltas
          </p>
        </div>

        <!-- Vista de Cards Urgentes -->
        <div v-if="!showTableView" class="urgent-cards-container">
          <div class="urgent-title">Novedades Urgentes</div>
          <div class="urgent-cards-grid">
            <CardNovedades
              v-for="news in urgentNews"
              :key="news._id"
              :novedades="[news]"
              :loading="loading"
            />
          </div>
          <div class="text-center q-mt-xl">
            <Button
              label="Ver todas las novedades"
              custom-class="gradient-btn"
              icon="visibility"
              @click="showTableView = true"
            />
          </div>
        </div>

        <!-- Vista de Tabla -->
        <div v-else class="table-container">
          <!-- FILTROS Y BOTÓN CREAR -->
          <div class="filters-wrapper flex items-center justify-between q-my-lg">
            <div class="filters-left flex items-center bg-white">
              <div class="filter-item">
                <q-input
                  v-model="filtersData.startDate"
                  outlined
                  dense
                  type="date"
                  label="Fecha desde"
                  placeholder="DD/MM/AAAA"

                  @update:model-value="handleDateChange"
                >
                  <template #prepend>
                    <q-icon name="event" color="green-8" />
                  </template>
                </q-input>
              </div>

              <div class="filter-item">
                <q-input
                  v-model="filtersData.endDate"
                  outlined
                  dense
                  type="date"
                  label="Fecha hasta"
                  placeholder="DD/MM/AAAA"
                  @update:model-value="handleDateChange"
                >
                  <template #prepend>
                    <q-icon name="event" color="green-8" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Botón Crear Novedad alineado a la derecha -->
            <div class="filters-right">
              <Button
                label="Añadir nueva novedad"
                custom-class="create-news-btn"
                icon="add"
                @click="openCreateDialog"
              />
            </div>
          </div>

          <div class="row q-mb-md">
            <div class="col-12 text-center">
              <Button
                label="Volver a novedades urgentes"
                custom-class="gradient-btn"
                icon="arrow_back"
                @click="showTableView = false"
              />
            </div>
          </div>

          <Table
            card
            :rows="rowsNews"
            :columns="columns"
            v-model:pagination="pagination"
            :loanding-table="loadingTable"
            row-key="_id"
            @request="handlePaginationRequestNews"
          >
            <template #body-cell-tiempo="props">
              <q-td :props="props" class="text-center">
                {{ formatElapsedTime(props.row.createdAt || props.row.datesofia) }}
              </q-td>
            </template>

            <template #body-cell-acciones="props">
              <q-td :props="props" class="text-center table-options">
                <ButtonTableOptions
                  icon="visibility"
                  color="grey"
                  tooltip="Ver detalles"
                  @click="openDetailsDialogNews(props.row)"
                />
              </q-td>
            </template>

            <template #no-data>
              <div class="q-pa-md flex flex-center column text-grey full-width">
                <q-icon name="notification_important" size="2.5em" color="positive" />
                <div class="text-subtitle2 q-mt-sm">
                  No hay novedades registradas
                </div>
              </div>
            </template>
          </Table>
        </div>

        <!-- Modal de Detalles -->
        <Modal v-model="showDetailDialogNews" variant="view" width="900px" max-width="95vw">
          <template #header>
            <div class="text-h6 flex items-center">
              <q-icon name="notification_important" class="q-mr-sm" />
              DETALLES DE LA NOVEDAD
            </div>
          </template>

          <template #body>
            <div v-if="selectedNews" class="modal-content-grid">
              <!-- Datos del aprendiz -->
              <div class="modal-column">
                <div class="section-title">Datos del aprendiz</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Nombre completo:</div>
                    <div class="data-value">{{ selectedNews.name || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Tipo de documento:</div>
                    <div class="data-value">{{ selectedNews.tpdocument || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Número de documento:</div>
                    <div class="data-value">{{ selectedNews.document || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Teléfono:</div>
                    <div class="data-value">{{ selectedNews.phone || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Email:</div>
                    <div class="data-value">{{ selectedNews.email || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Información de la novedad -->
              <div class="modal-column">
                <div class="section-title">Información de la novedad</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Tipo de novedad:</div>
                    <div class="data-value">{{ selectedNews.tpnew || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Estado:</div>
                    <div class="data-value">{{ selectedNews.state || String(selectedNews.status || '-') }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Ficha:</div>
                    <div class="data-value">{{ selectedNews.fiche?.number || selectedNews.code || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Programa:</div>
                    <div class="data-value">{{ formatProgram(selectedNews) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Instructor responsable:</div>
                    <div class="data-value">{{ formatInstructor(selectedNews) }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Fecha de creación:</div>
                    <div class="data-value">{{ selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleDateString('es-ES') : (selectedNews.datesofia || '-') }}</div>
                  </div>
                </div>
              </div>

              <!-- Causa (ocupando todo el ancho) -->
              <div class="modal-column" style="grid-column: 1 / -1;">
                <div class="section-title">Descripción de la causa</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="data-value">{{ selectedNews.cause || 'Sin descripción' }}</div>
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

        <!-- Modal de Crear Novedad -->
        <Modal v-model="showAddDialogNews" variant="edit" width="800px" max-width="90vw" persistent @update:model-value="handleAddDialogVisibility">
          <template #header>
            <div class="text-h6 flex items-center">
              <q-icon name="add" class="q-mr-sm" />
              {{ isEditMode ? 'Editar novedad' : 'Añadir nueva novedad' }}
            </div>
          </template>

          <template #body>
            <q-form @submit.prevent="submitFormNews">
              <div class="modal-content-grid">
                <div class="modal-column">
                  <div class="section-title">Datos de la novedad</div>
                  
                  <!-- ID del Aprendiz -->
                  <q-input
                    v-model="formData.apprenticeId"
                    filled
                    dense
                    label="ID del Aprendiz *"
                    type="text"
                    :rules="[val => !!val || 'El ID del aprendiz es requerido']"
                  />

                  <!-- Tipo de Novedad -->
                  <q-select
                    v-model="formData.tpnew"
                    filled
                    dense
                    label="Tipo de novedad *"
                    :options="newsTypes"
                    :rules="[val => !!val || 'El tipo de novedad es requerido']"
                  />

                  <!-- Fecha de Creación -->
                  <q-input
                    v-model="formData.datesofia"
                    filled
                    dense
                    label="Fecha de creación *"
                    type="date"
                    placeholder="DD/MM/AAAA"
                    :rules="[val => !!val || 'La fecha es requerida']"
                    @update:model-value="handleFormDateChange"
                  />
                </div>

                <div class="modal-column">
                  <div class="section-title">Detalles adicionales</div>
                  
                  <!-- Causa -->
                  <q-input
                    v-model="formData.cause"
                    filled
                    dense
                    label="Causa *"
                    type="textarea"
                    rows="3"
                    :rules="[val => !!val || 'La causa es requerida']"
                  />

                  <!-- Archivo -->
                  <q-file
                    v-model="formData.file"
                    filled
                    dense
                    label="Archivo adjunto (opcional)"
                    accept=".jpg"
                    max-file-size="5242880"
                    @rejected="onFileRejected"
                    clearable
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                    <template v-slot:hint>
                      El archivo es opcional. Solo se aceptan imágenes JPG (máximo 5MB)
                    </template>
                  </q-file>
                </div>
              </div>
            </q-form>
          </template>

          <template #footer>
            <div class="row justify-end q-gutter-sm full-width">
              <Button
                label="Cancelar"
                custom-class="boton-cerrar"
                @click="closeFormDialogNews"
              />
              <Button
                :label="isEditMode ? 'Actualizar' : 'Añadir Novedad'"
                custom-class="gradient-btn"
                icon="add"
                :loading="loading"
                @click="submitFormNews"
              />
            </div>
          </template>
        </Modal>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useEntityManager } from 'src/composables/useEntityManager'
import { getData, postData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import BackButton from 'src/components/BackButton.vue'
import Table from 'src/components/Table.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Modal from 'src/components/Modal.vue'
import PageHeader from 'src/components/PageHeader.vue'
import CardNovedades from 'src/components/CardNovedades.vue'
import StatsCard from 'src/components/cards/StatsCard.vue'

// ==================== COMPOSABLES ====================
const { error, success, warning } = useNotifications()

// ==================== COMPOSABLE CONFIGURATION ====================

// 1️⃣ Estructura del formulario
const getDefaultFormData = () => ({
  _id: '',
  apprenticeId: '',
  tpnew: 'DESERCIÓN',
  tpdocument: null,
  document: '',
  name: '',
  email: '',
  phone: '',
  fiche: '',
  cause: '',
  datesofia: new Date().toISOString().split('T')[0],
  file: null
})

// 2️⃣ Endpoints de la API
const endpoints = {
  list: '/news/listNews',
  create: '/news/createNew',
  update: (id) => `/news/updateNew/${id}`
}

// 3️⃣ Mensajes personalizados
const customMessages = {
  listError: 'Error al cargar novedades',
  createSuccess: 'Novedad creada exitosamente',
  createError: 'Error al crear la novedad',
  updateSuccess: 'Novedad actualizada exitosamente',
  updateError: 'Error al actualizar la novedad',
  noData: 'No hay novedades registradas'
}

// 4️⃣ Función para procesar respuesta de la API
const processNewsResponse = (response) => {
  let newsArray = []
  let totalDocs = 0

  if (response?.msg?.news && Array.isArray(response.msg.news)) {
    newsArray = response.msg.news
    totalDocs = response.msg.totalDocuments || newsArray.length
  } else if (Array.isArray(response?.msg)) {
    newsArray = response.msg
    totalDocs = newsArray.length
  }

  return {
    data: newsArray,
    total: totalDocs
  }
}

// 5️⃣ Función para construir el payload
const buildPayloadNews = (formDataValue) => {
  const formData = new FormData()
  
  formData.append('apprenticeId', formDataValue.apprenticeId)
  formData.append('tpnew', formDataValue.tpnew)
  formData.append('cause', formDataValue.cause.trim())
  formData.append('datesofia', formDataValue.datesofia)
  
  if (formDataValue.file) {
    formData.append('file', formDataValue.file)
  }

  return formData
}

// 6️⃣ Inicializar composable con nombres estandarizados
const {
  // Estados
  loading,
  loadingTable,
  rows,
  showAddDialog,
  showDetailDialog,
  isEditMode,
  selectedEntity,
  filtersData,
  pagination,
  formData,

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
  populateFormForEdit,

  // Funciones de API
  fetchEntities,
  submitForm
} = useEntityManager({
  entityName: 'news',
  entityNamePlural: 'news',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processNewsResponse,
  buildPayload: buildPayloadNews,
  useFormData: true
})

// ==================== EXTENDER FILTROS PARA NOVEDADES ====================
filtersData.value.startDate = ''
filtersData.value.endDate = ''

// ==================== ALIAS CON NOMBRES ESTANDARIZADOS ====================

// Estados
const rowsNews = rows
const selectedNews = selectedEntity
const showAddDialogNews = showAddDialog
const showDetailDialogNews = showDetailDialog

// Funciones de modales
const openFormDialogNews = openFormDialog
const closeFormDialogNews = closeFormDialog
const openDetailsDialogNews = openDetailsDialog
const closeDetailsDialogNews = () => {
  showDetailDialogNews.value = false
}

// Funciones de formulario
const resetFormNews = resetForm
const populateFormForEditNews = populateFormForEdit

// Funciones de API
const fetchNews = async () => {
  const { page, rowsPerPage } = pagination.value
  loadingTable.value = true
  
  try {
    const params = {
      page,
      limit: rowsPerPage
    }

    // Add date filters if they exist
    if (filtersData.value.startDate) {
      params.startDate = filtersData.value.startDate
    }
    if (filtersData.value.endDate) {
      params.endDate = filtersData.value.endDate
    }

    const response = await getData(endpoints.list, { params })
    
    // Process response
    const processed = processNewsResponse(response)
    rows.value = processed.data
    pagination.value.rowsNumber = processed.total

    if (!processed.data.length && (filtersData.value.startDate || filtersData.value.endDate)) {
      warning('No se encontraron novedades en el rango de fechas seleccionado')
    }
  } catch (err) {
    error(err?.response?.data?.msg || err?.message || customMessages.listError)
    rows.value = []
    pagination.value.rowsNumber = 0
  } finally {
    loadingTable.value = false
  }
}

const submitFormNews = async () => {
  if (!formData.value.apprenticeId || !formData.value.tpnew || 
      !formData.value.cause || !formData.value.datesofia) {
    warning('Por favor complete todos los campos requeridos')
    return
  }

  // Validar formato de archivo si existe
  if (formData.value.file) {
    const fileName = formData.value.file.name.toLowerCase()
    if (!fileName.endsWith('.jpg')) {
      warning('Solo se permiten archivos JPG')
      return
    }
  }

  loading.value = true

  try {
    const payload = buildPayloadNews(formData.value)

    await postData(endpoints.create, payload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    success(customMessages.createSuccess)
    showAddDialogNews.value = false
    resetFormNews()
    
    await fetchStatistics()
    await fetchNews()
  } catch (err) {
    console.error('Error:', err)
    error(err?.response?.data?.msg || err?.message || customMessages.createError)
    
    if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
      err.response.data.errors.forEach(err => warning(err))
    }
  } finally {
    loading.value = false
  }
}

// ==================== ESTADOS ESPECÍFICOS DE NOVEDADES ====================
const showTableView = ref(false)

// ==================== ESTADÍSTICAS ====================
const stats = ref([
  { title: 'TOTAL NOVEDADES ACTIVAS', value: 0 },
  { title: 'EN PROCESO', value: 0 },
  { title: 'RESUELTAS ESTE MES', value: 0 },
  { title: 'CRÍTICAS SIN ATENDER >3 DÍAS', value: 0 }
])

// ==================== OPCIONES PARA FORMULARIO ====================
const newsTypes = ['DESERCIÓN', 'RETIRO VOLUNTARIO', 'TRASLADO', 'APLAZAMIENTO', 'REINGRESO', 'REINGRESO ESPECIAL']
const documentTypes = ['CC', 'TI', 'CE', 'PEP', 'PPT']

// ==================== COLUMNAS ====================
const columns = [
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'left',
    field: row => {
      const date = row?.createdAt || row?.datesofia || ''
      if (!date) return '-'
      try {
        return new Date(date).toLocaleDateString('es-ES')
      } catch {
        return date
      }
    },
    sortable: true
  },
  { name: 'aprendiz', label: 'Aprendiz', align: 'left', field: row => row?.name || '-' },
  { name: 'cedula', label: 'Cédula', align: 'left', field: row => formatDocument(row) },
  { name: 'ficha', label: 'Ficha', align: 'left', field: row => row?.fiche?.number || row?.code || '-' },
  { name: 'programa', label: 'Programa', align: 'left', field: row => formatProgram(row) },
  { name: 'tipo', label: 'Tipo', align: 'left', field: row => row?.tpnew || '-' },
  { name: 'estado', label: 'Estado', align: 'center', field: row => row?.state || String(row?.status || '-') },
  { name: 'instructor', label: 'Instructor', align: 'left', field: row => formatInstructor(row) },
  { name: 'tiempo', label: 'Tiempo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

// ==================== COMPUTED ====================

/**
 * Filtra las novedades urgentes (las más antiguas primero)
 */
const urgentNews = computed(() => {
  if (!rowsNews.value.length) return []

  // Función auxiliar para obtener la fecha de la novedad
  const getNewsDate = (news) => {
    const dateStr = news?.createdAt || news?.datesofia
    if (!dateStr) return new Date() // Si no hay fecha, usar fecha actual
    
    // Si la fecha está en formato DD/MM/YYYY
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/')
      return new Date(`${year}-${month}-${day}`)
    }
    
    return new Date(dateStr)
  }

  // Ordenar todas las novedades por fecha (más antiguas primero)
  const sortedNews = [...rowsNews.value].sort((a, b) => {
    return getNewsDate(a) - getNewsDate(b)
  })

  // Primero, intentar obtener novedades no procesadas y registradas (más antiguas)
  const urgent = sortedNews
    .filter(news => !news?.processed && ['REGISTRADA', 'REGISTRADO'].includes(news?.state))
    .slice(0, 4)

  // Si no hay suficientes, agregar las más antiguas no procesadas
  if (urgent.length < 4) {
    const additional = sortedNews
      .filter(news => !news?.processed && !urgent.includes(news))
      .slice(0, 4 - urgent.length)
    urgent.push(...additional)
  }

  // Si aún no hay suficientes, agregar cualquier novedad antigua
  if (urgent.length < 4) {
    const fallback = sortedNews
      .filter(news => !urgent.includes(news))
      .slice(0, 4 - urgent.length)
    urgent.push(...fallback)
  }

  return urgent
})

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Calcula la diferencia de días entre una fecha y hoy
 */
const calculateDaysDifference = dateString => {
  const newsDate = new Date(dateString)
  newsDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((today - newsDate) / (1000 * 60 * 60 * 24))
}

/**
 * Formatea el tiempo transcurrido desde una fecha
 */
const formatElapsedTime = dateString => {
  if (!dateString) return '-'
  let days = 0
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/')
    days = calculateDaysDifference(`${month}/${day}/${year}`)
  } else {
    days = calculateDaysDifference(dateString)
  }
  if (days < 0) return `Faltan ${Math.abs(days)} días`
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Hace 1 día'
  return `Hace ${days} días`
}

/**
 * Formatea el documento con su tipo
 */
const formatDocument = news => {
  const docType = news?.tpdocument || ''
  const docNumber = news?.document || ''
  return docNumber ? `${docType} ${docNumber}`.trim() : '-'
}

/**
 * Formatea el nombre del programa
 */
const formatProgram = news => {
  const program = news?.fiche?.program
  if (program && typeof program === 'object') {
    return program.name || program.code || '-'
  }
  return news?.coordination?.name || '-'
}

/**
 * Formatea el nombre del instructor
 */
const formatInstructor = news => {
  if (news?.fiche?.owner?.name) return news.fiche.owner.name
  if (news?.owner?.name) return news.owner.name
  const instructor = news?.instructor
  if (!instructor) return '-'
  if (typeof instructor === 'object') {
    return instructor.name || instructor.Name || instructor._id || '-'
  }
  return String(instructor)
}

// ==================== VALIDACIÓN DE FECHAS ====================

/**
 * Maneja cambios en los campos de fecha de filtros
 */
function handleDateChange() {
  validateDateRange()
  resetPaginationState()
  fetchNews()
}

/**
 * Valida que la fecha de inicio sea anterior a la fecha de fin
 */
function validateDateRange() {
  if (!filtersData.value.startDate || !filtersData.value.endDate) return

  const startDate = new Date(filtersData.value.startDate)
  const endDate = new Date(filtersData.value.endDate)
  
  if (endDate < startDate) {
    warning('La fecha de fin debe ser posterior a la fecha de inicio')
    filtersData.value.endDate = ''
  }
}

/**
 * Maneja cambios en la fecha del formulario
 */
function handleFormDateChange() {
  validateFormDate(formData.value.datesofia)
}

/**
 * Valida que la fecha del formulario no sea futura
 */
function validateFormDate(dateStr) {
  if (!dateStr) return

  const selectedDate = new Date(dateStr)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  
  if (selectedDate > today) {
    warning('No se pueden seleccionar fechas futuras')
    formData.value.datesofia = ''
  }
}

// ==================== FUNCIONES DE ARCHIVO ====================
const onFileRejected = (rejectedEntries) => {
  if (rejectedEntries && rejectedEntries.length > 0) {
    const rejection = rejectedEntries[0]
    if (rejection.failedPropValidation === 'max-file-size') {
      warning('Archivo demasiado grande. Máximo 5MB')
    } else if (rejection.failedPropValidation === 'accept') {
      warning('Solo se permiten archivos JPG')
    } else {
      warning('Archivo no válido')
    }
  }
}

// ==================== API CALLS ====================

/**
 * Carga las estadísticas de novedades
 */
const fetchStatistics = async () => {
  try {
    const response = await getData('/news/statistics')
    
    if (response?.data?.totales) {
      const totales = response.data.totales
      stats.value = [
        { title: 'TOTAL NOVEDADES ACTIVAS', value: totales.totalActivas || 0 },
        { title: 'EN PROCESO', value: totales.enProceso || 0 },
        { title: 'RESUELTAS ESTE MES', value: totales.resueltasMes || 0 },
        { title: 'CRÍTICAS SIN ATENDER >3 DÍAS', value: totales.criticasSinAtender || 0 }
      ]
    }
  } catch (err) {
    console.error('Error al cargar estadísticas:', err)
    error('Error al cargar las estadísticas')
    stats.value.forEach(stat => stat.value = 0)
  }
}

/**
 * Sobrescribe handlePaginationRequest para usar nombres estandarizados
 */
const handlePaginationRequestNews = (props) => {
  if (!props?.pagination) return
  pagination.value = {
    page: props.pagination.page,
    rowsPerPage: props.pagination.rowsPerPage,
    rowsNumber: props.pagination.rowsNumber ?? pagination.value.rowsNumber
  }
  fetchNews()
}

/**
 * Abre el diálogo de crear
 */
const openCreateDialog = () => {
  resetFormNews()
  formData.value.tpnew = 'DESERCIÓN'
  formData.value.datesofia = new Date().toISOString().split('T')[0]
  openFormDialogNews()
}

// ==================== CICLO DE VIDA ====================

onMounted(() => {
  fetchStatistics()
  fetchNews()
})
</script>

<style lang="scss" scoped>
.news-page {
  background: #f5f7fb;
  min-height: 100vh;
}

.hero-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%);
}

.stats-container {
  padding: 20px;
  width: 100%;
  border-radius: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  padding: 10px 0;
}

.stat-card {
  width: 100%;
  min-height: 120px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

.urgent-cards-container {
  margin-top: 48px;
  padding: 32px 24px;
  background-color: #fafafa;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.urgent-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 32px;
  color: black;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.urgent-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
  padding: 20px 0;
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

.filters-right {
  display: flex;
  align-items: center;
}

.filter-item {
  min-width: 200px;
}

.table-options {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.create-news-btn {
  font-weight: 600;
  padding: 8px 24px;
  font-size: 0.9rem;
  white-space: nowrap;
}

// Estilos para las celdas de la tabla
:deep(.q-table) {
  tbody td {
    white-space: normal !important;
    word-wrap: break-word !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    max-width: 200px;
    padding: 16px 12px;
    vertical-align: top;
    line-height: 1.6;
  }

  tbody tr {
    height: auto !important;
    min-height: 60px;
  }

  // Columnas específicas con anchos máximos diferentes
  tbody td:nth-child(2), // Aprendiz
  tbody td:nth-child(8) { // Instructor
    max-width: 200px;
    min-width: 150px;
  }

  tbody td:nth-child(5) { // Programa
    max-width: 200px;
    min-width: 150px;
  }

  tbody td:nth-child(6) { // Tipo
    max-width: 160px;
    min-width: 140px;
  }

  tbody td:nth-child(7) { // Estado
    max-width: 150px;
    min-width: 120px;
    white-space: normal !important;
  }

  tbody td:nth-child(1), // Fecha
  tbody td:nth-child(3), // Cédula
  tbody td:nth-child(4) { // Ficha
    min-width: 100px;
  }

  tbody td:nth-child(9), // Tiempo
  tbody td:nth-child(10) { // Acciones
    min-width: 90px;
  }

  thead th {
    white-space: normal !important;
    word-wrap: break-word !important;
    vertical-align: middle;
    padding: 14px 12px;
    font-weight: 600;
  }

  // Espaciado entre filas
  tbody tr:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
}

@media (max-width: 1024px) {
  .urgent-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-left {
    width: 100%;
  }

  .filters-right {
    width: 100%;
    justify-content: center;
    margin-top: 12px;
  }

  .create-news-btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .urgent-cards-grid {
    grid-template-columns: 1fr;
  }

  .filter-item {
    width: 100%;
    min-width: unset;
  }
}

@media (max-width: 300px) {
  // Aumentar tamaño de texto en las cards de novedades urgentes
  :deep(.text-caption) {
    font-size: 0.9rem !important;
    line-height: 1.4 !important;
  }

  :deep(.text-center.text-caption.text-grey-7.q-mt-xs) {
    font-size: 0.85rem !important;
    line-height: 1.3 !important;
  }

  // Ajustes adicionales para mejor legibilidad
  .urgent-cards-grid {
    gap: 20px;
    padding: 15px 0;
  }

  .urgent-title {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }

  .stats-grid {
    gap: 20px;
  }
}
</style>