<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header with Logo -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Student Registration</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Already have an account? 
          <router-link to="/student/login" class="font-medium text-primary hover:text-primary-dark">
            Sign in here
          </router-link>
        </p>
      </div>
      
      <!-- Registration Form -->
      <form class="mt-8 space-y-6" @submit.prevent="registerStudent">
        <!-- Alert message for errors -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {{ error }}
        </div>

        <!-- Registration success message -->
        <div v-if="registrationSuccess" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          <p class="font-medium">Registration Submitted Successfully!</p>
          <p class="text-sm mt-1">Your registration is pending admin approval. You will receive an email notification once your account is approved.</p>
        </div>
        
        <div class="rounded-md shadow-sm space-y-4">
          <!-- Personal Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">First Name *</label>
              <input 
                v-model="student.firstName" 
                id="firstName" 
                name="firstName" 
                type="text" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                :class="{'border-red-500': errors.firstName}"
              >
              <p v-if="errors.firstName" class="mt-1 text-sm text-red-500">{{ errors.firstName }}</p>
            </div>
            
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name *</label>
              <input 
                v-model="student.lastName" 
                id="lastName" 
                name="lastName" 
                type="text" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                :class="{'border-red-500': errors.lastName}"
              >
              <p v-if="errors.lastName" class="mt-1 text-sm text-red-500">{{ errors.lastName }}</p>
            </div>
            
            <div>
              <label for="middleName" class="block text-sm font-medium text-gray-700">Middle Name</label>
              <input 
                v-model="student.middleName" 
                id="middleName" 
                name="middleName" 
                type="text" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
            </div>
            
            <div>
              <label for="nameExtension" class="block text-sm font-medium text-gray-700">Name Extension</label>
              <input 
                v-model="student.nameExtension" 
                id="nameExtension" 
                name="nameExtension" 
                type="text" 
                placeholder="Jr., Sr., III, etc."
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
            </div>
            
            <div>
              <label for="idNumber" class="block text-sm font-medium text-gray-700">ID Number *</label>
              <input 
                v-model="student.idNumber" 
                id="idNumber" 
                name="idNumber" 
                type="text" 
                placeholder="XX-XXXX-XXXXXX"
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                :class="{'border-red-500': errors.idNumber}"
              >
              <p v-if="errors.idNumber" class="mt-1 text-sm text-red-500">{{ errors.idNumber }}</p>
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
              <input 
                v-model="student.email" 
                id="email" 
                name="email" 
                type="email" 
                placeholder="example.au@phinmaed.com"
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                :class="{'border-red-500': errors.email}"
              >
              <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
            </div>
            
            <div>
              <label for="gender" class="block text-sm font-medium text-gray-700">Gender *</label>
              <select 
                v-model="student.gender" 
                id="gender" 
                name="gender" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                :class="{'border-red-500': errors.gender}"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <p v-if="errors.gender" class="mt-1 text-sm text-red-500">{{ errors.gender }}</p>
            </div>
            
            <div class="col-span-1 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Address</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                <div>
                  <label for="addressBlock" class="block text-xs font-medium text-gray-500 mb-1">Block</label>
                  <input 
                    v-model="student.address.block" 
                    id="addressBlock" 
                    name="addressBlock" 
                    type="text" 
                    placeholder="Block, Building, Unit"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                </div>
                <div>
                  <label for="addressStreet" class="block text-xs font-medium text-gray-500 mb-1">Street/Purok</label>
                  <input 
                    v-model="student.address.street" 
                    id="addressStreet" 
                    name="addressStreet" 
                    type="text"
                    placeholder="Street or Purok name"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                </div>
                <div>
                  <label for="addressBarangay" class="block text-xs font-medium text-gray-500 mb-1">Barangay</label>
                  <div v-if="!customAddress.barangay">
                    <select 
                      v-model="student.address.barangay" 
                      id="addressBarangay" 
                      name="addressBarangay"
                      :disabled="(!student.address.municipality && !customAddress.municipality)"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
                        :disabled="(!student.address.municipality && !customAddress.municipality)"
                      >
                        Barangay not in the list? Click here to enter manually
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <input 
                      v-model="student.address.barangay" 
                      type="text" 
                      placeholder="Enter your barangay" 
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
                  <label for="addressMunicipality" class="block text-xs font-medium text-gray-500 mb-1">Municipality</label>
                  <div v-if="!customAddress.municipality">
                    <select 
                      v-model="student.address.municipality" 
                      id="addressMunicipality" 
                      name="addressMunicipality"
                      :disabled="!student.address.province && !customAddress.province"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
                        :disabled="!student.address.province && !customAddress.province"
                      >
                        Municipality not in the list? Click here to enter manually
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <input 
                      v-model="student.address.municipality" 
                      type="text" 
                      placeholder="Enter your municipality/city" 
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
                  <label for="addressProvince" class="block text-xs font-medium text-gray-500 mb-1">Province</label>
                  <div v-if="!customAddress.province">
                    <select 
                      v-model="student.address.province" 
                      id="addressProvince" 
                      name="addressProvince"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
                      v-model="student.address.province" 
                      type="text" 
                      placeholder="Enter your province" 
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
              <label for="contactNumber" class="block text-sm font-medium text-gray-700">Contact Number *</label>
              <div class="flex">
                <span class="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  63+
                </span>
                <input 
                  v-model="student.contactNumber" 
                  id="contactNumber" 
                  name="contactNumber" 
                  type="text" 
                  required 
                  class="mt-0 block w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  :class="{'border-red-500': errors.contactNumber}"
                >
              </div>
              <p v-if="errors.contactNumber" class="mt-1 text-sm text-red-500">{{ errors.contactNumber }}</p>
            </div>
          </div>
          
          <!-- Academic Information -->
          <div class="border-t pt-4 pb-2">
            <h3 class="text-lg font-medium text-gray-900">Academic Information</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="yearLevel" class="block text-sm font-medium text-gray-700">Year Level *</label>
              <select 
                v-model="student.yearLevel" 
                id="yearLevel" 
                name="yearLevel" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                :class="{'border-red-500': errors.yearLevel}"
                @change="loadSections"
              >
                <option value="">Select Year Level</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
              <p v-if="errors.yearLevel" class="mt-1 text-sm text-red-500">{{ errors.yearLevel }}</p>
            </div>
            
            <div>
              <label for="section" class="block text-sm font-medium text-gray-700">SSP Section *</label>
              <select 
                v-model="student.section" 
                id="section" 
                name="section" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                :class="{'border-red-500': errors.section}"
                :disabled="!student.yearLevel"
              >
                <option value="">Select Section</option>
                <option v-for="section in availableSections" :key="section" :value="section">{{ section }}</option>
              </select>
              <p v-if="errors.section" class="mt-1 text-sm text-red-500">{{ errors.section }}</p>
            </div>
            
            <div>
              <label for="major" class="block text-sm font-medium text-gray-700">Major *</label>
              <select 
                v-model="student.major" 
                id="major" 
                name="major" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                :class="{'border-red-500': errors.major}"
                :disabled="!student.yearLevel"
              >
                <option value="">Select Major</option>
                <option v-for="major in availableMajors" :key="major" :value="major">{{ major }}</option>
              </select>
              <p v-if="errors.major" class="mt-1 text-sm text-red-500">{{ errors.major }}</p>
            </div>
          </div>
          
          <!-- Password -->
          <div class="border-t pt-4 pb-2">
            <h3 class="text-lg font-medium text-gray-900">Account Security</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password *</label>
              <input 
                v-model="student.password" 
                id="password" 
                name="password" 
                type="password" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                :class="{'border-red-500': errors.password}"
              >
              <p v-if="errors.password" class="mt-1 text-sm text-red-500">{{ errors.password }}</p>
              <p class="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (!@#$%^&*).
              </p>
            </div>
            
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password *</label>
              <input 
                v-model="student.confirmPassword" 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                :class="{'border-red-500': errors.confirmPassword}"
              >
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-500">{{ errors.confirmPassword }}</p>
            </div>
          </div>
        </div>
        
        <div>
          <button 
            type="submit" 
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span v-if="loading">Processing...</span>
            <span v-else>Register</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { notificationService } from '../services/notificationService';
