<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Outer Container -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="p-6">
      
      <!-- Filters -->
      <div class="mb-6 bg-gray-50 p-4 rounded-lg border">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Filter History</h3>
        <div :class="['grid grid-cols-1 gap-4', selectedYearLevel === '2nd' ? 'md:grid-cols-3' : 'md:grid-cols-4']">
          <!-- Year Level Filter -->
          <div>
            <label for="yearLevelFilter" class="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
            <select 
              id="yearLevelFilter" 
              v-model="selectedYearLevel" 
              @change="updateAvailableOptions"
              class="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">All Year Levels</option>
              <option v-for="year in availableYearLevels" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
      
          <!-- Section Filter -->
          <div>
            <label for="sectionFilter" class="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select 
              id="sectionFilter" 
              v-model="selectedSection" 
              @change="updateAvailableOptions"
              class="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">All Sections</option>
              <option v-for="section in availableSections" :key="section" :value="section">
                {{ section }}
              </option>
            </select>
          </div>
      
          <!-- Major Filter (hidden for 2nd year) -->
          <div v-if="selectedYearLevel !== '2nd'">
            <label for="majorFilter" class="block text-sm font-medium text-gray-700 mb-2">Major</label>
            <select 
              id="majorFilter" 
              v-model="selectedMajor" 
              @change="updateAvailableOptions"
              class="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">All Majors</option>
              <option v-for="major in availableMajors" :key="major" :value="major">
                {{ major || 'General' }}
              </option>
            </select>
          </div>

        
          <!-- School Year Filter -->
          <div>
            <label for="schoolYearFilter" class="block text-sm font-medium text-gray-700 mb-2">School Year</label>
          <select 
              id="schoolYearFilter" 
            v-model="selectedSchoolYear" 
              @change="applyFilters"
            class="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          >
              <option value="">All School Years</option>
              <option v-for="year in availableSchoolYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>
        </div>
        
      <!-- Loading State -->
      <div v-if="historyLoading" class="flex justify-center items-center py-12">
        <div class="flex items-center space-x-2">
          <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading session history...</span>
          </div>
        </div>
        
        <!-- Multiple classes view (when "All" filters are selected) -->
        <div v-else-if="isShowingAllClasses" class="space-y-8">
          <div v-for="classGroup in groupedAllClasses" :key="`${classGroup.yearLevel}-${classGroup.section}-${classGroup.major}`" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <!-- Class Header -->
            <div class="bg-green-800 px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-white">
                    {{ classGroup.yearLevel }} Year - {{ classGroup.section }}
                    <span v-if="classGroup.yearLevel !== '2nd'" class="text-sm font-normal text-green-100">
                      ({{ classGroup.major }})
                    </span>
                  </h3>
                  <p class="text-sm text-green-100 mt-1">
                    School Year: {{ classGroup.schoolYear }} | 
                    {{ classGroup.studentCount }} Students
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="setFiltersForClass(classGroup)"
                    class="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium rounded-md transition-colors"
                    title="View this class only"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Class History
                  </button>
                </div>
              </div>
            </div>

            <!-- Students and Sessions by Semester -->
            <div class="p-6">
              <div v-if="classGroup.students && classGroup.students.length > 0" class="space-y-8">
                <!-- 1st Semester -->
                <div v-if="getFirstSemesterStudents(classGroup.students).length > 0">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">1st Semester Session History</h4>
                  <div class="space-y-6">
                    <div v-for="student in getFirstSemesterStudents(classGroup.students)" :key="`1st-${student.student._id}`" class="border border-gray-200 rounded-lg">
                      <!-- Student Header -->
                      <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-3">
                            <div class="flex-shrink-0">
                              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span class="text-sm font-medium text-blue-600">
                                  {{ student.student.firstName?.charAt(0) }}{{ student.student.lastName?.charAt(0) }}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h4 class="text-sm font-medium text-gray-900">
                                {{ student.student.firstName }} {{ student.student.lastName }}
                              </h4>
                              <p class="text-xs text-gray-500">{{ student.student.studentId }}</p>
                            </div>
                          </div>
                          <div class="flex items-center space-x-3">
                            <div class="flex items-center space-x-2">
                              <span class="text-sm font-medium text-gray-700">{{ student.sessions.filter(s => s.completed).length }} completed</span>
                              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <button
                              @click="toggleStudentSessions(student.student._id)"
                              class="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <svg
                                :class="['w-6 h-6 transition-transform duration-200', expandedStudents[student.student._id] ? 'rotate-180' : '']"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Student Sessions -->
                      <div v-if="expandedStudents[student.student._id]" class="p-4">
                        <div class="space-y-3">
                          <div v-for="session in student.sessions" :key="session._id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-3">
                              <div class="flex-shrink-0">
                                <div :class="[
                                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                                  session.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                ]">
                                  {{ session.day }}
                                </div>
                              </div>
                              <div>
                                <p class="text-sm font-medium text-gray-900">{{ session.title }}</p>
                                <p class="text-xs text-gray-500">
                                  {{ formatDate(session.date) }} | 
                                  {{ session.completed ? 'Completed' : 'Pending' }}
                                </p>
                              </div>
                            </div>
                            <div class="flex items-center space-x-2">
                              <span v-if="session.attachments && session.attachments.length > 0" 
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {{ session.attachments.length }} attachment{{ session.attachments.length > 1 ? 's' : '' }}
                              </span>
                              <button
                                v-if="session.attachments && session.attachments.length > 0"
                                @click="openAttachmentModal(session)"
                                class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                View Attachment
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 2nd Semester -->
                <div v-if="getSecondSemesterStudents(classGroup.students).length > 0">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">2nd Semester Session History</h4>
                  <div class="space-y-6">
                    <div v-for="student in getSecondSemesterStudents(classGroup.students)" :key="`2nd-${student.student._id}`" class="border border-gray-200 rounded-lg">
                      <!-- Student Header -->
                      <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-3">
                            <div class="flex-shrink-0">
                              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span class="text-sm font-medium text-blue-600">
                                  {{ student.student.firstName?.charAt(0) }}{{ student.student.lastName?.charAt(0) }}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h4 class="text-sm font-medium text-gray-900">
                                {{ student.student.firstName }} {{ student.student.lastName }}
                              </h4>
                              <p class="text-xs text-gray-500">{{ student.student.studentId }}</p>
                            </div>
                          </div>
                          <div class="flex items-center space-x-3">
                            <div class="flex items-center space-x-2">
                              <span class="text-sm font-medium text-gray-700">{{ student.sessions.filter(s => s.completed).length }} completed</span>
                              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <button
                              @click="toggleStudentSessions(student.student._id)"
                              class="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <svg
                                :class="['w-6 h-6 transition-transform duration-200', expandedStudents[student.student._id] ? 'rotate-180' : '']"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Student Sessions -->
                      <div v-if="expandedStudents[student.student._id]" class="p-4">
                        <div class="space-y-3">
                          <div v-for="session in student.sessions" :key="session._id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-3">
                              <div class="flex-shrink-0">
                                <div :class="[
                                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                                  session.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                ]">
                                  {{ session.day }}
                                </div>
                              </div>
                              <div>
                                <p class="text-sm font-medium text-gray-900">{{ session.title }}</p>
                                <p class="text-xs text-gray-500">
                                  {{ formatDate(session.date) }} | 
                                  {{ session.completed ? 'Completed' : 'Pending' }}
                                </p>
                              </div>
                            </div>
                            <div class="flex items-center space-x-2">
                              <span v-if="session.attachments && session.attachments.length > 0" 
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {{ session.attachments.length }} attachment{{ session.attachments.length > 1 ? 's' : '' }}
                              </span>
                              <button
                                v-if="session.attachments && session.attachments.length > 0"
                                @click="openAttachmentModal(session)"
                                class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                View Attachment
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <p class="text-gray-500">No students found for this class.</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No history for selected class -->
        <div v-else-if="!sessionHistory || sessionHistory.length === 0" class="bg-gray-50 p-6 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        <p class="text-gray-500">No session history found. Please select class filters.</p>
        </div>
        
      <!-- Class Information Header -->
      <div v-else-if="currentClassInfo" class="mb-6">
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="bg-green-800 px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-white">{{ currentClassInfo.yearLevel }} Year - {{ currentClassInfo.section }}</h3>
            <p class="text-sm text-green-100">
              <span v-if="currentClassInfo.yearLevel !== '2nd'">{{ currentClassInfo.major }} | </span>{{ currentClassInfo.schoolYear }}
            </p>
              </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-white p-3 rounded-lg border">
                <p class="text-sm text-gray-500">Subject</p>
                <p class="font-medium">{{ getCurrentSemesterSubject() }}</p>
              </div>
              <div class="bg-white p-3 rounded-lg border">
                <p class="text-sm text-gray-500">Room</p>
                <p class="font-medium">{{ getCurrentSemesterRoom() }}</p>
              </div>
              <div class="bg-white p-3 rounded-lg border">
                <p class="text-sm text-gray-500">Schedule</p>
                <p class="font-medium">{{ getCurrentSemesterSchedule() }}</p>
              </div>
              <div class="bg-white p-3 rounded-lg border">
                <p class="text-sm text-gray-500">School Year</p>
                <p class="font-medium">{{ getCurrentSemesterSchoolYear() }}</p>
              </div>
            </div>
              </div>
            </div>
          </div>
          
          <!-- Semester Tabs -->
      <div v-if="currentClassInfo" class="mb-6">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  @click="selectedSemester = '1st'"
                  class="py-2 px-1 border-b-2 font-medium text-sm"
                  :class="selectedSemester === '1st' 
                ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                >
              1st Semester
                  <span class="ml-2 py-0.5 px-2 text-xs rounded-full"
                        :class="selectedSemester === '1st' 
                      ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-600'">
                    {{ getFirstSemesterStudentCount() }}
                  </span>
                </button>
                <button
                  @click="selectedSemester = '2nd'"
                  class="py-2 px-1 border-b-2 font-medium text-sm"
                  :class="selectedSemester === '2nd' 
                ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                >
              2nd Semester
                  <span class="ml-2 py-0.5 px-2 text-xs rounded-full"
                        :class="selectedSemester === '2nd' 
                      ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-600'">
                    {{ getSecondSemesterStudentCount() }}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          <!-- Current Semester Content -->
      <div v-if="currentClassInfo">
            <!-- 1st Semester -->
            <div v-if="selectedSemester === '1st'">
          <div v-if="firstSemesterStudents.length === 0" class="bg-gray-50 p-6 rounded-lg text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            <h3 class="text-lg font-medium text-gray-800 mb-2">No 1st Semester History Found</h3>
            <p class="text-gray-600">No archived 1st semester sessions found for this class.</p>
              </div>
              
              <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div class="flex justify-between items-center">
                  <div>
                  <h3 class="text-lg font-semibold text-gray-900">1st Semester Session History</h3>
                  <p class="text-sm text-gray-600">
                        {{ firstSemesterStudents.length }} Students | 
                        {{ calculateSemesterCompletionRate(firstSemesterStudents) }}% Overall Completion Rate
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="p-6">
              <div class="space-y-4">
                <div 
                          v-for="student in firstSemesterStudents" 
                          :key="student.student.id"
                  class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h5 class="font-medium text-gray-900">{{ student.student.name }}</h5>
                      <p class="text-sm text-gray-600">
                        {{ student.student.idNumber }} | 
                        {{ student.yearLevel }} - {{ student.section }}
                        <span v-if="student.major && student.major !== 'General'"> - {{ student.major }}</span>
                      </p>
                              </div>
                    <div class="flex items-center space-x-3">
                      <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium text-gray-700">{{ student.sessions.filter(s => s.completed).length }} completed</span>
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <button 
                        @click="toggleStudentSessions(student.student.id)"
                        class="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <svg 
                          :class="['w-6 h-6 transition-transform duration-200', expandedStudents[student.student.id] ? 'rotate-180' : '']" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                            </div>
                            </div>
                  
                  <!-- Sessions Dropdown -->
                  <div class="mt-3">
                    <div v-if="expandedStudents[student.student.id]" class="mt-3">
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Completed</th>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="session in student.sessions" :key="session.id" class="hover:bg-gray-50">
                          <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">Day {{ session.day || 0 }}</div>
                          </td>
                              <td class="px-6 py-4">
                                <div class="text-sm text-gray-900">{{ session.title || `Day ${session.day || 0}` }}</div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">{{ formatDate(session.completionDate) }}</div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span 
                                  class="px-2 py-1 text-xs rounded-full"
                                  :class="session.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                            >
                                  {{ session.completed ? 'Completed' : 'Pending' }}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                                <div v-if="session.hasAttachment" class="flex items-center">
                                  <button 
                                    @click="openAttachmentModal(session)"
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                                  >
                                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                    </svg>
                                    View Attachment
                            </button>
                                </div>
                                <div v-else class="text-xs text-gray-400">No attachment</div>
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
              </div>
            </div>

            <!-- 2nd Semester -->
            <div v-if="selectedSemester === '2nd'">
          <div v-if="secondSemesterStudents.length === 0" class="bg-gray-50 p-6 rounded-lg text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            <h3 class="text-lg font-medium text-gray-800 mb-2">No 2nd Semester History Found</h3>
            <p class="text-gray-600">No archived 2nd semester sessions found for this class.</p>
              </div>
              
              <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div class="flex justify-between items-center">
                    <div>
                  <h3 class="text-lg font-semibold text-gray-900">2nd Semester Session History</h3>
                  <p class="text-sm text-gray-600">
                        {{ secondSemesterStudents.length }} Students | 
                        {{ calculateSemesterCompletionRate(secondSemesterStudents) }}% Overall Completion Rate
                      </p>
                    </div>
                      </div>
                    </div>
                    
                <div class="p-6">
              <div class="space-y-4">
                <div 
                          v-for="student in secondSemesterStudents" 
                            :key="student.student.id"
                  class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h5 class="font-medium text-gray-900">{{ student.student.name }}</h5>
                      <p class="text-sm text-gray-600">
                        {{ student.student.idNumber }} | 
                        {{ student.yearLevel }} - {{ student.section }}
                        <span v-if="student.major && student.major !== 'General'"> - {{ student.major }}</span>
                      </p>
                              </div>
                    <div class="flex items-center space-x-3">
                      <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium text-gray-700">{{ student.sessions.filter(s => s.completed).length }} completed</span>
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <button 
                        @click="toggleStudentSessions(student.student.id)"
                        class="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <svg 
                          :class="['w-6 h-6 transition-transform duration-200', expandedStudents[student.student.id] ? 'rotate-180' : '']" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                            </div>
                              </div>
                  
                  <!-- Sessions Dropdown -->
                  <div class="mt-3">
                    <div v-if="expandedStudents[student.student.id]" class="mt-3">
                    <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Completed</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="session in student.sessions" :key="session.id" class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">Day {{ session.day || 0 }}</div>
                      </td>
                              <td class="px-6 py-4">
                                <div class="text-sm text-gray-900">{{ session.title || `Day ${session.day || 0}` }}</div>
                      </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">{{ formatDate(session.completionDate) }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span 
                                  class="px-2 py-1 text-xs rounded-full"
                                  :class="session.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                        >
                                  {{ session.completed ? 'Completed' : 'Pending' }}
                        </span>
                      </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div v-if="session.hasAttachment" class="flex items-center">
                                  <button 
                                    @click="openAttachmentModal(session)"
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                                  >
                                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                    </svg>
                                    View Attachment
                              </button>
                                </div>
                                <div v-else class="text-xs text-gray-400">No attachment</div>
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
        </div>
      </div>
      </div>
    </div>
    </div>
  </div>
  </div>

  <!-- Attachment Modal -->
  <div v-if="showAttachmentModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen px-4 py-4">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeAttachmentModal"></div>

      <!-- Modal panel -->
      <div class="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Session Attachments
              </h3>
              
              <!-- Session Info -->
              <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 class="font-medium text-gray-900">{{ selectedSession?.title || `Day ${selectedSession?.day || 0}` }}</h4>
                <p class="text-sm text-gray-600 mt-1">
                  Completed: {{ formatDate(selectedSession?.completionDate) }}
                </p>
              </div>

              <!-- Attachments Display -->
              <div v-if="selectedAttachment && selectedAttachment.length > 0" class="space-y-4">
                <div v-for="(attachment, index) in selectedAttachment" :key="index" class="border border-gray-200 rounded-lg p-4">
                  <!-- Attachment Header -->
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ attachment.filename || `Attachment ${index + 1}` }}</p>
                        <p class="text-xs text-gray-500">{{ attachment.size ? formatFileSize(attachment.size) : 'Unknown size' }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <button 
                        @click="downloadAttachment(attachment)"
                        class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                  
                  <!-- Direct Attachment Display -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <!-- Image files -->
                    <div v-if="isImageFile(attachment.filename || attachment.originalName)" class="text-center">
                      <img 
                        :src="getAttachmentUrl(attachment)" 
                        :alt="attachment.filename || attachment.originalName"
                        class="max-w-full h-auto mx-auto rounded-lg shadow-lg max-h-96"
                        @error="handleImageError"
                        @load="handleImageLoad"
                      />
                      <div v-if="imageLoadError" class="mt-2 text-sm text-red-600">
                        Failed to load image. URL: {{ getAttachmentUrl(attachment) }}
                      </div>
                    </div>
                    
                    <!-- PDF files -->
                    <div v-else-if="isPdfFile(attachment.filename)" class="w-full h-96">
                      <iframe 
                        :src="getAttachmentUrl(attachment)" 
                        class="w-full h-full border-0 rounded-lg"
                        title="PDF Viewer"
                      ></iframe>
                    </div>
                    
                    <!-- Text files -->
                    <div v-else-if="isTextFile(attachment.filename)" class="max-h-96 overflow-auto">
                      <pre class="text-sm text-gray-800 bg-white p-4 rounded border whitespace-pre-wrap">{{ attachment.content || 'Content not available' }}</pre>
                    </div>
                    
                    <!-- Other files -->
                    <div v-else class="text-center py-8">
                      <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 class="mt-2 text-sm font-medium text-gray-900">Preview not available</h3>
                      <p class="mt-1 text-sm text-gray-500">This file type cannot be previewed.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No attachments message -->
              <div v-else class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No attachments</h3>
                <p class="mt-1 text-sm text-gray-500">This session has no attachments to display.</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:justify-center sm:space-x-4">
          <button 
            @click="downloadAllAttachments"
            type="button" 
            class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download All
          </button>
          <button 
            @click="closeAttachmentModal"
            type="button" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Attachment Viewer Modal -->
  <div v-if="showAttachmentViewer" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="viewer-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen px-4 py-4">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeAttachmentViewer"></div>

      <!-- Viewer panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ currentAttachment?.filename || 'Attachment Viewer' }}
              </h3>
              
              <!-- Attachment Display -->
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <div v-if="currentAttachment" class="text-center">
                  <!-- Image files -->
                  <div v-if="isImageFile(currentAttachment.filename)" class="max-h-96 overflow-hidden">
                    <img 
                      :src="getAttachmentUrl(currentAttachment)" 
                      :alt="currentAttachment.filename"
                      class="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                      @error="handleImageError"
                    />
                  </div>
                  
                  <!-- PDF files -->
                  <div v-else-if="isPdfFile(currentAttachment.filename)" class="w-full h-96">
                    <iframe 
                      :src="getAttachmentUrl(currentAttachment)" 
                      class="w-full h-full border-0 rounded-lg"
                      title="PDF Viewer"
                    ></iframe>
                  </div>
                  
                  <!-- Text files -->
                  <div v-else-if="isTextFile(currentAttachment.filename)" class="max-h-96 overflow-auto">
                    <pre class="text-sm text-gray-800 bg-white p-4 rounded border whitespace-pre-wrap">{{ currentAttachment.content || 'Content not available' }}</pre>
                  </div>
                  
                  <!-- Other files -->
                  <div v-else class="text-center py-12">
                    <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">Preview not available</h3>
                    <p class="mt-1 text-sm text-gray-500">This file type cannot be previewed.</p>
                    <a 
                      :href="getAttachmentUrl(currentAttachment)" 
                      target="_blank"
                      class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download to view
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            @click="closeAttachmentViewer"
            type="button" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { classService } from '../../services/classService';
