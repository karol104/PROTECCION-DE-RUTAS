mainlayout  <template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="text-white custom-header">
      <div class="header-container">
        <div class="row items-center" style="gap:8px;">
          <q-btn
            flat
            round
            dense
            icon="menu"
            color="white"
            aria-label="Menú"
            @click="leftDrawerOpen = !leftDrawerOpen"
          />
        </div>

        <q-avatar class="header-avatar">
          <img :src="logoWhite" alt="logo SENA" />
        </q-avatar>

        <span class="header-title">REPFORA EP</span>

        <div class="header-action-btn">
          <q-btn fab color="white" size="lg" @click="showMorph = !showMorph" unelevated>
            <span style="font-weight:bold; color:var(--color-primary);">{{ userInitials }}</span>
          </q-btn>
        </div>
      </div>
    </q-header>

    <!-- Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="280"
      content-class="drawer-content"
      overlay
      behavior="mobile"
    >
      <div class="drawer-close-arrow" @click="leftDrawerOpen = false">
        <q-icon name="chevron_left" />
      </div>

      <div class="drawer-header-enhanced">
        <div class="drawer-header-content">
          <q-avatar class="drawer-logo-circle">
            <img :src="logoSena" alt="Logo SENA" />
          </q-avatar>

          <div class="drawer-header-text">
            <div class="drawer-text-line-1">
              {{ firstName && lastName ? `${firstName} ${lastName}` : 'PRUEBAS ETAPAS' }}
            </div>
            <div class="drawer-text-line-2">ETAPA PRODUCTIVA</div>
            <div class="drawer-text-line-3">
              {{ roleLabel === 'ETAPA PRODUCTIVA VIRTUAL' || roleLabel === 'ETAPA PRODUCTIVA PRESENCIAL'
                  ? (roleLabel.includes('VIRTUAL') ? 'VIRTUAL' : 'PRESENCIAL')
                  : 'VIRTUAL' }}
            </div>
          </div>
        </div>
      </div>

      <div class="drawer-separator-enhanced"></div>

      <q-scroll-area class="drawer-scroll-area">
        <q-list class="drawer-menu-list">
          <template v-for="item in navItems" :key="item.to">
            <q-item
              clickable
              v-ripple
              @click="go(item.to)"
              class="drawer-menu-item"
              :class="{ 'drawer-menu-item-active': route.path === item.to }"
            >
              <q-item-section avatar class="drawer-menu-icon-wrapper">
                <div class="drawer-menu-icon-bg">
                  <q-icon :name="item.icon" class="drawer-menu-icon" />
                </div>
              </q-item-section>

              <q-item-section>
                <q-item-label class="drawer-menu-label">{{ item.label }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon name="chevron_right" class="drawer-menu-arrow" />
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Morph card -->
    <transition name="fade">
      <div v-if="showMorph" class="morph-float-card">
        <q-card class="bg-primary text-white morph-card">
          <q-card-section class="text-h6">
            ¡Hola, <strong>{{ firstName || 'Usuario' }} {{ lastName || '' }}</strong>, bienvenido!
          </q-card-section>

          <q-card-actions align="right">
            ¿Desea cerrar sesión?
            <q-btn flat round dense icon="logout" class="logout-btn" @click="logout" />
          </q-card-actions>
        </q-card>
      </div>
    </transition>

    <!-- Body -->
    <q-page-container class="page-container">
      <router-view />

      <!-- Notificaciones -->
      <div class="notification-container" aria-hidden="false">
        <transition name="fade">
          <q-card
            v-if="showNotifications"
            class="notification-panel shadow-5"
            role="dialog"
            aria-label="Panel de notificaciones"
          >
            <div class="notification-header row items-center justify-between">
              <div>
                <div class="text-h6">Notificaciones</div>
                <div class="text-caption">{{ unreadCount }} sin leer</div>
              </div>

              <div class="row items-center">
                <q-btn flat dense round icon="done_all" title="Marcar todas" @click="markAllAsRead" />
                <q-btn flat dense round icon="close" title="Cerrar" @click="showNotifications = false" />
              </div>
            </div>

            <q-separator />

            <q-scroll-area class="notification-scroll-area">
              <q-list padding>
                <q-item
                  v-for="note in notificationList"
                  :key="note.id"
                  clickable
                  :class="{ 'unread': !note.read }"
                >
                  <q-item-section avatar>
                    <div class="note-thumb"></div>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ note.title }}</q-item-label>
                    <q-item-label caption lines="2">{{ note.description }}</q-item-label>
                    <div class="text-caption note-time">{{ note.time }}</div>
                  </q-item-section>

                  <q-item-section side top>
                    <div class="notification-actions column">
                      <q-btn flat dense round icon="done" color="positive" size="sm" @click.stop="markAsRead(note)" />
                      <q-btn flat dense round icon="close" color="negative" size="sm" @click.stop="deleteNotification(note.id)" />
                    </div>
                  </q-item-section>
                </q-item>

                <q-item v-if="notificationList.length === 0">
                  <q-item-section class="text-center text-grey">No hay notificaciones</q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>

            <q-separator />

            <div class="notification-footer row items-center justify-between q-pa-sm">
              <q-btn flat label="Limpiar todas" color="negative" @click="clearAll" :disable="notificationList.length === 0" />
              <q-btn flat label="Ver todas" color="primary" @click="openAll" />
            </div>
          </q-card>
        </transition>

        <q-btn
          ref="notiBtn"
          round
          icon="notifications"
          class="notifications-btn"
          @click="toggleNotifications"
        >
          <q-badge v-if="unreadCount > 0" floating color="red" :label="unreadCount" />
        </q-btn>
      </div>
    </q-page-container>

    <q-footer reveal class="bg-grey-5 text-black custom-footer">
      <q-toolbar>
        <q-toolbar-title>
          <div class="footer-text">REPFORA - Sena 2025 © Todos los derechos reservados</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
