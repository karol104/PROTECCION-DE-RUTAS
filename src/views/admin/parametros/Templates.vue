<template>
  <div class="q-pa-md">
    <BackButton />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section class="flex flex-center">
            <PageHeader title="Configuración de Bitácoras y Seguimientos" description="Define la cantidad de bitácoras y seguimientos obligatorios por nivel operativo" align="center" />
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
              placeholder="Buscar por nombre..."
              @keypress="soloLetras"
              @paste="manejarPegado"
              @update:model-value="manejarCambioBusqueda"
            >
              <template #prepend>
                <q-icon name="search" color="green-8" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <Table
        :rows="parametrosOrdenados"
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
              @click="openEditBitacoraDialog(props.row)" 
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
      v-model="showEditBitacoraDialog" 
      variant="edit" 
      width="600px" 
      max-width="95vw" 
      persistent
    >
      <template #header>
        <div class="modal-header">
          <div class="text-h6 flex items-center">
            <q-icon name="edit" class="q-mr-sm" />
            Editar Cantidad de Bitácoras
          </div>
        </div>
      </template>

      <template #body>
        <div class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ selectedBitacora?.name || '-' }}</div>
          <q-input 
            v-model="formDataBitacora.value" 
            outlined 
            dense 
            label="Cantidad de Bitácoras" 
            type="number" 
            :rules="[
              requiredRule,
              val => val > 0 || 'La cantidad de bitácoras debe ser mayor que 0'
            ]" 
          />
        </div>
      </template>

      <template #footer>
        <div class="row justify-end q-gutter-sm full-width">
          <Button 
            label="Cancelar" 
            custom-class="boton-cerrar" 
            @click="closeEditBitacoraDialog" 
          />
          <Button 
            label="Guardar" 
            custom-class="gradient-btn" 
            @click="openConfirmBitacoraDialog"
            :disable="!valorEdicionValido" 
          />
        </div>
      </template>
    </Modal>

    <!-- Modal de Confirmación -->
    <Modal 
      v-model="showConfirmBitacoraDialog" 
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
            ¿Está seguro de que desea guardar los cambios para <strong>{{ selectedBitacora?.name }}</strong>?
          </div>
          <p class="confirmation-text text-body1">
            El nuevo valor será: <strong>{{ formDataBitacora.value }}</strong>
          </p>
        </div>
      </template>

      <template #footer>
        <div class="row justify-end q-gutter-sm full-width">
          <Button 
            label="Cancelar" 
            custom-class="boton-cerrar" 
            @click="closeConfirmBitacoraDialog" 
          />
          <Button 
            label="Guardar" 
            custom-class="gradient-btn" 
            @click="submitFormBitacora" 
            :loading="loading" 
          />
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { putData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import { useEntityManager } from 'src/composables/useEntityManager'
import BackButton from 'src/components/BackButton.vue'
import Button from 'src/components/Button.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Table from 'src/components/Table.vue'
import Modal from 'src/components/Modal.vue'
import PageHeader from 'src/components/PageHeader.vue'

const { error, success } = useNotifications()
const requiredRule = (value) => !!value || 'Este campo es requerido'

// Configuración específica para parámetros de bitácoras
const getDefaultBitacoraFormData = () => ({
  _id: '',
  name: '',
  value: '',
  label: '',
  description: ''
})

// Construir parámetros de filtro con categoría LOGBOOK
const buildBitacoraFilterParams = (filters, baseParams) => {
  const params = { ...baseParams }
  params.category = 'LOGBOOK'
  return params
}

// Procesar respuesta de la API
const processBitacoraResponse = (response) => {
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
  rows: rowsBitacoras,
  formData: formDataBitacora,
  filtersData,
  fetchEntities: fetchBitacoras
} = useEntityManager({
  entityName: 'parámetro',
  entityNamePlural: 'parámetros',
  getDefaultFormData: getDefaultBitacoraFormData,
  endpoints: {
    list: '/parameters/filterParameters',
    update: (id) => `/parameters/updateParameter/${id}`
  },
  messages: {
    listError: 'Error al cargar parámetros',
    updateSuccess: 'Parámetro actualizado exitosamente',
    updateError: 'Error al actualizar parámetro'
  },
  buildFilterParams: buildBitacoraFilterParams,
  processResponse: processBitacoraResponse
})

// Estados adicionales específicos
const selectedBitacora = ref(null)
const showEditBitacoraDialog = ref(false)
const showConfirmBitacoraDialog = ref(false)
const parametrosOriginales = ref([])
let temporizadorBusqueda = null

const columns = [
  { name: 'name', align: 'center', label: 'Actividad', field: 'name', sortable: true },
  { name: 'value', align: 'center', label: 'Cantidad', field: 'value', sortable: true },
  { name: 'label', align: 'center', label: 'Tipo de actividad', field: 'label', sortable: true },
  { name: 'description', align: 'center', label: 'Descripción', field: 'description', sortable: true },
  { name: 'options', align: 'center', label: 'Opciones', field: 'options' }
]

const valorEdicionValido = computed(() => 
  formDataBitacora.value.value && formDataBitacora.value.value > 0
)

// Ordenar parámetros alfabéticamente
const parametrosOrdenados = computed(() => {
  return rowsBitacoras.value.slice().sort((a, b) => {
    const nombreA = (a.name || '').toLowerCase()
    const nombreB = (b.name || '').toLowerCase()
    return nombreA.localeCompare(nombreB, 'es')
  })
})

// Validación solo letras en el input
const soloLetras = (evento) => {
  const codigoCaracter = evento.charCode || evento.keyCode
  const caracter = String.fromCharCode(codigoCaracter)
  
  if (codigoCaracter === 32) return
  
  if (codigoCaracter >= 48 && codigoCaracter <= 57) {
    evento.preventDefault()
    return
  }
  
  if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]$/.test(caracter)) {
    evento.preventDefault()
  }
}

