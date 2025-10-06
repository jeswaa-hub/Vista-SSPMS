<template>
  <div class="min-h-screen p-6" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-8">
      
      <!-- Main Dashboard Card - Clean Design -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
      <div class="flex items-center justify-between">
          <!-- Greeting Section -->
          <div class="flex-1">
            <h1 class="text-3xl font-light text-gray-800">Good {{ getTimeGreeting() }}, {{ adviserNameWithSalutation }}</h1>
          <p class="text-gray-500 mt-2 font-light">Your student success overview</p>
    </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-4 gap-6">
            <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <div class="text-2xl font-semibold text-gray-800">{{ dashboardStats.totalStudents }}</div>
              <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Students</div>
        </div>
            <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <div class="text-2xl font-semibold text-gray-800">{{ dashboardStats.totalClasses }}</div>
              <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Classes</div>
          </div>
            <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <div class="text-2xl font-semibold text-gray-800">{{ dashboardStats.bookedConsultations }}</div>
              <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Booked</div>
        </div>
            <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <div class="text-2xl font-semibold text-gray-800">{{ dashboardStats.avgSSPCompletion }}%</div>
              <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">SSP</div>
      </div>
        </div>
          </div>
      </div>

      <!-- Class Selection Section -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-800">Select Class</h3>
          <div class="w-2 h-2 rounded-full bg-gray-400"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Select All Classes Option -->
          <div @click="selectAllClasses()"
               class="p-4 border border-gray-200 rounded-lg cursor-pointer transition-all hover:shadow-md"
               :class="!selectedClass ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-gray-800">All Classes</h4>
                <p class="text-sm text-gray-600">View data from all classes</p>
                <p class="text-xs text-gray-500 mt-1">{{ availableClasses.length }} classes - {{ getTotalStudents() }} students</p>
              </div>
            </div>
          </div>
          
          <!-- Individual Class Options -->
          <div v-for="classItem in availableClasses" :key="classItem.class._id" 
               @click="selectClass(classItem)"
               class="p-4 border border-gray-200 rounded-lg cursor-pointer transition-all hover:shadow-md"
               :class="selectedClass && selectedClass.class._id === classItem.class._id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'">
            <h4 class="font-medium text-gray-800">{{ getClassTitle(classItem) }}</h4>
            <p class="text-sm text-gray-600">{{ getClassYearAndMajor(classItem) }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ getClassSection(classItem) }} - {{ classItem.class?.students?.length || 0 }} students</p>
          </div>
      </div>
    </div>
    
      <!-- Analytics Section -->
      <div class="space-y-6">
        
        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- SSP Progress Rate Chart -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-medium text-gray-800">
                SSP Completion Status
                <span class="text-sm font-normal text-gray-600">
                  - {{ selectedClass ? getClassTitle(selectedClass) : 'All Classes' }}
                </span>
              </h3>
              <div class="flex items-center space-x-3">
                <select v-model="sspDateFilter" @change="loadSSPChart" class="text-sm border border-gray-200 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-300">
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
                <div class="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
            </div>
            <div class="h-80 relative">
              <canvas ref="sspProgressChart"></canvas>
              <div v-if="loading" class="flex items-center justify-center h-full absolute inset-0 bg-white bg-opacity-75">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              </div>
            </div>
          </div>

          <!-- Consultation Concerns Chart -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-medium text-gray-800">
                Consultations by Concern Type
                <span class="text-sm font-normal text-gray-600">
                  - {{ selectedClass ? getClassTitle(selectedClass) : 'All Classes' }}
                </span>
              </h3>
              <div class="flex items-center space-x-3">
                <select v-model="consultationDateFilter" @change="loadConsultationChart" class="text-sm border border-gray-200 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-300">
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
                <div class="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
            </div>
            <div class="h-80 relative">
              <canvas ref="consultationChart"></canvas>
              <div v-if="loading" class="flex items-center justify-center h-full absolute inset-0 bg-white bg-opacity-75">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              </div>
            </div>
          </div>
        </div>
        
      </div>

      <!-- Announcements Section -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
      <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      </div>
            <div>
              <h3 class="text-lg font-medium text-gray-800">Recent Announcements</h3>
              <p class="text-sm text-gray-600">Stay updated with the latest news</p>
            </div>
          </div>
          <router-link 
            to="/adviser/announcements" 
            class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            View All
            </router-link>
    </div>

        <div v-if="loading" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          
        <div v-else-if="announcements.length === 0" class="text-center py-8">
          <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
          <h3 class="text-sm font-medium text-gray-800 mb-1">No announcements yet</h3>
          <p class="text-xs text-gray-500">New announcements will appear here</p>
      </div>

        <div v-else class="space-y-4">
          <div v-for="announcement in announcements.slice(0, 3)" :key="announcement._id" 
               class="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
               @click="viewAnnouncement(announcement)">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-medium text-gray-800 mb-1">{{ announcement.title }}</h4>
                <p class="text-sm text-gray-600 line-clamp-2">{{ announcement.content }}</p>
                <div class="flex items-center space-x-4 mt-2">
                  <span class="text-xs text-gray-500">{{ formatDate(announcement.createdAt) }}</span>
                  <span v-if="announcement.priority === 'high'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    High Priority
                  </span>
                  <span v-else-if="announcement.priority === 'medium'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Medium Priority
                  </span>
        </div>
            </div>
              <div class="ml-4">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          </div>
          </div>
          </div>
          </div>
          
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { notificationService } from '../../services/notificationService'
import api from '../../services/api'
import Chart from 'chart.js/auto'

