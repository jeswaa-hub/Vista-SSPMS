<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">SSP Subjects</h1>
            <p class="text-gray-500 mt-1 font-normal">Manage Student Success Program subjects and sessions</p>
          </div>
          <button 
            @click="openAddModal" 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Subject
            </span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
            <select
              v-model="filters.yearLevel"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              @change="fetchSubjects"
            >
              <option value="">All Year Levels</option>
              <option v-for="option in yearLevelOptions" :key="option" :value="option">{{ option }} Year</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search by SSP code"
                class="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                @input="handleSearchInput"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Subjects Table -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SSP Code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year Level</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School Year</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span class="ml-3 text-gray-500">Loading subjects...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="subjects.length === 0">
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <h3 class="text-base font-normal text-gray-800 mb-1">
                    {{ (filters.search || filters.yearLevel) ? 'No subjects found' : 'No subjects yet' }}
                  </h3>
                  <p class="text-gray-500 font-normal">
                    {{ (filters.search || filters.yearLevel) ? 'Try adjusting your search criteria' : 'Add your first SSP subject to get started' }}
                  </p>
                </td>
              </tr>
              <tr v-for="(subject, index) in subjects" :key="subject._id || index" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span class="text-sm font-normal text-blue-600">
                        {{ subject.sspCode?.charAt(0) || 'S' }}
                      </span>
                    </div>
                    <div>
                      <div class="text-sm font-normal text-gray-800">{{ subject.sspCode || 'No Code' }}</div>
                      <div class="text-xs text-gray-500">Subject Code</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-800">
                  {{ subject.yearLevel }} Year
                </td>
                <td class="px-6 py-4 text-sm text-gray-800">
                  {{ subject.schoolYear || '2024 - 2025' }}
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-normal rounded-md"
                    :class="subject.semester === '1st Semester' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
                  >
                    {{ subject.semester }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-800">
                  {{ subject.hours || '1' }} {{ subject.hours === 1 ? 'Hour' : 'Hours' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-800">
                  {{ subject.sessions ? subject.sessions.length : 0 }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button 
                      @click="viewSessions(subject)" 
                      class="px-3 py-1.5 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                    >
                      View Sessions
                    </button>
                    <button 
                      @click="editSubject(subject)" 
                      class="px-3 py-1.5 text-xs font-normal text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Subject Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeAddModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Add New SSP Subject</h3>
          <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <!-- Basic Information -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-4">Subject Information</h4>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Year Level *</label>
                  <select
                    v-model="newSubject.yearLevel"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.yearLevel }"
                  >
                    <option value="">Select Year Level</option>
                    <option v-for="option in yearLevelOptions" :key="option" :value="option">{{ option }} Year</option>
                  </select>
                  <p v-if="errors.yearLevel" class="mt-1 text-sm text-red-600">{{ errors.yearLevel }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                  <select
                    v-model="newSubject.semester"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.semester }"
                  >
                    <option value="">Select Semester</option>
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                  </select>
                  <p v-if="errors.semester" class="mt-1 text-sm text-red-600">{{ errors.semester }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">SSP Code *</label>
                  <input
                    v-model="newSubject.sspCode"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.sspCode }"
                  />
                  <p v-if="errors.sspCode" class="mt-1 text-sm text-red-600">{{ errors.sspCode }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Hours *</label>
                  <select
                    v-model="newSubject.hours"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.hours }"
                  >
                    <option value="">Select Hours</option>
                    <option v-for="hour in hoursOptions" :key="hour" :value="hour.toString()">{{ hour }} {{ hour === 1 ? 'Hour' : 'Hours' }}</option>
                  </select>
                  <p v-if="errors.hours" class="mt-1 text-sm text-red-600">{{ errors.hours }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">School Year</label>
                  <input
                    v-model="newSubject.schoolYear"
                    type="text"
                    placeholder="e.g., 2025 - 2026"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm"
                    readonly
                  />
                  <p class="text-xs text-gray-500 mt-1">Fixed school year</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sessions Count -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-800">Total Sessions</h4>
              <span class="text-sm text-blue-700">{{ sessionTitles.filter(t => t).length || 0 }} / {{ sessionTitles.length }} sessions</span>
            </div>
          </div>

          <!-- Sessions Table -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-4">{{ newSubject.semester }} Sessions</h4>
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div class="max-h-96 overflow-y-auto">
                <table class="min-w-full">
                  <thead class="bg-gray-50 sticky top-0">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Day</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Title</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="(title, index) in sessionTitles" :key="index" :class="{ 'bg-amber-50': isExamSession(index) }">
                      <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ index }}</td>
                      <td class="px-4 py-3">
                        <input 
                          type="text" 
                          v-model="sessionTitles[index]" 
                          class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          :class="{ 'bg-amber-50 border-amber-300': isExamSession(index) }"
                        />
                        <span v-if="isExamSession(index)" class="text-xs text-amber-600 mt-1 block">Periodical Exam Session</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
          <button
            @click="closeAddModal"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="addSubject"
            class="px-4 py-2 text-sm font-normal text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add Subject
          </button>
        </div>
      </div>
    </div>
    
    <!-- View Sessions Modal -->
    <div v-if="showSessionsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="showSessionsModal = false">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-normal text-gray-800">Subject: {{ selectedSubject?.sspCode }}</h3>
            <div class="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
              <div>Year Level: <span class="font-medium text-gray-800">{{ selectedSubject?.yearLevel }} Year</span></div>
              <div>School Year: <span class="font-medium text-gray-800">{{ selectedSubject?.schoolYear || '2024 - 2025' }}</span></div>
              <div>Semester: <span class="font-medium text-gray-800">{{ selectedSubject?.semester }}</span></div>
              <div>Hours: <span class="font-medium text-gray-800">{{ selectedSubject?.hours }} {{ selectedSubject?.hours === 1 ? 'Hour' : 'Hours' }}</span></div>
            </div>
          </div>
          <button @click="showSessionsModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <!-- Sessions Count -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-800">Total Sessions</h4>
              <span class="text-sm text-blue-700">{{ sortedSessions.length || 0 }} sessions</span>
            </div>
          </div>

          <!-- Sessions Table -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="max-h-96 overflow-y-auto">
              <table class="min-w-full">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Day</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ selectedSubject?.semester }} Title</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="session in sortedSessions" :key="session.day" :class="{ 'bg-amber-50': isSessionAnExam(session) }">
                    <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ session.day }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800">
                      {{ session.title }}
                      <span v-if="isSessionAnExam(session)" class="ml-2 inline-flex px-2 py-1 text-xs font-normal rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                        Periodical Exam
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            @click="showSessionsModal = false"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Edit Subject Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="showEditModal = false">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Edit Subject</h3>
          <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <!-- Basic Information -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-4">Subject Information</h4>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">SSP Code *</label>
                  <input
                    v-model="editedSubject.sspCode"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.sspCode }"
                  />
                  <p v-if="errors.sspCode" class="mt-1 text-sm text-red-600">{{ errors.sspCode }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Year Level *</label>
                  <select
                    v-model="editedSubject.yearLevel"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.yearLevel }"
                  >
                    <option value="">Select Year Level</option>
                    <option v-for="option in yearLevelOptions" :key="option" :value="option">{{ option }} Year</option>
                  </select>
                  <p v-if="errors.yearLevel" class="mt-1 text-sm text-red-600">{{ errors.yearLevel }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">School Year</label>
                  <input
                    v-model="editedSubject.schoolYear"
                    type="text"
                    placeholder="e.g., 2025 - 2026"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Hours *</label>
                  <select
                    v-model="editedSubject.hours"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.hours }"
                  >
                    <option v-for="hour in hoursOptions" :key="hour" :value="hour.toString()">{{ hour }} {{ hour === 1 ? 'Hour' : 'Hours' }}</option>
                  </select>
                  <p v-if="errors.hours" class="mt-1 text-sm text-red-600">{{ errors.hours }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                  <select
                    v-model="editedSubject.semester"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm cursor-not-allowed"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.semester }"
                    disabled
                  >
                    <option value="1st Semester" >1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                  </select>
                  <p v-if="errors.semester" class="mt-1 text-sm text-red-600">{{ errors.semester }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sessions Count -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-800">Configured Sessions</h4>
              <span class="text-sm text-blue-700">{{ editedSessions.filter(s => s.title).length || 0 }} / {{ editedSessions.length }} sessions</span>
            </div>
          </div>

          <!-- Sessions Table -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-4">{{ editedSubject.semester }} Sessions</h4>
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div class="max-h-96 overflow-y-auto">
                <table class="min-w-full">
                  <thead class="bg-gray-50 sticky top-0">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Day</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Title</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="session in editedSessions" :key="session.day" :class="{ 'bg-amber-50': session.isExam }">
                      <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ session.day }}</td>
                      <td class="px-4 py-3">
                        <!-- If session is an exam, display as non-editable text -->
                        <div v-if="session.isExam" class="px-3 py-2 text-sm text-gray-800">
                          {{ session.title }}
                          <span class="ml-2 inline-flex px-2 py-1 text-xs font-normal rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                            Periodical Exam
                          </span>
                        </div>
                        <!-- If not an exam, show editable input field -->
                        <input
                          v-else
                          type="text"
                          v-model="session.title"
                          placeholder="Enter session title"
                          class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
          <button
            @click="showEditModal = false"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="updateSubject"
            class="px-4 py-2 text-sm font-normal text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Update Subject
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { subjectService } from '../../services/subjectService'
import { notificationService } from '../../services/notificationService'
import { systemOptionsService } from '../../services/systemOptionsService'

