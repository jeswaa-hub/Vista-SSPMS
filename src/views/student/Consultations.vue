<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="bg-green-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
  <div>
            <h1 class="text-2xl font-bold text-gray-900">Available Consultations</h1>
            <p class="text-gray-600">Book consultations with advisers for academic guidance and support</p>
          </div>
        </div>
      </div>
      
      <!-- Important Notice -->
      <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">
              One Active Consultation Policy
            </h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>You can only have one active consultation booking at a time. Please complete or cancel your current booking before booking with another adviser.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading available consultations...</span>
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
      
        <!-- Legend -->
        <div class="mt-3 flex flex-wrap items-center gap-4 text-xs">
          <div class="flex items-center">
            <div class="w-3 h-3 bg-green-100 border border-green-300 rounded mr-1"></div>
            <span class="text-gray-600">Available</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-1"></div>
            <span class="text-gray-600">Already Booked</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 bg-orange-100 border border-orange-300 rounded mr-1"></div>
            <span class="text-gray-600">Time Conflict</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-1"></div>
            <span class="text-gray-600">Not Available</span>
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
                class="border rounded p-2 mb-1 cursor-pointer transition-colors"
                :class="getConsultationCardClass(consultation)"
                @click="selectConsultation(consultation)"
              >
                <div class="text-xs font-medium">
                  {{ consultation.adviser.firstName }} {{ consultation.adviser.lastName }}
                </div>
                <div class="text-xs">
                  {{ formatTimeRange(consultation.startTime, consultation.endTime) }}
                </div>
                <div class="text-xs text-gray-600">
                  Available: {{ consultation.maxStudents - (consultation.bookedStudents || 0) }}
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
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Consultations Available</h3>
        <p class="text-gray-600">No consultation schedules are currently available</p>
      </div>
    </div>
    
    <!-- My Bookings -->
    <div v-if="myBookings.length > 0" class="bg-white rounded-lg shadow-sm p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">My Booked Consultations</h3>
      
      <div class="space-y-3">
        <div 
          v-for="booking in myBookings" 
          :key="booking._id"
          class="border rounded-lg p-4 bg-gray-50"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <h5 class="font-medium text-gray-900">
                  {{ booking.consultation.adviser.firstName }} {{ booking.consultation.adviser.lastName }}
                </h5>
                <span :class="getBookingStatusClass(booking.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ booking.status }}
                </span>
              </div>
              
              <div class="mt-1 text-sm text-gray-600">
                <p>{{ weekDays[booking.consultation.dayOfWeek] }} | {{ formatTimeRange(booking.consultation.startTime, booking.consultation.endTime) }}</p>
              </div>
              
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
                v-if="booking.status === 'Pending' || booking.status === 'Confirmed'"
                @click="cancelBooking(booking._id)"
                class="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Booking Modal -->
    <div v-if="showBookingModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closeBookingModal">
      <div class="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Book Consultation</h3>
          <button @click="closeBookingModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          </div>
        
        <div v-if="selectedConsultation" class="space-y-4">
          <!-- Consultation Info -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900">
              {{ selectedConsultation.adviser.firstName }} {{ selectedConsultation.adviser.lastName }}
            </h4>
            <p class="text-sm text-gray-600">
              {{ weekDays[selectedConsultation.dayOfWeek] }} | {{ formatTimeRange(selectedConsultation.startTime, selectedConsultation.endTime) }}
            </p>
            <p class="text-sm text-gray-600">
              Duration: {{ selectedConsultation.duration }} hours
            </p>
            <p class="text-sm text-gray-600">
              Available slots: {{ selectedConsultation.maxStudents - (selectedConsultation.bookedStudents || 0) }}
            </p>
          </div>
          
          <!-- Booking Form -->
          <form @submit.prevent="bookConsultation" class="space-y-4">
            <!-- Concern Selection -->
            <div>
              <label for="concern" class="block text-sm font-medium text-gray-700 mb-1">
                What is your consultation concern? *
              </label>
              <select
                id="concern"
                v-model="bookingForm.concern"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Please select your concern</option>
                <option v-for="concern in consultationConcerns" :key="concern" :value="concern">
                  {{ concern }}
                </option>
              </select>
            </div>
            
            <!-- Additional Notes -->
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                v-model="bookingForm.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Please provide any additional details about your consultation needs..."
              ></textarea>
            </div>
            
            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeBookingModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="booking || !bookingForm.concern"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {{ booking ? 'Booking...' : 'Book Consultation' }}
              </button>
            </div>
          </form>
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
const booking = ref(false)
const consultations = ref([])
const myBookings = ref([])
const showBookingModal = ref(false)
const selectedConsultation = ref(null)

// Week days (Monday to Friday)
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Time slots (7 AM to 5 PM)
const timeSlots = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

// Consultation concerns
const consultationConcerns = [
  'Academic Performance and Grades',
  'Career Planning and Future Goals',
  'Time Management and Workload',
  'Financial Concerns',
  'Mental Health and Personal Well-being',
  'Other'
]

