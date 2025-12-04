<template>
  <div class="q-pa-md">
    <div class="q-mb-lg">
      <BackButton />
    </div>

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Mis Datos Personales"
              description="Consulta y visualiza toda tu información personal, académica y las fichas asignadas a tu cargo."
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Sección de Estadísticas -->
    <div class="statistics-section q-mb-xl">
      <div class="stats-grid">
        <StatsCard 
          title="Horas Trabajadas"
          :value="instructor.hourswork"
          color="var(--color-primary)"
        />
        <StatsCard 
          title="Capacidad de Horas"
          :value="instructor.caphour"
          color="var(--color-primary)"
        />
        <StatsCard 
          title="Horarios"
          :value="stats.schedules"
          color="var(--color-primary)"
        />
        <StatsCard 
          title="Proyectos"
          :value="stats.projects"
          color="var(--color-primary)"
        />
        <StatsCard 
          title="Actividades Pendientes"
          :value="stats.pendingActivities"
          color="var(--color-primary)"
        />
      </div>
    </div>

    <div class="informe-container">
      <div class="cards-grid">
      <!-- Información Personal -->
      <q-card class="info-card">
        <div class="card-header">
          <q-icon name="person" size="24px" class="header-icon" />
          <h2 class="card-title">Información Personal</h2>
        </div>
        <div class="card-divider"></div>
        
        <div class="info-item">
          <div class="item-label">
            <q-icon name="badge" size="18px" color="green" />
            NOMBRE COMPLETO
          </div>
          <div class="item-value">{{ instructor.name || '-' }}</div>
        </div>

        <div class="info-item">
          <div class="item-label">
            <q-icon name="description" size="18px" color="green" />
            DOCUMENTO
          </div>
          <div class="item-value">{{ instructor.numdocument || '-' }}</div>
        </div>

        <div class="info-item">
          <div class="item-label">
            <q-icon name="email" size="18px" color="green" />
            CORREO PERSONAL
          </div>
          <div class="item-value">{{ instructor.emailpersonal || '-' }}</div>
        </div>

        <div class="info-item">
          <div class="item-label">
            <q-icon name="business" size="18px" color="green" />
            CORREO INSTITUCIONAL
          </div>
          <div class="item-value">{{ instructor.email || '-' }}</div>
        </div>
      </q-card>

      <!-- Información Académica -->
      <q-card class="info-card">
        <div class="card-header">
          <q-icon name="school" size="24px" class="header-icon" />
          <h2 class="card-title">Información Académica</h2>
        </div>
        <div class="card-divider"></div>
        
        <div class="info-item">
          <div class="item-label">
            <q-icon name="phone" size="18px" color="green" />
            TELÉFONO
          </div>
          <div class="item-value">{{ instructor.phone || '-' }}</div>
        </div>

        <div class="info-item">
          <div class="item-label">
            <q-icon name="folder" size="18px" color="green" />
            ÁREA TEMÁTICA
          </div>
          <div class="item-value">{{ instructor.thematicarea || '-' }}</div>
        </div>

        <div class="info-item">
          <div class="item-label">
            <q-icon name="link" size="18px" color="green" />
            TIPO DE VINCULACIÓN
          </div>
          <div class="item-value">{{ instructor.bindingtype || '-' }}</div>
        </div>

        <div class="info-item">
          <div class="item-label">
            <q-icon name="lightbulb" size="18px" color="green" />
            CONOCIMIENTOS
          </div>
          <div class="item-value">{{ instructor.knowledge || '-' }}</div>
        </div>
      </q-card>

      <!-- Fichas Asignadas -->
      <q-card class="info-card">
        <div class="card-header">
          <q-icon name="assignment" size="24px" class="header-icon" />
          <h2 class="card-title">Fichas Asignadas</h2>
        </div>
        <div class="card-divider"></div>
        
        <div v-if="fichasRows.length > 0" class="fichas-content">
          <div v-for="ficha in fichasRows" :key="ficha._id" class="ficha-block">
            <div class="info-item">
              <div class="item-label">
                <q-icon name="folder_open" size="18px" color="green" />
                FICHA
              </div>
              <div class="ficha-badge">
                {{ ficha.number }}
              </div>
            </div>

            <div class="info-item">
              <div class="item-label">
                <q-icon name="school" size="18px" color="green" />
                PROGRAMA
              </div>
              <div class="item-value">{{ ficha.program?.name || 'Programa no especificado' }}</div>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <q-icon name="info" size="40px" color="grey-5" />
          <p>No tienes fichas asignadas en este momento.</p>
        </div>

        <!-- Sección de Horas -->
        <div class="horas-section-internal q-mt-lg">
          <Button 
            custom-class="horas-box-internal" 
            :to="{ path: '/app/instructor/vistaHoras' }"
            :noCaps="true"
            aria-label="Ver horas acumuladas por pagar"
          >
            <div class="horas-content">
              <div class="horas-label">Horas acumuladas por pagar:</div>
              <div class="horas-valor">{{ instructor.hourswork || 0 }}</div>
            </div>
          </Button>
        </div>
      </q-card>
      </div>
    </div>

    <!-- Modal -->
    <Modal v-model="showAlertDialog" width="450px">
      <template #header>
        <div class="text-h6">{{ modalHeader }}</div>
      </template>
      <template #body>
        <div style="font-size: 1.1rem;">{{ modalBody }}</div>
      </template>
      <template #footer>
        <Button label="Entendido" custom-class="gradient-btn" :noCaps="true" @click="cerrarModal()" />
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useNotifications } from 'src/composables/useNotifications'
import { getData } from 'src/services/apiClient'
import Modal from 'src/components/Modal.vue'
import Button from 'src/components/Button.vue'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import StatsCard from 'src/components/cards/StatsCard.vue'


