<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Students</h1>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 mb-6 rounded-lg shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
          <select
            v-model="filters.yearLevel"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            @change="onYearLevelChange"
          >
            <option value="">All Years</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select
            v-model="filters.section"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            @change="applyFiltersAndPagination"
          >
            <option value="">All Sections</option>
            <option v-for="(section, index) in availableSections" :key="index" :value="section">
              {{ section }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Major</label>
          <select
            v-model="filters.major"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            @change="applyFiltersAndPagination"
          >
            <option value="">All Majors</option>
            <option v-for="(major, index) in availableMajors" :key="index" :value="major">
              {{ major }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by name or ID"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            @input="handleSearchInput"
          />
        </div>
      </div>
    </div>

    <!-- Add button bar above table -->
    <div class="mb-4 flex justify-between items-center">
      <div>
        <h2 class="text-lg font-semibold">Students</h2>
      </div>
      <div class="flex space-x-2">
        <button
          @click="reassignUnassignedStudents"
          :disabled="assigningClasses"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          title="Find and reassign students that have lost their class assignments"
        >
          <span v-if="assigningClasses">Reassigning...</span>
          <span v-else>Reassign Unassigned Students</span>
        </button>
        <button
          @click="assignAllStudentsToClasses"
          :disabled="assigningClasses"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="assigningClasses">Assigning...</span>
          <span v-else>Assign All Students</span>
        </button>
        <button
          @click="refreshStudents"
          :disabled="loading"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>Refresh List</span>
        </button>
      </div>
    </div>

    <!-- Students Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID Number
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Class
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="4" class="px-6 py-4 text-center">
              <div class="flex justify-center items-center">
                <svg class="animate-spin h-5 w-5 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading students...
              </div>
            </td>
          </tr>
          <tr v-else-if="students.length === 0">
            <td colspan="4" class="px-6 py-4 text-center">
              No students found
            </td>
          </tr>
          <tr v-for="(student, index) in students" :key="index" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-500">
                    {{ getInitials(student) }}
                  </span>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ student.user?.firstName || '' }} {{ student.user?.middleName || '' }} {{ student.user?.lastName || '' }}
                    {{ student.user?.nameExtension !== 'N/A' ? student.user?.nameExtension : '' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ student.user?.email || '' }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ student.user?.idNumber || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ getClassName(student.class, student) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="viewStudent(student)" 
                class="text-primary hover:text-primary-dark mr-2"
              >
                View
              </button>
              <button 
                @click="editStudent(student)" 
                class="text-primary hover:text-primary-dark"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ pagination.from }}</span> to <span class="font-medium">{{ pagination.to }}</span> of <span class="font-medium">{{ pagination.total }}</span> students
            </p>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="changePage(pagination.currentPage - 1)" 
              :disabled="pagination.currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              @click="changePage(pagination.currentPage + 1)" 
              :disabled="pagination.currentPage === pagination.totalPages"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Student Modal -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto p-6 z-50 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Student Details</h2>
          <button @click="showViewModal = false" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div v-if="currentStudent">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="col-span-2 flex items-center">
              <div class="h-16 w-16 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                <span class="text-xl font-medium text-gray-500">
                  {{ getInitials(currentStudent) }}
                </span>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">
                  {{ currentStudent.user?.firstName || '' }} {{ currentStudent.user?.middleName || '' }} {{ currentStudent.user?.lastName || '' }}
                  {{ currentStudent.user?.nameExtension !== 'N/A' ? currentStudent.user?.nameExtension : '' }}
                </h3>
                <p class="text-gray-600">{{ currentStudent.user?.email || '' }}</p>
              </div>
            </div>
            
            <div>
              <h4 class="text-sm font-medium text-gray-500">ID Number</h4>
              <p class="text-gray-900">{{ currentStudent.user?.idNumber || 'N/A' }}</p>
            </div>
            
            <div>
              <h4 class="text-sm font-medium text-gray-500">Contact Number</h4>
              <p class="text-gray-900">{{ currentStudent.contactNumber || 'N/A' }}</p>
            </div>
            
            <div class="col-span-2">
              <h4 class="text-sm font-medium text-gray-500">Address</h4>
              <div v-if="currentStudent.address && (currentStudent.address.block || currentStudent.address.street || currentStudent.address.barangay || currentStudent.address.municipality || currentStudent.address.province)">
                <p v-if="currentStudent.address.block">Block: {{ currentStudent.address.block }}</p>
                <p v-if="currentStudent.address.street">Street/Purok: {{ currentStudent.address.street }}</p>
                <p v-if="currentStudent.address.barangay">Barangay: {{ currentStudent.address.barangay }}</p>
                <p v-if="currentStudent.address.municipality">Municipality: {{ currentStudent.address.municipality }}</p>
                <p v-if="currentStudent.address.province">Province: {{ currentStudent.address.province }}</p>
              </div>
              <p v-else class="text-gray-900">N/A</p>
            </div>
            
            <div>
              <h4 class="text-sm font-medium text-gray-500">Gender</h4>
              <p class="text-gray-900">{{ currentStudent.gender || 'N/A' }}</p>
            </div>
            
            <div>
              <h4 class="text-sm font-medium text-gray-500">Class</h4>
              <p class="text-gray-900">{{ getClassName(currentStudent.class, currentStudent) }}</p>
            </div>
            
            <div>
              <h4 class="text-sm font-medium text-gray-500">Major</h4>
              <p class="text-gray-900">{{ currentStudent.major || 'N/A' }}</p>
            </div>
            
            <div>
              <h4 class="text-sm font-medium text-gray-500">Status</h4>
              <p class="text-gray-900">{{ currentStudent.status || 'Active' }}</p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-6">
          <button
            @click="showViewModal = false"
            class="px-4 py-2 mr-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Close
          </button>
          <button
            @click="() => { editStudent(currentStudent); showViewModal = false; }"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Edit Student
          </button>
        </div>
      </div>
    </div>
    
    <!-- Edit Student Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto p-6 z-50 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Edit Student</h2>
          <button @click="showEditModal = false" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="updateStudent">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                v-model="editForm.firstName" 
                type="text" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <input 
                v-model="editForm.middleName" 
                type="text" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                v-model="editForm.lastName" 
                type="text" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name Extension</label>
              <input 
                v-model="editForm.nameExtension" 
                type="text" 
                placeholder="e.g. Jr., Sr., III"
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
              <input 
                v-model="editForm.idNumber" 
                type="text" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                v-model="editForm.email" 
                type="email" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input 
                v-model="editForm.contactNumber" 
                type="text" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div class="col-span-1 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Block</label>
                  <input 
                    v-model="editForm.address.block" 
                    type="text" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Street/Purok</label>
                  <input 
                    v-model="editForm.address.street" 
                    type="text" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Barangay</label>
                  <div v-if="!customAddress.barangay">
                    <select 
                      v-model="editForm.address.barangay" 
                      :disabled="!editForm.address.municipality && !customAddress.municipality"
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select Barangay</option>
                      <option v-for="barangay in availableBarangays" :key="barangay" :value="barangay">
                        {{ barangay }}
                      </option>
                    </select>
                    <div class="mt-1">
                      <button 
                        type="button" 
                        @click="customAddress.barangay = true" 
                        class="text-xs text-primary hover:underline"
                        :disabled="!editForm.address.municipality && !customAddress.municipality"
                      >
                        Barangay not in the list? Click here to enter manually
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <input 
                      v-model="editForm.address.barangay" 
                      type="text" 
                      placeholder="Enter barangay" 
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                    <div class="mt-1">
                      <button 
                        type="button" 
                        @click="resetCustomBarangay" 
                        class="text-xs text-primary hover:underline"
                      >
                        Use dropdown list instead
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Municipality</label>
                  <div v-if="!customAddress.municipality">
                    <select 
                      v-model="editForm.address.municipality" 
                      :disabled="!editForm.address.province && !customAddress.province"
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      @change="loadBarangays"
                    >
                      <option value="">Select Municipality</option>
                      <option v-for="municipality in availableMunicipalities" :key="municipality" :value="municipality">
                        {{ municipality }}
                      </option>
                    </select>
                    <div class="mt-1">
                      <button 
                        type="button" 
                        @click="customAddress.municipality = true" 
                        class="text-xs text-primary hover:underline"
                        :disabled="!editForm.address.province && !customAddress.province"
                      >
                        Municipality not in the list? Click here to enter manually
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <input 
                      v-model="editForm.address.municipality" 
                      type="text" 
                      placeholder="Enter municipality/city" 
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                    <div class="mt-1">
                      <button 
                        type="button" 
                        @click="resetCustomMunicipality" 
                        class="text-xs text-primary hover:underline"
                      >
                        Use dropdown list instead
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Province</label>
                  <div v-if="!customAddress.province">
                    <select 
                      v-model="editForm.address.province" 
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      @change="loadMunicipalities"
                    >
                      <option value="">Select Province</option>
                      <option v-for="province in provinces" :key="province" :value="province">
                        {{ province }}
                      </option>
                    </select>
                    <div class="mt-1">
                      <button 
                        type="button" 
                        @click="customAddress.province = true" 
                        class="text-xs text-primary hover:underline"
                      >
                        Province not in the list? Click here to enter manually
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <input 
                      v-model="editForm.address.province" 
                      type="text" 
                      placeholder="Enter province" 
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                    <div class="mt-1">
                      <button 
                        type="button" 
                        @click="resetCustomProvince" 
                        class="text-xs text-primary hover:underline"
                      >
                        Use dropdown list instead
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                v-model="editForm.gender"
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Major</label>
              <select
                v-model="editForm.major"
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="">Select Major</option>
                <option v-for="major in availableMajors" :key="major" :value="major">{{ major }}</option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 mr-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { notificationService } from '../../services/notificationService';
