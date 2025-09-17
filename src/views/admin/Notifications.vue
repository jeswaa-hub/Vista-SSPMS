<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">


      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
            <select
              v-model="filters.yearLevel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              @change="applyFilters"
            >
              <option value="">All Years</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              v-model="filters.section"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              @change="applyFilters"
            >
              <option value="">All Sections</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Major</label>
            <select
              v-model="filters.major"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              @change="applyFilters"
            >
              <option value="">All Majors</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
              <option value="BSIS">BSIS</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Order</label>
            <select
              v-model="filters.dateOrder"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              @change="applyFilters"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
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
                placeholder="Search requests..."
                class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                @input="handleSearchInput"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-800 mb-4">Recent Dropping Requests</h2>
          
          <div v-if="loading" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span class="ml-3 text-gray-500">Loading dropping requests...</span>
          </div>
          
          <div v-else-if="filteredNotifications.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No dropping requests</h3>
            <p class="text-gray-500">There are no dropping requests at this time.</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="notification in filteredNotifications" 
              :key="notification._id"
              :class="[
                'border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md',
                notification.read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'
              ]"
              @click="openNotification(notification)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <div :class="[
                      'flex-shrink-0 w-2 h-2 rounded-full',
                      getNotificationColor(notification.type)
                    ]"></div>
                    <h3 :class="[
                      'text-sm font-medium',
                      notification.read ? 'text-gray-900' : 'text-blue-900'
                    ]">
                      {{ notification.title }}
                    </h3>
                  </div>
                  
                  <p :class="[
                    'text-sm mb-2',
                    notification.read ? 'text-gray-600' : 'text-blue-800'
                  ]">
                    {{ notification.message }}
                  </p>
                  
                  <div v-if="notification.reason" class="mb-2 p-2 bg-orange-50 rounded text-xs">
                    <span class="font-medium text-orange-800">Reason:</span>
                    <span class="text-orange-700 ml-1">{{ notification.reason }}</span>
                  </div>
                  
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{{ formatDate(notification.createdAt) }}</span>
                    <span v-if="notification.requesterInfo">
                      From: {{ notification.requesterInfo.name }}
                    </span>
                    <span v-if="notification.studentInfo">
                      Student: {{ notification.studentInfo.name }}
                    </span>
                    <span v-if="notification.classInfo">
                      Class: {{ notification.classInfo.yearLevel }} {{ notification.classInfo.section }} - {{ notification.classInfo.major }}
                    </span>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <div v-if="!notification.read" class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <button
                    @click.stop="toggleRead(notification)"
                    class="text-gray-400 hover:text-gray-600 p-1"
                    :title="notification.read ? 'Mark as unread' : 'Mark as read'"
                  >
                    <svg v-if="notification.read" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredNotifications.length > 0" class="px-6 py-3 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{{ pagination.from }}</span> to <span class="font-medium">{{ pagination.to }}</span> of <span class="font-medium">{{ pagination.total }}</span> dropping requests
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
        </div>
      </div>
    </div>

    <!-- Notification Detail Modal -->
    <NotificationModal
      :is-open="showDetailModal"
      :notification="selectedNotification"
      @close="closeDetailModal"
      @approve="approveDropRequest"
      @reject="rejectDropRequest"
      @markRead="markAsRead"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { notificationService } from '../../services/notificationService'
import api from '../../services/api'
import NotificationModal from '../../components/modals/NotificationModal.vue'

const router = useRouter()

// State
const notifications = ref([])
const allNotifications = ref([])
const loading = ref(false)
const showDetailModal = ref(false)
const selectedNotification = ref(null)

// Filters
const filters = reactive({
  yearLevel: '',
  section: '',
  major: '',
  dateOrder: 'newest',
  search: ''
})

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 5,
  total: 0,
  from: 0,
  to: 0,
  totalPages: 0
})

// Search debounce
let searchTimeout = null

// Computed
const unreadCount = computed(() => {
  return allNotifications.value.filter(n => !n.read).length
})

