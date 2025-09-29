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
        
        <!-- View Toggle -->
        <div class="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            @click="currentView = 'calendar'"
            :class="currentView === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Calendar</span>
          </button>
          <button
            @click="currentView = 'list'"
            :class="currentView === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>List</span>
          </button>
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
            :class="getAdviserConsultationColorClass(consultationBlock.consultation)"
            :style="{
              left: `calc(${consultationBlock.dayIndex * 16.67}% + 16.67% + 1px)`, 
              top: `${consultationBlock.top}px`,
              height: `${consultationBlock.height}px`,
              width: 'calc(16.67% - 2px)'
            }"
            @click="viewConsultation(consultationBlock.consultation)"
          >
            <div class="font-normal text-xs truncate p-2">
              Consultation Available
            </div>
            <div class="text-xs flex flex-col justify-between px-2 pb-2 flex-grow">
              <span class="truncate font-normal">{{ consultationBlock.consultation.notes || 'General Consultation' }}</span>
              <div class="mt-1 flex flex-col">
                <span class="rounded-full px-2 py-0.5 bg-white bg-opacity-40 text-xs mt-1 inline-block w-max">
                  Booked: {{ consultationBlock.consultation.bookedStudents || 0 }} / {{ consultationBlock.consultation.maxStudents }}
                </span>
                <span class="text-xs mt-1">
                  {{ formatTimeRange(consultationBlock.consultation.startTime, consultationBlock.consultation.endTime) }}
                </span>
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

    <!-- List View with bookings per consultation -->
    <div v-else class="bg-white rounded-lg shadow-sm">
      <div class="px-6 py-4 border-b">
        <h3 class="text-lg font-medium text-gray-900">Consultation Schedules</h3>
      </div>
      <div v-if="consultations.length === 0" class="p-6 text-center text-gray-500">No consultation schedules</div>
      <div v-else class="divide-y">
        <div v-for="c in consultations" :key="c._id" class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900">{{ weekDays[c.dayOfWeek] }} • {{ formatTimeRange(c.startTime, c.endTime) }}</div>
              <div class="text-sm text-gray-600">Capacity: {{ c.bookedStudents || 0 }} / {{ c.maxStudents }}</div>
            </div>
            <div class="flex items-center space-x-3">
              <button 
                @click="viewConsultation(c)"
                class="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                View Details
              </button>
              <span :class="getStatusClass(c.status)" class="px-2 py-1 rounded-full text-xs font-semibold">{{ c.status }}</span>
            </div>
          </div>
          <div class="mt-3">
            <h4 class="text-sm font-medium text-gray-800 mb-2">Booked Students</h4>
            <div v-if="(c.bookings || []).filter(b => b.status === 'Pending' || b.status === 'Confirmed').length === 0" class="text-sm text-gray-500">No active bookings</div>
            <div v-else class="space-y-2">
              <div v-for="b in (c.bookings || []).filter(b => b.status === 'Pending' || b.status === 'Confirmed')" :key="b._id" class="flex items-start justify-between bg-gray-50 rounded p-3">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ b.student?.user?.firstName }} {{ b.student?.user?.lastName }}
                    <span :class="getBookingStatusClass(b.status)" class="ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold">{{ b.status }}</span>
                  </div>
                  <div class="text-xs text-gray-600">ID: {{ b.student?.user?.idNumber }} • {{ b.student?.user?.email }}</div>
                  <div class="mt-1 text-xs"><span class="font-medium text-gray-700">Concern:</span> <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{{ b.concern }}</span></div>
                </div>
                                  <div class="flex items-center gap-2">
                    <button v-if="b.status === 'Pending'" @click="updateBookingStatus(b._id, 'Confirmed')" class="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Confirm</button>
                    <button v-if="b.status === 'Confirmed'" @click="updateBookingStatus(b._id, 'Completed')" class="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Mark Complete</button>
                    <button v-if="b.status === 'Completed' && !b.feedback" @click="openFeedbackModal(b)" class="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">Add Feedback</button>
                    <button v-if="b.status === 'Completed' && b.feedback" @click="openFeedbackModal(b)" class="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">Edit Feedback</button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Consultation Details Modal -->
    <Teleport to="body">
      <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" style="z-index: 999999;" @click.self="closeDetailsModal">
        <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-4xl mx-auto p-6 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-2xl font-semibold text-blue-600">Consultation Details</h2>
            <button @click="closeDetailsModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedConsultation">
          <!-- Consultation Info Header -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-200">
            <!-- Main Schedule Info -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="flex items-center text-blue-600">
                  <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-lg font-semibold">{{ weekDays[selectedConsultation.dayOfWeek] }}</span>
                </div>
                <div class="flex items-center text-blue-600">
                  <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-lg font-semibold">{{ formatTimeRange(selectedConsultation.startTime, selectedConsultation.endTime) }}</span>
                </div>
                <div class="flex items-center text-blue-600">
                  <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span class="text-lg font-semibold">{{ selectedConsultation.duration }}h Duration</span>
                </div>
              </div>
              <span :class="getStatusClass(selectedConsultation.status)" class="inline-flex px-3 py-1 text-sm font-semibold rounded-full">
                {{ selectedConsultation.status }}
              </span>
            </div>
            
            <!-- Capacity and Stats -->
            <div class="grid grid-cols-3 gap-4 mt-4">
              <div class="bg-white p-3 rounded-lg border border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-700">Capacity</p>
                    <p class="text-lg font-bold text-gray-900">{{ selectedConsultation.bookedStudents || 0 }} / {{ selectedConsultation.maxStudents }}</p>
                  </div>
                  <div class="p-2 bg-blue-100 rounded-full">
                    <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div class="bg-white p-3 rounded-lg border border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-700">Available Slots</p>
                    <p class="text-lg font-bold text-green-600">{{ selectedConsultation.maxStudents - (selectedConsultation.bookedStudents || 0) }}</p>
                  </div>
                  <div class="p-2 bg-green-100 rounded-full">
                    <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div class="bg-white p-3 rounded-lg border border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-700">Time per Student</p>
                    <p class="text-lg font-bold text-blue-600">{{ Math.floor((selectedConsultation.duration * 60) / selectedConsultation.maxStudents) }}m</p>
                  </div>
                  <div class="p-2 bg-purple-100 rounded-full">
                    <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Notes -->
            <div v-if="selectedConsultation.notes" class="mt-4 bg-white p-3 rounded-lg border border-gray-200">
              <p class="text-sm font-medium text-gray-700 mb-1">Notes</p>
              <p class="text-sm text-gray-600">{{ selectedConsultation.notes }}</p>
            </div>
          </div>
          
          <!-- Booked Students Section -->
          <div class="border border-gray-300 rounded-lg">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h4 class="text-lg font-medium text-gray-900">Booked Students ({{ filteredBookings.length }})</h4>
              <div class="bg-gray-100 p-1 rounded-lg">
                <button @click="bookingFilter = 'All'"
                  :class="['px-3 py-1 rounded-md text-xs font-medium transition-colors', bookingFilter === 'All' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']">All</button>
                <button @click="bookingFilter = 'Pending'"
                  :class="['px-3 py-1 rounded-md text-xs font-medium transition-colors', bookingFilter === 'Pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']">Pending</button>
                <button @click="bookingFilter = 'Confirmed'"
                  :class="['px-3 py-1 rounded-md text-xs font-medium transition-colors', bookingFilter === 'Confirmed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']">Confirmed</button>
                <button @click="bookingFilter = 'Resolved'"
                  :class="['px-3 py-1 rounded-md text-xs font-medium transition-colors', bookingFilter === 'Resolved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']">Resolved</button>
                <button @click="bookingFilter = 'Escalated'"
                  :class="['px-3 py-1 rounded-md text-xs font-medium transition-colors', bookingFilter === 'Escalated' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']">Escalated</button>
              </div>
            </div>
            
            <div class="p-0">
              <div v-if="filteredBookings.length === 0" class="text-center py-12 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 class="text-sm font-medium text-gray-900 mb-1">No bookings found</h3>
                <p class="text-sm text-gray-500">
                  {{ bookingFilter === 'All' ? 'No students have booked this consultation yet.' : `No ${bookingFilter.toLowerCase()} bookings found.` }}
                </p>
              </div>
              
              <div v-else class="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6">
                        Student
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Scheduled Time
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Concern
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Details
                      </th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span class="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="booking in filteredBookings" :key="booking._id" class="hover:bg-gray-50">
                      <!-- Student Column -->
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div class="flex items-center">
                          <div class="h-10 w-10 flex-shrink-0">
                            <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span class="text-sm font-medium text-blue-600">
                                {{ booking.student.user.firstName?.charAt(0) }}{{ booking.student.user.lastName?.charAt(0) }}
                              </span>
                            </div>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                              {{ booking.student.user.firstName }} {{ booking.student.user.lastName }}
                            </div>
                            <div class="text-sm text-gray-500">
                              {{ booking.student.user.idNumber }}
                            </div>
                            <div class="text-xs text-gray-400">
                              {{ booking.student.user.email }}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <!-- Scheduled Time Column -->
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div v-if="booking.allocatedStartTime && booking.allocatedEndTime" class="text-sm">
                          <div class="flex items-center text-blue-600 font-medium">
                            <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {{ formatAllocatedTimeRange(booking.allocatedStartTime, booking.allocatedEndTime) }}
                          </div>
                          <div class="text-xs text-gray-500 mt-1">
                            {{ booking.allocatedDuration }} minutes
                          </div>
                        </div>
                        <div v-else class="text-sm text-gray-400 italic">
                          <div class="flex items-center">
                            <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Not scheduled
                          </div>
                        </div>
                      </td>
                      
                      <!-- Concern Column -->
                      <td class="px-3 py-4 text-sm text-gray-500">
                        <div class="max-w-xs">
                          <div class="text-sm text-gray-900 font-medium">
                            {{ booking.concern }}
                          </div>
                          <div v-if="booking.notes" class="text-xs text-gray-500 mt-1">
                            <strong>Notes:</strong> {{ booking.notes }}
                          </div>
                        </div>
                      </td>
                      
                      <!-- Status Column -->
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span :class="getBookingStatusClass(booking.status)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                          {{ booking.status }}
                        </span>
                      </td>
                      
                      <!-- Details Column -->
                      <td class="px-3 py-4 text-sm text-gray-500">
                        <div class="max-w-xs">
                          <!-- For Resolved consultations: Show resolution -->
                          <div v-if="booking.status === 'Resolved'" class="text-xs">
                            <div class="text-green-700 font-medium mb-1">Resolved</div>
                            <div class="text-gray-600 bg-green-50 p-2 rounded border">{{ booking.resolution }}</div>
                            <div v-if="booking.resolvedAt" class="text-gray-400 text-xs mt-1">
                              {{ formatDateTime(booking.resolvedAt) }}
                            </div>
                          </div>
                          
                          <!-- For Escalated consultations: Show escalation info -->
                          <div v-else-if="booking.status === 'Escalated'" class="text-xs">
                            <div class="text-purple-700 font-medium mb-1">Escalated to Admin</div>
                            <div v-if="booking.feedback" class="text-gray-600 bg-purple-50 p-2 rounded border">{{ booking.feedback }}</div>
                          </div>
                          
                          <!-- For Feedback -->
                          <div v-else-if="booking.feedback" class="text-xs">
                            <div class="text-purple-700 font-medium mb-1">Feedback</div>
                            <div class="text-gray-600 bg-purple-50 p-2 rounded border">{{ booking.feedback }}</div>
                            <div v-if="booking.feedbackAt" class="text-gray-400 text-xs mt-1">
                              {{ formatDateTime(booking.feedbackAt) }}
                            </div>
                          </div>
                          
                          <!-- For other statuses -->
                          <div v-else class="text-xs text-gray-500">
                            Booked {{ formatDateTime(booking.bookedAt) }}
                          </div>
                        </div>
                      </td>
                      
                      <!-- Actions Column -->
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div class="flex items-center justify-end space-x-2">
                          <!-- Pending Status Actions -->
                          <button
                            v-if="booking.status === 'Pending'"
                            @click="updateBookingStatus(booking._id, 'Confirmed')"
                            class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            Confirm
                          </button>
                          
                          <!-- Confirmed Status Actions -->
                          <template v-if="booking.status === 'Confirmed'">
                            <button
                              @click="openResolutionModal(booking)"
                              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              Resolve
                            </button>
                            <button
                              @click="openEscalationModal(booking)"
                              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                              Escalate
                            </button>
                          </template>
                          
                          <!-- Final Status Display -->
                          <span v-if="booking.status === 'Resolved' || booking.status === 'Escalated'" class="text-xs text-gray-400 italic">
                            No actions
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Feedback Modal -->
    <Teleport to="body">
      <div v-if="showFeedbackModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" style="z-index: 999999;" @click.self="closeFeedbackModal">
          <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-2xl font-semibold text-gray-900">
              {{ feedbackModalMode === 'escalation' ? '🚨 Add Feedback for Escalation' : (selectedBooking?.feedback ? 'Edit Feedback' : 'Add Feedback') }}
            </h2>
            <button @click="closeFeedbackModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Student Info -->
          <div v-if="selectedBooking" class="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Consultation Details</h3>
            <p class="text-sm text-gray-600">
              <span class="font-medium">Student:</span> {{ selectedBooking.student?.user?.firstName }} {{ selectedBooking.student?.user?.lastName }}
            </p>
            <p class="text-sm text-gray-600">
              <span class="font-medium">Concern:</span> {{ selectedBooking.concern }}
            </p>
            <p class="text-sm text-gray-600">
              <span class="font-medium">Status:</span> {{ selectedBooking.status }}
            </p>
          </div>
          
          <!-- Feedback Form -->
          <form @submit.prevent="submitFeedback">
            <div class="mb-6">
              <label for="feedback" class="block text-sm font-medium text-gray-700 mb-2">
                Consultation Feedback
              </label>
              <textarea
                id="feedback"
                v-model="feedbackForm.text"
                rows="6"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                placeholder="Provide feedback about the consultation session, outcomes, recommendations, or next steps..."
                required
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                This feedback will be visible to the student and can help track consultation outcomes.
              </p>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeFeedbackModal"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              
              <!-- For escalation mode: Submit feedback then escalate -->
              <button
                v-if="feedbackModalMode === 'escalation'"
                type="submit"
                :disabled="submittingFeedback || !feedbackForm.text.trim()"
                class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="submittingFeedback">Processing...</span>
                <span v-else>🚨 Submit & Escalate</span>
              </button>
              
              <!-- For normal feedback mode -->
              <button
                v-else
                type="submit"
                :disabled="submittingFeedback || !feedbackForm.text.trim()"
                class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="submittingFeedback">Saving...</span>
                <span v-else>{{ selectedBooking?.feedback ? 'Update Feedback' : 'Add Feedback' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
    
    <!-- Resolution Modal -->
    <Teleport to="body">
      <div v-if="showResolutionModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" style="z-index: 999999;" @click.self="closeResolutionModal">
        <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-2xl font-semibold text-gray-900">✅ Resolve Consultation</h2>
            <button @click="closeResolutionModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Student Info -->
          <div v-if="selectedBooking" class="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
            <h3 class="text-sm font-medium text-green-800 mb-2">Resolving Consultation</h3>
            <p class="text-sm text-green-700">
              <span class="font-medium">Student:</span> {{ selectedBooking.student?.user?.firstName }} {{ selectedBooking.student?.user?.lastName }}
            </p>
            <p class="text-sm text-green-700">
              <span class="font-medium">Concern:</span> {{ selectedBooking.concern }}
            </p>
            <p class="text-sm text-green-700">
              <span class="font-medium">Status:</span> {{ selectedBooking.status }}
            </p>
          </div>
          
          <!-- Resolution Form -->
          <form @submit.prevent="submitResolution">
            <div class="mb-6">
              <label for="resolution" class="block text-sm font-medium text-gray-700 mb-2">
                Resolution Summary <span class="text-red-500">*</span>
              </label>
              <textarea
                id="resolution"
                v-model="resolutionForm.text"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                placeholder="Describe how the consultation concern was resolved, actions taken, and any follow-up recommendations..."
                required
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                This resolution will be recorded and the student will be notified.
              </p>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeResolutionModal"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submittingResolution || !resolutionForm.text.trim()"
                class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="submittingResolution">Resolving...</span>
                <span v-else>✅ Resolve Consultation</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
    
    <!-- Escalation Modal -->
    <Teleport to="body">
      <div v-if="showEscalationModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" style="z-index: 999999;" @click.self="closeEscalationModal">
        <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-2xl font-semibold text-gray-900">🚨 Escalate to Admin</h2>
            <button @click="closeEscalationModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Student Info -->
          <div v-if="selectedBooking" class="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
            <h3 class="text-sm font-medium text-red-800 mb-2">Escalating Consultation</h3>
            <p class="text-sm text-red-700">
              <span class="font-medium">Student:</span> {{ selectedBooking.student?.user?.firstName }} {{ selectedBooking.student?.user?.lastName }}
            </p>
            <p class="text-sm text-red-700">
              <span class="font-medium">Concern:</span> {{ selectedBooking.concern }}
            </p>
            <p class="text-sm text-red-700">
              <span class="font-medium">Status:</span> {{ selectedBooking.status }}
            </p>
          </div>
          
          <!-- Escalation Form -->
          <form @submit.prevent="submitEscalation">
            <div class="mb-6">
              <label for="escalationReason" class="block text-sm font-medium text-gray-700 mb-2">
                Escalation Reason <span class="text-red-500">*</span>
              </label>
              <textarea
                id="escalationReason"
                v-model="escalationForm.reason"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                placeholder="Describe why this consultation needs administrative intervention..."
                required
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                Explain why this consultation requires admin attention (e.g., serious concerns, need for additional resources, policy violations, etc.)
              </p>
            </div>
            
            <!-- Current Feedback Display -->
            <div v-if="selectedBooking?.feedback" class="mb-6 bg-gray-50 p-3 rounded-lg border">
              <h4 class="text-sm font-medium text-gray-800 mb-2">Current Feedback (will be included):</h4>
              <p class="text-sm text-gray-600">{{ selectedBooking.feedback }}</p>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeEscalationModal"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submittingEscalation || !escalationForm.reason.trim()"
                class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="submittingEscalation">Escalating...</span>
                <span v-else>🚨 Escalate to Admin</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
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
const currentView = ref('calendar')
const consultations = ref([])
const showDetailsModal = ref(false)
const selectedConsultation = ref(null)
const bookingFilter = ref('All')

// Feedback modal data
const showFeedbackModal = ref(false)
const selectedBooking = ref(null)
const submittingFeedback = ref(false)
const feedbackForm = ref({
  text: ''
})

// Escalation modal data
const showEscalationModal = ref(false)
const submittingEscalation = ref(false)
const escalationForm = ref({
  reason: ''
})

// Resolution modal data
const showResolutionModal = ref(false)
const submittingResolution = ref(false)
const resolutionForm = ref({
  text: ''
})

// Feedback modal mode ('normal' or 'escalation')
const feedbackModalMode = ref('normal')

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

// Computed
const activeBookings = computed(() => {
  if (!selectedConsultation.value) return []
  if (bookingFilter.value === 'All') {
    return selectedConsultation.value.bookings
  }
  return selectedConsultation.value.bookings.filter(booking => 
    booking.status === bookingFilter.value ||
    (bookingFilter.value === 'Active' && (booking.status === 'Pending' || booking.status === 'Confirmed'))
  )
})

const filteredBookings = computed(() => {
  if (!selectedConsultation.value) return []
  const list = selectedConsultation.value.bookings || []
  if (bookingFilter.value === 'All') {
    return list
  }
  return list.filter(b => b.status === bookingFilter.value)
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

// Format time range for HH:MM format (for allocated time slots)
const formatAllocatedTimeRange = (startTime, endTime) => {
  const formatTimeString = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }
  
  return `${formatTimeString(startTime)} - ${formatTimeString(endTime)}`
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

// Get color classes for adviser consultation blocks
const getAdviserConsultationColorClass = (consultation) => {
  switch (consultation.status) {
    case 'Active':
      return 'bg-green-200 text-green-800 hover:bg-green-300 border-green-300'
    case 'Full':
      return 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300 border-yellow-300'
    case 'Inactive':
      return 'bg-red-200 text-red-800 hover:bg-red-300 border-red-300'
    default:
      return 'bg-blue-200 text-blue-800 hover:bg-blue-300 border-blue-300'
  }
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
    console.log('Loading consultations for adviser:', authStore.user._id)
    const response = await api.get(`/consultations/adviser/${authStore.user._id}`)
    console.log('Consultation response:', response.data)
    consultations.value = response.data || []
    console.log('Loaded consultations:', consultations.value.length)
  } catch (error) {
    console.error('Error loading consultations:', error)
    notificationService.showError('Failed to load consultation schedule')
  } finally {
    loading.value = false
  }
}

// Feedback functions
const openFeedbackModal = (booking) => {
  selectedBooking.value = booking
  feedbackForm.value.text = booking.feedback || ''
  showFeedbackModal.value = true
}

const closeFeedbackModal = () => {
  showFeedbackModal.value = false
  selectedBooking.value = null
  feedbackForm.value.text = ''
  feedbackModalMode.value = 'normal'
  submittingFeedback.value = false
}

const submitFeedback = async () => {
  if (!selectedBooking.value || !feedbackForm.value.text.trim()) {
    return
  }
  
  try {
    submittingFeedback.value = true
    
    // If in escalation mode, submit feedback then escalate
    if (feedbackModalMode.value === 'escalation') {
      // First save the feedback
      await api.put(`/consultations/bookings/${selectedBooking.value._id}/feedback`, {
        feedback: feedbackForm.value.text.trim()
      })
      
      // Then escalate
      await api.post(`/consultations/bookings/${selectedBooking.value._id}/escalate`, {
        reason: 'Consultation escalated after feedback review'
      })
      
      notificationService.showSuccess('Feedback saved and consultation escalated to admin successfully')
      
      // Refresh consultations
      await loadConsultations()
      closeFeedbackModal()
      
    } else {
      // Normal feedback submission
      await api.put(`/consultations/bookings/${selectedBooking.value._id}/feedback`, {
        feedback: feedbackForm.value.text.trim()
      })
      
      notificationService.showSuccess('Feedback saved successfully')
      
      // Refresh consultations to get updated data
      await loadConsultations()
      
      // Update the selected consultation if it's open
      if (selectedConsultation.value) {
        const updatedConsultation = consultations.value.find(c => c._id === selectedConsultation.value._id)
        if (updatedConsultation) {
          selectedConsultation.value = updatedConsultation
        }
      }
      
      closeFeedbackModal()
    }
    
  } catch (error) {
    console.error('Error submitting feedback:', error)
    const message = error.response?.data?.message || 'Failed to save feedback'
    notificationService.showError(message)
  } finally {
    submittingFeedback.value = false
  }
}

// Escalation functions
const openEscalationModal = (booking) => {
  selectedBooking.value = booking
  escalationForm.value.reason = ''
  showEscalationModal.value = true
}

const closeEscalationModal = () => {
  showEscalationModal.value = false
  selectedBooking.value = null
  escalationForm.value.reason = ''
  submittingEscalation.value = false
}

const submitEscalation = async () => {
  if (!selectedBooking.value || !escalationForm.value.reason.trim()) {
    return
  }
  
  try {
    submittingEscalation.value = true
    
    await api.post(`/consultations/bookings/${selectedBooking.value._id}/escalate`, {
      reason: escalationForm.value.reason.trim()
    })
    
    notificationService.showSuccess('Consultation escalated to admin successfully')
    
    // Refresh consultations to get updated data
    await loadConsultations()
    
    // Update the selected consultation if it's open
    if (selectedConsultation.value) {
      const updatedConsultation = consultations.value.find(c => c._id === selectedConsultation.value._id)
      if (updatedConsultation) {
        selectedConsultation.value = updatedConsultation
      }
    }
    
    closeEscalationModal()
    
  } catch (error) {
    console.error('Error escalating consultation:', error)
    const message = error.response?.data?.message || 'Failed to escalate consultation'
    notificationService.showError(message)
  } finally {
    submittingEscalation.value = false
  }
}

// Additional feedback functions for escalation
const openFeedbackModalForEscalation = (booking) => {
  selectedBooking.value = booking
  feedbackForm.value.text = booking.feedback || ''
  feedbackModalMode.value = 'escalation'
  showFeedbackModal.value = true
}

// Resolution functions
const openResolutionModal = (booking) => {
  selectedBooking.value = booking
  resolutionForm.value.text = ''
  showResolutionModal.value = true
}

const closeResolutionModal = () => {
  showResolutionModal.value = false
  selectedBooking.value = null
  resolutionForm.value.text = ''
  submittingResolution.value = false
}

const submitResolution = async () => {
  if (!selectedBooking.value || !resolutionForm.value.text.trim()) {
    return
  }
  
  try {
    submittingResolution.value = true
    
    await api.post(`/consultations/bookings/${selectedBooking.value._id}/resolve`, {
      resolution: resolutionForm.value.text.trim()
    })
    
    notificationService.showSuccess('Consultation resolved successfully')
    
    // Refresh consultations to get updated data
    await loadConsultations()
    
    // Update the selected consultation if it's open
    if (selectedConsultation.value) {
      const updatedConsultation = consultations.value.find(c => c._id === selectedConsultation.value._id)
      if (updatedConsultation) {
        selectedConsultation.value = updatedConsultation
      }
    }
    
    closeResolutionModal()
    
  } catch (error) {
    console.error('Error resolving consultation:', error)
    const message = error.response?.data?.message || 'Failed to resolve consultation'
    notificationService.showError(message)
  } finally {
    submittingResolution.value = false
  }
}


// Lifecycle
onMounted(() => {
  loadConsultations()
})
</script> 

<style scoped>
.min-h-80px {
  min-height: 80px;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>