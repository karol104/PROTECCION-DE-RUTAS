<template>
  <div class="not-found-page">
    <div class="container">
      <div class="content">
        <div class="icon">
          <q-icon name="search_off" />
        </div>
        
        <h1 class="title">404</h1>
        <h2 class="subtitle">Página No Encontrada</h2>
        
        <p class="message">
          La página que buscas no existe o ha sido movida
        </p>
        
        <div class="actions">
          <q-btn
            flat
            color="primary"
            label="Ir al Inicio"
            @click="goHome"
            class="action-btn" />
          <q-btn
            flat
            color="grey-7"
            label="Volver"
            @click="goBack"
            class="action-btn" />
        </div>
        
        <div class="help-section">
          <q-btn
            flat
            color="grey-6"
            size="sm"
            label="¿Necesitas ayuda?"
            @click="openHelp"
            class="help-btn" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useQuasar } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const goHome = () => {
  // Redirigir según el rol del usuario
  if (authStore.user?.role?.name === 'ADMINISTRADOR') {
    router.push('/app/inicio')
  } else if (authStore.user?.role?.name === 'APRENDIZ') {
    router.push('/app/aprendiz/inicio')
  } else if (authStore.user?.role?.name === 'INSTRUCTOR') {
    router.push('/app/inicio')
  } else {
    router.push('/login')
  }
}

const goBack = () => {
  router.go(-1)
}

const openHelp = () => {
  $q.dialog({
    title: 'Centro de Ayuda',
    message: 'Para obtener ayuda, consulta la documentación del sistema o contacta al administrador.',
    ok: 'Entendido'
  })
}

const contactSupport = () => {
  $q.dialog({
    title: 'Contactar Soporte',
    message: 'Para soporte técnico, contacta al administrador del sistema o envía un correo a soporte@sena.edu.co',
    ok: 'Entendido'
  })
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 480px;
  padding: 0 24px;
}

.content {
  text-align: center;
  padding: 48px 0;
}

.icon {
  margin-bottom: 24px;
}

.icon :deep(.q-icon) {
  font-size: 64px;
  color: #ff9800;
  opacity: 0.8;
}

.title {
  font-size: 72px;
  font-weight: 300;
  color: #424242;
  margin: 0 0 8px 0;
  line-height: 1;
}

.subtitle {
  font-size: 24px;
  font-weight: 400;
  color: #616161;
  margin: 0 0 24px 0;
}

.message {
  font-size: 16px;
  color: #757575;
  line-height: 1.5;
  margin: 0 0 40px 0;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.action-btn {
  min-width: 120px;
  height: 40px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.25px;
}

.help-section {
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.help-btn {
  height: 32px;
  font-size: 13px;
  text-transform: none;
}

/* Responsive */
@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }
  
  .content {
    padding: 32px 0;
  }
  
  .title {
    font-size: 56px;
  }
  
  .subtitle {
    font-size: 20px;
  }
  
  .message {
    font-size: 14px;
    margin-bottom: 32px;
  }
  
  .actions {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>