const authStore = useAuthStore()

// Reactive data
const loading = ref(true)
const classes = ref([])
const availableClasses = ref([])
const selectedClass = ref(null)
const consultations = ref([])
const announcements = ref([])
const sspProgressChart = ref(null)
const consultationChart = ref(null)
const sspDateFilter = ref('month')
const consultationDateFilter = ref('month')

// Chart instances
let sspProgressChartInstance = null
let consultationChartInstance = null

const dashboardStats = ref({
  totalStudents: 0,
  totalClasses: 0,
  bookedConsultations: 0,
  avgSSPCompletion: 0,
  studentsNeedingAttention: 0
})

// Computed
const adviserName = computed(() => {
  if (!authStore.user) return 'Adviser'
  return `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`.trim()
})

const adviserNameWithSalutation = computed(() => {
  if (!authStore.user) return 'Adviser'
  const salutation = authStore.user.salutation || ''
  const firstName = authStore.user.firstName || ''
  const lastName = authStore.user.lastName || ''
  return `${salutation} ${firstName} ${lastName}`.trim()
})

// Methods
const getTimeGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

const loadDashboardData = async () => {
  try {
    loading.value = true
    
    await Promise.all([
      loadAdviserClasses(),
      loadConsultationStats(),
      loadStudentProgress(),
      loadConsultations(),
      loadAnnouncements()
    ])
    
    // Only add sample data for announcements if no real data is available
    if (announcements.value.length === 0) {
      addSampleAnnouncementData()
    }
    
    // Load charts after data is ready
    await nextTick()
    await loadCharts()
    
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    notificationService.showError('Failed to load dashboard data')
  } finally {
    loading.value = false
  }
}


