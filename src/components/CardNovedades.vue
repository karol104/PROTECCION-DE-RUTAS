
<template>
  <div class="urgent-section q-pa-md">


    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md">Cargando...</div>
    </div>

    <div v-else-if="novedades.length" class="q-pa-sm novedades-container">
      <div v-for="(novedad, idx) in novedades" :key="novedad._id || idx" class="novedad-item q-mb-md">
        <div class="novedad-content">
          <div class="text-h6">{{ novedad.tpnew || 'Novedad' }}</div>
          <div class="text-subtitle1">{{ novedad.name || '-' }}</div>
          <div class="text-caption">Ficha: {{ novedad.fiche?.number || novedad.code || '-' }}</div>
        </div>
        <div class="text-center text-caption text-grey-7 q-mt-xs">
          {{ tiempoTranscurrido(novedad) }}
        </div>
      </div>
    </div>

    <!-- Reemplazar con mensaje de error del backend -->
    <div class="text-center">
      {{ errorMessage }}
    </div>
  </div>
      
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  novedades: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    required: true
  }
})

defineEmits(['mostrar-tabla'])

function tiempoTranscurrido(novedad) {
  if (!novedad) return '-'
  
  // El backend usa createdAt o datesofia
  const fecha = novedad.createdAt || novedad.datesofia || novedad.date || ''
  
  if (!fecha) return '-'
  
  try {
    const dias = getDays(fecha)
    if (dias < 0) return `Faltan ${Math.abs(dias)} días`
    if (dias === 0) return 'Hoy'
    if (dias === 1) return 'Hace 1 día'
    return `Hace ${dias} días`
  } catch (e) {
    return '-'
  }
}

function getDays(fecha) {
  const fechaNovedad = new Date(fecha)
  const hoy = new Date()
  
  // Establecer las horas a medianoche para ambas fechas
  fechaNovedad.setHours(0, 0, 0, 0)
  hoy.setHours(0, 0, 0, 0)
  
  // Convertir a UTC para evitar problemas con zona horaria
  const utcNovedad = Date.UTC(fechaNovedad.getFullYear(), fechaNovedad.getMonth(), fechaNovedad.getDate())
  const utcHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  
  // Calcular la diferencia en días
  return Math.floor((utcHoy - utcNovedad) / (1000 * 60 * 60 * 24))
}

</script>

<style scoped>
.urgent-section {
  background: transparent;
  border-radius: 8px;
  max-width: 100%;
  box-sizing: border-box;
}

.novedades-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  padding: 0 16px;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.button-wide {
  width: 400px;
  max-width: 90%;
}

.novedad-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 260px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  box-sizing: border-box;
}

.novedad-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.novedad-content {
  padding: 0;
  margin-bottom: auto;
  overflow: hidden;
  flex: 0 0 auto;
  text-align: center;
}

.text-h6 {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 1.1rem;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 2.6rem;
}

.text-subtitle1 {
  color: #555;
  margin-bottom: 8px;
  font-size: 1rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  min-height: 4.5rem;
}

.text-caption {
  font-size: 0.875rem;
  color: #888;
  font-weight: 500;
  min-height: 1.3rem;
}

.text-negative {
  color: #C10015;
  font-weight: 500;
}

/* Desktop grande */
@media (min-width: 1441px) {
  .novedades-container {
    gap: 20px;
  }
  
  .novedad-item {
    max-width: 420px;
    height: 270px;
  }
}

/* Tablets grandes */
@media (max-width: 1200px) {
  .novedades-container {
    gap: 14px;
    padding: 0 14px;
  }
  
  .novedad-item {
    max-width: 380px;
    height: 250px;
    padding: 22px;
  }
}

/* Tablets */
@media (max-width: 1024px) {
  .urgent-section {
    padding: 16px;
  }
  
  .novedades-container {
    padding: 0 12px;
    gap: 12px;
  }
  
  .novedad-item {
    height: 240px;
    padding: 20px;
    max-width: 350px;
  }
  
  .button-wide {
    width: 100%;
    max-width: 100%;
  }
  
  .text-h6 {
    font-size: 1.05rem;
    min-height: 2.4rem;
    margin-bottom: 10px;
  }
  
  .text-subtitle1 {
    font-size: 0.95rem;
    min-height: 4rem;
    margin-bottom: 6px;
  }
}

/* Tablets pequeñas */
@media (max-width: 900px) {
  .novedades-container {
    gap: 12px;
    padding: 0 10px;
  }
  
  .novedad-item {
    max-width: 320px;
    height: 230px;
    padding: 18px;
  }
}

