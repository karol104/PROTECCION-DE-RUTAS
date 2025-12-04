PersonalData

<template>
  <div class="page-content">
    <BackButton />
    <div class="datos-container">
      <div class="datos-card">
        <div class="datos-header">
          <PageHeader title="Mis Datos Personales" align="center" />
          <div class="editar-datos-link" @click="abrirModalEdicion">
            <q-icon name="edit" size="20px" class="icon-editar" />
            <span class="editar-texto">Editar Datos</span>
          </div>
        </div>

        <div class="datos-content">
          <!-- Información Personal -->
          <div class="datos-info-card">
            <div class="card-header">
              <q-icon name="person" size="24px" color="var(--color-primary)" />
              <h3 class="card-title">Información Personal</h3>
            </div>
            <div class="datos-list">
              <div class="datos-item">
                <div class="datos-item-label">
                  <q-icon name="badge" size="18px" class="item-icon" />
                  <span>Nombre Completo</span>
                </div>
                <div class="datos-item-value">{{ usuario?.firstName || '-' }} {{ usuario?.lastName || '' }}</div>
              </div>
              <div class="datos-item">
                <div class="datos-item-label">
                  <q-icon name="credit_card" size="18px" class="item-icon" />
                  <span>Documento</span>
                </div>
                <div class="datos-item-value">{{ usuario?.documentNumber || '-' }}</div>
              </div>
              <div class="datos-item">
                <div class="datos-item-label">
                  <q-icon name="email" size="18px" class="item-icon" />
                  <span>Correo Personal</span>
                </div>
                <div class="datos-item-value">{{ usuario?.email?.personal || '-' }}</div>
              </div>
              <div class="datos-item">
                <div class="datos-item-label">
                  <q-icon name="business" size="18px" class="item-icon" />
                  <span>Correo Institucional</span>
                </div>
                <div class="datos-item-value">{{ usuario?.email?.institutional || '-' }}</div>
              </div>
            </div>
          </div>

          <!-- Información Académica y Contacto -->
          <div class="datos-info-card">
            <div class="card-header">
              <q-icon name="school" size="24px" color="var(--color-primary)" />
              <h3 class="card-title">Información Académica</h3>
            </div>
            <div class="datos-list">
              <div class="datos-item">
                <div class="datos-item-label">
                  <q-icon name="phone" size="18px" class="item-icon" />
                  <span>Teléfono</span>
                </div>
                <div class="datos-item-value">{{ usuario?.phone || '-' }}</div>
              </div>
              <div class="datos-item">
                <div class="datos-item-label">
                  <q-icon name="description" size="18px" class="item-icon" />
                  <span>Ficha</span>
                </div>
                <div class="datos-item-value ficha-badge">{{ getFichaNumber(usuario) || '-' }}</div>
              </div>
              <div class="datos-item programa-item">
                <div class="datos-item-label">
                  <q-icon name="book" size="18px" class="item-icon" />
                  <span>Programa</span>
                </div>
                <q-tooltip 
                  v-if="getProgramName(usuario) && getProgramName(usuario).length > 50"
                  max-width="400px"
                  anchor="top middle"
                  self="bottom middle"
                >
                  <div style="padding: 8px; word-wrap: break-word;">
                    {{ getProgramName(usuario) }}
                  </div>
                </q-tooltip>
                <div 
                  :class="getProgramName(usuario) && getProgramName(usuario).length > 50 ? 'datos-item-value programa-text' : 'datos-item-value'"
                  style="cursor: help;"
                >
                  {{ getProgramName(usuario) || '-' }}
                </div>
              </div>
            </div>
          </div>

          <div class="datos-instructores">
            <div class="datos-label instructores-title">Instructores Asignados</div>
            
            <!-- Mensaje cuando no hay instructores -->
            <div v-if="!instructores || instructores.length === 0 || (instructores.length === 1 && instructores[0].nombre === 'Cargando...')" class="no-instructores-message">
              <q-icon name="info" size="32px" color="grey-6" class="q-mb-sm" />
              <p class="text-grey-7 text-center">No tienes instructores asignados en este momento.</p>
            </div>
            
            <!-- Lista de instructores cuando sí hay -->
            <template v-else>
              <div v-for="(instructor, index) in instructores" :key="index" class="instructor-card">
                <div class="instructor-circle">{{ obtenerIniciales(instructor.nombre) }}</div>
                <div class="instructor-nombre">{{ instructor.nombre }}</div>
              </div>
              <Button label="Contactar" custom-class="gradient-btn" :noCaps="true" @click="abrirModalContactar" />
            </template>
          </div>
        </div>
      </div>

      <Modal
        v-model="showEditDialog"
        width="1200px"
        max-width="98vw"
        :persistent="true"
      >
        <template #header>
          <div class="modal-header-content">
            <div class="text-h6">Editar Mis Datos</div>
          </div>
        </template>

        <template #body>
          <div v-if="datosEdicion.nombre" class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <div class="text-h6 q-mb-md section-title">Información Personal</div>
              <div class="data-grid">
                <div class="data-row">
                  <div class="text-weight-bold">Nombre:</div>
                  <q-input v-model="datosEdicion.nombre" outlined dense readonly class="input-readonly" />
                </div>
                <div class="data-row">
                  <div class="text-weight-bold">Documento:</div>
                  <q-input v-model="datosEdicion.documento" outlined dense readonly class="input-readonly" />
                </div>
                <div class="data-row">
                  <div class="text-weight-bold">Correo Personal:</div>
                  <q-input 
                    v-model="datosEdicion.correo" 
                    outlined 
                    dense 
                    class="input-editable" 
                    type="email"
                    :rules="[emailRule]"
                  />
                </div>
                <div class="data-row">
                  <div class="text-weight-bold">Correo Institucional:</div>
                  <q-input v-model="datosEdicion.correoInstitucional" outlined dense readonly class="input-readonly" />
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-h6 q-mb-md section-title">Información de Contacto</div>
              <div class="data-grid">
                <div class="data-row">
                  <div class="text-weight-bold">Teléfono: *</div>
                  <q-input 
                    v-model="datosEdicion.telefono" 
                    outlined 
                    dense 
                    class="input-editable"
                    :rules="[requiredRule, phoneRule]"
                  />
                </div>
                <div class="data-row">
                  <div class="text-weight-bold">Número de ficha:</div>
                  <q-input v-model="datosEdicion.ficha" outlined dense readonly class="input-readonly" />
                  <div class="text-caption text-grey-6 q-mt-xs">
                    La ficha no se puede modificar desde esta sección
                  </div>
                </div>
                <div class="data-row">
                  <div class="text-weight-bold">Programa:</div>
                  <q-input v-model="datosEdicion.programa" outlined dense readonly class="input-readonly" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="modal-actions">
            <Button
              label="Cancelar"
              custom-class="boton-cerrar"
              :noCaps="true"
              flat
              @click="cancelarEdicion"
            />
            <Button
              label="Guardar cambios"
              custom-class="gradient-btn"
              :noCaps="true"
              @click="mostrarModalConfirmacion"
            />
          </div>
        </template>
      </Modal>

      <Modal
        v-model="showConfirmationDialog"
        width="600px"
        max-width="95vw"
        :persistent="true"
      >
        <template #header>
          <div class="modal-header-content">
            <div class="text-h6">Confirmar Cambios</div>
          </div>
        </template>

        <template #body>
          <div class="q-pa-md text-center">
            <div class="text-h6 q-mb-md">¿Está seguro de que desea guardar los cambios?</div>
          </div>
        </template>

        <template #footer>
          <Button
            label="Cancelar"
            custom-class="boton-cerrar"
            @click="cancelarConfirmacion"
          />
          <Button
            label="Aceptar"
            :loading="loading"
            @click="confirmarCambios"
          />
        </template>
      </Modal>

      <!-- Modal de contacto -->
      <Modal
        v-model="showContactDialog"
        width="800px"
        max-width="95vw"
      >
        <template #header>
          <div class="text-h6" style="color: white">Contacto Instructor</div>
        </template>

        <template #body>
          <div class="tabla-contenedor">
            <table class="tabla-instructores">
              <thead>
                <tr>
                  <th>Nombre:</th>
                  <th>Teléfono:</th>
                  <th>Correo:</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(instructor, index) in instructores" :key="index">
                  <td>{{ instructor.nombre }}</td>
                  <td>{{ instructor.telefono }}</td>
                  <td>
                    <a :href="'mailto:' + instructor.correo" class="correo-link">
                      {{ instructor.correo }}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <template #footer>
          <div class="modal-actions">
            <Button
              label="Cerrar"
              custom-class="boton-cerrar"
              :noCaps="true"
              flat
              @click="cerrarModalContacto"
            />
          </div>
        </template>
      </Modal>

      <q-footer reveal class="bg-grey-5 text-black footer-custom">
        <q-toolbar>
          <q-toolbar-title class="text-center">
            <div class="footer-text">
              REPFORA - Sena 2025 © Todos los derechos reservados
            </div>
          </q-toolbar-title>
        </q-toolbar>
      </q-footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useNotifications } from 'src/composables/useNotifications'