import api from '../../services/api';

// State
const students = ref([]);
const allStudents = ref([]);
const classes = ref([]);
const loading = ref(false);
const showImportModal = ref(false);
const importFile = ref(null);
const importProgress = ref({
  total: 0,
  current: 0,
  isUploading: false
});

// Filters
const filters = reactive({
  yearLevel: '',
  section: '',
  major: '',
  search: ''
});

// Pagination
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  itemsPerPage: 10,
  totalItems: 0
});

// Search input debounce
let searchTimeout = null

// Define available sections and majors based on year level
const availableSections = ref([]);
const availableMajors = ref([]);

// Add to the script section
const assigningClasses = ref(false)

// Add these state variables for modals
const showViewModal = ref(false);
const showEditModal = ref(false);
const currentStudent = ref(null);
const editForm = ref({
  firstName: '',
  middleName: '',
  lastName: '',
  nameExtension: '',
  email: '',
  idNumber: '',
  contactNumber: '',
  address: {
    block: '',
    street: '',
    barangay: '',
    municipality: '',
    province: ''
  },
  gender: '',
  major: '',
  yearLevel: '',
  section: ''
});

// Address dropdown data
const provinces = [
  'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique', 'Apayao',
  'Aurora', 'Basilan', 'Bataan', 'Batanes', 'Batangas', 'Benguet', 'Biliran', 'Bohol',
  'Bukidnon', 'Bulacan', 'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Camiguin',
  'Capiz', 'Catanduanes', 'Cavite', 'Cebu', 'Cotabato', 'Davao de Oro', 'Davao del Norte',
  'Davao del Sur', 'Davao Occidental', 'Davao Oriental', 'Dinagat Islands', 'Eastern Samar',
  'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo', 'Isabela', 'Kalinga',
  'La Union', 'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'Leyte', 'Maguindanao',
  'Marinduque', 'Masbate', 'Metro Manila', 'Misamis Occidental', 'Misamis Oriental',
  'Mountain Province', 'Negros Occidental', 'Negros Oriental', 'Northern Samar', 'Nueva Ecija',
  'Nueva Vizcaya', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Pampanga',
  'Pangasinan', 'Quezon', 'Quirino', 'Rizal', 'Romblon', 'Samar', 'Sarangani', 'Siquijor',
  'Sorsogon', 'South Cotabato', 'Southern Leyte', 'Sultan Kudarat', 'Sulu', 'Surigao del Norte',
  'Surigao del Sur', 'Tarlac', 'Tawi-Tawi', 'Zambales', 'Zamboanga del Norte', 'Zamboanga del Sur',
  'Zamboanga Sibugay'
];

