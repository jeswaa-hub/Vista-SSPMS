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
        <h4 class="px-4 py-2 bg-gray-50 border-b font-medium">Session Compliance Tracking</h4>
        
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
                    <div class="flex flex-col items-center">
                      <div v-if="!isEligibleForPromotion(student)">
                        <span class="text-xs text-amber-600 font-medium mb-1 block">
                        {{ getStudentMissingSessionsCount(student) }} sessions missing
                      </span>
                      <button 
                        @click="notifyStudent(student)"
                          class="mt-1 px-2 py-1 text-xs border border-transparent rounded-md shadow-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Send Reminder
                      </button>
                      </div>
                      <div v-else>
                        <span class="text-xs text-green-600 font-medium mb-1 block">
                          Eligible for promotion
                        </span>
                        <button 
                          @click="promoteStudent(student)"
                          class="mt-1 px-2 py-1 text-xs border border-transparent rounded-md shadow-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          Promote to 2nd
                        </button>
                      </div>
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
                      <span v-if="!isEligibleForPromotion(student)" class="text-xs text-amber-600 font-medium mb-1">
                        {{ getStudentMissingSessionsCount(student) }} sessions missing
                      </span>
                      <button 
                        v-if="!isEligibleForPromotion(student)"
                        @click="notifyStudent(student)"
                        class="px-2 py-1 text-xs border border-transparent rounded-md shadow-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Send Reminder
                      </button>
                      <template v-else>
                        <span class="text-xs text-green-600 font-medium block mb-1">
                          Completed 2nd semester
                      </span>
                        <button 
                          @click="promoteToNextYear(student)"
                          class="px-2 py-1 text-xs border border-transparent rounded-md shadow-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          Promote to Next Year
                        </button>
                      </template>
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

    <!-- Add the promotion confirmation modal -->
    <div v-if="showPromoteModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Promote Student</h3>
        <p class="text-sm text-gray-600 mb-4">
          Are you sure you want to promote <span class="font-medium">{{ studentToPromote?.name }}</span> to 2nd semester?
          <br><br>
          This will:
          <br>• Archive 1st semester sessions to history
          <br>• Create 2nd semester sessions
          <br>• Student will be moved to the 2nd semester tab
        </p>

        <div class="flex justify-end space-x-3 mt-6">
        <button 
            @click="cancelPromoteStudent" 
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="confirmPromoteStudent" 
            :disabled="promotingStudent"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="promotingStudent" class="flex items-center">
            <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
              Promoting...
          </span>
            <span v-else>Promote Student</span>
          </button>
      </div>
    </div>
  </div>
  
    <!-- Add the Year-End Promotion confirmation modal -->
    <div v-if="showYearEndPromoteModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Promote to Next Year</h3>
        <p class="text-sm text-gray-600 mb-4">
          Are you sure you want to promote <span class="font-medium">{{ studentToPromote?.name }}</span> to the next year level?
          <br><br>
          This will:
          <br>• Archive all current year sessions to history
          <br>• Move student to the next year level class
          <br>• Assign student to the new year's adviser
          <br>• Update student's record with new year level
        </p>

        <div v-if="nextYearClassDetails" class="bg-blue-50 p-3 rounded-md mb-4">
          <h4 class="text-sm font-medium text-blue-800 mb-2">Target Class Information:</h4>
          <p class="text-sm text-blue-700">
            <span class="font-medium">Year Level:</span> {{ nextYearClassDetails.yearLevel }}<br>
            <span class="font-medium">Section:</span> {{ nextYearClassDetails.section }}<br>
            <span class="font-medium">Major:</span> {{ nextYearClassDetails.major || selectedClass?.major || 'Same as current' }}
          </p>
      </div>

        <div class="flex justify-end space-x-3 mt-6">
        <button 
            @click="cancelYearEndPromote" 
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
            @click="confirmYearEndPromote" 
            :disabled="promotingStudent"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="promotingStudent" class="flex items-center">
            <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
              Promoting...
          </span>
            <span v-else>Promote to Next Year</span>
        </button>
        </div>
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

// Add new state variables for promotion functionality
const showPromoteModal = ref(false);
const showYearEndPromoteModal = ref(false);
const studentToPromote = ref(null);
const nextYearClassDetails = ref(null);
const promotingStudent = ref(false);

