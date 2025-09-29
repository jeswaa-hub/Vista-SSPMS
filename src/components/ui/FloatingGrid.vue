<template>
  <div 
    class="grid gap-6"
    :class="gridClass"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cols: {
    type: [String, Number],
    default: 1,
    validator: (value) => {
      if (typeof value === 'number') return value >= 1 && value <= 12
      if (typeof value === 'string') return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].includes(value)
      return false
    }
  },
  responsive: {
    type: Boolean,
    default: true
  },
  gap: {
    type: String,
    default: 'default', // 'none', 'small', 'default', 'large'
    validator: (value) => ['none', 'small', 'default', 'large'].includes(value)
  }
})

const gridClass = computed(() => {
  const cols = typeof props.cols === 'string' ? parseInt(props.cols) : props.cols
  const gapClass = {
    none: 'gap-0',
    small: 'gap-4',
    default: 'gap-6',
    large: 'gap-8'
  }[props.gap]

  if (props.responsive) {
    const responsiveCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    }
    return `${responsiveCols[cols] || `grid-cols-${cols}`} ${gapClass}`
  } else {
    return `grid-cols-${cols} ${gapClass}`
  }
})
</script>
