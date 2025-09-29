<template>
  <header class="bg-white/90 backdrop-blur-sm border-b border-gray-200 h-20 flex items-center px-8 sticky top-0 z-30">
    <!-- Left side with collapse button and title -->
    <div class="flex items-center space-x-6">
      <!-- Sidebar Toggle Button -->
      <button 
        @click="$emit('toggle-sidebar')"
        class="p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        :title="sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
      >
        <svg 
          class="w-6 h-6 transition-transform duration-300" 
          :class="sidebarCollapsed ? 'rotate-180' : ''"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      
      <!-- Page Title -->
      <div class="flex-1">
        <h2 class="text-2xl font-normal text-gray-800">{{ pageTitle }}</h2>
      </div>
    </div>
    
    <!-- Right side with notifications and user profile -->
    <div class="flex items-center space-x-6 ml-auto">
      <!-- Notifications (only for Adviser and Student) -->
      <div v-if="userType !== 'Admin'" class="relative">
        <router-link 
          :to="`/${userType.toLowerCase()}/notifications`"
          class="relative p-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span 
            v-if="unreadNotificationsCount > 0" 
            class="absolute top-1 right-1 inline-flex items-center justify-center w-6 h-6 text-sm font-bold text-white bg-red-500 rounded-full"
          >
            {{ unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount }}
          </span>
        </router-link>
      </div>
      
      <!-- User Profile Avatar -->
      <div class="relative">
        <button 
          @click="showProfileMenu = !showProfileMenu" 
          class="relative"
        >
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white text-base font-medium shadow-lg">
            {{ userInitials }}
          </div>
        </button>
        
        <!-- Profile Dropdown Menu -->
        <div 
          v-if="showProfileMenu" 
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200"
          @click.outside="showProfileMenu = false"
        >
          <div class="px-4 py-2 border-b border-gray-200">
            <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
            <p class="text-xs text-gray-500">{{ userType }}</p>
          </div>
          <router-link 
            :to="`/${userType.toLowerCase()}/profile`" 
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            @click="showProfileMenu = false"
          >
            Your Profile
          </router-link>
          <button 
            @click="logout" 
            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

// Props
const props = defineProps({
  userType: {
    type: String,
    required: true,
    validator: (value) => ['Admin', 'Adviser', 'Student'].includes(value)
  },
  sidebarCollapsed: {
    type: Boolean,
    default: false
  },
  unreadNotificationsCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['toggle-sidebar'])

// Composables
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const showProfileMenu = ref(false)

// Computed properties
const pageTitle = computed(() => {
  return route.meta.title || `${props.userType} Dashboard`
})

const userName = computed(() => {
  if (!authStore.user) return `${props.userType} User`
  return `${authStore.user.firstName} ${authStore.user.lastName}`
})

const userInitials = computed(() => {
  if (!authStore.user) return props.userType.charAt(0) + 'U'
  return `${authStore.user.firstName.charAt(0)}${authStore.user.lastName.charAt(0)}`
})

// Methods
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userId')
  authStore.logout()
  router.push('/login')
  showProfileMenu.value = false
}
</script>
