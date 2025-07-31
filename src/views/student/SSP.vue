<template>
  <div>
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-2">Student Success Plan</h2>
      <p class="text-gray-600 mb-6">
        The Student Success Plan (SSP) is a structured program designed to support your academic progress 
        and provide you with essential skills for university success.
      </p>
      
      <!-- Loading state -->
      <div v-if="loading" class="py-6 text-center">
        <div class="flex justify-center items-center">
          <svg class="animate-spin h-5 w-5 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading your SSP data...</span>
        </div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="loadError" class="py-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-700 mb-2">Failed to Load SSP Data</h3>
        <p class="text-gray-500 max-w-md mx-auto mb-4">We encountered an error while trying to load your SSP information. Please try again later.</p>
        <button 
          @click="retryLoading" 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none"
        >
          Retry
        </button>
      </div>
      
      <!-- No class assigned message -->
      <div v-if="!student || !student.class" class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex items-center justify-center flex-col py-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Class Assigned</h3>
          <p class="text-gray-600 text-center max-w-md mb-4">
            You're currently not assigned to any class. Please contact your SSP adviser or the system administrator to get assigned to a class.
          </p>
          <button 
            @click="refreshData" 
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      <!-- No sessions found state -->
      <div v-else-if="!sessions || sessions.length === 0" class="py-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="text-lg font-medium text-gray-700 mb-2">No SSP Sessions Found</h3>
        <p class="text-gray-500 max-w-md mx-auto">Your class doesn't have any SSP sessions scheduled yet. Check back later or contact your adviser.</p>
      </div>
      
      <!-- Session data display -->
      <div v-else>
        <div class="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2 md:mb-0">
              {{ student.class?.sspSubject?.sspCode }}
            </h3>
            <p class="text-sm text-gray-600">{{ student.class?.daySchedule }} / {{ student.class?.timeSchedule }}</p>
          </div>
          <div class="flex items-center">
            <div class="bg-gray-100 rounded-lg px-3 py-1 text-sm flex items-center mr-2">
              <span class="mr-2">Completed:</span>
              <span class="font-medium">{{ completedSessions.length }}/{{ sessions.length }}</span>
            </div>
            <div 
              class="bg-gray-100 rounded-lg px-3 py-1 text-sm flex items-center mr-2"
              :class="{ 
                'bg-red-100 text-red-800': completionPercentage < 50,
                'bg-yellow-100 text-yellow-800': completionPercentage >= 50 && completionPercentage < 80,
                'bg-green-100 text-green-800': completionPercentage >= 80 
              }"
            >
              <span class="mr-2">Completion:</span>
              <span class="font-medium">{{ completionPercentage }}%</span>
            </div>
            <button 
              @click="manualRefresh" 
              class="px-2 py-1 bg-blue-50 text-primary border border-blue-100 rounded hover:bg-blue-100 transition-colors flex items-center"
              :disabled="refreshing"
            >
              <svg v-if="refreshing" class="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="text-sm">{{ refreshing ? 'Refreshing...' : 'Refresh' }}</span>
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto mb-4">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="session in sessions" :key="session._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">Day {{ session.sessionDay }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ session.sessionTitle }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(session.completionDate) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <span 
                      class="px-2 py-1 text-xs rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': session.completed,
                        'bg-red-100 text-red-800': session.rejectionStatus === 'rejected',
                        'bg-blue-100 text-blue-800': session.rejectionStatus === 'resubmitted',
                        'bg-yellow-100 text-yellow-800': !session.completed && session.rejectionStatus !== 'rejected'
                      }"
                    >
                      {{ 
                        session.completed ? 'Approved' : 
                        session.rejectionStatus === 'rejected' ? 'Rejected' :
                        session.rejectionStatus === 'resubmitted' ? 'Resubmitted' :
                        'Pending' 
                      }}
                    </span>
                    <span 
                      v-if="session.attachmentUrl || session.hasAttachment || session.attachmentOriginalName || (session.attachments && session.attachments.length > 0)" 
                      class="text-xs flex items-center"
                      :class="{
                        'text-blue-600': session.rejectionStatus === 'none' || session.rejectionStatus === 'resubmitted' || !session.rejectionStatus,
                        'text-red-600': session.rejectionStatus === 'rejected'
                      }"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {{ session.rejectionStatus === 'rejected' ? 'Rejected' : 'File' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                                  <!-- Rejected attachment notification -->
                <div v-if="session.rejectionStatus === 'rejected'" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div class="flex items-start space-x-2">
                    <svg class="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div class="flex-1">
                      <h4 class="text-sm font-medium text-red-800">Attachment Rejected</h4>
                      <p class="text-sm text-red-700 mt-1">{{ session.rejectionReason || 'Your attachment was rejected. Please upload a new one.' }}</p>
                      <p class="text-xs text-red-600 mt-2">Rejected on {{ formatDate(session.rejectedAt) }}</p>
                    </div>
                  </div>
                </div>

                  <!-- No attachment uploaded yet -->
                <div v-if="!session.attachmentUrl && !session.hasAttachment && !session.attachmentOriginalName && (!session.attachments || session.attachments.length === 0)" class="space-y-2">
                    <!-- File upload input -->
                    <input 
                      :id="`file-${session._id}`"
                      type="file" 
                      accept="image/*,.pdf"
                      multiple
                      class="hidden"
                      @change="(e) => handleFileSelect(session._id, e)"
                    />
                    <label 
                      :for="`file-${session._id}`"
                      class="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Choose File
                    </label>
                    
                    <!-- Selected files display -->
                    <div v-if="selectedFiles[session._id] && selectedFiles[session._id].length > 0" class="text-xs text-gray-600 space-y-1">
                      <div v-for="(file, index) in selectedFiles[session._id]" :key="index" class="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {{ file.name }}
                        </span>
                        <button 
                          @click="removeFile(session._id, index)"
                          class="text-red-500 hover:text-red-700 ml-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div class="text-xs text-blue-600">{{ selectedFiles[session._id].length }} file(s) selected</div>
                    </div>
                    
                    <!-- Submit button -->
                    <button
                      v-if="selectedFiles[session._id] && selectedFiles[session._id].length > 0"
                      @click="submitSession(session._id)"
                      :disabled="uploadingSession === session._id"
                      class="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="uploadingSession === session._id" class="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ uploadingSession === session._id ? 'Uploading...' : `Upload ${selectedFiles[session._id].length} Attachment${selectedFiles[session._id].length > 1 ? 's' : ''}` }}
                    </button>
                  </div>
                  
                  <!-- Attachment uploaded -->
                  <div v-else class="space-y-1">
                    <div class="flex items-center space-x-2">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            :class="session.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {{ session.completed ? 'Approved' : 'Submitted' }}
                      </span>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <button 
                        @click="viewAttachment(session._id, getAttachmentFileName(session))"
                        class="inline-flex items-center px-2 py-1 border border-blue-300 rounded text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View{{ (session.attachments && session.attachments.length > 1) ? ' All' : '' }}
                      </button>
                      
                      <button 
                        v-if="!session.completed"
                        @click="unsubmitAttachment(session._id)"
                        :disabled="unsubmittingSession === session._id"
                        class="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg v-if="unsubmittingSession === session._id" class="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>  
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {{ unsubmittingSession === session._id ? 'Removing...' : 'Unsubmit' }}
                      </button>

                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        

      </div>
    </div>
  </div>
  
  <!-- Attachment View Modal -->
  <AttachmentViewModal 
    :isOpen="showAttachmentModal"
    :sessionId="selectedSessionId"
    :attachmentName="selectedAttachmentName"
    @close="closeAttachmentModal"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { sessionService } from '../../services/sessionService';
