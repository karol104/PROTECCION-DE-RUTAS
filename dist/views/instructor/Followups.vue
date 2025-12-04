<template>
  <q-page class="q-pa-md seguimientos-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Registro y Seguimiento de Aprendices"
              description="Gestiona y realiza seguimiento a los aprendices en etapa productiva."
            />
          </q-card-section>
        </q-card>

        <div class="filters-wrapper q-my-lg">
          <div class="filters-left bg-white">
            <q-input
              v-model="filtersData.search"
              outlined
              dense
              clearable
              debounce="600"
              placeholder="Buscar por aprendiz, documento, ficha o programa"
              @update:model-value="handleSearchChange"
              class="search-input"
            >
              <template #prepend>
                <q-icon name="search" color="green-8" />
              </template>
              <template #append v-if="filtersData.search">
                <q-icon 
                  name="info_outline" 
                  color="grey-6" 
                  size="sm"
                  class="cursor-pointer"
                >
                  <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                    Busca en: Nombre del aprendiz, documento, número de ficha y programa
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="actions-right row items-center q-gutter-sm">
            <Button
              label="Plantillas"
              icon="description"
              custom-class="gradient-btn"
              @click="openPlantillasDialog"
            />
            <Button
              label="Registrar Seguimiento"
              icon="add"
              custom-class="gradient-btn"
              @click="openFormDialog"
            />
          </div>
        </div>

        <Table
          card
          :rows="rows"
          :columns="columnasSeguimientos"
          v-model:pagination="pagination"
          :loading="loadingTable"
          row-key="id"
          @request="handlePaginationRequest"
        >
          <!-- Columna personalizada para Aprendiz/Documento -->
          <template #body-cell-aprendiz="props">
            <q-td :props="props">
              <div class="aprendiz-cell">
                <div class="aprendiz-nombre">{{ props.row.aprendiz }}</div>
                <div class="aprendiz-documento">{{ props.row.documento }}</div>
              </div>
            </q-td>
          </template>

          <!-- Columna personalizada para Ficha/Programa -->
          <template #body-cell-ficha="props">
            <q-td :props="props">
              <div class="ficha-cell">
                <div class="ficha-numero">{{ props.row.ficha }}</div>
                <div class="ficha-programa">{{ props.row.programa }}</div>
              </div>
            </q-td>
          </template>

          <!-- Columna Estado con validación visual -->
          <template #body-cell-estado="props">
            <q-td :props="props" class="text-center">
              <div class="estado-cell">
                <q-icon 
                  :name="props.row.estado === 'Validado' ? 'check' : 'close'"
                  :color="props.row.estado === 'Validado' ? 'green' : 'red'"
                  size="sm"
                />
                <span class="estado-text">{{ props.row.estado }}</span>
              </div>
            </q-td>
          </template>

          <!-- Columna Alertas con badge -->
          <template #body-cell-alertas="props">
            <q-td :props="props" class="text-center">
              <q-badge
                :color="getAlertColor(props.row.alertas || '')"
                :label="props.row.alertas || 'Sin alertas'"
                class="alerta-badge"
              />
            </q-td>
          </template>

          <template #body-cell-acciones="props">
            <q-td :props="props" class="text-center table-options">
              <ButtonTableOptions
                icon="visibility"
                color="grey-7"
                tooltip="Ver seguimiento"
                @click="openDetailsDialog(props.row)"
              />
              <ButtonTableOptions
                icon="download"
                color="grey-6"
                tooltip="Descargar"
                @click="downloadSeguimiento(props.row)"
              />
              <ButtonTableOptions
                icon="delete"
                color="negative"
                tooltip="Eliminar"
                @click="deleteSeguimiento(props.row)"
              />
            </q-td>
          </template>

          <template #no-data>
            <div class="q-pa-md flex flex-center column text-grey full-width">
              <q-icon name="assignment" size="2.5em" color="grey-5" />
              <div class="text-subtitle2 q-mt-sm">
                No hay seguimientos registrados
              </div>
            </div>
          </template>
        </Table>

        <!-- Modal Nuevo Seguimiento -->
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
                <q-icon name="assignment" class="q-mr-sm" />
                Nuevo Seguimiento
              </div>
            </div>
          </template>

          <template #body>
            <q-form @submit.prevent="submitFormSeguimientos">
              <div class="modal-content-grid">
                <div class="modal-column">
                  <div class="section-title">Información del Aprendiz</div>
                  <q-input
                    v-model="formData.documento"
                    filled
                    dense
                    label="Documento *"
                    placeholder="Ingrese documento"
                    :rules="[val => !!val || 'El documento es requerido']"
                  >
                    <template #append>
                      <q-icon name="search" />
                    </template>
                  </q-input>

                  <q-select
                    v-model="formData.tipoSeguimiento"
                    :options="tipoSeguimientoOptions"
                    filled
                    dense
                    label="Tipo Seguimiento *"
                    emit-value
                    map-options
                    :rules="[val => !!val || 'El tipo de seguimiento es requerido']"
                  />

                  <div class="form-group">
                    <label class="form-label">
                      Número Seguimiento *
                    </label>
                    <div class="checkbox-group">
                      <q-checkbox 
                        v-model="formData.numeroSeguimiento.uno" 
                        label="1"
                        color="green"
                      />
                      <q-checkbox 
                        v-model="formData.numeroSeguimiento.dos" 
                        label="2"
                        color="green"
                      />
                      <q-checkbox 
                        v-model="formData.numeroSeguimiento.tres" 
                        label="3"
                        color="green"
                      />
                    </div>
                  </div>
                </div>

                <div class="modal-column">
                  <div class="section-title">Detalles del Seguimiento</div>
                  <q-input
                    v-model="formData.motivoSolicitud"
                    filled
                    dense
                    type="textarea"
                    rows="3"
                    label="Motivo de Solicitud"
                    placeholder="Este campo solo debe ser usado al seleccionar seguimiento Extraordinario"
                    :disable="formData.tipoSeguimiento !== 'Extraordinario'"
                    :bg-color="formData.tipoSeguimiento !== 'Extraordinario' ? 'grey-3' : 'white'"
                  />
                  <small v-if="formData.tipoSeguimiento !== 'Extraordinario'" class="text-grey-6 q-mt-xs block">
                    * Este campo solo está disponible para seguimientos de tipo "Extraordinario"
                  </small>

                  <div class="form-group q-mt-md">
                    <label class="form-label">
                      Archivo PDF (Máximo 2MB)
                    </label>
                    <q-file
                      v-model="selectedFile"
                      outlined
                      label="Seleccionar archivo PDF"
                      accept="application/pdf"
                      max-file-size="2097152"
                      clearable
                      @rejected="onFileRejected"
                    >
                      <template #prepend>
                        <q-icon name="picture_as_pdf" />
                      </template>
                      <template #hint>
                        Formato permitido: PDF. Tamaño máximo: 2MB.
                      </template>
                    </q-file>
                  </div>
                </div>
              </div>
            </q-form>
          </template>

          <template #footer>
            <div class="row justify-end q-gutter-sm full-width">
              <Button
                custom-class="boton-cerrar"
                label="Cancelar"
                @click="closeFormDialog"
              />
              <Button
                label="Guardar Seguimiento"
                custom-class="gradient-btn"
                :loading="loading"
                @click="submitFormSeguimientos"
              />
            </div>
          </template>
        </Modal>

        <!-- Modal de Detalles -->
        <Modal v-model="showDetailDialog" variant="view" width="900px" max-width="90vw">
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="assignment" class="q-mr-sm" />
                {{ selectedEntity?.aprendiz || 'Seguimiento' }}
              </div>
            </div>
          </template>

          <template #body>
            <div v-if="selectedEntity" class="modal-content-grid">
              <div class="modal-column">
                <div class="section-title">Información del Aprendiz</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Aprendiz:</div>
                    <div class="data-value">{{ selectedEntity?.aprendiz || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Documento:</div>
                    <div class="data-value">{{ selectedEntity?.documento || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Ficha:</div>
                    <div class="data-value">{{ selectedEntity?.ficha || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Programa:</div>
                    <div class="data-value">{{ selectedEntity?.programa || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Modalidad:</div>
                    <div class="data-value">{{ selectedEntity?.modalidad || '-' }}</div>
                  </div>
                </div>
              </div>

              <div class="modal-column">
                <div class="section-title">Información del Seguimiento</div>
                <div class="data-grid">
                  <div class="data-row">
                    <div class="text-weight-bold">Nº Seguimiento:</div>
                    <div class="data-value">{{ selectedEntity?.numeroSeguimiento || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Tipo:</div>
                    <div class="data-value">{{ selectedEntity?.tipoSeguimiento || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Fecha Programada:</div>
                    <div class="data-value">{{ selectedEntity?.fechaProgramada || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Fecha Realizada:</div>
                    <div class="data-value">{{ selectedEntity?.fechaRealizada || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Estado:</div>
                    <div class="data-value">{{ selectedEntity?.estado || '-' }}</div>
                  </div>
                  <div class="data-row">
                    <div class="text-weight-bold">Observaciones:</div>
                    <div class="data-value">{{ selectedEntity?.observaciones || '-' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <Button
              label="Cerrar"
              custom-class="boton-cerrar"
              @click="closeDetailsDialog"
            />
          </template>
        </Modal>

        <!-- Modal Plantillas Seguimientos -->
        <Modal 
          v-model="showPlantillasDialog" 
          variant="view"
          width="500px"
          max-width="95vw"
        >
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="description" class="q-mr-sm" />
                Plantillas Seguimientos
              </div>
            </div>
          </template>

          <template #body>
            <div class="plantillas-list">
              <q-list>
                <q-item 
                  v-for="plantilla in plantillasList" 
                  :key="plantilla.id"
                  class="plantilla-item"
                >
                  <q-item-section avatar>
                    <q-icon :name="plantilla.icon" color="grey-7" size="md" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="plantilla-nombre">{{ plantilla.nombre }}</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="plantilla-actions">
                      <ButtonTableOptions
                        icon="visibility"
                        color="grey-7"
                        tooltip="Visualizar"
                        @click="openVisualizarPlantillaDialog(plantilla)"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </template>

          <template #footer>
            <Button
              label="Cerrar"
              custom-class="boton-cerrar"
              :noCaps="true"
              v-close-popup
            />
          </template>
        </Modal>

        <!-- Modal Visualizar Plantilla -->
        <Modal 
          v-model="showVisualizarPlantillaDialog" 
          variant="view"
          width="900px"
          max-width="95vw"
        >
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="visibility" class="q-mr-sm" />
                Visualizar Plantilla
              </div>
            </div>
          </template>

          <template #body>
            <div class="plantilla-viewer">
              <div class="pdf-container">
                <div class="pdf-toolbar">
                  <ButtonTableOptions
                    icon="download"
                    color="grey-8"
                    tooltip="Descargar"
                    @click="downloadPlantilla"
                  />
                </div>
                <div class="pdf-preview">
                  <div class="pdf-placeholder">
                    <q-icon name="description" size="64px" color="grey-5" />
                    <p class="text-grey-6">Vista previa de la plantilla</p>
                    <small class="text-grey-5">Formato de seguimiento de etapa productiva</small>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <Button
              label="Cerrar"
              custom-class="boton-cerrar"
              :noCaps="true"
              v-close-popup
            />
          </template>
        </Modal>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useEntityManager } from 'src/composables/useEntityManager'
import { useNotifications } from 'src/composables/useNotifications'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'

// ==================== NOTIFICACIONES ====================
const { error, success, warning } = useNotifications()
const $q = useQuasar()

// ==================== CONFIGURACIÓN DEL COMPOSABLE ====================

const getDefaultFormData = () => ({
  _id: '',
  documento: '',
  tipoSeguimiento: '',
  numeroSeguimiento: {
    uno: false,
    dos: false,
    tres: false
  },
  motivoSolicitud: '',
  archivoPDF: null
})

const endpoints = {
  list: '/seguimientos/list',
  create: '/seguimientos/create',
  update: (id) => `/seguimientos/update/${id}`,
  activate: (id) => `/seguimientos/activate/${id}`,
  deactivate: (id) => `/seguimientos/deactivate/${id}`
}

const customMessages = {
  listError: 'Error al listar seguimientos',
  createSuccess: 'Seguimiento creado correctamente',
  createError: 'Error al crear seguimiento',
  updateSuccess: 'Seguimiento actualizado correctamente',
  updateError: 'Error al actualizar seguimiento',
  noData: 'No hay seguimientos registrados'
}

// Función para construir parámetros de filtro
const buildSeguimientosFilterParams = (filters, baseParams) => {
  const params = { ...baseParams }
  
  // Un solo filtro que busca en múltiples campos
  if (filters.search?.trim()) {
    params.search = filters.search.trim()
    // El backend debe buscar en: aprendiz, documento, ficha y programa
  }
  
  return params
}

const {
  loading,
  loadingTable,
  rows,
  showAddDialog,
  showDetailDialog,
  selectedEntity,
  selectedFile,
  formData,
  filtersData,
  pagination,
  handlePaginationRequest,
  openFormDialog,
  closeFormDialog,
  openDetailsDialog,
  closeDetailsDialog,
  handleAddDialogVisibility,
  handleSearchChange,
  resetForm,
  fetchEntities,
  submitForm
} = useEntityManager({
  entityName: 'seguimiento',
  entityNamePlural: 'seguimientos',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  buildFilterParams: buildSeguimientosFilterParams
})

// ==================== ESTADOS ESPECÍFICOS ====================
const showPlantillasDialog = ref(false)
const showVisualizarPlantillaDialog = ref(false)

// ==================== DATOS DE EJEMPLO ====================
const seguimientosData = ref([
  {
    id: 1,
    aprendiz: 'Luis Fernando Torres',
    documento: '67235468',
    ficha: '2926078',
    programa: 'Análisis y desarrollo de software',
    modalidad: 'Proyecto Productivo',
    numeroSeguimiento: '2',
    tipoSeguimiento: 'Presencial',
    fechaProgramada: '05/10/2025',
    fechaRealizada: '04/10/2025',
    estado: 'Validado',
    observaciones: 'Ha cumplido con el objetivo',
    alertas: 'Completado'
  },
  {
    id: 2,
    aprendiz: 'Maria Amanda Ortiz',
    documento: '1099155',
    ficha: '3698456',
    programa: 'Hoteleria y turismo',
    modalidad: 'Pasantía',
    numeroSeguimiento: '1',
    tipoSeguimiento: 'Virtual',
    fechaProgramada: '06/10/2025',
    fechaRealizada: '--------',
    estado: 'Pendiente',
    observaciones: '--------',
    alertas: 'Próximo a vencer (1 día)'
  },
  {
    id: 3,
    aprendiz: 'Luis Fernando Torres',
    documento: '67235468',
    ficha: '3086756',
    programa: 'Gestión de servicios agropecuarios',
    modalidad: 'Monitoria',
    numeroSeguimiento: '2',
    tipoSeguimiento: 'Técnico',
    fechaProgramada: '10/10/2025',
    fechaRealizada: '04/10/2025',
    estado: 'Validado',
    observaciones: 'Ha cumplido con el objetivo',
    alertas: 'Completado'
  },
  {
    id: 4,
    aprendiz: 'Gabriela Alejandra Ballesteros',
    documento: '1030733744',
    ficha: '3626456',
    programa: 'Supervisión de ventas',
    modalidad: 'Vínculo Laboral',
    numeroSeguimiento: '1',
    tipoSeguimiento: 'De proyecto',
    fechaProgramada: '06/10/2025',
    fechaRealizada: '05/10/2025',
    estado: 'Rechazado',
    observaciones: 'No ha cumplido con los objetivos',
    alertas: 'En espera de un nuevo seguimiento'
  },
  {
    id: 5,
    aprendiz: 'Luis Miguel Pinto',
    documento: '1091236587',
    ficha: '2965842',
    programa: 'Agroindustria',
    modalidad: 'Contrato Aprendizaje',
    numeroSeguimiento: '1',
    tipoSeguimiento: 'Extraordinario',
    fechaProgramada: '06/01/2025',
    fechaRealizada: '01/01/2025',
    estado: 'Pendiente',
    observaciones: '--------',
    alertas: ''
  }
])

const plantillasList = ref([
  {
    id: 1,
    nombre: 'Seguimientos plantilla.pdf',
    icon: 'description'
  }
])

const tipoSeguimientoOptions = [
  { label: 'Obligatorio', value: 'Obligatorio' },
  { label: 'Extraordinario', value: 'Extraordinario' }
]

// ==================== COLUMNAS DE TABLA ====================
const columnasSeguimientos = [
  { name: 'aprendiz', label: 'Aprendiz/Documento', field: 'aprendiz', align: 'left', sortable: true },
  { name: 'ficha', label: 'Ficha/Programa', field: 'ficha', align: 'left', sortable: true },
  { name: 'modalidad', label: 'Modalidad', field: 'modalidad', align: 'center', sortable: true },
  { name: 'numeroSeguimiento', label: 'Nº Seguimiento', field: 'numeroSeguimiento', align: 'center', sortable: true },
  { name: 'tipoSeguimiento', label: 'Tipo de Seguimiento', field: 'tipoSeguimiento', align: 'center', sortable: true },
  { name: 'fechaProgramada', label: 'Fecha Programada', field: 'fechaProgramada', align: 'center', sortable: true },
  { name: 'fechaRealizada', label: 'Fecha Realizada', field: 'fechaRealizada', align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'observaciones', label: 'Observaciones', field: 'observaciones', align: 'center', sortable: true },
  { name: 'alertas', label: 'Alertas', field: 'alertas', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// ==================== COMPUTED - SOLO PARA DATOS LOCALES ====================
const rowsSeguimientos = computed(() => {
  let resultado = [...seguimientosData.value]
  
  if (filtersData.value.search?.trim()) {
    const needle = filtersData.value.search.toLowerCase().trim()
    resultado = resultado.filter(item => 
      (item.aprendiz && item.aprendiz.toLowerCase().includes(needle)) ||
      (item.documento && item.documento.toLowerCase().includes(needle)) ||
      (item.ficha && item.ficha.toLowerCase().includes(needle)) ||
      (item.programa && item.programa.toLowerCase().includes(needle))
    )
  }
  
  return resultado
})

// ==================== FUNCIONES PRINCIPALES ====================

const onFileRejected = (rejectedEntries) => {
  if (rejectedEntries && rejectedEntries.length > 0) {
    const failedEntry = rejectedEntries[0]
    if (failedEntry.failedPropValidation === 'max-file-size') {
      error('El archivo supera el tamaño máximo permitido de 2MB')
    } else if (failedEntry.failedPropValidation === 'accept') {
      error('Solo se permiten archivos PDF')
    } else {
      error('El archivo no cumple con los requisitos')
    }
  }
}

const validateForm = () => {
  if (!formData.value.documento || !formData.value.documento.trim()) {
    error('Por favor ingrese el documento')
    return false
  }

  if (!formData.value.tipoSeguimiento) {
    error('Por favor seleccione el tipo de seguimiento')
    return false
  }

  const { uno, dos, tres } = formData.value.numeroSeguimiento
  if (!uno && !dos && !tres) {
    error('Por favor seleccione al menos un número de seguimiento')
    return false
  }

  if (formData.value.tipoSeguimiento === 'Extraordinario' && !formData.value.motivoSolicitud?.trim()) {
    error('El motivo de solicitud es requerido para seguimientos extraordinarios')
    return false
  }

  if (!selectedFile.value) {
    error('Por favor seleccione un archivo PDF')
    return false
  }

  return true
}

const submitFormSeguimientos = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showAddDialog.value = false
    success('Seguimiento registrado correctamente')
    resetForm()
    // En producción: await fetchEntities()
  } catch (err) {
    error('Error al guardar el seguimiento')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const downloadSeguimiento = (row) => {
  success(`Descargando seguimiento de ${row.aprendiz}`)
}

const deleteSeguimiento = (row) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de eliminar el seguimiento de ${row.aprendiz}?`,
    cancel: { label: 'Cancelar', color: 'grey', flat: true },
    ok: { label: 'Eliminar', color: 'negative', flat: true },
    persistent: true
  }).onOk(async () => {
    try {
      loading.value = true
      await new Promise(resolve => setTimeout(resolve, 500))
      success('Seguimiento eliminado correctamente')
      // En producción: await fetchEntities()
    } catch (err) {
      error('Error al eliminar el seguimiento')
    } finally {
      loading.value = false
    }
  })
}

const getAlertColor = (alerta) => {
  if (!alerta) return 'grey'
  if (alerta.includes('Completado')) return 'green'
  if (alerta.includes('Próximo a vencer')) return 'red'
  if (alerta.includes('En espera')) return 'orange'
  return 'grey'
}

const openPlantillasDialog = () => {
  showPlantillasDialog.value = true
}

const openVisualizarPlantillaDialog = (plantilla) => {
  showVisualizarPlantillaDialog.value = true
}

const downloadPlantilla = () => {
  success('Plantilla descargada correctamente')
}

// ==================== LIFECYCLE ====================
onMounted(() => {
  rows.value = seguimientosData.value
  // En producción: fetchEntities()
})

// ==================== WATCHERS ====================
watch(rowsSeguimientos, (newValue) => {
  rows.value = newValue
}, { immediate: true })
</script>

<style lang="sass" scoped>
.seguimientos-page
  background: #f5f7fb
  min-height: 100vh

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

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
  min-width: 200px

.table-options
  display: flex
  align-items: center
  justify-content: center
  gap: 8px

// Estilos para celdas personalizadas
.aprendiz-cell
  text-align: left

.aprendiz-nombre
  font-weight: 600
  color: #333
  margin-bottom: 2px

.aprendiz-documento
  font-size: 12px
  color: #666

.ficha-cell
  text-align: left

.ficha-numero
  font-weight: 600
  color: #333
  margin-bottom: 2px

.ficha-programa
  font-size: 12px
  color: #666

.estado-cell
  display: flex
  align-items: center
  justify-content: center
  gap: 6px

.estado-text
  font-weight: 500

.alerta-badge
  padding: 6px 12px
  border-radius: 12px
  font-size: 12px
  font-weight: 500

// Estilos para checkboxes
.checkbox-group
  display: flex
  gap: 16px
  align-items: center
  margin-top: 8px

.form-label
  display: block
  font-weight: 600
  color: #333
  margin-bottom: 8px
  font-size: 14px

.form-group
  margin-bottom: 16px

// Estilos del visor de plantilla
.plantilla-viewer
  width: 100%

.pdf-container
  border: 1px solid #e0e0e0
  border-radius: 8px
  overflow: hidden
  background-color: #f5f5f5

.pdf-toolbar
  background-color: #fff
  padding: 10px 15px
  border-bottom: 1px solid #e0e0e0
  display: flex
  justify-content: flex-end

.pdf-preview
  background-color: #fff
  min-height: 500px
  display: flex
  align-items: center
  justify-content: center
  padding: 40px

.pdf-placeholder
  text-align: center

  p
    margin-top: 16px
    font-size: 16px
    font-weight: 500

  small
    display: block
    margin-top: 8px
    font-size: 13px

.full-width
  width: 100%

@media (max-width: 1024px)
  .filters-wrapper
    flex-direction: column
    align-items: stretch

  .filters-left
    width: 100%

  .actions-right
    justify-content: flex-start

@media (max-width: 768px)
  .filter-item
    width: 100%
    min-width: unset

  .actions-right
    width: 100%

@media (max-width: 480px)
  .pdf-preview
    min-height: 300px
    padding: 20px

  .pdf-placeholder
    p
      font-size: 14px

    small
      font-size: 12px

  .checkbox-group
    flex-direction: column
    align-items: flex-start
    gap: 8px
</style>