// State
const subjects = ref([])
const allSubjects = ref([])
const loading = ref(false)
const showAddModal = ref(false)
const sessionTitles = ref([])
const selectedSubject = ref(null)
const showSessionsModal = ref(false)
const currentSubject = ref(null)
const editedSubject = ref({})
const editedSessions = ref([])
const showEditModal = ref(false)
const subjectTemplates = ref([])

// Dynamic options
const yearLevelOptions = ref(['1st', '2nd', '3rd', '4th'])
const hoursOptions = ref([1, 2, 3])
const defaultZeroDayTitle = ref('INTRODUCTION')
const examOptions = computed(() => examSessionDays.value.map(e => ({
  name: e.name,
  day: e.day
})))

const examSessionDays = ref([
  { name: 'Prelim Exam', day: 5 },
  { name: 'Midterm Exam', day: 10 },
  { name: 'Final Exam', day: 15 }
])

// Form state
const newSubject = reactive({
  sspCode: '',
  name: '',
  yearLevel: '',
  sessions: [],
  semester: '1st Semester',
  hours: 1,
  schoolYear: '2025 - 2026'
})

// Error state
const errors = reactive({
  sspCode: '',
  yearLevel: '',
  semester: '',
  hours: '',
  schoolYear: ''
})

// Filters
const filters = reactive({
  yearLevel: '',
  search: ''
})

