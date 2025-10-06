<template>
  <div class="adviser-classes">
    <!-- Classes Header - ensuring it fits in page width -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Advisory Classes</h2>
      
      <div v-if="loading" class="py-10 text-center">
        <div class="flex justify-center items-center">
          <svg class="animate-spin h-5 w-5 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading classes...</span>
        </div>
      </div>
      
      <div v-else-if="!classes.length" class="py-10 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-700 mb-2">No Classes Assigned</h3>
        <p class="text-gray-500 max-w-md mx-auto">You don't have any advisory classes assigned at the moment. Check back later or contact the administrator.</p>
      </div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="classItem in classes" 
          :key="classItem._id" 
          class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden card-hover-effect"
          @click="selectClass(classItem)"
        >
          <!-- Decorative element -->
          <div class="absolute top-0 right-0 w-16 h-16 bg-primary-light opacity-20 rounded-bl-full"></div>
          
          <div class="flex justify-between items-start mb-3">
            <h3 class="font-semibold text-gray-800 flex items-center">
              <span class="text-primary">{{ classItem.yearLevel }} Year - {{ classItem.section }}</span>
              <span v-if="classItem.major && !classItem.yearLevel.includes('2nd')" class="ml-2 badge bg-primary-light text-primary text-xs px-2 py-1 rounded-full font-medium">{{ classItem.major }}</span>
            </h3>
          </div>
          
          <div class="text-sm text-gray-600 mb-3 space-y-1">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ classItem.daySchedule }} / {{ classItem.timeSchedule }}
          </div>
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Room: {{ classItem.room }}
            </div>
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {{ classItem.sspSubject.sspCode }}
            </div>
            
          </div>
          
          <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span class="text-gray-700 font-medium">{{ classItem.students?.length || 0 }} Students</span>
            </div>
            <button 
              class="text-primary text-sm hover:underline flex items-center group"
              @click.stop="selectClass(classItem)"
            >
              <span>View Details</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Selected Class Details -->
    <div v-if="selectedClass" class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold flex items-center">
          <span class="text-primary">{{ selectedClass.yearLevel }} Year - {{ selectedClass.section }}</span>
          <span v-if="selectedClass.major && !selectedClass.yearLevel.includes('2nd')" class="ml-3 badge bg-primary-light text-primary text-xs px-2 py-1 rounded-full font-medium">{{ selectedClass.major }}</span>
        </h3>
        <button 
          @click="selectedClass = null" 
          class="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-6">
        <div class="flex-1">
          <h4 class="text-base font-medium text-gray-800 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Class Details
          </h4>
          <div class="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-100">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Schedule:</span>
              <span class="text-sm font-medium">
                {{ activeTab === '1st' ? 
                  (selectedClass.firstSemester?.daySchedule || selectedClass.daySchedule) : 
                  (selectedClass.secondSemester?.daySchedule || selectedClass.daySchedule) }} / 
                  {{ activeTab === '1st' ? 
                    (selectedClass.firstSemester?.timeSchedule || selectedClass.timeSchedule) : 
                    (selectedClass.secondSemester?.timeSchedule || selectedClass.timeSchedule) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Room:</span>
              <span class="text-sm font-medium">
                {{ activeTab === '1st' ? 
                  (selectedClass.firstSemester?.room || selectedClass.room) : 
                  (selectedClass.secondSemester?.room || selectedClass.room) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">SSP Subject:</span>
              <span class="text-sm font-medium">
                {{ activeTab === '1st' ? 
                  getSubjectCode(selectedClass.firstSemester?.sspSubject || selectedClass.sspSubject) : 
                  getSubjectCode(selectedClass.secondSemester?.sspSubject || selectedClass.sspSubject) }}
              </span>
            </div>
            <div class="flex justify-between border-t border-gray-100 pt-2 mt-2">
              <span class="text-sm text-gray-600">Semester:</span>
              <span class="text-sm font-medium" :class="{'text-green-600': activeTab === '1st', 'text-blue-600': activeTab === '2nd'}">
                {{ activeTab === '1st' ? '1st Semester' : '2nd Semester' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">School Year:</span>
              <span class="text-sm font-medium">
                {{ selectedClass.schoolYear || '2025-2026' }}
              </span>
            </div>
            <div class="flex justify-between border-t border-gray-100 pt-2 mt-2">
              <span class="text-sm text-gray-600">Total Students:</span>
              <span class="text-sm font-medium">{{ selectedClass.students?.length || 0 }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex-1">
          <h4 class="text-base font-medium text-gray-800 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            SSP Sessions Overview
          </h4>
          <div class="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-100">
            <div class="border-b border-gray-200 pb-3 mb-2">
              <p class="text-sm text-gray-700 font-medium">
                {{ activeTab === '1st' ? '1st Semester Sessions' : '2nd Semester Sessions' }}
              </p>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Sessions:</span>
              <span class="text-sm font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                {{ activeTab === '1st' ? firstSemesterSessions.length : secondSemesterSessions.length }}
              </span>
            </div>
            <div>
              <div class="flex justify-between mb-1.5">
              <span class="text-sm text-gray-600">Semester Compliance:</span>
                <span class="text-sm font-medium" :class="{
                  'text-red-600': currentSemesterCompliancePercentage < 50,
                  'text-yellow-600': currentSemesterCompliancePercentage >= 50 && currentSemesterCompliancePercentage < 80,
                  'text-green-600': currentSemesterCompliancePercentage >= 80
                }">
                  {{ currentSemesterCompliancePercentage }}%
                </span>
            </div>
              <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-2.5 rounded-full transition-all duration-500"
                  :class="{
                    'bg-red-500': currentSemesterCompliancePercentage < 50,
                    'bg-yellow-500': currentSemesterCompliancePercentage >= 50 && currentSemesterCompliancePercentage < 80,
                    'bg-green-500': currentSemesterCompliancePercentage >= 80
                  }"
                :style="{ width: `${currentSemesterCompliancePercentage}%` }"
              ></div>
              </div>
            </div>
            
            <!-- Quick status overview -->
            <div class="pt-3 mt-2 border-t border-gray-100">
              <p class="text-sm text-gray-700 mb-2">Student Completion Status:</p>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-red-50 rounded-md p-2">
                  <div class="text-xs text-gray-600">Below 50%</div>
                  <div class="text-base font-medium text-red-600">
                    {{ currentSemesterStudents.filter(s => getSemesterCompliancePercentage(s, activeTab) < 50).length }}
                  </div>
                </div>
                <div class="bg-yellow-50 rounded-md p-2">
                  <div class="text-xs text-gray-600">50-80%</div>
                  <div class="text-base font-medium text-yellow-600">
                    {{ currentSemesterStudents.filter(s => getSemesterCompliancePercentage(s, activeTab) >= 50 && getSemesterCompliancePercentage(s, activeTab) < 80).length }}
                  </div>
                </div>
                <div class="bg-green-50 rounded-md p-2">
                  <div class="text-xs text-gray-600">Above 80%</div>
                  <div class="text-base font-medium text-green-600">
                    {{ currentSemesterStudents.filter(s => getSemesterCompliancePercentage(s, activeTab) >= 80).length }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Session Compliance Matrix - no scrolling, full fit -->
      <div class="relative border rounded my-4">
        <div class="px-4 py-2 bg-gray-50 border-b flex justify-between items-center">
          <h4 class="font-medium">Session Compliance Tracking</h4>
          <div class="flex items-center space-x-2">
            <!-- Refresh Button -->
            <button
              @click="refreshSessionMatrix"
              :disabled="matrixLoading"
              class="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh session data"
            >
              <svg 
                :class="['h-4 w-4 mr-1.5', matrixLoading ? 'animate-spin' : '']" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ matrixLoading ? 'Refreshing...' : 'Refresh' }}
            </button>
            
            <!-- Search Bar -->
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search students..."
                class="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg class="absolute left-2.5 top-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Removing 2nd Semester Transition Status section entirely -->
        
        <div v-if="matrixLoading" class="py-10 text-center">
          <div class="flex justify-center items-center">
            <svg class="animate-spin h-5 w-5 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading sessions matrix...</span>
          </div>
        </div>
        
        <div v-else-if="!sessionMatrix.sessions || !sessionMatrix.sessions.length" class="py-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-gray-500">No SSP sessions found for this class</p>
        </div>
        
        <div v-else>
          <!-- Semester selection tabs -->
          <div class="border-b border-gray-200">
            <div class="flex justify-between items-center">
            <nav class="flex -mb-px">
              <button 
                @click="activeTab = '1st'" 
                :class="[
                  'py-2 px-4 text-sm font-medium border-b-2 focus:outline-none',
                  activeTab === '1st' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                1st Semester
                <span v-if="firstSemesterStudents.length > 0" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                  {{ firstSemesterStudents.length }}
                </span>
              </button>
              <button 
                @click="activeTab = '2nd'" 
                :class="[
                  'py-2 px-4 text-sm font-medium border-b-2 focus:outline-none',
                  activeTab === '2nd' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                2nd Semester
                <span v-if="secondSemesterStudents.length > 0" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                  {{ secondSemesterStudents.length }}
                </span>
              </button>
            </nav>
              
              <!-- Promote Students Button -->
              <button 
                v-if="(activeTab === '1st' && eligibleFirstSemesterStudents.length > 0) || (activeTab === '2nd' && eligibleSecondSemesterStudents.length > 0)"
                @click="initiatePromotion"
                :disabled="hasIneligibleStudents(activeTab)"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                  !hasIneligibleStudents(activeTab)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]"
              >
                Promote Students
              </button>
            </div>
          </div>
          
          <!-- First Semester Students Table -->
          <div v-if="activeTab === '1st' && firstSemesterStudents.length > 0" class="p-4">
            
            <table class="w-full divide-y divide-gray-200 table-auto">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th 
                    v-for="session in firstSemesterSessions" 
                    :key="session._id" 
                    scope="col" 
                    class="px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase"
                  >
                    <div class="text-xs">Day {{ session.day }}</div>
                    <div class="text-sm text-blue-700 font-medium">
                      {{ session.title }}
                    </div>
                  </th>
                  <th scope="col" class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Overall
                  </th>
                  <th scope="col" class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
                <!-- Column Checkboxes Row for 1st Semester -->
                <tr class="bg-gray-100">
                  <td class="px-2 py-1 text-center">
                    <span class="text-xs text-gray-600">Select All</span>
                  </td>
                  <td 
                    v-for="session in firstSemesterSessions" 
                    :key="`checkbox-${session._id}`" 
                    class="px-1 py-1 text-center"
                  >
                    <input 
                      type="checkbox" 
                      :checked="isAllStudentsCheckedForSession(session._id, '1st')"
                      @change="toggleAllSessionsForColumn(session._id, '1st', $event.target.checked)"
                      class="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                  <td class="px-2 py-1"></td>
                  <td class="px-2 py-1"></td>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in firstSemesterStudents" :key="student.id" class="hover:bg-gray-50">
                  <td class="px-2 py-2 text-sm font-medium text-gray-900">
                    <button 
                      @click="viewStudentDetails(student)"
                      class="text-left hover:text-blue-600 hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1 py-0.5"
                    >
                    {{ student.name }}
                    </button>
                    <div class="text-xs text-gray-500">{{ student.idNumber }}</div>
                  </td>
                  <td 
                    v-for="session in firstSemesterSessions" 
                    :key="session._id" 
                    class="px-1 py-1 text-center"
                  >
                    <div 
                      v-if="student.sessions[session._id]"
                      class="relative inline-block"
                    >
                      <!-- Check if this is an exam session -->
                      <div v-if="isExamSession(session)">
                        <!-- Conditional Checkbox for Exam Sessions -->
                        <label class="inline-flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            v-model="student.sessions[session._id].completed"
                            @change="toggleSessionCompletion(student.id, session._id, student.sessions[session._id].completed)"
                            :disabled="!hasUploadedMMForExam(student, session) || !hasUploadedPermitForExam(student, session)"
                            :class="[
                              'form-checkbox h-6 w-6 rounded border-2 focus:ring-2 transition-all duration-300 custom-checkbox',
                              (hasUploadedMMForExam(student, session) && hasUploadedPermitForExam(student, session))
                                ? 'text-green-600 border-green-300 focus:ring-green-500 hover:border-green-500 cursor-pointer' 
                                : 'text-red-600 border-red-400 focus:ring-red-500 hover:border-red-500 cursor-not-allowed opacity-70 bg-red-50'
                            ]"
                            :title="getExamSessionTooltip(student, session)"
                          />
                        </label>
                      </div>
                      
                      <!-- Regular session checkbox (non-exam sessions) -->
                      <div v-else>
                        <label class="inline-flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            v-model="student.sessions[session._id].completed"
                            @change="toggleSessionCompletion(student.id, session._id, student.sessions[session._id].completed)"
                            :disabled="shouldDisableSession(student, session, activeTab === '1st' ? firstSemesterSessions : secondSemesterSessions)"
                            :class="[
                              'form-checkbox h-6 w-6 rounded border-gray-300 focus:ring-green-500 transition-all duration-300 custom-checkbox',
                              shouldDisableSession(student, session, activeTab === '1st' ? firstSemesterSessions : secondSemesterSessions)
                                ? 'text-gray-400 border-gray-200 cursor-not-allowed opacity-50 bg-gray-50'
                                : 'text-green-600 cursor-pointer hover:border-green-500'
                            ]"
                            :title="shouldDisableSession(student, session, activeTab === '1st' ? firstSemesterSessions : secondSemesterSessions) ? 'Complete previous exam M&M requirement to unlock' : 'Mark session as completed'"
                          />
                        </label>
                        <!-- Attachment link -->
                        <div v-if="hasSessionAttachment(student.sessions[session._id])" class="mt-1">
                          <button 
                            @click="viewAttachment(student.sessions[session._id].id, getAttachmentDisplayName(student.sessions[session._id]))"
                            class="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                            :title="`View attachment: ${getAttachmentDisplayName(student.sessions[session._id])}`"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-xs text-gray-400">N/A</div>
                  </td>
                  <td class="px-2 py-2 text-center">
                    <div class="inline-flex items-center">
                      <span 
                        class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="getComplianceClass(getStudentCompliancePercentage(student))"
                      >
                        {{ getStudentCompliancePercentage(student) }}%
                      </span>
                    </div>
                  </td>
                  <td class="px-2 py-2 text-center">
                    <div class="flex flex-col items-center space-y-1">
                      <!-- Check for missing M&M submissions for exam sessions (with permit validation) -->
                      <div v-if="getMissingExamMMs(student, firstSemesterSessions).length > 0">
                        <span class="text-xs text-orange-600 font-medium mb-1 block">
                          Missing requirements
                        </span>
                        <!-- Show buttons for each missing exam M&M (or permit not validated) -->
                        <div v-for="examType in getMissingExamMMs(student, firstSemesterSessions)" :key="examType" class="mb-1 flex items-center gap-2">
                          <button 
                            @click="sendSpecificMMReminder(student, examType)"
                            class="px-2 py-1 text-xs border border-transparent rounded-md shadow-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                          >
                            Upload {{ examType }} M&M
                          </button>
                        </div>
                      </div>
                      
                      <!-- Regular promotion/reminder logic -->
                      <div v-else-if="!isEligibleForPromotion(student)">
                        <span class="text-xs text-amber-600 font-medium mb-1 block">
                          <span v-if="getStudentMissingSessionsCount(student) > 2">
                            {{ getStudentMissingSessionsCount(student) }} sessions missing
                          </span>
                          <span v-else-if="!student.odysseyPlanCompleted">
                            Odyssey Plan required
                          </span>
                          <span v-else-if="!student.mmCompleted">
                            M&M submissions required
                          </span>
                        </span>
                        <div class="flex items-center gap-2">
                          <button 
                            @click="notifyStudent(student)"
                            class="mt-1 px-2 py-1 text-xs border border-transparent rounded-md shadow-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            Send Reminder
                          </button>
                          <!-- Drop functionality moved to admin -->
                        </div>
                      </div>
                      <template v-else>
                        <span class="text-xs text-green-600 font-medium block mb-1">
                          ✅ Eligible for promotion
                        </span>
                        <!-- Individual promote buttons removed - use bulk promotion -->
                      </template>
                      
                      <!-- Drop functionality moved to admin -->
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Second Semester Students Table -->
          <div v-if="activeTab === '2nd' && secondSemesterStudents.length > 0" class="p-4">
            
            <table class="w-full divide-y divide-gray-200 table-auto">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th 
                    v-for="session in secondSemesterSessions" 
                    :key="session._id" 
                    scope="col" 
                    class="px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase"
                  >
                    <div class="text-xs">Day {{ session.day }}</div>
                    <div class="text-sm text-green-700 font-medium">
                      {{ session.title }}
        </div>
                  </th>
                  <th scope="col" class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Overall
                  </th>
                  <th scope="col" class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
                <!-- Column Checkboxes Row for 2nd Semester -->
                <tr class="bg-gray-100">
                  <td class="px-2 py-1 text-center">
                    <span class="text-xs text-gray-600">Select All</span>
                  </td>
                  <td 
                    v-for="session in secondSemesterSessions" 
                    :key="`checkbox-2nd-${session._id}`" 
                    class="px-1 py-1 text-center"
                  >
                    <input 
                      type="checkbox" 
                      :checked="isAllStudentsCheckedForSession(session._id, '2nd')"
                      @change="toggleAllSessionsForColumn(session._id, '2nd', $event.target.checked)"
                      class="form-checkbox h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                  </td>
                  <td class="px-2 py-1"></td>
                  <td class="px-2 py-1"></td>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in secondSemesterStudents" :key="student.id" class="hover:bg-gray-50">
                  <td class="px-2 py-2 text-sm font-medium text-gray-900">
                    <button 
                      @click="viewStudentDetails(student)"
                      class="text-left hover:text-blue-600 hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1 py-0.5"
                    >
                    {{ student.name }}
                    </button>
                    <div class="text-xs text-gray-500">{{ student.idNumber }}</div>
                  </td>
                  <td 
                    v-for="session in secondSemesterSessions" 
                    :key="session._id" 
                    class="px-1 py-1 text-center"
                  >
                    <div 
                      v-if="student.sessions[session._id]"
                      class="relative inline-block"
                    >
                      <!-- Check if this is an exam session -->
                      <div v-if="isExamSession(session)">
                        <!-- Conditional Checkbox for Exam Sessions -->
                        <label class="inline-flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            v-model="student.sessions[session._id].completed"
                            @change="toggleSessionCompletion(student.id, session._id, student.sessions[session._id].completed)"
                            :disabled="!hasUploadedMMForExam(student, session) || !hasUploadedPermitForExam(student, session)"
                            :class="[
                              'form-checkbox h-6 w-6 rounded border-2 focus:ring-2 transition-all duration-300 custom-checkbox',
                              (hasUploadedMMForExam(student, session) && hasUploadedPermitForExam(student, session))
                                ? 'text-green-600 border-green-300 focus:ring-green-500 hover:border-green-500 cursor-pointer' 
                                : 'text-red-600 border-red-400 focus:ring-red-500 hover:border-red-500 cursor-not-allowed opacity-70 bg-red-50'
                            ]"
                            :title="getExamSessionTooltip(student, session)"
                          />
                        </label>
                      </div>
                      
                      <!-- Regular session checkbox (non-exam sessions) -->
                      <div v-else>
                        <label class="inline-flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            v-model="student.sessions[session._id].completed"
                            @change="toggleSessionCompletion(student.id, session._id, student.sessions[session._id].completed)"
                            :disabled="shouldDisableSession(student, session, activeTab === '1st' ? firstSemesterSessions : secondSemesterSessions)"
                            :class="[
                              'form-checkbox h-6 w-6 rounded border-gray-300 focus:ring-green-500 transition-all duration-300 custom-checkbox',
                              shouldDisableSession(student, session, activeTab === '1st' ? firstSemesterSessions : secondSemesterSessions)
                                ? 'text-gray-400 border-gray-200 cursor-not-allowed opacity-50 bg-gray-50'
                                : 'text-green-600 cursor-pointer hover:border-green-500'
                            ]"
                            :title="shouldDisableSession(student, session, activeTab === '1st' ? firstSemesterSessions : secondSemesterSessions) ? 'Complete previous exam M&M requirement to unlock' : 'Mark session as completed'"
                          />
                        </label>
                        <!-- Attachment link -->
                        <div v-if="hasSessionAttachment(student.sessions[session._id])" class="mt-1">
                          <button 
                            @click="viewAttachment(student.sessions[session._id].id, getAttachmentDisplayName(student.sessions[session._id]))"
                            class="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                            :title="`View attachment: ${getAttachmentDisplayName(student.sessions[session._id])}`"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-xs text-gray-400">N/A</div>
                  </td>
                  <td class="px-2 py-2 text-center">
                    <div class="inline-flex items-center">
                      <span 
                        class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="getComplianceClass(getStudentCompliancePercentage(student))"
                      >
                        {{ getStudentCompliancePercentage(student) }}%
                      </span>
                    </div>
                  </td>
                  <td class="px-2 py-2 text-center">
                    <div class="flex flex-col items-center space-y-1">
                      <!-- Check for missing M&M submissions for exam sessions (with permit validation) -->
                      <div v-if="getMissingExamMMs(student, secondSemesterSessions).length > 0">
                        <span class="text-xs text-orange-600 font-medium mb-1 block">
                          Missing requirements
                        </span>
                        <!-- Show buttons for each missing exam M&M (or permit not validated) -->
                        <div v-for="examType in getMissingExamMMs(student, secondSemesterSessions)" :key="examType" class="mb-1 flex items-center gap-2">
                          <button 
                            @click="sendSpecificMMReminder(student, examType)"
                            class="px-2 py-1 text-xs border border-transparent rounded-md shadow-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                          >
                            Upload {{ examType }} M&M
                          </button>
                        </div>
                      </div>
                      
                      <!-- Regular promotion/reminder logic -->
                      <div v-else-if="!isEligibleForPromotion(student)">
                        <span class="text-xs text-amber-600 font-medium mb-1 block">
                          <span v-if="getStudentMissingSessionsCount(student) > 2">
                            {{ getStudentMissingSessionsCount(student) }} sessions missing
                          </span>
                          <span v-else-if="!student.odysseyPlanCompleted && !student.mmCompleted">
                            Odyssey Plan & M&M required
                          </span>
                          <span v-else-if="!student.odysseyPlanCompleted">
                            Odyssey Plan required
                          </span>
                          <span v-else-if="!student.mmCompleted">
                            M&M submissions required
                          </span>
                        </span>
                        <div class="flex items-center gap-2">
                          <button 
                            @click="notifyStudent(student)"
                            class="mt-1 px-2 py-1 text-xs border border-transparent rounded-md shadow-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            Send Reminder
                          </button>
                          <!-- Drop functionality moved to admin -->
                        </div>
                      </div>
                      <template v-else>
                        <span class="text-xs text-green-600 font-medium block mb-1">
                          ✅ Eligible for promotion
                        </span>
                        <!-- Individual promote buttons removed - use bulk promotion -->
                      </template>
                      
                      <!-- Drop functionality moved to admin -->
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
      </div>
      
          <!-- Empty state for no students in current semester view -->
          <div v-if="(activeTab === '1st' && firstSemesterStudents.length === 0) || 
                    (activeTab === '2nd' && secondSemesterStudents.length === 0)" 
            class="p-8 text-center text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p class="mb-1">No students in {{ activeTab === '1st' ? '1st' : '2nd' }} semester</p>
            <p class="text-sm">
              {{ activeTab === '1st' 
                 ? 'All students have completed 1st semester' 
                 : 'No students have advanced to 2nd semester yet' 
              }}
            </p>
      </div>
      
          <!-- Legend for colors -->
          <div class="flex flex-wrap gap-2 p-3 justify-end border-t">
            <div class="flex items-center">
              <span class="inline-block w-3 h-3 rounded-full bg-red-100 mr-1"></span>
              <span class="text-xs text-gray-600">Below 50%</span>
            </div>
            <div class="flex items-center">
              <span class="inline-block w-3 h-3 rounded-full bg-yellow-100 mr-1"></span>
              <span class="text-xs text-gray-600">50-80%</span>
            </div>
            <div class="flex items-center">
              <span class="inline-block w-3 h-3 rounded-full bg-green-100 mr-1"></span>
              <span class="text-xs text-gray-600">Above 80%</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>

    <!-- Individual promotion modal removed - using bulk promotion only -->
  </div>
  
  
    <!-- Promotion Confirmation Modal -->
    <div v-if="showPromoteModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full shadow-lg">
        <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 class="text-xl font-semibold text-gray-800">
            <span v-if="promotionType === 'semester'">Promote to 2nd Semester</span>
            <span v-else-if="promotionType === 'year'">Promote to Next Year</span>
            <span v-else-if="promotionType === 'graduation'">Graduate Students</span>
            <span v-else">Student Promotion</span>
          </h2>
          <button @click="showPromoteModal = false" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Promotion Information -->
        <div class="mb-6">
          <div v-if="promotionType === 'semester'" class="bg-blue-50 p-4 rounded-md">
            <h3 class="text-lg font-medium text-blue-800 mb-2">1st Semester → 2nd Semester</h3>
            <p class="text-sm text-blue-700">
              Students will be promoted from 1st semester to 2nd semester. Their 1st semester sessions will be archived and 2nd semester sessions will be created.
            </p>
          </div>
          
          <div v-else-if="promotionType === 'year'" class="bg-green-50 p-4 rounded-md">
            <h3 class="text-lg font-medium text-green-800 mb-2">2nd Semester → Next Year</h3>
            <p class="text-sm text-green-700">
              Students will be promoted to the next year level. All sessions will be archived and students will be moved to their next year classes.
            </p>
          </div>
          
          <div v-else-if="promotionType === 'graduation'" class="bg-purple-50 p-4 rounded-md">
            <h3 class="text-lg font-medium text-purple-800 mb-2">🎓 Graduation</h3>
            <p class="text-sm text-purple-700">
              Students will graduate from the program. All sessions will be archived and students will be marked as graduated.
            </p>
          </div>
        </div>

        <!-- Students to Promote -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-3">
            Students to be Promoted ({{ studentsToPromote.length }})
          </h3>
          <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
            <div class="divide-y divide-gray-200">
              <div 
                v-for="student in studentsToPromote" 
                :key="student.id"
                class="p-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ student.name }}</p>
                    <p class="text-xs text-gray-500">ID: {{ student.idNumber || student.id }}</p>
                  </div>
                </div>
                <span class="text-xs text-green-600 font-medium">✅ Eligible</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3">
          <button 
            @click="showPromoteModal = false" 
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            :disabled="promotingStudents"
          >
            Cancel
          </button>
          <button 
            @click="confirmPromotion" 
            :disabled="promotingStudents"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="promotingStudents" class="flex items-center">
              <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Promoting...
            </span>
            <span v-else>
              <span v-if="promotionType === 'semester'">Promote to 2nd Semester</span>
              <span v-else-if="promotionType === 'year'">Promote to Next Year</span>
              <span v-else-if="promotionType === 'graduation'">Graduate Students</span>
              <span v-else">Confirm Promotion</span>
            </span>
          </button>
        </div>
      </div>
    </div>

  
  <!-- Drop functionality removed - now handled by admin only -->
  
  <!-- Attachment View Modal -->
  <AttachmentViewModal 
    :isOpen="showAttachmentModal"
    :sessionId="selectedSessionId"
    :fileName="selectedAttachmentName"
    @close="closeAttachmentModal"
    @attachment-rejected="handleAttachmentRejected"
  />

  <!-- Student Details Modal -->
    <StudentDetailsModal
      :isOpen="showStudentModal"
      :student="selectedStudent"
      :sessions="studentSessions"
      :history="studentHistory"
      :loading="loadingStudentDetails"
      @close="showStudentModal = false"
      @requestDrop="requestStudentDrop"
      @reload-student-data="reloadStudentData"
    />

  <!-- Bulk Promotion Modal -->
  <div v-if="showBulkPromoteModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex justify-center items-center">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-6">
      <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h2 class="text-xl font-semibold text-gray-800">Student Promotion</h2>
        <button @click="showBulkPromoteModal = false" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <p class="text-sm text-blue-800">
            You are about to promote 
            <span class="font-semibold">
              {{ activeTab === '1st' ? eligibleFirstSemesterStudents.length : eligibleSecondSemesterStudents.length }}
            </span>
            eligible students to 
            <span class="font-semibold">
              {{ activeTab === '1st' ? '2nd Semester' : 'Next Year Level' }}
            </span>
          </p>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showBulkPromoteModal = false" 
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            :disabled="promotingStudents"
          >
            Cancel
          </button>
          <button 
            @click="confirmBulkPromote" 
            :disabled="promotingStudents"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="promotingStudents" class="flex items-center">
              <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Promoting...
            </span>
            <span v-else>Confirm Promotion</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, Teleport } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { sessionService } from '../../services/sessionService';