const municipalitiesByProvince = {
  'Metro Manila': ['Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig', 'Parañaque', 'Caloocan', 
    'Las Piñas', 'Malabon', 'Mandaluyong', 'Marikina', 'Muntinlupa', 'Navotas', 'Pasay', 
    'Pateros', 'San Juan', 'Valenzuela'],
  
  'Batangas': ['Batangas City', 'Lipa', 'Tanauan', 'Santo Tomas', 'Bauan', 'San Jose', 
    'Nasugbu', 'Balayan', 'Lemery', 'Taal', 'Calatagan', 'Rosario', 'Malvar', 'San Juan', 
    'Ibaan', 'Padre Garcia'],
    
  'Laguna': ['Calamba', 'Santa Rosa', 'Biñan', 'San Pedro', 'Cabuyao', 'Los Baños', 
    'San Pablo', 'Alaminos', 'Bay', 'Calauan', 'Famy', 'Kalayaan', 'Liliw', 'Luisiana', 
    'Lumban', 'Mabitac', 'Magdalena', 'Majayjay', 'Nagcarlan', 'Paete', 'Pagsanjan', 
    'Pakil', 'Pangil', 'Pila', 'Rizal', 'Santa Cruz', 'Santa Maria', 'Siniloan', 'Victoria'],
    
  'Cavite': ['Bacoor', 'Dasmariñas', 'Imus', 'General Trias', 'Cavite City', 'Kawit', 
    'Silang', 'Tagaytay', 'Trece Martires', 'Carmona', 'Maragondon', 'Amadeo', 'Alfonso', 
    'General Emilio Aguinaldo', 'Indang', 'Magallanes', 'Mendez', 'Naic', 'Noveleta', 
    'Rosario', 'Tanza', 'Ternate'],
    
  'Rizal': ['Antipolo', 'Cainta', 'Taytay', 'San Mateo', 'Rodriguez', 'Angono', 'Binangonan', 
    'Baras', 'Cardona', 'Jalajala', 'Morong', 'Pililla', 'Tanay', 'Teresa'],
    
  'Bulacan': ['Malolos', 'Meycauayan', 'San Jose del Monte', 'Balagtas', 'Baliuag', 'Bocaue', 
    'Bulakan', 'Bustos', 'Calumpit', 'Guiguinto', 'Hagonoy', 'Marilao', 'Norzagaray', 'Obando', 
    'Pandi', 'Paombong', 'Plaridel', 'Pulilan', 'San Ildefonso', 'San Miguel', 'San Rafael', 
    'Santa Maria'],
    
  'Nueva Ecija': ['Cabanatuan', 'Palayan', 'San Jose', 'Gapan', 'Science City of Muñoz', 
    'Aliaga', 'Bongabon', 'Cabiao', 'Carranglan', 'Cuyapo', 'Gabaldon', 'General Mamerto Natividad', 
    'General Tinio', 'Guimba', 'Jaen', 'Laur', 'Licab', 'Llanera', 'Lupao', 'Nampicuan', 
    'Pantabangan', 'Peñaranda', 'Quezon', 'Rizal', 'San Antonio', 'San Isidro', 'San Leonardo', 
    'Santa Rosa', 'Santo Domingo', 'Talavera', 'Talugtug', 'Zaragoza'],
    
  'Pampanga': ['San Fernando', 'Angeles', 'Mabalacat', 'Apalit', 'Arayat', 'Bacolor', 'Candaba', 
    'Floridablanca', 'Guagua', 'Lubao', 'Macabebe', 'Magalang', 'Masantol', 'Mexico', 'Minalin', 
    'Porac', 'San Luis', 'San Simon', 'Santa Ana', 'Santa Rita', 'Santo Tomas', 'Sasmuan'],
    
  'Tarlac': ['Tarlac City', 'Capas', 'Concepcion', 'Gerona', 'Paniqui', 'Bamban', 'Camiling', 
    'La Paz', 'Mayantoc', 'Moncada', 'Pura', 'Ramos', 'San Clemente', 'San Jose', 'San Manuel', 
    'Santa Ignacia', 'Victoria'],
    
  'Pangasinan': ['Dagupan', 'Alaminos', 'San Carlos', 'Urdaneta', 'Tayug', 'Lingayen', 'Calasiao', 
    'Binmaley', 'Mangaldan', 'Manaoag', 'Rosales', 'Santa Barbara', 'Balungao', 'Agno', 'Alcala', 
    'Anda', 'Asingan', 'Bani', 'Basista', 'Bautista', 'Bayambang', 'Bolinao', 'Bugallon', 
    'Burgos', 'Dasol', 'Infanta', 'Labrador', 'Laoac', 'Mabini', 'Malasiqui', 'Mapandan', 'Natividad', 
    'Pozzorubio', 'San Fabian', 'San Jacinto', 'San Manuel', 'San Nicolas', 'San Quintin', 'Santa Maria', 
    'Santo Tomas', 'Sison', 'Sual', 'Urbiztondo', 'Villasis'],
    
  'Isabela': ['Ilagan', 'Cauayan', 'Santiago', 'Alicia', 'Angadanan', 'Aurora', 'Benito Soliven', 
    'Burgos', 'Cabagan', 'Cabatuan', 'Cordon', 'Delfin Albano', 'Dinapigue', 'Divilacan', 'Echague', 
    'Gamu', 'Jones', 'Luna', 'Maconacon', 'Mallig', 'Naguilian', 'Palanan', 'Quezon', 'Quirino', 
    'Ramon', 'Reina Mercedes', 'Roxas', 'San Agustin', 'San Guillermo', 'San Isidro', 'San Manuel', 
    'San Mariano', 'San Mateo', 'San Pablo', 'Santa Maria', 'Santo Tomas', 'Tumauini'],
  
  'Bataan': ['Balanga', 'Abucay', 'Bagac', 'Dinalupihan', 'Hermosa', 'Limay', 'Mariveles', 
    'Morong', 'Orani', 'Orion', 'Pilar', 'Samal'],
    
  'Aurora': ['Baler', 'Casiguran', 'Dilasag', 'Dinalungan', 'Dingalan', 'Dipaculao', 
    'Maria Aurora', 'San Luis'],
    
  'Zambales': ['Olongapo', 'Iba', 'Subic', 'Botolan', 'Cabangan', 'Candelaria', 'Castillejos', 
    'Masinloc', 'Palauig', 'San Antonio', 'San Felipe', 'San Marcelino', 'San Narciso', 'Santa Cruz']
  
  // More provinces can be added here as needed
};

