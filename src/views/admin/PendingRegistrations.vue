<template>
  <div class="bg-gray-50 min-h-screen p-4 sm:p-6">
    <!-- Notifications -->
    <div v-if="notification" class="fixed top-4 right-4 z-50 transform transition-all duration-500 max-w-sm">
      <div :class="{
        'bg-green-100 border-green-500 text-green-700': notification.type === 'success',
        'bg-blue-100 border-blue-500 text-blue-700': notification.type === 'info',
        'bg-yellow-100 border-yellow-500 text-yellow-700': notification.type === 'warning',
        'bg-red-100 border-red-500 text-red-700': notification.type === 'error'
      }" class="border-l-4 p-4 rounded-md shadow-md flex items-start">
        <div class="flex-shrink-0 mr-3">
          <svg v-if="notification.type === 'success'" class="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="notification.type === 'error'" class="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium">{{ notification.message }}</p>
        </div>
      </div>
    </div>

    <!-- Students Pending Registration -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Pending Student Registrations</h3>
            <p class="text-sm text-gray-600 mt-1">Review and manage student registration requests</p>
          </div>
          <button 
            @click="fetchPendingRegistrations" 
            class="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      <div v-if="loading" class="flex justify-center items-center p-12">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p class="text-gray-500">Loading registration requests...</p>
        </div>
      </div>
      
      <div v-else-if="pendingStudents.length === 0" class="flex flex-col items-center justify-center p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h4 class="text-lg font-medium text-gray-900 mb-1">No Pending Registrations</h4>
        <p class="text-gray-500 max-w-md">There are currently no student registration requests waiting for approval.</p>
      </div>
      
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Information</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="student in pendingStudents" :key="student._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                      {{ getInitials(student.user) }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ student.user.firstName }} {{ student.user.middleName ? student.user.middleName + ' ' : '' }}{{ student.user.lastName }} {{ student.user.nameExtension !== 'N/A' ? student.user.nameExtension : '' }}
                      </div>
                      <div class="text-sm text-gray-500 flex items-center">
                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mr-2">{{ student.gender }}</span>
                        <span class="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">{{ student.major }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <span class="font-mono">{{ student.user.idNumber }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <a href="#" class="text-indigo-600 hover:text-indigo-900 hover:underline">{{ student.user.email }}</a>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-md">
                    {{ getStudentClassInfo(student) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(student.createdAt) }}
                  </div>
                </td>
                <td class="px-6 py-4 text-center text-sm font-medium">
                  <div class="flex justify-center space-x-2">
                    <button 
                      @click="viewStudent(student)"
                      class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    <button 
                      @click="confirmAction('approve', student._id)"
                      class="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button 
                      @click="confirmAction('reject', student._id)"
                      class="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="confirmModal.show" class="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="confirmModal.show = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10"
                :class="confirmModal.type === 'approve' ? 'bg-green-100' : 'bg-red-100'">
                <svg class="h-6 w-6" 
                  :class="confirmModal.type === 'approve' ? 'text-green-600' : 'text-red-600'"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="confirmModal.type === 'approve'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ confirmModal.title }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    {{ confirmModal.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row-reverse gap-2">
            <button 
              @click="confirmModal.onConfirm"
              type="button" 
              :class="[
                'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                confirmModal.type === 'approve' ? 
                  'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 
                  'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              ]"
              :disabled="isProcessing"
            >
              <svg v-if="isProcessing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isProcessing ? 'Processing...' : confirmModal.type === 'approve' ? 'Approve' : 'Reject' }}
            </button>
            <button 
              @click="confirmModal.show = false" 
              type="button" 
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              :disabled="isProcessing"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Student Modal -->
    <div v-if="viewModal.show" class="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeViewModal"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <div class="relative">
            <div class="absolute top-0 right-0 pt-4 pr-4">
              <button @click="closeViewModal" class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span class="sr-only">Close</span>
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div v-if="viewModal.student" class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div class="flex items-center mb-4">
                    <div class="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-lg mr-4">
                      {{ getInitials(viewModal.student.user) }}
                    </div>
                    <div>
                      <h3 class="text-lg leading-6 font-medium text-gray-900">
                        Registration Application
                      </h3>
                      <p class="text-sm text-gray-500">
                        Submitted on {{ formatDate(viewModal.student.createdAt) }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="bg-gray-50 p-4 rounded-md mb-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Personal Information</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span class="text-xs text-gray-500 block">Full Name</span>
                        <span class="text-sm font-medium">{{ viewModal.student.user.firstName }} {{ viewModal.student.user.middleName ? viewModal.student.user.middleName + ' ' : '' }}{{ viewModal.student.user.lastName }} {{ viewModal.student.user.nameExtension !== 'N/A' ? viewModal.student.user.nameExtension : '' }}</span>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 block">ID Number</span>
                        <span class="text-sm font-medium font-mono">{{ viewModal.student.user.idNumber }}</span>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 block">Gender</span>
                        <span class="text-sm font-medium">{{ viewModal.student.gender }}</span>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 block">Major</span>
                        <span class="text-sm font-medium">{{ viewModal.student.major }}</span>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 block">Email Address</span>
                        <span class="text-sm font-medium text-indigo-600">{{ viewModal.student.user.email }}</span>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 block">Contact Number</span>
                        <span class="text-sm font-medium">{{ viewModal.student.contactNumber || 'Not provided' }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-gray-50 p-4 rounded-md mb-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Address</h4>
                    <p class="text-sm" v-if="formatAddress(viewModal.student.address)">
                      {{ formatAddress(viewModal.student.address) }}
                    </p>
                    <p class="text-sm text-gray-500 italic" v-else>No address provided</p>
                  </div>
                  
                  <div class="bg-gray-50 p-4 rounded-md">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Class Assignment</h4>
                    <div class="text-sm bg-indigo-50 text-indigo-800 px-3 py-2 rounded inline-block">
                      {{ getStudentClassInfo(viewModal.student) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end space-x-3">
              <button 
                @click="confirmAction('approve', viewModal.student?._id); closeViewModal();"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
              <button 
                @click="confirmAction('reject', viewModal.student?._id); closeViewModal();"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { studentService } from '../../services/studentService';

// State
const loading = ref(false);
const error = ref('');
const pendingStudents = ref([]);
const notification = ref(null);
const isProcessing = ref(false);

const viewModal = reactive({
  show: false,
  student: null
});

const confirmModal = reactive({
  show: false,
  title: '',
  message: '',
  type: '',
  studentId: null,
  onConfirm: null
});

onMounted(() => {
  fetchPendingRegistrations();
});

// Function to fetch pending registrations
const fetchPendingRegistrations = async () => {
  loading.value = true;
  error.value = '';
  notification.value = null;
  
  try {
    console.log('Fetching pending registrations...');
    const data = await studentService.getPendingRegistrations();
    
    if (!data) {
      console.warn('No data returned from getPendingRegistrations');
      pendingStudents.value = [];
      showNotification('info', 'No pending registrations found');
      return;
    }
    
    // Simple validation - we expect an array
    if (Array.isArray(data)) {
      console.log(`Received ${data.length} pending registrations`);
      pendingStudents.value = data;
      
      if (data.length === 0) {
        showNotification('info', 'No pending registrations found');
      }
    } else {
      console.error('Unexpected data format:', data);
      pendingStudents.value = [];
      showNotification('error', 'Received invalid data format from server');
    }
  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    pendingStudents.value = [];
    
    // Display user-friendly error message
    if (error.response) {
      const message = error.response.data?.message || `Server error (${error.response.status})`;
      showNotification('error', message);
    } else {
      showNotification('error', 'Failed to connect to server');
    }
  } finally {
    loading.value = false;
  }
};

// Format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Get student initials for avatar
function getInitials(user) {
  if (!user) return '??';
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

// Format address
function formatAddress(address) {
  if (!address) return '';
  
  const parts = [];
  if (address.block) parts.push(address.block);
  if (address.street) parts.push(address.street);
  if (address.barangay) parts.push(address.barangay);
  if (address.municipality) parts.push(address.municipality);
  if (address.province) parts.push(address.province);
  if (address.region) parts.push(address.region);
  
  return parts.join(', ');
}

// Format class info when from a class object
function getClassString(classObj) {
  if (!classObj) return 'Not assigned';
  
  let info = '';
  
  if (classObj.yearLevel) {
    info += `${classObj.yearLevel}`;
    
    // Add suffix to year level
    if (classObj.yearLevel === '1') info += 'st';
    else if (classObj.yearLevel === '2') info += 'nd';
    else if (classObj.yearLevel === '3') info += 'rd';
    else info += 'th';
    
    info += ' Year';
  }
  
  if (classObj.section) {
    info += ` - ${classObj.section}`;
  }
  
  if (classObj.major) {
    info += ` (${classObj.major})`;
  }
  
  return info || 'Not assigned';
}

// Helper function to format class info consistently
function formatClassInfo(classInfo) {
  if (!classInfo) return 'Not assigned';
  
  let info = '';
  
  if (classInfo.yearLevel) {
    // Normalize yearLevel to add suffix if not present
    let yearLevel = classInfo.yearLevel;
    
    // Strip any existing suffix first (2nd → 2, 3rd → 3)
    if (typeof yearLevel === 'string' && 
        (yearLevel.endsWith('nd') || yearLevel.endsWith('rd') || yearLevel.endsWith('th'))) {
      yearLevel = yearLevel.replace(/[^0-9]/g, '');
    }
    
    info += yearLevel;
    
    // Add suffix to year level
    if (yearLevel === '1' || yearLevel === 1) info += 'st';
    else if (yearLevel === '2' || yearLevel === 2) info += 'nd';
    else if (yearLevel === '3' || yearLevel === 3) info += 'rd';
    else info += 'th';
    
    info += ' Year';
  }
  
  if (classInfo.section) {
    info += ` - ${classInfo.section}`;
  }
  
  if (classInfo.major) {
    info += ` (${classInfo.major})`;
  }
  
  return info || 'Not assigned';
}

// Get class info from student object
function getStudentClassInfo(student) {
  if (!student) return 'Not assigned';
  
  // First try class object
  if (student.class && typeof student.class === 'object') {
    return formatClassInfo(student.class);
  }
  
  // Then try classInfo property
  if (student.classInfo) {
    return formatClassInfo(student.classInfo);
  }
  
  // Then try classDetails property
  if (student.classDetails) {
    return formatClassInfo(student.classDetails);
  }
  
  return 'Not assigned';
}

async function approveRegistration(studentId) {
  if (isProcessing.value) return;
  
  try {
    isProcessing.value = true;
    confirmModal.show = false;
    
    await studentService.approveRegistration(studentId);
    
    // Remove approved student from list
    pendingStudents.value = pendingStudents.value.filter(student => student._id !== studentId);
    
    showNotification('success', 'Registration approved successfully. Student has been notified via email.');
  } catch (error) {
    showNotification('error', 'Failed to approve registration');
    console.error('Error approving registration:', error);
  } finally {
    isProcessing.value = false;
  }
}

async function rejectRegistration(studentId) {
  if (isProcessing.value) return;
  
  try {
    isProcessing.value = true;
    confirmModal.show = false;
    
    await studentService.rejectRegistration(studentId);
    
    // Remove rejected student from list
    pendingStudents.value = pendingStudents.value.filter(student => student._id !== studentId);
    
    showNotification('success', 'Registration rejected. Student has been notified via email.');
  } catch (error) {
    showNotification('error', 'Failed to reject registration');
    console.error('Error rejecting registration:', error);
  } finally {
    isProcessing.value = false;
  }
}

function viewStudent(student) {
  viewModal.student = student;
  viewModal.show = true;
}

function closeViewModal() {
  viewModal.show = false;
}

function confirmAction(type, studentId) {
  confirmModal.type = type;
  confirmModal.studentId = studentId;
  confirmModal.title = type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection';
  confirmModal.message = type === 'approve' 
    ? 'Are you sure you want to approve this student registration?' 
    : 'Are you sure you want to reject this student registration?';
  
  confirmModal.onConfirm = () => {
    if (type === 'approve') {
      approveRegistration(studentId);
    } else {
      rejectRegistration(studentId);
    }
  };
  
  confirmModal.show = true;
}

// Show notification
const showNotification = (type, message) => {
  notification.value = { type, message };
  setTimeout(() => {
    notification.value = null;
  }, 5000);
};
</script> 