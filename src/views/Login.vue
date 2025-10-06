<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-6">
    <!-- Main Login Card -->
    <div class="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden" style="min-height: 400px; max-height: 90vh;">
      <!-- Mobile Layout: Logo on top, form on bottom -->
      <div class="flex flex-col lg:flex-row h-full">
        <!-- Left Section - Branding and Information -->
        <div class="w-full lg:w-1/2 bg-white p-4 sm:p-6 lg:p-12 flex flex-col items-center justify-center order-1 lg:order-1">
          <!-- University Logo -->
          <div class="text-center mb-3 sm:mb-4">
            <div class="mx-auto w-28 h-28 sm:w-36 sm:h-36 lg:w-72 lg:h-72 bg-white rounded-full shadow-lg flex items-center justify-center mb-3 sm:mb-4 border-4 border-green-800">
              <img 
                src="/src/assets/18.png" 
                alt="PHINMA Araullo University" 
                class="w-24 h-24 sm:w-32 sm:h-32 lg:w-56 lg:h-56 object-contain"
              />
            </div>
          </div>
          
          <!-- University Name -->
          <h1 class="text-lg sm:text-xl lg:text-4xl font-bold text-green-800 mb-2 sm:mb-4 text-center">PHINMA ARAULLO UNIVERSITY</h1>
          
          <!-- System Description -->
          <p class="text-sm sm:text-base lg:text-lg text-green-800 text-center leading-relaxed">Student Success and Completion Monitoring System</p>
        </div>

        <!-- Right Section - Login Form -->
        <div class="w-full lg:w-1/2 bg-green-800 p-4 sm:p-6 lg:p-12 flex items-center justify-center order-2 lg:order-2" style="min-height: 400px;">
          <div class="w-full max-w-sm">
            <!-- Portal Type Selector -->
            <div class="bg-white bg-opacity-10 rounded-xl p-1 mb-4 sm:mb-6 lg:mb-8">
              <div class="flex relative">
                <!-- Animated Background Slider -->
                <div 
                  class="absolute top-0 left-0 w-1/2 h-full bg-white rounded-lg transition-all duration-300 ease-in-out transform"
                  :class="selectedPortal === 'faculty' ? 'translate-x-0' : 'translate-x-full'"
                ></div>
                
                <button 
                  v-for="portal in portals" 
                  :key="portal.value"
                  @click="selectedPortal = portal.value"
                  :class="[
                    'relative flex-1 py-2 sm:py-2.5 lg:py-3 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out z-10',
                    selectedPortal === portal.value
                      ? 'text-green-800 font-semibold'
                      : 'text-white hover:text-white'
                  ]"
                >
                  {{ portal.label }}
                </button>
              </div>
            </div>

            <!-- Login Form -->
            <form @submit.prevent="handleLogin" @keydown.enter.prevent="handleLogin" class="space-y-3 sm:space-y-4 lg:space-y-6">
              <!-- Email Field -->
              <div>
                <label for="email" class="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    placeholder="Enter your email address"
                    required
                    class="w-full pl-10 pr-4 py-2.5 sm:py-3 lg:py-4 bg-white rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 border-0 shadow-sm text-sm lg:text-base"
                  />
                </div>
              </div>

              <!-- Password Field -->
              <div>
                <label for="password" class="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Enter your password"
                    required
                    class="w-full pl-10 pr-12 py-2.5 sm:py-3 lg:py-4 bg-white rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 border-0 shadow-sm text-sm lg:text-base"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                  >
                    <svg v-if="showPassword" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                    <svg v-else class="w-4 h-4 lg:w-5 lg:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Turnstile Security Check -->
              <div class="mt-4">
                <Turnstile
                  :key="`turnstile-${selectedPortal}`"
                  :site-key="turnstileConfig.siteKey"
                  theme="light"
                  size="normal"
                  action="login"
                  @success="onTurnstileSuccess"
                  @error="onTurnstileError"
                  @expired="onTurnstileExpired"
                  @timeout="onTurnstileTimeout"
                />
                <div v-if="turnstileError" class="mt-2 text-red-200 text-xs text-center">
                  {{ turnstileError }}
                </div>
              </div>

              <!-- Login Button -->
              <button
                type="submit"
                :disabled="loading || !canSubmit"
                class="w-full py-2.5 sm:py-3 lg:py-4 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-green-800 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-sm lg:text-base disabled:transform-none"
              >
                <span v-if="loading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-4 w-4 lg:h-5 lg:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
                <span v-else-if="!canSubmit" class="flex items-center justify-center">
                  <svg class="animate-pulse -ml-1 mr-3 h-4 w-4 lg:h-5 lg:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Verifying security...
                </span>
                <span v-else>Sign In</span>
              </button>

              <!-- Forgot Password Link -->
              <div class="text-center mt-2 sm:mt-3 lg:mt-4">
                <router-link 
                  to="/forgot-password" 
                  class="text-white hover:text-blue-200 text-xs lg:text-sm transition-colors"
                >
                  Forgot password?
                </router-link>
              </div>
            </form>

            <!-- Footer Links - Only for Students -->
            <div v-if="selectedPortal === 'student'" class="mt-4 sm:mt-6 lg:mt-8 text-center">
              <router-link to="/student/register" class="text-white hover:text-blue-200 text-xs lg:text-sm transition-colors">
                Don't have an account? Sign up
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { notificationService } from '../services/notificationService'
import Turnstile from '../components/ui/Turnstile.vue'
import { useTurnstile } from '../composables/useTurnstile'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const showPassword = ref(false)
const selectedPortal = ref('faculty')