// Computed properties
const hasChanges = computed(() => {
  return pendingChanges.value.size > 0;
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
      
      // Show success notification
      notificationService.showSuccess(
        `Session marked as ${completed ? 'completed' : 'pending'} for student`
      );
      
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
          
          notificationService.showSuccess(`Session ${completed ? 'completed' : 'marked as pending'}`);
        } else {
          notificationService.showWarning('Session updated but response was unexpected');
        }
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
      const firstSem = sessionMatrix.value.sessions?.filter(s => s.semester === '1st Semester' || (!s.semester && s.day < 18)).length || 0;
      const secondSem = sessionMatrix.value.sessions?.filter(s => s.semester === '2nd Semester' || (!s.semester && s.day >= 18)).length || 0;
      
      console.log(`Sessions by semester: 1st=${firstSem}, 2nd=${secondSem}`);
      console.log('2nd semester sessions:', sessionMatrix.value.sessions?.filter(s => s.semester === '2nd Semester' || (!s.semester && s.day >= 18)).map(s => ({ day: s.day, title: s.title })));
      
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
    
    if (missingCount === 0) {
      notificationService.showInfo(`${student.name} has no missing sessions.`);
      return;
    }
    
    // Determine whether student is in 1st or 2nd semester
    const isFirstSemester = firstSemesterStudents.value.some(s => s.id === student.id);
    const totalSessions = Object.keys(student.sessions).length;
    const completedSessions = totalSessions - missingCount;
    
    // Create notification message based on semester and missing count
    let message = `You have ${missingCount} missing SSP sessions.`;
    message += ` Please complete your sessions. Currently completed: ${completedSessions}/${totalSessions}.`;
    
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
  
  // Try to find the subject in the classData
  if (selectedClass.firstSemester?.sspSubject === subjectId &&
      selectedClass.firstSemester?.sspSubjectData?.sspCode) {
    return selectedClass.firstSemester.sspSubjectData.sspCode;
  }
  
  if (selectedClass.secondSemester?.sspSubject === subjectId &&
      selectedClass.secondSemester?.sspSubjectData?.sspCode) {
    return selectedClass.secondSemester.sspSubjectData.sspCode;
  }
  
  // If we have the subject data directly in sspSubject
  if (selectedClass.sspSubject?._id === subjectId && selectedClass.sspSubject?.sspCode) {
    return selectedClass.sspSubject.sspCode;
  }
  
  // Return the ID if we can't find the code
  return `Subject ID: ${subjectId}`;
}

// Function to show the promotion confirmation modal
function promoteStudent(student) {
  if (!student) return;
  
  // Check if the student is eligible for promotion
  if (!isEligibleForPromotion(student)) {
    const missingCount = getStudentMissingSessionsCount(student);
    notificationService.showWarning(`Student has ${missingCount} missing sessions and cannot be promoted yet.`);
    return;
  }
  
  studentToPromote.value = student;
  showPromoteModal.value = true;
}

// Function to cancel the promotion
function cancelPromoteStudent() {
  showPromoteModal.value = false;
  studentToPromote.value = null;
}

// Function to confirm and execute the promotion
async function confirmPromoteStudent() {
  if (!studentToPromote.value || !selectedClass.value) return;
  
  promotingStudent.value = true;
  
  try {
    console.log(`Promoting student ${studentToPromote.value.id} to 2nd semester`);
    
    // Call the API to archive student sessions and create 2nd semester sessions
    const response = await sessionService.archiveStudentSessions(
      selectedClass.value._id,
      studentToPromote.value.id
    );
    
    if (response && response.success) {
      notificationService.showSuccess(`Student ${studentToPromote.value.name} promoted to 2nd semester`);
      
      // Refresh the session matrix to update the UI
      await refreshSessionMatrix();
      
      // Switch to the 2nd semester tab
      activeTab.value = '2nd';
    } else {
      throw new Error(response?.message || 'Failed to promote student');
    }
  } catch (error) {
    console.error('Error promoting student:', error);
    notificationService.showError(`Failed to promote student: ${error.message}`);
  } finally {
    promotingStudent.value = false;
    showPromoteModal.value = false;
    studentToPromote.value = null;
  }
}

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
  
  return completedCount >= requiredCompleted;
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