import { classService } from '../../services/classService';
import { notificationService } from '../../services/notificationService';
import { notificationApiService } from '../../services/notificationApiService';
import api from '../../services/api';
import { adviserService } from '../../services/adviserService';
import { studentService } from '../../services/studentService';
import StudentDetailsModal from '../../components/modals/StudentDetailsModal.vue';
import { mmService } from '../../services/midtermFinalsService';
import { examPermitService } from '../../services/examPermitService';
import AttachmentViewModal from '../../components/modals/AttachmentViewModal.vue';

// Import analyticsService conditionally to prevent errors
let analyticsService;
try {
  analyticsService = require('../../services/analyticsService').analyticsService;
} catch (error) {
  analyticsService = {
    trackEvent: () => false,
    trackPageView: () => false
  };
}

// State
const loading = ref(true);
const matrixLoading = ref(false);
const saving = ref(false);
const classes = ref([]);
const selectedClass = ref(null);
const sessionMatrix = ref({
  sessions: [],
  students: []
});
const pendingChanges = ref(new Map());
const authStore = useAuthStore();
const errorMessage = ref('');
const sessions = ref([]);
const students = ref([]);
const activeTab = ref('1st'); // '1st' or '2nd'

// Individual promotion removed - using bulk promotion only
// Bulk promotion functionality removed
const searchQuery = ref(''); // Add search functionality

// Modal state for attachment viewing
const showAttachmentModal = ref(false);
const selectedSessionId = ref(null);
const selectedAttachmentName = ref(null);

// Student details modal
const showStudentModal = ref(false);
const selectedStudent = ref(null);
const studentSessions = ref([]);
const studentHistory = ref([]);
const loadingStudentDetails = ref(false);

// Promotion modal
const showPromoteModal = ref(false);
const studentsToPromote = ref([]);
const promotingStudents = ref(false);
const promotionType = ref(''); // 'semester' or 'year' or 'graduation'

// Computed properties
const hasChanges = computed(() => {
  return pendingChanges.value.size > 0;
});

const eligibleFirstSemesterStudents = computed(() => {
  return firstSemesterStudents.value.filter(student => isEligibleForPromotion(student));
});

const eligibleSecondSemesterStudents = computed(() => {
  return secondSemesterStudents.value.filter(student => isEligibleForPromotion(student));
});

// Check if 2nd semester is available for this subject
const is2ndSemesterAvailable = computed(() => {
  if (!selectedClass.value || !selectedClass.value.sspSubject) {
    return false;
  }
  
  // Check if secondSemesterSessions exist and have content
  return selectedClass.value.sspSubject.secondSemesterSessions && 
         selectedClass.value.sspSubject.secondSemesterSessions.length > 0;
});

const overallCompliancePercentage = computed(() => {
  if (!sessionMatrix.value.students || !sessionMatrix.value.students.length || 
      !sessionMatrix.value.sessions || !sessionMatrix.value.sessions.length) {
    return 0;
  }
  
  // Calculate the total number of possible completions
  const totalPossible = sessionMatrix.value.students.length * sessionMatrix.value.sessions.length;
  
  // Count completed sessions
  let completed = 0;
  
  sessionMatrix.value.students.forEach(student => {
    Object.values(student.sessions).forEach(session => {
      if (session.completed) {
        completed++;
      }
    });
  });
  
  // Calculate and return percentage
  return Math.round((completed / totalPossible) * 100);
});

// Add these computed properties
const firstSemesterStudents = computed(() => {
  if (!sessionMatrix.value.students || !sessionMatrix.value.students.length) {
    return [];
  }
  
  // Students who haven't completed first semester yet
  let filteredStudents = sessionMatrix.value.students.filter(student => {
    // Check if student has any session marked with '1st Semester (Completed)'
    const hasCompletedFirstSemester = Object.values(student.sessions || {}).some(
      session => session.semester === '1st Semester (Completed)'
    );
    
    // Check if student has any 2nd semester sessions
    const hasSecondSemesterSessions = Object.values(student.sessions || {}).some(
      session => session.semester === '2nd Semester'
    );
    
    // Include in 1st semester if NOT completed 1st semester and NO 2nd semester sessions
    return !hasCompletedFirstSemester && !hasSecondSemesterSessions;
  });
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filteredStudents = filteredStudents.filter(student => 
      student.name.toLowerCase().includes(query) ||
      student.idNumber.toLowerCase().includes(query)
    );
  }
  
  return filteredStudents;
});

// Add currentSemesterStudents computed property
const currentSemesterStudents = computed(() => {
  return activeTab.value === '1st' ? firstSemesterStudents.value : secondSemesterStudents.value;
});

