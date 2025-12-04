<template>
  <q-page class="q-pa-md report-view-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Reporte por Año" description="Analiza la información agregada por año." />
          </q-card-section>
        </q-card>

        <div class="container">
          <div class="cards-container q-mb-xl">
            <StatsCard
              v-for="(card, index) in cards"
              :key="index"
              :title="card.title"
              :value="card.value"
              :color="card.color"
            />
          </div>

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
                  <q-icon name="calendar_month" size="2.5em" color="positive" />
                  <div class="text-subtitle2 q-mt-sm">
                    No se encontraron fichas para el año seleccionado
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
          <div class="text-h6">Detalles del Reporte por Año</div>
        </div>
      </template>
      <template #body>
        <div v-if="selectedItem" class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md section-title">Información de la Ficha</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Número de Ficha:</div>
                <div class="data-value">{{ selectedItem.ficha || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Programa de Formación:</div>
                <div class="data-value">{{ selectedItem.programa || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Total de Aprendices:</div>
                <div class="data-value">
                  <q-badge color="primary">
                    {{ selectedItem.aprendices || 0 }} aprendices
                  </q-badge>
                </div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Estado de la Ficha:</div>
                <div class="data-value">
                  <q-badge :color="getStatusColor(selectedItem.estado)">
                    {{ selectedItem.estado || '-' }}
                  </q-badge>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-h6 q-mb-md section-title">Información Académica</div>
            <div class="data-grid">
              <div class="data-row">
                <div class="text-weight-bold">Año Académico:</div>
                <div class="data-value">{{ filtros.anio || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Fecha de Inicio:</div>
                <div class="data-value">{{ formatDate(selectedItem.fechaInicio) || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Fecha de Fin:</div>
                <div class="data-value">{{ formatDate(selectedItem.fechaFin) || '-' }}</div>
              </div>
              <div class="data-row">
                <div class="text-weight-bold">Tipo de Programa:</div>
                <div class="data-value">{{ selectedItem.tipoPrograma || 'No especificado' }}</div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedItem.observaciones" class="col-12">
            <div class="text-h6 q-mb-md section-title">Observaciones</div>
            <div class="data-grid">
              <div class="q-pa-md">
                <p class="text-body1">
                  {{ selectedItem.observaciones }}
                </p>
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
import StatsCard from 'src/components/cards/StatsCard.vue'
import Table from 'src/components/Table.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'
import Button from 'src/components/Button.vue'
import Modal from 'src/components/Modal.vue'
import { getData } from 'src/services/apiClient'

// Capturar el año enviado desde el formulario anterior
const route = useRoute()
const filtros = ref({
  anio: route.query.anio || null
})

//Estado de las cards
const cards = ref([
  { title: 'TOTAL DE FICHAS', value: 0, color: 'var(--color-primary)' },
  { title: 'TOTAL DE APRENDICES', value: 0, color: 'var(--color-primary)' },
  { title: 'FICHAS FINALIZADAS', value: 0, color: 'var(--color-primary)' },
  { title: 'FICHAS EN PROCESO', value: 0, color: 'var(--color-primary)' }
])

//Columnas de la tabla
const columnas = [
  { name: 'ficha', label: 'Ficha', field: 'ficha', align: 'center' },
  { name: 'programa', label: 'Programa de formación', field: 'programa', align: 'left' },
  { name: 'aprendices', label: 'Aprendices', field: 'aprendices', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

const datos = ref([])
const isLoading = ref(false)

// Modal state
const selectedItem = ref(null)
const showDetailsModal = ref(false)

// Llamada al backend con el año como parámetro
const obtenerDatos = async () => {
  try {
    isLoading.value = true
    const url = `/reportes/anio${filtros.value.anio ? `?anio=${filtros.value.anio}` : ''}`
    const response = await getData(url)

    const fichas = response.fichas || []
    datos.value = fichas.map(item => ({
      ...item,
      ficha: item.ficha || item.code || '-',
      programa: item.nombre || item.programa || '-',
      aprendices: item.aprendices || item.totalAprendices || 0,
      estado: item.estado || '-'
    }))

    if (response.resumen) {
      cards.value[0].value = response.resumen.totalFichas || response.resumen.activas || 0
      cards.value[1].value = response.resumen.totalAprendices || response.resumen.finalizadas || 0
      cards.value[2].value = response.resumen.fichasFinalizadas || response.resumen.canceladas || 0
      cards.value[3].value = response.resumen.fichasEnProceso || response.resumen.enProceso || 0
    }
  } catch (error) {
    datos.value = []
    cards.value = [
      { title: 'TOTAL DE FICHAS', value: 0, color: 'var(--color-primary)' },
      { title: 'TOTAL DE APRENDICES', value: 0, color: 'var(--color-primary)' },
      { title: 'FICHAS FINALIZADAS', value: 0, color: 'var(--color-primary)' },
      { title: 'FICHAS EN PROCESO', value: 0, color: 'var(--color-primary)' }
    ]
  } finally {
    isLoading.value = false
  }
}

//Llamar al cargar el componente
onMounted(() => {
  obtenerDatos()
})

// Helper Functions
function getStatusColor(status) {
  const statusColors = {
    'Activo': 'positive',
    'Inactivo': 'negative',
    'Finalizado': 'blue',
    'En Proceso': 'info',
    'Pendiente': 'orange'
  }
  return statusColors[status] || 'grey'
}

function formatDate(date) {
  if (!date) return null
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  })
}

//Eventos de acción de la tabla
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

.cards-container
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))
  gap: 20px

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