import { putData, getData, apiClient } from 'src/services/apiClient'
import Modal from 'src/components/Modal.vue'
import Button from 'src/components/Button.vue'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'

const router = useRouter()
const authStore = useAuthStore()
const notifications = useNotifications()
const requiredRule = (value) => !!value || 'Este campo es requerido'
const emailRule = (value) => {
  if (!value) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value) || 'Email inválido'
}
const phoneRule = (value) => {
  if (!value) return true
  const phoneRegex = /^3\d{9}$/
  return phoneRegex.test(value) || 'El teléfono debe tener 10 dígitos y comenzar con 3'
}

const usuario = computed(() => authStore.user)
const loading = ref(false)

const showEditDialog = ref(false)
const showConfirmationDialog = ref(false)
const showContactDialog = ref(false)

const getDefaultEditData = () => ({
  nombre: '',
  documento: '',
  correo: '',
  correoInstitucional: '',
  programa: '',
  ficha: '',
  telefono: ''
})

const datosEdicion = ref(getDefaultEditData())
const datosOriginales = ref(getDefaultEditData())
const cambiosRealizados = ref([])

const instructores = ref([
  { nombre: 'Cargando...', telefono: '-', correo: '-' }
])

function resetEditState() {
  datosEdicion.value = getDefaultEditData()
  datosOriginales.value = getDefaultEditData()
  cambiosRealizados.value = []
}

