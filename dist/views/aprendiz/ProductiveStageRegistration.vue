<template>
    <div class="q-pa-md">
        <BackButton to="/app/aprendiz/inicio" />

        <div class="text-center q-mb-lg">
            <h1 class="text-weight-bold text-black q-my-md" style="font-size: 3rem;">MIS REGISTROS DE ETAPA PRODUCTIVA
            </h1>
        </div>

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
                    <BotonEnviar label="Filtrar" icon="filter_list" @click="handleFilter" :loading="isLoading" />
                </div>
                <div class="col-auto">
                    <Button label="Limpiar" custom-class="btn-cancelar" icon="clear" @click="handleClearFilters"
                        :loading="isLoading" />
                </div>
                <div class="col-auto">
                    <Button label="+ Nuevo Registro EP" custom-class="btn-ingresar" @click="handleOpenCreateDialog"
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

        <!-- Modal de Detalles -->
        <Modal ref="detailsModalRef" width="800px" max-width="98vw">
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
                    <Button label="Cerrar" custom-class="btn-cancelar" @click="detailsModalRef?.closeDialog()" />
                </div>
            </template>
        </Modal>

        <!-- Modal de Creación/Edición -->
        <Modal ref="editModalRef" width="900px" max-width="98vw">
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

                        <!-- Documentos Requeridos -->
                        <div v-if="itemBeingEdited.modality_id" class="col-12">
                            <div class="q-pa-md"
                                style="background: #f5f5f5; border-radius: 12px; border: 2px solid var(--color-border-primary);">
                                <div class="text-h6 text-weight-bold text-green-9 q-mb-md">
                                    Documentos Requeridos
                                </div>
                                <div class="text-body2 q-mb-sm">
                                    Debes enviar un archivo PDF que contenga los siguientes documentos:
                                </div>
                                <ul class="q-pl-lg q-mb-md">
                                    <li v-for="(doc, index) in requiredDocuments" :key="index"
                                        class="text-body2 q-mb-xs">
                                        {{ doc }}
                                    </li>
                                </ul>

                                <!-- Campo de carga de archivo -->
                                <div class="text-center">
                                    <q-file v-model="uploadedFile" label="Seleccionar archivo PDF *"
                                        accept="application/pdf" outlined dense max-file-size="5242880"
                                        :rules="[requiredRule]" @update:model-value="handleFileSelect"
                                        clearable>
                                        <template v-slot:prepend>
                                            <q-icon name="attach_file" color="primary" />
                                        </template>
                                        <template v-slot:hint>
                                            Tamaño máximo: 5MB - Solo formato PDF
                                        </template>
                                    </q-file>

                                    <div v-if="uploadedFileName" class="text-caption q-mt-sm text-green-9">
                                        ✓ Archivo cargado: <strong>{{ uploadedFileName }}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Advertencia de modalidad no seleccionada -->
                        <div v-else class="col-12">
                            <q-banner class="bg-blue-1">
                                <template v-slot:avatar>
                                    <q-icon name="info" color="blue" />
                                </template>
                                <div class="text-body2">
                                    <strong>Selecciona una modalidad</strong> para ver los documentos requeridos.
                                </div>
                            </q-banner>
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
                                <Button label="Cancelar" custom-class="btn-cancelar" @click="handleCloseDialog" />
                                <Button v-if="!isEditing" label="Registrar y Enviar" custom-class="btn-enviar"
                                    @click="handleSubmitAndSend" :loading="isSaving" />
                                <Button v-if="isEditing" label="Actualizar" custom-class="btn-enviar"
                                    @click="handleSubmit" :loading="isSaving" />
                                <Button v-if="isEditing && canSend(itemBeingEdited)" label="Enviar a Validación"
                                    custom-class="btn-enviar" @click="handleSendFromModal" :loading="isSaving" />
                            </div>
                        </div>
                    </div>
                </q-form>
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { getData, postData, putData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import { useAuthStore } from 'src/stores/authStore'
import BackButton from 'src/components/BackButton.vue'
import Button from 'src/components/Button.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'

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

const $q = useQuasar()
const notifications = useNotifications()
const requiredRule = (value) => !!value || 'Este campo es requerido'
const authStore = useAuthStore()

const registrationStatusOptions = REGISTRATION_STATUS_OPTIONS

const registros = ref([])
const selectedItem = ref(null)
const isEditing = ref(false)
const isSaving = ref(false)
const isLoading = ref(false)
const formRef = ref(null)

const detailsModalRef = ref(null)
const editModalRef = ref(null)

const modalityOptions = ref([])
const companyOptionsForForm = ref([])
const allCompanies = ref([])
const uploadedFile = ref(null)
const uploadedFileName = ref('')

// Filtros
const searchTerm = ref('')

// Documentos requeridos según modalidad
const modalityDocuments = {
    'CONTRATO DE APRENDIZAJE': ['Contrato firmado por todas las partes', 'Certificación de afiliación ARL', 'Registro en planilla'],
    'VÍNCULO LABORAL O CONTRACTUAL': ['Contrato laboral o acta de vinculación', 'Certificación ARL', 'Registro en planilla', 'Descripción del cargo'],
    'PROYECTO PRODUCTIVO': ['Propuesta de proyecto aprobada', 'Aval de la entidad/empresa', 'Cronograma de desarrollo', 'Presupuesto'],
    'MONITORÍA SENA': ['Propuesta de proyecto aprobada', 'Aval de la entidad/empresa', 'Cronograma de desarrollo', 'Presupuesto'],
    'PASANTÍA': ['Convenio o carta de aceptación empresa', 'Certificación ARL (cuando aplique)', 'Formato de selección de alternativa', 'Cronograma de actividades'],
    'PASANTÍA U.P. FAMILIAR': ['Convenio o carta de aceptación empresa', 'Certificación ARL (cuando aplique)', 'Formato de selección de alternativa', 'Cronograma de actividades'],
    'PASANTÍA PYME': ['Convenio o carta de aceptación empresa', 'Certificación ARL (cuando aplique)', 'Formato de selección de alternativa', 'Cronograma de actividades'],
    'PASANTÍA ONG-ENTIDAD': ['Convenio o carta de aceptación empresa', 'Certificación ARL (cuando aplique)', 'Formato de selección de alternativa', 'Cronograma de actividades']
}

const itemBeingEdited = ref({ _id: '', registration_number: '', modality_id: '', company_id: '', scheduled_start_date: '', total_requested_hours: 0, working_days: 5, daily_hours: 8, uploaded_documents: '' })

// ==================== COMPUTED ====================

const apprenticeName = computed(() => {
    const user = authStore.user
    return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Aprendiz'
})

const requiredDocuments = computed(() => {
    if (!itemBeingEdited.value.modality_id) return []

    let selectedModality = null
    let i = 0
    while (i < modalityOptions.value.length) {
        if (modalityOptions.value[i]._id === itemBeingEdited.value.modality_id) {
            selectedModality = modalityOptions.value[i]
            break
        }
        i++
    }
    if (!selectedModality) return []

    const modalityName = selectedModality.name.toUpperCase()
    const modalityKeys = Object.keys(modalityDocuments)
    let j = 0
    while (j < modalityKeys.length) {
        const key = modalityKeys[j]
        let modalityContainsKey = false
        let keyContainsModality = false

        if (modalityName.length >= key.length) {
            let k = 0
            while (k <= modalityName.length - key.length) {
                let match = true
                let l = 0
                while (l < key.length) {
                    if (modalityName[k + l] !== key[l]) {
                        match = false
                        break
                    }
                    l++
                }
                if (match) {
                    modalityContainsKey = true
                    break
                }
                k++
            }
        }

        if (key.length >= modalityName.length) {
            let k = 0
            while (k <= key.length - modalityName.length) {
                let match = true
                let l = 0
                while (l < modalityName.length) {
                    if (key[k + l] !== modalityName[l]) {
                        match = false
                        break
                    }
                    l++
                }
                if (match) {
                    keyContainsModality = true
                    break
                }
                k++
            }
        }

        if (modalityContainsKey || keyContainsModality) {
            return modalityDocuments[key]
        }
        j++
    }

    return [
        'Convenio o carta de aceptación',
        'Certificación ARL (si aplica)',
        'Documentación requerida por la modalidad'
    ]
})

// ==================== WATCHERS ====================

watch(() => itemBeingEdited.value.modality_id, (newModalityId) => {
    if (newModalityId) {
        let selectedModality = null
        let i = 0
        while (i < modalityOptions.value.length) {
            if (modalityOptions.value[i]._id === newModalityId) {
                selectedModality = modalityOptions.value[i]
                break
            }
            i++
        }
        if (selectedModality && selectedModality.standard_hours) {
            itemBeingEdited.value.total_requested_hours = selectedModality.standard_hours
            notifications.info(`Horas requeridas para "${selectedModality.name}": ${selectedModality.standard_hours} horas`)
        }
    }
})

// ==================== COLUMNS ====================

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
        align: 'center',
        badge: true,
        badgeColor: (row) => getStatusColor(row.registration_status),
        format: (val, row) => getStatusLabel(row.registration_status)
    },
    {
        name: 'opciones',
        label: 'Opciones',
        align: 'center',
        actions: [
            {
                icon: 'visibility',
                tooltip: 'Ver Detalles',
                action: (row) => handleViewDetails(row)
            },
            {
                icon: 'edit',
                tooltip: 'Editar',
                action: (row) => handleEdit(row),
                condition: (row) => canEdit(row)
            }
        ]
    }
]

