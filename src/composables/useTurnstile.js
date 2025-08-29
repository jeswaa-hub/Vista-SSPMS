import { ref, computed } from 'vue'

export function useTurnstile() {
  const turnstileToken = ref(null)
  const turnstileVerified = ref(false)
  const turnstileLoading = ref(false)
  const turnstileError = ref(null)

  // Computed properties
  const isVerified = computed(() => turnstileVerified.value && turnstileToken.value)
  const canSubmit = computed(() => isVerified.value && !turnstileLoading.value)

  // Handle successful verification
  const onTurnstileSuccess = (token) => {
    turnstileToken.value = token
    turnstileVerified.value = true
    turnstileError.value = null
    turnstileLoading.value = false
  }

  // Handle verification errors
  const onTurnstileError = (error) => {
    turnstileError.value = error
    turnstileVerified.value = false
    turnstileToken.value = null
    turnstileLoading.value = false
  }

  // Handle verification expiration
  const onTurnstileExpired = () => {
    turnstileVerified.value = false
    turnstileToken.value = null
    turnstileError.value = 'Security check expired. Please verify again.'
    turnstileLoading.value = false
  }

  // Handle verification timeout
  const onTurnstileTimeout = () => {
    turnstileVerified.value = false
    turnstileToken.value = null
    turnstileError.value = 'Security check timed out. Please try again.'
    turnstileLoading.value = false
  }

  // Reset Turnstile state
  const resetTurnstile = () => {
    turnstileToken.value = null
    turnstileVerified.value = false
    turnstileError.value = null
    turnstileLoading.value = false
  }

  // Set loading state
  const setLoading = (loading) => {
    turnstileLoading.value = loading
  }

  // Get token for API calls
  const getToken = () => turnstileToken.value

  // Validate token exists
  const validateToken = () => {
    if (!turnstileToken.value) {
      turnstileError.value = 'Please complete the security check before proceeding.'
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
    
    // Methods
    onTurnstileSuccess,
    onTurnstileError,
    onTurnstileExpired,
    onTurnstileTimeout,
    resetTurnstile,
    setLoading,
    getToken,
    validateToken
  }
}
