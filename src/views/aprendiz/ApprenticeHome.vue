<template>
  <div class="center" style="margin-top: 80px;">
    <div class="grid">
      <Card
        title="Datos Personales"
        subtitle="Consulta y actualiza tu información de contacto."
          :imgSrc="infoPersonalImg"
        route="datospersonales"
        color="var(--color-primary)"
        textColor="white"
      />
      <Card
        title="Proyectos y Actividades"
        subtitle="Registra, adjunta tus bitácoras y documentos de etapa."
         :imgSrc="documentosNegroImg"
        route="bitacoras"
        color="var(--color-primary)"
        textColor="white"
      />
      <Card
        title=" Prerregistro EP"
        subtitle="Registra tu modalidad y empresa asignada."
  :imgSrc="modalidadnegroImg"
        route="registroep"
        color="var(--color-primary)"
        textColor="white"
      />
      <Card
        title="Registro EP"
        subtitle="Visualiza el avance y estado de tu etapa productiva."
         :imgSrc="avanceNegroImg"
        route="procesoep"
        color="var(--color-primary)"
        textColor="white"
      />

      
    </div>
  </div>
</template>

<script setup>
import Card from 'src/components/cards/MenuCard.vue'

// Importar imágenes desde assets
import infoPersonalImg from 'src/assets/Información_personal.jpg'
import documentosNegroImg from 'src/assets/Documentos_negro.jpg'
import modalidadnegroImg from 'src/assets/Modalidadnegro.jpg'
import avanceNegroImg from 'src/assets/Avance_negro.jpg'
</script>


<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  padding: 20px;
  justify-items: center;
  align-items: stretch;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100vw;
  padding-top: 70px;
  padding-bottom: 50px;
  overflow-y: auto;
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

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 24px;
    max-width: 500px;
    padding: 18px;
  }
  
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 100vw;
    padding-top: 70px;
    padding-bottom: 50px;
    overflow-y: auto;
  }
}

@media (max-width: 480px) {
  .grid {
    gap: 20px;
    padding: 16px;
  }
  
  .center {
    padding-top: 60px;
    padding-bottom: 40px;
  }
}

@media (max-width: 300px) {
  .grid {
    gap: 16px;
    padding: 14px;
  }
  
  .center {
    padding-top: 50px;
    padding-bottom: 30px;
  }
}
</style>