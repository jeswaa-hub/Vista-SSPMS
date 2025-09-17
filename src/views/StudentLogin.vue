<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 p-6">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 relative overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute -top-20 -right-20 w-40 h-40 bg-purple-100 rounded-full opacity-50"></div>
      <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-100 rounded-full opacity-50"></div>
      
      <!-- Content with relative positioning to appear above the decorative elements -->
      <div class="relative">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-800">Student Login</h1>
          <div class="h-1 w-16 bg-purple-500 mx-auto mt-2 rounded-full"></div>
          <p class="mt-3 text-sm text-gray-600">Sign in to access your student success plan portal</p>
        </div>
        
        <!-- Alert message for errors -->
        <div v-if="error" class="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-md text-sm">
          {{ error }}
        </div>
        
        <form @submit.prevent="login" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                v-model="email"
                id="email"
                type="email"
                placeholder="you@phinmaed.com"
                required
                class="pl-10 py-2.5 rounded-lg w-full border border-gray-300 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                v-model="password"
                id="password"
                type="password"
                placeholder="••••••••"
                required
                class="pl-10 py-2.5 rounded-lg w-full border border-gray-300 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                v-model="rememberMe"
                class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div class="text-sm">
              <a href="#" class="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
                Forgot password?
              </a>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
              <span v-else>Sign In</span>
            </button>
          </div>
        </form>

        <div class="mt-8 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <router-link to="/student/register" class="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
              Register now
            </router-link>
          </p>
          <p class="mt-2 text-sm text-gray-600">
            Are you faculty/adviser?
            <router-link to="/login" class="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
              Go to Faculty Login
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { notificationService } from '../services/notificationService';

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const error = ref('');
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

// Debounce login attempts to prevent spam
let loginTimeout = null

async function login() {
  // Clear previous errors
  error.value = '';
  
  // Basic validation
  if (!email.value) {
    error.value = 'Email is required';
    return;
  }
  
  if (!password.value) {
    error.value = 'Password is required';
    return;
  }
  
  // Clear any existing timeout
  if (loginTimeout) {
    clearTimeout(loginTimeout)
  }
  
  loading.value = true;

  // Debounce login attempts (200ms - reduced for faster response)
  loginTimeout = setTimeout(async () => {
    await performStudentLogin()
  }, 200)
}

async function performStudentLogin() {
  try {
    console.log("Attempting student login with:", email.value);
    const success = await authStore.login(email.value, password.value);
    
    if (success) {
      // Check if user is a student
      if (authStore.isStudent) {
        router.push('/student');
      } else {
        error.value = 'This login is for students only. If you are an administrator or adviser, please use the admin login.';
        // Logout since the user is not a student
        authStore.logout();
      }
    } else {
      error.value = 'Invalid email or password';
    }
  } catch (err) {
    console.error('Login error:', err);
    error.value = 'An unexpected error occurred. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Add a subtle shadow to the form container */
.shadow-lg {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -5px rgba(0, 0, 0, 0.04);
}
</style> 