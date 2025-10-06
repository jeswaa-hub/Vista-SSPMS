<template>
  <div class="turnstile-container">
    <div 
      ref="turnstileElement" 
      class="turnstile-widget"
      :data-sitekey="siteKey"
      :data-theme="theme"
      :data-size="size"
      :data-action="action"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  siteKey: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    default: 'light'
  },
  size: {
    type: String,
    default: 'normal'
  },
  action: {
    type: String,
    default: 'login'
  }
})

const emit = defineEmits(['success', 'error', 'expired', 'timeout'])

const turnstileElement = ref(null)
let turnstileWidget = null

// Load Turnstile script
const loadTurnstileScript = () => {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('Turnstile script loaded')
      resolve()
    }
    
    script.onerror = () => {
      console.error('Failed to load Turnstile script')
      reject(new Error('Failed to load Turnstile script'))
    }
    
    document.head.appendChild(script)
  })
}

// Initialize Turnstile widget
const initTurnstile = async () => {
  try {
    await loadTurnstileScript()
    
    if (turnstileElement.value && window.turnstile) {
      turnstileWidget = window.turnstile.render(turnstileElement.value, {
        sitekey: props.siteKey,
        theme: props.theme,
        size: props.size,
        action: props.action,
        callback: (token) => {
          console.log('Turnstile success:', token)
          emit('success', token)
        },
        'error-callback': (error) => {
          console.error('Turnstile error:', error)
          emit('error', error)
        },
        'expired-callback': () => {
          console.log('Turnstile expired')
          emit('expired')
        },
        'timeout-callback': () => {
          console.log('Turnstile timeout')
          emit('timeout')
        }
      })
    }
  } catch (error) {
    console.error('Error initializing Turnstile:', error)
    emit('error', error)
  }
}

// Reset Turnstile widget
const reset = () => {
  if (turnstileWidget && window.turnstile) {
    window.turnstile.reset(turnstileWidget)
  }
}

// Get current token
const getToken = () => {
  if (turnstileWidget && window.turnstile) {
    return window.turnstile.getResponse(turnstileWidget)
  }
  return null
}

// Expose methods
defineExpose({
  reset,
  getToken
})

// Watch for prop changes
watch(() => props.siteKey, () => {
  if (turnstileWidget) {
    reset()
  }
})

onMounted(() => {
  initTurnstile()
})

onUnmounted(() => {
  if (turnstileWidget && window.turnstile) {
    window.turnstile.remove(turnstileWidget)
  }
})
</script>

<style scoped>
.turnstile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 65px;
}

.turnstile-widget {
  display: flex;
  justify-content: center;
}
</style>
