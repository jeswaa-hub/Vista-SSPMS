<template>
  <div class="turnstile-container">
    <div 
      ref="turnstileRef" 
      :id="`turnstile-${uniqueId}`"
      class="cf-turnstile"
    ></div>
    
    <!-- Loading state -->
    <div v-if="loading" class="turnstile-loading">
      <div class="loading-skeleton">
        <div class="skeleton-box"></div>
        <div class="skeleton-text">Loading security check...</div>
      </div>
    </div>
    
    <!-- Error state -->
    <div v-if="error" class="turnstile-error">
      <span class="error-text">{{ error }}</span>
      <button @click="reload" class="reload-button">
        Reload
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  siteKey: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'dark'].includes(value)
  },
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'compact', 'invisible'].includes(value)
  },
  action: {
    type: String,
    default: 'login'
  },
  language: {
    type: String,
    default: 'auto'
  }
})

const emit = defineEmits(['success', 'error', 'expired', 'timeout'])

const turnstileRef = ref(null)
const loading = ref(true)
const error = ref(null)
const widgetId = ref(null)
const uniqueId = ref(`turnstile-${Math.random().toString(36).substr(2, 9)}`)
const scriptLoaded = ref(false)

// Global script loading state - cached across component instances
let globalScriptPromise = null
let globalScriptLoaded = false

// Load Turnstile script globally (only once) with better caching
const loadTurnstileScript = () => {
  if (globalScriptLoaded && window.turnstile) {
    return Promise.resolve(window.turnstile)
  }

  if (globalScriptPromise) {
    return globalScriptPromise
  }

  globalScriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) {
      globalScriptLoaded = true
      scriptLoaded.value = true
      resolve(window.turnstile)
      return
    }

    // Check if script is already loading
    if (document.querySelector('script[src*="turnstile"]')) {
      const checkTurnstile = () => {
        if (window.turnstile) {
          globalScriptLoaded = true
          scriptLoaded.value = true
          resolve(window.turnstile)
        } else {
          setTimeout(checkTurnstile, 25) // Further reduced check interval
        }
      }
      checkTurnstile()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous' // Add CORS for better performance
    
    script.onload = () => {
      globalScriptLoaded = true
      scriptLoaded.value = true
      resolve(window.turnstile)
    }
    script.onerror = () => {
      globalScriptPromise = null // Reset promise on error
      reject(new Error('Failed to load Turnstile script'))
    }
    
    document.head.appendChild(script)
  })

  return globalScriptPromise
}

// Initialize Turnstile widget
const initTurnstile = async () => {
  try {
    // Prevent multiple initializations
    if (widgetId.value) {
      return
    }
    
    loading.value = true
    error.value = null
    
    // Wait for script to load
    const turnstile = await loadTurnstileScript()
    
    // Wait for next tick to ensure DOM is ready
    await nextTick()
    
    if (!turnstileRef.value) {
      console.warn('Turnstile container not found')
      loading.value = false
      return
    }
    
    // Clear any existing content
    turnstileRef.value.innerHTML = ''
    
    // Create widget with optimized settings
    widgetId.value = turnstile.render(turnstileRef.value, {
      sitekey: props.siteKey,
      theme: props.theme,
      size: props.size,
      action: props.action,
      language: props.language,
      'retry': 'auto', // Auto-retry on failure
      'retry-interval': 8000, // Retry every 8 seconds
      callback: (token) => {
        emit('success', token)
        loading.value = false
      },
      'expired-callback': () => {
        emit('expired')
        loading.value = false
      },
      'timeout-callback': () => {
        emit('timeout')
        loading.value = false
      },
      'error-callback': () => {
        error.value = 'Security check failed. Please try again.'
        emit('error', error.value)
        loading.value = false
      }
    })
    
    loading.value = false
  } catch (err) {
    console.error('Turnstile initialization error:', err)
    error.value = 'Failed to load security check. Please refresh the page.'
    emit('error', error.value)
    loading.value = false
  }
}

// Reload Turnstile
const reload = async () => {
  // Remove existing widget
  if (window.turnstile && widgetId.value) {
    try {
      window.turnstile.remove(widgetId.value)
    } catch (e) {
      console.warn('Error removing Turnstile widget:', e)
    }
  }
  
  // Reset state
  widgetId.value = null
  error.value = null
  
  // Reinitialize
  await initTurnstile()
}

// Lifecycle
onMounted(async () => {
  await initTurnstile()
})

onUnmounted(() => {
  // Clean up widget
  if (window.turnstile && widgetId.value) {
    try {
      window.turnstile.remove(widgetId.value)
    } catch (e) {
      console.warn('Error removing Turnstile widget:', e)
    }
  }
  
  // Reset state
  widgetId.value = null
  loading.value = false
  error.value = null
})
</script>

<style scoped>
.turnstile-container {
  position: relative;
  min-height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-turnstile {
  display: flex;
  align-items: center;
  justify-content: center;
}

.turnstile-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #6b7280;
}

.loading-skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.skeleton-box {
  width: 300px;
  height: 65px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

.skeleton-text {
  font-size: 14px;
  color: #6b7280;
  animation: pulse 2s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.turnstile-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #dc2626;
}

.error-text {
  font-size: 14px;
  text-align: center;
}

.reload-button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reload-button:hover {
  background: #b91c1c;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .turnstile-container {
    min-height: 60px;
  }
  
  .loading-text,
  .error-text {
    font-size: 12px;
  }
}
</style>
