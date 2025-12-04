<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header con logo SENA y título -->
    <q-header elevated class="text-white header-login">
      <div class="header-content">
          <q-avatar class="header-logo">
          <img :src="logoWhite" class="header-logo-img" />
        </q-avatar>
        <span class="header-title">REPFORA EP</span>
      </div>
    </q-header>

    <q-page-container class="page-container">
      <div class="flex flex-center content-top content-responsive">
        <q-card class="q-pa-md login-card">
          <!-- Header de la tarjeta -->
          <div class="column items-center" style="width: 100%; margin-bottom: 1rem;">
            <img :src="logoSena" alt="Logo SENA"
              style="width: 80px; height: auto; margin-bottom: 12px;">
            <div class="text-h5 text-bold text-center" style="color: var(--color-text-primary);">INGRESO A REPFORA EP</div>
          </div>

          <!-- Selector de rol -->
          <q-select filled v-model="selectedRole" :options="roleOptions" option-label="label" option-value="value"
            emit-value label="SELECCIONA TU ROL" class="q-mb-md rounded-select"
            style="width: 100%; max-width: 500px; font-size: 1.1rem;">
            <template v-slot:prepend>
              <span class="material-symbols-outlined" style="font-size: 28px; color: var(--color-text-light);">
                identity_platform
              </span>
            </template>
          </q-select>

          <!-- Formularios dinámicos según el rol -->
          <q-form @submit="onSubmit" v-if="selectedRole" class=" form-container">
            <!-- Formulario para Administrador -->
            <template v-if="selectedRole === 'ADMINISTRADOR'">
              <q-input filled v-model="form.correo" label="CORREO" type="text" class="rounded-select"
                :rules="[val => !!val || 'El correo es requerido', val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Formato de correo invalido, tucorreo@gmail.com']"
                @keydown="preventSpaces">
                <template v-slot:prepend>
                  <span class="material-symbols-outlined" style="font-size: 24px; color: var(--color-text-light);">mail</span>
                </template>
              </q-input>
            </template>

            <!-- Formulario para Instructor y Aprendiz -->
            <template v-if="selectedRole === 'INSTRUCTOR' || selectedRole === 'APRENDIZ'">
              <q-select v-model="form.tipoDocumento" :options="tiposDocumento" option-label="label" option-value="value"
                emit-value map-options label="TIPO DE DOCUMENTO" filled class="rounded-select"
                :rules="[val => !!val || 'El tipo de documento es requerido']">
                <template v-slot:prepend>
                  <span class="material-symbols-outlined" style="font-size: 24px; color: var(--color-text-light);">badge</span>
                </template>
              </q-select>

              <q-input filled v-model="form.documento" label="NÚMERO DE DOCUMENTO" type="text" class="rounded-select"
                :rules="[val => !!val || 'El número de documento es requerido']"
                @keydown="preventSpaces">
                <template v-slot:prepend>
                  <span class="material-symbols-outlined" style="font-size: 24px; color: var(--color-text-light);">123</span>
                </template>
              </q-input>

            </template>

            <!-- Campo de contraseña común para todos -->
            <q-input filled v-model="form.contrasena" label="CONTRASEÑA" :type="showPassword ? 'text' : 'password'"
              class="rounded-select" :rules="[val => !!val || 'La contraseña es requerida']"
              @keydown="preventSpaces">
              <template v-slot:prepend>
                <span class="material-symbols-outlined" style="font-size: 24px; color: var(--color-text-light);">lock</span>
              </template>
              <template v-slot:append>
                <q-icon :name="showPassword ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                  @click="showPassword = !showPassword" />
              </template>
            </q-input>

            <div class="row items-center q-mb-sm">
              <q-icon name="vpn_key" size="20px" class="q-mr-xs" />
              <a @click="irRecuperarContrasena" class="text-caption text-grey-7 cursor-pointer">Recuperar contraseña</a>
            </div>

            <!-- Botón de ingreso -->
            <div class="row justify-center" style="width: 100%; padding-top: 32px;">
              <Button label="INGRESAR" type="submit" :loading="loading" customClass="wide-btn" />
            </div>
          </q-form>
        </q-card>
      </div>
    </q-page-container>

    <!-- Footer -->
    <q-footer reveal class="bg-grey-5 text-black">
      <q-toolbar>
        <q-toolbar-title class="text-center">
          <div style="font-size: 0.9rem; font-weight: 500; letter-spacing: 0.5px;">
            REPFORA - Sena 2025 © Todos los derechos reservados
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { postData } from 'src/services/apiClient.js'
import { useNotifications } from 'src/composables/useNotifications.js'
import { useAuthStore } from 'src/stores/authStore.js'
import Button from 'src/components/Button.vue'

// Importar imágenes para que Vite las procese en build
import logoWhite from 'src/assets/LogoSENABlanco.png'
import logoSena from 'src/assets/logo-sena.png'

const router = useRouter()

const loading = ref(false)
const showPassword = ref(false)
const selectedRole = ref(null)
const notify = useNotifications()
const authStore = useAuthStore()

