<template>
  <q-page class="q-pa-md seguimiento-page">
    <BackButton class="q-mb-lg" />

    <!-- Header -->
    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
              <PageHeader 
                title="Seguimiento y Estado de Etapa Productiva"
                description="Monitorea el progreso de bitácoras, documentos y cumplimiento de actividades"
              />
          </q-card-section>
        </q-card>

        <!-- Tabla de Seguimiento -->
        <div class="tabla-container">
          <Table
            :rows="bitacoras"
            :columns="columns"
            row-key="semana"
            :pagination="pagination"
            :loading="loading"
            class="tabla-compacta"
          >
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-chip
                :color="getEstadoColor(props.row.estado)"
                text-color="white"
                size="sm"
                dense
              >
                {{ props.row.estado }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-bitacora="props">
            <q-td :props="props">
              <div class="flex items-center justify-center">
                <q-icon 
                  :name="props.row.bitacora === 'Cargada' ? 'check_circle' : props.row.bitacora === 'Pendiente' ? 'warning' : 'remove_circle'"
                  :color="props.row.bitacora === 'Cargada' ? 'positive' : props.row.bitacora === 'Pendiente' ? 'warning' : 'grey'"
                  size="20px"
                  class="q-mr-sm"
                />
                {{ props.row.bitacora }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <div class="actions-cell">
                <ButtonTableOptions
                  v-if="props.row.bitacora === 'Cargada'"
                  icon="visibility"
                  tooltip="Ver bitácora"
                  color="primary"
                  @click="verBitacora(props.row)"
                />
                <ButtonTableOptions
                  v-if="props.row.bitacora === 'Cargada'"
                  icon="description"
                  tooltip="Descargar PDF"
                  color="primary"
                  @click="descargarPDF(props.row)"
                />
                <ButtonTableOptions
                  v-if="props.row.bitacora === 'Pendiente'"
                  icon="upload"
                  tooltip="Subir bitácora"
                  color="warning"
                  @click="subirBitacora(props.row)"
                />
              </div>
            </q-td>
          </template>
          </Table>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Table from 'src/components/Table.vue'
import ButtonTableOptions from 'src/components/ButtonTableOptions.vue'

const columns = [
  {
    name: 'semana',
    label: 'Semana',
    field: 'semana',
    align: 'center',
    sortable: true
  },
  {
    name: 'bitacora',
    label: 'Bitácora',
    field: 'bitacora',
    align: 'center'
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'center',
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center'
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center'
  }
]

const bitacoras = ref([
  {
    semana: 'Semana 1',
    bitacora: 'Cargada',
    fecha: '18/08/2024',
    estado: 'Aprobada'
  },
  {
    semana: 'Semana 2',
    bitacora: 'Cargada',
    fecha: '25/08/2024',
    estado: 'Aprobada'
  },
  {
    semana: 'Semana 3',
    bitacora: 'Cargada',
    fecha: '01/09/2024',
    estado: 'Aprobada'
  }
])

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const loading = ref(false)

const getEstadoColor = (estado) => {
  const colors = {
    'Aprobada': 'positive',
    'Falta': 'warning',
    'Pendiente': 'grey',
    'En Revisión': 'info'
  }
  return colors[estado] || 'grey'
}

const verBitacora = (row) => {
  console.log('Ver bitácora:', row)
  // Implementar lógica para ver bitácora
}

const descargarPDF = (row) => {
  console.log('Descargar PDF:', row)
  // Implementar lógica para descargar PDF
}

const subirBitacora = (row) => {
  console.log('Subir bitácora:', row)
  // Implementar lógica para subir bitácora
}
</script>

<style lang="scss" scoped>
.seguimiento-page {
  background: #f5f7fb;
  min-height: 100vh;
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

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.tabla-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e0e7ff;
}

.tabla-compacta {
  :deep(.q-table) {
    background: transparent;
  }
  
  :deep(.q-table__top) {
    background: var(--color-primary);
    color: white;
    padding: 16px 20px;
    border-radius: 0;
  }
  
  :deep(.q-table th) {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
    font-size: 13px;
    padding: 12px 16px;
    border-bottom: 2px solid #e2e8f0;
  }
  
  :deep(.q-table td) {
    padding: 14px 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }
  
  :deep(.q-table tbody tr:hover) {
    background: #f8fafc;
  }
  
  :deep(.q-table__bottom) {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    padding: 12px 16px;
  }
}

/* Responsividad para la tabla */
@media (max-width: 1024px) {
  .tabla-container {
    max-width: 95%;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .tabla-container {
    max-width: 100%;
    margin: 0;
    border-radius: 8px;
  }
  
  .tabla-compacta {
    :deep(.q-table th),
    :deep(.q-table td) {
      padding: 8px 12px;
      font-size: 12px;
    }
    
    :deep(.q-table__top) {
      padding: 12px 16px;
    }
  }
  
  .actions-cell {
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .seguimiento-page {
    padding: 0.5rem;
  }
  
  .tabla-compacta {
    :deep(.q-table th),
    :deep(.q-table td) {
      padding: 6px 8px;
      font-size: 11px;
    }
  }
}
</style>