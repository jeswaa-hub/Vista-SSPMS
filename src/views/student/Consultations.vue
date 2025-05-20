<template>
  <div>
    <div class="mb-6">
      <h2 class="text-lg font-semibold mb-2">Consultations</h2>
      <p class="text-gray-600">Schedule consultations with your teachers.</p>
    </div>
    
    <!-- Button to show consultation form -->
    <div v-if="!showForm" class="flex justify-start mb-6">
      <button 
        @click="showForm = true"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Schedule New Consultation
      </button>
    </div>
    
    <!-- Consultation Form Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-[500px] w-full relative">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Schedule New Consultation</h3>
          <button @click="showForm = false" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      
      <form @submit.prevent="scheduleConsultation">
        <div class="space-y-4">
          <!-- Consultation Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Title/Purpose of Consultation</label>
            <input 
              id="title"
              v-model="consultation.title"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="e.g., Academic Guidance, Course Selection Help"
              required
            />
          </div>
          
          <!-- Teacher Selection -->
          <div>
            <label for="teacher" class="block text-sm font-medium text-gray-700">Select Teacher</label>
            <select 
              id="teacher"
              v-model="consultation.teacherId"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              required
            >
              <option value="" disabled>Choose a teacher</option>
              <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.name }} ({{ teacher.department }})
              </option>
            </select>
          </div>
          
          <!-- Date Selection -->
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700">Consultation Date</label>
            <input 
              id="date"
              v-model="consultation.date"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              :min="minDate"
              required
            />
          </div>
          
          <!-- Time Slot Selection -->
          <div>
            <label for="timeSlot" class="block text-sm font-medium text-gray-700">Time Slot</label>
            <select 
              id="timeSlot"
              v-model="consultation.timeSlot"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              required
            >
              <option value="" disabled>Select a time slot</option>
              <option v-for="slot in timeSlots" :key="slot.value" :value="slot.value">
                {{ slot.label }}
              </option>
            </select>
          </div>
          
          <!-- Additional Notes -->
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
            <textarea 
              id="notes"
              v-model="consultation.notes"
              rows="3"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Please provide any additional details about your consultation needs"
            ></textarea>
          </div>
        </div>
        
        <!-- Submit Button -->
        <div class="mt-6 flex justify-end space-x-3">
          <button 
            type="button"
            @click="showForm = false"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Scheduling...</span>
            <span v-else>Schedule Consultation</span>
          </button>
                  </div>
        </form>
      </div>
    </div>
    
    <!-- List of Scheduled Consultations -->
    <div v-if="scheduledConsultations.length > 0" class="bg-white rounded-lg shadow-sm p-6">
      <h3 class="text-md font-medium mb-4">Your Scheduled Consultations</h3>
      
      <div class="divide-y divide-gray-200">
        <div v-for="(item, index) in scheduledConsultations" :key="index" class="py-4">
          <div class="flex items-center">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
              Scheduled
            </span>
            <h4 class="text-lg font-medium text-gray-900">{{ item.title }}</h4>
          </div>
          
          <div class="mt-2 text-sm text-gray-500">
            <p><span class="font-medium">Teacher:</span> {{ getTeacherName(item.teacherId) }}</p>
            <p><span class="font-medium">Date:</span> {{ formatDate(item.date) }}</p>
            <p><span class="font-medium">Time:</span> {{ item.timeSlot }}</p>
            <p v-if="item.notes"><span class="font-medium">Notes:</span> {{ item.notes }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Success Message (when shown) -->
    <div v-if="showSuccess" class="fixed inset-x-0 top-4 flex justify-center z-50">
      <div class="bg-green-50 border-l-4 border-green-400 p-4 w-full max-w-md shadow-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">
              Your consultation has been scheduled successfully!
            </p>
          </div>
          <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
              <button @click="showSuccess = false" class="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <span class="sr-only">Dismiss</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// UI states
const showForm = ref(false);
const isSubmitting = ref(false);
const showSuccess = ref(false);

// Form data
const consultation = ref({
  title: '',
  teacherId: '',
  date: '',
  timeSlot: '',
  notes: ''
});

// Scheduled consultations list
const scheduledConsultations = ref([]);

// Min date for date picker (today)
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

// Available time slots (excluding 11:00, 12:00, 1:00)
const timeSlots = [
  { value: '7:00-8:00', label: '7:00 AM - 8:00 AM' },
  { value: '8:00-9:00', label: '8:00 AM - 9:00 AM' },
  { value: '9:00-10:00', label: '9:00 AM - 10:00 AM' },
  { value: '10:00-11:00', label: '10:00 AM - 11:00 AM' },
  { value: '2:00-3:00', label: '2:00 PM - 3:00 PM' },
  { value: '3:00-4:00', label: '3:00 PM - 4:00 PM' },
];

// Mock teachers data
const teachers = [
  { id: 1, name: 'Prof. Sarah Johnson', department: 'Computer Science' },
  { id: 2, name: 'Dr. Michael Chen', department: 'Mathematics' },
  { id: 3, name: 'Dr. Emily Rodriguez', department: 'Engineering' },
  { id: 4, name: 'Prof. David Kim', department: 'Physics' },
  { id: 5, name: 'Dr. Alicia Martinez', department: 'Biology' }
];

// Function to handle form submission
function scheduleConsultation() {
  isSubmitting.value = true;
  
  // Simulate API call to schedule consultation
  setTimeout(() => {
    // Add to scheduled consultations
    scheduledConsultations.value.push({...consultation.value});
    
    // Reset form
    consultation.value = {
      title: '',
      teacherId: '',
      date: '',
      timeSlot: '',
      notes: ''
    };
    
    // Hide form and show success message
    showForm.value = false;
    showSuccess.value = true;
    isSubmitting.value = false;
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
  }, 1000);
}

// Helper function to get teacher name by ID
function getTeacherName(id) {
  const teacher = teachers.find(t => t.id === id);
  return teacher ? teacher.name : 'Unknown Teacher';
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
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
</style> 