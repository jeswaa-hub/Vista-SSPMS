<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="bg-purple-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Odyssey Plans</h1>
            <p class="text-gray-600">Monitor student Odyssey Plan submissions across all classes</p>
          </div>
        </div>
        
        <button
          @click="refreshData"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" :class="{ 'animate-spin': loading }">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Class Selector -->
    <div class="bg-white rounded-lg shadow-sm p-6" v-if="classes.length > 0">
      <div class="flex items-center space-x-4">
        <label for="class-select" class="text-sm font-medium text-gray-700">
          Select Class:
        </label>
        <select 
          id="class-select"
          v-model="selectedClassId" 
          @change="onClassChange"
          class="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
        >
          <option value="">Select a class</option>
          <option v-for="cls in classes" :key="cls._id" :value="cls._id">
            {{ cls.yearLevel }} - {{ cls.section }} ({{ cls.major }})
          </option>
        </select>
        
        <div v-if="selectedClass" class="text-sm text-gray-600">
          {{ selectedClass.students?.length || 0 }} students
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span class="ml-3 text-gray-600">Loading Odyssey Plans...</span>
      </div>
    </div>

    <!-- No Class Selected -->
    <div v-else-if="!selectedClass" class="bg-white rounded-lg shadow-sm p-6">
      <div class="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Select a Class</h3>
        <p class="text-gray-600">Please select a class to view Odyssey Plans</p>
      </div>
    </div>

    <!-- Odyssey Plans Data -->
    <div v-else-if="selectedClass && !loading" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="bg-blue-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Students</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalStudents }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="bg-green-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Complete</p>
              <p class="text-2xl font-bold text-green-600">{{ completedStudents }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="bg-yellow-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Incomplete</p>
              <p class="text-2xl font-bold text-yellow-600">{{ incompleteStudents }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="bg-purple-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Completion Rate</p>
              <p class="text-2xl font-bold text-purple-600">{{ completionRate }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Students Table -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6">
          <div v-if="allStudents.length === 0" class="text-center py-8">
            <p class="text-gray-500">No students found</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year Level
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1st Semester
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    2nd Semester
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in allStudents" :key="student.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-700">
                            {{ getInitials(student.name) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                        <div class="text-sm text-gray-500">{{ student.idNumber }}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="text-sm text-gray-900">{{ getStudentYearLevel(student) }}</span>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span v-if="hasOdysseyPlanForSemester(student, 1)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      Submitted
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                      </svg>
                      Pending
                    </span>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span v-if="hasOdysseyPlanForSemester(student, 2)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      Submitted
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                      </svg>
                      Pending
                    </span>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      @click="viewPlan(student)"
                      class="text-purple-600 hover:text-purple-900 mr-3"
                    >
                      Compare Plans
                    </button>
                    <button
                      v-if="!hasAnyOdysseyPlan(student)"
                      @click="sendReminder(student)"
                      class="text-yellow-600 hover:text-yellow-700"
                    >
                      Send Reminder
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Comparative Plan Details Modal -->
    <div v-if="showPlanModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closePlanModal">
      <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-7xl shadow-lg rounded-md bg-white">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            Odyssey Plan Comparison - {{ selectedStudent?.name }}
          </h3>
          <button @click="closePlanModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Side by Side Semester Comparison -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 1st Semester -->
          <div class="bg-blue-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-blue-900">1st Semester</h4>
              <span v-if="firstSemesterPlan" :class="getStatusClass(firstSemesterPlan.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ firstSemesterPlan.status }}
              </span>
              <span v-else class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Not Submitted
              </span>
            </div>
            
            <div v-if="firstSemesterPlan" class="space-y-4">
              <!-- Submission Date -->
              <div class="text-sm text-blue-700 mb-4">
                <span class="font-medium">Submitted:</span> {{ formatDate(firstSemesterPlan.submittedAt) }}
              </div>
              
              <!-- Academic Goals -->
              <div>
                <h5 class="font-medium text-blue-900 mb-2 flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Academic Goals
                </h5>
                <div v-if="firstSemesterPlan.academicGoals && firstSemesterPlan.academicGoals.length > 0" class="space-y-2">
                  <div v-for="(goal, index) in firstSemesterPlan.academicGoals" :key="index" class="bg-white rounded p-3 border-l-4 border-blue-400">
                    <p class="text-sm font-medium text-gray-900 mb-1">Goal {{ index + 1 }}:</p>
                    <p class="text-sm text-gray-700 mb-2">{{ goal.description }}</p>
                    <div v-if="goal.steps && goal.steps.length > 0">
                      <p class="text-xs font-medium text-gray-600 mb-1">Steps:</p>
                      <ul class="text-xs text-gray-600 space-y-1">
                        <li v-for="(step, stepIndex) in goal.steps" :key="stepIndex" class="flex items-start">
                          <span class="text-blue-400 mr-1">•</span>
                          <span>{{ step.description }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 italic">No academic goals specified</div>
              </div>
              
              <!-- Personal Goals -->
              <div>
                <h5 class="font-medium text-blue-900 mb-2 flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                  </svg>
                  Personal Goals
                </h5>
                <div v-if="firstSemesterPlan.personalGoals && firstSemesterPlan.personalGoals.length > 0" class="space-y-2">
                  <div v-for="(goal, index) in firstSemesterPlan.personalGoals" :key="index" class="bg-white rounded p-3 border-l-4 border-blue-400">
                    <p class="text-sm font-medium text-gray-900 mb-1">Goal {{ index + 1 }}:</p>
                    <p class="text-sm text-gray-700 mb-2">{{ goal.description }}</p>
                    <div v-if="goal.steps && goal.steps.length > 0">
                      <p class="text-xs font-medium text-gray-600 mb-1">Steps:</p>
                      <ul class="text-xs text-gray-600 space-y-1">
                        <li v-for="(step, stepIndex) in goal.steps" :key="stepIndex" class="flex items-start">
                          <span class="text-blue-400 mr-1">•</span>
                          <span>{{ step.description }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 italic">No personal goals specified</div>
              </div>
              
              <!-- Financial Goals -->
              <div>
                <h5 class="font-medium text-blue-900 mb-2 flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                  </svg>
                  Financial Goals
                </h5>
                <div v-if="firstSemesterPlan.financialGoals && firstSemesterPlan.financialGoals.length > 0" class="space-y-2">
                  <div v-for="(goal, index) in firstSemesterPlan.financialGoals" :key="index" class="bg-white rounded p-3 border-l-4 border-blue-400">
                    <p class="text-sm font-medium text-gray-900 mb-1">Goal {{ index + 1 }}:</p>
                    <p class="text-sm text-gray-700 mb-2">{{ goal.description }}</p>
                    <div v-if="goal.steps && goal.steps.length > 0">
                      <p class="text-xs font-medium text-gray-600 mb-1">Steps:</p>
                      <ul class="text-xs text-gray-600 space-y-1">
                        <li v-for="(step, stepIndex) in goal.steps" :key="stepIndex" class="flex items-start">
                          <span class="text-blue-400 mr-1">•</span>
                          <span>{{ step.description }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 italic">No financial goals specified</div>
              </div>
            </div>
            
            <div v-else class="flex items-center justify-center py-12">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="text-gray-500 font-medium">No 1st Semester Plan</p>
                <p class="text-gray-400 text-sm">Student hasn't submitted their plan yet</p>
              </div>
            </div>
          </div>
          
          <!-- 2nd Semester -->
          <div class="bg-green-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-green-900">2nd Semester</h4>
              <span v-if="secondSemesterPlan" :class="getStatusClass(secondSemesterPlan.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ secondSemesterPlan.status }}
              </span>
              <span v-else class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Not Submitted
              </span>
            </div>
            
            <div v-if="secondSemesterPlan" class="space-y-4">
              <!-- Submission Date -->
              <div class="text-sm text-green-700 mb-4">
                <span class="font-medium">Submitted:</span> {{ formatDate(secondSemesterPlan.submittedAt) }}
              </div>
              
              <!-- Academic Goals -->
              <div>
                <h5 class="font-medium text-green-900 mb-2 flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Academic Goals
                </h5>
                <div v-if="secondSemesterPlan.academicGoals && secondSemesterPlan.academicGoals.length > 0" class="space-y-2">
                  <div v-for="(goal, index) in secondSemesterPlan.academicGoals" :key="index" class="bg-white rounded p-3 border-l-4 border-green-400">
                    <p class="text-sm font-medium text-gray-900 mb-1">Goal {{ index + 1 }}:</p>
                    <p class="text-sm text-gray-700 mb-2">{{ goal.description }}</p>
                    <div v-if="goal.steps && goal.steps.length > 0">
                      <p class="text-xs font-medium text-gray-600 mb-1">Steps:</p>
                      <ul class="text-xs text-gray-600 space-y-1">
                        <li v-for="(step, stepIndex) in goal.steps" :key="stepIndex" class="flex items-start">
                          <span class="text-green-400 mr-1">•</span>
                          <span>{{ step.description }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 italic">No academic goals specified</div>
              </div>
              
              <!-- Personal Goals -->
              <div>
                <h5 class="font-medium text-green-900 mb-2 flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                  </svg>
                  Personal Goals
                </h5>
                <div v-if="secondSemesterPlan.personalGoals && secondSemesterPlan.personalGoals.length > 0" class="space-y-2">
                  <div v-for="(goal, index) in secondSemesterPlan.personalGoals" :key="index" class="bg-white rounded p-3 border-l-4 border-green-400">
                    <p class="text-sm font-medium text-gray-900 mb-1">Goal {{ index + 1 }}:</p>
                    <p class="text-sm text-gray-700 mb-2">{{ goal.description }}</p>
                    <div v-if="goal.steps && goal.steps.length > 0">
                      <p class="text-xs font-medium text-gray-600 mb-1">Steps:</p>
                      <ul class="text-xs text-gray-600 space-y-1">
                        <li v-for="(step, stepIndex) in goal.steps" :key="stepIndex" class="flex items-start">
                          <span class="text-green-400 mr-1">•</span>
                          <span>{{ step.description }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 italic">No personal goals specified</div>
              </div>
              
              <!-- Financial Goals -->
              <div>
                <h5 class="font-medium text-green-900 mb-2 flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                  </svg>
                  Financial Goals
                </h5>
                <div v-if="secondSemesterPlan.financialGoals && secondSemesterPlan.financialGoals.length > 0" class="space-y-2">
                  <div v-for="(goal, index) in secondSemesterPlan.financialGoals" :key="index" class="bg-white rounded p-3 border-l-4 border-green-400">
                    <p class="text-sm font-medium text-gray-900 mb-1">Goal {{ index + 1 }}:</p>
                    <p class="text-sm text-gray-700 mb-2">{{ goal.description }}</p>
                    <div v-if="goal.steps && goal.steps.length > 0">
                      <p class="text-xs font-medium text-gray-600 mb-1">Steps:</p>
                      <ul class="text-xs text-gray-600 space-y-1">
                        <li v-for="(step, stepIndex) in goal.steps" :key="stepIndex" class="flex items-start">
                          <span class="text-green-400 mr-1">•</span>
                          <span>{{ step.description }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 italic">No financial goals specified</div>
              </div>
            </div>
            
            <div v-else class="flex items-center justify-center py-12">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="text-gray-500 font-medium">No 2nd Semester Plan</p>
                <p class="text-gray-400 text-sm">Student hasn't submitted their plan yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { adviserService } from '../../services/adviserService'
import { odysseyPlanService } from '../../services/odysseyPlanService'
import { notificationService } from '../../services/notificationService'
import api from '../../services/api'

// Reactive data
const loading = ref(false)
const classes = ref([])
const selectedClassId = ref('')
const selectedClass = ref(null)
const odysseyPlans = ref([])
const showPlanModal = ref(false)
const selectedStudent = ref(null)
const firstSemesterPlan = ref(null)
const secondSemesterPlan = ref(null)

// Computed properties
const allStudents = computed(() => {
  if (!selectedClass.value || !selectedClass.value.students) return []
  
  return selectedClass.value.students.map(student => {
    return {
      id: student._id,
      name: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
      idNumber: student.user ? student.user.idNumber : 'Unknown',
      yearLevel: selectedClass.value.yearLevel
    }
  })
})

const totalStudents = computed(() => {
  return allStudents.value.length
})

const completedStudents = computed(() => {
  return allStudents.value.filter(student => hasAnyOdysseyPlan(student)).length
})

const incompleteStudents = computed(() => {
  return totalStudents.value - completedStudents.value
})

const completionRate = computed(() => {
  if (totalStudents.value === 0) return 0
  return Math.round((completedStudents.value / totalStudents.value) * 100)
})

// Methods
const getInitials = (name) => {
  return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase()
}

const getStudentYearLevel = (student) => {
  return student.yearLevel || selectedClass.value?.yearLevel || 'Unknown'
}

const hasOdysseyPlanForSemester = (student, semester) => {
  const yearNum = extractYearNumber(getStudentYearLevel(student))
  
  return odysseyPlans.value.some(plan => 
    plan.student === student.id && 
    plan.year === yearNum && 
    plan.semester === semester
  )
}

const hasAnyOdysseyPlan = (student) => {
  return hasOdysseyPlanForSemester(student, 1) || hasOdysseyPlanForSemester(student, 2)
}

const getOdysseyPlanForSemester = (student, semester) => {
  const yearNum = extractYearNumber(getStudentYearLevel(student))
  
  return odysseyPlans.value.find(plan => 
    plan.student === student.id && 
    plan.year === yearNum && 
    plan.semester === semester
  )
}

const extractYearNumber = (yearLevel) => {
  const match = yearLevel.match(/(\d+)/)
  return match ? parseInt(match[1]) : 1
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getStatusClass = (status) => {
  switch(status) {
    case 'Approved':
      return 'text-green-600'
    case 'Rejected':
      return 'text-red-600'
    case 'Submitted':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

const loadClasses = async () => {
  try {
    loading.value = true
    const classesData = await adviserService.getAdvisedClasses()
    classes.value = classesData || []
    console.log('Odyssey Page - Loaded classes:', classes.value)
  } catch (error) {
    console.error('Error loading classes:', error)
    notificationService.showError('Failed to load classes')
  } finally {
    loading.value = false
  }
}

const loadOdysseyPlans = async () => {
  if (!selectedClass.value) return
  
  try {
    loading.value = true
    const allPlans = []
    
    console.log('Odyssey Page - Loading plans for class:', selectedClass.value)
    console.log('Odyssey Page - Class students:', selectedClass.value.students)
    
    // Load odyssey plans for each student in the class
    for (const student of selectedClass.value.students) {
      try {
        console.log('Odyssey Page - Loading plans for student:', student)
        const plans = await odysseyPlanService.getStudentPlans(student._id)
        if (plans && Array.isArray(plans)) {
          allPlans.push(...plans)
          console.log('Odyssey Page - Got plans for student:', student._id, plans)
        }
      } catch (error) {
        console.error(`Error loading plans for student ${student._id}:`, error)
      }
    }
    
    odysseyPlans.value = allPlans
    console.log('Odyssey Page - All plans loaded:', odysseyPlans.value)
  } catch (error) {
    console.error('Error loading odyssey plans:', error)
    notificationService.showError('Failed to load Odyssey Plans')
  } finally {
    loading.value = false
  }
}

const onClassChange = async () => {
  if (!selectedClassId.value) {
    selectedClass.value = null
    odysseyPlans.value = []
    return
  }
  
  try {
    loading.value = true
    const classData = await adviserService.loadClassById(selectedClassId.value)
    selectedClass.value = classData
    console.log('Odyssey Page - Loaded class data:', classData)
    console.log('Odyssey Page - Class students:', classData?.students)
    await loadOdysseyPlans()
  } catch (error) {
    console.error('Error loading class data:', error)
    notificationService.showError('Failed to load class data')
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  if (selectedClassId.value) {
    await onClassChange()
  } else {
    await loadClasses()
  }
}

const viewPlan = (student) => {
  selectedStudent.value = student
  firstSemesterPlan.value = getOdysseyPlanForSemester(student, 1)
  secondSemesterPlan.value = getOdysseyPlanForSemester(student, 2)
  showPlanModal.value = true
}

const closePlanModal = () => {
  showPlanModal.value = false
  selectedStudent.value = null
  firstSemesterPlan.value = null
  secondSemesterPlan.value = null
}

const sendReminder = async (student) => {
  try {
    const yearNum = extractYearNumber(getStudentYearLevel(student))
    
    // Check which semesters are missing
    const missing1st = !hasOdysseyPlanForSemester(student, 1)
    const missing2nd = !hasOdysseyPlanForSemester(student, 2)
    
    let semesterText = ''
    if (missing1st && missing2nd) {
      semesterText = 'both 1st and 2nd Semester'
    } else if (missing1st) {
      semesterText = '1st Semester'
    } else if (missing2nd) {
      semesterText = '2nd Semester'
    }
    
    const message = `Odyssey Plan Reminder: You need to complete your Odyssey Plan for Year ${yearNum}, ${semesterText}. This is a requirement for your academic progress. Please visit the Odyssey Plan page to submit your plan.`
    
    // Find student's user ID
    const studentRecord = selectedClass.value.students.find(s => s._id === student.id)
    if (studentRecord && studentRecord.user) {
      await api.post('/notifications/create', {
        userId: studentRecord.user._id,
        title: `Odyssey Plan Required - Year ${yearNum} ${semesterText}`,
        message: message,
        type: 'warning',
        link: '/student/odyssey-plan'
      })
      
      notificationService.showSuccess(`Reminder sent to ${student.name}`)
    } else {
      notificationService.showError('Could not find student user ID')
    }
  } catch (error) {
    console.error('Error sending reminder:', error)
    notificationService.showError('Failed to send reminder')
  }
}

// Lifecycle
onMounted(() => {
  loadClasses()
})
</script>

<style scoped>
.focus\:ring-purple-500:focus {
  --tw-ring-color: #8B5CF6;
}

.focus\:border-purple-500:focus {
  border-color: #8B5CF6;
}

.border-purple-500 {
  border-color: #8B5CF6;
}

.text-purple-600 {
  color: #9333EA;
}
</style> 