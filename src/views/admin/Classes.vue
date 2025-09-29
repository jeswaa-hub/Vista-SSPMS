<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="flex items-center justify-between">
  <div>
            <h1 class="text-2xl font-normal text-gray-800">Classes Management</h1>
            <p class="text-gray-500 mt-1 font-normal">Manage class schedules and assignments</p>
          </div>
      <button 
        @click="openAddModal" 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <span class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
              Add Class
        </span>
      </button>
        </div>
    </div>

    <!-- Filters -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
          <select
            v-model="filters.yearLevel"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @change="classes = filteredClasses"
          >
            <option value="">All Year Levels</option>
            <option v-for="option in yearLevelOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Major</label>
          <select
            v-model="filters.major"
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @change="classes = filteredClasses"
          >
            <option value="">All Majors</option>
            <option v-for="option in majorOptions" :key="option" :value="option">{{ option }}</option>
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
            placeholder="Search by class code or section"
                class="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @input="handleSearchInput"
          />
        </div>
      </div>
      
      <!-- View Mode Toggle -->
          <div class="flex items-end">
            <div class="flex bg-gray-100 rounded-lg p-1 w-full">
          <button 
            @click="viewMode = 'list'" 
                class="flex-1 px-3 py-1.5 rounded-md text-sm font-normal transition-colors"
                :class="viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'"
              >
                <span class="flex items-center justify-center">
                  <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
                  List
            </span>
          </button>
          <button 
            @click="viewMode = 'calendar'" 
                class="flex-1 px-3 py-1.5 rounded-md text-sm font-normal transition-colors"
                :class="viewMode === 'calendar' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'"
              >
                <span class="flex items-center justify-center">
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

      <!-- Classes Content -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
      <!-- List View -->
      <div v-if="viewMode === 'list'">
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Major</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
              <tbody class="divide-y divide-gray-200">
          <tr v-if="loading">
                  <td colspan="5" class="px-6 py-12 text-center">
                    <div class="flex items-center justify-center">
                      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span class="ml-3 text-gray-500">Loading classes...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="classes.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center">
                    <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443a55.381 55.381 0 015.25 2.882V15" />
                      </svg>
                    </div>
                    <h3 class="text-base font-normal text-gray-800 mb-1">
                      {{ (filters.search || filters.yearLevel || filters.major) ? 'No classes found' : 'No classes yet' }}
                    </h3>
                    <p class="text-gray-500 font-normal">
                      {{ (filters.search || filters.yearLevel || filters.major) ? 'Try adjusting your search criteria' : 'Add your first class to get started' }}
                    </p>
            </td>
          </tr>
          <tr v-for="(classItem, index) in classes" :key="classItem._id || index" class="hover:bg-gray-50">
            <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span class="text-sm font-normal text-blue-600">
                          {{ classItem.yearLevel?.charAt(0) || 'C' }}
                        </span>
                      </div>
                      <div>
                        <div class="text-sm font-normal text-gray-800">{{ classItem.yearLevel || 'Unknown' }} Year</div>
                        <div class="text-xs text-gray-500">Class Level</div>
                      </div>
              </div>
              </td>
                  <td class="px-6 py-4 text-sm text-gray-800">
                  {{ classItem.section || 'Unknown' }}
            </td>
                  <td class="px-6 py-4 text-sm text-gray-800">
                  {{ classItem.major || 'No major specified' }}
            </td>
                  <td class="px-6 py-4">
                    <span 
                      class="inline-flex px-2 py-1 text-xs font-normal rounded-md"
                      :class="classItem.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-700 border border-gray-200'"
                    >
                      {{ classItem.status ? (classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)) : 'Active' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-2">
              <button 
                @click="viewDetails(classItem)" 
                        class="px-3 py-1.5 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              >
                Details
              </button>
              <button 
                @click="editClass(classItem)"
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
      
              <!-- Calendar View -->
        <div v-else class="p-6">
          <!-- Year Level Tabs for Calendar View -->
          <div class="border-b border-gray-200 mb-4">
            <nav class="flex -mb-px overflow-x-auto">
              <button 
                @click="selectedYearLevel = ''; filterCalendarClasses()" 
                class="py-3 px-6 font-normal text-sm border-b-2 focus:outline-none transition-colors duration-200 whitespace-nowrap"
                :class="selectedYearLevel === '' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                All Years
              </button>
              <button 
                v-for="yearLevel in yearLevelOptions" 
                :key="yearLevel" 
                @click="selectedYearLevel = yearLevel; filterCalendarClasses()"
                class="py-3 px-6 font-normal text-sm border-b-2 focus:outline-none transition-colors duration-200 whitespace-nowrap"
                :class="selectedYearLevel === yearLevel ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                {{ yearLevel }} Year
              </button>
            </nav>
          </div>
          
          <!-- Semester Selection -->
          <div class="flex items-center mb-6 space-x-4">
            <div class="font-normal text-gray-700">Semester:</div>
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button 
                @click="calendarSemester = '1st'" 
                class="px-4 py-1.5 rounded-md focus:outline-none transition-colors duration-200 text-sm font-normal"
                :class="calendarSemester === '1st' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'"
              >
                1st Semester
              </button>
              <button 
                @click="calendarSemester = '2nd'" 
                class="px-4 py-1.5 rounded-md focus:outline-none transition-colors duration-200 text-sm font-normal"
                :class="calendarSemester === '2nd' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'"
              >
                2nd Semester
              </button>
            </div>
            
            <!-- Room Selection -->
            <div class="font-normal text-gray-700 ml-4">Room:</div>
            <select 
              v-model="selectedRoom" 
              class="px-3 py-1.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Rooms</option>
              <option v-for="room in availableRooms.filter(r => r !== 'all')" :key="room" :value="room">
                {{ room }}
              </option>
            </select>
          </div>
        
          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span class="ml-3 text-gray-500">Loading class schedule...</span>
          </div>
        
          <!-- No Classes Found -->
          <div v-else-if="filteredCalendarClasses.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
            <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
              </svg>
            </div>
            <h3 class="text-base font-normal text-gray-800 mb-1">No Classes Found</h3>
            <p class="text-gray-500 font-normal max-w-md mx-auto">
              No classes found with schedules for {{ calendarSemester === '1st' ? '1st' : '2nd' }} Semester. 
              Try selecting a different semester or check if classes have schedules assigned.
            </p>
          </div>
        
          <!-- Calendar Grid -->
          <div v-else class="bg-white rounded-lg border border-gray-200">
            <!-- Calendar Grid Header -->
            <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
              <div class="py-3 px-2 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
              <div v-for="day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day" 
                   class="py-3 px-2 text-gray-500 text-xs font-medium text-center">
                {{ day }}
              </div>
            </div>
            
            <!-- Calendar Grid Body -->
            <div class="relative overflow-visible">
              <div class="divide-y divide-gray-200">
                <div v-for="(timeSlot, index) in timeSlots" :key="index" class="grid grid-cols-6">
                  <!-- Time Label -->
                  <div class="py-2 px-1 text-xs font-normal text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center min-h-[60px]">
                    <span class="text-center leading-tight">{{ timeSlot }}</span>
                  </div>
                  
                  <!-- Day Columns -->
                  <div v-for="day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day" 
                       class="relative p-0 min-h-[60px] border-r border-gray-100">
                    <!-- Class blocks will be positioned here -->
                  </div>
                </div>
              </div>

              <!-- Absolutely positioned class blocks -->
              <div 
                v-for="(classBlock, index) in getPositionedClassBlocks()" 
                :key="index"
                class="absolute rounded-md text-xs bg-opacity-95 cursor-pointer overflow-hidden z-10 shadow-sm flex flex-col border"
                :class="getClassColorClasses(classBlock.class)"
                :style="{
                  left: `calc(${classBlock.dayIndex * 16.67}% + 16.67% + 1px)`, 
                  top: `${classBlock.top}px`,
                  height: `${classBlock.height}px`,
                  width: 'calc(16.67% - 2px)'
                }"
                @click="viewDetails(classBlock.class)"
              >
                <div class="font-normal text-xs truncate p-2">{{ getCompactClassName(classBlock.class) }}</div>
                <div class="text-xs flex flex-col justify-between px-2 pb-2 flex-grow">
                  <span class="truncate font-normal">{{ getClassSubject(classBlock.class) }}</span>
                  <div class="mt-1 flex flex-col">
                    <span class="rounded-full px-2 py-0.5 bg-white bg-opacity-40 text-xs mt-1 inline-block w-max">
                      {{ classBlock.room || getClassRoom(classBlock.class) }}
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

    <!-- Add Modal - Increase width -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex justify-center items-center">
      <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-4xl mx-auto p-6 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300">
        <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 class="text-2xl font-semibold text-primary">{{ addModalTitle }}</h2>
          <button @click="closeAddModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
        </div>
        
        <!-- Common fields for both semesters -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Year Level *</label>
            <select
              v-model="newClass.yearLevel"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.yearLevel }"
              @change="handleYearLevelChange"
              :disabled="secondSemesterMode"
            >
              <option value="">Select Year Level</option>
              <option v-for="option in yearLevelOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <p v-if="errors.yearLevel" class="mt-1.5 text-sm text-red-500">{{ errors.yearLevel }}</p>
        </div>
        
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Section *</label>
            <select
              v-model="newClass.section"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.section }"
              :disabled="secondSemesterMode"
            >
              <option value="">Select Section</option>
              <option v-for="section in availableSections" :key="section" :value="section">{{ section }}</option>
            </select>
            <p v-if="errors.section" class="mt-1.5 text-sm text-red-500">{{ errors.section }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Major *</label>
            <select
              v-model="newClass.major"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.major }"
              :disabled="secondSemesterMode"
            >
              <option value="">Select Major</option>
              <option v-for="option in majorOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <p v-if="errors.major" class="mt-1.5 text-sm text-red-500">{{ errors.major }}</p>
          </div>
          </div>
          
        <!-- Semester Tabs -->
        <div class="border-b border-gray-200 mb-4">
          <nav class="flex -mb-px">
            <button 
              @click="activeSemesterTab = '1st'" 
              class="py-3 px-6 font-medium text-base border-b-2 focus:outline-none transition-colors duration-200"
              :class="activeSemesterTab === '1st' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              1st Semester
            </button>
            <button 
              @click="activeSemesterTab = '2nd'" 
              class="py-3 px-6 font-medium text-base border-b-2 focus:outline-none transition-colors duration-200"
              :class="activeSemesterTab === '2nd' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              2nd Semester
            </button>
          </nav>
          </div>
          
        <!-- 1st Semester Schedule -->
        <div v-if="activeSemesterTab === '1st'" class="mb-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">1st Semester Schedule</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Subject</label>
          <select 
                v-model="newClass.firstSem.subjectId"
                class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
                :class="{ 'border-red-500': errors.firstSemSubject }"
              >
                <option value="">Select Subject</option>
                <option v-for="subject in firstSemesterSubjects" :key="subject._id" :value="subject._id">
                  {{ subject.sspCode }} - {{ subject.name }}
            </option>
          </select>
              <p v-if="errors.firstSemSubject" class="mt-1.5 text-sm text-red-500">{{ errors.firstSemSubject }}</p>
            
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Day</label>
              <select
                v-model="newClass.firstSem.daySchedule"
                class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              >
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
        </div>
        
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Time</label>
              <input
                v-model="newClass.firstSem.timeSchedule"
                type="text"
                placeholder="e.g., 8:00 AM - 10:00 AM"
                class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              />
        </div>
        
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Room</label>
              <input
                v-model="newClass.firstSem.room"
                type="text"
                placeholder="e.g., Room 101"
                class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              />
            </div>
          </div>
        </div>
        
        <!-- 2nd Semester Schedule -->
        <div v-if="activeSemesterTab === '2nd'" class="mb-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">2nd Semester Schedule</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Subject</label>
              <select
                v-model="newClass.secondSem.subjectId"
                class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
                :class="{ 'border-red-500': errors.secondSemSubject }"
              >
                <option value="">Select Subject</option>
                <option v-for="subject in secondSemesterSubjects" :key="subject._id" :value="subject._id">
                  {{ subject.sspCode }} - {{ subject.name }}
                </option>
              </select>
              <p v-if="errors.secondSemSubject" class="mt-1.5 text-sm text-red-500">{{ errors.secondSemSubject }}</p>
            
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Day</label>
              <select
                v-model="newClass.secondSem.daySchedule"
                class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              >
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
            
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Time</label>
              <input
                v-model="newClass.secondSem.timeSchedule"
                type="text"
                placeholder="e.g., 8:00 AM - 10:00 AM"
                class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              />
            </div>
            
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Room</label>
              <input
                v-model="newClass.secondSem.room"
                type="text"
                placeholder="e.g., Room 102"
                class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              />
            </div>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            @click="closeAddModal"
            class="px-5 py-2.5 mr-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            @click="addClass"
            class="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            Add Class
          </button>
        </div>
      </div>
    </div>
    
    <!-- View Details Modal - Increase width -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex justify-center items-center">
      <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-4xl mx-auto p-6 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300">
        <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 class="text-2xl font-semibold text-primary">Class Details</h2>
          <button @click="showDetailsModal = false" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Replace with a link to the dedicated archive page -->
    <div class="mt-10 flex justify-end">
      <router-link 
        to="/admin/class-archive" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v1H3V4zm1 2h12v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm6 5a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
        </svg>
        View Archived Classes
      </router-link>
    </div>

    <!-- Add Modal - Increase width -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex justify-center items-center">
      <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-4xl mx-auto p-6 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300">
        <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 class="text-2xl font-semibold text-primary">{{ addModalTitle }}</h2>
          <button @click="closeAddModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Common fields for both semesters -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Year Level *</label>
            <select
              v-model="newClass.yearLevel"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.yearLevel }"
              @change="handleYearLevelChange"
              :disabled="secondSemesterMode"
            >
              <option value="">Select Year Level</option>
              <option v-for="option in yearLevelOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <p v-if="errors.yearLevel" class="mt-1.5 text-sm text-red-500">{{ errors.yearLevel }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Section *</label>
            <select
              v-model="newClass.section"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.section }"
              :disabled="secondSemesterMode"
            >
              <option value="">Select Section</option>
              <option v-for="section in availableSections" :key="section" :value="section">{{ section }}</option>
            </select>
            <p v-if="errors.section" class="mt-1.5 text-sm text-red-500">{{ errors.section }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Major *</label>
            <select
              v-model="newClass.major"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.major }"
              :disabled="secondSemesterMode"
            >
              <option value="">Select Major</option>
              <option v-for="option in majorOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <p v-if="errors.major" class="mt-1.5 text-sm text-red-500">{{ errors.major }}</p>
          </div>
          </div>
          
        <!-- Semester Tabs -->
        <div class="border-b border-gray-200 mb-4">
          <nav class="flex -mb-px">
            <button 
              @click="activeSemesterTab = '1st'" 
              :class="[
                'py-3 px-4 text-sm font-medium border-b-2 focus:outline-none',
                activeSemesterTab === '1st' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              1st Semester Details
            </button>
            <button 
              @click="activeSemesterTab = '2nd'" 
              :class="[
                'py-3 px-4 text-sm font-medium border-b-2 focus:outline-none',
                activeSemesterTab === '2nd' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              2nd Semester Details
            </button>
          </nav>
        </div>
        
        <!-- 1st Semester Fields -->
        <div v-if="activeSemesterTab === '1st'" class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">SSP Subject (1st Sem) *</label>
            <select
              v-model="newClass.firstSem.subjectId"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.firstSem?.subjectId }"
              @change="handleFirstSemSubjectChange"
            >
              <option value="">Select Subject</option>
              <option v-for="subject in filteredFirstSemSubjects" :key="subject._id" :value="subject._id">
                {{ subject.sspCode }} ({{ subject.hours }} hr)
              </option>
            </select>
            <p v-if="errors.firstSem?.subjectId" class="mt-1.5 text-sm text-red-500">{{ errors.firstSem.subjectId }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Day Schedule (1st Sem) *</label>
            <select
              v-model="newClass.firstSem.daySchedule"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.firstSem?.daySchedule }"
              @change="newClass.firstSem.timeSchedule = ''" 
            >
              <option value="">Select Day</option>
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
            <p v-if="errors.firstSem?.daySchedule" class="mt-1.5 text-sm text-red-500">{{ errors.firstSem.daySchedule }}</p>
          </div>
          
          <div class="md:col-span-3 grid grid-cols-2 gap-5">
          <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Room (1st Sem) *</label>
              <div class="relative border border-gray-300 rounded-lg p-4 bg-white h-full">
                <p class="text-sm text-gray-600 mb-2">Select a room by clicking on it:</p>
                <div class="flex flex-wrap gap-2 mb-2">
                  <div 
                    v-for="roomNumber in roomOptions" 
                    :key="roomNumber"
                    @click="selectRoom('firstSem', roomNumber)"
                    class="relative cursor-pointer transition-all duration-200 hover:opacity-80"
                  >
                    <div 
                      class="w-16 h-12 flex items-center justify-center border-2 rounded-md"
                      :class="[
                        isRoomTaken(roomNumber, newClass.firstSem.daySchedule, newClass.firstSem.timeSchedule) 
                          ? 'border-red-300 bg-red-50' 
                          : (newClass.firstSem.room === `Room ${roomNumber}` 
                            ? 'border-primary bg-primary-50' 
                            : 'border-gray-300 bg-gray-50')
                      ]"
            >
                      <span :class="{'font-bold': newClass.firstSem.room === `Room ${roomNumber}`}">{{ roomNumber }}</span>
                    </div>
                    <div 
                      v-if="isRoomTaken(roomNumber, newClass.firstSem.daySchedule, newClass.firstSem.timeSchedule)"
                      class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
                      title="This room is already booked for this time slot"
                    ></div>
                  </div>
                </div>
                <p v-if="errors.firstSem?.room" class="mt-1.5 text-sm text-red-500">{{ errors.firstSem.room }}</p>
                <p class="text-xs text-gray-500 mt-2">Selected: {{ newClass.firstSem.room || 'No room selected' }}</p>
              </div>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Time Schedule (1st Sem) *</label>
              <div v-if="newClass.firstSem.daySchedule" class="border border-gray-300 rounded-lg p-3 bg-white h-full">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-sm font-medium">{{ newClass.firstSem.daySchedule || 'Select a day' }}</h3>
                  <span class="text-xs text-gray-500">Click to select a time slot</span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div 
                    v-for="time in firstSemTimeScheduleOptions" 
                    :key="time"
                    @click="selectTimeSlot('firstSem', time)"
                    class="p-2 rounded cursor-pointer transition-all duration-200 text-sm"
                    :class="[
                      isTimeSlotTaken(newClass.firstSem.daySchedule, time, newClass.firstSem.room, 'firstSem') 
                        ? 'bg-red-100 text-red-700 line-through' 
                        : (newClass.firstSem.timeSchedule === time 
                          ? 'bg-primary-100 text-primary border border-primary' 
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700')
                    ]"
                  >
                    {{ time }}
                    <span v-if="isTimeSlotTaken(newClass.firstSem.daySchedule, time, newClass.firstSem.room, 'firstSem')" class="text-xs block">
                      (Taken - {{ getRoomForTimeSlot(newClass.firstSem.daySchedule, time) }})
                    </span>
                  </div>
                </div>
            <p v-if="errors.firstSem?.timeSchedule" class="mt-1.5 text-sm text-red-500">{{ errors.firstSem.timeSchedule }}</p>
              </div>
              <div v-else class="text-sm text-gray-500 p-2.5 border border-gray-200 rounded-lg bg-gray-50 h-full flex items-center justify-center">
                Please select a day first
              </div>
            </div>
          </div>
        </div>
        
        <!-- 2nd Semester Fields -->
        <div v-if="activeSemesterTab === '2nd'" class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">SSP Subject (2nd Sem)</label>
            <select
              v-model="newClass.secondSem.subjectId"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.secondSem?.subjectId }"
              @change="handleSecondSemSubjectChange"
            >
              <option value="">Select Subject</option>
              <option v-for="subject in filteredSecondSemSubjects" :key="subject._id" :value="subject._id">
                {{ subject.sspCode }} ({{ subject.hours }} hr)
              </option>
            </select>
            <p v-if="errors.secondSem?.subjectId" class="mt-1.5 text-sm text-red-500">{{ errors.secondSem.subjectId }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Day Schedule (2nd Sem)</label>
            <select
              v-model="newClass.secondSem.daySchedule"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.secondSem?.daySchedule }"
              @change="newClass.secondSem.timeSchedule = ''"
            >
              <option value="">Select Day</option>
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
            <p v-if="errors.secondSem?.daySchedule" class="mt-1.5 text-sm text-red-500">{{ errors.secondSem.daySchedule }}</p>
          </div>
          
          <div class="md:col-span-3 grid grid-cols-2 gap-5">
          <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Room (2nd Sem)</label>
              <div class="relative border border-gray-300 rounded-lg p-4 bg-white h-full">
                <p class="text-sm text-gray-600 mb-2">Select a room by clicking on it:</p>
                <div class="flex flex-wrap gap-2 mb-2">
                  <div 
                    v-for="roomNumber in roomOptions" 
                    :key="roomNumber"
                    @click="selectRoom('secondSem', roomNumber)"
                    class="relative cursor-pointer transition-all duration-200 hover:opacity-80"
                  >
                    <div 
                      class="w-16 h-12 flex items-center justify-center border-2 rounded-md"
                      :class="[
                        isRoomTaken(roomNumber, newClass.secondSem.daySchedule, newClass.secondSem.timeSchedule) 
                          ? 'border-red-300 bg-red-50' 
                          : (newClass.secondSem.room === `Room ${roomNumber}` 
                            ? 'border-primary bg-primary-50' 
                            : 'border-gray-300 bg-gray-50')
                      ]"
                    >
                      <span :class="{'font-bold': newClass.secondSem.room === `Room ${roomNumber}`}">{{ roomNumber }}</span>
                    </div>
                    <div 
                      v-if="isRoomTaken(roomNumber, newClass.secondSem.daySchedule, newClass.secondSem.timeSchedule)"
                      class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
                      title="This room is already booked for this time slot"
                    ></div>
                  </div>
                </div>
                <p v-if="errors.secondSem?.room" class="mt-1.5 text-sm text-red-500">{{ errors.secondSem.room }}</p>
                <p class="text-xs text-gray-500 mt-2">Selected: {{ newClass.secondSem.room || 'No room selected' }}</p>
              </div>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Time Schedule (2nd Sem)</label>
              <div v-if="newClass.secondSem.daySchedule" class="border border-gray-300 rounded-lg p-3 bg-white h-full">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-sm font-medium">{{ newClass.secondSem.daySchedule || 'Select a day' }}</h3>
                  <span class="text-xs text-gray-500">Click to select a time slot</span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div 
                    v-for="time in secondSemTimeScheduleOptions" 
                    :key="time"
                    @click="selectTimeSlot('secondSem', time)"
                    class="p-2 rounded cursor-pointer transition-all duration-200 text-sm"
                    :class="[
                      isTimeSlotTaken(newClass.secondSem.daySchedule, time, newClass.secondSem.room, 'secondSem') 
                        ? 'bg-red-100 text-red-700 line-through' 
                        : (newClass.secondSem.timeSchedule === time 
                          ? 'bg-primary-100 text-primary border border-primary' 
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700')
                    ]"
                  >
                    {{ time }}
                    <span v-if="isTimeSlotTaken(newClass.secondSem.daySchedule, time, newClass.secondSem.room, 'secondSem')" class="text-xs block">
                      (Taken - {{ getRoomForTimeSlot(newClass.secondSem.daySchedule, time) }})
                    </span>
                  </div>
                </div>
            <p v-if="errors.secondSem?.timeSchedule" class="mt-1.5 text-sm text-red-500">{{ errors.secondSem.timeSchedule }}</p>
          </div>
              <div v-else class="text-sm text-gray-500 p-2.5 border border-gray-200 rounded-lg bg-gray-50 h-full flex items-center justify-center">
                Please select a day first
        </div>
            </div>
          </div>
        </div>
        

        
        <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            @click="closeAddModal"
            class="px-5 py-2.5 mr-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            @click="addClass"
            class="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            Add Class
          </button>
        </div>
      </div>
    </div>
    
    <!-- View Details Modal - Increase width -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex justify-center items-center">
      <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-4xl mx-auto p-6 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300">
        <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 class="text-2xl font-semibold text-primary">Class Details</h2>
          <button @click="showDetailsModal = false" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="mb-6">
          <div class="border border-gray-300 rounded-lg shadow-sm mb-4 overflow-hidden">
          <table class="w-full">
            <tr class="border-b border-gray-300">
                <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-base">Class</td>
              <td class="px-4 py-3 text-base">{{ selectedClass?.yearLevel }} Year - {{ selectedClass?.section }} ({{ selectedClass?.major }})</td>
            </tr>
            </table>
          </div>
          
          <!-- Semester Tabs -->
          <div class="border-b border-gray-200 mb-4">
            <nav class="flex -mb-px">
              <button 
                @click="activeDetailsTab = '1st'" 
                :class="[
                  'py-3 px-4 text-sm font-medium border-b-2 focus:outline-none',
                  activeDetailsTab === '1st' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                1st Semester Details
              </button>
              <button 
                @click="activeDetailsTab = '2nd'" 
                :class="[
                  'py-3 px-4 text-sm font-medium border-b-2 focus:outline-none',
                  activeDetailsTab === '2nd' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                2nd Semester Details
              </button>
            </nav>
          </div>
          
          <!-- 1st Semester Details -->
          <div v-if="activeDetailsTab === '1st'">
            <div v-if="firstSemesterClass" class="border border-gray-300 rounded-lg shadow-sm mb-4 overflow-hidden">
              <table class="w-full">
            <tr class="border-b border-gray-300">
                  <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-base">Subject (1st Sem)</td>
                  <td class="px-4 py-3 text-base">{{ getSubjectName(firstSemesterClass) }}</td>
            </tr>
            <tr class="border-b border-gray-300">
              <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-base">Day Schedule</td>
                  <td class="px-4 py-3 text-base">{{ firstSemesterClass?.daySchedule }}</td>
            </tr>
            <tr class="border-b border-gray-300">
              <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-base">Time Schedule</td>
                  <td class="px-4 py-3 text-base">{{ firstSemesterClass?.timeSchedule }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-base">Room</td>
                  <td class="px-4 py-3 text-base">{{ firstSemesterClass?.room }}</td>
            </tr>
          </table>
            </div>
            <div v-else class="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              No 1st semester class found for this year, section, and major.
            </div>
          </div>
          
          <!-- 2nd Semester Details -->
          <div v-if="activeDetailsTab === '2nd'">
            <div v-if="secondSemesterClass" class="border border-gray-300 rounded-lg shadow-sm mb-4 overflow-hidden">
              <table class="w-full">
                <tr class="border-b border-gray-300">
                  <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-base">Subject (2nd Sem)</td>
                  <td class="px-4 py-3 text-base">{{ getSubjectName(secondSemesterClass) }}</td>
                </tr>
                <tr class="border-b border-gray-300">
                  <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-base">Day Schedule</td>
                  <td class="px-4 py-3 text-base">{{ secondSemesterClass?.daySchedule }}</td>
                </tr>
                <tr class="border-b border-gray-300">
                  <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-base">Time Schedule</td>
                  <td class="px-4 py-3 text-base">{{ secondSemesterClass?.timeSchedule }}</td>
                </tr>
                <tr>
                  <td class="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-base">Room</td>
                  <td class="px-4 py-3 text-base">{{ secondSemesterClass?.room }}</td>
                </tr>
              </table>
            </div>
            <div v-else class="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              <p class="mb-2">No 2nd semester class found for this year, section, and major.</p>
              <p class="text-sm text-gray-600">
                You can add second semester information when creating or editing a class.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Students in Class section -->
        <class-details-view 
          :class-data="activeDetailsTab === '1st' ? firstSemesterClass : secondSemesterClass" 
          @view-student="handleViewStudent" 
          @error="handleViewError" 
        />
        
        <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            @click="showDetailsModal = false"
            class="px-5 py-2.5 mr-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            Close
          </button>
          <button
            @click="() => { editClass(activeDetailsTab === '1st' ? firstSemesterClass : secondSemesterClass); showDetailsModal = false; }"
            class="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
            v-if="activeDetailsTab === '1st' ? firstSemesterClass : secondSemesterClass"
          >
            Edit Class
          </button>
        </div>
      </div>
    </div>
    
    <!-- Edit Class Modal - Increase width -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex justify-center items-center">
      <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-4xl mx-auto p-6 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300">
        <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 class="text-2xl font-semibold text-primary">Edit Class</h2>
          <button @click="() => { console.log('Closing edit modal'); showEditModal = false; }" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Common fields for both semesters -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Year Level *</label>
            <select
              v-model="editedClass.yearLevel"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editYearLevel }"
              @change="handleEditYearLevelChange"
            >
              <option value="">Select Year Level</option>
              <option v-for="option in yearLevelOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <p v-if="errors.editYearLevel" class="mt-1.5 text-sm text-red-500">{{ errors.editYearLevel }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Section *</label>
            <select
              v-model="editedClass.section"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editSection }"
            >
              <option value="">Select Section</option>
              <option v-for="section in availableSectionsEdit" :key="section" :value="section">{{ section }}</option>
            </select>
            <p v-if="errors.editSection" class="mt-1.5 text-sm text-red-500">{{ errors.editSection }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Major *</label>
            <select
              v-model="editedClass.major"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editMajor }"
            >
              <option value="">Select Major</option>
              <option v-for="option in majorOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <p v-if="errors.editMajor" class="mt-1.5 text-sm text-red-500">{{ errors.editMajor }}</p>
          </div>
        </div>
        
        <!-- Semester Tabs -->
        <div class="border-b border-gray-200 mb-4">
          <nav class="flex -mb-px">
            <button 
              @click="activeEditSemesterTab = '1st'" 
              :class="[
                'py-3 px-4 text-sm font-medium border-b-2 focus:outline-none',
                activeEditSemesterTab === '1st' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              1st Semester Details
            </button>
            <button 
              @click="activeEditSemesterTab = '2nd'" 
              :class="[
                'py-3 px-4 text-sm font-medium border-b-2 focus:outline-none',
                activeEditSemesterTab === '2nd' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              2nd Semester Details
            </button>
          </nav>
        </div>
        
        <!-- 1st Semester Fields -->
        <div v-if="activeEditSemesterTab === '1st'" class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">SSP Subject (1st Sem) *</label>
            <select
              v-model="editedClass.firstSem.subjectId"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editFirstSem?.subjectId }"
              @change="handleEditFirstSemSubjectChange"
            >
              <option value="">Select Subject</option>
              <option v-for="subject in editFilteredFirstSemSubjects" :key="subject._id" :value="subject._id">
                {{ subject.sspCode }} ({{ subject.hours }} hr)
              </option>
            </select>
            <p v-if="errors.editFirstSem?.subjectId" class="mt-1.5 text-sm text-red-500">{{ errors.editFirstSem.subjectId }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Day Schedule (1st Sem) *</label>
            <select
              v-model="editedClass.firstSem.daySchedule"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editFirstSem?.daySchedule }"
              @change="editedClass.firstSem.timeSchedule = ''"
            >
              <option value="">Select Day</option>
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
            <p v-if="errors.editFirstSem?.daySchedule" class="mt-1.5 text-sm text-red-500">{{ errors.editFirstSem.daySchedule }}</p>
          </div>
          
          <div class="md:col-span-3 grid grid-cols-2 gap-5">
          <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Room (1st Sem) *</label>
              <div class="relative border border-gray-300 rounded-lg p-4 bg-white h-full">
                <p class="text-sm text-gray-600 mb-2">Select a room by clicking on it:</p>
                <div class="flex flex-wrap gap-2 mb-2">
                  <div 
                    v-for="roomNumber in roomOptions" 
                    :key="roomNumber"
                    @click="selectEditRoom('firstSem', roomNumber)"
                    class="relative cursor-pointer transition-all duration-200 hover:opacity-80"
                  >
                    <div 
                      class="w-16 h-12 flex items-center justify-center border-2 rounded-md"
                      :class="[
                        isRoomTakenForEdit(roomNumber, editedClass.firstSem.daySchedule, editedClass.firstSem.timeSchedule, editedClass._id) 
                          ? 'border-red-300 bg-red-50' 
                          : (editedClass.firstSem.room === `Room ${roomNumber}` 
                            ? 'border-primary bg-primary-50' 
                            : 'border-gray-300 bg-gray-50')
                      ]"
                    >
                      <span :class="{'font-bold': editedClass.firstSem.room === `Room ${roomNumber}`}">{{ roomNumber }}</span>
                    </div>
                    <div 
                      v-if="isRoomTakenForEdit(roomNumber, editedClass.firstSem.daySchedule, editedClass.firstSem.timeSchedule, editedClass._id)"
                      class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
                      title="This room is already booked for this time slot"
                    ></div>
                  </div>
                </div>
                <p v-if="errors.editFirstSem?.room" class="mt-1.5 text-sm text-red-500">{{ errors.editFirstSem.room }}</p>
                <p class="text-xs text-gray-500 mt-2">Selected: {{ editedClass.firstSem.room || 'No room selected' }}</p>
              </div>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Time Schedule (1st Sem) *</label>
              <div v-if="editedClass.firstSem.daySchedule" class="border border-gray-300 rounded-lg p-3 bg-white h-full">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-sm font-medium">{{ editedClass.firstSem.daySchedule || 'Select a day' }}</h3>
                  <span class="text-xs text-gray-500">Click to select a time slot</span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div 
                    v-for="time in editFirstSemTimeScheduleOptions" 
                    :key="time"
                    @click="selectEditTimeSlot('firstSem', time)"
                    class="p-2 rounded cursor-pointer transition-all duration-200 text-sm"
                    :class="[
                      isTimeSlotTakenForEdit(editedClass.firstSem.daySchedule, time, editedClass._id, editedClass.firstSem.room, 'firstSem') 
                        ? 'bg-red-100 text-red-700 line-through' 
                        : (editedClass.firstSem.timeSchedule === time 
                          ? 'bg-primary-100 text-primary border border-primary' 
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700')
                    ]"
                  >
                    {{ time }}
                    <span v-if="isTimeSlotTakenForEdit(editedClass.firstSem.daySchedule, time, editedClass._id, editedClass.firstSem.room, 'firstSem')" class="text-xs block">
                      (Taken - {{ getRoomForTimeSlot(editedClass.firstSem.daySchedule, time, editedClass._id) }})
                    </span>
                  </div>
                </div>
            <p v-if="errors.editFirstSem?.timeSchedule" class="mt-1.5 text-sm text-red-500">{{ errors.editFirstSem.timeSchedule }}</p>
              </div>
              <div v-else class="text-sm text-gray-500 p-2.5 border border-gray-200 rounded-lg bg-gray-50 h-full flex items-center justify-center">
                Please select a day first
              </div>
            </div>
          </div>
          </div>
          
        <!-- 2nd Semester Fields -->
        <div v-if="activeEditSemesterTab === '2nd'" class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">SSP Subject (2nd Sem) *</label>
            <select
              v-model="editedClass.secondSem.subjectId"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editSecondSem?.subjectId }"
              @change="handleEditSecondSemSubjectChange"
            >
              <option value="">Select Subject</option>
              <option v-for="subject in editFilteredSecondSemSubjects" :key="subject._id" :value="subject._id">
                {{ subject.sspCode }} ({{ subject.hours }} hr)
              </option>
            </select>
            <p v-if="errors.editSecondSem?.subjectId" class="mt-1.5 text-sm text-red-500">{{ errors.editSecondSem.subjectId }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Day Schedule (2nd Sem) *</label>
            <select
              v-model="editedClass.secondSem.daySchedule"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editSecondSem?.daySchedule }"
              @change="editedClass.secondSem.timeSchedule = ''"
            >
              <option value="">Select Day</option>
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
            <p v-if="errors.editSecondSem?.daySchedule" class="mt-1.5 text-sm text-red-500">{{ errors.editSecondSem.daySchedule }}</p>
          </div>
          
          <div class="md:col-span-3 grid grid-cols-2 gap-5">
          <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Room (2nd Sem) *</label>
              <div class="relative border border-gray-300 rounded-lg p-4 bg-white h-full">
                <p class="text-sm text-gray-600 mb-2">Select a room by clicking on it:</p>
                <div class="flex flex-wrap gap-2 mb-2">
                  <div 
                    v-for="roomNumber in roomOptions" 
                    :key="roomNumber"
                    @click="selectEditRoom('secondSem', roomNumber)"
                    class="relative cursor-pointer transition-all duration-200 hover:opacity-80"
                  >
                    <div 
                      class="w-16 h-12 flex items-center justify-center border-2 rounded-md"
                      :class="[
                        isRoomTakenForEdit(roomNumber, editedClass.secondSem.daySchedule, editedClass.secondSem.timeSchedule, editedClass._id) 
                          ? 'border-red-300 bg-red-50' 
                          : (editedClass.secondSem.room === `Room ${roomNumber}` 
                            ? 'border-primary bg-primary-50' 
                            : 'border-gray-300 bg-gray-50')
                      ]"
            >
                      <span :class="{'font-bold': editedClass.secondSem.room === `Room ${roomNumber}`}">{{ roomNumber }}</span>
                    </div>
                    <div 
                      v-if="isRoomTakenForEdit(roomNumber, editedClass.secondSem.daySchedule, editedClass.secondSem.timeSchedule, editedClass._id)"
                      class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
                      title="This room is already booked for this time slot"
                    ></div>
                  </div>
                </div>
                <p v-if="errors.editSecondSem?.room" class="mt-1.5 text-sm text-red-500">{{ errors.editSecondSem.room }}</p>
                <p class="text-xs text-gray-500 mt-2">Selected: {{ editedClass.secondSem.room || 'No room selected' }}</p>
              </div>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Time Schedule (2nd Sem) *</label>
              <div v-if="editedClass.secondSem.daySchedule" class="border border-gray-300 rounded-lg p-3 bg-white h-full">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-sm font-medium">{{ editedClass.secondSem.daySchedule || 'Select a day' }}</h3>
                  <span class="text-xs text-gray-500">Click to select a time slot</span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div 
                    v-for="time in editSecondSemTimeScheduleOptions" 
                    :key="time"
                    @click="selectEditTimeSlot('secondSem', time)"
                    class="p-2 rounded cursor-pointer transition-all duration-200 text-sm"
                    :class="[
                      isTimeSlotTakenForEdit(editedClass.secondSem.daySchedule, time, editedClass._id, editedClass.secondSem.room, 'secondSem') 
                        ? 'bg-red-100 text-red-700 line-through' 
                        : (editedClass.secondSem.timeSchedule === time 
                          ? 'bg-primary-100 text-primary border border-primary' 
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700')
                    ]"
                  >
                    {{ time }}
                    <span v-if="isTimeSlotTakenForEdit(editedClass.secondSem.daySchedule, time, editedClass._id, editedClass.secondSem.room, 'secondSem')" class="text-xs block">
                      (Taken - {{ getRoomForTimeSlot(editedClass.secondSem.daySchedule, time, editedClass._id) }})
                    </span>
                  </div>
                </div>
            <p v-if="errors.editSecondSem?.timeSchedule" class="mt-1.5 text-sm text-red-500">{{ errors.editSecondSem.timeSchedule }}</p>
              </div>
              <div v-else class="text-sm text-gray-500 p-2.5 border border-gray-200 rounded-lg bg-gray-50 h-full flex items-center justify-center">
                Please select a day first
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            @click="showEditModal = false"
            class="px-5 py-2.5 mr-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            @click="archiveClass"
            class="px-5 py-2.5 mr-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
          >
            Archive Class
          </button>
          <!-- Show update button based on active tab -->
          <button
            v-if="activeEditSemesterTab === '1st'"
            @click="updateFirstSemester"
            class="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            Update 1st Semester
          </button>
          <button
            v-if="activeEditSemesterTab === '2nd'"
            @click="updateSecondSemester"
            class="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            Update 2nd Semester
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { classService } from '../../services/classService'
import { subjectService } from '../../services/subjectService'
import { notificationService } from '../../services/notificationService'
import { systemOptionsService } from '../../services/systemOptionsService'
import ClassDetailsView from '../../components/admin/ClassDetailsView.vue'
import api from '../../services/api'
import { studentService } from '../../services/studentService'