function extractErrorMessage(error) {
  // Intentar varias formas comunes en las que el backend puede devolver mensajes
  const resp = error?.response?.data
  
  // Si el error es un string directo
  if (!resp && typeof error === 'string') return error
  if (!resp && error?.message) return error.message

  // Si no hay respuesta, intentar con el error directamente
  if (!resp) {
    return error?.message || 'Error de autenticación. Verifica tus credenciales.'
  }

  // Priorizar campos comunes
  if (resp?.message) return resp.message
  if (resp?.msg) return resp.msg

  // Algunos backends devuelven un arreglo de errores
  if (resp?.errors) {
    if (Array.isArray(resp.errors) && resp.errors.length > 0) {
      return resp.errors[0] || resp.errors.join(', ')
    }
    if (typeof resp.errors === 'string') return resp.errors
  }

  // Intentar con error directo
  if (resp?.error) {
    if (typeof resp.error === 'string') return resp.error
    if (typeof resp.error === 'object' && resp.error.message) return resp.error.message
  }

  // Fallback a un mensaje genérico o al message de la excepción
  return error?.message || 'Error de autenticación. Verifica tus credenciales.'
}

// Opciones para el selector de rol
const roleOptions = [
  { label: 'Administrador', value: 'ADMINISTRADOR' },
  { label: 'Instructor', value: 'INSTRUCTOR' },
  { label: 'Aprendiz', value: 'APRENDIZ' }
]

// Opciones para tipos de documento
const tiposDocumento = [
  { label: 'Cédula de Ciudadanía', value: 'CC' },
  { label: 'Tarjeta de Identidad', value: 'TI' },
  { label: 'Cédula de Extranjería', value: 'CE' },
  { label: 'PEP', value: 'PEP' },
  { label: 'Permiso por Protección Temporal', value: 'PPT' }
]

const form = ref({
  tipoDocumento: '',
  documento: '',
  correo: '',
  contrasena: ''
})

function irRecuperarContrasena() {
  router.push('/CambiarContrasena')
}

// Función para prevenir espacios en los campos
function preventSpaces(event) {
  if (event.key === ' ' || event.code === 'Space') {
    event.preventDefault()
  }
}

// Watchers para eliminar espacios automáticamente
watch(() => form.value.correo, (newVal) => {
  if (newVal && newVal.includes(' ')) {
    form.value.correo = newVal.replace(/\s/g, '')
  }
})

watch(() => form.value.documento, (newVal) => {
  if (newVal && newVal.includes(' ')) {
    form.value.documento = newVal.replace(/\s/g, '')
  }
})

watch(() => form.value.contrasena, (newVal) => {
  if (newVal && newVal.includes(' ')) {
    form.value.contrasena = newVal.replace(/\s/g, '')
  }
})

const onSubmit = async () => {
  loading.value = true
  try {
    let response;
    switch (selectedRole.value) {
      case 'ADMINISTRADOR':
        try {
          response = await postData('/users/login', {
            role: ["ETAPA PRODUCTIVA VIRTUAL", "ETAPA PRODUCTIVA PRESENCIAL" ],
            email: form.value.correo,
            password: form.value.contrasena
          });
        } catch (error) {
          const errorMessage = extractErrorMessage(error);
          notify.error(errorMessage);
          loading.value = false;
          return;
        }
        break;
        
      case 'INSTRUCTOR':      
        try {
          response = await postData('/instructors/login', {
            tpdocument: form.value.tipoDocumento,
            document: form.value.documento,
            password: form.value.contrasena
          });
        } catch (error) {
          const errorMessage = extractErrorMessage(error);
          notify.error(errorMessage);
          loading.value = false;
          return;
        }
        break;
        
      case 'APRENDIZ':
        try {
          response = await postData('/apprentices/login', {
            password: form.value.contrasena,
            documentType: form.value.tipoDocumento,
            documentNumber: form.value.documento
          });
        } catch (error) {
          const errorMessage = extractErrorMessage(error);
          notify.error(errorMessage);
          loading.value = false;
          return;
        }
        break;
        
      default:
        notify.error('Por favor seleccione un rol válido');
        return;
    }

    // Manejar respuesta según el tipo de usuario
    if (selectedRole.value === 'APRENDIZ') {
      // Para aprendices, el backend no devuelve token, solo user
      if (response && response.user) {
        // Crear un objeto user completo con rol para el authStore
        const userWithRole = {
          ...response.user,
          role: { name: 'APRENDIZ' },
          documentType: form.value.tipoDocumento,
          documentNumber: form.value.documento
        }
        
        // Usar un token ficticio o el _id como token para aprendices
        authStore.setAuth(response.user._id || 'apprentice-session', userWithRole)
        
        router.push('/app/aprendiz/inicio');
        notify.success(response.msg || 'Ingreso exitoso');
      } else {
        notify.error('Respuesta del servidor inválida para aprendiz');
      }
    } else {
      // Para administradores e instructores que sí devuelven token
      if (response && response.token) {

        
        // Normalizar el rol del usuario según el tipo seleccionado
        let userWithNormalizedRole = { ...response.user }
        
        if (selectedRole.value === 'ADMINISTRADOR') {
          // Para administrador, siempre establecer el rol como 'ADMINISTRADOR'
          userWithNormalizedRole.role = { name: 'ADMINISTRADOR' }
        } else if (selectedRole.value === 'INSTRUCTOR') {
          // Para instructor, normalizar a 'INSTRUCTOR' independientemente de si es OWNER o no
          userWithNormalizedRole.role = { name: 'INSTRUCTOR' }
        }
        
        authStore.setAuth(response.token, userWithNormalizedRole)

        switch (selectedRole.value) {
          case 'ADMINISTRADOR':
          case 'INSTRUCTOR':
            router.push('/app/inicio');
            break;
        }

        notify.success(response.msg);
      } else {
        notify.error('Respuesta del servidor inválida');
      }
    }

  } catch (error) {
    console.error('Error general en onSubmit:', error);
    notify.error('Error inesperado en el sistema');
  } finally {
    loading.value = false;
  }
}




