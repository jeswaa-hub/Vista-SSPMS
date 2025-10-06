<template>
  <div class="min-h-screen p-6" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-8">
    <!-- Filters Section -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
      <div class="flex items-center space-x-4 mb-4">
        <!-- School Year Filter -->
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">School Year</label>
          <select v-model="selectedSchoolYear" class="w-full p-2 border border-gray-300 rounded-md text-sm">
            <option value="">All School Years</option>
            <option v-for="year in availableSchoolYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>

        <!-- Year Level Filter -->
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
          <select v-model="selectedYearLevel" class="w-full p-2 border border-gray-300 rounded-md text-sm">
            <option value="">All Year Levels</option>
            <option v-for="level in availableYearLevels" :key="level" :value="level">{{ level }}</option>
          </select>
        </div>

        <!-- Section Filter -->
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select v-model="selectedSection" class="w-full p-2 border border-gray-300 rounded-md text-sm">
            <option value="">All Sections</option>
            <option v-for="section in availableSections" :key="section" :value="section">{{ section }}</option>
          </select>
        </div>

        <!-- Major Filter -->
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Major</label>
          <select v-model="selectedMajor" class="w-full p-2 border border-gray-300 rounded-md text-sm">
            <option value="">All Majors</option>
            <option v-for="major in availableMajors" :key="major" :value="major">{{ major }}</option>
          </select>
          </div>

        <!-- Period Filter -->
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Period</label>
          <select v-model="selectedPeriod" class="w-full p-2 border border-gray-300 rounded-md text-sm">
            <option value="">All Periods</option>
            <option value="1">Period 1</option>
            <option value="2">Period 2</option>
            <option value="3">Period 3</option>
            <option value="4">Period 4</option>
          </select>
          </div>

        <!-- Status Filter -->
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="selectedStatus" class="w-full p-2 border border-gray-300 rounded-md text-sm">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="validated">Validated</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <!-- Refresh Button -->
        <div class="flex items-end">
        <button
          @click="refreshData"
          :disabled="loading"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Refresh data"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
    </div>

    <!-- Counter Section -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <div class="text-2xl font-semibold text-gray-800">{{ getTotalPermits() }}</div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Total Permits</div>
    </div>

      <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <div class="text-2xl font-semibold text-yellow-600">{{ getStatusCount('pending') }}</div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Pending</div>
      </div>

      <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <div class="text-2xl font-semibold text-green-600">{{ getStatusCount('validated') }}</div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Validated</div>
        </div>

      <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <div class="text-2xl font-semibold text-red-600">{{ getStatusCount('rejected') }}</div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Rejected</div>
      </div>
    </div>

    <!-- Unified container for Semester Tabs + Content -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-6" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button 
            @click="selectedSemester = '1st Semester'" 
            :class="[
              'py-4 px-6 text-sm font-medium border-b-2 focus:outline-none transition-colors',
              selectedSemester === '1st Semester' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            1st Semester
            <span v-if="getSemesterCount('1st Semester') > 0" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
              {{ getSemesterCount('1st Semester') }}
            </span>
          </button>
          <button 
            @click="selectedSemester = '2nd Semester'" 
            :class="[
              'py-4 px-6 text-sm font-medium border-b-2 focus:outline-none transition-colors',
              selectedSemester === '2nd Semester' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            2nd Semester
            <span v-if="getSemesterCount('2nd Semester') > 0" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
              {{ getSemesterCount('2nd Semester') }}
            </span>
          </button>
        </nav>
      </div>
      <!-- Move content inside same container -->
      <div>
    <!-- Loading State -->
        <div v-if="loading" class="p-6">
          <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        <span class="ml-3 text-gray-600">Loading permit submissions...</span>
      </div>
    </div>

        <!-- No Data State -->
        <div v-else-if="sortedClassGroups.length === 0" class="p-6">
      <div class="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Permit Submissions Found</h3>
            <p class="text-gray-600">No permit submissions match the current filters</p>
      </div>
    </div>

        <!-- Class Groups (students aggregated by periods) -->
        <div v-else class="space-y-6 p-6">
          <div v-for="classGroup in sortedClassGroups" :key="classGroup.key" class="border border-gray-200 rounded-lg overflow-hidden">
            <!-- Class Header -->
            <div class="bg-[#166534] px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
                  <div>
                    <h3 class="text-lg font-medium text-white">
                      {{ classGroup.yearLevel }} Year - Section {{ classGroup.section }}
                      <span v-if="classGroup.major" class="text-white">({{ classGroup.major }})</span>
                    </h3>
                    <p class="text-sm text-white">{{ classGroup.schoolYear }} • {{ selectedSemester }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-6">
                  <div class="text-center">
                    <div class="text-sm font-medium text-white">Total</div>
                    <div class="text-lg font-semibold text-white">{{ classGroup.totalStudents }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-medium text-white">Validated</div>
                    <div class="text-lg font-semibold text-white">{{ classGroup.validatedCount }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-medium text-white">Rate</div>
                    <div class="text-lg font-semibold text-white">{{ classGroup.validationRate }}%</div>
            </div>
            </div>
          </div>
        </div>
        
            <!-- Students Table -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Number</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P1</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P2</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P3</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="row in classGroup.studentsRows" :key="row.key" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ row.studentName }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ row.studentNumber }}</td>
                    <!-- P1 -->
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <template v-if="row.p1">
                        <div class="flex flex-col items-center space-y-1">
                          <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusBadgeClass(row.p1.status)">{{ getStatusText(row.p1.status) }}</div>
                          <div class="text-xs text-gray-500">{{ row.p1.referenceNumber || '—' }}</div>
                          <div v-if="row.p1.status === 'pending'" class="flex items-center space-x-2">
                            <button @click="validatePermit(row.p1._id, true)" class="text-green-600 hover:text-green-800 text-xs">Approve</button>
                            <button @click="validatePermit(row.p1._id, false)" class="text-red-600 hover:text-red-800 text-xs">Reject</button>
                          </div>
                        </div>
                      </template>
                      <span v-else class="text-xs text-gray-400">—</span>
                    </td>
                    <!-- P2 -->
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <template v-if="row.p2">
                        <div class="flex flex-col items-center space-y-1">
                          <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusBadgeClass(row.p2.status)">{{ getStatusText(row.p2.status) }}</div>
                          <div class="text-xs text-gray-500">{{ row.p2.referenceNumber || '—' }}</div>
                          <div v-if="row.p2.status === 'pending'" class="flex items-center space-x-2">
                            <button @click="validatePermit(row.p2._id, true)" class="text-green-600 hover:text-green-800 text-xs">Approve</button>
                            <button @click="validatePermit(row.p2._id, false)" class="text-red-600 hover:text-red-800 text-xs">Reject</button>
                          </div>
                        </div>
                      </template>
                      <span v-else class="text-xs text-gray-400">—</span>
                    </td>
                    <!-- P3 -->
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <template v-if="row.p3">
                        <div class="flex flex-col items-center space-y-1">
                          <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusBadgeClass(row.p3.status)">{{ getStatusText(row.p3.status) }}</div>
                          <div class="text-xs text-gray-500">{{ row.p3.referenceNumber || '—' }}</div>
                          <div v-if="row.p3.status === 'pending'" class="flex items-center space-x-2">
                            <button @click="validatePermit(row.p3._id, true)" class="text-green-600 hover:text-green-800 text-xs">Approve</button>
                            <button @click="validatePermit(row.p3._id, false)" class="text-red-600 hover:text-red-800 text-xs">Reject</button>
                          </div>
                        </div>
                      </template>
                      <span v-else class="text-xs text-gray-400">—</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <div class="inline-flex items-center space-x-3">
                        <button v-if="row.p1" @click="viewPermit(row.p1)" class="text-blue-600 hover:text-blue-800" title="View P1">View P1</button>
                        <button v-if="row.p2" @click="viewPermit(row.p2)" class="text-blue-600 hover:text-blue-800" title="View P2">View P2</button>
                        <button v-if="row.p3" @click="viewPermit(row.p3)" class="text-blue-600 hover:text-blue-800" title="View P3">View P3</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            </div>
            </div>
          </div>
        </div>
        
    <!-- Loading State (old outer container) -->
    <div v-if="false && loading" class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        <span class="ml-3 text-gray-600">Loading permit submissions...</span>
          </div>
        </div>
        
    <!-- No Data State -->
    <div v-else-if="false && sortedClassGroups.length === 0" class="bg-white rounded-lg shadow-sm p-6">
      <div class="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Permit Submissions Found</h3>
        <p class="text-gray-600">No permit submissions match the current filters</p>
      </div>
    </div>

    <!-- Class Groups -->
    <div v-else class="hidden">
      <div v-for="classGroup in sortedClassGroups" :key="classGroup.key" class="border border-gray-200 rounded-lg overflow-hidden">
        <!-- Class Header -->
        <div class="bg-[#166534] px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div>
                <h3 class="text-lg font-medium text-white">
                  {{ classGroup.yearLevel }} Year - Section {{ classGroup.section }}
                  <span v-if="classGroup.major" class="text-white">({{ classGroup.major }})</span>
                </h3>
                <p class="text-sm text-white">{{ classGroup.schoolYear }} • {{ selectedSemester }}</p>
            </div>
            </div>
            <div class="flex items-center space-x-6">
              <div class="text-center">
                <div class="text-sm font-medium text-white">Total</div>
                <div class="text-lg font-semibold text-white">{{ classGroup.totalStudents }}</div>
          </div>
              <div class="text-center">
                <div class="text-sm font-medium text-white">Validated</div>
                <div class="text-lg font-semibold text-white">{{ classGroup.validatedCount }}</div>
            </div>
              <div class="text-center">
                <div class="text-sm font-medium text-white">Rate</div>
                <div class="text-lg font-semibold text-white">{{ classGroup.validationRate }}%</div>
            </div>
          </div>
        </div>
      </div>

        <!-- Students Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Number</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference No.</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="permit in classGroup.permits" :key="permit._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ permit.studentName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ permit.studentNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    P{{ permit.period }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ permit.referenceNumber || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ permit.semester }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(permit.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusBadgeClass(permit.status)">
                    {{ getStatusText(permit.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <!-- View permit button -->
                    <button @click="viewPermit(permit)"
                            class="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View permit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                  </button>
                    
                    <!-- Validate button (only for pending permits) -->
                    <button v-if="permit.status === 'pending'"
                            @click="validatePermit(permit._id, true)"
                            class="text-green-600 hover:text-green-800 transition-colors"
                            title="Approve permit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                  </button>
                    
                    <!-- Reject button (only for pending permits) -->
                    <button v-if="permit.status === 'pending'"
                            @click="validatePermit(permit._id, false)"
                            class="text-red-600 hover:text-red-800 transition-colors"
                            title="Reject permit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { examPermitService } from '../../services/examPermitService'
import { notificationService } from '../../services/notificationService'

// State
const loading = ref(false)
const permits = ref([])

// Filter options
const availableSchoolYears = ref([])
const availableYearLevels = ref([])
const availableSections = ref([])
const availableMajors = ref([])

// Selected filters
const selectedSchoolYear = ref('')
const selectedYearLevel = ref('')
const selectedSection = ref('')
const selectedMajor = ref('')
const selectedPeriod = ref('')
const selectedStatus = ref('')
const selectedSemester = ref('1st Semester')

// Computed properties
const filteredPermits = computed(() => {
  let filtered = permits.value

  // Filter by semester first
  if (selectedSemester.value) {
    filtered = filtered.filter(permit => permit.semester === selectedSemester.value)
  }

  if (selectedSchoolYear.value) {
    filtered = filtered.filter(permit => permit.schoolYear === selectedSchoolYear.value)
  }
  if (selectedYearLevel.value) {
    filtered = filtered.filter(permit => permit.class?.yearLevel === selectedYearLevel.value)
  }
  if (selectedSection.value) {
    filtered = filtered.filter(permit => permit.class?.section === selectedSection.value)
  }
  if (selectedMajor.value) {
    filtered = filtered.filter(permit => permit.class?.major === selectedMajor.value)
  }
  if (selectedPeriod.value) {
    filtered = filtered.filter(permit => permit.period === selectedPeriod.value)
  }
  if (selectedStatus.value) {
    filtered = filtered.filter(permit => permit.status === selectedStatus.value)
  }

  return filtered
})

const groupedClassView = computed(() => {
  const groups = {}
  
  filteredPermits.value.forEach(permit => {
    if (!permit.class) return
    
    const key = `${permit.class.yearLevel}-${permit.class.section}-${permit.class.major || 'No Major'}-${permit.schoolYear}`
    
    if (!groups[key]) {
      groups[key] = {
        key,
        yearLevel: permit.class.yearLevel,
        section: permit.class.section,
        major: permit.class.major,
        schoolYear: permit.schoolYear,
        permits: [],
        students: new Map()
      }
    }
    
    groups[key].permits.push(permit)
    const sid = String(permit.student?._id || permit.student)
    const existing = groups[key].students.get(sid) || {
      key: sid,
      studentId: sid,
      studentName: permit.studentName || 'Unknown',
      studentNumber: permit.studentNumber || 'Unknown',
      p1: null,
      p2: null,
      p3: null
    }
    if (permit.period === '1' || permit.period === 1) existing.p1 = permit
    if (permit.period === '2' || permit.period === 2) existing.p2 = permit
    if (permit.period === '3' || permit.period === 3) existing.p3 = permit
    groups[key].students.set(sid, existing)
  })
  
  // Calculate stats for each group
  Object.values(groups).forEach(group => {
    group.totalStudents = group.students.size
    group.validatedCount = group.permits.filter(p => p.status === 'validated').length
    group.validationRate = group.totalStudents > 0 ? Math.round((group.validatedCount / group.totalStudents) * 100) : 0
    group.studentsRows = Array.from(group.students.values())
  })
  
  return Object.values(groups)
})

const sortedClassGroups = computed(() => {
  return groupedClassView.value.sort((a, b) => {
    // Sort by school year (descending), then year level, then section
    if (a.schoolYear !== b.schoolYear) {
      return b.schoolYear.localeCompare(a.schoolYear)
    }
    if (a.yearLevel !== b.yearLevel) {
      return a.yearLevel.localeCompare(b.yearLevel)
    }
    return a.section.localeCompare(b.section)
  })
})

// Methods
const refreshData = async () => {
    await loadPermits()
}

const loadPermits = async () => {
  try {
    loading.value = true
    const response = await examPermitService.getAdviserPermitSubmissions()
    
    if (response.success) {
      permits.value = response.permits || []
      
      // Update filter options
      if (response.filterOptions) {
        availableSchoolYears.value = response.filterOptions.schoolYears || []
        availableYearLevels.value = response.filterOptions.yearLevels || []
        availableSections.value = response.filterOptions.sections || []
        availableMajors.value = response.filterOptions.majors || []
      }
    }
  } catch (error) {
    console.error('Error loading permits:', error)
    notificationService.showError('Failed to load permit submissions')
  } finally {
    loading.value = false
  }
}

const getFilteredCount = () => {
  return sortedClassGroups.value.length
}

const getStatusCount = (status) => {
  return filteredPermits.value.filter(permit => permit.status === status).length
}

const getTotalPermits = () => {
  return filteredPermits.value.length
}

const getSemesterCount = (semester) => {
  return permits.value.filter(permit => permit.semester === semester).length
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return 'Pending'
    case 'validated': return 'Approved'
    case 'rejected': return 'Rejected'
    default: return status
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'validated': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const viewPermit = (permit) => {
  // Always use attachment endpoint; backend serves the file by id
  if (!permit || !permit._id) {
    notificationService.showError('Permit not found')
    return
  }
  const url = `/api/exam-permits/attachment/${permit._id}`
  window.open(url, '_blank', 'noopener')
}

const validatePermit = async (permitId, isValid) => {
  try {
    const notes = isValid ? 'Permit approved by adviser' : 'Permit rejected by adviser'
    
    await examPermitService.validatePermit(permitId, isValid, notes)
    
    if (isValid) {
      notificationService.showSuccess('Permit approved successfully')
    } else {
      notificationService.showSuccess('Permit rejected successfully')
    }
    
    // Refresh the permits list
    await loadPermits()
  } catch (error) {
    console.error('Error validating permit:', error)
    notificationService.showError('Failed to validate permit')
  }
}

// Lifecycle
onMounted(async () => {
  await loadPermits()
})
</script>

<style scoped>
.bg-primary {
  background-color: #3B82F6;
}
.text-primary {
  color: #3B82F6;
}
.border-primary {
  border-color: #3B82F6;
}
</style>
