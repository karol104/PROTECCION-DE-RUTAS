<template>
  <div class="contrato-wrapper">
  <div class="contrato-container q-pa-lg">
  <BackButton to="/app/aprendiz/registroep" :disabled="saving" />
    <div class="text-center q-mb-lg">
      <PageHeader title="Contrato de aprendizaje" align="center" />
    </div>
    <div class="text-body1 q-mb-md">
      <p>
        A continuación deberá enviar un archivo PDF con los siguientes documentos:
      </p>
      <ul class="q-pl-lg">
        <li>Contrato firmado por todas las partes</li>
        <li>Certificación de afiliación ARL</li>
        <li>Registro en planilla</li>
      </ul>
    </div>

    <!-- Subida de documento -->
      <div class="document-section q-pa-md q-mb-lg">
        <div class="doc-label text-weight-bold text-green-9 q-mb-sm">
          Documento PDF requerido
        </div>

        <!-- Botón que abre directamente el selector de archivos -->
        <div class="q-mb-md text-center">
          <Button label="Seleccionar archivo" @click="triggerFileSelect" icon="attach_file" />
        </div>

        <!-- input file oculto que se dispara al pulsar el botón -->
        <input ref="hiddenFileInput" type="file" accept="application/pdf" style="display:none" @change="handleHiddenFileChange" />

        <div v-if="fileName" class="text-caption q-mt-sm text-center">
          Archivo seleccionado: <strong>{{ fileName }}</strong>
        </div>
      </div>

      <!-- (Se usa input file oculto y selección directa; no se muestra modal) -->

    <!-- Fecha estimada -->
    <div class="fecha-section q-mb-md">
      <p class="text-subtitle2 text-weight-bold">
        Fecha estimada de finalización: {{ fechaFinalizacion }}
      </p>
    </div>

    <!-- Botón de envío -->
    <div class="text-right">
      <Button label="ENVIAR SOLICITUD" @click="enviarSolicitud" />
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNotifications } from 'src/composables/useNotifications'
import Button from 'src/components/Button.vue'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'

// Composables
const notifications = useNotifications()
const uploadFile = ref(null)
const isUploading = ref(false)
const fileName = ref('')
const fechaFinalizacion = ref('') // Será calculada por el backend
const saving = ref(false)
const hiddenFileInput = ref(null)

const triggerFileSelect = () => {
  hiddenFileInput.value?.click()
}

const handleHiddenFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!validateFile(file)) {
    event.target.value = ''
    return
  }

  uploadFile.value = file
  fileName.value = file.name
  
  // Limpiar el input para permitir re-selección del mismo archivo si se necesita
  event.target.value = ''
}

// Acción al enviar solicitud - aquí se debe llamar al backend
const enviarSolicitud = async () => {
  if (!fileName.value || !uploadFile.value) {
    notifications.warning('Por favor selecciona un archivo PDF antes de enviar.')
    return
  }

  try {
    saving.value = true
    
    // TODO: Aquí va la llamada al backend
    // const formData = new FormData()
    // formData.append('archivo', fileUpload.uploadFile.value)
    // formData.append('modalidad', 'contrato_aprendizaje')
    // const response = await apiClient.post('/etapa-productiva/registrar', formData)
    // fechaFinalizacion.value = response.data.fecha_finalizacion
    // notifications.success(response.data.message)
    
  } catch (error) {
    // El error ya se maneja en el composable o en el apiClient
    const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message
    if (errorMessage) {
      notifications.error(errorMessage)
    }
  } finally {
    saving.value = false
  }
}

const validateFile = (file) => {
  if (!file) {
    notifications.error('Por favor selecciona un archivo')
    return false
  }

  const maxSize = 10 * 1024 * 1024 // 10MB por defecto
  if (file.size > maxSize) {
    notifications.error('El archivo supera el tamaño máximo permitido de 10MB')
    return false
  }

  const allowedExtensions = ['.pdf']
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  let isAllowed = false
  let index = 0
  while (index < allowedExtensions.length && !isAllowed) {
    if (allowedExtensions[index] === fileExtension) {
      isAllowed = true
    }
    index++
  }

  if (!isAllowed || file.type !== 'application/pdf') {
    notifications.error('Formato de archivo no permitido. Usa PDF')
    return false
  }

  return true
}
</script>

<style scoped>
.contrato-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  
  min-height: calc(100vh - 140px);
  padding-top: 20px;
}
.contrato-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.document-section {
  background: #f5f5f5;
  border-radius: 12px;
  border: 2px solid #4caf50;
  text-align: center;
}

.input-file {
  display: block;
  margin: 0 auto;
}

.fecha-section {
  border-top: 3px solid #4caf50;
  padding-top: 10px;
  text-align: left;
}
</style>