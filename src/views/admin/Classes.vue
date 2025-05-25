<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Classes</h1>
      <button 
        @click="openAddModal" 
        class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add New Class
        </span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 mb-6 rounded-lg shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
          <select
            v-model="filters.yearLevel"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            @change="classes = filteredClasses"
          >
            <option value="">All Year Levels</option>
            <option v-for="option in yearLevelOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Major</label>
          <select
            v-model="filters.major"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            @change="classes = filteredClasses"
          >
            <option value="">All Majors</option>
            <option v-for="option in majorOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by class code or section"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            @input="handleSearchInput"
          />
        </div>
      </div>
    </div>

    <!-- Classes Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Class Details
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Schedule
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SSP Subject
            </th>
                        <!-- Removed semester column as it's now shown in the class details badge -->
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-4 text-center">
              <div class="flex justify-center items-center">
                <svg class="animate-spin h-5 w-5 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading classes...
              </div>
            </td>
          </tr>
          <tr v-else-if="classes.length === 0">
            <td colspan="5" class="px-6 py-4 text-center">
              <p v-if="filters.search || filters.yearLevel || filters.major">No classes match your filters</p>
              <p v-else>No classes found</p>
            </td>
          </tr>
          <tr v-for="(classItem, index) in classes" :key="classItem._id || index" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900 flex items-center">
                {{ classItem.yearLevel || 'Unknown' }} Year - {{ classItem.section || 'Unknown' }}
                <span 
                  class="ml-2 px-2 py-0.5 text-xs rounded-full"
                  :class="getSemesterBadgeClass(classItem)"
                >
                  {{ classItem.sspSubject?.semester || classItem.subject?.semester || 'Unknown' }}
                </span>
              </div>
              <div class="text-sm text-gray-500">
                {{ classItem.major || 'No major specified' }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ classItem.daySchedule || 'Not scheduled' }}</div>
              <div class="text-sm text-gray-500">{{ getTimeSchedule(classItem) }}</div>
              <div class="text-sm text-gray-500">Room: {{ classItem.room || 'TBA' }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
              {{ getSubjectName(classItem) }}
            </td>
                        <!-- Semester column removed -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="classItem.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ classItem.status ? (classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)) : 'Unknown' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="viewDetails(classItem)" 
                class="text-primary hover:text-primary-dark mr-2"
              >
                Details
              </button>
              <button 
                @click="editClass(classItem)"
                class="text-indigo-600 hover:text-indigo-900 mx-3"
              >
                Edit
              </button>
                            <!-- Removed 2nd Sem button as second semester information is now added when creating the class -->
            </td>
          </tr>
        </tbody>
      </table>
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

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex justify-center items-center">
      <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-6 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300">
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
        <div v-if="activeSemesterTab === '1st'" class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Room (1st Sem) *</label>
            <input
              v-model="newClass.firstSem.room"
              type="text"
              placeholder="e.g., Room 301"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.firstSem?.room }"
            />
            <p v-if="errors.firstSem?.room" class="mt-1.5 text-sm text-red-500">{{ errors.firstSem.room }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Day Schedule (1st Sem) *</label>
            <select
              v-model="newClass.firstSem.daySchedule"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.firstSem?.daySchedule }"
            >
              <option value="">Select Day</option>
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
            <p v-if="errors.firstSem?.daySchedule" class="mt-1.5 text-sm text-red-500">{{ errors.firstSem.daySchedule }}</p>
          </div>
          
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
            <label class="block text-base font-medium text-gray-700 mb-2">Time Schedule (1st Sem) *</label>
            <select
              v-model="newClass.firstSem.timeSchedule"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.firstSem?.timeSchedule }"
            >
              <option value="">Select Time Schedule</option>
              <option v-for="time in firstSemTimeScheduleOptions" :key="time" :value="time">{{ time }}</option>
            </select>
            <p v-if="errors.firstSem?.timeSchedule" class="mt-1.5 text-sm text-red-500">{{ errors.firstSem.timeSchedule }}</p>
          </div>
        </div>
        
        <!-- 2nd Semester Fields -->
        <div v-if="activeSemesterTab === '2nd'" class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Room (2nd Sem)</label>
            <input
              v-model="newClass.secondSem.room"
              type="text"
              placeholder="e.g., Room 301"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.secondSem?.room }"
            />
            <p v-if="errors.secondSem?.room" class="mt-1.5 text-sm text-red-500">{{ errors.secondSem.room }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Day Schedule (2nd Sem)</label>
            <select
              v-model="newClass.secondSem.daySchedule"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.secondSem?.daySchedule }"
            >
              <option value="">Select Day</option>
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
            <p v-if="errors.secondSem?.daySchedule" class="mt-1.5 text-sm text-red-500">{{ errors.secondSem.daySchedule }}</p>
          </div>
          
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
            <label class="block text-base font-medium text-gray-700 mb-2">Time Schedule (2nd Sem)</label>
            <select
              v-model="newClass.secondSem.timeSchedule"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.secondSem?.timeSchedule }"
            >
              <option value="">Select Time Schedule</option>
              <option v-for="time in secondSemTimeScheduleOptions" :key="time" :value="time">{{ time }}</option>
            </select>
            <p v-if="errors.secondSem?.timeSchedule" class="mt-1.5 text-sm text-red-500">{{ errors.secondSem.timeSchedule }}</p>
          </div>
        </div>
        
        <!-- Optional explanatory text for 2nd semester -->
        <div v-if="activeSemesterTab === '2nd'" class="mb-4 p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-700">
            <span class="font-medium">Note:</span> 2nd semester details are optional. If provided, a separate class will be created for the 2nd semester automatically.
          </p>
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
    
    <!-- View Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex justify-center items-center">
      <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-6 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300">
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
    
    <!-- Edit Class Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex justify-center items-center">
      <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-6 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300">
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
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="editedClass.status"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
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
        <div v-if="activeEditSemesterTab === '1st'" class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Room (1st Sem) *</label>
            <input
              v-model="editedClass.firstSem.room"
              type="text"
              placeholder="e.g., Room 301"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editFirstSem?.room }"
            />
            <p v-if="errors.editFirstSem?.room" class="mt-1.5 text-sm text-red-500">{{ errors.editFirstSem.room }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Day Schedule (1st Sem) *</label>
            <select
              v-model="editedClass.firstSem.daySchedule"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editFirstSem?.daySchedule }"
            >
              <option value="">Select Day</option>
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
            <p v-if="errors.editFirstSem?.daySchedule" class="mt-1.5 text-sm text-red-500">{{ errors.editFirstSem.daySchedule }}</p>
          </div>
          
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
            <label class="block text-base font-medium text-gray-700 mb-2">Time Schedule (1st Sem) *</label>
            <select
              v-model="editedClass.firstSem.timeSchedule"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editFirstSem?.timeSchedule }"
            >
              <option value="">Select Time Schedule</option>
              <option v-for="time in editFirstSemTimeScheduleOptions" :key="time" :value="time">{{ time }}</option>
            </select>
            <p v-if="errors.editFirstSem?.timeSchedule" class="mt-1.5 text-sm text-red-500">{{ errors.editFirstSem.timeSchedule }}</p>
          </div>
        </div>
        
        <!-- 2nd Semester Fields -->
        <div v-if="activeEditSemesterTab === '2nd'" class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Room (2nd Sem) *</label>
            <input
              v-model="editedClass.secondSem.room"
              type="text"
              placeholder="e.g., Room 301"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editSecondSem?.room }"
            />
            <p v-if="errors.editSecondSem?.room" class="mt-1.5 text-sm text-red-500">{{ errors.editSecondSem.room }}</p>
          </div>
          
          <div>
            <label class="block text-base font-medium text-gray-700 mb-2">Day Schedule (2nd Sem) *</label>
            <select
              v-model="editedClass.secondSem.daySchedule"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editSecondSem?.daySchedule }"
            >
              <option value="">Select Day</option>
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
            <p v-if="errors.editSecondSem?.daySchedule" class="mt-1.5 text-sm text-red-500">{{ errors.editSecondSem.daySchedule }}</p>
          </div>
          
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
            <label class="block text-base font-medium text-gray-700 mb-2">Time Schedule (2nd Sem) *</label>
            <select
              v-model="editedClass.secondSem.timeSchedule"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
              :class="{ 'border-red-500': errors.editSecondSem?.timeSchedule }"
            >
              <option value="">Select Time Schedule</option>
              <option v-for="time in editSecondSemTimeScheduleOptions" :key="time" :value="time">{{ time }}</option>
            </select>
            <p v-if="errors.editSecondSem?.timeSchedule" class="mt-1.5 text-sm text-red-500">{{ errors.editSecondSem.timeSchedule }}</p>
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
            @click="deleteClass"
            class="px-5 py-2.5 mr-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            Delete
          </button>
          <button
            @click="updateClass"
            class="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            Update Class
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
const days = ref(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])

