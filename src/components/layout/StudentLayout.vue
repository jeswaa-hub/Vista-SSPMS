<template>
  <div class="min-h-screen flex" style="background-color: #F6FBF9;">
    <!-- Unified Sidebar -->
    <UnifiedSidebar
      :user-type="'Student'"
      :navigation-items="studentNavigation"
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
    />
    
    <!-- Main Content -->
    <div class="flex-1 transition-all duration-500 ease-in-out" :class="sidebarCollapsed ? 'md:pl-24' : 'md:pl-80'">
      <!-- Unified Topbar -->
      <UnifiedTopbar
        :user-type="'Student'"
        :sidebar-collapsed="sidebarCollapsed"
        :unread-notifications-count="unreadNotificationsCount"
        @toggle-sidebar="toggleSidebar"
      />
      
      <!-- Page Content -->
      <main class="py-4 px-8">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { notificationApiService } from '../../services/notificationApiService';
import UnifiedSidebar from './UnifiedSidebar.vue';
import UnifiedTopbar from './UnifiedTopbar.vue';
import { studentNavigation } from '../../config/navigation.js';

// Router and route
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State variables
const showMobileMenu = ref(false);
const sidebarCollapsed = ref(false)
const unreadNotificationsCount = ref(0);

// Check if a route is active
function isActive(path) {
  return route.path.startsWith(path);
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}




// Fetch unread notifications count
async function fetchUnreadCount() {
  try {
    const count = await notificationApiService.getUnreadCount();
    unreadNotificationsCount.value = count;
  } catch (error) {
    console.error('Failed to fetch unread notifications count:', error);
    // On error, don't update the count, but don't show an error to the user
    // as this is a background operation
  }
}

// Set up polling for notifications
onMounted(() => {
  // Initial fetch
  fetchUnreadCount();
  
  // Set up polling every 15 seconds (increased from 30 seconds for more responsive UI)
  const pollInterval = setInterval(fetchUnreadCount, 15000);
  
  // Clean up on component unmount
  onUnmounted(() => {
    clearInterval(pollInterval);
  });
});
</script>

<style scoped>
.bg-background {
  background-color: #f9fafb;
}

.bg-primary {
  background-color: #3B82F6;
}

.bg-primary-light {
  background-color: #EFF6FF;
}

.text-primary {
  color: #3B82F6;
}

.text-primary-dark {
  color: #2563EB;
}

.hover\:bg-primary-dark:hover {
  background-color: #2563EB;
}

.transition-colors {
  transition: color 0.2s, background-color 0.2s;
}

/* Add styles for dropdown */
.relative {
  position: relative;
}

.z-50 {
  z-index: 50;
}
</style> 