const barangaysByMunicipality = {
  // Metro Manila municipalities
  'Manila': ['Binondo', 'Ermita', 'Intramuros', 'Malate', 'Paco', 'Pandacan', 'Port Area', 'Quiapo', 
    'Sampaloc', 'San Andres', 'San Miguel', 'San Nicolas', 'Santa Ana', 'Santa Cruz', 'Santa Mesa', 'Tondo'],
    
  'Quezon City': ['Alicia', 'Bagong Lipunan ng Crame', 'Bahay Toro', 'Balingasa', 'Balong Bato', 
    'Batasan Hills', 'Bayanihan', 'Blue Ridge A', 'Blue Ridge B', 'Botocan', 'Bungad', 'Camp Aguinaldo', 
    'Central', 'Commonwealth', 'Culiat', 'Damar', 'Damayan', 'Del Monte', 'Dioquino Zobel', 'Don Manuel', 
    'Doña Imelda', 'Doña Josefa', 'Duyan-Duyan', 'E. Rodriguez', 'East Kamias', 'Escopa I', 'Escopa II', 
    'Escopa III', 'Escopa IV', 'Fairview', 'Greater Lagro', 'Gulod', 'Holy Spirit', 'Horseshoe', 'Immaculate Concepcion', 
    'Kaligayahan', 'Kalusugan', 'Kamuning', 'Katipunan', 'Kaunlaran', 'Kristong Hari', 'Krus na Ligas', 'Laging Handa', 
    'Libis', 'Lourdes', 'Loyola Heights', 'Maharlika', 'Malaya', 'Mangga', 'Manresa', 'Mariana', 'Mariblo', 'Marilag'],
    
  'Makati': ['Bangkal', 'Bel-Air', 'Carmona', 'Cembo', 'Comembo', 'Dasmariñas', 'East Rembo', 'Forbes Park', 
    'Guadalupe Nuevo', 'Guadalupe Viejo', 'Kasilawan', 'La Paz', 'Magallanes', 'Olympia', 'Palanan', 'Pembo', 
    'Pinagkaisahan', 'Pio del Pilar', 'Pitogo', 'Poblacion', 'Post Proper Northside', 'Post Proper Southside', 
    'Rizal', 'San Antonio', 'San Isidro', 'San Lorenzo', 'Santa Cruz', 'Singkamas', 'South Cembo', 'Tejeros'],
    
  // Nueva Ecija municipalities
  'Cabanatuan': ['Aduas Centro', 'Aduas Norte', 'Aduas Sur', 'Bacal I', 'Bacal II', 'Balite', 'Bagong Bayan', 
    'Bagong Sikat', 'Bantug', 'Bantug Bulalo', 'Bantug Norte', 'Barlis', 'Barrera', 'Bernardo', 'Bonifacio', 
    'Buliran', 'Calawagan', 'Cabu', 'Cabo', 'Caudillo', 'Concepcion', 'Daang Sarile', 'Dionisio', 'Fatima', 
    'Galvan', 'H. Concepcion', 'Hermogenes', 'Homestead I', 'Homestead II', 'Imelda', 'Isla', 'Lagare'],
    
  'Palayan': ['Atate', 'Cabu', 'Ganaderia', 'Imelda Valley', 'Langka', 'Malate', 'Manga', 'Militar', 'Padre Crisostomo', 
    'Poblacion', 'Sapang Buho', 'Singalat'],
    
  'San Jose': ['Abar 1st', 'Abar 2nd', 'Andal Alino', 'Bagong Sikat', 'Palestina', 'Pinili', 'Porais', 'Santo Niño 1st', 
    'Santo Niño 2nd', 'Santo Tomas', 'Villa Joson'],
    
  'Gapan': ['Bayanihan', 'Bulak', 'Bungo', 'Kapalangan', 'Malasin', 'Malimba', 'Mangino', 'Mapalad', 'Marelo', 
    'Pambuan', 'San Lorenzo', 'San Nicolas', 'San Roque', 'San Vicente', 'Santo Cristo', 'Santo Niño'],
    
  'Science City of Muñoz': ['Balante', 'Bagong Sikat', 'Bantug', 'Calabalabaan', 'Catalanacan', 'Cawayan', 'Curva', 
    'Franza', 'Gabaldon', 'Labney', 'Licaong', 'Linglingay', 'Maligaya', 'Mangandingay', 'Mapangpang', 'Maragol', 
    'Matingkis', 'Palusapis', 'Poblacion Central', 'Poblacion East', 'Poblacion North', 'Poblacion South', 'Poblacion West', 
    'Rang-ayan', 'Rizal', 'San Andres', 'Villa Isla', 'Villa Santos'],
    
  'Zaragoza': ['Batitang', 'Burgos', 'Del Pilar', 'General Luna', 'H. Romero', 'Macabaklay', 'Mayamot', 'San Isidro', 
    'Santa Lucia', 'Santo Rosario', 'Valeriana'],
    
  'Talavera': ['Andal Alino', 'Bagong Sikat', 'Bakal I', 'Bakal II', 'Bantug', 'Bugtong na Buli', 'Burnay', 'Cabawag', 
    'Caaniplahan', 'Calipahan', 'Campos', 'Collado', 'Dimasalang', 'Esguerra', 'Homestead I', 'Homestead II', 
    'Kinalanguyan', 'La Torre', 'Maestrang Kikay'],
    
  'Bongabon': ['Ariendo', 'Bantug', 'Calaanan', 'Curva', 'Digmala', 'Labi', 'Larcon', 'Libsong', 'Lusok', 'Macabaclay', 
    'Olivete', 'Pesa', 'Poblacion', 'Rizal', 'San Isidro', 'San Juan', 'San Roque', 'Sampalucan', 'Santor', 'Sibot', 
    'Tugatog', 'Tulay na Bato'],
    
  // Pangasinan municipalities
  'Dagupan': ['Bacayao Norte', 'Bacayao Sur', 'Balogo', 'Bolosan', 'Bonuan Binloc', 'Bonuan Boquig', 'Bonuan Gueset', 
    'Calmay', 'Carael', 'Caranglaan', 'Herrero', 'Lasip Chico', 'Lasip Grande', 'Lomboy', 'Lucao', 'Malued', 'Mamalingling', 
    'Mangin', 'Mayombo', 'Pantal', 'Poblacion Oeste', 'Pogo Chico', 'Pogo Grande', 'Pugaro Suit', 'Salapingao', 'Salisay', 
    'Tambac', 'Tebeng', 'Tapuac'],
    
  'Lingayen': ['Aliwekwek', 'Baay', 'Balangobong', 'Balococ', 'Bantayan', 'Basing', 'Capandanan', 'Domalandan Center', 
    'Domalandan East', 'Domalandan West', 'Dorongan', 'Dulag', 'Lasip', 'Libsong East', 'Libsong West', 'Malawa', 
    'Malimpuec', 'Maniboc', 'Naguelguel', 'Namolan', 'Pangapisan North', 'Pangapisan Sur', 'Poblacion', 'Quibaol', 
    'Sabangan', 'Talogtog', 'Tumbar', 'Tonton'],
    
  'San Carlos': ['Agdao', 'Anim na Cross', 'Antipangol', 'Bacnar', 'Balite', 'Ballingay', 'Baloy', 'Bantayan', 
    'Bega', 'Bogaoan', 'Bocboc', 'Bugallon-Posadas', 'Buenglat', 'Cacaritan', 'Caingal', 'Calaocan', 'Caoayan-Kiling', 
    'Cavite', 'Cobol', 'Coliling', 'Doyong', 'Gamata', 'Guelew', 'Ilang', 'Inerangan', 'Libas', 'Lilimasan', 
    'Lomboy', 'Longos', 'Lucban', 'Mabalbalino', 'Malacanang', 'Malacañang', 'Maliwara', 'Mamarlao', 'Manzon', 
    'Matagdem', 'Mipaliw', 'Naguilayan', 'Nelintap', 'Padilla-Bugallon', 'Pagal', 'Palospos', 'Parac-Parac', 
    'Payapa', 'Payar', 'PNR Site-Baloling', 'Polo', 'Quezon Boulevard', 'Rizal', 'Salinap', 'San Juan', 
    'San Pedro-Taloy', 'Sapinit', 'Supo', 'Talang', 'Tambac', 'Tandoc', 'Tarece', 'Tarectec', 'Tamayo', 'Turac'],
    
  'Urdaneta': ['Anonas', 'Bactad East', 'Bactad West', 'Bayaoas', 'Camantiles', 'Catablan', 'Cabaruan', 
    'Casantaan', 'Catablan', 'Cayambanan', 'Dilan-Paurido', 'Labit Proper', 'Labit West', 'Mabanogbog', 
    'Macalong', 'Nancalobasaan', 'Nancamaliran East', 'Nancamaliran West', 'Nancayasan', 'Oltama']
  
  // More municipalities can be added here as needed
};

