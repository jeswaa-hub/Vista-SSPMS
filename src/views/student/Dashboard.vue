<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-sm p-6 text-white">
      <div class="flex items-center justify-between">
  <div>
          <h1 class="text-2xl font-bold">Welcome back, {{ userName }}!</h1>
          <p class="text-blue-100 mt-1">Here's your academic overview and quick access to important features</p>
        </div>
        <div class="text-right">
          <div class="text-sm text-blue-100">Student ID</div>
          <div class="text-lg font-semibold">{{ userIdNumber }}</div>
        </div>
      </div>
    </div>
    
    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Active Consultation -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
        <div class="flex items-center">
          <div class="bg-green-100 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ dashboardStats.activeConsultations }}</h3>
            <p class="text-sm text-gray-600">Active Consultations</p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/student/consultations" class="text-green-600 hover:text-green-700 text-sm font-medium">
            View Consultations →
          </router-link>
        </div>
      </div>
      
      <!-- SSP Sessions -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div class="flex items-center">
          <div class="bg-blue-100 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ dashboardStats.totalSSPSessions }}</h3>
            <p class="text-sm text-gray-600">Completed SSP Sessions</p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/student/ssp" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View SSP →
          </router-link>
          </div>
        </div>
        
      <!-- M&M Submissions -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
        <div class="flex items-center">
          <div class="bg-purple-100 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ dashboardStats.currentMMPeriod }}</h3>
            <p class="text-sm text-gray-600">Current M&M Period</p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/student/surveys" class="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Submit M&M →
          </router-link>
      </div>
    </div>
    
      <!-- Notifications -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
        <div class="flex items-center">
          <div class="bg-orange-100 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ dashboardStats.unreadNotifications }}</h3>
            <p class="text-sm text-gray-600">Unread Notifications</p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/student/notifications" class="text-orange-600 hover:text-orange-700 text-sm font-medium">
            View Notifications →
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- SSP Session Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Current Progress -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">SSP Progress</h3>
        <div class="text-center">
          <div class="relative w-24 h-24 mx-auto mb-4">
            <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <!-- Background circle -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                stroke-width="8"
              />
              <!-- Progress circle -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3b82f6"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="251.2"
                :stroke-dashoffset="251.2 - (251.2 * sspOverview.currentProgress / 100)"
                class="transition-all duration-300"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xl font-bold text-gray-900">{{ sspOverview.currentProgress }}%</span>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-2">{{ dashboardStats.completedSSPSessions }} of {{ dashboardStats.totalSSPSessions }} sessions completed</p>
          <p class="text-xs text-blue-600 font-medium">{{ sspOverview.currentSemester }}</p>
        </div>
      </div>
      
      <!-- Next Session -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Next Session</h3>
        <div v-if="sspOverview.nextSession" class="text-center">
          <div class="bg-green-100 p-4 rounded-lg mb-3">
            <div class="text-2xl font-bold text-green-800 mb-1">Day {{ sspOverview.nextSession.day }}</div>
            <p class="text-sm text-green-600 font-medium">{{ sspOverview.nextSession.title }}</p>
          </div>
          <router-link to="/student/ssp" class="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
            View Session Details
          </router-link>
        </div>
        <div v-else class="text-center">
          <div class="bg-gray-100 p-4 rounded-lg mb-3">
            <div class="text-2xl font-bold text-gray-500 mb-1">🎉</div>
            <p class="text-sm text-gray-600 font-medium">All sessions completed!</p>
          </div>
          <router-link to="/student/ssp" class="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Sessions
          </router-link>
        </div>
      </div>
      
      <!-- Recent Completed -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Completed</h3>
        <div v-if="sspOverview.recentCompleted.length > 0" class="space-y-3">
          <div v-for="session in sspOverview.recentCompleted" :key="session.day" class="flex items-center space-x-3">
            <div class="bg-blue-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">Day {{ session.day }}</p>
              <p class="text-xs text-gray-500">{{ session.title }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(session.completedAt) }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center">
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-sm text-gray-600">No completed sessions yet</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activities & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Activities -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div class="space-y-4">
          <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div :class="getActivityIconClass(activity.type)" class="w-8 h-8 rounded-full flex items-center justify-center">
                <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
              </div>
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-900">{{ activity.description }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(activity.date) }}</p>
            </div>
      </div>
      
          <div v-if="recentActivities.length === 0" class="text-center py-4">
            <p class="text-gray-500 text-sm">No recent activities</p>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 gap-4">
          <router-link 
            to="/student/consultations" 
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="text-sm font-medium text-gray-900">Book Consultation</span>
          </router-link>
          
          <router-link 
            to="/student/ssp" 
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-sm font-medium text-gray-900">View SSP Progress</span>
          </router-link>
          
          <router-link 
            to="/student/surveys" 
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-sm font-medium text-gray-900">Submit M&M</span>
          </router-link>
          
          <router-link 
            to="/student/odyssey-plan" 
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="text-sm font-medium text-gray-900">Odyssey Plan</span>
          </router-link>
        </div>
      </div>
              </div>
    
    <!-- Latest Announcements -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Latest Announcements</h3>
        <router-link to="/student/announcements" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All →
        </router-link>
            </div>
      
      <div class="space-y-4">
        <div v-for="announcement in latestAnnouncements" :key="announcement._id" class="border-l-4 border-blue-500 pl-4">
          <h4 class="font-medium text-gray-900">{{ announcement.title }}</h4>
          <p class="text-sm text-gray-600 mt-1" v-html="truncateText(announcement.content, 150)"></p>
          <p class="text-xs text-gray-500 mt-2">{{ formatDate(announcement.createdAt) }}</p>
              </div>
        
        <div v-if="latestAnnouncements.length === 0" class="text-center py-4">
          <p class="text-gray-500 text-sm">No announcements available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { notificationService } from '../../services/notificationService'
