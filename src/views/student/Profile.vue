<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->


      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Information -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
          <div class="flex flex-col items-center text-center mb-6">
            <div class="h-24 w-24 rounded-full bg-primary-light text-primary text-4xl flex items-center justify-center mb-4">
              {{ userInitials }}
            </div>
            <h2 class="text-xl font-bold">{{ studentData.firstName }} {{ studentData.lastName }}</h2>
            <p class="text-gray-600">Student ID: {{ studentData.studentId || 'Not available' }}</p>
            <p class="text-gray-500 mt-1">{{ studentData.email }}</p>
          </div>
          
          <div class="border-t pt-4">
            <h3 class="font-medium text-lg mb-4">Contact Information</h3>
            <div class="space-y-3">
              <div class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p class="text-sm text-gray-500">Phone</p>
                  <p>{{ studentData.phoneNumber || 'Not set' }}</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p class="text-sm text-gray-500">Address</p>
                  <div class="text-sm">
                    <div v-if="studentData.address && (studentData.address.block || studentData.address.street || studentData.address.barangay || studentData.address.municipality || studentData.address.province)">
                      <p v-if="studentData.address.block">{{ studentData.address.block }}</p>
                      <p v-if="studentData.address.street">{{ studentData.address.street }}</p>
                      <p v-if="studentData.address.barangay">{{ studentData.address.barangay }}</p>
                      <p v-if="studentData.address.municipality">{{ studentData.address.municipality }}</p>
                      <p v-if="studentData.address.province">{{ studentData.address.province }}</p>
                    </div>
                    <span v-else>Not provided</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
          <!-- Change Password -->
          <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 mt-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-medium text-lg">Change Password</h3>
            <button 
              @click="editMode.password = !editMode.password" 
              class="text-sm text-primary hover:text-primary-dark focus:outline-none"
            >
              {{ editMode.password ? 'Cancel' : 'Change' }}
            </button>
          </div>
          
          <form @submit.prevent="changePassword" v-if="editMode.password" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input 
                v-model="passwordForm.currentPassword" 
                type="password" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input 
                v-model="passwordForm.newPassword" 
                type="password" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div class="flex justify-end">
              <button 
                type="submit" 
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                :disabled="isUpdating"
              >
                <span v-if="isUpdating" class="flex items-center">
                  <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
                <span v-else>Update Password</span>
              </button>
            </div>
          </form>
          
          <div v-else>
            <p class="text-sm text-gray-500">For security reasons, passwords are not displayed. Click 'Change' to update your password.</p>
          </div>
        </div>
      </div>
      
        <!-- Personal Information Section -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-medium text-lg">Personal Information</h3>
            <button 
              @click="editMode.personal = !editMode.personal" 
              class="text-sm text-primary hover:text-primary-dark focus:outline-none"
            >
              {{ editMode.personal ? 'Cancel' : 'Edit' }}
            </button>
          </div>
          
          <form @submit.prevent="updatePersonalInfo" v-if="editMode.personal">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  v-model="form.firstName" 
                  type="text" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  v-model="form.lastName" 
                  type="text" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  v-model="form.phoneNumber" 
                  type="tel" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              <div class="col-span-1 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  v-model="form.address.block" 
                  type="text" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              <div class="col-span-1 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input 
                  v-model="form.address.street" 
                  type="text" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              <div class="col-span-1 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                <div v-if="!customAddress.barangay">
                  <select 
                    v-model="form.address.barangay" 
                    :disabled="!form.address.municipality && !customAddress.municipality"
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
                      :disabled="!form.address.municipality && !customAddress.municipality"
                    >
                      Barangay not in the list? Click here to enter manually
                    </button>
                  </div>
                </div>
                <div v-else>
                  <input 
                    v-model="form.address.barangay" 
                    type="text" 
                    placeholder="Enter your barangay" 
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
              <div class="col-span-1 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Municipality</label>
                <div v-if="!customAddress.municipality">
                  <select 
                    v-model="form.address.municipality" 
                    :disabled="!form.address.province && !customAddress.province"
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
                      :disabled="!form.address.province && !customAddress.province"
                    >
                      Municipality not in the list? Click here to enter manually
                    </button>
                  </div>
                </div>
                <div v-else>
                  <input 
                    v-model="form.address.municipality" 
                    type="text" 
                    placeholder="Enter your municipality/city" 
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
              <div class="col-span-1 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <div v-if="!customAddress.province">
                  <select 
                    v-model="form.address.province" 
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
                    v-model="form.address.province" 
                    type="text" 
                    placeholder="Enter your province" 
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
            <div class="flex justify-end mt-4">
              <button 
                type="button" 
                @click="editMode.personal = false" 
                class="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                :disabled="isUpdating"
              >
                <span v-if="isUpdating">Updating...</span>
                <span v-else>Save Changes</span>
              </button>
            </div>
          </form>
          
          <div v-else>
            <div class="border rounded-md overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700 w-1/3">First Name</td>
                    <td class="px-4 py-3">{{ studentData.firstName || 'Not set' }}</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700">Last Name</td>
                    <td class="px-4 py-3">{{ studentData.lastName || 'Not set' }}</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700">Email</td>
                    <td class="px-4 py-3">{{ studentData.email || 'Not set' }}</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700">Phone Number</td>
                    <td class="px-4 py-3">{{ studentData.phoneNumber || 'Not set' }}</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700">Registration Date</td>
                    <td class="px-4 py-3">{{ formatDate(studentData.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
          <!-- Academic Information -->
          <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 mb-6">
          <h3 class="font-medium text-lg mb-4">Academic Information</h3>
          
          <div class="border rounded-md overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700 w-1/3">Program</td>
                  <td class="px-4 py-3">{{ studentData.program || 'Not available' }}</td>
                </tr>
                <tr>
                  <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700">Year Level</td>
                  <td class="px-4 py-3">{{ studentData.yearLevel || 'Not available' }}</td>
                </tr>
                <tr>
                  <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700">Section</td>
                  <td class="px-4 py-3">{{ studentData.section || 'Not available' }}</td>
                </tr>
                <tr>
                  <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700">Major</td>
                  <td class="px-4 py-3">{{ studentData.major || 'Not available' }}</td>
                </tr>
                <tr>
                  <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700">Adviser</td>
                  <td class="px-4 py-3">
                    <div v-if="studentData.adviser">
                      <p>{{ studentData.adviser.name }}</p>
                      <p v-if="studentData.adviser.email" class="text-sm text-gray-500">{{ studentData.adviser.email }}</p>
                      <p v-if="studentData.adviser.contactNumber" class="text-sm text-gray-500">{{ studentData.adviser.contactNumber }}</p>
                    </div>
                    <span v-else>Not assigned</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
          <!-- Class and SSP Information -->
          <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 mt-6">
          <h3 class="font-medium text-lg mb-4">Class & SSP Information</h3>
          
          <div v-if="student && student.class">
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 class="font-medium text-gray-800 mb-2">Class Details</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-gray-600">Year Level & Section:</div>
                  <div class="font-medium">{{ student.class.yearLevel }} Year - {{ student.class.section }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-600">Major:</div>
                  <div class="font-medium">{{ student.class.major }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-600">Schedule:</div>
                  <div class="font-medium">{{ student.class.daySchedule }} / {{ student.class.timeSchedule }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-600">Room:</div>
                  <div class="font-medium">{{ student.class.room || 'Not assigned' }}</div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
              <h4 class="font-medium text-gray-800 mb-2">SSP Subject</h4>
              <div v-if="student.class.sspSubject">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="text-sm text-gray-600">Subject Name:</div>
                    <div class="font-medium">{{ student.class.sspSubject.name }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-600">Code:</div>
                    <div class="font-medium">{{ student.class.sspSubject.sspCode }}</div>
                  </div>
                </div>
                <div class="mt-3 flex justify-end">
                  <router-link to="/student/ssp" class="text-primary text-sm hover:underline">
                    View Sessions
                  </router-link>
                </div>
              </div>
              <div v-else class="text-gray-500">
                No SSP subject assigned
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500">
            No class assigned
          </div>
        </div>

          <!-- Student Programs Overview -->
          <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 mt-6">
          <h3 class="font-medium text-lg mb-4">Student Programs</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Odyssey Plan -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="font-medium text-gray-800">Odyssey Plan</h4>
                  <p class="text-sm text-gray-600">Personal development roadmap</p>
                </div>
                <span 
                  :class="[
                    'px-2 py-1 text-xs rounded-full font-medium',
                    studentData.odysseyPlanStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                    studentData.odysseyPlanStatus === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ studentData.odysseyPlanStatus || 'Not Started' }}
                </span>
              </div>
              <div class="mt-3 flex justify-end">
                <router-link to="/student/odyssey-plan" class="text-primary text-sm hover:underline">
                  View Plan
                </router-link>
              </div>
            </div>
            
            <!-- SRM Survey -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="font-medium text-gray-800">SRM Survey</h4>
                  <p class="text-sm text-gray-600">Student Risk Monitoring assessment</p>
                </div>
                <span 
                  :class="[
                    'px-2 py-1 text-xs rounded-full font-medium',
                    studentData.srmSurveyStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                    studentData.srmSurveyStatus === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ studentData.srmSurveyStatus || 'Not Started' }}
                </span>
              </div>
              <div class="mt-3 flex justify-end">
                <router-link to="/student/surveys" class="text-primary text-sm hover:underline">
                  View Survey
                </router-link>
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { notificationService } from '../../services/notificationService';
import { studentService } from '../../services/studentService';

// State
const loading = ref(true);
const isUpdating = ref(false);
const studentData = ref({});
const student = ref(null);
const authStore = useAuthStore();

// Edit mode state
const editMode = reactive({
  personal: false,
  password: false
});

// Form data
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  address: {
    block: '',
    street: '',
    barangay: '',
    municipality: '',
    province: ''
  }
});

// Password form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
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
    'Libis', 'Lourdes', 'Loyola Heights', 'Maharlika', 'Malaya', 'Mangga', 'Manresa', 'Mariana', 'Mariblo', 'Marilag', 
    'Masagana', 'Masambong', 'Matandang Balara', 'Milagrosa', 'N.S. Amoranto', 'Nagkaisang Nayon', 'Nayong Kanluran', 
    'New Era', 'North Fairview', 'Novaliches Proper', 'Obrero', 'Old Capitol Site', 'Paang Bundok', 'Pag-ibig sa Nayon'],
    
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
    'San Pedro-Taloy', 'Sapinit', 'Supo', 'Talang', 'Tambac', 'Tandoc', 'Tarece', 'Tarectec', 'Tamayo', 'Turac']
  
  // More municipalities can be added here as needed
};