const availableMunicipalities = ref([]);
const availableBarangays = ref([]);

// Load municipalities based on selected province
const loadMunicipalities = () => {
  if (editForm.value.address.province) {
    availableMunicipalities.value = municipalitiesByProvince[editForm.value.address.province] || [];
    editForm.value.address.municipality = ''; // Reset municipality
    editForm.value.address.barangay = ''; // Reset barangay
    availableBarangays.value = []; // Reset barangay list
  } else {
    availableMunicipalities.value = [];
    editForm.value.address.municipality = '';
    editForm.value.address.barangay = '';
    availableBarangays.value = [];
  }
};

// Load barangays based on selected municipality
const loadBarangays = () => {
  if (editForm.value.address.municipality) {
    availableBarangays.value = barangaysByMunicipality[editForm.value.address.municipality] || [];
    editForm.value.address.barangay = ''; // Reset barangay
  } else {
    availableBarangays.value = [];
    editForm.value.address.barangay = '';
  }
};

// Add customAddress reactive object
const customAddress = reactive({
  province: false,
  municipality: false,
  barangay: false
});

onMounted(async () => {
  // Initialize available sections and majors with default values
  setYearBasedOptions('');
  
  // Fetch classes and students
  await fetchClasses();
  
  // Trigger auto-assign of students to classes first
  try {
    console.log('Auto-assigning students to classes on page load');
    await studentService.assignClassesToStudents();
  } catch (error) {
    console.error('Failed to auto-assign students to classes:', error);
    // Continue loading students even if assignment fails
  }
  
  // Then fetch students with updated class assignments
  fetchStudents();
});

function handleSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFiltersAndPagination()
  }, 300)
}

async function fetchClasses() {
  try {
    const response = await classService.getAll()
    classes.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch classes:', error)
    notificationService.error('Failed to load classes. Please try again.')
    classes.value = []
  }
}

async function fetchStudents() {
  try {
    loading.value = true;
    console.log('Fetching students with status: active');
    
    const response = await studentService.getAll({status: 'active'});
    console.log('Student data received:', response);
    
    if (Array.isArray(response)) {
      allStudents.value = response;
      console.log(`Loaded ${response.length} students successfully`);
      
      // Check if there are unassigned students and notify
      const unassignedCount = response.filter(
        student => !student.class || student.class === "" || student.class === null
      ).length;
      
      if (unassignedCount > 0) {
        console.warn(`Found ${unassignedCount} students with missing class assignments`);
        notificationService.showWarning(`${unassignedCount} students need class assignment. Use the "Reassign Unassigned Students" button.`);
      }
    } else {
      console.error('Unexpected response format:', response);
      allStudents.value = [];
      notificationService.error('Received invalid data format from server');
    }
    
    // Apply filters and pagination
    applyFiltersAndPagination();
  } catch (error) {
    console.error('Failed to fetch students:', error);
    notificationService.error('Failed to load students. Please try again.');
    allStudents.value = [];
    students.value = [];
  } finally {
    loading.value = false;
  }
}

function applyFiltersAndPagination() {
  // Filter students based on selection
  const filtered = filterStudents(allStudents.value)
  
  // Calculate pagination
  const page = pagination.value.currentPage
  const perPage = pagination.value.itemsPerPage
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  
  // Ensure current page isn't out of bounds
  if (page > totalPages) {
    pagination.value.currentPage = totalPages
  }
  
  const from = total === 0 ? 0 : (pagination.value.currentPage - 1) * perPage + 1
  const to = Math.min(pagination.value.currentPage * perPage, total)
  
  // Update pagination state
  pagination.value = {
    ...pagination.value,
    total,
    from,
    to,
    totalPages
  }
  
  // Get current page data
  students.value = filtered.slice(from - 1, to)
}

