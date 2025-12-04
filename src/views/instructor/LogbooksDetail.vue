<template>
  <div class="bitacora-detalle-container">
    <BackButton :size="40" class="back-arrow" />

    <div class="content-wrapper">
      <PageHeader title="Bitácoras" />

      <!-- Tabla de bitácoras detalladas -->
      <div class="tabla-wrapper">
        <div class="botones-superiores">
          <Button 
            icon="reorder"
            label="Filtrar" 
            custom-class="btn-filtrar"
            no-caps
          />
        </div>

        <Table
          :rows="bitacorasDetalle"
          :columns="columnasDetalle"
          row-key="id"
          :rows-per-page-options="[5, 10, 20]"
          :pagination="pagination"
          :card="true"
          @update:pagination="pagination = $event"
        >
          <!-- Slot personalizado para opciones -->
          <template #body-cell-opciones="props">
            <q-td :props="props" class="text-center">
              <div class="opciones-icons">
                <ButtonTableOptions 
                  icon="visibility" 
                  color="grey-7"
                  tooltip="Ver"
                  @click="verBitacora(props.row)"
                />
                
                <ButtonTableOptions 
                  icon="check" 
                  color="grey-7"
                  tooltip="Aprobar"
                  @click="aprobarBitacora(props.row)"
                />
                
                <ButtonTableOptions 
                  icon="close" 
                  color="grey-7"
                  tooltip="Rechazar"
                  @click="rechazarBitacora(props.row)"
                />
                
                <ButtonTableOptions 
                  icon="upload" 
                  color="grey-7"
                  tooltip="Subir Bitácora"
                  @click="subirBitacora(props.row)"
                />
              </div>
            </q-td>
          </template>
        </Table>
      </div>
    </div>

    <!-- Modal para visualizar PDF -->
    <Modal 
      v-model="showPdfModal"
      variant="view"
      width="90vw"
      max-width="1200px"
    >
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="picture_as_pdf" class="q-mr-sm" />
            Visualizar Bitácora - {{ bitacoraSeleccionada?.bitacora || 'Documento' }}
          </div>
        </div>
      </template>
      
      <template #body>
        <div class="pdf-container">
          <iframe 
            :src="pdfUrl" 
            frameborder="0"
            class="pdf-iframe"
          ></iframe>
        </div>
      </template>
      
      <template #footer>
        <Button 
          label="Cerrar" 
          custom-class="boton-cerrar"
          @click="cerrarModal" 
        />
      </template>
    </Modal>

    <!-- Modal de confirmación para aprobar -->
    <Modal v-model="showConfirmModal" variant="view" width="500px" max-width="90vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="help" class="q-mr-sm" />
            Confirmar Acción
          </div>
        </div>
      </template>
      
      <template #body>
        <div class="text-center q-pa-md">
          <div class="text-body1">¿Estás seguro de que deseas aceptar la bitácora?</div>
        </div>
      </template>
      
      <template #footer>
        <Button
          label="Cancelar"
          custom-class="boton-cerrar"
          :disable="confirmLoading"
          @click="cancelarAprobacion"
        />
        <Button
          label="Aceptar"
          :loading="confirmLoading"
          @click="confirmarAprobacion"
        />
      </template>
    </Modal>

    <!-- Modal para aceptar bitácora con formulario -->
    <Modal v-model="showAceptarModal" width="600px" variant="edit" max-width="95vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="check_circle" class="q-mr-sm" />
            Aceptar Bitácora
          </div>
        </div>
      </template>

      <template #body>
        <q-form @submit.prevent="procesarAceptacion">
          <div class="modal-content-single">
            <div class="section-title">Información de Aprobación</div>
            <q-input
              v-model="formAceptar.instructor"
              filled
              dense
              label="Instructor *"
              placeholder="Nombre del instructor"
              :rules="[val => !!val || 'El nombre del instructor es requerido']"
            />
            <q-input
              v-model="formAceptar.fecha"
              filled
              dense
              label="Fecha *"
              type="date"
              :rules="[val => !!val || 'La fecha es requerida']"
            />
          </div>
        </q-form>
      </template>

      <template #footer>
        <div class="row justify-end q-gutter-sm full-width">
          <Button
            custom-class="boton-cerrar"
            label="Cancelar"
            @click="showAceptarModal = false"
          />
          <Button
            label="Aceptar Bitácora"
            custom-class="gradient-btn"
            :loading="aceptarLoading"
            @click="procesarAceptacion"
          />
        </div>
      </template>
    </Modal>

    <!-- Modal de éxito -->
    <Modal v-model="showSuccessModal" variant="view" width="500px" max-width="90vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="check_circle" color="green" class="q-mr-sm" />
            Confirmación
          </div>
        </div>
      </template>
      
      <template #body>
        <div class="text-center q-pa-md">
          <div class="text-body1 q-mb-sm">La bitácora ha sido confirmada.</div>
          <div class="text-body2">Una notificación llegara al aprendiz.</div>
        </div>
      </template>
      
      <template #footer>
        <Button
          label="Aceptar"
          @click="cerrarSuccessModal"
        />
      </template>
    </Modal>

    <!-- Modal de confirmación para rechazar -->
    <Modal v-model="showRechazarConfirmModal" variant="view" width="500px" max-width="90vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="help" class="q-mr-sm" />
            Confirmar Rechazo
          </div>
        </div>
      </template>
      
      <template #body>
        <div class="text-center q-pa-md">
          <div class="text-body1">¿Estás seguro de que deseas rechazar la bitácora?</div>
        </div>
      </template>
      
      <template #footer>
        <Button
          label="Cancelar"
          custom-class="boton-cerrar"
          :disable="rechazarConfirmLoading"
          @click="cancelarRechazoConfirm"
        />
        <Button
          label="Aceptar"
          :loading="rechazarConfirmLoading"
          @click="confirmarRechazo"
        />
      </template>
    </Modal>

    <!-- Modal para rechazar bitácora con formulario -->
    <Modal v-model="showRechazarModal" width="700px" variant="edit" max-width="95vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="cancel" class="q-mr-sm" />
            Rechazar Bitácora
          </div>
        </div>
      </template>

      <template #body>
        <q-form @submit.prevent="procesarRechazo">
          <div class="modal-content-single">
            <div class="section-title">Información de Rechazo</div>
            <q-input
              v-model="formRechazar.instructor"
              filled
              dense
              label="Instructor *"
              placeholder="Nombre del instructor"
              :rules="[val => !!val || 'El nombre del instructor es requerido']"
            />
            <q-input
              v-model="formRechazar.fecha"
              filled
              dense
              label="Fecha *"
              type="date"
              :rules="[val => !!val || 'La fecha es requerida']"
            />
            <q-input
              v-model="formRechazar.comentario"
              filled
              dense
              label="Comentario *"
              type="textarea"
              placeholder="Escribe un comentario sobre el rechazo..."
              :rows="4"
              :rules="[val => !!val || 'El comentario es requerido']"
            />
          </div>
        </q-form>
      </template>

      <template #footer>
        <div class="row justify-end q-gutter-sm full-width">
          <Button
            custom-class="boton-cerrar"
            label="Cancelar"
            @click="showRechazarModal = false"
          />
          <Button
            label="Rechazar Bitácora"
            custom-class="gradient-btn"
            :loading="rechazarLoading"
            @click="procesarRechazo"
          />
        </div>
      </template>
    </Modal>

    <!-- Modal de éxito rechazar -->
    <Modal v-model="showRechazarSuccessModal" variant="view" width="500px" max-width="90vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="info" color="orange" class="q-mr-sm" />
            Confirmación de Rechazo
          </div>
        </div>
      </template>
      
      <template #body>
        <div class="text-center q-pa-md">
          <div class="text-body1 q-mb-sm">La bitácora ha sido rechazada.</div>
          <div class="text-body2">Una notificación llegara al aprendiz.</div>
        </div>
      </template>
      
      <template #footer>
        <Button
          label="Aceptar"
          @click="cerrarRechazarSuccessModal"
        />
      </template>
    </Modal>

    <!-- Modal para subir bitácora -->
    <Modal v-model="showSubirModal" width="700px" variant="edit" max-width="95vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="cloud_upload" class="q-mr-sm" />
            Subir Bitácora Firmada
          </div>
        </div>
      </template>

      <template #body>
        <q-form @submit.prevent="procesarSubida">
          <div class="modal-content-single">
            <div class="section-title">Información del Instructor</div>
            <q-input
              v-model="formSubir.instructor"
              filled
              dense
              label="Instructor *"
              placeholder="Nombre del instructor"
              :rules="[val => !!val || 'El nombre del instructor es requerido']"
            />
            <q-input
              v-model="formSubir.fecha"
              filled
              dense
              label="Fecha *"
              type="date"
              :rules="[val => !!val || 'La fecha es requerida']"
            />
            <q-input
              v-model="formSubir.comentario"
              filled
              dense
              label="Comentario *"
              type="textarea"
              placeholder="Escribe un comentario..."
              :rows="3"
              :rules="[val => !!val || 'El comentario es requerido']"
            />

            <div class="section-title q-mt-lg">Archivo de Bitácora</div>
            <q-file
              v-model="archivoSeleccionado"
              outlined
              label="Seleccionar archivo"
              accept=".pdf,.doc,.docx"
              max-file-size="5242880"
              clearable
            >
              <template #prepend>
                <q-icon name="attach_file" />
              </template>
              <template #hint>
                Formatos permitidos: PDF, DOC, DOCX. Tamaño máximo: 5MB.
              </template>
            </q-file>

            <div v-if="archivoSeleccionado" class="q-my-md">
              <q-banner class="bg-green-1 text-green-8" rounded>
                <template #avatar>
                  <q-icon name="check_circle" color="green" />
                </template>
                Archivo seleccionado: {{ archivoSeleccionado.name }}
              </q-banner>
            </div>
          </div>
        </q-form>
      </template>

      <template #footer>
        <div class="row justify-end q-gutter-sm full-width">
          <Button
            custom-class="boton-cerrar"
            label="Cancelar"
            @click="showSubirModal = false"
          />
          <Button
            label="Subir Archivo"
            custom-class="gradient-btn"
            :loading="subirLoading"
            :disable="!archivoSeleccionado"
            @click="procesarSubida"
          />
        </div>
      </template>
    </Modal>

    <!-- Modal de éxito subir -->
    <Modal v-model="showSubirSuccessModal" variant="view" width="500px" max-width="90vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="cloud_done" color="green" class="q-mr-sm" />
            Archivo Subido
          </div>
        </div>
      </template>
      
      <template #body>
        <div class="text-center q-pa-md">
          <div class="text-body1 q-mb-sm">Bitácora subida exitosamente.</div>
          <div class="text-body2">La bitácora ha sido actualizada correctamente.</div>
        </div>
      </template>
      
      <template #footer>
        <Button
          label="Aceptar"
          @click="cerrarSubirSuccessModal"
        />
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BackButton from 'src/components/BackButton.vue'
import Button from 'src/components/Button.vue'
import Table from 'src/components/Table.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Modal from 'src/components/Modal.vue'
import PageHeader from 'src/components/PageHeader.vue'

