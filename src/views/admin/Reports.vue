<template>
  <q-page class="q-pa-md reports-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Reportes" description="Genera y descarga reportes por diferentes criterios." />
          </q-card-section>
        </q-card>

        <div class="container">
          <div class="reports-grid">
            <MenuCard
              v-for="report in reportCards"
              :key="report.route"
              :title="report.title"
              :subtitle="report.subtitle"
              :img-src="report.imgSrc"
              :route="report.route"
              :color="report.color"
              :text-color="report.textColor"
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
import contratoImg from 'src/assets/Contrato_Aprendizaje.jpg'
import modalidadnegroImg from 'src/assets/Modalidadnegro.jpg'
import horasInstructorImg from 'src/assets/Horas_Instructor.jpg'
import sgvaImg from 'src/assets/SGVA_Negro.jpg'

// State
const reportCards = ref([
  {
    title: 'Reporte por Año',
    subtitle: 'Genera reportes consolidados por año y ficha.',
  imgSrc: contratoImg,
    route: '/app/admin/reporteporaño',
    color: 'var(--color-primary)',
    textColor: 'white'
  },
  {
    title: 'Reporte por Modalidad',
    subtitle: 'Visualiza estadísticas y avances según tipo de modalidad.',
  imgSrc: modalidadnegroImg,
    route: '/app/admin/reportepormodalidad',
    color: 'var(--color-primary)',
    textColor: 'white'
  },
  {
    title: 'Horas por Instructor',
    subtitle: 'Consulta las horas ejecutadas y disponibles por instructor.',
  imgSrc: horasInstructorImg,
    route: '/app/admin/horasporinstructor',
    color: 'var(--color-primary)',
    textColor: 'white'
  },
  {
    title: 'Reporte por Empresa',
    subtitle: 'Genera reportes de aprendices activos por empresa.',
  imgSrc: sgvaImg,
    route: '/app/admin/reporteporempresa',
    color: 'var(--color-primary)',
    textColor: 'white'
  }
])
</script>

<style lang="sass" scoped>
.reports-page
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

.reports-grid
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
