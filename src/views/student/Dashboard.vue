<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-normal text-gray-800">Good day, {{ userName }}</h1>
          <div class="flex items-center space-x-4 mt-2">
            <div v-if="currentClass" class="text-sm text-gray-600">
              <span class="font-medium">{{ currentClass.subject }}</span> - {{ currentClass.section }}
            </div>
            <div v-if="currentClass?.yearLevel" class="text-sm text-gray-600">
              <span class="font-medium">{{ currentClass.yearLevel }} Year</span>
            </div>
            <div v-if="currentClass?.major" class="text-sm text-gray-600">
              <span class="font-medium">{{ currentClass.major }}</span>
            </div>
            <div v-if="currentSemester" class="text-sm text-gray-600">
              <span class="font-medium">{{ currentSemester }} Semester</span>
            </div>
            <div v-if="currentSchoolYear" class="text-sm text-gray-600">
              <span class="font-medium">{{ currentSchoolYear }}</span>
            </div>
          </div>
          <p class="text-gray-500 mt-1 font-normal">Your SSP compliance monitoring</p>
        </div>
        <div class="text-right bg-gray-50 rounded-lg p-4 ring-1 ring-gray-200">
          <div class="text-xs text-gray-500 uppercase tracking-wide">Student ID</div>
          <div class="text-lg font-normal text-gray-800">{{ userIdNumber }}</div>
        </div>
      </div>
    </div>
    
    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Active Consultation -->
      <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Active</span>
        </div>
        <div class="text-xl font-normal text-gray-800">{{ dashboardStats.activeConsultations }}</div>
        <p class="text-xs text-gray-500 mb-3">Active Consultations</p>
        <router-link to="/student/consultations" class="text-sm text-blue-600 hover:text-blue-700 font-normal">
          View Consultations →
        </router-link>
      </div>
      
      <!-- SSP Sessions -->
      <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
            <svg class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span class="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">SSP</span>
        </div>
        <div class="text-xl font-normal text-gray-800">{{ dashboardStats.totalSSPSessions }}</div>
        <p class="text-xs text-gray-500 mb-3">Total Sessions</p>
        <router-link to="/student/ssp" class="text-sm text-blue-600 hover:text-blue-700 font-normal">
          View SSP →
        </router-link>
      </div>
        
      <!-- M&M Submissions -->
      <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
            <svg class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700 ring-1 ring-purple-200">M&M</span>
        </div>
        <div class="text-xl font-normal text-gray-800">{{ dashboardStats.currentMMPeriod }}</div>
        <p class="text-xs text-gray-500 mb-3">Current M&M Period</p>
        <router-link to="/student/surveys" class="text-sm text-blue-600 hover:text-blue-700 font-normal">
          Submit M&M →
        </router-link>
      </div>
    
      <!-- Notifications -->
      <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
            <svg class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <span class="inline-flex items-center px-2 py-0.5 text-xs rounded-full" :class="dashboardStats.unreadNotifications > 0 ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'">{{ dashboardStats.unreadNotifications > 0 ? 'Unread' : 'None' }}</span>
        </div>
        <div class="text-xl font-normal text-gray-800">{{ dashboardStats.unreadNotifications }}</div>
        <p class="text-xs text-gray-500 mb-3">Unread Notifications</p>
        <router-link to="/student/notifications" class="text-sm text-blue-600 hover:text-blue-700 font-normal">
          View Notifications →
        </router-link>
      </div>
    </div>
    
    <!-- SSP Session Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Current Progress -->
      <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <h3 class="text-base font-medium text-gray-800 mb-4">SSP Progress</h3>
        <div class="text-center">
          <div class="relative w-24 h-24 mx-auto mb-4">
            <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <!-- Background circle -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                stroke-width="8"
              />
              <!-- Progress circle -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3b82f6"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="251.2"
                :stroke-dashoffset="251.2 - (251.2 * sspOverview.currentProgress / 100)"
                class="transition-all duration-300"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xl font-bold text-gray-900">{{ sspOverview.currentProgress }}%</span>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-2">{{ dashboardStats.completedSSPSessions }} of {{ dashboardStats.totalSSPSessions }} sessions completed</p>
          <p class="text-xs text-blue-600 font-normal">{{ sspOverview.currentSemester }}</p>
        </div>
      </div>
      
      <!-- Next Session -->
      <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <h3 class="text-base font-medium text-gray-800 mb-4">Next Session</h3>
        <div v-if="sspOverview.nextSession" class="text-center">
          <div class="bg-green-100 p-4 rounded-lg mb-3">
            <div class="text-2xl font-bold text-green-800 mb-1">Day {{ sspOverview.nextSession.day }}</div>
            <p class="text-sm text-green-600 font-medium">{{ sspOverview.nextSession.title }}</p>
          </div>
          <router-link to="/student/ssp" class="inline-flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-normal">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
            View Session Details
          </router-link>
        </div>
        <div v-else class="text-center">
          <div class="bg-gray-100 p-4 rounded-lg mb-3">
            <div class="text-2xl font-bold text-gray-500 mb-1">🎉</div>
            <p class="text-sm text-gray-600 font-medium">All sessions completed!</p>
          </div>
          <router-link to="/student/ssp" class="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-normal">
            View All Sessions
          </router-link>
        </div>
      </div>
      
      <!-- Recent Completed -->
      <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <h3 class="text-base font-medium text-gray-800 mb-4">Recent Completed</h3>
        <div v-if="sspOverview.recentCompleted.length > 0" class="space-y-3">
          <div v-for="session in sspOverview.recentCompleted" :key="session.day" class="flex items-center space-x-3">
            <div class="bg-blue-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">Day {{ session.day }}</p>
              <p class="text-xs text-gray-500">{{ session.title }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(session.completedAt) }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center">
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-sm text-gray-600">No completed sessions yet</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Access: Consultation Schedule & Recent Notifications -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Consultation Schedule -->
      <div class="bg-white rounded-xl shadow-md ring-1 ring-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M6 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75z"/>
                </svg>
              </div>
              <h2 class="text-lg font-medium text-gray-800">Weekly Schedule</h2>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-xs text-gray-500">Monday - Friday | 7:00 AM - 5:00 PM</div>
              <router-link 
                to="/student/consultations" 
                class="px-2 py-1 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              >View All</router-link>
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
      
        <div class="p-6">
          <div v-if="loadingConsultations" class="flex items-center justify-center h-32">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
          <div v-else-if="consultationSchedule.length === 0" class="text-center py-6">
            <div class="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 715.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            </div>
            <h3 class="text-sm font-normal text-gray-800 mb-1">No consultations scheduled</h3>
            <p class="text-xs text-gray-500">Consultation schedules will appear here</p>
          </div>
          <div v-else class="space-y-4">
             <!-- Compact Calendar Grid -->
            <div class="bg-white rounded-xl border border-gray-200">
              <!-- Calendar Grid Header -->
              <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
                <div class="py-2 px-1 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
                <div v-for="day in weekDays" :key="day" 
                     class="py-2 px-1 text-gray-500 text-xs font-medium text-center">
                  {{ day }}
                </div>
              </div>
              
              <!-- Calendar Grid Body -->
              <div class="relative">
                <div class="divide-y divide-gray-200">
                  <div v-for="(timeSlot, index) in formattedTimeSlots" :key="index" class="grid grid-cols-6">
                    <!-- Time Label -->
                    <div class="py-1 px-1 text-xs font-normal text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center min-h-[40px]">
                      <span class="text-center leading-tight">{{ timeSlot }}</span>
                    </div>
                    
                    <!-- Day Columns -->
                    <div 
                      v-for="(day, dayIndex) in weekDays" 
                      :key="`${day}-${index}`"
                      class="relative p-0 min-h-[40px] border-r border-gray-100"
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
                  @click="openConsultationModal(consultationBlock.consultation)"
                >
                  <div class="font-normal text-xs truncate p-1">
                    {{ consultationBlock.consultation.adviser.firstName }} {{ consultationBlock.consultation.adviser.lastName }}
                  </div>
                  <div class="text-xs flex flex-col justify-between px-1 pb-1 flex-grow">
                    <span class="truncate font-normal">Consultation</span>
                    <div class="mt-1 flex flex-col">
                      <span class="rounded-full px-1 py-0.5 bg-white bg-opacity-40 text-xs mt-1 inline-block w-max">
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
          </div>
        </div>
      </div>
      
      <!-- Recent Notifications -->
      <div class="bg-white rounded-xl shadow-md ring-1 ring-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
              </div>
              <h2 class="text-lg font-medium text-gray-800">Recent Notifications</h2>
            </div>
          <router-link 
              to="/student/notifications" 
              class="px-2 py-1 text-xs font-normal text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
            >View All</router-link>
          </div>
        </div>
        <div class="p-6">
          
          <div v-if="loadingNotifications" class="flex items-center justify-center h-32">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
          </div>
          <div v-else-if="recentNotifications.length === 0" class="text-center py-6">
            <div class="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            </div>
            <h3 class="text-sm font-normal text-gray-800 mb-1">No notifications</h3>
            <p class="text-xs text-gray-500">You're all caught up!</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="notification in recentNotifications.slice(0, 5)" :key="notification._id" 
                 class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ notification.title }}</p>
                <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ notification.message }}</p>
                <p class="text-xs text-gray-500 mt-2">{{ formatDate(notification.createdAt) }}</p>
              </div>
              <div v-if="!notification.read" class="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Latest Announcements -->
    <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-medium text-gray-800">Latest Announcements</h3>
        <router-link to="/student/announcements" class="text-blue-600 hover:text-blue-700 text-sm font-normal">
          View All →
        </router-link>
      </div>
      
      <div class="space-y-4">
        <div v-for="announcement in latestAnnouncements" :key="announcement._id" class="border-l-4 border-blue-500 pl-4">
          <h4 class="font-medium text-gray-900">{{ announcement.title }}</h4>
          <p class="text-sm text-gray-600 mt-1" v-html="truncateText(announcement.content, 150)"></p>
          <p class="text-xs text-gray-500 mt-2">{{ formatDate(announcement.createdAt) }}</p>
        </div>
        
        <div v-if="latestAnnouncements.length === 0" class="text-center py-4">
          <p class="text-gray-500 text-sm">No announcements available</p>
        </div>
      </div>
    </div>
    </div>
  </div>

  <!-- Consultation Modal -->
  <div v-if="showConsultationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeConsultationModal">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-800">Consultation Details</h3>
        <button @click="closeConsultationModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div v-if="selectedConsultation" class="p-4 space-y-3">
        <div>
          <span class="text-sm font-medium text-gray-700">Adviser:</span>
          <span class="ml-2 text-sm text-gray-900">{{ selectedConsultation.adviser?.firstName }} {{ selectedConsultation.adviser?.lastName }}</span>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-700">Time:</span>
          <span class="ml-2 text-sm text-gray-900">{{ formatTimeSlot(selectedConsultation.startTime) }} - {{ formatTimeSlot(selectedConsultation.endTime) }}</span>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-700">Day:</span>
          <span class="ml-2 text-sm text-gray-900">{{ getDayName(selectedConsultation.dayOfWeek) }}</span>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-700">Available Slots:</span>
          <span class="ml-2 text-sm text-gray-900">{{ (selectedConsultation.maxStudents || 0) - (selectedConsultation.bookedStudents || 0) }}/{{ selectedConsultation.maxStudents || 0 }}</span>
        </div>
        <div class="pt-2">
          <router-link 
            :to="`/student/consultations`" 
            class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Book Consultation
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { notificationService } from '../../services/notificationService'
import { sessionService } from '../../services/sessionService'
import { studentService } from '../../services/studentService'
import { mmService } from '../../services/midtermFinalsService'
import api from '../../services/api'

