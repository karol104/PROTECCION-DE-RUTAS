<template>
  <q-page class="q-pa-md logbooks-page">
    <BackButton />
    
    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Documentos y Carga de Bitácoras" 
              description="Gestiona plantillas, bitácoras aprobadas y sube nuevas bitácoras"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

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
        <div class="container">
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
  </q-page>
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
.logbooks-page {
  background: #f5f7fb;
  min-height: 100vh;
  overflow-x: hidden;
  width: 100%;
}

.hero-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%);
}

/* Responsividad para PageHeader */
:deep(.hero-card .q-card-section) {
  padding: 20px;
}

@media (max-width: 768px) {
  :deep(.hero-card .q-card-section) {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  :deep(.hero-card .q-card-section) {
    padding: 12px;
  }
}

@media (max-width: 400px) {
  :deep(.hero-card .q-card-section) {
    padding: 10px;
  }
}

@media (max-width: 320px) {
  :deep(.hero-card .q-card-section) {
    padding: 8px;
  }
}

@media (max-width: 300px) {
  :deep(.hero-card .q-card-section) {
    padding: 6px;
  }
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
  background: #e9ecef;
  color: #495057;
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tab-btn:hover { 
  background: #dee2e6;
  border-color: #ced4da;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tab-btn.active { 
  background: var(--color-primary);
  color: #fff; 
  font-weight: 600;
  border-color: var(--color-primary);
  box-shadow: 0 4px 16px rgba(57, 169, 0, 0.25);
  transform: translateY(-2px);
}

.contenido-principal {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  transition: padding 0.3s ease;
}

.tab-panel {
  animation: fadeIn 0.4s ease-out;
  will-change: opacity, transform;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.plantillas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.plantilla-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.plantilla-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.plantilla-preview {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e9ecef;
}

.preview-image { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}

.plantilla-nombre {
  background: var(--color-primary);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  width: 100%;
  box-shadow: 0 2px 8px rgba(57, 169, 0, 0.3);
}

.plantilla-acciones { 
  display: flex; 
  gap: 0.5rem; 
  justify-content: center;
  width: 100%;
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
  width: 100%;
  box-sizing: border-box;
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
  box-sizing: border-box;
}

:deep(.q-card-section) {
  padding: 20px;
}

:deep(.q-card-actions) {
  padding: 20px;
  background: var(--color-primary);
}

/* Asegurar que no hay overflow horizontal */
* {
  box-sizing: border-box;
}

.full-width {
  width: 100%;
  overflow-x: hidden;
}

/* Transiciones suaves para elementos interactivos */
.tab-btn, 
.plantilla-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .tab-panel {
    animation: none;
  }
  
  .tab-btn, 
  .plantilla-card {
    transition: none;
  }
}

/* Responsive Design Mejorado */
@media (max-width: 1200px) {
  .container {
    padding: 0 1rem;
  }
  

  
  .tabs-container {
    gap: 15px;
  }
  
  .tab-btn {
    min-width: 180px;
    padding: 10px 25px;
    font-size: 14px;
  }
  
  .plantillas-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
  }
}

@media (max-width: 900px) {
  .logbooks-page {
    padding: 0.75rem;
  }
  
  .tabs-container {
    flex-direction: column;
    gap: 10px;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }

  
  .tab-btn {
    min-width: auto;
    width: 100%;
    padding: 12px 24px;
    font-size: 14px;
    border-radius: 12px;
  }
  
  .container {
    padding: 0 0.75rem;
  }
  
  /* Eliminar min-width del modal en tablets */
  :deep(.q-card) {
    min-width: auto !important;
    max-width: calc(100vw - 2rem);
  }
}

@media (max-width: 768px) {
  .logbooks-page {
    padding: 0.5rem;
    overflow-x: hidden;
  }
  
  .hero-card {
    margin-bottom: 1.5rem !important;
  }
  
  .hero-card .q-card-section {
    padding: 1rem;
  }
  
  .modal-body-content {
    min-width: auto;
    max-width: calc(100vw - 2rem);
  }
  
  .tabs-container {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }
  
  .tab-btn {
    min-width: auto;
    width: 100%;
    padding: 14px 20px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .tab-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .tab-btn.active {
    box-shadow: 0 4px 16px rgba(57, 169, 0, 0.3);
  }
  
  .container {
    padding: 0 0.75rem;
    max-width: 100%;
  }
  
  .plantillas-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }
  
  .plantilla-card {
    padding: 1rem;
  }
  
  .plantilla-preview {
    height: 150px;
  }
  
  /* Estilos del PageHeader ahora están en sección global sin scoped */
  
  /* Mejoras para tabla en móvil */
  :deep(.q-table) {
    font-size: 13px;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
  }
  
  :deep(.q-table__top) {
    padding: 8px 12px;
  }
  
  :deep(.q-table th) {
    font-size: 12px;
    padding: 8px 4px;
    white-space: nowrap;
  }
  
  :deep(.q-table td) {
    font-size: 12px;
    padding: 8px 4px;
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .logbooks-page {
    padding: 0.25rem;
  }
  
  .hero-card {
    border-radius: 16px;
    margin-bottom: 1rem !important;
  }
  
  .hero-card .q-card-section {
    padding: 0.75rem 0.5rem;
  }
  
  .tabs-container {
    padding: 0 0.25rem;
    gap: 6px;
  }
  
  .tab-btn {
    padding: 12px 16px;
    font-size: 13px;
  }
  
  .plantillas-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }
  
  .plantilla-card {
    padding: 0.75rem;
  }
  
  .plantilla-preview {
    height: 120px;
  }
  
  .modal-body-content {
    min-width: auto;
    max-width: calc(100vw - 2rem);
    padding: 1rem 0;
    box-sizing: border-box;
  }
  
  /* Mejoras para modales en móvil */
  :deep(.q-dialog .q-card) {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
    min-width: auto !important;
    border-radius: 12px;
    box-sizing: border-box;
  }
}

/* Mejoras para dispositivos muy pequeños */
@media (max-width: 400px) {
  .logbooks-page {
    padding: 0.125rem;
    overflow-x: hidden;
  }
  
  .hero-card {
    border-radius: 10px;
    margin-bottom: 0.75rem !important;
  }
  
  .tabs-container {
    padding: 0 0.125rem;
    gap: 4px;
  }
  
  .tab-btn {
    padding: 8px 12px;
    font-size: 11px;
  }
  
  .plantillas-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.25rem;
  }
  
  .plantilla-card {
    padding: 0.5rem;
  }
  
  .plantilla-preview {
    height: 100px;
  }
  
  .plantilla-nombre {
    font-size: 0.7rem;
    padding: 0.4rem 0.5rem;
  }
  
  .modal-body-content {
    min-width: auto;
    max-width: calc(100vw - 1rem);
  }
  
  :deep(.q-dialog .q-card) {
    margin: 0.25rem;
    max-width: calc(100vw - 0.5rem);
    min-width: auto !important;
  }
}