import { sessionService } from '../../services/sessionService';
import { notificationService } from '../../services/notificationService';
import { useAuthStore } from '../../stores/authStore';

// State
const loading = ref(true);
const historyLoading = ref(false);
const classes = ref([]);
const sessionHistory = ref([]);
const expandedSemesters = ref({});
const expandedYearLevels = ref({});
const expandedStudents = ref({});
const authStore = useAuthStore();
const selectedSemester = ref('1st');

// Attachment modal state
const showAttachmentModal = ref(false);
const selectedAttachment = ref(null);
const selectedSession = ref(null);
const showAttachmentViewer = ref(false);
const currentAttachment = ref(null);
const imageLoadError = ref(false);

// Filter state
const selectedYearLevel = ref('');
const selectedSection = ref('');
const selectedMajor = ref('');
const selectedSchoolYear = ref('');

// Available options from history data
const availableYearLevels = ref([]);
const availableSections = ref([]);
const availableMajors = ref([]);
const availableSchoolYears = ref([]);

// Watch for filter changes
watch([selectedYearLevel, selectedSection, selectedMajor, selectedSchoolYear], () => {
  updateAvailableOptions();
});

// Computed properties
const isShowingAllClasses = computed(() => {
  // Show multiple classes view when:
  // 1. Both year level and section are "All" (empty or '')
  // 2. OR when section is "All" (even if year level is selected)
  const isYearLevelAll = !selectedYearLevel.value || selectedYearLevel.value === '';
  const isSectionAll = !selectedSection.value || selectedSection.value === '';
  
  return (isYearLevelAll || isSectionAll) && 
         sessionHistory.value && sessionHistory.value.length > 0;
});

