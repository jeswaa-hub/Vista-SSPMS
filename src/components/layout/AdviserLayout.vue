<template>
  <div class="min-h-screen flex" style="background-color: #F6FBF9;">
    <!-- Unified Sidebar -->
    <UnifiedSidebar
      :user-type="'Adviser'"
      :navigation-items="adviserNavigation"
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
    />
    
    <!-- Main Content -->
    <div class="flex-1 transition-all duration-300" :class="sidebarCollapsed ? 'pl-24' : 'pl-80'">
      <!-- Unified Topbar -->
      <UnifiedTopbar
        :user-type="'Adviser'"
        :sidebar-collapsed="sidebarCollapsed"
        :unread-notifications-count="unreadNotificationsCount"
        @toggle-sidebar="toggleSidebar"
      />
      
      <!-- Page Content -->
      <main class="px-8 py-4">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationService } from '../../services/notificationService';
import UnifiedSidebar from './UnifiedSidebar.vue';
import UnifiedTopbar from './UnifiedTopbar.vue';
import { adviserNavigation } from '../../config/navigation.js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const notificationService = useNotificationService();

const sidebarCollapsed = ref(false);
const unreadNotificationsCount = ref(0);

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}


async function fetchUnreadCount() {
  try {
    const count = await notificationService.getUnreadCount();
    unreadNotificationsCount.value = count;
  } catch (error) {
    console.error('Failed to fetch unread notifications count:', error);
  }
}

onMounted(() => {
  fetchUnreadCount();
  const pollInterval = setInterval(fetchUnreadCount, 15000);
  onBeforeUnmount(() => {
    clearInterval(pollInterval);
  });
});
</script> 

<style scoped>
/* Custom styles matching adviser dashboard */
</style> 