// Add this new method to promote a student to the next year
async function promoteToNextYear(student) {
  if (!student || !selectedClass.value) return;
  
  // Check if the student is eligible for promotion
  if (!isEligibleForPromotion(student)) {
    const missingCount = getStudentMissingSessionsCount(student);
    notificationService.showWarning(`Student has ${missingCount} missing sessions and cannot be promoted yet.`);
    return;
  }
  
  try {
    // Get the current year level and calculate the next year level
    const currentYearLevel = selectedClass.value.yearLevel;
    
    console.log(`PROMOTION DEBUG: Starting promotion process`);
    console.log(`PROMOTION DEBUG: Student ID: ${student.id}, Name: ${student.name}`);
    console.log(`PROMOTION DEBUG: Current Class: ${selectedClass.value._id}`);
    console.log(`PROMOTION DEBUG: Current Year Level: "${currentYearLevel}"`);
    console.log(`PROMOTION DEBUG: Current Section: "${selectedClass.value.section}"`);
    console.log(`PROMOTION DEBUG: Current Major: "${selectedClass.value.major || 'Not specified'}"`);
    
    // First try to find 3rd year classes (normal progression)
    const thirdYearLevel = calculateNextYearLevel(currentYearLevel);
    const currentSection = selectedClass.value.section;
    
    console.log(`PROMOTION DEBUG: Looking for classes at level: "${thirdYearLevel}"`);
    let availableClasses = await findNextYearClasses(thirdYearLevel, currentSection);
    
    // If no 3rd year classes found and we're in 2nd year, try 4th year (skip a year)
    let targetYearLevel = thirdYearLevel;
    if ((!availableClasses || availableClasses.length === 0) && currentYearLevel.includes('2')) {
      // Extract numeric part to check if we're in 2nd year
      const currentYearMatch = currentYearLevel.match(/(\d+)/);
      if (currentYearMatch && currentYearMatch[1] === '2') {
        // Calculate 4th year level in same format as current
        const fourthYearLevel = currentYearLevel.replace(/2(nd|ND)?/, '4th').replace(/2/, '4');
        console.log(`PROMOTION DEBUG: No 3rd year classes found, trying 4th year: "${fourthYearLevel}"`);
        
        // Try to find 4th year classes
        availableClasses = await findNextYearClasses(fourthYearLevel, currentSection);
        targetYearLevel = fourthYearLevel;
      }
    }
    
    console.log(`PROMOTION DEBUG: Available classes for "${targetYearLevel}":`, availableClasses);
    
    if (!availableClasses || availableClasses.length === 0) {
      console.error(`PROMOTION DEBUG: No classes found for year level "${targetYearLevel}"`);
      notificationService.showWarning(
        `No classes found for ${targetYearLevel} year level. Please ask an administrator to create the appropriate classes first.`
      );
      return;
    }
    
    // Choose the most appropriate next year class
    const nextYearClass = selectNextYearClass(availableClasses, currentSection);
    
    if (!nextYearClass) {
      console.error(`PROMOTION DEBUG: Failed to select an appropriate class from available options`);
      notificationService.showWarning(
        `Could not find an appropriate class for ${targetYearLevel} year level. Please check available classes.`
      );
      return;
    }
    
    console.log(`PROMOTION DEBUG: Selected next year class:`, nextYearClass);
    
    // Store the next year class details for display in the modal
    nextYearClassDetails.value = nextYearClass;
    
    // Set the student to promote and show the confirmation modal
    studentToPromote.value = student;
    showYearEndPromoteModal.value = true;
  } catch (error) {
    console.error('PROMOTION DEBUG: Error preparing for promotion:', error);
    notificationService.showError(`Failed to prepare promotion: ${error.message}`);
  }
}

// Function to cancel year-end promotion
function cancelYearEndPromote() {
  showYearEndPromoteModal.value = false;
  studentToPromote.value = null;
  nextYearClassDetails.value = null;
}