/* Móviles grandes */
@media (max-width: 768px) {
  .urgent-section {
    padding: 12px;
    border-radius: 6px;
  }
  
  .novedades-container {
    padding: 0 10px;
    gap: 10px;
  }
  
  .novedad-item {
    height: 220px;
    padding: 16px;
    max-width: 100%;
    margin-bottom: 0;
  }
  
  .text-h6 {
    font-size: 1rem;
    min-height: 2.2rem;
    margin-bottom: 8px;
  }
  
  .text-subtitle1 {
    font-size: 0.9rem;
    min-height: 3.6rem;
    margin-bottom: 6px;
    -webkit-line-clamp: 3;
  }
  
  .text-caption {
    font-size: 0.8rem;
    min-height: 1.2rem;
  }
}

/* Móviles medianos */
@media (max-width: 600px) {
  .urgent-section {
    padding: 10px;
  }
  
  .novedades-container {
    padding: 0 8px;
    gap: 8px;
  }
  
  .novedad-item {
    height: 200px;
    padding: 14px;
  }
  
  .text-h6 {
    font-size: 0.95rem;
    min-height: 2rem;
    margin-bottom: 6px;
  }
  
  .text-subtitle1 {
    font-size: 0.85rem;
    min-height: 3.2rem;
    margin-bottom: 4px;
    -webkit-line-clamp: 3;
  }
  
  .text-caption {
    font-size: 0.75rem;
    min-height: 1.1rem;
  }
}

/* Móviles pequeños */
@media (max-width: 480px) {
  .urgent-section {
    padding: 8px;
  }
  
  .novedades-container {
    padding: 0 6px;
    gap: 8px;
  }
  
  .novedad-item {
    height: 190px;
    padding: 12px;
    border-radius: 8px;
  }
  
  .text-h6 {
    font-size: 0.9rem;
    min-height: 1.8rem;
    margin-bottom: 6px;
  }
  
  .text-subtitle1 {
    font-size: 0.8rem;
    min-height: 2.8rem;
    margin-bottom: 4px;
    -webkit-line-clamp: 2;
  }
  
  .text-caption {
    font-size: 0.7rem;
    min-height: 1rem;
  }
}

/* Móviles muy pequeños */
@media (max-width: 400px) {
  .urgent-section {
    padding: 6px;
  }
  
  .novedades-container {
    padding: 0 4px;
    gap: 6px;
  }
  
  .novedad-item {
    height: 180px;
    padding: 10px;
    border-radius: 6px;
  }
  
  .text-h6 {
    font-size: 0.85rem;
    min-height: 1.6rem;
    margin-bottom: 4px;
  }
  
  .text-subtitle1 {
    font-size: 0.75rem;
    min-height: 2.4rem;
    margin-bottom: 4px;
    -webkit-line-clamp: 2;
  }
  
  .text-caption {
    font-size: 0.65rem;
    min-height: 0.9rem;
  }
}

/* Mínimo 300px */
@media (max-width: 360px) {
  .urgent-section {
    padding: 4px;
  }
  
  .novedades-container {
    padding: 0 2px;
    gap: 4px;
  }
  
  .novedad-item {
    height: 170px;
    padding: 8px;
    border-radius: 4px;
  }
  
  .text-h6 {
    font-size: 0.8rem;
    min-height: 1.4rem;
    margin-bottom: 4px;
    -webkit-line-clamp: 2;
  }
  
  .text-subtitle1 {
    font-size: 0.7rem;
    min-height: 2rem;
    margin-bottom: 3px;
    -webkit-line-clamp: 2;
    line-height: 1.3;
  }
  
  .text-caption {
    font-size: 0.6rem;
    min-height: 0.8rem;
  }
}

/* Para pantallas extremadamente pequeñas (300px) */
@media (max-width: 300px) {
  .urgent-section {
    padding: 2px;
  }
  
  .novedades-container {
    padding: 0 1px;
    gap: 3px;
  }
  
  .novedad-item {
    height: 160px;
    padding: 6px;
    border-radius: 3px;
  }
  
  .text-h6 {
    font-size: 0.75rem;
    min-height: 1.3rem;
    margin-bottom: 3px;
    -webkit-line-clamp: 2;
  }
  
  .text-subtitle1 {
    font-size: 0.65rem;
    min-height: 1.8rem;
    margin-bottom: 2px;
    -webkit-line-clamp: 2;
    line-height: 1.2;
  }
  
  .text-caption {
    font-size: 0.55rem;
    min-height: 0.7rem;
  }
}
</style>