<template>
  <div class="page-header" :class="[`page-header--${align}`]">
    <div>
        <h1 class="page-header__title">
          <slot>
            {{ title }}
          </slot>
        </h1>
        <p v-if="description" class="page-header__desc">{{ description }}</p>
      </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  align: {
    type: String,
    default: 'center',
    validator: value => ['left', 'center'].includes(value)
  }
})
</script>

<style scoped>
.page-header {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  text-align: center;
}

.page-header--left {
  justify-content: flex-start;
  text-align: left;
}

.page-header__title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #202124;
  margin: 0;
  line-height: 1.2;
}

.page-header__desc {
  margin: 8px 0 0;
  color: #5f6368;
  font-size: 0.95rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .page-header__title {
    font-size: clamp(1.8rem, 6vw, 2.2rem);
  }
}
</style>
