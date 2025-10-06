import { ref, computed } from 'vue'

export function useTurnstile() {
  const turnstileToken = ref(null)
  const turnstileVerified = ref(false)
  const turnstileLoading = ref(false)
  const turnstileError = ref(null)

  // Computed properties
  const isVerified = computed(() => turnstileVerified.value && turnstileToken.value)
  const canSubmit = computed(() => isVerified.value && !turnstileLoading.value)

  // Event handlers
  const onTurnstileSuccess = (token) => {
    console.log('Turnstile verification successful')
    turnstileToken.value = token
    turnstileVerified.value = true
    turnstileError.value = null
    turnstileLoading.value = false
  }

  const onTurnstileError = (error) => {
    console.error('Turnstile verification failed:', error)
    turnstileToken.value = null
    turnstileVerified.value = false
    turnstileError.value = 'Security verification failed. Please try again.'
    turnstileLoading.value = false
  }

  const onTurnstileExpired = () => {
    console.log('Turnstile token expired')
    turnstileToken.value = null
    turnstileVerified.value = false
    turnstileError.value = 'Security verification expired. Please verify again.'
    turnstileLoading.value = false
  }

  const onTurnstileTimeout = () => {
    console.log('Turnstile verification timeout')
    turnstileToken.value = null
    turnstileVerified.value = false
    turnstileError.value = 'Security verification timed out. Please try again.'
    turnstileLoading.value = false
  }

  // Utility functions
  const resetTurnstile = () => {
    turnstileToken.value = null
    turnstileVerified.value = false
    turnstileError.value = null
    turnstileLoading.value = false
  }

  const setLoading = (loading) => {
    turnstileLoading.value = loading
  }

  const getToken = () => {
    return turnstileToken.value
  }

  const validateToken = () => {
    if (!isVerified.value) {
      turnstileError.value = 'Please complete the security verification'
      return false
    }
    return true
  }

  return {
    // State
    turnstileToken,
    turnstileVerified,
    turnstileLoading,
    turnstileError,
    
    // Computed
    isVerified,
    canSubmit,
    
    // Event handlers
    onTurnstileSuccess,
    onTurnstileError,
    onTurnstileExpired,
    onTurnstileTimeout,
    
    // Utility functions
    resetTurnstile,
    setLoading,
    getToken,
    validateToken
  }
}