const addSampleAnnouncementData = () => {
  console.log('Adding sample announcement data for testing')
  announcements.value = [
    {
      _id: 'announce1',
      title: 'Important: Midterm Exam Schedule Update',
      content: 'Please be informed that the midterm examination schedule has been updated. All students should check their new exam dates and times.',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'announce2',
      title: 'New Student Support Services Available',
      content: 'We are pleased to announce new student support services including counseling and academic assistance programs.',
      priority: 'medium',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'announce3',
      title: 'Faculty Meeting Reminder',
      content: 'Don\'t forget about the monthly faculty meeting scheduled for next Friday at 2:00 PM in the main conference room.',
      priority: 'low',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}

const loadAdviserClasses = async () => {
  try {
    const response = await api.get('/advisers/my/classes')
    classes.value = response.data || []
    availableClasses.value = classes.value // Set available classes for selection
    
    console.log('Loaded classes data:', classes.value)
    console.log('Sample class structure:', classes.value[0])
    
    dashboardStats.value.totalClasses = classes.value.length
    dashboardStats.value.totalStudents = classes.value.reduce((sum, cls) => sum + (cls.class?.students?.length || 0), 0)
    
    // Set default selection to "All Classes" (null means all classes)
    if (!selectedClass.value && classes.value.length > 0) {
      selectedClass.value = null
    }
    
    // Calculate overall SSP completion
    await calculateSSPCompletion()
     
  } catch (error) {
    console.error('Error loading adviser classes:', error)
    classes.value = []
    availableClasses.value = []
  }
}

const selectClass = (classItem) => {
  selectedClass.value = classItem
  // Reload charts with selected class data
  loadCharts()
}

const selectAllClasses = () => {
  selectedClass.value = null // null means all classes
  // Reload charts with all classes data
  loadCharts()
}

const getTotalStudents = () => {
  return availableClasses.value.reduce((sum, classItem) => sum + (classItem.class?.students?.length || 0), 0)
}

const getClassTitle = (classItem) => {
  // Try different possible paths for subject name
  const subjectName = classItem.class?.sspSubject?.name || 
                     classItem.class?.firstSemester?.sspSubject?.name ||
                     classItem.class?.secondSemester?.sspSubject?.name ||
                     classItem.class?.subject?.name ||
                     'SSP Subject'
  return subjectName
}

const getClassYearAndMajor = (classItem) => {
  const year = classItem.class?.yearLevel || classItem.class?.year || 'N/A'
  const major = classItem.class?.major || 'N/A'
  return `${year} - ${major}`
}

const getClassSection = (classItem) => {
  return classItem.class?.section || 'N/A'
}

// Announcement helper functions
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const viewAnnouncement = (announcement) => {
  // Navigate to announcements page or show modal
  // For now, just log the announcement
  console.log('Viewing announcement:', announcement)
  // You can implement navigation or modal display here
}


const calculateSSPCompletion = async () => {
  try {
    let totalCompletion = 0
    let classCount = 0
    
    for (const classItem of classes.value) {
      try {
        const analyticsResponse = await api.get(`/advisers/classes/${classItem.class._id}/analytics`)
        const analytics = analyticsResponse.data
        
        if (analytics && analytics.avgSSPCompletion) {
          totalCompletion += analytics.avgSSPCompletion
          classCount++
          }
        } catch (error) {
        console.warn(`Could not load analytics for class ${classItem.class._id}:`, error)
      }
    }
    
    dashboardStats.value.avgSSPCompletion = classCount > 0 ? Math.round(totalCompletion / classCount) : 0
    
  } catch (error) {
    console.error('Error calculating SSP completion:', error)
  }
}

const loadConsultationStats = async () => {
  try {
    const response = await api.get('/consultations/adviser-stats')
    const stats = response.data
    
    if (stats) {
      // Count total booked consultations (pending + confirmed + completed)
      dashboardStats.value.bookedConsultations = (stats.pending || 0) + (stats.confirmed || 0) + (stats.completed || 0)
    }
    
  } catch (error) {
    console.error('Error loading consultation stats:', error)
  }
}

const loadConsultations = async () => {
  try {
    const response = await api.get(`/consultations/adviser/${authStore.user._id}`)
    consultations.value = response.data || []
    
    console.log('Loaded consultations data:', consultations.value)
    console.log('Sample consultation structure:', consultations.value[0])
    
  } catch (error) {
    console.error('Error loading consultations:', error)
    consultations.value = []
  }
}

const loadAnnouncements = async () => {
  try {
    const response = await api.get('/announcements')
    announcements.value = response.data || []
    
    console.log('Loaded announcements data:', announcements.value)
    
  } catch (error) {
    console.error('Error loading announcements:', error)
    announcements.value = []
  }
}

const loadStudentProgress = async () => {
  try {
    const response = await api.get('/advisers/student-progress-summary')
    const progress = response.data
    
    if (progress) {
      dashboardStats.value.studentsNeedingAttention = progress.studentsNeedingAttention || 0
    }
    
  } catch (error) {
    console.error('Error loading student progress:', error)
  }
}


const loadCharts = async () => {
  await nextTick()
  
  // Destroy existing charts
  if (sspProgressChartInstance) {
    sspProgressChartInstance.destroy()
    sspProgressChartInstance = null
  }
  if (consultationChartInstance) {
    consultationChartInstance.destroy()
    consultationChartInstance = null
  }
  
  // Wait for DOM to be ready
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // Create charts
    try {
    await createSSPProgressChart()
    await createConsultationChart()
    } catch (error) {
    console.error('Error creating charts:', error)
  }
}

const loadSSPChart = async () => {
  if (sspProgressChartInstance) {
    sspProgressChartInstance.destroy()
    sspProgressChartInstance = null
  }
  await nextTick()
  await createSSPProgressChart()
}

const loadConsultationChart = async () => {
  if (consultationChartInstance) {
    consultationChartInstance.destroy()
    consultationChartInstance = null
  }
  await nextTick()
  await createConsultationChart()
}

const loadConsultationStatusChart = async () => {
  await nextTick()
}

const createSSPProgressChart = async () => {
  if (!sspProgressChart.value) {
    console.error('SSP Progress chart canvas not found')
    return
  }
  
  try {
    const ctx = sspProgressChart.value.getContext('2d')
    
    // Get real SSP progress data - show student progress categories
    let labels, completionRates
    try {
      // Try to get class analytics data first
      if (selectedClass.value?.class?._id) {
        const analyticsResponse = await api.get(`/advisers/classes/${selectedClass.value.class._id}/analytics`)
        const analytics = analyticsResponse.data
        console.log('Class Analytics Response:', analytics)
        
        if (analytics && analytics.sspProgress) {
          // Show completion status categories
          labels = ['Below 50%', '50-70%', '70-85%', 'Above 85%']
          completionRates = [
            analytics.sspProgress.below50 || 0,      // Below 50%
            analytics.sspProgress.between50_70 || 0, // 50-70%
            analytics.sspProgress.between70_85 || 0, // 70-85%
            analytics.sspProgress.above85 || 0       // Above 85%
          ]
          console.log('Using class analytics data:', { labels, completionRates })
        } else {
          // Fallback to time-based data
          const response = await api.get('/advisers/ssp-progress-analytics', {
            params: {
              period: sspDateFilter.value,
              classId: selectedClass.value?.class?._id
            }
          })
          const data = response.data
          console.log('SSP Progress Analytics Response:', data)
          labels = data.labels || ['No Data']
          completionRates = data.completionRates || [0]
        }
      } else {
        // No class selected, show overall progress or average completion
        try {
          const response = await api.get('/advisers/ssp-progress-analytics', {
            params: {
              period: sspDateFilter.value
            }
          })
          const data = response.data
          console.log('SSP Progress Analytics Response:', data)
          labels = data.labels || ['No Data']
          completionRates = data.completionRates || [0]
        } catch (fallbackError) {
          console.error('Error loading overall SSP progress:', fallbackError)
          // Show average completion rate from dashboard stats
          const avgCompletion = dashboardStats.value.avgSSPCompletion || 0
          labels = ['Average SSP Completion']
          completionRates = [avgCompletion]
        }
      }
    } catch (error) {
      console.error('Error loading SSP progress data:', error)
      // Provide realistic fallback data based on period
      if (sspDateFilter.value === 'week') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        completionRates = [0, 0, 0, 0, 0]
      } else if (sspDateFilter.value === 'month') {
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        completionRates = [0, 0, 0, 0]
      } else {
        labels = ['Q1', 'Q2', 'Q3', 'Q4']
        completionRates = [0, 0, 0, 0]
      }
    }
    
    sspProgressChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of Students',
          data: completionRates,
          backgroundColor: [
            'rgba(239, 68, 68, 0.9)',   // Red for below 50%
            'rgba(245, 158, 11, 0.9)',  // Orange for 50-70%
            'rgba(59, 130, 246, 0.9)',  // Blue for 70-85%
            'rgba(34, 197, 94, 0.9)'    // Green for above 85%
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(245, 158, 11)',
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)'
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBorderWidth: 3,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart',
          delay: (context) => {
            let delay = 0
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 200 + context.datasetIndex * 100
            }
            return delay
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: function(context) {
                return `SSP Completion: ${context[0].label}`
              },
              label: function(context) {
                return `${context.parsed.y} students`
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgb(107, 114, 128)',
              maxRotation: 45,
              font: {
                size: 11,
                weight: '500'
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(107, 114, 128, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: 'rgb(107, 114, 128)',
              stepSize: 1,
              font: {
                size: 11,
                weight: '500'
              }
            }
          }
        }
      }
    })
  
  console.log('SSP Progress chart created successfully')
  } catch (error) {
    console.error('Error creating SSP Progress chart:', error)
  }
}