// Add currentSemesterCompliancePercentage computed property
const currentSemesterCompliancePercentage = computed(() => {
  const students = currentSemesterStudents.value;
  const sessions = activeTab.value === '1st' ? firstSemesterSessions.value : secondSemesterSessions.value;
  
  if (!students.length || !sessions.length) return 0;
  
  // Calculate the total possible completions for the current semester
  const totalPossible = students.length * sessions.length;
  
  // Count completed sessions for the current semester only
  let completed = 0;
  
  students.forEach(student => {
    sessions.forEach(session => {
      const sessionCompletion = student.sessions[session._id];
      if (sessionCompletion && sessionCompletion.completed) {
        completed++;
      }
    });
  });
  
  // Calculate percentage
  return Math.round((completed / totalPossible) * 100);
});

const secondSemesterStudents = computed(() => {
  if (!sessionMatrix.value.students || !sessionMatrix.value.students.length) {
    return [];
  }
  
  // Students who have completed 1st semester or have 2nd semester sessions
  let filteredStudents = sessionMatrix.value.students.filter(student => {
    // Check if student has any session marked with '1st Semester (Completed)'
    const hasCompletedFirstSemester = Object.values(student.sessions || {}).some(
      session => session.semester === '1st Semester (Completed)'
    );
    
    // Check if student has any 2nd semester sessions
    const hasSecondSemesterSessions = Object.values(student.sessions || {}).some(
      session => session.semester === '2nd Semester'
    );
    
    // Include in 2nd semester if completed 1st semester OR has 2nd semester sessions
    return hasCompletedFirstSemester || hasSecondSemesterSessions;
  });
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filteredStudents = filteredStudents.filter(student => 
      student.name.toLowerCase().includes(query) ||
      student.idNumber.toLowerCase().includes(query)
    );
  }
  
  return filteredStudents;
});

const firstSemesterSessions = computed(() => {
  if (!sessionMatrix.value.sessions || !sessionMatrix.value.sessions.length) {
    return [];
  }
  
  // Filter sessions for 1st semester
  return sessionMatrix.value.sessions.filter(session => {
    // Check for explicit semester marking or use day range
    const isSemesterMarked = session.semester === '1st Semester';
    const isNotSecondSemester = session.semester !== '2nd Semester';
    const isDayInRange = session.day < 18; // Assuming 0-17 are 1st semester
    
    return isSemesterMarked || (isNotSecondSemester && isDayInRange);
  });
});

const secondSemesterSessions = computed(() => {
  if (!sessionMatrix.value.sessions || !sessionMatrix.value.sessions.length) {
    return [];
  }
  
  // Filter sessions for 2nd semester
  return sessionMatrix.value.sessions.filter(session => {
    // Check for explicit semester marking or use day range
    const isSemesterMarked = session.semester === '2nd Semester';
    const isNotFirstSemester = session.semester !== '1st Semester';
    const isDayInRange = session.day >= 18; // Assuming 18+ are 2nd semester
    
    return isSemesterMarked || (isNotFirstSemester && isDayInRange);
  });
});

// Computed property to check if all students are eligible for bulk promotion
const allStudentsEligibleForPromotion = computed(() => {
  const students = currentSemesterStudents.value;
  
  if (!students.length) return false;
  
  // Check if ALL students are eligible for promotion
  return students.every(student => isEligibleForPromotion(student));
});

// Computed property to get the promotion type
const getPromotionType = computed(() => {
  if (!allStudentsEligibleForPromotion.value) return null;
  
  if (activeTab.value === '1st') {
    return 'semester'; // 1st to 2nd semester
  } else if (isGraduationClass.value) {
    return 'graduation'; // 4th year 2nd semester to graduation
  } else {
    return 'year'; // 2nd semester to next year
  }
});

// Computed property to check if this is 4th year 2nd semester (graduation class)
const isGraduationClass = computed(() => {
  if (!selectedClass.value || activeTab.value !== '2nd') return false;
  
  const yearLevel = selectedClass.value.yearLevel;
  return yearLevel && (
    yearLevel.includes('4th') || 
    yearLevel.includes('4') || 
    yearLevel.toLowerCase().includes('fourth')
  );
});

// Check if there are any eligible students in the current class
const hasEligibleStudentsInClass = computed(() => {
  const students = currentSemesterStudents.value;
  return students.some(student => isEligibleForPromotion(student));
});


// Drop functionality removed - now handled by admin only

// Lifecycle hooks
onMounted(async () => {
  try {
    await loadClasses();
  } catch (error) {
    notificationService.showError('Failed to load advisory classes');
  } finally {
    loading.value = false;
  }
});

// Functions
async function loadClasses() {
  try {
    loading.value = true;
    errorMessage.value = '';
    
    // Use the enhanced adviser service to get classes
    const loadedClasses = await adviserService.getAdvisedClasses();
    
    if (!loadedClasses || loadedClasses.length === 0) {
      classes.value = [];
      
      // Check token information to diagnose potential authentication issues
      const token = localStorage.getItem('token');
      if (!token) {
        notificationService.showError('Authentication error: No token found. Please log out and log in again.');
      } else if (!authStore.user || !authStore.user.role) {
        notificationService.showError('Authentication error: User information not complete. Please log out and log in again.');
      } else if (authStore.user.role !== 'adviser') {
        notificationService.showError(`You are logged in as a ${authStore.user.role}, not as an adviser.`);
      } else {
        notificationService.showWarning('No advisory classes found. This could be due to a connection issue or you may not have classes assigned yet.');
      }
      return;
    }
    
    // Sort classes by year level and section
    loadedClasses.sort((a, b) => {
      // Sort by year level first
      if (a.yearLevel !== b.yearLevel) {
        return a.yearLevel.localeCompare(b.yearLevel);
      }
      // Then by section
      return a.section.localeCompare(b.section);
    });
    
    // Store in our reactive reference
    classes.value = loadedClasses;
    
    // Auto-select the first class if available and none is currently selected
    if (classes.value.length > 0 && !selectedClass.value) {
      await selectClass(classes.value[0]);
    }
  } catch (error) {
    errorMessage.value = `Failed to load classes: ${error.message}`;
    classes.value = [];
    
    // Provide a more specific error message based on the error
    if (error.message.includes('NetworkError') || error.message.includes('Network Error')) {
      notificationService.showError('Failed to load advisory classes: Network error. Please check your internet connection.');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      notificationService.showError('Failed to load advisory classes: Authentication error. Please log out and log in again.');
    } else {
      notificationService.showError(`Failed to load advisory classes: ${error.message}`);
    }
  } finally {
    loading.value = false;
  }
}

async function selectClass(classData) {
  try {
    if (!classData || !classData._id) {
      notificationService.showError('Invalid class data received');
      return;
    }
    
    loading.value = true;
    errorMessage.value = '';
    selectedClass.value = classData;
    
    // Store selected class ID in localStorage
    localStorage.setItem('selectedClassId', classData._id);

    // If the class already has students array populated, use it
    if (classData.students && Array.isArray(classData.students) && classData.students.length > 0) {
      students.value = classData.students;
    } else {
      // Otherwise load students from the API
      try {
        const loadedStudents = await studentService.loadStudentsByClass(classData._id);
        
        if (!loadedStudents || loadedStudents.length === 0) {
          students.value = [];
          notificationService.showWarning('No students found in this class');
        } else {
          students.value = loadedStudents;
        }
      } catch (studentError) {
        errorMessage.value = `Failed to load students: ${studentError.message}`;
        notificationService.showError(`Error loading students: ${studentError.message}`);
        students.value = [];
      }
    }

    // Load subject data if needed
    try {
      // Check for first semester subject
      if (classData.firstSemester && classData.firstSemester.sspSubject && !classData.firstSemester.sspSubjectData) {
        const firstSemesterSubject = await api.get(`/subjects/${classData.firstSemester.sspSubject}`);
        if (firstSemesterSubject.data) {
          // Add the subject data to the class object
          selectedClass.value.firstSemester.sspSubjectData = firstSemesterSubject.data;
          console.log('Loaded first semester subject data');
        }
      }
      
      // Check for second semester subject
      if (classData.secondSemester && classData.secondSemester.sspSubject && !classData.secondSemester.sspSubjectData) {
        const secondSemesterSubject = await api.get(`/subjects/${classData.secondSemester.sspSubject}`);
        if (secondSemesterSubject.data) {
          // Add the subject data to the class object
          selectedClass.value.secondSemester.sspSubjectData = secondSemesterSubject.data;
          console.log('Loaded second semester subject data');
        }
      }
    } catch (subjectError) {
      console.error('Error loading subject data:', subjectError);
      // Continue anyway, this is not critical
    }

    try {
      // First load the session matrix with includeBothSemesters=true
      console.log('Loading session matrix with both semesters');
      matrixLoading.value = true;
      const matrix = await sessionService.getSessionMatrix(classData._id);
      
      if (!matrix || !matrix.data) {
        sessionMatrix.value = {
          sessions: [],
          students: []
        };
        notificationService.showWarning('Unable to load session data. Some features may be limited.');
      } else {
        sessionMatrix.value = matrix.data;
        
        // Log session information for debugging
        const firstSemCount = sessionMatrix.value.sessions?.filter(s => s.semester === '1st Semester').length || 0;
        const secondSemCount = sessionMatrix.value.sessions?.filter(s => s.semester === '2nd Semester').length || 0;
        console.log(`Loaded ${sessionMatrix.value.sessions?.length} total sessions (${firstSemCount} 1st semester, ${secondSemCount} 2nd semester)`);
        
        // Check if we have data in the matrix but didn't get students earlier
        if (students.value.length === 0 && sessionMatrix.value.students && sessionMatrix.value.students.length > 0) {
          // Convert matrix students to compatible format if we have access to users
          const matrixStudents = sessionMatrix.value.students
            .filter(s => s.id && s.name)
            .map(s => ({
              _id: s.id,
              user: {
                firstName: s.name.split(' ')[0] || '',
                lastName: s.name.split(' ')[1] || '',
                idNumber: s.idNumber || 'Unknown'
              }
            }));
          
          if (matrixStudents.length > 0) {
            students.value = matrixStudents;
          }
        }
        
        // Ensure all sessions exist for every student
        await ensureSessionsExist();
      }
    } catch (matrixError) {
      errorMessage.value = `Failed to load session matrix: ${matrixError.message}`;
      notificationService.showError(`Error loading session data: ${matrixError.message}`);
      sessionMatrix.value = {
        sessions: [],
        students: []
      };
    } finally {
      matrixLoading.value = false;
    }
    
    // Reset selected student when changing class
    sessions.value = [];
  } catch (error) {
    errorMessage.value = `Error selecting class: ${error.message}`;
    notificationService.showError(`Failed to select class: ${error.message}`);
  } finally {
    loading.value = false;
  }
}

async function loadSessionCompletionStatus() {
  if (!selectedClass.value || !selectedClass.value._id) {
    return;
  }
  
  matrixLoading.value = true;
  
  try {
    // First validate the session data to make sure all sessions exist
    await sessionService.validateClassSessions(selectedClass.value._id);
    
    // Get session matrix from API
    const matrixResponse = await sessionService.getSessionMatrix(selectedClass.value._id);
    
    if (matrixResponse && matrixResponse.data) {
      sessionMatrix.value = matrixResponse.data;
      
      // Make sure each session has a title for display
      if (sessionMatrix.value.sessions) {
        sessionMatrix.value.sessions.forEach(session => {
          if (!session.title && session.day !== undefined) {
            session.title = `Day ${session.day + 1}`;
          }
        });
      }
    } else {
      sessionMatrix.value = {
        sessions: [],
        students: []
      };
    }
  } catch (error) {
    notificationService.showError('Failed to load session data');
    sessionMatrix.value = {
      sessions: [],
      students: []
    };
  } finally {
    matrixLoading.value = false;
  }
}

