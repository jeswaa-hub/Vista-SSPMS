<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">My Consultation Bookings</h1>
            <p class="text-gray-500 mt-1 font-normal">View and manage your scheduled consultations</p>
          </div>
          
          <router-link 
            to="/student/consultations"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Book New Consultation
          </router-link>
        </div>
      </div>
    </div>
      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span class="text-sm text-gray-600">Loading your bookings...</span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div v-else class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          <button
            v-for="filter in statusFilters"
            :key="filter.value"
            @click="currentFilter = filter.value"
            :class="[
              currentFilter === filter.value
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            {{ filter.label }}
            <span 
              v-if="getFilteredBookings(filter.value).length > 0"
              :class="[
                currentFilter === filter.value
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-900',
                'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium'
              ]"
            >
              {{ getFilteredBookings(filter.value).length }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Bookings List -->
      <div class="p-6">
        <div v-if="filteredBookings.length === 0" class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ currentFilter === 'all' ? 'No Bookings Yet' : `No ${currentFilter} Bookings` }}
          </h3>
          <p class="text-gray-600">
            {{ currentFilter === 'all' 
              ? "You haven't booked any consultations yet." 
              : `You don't have any ${currentFilter.toLowerCase()} consultation bookings.` }}
          </p>
          <router-link 
            v-if="currentFilter === 'all'"
            to="/student/consultations"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Book Your First Consultation
          </router-link>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="booking in filteredBookings" 
            :key="booking._id"
            class="border rounded-lg p-6 hover:shadow-md transition-shadow"
            :class="getBookingCardClass(booking.status)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <!-- Header -->
                <div class="flex items-center space-x-3 mb-3">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">
                        {{ getAdviserInitials(booking.consultation.adviser) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-lg font-medium text-gray-900">
                      {{ booking.consultation.adviser.firstName }} {{ booking.consultation.adviser.lastName }}
                    </h4>
                    <p class="text-sm text-gray-600">{{ booking.consultation.adviser.email }}</p>
                  </div>
                  <span :class="getStatusClass(booking.status)" class="inline-flex px-3 py-1 text-sm font-semibold rounded-full">
                    {{ booking.status }}
                  </span>
                </div>

                <!-- Schedule Info -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div class="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ weekDays[booking.consultation.dayOfWeek] }}
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatTimeRange(booking.consultation.startTime, booking.consultation.endTime) }}
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ booking.consultation.duration }} hours
                  </div>
                </div>

                <!-- Concern -->
                <div class="mb-3">
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-700 mr-2">Concern:</span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {{ booking.concern }}
                    </span>
                  </div>
                </div>

                <!-- Notes -->
                <div v-if="booking.notes" class="mb-3">
                  <span class="text-sm font-medium text-gray-700">Notes:</span>
                  <p class="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">{{ booking.notes }}</p>
                </div>

                <!-- Adviser Feedback -->
                <div v-if="booking.feedback" class="mb-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <span class="text-sm font-medium text-purple-800">Adviser Feedback:</span>
                  <p class="text-sm text-gray-700 mt-1">{{ booking.feedback }}</p>
                  <p v-if="booking.feedbackAt" class="text-xs text-gray-500 mt-1">
                    Added on {{ formatDateTime(booking.feedbackAt) }}
                  </p>
                </div>

                <!-- Booking Date -->
                <div class="text-xs text-gray-500">
                  Booked on {{ formatDateTime(booking.bookedAt) }}
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col space-y-2 ml-6">
                <button
                  v-if="booking.status === 'Pending' || booking.status === 'Confirmed'"
                  @click="cancelBooking(booking)"
                  class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel Booking
                </button>
                
                <!-- View Details button removed - feedback now displayed inline -->
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
const myBookings = ref([])
const currentFilter = ref('all')

// Week days
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Status filters
const statusFilters = [
  { label: 'All Bookings', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' }
]

// Computed
const filteredBookings = computed(() => {
  return getFilteredBookings(currentFilter.value)
})

// Methods
const getFilteredBookings = (filter) => {
  if (filter === 'all') {
    return myBookings.value
  }
  return myBookings.value.filter(booking => booking.status === filter)
}

// getBookingCount function removed - no longer needed without statistics section

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

const getAdviserInitials = (adviser) => {
  return `${adviser.firstName.charAt(0)}${adviser.lastName.charAt(0)}`
}

const getStatusClass = (status) => {
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

const getBookingCardClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'border-yellow-200 bg-yellow-50'
    case 'Confirmed':
      return 'border-green-200 bg-green-50'
    case 'Completed':
      return 'border-blue-200 bg-blue-50'
    case 'Cancelled':
      return 'border-red-200 bg-red-50'
    default:
      return 'border-gray-200 bg-white'
  }
}

const cancelBooking = async (booking) => {
  if (!confirm('Are you sure you want to cancel this booking?')) return
  
  try {
    await api.delete(`/consultations/${booking.consultation._id}/bookings/${booking._id}`)
    
    notificationService.showSuccess('Booking cancelled successfully')
    await loadMyBookings()
  } catch (error) {
    console.error('Cancel booking error:', error)
    const message = error.response?.data?.message || 'Failed to cancel booking'
    notificationService.showError(message)
  }
}

// viewFeedback function removed - feedback now displayed inline

const loadMyBookings = async () => {
  try {
    loading.value = true
    console.log('Loading student bookings...')
    
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
    console.log('Sample booking with feedback check:', myBookings.value[0] ? {
      id: myBookings.value[0]._id,
      status: myBookings.value[0].status,
      feedback: myBookings.value[0].feedback,
      feedbackAt: myBookings.value[0].feedbackAt
    } : 'no bookings')
    
    // If still no bookings, let's check debug info
    if (myBookings.value.length === 0) {
      try {
        const debugResponse = await api.get('/consultations/debug/student-data')
        console.log('Debug info:', debugResponse.data)
        
        if (debugResponse.data.stats.consultationsWithStudentBookings === 0) {
          console.log('No bookings found in database for this student')
        } else {
          console.log('Bookings exist but not being returned properly')
        }
      } catch (debugError) {
        console.error('Debug endpoint failed:', debugError)
      }
    }
    
  } catch (error) {
    console.error('Error loading my bookings:', error)
    const message = error.response?.data?.message || 'Failed to load your bookings'
    notificationService.showError(message)
    
    // Show more detailed error in development
    if (import.meta.env.DEV) {
      console.error('Full error details:', error.response?.data)
    }
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadMyBookings()
})
</script>

<style scoped>
/* Additional styling if needed */
</style> 