function buildEditDataFromUser(user) {
  if (!user) {
    return getDefaultEditData()
  }

  return {
    nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    documento: user.documentNumber || '',
    correo: user.email?.personal || '',
    correoInstitucional: user.email?.institutional || '',
    programa: getProgramName(user),
    ficha: getFichaNumber(user),
    telefono: sanitizePhone(user.phone || '')
  }
}

function obtenerIniciales(nombre) {
  if (!nombre || nombre === 'Cargando...') return '?'
  const palabras = nombre.trim().split(' ')
  if (palabras.length >= 2) {
    return (palabras[0][0] + palabras[1][0]).toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
}

function getFichaNumber(user) {
  if (user?.fichaNumber) {
    return user.fichaNumber
  }
  
  if (user?.ficha || user?.fiche) {
    return user.ficha || user.fiche
  }
  
  if (user?.recordNumber && Array.isArray(user.recordNumber) && user.recordNumber.length > 0) {
    // Reemplazar find con while loop
    let activeFiche = null
    let idx = 0
    while (idx < user.recordNumber.length && !activeFiche) {
      if (user.recordNumber[idx] && user.recordNumber[idx].status === 0) {
        activeFiche = user.recordNumber[idx]
      }
      idx++
    }
    if (!activeFiche && user.recordNumber.length > 0) {
      activeFiche = user.recordNumber[0]
    }
    
    if (activeFiche?.fiche && typeof activeFiche.fiche === 'object' && activeFiche.fiche.number) {
      return activeFiche.fiche.number
    }
    
    if (activeFiche?.fiche) {
      return 'Ficha asignada'
    }
  }
  
  return ''
}

function getProgramName(user) {
  if (user?.programName) {
    return user.programName
  }
  
  if (user?.programa) {
    return typeof user.programa === 'string' 
      ? user.programa 
      : user.programa?.name || ''
  }
  
  if (user?.recordNumber && Array.isArray(user.recordNumber) && user.recordNumber.length > 0) {
    // Reemplazar find con while loop
    let activeFiche = null
    let idx = 0
    while (idx < user.recordNumber.length && !activeFiche) {
      if (user.recordNumber[idx] && user.recordNumber[idx].status === 0) {
        activeFiche = user.recordNumber[idx]
      }
      idx++
    }
    if (!activeFiche && user.recordNumber.length > 0) {
      activeFiche = user.recordNumber[0]
    }
    
    if (activeFiche?.fiche && typeof activeFiche.fiche === 'object') {
      if (activeFiche.fiche.program?.name) {
        return activeFiche.fiche.program.name
      }
      
      if (activeFiche.fiche.program) {
        return 'Programa asociado'
      }
    }
  }
  
  return ''
}

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

function decodeJWT(token) {
  try {
    if (!token || typeof token !== 'string') {
      return null
    }

    const base64Url = token.split('.')[1]
    if (!base64Url) {
      return null
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const atobFn =
      (typeof window !== 'undefined' && typeof window.atob === 'function' && window.atob.bind(window)) ||
      (typeof globalThis !== 'undefined' && typeof globalThis.atob === 'function' && globalThis.atob.bind(globalThis))

    if (!atobFn) {
      console.warn('No se pudo decodificar el token: atob no está disponible en este entorno.')
      return null
    }

    const binaryString = atobFn(base64)

    let encoded = ''
    let idx = 0
    while (idx < binaryString.length) {
      const hex = binaryString.charCodeAt(idx).toString(16).padStart(2, '0')
      encoded += '%' + hex
      idx++
    }

    const jsonPayload = decodeURIComponent(encoded)
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error al decodificar JWT:', error)
    return null
  }
}

function abrirModalEdicion() {
  const editData = buildEditDataFromUser(usuario.value)
  datosEdicion.value = { ...editData }
  datosOriginales.value = { ...editData }
  showEditDialog.value = true
}

function cancelarEdicion() {
  showEditDialog.value = false
  resetEditState()
}

function sanitizePhone(value) {
  if (!value && value !== 0) return ''
  return String(value).replace(/[^0-9]/g, '')
}

function mostrarModalConfirmacion() {
  const telefonoOriginal = sanitizePhone(datosOriginales.value.telefono)
  const correoOriginal = (datosOriginales.value.correo || '').trim()
  const telefonoActual = sanitizePhone(datosEdicion.value.telefono)
  const correoActual = (datosEdicion.value.correo || '').trim()

  datosEdicion.value.telefono = telefonoActual

  const resumen = []

  if (correoActual !== correoOriginal) {
    resumen.push({
      campo: 'Correo personal',
      anterior: correoOriginal || '(vacío)',
      nuevo: correoActual || '(vacío)'
    })
  }

  if (telefonoActual !== telefonoOriginal) {
    resumen.push({
      campo: 'Teléfono',
      anterior: telefonoOriginal || '(vacío)',
      nuevo: telefonoActual || '(vacío)'
    })
  }

  if (resumen.length === 0) {
    notifications.info('No se han realizado cambios.')
    return
  }

  cambiosRealizados.value = resumen
  showEditDialog.value = false
  showConfirmationDialog.value = true
}

function cancelarConfirmacion() {
  showConfirmationDialog.value = false
  showEditDialog.value = true
}


async function confirmarCambios() {
  loading.value = true
  try {
    const userId = authStore.user?._id || authStore.user?.id || authStore.user?.uid

    if (!userId) {
      notifications.error('No se pudo identificar al usuario para actualizar.')
      return
    }

    const telefonoActual = sanitizePhone(datosEdicion.value.telefono)
    const correoActual = (datosEdicion.value.correo || '').trim()
    const emailInstitucional =
      datosEdicion.value.correoInstitucional ||
      datosOriginales.value.correoInstitucional ||
      usuario.value?.email?.institutional ||
      ''

    const payload = {
      phone: telefonoActual,
      telefono: telefonoActual,
      phoneNumber: telefonoActual,
      email: correoActual,
      emailPersonal: correoActual,
      emailData: {
        personal: correoActual,
        institutional: emailInstitucional
      }
    }

    if (emailInstitucional) {
      payload.emailInstitutional = emailInstitucional
    }

    await putData(`/apprentices/updatePartApprentice/${userId}`, payload)
    
    const usuarioActualizado = {
      ...usuario.value,
      phone: telefonoActual,
      email: {
        ...(usuario.value?.email || {}),
        personal: correoActual,
        institutional: emailInstitucional
      }
    }
    
    authStore.setUser(usuarioActualizado)

    try {
      const authStorage = JSON.parse(localStorage.getItem('auth') || '{}')
      localStorage.setItem('auth', JSON.stringify({ ...authStorage, user: usuarioActualizado }))
    } catch (storageError) {
      console.warn('No se pudo sincronizar el usuario en localStorage:', storageError)
    }
    
    showConfirmationDialog.value = false
    resetEditState()

    notifications.success('¡Tus datos han sido guardados permanentemente!')
  } catch (error) {
    console.error('Error al actualizar datos en el backend:', error)
    const errorMsg = error.response?.data?.msg || 
                     error.response?.data?.message || 
                     (Array.isArray(error.response?.data?.errors) ? error.response.data.errors.join('. ') : null) ||
                     error.message || 
                     'No se pudo guardar la información. Inténtalo de nuevo.'
    notifications.error(errorMsg)
  } finally {
    loading.value = false
  }
}

function abrirModalContactar() {
  showContactDialog.value = true
}

function cerrarModalContacto() {
  showContactDialog.value = false
}

async function cargarDatosCompletos() {
  try {
    if (usuario.value?.recordNumber && Array.isArray(usuario.value.recordNumber) && usuario.value.recordNumber.length > 0) {
      if (usuario.value?.fichaNumber && usuario.value?.programName) {
        return
      }
    }

    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    const token = authStore.token || auth?.token
    
    if (!token) {
      return
    }

    let apprenticeData = null
    let recordNumber = null

    try {
      const currentToken = authStore.token || auth?.token || token
      
      const decoded = decodeJWT(currentToken || token)
      const apprenticeId = decoded?.uid?._id || decoded?.uid?.id || usuario.value?._id || usuario.value?.id
      
      const response = await getData('/apprentices/apprenticeById')
      
      if (response) {
        const responseData = response?.data || response?.msg || response
        
        if (Array.isArray(responseData) && responseData.length > 0) {
          apprenticeData = responseData[0]
        } else if (responseData && typeof responseData === 'object') {
          apprenticeData = responseData
        }

        if (apprenticeData) {
          recordNumber = apprenticeData.recordNumber || []
        }
      }
    } catch (apiError) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ No se pudo obtener datos de la API, usando token como fallback')
      }
      
      const decoded = decodeJWT(token)
      apprenticeData = decoded?.uid || decoded?.user || null
      
      if (apprenticeData) {
        recordNumber = apprenticeData.recordNumber || []
      }
    }

    if (!apprenticeData) {
      if (usuario.value?.recordNumber) {
        apprenticeData = usuario.value
        recordNumber = usuario.value.recordNumber
      } else {
        return
      }
    }

    if (!recordNumber && usuario.value?.recordNumber) {
      recordNumber = usuario.value.recordNumber
    }
    
    const usuarioActualizado = {
      ...usuario.value,
      ...(apprenticeData || {}),
      recordNumber: recordNumber || usuario.value?.recordNumber || []
    }
    
    if (recordNumber && Array.isArray(recordNumber) && recordNumber.length > 0) {
      // Buscar usando while
      let activeFiche = null
      let i = 0
      while (i < recordNumber.length) {
        if (recordNumber[i].status === 0) {
          activeFiche = recordNumber[i]
          break
        }
        i++
      }
      if (!activeFiche && recordNumber.length > 0) {
        activeFiche = recordNumber[0]
      }
      
      if (activeFiche?.fiche && typeof activeFiche.fiche === 'object' && !Array.isArray(activeFiche.fiche)) {
        if (activeFiche.fiche.number && !usuarioActualizado.fichaNumber) {
          usuarioActualizado.fichaNumber = activeFiche.fiche.number
        }
        
        if (activeFiche.fiche.program) {
          if (typeof activeFiche.fiche.program === 'object' && activeFiche.fiche.program.name) {
            usuarioActualizado.programName = activeFiche.fiche.program.name
          } else if (typeof activeFiche.fiche.program === 'string') {
            usuarioActualizado.programId = activeFiche.fiche.program
          }
        }
        
        usuarioActualizado.ficheId = activeFiche.fiche._id || extractObjectId(activeFiche.fiche)
      } else {
        const ficheId = extractObjectId(activeFiche?.fiche)
        if (ficheId) {
          usuarioActualizado.ficheId = ficheId
        }
      }
    }
    
    authStore.setUser(usuarioActualizado)
  } catch (error) {
    console.error('Error al cargar datos completos del aprendiz:', error)
  }
}