/* ===== IMPORTS ===== */
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotifications } from 'src/composables/useNotifications'
import { useAuthStore } from '../stores/authStore.js'

import logoWhite from '../assets/LogoSENABlanco.png'
import logoSena from '../assets/logo-sena.png'

/* ===== STATE ===== */
const showMorph = ref(false)
const leftDrawerOpen = ref(false)
const firstName = ref('')
const lastName = ref('')
const role = ref('')
const router = useRouter()
const route = useRoute()
const notifications = useNotifications()
const authStore = useAuthStore()

const roleLabel = computed(() => {
  if (Array.isArray(role.value)) return role.value.join(' ')
  return role.value || 'Sin rol'
})

/* INICIALES DEL USUARIO */
const userInitials = computed(() => {
  if (!firstName.value || !lastName.value) return 'U'
  return firstName.value.charAt(0).toUpperCase() + lastName.value.charAt(0).toUpperCase()
})

/* ============================================================
    🚀 NAV ITEMS COMPLETOS CON ICONOS ACTUALIZADOS (NUEVOS)
   ============================================================ */
const navItems = computed(() => {
  const isAdmin =
    role.value === 'ETAPA PRODUCTIVA VIRTUAL' ||
    role.value === 'ETAPA PRODUCTIVA PRESENCIAL' ||
    role.value === 'ADMINISTRADOR'

  const isInstructor =
    (Array.isArray(role.value) && role.value[0] === 'INSTRUCTOR') ||
    role.value === 'INSTRUCTOR'

  const isAprendiz = role.value === 'APRENDIZ'

  /* --- ADMIN --- */
  if (isAdmin) {
    return [
      { label: 'Inicio', icon: 'home', to: '/app/inicio' },
      { label: 'Empresas', icon: 'business', to: '/app/admin/empresas' },
      { label: 'Instructores', icon: 'school', to: '/app/admin/instructores' },
      { label: 'Aprendices y documentos', icon: 'ballot', to: '/app/admin/fichas' },
      { label: 'Parámetros', icon: 'tune', to: '/app/admin/parametros' },
      { label: 'Reportes', icon: 'analytics', to: '/app/admin/reportes' },
      { label: 'Novedades', icon: 'notifications_active', to: '/app/admin/novedadesAdmin' },
      { label: 'Registros EP', icon: 'fact_check', to: '/app/admin/Registration' },
      { label: 'Logs', icon: 'history', to: '/app/admin/logs' },
      { label: 'Estadísticas', icon: 'bar_chart', to: '/app/admin/AdminStatisctic' }
    ]
  }

  /* --- INSTRUCTOR --- */
  if (isInstructor) {
    return [
      { label: 'Inicio', icon: 'home', to: '/app/inicio' },
      { label: 'Informe Personal', icon: 'badge', to: '/app/instructor/informepersonal' },
      { label: 'Seguimientos', icon: 'track_changes', to: '/app/instructor/seguimientos' },
      { label: 'Bitácoras', icon: 'menu_book', to: '/app/instructor/bitacoras' },
      { label: 'Proyectos asignados', icon: 'assignment_ind', to: '/app/instructor/AssignedApprentices' },
   
      { label: 'Mis Aprendices', icon: 'groups', to: '/app/instructor/GroupSearch' }
    ]
  }

  /* --- APRENDIZ --- */
  if (isAprendiz) {
    return [
      { label: 'Inicio', icon: 'home', to: '/app/aprendiz/inicio' },
      { label: 'Datos Personales', icon: 'person', to: '/app/aprendiz/datospersonales' },
      { label: 'Proyectos y actividades', icon: 'task_alt', to: '/app/aprendiz/bitacoras' },
      { label: 'Pre-registro', icon: 'assignment', to: '/app/aprendiz/misregistros' },
      { label: 'Registro', icon: 'how_to_reg', to: '/app/aprendiz/procesoep' }
    ]
  }

  return []
})