const router = useRouter()
const authStore = useAuthStore()
const notifications = useNotifications()

const instructor = ref({
  _id: '',
  name: '',
  email: '',
  emailpersonal: '',
  numdocument: '',
  tpdocument: '',
  phone: '',
  thematicarea: '',
  bindingtype: '',
  knowledge: '',
  caphour: 0,
  hourswork: 0,
  status: 0
})

const showAlertDialog = ref(false)
const modalHeader = ref('')
const modalBody = ref('')
const alertaMostrada = ref(false)

const stats = ref({
  schedules: 0,
  projects: 0, 
  pendingActivities: 0
})

const instructorId = computed(() => {
  const user = authStore.user
  return user?._id || user?.id || user?.uid
})

function extractObjectId(obj) {
  if (!obj) return null
  if (typeof obj === 'string') return obj
  if (obj.$oid) return obj.$oid
  if (obj._id) {
    if (typeof obj._id === 'string') return obj._id
    if (obj._id.$oid) return obj._id.$oid
  }
  return null
}

const fichasRows = ref([])

async function cargarDatosInstructor() {
  if (!instructorId.value) {
    notifications.error('No se pudo identificar al instructor')
    router.push('/login')
    return
  }

  try {
    // Cargar estadísticas del instructor
    const response = await getData(`/statistics/instructor/personal-stats?instructorId=${instructorId.value}`)
    const backendData = response?.data
    
    if (backendData && typeof backendData === 'object') {
      const instructorData = backendData.instructor || backendData
      
      instructor.value = {
        _id: extractObjectId(instructorData) || instructorData._id || instructorId.value,
        name: instructorData.name || '',
        email: '',
        emailpersonal: '',
        numdocument: '',
        tpdocument: '',
        phone: '',
        thematicarea: instructorData.thematicarea || '',
        bindingtype: '',
        knowledge: '',
        caphour: instructorData.caphour || 0,
        hourswork: instructorData.hourswork || 0,
        status: instructorData.status ?? 1
      }
      
      stats.value = {
        schedules: backendData.schedules || 0,
        projects: backendData.projects || 0,
        pendingActivities: backendData.pendingActivities || 0
      }
      
      fichasRows.value = []
      
      // Cargar datos personales adicionales
      try {
        const personalResponse = await getData('/instructors/instructorById')
        const personalData = personalResponse?.msg
        
        if (personalData && personalData.instructor) {
          const fullInstructorData = personalData.instructor
          
          instructor.value = {
            ...instructor.value,
            email: fullInstructorData.email || instructor.value.email,
            emailpersonal: fullInstructorData.emailpersonal || instructor.value.emailpersonal,
            numdocument: fullInstructorData.numdocument || instructor.value.numdocument,
            tpdocument: fullInstructorData.tpdocument || instructor.value.tpdocument,
            phone: fullInstructorData.phone || instructor.value.phone,
            bindingtype: fullInstructorData.bindingtype || instructor.value.bindingtype,
            knowledge: fullInstructorData.knowledge || instructor.value.knowledge
          }
          
          if (personalData.fiches && Array.isArray(personalData.fiches)) {
            fichasRows.value = personalData.fiches.map(ficha => ({
              _id: extractObjectId(ficha) || ficha._id,
              number: ficha.number || '',
              program: {
                _id: extractObjectId(ficha.program) || ficha.program?._id,
                name: ficha.program?.name || ''
              }
            }))
          }
        }
      } catch (error) {
        // Continúa con datos básicos si falla
      }
      
    } else {
      throw new Error('Datos del instructor no disponibles en el backend')
    }
    
  } catch (error) {
    const user = authStore.user
    if (user) {
      instructor.value = {
        _id: extractObjectId(user) || user._id,
        name: user.name || '',
        email: user.email || '',
        emailpersonal: user.emailpersonal || '',
        numdocument: user.numdocument || '',
        tpdocument: user.tpdocument || '',
        phone: user.phone || '',
        thematicarea: user.thematicarea || '',
        bindingtype: user.bindingtype || '',
        knowledge: user.knowledge || '',
        caphour: user.caphour || 0,
        hourswork: user.hourswork || 0,
        status: user.status ?? 0
      }
      
      stats.value = {
        schedules: 0,
        projects: 0,
        pendingActivities: 0
      }
      
      fichasRows.value = []
    } else {
      const errorMsg = error.response?.data?.msg || 
                       error.response?.data?.message || 
                       'No se pudieron cargar los datos del instructor'
      notifications.error(errorMsg)
    }
  }
}

