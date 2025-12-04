<template>
  <div class="page-content">
    <BackButton/>
    <PageHeader title="Documentos y Carga de Bitácoras" />

    <!-- Pestañas -->
    <div class="tabs-container">
      <Button 
        :class="['tab-btn', { active: activeTab === 'plantillas' }]" 
        label="Plantillas" 
        @click="activeTab = 'plantillas'" 
      />
      <Button 
        :class="['tab-btn', { active: activeTab === 'aprobadas' }]" 
        label="Bitácoras Aprobadas"  
        @click="activeTab = 'aprobadas'" 
      />
      <Button 
        :class="['tab-btn', { active: activeTab === 'subir' }]" 
        label="Subir Bitácoras"  
        @click="activeTab = 'subir'" 
      />
    </div>

  
    <div class="contenido-principal">
      <!-- PLANTILLAS -->
      <div v-if="activeTab === 'plantillas'" class="tab-panel">
        <div class="plantillas-grid">
          <div v-for="template in templates" :key="template.id" class="plantilla-card">
            <div class="plantilla-preview">
              <img v-if="template.imagen" :src="template.imagen" :alt="template.nombre" class="preview-image" />
              
            </div>
            <div class="plantilla-nombre">{{ template.nombre }}</div>
            <div class="plantilla-acciones">
              <ButtonTableOptions 
                :show-edit="false" 
                :show-delete="false" 
                :custom-buttons="[
                  { icon: 'visibility', tooltip: 'Visualizar', action: () => visualizarPlantilla(template) },
                  { icon: 'file_download', tooltip: 'Descargar', action: () => descargarPlantilla(template) }
                ]"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- BITÁCORAS APROBADAS -->
      <div v-if="activeTab === 'aprobadas'" class="tab-panel">
        <Table 
          :data="approvedLogs" 
          :columns="columns" 
          row-key="id" 
          no-data-label="No hay bitácoras aprobadas"
          :rows-per-page-options="[5, 10, 20]" 
          :initial-rows-per-page="5"
        />
      </div>

      <!-- SUBIR BITÁCORAS -->
      <div v-if="activeTab === 'subir'" class="tab-panel upload-section">
        <Table 
          :data="approvedLogs" 
          :columns="columns" 
          row-key="id" 
          no-data-label="No hay bitácoras"
          :rows-per-page-options="[5, 10, 20]" 
          :initial-rows-per-page="5"
        />
      </div>
    </div>

    <!-- Botón flotante subir -->
    <q-page-sticky v-if="activeTab === 'subir'" position="bottom-left" :offset="[30, 30]">
      <q-btn fab icon="add" size="lg" @click="abrirDialogSubir" style="background-color: var(--color-primary); color: white;">
        <q-tooltip>Subir bitácoras</q-tooltip>
      </q-btn>
    </q-page-sticky>

    <Modal ref="uploadModal">
      <template #header>
        <div class="modal-header-content">
          <div class="text-h6">Selecciona tus bitácoras</div>
          <Button
            flat 
            round 
            dense 
            icon="close" 
            color="white"
            @click="cerrarDialogSubir"
          />
        </div>
      </template>

      <!-- Contenido del modal -->
      <template #default>
        <div class="modal-body-content">
          <!-- Selector de archivos -->
          <q-file 
            v-model="selectedFiles" 
            multiple 
            outlined 
            dense 
            label="Seleccionar archivos" 
            accept=".pdf,.doc,.docx"
            @update:model-value="seleccionarArchivos"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
            
            <template v-slot:hint>
              {{ selectedFiles.length > 0 
                ? `${selectedFiles.length} archivo(s) seleccionado(s)` 
                : 'Ningún archivo seleccionado' }}
            </template>
          </q-file>

          <div v-if="selectedFiles.length" class="archivos-lista">
            <div v-for="(file, i) in selectedFiles" :key="i" class="archivo-item">
              <q-icon name="description" color="grey-7" />
              <span class="archivo-nombre">{{ file.name }}</span>
              <q-icon name="check_circle" color="green-7" />
            </div>
          </div>

    
          <div v-if="isLoading" class="loading-container">
            <q-spinner color="green-7" size="40px" />
            <p class="loading-text">Subiendo archivos...</p>
          </div>
        </div>
      </template>

      <!-- Footer con botones personalizados -->
      <template #footer>
        <div class="modal-footer-buttons">
          <Button label="Cancelar" custom-class="btn-cancelar" @click="cerrarDialogSubir" />
          <Button 
            label="Subir Bitácoras"
            custom-class="btn-enviar"
            @click="subirBitacoras"
            :disable="selectedFiles.length === 0 || isLoading"
          />
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import Button from 'src/components/Button.vue'
import BackButton from 'src/components/BackButton.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import PageHeader from 'src/components/PageHeader.vue'

