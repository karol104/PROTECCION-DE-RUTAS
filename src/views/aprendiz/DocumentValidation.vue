<template>
  <div class="q-pa-md">
    <BackButton />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="VALIDACIÓN DOCUMENTOS" 
              description="Envía tus documentos para continuar con el proceso de registro"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="container">
      <q-card class="section-card q-mb-lg">

        <q-card-section class="section-content">
          <div class="message-section q-mb-lg">
            <div class="message-text q-mb-md">
              Tu prerregistro ha sido aprobado exitosamente.
            </div>
            <div class="message-text">
              Para continuar con el proceso, por favor envía los siguientes documentos utilizando las plantillas adjuntas:
            </div>
          </div>

          <div class="recommendation-box q-mb-xl">
            <div class="recommendation-content">
              <q-icon name="info" size="20px" class="q-mr-sm" />
              <div class="recommendation-text">
                Te recomendamos revisar cuidadosamente que toda la información esté completa y firmada antes de enviarla.
              </div>
            </div>
          </div>

          <div class="upload-section q-mb-xl">
            <div class="upload-label-group q-mb-md">
              <div class="upload-label">Seleccionar archivo</div>
              <div class="upload-sublabel">Formatos permitidos: PDF</div>
            </div>
            <div class="upload-input-group">
              <q-file
                v-model="selectedFile"
                outlined
                dense
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                :disable="loading"
                clearable
                class="custom-file-input"
                @update:model-value="handleFileChange"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </div>
          </div>

          <div v-if="selectedFile" class="file-info-box q-mb-lg">
            <q-icon name="description" size="18px" class="q-mr-sm" />
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
          </div>

          <div class="form-actions">
            <Button
              label="Enviar Documentos"
              custom-class="gradient-btn"
              :loading="loading"
              :disable="!selectedFile"
              @click="openConfirmationDialog"
            />
            <Button
              label="Cancelar"
              custom-class="boton-cerrar"
              :disable="loading"
              @click="handleCancel"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Modal de confirmación -->
    <Modal v-model="showConfirmationDialog" width="500px" max-width="95vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="send" class="q-mr-sm" />
            Confirmar Envío
          </div>
        </div>
      </template>

      <template #body>
        <div class="q-pa-md text-center">
          <div class="text-h6 q-mb-md">¿Está seguro de que desea enviar este documento?</div>
          <p class="confirmation-text text-body1">
            Una vez enviado, el documento será revisado por el equipo administrativo.
            Recibirás una notificación cuando tu documento haya sido validado.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="row justify-end q-gutter-sm full-width">
          <Button
            label="Cancelar"
            custom-class="boton-cerrar"
            @click="closeConfirmationDialog"
            :disable="loading"
          />
          <Button
            label="Enviar"
            custom-class="gradient-btn"
            @click="submitDocuments"
            :loading="loading"
          />
        </div>
      </template>
    </Modal>

    <!-- Modal de cancelación -->
    <Modal v-model="showCancellationDialog" width="500px" max-width="95vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="cancel" class="q-mr-sm" color="negative" />
            Confirmar Cancelación
          </div>
        </div>
      </template>

      <template #body>
        <div class="q-pa-md text-center">
          <div class="text-h6 q-mb-md">¿Estás seguro de que deseas cancelar?</div>
          <p class="confirmation-text text-body1">
            Se perderá el archivo seleccionado y tendrás que volver a seleccionarlo si decides continuar más tarde.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="row justify-end q-gutter-sm full-width">
          <Button
            label="No, continuar"
            custom-class="gradient-btn"
            @click="closeCancellationDialog"
            :disable="loading"
          />
          <Button
            label="Sí, cancelar"
            custom-class="boton-cerrar"
            @click="confirmCancel"
            :disable="loading"
          />
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Button from 'src/components/Button.vue'
import Modal from 'src/components/Modal.vue'
import { getData, postData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'

const router = useRouter()
const $q = useQuasar()
// const { error, success, warning } = useNotifications()


const loading = ref(false)
const selectedFile = ref(null)
const showConfirmationDialog = ref(false)
const showCancellationDialog = ref(false)


onMounted(() => {
  fetchAprendizData()
})


async function fetchAprendizData() {
  try {
    loading.value = true
    // TODO: Implementar llamada al backend
    // const response = await getData('/aprendiz/perfil')
    // nombreAprendiz.value = response.data.nombre
    
    // Simulación temporal
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (err) {
    console.error('Error al cargar datos del aprendiz:', err)
    $q.notify({
      type: 'negative',
      message: err?.response?.data?.message || 'Error al cargar los datos del aprendiz',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function submitDocuments() {
  if (!selectedFile.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor selecciona un archivo',
      position: 'top'
    })
    return
  }

  try {
    loading.value = true
    
    // Crear FormData para enviar archivo
    const formData = new FormData()
    formData.append('documento', selectedFile.value)
    // formData.append('tipoDocumento', 'VALIDACION')
    // formData.append('aprendizId', aprendizId)
    
    // TODO: Implementar llamada al backend
    // const response = await postData('/documentos/validacion', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // })
    
    // Simulación temporal
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    $q.notify({
      type: 'positive',
      message: 'Documento enviado exitosamente',
      position: 'top'
    })
    
    closeConfirmationDialog()
    resetForm()
    
    // Redirigir después del envío exitoso
    setTimeout(() => {
      router.push('/dashboard') // Ajustar ruta según sea necesario
    }, 1500)
  } catch (err) {
    console.error('Error al enviar documentos:', err)
    $q.notify({
      type: 'negative',
      message: err?.response?.data?.message || 'Error al enviar el documento',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// Manejadores
function handleFileChange(file) {
  if (file) {
    // Validar tamaño del archivo (10MB máximo)
    const maxSize = 10 * 1024 * 1024 // 10MB en bytes
    if (file.size > maxSize) {
      $q.notify({
        type: 'warning',
        message: 'El archivo excede el tamaño máximo permitido (10MB)',
        position: 'top'
      })
      selectedFile.value = null
      return
    }
    
    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      $q.notify({
        type: 'warning',
        message: 'Tipo de archivo no permitido. Solo se aceptan PDF, Word e imágenes',
        position: 'top'
      })
      selectedFile.value = null
    }
  }
}

function openConfirmationDialog() {
  if (!selectedFile.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor selecciona un archivo antes de continuar',
      position: 'top'
    })
    return
  }
  showConfirmationDialog.value = true
}

function closeConfirmationDialog() {
  showConfirmationDialog.value = false
}

function closeCancellationDialog() {
  showCancellationDialog.value = false
}

function confirmCancel() {
  resetForm()
  closeCancellationDialog()
  router.back()
}

function handleCancel() {
  if (selectedFile.value) {
    showCancellationDialog.value = true
  } else {
    router.back()
  }
}

function resetForm() {
  selectedFile.value = null
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style lang="sass" scoped>
.container
  max-width: 1200px
  margin: 0 auto

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.section-card
  border-radius: 12px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
  overflow: hidden

.section-content
  padding: 25px 20px

.message-section
  text-align: center

.message-text
  font-size: 15px
  color: #5f6368
  line-height: 1.6

.recommendation-box
  background: #fff3cd
  border-left: 6px solid #ffc107
  border-radius: 8px
  padding: 15px

.recommendation-content
  display: flex
  align-items: flex-start
  gap: 10px

.recommendation-text
  font-size: 14px
  color: #856404
  line-height: 1.6
  flex: 1

.upload-section
  display: flex
  flex-direction: column
  gap: 15px

.upload-label-group
  display: flex
  flex-direction: column
  gap: 5px

.upload-label
  font-size: 14px
  font-weight: 600
  color: #000
  line-height: 1.2

.upload-sublabel
  font-size: 12px
  color: #666
  line-height: 1.2

.upload-input-group
  width: 280px

.custom-file-input
  width: 100%

.file-info-box
  background: #e8f5e9
  border-left: 4px solid #44b900
  padding: 12px 15px
  border-radius: 6px
  display: flex
  align-items: center
  gap: 8px

.file-name
  font-size: 13px
  font-weight: 600
  color: #1b5e20

.file-size
  font-size: 12px
  color: #666

.form-actions
  display: flex
  justify-content: center
  gap: 15px
  margin-top: 30px
  flex-wrap: wrap

.confirmation-text
  color: #5f6368
  line-height: 1.6

.file-preview
  display: flex
  flex-direction: column
  align-items: center
  gap: 8px
  padding: 15px
  background: #f5f5f5
  border-radius: 8px

.file-preview-name
  font-size: 13px
  font-weight: 600
  color: #333
  word-break: break-word
  text-align: center

.file-warning-text
  font-size: 12px
  color: #f57c00
  font-weight: 500
  margin-top: 5px

@media (max-width: 768px)
  .upload-input-group
    width: 100%

  .form-actions
    flex-direction: column
    width: 100%

  .form-actions button
    width: 100%

@media (max-width: 480px)
  .container
    padding: 0 10px

  .section-content
    padding: 20px 15px

  .message-text
    font-size: 14px

  .upload-label
    font-size: 13px

  .recommendation-text
    font-size: 13px

  .form-actions
    margin-top: 20px
</style>