// State
const loading = ref(true)
const allClasses = ref([])
const classes = ref([])
const showAddModal = ref(false)
const subjects = ref([])
const loadingSubjects = ref(false)
const selectedClass = ref(null)
const showDetailsModal = ref(false)
const currentClass = ref(null)
const editedClass = ref({
  _id: '',
  yearLevel: '',
  section: '',
  major: '',
  status: 'active',
  firstSem: {
    _id: '',
  daySchedule: '',
    timeSchedule: '',
  room: '',
    subjectId: ''
  },
  secondSem: {
    _id: '',
    daySchedule: '',
  timeSchedule: '',
    room: '',
  subjectId: ''
  }
})
const showEditModal = ref(false)
const activeDetailsTab = ref('1st') // For details view semester tabs
const firstSemesterClass = ref(null)
const secondSemesterClass = ref(null)
const activeEditSemesterTab = ref('1st') // For edit form semester tabs
const selectedEditFirstSemSubject = ref(null)
const selectedEditSecondSemSubject = ref(null)

// Missing refs
const addModalTitle = ref('Add New Class')
const secondSemesterMode = ref(false)
const originalClassForSecondSem = ref(null)
const activeSemesterTab = ref('1st')
const selectedFirstSemSubject = ref(null)
const selectedSecondSemSubject = ref(null)
const availableSectionsEdit = ref([])