async function initializeSessionsForStudents(classItem, semester) {
  if (!classItem.students || !classItem.students.length) {
    return;
  }
  
  // Process in batches to avoid overwhelming the server
  const batchSize = 5;
  const students = [...classItem.students];
  
  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    
    const promises = batch.map(async (student) => {
      try {
        await sessionService.initSessionsForStudent(student._id, classItem._id, semester);
      } catch (error) {
        // Ignore "already initialized" errors
        if (!error.response || error.response.status !== 400) {
          // Non-critical error, continue with other students
        }
      }
    });
    
    await Promise.all(promises);
    
    // Small delay between batches to prevent server overload
    if (i + batchSize < students.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

// Toggle session completion status
async function toggleSessionCompletion(studentId, sessionId, completed) {
  try {
    // Find the student in the matrix
    const student = sessionMatrix.value.students.find(s => s.id === studentId);
    if (!student) {
      return;
    }
    
    // Initialize sessions object if it doesn't exist
    if (!student.sessions) {
      student.sessions = {};
    }
    
    // Check if the session exists
    if (!student.sessions[sessionId]) {
      // Create a new session entry if it doesn't exist
      student.sessions[sessionId] = {
        id: null,
        completed: completed,
        semester: sessionMatrix.value.sessions.find(s => s._id === sessionId)?.semester || '1st Semester'
      };
    }
    
    // Try to update via direct API call first
    try {
      // If we have a session ID, use updateSessionStatus
      if (student.sessions[sessionId].id) {
        // Get the session completion record ID
        const sessionCompletionId = student.sessions[sessionId].id;
        
        // Add to pending changes
        const changeKey = `${studentId}_${sessionId}`;
        pendingChanges.value.set(changeKey, {
          sessionId: sessionCompletionId,
          completed: completed
        });
        
        // Call the direct API endpoint for immediate update
        const response = await sessionService.updateSessionStatus(sessionCompletionId, completed);
        
        // Remove from pending changes since update was successful
        pendingChanges.value.delete(changeKey);
      } else {
        // Use the update-status endpoint for creating new session records
        const response = await api.post('/sessions/update-status', {
          classId: selectedClass.value._id,
          studentId: studentId,
          sessionId: sessionId,
          completed: completed
        });
        
        if (response.data && response.data.session) {
          // Update the session data with the response
          student.sessions[sessionId] = {
            ...student.sessions[sessionId],
            id: response.data.session._id,
            completed: completed,
            completionDate: completed ? new Date() : null
          };
        } else {
          notificationService.showWarning('Session updated but response was unexpected');
        }
      }
      
      // After successful session completion, check for M&M notifications and refresh M&M data
      // This works for both 1st and 2nd semester sessions
      if (completed) {
        console.log(`Session ${sessionId} completed for student ${studentId}, checking for M&M updates...`);
        
        // Refresh the student's M&M submissions to get latest data
        await fetchStudentMMSubmissions(student);
        
        // Force a reactive update by updating the student object
        const studentIndex = sessionMatrix.value.students.findIndex(s => s.id === studentId);
        if (studentIndex !== -1) {
          // Trigger reactivity by updating the student object
          sessionMatrix.value.students[studentIndex] = { ...student };
        }
        
        // Small delay to ensure the session completion is saved before checking
        setTimeout(async () => {
          try {
            await checkSessionsAndSendMMNotifications();
            console.log('M&M notification check completed after session completion');
          } catch (notificationError) {
            console.warn('Error checking M&M notifications after session completion:', notificationError);
          }
        }, 1000);
      }
      
    } catch (apiError) {
      // Keep in pending changes to retry later with bulk save
      notificationService.showWarning('Session status will be updated when you save changes');
    }
  } catch (error) {
    notificationService.showError('Failed to update session status');
  }
}

// Save all pending changes
async function saveChanges() {
  if (!selectedClass.value || !selectedClass.value._id || !pendingChanges.value.size) {
    return;
  }
  
  saving.value = true;
  
  try {
    // Convert the Map to an array of updates
    const updates = Array.from(pendingChanges.value.values());
    
    // Call the API to save changes
    await sessionService.bulkUpdateSessions(selectedClass.value._id, updates);
    
    // Clear pending changes after successful save
      pendingChanges.value.clear();
      
    // Refresh the session matrix
    await loadSessionCompletionStatus();
    
    // Check for M&M notifications after bulk session updates
    // This ensures notifications are sent for both 1st and 2nd semester students
    console.log('Checking for M&M notifications after bulk session updates...');
    await checkSessionsAndSendMMNotifications();
    
    // Show success notification
    notificationService.showSuccess('Changes saved successfully');
  } catch (error) {
    notificationService.showError('Failed to save changes: ' + error.message);
  } finally {
    saving.value = false;
  }
}

// Refresh session matrix - used when needed to update the UI with the latest data
async function refreshSessionMatrix() {
  if (!selectedClass.value || !selectedClass.value._id) {
    return;
  }
  
  matrixLoading.value = true;
  
  try {
    // Reset the session matrix before fetching new data
    sessionMatrix.value = { students: [], sessions: [] };
    
    // First, fetch the class again to ensure we have the most up-to-date student list and semester details
    try {
      console.log(`Refreshing class data for ${selectedClass.value._id}`);
      const classResponse = await api.get(`/classes/${selectedClass.value._id}`);
      
      if (classResponse && classResponse.data) {
        // Update selected class data with latest info
        const classData = classResponse.data;
        
        // Log the received class data for debugging
        console.log('Received class data:', {
          id: classData._id,
          yearLevel: classData.yearLevel,
          section: classData.section,
          firstSemester: {
            room: classData.firstSemester?.room,
            daySchedule: classData.firstSemester?.daySchedule,
            timeSchedule: classData.firstSemester?.timeSchedule,
            sspSubject: classData.firstSemester?.sspSubject ? 
              (typeof classData.firstSemester.sspSubject === 'object' ? 
                classData.firstSemester.sspSubject._id : 
                classData.firstSemester.sspSubject) : 
              'None'
          },
          secondSemester: {
            room: classData.secondSemester?.room,
            daySchedule: classData.secondSemester?.daySchedule,
            timeSchedule: classData.secondSemester?.timeSchedule,
            sspSubject: classData.secondSemester?.sspSubject ? 
              (typeof classData.secondSemester.sspSubject === 'object' ? 
                classData.secondSemester.sspSubject._id : 
                classData.secondSemester.sspSubject) : 
              'None'
          },
          students: classData.students?.length || 0
        });
        
        // Ensure we preserve first and second semester data
        selectedClass.value = {
          ...classData,
          firstSemester: classData.firstSemester || selectedClass.value.firstSemester,
          secondSemester: classData.secondSemester || selectedClass.value.secondSemester
        };
        
        console.log(`Updated class data with ${selectedClass.value.students?.length || 0} students`);
      }
    } catch (classError) {
      console.error('Error refreshing class data:', classError);
    }
    
    // Now fetch the session matrix
    const matrixResponse = await sessionService.getSessionMatrix(selectedClass.value._id);
    
    if (matrixResponse && matrixResponse.data) {
      sessionMatrix.value = matrixResponse.data;
      console.log(`Refreshed matrix with ${sessionMatrix.value.students?.length || 0} students and ${sessionMatrix.value.sessions?.length || 0} sessions`);
      
      // Log semester distribution for debugging
      const firstSem = sessionMatrix.value.sessions?.filter(s => s.semester === '1st Semester' || (!s.semester && s.day < 18)).length || 0;
      const secondSem = sessionMatrix.value.sessions?.filter(s => s.semester === '2nd Semester' || (!s.semester && s.day >= 18)).length || 0;
      
      console.log(`Sessions by semester: 1st=${firstSem}, 2nd=${secondSem}`);
      
      // Ensure first and second semester student lists are up to date
      updateSemesterStudentLists();
      
      // Check Odyssey Plan status for all students
      await checkAllStudentsOdysseyPlans();
      
      // Check M&M completion status for all students
      await checkAllStudentsMM();
      
      // Check permit submissions for all students
      await checkAllStudentsPermits();
      
      // Fetch detailed M&M submissions for all students to enable exam session logic (fallback)
      console.log('Fetching detailed M&M submissions for all students (fallback)...');
      if (sessionMatrix.value.students) {
        for (const student of sessionMatrix.value.students) {
          await fetchStudentMMSubmissions(student);
        }
      }
      
      // Check sessions and send M&M notifications if needed
      await checkSessionsAndSendMMNotifications();
    } else {
      console.error('Invalid matrix data received during refresh');
      
      // Try a manual session matrix load as a fallback
      try {
        console.log('Attempting manual session matrix construction as fallback');
        const manualMatrix = await sessionService.loadSessionMatrix(selectedClass.value._id);
        
        if (manualMatrix && manualMatrix.students && manualMatrix.students.length > 0) {
          sessionMatrix.value = manualMatrix;
          console.log(`Manually constructed matrix with ${sessionMatrix.value.students?.length || 0} students and ${sessionMatrix.value.sessions?.length || 0} sessions`);
          
          // Ensure first and second semester student lists are up to date
          updateSemesterStudentLists();
          
          // Check Odyssey Plan status for all students
          await checkAllStudentsOdysseyPlans();
          
          // Check M&M completion status for all students
          await checkAllStudentsMM();
          
          // Fetch detailed M&M submissions for all students to enable exam session logic (fallback)
          console.log('Fetching detailed M&M submissions for all students (fallback)...');
          if (sessionMatrix.value.students) {
            for (const student of sessionMatrix.value.students) {
              await fetchStudentMMSubmissions(student);
            }
          }
          
          // Check sessions and send M&M notifications if needed
          await checkSessionsAndSendMMNotifications();
        }
      } catch (fallbackError) {
        console.error('Manual matrix construction failed:', fallbackError);
      }
    }
  } catch (error) {
    console.error(`Error refreshing session matrix: ${error.message}`);
    // Only show error notification if it's a critical error, not just a network issue
    if (error.message && !error.message.includes('Network') && !error.message.includes('timeout')) {
      notificationService.showWarning('Some session data may not be up to date');
    }
  } finally {
    matrixLoading.value = false;
  }
}

// New helper function to update semester student lists
function updateSemesterStudentLists() {
  if (!sessionMatrix.value || !sessionMatrix.value.students) return;
  
  console.log(`Updating semester student lists with ${sessionMatrix.value.students.length} total students`);
  
  // Get unique first and second semester students
  const firstSemStudentIds = new Set();
  const secondSemStudentIds = new Set();
  
  // Categorize students by sessions
  sessionMatrix.value.students.forEach(student => {
    let hasFirstSemSessions = false;
    let hasSecondSemSessions = false;
    let hasCompletedFirstSemester = false;
    
    // Check each session
    Object.entries(student.sessions || {}).forEach(([sessionId, session]) => {
      // Check if session is explicitly marked as 1st semester
      if (session.semester === '1st Semester') {
        hasFirstSemSessions = true;
      }
      // Check if session is explicitly marked as 2nd semester
      else if (session.semester === '2nd Semester') {
        hasSecondSemSessions = true;
      }
      // Check if session is marked as completed 1st semester (archived)
      else if (session.semester === '1st Semester (Completed)') {
        hasCompletedFirstSemester = true;
      }
      // If no explicit semester, use day number as a fallback
      else if (session.sessionDay !== undefined) {
        if (session.sessionDay < 18) {
          hasFirstSemSessions = true;
        } else {
          hasSecondSemSessions = true;
        }
      }
    });
    
    // Log the categorization for debugging
    console.log(`Student ${student.name} (${student.id}): 1st semester=${hasFirstSemSessions}, 2nd semester=${hasSecondSemSessions}, completed 1st=${hasCompletedFirstSemester}`);
    
    // Special case: If student has completed first semester or has second semester sessions, 
    // they should be in second semester regardless of first semester sessions
    if (hasSecondSemSessions || hasCompletedFirstSemester) {
      secondSemStudentIds.add(student.id);
      
      // Extra logging for students being placed in 2nd semester
      console.log(`Student ${student.name} (${student.id}) categorized as 2nd semester student`);
    } 
    // Otherwise, if they have first semester sessions, they're in first semester
    else if (hasFirstSemSessions) {
      firstSemStudentIds.add(student.id);
      
      // Extra logging for students being placed in 1st semester
      console.log(`Student ${student.name} (${student.id}) categorized as 1st semester student`);
    }
    // If student has no sessions yet, default to current tab's semester
    else {
      console.log(`Student ${student.name} (${student.id}) has no sessions, defaulting to current tab (${activeTab.value})`);
      
      if (activeTab.value === '1st') {
        firstSemStudentIds.add(student.id);
      } else {
        secondSemStudentIds.add(student.id);
      }
    }
  });
  
  // Update the reactive semester student lists
  firstSemesterStudents.value = sessionMatrix.value.students.filter(student => 
    firstSemStudentIds.has(student.id)
  );
  
  secondSemesterStudents.value = sessionMatrix.value.students.filter(student => 
    secondSemStudentIds.has(student.id)
  );
  
  console.log(`Updated semester student lists: 1st=${firstSemesterStudents.value.length}, 2nd=${secondSemesterStudents.value.length}`);
  
  // List all students in each semester for debugging
  console.log('1st Semester Students:', firstSemesterStudents.value.map(s => `${s.name} (${s.id})`));
  console.log('2nd Semester Students:', secondSemesterStudents.value.map(s => `${s.name} (${s.id})`));
}

function getStudentCompliancePercentage(student) {
  if (!student || !student.sessions) return 0;
  
  // Determine which semester we're viewing
  const isFirstSemester = activeTab.value === '1st';
  
  // Count completed sessions only for the current semester
  let completed = 0;
  let total = 0;
  
  for (const sessionId in student.sessions) {
    const session = student.sessions[sessionId];
    
    // Filter sessions by semester
    if (isFirstSemester) {
      // Include sessions that are 1st semester or have no semester specified (legacy data)
      if (session.semester === '1st Semester' || !session.semester) {
        total++;
        if (session.completed) {
          completed++;
        }
      }
    } else {
      // Include only 2nd semester sessions
      if (session.semester === '2nd Semester') {
        total++;
        if (session.completed) {
          completed++;
        }
      }
    }
  }
  
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

function getSessionCompletionPercentage(sessionId) {
  if (!sessionMatrix.value.students || sessionMatrix.value.students.length === 0) return 0;
  
  const totalStudents = sessionMatrix.value.students.length;
  if (totalStudents === 0) return 0;
  
  const completedCount = sessionMatrix.value.students.reduce((count, student) => {
    return count + (student.sessions[sessionId]?.completed ? 1 : 0);
  }, 0);
  
  return Math.round((completedCount / totalStudents) * 100);
}

function getComplianceClass(percentage) {
  if (percentage < 50) {
  return 'bg-red-100 text-red-800';
  } else if (percentage < 80) {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-green-100 text-green-800';
  }
}

// Add this function to format session status for display
function getSessionStatusBadge(completed) {
  return completed 
    ? '<span class="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">Submitted</span>' 
    : '<span class="px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">Pending</span>';
}

// Add this function to get student name with proper formatting
function getStudentFullName(student) {
  if (!student || !student.user) return 'Unknown Student';
  return `${student.user.firstName || ''} ${student.user.lastName || ''}`.trim() || 'Unknown';
}

// Student details modal functionality
async function viewStudentDetails(student) {
  try {
    selectedStudent.value = student;
    showStudentModal.value = true;
    loadingStudentDetails.value = true;
    
    // Load student details, sessions, and history
    await loadStudentDetailsData(student);
  } catch (error) {
    console.error('Error viewing student details:', error);
    notificationService.showError('Failed to load student details');
  } finally {
    loadingStudentDetails.value = false;
  }
}

async function reloadStudentData() {
  if (!selectedStudent.value) return;
  
  try {
    loadingStudentDetails.value = true;
    await loadStudentDetailsData(selectedStudent.value);
    notificationService.showSuccess('Student data reloaded successfully');
  } catch (error) {
    console.error('Error reloading student data:', error);
    notificationService.showError('Failed to reload student data');
  } finally {
    loadingStudentDetails.value = false;
  }
}

async function loadStudentDetailsData(student) {
  try {
    // First, get the complete student data with sessions using the admin endpoint
    // We need to use the proper student ID
    const studentId = student.realId || student._id || student.id;
    console.log('Loading student details for ID:', studentId, 'Original student:', student);
    
    // Always ensure we have basic student data first
    selectedStudent.value = {
      ...student,
      realId: studentId
    };
    
    try {
      // Load complete student data including sessions, contact info, and address
      const studentResponse = await api.get(`/students/${studentId}`);
      console.log('Student API Response:', studentResponse);
      
      if (studentResponse.data && studentResponse.data.success) {
        console.log('Loaded complete student data:', studentResponse.data.data);
        // Merge the complete data with existing data
        selectedStudent.value = {
          ...selectedStudent.value,
          ...studentResponse.data.data,
          realId: studentId
        };
        console.log('Updated selectedStudent:', selectedStudent.value);
      } else {
        console.warn('Student API returned unsuccessful response:', studentResponse.data);
      }
    } catch (studentError) {
      console.error('Failed to load student details:', studentError);
      notificationService.showWarning('Could not load complete student details, showing basic information');
    }
    
    try {
      // Load student sessions with detailed information  
      const sessionResponse = await api.get(`/students/${studentId}/sessions`);
      console.log('Sessions API Response:', sessionResponse);
      
      if (sessionResponse.data && sessionResponse.data.success) {
        console.log('Loaded student sessions:', sessionResponse.data.data);
        studentSessions.value = sessionResponse.data.data || {};
      } else {
        console.warn('Sessions API returned unsuccessful response:', sessionResponse.data);
        studentSessions.value = {};
      }
    } catch (sessionError) {
      console.error('Failed to load student sessions:', sessionError);
      studentSessions.value = {};
    }
    
    // Load student history
    try {
      const historyResponse = await sessionService.getStudentHistory(studentId);
      studentHistory.value = historyResponse.data || [];
    } catch (historyError) {
      console.warn('Could not load student history:', historyError);
      studentHistory.value = [];
    }
  } catch (error) {
    console.error('Critical error in loadStudentDetailsData:', error);
    // Ensure we still have basic student data even if everything fails
    selectedStudent.value = {
      ...student,
      realId: student.realId || student._id || student.id
    };
    studentSessions.value = {};
    studentHistory.value = [];
  }
}

// Bulk promotion functionality
function hasIneligibleStudents(semester) {
  const students = semester === '1st' ? firstSemesterStudents.value : secondSemesterStudents.value;
  return students.some(student => !isEligibleForPromotion(student));
}


async function promoteToSecondSemester(student) {
  if (!student || !selectedClass.value) return;
  
  try {
    console.log(`Promoting student ${student.name} from 1st to 2nd semester`);
    
    // Archive current semester sessions
    await sessionService.archiveStudentSessions(
      selectedClass.value._id, 
      student.id,
      false // Not a year-level promotion, just semester
    );
    
    // Update student semester completion status directly
    const response = await api.post('/students/promote-semester', {
      studentId: student.id,
      classId: selectedClass.value._id,
      fromSemester: '1st Semester',
      toSemester: '2nd Semester'
    });

    if (response.data && response.data.success) {
      console.log(`Student ${student.name} promoted to 2nd semester`);
      return { success: true };
    } else {
      throw new Error(response.data?.message || 'Failed to promote student to next semester');
    }
  } catch (error) {
    console.error('Error promoting to next semester:', error);
    throw error;
  }
}


// Request student drop functionality
async function requestStudentDrop(student, reason) {
  try {
    const response = await api.post('/admin/drop-requests', {
      studentId: student.realId || student.id,
      classId: selectedClass.value._id,
      reason: reason
    });
    
    if (response.data.success) {
      notificationService.showSuccess('Drop request submitted to admin for review');
      showStudentModal.value = false;
    } else {
      throw new Error(response.data.message || 'Failed to submit drop request');
    }
  } catch (error) {
    console.error('Error submitting drop request:', error);
    notificationService.showError('Failed to submit drop request');
  }
}

function getStudentById(studentId) {
  return sessionMatrix.value.students.find(student => student.id === studentId);
}

// Function to ensure sessions exist
async function ensureSessionsExist() {
  if (!selectedClass.value || !selectedClass.value._id) {
    return;
  }
  
  matrixLoading.value = true;
  
  try {
    // Call the API endpoint that validates and creates missing sessions
    await api.post(`/sessions/validate/${selectedClass.value._id}`);
    
    // Now refresh the matrix
    await refreshSessionMatrix();
    
    console.log('Session validation completed, matrix refreshed');
  } catch (error) {
    console.error('Error ensuring sessions exist:', error);
  } finally {
    matrixLoading.value = false;
  }
}

// Function to notify a student about missing sessions
async function notifyStudent(student) {
  if (!student || !student.id) {
    notificationService.showError('Invalid student data');
    return;
  }
  
  try {
    // Get missing session count
    const missingCount = getStudentMissingSessionsCount(student);
    
    // Check Odyssey Plan completion status for this student
    const hasCompletedOdysseyPlan = await checkOdysseyPlanStatus(student);
    
    // Check M&M completion status for this student
    const hasCompletedMM = await checkMMCompletionStatus(student);
    
    // If student has completed enough sessions to be promoted but hasn't completed requirements
    const sessionEligibleForPromotion = missingCount <= 2;
    
    if (sessionEligibleForPromotion) {
      // Check what's missing for promotion
      if (!hasCompletedOdysseyPlan && !hasCompletedMM) {
        
        if (confirm('Send reminder for Odyssey Plan?')) {
      await sendOdysseyPlanReminder(student);
        }
        return;
      } else if (!hasCompletedOdysseyPlan) {
        // Only Odyssey Plan missing
        await sendOdysseyPlanReminder(student);
      notificationService.showInfo(`Odyssey Plan reminder sent to ${student.name}`);
      return;
      } else if (!hasCompletedMM) {
        // Only M&M missing
        notificationService.showInfo(`${student.name} needs to complete M&M submissions before promotion.`);
        return;
      }
    }
    
    // Send session reminders if needed
    if (missingCount > 2) {
      const isFirstSemester = firstSemesterStudents.value.some(s => s.id === student.id);
      const totalSessions = Object.keys(student.sessions).length;
      const completedSessions = totalSessions - missingCount;
      
      let message = `You have ${missingCount} missing SSP sessions.`;
      message += ` Please complete your sessions. Currently completed: ${completedSessions}/${totalSessions}.`;
      
      console.log(`Sending session notification to student ${student.id}: ${message}`);
      
      const response = await sessionService.notifyStudent(
        selectedClass.value._id,
        student.id,
        message
      );
      
      if (response && response.success) {
        notificationService.showSuccess(`Session reminder sent to ${student.name}`);
      }
    } else if (missingCount === 0 && hasCompletedOdysseyPlan && hasCompletedMM) {
      notificationService.showInfo(`${student.name} has completed all requirements. Ready for promotion.`);
    }
  } catch (error) {
    console.error(`Failed to send reminder: ${error.message}`, error);
    notificationService.showError(`Failed to send reminder: ${error.message}`);
  }
}

// Helper function to count missing sessions
function getStudentMissingSessionsCount(student) {
  if (!student || !student.sessions) {
    console.log(`Student ${student?.name || 'unknown'} has no sessions property`);
    return 0;
  }
  
  // Get sessions for the current semester based on active tab
  const isFirstSemester = activeTab.value === '1st';
  
  // Filter session keys for the appropriate semester
  const sessionKeys = Object.keys(student.sessions).filter(sessionId => {
    const session = student.sessions[sessionId];
    if (isFirstSemester) {
      return session.semester === '1st Semester' || !session.semester;
    } else {
      return session.semester === '2nd Semester';
    }
  });
  
  if (sessionKeys.length === 0) {
    console.log(`Student ${student.name} has no ${isFirstSemester ? 'first' : 'second'} semester sessions`);
    return 0;
  }
  
  // Count missing sessions
  let missing = 0;
  let completed = 0;
  let total = sessionKeys.length;
  
  for (const sessionId of sessionKeys) {
    if (!student.sessions[sessionId].completed) {
      missing++;
    } else {
      completed++;
    }
  }
  
  console.log(`Student ${student.name}: ${completed}/${total} completed, ${missing} missing`);
  return missing;
}

function getSubjectCode(subjectId) {
  if (!subjectId) return 'No Subject';
  
  // Handle when subjectId is an object (already populated)
  if (typeof subjectId === 'object' && subjectId !== null) {
    return subjectId.sspCode || subjectId.code || 'Unknown Code';
  }
  
  // Try to find the subject in the classData
  if (selectedClass.value) {
    // Check first semester data
    if (selectedClass.value.firstSemester?.sspSubject === subjectId &&
        selectedClass.value.firstSemester?.sspSubjectData?.sspCode) {
      return selectedClass.value.firstSemester.sspSubjectData.sspCode;
    }
    
    // Check second semester data
    if (selectedClass.value.secondSemester?.sspSubject === subjectId &&
        selectedClass.value.secondSemester?.sspSubjectData?.sspCode) {
      return selectedClass.value.secondSemester.sspSubjectData.sspCode;
    }
    
    // Check if firstSemester/secondSemester contains direct subject data
    if (selectedClass.value.firstSemester?.sspSubject?.sspCode) {
      return selectedClass.value.firstSemester.sspSubject.sspCode;
    }
    
    if (selectedClass.value.secondSemester?.sspSubject?.sspCode) {
      return selectedClass.value.secondSemester.sspSubject.sspCode;
    }
    
    // Check if sspSubject is directly available
    if (selectedClass.value.sspSubject?._id === subjectId && selectedClass.value.sspSubject?.sspCode) {
      return selectedClass.value.sspSubject.sspCode;
    }
    
    // If sspSubject is an object with code
    if (selectedClass.value.sspSubject?.sspCode) {
      return selectedClass.value.sspSubject.sspCode;
    }
  }
  
  // Return a fallback
  return subjectId.toString().includes('object') ? 'Unknown Subject' : `SSP ${subjectId.toString().slice(-3)}`;
}

// Individual promotion functions removed - using bulk promotion only

// Replace the current isEligibleForPromotion function with this improved version
function isEligibleForPromotion(student) {
  if (!student || !student.sessions) return false;
  
  // Get the active semester
  const isFirstSemester = activeTab.value === '1st';
  
  // Filter sessions for the appropriate semester
  const semesterSessions = Object.keys(student.sessions).filter(sessionId => {
    const session = student.sessions[sessionId];
    if (isFirstSemester) {
      // For 1st semester, get only 1st semester sessions
      return session.semester === '1st Semester' || !session.semester;
    } else {
      // For 2nd semester, get only 2nd semester sessions
      return session.semester === '2nd Semester';
    }
  });
  
  if (semesterSessions.length === 0) return false;
  
  // Count completed sessions
  const completedCount = semesterSessions.filter(sessionId => 
    student.sessions[sessionId].completed
  ).length;
  
  // Allow at most 2 missing sessions (16 out of 18)
  const requiredCompleted = semesterSessions.length - 2;
  
  // NEW: Check that ALL exam sessions are completed (requirement)
  const examSessions = semesterSessions.filter(sessionId => {
    const session = sessionMatrix.value.sessions?.find(s => s._id === sessionId);
    return session && isExamSession(session);
  });
  
  const completedExamSessions = examSessions.filter(sessionId => 
    student.sessions[sessionId].completed
  );
  
  // ALL exam sessions must be completed for promotion
  const allExamSessionsCompleted = examSessions.length > 0 && 
    completedExamSessions.length === examSessions.length;
  
  console.log(`Promotion check for ${student.name}: 
    Sessions: ${completedCount}/${semesterSessions.length} (required: ${requiredCompleted})
    Exam sessions: ${completedExamSessions.length}/${examSessions.length} (all required)
    Odyssey Plan: ${student.odysseyPlanCompleted}
    M&M: ${student.mmCompleted}`);
  
  // Check if student has completed their Odyssey Plan
  const hasCompletedOdysseyPlan = student.odysseyPlanCompleted === true;
  
  // Check if student has completed their M&M submissions
  const hasCompletedMM = student.mmCompleted === true;
  
  // For promotion, student must meet ALL requirements:
  // 1. At least 16 out of 18 sessions completed
  // 2. ALL exam sessions completed (no exceptions)
  // 3. Odyssey Plan completed
  // 4. M&M submissions completed
  return completedCount >= requiredCompleted && 
         allExamSessionsCompleted && 
         hasCompletedOdysseyPlan && 
         hasCompletedMM;
}

// Add this new method to check Odyssey Plan status
async function checkOdysseyPlanStatus(student) {
  if (!student || !selectedClass.value) return false;
  
  try {
    // Determine current semester
    const semester = activeTab.value === '1st' ? '1st Semester' : '2nd Semester';
    
    console.log(`Checking Odyssey Plan for student ${student.name} (${student.id}) - ${semester}`);
    
    // Check Odyssey Plan completion
    const result = await adviserService.checkStudentOdysseyPlan(student.id, semester);
    
    // Store the result in the student object for later use
    student.odysseyPlanCompleted = result.completed;
    student.yearLevel = result.yearLevel;
    
    // Log for debugging
    console.log(`Student ${student.name} (year ${student.yearLevel}) Odyssey Plan completion for ${semester}: ${student.odysseyPlanCompleted}`);
    console.log('Odyssey Plan API response:', result);
    
    return result.completed;
  } catch (error) {
    console.error(`Error checking Odyssey Plan status for student ${student?.name}:`, error);
    // Set to false on error to be safe
    student.odysseyPlanCompleted = false;
    return false;
  }
}

// Add this new method to send Odyssey Plan reminder
async function sendOdysseyPlanReminder(student) {
  if (!student || !selectedClass.value) return;
  
  try {
    // Determine current semester
    const semester = activeTab.value === '1st' ? '1st Semester' : '2nd Semester';
    
    // Create notification message with clear purpose
    let message = `ODYSSEY PLAN REMINDER: You need to complete your Odyssey Plan for ${semester}. `;
    message += `This is a requirement for promotion. Please visit the Odyssey Plan page as soon as possible.`;
    
    console.log(`Sending Odyssey Plan reminder to student ${student.id}: ${message}`);
    
    // First try to use the adviser service
    try {
      const response = await adviserService.sendOdysseyPlanReminder(student.id, message);
      
      if (response && response.success) {
        notificationService.showSuccess(`Odyssey Plan reminder sent to ${student.name}`);
      } else {
        throw new Error(response?.message || 'Failed to send Odyssey Plan reminder');
      }
    } catch (apiError) {
      console.warn('Primary Odyssey Plan notification failed, trying fallback:', apiError);
      
      // Fallback to direct notification API
      const userId = sessionMatrix.value.students.find(s => s.id === student.id)?.userId;
      if (userId) {
        await api.post('/notifications/create', {
          userId: userId,
          title: 'Odyssey Plan Completion Required',
          message: message,
          type: 'warning'
        });
        notificationService.showSuccess(`Odyssey Plan reminder sent to ${student.name} (fallback method)`);
      } else {
        throw new Error('Could not find user ID for notification');
      }
    }
  } catch (error) {
    console.error('Error sending Odyssey Plan reminder:', error);
    notificationService.showError(`Failed to send Odyssey Plan reminder: ${error.message}`);
  }
}

// Add this new method to calculate semester-specific compliance percentage
function getSemesterCompliancePercentage(student, semester) {
  if (!student || !student.sessions) return 0;
  
  // Get sessions for the specified semester
  const semesterSessions = semester === '1st' ? 
    firstSemesterSessions.value.map(s => s._id) : 
    secondSemesterSessions.value.map(s => s._id);
  
  if (semesterSessions.length === 0) return 0;
  
  // Count completed sessions for this semester only
  let completed = 0;
  let total = 0;
  
  semesterSessions.forEach(sessionId => {
    if (student.sessions[sessionId]) {
      total++;
      if (student.sessions[sessionId].completed) {
        completed++;
      }
    }
  });
  
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

// Helper function to calculate the next year level
function calculateNextYearLevel(currentYearLevel) {
  // Extract the numeric part of the year level
  const yearMatch = currentYearLevel.match(/(\d+)/);
  if (!yearMatch) return 'Unknown';
  
  const currentYear = parseInt(yearMatch[1], 10);
  // Default is to increment by 1
  let nextYear = currentYear + 1;
  
  console.log(`Calculating next year level from "${currentYearLevel}" (numeric: ${currentYear})`);
  
  // Support special case for direct promotion from 2nd to 4th year
  if (currentYear === 2) {
    // Check if we need to skip to 4th year
    const fourthYearClasses = document.querySelectorAll('[data-year-level="4"], [data-year-level="4th"], [data-year-level="4th Year"]');
    const thirdYearClasses = document.querySelectorAll('[data-year-level="3"], [data-year-level="3rd"], [data-year-level="3rd Year"]');
    
    // If 4th year classes exist but no 3rd year classes, skip to 4th
    if (fourthYearClasses.length > 0 && thirdYearClasses.length === 0) {
      console.log(`PROMOTION DEBUG: Skipping from 2nd to 4th year directly as no 3rd year classes found`);
      nextYear = 4;
    }
  }
  
  // Handle special case for 2nd to 3rd year or 2nd to 4th year
  if (currentYear === 2) {
    // For 2nd year, we want to be explicit about the format
    // Check existing format
    if (currentYearLevel.includes('Year')) {
      return nextYear === 3 ? '3rd Year' : '4th Year';
    } else if (currentYearLevel.includes('nd')) {
      return nextYear === 3 ? '3rd' : '4th';
    } else {
      return `${nextYear}`;
    }
  }
  
  // For other years, use standard formatting logic
  // Check if there's "Year" in the string
  if (currentYearLevel.includes('Year')) {
    const suffix = nextYear === 1 ? 'st' : nextYear === 2 ? 'nd' : nextYear === 3 ? 'rd' : 'th';
    return `${nextYear}${suffix} Year`;
  } 
  // Check if there's a suffix (st, nd, rd, th)
  else if (/\d+(st|nd|rd|th)/.test(currentYearLevel)) {
    const suffix = nextYear === 1 ? 'st' : nextYear === 2 ? 'nd' : nextYear === 3 ? 'rd' : 'th';
    return `${nextYear}${suffix}`;
  }
  // Default to just the number
  else {
    return `${nextYear}`;
  }
}




// Helper function to complete all remaining sessions for a student
async function completeAllSessions(student) {
  if (!student || !student.sessions) return;
  
  const incompleteSessions = Object.entries(student.sessions)
    .filter(([_, session]) => !session.completed)
    .map(([sessionId, _]) => sessionId);
  
  if (incompleteSessions.length === 0) {
    console.log('All sessions already completed');
    return;
    }

  console.log(`Automatically completing ${incompleteSessions.length} remaining sessions`);
  
  // Create bulk update array
  const updates = incompleteSessions.map(sessionId => ({
    sessionId: student.sessions[sessionId].id,
    completed: true
  }));
  
  // Call the API to update all sessions at once
  if (updates.length > 0) {
    await sessionService.bulkUpdateSessions(selectedClass.value._id, updates);
  }
}

// Helper function to find next year classes with better filtering
async function findNextYearClasses(targetYearLevel, currentSection) {
  try {
    console.log(`PROMOTION DEBUG: Finding classes for year level "${targetYearLevel}" and section "${currentSection}"`);
    console.log(`PROMOTION DEBUG: Current class major: "${selectedClass.value.major}"`);
    
    const response = await api.get(`/classes/for-promotion/${targetYearLevel}`);
    if (!response.data || response.data.length === 0) {
      console.log(`PROMOTION DEBUG: No classes found for year level "${targetYearLevel}"`);
      return [];
    }
    
    console.log(`PROMOTION DEBUG: Found ${response.data.length} classes for year level "${targetYearLevel}"`);
    
    // Filter classes based on major compatibility
    const currentMajor = selectedClass.value.major;
    const compatibleClasses = response.data.filter(cls => {
      // If current class has no major, accept any class
      if (!currentMajor) {
        return true;
      }
      
      // If target class has no major, it's compatible
      if (!cls.major) {
        return true;
    }
    
      // Exact major match is preferred
      if (cls.major === currentMajor) {
        return true;
      }
      
      // For Business Informatics students, they can stay in Business Informatics
      // For System Development students, they can stay in System Development
      // For Digital Arts and Computer Security (2nd year only), they should transition to Business Informatics or System Development
      if (currentMajor === 'Digital Arts' || currentMajor === 'Computer Security') {
        // These majors typically transition to Business Informatics or System Development in higher years
        return cls.major === 'Business Informatics' || cls.major === 'System Development';
      }
      
      return false;
    });
    
    console.log(`PROMOTION DEBUG: After major filtering: ${compatibleClasses.length} compatible classes`);
    compatibleClasses.forEach(cls => {
      console.log(`PROMOTION DEBUG: Compatible class: ${cls.yearLevel} - ${cls.section} (${cls.major})`);
    });
    
    return compatibleClasses;
  } catch (error) {
    console.error(`PROMOTION DEBUG: Error finding next year classes:`, error);
    return [];
  }
}

// Improved class selection with better major and section matching
function selectNextYearClass(availableClasses, currentSection) {
  if (!availableClasses || availableClasses.length === 0) {
    console.error(`PROMOTION DEBUG: No available classes to select from`);
    return null;
  }
  
  console.log(`PROMOTION DEBUG: Selecting next year class from ${availableClasses.length} options`);
  console.log(`PROMOTION DEBUG: Current section: "${currentSection}"`);
  console.log(`PROMOTION DEBUG: Current major: "${selectedClass.value.major}"`);
  
  const currentMajor = selectedClass.value.major;
  
  // First priority: exact major and exact section match
  const exactMatches = availableClasses.filter(cls => 
    cls.major === currentMajor && cls.section === currentSection
  );
  
  if (exactMatches.length > 0) {
    console.log(`PROMOTION DEBUG: Found exact major and section match: "${exactMatches[0].yearLevel}-${exactMatches[0].section}" (${exactMatches[0].major})`);
    return exactMatches[0];
  }
  
  // Second priority: exact major and similar section
  const majorMatchSimilarSection = availableClasses.filter(cls => 
    cls.major === currentMajor && (
    cls.section.startsWith(currentSection) || 
    currentSection.startsWith(cls.section)
    )
  );
  
  if (majorMatchSimilarSection.length > 0) {
    console.log(`PROMOTION DEBUG: Found major match with similar section: "${majorMatchSimilarSection[0].yearLevel}-${majorMatchSimilarSection[0].section}" (${majorMatchSimilarSection[0].major})`);
    return majorMatchSimilarSection[0];
  }
  
  // Third priority: exact major, any section
  const majorMatches = availableClasses.filter(cls => cls.major === currentMajor);
  
  if (majorMatches.length > 0) {
    console.log(`PROMOTION DEBUG: Found major match with different section: "${majorMatches[0].yearLevel}-${majorMatches[0].section}" (${majorMatches[0].major})`);
    return majorMatches[0];
  }
  
  // Fourth priority: for transitioning majors (Digital Arts/Computer Security -> Business Informatics)
  if (currentMajor === 'Digital Arts' || currentMajor === 'Computer Security') {
    const businessInformaticsClasses = availableClasses.filter(cls => cls.major === 'Business Informatics');
    if (businessInformaticsClasses.length > 0) {
      // Try to match section if possible
      const sectionMatch = businessInformaticsClasses.find(cls => cls.section === currentSection);
      if (sectionMatch) {
        console.log(`PROMOTION DEBUG: Transitioning ${currentMajor} student to Business Informatics with same section: "${sectionMatch.yearLevel}-${sectionMatch.section}"`);
        return sectionMatch;
      } else {
        console.log(`PROMOTION DEBUG: Transitioning ${currentMajor} student to Business Informatics: "${businessInformaticsClasses[0].yearLevel}-${businessInformaticsClasses[0].section}"`);
        return businessInformaticsClasses[0];
      }
    }
  }
  
  // Last resort: exact section match, any major
  const sectionMatches = availableClasses.filter(cls => cls.section === currentSection);
  
  if (sectionMatches.length > 0) {
    console.log(`PROMOTION DEBUG: Found section match with different major: "${sectionMatches[0].yearLevel}-${sectionMatches[0].section}" (${sectionMatches[0].major})`);
    return sectionMatches[0];
  }
  
  // Final fallback: first available class
  console.log(`PROMOTION DEBUG: No good matches found, defaulting to first available class: "${availableClasses[0].yearLevel}-${availableClasses[0].section}" (${availableClasses[0].major})`);
  return availableClasses[0];
}

// Add this new method to batch check Odyssey Plans when loading students
async function checkAllStudentsOdysseyPlans() {
  if (!sessionMatrix.value || !sessionMatrix.value.students) return;
  
  // Get current semester
  const semester = activeTab.value === '1st' ? '1st Semester' : '2nd Semester';
  
  console.log(`Checking Odyssey Plan status for all students (${semester})`);
  
  try {
    // Check plans for each student
    for (const student of sessionMatrix.value.students) {
      await checkOdysseyPlanStatus(student);
      console.log(`Student ${student.name}: Odyssey Plan completed = ${student.odysseyPlanCompleted}`);
    }
    
    console.log('Checked Odyssey Plan status for all students');
  } catch (error) {
    console.error('Error checking Odyssey Plans:', error);
  }
}

// Update or create a function to handle tab changes
async function handleTabChange() {
  console.log(`Tab changed to: ${activeTab.value}`);
  
  // Re-check Odyssey Plans when tab changes
  await checkAllStudentsOdysseyPlans();
  
  // Re-check M&M completion status when tab changes
  await checkAllStudentsMM();
  
  // Force refresh M&M submissions for all students when switching tabs
  console.log('Force refreshing M&M submissions for all students...');
  if (sessionMatrix.value && sessionMatrix.value.students) {
    for (const student of sessionMatrix.value.students) {
      await fetchStudentMMSubmissions(student);
    }
  }
  
  // Check for M&M notifications when switching semesters
  // This ensures notifications are sent for both 1st and 2nd semester students
  await checkSessionsAndSendMMNotifications();
  
  console.log(`Completed tab change checks for ${activeTab.value} semester`);
}

// Make sure the tab watcher calls the handler
watch(activeTab, async (newTab) => {
  await handleTabChange();
});

// Update loadSessionMatrix function to check Odyssey Plans after loading sessions
async function loadSessionMatrix() {
  // ... existing code ...
  
  // After loading the session matrix, check Odyssey Plans
  await checkAllStudentsOdysseyPlans();
  
  // ... existing code ...
}
// ... existing code ...

// Add this new method to check M&M completion status
async function checkMMCompletionStatus(student) {
  if (!student || !selectedClass.value) return false;
  
  try {
    // Determine which semester this student is in based on their session categorization
    const isInFirstSemester = firstSemesterStudents.value.some(s => s.id === student.id);
    const isInSecondSemester = secondSemesterStudents.value.some(s => s.id === student.id);
    
    // Determine current semester based on student's categorization
    let semester;
    if (isInSecondSemester) {
      semester = '2nd';
    } else if (isInFirstSemester) {
      semester = '1st';
    } else {
      // Fallback to active tab if student is not categorized
      semester = activeTab.value === '1st' ? '1st' : '2nd';
    }
    
    const yearLevel = selectedClass.value.yearLevel || '2nd';
    
    console.log(`Checking M&M completion for student ${student.name} (${student.id}) - ${semester} semester, ${yearLevel} year`);
    
    // Check M&M completion
    const result = await mmService.getCompletionStatus(student.id, yearLevel, semester);
    
    // Store the result in the student object for later use
    student.mmCompleted = result.isComplete;
    student.mmSubmissions = result.submissions;
    student.mmMissingExams = result.missingExamTypes;
    student.mmSemester = semester; // Store which semester was checked
    
    // Log for debugging
    console.log(`Student ${student.name} M&M completion for ${semester} semester: ${student.mmCompleted}`);
    console.log('M&M completion details:', result);
    
    return result.isComplete;
  } catch (error) {
    console.error(`Error checking M&M completion status for student ${student?.name}:`, error);
    // Set to false on error to be safe
    student.mmCompleted = false;
    return false;
  }
}

// Add this new method to send M&M reminder
async function sendMMReminder(student) {
  if (!student || !selectedClass.value) return;
  
  try {
    // Determine which semester this student is in based on their categorization
    const isInFirstSemester = firstSemesterStudents.value.some(s => s.id === student.id);
    const isInSecondSemester = secondSemesterStudents.value.some(s => s.id === student.id);
    
    // Determine current semester based on student's categorization
    let semester;
    if (isInSecondSemester) {
      semester = '2nd';
    } else if (isInFirstSemester) {
      semester = '1st';
    } else {
      // Fallback to active tab if student is not categorized
      semester = activeTab.value === '1st' ? '1st' : '2nd';
    }
    
    const yearLevel = selectedClass.value.yearLevel || '2nd';
    const missingExams = student.mmMissingExams || ['P1', 'P2', 'P3'];
    
    // Create notification message
    let message = `M&M SUBMISSION REMINDER: You need to complete your M&M submissions for ${semester} semester. `;
    message += `Missing exams: ${missingExams.join(', ')}. `;
    message += `This is a requirement for promotion. Please visit the M&M page to upload your exam images.`;
    
    console.log(`Sending M&M reminder to student ${student.id} for ${semester} semester: ${message}`);
    
    // Find student's user ID for notification
    const userId = sessionMatrix.value.students.find(s => s.id === student.id)?.userId;
    if (userId) {
      await api.post('/notifications/create', {
        userId: userId,
        title: `M&M Submission Required - ${semester} Semester`,
        message: message,
        type: 'warning',
        link: '/student/surveys'
      });
      notificationService.showSuccess(`M&M reminder sent to ${student.name} for ${semester} semester`);
    } else {
      throw new Error('Could not find user ID for notification');
    }
  } catch (error) {
    console.error('Error sending M&M reminder:', error);
    notificationService.showError(`Failed to send M&M reminder: ${error.message}`);
  }
}

// Add method to automatically check sessions and send M&M notifications
async function checkSessionsAndSendMMNotifications() {
  if (!selectedClass.value || !selectedClass.value._id) {
    return;
  }
  
  try {
    console.log('Checking sessions and sending M&M notifications for class:', selectedClass.value._id);
    
    const result = await mmService.checkSessionsAndNotify(selectedClass.value._id);
    
    if (result.success && result.notificationsSent > 0) {
      console.log(`Sent ${result.notificationsSent} M&M upload notifications to eligible students`);
    } else if (result.success) {
      console.log('No new M&M notifications needed');
    }
  } catch (error) {
    console.error('Error checking sessions and sending M&M notifications:', error);
    // Don't show error to user as this is a background process
  }
}

// Add this new method to check all students' M&M completion status
async function checkAllStudentsMM() {
  if (!sessionMatrix.value || !sessionMatrix.value.students || !selectedClass.value) {
    return;
  }
  
  console.log('Checking M&M completion status for all students...');
  
  // Check M&M status for each student
  for (const student of sessionMatrix.value.students) {
    try {
      await checkMMCompletionStatus(student);
      
      // Also fetch detailed M&M submissions for exam session logic
      await fetchStudentMMSubmissions(student);
      
    } catch (error) {
      console.error(`Error checking M&M status for student ${student.name}:`, error);
      // Continue checking other students even if one fails
      student.mmCompleted = false;
    }
  }
  
  console.log('Completed M&M status check for all students');
}

// Add this new method to check all students' permit submissions
async function checkAllStudentsPermits() {
  if (!sessionMatrix.value || !sessionMatrix.value.students || !selectedClass.value) {
    return;
  }
  
  console.log('Checking permit submissions for all students...');
  
  try {
    // Fetch permit submissions for the selected class
    const response = await examPermitService.getPermitsForClass(selectedClass.value._id);
    
    if (response.success && response.permits) {
      console.log(`Loaded ${response.permits.length} permit submissions for class`);
      
      // Assign permit submissions to respective students
      sessionMatrix.value.students.forEach(student => {
        // Find permits for this student
        const studentPermits = response.permits.filter(permit => 
          permit.student === student.id || 
          (permit.student && permit.student._id === student.id)
        );
        
        student.permitSubmissions = studentPermits || [];
        console.log(`Student ${student.name}: ${student.permitSubmissions.length} permit submissions`);
      });
    } else {
      console.log('No permit submissions found for class');
      // Initialize empty permit submissions for all students
      sessionMatrix.value.students.forEach(student => {
        student.permitSubmissions = [];
      });
    }
  } catch (error) {
    console.error('Error checking permit submissions:', error);
    // Initialize empty permit submissions for all students on error
    sessionMatrix.value.students.forEach(student => {
      student.permitSubmissions = [];
    });
  }
  
  console.log('Completed permit submissions check for all students');
}

// Helper function to fetch detailed M&M submissions for a student
async function fetchStudentMMSubmissions(student) {
  if (!student || !selectedClass.value) return;
  
  try {
    const yearLevel = selectedClass.value.yearLevel || '2nd';
    
    console.log(`Fetching M&M submissions for student ${student.name} (${student.id}), yearLevel: ${yearLevel}`);
    
    // Fetch all M&M submissions for this student and year level
    const response = await api.get(`/mm-submissions/student-submissions/${student.id}`, {
      params: { yearLevel }
    });
    
    console.log(`M&M API response for ${student.name}:`, response.data);
    
    if (response.data && response.data.success) {
      student.mmSubmissions = response.data.submissions || [];
      console.log(`Successfully fetched ${student.mmSubmissions.length} M&M submissions for student ${student.name}`);
      
      // Log each submission for debugging
      student.mmSubmissions.forEach((submission, index) => {
        console.log(`  Submission ${index + 1}: ${submission.examType} - ${submission.semester} semester - Status: ${submission.status}`);
      });
    } else {
      console.log(`No M&M submissions found for student ${student.name}`);
      student.mmSubmissions = [];
    }
  } catch (error) {
    console.error(`Error fetching M&M submissions for student ${student.name}:`, error);
    student.mmSubmissions = [];
    
    // Show more detailed error info
    if (error.response) {
      console.error(`API Error Status: ${error.response.status}`);
      console.error(`API Error Data:`, error.response.data);
    }
  }
}

// Add this new method to check all students' Odyssey Plan status

// Helper function to check if a session is an exam session (P1, P2, P3)
function isExamSession(session) {
  if (!session || !session.title) return false;
  
  const title = session.title.toLowerCase();
  return title.includes('p1 exam') || 
         title.includes('p2 exam') || 
         title.includes('p3 exam') ||
         title.includes('prelim exam') ||
         title.includes('midterm exam') ||
         title.includes('finals exam');
}

// Helper function to get exam type from session title
function getExamTypeFromSession(session) {
  if (!session || !session.title) return null;
  
  const title = session.title.toLowerCase();
  if (title.includes('p1') || title.includes('prelim')) return 'P1';
  if (title.includes('p2') || title.includes('midterm')) return 'P2';
  if (title.includes('p3') || title.includes('finals')) return 'P3';
  
  return null;
}

// Helper function to check if a session should be disabled due to exam checkpoint
function shouldDisableSession(student, session, sessionList) {
  if (!session || !sessionList || !student?.sessions) return false;
  
  // Find sessions that are P1, P2, P3 exams
  const examSessions = sessionList.filter(s => isExamSession(s)).sort((a, b) => a.day - b.day);
  
  // For each exam session, check if it's completed and if so, disable sessions after it
  for (const examSession of examSessions) {
    const examCompletion = student.sessions[examSession._id];
    
    // If exam is completed, disable sessions after it until next exam checkpoint passes
    if (examCompletion?.completed) {
      const examType = getExamTypeFromSession(examSession);
      const sessionDay = session.day || 0;
      const examDay = examSession.day || 0;
      
      // If current session is after this exam
      if (sessionDay > examDay && !isExamSession(session)) {
        // Check if the next exam checkpoint has been reached
        const nextExam = examSessions.find(e => e.day > examDay);
        
        if (nextExam) {
          const nextExamDay = nextExam.day || 0;
          const nextExamCompletion = student.sessions[nextExam._id];
          
          // If session is between completed exam and next exam, and next exam not completed, disable it
          if (sessionDay < nextExamDay && !nextExamCompletion?.completed) {
            // Check if student has M&M approved for the completed exam
            const hasApprovedMM = hasUploadedMMForExam(student, examSession);
            if (!hasApprovedMM) {
              return true; // Disable until M&M is approved
            }
          }
        } else {
          // This is after the last exam - check if student has M&M approved
          const hasApprovedMM = hasUploadedMMForExam(student, examSession);
          if (!hasApprovedMM) {
            return true; // Disable until M&M is approved
          }
        }
      }
    }
  }
  
  return false;
}

// Helper function to check if student has uploaded M&M for specific exam
function hasUploadedMMForExam(student, session) {
  if (!isExamSession(session)) return true; // Non-exam sessions are always checkable
  
  const examType = getExamTypeFromSession(session);
  if (!examType) {
    console.log(`Could not determine exam type for session: ${session.title}`);
    return true;
  }
  
  // Check if student has uploaded M&M for this exam type
  if (!student.mmSubmissions || student.mmSubmissions.length === 0) {
    console.log(`Student ${student.name} has no M&M submissions loaded. Student object:`, {
      id: student.id,
      name: student.name,
      mmSubmissions: student.mmSubmissions,
      hasMMProperty: 'mmSubmissions' in student
    });
    return false;
  }
  
  // Determine current semester
  const isInFirstSemester = firstSemesterStudents.value.some(s => s.id === student.id);
  const currentSemester = isInFirstSemester ? '1st' : '2nd';
  
  console.log(`Checking ${examType} M&M for student ${student.name} in ${currentSemester} semester`);
  console.log(`Student M&M submissions:`, student.mmSubmissions);
  console.log(`Student categorization: isInFirstSemester=${isInFirstSemester}, firstSemesterStudents count=${firstSemesterStudents.value.length}, secondSemesterStudents count=${secondSemesterStudents.value.length}`);
  
  // Check if M&M submission exists for this exam type and semester
  const hasSubmission = student.mmSubmissions.some(submission => {
    const matchesExam = submission.examType === examType;
    const matchesSemester = submission.semester === currentSemester;
    const isApproved = submission.status === 'approved';
    
    console.log(`Submission check for ${examType}:`, {
      submissionExamType: submission.examType,
      matchesExam,
      submissionSemester: submission.semester,
      expectedSemester: currentSemester,
      matchesSemester,
      submissionStatus: submission.status,
      isApproved,
      overallMatch: matchesExam && matchesSemester && isApproved
    });
    
    return matchesExam && matchesSemester && isApproved;
  });
  
  console.log(`${examType} M&M check result for ${student.name}: ${hasSubmission}`);
  console.log(`Active tab: ${activeTab.value}, Session title: ${session.title}`);
  
  return hasSubmission;
}

// Helper function to get M&M status text for exam sessions
function getMMStatusText(student, session) {
  if (!isExamSession(session)) return '';
  
  const examType = getExamTypeFromSession(session);
  if (!examType) return '';
  
  if (hasUploadedMMForExam(student, session)) {
    return `${examType} M&M ✓`;
  } else {
    return `${examType} M&M ✗`;
  }
}

// Helper function to get M&M status CSS class
function getMMStatusClass(student, session) {
  if (!isExamSession(session)) return '';
  
  if (hasUploadedMMForExam(student, session)) {
    return 'text-green-600 font-medium';
  } else {
    return 'text-red-600 font-medium';
  }
}

// Helper function to get missing exam M&Ms for a student
function getMissingExamMMs(student, sessions) {
  const examSessions = sessions.filter(session => isExamSession(session));
  const missingExams = [];
  
  // Determine current semester
  const isInFirstSemester = firstSemesterStudents.value.some(s => s.id === student.id);
  const currentSemester = isInFirstSemester ? '1st' : '2nd';
  
  for (const session of examSessions) {
    const examType = getExamTypeFromSession(session);
    if (!examType) continue;
    
    // Check if sessions before this exam are completed
    const sessionsBeforeExam = sessions.filter(s => {
      const sessionDay = s.day || 0;
      const examDay = session.day || 0;
      return sessionDay < examDay && !isExamSession(s);
    });
    
    // Check if all sessions before exam are completed
    const allSessionsBeforeCompleted = sessionsBeforeExam.every(s => {
      const sessionCompletion = student.sessions[s._id];
      return sessionCompletion && sessionCompletion.completed;
    });
    
    // If sessions before exam are completed but M&M not uploaded or permit not validated
    if (allSessionsBeforeCompleted) {
      const mmOk = hasUploadedMMForExam(student, session);
      const permitOk = hasUploadedPermitForExam(student, session);
      if (!mmOk || !permitOk) {
        missingExams.push(examType);
      }
    }
  }
  
  return [...new Set(missingExams)]; // Remove duplicates
}

// New: return list of exams where M&M is missing OR permit not validated
// (Removed getIncompleteExamRequirements as per request)

// Function to send specific M&M reminder for a particular exam
async function sendSpecificMMReminder(student, examType) {
  if (!student || !selectedClass.value || !examType) return;
  
  try {
    // Determine current semester
    const isInFirstSemester = firstSemesterStudents.value.some(s => s.id === student.id);
    const currentSemester = isInFirstSemester ? '1st' : '2nd';
    const yearLevel = selectedClass.value.yearLevel || '2nd';
    
    console.log(`Sending ${examType} M&M reminder to student ${student.name} (${student.id}) for ${currentSemester} semester`);
    
    // Create specific notification message for this exam
    let message = `You have completed all required sessions before your ${examType} exam for ${currentSemester} semester.\n\n`;
    
    // Check if student has uploaded permit for this exam
    const hasPermit = hasUploadedPermitForExam(student, { examType }, currentSemester);
    
    if (hasPermit) {
      message += `Next Step: Please upload your ${examType} M&M and Permit submission immediately.\n\n`;
      message += `To upload:\n`;
      message += `1. Go to M&M page\n`;
      message += `2. Select ${currentSemester} Semester tab\n`;
      message += `3. Upload ${examType} M&M submission and Permit\n\n`;
      message += `Your ${examType} exam session cannot be marked complete until you upload the M&M submission.`;
    } else {
      message += `Next Step: Please upload your ${examType} exam M&M submission & Permit attachment immediately.\n\n`;
      message += `To upload:\n`;
      message += `1. Go to M&M page\n`;
      message += `2. Select ${currentSemester} Semester tab\n`;
      message += `3. Upload ${examType} M&M and Permit attachment\n\n`;
      message += `Your ${examType} exam session cannot be marked complete until you upload both the M&M submission and exam permit. Both are required for promotion to the next semester/year level.`;
    }
    
    // Find student's user ID from the session matrix
    let userId = null;
    
    // First try to get from sessionMatrix
    const matrixStudent = sessionMatrix.value.students.find(s => s.id === student.id);
    if (matrixStudent && matrixStudent.userId) {
      userId = matrixStudent.userId;
      console.log(`Found userId from session matrix: ${userId}`);
    }
    
    // If not found in matrix, try to get from student data
    if (!userId && student.userId) {
      userId = student.userId;
      console.log(`Found userId from student data: ${userId}`);
    }
    
    // If still not found, try to fetch from backend
    if (!userId) {
      console.log(`UserId not found, trying to fetch student data...`);
      try {
        const studentResponse = await api.get(`/students/${student.id}`);
        if (studentResponse.data && studentResponse.data.user) {
          userId = studentResponse.data.user._id || studentResponse.data.user;
          console.log(`Found userId from backend fetch: ${userId}`);
        }
      } catch (fetchError) {
        console.error('Error fetching student data:', fetchError);
      }
    }
    
    if (userId) {
      console.log(`Sending notification to userId: ${userId}`);
      
      const notificationData = {
        userId: userId,
        title: `${examType} Exam M&M Upload Required - ${currentSemester} Semester`,
        message: message,
        type: 'warning',
        link: '/student/surveys',
        examType: examType,
        studentId: student.id
      };
      
      console.log('Notification data:', notificationData);
      
      const notificationResponse = await api.post('/notifications/create-mm', notificationData);
      
      console.log('Notification API response:', notificationResponse.data);
      
      if (notificationResponse.data && notificationResponse.data.success) {
        notificationService.showSuccess(`${examType} exam M&M reminder sent to ${student.name}`);
      } else {
        throw new Error(notificationResponse.data?.message || 'Failed to create notification');
      }
      
      // Also trigger the backend notification system to check for this specific student
      try {
        console.log('Triggering backend M&M notification check...');
        const backendResult = await mmService.checkSessionsAndNotify(selectedClass.value._id);
        console.log('Backend notification result:', backendResult);
      } catch (backendError) {
        console.warn('Backend notification check failed:', backendError);
      }
    } else {
      throw new Error(`Could not find user ID for student ${student.name} (${student.id})`);
    }
  } catch (error) {
    console.error(`Error sending ${examType} M&M reminder:`, error);
    notificationService.showError(`Failed to send ${examType} M&M reminder: ${error.message}`);
  }
}

// Function to refresh M&M submissions data
async function refreshMMData() {
  try {
    console.log('Manually refreshing M&M submissions data...');
    
    if (!sessionMatrix.value || !sessionMatrix.value.students) {
      notificationService.showWarning('No students found to refresh M&M data');
      return;
    }
    
    // Fetch fresh M&M submissions for all students
    for (const student of sessionMatrix.value.students) {
      console.log(`Refreshing M&M data for student: ${student.name}`);
      await fetchStudentMMSubmissions(student);
    }
    
    notificationService.showSuccess('M&M submissions data refreshed successfully');
  } catch (error) {
    console.error('Error refreshing M&M submissions data:', error);
    notificationService.showError('Failed to refresh M&M submissions data');
  }
}

// Initiate promotion process
async function initiatePromotion() {
  if (!selectedClass.value || !selectedClass.value._id) {
    notificationService.showError('Invalid class data');
    return;
  }
  
  try {
    console.log('Initiating promotion...');
    console.log('Active tab:', activeTab.value);
    console.log('Promotion type:', getPromotionType.value);
    
    // Get all eligible students from current semester
    const currentStudents = currentSemesterStudents.value;
    console.log('Current semester students:', currentStudents.length);
    
    const eligibleStudents = currentStudents.filter(student => isEligibleForPromotion(student));
    console.log('Eligible students:', eligibleStudents.length);
    
    if (eligibleStudents.length === 0) {
      notificationService.showWarning('No eligible students found for promotion');
      return;
    }
    
    // Check if all students are eligible
    if (eligibleStudents.length !== currentStudents.length) {
      notificationService.showWarning(`Only ${eligibleStudents.length} out of ${currentStudents.length} students are eligible for promotion. All students must be eligible for promotion.`);
      return;
    }
    
    // Set the students to promote and promotion type
    studentsToPromote.value = eligibleStudents;
    promotionType.value = getPromotionType.value;
    
    console.log('Students to promote:', studentsToPromote.value.map(s => s.name));
    console.log('Promotion type:', promotionType.value);
    
    // Show the promotion modal
    console.log('Showing promotion modal...');
    showPromoteModal.value = true;
  } catch (error) {
    console.error('Error initiating promotion:', error);
    notificationService.showError(`Failed to initiate promotion: ${error.message}`);
  }
}

// Cancel promotion
function cancelPromotion() {
  showPromoteModal.value = false;
  studentsToPromote.value = [];
  promotionType.value = '';
}

// Confirm and execute promotion
async function confirmPromotion() {
  if (!selectedClass.value || !selectedClass.value._id || !studentsToPromote.value.length) {
    notificationService.showError('No students selected for promotion');
    return;
  }
  
  promotingStudents.value = true;
  
  try {
    console.log(`🚀 Starting promotion of ${studentsToPromote.value.length} students`);
    console.log('Selected class ID:', selectedClass.value._id);
    console.log('Promotion type:', promotionType.value);
    console.log('Students to promote:', studentsToPromote.value.map(s => `${s.name} (${s.id})`));
    
    let promotionResult;
    
    if (promotionType.value === 'semester') {
      console.log('📚 Executing semester promotion (1st to 2nd semester)...');
      promotionResult = await promoteToNextSemester();
    } else if (promotionType.value === 'graduation') {
      console.log('🎓 Executing graduation (4th year 2nd semester)...');
      promotionResult = await graduateStudents();
    } else if (promotionType.value === 'year') {
      console.log('🎓 Executing year promotion (2nd semester to next year)...');
      promotionResult = await promoteToNextYear();
    } else {
      throw new Error('Invalid promotion type');
    }
    
    console.log('📊 Promotion result:', promotionResult);
    
    // Refresh the class data and session matrix
    console.log('🔄 Refreshing class data and session matrix...');
    await loadClasses();
    await refreshSessionMatrix();
    
    // Show success notification
    const successCount = promotionResult?.successful || studentsToPromote.value.length;
    
    if (promotionType.value === 'graduation') {
      notificationService.showSuccess(`🎓 Congratulations! ${successCount} students have successfully graduated!`);
    } else if (promotionType.value === 'semester') {
      notificationService.showSuccess(`${successCount} students successfully promoted to 2nd semester`);
    } else {
      notificationService.showSuccess(`${successCount} students successfully promoted to next year level`);
    }
    
  } catch (error) {
    console.error('❌ Error during promotion:', error);
    notificationService.showError(`Failed to promote students: ${error.message}`);
  } finally {
    promotingStudents.value = false;
    showPromoteModal.value = false;
    studentsToPromote.value = [];
    promotionType.value = '';
    console.log('🧹 Promotion cleanup completed');
  }
}

// Helper function for bulk promotion to second semester
// Old bulkPromoteToSecondSemester function removed - using new promotion system

// Helper function for generic bulk promotion (2nd year students)
// Old bulkPromoteToNextYearGeneric function removed - using new promotion system

// Helper function for bulk promotion to next year
// Old bulkPromoteToNextYear function removed - using new promotion system

// Add functions for column checkboxes
function isAllStudentsCheckedForSession(sessionId, semester) {
  const students = semester === '1st' ? firstSemesterStudents.value : secondSemesterStudents.value;
  
  if (students.length === 0) return false;
  
  return students.every(student => 
    student.sessions[sessionId] && student.sessions[sessionId].completed
  );
}

function toggleAllSessionsForColumn(sessionId, semester, checked) {
  const students = semester === '1st' ? firstSemesterStudents.value : secondSemesterStudents.value;
  
  students.forEach(student => {
    if (student.sessions[sessionId]) {
      // For exam sessions, only allow checking if M&M is uploaded
      const session = sessionMatrix.value.sessions.find(s => s._id === sessionId);
      if (session && isExamSession(session)) {
        if (checked && !hasUploadedMMForExam(student, session)) {
          // Don't check if M&M not uploaded
          return;
        }
      }
      
      student.sessions[sessionId].completed = checked;
      // Save the change
      toggleSessionCompletion(student.id, sessionId, checked);
    }
  });
}

// Helper function for bulk graduation of 4th year 2nd semester students
// Old bulkGraduateStudents function removed - using new promotion system

// Add this helper function to get detailed promotion eligibility status
function getPromotionEligibilityDetails(student) {
  if (!student || !student.sessions) {
    return {
      eligible: false,
      reasons: ['No session data available']
    };
  }
  
  const isFirstSemester = activeTab.value === '1st';
  const reasons = [];
  
  // Filter sessions for the appropriate semester
  const semesterSessions = Object.keys(student.sessions).filter(sessionId => {
    const session = student.sessions[sessionId];
    if (isFirstSemester) {
      return session.semester === '1st Semester' || !session.semester;
    } else {
      return session.semester === '2nd Semester';
    }
  });
  
  if (semesterSessions.length === 0) {
    return {
      eligible: false,
      reasons: ['No sessions found for current semester']
    };
  }
  
  // Check session completion
  const completedCount = semesterSessions.filter(sessionId => 
    student.sessions[sessionId].completed
  ).length;
  const requiredCompleted = semesterSessions.length - 2;
  
  if (completedCount < requiredCompleted) {
    reasons.push(`Need ${requiredCompleted - completedCount} more sessions (${completedCount}/${semesterSessions.length} completed)`);
  }
  
  // Check exam sessions
  const examSessions = semesterSessions.filter(sessionId => {
    const session = sessionMatrix.value.sessions?.find(s => s._id === sessionId);
    return session && isExamSession(session);
  });
  
  const completedExamSessions = examSessions.filter(sessionId => 
    student.sessions[sessionId].completed
  );
  
  if (examSessions.length > 0 && completedExamSessions.length < examSessions.length) {
    const missingExams = examSessions.filter(sessionId => 
      !student.sessions[sessionId].completed
    ).map(sessionId => {
      const session = sessionMatrix.value.sessions?.find(s => s._id === sessionId);
      return session ? getExamTypeFromSession(session) : 'Unknown';
    });
    reasons.push(`All exam sessions must be completed. Missing: ${missingExams.join(', ')}`);
  }
  
  // Check Odyssey Plan
  if (!student.odysseyPlanCompleted) {
    reasons.push('Odyssey Plan not completed');
  }
  
  // Check M&M submissions
  if (!student.mmCompleted) {
    const semester = isFirstSemester ? '1st' : '2nd';
    reasons.push(`M&M submissions not completed for ${semester} semester`);
  }
  
  return {
    eligible: reasons.length === 0,
    reasons: reasons.length === 0 ? ['All requirements met'] : reasons,
    sessionProgress: `${completedCount}/${semesterSessions.length}`,
    examProgress: `${completedExamSessions.length}/${examSessions.length}`,
    odysseyPlan: student.odysseyPlanCompleted,
    mmCompleted: student.mmCompleted
  };
}

// Get session attachment URL
function getSessionAttachmentUrl(sessionId) {
  return `/api/sessions/${sessionId}/attachment`;
}

// Modal methods for attachment viewing
function viewAttachment(sessionId, attachmentName) {
  selectedSessionId.value = sessionId;
  selectedAttachmentName.value = attachmentName;
  showAttachmentModal.value = true;
}

function closeAttachmentModal() {
  showAttachmentModal.value = false;
  selectedSessionId.value = null;
  selectedAttachmentName.value = null;
}

async function handleAttachmentRejected() {
  // Refresh the class data to show updated attachment status
  if (selectedClass.value) {
    try {
      await loadClassStudents(selectedClass.value._id);
      notificationService.showInfo('Class data refreshed');
    } catch (error) {
      console.error('Error refreshing class data:', error);
    }
  }
}

// Helper functions for attachment detection
function hasSessionAttachment(session) {
  return !!(
    session.hasAttachment || 
    session.attachmentUrl || 
    session.attachmentOriginalName || 
    (session.attachments && session.attachments.length > 0)
  );
}

function getAttachmentDisplayName(session) {
  if (session.attachments && session.attachments.length > 0) {
    return session.attachments.length === 1 
      ? session.attachments[0].originalName 
      : `${session.attachments.length} attachments`;
  }
  return session.attachmentOriginalName || 'Attachment';
}


// Old promoteToNextSemester function removed - using new bulk promotion system

// Drop functionality removed - now handled by admin only

// Graduate student function (for 4th year 2nd semester)
async function graduateStudent(student) {
  const response = await api.post('/students/graduate', {
    studentId: student.id,
    classId: selectedClass.value._id,
    graduationDate: new Date(),
    graduationSchoolYear: selectedClass.value.schoolYear || '2025-2026'
  });

  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Failed to graduate student');
  }

  // Send congratulation notification
  try {
    await api.post('/notifications/send-congratulation', {
      studentId: student.id,
      message: `🎓 Congratulations ${student.name}! You have successfully completed your studies. Wishing you all the best in your future endeavors!`,
      type: 'graduation'
    });
  } catch (notificationError) {
    console.warn('Failed to send graduation notification:', notificationError);
    // Don't throw error, graduation should still succeed
  }

  return response.data;
}

// ===== NEW PROMOTION FUNCTIONS =====

// Promote students to next semester (1st to 2nd semester)
async function promoteToNextSemester() {
  console.log('Starting promotion to second semester...');
  
  const promotionPromises = studentsToPromote.value.map(async (student) => {
    try {
      console.log(`Promoting student ${student.name} (${student.id}) to 2nd semester`);
      
      // Archive student sessions to move from 1st to 2nd semester
      const archiveResponse = await sessionService.archiveStudentSessions(
        selectedClass.value._id,
        student.id
      );
      
      if (archiveResponse && archiveResponse.success) {
        console.log(`✅ Sessions archived for ${student.name}`);
        
        // Update student semester completion status and class currentSemester
        const promotionResponse = await api.post('/students/promote-semester', {
          studentId: student.id,
          classId: selectedClass.value._id,
          fromSemester: '1st Semester',
          toSemester: '2nd Semester'
        });
        
        if (promotionResponse.data && promotionResponse.data.success) {
          console.log(`✅ Student ${student.name} promoted to 2nd semester successfully`);
          
          // Send notification to student about semester promotion
          try {
            // Find student's user ID for notification
            let userId = null;
            const matrixStudent = sessionMatrix.value.students.find(s => s.id === student.id);
            if (matrixStudent && matrixStudent.userId) {
              userId = matrixStudent.userId;
            }
            
            // If not found in matrix, try to get from student data
            if (!userId && student.userId) {
              userId = student.userId;
            }
            
            // If still not found, try to fetch from backend
            if (!userId) {
              try {
                const studentResponse = await api.get(`/students/${student.id}`);
                if (studentResponse.data && studentResponse.data.user) {
                  userId = studentResponse.data.user._id || studentResponse.data.user;
                }
              } catch (fetchError) {
                console.error('Error fetching student data for notification:', fetchError);
              }
            }
            
            if (userId) {
              await notificationApiService.create({
                recipient: userId,
                title: '🎉 Congratulations! You have been promoted to 2nd Semester!',
                message: `Dear ${student.name},\n\nCongratulations! You have successfully completed your 1st semester requirements and have been promoted to 2nd semester.\n\n📚 What's Next:\n• Your 2nd semester sessions are now available\n• Continue attending your SSP sessions\n• Complete all required activities for 2nd semester\n\nKeep up the great work! 🎓`,
                type: 'success',
                link: '/student/sessions'
              });
              console.log(`✅ Promotion notification sent to ${student.name}`);
            } else {
              console.warn(`⚠️ Could not find user ID for student ${student.name}, skipping notification`);
            }
          } catch (notificationError) {
            console.error(`❌ Error sending promotion notification to ${student.name}:`, notificationError);
            // Don't fail the promotion if notification fails
          }
          
          return { success: true, student: student.name };
        } else {
          throw new Error(promotionResponse.data?.message || 'Failed to promote student to next semester');
        }
      } else {
        throw new Error('Failed to archive student sessions');
      }
    } catch (error) {
      console.error(`❌ Error promoting student ${student.name} to 2nd semester:`, error);
      return { success: false, student: student.name, error: error.message };
    }
  });
  
  const results = await Promise.allSettled(promotionPromises);
  
  // Count successes and failures
  const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
  const failed = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)).length;
  
  console.log(`Promotion to 2nd semester completed: ${successful} successful, ${failed} failed`);
  
  if (failed > 0) {
    const failedStudents = results
      .filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success))
      .map(result => result.status === 'fulfilled' ? result.value.student : 'Unknown student');
    
    console.error('Failed students:', failedStudents);
    notificationService.showWarning(`${successful} students promoted successfully, but ${failed} failed: ${failedStudents.join(', ')}`);
  }
  
  if (successful === 0) {
    throw new Error('No students were successfully promoted');
  }
  
  return { successful, failed };
}

