<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="bg-blue-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Consultation Management</h1>
            <p class="text-gray-600">Manage consultation schedules for advisers and students</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- View Toggle -->
          <div class="bg-gray-100 p-1 rounded-lg">
            <button
              @click="currentView = 'calendar'"
              :class="[
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                currentView === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              Calendar View
            </button>
            <button
              @click="currentView = 'list'"
              :class="[
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                currentView === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              List View
            </button>
          </div>
          
          <button
            @click="showAddModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Consultation Schedule
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600">Loading consultations...</span>
      </div>
    </div>

    <!-- Calendar View -->
    <div v-else-if="currentView === 'calendar'" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <!-- Calendar Header -->
      <div class="bg-gray-50 px-6 py-4 border-b">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Weekly Schedule</h3>
          <div class="text-sm text-gray-600">
            Monday - Friday | 7:00 AM - 5:00 PM
          </div>
        </div>
      </div>
      
      <!-- Calendar Grid -->
      <div class="overflow-x-auto">
        <div class="min-w-[800px]">
          <!-- Days Header -->
          <div class="grid grid-cols-6 border-b">
            <div class="p-4 text-center font-medium text-gray-700 bg-gray-50">Time</div>
            <div v-for="day in weekDays" :key="day" class="p-4 text-center font-medium text-gray-700 bg-gray-50 border-l">
              {{ day }}
            </div>
          </div>
          
          <!-- Time Slots -->
          <div v-for="hour in timeSlots" :key="hour" class="grid grid-cols-6 border-b hover:bg-gray-50">
            <!-- Time Column -->
            <div class="p-4 text-center text-sm text-gray-600 bg-gray-50 border-r">
              {{ formatTime(hour) }}
            </div>
            
            <!-- Day Columns -->
            <div 
              v-for="(day, dayIndex) in weekDays" 
              :key="`${day}-${hour}`"
              class="p-2 border-l min-h-[80px] relative"
              @click="selectTimeSlot(dayIndex, hour)"
            >
              <!-- Consultation blocks for this time slot -->
              <div
                v-for="consultation in getConsultationsForSlot(dayIndex, hour)"
                :key="consultation._id"
                class="bg-blue-100 border border-blue-300 rounded p-2 mb-1 cursor-pointer hover:bg-blue-200 transition-colors"
                @click.stop="viewConsultation(consultation)"
              >
                <div class="text-xs font-medium text-blue-800">
                  {{ consultation.adviser.firstName }} {{ consultation.adviser.lastName }}
                </div>
                <div class="text-xs text-blue-600">
                  {{ formatTimeRange(consultation.startTime, consultation.endTime) }}
                </div>
                <div class="text-xs text-gray-600">
                  Available: {{ consultation.maxStudents - (consultation.bookedStudents || 0) }}
                </div>
              </div>
              
              <!-- Add button for empty slots -->
              <div 
                v-if="getConsultationsForSlot(dayIndex, hour).length === 0"
                class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                @click="openAddModalForSlot(dayIndex, hour)"
              >
                <div class="bg-gray-200 hover:bg-gray-300 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="bg-white rounded-lg shadow-sm">
      <div class="px-6 py-4 border-b">
        <h3 class="text-lg font-medium text-gray-900">Consultation Schedules</h3>
      </div>
      
      <div v-if="consultations.length === 0" class="p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Consultation Schedules</h3>
        <p class="text-gray-600">Get started by adding a consultation schedule</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adviser
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bookings
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="consultation in consultations" :key="consultation._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">
                        {{ getAdviserInitials(consultation.adviser) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ consultation.adviser.firstName }} {{ consultation.adviser.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">{{ consultation.adviser.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ weekDays[consultation.dayOfWeek] }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatTimeRange(consultation.startTime, consultation.endTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ consultation.duration }} hours
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(consultation.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ consultation.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ consultation.bookedStudents || 0 }} / {{ consultation.maxStudents }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button
                  @click="viewConsultation(consultation)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  View
                </button>
                <button
                  @click="editConsultation(consultation)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Edit
                </button>
                <button
                  @click="deleteConsultation(consultation)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Consultation Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closeAddModal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ editingConsultation ? 'Edit Consultation Schedule' : 'Add Consultation Schedule' }}
          </h3>
          <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveConsultation" class="space-y-4">
          <!-- Adviser Selection -->
          <div>
            <label for="adviser" class="block text-sm font-medium text-gray-700 mb-1">
              Select Adviser
            </label>
            <select
              id="adviser"
              v-model="consultationForm.adviserId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose an adviser</option>
              <option v-for="adviser in advisers" :key="adviser._id" :value="adviser._id">
                {{ adviser.firstName }} {{ adviser.lastName }}
              </option>
            </select>
          </div>
          
          <!-- Day Selection -->
          <div>
            <label for="day" class="block text-sm font-medium text-gray-700 mb-1">
              Day of Week
            </label>
            <select
              id="day"
              v-model="consultationForm.dayOfWeek"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a day</option>
              <option v-for="(day, index) in weekDays" :key="index" :value="index">
                {{ day }}
              </option>
            </select>
          </div>
          
          <!-- Start Time -->
          <div>
            <label for="startTime" class="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <select
              id="startTime"
              v-model="consultationForm.startTime"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose start time</option>
              <option v-for="hour in timeSlots" :key="hour" :value="hour">
                {{ formatTime(hour) }}
              </option>
            </select>
          </div>
          
          <!-- Duration (Fixed at 3 hours) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <div class="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
              3 hours (Fixed)
            </div>
          </div>
          
          <!-- Max Students -->
          <div>
            <label for="maxStudents" class="block text-sm font-medium text-gray-700 mb-1">
              Maximum Students
            </label>
            <input
              id="maxStudents"
              type="number"
              v-model="consultationForm.maxStudents"
              min="1"
              max="10"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <!-- Notes -->
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              v-model="consultationForm.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional notes..."
            ></textarea>
          </div>
          
          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeAddModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : (editingConsultation ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Consultation Modal -->
    <div v-if="showViewModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closeViewModal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Consultation Details</h3>
          <button @click="closeViewModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="selectedConsultation" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Adviser</label>
              <p class="text-sm text-gray-900">{{ selectedConsultation.adviser.firstName }} {{ selectedConsultation.adviser.lastName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Day</label>
              <p class="text-sm text-gray-900">{{ weekDays[selectedConsultation.dayOfWeek] }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Time</label>
              <p class="text-sm text-gray-900">{{ formatTimeRange(selectedConsultation.startTime, selectedConsultation.endTime) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Duration</label>
              <p class="text-sm text-gray-900">{{ selectedConsultation.duration }} hours</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <span :class="getStatusClass(selectedConsultation.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                {{ selectedConsultation.status }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Bookings</label>
              <p class="text-sm text-gray-900">{{ selectedConsultation.bookedStudents || 0 }} / {{ selectedConsultation.maxStudents }}</p>
            </div>
          </div>
          
          <div v-if="selectedConsultation.notes">
            <label class="block text-sm font-medium text-gray-700">Notes</label>
            <p class="text-sm text-gray-900 bg-gray-50 p-2 rounded">{{ selectedConsultation.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { notificationService } from '../../services/notificationService'
import api from '../../services/api'

// Reactive data
const loading = ref(false)
const saving = ref(false)
const currentView = ref('calendar')
const consultations = ref([])
const advisers = ref([])
const showAddModal = ref(false)
const showViewModal = ref(false)
const editingConsultation = ref(null)
const selectedConsultation = ref(null)

// Week days (Monday to Friday)
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Time slots (7 AM to 5 PM)
const timeSlots = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

// Form data
const consultationForm = ref({
  adviserId: '',
  dayOfWeek: '',
  startTime: '',
  duration: 3,
  maxStudents: 5,
  notes: ''
})

// Methods
const formatTime = (hour) => {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${ampm}`
}

const formatTimeRange = (startHour, endHour) => {
  return `${formatTime(startHour)} - ${formatTime(endHour)}`
}

const getAdviserInitials = (adviser) => {
  return `${adviser.firstName.charAt(0)}${adviser.lastName.charAt(0)}`
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Inactive':
      return 'bg-red-100 text-red-800'
    case 'Full':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getConsultationsForSlot = (dayIndex, hour) => {
  return consultations.value.filter(consultation => {
    return consultation.dayOfWeek === dayIndex && 
           consultation.startTime <= hour && 
           consultation.endTime > hour
  })
}

const selectTimeSlot = (dayIndex, hour) => {
  // Logic for selecting time slot
}

const openAddModalForSlot = (dayIndex, hour) => {
  consultationForm.value.dayOfWeek = dayIndex
  consultationForm.value.startTime = hour
  showAddModal.value = true
}

const viewConsultation = (consultation) => {
  selectedConsultation.value = consultation
  showViewModal.value = true
}

const editConsultation = (consultation) => {
  editingConsultation.value = consultation
  consultationForm.value = {
    adviserId: consultation.adviser._id,
    dayOfWeek: consultation.dayOfWeek,
    startTime: consultation.startTime,
    duration: consultation.duration,
    maxStudents: consultation.maxStudents,
    notes: consultation.notes || ''
  }
  showAddModal.value = true
}

const deleteConsultation = async (consultation) => {
  if (!confirm('Are you sure you want to delete this consultation schedule?')) return
  
  try {
    await api.delete(`/consultations/${consultation._id}`)
    await loadConsultations()
    notificationService.showSuccess('Consultation schedule deleted successfully')
  } catch (error) {
    console.error('Error deleting consultation:', error)
    notificationService.showError('Failed to delete consultation schedule')
  }
}

const saveConsultation = async () => {
  if (!validateForm()) return
  
  try {
    saving.value = true
    
    const consultationData = {
      ...consultationForm.value,
      endTime: consultationForm.value.startTime + consultationForm.value.duration,
      status: 'Active'
    }
    
    if (editingConsultation.value) {
      await api.put(`/consultations/${editingConsultation.value._id}`, consultationData)
      notificationService.showSuccess('Consultation schedule updated successfully')
    } else {
      await api.post('/consultations', consultationData)
      notificationService.showSuccess('Consultation schedule created successfully')
    }
    
    await loadConsultations()
    closeAddModal()
  } catch (error) {
    console.error('Error saving consultation:', error)
    notificationService.showError('Failed to save consultation schedule')
  } finally {
    saving.value = false
  }
}

const validateForm = () => {
  const form = consultationForm.value
  
  if (!form.adviserId || form.dayOfWeek === '' || form.startTime === '' || !form.maxStudents) {
    notificationService.showError('Please fill in all required fields')
    return false
  }
  
  // Check if end time exceeds business hours
  const endTime = parseInt(form.startTime) + parseInt(form.duration)
  if (endTime > 18) {
    notificationService.showError('Consultation would extend beyond business hours (6 PM)')
    return false
  }
  
  return true
}

const closeAddModal = () => {
  showAddModal.value = false
  editingConsultation.value = null
  consultationForm.value = {
    adviserId: '',
    dayOfWeek: '',
    startTime: '',
    duration: 3,
    maxStudents: 5,
    notes: ''
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedConsultation.value = null
}

const loadConsultations = async () => {
  try {
    loading.value = true
    const response = await api.get('/consultations')
    consultations.value = response.data || []
  } catch (error) {
    console.error('Error loading consultations:', error)
    notificationService.showError('Failed to load consultations')
  } finally {
    loading.value = false
  }
}

const loadAdvisers = async () => {
  try {
    const response = await api.get('/advisers')
    advisers.value = response.data || []
  } catch (error) {
    console.error('Error loading advisers:', error)
    notificationService.showError('Failed to load advisers')
  }
}

// Lifecycle
onMounted(() => {
  loadConsultations()
  loadAdvisers()
})
</script>

<style scoped>
.min-h-[80px] {
  min-height: 80px;
}
</style> 