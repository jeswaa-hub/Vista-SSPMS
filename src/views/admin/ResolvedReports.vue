<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">Resolved Reports</h1>
            <p class="text-gray-500 mt-1 font-normal">Historical view of resolved student issues</p>
          </div>
          <div class="flex items-center space-x-4">
            <select
              v-model="selectedFilter"
              @change="loadResolvedReports"
              class="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Types</option>
              <option value="session_submission">Session Issues</option>
              <option value="enrollment_risk">Enrollment Risk</option>
              <option value="consultation_escalation">Escalations</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Resolved Reports Table -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-normal text-gray-800">Resolved Reports</h2>
            <span class="text-sm text-gray-500">{{ resolvedReports.length }} total resolved</span>
          </div>
        </div>
        
        <div class="p-6">
          <div v-if="resolvedReports.length === 0" class="text-center py-12">
            <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-base font-normal text-gray-800 mb-1">No resolved reports</h3>
            <p class="text-gray-500 font-normal">No reports have been resolved yet</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adviser</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved By</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="report in resolvedReports" :key="report._id" class="hover:bg-gray-50">
                  <td class="px-4 py-4">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                        <span class="text-sm font-normal text-emerald-600">
                          {{ report.student?.user?.firstName?.charAt(0) }}{{ report.student?.user?.lastName?.charAt(0) }}
                        </span>
                      </div>
                      <div>
                        <div class="text-sm font-normal text-gray-800">
                          {{ report.student?.user?.firstName }} {{ report.student?.user?.lastName }}
                        </div>
                        <div class="text-xs text-gray-500">{{ report.student?.user?.idNumber }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <span 
                      class="inline-flex px-2 py-1 text-xs font-normal rounded-md"
                      :class="{
                        'bg-amber-50 text-amber-700 border border-amber-200': report.issueType === 'session_submission',
                        'bg-red-50 text-red-700 border border-red-200': report.issueType === 'enrollment_risk',
                        'bg-blue-50 text-blue-700 border border-blue-200': report.issueType === 'consultation_escalation'
                      }"
                    >
                      {{ getIssueTypeLabel(report.issueType) }}
                    </span>
                  </td>
                  <td class="px-4 py-4">
                    <div class="text-sm text-gray-800 max-w-xs">{{ report.description }}</div>
                    <div class="text-xs text-gray-500 mt-1">
                      <span v-if="report.semester" class="mr-2">
                        {{ report.semester }} Semester
                      </span>
                      <span v-if="report.triggerData.sessionNotificationCount">
                        {{ report.triggerData.sessionNotificationCount }} reminders
                      </span>
                      <span v-if="report.triggerData.mmNotificationCount">
                        {{ report.triggerData.mmNotificationCount }} {{ report.triggerData.mmType }} reminders
                      </span>
                      <span v-if="report.triggerData.escalationReason">
                        Escalated - {{ report.triggerData.concern }}
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-800">
                    {{ report.adviser?.firstName }} {{ report.adviser?.lastName }}
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-500">
                    {{ formatDate(report.resolvedAt) }}
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-800">
                    {{ report.resolvedBy?.firstName }} {{ report.resolvedBy?.lastName }}
                  </td>
                  <td class="px-4 py-4 text-right">
                    <div class="flex items-center justify-end space-x-2">
                      <button 
                        @click="openContactModal(report.student)"
                        class="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        title="Contact Student"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                      </button>
                      <button 
                        @click="openReportModal(report)"
                        class="px-3 py-1.5 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 mt-6">
            <div class="flex flex-1 justify-between sm:hidden">
              <button 
                @click="changePage(pagination.currentPage - 1)"
                :disabled="pagination.currentPage === 1"
                class="relative inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-normal text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                @click="changePage(pagination.currentPage + 1)"
                :disabled="pagination.currentPage === pagination.totalPages"
                class="relative ml-3 inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-normal text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing {{ (pagination.currentPage - 1) * 20 + 1 }} to 
                  {{ Math.min(pagination.currentPage * 20, pagination.totalReports) }} of 
                  {{ pagination.totalReports }} results
                </p>
              </div>
              <div>
                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button 
                    @click="changePage(pagination.currentPage - 1)"
                    :disabled="pagination.currentPage === 1"
                    class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button 
                    v-for="page in visiblePages" 
                    :key="page"
                    @click="changePage(page)"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 text-sm font-normal',
                      page === pagination.currentPage 
                        ? 'z-10 bg-blue-600 text-white'
                        : 'text-gray-800 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                  <button 
                    @click="changePage(pagination.currentPage + 1)"
                    :disabled="pagination.currentPage === pagination.totalPages"
                    class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Report Details Modal -->
    <div v-if="showReportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeReportModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <h3 class="text-lg font-normal text-gray-800">Resolved Report Details</h3>
            <span class="inline-flex px-2 py-1 text-xs font-normal rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              Resolved
            </span>
          </div>
          <button @click="closeReportModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div v-if="selectedReport" class="p-6 space-y-6">
          <!-- Resolution Info -->
          <div class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h4 class="text-sm font-medium text-gray-800 mb-2">Resolution Information</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Resolved on:</span>
                <span class="ml-2 text-gray-800">{{ formatDate(selectedReport.resolvedAt) }}</span>
              </div>
              <div>
                <span class="text-gray-500">Resolved by:</span>
                <span class="ml-2 text-gray-800">{{ selectedReport.resolvedBy?.firstName }} {{ selectedReport.resolvedBy?.lastName }}</span>
              </div>
            </div>
          </div>

          <!-- Student Information -->
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 class="text-sm font-medium text-gray-800 mb-3">Student Information</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Name:</span>
                <span class="ml-2 text-gray-800">{{ selectedReport.student?.user?.firstName }} {{ selectedReport.student?.user?.lastName }}</span>
              </div>
              <div>
                <span class="text-gray-500">ID:</span>
                <span class="ml-2 text-gray-800">{{ selectedReport.student?.user?.idNumber }}</span>
              </div>
              <div>
                <span class="text-gray-500">Class:</span>
                <span class="ml-2 text-gray-800">{{ selectedReport.student?.class?.yearLevel }} {{ selectedReport.student?.class?.major }} - {{ selectedReport.student?.class?.section }}</span>
              </div>
              <div>
                <span class="text-gray-500">Adviser:</span>
                <span class="ml-2 text-gray-800">{{ selectedReport.adviser?.firstName }} {{ selectedReport.adviser?.lastName }}</span>
              </div>
            </div>
          </div>

          <!-- Issue Details -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-3">Issue Details</h4>
            <div class="space-y-3">
              <div>
                <span class="text-gray-500 text-sm">Type:</span>
                <span 
                  class="ml-2 inline-flex px-2 py-1 text-xs font-normal rounded-md"
                  :class="{
                    'bg-amber-50 text-amber-700 border border-amber-200': selectedReport.issueType === 'session_submission',
                    'bg-red-50 text-red-700 border border-red-200': selectedReport.issueType === 'enrollment_risk',
                    'bg-blue-50 text-blue-700 border border-blue-200': selectedReport.issueType === 'consultation_escalation'
                  }"
                >
                  {{ getIssueTypeLabel(selectedReport.issueType) }}
                </span>
              </div>
              <div>
                <span class="text-gray-500 text-sm">Description:</span>
                <p class="mt-1 text-sm text-gray-800">{{ selectedReport.description }}</p>
              </div>
              <div>
                <span class="text-gray-500 text-sm">Created:</span>
                <span class="ml-2 text-sm text-gray-800">{{ formatDate(selectedReport.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Admin Notes -->
          <div v-if="selectedReport.adminNotes">
            <h4 class="text-sm font-medium text-gray-800 mb-3">Admin Notes</h4>
            <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p class="text-sm text-gray-800">{{ selectedReport.adminNotes }}</p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-between p-6 border-t border-gray-200">
          <button 
            @click="openContactModal(selectedReport.student)"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Contact Student
          </button>
          <button 
            @click="closeReportModal"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Contact Modal -->
    <div v-if="showContactModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeContactModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Student Contact</h3>
          <button @click="closeContactModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div v-if="selectedStudent" class="p-6 space-y-4">
          <!-- Student Info -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-blue-200">
                <span class="text-sm font-normal text-blue-600">
                  {{ selectedStudent.user?.firstName?.charAt(0) }}{{ selectedStudent.user?.lastName?.charAt(0) }}
                </span>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-800">
                  {{ selectedStudent.user?.firstName }} {{ selectedStudent.user?.lastName }}
                </h4>
                <p class="text-xs text-gray-600">{{ selectedStudent.user?.idNumber }}</p>
                <p class="text-xs text-gray-600">
                  {{ selectedStudent.class?.yearLevel }} {{ selectedStudent.class?.major }} - {{ selectedStudent.class?.section }}
                </p>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-3">
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="flex items-center space-x-3">
                <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <div class="flex-1">
                  <p class="text-xs text-gray-500">Email</p>
                  <p class="text-sm text-gray-800">{{ selectedStudent.user?.email || 'Not provided' }}</p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="flex items-center space-x-3">
                <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <div class="flex-1">
                  <p class="text-xs text-gray-500">Phone</p>
                  <p class="text-sm text-gray-800">{{ selectedStudent.contactNumber || selectedStudent.user?.contactNumber || 'Not provided' }}</p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="flex items-start space-x-3">
                <svg class="w-4 h-4 text-gray-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <div class="flex-1">
                  <p class="text-xs text-gray-500">Address</p>
                  <p class="text-sm text-gray-800">{{ formatAddress(selectedStudent.address) || selectedStudent.user?.address || 'Not provided' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'
import { notificationService } from '../../services/notificationService'

// Reactive data
const loading = ref(true)
const resolvedReports = ref([])
const selectedFilter = ref('all')
const currentPage = ref(1)
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalReports: 0,
  limit: 20
})

// Modal data
const showReportModal = ref(false)
const selectedReport = ref(null)

const showContactModal = ref(false)
const selectedStudent = ref(null)

// Computed
const visiblePages = computed(() => {
  const pages = []
  const total = pagination.value.totalPages
  const current = pagination.value.currentPage
  
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Load resolved reports
const loadResolvedReports = async (page = 1) => {
  loading.value = true
  
  try {
    const params = {
      status: 'resolved',
      page,
      limit: 20
    }
    
    if (selectedFilter.value !== 'all') {
      params.issueType = selectedFilter.value
    }
    
    const response = await api.get('/admin/reports', { params })
    
    if (response.data) {
      resolvedReports.value = response.data.reports || []
      pagination.value = response.data.pagination || pagination.value
    }
    
  } catch (error) {
    console.error('Error loading resolved reports:', error)
    notificationService.showError('Failed to load resolved reports')
  } finally {
    loading.value = false
  }
}

// Helper functions
const getIssueTypeLabel = (issueType) => {
  const labels = {
    'session_submission': 'Session Issues',
    'enrollment_risk': 'Enrollment Risk',
    'consultation_escalation': 'Escalation'
  }
  return labels[issueType] || issueType
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAddress = (address) => {
  if (!address || typeof address !== 'object') return ''
  
  const parts = []
  if (address.block) parts.push(address.block)
  if (address.street) parts.push(address.street)
  if (address.barangay) parts.push(address.barangay)
  if (address.municipality) parts.push(address.municipality)
  if (address.province) parts.push(address.province)
  
  return parts.join(', ') || ''
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    currentPage.value = page
    loadResolvedReports(page)
  }
}

// Modal functions
const openReportModal = (report) => {
  selectedReport.value = report
  showReportModal.value = true
}

const closeReportModal = () => {
  showReportModal.value = false
  selectedReport.value = null
}

const openContactModal = (student) => {
  selectedStudent.value = student
  showContactModal.value = true
}

const closeContactModal = () => {
  showContactModal.value = false
  selectedStudent.value = null
}

// Lifecycle
onMounted(() => {
  loadResolvedReports()
})
</script>