// Promote students to next year
async function promoteToNextYear() {
  console.log('Starting promotion to next year...');
  
  // Check if this is a 2nd year class (generic promotion)
  const currentYearLevel = selectedClass.value.yearLevel;
  const isSecondYearClass = currentYearLevel === '2nd' || currentYearLevel === '2nd Year' || currentYearLevel.includes('2');
  
  if (isSecondYearClass) {
    console.log('2nd year class detected - using generic promotion');
    return await promoteToNextYearGeneric();
  }
  
  // For other year levels, find target class
  try {
    const targetYearLevel = calculateNextYearLevel(selectedClass.value.yearLevel);
    const nextYearClasses = await findNextYearClasses(targetYearLevel, selectedClass.value.section);
    
    if (!nextYearClasses || nextYearClasses.length === 0) {
      throw new Error(`No classes found for ${targetYearLevel} year level. Please ask an administrator to create the appropriate classes first.`);
    }
    
    const nextYearClass = selectNextYearClass(nextYearClasses, selectedClass.value.section);
    if (!nextYearClass) {
      throw new Error(`Could not find an appropriate class for ${targetYearLevel} year level.`);
    }
    
    // Note: Archiving is handled by the backend bulk-promote-year endpoint
    const studentIds = studentsToPromote.value.map(s => s.id);

    // Use bulk promotion API
    const response = await api.post('/students/bulk-promote-year', {
      currentClassId: selectedClass.value._id,
      nextClassId: nextYearClass._id,
      studentIds: studentIds
    });
    
    if (response.data && response.data.success) {
      console.log('✅ Students promoted to next year successfully');
      
      // Send notifications to all promoted students
      const promotedStudents = response.data.promotedStudents || studentsToPromote.value;
      
      for (const student of promotedStudents) {
        try {
          // Find student's user ID for notification
          let userId = null;
          const matrixStudent = sessionMatrix.value.students.find(s => s.id === student.id);
          if (matrixStudent && matrixStudent.userId) {
            userId = matrixStudent.userId;
          }
          
          // If not found in matrix, try to get from student data
          if (!userId && student.userId) {
            userId = student.userId;
          }
          
          // If still not found, try to fetch from backend
          if (!userId) {
            try {
              const studentResponse = await api.get(`/students/${student.id}`);
              if (studentResponse.data && studentResponse.data.user) {
                userId = studentResponse.data.user._id || studentResponse.data.user;
              }
            } catch (fetchError) {
              console.error('Error fetching student data for notification:', fetchError);
            }
          }
          
          if (userId) {
            const targetYearLevel = calculateNextYearLevel(selectedClass.value.yearLevel);
            await notificationApiService.create({
              recipient: userId,
              title: '🎉 Congratulations! You have been promoted to the next year level!',
              message: `Dear ${student.name},\n\nCongratulations! You have successfully completed your ${selectedClass.value.yearLevel} year requirements and have been promoted to ${targetYearLevel}.\n\n📚 What's Next:\n• Your new year level sessions are now available\n• Continue attending your SSP sessions\n• Complete all required activities for ${targetYearLevel}\n\nKeep up the great work! 🎓`,
              type: 'success',
              link: '/student/sessions'
            });
            console.log(`✅ Year promotion notification sent to ${student.name}`);
          } else {
            console.warn(`⚠️ Could not find user ID for student ${student.name}, skipping notification`);
          }
        } catch (notificationError) {
          console.error(`❌ Error sending year promotion notification to ${student.name}:`, notificationError);
          // Don't fail the promotion if notification fails
        }
      }
      
      return { successful: studentIds.length, failed: 0 };
    } else {
      throw new Error(response.data?.message || 'Failed to promote students to next year');
    }
  } catch (error) {
    console.error('Error promoting students to next year:', error);
    throw error;
  }
}

