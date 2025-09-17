<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex justify-center items-center">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-5xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h2 class="text-xl font-semibold text-gray-800">Student Details</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600">Loading student details...</span>
      </div>
      
      <div v-else-if="student" class="space-y-6">
        <!-- Information Notice -->
        <div v-if="!student.user && !student.email" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <h4 class="text-sm font-medium text-blue-800 mb-1">Limited Information Available</h4>
              <p class="text-sm text-blue-700">This shows session data from your class records. Complete contact and address information requires additional loading from the database.</p>
            </div>
            <button 
              @click="$emit('reload-student-data')"
              class="ml-4 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded-md transition-colors"
            >
              Try Reload
            </button>
          </div>
        </div>
        
        
        <!-- Student Profile Header -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
          <div class="flex items-center">
            <div class="h-16 w-16 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <span class="text-xl font-medium text-blue-600">
                {{ getInitials(student) }}
              </span>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-medium text-gray-900">
                {{ getStudentFullName(student) }}
              </h3>
              <p class="text-gray-600">{{ getStudentEmail(student) }}</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  ID: {{ student.idNumber || student.user?.idNumber || 'N/A' }}
                </span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {{ student.major || 'No Major' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Student Information Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Personal Information -->
          <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <h4 class="font-medium text-blue-600 border-b border-gray-100 pb-2 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h4>
            
            <div class="space-y-4">
              <div class="flex justify-between">
                <h5 class="text-sm font-medium text-gray-500">Email Address</h5>
                <p class="text-gray-900">{{ getStudentEmail(student) }}</p>
              </div>
              
              <div class="flex justify-between">
                <h5 class="text-sm font-medium text-gray-500">Contact Number</h5>
                <p class="text-gray-900">{{ getStudentContact(student) }}</p>
              </div>
              
              <div class="flex justify-between">
                <h5 class="text-sm font-medium text-gray-500">Gender</h5>
                <p class="text-gray-900">{{ student.gender || 'N/A' }}</p>
              </div>
            </div>
          </div>
          
          <!-- Academic Information -->
          <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <h4 class="font-medium text-blue-600 border-b border-gray-100 pb-2 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
              Academic Information
            </h4>
            
            <div class="space-y-4">
              <div class="flex justify-between">
                <h5 class="text-sm font-medium text-gray-500">Class</h5>
                <p class="text-gray-900 bg-gray-100 px-2 py-1 rounded">{{ getClassName(student) }}</p>
              </div>
              
              <div class="flex justify-between">
                <h5 class="text-sm font-medium text-gray-500">Major</h5>
                <p class="text-gray-900">{{ student.major || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Address Information -->
        <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <h4 class="font-medium text-blue-600 border-b border-gray-100 pb-2 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Address Information
          </h4>
          
          <div v-if="hasAddress" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-if="student.address?.region">
              <h5 class="text-sm font-medium text-gray-500">Region</h5>
              <p class="text-gray-900">{{ student.address.region }}</p>
            </div>
            
            <div v-if="student.address?.province">
              <h5 class="text-sm font-medium text-gray-500">Province</h5>
              <p class="text-gray-900">{{ student.address.province }}</p>
            </div>
            
            <div v-if="student.address?.municipality">
              <h5 class="text-sm font-medium text-gray-500">Municipality/City</h5>
              <p class="text-gray-900">{{ student.address.municipality }}</p>
            </div>
            
            <div v-if="student.address?.barangay">
              <h5 class="text-sm font-medium text-gray-500">Barangay</h5>
              <p class="text-gray-900">{{ student.address.barangay }}</p>
            </div>
            
            <div v-if="student.address?.street">
              <h5 class="text-sm font-medium text-gray-500">Street/Purok</h5>
              <p class="text-gray-900">{{ student.address.street }}</p>
            </div>
            
            <div v-if="student.address?.block">
              <h5 class="text-sm font-medium text-gray-500">Block/Building/Unit</h5>
              <p class="text-gray-900">{{ student.address.block }}</p>
            </div>
          </div>
          <p v-else class="text-gray-500 italic">No address information available</p>
        </div>

        <!-- Tab Navigation -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button 
              @click="activeTab = 'sessions'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'sessions' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Session Details
            </button>
            <button 
              @click="activeTab = 'history'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'history' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              History
            </button>
            <button 
              @click="activeTab = 'actions'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'actions' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Actions
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Sessions Tab -->
          <div v-if="activeTab === 'sessions'" class="space-y-4">
            <div v-if="sessionData.length > 0" class="space-y-6">
              <!-- Progress Overview -->
              <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h4 class="font-medium text-blue-600 border-b border-gray-100 pb-2 mb-4">Session Progress</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">{{ getCompletionPercentage(student) }}%</div>
                    <div class="text-sm text-gray-500">Overall Progress</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">{{ getCompletedSessions(student) }}</div>
                    <div class="text-sm text-gray-500">Completed Sessions</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-gray-600">{{ getTotalSessions(student) }}</div>
                    <div class="text-sm text-gray-500">Total Sessions</div>
                  </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="mt-4">
                  <div class="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{{ getCompletionPercentage(student) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${getCompletionPercentage(student)}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Session Details -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-5 border-b border-gray-100">
                  <h4 class="font-medium text-blue-600">Session Details</h4>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="session in sessionData" :key="session.day" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Day {{ session.day }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ session.title }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span v-if="session.completed" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                          <span v-else-if="session.rejectionStatus === 'rejected'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Rejected
                          </span>
                          <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Pending
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ (session.completedAt || session.completionDate) ? formatDate(session.completedAt || session.completionDate) : '-' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span v-if="session.hasAttachment" class="text-green-600">✓ Yes</span>
                          <span v-else class="text-gray-400">- No</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              No session data available
            </div>
          </div>

          <!-- History Tab -->
          <div v-if="activeTab === 'history'" class="space-y-4">
            <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h4 class="font-medium text-gray-800 mb-4">Academic History</h4>
              <div v-if="history && history.length > 0" class="space-y-3">
                <div v-for="record in history" :key="record._id" class="border-l-4 border-blue-500 pl-4">
                  <div class="text-sm font-medium text-gray-900">{{ record.action }}</div>
                  <div class="text-xs text-gray-500">{{ formatDate(record.date) }}</div>
                  <div v-if="record.details" class="text-sm text-gray-600 mt-1">{{ record.details }}</div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                No history data available
              </div>
            </div>
          </div>

          <!-- Actions Tab -->
          <div v-if="activeTab === 'actions'" class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h4 class="font-medium text-orange-600 border-b border-gray-100 pb-2 mb-4">Adviser Actions</h4>
              <div class="grid grid-cols-1 gap-4">
                <!-- Request Drop -->
                <div class="border border-orange-200 rounded-lg p-4">
                  <h5 class="text-sm font-medium text-orange-800 mb-2">Request Student Drop</h5>
                  <p class="text-xs text-orange-600 mb-3">
                    Submit a request to admin to drop this student from the class
                  </p>
                  <button
                    @click="showDropModal = true"
                    class="w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                  >
                    Request Drop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <div class="text-gray-500 mb-4">No student data available</div>
        <div class="text-sm text-gray-400">Please close and try again</div>
      </div>
      
      <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>

    <!-- Drop Request Modal -->
    <div v-if="showDropModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Request Student Drop</h3>
          <button @click="showDropModal = false" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Reason for Drop Request</label>
            <textarea
              v-model="dropReason"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
              placeholder="Please provide a detailed reason for requesting to drop this student..."
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="showDropModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="submitDropRequest" 
              :disabled="!dropReason.trim()"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  student: {
    type: Object,
    default: null
  },
  sessions: {
    type: Array,
    default: () => []
  },
  history: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Computed property for session data
const sessionData = computed(() => {
  // Check if we have session data from the sessions prop (loaded from backend)
  if (props.sessions && props.sessions.sessions && Array.isArray(props.sessions.sessions)) {
    return props.sessions.sessions
  }
  
  // Check if sessions is directly an array (some API responses)
  if (props.sessions && Array.isArray(props.sessions)) {
    return props.sessions
  }
  
  // Fallback to student sessions if available
  if (!props.student || !props.student.sessions) return []
  
  // Convert student sessions object to array format similar to admin
  const sessionsList = []
  let sessionCounter = 1
  
  for (const [sessionId, sessionInfo] of Object.entries(props.student.sessions)) {
    sessionsList.push({
      day: sessionCounter, // Use counter since we don't have day number
      title: `Session ${sessionCounter}`,
      completed: sessionInfo.completed || false,
      completedAt: sessionInfo.completedAt || sessionInfo.completionDate,
      completionDate: sessionInfo.completionDate,
      rejectionStatus: sessionInfo.rejectionStatus,
      hasAttachment: sessionInfo.hasAttachment || false
    })
    sessionCounter++
  }
  
  // Sort by day number if available
  return sessionsList.sort((a, b) => {
    const dayA = parseInt(a.day) || 0
    const dayB = parseInt(b.day) || 0
    return dayA - dayB
  })
})

// Computed property for address
const hasAddress = computed(() => {
  if (!props.student || !props.student.address) return false
  const addr = props.student.address
  return addr.block || addr.street || addr.barangay || addr.municipality || addr.province || addr.region
})

const emit = defineEmits(['close', 'requestDrop', 'reload-student-data'])

const activeTab = ref('sessions')
const showDropModal = ref(false)
const dropReason = ref('')

function getStudentFullName(student) {
  if (!student) return 'Unknown Student'
  
  // Check for direct name property first (from session matrix)
  if (student.name) return student.name
  
  // Check for user object (from database)
  if (student.user) {
    return `${student.user.firstName || ''} ${student.user.lastName || ''}`.trim() || 'Unknown'
  }
  
  // Fallback for direct firstName/lastName properties
  if (student.firstName || student.lastName) {
    return `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown'
  }
  
  return 'Unknown Student'
}

function getInitials(student) {
  if (!student) return 'U'
  
  let initials = ''
  
  // Try user object first (from database)
  if (student.user) {
    if (student.user.firstName) initials += student.user.firstName.charAt(0).toUpperCase()
    if (student.user.lastName) initials += student.user.lastName.charAt(0).toUpperCase()
  } 
  // Try direct name property (from session matrix)
  else if (student.name) {
    const nameParts = student.name.split(' ')
    initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('').slice(0, 2)
  }
  // Try direct firstName/lastName properties
  else if (student.firstName || student.lastName) {
    if (student.firstName) initials += student.firstName.charAt(0).toUpperCase()
    if (student.lastName) initials += student.lastName.charAt(0).toUpperCase()
  }
  
  return initials || 'U'
}

function getCompletionPercentage(student) {
  if (!student || !student.sessions) return 0
  
  const sessions = Object.values(student.sessions)
  if (sessions.length === 0) return 0
  
  const completed = sessions.filter(session => session.completed).length
  return Math.round((completed / sessions.length) * 100)
}

function getCompletedSessions(student) {
  if (!student || !student.sessions) return 0
  return Object.values(student.sessions).filter(session => session.completed).length
}

function getTotalSessions(student) {
  if (!student || !student.sessions) return 0
  return Object.values(student.sessions).length
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getStudentEmail(student) {
  if (!student) return 'No email available'
  
  // Try user object (from database)
  if (student.user?.email) return student.user.email
  
  // Try direct email property
  if (student.email) return student.email
  
  // If we have the student ID, we could note that we need to load from DB
  if (student.id || student._id) {
    return 'Email not loaded (click to refresh)'
  }
  
  return 'No email available'
}

function getStudentContact(student) {
  if (!student) return 'No contact number'
  
  // Try various contact number properties
  if (student.contactNumber) return student.contactNumber
  if (student.user?.contactNumber) return student.user.contactNumber
  if (student.contact) return student.contact
  if (student.phoneNumber) return student.phoneNumber
  
  // If we have the student ID, we could note that we need to load from DB
  if (student.id || student._id) {
    return 'Contact not loaded (click to refresh)'
  }
  
  return 'No contact number'
}

function getClassName(student) {
  if (!student) return 'Not Assigned'
  
  // Try class object first
  if (student.class) {
    const classObj = typeof student.class === 'object' ? student.class : null
    if (classObj) {
      return formatClassInfo(classObj)
    }
  }
  
  // Try classInfo object
  if (student.classInfo) {
    return formatClassInfo(student.classInfo)
  }
  
  // Try classDetails object
  if (student.classDetails) {
    return formatClassInfo(student.classDetails)
  }
  
  // Try individual properties
  if (student.yearLevel || student.section || student.major) {
    return formatClassInfo({
      yearLevel: student.yearLevel,
      section: student.section,
      major: student.major
    })
  }
  
  return 'Not Assigned'
}

function formatClassInfo(classInfo) {
  if (!classInfo) return 'Not Assigned'
  
  let displayText = ''
  
  if (classInfo.yearLevel) {
    // Normalize yearLevel to add suffix if not present
    let yearLevel = classInfo.yearLevel
    
    // Strip any existing suffix first (2nd → 2, 3rd → 3)
    if (typeof yearLevel === 'string' && 
        (yearLevel.endsWith('nd') || yearLevel.endsWith('rd') || yearLevel.endsWith('th'))) {
      yearLevel = yearLevel.replace(/[^0-9]/g, '')
    }
    
    displayText += yearLevel
    
    // Add suffix to year level
    if (yearLevel === '1' || yearLevel === 1) displayText += 'st'
    else if (yearLevel === '2' || yearLevel === 2) displayText += 'nd'
    else if (yearLevel === '3' || yearLevel === 3) displayText += 'rd'
    else displayText += 'th'
    
    displayText += ' Year'
  }
  
  if (classInfo.section) {
    displayText += ` - ${classInfo.section}`
  }
  
  if (classInfo.major) {
    displayText += ` (${classInfo.major})`
  }
  
  return displayText || 'Not Assigned'
}

function submitDropRequest() {
  if (!dropReason.value.trim()) return
  
  emit('requestDrop', props.student, dropReason.value.trim())
  showDropModal.value = false
  dropReason.value = ''
}
</script>

<style scoped>
.tab-content {
  min-height: 300px;
}
</style>