import api from '../services/api';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const registrationSuccess = ref(false);

// Student form data
const student = reactive({
  firstName: '',
  middleName: '',
  lastName: '',
  nameExtension: '',
  idNumber: '',
  email: '',
  gender: '',
  contactNumber: '',
  address: {
    block: '',
    street: '',
    barangay: '',
    municipality: '',
    province: ''
  },
  yearLevel: '',
  section: '',
  password: '',
  confirmPassword: '',
  major: ''
});

// Form validation errors
const errors = reactive({
  firstName: '',
  lastName: '',
  idNumber: '',
  email: '',
  gender: '',
  contactNumber: '',
  yearLevel: '',
  section: '',
  password: '',
  confirmPassword: '',
  major: ''
});

// Available sections based on selected year level
const availableSections = ref([]);

// Available majors based on selected year level
const availableMajors = ref([]);

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
    'New Era', 'North Fairview', 'Novaliches Proper', 'Obrero', 'Old Capitol Site', 'Paang Bundok', 'Pag-ibig sa Nayon', 
    'Paligsahan', 'Paltok', 'Pansol', 'Paraiso', 'Pasong Putik', 'Pasong Tamo', 'Phil-Am', 'Pinagkaisahan', 'Pinyahan', 
    'Project 6', 'Quirino 2-A', 'Quirino 2-B', 'Quirino 2-C', 'Quirino 3-A', 'Ramon Magsaysay', 'Roxas', 'Sacred Heart', 
    'Saint Ignatius', 'Saint Peter', 'Salvacion', 'San Agustin', 'San Antonio', 'San Bartolome', 'San Isidro Labrador', 
    'San Jose', 'San Martin de Porres', 'San Roque', 'San Vicente', 'Sangandaan', 'Santa Cruz', 'Santa Lucia', 'Santa Monica', 
    'Santa Teresita', 'Santo Cristo', 'Santo Domingo', 'Santo Niño', 'Santol', 'Sauyo', 'Sienna', 'Sikatuna Village', 
    'Silangan', 'Socorro', 'South Triangle', 'Tagumpay', 'Talayan', 'Talipapa', 'Tandang Sora', 'Tatalon', 'Teachers Village East', 
    'Teachers Village West', 'U.P. Campus', 'U.P. Village', 'Ugong Norte', 'Unang Sigaw', 'Valencia', 'Vasra', 'Veterans Village', 
    'Villa Maria Clara', 'West Kamias', 'West Triangle', 'White Plains'],
    
  'Makati': ['Bangkal', 'Bel-Air', 'Carmona', 'Cembo', 'Comembo', 'Dasmariñas', 'East Rembo', 'Forbes Park', 
    'Guadalupe Nuevo', 'Guadalupe Viejo', 'Kasilawan', 'La Paz', 'Magallanes', 'Olympia', 'Palanan', 'Pembo', 
    'Pinagkaisahan', 'Pio del Pilar', 'Pitogo', 'Poblacion', 'Post Proper Northside', 'Post Proper Southside', 
    'Rizal', 'San Antonio', 'San Isidro', 'San Lorenzo', 'Santa Cruz', 'Singkamas', 'South Cembo', 'Tejeros', 
    'Urdaneta', 'Valenzuela', 'West Rembo'],
    
  // Nueva Ecija municipalities
  'Cabanatuan': ['Aduas Centro', 'Aduas Norte', 'Aduas Sur', 'Bacal I', 'Bacal II', 'Balite', 'Bagong Bayan', 
    'Bagong Sikat', 'Bantug', 'Bantug Bulalo', 'Bantug Norte', 'Barlis', 'Barrera', 'Bernardo', 'Bonifacio', 
    'Buliran', 'Calawagan', 'Cabu', 'Cabo', 'Caudillo', 'Concepcion', 'Daang Sarile', 'Dionisio', 'Fatima', 
    'Galvan', 'H. Concepcion', 'Hermogenes', 'Homestead I', 'Homestead II', 'Imelda', 'Isla', 'Lagare', 
    'Macabucod', 'Magsaysay', 'Malasin', 'Maria Theresa', 'Matadero', 'Mayapyap', 'Palagay', 'Pamaldan', 
    'Pangatian', 'Patalac', 'Platero', 'Polilio', 'Pula', 'Rizdelis', 'Samon', 'San Isidro', 'San Josef', 
    'San Juan Accfa', 'San Roque', 'Sangitan', 'Santulan', 'Zulueta'],
    
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

