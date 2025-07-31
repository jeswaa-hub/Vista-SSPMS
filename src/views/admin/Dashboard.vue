<template>
  <div class="space-y-8 p-6 bg-gray-50 min-h-screen">
    <!-- Welcome Header - Minimal Design -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-light text-gray-800">Welcome back, {{ adminName }}</h1>
          <p class="text-gray-500 mt-2 font-light">System overview and management</p>
        </div>
        <div class="grid grid-cols-4 gap-6 text-center">
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div class="text-2xl font-light text-gray-800">{{ dashboardStats.totalStudents }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide">Students</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div class="text-2xl font-light text-gray-800">{{ dashboardStats.totalClasses }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide">Classes</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div class="text-2xl font-light text-gray-800">{{ dashboardStats.totalAdvisers }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide">Advisers</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div class="text-2xl font-light text-gray-800">{{ dashboardStats.totalConsultations }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide">Meetings</div>
          </div>
        </div>
      </div>
    </div>
      
    <!-- Class Selection -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">System Analytics</h2>
        <div class="flex items-center space-x-4">
          <label class="text-sm font-medium text-gray-700">Select Class:</label>
          <select v-model="selectedClassId" @change="loadClassAnalytics" 
                  class="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            <option value="">All Classes (System Overview)</option>
            <option v-for="classItem in classes" :key="classItem._id" :value="classItem._id">
              {{ getClassTitle(classItem) }} - {{ getClassSection(classItem) }} ({{ classItem.adviser?.firstName }} {{ classItem.adviser?.lastName }})
            </option>
          </select>
        </div>
      </div>

      <!-- Selected Class Info -->
      <div v-if="selectedClass" class="bg-purple-50 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
        <div>
            <h3 class="font-semibold text-purple-900">{{ getClassTitle(selectedClass) }}</h3>
            <p class="text-sm text-purple-700">{{ getClassYearAndMajor(selectedClass) }} - {{ getClassSection(selectedClass) }}</p>
            <p class="text-sm text-purple-600">Adviser: {{ selectedClass.adviser?.firstName }} {{ selectedClass.adviser?.lastName }}</p>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ selectedClass.studentCount || 0 }}</div>
            <div class="text-sm text-purple-700">Students</div>
          </div>
        </div>
      </div>
      
      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- SSP Progress Over Time Chart -->
        <div v-if="chartData.sspProgress && chartData.sspProgress.labels && chartData.sspProgress.labels.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">SSP Progress Timeline</h3>
          <div class="relative" style="height: 300px;">
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
            <canvas ref="sspProgressChart" width="400" height="300"></canvas>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            System-wide SSP completion trends with predictive analysis for proactive intervention.
          </p>
        </div>

        <!-- M&M Submission Timeline Chart -->
        <div v-if="chartData.mmTimeline && chartData.mmTimeline.labels && chartData.mmTimeline.labels.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">M&M Submission Timeline</h3>
          <div class="relative" style="height: 300px;">
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
            <canvas ref="mmTimelineChart" width="400" height="300"></canvas>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            M&M submission patterns across all classes to predict bottlenecks and optimize deadlines.
          </p>
        </div>

        <!-- Consultation Insights Chart -->
        <div v-if="chartData.consultations && chartData.consultations.labels && chartData.consultations.labels.length > 0 && chartData.consultations.labels[0] !== 'No Data'" class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Consultation Insights</h3>
          <div class="relative" style="height: 300px;">
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
            <canvas ref="consultationChart" width="400" height="300"></canvas>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            System-wide consultation patterns to identify common student concerns and training needs.
          </p>
      </div>
      
        <!-- No Data Available Message -->
        <div v-if="!loading && (!chartData.sspProgress || !chartData.mmTimeline || !chartData.consultations)" class="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center">
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">System Analytics Coming Soon</h3>
            <p class="text-gray-600">Chart data will be available once there is sufficient system activity and student engagement.</p>
        </div>
        </div>
      </div>
    </div>
    
    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Consultations -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
        <div class="flex items-center">
          <div class="bg-orange-100 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ selectedClassStats.totalConsultations || dashboardStats.totalConsultations }}</h3>
            <p class="text-sm text-gray-600">Total Consultations</p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/admin/consultations" class="text-orange-600 hover:text-orange-700 text-sm font-medium">
            Manage System →
          </router-link>
        </div>
      </div>

      <!-- Students At Risk -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
        <div class="flex items-center">
          <div class="bg-red-100 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ selectedClassStats.studentsAtRisk || dashboardStats.studentsAtRisk }}</h3>
            <p class="text-sm text-gray-600">Students At Risk</p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/admin/students" class="text-red-600 hover:text-red-700 text-sm font-medium">
            View Details →
          </router-link>
      </div>
    </div>
    
      <!-- System SSP Completion -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
        <div class="flex items-center">
          <div class="bg-green-100 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ selectedClassStats.avgSSPCompletion || dashboardStats.avgSSPCompletion }}%</h3>
            <p class="text-sm text-gray-600">System SSP Completion</p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/admin/classes" class="text-green-600 hover:text-green-700 text-sm font-medium">
            View Progress →
          </router-link>
        </div>
      </div>
      
      <!-- Academic Compliance -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
        <div class="flex items-center">
          <div class="bg-blue-100 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ selectedClassStats.complianceRate || dashboardStats.complianceRate }}%</h3>
            <p class="text-sm text-gray-600">Academic Compliance</p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/admin/requirements" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Requirements →
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- System Overview Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Class Management Overview -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Class Management</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Active Classes</span>
            <span class="text-lg font-semibold text-gray-900">{{ dashboardStats.totalClasses }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Assigned Classes</span>
            <span class="text-lg font-semibold text-gray-900">{{ dashboardStats.assignedClasses }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Unassigned Classes</span>
            <span class="text-lg font-semibold text-red-600">{{ dashboardStats.unassignedClasses }}</span>
          </div>
          <div class="pt-2">
            <router-link to="/admin/classes" class="text-purple-600 hover:text-purple-700 text-sm font-medium">
              Manage Classes →
        </router-link>
      </div>
        </div>
      </div>
      
      <!-- Adviser Performance -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Adviser Performance</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Active Advisers</span>
            <span class="text-lg font-semibold text-gray-900">{{ dashboardStats.totalAdvisers }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Avg Response Time</span>
            <span class="text-lg font-semibold text-gray-900">{{ dashboardStats.avgResponseTime }}h</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">High Performers</span>
            <span class="text-lg font-semibold text-green-600">{{ dashboardStats.highPerformers }}</span>
          </div>
          <div class="pt-2">
            <router-link to="/admin/advisers" class="text-purple-600 hover:text-purple-700 text-sm font-medium">
              Manage Advisers →
        </router-link>
          </div>
        </div>
      </div>
      
      <!-- System Health -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Active Sessions</span>
            <span class="text-lg font-semibold text-gray-900">{{ dashboardStats.activeSessions }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Data Integrity</span>
            <span class="text-lg font-semibold text-green-600">{{ dashboardStats.dataIntegrity }}%</span>
            </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">System Load</span>
            <span class="text-lg font-semibold text-blue-600">{{ dashboardStats.systemLoad }}%</span>
            </div>
          <div class="pt-2">
            <router-link to="/admin/system" class="text-purple-600 hover:text-purple-700 text-sm font-medium">
              System Status →
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Administrative Actions</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <router-link to="/admin/users" class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span class="text-sm font-medium text-center">Manage Users</span>
        </router-link>
        
        <router-link to="/admin/classes" class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span class="text-sm font-medium text-center">Manage Classes</span>
        </router-link>
        
        <router-link to="/admin/advisers" class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-sm font-medium text-center">Manage Advisers</span>
        </router-link>
        
        <router-link to="/admin/subjects" class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-orange-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span class="text-sm font-medium text-center">SSP Subjects</span>
        </router-link>
        
        <router-link to="/admin/announcements" class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <span class="text-sm font-medium text-center">Announcements</span>
        </router-link>
        
        <router-link to="/admin/reports" class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          <span class="text-sm font-medium text-center">System Reports</span>
          </router-link>
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
const selectedClassId = ref('')
const selectedClass = ref(null)
const selectedClassStats = ref({})
const chartData = ref({
  sspProgress: null,
  mmTimeline: null,
  consultations: null
})

// Chart references
const sspProgressChart = ref(null)
const mmTimelineChart = ref(null)
const consultationChart = ref(null)

// Chart instances
let sspProgressChartInstance = null
let mmTimelineChartInstance = null
let consultationChartInstance = null

const dashboardStats = ref({
  totalStudents: 0,
  totalClasses: 0,
  totalAdvisers: 0,
  totalConsultations: 0,
  studentsAtRisk: 0,
  avgSSPCompletion: 0,
  complianceRate: 0,
  assignedClasses: 0,
  unassignedClasses: 0,
  avgResponseTime: 0,
  highPerformers: 0,
  activeSessions: 0,
  dataIntegrity: 95,
  systemLoad: 65
})

// Computed
const adminName = computed(() => {
  if (!authStore.user) return 'Administrator'
  const firstName = authStore.user.firstName || ''
  const lastName = authStore.user.lastName || ''
  return `${firstName} ${lastName}`.trim() || 'Administrator'
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
      loadAllClasses(),
      loadSystemStats()
    ])
    
    // Load default analytics (all classes)
    await loadClassAnalytics()
    
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    notificationService.showError('Failed to load dashboard data')
  } finally {
    loading.value = false
  }
}

const loadAllClasses = async () => {
  try {
    const response = await api.get('/admin/dashboard/classes')
    classes.value = response.data || []
    
    dashboardStats.value.totalClasses = classes.value.length
    dashboardStats.value.totalStudents = classes.value.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)
    dashboardStats.value.assignedClasses = classes.value.filter(cls => cls.adviser).length
    dashboardStats.value.unassignedClasses = classes.value.filter(cls => !cls.adviser).length
    
    } catch (error) {
    console.error('Error loading all classes:', error)
    classes.value = []
  }
}

const loadSystemStats = async () => {
  try {
    const response = await api.get('/admin/dashboard/stats')
    const stats = response.data
    
    if (stats) {
      dashboardStats.value.totalAdvisers = stats.totalAdvisers || 0
      dashboardStats.value.totalConsultations = stats.totalConsultations || 0
      dashboardStats.value.studentsAtRisk = stats.studentsAtRisk || 0
      dashboardStats.value.avgSSPCompletion = stats.avgSSPCompletion || 0
      dashboardStats.value.complianceRate = stats.complianceRate || 0
      dashboardStats.value.avgResponseTime = stats.avgResponseTime || 0
      dashboardStats.value.highPerformers = stats.highPerformers || 0
      dashboardStats.value.activeSessions = stats.activeSessions || 0
    }
    
  } catch (error) {
    console.error('Error loading system stats:', error)
  }
}

const loadClassAnalytics = async () => {
  try {
    if (selectedClassId.value) {
      // Load specific class analytics
      selectedClass.value = classes.value.find(c => c._id === selectedClassId.value)
      
      const [analyticsResponse, chartDataResponse] = await Promise.all([
        api.get(`/admin/dashboard/classes/${selectedClassId.value}/analytics`),
        api.get(`/admin/dashboard/classes/${selectedClassId.value}/chart-data`)
      ])
      
      selectedClassStats.value = analyticsResponse.data || {}
      
      // Load charts with specific class data
      if (chartDataResponse.data) {
        chartData.value = chartDataResponse.data
        await loadCharts(chartDataResponse.data)
      }
    } else {
      // Load overall analytics
      selectedClass.value = null
      selectedClassStats.value = {}
      
      // Load charts with overall data
      try {
        const chartDataResponse = await api.get('/admin/dashboard/chart-data')
        if (chartDataResponse.data) {
          chartData.value = chartDataResponse.data
          await loadCharts(chartDataResponse.data)
        }
      } catch (chartError) {
        console.warn('Failed to load chart data from API:', chartError)
        // Clear chart data if API fails
        chartData.value = {
          sspProgress: null,
          mmTimeline: null,
          consultations: null
        }
      }
    }
  } catch (error) {
    console.error('Error loading class analytics:', error)
    notificationService.showError('Failed to load class analytics')
    
    // Clear chart data on error
    chartData.value = {
      sspProgress: null,
      mmTimeline: null,
      consultations: null
    }
  }
}

const loadCharts = async (data) => {
  await nextTick()
  
  // Destroy existing charts
  if (sspProgressChartInstance) {
    sspProgressChartInstance.destroy()
    sspProgressChartInstance = null
  }
  if (mmTimelineChartInstance) {
    mmTimelineChartInstance.destroy()
    mmTimelineChartInstance = null
  }
  if (consultationChartInstance) {
    consultationChartInstance.destroy()
    consultationChartInstance = null
  }
  
  // Create charts only if data is available and valid
  if (data.sspProgress && data.sspProgress.labels && data.sspProgress.labels.length > 0) {
    createSSPProgressChart(data.sspProgress)
  }
  
  if (data.mmTimeline && data.mmTimeline.labels && data.mmTimeline.labels.length > 0) {
    createMMTimelineChart(data.mmTimeline)
  }
  
  if (data.consultations && data.consultations.labels && data.consultations.labels.length > 0 && data.consultations.labels[0] !== 'No Data') {
    createConsultationChart(data.consultations)
  }
}

const createSSPProgressChart = (data) => {
  if (!sspProgressChart.value) return
  
  const ctx = sspProgressChart.value.getContext('2d')
  sspProgressChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels || [],
      datasets: [{
        label: 'System Average %',
        data: data.completionRates || [],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true
      }, {
        label: 'Target %',
        data: data.targets || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'transparent',
        borderDash: [5, 5]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%'
            }
          }
        }
      }
    }
  })
}

const createMMTimelineChart = (data) => {
  if (!mmTimelineChart.value) return
  
  const ctx = mmTimelineChart.value.getContext('2d')
  mmTimelineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels || [],
      datasets: [{
        label: 'P1 Submissions',
        data: data.p1Submissions || [],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4
      }, {
        label: 'P2 Submissions',
        data: data.p2Submissions || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }, {
        label: 'P3 Submissions',
        data: data.p3Submissions || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}

const createConsultationChart = (data) => {
  if (!consultationChart.value) return
  
  const ctx = consultationChart.value.getContext('2d')
  consultationChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels || [],
      datasets: [{
        data: data.values || [],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(168, 85, 247)',
          'rgb(156, 163, 175)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

// Helper functions
const getClassTitle = (classItem) => {
  return classItem.sspSubject?.name || classItem.sspSubject?.sspCode || 'Unknown Subject'
}

const getClassSection = (classItem) => {
  return classItem.section || 'N/A'
}

const getClassYearAndMajor = (classItem) => {
  const yearLevel = classItem.yearLevel || ''
  const major = classItem.major || ''
  return `${yearLevel} Year - ${major}`
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
