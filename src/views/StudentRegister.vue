<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full space-y-6 bg-white p-8 rounded-md shadow-sm">
      <!-- Header -->
      <div>
        <h2 class="text-center text-2xl font-bold text-gray-800">Student Registration</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Already have an account? 
          <router-link to="/student/login" class="font-medium text-primary hover:text-primary-dark transition-colors duration-200">
            Sign in here
          </router-link>
        </p>
      </div>
      
      <!-- Registration Form -->
      <form class="space-y-6" @submit.prevent="registerStudent">
        <!-- Alert message for errors -->
        <div v-if="error" class="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md">
          {{ error }}
        </div>

        <!-- Registration success message -->
        <div v-if="registrationSuccess" class="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-md">
          <p class="font-medium">Registration Submitted Successfully!</p>
          <p class="text-sm mt-1">Your registration is pending admin approval. You will receive an email notification once your account is approved.</p>
        </div>
        
        <!-- Personal Information -->
        <div>
          <h3 class="text-md font-medium text-gray-700 border-b pb-2 mb-4">Personal Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
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
              <p v-if="errors.firstName" class="mt-1 text-xs text-red-500">{{ errors.firstName }}</p>
            </div>
            
            <div class="md:col-span-1">
              <label for="middleName" class="block text-sm font-medium text-gray-700">Middle Name</label>
              <input 
                v-model="student.middleName" 
                id="middleName" 
                name="middleName" 
                type="text" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
            </div>

            <div class="md:col-span-1">
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
              <p v-if="errors.lastName" class="mt-1 text-xs text-red-500">{{ errors.lastName }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
              <p v-if="errors.idNumber" class="mt-1 text-xs text-red-500">{{ errors.idNumber }}</p>
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
              <p v-if="errors.gender" class="mt-1 text-xs text-red-500">{{ errors.gender }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
              <input 
                v-model="student.email" 
                id="email" 
                name="email" 
                type="email" 
                placeholder="example@phinmaed.com"
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                :class="{'border-red-500': errors.email}"
              >
              <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
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
              <p v-if="errors.contactNumber" class="mt-1 text-xs text-red-500">{{ errors.contactNumber }}</p>
            </div>
          </div>
        </div>

        <!-- Address Information -->
        <div>
          <h3 class="text-md font-medium text-gray-700 border-b pb-2 mb-4">Address Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="addressRegion" class="block text-sm font-medium text-gray-700">Region</label>
              <select 
                id="regionSelect" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                @change="handleRegionChange($event)"
              >
                <option value="">Select Region</option>
                <option v-for="region in regions" :key="region.code" :value="region.code">
                  {{ region.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label for="addressProvince" class="block text-sm font-medium text-gray-700">Province</label>
              <select 
                id="provinceSelect" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                @change="handleProvinceChange($event)"
                :disabled="!selectedRegionCode"
              >
                <option value="">Select Province</option>
                <option v-for="province in provinces" :key="province.code" :value="province.code">
                  {{ province.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label for="addressMunicipality" class="block text-sm font-medium text-gray-700">Municipality/City</label>
              <select 
                id="municipalitySelect" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                @change="handleMunicipalityChange($event)"
                :disabled="!selectedProvinceCode"
              >
                <option value="">Select Municipality/City</option>
                <option v-for="municipality in municipalities" :key="municipality.code" :value="municipality.code">
                  {{ municipality.name }} {{ municipality.cityClass ? '(City)' : '' }}
                </option>
              </select>
            </div>
            
            <div>
              <label for="addressBarangay" class="block text-sm font-medium text-gray-700">Barangay</label>
              <select 
                id="barangaySelect" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                @change="handleBarangayChange($event)"
                :disabled="!selectedMunicipalityCode"
              >
                <option value="">Select Barangay</option>
                <option v-for="barangay in barangays" :key="barangay.code" :value="barangay.code">
                  {{ barangay.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label for="addressStreet" class="block text-sm font-medium text-gray-700">Street/Purok</label>
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
              <label for="addressBlock" class="block text-sm font-medium text-gray-700">Block/Building/Unit</label>
              <input 
                v-model="student.address.block" 
                id="addressBlock" 
                name="addressBlock" 
                type="text" 
                placeholder="Block, Building, Unit"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
            </div>
          </div>
        </div>
          
        <!-- Academic Information -->
        <div>
          <h3 class="text-md font-medium text-gray-700 border-b pb-2 mb-4">Academic Information</h3>
        
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <p v-if="errors.yearLevel" class="mt-1 text-xs text-red-500">{{ errors.yearLevel }}</p>
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
              <p v-if="errors.section" class="mt-1 text-xs text-red-500">{{ errors.section }}</p>
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
              <p v-if="errors.major" class="mt-1 text-xs text-red-500">{{ errors.major }}</p>
            </div>
          </div>
        </div>
        
        <!-- Password -->
        <div>
          <h3 class="text-md font-medium text-gray-700 border-b pb-2 mb-4">Account Security</h3>
        
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
              <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
              <p class="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.
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
              <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-500">{{ errors.confirmPassword }}</p>
            </div>
          </div>
        </div>
        
        <div>
          <button 
            type="submit" 
            class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
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
import psgcService from '../services/psgcService';
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
    province: '',
    region: ''
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

// PSGC address data
const regions = ref([]);
const provinces = ref([]);
const municipalities = ref([]);
const barangays = ref([]);

// Selected location codes for API calls
const selectedRegionCode = ref('');
const selectedProvinceCode = ref('');
const selectedMunicipalityCode = ref('');
const isCitySelected = ref(false);

// Handle custom address entries
const customAddress = reactive({
  region: false,
  province: false,
  municipality: false,
  barangay: false
});

// Load regions from PSGC API
const loadRegions = async () => {
  try {
    loading.value = true;
    const data = await psgcService.getRegions();
    regions.value = data.sort((a, b) => a.name.localeCompare(b.name));
    loading.value = false;
  } catch (err) {
    console.error('Error loading regions:', err);
    loading.value = false;
  }
};

// Load provinces when region is selected
const loadProvinces = async () => {
  if (!selectedRegionCode.value) return;
  
  try {
    loading.value = true;
    const data = await psgcService.getProvincesByRegion(selectedRegionCode.value);
    provinces.value = data.sort((a, b) => a.name.localeCompare(b.name));
    // Reset lower level selections
    selectedProvinceCode.value = '';
    student.address.province = '';
    student.address.municipality = '';
    student.address.barangay = '';
    municipalities.value = [];
    barangays.value = [];
    loading.value = false;
  } catch (err) {
    console.error('Error loading provinces:', err);
    loading.value = false;
  }
};

// Load municipalities when province is selected
const loadMunicipalities = async () => {
  if (!selectedProvinceCode.value) return;
  
  try {
    loading.value = true;
    const data = await psgcService.getMunicipalitiesByProvince(selectedProvinceCode.value);
    municipalities.value = data.sort((a, b) => a.name.localeCompare(b.name));
    // Reset lower level selections
    student.address.municipality = '';
    student.address.barangay = '';
    barangays.value = [];
    loading.value = false;
  } catch (err) {
    console.error('Error loading municipalities:', err);
    loading.value = false;
  }
};

// Load barangays when municipality/city is selected
const loadBarangays = async () => {
  if (!selectedMunicipalityCode.value) return;
  
  try {
    loading.value = true;
    let data;
    if (isCitySelected.value) {
      data = await psgcService.getBarangaysByCity(selectedMunicipalityCode.value);
    } else {
      data = await psgcService.getBarangaysByMunicipality(selectedMunicipalityCode.value);
    }
    barangays.value = data.sort((a, b) => a.name.localeCompare(b.name));
    student.address.barangay = '';
    loading.value = false;
  } catch (err) {
    console.error('Error loading barangays:', err);
    loading.value = false;
  }
};

// Handle region selection
const handleRegionChange = (event) => {
  const regionCode = event.target.value;
  const selectedRegion = regions.value.find(r => r.code === regionCode);
  if (selectedRegion) {
    selectedRegionCode.value = regionCode;
    student.address.region = selectedRegion.name;
    loadProvinces();
  } else {
    student.address.region = '';
    selectedRegionCode.value = '';
    provinces.value = [];
  }
};

// Handle province selection
const handleProvinceChange = (event) => {
  const provinceCode = event.target.value;
  const selectedProvince = provinces.value.find(p => p.code === provinceCode);
  if (selectedProvince) {
    selectedProvinceCode.value = provinceCode;
    student.address.province = selectedProvince.name;
    loadMunicipalities();
  } else {
    student.address.province = '';
    selectedProvinceCode.value = '';
    municipalities.value = [];
  }
};

// Handle municipality/city selection
const handleMunicipalityChange = async (event) => {
  const municipalityCode = event.target.value;
  const selectedMunicipality = municipalities.value.find(m => m.code === municipalityCode);
  
  if (selectedMunicipality) {
    selectedMunicipalityCode.value = municipalityCode;
    student.address.municipality = selectedMunicipality.name;
    isCitySelected.value = selectedMunicipality.cityClass !== undefined;
    
    try {
      await loadBarangays();
      
      // If we got no barangays even after successful call, show a message
      if (barangays.value.length === 0) {
        console.log(`No barangays found for ${selectedMunicipality.name}`);
        // You can set an informational message here if needed
        // error.value = `No barangays found for ${selectedMunicipality.name}. You can proceed with registration.`;
      }
    } catch (err) {
      console.error(`Failed to load barangays for ${selectedMunicipality.name}:`, err);
      // Clear barangays array to prevent UI confusion
      barangays.value = [];
    }
  } else {
    student.address.municipality = '';
    selectedMunicipalityCode.value = '';
    barangays.value = [];
    student.address.barangay = '';
  }
};

// Handle barangay selection
const handleBarangayChange = (event) => {
  const barangayCode = event.target.value;
  const selectedBarangay = barangays.value.find(b => b.code === barangayCode);
  if (selectedBarangay) {
    student.address.barangay = selectedBarangay.name;
  } else {
    student.address.barangay = '';
  }
};

// Reset custom address fields
const resetCustomRegion = () => {
  customAddress.region = false;
  student.address.region = '';
  selectedRegionCode.value = '';
};

const resetCustomProvince = () => {
  customAddress.province = false;
  student.address.province = '';
  selectedProvinceCode.value = '';
};

const resetCustomMunicipality = () => {
  customAddress.municipality = false;
  student.address.municipality = '';
  selectedMunicipalityCode.value = '';
};

const resetCustomBarangay = () => {
  customAddress.barangay = false;
  student.address.barangay = '';
};

// All possible majors
const allMajors = ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'];

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

// Initialize PSGC dropdowns
onMounted(async () => {
  try {
    await loadRegions();
  } catch (err) {
    console.error('Failed to load initial PSGC data:', err);
  }
});

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
  } else if (!/^\d{2}-\d{4}-\d{6}$/.test(student.idNumber)) {
    errors.idNumber = 'ID number must be in XX-XXXX-XXXXXX format';
    isValid = false;
  }
  
  // Validate email
  if (!student.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/.+@.+\..+/.test(student.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  } else if (!student.email.endsWith('phinmaed.com')) {
    errors.email = 'Please use your PHINMA Education email';
    isValid = false;
  }
  
  // Validate gender
  if (!student.gender) {
    errors.gender = 'Please select your gender';
    isValid = false;
  }
  
  // Validate contact number
  if (!student.contactNumber.trim()) {
    errors.contactNumber = 'Contact number is required';
    isValid = false;
  } else if (!/^9\d{9}$/.test(student.contactNumber)) {
    errors.contactNumber = 'Contact number must start with 9 and be 10 digits long';
    isValid = false;
  }
  
  // Validate year level
  if (!student.yearLevel) {
    errors.yearLevel = 'Please select your year level';
    isValid = false;
  }
  
  // Validate section
  if (!student.section) {
    errors.section = 'Please select your section';
    isValid = false;
  }
  
  // Validate major
  if (!student.major) {
    errors.major = 'Please select your major';
    isValid = false;
  }
  
  // Validate password
  if (!student.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (student.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
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
  loading.value = true;
  error.value = '';
  registrationSuccess.value = false;
  
  // Validate form
  if (!validateForm()) {
    loading.value = false;
    return;
  }
  
  try {
    // Create student registration object
    const studentData = {
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      nameExtension: student.nameExtension,
      idNumber: student.idNumber,
      email: student.email,
      gender: student.gender,
      contactNumber: student.contactNumber,
      address: student.address,
      yearLevel: student.yearLevel,
      section: student.section,
      password: student.password,
      major: student.major
    };
    
    // Send registration request
    const response = await api.post('/students/register', studentData);
    
    if (response.status === 201) {
      // Registration successful
      registrationSuccess.value = true;
      
      // Reset form
      Object.keys(student).forEach(key => {
        if (typeof student[key] === 'object' && student[key] !== null) {
          Object.keys(student[key]).forEach(subKey => {
            student[key][subKey] = '';
          });
        } else {
          student[key] = '';
        }
      });
      
      // Clear errors
      Object.keys(errors).forEach(key => {
        errors[key] = '';
      });
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    }
  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    } else {
      error.value = 'An error occurred during registration. Please try again.';
    }
    
    // Scroll to top to show error message
    window.scrollTo(0, 0);
  } finally {
    loading.value = false;
  }
}
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
.focus\:ring-primary:focus {
  --tw-ring-color: #3B82F6;
}
.focus\:border-primary:focus {
  border-color: #3B82F6;
}
.hover\:bg-primary-dark:hover {
  background-color: #2563EB;
}
</style> 