const availableMunicipalities = ref([]);
const availableBarangays = ref([]);

// Add customAddress reactive object
const customAddress = reactive({
  province: false,
  municipality: false,
  barangay: false
});

// Load municipalities based on selected province
const loadMunicipalities = () => {
  if (form.address.province) {
    availableMunicipalities.value = municipalitiesByProvince[form.address.province] || [];
    form.address.municipality = ''; // Reset municipality
    form.address.barangay = ''; // Reset barangay
    availableBarangays.value = []; // Reset barangay list
  } else {
    availableMunicipalities.value = [];
    form.address.municipality = '';
    form.address.barangay = '';
    availableBarangays.value = [];
  }
};

// Load barangays based on selected municipality
const loadBarangays = () => {
  if (form.address.municipality) {
    availableBarangays.value = barangaysByMunicipality[form.address.municipality] || [];
    form.address.barangay = ''; // Reset barangay
  } else {
    availableBarangays.value = [];
    form.address.barangay = '';
  }
};

// Computed properties
const userInitials = computed(() => {
  if (!studentData.value) return 'S';
  const firstInitial = studentData.value.firstName ? studentData.value.firstName.charAt(0) : '';
  const lastInitial = studentData.value.lastName ? studentData.value.lastName.charAt(0) : '';
  return (firstInitial + lastInitial).toUpperCase() || 'S';
});

