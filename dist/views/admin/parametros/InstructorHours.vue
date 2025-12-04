<template>
  <div class="q-pa-md">
    <BackButton />
    
    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section class="flex flex-center">
            <PageHeader title="Configuración Académica y Horas Formativas" description="Define las horas base para instructores." align="center" />
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="container">
      <!-- Filters Section (similar to Empresas) -->
      <div class="filters-wrapper flex items-center justify-between q-my-lg">
        <div class="filters-left flex items-center bg-white">
          <div class="filter-item search">
            <q-input
              v-model="filtersData.search"
              outlined
              dense
              clearable
              debounce="600"
              placeholder="Buscar por nombre..."
              @update:model-value="handleSearchChange"
            >
              <template #prepend>
                <q-icon name="search" color="grey-7" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <Table
        :rows="parameters"
        :columns="columns"
        row-key="_id"
        :loading="isLoading"
      >
        <template #body-cell-options="props">
          <q-td :props="props" class="text-center">
            <ButtonTableOptions
              icon="edit"
              color="primary"
              tooltip="Editar"
              @click="openEditDialog(props.row)"
            />
          </q-td>
        </template>

        <template #no-data>
          <div class="q-pa-md flex flex-center column text-grey full-width">
            <q-icon name="settings" size="2.5em" color="primary" />
            <div class="text-subtitle2 q-mt-sm">
              {{ filtersData.search ? 'No se encontraron parámetros con ese nombre' : 'No hay parámetros registrados' }}
            </div>
          </div>
        </template>
      </Table>
    </div>

    <!-- Edit Modal -->
    <Modal v-model="showEditModal" width="600px" max-width="95vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="edit" class="q-mr-sm" />
            Editar Hora de Instructor
          </div>
        </div>
      </template>

      <template #body>
        <div class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ editingParameter?.name || '-' }}</div>
          <q-input
            v-model="editingValue"
            outlined
            dense
            label="Hora Base"
            type="number"
            :rules="[
              requiredRule,
              val => val > 0 || 'La hora base debe ser mayor que 0'
            ]"
          />
        </div>
      </template>

      <template #footer>
        <div class="row justify-end q-gutter-sm full-width">
          <Button 
            label="Cancelar" 
            custom-class="boton-cerrar"
            @click="closeEditDialog" 
          />
          <Button
            label="Guardar"
            custom-class="gradient-btn"
            @click="openConfirmationDialog"
            :disable="!isEditingValueValid"
          />
        </div>
      </template>
    </Modal>

    <!-- Confirmation Modal -->
    <Modal v-model="showConfirmationModal" width="500px" max-width="90vw" persistent>
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="help" class="q-mr-sm" />
            Confirmar Cambios
          </div>
        </div>
      </template>

      <template #body>
        <div class="q-pa-md">
          <p class="confirmation-text">
            ¿Está seguro de que desea guardar los cambios para <strong>{{ editingParameter?.name }}</strong>?
          </p>
          <p class="confirmation-text">
            El nuevo valor será: <strong>{{ editingValue }}</strong>
          </p>
        </div>
      </template>

      <template #footer>
        <div class="row justify-end q-gutter-sm full-width">
          <Button 
            label="Cancelar" 
            custom-class="boton-cerrar"
            @click="closeConfirmationDialog" 
          />
          <Button
            label="Guardar"
            custom-class="gradient-btn"
            @click="confirmParameterUpdate"
            :loading="isSaving"
          />
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getData, putData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import Button from 'src/components/Button.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import PageHeader from 'src/components/PageHeader.vue'
import BackButton from 'src/components/BackButton.vue'

const { error, success, info, warning } = useNotifications()
const requiredRule = (value) => !!value || 'Este campo es requerido'

const isLoading = ref(false)
const isSaving = ref(false)
const parameters = ref([])
const editingParameter = ref(null)
const editingValue = ref('')
const showEditModal = ref(false)
const showConfirmationModal = ref(false)

// Estructura de filtros similar a Empresas
const filtersData = ref({
  search: ''
})

const columns = [
  { name: 'name', align: 'center', label: 'Actividad', field: 'name', sortable: true },
  { name: 'value', align: 'center', label: 'Cantidad', field: 'value', sortable: true },
  { name: 'label', align: 'center', label: 'Tiempo asignado', field: 'label', sortable: true },
  { name: 'description', align: 'center', label: 'Descripción', field: 'description', sortable: true },
  { name: 'options', align: 'center', label: 'Opciones', field: 'options' }
]

const isEditingValueValid = computed(() => editingValue.value && editingValue.value > 0)

// Función para obtener parámetros con filtros (similar a fetchCompanies)
const fetchInstructorHourParameters = async () => {
  isLoading.value = true
  try {
    const params = {
      category: 'ACADEMIC'
    }

    // Aplicar filtros (lógica idéntica a Empresas)
    const trimmedSearch = filtersData.value.search?.trim()
    if (trimmedSearch) {
      params.name = trimmedSearch
    }

    const response = await getData('/parameters/filterParameters', { params })
    parameters.value = response?.data || []

    if (trimmedSearch && !parameters.value.length) {
      warning('No se encontraron parámetros con los filtros aplicados')
    }
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.msg ||
      err?.message ||
      'Error al cargar parámetros'
    error(message)
    parameters.value = []
  } finally {
    isLoading.value = false
  }
}

// Funciones de manejo de filtros (similares a Empresas)
const handleSearchChange = () => {
  fetchInstructorHourParameters()
}

const submitParameterUpdate = async () => {
  if (!editingParameter.value || !editingValue.value) {
    error('Por favor verifica los datos ingresados')
    return
  }

  isSaving.value = true
  try {
    const identifier = editingParameter.value._id
    await putData(`/parameters/updateParameter/${identifier}`, {
      value: Number(editingValue.value)
    })

    success('Parámetro actualizado exitosamente')
    closeConfirmationDialog()
    closeEditDialog()
    await fetchInstructorHourParameters()
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.msg ||
      err?.message ||
      'Error al actualizar el parámetro'
    error(message)
  } finally {
    isSaving.value = false
  }
}

const openEditDialog = parameter => {
  editingParameter.value = parameter
  editingValue.value = parameter.value || ''
  showEditModal.value = true
}

const closeEditDialog = () => {
  showEditModal.value = false
  editingParameter.value = null
  editingValue.value = ''
}

const openConfirmationDialog = () => {
  if (isEditingValueValid.value) {
    showConfirmationModal.value = true
    return
  }
  error('Por favor ingresa un valor válido')
}

const closeConfirmationDialog = () => {
  showConfirmationModal.value = false
}

const confirmParameterUpdate = async () => {
  await submitParameterUpdate()
}

onMounted(async () => {
  await fetchInstructorHourParameters()
})
</script>

<style lang="sass" scoped>
.container
  max-width: 1400px
  margin: 0 auto

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)
  min-height: 120px

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

.filter-item.search
  width: 280px

.modal-header
  display: flex
  justify-content: space-between
  align-items: center
  background: var(--color-primary, #44b900)
  color: white
  padding: 16px 24px

.confirmation-text
  font-size: 16px
  margin-bottom: 15px
  line-height: 1.5
  color: #333

@media (max-width: 1024px)
  .filters-wrapper
    flex-direction: column
    align-items: stretch
  
  .filters-left
    width: 100%

@media (max-width: 768px)
  .filter-item,
  .filter-item.search
    width: 100%
    min-width: unset

@media (max-width: 900px)
  .container
    padding: 0 10px
</style>