const groupedAllClasses = computed(() => {
  if (!sessionHistory.value || sessionHistory.value.length === 0) return [];
  
  // Filter by year level if selected
  let filteredHistory = sessionHistory.value;
  if (selectedYearLevel.value && selectedYearLevel.value !== '') {
    filteredHistory = sessionHistory.value.filter(h => 
      h.class && h.class.yearLevel === selectedYearLevel.value
    );
  }
  
  // Filter by school year if selected
  if (selectedSchoolYear.value && selectedSchoolYear.value !== '') {
    filteredHistory = filteredHistory.filter(h => 
      h.schoolYear === selectedSchoolYear.value
    );
  }
  
  // Group by class (yearLevel + section + major)
  const classMap = new Map();
  
  filteredHistory.forEach(historyRecord => {
    const yearLevel = historyRecord.class?.yearLevel || 'Unknown';
    const section = historyRecord.class?.section || 'Unknown';
    const major = historyRecord.class?.major || 'General';
    const schoolYear = historyRecord.schoolYear || 'Unknown';
    
    const classKey = `${yearLevel}-${section}-${major}`;
    
    if (!classMap.has(classKey)) {
      classMap.set(classKey, {
        yearLevel,
        section,
        major,
        schoolYear,
        students: new Map(), // Use Map to store student data with sessions
        totalSessions: 0,
        completedSessions: 0
      });
    }
    
    const classData = classMap.get(classKey);
    const studentId = historyRecord.student?._id;
    
    if (!classData.students.has(studentId)) {
      classData.students.set(studentId, {
        student: historyRecord.student,
        sessions: []
      });
    }
    
    // Add session to student
    const studentData = classData.students.get(studentId);
    studentData.sessions.push({
      _id: historyRecord._id,
      day: historyRecord.session?.day || 0,
      title: historyRecord.session?.title || 'Session',
      date: historyRecord.date,
      completed: historyRecord.completed,
      attachments: historyRecord.attachments || []
    });
    
    classData.totalSessions++;
    if (historyRecord.completed) {
      classData.completedSessions++;
    }
  });
  
  // Convert to array and calculate final counts
  return Array.from(classMap.values()).map(classData => ({
    ...classData,
    studentCount: classData.students.size,
    students: Array.from(classData.students.values()) // Convert Map to Array
  }));
});