// Search input debounce
let searchTimeout = null

onMounted(async () => {
  try {
    // First fetch system options
    const systemOptions = await systemOptionsService.getAll()
    console.log('[DEBUG] Raw systemOptions response:', systemOptions)
    
    // DEBUG: Check the 'subject' part of the system options
    if (systemOptions && systemOptions.subject) {
      console.log('[DEBUG] Found systemOptions.subject object:', systemOptions.subject);
    } else {
      console.log('[DEBUG] systemOptions.subject object NOT found.');
    }

    // Update school year
    if (systemOptions?.subject?.schoolYear) {
      newSubject.schoolYear = systemOptions.subject.schoolYear
      console.log('Setting school year from system config:', newSubject.schoolYear)
    }
    
    // Update zero day title
    if (systemOptions?.subject?.defaultZeroDayTitle) {
      defaultZeroDayTitle.value = systemOptions.subject.defaultZeroDayTitle
      console.log('Setting default zero day title from system config:', defaultZeroDayTitle.value)
    }
    
    // Update year level options - now use subject-specific year levels
    if (systemOptions?.subject?.yearLevels && systemOptions.subject.yearLevels.length > 0) {
      yearLevelOptions.value = systemOptions.subject.yearLevels
      console.log('Setting year level options from subject config:', yearLevelOptions.value)
    }
    
    // Update hours options
    if (systemOptions?.subject?.hoursOptions && systemOptions.subject.hoursOptions.length > 0) {
      hoursOptions.value = systemOptions.subject.hoursOptions
      console.log('Setting hours options from system config:', hoursOptions.value)
    }
    
    // Update exam session days
    if (systemOptions?.subject?.examSessionDays && systemOptions.subject.examSessionDays.length > 0) {
      examSessionDays.value = systemOptions.subject.examSessionDays
      console.log('Setting exam session days from system config:', examSessionDays.value)
    }
    
    // Load subject templates (configurations) from system options
    if (systemOptions?.subject?.configurations && systemOptions.subject.configurations.length > 0) {
      subjectTemplates.value = systemOptions.subject.configurations
      console.log('[DEBUG] Successfully loaded subject templates from system config (configurations):', subjectTemplates.value)
    } else {
      console.log('[DEBUG] No subject templates found at systemOptions.subject.configurations or it is empty.');
    }
    
    console.log('System options loaded successfully')
  } catch (error) {
    console.error('Error loading system options:', error)
    // Continue with defaults
    notificationService.showWarning('Using default system options. Settings not loaded from server.')
  }
  
  await fetchSubjects()
})