// Year level options
const yearLevelOptions = ref(['2nd', '3rd', '4th'])

// Major options
const majorOptions = ref(['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'])

// Time schedule options - replaced by firstSemTimeScheduleOptions and secondSemTimeScheduleOptions

// Time schedule options for edit form based on selected subject
const editTimeScheduleOptions = computed(() => {
  const baseOptions = [
    '7:00 AM - 8:00 AM', '8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', 
    '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'
  ];
  
  if (!selectedEditSubject.value || !selectedEditSubject.value.hours) {
    return baseOptions;
  }
  
  // Get the hours from the selected edit subject
  const hours = selectedEditSubject.value.hours || 1;
  
  if (hours === 1) {
    return baseOptions;
  }
  
  // Generate options based on hours
  return [
    '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', 
    '5:00 PM', '6:00 PM', '7:00 PM'
  ].map(startTime => {
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
  
  // Generate options based on hours
  return [
    '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', 
    '5:00 PM', '6:00 PM', '7:00 PM'
  ].map(startTime => {
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
  
  // Generate options based on hours
  return [
    '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', 
    '5:00 PM', '6:00 PM', '7:00 PM'
  ].map(startTime => {
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
  yearLevel: '',
  major: '',
  search: ''
})

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
      (classItem.subject && classItem.subject.sspCode && classItem.subject.sspCode.toLowerCase().includes(searchTerm))
    
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

// Auto-assign students to classes when the view loads
async function ensureStudentClassAssignments() {
  try {
    console.log('Ensuring all students are properly assigned to classes');
    const response = await studentService.assignClassesToStudents();
    console.log('Auto-assignment results:', response);
    
    if (response.assigned > 0 || (response.mismatches && response.mismatches.fixed > 0)) {
      notificationService.showSuccess(
        `Auto-assigned ${response.assigned} students to classes and fixed ${response.mismatches?.fixed || 0} mismatches`
      );
      
      // Refresh class list to show updated student counts
      await fetchClasses();
    }
  } catch (error) {
    console.error('Error ensuring student class assignments:', error);
    // Don't show error to user as this is a background operation
  }
}

// Fetch data on mount
onMounted(async () => {
  try {
    await loadSystemOptions()
    await fetchClasses()
    await fetchSubjects()
    
    // Run auto-assignment after loading classes
    await ensureStudentClassAssignments()
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
  loading.value = true
  try {
    console.log('Fetching active classes')
    const response = await classService.getAll()
    console.log(`Got ${response.length} raw classes from API`)
    
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
    
    allClasses.value = processedClasses;
    classes.value = processedClasses;
    
    // Check which classes have second semester counterparts
    await checkSecondSemesterClasses();
  } catch (error) {
    console.error('Error fetching classes:', error);
    notificationService.showError('Failed to load classes');
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
  
  console.log('Creating 1st semester class:', classData);
  
  const response = await classService.create(classData);
  console.log('1st semester class created successfully:', response);
  
  // Add to advisory classes collection
  try {
    const advisoryResponse = await api.post('/advisers/advisory/classes', {
      class: response._id
    });
    console.log('Created advisory class entry for 1st semester:', advisoryResponse.data);
  } catch (advisoryError) {
    console.error('Error creating advisory class entry for 1st semester:', advisoryError);
    notificationService.showWarning('1st semester class created but could not add to advisory classes.');
  }
  
  // Add to local list
  allClasses.value.push(response);
  classes.value = filteredClasses.value;
  
  notificationService.showSuccess('1st semester class created successfully');
  return response;
}

// Helper function to create 2nd semester class
async function createSecondSemesterClass(firstSemClass) {
  console.log('createSecondSemesterClass called with firstSemClass:', firstSemClass);
  
  // Skip if no 2nd semester data
  if (!hasSecondSemesterData()) {
    console.log('No 2nd semester data provided, skipping creation');
    return null;
  }
  
  console.log('2nd semester data is valid, proceeding with creation');
  
  // Find the selected subject for hours value
  const subject = subjects.value.find(s => s._id === newClass.secondSem.subjectId);
  if (!subject) {
    console.error('Selected subject for 2nd semester not found:', newClass.secondSem.subjectId);
    throw new Error('Selected subject for 2nd semester not found.');
  }
  
  console.log('Found 2nd semester subject:', subject.sspCode, 'Semester:', subject.semester);
  
  // Make sure hours is a number, not a string
  const hours = typeof subject.hours === 'string' 
    ? parseInt(subject.hours, 10) 
    : (subject.hours || 1);
  
  // Get class info from either the first semester class or original class in second semester mode
  const classInfo = secondSemesterMode.value ? originalClassForSecondSem.value : firstSemClass;
  console.log('Using class info from:', secondSemesterMode.value ? 'original class' : 'first semester class', classInfo);
  
  // Construct the class data
  const classData = {
    yearLevel: classInfo.yearLevel,
    section: classInfo.section,
    major: classInfo.major,
    daySchedule: newClass.secondSem.daySchedule,
    timeSchedule: newClass.secondSem.timeSchedule,
    room: newClass.secondSem.room,
    status: 'active',
    sspSubjectId: newClass.secondSem.subjectId,
    hours: hours
  };
  
  console.log('Creating 2nd semester class with data:', classData);
  
  try {
    const response = await classService.create(classData);
    console.log('2nd semester class created successfully, response:', response);
    
    // Check if the response has the correct structure
    if (!response || !response._id) {
      console.error('Unexpected response format from create API:', response);
    }
    
    // Add to advisory classes collection
    try {
      const advisoryResponse = await api.post('/advisers/advisory/classes', {
        class: response._id
      });
      console.log('Created advisory class entry for 2nd semester:', advisoryResponse.data);
    } catch (advisoryError) {
      console.error('Error creating advisory class entry for 2nd semester:', advisoryError);
      notificationService.showWarning('2nd semester class created but could not add to advisory classes.');
    }
    
    // Add to local list
    allClasses.value.push(response);
    classes.value = filteredClasses.value;
    
    // Update the has-second-semester map
    if (classInfo._id) {
      hasSecondSemesterClassMap.value[classInfo._id] = true;
      console.log(`Updated hasSecondSemesterClassMap for class ${classInfo._id} to true`);
    }
    
    console.log('2nd semester class added to local state, refreshing view');
    notificationService.showSuccess('2nd semester class created successfully');
    return response;
  } catch (error) {
    console.error('Error in createSecondSemesterClass:', error);
    throw error;
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
  
  // Get semester of the selected class
  const selectedSemester = classItem.sspSubject?.semester || classItem.subject?.semester || '';
  console.log('Selected class semester:', selectedSemester);
  
  try {
    // Find all classes with the same year level, section, and major
    console.log(`Finding classes with yearLevel=${classItem.yearLevel}, section=${classItem.section}, major=${classItem.major}`);
    const response = await api.get('/classes', {
      params: {
        yearLevel: classItem.yearLevel,
        section: classItem.section,
        major: classItem.major,
        status: 'active'
      }
    });
    
    console.log(`Found ${response.data?.length || 0} classes with matching year/section/major:`, response.data);
    
    if (response.data && response.data.length > 0) {
      // Process each class to ensure proper subject data
      const semesterClasses = await Promise.all(response.data.map(async (cls) => {
        // Create a copy to avoid mutating the original
        const processedClass = { ...cls };
        
        // If sspSubject is just an ID reference, fetch the full subject data
        if (processedClass.sspSubject && (typeof processedClass.sspSubject === 'string' || !processedClass.sspSubject.sspCode)) {
          const subjectId = typeof processedClass.sspSubject === 'string' ? processedClass.sspSubject : processedClass.sspSubject._id;
          console.log(`Fetching subject data for class ${processedClass._id}, subject ID: ${subjectId}`);
          
          try {
            const subjectResponse = await api.get(`/subjects/${subjectId}`);
            if (subjectResponse.data) {
              processedClass.sspSubject = subjectResponse.data;
              console.log(`Fetched subject for class ${processedClass._id}: ${processedClass.sspSubject.sspCode} - ${processedClass.sspSubject.semester}`);
            }
          } catch (err) {
            console.error(`Error fetching subject for class ${processedClass._id}:`, err);
          }
        }
        
        return processedClass;
      }));
      
      // Debug log all classes with semester information
      semesterClasses.forEach(cls => {
        const semester = cls.sspSubject?.semester || cls.subject?.semester || 'Unknown';
        console.log(`Class ${cls._id}: ${cls.yearLevel} Year - ${cls.section} (${cls.major}), Semester: ${semester}, Subject: ${cls.sspSubject?.sspCode || 'Unknown'}`);
      });
      
      // Separate classes by semester
      for (const cls of semesterClasses) {
        const semester = cls.sspSubject?.semester || cls.subject?.semester || '';
        
        if (semester.includes('1st')) {
          console.log(`Setting first semester class: ${cls._id} - ${cls.sspSubject?.sspCode || 'Unknown'}`);
          firstSemesterClass.value = cls;
        } else if (semester.includes('2nd')) {
          console.log(`Setting second semester class: ${cls._id} - ${cls.sspSubject?.sspCode || 'Unknown'}`);
          secondSemesterClass.value = cls;
        } else {
          console.warn(`Class ${cls._id} has no semester information in subject. Current semester value: "${semester}"`);
          // If no semester info, use as first semester by default
          if (!firstSemesterClass.value) {
            firstSemesterClass.value = cls;
          }
        }
      }
      
      // If we still don't have a second semester class, check if there's another class that we missed
      if (!secondSemesterClass.value) {
        console.log('No second semester class found, checking for potential matches');
        
        // Look for a class that's not already identified as first semester
        const potentialSecondSem = semesterClasses.find(cls => 
          !firstSemesterClass.value || cls._id !== firstSemesterClass.value._id
        );
        
        if (potentialSecondSem) {
          console.log(`Found potential second semester class: ${potentialSecondSem._id}`);
          secondSemesterClass.value = potentialSecondSem;
        }
      }
      
      // Fetch students for each semester class if we don't already have them
      await fetchStudentsForSemesterClasses();
      
      // If the selected class is from second semester, switch to that tab
      if (selectedSemester.includes('2nd')) {
        console.log('Switching to second semester tab based on selected class');
        activeDetailsTab.value = '2nd';
      }
    } else {
      console.log('No classes found with matching year/section/major');
      // Fallback to just showing the selected class
      if (selectedSemester.includes('1st') || !selectedSemester) {
        firstSemesterClass.value = classItem;
      } else if (selectedSemester.includes('2nd')) {
        secondSemesterClass.value = classItem;
        activeDetailsTab.value = '2nd';
      }
    }
    
    // Log final classes found
    console.log('First semester class:', firstSemesterClass.value?._id || 'None');
    console.log('Second semester class:', secondSemesterClass.value?._id || 'None');
    
    // Show the details modal
    showDetailsModal.value = true;
  } catch (error) {
    console.error('Error fetching semester classes:', error);
    notificationService.showError('Error loading class details: ' + error.message);
    
    // Fallback to just showing the selected class
    if (selectedSemester.includes('1st') || !selectedSemester) {
      firstSemesterClass.value = classItem;
    } else if (selectedSemester.includes('2nd')) {
      secondSemesterClass.value = classItem;
      activeDetailsTab.value = '2nd';
    }
    
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
    
    // Determine which semester this class is for
    const semester = classItem.sspSubject?.semester || classItem.subject?.semester || '';
    const isFirstSem = semester.includes('1st');
    const isSecondSem = semester.includes('2nd');
    
    // Reset the edit form state
    editedClass.value = {
      _id: '',
      yearLevel: classItem.yearLevel || '',
      section: classItem.section || '',
      major: classItem.major || '',
      status: classItem.status || 'active',
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
    };
    
    // Set the active semester tab based on the class being edited
    activeEditSemesterTab.value = isSecondSem ? '2nd' : '1st';
    
    try {
      // Find all classes with the same year level, section, and major
      const response = await api.get('/classes', {
        params: {
          yearLevel: classItem.yearLevel,
          section: classItem.section,
          major: classItem.major,
          status: 'active'
        }
      });
      
      if (response.data && response.data.length > 0) {
        // Process each class to ensure proper subject data
        const semesterClasses = await Promise.all(response.data.map(async (cls) => {
          // Create a copy to avoid mutating the original
          const processedClass = { ...cls };
          
          // If sspSubject is just an ID reference, fetch the full subject data
          if (processedClass.sspSubject && (typeof processedClass.sspSubject === 'string' || !processedClass.sspSubject.sspCode)) {
            const subjectId = typeof processedClass.sspSubject === 'string' ? processedClass.sspSubject : processedClass.sspSubject._id;
            
            try {
              const subjectResponse = await api.get(`/subjects/${subjectId}`);
              if (subjectResponse.data) {
                processedClass.sspSubject = subjectResponse.data;
              }
            } catch (err) {
              console.error(`Error fetching subject for class ${processedClass._id}:`, err);
            }
          }
          
          return processedClass;
        }));
        
        // Separate classes by semester
        let firstSemClass = null;
        let secondSemClass = null;
        
        semesterClasses.forEach(cls => {
          const sem = cls.sspSubject?.semester || cls.subject?.semester || '';
          
          if (sem.includes('1st')) {
            firstSemClass = cls;
          } else if (sem.includes('2nd')) {
            secondSemClass = cls;
          }
        });
        
        console.log('First semester class:', firstSemClass);
        console.log('Second semester class:', secondSemClass);
        
        // Setup the form with both semester data
        if (firstSemClass) {
          editedClass.value.firstSem = {
            _id: firstSemClass._id,
            daySchedule: firstSemClass.daySchedule || '',
            timeSchedule: firstSemClass.timeSchedule || '',
            room: firstSemClass.room || '',
            subjectId: firstSemClass.sspSubject?._id || 
                      (typeof firstSemClass.sspSubject === 'string' ? firstSemClass.sspSubject : '') || 
                      firstSemClass.sspSubjectId || ''
          };
          
          // Find the selected subject
          if (editedClass.value.firstSem.subjectId) {
            selectedEditFirstSemSubject.value = subjects.value.find(
              s => s._id === editedClass.value.firstSem.subjectId
            );
          }
        }
        
        if (secondSemClass) {
          editedClass.value.secondSem = {
            _id: secondSemClass._id,
            daySchedule: secondSemClass.daySchedule || '',
            timeSchedule: secondSemClass.timeSchedule || '',
            room: secondSemClass.room || '',
            subjectId: secondSemClass.sspSubject?._id || 
                      (typeof secondSemClass.sspSubject === 'string' ? secondSemClass.sspSubject : '') || 
                      secondSemClass.sspSubjectId || ''
          };
          
          // Find the selected subject
          if (editedClass.value.secondSem.subjectId) {
            selectedEditSecondSemSubject.value = subjects.value.find(
              s => s._id === editedClass.value.secondSem.subjectId
            );
          }
        }
      } else {
        // If no classes found, fallback to just using the current class
        const sem = classItem.sspSubject?.semester || classItem.subject?.semester || '';
        
        if (sem.includes('1st')) {
          editedClass.value.firstSem = {
            _id: classItem._id,
            daySchedule: classItem.daySchedule || '',
            timeSchedule: classItem.timeSchedule || '',
            room: classItem.room || '',
            subjectId: classItem.sspSubject?._id || 
                      (typeof classItem.sspSubject === 'string' ? classItem.sspSubject : '') || 
                      classItem.sspSubjectId || ''
          };
          
          // Find the selected subject
          if (editedClass.value.firstSem.subjectId) {
            selectedEditFirstSemSubject.value = subjects.value.find(
              s => s._id === editedClass.value.firstSem.subjectId
            );
          }
        } else if (sem.includes('2nd')) {
          editedClass.value.secondSem = {
            _id: classItem._id,
            daySchedule: classItem.daySchedule || '',
            timeSchedule: classItem.timeSchedule || '',
            room: classItem.room || '',
            subjectId: classItem.sspSubject?._id || 
                      (typeof classItem.sspSubject === 'string' ? classItem.sspSubject : '') || 
                      classItem.sspSubjectId || ''
          };
          
          // Find the selected subject
          if (editedClass.value.secondSem.subjectId) {
            selectedEditSecondSemSubject.value = subjects.value.find(
              s => s._id === editedClass.value.secondSem.subjectId
            );
          }
        }
      }
    } catch (error) {
      console.error('Error finding semester classes:', error);
      // Fallback to just using the current class
      const sem = classItem.sspSubject?.semester || classItem.subject?.semester || '';
      
      if (sem.includes('1st')) {
        editedClass.value.firstSem = {
          _id: classItem._id,
          daySchedule: classItem.daySchedule || '',
          timeSchedule: classItem.timeSchedule || '',
          room: classItem.room || '',
          subjectId: classItem.sspSubject?._id || 
                    (typeof classItem.sspSubject === 'string' ? classItem.sspSubject : '') || 
                    classItem.sspSubjectId || ''
        };
      } else if (sem.includes('2nd')) {
        editedClass.value.secondSem = {
          _id: classItem._id,
          daySchedule: classItem.daySchedule || '',
          timeSchedule: classItem.timeSchedule || '',
          room: classItem.room || '',
          subjectId: classItem.sspSubject?._id || 
                    (typeof classItem.sspSubject === 'string' ? classItem.sspSubject : '') || 
                    classItem.sspSubjectId || ''
        };
      }
    }
    
    console.log('Edit form setup complete with data:', editedClass.value);
    
    // Show the edit modal
    showEditModal.value = true;
    
  } catch (error) {
    console.error('Error opening edit modal:', error);
    notificationService.showError('Error opening edit modal: ' + error.message);
  }
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
  
  // Generate options based on hours
  return [
    '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', 
    '5:00 PM', '6:00 PM', '7:00 PM'
  ].map(startTime => {
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
  
  // Generate options based on hours
  return [
    '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', 
    '5:00 PM', '6:00 PM', '7:00 PM'
  ].map(startTime => {
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

// Function to update classes (both semesters)
async function updateClass() {
  try {
    // Validate form fields
    if (!validateEditForm()) {
      return;
    }
    
    const updatePromises = [];
    
    // Update first semester class if it exists
    if (editedClass.value.firstSem._id) {
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
      
      // Prepare the class data for first semester
      const firstSemData = {
        yearLevel: editedClass.value.yearLevel,
        section: editedClass.value.section,
        major: editedClass.value.major,
        daySchedule: editedClass.value.firstSem.daySchedule,
        timeSchedule: editedClass.value.firstSem.timeSchedule,
        room: editedClass.value.firstSem.room,
        status: editedClass.value.status || 'active',
        sspSubjectId: editedClass.value.firstSem.subjectId,
        hours: firstSemHours
      };
      
      console.log('Updating 1st semester class with data:', firstSemData);
      
      // Add the update promise to our array
      updatePromises.push(
        classService.update(editedClass.value.firstSem._id, firstSemData)
          .then(response => {
            console.log('1st semester class updated successfully:', response);
            
            // Update the class list
            const index = allClasses.value.findIndex(c => c._id === editedClass.value.firstSem._id);
            if (index !== -1) {
              allClasses.value[index] = { ...allClasses.value[index], ...response };
            }
            
            return response;
          })
      );
    }
    
    // Update second semester class if it exists
    if (editedClass.value.secondSem._id) {
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
      
      // Prepare the class data for second semester
      const secondSemData = {
        yearLevel: editedClass.value.yearLevel,
        section: editedClass.value.section,
        major: editedClass.value.major,
        daySchedule: editedClass.value.secondSem.daySchedule,
        timeSchedule: editedClass.value.secondSem.timeSchedule,
        room: editedClass.value.secondSem.room,
        status: editedClass.value.status || 'active',
        sspSubjectId: editedClass.value.secondSem.subjectId,
        hours: secondSemHours
      };
      
      console.log('Updating 2nd semester class with data:', secondSemData);
      
      // Add the update promise to our array
      updatePromises.push(
        classService.update(editedClass.value.secondSem._id, secondSemData)
          .then(response => {
            console.log('2nd semester class updated successfully:', response);
            
            // Update the class list
            const index = allClasses.value.findIndex(c => c._id === editedClass.value.secondSem._id);
            if (index !== -1) {
              allClasses.value[index] = { ...allClasses.value[index], ...response };
            }
            
            return response;
          })
      );
    }
    
    // Create a new first semester class if it doesn't exist but has data
    if (!editedClass.value.firstSem._id && editedClass.value.firstSem.subjectId && 
        editedClass.value.firstSem.daySchedule && editedClass.value.firstSem.timeSchedule && 
        editedClass.value.firstSem.room) {
      
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
      
      // Prepare the class data for creating a new first semester class
      const firstSemData = {
        yearLevel: editedClass.value.yearLevel,
        section: editedClass.value.section,
        major: editedClass.value.major,
        daySchedule: editedClass.value.firstSem.daySchedule,
        timeSchedule: editedClass.value.firstSem.timeSchedule,
        room: editedClass.value.firstSem.room,
        status: editedClass.value.status || 'active',
        sspSubjectId: editedClass.value.firstSem.subjectId,
        hours: firstSemHours
      };
      
      console.log('Creating new 1st semester class with data:', firstSemData);
      
      // Add the create promise to our array
      updatePromises.push(
        classService.create(firstSemData)
          .then(response => {
            console.log('1st semester class created successfully:', response);
            
            // Add to local list
            allClasses.value.push(response);
            
            return response;
          })
      );
    }
    
    // Create a new second semester class if it doesn't exist but has data
    if (!editedClass.value.secondSem._id && editedClass.value.secondSem.subjectId && 
        editedClass.value.secondSem.daySchedule && editedClass.value.secondSem.timeSchedule && 
        editedClass.value.secondSem.room) {
      
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
      
      // Prepare the class data for creating a new second semester class
      const secondSemData = {
        yearLevel: editedClass.value.yearLevel,
        section: editedClass.value.section,
        major: editedClass.value.major,
        daySchedule: editedClass.value.secondSem.daySchedule,
        timeSchedule: editedClass.value.secondSem.timeSchedule,
        room: editedClass.value.secondSem.room,
        status: editedClass.value.status || 'active',
        sspSubjectId: editedClass.value.secondSem.subjectId,
        hours: secondSemHours
      };
      
      console.log('Creating new 2nd semester class with data:', secondSemData);
      
      // Add the create promise to our array
      updatePromises.push(
        classService.create(secondSemData)
          .then(response => {
            console.log('2nd semester class created successfully:', response);
            
            // Add to local list
            allClasses.value.push(response);
            
            return response;
          })
      );
    }
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Apply filtering rules
    classes.value = filteredClasses.value;
    
    notificationService.showSuccess('Classes updated successfully');
    showEditModal.value = false;
    
    // If status changed to inactive, refresh class list to remove it from view
    if (editedClass.value.status === 'inactive') {
      await fetchClasses();
    }
  } catch (error) {
    console.error('Error updating classes:', error);
    
    // Show more detailed error information
    if (error.response && error.response.data) {
      console.error('Server error details:', error.response.data);
      notificationService.showError(error.response.data.message || 'Failed to update classes. Please check your inputs.');
    } else {
      notificationService.showError('Failed to update classes. Please try again later.');
    }
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
  console.log('Edit year level changed to:', editedClass.value.yearLevel);
  
  // Fetch available sections for the selected year level
  availableSectionsEdit.value = systemOptionsData.value?.class?.sections?.[editedClass.value.yearLevel] || [];
  
  if (availableSectionsEdit.value.length === 0) {
    // Fallback to default sections if system options aren't available
    if (editedClass.value.yearLevel === '2nd') {
      availableSectionsEdit.value = ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'];
    } else if (editedClass.value.yearLevel === '3rd') {
      availableSectionsEdit.value = ['South-1', 'South-2', 'South-3'];
    } else if (editedClass.value.yearLevel === '4th') {
      availableSectionsEdit.value = ['South-1', 'South-2'];
    }
  }
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
</script> 