const filteredNotifications = computed(() => {
  if (!Array.isArray(allNotifications.value)) {
    console.log('allNotifications is not an array:', allNotifications.value)
    return []
  }

  let filtered = allNotifications.value

  // Apply filters
  if (filters.yearLevel) {
    filtered = filtered.filter(n => 
      n.classInfo && n.classInfo.yearLevel && n.classInfo.yearLevel.toString() === filters.yearLevel
    )
  }
  if (filters.section) {
    filtered = filtered.filter(n => 
      n.classInfo && n.classInfo.section === filters.section
    )
  }
  if (filters.major) {
    filtered = filtered.filter(n => 
      n.classInfo && n.classInfo.major === filters.major
    )
  }
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(n => 
      (n.title && n.title.toLowerCase().includes(searchTerm)) ||
      (n.message && n.message.toLowerCase().includes(searchTerm)) ||
      (n.studentInfo && n.studentInfo.name && n.studentInfo.name.toLowerCase().includes(searchTerm)) ||
      (n.requesterInfo && n.requesterInfo.name && n.requesterInfo.name.toLowerCase().includes(searchTerm))
    )
  }

  // Apply date ordering
  filtered.sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return filters.dateOrder === 'newest' ? dateB - dateA : dateA - dateB
  })

  console.log('Filtered notifications:', filtered.length, 'from total:', allNotifications.value.length)

  // Apply pagination
  const page = pagination.value.currentPage
  const perPage = pagination.value.perPage
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  // Update pagination
  pagination.value = {
    ...pagination.value,
    total,
    totalPages,
    from: total === 0 ? 0 : (page - 1) * perPage + 1,
    to: Math.min(page * perPage, total)
  }

  // Return paginated results
  return filtered.slice((page - 1) * perPage, page * perPage)
})

// Methods
onMounted(() => {
  loadNotifications()
})

async function loadNotifications() {
  try {
    loading.value = true
    const response = await api.get('/admin/notifications')
    console.log('Notifications response:', response.data) // Debug log
    
    if (response.data.success) {
      allNotifications.value = response.data.data || []
    } else {
      allNotifications.value = []
    }
  } catch (error) {
    console.error('Error loading notifications:', error)
    notificationService.showError('Failed to load notifications')
    allNotifications.value = []
  } finally {
    loading.value = false
  }
}

function handleSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.currentPage = 1
  }, 300)
}

function applyFilters() {
  pagination.value.currentPage = 1
}

function changePage(page) {
  pagination.value.currentPage = page
}

function openNotification(notification) {
  selectedNotification.value = notification
  
  // For drop requests, redirect to students page with the specific student
  if (notification.type === 'drop_request' && notification.studentInfo) {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification)
    }
    
    // Navigate to students page with student ID as query parameter
    router.push({
      path: '/admin/students',
      query: { viewStudent: notification.studentInfo.id }
    })
    return
  }
  
  // For other notifications, show the modal
  showDetailModal.value = true
  
  if (!notification.read) {
    markAsRead(notification)
  }
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedNotification.value = null
}

async function toggleRead(notification) {
  try {
    const response = await api.put(`/admin/notifications/${notification._id}/read`, {
      read: !notification.read
    })
    
    if (response.data.success) {
      notification.read = !notification.read
    }
  } catch (error) {
    console.error('Error updating notification:', error)
    notificationService.showError('Failed to update notification')
  }
}

async function markAsRead(notification) {
  if (notification.read) return
  
  try {
    const response = await api.put(`/admin/notifications/${notification._id}/read`, {
      read: true
    })
    
    if (response.data.success) {
      notification.read = true
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

async function markAllAsRead() {
  try {
    const response = await api.put('/admin/notifications/mark-all-read')
    
    if (response.data.success) {
      allNotifications.value.forEach(n => n.read = true)
      notificationService.showSuccess('All notifications marked as read')
    }
  } catch (error) {
    console.error('Error marking all as read:', error)
    notificationService.showError('Failed to mark all notifications as read')
  }
}

async function approveDropRequest(notification) {
  try {
    const response = await api.put(`/admin/drop-requests/${notification.dropRequestId}/approve`)
    
    if (response.data.success) {
      notificationService.showSuccess('Drop request approved')
      notification.status = 'approved'
      closeDetailModal()
      await loadNotifications()
    }
  } catch (error) {
    console.error('Error approving drop request:', error)
    notificationService.showError('Failed to approve drop request')
  }
}

async function rejectDropRequest(notification, reason) {
  try {
    const response = await api.put(`/admin/drop-requests/${notification.dropRequestId}/reject`, {
      reason
    })
    
    if (response.data.success) {
      notificationService.showSuccess('Drop request rejected')
      notification.status = 'rejected'
      closeDetailModal()
      await loadNotifications()
    }
  } catch (error) {
    console.error('Error rejecting drop request:', error)
    notificationService.showError('Failed to reject drop request')
  }
}

function formatDate(date) {
  if (!date) return 'Unknown date'
  const now = new Date()
  const notificationDate = new Date(date)
  const diffInHours = (now - notificationDate) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`
  } else if (diffInHours < 48) {
    return 'Yesterday'
  } else {
    return notificationDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

function getNotificationColor(type) {
  switch (type) {
    case 'drop_request': return 'bg-orange-500'
    case 'system': return 'bg-blue-500'
    case 'info': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

</script>

<style scoped>
/* Custom styles for the notifications page */
.notification-item {
  transition: all 0.2s ease-in-out;
}

.notification-item:hover {
  transform: translateY(-1px);
}
</style>
