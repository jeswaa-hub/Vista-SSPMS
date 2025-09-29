<template>
  <div 
    class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
    :class="containerClass"
  >
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div>
    </div>
    
    <!-- Content -->
    <div class="relative z-10">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default', // 'default', 'dashboard', 'form', 'list'
    validator: (value) => ['default', 'dashboard', 'form', 'list'].includes(value)
  },
  customClass: {
    type: String,
    default: ''
  }
})

const containerClass = computed(() => {
  const variants = {
    default: 'p-6',
    dashboard: 'p-8',
    form: 'p-4',
    list: 'p-6'
  }
  return `${variants[props.variant]} ${props.customClass}`
})
</script>

<style scoped>
/* Subtle background pattern for depth */
</style>