// Time options
const timeOptions = [
  '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', 
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'
]

// Day options
const days = ref(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])

// Year level options
const yearLevelOptions = ref(['2nd', '3rd', '4th'])

// Major options
const majorOptions = computed(() => {
  const yearLevel = newClass.yearLevel || editedClass.value?.yearLevel || filters.yearLevel || '';
  
  // If we have year-level specific majors in system options
  if (yearLevel && systemOptionsData.value?.class?.majors && 
      systemOptionsData.value.class.majors[yearLevel] && 
      systemOptionsData.value.class.majors[yearLevel].length > 0) {
    return systemOptionsData.value.class.majors[yearLevel];
  }
  
  // Fallback to global majors from system options
  if (systemOptionsData.value?.class?.majors) {
    // Check if majors is an object (with year levels) or array (legacy format)
    if (Array.isArray(systemOptionsData.value.class.majors)) {
      return systemOptionsData.value.class.majors;
    } else {
      // If it's an object but we don't have the specific year level, merge all majors
      const allMajors = new Set();
      Object.values(systemOptionsData.value.class.majors).forEach(majorList => {
        if (Array.isArray(majorList)) {
          majorList.forEach(major => allMajors.add(major));
        }
      });
      return Array.from(allMajors);
    }
  }
  
  // Default if no system options available
  return ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'];
});

// Time schedule options - replaced by firstSemTimeScheduleOptions and secondSemTimeScheduleOptions

// Time schedule options for edit form based on selected subject
const editTimeScheduleOptions = computed(() => {
  const baseOptions = [
    '7:00 AM - 8:00 AM', '8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', 
    '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM'
  ];
  
  if (!selectedEditSubject.value || !selectedEditSubject.value.hours) {
    return baseOptions;
  }
  
  // Get the hours from the selected edit subject
  const hours = selectedEditSubject.value.hours || 1;
  
  if (hours === 1) {
    return baseOptions;
  }
  
  // Generate non-overlapping options based on hours
  // For multi-hour classes, create time slots that start every 'hours' hour
  const startTimes = [];
  for (let hour = 7; hour <= 21 - hours; hour += hours) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    startTimes.push(`${displayHour}:00 ${period}`);
  }
  
  return startTimes.map(startTime => {
    const endTime = calculateEndTime(startTime, hours);
    return `${startTime} - ${endTime}`;
  });
})

// Time schedule options for 1st semester based on selected subject
const firstSemTimeScheduleOptions = computed(() => {
  const baseOptions = [
    '7:00 AM - 8:00 AM', '8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', 
    '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'
  ];
  
  if (!selectedFirstSemSubject.value || !selectedFirstSemSubject.value.hours) {
    return baseOptions;
  }
  
  // Get the hours from the selected subject
  const hours = selectedFirstSemSubject.value.hours || 1;
  
  if (hours === 1) {
    return baseOptions;
  }
  
  // Generate non-overlapping options based on hours
  // For multi-hour classes, create time slots that start every 'hours' hour
  const startTimes = [];
  for (let hour = 7; hour <= 21 - hours; hour += hours) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    startTimes.push(`${displayHour}:00 ${period}`);
  }
  
  return startTimes.map(startTime => {
    const endTime = calculateEndTime(startTime, hours);
    return `${startTime} - ${endTime}`;
  });
});

// Time schedule options for 2nd semester based on selected subject
const secondSemTimeScheduleOptions = computed(() => {
  const baseOptions = [
    '7:00 AM - 8:00 AM', '8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', 
    '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'
  ];
  
  if (!selectedSecondSemSubject.value || !selectedSecondSemSubject.value.hours) {
    return baseOptions;
  }
  
  // Get the hours from the selected subject
  const hours = selectedSecondSemSubject.value.hours || 1;
  
  if (hours === 1) {
    return baseOptions;
  }
  
  // Generate non-overlapping options based on hours
  // For multi-hour classes, create time slots that start every 'hours' hour
  const startTimes = [];
  for (let hour = 7; hour <= 21 - hours; hour += hours) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    startTimes.push(`${displayHour}:00 ${period}`);
  }
  
  return startTimes.map(startTime => {
    const endTime = calculateEndTime(startTime, hours);
    return `${startTime} - ${endTime}`;
  });
});