function filterStudents(studentsData) {
  return studentsData.filter(student => {
    // Skip any null or invalid student objects
    if (!student) return false;
    
    // Get class information, checking all possible sources
    let yearLevel, section, major;
    
    // Handle different ways class info can be stored
    if (student.class) {
      // Handle both populated class objects and class IDs
      const classObj = typeof student.class === 'object' ? student.class : 
                     classes.value.find(c => c._id === student.class);
      
      if (classObj) {
        yearLevel = classObj.yearLevel;
        section = classObj.section;
        major = classObj.major;
      }
    } else if (student.classInfo) {
      // For pending registrations with classInfo
      yearLevel = student.classInfo.yearLevel;
      section = student.classInfo.section;
      major = student.classInfo.major || student.major;
    } else if (student.classDetails) {
      // For students with classDetails
      yearLevel = student.classDetails.yearLevel;
      section = student.classDetails.section;
      major = student.classDetails.major || student.major;
    }
    
    // Filter by year level
    if (filters.yearLevel && yearLevel) {
      // Handle year level with or without suffix (2 vs 2nd)
      const normalizedYearLevel = yearLevel.toString().replace(/[^0-9]/g, '');
      const filterYearLevel = filters.yearLevel.toString();
      
      if (normalizedYearLevel !== filterYearLevel) {
        return false;
      }
    }
    
    // Filter by section
    if (filters.section && section) {
      // Normalize section format for comparison
      const normalizedSection = section.replace(/\s*-\s*/g, '-');
      const normalizedFilterSection = filters.section.replace(/\s*-\s*/g, '-');
      
      if (normalizedSection !== normalizedFilterSection) {
        return false;
      }
    }
    
    // Filter by major
    if (filters.major && major) {
      if (major !== filters.major) {
        return false;
      }
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const fullName = `${student.user?.firstName || ''} ${student.user?.middleName || ''} ${student.user?.lastName || ''}`.toLowerCase();
      const idNumber = student.user?.idNumber?.toLowerCase() || '';
      const email = student.user?.email?.toLowerCase() || '';
      
      if (!fullName.includes(searchTerm) && !idNumber.includes(searchTerm) && !email.includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });
}

function changePage(page) {
  pagination.value.currentPage = page
  applyFiltersAndPagination()
}

function getInitials(student) {
  if (!student || !student.user) return '--';
  
  const firstName = student.user.firstName || '';
  const lastName = student.user.lastName || '';
  
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

function getClassName(classData, student) {
  // Handle different ways class info can be stored
  if (!classData) {
    // Try getting from classInfo object (for pending registrations)
    if (student?.classInfo) {
      return formatClassInfo(student.classInfo);
    }
    // Try getting from classDetails
    if (student?.classDetails) {
      return formatClassInfo(student.classDetails);
    }
    return 'Not Assigned';
  }
  
  // Handle both when classData is an ID or when it's already the class object
  const classItem = typeof classData === 'object' ? classData : 
                   classes.value.find(c => c._id === classData);
                   
  if (!classItem) return 'Unknown Class';
  
  return formatClassInfo(classItem);
}

// Helper function to format class info consistently
function formatClassInfo(classInfo) {
  if (!classInfo) return 'Not Assigned';
  
  let displayText = '';
  
  if (classInfo.yearLevel) {
    // Normalize yearLevel to add suffix if not present
    let yearLevel = classInfo.yearLevel;
    
    // Strip any existing suffix first (2nd → 2, 3rd → 3)
    if (typeof yearLevel === 'string' && 
        (yearLevel.endsWith('nd') || yearLevel.endsWith('rd') || yearLevel.endsWith('th'))) {
      yearLevel = yearLevel.replace(/[^0-9]/g, '');
    }
    
    displayText += yearLevel;
    
    // Add suffix to year level
    if (yearLevel === '1' || yearLevel === 1) displayText += 'st';
    else if (yearLevel === '2' || yearLevel === 2) displayText += 'nd';
    else if (yearLevel === '3' || yearLevel === 3) displayText += 'rd';
    else displayText += 'th';
    
    displayText += ' Year';
  }
  
  if (classInfo.section) {
    displayText += ` - ${classInfo.section}`;
  }
  
  if (classInfo.major) {
    displayText += ` (${classInfo.major})`;
  }
  
  return displayText || 'Not Assigned';
}

function openImportModal() {
  console.log('Open import students modal')
  // To be implemented
}

function viewStudent(student) {
  console.log('View student', student);
  currentStudent.value = student;
  showViewModal.value = true;
}

function editStudent(student) {
  console.log('Edit student', student);
  currentStudent.value = student;
  
  // Reset custom address flags
  customAddress.province = false;
  customAddress.municipality = false;
  customAddress.barangay = false;
  
  // Initialize form data
  if (student && student.user) {
    // Create a structured address object if it doesn't exist
    let addressObj = student.address || {};
    if (typeof addressObj === 'string') {
      // If address is still a string, convert to an empty object
      addressObj = {
        block: '',
        street: '',
        barangay: '',
        municipality: '',
        province: ''
      };
    }
    
    editForm.value = {
      firstName: student.user.firstName || '',
      middleName: student.user.middleName || '',
      lastName: student.user.lastName || '',
      nameExtension: student.user.nameExtension || '',
      email: student.user.email || '',
      idNumber: student.user.idNumber || '',
      contactNumber: student.contactNumber || '',
      address: {
        block: addressObj.block || '',
        street: addressObj.street || '',
        barangay: addressObj.barangay || '',
        municipality: addressObj.municipality || '',
        province: addressObj.province || ''
      },
      gender: student.gender || '',
      major: student.major || '',
      yearLevel: student.yearLevel || '',
      section: student.section || ''
    };
    
    // Check if province exists in the predefined list
    if (editForm.value.address.province) {
      if (provinces.includes(editForm.value.address.province)) {
        availableMunicipalities.value = municipalitiesByProvince[editForm.value.address.province] || [];
        
        // Check if municipality exists in the predefined list
        if (editForm.value.address.municipality && availableMunicipalities.value.includes(editForm.value.address.municipality)) {
          availableBarangays.value = barangaysByMunicipality[editForm.value.address.municipality] || [];
          
          // Check if barangay is custom
          if (editForm.value.address.barangay && !availableBarangays.value.includes(editForm.value.address.barangay)) {
            customAddress.barangay = true;
          }
        } else if (editForm.value.address.municipality) {
          // Custom municipality
          customAddress.municipality = true;
          customAddress.barangay = Boolean(editForm.value.address.barangay);
        }
      } else {
        // Custom province
        customAddress.province = true;
        customAddress.municipality = Boolean(editForm.value.address.municipality);
        customAddress.barangay = Boolean(editForm.value.address.barangay);
      }
    }
  }
  
  showEditModal.value = true;
}

async function updateStudent() {
  try {
    if (!currentStudent.value) return;
    
    console.log('Updating student with data:', editForm.value);
    
    const studentData = {
      firstName: editForm.value.firstName,
      middleName: editForm.value.middleName,
      lastName: editForm.value.lastName,
      nameExtension: editForm.value.nameExtension,
      email: editForm.value.email,
      idNumber: editForm.value.idNumber,
      contactNumber: editForm.value.contactNumber,
      address: editForm.value.address,
      gender: editForm.value.gender,
      major: editForm.value.major,
      yearLevel: editForm.value.yearLevel,
      section: editForm.value.section
    };
    
    const response = await studentService.update(currentStudent.value._id, studentData);
    
    if (response) {
      notificationService.showSuccess('Student updated successfully');
      showEditModal.value = false;
      
      // Refresh student list
      await fetchStudents();
    }
  } catch (error) {
    console.error('Error updating student:', error);
    notificationService.showError('Failed to update student: ' + error.message);
  }
}

// Set the year-based options for sections and majors
function setYearBasedOptions(yearLevel) {
  // Set available sections based on year level
  if (yearLevel === '2') {
    availableSections.value = ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'];
    availableMajors.value = ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'];
  } else if (yearLevel === '3') {
    availableSections.value = ['South-1', 'South-2', 'South-3'];
    availableMajors.value = ['Business Informatics', 'System Development'];
  } else if (yearLevel === '4') {
    availableSections.value = ['South-1', 'South-2'];
    availableMajors.value = ['Business Informatics', 'System Development'];
  } else {
    // Default/empty selection - show all options
    availableSections.value = ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'];
    availableMajors.value = ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'];
  }
}

// Handle year level change
function onYearLevelChange() {
  // Update available sections and majors based on year level
  setYearBasedOptions(filters.yearLevel);
  
  // Reset section and major if they're no longer valid for the selected year
  if (!availableSections.value.includes(filters.section)) {
    filters.section = '';
  }
  
  if (!availableMajors.value.includes(filters.major)) {
    filters.major = '';
  }
  
  applyFiltersAndPagination();
}

async function assignAllStudentsToClasses() {
  assigningClasses.value = true
  try {
    console.log('Cleaning and assigning all students to classes...')
    
    // Use the enhanced method that cleans invalid references and does a force reassign
    const response = await studentService.cleanAndAssignClasses(true)
    console.log('Cleanup and assignment response:', response)
    
    if (!response || !response.success) {
      const errorMsg = response?.message || 'Unknown error occurred';
      console.error('Assignment API returned error:', errorMsg);
      notificationService.showError(`Failed to assign students: ${errorMsg}`);
      return;
    }
    
    const fixedCount = response.fixResult?.results?.fixed || 0;
    const assignedCount = response.assignResult?.assigned || 0;
    
    // Show detailed success message
    notificationService.showSuccess(
      `Fixed ${fixedCount} invalid class references and assigned ${assignedCount} students to classes`
    );
    
    // Refresh the student list
    await refreshStudents()
  } catch (error) {
    console.error('Error assigning students to classes:', error)
    notificationService.showError(`Error assigning students: ${error.message || 'Unknown error'}`)
  } finally {
    assigningClasses.value = false
  }
}

async function refreshStudents() {
  await fetchStudents()
}

async function reassignUnassignedStudents() {
  try {
    assigningClasses.value = true; // Set loading state
    console.log('Cleaning and reassigning students with missing class assignments...');
    
    // Use the enhanced method that cleans invalid references and then assigns
    const response = await studentService.cleanAndAssignClasses(true);
    
    if (!response || !response.success) {
      // Handle API error
      const errorMsg = response?.message || 'Unknown error occurred';
      console.error('Assignment API returned error:', errorMsg);
      notificationService.showError(`Failed to reassign students: ${errorMsg}`);
      assigningClasses.value = false;
      return;
    }
    
    const fixedCount = response.fixResult?.results?.fixed || 0;
    const assignedCount = response.assignResult?.assigned || 0;
    
    // Show detailed success message
    notificationService.showSuccess(
      `Fixed ${fixedCount} invalid class references and assigned ${assignedCount} students to classes`
    );
    
    // Refresh the student list to show updated assignments
    await fetchStudents();
  } catch (error) {
    console.error('Failed to reassign unassigned students:', error);
    notificationService.showError(`Failed to reassign students: ${error.message || 'Unknown error'}`);
  } finally {
    assigningClasses.value = false;
  }
}

// Add methods for handling custom address fields
const resetCustomProvince = () => {
  customAddress.province = false;
  editForm.value.address.province = '';
  editForm.value.address.municipality = '';
  editForm.value.address.barangay = '';
  availableMunicipalities.value = [];
  availableBarangays.value = [];
};

const resetCustomMunicipality = () => {
  customAddress.municipality = false;
  editForm.value.address.municipality = '';
  editForm.value.address.barangay = '';
  
  // If a province is selected, load municipalities based on that province
  if (editForm.value.address.province) {
    loadMunicipalities();
  } else {
    availableMunicipalities.value = [];
  }
  
  availableBarangays.value = [];
};

const resetCustomBarangay = () => {
  customAddress.barangay = false;
  editForm.value.address.barangay = '';
  
  // If a municipality is selected, load barangays based on that municipality
  if (editForm.value.address.municipality) {
    loadBarangays();
  } else {
    availableBarangays.value = [];
  }
};
</script> 