/* Navegar */
function go(to) {
  router.push(to)
  leftDrawerOpen.value = false
}

/* NOTIFICACIONES */
const showNotifications = ref(false)
const notificationList = ref([
  { id: 1, title: 'Bienvenida', description: 'Tu cuenta se configuró correctamente.', time: 'Hace 2 horas', read: false },
  { id: 2, title: 'Nuevo mensaje', description: 'Tienes un nuevo mensaje de Juan Pérez.', time: 'Hace 5 horas', read: false },
  { id: 3, title: 'Actualización', description: 'Se actualizó tu perfil correctamente.', time: 'Ayer', read: true }
])

const unreadCount = computed(() => {
  let count = 0
  let i = 0
  while (i < notificationList.value.length) {
    if (!notificationList.value[i].read) count++
    i++
  }
  return count
})

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
}

function markAsRead(note) {
  note.read = true
}

function markAllAsRead() {
  let i = 0
  while (i < notificationList.value.length) {
    notificationList.value[i].read = true
    i++
  }
  notifications.success('Todas las notificaciones marcadas como leídas')
}

function deleteNotification(id) {
  let idx = -1
  let i = 0
  while (i < notificationList.value.length && idx === -1) {
    if (notificationList.value[i].id === id) idx = i
    i++
  }
  if (idx !== -1) {
    notificationList.value.splice(idx, 1)
    notifications.info('Notificación eliminada')
  }
}

function clearAll() {
  notificationList.value = []
  notifications.info('Notificaciones limpiadas')
}

function openAll() {
  router.push('/vista')
}

/* Carga de datos del usuario */
onMounted(() => {
  const Auth = JSON.parse(localStorage.getItem("auth"))

  if (Auth.user) {
    if (Auth.user.firstName && Auth.user.lastName) {
      firstName.value = Auth.user.firstName
      lastName.value = Auth.user.lastName
    } else if (Auth.user.name) {
      const Names = Auth.user.name.split(" ")
      firstName.value = Names[0]
      lastName.value = Names[1] || ''
    } else {
      // Para aprendices que no tienen name, firstName, ni lastName
      firstName.value = 'Usuario'
      lastName.value = 'Aprendiz'
    }

    // Manejar tanto el formato antiguo (string) como el nuevo (objeto)
    let userRole = Auth.user.role
    if (typeof userRole === 'object' && userRole.name) {
      role.value = userRole.name
    } else {
      role.value = userRole || 'APRENDIZ'
    }

    if (role.value == "INSTRUCTOR OWNER" || role.value == 'INSTRUCTOR') {
      role.value = role.value.split(" ")
    }
  }
})