// Calculate end time based on start time and hours
function calculateEndTime(startTime, hours) {
  if (!startTime || !hours) return '';
  
  // Convert hours to number if it's a string
  const hoursNum = typeof hours === 'string' ? parseInt(hours, 10) : hours;
  
  // Parse the start time
  const [timeStr, period] = startTime.split(' ');
  const [hourStr, minuteStr = '00'] = timeStr.split(':');
  
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  
  // Convert to 24-hour format for calculation
  if (period === 'PM' && hour < 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  // Add the hours from the subject
  hour += hoursNum;
  
  // Convert back to 12-hour format
  let newPeriod = period;
  if (hour >= 12) {
    newPeriod = 'PM';
    if (hour > 12) {
      hour -= 12;
    }
  } else if (hour === 0) {
    hour = 12;
    newPeriod = 'AM';
  }
  
  // Format the new time
  return `${hour}:${minuteStr < 10 && minuteStr !== '00' ? '0' + minuteStr : minuteStr} ${newPeriod}`;
}

// Form state
const newClass = reactive({
  yearLevel: '',
  section: '',
  major: '',
  status: 'active',
  firstSem: {
  daySchedule: '',
  timeSchedule: '',
  room: '',
    subjectId: ''
  },
  secondSem: {
    daySchedule: '',
    timeSchedule: '',
    room: '',
    subjectId: ''
  }
})

// Filters
const filters = reactive({
  search: '',
  yearLevel: '',
  major: ''
});

// Calendar view state
const viewMode = ref('list');
const calendarSemester = ref('1st');
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

// Error state
const errors = reactive({
  yearLevel: '',
  section: '',
  major: '',
  firstSem: {
  daySchedule: '',
    timeSchedule: '',
  room: '',
    subjectId: ''
  },
  secondSem: {
    daySchedule: '',
    timeSchedule: '',
    room: '',
    subjectId: ''
  }
})

// Add reactive variables for selected subjects only
const selectedSubject = ref(null)
const selectedEditSubject = ref(null)

// Computed properties
const filteredClasses = computed(() => {
  return allClasses.value.filter(classItem => {
    // Only include active classes
    if (classItem.status !== 'active') return false;
    
    const matchesYearLevel = !filters.yearLevel || classItem.yearLevel === filters.yearLevel
    const matchesMajor = !filters.major || classItem.major === filters.major
    
    const searchTerm = filters.search.toLowerCase()
    const matchesSearch = !searchTerm || 
      (classItem.section && classItem.section.toLowerCase().includes(searchTerm)) ||
      (classItem.subject && classItem.subject.sspCode && classItem.subject.sspCode.toLowerCase().includes(searchTerm)) ||
      (classItem.sspSubject && classItem.sspSubject.sspCode && classItem.sspSubject.sspCode.toLowerCase().includes(searchTerm))
    
    return matchesYearLevel && matchesMajor && matchesSearch
  })
})

// Filter subjects based on selected year level
const filteredSubjects = computed(() => {
  if (!newClass.yearLevel) {
    return subjects.value
  }
  return subjects.value.filter(subject => subject.yearLevel === newClass.yearLevel)
})

// Filter subjects for edit modal based on selected year level and semester
const editFilteredSubjects = computed(() => {
  if (!editedClass.value.yearLevel) {
    return subjects.value || [];
  }
  
  return (subjects.value || []).filter(subject => {
    // Filter by year level
    const yearLevelMatch = subject.yearLevel === editedClass.value.yearLevel;
    
    // Filter by semester if selected
    let semesterMatch = true;
    if (editedClass.value.semester) {
      semesterMatch = subject.semester && subject.semester.includes(editedClass.value.semester);
    }
    
    return yearLevelMatch && semesterMatch;
  });
})

// Filter for first semester subjects
const filteredFirstSemSubjects = computed(() => {
  if (!newClass.yearLevel) {
    return subjects.value;
  }
  
  return subjects.value.filter(subject => {
    // Filter by year level
    const yearLevelMatch = subject.yearLevel === newClass.yearLevel;
    
    // Filter for 1st semester subjects
    const semesterMatch = subject.semester && subject.semester.includes('1st');
    
    return yearLevelMatch && semesterMatch;
  });
});

// Filter for second semester subjects
const filteredSecondSemSubjects = computed(() => {
  if (!newClass.yearLevel) {
    return subjects.value;
  }
  
  return subjects.value.filter(subject => {
    // Filter by year level
    const yearLevelMatch = subject.yearLevel === newClass.yearLevel;
    
    // Filter for 2nd semester subjects
    const semesterMatch = subject.semester && subject.semester.includes('2nd');
    
    return yearLevelMatch && semesterMatch;
  });
});

// Section options based on year level
const availableSections = computed(() => {
  if (!newClass.yearLevel) {
    return []
  }
  
  // Use system options data directly if available
  if (systemOptionsData.value?.class?.sections?.[newClass.yearLevel]) {
    return systemOptionsData.value.class.sections[newClass.yearLevel]
  }
  
  // Fallback to default sections if system options aren't available
  if (newClass.yearLevel === '2nd') {
    return ['South-1', 'South-2', 'South-3', 'South-4', 'South-5']
  } else if (newClass.yearLevel === '3rd') {
    return ['South-1', 'South-2', 'South-3']
  } else if (newClass.yearLevel === '4th') {
    return ['South-1', 'South-2']
  }
  return []
})

// Section options based on year level for edit modal
const editAvailableSections = computed(() => {
  if (!editedClass.value.yearLevel) {
    return []
  }
  
  // Use system options data directly if available
  if (systemOptionsData.value?.class?.sections?.[editedClass.value.yearLevel]) {
    return systemOptionsData.value.class.sections[editedClass.value.yearLevel]
  }
  
  // Fallback to default sections if system options aren't available
  if (editedClass.value.yearLevel === '2nd') {
    return ['South-1', 'South-2', 'South-3', 'South-4', 'South-5']
  } else if (editedClass.value.yearLevel === '3rd') {
    return ['South-1', 'South-2', 'South-3']
  } else if (editedClass.value.yearLevel === '4th') {
    return ['South-1', 'South-2']
  }
  return []
})

// Add systemOptions ref to store the fetched options
const systemOptionsData = ref(null)

// Watch for system options changes
watch(systemOptionsData, (newVal) => {
  if (newVal) {
    console.log('System options data changed, updating UI components')
    
    // Force re-evaluation of computed properties
    if (showAddModal.value || showEditModal.value) {
      // If a modal is open, this will ensure the dropdowns are updated with new values
      const tempYearLevel = newClass.yearLevel
      newClass.yearLevel = ''
      // Use nextTick to ensure the DOM updates
      nextTick(() => {
        newClass.yearLevel = tempYearLevel
      })
    }
  }
}, { deep: true })

// Removed auto-assignment; admin will manage assignments explicitly

// Fetch data on mount
onMounted(async () => {
  try {
    await loadSystemOptions()
    await fetchClasses()
    await fetchSubjects()
    
    // No auto-assignment here; keep students unassigned until admin assigns
  } catch (error) {
    console.error('Error initializing classes view:', error)
    notificationService.showError('Failed to load initial data')
  }
})

// Load system options from API
async function loadSystemOptions() {
  try {
    // Fetch system options from API
    const systemOptions = await systemOptionsService.getAll()
    
    // Store the options data for use in computed properties
    systemOptionsData.value = systemOptions
    
    // Update year level options
    if (systemOptions?.class?.yearLevels && systemOptions.class.yearLevels.length > 0) {
      yearLevelOptions.value = systemOptions.class.yearLevels
      console.log('Setting year level options from system config:', yearLevelOptions.value)
    }
    
    // Update major options
    if (systemOptions?.class?.majors && systemOptions.class.majors.length > 0) {
      majorOptions.value = systemOptions.class.majors
      console.log('Setting major options from system config:', majorOptions.value)
    }
    
    // Update default sessions
    if (systemOptions?.class?.defaultSessions && systemOptions.class.defaultSessions.length > 0) {
      defaultSessions.value = systemOptions.class.defaultSessions
      console.log('Setting default sessions from system config:', defaultSessions.value)
    }
    
    console.log('System options loaded successfully')
  } catch (error) {
    console.error('Error loading system options:', error)
    // Continue with defaults
    notificationService.showWarning('Using default system options. Settings not loaded from server.')
  }
}

// Add defaultSessions ref
const defaultSessions = ref([
  { title: 'INTRODUCTION', count: 0 },
  { title: 'ORIENTATION', count: 0 }
])

// Methods
async function fetchClasses() {
  loading.value = true;
  try {
    console.log('Fetching active classes from server');
    const response = await classService.getAll();
    console.log(`Got ${response.length} raw classes from API`);
    
    // Process classes to ensure semester information is properly set
    const processedClasses = await Promise.all(response.map(async classItem => {
      // Make a copy to avoid mutating the original
      const processedClass = { ...classItem };
      
      console.log(`Processing class ${processedClass._id}`, { 
        hasSubject: !!processedClass.subject,
        hasSSPSubject: !!processedClass.sspSubject,
        originalSemester: processedClass.sspSubject?.semester || processedClass.subject?.semester || 'none'
      });
      
      // If sspSubject is just an ID reference, fetch the full subject data
      if (processedClass.sspSubject && (typeof processedClass.sspSubject === 'string' || !processedClass.sspSubject.sspCode)) {
        const subjectId = typeof processedClass.sspSubject === 'string' ? processedClass.sspSubject : processedClass.sspSubject._id;
        console.log(`Class ${processedClass._id} has sspSubject as ID reference, fetching full subject data for ID: ${subjectId}`);
        
        try {
          const subjectResponse = await api.get(`/subjects/${subjectId}`);
          if (subjectResponse.data) {
            processedClass.sspSubject = subjectResponse.data;
            console.log(`Fetched full subject data for class ${processedClass._id}:`, {
              sspCode: processedClass.sspSubject.sspCode,
              semester: processedClass.sspSubject.semester
            });
          }
        } catch (err) {
          console.error(`Error fetching subject data for class ${processedClass._id}:`, err);
        }
      }
      
      // Handle semester information
      if (processedClass.sspSubject) {
        // Ensure sspSubject is a full object, not just an ID reference
        if (typeof processedClass.sspSubject === 'string' || !processedClass.sspSubject.sspCode) {
          console.log(`Class ${processedClass._id} has sspSubject as ID or incomplete object, need to populate`);
          processedClass.needsSubjectData = true;
          
          // Create a temporary placeholder
          if (typeof processedClass.sspSubject === 'string') {
            processedClass.sspSubjectId = processedClass.sspSubject;
            processedClass.sspSubject = {
              sspCode: 'Loading...',
              semester: '',
              schoolYear: '2024 - 2025'
            };
          }
        }
        
        // Ensure semester is set from subject if missing in sspSubject
        if (!processedClass.sspSubject.semester && processedClass.subject && processedClass.subject.semester) {
          console.log(`Setting semester ${processedClass.subject.semester} from subject for class ${processedClass._id}`);
          processedClass.sspSubject.semester = processedClass.subject.semester;
        }
      } else if (processedClass.subject) {
        // Create sspSubject if it doesn't exist but subject does
        console.log(`Creating sspSubject from subject for class ${processedClass._id}`);
        processedClass.sspSubject = {
          sspCode: processedClass.subject.sspCode || '',
          semester: processedClass.subject.semester || '',
          schoolYear: processedClass.subject.schoolYear || '2024 - 2025',
          hours: processedClass.subject.hours || 1
        };
      } else if (processedClass.sspSubjectId) {
        // If we have a subject ID but no subject data, fetch the subject directly
        console.log(`Class ${processedClass._id} has sspSubjectId but no subject data, fetching from API`);
        try {
          const subjectResponse = await api.get(`/subjects/${processedClass.sspSubjectId}`);
          if (subjectResponse.data) {
            processedClass.sspSubject = subjectResponse.data;
            console.log(`Fetched subject data for class ${processedClass._id}:`, {
              sspCode: processedClass.sspSubject.sspCode,
              semester: processedClass.sspSubject.semester
            });
          } else {
            processedClass.sspSubject = {
              sspCode: 'Not Found',
              semester: '',
              schoolYear: '2024 - 2025'
            };
          }
        } catch (err) {
          console.error(`Error fetching subject for class ${processedClass._id}:`, err);
          processedClass.sspSubject = {
            sspCode: 'Error Loading',
            semester: '',
            schoolYear: '2024 - 2025'
          };
        }
      }
      
      // If still no semester, try to fetch the class with populated subject
      if (!processedClass.sspSubject?.semester) {
        try {
          console.log(`No semester found for class ${processedClass._id}, trying to fetch complete class data`);
          const classResponse = await api.get(`/classes/${processedClass._id}`);
          if (classResponse.data) {
            if (classResponse.data.sspSubject && classResponse.data.sspSubject.semester) {
              if (!processedClass.sspSubject) processedClass.sspSubject = {};
              processedClass.sspSubject.sspCode = classResponse.data.sspSubject.sspCode || processedClass.sspSubject.sspCode;
              processedClass.sspSubject.semester = classResponse.data.sspSubject.semester;
              console.log(`Updated semester to ${processedClass.sspSubject.semester} from class API`);
            } else if (classResponse.data.subject && classResponse.data.subject.semester) {
              if (!processedClass.sspSubject) processedClass.sspSubject = {};
              processedClass.sspSubject.sspCode = classResponse.data.subject.sspCode || processedClass.sspSubject.sspCode;
              processedClass.sspSubject.semester = classResponse.data.subject.semester;
              console.log(`Updated semester to ${processedClass.sspSubject.semester} from subject in class API`);
            }
          }
        } catch (err) {
          console.error(`Error fetching complete class data for ${processedClass._id}:`, err);
        }
      }
      
      console.log(`Final semester for class ${processedClass._id}: ${processedClass.sspSubject?.semester || 'Not set'}`);
      return processedClass;
    }));
    
    // Make sure we only include active classes in the list
    const activeClasses = processedClasses.filter(classItem => classItem.status === 'active');
    console.log(`Filtered down to ${activeClasses.length} active classes`);
    
    // Update the state with the processed classes
    allClasses.value = processedClasses;
    classes.value = filteredClasses.value;
    
    // Check which classes have second semester counterparts
    await checkSecondSemesterClasses();
  } catch (error) {
    console.error('Error fetching classes:', error);
    notificationService.showError('Failed to load classes: ' + (error.message || 'Unknown error'));
  } finally {
    loading.value = false;
  }
}

async function fetchSubjects() {
  loadingSubjects.value = true
  try {
    const response = await subjectService.getAll()
    subjects.value = response
  } catch (error) {
    console.error('Error fetching subjects:', error)
    notificationService.showError('Failed to fetch subjects. Please try again later.')
    subjects.value = []
  } finally {
    loadingSubjects.value = false
  }
}

function handleSearchInput() {
  classes.value = filteredClasses.value
}

async function openAddModal() {
  // Reset form
  newClass.yearLevel = '';
  newClass.section = '';
  newClass.major = '';
  newClass.status = 'active';
  
  newClass.firstSem.daySchedule = '';
  newClass.firstSem.timeSchedule = '';
  newClass.firstSem.room = '';
  newClass.firstSem.subjectId = '';
  
  newClass.secondSem.daySchedule = '';
  newClass.secondSem.timeSchedule = '';
  newClass.secondSem.room = '';
  newClass.secondSem.subjectId = '';
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    if (typeof errors[key] === 'object') {
      Object.keys(errors[key]).forEach(subKey => {
        errors[key][subKey] = '';
      });
    } else {
      errors[key] = '';
    }
  });
  
  // Reset modal state
  addModalTitle.value = 'Add New Class';
  activeSemesterTab.value = '1st';
  secondSemesterMode.value = false;
  originalClassForSecondSem.value = null;
  
  // Reload system options to ensure we have the latest
  await loadSystemOptions();
  
  // Fetch subjects if not already loaded
  if (subjects.value.length === 0) {
    await fetchSubjects();
  }
  
  // Check if there are any subjects available
  if (subjects.value.length === 0) {
    console.warn('No subjects available. Please add subjects first before creating a class.');
    notificationService.showWarning('No subjects available. Please add subjects first before creating a class.');
    return;
  }
  
  showAddModal.value = true;
}

function closeAddModal() {
  showAddModal.value = false
}

// validateForm function moved to the bottom of the file

async function addClass() {
  // Validate form fields
  if (!validateForm()) {
    return;
  }
  
  try {
    // Create the 1st semester class if data is provided
    let firstSemResult = null;
    if (newClass.firstSem.subjectId && newClass.firstSem.daySchedule && 
        newClass.firstSem.timeSchedule && newClass.firstSem.room) {
      firstSemResult = await createFirstSemesterClass();
    }
    
    // Create the 2nd semester class if data is provided
    let secondSemResult = null;
    if (newClass.secondSem.subjectId && newClass.secondSem.daySchedule && 
        newClass.secondSem.timeSchedule && newClass.secondSem.room) {
      secondSemResult = await createSecondSemesterClass(firstSemResult);
    }
    
    // Show appropriate success message
    if (firstSemResult && secondSemResult) {
      notificationService.showSuccess('Both semester classes created successfully');
    } else if (firstSemResult) {
      notificationService.showSuccess('1st semester class created successfully');
    } else if (secondSemResult) {
      notificationService.showSuccess('2nd semester class created successfully');
    } else {
      notificationService.showWarning('No classes were created. Please check your input.');
      return;
    }
    
    // Close modal and refresh data
    closeAddModal();
    await fetchClasses();
    
  } catch (error) {
    console.error('Error adding class(es):', error);
    
    // Show more detailed error information
    if (error.response && error.response.data) {
      console.error('Server error details:', error.response.data);
      notificationService.showError(error.response.data.message || 'Failed to add class. Please check your inputs.');
    } else {
      notificationService.showError('Failed to add class. Please try again later.');
    }
  }
}

// Helper function to create 1st semester class
async function createFirstSemesterClass() {
  // Skip first semester creation if in second semester mode
  if (secondSemesterMode.value) {
    return originalClassForSecondSem.value;
  }
  
    // Find the selected subject for hours value
  const subject = subjects.value.find(s => s._id === newClass.firstSem.subjectId);
    if (!subject) {
    throw new Error('Selected subject for 1st semester not found.');
    }
    
    // Make sure hours is a number, not a string
    const hours = typeof subject.hours === 'string' 
      ? parseInt(subject.hours, 10) 
      : (subject.hours || 1);
    
  // Construct the class data
    const classData = {
      yearLevel: newClass.yearLevel,
      section: newClass.section,
      major: newClass.major,
    daySchedule: newClass.firstSem.daySchedule,
    timeSchedule: newClass.firstSem.timeSchedule,
    room: newClass.firstSem.room,
      status: 'active',
    sspSubjectId: newClass.firstSem.subjectId,
      hours: hours
    };
    
  // If second semester data is available, add it
  if (hasSecondSemesterData()) {
    const secondSemSubject = subjects.value.find(s => s._id === newClass.secondSem.subjectId);
    if (secondSemSubject) {
      const secondSemHours = typeof secondSemSubject.hours === 'string'
        ? parseInt(secondSemSubject.hours, 10)
        : (secondSemSubject.hours || 1);
        
      classData.secondSemDaySchedule = newClass.secondSem.daySchedule;
      classData.secondSemTimeSchedule = newClass.secondSem.timeSchedule;
      classData.secondSemRoom = newClass.secondSem.room;
      classData.secondSemSubjectId = newClass.secondSem.subjectId;
      classData.secondSemHours = secondSemHours;
    }
  }
  
  console.log('Creating class with both semester data:', classData);
    
    const response = await classService.create(classData);
    console.log('Class created successfully:', response);
    
  // Add to advisory classes collection
    try {
      const advisoryResponse = await api.post('/advisers/advisory/classes', {
        class: response._id
      });
    console.log('Created advisory class entry:', advisoryResponse.data);
    } catch (advisoryError) {
      console.error('Error creating advisory class entry:', advisoryError);
    notificationService.showWarning('Class created but could not add to advisory classes.');
    }
    
  // Add to local list
    allClasses.value.push(response);
    classes.value = filteredClasses.value;
  
  notificationService.showSuccess('Class created successfully with both semester data');
  return response;
}

// Helper function to create 2nd semester class
async function createSecondSemesterClass(firstSemClass) {
  // Since we're now storing both semesters in a single class record,
  // we'll just update the existing first semester class if it exists
  if (firstSemClass && firstSemClass._id) {
    console.log('Updating existing class with second semester data:', firstSemClass);
    
    // Find the selected subject for hours value
    const subject = subjects.value.find(s => s._id === newClass.secondSem.subjectId);
    if (!subject) {
      throw new Error('Selected subject for 2nd semester not found.');
    }
    
    // Make sure hours is a number, not a string
    const hours = typeof subject.hours === 'string' 
      ? parseInt(subject.hours, 10) 
      : (subject.hours || 1);
    
    // Prepare update data
    const updateData = {
      secondSemDaySchedule: newClass.secondSem.daySchedule,
      secondSemTimeSchedule: newClass.secondSem.timeSchedule,
      secondSemRoom: newClass.secondSem.room,
      secondSemSubjectId: newClass.secondSem.subjectId,
      secondSemHours: hours
    };
    
    try {
      const response = await classService.update(firstSemClass._id, updateData);
      console.log('Updated class with second semester data:', response);
      
      // Update local data
      const index = allClasses.value.findIndex(c => c._id === firstSemClass._id);
      if (index !== -1) {
        allClasses.value[index] = response;
    } else {
        allClasses.value.push(response);
      }
      
      classes.value = filteredClasses.value;
      
      notificationService.showSuccess('Second semester data added successfully');
      return response;
    } catch (error) {
      console.error('Error updating class with second semester data:', error);
      throw error;
    }
  } else {
    // If no first semester class exists, create a new class with second semester data only
    console.log('No first semester class exists, creating new class with second semester data only');
    
    // Find the selected subject for hours value
    const subject = subjects.value.find(s => s._id === newClass.secondSem.subjectId);
    if (!subject) {
      throw new Error('Selected subject for 2nd semester not found.');
    }
    
    // Make sure hours is a number, not a string
    const hours = typeof subject.hours === 'string' 
      ? parseInt(subject.hours, 10) 
      : (subject.hours || 1);
    
    // Use second semester data for the main fields for display purposes
    const classData = {
      yearLevel: newClass.yearLevel,
      section: newClass.section,
      major: newClass.major,
      daySchedule: newClass.secondSem.daySchedule,
      timeSchedule: newClass.secondSem.timeSchedule,
      room: newClass.secondSem.room,
      status: 'active',
      sspSubjectId: newClass.secondSem.subjectId,
      hours: hours,
      // Add second semester data
      secondSemDaySchedule: newClass.secondSem.daySchedule,
      secondSemTimeSchedule: newClass.secondSem.timeSchedule,
      secondSemRoom: newClass.secondSem.room,
      secondSemSubjectId: newClass.secondSem.subjectId,
      secondSemHours: hours
    };
    
    try {
      const response = await classService.create(classData);
      console.log('Created new class with second semester data:', response);
      
      // Add to advisory classes collection
      try {
        const advisoryResponse = await api.post('/advisers/advisory/classes', {
          class: response._id
        });
        console.log('Created advisory class entry for second semester:', advisoryResponse.data);
      } catch (advisoryError) {
        console.error('Error creating advisory class entry for second semester:', advisoryError);
        notificationService.showWarning('Second semester class created but could not add to advisory classes.');
      }
      
      // Add to local list
      allClasses.value.push(response);
      classes.value = filteredClasses.value;
      
      notificationService.showSuccess('Second semester class created successfully');
      return response;
    } catch (error) {
      console.error('Error creating second semester class:', error);
      throw error;
    }
  }
}

