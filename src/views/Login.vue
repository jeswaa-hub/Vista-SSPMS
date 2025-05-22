<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 relative overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute -top-20 -right-20 w-40 h-40 bg-blue-100 rounded-full opacity-50"></div>
      <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-100 rounded-full opacity-50"></div>
      
      <!-- Content with relative positioning to appear above the decorative elements -->
      <div class="relative">
        <!-- Login Type Toggle -->
        <div class="flex justify-center mb-8">
          <div class="inline-flex rounded-lg p-1 bg-gray-100">
            <button 
              class="px-4 py-2 text-base font-medium rounded-md transition-all"
              :class="{'bg-blue-500 text-white': !isStudentLogin, 'text-gray-600': isStudentLogin}"
              @click="toggleLoginType(false)"
            >
              Faculty
            </button>
            <button 
              class="px-4 py-2 text-base font-medium rounded-md transition-all"
              :class="{'bg-purple-500 text-white': isStudentLogin, 'text-gray-600': !isStudentLogin}"
              @click="toggleLoginType(true)"
            >
              Student
            </button>
          </div>
        </div>
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-800">
            {{ isStudentLogin ? 'Student Login' : 'Faculty Login' }}
          </h1>
          <div class="h-1 w-16 mx-auto mt-2 rounded-full" :class="isStudentLogin ? 'bg-purple-500' : 'bg-blue-500'"></div>
          <p class="mt-3 text-base text-gray-600">
            {{ isStudentLogin ? 'Access your student portal' : 'Sign in to manage student success plans' }}
          </p>
        </div>
        
        <form @submit.prevent="login" class="space-y-6" novalidate>
          <div>
            <label for="email" class="block text-base font-medium text-gray-700 mb-2">Email Address</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <BaseInput
                v-model="email"
                label=""
                type="text"
                placeholder="you@example.com"
                :error="formErrors.email"
                :pattern="null"
                required
                :disabled="loading"
                class="pl-10 py-3 text-base rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-offset-0"
                :class="isStudentLogin ? 'focus:ring-purple-500' : 'focus:ring-blue-500'"
                labelClass="hidden"
              />
            </div>
          </div>
          
          <div>
            <label for="password" class="block text-base font-medium text-gray-700 mb-2">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <BaseInput
                v-model="password"
                label=""
                type="password"
                placeholder="••••••••"
                :error="formErrors.password"
                required
                :disabled="loading"
                class="pl-10 py-3 text-base rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-offset-0"
                :class="isStudentLogin ? 'focus:ring-purple-500' : 'focus:ring-blue-500'"
                labelClass="hidden"
              />
            </div>
          </div>
          
          <div>
            <BaseButton
              type="submit"
              class="w-full py-3 px-4 text-base rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
              :class="isStudentLogin ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'"
              :loading="loading"
              loadingText="Signing in..."
            >
              Sign In
            </BaseButton>
          </div>
          
          <div class="flex items-center justify-center mt-4">
            <router-link 
              to="/forgot-password" 
              class="text-base font-medium transition-colors duration-200"
              :class="isStudentLogin ? 'text-purple-600 hover:text-purple-500' : 'text-blue-600 hover:text-blue-500'"
            >
              Forgot your password?
            </router-link>
          </div>
        </form>

        <div class="mt-8 text-center" v-if="isStudentLogin">
          <p class="text-base text-gray-600">
            Don't have an account?
            <router-link to="/student/register" class="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
              Register now
            </router-link>
          </p>
        </div>
        
        <div class="mt-8 text-center text-xs text-gray-500">
          © 2023 PHINMA Education. All rights reserved.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { notificationService } from '../services/notificationService'

const email = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()
const formErrors = ref({
  email: '',
  password: ''
})
const loading = ref(false)
const isStudentLogin = ref(false)

// Toggle between Faculty and Student login
const toggleLoginType = (isStudent) => {
  isStudentLogin.value = isStudent
  // Clear form when switching
  email.value = ''
  password.value = ''
  formErrors.value = { email: '', password: '' }
}

async function login() {
  // No validation at all - just attempt login directly
  loading.value = true
  
  try {
    console.log("Attempting login with:", email.value, password.value)
    const success = await authStore.login(email.value, password.value)
    
    if (success) {
      // Use role-based redirect
      if (isStudentLogin.value) {
        // If student login is selected but user is not a student, show error
        if (!authStore.isStudent) {
          notificationService.showError('This login is for students only. Faculty members should use Faculty login.')
          authStore.logout() // Logout if wrong role
          return
        }
        router.push('/student')
      } else {
        // If faculty login is selected but user is a student, show error
        if (authStore.isStudent) {
          notificationService.showError('This login is for faculty members only. Students should use Student login.')
          authStore.logout() // Logout if wrong role
          return
        }
        
        // Otherwise, redirect based on role
        if (authStore.isAdmin) {
          router.push('/admin')
        } else if (authStore.isAdviser) {
          router.push('/adviser')
        }
      }
    }
  } catch (err) {
    console.error('Login error:', err)
    notificationService.showError('An unexpected error occurred')
  } finally {
    loading.value = false
  }
}

// When component mounts, check for student login type in the URL
onMounted(() => {
  // Check if URL has ?type=student parameter
  const urlParams = new URLSearchParams(window.location.search);
  const loginType = urlParams.get('type');
  if (loginType === 'student') {
    isStudentLogin.value = true;
  }
});
</script>

<style scoped>
/* Add a subtle shadow to the form container */
.shadow-lg {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Style for input fields - remove border and use background color instead */
:deep(input) {
  border-width: 0 !important;
}

:deep(input:focus) {
  border-width: 0 !important;
}
</style> 