/* Cerrar sesión */
const logout = () => {
  try {
    authStore.clearAuth()
    notifications.success('Sesión cerrada correctamente')
    showMorph.value = false
    router.push('/')
  } catch (error) {
    notifications.error('Error al cerrar sesión')
  }
}
</script>


<style scoped>
.q-layout,
.q-page-container {
  overflow: hidden;
}

/* HEADER RESPONSIVE - LOGO SIN MODIFICACIONES */
.custom-header {
  background-color: var(--color-primary) !important;
  height: 90px !important;
  min-height: 90px !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 2000 !important;
  width: 100% !important;
}

.header-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 90px !important;
  min-height: 90px !important;
  padding: 0 32px;
  flex-wrap: wrap;
  box-sizing: border-box;
}

/* LOGO DEL SENA SIN MODIFICACIONES - MANTIENE TAMAÑO ORIGINAL */
.header-avatar {
  position: static;
  margin-right: 16px;
  width: 90px !important;
  height: 90px !important;
  flex-shrink: 0;
}

.header-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* SOLO EL TÍTULO ES RESPONSIVE */
.header-title {
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: bold;
  line-height: 1.2;
  color: white;
  flex: 1;
  text-align: center;
  margin: 0 16px;
}

.header-action-btn {
  position: static;
  flex-shrink: 0;
}

/* MORPH CARD RESPONSIVE */
.morph-float-card {
  position: fixed;
  top: 90px;
  right: 32px;
  z-index: 9999;
}

.morph-card {
  width: 320px;
  border-radius: 1.5em;
  background-color: var(--color-primary) !important;
}

/* PAGE CONTAINER */
.page-container {
  max-width: 100% !important;
  padding-top: 90px !important;
  min-height: calc(100vh - 120px);
}