// Build query string
function buildQueryString(applyFilters = false) {
    const apprenticeId = authStore.user?._id || authStore.user?.id || authStore.user?.userId
    const params = new URLSearchParams()

    params.append('apprentice', apprenticeId)

    if (applyFilters && searchTerm.value && searchTerm.value.trim()) {
        params.append('registrationNumber', searchTerm.value.trim())
    }

    return params.toString()
}

/**
 * Obtiene los registros del aprendiz actual
 */
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
        const payload = await getData(`/registrations/listRegistrations?${queryString}`)

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

// ==================== FILTER HANDLERS ====================

function handleFilter() {
    fetchRegistrations(true)
}

function handleClearFilters() {
    searchTerm.value = ''
    fetchRegistrations(false)
    notifications.info('Filtros limpiados')
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

// ==================== MANEJADORES DE MODALES ====================

function handleViewDetails(record) {
    selectedItem.value = record
    detailsModalRef.value?.openDialog()
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
        daily_hours: record.daily_hours ?? 8,
        apprentice_observations: record.apprentice_observations?.[record.apprentice_observations.length - 1]?.descripcion || ''
    }

    editModalRef.value?.openDialog()
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

    editModalRef.value?.openDialog()
}

function handleCloseDialog() {
    editModalRef.value?.closeDialog()
    if (formRef.value) {
        formRef.value.resetValidation()
    }
    uploadedFile.value = null
    uploadedFileName.value = ''
}