// Load municipalities based on selected province
const loadMunicipalities = () => {
  if (student.address.province) {
    availableMunicipalities.value = municipalitiesByProvince[student.address.province] || [];
    student.address.municipality = ''; // Reset municipality
    student.address.barangay = ''; // Reset barangay
    availableBarangays.value = []; // Reset barangay list
  } else {
    availableMunicipalities.value = [];
    student.address.municipality = '';
    student.address.barangay = '';
    availableBarangays.value = [];
  }
};

// Load barangays based on selected municipality
const loadBarangays = () => {
  if (student.address.municipality) {
    availableBarangays.value = barangaysByMunicipality[student.address.municipality] || [];
    student.address.barangay = ''; // Reset barangay
  } else {
    availableBarangays.value = [];
    student.address.barangay = '';
  }
};

// All possible majors
const allMajors = ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'];

// Initialize empty dropdowns
onMounted(() => {
  // Clear any previous address data
  availableMunicipalities.value = [];
  availableBarangays.value = [];
  
  // If province is already set (rare case but for completeness)
  if (student.address.province) {
    loadMunicipalities();
    
    // If municipality is also set
    if (student.address.municipality) {
      loadBarangays();
    }
  }
});

// Load sections based on selected year level
const loadSections = () => {
  if (student.yearLevel === '2nd') {
    availableSections.value = ['South - 1', 'South - 2', 'South - 3', 'South - 4', 'South - 5'];
    availableMajors.value = [...allMajors]; // All majors available for 2nd year
  } else if (student.yearLevel === '3rd') {
    availableSections.value = ['South - 1', 'South - 2', 'South - 3'];
    availableMajors.value = allMajors.filter(major => 
      major !== 'Digital Arts' && major !== 'Computer Security'
    ); // Filter out Digital Arts and Computer Security for 3rd year
  } else if (student.yearLevel === '4th') {
    availableSections.value = ['South - 1', 'South - 2'];
    availableMajors.value = allMajors.filter(major => 
      major !== 'Digital Arts' && major !== 'Computer Security'
    ); // Filter out Digital Arts and Computer Security for 4th year
  } else {
    availableSections.value = [];
    availableMajors.value = [];
  }
  student.section = ''; // Reset section when year level changes
  student.major = ''; // Reset major when year level changes
};

