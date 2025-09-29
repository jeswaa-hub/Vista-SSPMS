<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="flex items-center justify-between">
  <div>
            <h1 class="text-2xl font-normal text-gray-800">Students Management</h1>
            <p class="text-gray-500 mt-1 font-normal">Manage student records and assignments</p>
          </div>
        </div>
    </div>

    <!-- Filters -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
          <select
            v-model="filters.yearLevel"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @change="onYearLevelChange"
          >
            <option value="">All Years</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Section</label>
          <select
            v-model="filters.section"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @change="applyFiltersAndPagination"
          >
            <option value="">All Sections</option>
            <option v-for="(section, index) in availableSections" :key="index" :value="section">
              {{ section }}
            </option>
          </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Major</label>
          <select
            v-model="filters.major"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @change="applyFiltersAndPagination"
          >
            <option value="">All Majors</option>
            <option v-for="(major, index) in availableMajors" :key="index" :value="major">
              {{ major }}
            </option>
          </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Assignment</label>
          <select
            v-model="filters.assignment"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @change="applyFiltersAndPagination"
          >
            <option value="">All</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
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
            placeholder="Search by name or ID"
                class="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @input="handleSearchInput"
          />
            </div>
        </div>
      </div>
    </div>

      <!-- Action Buttons -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div class="flex justify-between items-center">
      <div>
            <h2 class="text-lg font-normal text-gray-800">Student Records</h2>
            <p class="text-sm text-gray-500 font-normal">Manage all registered students</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="assignStudentsToClasses"
          :disabled="assigningClasses || selectedStudents.length === 0"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-normal text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
          title="Assign selected students to appropriate classes"
        >
          <svg v-if="assigningClasses" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
              <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          <span v-if="assigningClasses">Assigning Students...</span>
              <span v-else>Assign Selected ({{ selectedStudents.length }})</span>
        </button>
        <button
          @click="refreshStudents"
          :disabled="loading"
              class="px-4 py-2 border border-gray-200 rounded-md shadow-sm text-sm font-normal text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
        >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
              <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span v-if="loading">Loading...</span>
          <span v-else>Refresh List</span>
        </button>
      </div>
      </div>
    </div>

    <!-- Students Table -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div class="flex items-center">
                <input
                  type="checkbox"
                  @change="toggleSelectAll"
                  :checked="areAllStudentsSelected"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2">Select</span>
              </div>
            </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
            <tbody class="divide-y divide-gray-200">
          <tr v-if="loading">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span class="ml-3 text-gray-500">Loading students...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="students.length === 0">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
                  <h3 class="text-base font-normal text-gray-800 mb-1">
                    {{ (filters.search || filters.yearLevel || filters.major || filters.section || filters.assignment !== '') ? 'No students found' : 'No students yet' }}
                  </h3>
                  <p class="text-gray-500 font-normal">
                    {{ (filters.search || filters.yearLevel || filters.major || filters.section || filters.assignment !== '') ? 'Try adjusting your search criteria' : 'Students will appear here once they are registered' }}
                  </p>
            </td>
          </tr>
          <tr v-for="(student, index) in students" :key="index" class="hover:bg-gray-50 transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                v-model="selectedStudents"
                :value="student._id"
                class="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200 hover:border-indigo-500 cursor-pointer"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span class="text-sm font-medium text-indigo-600">
                    {{ getInitials(student) }}
                  </span>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ student.user?.firstName || '' }} {{ student.user?.middleName || '' }} {{ student.user?.lastName || '' }}
                    {{ student.user?.nameExtension !== 'N/A' ? student.user?.nameExtension : '' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ student.user?.email || '' }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span class="font-mono">{{ student.user?.idNumber || 'N/A' }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span class="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-md">
                {{ getClassName(student.class, student) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="viewStudent(student)" 
                class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </button>
              <button 
                @click="editStudent(student)" 
                class="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
        </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ pagination.from }}</span> to <span class="font-medium">{{ pagination.to }}</span> of <span class="font-medium">{{ pagination.total }}</span> students
            </p>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="changePage(pagination.currentPage - 1)" 
              :disabled="pagination.currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button 
              @click="changePage(pagination.currentPage + 1)" 
              :disabled="pagination.currentPage === pagination.totalPages"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Student Modal -->
  <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex justify-center items-center">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h2 class="text-xl font-normal text-gray-800">Student Details</h2>
        <button @click="showViewModal = false" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div v-if="currentStudent" class="space-y-6">
          <!-- Student Profile Header -->
          <div class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5">
            <div class="flex items-center">
              <div class="h-16 w-16 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                <span class="text-xl font-medium text-indigo-600">
                  {{ getInitials(currentStudent) }}
                </span>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-medium text-gray-900">
                  {{ currentStudent.user?.firstName || '' }} {{ currentStudent.user?.middleName || '' }} {{ currentStudent.user?.lastName || '' }}
                  {{ currentStudent.user?.nameExtension !== 'N/A' ? currentStudent.user?.nameExtension : '' }}
                </h3>
                <p class="text-gray-600">{{ currentStudent.user?.email || '' }}</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ID: {{ currentStudent.user?.idNumber || 'N/A' }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {{ currentStudent.major || 'No Major' }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ currentStudent.status || 'Active' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Tab Navigation -->
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button
                @click="activeTab = 'basic'"
                :class="activeTab === 'basic' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Basic Info
              </button>
              <button
                @click="loadSessionsTab"
                :class="activeTab === 'sessions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Sessions
              </button>
              <button
                @click="loadHistoryTab"
                :class="activeTab === 'history' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </button>
              <button
                @click="activeTab = 'actions'"
                :class="activeTab === 'actions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Actions
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="mt-6">
            <!-- Basic Info Tab -->
            <div v-if="activeTab === 'basic'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Personal Information -->
            <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <h4 class="font-medium text-indigo-600 border-b border-gray-100 pb-2 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h4>
              
              <div class="space-y-4">
                <div class="flex justify-between">
                  <h5 class="text-sm font-medium text-gray-500">Contact Number</h5>
                  <p class="text-gray-900">{{ currentStudent.contactNumber || 'N/A' }}</p>
                </div>
                
                <div class="flex justify-between">
                  <h5 class="text-sm font-medium text-gray-500">Gender</h5>
                  <p class="text-gray-900">{{ currentStudent.gender || 'N/A' }}</p>
                </div>
              </div>
            </div>
            
            <!-- Academic Information -->
            <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <h4 class="font-medium text-indigo-600 border-b border-gray-100 pb-2 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                Academic Information
              </h4>
              
              <div class="space-y-4">
                <div class="flex justify-between">
                  <h5 class="text-sm font-medium text-gray-500">Class</h5>
                  <p class="text-gray-900 bg-gray-100 px-2 py-1 rounded">{{ getClassName(currentStudent.class, currentStudent) }}</p>
                </div>
                
                <div class="flex justify-between">
                  <h5 class="text-sm font-medium text-gray-500">Major</h5>
                  <p class="text-gray-900">{{ currentStudent.major || 'N/A' }}</p>
                </div>
                
                <div class="flex justify-between">
                  <h5 class="text-sm font-medium text-gray-500">Status</h5>
                  <p class="text-gray-900">{{ currentStudent.status || 'Active' }}</p>
                </div>
              </div>
            </div>
            
            <!-- Address Information -->
            <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 md:col-span-2 hover:shadow-md transition-shadow duration-200">
              <h4 class="font-medium text-indigo-600 border-b border-gray-100 pb-2 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Address Information
              </h4>
              
              <div v-if="currentStudent.address && (currentStudent.address.block || currentStudent.address.street || currentStudent.address.barangay || currentStudent.address.municipality || currentStudent.address.province || currentStudent.address.region)" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-if="currentStudent.address.region">
                  <h5 class="text-sm font-medium text-gray-500">Region</h5>
                  <p class="text-gray-900">{{ currentStudent.address.region }}</p>
                </div>
                
                <div v-if="currentStudent.address.province">
                  <h5 class="text-sm font-medium text-gray-500">Province</h5>
                  <p class="text-gray-900">{{ currentStudent.address.province }}</p>
                </div>
                
                <div v-if="currentStudent.address.municipality">
                  <h5 class="text-sm font-medium text-gray-500">Municipality/City</h5>
                  <p class="text-gray-900">{{ currentStudent.address.municipality }}</p>
                </div>
                
                <div v-if="currentStudent.address.barangay">
                  <h5 class="text-sm font-medium text-gray-500">Barangay</h5>
                  <p class="text-gray-900">{{ currentStudent.address.barangay }}</p>
                </div>
                
                <div v-if="currentStudent.address.street">
                  <h5 class="text-sm font-medium text-gray-500">Street/Purok</h5>
                  <p class="text-gray-900">{{ currentStudent.address.street }}</p>
                </div>
                
                <div v-if="currentStudent.address.block">
                  <h5 class="text-sm font-medium text-gray-500">Block/Building/Unit</h5>
                  <p class="text-gray-900">{{ currentStudent.address.block }}</p>
                </div>
              </div>
              <p v-else class="text-gray-500 italic">No address information available</p>
            </div>
              </div>
            </div>

            <!-- Sessions Tab -->
            <div v-if="activeTab === 'sessions'" class="space-y-6">
              <div v-if="loadingSessions" class="text-center py-8">
                <div class="inline-flex items-center">
                  <svg class="animate-spin h-5 w-5 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading sessions data...
                </div>
              </div>

              <div v-else-if="sessionData" class="space-y-6">
                <!-- Progress Overview -->
                <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <h4 class="font-medium text-indigo-600 border-b border-gray-100 pb-2 mb-4">Current Semester Progress</h4>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-indigo-600">{{ sessionData.progress.percentage }}%</div>
                      <div class="text-sm text-gray-500">Overall Progress</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-green-600">{{ sessionData.progress.completed }}</div>
                      <div class="text-sm text-gray-500">Completed Sessions</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-gray-600">{{ sessionData.progress.total }}</div>
                      <div class="text-sm text-gray-500">Total Sessions</div>
                    </div>
                  </div>
                  
                  <div class="mt-4">
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{{ sessionData.currentSemester }}</span>
                      <span>{{ sessionData.currentSubject?.name || 'No Subject' }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" :style="{ width: sessionData.progress.percentage + '%' }"></div>
                    </div>
                  </div>
                </div>

                <!-- Session List -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div class="p-5 border-b border-gray-100">
                    <h4 class="font-medium text-indigo-600">Session Details</h4>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Date</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="session in sessionData.sessions" :key="session.day" class="hover:bg-gray-50">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Day {{ session.day }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {{ session.title }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span v-if="session.completed" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                            <span v-else-if="session.rejectionStatus === 'rejected'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Rejected
                            </span>
                            <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Pending
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ session.completionDate ? formatDate(session.completionDate) : '-' }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span v-if="session.hasAttachment" class="text-green-600">✓ Yes</span>
                            <span v-else class="text-gray-400">- No</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- M&M Status -->
                <div v-if="sessionData.mmSubmissions.length > 0" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <h4 class="font-medium text-indigo-600 border-b border-gray-100 pb-2 mb-4">M&M Submission Status</h4>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div v-for="mm in sessionData.mmSubmissions.slice(0, 3)" :key="mm.examType" class="text-center p-3 border rounded-lg">
                      <div class="text-lg font-semibold">{{ mm.examType }}</div>
                      <div class="text-sm" :class="mm.status === 'approved' ? 'text-green-600' : mm.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'">
                        {{ mm.status.charAt(0).toUpperCase() + mm.status.slice(1) }}
                      </div>
                      <div class="text-xs text-gray-500 mt-1">{{ mm.submissionDate ? formatDate(mm.submissionDate) : '-' }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500">
                No session data available
              </div>
            </div>

            <!-- History Tab -->
            <div v-if="activeTab === 'history'" class="space-y-6">
              <div v-if="loadingHistory" class="text-center py-8">
                <div class="inline-flex items-center">
                  <svg class="animate-spin h-5 w-5 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading history data...
                </div>
              </div>

              <div v-else-if="historyData && historyData.history.length > 0" class="space-y-6">
                <!-- History Summary -->
                <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <h4 class="font-medium text-indigo-600 border-b border-gray-100 pb-2 mb-4">History Summary</h4>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-indigo-600">{{ historyData.summary.totalSemesters }}</div>
                      <div class="text-sm text-gray-500">Completed Semesters</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-green-600">{{ historyData.summary.completedSessions }}</div>
                      <div class="text-sm text-gray-500">Total Sessions Completed</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-gray-600">{{ Math.round((historyData.summary.completedSessions / historyData.summary.totalSessions) * 100) }}%</div>
                      <div class="text-sm text-gray-500">Overall Completion Rate</div>
                    </div>
                  </div>
                </div>

                <!-- History List -->
                <div class="space-y-4">
                  <div v-for="semester in historyData.history" :key="`${semester.schoolYear}-${semester.semester}`" class="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div class="p-5 border-b border-gray-100 cursor-pointer" @click="toggleHistoryExpanded(semester.schoolYear, semester.semester)">
                      <div class="flex justify-between items-center">
                        <div>
                          <h5 class="font-medium text-gray-900">{{ semester.semester }} - {{ semester.schoolYear }}</h5>
                          <p class="text-sm text-gray-500">
                            {{ semester.classDetails?.yearLevel || 'N/A' }} Year - {{ semester.classDetails?.section || 'N/A' }} | 
                            {{ semester.subjectDetails?.name || 'N/A' }}
                          </p>
                        </div>
                        <div class="text-right">
                          <div class="text-lg font-semibold" :class="semester.completionPercentage >= 90 ? 'text-green-600' : semester.completionPercentage >= 70 ? 'text-yellow-600' : 'text-red-600'">
                            {{ semester.completionPercentage }}%
                          </div>
                          <div class="text-sm text-gray-500">{{ semester.completedCount }}/{{ semester.totalCount }} sessions</div>
                        </div>
                      </div>
                    </div>
                    
                    <div v-if="expandedHistory[`${semester.schoolYear}-${semester.semester}`]" class="p-5">
                      <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                          <thead class="bg-gray-50">
                            <tr>
                              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                            </tr>
                          </thead>
                          <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="session in semester.sessions" :key="session.day" class="hover:bg-gray-50">
                              <td class="px-4 py-2 text-sm text-gray-900">Day {{ session.day }}</td>
                              <td class="px-4 py-2 text-sm text-gray-900">{{ session.title }}</td>
                              <td class="px-4 py-2">
                                <span v-if="session.completed" class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>
                                <span v-else class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Pending</span>
                              </td>
                              <td class="px-4 py-2 text-sm text-gray-500">{{ session.completionDate ? formatDate(session.completionDate) : '-' }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500">
                No history data available
              </div>
            </div>

            <!-- Actions Tab -->
            <div v-if="activeTab === 'actions'" class="space-y-6">
              <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h4 class="font-medium text-indigo-600 border-b border-gray-100 pb-2 mb-4">Student Actions</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    @click="() => { editStudent(currentStudent); showViewModal = false; }"
                    class="flex items-center justify-center px-4 py-3 border border-indigo-300 rounded-lg shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Student Info
                  </button>

                  <button
                    v-if="currentStudent.status === 'active'"
                    @click="openDropFromView"
                    class="flex items-center justify-center px-4 py-3 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Drop Student
                  </button>

                  <button
                    v-if="currentStudent.status === 'dropped'"
                    @click="reactivateStudent"
                    class="flex items-center justify-center px-4 py-3 border border-green-300 rounded-lg shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reactivate Student
                  </button>

                  <button
                    class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Full Profile
                  </button>
                </div>
              </div>

              <!-- Drop Reason (if student is dropped) -->
              <div v-if="currentStudent.status === 'dropped'" class="bg-red-50 rounded-xl shadow-sm p-5 border border-red-200">
                <h4 class="font-medium text-red-600 border-b border-red-200 pb-2 mb-4">Drop Information</h4>
                <div class="space-y-2">
                  <div><strong>Drop Date:</strong> {{ currentStudent.dropDate ? formatDate(currentStudent.dropDate) : 'N/A' }}</div>
                  <div><strong>Reason:</strong> {{ currentStudent.dropReason || 'N/A' }}</div>
                  <div><strong>Semester:</strong> {{ currentStudent.dropSemester || 'N/A' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            @click="showViewModal = false"
            class="px-4 py-2 mr-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Close
          </button>
          <button
            @click="() => { editStudent(currentStudent); showViewModal = false; }"
            class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Student
          </button>
        </div>
      </div>
    </div>
    
    <!-- Edit Student Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto p-6 z-50 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Edit Student</h2>
          <button @click="showEditModal = false" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="updateStudent">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                v-model="editForm.firstName" 
                type="text" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <input 
                v-model="editForm.middleName" 
                type="text" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                v-model="editForm.lastName" 
                type="text" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name Extension</label>
              <input 
                v-model="editForm.nameExtension" 
                type="text" 
                placeholder="e.g. Jr., Sr., III"
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
              <input 
                v-model="editForm.idNumber" 
                type="text" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                v-model="editForm.email" 
                type="email" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input 
                v-model="editForm.contactNumber" 
                type="text" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div class="col-span-1 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Block</label>
                  <input 
                    v-model="editForm.address.block" 
                    type="text" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Street/Purok</label>
                  <input 
                    v-model="editForm.address.street" 
                    type="text" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Barangay</label>
                  <div v-if="!customAddress.barangay">
                    <select 
                      v-model="editForm.address.barangay" 
                      :disabled="!editForm.address.municipality && !customAddress.municipality"
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select Barangay</option>
                      <option v-for="barangay in availableBarangays" :key="barangay" :value="barangay">
                        {{ barangay }}
                      </option>
                    </select>
                    <div class="mt-1">
                      <button 
                        type="button" 
                        @click="customAddress.barangay = true" 
                        class="text-xs text-primary hover:underline"
                        :disabled="!editForm.address.municipality && !customAddress.municipality"
                      >
                        Barangay not in the list? Click here to enter manually
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <input 
                      v-model="editForm.address.barangay" 
                      type="text" 
                      placeholder="Enter barangay" 
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                    <div class="mt-1">
                      <button 
                        type="button" 
                        @click="resetCustomBarangay" 
                        class="text-xs text-primary hover:underline"
                      >
                        Use dropdown list instead
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Municipality</label>
                  <div v-if="!customAddress.municipality">
                    <select 
                      v-model="editForm.address.municipality" 
                      :disabled="!editForm.address.province && !customAddress.province"
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      @change="loadBarangays"
                    >
                      <option value="">Select Municipality</option>
                      <option v-for="municipality in availableMunicipalities" :key="municipality" :value="municipality">
                        {{ municipality }}
                      </option>
                    </select>
                    <div class="mt-1">
                      <button 
                        type="button" 
                        @click="customAddress.municipality = true" 
                        class="text-xs text-primary hover:underline"
                        :disabled="!editForm.address.province && !customAddress.province"
                      >
                        Municipality not in the list? Click here to enter manually
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <input 
                      v-model="editForm.address.municipality" 
                      type="text" 
                      placeholder="Enter municipality/city" 
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                    <div class="mt-1">
                      <button 
                        type="button" 
                        @click="resetCustomMunicipality" 
                        class="text-xs text-primary hover:underline"
                      >
                        Use dropdown list instead
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Province</label>
                  <div v-if="!customAddress.province">
                    <select 
                      v-model="editForm.address.province" 
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      @change="loadMunicipalities"
                    >
                      <option value="">Select Province</option>
                      <option v-for="province in provinces" :key="province" :value="province">
                        {{ province }}
                      </option>
                    </select>
                    <div class="mt-1">
                      <button 
                        type="button" 
                        @click="customAddress.province = true" 
                        class="text-xs text-primary hover:underline"
                      >
                        Province not in the list? Click here to enter manually
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <input 
                      v-model="editForm.address.province" 
                      type="text" 
                      placeholder="Enter province" 
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                    <div class="mt-1">
                      <button 
                        type="button" 
                        @click="resetCustomProvince" 
                        class="text-xs text-primary hover:underline"
                      >
                        Use dropdown list instead
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                v-model="editForm.gender"
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Major</label>
              <select
                v-model="editForm.major"
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="">Select Major</option>
                <option v-for="major in availableMajors" :key="major" :value="major">{{ major }}</option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 mr-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Drop Student Modal -->
    <div v-if="showDropModal" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6 z-50">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-red-600">Drop Student</h2>
          <button @click="closeDropModal" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mb-4">
          <p class="text-gray-700 mb-4">
            Are you sure you want to drop <strong>{{ currentStudent?.user?.firstName }} {{ currentStudent?.user?.lastName }}</strong>?
            This action will remove the student from their current class.
          </p>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Reason for dropping:</label>
            <select 
              v-model="dropForm.reason" 
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            >
              <option value="">Select a reason</option>
              <option value="Doesnt Complete">Doesn't Complete</option>
              <option value="Self Drop">Self Drop</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Current Semester:</label>
            <select 
              v-model="dropForm.semester" 
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            >
              <option value="">Select semester</option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeDropModal"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            @click="confirmDropStudent"
            :disabled="!dropForm.reason || !dropForm.semester || droppingStudent"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg v-if="droppingStudent" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ droppingStudent ? 'Dropping...' : 'Drop Student' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { notificationService } from '../../services/notificationService';
import api from '../../services/api';

const route = useRoute();

// State
const students = ref([]);
const allStudents = ref([]);
const classes = ref([]);
const loading = ref(false);
const showImportModal = ref(false);
const importFile = ref(null);
const importProgress = ref({
  total: 0,
  current: 0,
  isUploading: false
});

// Filters
const filters = reactive({
  yearLevel: '',
  section: '',
  major: '',
  assignment: '',
  search: ''
});

// Pagination
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  itemsPerPage: 10,
  totalItems: 0
});

// Search input debounce
let searchTimeout = null

// Define available sections and majors based on year level
const availableSections = ref([]);
const availableMajors = ref([]);

// Add to the script section
const assigningClasses = ref(false)

// Add these state variables for modals
const showViewModal = ref(false);
const showEditModal = ref(false);
const showDropModal = ref(false);
const currentStudent = ref(null);

// Tab state for enhanced student modal
const activeTab = ref('basic');

// Session and history data
const sessionData = ref(null);
const historyData = ref(null);
const loadingSessions = ref(false);
const loadingHistory = ref(false);
const expandedHistory = ref({});

// Drop student form
const dropForm = ref({
  reason: '',
  semester: ''
});
const droppingStudent = ref(false);
const editForm = ref({
  firstName: '',
  middleName: '',
  lastName: '',
  nameExtension: '',
  email: '',
  idNumber: '',
  contactNumber: '',
  address: {
    block: '',
    street: '',
    barangay: '',
    municipality: '',
    province: ''
  },
  gender: '',
  major: '',
  yearLevel: '',
  section: ''
});

// Address dropdown data
const provinces = [
  'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique', 'Apayao',
  'Aurora', 'Basilan', 'Bataan', 'Batanes', 'Batangas', 'Benguet', 'Biliran', 'Bohol',
  'Bukidnon', 'Bulacan', 'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Camiguin',
  'Capiz', 'Catanduanes', 'Cavite', 'Cebu', 'Cotabato', 'Davao de Oro', 'Davao del Norte',
  'Davao del Sur', 'Davao Occidental', 'Davao Oriental', 'Dinagat Islands', 'Eastern Samar',
  'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo', 'Isabela', 'Kalinga',
  'La Union', 'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'Leyte', 'Maguindanao',
  'Marinduque', 'Masbate', 'Metro Manila', 'Misamis Occidental', 'Misamis Oriental',
  'Mountain Province', 'Negros Occidental', 'Negros Oriental', 'Northern Samar', 'Nueva Ecija',
  'Nueva Vizcaya', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Pampanga',
  'Pangasinan', 'Quezon', 'Quirino', 'Rizal', 'Romblon', 'Samar', 'Sarangani', 'Siquijor',
  'Sorsogon', 'South Cotabato', 'Southern Leyte', 'Sultan Kudarat', 'Sulu', 'Surigao del Norte',
  'Surigao del Sur', 'Tarlac', 'Tawi-Tawi', 'Zambales', 'Zamboanga del Norte', 'Zamboanga del Sur',
  'Zamboanga Sibugay'
];

const municipalitiesByProvince = {
  'Metro Manila': ['Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig', 'Parañaque', 'Caloocan', 
    'Las Piñas', 'Malabon', 'Mandaluyong', 'Marikina', 'Muntinlupa', 'Navotas', 'Pasay', 
    'Pateros', 'San Juan', 'Valenzuela'],
  
  'Batangas': ['Batangas City', 'Lipa', 'Tanauan', 'Santo Tomas', 'Bauan', 'San Jose', 
    'Nasugbu', 'Balayan', 'Lemery', 'Taal', 'Calatagan', 'Rosario', 'Malvar', 'San Juan', 
    'Ibaan', 'Padre Garcia'],
    
  'Laguna': ['Calamba', 'Santa Rosa', 'Biñan', 'San Pedro', 'Cabuyao', 'Los Baños', 
    'San Pablo', 'Alaminos', 'Bay', 'Calauan', 'Famy', 'Kalayaan', 'Liliw', 'Luisiana', 
    'Lumban', 'Mabitac', 'Magdalena', 'Majayjay', 'Nagcarlan', 'Paete', 'Pagsanjan', 
    'Pakil', 'Pangil', 'Pila', 'Rizal', 'Santa Cruz', 'Santa Maria', 'Siniloan', 'Victoria'],
    
  'Cavite': ['Bacoor', 'Dasmariñas', 'Imus', 'General Trias', 'Cavite City', 'Kawit', 
    'Silang', 'Tagaytay', 'Trece Martires', 'Carmona', 'Maragondon', 'Amadeo', 'Alfonso', 
    'General Emilio Aguinaldo', 'Indang', 'Magallanes', 'Mendez', 'Naic', 'Noveleta', 
    'Rosario', 'Tanza', 'Ternate'],
    
  'Rizal': ['Antipolo', 'Cainta', 'Taytay', 'San Mateo', 'Rodriguez', 'Angono', 'Binangonan', 
    'Baras', 'Cardona', 'Jalajala', 'Morong', 'Pililla', 'Tanay', 'Teresa'],
    
  'Bulacan': ['Malolos', 'Meycauayan', 'San Jose del Monte', 'Balagtas', 'Baliuag', 'Bocaue', 
    'Bulakan', 'Bustos', 'Calumpit', 'Guiguinto', 'Hagonoy', 'Marilao', 'Norzagaray', 'Obando', 
    'Pandi', 'Paombong', 'Plaridel', 'Pulilan', 'San Ildefonso', 'San Miguel', 'San Rafael', 
    'Santa Maria'],
    
  'Nueva Ecija': ['Cabanatuan', 'Palayan', 'San Jose', 'Gapan', 'Science City of Muñoz', 
    'Aliaga', 'Bongabon', 'Cabiao', 'Carranglan', 'Cuyapo', 'Gabaldon', 'General Mamerto Natividad', 
    'General Tinio', 'Guimba', 'Jaen', 'Laur', 'Licab', 'Llanera', 'Lupao', 'Nampicuan', 
    'Pantabangan', 'Peñaranda', 'Quezon', 'Rizal', 'San Antonio', 'San Isidro', 'San Leonardo', 
    'Santa Rosa', 'Santo Domingo', 'Talavera', 'Talugtug', 'Zaragoza'],
    
  'Pampanga': ['San Fernando', 'Angeles', 'Mabalacat', 'Apalit', 'Arayat', 'Bacolor', 'Candaba', 
    'Floridablanca', 'Guagua', 'Lubao', 'Macabebe', 'Magalang', 'Masantol', 'Mexico', 'Minalin', 
    'Porac', 'San Luis', 'San Simon', 'Santa Ana', 'Santa Rita', 'Santo Tomas', 'Sasmuan'],
    
  'Tarlac': ['Tarlac City', 'Capas', 'Concepcion', 'Gerona', 'Paniqui', 'Bamban', 'Camiling', 
    'La Paz', 'Mayantoc', 'Moncada', 'Pura', 'Ramos', 'San Clemente', 'San Jose', 'San Manuel', 
    'Santa Ignacia', 'Victoria'],
    
  'Pangasinan': ['Dagupan', 'Alaminos', 'San Carlos', 'Urdaneta', 'Tayug', 'Lingayen', 'Calasiao', 
    'Binmaley', 'Mangaldan', 'Manaoag', 'Rosales', 'Santa Barbara', 'Balungao', 'Agno', 'Alcala', 
    'Anda', 'Asingan', 'Bani', 'Basista', 'Bautista', 'Bayambang', 'Bolinao', 'Bugallon', 
    'Burgos', 'Dasol', 'Infanta', 'Labrador', 'Laoac', 'Mabini', 'Malasiqui', 'Mapandan', 'Natividad', 
    'Pozzorubio', 'San Fabian', 'San Jacinto', 'San Manuel', 'San Nicolas', 'San Quintin', 'Santa Maria', 
    'Santo Tomas', 'Sison', 'Sual', 'Urbiztondo', 'Villasis'],
    
  'Isabela': ['Ilagan', 'Cauayan', 'Santiago', 'Alicia', 'Angadanan', 'Aurora', 'Benito Soliven', 
    'Burgos', 'Cabagan', 'Cabatuan', 'Cordon', 'Delfin Albano', 'Dinapigue', 'Divilacan', 'Echague', 
    'Gamu', 'Jones', 'Luna', 'Maconacon', 'Mallig', 'Naguilian', 'Palanan', 'Quezon', 'Quirino', 
    'Ramon', 'Reina Mercedes', 'Roxas', 'San Agustin', 'San Guillermo', 'San Isidro', 'San Manuel', 
    'San Mariano', 'San Mateo', 'San Pablo', 'Santa Maria', 'Santo Tomas', 'Tumauini'],
  
  'Bataan': ['Balanga', 'Abucay', 'Bagac', 'Dinalupihan', 'Hermosa', 'Limay', 'Mariveles', 
    'Morong', 'Orani', 'Orion', 'Pilar', 'Samal'],
    
  'Aurora': ['Baler', 'Casiguran', 'Dilasag', 'Dinalungan', 'Dingalan', 'Dipaculao', 
    'Maria Aurora', 'San Luis'],
    
  'Zambales': ['Olongapo', 'Iba', 'Subic', 'Botolan', 'Cabangan', 'Candelaria', 'Castillejos', 
    'Masinloc', 'Palauig', 'San Antonio', 'San Felipe', 'San Marcelino', 'San Narciso', 'Santa Cruz']
  
  // More provinces can be added here as needed
};

const barangaysByMunicipality = {
  // Metro Manila municipalities
  'Manila': ['Binondo', 'Ermita', 'Intramuros', 'Malate', 'Paco', 'Pandacan', 'Port Area', 'Quiapo', 
    'Sampaloc', 'San Andres', 'San Miguel', 'San Nicolas', 'Santa Ana', 'Santa Cruz', 'Santa Mesa', 'Tondo'],
    
  'Quezon City': ['Alicia', 'Bagong Lipunan ng Crame', 'Bahay Toro', 'Balingasa', 'Balong Bato', 
    'Batasan Hills', 'Bayanihan', 'Blue Ridge A', 'Blue Ridge B', 'Botocan', 'Bungad', 'Camp Aguinaldo', 
    'Central', 'Commonwealth', 'Culiat', 'Damar', 'Damayan', 'Del Monte', 'Dioquino Zobel', 'Don Manuel', 
    'Doña Imelda', 'Doña Josefa', 'Duyan-Duyan', 'E. Rodriguez', 'East Kamias', 'Escopa I', 'Escopa II', 
    'Escopa III', 'Escopa IV', 'Fairview', 'Greater Lagro', 'Gulod', 'Holy Spirit', 'Horseshoe', 'Immaculate Concepcion', 
    'Kaligayahan', 'Kalusugan', 'Kamuning', 'Katipunan', 'Kaunlaran', 'Kristong Hari', 'Krus na Ligas', 'Laging Handa', 
    'Libis', 'Lourdes', 'Loyola Heights', 'Maharlika', 'Malaya', 'Mangga', 'Manresa', 'Mariana', 'Mariblo', 'Marilag'],
    
  'Makati': ['Bangkal', 'Bel-Air', 'Carmona', 'Cembo', 'Comembo', 'Dasmariñas', 'East Rembo', 'Forbes Park', 
    'Guadalupe Nuevo', 'Guadalupe Viejo', 'Kasilawan', 'La Paz', 'Magallanes', 'Olympia', 'Palanan', 'Pembo', 
    'Pinagkaisahan', 'Pio del Pilar', 'Pitogo', 'Poblacion', 'Post Proper Northside', 'Post Proper Southside', 
    'Rizal', 'San Antonio', 'San Isidro', 'San Lorenzo', 'Santa Cruz', 'Singkamas', 'South Cembo', 'Tejeros'],
    
  // Nueva Ecija municipalities
  'Cabanatuan': ['Aduas Centro', 'Aduas Norte', 'Aduas Sur', 'Bacal I', 'Bacal II', 'Balite', 'Bagong Bayan', 
    'Bagong Sikat', 'Bantug', 'Bantug Bulalo', 'Bantug Norte', 'Barlis', 'Barrera', 'Bernardo', 'Bonifacio', 
    'Buliran', 'Calawagan', 'Cabu', 'Cabo', 'Caudillo', 'Concepcion', 'Daang Sarile', 'Dionisio', 'Fatima', 
    'Galvan', 'H. Concepcion', 'Hermogenes', 'Homestead I', 'Homestead II', 'Imelda', 'Isla', 'Lagare'],
    
  'Palayan': ['Atate', 'Cabu', 'Ganaderia', 'Imelda Valley', 'Langka', 'Malate', 'Manga', 'Militar', 'Padre Crisostomo', 
    'Poblacion', 'Sapang Buho', 'Singalat'],
    
  'San Jose': ['Abar 1st', 'Abar 2nd', 'Andal Alino', 'Bagong Sikat', 'Palestina', 'Pinili', 'Porais', 'Santo Niño 1st', 
    'Santo Niño 2nd', 'Santo Tomas', 'Villa Joson'],
    
  'Gapan': ['Bayanihan', 'Bulak', 'Bungo', 'Kapalangan', 'Malasin', 'Malimba', 'Mangino', 'Mapalad', 'Marelo', 
    'Pambuan', 'San Lorenzo', 'San Nicolas', 'San Roque', 'San Vicente', 'Santo Cristo', 'Santo Niño'],
    
  'Science City of Muñoz': ['Balante', 'Bagong Sikat', 'Bantug', 'Calabalabaan', 'Catalanacan', 'Cawayan', 'Curva', 
    'Franza', 'Gabaldon', 'Labney', 'Licaong', 'Linglingay', 'Maligaya', 'Mangandingay', 'Mapangpang', 'Maragol', 
    'Matingkis', 'Palusapis', 'Poblacion Central', 'Poblacion East', 'Poblacion North', 'Poblacion South', 'Poblacion West', 
    'Rang-ayan', 'Rizal', 'San Andres', 'Villa Isla', 'Villa Santos'],
    
  'Zaragoza': ['Batitang', 'Burgos', 'Del Pilar', 'General Luna', 'H. Romero', 'Macabaklay', 'Mayamot', 'San Isidro', 
    'Santa Lucia', 'Santo Rosario', 'Valeriana'],
    
  'Talavera': ['Andal Alino', 'Bagong Sikat', 'Bakal I', 'Bakal II', 'Bantug', 'Bugtong na Buli', 'Burnay', 'Cabawag', 
    'Caaniplahan', 'Calipahan', 'Campos', 'Collado', 'Dimasalang', 'Esguerra', 'Homestead I', 'Homestead II', 
    'Kinalanguyan', 'La Torre', 'Maestrang Kikay'],
    
  'Bongabon': ['Ariendo', 'Bantug', 'Calaanan', 'Curva', 'Digmala', 'Labi', 'Larcon', 'Libsong', 'Lusok', 'Macabaclay', 
    'Olivete', 'Pesa', 'Poblacion', 'Rizal', 'San Isidro', 'San Juan', 'San Roque', 'Sampalucan', 'Santor', 'Sibot', 
    'Tugatog', 'Tulay na Bato'],
    
  // Pangasinan municipalities
  'Dagupan': ['Bacayao Norte', 'Bacayao Sur', 'Balogo', 'Bolosan', 'Bonuan Binloc', 'Bonuan Boquig', 'Bonuan Gueset', 
    'Calmay', 'Carael', 'Caranglaan', 'Herrero', 'Lasip Chico', 'Lasip Grande', 'Lomboy', 'Lucao', 'Malued', 'Mamalingling', 
    'Mangin', 'Mayombo', 'Pantal', 'Poblacion Oeste', 'Pogo Chico', 'Pogo Grande', 'Pugaro Suit', 'Salapingao', 'Salisay', 
    'Tambac', 'Tebeng', 'Tapuac'],
    
  'Lingayen': ['Aliwekwek', 'Baay', 'Balangobong', 'Balococ', 'Bantayan', 'Basing', 'Capandanan', 'Domalandan Center', 
    'Domalandan East', 'Domalandan West', 'Dorongan', 'Dulag', 'Lasip', 'Libsong East', 'Libsong West', 'Malawa', 
    'Malimpuec', 'Maniboc', 'Naguelguel', 'Namolan', 'Pangapisan North', 'Pangapisan Sur', 'Poblacion', 'Quibaol', 
    'Sabangan', 'Talogtog', 'Tumbar', 'Tonton'],
    
  'San Carlos': ['Agdao', 'Anim na Cross', 'Antipangol', 'Bacnar', 'Balite', 'Ballingay', 'Baloy', 'Bantayan', 
    'Bega', 'Bogaoan', 'Bocboc', 'Bugallon-Posadas', 'Buenglat', 'Cacaritan', 'Caingal', 'Calaocan', 'Caoayan-Kiling', 
    'Cavite', 'Cobol', 'Coliling', 'Doyong', 'Gamata', 'Guelew', 'Ilang', 'Inerangan', 'Libas', 'Lilimasan', 
    'Lomboy', 'Longos', 'Lucban', 'Mabalbalino', 'Malacanang', 'Malacañang', 'Maliwara', 'Mamarlao', 'Manzon', 
    'Matagdem', 'Mipaliw', 'Naguilayan', 'Nelintap', 'Padilla-Bugallon', 'Pagal', 'Palospos', 'Parac-Parac', 
    'Payapa', 'Payar', 'PNR Site-Baloling', 'Polo', 'Quezon Boulevard', 'Rizal', 'Salinap', 'San Juan', 
    'San Pedro-Taloy', 'Sapinit', 'Supo', 'Talang', 'Tambac', 'Tandoc', 'Tarece', 'Tarectec', 'Tamayo', 'Turac'],
    
  'Urdaneta': ['Anonas', 'Bactad East', 'Bactad West', 'Bayaoas', 'Camantiles', 'Catablan', 'Cabaruan', 
    'Casantaan', 'Catablan', 'Cayambanan', 'Dilan-Paurido', 'Labit Proper', 'Labit West', 'Mabanogbog', 
    'Macalong', 'Nancalobasaan', 'Nancamaliran East', 'Nancamaliran West', 'Nancayasan', 'Oltama']
  
  // More municipalities can be added here as needed
};

const availableMunicipalities = ref([]);
const availableBarangays = ref([]);

// Load municipalities based on selected province
const loadMunicipalities = () => {
  if (editForm.value.address.province) {
    availableMunicipalities.value = municipalitiesByProvince[editForm.value.address.province] || [];
    editForm.value.address.municipality = ''; // Reset municipality
    editForm.value.address.barangay = ''; // Reset barangay
    availableBarangays.value = []; // Reset barangay list
  } else {
    availableMunicipalities.value = [];
    editForm.value.address.municipality = '';
    editForm.value.address.barangay = '';
    availableBarangays.value = [];
  }
};

// Load barangays based on selected municipality
const loadBarangays = () => {
  if (editForm.value.address.municipality) {
    availableBarangays.value = barangaysByMunicipality[editForm.value.address.municipality] || [];
    editForm.value.address.barangay = ''; // Reset barangay
  } else {
    availableBarangays.value = [];
    editForm.value.address.barangay = '';
  }
};

// Add customAddress reactive object
const customAddress = reactive({
  province: false,
  municipality: false,
  barangay: false
});

onMounted(async () => {
  // Initialize available sections and majors with default values
  setYearBasedOptions('');
  // Default to show all students
  filters.assignment = ''
  
  // Fetch classes and students
  await fetchClasses();
  
  // Then fetch students with updated class assignments
  await fetchStudents();
  
  // Check if we need to open a specific student from notification
  if (route.query.viewStudent) {
    const studentId = route.query.viewStudent;
    const student = allStudents.value.find(s => s._id === studentId);
    if (student) {
      viewStudent(student);
    }
  }
});

function handleSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFiltersAndPagination()
  }, 300)
}

async function fetchClasses() {
  try {
    const response = await classService.getAll()
    classes.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch classes:', error)
    notificationService.error('Failed to load classes. Please try again.')
    classes.value = []
  }
}

async function fetchStudents() {
  try {
    loading.value = true;
    console.log('Fetching students with status: active');
    
    const response = await studentService.getAll({status: 'active'});
    console.log('Student data received:', response);
    
    if (Array.isArray(response)) {
      allStudents.value = response;
      console.log(`Loaded ${response.length} students successfully`);
      
      // Check if there are unassigned students and notify
      const unassignedCount = response.filter(
        student => !student.class || student.class === "" || student.class === null
      ).length;
      
      if (unassignedCount > 0) {
        console.warn(`Found ${unassignedCount} students with missing class assignments`);
        notificationService.showInfo(`${unassignedCount} students are currently unassigned. Use Assign Selected Students to place them.`);
      }
    } else {
      console.error('Unexpected response format:', response);
      allStudents.value = [];
      notificationService.error('Received invalid data format from server');
    }
    
    // Apply filters and pagination
    applyFiltersAndPagination();
  } catch (error) {
    console.error('Failed to fetch students:', error);
    notificationService.error('Failed to load students. Please try again.');
    allStudents.value = [];
    students.value = [];
  } finally {
    loading.value = false;
  }
}

function applyFiltersAndPagination() {
  // Filter students based on selection
  const filtered = filterStudents(allStudents.value)
  
  // Calculate pagination
  const page = pagination.value.currentPage
  const perPage = pagination.value.itemsPerPage
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  
  // Ensure current page isn't out of bounds
  if (page > totalPages) {
    pagination.value.currentPage = totalPages
  }
  
  const from = total === 0 ? 0 : (pagination.value.currentPage - 1) * perPage + 1
  const to = Math.min(pagination.value.currentPage * perPage, total)
  
  // Update pagination state
  pagination.value = {
    ...pagination.value,
    total,
    from,
    to,
    totalPages
  }
  
  // Get current page data
  students.value = filtered.slice(from - 1, to)
}

function filterStudents(studentsData) {
  const processed = studentsData.filter(student => {
    // Skip any null or invalid student objects
    if (!student) return false;
    
    // Get class information, checking all possible sources
    let yearLevel, section, major;
    
    // Handle different ways class info can be stored
    if (student.class) {
      // Handle both populated class objects and class IDs
      const classObj = typeof student.class === 'object' ? student.class : 
                     classes.value.find(c => c._id === student.class);
      
      if (classObj) {
        yearLevel = classObj.yearLevel;
        section = classObj.section;
        major = classObj.major;
      }
    } else if (student.classInfo) {
      // For pending registrations with classInfo
      yearLevel = student.classInfo.yearLevel;
      section = student.classInfo.section;
      major = student.classInfo.major || student.major;
    } else if (student.classDetails) {
      // For students with classDetails
      yearLevel = student.classDetails.yearLevel;
      section = student.classDetails.section;
      major = student.classDetails.major || student.major;
    }
    
    // Filter by year level
    if (filters.yearLevel && yearLevel) {
      // Handle year level with or without suffix (2 vs 2nd)
      const normalizedYearLevel = yearLevel.toString().replace(/[^0-9]/g, '');
      const filterYearLevel = filters.yearLevel.toString();
      
      if (normalizedYearLevel !== filterYearLevel) {
        return false;
      }
    }
    
    // Filter by section
    if (filters.section && section) {
      // Normalize section format for comparison
      const normalizedSection = section.replace(/\s*-\s*/g, '-');
      const normalizedFilterSection = filters.section.replace(/\s*-\s*/g, '-');
      
      if (normalizedSection !== normalizedFilterSection) {
        return false;
      }
    }
    
    // Filter by major
    if (filters.major && major) {
      if (major !== filters.major) {
        return false;
      }
    }
    
    // Filter by assignment status
    if (filters.assignment) {
      const isAssigned = Boolean(student.class || student.classInfo || student.classDetails)
      if (filters.assignment === 'assigned' && !isAssigned) return false
      if (filters.assignment === 'unassigned' && isAssigned) return false
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const fullName = `${student.user?.firstName || ''} ${student.user?.middleName || ''} ${student.user?.lastName || ''}`.toLowerCase();
      const idNumber = student.user?.idNumber?.toLowerCase() || '';
      const email = student.user?.email?.toLowerCase() || '';
      
      if (!fullName.includes(searchTerm) && !idNumber.includes(searchTerm) && !email.includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });

  // Optional: sort unassigned first if filtering is not explicitly set
  if (!filters.assignment) {
    processed.sort((a, b) => {
      const aAssigned = Boolean(a.class || a.classInfo || a.classDetails)
      const bAssigned = Boolean(b.class || b.classInfo || b.classDetails)
      if (aAssigned === bAssigned) return 0
      return aAssigned ? 1 : -1
    })
  }

  return processed
}

function changePage(page) {
  pagination.value.currentPage = page
  applyFiltersAndPagination()
}

function getInitials(student) {
  if (!student || !student.user) return '--';
  
  const firstName = student.user.firstName || '';
  const lastName = student.user.lastName || '';
  
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

function getClassName(classData, student) {
  // Handle different ways class info can be stored
  if (!classData) {
    // Try getting from classInfo object (for pending registrations)
    if (student?.classInfo) {
      return formatClassInfo(student.classInfo);
    }
    // Try getting from classDetails
    if (student?.classDetails) {
      return formatClassInfo(student.classDetails);
    }
    return 'Not Assigned';
  }
  
  // Handle both when classData is an ID or when it's already the class object
  const classItem = typeof classData === 'object' ? classData : 
                   classes.value.find(c => c._id === classData);
                   
  if (!classItem) return 'Unknown Class';
  
  return formatClassInfo(classItem);
}

// Helper function to format class info consistently
function formatClassInfo(classInfo) {
  if (!classInfo) return 'Not Assigned';
  
  let displayText = '';
  
  if (classInfo.yearLevel) {
    // Normalize yearLevel to add suffix if not present
    let yearLevel = classInfo.yearLevel;
    
    // Strip any existing suffix first (2nd → 2, 3rd → 3)
    if (typeof yearLevel === 'string' && 
        (yearLevel.endsWith('nd') || yearLevel.endsWith('rd') || yearLevel.endsWith('th'))) {
      yearLevel = yearLevel.replace(/[^0-9]/g, '');
    }
    
    displayText += yearLevel;
    
    // Add suffix to year level
    if (yearLevel === '1' || yearLevel === 1) displayText += 'st';
    else if (yearLevel === '2' || yearLevel === 2) displayText += 'nd';
    else if (yearLevel === '3' || yearLevel === 3) displayText += 'rd';
    else displayText += 'th';
    
    displayText += ' Year';
  }
  
  if (classInfo.section) {
    displayText += ` - ${classInfo.section}`;
  }
  
  if (classInfo.major) {
    displayText += ` (${classInfo.major})`;
  }
  
  return displayText || 'Not Assigned';
}

function openImportModal() {
  console.log('Open import students modal')
  // To be implemented
}

function viewStudent(student) {
  console.log('View student', student);
  currentStudent.value = student;
  clearModalData(); // Clear previous data
  showViewModal.value = true;
}

function editStudent(student) {
  console.log('Edit student', student);
  currentStudent.value = student;
  
  // Reset custom address flags
  customAddress.province = false;
  customAddress.municipality = false;
  customAddress.barangay = false;
  
  // Initialize form data
  if (student && student.user) {
    // Create a structured address object if it doesn't exist
    let addressObj = student.address || {};
    if (typeof addressObj === 'string') {
      // If address is still a string, convert to an empty object
      addressObj = {
        block: '',
        street: '',
        barangay: '',
        municipality: '',
        province: ''
      };
    }
    
    editForm.value = {
      firstName: student.user.firstName || '',
      middleName: student.user.middleName || '',
      lastName: student.user.lastName || '',
      nameExtension: student.user.nameExtension || '',
      email: student.user.email || '',
      idNumber: student.user.idNumber || '',
      contactNumber: student.contactNumber || '',
      address: {
        block: addressObj.block || '',
        street: addressObj.street || '',
        barangay: addressObj.barangay || '',
        municipality: addressObj.municipality || '',
        province: addressObj.province || ''
      },
      gender: student.gender || '',
      major: student.major || '',
      yearLevel: student.yearLevel || '',
      section: student.section || ''
    };
    
    // Check if province exists in the predefined list
    if (editForm.value.address.province) {
      if (provinces.includes(editForm.value.address.province)) {
        availableMunicipalities.value = municipalitiesByProvince[editForm.value.address.province] || [];
        
        // Check if municipality exists in the predefined list
        if (editForm.value.address.municipality && availableMunicipalities.value.includes(editForm.value.address.municipality)) {
          availableBarangays.value = barangaysByMunicipality[editForm.value.address.municipality] || [];
          
          // Check if barangay is custom
          if (editForm.value.address.barangay && !availableBarangays.value.includes(editForm.value.address.barangay)) {
            customAddress.barangay = true;
          }
        } else if (editForm.value.address.municipality) {
          // Custom municipality
          customAddress.municipality = true;
          customAddress.barangay = Boolean(editForm.value.address.barangay);
        }
      } else {
        // Custom province
        customAddress.province = true;
        customAddress.municipality = Boolean(editForm.value.address.municipality);
        customAddress.barangay = Boolean(editForm.value.address.barangay);
      }
    }
  }
  
  showEditModal.value = true;
}

async function updateStudent() {
  try {
    if (!currentStudent.value) return;
    
    console.log('Updating student with data:', editForm.value);
    
    const studentData = {
      firstName: editForm.value.firstName,
      middleName: editForm.value.middleName,
      lastName: editForm.value.lastName,
      nameExtension: editForm.value.nameExtension,
      email: editForm.value.email,
      idNumber: editForm.value.idNumber,
      contactNumber: editForm.value.contactNumber,
      address: editForm.value.address,
      gender: editForm.value.gender,
      major: editForm.value.major,
      yearLevel: editForm.value.yearLevel,
      section: editForm.value.section
    };
    
    const response = await studentService.update(currentStudent.value._id, studentData);
    
    if (response) {
      notificationService.showSuccess('Student updated successfully');
      showEditModal.value = false;
      
      // Refresh student list
      await fetchStudents();
    }
  } catch (error) {
    console.error('Error updating student:', error);
    notificationService.showError('Failed to update student: ' + error.message);
  }
}

// Set the year-based options for sections and majors
function setYearBasedOptions(yearLevel) {
  // Set available sections based on year level
  if (yearLevel === '2') {
    availableSections.value = ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'];
    availableMajors.value = ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'];
  } else if (yearLevel === '3') {
    availableSections.value = ['South-1', 'South-2', 'South-3'];
    availableMajors.value = ['Business Informatics', 'System Development'];
  } else if (yearLevel === '4') {
    availableSections.value = ['South-1', 'South-2'];
    availableMajors.value = ['Business Informatics', 'System Development'];
  } else {
    // Default/empty selection - show all options
    availableSections.value = ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'];
    availableMajors.value = ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'];
  }
}

// Handle year level change
function onYearLevelChange() {
  // Update available sections and majors based on year level
  setYearBasedOptions(filters.yearLevel);
  
  // Reset section and major if they're no longer valid for the selected year
  if (!availableSections.value.includes(filters.section)) {
    filters.section = '';
  }
  
  if (!availableMajors.value.includes(filters.major)) {
    filters.major = '';
  }
  
  applyFiltersAndPagination();
}

// Combined function to handle student assignment
async function assignStudentsToClasses() {
  if (selectedStudents.value.length === 0) {
    notificationService.showWarning('Please select at least one student to assign');
    return;
  }

  assigningClasses.value = true;
  try {
    console.log(`Assigning ${selectedStudents.value.length} selected students to classes...`);
    
    // Call the API to assign only the selected students
    const response = await studentService.assignSelectedStudentsToClasses(selectedStudents.value);
    
    if (response && response.success) {
      notificationService.showSuccess(`Successfully assigned ${response.assignedCount || selectedStudents.value.length} students to classes`);
      
      // Refresh the student list
      await fetchStudents();
      
      // Clear selection after successful assignment
      selectedStudents.value = [];
    } else {
      throw new Error(response?.message || 'Unknown error occurred during assignment');
    }
  } catch (error) {
    console.error('Error assigning students to classes:', error);
    notificationService.showError('Failed to assign students: ' + error.message);
  } finally {
    assigningClasses.value = false;
  }
}

async function refreshStudents() {
  await fetchStudents()
}

// Add methods for handling custom address fields
const resetCustomProvince = () => {
  customAddress.province = false;
  editForm.value.address.province = '';
  editForm.value.address.municipality = '';
  editForm.value.address.barangay = '';
  availableMunicipalities.value = [];
  availableBarangays.value = [];
};

const resetCustomMunicipality = () => {
  customAddress.municipality = false;
  editForm.value.address.municipality = '';
  editForm.value.address.barangay = '';
  
  // If a province is selected, load municipalities based on that province
  if (editForm.value.address.province) {
    loadMunicipalities();
  } else {
    availableMunicipalities.value = [];
  }
  
  availableBarangays.value = [];
};

const resetCustomBarangay = () => {
  customAddress.barangay = false;
  editForm.value.address.barangay = '';
  
  // If a municipality is selected, load barangays based on that municipality
  if (editForm.value.address.municipality) {
    loadBarangays();
  } else {
    availableBarangays.value = [];
  }
};

// Add the selectedStudents array to the reactive state
// Add to the state section with other refs
const selectedStudents = ref([]);
const areAllStudentsSelected = computed(() => {
  return students.value.length > 0 && selectedStudents.value.length === students.value.length;
});

// Add the toggle function for selecting all students
// Add this function with the other functions
function toggleSelectAll(event) {
  if (event.target.checked) {
    // Select all students
    selectedStudents.value = students.value.map(student => student._id);
  } else {
    // Deselect all students
    selectedStudents.value = [];
  }
}

// Enhanced student modal functions
function loadSessionsTab() {
  activeTab.value = 'sessions';
  if (!sessionData.value && currentStudent.value) {
    loadStudentSessions();
  }
}

function loadHistoryTab() {
  activeTab.value = 'history';
  if (!historyData.value && currentStudent.value) {
    loadStudentHistory();
  }
}

async function loadStudentSessions() {
  if (!currentStudent.value) return;
  
  try {
    loadingSessions.value = true;
    const response = await api.get(`/students/${currentStudent.value._id}/sessions`);
    if (response.data.success) {
      sessionData.value = response.data.data;
    }
  } catch (error) {
    console.error('Error loading student sessions:', error);
    notificationService.showError('Failed to load session data');
  } finally {
    loadingSessions.value = false;
  }
}

async function loadStudentHistory() {
  if (!currentStudent.value) return;
  
  try {
    loadingHistory.value = true;
    const response = await api.get(`/students/${currentStudent.value._id}/history`);
    if (response.data.success) {
      historyData.value = response.data.data;
    }
  } catch (error) {
    console.error('Error loading student history:', error);
    notificationService.showError('Failed to load history data');
  } finally {
    loadingHistory.value = false;
  }
}

function toggleHistoryExpanded(schoolYear, semester) {
  const key = `${schoolYear}-${semester}`;
  expandedHistory.value[key] = !expandedHistory.value[key];
}

// Drop student functions
function openDropModal() {
  if (!currentStudent.value) return;
  dropForm.value.reason = '';
  dropForm.value.semester = '';
  showDropModal.value = true;
}

// Helper to open drop modal from the view modal and ensure stacking order
function openDropFromView() {
  openDropModal();
  showViewModal.value = false;
}

function closeDropModal() {
  showDropModal.value = false;
  dropForm.value.reason = '';
  dropForm.value.semester = '';
}

async function confirmDropStudent() {
  if (!currentStudent.value || !dropForm.value.reason || !dropForm.value.semester) {
    notificationService.showError('Please fill in all required fields');
    return;
  }

  try {
    droppingStudent.value = true;
    const response = await api.post('/students/drop', {
      studentId: currentStudent.value._id,
      classId: currentStudent.value.class?._id,
      reason: dropForm.value.reason,
      semester: dropForm.value.semester
    });

    if (response.data.success) {
      notificationService.showSuccess(`Student ${currentStudent.value.user?.firstName} ${currentStudent.value.user?.lastName} has been dropped`);
      
      // Update current student status
      currentStudent.value.status = 'dropped';
      currentStudent.value.dropDate = new Date();
      currentStudent.value.dropReason = dropForm.value.reason;
      currentStudent.value.dropSemester = dropForm.value.semester;
      
      // Refresh the students list
      await loadStudents();
      
      // Close modal
      closeDropModal();
    } else {
      throw new Error(response.data.message || 'Failed to drop student');
    }
  } catch (error) {
    console.error('Error dropping student:', error);
    notificationService.showError(`Failed to drop student: ${error.message}`);
  } finally {
    droppingStudent.value = false;
  }
}

async function reactivateStudent() {
  if (!currentStudent.value || currentStudent.value.status !== 'dropped') {
    notificationService.showError('Can only reactivate dropped students');
    return;
  }

  try {
    const response = await api.post(`/students/${currentStudent.value._id}/reactivate`);
    
    if (response.data.success) {
      notificationService.showSuccess(`Student ${currentStudent.value.user?.firstName} ${currentStudent.value.user?.lastName} has been reactivated`);
      
      // Update current student status
      currentStudent.value.status = 'active';
      currentStudent.value.dropDate = null;
      currentStudent.value.dropReason = null;
      currentStudent.value.dropSemester = null;
      
      // Refresh the students list
      await loadStudents();
    } else {
      throw new Error(response.data.message || 'Failed to reactivate student');
    }
  } catch (error) {
    console.error('Error reactivating student:', error);
    notificationService.showError(`Failed to reactivate student: ${error.message}`);
  }
}

// Clear session and history data when modal is closed
function clearModalData() {
  activeTab.value = 'basic';
  sessionData.value = null;
  historyData.value = null;
  expandedHistory.value = {};
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
}
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Primary and accent colors */
.bg-primary {
  background-color: #3B82F6;
}
.bg-primary-dark {
  background-color: #2563EB;
}
.text-primary {
  color: #3B82F6;
}
</style> 