/* NOTIFICATIONS RESPONSIVE */
.notification-container {
  position: fixed;
  right: 16px;
  bottom: calc(var(--app-footer-height, 56px) + 16px);
  z-index: 14000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

.notification-container>.q-card,
.notification-container>.q-btn {
  pointer-events: auto;
}

.notification-panel {
  margin-bottom: 12px;
  width: 360px;
  max-width: calc(100vw - 32px);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  color: #222;
  z-index: 15000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.notification-scroll-area {
  height: 260px;
  max-height: 40vh;
}

.note-thumb {
  width: 44px;
  height: 44px;
  background-color: #eee;
  background-size: cover;
  background-position: center;
  border-radius: 6px;
  /* Usar ruta relativa para que Vite incluya la imagen en el build */
  background-image: url('../assets/logo-sena.png');
}

.notifications-btn {
  margin: 0;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

/* FOOTER */
.custom-footer {
  background-color: #f5f5f5;
  color: #333;
  text-align: center;
  padding: 0;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

.footer-text {
  font-size: clamp(0.7rem, 2vw, 0.9rem);
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 8px;
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* FLECHA DE CIERRE SOLO PARA RESPONSIVIDAD */
.drawer-close-arrow {
  /* Por defecto OCULTO en desktop */
  display: none;
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3000;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.drawer-close-arrow:hover {
  background: var(--color-primary-hover);
  transform: scale(1.1);
}

.drawer-close-arrow .q-icon {
  font-size: 20px;
}

/* MEDIA QUERIES */
@media (max-width: 1024px) {
  .header-container {
    padding: 0 24px;
  }
  
  .header-title {
    font-size: clamp(1.6rem, 3.5vw, 2.5rem);
  }
  
  .morph-float-card {
    right: 24px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    justify-content: space-between;
  }
  
  .header-title {
    font-size: 1.8rem;
    margin: 0 12px;
    text-align: center;
  }
  
  .header-avatar {
    width: 80px !important;
    height: 80px !important;
    margin-right: 12px;
  }
  
  
  .morph-float-card {
    top: 80px;
    right: 16px;
  }
  
  .morph-card {
    width: 280px;
  }
  
  .notification-container {
    right: 12px;
    bottom: calc(var(--app-footer-height, 50px) + 12px);
  }
  
  .notification-panel {
    width: 320px;
  }
  
  /* Mostrar flecha de cierre SOLO en tablets y móviles */
  .drawer-close-arrow {
    display: flex;
  }
}

@media (max-width: 480px) {
  .custom-header {
    height: 70px !important;
    min-height: 70px !important;
  }
  
  .header-container {
    padding: 0 12px;
    height: 70px !important;
    min-height: 70px !important;
  }
  
  .page-container {
    padding-top: 70px !important;
  }
  
  .header-title {
    font-size: 1.5rem;
    margin: 0 8px;
  }
  
  .header-avatar {
    width: 70px !important;
    height: 70px !important;
    margin-right: 8px;
  }
  
  
  .morph-float-card {
    top: 75px;
    right: 12px;
  }
  
  .morph-card {
    width: 260px;
  }
  
  .notification-panel {
    width: 280px;
  }
  
  .notification-scroll-area {
    height: 220px;
  }
  
  .drawer-close-arrow {
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
  }
  
  .drawer-close-arrow .q-icon {
    font-size: 18px;
  }
}

@media (max-width: 360px) {
  .header-container {
    padding: 0 8px;
  }
  
  .header-title {
    font-size: 1.3rem;
  }
  
  .header-avatar {
    width: 60px !important;
    height: 60px !important;
  }
  
  .morph-card {
    width: 240px;
  }
  
  .notification-panel {
    width: 260px;
  }
  
  .drawer-close-arrow {
    top: 10px;
    right: 10px;
    width: 26px;
    height: 26px;
  }
}

@media (max-width: 300px) {
  .custom-header {
    height: 60px !important;
    min-height: 60px !important;
  }
  
  .header-container {
    padding: 0 6px;
    height: 60px !important;
    min-height: 60px !important;
  }
  
  .page-container {
    padding-top: 60px !important;
  }
  
  .header-title {
    font-size: clamp(1rem, 5vw, 1.2rem);
    margin: 0 4px;
    word-break: break-word;
    line-height: 1.2;
  }
  
  .header-avatar {
    width: 50px !important;
    height: 50px !important;
    margin-right: 6px;
  }
  
  .morph-float-card {
    top: 70px;
    right: 8px;
  }
  
  .morph-card {
    width: calc(100vw - 16px);
    max-width: 220px;
  }
  
  .notification-container {
    right: 8px;
    bottom: calc(var(--app-footer-height, 45px) + 8px);
  }
  
  .notification-panel {
    width: calc(100vw - 16px);
    max-width: 240px;
  }
  
  .notification-scroll-area {
    height: 180px;
  }
  
  .footer-text {
    font-size: clamp(0.65rem, 3.5vw, 0.75rem);
    padding: 6px;
  }
  
  /* Drawer responsive para 300px */
  :deep(.q-drawer) {
    width: calc(100vw - 20px) !important;
    max-width: 260px;
  }
  
  .drawer-header-enhanced {
    padding: 16px 12px;
  }
  
  .drawer-logo-circle {
    width: 55px !important;
    height: 55px !important;
  }
  
  .drawer-text-line-1 {
    font-size: clamp(0.9rem, 4.5vw, 1rem);
    line-height: 1.1;
  }
  
  .drawer-text-line-2 {
    font-size: clamp(0.75rem, 4vw, 0.85rem);
    line-height: 1.1;
  }
  
  .drawer-text-line-3 {
    font-size: clamp(0.75rem, 4vw, 0.85rem);
    line-height: 1.1;
  }
  
  .drawer-menu-item {
    padding: 10px 12px;
    margin: 3px 0;
  }
  
  .drawer-menu-icon-bg {
    width: 36px;
    height: 36px;
  }
  
  .drawer-menu-icon {
    font-size: 20px;
  }
  
  .drawer-menu-label {
    font-size: clamp(0.85rem, 4vw, 0.9rem);
  }
  
  .drawer-menu-arrow {
    font-size: 16px;
  }
  
  .drawer-close-arrow {
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
  }
  
  .drawer-close-arrow .q-icon {
    font-size: 16px;
  }
}

/* Z-INDEX MANAGEMENT */
.q-footer {
  z-index: 1000;
}

/* DRAWER ENHANCED - DISEÑO MEJORADO */
.drawer-content {
  background: linear-gradient(to bottom, var(--color-bg-gradient-start) 0%, var(--color-bg-gradient-end) 100%);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
}

/* Header del Drawer Mejorado - Estilo como la imagen */
.drawer-header-enhanced {
  background: var(--color-primary);
  padding: 24px 20px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.drawer-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Logo circular blanco con imagen SENA */
.drawer-logo-circle {
  width: 70px !important;
  height: 70px !important;
  background: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-logo-circle img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Texto del header */
.drawer-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-text-line-1 {
  font-size: 1.1rem;
  font-weight: 900;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.drawer-text-line-2 {
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  line-height: 1.2;
}

.drawer-text-line-3 {
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  line-height: 1.2;
}

.drawer-separator-enhanced {
  height: 3px;
  background: var(--gradient-primary);
  margin: 0;
  box-shadow: 0 1px 3px var(--shadow-primary-medium);
}

/* Scroll Area */
.drawer-scroll-area {
  height: calc(100vh - 180px);
}

/* Overlay del drawer */
:deep(.q-drawer__overlay) {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 2000;
}

/* Lista del Menú Mejorada */
.drawer-menu-list {
  padding: 12px 8px;
}

.drawer-menu-item {
  margin: 4px 0;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.drawer-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: var(--gradient-primary-vertical);
  transform: scaleY(0);
  transition: transform 0.3s ease;
  border-radius: 0 4px 4px 0;
}

.drawer-menu-item:hover::before,
.drawer-menu-item-active::before {
  transform: scaleY(1);
}

.drawer-menu-item:hover {
  background: linear-gradient(to right, var(--color-bg-hover), var(--color-bg-hover-light));
  transform: translateX(4px);
  box-shadow: 0 2px 8px var(--shadow-primary);
}

.drawer-menu-item-active {
  background: linear-gradient(to right, var(--color-bg-active), var(--color-bg-active-light));
  box-shadow: 0 2px 12px var(--shadow-primary-medium);
}

.drawer-menu-item-active .drawer-menu-icon-bg {
  background: var(--gradient-primary-diagonal);
  box-shadow: 0 4px 12px var(--shadow-primary-strong);
}

.drawer-menu-item-active .drawer-menu-icon {
  color: white !important;
}

.drawer-menu-item-active .drawer-menu-label {
  color: var(--color-primary);
  font-weight: 600;
}

.drawer-menu-item-active .drawer-menu-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

/* Icono del Menú */
.drawer-menu-icon-wrapper {
  min-width: 48px !important;
}

.drawer-menu-icon-bg {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-icon);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.drawer-menu-item:hover .drawer-menu-icon-bg {
  background: linear-gradient(135deg, #e8f5e8, #d8eed8);
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(57, 169, 0, 0.2);
}

.drawer-menu-icon {
  font-size: 22px;
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.drawer-menu-item:hover .drawer-menu-icon {
  transform: scale(1.1);
  color: #2d8a00;
}

/* Label del Menú */
.drawer-menu-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #2d3748;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.drawer-menu-item:hover .drawer-menu-label {
  color: var(--color-primary);
  font-weight: 600;
}

/* Flecha del Menú */
.drawer-menu-arrow {
  font-size: 18px;
  color: #cbd5e0;
  transition: all 0.3s ease;
}

.drawer-menu-item:hover .drawer-menu-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}
</style>