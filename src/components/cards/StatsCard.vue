<template>
  <div class="stat-card-premium">
    <div class="card-body">
      <div class="value-display">{{ value }}</div>
      <div class="title-display">{{ title }}</div>
    </div>

    <div class="mini-chart">
      <div class="bar-group">
        <div class="chart-bar" style="height: 45%; animation-delay: 0s;"></div>
        <div class="chart-bar" style="height: 70%; animation-delay: 0.1s;"></div>
        <div class="chart-bar" style="height: 55%; animation-delay: 0.2s;"></div>
        <div class="chart-bar" style="height: 85%; animation-delay: 0.3s;"></div>
        <div class="chart-bar" style="height: 65%; animation-delay: 0.4s;"></div>
        <div class="chart-bar" style="height: 95%; animation-delay: 0.5s;"></div>
        <div class="chart-bar" style="height: 80%; animation-delay: 0.6s;"></div>
        <div class="chart-bar" style="height: 100%; animation-delay: 0.7s;"></div>
      </div>
    </div>

    <div class="gradient-overlay"></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  color: {
    type: String,
    default: 'var(--color-primary)'
  }
})
</script>

<style scoped>
.stat-card-premium {
  width: 280px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 166, 81, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 166, 81, 0.1);
  position: relative;
}

.stat-card-premium:hover {
  box-shadow: 0 12px 28px rgba(0, 166, 81, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-6px);
  border-color: rgba(0, 166, 81, 0.2);
}

.card-body {
  padding: 24px 24px 16px 24px;
  position: relative;
  z-index: 2;
}

.value-display {
  font-size: 46px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -1px;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 166, 81, 0.1);
}

.title-display {
  font-size: 11px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.4;
}

.mini-chart {
  padding: 0 24px 20px 24px;
  position: relative;
  z-index: 2;
}

.bar-group {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 48px;
  gap: 4px;
}

.chart-bar {
  flex: 1;
  background: var(--color-primary);
  border-radius: 3px 3px 0 0;
  min-height: 8px;
  animation: growBar 0.8s ease-out forwards;
  transform-origin: bottom;
  opacity: 0;
}

@keyframes growBar {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

.gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: transparent;
  pointer-events: none;
  z-index: 1;
}

/* ============================================ */
/* RESPONSIVIDAD 300px - 400px */
/* ============================================ */
@media (min-width: 300px) and (max-width: 400px) {
  .stat-card-premium {
    width: 100%;
    border-radius: 12px;
  }

  .card-body {
    padding: 18px 18px 12px 18px;
  }

  .value-display {
    font-size: 34px;
    margin-bottom: 6px;
  }

  .title-display {
    font-size: 9px;
    letter-spacing: 0.8px;
  }

  .mini-chart {
    padding: 0 18px 16px 18px;
  }

  .bar-group {
    height: 36px;
    gap: 3px;
  }

  .chart-bar {
    border-radius: 2px 2px 0 0;
  }
}

/* ============================================ */
/* RESPONSIVIDAD 401px - 600px */
/* ============================================ */
@media (min-width: 401px) and (max-width: 600px) {
  .stat-card-premium {
    width: 100%;
    border-radius: 14px;
  }

  .card-body {
    padding: 20px 20px 14px 20px;
  }

  .value-display {
    font-size: 38px;
    margin-bottom: 7px;
  }

  .title-display {
    font-size: 10px;
    letter-spacing: 0.9px;
  }

  .mini-chart {
    padding: 0 20px 18px 20px;
  }

  .bar-group {
    height: 40px;
    gap: 3px;
  }

  .chart-bar {
    border-radius: 2.5px 2.5px 0 0;
  }
}

/* ============================================ */
/* RESPONSIVIDAD 601px - 900px */
/* ============================================ */
@media (min-width: 601px) and (max-width: 900px) {
  .stat-card-premium {
    width: 100%;
    border-radius: 15px;
  }

  .card-body {
    padding: 22px 22px 15px 22px;
  }

  .value-display {
    font-size: 42px;
    margin-bottom: 7px;
  }

  .title-display {
    font-size: 10px;
    letter-spacing: 0.95px;
  }

  .mini-chart {
    padding: 0 22px 19px 22px;
  }

  .bar-group {
    height: 44px;
    gap: 3.5px;
  }

  .chart-bar {
    border-radius: 2.5px 2.5px 0 0;
  }
}

/* ============================================ */
/* RESPONSIVIDAD 901px - 1000px */
/* ============================================ */
@media (min-width: 901px) and (max-width: 1000px) {
  .stat-card-premium {
    width: 100%;
    border-radius: 16px;
  }

  .card-body {
    padding: 24px 23px 16px 23px;
  }

  .value-display {
    font-size: 44px;
    margin-bottom: 8px;
  }

  .title-display {
    font-size: 11px;
    letter-spacing: 1px;
  }

  .mini-chart {
    padding: 0 23px 20px 23px;
  }

  .bar-group {
    height: 46px;
    gap: 4px;
  }

  .chart-bar {
    border-radius: 3px 3px 0 0;
  }
}
</style>