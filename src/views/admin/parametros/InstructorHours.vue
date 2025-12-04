<template>
  <div class="q-pa-md">
    <BackButton />
    
    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section class="flex flex-center">
            <PageHeader 
              title="Configuración Académica y Horas Formativas" 
              description="Define las horas base para instructores." 
              align="center" 
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="container">
      <!-- Sección de Filtros -->
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
                <q-icon name="search" color="green-8" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <Table
        :rows="rowsParameters"
        :columns="columns"
        row-key="_id"
        :loading="loadingTable"
      >
        <template #body-cell-options="props">
          <q-td :props="props" class="text-center">
            <ButtonTableOptions
              icon="edit"
              color="grey-7"
              tooltip="Editar"
              @click="openEditParameterDialog(props.row)"
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

    <!-- Modal de Edición -->
    <Modal 
      v-model="showEditParameterDialog" 
      variant="edit" 
      width="600px" 
      max-width="95vw" 
      persistent
    >
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
          <div class="text-h6 q-mb-md">{{ selectedParameter?.name || '-' }}</div>
          <q-input
            v-model="formDataParameter.value"
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
            @click="closeEditParameterDialog" 
          />
          <Button
            label="Guardar"
            custom-class="gradient-btn"
            @click="openConfirmParameterDialog"
            :disable="!isEditingValueValid"
          />
        </div>
      </template>
    </Modal>

    <!-- Modal de Confirmación -->
    <Modal 
      v-model="showConfirmParameterDialog" 
      width="500px" 
      max-width="90vw" 
      persistent
    >
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="help" class="q-mr-sm" />
            Confirmar Cambios
          </div>
        </div>
      </template>

      <template #body>
        <div class="q-pa-md text-center">
          <div class="text-h6 q-mb-md">
            ¿Está seguro de que desea guardar los cambios para <strong>{{ selectedParameter?.name }}</strong>? 
          </div>
          <p class="confirmation-text text-body1">El nuevo valor será: <strong>{{ formDataParameter.value }}</strong></p>
        </div>
      </template>

      <template #footer>
        <div class="row justify-end q-gutter-sm full-width">
          <Button 
            label="Cancelar" 
            custom-class="boton-cerrar"
            @click="closeConfirmParameterDialog" 
          />
          <Button
            label="Guardar"
            custom-class="gradient-btn"
            @click="submitFormParameter"
            :loading="loading"
          />
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { putData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import { useEntityManager } from 'src/composables/useEntityManager'
import Button from 'src/components/Button.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import PageHeader from 'src/components/PageHeader.vue'
import BackButton from 'src/components/BackButton.vue'

const { error, success } = useNotifications()
const requiredRule = (value) => !!value || 'Este campo es requerido'

// Configuración específica para parámetros académicos
const getDefaultParameterFormData = () => ({
  _id: '',
  name: '',
  value: '',
  label: '',
  description: ''
})

// Construir parámetros de filtro personalizados
const buildParameterFilterParams = (filters, baseParams) => {
  const params = { ...baseParams }
  params.category = 'ACADEMIC'
  
  const busqueda = filters.search?.trim()
  if (busqueda) {
    params.name = busqueda
  }
  
  return params
}

// Procesar respuesta de la API
const processParameterResponse = (response) => {
  const data = response?.data || []
  return {
    data,
    total: data.length
  }
}

// Usar el composable con configuración
const {
  loading,
  loadingTable,
  rows: rowsParameters,
  formData: formDataParameter,
  filtersData,
  handleSearchChange,
  fetchEntities: fetchParameters
} = useEntityManager({
  entityName: 'parámetro',
  entityNamePlural: 'parámetros',
  getDefaultFormData: getDefaultParameterFormData,
  endpoints: {
    list: '/parameters/filterParameters',
    update: (id) => `/parameters/updateParameter/${id}`
  },
  messages: {
    listError: 'Error al cargar parámetros',
    updateSuccess: 'Parámetro actualizado exitosamente',
    updateError: 'Error al actualizar el parámetro'
  },
  buildFilterParams: buildParameterFilterParams,
  processResponse: processParameterResponse
})

// Estados adicionales específicos
const selectedParameter = ref(null)
const showEditParameterDialog = ref(false)
const showConfirmParameterDialog = ref(false)

const columns = [
  { name: 'name', align: 'center', label: 'Actividad', field: 'name', sortable: true },
  { name: 'value', align: 'center', label: 'Cantidad', field: 'value', sortable: true },
  { name: 'label', align: 'center', label: 'Tiempo asignado', field: 'label', sortable: true },
  { name: 'description', align: 'center', label: 'Descripción', field: 'description', sortable: true },
  { name: 'options', align: 'center', label: 'Opciones', field: 'options' }
]

const isEditingValueValid = computed(() => 
  formDataParameter.value.value && formDataParameter.value.value > 0
)

// Funciones de manejo de modales
const openEditParameterDialog = (parametro) => {
  selectedParameter.value = parametro
  formDataParameter.value._id = parametro._id
  formDataParameter.value.name = parametro.name
  formDataParameter.value.value = parametro.value || ''
  formDataParameter.value.label = parametro.label || ''
  formDataParameter.value.description = parametro.description || ''
  showEditParameterDialog.value = true
}

const closeEditParameterDialog = () => {
  showEditParameterDialog.value = false
  selectedParameter.value = null
  formDataParameter.value = getDefaultParameterFormData()
}

const openConfirmParameterDialog = () => {
  if (isEditingValueValid.value) {
    showConfirmParameterDialog.value = true
    return
  }
  error('Por favor ingresa un valor válido')
}

const closeConfirmParameterDialog = () => {
  showConfirmParameterDialog.value = false
}

// Función de actualización personalizada
const submitFormParameter = async () => {
  if (!selectedParameter.value || !formDataParameter.value.value) {
    error('Por favor verifica los datos ingresados')
    return
  }

  loading.value = true
  
  try {
    const identificador = formDataParameter.value._id
    await putData(`/parameters/updateParameter/${identificador}`, {
      value: Number(formDataParameter.value.value)
    })

    success('Parámetro actualizado exitosamente')
    closeConfirmParameterDialog()
    closeEditParameterDialog()
    await fetchParameters()
  } catch (err) {
    const mensaje = err?.response?.data?.message || 
                   err?.response?.data?.msg || 
                   err?.message || 
                   'Error al actualizar el parámetro'
    error(mensaje)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchParameters()
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