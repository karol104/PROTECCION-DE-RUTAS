import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import MainLayout from '../layouts/MainLayout.vue'

// Main views
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Unauthorized from '../views/Unauthorized.vue'
import NotFound from '../views/NotFound.vue'

// Admin views
import Companies from '../views/admin/Companies.vue'
import Instructors from '../views/admin/Instructors.vue'
import Apprentices from '../views/admin/Apprentices.vue'
import Documents from '../views/admin/Documents.vue'
import Groups from '../views/admin/Groups.vue'
import Parameters from '../views/admin/Parameters.vue'
import Reports from '../views/admin/Reports.vue'
import Registration from '../views/admin/registration-process.vue'
import PreRegistrations from '../views/admin/registration-process/pre-registrations.vue'
import DocumentValidation from '../views/admin/registration-process/document-validation.vue'
import RegistrationView from '../views/admin/registration-process/Registration.vue'
import Modalities from '../views/admin/Modalities.vue'

import AdminNews from '../views/admin/AdminNews.vue'
import SearchGroup from '../views/admin/SearchGroup.vue'
import ApprenticeDocumentsDetail from '../views/admin/ApprenticeDocumentsDetail.vue'
import LogsAdmin from '../views/admin/logs.vue'
import Statistics from '../views/admin/Statistic.vue'

// Admin parameters
import Alerts from '../views/admin/parametros/Alerts.vue'
import Storage from '../views/admin/parametros/Storage.vue'
import InstructorHours from '../views/admin/parametros/InstructorHours.vue'
import Security from '../views/admin/parametros/Security.vue'
import Templates from '../views/admin/parametros/Templates.vue'

//Admin Statics
import AdminStatistic from '../views/admin/Statistic.vue'
import StatisticActivities from '../views/admin/StatisticFolder/ActivitiesStatistic.vue'
import StatisticFiches from '../views/admin/StatisticFolder/FichesStatistic.vue'
import StatisticPreRegistrations from '../views/admin/StatisticFolder/PreRegistrationsStatistic.vue'
import StatisticPrograms from '../views/admin/StatisticFolder/ProgramsStatistic.vue'
import StatisticProjects from '../views/admin/StatisticFolder/ProjectsStatistic.vue'
import StatisticTemporal from '../views/admin/StatisticFolder/TemporalStatistic.vue'



// Admin reports
import HoursByInstructor from '../views/admin/reportes/HoursByInstructor.vue'
import ReportByYear from '../views/admin/reportes/ReportByYear.vue'
import ReportByCompany from '../views/admin/reportes/ReportByCompany.vue'
import ReportByModality from '../views/admin/reportes/ReportByModality.vue'
import ReportByYearView from '../views/admin/reportes/ReportByYearView.vue'
import ReportByCompanyView from '../views/admin/reportes/ReportByCompanyView.vue'
import ReportByModalityView from '../views/admin/reportes/ReportByModalityView.vue'
import ReportByInstructorView from '../views/admin/reportes/ReportByInstructorView.vue'

// Instructor views
import InstructorLogbooks from '../views/instructor/Logbooks.vue'
import InstructorHistory from '../views/instructor/History.vue'
import PersonalReport from '../views/instructor/PersonalReport.vue'
import MyApprentices from '../views/instructor/MyApprentices.vue'
import InstructorNews from '../views/instructor/News.vue'
import Followups from '../views/instructor/Followups.vue'
import HoursView from '../views/instructor/HoursView.vue'
import AssignedApprentices from '../views/instructor/AssignedApprentices.vue' 
import GroupSearch from '../views/instructor/GroupSearch.vue'
import InstructorLogbooksDetails from '../views/instructor/LogbooksDetail.vue'

// Apprentice views
import ApprenticeHome from '../views/aprendiz/ApprenticeHome.vue'
import Logbooks from '../views/aprendiz/Logbooks.vue'
import PersonalData from '../views/aprendiz/PersonalData.vue'
import MyRegistrations from '../views/aprendiz/MyRegistrations.vue'
import ProductiveStageProcess from '../views/aprendiz/record.vue'
import ProductiveStageRegistration from '../views/aprendiz/PreRegistration.vue'
import ChangePassword from '../views/aprendiz/ChangePassword.vue'
import EnterPasswordCode from '../views/aprendiz/EnterPasswordCode.vue'
import NewPassword from '../views/aprendiz/NewPassword.vue'

