<template>
  <div class="min-h-screen p-6" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">Notifications</h1>
            <p class="text-gray-500 mt-1 font-normal">Stay updated with important messages and announcements</p>
          </div>
          <button 
            @click="refreshNotifications"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            :disabled="loading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" :class="{'animate-spin': loading}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ loading ? 'Refreshing...' : 'Refresh' }}</span>
          </button>
        </div>
      </div>

      <!-- Notifications Content -->
      <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span class="text-sm text-gray-600">Loading notifications...</span>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!notifications.length" class="text-center py-12">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-800 mb-2">No Notifications</h3>
          <p class="text-gray-500 max-w-md mx-auto">You don't have any notifications at the moment. Check back later for updates from your advisers.</p>
        </div>
      
      <div v-else class="space-y-4">
        <!-- Filter Options -->
        <div class="flex justify-between items-center mb-4 text-sm">
          <div class="flex items-center space-x-2">
            <span>Filter:</span>
            <button 
              @click="activeFilter = 'all'" 
              class="px-3 py-1 rounded-full" 
              :class="activeFilter === 'all' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'"
            >
              All
            </button>
            <button 
              @click="activeFilter = 'class'" 
              class="px-3 py-1 rounded-full" 
              :class="activeFilter === 'class' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'"
            >
              Class
            </button>
            <button 
              @click="activeFilter = 'mm'" 
              class="px-3 py-1 rounded-full" 
              :class="activeFilter === 'mm' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'"
            >
              M&M
            </button>
            <button 
              @click="activeFilter = 'odyssey'" 
              class="px-3 py-1 rounded-full" 
              :class="activeFilter === 'odyssey' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'"
            >
              Odyssey Plan
            </button>
            <button 
              @click="activeFilter = 'consultation'" 
              class="px-3 py-1 rounded-full" 
              :class="activeFilter === 'consultation' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'"
            >
              Consultation
            </button>
          </div>
          
          <!-- Mark all as read button removed -->
        </div>
        
        <!-- Notifications List -->
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div 
            v-for="notification in filteredNotifications" 
            :key="notification._id"
            :class="[
              'p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors relative',
              notification.read ? 'bg-white' : 'bg-blue-50'
            ]"
          >
            <div class="flex">
              <!-- Icon based on notification type -->
              <div class="mr-4">
                <div 
                  :class="[
                    'h-10 w-10 rounded-full flex items-center justify-center',
                    notification.type === 'warning' ? 'bg-amber-100 text-amber-500' :
                    notification.type === 'success' ? 'bg-green-100 text-green-500' :
                    notification.type === 'error' ? 'bg-red-100 text-red-500' :
                    'bg-blue-100 text-blue-500'
                  ]"
                >
                  <svg v-if="notification.type === 'warning'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <svg v-else-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else-if="notification.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <!-- Notification Content -->
              <div class="flex-1">
                <div class="flex justify-between items-start mb-1">
                  <h3 class="font-medium text-gray-900">{{ notification.title }}</h3>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500">{{ formatDate(notification.createdAt) }}</span>
                    <button 
                      v-if="!notification.read" 
                      @click="markAsRead(notification._id)"
                      class="p-1 text-gray-400 hover:text-gray-600"
                      title="Mark as read"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p class="text-sm text-gray-700 mb-1">{{ notification.message }}</p>
                <div v-if="notification.link" class="mt-1">
                  <router-link :to="notification.link" class="text-primary text-sm hover:underline">View details →</router-link>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  <span v-if="notification.sender">From: {{ notification.senderName || 'Adviser' }}</span>
                </div>
              </div>
            </div>
            
            <!-- Unread indicator dot -->
            <div v-if="!notification.read" class="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary"></div>
          </div>
        </div>
        
        <!-- Pagination (if needed) -->
        <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-4">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded border text-sm" 
            :class="currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            Previous
          </button>
          
          <span class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded border text-sm" 
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            Next
          </button>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { notificationService } from '../../services/notificationService';
import { useAuthStore } from '../../stores/authStore';
import { notificationApiService } from '../../services/notificationApiService';

// State variables
const loading = ref(true);
const notifications = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const activeFilter = ref('all'); // 'all', 'class', 'mm', 'odyssey', 'consultation'
const authStore = useAuthStore();
const pageSize = 10; // Number of notifications per page