// Generic promotion for 2nd year students (no class assignment)
async function promoteToNextYearGeneric() {
  console.log('Starting generic promotion for 2nd year students...');
  
  try {
    const studentIds = studentsToPromote.value.map(s => s.id);
    const currentYearLevel = selectedClass.value.yearLevel;
    const currentSemester = activeTab.value === '1st' ? '1st Semester' : '2nd Semester';
    
    console.log(`Promoting ${studentIds.length} 2nd year students to 3rd year`);
    
    // Use the generic promotion API for each student
    const promotionPromises = studentsToPromote.value.map(async (student) => {
      try {
        console.log(`Promoting student ${student.name} (${student.id}) to 3rd year`);
        // Note: Archiving is handled by the backend promote-year-generic endpoint
        
        const response = await api.post('/students/promote-year-generic', {
          studentId: student.id,
          currentClassId: selectedClass.value._id,
          currentYearLevel: currentYearLevel,
          nextYearLevel: '3rd',
          currentSemester: currentSemester
        });
        
        if (response.data && response.data.success) {
          console.log(`✅ Student ${student.name} promoted to 3rd year successfully`);
          return { success: true, student: student.name };
        } else {
          console.error(`❌ Failed to promote ${student.name}:`, response?.message || 'Unknown error');
          throw new Error(response?.message || 'Failed to promote student');
        }
      } catch (error) {
        console.error(`❌ Error promoting student ${student.name} to 3rd year:`, error);
        return { success: false, student: student.name, error: error.message };
      }
    });
    
    const results = await Promise.allSettled(promotionPromises);
    
    // Count successes and failures
    const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
    const failed = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)).length;
    
    console.log(`Generic promotion completed: ${successful} successful, ${failed} failed`);
    
    if (failed > 0) {
      const failedStudents = results
        .filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success))
        .map(result => result.status === 'fulfilled' ? result.value.student : 'Unknown student');
      
      console.error('Failed students:', failedStudents);
      notificationService.showWarning(`${successful} students promoted successfully, but ${failed} failed: ${failedStudents.join(', ')}`);
    }
    
    if (successful === 0) {
      throw new Error('No students were successfully promoted');
    }
    
    return { successful, failed };
  } catch (error) {
    console.error('Error in generic promotion:', error);
    throw error;
  }
}