const authStore = useAuthStore()

// Reactive data
const dashboardStats = ref({
  activeConsultations: 0,
  completedSSPSessions: 0,
  totalSSPSessions: 0,
  unreadNotifications: 0,
  currentMMPeriod: 'P1', // P1, P2, or P3
  mmSubmissions: []
})

const latestAnnouncements = ref([])
const currentSSPSession = ref(null)
const sspOverview = ref({
  currentProgress: 0,
  nextSession: null,
  currentSemester: '1st Semester',
  recentCompleted: []
})

// Class and semester information
const currentClass = ref(null)
const currentSemester = ref('')
const currentSchoolYear = ref('')

// Consultation timetable data
const consultationSchedule = ref([])
const loadingConsultations = ref(false)
const showConsultationModal = ref(false)
const selectedConsultation = ref(null)

// Time slots for the calendar (7 AM to 5 PM)
const timeSlots = ref([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17])

// Week days for the calendar
const weekDays = ref(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])

// Formatted time slots for display
const formattedTimeSlots = computed(() => {
  return timeSlots.value.map(time => {
    const hour = time
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:00 ${ampm}`
  })
})

// Notifications data
const recentNotifications = ref([])
const loadingNotifications = ref(false)

// Computed
const userName = computed(() => {
  if (!authStore.user) return 'Student'
  return `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`.trim()
})

const userIdNumber = computed(() => {
  return authStore.user?.idNumber || 'N/A'
})

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  
  return date.toLocaleDateString()
}

const truncateText = (text, length) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const formatTimeSlot = (time) => {
  if (!time) return ''
  
  let hour
  if (typeof time === 'number') {
    hour = time
  } else if (typeof time === 'string') {
    const [hours] = time.split(':')
    hour = parseInt(hours)
  } else {
    return ''
  }
  
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${ampm}`
}

const formatTimeRange = (start, end) => {
  // Handle both number and string inputs
  let startHour, endHour
  
  if (typeof start === 'number') {
    startHour = start
  } else if (typeof start === 'string' && start.includes(':')) {
    startHour = parseInt(start.split(':')[0])
  } else if (typeof start === 'string') {
    startHour = parseInt(start)
  } else {
    startHour = 0
  }
  
  if (typeof end === 'number') {
    endHour = end
  } else if (typeof end === 'string' && end.includes(':')) {
    endHour = parseInt(end.split(':')[0])
  } else if (typeof end === 'string') {
    endHour = parseInt(end)
  } else {
    endHour = 0
  }
  
  // Format time display
  const startAMPM = startHour >= 12 ? 'PM' : 'AM'
  const endAMPM = endHour >= 12 ? 'PM' : 'AM'
  const startDisplay = startHour > 12 ? startHour - 12 : startHour === 0 ? 12 : startHour
  const endDisplay = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour
  
  return `${startDisplay}:00 ${startAMPM} - ${endDisplay}:00 ${endAMPM}`
}

const openConsultationModal = (consultation) => {
  selectedConsultation.value = consultation
  showConsultationModal.value = true
}

const closeConsultationModal = () => {
  showConsultationModal.value = false
  selectedConsultation.value = null
}

const loadConsultationSchedule = async () => {
  loadingConsultations.value = true
  try {
    console.log('Loading consultation schedule...')
    
    // Use the same endpoint as the book consultation page
    const response = await api.get('/consultations/available/all')
    console.log('API Response:', response)
    
    if (response.data && Array.isArray(response.data)) {
      consultationSchedule.value = response.data
      console.log('Raw consultation data:', consultationSchedule.value)
      
      // Log the structure of the first consultation if available
      if (consultationSchedule.value.length > 0) {
        console.log('First consultation structure:', {
          _id: consultationSchedule.value[0]._id,
          adviser: consultationSchedule.value[0].adviser,
          dayOfWeek: consultationSchedule.value[0].dayOfWeek,
          startTime: consultationSchedule.value[0].startTime,
          endTime: consultationSchedule.value[0].endTime,
          bookedStudents: consultationSchedule.value[0].bookedStudents,
          maxStudents: consultationSchedule.value[0].maxStudents,
          type: typeof consultationSchedule.value[0].startTime
        })
      }
    } else {
      console.log('No consultation data or invalid format:', response.data)
      // Add sample data temporarily for testing
      consultationSchedule.value = [
        {
          _id: 'sample1',
          adviser: { firstName: 'Dr. Smith', lastName: 'Johnson' },
          dayOfWeek: 0, // Monday
          startTime: 7,
          endTime: 10,
          bookedStudents: 2,
          maxStudents: 5
        },
        {
          _id: 'sample2',
          adviser: { firstName: 'Prof. Maria', lastName: 'Garcia' },
          dayOfWeek: 2, // Wednesday
          startTime: 10,
          endTime: 13,
          bookedStudents: 4,
          maxStudents: 5
        }
      ]
      console.log('Using sample data:', consultationSchedule.value)
    }
    
  } catch (error) {
    console.error('Error loading consultation schedule:', error)
    console.error('Error details:', error.response?.data || error.message)
    
    // Add sample data on error for testing
    consultationSchedule.value = [
      {
        _id: 'sample1',
        adviser: { firstName: 'Dr. Smith', lastName: 'Johnson' },
        dayOfWeek: 0, // Monday
        startTime: 7,
        endTime: 10,
        bookedStudents: 2,
        maxStudents: 5
      },
      {
        _id: 'sample2',
        adviser: { firstName: 'Prof. Maria', lastName: 'Garcia' },
        dayOfWeek: 2, // Wednesday
        startTime: 10,
        endTime: 13,
        bookedStudents: 4,
        maxStudents: 5
      }
    ]
    
    console.log('Using sample data due to error:', consultationSchedule.value)
  } finally {
    loadingConsultations.value = false
  }
}

const loadRecentNotifications = async () => {
  loadingNotifications.value = true
  try {
    console.log('Loading recent notifications...')
    
    // Use the correct endpoint for notifications
    const response = await api.get('/notifications')
    console.log('Notifications API response:', response)
    
    if (response.data && Array.isArray(response.data)) {
      recentNotifications.value = response.data
      console.log('Raw notifications data:', recentNotifications.value)
    } else {
      console.log('No notifications data or invalid format:', response.data)
      // Use sample data for demonstration
      recentNotifications.value = []
    }
    
    // No mock data - just use empty array if no notifications
    
    console.log('Recent notifications loaded:', recentNotifications.value)
  } catch (error) {
    console.error('Error loading recent notifications:', error)
    console.error('Error details:', error.response?.data || error.message)
    
    // No mock data on error - just use empty array
    recentNotifications.value = []
  } finally {
    loadingNotifications.value = false
  }
}

// Helper functions for consultation data
const getDayName = (dayOfWeek) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  return days[dayOfWeek] || 'Unknown'
}

const formatTimeForDisplay = (time) => {
  if (typeof time === 'number') {
    const hours = time.toString().padStart(2, '0')
    return `${hours}:00`
  } else if (typeof time === 'string') {
    return time
  }
  return '00:00'
}

const loadDashboardStats = async () => {
  try {
    // Load consultation stats
    const consultationResponse = await api.get('/consultations/my-bookings')
    const consultations = consultationResponse.data || []
    dashboardStats.value.activeConsultations = consultations.filter(
      booking => booking.status === 'Pending' || booking.status === 'Confirmed'
    ).length

    // Load SSP session stats and overview using proper service
    try {
      const studentResponse = await studentService.getStudentDetails()
      const student = studentResponse.data
      
      if (student && student.class) {
        console.log('Loading SSP dashboard data for student:', student._id, 'class:', student.class._id)
        
        // Set class information
        currentClass.value = {
          subject: student.class.subject?.name || 'SSP',
          section: student.class.section || '',
          yearLevel: student.class.yearLevel || '',
          major: student.class.major || ''
        }
        
        // Set semester and school year information
        currentSemester.value = student.class.semester || ''
        currentSchoolYear.value = student.class.schoolYear || ''
        
        // Use the new dedicated SSP dashboard function for proper progress calculation
        const sspDashboard = await sessionService.getSSPDashboardData(student._id, student.class._id)
        
        if (sspDashboard) {
          sspOverview.value = sspDashboard
          dashboardStats.value.completedSSPSessions = sspDashboard.completedSessions || 0
          dashboardStats.value.totalSSPSessions = sspDashboard.totalSessions || 0
          
          // Calculate current progress percentage
          if (sspDashboard.totalSessions > 0) {
            sspOverview.value.currentProgress = Math.round((sspDashboard.completedSessions / sspDashboard.totalSessions) * 100)
          }
          
          console.log('SSP Dashboard Data loaded:', sspDashboard)
        }
      } else {
        dashboardStats.value.completedSSPSessions = 0
        dashboardStats.value.totalSSPSessions = 0
        currentClass.value = null
        currentSemester.value = ''
        currentSchoolYear.value = ''
      }
    } catch (sspError) {
      console.log('SSP sessions not available:', sspError)
      dashboardStats.value.completedSSPSessions = 0
      dashboardStats.value.totalSSPSessions = 0
    }

    // Load M&M submissions and current semester info
    try {
      // First get the current class semester to ensure we have the latest info
      const semesterResponse = await mmService.getCurrentClassSemester()
      console.log('Current M&M semester response:', semesterResponse)
      
      if (semesterResponse && semesterResponse.semester) {
        dashboardStats.value.currentMMPeriod = semesterResponse.semester === '1st' ? 'P1' : 'P2'
        console.log('Updated M&M period to:', dashboardStats.value.currentMMPeriod, 'based on semester:', semesterResponse.semester)
      }
      
      // Get M&M completion status
      const mmResponse = await mmService.getMySubmissions()
      const submissions = mmResponse.data || []
      
      dashboardStats.value.mmSubmissions = submissions
      console.log('M&M submissions loaded:', submissions.length, 'submissions')
      
    } catch (mmError) {
      console.log('M&M data not available:', mmError)
      dashboardStats.value.currentMMPeriod = 'P1'
      dashboardStats.value.mmSubmissions = []
    }

    // Load notification count
    try {
      const notificationResponse = await notificationService.getUnreadCount()
      dashboardStats.value.unreadNotifications = notificationResponse || 0
    } catch (notifError) {
      console.log('Notifications not available:', notifError)
      dashboardStats.value.unreadNotifications = 0
    }

    console.log('Dashboard stats loaded:', dashboardStats.value)
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
  }
}

const loadLatestAnnouncements = async () => {
  try {
    const response = await api.get('/announcements')
    // The API returns the announcements directly as an array
    latestAnnouncements.value = (response.data || []).slice(0, 3)
  } catch (error) {
    console.error('Error loading announcements:', error)
  }
}

const getPositionedConsultationBlocks = () => {
  const blocks = []
  const timeSlotHeight = 40 // Height of each time slot in pixels
  
  console.log('Positioning consultation blocks:', consultationSchedule.value)
  
  if (!consultationSchedule.value || !Array.isArray(consultationSchedule.value)) {
    console.log('No consultation data to position')
    return blocks
  }
  
  consultationSchedule.value.forEach((consultation, index) => {
    console.log(`Processing consultation ${index}:`, consultation)
    
    // Validate consultation object
    if (!consultation || typeof consultation !== 'object') {
      console.log('Invalid consultation object:', consultation)
      return
    }
    
    // Safely extract values with fallbacks
    const dayIndex = consultation.dayOfWeek || 0
    let startHour, endHour
    
    try {
      if (typeof consultation.startTime === 'number') {
        startHour = consultation.startTime
      } else if (consultation.startTime && typeof consultation.startTime === 'string' && consultation.startTime.includes(':')) {
        startHour = parseInt(consultation.startTime.split(':')[0])
      } else if (consultation.startTime && typeof consultation.startTime === 'string') {
        startHour = parseInt(consultation.startTime)
      } else {
        startHour = 7 // Default to 7 AM if no valid start time
      }
      
      if (typeof consultation.endTime === 'number') {
        endHour = consultation.endTime
      } else if (consultation.endTime && typeof consultation.endTime === 'string' && consultation.endTime.includes(':')) {
        endHour = parseInt(consultation.endTime.split(':')[0])
      } else if (consultation.endTime && typeof consultation.endTime === 'string') {
        endHour = parseInt(consultation.endTime)
      } else {
        endHour = startHour + 1 // Default to 1 hour duration if no valid end time
      }
      
      // Validate hours
      if (isNaN(startHour) || isNaN(endHour)) {
        console.log('Invalid hours:', startHour, endHour)
        startHour = 7
        endHour = 8
      }
      
    } catch (error) {
      console.error('Error parsing consultation time:', error, consultation)
      startHour = 7
      endHour = 8
    }
    
    console.log('Day index:', dayIndex, 'Start hour:', startHour, 'End hour:', endHour)
    
    // Find the time slot index
    const timeSlotIndex = timeSlots.value.findIndex(time => time === startHour)
    console.log('Time slot index:', timeSlotIndex)
    
    if (timeSlotIndex === -1) {
      console.log('Time slot not found for hour:', startHour, 'Available slots:', timeSlots.value)
      return
    }
    
    const top = timeSlotIndex * timeSlotHeight
    const height = Math.max((endHour - startHour) * timeSlotHeight, timeSlotHeight) // Minimum height of 1 time slot
    
    console.log('Positioning block at top:', top, 'height:', height)
    
    blocks.push({
      consultation,
      dayIndex,
      top,
      height
    })
  })
  
  console.log('Final positioned blocks:', blocks)
  return blocks
}

const getConsultationCardClass = (consultation) => {
  // Handle both the backend structure (bookedStudents) and fallback
  const booked = consultation.bookedStudents || 0
  const max = consultation.maxStudents || 1
  const available = max - booked
  
  console.log('Consultation card class calculation:', {
    booked,
    max,
    available,
    consultation: consultation._id
  })
  
  if (available === 0) {
    return 'bg-blue-100 border-blue-300 text-blue-800' // Already Booked
  } else if (available <= 1) {
    return 'bg-orange-100 border-orange-300 text-orange-800' // Time Conflict (limited)
  } else if (available > 1) {
    return 'bg-green-100 border-green-300 text-green-800' // Available
  } else {
    return 'bg-gray-100 border-gray-300 text-gray-800' // Not Available
  }
}

// Lifecycle
onMounted(async () => {
  await loadDashboardStats()
  await loadLatestAnnouncements()
  await loadConsultationSchedule()
  await loadRecentNotifications()
})
</script>

<style scoped>
/* Additional styling if needed */
</style> 