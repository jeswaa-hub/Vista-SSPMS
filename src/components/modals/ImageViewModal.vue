<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
    @click="close"
  >
    <div class="relative max-w-full max-h-full">
      <!-- Close Button -->
      <button 
        @click="close"
        class="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        title="Close"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <!-- Image -->
      <img 
        :src="imageUrl" 
        :alt="imageAlt"
        class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        @click.stop
      />
      
      <!-- Image Caption -->
      <div 
        v-if="imageAlt" 
        class="absolute -bottom-12 left-0 right-0 text-white text-center text-sm bg-black bg-opacity-50 py-2 px-4 rounded"
      >
        {{ imageAlt }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: ''
  },
  imageAlt: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    close()
  }
})
</script>