// Load student data
onMounted(async () => {
  try {
    loading.value = true;
    
    // Fetch student data from API
    const response = await studentService.getStudentDetails();
    if (!response || !response.data) {
      throw new Error('Failed to load student data');
    }
    
    // Store the complete student object
    student.value = response.data;
    
    // Format adviser information
    let adviserInfo = null;
    if (student.value.adviserInfo) {
      const adviser = student.value.adviserInfo;
      const middleInitial = adviser.middleName ? ` ${adviser.middleName.charAt(0)}.` : '';
      const nameExt = adviser.nameExtension && adviser.nameExtension !== 'N/A' ? ` ${adviser.nameExtension}` : '';
      
      adviserInfo = {
        name: `${adviser.salutation || ''} ${adviser.firstName || ''}${middleInitial} ${adviser.lastName || ''}${nameExt}`.trim(),
        email: adviser.email || '',
        contactNumber: adviser.contactNumber || ''
      };
    }
    
    // Set up studentData with data from user and class collections
    studentData.value = {
      firstName: student.value.user?.firstName || '',
      lastName: student.value.user?.lastName || '',
      email: student.value.user?.email || '',
      phoneNumber: student.value.contactNumber || '',
      address: student.value.address || { block: '', street: '', barangay: '', municipality: '', province: '' },
      studentId: student.value.user?.idNumber || '',
      createdAt: new Date(student.value.createdAt || Date.now()),
      program: 'Bachelor of Science in Information Technology', // This would need to come from program data
      yearLevel: student.value.class?.yearLevel || student.value.classDetails?.yearLevel || '',
      section: student.value.class?.section || student.value.classDetails?.section || '',
      major: student.value.major || student.value.class?.major || '',
      academicStatus: 'Good Standing', // This would need to come from academic data
      adviser: adviserInfo,
      odysseyPlanStatus: student.value.odysseyPlanCompleted ? 'Completed' : 'Not Started',
      srmSurveyStatus: student.value.srmSurveyCompleted ? 'Completed' : 'Not Started'
    };
    
    // Initialize form with student data
    form.firstName = studentData.value.firstName;
    form.lastName = studentData.value.lastName;
    form.email = studentData.value.email;
    form.phoneNumber = studentData.value.phoneNumber;
    form.address = {
      block: studentData.value.address.block || '',
      street: studentData.value.address.street || '',
      barangay: studentData.value.address.barangay || '',
      municipality: studentData.value.address.municipality || '',
      province: studentData.value.address.province || ''
    };
    
    // Load address dropdowns if province and municipality already exist
    if (form.address.province) {
      // Check if province exists in the predefined list
      if (provinces.includes(form.address.province)) {
        availableMunicipalities.value = municipalitiesByProvince[form.address.province] || [];
        
        // Check if municipality exists in the predefined list
        if (form.address.municipality && availableMunicipalities.value.includes(form.address.municipality)) {
          availableBarangays.value = barangaysByMunicipality[form.address.municipality] || [];
          
          // Check if barangay is custom
          if (form.address.barangay && !availableBarangays.value.includes(form.address.barangay)) {
            customAddress.barangay = true;
          }
        } else if (form.address.municipality) {
          // Custom municipality
          customAddress.municipality = true;
          customAddress.barangay = Boolean(form.address.barangay);
        }
      } else {
        // Custom province
        customAddress.province = true;
        customAddress.municipality = Boolean(form.address.municipality);
        customAddress.barangay = Boolean(form.address.barangay);
      }
    }
  } catch (error) {
    console.error('Error loading student data:', error);
    notificationService.showError('Failed to load profile data: ' + (error.message || 'Unknown error'));
    
    // Clear and initialize empty data instead of using mock data
    studentData.value = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      studentId: '',
      createdAt: new Date(),
      program: '',
      yearLevel: '',
      section: '',
      major: '',
      academicStatus: '',
      adviser: '',
      odysseyPlanStatus: 'Not Started',
      srmSurveyStatus: 'Not Started'
    };
    
    // Reset form fields
    form.firstName = '';
    form.lastName = '';
    form.email = '';
    form.phoneNumber = '';
    form.address = {
      block: '',
      street: '',
      barangay: '',
      municipality: '',
      province: ''
    };
  } finally {
    loading.value = false;
  }
});