// Turnstile setup
const {
  turnstileToken,
  turnstileVerified,
  turnstileLoading,
  turnstileError,
  isVerified,
  canSubmit,
  onTurnstileSuccess,
  onTurnstileError,
  onTurnstileExpired,
  onTurnstileTimeout,
  resetTurnstile,
  setLoading,
  getToken,
  validateToken
} = useTurnstile()

// Turnstile configuration
const turnstileConfig = ref({
  siteKey: import.meta.env.VITE_TURNSTILE_PROD_SITE_KEY || import.meta.env.VITE_TURNSTILE_LOCAL_SITE_KEY || '0x4AAAAAABveibnJZJ5AKau_'
})


// Form data
const form = ref({
  email: '',
  password: ''
})

// Portal options
const portals = [
  { label: 'Faculty', value: 'faculty' },
  { label: 'Student', value: 'student' }
]

// Toggle between Faculty and Student login
const toggleLoginType = (isStudent) => {
  const newPortal = isStudent ? 'student' : 'faculty'
  
  // Only update if portal actually changed
  if (selectedPortal.value !== newPortal) {
    selectedPortal.value = newPortal
    // Clear form when switching
    form.value.email = ''
    form.value.password = ''
    showPassword.value = false
  }
}

// Debounce login attempts to prevent spam
let loginTimeout = null

async function handleLogin() {
  // Prevent form submission if already loading
  if (loading.value) {
    return
  }

  // Clear any existing timeout
  if (loginTimeout) {
    clearTimeout(loginTimeout)
  }

  // Basic validation
  if (!form.value.email.trim()) {
    notificationService.showError('Email is required')
    return
  }
  if (!form.value.password.trim()) {
    notificationService.showError('Password is required')
    return
  }
  
  // Turnstile validation
  if (!validateToken()) {
    return
  }
  
  loading.value = true

  // Debounce login attempts (200ms - reduced for faster response)
  loginTimeout = setTimeout(async () => {
    await performLogin()
  }, 200)
}

async function performLogin() {
  try {
    // Attempt login without showing auth store notifications
    const success = await authStore.login(form.value.email.trim(), form.value.password, getToken())
    
    if (success) {
      // Check role compatibility with selected login type
      if (selectedPortal.value === 'student') {
        if (!authStore.isStudent) {
          // Wrong portal - show single error message
          notificationService.showError('Invalid credentials. Please check your email and password.')
          // Logout silently without additional notifications
          await authStore.logout()
          loading.value = false
          return
        }
        // Successful student login - show welcome message and redirect
        notificationService.showSuccess(`Welcome back, ${authStore.user.firstName || 'Student'}!`)
        router.push('/student/')
      } else {
        // Faculty login - check if user is admin or adviser
        if (!authStore.isAdmin && !authStore.isAdviser) {
          // Wrong portal - show single error message
          notificationService.showError('Invalid credentials. Please check your email and password.')
          // Logout silently without additional notifications
          await authStore.logout()
          loading.value = false
          return
        }
        // Successful faculty login - show welcome message and redirect
        notificationService.showSuccess(`Welcome back, ${authStore.user.firstName || 'Faculty'}!`)
        if (authStore.isAdmin) {
          router.push('/admin/')
        } else {
          router.push('/adviser/')
        }
      }
    } else {
      // Login failed - show single error message
      notificationService.showError('Invalid credentials. Please check your email and password.')
    }
  } catch (error) {
    console.error('Login error:', error)
    // Show only one generic error message
    notificationService.showError('Invalid credentials. Please check your email and password.')
  } finally {
    loading.value = false
  }
}

// Initialize with faculty login by default
onMounted(() => {
  selectedPortal.value = 'faculty'
  // Clear any existing notifications to start fresh
  if (notificationService.clearAll) {
    notificationService.clearAll()
  }
  // Reset Turnstile when component mounts
  resetTurnstile()
})
</script>

<style scoped>
/* Ensure proper input styling */
:deep(.BaseInput input) {
  font-size: 14px;
  line-height: 1.5;
}

:deep(.BaseInput input:focus) {
  box-shadow: 0 0 0 2px rgb(59 130 246 / 0.5);
}

/* Remove any unwanted focus states from buttons */
:deep(.BaseButton button:focus) {
  outline: none;
}
</style> 