@media (max-width: 320px) {
  .logbooks-page {
    padding: 0.25rem;
    overflow-x: hidden;
  }
  
  .hero-card {
    border-radius: 12px;
    margin-bottom: 1rem !important;
  }
  
  .hero-card .q-card-section {
    padding: 0.5rem 0.25rem;
  }
  
  .tabs-container {
    padding: 0 0.25rem;
    gap: 6px;
  }
  
  .tab-btn {
    padding: 10px 14px;
    font-size: 12px;
  }
  
  .modal-body-content {
    min-width: auto;
    max-width: calc(100vw - 0.5rem);
  }
}

/* Responsividad extrema para 300px */
@media (max-width: 300px) {
  .logbooks-page {
    padding: 0;
  }
  
  .hero-card {
    border-radius: 8px;
    margin-bottom: 0.5rem !important;
  }
  
  .hero-card .q-card-section {
    padding: 0.25rem 0.125rem;
  }
  
  .tabs-container {
    padding: 0 0.125rem;
    gap: 4px;
    margin-bottom: 0.75rem;
  }
  
  .tab-btn {
    padding: 8px 10px;
    font-size: 10px;
    border-radius: 8px;
  }
  
  .container {
    padding: 0 0.125rem;
  }
  
  .plantillas-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.125rem;
  }
  
  .plantilla-card {
    padding: 0.375rem;
  }
  
  .plantilla-preview {
    height: 80px;
  }
  
  .plantilla-nombre {
    font-size: 0.6rem;
    padding: 0.3rem 0.4rem;
  }
  
  .modal-body-content {
    min-width: auto;
    max-width: calc(100vw - 0.25rem);
    padding: 0.5rem 0;
    box-sizing: border-box;
  }
  
  :deep(.q-dialog .q-card) {
    margin: 0.125rem;
    max-width: calc(100vw - 0.25rem);
    min-width: auto !important;
  }
  
  /* Ajustes para tabla en pantallas muy pequeñas */
  :deep(.q-table) {
    font-size: 10px;
    width: 100%;
    max-width: 100%;
  }
  
  :deep(.q-table th),
  :deep(.q-table td) {
    padding: 4px 2px;
    font-size: 9px;
    word-break: break-word;
  }
  
  /* Botón flotante más pequeño */
  .q-page-sticky .q-btn {
    width: 48px !important;
    height: 48px !important;
  }
}

/* Mejoras para botón flotante en móvil */
@media (max-width: 768px) {
  .q-page-sticky {
    bottom: 20px !important;
    left: 20px !important;
  }
  
  .q-page-sticky .q-btn {
    width: 56px !important;
    height: 56px !important;
  }
}

:deep(.tabla-container) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  margin: 0 !important;
}
</style>