const currentClassInfo = computed(() => {
  if (!selectedYearLevel.value || !selectedSection.value) return null;
  
  // For 2nd year, always show "General" as major
  // For 3rd and 4th year, show the selected major or get from class data
  let major = 'General';
  if (selectedYearLevel.value !== '2nd') {
    if (selectedMajor.value && selectedMajor.value !== '') {
      major = selectedMajor.value;
    } else {
      // If no major selected, try to get from class data
      const classData = classes.value.find(c => 
        c.yearLevel === selectedYearLevel.value && 
        c.section === selectedSection.value
      );
      if (classData && classData.major) {
        major = classData.major;
      }
    }
  }
  
  return {
    yearLevel: selectedYearLevel.value,
    section: selectedSection.value,
    major: major,
    schoolYear: selectedSchoolYear.value || 'All Years'
  };
});

// Grouped session history computed property
const groupedSessionHistory = computed(() => {
  if (!sessionHistory.value || sessionHistory.value.length === 0) return [];
  
  
  // Group session history records by year level and semester
  const yearLevelMap = new Map();
  
  sessionHistory.value.forEach((historyRecord, index) => {
    
    const yearLevel = historyRecord.class?.yearLevel || 'Unknown';
    const semester = historyRecord.semester || '1st Semester';
    
      if (!yearLevelMap.has(yearLevel)) {
        yearLevelMap.set(yearLevel, {
          yearLevel,
          semesters: []
        });
      }
      
      const yearGroup = yearLevelMap.get(yearLevel);
      
    // Find or create semester group
    let semesterGroup = yearGroup.semesters.find(s => s.semester === semester);
    if (!semesterGroup) {
      semesterGroup = {
              semester,
              students: []
      };
      yearGroup.semesters.push(semesterGroup);
    }
    
    // Find or create student in this semester
    let student = semesterGroup.students.find(s => s.student.id === historyRecord.student?._id);
    if (!student) {
      // Check if student data exists and is properly populated
      const studentData = historyRecord.student;
      
      let studentName = 'Unknown Student';
      let studentIdNumber = 'N/A';
      let studentId = 'unknown';
      
      if (studentData && typeof studentData === 'object') {
        // Student data exists, extract information
        studentName = getStudentName(studentData);
        studentIdNumber = getStudentId(studentData);
        studentId = studentData._id || 'unknown';
      }
      
      student = {
        student: {
          id: studentId,
          name: studentName,
          idNumber: studentIdNumber,
          schoolYear: historyRecord.schoolYear
        },
        sessions: [],
        yearLevel: yearLevel,
        section: historyRecord.class?.section || 'Unknown',
        major: historyRecord.class?.major || 'General'
      };
      semesterGroup.students.push(student);
    }
    
    // Add session to student
    student.sessions.push({
      id: historyRecord._id,
      day: historyRecord.sessionDay,
      title: historyRecord.sessionTitle,
      completed: historyRecord.completed,
      completionDate: historyRecord.completionDate,
      semester: historyRecord.semester,
      schoolYear: historyRecord.schoolYear,
      attachments: historyRecord.attachments || [],
      hasAttachment: historyRecord.hasAttachment || false
    });
  });
  
  // Convert Map to Array and sort
  const result = Array.from(yearLevelMap.values()).sort((a, b) => {
    const yearOrder = { '2nd': 1, '3rd': 2, '4th': 3 };
    return (yearOrder[a.yearLevel] || 999) - (yearOrder[b.yearLevel] || 999);
  });
  
  console.log('Grouped session history result:', result);
  return result;
});




