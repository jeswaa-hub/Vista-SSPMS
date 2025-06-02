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
              <span class="ml-2 badge bg-primary-light text-primary text-xs px-2 py-1 rounded-full font-medium">{{ classItem.major }}</span>
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
              SSP: {{ classItem.sspSubject.sspCode }}
            </div>
            <div class="flex items-center font-medium text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span :class="{'text-green-600': classItem.sspSubject.semester?.includes('1st')}">
                {{ classItem.sspSubject.semester || classItem.subject?.semester || '' }}
              </span>
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
          <span class="ml-3 badge bg-primary-light text-primary text-xs px-2 py-1 rounded-full font-medium">{{ selectedClass.major }}</span>
        </h3>
        <button 
          @click="selectedClass = null" 
          class="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <span class="text-sm font-medium">{{ selectedClass.daySchedule }} / {{ selectedClass.timeSchedule }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Room:</span>
              <span class="text-sm font-medium">{{ selectedClass.room }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">SSP Subject:</span>
              <span class="text-sm font-medium">
                {{ selectedClass.sspSubject.sspCode }}
              </span>
            </div>
            <div class="flex justify-between border-t border-gray-100 pt-2 mt-2">
              <span class="text-sm text-gray-600">Semester:</span>
              <span class="text-sm font-medium" :class="{'text-green-600': selectedClass.sspSubject.semester?.includes('1st')}">
                {{ selectedClass.sspSubject.semester || selectedClass.subject?.semester || '' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">School Year:</span>
              <span class="text-sm font-medium">
                {{ selectedClass.sspSubject.schoolYear || selectedClass.subject?.schoolYear || '2024 - 2025' }}
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
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Sessions:</span>
              <span class="text-sm font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                {{ sessionMatrix.sessions?.length || 0 }}
              </span>
            </div>
            <div>
              <div class="flex justify-between mb-1.5">
              <span class="text-sm text-gray-600">Overall Compliance:</span>
                <span class="text-sm font-medium" :class="{
                  'text-red-600': overallCompliancePercentage < 50,
                  'text-yellow-600': overallCompliancePercentage >= 50 && overallCompliancePercentage < 80,
                  'text-green-600': overallCompliancePercentage >= 80
                }">
                  {{ overallCompliancePercentage }}%
                </span>
            </div>
              <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-2.5 rounded-full transition-all duration-500"
                  :class="{
                    'bg-red-500': overallCompliancePercentage < 50,
                    'bg-yellow-500': overallCompliancePercentage >= 50 && overallCompliancePercentage < 80,
                    'bg-green-500': overallCompliancePercentage >= 80
                  }"
                :style="{ width: `${overallCompliancePercentage}%` }"
              ></div>
              </div>
            </div>
            
            <!-- Quick status overview -->
            <div class="pt-3 mt-2 border-t border-gray-100">
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-red-50 rounded-md p-2">
                  <div class="text-xs text-gray-600">Below 50%</div>
                  <div class="text-base font-medium text-red-600">
                    {{ sessionMatrix.students?.filter(s => getStudentCompliancePercentage(s) < 50).length || 0 }}
                  </div>
                </div>
                <div class="bg-yellow-50 rounded-md p-2">
                  <div class="text-xs text-gray-600">50-80%</div>
                  <div class="text-base font-medium text-yellow-600">
                    {{ sessionMatrix.students?.filter(s => getStudentCompliancePercentage(s) >= 50 && getStudentCompliancePercentage(s) < 80).length || 0 }}
                  </div>
                </div>
                <div class="bg-green-50 rounded-md p-2">
                  <div class="text-xs text-gray-600">Above 80%</div>
                  <div class="text-base font-medium text-green-600">
                    {{ sessionMatrix.students?.filter(s => getStudentCompliancePercentage(s) >= 80).length || 0 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Session Compliance Matrix - no scrolling, full fit -->
      <div class="relative border rounded my-4">
        <h4 class="px-4 py-2 bg-gray-50 border-b font-medium">Session Compliance Tracking</h4>
        
        <!-- 2nd Semester Transition Status -->
        <div v-if="selectedClass && selectedClass.sspSubject && selectedClass.sspSubject.semester?.includes('1st')" 
             class="px-4 py-2 border-b"
        >
          <div class="flex items-center justify-between">
            <h5 class="text-sm font-medium">2nd Semester Transition Status:</h5>
            
            <!-- Warning if 2nd semester not available -->
            <div v-if="!is2ndSemesterAvailable" class="flex items-center text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="text-sm">2nd semester not configured by admin</span>
            </div>
            
            <!-- Warning if students have too many missed sessions -->
            <div v-else-if="studentsWithTooManyMissedSessions.length > 0" class="flex items-center text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="text-sm">{{ studentsWithTooManyMissedSessions.length }} students have more than 2 missed sessions</span>
            </div>
            
            <!-- Ready for transition -->
            <div v-else class="flex items-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm">Ready for 2nd semester transition</span>
            </div>
          </div>
          
          <!-- List of students with too many missed sessions -->
          <div v-if="studentsWithTooManyMissedSessions.length > 0" class="mt-2 p-2 bg-amber-50 rounded text-sm">
            <p class="font-medium text-amber-700 mb-1">Students with more than 2 missed sessions:</p>
            <ul class="list-disc pl-5 text-amber-600 space-y-1">
              <li v-for="student in studentsWithTooManyMissedSessions" :key="student.id">
                {{ student.name }} - Completed {{ student.completed }}/{{ student.completed + student.missing }} sessions
                <span class="ml-1 text-xs">({{ student.missing }} missing)</span>
              </li>
            </ul>
          </div>
        </div>
        
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
          </div>
          
          <!-- First Semester Students Table -->
          <div v-if="activeTab === '1st' && firstSemesterStudents.length > 0" class="p-4">
            <div class="mb-2 text-sm font-medium text-gray-700">Students in 1st Semester ({{ firstSemesterStudents.length }})</div>
            <table class="w-full divide-y divide-gray-200 table-auto">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th 
                    v-for="session in firstSemesterSessions" 
                    :key="session._id" 
                    scope="col" 
                    class="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase"
                  >
                    <div class="text-xs">Day {{ session.day }}</div>
                    <div class="text-sm text-blue-700 font-medium">
                      {{ session.title }}
                    </div>
                  </th>
                  <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Overall
                  </th>
                  <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in firstSemesterStudents" :key="student.id" class="hover:bg-gray-50">
                  <td class="px-2 py-3 text-sm font-medium text-gray-900">
                    {{ student.name }}
                    <div class="text-xs text-gray-500">{{ student.idNumber }}</div>
                  </td>
                  <td 
                    v-for="session in firstSemesterSessions" 
                    :key="session._id" 
                    class="px-1 py-2 text-center"
                  >
                    <div 
                      v-if="student.sessions[session._id]"
                      class="relative inline-block"
                    >
                      <label class="inline-flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          v-model="student.sessions[session._id].completed"
                          @change="toggleSessionCompletion(student.id, session._id, student.sessions[session._id].completed)"
                          class="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                      </label>
                    </div>
                    <div v-else class="text-xs text-gray-400">N/A</div>
                  </td>
                  <td class="px-2 py-3 text-center">
                    <div class="inline-flex items-center">
                      <span 
                        class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="getComplianceClass(getStudentCompliancePercentage(student))"
                      >
                        {{ getStudentCompliancePercentage(student) }}%
                      </span>
                    </div>
                  </td>
                  <td class="px-2 py-3 text-center">
                    <button 
                      v-if="canCompleteStudentSemester(student)"
                      @click="completeSemesterConfirm(student)" 
                      :disabled="completingSemester" 
                      class="px-2 py-1 text-xs border border-transparent rounded-md shadow-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <span v-if="completingSemester && completingStudentId === student.id" class="flex items-center">
                        <svg class="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                      <span v-else>Complete Semester</span>
                    </button>
                    <div
                      v-else
                      class="flex flex-col items-center"
                    >
                      <span class="text-xs text-amber-600 font-medium mb-1">
                        {{ getStudentMissingSessionsCount(student) }} sessions missing
                      </span>
                      <button 
                        @click="notifyStudent(student)"
                        class="px-2 py-1 text-xs border border-transparent rounded-md shadow-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Send Reminder
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Second Semester Students Table -->
          <div v-if="activeTab === '2nd' && secondSemesterStudents.length > 0" class="p-4">
            <div class="mb-2 text-sm font-medium text-gray-700">Students in 2nd Semester ({{ secondSemesterStudents.length }})</div>
            <table class="w-full divide-y divide-gray-200 table-auto">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th 
                    v-for="session in secondSemesterSessions" 
                    :key="session._id" 
                    scope="col" 
                    class="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase"
                  >
                    <div class="text-xs">Day {{ session.day }}</div>
                    <div class="text-sm text-green-700 font-medium">
                      {{ session.title }}
        </div>
                  </th>
                  <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Overall
                  </th>
                  <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in secondSemesterStudents" :key="student.id" class="hover:bg-gray-50">
                  <td class="px-2 py-3 text-sm font-medium text-gray-900">
                    {{ student.name }}
                    <div class="text-xs text-gray-500">{{ student.idNumber }}</div>
                  </td>
                  <td 
                    v-for="session in secondSemesterSessions" 
                    :key="session._id" 
                    class="px-1 py-2 text-center"
                  >
                    <div 
                      v-if="student.sessions[session._id]"
                      class="relative inline-block"
                    >
                      <label class="inline-flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          v-model="student.sessions[session._id].completed"
                          @change="toggleSessionCompletion(student.id, session._id, student.sessions[session._id].completed)"
                          class="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                      </label>
                    </div>
                    <div v-else class="text-xs text-gray-400">N/A</div>
                  </td>
                  <td class="px-2 py-3 text-center">
                    <div class="inline-flex items-center">
                      <span 
                        class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="getComplianceClass(getStudentCompliancePercentage(student))"
                      >
                        {{ getStudentCompliancePercentage(student) }}%
                      </span>
                    </div>
                  </td>
                  <td class="px-2 py-3 text-center">
                    <div
                      class="flex flex-col items-center"
                    >
                      <span v-if="getStudentMissingSessionsCount(student) > 0" class="text-xs text-amber-600 font-medium mb-1">
                        {{ getStudentMissingSessionsCount(student) }} sessions missing
                      </span>
                      <button 
                        v-if="getStudentMissingSessionsCount(student) > 0"
                        @click="notifyStudent(student)"
                        class="px-2 py-1 text-xs border border-transparent rounded-md shadow-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Send Reminder
                      </button>
                      <span v-else class="text-xs text-green-600 font-medium">
                        All sessions completed
                      </span>
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
      
      <!-- Save Changes Button with improved styling -->
      <div class="flex justify-between mt-6">
        <button 
          v-if="canCompleteSemester"
          @click="completeSemesterConfirm" 
          :disabled="completingSemester || hasChanges" 
          class="px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span v-if="completingSemester" class="flex items-center">
            <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
          <span v-else>Complete 1st Semester</span>
        </button>
        
        <div v-if="hasChanges" class="ml-auto">
        <button 
          @click="saveChanges" 
          :disabled="saving" 
          class="px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span v-if="saving" class="flex items-center">
            <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
          <span v-else>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Confirm Complete Semester Modal -->
  <div v-if="showCompleteSemesterModal && selectedStudent" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-filter backdrop-blur-sm">
    <div class="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full mx-4">
      <div class="p-5 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Complete 1st Semester for {{ selectedStudent.name }}</h3>
      </div>
      <div class="p-5">
      <p class="text-gray-600 mb-4">
          Are you sure you want to complete the 1st semester for this student? This will:
      </p>
      <ul class="list-disc pl-5 mb-5 text-gray-600 text-sm space-y-2">
          <li>Archive all current 1st semester session data for this student</li>
          <li>Change the student's status to 2nd semester</li>
          <li>Load 2nd semester sessions for the student</li>
        <li>This action cannot be undone</li>
      </ul>
      </div>
      <div class="px-5 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
        <button 
          @click="showCompleteSemesterModal = false; selectedStudent = null;" 
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="completeSemester(selectedStudent)" 
          :disabled="completingSemester"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors disabled:opacity-50"
        >
          <span v-if="completingSemester" class="flex items-center">
            <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
          <span v-else>Confirm & Complete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { sessionService } from '../../services/sessionService';
import { classService } from '../../services/classService';
import { notificationService } from '../../services/notificationService';
import api from '../../services/api';
import { adviserService } from '../../services/adviserService';
import { studentService } from '../../services/studentService';

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
const completingSemester = ref(false);
const completingStudentId = ref(null);
const showCompleteSemesterModal = ref(false);
const classes = ref([]);
const selectedClass = ref(null);
const selectedStudent = ref(null);
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

// Computed properties
const hasChanges = computed(() => {
  return pendingChanges.value.size > 0;
});

// Check if any student has more than 2 missed sessions
const studentsWithTooManyMissedSessions = computed(() => {
  if (!sessionMatrix.value.students || !sessionMatrix.value.sessions) {
    return [];
  }
  
  const requiredCompletedSessions = 16; // Allow only 2 missed sessions (out of 18 total)
  const studentsWithIssues = [];
  
  sessionMatrix.value.students.forEach(student => {
    // Count completed sessions for this student
    const completedCount = Object.values(student.sessions).filter(s => s.completed).length;
    if (completedCount < requiredCompletedSessions) {
      studentsWithIssues.push({
        id: student.id,
        name: student.name,
        completed: completedCount,
        missing: sessionMatrix.value.sessions.length - completedCount
      });
    }
  });
  
  return studentsWithIssues;
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

const canCompleteSemester = computed(() => {
  if (!selectedClass.value || !selectedClass.value.sspSubject) {
    return false;
  }
  
  // Only show button for 1st semester - make matching more flexible
  const semester = selectedClass.value.sspSubject.semester || '';
  
  // Check for "1st Semester", "First Semester", or just "1st"
  const is1stSemester = semester.toLowerCase().includes('1st') || 
                         semester.toLowerCase().includes('first') || 
                         semester === '1';
                         
  // Students must have at most 2 missed sessions
  const studentsEligible = studentsWithTooManyMissedSessions.value.length === 0;
  
  return is1stSemester && studentsEligible;
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
  
  // Students who are still in 1st semester (not completed)
  return sessionMatrix.value.students.filter(student => {
    // Check if student has any session marked with '1st Semester (Completed)'
    const hasCompletedFirstSemester = Object.values(student.sessions || {}).some(
      session => session.semester === '1st Semester (Completed)'
    );
    
    // Check if student has any 2nd semester sessions
    const hasSecondSemesterSessions = Object.values(student.sessions || {}).some(
      session => session.semester === '2nd Semester'
    );
    
    // Include in 1st semester if not completed 1st semester and doesn't have 2nd semester sessions
    return !hasCompletedFirstSemester && !hasSecondSemesterSessions;
  });
});

const secondSemesterStudents = computed(() => {
  if (!sessionMatrix.value.students || !sessionMatrix.value.students.length) {
    return [];
  }
  
  // Students who have completed 1st semester or have 2nd semester sessions
  return sessionMatrix.value.students.filter(student => {
    // Check if student has any session marked with '1st Semester (Completed)'
    const hasCompletedFirstSemester = Object.values(student.sessions || {}).some(
      session => session.semester === '1st Semester (Completed)'
    );
    
    // Check if student has any 2nd semester sessions
    const hasSecondSemesterSessions = Object.values(student.sessions || {}).some(
      session => session.semester === '2nd Semester'
    );
    
    // Include in 2nd semester if completed 1st semester or has 2nd semester sessions
    return hasCompletedFirstSemester || hasSecondSemesterSessions;
  });
});

const firstSemesterSessions = computed(() => {
  if (!sessionMatrix.value.sessions || !sessionMatrix.value.sessions.length) {
    return [];
  }
  
  // Filter sessions for 1st semester - typically days 0-17
  return sessionMatrix.value.sessions.filter(session => {
    // Check for explicit semester marking or use day range
    const isSemesterMarked = session.semester === '1st Semester';
    const isDayInRange = session.day < 18; // Assuming 0-17 are 1st semester
    
    return isSemesterMarked || isDayInRange;
  });
});

const secondSemesterSessions = computed(() => {
  if (!sessionMatrix.value.sessions || !sessionMatrix.value.sessions.length) {
    return [];
  }
  
  // Filter sessions for 2nd semester - typically days 18-35
  return sessionMatrix.value.sessions.filter(session => {
    // Check for explicit semester marking or use day range
    const isSemesterMarked = session.semester === '2nd Semester';
    const isDayInRange = session.day >= 18; // Assuming 18+ are 2nd semester
    
    return isSemesterMarked || isDayInRange;
  });
});

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
      notificationService.showError('Invalid class data received')
      return
    }
    
    loading.value = true
    errorMessage.value = ''
    selectedClass.value = classData
    
    // Store selected class ID in localStorage
    localStorage.setItem('selectedClassId', classData._id)

    // If the class already has students array populated, use it
    if (classData.students && Array.isArray(classData.students) && classData.students.length > 0) {
      students.value = classData.students
    } else {
      // Otherwise load students from the API
      try {
        const loadedStudents = await studentService.loadStudentsByClass(classData._id)
        
        if (!loadedStudents || loadedStudents.length === 0) {
          students.value = []
          notificationService.showWarning('No students found in this class')
        } else {
          students.value = loadedStudents
        }
      } catch (studentError) {
        errorMessage.value = `Failed to load students: ${studentError.message}`
        notificationService.showError(`Error loading students: ${studentError.message}`)
        students.value = []
      }
    }

    try {
      const matrix = await sessionService.getSessionMatrix(classData._id)
      
      if (!matrix || !matrix.data) {
        sessionMatrix.value = {
          sessions: [],
          students: []
        }
        notificationService.showWarning('Unable to load session data. Some features may be limited.')
      } else {
        sessionMatrix.value = matrix.data
        
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
            }))
          
          if (matrixStudents.length > 0) {
            students.value = matrixStudents
          }
        }
      }
    } catch (matrixError) {
      errorMessage.value = `Failed to load session matrix: ${matrixError.message}`
      notificationService.showError(`Error loading session data: ${matrixError.message}`)
      sessionMatrix.value = {
        sessions: [],
        students: []
      }
    }
    
    // Reset selected student when changing class
    selectedStudent.value = null
    sessions.value = []
  } catch (error) {
    errorMessage.value = `Error selecting class: ${error.message}`
    notificationService.showError(`Failed to select class: ${error.message}`)
  } finally {
    loading.value = false
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
    if (!student || !student.sessions[sessionId]) {
      return;
    }
    
    // Get the session completion record ID
    const sessionCompletionId = student.sessions[sessionId].id;
    if (!sessionCompletionId) {
      return;
    }
    
    // Add to pending changes
    const changeKey = `${studentId}_${sessionId}`;
    pendingChanges.value.set(changeKey, {
      sessionId: sessionCompletionId,
      completed: completed
    });
    
    try {
      // Call the direct API endpoint for immediate update
      const response = await sessionService.updateSessionStatus(sessionCompletionId, completed);
      
      // Show success notification
      notificationService.showSuccess(
        `Session marked as ${completed ? 'completed' : 'pending'} for student`
      );
      
      // Remove from pending changes since update was successful
      pendingChanges.value.delete(changeKey);
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
    const matrixResponse = await sessionService.getSessionMatrix(selectedClass.value._id);
    
    if (matrixResponse && matrixResponse.data) {
      sessionMatrix.value = matrixResponse.data;
      console.log(`Refreshed matrix with ${sessionMatrix.value.students?.length || 0} students and ${sessionMatrix.value.sessions?.length || 0} sessions`);
      
      // Log semester distribution for debugging
      const firstSem = sessionMatrix.value.sessions?.filter(s => s.semester === '1st Semester').length || 0;
      const secondSem = sessionMatrix.value.sessions?.filter(s => s.semester === '2nd Semester').length || 0;
      console.log(`Sessions by semester: 1st=${firstSem}, 2nd=${secondSem}`);
      
      // Log students in each semester
      console.log(`1st semester students: ${firstSemesterStudents.value.length}`);
      console.log(`2nd semester students: ${secondSemesterStudents.value.length}`);
    } else {
      console.error('Invalid matrix data received during refresh');
    }
  } catch (error) {
    console.error(`Error refreshing session matrix: ${error.message}`);
    notificationService.showError('Failed to refresh session data');
  } finally {
    matrixLoading.value = false;
  }
}

