<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
  <div>
            <h1 class="text-2xl font-normal text-gray-800">Advisory Classes</h1>
            <p class="text-gray-500 mt-1 font-normal">Manage class-adviser assignments and schedules</p>
    </div>
          <div class="flex items-center space-x-4">
            <select 
              v-model="statusFilter" 
              @change="filterAdvisoryClasses"
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          
            <!-- View Toggle -->
            <div class="flex bg-gray-100 rounded-lg p-1">
            <button 
              @click="viewMode = 'list'" 
                class="px-3 py-1.5 rounded-md text-sm font-normal transition-colors"
                :class="viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'"
            >
              <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                  List
              </span>
            </button>
            <button 
              @click="viewMode = 'calendar'" 
                class="px-3 py-1.5 rounded-md text-sm font-normal transition-colors"
                :class="viewMode === 'calendar' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'"
            >
              <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
                </svg>
                  Calendar
              </span>
            </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- List View -->
      <div v-if="viewMode === 'list'" class="bg-white rounded-lg shadow-sm border border-gray-200">
        <!-- Search Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center">
            <div class="relative max-w-md">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input 
                v-model="search" 
                type="text" 
                placeholder="Search classes or advisers" 
                class="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                @input="filterAdvisoryClasses"
              />
            </div>
          </div>
        </div>
        
        <!-- Table Content -->
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adviser</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
            <tbody class="divide-y divide-gray-200">
          <tr v-if="loading">
                <td colspan="3" class="px-6 py-12 text-center">
                  <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span class="ml-3 text-gray-500">Loading advisory classes...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredClasses.length === 0">
                <td colspan="3" class="px-6 py-12 text-center">
                  <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443a55.381 55.381 0 015.25 2.882V15" />
                    </svg>
                  </div>
                  <h3 class="text-base font-normal text-gray-800 mb-1">
                    {{ search ? 'No classes found' : 'No advisory classes yet' }}
                  </h3>
                  <p class="text-gray-500 font-normal">
                    {{ search ? 'Try adjusting your search criteria' : 'Classes will appear here once created' }}
                  </p>
            </td>
          </tr>
          <tr v-for="advisoryClass in filteredClasses" :key="advisoryClass._id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span class="text-sm font-normal text-blue-600">
                        {{ getClassName(advisoryClass).charAt(0) }}
                      </span>
                    </div>
                    <div>
                      <div class="text-sm font-normal text-gray-800">{{ getClassName(advisoryClass) }}</div>
              <div class="flex space-x-2 mt-1">
                <span 
                  v-if="hasSecondSemester(advisoryClass)" 
                          class="px-2 py-0.5 text-xs font-normal rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  2nd Sem
                </span>
                      </div>
                    </div>
              </div>
            </td>
                <td class="px-6 py-4 text-sm text-gray-800">
              {{ getAdviserName(advisoryClass.adviser) }}
            </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end space-x-2">
              <span 
                v-if="advisoryClass.status === 'archived'" 
                      class="px-2 py-1 text-xs font-normal rounded-md bg-gray-50 text-gray-700 border border-gray-200 mr-2"
              >
                Archived
              </span>
              <button 
                @click="viewDetails(advisoryClass)" 
                      class="px-3 py-1.5 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              >
                Details
              </button>
              <button 
                @click="editAdvisoryClass(advisoryClass)" 
                      class="px-3 py-1.5 text-xs font-normal text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
              >
                Edit
              </button>
              <button
                v-if="advisoryClass.adviser && advisoryClass._id && !advisoryClass._id.startsWith('temp_')"
                @click="unassignAdviser(advisoryClass)"
                class="px-3 py-1.5 text-xs font-normal text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
              >
                Unassign
              </button>
                  </div>
            </td>
          </tr>
        </tbody>
      </table>
        </div>
      </div>
      
      <!-- Calendar View -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6">
          <!-- Calendar Controls -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
        <!-- Year Level Tabs -->
              <div class="flex bg-gray-100 rounded-lg p-1">
            <button 
              @click="selectedYearLevel = ''" 
                  class="px-4 py-1.5 rounded-md text-sm font-normal transition-colors"
                  :class="selectedYearLevel === '' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'"
            >
              All Years
            </button>
            <button 
              v-for="yearLevel in yearLevels" 
              :key="yearLevel" 
              @click="selectedYearLevel = yearLevel"
                  class="px-4 py-1.5 rounded-md text-sm font-normal transition-colors"
                  :class="selectedYearLevel === yearLevel ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'"
            >
              {{ yearLevel }} Year
            </button>
              </div>
        </div>
        
            <div class="flex items-center space-x-4">
        <!-- Semester Selection -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button 
              @click="selectedSemester = '1st'" 
                  class="px-4 py-1.5 rounded-md text-sm font-normal transition-colors"
                  :class="selectedSemester === '1st' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'"
            >
              1st Semester
            </button>
            <button 
              @click="selectedSemester = '2nd'" 
                  class="px-4 py-1.5 rounded-md text-sm font-normal transition-colors"
                  :class="selectedSemester === '2nd' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'"
            >
              2nd Semester
            </button>
          </div>
          
          <!-- Room Selection -->
          <select 
            v-model="selectedRoom" 
                class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Rooms</option>
            <option v-for="room in availableRooms.filter(r => r !== 'all')" :key="room" :value="room">
              Room {{ room }}
            </option>
          </select>
            </div>
        </div>
        
          <!-- Calendar Content -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span class="ml-3 text-gray-500">Loading class schedule...</span>
        </div>
        
          <div v-else-if="filteredCalendarClasses.length === 0" class="text-center py-12">
            <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
          </svg>
            </div>
            <h3 class="text-base font-normal text-gray-800 mb-1">No Classes Found</h3>
            <p class="text-gray-500 font-normal max-w-md mx-auto">
            No classes found for {{ selectedYearLevel ? selectedYearLevel + ' Year' : 'All Years' }}, {{ selectedSemester === '1st' ? '1st' : '2nd' }} Semester. 
            Try selecting a different year level or semester.
          </p>
        </div>
        
          <div v-else class="border border-gray-200 rounded-lg overflow-hidden">
          <!-- Calendar Grid Header -->
          <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
            <div class="py-3 px-4 text-gray-500 text-sm font-medium border-r border-gray-200">Time</div>
            <div v-for="day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day" 
                 class="py-3 px-4 text-gray-500 text-sm font-medium text-center">
              {{ day }}
            </div>
          </div>
          
          <!-- Calendar container with relative positioning -->
          <div class="relative">
            <!-- Calendar Grid Body -->
            <div class="divide-y divide-gray-200">
              <div v-for="(timeSlot, index) in timeSlots" :key="index" class="grid grid-cols-6">
                <!-- Time Label -->
                <div class="py-2 px-2 text-xs font-medium text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
                  {{ timeSlot }}
                </div>
                
                <!-- Day Columns - Empty cells to maintain grid structure -->
                <div v-for="day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day" 
                     class="relative p-0 min-h-[90px] border-r border-gray-100">
                </div>
              </div>
            </div>
            
            <!-- Absolutely positioned class blocks -->
            <div 
              v-for="(classBlock, index) in getPositionedClassBlocks()" 
              :key="index"
              class="absolute rounded-md text-sm bg-opacity-95 cursor-pointer overflow-hidden z-10 shadow-sm flex flex-col border"
              :class="getClassColorClasses(classBlock.class)"
              :style="{
                left: `calc(${classBlock.dayIndex * 16.67}% + 16.67% + 1px)`, 
                top: `${classBlock.top + 0}px`,
                height: `${classBlock.height}px`,
                width: 'calc(16.67% - 2px)'
              }"
              @click="viewDetails(classBlock.class)"
            >
              <div class="font-medium text-base truncate p-2">{{ getClassName(classBlock.class) }}</div>
              <div class="text-xs flex flex-col justify-between px-2 pb-2 flex-grow">
                <span class="truncate font-medium">{{ getSubjectName(classBlock.class) }}</span>
                <div class="mt-1 flex flex-col">
                  <span class="rounded-full px-2 py-0.5 bg-white bg-opacity-40 text-xs mt-1 inline-block w-max">
                    Room {{ classBlock.room || getClassRoom(classBlock.class) }}
                  </span>
                  <span class="text-xs mt-1">
                    {{ classBlock.startTime }} - {{ classBlock.endTime }}
                  </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeDetailsModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Advisory Class Details</h3>
          <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <!-- Basic Information -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 class="text-sm font-medium text-gray-800 mb-3">Class Information</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
                <span class="text-gray-500">Class:</span>
                <span class="ml-2 text-gray-800">{{ getClassName(selectedAdvisoryClass) }}</span>
          </div>
          <div>
                <span class="text-gray-500">Adviser:</span>
                <span class="ml-2 text-gray-800">{{ getAdviserName(selectedAdvisoryClass?.adviser) }}</span>
          </div>
              <div v-if="selectedAdvisoryClass?.adviser">
                <span class="text-gray-500">Email:</span>
                <span class="ml-2 text-gray-800">{{ selectedAdvisoryClass?.adviser?.email || 'Not provided' }}</span>
        </div>
      </div>
        </div>

        <!-- Class Schedule Information -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-3">Class Schedule</h4>
          
          <!-- Tabs for Semesters -->
          <div class="mb-4">
            <div class="flex bg-gray-100 rounded-lg p-1 inline-flex">
              <button 
                @click="activeDetailsSemester = '1st'" 
                  class="px-4 py-1.5 rounded-md text-sm font-normal transition-colors"
                  :class="activeDetailsSemester === '1st' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'"
              >
                1st Semester
              </button>
              <button 
                @click="activeDetailsSemester = '2nd'" 
                  class="px-4 py-1.5 rounded-md text-sm font-normal transition-colors"
                  :class="activeDetailsSemester === '2nd' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'"
              >
                2nd Semester
              </button>
            </div>
          </div>
          
          <!-- First Semester Details -->
          <div v-if="activeDetailsSemester === '1st'" class="space-y-4">
              <div v-if="hasFirstSemester(selectedAdvisoryClass)" class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="text-gray-500">Subject:</span>
                    <span class="ml-2 text-gray-800">{{ getFirstSemesterSubjectName(selectedAdvisoryClass) }}</span>
                </div>
                <div>
                    <span class="text-gray-500">Room:</span>
                    <span class="ml-2 text-gray-800">{{ getFirstSemesterRoom(selectedAdvisoryClass) }}</span>
                </div>
                <div>
                    <span class="text-gray-500">Day:</span>
                    <span class="ml-2 text-gray-800">{{ getFirstSemesterDay(selectedAdvisoryClass) }}</span>
                </div>
                <div>
                    <span class="text-gray-500">Time:</span>
                    <span class="ml-2 text-gray-800">{{ getFirstSemesterTime(selectedAdvisoryClass) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              No 1st semester schedule information available
            </div>
          </div>
          
          <!-- Second Semester Details -->
          <div v-else class="space-y-4">
              <div v-if="hasSecondSemester(selectedAdvisoryClass)" class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="text-gray-500">Subject:</span>
                    <span class="ml-2 text-gray-800">{{ getSecondSemesterSubjectName(selectedAdvisoryClass) }}</span>
                </div>
                <div>
                    <span class="text-gray-500">Room:</span>
                    <span class="ml-2 text-gray-800">{{ getSecondSemesterRoom(selectedAdvisoryClass) }}</span>
                </div>
                <div>
                    <span class="text-gray-500">Day:</span>
                    <span class="ml-2 text-gray-800">{{ getSecondSemesterDay(selectedAdvisoryClass) }}</span>
                </div>
                <div>
                    <span class="text-gray-500">Time:</span>
                    <span class="ml-2 text-gray-800">{{ getSecondSemesterTime(selectedAdvisoryClass) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              No 2nd semester schedule information available
            </div>
          </div>
        </div>
        
        <!-- Students in Advisory Class Section -->
          <div>
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-sm font-medium text-gray-800">Students in this Class</h4>
            <button 
              @click="toggleStudentList" 
                class="flex items-center text-sm text-blue-600 hover:text-blue-700 focus:outline-none"
            >
              <span>{{ showStudents ? 'Hide Students' : 'Show Students' }}</span>
                <svg class="w-4 h-4 ml-1 transition-transform" :class="{'rotate-180': showStudents}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
          
          <div v-if="showStudents">
              <div v-if="loadingStudents" class="flex justify-center items-center p-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span class="ml-3 text-gray-500">Loading students...</span>
              </div>
              
              <div v-else-if="students.length === 0" class="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div class="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <p class="text-sm text-gray-500">No students found for this class</p>
                <button 
                  @click="fetchStudentsInClass" 
                  class="mt-2 px-3 py-1.5 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                >
                  Refresh List
                </button>
              </div>
              
              <div v-else class="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div class="px-4 py-3 bg-white border-b border-gray-200">
                  <div class="flex justify-between items-center">
                    <h5 class="text-sm font-medium text-gray-800">Students ({{ students.length }})</h5>
                <button 
                  @click="fetchStudentsInClass" 
                      class="px-3 py-1.5 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                      :disabled="loadingStudents"
                >
                      <span v-if="loadingStudents">Loading...</span>
                      <span v-else>Refresh</span>
                </button>
                  </div>
              </div>
              
                <div class="max-h-64 overflow-y-auto">
                  <table class="min-w-full">
                    <thead class="bg-gray-50 sticky top-0">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="student in students" :key="student._id" class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm font-medium text-gray-800">
                        {{ getUserField(student, 'idNumber') || 'N/A' }}
                      </td>
                        <td class="px-4 py-3 text-sm text-gray-600">
                        {{ getFullName(student) }}
                      </td>
                        <td class="px-4 py-3 text-sm text-gray-600">
                        {{ getUserField(student, 'email') || 'N/A' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            @click="closeDetailsModal"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
          <button
            @click="editAdvisoryClass(selectedAdvisoryClass); closeDetailsModal();"
            class="px-4 py-2 text-sm font-normal text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Edit
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Advisory Class Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeEditModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Edit Advisory Class</h3>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Adviser *</label>
            <select
              v-model="editedAdvisoryClass.adviserId"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.adviserId }"
            >
              <option value="">Select Adviser</option>
              <option v-for="adviser in advisers" :key="adviser._id" :value="adviser._id">
                {{ adviser.salutation }} {{ adviser.firstName }} {{ adviser.lastName }}
              </option>
            </select>
            <p v-if="errors.adviserId" class="mt-1 text-sm text-red-600">{{ errors.adviserId }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Class *</label>
            <select
              v-model="editedAdvisoryClass.classId"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.classId }"
            >
              <option value="">Select Class</option>
              <option v-for="classItem in classes" :key="classItem._id" :value="classItem._id">
                {{ classItem.yearLevel }} Year - {{ classItem.section }} ({{ classItem.major }})
              </option>
            </select>
            <p v-if="errors.classId" class="mt-1 text-sm text-red-600">{{ errors.classId }}</p>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
          <button
            @click="closeEditModal"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="updateAdvisoryClass"
            class="px-4 py-2 text-sm font-normal text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { adviserService } from '../../services/adviserService';
import { classService } from '../../services/classService';
import { notificationService } from '../../services/notificationService';
import api from '../../services/api';
import { studentService } from '../../services/studentService';

// State
const advisoryClasses = ref([]);
const filteredClasses = ref([]);
const loading = ref(true);
const search = ref('');
const statusFilter = ref('active');
const showAddModal = ref(false);
const advisers = ref([]);
const classes = ref([]);
const loadingAdvisers = ref(false);
const loadingClasses = ref(false);
const showDetailsModal = ref(false);
const showEditModal = ref(false);
const selectedAdvisoryClass = ref(null);
const editedAdvisoryClass = reactive({
  adviserId: '',
  classId: '',
  _id: '',
  status: 'active'
});

// For details modal
const activeDetailsSemester = ref('1st');

// Form state
const newAdvisoryClass = reactive({
  adviserId: '',
  classId: ''
});

// Error state
const errors = reactive({
  adviserId: '',
  classId: '',
  status: ''
});

// Unassign adviser from a class
async function unassignAdviser(advisoryClass) {
  try {
    if (!advisoryClass?._id || advisoryClass._id.startsWith('temp_')) return;
    const confirmMsg = `Unassign ${getAdviserName(advisoryClass.adviser)} from ${getClassName(advisoryClass)}?`;
    if (!confirm(confirmMsg)) return;

    await api.put(`/advisers/advisory/classes/${advisoryClass._id}`, {
      adviser: null,
      class: advisoryClass.class?._id || advisoryClass.class,
      status: 'active'
    });

    await fetchAdvisoryClasses();
    notificationService.showSuccess('Adviser unassigned from class');
  } catch (error) {
    console.error('Unassign adviser failed:', error);
    // If API rejects null adviser, fallback: delete the advisory class record
    try {
      if (advisoryClass?._id && !advisoryClass._id.startsWith('temp_')) {
        await api.delete(`/advisers/advisory/classes/${advisoryClass._id}`);
        await fetchAdvisoryClasses();
        notificationService.showSuccess('Adviser unassigned by removing assignment');
      }
    } catch (fallbackError) {
      console.error('Fallback delete failed:', fallbackError);
      notificationService.showError('Failed to unassign adviser');
    }
  }
}

const showStudents = ref(false);
const students = ref([]);
const loadingStudents = ref(false);

// Calendar view state
const viewMode = ref('list');
const selectedYearLevel = ref('');
const selectedSemester = ref('1st');
const yearLevels = ref(['2nd', '3rd', '4th']);
const timeSlots = ref([
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
]);

// After selectedSemester ref declaration
const selectedRoom = ref('all');

// Add this computed property for available rooms
const availableRooms = computed(() => {
  const rooms = new Set();
  
  // Collect all rooms from the filtered classes
  filteredCalendarClasses.value.forEach(advisoryClass => {
    const classData = advisoryClass.class || advisoryClass;
    
    // Get the relevant semester data
    let semesterData;
    if (selectedSemester.value === '1st') {
      semesterData = classData.firstSemester || classData.firstSem || {};
    } else {
      semesterData = classData.secondSemester || classData.secondSem || {};
    }
    
    if (semesterData.room) {
      rooms.add(semesterData.room);
    }
  });
  
  // Convert to array and sort
  return ['all', ...Array.from(rooms).sort()];
});

onMounted(async () => {
  await fetchAdvisoryClasses();
  
  // Load year levels from system options if available
  try {
    const systemOptions = await api.get('/system-options');
    if (systemOptions?.data?.class?.yearLevels?.length > 0) {
      yearLevels.value = systemOptions.data.class.yearLevels;
    }
  } catch (error) {
    console.error('Error loading year levels from system options:', error);
  }
});

async function fetchAdvisoryClasses() {
  try {
    loading.value = true;
    
    // Get all advisory classes
    const response = await api.get('/advisers/advisory/classes');
    
    // Get any additional classes from available classes endpoint (classes without advisers yet)
    const availableResponse = await api.get('/advisers/advisory/available-classes');
    
    // Create temporary advisory class entries for any classes that aren't in an advisory class yet
    const tempAdvisoryClasses = availableResponse.data.map(classItem => ({
      _id: 'temp_' + classItem._id, // Temporary ID
      class: classItem,
      adviser: null,
      status: 'active',
      needsAdviser: true // Custom flag to indicate this needs an adviser
    }));
    
    // Combine both sets
    const allClasses = [...response.data, ...tempAdvisoryClasses];
    
    advisoryClasses.value = allClasses;
    filterAdvisoryClasses(); // Apply current filters
    console.log(`Loaded ${response.data.length} advisory classes and ${tempAdvisoryClasses.length} unassigned classes`);
  } catch (error) {
    console.error('Error fetching advisory classes:', error);
    notificationService.showError('Failed to load advisory classes. Please try again.');
    advisoryClasses.value = [];
    filteredClasses.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchAdvisers() {
  if (advisers.value.length > 0) return;
  
  try {
    loadingAdvisers.value = true;
    const response = await adviserService.getAll();
    
    // Check if the response has data property and use it
    if (response && response.data) {
      advisers.value = response.data;
      console.log(`Loaded ${advisers.value.length} advisers for dropdown selection`);
    } else {
      console.error('Invalid response format from adviserService.getAll:', response);
      advisers.value = [];
    }
  } catch (error) {
    console.error('Error fetching advisers:', error);
    notificationService.showError('Failed to load advisers. Please try again.');
    advisers.value = [];
  } finally {
    loadingAdvisers.value = false;
  }
}

async function fetchClasses() {
  try {
    loadingClasses.value = true;
    
    // Get all classes directly using the available classes endpoint
    const response = await api.get('/advisers/advisory/available-classes');
    classes.value = response.data;
    
    console.log(`Loaded ${classes.value.length} available classes`);
  } catch (error) {
    console.error('Error fetching classes:', error);
    notificationService.showError('Failed to load classes. Please try again.');
    classes.value = [];
  } finally {
    loadingClasses.value = false;
  }
}

function filterAdvisoryClasses() {
  if (!advisoryClasses.value) {
    filteredClasses.value = [];
    return;
  }
  
  const searchTerm = search.value.toLowerCase();
  filteredClasses.value = advisoryClasses.value.filter(advisoryClass => {
    // Apply status filter
    if (statusFilter.value !== 'all' && advisoryClass.status !== statusFilter.value) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      // Check class name
      const className = getClassName(advisoryClass);
      if (className.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Check adviser name
      const adviserName = getAdviserName(advisoryClass.adviser);
      if (adviserName.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // No match found
      return false;
    }
    
    // Include all if no search term
    return true;
  });
}

// Computed property for filtered calendar classes based on year level and semester
const filteredCalendarClasses = computed(() => {
  if (!advisoryClasses.value) {
    return [];
  }
  
  return advisoryClasses.value.filter(advisoryClass => {
    // Skip archived classes
    if (advisoryClass.status === 'archived') {
      return false;
    }
    
    // Get the class data (may be directly on advisoryClass or in .class property)
    const classData = advisoryClass.class || advisoryClass;
    
    // Filter by year level if a specific year level is selected (empty string means "All Years")
    if (selectedYearLevel.value && classData.yearLevel !== selectedYearLevel.value) {
      return false;
    }
    
    // Get the relevant semester data based on the selected semester
    let semesterData;
    if (selectedSemester.value === '1st') {
      semesterData = classData.firstSemester || classData.firstSem || {};
    } else {
      semesterData = classData.secondSemester || classData.secondSem || {};
    }
    
    // Filter by room if a specific room is selected
    if (selectedRoom.value !== 'all' && semesterData.room !== selectedRoom.value) {
      return false;
    }
    
    // Filter by semester - use the helper functions to check semester availability
    if (selectedSemester.value === '1st') {
      return hasFirstSemester(advisoryClass);
    } else if (selectedSemester.value === '2nd') {
      return hasSecondSemester(advisoryClass);
    }
    
    // If no semester filter, include all
    return true;
  });
});

// Get classes for a specific time slot and day in the calendar view
function getClassesForTimeAndDay(timeSlot, day) {
  const dayMap = {
    'Monday': 'Monday',
    'Tuesday': 'Tuesday',
    'Wednesday': 'Wednesday',
    'Thursday': 'Thursday',
    'Friday': 'Friday'
  };
  
  // Map from day name to day abbreviation or code used in the database
  const dayAbbr = dayMap[day];
  
  if (!dayAbbr) return [];
  
  return filteredCalendarClasses.value.filter(advisoryClass => {
    // Get the class data (may be directly on advisoryClass or in .class property)
    const classData = advisoryClass.class || advisoryClass;
    
    // Get the relevant semester data based on the selected semester
    let semesterData;
    if (selectedSemester.value === '1st') {
      semesterData = classData.firstSemester || classData.firstSem || {};
    } else {
      semesterData = classData.secondSemester || classData.secondSem || {};
    }
    
    // Check if the day matches
    if (semesterData.daySchedule !== dayAbbr && semesterData.daySchedule !== day) {
      return false;
    }
    
    // Check if the time matches
    return doesTimeSlotOverlap(timeSlot, semesterData.timeSchedule);
  });
}

// Check if a class time schedule overlaps with a time slot
function doesTimeSlotOverlap(timeSlot, classTimeSchedule) {
  if (!classTimeSchedule) return false;
  
  // Extract start and end times from time slot (e.g., "7:00 AM - 8:00 AM")
  const [timeSlotStart, timeSlotEnd] = timeSlot.split(' - ').map(t => convertTimeToMinutes(t));
  
  // Extract start and end times from class time schedule (e.g., "9:00 AM - 11:00 AM")
  const [classStart, classEnd] = classTimeSchedule.split(' - ').map(t => convertTimeToMinutes(t));
  
  // Check for overlap (start1 < end2 AND end1 > start2)
  return timeSlotStart < classEnd && timeSlotEnd > classStart;
}

// Convert time string (e.g., "7:00 AM") to minutes since midnight
function convertTimeToMinutes(timeStr) {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  // Convert to 24-hour format
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

// Get color classes for a class in the calendar view
function getClassColorClasses(advisoryClass) {
  // Get the class data (may be directly on advisoryClass or in .class property)
  const classData = advisoryClass.class || advisoryClass;
  
  // Apply different colors based on year level or other properties
  if (classData.yearLevel === '2nd') {
    return 'bg-blue-200 text-blue-800 hover:bg-blue-300 border-blue-300';
  } else if (classData.yearLevel === '3rd') {
    return 'bg-green-200 text-green-800 hover:bg-green-300 border-green-300';
  } else if (classData.yearLevel === '4th') {
    return 'bg-purple-200 text-purple-800 hover:bg-purple-300 border-purple-300';
  } else {
    return 'bg-gray-200 text-gray-800 hover:bg-gray-300 border-gray-300';
  }
}

// Get subject name for a class in the calendar view
function getSubjectName(advisoryClass) {
  if (!advisoryClass || !advisoryClass.class) {
    return 'No subject';
  }
  
  // Get the class data
  const classData = advisoryClass.class;
  
  // Determine which semester to show based on the selected semester
  let semesterData;
  if (selectedSemester.value === '1st') {
    semesterData = classData.firstSemester || classData.firstSem || {};
  } else {
    semesterData = classData.secondSemester || classData.secondSem || {};
  }
  
  // If there's a populated subject object directly in the semester data
  if (semesterData.sspSubject && typeof semesterData.sspSubject !== 'string' && semesterData.sspSubject.sspCode) {
    return semesterData.sspSubject.sspCode;
  }
  
  // If there's a populated subject object in the main class
  if (classData.sspSubject && typeof classData.sspSubject !== 'string' && classData.sspSubject.sspCode) {
    // For first semester, only show if it's a first semester subject or unspecified
    if (selectedSemester.value === '1st') {
      const semester = classData.sspSubject.semester || '';
      if (semester.includes('1st') || !semester) {
        return classData.sspSubject.sspCode;
      }
    } 
    // For second semester, only show if it's a second semester subject
    else if (selectedSemester.value === '2nd') {
      const semester = classData.sspSubject.semester || '';
      if (semester.includes('2nd')) {
        return classData.sspSubject.sspCode;
      }
    }
  }
  
  return 'No subject';
}

// Get room for a class in the calendar view
function getClassRoom(advisoryClass) {
  const classData = advisoryClass.class || advisoryClass;
  let semesterData;
  
  if (selectedSemester.value === '1st') {
    semesterData = classData.firstSemester || classData.firstSem || {};
  } else {
    semesterData = classData.secondSemester || classData.secondSem || {};
  }
  
  return semesterData.room || 'No Room';
}

function getClassName(advisoryClass) {
  if (!advisoryClass || !advisoryClass.class) return 'Unknown Class';
  
  const classDetails = advisoryClass.class;
  const yearLevel = classDetails.yearLevel || 'Unknown';
  const section = classDetails.section || 'Unknown';
  const major = classDetails.major || 'Unknown';
  
  return `${yearLevel} Year - ${section} (${major})`;
}

function getAdviserName(adviser = {}) {
  if (!adviser) return 'No Adviser Assigned';
  
  // Format the name with middle name and name extension
  const middleInitial = adviser.middleName ? ` ${adviser.middleName.charAt(0)}.` : '';
  const nameExt = adviser.nameExtension && adviser.nameExtension !== 'N/A' ? ` ${adviser.nameExtension}` : '';
  
  return `${adviser.salutation || ''} ${adviser.firstName || ''}${middleInitial} ${adviser.lastName || ''}${nameExt}`.trim() || 'No Adviser Assigned';
}

function getFullName(student) {
  if (!student) return 'Unknown Student';
  
  // Try to get from user object
  if (student.user) {
    const firstName = student.user.firstName || '';
    const middleName = student.user.middleName ? ` ${student.user.middleName.charAt(0)}.` : '';
    const lastName = student.user.lastName || '';
    const nameExt = student.user.nameExtension && student.user.nameExtension !== 'N/A' 
      ? ` ${student.user.nameExtension}` 
      : '';
      
    return `${firstName}${middleName} ${lastName}${nameExt}`;
  }
  
  // If no user object, try from student directly (pending students)
  const firstName = student.firstName || student.pendingRegistration?.firstName || '';
  const middleName = student.middleName || student.pendingRegistration?.middleName 
    ? ` ${(student.middleName || student.pendingRegistration?.middleName).charAt(0)}.` 
    : '';
  const lastName = student.lastName || student.pendingRegistration?.lastName || '';
  const nameExt = student.nameExtension || student.pendingRegistration?.nameExtension;
  const nameExtension = nameExt && nameExt !== 'N/A' ? ` ${nameExt}` : '';
    
  return `${firstName}${middleName} ${lastName}${nameExtension}` || 'Unknown Student';
}

async function openAddModal() {
  // Reset form
  newAdvisoryClass.adviserId = '';
  newAdvisoryClass.classId = '';
  
  // Reset errors
  errors.adviserId = '';
  errors.classId = '';
  
  // Fetch advisers and classes if not already loaded
  await Promise.all([fetchAdvisers(), fetchClasses()]);
  
  // Check if advisers and classes are available
  if (advisers.value.length === 0) {
    notificationService.showWarning('No advisers available. Please add advisers first before creating an advisory class.');
    return;
  }
  
  if (classes.value.length === 0) {
    notificationService.showWarning('No classes available. Please add classes first before creating an advisory class.');
    return;
  }
  
  showAddModal.value = true;
}

function closeAddModal() {
  showAddModal.value = false;
}

function validateForm() {
  let isValid = true;
  
  // Reset errors
  errors.adviserId = '';
  errors.classId = '';
  
  if (!newAdvisoryClass.adviserId) {
    errors.adviserId = 'Adviser is required';
    isValid = false;
  }
  
  if (!newAdvisoryClass.classId) {
    errors.classId = 'Class is required';
    isValid = false;
  }
  
  return isValid;
}

async function addAdvisoryClass() {
  if (!validateForm()) {
    return;
  }
  
  try {
    // Check if the selected class already exists in the advisory classes table
    const classId = newAdvisoryClass.classId;
    const existingEntry = advisoryClasses.value.find(
      ac => ac.class?._id === classId && !ac._id.startsWith('temp_')
    );
    
    if (existingEntry) {
      // If it exists, update it with the adviser
      await api.put(`/advisers/advisory/classes/${existingEntry._id}`, {
        adviser: newAdvisoryClass.adviserId,
        class: classId,
        status: 'active'
      });
    } else {
      // Otherwise create a new entry
      await api.post('/advisers/advisory/classes', {
        adviser: newAdvisoryClass.adviserId,
        class: classId
      });
    }
    
    await fetchAdvisoryClasses();
    notificationService.showSuccess('Advisory class added successfully');
    closeAddModal();
  } catch (error) {
    console.error('Error adding advisory class:', error);
    notificationService.showError('Failed to add advisory class. Please try again later.');
  }
}

function viewDetails(advisoryClass) {
  selectedAdvisoryClass.value = advisoryClass;
  showDetailsModal.value = true;
  // Reset students state
  students.value = [];
  showStudents.value = false;
}

function toggleStudentList() {
  showStudents.value = !showStudents.value;
  if (showStudents.value && students.value.length === 0) {
    fetchStudentsInClass();
  }
}

async function fetchStudentsInClass() {
  if (!selectedAdvisoryClass.value?.class?._id) {
    console.error('No class ID provided to fetch students');
    return;
  }
  
  loadingStudents.value = true;
  try {
    console.log(`Fetching students for class ${selectedAdvisoryClass.value.class._id}`);
    
    // Fetch from the API to ensure most up-to-date data
    const response = await studentService.getStudentsByClass(selectedAdvisoryClass.value.class._id);
    
    if (response && Array.isArray(response)) {
      students.value = response;
      console.log(`Fetched ${students.value.length} students for class ${selectedAdvisoryClass.value.class._id}`);
    } else {
      console.error('Invalid response format from getStudentsByClass:', response);
      students.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch students:', error);
    notificationService.showError('Failed to load students for this class');
    students.value = [];
  } finally {
    loadingStudents.value = false;
  }
}

function getUserField(student, field) {
  if (!student) return null;
  
  // Try to get from user object first
  if (student.user && student.user[field]) {
    return student.user[field];
  }
  
  // If no user object, try the student object directly
  if (student[field]) {
    return student[field];
  }
  
  return null;
}

function closeDetailsModal() {
  showDetailsModal.value = false;
  selectedAdvisoryClass.value = null;
  // Reset students state when closing modal
  students.value = [];
  showStudents.value = false;
}

function editAdvisoryClass(advisoryClass) {
  console.log('Edit advisory class:', advisoryClass);
  
  // Reset errors
  errors.adviserId = '';
  errors.classId = '';
  errors.status = '';
  
  // Set current advisory class data
  selectedAdvisoryClass.value = { ...advisoryClass };
  
  // Check if this is a temporary unassigned class entry
  const isTemp = advisoryClass._id && advisoryClass._id.startsWith('temp_');
  
  // Set edited advisory class fields
  editedAdvisoryClass._id = isTemp ? '' : (advisoryClass._id || '');
  editedAdvisoryClass.adviserId = advisoryClass.adviser?._id || '';
  editedAdvisoryClass.classId = isTemp ? 
    advisoryClass.class?._id : 
    advisoryClass.class?._id || '';
  editedAdvisoryClass.status = advisoryClass.status || 'active';
  
  console.log('Populated edit form with:', editedAdvisoryClass);
  
  // Clear classes array to force a reload
  classes.value = [];
  
  // Fetch advisers and classes
  Promise.all([fetchAdvisers(), fetchClasses()]).then(() => {
    // Open the modal after data is loaded
    showEditModal.value = true;
  }).catch(error => {
    console.error('Error preparing edit modal:', error);
    notificationService.showError('Failed to prepare edit modal. Please try again.');
  });
}

function closeEditModal() {
  showEditModal.value = false;
}

function validateEditForm() {
  let isValid = true;
  
  // Reset errors
  errors.adviserId = '';
  errors.classId = '';
  
  if (!editedAdvisoryClass.adviserId) {
    errors.adviserId = 'Adviser is required';
    isValid = false;
  }
  
  if (!editedAdvisoryClass.classId) {
    errors.classId = 'Class is required';
    isValid = false;
  }
  
  return isValid;
}

async function updateAdvisoryClass() {
  if (!validateEditForm()) {
    return;
  }
  
  try {
    // Check if this is a new assignment (no ID means it was a temp record)
    if (!editedAdvisoryClass._id) {
      // Create a new advisory class record
      await api.post('/advisers/advisory/classes', {
        adviser: editedAdvisoryClass.adviserId,
        class: editedAdvisoryClass.classId,
        status: 'active' // Always set to active
      });
    } else {
      // Update existing record
      await api.put(`/advisers/advisory/classes/${editedAdvisoryClass._id}`, {
        adviser: editedAdvisoryClass.adviserId,
        class: editedAdvisoryClass.classId,
        status: 'active' // Always set to active
      });
    }
    
    await fetchAdvisoryClasses();
    notificationService.showSuccess('Advisory class updated successfully');
    closeEditModal();
  } catch (error) {
    console.error('Error updating advisory class:', error);
    notificationService.showError('Failed to update advisory class. Please try again later.');
  }
}

async function deleteAdvisoryClass() {
  try {
    if (!confirm('Are you sure you want to delete this advisory class? This action cannot be undone and will permanently remove the record from the database.')) {
      return;
    }
    
    await api.delete(`/advisers/advisory/classes/${editedAdvisoryClass._id}`);
    
    await fetchAdvisoryClasses();
    notificationService.showSuccess('Advisory class deleted successfully');
    closeEditModal();
  } catch (error) {
    console.error('Error deleting advisory class:', error);
    notificationService.showError('Failed to delete advisory class. Please try again later.');
  }
}

function hasFirstSemester(advisoryClass) {
  if (!advisoryClass?.class) return false;
  
  // Check for new structure
  if (advisoryClass.class.firstSemester?.sspSubject) {
    return true;
  }
  
  // Check for hasFirstSemester flag added by backend
  if (advisoryClass.hasFirstSemester) {
    return true;
  }
  
  // Check for firstSemesterSubject flag added by backend
  if (advisoryClass.class.firstSemesterSubject) {
    return true;
  }
  
  // Legacy check
  const semester = advisoryClass.class.sspSubject?.semester || '';
  return semester.includes('1st') || !semester.includes('2nd');
}

function hasSecondSemester(advisoryClass) {
  if (!advisoryClass?.class) return false;
  
  // Check for new structure
  if (advisoryClass.class.secondSemester?.sspSubject) {
    return true;
  }
  
  // Check for hasSecondSemester flag added by backend
  if (advisoryClass.hasSecondSemester) {
    return true;
  }
  
  // Check for secondSemesterSubject flag added by backend
  if (advisoryClass.class.secondSemesterSubject) {
    return true;
  }
  
  // Legacy check
  const semester = advisoryClass.class.sspSubject?.semester || '';
  return semester.includes('2nd');
}

function getFirstSemesterSubjectName(advisoryClass) {
  if (!advisoryClass?.class) return 'No class';
  
  // Check for new structure
  if (advisoryClass.class.firstSemester?.sspSubject) {
    return advisoryClass.class.firstSemester.sspSubject.sspCode || advisoryClass.class.firstSemester.sspSubject.name || 'No subject code';
  }
  
  // Check for firstSemesterSubject added by backend
  if (advisoryClass.class.firstSemesterSubject) {
    return advisoryClass.class.firstSemesterSubject.sspCode || advisoryClass.class.firstSemesterSubject.name || 'No subject code';
  }
  
  // Legacy check - if subject is first semester or unknown
  const semester = advisoryClass.class.sspSubject?.semester || '';
  if (semester.includes('1st') || !semester.includes('2nd')) {
    return advisoryClass.class.sspSubject?.sspCode || advisoryClass.class.sspSubject?.name || 'No subject code';
  }
  
  return 'No 1st semester subject';
}

function getSecondSemesterSubjectName(advisoryClass) {
  if (!advisoryClass?.class) return 'No class';
  
  // Check for new structure
  if (advisoryClass.class.secondSemester?.sspSubject) {
    return advisoryClass.class.secondSemester.sspSubject.sspCode || advisoryClass.class.secondSemester.sspSubject.name || 'No subject code';
  }
  
  // Check for secondSemesterSubject added by backend
  if (advisoryClass.class.secondSemesterSubject) {
    return advisoryClass.class.secondSemesterSubject.sspCode || advisoryClass.class.secondSemesterSubject.name || 'No subject code';
  }
  
  // Legacy check - if subject is second semester
  const semester = advisoryClass.class.sspSubject?.semester || '';
  if (semester.includes('2nd')) {
    return advisoryClass.class.sspSubject?.sspCode || advisoryClass.class.sspSubject?.name || 'No subject code';
  }
  
  return 'No 2nd semester subject';
}

function getFirstSemesterRoom(advisoryClass) {
  if (!advisoryClass?.class) return 'No room assigned';
  
  // Check for new structure
  if (advisoryClass.class.firstSemester?.room) {
    return advisoryClass.class.firstSemester.room;
  }
  
  // Check for firstSem structure
  if (advisoryClass.class.firstSem?.room) {
    return advisoryClass.class.firstSem.room;
  }
  
  // Check in main class properties if not found in semester-specific properties
  if (advisoryClass.class.room) {
    return advisoryClass.class.room;
  }
  
  return 'No room assigned';
}

function getSecondSemesterRoom(advisoryClass) {
  if (!advisoryClass?.class) return 'No room assigned';
  
  // Check for new structure
  if (advisoryClass.class.secondSemester?.room) {
    return advisoryClass.class.secondSemester.room;
  }
  
  // Check for secondSem structure
  if (advisoryClass.class.secondSem?.room) {
    return advisoryClass.class.secondSem.room;
  }
  
  // Check in main class properties if not found in semester-specific properties
  if (advisoryClass.class.room) {
    return advisoryClass.class.room;
  }
  
  return 'No room assigned';
}

function getFirstSemesterDay(advisoryClass) {
  if (!advisoryClass?.class) return 'Not scheduled';
  
  // Check for new structure
  if (advisoryClass.class.firstSemester?.daySchedule) {
    return advisoryClass.class.firstSemester.daySchedule;
  }
  
  // Check for firstSem structure
  if (advisoryClass.class.firstSem?.daySchedule) {
    return advisoryClass.class.firstSem.daySchedule;
  }
  
  // Check in main class properties if not found in semester-specific properties
  if (advisoryClass.class.daySchedule) {
    return advisoryClass.class.daySchedule;
  }
  
  return 'Not scheduled';
}

function getSecondSemesterDay(advisoryClass) {
  if (!advisoryClass?.class) return 'Not scheduled';
  
  // Check for new structure
  if (advisoryClass.class.secondSemester?.daySchedule) {
    return advisoryClass.class.secondSemester.daySchedule;
  }
  
  // Check for secondSem structure
  if (advisoryClass.class.secondSem?.daySchedule) {
    return advisoryClass.class.secondSem.daySchedule;
  }
  
  // Check in main class properties if not found in semester-specific properties
  if (advisoryClass.class.daySchedule) {
    return advisoryClass.class.daySchedule;
  }
  
  return 'Not scheduled';
}

function getFirstSemesterTime(advisoryClass) {
  if (!advisoryClass?.class) return 'Not scheduled';
  
  // Check for new structure
  if (advisoryClass.class.firstSemester?.timeSchedule) {
    return advisoryClass.class.firstSemester.timeSchedule;
  }
  
  // Check for firstSem structure
  if (advisoryClass.class.firstSem?.timeSchedule) {
    return advisoryClass.class.firstSem.timeSchedule;
  }
  
  // Check in main class properties if not found in semester-specific properties
  if (advisoryClass.class.timeSchedule) {
    return advisoryClass.class.timeSchedule;
  }
  
  return 'Not scheduled';
}

function getSecondSemesterTime(advisoryClass) {
  if (!advisoryClass?.class) return 'Not scheduled';
  
  // Check for new structure
  if (advisoryClass.class.secondSemester?.timeSchedule) {
    return advisoryClass.class.secondSemester.timeSchedule;
  }
  
  // Check for secondSem structure
  if (advisoryClass.class.secondSem?.timeSchedule) {
    return advisoryClass.class.secondSem.timeSchedule;
  }
  
  // Check in main class properties if not found in semester-specific properties
  if (advisoryClass.class.timeSchedule) {
    return advisoryClass.class.timeSchedule;
  }
  
  return 'Not scheduled';
}

function getMergedClassesForTimeAndDay(timeSlot, day) {
  const dayMap = {
    'Monday': 'Monday',
    'Tuesday': 'Tuesday',
    'Wednesday': 'Wednesday',
    'Thursday': 'Thursday',
    'Friday': 'Friday'
  };
  
  // Map from day name to day abbreviation or code used in the database
  const dayAbbr = dayMap[day];
  
  if (!dayAbbr) return [];
  
  // Get all classes for this time slot and day
  const allClasses = filteredCalendarClasses.value.filter(advisoryClass => {
    // Get the class data (may be directly on advisoryClass or in .class property)
    const classData = advisoryClass.class || advisoryClass;
    
    // Skip classes that don't match the selected year level (if set)
    if (selectedYearLevel.value && classData.yearLevel !== selectedYearLevel.value) {
      return false;
    }
    
    // Get the relevant semester data based on the selected semester
    let semesterData;
    if (selectedSemester.value === '1st') {
      semesterData = classData.firstSemester || classData.firstSem || {};
    } else {
      semesterData = classData.secondSemester || classData.secondSem || {};
    }
    
    // Check if the day matches
    if (semesterData.daySchedule !== dayAbbr && semesterData.daySchedule !== day) {
      return false;
    }
    
    // Check if the time overlaps with this time slot
    return doesTimeSlotOverlap(timeSlot, semesterData.timeSchedule);
  });
  
  // Group classes by a unique identifier based on class details
  const classGroups = {};
  
  allClasses.forEach(advisoryClass => {
    const classData = advisoryClass.class || advisoryClass;
    
    // Create a unique identifier for each class
    // We use yearLevel + section + major as the key
    const identifier = `${classData.yearLevel}-${classData.section}-${classData.major}`;
    
    if (!classGroups[identifier]) {
      classGroups[identifier] = { ...advisoryClass, mergedClasses: [advisoryClass] };
    } else {
      // If we already have this class in our groups, we don't need to add it again
      // This prevents duplicate entries for multi-hour classes
      if (!classGroups[identifier].mergedClasses.some(c => c._id === advisoryClass._id)) {
        classGroups[identifier].mergedClasses.push(advisoryClass);
      }
    }
  });
  
  // Return the merged classes
  return Object.values(classGroups);
}

// Get subject name for a class in the calendar view
function getClassSubject(advisoryClass) {
  return getSubjectName(advisoryClass);
}

// Get positioned class blocks for the calendar view
function getPositionedClassBlocks() {
  // Constants for positioning
  const ROW_HEIGHT = 90; // Match the min-height of time slots
  const VERTICAL_OFFSET = 35; // Top offset for header

  // Map time slots to their start and end times in minutes
  const timeSlotRanges = timeSlots.value.map(slot => {
    const [start, end] = slot.split(' - ');
    return {
      start: convertTimeToMinutes(start),
      end: convertTimeToMinutes(end)
    };
  });
  
  // Process each class to determine its position
  const classBlocks = [];
  
  // Day indices for positioning
  const dayIndices = {
    'Monday': 0,
    'Tuesday': 1,
    'Wednesday': 2,
    'Thursday': 3,
    'Friday': 4
  };
  
  filteredCalendarClasses.value.forEach(advisoryClass => {
    const classData = advisoryClass.class || advisoryClass;
    
    // Skip classes that don't match selected year level
    if (selectedYearLevel.value && classData.yearLevel !== selectedYearLevel.value) {
      return;
    }
    
    // Get semester data
    let semesterData;
    if (selectedSemester.value === '1st') {
      semesterData = classData.firstSemester || classData.firstSem || {};
    } else {
      semesterData = classData.secondSemester || classData.secondSem || {};
    }
    
    // Skip if no day or time schedule
    if (!semesterData.daySchedule || !semesterData.timeSchedule) {
      return;
    }
    
    // Filter by room if a specific room is selected
    if (selectedRoom.value !== 'all' && semesterData.room !== selectedRoom.value) {
      return;
    }
    
    // Get the day index (0-4 for Monday-Friday)
    const dayIndex = dayIndices[semesterData.daySchedule];
    if (dayIndex === undefined) return;
    
    // Extract start and end times
    const [startTime, endTime] = semesterData.timeSchedule.split(' - ');
    if (!startTime || !endTime) return;
    
    // Convert times to minutes for comparison
    const startMinutes = convertTimeToMinutes(startTime);
    const endMinutes = convertTimeToMinutes(endTime);
    
    // Find the exact time slot for start and end times
    let startRowIndex = -1;
    let endRowIndex = -1;
    
    // Find the exact matching time slots
    timeSlots.value.forEach((slot, index) => {
      const [slotStart, slotEnd] = slot.split(' - ');
      if (slotStart === startTime) {
        startRowIndex = index;
      }
      if (slotEnd === endTime) {
        endRowIndex = index;
      }
    });
    
    // If no exact match, find the closest
    if (startRowIndex === -1) {
      let minDiff = Infinity;
      for (let i = 0; i < timeSlotRanges.length; i++) {
        const diff = Math.abs(timeSlotRanges[i].start - startMinutes);
        if (diff < minDiff) {
          minDiff = diff;
          startRowIndex = i;
        }
      }
    }
    
    if (endRowIndex === -1) {
      let minDiff = Infinity;
      for (let i = 0; i < timeSlotRanges.length; i++) {
        const diff = Math.abs(timeSlotRanges[i].end - endMinutes);
        if (diff < minDiff) {
          minDiff = diff;
          endRowIndex = i;
        }
      }
    }
    
    // Ensure valid indices
    if (startRowIndex === -1) startRowIndex = 0;
    if (endRowIndex === -1 || endRowIndex < startRowIndex) endRowIndex = startRowIndex;
    
    // Calculate position and dimensions
    const top = startRowIndex * ROW_HEIGHT;
    const height = (endRowIndex - startRowIndex + 1) * ROW_HEIGHT;
    
    // Add to class blocks
    classBlocks.push({
      class: advisoryClass,
      dayIndex,
      top,
      height,
      startTime,
      endTime,
      room: semesterData.room
    });
  });
  
  return classBlocks;
}
</script> 