// Validate form data
function validateForm() {
  let isValid = true;
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  
  // Validate first name
  if (!student.firstName.trim()) {
    errors.firstName = 'First name is required';
    isValid = false;
  }
  
  // Validate last name
  if (!student.lastName.trim()) {
    errors.lastName = 'Last name is required';
    isValid = false;
  }
  
  // Validate ID number
  if (!student.idNumber.trim()) {
    errors.idNumber = 'ID number is required';
    isValid = false;
  }
  
  // Validate email
  if (!student.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    errors.email = 'Please enter a valid email';
    isValid = false;
  }
  
  // Validate gender
  if (!student.gender) {
    errors.gender = 'Please select a gender';
    isValid = false;
  }
  
  // Validate contact number
  if (!student.contactNumber.trim()) {
    errors.contactNumber = 'Contact number is required';
    isValid = false;
  } else if (!/^\d{10}$/.test(student.contactNumber)) {
    errors.contactNumber = 'Please enter a valid 10-digit contact number without country code';
    isValid = false;
  }
  
  // Validate year level
  if (!student.yearLevel) {
    errors.yearLevel = 'Please select a year level';
    isValid = false;
  }
  
  // Validate section
  if (!student.section) {
    errors.section = 'Please select a section';
    isValid = false;
  }
  
  // Validate major
  if (!student.major) {
    errors.major = 'Please select a major';
    isValid = false;
  }
  
  // Validate password
  if (!student.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (student.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    isValid = false;
  } else if (!/[A-Z]/.test(student.password)) {
    errors.password = 'Password must contain at least one uppercase letter';
    isValid = false;
  } else if (!/[a-z]/.test(student.password)) {
    errors.password = 'Password must contain at least one lowercase letter';
    isValid = false;
  } else if (!/[0-9]/.test(student.password)) {
    errors.password = 'Password must contain at least one number';
    isValid = false;
  } else if (!/[!@#$%^&*]/.test(student.password)) {
    errors.password = 'Password must contain at least one special character (!@#$%^&*)';
    isValid = false;
  }
  
  // Validate confirm password
  if (!student.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (student.password !== student.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
    isValid = false;
  }
  
  return isValid;
}

// Register student
async function registerStudent() {
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    // Prepare data for API
    const studentData = {
      firstName: student.firstName,
      lastName: student.lastName,
      middleName: student.middleName || '',
      nameExtension: student.nameExtension || '',
      idNumber: student.idNumber,
      email: student.email,
      gender: student.gender,
      address: student.address,
      contactNumber: `63${student.contactNumber}`,
      yearLevel: student.yearLevel,
      section: student.section,
      major: student.major,
      password: student.password
    };
    
    // Call the API endpoint
    const response = await api.post('/auth/register-student', studentData);
    
    // Show success message
    registrationSuccess.value = true;
    
    // Reset form
    Object.keys(student).forEach(key => {
      if (key === 'address') {
        student.address = {
          block: '',
          street: '',
          barangay: '',
          municipality: '',
          province: ''
        };
      } else {
        student[key] = '';
      }
    });
    
    // Redirect to login page after a delay
    setTimeout(() => {
      router.push('/student/login');
    }, 3000);
    
  } catch (err) {
    console.error('Registration error:', err);
    error.value = err.response?.data?.message || err.message || 'An error occurred during registration. Please try again.';
  } finally {
    loading.value = false;
  }
}

// Add the customAddress reactive object below other state variables
const customAddress = reactive({
  province: false,
  municipality: false,
  barangay: false
});

// Add these additional methods below the loadBarangays method
const resetCustomProvince = () => {
  customAddress.province = false;
  student.address.province = '';
  student.address.municipality = '';
  student.address.barangay = '';
  availableMunicipalities.value = [];
  availableBarangays.value = [];
};

const resetCustomMunicipality = () => {
  customAddress.municipality = false;
  student.address.municipality = '';
  student.address.barangay = '';
  
  // If a province is selected, load municipalities based on that province
  if (student.address.province) {
    loadMunicipalities();
  } else {
    availableMunicipalities.value = [];
  }
  
  availableBarangays.value = [];
};

const resetCustomBarangay = () => {
  customAddress.barangay = false;
  student.address.barangay = '';
  
  // If a municipality is selected, load barangays based on that municipality
  if (student.address.municipality) {
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
.bg-primary-dark {
  background-color: #2563EB;
}
.text-primary {
  color: #3B82F6;
}
</style> 