<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">

      <!-- Filters Row -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
            <select v-model="filters.yearLevel" @change="onYearLevelChange" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Year Levels</option>
              <option v-for="yearLevel in systemOptions.yearLevels" :key="yearLevel" :value="yearLevel">{{ yearLevel }} Year</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select v-model="filters.section" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Sections</option>
              <option v-for="section in sectionOptions" :key="section" :value="section">{{ section }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Major</label>
            <select v-model="filters.major" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Majors</option>
              <option v-for="major in getMajorsForYearLevel()" :key="major" :value="major">{{ major }}</option>
            </select>
          </div>
          <div class="flex items-end space-x-2">
            <button @click="applyFilters" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
              Apply Filters
            </button>
            <button @click="loadDashboardData" :disabled="loading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50">
              <svg v-if="loading" class="animate-spin h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Refreshing...' : 'Refresh Data' }}
            </button>
          </div>
        </div>
        <!-- Last Updated Indicator -->
        <div v-if="lastUpdated" class="text-xs text-gray-500 text-right mt-2">
          Last updated: {{ lastUpdated.toLocaleTimeString() }}
        </div>
      </div>

      <!-- Top Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">At-Risk Students</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.atRiskStudents }}</p>
          </div>
          </div>
              </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Students</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.totalStudents }}</p>
          </div>
              </div>
            </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
          </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Avg Completion</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.avgCompletion }}%</p>
              </div>
            </div>
          </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Consultations</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.totalConsultations }}</p>
              </div>
            </div>
          </div>
              </div>

      <!-- Analytics Charts Section -->
      <div class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- SSP Completion Status Chart -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-medium text-gray-800">
                SSP Completion Status
                <span class="text-sm font-normal text-gray-600">
                  - All Students
                </span>
              </h3>
              <div class="flex items-center space-x-3">
                <select v-model="sspDateFilter" @change="loadSSPChart" class="text-sm border border-gray-200 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-300">
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
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
                  - All Students
                </span>
              </h3>
              <div class="flex items-center space-x-3">
                <select v-model="consultationDateFilter" @change="loadConsultationChart" class="text-sm border border-gray-200 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-300">
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
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

      <!-- Loading State -->
      <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span class="text-gray-700">Loading analytics data...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import api from '../../services/api'
import Chart from 'chart.js/auto'

// Store
const authStore = useAuthStore()

// Loading state
const loading = ref(false)

// Filters
const filters = reactive({
  yearLevel: '',
  section: '',
  major: ''
})

// Filter options
const sectionOptions = ref([])
const systemOptions = reactive({
  yearLevels: ['2nd', '3rd', '4th'],
  sections: {},
  majors: {}
})

// Stats data
const stats = reactive({
  atRiskStudents: 0,
  totalStudents: 0,
  avgCompletion: 0,
  totalConsultations: 0
})

// Last updated timestamp
const lastUpdated = ref(null)

// Chart refs and data
const sspProgressChart = ref(null)
const consultationChart = ref(null)
const sspDateFilter = ref('month')
const consultationDateFilter = ref('month')
const consultations = ref([])

// Chart instances
let sspProgressChartInstance = null
let consultationChartInstance = null

