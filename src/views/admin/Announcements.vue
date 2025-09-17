<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-10.105c.118-.38.245-.754.38-1.125m0 9.18v-2.25A23.91 23.91 0 0018.795 12m.38 1.125v1.875a3.75 3.75 0 01-3.75 3.75h-1.875m1.014-8.855c-.118-.38-.245-.754-.38-1.125m.38 1.125A23.91 23.91 0 0118.795 12M9.75 17.25a4.5 4.5 0 01-1.875-8.746" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-normal text-gray-800">Announcements</h1>
              <p class="text-gray-500 font-normal">Manage and publish announcements</p>
            </div>
          </div>
          <button 
            @click="openAddModal" 
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-normal text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Announcement
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <select
              v-model="filters.targetAudience"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              @change="fetchAnnouncements"
            >
              <option value="">All</option>
              <option value="all">Everyone</option>
              <option value="advisers">Advisers Only</option>
              <option value="students">Students Only</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search announcements"
                class="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                @input="handleSearchInput"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Announcements List -->
      <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex justify-center">
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span class="text-gray-500">Loading announcements...</span>
        </div>
      </div>

      <div v-else-if="announcements.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-10.105c.118-.38.245-.754.38-1.125m0 9.18v-2.25A23.91 23.91 0 0018.795 12m.38 1.125v1.875a3.75 3.75 0 01-3.75 3.75h-1.875m1.014-8.855c-.118-.38-.245-.754-.38-1.125m.38 1.125A23.91 23.91 0 0118.795 12M9.75 17.25a4.5 4.5 0 01-1.875-8.746" />
          </svg>
        </div>
        <h3 class="text-lg font-normal text-gray-800 mb-1">No Announcements Found</h3>
        <p class="text-gray-500 font-normal">No announcements match your current filters</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="(announcement, index) in announcements" :key="announcement._id" class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6">
          <!-- Author Header with Avatar -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
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
            
            <!-- Action Buttons -->
            <div class="flex space-x-2">
              <button 
                @click="editAnnouncement(announcement)" 
                class="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                title="Edit announcement"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button 
                @click="deleteAnnouncement(announcement)" 
                class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete announcement"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
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

          <!-- Target Classes Info -->
          <div v-if="announcement.targetAudience === 'students' && announcement.targetClasses && announcement.targetClasses.length > 0" class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Target Classes:</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="classItem in announcement.targetClasses" 
                :key="classItem._id"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ classItem.yearLevel }} Year - {{ classItem.section }} ({{ classItem.major }})
              </span>
            </div>
          </div>

          <!-- Stats Footer -->
          <div class="flex items-center justify-between pt-3 border-t border-gray-100">
            <div class="flex items-center space-x-4 text-gray-500">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">{{ announcement.likeCount || 0 }} likes</span>
              </div>
            </div>
            <span class="text-xs text-gray-400">
              {{ formatTimeAgo(announcement.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="announcements.length > 0" class="mt-6 flex justify-between items-center">
      <div>
        <p class="text-sm text-gray-700">
          Showing <span class="font-medium">{{ pagination.from }}</span> to <span class="font-medium">{{ pagination.to }}</span> of <span class="font-medium">{{ pagination.total }}</span> announcements
        </p>
      </div>
      <div class="flex space-x-2">
        <button 
          @click="changePage(pagination.currentPage - 1)" 
          :disabled="pagination.currentPage === 1"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button 
          @click="changePage(pagination.currentPage + 1)" 
          :disabled="pagination.currentPage === pagination.totalPages"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Modals -->
    <AnnouncementModal
      :is-open="isAnnouncementModalOpen"
      :announcement="selectedAnnouncement"
      @close="closeAnnouncementModal"
      @saved="handleAnnouncementSaved"
    />

      <DeleteConfirmModal
        :is-open="isDeleteModalOpen"
        title="Delete Announcement"
        :item-name="selectedAnnouncement?.title"
        item-type="announcement"
        @close="closeDeleteModal"
        @confirm="confirmDelete"
      />

      <!-- Image View Modal -->
      <ImageViewModal
        :is-open="imageModalOpen"
        :image-url="selectedImageUrl"
        :image-alt="selectedImageAlt"
        @close="closeImageModal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { announcementService } from '../../services/announcementService';
import { notificationService } from '../../services/notificationService';
import AnnouncementModal from '../../components/modals/AnnouncementModal.vue'
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal.vue'
import ImageViewModal from '../../components/modals/ImageViewModal.vue'

// State
const announcements = ref([]);
const allAnnouncements = ref([]);
const loading = ref(false);
const selectedAnnouncement = ref(null);
const isAnnouncementModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

// Image modal state
const imageModalOpen = ref(false);
const selectedImageUrl = ref('');
const selectedImageAlt = ref('');

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 10,
  total: 0,
  from: 0,
  to: 0,
  totalPages: 0
});

// Filters
const filters = reactive({
  targetAudience: '',
  search: ''
});

// Search input debounce
let searchTimeout = null;

onMounted(() => {
  fetchAnnouncements()
})

function handleSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFiltersAndPagination()
  }, 300)
}

