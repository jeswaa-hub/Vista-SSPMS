<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">

      <!-- Filters Row -->
      <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
            <select v-model="filters.yearLevel" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Year Levels</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
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
              <option value="Business Informatics">Business Informatics</option>
              <option value="System Development">System Development</option>
              <option value="Digital Arts">Digital Arts</option>
              <option value="Computer Security">Computer Security</option>
            </select>
          </div>
          <div class="flex items-end space-x-2">
            <button @click="applyFilters" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
              Apply Filters
            </button>
            <button @click="initializeCharts" :disabled="loading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50">
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
              <p class="text-sm font-medium text-gray-600">Consultations</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.totalConsultations }}</p>
              </div>
            </div>
          </div>
              </div>

      <!-- Main Charts Grid -->
      <div class="space-y-6">
        <!-- Top Row: Progress Overview and Risk Prediction -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Student Progress Overview -->
          <div class="bg-white rounded-lg shadow-sm border">
            <div class="p-6 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">SSP Service Progress</h3>
              <p class="text-sm text-gray-500">Student support service completion rates</p>
            </div>
            <div class="p-6">
              <div id="progressOverviewChart" class="h-80"></div>
            </div>
          </div>

          <!-- Enrollment Risk Prediction -->
          <div class="bg-white rounded-lg shadow-sm border">
            <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Enrollment Risk Prediction</h3>
                  <p class="text-sm text-gray-500">Students at risk next semester</p>
                </div>
                <div class="flex items-center space-x-1">
                  <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span class="text-xs text-gray-600">Critical</span>
                  <div class="w-3 h-3 bg-yellow-500 rounded-full ml-2"></div>
                  <span class="text-xs text-gray-600">High</span>
                  <div class="w-3 h-3 bg-blue-500 rounded-full ml-2"></div>
                  <span class="text-xs text-gray-600">Medium</span>
                  <div class="w-3 h-3 bg-green-500 rounded-full ml-2"></div>
                  <span class="text-xs text-gray-600">Low</span>
                </div>
              </div>
            </div>
            <div class="p-6">
              <div id="enrollmentRiskChart" class="h-80"></div>
            </div>
          </div>
        </div>

        <!-- Middle Row: Monthly Trends (Full Width) -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Monthly SSP Service Trends</h3>
            <p class="text-sm text-gray-500">Student support service completion trends over time</p>
          </div>
          <div class="p-6">
            <div id="monthlyTrendsChart" class="h-80"></div>
          </div>
        </div>

        <!-- Bottom Row: Class Performance and Student Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Class Performance Comparison -->
          <div class="bg-white rounded-lg shadow-sm border">
            <div class="p-6 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">SSP Service Completion by Class</h3>
              <p class="text-sm text-gray-500">Student support service completion rates by class</p>
            </div>
            <div class="p-6">
              <div id="classPerformanceChart" class="h-80"></div>
            </div>
          </div>

          <!-- Student Activity Dashboard -->
          <div class="bg-white rounded-lg shadow-sm border">
            <div class="p-6 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Student SSP Engagement</h3>
              <p class="text-sm text-gray-500">SSP service participation and activity levels</p>
            </div>
            <div class="p-6">
              <div id="studentActivityChart" class="h-80"></div>
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { analyticsService } from '../../services/analyticsService'

// Loading state
const loading = ref(true)

// Filters
const filters = reactive({
  yearLevel: '',
  section: '',
  major: ''
})

// Filter options
const sectionOptions = ref([])

// Stats data
const stats = reactive({
  atRiskStudents: 0,
  totalStudents: 0,
  avgCompletion: 0,
  totalConsultations: 0
})

// Last updated timestamp
const lastUpdated = ref(null)

// Chart instances
let charts = {}

// Raw data for filtering
const rawData = reactive({
  progressOverview: null,
  enrollmentRisk: null,
  monthlyTrends: null,
  classPerformance: null,
  studentActivity: null
})

