<template>
  <div class="novedades-page">
    
    <div v-if="!mostrarVistaHistorial">
      <BackButton class="q-mb-lg"/>
      <div class="content">
        <PageHeader 
          title="Novedades y Reportes de Seguimiento" 
          description="Consulta anuncios y reportes de seguimiento de aprendices." 
        />

        <div class="filters-section q-mb-lg">
          <div class="row q-col-gutter-md q-mb-md items-center">
            <div class="col-12 col-md-8">
              <q-input
                v-model="filtersData.search"
                dense
                outlined
                placeholder="Buscar por aprendiz, documento, ficha o programa"
                clearable
                debounce="600"
                @update:model-value="handleSearchChange"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="green-8" />
                </template>
                <template v-slot:append v-if="filtersData.search">
                  <q-icon 
                    name="info_outline" 
                    color="grey-6" 
                    size="sm"
                  >
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Busca en: Nombre del aprendiz, documento, número de ficha y programa
                    </q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-4">
              <div class="action-buttons-row">
                <Button
                  label="Registrar novedad"
                  icon="add"
                  custom-class="gradient-btn"
                  @click="openFormDialog"
                />
                <Button
                  label="Plantillas"
                  icon="description"
                  custom-class="gradient-btn"
                  @click="verPlantillas"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <Table
          :rows="rows"
          :columns="columnas"
          :loading="loadingTable"
          row-key="documento"
          :rows-per-page-options="[5, 10, 15, 20]"
          :pagination="pagination"
          @request="handlePaginationRequest"
        >
          <template #body-cell-aprendiz="props">
            <q-td :props="props" class="text-left">
              <div class="aprendiz-cell">
                <div class="aprendiz-nombre">{{ props.row.aprendiz }}</div>
                <div class="aprendiz-documento">{{ props.row.documento }}</div>
              </div>
            </q-td>
          </template>

          <template #body-cell-ficha="props">
            <q-td :props="props" class="text-left">
              <div class="ficha-cell">
                <div class="ficha-numero">{{ props.row.ficha }}</div>
                <div class="ficha-programa">{{ props.row.programa }}</div>
              </div>
            </q-td>
          </template>

          <template #body-cell-estado="props">
            <q-td :props="props" class="text-center">
              <div v-if="props.row.estado === 'Validado'" class="estado-badge estado-validado">
                <q-icon name="check" size="18px" />
                <span>{{ props.row.estado }}</span>
              </div>
              <div v-else-if="props.row.estado === 'Rechazado'" class="estado-badge estado-rechazado">
                <q-icon name="close" size="18px" />
                <span>{{ props.row.estado }}</span>
              </div>
              <div v-else class="estado-badge estado-pendiente">
                <span>{{ props.row.estado }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-acciones="props">
            <q-td :props="props" class="text-center actions-column">
              <ButtonTableOptions
                icon="history"
                color="grey-7"
                tooltip="Ver historial"
                @click="verHistorial(props.row)"
              />
            </q-td>
          </template>
        </Table>
      </div>
    </div>

    <div v-else class="historial-page">
      <div class="historial-header">
        <Button
          icon="arrow_back"
          flat
          round
          dense
          custom-class="icon-button"
          class="back-button-historial"
          :aria-label="'Volver a novedades'"
          @click="cerrarHistorial"
        />
        <div class="historial-title-section">
          <h1 class="historial-main-title">Historial de Novedades</h1>
          <h2 class="historial-subtitle">{{ aprendizSeleccionado?.aprendiz }}</h2>
          <div class="historial-info">
            <span class="info-item">
              <strong>Ficha:</strong> {{ aprendizSeleccionado?.ficha || '2924076' }}
            </span>
            <span class="info-item">
              <strong>Programa:</strong> {{ aprendizSeleccionado?.programa || 'Análisis y desarrollo de software' }}
            </span>
          </div>
        </div>
      </div>

      <div class="historial-content">
        <div class="historial-table-container">
          <Table
            :rows="historialNovedades"
            :columns="columnasHistorial"
            row-key="id"
            :rows-per-page-options="[5, 10, 15, 20]"
          >
            <template #body-cell-fecha="props">
              <q-td :props="props" class="text-center">
                <div class="fecha-cell">{{ props.row.fecha }}</div>
              </q-td>
            </template>

            <template #body-cell-tipoNovedad="props">
              <q-td :props="props" class="text-center">
                <div class="tipo-novedad-cell">{{ props.row.tipoNovedad }}</div>
              </q-td>
            </template>

            <template #body-cell-estado="props">
              <q-td :props="props" class="text-center">
                <div v-if="props.row.estado === 'Permanente'" class="estado-badge estado-validado">
                  <q-icon name="check" size="16px" />
                  <span>{{ props.row.estado }}</span>
                </div>
                <div v-else-if="props.row.estado === 'Validado'" class="estado-badge estado-validado">
                  <q-icon name="check" size="16px" />
                  <span>{{ props.row.estado }}</span>
                </div>
                <div v-else-if="props.row.estado === 'En proceso'" class="estado-badge estado-pendiente">
                  <span>{{ props.row.estado }}</span>
                </div>
                <div v-else class="estado-badge estado-pendiente">
                  <span>{{ props.row.estado }}</span>
                </div>
              </q-td>
            </template>

            <template #body-cell-observacion="props">
              <q-td :props="props" class="text-left">
                <div class="observacion-cell">{{ props.row.observacion }}</div>
              </q-td>
            </template>

            <template #body-cell-documento="props">
              <q-td :props="props" class="text-center">
                <div class="documento-cell">
                  <Button
                    label="Ver PDF"
                    flat
                    :noCaps="true"
                    custom-class="link-button"
                    @click="verDocumento(props.row.documento)"
                  />
                </div>
              </q-td>
            </template>

            <template #body-cell-acciones="props">
              <q-td :props="props" class="text-center">
                <div class="acciones-cell">
                  <ButtonTableOptions
                    icon="visibility"
                    color="grey-7"
                    tooltip="Ver detalle"
                    @click="openDetailsDialog(props.row)"
                  />
                </div>
              </q-td>
            </template>
          </Table>
        </div>
      </div>
    </div>

    <!-- Modal para registrar novedad -->
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
            <q-icon name="add_circle" class="q-mr-sm" />
            Registrar nueva novedad
          </div>
        </div>
      </template>
      
      <template #body>
        <q-form @submit.prevent="mostrarConfirmacion">
          <div class="modal-content-grid">
            <div class="modal-column">
              <div class="section-title">Información del Aprendiz</div>
              <q-input
                v-model="formData.aprendizBusqueda"
                filled
                dense
                label="Aprendiz *"
                placeholder="Buscar Aprendiz"
                :rules="[val => !!val || 'El aprendiz es requerido']"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
              
              <q-select
                v-model="formData.tipo"
                :options="tiposNovedadModal.filter(t => t !== 'Seleccionar tipo')"
                filled
                dense
                label="Tipo de novedad *"
                placeholder="Seleccionar tipo"
                :rules="[val => !!val && val !== 'Seleccionar tipo' || 'El tipo de novedad es requerido']"
              />
              
              <q-input
                v-model="formData.fechaEvento"
                filled
                dense
                label="Fecha del evento *"
                placeholder="dd/mm/aaaa"
                mask="##/##/####"
                :rules="[val => !!val || 'La fecha del evento es requerida']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.fechaEvento" mask="DD/MM/YYYY">
                        <div class="row items-center justify-end">
                          <Button label="Cerrar" flat :noCaps="true" custom-class="boton-cerrar" v-close-popup />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="modal-column">
              <div class="section-title">Detalles de la Novedad</div>
              <q-input
                v-model="formData.descripcion"
                filled
                dense
                label="Descripción detallada *"
                placeholder="Describe la novedad a detalle"
                type="textarea"
                :rows="4"
                :rules="[val => !!val || 'La descripción es requerida']"
              />
              
              <div class="form-group">
                <label class="form-label">Evidencia (PDF)</label>
                <q-file
                  v-model="formData.archivo"
                  outlined
                  label="Seleccionar archivo PDF"
                  accept="application/pdf"
                  max-file-size="5242880"
                  clearable
                  @update:model-value="handleFileUploadModal"
                >
                  <template #prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template #hint>
                    Formato permitido: PDF. Tamaño máximo: 5MB.
                  </template>
                </q-file>
              </div>
              
              <q-checkbox
                v-model="formData.requiereRevision"
                label="Confirmo que esta novedad requiere revisión administrativa."
                dense
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
            @click="closeFormDialog"
          />
          <Button
            label="Registrar Novedad"
            custom-class="gradient-btn"
            :disable="!formData.requiereRevision"
            @click="mostrarConfirmacion"
          />
        </div>
      </template>
    </Modal>

    <!-- Modal de confirmación -->
    <Modal
      v-model="showConfirmationDialog"
      variant="view"
      width="500px"
      max-width="90vw"
      persistent
    >
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="help_outline" class="q-mr-sm" />
            Confirmar registro
          </div>
        </div>
      </template>
      
      <template #body>
        <div class="confirmacion-body">
          <p class="confirmacion-texto">
            ¿Está seguro que desea registrar esta novedad?
          </p>
          <p class="confirmacion-subtexto">
            Esta acción enviará la novedad para revisión administrativa.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="row justify-end q-gutter-sm full-width">
          <Button
            custom-class="boton-cerrar"
            label="Cancelar"
            @click="cerrarConfirmacion"
          />
          <Button
            label="Confirmar"
            custom-class="gradient-btn"
            @click="confirmarGuardado"
          />
        </div>
      </template>
    </Modal>

    <!-- Modal de detalle de novedad -->
    <Modal
      v-model="showDetailDialog"
      variant="view"
      width="900px"
      max-width="90vw"
      @update:model-value="(val) => !val && closeDetailsDialog()"
    >
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="assignment" class="q-mr-sm" />
            Detalle de Novedad
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
                <div class="data-value">{{ selectedEntity.aprendiz || aprendizSeleccionado?.aprendiz || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Ficha:</div>
                <div class="data-value">{{ selectedEntity.ficha || aprendizSeleccionado?.ficha || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Programa:</div>
                <div class="data-value">{{ selectedEntity.programa || aprendizSeleccionado?.programa || '-' }}</div>
              </div>
            </div>
          </div>

          <div class="modal-column">
            <div class="section-title">Detalles de la Novedad</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Fecha:</div>
                <div class="data-value">{{ selectedEntity.fechaRegistro || selectedEntity.fecha || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Tipo:</div>
                <div class="data-value">{{ selectedEntity.tipoNovedad || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Estado:</div>
                <div class="data-value">
                  <q-badge
                    v-if="selectedEntity.estado"
                    :color="getEstadoColor(selectedEntity.estado)"
                    class="text-uppercase"
                  >
                    {{ selectedEntity.estado }}
                  </q-badge>
                  <span v-else>-</span>
                </div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Descripción:</div>
                <div class="data-value">{{ selectedEntity.descripcionCompleta || selectedEntity.observacion || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Acciones realizadas:</div>
                <div class="data-value">{{ selectedEntity.accionesRealizadas || 'Pendiente por revisión administrativa.' }}</div>
              </div>
              <div class="data-row" v-if="selectedEntity.documento">
                <div class="text-weight-bold">Documento:</div>
                <div class="data-value">
                  <Button
                    label="Ver PDF"
                    flat
                    :noCaps="true"
                    custom-class="link-button"
                    @click="verDocumento(selectedEntity.documento)"
                  />
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
          @click="closeDetailsDialog"
        />
      </template>
    </Modal>

    <!-- Modal Plantillas Seguimientos -->
    <Modal
      v-model="showTemplatesDialog"
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
              v-for="plantilla in plantillas" 
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
                    @click="visualizarPlantilla(plantilla)"
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
          @click="showTemplatesDialog = false"
        />
      </template>
    </Modal>

    <!-- Modal Visualizar Plantilla -->
    <Modal
      v-model="showPreviewDialog"
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
                @click="descargarPlantillaVisualizada"
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
          @click="showPreviewDialog = false"
        />
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useEntityManager } from 'src/composables/useEntityManager'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'

const router = useRouter()
const $q = useQuasar()

// ==================== CONFIGURACIÓN DEL COMPOSABLE ====================

const getDefaultFormData = () => ({
  _id: '',
  aprendizBusqueda: '',
  tipo: 'Seleccionar tipo',
  descripcion: '',
  fechaEvento: '',
  archivo: null,
  archivoNombre: '',
  requiereRevision: false
})

const endpoints = {
  list: '/novedades/list'
}

const customMessages = {
  listError: 'Error al listar novedades',
  noData: 'No hay novedades registradas'
}

// Función para construir parámetros de filtro personalizados
const buildNovedadesFilterParams = (filters, baseParams) => {
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
  applyFilters,
  resetForm,
  fetchEntities
} = useEntityManager({
  entityName: 'novedad',
  entityNamePlural: 'novedades',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  buildFilterParams: buildNovedadesFilterParams
})

// ==================== NO ES NECESARIO EXTENDER FILTROS ====================
// Solo se usa filtersData.search que ya viene del composable

// ==================== ESTADOS ESPECÍFICOS ====================
const mostrarVistaHistorial = ref(false)
const showConfirmationDialog = ref(false)
const showTemplatesDialog = ref(false)
const showPreviewDialog = ref(false)
const aprendizSeleccionado = ref(null)
const plantillaSeleccionada = ref(null)

const novedadesData = ref([
  {
    aprendiz: 'Luis Fernando Torres',
    documento: '11123638',
    ficha: '2924076',
    programa: 'Análisis y desarrollo de software',
    tipo: 'Deserción',
    fechaProgramada: '05/10/2025',
    fechaRealizada: '05/10/2025',
    estado: 'Validado',
    descripcion: 'El aprendiz decidió retirarse del programa por motivos personales y laborales.',
    evidencia: 'carta_retiro_luis_torres.pdf'
  },
  {
    aprendiz: 'María Amanda Ortiz',
    documento: '11684758',
    ficha: '3698456',
    programa: 'Hotelería y turismo',
    tipo: 'Desempeño',
    fechaProgramada: '06/10/2025',
    fechaRealizada: '08/10/2025',
    estado: 'Pendiente',
    descripcion: 'La aprendiz presenta bajo rendimiento académico en las últimas evaluaciones.',
    evidencia: null
  },
  {
    aprendiz: 'Gabriela Alejandra Ballesteros',
    documento: '1034968784',
    ficha: '2926076',
    programa: 'Análisis y desarrollo de software',
    tipo: 'Cambio de Condiciones',
    fechaProgramada: '10/10/2025',
    fechaRealizada: '05/10/2025',
    estado: 'Rechazado',
    descripcion: 'Solicitud de aplazamiento del programa por motivos de salud.',
    evidencia: 'certificado_medico.pdf'
  }
])

const historialNovedades = ref([
  {
    id: 1,
    fecha: '05/10/2025',
    tipoNovedad: 'Deserción',
    estado: 'Pendiente',
    observacion: 'Ausencia continua de 18 días consecutivos',
    documento: 'documento_desercion.pdf',
    fechaRegistro: '05/10/2025',
    descripcionCompleta: 'El aprendiz ha estado ausente de manera continua durante un período de 18 días consecutivos, sin presentar hasta la fecha ninguna justificación formal que respalde su inasistencia.',
    accionesRealizadas: 'Pendiente por revisión administrativa.'
  },
  {
    id: 2,
    fecha: '02/10/2025',
    tipoNovedad: 'Desempeño',
    estado: 'En proceso',
    observacion: 'Deficiencia técnica identificada',
    documento: 'evaluacion_desempeno.pdf',
    fechaRegistro: '02/10/2025',
    descripcionCompleta: 'El aprendiz presenta dificultades significativas en el desarrollo de competencias técnicas.',
    accionesRealizadas: 'Plan de mejora implementado. Seguimiento en curso.'
  }
])

const plantillas = ref([
  {
    id: 1,
    nombre: 'Seguimientos plantilla.pdf',
    icon: 'description'
  }
])

const tiposNovedadModal = ['Seleccionar tipo', 'Deserción', 'Problemas de desempeño', 'Cambio de condiciones', 'Otra']

// ==================== COMPUTED - NO SE USA SI TRABAJAS CON API ====================
// Este computed solo es útil si trabajas con datos locales (novedadesData)
// Si usas el API, rows ya viene filtrado del backend
// Comentado porque no se necesita con el composable
/*
const rowsNovedades = computed(() => {
  let resultado = [...novedadesData.value]
  
  if (filtersData.value.search && filtersData.value.search.trim()) {
    const needle = filtersData.value.search.toLowerCase().trim()
    resultado = resultado.filter(item => 
      (item.aprendiz && item.aprendiz.toLowerCase().includes(needle)) ||
      (item.documento && item.documento.toLowerCase().includes(needle))
    )
  }
  
  if (filtersData.value.ficha && filtersData.value.ficha.trim()) {
    const needle = filtersData.value.ficha.toLowerCase().trim()
    resultado = resultado.filter(item => 
      item.ficha && item.ficha.toLowerCase().includes(needle)
    )
  }
  
  if (filtersData.value.programa && filtersData.value.programa.trim()) {
    const needle = filtersData.value.programa.toLowerCase().trim()
    resultado = resultado.filter(item => 
      item.programa && item.programa.toLowerCase().includes(needle)
    )
  }
  
  return resultado
})
*/

// ==================== COLUMNAS DE TABLA ====================

const columnas = [
  {
    name: 'aprendiz',
    label: 'Aprendiz/Documento',
    align: 'left',
    field: 'aprendiz',
    sortable: true
  },
  {
    name: 'ficha',
    label: 'Ficha/Programa',
    align: 'left',
    field: 'ficha',
    sortable: true
  },
  {
    name: 'tipo',
    label: 'Tipo',
    align: 'center',
    field: 'tipo',
    sortable: true
  },
  {
    name: 'fechaProgramada',
    label: 'Fecha Programada',
    align: 'center',
    field: 'fechaProgramada',
    sortable: true
  },
  {
    name: 'fechaRealizada',
    label: 'Fecha Realizada',
    align: 'center',
    field: 'fechaRealizada',
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'center',
    field: 'estado',
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center',
    field: 'acciones'
  }
]

const columnasHistorial = [
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'center',
    field: 'fecha',
    sortable: true,
    width: '120px'
  },
  {
    name: 'tipoNovedad',
    label: 'Tipo de Novedad',
    align: 'center',
    field: 'tipoNovedad',
    sortable: true,
    width: '150px'
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'center',
    field: 'estado',
    sortable: true,
    width: '130px'
  },
  {
    name: 'observacion',
    label: 'Observación',
    align: 'left',
    field: 'observacion',
    sortable: true
  },
  {
    name: 'documento',
    label: 'Documento',
    align: 'center',
    field: 'documento',
    sortable: true,
    width: '120px'
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center',
    field: 'acciones',
    width: '100px'
  }
]

// ==================== COMPUTED ====================

const rowsNovedades = computed(() => {
  let resultado = [...novedadesData.value]
  
  if (filtersData.value.search && filtersData.value.search.trim()) {
    const needle = filtersData.value.search.toLowerCase().trim()
    resultado = resultado.filter(item => 
      (item.aprendiz && item.aprendiz.toLowerCase().includes(needle)) ||
      (item.documento && item.documento.toLowerCase().includes(needle))
    )
  }
  
  if (filtersData.value.ficha && filtersData.value.ficha.trim()) {
    const needle = filtersData.value.ficha.toLowerCase().trim()
    resultado = resultado.filter(item => 
      item.ficha && item.ficha.toLowerCase().includes(needle)
    )
  }
  
  if (filtersData.value.programa && filtersData.value.programa.trim()) {
    const needle = filtersData.value.programa.toLowerCase().trim()
    resultado = resultado.filter(item => 
      item.programa && item.programa.toLowerCase().includes(needle)
    )
  }
  
  return resultado
})

// ==================== FUNCIONES PRINCIPALES ====================

const verHistorial = (row) => {
  aprendizSeleccionado.value = { ...row }
  mostrarVistaHistorial.value = true
}

const cerrarHistorial = () => {
  mostrarVistaHistorial.value = false
  aprendizSeleccionado.value = null
}

const verDocumento = (documento) => {
  $q.notify({
    message: `Abriendo documento: ${documento}`,
    color: 'info',
    icon: 'description'
  })
}

const mostrarConfirmacion = () => {
  if (!formData.value.aprendizBusqueda) {
    $q.notify({
      message: 'Por favor busque y seleccione un aprendiz',
      color: 'negative',
      icon: 'warning'
    })
    return
  }

  if (formData.value.tipo === 'Seleccionar tipo' || !formData.value.tipo) {
    $q.notify({
      message: 'Por favor seleccione un tipo de novedad',
      color: 'negative',
      icon: 'warning'
    })
    return
  }

  if (!formData.value.descripcion) {
    $q.notify({
      message: 'Por favor ingrese una descripción detallada',
      color: 'negative',
      icon: 'warning'
    })
    return
  }

  if (!formData.value.fechaEvento) {
    $q.notify({
      message: 'Por favor ingrese la fecha del evento',
      color: 'negative',
      icon: 'warning'
    })
    return
  }

  if (!formData.value.requiereRevision) {
    $q.notify({
      message: 'Debe confirmar que la novedad requiere revisión administrativa',
      color: 'warning',
      icon: 'info'
    })
    return
  }

  showConfirmationDialog.value = true
}

const cerrarConfirmacion = () => {
  showConfirmationDialog.value = false
}

const confirmarGuardado = () => {
  const nuevaNovedadCompleta = {
    aprendiz: formData.value.aprendizBusqueda,
    documento: '00000000',
    ficha: '0000000',
    programa: 'Programa ejemplo',
    tipo: formData.value.tipo,
    fechaProgramada: formData.value.fechaEvento,
    fechaRealizada: formData.value.fechaEvento,
    estado: 'Pendiente',
    descripcion: formData.value.descripcion,
    evidencia: formData.value.archivoNombre
  }
  
  novedadesData.value.unshift(nuevaNovedadCompleta)
  
  showConfirmationDialog.value = false
  closeFormDialog()
  
  $q.notify({
    message: 'Novedad realizada satisfactoriamente',
    caption: 'La novedad se registró exitosamente y se enviará para su aprobación administrativa.',
    color: 'positive',
    icon: 'check_circle',
    position: 'top',
    timeout: 4000,
    actions: [
      { label: 'Cerrar', color: 'white', handler: () => { } }
    ]
  })
}

const verPlantillas = () => {
  showTemplatesDialog.value = true
}

const visualizarPlantilla = (plantilla) => {
  plantillaSeleccionada.value = plantilla
  showPreviewDialog.value = true
}

const descargarPlantillaVisualizada = () => {
  $q.notify({
    message: 'Descargando plantilla...',
    color: 'positive',
    icon: 'download'
  })
}

const getEstadoColor = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'validado':
    case 'permanente':
      return 'positive'
    case 'rechazado':
      return 'negative'
    case 'pendiente':
    case 'en proceso':
      return 'orange'
    default:
      return 'grey'
  }
}

const handleFileUploadModal = (file) => {
  if (file) {
    if (file.type === 'application/pdf') {
      formData.value.archivoNombre = file.name
      $q.notify({
        message: 'Archivo cargado correctamente',
        color: 'positive',
        icon: 'check_circle'
      })
    } else {
      $q.notify({
        message: 'Solo se permiten archivos PDF',
        color: 'negative',
        icon: 'error'
      })
    }
  }
}

// ==================== LIFECYCLE ====================

onMounted(() => {
  // Cargar novedades desde el API en lugar de datos locales
  fetchEntities()
})

// ==================== WATCHERS ====================

/**
 * Los watchers ya están manejados por el composable a través de
 * handleSearchChange y applyFilters que se llaman en los inputs
 * No es necesario agregar watchers adicionales
 */
</script>

<style scoped lang="sass">
.novedades-page
  min-height: calc(100vh - 90px - 56px)
  background-color: #f5f5f5
  padding-bottom: 30px

.content
  padding: 0 30px 30px

.filters-section
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)
  padding: 20px
  border-radius: 12px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
  border: 1px solid #E0E0E0

.action-buttons-row
  display: flex
  gap: 12px
  align-items: center
  justify-content: flex-start
  flex-wrap: wrap

  @media (max-width: 768px)
    width: 100%
    
    :deep(.app-button)
      flex: 1
      min-width: 140px

.aprendiz-cell,
.ficha-cell
  display: flex
  flex-direction: column
  gap: 4px

.aprendiz-nombre,
.ficha-numero
  font-weight: 600
  color: #333

.aprendiz-documento,
.ficha-programa
  font-size: 12px
  color: #666

.estado-badge
  display: inline-flex
  align-items: center
  gap: 6px
  padding: 4px 12px
  border-radius: 16px
  font-weight: 600
  font-size: 13px

.estado-validado
  background-color: #e8f5e9
  color: #2e7d32

  .q-icon
    color: #2e7d32

.estado-rechazado
  background-color: #ffebee
  color: #c62828

  .q-icon
    color: #c62828

.estado-pendiente
  background-color: #fff3e0
  color: #e65100

.historial-page
  min-height: 100vh
  background-color: #f5f5f5

.historial-header
  background-color: white
  padding: 20px 30px
  border-bottom: 1px solid #e0e0e0
  display: flex
  align-items: flex-start
  gap: 20px
  position: sticky
  top: 0
  z-index: 100
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)

.back-button-historial
  margin-top: 8px

.historial-title-section
  flex: 1

.historial-main-title
  color: #333
  font-size: 28px
  font-weight: bold
  margin: 0 0 8px 0

.historial-subtitle
  color: var(--color-primary)
  font-size: 22px
  font-weight: 600
  margin: 0 0 16px 0

.historial-info
  display: flex
  gap: 30px
  flex-wrap: wrap

.info-item
  font-size: 14px
  color: #666

  strong
    color: #333

.historial-content
  padding: 30px

.historial-table-container
  background-color: white
  border-radius: 12px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
  overflow: hidden

.fecha-cell,
.tipo-novedad-cell,
.observacion-cell,
.documento-cell
  font-size: 13px
  font-weight: 500

.observacion-cell
  max-width: 300px
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.acciones-cell
  display: flex
  justify-content: center
  gap: 8px

.confirmacion-body
  padding: 20px 0

.confirmacion-texto
  font-size: 16px
  font-weight: 500
  color: #333
  margin-bottom: 12px

.confirmacion-subtexto
  font-size: 14px
  color: #666

.plantillas-list
  max-height: 300px
  overflow-y: auto

.plantilla-item
  padding: 10px 15px
  border-bottom: 1px solid #eee
  display: flex
  align-items: center
  gap: 10px

  &:last-child
    border-bottom: none

.plantilla-nombre
  font-weight: 600
  color: #333
  font-size: 14px

.plantilla-actions
  display: flex
  gap: 8px

.plantilla-viewer
  display: flex
  flex-direction: column
  height: 100%

.pdf-container
  flex: 1
  display: flex
  flex-direction: column
  background-color: #f0f0f0
  border-radius: 8px
  overflow: hidden
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

.pdf-toolbar
  display: flex
  justify-content: flex-end
  padding: 10px 15px
  background-color: #f8f9fa
  border-bottom: 1px solid #e0e0e0

.pdf-preview
  flex: 1
  display: flex
  align-items: center
  justify-content: center
  background-color: #fff
  border-radius: 8px
  overflow: auto
  min-height: 500px

.pdf-placeholder
  text-align: center
  color: #999

  .q-icon
    margin-bottom: 10px

  p
    margin-bottom: 5px

  small
    font-size: 12px
    color: #bbb

.form-group
  margin-bottom: 16px

.form-label
  display: block
  font-size: 14px
  font-weight: 600
  color: #333
  margin-bottom: 8px

@media (max-width: 1024px)
  .content
    padding: 0 20px 20px
  
  .historial-content
    padding: 20px
  
  .filters-section
    padding: 15px

@media (max-width: 768px)
  .content
    padding: 0 15px 15px

  .filters-section
    padding: 15px

  .action-buttons-row
    justify-content: stretch
    
    :deep(.app-button)
      flex: 1
  
  .historial-header
    padding: 15px 20px
    flex-direction: column
    gap: 15px

  .historial-content
    padding: 15px

  .historial-main-title
    font-size: 24px

  .historial-subtitle
    font-size: 18px

  .historial-info
    flex-direction: column
    gap: 8px

@media (max-width: 480px)
  .content
    padding: 0 10px 10px
  
  .historial-content
    padding: 10px

  .filters-section
    padding: 12px

  .historial-main-title
    font-size: 20px

  .historial-subtitle
    font-size: 16px

  .info-item
    font-size: 12px

  .pdf-preview
    min-height: 300px
</style>