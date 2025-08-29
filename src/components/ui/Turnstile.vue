<template>
  <div class="turnstile-container">
    <div 
      ref="turnstileRef" 
      :id="`turnstile-${uniqueId}`"
      class="cf-turnstile"
    ></div>
    
    <!-- Loading state -->
    <div v-if="loading" class="turnstile-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">Loading security check...</span>
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
const uniqueId = ref(`turnstile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
const scriptLoaded = ref(false)

// Global script loading state
let globalScriptPromise = null

// Load Turnstile script globally (only once)
const loadTurnstileScript = () => {
  if (globalScriptPromise) {
    return globalScriptPromise
  }

  globalScriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) {
      scriptLoaded.value = true
      resolve(window.turnstile)
      return
    }

    // Check if script is already loading
    if (document.querySelector('script[src*="turnstile"]')) {
      const checkTurnstile = () => {
        if (window.turnstile) {
          scriptLoaded.value = true
          resolve(window.turnstile)
        } else {
          setTimeout(checkTurnstile, 100)
        }
      }
      checkTurnstile()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      scriptLoaded.value = true
      resolve(window.turnstile)
    }
    script.onerror = () => {
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
      return
    }
    
    // Clear any existing content
    turnstileRef.value.innerHTML = ''
    
    // Create widget
    widgetId.value = turnstile.render(turnstileRef.value, {
      sitekey: props.siteKey,
      theme: props.theme,
      size: props.size,
      action: props.action,
      language: props.language,
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

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #6b7280;
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