// Graduate students (4th year 2nd semester)
async function graduateStudents() {
  console.log('Starting graduation process...');
  
  try {
    const studentIds = studentsToPromote.value.map(s => s.id);
    const currentSchoolYear = selectedClass.value.schoolYear || '2025-2026';
    
    console.log(`Graduating ${studentIds.length} students from class ${selectedClass.value._id}`);
    
    const response = await api.post('/students/bulk-graduate', {
      classId: selectedClass.value._id,
      studentIds: studentIds,
      schoolYear: currentSchoolYear
    });
    
    if (response.data && response.data.success) {
      console.log('✅ Students graduated successfully');
      
      // Send notifications to all graduated students
      const graduatedStudents = response.data.graduatedStudents || studentsToPromote.value;
      
      for (const student of graduatedStudents) {
        try {
          // Find student's user ID for notification
          let userId = null;
          const matrixStudent = sessionMatrix.value.students.find(s => s.id === student.id);
          if (matrixStudent && matrixStudent.userId) {
            userId = matrixStudent.userId;
          }
          
          // If not found in matrix, try to get from student data
          if (!userId && student.userId) {
            userId = student.userId;
          }
          
          // If still not found, try to fetch from backend
          if (!userId) {
            try {
              const studentResponse = await api.get(`/students/${student.id}`);
              if (studentResponse.data && studentResponse.data.user) {
                userId = studentResponse.data.user._id || studentResponse.data.user;
              }
            } catch (fetchError) {
              console.error('Error fetching student data for notification:', fetchError);
            }
          }
          
          if (userId) {
            await notificationApiService.create({
              recipient: userId,
              title: '🎓 CONGRATULATIONS! You have successfully graduated!',
              message: `Dear ${student.name},\n\n🎉 CONGRATULATIONS ON YOUR GRADUATION! 🎓\n\nWe are proud to announce that you have successfully completed all requirements for your degree program! Your hard work, dedication, and perseverance throughout your academic journey have paid off.\n\n🌟 Academic Achievement Unlocked:\n• All SSP sessions completed successfully\n• All semester requirements fulfilled\n• Ready for the next chapter of your life\n\nYou have officially graduated from the ${selectedClass.value.yearLevel} ${selectedClass.value.major || ''} program. We wish you the very best in your future endeavors!\n\nOnce again, congratulations graduate! 🎓✨`,
              type: 'success',
              link: '/student/profile'
            });
            console.log(`✅ Graduation notification sent to ${student.name}`);
          } else {
            console.warn(`⚠️ Could not find user ID for student ${student.name}, skipping notification`);
          }
        } catch (notificationError) {
          console.error(`❌ Error sending graduation notification to ${student.name}:`, notificationError);
          // Don't fail the graduation if notification fails
        }
      }
      
      return { successful: studentIds.length, failed: 0 };
    } else {
      throw new Error(response.data?.message || 'Failed to graduate students');
    }
  } catch (error) {
    console.error('Error graduating students:', error);
    throw error;
  }
}
// Helper function to check if student has uploaded permit for specific exam
function hasUploadedPermitForExam(student, session) {
  if (!isExamSession(session)) return true; // Non-exam sessions don't require permits
  
  const examType = getExamTypeFromSession(session);
  if (!examType) return true;
  
  // Check if student has uploaded permit for this exam type
  if (!student.permitSubmissions || student.permitSubmissions.length === 0) {
    return false;
  }
  
  // Determine current semester
  const isInFirstSemester = firstSemesterStudents.value.some(s => s.id === student.id);
  const currentSemester = isInFirstSemester ? '1st' : '2nd';
  const semesterText = currentSemester === '1st' ? '1st Semester' : '2nd Semester';
  
  // Convert exam type to period (P1 -> 1, P2 -> 2, P3 -> 3)
  const period = examType.replace('P', '');
  
  // Check if permit submission exists for this period and semester and is validated
  const hasPermit = student.permitSubmissions.some(permit => {
    const matchesPeriod = permit.period === period;
    const matchesSemester = permit.semester === semesterText;
    const isValidated = permit.status === 'validated';
    
    console.log(`Permit check for ${student.name} ${examType}:`, {
      permitPeriod: permit.period,
      expectedPeriod: period,
      matchesPeriod,
      permitSemester: permit.semester,
      expectedSemester: semesterText,
      matchesSemester,
      permitStatus: permit.status,
      isValidated,
      overallMatch: matchesPeriod && matchesSemester && isValidated
    });
    
    return matchesPeriod && matchesSemester && isValidated;
  });
  
  console.log(`${examType} permit check result for ${student.name}: ${hasPermit}`);
  return hasPermit;
}

