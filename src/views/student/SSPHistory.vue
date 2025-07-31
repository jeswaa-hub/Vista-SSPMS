<template>
  <div>
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">SSP History</h2>
        <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          Previous Semesters
        </span>
      </div>
      
      <p class="text-gray-600 mb-6">
        View your completed semester sessions and achievement history from previous semesters.
      </p>
      
      <!-- Loading state -->
      <div v-if="loading" class="py-6 text-center">
        <div class="flex justify-center items-center">
          <svg class="animate-spin h-5 w-5 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading your SSP history...</span>
        </div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="loadError" class="py-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-700 mb-2">Failed to Load History</h3>
        <p class="text-gray-500 max-w-md mx-auto mb-4">We encountered an error while trying to load your SSP history. Please try again later.</p>
        <button 
          @click="loadHistory" 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none"
        >
          Retry
        </button>
      </div>
      
      <!-- No history state -->
      <div v-else-if="!sessionHistory || sessionHistory.length === 0" class="py-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="text-lg font-medium text-gray-700 mb-2">No History Found</h3>
        <p class="text-gray-500 max-w-md mx-auto">You don't have any completed semesters in your history yet. Your semester data will appear here after your adviser marks a semester as complete.</p>
      </div>
      
      <!-- History display -->
      <div v-else>
        <!-- Process the history by year levels -->
        <div v-for="(yearGroup, yearIndex) in groupedHistory" :key="yearIndex" class="mb-8">
          <h3 class="text-lg font-medium text-gray-700 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {{ yearGroup.yearLevel }} History
          </h3>
          
          <!-- Semester accordion sections -->
          <div v-for="semester in yearGroup.semesters" :key="semester.id" class="mb-4 border border-gray-200 rounded-lg overflow-hidden">
            <!-- Semester header -->
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-md font-medium text-gray-900">
                    {{ semester.subject?.sspCode || 'SSP' }}
                    <span class="ml-2 px-2 py-0.5 text-xs rounded-full" 
                      :class="semester.semester.includes('1st') ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                      {{ semester.semester }}
                    </span>
                  </h3>
                  <p class="text-sm text-gray-600">
                    {{ semester.class?.yearLevel || 'Unknown' }} Year - 
                    {{ semester.class?.section || 'Unknown' }}
                  </p>
                </div>
                <div class="flex items-center">
                  <div
                    class="px-3 py-1 text-xs rounded-full font-medium mr-3"
                    :class="getCompletionBadgeClass(calculateCompletionPercentage(semester.sessions))"
                  >
                    {{ calculateCompletionPercentage(semester.sessions) }}% Complete
                  </div>
                  <button 
                    @click="toggleSemester(yearIndex, semester.id)" 
                    class="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      class="h-5 w-5 transition-transform duration-200" 
                      :class="{'transform rotate-180': isExpanded(yearIndex, semester.id)}"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Sessions table -->
            <div v-if="isExpanded(yearIndex, semester.id)" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Completed</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="session in semester.sessions" :key="session.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">Day {{ session.day || 0 }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-900">{{ session.title || `Day ${session.day || 0}` }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ formatDate(session.completedAt) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="px-2 py-1 text-xs rounded-full"
                        :class="session.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                      >
                        {{ session.completed ? 'Completed' : 'Pending' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div v-if="session.attachmentUrl" class="flex items-center">
                        <button 
                          @click="viewAttachment(session.id, session.attachmentOriginalName)"
                          class="inline-flex items-center px-2 py-1 border border-blue-300 rounded-md text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View File
                        </button>
                      </div>
                      <div v-else class="text-xs text-gray-400">
                        No attachment
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Summary banner with counts -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 mt-6">
          <div class="flex flex-wrap gap-4 justify-between">
            <div>
              <p class="font-medium mb-1">Session History Summary</p>
              <p>This section displays your completed semester history from all year levels.</p>
            </div>
            <div class="flex gap-4">
              <div class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                1st Semester: {{ countSemesterSessions('1st') }}
              </div>
              <div class="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                2nd Semester: {{ countSemesterSessions('2nd') }}
              </div>
            </div>
          </div>
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
import { ref, computed, onMounted } from 'vue';
import { sessionService } from '../../services/sessionService';
import { studentService } from '../../services/studentService';
import { useAuthStore } from '../../stores/authStore';
import { notificationService } from '../../services/notificationService';
import AttachmentViewModal from '../../components/modals/AttachmentViewModal.vue';

// State
const loading = ref(true);
const loadError = ref(false);
const student = ref(null);
const sessionHistory = ref([]);
const expandedSemesters = ref({});
const authStore = useAuthStore();

// Modal state
const showAttachmentModal = ref(false);
const selectedSessionId = ref(null);
const selectedAttachmentName = ref(null);

// Lifecycle hooks
onMounted(async () => {
  await loadHistory();
});

// Computed properties
const groupedHistory = computed(() => {
  if (!sessionHistory.value || !Array.isArray(sessionHistory.value)) {
    return [];
  }
  
  return sessionHistory.value;
});

// Method to count sessions by semester
const countSemesterSessions = (semesterPrefix) => {
  let count = 0;
  
  if (groupedHistory.value && groupedHistory.value.length > 0) {
    for (const yearGroup of groupedHistory.value) {
      for (const semester of yearGroup.semesters) {
        if (semester.semester.includes(semesterPrefix)) {
          count += semester.sessions.length;
        }
      }
    }
  }
  
  return count;
};

// Methods
async function loadHistory() {
  try {
    loading.value = true;
    loadError.value = false;
    
    // Get student details
    const studentResponse = await studentService.getStudentDetails();
    if (!studentResponse || !studentResponse.data) {
      throw new Error("Student data not found");
    }
    
    student.value = studentResponse.data;
    
    // Get session history
    const historyResponse = await sessionService.getStudentSessionHistory(student.value._id);
    
    if (historyResponse && historyResponse.data) {
      // Check for the new response format with 'data' property
      if (historyResponse.data.data && Array.isArray(historyResponse.data.data)) {
        sessionHistory.value = historyResponse.data.data;
        console.log("Session history loaded:", sessionHistory.value);
        
        // Check if error occurred but empty data was returned
        if (historyResponse.data.errorOccurred) {
          console.warn("API error occurred but recovered with empty data:", historyResponse.data.error);
          notificationService.showWarning("There was an issue loading some history data.");
        }
        
        // Initialize expanded state for each semester in each year level
        if (sessionHistory.value.length > 0) {
          // Create a structure to track expanded state by year level and semester ID
          expandedSemesters.value = {};
          
          sessionHistory.value.forEach((yearGroup, yearIndex) => {
            expandedSemesters.value[yearIndex] = {};
            
            // Expand only the first semester of the first year level by default
            if (yearGroup.semesters && yearGroup.semesters.length > 0) {
              yearGroup.semesters.forEach((semester, semIndex) => {
                expandedSemesters.value[yearIndex][semester.id] = yearIndex === 0 && semIndex === 0;
              });
            }
          });
        }
      } else if (Array.isArray(historyResponse.data)) {
        // Handle old response format for backward compatibility
        console.warn("Received old format response, converting to new structure");
        
        // Convert old format (flat array of semesters) to new grouped structure
        const oldData = historyResponse.data;
        const groupedByYear = new Map();
        
        oldData.forEach(semester => {
          const yearLevel = semester.class?.yearLevel || semester.classDetails?.yearLevel || 'Unknown';
          
          if (!groupedByYear.has(yearLevel)) {
            groupedByYear.set(yearLevel, {
              yearLevel,
              semesters: []
            });
          }
          
          groupedByYear.get(yearLevel).semesters.push(semester);
        });
        
        sessionHistory.value = Array.from(groupedByYear.values());
        
        // Initialize expanded state
        expandedSemesters.value = {};
        sessionHistory.value.forEach((yearGroup, yearIndex) => {
          expandedSemesters.value[yearIndex] = {};
          
          if (yearGroup.semesters && yearGroup.semesters.length > 0) {
            yearGroup.semesters.forEach((semester, semIndex) => {
              // Generate an ID if it doesn't have one
              if (!semester.id) {
                semester.id = `semester_${semIndex}_${Date.now()}`;
              }
              expandedSemesters.value[yearIndex][semester.id] = yearIndex === 0 && semIndex === 0;
            });
          }
        });
      } else {
        console.warn("Unexpected response format:", historyResponse.data);
        sessionHistory.value = [];
      }
    } else {
      console.warn("No session history data returned");
      sessionHistory.value = [];
    }
  } catch (error) {
    console.error("Error loading SSP history:", error);
    loadError.value = true;
    notificationService.showError("Failed to load SSP history: " + (error.message || "Unknown error"));
  } finally {
    loading.value = false;
  }
}

function toggleSemester(yearIndex, semesterId) {
  if (!expandedSemesters.value[yearIndex]) {
    expandedSemesters.value[yearIndex] = {};
  }
  
  expandedSemesters.value[yearIndex][semesterId] = !expandedSemesters.value[yearIndex][semesterId];
}

function isExpanded(yearIndex, semesterId) {
  return expandedSemesters.value[yearIndex] && expandedSemesters.value[yearIndex][semesterId];
}

function calculateCompletionPercentage(sessions) {
  if (!sessions || sessions.length === 0) return 0;
  
  const completedSessions = sessions.filter(session => session.completed);
  return Math.round((completedSessions.length / sessions.length) * 100);
}

function getCompletionBadgeClass(percentage) {
  if (percentage >= 90) return 'bg-green-100 text-green-800';
  if (percentage >= 70) return 'bg-blue-100 text-blue-800';
  if (percentage >= 40) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
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

function getAttachmentUrl(sessionId) {
  return `/api/sessions/${sessionId}/attachment`;
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