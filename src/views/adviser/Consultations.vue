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
            <h1 class="text-2xl font-bold text-gray-900">My Consultation Schedule</h1>
            <p class="text-gray-600">View your consultation schedules and manage student bookings</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600">Loading your consultation schedule...</span>
      </div>
    </div>

    <!-- Calendar View -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
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
            >
              <!-- Consultation blocks for this time slot -->
              <div
                v-for="consultation in getConsultationsForSlot(dayIndex, hour)"
                :key="consultation._id"
                class="bg-blue-100 border border-blue-300 rounded p-2 mb-1 cursor-pointer hover:bg-blue-200 transition-colors"
                @click="viewConsultation(consultation)"
              >
                <div class="text-xs font-medium text-blue-800">
                  Consultation Available
                </div>
                <div class="text-xs text-blue-600">
                  {{ formatTimeRange(consultation.startTime, consultation.endTime) }}
                </div>
                <div class="text-xs text-gray-600">
                  Booked: {{ consultation.bookedStudents || 0 }} / {{ consultation.maxStudents }}
                </div>
                <div class="text-xs" :class="getStatusColorClass(consultation.status)">
                  {{ consultation.status }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="consultations.length === 0" class="p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Consultation Schedules</h3>
        <p class="text-gray-600">Contact your administrator to set up consultation schedules</p>
      </div>
    </div>
    
    <!-- Consultation Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closeDetailsModal">
      <div class="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Consultation Details</h3>
          <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="selectedConsultation" class="space-y-6">
          <!-- Consultation Info -->
          <div class="grid grid-cols-2 gap-4">
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
              <label class="block text-sm font-medium text-gray-700">Capacity</label>
              <p class="text-sm text-gray-900">{{ selectedConsultation.bookedStudents || 0 }} / {{ selectedConsultation.maxStudents }}</p>
            </div>
          </div>
          
          <div v-if="selectedConsultation.notes">
            <label class="block text-sm font-medium text-gray-700">Notes</label>
            <p class="text-sm text-gray-900 bg-gray-50 p-2 rounded">{{ selectedConsultation.notes }}</p>
          </div>
          
          <!-- Booked Students -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-3">Booked Students ({{ activeBookings.length }})</h4>
            
            <div v-if="activeBookings.length === 0" class="text-center py-4 text-gray-500">
              No students have booked this consultation yet
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="booking in activeBookings" 
                :key="booking._id"
                class="border rounded-lg p-4 bg-gray-50"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2">
                      <h5 class="font-medium text-gray-900">
                        {{ booking.student.user.firstName }} {{ booking.student.user.lastName }}
                      </h5>
                      <span :class="getBookingStatusClass(booking.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ booking.status }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600">{{ booking.student.user.email }}</p>
                    <p class="text-sm text-gray-600">ID: {{ booking.student.user.idNumber }}</p>
                    
                    <!-- Concern -->
                    <div class="mt-2">
                      <span class="text-xs font-medium text-gray-700">Concern:</span>
                      <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full ml-1">
                        {{ booking.concern }}
                      </span>
                    </div>
                    
                    <!-- Notes -->
                    <div v-if="booking.notes" class="mt-2">
                      <span class="text-xs font-medium text-gray-700">Notes:</span>
                      <p class="text-xs text-gray-600 mt-1">{{ booking.notes }}</p>
                    </div>
                    
                    <p class="text-xs text-gray-500 mt-2">
                      Booked on {{ formatDateTime(booking.bookedAt) }}
                    </p>
                  </div>
                  
                  <!-- Actions -->
                  <div class="flex space-x-2 ml-4">
                    <button
                      v-if="booking.status === 'Pending'"
                      @click="updateBookingStatus(booking._id, 'Confirmed')"
                      class="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Confirm
                    </button>
                    <button
                      v-if="booking.status === 'Confirmed'"
                      @click="updateBookingStatus(booking._id, 'Completed')"
                      class="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Mark Complete
                    </button>
                  </div>
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
import { ref, computed, onMounted } from 'vue'
import { notificationService } from '../../services/notificationService'
import { useAuthStore } from '../../stores/authStore'
import api from '../../services/api'

const authStore = useAuthStore()

// Reactive data
const loading = ref(false)
const consultations = ref([])
const showDetailsModal = ref(false)
const selectedConsultation = ref(null)

// Week days (Monday to Friday)
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Time slots (7 AM to 5 PM)
const timeSlots = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

// Computed
const activeBookings = computed(() => {
  if (!selectedConsultation.value) return []
  return selectedConsultation.value.bookings.filter(booking => 
    booking.status === 'Pending' || booking.status === 'Confirmed'
  )
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

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString()
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

const getStatusColorClass = (status) => {
  switch (status) {
    case 'Active':
      return 'text-green-600'
    case 'Inactive':
      return 'text-red-600'
    case 'Full':
      return 'text-yellow-600'
    default:
      return 'text-gray-600'
  }
}

const getBookingStatusClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'Confirmed':
      return 'bg-green-100 text-green-800'
    case 'Completed':
      return 'bg-blue-100 text-blue-800'
    case 'Cancelled':
      return 'bg-red-100 text-red-800'
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

const viewConsultation = (consultation) => {
  selectedConsultation.value = consultation
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedConsultation.value = null
}

const updateBookingStatus = async (bookingId, newStatus) => {
  try {
    await api.put(`/consultations/bookings/${bookingId}/status`, {
      status: newStatus
    })
    
    notificationService.showSuccess(`Booking ${newStatus.toLowerCase()} successfully`)
    await loadConsultations()
    
    // Update the selected consultation
    if (selectedConsultation.value) {
      const updatedConsultation = consultations.value.find(c => c._id === selectedConsultation.value._id)
      if (updatedConsultation) {
        selectedConsultation.value = updatedConsultation
      }
    }
  } catch (error) {
    console.error('Error updating booking status:', error)
    const message = error.response?.data?.message || 'Failed to update booking status'
    notificationService.showError(message)
  }
}

const loadConsultations = async () => {
  try {
    loading.value = true
    const response = await api.get(`/consultations/adviser/${authStore.user._id}`)
    consultations.value = response.data || []
  } catch (error) {
    console.error('Error loading consultations:', error)
    notificationService.showError('Failed to load consultation schedule')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadConsultations()
})
</script> 

<style scoped>
.min-h-[80px] {
  min-height: 80px;
}
</style> 