const route = useRoute()
const showPdfModal = ref(false)
const showConfirmModal = ref(false)
const showAceptarModal = ref(false)
const showSuccessModal = ref(false)
const showRechazarConfirmModal = ref(false)
const showRechazarModal = ref(false)
const showRechazarSuccessModal = ref(false)
const showSubirModal = ref(false)
const showSubirSuccessModal = ref(false)
const pdfUrl = ref('')
const bitacoraSeleccionada = ref(null)
const confirmLoading = ref(false)
const aceptarLoading = ref(false)
const rechazarConfirmLoading = ref(false)
const rechazarLoading = ref(false)
const subirLoading = ref(false)
const archivoSeleccionado = ref(null)
const formAceptar = ref({
  instructor: '',
  fecha: ''
})
const formRechazar = ref({
  instructor: '',
  fecha: '',
  comentario: ''
})
const formSubir = ref({
  instructor: '',
  fecha: '',
  comentario: ''
})

// Datos de ejemplo - reemplazar con datos reales del backend
const bitacorasDetalle = ref([
  {
    id: 1,
    bitacora: 'Bitácora 1',
    estado: 'Revisada',
    fechaEntrega: '23/12/2025',
    pdfUrl: 'https://pdfobject.com/pdf/sample.pdf'
  },
  {
    id: 2,
    bitacora: 'Bitácora 2',
    estado: 'No revisada',
    fechaEntrega: '23/12/2025',
    pdfUrl: 'https://pdfobject.com/pdf/sample.pdf'
  },
  {
    id: 3,
    bitacora: 'Bitácora 3',
    estado: 'Rechazada',
    fechaEntrega: '23/12/2025',
    pdfUrl: 'https://pdfobject.com/pdf/sample.pdf'
  },
  {
    id: 4,
    bitacora: 'Bitácora 4',
    estado: 'Aceptada',
    fechaEntrega: '23/12/2025',
    pdfUrl: 'https://pdfobject.com/pdf/sample.pdf'
  }
])

