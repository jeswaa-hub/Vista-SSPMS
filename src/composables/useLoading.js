import { ref, reactive, computed } from 'vue'

// Global loading cache to prevent duplicate requests
const loadingCache = new Map()
const dataCache = new Map()

export function useLoading() {
  const isLoading = ref(false)
  const error = ref(null)
  const retryCount = ref(0)
  
  const setLoading = (loading) => {
    isLoading.value = loading
    if (loading) {
      error.value = null
    }
  }

  const setError = (err) => {
    error.value = err
    isLoading.value = false
  }

  return {
    isLoading,
    error,
    retryCount,
    setLoading,
    setError
  }
}

export function useFastLoading() {
  const loadingStates = reactive({})
  const errors = reactive({})
  
  const setLoading = (key, loading) => {
    loadingStates[key] = loading
    if (loading) {
      errors[key] = null
    }
  }

  const setError = (key, error) => {
    errors[key] = error
    loadingStates[key] = false
  }

  const isLoading = (key) => loadingStates[key] || false
  const getError = (key) => errors[key] || null

  // Optimized data fetching with caching and deduplication
  const fetchWithCache = async (key, fetchFn, options = {}) => {
    const {
      ttl = 300000, // 5 minutes default cache
      forceRefresh = false,
      enableCache = true
    } = options

    // Check if already loading to prevent duplicate requests
    if (loadingStates[key]) {
      // Wait for ongoing request
      while (loadingStates[key]) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      return dataCache.get(key)?.data
    }

    // Check cache first
    if (enableCache && !forceRefresh) {
      const cached = dataCache.get(key)
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data
      }
    }

    setLoading(key, true)

    try {
      const data = await fetchFn()
      
      // Cache the result
      if (enableCache) {
        dataCache.set(key, {
          data,
          timestamp: Date.now()
        })
      }

      return data
    } catch (error) {
      setError(key, error)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  // Batch loading for multiple resources
  const batchFetch = async (requests) => {
    const promises = requests.map(({ key, fetchFn, options }) => 
      fetchWithCache(key, fetchFn, options).catch(error => ({ error, key }))
    )
    
    return Promise.all(promises)
  }

  // Clear cache for a specific key or all
  const clearCache = (key = null) => {
    if (key) {
      dataCache.delete(key)
    } else {
      dataCache.clear()
    }
  }

  // Preload data in background
  const preload = (key, fetchFn, options = {}) => {
    if (!dataCache.has(key) && !loadingStates[key]) {
      fetchWithCache(key, fetchFn, { ...options, enableCache: true })
    }
  }

  return {
    loadingStates,
    errors,
    isLoading,
    getError,
    setLoading,
    setError,
    fetchWithCache,
    batchFetch,
    clearCache,
    preload
  }
}

export function useProgressiveLoading() {
  const loadingSteps = ref([])
  const currentStep = ref(0)
  const totalSteps = ref(0)
  
  const initializeSteps = (steps) => {
    loadingSteps.value = steps.map(step => ({
      ...step,
      completed: false,
      loading: false,
      error: null
    }))
    totalSteps.value = steps.length
    currentStep.value = 0
  }

  const executeStep = async (index) => {
    if (index >= loadingSteps.value.length) return

    const step = loadingSteps.value[index]
    step.loading = true
    
    try {
      await step.execute()
      step.completed = true
      currentStep.value = index + 1
    } catch (error) {
      step.error = error
      throw error
    } finally {
      step.loading = false
    }
  }

  const executeAllSteps = async () => {
    for (let i = 0; i < loadingSteps.value.length; i++) {
      await executeStep(i)
    }
  }

  const progress = computed(() => {
    if (totalSteps.value === 0) return 0
    return (currentStep.value / totalSteps.value) * 100
  })

  return {
    loadingSteps,
    currentStep,
    totalSteps,
    progress,
    initializeSteps,
    executeStep,
    executeAllSteps
  }
}
