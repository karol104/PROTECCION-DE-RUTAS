<template>
  <div class="unauthorized-page">
    <div class="container">
      <div class="content">
        <div class="icon">
          <q-icon name="block" />
        </div>
        
        <h1 class="title">403</h1>
        <h2 class="subtitle">Acceso Denegado</h2>
        
        <p class="message">
          No tienes permisos para acceder a esta página
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

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
</script>

<style scoped>
.unauthorized-page {
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
  color: #f44336;
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
}

.action-btn {
  min-width: 120px;
  height: 40px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.25px;
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
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>