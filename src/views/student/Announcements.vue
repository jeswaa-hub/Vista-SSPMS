<template>
  <div class="min-h-screen p-6" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">Announcements</h1>
            <p class="text-gray-500 mt-1 font-normal">Stay updated with important announcements from the administration</p>
          </div>

        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span class="text-sm text-gray-600">Loading announcements...</span>
        </div>
      </div>
    
    <div v-else>
      <!-- Filter controls -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <div>
              <label for="filter-date" class="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
              <select 
                id="filter-date"
                v-model="filters.date"
                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
              </select>
            </div>
            
            <div>
              <label for="filter-audience" class="block text-sm font-medium text-gray-700 mb-1">Audience Type</label>
              <select 
                id="filter-audience"
                v-model="filters.audience"
                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Types</option>
                <option value="all">Everyone</option>
                <option value="students">Students Only</option>
              </select>
            </div>
          </div>
          
          <div class="relative">
            <input
              type="text"
              v-model="filters.search"
              placeholder="Search announcements..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Announcements List -->
      <div v-if="filteredAnnouncements.length === 0" class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <svg class="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">No announcements found</h3>
        <p class="text-gray-500">There are no announcements matching your filters.</p>
      </div>
      
      <div v-else class="space-y-6">
        <div 
          v-for="announcement in filteredAnnouncements" 
          :key="announcement._id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div class="p-6">
            <!-- Author Header with Avatar -->
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {{ getAuthorInitials(announcement.author) }}
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <h4 class="font-semibold text-gray-900">{{ getAuthorName(announcement.author) }}</h4>
                  <span v-if="announcement.isPinned" 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    📌 Pinned
                  </span>
                </div>
                <div class="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{{ formatDate(announcement.createdAt) }}</span>
                  <span>•</span>
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="getAudienceBadgeClass(announcement.targetAudience)"
                  >
                    {{ getAudienceLabel(announcement.targetAudience) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Announcement Content -->
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ announcement.title }}</h3>
              <p class="text-gray-700 leading-relaxed">{{ announcement.content }}</p>
            </div>

            <!-- Announcement Image -->
            <div v-if="announcement.image" class="mb-4">
              <img 
                :src="getImageUrl(announcement.image)" 
                :alt="announcement.title"
                class="w-full h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                style="max-height: 400px; object-fit: cover;"
                @click="openImageModal(getImageUrl(announcement.image), announcement.title)"
              />
            </div>

            <!-- Like Button -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
              <button 
                @click="toggleLike(announcement)"
                class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-50"
                :class="announcement.isLiked ? 'text-red-500' : 'text-gray-500'"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium">{{ announcement.likeCount || 0 }}</span>
              </button>
              <span class="text-xs text-gray-400">
                {{ formatTimeAgo(announcement.createdAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Image View Modal -->
    <ImageViewModal
      :is-open="imageModalOpen"
      :image-url="selectedImageUrl"
      :image-alt="selectedImageAlt"
      @close="closeImageModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { notificationService } from '../../services/notificationService';
import { announcementService } from '../../services/announcementService';
import { useAuthStore } from '../../stores/authStore';
import ImageViewModal from '../../components/modals/ImageViewModal.vue';

// State
const loading = ref(true);
const announcements = ref([]);

// Image modal state
const imageModalOpen = ref(false);
const selectedImageUrl = ref('');
const selectedImageAlt = ref('');

// Filters
const filters = ref({
  audience: '',
  date: '',
  search: ''
});

// Load announcements
onMounted(async () => {
  try {
    loading.value = true;
    
    // Fetch real announcements from API
    // The API automatically filters for 'all' and 'students' targetAudience
    const response = await announcementService.getAll();
    
    // Handle different response formats
    if (response && Array.isArray(response)) {
      announcements.value = response;
    } else if (response && response.data && Array.isArray(response.data)) {
      announcements.value = response.data;
    } else {
      console.error('Unexpected response format:', response);
      announcements.value = [];
    }
    
    console.log(`Loaded ${announcements.value.length} announcements for student`);
  } catch (error) {
    console.error('Failed to load announcements:', error);
    notificationService.showError('Failed to load announcements');
    announcements.value = [];
  } finally {
    loading.value = false;
  }
});

// Computed filtered announcements
const filteredAnnouncements = computed(() => {
  let filtered = [...announcements.value];
  
  // Filter by audience
  if (filters.value.audience) {
    filtered = filtered.filter(a => a.targetAudience === filters.value.audience);
  }
  
  // Filter by date
  if (filters.value.date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    filtered = filtered.filter(a => {
      const announcementDate = new Date(a.createdAt);
      
      if (filters.value.date === 'today') {
        return announcementDate >= today;
      } else if (filters.value.date === 'this-week') {
        return announcementDate >= thisWeekStart;
      } else if (filters.value.date === 'this-month') {
        return announcementDate >= thisMonthStart;
      }
      
      return true;
    });
  }
  
  // Filter by search
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase();
    filtered = filtered.filter(a => 
      a.title.toLowerCase().includes(searchTerm) || 
      a.content.toLowerCase().includes(searchTerm)
    );
  }
  
  // Sort by pinned status first, then by date (newest first)
  return filtered.sort((a, b) => {
    // First by pinned status
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then by date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
});

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function getAuthorName(author) {
  if (!author) return 'Unknown';
  if (typeof author === 'string') return 'Administrator';
  
  return `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Administrator';
}

function getAudienceLabel(targetAudience) {
  switch (targetAudience) {
    case 'all': return 'Everyone';
    case 'students': return 'Students Only';
    default: return 'General';
  }
}

function getAudienceBadgeClass(targetAudience) {
  switch (targetAudience) {
    case 'all': return 'bg-blue-100 text-blue-800';
    case 'students': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getImageUrl(filename) {
  return announcementService.getImageUrl(filename)
}

function getAuthorInitials(author) {
  if (!author) return 'A'
  if (typeof author === 'string') return 'A'
  
  const firstName = author.firstName || ''
  const lastName = author.lastName || ''
  
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'A'
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  } else {
    return formatDate(dateString)
  }
}

async function toggleLike(announcement) {
  try {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      notificationService.showError('Please log in to like announcements')
      return
    }

    const result = await announcementService.like(announcement._id)
    
    // Update the announcement in the local state
    announcement.isLiked = result.isLiked
    announcement.likeCount = result.likeCount
    
  } catch (error) {
    console.error('Error toggling like:', error)
    notificationService.showError('Failed to update like. Please try again.')
  }
}

function openImageModal(imageUrl, imageAlt) {
  selectedImageUrl.value = imageUrl
  selectedImageAlt.value = imageAlt
  imageModalOpen.value = true
}

function closeImageModal() {
  imageModalOpen.value = false
  selectedImageUrl.value = ''
  selectedImageAlt.value = ''
}
</script>

<style scoped>
.bg-primary {
  background-color: #3B82F6;
}
.text-primary {
  color: #3B82F6;
}
</style> 