import { studentService } from '../../services/studentService';
import { useAuthStore } from '../../stores/authStore';
import { notificationService } from '../../services/notificationService';
import AttachmentViewModal from '../../components/modals/AttachmentViewModal.vue';

// State
const loading = ref(true);
const loadError = ref(false);
const noClassAssigned = ref(false);
const student = ref(null);
const sessions = ref([]);
const authStore = useAuthStore();
const refreshInterval = ref(null);
const refreshing = ref(false);

// File upload state
const selectedFiles = ref({});
const uploadingSession = ref(null);
const unsubmittingSession = ref(null);

// Modal state
const showAttachmentModal = ref(false);
const selectedSessionId = ref(null);
const selectedAttachmentName = ref(null);

// Computed properties
const completedSessions = computed(() => {
  return sessions.value.filter(session => session.completed);
});

const completionPercentage = computed(() => {
  if (!sessions.value || sessions.value.length === 0) return 0;
  return Math.round((completedSessions.value.length / sessions.value.length) * 100);
});

// Lifecycle hooks
onMounted(async () => {
  await loadData();
  
  // Set up refresh interval (every 10 seconds)
  refreshInterval.value = setInterval(async () => {
    await refreshSessions();
  }, 10000); // 10 seconds instead of 30
});

// Clean up interval when component is unmounted
onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
});

