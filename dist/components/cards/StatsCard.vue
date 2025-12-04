<template>
  <div class="stat-container">
    <q-card class="my-card" :style="{ backgroundColor: color }">
      <q-card-section>
        <div class="text-subtitle2 text-center">{{ title }}</div>
      </q-card-section>
    </q-card>
    <div class="value-container">{{ value }}</div>
    <div class="stat-line"></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  value: {
    type: [Number, String],
    required: true
  },
  imgSrc: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'var(--color-primary)'
  }
})
</script>

<style scoped>
.stat-container {
  width: 280px;
}

.my-card {
  width: 100%;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.text-subtitle2 {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
  padding: 0.5rem;
}

.value-container {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 1rem;
}

.stat-line {
  width: 100%;
  height: 5px;
  background-color: var(--color-primary);
  margin-top: 0.75rem;
  border-radius: 3px;
}

/* ============================================ */
/* RESPONSIVIDAD 300px - 400px */
/* ============================================ */
@media (min-width: 300px) and (max-width: 400px) {
  .stat-container {
    width: 100%;
  }

  .my-card {
    min-height: 70px;
  }

  .text-subtitle2 {
    font-size: 0.85rem;
    padding: 0.3rem;
  }

  .value-container {
    font-size: 1.8rem;
    margin-top: 0.6rem;
  }

  .stat-line {
    height: 3px;
    margin-top: 0.5rem;
  }
}

/* ============================================ */
/* RESPONSIVIDAD 401px - 600px */
/* ============================================ */
@media (min-width: 401px) and (max-width: 600px) {
  .stat-container {
    width: 100%;
  }

  .my-card {
    min-height: 80px;
  }

  .text-subtitle2 {
    font-size: 0.95rem;
    padding: 0.4rem;
  }

  .value-container {
    font-size: 2rem;
    margin-top: 0.7rem;
  }

  .stat-line {
    height: 4px;
    margin-top: 0.6rem;
  }
}

/* ============================================ */
/* RESPONSIVIDAD 601px - 900px */
/* ============================================ */
@media (min-width: 601px) and (max-width: 900px) {
  .stat-container {
    width: 100%;
  }

  .my-card {
    min-height: 85px;
  }

  .text-subtitle2 {
    font-size: 1rem;
    padding: 0.4rem;
  }

  .value-container {
    font-size: 2.1rem;
    margin-top: 0.8rem;
  }

  .stat-line {
    height: 4px;
    margin-top: 0.65rem;
  }
}

/* ============================================ */
/* RESPONSIVIDAD 901px - 1000px */
/* ============================================ */
@media (min-width: 901px) and (max-width: 1000px) {
  .stat-container {
    width: 100%;
  }

  .my-card {
    min-height: 95px;
  }

  .text-subtitle2 {
    font-size: 1.1rem;
    padding: 0.45rem;
  }

  .value-container {
    font-size: 2.3rem;
    margin-top: 0.9rem;
  }

  .stat-line {
    height: 4px;
    margin-top: 0.7rem;
  }
}
</style>