</script>

<style>
.login-card {
  width: 600px;
  max-width: 100%;
  border: 3px solid var(--color-border-primary);
  border-radius: 24px;
  background: var(--color-bg-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  box-shadow: 0 4px 12px var(--shadow-general);
  margin-top: 0 !important;
  margin-left: auto;
  margin-right: auto;
}

.form-container {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rounded-select {
  width: 100%;
  margin-bottom: 1rem;
}

.rounded-select :deep(.q-field__control) {
  border-radius: 10px !important;
}

.rounded-select :deep(.q-field__marginal) {
  height: 56px;
}

/* Estilos para reducir el tamaño de las opciones del dropdown */
.rounded-select :deep(.q-menu) {
  font-size: 0.9rem;
}

.rounded-select :deep(.q-item) {
  min-height: 36px;
  padding: 8px 16px;
  font-size: 0.9rem;
}

.rounded-select :deep(.q-item__label) {
  font-size: 0.9rem;
  line-height: 1.4;
}

.wide-btn {
  width: 190px;
  font-size: 1.1rem;
  padding: 14px 0;
}

.material-symbols-outlined {
  color: var(--color-text-light);
}

.content-top {
  align-items: flex-start !important;
}

.page-container {
  height: auto;
  padding: 0;
  overflow-y: auto;
}

.flex.flex-center {
  min-height: auto !important;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  text-decoration: underline;
}

/* Estilos del Header Responsivo */
.header-login {
  background-color: var(--color-primary);
  height: 90px;
  min-height: 70px;
  overflow: hidden;
  position: relative;
}

.header-content {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  gap: 8px;
}

.header-logo {
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  margin: auto 0;
  z-index: 5;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  max-width: 80px;
  max-height: 80px;
  min-width: 60px;
  min-height: 60px;
  overflow: hidden;
}

.header-logo-img {
  height: 100%;
  width: auto;
  max-width: 100%;
  max-height: 100%;
  background-color: var(--color-primary);
  object-fit: contain;
}

.header-title {
  font-size: 3rem;
  font-weight: bold;
  line-height: 80px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 120px);
  margin-left: 100px;
}

/* Media Queries para Responsividad */

/* Tablets (hasta 768px) */
@media (max-width: 768px) {
  .header-login {
    height: 80px;
    min-height: 70px;
  }

  .header-logo {
    width: 70px;
    height: 70px;
    max-width: 70px;
    max-height: 70px;
    left: 8px;
  }

  .header-title {
    font-size: 2.2rem;
    line-height: 70px;
    margin-left: 80px;
    max-width: calc(100% - 100px);
  }
}

/* Móviles pequeños (hasta 480px) */
@media (max-width: 480px) {
  .header-login {
    height: 70px;
    min-height: 60px;
  }

  .header-content {
    padding: 0 8px;
    justify-content: flex-start;
  }

  .header-logo {
    width: 50px;
    height: 50px;
    max-width: 50px;
    max-height: 50px;
    min-width: 45px;
    min-height: 45px;
    left: auto;
    position: relative;
    transform: none;
    margin-right: 0;
    flex-shrink: 0;
    top: auto;
    bottom: auto;
  }

  .header-title {
    font-size: 1.4rem;
    line-height: 70px;
    margin-left: 0;
    max-width: none;
    text-align: left;
    flex: 1;
    white-space: normal;
    overflow: visible;
  }
}

/* Móviles muy pequeños (hasta 360px) */
@media (max-width: 360px) {
  .header-login {
    height: 65px;
    min-height: 55px;
  }

  .header-logo {
    width: 45px;
    height: 45px;
    max-width: 45px;
    max-height: 45px;
    min-width: 40px;
    min-height: 40px;
  }

  .header-title {
    font-size: 1.2rem;
    line-height: 65px;
    max-width: calc(100% - 60px);
  }
}
</style>