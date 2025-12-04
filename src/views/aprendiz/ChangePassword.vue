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
            <div class="logo-section">
              <img :src="logoSena" alt="Logo SENA" class="logo-img">
            </div>

            <div class="title-section">
              Cambia tu Contraseña
            </div>

            <div class="description-section">
              Ingrese la dirección de correo electrónico verificada de su cuenta de usuario y le enviaremos un enlace para restablecer su contraseña.
            </div>

            <div class="label-section">
              Correo electrónico:
            </div>

    
            <div class="input-section">
              <q-input 
                v-model="email" 
                type="email" 
                placeholder="karoluquez12@gmail.com" 
                outlined 
                dense
                class="email-input"
                :error="emailError"
                :error-message="emailErrorMessage"
                @blur="validateEmail"
                @input="validateEmail"
                @keyup.enter="sendResetEmail"
                :rules="[
                  val => !!val || 'El correo es requerido',
                  val => isValidEmail(val) || 'Debe ser un correo de Gmail o Hotmail válido'
                ]"
              />
            </div>

            
            <div class="button-section">
              <Button 
                label="Enviar correo electrónico de restablecimiento"
                @click="sendResetEmail" 
                :loading="loading"
                :disable="emailError || !email"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { putData } from 'src/services/apiClient.js'
import { useNotifications } from 'src/composables/useNotifications.js'
import BackButton from 'src/components/BackButton.vue'
import Button from 'src/components/Button.vue'

// Importar logos para Vite
import logoWhite from 'src/assets/LogoSENABlanco.png'
import logoSena from 'src/assets/logo-sena.png'

const router = useRouter()
const notify = useNotifications()
const email = ref('')
const loading = ref(false)
const emailError = ref(false)
const emailErrorMessage = ref('')


const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://repfora-ep-backend.onrender.com/api'

const isValidEmail = (emailValue) => {
    if (!emailValue) return false
    
    const emailLower = emailValue.toLowerCase().trim()
    const gmailPattern = /^[a-zA-Z0-9._-]+@gmail\.com$/
    const hotmailPattern = /^[a-zA-Z0-9._-]+@(hotmail|outlook)\.(com|es)$/
    
    return gmailPattern.test(emailLower) || hotmailPattern.test(emailLower)
}

const validateEmail = () => {
    if (!email.value) {
        emailError.value = true
        emailErrorMessage.value = 'El correo es requerido'
        return false
    }
    
    if (!isValidEmail(email.value)) {
        emailError.value = true
        emailErrorMessage.value = 'Debe ser un correo válido de Gmail o Hotmail (ejemplo: usuario@gmail.com)'
        return false
    }
    
    emailError.value = false
    emailErrorMessage.value = ''
    return true
}