const routes = [
  { path: '/', name: 'Login', component: Login, meta: { requiresAuth: false }},
  { path: '/unauthorized', name: 'Unauthorized', component: Unauthorized, meta: { requiresAuth: false } },
  { path: '/CambiarContrasena', name: 'ChangePassword', component: ChangePassword, meta: { requiresAuth: false }},
  { path: '/IngresarCodigoContrasena', name: 'EnterPasswordCode', component: EnterPasswordCode, meta: { requiresAuth: false }},
  { path: '/NuevaContrasena', name: 'NewPassword', component: NewPassword, meta: { requiresAuth: false }},
  {
    path: '/app',
    component: MainLayout,
    children: [
      { path: 'inicio', name: 'Home', component: Home, meta: { requiresAuth: true, roles: ['ADMINISTRADOR', 'INSTRUCTOR'] } },
      { path: 'aprendiz/inicio', name: 'ApprenticeHome', component: ApprenticeHome, meta: { requiresAuth: true, roles: ['APRENDIZ'] } },
      { path: 'aprendiz/registros', name: 'ApprenticeRegistrations', component: ProductiveStageRegistration, meta: { requiresAuth: true, roles: ['APRENDIZ'] }},
      { path: 'aprendiz/bitacoras', name: 'Logbooks', component: Logbooks, meta: { requiresAuth: true, roles: ['APRENDIZ'] }},
      { path: 'aprendiz/datospersonales', name: 'PersonalData', component: PersonalData, meta: { requiresAuth: true, roles: ['APRENDIZ'] }},
      { path: 'aprendiz/misregistros', name: 'MyRegistrations', component: MyRegistrations, meta: { requiresAuth: true, roles: ['APRENDIZ'] } },
      { path: 'aprendiz/procesoep', name: 'ProductiveStageProcess', component: ProductiveStageProcess, meta: { requiresAuth: true, roles: ['APRENDIZ'] }},
      { path: 'aprendiz/registroep', name: 'ProductiveStageRegistration', component: ProductiveStageRegistration, meta: { requiresAuth: true, roles: ['APRENDIZ'] }},
      { path: 'admin/empresas', name: 'Companies', component: Companies ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/instructores', name: 'Instructors', component: Instructors , meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/aprendices/:ficheId?', name: 'Apprentices', component: Apprentices , meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/documentos', name: 'Documents', component: Documents , meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/fichas', name: 'Groups', component: Groups , meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/parametros', name: 'Parameters', component: Parameters , meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/reportes', name: 'Reports', component: Reports , meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/modalidades', name: 'Modalities', component: Modalities, meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},

     
      { path: 'admin/novedadesAdmin', name: 'AdminNews', component: AdminNews , meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/buscar-ficha', name: 'SearchGroup', component: SearchGroup ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/documentos/:ficha/aprendiz/:aprendizId', name: 'ApprenticeDocumentsDetail', component: ApprenticeDocumentsDetail, meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/alertas', name: 'Alerts', component: Alerts, meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/almacenamiento', name: 'Storage', component: Storage , meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/horasintructores', name: 'InstructorHours', component: InstructorHours, meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/seguridad', name: 'Security', component: Security, meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/plantillas', name: 'Templates', component: Templates , meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/horasporinstructor', name: 'HoursByInstructor', component: HoursByInstructor ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/reporteporaño', name: 'ReportByYear', component: ReportByYear ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/reporteporempresa', name: 'ReportByCompany', component: ReportByCompany ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/reportepormodalidad', name: 'ReportByModality', component: ReportByModality ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/vistareporteporaño', name: 'ReportByYearView', component: ReportByYearView ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/vistareporteporempresa', name: 'ReportByCompanyView', component: ReportByCompanyView ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/vistareportepormodalidad', name: 'ReportByModalityView', component: ReportByModalityView ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/vistareporteporinstructor', name: 'ReportByInstructorView', component: ReportByInstructorView ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/AdminStatisctic', name: 'AdminStatistic', component: AdminStatistic ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/StatisticActivities', name: 'StatisticActivities', component: StatisticActivities ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/StatisticFiches', name: 'StatisticFiches', component: StatisticFiches,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/StatisticPreRegistrations', name: 'StatisticPreRegistrations', component: StatisticPreRegistrations,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/StatisticPrograms', name: 'StatisticPrograms', component: StatisticPrograms,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/StatisticProjects', name: 'StatisticProjects', component: StatisticProjects ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/StatisticTemporal', name: 'StatisticTemporal', component: StatisticTemporal,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/logs', name: 'LogsAdmin', component: LogsAdmin ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/statistics', name: 'Statistics', component: Statistics ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'instructor/bitacoras', name: 'InstructorLogbooks', component: InstructorLogbooks , meta: { requiresAuth: true, roles:['INSTRUCTOR'] }},
       { path: 'instructor/bitacorasdetalles', name: 'InstructorLogbooksDetails', component: InstructorLogbooksDetails ,meta: { requiresAuth: true, roles:['INSTRUCTOR'] }},
      { path: 'instructor/historial', name: 'InstructorHistory', component: InstructorHistory , meta: { requiresAuth: true, roles:['INSTRUCTOR'] }},
      { path: 'instructor/informepersonal', name: 'PersonalReport', component: PersonalReport , meta: { requiresAuth: true, roles:['INSTRUCTOR'] }},
      { path: 'instructor/MyApprentices', name: 'MyApprentices', component: MyApprentices,meta: { requiresAuth: true, roles:['INSTRUCTOR'] } },
      { path: 'instructor/AssignedApprentices', name: 'AssignedApprentices', component: AssignedApprentices, meta: { requiresAuth: true, roles:['INSTRUCTOR'] } },
      { path: 'instructor/GroupSearch', name: 'GroupSearch', component: GroupSearch , meta: { requiresAuth: true, roles:['INSTRUCTOR'] }},
      { path: 'instructor/novedades', name: 'InstructorNews', component: InstructorNews , meta: { requiresAuth: true, roles:['INSTRUCTOR'] }},
      { path: 'instructor/seguimientos', name: 'Followups', component: Followups, meta: { requiresAuth: true, roles:['INSTRUCTOR'] } },
      { path: 'instructor/vistahoras', name: 'HoursView', component: HoursView, meta: { requiresAuth: true, roles:['INSTRUCTOR'] } },
      { path: 'admin/Registration', name: 'Registration', component: Registration, meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/pre-registrations', name: 'PreRegistrations', component: PreRegistrations ,meta: { requiresAuth: true, roles:['ADMINISTRADOR'] } },
      { path: 'admin/document-validation', name: 'DocumentValidation', component: DocumentValidation , meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }},
      { path: 'admin/registrations', name: 'RegistrationView', component: RegistrationView , meta: { requiresAuth: true, roles:['ADMINISTRADOR'] }}
    ]
  },
  // Catch-all route for 404 Not Found
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  // Permitir acceso a rutas que no requieren autenticación
  if (!to.meta.requiresAuth) {
    next()
    return
  }
  
  // Verificar directamente en localStorage (más confiable que Pinia en navigation guards)
  const storedAuth = localStorage.getItem('auth')
  
  if (!storedAuth) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // Verificar roles si están especificados
  if (to.meta.roles && to.meta.roles.length > 0) {
    let userRole = null
    
    try {
      const parsedAuth = JSON.parse(storedAuth)
      userRole = parsedAuth.user?.role?.name || parsedAuth.user?.role
      
    } catch (e) {
      console.error('Error parsing stored auth:', e)
      next({ name: 'Login' })
      return
    }
    
    if (!userRole || !to.meta.roles.includes(userRole)) {
      next({ name: 'Unauthorized' })
      return
    }
  }
  next()
})


export default router