// Paginación
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: bitacorasDetalle.value.length
})

// Definición de columnas
const columnasDetalle = [
  {
    name: 'bitacora',
    label: 'Bitácoras',
    field: 'bitacora',
    align: 'left',
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'left',
    sortable: true
  },
  {
    name: 'fechaEntrega',
    label: 'Fecha de entrega',
    field: 'fechaEntrega',
    align: 'left',
    sortable: true
  },
  {
    name: 'opciones', 
    label: 'Opciones',
    field: 'opciones',
    align: 'center'
  }
]

onMounted(() => {
  const aprendizId = route.params.id
  console.log('Cargando bitácoras del aprendiz:', aprendizId)
})

function verBitacora(row) {
  console.log('Ver bitácora:', row)
  bitacoraSeleccionada.value = row
  pdfUrl.value = row.pdfUrl || 'https://pdfobject.com/pdf/sample.pdf'
  showPdfModal.value = true
}

function aprobarBitacora(row) {
  bitacoraSeleccionada.value = row
  showConfirmModal.value = true
}

function confirmarAprobacion() {
  confirmLoading.value = true
  
  setTimeout(() => {
    confirmLoading.value = false
    showConfirmModal.value = false
    showAceptarModal.value = true
  }, 500)
}

function cancelarAprobacion() {
  showConfirmModal.value = false
  bitacoraSeleccionada.value = null
}

