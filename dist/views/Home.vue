<template>
  <q-page-container style="margin-top: 5px;">
    <div class="center">
      <div class="grid">
        <!-- Cards para ETAPA PRODUCTIVA VIRTUAL/PRESENCIAL -->
        <Card
          v-if="role === 'ETAPA PRODUCTIVA VIRTUAL' || role === 'ETAPA PRODUCTIVA PRESENCIAL'"
          title="SGVA" 
          subtitle="Importa y gestiona empresas desde SGVA o formulario individual." 
    :imgSrc="pymeImg"
          route="admin/empresas" 
          color="var(--color-primary)" 
          textColor="white" />


  

        <Card
          v-if="role === 'ETAPA PRODUCTIVA VIRTUAL' || role === 'ETAPA PRODUCTIVA PRESENCIAL'"
          title="Instructores" 
          subtitle="Consulta y administra instructores por área, estado y disponibilidad." 
          :imgSrc="monitoriaImg"
          route="admin/instructores" 
          color="var(--color-primary)" 
          textColor="white" />
        <Card
          v-if="role === 'ETAPA PRODUCTIVA VIRTUAL' || role === 'ETAPA PRODUCTIVA PRESENCIAL'"
          title="Aprendices y Documentos" 
          subtitle="Visualiza aprendices y valida documentos de etapa productiva." 
          :imgSrc="aprendicesNegroImg" 
          route="/app/admin/fichas"
          color="var(--color-primary)" 
          textColor="white" />
        <Card
          v-if="role === 'ETAPA PRODUCTIVA VIRTUAL' || role === 'ETAPA PRODUCTIVA PRESENCIAL'"
          title="Parametros" 
          subtitle="Configura horas, bitácoras, seguimientos y alertas del sistema." 
          :imgSrc="pasantiaImg" 
          route="/app/admin/parametros"
          color="var(--color-primary)" 
          textColor="white" />
        <Card
          v-if="role === 'ETAPA PRODUCTIVA VIRTUAL' || role === 'ETAPA PRODUCTIVA PRESENCIAL'"
          title="Reportes" 
          subtitle="Genera reportes por año, modalidad, empresa o instructor." 
          :imgSrc="documentosNegroImg" 
          route="/app/admin/reportes"
          color="var(--color-primary)" 
          textColor="white" />

        <!-- Card para ADMINISTRADOR -->
        <Card 
          v-if="role === 'ETAPA PRODUCTIVA VIRTUAL' || role === 'ETAPA PRODUCTIVA PRESENCIAL' || role === 'ADMINISTRADOR'" 
          title="Novedades Admin"
          subtitle="Registra y consulta novedades administrativas del proceso." 
          :imgSrc="verdocumentoImg" 
          route="admin/novedadesAdmin" 
          color="var(--color-primary)"
          textColor="white" />
        
        <!-- Card para ADMINISTRADOR - Modalidades EP -->
        <Card 
          v-if="role === 'ETAPA PRODUCTIVA VIRTUAL' || role === 'ETAPA PRODUCTIVA PRESENCIAL' || role === 'ADMINISTRADOR'" 
          title="Modalidades EP"
          subtitle="Gestiona modalidades de etapa productiva y sus requisitos." 
          :imgSrc="modalidadnegroImg" 
          route="admin/modalidadesEP" 
          color="var(--color-primary)"
          textColor="white" />
        
        <!-- Card para ADMINISTRADOR - Registros EP -->
        <Card 
          v-if="role === 'ETAPA PRODUCTIVA VIRTUAL' || role === 'ETAPA PRODUCTIVA PRESENCIAL' || role === 'ADMINISTRADOR'" 
          title="Registros EP"
          subtitle="Valida registros y documentos de etapa productiva de aprendices." 
          :imgSrc="contratoImg" 
          route="admin/Registration" 
          color="var(--color-primary)"
          textColor="white" />
        
        <Card 
          v-if="role === 'ETAPA PRODUCTIVA VIRTUAL' || role === 'ETAPA PRODUCTIVA PRESENCIAL' || role === 'ADMINISTRADOR'" 
          title="LOGS"
          subtitle="Gestiona y revisa los registros de actividad del sistema." 
          :imgSrc="almacenamientoImg" 
          route="admin/logs" 
          color="var(--color-primary)"
          textColor="white" />

        <Card 
          v-if="role === 'ETAPA PRODUCTIVA VIRTUAL' || role === 'ETAPA PRODUCTIVA PRESENCIAL' || role === 'ADMINISTRADOR'" 
          title="Estadísticas"
          subtitle="Visualiza estadísticas y análisis de datos del sistema." 
          :imgSrc="plantillasnegroImg" 
          route="admin/AdminStatisctic" 
          color="var(--color-primary)"
          textColor="white" />
        <!-- Cards para INSTRUCTOR -->
        <Card 
          v-if="role[0] === 'INSTRUCTOR'" 
          title="Informe Personal" 
          subtitle="Consulta tu información y control de horas asignadas."
          :imgSrc="infoPersonalImg" 
          route="instructor/informepersonal" 
          color="var(--color-primary)" 
          textColor="white" />
        <Card 
          v-if="role[0] === 'INSTRUCTOR'" 
          title="Seguimientos" 
          subtitle="Registra y gestiona los seguimientos de aprendices."
          :imgSrc="subirDocsImg" 
          route="instructor/seguimientos" 
          color="var(--color-primary)" 
          textColor="white" />
        <Card 
          v-if="role[0] === 'INSTRUCTOR'" 
          title="Bitácoras" 
          subtitle="Valida y revisa las bitácoras cargadas por los aprendices."
          :imgSrc="documentosNegroImg" 
          route="/vista" 
          color="var(--color-primary)" 
          textColor="white" />
        <Card 
          v-if="role[0] === 'INSTRUCTOR'" 
          title="Proyectos Asignados" 
          subtitle="Visualiza los aprendices asignados y su estado actual."
          :imgSrc="aprendicesNegroImg" 
          route="instructor/AssignedApprentices" 
          color="var(--color-primary)" 
          textColor="white" />
        <Card 
          v-if="role[0] === 'INSTRUCTOR'" 
          title="Historial" 
          subtitle="Consulta tus actividades, seguimientos y registros previos."
          :imgSrc="historialNegroImg" 
          route="/vista" 
          color="var(--color-primary)" 
          textColor="white" />
        <Card 
          v-if="role[0] === 'INSTRUCTOR'" 
          title="Novedades" 
          subtitle="Registra y consulta novedades o procesos disciplinarios."
          :imgSrc="proyectoProductivoImg" 
          route="instructor/novedades" 
          color="var(--color-primary)" 
          textColor="white" />

        <!-- Card para OWNER -->
        <Card 
          v-if="role[1] === 'OWNER'" 
          title="Aprendices" 
          subtitle="Consultar y crear aprendices."
          :imgSrc="pymeImg" 
          route="instructor/MyApprentices" 
          color="var(--color-primary)" 
          textColor="white" />
      </div>
    </div>
  </q-page-container>