// Helper function to get tooltip text for exam sessions
function getExamSessionTooltip(student, session) {
  if (!isExamSession(session)) return '';
  
  const examType = getExamTypeFromSession(session);
  const hasM = hasUploadedMMForExam(student, session);
  const hasPermit = hasUploadedPermitForExam(student, session);
  
  if (hasM && hasPermit) {
    return `${examType} M&M and permit uploaded - can check exam completion`;
  } else if (!hasM && !hasPermit) {
    return `Student must upload ${examType} M&M and exam permit before exam can be marked complete`;
  } else if (!hasM) {
    return `Student must upload ${examType} M&M before exam can be marked complete`;
  } else {
    return `Student must upload ${examType} exam permit before exam can be marked complete`;
  }
}



</script>

<style scoped>
.bg-primary {
  background-color: #3B82F6;
}
.bg-primary-light {
  background-color: #EFF6FF;
}
.text-primary {
  color: #3B82F6;
}
.hover\:bg-primary-dark:hover {
  background-color: #2563EB;
}
.text-xxs {
  font-size: 0.65rem;
  line-height: 0.8rem;
}

/* Main container */
.adviser-classes {
  width: 100%;
  overflow-x: hidden;
  padding-bottom: 1.5rem;
}

/* Card hover effect */
.card-hover-effect {
  transition: all 0.3s ease;
}

.card-hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Compliance tracking table */
table {
  table-layout: auto;
  border-collapse: collapse;
}

/* Keep titles readable */
th {
  vertical-align: middle;
}

/* Session titles */
th .text-sm {
  word-break: normal;
  overflow-wrap: break-word;
  line-height: 1.2;
}

/* Custom checkbox styling */
.custom-checkbox {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  appearance: none;
  background-color: #fff;
  background-position: center;
  position: relative;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  outline: none;
}

.custom-checkbox:checked {
  background-size: 110%;
  transform: scale(1.05);
  border-color: #10b981;
  animation: checkFlip 0.5s ease forwards;
  background-color: #fff;
  border-width: 2px;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.1), 0 0 0 4px rgba(16, 185, 129, 0.2);
}

.custom-checkbox:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 6px;
  height: 12px;
  border-bottom: 3px solid #10b981;
  border-right: 3px solid #10b981;
  margin-top: -2px;
}

.custom-checkbox:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-color: #9ca3af;
}

.custom-checkbox:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4);
}

/* Different outline styles for active vs inactive */
.custom-checkbox:not(:checked):active {
  border-color: #6b7280;
  background-color: rgba(16, 185, 129, 0.05);
}

.custom-checkbox:checked:hover {
  border-color: #059669;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2), 0 0 0 4px rgba(16, 185, 129, 0.3);
}

/* All checkboxes use green when checked */
.custom-checkbox:checked {
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
}

/* Checkbox animation */
@keyframes checkPulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1.05);
    opacity: 1;
  }
}

/* Checkbox flip animation */
@keyframes checkFlip {
  0% {
    transform: scale(0.8) rotateY(0deg);
  }
  50% {
    transform: scale(1.1) rotateY(180deg);
  }
  100% {
    transform: scale(1.05) rotateY(360deg);
  }
}

/* Different checkbox colors for different semesters */
.custom-checkbox:checked.text-blue-600 {
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.custom-checkbox:checked.text-green-600 {
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
}
</style> 