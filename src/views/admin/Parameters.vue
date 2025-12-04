<template>
  <q-page class="q-pa-md parameters-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Parámetros" description="Configura parámetros globales y ajustes del sistema" />
          </q-card-section>
        </q-card>

        <div class="container">
          <div class="parameters-grid">
            <MenuCard
              v-for="parameter in parameterCards"
              :key="parameter.route"
              :title="parameter.title"
              :subtitle="parameter.subtitle"
              :img-src="parameter.imgSrc"
              :route="parameter.route"
              :color="parameter.color"
              :text-color="parameter.textColor"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import MenuCard from 'src/components/cards/MenuCard.vue'

// Importar imágenes desde assets para que Vite las procese
import horasInstructorImg from 'src/assets/Horas_Instructor.jpg'
import alertasImg from 'src/assets/Alertas.jpg'
import almacenamientoImg from 'src/assets/Almacenamiento.jpg'
import plantillasImg from 'src/assets/Plantillas_Negro.jpg'

// State
const parameterCards = ref([
  {
    title: 'ACADEMICO',
    subtitle: 'Configura y visualiza las horas asignadas por ficha o programa.',
    imgSrc: horasInstructorImg,
    route: '/app/admin/horasintructores',
    color: 'var(--color-primary)',
    textColor: 'white'
  },
  {
    title: 'ALERTAS',
    subtitle: 'Define tiempos y condiciones para alertas automáticas del sistema.',
    imgSrc: alertasImg,
    route: '/app/admin/alertas',
    color: 'var(--color-primary)',
    textColor: 'white'
  },
  {
    title: 'ALMACENAMIENTO',
    subtitle: 'Administra el espacio y rutas de almacenamiento en onedrive.',
    imgSrc: almacenamientoImg,
    route: '/app/admin/almacenamiento',
    color: 'var(--color-primary)',
    textColor: 'white'
  },
  {
    title: 'BITACORAS',
    subtitle: 'Ajusta número, frecuencia y validaciones de bitácoras por etapa.',
    imgSrc: plantillasImg,
    route: '/app/admin/plantillas',
    color: 'var(--color-primary)',
    textColor: 'white'
  }
])
</script>

<style lang="sass" scoped>
.parameters-page
  background: #f5f7fb
  min-height: 100vh

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.container
  max-width: 800px
  margin: 0 auto
  display: flex
  justify-content: center

.parameters-grid
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))
  gap: 2rem
  width: 100%
  max-width: 800px
  padding: 20px 0

@media (max-width: 768px)
  .reports-grid
    grid-template-columns: 1fr
    gap: 1.5rem
    padding: 16px 0

@media (max-width: 480px)
  .reports-grid
    gap: 1.25rem
    padding: 12px 0

@media (max-width: 300px)
  .reports-grid
    gap: 1rem
    padding: 10px 0
</style>
