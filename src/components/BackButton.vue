<template>
  <teleport to="body" v-if="floating">
    <q-icon
      name="arrow_back"
      :size="numericSize + 'px'"
      class="back-icon back-icon-floating"
      :style="iconStyle"
      @click="handleClick"
      :aria-label="ariaLabel"
      :aria-disabled="disabled"
      :tabindex="disabled ? -1 : 0"
    />
  </teleport>

  <q-icon
    v-else
    name="arrow_back"
    :size="numericSize + 'px'"
    class="back-icon"
    :style="iconStyle"
    @click="handleClick"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
    :tabindex="disabled ? -1 : 0"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  to: { type: String, default: null },
  size: { type: [String, Number], default: 35 },
  color: { type: String, default: 'var(--color-primary)' },
  ariaLabel: { type: String, default: 'Volver' },
  floating: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  // Nuevo prop para controlar el z-index
  zIndex: { type: Number, default: 1000 }
})

const emit = defineEmits(['click'])
const router = useRouter()

const numericSize = computed(() => {
  return typeof props.size === 'number' ? props.size : parseInt(props.size, 10) || 50
})

const iconStyle = computed(() => {
  const s = {
    color: props.color,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: 'transform 0.12s ease, opacity 0.12s ease',
    zIndex: props.zIndex
  }

  if (props.floating) {
    s.position = 'fixed'
    s.left = '20px'
    s.top = '98px'
  }

  if (props.disabled) {
    s.opacity = 0.4
    s.pointerEvents = 'none'
  }

  return s
})

function handleClick(evt) {
  if (props.disabled) return
  
  emit('click', evt)
  if (props.to) router.push(props.to)
  else router.back()
}
</script>

<style scoped>
.back-icon {
  cursor: pointer;
  transition: transform 0.12s ease, opacity 0.12s ease;
}

.back-icon:hover {
  transform: translateX(-4px);
}

/* Responsive - Tablets */
@media (max-width: 1024px) {
  .back-icon {
    font-size: clamp(32px, 4vw, 50px) !important;
  }
  
  .back-icon-floating {
    left: 16px !important;
    top: 90px !important;
  }
}

/* Responsive - Móviles grandes */
@media (max-width: 768px) {
  .back-icon {
    font-size: clamp(28px, 5vw, 42px) !important;
  }
  
  .back-icon-floating {
    left: 12px !important;
    top: 85px !important;
  }
}

/* Responsive - Móviles medianos */
@media (max-width: 480px) {
  .back-icon {
    font-size: clamp(24px, 6vw, 36px) !important;
  }
  
  .back-icon-floating {
    left: 10px !important;
    top: 80px !important;
  }
  
  .back-icon:hover {
    transform: translateX(-2px);
  }
}

/* Responsive - Móviles pequeños */
@media (max-width: 360px) {
  .back-icon {
    font-size: clamp(20px, 7vw, 32px) !important;
  }
  
  .back-icon-floating {
    left: 8px !important;
    top: 75px !important;
  }
}

/* Responsive - Pantallas muy pequeñas (300px) */
@media (max-width: 300px) {
  .back-icon {
    font-size: clamp(18px, 8vw, 28px) !important;
  }
  
  .back-icon-floating {
    left: 6px !important;
    top: 70px !important;
  }
}

/* Asegurar que el botón sea táctil en móviles */
@media (hover: none) and (pointer: coarse) {
  .back-icon {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    margin: -8px;
  }
}
</style>