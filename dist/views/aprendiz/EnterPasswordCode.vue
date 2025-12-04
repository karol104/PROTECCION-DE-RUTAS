<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="text-white header-custom">
      <div class="header-content">
        <q-avatar class="header-avatar">
          <img :src="logoWhite" class="avatar-img" />
        </q-avatar>
        <span class="header-title">REPFORA EP</span>
      </div>
    </q-header>

    <q-page-container class="page-container">
      <div class="main-wrapper">
        <div class="back-button-wrapper">
          <BackButton />
        </div>
        
        <div class="content-center">
          <q-card class="recovery-card" flat>
            <div class="icon-section">
              <div class="icon-container">
                <q-icon name="lock_reset" class="icon-main" color="green-6" />
              </div>
              <div class="title-section">
                Ingrese código
              </div>
            </div>

          
            <div class="description-section">
              Revisa tu correo electrónico para encontrar un código de verificación para restablecer tu contraseña. Si no aparece en unos minutos, revisa tu carpeta de correo no deseado.
            </div>

            
            <div class="code-inputs-container">
              <q-input
                v-for="(digit, index) in code"
                :key="index"
                v-model="code[index]"
                :ref="el => inputRefs[index] = el"
                outlined
                maxlength="1"
                class="code-input"
                @input="handleInput(index, $event)"
                @keydown="handleKeydown(index, $event)"
                @paste="handlePaste"
                input-class="text-center"
              />
            </div>

           
            <div class="reenviar-section">
              <a @click="reenviarCodigo" class="reenviar-link">
                <q-icon name="refresh" size="18px" class="q-mr-xs" />
                Reenviar código
              </a>
            </div>

            
            <div class="button-section">
              <Button 
                @click="verificarCodigo" 
                :loading="loading"
                :disable="!codigoCompleto"
              />
            </div>
          </q-card>
        </div>
      </div>
    </q-page-container>

   
    <q-footer class="footer-custom">
      <q-toolbar class="footer-toolbar">
        <q-toolbar-title class="text-center footer-text">
          REPFORA - Sena 2025 © Todos los derechos reservados
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotifications } from 'src/composables/useNotifications.js'
import { putData } from 'src/services/apiClient.js'
import Button from 'src/components/Button.vue'
import BackButton from 'src/components/BackButton.vue'

// Importar logo para Vite
import logoWhite from 'src/assets/LogoSENABlanco.png'

const router = useRouter()
const route = useRoute()
const notify = useNotifications()

const loading = ref(false)
const resending = ref(false)
const code = ref(['', '', '', '', '', ''])
const inputRefs = ref([])

const codigoCompleto = computed(() => {
  let idx = 0
  let allFilled = true
  while (idx < code.value.length && allFilled) {
    if (code.value[idx] === '') {
      allFilled = false
    }
    idx++
  }
  return allFilled
})

// Función para obtener el código de verificación
const getVerificationCode = () => {
  let codigoCompleto = ''
  let idx = 0
  while (idx < code.value.length) {
    codigoCompleto += code.value[idx] || ''
    idx++
  }
  return codigoCompleto
}

async function handleInput(index, event) {
  const value = event.target.value
  console.log('handleInput llamado - index:', index, 'value:', value)
  
  if (value && /^\d$/.test(value)) {
    code.value[index] = value
    console.log('Código actualizado:', code.value)
    
    // Mover automáticamente al siguiente input
    if (index < 5) {
      console.log('Intentando mover al siguiente input, index actual:', index)
      await nextTick()
      const nextInputComponent = inputRefs.value[index + 1]
      console.log('nextInputComponent:', nextInputComponent)
      
      if (nextInputComponent) {
        console.log('nextInputComponent.$el:', nextInputComponent.$el)
        
        // Intentar varios métodos para obtener el elemento input nativo
        const nativeInput = nextInputComponent.$el?.querySelector('input') || 
                           nextInputComponent.$refs?.input?.$el?.querySelector('input') ||
                           nextInputComponent.$el?.querySelector('.q-field__native')
        
        console.log('nativeInput encontrado:', nativeInput)
        
        if (nativeInput) {
          nativeInput.focus()
          nativeInput.select()
          console.log('Focus aplicado al siguiente input')
        } else {
          console.log('No se pudo encontrar el nativeInput')
        }
      } else {
        console.log('nextInputComponent es null o undefined')
      }
    }
  } else if (!value) {
    code.value[index] = ''
  } else {
    code.value[index] = ''
    event.target.value = ''
  }
}