// Load ApexCharts
const loadApexCharts = () => {
  return new Promise((resolve, reject) => {
    if (window.ApexCharts) {
      resolve(window.ApexCharts)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/apexcharts@latest'
    script.onload = () => resolve(window.ApexCharts)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Initialize all charts
const initializeCharts = async () => {
  try {
    loading.value = true
    const ApexCharts = await loadApexCharts()

    // Load all data in parallel
    const [
      progressOverviewData,
      enrollmentRiskData,
      monthlyTrendsData,
      classPerformanceData,
      studentActivityData
    ] = await Promise.all([
      analyticsService.getProgressOverviewData(),
      analyticsService.getEnrollmentRiskData(),
      analyticsService.getMonthlyTrendsData(),
      analyticsService.getClassPerformanceData(),
      analyticsService.getStudentActivityData()
    ])

    // Store raw data for filtering
    rawData.progressOverview = progressOverviewData
    rawData.enrollmentRisk = enrollmentRiskData
    rawData.monthlyTrends = monthlyTrendsData
    rawData.classPerformance = classPerformanceData
    rawData.studentActivity = studentActivityData

    // Extract filter options
    extractFilterOptions(progressOverviewData, classPerformanceData)

    // Apply initial filters and render charts
    applyFilters(ApexCharts)

    // Update last updated timestamp
    lastUpdated.value = new Date()

  } catch (error) {
    console.error('Error initializing charts:', error)
  } finally {
    loading.value = false
  }
}

// Extract filter options from student data
const extractFilterOptions = (progressData, classData) => {
  const allStudents = [
    ...(progressData.students || []),
    ...(classData.students || [])
  ]
  
  const sectionSet = new Set()
  
  // Extract unique sections from all student data
  allStudents.forEach(student => {
    if (student.classDetails?.section) {
      sectionSet.add(student.classDetails.section)
    }
    if (student.class?.section) {
      sectionSet.add(student.class.section)
    }
  })
  
  // Extract from classes data
  const classes = classData.classes || []
  classes.forEach(cls => {
    if (cls.section) {
      sectionSet.add(cls.section)
    }
  })
  
  sectionOptions.value = Array.from(sectionSet).sort()
}

// Filter data based on current filter settings
const filterData = (data, type) => {
  if (!data) return data
  
  if (type === 'students') {
    return data.filter(student => {
      // Year level filter
      if (filters.yearLevel) {
        const studentYear = student.classDetails?.yearLevel || student.class?.yearLevel
        if (studentYear !== filters.yearLevel) return false
      }
      
      // Section filter
      if (filters.section) {
        const studentSection = student.classDetails?.section || student.class?.section
        if (studentSection !== filters.section) return false
      }
      
      // Major filter
      if (filters.major) {
        const studentMajor = student.major || student.classDetails?.major || student.class?.major
        if (studentMajor !== filters.major) return false
      }
      
      return true
    })
  }
  
  return data
}

// Apply filters and re-render charts
const applyFilters = (ApexCharts) => {
  if (!ApexCharts) ApexCharts = window.ApexCharts
  if (!ApexCharts || !rawData.progressOverview) return
  
  // Filter data based on current settings
  const filteredProgressData = {
    ...rawData.progressOverview,
    students: filterData(rawData.progressOverview.students, 'students')
  }
  
  const filteredRiskData = {
    ...rawData.enrollmentRisk,
    students: filterData(rawData.enrollmentRisk.students, 'students')
  }
  
  const filteredClassData = {
    ...rawData.classPerformance,
    students: filterData(rawData.classPerformance.students, 'students')
  }
  
  // Update stats with filtered data
  updateStats(filteredRiskData, filteredProgressData, rawData.studentActivity)
  
  // Re-render charts with filtered data
  try {
    initProgressOverviewChart(ApexCharts, filteredProgressData)
  } catch (error) {
    console.error('Error updating progress overview chart:', error)
  }
  
  try {
    initEnrollmentRiskChart(ApexCharts, filteredRiskData)
  } catch (error) {
    console.error('Error updating enrollment risk chart:', error)
  }
  
  try {
    initMonthlyTrendsChart(ApexCharts, rawData.monthlyTrends, filteredProgressData.students)
  } catch (error) {
    console.error('Error updating monthly trends chart:', error)
  }
  
  try {
    initClassPerformanceChart(ApexCharts, filteredClassData)
  } catch (error) {
    console.error('Error updating class performance chart:', error)
  }
  
  try {
    initStudentActivityChart(ApexCharts, rawData.studentActivity)
  } catch (error) {
    console.error('Error updating student activity chart:', error)
  }
}

// Update stats cards
const updateStats = (riskData, progressData, activityData) => {
  // Calculate at-risk students from the filtered/assessed data or fallback to summary
  const riskCounts = riskData.summary || {}
  stats.atRiskStudents = (riskCounts.critical || 0) + (riskCounts.high || 0)
  
  // Use total students from risk data or progress data
  stats.totalStudents = (riskData.students?.length || 0) || (progressData.students?.length || 0)
  
  // Average completion from progress data
  stats.avgCompletion = Math.round(progressData.analytics?.odysseyCompletion?.rate || 0)
  
  // Total consultations from activity data
  const consultationTrends = activityData?.consultationTrends || []
  stats.totalConsultations = consultationTrends.reduce ? consultationTrends.reduce((sum, trend) => sum + (trend.count || 0), 0) : 0
}

// 1. Student Progress Overview Chart (REAL DATABASE DATA)
const initProgressOverviewChart = (ApexCharts, data) => {
  const students = data.students || []
  const odysseyPlans = data.odysseyPlans || []
  const analytics = data.analytics || {}
  
  // Calculate real progress metrics from database
  const progressMetrics = {
    sessions: 0,
    odysseyPlans: 0,
    srmSurveys: 0,
    overall: 0
  }

  // Calculate actual session completion rate
  let completedSessionStudents = 0
  students.forEach(student => {
    const first = student.semesterData?.firstSemester?.sessionsCompleted || 0
    const second = student.semesterData?.secondSemester?.sessionsCompleted || 0
    const total = first + second
    if (total > 0) {
      completedSessionStudents++
    }
  })
  progressMetrics.sessions = students.length > 0 ? Math.round((completedSessionStudents / students.length) * 100) : 0

  // Calculate actual Odyssey Plan completion rate
  const completedOdysseyPlans = students.filter(student => student.odysseyPlanCompleted).length
  progressMetrics.odysseyPlans = students.length > 0 ? Math.round((completedOdysseyPlans / students.length) * 100) : 0

  // Calculate actual SRM Survey completion rate
  const completedSRMSurveys = students.filter(student => student.srmSurveyCompleted).length
  progressMetrics.srmSurveys = students.length > 0 ? Math.round((completedSRMSurveys / students.length) * 100) : 0

  // Overall average based on real data
  progressMetrics.overall = Math.round((progressMetrics.sessions + progressMetrics.odysseyPlans + progressMetrics.srmSurveys) / 3)

  const options = {
    chart: {
      type: 'radialBar',
      height: 320,
      fontFamily: 'Inter, sans-serif'
    },
    series: [progressMetrics.overall, progressMetrics.sessions, progressMetrics.odysseyPlans, progressMetrics.srmSurveys],
    labels: ['Overall Progress', 'SSP Sessions', 'Odyssey Plans', 'SRM Surveys'],
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '14px',
            fontWeight: 600
          },
          value: {
            fontSize: '16px',
            fontWeight: 700,
            formatter: (val) => `${val}%`
          },
          total: {
            show: true,
            label: 'Overall',
            fontSize: '16px',
            fontWeight: 600,
            formatter: () => `${progressMetrics.overall}%`
          }
        }
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '14px'
    }
  }

  const progressElement = document.querySelector("#progressOverviewChart")
  if (progressElement) {
    if (charts.progressOverview) {
      charts.progressOverview.destroy()
    }
    charts.progressOverview = new ApexCharts(progressElement, options)
    charts.progressOverview.render()
  } else {
    console.error('Progress overview chart element not found')
  }
}

// 2. Enrollment Risk Prediction Chart
const initEnrollmentRiskChart = (ApexCharts, data) => {
  // Filter students who have sufficient data for risk assessment
  const eligibleStudents = (data.students || []).filter(student => {
    // Only include students who have been active for at least 30 days
    const enrollmentDate = new Date(student.enrollmentDate || student.createdAt)
    const daysSinceEnrollment = (Date.now() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)
    
    // Must have been enrolled for at least 30 days to be assessed
    if (daysSinceEnrollment < 30) return false
    
    // Must have some activity (session completions, consultations, or submissions)
    const hasActivity = student.semesterData?.firstSemester?.sessionsCompleted > 0 ||
                       student.semesterData?.secondSemester?.sessionsCompleted > 0 ||
                       student.odysseyPlanCompleted ||
                       student.srmSurveyCompleted
    
    return hasActivity
  })

  // Recalculate risk levels based on eligible students only
  const riskCounts = { critical: 0, high: 0, medium: 0, low: 0 }
  
  eligibleStudents.forEach(student => {
    let riskScore = 0
    
    // Session completion risk (40% weight)
    const firstSemComplete = student.semesterData?.firstSemester?.sessionsCompleted || 0
    const secondSemComplete = student.semesterData?.secondSemester?.sessionsCompleted || 0
    const totalSessions = firstSemComplete + secondSemComplete
    const sessionCompletionRate = totalSessions > 0 ? Math.min(100, (totalSessions / 20) * 100) : 0
    
    if (sessionCompletionRate < 30) riskScore += 40
    else if (sessionCompletionRate < 50) riskScore += 25
    else if (sessionCompletionRate < 70) riskScore += 15
    
    // Requirements completion risk (30% weight)
    if (!student.odysseyPlanCompleted) riskScore += 20
    if (!student.srmSurveyCompleted) riskScore += 10
    
    // Financial concern indicator (20% weight) - would need consultation data
    // For now, random assignment based on risk factors
    if (sessionCompletionRate < 50 && !student.odysseyPlanCompleted) riskScore += 20
    
    // Engagement risk (10% weight)
    const recentActivity = Date.now() - new Date(student.updatedAt || student.createdAt).getTime()
    const daysSinceActivity = recentActivity / (1000 * 60 * 60 * 24)
    if (daysSinceActivity > 30) riskScore += 10
    
    // Categorize risk level
    if (riskScore >= 70) riskCounts.critical++
    else if (riskScore >= 50) riskCounts.high++
    else if (riskScore >= 30) riskCounts.medium++
    else riskCounts.low++
  })

  const totalEligible = eligibleStudents.length
  
  const options = {
    chart: {
      type: 'donut',
      height: 320,
      fontFamily: 'Inter, sans-serif'
    },
    series: [
      riskCounts.critical,
      riskCounts.high,
      riskCounts.medium,
      riskCounts.low
    ],
    labels: ['Critical Risk', 'High Risk', 'Medium Risk', 'Low Risk'],
    colors: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              formatter: (val) => val
            },
            total: {
              show: true,
              label: 'Assessed Students',
              fontSize: '12px',
              fontWeight: 600,
              formatter: () => `${totalEligible}`
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '14px',
      fontWeight: 500
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} students`
      }
    },
    noData: {
      text: totalEligible === 0 ? 'No students with sufficient data for assessment' : undefined
    }
  }

  const riskElement = document.querySelector("#enrollmentRiskChart")
  if (riskElement) {
    if (charts.enrollmentRisk) {
      charts.enrollmentRisk.destroy()
    }
    charts.enrollmentRisk = new ApexCharts(riskElement, options)
    charts.enrollmentRisk.render()
  } else {
    console.error('Enrollment risk chart element not found')
  }
}

// 3. Monthly SSP Service Trends Chart (REAL DATABASE DATA)
const initMonthlyTrendsChart = (ApexCharts, data, filteredStudents = null) => {
  const students = filteredStudents || data.students || []
  const sessions = data.sessions || []
  const odysseyPlans = data.odysseyPlans || []
  const mmSubmissions = data.mmSubmissions || []
  
  // Calculate real monthly data from actual database records
  const months = []
  const sessionCompletions = []
  const odysseySubmissions = []
  const mmSubmissionRates = []
  
  // Get last 6 months of data
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date()
    monthStart.setMonth(monthStart.getMonth() - i)
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    
    const monthEnd = new Date(monthStart)
    monthEnd.setMonth(monthEnd.getMonth() + 1)
    
    months.push(monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
    
    // Count actual session completions for this month
    const monthlySessionCompletions = sessions.filter(session => {
      const completionDate = new Date(session.completionDate || session.updatedAt)
      return completionDate >= monthStart && completionDate < monthEnd && session.completed
    }).length
    
    // Count actual odyssey plan submissions for this month
    const monthlyOdysseySubmissions = odysseyPlans.filter(plan => {
      const submissionDate = new Date(plan.submittedAt || plan.createdAt)
      return submissionDate >= monthStart && submissionDate < monthEnd && plan.status === 'Submitted'
    }).length
    
    // Count actual M&M submissions for this month
    const monthlyMMSubmissions = mmSubmissions.filter(mm => {
      const submissionDate = new Date(mm.submissionDate || mm.createdAt)
      return submissionDate >= monthStart && submissionDate < monthEnd
    }).length
    
    // Count active students for this month (enrolled before month end)
    const activeStudentsThisMonth = students.filter(student => {
      const enrollmentDate = new Date(student.enrollmentDate || student.createdAt)
      return enrollmentDate <= monthEnd
    }).length
    
    // Calculate actual completion rates
    const sessionRate = activeStudentsThisMonth > 0 ? (monthlySessionCompletions / activeStudentsThisMonth) * 100 : 0
    const odysseyRate = activeStudentsThisMonth > 0 ? (monthlyOdysseySubmissions / activeStudentsThisMonth) * 100 : 0
    const mmRate = activeStudentsThisMonth > 0 ? (monthlyMMSubmissions / activeStudentsThisMonth) * 100 : 0
    
    sessionCompletions.push(Math.round(sessionRate))
    odysseySubmissions.push(Math.round(odysseyRate))
    mmSubmissionRates.push(Math.round(mmRate))
  }

  const options = {
    chart: {
      type: 'area',
      height: 320,
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false }
    },
    series: [
      { name: 'SSP Session Completions', data: sessionCompletions },
      { name: 'Odyssey Plan Submissions', data: odysseySubmissions },
      { name: 'M&M Exam Submissions', data: mmSubmissionRates }
    ],
    xaxis: {
      categories: months,
      labels: { style: { fontSize: '12px' } }
    },
    yaxis: {
      title: { text: 'Service Completion Rate (%)' },
      max: 100
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    legend: {
      position: 'top',
      fontSize: '14px'
    },
    dataLabels: { enabled: false },
    tooltip: {
      y: { formatter: (val) => `${val}% completion rate` }
    }
  }

  const trendsElement = document.querySelector("#monthlyTrendsChart")
  if (trendsElement) {
    if (charts.monthlyTrends) {
      charts.monthlyTrends.destroy()
    }
    charts.monthlyTrends = new ApexCharts(trendsElement, options)
    charts.monthlyTrends.render()
  } else {
    console.error('Monthly trends chart element not found')
  }
}

// 4. Class Performance Comparison Chart (REAL DATABASE DATA)
const initClassPerformanceChart = (ApexCharts, data) => {
  const classes = data.classes || []
  const students = data.students || []
  const sessions = data.sessions || []
  
  // Group students by class and calculate real completion rates
  const classPerformance = {}
  
  students.forEach(student => {
    const classKey = `${student.classDetails?.yearLevel || ''} ${student.classDetails?.section || ''} ${student.major || ''}`.trim()
    if (classKey && classKey !== '') {
      if (!classPerformance[classKey]) {
        classPerformance[classKey] = { total: 0, sessionsCompleted: 0, odysseyCompleted: 0, srmCompleted: 0 }
      }
      classPerformance[classKey].total++
      
      // Count actual completions
      const hasSessionProgress = (student.semesterData?.firstSemester?.sessionsCompleted || 0) + 
                                (student.semesterData?.secondSemester?.sessionsCompleted || 0) > 0
      if (hasSessionProgress) classPerformance[classKey].sessionsCompleted++
      if (student.odysseyPlanCompleted) classPerformance[classKey].odysseyCompleted++
      if (student.srmSurveyCompleted) classPerformance[classKey].srmCompleted++
    }
  })

  const classNames = Object.keys(classPerformance).slice(0, 8) // Top 8 classes
  const completionRates = classNames.map(name => {
    const classData = classPerformance[name]
    if (classData.total === 0) return 0
    
    // Calculate overall completion rate (sessions + odyssey + srm) / 3
    const sessionRate = (classData.sessionsCompleted / classData.total) * 100
    const odysseyRate = (classData.odysseyCompleted / classData.total) * 100
    const srmRate = (classData.srmCompleted / classData.total) * 100
    
    return Math.round((sessionRate + odysseyRate + srmRate) / 3)
  })

  const options = {
    chart: {
      type: 'bar',
      height: 320,
      fontFamily: 'Inter, sans-serif'
    },
    series: [{
      name: 'Completion Rate',
      data: completionRates
    }],
    xaxis: {
      categories: classNames,
      labels: {
        style: { fontSize: '10px' },
        rotate: -45
      }
    },
    yaxis: {
      title: { text: 'Completion Rate (%)' },
      max: 100
    },
    colors: ['#10b981'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '60%'
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`
    },
    tooltip: {
      y: { formatter: (val) => `${val}%` }
    }
  }

  const classElement = document.querySelector("#classPerformanceChart")
  if (classElement) {
    if (charts.classPerformance) {
      charts.classPerformance.destroy()
    }
    charts.classPerformance = new ApexCharts(classElement, options)
    charts.classPerformance.render()
  } else {
    console.error('Class performance chart element not found')
  }
}

