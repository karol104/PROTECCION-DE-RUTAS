<template>
  <q-page class="q-pa-md news-page">
    <div class="q-mb-lg">
      <BackButton />
    </div>

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-lg">
          <q-card-section>
            <PageHeader title="Registro" description="Sistema de gestión de usuarios, validación documental y control de aprendices"/>
          </q-card-section>
        </q-card>

        <div class="registration-container">
          <Card
            title="Pre-registros"
            subtitle="Procesamiento de solicitudes de registro preliminar"
            :imgSrc="Preregistro"
            route="pre-registrations"
            color="var(--color-primary)"
            textColor="white" 
          />
          
          <Card
            title="Validacion de Documentos"
            subtitle="Verificación y aprobación de documentación oficial"
            :imgSrc="ValidacionDocumentos"
            route="document-validation"
            color="var(--color-primary)"
            textColor="white" 
          />
    
          <Card
            title="Registros"
            subtitle="Administración de aprendices activos."
            :imgSrc="Registro"
            route="registrations"
            color="var(--color-primary)"
            textColor="white" 
          />
        </div>
      </div>
    </div>
  </q-page>
</template>
  
<script setup>
  import Card from 'src/components/cards/MenuCard.vue';
  import Registro from 'src/assets/Registro.jpg';
  import Preregistro from 'src/assets/Preregistro.jpg';
  import ValidacionDocumentos from 'src/assets/ValidacionDocumentos.jpg';
  import BackButton from 'src/components/BackButton.vue'
  import PageHeader from 'src/components/PageHeader.vue'
import { fabBuromobelexperte } from '@quasar/extras/fontawesome-v5';
  </script>
  
  <style scoped>
.news-page {
  background: #f5f7fb;
  min-height: 100vh;
}

.hero-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%);
  margin-bottom: 20px;
}

.registration-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .registration-container {
    flex-direction: column;
    align-items: center;
  }
}
  </style>