// Filter methods
const updateAvailableOptions = () => {
  // Clear major selection when 2nd year is selected (2nd year has no major)
  if (selectedYearLevel.value === '2nd') {
    selectedMajor.value = '';
  }
  
  // Don't auto-select major when "All" is selected - let user choose
  // Only auto-select when specific class is chosen (not "All")
  if (selectedYearLevel.value && selectedSection.value && 
      selectedYearLevel.value !== '' && selectedSection.value !== '') {
    const classData = classes.value.find(c => 
      c.yearLevel === selectedYearLevel.value && 
      c.section === selectedSection.value
    );
    
    if (classData && classData.major && selectedYearLevel.value !== '2nd') {
      // Only auto-select if no major is currently selected
      if (!selectedMajor.value || selectedMajor.value === '') {
        selectedMajor.value = classData.major;
      }
    }
  }
  
  console.log('Filter options updated:', {
    yearLevel: selectedYearLevel.value,
    section: selectedSection.value,
    major: selectedMajor.value,
    schoolYear: selectedSchoolYear.value
  });
  
  // If any filter is changed, trigger history reload
  loadHistory();
};

const applyFilters = () => {
  // Filter logic will be handled in loadHistory
  loadHistory();
};

// Function to set filters based on clicked class
const setFiltersForClass = (classGroup) => {
  selectedYearLevel.value = classGroup.yearLevel;
  selectedSection.value = classGroup.section;
  selectedMajor.value = classGroup.yearLevel === '2nd' ? '' : classGroup.major;
  selectedSchoolYear.value = classGroup.schoolYear;
  
  console.log('Filters set for class:', {
    yearLevel: selectedYearLevel.value,
    section: selectedSection.value,
    major: selectedMajor.value,
    schoolYear: selectedSchoolYear.value
  });
  
  // Trigger history reload with new filters
  loadHistory();
};

// Lifecycle hooks
onMounted(async () => {
  await loadClasses();
  await loadFilterOptions();
  // Auto-load history when component mounts (including when all filters are "All")
  await loadHistory();
});