// Filtered subjects based on current filters
const filteredSubjects = computed(() => {
  return filterSubjects(allSubjects.value)
})

function handleSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    subjects.value = filteredSubjects.value
  }, 300)
}

async function fetchSubjects() {
  try {
    loading.value = true
    const data = await subjectService.getAll()
    console.log('Fetched subjects:', data)
    allSubjects.value = data || []
    
    // Apply filters
    subjects.value = filteredSubjects.value
  } catch (error) {
    console.error('Failed to fetch subjects:', error)
    notificationService.showError('Failed to load subjects. Please try again.')
    allSubjects.value = []
    subjects.value = []
  } finally {
    loading.value = false
  }
}

function filterSubjects(subjectsData) {
  return subjectsData.filter(subject => {
    // Filter by year level
    if (filters.yearLevel && subject.yearLevel !== filters.yearLevel) {
      return false
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const sspCode = subject.sspCode?.toLowerCase() || ''
      
      if (!sspCode.includes(searchTerm)) {
        return false
      }
    }
    
    return true
  })
}

function openAddModal() {
  // Reset form
  newSubject.sspCode = ''
  newSubject.yearLevel = ''
  newSubject.sessions = []
  newSubject.semester = '1st Semester'  // Default to 1st semester but hide from UI
  newSubject.hours = ''
  
  // Reset session titles to empty array first
  sessionTitles.value = ['']
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
}

function addSessionTitle() {
  sessionTitles.value.push('')
}

function removeSessionTitle(index) {
  sessionTitles.value.splice(index, 1)
}