// Update personal information
const updatePersonalInfo = async () => {
  try {
    isUpdating.value = true;
    
    // Validate form inputs
    if (!form.firstName || !form.lastName || !form.email) {
      notificationService.showError('First name, last name, and email are required');
      return;
    }

    // Prepare the profile data
    const profileData = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      contactNumber: form.phoneNumber,
      address: form.address
    };

    // Call the update profile API
    const response = await studentService.updateStudentProfile(profileData);
    
    if (response && response.data) {
      // Update the local state with the new data
      studentData.value.firstName = form.firstName;
      studentData.value.lastName = form.lastName;
      studentData.value.email = form.email;
      studentData.value.phoneNumber = form.phoneNumber;
      studentData.value.address = form.address;
      
      // Update auth store if it exists
      if (authStore.user) {
        authStore.user.firstName = form.firstName;
        authStore.user.lastName = form.lastName;
        authStore.user.email = form.email;
      }
      
      notificationService.showSuccess('Personal information updated successfully');
      editMode.personal = false;
    }
  } catch (error) {
    console.error('Error updating personal info:', error);
    notificationService.showError('Failed to update profile: ' + (error.message || 'Unknown error'));
  } finally {
    isUpdating.value = false;
  }
};

// Update password
const changePassword = async () => {
  try {
    isUpdating.value = true;
    
    // Validate password form
    if (!passwordForm.currentPassword) {
      notificationService.showError('Current password is required');
      return;
    }
    
    if (!passwordForm.newPassword) {
      notificationService.showError('New password is required');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notificationService.showError('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      notificationService.showError('New password must be at least 6 characters long');
      return;
    }
    
    // Call the API to change password
    const passwordData = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    };
    
    const response = await studentService.updatePassword(passwordData);
    
    if (response && response.data) {
      notificationService.showSuccess('Password changed successfully');
      editMode.password = false;
      
      // Reset the password form
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
    }
  } catch (error) {
    console.error('Error changing password:', error);
    
    // Check for specific error types
    if (error.response && error.response.status === 401) {
      notificationService.showError('Current password is incorrect');
    } else {
      notificationService.showError('Failed to change password: ' + (error.message || 'Unknown error'));
    }
  } finally {
    isUpdating.value = false;
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Not available';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Add these reset methods
const resetCustomProvince = () => {
  customAddress.province = false;
  form.address.province = '';
  form.address.municipality = '';
  form.address.barangay = '';
  availableMunicipalities.value = [];
  availableBarangays.value = [];
};

const resetCustomMunicipality = () => {
  customAddress.municipality = false;
  form.address.municipality = '';
  form.address.barangay = '';
  
  // If a province is selected, load municipalities based on that province
  if (form.address.province) {
    loadMunicipalities();
  } else {
    availableMunicipalities.value = [];
  }
  
  availableBarangays.value = [];
};

const resetCustomBarangay = () => {
  customAddress.barangay = false;
  form.address.barangay = '';
  
  // If a municipality is selected, load barangays based on that municipality
  if (form.address.municipality) {
    loadBarangays();
  } else {
    availableBarangays.value = [];
  }
};
</script>

<style scoped>
.bg-primary {
  background-color: #3B82F6;
}
.bg-primary-light {
  background-color: #EFF6FF;
}
.text-primary {
  color: #3B82F6;
}
.hover\:bg-primary-dark:hover {
  background-color: #2563EB;
}
</style> 