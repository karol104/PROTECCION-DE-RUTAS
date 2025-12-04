<template>
  <div class="page-content">
    <BackButton/>
    <div class="container-etapa">
    <!-- Encabezado con título y badge -->
    <div class="header-section">
      <h2 class="titulo-principal">Seguimiento y Estado de Etapa Productiva</h2>
      <div class="badge-pendiente">
        <q-icon name="hourglass_empty" size="20px" class="icon-reloj" />
        <span>PENDIENTE</span>
      </div>
    </div>

    <!-- Tarjetas de información -->
    <div class="info-cards">
      <div class="card-info estado-card">
        <h3 class="card-label">Estado:</h3>
        <p class="card-value">En Revisión</p>
      </div>

      <div class="card-info fecha-card">
        <h3 class="card-label">Fecha de Inicio:</h3>
        <p class="card-value">10 de Agosto, 2024</p>
      </div>
    </div>

    <!-- Tarjeta de acciones requeridas -->
    <div class="acciones-card">
      <h3 class="acciones-titulo">Acciones Requeridas:</h3>
      <ul class="acciones-lista">
        <li>Falta cargar: Bitácora de la Semana 4</li>
        <li>Documento de ARL pendiente de validación</li>
        <li>Completar formulario de evaluación final</li>
      </ul>
    </div>

    <!-- Botones de acción -->
    <div class="botones-container">
      <Button
        label="Pendientes"
        custom-class="btn-pendientes"
        icon="download"
        @click="handlePendientes"
      />
      <Button
        label="Novedades"
        custom-class="btn-novedades"
        icon="campaign"
        @click="handleNovedades"
      />
    </div>
    </div>
  </div>
</template>

<script setup>
import BackButton from 'src/components/BackButton.vue'
import Button from 'src/components/Button.vue'


const emit = defineEmits(['pendientes', 'novedades'])

function handlePendientes() {
  emit('pendientes')
}

function handleNovedades() {
  emit('novedades')
}
</script>

<style scoped>
.page-content {
  padding: 1rem;
}

.container-etapa {
  max-width: 850px;
  margin: 0 auto;
  padding: 30px;
  font-family: var(--font-family-primary);
}

/* Header */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.titulo-principal {
  font-size: 28px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.badge-pendiente {
  background-color: #E8E8E8;
  border-radius: 25px;
  padding: 10px 25px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-reloj {
  color: #666;
}

.badge-pendiente span {
  font-weight: 600;
  font-size: 16px;
  color: #000;
}

/* Cards de información */
.info-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 25px;
}

.card-info {
  background-color: #F5F5F5;
  border-radius: 15px;
  padding: 25px;
  border-left: 5px solid var(--color-border-primary);
}

.card-label {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0 0 8px 0;
}

.card-value {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* Tarjeta de acciones */
.acciones-card {
  background-color: #F5F5F5;
  border-radius: 15px;
  padding: 25px;
  border-left: 5px solid var(--color-border-primary);
  margin-bottom: 25px;
}

.acciones-titulo {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0 0 15px 0;
}

.acciones-lista {
  list-style: none;
  padding: 0;
  margin: 0;
}

.acciones-lista li {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
}

.acciones-lista li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: bold;
  font-size: 18px;
}

/* Botones */
.botones-container {
  display: flex;
  gap: 15px;
}

:deep(.btn-pendientes),
:deep(.btn-novedades) {
  background-color: var(--color-primary);
  color: white;
  border-radius: 15px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  text-transform: none;
  transition: background-color 0.3s ease;
}

:deep(.btn-pendientes):hover,
:deep(.btn-novedades):hover {
  background-color: var(--color-primary-hover);
}

/* Responsive */
@media (max-width: 768px) {
  .info-cards {
    grid-template-columns: 1fr;
  }

  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .botones-container {
    flex-direction: column;
  }

  .boton-pendientes,
  .boton-novedades {
    width: 100%;
  }
}
</style>