async function cargarInstructores() {
  try {
    instructores.value = [{ nombre: 'Cargando...', telefono: '-', correo: '-' }]
    
    // Obtener la ficha del usuario
    const ficheId = usuario.value?.ficheId || usuario.value?.recordNumber?.[0]?.fiche?._id
    
    if (!ficheId) {
      instructores.value = []
      return
    }
    
    // Intentar obtener los instructores de la ficha
    try {
      const response = await getData(`/fiches/ficheById/${ficheId}`)
      const ficheData = response?.data || response?.msg || response
      
      // Los instructores pueden estar en diferentes campos
      const instructoresData = ficheData?.instructors || 
                               ficheData?.instructor || 
                               ficheData?.Instructor ||
                               []
      
      if (!instructoresData || (Array.isArray(instructoresData) && instructoresData.length === 0)) {
        instructores.value = []
        return
      }
      
      // Convertir los datos de instructores al formato esperado
      const instructoresList = Array.isArray(instructoresData) ? instructoresData : [instructoresData]
      
      instructores.value = instructoresList.map(inst => ({
        nombre: inst.name || inst.Name || `${inst.firstName || ''} ${inst.lastName || ''}`.trim() || 'Instructor',
        telefono: inst.phone || inst.Phone || inst.phoneNumber || '-',
        correo: inst.email?.institutional || inst.email?.personal || inst.email || inst.Email || '-'
      }))
      
      // Filtrar instructores sin nombre válido
      instructores.value = instructores.value.filter(inst => inst.nombre && inst.nombre !== 'Instructor')
      
    } catch (ficheError) {
      // Intentar buscar directamente en el objeto del usuario
      if (usuario.value?.instructors || usuario.value?.instructor) {
        const userInstructors = usuario.value?.instructors || [usuario.value?.instructor]
        
        instructores.value = userInstructors.map(inst => ({
          nombre: inst.name || inst.Name || `${inst.firstName || ''} ${inst.lastName || ''}`.trim() || 'Instructor',
          telefono: inst.phone || inst.Phone || '-',
          correo: inst.email?.institutional || inst.email?.personal || inst.email || '-'
        }))
        
        instructores.value = instructores.value.filter(inst => inst.nombre && inst.nombre !== 'Instructor')
      } else {
        instructores.value = []
      }
    }
    
  } catch (error) {
    console.error('Error al cargar instructores:', error)
    instructores.value = []
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    notifications.warning('Debes iniciar sesión para acceder a esta página')
    router.push('/login')
    return
  }

  await cargarDatosCompletos()
  await cargarInstructores()
})
</script>

