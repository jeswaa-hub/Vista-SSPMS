<template>
  <div class="min-h-screen p-6" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="bg-green-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          </div>
          <div>
            <h1 class="text-2xl font-normal text-gray-800">Available Consultations</h1>
            <p class="text-sm text-gray-500">Book consultations with advisers for academic guidance and support</p>
          </div>
        </div>
          <div class="flex items-center space-x-2">
            <button
              @click="viewMode = 'calendar'"
              class="px-3 py-2 text-sm rounded-md border"
              :class="viewMode === 'calendar' ? 'bg-white border-gray-300 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
            >
              Calendar View
            </button>
            <button
              @click="viewMode = 'list'"
              class="px-3 py-2 text-sm rounded-md border"
              :class="viewMode === 'list' ? 'bg-white border-gray-300 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
            >
              List View
            </button>
            <router-link
              to="/student/my-bookings"
              class="ml-2 inline-flex items-center px-3 py-2 text-sm font-normal text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700"
            >
              My Bookings
            </router-link>
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
    
    <!-- Calendar/List Container -->
    <div v-else class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
      <!-- Calendar Header -->
      <div class="bg-gray-50 px-6 py-4 border-b">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-normal text-gray-800">Weekly Schedule</h3>
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
      <div v-if="viewMode === 'calendar'" class="bg-white rounded-xl border border-gray-200">
        <!-- Calendar Grid Header -->
        <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
          <div class="py-3 px-2 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
          <div v-for="day in weekDays" :key="day" 
               class="py-3 px-2 text-gray-500 text-xs font-medium text-center">
            {{ day }}
          </div>
        </div>
        
        <!-- Calendar Grid Body -->
        <div class="relative">
          <div class="divide-y divide-gray-200">
            <div v-for="(timeSlot, index) in formattedTimeSlots" :key="index" class="grid grid-cols-6">
              <!-- Time Label -->
              <div class="py-2 px-1 text-xs font-normal text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center min-h-[50px]">
                <span class="text-center leading-tight">{{ timeSlot }}</span>
              </div>
              
              <!-- Day Columns -->
              <div 
                v-for="(day, dayIndex) in weekDays" 
                :key="`${day}-${index}`"
                class="relative p-0 min-h-[50px] border-r border-gray-100"
              >
                <!-- Consultation blocks will be positioned here -->
              </div>
            </div>
          </div>

          <!-- Absolutely positioned consultation blocks -->
          <div 
            v-for="(consultationBlock, index) in getPositionedConsultationBlocks()" 
            :key="index"
            class="absolute rounded-md text-xs bg-opacity-95 cursor-pointer overflow-hidden z-10 shadow-sm flex flex-col border"
            :class="getConsultationCardClass(consultationBlock.consultation)"
            :style="{
              left: `calc(${consultationBlock.dayIndex * 16.67}% + 16.67% + 1px)`, 
              top: `${consultationBlock.top}px`,
              height: `${consultationBlock.height}px`,
              width: 'calc(16.67% - 2px)'
            }"
            @click="selectConsultation(consultationBlock.consultation)"
          >
            <div class="font-normal text-xs truncate p-2">
              {{ consultationBlock.consultation.adviser.firstName }} {{ consultationBlock.consultation.adviser.lastName }}
            </div>
            <div class="text-xs flex flex-col justify-between px-2 pb-2 flex-grow">
              <span class="truncate font-normal">Consultation</span>
              <div class="mt-1 flex flex-col">
                <span class="rounded-full px-2 py-0.5 bg-white bg-opacity-40 text-xs mt-1 inline-block w-max">
                  Available: {{ consultationBlock.consultation.maxStudents - (consultationBlock.consultation.bookedStudents || 0) }}
                </span>
                <span class="text-xs mt-1">
                  {{ formatTimeRange(consultationBlock.consultation.startTime, consultationBlock.consultation.endTime) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="p-6">
        <div class="overflow-x-auto border border-gray-200 rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adviser</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="c in consultations" :key="c._id">
                <td class="px-4 py-3 text-sm text-gray-900">{{ c.adviser.firstName }} {{ c.adviser.lastName }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ weekDays[c.dayOfWeek] }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ formatTimeRange(c.startTime, c.endTime) }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ c.maxStudents - (c.bookedStudents || 0) }}</td>
                <td class="px-4 py-3 text-right">
                  <button
                    class="inline-flex items-center px-3 py-1.5 text-xs font-normal text-white bg-green-600 hover:bg-green-700 rounded-md"
                    @click="selectConsultation(c)"
                  >Book</button>
                </td>
              </tr>
              <tr v-if="consultations.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-500">No consultations available</td>
              </tr>
            </tbody>
          </table>
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
    
    <!-- My Bookings section removed -->
    
    <!-- Booking Modal -->
    <Teleport to="body">
      <div v-if="showBookingModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" style="z-index: 999999;" @click.self="closeBookingModal">
        <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-6 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-2xl font-semibold text-green-600">Book Consultation</h2>
            <button @click="closeBookingModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedConsultation">
          <!-- Consultation Info -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 class="font-medium text-gray-900 mb-2">
              {{ selectedConsultation.adviser.firstName }} {{ selectedConsultation.adviser.lastName }}
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">Day:</span>
                <p class="text-gray-600">{{ weekDays[selectedConsultation.dayOfWeek] }}</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">Time:</span>
                <p class="text-gray-600">{{ formatTimeRange(selectedConsultation.startTime, selectedConsultation.endTime) }}</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">Duration:</span>
                <p class="text-gray-600">{{ selectedConsultation.duration }} hours</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">Available slots:</span>
                <p class="text-gray-600">{{ selectedConsultation.maxStudents - (selectedConsultation.bookedStudents || 0) }}</p>
              </div>
            </div>
          </div>
          
          <!-- Booking Form -->
          <form @submit.prevent="bookConsultation" class="space-y-6">
            <!-- Concern Selection -->
            <div>
              <label for="concern" class="block text-sm font-medium text-gray-700 mb-2">
                What is your consultation concern? *
              </label>
              <select
                id="concern"
                v-model="bookingForm.concern"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="">Please select your concern</option>
                <option v-for="concern in consultationConcerns" :key="concern" :value="concern">
                  {{ concern }}
                </option>
              </select>
            </div>
            
            <!-- Additional Notes -->
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                v-model="bookingForm.notes"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                placeholder="Please provide any additional details about your consultation needs..."
              ></textarea>
            </div>
            
            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                @click="closeBookingModal"
                class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="booking || !bookingForm.concern"
                class="px-6 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
              >
                {{ booking ? 'Booking...' : 'Book Consultation' }}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, Teleport } from 'vue'
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
const viewMode = ref('calendar')

