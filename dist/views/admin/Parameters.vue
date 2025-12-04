<template>
  <q-page class="q-pa-md parameters-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Parámetros" description="Configura parámetros globales y ajustes del sistema." />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="container">
      <div class="cards-grid">
        <MenuCard
          v-for="card in parameterCards"
          :key="card.route"
          :title="card.title"
          :subtitle="card.subtitle"
          :img-src="card.imgSrc"
          :route="card.route"
          :color="card.color"
          :text-color="card.textColor"
        />
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
import horasInstructorImg from '../../assets/Horas_Instructor.jpg'
import alertasImg from '../../assets/Alertas.jpg'
import almacenamientoImg from '../../assets/Almacenamiento.jpg'
import seguridadImg from '../../assets/Seguridad.jpg'
import plantillasImg from '../../assets/Plantillas_Negro.jpg'

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
    title: 'SEGURIDAD',
    subtitle: 'Controla contraseñas, permisos y autenticación de usuarios.',
  imgSrc: seguridadImg,
    route: '/app/admin/seguridad',
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
  max-width: 1400px
  margin: 0 auto
  display: flex
  justify-content: center
  align-items: flex-start
  width: 100%
  margin-top: 20px

.cards-grid
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))
  gap: 24px
  width: 100%
  padding: 0
  justify-items: center
  align-items: stretch

@media (max-width: 1200px)
  .cards-grid
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))
    gap: 20px

@media (max-width: 768px)
  .cards-grid
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))
    gap: 16px

@media (max-width: 640px)
  .cards-grid
    grid-template-columns: 1fr
    gap: 12px
    max-width: 500px

@media (min-width: 1600px)
  .cards-grid
    grid-template-columns: repeat(4, 1fr)
    max-width: 1600px

:deep(.menu-card)
  height: 100%
  min-height: 200px
  transition: transform 0.2s ease, box-shadow 0.2s ease

:deep(.menu-card):hover
  transform: translateY(-2px)
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)


:deep(.menu-card .q-card)
  display: flex !important
  flex-direction: column !important
  position: relative !important

:deep(.q-card__section--vert)
  position: absolute !important
  bottom: 0 !important
  left: 0 !important
  right: 0 !important
  width: 100% !important
  flex: none !important
  transform: none !important
  margin: 0 !important

:deep(.menu-card .q-card__section:first-child)
  flex-grow: 1
  margin-bottom: 60px
  display: flex !important
  flex-direction: column !important
  justify-content: flex-start !important
  padding: 16px !important


:deep(.menu-card .q-img)
  height: 80px !important
  display: flex !important
  align-items: center !important
  justify-content: center !important
  margin: 0 auto !important

:deep(.menu-card .q-img__container)
  height: 100% !important
  display: flex !important
  align-items: center !important
  justify-content: center !important

:deep(.menu-card .q-img__content)
  display: flex !important
  align-items: center !important
  justify-content: center !important
  height: 100% !important

:deep(.menu-card img)
  object-fit: contain !important
  max-height: 70px !important
  width: auto !important
  margin: 0 auto !important


:deep(.menu-card .q-item)
  padding: 0 !important
  min-height: auto !important
  margin: 0 !important

:deep(.menu-card .q-item__section--main)
  padding: 0 !important
  margin: 0 !important

:deep(.menu-card .q-item-label)
  margin-top: 0 !important
  line-height: 1.3 !important

:deep(.menu-card .q-item-label h6)
  margin-top: 4px !important
  margin-bottom: 2px !important

:deep(.menu-card .q-item-label .text-caption)
  margin-top: 0 !important
  line-height: 1.2 !important


@media (max-width: 300px)
  :deep(.my-card[data-v-9a1b77e9])
    height: 235px !important
    max-width: 350px
    box-sizing: border-box
    transition: transform 0.2s, box-shadow 0.2s
    cursor: pointer

@media (max-width: 640px)
  :deep(.menu-card .q-img)
    height: 70px !important
  
  :deep(.menu-card img)
    max-height: 60px !important
  
  :deep(.menu-card .q-card__section:first-child)
    padding: 12px !important
  
  :deep(.menu-card .q-item-label h6)
    margin-top: 2px !important
    margin-bottom: 1px !important
  
  :deep(.menu-card .q-item-label .text-caption)
    font-size: 0.8em !important
    line-height: 1.1 !important
</style>