function validateForm() {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  if (!newSubject.sspCode) {
    errors.sspCode = 'SSP Code is required'
    isValid = false
  }
  
  if (!newSubject.yearLevel) {
    errors.yearLevel = 'Year level is required'
    isValid = false
  } else if (!yearLevelOptions.value.includes(newSubject.yearLevel)) {
    errors.yearLevel = `Year level must be one of: ${yearLevelOptions.value.join(', ')}`
    isValid = false
  }
  
  // Validate semester
  if (!newSubject.semester) {
    newSubject.semester = '1st Semester' // Default to 1st Semester
  } else if (!['1st Semester', '2nd Semester'].includes(newSubject.semester)) {
    errors.semester = 'Semester must be either "1st Semester" or "2nd Semester"'
    isValid = false
  }
  
  if (!newSubject.hours) {
    errors.hours = 'Hours are required'
    isValid = false
  } else if (!hoursOptions.value.map(h => h.toString()).includes(newSubject.hours)) {
    errors.hours = `Hours must be one of: ${hoursOptions.value.join(', ')}`
    isValid = false
  }
  
  if (!newSubject.schoolYear) {
    errors.schoolYear = 'School Year is required'
    isValid = false
  }
  
  // Check if any session has an empty title
  const emptyTitleIndex = sessionTitles.value.findIndex(title => title !== '' && title.trim() === '')
  if (emptyTitleIndex !== -1) {
    notificationService.showWarning(`Session ${emptyTitleIndex + 1} has an empty title. Please provide a title or remove it.`)
    isValid = false
  }
  
  return isValid
}

async function addSubject() {
  if (!validateForm()) {
    return
  }
  
  try {
    // Create sessions array from the titles that have been entered
    const sessions = []
    
    // Add sessions
    for (let index = 0; index < sessionTitles.value.length; index++) {
      const title = sessionTitles.value[index];
      if (title && title.trim()) {
        sessions.push({
          day: index + 1, // Sessions are 1-based
          title: title.trim()
        })
      }
    }
    
    // Create a copy of the subject with properly typed values
    const subjectToCreate = {
      sspCode: newSubject.sspCode,
      name: newSubject.sspCode, // Always set name to match SSP code
      yearLevel: newSubject.yearLevel,
      semester: newSubject.semester,
      // Convert hours from string to number
      hours: parseInt(newSubject.hours, 10),
      schoolYear: newSubject.schoolYear,
      sessions: sessions
    }
    
    // Log the data we're sending
    console.log('Sending subject data:', JSON.stringify(subjectToCreate))
    
    const response = await subjectService.create(subjectToCreate)
    console.log('New subject created:', response)
    
    // Refresh the subject list to show the new entry
    await fetchSubjects()
    
    notificationService.showSuccess('Subject added successfully')
    closeAddModal()
  } catch (error) {
    console.error('Error adding subject:', error)
    console.error('Error details:', error.response?.data || error.message)
    
    if (error.response && error.response.data && error.response.data.message) {
      notificationService.showError(error.response.data.message)
    } else {
      notificationService.showError('Failed to add subject. Please try again later.')
    }
  }
}

function viewSessions(subject) {
  // Show sessions for this subject
  if (!subject.sessions || subject.sessions.length === 0) {
    notificationService.showInfo('This subject has no sessions defined yet.')
    return
  }
  
  // Save selected subject for sessions view
  selectedSubject.value = subject
  
  showSessionsModal.value = true
}

function editSubject(subject) {
  setupEditForm(subject)
  
  // Determine the total number of sessions for the edit form based on the subject's properties
  // This ensures consistency with how sessions are generated in the add modal
  const template = subjectTemplates.value.find(t =>
    t.year === editedSubject.value.yearLevel &&
    editedSubject.value.semester.startsWith(t.semester)
  );
  // Use the session count from the template, or default to 18 if no template or sessions count is found
  const totalSessionCount = template?.sessions || 18;

  const tempSessions = [];
  
  for (let i = 0; i < totalSessionCount; i++) {
    const currentDayOneBased = i + 1; // Sessions are 1-based for display and storage
    // Find existing session using the 1-based day
    const existingSession = subject.sessions?.find(s => s.day === currentDayOneBased);
    const isExam = examOptions.value.some(e => e.name === existingSession?.title);

    if (existingSession) {
      tempSessions.push({
        day: currentDayOneBased, // Store as 1-based
        title: existingSession.title,
        isExam: isExam,
        _id: existingSession._id // Include _id for potential future session-specific updates
      });
    } else {
      tempSessions.push({
        day: currentDayOneBased, // Store as 1-based
        title: '',
        isExam: false
      });
    }
  }

  editedSessions.value = tempSessions;
  
  showEditModal.value = true
}