// 5. Student Activity/Engagement Chart (REAL DATABASE DATA)
const initStudentActivityChart = (ApexCharts, data) => {
  const students = data.students || []
  const sessions = data.sessions || []
  const consultations = data.consultations || []
  
  const activityData = {
    active: 0,
    recently_active: 0,
    inactive: 0,
    never_active: 0
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  
  // Calculate real activity based on actual database data
  students.forEach(student => {
    const studentId = student._id
    
    // Check recent session activity
    const recentSessions = sessions.filter(session => 
      session.student === studentId && 
      new Date(session.completionDate || session.updatedAt) >= sevenDaysAgo
    )
    
    // Check recent consultation activity
    const recentConsultations = consultations.filter(consultation =>
      consultation.bookings?.some(booking => 
        booking.student === studentId && 
        new Date(booking.bookedAt) >= sevenDaysAgo
      )
    )
    
    // Check any activity in last 30 days
    const monthlyActivity = sessions.filter(session => 
      session.student === studentId && 
      new Date(session.completionDate || session.updatedAt) >= thirtyDaysAgo
    ).length + consultations.filter(consultation =>
      consultation.bookings?.some(booking => 
        booking.student === studentId && 
        new Date(booking.bookedAt) >= thirtyDaysAgo
      )
    ).length
    
    // Check any activity in last 90 days
    const quarterlyActivity = sessions.filter(session => 
      session.student === studentId && 
      new Date(session.completionDate || session.updatedAt) >= ninetyDaysAgo
    ).length + consultations.filter(consultation =>
      consultation.bookings?.some(booking => 
        booking.student === studentId && 
        new Date(booking.bookedAt) >= ninetyDaysAgo
      )
    ).length
    
    // Categorize based on real activity
    if (recentSessions.length > 0 || recentConsultations.length > 0) {
      activityData.active++
    } else if (monthlyActivity > 0) {
      activityData.recently_active++
    } else if (quarterlyActivity > 0) {
      activityData.inactive++
    } else {
      activityData.never_active++
    }
  })

  const options = {
    chart: {
      type: 'donut',
      height: 320,
      fontFamily: 'Inter, sans-serif'
    },
    series: [activityData.active, activityData.recently_active, activityData.inactive, activityData.never_active],
    labels: ['Active (< 7 days)', 'Recently Active (< 30 days)', 'Inactive (< 90 days)', 'Never Active'],
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            name: {
              fontSize: '14px',
              fontWeight: 600
            },
            value: {
              fontSize: '18px',
              fontWeight: 700
            },
            total: {
              show: true,
              label: 'Total Students',
              fontSize: '14px',
              fontWeight: 600,
              formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '12px'
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} students`
      }
    }
  }

  const activityElement = document.querySelector("#studentActivityChart")
  if (activityElement) {
    if (charts.studentActivity) {
      charts.studentActivity.destroy()
    }
    charts.studentActivity = new ApexCharts(activityElement, options)
    charts.studentActivity.render()
  } else {
    console.error('Student activity chart element not found')
  }
}


// Cleanup charts on unmount
const cleanup = () => {
  Object.values(charts).forEach(chart => {
    if (chart && chart.destroy) {
      chart.destroy()
    }
  })
  charts = {}
}

// Handle window resize
const handleResize = () => {
  Object.values(charts).forEach(chart => {
    if (chart && chart.updateOptions) {
      chart.updateOptions({}, false, true)
    }
  })
}

// Auto-refresh functionality for real-time data
let refreshInterval = null

const startAutoRefresh = () => {
  // Refresh data every 5 minutes for real-time updates
  refreshInterval = setInterval(() => {
    console.log('Auto-refreshing analytics data...')
    if (!loading.value) {
      initializeCharts()
    }
  }, 5 * 60 * 1000) // 5 minutes
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

onMounted(() => {
  initializeCharts()
  window.addEventListener('resize', handleResize)
  startAutoRefresh()
})

onUnmounted(() => {
  cleanup()
  window.removeEventListener('resize', handleResize)
  stopAutoRefresh()
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
