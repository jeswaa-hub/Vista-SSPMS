<template>
  <div 
    class="bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
    :class="[
      paddingClass,
      marginClass,
      sizeClass,
      customClass
    ]"
    :style="customStyle"
  >
    <!-- Card Header -->
    <div v-if="title || $slots.header" class="border-b border-gray-100 pb-4 mb-6">
      <slot name="header">
        <h3 v-if="title" class="text-xl font-semibold text-gray-800">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
      </slot>
    </div>

    <!-- Card Content -->
    <div class="flex-1">
      <slot></slot>
    </div>

    <!-- Card Footer -->
    <div v-if="$slots.footer" class="border-t border-gray-100 pt-4 mt-6">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'default', // 'small', 'default', 'large', 'full'
    validator: (value) => ['small', 'default', 'large', 'full'].includes(value)
  },
  padding: {
    type: String,
    default: 'default', // 'none', 'small', 'default', 'large'
    validator: (value) => ['none', 'small', 'default', 'large'].includes(value)
  },
  margin: {
    type: String,
    default: 'default', // 'none', 'small', 'default', 'large'
    validator: (value) => ['none', 'small', 'default', 'large'].includes(value)
  },
  customClass: {
    type: String,
    default: ''
  },
  customStyle: {
    type: Object,
    default: () => ({})
  }
})

const sizeClass = computed(() => {
  const sizes = {
    small: 'max-w-sm',
    default: 'max-w-4xl',
    large: 'max-w-6xl',
    full: 'w-full'
  }
  return sizes[props.size]
})

const paddingClass = computed(() => {
  const paddings = {
    none: '',
    small: 'p-4',
    default: 'p-6',
    large: 'p-8'
  }
  return paddings[props.padding]
})

const marginClass = computed(() => {
  const margins = {
    none: '',
    small: 'm-2',
    default: 'm-4',
    large: 'm-6'
  }
  return margins[props.margin]
})
</script>

<style scoped>
/* Enhanced floating effect */
.shadow-lg {
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover\:shadow-xl:hover {
  box-shadow: 0 20px 40px -4px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1);
}

.hover\:scale-\[1\.02\]:hover {
  transform: scale(1.02);
}
</style>
