<template>
  <div class="space-y-8 p-6 bg-gray-50 min-h-screen">
    <!-- Welcome Header - Minimal Design -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-light text-gray-800">Good {{ getTimeGreeting() }}, {{ adviserName }}</h1>
          <p class="text-gray-500 mt-2 font-light">Your student success overview</p>
        </div>
        <div class="grid grid-cols-2 gap-6 text-center">
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div class="text-2xl font-light text-gray-800">{{ dashboardStats.totalStudents }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide">Students</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div class="text-2xl font-light text-gray-800">{{ dashboardStats.totalClasses }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide">Classes</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Analytics Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Student Engagement Score -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-800">Student Engagement</h3>
          <div class="w-2 h-2 rounded-full bg-green-400"></div>
        </div>
        <div class="text-3xl font-light text-gray-800 mb-2">{{ engagementScore }}%</div>
        <div class="flex items-center">
          <div class="flex-1 bg-gray-100 rounded-full h-2">
            <div class="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500" 
                 :style="{ width: engagementScore + '%' }"></div>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-3">Based on submission rates and participation</p>
      </div>

      <!-- At-Risk Students -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-800">At-Risk Students</h3>
          <div class="w-2 h-2 rounded-full" :class="atRiskStudents.length > 0 ? 'bg-red-400' : 'bg-green-400'"></div>
        </div>
        <div class="text-3xl font-light text-gray-800 mb-2">{{ atRiskStudents.length }}</div>
        <div class="space-y-2">
          <div v-for="student in atRiskStudents.slice(0, 3)" :key="student.id" 
               class="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
            {{ student.name }}
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-3">Declining submission patterns detected</p>
      </div>

      <!-- Submission Quality -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-800">Submission Quality</h3>
          <div class="w-2 h-2 rounded-full bg-blue-400"></div>
        </div>
        <div class="text-3xl font-light text-gray-800 mb-2">{{ submissionQuality }}%</div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Accepted</span>
            <span class="text-gray-800">{{ acceptedSubmissions }}%</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Rejected</span>
            <span class="text-gray-800">{{ rejectedSubmissions }}%</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-3">First-time acceptance rate</p>
      </div>
    </div>
    
    <!-- Class Selection - Minimal Design -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-medium text-gray-800">Class Analytics</h2>
        <div class="flex items-center space-x-4">
          <label class="text-sm font-medium text-gray-600">Class:</label>
          <select v-model="selectedClassId" @change="loadClassAnalytics" 
                  class="border border-gray-200 rounded-lg px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent">
            <option value="">All Classes</option>
            <option v-for="classItem in classes" :key="classItem.class._id" :value="classItem.class._id">
              {{ getClassTitle(classItem) }} - {{ getClassSection(classItem) }}
            </option>
          </select>
        </div>
      </div>

      <!-- Selected Class Info - Minimal -->
      <div v-if="selectedClass" class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-800">{{ getClassTitle(selectedClass) }}</h3>
            <p class="text-sm text-gray-500">{{ getClassYearAndMajor(selectedClass) }} - {{ getClassSection(selectedClass) }}</p>
          </div>
          <div class="text-center">
            <div class="text-2xl font-light text-gray-800">{{ selectedClass.class?.students?.length || 0 }}</div>
            <div class="text-sm text-gray-500">Students</div>
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
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <canvas ref="sspProgressChart" width="400" height="300"></canvas>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            Track student session completion rates over time to identify trends and predict completion likelihood.
          </p>
        </div>

        <!-- M&M Submission Timeline Chart -->
        <div v-if="chartData.mmTimeline && chartData.mmTimeline.labels && chartData.mmTimeline.labels.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">M&M Submission Timeline</h3>
          <div class="relative" style="height: 300px;">
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <canvas ref="mmTimelineChart" width="400" height="300"></canvas>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            Monitor M&M submission patterns to predict and prevent late submissions.
          </p>
        </div>

        <!-- Consultation Insights Chart -->
        <div v-if="chartData.consultations && chartData.consultations.labels && chartData.consultations.labels.length > 0 && chartData.consultations.labels[0] !== 'No Data'" class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Consultation Insights</h3>
          <div class="relative" style="height: 300px;">
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <canvas ref="consultationChart" width="400" height="300"></canvas>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            Analyze consultation patterns by concern type to proactively address common student issues.
          </p>
        </div>

        <!-- No Data Available Message -->
        <div v-if="!loading && (!chartData.sspProgress || !chartData.mmTimeline || !chartData.consultations)" class="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center">
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
            <p class="text-gray-600">Chart data will be available once students start engaging with the system.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Pending Consultations -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
        <div class="flex items-center">
          <div class="bg-orange-100 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ dashboardStats.pendingConsultations }}</h3>
            <p class="text-sm text-gray-600">Pending Consultations</p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/adviser/consultations" class="text-orange-600 hover:text-orange-700 text-sm font-medium">
            View Schedules →
          </router-link>
        </div>
      </div>

      <!-- Students Requiring Attention -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
        <div class="flex items-center">
          <div class="bg-red-100 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ selectedClassStats.studentsNeedingAttention || dashboardStats.studentsNeedingAttention }}</h3>
            <p class="text-sm text-gray-600">Need Attention</p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/adviser/classes" class="text-red-600 hover:text-red-700 text-sm font-medium">
            View Details →
          </router-link>
        </div>
      </div>
      
      <!-- SSP Completion Rate -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
        <div class="flex items-center">
          <div class="bg-green-100 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ selectedClassStats.avgSSPCompletion || dashboardStats.avgSSPCompletion }}%</h3>
            <p class="text-sm text-gray-600">Avg SSP Completion</p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/adviser/classes" class="text-green-600 hover:text-green-700 text-sm font-medium">
            View Progress →
          </router-link>
        </div>
      </div>
      
      <!-- Academic Requirements -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
        <div class="flex items-center">
          <div class="bg-blue-100 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ selectedClassStats.requirementsCompletion || dashboardStats.requirementsCompletion }}%</h3>
            <p class="text-sm text-gray-600">Requirements Complete</p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/adviser/odyssey" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Requirements →
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Advisory Classes Overview -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Your Advisory Classes</h2>
        <router-link to="/adviser/classes" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Manage All Classes →
        </router-link>
      </div>
      
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else-if="classes.length === 0" class="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="text-gray-500">No advisory classes assigned yet</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="classItem in classes" :key="classItem.class._id" class="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-semibold text-gray-800 text-lg">{{ getClassTitle(classItem) }}</h3>
              <p class="text-sm text-gray-600">{{ getClassYearAndMajor(classItem) }}</p>
            </div>
            <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              {{ getClassSection(classItem) }}
            </span>
          </div>
          
          <!-- Class Metrics -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ classItem.class?.students?.length || 0 }}</div>
              <div class="text-xs text-gray-500">Students</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ getClassCompletionRate(classItem) }}%</div>
              <div class="text-xs text-gray-500">Completion</div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>Class Progress</span>
              <span>{{ getClassCompletionRate(classItem) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full transition-all duration-300" 
                   :style="{ width: `${getClassCompletionRate(classItem)}%` }"></div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="flex space-x-2">
            <router-link :to="`/adviser/classes`" 
                        class="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
              Manage
            </router-link>
            <router-link :to="`/adviser/attendance`" 
                        class="flex-1 bg-gray-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-gray-700 transition-colors">
              Attendance
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Dashboard -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Student Progress Analytics -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Student Progress Analytics</h3>
        <div class="space-y-4">
          <!-- SSP Progress Chart -->
          <div>
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span>SSP Sessions Completion</span>
              <span>{{ selectedClassStats.avgSSPCompletion || dashboardStats.avgSSPCompletion }}% average</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="text-center">
                <div class="bg-red-100 text-red-800 py-1 rounded">{{ dashboardStats.sspProgress.behind }}%</div>
                <div class="text-gray-500 mt-1">Behind</div>
              </div>
              <div class="text-center">
                <div class="bg-yellow-100 text-yellow-800 py-1 rounded">{{ dashboardStats.sspProgress.onTrack }}%</div>
                <div class="text-gray-500 mt-1">On Track</div>
              </div>
              <div class="text-center">
                <div class="bg-green-100 text-green-800 py-1 rounded">{{ dashboardStats.sspProgress.ahead }}%</div>
                <div class="text-gray-500 mt-1">Ahead</div>
              </div>
            </div>
          </div>
          
          <!-- Requirements Completion -->
          <div>
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span>Academic Requirements</span>
              <span>{{ selectedClassStats.requirementsCompletion || dashboardStats.requirementsCompletion }}% completed</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                   :style="{ width: `${selectedClassStats.requirementsCompletion || dashboardStats.requirementsCompletion}%` }"></div>
            </div>
          </div>
          
          <!-- M&M Submissions -->
          <div>
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span>M&M Submissions</span>
              <span>{{ selectedClassStats.mmSubmissionRate || dashboardStats.mmSubmissionRate }}% submitted</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-purple-500 h-3 rounded-full transition-all duration-300" 
                   :style="{ width: `${selectedClassStats.mmSubmissionRate || dashboardStats.mmSubmissionRate}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Consultation Analytics -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Consultation Analytics</h3>
        <div class="space-y-4">
          <!-- Consultation Status Distribution -->
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="bg-yellow-50 p-3 rounded-lg">
              <div class="text-2xl font-bold text-yellow-600">{{ dashboardStats.consultations.pending }}</div>
              <div class="text-xs text-yellow-700">Pending</div>
            </div>
            <div class="bg-blue-50 p-3 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ dashboardStats.consultations.confirmed }}</div>
              <div class="text-xs text-blue-700">Confirmed</div>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ dashboardStats.consultations.completed }}</div>
              <div class="text-xs text-green-700">Completed</div>
            </div>
          </div>
          
          <!-- Top Consultation Concerns -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">Top Consultation Concerns</h4>
            <div class="space-y-2">
              <div v-for="concern in dashboardStats.topConcerns" :key="concern.name" class="flex justify-between">
                <span class="text-sm text-gray-600">{{ concern.name }}</span>
                <span class="text-sm font-medium text-gray-900">{{ concern.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities & Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Activities -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Recent Activities</h3>
          <router-link to="/adviser/activity" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All →
          </router-link>
        </div>
        
        <div v-if="loadingActivities" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        
        <div v-else-if="activities.length === 0" class="text-center py-6">
          <p class="text-gray-500 text-sm">No recent activities</p>
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="(activity, index) in activities.slice(0, 5)" :key="index" 
               class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div class="flex-shrink-0">
              <div :class="getActivityIconClass(activity.type)" class="w-8 h-8 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
              <p class="text-xs text-gray-600">{{ activity.description }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatTime(activity.createdAt || activity.time) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Alerts -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Priority Alerts</h3>
        
        <div v-if="alerts.length === 0" class="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-green-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-500 text-sm">All students are on track!</p>
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="(alert, index) in alerts.slice(0, 5)" :key="index" 
               class="flex items-start space-x-3 p-3 rounded-lg"
               :class="getAlertClass(alert.priority)">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   class="w-5 h-5"
                   :class="getAlertIconClass(alert.priority)"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium" :class="getAlertTextClass(alert.priority)">{{ alert.student }}</p>
              <p class="text-xs" :class="getAlertDescClass(alert.priority)">{{ alert.message }}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs" :class="getAlertDescClass(alert.priority)">{{ alert.category }}</span>
                <button class="text-xs underline" :class="getAlertLinkClass(alert.priority)">
                  Take Action
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions - Minimal Grid -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <router-link to="/adviser/classes" class="flex flex-col items-center p-6 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
          <div class="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-3">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span class="text-sm font-medium text-center text-gray-700">Classes</span>
        </router-link>
        
        <router-link to="/adviser/consultations" class="flex flex-col items-center p-6 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
          <div class="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-3">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-center text-gray-700">Meetings</span>
        </router-link>
        
        <router-link to="/adviser/odyssey" class="flex flex-col items-center p-6 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
          <div class="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-3">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span class="text-sm font-medium text-center text-gray-700">Odyssey</span>
        </router-link>
        
        <router-link to="/adviser/mm" class="flex flex-col items-center p-6 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
          <div class="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-3">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-center text-gray-700">M&M</span>
        </router-link>
        
        <router-link to="/adviser/attendance" class="flex flex-col items-center p-6 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
          <div class="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-3">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span class="text-sm font-medium text-center text-gray-700">Attendance</span>
        </router-link>
        
        <router-link to="/adviser/announcements" class="flex flex-col items-center p-6 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
          <div class="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-3">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-center text-gray-700">Announce</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { notificationService } from '../../services/notificationService'
import { adviserService } from '../../services/adviserService'
import api from '../../services/api'
import Chart from 'chart.js/auto'

const authStore = useAuthStore()

// Reactive data
const loading = ref(true)
const loadingActivities = ref(true)
const classes = ref([])
const activities = ref([])
const alerts = ref([])
const selectedClassId = ref('')
const selectedClass = ref(null)
const selectedClassStats = ref({})
const chartData = ref({
  sspProgress: null,
  mmTimeline: null,
  consultations: null
})

// Enhanced Analytics Data - Real Data
const engagementScore = ref(0)
const atRiskStudents = ref([])
const submissionQuality = ref(0)
const acceptedSubmissions = ref(0)
const rejectedSubmissions = ref(0)
const multipleAttachments = ref(0)
const onTimeSubmissions = ref(0)
const avgFileSize = ref(0)
const onTimeCompletionPrediction = ref(0)
const needSupportPrediction = ref(0)
const atRiskPrediction = ref(0)

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
  pendingConsultations: 0,
  studentsNeedingAttention: 0,
  avgSSPCompletion: 0,
  pendingRequirements: 0,
  requirementsCompletion: 0,
  mmSubmissionRate: 0,
  sspProgress: {
    behind: 0,
    onTrack: 0,
    ahead: 0
  },
  consultations: {
    pending: 0,
    confirmed: 0,
    completed: 0
  },
  topConcerns: []
})

// Computed
const adviserName = computed(() => {
  if (!authStore.user) return 'Adviser'
  return `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`.trim()
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
      loadActivities(),
      loadAlerts()
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

const loadAdviserClasses = async () => {
  try {
    const response = await api.get('/advisers/my/classes')
    classes.value = response.data || []
    
    dashboardStats.value.totalClasses = classes.value.length
    dashboardStats.value.totalStudents = classes.value.reduce((sum, cls) => sum + (cls.class?.students?.length || 0), 0)
    
    // Load overall analytics for all classes
    await loadOverallAnalytics()
    
         // Calculate real enhanced analytics
     await calculateRealAnalytics()
     
     console.log('Real Analytics Calculated:', {
       engagementScore: engagementScore.value,
       atRiskStudents: atRiskStudents.value,
       submissionQuality: submissionQuality.value,
       acceptedSubmissions: acceptedSubmissions.value,
       rejectedSubmissions: rejectedSubmissions.value
     })
     
   } catch (error) {
     console.error('Error loading adviser classes:', error)
    classes.value = []
  }
}

const calculateRealAnalytics = async () => {
  try {
    let totalStudents = 0
    let totalSubmissions = 0
    let totalRejected = 0
    let totalAccepted = 0
    let totalOnTime = 0
    let totalMultipleAttachments = 0
    let totalFileSize = 0
    let fileCount = 0
    const studentsAtRisk = []
    
    // Calculate metrics from real class data
    for (const classItem of classes.value) {
      if (classItem.class?.students) {
        totalStudents += classItem.class.students.length
        
        // Get session data for each student in the class
        try {
          const sessionsResponse = await api.get(`/sessions/class/matrix/${classItem.class._id}`)
          const sessions = sessionsResponse.data.sessions || []
          
          // Analyze each student's sessions
          for (const studentId in sessions) {
            const studentSessions = sessions[studentId] || []
            let studentSubmissions = 0
            let studentRejections = 0
            let studentOnTime = 0
            let studentMultipleAttachments = 0
            let studentLateSubmissions = 0
            
            studentSessions.forEach(session => {
              if (session.hasAttachment) {
                totalSubmissions++
                studentSubmissions++
                
                // Check for rejections
                if (session.rejectionStatus === 'rejected') {
                  totalRejected++
                  studentRejections++
                } else {
                  totalAccepted++
                }
                
                // Check for multiple attachments
                if (session.attachments && session.attachments.length > 1) {
                  totalMultipleAttachments++
                  studentMultipleAttachments++
                }
                
                // Calculate file sizes
                if (session.attachments) {
                  session.attachments.forEach(attachment => {
                    if (attachment.size) {
                      totalFileSize += attachment.size
                      fileCount++
                    }
                  })
                } else if (session.attachmentSize) {
                  totalFileSize += session.attachmentSize
                  fileCount++
                }
                
                // Check timeliness (simplified - could be enhanced with due dates)
                if (session.submittedAt) {
                  const submissionDate = new Date(session.submittedAt)
                  const now = new Date()
                  const daysDiff = Math.floor((now - submissionDate) / (1000 * 60 * 60 * 24))
                  
                  if (daysDiff <= 1) { // Submitted within 1 day of due date
                    totalOnTime++
                    studentOnTime++
                  } else {
                    studentLateSubmissions++
                  }
                }
              }
            })
            
            // Identify at-risk students
            const rejectionRate = studentSubmissions > 0 ? (studentRejections / studentSubmissions) * 100 : 0
            const lateRate = studentSubmissions > 0 ? (studentLateSubmissions / studentSubmissions) * 100 : 0
            
            if (rejectionRate > 30 || lateRate > 50 || studentSubmissions < studentSessions.length * 0.5) {
              // Find student details
              const student = classItem.class.students.find(s => s._id === studentId)
              if (student && student.user) {
                studentsAtRisk.push({
                  id: studentId,
                  name: `${student.user.firstName} ${student.user.lastName}`,
                  rejectionRate: Math.round(rejectionRate),
                  lateRate: Math.round(lateRate)
                })
              }
            }
          }
        } catch (error) {
          console.error(`Error loading session data for class ${classItem.class._id}:`, error)
        }
      }
    }
    
    // Calculate final metrics
    engagementScore.value = totalStudents > 0 && totalSubmissions > 0 
      ? Math.round(((totalSubmissions / (totalStudents * 10)) * 100)) // Assuming 10 sessions per student
      : 0
      
    atRiskStudents.value = studentsAtRisk
    
    submissionQuality.value = totalSubmissions > 0 
      ? Math.round((totalAccepted / totalSubmissions) * 100)
      : 0
      
    acceptedSubmissions.value = totalSubmissions > 0 
      ? Math.round((totalAccepted / totalSubmissions) * 100)
      : 0
      
    rejectedSubmissions.value = totalSubmissions > 0 
      ? Math.round((totalRejected / totalSubmissions) * 100)
      : 0
      
    multipleAttachments.value = totalSubmissions > 0 
      ? Math.round((totalMultipleAttachments / totalSubmissions) * 100)
      : 0
      
    onTimeSubmissions.value = totalSubmissions > 0 
      ? Math.round((totalOnTime / totalSubmissions) * 100)
      : 0
      
    avgFileSize.value = fileCount > 0 
      ? Math.round((totalFileSize / fileCount) / (1024 * 1024) * 10) / 10 // Convert to MB
      : 0
      
    // Predictive analytics based on current performance
    const goodPerformanceRate = totalSubmissions > 0 ? (totalAccepted / totalSubmissions) : 0
    onTimeCompletionPrediction.value = Math.round(goodPerformanceRate * 100)
    needSupportPrediction.value = Math.round((1 - goodPerformanceRate) * 80) // 80% of struggling students need support
    atRiskPrediction.value = Math.round((studentsAtRisk.length / Math.max(totalStudents, 1)) * 100)
    
  } catch (error) {
    console.error('Error calculating real analytics:', error)
  }
}

const loadOverallAnalytics = async () => {
  try {
    let totalSSPCompletion = 0
    let totalRequirementsCompletion = 0
    let totalMMSubmission = 0
    let studentsNeedingAttention = 0
    
    const sspProgress = { behind: 0, onTrack: 0, ahead: 0 }
    
    for (const classItem of classes.value) {
      try {
        const analyticsResponse = await api.get(`/advisers/classes/${classItem.class._id}/analytics`)
        const analytics = analyticsResponse.data
        
        if (analytics) {
          totalSSPCompletion += analytics.avgSSPCompletion || 0
          totalRequirementsCompletion += analytics.requirementsCompletion || 0
          totalMMSubmission += analytics.mmSubmissionRate || 0
          studentsNeedingAttention += analytics.studentsNeedingAttention || 0
          
          if (analytics.sspProgress) {
            sspProgress.behind += analytics.sspProgress.behind || 0
            sspProgress.onTrack += analytics.sspProgress.onTrack || 0
            sspProgress.ahead += analytics.sspProgress.ahead || 0
          }
        }
      } catch (analyticsError) {
        console.warn(`Could not load analytics for class ${classItem.class._id}:`, analyticsError)
      }
    }
    
    const classCount = classes.value.length || 1
    dashboardStats.value.avgSSPCompletion = Math.round(totalSSPCompletion / classCount)
    dashboardStats.value.requirementsCompletion = Math.round(totalRequirementsCompletion / classCount)
    dashboardStats.value.mmSubmissionRate = Math.round(totalMMSubmission / classCount)
    dashboardStats.value.studentsNeedingAttention = studentsNeedingAttention
    
    const totalStudents = dashboardStats.value.totalStudents || 1
    dashboardStats.value.sspProgress.behind = Math.round((sspProgress.behind / totalStudents) * 100)
    dashboardStats.value.sspProgress.onTrack = Math.round((sspProgress.onTrack / totalStudents) * 100)
    dashboardStats.value.sspProgress.ahead = Math.round((sspProgress.ahead / totalStudents) * 100)
    
  } catch (error) {
    console.error('Error loading overall analytics:', error)
  }
}

const loadClassAnalytics = async () => {
  try {
    if (selectedClassId.value) {
      // Load specific class analytics
      selectedClass.value = classes.value.find(c => c.class._id === selectedClassId.value)
      
      const [analyticsResponse, chartDataResponse] = await Promise.all([
        api.get(`/advisers/classes/${selectedClassId.value}/analytics`),
        api.get(`/advisers/classes/${selectedClassId.value}/chart-data`)
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
        const chartDataResponse = await api.get('/advisers/chart-data')
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
  
  console.log('Loading charts with data:', data)
  
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
  
  // Wait a bit for DOM to be ready
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Create charts only if data is available and valid
  if (data.sspProgress && data.sspProgress.labels && data.sspProgress.labels.length > 0) {
    try {
      console.log('Creating SSP Progress chart with data:', data.sspProgress)
      createSSPProgressChart(data.sspProgress)
    } catch (error) {
      console.error('Error creating SSP Progress chart:', error)
    }
  }
  
  if (data.mmTimeline && data.mmTimeline.labels && data.mmTimeline.labels.length > 0) {
    try {
      console.log('Creating MM Timeline chart with data:', data.mmTimeline)
      createMMTimelineChart(data.mmTimeline)
    } catch (error) {
      console.error('Error creating MM Timeline chart:', error)
    }
  }
  
  if (data.consultations && data.consultations.labels && data.consultations.labels.length > 0 && data.consultations.labels[0] !== 'No Data') {
    try {
      console.log('Creating Consultation chart with data:', data.consultations)
      createConsultationChart(data.consultations)
    } catch (error) {
      console.error('Error creating Consultation chart:', error)
    }
  }
}

const createSSPProgressChart = (data) => {
  if (!sspProgressChart.value) {
    console.error('SSP Progress chart canvas ref not found')
    return
  }
  
  console.log('Creating SSP Progress chart with canvas:', sspProgressChart.value)
  
  const ctx = sspProgressChart.value.getContext('2d')
  sspProgressChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Average Completion %',
        data: data.completionRates,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }, {
        label: 'Target %',
        data: data.targets,
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
        },
        title: {
          display: false
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
  
  console.log('SSP Progress chart created successfully')
}

const createMMTimelineChart = (data) => {
  if (!mmTimelineChart.value) {
    console.error('MM Timeline chart canvas ref not found')
    return
  }
  
  console.log('Creating MM Timeline chart with canvas:', mmTimelineChart.value)
  
  const ctx = mmTimelineChart.value.getContext('2d')
  mmTimelineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'P1 Submissions',
        data: data.p1Submissions,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4
      }, {
        label: 'P2 Submissions',
        data: data.p2Submissions,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }, {
        label: 'P3 Submissions',
        data: data.p3Submissions,
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
  
  console.log('MM Timeline chart created successfully')
}

const createConsultationChart = (data) => {
  if (!consultationChart.value) {
    console.error('Consultation chart canvas ref not found')
    return
  }
  
  console.log('Creating Consultation chart with canvas:', consultationChart.value)
  
  const ctx = consultationChart.value.getContext('2d')
  consultationChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
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
  
  console.log('Consultation chart created successfully')
}

const loadConsultationStats = async () => {
  try {
    const response = await api.get('/consultations/adviser-stats')
    const stats = response.data
    
    if (stats) {
      dashboardStats.value.pendingConsultations = stats.pending || 0
      dashboardStats.value.consultations = {
        pending: stats.pending || 0,
        confirmed: stats.confirmed || 0,
        completed: stats.completed || 0
      }
      dashboardStats.value.topConcerns = stats.topConcerns || []
    }
    
  } catch (error) {
    console.error('Error loading consultation stats:', error)
  }
}

const loadStudentProgress = async () => {
  try {
    const response = await api.get('/advisers/student-progress-summary')
    const progress = response.data
    
    if (progress) {
      dashboardStats.value.pendingRequirements = progress.pendingRequirements || 0
    }
    
  } catch (error) {
    console.error('Error loading student progress:', error)
  }
}

const loadActivities = async () => {
  try {
    loadingActivities.value = true
    const response = await api.get('/advisers/recent-activities')
    activities.value = response.data || []
    
  } catch (error) {
    console.error('Error loading activities:', error)
    activities.value = []
  } finally {
    loadingActivities.value = false
  }
}

const loadAlerts = async () => {
  try {
    const response = await api.get('/advisers/priority-alerts')
    alerts.value = response.data || []
    
  } catch (error) {
    console.error('Error loading alerts:', error)
    alerts.value = []
  }
}

// Helper functions
const getClassTitle = (classItem) => {
  return classItem.class?.sspSubject?.name || classItem.class?.sspSubject?.sspCode || 'Unknown Subject'
}

const getClassSection = (classItem) => {
  return classItem.class?.section || 'N/A'
}

const getClassYearAndMajor = (classItem) => {
  const yearLevel = classItem.class?.yearLevel || ''
  const major = classItem.class?.major || ''
  return `${yearLevel} Year - ${major}`
}

const getClassCompletionRate = (classItem) => {
  return Math.round(Math.random() * 100) // Replace with real data
}

const formatTime = (time) => {
  if (!time) return ''
  
  const date = new Date(time)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / (1000 * 60))
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  
  if (diffDay > 0) return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`
  if (diffHour > 0) return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`
  if (diffMin > 0) return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`
  return 'Just now'
}

const getActivityIconClass = (type) => {
  const classes = {
    consultation: 'bg-orange-100 text-orange-600',
    ssp: 'bg-blue-100 text-blue-600',
    odyssey: 'bg-purple-100 text-purple-600',
    mm: 'bg-green-100 text-green-600',
    attendance: 'bg-indigo-100 text-indigo-600',
    default: 'bg-gray-100 text-gray-600'
  }
  return classes[type] || classes.default
}

const getAlertClass = (priority) => {
  const classes = {
    high: 'bg-red-50 border border-red-200',
    medium: 'bg-yellow-50 border border-yellow-200',
    low: 'bg-blue-50 border border-blue-200'
  }
  return classes[priority] || classes.low
}

const getAlertIconClass = (priority) => {
  const classes = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-blue-600'
  }
  return classes[priority] || classes.low
}

const getAlertTextClass = (priority) => {
  const classes = {
    high: 'text-red-900',
    medium: 'text-yellow-900',
    low: 'text-blue-900'
  }
  return classes[priority] || classes.low
}

const getAlertDescClass = (priority) => {
  const classes = {
    high: 'text-red-700',
    medium: 'text-yellow-700',
    low: 'text-blue-700'
  }
  return classes[priority] || classes.low
}

const getAlertLinkClass = (priority) => {
  const classes = {
    high: 'text-red-600 hover:text-red-800',
    medium: 'text-yellow-600 hover:text-yellow-800',
    low: 'text-blue-600 hover:text-blue-800'
  }
  return classes[priority] || classes.low
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script> 

<style scoped>
/* Additional custom styles if needed */
</style> 