function handleKeydown(index, event) {
  if (event.key === 'Backspace') {
    if (!code.value[index] && index > 0) {
      const prevInput = inputRefs.value[index - 1]
      if (prevInput && prevInput.$el) {
        const input = prevInput.$el.querySelector('input')
        if (input) {
          input.focus()
        }
      }
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    const prevInput = inputRefs.value[index - 1]
    if (prevInput && prevInput.$el) {
      const input = prevInput.$el.querySelector('input')
      if (input) {
        input.focus()
      }
    }
  } else if (event.key === 'ArrowRight' && index < 5) {
    const nextInput = inputRefs.value[index + 1]
    if (nextInput && nextInput.$el) {
      const input = nextInput.$el.querySelector('input')
      if (input) {
        input.focus()
      }
    }
  }
}

function handlePaste(event) {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').slice(0, 6)
  
  if (/^\d+$/.test(pastedData)) {
    let i = 0
    while (i < pastedData.length && i < 6) {
      code.value[i] = pastedData[i]
      i++
    }
    
    // Reemplazar findIndex con while loop
    let nextEmptyIndex = -1
    let idx = 0
    while (idx < code.value.length && nextEmptyIndex === -1) {
      if (code.value[idx] === '') {
        nextEmptyIndex = idx
      }
      idx++
    }
    
    if (nextEmptyIndex !== -1) {
      const targetInput = inputRefs.value[nextEmptyIndex]
      if (targetInput && targetInput.$el) {
        const input = targetInput.$el.querySelector('input')
        if (input) {
          input.focus()
        }
      }
    } else {
      const lastInput = inputRefs.value[5]
      if (lastInput && lastInput.$el) {
        const input = lastInput.$el.querySelector('input')
        if (input) {
          input.focus()
        }
      }
    }
  }
}

function reenviarCodigo() {
  const email = route.query.email
  
  if (!email) {
    notify.error('No se encontró el correo electrónico')
    return
  }

  resending.value = true

  putData(`/apprentices/resetPassword/${email}`)
    .then((response) => {
      notify.success(
        response.msg || response.message || 'Código reenviado. Revisa tu correo electrónico.'
      )
      code.value = ['', '', '', '', '', '']
      nextTick(() => {
        const firstInput = inputRefs.value[0]
        if (firstInput && firstInput.$el) {
          const input = firstInput.$el.querySelector('input')
          if (input) {
            input.focus()
          }
        }
      })
    })
    .catch((error) => {
      const errorMessage = error.response?.data?.msg || 
                          error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al reenviar el código. Intenta nuevamente.'
      notify.error(errorMessage)
    })
    .finally(() => {
      resending.value = false
    })
}

async function verificarCodigo() {
  loading.value = true
  
  try {
    const codigoVerificacion = getVerificationCode()
    const email = route.query.email
    
    if (!email) {
      notify.error('No se encontró el correo electrónico')
      loading.value = false
      return
    }

    if (!codigoVerificacion || codigoVerificacion.length !== 6) {
      notify.error('El código debe tener 6 dígitos')
      loading.value = false
      return
    }
    
    notify.success('Código verificado correctamente')
    
    router.push({
      path: '/NuevaContrasena',
      query: { 
        code: codigoVerificacion,
        email: email
      }
    })
    
  } catch (error) {
    const errorMessage = error.response?.data?.msg || 
                        error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Código inválido o expirado'
    notify.error(errorMessage)
    code.value = ['', '', '', '', '', '']
    nextTick(() => {
      const firstInput = inputRefs.value[0]
      if (firstInput && firstInput.$el) {
        const input = firstInput.$el.querySelector('input')
        if (input) {
          input.focus()
        }
      }
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>

.header-custom {
  background-color: var(--color-primary);
  height: 90px;
}

.header-content {
  position: relative;
  height: 90px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-avatar {
  position: absolute;
  left: 16px;
  width: 80px;
  height: 80px;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  height: 80px;
  width: auto;
  background-color: var(--color-primary);
}

.header-title {
  font-size: 2.5rem;
  font-weight: bold;
}


.page-container {
  background-color: var(--color-bg-light);
  min-height: calc(100vh - 90px - 52px);
}

.main-wrapper {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 90px - 52px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
}

.content-center {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
}

.back-button-wrapper {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}

/* Card */
.recovery-card {
  width: 100%;
  border: 3px solid var(--color-border-primary);
  border-radius: 24px;
  background: var(--color-bg-primary);
  padding: 28px 32px;
  box-shadow: 0 4px 12px var(--shadow-general);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
}

.icon-container {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: var(--color-success-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.icon-main {
  font-size: 70px;
}

.title-section {
  font-size: 1.85rem;
  font-weight: bold;
  color: var(--color-text-primary);
  text-align: center;
}

.description-section {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
  max-width: 500px;
}


.code-inputs-container {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.code-input {
  width: 58px;
}

.code-input :deep(.q-field__control) {
  height: 65px;
  border-radius: 12px;
  box-shadow: none;
}

.code-input :deep(input) {
  font-size: 26px;
  font-weight: bold;
  text-align: center;
}

.code-input :deep(.q-field__control):focus-within {
  border: 2px solid var(--color-border-primary);
  box-shadow: none;
}


.reenviar-section {
  text-align: center;
  margin-bottom: 18px;
}

.reenviar-link {
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
}

.reenviar-link:hover {
  text-decoration: underline;
  color: var(--color-primary-hover);
}


.button-section {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
}


.footer-custom {
  background-color: var(--color-border-light);
  color: var(--color-text-primary);
}

.footer-toolbar {
  min-height: 52px;
}

.footer-text {
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Tablets */
@media (max-width: 768px) {
  .header-custom {
    height: 80px;
  }

  .header-content {
    height: 80px;
  }

  .header-avatar {
    width: 70px;
    height: 70px;
  }

  .avatar-img {
    height: 70px;
  }

  .header-title {
    font-size: 2.2rem;
  }

  .main-wrapper {
    min-height: calc(100vh - 80px - 48px);
    padding: 25px 18px;
  }

  .recovery-card {
    padding: 26px 28px;
  }

  .icon-container {
    width: 100px;
    height: 100px;
  }

  .icon-main {
    font-size: 64px;
  }

  .title-section {
    font-size: 1.75rem;
  }

  .description-section {
    font-size: 0.95rem;
    margin-bottom: 18px;
  }

  .code-input {
    width: 54px;
  }

  .code-input :deep(.q-field__control) {
    height: 62px;
  }

  .code-input :deep(input) {
    font-size: 24px;
  }

  .footer-toolbar {
    min-height: 48px;
  }

  .footer-text {
    font-size: 0.85rem;
  }
}

/* Móviles */
@media (max-width: 600px) {
  .header-custom {
    height: 70px;
  }

  .header-content {
    height: 70px;
  }

  .header-avatar {
    width: 60px;
    height: 60px;
    left: 12px;
  }

  .avatar-img {
    height: 60px;
  }

  .header-title {
    font-size: 1.8rem;
  }

  .main-wrapper {
    min-height: calc(100vh - 70px - 46px);
    padding: 20px 15px;
  }

  .back-button-wrapper {
    top: 15px;
    left: 15px;
  }

  .recovery-card {
    padding: 22px 20px;
    border-width: 2.5px;
  }

  .icon-section {
    margin-bottom: 14px;
  }

  .icon-container {
    width: 90px;
    height: 90px;
    margin-bottom: 12px;
  }

  .icon-main {
    font-size: 56px;
  }

  .title-section {
    font-size: 1.6rem;
  }

  .description-section {
    font-size: 0.9rem;
    line-height: 1.45;
    margin-bottom: 16px;
  }

  .code-inputs-container {
    gap: 8px;
    margin-bottom: 14px;
  }

  .code-input {
    width: 48px;
  }

  .code-input :deep(.q-field__control) {
    height: 58px;
  }

  .code-input :deep(input) {
    font-size: 22px;
  }

  .reenviar-section {
    margin-bottom: 16px;
  }

  .reenviar-link {
    font-size: 0.9rem;
  }

  .footer-toolbar {
    min-height: 46px;
  }

  .footer-text {
    font-size: 0.8rem;
  }
}

/* Móviles pequeños */
@media (max-width: 480px) {
  .header-custom {
    height: 65px;
  }

  .header-content {
    height: 65px;
  }

  .header-avatar {
    width: 55px;
    height: 55px;
  }

  .avatar-img {
    height: 55px;
  }

  .header-title {
    font-size: 1.6rem;
  }

  .main-wrapper {
    min-height: calc(100vh - 65px - 44px);
    padding: 18px 12px;
  }

  .recovery-card {
    padding: 20px 16px;
    border-width: 2px;
  }

  .icon-container {
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
  }

  .icon-main {
    font-size: 50px;
  }

  .icon-section {
    margin-bottom: 12px;
  }

  .title-section {
    font-size: 1.4rem;
  }

  .description-section {
    font-size: 0.85rem;
    margin-bottom: 14px;
  }

  .code-inputs-container {
    gap: 6px;
    margin-bottom: 12px;
  }

  .code-input {
    width: 44px;
  }

  .code-input :deep(.q-field__control) {
    height: 54px;
  }

  .code-input :deep(input) {
    font-size: 20px;
  }

  .reenviar-section {
    margin-bottom: 14px;
  }

  .reenviar-link {
    font-size: 0.85rem;
  }

  .footer-toolbar {
    min-height: 44px;
  }

  .footer-text {
    font-size: 0.75rem;
  }
}


@media (max-width: 360px) {
  .header-custom {
    height: 60px;
  }

  .header-content {
    height: 60px;
  }

  .header-avatar {
    width: 50px;
    height: 50px;
    left: 10px;
  }

  .avatar-img {
    height: 50px;
  }

  .header-title {
    font-size: 1.4rem;
  }

  .main-wrapper {
    min-height: calc(100vh - 60px - 42px);
    padding: 15px 10px;
  }

  .back-button-wrapper {
    top: 12px;
    left: 12px;
  }

  .recovery-card {
    padding: 18px 14px;
  }

  .icon-container {
    width: 70px;
    height: 70px;
    margin-bottom: 8px;
  }

  .icon-main {
    font-size: 44px;
  }

  .icon-section {
    margin-bottom: 10px;
  }

  .title-section {
    font-size: 1.25rem;
  }

  .description-section {
    font-size: 0.8rem;
    line-height: 1.4;
    margin-bottom: 12px;
  }

  .code-inputs-container {
    gap: 15px;
    margin-bottom: 10px;
  }

  .code-input {
    width: 40px;
  }

  .code-input :deep(.q-field__control) {
    height: 50px;
    border-radius: 10px;
  }

  .code-input :deep(input) {
    font-size: 18px;
  }

  .reenviar-section {
    margin-bottom: 12px;
  }

  .reenviar-link {
    font-size: 0.8rem;
  }

  .footer-toolbar {
    min-height: 42px;
  }

  .footer-text {
    font-size: 0.7rem;
  }
}

/* Pantallas muy pequeñas - 300px */
@media (max-width: 300px) {
  .header-custom {
    height: 55px;
  }

  .header-content {
    height: 55px;
  }

  .header-avatar {
    width: 45px;
    height: 45px;
    left: 8px;
  }

  .avatar-img {
    height: 45px;
  }

  .header-title {
    font-size: 1.2rem;
  }

  .main-wrapper {
    min-height: calc(100vh - 55px - 40px);
    padding: 12px 8px;
  }

  .back-button-wrapper {
    top: 18px;
    left: 10px;
  }

  .recovery-card {
    padding: 14px 10px;
    border-width: 2px;
    border-radius: 16px;
  }

  .icon-section {
    margin-bottom: 8px;
  }

  .icon-container {
    width: 60px;
    height: 60px;
    margin-bottom: 6px;
  }

  .icon-main {
    font-size: 38px;
  }

  .title-section {
    font-size: 1.1rem;
  }

  .description-section {
    font-size: 0.72rem;
    line-height: 1.35;
    margin-bottom: 10px;
  }

  .code-inputs-container {
    gap: 4px;
    margin-bottom: 8px;
  }

  .code-input {
    width: 36px;
  }

  .code-input :deep(.q-field__control) {
    height: 46px;
    border-radius: 8px;
  }

  .code-input :deep(input) {
    font-size: 16px;
  }

  .reenviar-section {
    margin-bottom: 10px;
  }

  .reenviar-link {
    font-size: 0.72rem;
  }

  .reenviar-link :deep(.q-icon) {
    font-size: 14px;
  }

  .footer-toolbar {
    min-height: 40px;
  }

  .footer-text {
    font-size: 0.65rem;
    letter-spacing: 0.3px;
  }
}

/* Landscape móviles */
@media (max-height: 600px) and (orientation: landscape) {
  .main-wrapper {
    padding: 15px;
  }

  .recovery-card {
    padding: 16px 24px;
  }

  .icon-container {
    width: 70px;
    height: 70px;
    margin-bottom: 8px;
  }

  .icon-main {
    font-size: 44px;
  }

  .icon-section {
    margin-bottom: 10px;
  }

  .title-section {
    font-size: 1.3rem;
  }

  .description-section {
    font-size: 0.85rem;
    margin-bottom: 12px;
    line-height: 1.35;
  }

  .code-inputs-container {
    gap: 6px;
    margin-bottom: 10px;
  }

  .code-input {
    width: 42px;
  }

  .code-input :deep(.q-field__control) {
    height: 50px;
  }

  .code-input :deep(input) {
    font-size: 18px;
  }

  .reenviar-section {
    margin-bottom: 10px;
  }

  .reenviar-link {
    font-size: 0.8rem;
  }
}
</style>