// Computed properties
const filteredNotifications = computed(() => {
  let filtered = [];
  
  if (activeFilter.value === 'class') {
    // Filter for class-related notifications (session completions, promotions, etc.)
    filtered = notifications.value.filter(notification => 
      notification.title?.toLowerCase().includes('session') ||
      notification.title?.toLowerCase().includes('promotion') ||
      notification.title?.toLowerCase().includes('semester') ||
      notification.title?.toLowerCase().includes('year level') ||
      notification.message?.toLowerCase().includes('session') ||
      notification.message?.toLowerCase().includes('class')
    );
  } else if (activeFilter.value === 'mm') {
    // Filter for M&M related notifications  
    filtered = notifications.value.filter(notification =>
      notification.title?.toLowerCase().includes('m&m') ||
      notification.title?.toLowerCase().includes('exam') ||
      notification.title?.toLowerCase().includes('p1') ||
      notification.title?.toLowerCase().includes('p2') ||
      notification.title?.toLowerCase().includes('p3') ||
      notification.message?.toLowerCase().includes('exam') ||
      notification.message?.toLowerCase().includes('submission')
    );
  } else if (activeFilter.value === 'odyssey') {
    // Filter for Odyssey Plan related notifications
    filtered = notifications.value.filter(notification =>
      notification.title?.toLowerCase().includes('odyssey') ||
      notification.title?.toLowerCase().includes('plan') ||
      notification.message?.toLowerCase().includes('odyssey') ||
      notification.link?.includes('odyssey')
    );
  } else if (activeFilter.value === 'consultation') {
    // Filter for consultation related notifications
    filtered = notifications.value.filter(notification =>
      notification.title?.toLowerCase().includes('consultation') ||
      notification.title?.toLowerCase().includes('appointment') ||
      notification.title?.toLowerCase().includes('booking') ||
      notification.message?.toLowerCase().includes('consultation') ||
      notification.link?.includes('consultation')
    );
  } else {
    // Show all notifications
    filtered = notifications.value;
  }
  
  // Calculate total pages based on filtered results
  totalPages.value = Math.ceil(filtered.length / pageSize);
  
  // Return paginated results
  const startIndex = (currentPage.value - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return filtered.slice(startIndex, endIndex);
});

const hasUnread = computed(() => {
  return notifications.value.some(notification => !notification.read);
});

// Lifecycle hooks
onMounted(async () => {
  await fetchNotifications();
  
  // Set up polling for new notifications every minute
  const pollingInterval = setInterval(async () => {
    await fetchNotifications();
  }, 60000); // 60 seconds
  
  // Clean up interval on component unmount
  onUnmounted(() => {
    clearInterval(pollingInterval);
  });
});

// Functions
async function fetchNotifications() {
  try {
    loading.value = true;
    
    // Call API to get notifications using our service
    const response = await notificationApiService.getAll();
    
    if (response) {
      notifications.value = response.map(notification => ({
        ...notification,
        // Format dates if needed
        createdAt: new Date(notification.createdAt),
      }));
      
      // Calculate pagination
      totalPages.value = Math.ceil(notifications.value.length / pageSize);
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    notificationService.showError('Failed to load notifications');
    notifications.value = [];
  } finally {
    loading.value = false;
  }
}

async function markAsRead(notificationId) {
  try {
    // Call API to mark as read
    await notificationApiService.markAsRead(notificationId);
    
    // Update local state
    const notification = notifications.value.find(n => n._id === notificationId);
    if (notification) {
      notification.read = true;
    }
    
    notificationService.showSuccess('Notification marked as read');
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    notificationService.showError('Failed to update notification status');
  }
}

// markAllAsRead function removed

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function formatDate(date) {
  if (!date) return '';
  
  const now = new Date();
  const diff = now - date;
  const day = 24 * 60 * 60 * 1000;
  
  // Format based on how recent the notification is
  if (diff < 60 * 1000) {
    return 'Just now';
  } else if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < day) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    // Otherwise, return an actual date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

async function refreshNotifications() {
  await fetchNotifications();
}
</script>

<style scoped>
.bg-primary {
  background-color: #3B82F6;
}
.bg-primary-light {
  background-color: #EFF6FF;
}
.text-primary {
  color: #3B82F6;
}
.hover\:bg-primary-dark:hover {
  background-color: #2563EB;
}

/* Animation for unread indicator */
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

.student-notifications {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}
</style> 