// Manejar pegado de texto
const manejarPegado = (evento) => {
  evento.preventDefault()
  const textoPegado = evento.clipboardData.getData('text')
  filtersData.value.search = textoPegado.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]/g, '')
}

// Manejar cambios en la búsqueda con debounce
const manejarCambioBusqueda = () => {
  if (temporizadorBusqueda) clearTimeout(temporizadorBusqueda)
  
  const busquedaLimpia = filtersData.value.search?.trim()
  
  if (!busquedaLimpia) {
    rowsBitacoras.value = [...parametrosOriginales.value]
    return
  }
  
  temporizadorBusqueda = setTimeout(() => aplicarFiltrosLocales(), 300)
}

// Aplicar filtros locales (búsqueda por prefijo)
const aplicarFiltrosLocales = () => {
  const valorBusqueda = filtersData.value.search?.toString().trim().toLowerCase()
  
  if (!valorBusqueda) {
    rowsBitacoras.value = [...parametrosOriginales.value]
    return
  }

  rowsBitacoras.value = parametrosOriginales.value.filter(parametro => {
    const nombreParametro = (parametro.name || '').toLowerCase()
    return nombreParametro.startsWith(valorBusqueda)
  })
}

// Observar cambios en la búsqueda para limpiar caracteres no válidos
watch(() => filtersData.value.search, (valorNuevo) => {
  if (valorNuevo) {
    const valorLimpio = valorNuevo.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]/g, '')
    if (valorLimpio !== valorNuevo) {
      filtersData.value.search = valorLimpio
    }
  }
})

// Funciones de manejo de modales
const openEditBitacoraDialog = (bitacora) => {
  selectedBitacora.value = bitacora
  formDataBitacora.value._id = bitacora._id
  formDataBitacora.value.name = bitacora.name
  formDataBitacora.value.value = bitacora.value || ''
  formDataBitacora.value.label = bitacora.label || ''
  formDataBitacora.value.description = bitacora.description || ''
  showEditBitacoraDialog.value = true
}

const closeEditBitacoraDialog = () => {
  showEditBitacoraDialog.value = false
  selectedBitacora.value = null
  formDataBitacora.value = getDefaultBitacoraFormData()
}

const openConfirmBitacoraDialog = () => {
  if (valorEdicionValido.value) {
    showConfirmBitacoraDialog.value = true
    return
  }
  error('Por favor ingresa un valor válido')
}

const closeConfirmBitacoraDialog = () => {
  showConfirmBitacoraDialog.value = false
}

// Función de actualización personalizada
const submitFormBitacora = async () => {
  if (!selectedBitacora.value || !formDataBitacora.value.value) {
    error('Por favor verifica los datos')
    return
  }

  loading.value = true
  
  try {
    await putData(`/parameters/updateParameter/${formDataBitacora.value._id}`, {
      value: Number(formDataBitacora.value.value)
    })

    success('Parámetro actualizado exitosamente')
    closeConfirmBitacoraDialog()
    closeEditBitacoraDialog()
    await cargarBitacorasYGuardarOriginales()
  } catch (err) {
    const mensaje = err?.response?.data?.message || 
                   err?.response?.data?.msg || 
                   err?.message || 
                   'Error al actualizar parámetro'
    error(mensaje)
  } finally {
    loading.value = false
  }
}

// Cargar bitácoras y guardar copia original para filtros locales
const cargarBitacorasYGuardarOriginales = async () => {
  await fetchBitacoras()
  parametrosOriginales.value = [...rowsBitacoras.value]
}

onMounted(async () => {
  await cargarBitacorasYGuardarOriginales()
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