// Referencias
const uploadModal = ref(null)

// Estado de pestañas
const activeTab = ref('aprobadas')

// Estados para subir bitácoras
const selectedFiles = ref([])
const isLoading = ref(false)

const approvedLogs = ref([
  { id: 1, fecha: '08-08-2025', documento: 'Carlos_Perez_11009667001' },
  { id: 2, fecha: '08-08-2025', documento: 'Carlos_Perez_11009667001' }
])

// Plantillas disponibles
const templates = ref([
  { id: 1, nombre: 'Plantilla_Bitacora.PDF', url: '/plantillas/bitacora.pdf', imagen: '/img/preview-plantilla.png' }
])


const columns = ref([
  { name: 'fecha', label: 'FECHA', field: 'fecha', align: 'center', sortable: true },
  { name: 'documento', label: 'DOCUMENTOS', field: 'documento', align: 'center', sortable: true },
  { 
    name: 'acciones', 
    label: 'ACCIONES', 
    field: 'acciones', 
    align: 'center',
    actions: [
      { 
        icon: 'file_download', 
        tooltip: 'Descargar', 
        action: (row) => descargar(row)
      },
      { 
        icon: 'visibility', 
        tooltip: 'Visualizar', 
        action: (row) => visualizar(row)
      }
    ]
  }
])

// Métodos principales
const descargar = (row) => {
  if (row.url) {
    window.open(row.url, '_blank')
  }
}

const visualizar = (row) => {
  if (row.url) {
    window.open(row.url, '_blank')
  }
}

const descargarPlantilla = (template) => {
  if (template.url) {
    window.open(template.url, '_blank')
  }
}

const visualizarPlantilla = (template) => {
  if (template.url) {
    window.open(template.url, '_blank')
  }
}

const abrirDialogSubir = () => {
  selectedFiles.value = []
  uploadModal.value?.openDialog()
}

const cerrarDialogSubir = () => {
  selectedFiles.value = []
  uploadModal.value?.closeDialog()
}

const seleccionarArchivos = (files) => {
  selectedFiles.value = files
}

const subirBitacoras = async () => {
  if (selectedFiles.value.length === 0) {
    return
  }
  
  isLoading.value = true
  try {
    const formData = new FormData()
    // Sin usar forEach - usar while loop
    let fileIndex = 0
    while (fileIndex < selectedFiles.value.length) {
      const file = selectedFiles.value[fileIndex]
      if (file) {
        formData.append('bitacoras', file)
      }
      fileIndex++
    }
    
    // TODO: Implementar llamada al backend
    // await apiClient.post('/bitacoras/upload', formData)
    
    cerrarDialogSubir()
  } catch (error) {
    notifications.error('Error al subir las bitácoras')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.page-content {
  padding: 1rem;
}

.tabs-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.tab-btn {
  min-width: 200px;
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 500;
  background: #d9d9d9;
  color: #000;
  transition: 0.3s;
}

.tab-btn:hover { 
  background: #c0c0c0; 
}

.tab-btn.active { 
  background: var(--color-primary);
  color: #fff; 
  font-weight: 600; 
}



.plantillas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 30px;
  padding: 40px;
}

.plantilla-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s;
}

.plantilla-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.plantilla-preview {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}

.plantilla-nombre {
  background: #ff0000;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  width: 100%;
}

.plantilla-acciones { 
  display: flex; 
  gap: 10px; 
}

.modal-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.modal-body-content {
  padding: 20px 0;
  min-width: 500px;
}

.archivos-lista { 
  margin-top: 20px; 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
}

.archivo-item { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  padding: 10px; 
  background: #f5f5f5; 
  border-radius: 8px; 
}

.archivo-nombre { 
  flex: 1; 
  font-size: 14px; 
  color: #333; 
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 10px;
}

.loading-text {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.modal-footer-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  width: 100%;
}

:deep(.q-card) {
  min-width: 550px;
  border-radius: 16px;
}

:deep(.q-card-section) {
  padding: 20px;
}

:deep(.q-card-actions) {
  padding: 20px;
  background: var(--color-primary);
}

:deep(.tabla-container) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  margin: 0 !important;
}
</style>