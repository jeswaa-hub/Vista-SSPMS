<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-6">
    <!-- Main Verification Card -->
    <div class="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden" style="min-height: 400px; max-height: 90vh;">
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

        <!-- Right Section - Verification Form -->
        <div class="w-full lg:w-1/2 bg-green-800 p-4 sm:p-6 lg:p-12 flex items-center justify-center order-2 lg:order-2" style="min-height: 400px;">
          <div class="w-full max-w-sm">
            <div class="text-center mb-6">
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-white bg-opacity-20 mb-4">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-white mb-2">Verify Your Adviser Account</h3>
              <p class="text-sm text-white text-opacity-90">
                Please enter your ID number to complete the verification process
              </p>
            </div>

            <form @submit.prevent="verifyAccount" class="space-y-4">
              <div>
                <label for="idNumber" class="block text-sm font-medium text-white mb-2">
                  ID Number
                </label>
                <div class="relative">
                  <input
                    id="idNumber"
                    v-model="idNumber"
                    type="text"
                    required
                    class="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-200"
                    :class="{ 'border-red-400 focus:ring-red-400': error }"
                    placeholder="Enter your ID number"
                  />
                </div>
                <p v-if="error" class="mt-2 text-sm text-red-300">{{ error }}</p>
              </div>

              <div>
                <button
                  type="submit"
                  :disabled="loading || !idNumber.trim()"
                  class="w-full flex justify-center items-center py-3 px-4 bg-white text-green-800 font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span v-if="loading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-green-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                  <span v-else>Verify Account</span>
                </button>
              </div>
            </form>

            <div v-if="success" class="mt-6">
              <div class="rounded-lg bg-white bg-opacity-20 p-4 border border-white border-opacity-30">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-white">
                      Account Verified Successfully!
                    </h3>
                    <div class="mt-2 text-sm text-white text-opacity-90">
                      <p>Your account has been activated. Please check your email for your login credentials.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const idNumber = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const token = route.params.token

async function verifyAccount() {
  if (!idNumber.value.trim()) {
    error.value = 'Please enter your ID number'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await api.post(`/advisers/verify/${token}`, {
      idNumber: idNumber.value.trim()
    })

    if (response.data.success) {
      success.value = true
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  } catch (err) {
    console.error('Verification error:', err)
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = 'Verification failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>