// Methods
async function loadClasses() {
  try {
    loading.value = true;
    const response = await classService.getAdvisoryClasses();
    
    if (response && response.data) {
      classes.value = response.data;
      console.log(`Loaded ${classes.value.length} advisory classes`);
      
      // Process class data for better display
      classes.value.forEach(classItem => {
        // If the class data is nested in 'class' property, extract it
        if (classItem.class && typeof classItem.class === 'object') {
          // Extract class details from nested structure
          const classData = classItem.class;
          classItem._id = classData._id || classItem._id;
          classItem.yearLevel = classData.yearLevel || classItem.yearLevel;
          classItem.section = classData.section || classItem.section;
          classItem.major = classData.major || classItem.major;
          classItem.program = classData.program || classItem.program;
          classItem.room = classData.room || classItem.room;
          classItem.daySchedule = classData.daySchedule || classItem.daySchedule;
          classItem.timeSchedule = classData.timeSchedule || classItem.timeSchedule;
          classItem.sspSubject = classData.sspSubject || classItem.sspSubject;
          classItem.firstSemester = classData.firstSemester || classItem.firstSemester;
          classItem.secondSemester = classData.secondSemester || classItem.secondSemester;
        }
        
        // Log class data for debugging
        console.log('Processed class:', {
          id: classItem._id,
          yearLevel: classItem.yearLevel,
          section: classItem.section,
          major: classItem.major,
          program: classItem.program,
          room: classItem.room,
          firstSemester: classItem.firstSemester,
          secondSemester: classItem.secondSemester
        });
      });
    } else {
      classes.value = [];
    }
  } catch (error) {
    console.error('Failed to load advisory classes:', error);
    notificationService.showError('Failed to load advisory classes');
    classes.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadFilterOptions() {
  try {
    console.log('Loading filter options from history data');
    
    // Get history data first to extract available options
    const response = await sessionService.getAdviserHistory();
    
    if (response && response.data && response.data.length > 0) {
      console.log('History data for filter options:', response.data);
      
      // Extract unique values from history data
      const yearLevels = [...new Set(response.data.map(h => h.class?.yearLevel).filter(Boolean))].sort();
      const sections = [...new Set(response.data.map(h => h.class?.section).filter(Boolean))].sort();
      const majors = [...new Set(response.data.map(h => h.class?.major).filter(Boolean))].sort();
      const schoolYears = [...new Set(response.data.map(h => h.schoolYear).filter(Boolean))].sort();
      
      // Set filter options from history data
      availableYearLevels.value = yearLevels;
      availableSections.value = sections;
      availableMajors.value = majors;
      availableSchoolYears.value = schoolYears;
      
      console.log('Available filter options from history:', {
        yearLevels: availableYearLevels.value,
        sections: availableSections.value,
        majors: availableMajors.value,
        schoolYears: availableSchoolYears.value
      });
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
}

async function loadHistory() {
  historyLoading.value = true;
  
  try {
    console.log('Loading history with filters:', {
      yearLevel: selectedYearLevel.value,
      section: selectedSection.value,
      major: selectedMajor.value,
      schoolYear: selectedSchoolYear.value
    });
    
    // Clear history first
    sessionHistory.value = [];
    
    // Get all session history (no backend filtering)
    const response = await sessionService.getAdviserHistory();
    
    if (response && response.data) {
      
      // Update available school years
      if (response.data.schoolYears && Array.isArray(response.data.schoolYears)) {
        availableSchoolYears.value = response.data.schoolYears;
        
        // Auto-select the most recent school year if no school year is selected
        if (!selectedSchoolYear.value && availableSchoolYears.value.length > 0) {
          // Sort school years to get the most recent
          const sortedYears = [...availableSchoolYears.value].sort((a, b) => {
            // Extract the start year from formats like "2025-2026" or "2025 - 2026"
            const yearA = parseInt(a.match(/(\d{4})/)[1]);
            const yearB = parseInt(b.match(/(\d{4})/)[1]);
            return yearB - yearA; // Descending order (most recent first)
          });
          selectedSchoolYear.value = sortedYears[0];
        }
      }
      
      // Store all history data
      const allHistory = response.data;
      
      // Check if we have minimum required filters - allow "All" selections
      if (!selectedYearLevel.value || !selectedSection.value || 
          selectedYearLevel.value === '' || selectedSection.value === '') {
        console.log('No year level or section selected, showing all data');
        
        // Apply school year filter even when other filters are "All"
        let filteredHistory = allHistory;
        if (selectedSchoolYear.value && selectedSchoolYear.value !== '') {
          filteredHistory = allHistory.filter(h => h.schoolYear === selectedSchoolYear.value);
        }
        
        sessionHistory.value = filteredHistory;
        return;
      }
      
      // Apply client-side filtering
      let filteredHistory = allHistory;
      
      // Filter by year level (only if not "All")
      if (selectedYearLevel.value && selectedYearLevel.value !== '') {
        filteredHistory = filteredHistory.filter(h => h.class && h.class.yearLevel === selectedYearLevel.value);
      }
      
      // Filter by section (only if not "All")
      if (selectedSection.value && selectedSection.value !== '') {
        filteredHistory = filteredHistory.filter(h => h.class && h.class.section === selectedSection.value);
      }
      
      // Filter by major (only if not "All" and not 2nd year)
      if (selectedMajor.value && selectedMajor.value !== '' && selectedYearLevel.value !== '2nd') {
        filteredHistory = filteredHistory.filter(h => h.class && h.class.major === selectedMajor.value);
      } else if (selectedYearLevel.value === '2nd') {
        // For 2nd year, filter out records that have a major (2nd year should have no major)
        filteredHistory = filteredHistory.filter(h => h.class && (!h.class.major || h.class.major === '' || h.class.major === 'General'));
      }
      // If major is "All" and not 2nd year, don't filter by major (show all majors)
      
      // Filter by school year (only if not "All")
      if (selectedSchoolYear.value && selectedSchoolYear.value !== '') {
        filteredHistory = filteredHistory.filter(h => h.schoolYear === selectedSchoolYear.value);
      }
      
      
      sessionHistory.value = filteredHistory;
      
      // If no matches found, show empty state
      if (filteredHistory.length === 0) {
      }
    } else {
      sessionHistory.value = [];
      availableSchoolYears.value = [];
    }
  } catch (error) {
    console.error('Failed to load session history:', error);
    notificationService.showError('Failed to load session history');
    sessionHistory.value = [];
    availableSchoolYears.value = [];
  } finally {
    historyLoading.value = false;
  }
}

// Toggle functions for dropdowns
function toggleYearLevel(yearIndex) {
  expandedYearLevels.value[yearIndex] = !expandedYearLevels.value[yearIndex];
}

function toggleStudentSessions(studentId) {
  expandedStudents.value[studentId] = !expandedStudents.value[studentId];
}

// Attachment modal methods
function openAttachmentModal(session) {
  selectedSession.value = session;
  // Structure attachments with sessionId and index for proper URL construction
  const attachments = session.attachments || [];
  selectedAttachment.value = attachments.map((attachment, index) => ({
    ...attachment,
    sessionId: session._id || session.id, // Use _id from SessionHistory
    index: index,
    filename: attachment.originalName || attachment.fileName,
    originalName: attachment.originalName || attachment.fileName
  }));
  showAttachmentModal.value = true;
}

function closeAttachmentModal() {
  showAttachmentModal.value = false;
  selectedAttachment.value = null;
  selectedSession.value = null;
}

function viewAttachment(attachment) {
  currentAttachment.value = attachment;
  showAttachmentViewer.value = true;
}

function closeAttachmentViewer() {
  showAttachmentViewer.value = false;
  currentAttachment.value = null;
}

// Download functions
function downloadAttachment(attachment) {
  const url = getAttachmentUrl(attachment);
  const link = document.createElement('a');
  link.href = url;
  link.download = attachment.filename || `attachment_${attachment.index + 1}`;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadAllAttachments() {
  if (selectedAttachment.value && selectedAttachment.value.length > 0) {
    selectedAttachment.value.forEach((attachment, index) => {
      // Add a small delay between downloads to prevent browser blocking
      setTimeout(() => {
        downloadAttachment(attachment);
      }, index * 500);
    });
  }
}

// Helper function to get student name safely
function getStudentName(studentData) {
  if (!studentData || typeof studentData !== 'object') {
    return 'Unknown Student';
  }
  
  let firstName = '';
  let lastName = '';
  
  // Check if student is approved and has user data
  if (studentData.approvalStatus === 'approved' && studentData.user) {
    firstName = studentData.user.firstName || '';
    lastName = studentData.user.lastName || '';
  }
  // Check if student is pending and has pending registration data
  else if (studentData.approvalStatus === 'pending' && studentData.pendingRegistration) {
    firstName = studentData.pendingRegistration.firstName || '';
    lastName = studentData.pendingRegistration.lastName || '';
  }
  // Fallback to direct properties (legacy)
  else {
    firstName = studentData.firstName || '';
    lastName = studentData.lastName || '';
  }
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  }
  
  return 'Unknown Student';
}

// Helper function to get student ID safely
function getStudentId(studentData) {
  if (!studentData || typeof studentData !== 'object') {
    return 'N/A';
  }
  
  let studentId = '';
  
  // Check if student is approved and has user data
  if (studentData.approvalStatus === 'approved' && studentData.user) {
    studentId = studentData.user.idNumber || studentData.studentId || '';
  }
  // Check if student is pending and has pending registration data
  else if (studentData.approvalStatus === 'pending' && studentData.pendingRegistration) {
    studentId = studentData.pendingRegistration.idNumber || studentData.studentId || '';
  }
  // Fallback to direct studentId property
  else {
    studentId = studentData.studentId || '';
  }
  
  return studentId || 'N/A';
}

// Semester-specific computed properties
const firstSemesterStudents = computed(() => {
  if (!groupedSessionHistory.value || groupedSessionHistory.value.length === 0) return [];
  
  const result = [];
  groupedSessionHistory.value.forEach(yearGroup => {
    yearGroup.semesters.forEach(semester => {
      if (semester.semester === '1st Semester') {
        result.push(...semester.students);
      }
    });
  });
  return result;
});

const secondSemesterStudents = computed(() => {
  if (!groupedSessionHistory.value || groupedSessionHistory.value.length === 0) return [];
  
  const result = [];
  groupedSessionHistory.value.forEach(yearGroup => {
    yearGroup.semesters.forEach(semester => {
      if (semester.semester === '2nd Semester') {
        result.push(...semester.students);
      }
    });
  });
  return result;
});

// Helper functions for class information
function getCurrentSemesterSubject() {
  if (!currentClassInfo.value) return 'Not specified';
  
  // Find the class data
  const classData = classes.value.find(c => 
    c.yearLevel === currentClassInfo.value.yearLevel && 
    c.section === currentClassInfo.value.section
  );
  
  if (!classData) return 'Not specified';
  
  // Get semester-specific subject
  let subject = null;
  if (selectedSemester.value === '1st' && classData.firstSemester?.sspSubject) {
    subject = classData.firstSemester.sspSubject;
  } else if (selectedSemester.value === '2nd' && classData.secondSemester?.sspSubject) {
    subject = classData.secondSemester.sspSubject;
  } else if (classData.sspSubject) {
    subject = classData.sspSubject;
  }
  
  // Extract subject name or code
  if (subject) {
    if (typeof subject === 'string') {
      return subject;
    } else if (typeof subject === 'object') {
      return subject.name || subject.sspCode || 'Not specified';
    }
  }
  
  return 'Not specified';
}

function getCurrentSemesterRoom() {
  if (!currentClassInfo.value) return 'Not specified';
  
  // Find the class data
  const classData = classes.value.find(c => 
    c.yearLevel === currentClassInfo.value.yearLevel && 
    c.section === currentClassInfo.value.section
  );
  
  if (!classData) return 'Not specified';
  
  // Get semester-specific room
  if (selectedSemester.value === '1st' && classData.firstSemester?.room) {
    return classData.firstSemester.room;
  } else if (selectedSemester.value === '2nd' && classData.secondSemester?.room) {
    return classData.secondSemester.room;
  }
  
  // Fallback to general room
  if (classData.room) {
    return classData.room;
  }
  
  return 'Not specified';
}

function getCurrentSemesterSchedule() {
  if (!currentClassInfo.value) return 'Not specified';
  
  // Find the class data
  const classData = classes.value.find(c => 
    c.yearLevel === currentClassInfo.value.yearLevel && 
    c.section === currentClassInfo.value.section
  );
  
  if (!classData) return 'Not specified';
  
  // Get semester-specific schedule
  if (selectedSemester.value === '1st' && classData.firstSemester?.daySchedule && classData.firstSemester?.timeSchedule) {
    return `${classData.firstSemester.daySchedule} ${classData.firstSemester.timeSchedule}`;
  } else if (selectedSemester.value === '2nd' && classData.secondSemester?.daySchedule && classData.secondSemester?.timeSchedule) {
    return `${classData.secondSemester.daySchedule} ${classData.secondSemester.timeSchedule}`;
  }
  
  // Fallback to general schedule
  if (classData.daySchedule && classData.timeSchedule) {
    return `${classData.daySchedule} ${classData.timeSchedule}`;
  }
  
  return 'Not specified';
}

function getCurrentSemesterSchoolYear() {
  // Get school year from the current semester's history data
  if (selectedSemester.value === '1st' && firstSemesterStudents.value.length > 0) {
    return firstSemesterStudents.value[0].student.schoolYear || 'Not specified';
  } else if (selectedSemester.value === '2nd' && secondSemesterStudents.value.length > 0) {
    return secondSemesterStudents.value[0].student.schoolYear || 'Not specified';
  }
  return selectedSchoolYear.value || 'Not specified';
}

function getFirstSemesterStudentCount() {
  return firstSemesterStudents.value.length;
}

function getSecondSemesterStudentCount() {
  return secondSemesterStudents.value.length;
}

function calculateSemesterCompletionRate(students) {
  if (!students || students.length === 0) return 0;
  
  let totalSessions = 0;
  let completedSessions = 0;
  
  students.forEach(student => {
    totalSessions += student.sessions.length;
    completedSessions += student.sessions.filter(s => s.completed).length;
  });
  
  return totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
}

function calculateSemesterCompletedSessions(students) {
  if (!students || students.length === 0) return 0;
  
  let completedSessions = 0;
  students.forEach(student => {
    completedSessions += student.sessions.filter(s => s.completed).length;
  });
  
  return completedSessions;
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return '-';
  }
}

// Helper functions for semester filtering
function getFirstSemesterStudents(students) {
  return students.filter(student => {
    // Check if student has sessions in 1st semester
    return student.sessions.some(session => {
      const sessionDate = new Date(session.date);
      const month = sessionDate.getMonth();
      // 1st semester: August to December (months 7-11)
      return month >= 7 && month <= 11;
    });
  });
}

function getSecondSemesterStudents(students) {
  return students.filter(student => {
    // Check if student has sessions in 2nd semester
    return student.sessions.some(session => {
      const sessionDate = new Date(session.date);
      const month = sessionDate.getMonth();
      // 2nd semester: January to May (months 0-4)
      return month >= 0 && month <= 4;
    });
  });
}

// Helper function to format file sizes
function formatFileSize(bytes) {
  if (!bytes) return 'Unknown size';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}

// Helper function to get attachment URL - handles both M&M submissions and session attachments
function getAttachmentUrl(attachment) {
  if (!attachment) return '';
  
  console.log('🔍 Getting attachment URL for:', attachment);
  console.log('🔍 Available fields:', Object.keys(attachment));
  
  // If it's already a full URL, return it
  if (attachment.url && (attachment.url.startsWith('http://') || attachment.url.startsWith('https://'))) {
    console.log('✅ Using full URL:', attachment.url);
    return attachment.url;
  }
  
  // Check if it has Base64 data (SessionHistory attachments)
  if (attachment.data && attachment.data.startsWith('data:')) {
    console.log('✅ Using Base64 data URL:', attachment.data.substring(0, 50) + '...');
    return attachment.data;
  }
  
  // Check if it has Base64 data without data: prefix
  if (attachment.data && !attachment.data.startsWith('data:') && !attachment.data.startsWith('http')) {
    const mimeType = attachment.mimeType || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${attachment.data}`;
    console.log('✅ Using Base64 data (constructed):', dataUrl.substring(0, 50) + '...');
    return dataUrl;
  }
  
  // Check if it's an M&M submission (physical file) - check multiple possible fields
  const possibleImageUrls = [
    attachment.imageUrl,
    attachment.url,
    attachment.path,
    attachment.fileName,
    attachment.originalName
  ].filter(Boolean);
  
  console.log('🔍 Possible image URLs:', possibleImageUrls);
  
  for (const imageUrl of possibleImageUrls) {
    if (imageUrl && (imageUrl.startsWith('/uploads/') || imageUrl.includes('mm-submissions'))) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
      console.log('✅ Using M&M image URL:', url);
      return url;
    }
  }
  
  // Check if it's a session attachment (Base64 API)
  if (attachment.sessionId) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const url = `${baseUrl}/api/sessions/${attachment.sessionId}/attachment?index=${attachment.index || 0}`;
    console.log('✅ Using session attachment URL:', url);
    return url;
  }
  
  // Try to construct URL from filename if it looks like a file
  if (attachment.filename || attachment.originalName) {
    const filename = attachment.filename || attachment.originalName;
    if (filename && (filename.includes('.png') || filename.includes('.jpg') || filename.includes('.jpeg'))) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = `${baseUrl}/uploads/mm-submissions/${filename}`;
      console.log('🔧 Trying constructed M&M URL:', url);
      return url;
    }
  }
  
  // Last resort: try common M&M file patterns
  if (attachment.sessionId) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Try M&M static file first (common pattern)
    const mmUrl = `${baseUrl}/uploads/mm-submissions/mm-${attachment.sessionId}.png`;
    console.log('🔧 Trying M&M static file pattern:', mmUrl);
    return mmUrl;
  }
  
  // Fallback to url property
  console.log('❌ Using fallback URL:', attachment.url);
  return attachment.url || '';
}

// File type detection functions
function isImageFile(filename) {
  if (!filename) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

function isPdfFile(filename) {
  if (!filename) return false;
  return filename.toLowerCase().endsWith('.pdf');
}

function isTextFile(filename) {
  if (!filename) return false;
  const textExtensions = ['.txt', '.md', '.json', '.xml', '.csv', '.log'];
  return textExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

function handleImageError(event) {
  console.error('Failed to load image:', event);
  imageLoadError.value = true;
}

function handleImageLoad() {
  console.log('Image loaded successfully');
  imageLoadError.value = false;
}

</script>

<style scoped>
.bg-primary {
  background-color: #3B82F6;
}
.text-primary {
  color: #3B82F6;
}
.hover\:bg-primary-dark:hover {
  background-color: #2563EB;
}
.text-xxs {
  font-size: 0.7rem;
  line-height: 1rem;
}

/* Improve font clarity for small text */
.text-xs {
  font-size: 0.8rem;
  line-height: 1.1rem;
  font-weight: 500;
}

.text-sm {
  font-size: 0.9rem;
  line-height: 1.2rem;
  font-weight: 500;
}

/* Make table headers more readable */
th {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}

/* Improve button text clarity */
button {
  font-weight: 500;
}
</style> 