const createConsultationChart = async () => {
  if (!consultationChart.value) {
    console.error('Consultation chart canvas not found')
    return
  }
  
  try {
    const ctx = consultationChart.value.getContext('2d')
    
    // Process consultations data to extract concern types from bookings
    // Filter by selected class if one is selected
    let concernsData = {}
    
    console.log('Processing consultations data:', consultations.value.length, 'consultations')
    console.log('Selected class:', selectedClass.value?.class?._id)
    
    consultations.value.forEach(consultation => {
      console.log('Consultation bookings:', consultation.bookings?.length || 0)
      consultation.bookings?.forEach(booking => {
        console.log('Full booking student object:', JSON.stringify(booking.student, null, 2))
        console.log('Booking student class:', booking.student?.class)
        console.log('Selected class:', selectedClass.value?.class)
        
        // If a specific class is selected, only include bookings from students in that class
        if (selectedClass.value?.class?._id) {
          const studentClassId = booking.student?.class?._id?.toString() || booking.student?.class?.toString()
          const selectedClassId = selectedClass.value.class._id.toString()
          
          console.log('Comparing studentClassId:', studentClassId, 'with selectedClassId:', selectedClassId)
          
          if (studentClassId !== selectedClassId) {
            console.log('Skipping booking - student not in selected class')
            return
          }
        } else {
          console.log('All classes selected - including all consultations')
        }
        
        console.log('Booking:', { concern: booking.concern, status: booking.status })
        // Count ALL consultations with concerns (not just completed ones)
        if (booking.concern) {
          concernsData[booking.concern] = (concernsData[booking.concern] || 0) + 1
          console.log('Added concern:', booking.concern, 'Total:', concernsData[booking.concern])
        }
      })
    })
    console.log('Final concerns data:', concernsData)
    
    // Debug: If no concerns data found, let's see what we have
    if (Object.keys(concernsData).length === 0) {
      console.log('No concerns data found. Let me check all bookings...')
      consultations.value.forEach(consultation => {
        consultation.bookings?.forEach(booking => {
          console.log('All booking data:', {
            hasConcern: !!booking.concern,
            concern: booking.concern,
            studentClass: booking.student?.class,
            selectedClass: selectedClass.value?.class?._id
          })
        })
      })
    }
    
    // Ensure we have proper concern type labels
    const concernLabels = Object.keys(concernsData).length > 0 ? Object.keys(concernsData) : ['No Consultations Yet']
    const concernValues = Object.values(concernsData).length > 0 ? Object.values(concernsData) : [1]
    
    // Shorten long concern names for better display
    const labels = concernLabels.map(label => {
      if (label === 'Academic Performance and Grades') return 'Academic Performance'
      if (label === 'Career Planning and Future Goals') return 'Career Planning'
      if (label === 'Time Management and Workload') return 'Time Management'
      if (label === 'Mental Health and Personal Well-being') return 'Mental Health'
      if (label === 'Financial Concerns') return 'Financial'
      return label
    })
    const values = concernValues
    
    consultationChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [
            'rgba(34, 197, 94, 0.9)',   // Green
            'rgba(59, 130, 246, 0.9)',  // Blue
            'rgba(168, 85, 247, 0.9)',  // Purple
            'rgba(245, 158, 11, 0.9)',  // Yellow
            'rgba(239, 68, 68, 0.9)',   // Red
            'rgba(156, 163, 175, 0.9)'  // Gray
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(168, 85, 247)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(156, 163, 175)'
          ],
          borderWidth: 3,
          hoverBorderWidth: 4,
          hoverOffset: 8,
          cutout: '65%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgb(107, 114, 128)',
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 12,
                weight: '500'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: function(context) {
                return `Consultation Concern: ${context[0].label}`
              },
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((context.parsed / total) * 100).toFixed(1)
                return `${context.parsed} consultations (${percentage}%)`
              }
            }
          }
        },
        elements: {
          arc: {
            borderJoinStyle: 'round'
          }
        }
      }
    })
    
    console.log('Consultation chart created successfully with data:', finalConcerns)
  } catch (error) {
    console.error('Error creating consultation chart:', error)
  }
}


// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script> 

<style scoped>
/* Additional custom styles if needed */
</style> 