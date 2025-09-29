<template>
  <Transition
    name="fade"
    mode="out-in"
    :duration="{ enter: 200, leave: 100 }"
  >
    <div v-if="loading" class="smooth-loader" :class="containerClass">
      <div v-if="showSkeleton && skeletonType" class="w-full">
        <SkeletonLoader :type="skeletonType" :rows="skeletonRows" :lines="skeletonLines" />
      </div>
      <div v-else class="flex items-center justify-center" :class="loaderClass">
        <div class="relative">
          <!-- Custom spinner -->
          <div class="spinner" :class="spinnerSize">
            <div class="double-bounce1"></div>
            <div class="double-bounce2"></div>
          </div>
          <div v-if="showProgress && progress !== null" class="mt-4 text-center">
            <div class="w-32 bg-gray-200 rounded-full h-1.5 mx-auto">
              <div class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                   :style="{ width: progress + '%' }"></div>
            </div>
            <div class="text-xs text-gray-500 mt-1">{{ progressText || `${Math.round(progress)}%` }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="smooth-content">
      <slot></slot>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import SkeletonLoader from './SkeletonLoader.vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  showSkeleton: {
    type: Boolean,
    default: false
  },
  skeletonType: {
    type: String,
    default: 'text'
  },
  skeletonRows: {
    type: Number,
    default: 5
  },
  skeletonLines: {
    type: Number,
    default: 3
  },
  fullHeight: {
    type: Boolean,
    default: false
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: null
  },
  progressText: {
    type: String,
    default: null
  }
})

const spinnerSize = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }
  return sizes[props.size]
})

const containerClass = computed(() => ({
  'min-h-screen': props.fullHeight,
  'min-h-[200px]': !props.fullHeight && !props.showSkeleton,
  'p-6': !props.showSkeleton
}))

const loaderClass = computed(() => ({
  'h-full': props.fullHeight,
  'h-32': !props.fullHeight
}))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.spinner {
  position: relative;
  display: inline-block;
}

.double-bounce1,
.double-bounce2 {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #3b82f6;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  animation: sk-bounce 2.0s infinite ease-in-out;
}

.double-bounce2 {
  animation-delay: -1.0s;
}

@keyframes sk-bounce {
  0%, 100% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
}

.smooth-loader {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.smooth-content {
  animation: slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
</style>