watch(
  () => instructor.value.hourswork,
  async (horas) => {
    await nextTick()
    if (!alertaMostrada.value) {
      if (horas >= 155 && horas < 160) {
        modalHeader.value = 'Alerta de Horas Acumuladas'
        modalBody.value = `El instructor ${instructor.value.name} ha acumulado ${horas} horas. Está próximo a alcanzar el límite máximo de 160 horas.`
        showAlertDialog.value = true
        alertaMostrada.value = true
      } else if (horas >= 160) {
        modalHeader.value = 'Límite de Horas Alcanzado'
        modalBody.value = `El instructor ${instructor.value.name} ha alcanzado el máximo de 160 horas. No puede continuar acumulando más horas hasta que se gestione el pago o compensación.`
        showAlertDialog.value = true
        alertaMostrada.value = true
      }
    }
  },
  { immediate: true }
)

const cerrarModal = () => {
  showAlertDialog.value = false
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    notifications.warning('Debes iniciar sesión para acceder a esta página')
    router.push('/login')
    return
  }
  await cargarDatosInstructor()
})
</script>

<style scoped>
.informe-container {
  padding: 0;
}

.hero-card {
  border-radius: 12px;
  margin-bottom: 24px;
}

.statistics-section {
  margin-bottom: 32px;
}



.stats-grid {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
  max-width: 1600px;
  margin: 0 auto;
}


.cards-grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
  max-width: 1600px;
  margin: 0 auto 32px auto;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
  flex: 1;
  max-width: 450px;
  min-width: 320px;
}

.info-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.header-icon {
  color: #1a1a1a;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4caf50;
  margin: 0;
}

.card-divider {
  height: 3px;
  background: #4caf50;
  border-radius: 2px;
  margin-bottom: 24px;
}

.info-item {
  margin-bottom: 20px;
  border-left: 3px solid #e8f5e9;
  padding-left: 16px;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #757575;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.item-value {
  font-size: 1rem;
  color: #1a1a1a;
  word-break: break-word;
  line-height: 1.5;
}

.ficha-badge {
  display: inline-block;
  background: #4caf50;
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
}

.fichas-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ficha-block {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9e9e9e;
}

.empty-state p {
  margin-top: 12px;
  font-size: 0.95rem;
}

.horas-section-internal {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e8f5e9;
}

.app-button.horas-box-internal {
  background: #f9f9f9 !important;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  text-transform: none !important;
  width: 100%;
  max-width: 100%;
}

.app-button.horas-box-internal:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  background: #f0f0f0 !important;
}

.horas-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.horas-label {
  font-size: 1.1rem;
  color: #757575;
  text-align: center;
}

.horas-valor {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  text-align: center;
}

@media (max-width: 768px) {
  .informe-container {
    padding: 16px;
  }

  .cards-grid {
    flex-direction: column;
    gap: 16px;
  }

  .info-card {
    padding: 18px;
    max-width: none;
    min-width: auto;
    width: 100%;
  }

  .horas-valor {
    font-size: 2rem;
  }

  .stats-grid {
    flex-direction: row;
    justify-content: space-around;
    gap: 16px;
  }


}

@media (max-width: 480px) {
  .card-title {
    font-size: 1.1rem;
  }

  .info-card {
    padding: 16px;
    width: 100%;
  }

  .cards-grid {
    flex-direction: column;
    gap: 12px;
  }

  .horas-valor {
    font-size: 1.75rem;
  }

  .app-button.horas-box-internal {
    padding: 20px;
  }

  .stats-grid {
    flex-direction: column;
    gap: 12px;
  }

  .stat-container {
    width: 100%;
  }


}
</style>