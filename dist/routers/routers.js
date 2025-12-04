import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

// Main views
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'

// Admin views
import Companies from '../views/admin/Companies.vue'
import Instructors from '../views/admin/Instructors.vue'
import Apprentices from '../views/admin/Apprentices.vue'
import Documents from '../views/admin/Documents.vue'
import Groups from '../views/admin/Groups.vue'
import Parameters from '../views/admin/Parameters.vue'
import Reports from '../views/admin/Reports.vue'
import Registration from '../views/admin/RegistrationPre-registration.vue'

import AdminNews from '../views/admin/AdminNews.vue'
import ProductiveStageModalities from '../views/admin/ProductiveStageModalities.vue'
import ProductiveStageRegistrations from '../views/admin/ProductiveStageRegistrations.vue'
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
import StatisticApprentices from '../views/admin/StatisticFolder/ApprenticesStatistic.vue'
import StatisticGeneral from '../views/admin/StatisticFolder/General.vue'
import StatisticHistory from '../views/admin/StatisticFolder/History.vue'
import StatisticInstructors from '../views/admin/StatisticFolder/Instructors.vue'



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

// Apprentice views
import ApprenticeHome from '../views/aprendiz/ApprenticeHome.vue'
import Logbooks from '../views/aprendiz/Logbooks.vue'
import PersonalData from '../views/aprendiz/PersonalData.vue'
import MyRegistrations from '../views/aprendiz/MyRegistrations.vue'
import ProductiveStageProcess from '../views/aprendiz/record.vue'
import ProductiveStageRegistration from '../views/aprendiz/preregistration.vue'
import ChangePassword from '../views/aprendiz/ChangePassword.vue'
import EnterPasswordCode from '../views/aprendiz/EnterPasswordCode.vue'
import NewPassword from '../views/aprendiz/NewPassword.vue'