async function fetchAnnouncements() {
  try {
    loading.value = true
    console.log('Fetching announcements...')
    const response = await announcementService.getAll()
    console.log('Raw API response:', response)
    
    // Handle different response formats
    if (response && response.data) {
      allAnnouncements.value = response.data
      console.log(`Loaded ${allAnnouncements.value.length} announcements from response.data`)
    } else if (Array.isArray(response)) {
      // If getAll returns the array directly
      allAnnouncements.value = response
      console.log(`Loaded ${allAnnouncements.value.length} announcements from array`)
    } else {
      console.error('Unexpected response format from announcementService.getAll()', response)
      allAnnouncements.value = []
    }
    
    console.log('All announcements:', allAnnouncements.value)
    
    // Apply filters and pagination
    applyFiltersAndPagination()
    console.log('Filtered announcements:', announcements.value)
  } catch (error) {
    console.error('Failed to fetch announcements:', error)
    notificationService.showError('Failed to load announcements. Please try again.')
    allAnnouncements.value = []
    announcements.value = []
  } finally {
    loading.value = false
  }
}

function applyFiltersAndPagination() {
  // Filter announcements based on selection
  const filtered = filterAnnouncements(allAnnouncements.value)
  
  // Calculate pagination
  const page = pagination.value.currentPage
  const perPage = pagination.value.perPage
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  
  // Make sure current page isn't out of bounds
  if (page > totalPages) {
    pagination.value.currentPage = totalPages
  }
  
  const from = total === 0 ? 0 : (pagination.value.currentPage - 1) * perPage + 1
  const to = Math.min(pagination.value.currentPage * perPage, total)
  
  // Update pagination state
  pagination.value = {
    ...pagination.value,
    total,
    from,
    to,
    totalPages
  }
  
  // Get current page data
  announcements.value = filtered.slice(from - 1, to)
}

function filterAnnouncements(announcementsData) {
  return announcementsData.filter(announcement => {
    // Filter by target audience
    if (filters.targetAudience && announcement.targetAudience !== filters.targetAudience) {
      return false
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const title = announcement.title?.toLowerCase() || ''
      const content = announcement.content?.toLowerCase() || ''
      
      if (!title.includes(searchTerm) && !content.includes(searchTerm)) {
        return false
      }
    }
    
    return true
  })
}

function changePage(page) {
  pagination.value.currentPage = page
  applyFiltersAndPagination()
}

function formatDate(date) {
  if (!date) return 'Unknown date'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getAudienceLabel(targetAudience) {
  switch (targetAudience) {
    case 'all': return 'Everyone'
    case 'advisers': return 'Advisers Only'
    case 'students': return 'Students Only'
    default: return 'Unknown'
  }
}

function getAudienceBadgeClass(targetAudience) {
  switch (targetAudience) {
    case 'all': return 'bg-blue-100 text-blue-800'
    case 'advisers': return 'bg-green-100 text-green-800'
    case 'students': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Modal functions
function openAddModal() {
  selectedAnnouncement.value = null
  isAnnouncementModalOpen.value = true
}

function editAnnouncement(announcement) {
  selectedAnnouncement.value = announcement
  isAnnouncementModalOpen.value = true
}

function closeAnnouncementModal() {
  isAnnouncementModalOpen.value = false
  selectedAnnouncement.value = null
}

function handleAnnouncementSaved() {
  fetchAnnouncements()
  notificationService.showSuccess(
    selectedAnnouncement.value 
      ? 'Announcement updated successfully' 
      : 'Announcement created successfully'
  )
}

function deleteAnnouncement(announcement) {
  selectedAnnouncement.value = announcement
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
  selectedAnnouncement.value = null
}

async function confirmDelete() {
  try {
    await announcementService.delete(selectedAnnouncement.value._id)
    notificationService.showSuccess('Announcement deleted successfully')
    fetchAnnouncements()
    closeDeleteModal()
  } catch (error) {
    console.error('Error deleting announcement:', error)
    notificationService.showError('Failed to delete announcement. Please try again.')
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

function getAuthorName(author) {
  if (!author) return 'Unknown'
  if (typeof author === 'string') return 'Administrator'
  
  return `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Administrator'
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