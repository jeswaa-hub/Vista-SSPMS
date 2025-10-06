<template>
  <div class="min-h-screen py-8" style="background-color: #F6FBF9;">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Header Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          M&M Submission History
        </h1>
        <p class="text-gray-600 mt-1">View all your submitted M&M exam images</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-8 text-center">
        <div class="flex justify-center mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
        </div>
        <p class="text-gray-500">Loading your M&M history...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="history.length === 0" class="bg-white rounded-lg shadow-md p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">No M&M submissions found</h3>
        <p class="text-gray-500 mb-4">You haven't submitted any M&M exam images yet.</p>
        <router-link to="/student/surveys" class="inline-flex items-center px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Submit Your First M&M
        </router-link>
      </div>

      <!-- History List -->
      <div v-else class="space-y-6">
        <div v-for="yearSemester in history" :key="`${yearSemester.yearLevel}-${yearSemester.semester}`" class="bg-white rounded-lg shadow-md overflow-hidden">
          <!-- Year Level & Semester Header -->
          <div class="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-4">
            <h2 class="text-xl font-bold">{{ yearSemester.yearLevel }} Year - {{ yearSemester.semester }} Semester</h2>
            <p class="text-blue-100 mt-1">
              {{ (yearSemester.mmSubmissions?.length || 0) + (yearSemester.permits?.length || 0) }} item(s)
              <span class="ml-2 text-xs">(M&M: {{ yearSemester.mmSubmissions?.length || 0 }}, Permits: {{ yearSemester.permits?.length || 0 }})</span>
            </p>
          </div>

          <!-- M&M Submissions Grid -->
          <div class="p-6">
            <h3 class="text-gray-800 font-semibold mb-3">M&M Submissions</h3>
            <div v-if="(yearSemester.mmSubmissions?.length || 0) > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div v-for="submission in yearSemester.mmSubmissions" :key="submission._id" class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <!-- Exam Type Header -->
                <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div class="flex justify-between items-center">
                    <h3 class="font-semibold text-gray-800">{{ submission.examType }} Exam</h3>
                    <span class="px-2 py-1 text-xs rounded-full font-medium" :class="getStatusClass(submission.status)">
                      {{ submission.status }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">
                    Submitted {{ formatDate(submission.submissionDate) }}
                  </p>
                </div>

                <!-- Image Preview -->
                <div class="p-4">
                  <div class="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      :src="submission.imageUrl" 
                      :alt="`${submission.examType} Exam Submission`"
                      class="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      @click="openImageModal(submission)"
                    />
                  </div>
                  <button 
                    @click="openImageModal(submission)"
                    class="w-full mt-3 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    View Full Image
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">No M&M submissions for this term.</div>
                </div>

          <!-- Permit Entries Grid (validated only) -->
          <div class="px-6 pb-6">
            <h3 class="text-gray-800 font-semibold mb-3">Validated Exam Permits</h3>
            <div v-if="(yearSemester.permits?.length || 0) > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div v-for="permit in yearSemester.permits" :key="permit._id" class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div class="flex justify-between items-center">
                    <h3 class="font-semibold text-gray-800">{{ permit.examType }}</h3>
                    <span class="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">validated</span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">
                    Submitted {{ formatDate(permit.submissionDate) }}
                  </p>
                </div>
                <div class="p-4">
                  <div class="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <template v-if="permit.mimetype === 'application/pdf'">
                      <a :href="permit.imageUrl" target="_blank" rel="noopener" class="px-3 py-2 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700">
                        Open PDF
                      </a>
                    </template>
                    <img v-else
                      :src="permit.imageUrl" 
                      :alt="`${permit.examType}`"
                      class="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      @click="openImageModal(permit)"
                    />
                  </div>
                  <button v-if="permit.mimetype !== 'application/pdf'"
                    @click="openImageModal(permit)"
                    class="w-full mt-3 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    View Full Image
                  </button>
              </div>
            </div>
            </div>
            <div v-else class="text-sm text-gray-500">No validated permits for this term.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="selectedSubmission" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">
              {{ selectedSubmission.examType }} Exam - {{ selectedSubmission.yearLevel }} Year, {{ selectedSubmission.semester }} Semester
            </h3>
            <p class="text-sm text-gray-500">Submitted {{ formatDate(selectedSubmission.submissionDate) }}</p>
          </div>
          <button 
            @click="closeImageModal"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-4 max-h-96 overflow-y-auto">
          <img 
            :src="selectedSubmission.imageUrl" 
            :alt="`${selectedSubmission.examType} Exam Submission`"
            class="w-full h-auto rounded-lg"
          />
          
          <!-- Submission Details -->
          <div class="mt-4 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">Status:</span>
              <span class="px-2 py-1 text-xs rounded-full font-medium" :class="getStatusClass(selectedSubmission.status)">
                {{ selectedSubmission.status }}
              </span>
            </div>
            
            <div v-if="selectedSubmission.feedback" class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <h4 class="text-sm font-medium text-yellow-800 mb-1">Feedback:</h4>
              <p class="text-sm text-yellow-700">{{ selectedSubmission.feedback }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { mmService } from '../../services/midtermFinalsService';
import { notificationService } from '../../services/notificationService';

// State
const history = ref([]);
const loading = ref(true);
const selectedSubmission = ref(null);

// Methods
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusClass(status) {
  switch(status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

function openImageModal(submission) {
  selectedSubmission.value = submission;
}

function closeImageModal() {
  selectedSubmission.value = null;
}

// Load data
async function fetchHistory() {
  try {
    loading.value = true;
    console.log('Loading M&M history...');
    const response = await mmService.getHistory();
    
    if (response.success) {
      history.value = response.data || [];
      console.log('Loaded M&M history:', history.value);
      
      // Debug image URLs for both M&M and permits
      history.value.forEach(yearSemester => {
        const mmCount = (yearSemester.mmSubmissions?.length || 0);
        const permitCount = (yearSemester.permits?.length || 0);
        console.log(`Year ${yearSemester.yearLevel} - ${yearSemester.semester} Semester: MMs=${mmCount}, Permits=${permitCount}`);
        (yearSemester.mmSubmissions || []).forEach(submission => {
          console.log(`  MM ${submission.examType} image URL:`, submission.imageUrl);
        });
        (yearSemester.permits || []).forEach(permit => {
          console.log(`  Permit ${permit.examType} image URL:`, permit.imageUrl);
        });
      });
    } else {
      console.error('Failed to load M&M history:', response.message);
      history.value = [];
    }
  } catch (error) {
    console.error('Error fetching M&M history:', error);
    history.value = [];
    notificationService.showError('Failed to load M&M history');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchHistory();
});
</script>

<style scoped>
.text-primary {
  color: #3B82F6;
}

.bg-primary {
  background-color: #3B82F6;
}

.bg-primary-dark {
  background-color: #2563EB;
}

.hover\:bg-primary-dark:hover {
  background-color: #2563EB;
}
</style> 