<style scoped>

.page-content {
  padding: 1rem;
}

.datos-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #ffffff;
}

.datos-card {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
  max-width: 1520px;
  width: 80vw;
  min-width: 320px;
  min-height: 650px;
  margin: 3rem 0;
  margin-top: 1px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 0;
}

.datos-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-bottom: 2.5rem;
  margin-top: 0.5rem;
  min-height: 80px;
  padding-top: 0.5rem;
  font-family: var(--font-family-primary);
}

.datos-title {
  color: #111;
  font-size: 3.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  text-align: center;
  letter-spacing: -1px;
  margin-top: 1.5rem;
}

.editar-datos-link {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem 0;
  z-index: 10;
}

.editar-datos-link:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

.editar-datos-link:active {
  transform: translateY(0);
}

.icon-editar {
  color: grey;
}

.editar-texto {
  color: grey;
  font-weight: 600;
  font-size: 1.08rem;
}

.datos-content {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  font-family: var(--font-family-primary);
}

@media (min-width: 1200px) {
  .datos-content {
    gap: 2.5rem;
    flex-wrap: nowrap;
  }
}

@media (min-width: 1400px) {
  .datos-content {
    gap: 3rem;
  }
}

.datos-info-card {
  flex: 1 1 350px;
  min-width: 300px;
  max-width: 420px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 1.8rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(57, 169, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

@media (min-width: 1200px) {
  .datos-info-card {
    flex: 1;
    min-width: 280px;
    max-width: none;
  }
}

.datos-info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-border-primary);
}