</template>

<script setup>
import Card from 'src/components/cards/MenuCard.vue';
import { ref, onMounted } from 'vue'

// Importar imágenes para Vite
import monitoriaImg from 'src/assets/Monitoria.jpg'
import pasantiaImg from 'src/assets/Pasantia_ONG.jpg'
import pymeImg from 'src/assets/pyme.jpg'
import contratoImg from 'src/assets/Contrato_Aprendizaje.jpg'
import infoPersonalImg from 'src/assets/Información_personal.jpg'
import subirDocsImg from 'src/assets/SubirDocumentos_negro.jpg'
import documentosNegroImg from 'src/assets/Documentos_negro.jpg'
import aprendicesNegroImg from 'src/assets/Aprendices_negro.jpg'
import historialNegroImg from 'src/assets/Historial_negro.jpg'
import proyectoProductivoImg from 'src/assets/Proyecto_Productivo.jpg'
import verdocumentoImg from 'src/assets/VerDocumentos_negro.jpg'
import modalidadnegroImg from 'src/assets/Modalidadnegro.jpg'
import almacenamientoImg from 'src/assets/Almacenamiento.jpg'
import plantillasnegroImg from "src/assets/Plantillas_Negro.jpg"

const role = ref('')
onMounted(() => {
  const Auth = JSON.parse(localStorage.getItem("auth"))
  if (Auth.user) {
    role.value = Auth.user.role
    if(role.value == "INSTRUCTOR OWNER" || role.value == 'INSTRUCTOR'){
      role.value = role.value.split(" ")
    }
  }})
</script>



<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  padding: 20px;
  justify-items: center;
  align-items: stretch; /* Cambiado de center a stretch */
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 15px;
  box-sizing: border-box;
}

/* Asegurar que las cards mantengan su estructura */
:deep(.q-card) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.q-card__section:last-child) {
  margin-top: auto;
  flex-shrink: 0;
}

/* Centrar imágenes en las cards */
:deep(.q-card img) {
  object-fit: cover;
  object-position: center;
}

/* Media queries para diferentes tamaños de pantalla */
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    padding: 18px;
  }
  .center {
    padding: 18px 15px;
  }
  .header-title[data-v-22686b16] {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 16px;
  }
  .center {
    padding: 16px 12px;
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 18px;
    max-width: 400px;
    padding: 14px;
  }
  
  .center {
    padding: 14px 10px;
  }
  .header-title[data-v-22686b16] {
    font-size: 1rem;
    font-weight: bold;
    line-height: 80px;
    color: white;
  }
}

@media (max-width: 480px) {
  .grid {
    gap: 16px;
    padding: 12px;
  }
  
  .center {
    padding: 12px 8px;
  }
}

@media (max-width: 300px) {
  .grid {
    gap: 14px;
    padding: 10px;
  }
  
  .center {
    padding: 10px 6px;
  }
}
</style>