// Booking form
const bookingForm = ref({
  concern: '',
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

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const getConsultationCardClass = (consultation) => {
  const availableSlots = consultation.maxStudents - (consultation.bookedStudents || 0)
  
  // Check if student already has this specific consultation booked
  const hasBooking = myBookings.value.find(booking => 
    booking.consultation._id === consultation._id &&
    (booking.status === 'Pending' || booking.status === 'Confirmed')
  )
  
  if (hasBooking) {
    return 'bg-blue-100 border-blue-300 text-blue-800 cursor-default'
  }
  
  // Check for time conflicts
  const hasConflict = myBookings.value.find(booking => {
    if (booking.status === 'Cancelled' || booking.consultation._id === consultation._id) return false
    
    const bookingDay = booking.consultation.dayOfWeek
    const bookingStart = booking.consultation.startTime
    const bookingEnd = booking.consultation.endTime
    
    const consultationDay = consultation.dayOfWeek
    const consultationStart = consultation.startTime
    const consultationEnd = consultation.endTime
    
    return bookingDay === consultationDay && (
      (consultationStart >= bookingStart && consultationStart < bookingEnd) ||
      (consultationEnd > bookingStart && consultationEnd <= bookingEnd) ||
      (consultationStart <= bookingStart && consultationEnd >= bookingEnd)
    )
  })
  
  if (hasConflict) {
    return 'bg-orange-100 border-orange-300 text-orange-800 cursor-not-allowed'
  }
  
  if (consultation.status !== 'Active' || availableSlots <= 0) {
    return 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
  }
  
  return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
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

const selectConsultation = (consultation) => {
  const availableSlots = consultation.maxStudents - (consultation.bookedStudents || 0)
  
  // Check if student already has this specific consultation booked
  const hasBooking = myBookings.value.find(booking => 
    booking.consultation._id === consultation._id &&
    (booking.status === 'Pending' || booking.status === 'Confirmed')
  )
  
  if (hasBooking) {
    notificationService.showInfo('You already have this consultation booked. Check "My Bookings" to manage it.')
    return
  }
  
  if (consultation.status !== 'Active' || availableSlots <= 0) {
    notificationService.showError('This consultation is not available for booking')
    return
  }
  
  // Check for time conflicts with other bookings
  const conflictingBooking = myBookings.value.find(booking => {
    if (booking.status === 'Cancelled' || booking.consultation._id === consultation._id) return false
    
    const bookingDay = booking.consultation.dayOfWeek
    const bookingStart = booking.consultation.startTime
    const bookingEnd = booking.consultation.endTime
    
    const consultationDay = consultation.dayOfWeek
    const consultationStart = consultation.startTime
    const consultationEnd = consultation.endTime
    
    // Check if it's the same day and times overlap
    return bookingDay === consultationDay && (
      (consultationStart >= bookingStart && consultationStart < bookingEnd) ||
      (consultationEnd > bookingStart && consultationEnd <= bookingEnd) ||
      (consultationStart <= bookingStart && consultationEnd >= bookingEnd)
    )
  })
  
  if (conflictingBooking) {
    const conflictAdviser = conflictingBooking.consultation.adviser
    notificationService.showError(
      `You have a conflicting consultation with ${conflictAdviser.firstName} ${conflictAdviser.lastName} at the same time slot`
    )
    return
  }
  
  selectedConsultation.value = consultation
  showBookingModal.value = true
}

const closeBookingModal = () => {
  showBookingModal.value = false
  selectedConsultation.value = null
  bookingForm.value = {
    concern: '',
      notes: ''
  }
}

const bookConsultation = async () => {
  if (!bookingForm.value.concern) {
    notificationService.showError('Please select your consultation concern')
    return
  }
  
  try {
    booking.value = true
    
    await api.post(`/consultations/${selectedConsultation.value._id}/book`, {
      concern: bookingForm.value.concern,
      notes: bookingForm.value.notes
    })
    
    notificationService.showSuccess('Consultation booked successfully!')
    closeBookingModal()
    await loadData()
  } catch (error) {
    console.error('Booking error:', error)
    const message = error.response?.data?.message || 'Failed to book consultation'
    notificationService.showError(message)
  } finally {
    booking.value = false
  }
}

const cancelBooking = async (bookingId) => {
  if (!confirm('Are you sure you want to cancel this booking?')) return
  
  try {
    // Find the consultation and booking
    const booking = myBookings.value.find(b => b._id === bookingId)
    if (!booking) return
    
    await api.delete(`/consultations/${booking.consultation._id}/bookings/${bookingId}`)
    
    notificationService.showSuccess('Booking cancelled successfully')
    await loadData()
  } catch (error) {
    console.error('Cancel booking error:', error)
    notificationService.showError('Failed to cancel booking')
  }
}

const loadConsultations = async () => {
  try {
    const response = await api.get('/consultations/available/all')
    consultations.value = response.data || []
  } catch (error) {
    console.error('Error loading consultations:', error)
    notificationService.showError('Failed to load available consultations')
  }
}

const loadMyBookings = async () => {
  try {
    console.log('Loading student bookings in consultations page...')
    
    // Try the main endpoint first
    let response
    try {
      response = await api.get('/consultations/my-bookings')
      console.log('Main endpoint response:', response.data)
    } catch (mainError) {
      console.error('Main endpoint failed:', mainError)
      
      // Try the alternative endpoint
      console.log('Trying alternative endpoint...')
      response = await api.get('/consultations/my-bookings-alt')
      console.log('Alternative endpoint response:', response.data)
    }
    
    myBookings.value = response.data || []
    console.log('Final bookings count:', myBookings.value.length)
    
  } catch (error) {
    console.error('Error loading my bookings:', error)
    notificationService.showError('Failed to load your bookings')
    
    // Show more detailed error in development
    if (import.meta.env.DEV) {
      console.error('Full error details:', error.response?.data)
    }
  }
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadConsultations(),
      loadMyBookings()
    ])
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.min-h-[80px] {
  min-height: 80px;
}
</style> 