// Methods
async function loadData() {
  try {
    loading.value = true;
    loadError.value = false;
    noClassAssigned.value = false;
    refreshing.value = true;
    
    // Get student details with proper error handling
    const studentResponse = await studentService.getStudentDetails();
    if (!studentResponse || !studentResponse.data) {
      throw new Error("Student data not found");
    }
    
    student.value = studentResponse.data;
    
    // Check if student is assigned to a class
    if (student.value?.class && student.value?.class._id) {
      
      // Get subject details to determine semester
      const subjectSemester = student.value.class?.sspSubject?.semester || '1st Semester';
      
      try {
        // Initialize sessions for this student if needed
        // We'll continue even if this fails with 400 (already initialized)
        try {
          await sessionService.initSessionsForStudent(
            student.value._id, 
            student.value.class._id,
            subjectSemester
          );
        } catch (initError) {
          // This is expected to fail with 400 if sessions are already initialized
          // We'll continue with fetching sessions anyway
        }
        
        // Fetch session data from backend
        await fetchSessions();
      } catch (sessionError) {
        notificationService.showError("Failed to load session data");
        sessions.value = [];
      }
    } else {
      noClassAssigned.value = true;
      sessions.value = [];
    }
  } catch (error) {
    loadError.value = true;
    notificationService.showError("Failed to load SSP data: " + (error.message || "Unknown error"));
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

// New function to fetch sessions and process them
async function fetchSessions() {
  try {
    console.log("Fetching sessions for student:", student.value._id, "in class:", student.value.class._id);
    const sessionResponse = await sessionService.getSessionsForStudent(student.value._id, student.value.class._id);
    
    if (sessionResponse && Array.isArray(sessionResponse.data)) {
      console.log("Raw sessions data:", sessionResponse.data.length, "sessions");
      
      if (sessionResponse.data.length === 0) {
        console.log("No sessions found, attempting to initialize");
        // Try initializing sessions
        try {
          // First, detect which semester we should be in
          let semester = '1st Semester';
          // Check if student already has a completed 1st semester
          const hasCompletedFirstSem = await hasCompletedFirstSemester();
          
          if (hasCompletedFirstSem) {
            semester = '2nd Semester';
            console.log("Student has completed 1st semester, initializing 2nd semester sessions");
          }
          
          await sessionService.initSessionsForStudent(
            student.value._id, 
            student.value.class._id,
            semester
          );
          
          // Try fetching again after initialization
          const retryResponse = await sessionService.getSessionsForStudent(
            student.value._id, 
            student.value.class._id
          );
          
          if (retryResponse && Array.isArray(retryResponse.data) && retryResponse.data.length > 0) {
            console.log("Successfully initialized and fetched sessions:", retryResponse.data.length);
            sessionResponse.data = retryResponse.data;
          } else {
            console.error("Still no sessions after initialization");
            sessions.value = [];
            return;
          }
        } catch (initError) {
          console.error("Error initializing sessions:", initError);
          sessions.value = [];
          return;
        }
      }
      
      // Categorize sessions by semester
      const firstSemSessions = sessionResponse.data.filter(s => 
        !s.semester || s.semester === '1st Semester');
      
      const secondSemSessions = sessionResponse.data.filter(s => 
        s.semester === '2nd Semester');
      
      const completedFirstSemSessions = sessionResponse.data.filter(s => 
        s.semester === '1st Semester (Completed)');
      
      console.log(`Sessions by semester: 1st=${firstSemSessions.length}, 2nd=${secondSemSessions.length}, 1st(Completed)=${completedFirstSemSessions.length}`);
      
      // Determine which semester's sessions to display
      let sessionsToDisplay = [];
      
      if (secondSemSessions.length > 0) {
        // If there are 2nd semester sessions, prioritize showing those
        console.log("Displaying 2nd semester sessions");
        sessionsToDisplay = secondSemSessions;
      } else if (completedFirstSemSessions.length > 0) {
        // If first semester is completed, show those
        console.log("Displaying completed 1st semester sessions");
        sessionsToDisplay = completedFirstSemSessions;
        
        // Try to see if we need to initialize 2nd semester sessions
        try {
          console.log("Trying to initialize 2nd semester sessions...");
          await sessionService.initSessionsForStudent(
            student.value._id, 
            student.value.class._id, 
            '2nd Semester'
          );
          
          // Refresh one more time to get the 2nd semester sessions
          const finalRetry = await sessionService.getSessionsForStudent(
            student.value._id, 
            student.value.class._id
          );
          
          if (finalRetry && Array.isArray(finalRetry.data)) {
            const newSecondSemSessions = finalRetry.data.filter(s => 
              s.semester === '2nd Semester');
            
            if (newSecondSemSessions.length > 0) {
              console.log("Successfully found 2nd semester sessions after initialization");
              sessionsToDisplay = newSecondSemSessions;
            }
          }
        } catch (init2ndError) {
          console.warn("Could not initialize 2nd semester sessions:", init2ndError);
          // Continue with showing completed 1st semester sessions
        }
      } else {
        // Otherwise show 1st semester sessions
        console.log("Displaying 1st semester sessions");
        sessionsToDisplay = firstSemSessions;
      }
      
      // Sort sessions by day number
      sessionsToDisplay.sort((a, b) => a.sessionDay - b.sessionDay);
      
      // Ensure uniqueness with a Map
      const uniqueSessions = new Map();
      sessionsToDisplay.forEach(session => {
        uniqueSessions.set(session._id, session);
      });
      
      // Convert Map back to array and sort by session day
      sessions.value = Array.from(uniqueSessions.values()).sort((a, b) => a.sessionDay - b.sessionDay);
      console.log("Final sessions to display:", sessions.value.length);
    } else {
      console.error("Invalid session response:", sessionResponse);
      sessions.value = [];
    }
  } catch (error) {
    console.error("Error fetching sessions:", error);
    sessions.value = [];
  }
}

// Helper function to check if student has completed first semester
async function hasCompletedFirstSemester() {
  try {
    const response = await sessionService.getSessionsForStudent(
      student.value._id, 
      student.value.class._id
    );
    
    if (response && Array.isArray(response.data)) {
      // Check if any sessions are marked as completed first semester
      const hasCompletedFirstSem = response.data.some(s => 
        s.semester === '1st Semester (Completed)');
      
      // Or if most of the 1st semester sessions are completed
      const firstSemSessions = response.data.filter(s => 
        !s.semester || s.semester === '1st Semester');
      
      if (firstSemSessions.length > 0) {
        const completedCount = firstSemSessions.filter(s => s.completed).length;
        const completionRate = completedCount / firstSemSessions.length;
        
        // If over 80% complete, consider it functionally complete
        if (completionRate > 0.8) {
          return true;
        }
      }
      
      return hasCompletedFirstSem;
    }
  } catch (error) {
    console.warn("Error checking semester completion status:", error);
  }
  
  return false;
}

function retryLoading() {
  loadData();
}

function formatDate(dateString) {
  if (!dateString) return 'Not completed';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
}

function manualRefresh() {
  refreshSessions();
}

// Function to refresh data
async function refreshData() {
  loading.value = true;
  loadError.value = false;
  noClassAssigned.value = false;
  
  try {
    await loadData();
    notificationService.showSuccess('Data refreshed successfully');
  } catch (error) {
    loadError.value = true;
    notificationService.showError('Failed to refresh data');
  } finally {
    loading.value = false;
  }
}

// Add function to refresh only the sessions, not the whole page
async function refreshSessions() {
  if (!student.value?.class || !student.value?._id) return;
  
  refreshing.value = true;
  try {
    await fetchSessions();
  } catch (error) {
    // Don't show error notifications during auto-refresh to avoid annoying the user
  } finally {
    refreshing.value = false;
  }
}

// File handling methods
function handleFileSelect(sessionId, event) {
  const files = Array.from(event.target.files);
  
  console.log(`handleFileSelect called for session ${sessionId}`);
  console.log(`Selected ${files.length} files:`, files.map(f => `${f.name} (${f.size} bytes)`));
  
  if (files.length === 0) return;
  
  // Validate number of files (max 5)
  if (files.length > 5) {
    notificationService.showError('Maximum 5 files allowed per session.');
    event.target.value = '';
    return;
  }
  
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB per file
  
  // Validate each file
  for (const file of files) {
    if (!validTypes.includes(file.type)) {
      notificationService.showError('Please select only image files (PNG, JPG, JPEG, GIF, WEBP, BMP) or PDF files.');
      event.target.value = '';
      return;
    }
    
    if (file.size > maxSize) {
      notificationService.showError(`File "${file.name}" is too large. Maximum size is 10MB per file.`);
      event.target.value = '';
      return;
    }
  }
  
  selectedFiles.value[sessionId] = files;
  console.log(`Stored ${files.length} files for session ${sessionId}:`, selectedFiles.value[sessionId]);
}

function removeFile(sessionId, fileIndex) {
  if (selectedFiles.value[sessionId]) {
    selectedFiles.value[sessionId].splice(fileIndex, 1);
    if (selectedFiles.value[sessionId].length === 0) {
      delete selectedFiles.value[sessionId];
    }
  }
}

async function submitSession(sessionId) {
  const files = selectedFiles.value[sessionId];
  if (!files || files.length === 0) {
    notificationService.showError('Please select at least one file first.');
    return;
  }
  
  console.log(`Submitting ${files.length} files for session ${sessionId}:`, files.map(f => f.name));
  
  try {
    uploadingSession.value = sessionId;
    
    // Create FormData for multiple file upload
    const formData = new FormData();
    files.forEach((file, index) => {
      console.log(`Adding file ${index}: ${file.name} (${file.size} bytes)`);
      formData.append('attachments', file);
    });
    
    // Log FormData contents
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    
    // Submit session with attachments
    const response = await sessionService.completeSessionWithAttachment(sessionId, formData);
    
    notificationService.showSuccess(response.message || `${files.length} attachment(s) uploaded successfully! Awaiting adviser approval.`);
    
    // Clear selected files
    delete selectedFiles.value[sessionId];
    
    // Clear file input
    const fileInput = document.getElementById(`file-${sessionId}`);
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Refresh sessions data
    await fetchSessions();
    
  } catch (error) {
    console.error('Error submitting session:', error);
    notificationService.showError(error.response?.data?.message || 'Failed to submit session. Please try again.');
  } finally {
    uploadingSession.value = null;
  }
}

async function unsubmitAttachment(sessionId) {
  unsubmittingSession.value = sessionId;
  try {
              const response = await sessionService.unsubmitAttachment(sessionId);
     notificationService.showSuccess(response.message || 'Attachment unsubmitted successfully!');
    await fetchSessions(); // Refresh sessions to update completion status
  } catch (error) {
    console.error('Error unsubmitting attachment:', error);
    notificationService.showError(error.response?.data?.message || 'Failed to unsubmit attachment. Please try again.');
  } finally {
    unsubmittingSession.value = null;
  }
}

function getAttachmentUrl(sessionId) {
  return sessionService.getSessionAttachmentUrl(sessionId);
}

// Helper functions
function getAttachmentDisplayText(session) {
  if (session.attachments && session.attachments.length > 0) {
    return session.attachments.length === 1 
      ? session.attachments[0].originalName 
      : `${session.attachments.length} attachments`;
  }
  return session.attachmentOriginalName || 'Attachment';
}

function getAttachmentFileName(session) {
  if (session.attachments && session.attachments.length > 0) {
    return session.attachments[0].originalName;
  }
  return session.attachmentOriginalName || 'attachment';
}

// Modal methods
function viewAttachment(sessionId, attachmentName) {
  selectedSessionId.value = sessionId;
  selectedAttachmentName.value = attachmentName;
  showAttachmentModal.value = true;
}

function closeAttachmentModal() {
  showAttachmentModal.value = false;
  selectedSessionId.value = null;
  selectedAttachmentName.value = null;
}



</script>

<style scoped>
.bg-primary {
  background-color: #3B82F6;
}
.text-primary {
  color: #3B82F6;
}
.hover\:bg-primary-dark:hover {
  background-color: #2563EB;
}
</style> 