const sendResetEmail = async () => {
    if (!validateEmail()) {
        notify.error('Por favor ingrese un correo de Gmail o Hotmail válido')
        return
    }

    loading.value = true

    try {
        // Llamado al API para enviar el código de restablecimiento
        const response = await putData(
            `/apprentices/resetPassword/${email.value}`
        )
        
        
        notify.success(
            response.msg || response.message || `Correo de restablecimiento enviado a: ${email.value}`
        )

        // Redirigir a la página de ingresar código con el email
        router.push({
            path: '/IngresarCodigoContrasena',
            query: { email: email.value }
        })
        
    } catch (error) {
        
        let errorMessage = 'Error al enviar el correo. Intenta nuevamente.'
        
        if (error.response) {
            console.error('Error del servidor:', error.response.data)
            errorMessage = error.response.data.msg || 
                          error.response.data.message || 
                          error.response.data.error || 
                          `Error ${error.response.status}: No se pudo enviar el correo`
        } else if (error.request) {

            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.'
        } else {
            errorMessage = error.message
        }
        
        notify.error(errorMessage)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
/* Header */
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

/* Page Container */
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

.logo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}

.logo-img {
  width: 90px;
  height: auto;
}

.title-section {
  font-size: 1.85rem;
  font-weight: bold;
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: 16px;
}

.description-section {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
  max-width: 500px;
}

.label-section {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 10px;
  width: 100%;
}

.input-section {
  width: 100%;
  max-width: 500px;
  margin-bottom: 18px;
}

.email-input {
  width: 100%;
}

.email-input :deep(.q-field__control) {
  height: 52px;
  border-radius: 8px;
}

.email-input :deep(.q-field__native) {
  font-size: 1rem;
  color: var(--color-text-primary);
}

.email-input :deep(.q-field__control):focus-within {
  border: 2px solid var(--color-border-primary);
}

.button-section {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
}

/* Footer */
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
    padding: 35px 28px;
  }

  .logo-img {
    width: 90px;
  }

  .title-section {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }

  .description-section {
    font-size: 1rem;
    margin-bottom: 24px;
  }

  .label-section {
    font-size: 1rem;
    margin-bottom: 10px;
  }

  .input-section {
    margin-bottom: 20px;
  }

  .email-input :deep(.q-field__control) {
    height: 52px;
  }

  .submit-btn {
    height: 52px;
    font-size: 0.95rem;
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

  .back-btn {
    top: 15px;
    left: 15px;
  }

  .recovery-card {
    padding: 28px 22px;
    border-width: 2.5px;
  }

  .logo-img {
    width: 80px;
  }

  .logo-section {
    margin-bottom: 16px;
  }

  .title-section {
    font-size: 1.6rem;
    margin-bottom: 18px;
  }

  .description-section {
    font-size: 0.95rem;
    margin-bottom: 20px;
  }

  .label-section {
    font-size: 0.95rem;
  }

  .input-section {
    margin-bottom: 18px;
  }

  .email-input :deep(.q-field__control) {
    height: 50px;
  }

  .email-input :deep(.q-field__native) {
    font-size: 0.95rem;
  }

  .submit-btn {
    height: 50px;
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
    padding: 24px 18px;
    border-width: 2px;
  }

  .logo-img {
    width: 70px;
  }

  .title-section {
    font-size: 1.4rem;
    margin-bottom: 16px;
  }

  .description-section {
    font-size: 0.88rem;
    margin-bottom: 18px;
    line-height: 1.5;
  }

  .label-section {
    font-size: 0.9rem;
    margin-bottom: 10px;
  }

  .input-section {
    margin-bottom: 16px;
  }

  .email-input :deep(.q-field__control) {
    height: 48px;
  }

  .email-input :deep(.q-field__native) {
    font-size: 0.9rem;
  }

  .submit-btn {
    height: 48px;
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

  .back-btn {
    top: 12px;
    left: 12px;
  }

  .recovery-card {
    padding: 20px 16px;
  }

  .logo-img {
    width: 60px;
  }

  .logo-section {
    margin-bottom: 12px;
  }

  .title-section {
    font-size: 1.25rem;
    margin-bottom: 14px;
  }

  .description-section {
    font-size: 0.82rem;
    margin-bottom: 16px;
    line-height: 1.45;
  }

  .label-section {
    font-size: 0.85rem;
    margin-bottom: 8px;
  }

  .input-section {
    margin-bottom: 14px;
  }

  .email-input :deep(.q-field__control) {
    height: 46px;
  }

  .email-input :deep(.q-field__native) {
    font-size: 0.85rem;
  }

  .submit-btn {
    height: 46px;
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

  .back-btn {
    top: 10px;
    left: 10px;
  }

  .recovery-card {
    padding: 16px 12px;
    border-width: 2px;
    border-radius: 16px;
  }

  .logo-img {
    width: 50px;
  }

  .logo-section {
    margin-bottom: 10px;
  }

  .title-section {
    font-size: 1.1rem;
    margin-bottom: 12px;
  }

  .description-section {
    font-size: 0.75rem;
    margin-bottom: 14px;
    line-height: 1.4;
  }

  .label-section {
    font-size: 0.78rem;
    margin-bottom: 6px;
  }

  .input-section {
    margin-bottom: 12px;
  }

  .email-input :deep(.q-field__control) {
    height: 42px;
    border-radius: 6px;
  }

  .email-input :deep(.q-field__native) {
    font-size: 0.78rem;
  }

  .submit-btn {
    height: 42px;
    font-size: 0.75rem;
    border-radius: 6px;
  }

  .footer-toolbar {
    min-height: 40px;
  }

  .footer-text {
    font-size: 0.65rem;
    letter-spacing: 0.3px;
  }
}

@media (max-height: 600px) and (orientation: landscape) {
  .main-wrapper {
    padding: 15px;
  }

  .recovery-card {
    padding: 20px 24px;
  }

  .logo-img {
    width: 60px;
  }

  .logo-section {
    margin-bottom: 10px;
  }

  .title-section {
    font-size: 1.3rem;
    margin-bottom: 12px;
  }

  .description-section {
    font-size: 0.85rem;
    margin-bottom: 14px;
    line-height: 1.4;
  }

  .label-section {
    font-size: 0.85rem;
    margin-bottom: 8px;
  }

  .input-section {
    margin-bottom: 12px;
  }

  .email-input :deep(.q-field__control) {
    height: 44px;
  }

  .submit-btn {
    height: 44px;
    font-size: 0.85rem;
  }
}
</style>