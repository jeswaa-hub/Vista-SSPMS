<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Notifications -->
      <div v-if="notification" class="fixed top-4 right-4 z-50 transform transition-all duration-500 max-w-sm">
        <div :class="{
          'bg-emerald-50 border-emerald-200 text-emerald-800': notification.type === 'success',
          'bg-blue-50 border-blue-200 text-blue-800': notification.type === 'info',
          'bg-amber-50 border-amber-200 text-amber-800': notification.type === 'warning',
          'bg-red-50 border-red-200 text-red-800': notification.type === 'error'
        }" class="border rounded-lg p-4 shadow-lg flex items-start">
          <div class="flex-shrink-0 mr-3">
            <svg v-if="notification.type === 'success'" class="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else-if="notification.type === 'error'" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-normal">{{ notification.message }}</p>
          </div>
        </div>
      </div>

      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-normal text-gray-800">Pending Registrations</h1>
              <p class="text-gray-500 font-normal">Review and manage student registration requests</p>
            </div>
          </div>
          <button 
            @click="fetchPendingRegistrations" 
            class="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md shadow-sm text-sm font-normal text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Pending Registrations -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div v-if="loading" class="flex justify-center items-center p-12">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-4"></div>
            <p class="text-gray-500">Loading registration requests...</p>
          </div>
        </div>
        
        <div v-else-if="pendingStudents.length === 0" class="flex flex-col items-center justify-center p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 class="text-lg font-normal text-gray-800 mb-1">No Pending Registrations</h3>
          <p class="text-gray-500 font-normal max-w-md">There are currently no student registration requests waiting for approval.</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Student</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">ID No.</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Class</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Registered</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="student in pendingStudents" :key="student._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-4 py-2">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                      {{ getInitials(student.user) }}
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900 leading-tight">
                        {{ student.user.firstName }} {{ student.user.middleName ? student.user.middleName + ' ' : '' }}{{ student.user.lastName }} {{ student.user.nameExtension !== 'N/A' ? student.user.nameExtension : '' }}
                      </div>
                      <div class="text-xs text-gray-500 flex items-center space-x-1 mt-0.5">
                        <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{{ student.gender }}</span>
                        <span class="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{{ student.major }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-2 text-xs text-gray-600 whitespace-nowrap">
                  <span class="font-mono">{{ student.user.idNumber }}</span>
                </td>
                <td class="px-4 py-2 text-xs text-gray-600">
                  <a href="#" class="text-blue-600 hover:text-blue-800 max-w-[180px] truncate inline-block">{{ student.user.email }}</a>
                </td>
                <td class="px-4 py-2 text-xs text-gray-700">
                  <span class="px-2 py-0.5 bg-gray-100 text-gray-800 rounded">
                    {{ getStudentClassInfo(student) }}
                  </span>
                </td>
                <td class="px-4 py-2 text-xs text-gray-600 whitespace-nowrap">
                  {{ formatDate(student.createdAt) }}
                </td>
                <td class="px-4 py-2 text-center text-xs font-medium whitespace-nowrap">
                  <div class="flex justify-center space-x-2">
                    <button 
                      @click="viewStudent(student)"
                      class="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    <button 
                      @click="confirmAction('approve', student._id)"
                      class="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs rounded text-white bg-green-600 hover:bg-green-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button 
                      @click="confirmAction('reject', student._id)"
                      class="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs rounded text-white bg-red-600 hover:bg-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

    <!-- View Student Modal (Registration Application) -->
    <div v-if="viewModal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeViewModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Registration Application</h3>
          <button @click="closeViewModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="viewModal.student" class="p-6 space-y-4">
          <div class="flex items-center">
            <div class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold mr-3">
              {{ getInitials(viewModal.student.user) }}
            </div>
            <div>
              <div class="text-sm text-gray-500">Submitted</div>
              <div class="text-sm text-gray-800">{{ formatDate(viewModal.student.createdAt) }}</div>
            </div>
          </div>
          <div class="bg-gray-50 rounded-md p-4 border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Personal Information</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-500">Full Name</div>
                <div class="text-gray-800">{{ viewModal.student.user.firstName }} {{ viewModal.student.user.middleName ? viewModal.student.user.middleName + ' ' : '' }}{{ viewModal.student.user.lastName }} {{ viewModal.student.user.nameExtension !== 'N/A' ? viewModal.student.user.nameExtension : '' }}</div>
              </div>
              <div>
                <div class="text-gray-500">ID Number</div>
                <div class="text-gray-800 font-mono">{{ viewModal.student.user.idNumber }}</div>
              </div>
              <div>
                <div class="text-gray-500">Gender</div>
                <div class="text-gray-800">{{ viewModal.student.gender }}</div>
              </div>
              <div>
                <div class="text-gray-500">Major</div>
                <div class="text-gray-800">{{ viewModal.student.major }}</div>
              </div>
              <div>
                <div class="text-gray-500">Email</div>
                <div class="text-indigo-700">{{ viewModal.student.user.email }}</div>
              </div>
              <div>
                <div class="text-gray-500">Contact Number</div>
                <div class="text-gray-800">{{ viewModal.student.contactNumber || 'Not provided' }}</div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 rounded-md p-4 border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Address</h4>
            <div class="text-sm text-gray-800" v-if="formatAddress(viewModal.student.address)">{{ formatAddress(viewModal.student.address) }}</div>
            <div class="text-sm text-gray-500 italic" v-else>No address provided</div>
          </div>
          <div class="bg-gray-50 rounded-md p-4 border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Class Assignment</h4>
            <div class="inline-block text-sm bg-indigo-50 text-indigo-800 px-3 py-2 rounded">{{ getStudentClassInfo(viewModal.student) }}</div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex justify-end gap-2">
          <button 
            @click="confirmAction('approve', viewModal.student?._id); closeViewModal();"
            class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Approve
          </button>
          <button 
            @click="confirmAction('reject', viewModal.student?._id); closeViewModal();"
            class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Reject
          </button>
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