function procesarAceptacion() {
  if (!formAceptar.value.instructor.trim() || !formAceptar.value.fecha) {
    console.warn('Debe completar todos los campos')
    return
  }

  aceptarLoading.value = true
  
  setTimeout(() => {
    console.log('Aprobar bitácora:', {
      bitacora: bitacoraSeleccionada.value,
      instructor: formAceptar.value.instructor,
      fecha: formAceptar.value.fecha
    })
    
    bitacoraSeleccionada.value.estado = 'Aceptada'
    
    aceptarLoading.value = false
    showAceptarModal.value = false
    showSuccessModal.value = true
  }, 1000)
}

function cerrarSuccessModal() {
  showSuccessModal.value = false
  bitacoraSeleccionada.value = null
  formAceptar.value = { instructor: '', fecha: '' }
}

function rechazarBitacora(row) {
  bitacoraSeleccionada.value = row
  showRechazarConfirmModal.value = true
}

function confirmarRechazo() {
  rechazarConfirmLoading.value = true
  
  setTimeout(() => {
    rechazarConfirmLoading.value = false
    showRechazarConfirmModal.value = false
    showRechazarModal.value = true
  }, 500)
}

function cancelarRechazoConfirm() {
  showRechazarConfirmModal.value = false
  bitacoraSeleccionada.value = null
}

function procesarRechazo() {
  if (!formRechazar.value.instructor.trim() || !formRechazar.value.fecha || !formRechazar.value.comentario.trim()) {
    console.warn('Debe completar todos los campos')
    return
  }

  rechazarLoading.value = true
  
  setTimeout(() => {
    console.log('Rechazar bitácora:', {
      bitacora: bitacoraSeleccionada.value,
      instructor: formRechazar.value.instructor,
      fecha: formRechazar.value.fecha,
      comentario: formRechazar.value.comentario
    })
    
    bitacoraSeleccionada.value.estado = 'Rechazada'
    
    rechazarLoading.value = false
    showRechazarModal.value = false
    showRechazarSuccessModal.value = true
  }, 1000)
}

