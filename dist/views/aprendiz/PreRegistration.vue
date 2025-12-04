<template>
  <q-page class="q-pa-md pre-registration-page">
    <BackButton to="/app/aprendiz/inicio" />
    
    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Pre-Registro de Etapa Productiva" 
              description="Gestiona tu proceso de pre-registro y documentación requerida" 
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Pestañas -->
    <div class="tabs-container">
      <Button 
        :class="['tab-btn', { active: activeTab === 'solicitudes' }]" 
        label="Pre-Registro" 
        @click="activeTab = 'solicitudes'" 
      />
      <Button 
        :class="['tab-btn', { active: activeTab === 'nuevo' }]" 
        label="Validación de Documentos"  
        @click="activeTab = 'nuevo'" 
      />
    </div>

  
    <div class="contenido-principal">
      <!-- PRE-REGISTROS -->
      <div v-if="activeTab === 'solicitudes'" class="tab-panel">
        <div class="q-pa-md">
          <div class="container">
            <!-- Barra de búsqueda y filtros -->
            <div class="row items-center q-mb-md q-gutter-sm" style="padding-left: 20%">
              <div class="col-12 col-md-3">
                <q-input v-model="searchTerm" dense outlined placeholder="Buscar por número..."
                  @keyup.enter="handleFilter" clearable @clear="handleClearFilters">
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              <div class="col-auto">
                <Button label="Filtrar" custom-class="gradient-btn" @click="handleFilter" :loading="isLoading" />
              </div>
              <div class="col-auto">
                <Button label="Limpiar" custom-class="boton-cerrar" @click="handleClearFilters"
                  :loading="isLoading" />
              </div>
              <div class="col-auto">
                <Button label="+ Nuevo Registro EP" custom-class="gradient-btn" @click="handleOpenCreateDialog"
                  style="height: 36px; padding: 8px 16px;" />
              </div>
            </div>

            <!-- Tabla de mis registros -->
            <Table :data="registros" :columns="columns" row-key="_id"
              no-data-label="No tienes registros de EP. ¡Crea tu primer registro!"
              :rows-per-page-options="[10, 20, 50]" :initial-rows-per-page="10" :loading="isLoading">
              <template #body-cell-registration_status="props">
                <q-td :props="props">
                  <q-badge :color="getStatusColor(props.row.registration_status)">
                    {{ getStatusLabel(props.row.registration_status) }}
                  </q-badge>
                </q-td>
              </template>

              <template #body-cell-modality="props">
                <q-td :props="props">
                  {{ props.row.modality_id?.name || 'N/A' }}
                </q-td>
              </template>

              <template #body-cell-company="props">
                <q-td :props="props">
                  {{ props.row.company_id?.name || 'N/A' }}
                </q-td>
              </template>

              <template #body-cell-scheduled_start_date="props">
                <q-td :props="props">
                  {{ formatDate(props.row.scheduled_start_date) }}
                </q-td>
              </template>

              <template #body-cell-opciones="props">
                <q-td :props="props" class="text-center">
                  <q-btn flat round color="primary" icon="visibility" @click="handleViewDetails(props.row)">
                    <q-tooltip>Ver detalles</q-tooltip>
                  </q-btn>
                  <q-btn v-if="canEdit(props.row)" flat round color="warning" icon="edit"
                    @click="handleEdit(props.row)">
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </Table>
          </div>
        </div>

        <!-- Modal de Detalles -->
        <Modal v-model="detailsModalOpen" width="800px" max-width="98vw">
          <template #header>
            <div class="text-h6">Detalles del Registro EP</div>
          </template>
          <template #body>
            <div v-if="selectedItem" class="q-pa-md">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div class="text-subtitle2 text-grey-8">Número de Registro</div>
                  <div class="text-body1 text-weight-bold">{{ selectedItem.registration_number || 'N/A' }}
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Modalidad</div>
                  <div class="text-body1">{{ selectedItem.modality_id?.name || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Empresa</div>
                  <div class="text-body1">{{ selectedItem.company_id?.name || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Fecha de Inicio</div>
                  <div class="text-body1">{{ formatDate(selectedItem.scheduled_start_date) }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Estado</div>
                  <div>
                    <q-badge :color="getStatusColor(selectedItem.registration_status)">
                      {{ getStatusLabel(selectedItem.registration_status) }}
                    </q-badge>
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-subtitle2 text-grey-8">Total Horas Solicitadas</div>
                  <div class="text-body1">{{ selectedItem.total_requested_hours }} horas</div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-subtitle2 text-grey-8">Días Laborales</div>
                  <div class="text-body1">{{ selectedItem.working_days }} días/semana</div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-subtitle2 text-grey-8">Horas Diarias</div>
                  <div class="text-body1">{{ selectedItem.daily_hours }} horas/día</div>
                </div>
                <div class="col-12">
                  <div class="text-subtitle2 text-grey-8">Fecha de Registro</div>
                  <div class="text-body1">{{ formatDate(selectedItem.registration_date) }}</div>
                </div>

                <!-- Observaciones del Aprendiz -->
                <div v-if="selectedItem.apprentice_observations?.length > 0" class="col-12">
                  <div class="text-subtitle2 text-grey-8 q-mb-sm">Mis Observaciones</div>
                  <q-timeline color="primary">
                    <q-timeline-entry v-for="(obs, index) in selectedItem.apprentice_observations"
                      :key="index" :title="formatDate(obs.fecha)" :subtitle="obs.escrito_por">
                      <div>{{ obs.descripcion }}</div>
                    </q-timeline-entry>
                  </q-timeline>
                </div>

                <!-- Observaciones del Admin -->
                <div v-if="selectedItem.admin_observations?.length > 0" class="col-12">
                  <div class="text-subtitle2 text-grey-8 q-mb-sm">Observaciones del Administrador</div>
                  <q-timeline color="secondary">
                    <q-timeline-entry v-for="(obs, index) in selectedItem.admin_observations" :key="index"
                      :title="formatDate(obs.fecha)" :subtitle="obs.escrito_por">
                      <div>{{ obs.descripcion }}</div>
                    </q-timeline-entry>
                  </q-timeline>
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="modal-footer-buttons">
              <Button label="Cerrar" custom-class="boton-cerrar" @click="detailsModalOpen = false" />
            </div>
          </template>
        </Modal>

        <!-- Modal de Creación/Edición -->
        <Modal v-model="editModalOpen" width="900px" max-width="98vw">
          <template #header>
            <div class="text-h6">{{ isEditing ? 'Editar' : 'Nuevo' }} Registro de Etapa Productiva</div>
          </template>
          <template #body>
            <q-form ref="formRef" class="q-pa-md">
              <div class="row q-col-gutter-md">
                <!-- Número de Registro (solo en edición) -->
                <div v-if="isEditing" class="col-12">
                  <q-input v-model="itemBeingEdited.registration_number" label="Número de Registro" outlined
                    dense readonly hint="Número de registro asignado" />
                </div>

                <!-- Información del aprendiz (solo lectura) -->
                <div class="col-12">
                  <q-banner class="bg-blue-1">
                    <template v-slot:avatar>
                      <q-icon name="account_circle" color="primary" />
                    </template>
                    <div class="text-body2">
                      <strong>Registrando para:</strong> {{ apprenticeName }}
                    </div>
                  </q-banner>
                </div>

                <!-- Seleccionar Modalidad -->
                <div class="col-12 col-md-6">
                  <q-select v-model="itemBeingEdited.modality_id" :options="modalityOptions"
                    option-value="_id" option-label="name" emit-value map-options label="Modalidad EP *"
                    outlined dense :rules="[requiredRule]"
                    hint="Selecciona la modalidad de tu etapa productiva">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay modalidades disponibles
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <!-- Seleccionar Empresa -->
                <div class="col-12 col-md-6">
                  <q-select v-model="itemBeingEdited.company_id" :options="companyOptionsForForm"
                    option-value="_id" option-label="name" emit-value map-options label="Empresa *" outlined
                    dense :rules="[requiredRule]" hint="Empresa donde realizarás la EP" use-input
                    input-debounce="300" @filter="filterCompaniesForForm">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay empresas disponibles
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <!-- Fecha de Inicio Programada -->
                <div class="col-12 col-md-6">
                  <q-input v-model="itemBeingEdited.scheduled_start_date" label="Fecha de Inicio Programada *"
                    outlined dense type="date" :rules="[requiredRule]"
                    hint="Fecha en que inicias la etapa productiva" />
                </div>

                <!-- Total Horas Solicitadas -->
                <div class="col-12 col-md-6">
                  <q-input v-model.number="itemBeingEdited.total_requested_hours"
                    label="Total Horas Solicitadas *" outlined dense type="number" readonly
                    :rules="[requiredRule, (val) => val > 0 || 'Debe ser mayor a 0']"
                    hint="Horas requeridas según la modalidad seleccionada" bg-color="grey-2">
                    <template v-slot:prepend>
                      <q-icon name="schedule" color="primary" />
                    </template>
                  </q-input>
                </div>

                <!-- Días Laborales por Semana -->
                <div class="col-12 col-md-6">
                  <q-input v-model.number="itemBeingEdited.working_days" label="Días Laborales por Semana *"
                    outlined dense type="number"
                    :rules="[requiredRule, (val) => (val >= 1 && val <= 7) || 'Debe estar entre 1 y 7']"
                    hint="Número de días que trabajarás por semana" />
                </div>

                <!-- Horas Diarias -->
                <div class="col-12 col-md-6">
                  <q-input v-model.number="itemBeingEdited.daily_hours" label="Horas Diarias *" outlined dense
                    type="number"
                    :rules="[requiredRule, (val) => (val >= 1 && val <= 24) || 'Debe estar entre 1 y 24']"
                    hint="Horas que trabajarás por día" />
                </div>

                <!-- Botón para crear nueva empresa -->
                <div class="col-12 col-md-6">
                  <Button label="+ Crear Nueva Empresa" custom-class="gradient-btn" 
                    @click="handleOpenNewCompanyDialog" style="width: 100%; height: 40px;" />
                </div>

                <!-- Advertencia si está editando -->
                <div v-if="isEditing" class="col-12">
                  <q-banner class="bg-orange-1">
                    <template v-slot:avatar>
                      <q-icon name="warning" color="orange" />
                    </template>
                    <div class="text-body2">
                      Solo puedes editar registros que aún no han sido validados por el administrador.
                    </div>
                  </q-banner>
                </div>

                <!-- Botones de acción -->
                <div class="col-12 q-mt-md">
                  <div class="row justify-end q-gutter-sm">
                    <Button label="Cancelar" custom-class="boton-cerrar" @click="handleCloseDialog" />
                    <Button v-if="!isEditing" label="Registrar y Enviar" custom-class="gradient-btn"
                      @click="handleSubmitAndSend" :loading="isSaving" />
                    <Button v-if="isEditing" label="Actualizar" custom-class="gradient-btn"
                      @click="handleSubmit" :loading="isSaving" />
                    <Button v-if="isEditing && canSend(itemBeingEdited)" label="Enviar a Validación"
                      custom-class="gradient-btn" @click="handleSendFromModal" :loading="isSaving" />
                  </div>
                </div>
              </div>
            </q-form>
          </template>
        </Modal>

        <!-- Modal de Nueva Empresa (Pre-registro) -->
        <Modal v-model="newCompanyModalOpen" width="700px" max-width="98vw">
          <template #header>
            <div class="text-h6">Registrar Nueva Empresa</div>
          </template>
          <template #body>
            <q-form ref="newCompanyFormRef" class="q-pa-md">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input v-model="newCompanyForm.companyNit" label="NIT de la Empresa *" outlined dense
                    :rules="[requiredRule]" hint="Número de identificación tributaria" />
                </div>
                <div class="col-12">
                  <q-input v-model="newCompanyForm.name" label="Nombre de la Empresa *" outlined dense
                    :rules="[requiredRule]" hint="Nombre completo de la empresa" />
                </div>
                <div class="col-12">
                  <q-input v-model="newCompanyForm.location" label="Ubicación/Ciudad *" outlined dense
                    :rules="[requiredRule]" hint="Ciudad o municipio" />
                </div>
                <div class="col-12">
                  <q-input v-model="newCompanyForm.legalRepresentativeName" 
                    label="Nombre del Representante Legal *" outlined dense
                    :rules="[requiredRule]" hint="Nombre completo" />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="newCompanyForm.legalRepresentativeEmail" 
                    label="Email del Representante *" outlined dense type="email"
                    :rules="[requiredRule]" hint="Correo electrónico" />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="newCompanyForm.legalRepresentativePhone" 
                    label="Teléfono del Representante *" outlined dense
                    :rules="[requiredRule]" hint="Número de contacto" />
                </div>
                <div class="col-12">
                  <q-input v-model="newCompanyForm.legalRepresentativePosition" 
                    label="Cargo del Representante *" outlined dense
                    :rules="[requiredRule]" hint="Ej: Gerente, Director, etc." />
                </div>
                <div class="col-12 q-mt-md">
                  <div class="row justify-end q-gutter-sm">
                    <Button label="Cancelar" custom-class="boton-cerrar" 
                      @click="handleCloseNewCompanyDialog" />
                    <Button label="Registrar Empresa" custom-class="gradient-btn" 
                      @click="handleSaveNewCompany" :loading="isSaving" />
                  </div>
                </div>
              </div>
            </q-form>
          </template>
        </Modal>
      </div>

      <!-- VALIDACIÓN DE DOCUMENTOS -->
      <div v-if="activeTab === 'nuevo'" class="tab-panel">
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
    </div>


  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getData, postData, putData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import { useAuthStore } from 'src/stores/authStore'
import Button from 'src/components/Button.vue'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Modal from 'src/components/Modal.vue'
import Table from 'src/components/Table.vue'

const REGISTRATION_STATUS = { PENDING: 3, REJECTED: 1, APPROVED: 0 }
const REGISTRATION_STATUS_LABELS = {
  [REGISTRATION_STATUS.PENDING]: 'Pendiente',
  [REGISTRATION_STATUS.REJECTED]: 'Rechazado',
  [REGISTRATION_STATUS.APPROVED]: 'Aprobado'
}
const REGISTRATION_STATUS_OPTIONS = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Pendiente', value: REGISTRATION_STATUS.PENDING },
  { label: 'Rechazado', value: REGISTRATION_STATUS.REJECTED },
  { label: 'Aprobado', value: REGISTRATION_STATUS.APPROVED }
]

const router = useRouter()
const $q = useQuasar()
const notifications = useNotifications()
const requiredRule = (value) => !!value || 'Este campo es requerido'
const authStore = useAuthStore()

const registrationStatusOptions = REGISTRATION_STATUS_OPTIONS

// Estado de pestañas
const activeTab = ref('solicitudes')

// Estados para "Mis Registros" (pestaña solicitudes)
const registros = ref([])
const selectedItem = ref(null)
const isEditing = ref(false)
const isSaving = ref(false)
const isLoading = ref(false)
const formRef = ref(null)
const newCompanyFormRef = ref(null)
const modalityOptions = ref([])
const companyOptionsForForm = ref([])
const allCompanies = ref([])
const uploadedFile = ref(null)
const uploadedFileName = ref('')
const searchTerm = ref('')

// Estados para validación de documentos (pestaña nuevo)
const loading = ref(false)
const selectedFile = ref(null)
const showConfirmationDialog = ref(false)
const showCancellationDialog = ref(false)

// Datos de nueva empresa
const newCompanyForm = ref({
  companyNit: '',
  name: '',
  location: '',
  legalRepresentativePhone: '',
  legalRepresentativeName: '',
  legalRepresentativeEmail: '',
  legalRepresentativePosition: ''
})

const itemBeingEdited = ref({ 
  _id: '', 
  registration_number: '', 
  modality_id: '', 
  company_id: '', 
  scheduled_start_date: '', 
  total_requested_hours: 0, 
  working_days: 5, 
  daily_hours: 8, 
  uploaded_documents: '' 
})

const editModalOpen = ref(false)
const detailsModalOpen = ref(false)
const newCompanyModalOpen = ref(false)

const apprenticeName = computed(() => {
  const user = authStore.user
  return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Aprendiz'
})

const columns = [
  { name: 'registration_number', label: 'Número Registro', field: 'registration_number', sortable: true, align: 'left' },
  { name: 'modality', label: 'Modalidad', field: 'modality', sortable: true, align: 'left' },
  { name: 'company', label: 'Empresa', field: 'company', sortable: true, align: 'left' },
  { name: 'scheduled_start_date', label: 'Fecha Inicio', field: 'scheduled_start_date', sortable: true, align: 'center' },
  { name: 'total_requested_hours', label: 'Horas Totales', field: 'total_requested_hours', sortable: true, align: 'center' },
  {
    name: 'registration_status',
    label: 'Estado',
    field: 'registration_status',
    sortable: true,
    align: 'center'
  },
  { name: 'opciones', label: 'Opciones', align: 'center' }
]

// ==================== WATCHERS ====================

watch(() => itemBeingEdited.value.modality_id, (newModalityId) => {
  if (newModalityId) {
    // Buscar la modalidad seleccionada en el array de opciones
    let selectedModality = null
    let i = 0
    while (i < modalityOptions.value.length) {
      if (modalityOptions.value[i]._id === newModalityId) {
        selectedModality = modalityOptions.value[i]
        break
      }
      i++
    }
    
    if (selectedModality) {
      // Obtener las horas de la modalidad (probar diferentes nombres de propiedades)
      const hours = selectedModality.standardHours || 
                    selectedModality.standard_hours || 
                    selectedModality.totalHours || 
                    selectedModality.total_hours ||
                    selectedModality.hours ||
                    0
      
      const workingDays = selectedModality.working_days || 
                          selectedModality.workingDays ||
                          selectedModality.days_per_week ||
                          selectedModality.daysPerWeek ||
                          5
      
      const dailyHours = selectedModality.daily_hours || 
                         selectedModality.dailyHours ||
                         selectedModality.hours_per_day ||
                         selectedModality.hoursPerDay ||
                         8
      
      // Actualizar los valores
      itemBeingEdited.value.total_requested_hours = hours
      itemBeingEdited.value.working_days = workingDays
      itemBeingEdited.value.daily_hours = dailyHours
      
      // Mostrar notificación solo si se encontraron horas
      if (hours > 0) {
        notifications.info(`Modalidad: ${selectedModality.name} - Horas requeridas: ${hours}`)
      }
    }
  }
})

// ==================== FUNCIONES DE CARGA ====================

async function fetchRegistrations(applyFilters = false) {
  try {
    isLoading.value = true
    registros.value = []

    const apprenticeId = authStore.user?._id || authStore.user?.id || authStore.user?.userId

    if (!apprenticeId) {
      notifications.error('No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.')
      isLoading.value = false
      return
    }

    const queryString = buildQueryString(applyFilters)
    const payload = await getData(`registrations/listRegistrations?${queryString}`)

    let data = []
    if (payload?.registrations && Array.isArray(payload.registrations)) {
      data = payload.registrations
    } else if (payload?.msg && Array.isArray(payload.msg)) {
      data = payload.msg
    } else if (payload?.data && Array.isArray(payload.data)) {
      data = payload.data
    } else if (Array.isArray(payload)) {
      data = payload
    }

    const raw = Array.isArray(data) ? data : []

    registros.value = []
    let idx = 0
    while (idx < raw.length) {
      const item = raw[idx]
      registros.value.push({
        ...item,
        registration_number: item.registration_number ?? item.registrationNumber ?? item.registrationNumber,
        total_requested_hours: item.total_requested_hours ?? item.totalRequestedHours ?? item.totalRequestedHours,
        scheduled_start_date: item.scheduled_start_date ?? item.scheduledStartDate ?? item.scheduledStartDate,
        registration_status: item.registration_status ?? item.registrationStatus ?? item.registrationStatus,
        modality_id: item.modality_id ?? item.modalityId ?? (item.modality?._id || item.modality?.id),
        company_id: item.company_id ?? item.companyId ?? (item.company?._id || item.company?.id),
        apprentice_id: item.apprentice_id ?? item.apprenticeId ?? (item.apprentice?._id || item.apprentice?.id),
        uploaded_documents: item.uploaded_documents ?? item.uploadedDocuments ?? item.uploadedDocuments,
        apprentice_observations: item.apprentice_observations ?? item.apprenticeObservations ?? item.apprenticeObservations,
        admin_observations: item.admin_observations ?? item.adminObservations ?? item.adminObservations
      })
      idx++
    }

    if (applyFilters && registros.value.length === 0) {
      notifications.warning('No se encontraron registros con los filtros aplicados')
    } else if (!applyFilters && registros.value.length === 0) {
      notifications.info('No tienes registros de EP. ¡Crea tu primer registro!')
    }
  } catch (error) {
    registros.value = []
    let errorMessage = 'Error al cargar tus registros'

    if (error.response?.status === 401) {
      errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.'
    } else if (error.response?.data?.msg) {
      errorMessage = error.response.data.msg
    }

    notifications.error(errorMessage)
  } finally {
    isLoading.value = false
  }
}

function buildQueryString(applyFilters = false) {
  const apprenticeId = authStore.user?._id || authStore.user?.id || authStore.user?.userId
  const params = new URLSearchParams()
  params.append('apprentice', apprenticeId)
  if (applyFilters && searchTerm.value && searchTerm.value.trim()) {
    params.append('registrationNumber', searchTerm.value.trim())
  }
  return params.toString()
}

async function loadModalities() {
  try {
    const payload = await getData('modalities/listModalities')
    let data = []
    if (payload?.modalities && Array.isArray(payload.modalities)) {
      data = payload.modalities
    } else if (payload?.msg && Array.isArray(payload.msg)) {
      data = payload.msg
    } else if (payload?.data && Array.isArray(payload.data)) {
      data = payload.data
    } else if (Array.isArray(payload)) {
      data = payload
    }
    modalityOptions.value = []
    let i = 0
    while (i < data.length) {
      if (data[i].status === 0) {
        modalityOptions.value.push(data[i])
      }
      i++
    }
    if (modalityOptions.value.length === 0) {
      notifications.warning('No hay modalidades activas disponibles. Contacta al administrador.')
    }
  } catch (error) {
    notifications.error('Error al cargar las modalidades. Por favor, recarga la página.')
  }
}

async function loadCompanies() {
  try {
    const payload = await getData('companies/listCompanies')
    let data = []
    if (payload?.msg?.companies && Array.isArray(payload.msg.companies)) {
      data = payload.msg.companies
    } else if (payload?.companies && Array.isArray(payload.companies)) {
      data = payload.companies
    } else if (payload?.msg && Array.isArray(payload.msg)) {
      data = payload.msg
    } else if (payload?.data && Array.isArray(payload.data)) {
      data = payload.data
    } else if (Array.isArray(payload)) {
      data = payload
    }
    
    allCompanies.value = []
    let i = 0
    while (i < data.length) {
      if (data[i]) {
        allCompanies.value.push(data[i])
      }
      i++
    }
    
    companyOptionsForForm.value = []
    i = 0
    while (i < allCompanies.value.length) {
      companyOptionsForForm.value.push(allCompanies.value[i])
      i++
    }
  } catch (error) {
    notifications.error('Error al cargar las empresas: ' + error.message)
  }
}

// ==================== FUNCIONES DE UI ====================

function getStatusLabel(status) {
  return REGISTRATION_STATUS_LABELS[status] || 'Desconocido'
}

function getStatusColor(status) {
  const colors = {
    [REGISTRATION_STATUS.PENDING]: 'orange',
    [REGISTRATION_STATUS.REJECTED]: 'negative',
    [REGISTRATION_STATUS.APPROVED]: 'positive'
  }
  return colors[status] || 'grey'
}

function canEdit(record) {
  return record.registration_status === REGISTRATION_STATUS.PENDING ||
    record.registration_status === REGISTRATION_STATUS.REJECTED
}

function canSend(record) {
  return record.registration_status === REGISTRATION_STATUS.PENDING ||
    record.registration_status === REGISTRATION_STATUS.REJECTED
}

function formatDate(date) {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// ==================== MANEJO DE FILTROS ====================

function handleFilter() {
  fetchRegistrations(true)
}

function handleClearFilters() {
  searchTerm.value = ''
  fetchRegistrations(false)
  notifications.info('Filtros limpiados')
}

// ==================== MANEJO DE MODALES ====================

function handleViewDetails(record) {
  selectedItem.value = record
  detailsModalOpen.value = true
}

function handleEdit(record) {
  if (!canEdit(record)) {
    notifications.warning('No puedes editar un registro ya aprobado o en revisión')
    return
  }

  isEditing.value = true
  itemBeingEdited.value = {
    _id: record._id || '',
    registration_number: record.registration_number || '',
    modality_id: record.modality_id?._id || '',
    company_id: record.company_id?._id || '',
    scheduled_start_date: record.scheduled_start_date ? record.scheduled_start_date.split('T')[0] : '',
    total_requested_hours: record.total_requested_hours ?? 0,
    working_days: record.working_days ?? 5,
    daily_hours: record.daily_hours ?? 8
  }

  editModalOpen.value = true
}

function handleOpenCreateDialog() {
  isEditing.value = false
  itemBeingEdited.value = {
    _id: '',
    registration_number: '',
    modality_id: '',
    company_id: '',
    scheduled_start_date: '',
    total_requested_hours: 0,
    working_days: 5,
    daily_hours: 8,
    uploaded_documents: ''
  }

  uploadedFile.value = null
  uploadedFileName.value = ''
  
  loadCompanies().then(() => {
    companyOptionsForForm.value = []
    let i = 0
    while (i < allCompanies.value.length) {
      companyOptionsForForm.value.push(allCompanies.value[i])
      i++
    }
  })

  // Abrir el modal
  editModalOpen.value = true
}

function handleCloseDialog() {
  editModalOpen.value = false
  if (formRef.value) {
    formRef.value.resetValidation()
  }
  uploadedFile.value = null
  uploadedFileName.value = ''
}

function handleOpenNewCompanyDialog() {
  newCompanyForm.value = {
    companyNit: '',
    name: '',
    location: '',
    legalRepresentativePhone: '',
    legalRepresentativeName: '',
    legalRepresentativeEmail: '',
    legalRepresentativePosition: ''
  }
  newCompanyModalOpen.value = true
}

function handleCloseNewCompanyDialog() {
  newCompanyModalOpen.value = false
  if (newCompanyFormRef.value) {
    newCompanyFormRef.value.resetValidation()
  }
}

async function handleSaveNewCompany() {
  if (!newCompanyFormRef.value) return
  
  const isValid = await newCompanyFormRef.value.validate()
  if (!isValid) {
    notifications.error('Por favor completa todos los campos')
    return
  }
  
  try {
    itemBeingEdited.value.companyData = { ...newCompanyForm.value }
    itemBeingEdited.value.company_id = ''
    
    notifications.success(`Empresa "${newCompanyForm.value.name}" registrada temporalmente.`)
    
    handleCloseNewCompanyDialog()
  } catch (error) {
    notifications.error('Error al registrar la empresa')
  }
}

function filterCompaniesForForm(val, update) {
  update(() => {
    if (!val || val.trim() === '') {
      companyOptionsForForm.value = []
      let i = 0
      while (i < allCompanies.value.length) {
        companyOptionsForForm.value.push(allCompanies.value[i])
        i++
      }
    } else {
      const needle = val.toLowerCase()
      const filtered = []
      let i = 0
      while (i < allCompanies.value.length) {
        const company = allCompanies.value[i]
        const companyName = (company.name || '').toLowerCase()
        
        let startsWith = true
        if (needle.length > companyName.length) {
          startsWith = false
        } else {
          let j = 0
          while (j < needle.length && startsWith) {
            if (companyName[j] !== needle[j]) {
              startsWith = false
            }
            j++
          }
        }
        
        if (startsWith) {
          filtered.push(company)
        }
        i++
      }
      
      companyOptionsForForm.value = filtered
    }
  })
}

async function handleSubmit() {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    notifications.error('Por favor complete todos los campos correctamente')
    return
  }

  if (isEditing.value) {
    await updateRegistration()
  } else {
    await createRegistration()
  }
}

async function handleSubmitAndSend() {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    notifications.error('Por favor complete todos los campos correctamente')
    return
  }

  try {
    await createRegistration()
    notifications.info('El registro fue creado y enviado para validación administrativa')
  } catch (error) {
    // El error ya se maneja en createRegistration
  }
}

async function createRegistration() {
  try {
    isSaving.value = true

    const now = new Date()
    const dateStr = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0')
    const timestamp = now.getTime().toString().slice(-6)
    const registrationNumber = `REG-${dateStr}-${timestamp}`

    const formData = new FormData()
    formData.append('registrationNumber', registrationNumber)
    formData.append('modalityId', itemBeingEdited.value.modality_id)
    
    if (itemBeingEdited.value.companyData && Object.keys(itemBeingEdited.value.companyData).length > 0) {
      formData.append('companyData', JSON.stringify(itemBeingEdited.value.companyData))
    } else {
      formData.append('companyId', itemBeingEdited.value.company_id)
    }
    
    formData.append('scheduledStartDate', itemBeingEdited.value.scheduled_start_date)
    formData.append('totalRequestedHours', itemBeingEdited.value.total_requested_hours)
    formData.append('workingDays', itemBeingEdited.value.working_days)
    formData.append('dailyHours', itemBeingEdited.value.daily_hours)
    formData.append('apprenticeObservations', 'Solicitud de registro')
    
    if (uploadedFile.value) {
      formData.append('uploadedDocuments', uploadedFile.value)
    }

    await postData('registrations/saveRegistration', formData)

    notifications.success('Registro de EP creado exitosamente. Pendiente de validación administrativa.')
    editModalOpen.value = false
    if (formRef.value) {
      formRef.value.resetValidation()
    }

    uploadedFile.value = null
    uploadedFileName.value = ''

    await fetchRegistrations(false)
  } catch (error) {
    const resp = error?.response?.data
    let errorMessage = 'Error al crear el registro'

    if (resp?.message) {
      errorMessage = resp.message
    } else if (resp?.msg) {
      errorMessage = resp.msg
    } else if (resp?.error) {
      errorMessage = resp.error
    } else if (error?.message) {
      errorMessage = error.message
    }

    notifications.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}

async function updateRegistration() {
  try {
    isSaving.value = true

    const updateData = {
      modalityId: itemBeingEdited.value.modality_id,
      companyId: itemBeingEdited.value.company_id,
      scheduledStartDate: itemBeingEdited.value.scheduled_start_date,
      totalRequestedHours: itemBeingEdited.value.total_requested_hours,
      workingDays: itemBeingEdited.value.working_days,
      dailyHours: itemBeingEdited.value.daily_hours
    }

    await putData(`registrations/updateRegistration/${itemBeingEdited.value._id}`, updateData)

    notifications.success('Registro actualizado exitosamente')
    editModalOpen.value = false
    if (formRef.value) {
      formRef.value.resetValidation()
    }

    uploadedFile.value = null
    uploadedFileName.value = ''

    await fetchRegistrations(false)
  } catch (error) {
    const errorMessage = error.response?.data?.message
      || error.response?.data?.msg
      || error?.message
      || 'Error al actualizar el registro'
    notifications.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}

function handleSendFromModal() {
  $q.dialog({
    title: '¿Enviar registro a validación?',
    message: '¿Estás seguro de enviar este registro al administrador para su validación?',
    cancel: { label: 'Cancelar', color: 'negative', flat: true },
    ok: { label: 'Enviar', color: 'primary' },
    persistent: true
  }).onOk(async () => {
    try {
      isSaving.value = true
      const validationData = {
        registration_status: REGISTRATION_STATUS.PENDING,
        admin_observations: 'Registro enviado para validación'
      }

      await putData(`registrations/validateRegistration?apprentice=${itemBeingEdited.value._id}`, validationData)
      notifications.success('Registro enviado exitosamente para validación')
      editModalOpen.value = false
      await fetchRegistrations(false)
    } catch (error) {
      const errorMessage = error.response?.data?.message
        || error.response?.data?.msg
        || error?.message
        || 'Error al enviar el registro'
      notifications.error(errorMessage)
    } finally {
      isSaving.value = false
    }
  })
}

// ==================== FUNCIONES DE VALIDACIÓN DE DOCUMENTOS ====================

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
    
    const formData = new FormData()
    formData.append('documento', selectedFile.value)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    $q.notify({
      type: 'positive',
      message: 'Documento enviado exitosamente',
      position: 'top'
    })
    
    closeConfirmationDialog()
    resetForm()
    
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

function handleFileChange(file) {
  if (file) {
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      $q.notify({
        type: 'warning',
        message: 'El archivo excede el tamaño máximo permitido (10MB)',
        position: 'top'
      })
      selectedFile.value = null
      return
    }
    
    const allowedTypes = ['application/pdf']
    
    if (!allowedTypes.includes(file.type)) {
      $q.notify({
        type: 'warning',
        message: 'Tipo de archivo no permitido. Solo se aceptan PDF',
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
}

function handleCancel() {
  if (selectedFile.value) {
    showCancellationDialog.value = true
  }
}

function resetForm() {
  selectedFile.value = null
}

onMounted(async () => {
  // Verificar que el usuario está autenticado
  if (!authStore.isAuthenticated || !authStore.token) {
    notifications.error('No estás autenticado. Por favor inicia sesión nuevamente.')
    router.push('/').catch(() => {})
    return
  }

  // Cargar datos en paralelo
  await Promise.all([
    fetchRegistrations(false),
    loadModalities(),
    loadCompanies()
  ])
})
</script>

<style scoped>
.pre-registration-page {
  background: #f5f7fb;
  min-height: 100vh;
}

.hero-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%);
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

.nuevo-registro-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: #e3f2fd;
  border-radius: 12px;
  border-left: 4px solid var(--color-primary);
}

.info-content h6 {
  margin: 0 0 8px 0;
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 600;
}

.info-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.form-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-content {
  padding: 40px 20px;
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

/* Estilos para validación de documentos */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-content {
  padding: 25px 20px;
}

.message-section {
  text-align: center;
}

.message-text {
  font-size: 15px;
  color: #5f6368;
  line-height: 1.6;
}

.recommendation-box {
  background: #fff3cd;
  border-left: 6px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
}

.recommendation-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.recommendation-text {
  font-size: 14px;
  color: #856404;
  line-height: 1.6;
  flex: 1;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.upload-label-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.upload-label {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  line-height: 1.2;
}

.upload-sublabel {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

.upload-input-group {
  width: 280px;
}

.custom-file-input {
  width: 100%;
}

.file-info-box {
  background: #e8f5e9;
  border-left: 4px solid #44b900;
  padding: 12px 15px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-size: 13px;
  font-weight: 600;
  color: #1b5e20;
}

.file-size {
  font-size: 12px;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.confirmation-text {
  color: #5f6368;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .upload-input-group {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
    width: 100%;
  }

  .form-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 10px;
  }

  .section-content {
    padding: 20px 15px;
  }

  .message-text {
    font-size: 14px;
  }

  .upload-label {
    font-size: 13px;
  }

  .recommendation-text {
    font-size: 13px;
  }

  .form-actions {
    margin-top: 20px;
  }
}

/* Estilos adicionales para la tabla de pre-registros */
.filter-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.preregistrations-table {
  border-radius: 12px;
}

:deep(.preregistrations-table .q-table__top) {
  padding: 16px;
  background: var(--color-primary);
  color: white;
}

:deep(.preregistrations-table .q-table__title) {
  color: white;
  font-weight: 600;
}

:deep(.preregistrations-table .q-table__control) {
  color: white;
}

:deep(.preregistrations-table th) {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

:deep(.preregistrations-table .q-table tbody td) {
  padding: 12px 8px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