// Productive Stage Modalities
import ApprenticeshipContract from '../views/aprendiz/modalidadesEP/ApprenticeshipContract.vue'
import SenaMonitoring from '../views/aprendiz/modalidadesEP/SenaMonitoring.vue'
import NgoEntityInternship from '../views/aprendiz/modalidadesEP/NgoEntityInternship.vue'
import SmeInternship from '../views/aprendiz/modalidadesEP/SmeInternship.vue'
import FamilyBusinessInternship from '../views/aprendiz/modalidadesEP/FamilyBusinessInternship.vue'
import ProductiveProject from '../views/aprendiz/modalidadesEP/ProductiveProject.vue'
import EmploymentContract from '../views/aprendiz/modalidadesEP/EmploymentContract.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/CambiarContrasena', name: 'ChangePassword', component: ChangePassword },
  { path: '/IngresarCodigoContrasena', name: 'EnterPasswordCode', component: EnterPasswordCode },
  { path: '/NuevaContrasena', name: 'NewPassword', component: NewPassword },
  {
    path: '/app',
    component: MainLayout,
    children: [
      { path: 'inicio', name: 'Home', component: Home },
      { path: 'aprendiz/inicio', name: 'ApprenticeHome', component: ApprenticeHome },
      { path: 'aprendiz/registros', name: 'ApprenticeRegistrations', component: ProductiveStageRegistration },
      { path: 'aprendiz/bitacoras', name: 'Logbooks', component: Logbooks },
      { path: 'aprendiz/datospersonales', name: 'PersonalData', component: PersonalData },
      { path: 'aprendiz/misregistros', name: 'MyRegistrations', component: MyRegistrations },
      { path: 'aprendiz/procesoep', name: 'ProductiveStageProcess', component: ProductiveStageProcess },
      { path: 'aprendiz/registroep', name: 'ProductiveStageRegistration', component: ProductiveStageRegistration },
      { path: 'aprendiz/modalidadesEP/contratodeaprendizaje', name: 'ApprenticeshipContract', component: ApprenticeshipContract },
      { path: 'aprendiz/modalidadesEP/monitoriasena', name: 'SenaMonitoring', component: SenaMonitoring },
      { path: 'aprendiz/modalidadesEP/pasantiaongentidad', name: 'NgoEntityInternship', component: NgoEntityInternship },
      { path: 'aprendiz/modalidadesEP/pasantiapyme', name: 'SmeInternship', component: SmeInternship },
      { path: 'aprendiz/modalidadesEP/pasantiaupfamiliar', name: 'FamilyBusinessInternship', component: FamilyBusinessInternship },
      { path: 'aprendiz/modalidadesEP/proyectoproductivo', name: 'ProductiveProject', component: ProductiveProject },
      { path: 'aprendiz/modalidadesEP/vinculolaboralcontractual', name: 'EmploymentContract', component: EmploymentContract },
      { path: 'admin/empresas', name: 'Companies', component: Companies },
      { path: 'admin/instructores', name: 'Instructors', component: Instructors },
      { path: 'admin/aprendices/:ficheId?', name: 'Apprentices', component: Apprentices },
      { path: 'admin/documentos', name: 'Documents', component: Documents },
      { path: 'admin/fichas', name: 'Groups', component: Groups },
      { path: 'admin/parametros', name: 'Parameters', component: Parameters },
      { path: 'admin/reportes', name: 'Reports', component: Reports },

     
      { path: 'admin/novedadesAdmin', name: 'AdminNews', component: AdminNews },
      { path: 'admin/modalidadesEP', name: 'ProductiveStageModalities', component: ProductiveStageModalities },
      { path: 'admin/registrosEP', name: 'ProductiveStageRegistrations', component: ProductiveStageRegistrations },
      { path: 'admin/buscar-ficha', name: 'SearchGroup', component: SearchGroup },
      { path: 'admin/documentos/:ficha/aprendiz/:aprendizId', name: 'ApprenticeDocumentsDetail', component: ApprenticeDocumentsDetail },
      { path: 'admin/alertas', name: 'Alerts', component: Alerts },
      { path: 'admin/almacenamiento', name: 'Storage', component: Storage },
      { path: 'admin/horasintructores', name: 'InstructorHours', component: InstructorHours },
      { path: 'admin/seguridad', name: 'Security', component: Security },
      { path: 'admin/plantillas', name: 'Templates', component: Templates },
      { path: 'admin/horasporinstructor', name: 'HoursByInstructor', component: HoursByInstructor },
      { path: 'admin/reporteporaño', name: 'ReportByYear', component: ReportByYear },
      { path: 'admin/reporteporempresa', name: 'ReportByCompany', component: ReportByCompany },
      { path: 'admin/reportepormodalidad', name: 'ReportByModality', component: ReportByModality },
      { path: 'admin/vistareporteporaño', name: 'ReportByYearView', component: ReportByYearView },
      { path: 'admin/vistareporteporempresa', name: 'ReportByCompanyView', component: ReportByCompanyView },
      { path: 'admin/vistareportepormodalidad', name: 'ReportByModalityView', component: ReportByModalityView },
      { path: 'admin/vistareporteporinstructor', name: 'ReportByInstructorView', component: ReportByInstructorView },
      { path: 'admin/AdminStatisctic', name: 'AdminStatistic', component: AdminStatistic },
      { path: 'admin/StatisticApprentices', name: 'StatisticApprentices', component: StatisticApprentices },
      { path: 'admin/StatisticGeneral', name: 'StatisticGeneral', component: StatisticGeneral },
      { path: 'admin/StatisticHistory', name: 'StatisticHistory', component: StatisticHistory },
      { path: 'admin/StatisticInstructors', name: 'StatisticInstructors', component: StatisticInstructors },
      { path: 'admin/logs', name: 'LogsAdmin', component: LogsAdmin },
      { path: 'admin/statistics', name: 'Statistics', component: Statistics },
      { path: 'instructor/bitacoras', name: 'InstructorLogbooks', component: InstructorLogbooks },
      { path: 'instructor/historial', name: 'InstructorHistory', component: InstructorHistory },
      { path: 'instructor/informepersonal', name: 'PersonalReport', component: PersonalReport },
      { path: 'instructor/MyApprentices', name: 'MyApprentices', component: MyApprentices },
      { path: 'instructor/AssignedApprentices', name: 'AssignedApprentices', component: AssignedApprentices },
      { path: 'instructor/novedades', name: 'InstructorNews', component: InstructorNews },
      { path: 'instructor/seguimientos', name: 'Followups', component: Followups },
      { path: 'instructor/vistahoras', name: 'HoursView', component: HoursView },
      { path: 'admin/Registration', name: 'Registration', component: Registration}
    ]
    
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router