function cerrarRechazarSuccessModal() {
  showRechazarSuccessModal.value = false
  bitacoraSeleccionada.value = null
  formRechazar.value = { instructor: '', fecha: '', comentario: '' }
}

function subirBitacora(row) {
  bitacoraSeleccionada.value = row
  showSubirModal.value = true
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    archivoSeleccionado.value = file
  }
}

function procesarSubida() {
  if (!formSubir.value.instructor.trim() || !formSubir.value.fecha || !formSubir.value.comentario.trim() || !archivoSeleccionado.value) {
    console.warn('Debe completar todos los campos y seleccionar un archivo')
    return
  }

  subirLoading.value = true
  
  setTimeout(() => {
    console.log('Subir bitácora:', {
      bitacora: bitacoraSeleccionada.value,
      instructor: formSubir.value.instructor,
      fecha: formSubir.value.fecha,
      comentario: formSubir.value.comentario,
      archivo: archivoSeleccionado.value.name
    })
    
    subirLoading.value = false
    showSubirModal.value = false
    showSubirSuccessModal.value = true
  }, 1000)
}

function cerrarSubirSuccessModal() {
  showSubirSuccessModal.value = false
  bitacoraSeleccionada.value = null
  formSubir.value = { instructor: '', fecha: '', comentario: '' }
  archivoSeleccionado.value = null
}

function cerrarModal() {
  showPdfModal.value = false
  bitacoraSeleccionada.value = null
  pdfUrl.value = ''
}
</script>

<style scoped>
.bitacora-detalle-container {
  min-height: 100vh;
  padding: 30px 20px;
  position: relative;
  background-color: #f5f5f5;
}

.back-arrow {
  position: absolute;
  left: 40px;
  top: 100px;
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 10;
}

.back-arrow:hover {
  transform: translateX(-5px);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 20px;
}

/* Botones superiores */
.botones-superiores {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 0 20px;
}

.btn-filtrar {
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

/* Tabla */
.tabla-wrapper {
  margin: 0 auto;
  width: 100%;
}

.tabla-wrapper :deep(.q-table tbody td:not(:last-child)) {
  text-align: left !important;
}

.tabla-wrapper :deep(.q-table thead th:not(:last-child)) {
  text-align: left !important;
}

/* Iconos de opciones */
.opciones-icons {
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
}

.opciones-icons :deep(.q-btn) {
  margin: 0 2px;
}

/* Estilos del PDF */
.pdf-container {
  width: 100%;
  height: 70vh;
  min-height: 500px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}


/* Estilos del archivo */
.file-upload-container {
  width: 100%;
}

.file-upload-btn {
  width: 100%;
  border: 2px solid #39a900;
  color: #39a900;
  font-weight: 600;
}

.file-upload-btn:hover {
  background-color: rgba(57, 169, 0, 0.1);
}

.file-selected {
  display: flex;
  align-items: center;
  color: #39a900;
  font-size: 14px;
}

.file-hint {
  font-size: 13px;
  color: #666;
  font-style: italic;
}

.file-info {
  font-size: 12px;
  color: #999;
}


/* Responsive */
@media (max-width: 1024px) {
  .content-wrapper {
    padding-top: 15px;
  }
}

@media (max-width: 768px) {
  .back-arrow {
    left: 20px;
    top: 80px;
  }

  .botones-superiores {
    flex-direction: column;
    padding: 0 10px;
  }

  .btn-filtrar {
    width: 100%;
    justify-content: center;
  }

  .tabla-wrapper {
    width: 100%;
  }

  .opciones-icons {
    flex-wrap: wrap;
  }

  .pdf-container {
    height: 60vh;
    min-height: 400px;
  }
}


@media (max-width: 480px) {
  .bitacora-detalle-container {
    padding: 20px 10px;
  }

  .btn-filtrar {
    font-size: 13px;
    padding: 8px 16px;
  }

  .opciones-icons :deep(.q-btn) {
    padding: 4px;
  }

  .pdf-container {
    height: 50vh;
    min-height: 300px;
  }

}
</style>