.card-title {
  color: var(--color-primary);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.datos-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.datos-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #ffffff;
  border-radius: 10px;
  border-left: 3px solid var(--color-border-primary);
  transition: all 0.2s ease;
}

.datos-item:hover {
  background: #f8f9fa;
  border-left-width: 4px;
  transform: translateX(4px);
}

.datos-item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-icon {
  color: var(--color-primary);
  opacity: 0.8;
}

.datos-item-value {
  font-size: 1.15rem;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.5;
  word-break: break-word;
}

.ficha-badge {
  display: inline-block;
  background: var(--gradient-primary-dark);
  color: white !important;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  box-shadow: 0 2px 8px rgba(57, 169, 0, 0.3);
}

.programa-item {
  grid-column: 1 / -1;
}

.programa-text {
  font-size: 1rem !important;
  line-height: 1.6;
  color: #2c3e50;
  max-height: 4.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.tooltip-programa {
  max-width: 400px;
  word-wrap: break-word;
  white-space: normal;
}

.datos-instructores {
  flex: 1 1 300px;
  min-width: 280px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.2rem;
  margin-left: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 1.8rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(57, 169, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.datos-instructores:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

@media (min-width: 1200px) {
  .datos-instructores {
    flex: 1;
    min-width: 280px;
    max-width: none;
  }
}

.instructores-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid var(--color-border-primary);
  width: 100%;
}

.no-instructores-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  width: 100%;
  min-height: 150px;
}

.no-instructores-message p {
  font-size: 1.05rem;
  line-height: 1.5;
  margin: 0;
}

.instructor-card {
  display: flex;
  align-items: center;
  background: #f6f8fa;
  border-radius: 2rem;
  border: 1px solid #D9D9D9;
  padding: 0.4rem 1.2rem 0.4rem 0.4rem;
  margin-bottom: 0.2rem;
  min-width: 180px;
  gap: 0.7rem;
}

.instructor-circle {
  background-color: var(--color-primary);
  color: #fff;
  font-weight: bold;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

.instructor-nombre {
  font-size: 1.1rem;
  color: #222;
  font-weight: 500;
}

.section-title {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 1.3rem;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid var(--color-primary);
}

.data-grid {
  display: grid;
  gap: 16px;
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #E0E0E0;
}

.data-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F0F0F0;
}

.data-row:last-child {
  border-bottom: none;
}

.text-weight-bold {
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 600;
}

.data-value {
  color: #34495e;
  font-size: 0.95rem;
  font-weight: 500;
}

.input-readonly {
  opacity: 0.6;
}

.input-readonly .q-field__control {
  background-color: #f5f5f5 !important;
  border-color: #e0e0e0 !important;
}

.input-editable .q-field__control {
  border-color: #1976d2 !important;
  background-color: #fff !important;
}

.input-editable .q-field__control:hover {
  border-color: #1565c0 !important;
}

.tabla-contenedor {
  overflow-x: auto;
  padding: 16px;
}

.tabla-instructores {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.tabla-instructores th {
  font-weight: 700;
  font-size: 1.05rem;
  padding: 8px;
  color: #000;
  background-color: #f0f0f0;
}

.tabla-instructores td {
  font-weight: 600;
  font-size: 1.1rem;
  color: #777;
  padding: 10px 6px;
  border-top: 1px solid #e0e0e0;
}

.correo-link {
  color: #555;
  text-decoration: underline;
  font-weight: 600;
}

.footer-custom {
  margin-top: 24px;
}

.footer-text {
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

:deep(.page-header) {
  width: 100%;
  justify-content: center;
  margin-bottom: 1.5rem;
}

:deep(.page-header__title) {
  color: #111;
  font-size: 3.5rem;
  font-weight: 600;
  letter-spacing: -1px;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}

@media (max-width: 768px) {
  .modal-actions {
    flex-direction: column;
  }

  :deep(.page-header__title) {
    font-size: 2.5rem;
  }

  .section-title {
    font-size: 1.2rem;
    margin-bottom: 15px;
    padding-left: 10px;
  }

  .data-grid {
    gap: 12px;
    padding: 15px;
  }

  .data-row {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 6px 0;
  }

  .data-row .text-weight-bold {
    margin-bottom: 4px;
  }

  .text-weight-bold {
    font-size: 0.9rem;
  }

  .data-value {
    font-size: 0.9rem;
  }
}

@media (max-width: 1200px) {
  .datos-card {
    padding: 2rem 1rem 2rem 1rem;
  }

  .datos-content {
    gap: 1.2rem;
  }
}

@media (max-width: 900px) {
  .datos-content {
    flex-direction: column;
    gap: 2rem;
  }

  .datos-instructores {
    margin-left: 0;
    align-items: stretch;
  }
}

@media (max-width: 600px) {
  .datos-header {
    margin-bottom: 2rem;
  }

  .editar-datos-link {
    position: relative;
    margin-bottom: 8px;
  }

  .datos-title {
    font-size: 2.5rem;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.1rem !important;
    margin-bottom: 12px;
    padding-left: 8px;
  }

  .data-grid {
    gap: 10px;
    padding: 12px;
  }

  .data-row {
    padding: 4px 0;
  }

  .text-weight-bold {
    font-size: 0.85rem;
  }

  .data-value {
    font-size: 0.85rem;
  }
}
</style>