// Helper to check if second semester data is provided
function hasSecondSemesterData() {
  return newClass.secondSem.subjectId && 
         newClass.secondSem.daySchedule && 
         newClass.secondSem.timeSchedule && 
         newClass.secondSem.room;
}

// Enhanced viewDetails function to better find both semester classes
async function viewDetails(classItem) {
  console.log('View details for class:', classItem);
  
  // Reset semester classes
  firstSemesterClass.value = null;
  secondSemesterClass.value = null;
  activeDetailsTab.value = '1st';
  
  // Set the selected class as reference
  selectedClass.value = classItem;
  
  try {
    // Always fetch the full class data to ensure we have all semester information
    const response = await api.get(`/classes/${classItem._id}`);
    const populatedClass = response.data;
    
    console.log('Fetched class data for details:', populatedClass);
    
    // Extract semester-specific data
    let firstSemData = null;
    let secondSemData = null;
    
    // Check for new semester structure (with firstSemester/secondSemester properties)
    if (populatedClass.firstSemester || populatedClass.secondSemester) {
      console.log('Class has new semester structure');
      
      // Set first semester data if available
      if (populatedClass.firstSemester) {
        firstSemData = {
          _id: populatedClass._id,
          yearLevel: populatedClass.yearLevel,
          section: populatedClass.section,
          major: populatedClass.major,
          status: populatedClass.status,
          daySchedule: populatedClass.firstSemester.daySchedule || populatedClass.daySchedule,
          timeSchedule: populatedClass.firstSemester.timeSchedule || populatedClass.timeSchedule,
          room: populatedClass.firstSemester.room || populatedClass.room,
          sspSubject: populatedClass.firstSemester.sspSubject || populatedClass.sspSubject,
          hours: populatedClass.firstSemester.hours || populatedClass.hours,
          students: populatedClass.students || []
        };
      }
      
      // Set second semester data if available
      if (populatedClass.secondSemester) {
        secondSemData = {
          _id: populatedClass._id,
          yearLevel: populatedClass.yearLevel,
          section: populatedClass.section,
          major: populatedClass.major,
          status: populatedClass.status,
          daySchedule: populatedClass.secondSemester.daySchedule || populatedClass.daySchedule,
          timeSchedule: populatedClass.secondSemester.timeSchedule || populatedClass.timeSchedule,
          room: populatedClass.secondSemester.room || populatedClass.room,
          sspSubject: populatedClass.secondSemester.sspSubject || populatedClass.sspSubject,
          hours: populatedClass.secondSemester.hours || populatedClass.hours,
          students: populatedClass.students || []
        };
        
        // For edit form
        const subjectId = extractSubjectId(
          populatedClass.secondSemester && populatedClass.secondSemester.sspSubject 
            ? populatedClass.secondSemester.sspSubject 
            : null
        );
        
        editedClass.value.secondSem = {
          _id: populatedClass._id,
          daySchedule: populatedClass.secondSemester.daySchedule || '',
          timeSchedule: populatedClass.secondSemester.timeSchedule || '',
          room: populatedClass.secondSemester.room || '',
          subjectId: subjectId
        };
        
        // Find the selected subject
        if (editedClass.value.secondSem.subjectId) {
          selectedEditSecondSemSubject.value = subjects.value.find(
            s => s._id === editedClass.value.secondSem.subjectId
          );
          console.log('Selected second semester subject:', selectedEditSecondSemSubject.value);
        }
      }
    } else {
      // Handle legacy data or single semester class
      console.log('Class has standard structure, checking semester');
      
      // Get semester of the selected class
      const semester = populatedClass.sspSubject?.semester || populatedClass.subject?.semester || '';
      console.log('Class semester:', semester);
      
      if (semester.includes('1st') || !semester) {
        // This is a first semester class
        firstSemData = populatedClass;
      } else if (semester.includes('2nd')) {
        // This is a second semester class
        secondSemData = populatedClass;
        activeDetailsTab.value = '2nd';
      } else {
        // Default to first semester if no semester info
        firstSemData = populatedClass;
      }
      
      // Try to find the other semester class
      try {
        // Find all classes with the same year level, section, and major
        const otherClassesResponse = await api.get('/classes', {
          params: {
            yearLevel: populatedClass.yearLevel,
            section: populatedClass.section,
            major: populatedClass.major,
            status: 'active'
          }
        });
      
        if (otherClassesResponse.data && otherClassesResponse.data.length > 0) {
          // Look for the other semester class
          for (const cls of otherClassesResponse.data) {
            // Skip the current class
            if (cls._id === populatedClass._id) continue;
            
            const clsSemester = cls.sspSubject?.semester || cls.subject?.semester || '';
            
            // If we already have first semester data and this is a second semester class
            if (firstSemData && clsSemester.includes('2nd')) {
              // Get the full details of this class
              const otherClassResponse = await api.get(`/classes/${cls._id}`);
              secondSemData = otherClassResponse.data;
              break;
            }
            
            // If we already have second semester data and this is a first semester class
            if (secondSemData && (clsSemester.includes('1st') || !clsSemester)) {
              // Get the full details of this class
              const otherClassResponse = await api.get(`/classes/${cls._id}`);
              firstSemData = otherClassResponse.data;
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error finding other semester class:', error);
      }
    }
        
    // Set the semester classes in the component state
    firstSemesterClass.value = firstSemData;
    secondSemesterClass.value = secondSemData;
    
    // Set appropriate tab based on available data
    if (!firstSemData && secondSemData) {
      activeDetailsTab.value = '2nd';
    }
    
    console.log('First semester data:', firstSemData ? 'Available' : 'Not available');
    console.log('Second semester data:', secondSemData ? 'Available' : 'Not available');
    if (secondSemData) {
      console.log('Second semester subject:', secondSemData.sspSubject);
      console.log('Second semester room:', secondSemData.room);
      console.log('Second semester day schedule:', secondSemData.daySchedule);
      console.log('Second semester time schedule:', secondSemData.timeSchedule);
    }
  
    // Show the details modal
    showDetailsModal.value = true;
  } catch (error) {
    console.error('Error fetching class details:', error);
    notificationService.showError('Error loading class details: ' + error.message);
    
    // Fallback to just showing the selected class
    firstSemesterClass.value = classItem;
    showDetailsModal.value = true;
  }
}

// Helper function to fetch students for both semester classes
async function fetchStudentsForSemesterClasses() {
  try {
    console.log('fetchStudentsForSemesterClasses called');
    
    // Fetch full class data for first semester class if needed
    if (firstSemesterClass.value && (!firstSemesterClass.value.students || firstSemesterClass.value.students.length === 0)) {
      console.log(`Fetching students for first semester class ${firstSemesterClass.value._id}`);
      
      try {
        const response = await api.get(`/classes/${firstSemesterClass.value._id}`);
        if (response.data) {
          // Update only the students array, keep other properties
          firstSemesterClass.value.students = response.data.students || [];
          console.log(`Got ${firstSemesterClass.value.students.length} students for first semester class`);
          
          // Log first few students for debugging
          if (firstSemesterClass.value.students.length > 0) {
            const sampleStudents = firstSemesterClass.value.students.slice(0, 3);
            console.log('Sample students from first semester:', sampleStudents.map(s => s.user ? `${s.user.firstName} ${s.user.lastName}` : 'No user data'));
          }
        }
      } catch (error) {
        console.error('Error fetching first semester class students:', error);
      }
    } else {
      console.log('First semester class already has students or is null:', 
        firstSemesterClass.value ? `Students: ${firstSemesterClass.value.students?.length || 0}` : 'Class is null');
    }
    
    // Fetch full class data for second semester class if needed
    if (secondSemesterClass.value && (!secondSemesterClass.value.students || secondSemesterClass.value.students.length === 0)) {
      console.log(`Fetching students for second semester class ${secondSemesterClass.value._id}`);
      
      try {
        const response = await api.get(`/classes/${secondSemesterClass.value._id}`);
        if (response.data) {
          // Update only the students array, keep other properties
          secondSemesterClass.value.students = response.data.students || [];
          console.log(`Got ${secondSemesterClass.value.students.length} students for second semester class`);
          
          // Log first few students for debugging
          if (secondSemesterClass.value.students.length > 0) {
            const sampleStudents = secondSemesterClass.value.students.slice(0, 3);
            console.log('Sample students from second semester:', sampleStudents.map(s => s.user ? `${s.user.firstName} ${s.user.lastName}` : 'No user data'));
          }
        }
      } catch (error) {
        console.error('Error fetching second semester class students:', error);
      }
    } else {
      console.log('Second semester class already has students or is null:', 
        secondSemesterClass.value ? `Students: ${secondSemesterClass.value.students?.length || 0}` : 'Class is null');
    }
    
    console.log('Finished fetching students for semester classes');
  } catch (error) {
    console.error('Error in fetchStudentsForSemesterClasses:', error);
  }
}

async function editClass(classItem) {
  console.log('Opening edit modal for class:', classItem);
  
  if (!classItem) {
    notificationService.showError('Invalid class data');
    return;
  }
  
  // Reset errors first
  Object.keys(errors).forEach(key => {
    if (typeof errors[key] === 'object') {
      Object.keys(errors[key]).forEach(subKey => {
        errors[key][subKey] = '';
      });
    } else {
    errors[key] = '';
    }
  });

    // Reload system options first to ensure we have the latest
  try {
    await loadSystemOptions();
    
    // Fetch subjects if not already loaded
    if (subjects.value.length === 0) {
          loadingSubjects.value = true;
      await fetchSubjects();
              loadingSubjects.value = false;
    }
    
    // Get the full class data with populated semester information
    const response = await api.get(`/classes/${classItem._id}`);
    const populatedClass = response.data;
    
    // Reset the edit form state
    editedClass.value = {
      _id: populatedClass._id,
      yearLevel: populatedClass.yearLevel || '',
      section: populatedClass.section || '',
      major: populatedClass.major || '',
      status: populatedClass.status || 'active',
      firstSem: {
        _id: populatedClass._id,
        daySchedule: '',
        timeSchedule: '',
        room: '',
        subjectId: ''
      },
      secondSem: {
        _id: populatedClass._id,
        daySchedule: '',
        timeSchedule: '',
        room: '',
        subjectId: ''
      }
    };
    
    // Set the active semester tab based on the class data
    const semester = populatedClass.sspSubject?.semester || populatedClass.subject?.semester || '';
    activeEditSemesterTab.value = semester.includes('2nd') ? '2nd' : '1st';
    
    // Get available sections for the selected year level
    if (populatedClass.yearLevel && systemOptionsData.value?.class?.sections) {
      availableSectionsEdit.value = systemOptionsData.value.class.sections[populatedClass.yearLevel] || [];
    } else {
      availableSectionsEdit.value = [];
    }
    
    // Check if class has the new semester structure
    const hasNewStructure = populatedClass.firstSemester || populatedClass.secondSemester;
    
    if (hasNewStructure) {
      console.log('Class has new semester structure, setting up edit form with both semesters');
      
      // Set first semester data if available
      if (populatedClass.firstSemester) {
        const subjectId = extractSubjectId(
          populatedClass.firstSemester && populatedClass.firstSemester.sspSubject 
            ? populatedClass.firstSemester.sspSubject 
            : populatedClass.sspSubject
        );
        
        editedClass.value.firstSem = {
          _id: populatedClass._id,
          daySchedule: populatedClass.firstSemester.daySchedule || populatedClass.daySchedule || '',
          timeSchedule: populatedClass.firstSemester.timeSchedule || populatedClass.timeSchedule || '',
          room: populatedClass.firstSemester.room || populatedClass.room || '',
          subjectId: subjectId
        };
        
        // Find the selected subject
        if (editedClass.value.firstSem.subjectId) {
          selectedEditFirstSemSubject.value = subjects.value.find(
            s => s._id === editedClass.value.firstSem.subjectId
          );
          console.log('Selected first semester subject:', selectedEditFirstSemSubject.value);
        }
        } else {
        // Use main class data for first semester if no specific first semester data
        const subjectId = extractSubjectId(populatedClass.sspSubject);
        
        editedClass.value.firstSem = {
          _id: populatedClass._id,
          daySchedule: populatedClass.daySchedule || '',
          timeSchedule: populatedClass.timeSchedule || '',
          room: populatedClass.room || '',
          subjectId: subjectId
        };
        
        // Find the selected subject
        if (editedClass.value.firstSem.subjectId) {
          selectedEditFirstSemSubject.value = subjects.value.find(
            s => s._id === editedClass.value.firstSem.subjectId
          );
          console.log('Selected first semester subject (fallback):', selectedEditFirstSemSubject.value);
        }
      }
      
      // Set second semester data if available
      if (populatedClass.secondSemester) {
        const subjectId = extractSubjectId(
          populatedClass.secondSemester && populatedClass.secondSemester.sspSubject 
            ? populatedClass.secondSemester.sspSubject 
            : null
        );
        
        editedClass.value.secondSem = {
          _id: populatedClass._id,
          daySchedule: populatedClass.daySchedule || '',
          timeSchedule: populatedClass.timeSchedule || '',
          room: populatedClass.room || '',
          subjectId: subjectId
        };
        
        // Find the selected subject
        if (editedClass.value.secondSem.subjectId) {
          selectedEditSecondSemSubject.value = subjects.value.find(
            s => s._id === editedClass.value.secondSem.subjectId
          );
          console.log('Selected second semester subject (legacy):', selectedEditSecondSemSubject.value);
        }
        
        // Set the active tab to second semester
        activeEditSemesterTab.value = '2nd';
      } else {
        // This is a first semester class or unspecified
        const subjectId = extractSubjectId(populatedClass.sspSubject);
        
            editedClass.value.firstSem = {
          _id: populatedClass._id,
          daySchedule: populatedClass.daySchedule || '',
          timeSchedule: populatedClass.timeSchedule || '',
          room: populatedClass.room || '',
          subjectId: subjectId
            };
            
            // Find the selected subject
            if (editedClass.value.firstSem.subjectId) {
              selectedEditFirstSemSubject.value = subjects.value.find(
                s => s._id === editedClass.value.firstSem.subjectId
              );
          console.log('Selected first semester subject (legacy):', selectedEditFirstSemSubject.value);
            }
          }
    }
    
    // Add a handler for year level changes
    const unwatchYearLevel = watch(() => editedClass.value.yearLevel, (newYearLevel) => {
      if (newYearLevel && systemOptionsData.value?.class?.sections) {
        availableSectionsEdit.value = systemOptionsData.value.class.sections[newYearLevel] || [];
      } else {
        availableSectionsEdit.value = [];
      }
    });
    
    console.log('Edit form setup complete with data:', editedClass.value);
    
    // Show the edit modal
    showEditModal.value = true;
    
    // Remove the watcher when the modal is closed
    watch(() => showEditModal.value, (isOpen) => {
      if (!isOpen) {
        unwatchYearLevel();
      }
    }, { once: true });
    
  } catch (error) {
    console.error('Error opening edit modal:', error);
    notificationService.showError('Error opening edit modal: ' + error.message);
  }
}

// Helper function to extract subject ID from various subject formats
function extractSubjectId(subject) {
  if (!subject) return '';
  
  if (typeof subject === 'string') {
    return subject;
  }
  
  if (subject._id) {
    return subject._id;
  }
  
  return '';
}

// Add a reactive map to track which classes have second semester counterparts
const hasSecondSemesterClassMap = ref({})

// Add a function to check all classes for second semester counterparts
async function checkSecondSemesterClasses() {
  for (const classItem of allClasses.value) {
    if (isFirstSemesterClass(classItem)) {
      hasSecondSemesterClassMap.value[classItem._id] = await hasSecondSemesterClass(classItem)
    }
  }
}

// Add helper function for semester badge styling
function getSemesterBadgeClass(classItem) {
  const semester = classItem.sspSubject?.semester || classItem.subject?.semester || '';
  
  if (semester.includes('1st')) {
    return 'bg-blue-100 text-blue-800';
  } else if (semester.includes('2nd')) {
    return 'bg-green-100 text-green-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
}

// Filter subjects for edit modal 1st semester
const editFilteredFirstSemSubjects = computed(() => {
  if (!editedClass.value.yearLevel) {
    return subjects.value || [];
  }
  
  return (subjects.value || []).filter(subject => {
    // Filter by year level
    const yearLevelMatch = subject.yearLevel === editedClass.value.yearLevel;
    
    // Filter for 1st semester subjects
    const semesterMatch = subject.semester && subject.semester.includes('1st');
    
    return yearLevelMatch && semesterMatch;
  });
})

// Filter subjects for edit modal 2nd semester
const editFilteredSecondSemSubjects = computed(() => {
  if (!editedClass.value.yearLevel) {
    return subjects.value || [];
  }
  
  return (subjects.value || []).filter(subject => {
    // Filter by year level
    const yearLevelMatch = subject.yearLevel === editedClass.value.yearLevel;
    
    // Filter for 2nd semester subjects
    const semesterMatch = subject.semester && subject.semester.includes('2nd');
    
    return yearLevelMatch && semesterMatch;
  });
})

// Time schedule options for 1st semester edit based on selected subject
const editFirstSemTimeScheduleOptions = computed(() => {
  const baseOptions = [
    '7:00 AM - 8:00 AM', '8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', 
    '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'
  ];
  
  if (!selectedEditFirstSemSubject.value || !selectedEditFirstSemSubject.value.hours) {
    return baseOptions;
  }
  
  // Get the hours from the selected subject
  const hours = selectedEditFirstSemSubject.value.hours || 1;
  
  if (hours === 1) {
    return baseOptions;
  }
  
  // Generate non-overlapping options based on hours
  // For multi-hour classes, create time slots that start every 'hours' hour
  const startTimes = [];
  for (let hour = 7; hour <= 21 - hours; hour += hours) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    startTimes.push(`${displayHour}:00 ${period}`);
  }
  
  return startTimes.map(startTime => {
    const endTime = calculateEndTime(startTime, hours);
    return `${startTime} - ${endTime}`;
  });
})

// Time schedule options for 2nd semester edit based on selected subject
const editSecondSemTimeScheduleOptions = computed(() => {
  const baseOptions = [
    '7:00 AM - 8:00 AM', '8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', 
    '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'
  ];
  
  if (!selectedEditSecondSemSubject.value || !selectedEditSecondSemSubject.value.hours) {
    return baseOptions;
  }
  
  // Get the hours from the selected subject
  const hours = selectedEditSecondSemSubject.value.hours || 1;
  
  if (hours === 1) {
    return baseOptions;
  }
  
  // Generate non-overlapping options based on hours
  // For multi-hour classes, create time slots that start every 'hours' hour
  const startTimes = [];
  for (let hour = 7; hour <= 21 - hours; hour += hours) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    startTimes.push(`${displayHour}:00 ${period}`);
  }
  
  return startTimes.map(startTime => {
    const endTime = calculateEndTime(startTime, hours);
    return `${startTime} - ${endTime}`;
  });
})

// Helper to check for errors in second semester fields
function hasErrorsInSecondSem() {
  return errors.secondSem.daySchedule || 
         errors.secondSem.timeSchedule || 
         errors.secondSem.room || 
         errors.secondSem.subjectId;
}

// Function to handle changes to 1st semester subject in edit form
function handleEditFirstSemSubjectChange() {
  // Find the selected subject
  selectedEditFirstSemSubject.value = subjects.value.find(subject => subject._id === editedClass.value.firstSem.subjectId);
  console.log('Selected 1st semester edit subject:', selectedEditFirstSemSubject.value);
  
  // Reset timeSchedule when subject changes
  editedClass.value.firstSem.timeSchedule = '';
}

// Function to handle changes to 2nd semester subject in edit form
function handleEditSecondSemSubjectChange() {
  // Find the selected subject
  selectedEditSecondSemSubject.value = subjects.value.find(subject => subject._id === editedClass.value.secondSem.subjectId);
  console.log('Selected 2nd semester edit subject:', selectedEditSecondSemSubject.value);
  
  // Reset timeSchedule when subject changes
  editedClass.value.secondSem.timeSchedule = '';
}

// Function to validate the edit form
function validateEditForm() {
  console.log('Validating edit form with data:', editedClass.value);
  let isValid = true;
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    if (typeof errors[key] === 'object') {
      Object.keys(errors[key]).forEach(subKey => {
        errors[key][subKey] = '';
      });
  } else {
      errors[key] = '';
    }
  });
  
  // Initialize error objects if they don't exist
  errors.editFirstSem = errors.editFirstSem || {};
  errors.editSecondSem = errors.editSecondSem || {};
  
  // Check common fields
  if (!editedClass.value.yearLevel) {
    errors.editYearLevel = 'Year level is required';
    isValid = false;
  }
  
  if (!editedClass.value.section) {
    errors.editSection = 'Section is required';
    isValid = false;
  }
  
  if (!editedClass.value.major) {
    errors.editMajor = 'Major is required';
    isValid = false;
  }
  
  // Check if we have at least one semester with valid data
  const hasFirstSemData = editedClass.value.firstSem.subjectId || 
                         editedClass.value.firstSem.daySchedule || 
                         editedClass.value.firstSem.timeSchedule || 
                         editedClass.value.firstSem.room;
                         
  const hasSecondSemData = editedClass.value.secondSem.subjectId || 
                          editedClass.value.secondSem.daySchedule || 
                          editedClass.value.secondSem.timeSchedule || 
                          editedClass.value.secondSem.room;
  
  // Validate first semester fields if they have any data
  if (hasFirstSemData) {
    if (!editedClass.value.firstSem.daySchedule) {
      errors.editFirstSem.daySchedule = 'Day schedule is required';
      isValid = false;
    }
    
    if (!editedClass.value.firstSem.timeSchedule) {
      errors.editFirstSem.timeSchedule = 'Time schedule is required';
      isValid = false;
    }
    
    if (!editedClass.value.firstSem.room) {
      errors.editFirstSem.room = 'Room is required';
      isValid = false;
    }
    
    if (!editedClass.value.firstSem.subjectId) {
      errors.editFirstSem.subjectId = 'Subject is required';
      isValid = false;
    }
  }
  
  // Validate second semester fields if they have any data
  if (hasSecondSemData) {
    if (!editedClass.value.secondSem.daySchedule) {
      errors.editSecondSem.daySchedule = 'Day schedule is required';
      isValid = false;
    }
    
    if (!editedClass.value.secondSem.timeSchedule) {
      errors.editSecondSem.timeSchedule = 'Time schedule is required';
      isValid = false;
    }
    
    if (!editedClass.value.secondSem.room) {
      errors.editSecondSem.room = 'Room is required';
      isValid = false;
    }
    
    if (!editedClass.value.secondSem.subjectId) {
      errors.editSecondSem.subjectId = 'Subject is required';
      isValid = false;
    }
  }
  
  // If we have no data for either semester, require at least one
  if (!hasFirstSemData && !hasSecondSemData) {
    errors.editFirstSem.subjectId = 'At least one semester class must be defined';
    isValid = false;
  }
  
  // Switch to the appropriate tab if there are errors
  if (!isValid) {
    if (hasErrorsInEditFirstSem()) {
      activeEditSemesterTab.value = '1st';
    } else if (hasErrorsInEditSecondSem()) {
      activeEditSemesterTab.value = '2nd';
    }
  }
  
  return isValid;
}

