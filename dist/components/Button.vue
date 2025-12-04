<template>
  <q-btn
    v-bind="attrs"
    :label="label"
    :icon="icon"
    :loading="loading"
    :disable="disable"
    :color="color"
    :flat="flat"
    :round="round"
    :dense="dense"
    :no-caps="noCaps"
    :padding="padding"
    class="app-button"
    :class="buttonClasses"
    @click="handleClick"
  >
    <slot />
  </q-btn>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: undefined
  },
  customClass: {
    type: String,
    default: ''
  },
  noCaps: {
    type: Boolean,
    default: false
  },
  padding: {
    type: String,
    default: 'sm'
  },
  flat: {
    type: Boolean,
    default: false
  },
  round: {
    type: Boolean,
    default: false
  },
  dense: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  disable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])
const attrs = useAttrs()

const buttonClasses = computed(() => {
  const classes = []
  if (props.customClass) {
    classes.push(props.customClass)
  }
  if (props.noCaps) {
    classes.push('app-button--no-caps')
  }
  return classes
})

function handleClick(event) {
  if (!props.disable && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.app-button {
  font-weight: 700;
  border-radius: 12px; 
  min-height: 42px;
  padding: 0 28px;
  background: var(--color-primary);
  color: var(--color-text-white);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  box-shadow: 0 8px 20px var(--shadow-primary);
}


.app-button--no-caps {
  text-transform: none !important;
}

.app-button.gradient-btn {
  background: var(--color-primary);
  color: var(--color-text-white);
  box-shadow: 0 8px 20px var(--shadow-primary-medium);
}

.app-button.gradient-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px var(--shadow-primary-strong);
}

.app-button.boton-cerrar {
  background: var(--color-error);
  color: var(--color-text-white);
  box-shadow: 0 6px 18px rgba(198, 40, 40, 0.35);
}

.app-button.boton-cerrar:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(198, 40, 40, 0.45);
  background: #b71c1c;
}

.app-button:focus-visible {
  outline: 2px solid rgba(57, 169, 0, 0.35);
  outline-offset: 2px;
}

.app-button:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px var(--shadow-primary-medium);
}

@media (max-width: 768px) {
  .app-button {
    width: 100%;
  }
}
</style>