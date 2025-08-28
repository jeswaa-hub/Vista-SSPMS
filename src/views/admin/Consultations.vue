<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
            </svg>
          </div>
          <div>
              <h1 class="text-2xl font-normal text-gray-800">Consultation Management</h1>
              <p class="text-gray-500 font-normal">Manage consultation schedules for advisers and students</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- View Toggle -->
          <div class="bg-gray-100 p-1 rounded-lg">
            <button
              @click="currentView = 'calendar'"
              :class="[
                  'px-3 py-1.5 rounded-md text-sm font-normal transition-colors',
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
                  'px-3 py-1.5 rounded-md text-sm font-normal transition-colors',
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
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-normal text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
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
      <div v-else-if="currentView === 'calendar'" class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Calendar Header -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
            <h3 class="text-lg font-normal text-gray-800">Weekly Schedule</h3>
            <div class="text-sm text-gray-500 font-normal">
            Monday - Friday | 7:00 AM - 5:00 PM
          </div>
        </div>
      </div>
      
      <!-- Calendar Grid -->
        <div class="bg-white rounded-lg border border-gray-200">
          <!-- Calendar Grid Header -->
          <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
            <div class="py-3 px-2 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
            <div v-for="day in weekDays" :key="day" 
                 class="py-3 px-2 text-gray-500 text-xs font-medium text-center">
              {{ day }}
            </div>
          </div>
          
          <!-- Calendar Grid Body -->
          <div class="relative max-h-[600px] overflow-y-auto">
            <div class="divide-y divide-gray-200">
              <div v-for="(timeSlot, index) in timeSlots" :key="index" class="grid grid-cols-6">
                <!-- Time Label -->
                <div class="py-2 px-1 text-xs font-normal text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center min-h-[50px]">
                  <span class="text-center leading-tight">{{ timeSlot }}</span>
            </div>
            
            <!-- Day Columns -->
            <div 
              v-for="(day, dayIndex) in weekDays" 
                  :key="`${day}-${index}`"
                  class="relative p-0 min-h-[50px] border-r border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  @click="selectTimeSlot(dayIndex, index)"
                >
                  <!-- Add button for empty slots -->
                  <div 
                    v-if="getConsultationsForSlot(dayIndex, index).length === 0"
                    class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    @click="openAddModalForSlot(dayIndex, index)"
                  >
                    <div class="bg-gray-200 hover:bg-blue-100 rounded-full p-1.5 transition-colors">
                      <svg class="h-3 w-3 text-gray-600 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                </div>
                </div>
                </div>
              </div>
              
            <!-- Absolutely positioned consultation blocks -->
            <div 
              v-for="(consultationBlock, index) in getPositionedConsultationBlocks()" 
              :key="index"
              class="absolute rounded-md text-xs bg-opacity-95 cursor-pointer overflow-hidden z-10 shadow-sm flex flex-col border"
              :class="getConsultationColorClasses(consultationBlock.consultation)"
              :style="{
                left: `calc(${consultationBlock.dayIndex * 16.67}% + 16.67% + 1px)`, 
                top: `${consultationBlock.top}px`,
                height: `${consultationBlock.height}px`,
                width: 'calc(16.67% - 2px)'
              }"
              @click="viewConsultation(consultationBlock.consultation)"
            >
              <div class="font-normal text-xs truncate p-2">
                {{ consultationBlock.consultation.adviser.firstName }} {{ consultationBlock.consultation.adviser.lastName }}
              </div>
              <div class="text-xs flex flex-col justify-between px-2 pb-2 flex-grow">
                <span class="truncate font-normal">{{ consultationBlock.consultation.notes || 'Consultation' }}</span>
                <div class="mt-1 flex flex-col">
                  <span class="rounded-full px-2 py-0.5 bg-white bg-opacity-40 text-xs mt-1 inline-block w-max">
                    {{ consultationBlock.consultation.maxStudents }} slots
                  </span>
                  <span class="text-xs mt-1">
                    {{ formatTimeRange(consultationBlock.consultation.startTime, consultationBlock.consultation.endTime) }}
                  </span>
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
            <tr v-for="consultation in filteredConsultations" :key="consultation._id" class="hover:bg-gray-50">
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
    <Teleport to="body">
        <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50" @click.self="closeAddModal">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <h2 class="text-xl font-normal text-gray-800">
            {{ editingConsultation ? 'Edit Consultation Schedule' : 'Add Consultation Schedule' }}
            </h2>
              <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
          <form @submit.prevent="saveConsultation" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Adviser Selection -->
          <div>
              <label for="adviser" class="block text-sm font-medium text-gray-700 mb-2">
              Select Adviser
            </label>
            <select
              id="adviser"
              v-model="consultationForm.adviserId"
              required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose an adviser</option>
              <option v-for="adviser in advisers" :key="adviser._id" :value="adviser._id">
                {{ adviser.firstName }} {{ adviser.lastName }}
              </option>
            </select>
          </div>
          
          <!-- Day Selection -->
          <div>
              <label for="day" class="block text-sm font-medium text-gray-700 mb-2">
              Day of Week
            </label>
            <select
              id="day"
              v-model="consultationForm.dayOfWeek"
              required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose a day</option>
              <option v-for="(day, index) in weekDays" :key="index" :value="index">
                {{ day }}
              </option>
            </select>
          </div>
          
          <!-- Start Time -->
          <div>
              <label for="startTime" class="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <select
              id="startTime"
              v-model="consultationForm.startTime"
              required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose start time</option>
              <option v-for="hour in timeSlots" :key="hour" :value="hour">
                {{ formatTime(hour) }}
              </option>
            </select>
          </div>
          
          <!-- Duration (Fixed at 3 hours) -->
          <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
              <div class="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
              3 hours (Fixed)
            </div>
          </div>
          
          <!-- Max Students -->
          <div>
              <label for="maxStudents" class="block text-sm font-medium text-gray-700 mb-2">
              Maximum Students
            </label>
            <input
              id="maxStudents"
              type="number"
              v-model="consultationForm.maxStudents"
              min="1"
              max="10"
              required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            </div>
          </div>
          
          <!-- Notes -->
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              v-model="consultationForm.notes"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Any additional notes..."
            ></textarea>
          </div>
          
          <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="closeAddModal"
                class="px-4 py-2 text-sm font-normal text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
                class="px-4 py-2 text-sm font-normal text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
                {{ saving ? 'Saving...' : (editingConsultation ? 'Update Schedule' : 'Create Schedule') }}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>

    <!-- View Consultation Modal -->
    <Teleport to="body">
        <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50" @click.self="closeViewModal">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <h2 class="text-xl font-normal text-gray-800">Consultation Details</h2>
              <button @click="closeViewModal" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
          <div v-if="selectedConsultation">
          <!-- Consultation Info -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Adviser</label>
                <p class="text-sm text-gray-900 font-medium">{{ selectedConsultation.adviser.firstName }} {{ selectedConsultation.adviser.lastName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Day</label>
                <p class="text-sm text-gray-900 font-medium">{{ weekDays[selectedConsultation.dayOfWeek] }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Time</label>
                <p class="text-sm text-gray-900 font-medium">{{ formatTimeRange(selectedConsultation.startTime, selectedConsultation.endTime) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Duration</label>
                <p class="text-sm text-gray-900 font-medium">{{ selectedConsultation.duration }} hours</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
                <span :class="getStatusClass(selectedConsultation.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">{{ selectedConsultation.status }}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Bookings</label>
                <p class="text-sm text-gray-900 font-medium">{{ selectedConsultation.bookedStudents || 0 }} / {{ selectedConsultation.maxStudents }}</p>
            </div>
          </div>
          
            <div v-if="selectedConsultation.notes" class="mt-4">
            <label class="block text-sm font-medium text-gray-700">Notes</label>
              <p class="text-sm text-gray-900 mt-1">{{ selectedConsultation.notes }}</p>
            </div>
          </div>

          <!-- Booked Students Section -->
          <div class="border border-gray-300 rounded-lg">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h4 class="text-lg font-medium text-gray-900">Booked Students ({{ filteredBookings.length }})</h4>
              <div class="bg-gray-100 p-1 rounded-lg">
                <button @click="bookingFilter = 'Confirmed'" :class="['px-3 py-1 rounded-md text-xs font-medium transition-colors', bookingFilter === 'Confirmed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']">Confirmed</button>
                <button @click="bookingFilter = 'Completed'" :class="['px-3 py-1 rounded-md text-xs font-medium transition-colors', bookingFilter === 'Completed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']">Completed</button>
                <button @click="bookingFilter = 'Cancelled'" :class="['px-3 py-1 rounded-md text-xs font-medium transition-colors', bookingFilter === 'Cancelled' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']">Cancelled</button>
              </div>
            </div>
            
            <div class="p-4">
              <div v-if="filteredBookings.length === 0" class="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p>No students found for this filter</p>
              </div>
              
              <div v-else class="space-y-4 max-h-96 overflow-y-auto">
                <div v-for="b in filteredBookings" :key="b._id" class="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3">
                        <div class="flex-shrink-0">
                          <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span class="text-sm font-medium text-blue-600">
                              {{ b.student?.user?.firstName?.charAt(0) }}{{ b.student?.user?.lastName?.charAt(0) }}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h5 class="text-sm font-medium text-gray-900">
                            {{ b.student?.user?.firstName }} {{ b.student?.user?.lastName }}
                          </h5>
                          <p class="text-sm text-gray-600">{{ b.student?.user?.email }}</p>
                          <p class="text-xs text-gray-500">ID: {{ b.student?.user?.idNumber }}</p>
                        </div>
                        <span :class="getBookingStatusClass(b.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">{{ b.status }}</span>
                      </div>
                      
                      <!-- Concern and Notes -->
                      <div class="mt-3 space-y-2">
                        <div class="flex items-start space-x-2">
                          <span class="text-xs font-medium text-gray-700 whitespace-nowrap">Concern:</span>
                          <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            {{ b.concern }}
                          </span>
                        </div>
                        
                        <div v-if="b.notes" class="flex items-start space-x-2">
                          <span class="text-xs font-medium text-gray-700 whitespace-nowrap">Notes:</span>
                          <p class="text-xs text-gray-600">{{ b.notes }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
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
const statusFilter = ref('All')
const bookingFilter = ref('Confirmed')

// Week days (Monday to Friday)
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Time slots (7 AM to 5 PM) - matching Classes format
const timeSlots = [
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

const getConsultationsForSlot = (dayIndex, timeSlotIndex) => {
  return consultations.value
    .filter(c => statusFilter.value === 'All' ? true : c.status === statusFilter.value)
    .filter(consultation => {
      // Convert time slot index to hour (7 AM = index 0, 8 AM = index 1, etc.)
      const hour = 7 + timeSlotIndex
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

// Get color classes for consultation blocks
const getConsultationColorClasses = (consultation) => {
  // Different colors based on status or adviser
  const colors = [
    'bg-purple-200 text-purple-800 hover:bg-purple-300 border-purple-300',
    'bg-green-200 text-green-800 hover:bg-green-300 border-green-300',
    'bg-blue-200 text-blue-800 hover:bg-blue-300 border-blue-300',
    'bg-yellow-200 text-yellow-800 hover:bg-yellow-300 border-yellow-300',
    'bg-pink-200 text-pink-800 hover:bg-pink-300 border-pink-300',
  ]
  
  // Use adviser ID to consistently assign colors
  const colorIndex = consultation.adviser._id ? consultation.adviser._id.slice(-1).charCodeAt(0) % colors.length : 0
  return colors[colorIndex]
}

// Function to get positioned consultation blocks
const getPositionedConsultationBlocks = () => {
  // Constants for positioning
  const ROW_HEIGHT = 50 // Match the min-height of time slots

  // Map time slots to their start and end times in minutes
  const timeSlotRanges = timeSlots.map(slot => {
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
  
  consultations.value
    .filter(c => statusFilter.value === 'All' ? true : c.status === statusFilter.value)
    .forEach(consultation => {
      // Get the day index (0-4 for Monday-Friday)
      const dayIndex = dayIndices[weekDays[consultation.dayOfWeek]]
      if (dayIndex === undefined) return
      
      // Calculate start and end times
      const startTime = formatTime(consultation.startTime)
      const endTime = formatTime(consultation.endTime)
      
      // Find the matching time slot for the start time
      let startRowIndex = -1
      timeSlots.forEach((timeSlot, index) => {
        if (timeSlot.startsWith(startTime)) {
          startRowIndex = index
        }
      })
      
      // Find the matching time slot for the end time
      let endRowIndex = -1
      timeSlots.forEach((timeSlot, index) => {
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

const selectTimeSlot = (dayIndex, timeSlotIndex) => {
  // Logic for selecting time slot
}

const openAddModalForSlot = (dayIndex, timeSlotIndex) => {
  const hour = 7 + timeSlotIndex // Convert index to actual hour
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
      adviserId: consultationForm.value.adviserId,
      dayOfWeek: parseInt(consultationForm.value.dayOfWeek),
      startTime: parseInt(consultationForm.value.startTime),
      duration: parseInt(consultationForm.value.duration),
      maxStudents: parseInt(consultationForm.value.maxStudents),
      notes: consultationForm.value.notes || '',
      endTime: parseInt(consultationForm.value.startTime) + parseInt(consultationForm.value.duration),
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

// Lifecycle
onMounted(() => {
  loadConsultations()
  loadAdvisers()
})

const filteredConsultations = computed(() => {
  if (statusFilter.value === 'All') return consultations.value
  return consultations.value.filter(c => c.status === statusFilter.value)
})

const filteredBookings = computed(() => {
  if (!selectedConsultation.value) return []
  const list = selectedConsultation.value.bookings || []
  return list.filter(b => b.status === bookingFilter.value)
})
</script>

<style scoped>
.min-h-[80px] {
  min-height: 80px;
}
</style> 