// Helper to check for errors in first semester edit fields
function hasErrorsInEditFirstSem() {
  return errors.editFirstSem && (
    errors.editFirstSem.daySchedule || 
    errors.editFirstSem.timeSchedule || 
    errors.editFirstSem.room || 
    errors.editFirstSem.subjectId
  );
}

// Helper to check for errors in second semester edit fields
function hasErrorsInEditSecondSem() {
  return errors.editSecondSem && (
    errors.editSecondSem.daySchedule || 
    errors.editSecondSem.timeSchedule || 
    errors.editSecondSem.room || 
    errors.editSecondSem.subjectId
  );
}

// Function to update only first semester class data
async function updateFirstSemester() {
  try {
    console.log('Updating 1st semester class data:', editedClass.value.firstSem);
    
    // Validate basic form fields
    if (!editedClass.value.yearLevel || !editedClass.value.section || !editedClass.value.major) {
      notificationService.showError('Year Level, Section, and Major are required fields');
      return;
    }
    
    // Validate first semester fields
    if (!editedClass.value.firstSem.subjectId || 
        !editedClass.value.firstSem.daySchedule || 
        !editedClass.value.firstSem.timeSchedule || 
        !editedClass.value.firstSem.room) {
      notificationService.showError('Subject, Day, Time, and Room are required for 1st semester');
      activeEditSemesterTab.value = '1st'; // Switch to first semester tab
      return;
    }
    
    // Find the selected subject for hours value
      const firstSemSubject = subjects.value.find(s => s._id === editedClass.value.firstSem.subjectId);
      if (!firstSemSubject) {
        notificationService.showError('Selected subject for 1st semester not found. Please try again.');
      return;
    }
    
      // Make sure hours is a number, not a string
      const firstSemHours = typeof firstSemSubject.hours === 'string' 
        ? parseInt(firstSemSubject.hours, 10) 
        : (firstSemSubject.hours || 1);
      
    // Prepare the class data for first semester only
      const firstSemData = {
        yearLevel: editedClass.value.yearLevel,
        section: editedClass.value.section,
        major: editedClass.value.major,
        daySchedule: editedClass.value.firstSem.daySchedule,
        timeSchedule: editedClass.value.firstSem.timeSchedule,
        room: editedClass.value.firstSem.room,
      status: 'active',
        sspSubjectId: editedClass.value.firstSem.subjectId,
        hours: firstSemHours
      };
      
      console.log('Updating 1st semester class with data:', firstSemData);
      
    loading.value = true;
    
    try {
      const response = await classService.update(editedClass.value.firstSem._id, firstSemData);
            console.log('1st semester class updated successfully:', response);
            
      // Refresh class list
      await refreshClassList();
      
      // Close the edit modal
      showEditModal.value = false;
      
      notificationService.showSuccess('1st semester class updated successfully');
    } catch (error) {
      console.error('Error updating 1st semester class:', error);
      notificationService.showError(`Error updating 1st semester: ${error.message || 'Unknown error'}`);
    } finally {
      loading.value = false;
    }
  } catch (error) {
    console.error('Error in updateFirstSemester function:', error);
    notificationService.showError('Error updating 1st semester class: ' + (error.message || 'Unknown error'));
  }
}

// Function to update only second semester class data
async function updateSecondSemester() {
  try {
    console.log('Updating 2nd semester class data:', editedClass.value.secondSem);
    
    // Validate basic form fields
    if (!editedClass.value.yearLevel || !editedClass.value.section || !editedClass.value.major) {
      notificationService.showError('Year Level, Section, and Major are required fields');
        return;
      }
      
    // Validate second semester fields
    if (!editedClass.value.secondSem.subjectId || 
        !editedClass.value.secondSem.daySchedule || 
        !editedClass.value.secondSem.timeSchedule || 
        !editedClass.value.secondSem.room) {
      notificationService.showError('Subject, Day, Time, and Room are required for 2nd semester');
      activeEditSemesterTab.value = '2nd'; // Switch to second semester tab
      return;
    }
      
      // Find the selected subject for hours value
      const secondSemSubject = subjects.value.find(s => s._id === editedClass.value.secondSem.subjectId);
      if (!secondSemSubject) {
        notificationService.showError('Selected subject for 2nd semester not found. Please try again.');
        return;
      }
      
      // Make sure hours is a number, not a string
      const secondSemHours = typeof secondSemSubject.hours === 'string' 
        ? parseInt(secondSemSubject.hours, 10) 
        : (secondSemSubject.hours || 1);
      
    // Prepare the class data for second semester only
      const secondSemData = {
        yearLevel: editedClass.value.yearLevel,
        section: editedClass.value.section,
        major: editedClass.value.major,
        secondSemDaySchedule: editedClass.value.secondSem.daySchedule,
        secondSemTimeSchedule: editedClass.value.secondSem.timeSchedule,
        secondSemRoom: editedClass.value.secondSem.room,
        status: 'active',
        secondSemSubjectId: editedClass.value.secondSem.subjectId,
        secondSemHours: secondSemHours
      };
      
    console.log('Updating 2nd semester class with data:', secondSemData);
      
    loading.value = true;
    
    try {
      const response = await classService.update(editedClass.value.secondSem._id, secondSemData);
      console.log('2nd semester class updated successfully:', response);
            
      // Refresh class list
      await refreshClassList();
      
      // Close the edit modal
      showEditModal.value = false;
      
      notificationService.showSuccess('2nd semester class updated successfully');
    } catch (error) {
      console.error('Error updating 2nd semester class:', error);
      notificationService.showError(`Error updating 2nd semester: ${error.message || 'Unknown error'}`);
    } finally {
      loading.value = false;
    }
  } catch (error) {
    console.error('Error in updateSecondSemester function:', error);
    notificationService.showError('Error updating 2nd semester class: ' + (error.message || 'Unknown error'));
  }
}

// Helper function to refresh the class list
async function refreshClassList() {
  try {
    // Clear existing classes
    allClasses.value = [];
    classes.value = [];
    
    // Re-fetch all classes from server
    const response = await classService.getAll();
    console.log(`Fetched ${response.length} classes after update`);
    
    // Process the refreshed classes
    allClasses.value = response;
    classes.value = filteredClasses.value;
  } catch (error) {
    console.error('Error refreshing class list:', error);
    notificationService.showError(`Failed to refresh class list: ${error.message}`);
    throw error;
  }
}

// Function to update classes (both semesters)
async function updateClass() {
  try {
    console.log('Updating class with data:', editedClass.value);
    
    // Validate form fields
    if (!validateEditForm()) {
      console.log('Form validation failed');
      return;
    }
    
    const updatePromises = [];
    let hasUpdates = false;
    
    // Determine which semester tab is active and only update that semester
    if (activeEditSemesterTab.value === '1st') {
      await updateFirstSemester();
    } else {
      await updateSecondSemester();
    }
  } catch (error) {
    console.error('Error in updateClass function:', error);
    notificationService.showError('Error updating class: ' + (error.message || 'Unknown error'));
  }
}

// Handle year level change
function handleYearLevelChange() {
  console.log('Year level changed to:', newClass.yearLevel);
  
  // Reset section and subject when year level changes
  newClass.section = '';
  newClass.firstSem.subjectId = '';
  newClass.secondSem.subjectId = '';
  
  // Reset time schedules
  newClass.firstSem.timeSchedule = '';
  newClass.secondSem.timeSchedule = '';
  
  // Reset selected subjects
  selectedFirstSemSubject.value = null;
  selectedSecondSemSubject.value = null;
}

// Handle changes to edit year level
function handleEditYearLevelChange() {
  // Update the available sections based on the year level
  if (editedClass.value.yearLevel && systemOptionsData.value?.class?.sections) {
    availableSectionsEdit.value = systemOptionsData.value.class.sections[editedClass.value.yearLevel] || [];
  } else {
    availableSectionsEdit.value = [];
  }
  
  // Reset section if it's not in the new list
  if (editedClass.value.section && !availableSectionsEdit.value.includes(editedClass.value.section)) {
    editedClass.value.section = '';
  }
  
  // Reset errors
  errors.editSection = '';
}

// Handle 1st sem subject change
function handleFirstSemSubjectChange() {
  // Find the selected subject
  selectedFirstSemSubject.value = subjects.value.find(subject => subject._id === newClass.firstSem.subjectId);
  console.log('Selected 1st semester subject:', selectedFirstSemSubject.value);
  
  // Reset timeSchedule when subject changes
  newClass.firstSem.timeSchedule = '';
}

// Handle 2nd sem subject change
function handleSecondSemSubjectChange() {
  // Find the selected subject
  selectedSecondSemSubject.value = subjects.value.find(subject => subject._id === newClass.secondSem.subjectId);
  console.log('Selected 2nd semester subject:', selectedSecondSemSubject.value);
  
  // Reset timeSchedule when subject changes
  newClass.secondSem.timeSchedule = '';
}

// Get formatted time schedule display
function getTimeSchedule(classItem) {
  if (!classItem || !classItem.timeSchedule) return 'Time not set';
  return classItem.timeSchedule;
}

// Get subject name for display
function getSubjectName(classItem) {
  if (!classItem) return 'No subject';
  
  if (classItem.sspSubject) {
    if (typeof classItem.sspSubject === 'string') {
      return 'Loading subject...';
    }
    return classItem.sspSubject.sspCode || 'No subject code';
  }
  
  if (classItem.subject) {
    return classItem.subject.sspCode || 'No subject code';
  }
  
  return 'No subject assigned';
}

// Check if class is first semester
function isFirstSemesterClass(classItem) {
  if (!classItem) return false;
  
  const semester = classItem.sspSubject?.semester || classItem.subject?.semester || '';
  return semester.includes('1st');
}

