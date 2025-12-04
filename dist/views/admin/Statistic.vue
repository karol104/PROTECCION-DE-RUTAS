<template>
  <q-page class="q-pa-md statistics-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Estadísticas " description="Visualiza métricas y gráficos clave del sistema." />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="container">
      <div class="cards-grid">
        <MenuCard
          v-for="card in statisticsCards"
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

const statisticsCards = ref([
  {
    title: 'ESTADÍSTICAS GENERALES',
    subtitle: 'Vista general del sistema con todos los indicadores principales',
    imgSrc: 'src/assets/Contrato_Aprendizaje.jpg',
    route: { name: 'StatisticGeneral' },
    color: 'var(--color-primary)',
    textColor: 'white'
  },
  {
    title: 'APRENDICES',
    subtitle: 'Estadísticas detalladas de aprendices y fichas',
    imgSrc: 'src/assets/Aprendices_negro.jpg',
    route: { name: 'StatisticApprentices' },
    color: 'var(--color-primary)',
    textColor: 'white'
  },
  {
    title: 'INSTRUCTORES',
    subtitle: 'Análisis de instructores y distribución de horas',
    imgSrc: 'src/assets/Instructores_negro.jpg',
    route: { name: 'StatisticInstructors' },
    color: 'var(--color-primary)',
    textColor: 'white'
  },
  {
    title: 'HISTORIAL',
    subtitle: 'Consulta estadísticas generadas anteriormente',
    imgSrc: 'src/assets/Historial_negro.jpg',
    route: { name: 'StatisticHistory' },
    color: 'var(--color-primary)',
    textColor: 'white'
  }
])
</script>

<style lang="sass" scoped>
.statistics-page
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
</style>