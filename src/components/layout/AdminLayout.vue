<template>
  <div class="min-h-screen flex" style="background-color: #F6FBF9;">
    <!-- Unified Sidebar -->
    <UnifiedSidebar
      :user-type="'Admin'"
      :navigation-items="adminNavigation"
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
    />
    
    <!-- Main Content -->
    <div class="flex-1 transition-all duration-500 ease-in-out" :class="sidebarCollapsed ? 'pl-24' : 'pl-80'">
      <!-- Unified Topbar -->
      <UnifiedTopbar
        :user-type="'Admin'"
        :sidebar-collapsed="sidebarCollapsed"
        :unread-notifications-count="0"
        @toggle-sidebar="toggleSidebar"
      />
      
      <!-- Page Content -->
      <main class="py-2 px-8">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { preloadCriticalAdminRoutes, preloadBasedOnRoute, preloadOnHover } from '../../utils/preloader'
import UnifiedSidebar from './UnifiedSidebar.vue';
import UnifiedTopbar from './UnifiedTopbar.vue';
import { adminNavigation } from '../../config/navigation.js';

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const openSections = ref({
  advisers: false,
  classes: false,
  management: false,
  system: false,
})
const hoveredSection = ref(null)
const dropdownPosition = ref(0)
const keepDropdownOpen = ref(false)


function isActive(path) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  hoveredSection.value = null
}


onMounted(async () => {
  await preloadCriticalAdminRoutes()
  const currentRouteName = route.name
  if (currentRouteName) {
    preloadBasedOnRoute(currentRouteName)
  }
  router.afterEach((to) => {
    if (to.name) {
      preloadBasedOnRoute(to.name)
    }
  })
})
</script> 

<style scoped>
/* Custom styles matching admin dashboard */
</style>