// Check if class has a second semester counterpart
async function hasSecondSemesterClass(classItem) {
  if (!classItem) return false;
  
  try {
    // Find a class with the same year, section, major but 2nd semester
    const response = await api.get('/classes', {
      params: {
        yearLevel: classItem.yearLevel,
        section: classItem.section,
        major: classItem.major,
        status: 'active'
      }
    });
    
    if (response.data && response.data.length > 0) {
      // Check if any of the classes are for 2nd semester
      return response.data.some(cls => {
        const semester = cls.sspSubject?.semester || cls.subject?.semester || '';
        return semester.includes('2nd');
      });
    }
    
    return false;
  } catch (error) {
    console.error('Error checking for second semester class:', error);
    return false;
  }
}

// Function to create second semester class from first semester class
async function createSecondSemester(classItem) {
  if (!classItem) {
    notificationService.showError('Invalid class data');
      return;
    }
    
  try {
    console.log('Creating 2nd semester class from:', classItem);
    
    // Reset form
    newClass.yearLevel = classItem.yearLevel || '';
    newClass.section = classItem.section || '';
    newClass.major = classItem.major || '';
    newClass.status = 'active';
    
    // Clear first semester fields
    newClass.firstSem.daySchedule = '';
    newClass.firstSem.timeSchedule = '';
    newClass.firstSem.room = '';
    newClass.firstSem.subjectId = '';
    
    // Clear second semester fields
    newClass.secondSem.daySchedule = '';
    newClass.secondSem.timeSchedule = '';
    newClass.secondSem.room = '';
    newClass.secondSem.subjectId = '';
    
    // Set second semester mode
    secondSemesterMode.value = true;
    originalClassForSecondSem.value = classItem;
    
    // Set modal title
    addModalTitle.value = `Add 2nd Semester Class for ${classItem.yearLevel} Year - ${classItem.section} (${classItem.major})`;
    
    // Set active tab to second semester
    activeSemesterTab.value = '2nd';
    
    // Ensure subjects are loaded
    if (subjects.value.length === 0) {
      await fetchSubjects();
    }
    
    // Show the modal
    showAddModal.value = true;
  } catch (error) {
    console.error('Error preparing second semester class:', error);
    notificationService.showError('Failed to prepare second semester class form');
  }
}

// Form validation function
function validateForm() {
  console.log('Validating form with data:', newClass);
  let isValid = true;
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    if (typeof errors[key] === 'object') {
      Object.keys(errors[key]).forEach(subKey => {
        errors[key][subKey] = '';
      });
    } else {
      errors[key] = '';
    }
  });
  
  // Skip common field validation if in second semester mode
  if (!secondSemesterMode.value) {
    // Validate year level
    if (!newClass.yearLevel) {
      errors.yearLevel = 'Year level is required';
      isValid = false;
    }
    
    // Validate section
    if (!newClass.section) {
      errors.section = 'Section is required';
      isValid = false;
    }
    
    // Validate major
    if (!newClass.major) {
      errors.major = 'Major is required';
      isValid = false;
    }
  }
  
  // In second semester mode, we only need to validate the second semester fields
  if (secondSemesterMode.value) {
    // Validate second semester fields
    if (!newClass.secondSem.daySchedule) {
      errors.secondSem.daySchedule = 'Day schedule is required';
      isValid = false;
    }
    
    if (!newClass.secondSem.timeSchedule) {
      errors.secondSem.timeSchedule = 'Time schedule is required';
      isValid = false;
    }
    
    if (!newClass.secondSem.room) {
      errors.secondSem.room = 'Room is required';
      isValid = false;
    }
    
    if (!newClass.secondSem.subjectId) {
      errors.secondSem.subjectId = 'Subject is required';
      isValid = false;
    }
  } else {
    // In normal mode, we need at least one semester with valid data
    const hasFirstSemData = newClass.firstSem.subjectId || 
                         newClass.firstSem.daySchedule || 
                         newClass.firstSem.timeSchedule || 
                         newClass.firstSem.room;
                         
    const hasSecondSemData = newClass.secondSem.subjectId || 
                          newClass.secondSem.daySchedule || 
                          newClass.secondSem.timeSchedule || 
                          newClass.secondSem.room;
    
    // If we have partial first semester data, validate all fields
    if (hasFirstSemData) {
      if (!newClass.firstSem.daySchedule) {
        errors.firstSem.daySchedule = 'Day schedule is required';
        isValid = false;
      }
      
      if (!newClass.firstSem.timeSchedule) {
        errors.firstSem.timeSchedule = 'Time schedule is required';
        isValid = false;
      }
      
      if (!newClass.firstSem.room) {
        errors.firstSem.room = 'Room is required';
        isValid = false;
      }
      
      if (!newClass.firstSem.subjectId) {
        errors.firstSem.subjectId = 'Subject is required';
        isValid = false;
      }
    }
    
    // If we have partial second semester data, validate all fields
    if (hasSecondSemData) {
      if (!newClass.secondSem.daySchedule) {
        errors.secondSem.daySchedule = 'Day schedule is required';
        isValid = false;
      }
      
      if (!newClass.secondSem.timeSchedule) {
        errors.secondSem.timeSchedule = 'Time schedule is required';
        isValid = false;
      }
      
      if (!newClass.secondSem.room) {
        errors.secondSem.room = 'Room is required';
        isValid = false;
      }
      
      if (!newClass.secondSem.subjectId) {
        errors.secondSem.subjectId = 'Subject is required';
        isValid = false;
      }
    }
    
    // If we have no data for either semester, require at least first semester
    if (!hasFirstSemData && !hasSecondSemData) {
      errors.firstSem.subjectId = 'At least one semester class must be defined';
      isValid = false;
    }
  }
  
  // Switch to the appropriate tab if there are errors
  if (!isValid) {
    if (hasErrorsInFirstSem()) {
      activeSemesterTab.value = '1st';
    } else if (hasErrorsInSecondSem()) {
      activeSemesterTab.value = '2nd';
    }
  }
  
  return isValid;
}

// Helper to check for errors in first semester fields
function hasErrorsInFirstSem() {
  return errors.firstSem.daySchedule || 
         errors.firstSem.timeSchedule || 
         errors.firstSem.room || 
         errors.firstSem.subjectId;
}

// Check if a room is already taken for a specific day and time
function isRoomTaken(roomNumber, day, time) {
  if (!day || !time || !roomNumber) return false;
  
  return allClasses.value.some(classItem => {
    // Check if room matches
    const roomMatches = classItem.room === `Room ${roomNumber}` || 
                       (classItem.firstSemester && classItem.firstSemester.room === `Room ${roomNumber}`) ||
                       (classItem.secondSemester && classItem.secondSemester.room === `Room ${roomNumber}`);
    
    if (!roomMatches || classItem.status !== 'active') return false;
    
    // Check for matching day and time overlaps based on semester
    // First check main class attributes
    if (classItem.daySchedule === day && classItem.room === `Room ${roomNumber}`) {
      if (checkTimeOverlap(time, classItem.timeSchedule)) {
        return true;
      }
    }
    
    // Then check first semester
    if (classItem.firstSemester && 
        classItem.firstSemester.daySchedule === day && 
        classItem.firstSemester.room === `Room ${roomNumber}`) {
      if (checkTimeOverlap(time, classItem.firstSemester.timeSchedule)) {
        return true;
      }
    }
    
    // Finally check second semester
    if (classItem.secondSemester && 
        classItem.secondSemester.daySchedule === day && 
        classItem.secondSemester.room === `Room ${roomNumber}`) {
      if (checkTimeOverlap(time, classItem.secondSemester.timeSchedule)) {
        return true;
      }
    }
    
    return false;
  });
}

// Check if two time slots overlap regardless of their duration
function checkTimeOverlap(time1, time2) {
  if (!time1 || !time2) return false;
  
  // Parse the time slots to get start and end times
  const [start1, end1] = time1.split(' - ');
  const [start2, end2] = time2.split(' - ');
  
  if (!start1 || !end1 || !start2 || !end2) return false;
  
  // Convert times to minutes since midnight for easier comparison
  const start1Minutes = convertTimeToMinutes(start1);
  const end1Minutes = convertTimeToMinutes(end1);
  const start2Minutes = convertTimeToMinutes(start2);
  const end2Minutes = convertTimeToMinutes(end2);
  
  // Check if the time slots overlap
  // Two time slots overlap if start1 < end2 AND end1 > start2
  return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
}

