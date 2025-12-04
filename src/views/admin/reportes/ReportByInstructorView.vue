<template>
  <q-page class="q-pa-md report-view-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Fichas por Instructor" description="Listado de fichas y asignaciones por instructor." />
          </q-card-section>
        </q-card>

        <div class="container">
            <Table
              card
              :rows="datos"
              :columns="columnas"
              row-key="_id"
              :loading="isLoading"
            >
              <template #body-cell-acciones="props">
                <q-td :props="props" class="text-center table-options">
                  <ButtonTableOptions
                    icon="visibility"
                    color="grey"
                    tooltip="Ver detalle"
                    @click="onVisualizar(props.row)"
                  />
                  <ButtonTableOptions
                    icon="file_download"
                    color="grey-7"
                    tooltip="Descargar"
                    @click="onDescargar(props.row)"
                  />
                  <ButtonTableOptions
                    icon="delete"
                    color="negative"
                    tooltip="Eliminar"
                    @click="onEliminar(props.row)"
                  />
                </q-td>
              </template>

              <template #no-data>
                <div class="q-pa-md flex flex-center column text-grey full-width">
                  <q-icon name="badge" size="2.5em" color="positive" />
                  <div class="text-subtitle2 q-mt-sm">
                    No se encontraron fichas asociadas a los filtros seleccionados
                  </div>
                </div>
              </template>
            </Table>
        </div>
      </div>
    </div>

    <Modal
      v-model="showDetailsModal"
      width="1200px"
      max-width="98vw"
    >
      <template #header>
        <div class="modal-header-content">
          <div class="text-h6">Detalles del Instructor</div>
        </div>
      </template>
      <template #body>
        <div v-if="selectedItem" class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md section-title">Información del Instructor</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Instructor:</div>
                <div class="data-value">{{ selectedItem.instructor || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Cédula:</div>
                <div class="data-value">{{ selectedItem.cedula || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Tipo de Seguimiento:</div>
                <div class="data-value">{{ selectedItem.seguimiento || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Total de Horas:</div>
                <div class="data-value">
                  <q-badge color="primary">
                    {{ selectedItem.horas || 0 }} horas
                  </q-badge>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md section-title">Información Académica</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Programa:</div>
                <div class="data-value">{{ selectedItem.programa || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Ficha:</div>
                <div class="data-value">{{ selectedItem.ficha || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Trimestre:</div>
                <div class="data-value">{{ selectedItem.trimestre || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Jornada:</div>
                <div class="data-value">{{ selectedItem.jornada || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <Button 
          label="Cerrar"
          custom-class="boton-cerrar"
          @click="showDetailsModal = false" 
        />
      </template>
    </Modal>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Table from 'src/components/Table.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Button from 'src/components/Button.vue'
import Modal from 'src/components/Modal.vue'
import { getData } from 'src/services/apiClient'

//Capturar parámetros del filtro enviados por el componente anterior
const route = useRoute()
const filtros = ref({
  instructor: route.query.instructor || null,
  programa: route.query.programa || null,
  ficha: route.query.ficha || null,
  trimestre: route.query.trimestre || null,
  estadoInstructor: route.query.estadoInstructor || null,
  fechaInicioPrograma: route.query.fechaInicioPrograma || null,
  fechaFinPrograma: route.query.fechaFinPrograma || null,
  jornada: route.query.jornada || null
})

//Columnas de la tabla
const columnas = [
  { name: 'instructor', label: 'Instructor', field: 'instructor', align: 'left' },
  { name: 'cedula', label: 'Cedula', field: 'cedula', align: 'center' },
  { name: 'seguimiento', label: 'tipo Seguimiento', field: 'seguimiento', align: 'left' },
  { name: 'horas', label: 'Total horas', field: 'horas', align: 'center' }
]

const datos = ref([])
const isLoading = ref(false)

// Modal state
const selectedItem = ref(null)
const showDetailsModal = ref(false)

const obtenerDatos = async () => {
  try {
    isLoading.value = true
    const params = new URLSearchParams()
    if (filtros.value.instructor) params.append('instructor', filtros.value.instructor)
    if (filtros.value.programa) params.append('programa', filtros.value.programa)
    if (filtros.value.ficha) params.append('ficha', filtros.value.ficha)
    if (filtros.value.trimestre) params.append('trimestre', filtros.value.trimestre)
    if (filtros.value.estadoInstructor) params.append('estadoInstructor', filtros.value.estadoInstructor)
    if (filtros.value.fechaInicioPrograma) params.append('fechaInicioPrograma', filtros.value.fechaInicioPrograma)
    if (filtros.value.fechaFinPrograma) params.append('fechaFinPrograma', filtros.value.fechaFinPrograma)
    if (filtros.value.jornada) params.append('jornada', filtros.value.jornada)
    const url = `/reportes/instructor${params.toString() ? `?${params.toString()}` : ''}`
    const response = await getData(url)

    const fichas = response.fichas || []
    datos.value = fichas.map(item => ({
      ...item,
      instructor: item.instructor || item.name || '-',
      cedula: item.cedula || item.document || '-',
      seguimiento: item.seguimiento || '-',
      horas: item.horas || item.totalHoras || 0
    }))
  } catch (error) {
    datos.value = []
  } finally {
    isLoading.value = false
  }
}

//Cargar datos cuando se monta
onMounted(() => {
  obtenerDatos()
})

//Acciones de la tabla
const onVisualizar = (row) => {
  selectedItem.value = row
  showDetailsModal.value = true
}

const onDescargar = (row) => {
  // TODO: Implementar descarga
}

const onEliminar = (row) => {
  // TODO: Implementar eliminación
}
</script>

<style lang="sass" scoped>
.report-view-page
  background: #f5f7fb
  min-height: 100vh

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.container
  max-width: 1200px
  margin: 0 auto

.table-wrapper
  background: #fff
  border-radius: 20px
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08)
  padding: 20px

.table-options
  display: flex
  align-items: center
  justify-content: center
  gap: 8px

@media (max-width: 768px)
  .table-wrapper
    padding: 16px

@media (max-width: 480px)
  .table-wrapper
    padding: 12px

/* Estilos base para modales */
/* Section Titles */
.section-title
  color: var(--color-primary)
  font-weight: 600
  font-size: 1.3rem
  margin-bottom: 20px
  padding-left: 12px
  border-left: 4px solid var(--color-primary)

/* Data Grid */
.data-grid
  display: grid
  gap: 16px
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)
  padding: 20px
  border-radius: 8px
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05)
  border: 1px solid #E0E0E0

.data-row
  display: grid
  grid-template-columns: 180px 1fr
  gap: 16px
  align-items: center
  padding: 8px 0
  border-bottom: 1px solid #F0F0F0

.data-row:last-child
  border-bottom: none

.text-weight-bold
  color: #2c3e50
  font-size: 0.95rem
  font-weight: 600

.data-value
  color: #34495e
  font-size: 0.95rem
  font-weight: 500

/* Formularios en modales */
:deep(.q-form)
  padding: 0

:deep(.q-field--filled .q-field__control)
  border-radius: 8px
  background: #F8F9FA
  transition: all 0.3s ease

:deep(.q-field--filled.q-field--focused .q-field__control)
  background: white
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1)

:deep(.q-field--filled .q-field__control:before)
  border-bottom: 2px solid #E0E0E0

:deep(.q-field--filled.q-field--focused .q-field__control:before)
  border-bottom-color: var(--color-primary)

/* File input */
:deep(.q-file .q-field__control)
  border-radius: 8px
  border: 2px dashed #E0E0E0
  transition: all 0.3s ease

:deep(.q-file.q-field--focused .q-field__control)
  border-color: var(--color-primary)
  background: #F8F9FA

/* Banners */
:deep(.q-banner)
  border-radius: 8px
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05)

/* Badges */
:deep(.q-badge)
  padding: 6px 12px
  border-radius: 6px
  font-weight: 500
  font-size: 0.85rem

/* Botones */
:deep(.q-btn.boton-cerrar),
:deep(.q-btn.boton-enviar),
:deep(.q-btn.boton-ingresar)
  border-radius: 8px
  padding: 10px 24px
  font-size: 14px
  font-weight: 600
  text-transform: none
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
  transition: all 0.3s ease

:deep(.q-btn.boton-cerrar:hover),
:deep(.q-btn.boton-enviar:hover),
:deep(.q-btn.boton-ingresar:hover)
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15)
  transform: translateY(-2px)

:deep(.q-btn.boton-enviar),
:deep(.q-btn.boton-ingresar)
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)

:deep(.q-btn.boton-enviar:hover),
:deep(.q-btn.boton-ingresar:hover)
  background: linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary) 100%)
</style>