// Load dashboard data
const loadDashboardData = async () => {
  try {
    loading.value = true
    
    await Promise.all([
      loadSystemOptions(),
      loadConsultations(),
      loadStats()
    ])
    
    // Load charts after data is ready
    await nextTick()
    await loadCharts()

    // Update last updated timestamp
    lastUpdated.value = new Date()

  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

// Load consultations data
const loadConsultations = async () => {
  try {
    // Build query parameters from current filters
    const queryParams = new URLSearchParams()
    if (filters.yearLevel) queryParams.append('yearLevel', filters.yearLevel)
    if (filters.section) queryParams.append('section', filters.section)
    if (filters.major) queryParams.append('major', filters.major)
    
    const response = await api.get(`/consultations/all?${queryParams.toString()}`)
    consultations.value = response.data || []
    
    console.log('Loaded consultations data:', consultations.value)
  } catch (error) {
    console.error('Error loading consultations:', error)
    consultations.value = []
  }
}

// Load stats data
const loadStats = async () => {
  try {
    // Build query parameters from current filters
    const queryParams = new URLSearchParams()
    if (filters.yearLevel) queryParams.append('yearLevel', filters.yearLevel)
    if (filters.section) queryParams.append('section', filters.section)
    if (filters.major) queryParams.append('major', filters.major)
    
    const response = await api.get(`/admin/analytics/stats?${queryParams.toString()}`)
    const data = response.data
    
    stats.atRiskStudents = data.atRiskStudents || 0
    stats.totalStudents = data.totalStudents || 0
    stats.avgCompletion = data.avgCompletion || 0
    stats.totalConsultations = data.totalConsultations || 0
    
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// Load system options for filters
const loadSystemOptions = async () => {
  try {
    const response = await api.get('/admin/analytics/system-options')
    const data = response.data
    
    // Update system options
    systemOptions.yearLevels = data.yearLevels || ['2nd', '3rd', '4th']
    systemOptions.sections = data.sections || {}
    systemOptions.majors = data.majors || {}
    
    // Update section options based on selected year level
    updateSectionOptions()
    
  } catch (error) {
    console.error('Error loading system options:', error)
  }
}

// Update section options based on selected year level
const updateSectionOptions = () => {
  sectionOptions.value = []
  
  if (filters.yearLevel && systemOptions.sections[filters.yearLevel]) {
    sectionOptions.value = systemOptions.sections[filters.yearLevel]
  } else {
    // If no year level selected, get all sections
    Object.values(systemOptions.sections).forEach(sections => {
      sectionOptions.value = [...sectionOptions.value, ...sections]
    })
    sectionOptions.value = [...new Set(sectionOptions.value)] // Remove duplicates
  }
}

// Get majors for selected year level
const getMajorsForYearLevel = () => {
  if (filters.yearLevel && systemOptions.majors[filters.yearLevel]) {
    return systemOptions.majors[filters.yearLevel]
  }
  // If no year level selected, get all majors
  const allMajors = []
  Object.values(systemOptions.majors).forEach(majors => {
    allMajors.push(...majors)
  })
  return [...new Set(allMajors)] // Remove duplicates
}

// Handle year level change
const onYearLevelChange = () => {
  // Clear section and major when year level changes
  filters.section = ''
  filters.major = ''
  updateSectionOptions()
}
  
// Load charts
const loadCharts = async () => {
  try {
    await createSSPProgressChart()
    await createConsultationChart()
  } catch (error) {
    console.error('Error creating charts:', error)
  }
}

// Load SSP chart
const loadSSPChart = async () => {
  if (sspProgressChartInstance) {
    sspProgressChartInstance.destroy()
    sspProgressChartInstance = null
  }
  await nextTick()
  await createSSPProgressChart()
}

// Load consultation chart
const loadConsultationChart = async () => {
  if (consultationChartInstance) {
    consultationChartInstance.destroy()
    consultationChartInstance = null
  }
  await nextTick()
  await createConsultationChart()
}

// Create SSP Progress Chart
const createSSPProgressChart = async () => {
  if (!sspProgressChart.value) {
    console.error('SSP Progress chart canvas not found')
    return
  }
  
  try {
    const ctx = sspProgressChart.value.getContext('2d')
    
    // Build query parameters from current filters
    const queryParams = new URLSearchParams()
    if (filters.yearLevel) queryParams.append('yearLevel', filters.yearLevel)
    if (filters.section) queryParams.append('section', filters.section)
    if (filters.major) queryParams.append('major', filters.major)
    
    // Get SSP completion data with filters
    const response = await api.get(`/admin/analytics/ssp-completion?${queryParams.toString()}`)
    const data = response.data || {}
    
    let labels = ['Q1', 'Q2', 'Q3', 'Q4']
    let completionRates = [0, 0, 0, 0]
    
    if (data.completionRates && data.completionRates.length > 0) {
      labels = data.completionRates.map(item => item.period || item.label)
      completionRates = data.completionRates.map(item => item.count || item.value)
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

// Create Consultation Chart
const createConsultationChart = async () => {
  if (!consultationChart.value) {
    console.error('Consultation chart canvas not found')
    return
  }
  
  try {
    const ctx = consultationChart.value.getContext('2d')
    
    // Process consultations data to extract concern types from ALL bookings
    let concernsData = {}
    
    console.log('Processing consultations data:', consultations.value.length, 'consultations')
    
    consultations.value.forEach(consultation => {
      console.log('Consultation bookings:', consultation.bookings?.length || 0)
      consultation.bookings?.forEach(booking => {
        console.log('Booking:', { concern: booking.concern, status: booking.status })
        // Count ALL consultations with concerns (not just completed ones)
        if (booking.concern) {
          concernsData[booking.concern] = (concernsData[booking.concern] || 0) + 1
          console.log('Added concern:', booking.concern, 'Total:', concernsData[booking.concern])
        }
      })
    })
    console.log('Final concerns data:', concernsData)
    
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
    
    console.log('Consultation chart created successfully with data:', concernsData)
  } catch (error) {
    console.error('Error creating consultation chart:', error)
  }
}

// Apply filters
const applyFilters = async () => {
  try {
    loading.value = true
    
    // Reload system options to update section options based on year level
    await loadSystemOptions()
    
    // Reload data with current filters
    await Promise.all([
      loadConsultations(),
      loadStats()
    ])
    
    // Reload charts with current filters
    await nextTick()
    await loadCharts()
    
    // Update last updated timestamp
    lastUpdated.value = new Date()
    
  } catch (error) {
    console.error('Error applying filters:', error)
  } finally {
    loading.value = false
  }
}

// Cleanup charts on unmount
const cleanup = () => {
  if (sspProgressChartInstance) {
    sspProgressChartInstance.destroy()
    sspProgressChartInstance = null
  }
  if (consultationChartInstance) {
    consultationChartInstance.destroy()
    consultationChartInstance = null
  }
}

onMounted(() => {
  loadDashboardData()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
/* Custom styles for better chart appearance */
.apexcharts-canvas {
  margin: 0 auto;
}

.apexcharts-legend {
  justify-content: center !important;
}
</style>