// Convert time string (e.g., "7:00 AM") to minutes since midnight
function convertTimeToMinutes(timeStr) {
  if (!timeStr) return 0; // Handle null or undefined input
  
  const parts = timeStr.split(' ');
  if (parts.length < 2) return 0; // Handle invalid format
  
  const [time, period] = parts;
  if (!time || !period) return 0;
  
  const timeParts = time.split(':');
  if (timeParts.length < 2) return 0;
  
  let hours = parseInt(timeParts[0], 10) || 0;
  let minutes = parseInt(timeParts[1], 10) || 0;
  
  // Convert to 24-hour format
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

// Check if a time slot is already taken for a specific day, room, and semester
function isTimeSlotTaken(day, time, room, semester) {
  if (!day || !time || !room) return false;
  
  return allClasses.value.some(classItem => {
    // Skip classes that don't match the semester we're checking
    if (semester === 'firstSem') {
      // If checking first semester, only consider first semester classes
      const isFirstSemClass = classItem.firstSemester || 
                             (!classItem.firstSemester && !classItem.secondSemester);
      if (!isFirstSemClass) return false;
      
      // Check day for first semester
      const dayMatches = (classItem.firstSemester && classItem.firstSemester.daySchedule === day) || 
                         (!classItem.firstSemester && classItem.daySchedule === day);
      
      // Check room 
      const classRoom = classItem.firstSemester ? classItem.firstSemester.room : classItem.room;
      const roomMatches = (classRoom === room);
      
      // If day and room match, check for time overlap
      if (dayMatches && roomMatches && classItem.status === 'active') {
        const classTimeSchedule = classItem.firstSemester ? classItem.firstSemester.timeSchedule : classItem.timeSchedule;
        return checkTimeOverlap(time, classTimeSchedule);
      }
      
      return false;
    } else if (semester === 'secondSem') {
      // If checking second semester, only consider second semester classes
      if (!classItem.secondSemester) return false;
      
      // Check day for second semester
      const dayMatches = classItem.secondSemester.daySchedule === day;
      
      // Check room
      const roomMatches = (classItem.secondSemester.room === room);
      
      // If day and room match, check for time overlap
      if (dayMatches && roomMatches && classItem.status === 'active') {
        return checkTimeOverlap(time, classItem.secondSemester.timeSchedule);
      }
      
      return false;
    }
    
    // If no semester specified, check both semesters (fallback to original behavior)
    // Check for day match
    const dayMatches = classItem.daySchedule === day || 
                     (classItem.firstSemester && classItem.firstSemester.daySchedule === day) ||
                     (classItem.secondSemester && classItem.secondSemester.daySchedule === day);
    
    // Check for room match
    const roomMatches = classItem.room === room || 
                      (classItem.firstSemester && classItem.firstSemester.room === room) ||
                      (classItem.secondSemester && classItem.secondSemester.room === room);
    
    // If day and room match, check for time overlap
    if (dayMatches && roomMatches && classItem.status === 'active') {
      // Get all applicable time schedules for this class
      const timeSchedules = [];
      
      if (classItem.daySchedule === day && classItem.room === room) {
        timeSchedules.push(classItem.timeSchedule);
      }
      
      if (classItem.firstSemester && 
          classItem.firstSemester.daySchedule === day && 
          classItem.firstSemester.room === room) {
        timeSchedules.push(classItem.firstSemester.timeSchedule);
      }
      
      if (classItem.secondSemester && 
          classItem.secondSemester.daySchedule === day && 
          classItem.secondSemester.room === room) {
        timeSchedules.push(classItem.secondSemester.timeSchedule);
      }
      
      // Check each time schedule for overlap
      return timeSchedules.some(classTime => checkTimeOverlap(time, classTime));
    }
    
    return false;
  });
}

// Get the room assigned to a specific day and time slot
function getRoomForTimeSlot(day, time, excludeClassId = null) {
  if (!day || !time) return '';
  
  const classWithTimeSlot = allClasses.value.find(classItem => {
    if (excludeClassId && classItem._id === excludeClassId) {
      return false;
    }
    
    // Check if the class is active
    if (classItem.status !== 'active') return false;
    
    // Check for day match and time overlap in the main class data
    if (classItem.daySchedule === day && checkTimeOverlap(time, classItem.timeSchedule)) {
      return true;
    }
    
    // Check for day match and time overlap in first semester
    if (classItem.firstSemester && 
        classItem.firstSemester.daySchedule === day && 
        checkTimeOverlap(time, classItem.firstSemester.timeSchedule)) {
      return true;
    }
    
    // Check for day match and time overlap in second semester
    if (classItem.secondSemester && 
        classItem.secondSemester.daySchedule === day && 
        checkTimeOverlap(time, classItem.secondSemester.timeSchedule)) {
      return true;
    }
    
    return false;
  });
  
  if (!classWithTimeSlot) return '';
  
  const room = classWithTimeSlot.room || 
         (classWithTimeSlot.firstSemester && classWithTimeSlot.firstSemester.room) ||
         (classWithTimeSlot.secondSemester && classWithTimeSlot.secondSemester.room) || '';
         
  return room ? `In ${room}` : 'Unknown room';
}

// Select a room for the form
function selectRoom(semester, roomNumber) {
  if (semester === 'firstSem') {
    // Don't select if the room is already taken for the selected day and time
    if (newClass.firstSem.daySchedule && 
        newClass.firstSem.timeSchedule && 
        isRoomTaken(roomNumber, newClass.firstSem.daySchedule, newClass.firstSem.timeSchedule)) {
      notificationService.showWarning(`Room ${roomNumber} is already booked for this time slot`);
      return;
    }
    newClass.firstSem.room = `Room ${roomNumber}`;
  } else {
    // Don't select if the room is already taken for the selected day and time
    if (newClass.secondSem.daySchedule && 
        newClass.secondSem.timeSchedule && 
        isRoomTaken(roomNumber, newClass.secondSem.daySchedule, newClass.secondSem.timeSchedule)) {
      notificationService.showWarning(`Room ${roomNumber} is already booked for this time slot`);
      return;
    }
    newClass.secondSem.room = `Room ${roomNumber}`;
  }
}

// Select a time slot for the form
function selectTimeSlot(semester, time) {
  // Get the appropriate day and room based on semester
  const day = semester === 'firstSem' ? newClass.firstSem.daySchedule : newClass.secondSem.daySchedule;
  const room = semester === 'firstSem' ? newClass.firstSem.room : newClass.secondSem.room;
  
  // Check if the time slot is taken specifically for this room and semester
  if (isTimeSlotTaken(day, time, room, semester)) {
    notificationService.showWarning(`This time slot is already taken in ${room || 'this room'} for the ${semester === 'firstSem' ? '1st' : '2nd'} semester`);
    return;
  }
  
  if (semester === 'firstSem') {
    newClass.firstSem.timeSchedule = time;
  } else {
    newClass.secondSem.timeSchedule = time;
  }
}

// For edit form
function isRoomTakenForEdit(roomNumber, day, time, currentClassId) {
  if (!day || !time || !roomNumber) return false;
  
  return allClasses.value.some(classItem => {
    // Skip the current class being edited
    if (classItem._id === currentClassId) return false;
    
    const roomMatches = classItem.room === `Room ${roomNumber}` || 
                       (classItem.firstSemester && classItem.firstSemester.room === `Room ${roomNumber}`) ||
                       (classItem.secondSemester && classItem.secondSemester.room === `Room ${roomNumber}`);
                       
    const dayMatches = classItem.daySchedule === day || 
                     (classItem.firstSemester && classItem.firstSemester.daySchedule === day) ||
                     (classItem.secondSemester && classItem.secondSemester.daySchedule === day);
                     
    const timeMatches = classItem.timeSchedule === time || 
                      (classItem.firstSemester && classItem.firstSemester.timeSchedule === time) ||
                      (classItem.secondSemester && classItem.secondSemester.timeSchedule === time);
                      
    return roomMatches && dayMatches && timeMatches && classItem.status === 'active';
  });
}

// Check if a time slot is already taken for editing - with semester-specific checks
function isTimeSlotTakenForEdit(day, time, currentClassId, room, semester) {
  if (!day || !time || !room) return false;
  
  return allClasses.value.some(classItem => {
    // Skip the current class being edited
    if (classItem._id === currentClassId) return false;
    
    // Skip classes that don't match the semester we're checking
    if (semester === 'firstSem') {
      // If checking first semester, only consider first semester classes
      const isFirstSemClass = classItem.firstSemester || 
                             (!classItem.firstSemester && !classItem.secondSemester);
      if (!isFirstSemClass) return false;
      
      // Check day for first semester
      const dayMatches = (classItem.firstSemester && classItem.firstSemester.daySchedule === day) || 
                         (!classItem.firstSemester && classItem.daySchedule === day);
      
      // Check room
      const classRoom = classItem.firstSemester ? classItem.firstSemester.room : classItem.room;
      const roomMatches = (classRoom === room);
      
      // If day and room match, check for time overlap
      if (dayMatches && roomMatches && classItem.status === 'active') {
        const classTimeSchedule = classItem.firstSemester ? classItem.firstSemester.timeSchedule : classItem.timeSchedule;
        return checkTimeOverlap(time, classTimeSchedule);
      }
      
      return false;
    } else if (semester === 'secondSem') {
      // If checking second semester, only consider second semester classes
      if (!classItem.secondSemester) return false;
      
      // Check day for second semester
      const dayMatches = classItem.secondSemester.daySchedule === day;
      
      // Check room
      const roomMatches = (classItem.secondSemester.room === room);
      
      // If day and room match, check for time overlap
      if (dayMatches && roomMatches && classItem.status === 'active') {
        return checkTimeOverlap(time, classItem.secondSemester.timeSchedule);
      }
      
      return false;
    }
    
    // If no semester specified, check both semesters (fallback to original behavior)
    // Check for day match
    const dayMatches = classItem.daySchedule === day || 
                     (classItem.firstSemester && classItem.firstSemester.daySchedule === day) ||
                     (classItem.secondSemester && classItem.secondSemester.daySchedule === day);
    
    // Check for room match
    const roomMatches = classItem.room === room || 
                      (classItem.firstSemester && classItem.firstSemester.room === room) ||
                      (classItem.secondSemester && classItem.secondSemester.room === room);
    
    // If day and room match, check for time overlap
    if (dayMatches && roomMatches && classItem.status === 'active') {
      // Get all applicable time schedules for this class
      const timeSchedules = [];
      
      if (classItem.daySchedule === day && classItem.room === room) {
        timeSchedules.push(classItem.timeSchedule);
      }
      
      if (classItem.firstSemester && 
          classItem.firstSemester.daySchedule === day && 
          classItem.firstSemester.room === room) {
        timeSchedules.push(classItem.firstSemester.timeSchedule);
      }
      
      if (classItem.secondSemester && 
          classItem.secondSemester.daySchedule === day && 
          classItem.secondSemester.room === room) {
        timeSchedules.push(classItem.secondSemester.timeSchedule);
      }
      
      // Check each time schedule for overlap
      return timeSchedules.some(classTime => checkTimeOverlap(time, classTime));
    }
    
    return false;
  });
}

// Select a room for the edit form
function selectEditRoom(semester, roomNumber) {
  if (semester === 'firstSem') {
    // Don't select if the room is already taken for the selected day and time
    if (editedClass.value.firstSem.daySchedule && 
        editedClass.value.firstSem.timeSchedule && 
        isRoomTakenForEdit(roomNumber, editedClass.value.firstSem.daySchedule, editedClass.value.firstSem.timeSchedule, editedClass.value._id)) {
      notificationService.showWarning(`Room ${roomNumber} is already booked for this time slot`);
      return;
    }
    editedClass.value.firstSem.room = `Room ${roomNumber}`;
  } else {
    // Don't select if the room is already taken for the selected day and time
    if (editedClass.value.secondSem.daySchedule && 
        editedClass.value.secondSem.timeSchedule && 
        isRoomTakenForEdit(roomNumber, editedClass.value.secondSem.daySchedule, editedClass.value.secondSem.timeSchedule, editedClass.value._id)) {
      notificationService.showWarning(`Room ${roomNumber} is already booked for this time slot`);
      return;
    }
    editedClass.value.secondSem.room = `Room ${roomNumber}`;
  }
}

// Select a time slot for the edit form
function selectEditTimeSlot(semester, time) {
  // Get the appropriate day, room, and class ID based on semester
  const day = semester === 'firstSem' ? editedClass.value.firstSem.daySchedule : editedClass.value.secondSem.daySchedule;
  const room = semester === 'firstSem' ? editedClass.value.firstSem.room : editedClass.value.secondSem.room;
  const classId = editedClass.value._id;
  
  // Check if the time slot is taken specifically for this room and semester
  if (isTimeSlotTakenForEdit(day, time, classId, room, semester)) {
    notificationService.showWarning(`This time slot is already taken in ${room || 'this room'} for the ${semester === 'firstSem' ? '1st' : '2nd'} semester`);
    return;
  }
  
  if (semester === 'firstSem') {
    editedClass.value.firstSem.timeSchedule = time;
  } else {
    editedClass.value.secondSem.timeSchedule = time;
  }
}

// Add room options computed property to script section
// Room options from system settings
const roomOptions = computed(() => {
  if (systemOptionsData.value?.class?.rooms && systemOptionsData.value.class.rooms.length > 0) {
    return systemOptionsData.value.class.rooms;
  }
  
  // Default room options if system options aren't available
  return ['301', '302', '303', '304', '401', '402', '403', '404'];
});

// Add watchers for year level changes to update majors
watch(() => newClass.yearLevel, (newYearLevel) => {
  if (newYearLevel && 
      systemOptionsData.value?.class?.majors && 
      systemOptionsData.value.class.majors[newYearLevel]) {
    // Don't reset the major if it's already in the list for the new year level
    if (!systemOptionsData.value.class.majors[newYearLevel].includes(newClass.major)) {
      newClass.major = '';
    }
  } else {
    newClass.major = '';
  }
}, { immediate: true });

// Also watch for year level changes in edit mode
watch(() => editedClass.value.yearLevel, (newYearLevel) => {
  if (newYearLevel && 
      systemOptionsData.value?.class?.majors && 
      systemOptionsData.value.class.majors[newYearLevel]) {
    // Don't reset the major if it's already in the list for the new year level
    if (!systemOptionsData.value.class.majors[newYearLevel].includes(editedClass.value.major)) {
      editedClass.value.major = '';
    }
  }
}, { immediate: true });

// Function to filter classes based on current filters
function filterClasses() {
  classes.value = filteredClasses.value;
  console.log('Classes filtered, showing', classes.value.length, 'classes');
}

// Function to archive a class
async function archiveClass() {
  try {
    if (!editedClass.value || (!editedClass.value.firstSem._id && !editedClass.value.secondSem._id)) {
      notificationService.showError('Invalid class data');
      return;
    }

    if (!confirm('Are you sure you want to archive this class? This will mark it as inactive.')) {
      return;
    }

    let hasUpdates = false;
    
    // Archive first semester class if it exists
    if (editedClass.value.firstSem && editedClass.value.firstSem._id) {
      const firstSemClassId = editedClass.value.firstSem._id;
      console.log('Setting 1st semester class to inactive:', firstSemClassId);
      hasUpdates = true;
      
      try {
        // Update directly instead of using promises
        const response = await classService.update(firstSemClassId, { status: 'inactive' });
        console.log('1st semester class set to inactive successfully:', response);
      } catch (error) {
        console.error('Error setting 1st semester class to inactive:', error);
        notificationService.showError(`Error setting 1st semester to inactive: ${error.message || 'Unknown error'}`);
        throw error;
      }
    }
    
    // Archive second semester class if it exists
    if (editedClass.value.secondSem && editedClass.value.secondSem._id) {
      const secondSemClassId = editedClass.value.secondSem._id;
      console.log('Setting 2nd semester class to inactive:', secondSemClassId);
      hasUpdates = true;
      
      try {
        // Update directly instead of using promises
        const response = await classService.update(secondSemClassId, { status: 'inactive' });
        console.log('2nd semester class set to inactive successfully:', response);
      } catch (error) {
        console.error('Error setting 2nd semester class to inactive:', error);
        notificationService.showError(`Error setting 2nd semester to inactive: ${error.message || 'Unknown error'}`);
        throw error;
      }
    }
    
    if (!hasUpdates) {
      notificationService.showError('No valid classes to set as inactive');
      return;
    }
    
    // After all updates, force a full refresh of the class data
    console.log('All archive operations completed, refreshing class data...');
    loading.value = true; // Show loading indicator
    
    try {
      // Clear existing classes to ensure fresh data
      allClasses.value = [];
      classes.value = [];
      
      // Re-fetch all classes from server
      const response = await classService.getAll();
      console.log(`Fetched ${response.length} classes after archive operation`);
      
      // Process the refreshed classes
      allClasses.value = response;
      classes.value = filteredClasses.value;
      
      // Close the edit modal
      showEditModal.value = false;
      
      notificationService.showSuccess('Class set to inactive successfully');
    } catch (fetchError) {
      console.error('Error refreshing classes after archive:', fetchError);
      notificationService.showError(`Failed to refresh class list: ${fetchError.message}`);
    } finally {
      loading.value = false; // Hide loading indicator
    }
  } catch (error) {
    console.error('Error in archiveClass function:', error);
    notificationService.showError('Error setting class to inactive: ' + (error.message || 'Unknown error'));
  }
}

// Computed property for filtered calendar classes based on semester
const filteredCalendarClasses = computed(() => {
  if (!classes.value) {
    return [];
  }
  
  return classes.value.filter(classItem => {
    // Filter by semester - only include classes with schedule for the selected semester
    if (calendarSemester.value === '1st') {
      // For 1st semester, include classes with first semester data
      return classItem.firstSemester || classItem.firstSem;
    } else if (calendarSemester.value === '2nd') {
      // For 2nd semester, include classes with second semester data
      return classItem.secondSemester || classItem.secondSem;
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
  
  return filteredCalendarClasses.value.filter(classItem => {
    // Get the relevant semester data based on the selected semester
    let semesterData;
    if (calendarSemester.value === '1st') {
      semesterData = classItem.firstSemester || classItem.firstSem || {};
    } else {
      semesterData = classItem.secondSemester || classItem.secondSem || {};
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
// Get color classes for a class in the calendar view
function getClassColorClasses(classItem) {
  // Apply different colors based on year level or other properties
  if (classItem.yearLevel === '2nd') {
    return 'bg-blue-200 text-blue-800 hover:bg-blue-300';
  } else if (classItem.yearLevel === '3rd') {
    return 'bg-green-200 text-green-800 hover:bg-green-300';
  } else if (classItem.yearLevel === '4th') {
    return 'bg-purple-200 text-purple-800 hover:bg-purple-300';
  } else {
    return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  }
}

// Get compact class name for calendar view
function getCompactClassName(classItem) {
  return `${classItem.yearLevel}Y-${classItem.section}`;
}

// Get subject for a class in the calendar view
function getClassSubject(classItem) {
  let semesterData;
  
  if (calendarSemester.value === '1st') {
    semesterData = classItem.firstSemester || classItem.firstSem || {};
  } else {
    semesterData = classItem.secondSemester || classItem.secondSem || {};
  }
  
  // If there's a populated subject object directly in the semester data
  if (semesterData.sspSubject && typeof semesterData.sspSubject !== 'string' && semesterData.sspSubject.sspCode) {
    return semesterData.sspSubject.sspCode;
  }
  
  // If there's a populated subject object in the main class
  if (classItem.sspSubject && typeof classItem.sspSubject !== 'string' && classItem.sspSubject.sspCode) {
    // For first semester, only show if it's a first semester subject or unspecified
    if (calendarSemester.value === '1st') {
      const semester = classItem.sspSubject.semester || '';
      if (semester.includes('1st') || !semester) {
        return classItem.sspSubject.sspCode;
      }
    } 
    // For second semester, only show if it's a second semester subject
    else if (calendarSemester.value === '2nd') {
      const semester = classItem.sspSubject.semester || '';
      if (semester.includes('2nd')) {
        return classItem.sspSubject.sspCode;
      }
    }
  }
  
  // Check merged classes if available
  if (classItem.mergedClasses && classItem.mergedClasses.length > 0) {
    for (const mergedClass of classItem.mergedClasses) {
      const mergedSemesterData = calendarSemester.value === '1st' 
        ? (mergedClass.firstSemester || mergedClass.firstSem || {})
        : (mergedClass.secondSemester || mergedClass.secondSem || {});
      
      if (mergedSemesterData.sspSubject && typeof mergedSemesterData.sspSubject !== 'string' && mergedSemesterData.sspSubject.sspCode) {
        return mergedSemesterData.sspSubject.sspCode;
      }
      
      if (mergedClass.sspSubject && typeof mergedClass.sspSubject !== 'string' && mergedClass.sspSubject.sspCode) {
        // Check semester matches for merged class subjects
        if (calendarSemester.value === '1st') {
          const semester = mergedClass.sspSubject.semester || '';
          if (semester.includes('1st') || !semester) {
            return mergedClass.sspSubject.sspCode;
          }
        } else if (calendarSemester.value === '2nd') {
          const semester = mergedClass.sspSubject.semester || '';
          if (semester.includes('2nd')) {
            return mergedClass.sspSubject.sspCode;
          }
        }
      }
    }
  }
  
  return 'No Subject';
}

// Function to get merged classes for a time slot and day
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
  const allClasses = filteredCalendarClasses.value.filter(classItem => {
    // Skip classes that don't match the selected year level (if set)
    if (selectedYearLevel.value && classItem.yearLevel !== selectedYearLevel.value) {
      return false;
    }
    
    // Get the relevant semester data based on the selected semester
    let semesterData;
    if (calendarSemester.value === '1st') {
      semesterData = classItem.firstSemester || classItem.firstSem || {};
    } else {
      semesterData = classItem.secondSemester || classItem.secondSem || {};
    }
    
    // Check if the day matches
    if (semesterData.daySchedule !== dayAbbr && semesterData.daySchedule !== day) {
      return false;
    }
    
    // Check if the time matches
    return doesTimeSlotOverlap(timeSlot, semesterData.timeSchedule);
  });
  
  // Group classes by their unique identifier (year+section+major)
  const classGroups = {};
  
  allClasses.forEach(classItem => {
    const identifier = `${classItem.yearLevel}-${classItem.section}-${classItem.major}`;
    
    if (!classGroups[identifier]) {
      classGroups[identifier] = { ...classItem, mergedClasses: [classItem] };
    } else {
      classGroups[identifier].mergedClasses.push(classItem);
    }
  });
  
  // Return the merged classes
  return Object.values(classGroups);
}

// Get room for a class in the calendar view
function getClassRoom(classItem) {
  let semesterData;
  
  if (calendarSemester.value === '1st') {
    semesterData = classItem.firstSemester || classItem.firstSem || {};
  } else {
    semesterData = classItem.secondSemester || classItem.secondSem || {};
  }
  
  return semesterData.room || 'No Room';
}

// Function to filter classes based on selected year level
const selectedYearLevel = ref('');
function filterCalendarClasses() {
  if (selectedYearLevel.value === '') {
    classes.value = filteredClasses.value;
  } else {
    classes.value = filteredClasses.value.filter(classItem => classItem.yearLevel === selectedYearLevel.value);
  }
}

// After calendarSemester ref declaration
const selectedRoom = ref('all');

// Add this computed property for available rooms
const availableRooms = computed(() => {
  const rooms = new Set();
  
  // Collect all rooms from the filtered classes
  filteredCalendarClasses.value.forEach(classItem => {
    // Get the relevant semester data
    let semesterData;
    if (calendarSemester.value === '1st') {
      semesterData = classItem.firstSemester || classItem.firstSem || {};
    } else {
      semesterData = classItem.secondSemester || classItem.secondSem || {};
    }
    
    if (semesterData.room) {
      rooms.add(semesterData.room);
    }
  });
  
  // Convert to array and sort
  return ['all', ...Array.from(rooms).sort()];
});

// Function to get positioned class blocks
function getPositionedClassBlocks() {
  // Constants for positioning
  const ROW_HEIGHT = 60; // Match the min-height of time slots

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
  
  filteredCalendarClasses.value.forEach(classItem => {
    // Skip classes that don't match selected year level
    if (selectedYearLevel.value && classItem.yearLevel !== selectedYearLevel.value) {
      return;
    }
    
    // Get semester data
    let semesterData;
    if (calendarSemester.value === '1st') {
      semesterData = classItem.firstSemester || classItem.firstSem || {};
    } else {
      semesterData = classItem.secondSemester || classItem.secondSem || {};
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
    
    // Find the matching time slot for the start time
    let startRowIndex = -1;
    timeSlots.value.forEach((timeSlot, index) => {
      if (timeSlot.startsWith(startTime)) {
        startRowIndex = index;
      }
    });
    
    // Find the matching time slot for the end time
    let endRowIndex = -1;
    timeSlots.value.forEach((timeSlot, index) => {
      if (timeSlot.endsWith(endTime)) {
        endRowIndex = index;
      }
    });
    
    // If exact matches weren't found, calculate based on minutes
    if (startRowIndex === -1 || endRowIndex === -1) {
      const startMinutes = convertTimeToMinutes(startTime);
      const endMinutes = convertTimeToMinutes(endTime);
      
      // Find closest time slots
      if (startRowIndex === -1) {
        let minDiff = Infinity;
        timeSlotRanges.forEach((range, index) => {
          const diff = Math.abs(range.start - startMinutes);
          if (diff < minDiff) {
            minDiff = diff;
            startRowIndex = index;
          }
        });
      }
      
      if (endRowIndex === -1) {
        let minDiff = Infinity;
        timeSlotRanges.forEach((range, index) => {
          const diff = Math.abs(range.end - endMinutes);
          if (diff < minDiff) {
            minDiff = diff;
            endRowIndex = index;
          }
        });
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
      class: classItem,
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