function handleFileSelect(file) {
    if (!file) {
        uploadedFileName.value = ''
        return
    }

    if (file.type !== 'application/pdf') {
        notifications.error('Solo se permiten archivos PDF')
        uploadedFile.value = null
        uploadedFileName.value = ''
        return
    }

    const maxSize = 5242880
    if (file.size > maxSize) {
        notifications.error('El archivo supera el tamaño máximo permitido de 5MB')
        uploadedFile.value = null
        uploadedFileName.value = ''
        return
    }

    uploadedFileName.value = file.name
}

// ==================== MANEJADORES DE FORMULARIO ====================

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

        if (!uploadedFile.value) {
            notifications.error('Debes cargar el archivo PDF con los documentos requeridos')
            isSaving.value = false
            return
        }

        const now = new Date()
        const dateStr = now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0')
        const timestamp = now.getTime().toString().slice(-6)
        const registrationNumber = `REG-${dateStr}-${timestamp}`

        const formData = new FormData()
        formData.append('registrationNumber', registrationNumber)
        formData.append('modalityId', itemBeingEdited.value.modality_id)
        formData.append('companyId', itemBeingEdited.value.company_id)
        formData.append('scheduledStartDate', itemBeingEdited.value.scheduled_start_date)
        formData.append('totalRequestedHours', itemBeingEdited.value.total_requested_hours)
        formData.append('workingDays', itemBeingEdited.value.working_days)
        formData.append('dailyHours', itemBeingEdited.value.daily_hours)
        formData.append('apprenticeObservations', 'Solicitud de registro')
        formData.append('uploadedDocuments', uploadedFile.value)

        await postData('/registrations/saveRegistration', formData)

        notifications.success('Registro de EP creado exitosamente. Pendiente de validación administrativa.')
        editModalRef.value?.closeDialog()
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
        } else if (resp?.errors) {
            errorMessage = Array.isArray(resp.errors) ? resp.errors.join(', ') : JSON.stringify(resp.errors)
        } else if (error?.response?.status === 400) {
            errorMessage = `Datos inválidos (400): ${JSON.stringify(resp)}`
        } else if (error?.response?.status === 401) {
            errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.'
        } else if (error?.response?.status === 413) {
            errorMessage = 'El archivo es demasiado grande. Máximo 5MB.'
        } else if (error?.response?.status === 500) {
            errorMessage = 'Error en el servidor. Contacta al administrador.'
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

        if (uploadedFile.value) {
            const formData = new FormData()
            formData.append('modalityId', itemBeingEdited.value.modality_id)
            formData.append('companyId', itemBeingEdited.value.company_id)
            formData.append('scheduledStartDate', itemBeingEdited.value.scheduled_start_date)
            formData.append('totalRequestedHours', itemBeingEdited.value.total_requested_hours)
            formData.append('workingDays', itemBeingEdited.value.working_days)
            formData.append('dailyHours', itemBeingEdited.value.daily_hours)
            formData.append('uploadedDocuments', uploadedFile.value)

            await putData(`/registrations/updateRegistration/${itemBeingEdited.value._id}`, formData)
        } else {
            const updateData = {
                modalityId: itemBeingEdited.value.modality_id,
                companyId: itemBeingEdited.value.company_id,
                scheduledStartDate: itemBeingEdited.value.scheduled_start_date,
                totalRequestedHours: itemBeingEdited.value.total_requested_hours,
                workingDays: itemBeingEdited.value.working_days,
                dailyHours: itemBeingEdited.value.daily_hours
            }

            await putData(`/registrations/updateRegistration/${itemBeingEdited.value._id}`, updateData)
        }

        notifications.success('Registro actualizado exitosamente')
        editModalRef.value?.closeDialog()
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

async function handleSendRegistro(record) {
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

            await putData(`/registrations/validateRegistration?apprentice=${record._id}`, validationData)
            notifications.success('Registro enviado exitosamente para validación')
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

            await putData(`/registrations/validateRegistration?apprentice=${itemBeingEdited.value._id}`, validationData)
            notifications.success('Registro enviado exitosamente para validación')
            editModalRef.value?.closeDialog()
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

// ==================== FUNCIONES AUXILIARES ====================

async function loadModalities() {
    try {
        const payload = await getData('/modalities/listModalities')

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
        const payload = await getData('/companies/listCompanies')

        let data = []
        if (payload?.companies && Array.isArray(payload.companies)) {
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
            if (data[i].status === 0) {
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

        if (allCompanies.value.length === 0) {
            notifications.warning('No hay empresas activas disponibles. Contacta al administrador.')
        }
    } catch (error) {
        notifications.error('Error al cargar las empresas. Por favor, recarga la página.')
    }
}

function filterCompaniesForForm(val, update) {
    update(() => {
        if (val === '') {
            companyOptionsForForm.value = []
            let i = 0
            while (i < allCompanies.value.length) {
                companyOptionsForForm.value.push(allCompanies.value[i])
                i++
            }
        } else {
            const needle = val.toLowerCase()
            companyOptionsForForm.value = []
            let i = 0
            while (i < allCompanies.value.length) {
                const companyName = (allCompanies.value[i].name || '').toLowerCase()
                let found = false
                if (companyName.length >= needle.length) {
                    let j = 0
                    while (j <= companyName.length - needle.length) {
                        let match = true
                        let k = 0
                        while (k < needle.length) {
                            if (companyName[j + k] !== needle[k]) {
                                match = false
                                break
                            }
                            k++
                        }
                        if (match) {
                            found = true
                            break
                        }
                        j++
                    }
                }
                if (found) {
                    companyOptionsForForm.value.push(allCompanies.value[i])
                }
                i++
            }
        }
    })
}


onMounted(async () => {
    await Promise.all([
        fetchRegistrations(false),
        loadModalities(),
        loadCompanies()
    ])
})
</script>

<style scoped>
.container {
    max-width: 1400px;
    margin: 0 auto;
}

.q-table__card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-footer-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    width: 100%;
}
</style>