<template>
  <div class="pasantia-wrapper">
  <div class="pasantia-container q-pa-lg">
  <BackButton to="/app/aprendiz/registroep" :disabled="saving" />
    <div class="text-center q-mb-lg">
      <PageHeader title="Pasantía U.P. Familiar" align="center" />
    </div>
    <div class="text-body1 q-mb-md">
      <p>
        A continuación deberá enviar un archivo PDF con los siguientes documentos:
      </p>
      <ul class="q-pl-lg">
        <li>Convenio o carta de aceptación empresa</li>
        <li>Certificación ARL (cuando aplique)</li>
        <li>Formato de selección de alternativa</li>
        <li>Cronograma de actividades</li>
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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import Button from 'src/components/Button.vue'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'


const $q = useQuasar()

// Estado del archivo
const fileName = ref('')
const fechaFinalizacion = ref('')

// Estado de subida simplificado: selección directa sin modal
const uploadFile = ref(null)
const saving = ref(false)
const hiddenFileInput = ref(null)

// Calcular fecha de finalización (Pasantía U.P. Familiar: 4 a 6 meses, promedio 5 meses - 640 horas mínimo)
const calcularFechaFinalizacion = () => {
  const fechaInicioGuardada = localStorage.getItem('registroEP_fechaConfirmada')
  if (fechaInicioGuardada) {
    const fecha = new Date(fechaInicioGuardada)
    // Agregar 5 meses (promedio entre 4 y 6)
    fecha.setMonth(fecha.getMonth() + 5)
    
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const anio = fecha.getFullYear()
    
    fechaFinalizacion.value = `${dia}/${mes}/${anio}`
  } else {
    fechaFinalizacion.value = 'No definida'
  }
}

onMounted(() => {
  calcularFechaFinalizacion()
})

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const triggerFileSelect = () => {
  hiddenFileInput.value?.click()
}

const handleHiddenFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validaciones similares a Empresas.vue
  if (file.type !== 'application/pdf') {
    $q.notify({ type: 'negative', message: 'Formato de archivo no permitido. Use PDF' })
    event.target.value = ''
    return
  }

  const maxSize = 5242880 // 5MB
  if (file.size > maxSize) {
    $q.notify({ type: 'negative', message: 'El archivo supera el tamaño máximo permitido de 5MB' })
    event.target.value = ''
    return
  }

  uploadFile.value = file
  // Simular el comportamiento de "Adjuntar" automático
  attachDocument()
  // limpiar el input para permitir re-selección del mismo archivo si se necesita
  event.target.value = ''
}

const attachDocument = async () => {
  if (!uploadFile.value) {
    $q.notify({ type: 'warning', message: 'Por favor selecciona un archivo PDF antes de adjuntar.' })
    return
  }

  try {
    saving.value = true
    // Asignar el nombre localmente (aquí podríamos llamar al backend si es necesario)
    fileName.value = uploadFile.value.name
    $q.notify({ type: 'positive', message: 'Archivo adjuntado correctamente' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al adjuntar archivo' })
  } finally {
    saving.value = false
  }
}

// Acción al enviar solicitud (usa fileName que se llena desde la selección directa)
const enviarSolicitud = () => {
  if (!fileName.value) {
    $q.notify({ type: 'warning', message: 'Por favor selecciona un archivo PDF antes de enviar.' })
    return
  }

  $q.notify({ type: 'positive', message: `✅ Solicitud enviada correctamente con el archivo: ${fileName.value}` })
}
</script>

<style scoped>
.pasantia-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  
  min-height: calc(100vh - 140px);
  padding-top: 20px;
}
.pasantia-container {
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