// Week days (Monday to Friday)
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Time slots (7 AM to 5 PM)
const timeSlots = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

// Formatted time slots for display
const formattedTimeSlots = [
  '7:00 AM - 8:00 AM', 
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM'
]

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

// Convert time string (e.g., "7:00 AM") to minutes since midnight
const convertTimeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  let totalMinutes = hours * 60 + minutes
  
  if (period === 'PM' && hours !== 12) {
    totalMinutes += 12 * 60
  } else if (period === 'AM' && hours === 12) {
    totalMinutes = minutes
  }
  
  return totalMinutes
}

// Function to get positioned consultation blocks
const getPositionedConsultationBlocks = () => {
  // Constants for positioning
  const ROW_HEIGHT = 50 // Match the min-height of time slots

  // Map time slots to their start and end times in minutes
  const timeSlotRanges = formattedTimeSlots.map(slot => {
    const [start, end] = slot.split(' - ')
    return {
      start: convertTimeToMinutes(start),
      end: convertTimeToMinutes(end)
    }
  })
  
  // Process each consultation to determine its position
  const consultationBlocks = []
  
  // Day indices for positioning
  const dayIndices = {
    'Monday': 0,
    'Tuesday': 1,
    'Wednesday': 2,
    'Thursday': 3,
    'Friday': 4
  }
  
  consultations.value.forEach(consultation => {
    // Get the day index (0-4 for Monday-Friday)
    const dayIndex = dayIndices[weekDays[consultation.dayOfWeek]]
    if (dayIndex === undefined) return
    
    // Calculate start and end times
    const startTime = formatTime(consultation.startTime)
    const endTime = formatTime(consultation.endTime)
    
    // Find the matching time slot for the start time
    let startRowIndex = -1
    formattedTimeSlots.forEach((timeSlot, index) => {
      if (timeSlot.startsWith(startTime)) {
        startRowIndex = index
      }
    })
    
    // Find the matching time slot for the end time
    let endRowIndex = -1
    formattedTimeSlots.forEach((timeSlot, index) => {
      if (timeSlot.endsWith(endTime)) {
        endRowIndex = index
      }
    })
    
    // If exact matches weren't found, calculate based on minutes
    if (startRowIndex === -1 || endRowIndex === -1) {
      const startMinutes = convertTimeToMinutes(startTime)
      const endMinutes = convertTimeToMinutes(endTime)
      
      // Find closest time slots
      if (startRowIndex === -1) {
        let minDiff = Infinity
        timeSlotRanges.forEach((range, index) => {
          const diff = Math.abs(range.start - startMinutes)
          if (diff < minDiff) {
            minDiff = diff
            startRowIndex = index
          }
        })
      }
      
      if (endRowIndex === -1) {
        let minDiff = Infinity
        timeSlotRanges.forEach((range, index) => {
          const diff = Math.abs(range.end - endMinutes)
          if (diff < minDiff) {
            minDiff = diff
            endRowIndex = index
          }
        })
      }
    }
    
    // Ensure valid indices
    if (startRowIndex === -1) startRowIndex = 0
    if (endRowIndex === -1 || endRowIndex < startRowIndex) endRowIndex = startRowIndex
    
    // Calculate position and dimensions
    const top = startRowIndex * ROW_HEIGHT
    const height = (endRowIndex - startRowIndex + 1) * ROW_HEIGHT
    
    // Add to consultation blocks
    consultationBlocks.push({
      consultation,
      dayIndex,
      top,
      height,
      startTime,
      endTime
    })
  })
  
  return consultationBlocks
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
.min-h-80px {
  min-height: 80px;
}
</style> 