function setupEditForm(subject) {
  // Clone the subject to avoid directly modifying the original
  editedSubject.value = {
    _id: subject._id,
    sspCode: subject.sspCode || '',
    yearLevel: subject.yearLevel || '',
    semester: subject.semester || '1st Semester',
    hours: subject.hours ? subject.hours.toString() : '1',
    schoolYear: subject.schoolYear || newSubject.schoolYear
  }
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

function closeEditModal() {
  showEditModal.value = false
}

function validateEditForm() {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  if (!editedSubject.value.sspCode) {
    errors.sspCode = 'SSP Code is required'
    isValid = false
  }
  
  if (!editedSubject.value.yearLevel) {
    errors.yearLevel = 'Year level is required'
    isValid = false
  } else if (!yearLevelOptions.value.includes(editedSubject.value.yearLevel)) {
    errors.yearLevel = `Year level must be one of: ${yearLevelOptions.value.join(', ')}`
    isValid = false
  }
  
  // Validate semester
  if (!editedSubject.value.semester) {
    errors.semester = 'Semester is required'
    isValid = false
  } else if (!['1st Semester', '2nd Semester'].includes(editedSubject.value.semester)) {
    errors.semester = 'Semester must be either "1st Semester" or "2nd Semester"'
    isValid = false
  }
  
  if (!editedSubject.value.hours) {
    errors.hours = 'Hours is required'
    isValid = false
  } else if (!hoursOptions.value.map(h => h.toString()).includes(editedSubject.value.hours.toString())) {
    errors.hours = `Hours must be one of: ${hoursOptions.value.join(', ')}`
    isValid = false
  }
  
  if (!editedSubject.value.schoolYear) {
    errors.schoolYear = 'School Year is required'
    isValid = false
  }
  
  return isValid
}

async function updateSubject() {
  if (!validateEditForm()) {
    return
  }
  
  try {
    // Create sessions array from the titles that have been entered
    const sessions = []
    
    // Add sessions
    for (const session of editedSessions.value) {
      if (session.title && session.title.trim()) {
        sessions.push({
          day: session.day,
          title: session.title.trim()
        })
      }
    }
    
    // Create a copy of the subject with properly typed values
    const subjectToUpdate = {
      _id: editedSubject.value._id,
      sspCode: editedSubject.value.sspCode,
      yearLevel: editedSubject.value.yearLevel,
      semester: editedSubject.value.semester,
      // Convert hours from string to number
      hours: parseInt(editedSubject.value.hours, 10),
      schoolYear: editedSubject.value.schoolYear,
      sessions: sessions
    }
    
    // Log the data we're sending
    console.log('Updating subject data:', JSON.stringify(subjectToUpdate))
    
    const response = await subjectService.update(editedSubject.value._id, subjectToUpdate)
    console.log('Subject updated:', response)
    
    // Refresh the subject list to show the updated entry
    await fetchSubjects()
    
    notificationService.showSuccess('Subject updated successfully')
    showEditModal.value = false
  } catch (error) {
    console.error('Error updating subject:', error)
    
    if (error.response && error.response.data && error.response.data.message) {
      notificationService.showError(error.response.data.message)
    } else {
      notificationService.showError('Failed to update subject. Please try again later.')
    }
  }
}

// Computed properties
const sortedSessions = computed(() => {
  if (!selectedSubject.value) return [];

  // When viewing, use the subject's actual sessions
  if (!showEditModal.value) {
    if (!selectedSubject.value.sessions) return [];
    return [...selectedSubject.value.sessions].sort((a, b) => a.day - b.day);
  }

  // When editing, create a temporary sessions array from editSessionTitles
  return editedSessions.value
    .filter(session => session.title && session.title.trim() !== '')
    .sort((a, b) => a.day - b.day);
  return [...selectedSubject.value.sessions].sort((a, b) => a.day - b.day);
})

// Add watchers for semester changes
watch([() => newSubject.yearLevel, () => newSubject.semester], ([newYear, newSem]) => {
  if (newYear && newSem) {
    console.log(`[Template] Searching for template with Year: ${newYear}, Semester: ${newSem}`);
    console.log('[Template] Available templates to search from:', JSON.parse(JSON.stringify(subjectTemplates.value)));
    const template = subjectTemplates.value.find(s => s.year === newYear && newSem.startsWith(s.semester));

    if (template) {
      console.log('[Template] Found template:', template);
      // Auto-populate fields from the template
      newSubject.sspCode = template.sspCode;
      newSubject.hours = template.hours ? template.hours.toString() : '1'; // Default to '1' if not in template
      // Use sessionDetails from the template, which is the correct property name
      const sessionsToUse = template.sessionDetails || template.sessions;
      
      // Determine the total number of sessions from the template, defaulting to 18 if not specified
      const totalSessions = template.sessions || 18;

      // Populate session titles from the template (excluding day 0)
      sessionTitles.value = Array(totalSessions > 0 ? totalSessions - 1 : 0).fill('');
      if (sessionsToUse && sessionsToUse.length > 0) {
        console.log('[Template DEBUG] Populating session titles from:', JSON.parse(JSON.stringify(sessionsToUse)));
        const newExamDays = [];
        sessionsToUse.forEach(session => {
          if (session.day > 0 && session.day <= totalSessions) {
            console.log(`[Template DEBUG] Setting session day ${session.day} with title: "${session.title}"`);
            sessionTitles.value[session.day - 1] = session.title;
            // Dynamically find exam days from the template
            if (session.title?.toLowerCase().includes('exam')) {
              newExamDays.push({ name: session.title, day: session.day - 1 });
            }
          }
        });
        // Update the examSessionDays with what was found in the template
        examSessionDays.value = newExamDays;
        console.log('[DEBUG] Dynamically updated exam days from template:', examSessionDays.value);
      }
      notificationService.showInfo(`Loaded template for ${newYear} Year, ${newSem}.`);
    } else {
      console.log('[Template] No template found. Resetting fields.');
      // If no template is found, reset to defaults but keep year and semester
      newSubject.sspCode = '';
      newSubject.hours = '';
      sessionTitles.value = Array(17).fill(''); // Default to 17 sessions (1-17)
      notificationService.showWarning(`No template found for ${newYear} Year, ${newSem}. Please fill in the details manually.`);
    }
  }
})

watch(() => editedSubject.value?.semester, (newSemester) => {
  console.log(`Edited subject semester changed to ${newSemester}`)
  if (newSemester && editedSubject.value._id) {
    loadSessionsForSemester(editedSubject.value._id, newSemester)
  }
})

// Load sessions for a specific semester
function loadSessionsForSemester(subjectId, semester) {
  const subject = subjects.value.find(s => s._id === subjectId)
  if (!subject) return

  // Determine the total number of sessions from the subject, defaulting to 18 if not specified
  const totalSessions = subject.sessions?.length > 0 ? Math.max(...subject.sessions.map(s => s.day + 1)) : 18;

  editSubject(subject); // Re-use the editSubject logic to populate the form
}

function isExamSession(dayIndex) {
  // dayIndex is now 0-based, same as array index
  const isExam = examSessionDays.value.some(exam => exam.day === dayIndex);
  console.log(`[DEBUG] Checking isExamSession for day ${dayIndex}. Is it an exam? ${isExam}`);
  return isExam;
}

function isSessionAnExam(session) {
  // A more reliable check is to see if the session title contains "exam".
  // This works even if the day number changes.
  return session.title?.toLowerCase().includes('exam');
}

function isExamTypeAssigned(examName, currentDay) {
  if (!examName) return false;
  const foundSession = editedSessions.value.find(s => s.title === examName);
  // The dropdown should be disabled if the exam type is already assigned to another day
  return foundSession && foundSession.day !== currentDay;
}

</script>