function getStudentCompliancePercentage(student) {
  if (!student || !student.sessions) return 0;
  
  // Count completed sessions
  let completed = 0;
  let total = 0;
  
  for (const sessionId in student.sessions) {
    total++;
    if (student.sessions[sessionId].completed) {
      completed++;
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

function getStudentById(studentId) {
  return sessionMatrix.value.students.find(student => student.id === studentId);
}

// Add this new function to ensure all sessions exist for all students
async function ensureAllSessionsExist(classId) {
  if (!classId) return;
  
  try {
    await sessionService.validateClassSessions(classId);
  } catch (error) {
    // Non-critical error, continue without showing error
  }
}

// User actions
function completeSemesterConfirm(student) {
  selectedStudent.value = student;
  showCompleteSemesterModal.value = true;
}

async function completeSemester(student) {
  if (!selectedClass.value || !selectedClass.value._id) {
    notificationService.showError('No class selected');
    return;
  }
  
  if (!student || !student.id) {
    notificationService.showError('No student selected');
    return;
  }
  
  // Double-check if 2nd semester is available before proceeding
  if (!is2ndSemesterAvailable.value) {
    notificationService.showError(
      "Cannot proceed to 2nd semester. The admin has not yet added 2nd semester sessions for this subject."
    );
    return;
  }
  
  // Check if student has completed enough sessions (at least 16 out of 18)
  const requiredCompletedSessions = 16;
  let completedCount = 0;
  let sessionCount = 0;
  
  for (const sessionId in student.sessions) {
    const session = student.sessions[sessionId];
    // Only count 1st semester sessions
    if (!session.semester || session.semester === '1st Semester') {
      sessionCount++;
      if (session.completed) {
        completedCount++;
      }
    }
  }
  
  if (completedCount < requiredCompletedSessions) {
    notificationService.showError(
      `Cannot complete semester for ${student.name}. The student has only completed ${completedCount} out of ${sessionCount} sessions.`
    );
    return;
  }
  
  completingSemester.value = true;
  completingStudentId.value = student.id;
  showCompleteSemesterModal.value = false;
  
  try {
    // Step 1: Archive current sessions for this student
    const archiveResponse = await sessionService.archiveStudentSessions(
      selectedClass.value._id, 
      student.id
    );
    
    if (!archiveResponse || !archiveResponse.success) {
      // Check for specific error types from the response
      if (archiveResponse?.type === 'no_second_semester') {
        throw new Error('The admin has not yet configured 2nd semester sessions for this subject. Please contact the admin.');
      } else if (archiveResponse?.type === 'too_many_missed_sessions') {
        throw new Error(`Cannot proceed: ${student.name} has more than 2 missed sessions.`);
      } else {
        throw new Error(archiveResponse?.message || 'Failed to archive current sessions');
      }
    }
    
    // Step 2: Load sessions for next semester for this student
    const loadResponse = await sessionService.loadStudentSessions(
      selectedClass.value._id,
      student.id,
      '2nd Semester'
    );
    
    if (!loadResponse || !loadResponse.success) {
      throw new Error(loadResponse?.message || 'Failed to load next semester sessions');
    }
    
    // Step 3: Refresh the session matrix to show updated data
    await refreshSessionMatrix();
    
    // Step 4: Switch to the 2nd semester tab to show the student in the new list
    activeTab.value = '2nd';
    
    notificationService.showSuccess(`Successfully completed 1st semester for ${student.name} and initialized 2nd semester sessions`);
  } catch (error) {
    notificationService.showError('Failed to complete semester: ' + error.message);
  } finally {
    completingSemester.value = false;
    completingStudentId.value = null;
    selectedStudent.value = null;
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
    
    if (missingCount === 0) {
      notificationService.showInfo(`${student.name} has no missing sessions.`);
      return;
    }
    
    // Determine whether student is in 1st or 2nd semester
    const isFirstSemester = firstSemesterStudents.value.some(s => s.id === student.id);
    const requiredSessions = isFirstSemester ? 16 : 18; // 16 minimum for 1st semester (2 can be missed)
    const totalSessions = Object.keys(student.sessions).length;
    const completedSessions = totalSessions - missingCount;
    
    // Create notification message based on semester and missing count
    let message = `You have ${missingCount} missing SSP sessions.`;
    
    if (isFirstSemester) {
      message += ` You need to complete at least ${requiredSessions} sessions (${requiredSessions}/${totalSessions}) to advance to the 2nd semester. Currently completed: ${completedSessions}/${totalSessions}.`;
    } else {
      message += ` Please complete all your 2nd semester sessions to fulfill your SSP requirements. Currently completed: ${completedSessions}/${totalSessions}.`;
    }
    
    console.log(`Sending notification to student ${student.id}: ${message}`);
    
    // Send notification to the student
    const response = await sessionService.notifyStudent(
      selectedClass.value._id,
      student.id,
      message
    );
    
    if (response && response.success) {
      notificationService.showSuccess(`Reminder sent to ${student.name}`);
      
      // Send a fallback notification to the user using notificationService
      // This ensures notification is visible even if backend model has issues
      try {
        const userId = sessionMatrix.value.students.find(s => s.id === student.id)?.userId;
        if (userId) {
          await api.post('/notifications/create', {
            userId: userId,
            title: 'Session Completion Reminder',
            message: message,
            type: 'warning'
          }).catch(err => console.warn('Fallback notification failed:', err));
        }
      } catch (fallbackError) {
        console.warn('Fallback notification error:', fallbackError);
      }
    } else {
      throw new Error(response?.message || 'Failed to send notification');
    }
  } catch (error) {
    console.error(`Failed to send reminder: ${error.message}`, error);
    notificationService.showError(`Failed to send reminder: ${error.message}`);
  }
}

// Add the missing helper functions back
function canCompleteStudentSemester(student) {
  if (!student || !student.sessions) return false;
  
  // Check if we have at least 16 completed sessions (out of 18)
  const requiredCompletedSessions = 16;
  let completed = 0;
  let total = Object.keys(student.sessions).length;
  
  for (const sessionId in student.sessions) {
    if (student.sessions[sessionId].completed) {
      completed++;
    }
  }
  
  // Can complete if they meet minimum requirements (16 or more completed)
  // and we have 2nd semester sessions available
  return total === 0 ? false : completed >= requiredCompletedSessions && is2ndSemesterAvailable.value;
}

function hasStudentCompletedSemester(student) {
  if (!student || !student.sessions) return false;
  
  // Check if all sessions are completed
  for (const sessionId in student.sessions) {
    if (!student.sessions[sessionId].completed) {
      return false;
    }
  }
  
  return Object.keys(student.sessions).length > 0;
}

function getStudentMissingSessionsCount(student) {
  if (!student || !student.sessions) return 0;
  
  // Count missing sessions
  let missing = 0;
  
  for (const sessionId in student.sessions) {
    if (!student.sessions[sessionId].completed) {
      missing++;
    }
  }
  
  return missing;
}

// Helper functions
async function validateClassSessions(classId) {
  if (!classId) return;
  
  try {
    const response = await sessionService.validateClassSessions(classId);
    
    if (response && response.data && response.data.results) {
      if (response.data.results.createdSessions > 0) {
        notificationService.showSuccess(`Fixed ${response.data.results.createdSessions} missing session records`);
      }
    }
  } catch (error) {
    // Non-critical operation, suppress error notifications
  }
}

async function ensureAllStudentsHaveSessions(classId) {
    if (!classId) return;
    
  try {
    const response = await sessionService.validateClassSessions(classId);
    
    if (response && response.data && response.data.results) {
    if (response.data.results.createdSessions > 0) {
        notificationService.showSuccess(`Created ${response.data.results.createdSessions} missing session records`);
    }
    }
  } catch (error) {
    // Non-critical error, continue without showing error
  }
}

async function loadStudent(student) {
  selectedStudent.value = student;
  
  if (!selectedClass.value || !student) {
    return;
    }

    try {
    // Load sessions for this student
    const loadedSessions = await sessionService.getSessionsForStudent(student._id, selectedClass.value._id);
      
      if (!loadedSessions || loadedSessions.length === 0) {
      sessions.value = [];
      } else {
      sessions.value = loadedSessions;
    }
  } catch (error) {
    notificationService.showError('Failed to load student sessions');
    sessions.value = [];
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
</style> 