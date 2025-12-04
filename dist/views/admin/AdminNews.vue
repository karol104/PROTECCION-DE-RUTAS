<template>
  <q-page class="q-pa-md news-page">
    <div class="q-mb-lg">
      <BackButton />
    </div>

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Novedades y Alertas Administrativas" />
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
                  @update:model-value="handleDateChange"
                >
                  <template #prepend>
                    <q-icon name="event" color="grey-7" />
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
                  @update:model-value="handleDateChange"
                >
                  <template #prepend>
                    <q-icon name="event" color="grey-7" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Botón Crear Novedad alineado a la derecha -->
            <div class="filters-right">
              <q-btn
                label="Añadir nueva novedad"
                color="positive"
                icon="add"
                @click="openCreateDialog"
                class="create-news-btn"
                unelevated
                rounded
                size="md"
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
            :loanding-table="loandingTable"
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
                  @click="openDetailDialog(props.row)"
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
        <q-dialog v-model="showDetailDialogNews" persistent>
          <q-card style="width: 900px; max-width: 95vw;" class="detail-modal">
            <q-card-section class="modal-header-green row items-center q-pa-md">
              <q-icon name="notification_important" size="sm" class="q-mr-sm" />
              <div class="text-h6">DETALLES DE LA NOVEDAD</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup color="white" />
            </q-card-section>

            <q-card-section class="q-pa-lg">
              <div v-if="selectedNews" class="row q-col-gutter-lg">
                <!-- Datos del aprendiz -->
                <div class="col-12 col-md-6">
                  <div class="section-header">
                    <div class="section-title-text">Datos del aprendiz</div>
                  </div>
                  
                  <div class="info-grid">
                    <div class="info-row">
                      <span class="info-label">Nombre completo:</span>
                      <span class="info-value">{{ selectedNews.name || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Tipo de documento:</span>
                      <span class="info-value">{{ selectedNews.tpdocument || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Número de documento:</span>
                      <span class="info-value">{{ selectedNews.document || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Teléfono:</span>
                      <span class="info-value">{{ selectedNews.phone || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Email:</span>
                      <span class="info-value email-text">{{ selectedNews.email || '-' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Información de la novedad -->
                <div class="col-12 col-md-6">
                  <div class="section-header">
                    <div class="section-title-text">Información de la novedad</div>
                  </div>
                  
                  <div class="info-grid">
                    <div class="info-row">
                      <span class="info-label">Tipo de novedad:</span>
                      <span class="info-value">{{ selectedNews.tpnew || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Estado:</span>
                      <span class="info-value">{{ selectedNews.state || String(selectedNews.status || '-') }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Ficha:</span>
                      <span class="info-value">{{ selectedNews.fiche?.number || selectedNews.code || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Programa:</span>
                      <span class="info-value">{{ formatProgram(selectedNews) }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Instructor responsable:</span>
                      <span class="info-value">{{ formatInstructor(selectedNews) }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Fecha de creación:</span>
                      <span class="info-value">{{ selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleDateString('es-ES') : (selectedNews.datesofia || '-') }}</span>
                    </div>
                  </div>
                </div>

                <!-- Causa (ocupando todo el ancho) -->
                <div class="col-12">
                  <div class="section-header">
                    <div class="section-title-text">Descripción de la causa</div>
                  </div>
                  
                  <div class="info-grid">
                    <div class="info-row">
                      <span class="info-value cause-text">{{ selectedNews.cause || 'Sin descripción' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md q-pt-none">
              <q-btn
                label="CERRAR"
                color="red"
                flat
                v-close-popup
                class="q-px-lg"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Modal de Crear Novedad -->
        <q-dialog v-model="showCreateDialog" persistent>
          <q-card style="width: 800px; max-width: 90vw;" class="create-modal">
            <q-card-section class="modal-header-green row items-center">
              <q-icon name="add" size="sm" class="q-mr-sm" />
              <div class="text-h6">Añadir nueva novedad</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup color="white" />
            </q-card-section>

            <q-card-section class="q-pa-lg">
              <q-form @submit.prevent="handleCreateNews">
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <div class="section-title">Datos de la novedad</div>
                  </div>

                  <!-- Tipo de Novedad -->
                  <div class="col-12">
                    <q-select
                      v-model="newNewsForm.tpnew"
                      outlined
                      dense
                      label="Tipo de novedad *"
                      :options="newsTypes"
                      :rules="[val => !!val || 'El tipo de novedad es requerido']"
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- Tipo de Documento -->
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="newNewsForm.tpdocument"
                      outlined
                      dense
                      label="Tipo de documento *"
                      :options="documentTypes"
                      :rules="[val => !!val || 'El tipo de documento es requerido']"
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- Número de Documento -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="newNewsForm.document"
                      outlined
                      dense
                      label="Número de documento *"
                      type="text"
                      :rules="[
                        val => !!val || 'El número de documento es requerido',
                        val => /^\d+$/.test(val) || 'Solo se permiten números'
                      ]"
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- Nombre Completo -->
                  <div class="col-12">
                    <q-input
                      v-model="newNewsForm.name"
                      outlined
                      dense
                      label="Nombre completo *"
                      type="text"
                      :rules="[val => !!val || 'El nombre completo es requerido']"
                      bg-color="grey-2"
                    />
                  </div>

                  <div class="col-12">
                    <div class="section-title">Contacto de la novedad</div>
                  </div>

                  <!-- Correo Personal -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="newNewsForm.email"
                      outlined
                      dense
                      label="Email *"
                      type="email"
                      :rules="[
                        val => !!val || 'El correo es requerido',
                        val => /.+@.+\..+/.test(val) || 'Ingrese un correo válido'
                      ]"
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- Número de Teléfono -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="newNewsForm.phone"
                      outlined
                      dense
                      label="Teléfono *"
                      type="tel"
                      :rules="[
                        val => !!val || 'El teléfono es requerido',
                        val => /^\d{10}$/.test(val) || 'Debe tener 10 dígitos'
                      ]"
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- Ficha de Formación -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="newNewsForm.fiche"
                      outlined
                      dense
                      label="Ficha de formación *"
                      type="text"
                      :rules="[val => !!val || 'La ficha de formación es requerida']"
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- Fecha de Creación -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="newNewsForm.datesofia"
                      outlined
                      dense
                      label="Fecha de creación *"
                      type="date"
                      :rules="[val => !!val || 'La fecha es requerida']"
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- Causa -->
                  <div class="col-12">
                    <q-input
                      v-model="newNewsForm.cause"
                      outlined
                      dense
                      label="Causa *"
                      type="textarea"
                      rows="3"
                      :rules="[val => !!val || 'La causa es requerida']"
                      bg-color="grey-2"
                    />
                  </div>
                </div>
              </q-form>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                label="CANCELAR"
                flat
                color="red"
                v-close-popup
                class="q-px-lg"
              />
              <q-btn
                label="AÑADIR NOVEDAD"
                color="positive"
                unelevated
                :loading="creatingNews"
                @click="handleCreateNews"
                class="q-px-lg"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
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

// 1️⃣ Form structure (not used for news in composable, but required)
const getDefaultFormData = () => ({
  _id: '',
  tpnew: '',
  tpdocument: '',
  document: '',
  name: '',
  email: '',
  phone: '',
  fiche: '',
  cause: '',
  datesofia: ''
})

// 2️⃣ API endpoints
const endpoints = {
  list: '/news/listNews'
}

// 3️⃣ Custom messages
const customMessages = {
  listError: 'Error al cargar novedades',
  noData: 'No hay novedades registradas'
}

// 4️⃣ Function to process API response
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
  entityName: 'news',
  entityNamePlural: 'news',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processNewsResponse
})

// ==================== EXTEND FILTERS FOR NEWS ====================
// Add date fields to filtersData
filtersData.value.startDate = ''
filtersData.value.endDate = ''

// ==================== ALIAS WITH STANDARDIZED NAMES ====================

// States
const rowsNews = rows
const selectedNews = selectedEntity
const showDetailDialogNews = showDetailDialog
const loandingTable = loadingTable

// Functions for modals
const openDetailDialogNews = openDetailsDialog

// ==================== NEWS SPECIFIC STATES ====================
const showTableView = ref(false)
const showCreateDialog = ref(false)
const creatingNews = ref(false)

// ==================== STATISTICS ====================
const stats = ref([
  { title: 'TOTAL NOVEDADES ACTIVAS', value: 0 },
  { title: 'EN PROCESO', value: 0 },
  { title: 'RESUELTAS ESTE MES', value: 0 },
  { title: 'CRÍTICAS SIN ATENDER >3 DÍAS', value: 0 }
])

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
const urgentNews = computed(() => {
  if (!rowsNews.value.length) return []

  const urgent = rowsNews.value
    .filter(news => !news?.processed && ['REGISTRADA', 'REGISTRADO'].includes(news?.state))
    .slice(0, 4)

  if (urgent.length < 4) {
    const additional = rowsNews.value
      .filter(news => !news?.processed && !urgent.includes(news))
      .slice(0, 4 - urgent.length)
    urgent.push(...additional)
  }

  if (urgent.length < 4) {
    const fallback = rowsNews.value
      .filter(news => !urgent.includes(news))
      .slice(0, 4 - urgent.length)
    urgent.push(...fallback)
  }

  return urgent
})

// ==================== FUNCIONES AUXILIARES ====================
const calculateDaysDifference = dateString => {
  const newsDate = new Date(dateString)
  newsDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((today - newsDate) / (1000 * 60 * 60 * 24))
}

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

const formatDocument = news => {
  const docType = news?.tpdocument || ''
  const docNumber = news?.document || ''
  return docNumber ? `${docType} ${docNumber}`.trim() : '-'
}

const formatProgram = news => {
  const program = news?.fiche?.program
  if (program && typeof program === 'object') {
    return program.name || program.code || '-'
  }
  return news?.coordination?.name || '-'
}

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

// ==================== API CALLS ====================
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

// ==================== NEWS SPECIFIC FUNCTIONS ====================

// Override fetchEntities to add date filters
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

// Handle date filter changes
const handleDateChange = () => {
  resetPaginationState()
  fetchNews()
}

// Override handlePaginationRequest to use fetchNews
const handlePaginationRequestNews = (props) => {
  if (!props?.pagination) return
  pagination.value = {
    page: props.pagination.page,
    rowsPerPage: props.pagination.rowsPerPage,
    rowsNumber: props.pagination.rowsNumber ?? pagination.value.rowsNumber
  }
  fetchNews()
}

const openDetailDialog = (news) => {
  openDetailDialogNews(news)
}

// ==================== FORM ====================
const newNewsForm = ref({
  tpnew: null,
  tpdocument: null,
  document: '',
  name: '',
  email: '',
  phone: '',
  fiche: '',
  cause: '',
  datesofia: ''
})

const newsTypes = ['DESERCIÓN', 'RETIRO VOLUNTARIO', 'TRASLADO', 'APLAZAMIENTO', 'REINGRESO', 'REINGRESO ESPECIAL']
const documentTypes = ['CC', 'TI', 'CE', 'PEP', 'PPT']

const openCreateDialog = () => {
  newNewsForm.value = {
    tpnew: null,
    tpdocument: null,
    document: '',
    name: '',
    email: '',
    phone: '',
    fiche: '',
    cause: '',
    datesofia: new Date().toISOString().split('T')[0]
  }
  showCreateDialog.value = true
}

const handleCreateNews = async () => {
  if (!newNewsForm.value.tpnew || !newNewsForm.value.tpdocument || 
      !newNewsForm.value.document || !newNewsForm.value.name ||
      !newNewsForm.value.email || !newNewsForm.value.phone ||
      !newNewsForm.value.fiche || !newNewsForm.value.cause ||
      !newNewsForm.value.datesofia) {
    warning('Por favor complete todos los campos requeridos')
    return
  }

  creatingNews.value = true

  try {
    const payload = {
      tpnew: newNewsForm.value.tpnew,
      tpdocument: newNewsForm.value.tpdocument,
      document: String(newNewsForm.value.document).trim(),
      name: newNewsForm.value.name.trim(),
      email: newNewsForm.value.email.trim().toLowerCase(),
      phone: String(newNewsForm.value.phone).trim(),
      fiche: String(newNewsForm.value.fiche).trim(),
      cause: newNewsForm.value.cause.trim(),
      datesofia: newNewsForm.value.datesofia
    }

    await postData('/news/createNew', payload)

    success('Novedad creada exitosamente')
    showCreateDialog.value = false
    
    await fetchStatistics()
    await fetchNews()
  } catch (err) {
    console.error('Error:', err)
    error(err?.response?.data?.msg || err?.message || 'Error al crear la novedad')
    
    if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
      err.response.data.errors.forEach(err => warning(err))
    }
  } finally {
    creatingNews.value = false
  }
}
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

.create-modal {
  border-radius: 8px;
}

.modal-header-green {
  background-color: #39a900;
  color: white;
  padding: 16px 20px;
  
  .text-h6 {
    font-weight: 600;
    letter-spacing: 0.5px;
  }
}

// Estilos del modal de detalles - Copiados exactamente del modal de empresas
.detail-modal {
  border-radius: 12px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.section-title-text {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 1.3rem;
  padding-left: 12px;
  border-left: 4px solid var(--color-primary);
}

.info-grid {
  display: grid;
  gap: 16px;
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #E0E0E0;
  margin-bottom: 16px;
}

.info-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F0F0F0;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 600;
}

.info-value {
  color: #34495e;
  font-size: 0.95rem;
  font-weight: 500;
}

.email-text {
  text-transform: lowercase;
}

.cause-text {
  color: #34495e;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.6;
  padding: 0;
  background: transparent;
  border-radius: 0;
  border-left: none;
  box-shadow: none;
  min-height: auto;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
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

  .info-row {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 6px 0;
  }

  .info-row .info-label {
    margin-bottom: 4px;
  }

  .info-label {
    font-size: 0.9rem;
  }

  .info-value {
    font-size: 0.9rem;
  }

  .section-title-text {
    font-size: 1.2rem;
    margin-bottom: 15px;
    padding-left: 10px;
  }

  .info-grid {
    gap: 12px;
    padding: 15px;
  }
}
</style>