// Function to confirm and execute year-end promotion
async function confirmYearEndPromote() {
  if (!studentToPromote.value || !selectedClass.value || !nextYearClassDetails.value) return;
  
  promotingStudent.value = true;
  
  try {
    console.log(`Promoting student ${studentToPromote.value.id} to next year level`);
    
    // First, ensure all sessions are completed (if not already)
    await completeAllSessions(studentToPromote.value);
    
    // Get the current and next year level information
    const currentYearLevel = selectedClass.value.yearLevel;
    const nextYearLevel = nextYearClassDetails.value.yearLevel;
    const currentMajor = selectedClass.value.major;
    
    // Call the API to move the student to the next year class
    const response = await api.post('/students/promote-year', {
      studentId: studentToPromote.value.id,
      currentClassId: selectedClass.value._id,
      nextClassId: nextYearClassDetails.value._id,
      currentYearLevel: currentYearLevel,
      nextYearLevel: nextYearLevel,
      currentMajor: currentMajor // Add major to ensure consistent transfer
    });
    
    if (response.data && response.data.success) {
      notificationService.showSuccess(`Student ${studentToPromote.value.name} promoted to ${nextYearLevel}`);
      
      // Refresh the class data and session matrix
      await loadClasses();
      await refreshSessionMatrix();
    } else {
      throw new Error(response.data?.message || 'Failed to promote student to next year');
    }
  } catch (error) {
    console.error('Error promoting student to next year:', error);
    notificationService.showError(`Failed to promote student: ${error.message}`);
  } finally {
    promotingStudent.value = false;
    showYearEndPromoteModal.value = false;
    studentToPromote.value = null;
    nextYearClassDetails.value = null;
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

// Helper function to find classes for the next year level
async function findNextYearClasses(nextYearLevel, currentSection) {
  try {
    console.log(`PROMOTION DEBUG: Finding classes for next year level: "${nextYearLevel}"`);
    
    // Use the new endpoint specifically for promotion
    const response = await api.get(`/classes/for-promotion/${nextYearLevel}`);
    
    if (!response.data) {
      console.error(`PROMOTION DEBUG: Empty response from for-promotion endpoint`);
      return [];
    }
    
    console.log(`PROMOTION DEBUG: Found ${response.data.length} classes for next year level: "${nextYearLevel}"`);
    console.log(`PROMOTION DEBUG: Classes found:`, response.data.map(c => ({ 
      id: c._id, 
      yearLevel: c.yearLevel, 
      section: c.section 
    })));
    
    // Check if we got any classes with exactly matching year level
    const exactMatches = response.data.filter(c => c.yearLevel === nextYearLevel);
    if (exactMatches.length > 0) {
      console.log(`PROMOTION DEBUG: Found ${exactMatches.length} exact matches for "${nextYearLevel}"`);
    }
    
    // Extract the numeric part from the next year level for numeric comparison
    const nextYearNumeric = nextYearLevel.match(/(\d+)/);
    const nextYearNum = nextYearNumeric ? parseInt(nextYearNumeric[1], 10) : 0;
    
    // Check for numeric matches (e.g., "3" matches "3rd Year")
    const numericMatches = response.data.filter(c => {
      const classYearNumeric = c.yearLevel.match(/(\d+)/);
      const classYearNum = classYearNumeric ? parseInt(classYearNumeric[1], 10) : 0;
      return classYearNum === nextYearNum;
    });
    
    if (numericMatches.length > 0) {
      console.log(`PROMOTION DEBUG: Found ${numericMatches.length} numeric matches for year ${nextYearNum}`);
    }
    
    // Filter is done on the server, just return the data
    return response.data;
  } catch (error) {
    console.error('PROMOTION DEBUG: Error finding next year classes:', error);
    
    // If API fails, show a more specific error message
    if (error.response && error.response.status === 404) {
      console.error(`PROMOTION DEBUG: 404 error finding classes for "${nextYearLevel}"`);
      notificationService.showWarning(`No classes found for ${nextYearLevel} year level. Please create these classes first.`);
    } else {
      console.error(`PROMOTION DEBUG: Non-404 error:`, error.response?.status, error.response?.data);
      notificationService.showError(`Failed to find next year classes: ${error.message}`);
    }
    
    // Return empty array instead of throwing to handle gracefully
    return [];
  }
}

// Helper function to select the most appropriate next year class
function selectNextYearClass(availableClasses, currentSection) {
  if (!availableClasses || availableClasses.length === 0) {
    console.error(`PROMOTION DEBUG: No available classes to select from`);
    return null;
  }
  
  console.log(`PROMOTION DEBUG: Selecting next year class from ${availableClasses.length} options`);
  console.log(`PROMOTION DEBUG: Current section: "${currentSection}"`);
  
  // First try to find a class with the exact same section
  const exactSectionMatch = availableClasses.find(cls => cls.section === currentSection);
  if (exactSectionMatch) {
    console.log(`PROMOTION DEBUG: Found exact section match: "${exactSectionMatch.yearLevel}-${exactSectionMatch.section}"`);
    return exactSectionMatch;
  }
  
  // If no exact match, try to find a similar section (e.g., "A" and "A1")
  const similarSectionMatches = availableClasses.filter(cls => 
    cls.section.startsWith(currentSection) || 
    currentSection.startsWith(cls.section)
  );
  
  if (similarSectionMatches.length > 0) {
    console.log(`PROMOTION DEBUG: Found ${similarSectionMatches.length} similar section matches`);
    // Use the first one as default
    console.log(`PROMOTION DEBUG: Selected similar section: "${similarSectionMatches[0].yearLevel}-${similarSectionMatches[0].section}"`);
    return similarSectionMatches[0];
  }
  
  // If still no match, just return the first available class
  console.log(`PROMOTION DEBUG: No section match found, defaulting to first available class: "${availableClasses[0].yearLevel}-${availableClasses[0].section}"`);
  return availableClasses[0];
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