import { sessionService } from '../../services/sessionService'
import { studentService } from '../../services/studentService'
import { mmService } from '../../services/midtermFinalsService'
import api from '../../services/api'

const authStore = useAuthStore()

// Reactive data
const dashboardStats = ref({
  activeConsultations: 0,
  completedSSPSessions: 0,
  totalSSPSessions: 0,
  unreadNotifications: 0,
  currentMMPeriod: 'P1', // P1, P2, or P3
  mmSubmissions: []
})

const recentActivities = ref([])
const latestAnnouncements = ref([])
const currentSSPSession = ref(null)
const sspOverview = ref({
  currentProgress: 0,
  nextSession: null,
  currentSemester: '1st Semester',
  recentCompleted: []
})

// Computed
const userName = computed(() => {
  if (!authStore.user) return 'Student'
  return `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`.trim()
})

const userIdNumber = computed(() => {
  return authStore.user?.idNumber || 'N/A'
})

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  
  return date.toLocaleDateString()
}

const truncateText = (text, length) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const getActivityIconClass = (type) => {
  switch (type) {
    case 'consultation':
      return 'bg-green-100 text-green-600'
    case 'ssp':
      return 'bg-blue-100 text-blue-600'
    case 'mm':
      return 'bg-purple-100 text-purple-600'
    case 'odyssey':
      return 'bg-indigo-100 text-indigo-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const getActivityIcon = (type) => {
  // Return appropriate icon component based on type
  return 'svg' // Placeholder - in real implementation, return specific icon components
}

const loadDashboardStats = async () => {
  try {
    // Load consultation stats
    const consultationResponse = await api.get('/consultations/my-bookings')
    const consultations = consultationResponse.data || []
    dashboardStats.value.activeConsultations = consultations.filter(
      booking => booking.status === 'Pending' || booking.status === 'Confirmed'
    ).length

    // Load SSP session stats and overview using proper service
    try {
      const studentResponse = await studentService.getStudentDetails()
      const student = studentResponse.data
      
      if (student && student.class) {
        console.log('Loading SSP dashboard data for student:', student._id, 'class:', student.class._id)
        
        // Use the new dedicated SSP dashboard function for proper progress calculation
        const sspDashboard = await sessionService.getSSPDashboardData(student._id, student.class._id)
        
        if (sspDashboard) {
          sspOverview.value = sspDashboard
          dashboardStats.value.completedSSPSessions = sspDashboard.completedSessions || 0
          dashboardStats.value.totalSSPSessions = sspDashboard.totalSessions || 0
          
          console.log('SSP Dashboard Data loaded:', sspDashboard)
        }
      } else {
        dashboardStats.value.completedSSPSessions = 0
        dashboardStats.value.totalSSPSessions = 0
      }
    } catch (sspError) {
      console.log('SSP sessions not available:', sspError)
      dashboardStats.value.completedSSPSessions = 0
      dashboardStats.value.totalSSPSessions = 0
    }

    // Load M&M submissions and current semester info
    try {
      // First get the current class semester to ensure we have the latest info
      const semesterResponse = await mmService.getCurrentClassSemester()
      console.log('Current M&M semester response:', semesterResponse)
      
      if (semesterResponse && semesterResponse.semester) {
        dashboardStats.value.currentMMPeriod = semesterResponse.semester === '1st' ? 'P1' : 'P2'
        console.log('Updated M&M period to:', dashboardStats.value.currentMMPeriod, 'based on semester:', semesterResponse.semester)
      }
      
      // Get M&M completion status
      const mmResponse = await mmService.getMySubmissions()
      const submissions = mmResponse.data || []
      
      dashboardStats.value.mmSubmissions = submissions
      console.log('M&M submissions loaded:', submissions.length, 'submissions')
      
    } catch (mmError) {
      console.log('M&M data not available:', mmError)
      dashboardStats.value.currentMMPeriod = 'P1'
      dashboardStats.value.mmSubmissions = []
    }

    // Load notification count
    try {
      const notificationResponse = await notificationService.getUnreadCount()
      dashboardStats.value.unreadNotifications = notificationResponse || 0
    } catch (notifError) {
      console.log('Notifications not available:', notifError)
      dashboardStats.value.unreadNotifications = 0
    }

    console.log('Dashboard stats loaded:', dashboardStats.value)
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
  }
}

const loadLatestAnnouncements = async () => {
  try {
    const response = await api.get('/announcements')
    // The API returns the announcements directly as an array
    latestAnnouncements.value = (response.data || []).slice(0, 3)
  } catch (error) {
    console.error('Error loading announcements:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await loadDashboardStats()
  await loadLatestAnnouncements()
})
</script>

<style scoped>
/* Additional styling if needed */
</style> 