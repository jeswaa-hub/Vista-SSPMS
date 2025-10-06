<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-8">
      
      <!-- Greeting Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
      <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-normal text-gray-800">{{ getGreeting() }}, Admin</h1>
            <p class="text-gray-500 mt-1 font-normal">System overview and student reports</p>
        </div>
          <div class="grid grid-cols-4 gap-6">
            <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <div class="text-2xl font-semibold text-gray-800">{{ dashboardStats.totalStudents }}</div>
              <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Students</div>
          </div>
            <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <div class="text-2xl font-semibold text-gray-800">{{ adminReports.length }}</div>
              <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Reports</div>
          </div>
            <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <div class="text-2xl font-semibold text-gray-800">{{ dashboardStats.totalAdvisers }}</div>
              <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Advisers</div>
          </div>
            <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <div class="text-2xl font-semibold text-gray-800">{{ dashboardStats.totalConsultations }}</div>
              <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Consultations</div>
          </div>
        </div>
      </div>
    </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Student Reports Section -->
      <div v-else class="space-y-8 mb-8">
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h1.372c.516 0 .966.351 1.091.852l1.106 4.423a2.25 2.25 0 01-1.173 1.417l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a2.25 2.25 0 011.417-1.173l4.423-1.106c.5-.125.852-.575.852-1.091V12A2.25 2.25 0 0119.5 9.75h-1.5a2.25 2.25 0 00-2.25 2.25v.75m-7.5 0h7.5m-7.5 0v-1.5a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25v1.5m-7.5 0h7.5"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800">
                Student Reports Today | {{ formatDateWithoutYear(currentViewDate) }}
              </h2>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex space-x-2">
                <span class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  {{ reportsSummary.session_submission.count }} Session Issues
                </span>
                <span class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                  {{ reportsSummary.enrollment_risk.count }} Enrollment Risk
                </span>
                <span class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200">
                  {{ reportsSummary.consultation_escalation.count }} Escalations
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <button 
                  @click="viewPreviousDay"
                  :disabled="isAtToday"
                  :class="isAtToday ? 'p-2 text-gray-300 cursor-not-allowed rounded-lg' : 'p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'"
                  :title="isAtToday ? 'Previous Day (Already at today)' : 'Previous Day'"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button 
                  @click="viewNextDay"
                  class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Next Day"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
        </div>
        
        <!-- Filters -->
        <div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div class="flex flex-wrap gap-3">
            <div class="flex items-center space-x-2">
              <label class="text-xs font-medium text-gray-700">Year:</label>
              <select v-model="reportFilters.yearLevel" @change="filterReports" class="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Years</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
          </select>
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-xs font-medium text-gray-700">Section:</label>
              <select v-model="reportFilters.section" @change="filterReports" class="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Sections</option>
                <option v-for="section in availableSections" :key="section" :value="section">{{ section }}</option>
              </select>
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-xs font-medium text-gray-700">Major:</label>
              <select v-model="reportFilters.major" @change="filterReports" class="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Majors</option>
                <option v-for="major in availableMajors" :key="major" :value="major">{{ major }}</option>
              </select>
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-xs font-medium text-gray-700">Issue:</label>
              <select v-model="reportFilters.issueType" @change="filterReports" class="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Issues</option>
                <option value="session_submission">Session Issues</option>
                <option value="enrollment_risk">Enrollment Risk</option>
                <option value="consultation_escalation">Escalations</option>
              </select>
            </div>
            <button 
              @click="clearReportFilters"
              class="px-3 py-1 text-xs font-normal text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
        <div class="p-6">
          <div v-if="adminReports.length === 0" class="text-center py-12">
            <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-base font-normal text-gray-800 mb-1">No active reports</h3>
            <p class="text-gray-500 font-normal">All students are performing well</p>
        </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adviser</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
               <tbody class="divide-y divide-gray-200">
                 <tr v-if="reportsForToday.length === 0">
                   <td colspan="5" class="px-4 py-12 text-center">
                     <div class="flex flex-col items-center">
                       <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                         <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-12h-6m0 0l-2-2m2 2l2-2m0-7V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v1.5L6 3a1 1 0 0 0-1 1v1.5H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1" />
                       </svg>
                       <h3 class="text-lg font-medium text-gray-900 mb-2">No reports today</h3>
                       <p class="text-gray-500">There are no student reports scheduled for {{ formatDateWithoutYear(currentViewDate) }}.</p>
                     </div>
                   </td>
                 </tr>
                 <tr v-for="report in reportsForToday" :key="report._id" class="hover:bg-gray-50">
                  <td class="px-4 py-4">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span class="text-sm font-normal text-gray-600">
                          {{ report.student?.user?.firstName?.charAt(0) }}{{ report.student?.user?.lastName?.charAt(0) }}
                        </span>
            </div>
        <div>
                        <div class="text-sm font-normal text-gray-800">
                          {{ report.student?.user?.firstName }} {{ report.student?.user?.lastName }}
          </div>
                        <div class="text-xs text-gray-500">{{ report.student?.user?.idNumber }}</div>
          </div>
        </div>
                  </td>
                  <td class="px-4 py-4">
                    <span 
                      class="inline-flex px-2 py-1 text-xs font-normal rounded-md"
                      :class="{
                        'bg-amber-50 text-amber-700 border border-amber-200': report.issueType === 'session_submission',
                        'bg-red-50 text-red-700 border border-red-200': report.issueType === 'enrollment_risk',
                        'bg-gray-50 text-gray-700 border border-gray-200': report.issueType === 'consultation_escalation'
                      }"
                    >
                      {{ getIssueTypeLabel(report.issueType) }}
                    </span>
                  </td>
                  <td class="px-4 py-4">
                    <div class="text-sm text-gray-800 max-w-xs">{{ report.description }}</div>
                    <div class="text-xs text-gray-500 mt-1">
                      <span v-if="report.semester" class="mr-2">
                        {{ report.semester }} Semester
                      </span>
                      <span v-if="report.triggerData.sessionNotificationCount">
                        {{ report.triggerData.sessionNotificationCount }} reminders
                      </span>
                      <span v-if="report.triggerData.mmNotificationCount">
                        {{ report.triggerData.mmNotificationCount }} {{ report.triggerData.mmType }} reminders
                      </span>
                      <span v-if="report.triggerData.escalationReason">
                        Escalated - {{ report.triggerData.concern }}
                      </span>
      </div>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-800">
                    {{ report.adviser?.firstName }} {{ report.adviser?.lastName }}
                  </td>
                  <td class="px-4 py-4 text-right">
                    <div class="flex items-center justify-end space-x-2">
                      <button 
                        @click="openContactModal(report.student)"
                        class="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        title="Contact Student"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                      </button>
                      <button 
                        @click="openReportModal(report)"
                        class="px-3 py-1.5 text-xs font-normal text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                      >
                        Review
                      </button>
                      <button 
                        @click="resolveReport(report._id)"
                        class="px-3 py-1.5 text-xs font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100"
                      >
                        Resolve
                      </button>
            </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>
        </div>

        <!-- Quick Access Section -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M6 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75z"/>
                </svg>
              </div>
              <h2 class="text-lg font-medium text-gray-800">Quick Access</h2>
            </div>
            <div class="text-xs text-gray-500">Calendar View</div>
          </div>
        </div>
        <div class="p-6">
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Classes Calendar (mini) -->
            <div class="border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div class="text-sm font-medium text-gray-800">Classes Schedule</div>
                <router-link 
                  to="/admin/classes" 
                  class="px-2 py-1 text-xs font-normal text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                >View All</router-link>
              </div>
              <div class="p-4">
                <div v-if="loadingClasses" class="flex items-center justify-center h-64">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
                <div v-else-if="recentClasses.length === 0" class="text-center py-8">
                  <div class="w-10 h-10 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
                    </svg>
                  </div>
                  <h3 class="text-sm font-normal text-gray-800 mb-1">No classes scheduled</h3>
                  <p class="text-xs text-gray-500">Class schedules will appear here</p>
                </div>
                <div v-else class="bg-white rounded-lg border border-gray-200">
                  <div class="relative">
                    <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
                      <div class="py-2 px-1 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
                      <div v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']" :key="day" 
                           class="py-2 px-1 text-gray-500 text-xs font-medium text-center">
                        {{ day }}
                      </div>
                    </div>
                  </div>
                  <div class="relative">
                    <div class="divide-y divide-gray-200" :style="{ height: `${dashboardTimeSlots.length * ROW_HEIGHT_DASHBOARD}px` }">
                      <div v-for="(timeSlot, index) in dashboardTimeSlots" :key="index" class="grid grid-cols-6">
                        <div class="py-1 px-1 text-xs font-normal text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center min-h-[30px]">
                          <span class="text-center leading-tight text-xs">{{ formatTimeSlot(timeSlot) }}</span>
                        </div>
                        <div v-for="(day, dayIndex) in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day" 
                             class="relative p-0 min-h-[30px] border-r border-gray-100">
                          <div class="absolute inset-0 grid grid-rows-2 pointer-events-none">
                            <div class="border-b border-gray-100"></div>
                            <div></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div 
                      v-for="(classBlock, index) in getPositionedDashboardClassBlocks()" 
                      :key="index"
                      class="absolute rounded-sm text-xs bg-opacity-90 cursor-pointer overflow-hidden z-10 shadow-sm flex flex-col border"
                      :class="getDashboardClassColorClasses(classBlock.class)"
                      :style="{
                        left: `calc(${classBlock.dayIndex * 16.67}% + 16.67% + 1px)`, 
                        top: `${classBlock.top}px`,
                        height: `${classBlock.height}px`,
                        width: 'calc(16.67% - 2px)'
                      }"
                      @click="openClassModal(classBlock.class)"
                    >
                      <div class="font-normal text-xs truncate p-1">{{ getDashboardClassName(classBlock.class) }}</div>
                      <div class="text-xs flex flex-col justify-between px-1 pb-1 flex-grow">
                        <span class="truncate font-normal text-xs">{{ getDashboardClassSubject(classBlock.class) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Consultations Calendar (mini) -->
            <div class="border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div class="text-sm font-medium text-gray-800">Consultations Schedule</div>
                <router-link 
                  to="/admin/consultations" 
                  class="px-2 py-1 text-xs font-normal text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                >View All</router-link>
              </div>
              <div class="p-4">
                <div v-if="loadingConsultations" class="flex items-center justify-center h-64">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
                <div v-else-if="recentConsultations.length === 0" class="text-center py-8">
                  <div class="w-10 h-10 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 715.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                  <h3 class="text-sm font-normal text-gray-800 mb-1">No consultations scheduled</h3>
                  <p class="text-xs text-gray-500">Consultation schedules will appear here</p>
                </div>
                <div v-else class="bg-white rounded-lg border border-gray-200">
                  <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
                    <div class="py-2 px-1 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
                    <div v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']" :key="day" 
                         class="py-2 px-1 text-gray-500 text-xs font-medium text-center">
                      {{ day }}
                    </div>
                  </div>
                  <div class="relative">
                    <div class="divide-y divide-gray-200" :style="{ height: `${dashboardTimeSlots.length * ROW_HEIGHT_DASHBOARD}px` }">
                      <div v-for="(timeSlot, index) in dashboardTimeSlots" :key="index" class="grid grid-cols-6">
                        <div class="py-1 px-1 text-xs font-normal text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center min-h-[30px]">
                          <span class="text-center leading-tight text-xs">{{ formatTimeSlot(timeSlot) }}</span>
                        </div>
                        <div v-for="(day, dayIndex) in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day" 
                             class="relative p-0 min-h-[30px] border-r border-gray-100">
                        </div>
                      </div>
                    </div>
                    <div 
                      v-for="(consultationBlock, index) in getPositionedDashboardConsultationBlocks()" 
                      :key="index"
                      class="absolute rounded-sm text-xs bg-opacity-90 cursor-pointer overflow-hidden z-10 shadow-sm flex flex-col border"
                      :class="getDashboardConsultationColorClasses(consultationBlock.consultation)"
                      :style="{
                        left: `calc(${consultationBlock.dayIndex * 16.67}% + 16.67% + 1px)`, 
                        top: `${consultationBlock.top}px`,
                        height: `${consultationBlock.height}px`,
                        width: 'calc(16.67% - 2px)'
                      }"
                      @click="openConsultationModal(consultationBlock.consultation)"
                    >
                      <div class="font-normal text-xs truncate p-1">{{ getDashboardConsultationName(consultationBlock.consultation) }}</div>
                      <div class="text-xs flex flex-col justify-between px-1 pb-1 flex-grow">
                        <span class="truncate font-normal text-xs">{{ consultationBlock.consultation.bookedStudents || 0 }}/{{ consultationBlock.consultation.maxStudents }}</span>
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
      
      <!-- Add margin below the entire Student Reports section -->
      <div class="mb-8"></div>
      
    <!-- Report Details Modal -->
    <div v-if="showReportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeReportModal">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-12h-6m0 0l-2-2m2 2l2-2m0-7V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v1.5L6 3a1 1 0 0 0-1 1v1.5H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800">Report Details</h3>
          </div>
          <button @click="closeReportModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div v-if="selectedReport" class="p-6 space-y-6">
          <!-- Student Information -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-blue-200">
                <span class="text-sm font-semibold text-blue-600">
                  {{ selectedReport.student?.user?.firstName?.charAt(0) }}{{ selectedReport.student?.user?.lastName?.charAt(0) }}
                </span>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-800">Student Information</h4>
                <p class="text-sm text-gray-600">Report details for this student</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white rounded-lg p-4 border border-blue-100">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-600">Student Name</span>
                </div>
                <p class="text-base font-semibold text-gray-800">{{ selectedReport.student?.user?.firstName }} {{ selectedReport.student?.user?.lastName }}</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-blue-100">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-600">Student ID</span>
                </div>
                <p class="text-base font-semibold text-gray-800">{{ selectedReport.student?.user?.idNumber }}</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-blue-100">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                  <span class="text-sm font-medium text-gray-600">Class Information</span>
                </div>
                <p class="text-base font-semibold text-gray-800">{{ selectedReport.student?.class?.yearLevel }} {{ selectedReport.student?.class?.major }} - {{ selectedReport.student?.class?.section }}</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-blue-100">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-600">Assigned Adviser</span>
                </div>
                <p class="text-base font-semibold text-gray-800">{{ selectedReport.adviser?.firstName }} {{ selectedReport.adviser?.lastName }}</p>
              </div>
            </div>
          </div>

          <!-- Issue Details -->
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-800">Issue Details</h4>
                <p class="text-sm text-gray-600">Report information and status</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white rounded-lg p-4 border border-amber-100">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-600">Issue Type</span>
                </div>
                <span 
                  class="inline-flex px-3 py-1 text-sm font-medium rounded-lg"
                  :class="{
                    'bg-amber-100 text-amber-800 border border-amber-200': selectedReport.issueType === 'session_submission',
                    'bg-red-100 text-red-800 border border-red-200': selectedReport.issueType === 'enrollment_risk',
                    'bg-purple-100 text-purple-800 border border-purple-200': selectedReport.issueType === 'consultation_escalation'
                  }"
                >
                  {{ getIssueTypeLabel(selectedReport.issueType) }}
                </span>
              </div>
              <div class="bg-white rounded-lg p-4 border border-amber-100">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-600">Created Date</span>
                </div>
                <p class="text-base font-semibold text-gray-800">{{ formatDate(selectedReport.createdAt) }}</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-amber-100 md:col-span-2">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-600">Description</span>
                </div>
                <p class="text-base text-gray-800 leading-relaxed">{{ selectedReport.description }}</p>
              </div>
            </div>
          </div>

          <!-- Flag Information -->
          <div v-if="selectedReport.triggerData">
            <h4 class="text-sm font-medium text-gray-800 mb-3">Flag Information</h4>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2 text-sm">
              <div v-if="selectedReport.semester">
                <span class="text-gray-600">Semester:</span>
                <span class="ml-2 text-gray-800">{{ selectedReport.semester }} Semester</span>
              </div>
              <div v-if="selectedReport.triggerData.sessionNotificationCount">
                <span class="text-gray-600">Session Reminders:</span>
                <span class="ml-2 text-gray-800">{{ selectedReport.triggerData.sessionNotificationCount }} consecutive notifications</span>
            </div>
              <div v-if="selectedReport.triggerData.mmNotificationCount">
                <span class="text-gray-600">{{ selectedReport.triggerData.mmType }} Exam Reminders:</span>
                <span class="ml-2 text-gray-800">{{ selectedReport.triggerData.mmNotificationCount }} consecutive notifications</span>
          </div>
              <div v-if="selectedReport.triggerData.concern">
                <span class="text-gray-600">Concern:</span>
                <span class="ml-2 text-gray-800">{{ selectedReport.triggerData.concern }}</span>
          </div>
              <div v-if="selectedReport.triggerData.escalationReason">
                <span class="text-gray-600">Escalation Reason:</span>
                <p class="mt-1 text-gray-800">{{ selectedReport.triggerData.escalationReason }}</p>
        </div>
      </div>
      </div>
      
          <!-- Admin Notes -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-3">Admin Notes</h4>
            <textarea
              v-model="reportNotes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Add notes about this report..."
            ></textarea>
        </div>
          </div>
    
        <!-- Modal Footer -->
        <div class="flex items-center justify-between p-6 border-t border-gray-200">
          <button 
            @click="openContactModal(selectedReport.student)"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Contact Student
          </button>
          <div class="flex space-x-3">
            <button 
              @click="closeReportModal"
              class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button 
              @click="resolveReportFromModal(selectedReport._id)"
              class="px-4 py-2 text-sm font-normal text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
            >
              Resolve Report
            </button>
        </div>
      </div>
    </div>
        </div>
      </div>

      <!-- Quick Access Only (calendars removed) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6" v-if="false">
        <!-- Classes Calendar Card (removed) -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-normal text-gray-800">Classes Schedule</h2>
              <router-link 
                to="/admin/classes" 
                class="px-3 py-1.5 text-xs font-normal text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
              >
                View All
          </router-link>
        </div>
      </div>
      
          <div class="p-4">
            <div v-if="loadingClasses" class="flex items-center justify-center h-64">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
            
            <div v-else-if="recentClasses.length === 0" class="text-center py-16">
              <div class="w-10 h-10 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
            </svg>
          </div>
              <h3 class="text-sm font-normal text-gray-800 mb-1">No classes scheduled</h3>
              <p class="text-xs text-gray-500">Class schedules will appear here</p>
              <p class="text-xs text-gray-400 mt-2">Debug: {{ recentClasses.length }} classes loaded</p>
          </div>

            <!-- Simple List View (Fallback) -->
            <div v-else-if="getPositionedDashboardClassBlocks().length === 0" class="space-y-2 mb-3">
              <p class="text-xs text-gray-500 mb-2">Classes loaded but not positioned ({{ recentClasses.length }} total):</p>
              <div v-for="(classItem, index) in recentClasses.slice(0, 5)" :key="index" 
                   class="p-2 bg-gray-50 rounded border text-xs">
                <div class="font-medium">{{ getDashboardClassName(classItem) }}</div>
                <div class="text-gray-600">{{ getDashboardClassSubject(classItem) }}</div>
                <div class="text-gray-500">{{ (classItem.firstSemester?.daySchedule || classItem.daySchedule || 'No day') }} • {{ (classItem.firstSemester?.timeSchedule || classItem.timeSchedule || 'No time') }}</div>
        </div>
        </div>

            <!-- Mini Calendar Grid (always render for alignment) -->
                <div class="bg-white rounded-lg border border-gray-200">
                  <!-- Calendar Header -->
              <div class="relative">
                <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
                  <div class="py-2 px-1 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
                  <div v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']" :key="day" 
                       class="py-2 px-1 text-gray-500 text-xs font-medium text-center">
                    {{ day }}
                  </div>
                </div>
              </div>
    
                  <!-- Calendar Body -->
                  <div class="relative max-h-[300px] overflow-y-auto">
                    <div class="divide-y divide-gray-200">
                      <div v-for="(timeSlot, index) in dashboardTimeSlots" :key="index" class="grid grid-cols-6">
                        <!-- Time Label -->
                        <div class="py-1 px-1 text-xs font-normal text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center min-h-[30px]">
                          <span class="text-center leading-tight text-xs">{{ formatTimeSlot(timeSlot) }}</span>
          </div>
                        
                        <!-- Day Columns -->
                        <div v-for="(day, dayIndex) in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day" 
                             class="relative p-0 min-h-[30px] border-r border-gray-100">
                          <div class="absolute inset-0 grid grid-rows-2 pointer-events-none">
                            <div class="border-b border-gray-100"></div>
                            <div></div>
          </div>
          </div>
                      </div>
                    </div>

                    <!-- Absolutely positioned class blocks -->
                    <div 
                      v-for="(classBlock, index) in getPositionedDashboardClassBlocks()" 
                      :key="index"
                      class="absolute rounded-sm text-xs bg-opacity-90 cursor-pointer overflow-hidden z-10 shadow-sm flex flex-col border"
                      :class="getDashboardClassColorClasses(classBlock.class)"
                      :style="{
                        left: `calc(${classBlock.dayIndex * 16.67}% + 16.67% + 1px)`, 
                        top: `${classBlock.top}px`,
                        height: `${classBlock.height}px`,
                        width: 'calc(16.67% - 2px)'
                      }"
                    >
                      <div class="font-normal text-xs truncate p-1">{{ getDashboardClassName(classBlock.class) }}</div>
                      <div class="text-xs flex flex-col justify-between px-1 pb-1 flex-grow">
                        <span class="truncate font-normal text-xs">{{ getDashboardClassSubject(classBlock.class) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
          </div>
        </div>
        <!-- Consultations Calendar Card (removed) -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-normal text-gray-800">Consultations Schedule</h2>
              <router-link 
                to="/admin/consultations" 
                class="px-3 py-1.5 text-xs font-normal text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
              >
                View All
        </router-link>
      </div>
        </div>
      
          <div class="p-4">
            <div v-if="loadingConsultations" class="flex items-center justify-center h-64">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
      
                        <div v-else-if="recentConsultations.length === 0" class="text-center py-16">
              <div class="w-10 h-10 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 715.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
          </div>
              <h3 class="text-sm font-normal text-gray-800 mb-1">No consultations scheduled</h3>
              <p class="text-xs text-gray-500">Consultation schedules will appear here</p>
              <p class="text-xs text-gray-400 mt-2">Debug: {{ recentConsultations.length }} consultations loaded</p>
          </div>

            <!-- Simple List View (Fallback) -->
            <div v-else-if="getPositionedDashboardConsultationBlocks().length === 0" class="space-y-2">
              <p class="text-xs text-gray-500 mb-2">Consultations loaded but not positioned ({{ recentConsultations.length }} total):</p>
              <div v-for="(consultation, index) in recentConsultations.slice(0, 5)" :key="index" 
                   class="p-2 bg-gray-50 rounded border text-xs">
                <div class="font-medium">{{ getDashboardConsultationName(consultation) }}</div>
                <div class="text-gray-600">{{ getWeekDayName(consultation.dayOfWeek) }} • {{ formatConsultationTime(consultation.startTime, consultation.endTime) }}</div>
                <div class="text-gray-500">{{ consultation.bookedStudents || 0 }}/{{ consultation.maxStudents }} • {{ consultation.status }}</div>
          </div>
          </div>

            <!-- Mini Calendar Grid -->
            <div v-else class="bg-white rounded-lg border border-gray-200">
              <!-- Calendar Header -->
              <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
                <div class="py-2 px-1 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
                <div v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']" :key="day" 
                     class="py-2 px-1 text-gray-500 text-xs font-medium text-center">
                  {{ day }}
        </div>
      </div>
      
              <!-- Calendar Body -->
              <div class="relative max-h-[300px] overflow-y-auto">
                <div class="divide-y divide-gray-200">
                  <div v-for="(timeSlot, index) in dashboardTimeSlots" :key="index" class="grid grid-cols-6">
                    <!-- Time Label -->
                    <div class="py-1 px-1 text-xs font-normal text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center min-h-[30px]">
                      <span class="text-center leading-tight text-xs">{{ formatTimeSlot(timeSlot) }}</span>
          </div>
                    
                    <!-- Day Columns -->
                    <div v-for="(day, dayIndex) in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day" 
                         class="relative p-0 min-h-[30px] border-r border-gray-100">
                      <!-- Consultation blocks will be positioned here -->
            </div>
            </div>
    </div>
    
                <!-- Absolutely positioned consultation blocks -->
                <div 
                  v-for="(consultationBlock, index) in getPositionedDashboardConsultationBlocks()" 
                  :key="index"
                  class="absolute rounded-sm text-xs bg-opacity-90 cursor-pointer overflow-hidden z-10 shadow-sm flex flex-col border"
                  :class="getDashboardConsultationColorClasses(consultationBlock.consultation)"
                  :style="{
                    left: `calc(${consultationBlock.dayIndex * 16.67}% + 16.67% + 1px)`, 
                    top: `${consultationBlock.top}px`,
                    height: `${consultationBlock.height}px`,
                    width: 'calc(16.67% - 2px)'
                  }"
                >
                  <div class="font-normal text-xs truncate p-1">{{ getDashboardConsultationName(consultationBlock.consultation) }}</div>
                  <div class="text-xs flex flex-col justify-between px-1 pb-1 flex-grow">
                    <span class="truncate font-normal text-xs">{{ consultationBlock.consultation.bookedStudents || 0 }}/{{ consultationBlock.consultation.maxStudents }}</span>
                  </div>
                </div>
          </div>
          </div>
          </div>
        </div>
    <!-- Class Details Modal -->
    <div v-if="showClassModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeClassModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Class Details</h3>
          <button @click="closeClassModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="selectedClassItem" class="p-6 space-y-4 text-sm">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-gray-500">Class</div>
              <div class="text-gray-800">{{ getDashboardClassName(selectedClassItem) }}</div>
            </div>
            <div>
              <div class="text-gray-500">Major</div>
              <div class="text-gray-800">{{ selectedClassItem.major || 'N/A' }}</div>
            </div>
            <div>
              <div class="text-gray-500">Subject</div>
              <div class="text-gray-800">{{ getDashboardClassSubject(selectedClassItem) }}</div>
            </div>
            <div>
              <div class="text-gray-500">Room</div>
              <div class="text-gray-800">{{ selectedClassItem.room || selectedClassItem.firstSemester?.room || selectedClassItem.firstSem?.room || 'N/A' }}</div>
            </div>
            <div>
              <div class="text-gray-500">Day</div>
              <div class="text-gray-800">{{ selectedClassItem.daySchedule || selectedClassItem.firstSemester?.daySchedule || selectedClassItem.firstSem?.daySchedule || 'N/A' }}</div>
            </div>
            <div>
              <div class="text-gray-500">Time</div>
              <div class="text-gray-800">{{ selectedClassItem.timeSchedule || selectedClassItem.firstSemester?.timeSchedule || selectedClassItem.firstSem?.timeSchedule || 'N/A' }}</div>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex justify-end">
          <router-link to="/admin/classes" class="px-4 py-2 text-sm font-normal text-white bg-green-600 rounded-md hover:bg-green-700">Go to Classes</router-link>
        </div>
      </div>
    </div>

    <!-- Consultation Details Modal -->
    <div v-if="showConsultationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeConsultationModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Consultation Details</h3>
          <button @click="closeConsultationModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="selectedConsultationItem" class="p-6 space-y-4 text-sm">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-gray-500">Adviser</div>
              <div class="text-gray-800">{{ (selectedConsultationItem.adviser?.firstName || '') + ' ' + (selectedConsultationItem.adviser?.lastName || '') }}</div>
            </div>
            <div>
              <div class="text-gray-500">Status</div>
              <div class="text-gray-800">{{ selectedConsultationItem.status || 'N/A' }}</div>
            </div>
            <div>
              <div class="text-gray-500">Day</div>
              <div class="text-gray-800">{{ getWeekDayName(selectedConsultationItem.dayOfWeek) }}</div>
            </div>
            <div>
              <div class="text-gray-500">Time</div>
              <div class="text-gray-800">{{ formatConsultationTime(selectedConsultationItem.startTime, selectedConsultationItem.endTime || (selectedConsultationItem.startTime + (selectedConsultationItem.duration || 1))) }}</div>
            </div>
            <div>
              <div class="text-gray-500">Slots</div>
              <div class="text-gray-800">{{ (selectedConsultationItem.bookedStudents || 0) + '/' + (selectedConsultationItem.maxStudents || 0) }}</div>
            </div>
          </div>
          <div v-if="selectedConsultationItem.notes" class="mt-2">
            <div class="text-gray-500">Notes</div>
            <div class="text-gray-800">{{ selectedConsultationItem.notes }}</div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex justify-end">
          <router-link to="/admin/consultations" class="px-4 py-2 text-sm font-normal text-white bg-green-600 rounded-md hover:bg-green-700">Go to Consultations</router-link>
        </div>
      </div>
    </div>

      <!-- Quick Access: Weekly Schedule (Consultations) -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200" v-if="false">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-normal text-gray-800">Weekly Schedule</h2>
          <div class="text-xs text-gray-500">Monday - Friday | 7:00 AM - 5:00 PM</div>
          </div>
        <div class="p-4">
          <div v-if="loadingConsultations" class="flex items-center justify-center h-64">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          <div v-else class="bg-white rounded-lg border border-gray-200">
            <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
              <div class="py-3 px-2 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
              <div v-for="day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day" class="py-3 px-2 text-gray-500 text-xs font-medium text-center">{{ day }}</div>
            </div>
            <div class="relative max-h-[400px] overflow-y-auto">
              <div class="divide-y divide-gray-200">
                <div v-for="(timeSlot, index) in dashboardTimeSlots" :key="index" class="grid grid-cols-6">
                  <div class="py-3 px-2 text-xs font-normal text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center min-h-[60px]">
                    <span class="text-center leading-tight">{{ timeSlot }}</span>
                  </div>
                  <div v-for="(day, dayIndex) in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day" class="relative p-0 min-h-[60px] border-r border-gray-100">
                    <div class="absolute inset-0 grid grid-rows-2 pointer-events-none">
                      <div class="border-b border-gray-100"></div>
                      <div></div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="(block, index) in getPositionedWeeklyConsultationBlocks()" :key="index"
                   class="absolute rounded-md text-xs bg-green-100 text-green-800 cursor-pointer overflow-hidden z-10 shadow-sm flex flex-col border border-green-200"
                   :style="{ left: `calc(${block.dayIndex * 16.67}% + 16.67% + 1px)`, top: `${block.top}px`, height: `${block.height}px`, width: 'calc(16.67% - 2px)' }">
                <div class="p-2">
                  <div class="text-xs font-medium truncate">{{ getDashboardConsultationName(block.consultation) }}</div>
                  <div class="text-xs text-gray-600 truncate">Consultation</div>
                </div>
                <div class="mt-auto px-2 pb-2 text-[11px] flex items-center justify-between">
                  <span class="inline-flex px-2 py-0.5 rounded-full bg-white/70 text-green-700 border border-green-200">{{ getConsultationSlotsLabel(block.consultation) }}</span>
                  <span class="text-gray-600">{{ formatConsultationTime(block.consultation.startTime, block.consultation.endTime || (block.consultation.startTime + (block.consultation.duration || 1))) }}</span>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Modal -->
    <div v-if="showContactModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeContactModal">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800">Student Contact</h3>
          </div>
          <button @click="closeContactModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div v-if="selectedStudent" class="p-6 space-y-4">
          <!-- Student Info -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-blue-200 shadow-sm">
                <span class="text-lg font-semibold text-blue-600">
                  {{ selectedStudent.user?.firstName?.charAt(0) }}{{ selectedStudent.user?.lastName?.charAt(0) }}
                </span>
              </div>
              <div class="flex-1">
                <h4 class="text-lg font-semibold text-gray-800 mb-1">
                  {{ selectedStudent.user?.firstName }} {{ selectedStudent.user?.lastName }}
                </h4>
                <p class="text-sm text-gray-600 mb-1">{{ selectedStudent.user?.idNumber }}</p>
                <p class="text-sm text-gray-600">
                  {{ selectedStudent.class?.yearLevel }} {{ selectedStudent.class?.major }} - {{ selectedStudent.class?.section }}
                </p>
              </div>
            </div>
          </div>
      
          <!-- Contact Information -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-800 mb-3">Contact Information</h4>
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-green-200">
                  <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                  <p class="text-base font-semibold text-gray-800">{{ selectedStudent.user?.email || 'Not provided' }}</p>
                </div>
                <button 
                  v-if="selectedStudent.user?.email"
                  @click="copyToClipboard(selectedStudent.user.email)"
                  class="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Copy
                </button>
        </div>
      </div>
      
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-blue-200">
                  <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                  <p class="text-base font-semibold text-gray-800">{{ selectedStudent.contactNumber || selectedStudent.user?.contactNumber || 'Not provided' }}</p>
                </div>
                <button 
                  v-if="selectedStudent.contactNumber || selectedStudent.user?.contactNumber"
                  @click="copyToClipboard(selectedStudent.contactNumber || selectedStudent.user?.contactNumber)"
                  class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
      
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-purple-200 mt-1">
                  <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">Address</p>
                  <p class="text-base text-gray-800 leading-relaxed">{{ formatAddress(selectedStudent.address) || selectedStudent.user?.address || 'Not provided' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              v-if="selectedStudent.user?.email"
              @click="composeEmail(selectedStudent.user.email)"
              class="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span>Send Email</span>
            </button>
            <button 
              v-if="selectedStudent.contactNumber || selectedStudent.user?.contactNumber"
              @click="callStudent(selectedStudent.contactNumber || selectedStudent.user?.contactNumber)"
              class="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Call Student
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
// Debug hook to verify the correct component is rendering
console.log('ADMIN DASHBOARD: Dashboard.vue mounted')
import api from '../../services/api'
import { notificationService } from '../../services/notificationService'

// Reactive data
const loading = ref(true)
const dashboardStats = ref({
  totalStudents: 0,
  totalClasses: 0,
  totalAdvisers: 0,
  totalConsultations: 0
})

const reportsSummary = ref({
  session_submission: { count: 0, highPriority: 0 },
  enrollment_risk: { count: 0, highPriority: 0 },
  consultation_escalation: { count: 0, highPriority: 0 }
})

const adminReports = ref([])
const filteredReports = ref([])

// Daily report management
const currentViewDate = ref(new Date())
const dailyReportLimit = 5
const reportsForToday = ref([])
const reportsForNextDay = ref([])

// Report filters
const reportFilters = ref({
  yearLevel: '',
  section: '',
  major: '',
  issueType: ''
})

const availableSections = ref([])
const availableMajors = ref([])

// Consultation data
const loadingConsultations = ref(false)
const recentConsultations = ref([])
  const subjectsCount = ref(0)
  const pendingRegistrationsCount = ref(0)

// Classes data
const loadingClasses = ref(false)
const recentClasses = ref([])

// Dashboard calendar time slots (condensed)
  const dashboardTimeSlots = ref([
    '7:00 AM - 8:00 AM',
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM',
    '6:00 PM - 7:00 PM'
  ])
  const ROW_HEIGHT_DASHBOARD = 30

// Modal data
const showReportModal = ref(false)
const selectedReport = ref(null)
const reportNotes = ref('')

const showContactModal = ref(false)
const selectedStudent = ref(null)

// Quick-access modals for classes and consultations
const showClassModal = ref(false)
const selectedClassItem = ref(null)
const showConsultationModal = ref(false)
const selectedConsultationItem = ref(null)

// Greeting function
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Consultation helper functions
const getWeekDayName = (dayIndex) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  return days[dayIndex] || 'Unknown'
}

const formatConsultationTime = (startHour, endHour) => {
  const formatHour = (hour) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:00 ${ampm}`
  }
  return `${formatHour(startHour)} - ${formatHour(endHour)}`
}

// Dashboard calendar helper functions
const formatTimeSlot = (timeSlot) => {
  const [start] = timeSlot.split(' - ')
  return start
}

const convertTimeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(' ')
  const [hours, minutes = 0] = time.split(':').map(Number)
  let totalMinutes = hours * 60 + minutes
  if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60
  if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60
  return totalMinutes
}

// Classes helper functions
const normalizeDayName = (value) => {
  if (!value || typeof value !== 'string') return undefined
  const raw = value.toLowerCase()
  // handle multi-day strings like "monday, wednesday" or "mon/wed"
  const firstPart = raw.split(/[,&/]/)[0].trim()
  if (firstPart.startsWith('mon')) return 'Monday'
  if (firstPart.startsWith('tue')) return 'Tuesday'
  if (firstPart.startsWith('wed')) return 'Wednesday'
  if (firstPart.startsWith('thu')) return 'Thursday'
  if (firstPart.startsWith('fri')) return 'Friday'
  return undefined
}
const getDashboardClassName = (classItem) => {
  return `${classItem.yearLevel} ${classItem.section}`
}

const getDashboardClassSubject = (classItem) => {
  if (classItem.sspSubject?.name) return classItem.sspSubject.name
  if (classItem.firstSemester?.sspSubject?.name) return classItem.firstSemester.sspSubject.name
  if (classItem.firstSem?.sspSubject?.name) return classItem.firstSem.sspSubject.name
  return 'Subject'
}

const getDashboardClassColorClasses = (classItem) => {
  const colors = [
    'bg-gray-100 text-gray-800 border-gray-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200'
  ]
  const index = (classItem.yearLevel?.charCodeAt(0) || 0) % colors.length
  return colors[index]
}

// Consultations helper functions
const getDashboardConsultationName = (consultation) => {
  return `${consultation.adviser?.firstName || ''} ${consultation.adviser?.lastName || ''}`.trim() || 'Consultation'
}

const getDashboardConsultationColorClasses = (consultation) => {
  if (consultation.status === 'Active') return 'bg-green-100 text-green-800 border-green-200'
  if (consultation.status === 'Full') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  if (consultation.status === 'Inactive') return 'bg-red-100 text-red-800 border-red-200'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

// Load recent consultations
const loadRecentConsultations = async () => {
  try {
    loadingConsultations.value = true
    // Primary: admin consultations endpoint
    const primary = await api.get('/consultations')
    recentConsultations.value = primary.data || []
    console.log('Loaded consultations (primary /consultations):', recentConsultations.value.length)

    // Fallback with limit (to reduce payload)
    if (!recentConsultations.value || recentConsultations.value.length === 0) {
      try {
        const fallback = await api.get('/consultations', { params: { limit: 10 } })
        recentConsultations.value = fallback.data || []
        console.log('Loaded consultations (fallback limit=10):', recentConsultations.value.length)
      } catch (fallbackError) {
        console.error('Fallback consultations load failed:', fallbackError?.response?.status, fallbackError?.message)
      }
    }
  } catch (error) {
    console.error('Error loading consultations /consultations:', error?.response?.status, error?.message)
    recentConsultations.value = []
  } finally {
    loadingConsultations.value = false
  }
}

// Helper to display slots label
const getConsultationSlotsLabel = (consultation) => {
  const booked = consultation.bookedStudents || 0
  const max = consultation.maxStudents || 0
  const remaining = Math.max(0, max - booked)
  return `${remaining} slots`
}

// Weekly consultation blocks positioned using dashboardTimeSlots
const getPositionedWeeklyConsultationBlocks = () => {
  const ROW_HEIGHT = 60
  const blocks = []

  const normalizeDayIndex = (value) => {
    if (value >= 1 && value <= 5) return value - 1
    return value
  }

  if (!Array.isArray(recentConsultations.value)) return blocks

  recentConsultations.value.forEach(consultation => {
    const dayIndex = normalizeDayIndex(consultation.dayOfWeek)
    if (dayIndex === undefined || dayIndex < 0 || dayIndex > 4) return

    const startHour = consultation.startTime
    const endHour = consultation.endTime || (consultation.startTime + (consultation.duration || 1))

    const toLabel = (hour) => {
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      return `${h}:00 ${ampm}`
    }

    const startLabel = toLabel(startHour)
    const endLabel = toLabel(endHour)

    let startRow = -1
    let endRow = -1
    const ranges = dashboardTimeSlots.value.map(slot => {
      const [s, e] = slot.split(' - ')
      return { s, e, sMin: convertTimeToMinutes(s), eMin: convertTimeToMinutes(e) }
    })

    // exact match first
    dashboardTimeSlots.value.forEach((slot, i) => {
      if (slot.startsWith(startLabel)) startRow = i
      if (slot.endsWith(endLabel)) endRow = i
    })

    // nearest match fallback
    if (startRow === -1) {
      const startMin = convertTimeToMinutes(startLabel)
      let best = { diff: Infinity, idx: 0 }
      ranges.forEach((r, i) => {
        const diff = Math.abs(r.sMin - startMin)
        if (diff < best.diff) best = { diff, idx: i }
      })
      startRow = best.idx
    }
    if (endRow === -1) {
      const endMin = convertTimeToMinutes(endLabel)
      let best = { diff: Infinity, idx: startRow }
      ranges.forEach((r, i) => {
        const diff = Math.abs(r.eMin - endMin)
        if (diff < best.diff) best = { diff, idx: i }
      })
      endRow = Math.max(best.idx, startRow)
    }

    const top = startRow * ROW_HEIGHT
    const height = (endRow - startRow + 1) * ROW_HEIGHT

    blocks.push({ consultation, dayIndex, top, height })
  })

  return blocks
}

// Load recent classes
const loadRecentClasses = async () => {
  try {
    loadingClasses.value = true
    // Primary: use generic classes endpoint (works for admin)
    const primary = await api.get('/classes', { params: { status: 'active' } })
    recentClasses.value = primary.data || []
    console.log('Loaded classes (primary /classes):', recentClasses.value.length)

    // Fallback: try specialized dashboard endpoint if primary is empty
    if (!recentClasses.value || recentClasses.value.length === 0) {
      try {
        const fallback = await api.get('/admin/dashboard/classes')
        recentClasses.value = fallback.data || []
        console.log('Loaded classes (fallback /admin/dashboard/classes):', recentClasses.value.length)
      } catch (fallbackError) {
        console.error('Fallback /admin/dashboard/classes failed:', fallbackError?.response?.status, fallbackError?.message)
      }
    }
  } catch (error) {
    console.error('Error loading classes /classes:', error?.response?.status, error?.message)
    recentClasses.value = []
  } finally {
    loadingClasses.value = false
  }
}

// Get positioned class blocks for dashboard
const getPositionedDashboardClassBlocks = () => {
  const ROW_HEIGHT = 30 // Smaller for dashboard
  const dayIndices = {
    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4
  }
  
  const classBlocks = []
  console.log('Getting positioned class blocks, total classes:', recentClasses.value.length)
  
  recentClasses.value.forEach((classItem, index) => {
    console.log(`Processing class ${index}:`, classItem)
    
    // Check if class has schedule data directly or in semester data
    let daySchedule = classItem.daySchedule
    let timeSchedule = classItem.timeSchedule
    
    // If not found directly, check semester data
    if (!daySchedule || !timeSchedule) {
      const semesterData = classItem.firstSemester || classItem.firstSem || {}
      daySchedule = semesterData.daySchedule
      timeSchedule = semesterData.timeSchedule
      console.log(`Class ${index} semester data:`, semesterData)
    }
    
    console.log(`Class ${index} schedule - day: ${daySchedule}, time: ${timeSchedule}`)
    
    if (!daySchedule || !timeSchedule) {
      console.log(`Skipping class ${index} - missing schedule data`)
      return
    }
    
    const normalizedDay = normalizeDayName(daySchedule) || daySchedule
    const dayIndex = dayIndices[normalizedDay]
    if (dayIndex === undefined) return
    
    // Parse time schedule robustly
    let startTime, endTime
    if (timeSchedule.includes(' - ')) {
      const parts = timeSchedule.split(' - ')
      startTime = parts[0].trim()
      endTime = parts[1].trim()
    } else if (timeSchedule.includes('-')) {
      const parts = timeSchedule.split('-')
      startTime = parts[0].trim()
      endTime = parts[1].trim()
    }
    if (!startTime || !endTime) return
    
    // Find time slot indices
    let startRowIndex = -1
    let endRowIndex = -1
    
    const ranges = dashboardTimeSlots.value.map(slot => {
      const [s, e] = slot.split(' - ')
      return { s, e, sMin: convertTimeToMinutes(s), eMin: convertTimeToMinutes(e) }
    })

    dashboardTimeSlots.value.forEach((slot, index) => {
      const [s, e] = slot.split(' - ')
      if (s === startTime) startRowIndex = index
      if (e === endTime) endRowIndex = index
    })

    if (startRowIndex === -1) {
      const startMin = convertTimeToMinutes(startTime)
      let best = { diff: Infinity, idx: 0 }
      ranges.forEach((r, i) => {
        const diff = Math.abs(r.sMin - startMin)
        if (diff < best.diff) best = { diff, idx: i }
      })
      startRowIndex = best.idx
    }
    if (endRowIndex === -1) {
      const endMin = convertTimeToMinutes(endTime)
      let best = { diff: Infinity, idx: startRowIndex }
      ranges.forEach((r, i) => {
        const diff = Math.abs(r.eMin - endMin)
        if (diff < best.diff) best = { diff, idx: i }
      })
      endRowIndex = Math.max(best.idx, startRowIndex)
    }
    
    const top = startRowIndex * ROW_HEIGHT
    const height = Math.max(ROW_HEIGHT, (endRowIndex - startRowIndex + 1) * ROW_HEIGHT)
    
    classBlocks.push({
      class: classItem,
      dayIndex,
      top,
      height,
      startTime,
      endTime
    })
  })
  
  console.log('Final class blocks:', classBlocks.length, classBlocks)
  return classBlocks
}

// Get positioned consultation blocks for dashboard
const getPositionedDashboardConsultationBlocks = () => {
  const ROW_HEIGHT = 30 // Smaller for dashboard
  const dayIndices = {
    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4
  }
  
  const consultationBlocks = []
  
  recentConsultations.value.forEach(consultation => {
    const dayIndex = consultation.dayOfWeek
    if (dayIndex === undefined || dayIndex < 0 || dayIndex > 4) return
    
    const startHour = consultation.startTime
    const endHour = consultation.endTime || consultation.startTime + (consultation.duration || 3)
    
    // Convert hours to time strings
    const formatHour = (hour) => {
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      return `${displayHour}:00 ${ampm}`
    }
    
    const startTime = formatHour(startHour)
    const endTime = formatHour(endHour)
    
    // Find time slot indices
    let startRowIndex = -1
    let endRowIndex = -1
    
    dashboardTimeSlots.value.forEach((slot, index) => {
      if (slot.startsWith(startTime)) startRowIndex = index
      if (slot.endsWith(endTime)) endRowIndex = index
    })
    
    if (startRowIndex === -1) {
      // Find closest start time
      const startMinutes = convertTimeToMinutes(startTime)
      let minDiff = Infinity
      dashboardTimeSlots.value.forEach((slot, index) => {
        const [slotStart] = slot.split(' - ')
        const slotMinutes = convertTimeToMinutes(slotStart)
        const diff = Math.abs(slotMinutes - startMinutes)
        if (diff < minDiff) {
          minDiff = diff
          startRowIndex = index
        }
      })
    }
    
    if (endRowIndex === -1) endRowIndex = Math.min(startRowIndex + 2, dashboardTimeSlots.value.length - 1)
    
    const top = startRowIndex * ROW_HEIGHT
    const height = (endRowIndex - startRowIndex + 1) * ROW_HEIGHT
    
    consultationBlocks.push({
      consultation,
      dayIndex,
      top,
      height,
      startTime,
      endTime
    })
  })
  
  console.log('Final consultation blocks:', consultationBlocks.length, consultationBlocks)
  return consultationBlocks
}

// Load dashboard data
const loadDashboardData = async () => {
    loading.value = true
    
  try {
    // Load basic stats
    try {
      const response = await api.get('/admin/dashboard/stats')
      if (response.data) {
        dashboardStats.value = {
          totalStudents: response.data.totalStudents || 0,
          totalClasses: response.data.totalClasses || 0,
          totalAdvisers: response.data.totalAdvisers || 0,
          totalConsultations: response.data.totalConsultations || 0
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }

    // Load admin reports
    try {
      const response = await api.get('/admin/reports')
      if (response.data) {
        reportsSummary.value = response.data.summary || reportsSummary.value
        adminReports.value = response.data.reports || []
        
        // Initialize filter options and filtered reports
        updateFilterOptions()
        filteredReports.value = adminReports.value
        
        // Organize reports by day (5 per day limit)
        organizeReportsByDay()
        
        // Load reports for current view date
        loadReportsForSelectedDay()
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    }
    
    // Load consultations and classes
    loadRecentConsultations()
    loadRecentClasses()

    // Load subjects count
    try {
      const subjectsResponse = await api.get('/subjects', { params: { limit: 1 } })
      subjectsCount.value = Array.isArray(subjectsResponse.data) ? subjectsResponse.data.length : (subjectsResponse.data?.count || 0)
    } catch (error) {
      console.error('Error loading subjects count:', error)
    }

    // Load pending registrations count
    try {
      const pendingResponse = await api.get('/students/pending', { params: { limit: 1 } })
      pendingRegistrationsCount.value = Array.isArray(pendingResponse.data) ? pendingResponse.data.length : (pendingResponse.data?.count || 0)
    } catch (error) {
      console.error('Error loading pending registrations count:', error)
    }
    
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

// Helper functions
const getIssueTypeLabel = (issueType) => {
  const labels = {
    'session_submission': 'Session Issues',
    'enrollment_risk': 'Enrollment Risk',
    'consultation_escalation': 'Escalation'
  }
  return labels[issueType] || issueType
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAddress = (address) => {
  if (!address || typeof address !== 'object') return ''
  
  const parts = []
  if (address.block) parts.push(address.block)
  if (address.street) parts.push(address.street)
  if (address.barangay) parts.push(address.barangay)
  if (address.municipality) parts.push(address.municipality)
  if (address.province) parts.push(address.province)
  
  return parts.join(', ') || ''
}

// Report functions
const resolveReport = async (reportId) => {
  try {
    await api.put(`/admin/reports/${reportId}`, { 
      status: 'resolved',
      adminNotes: reportNotes.value 
    })
    
    notificationService.showSuccess('Report resolved successfully')
    
    // Reload reports
    const reportsResponse = await api.get('/admin/reports')
    reportsSummary.value = reportsResponse.data.summary
    adminReports.value = reportsResponse.data.reports
    
    // Move unresolved reports to next day and reorganize
    moveUnresolvedToNextDay()
    
  } catch (error) {
    console.error('Error resolving report:', error)
    notificationService.showError('Failed to resolve report')
  }
}

const resolveReportFromModal = async (reportId) => {
  await resolveReport(reportId)
  closeReportModal()
}

// Report modal functions
const openReportModal = (report) => {
  selectedReport.value = report
  reportNotes.value = report.adminNotes || ''
  showReportModal.value = true
}

const closeReportModal = () => {
  showReportModal.value = false
  selectedReport.value = null
  reportNotes.value = ''
}

// Contact modal functions
const openContactModal = (student) => {
  selectedStudent.value = student
  showContactModal.value = true
}

const closeContactModal = () => {
  showContactModal.value = false
  selectedStudent.value = null
}

// Open/close handlers for quick-access modals
const openClassModal = (classItem) => {
  selectedClassItem.value = classItem
  showClassModal.value = true
}

const closeClassModal = () => {
  showClassModal.value = false
  selectedClassItem.value = null
}

const openConsultationModal = (consultation) => {
  selectedConsultationItem.value = consultation
  showConsultationModal.value = true
}

const closeConsultationModal = () => {
  showConsultationModal.value = false
  selectedConsultationItem.value = null
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    notificationService.showSuccess('Copied to clipboard')
  } catch (error) {
    console.error('Failed to copy:', error)
    notificationService.showError('Failed to copy to clipboard')
  }
}

const composeEmail = (email) => {
  const subject = encodeURIComponent('SSCMS - Student Support Follow-up')
  const body = encodeURIComponent('Dear Student,\n\nI hope this message finds you well. I am reaching out regarding your academic progress...\n\nBest regards,\nAdmin Team')
  window.open(`mailto:${email}?subject=${subject}&body=${body}`)
}

const callStudent = (contactNumber) => {
  window.open(`tel:${contactNumber}`)
}

// Report filtering functions
const filterReports = () => {
  filteredReports.value = adminReports.value.filter(report => {
    const student = report.student
    if (!student) return false
    
    // Filter by year level
    if (reportFilters.value.yearLevel && student.class?.yearLevel !== reportFilters.value.yearLevel) {
      return false
    }
    
    // Filter by section
    if (reportFilters.value.section && student.class?.section !== reportFilters.value.section) {
      return false
    }
    
    // Filter by major
    if (reportFilters.value.major && student.class?.major !== reportFilters.value.major) {
      return false
    }
    
    // Filter by issue type
    if (reportFilters.value.issueType && report.issueType !== reportFilters.value.issueType) {
      return false
    }
    
    return true
  })
}

const clearReportFilters = () => {
  reportFilters.value = {
    yearLevel: '',
    section: '',
    major: '',
    issueType: ''
  }
  filterReports()
}

const updateFilterOptions = () => {
  const sections = new Set()
  const majors = new Set()
  
  adminReports.value.forEach(report => {
    if (report.student?.class?.section) {
      sections.add(report.student.class.section)
    }
    if (report.student?.class?.major) {
      majors.add(report.student.class.major)
    }
  })
  
  availableSections.value = Array.from(sections).sort()
  availableMajors.value = Array.from(majors).sort()
}

// Daily report management functions
const formatDateWithoutYear = (date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatDateForComparison = (date) => {
  return date.toISOString().split('T')[0]
}

const organizeReportsByDay = () => {
  const today = formatDateForComparison(new Date())
  const tomorrow = formatDateForComparison(new Date(Date.now() + 24 * 60 * 60 * 1000))
  
  // Get reports that are already scheduled for today
  const existingTodayReports = adminReports.value.filter(report => 
    report.scheduledDate === today
  )
  
  // Get new unscheduled reports (reports without scheduledDate)
  const newUnscheduledReports = adminReports.value.filter(report => 
    !report.scheduledDate && report.status !== 'resolved'
  )
  
  // Sort new reports by priority: Escalations > Session Issues > Enrollment Risk
  const sortedNewReports = newUnscheduledReports.sort((a, b) => {
    const priorityOrder = {
      'consultation_escalation': 1, // Highest priority
      'session_submission': 2,
      'enrollment_risk': 3 // Lowest priority
    }
    
    const aPriority = priorityOrder[a.issueType] || 4
    const bPriority = priorityOrder[b.issueType] || 4
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }
    
    // If same priority, sort by creation date (first come first serve)
    return new Date(a.createdAt) - new Date(b.createdAt)
  })
  
  // Calculate how many slots are available for today
  const availableSlotsToday = Math.max(0, dailyReportLimit - existingTodayReports.length)
  
  // Assign new reports: fill today first, then tomorrow
  const reportsForToday = [...existingTodayReports] // Keep existing reports
  const reportsForTomorrow = []
  
  sortedNewReports.forEach((report, index) => {
    if (index < availableSlotsToday) {
      // New reports fill available slots in today
      const scheduledReport = {
        ...report,
        scheduledDate: today
      }
      reportsForToday.push(scheduledReport)
      
      // Update the main reports array
      const mainIndex = adminReports.value.findIndex(r => r._id === report._id)
      if (mainIndex !== -1) {
        adminReports.value[mainIndex] = { ...adminReports.value[mainIndex], ...scheduledReport }
      }
    } else {
      // Remaining new reports go to tomorrow
      const scheduledReport = {
        ...report,
        scheduledDate: tomorrow
      }
      reportsForTomorrow.push(scheduledReport)
      
      // Update the main reports array
      const mainIndex = adminReports.value.findIndex(r => r._id === report._id)
      if (mainIndex !== -1) {
        adminReports.value[mainIndex] = { ...adminReports.value[mainIndex], ...scheduledReport }
      }
    }
  })
  
  // Sort today's reports by priority
  reportsForToday.sort((a, b) => {
    const priorityOrder = {
      'consultation_escalation': 1,
      'session_submission': 2,
      'enrollment_risk': 3
    }
    
    const aPriority = priorityOrder[a.issueType] || 4
    const bPriority = priorityOrder[b.issueType] || 4
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }
    
    return new Date(a.createdAt) - new Date(b.createdAt)
  })
  
  // Update reactive data
  reportsForNextDay.value = reportsForTomorrow
}


const viewPreviousDay = () => {
  if (!isAtToday.value) {
    currentViewDate.value = new Date(currentViewDate.value.getTime() - 24 * 60 * 60 * 1000)
    loadReportsForSelectedDay()
  }
}

const viewNextDay = () => {
  currentViewDate.value = new Date(currentViewDate.value.getTime() + 24 * 60 * 60 * 1000)
  loadReportsForSelectedDay()
}

const isAtToday = computed(() => {
  const today = formatDateForComparison(new Date())
  const currentDate = formatDateForComparison(currentViewDate.value)
  return today === currentDate
})

const loadReportsForSelectedDay = () => {
  const selectedDate = formatDateForComparison(currentViewDate.value)
  
  // Get reports for the selected day
  const reportsForSelectedDay = adminReports.value.filter(report => 
    report.scheduledDate === selectedDate
  )
  
  // Sort by priority
  reportsForSelectedDay.sort((a, b) => {
    const priorityOrder = {
      'consultation_escalation': 1,
      'session_submission': 2,
      'enrollment_risk': 3
    }
    
    const aPriority = priorityOrder[a.issueType] || 4
    const bPriority = priorityOrder[b.issueType] || 4
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }
    
    return new Date(a.createdAt) - new Date(b.createdAt)
  })
  
  reportsForToday.value = reportsForSelectedDay
}

const moveUnresolvedToNextDay = () => {
  const today = formatDateForComparison(new Date())
  const tomorrow = formatDateForComparison(new Date(Date.now() + 24 * 60 * 60 * 1000))
  
  // Only move unresolved reports if it's after today (end of day)
  const currentTime = new Date()
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)
  
  // Only move unresolved reports if current time is after end of day
  if (currentTime < endOfDay) {
    return // Don't move reports during the day
  }
  
  // Find unresolved reports from today
  const unresolvedToday = adminReports.value.filter(report => 
    report.scheduledDate === today && report.status !== 'resolved'
  )
  
  if (unresolvedToday.length > 0) {
    // Move unresolved reports to tomorrow
    unresolvedToday.forEach(report => {
      const index = adminReports.value.findIndex(r => r._id === report._id)
      if (index !== -1) {
        adminReports.value[index] = {
          ...adminReports.value[index],
          scheduledDate: tomorrow,
          status: 'scheduled'
        }
      }
    })
    
    // Reorganize reports
    organizeReportsByDay()
    
    console.log(`Moved ${unresolvedToday.length} unresolved reports to tomorrow`)
  }
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>

/* Custom styles matching adviser dashboard */
</style>

