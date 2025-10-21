<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-normal text-gray-800">System Options</h1>
              <p class="text-gray-500 font-normal">Configure system settings and preferences</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="resetToDefaults" 
              class="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md shadow-sm text-sm font-normal text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Reset to Defaults
            </button>
            <button 
              @click="saveOptions" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-normal text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div class="flex justify-center items-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span class="text-gray-500">Loading system options...</span>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              @click="activeTab = 'class'"
              class="py-4 px-6 font-normal text-sm border-b-2 focus:outline-none transition-colors"
              :class="activeTab === 'class' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              Class Settings
            </button>
            <button
              @click="activeTab = 'subject'"
              class="py-4 px-6 font-normal text-sm border-b-2 focus:outline-none transition-colors"
              :class="activeTab === 'subject' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Subject Settings
          </button>
            <button
              @click="activeTab = 'consultation'"
              class="py-4 px-6 font-normal text-sm border-b-2 focus:outline-none transition-colors"
              :class="activeTab === 'consultation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Consultation Settings
          </button>
        </nav>
      </div>

      <!-- Class Settings Tab -->
      <div v-if="activeTab === 'class'" class="p-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Year Levels</h3>
          <div class="space-y-2 mb-4">
            <div v-for="(yearLevel, index) in options.class.yearLevels" :key="index" class="flex items-center">
              <input 
                type="text" 
                v-model="options.class.yearLevels[index]" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <button 
                @click="removeYearLevel(index)" 
                class="ml-2 text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <button 
            @click="addYearLevel" 
            class="text-primary hover:text-primary-dark flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Year Level
          </button>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Sections by Year Level</h3>
          <div class="space-y-6">
            <div v-for="yearLevel in options.class.yearLevels" :key="yearLevel" class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium mb-2">{{ yearLevel }} Year Sections</h4>
              <div class="space-y-2 mb-4">
                <div v-for="(section, index) in getSectionsForYearLevel(yearLevel)" :key="index" class="flex items-center">
                  <input 
                    type="text" 
                    v-model="getSectionsForYearLevel(yearLevel)[index]" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                  <button 
                    @click="removeSectionForYearLevel(yearLevel, index)" 
                    class="ml-2 text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <button 
                @click="addSectionForYearLevel(yearLevel)" 
                class="text-primary hover:text-primary-dark flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Add Section for {{ yearLevel }} Year
              </button>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Majors by Year Level</h3>
          
          <!-- Year Level Tabs for Majors -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="border-b border-gray-200">
              <nav class="flex -mb-px">
                <button 
                  v-for="yearLevel in options.class.yearLevels" 
                  :key="yearLevel" 
                  @click="activeMajorTab = yearLevel"
                  class="py-3 px-4 text-sm font-medium border-b-2 focus:outline-none"
                  :class="[
                    activeMajorTab === yearLevel 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  {{ yearLevel }} Year Majors
                </button>
              </nav>
            </div>
            
            <div class="p-4">
              <div v-for="yearLevel in options.class.yearLevels" :key="yearLevel" v-show="activeMajorTab === yearLevel">
                <div class="space-y-2 mb-4">
                  <div v-for="(major, index) in getMajorsForYearLevel(yearLevel)" :key="index" class="flex items-center">
                    <input 
                      type="text" 
                      v-model="getMajorsForYearLevel(yearLevel)[index]" 
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                    <button 
                      @click="removeMajorForYearLevel(yearLevel, index)" 
                      class="ml-2 text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button 
                  @click="addMajorForYearLevel(yearLevel)" 
                  class="text-primary hover:text-primary-dark flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  Add Major for {{ yearLevel }} Year
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Room Configuration</h3>
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium mb-2">Available Rooms</h4>
            <div class="space-y-2 mb-4">
              <div v-for="(room, index) in options.class.rooms" :key="index" class="flex items-center">
                <input 
                  type="text" 
                  v-model="options.class.rooms[index]" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="e.g. 301"
                />
                <button 
                  @click="removeRoom(index)" 
                  class="ml-2 text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <button 
              @click="addRoom" 
              class="text-primary hover:text-primary-dark flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Add Room
            </button>
            <p class="text-sm text-gray-500 mt-4">
              These rooms will be available for selection when creating or editing classes.
            </p>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Default Sessions</h3>
          <p class="text-sm text-gray-500 mb-4">These sessions will be automatically added to new classes</p>
          <div class="space-y-2 mb-4">
            <div v-for="(session, index) in options.class.defaultSessions" :key="index" class="flex items-center">
              <input 
                type="text" 
                v-model="options.class.defaultSessions[index].title" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <button 
                @click="removeDefaultSession(index)" 
                class="ml-2 text-red-500 hover:text-red-700"
                :disabled="index === 0"
                :class="{'opacity-50 cursor-not-allowed': index === 0}"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <button 
            @click="addDefaultSession" 
            class="text-primary hover:text-primary-dark flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Default Session
          </button>
        </div>
      </div>
      
      <!-- Subject Settings Tab -->
      <div v-if="activeTab === 'subject'" class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <!-- Full-width Column: Subject Year Levels & Sessions -->
          <div class="md:col-span-2">
            <h3 class="text-lg font-medium mb-3">Subject Year Levels & Sessions</h3>
            
            <div class="space-y-4">
              <!-- Card for each Year Level -->
              <div
                v-for="(config, index) in options.subject.configurations"
                :key="index"
                class="border border-gray-200 rounded-lg p-4 relative"
              >
                <!-- Remove Button -->
                <button
                  @click="removeSubjectYearLevel(index)" 
                  class="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                  aria-label="Remove Year Level"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                <!-- First Row: Year Level, SSP Code, Sessions, Semester -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                    <select 
                      v-model="config.year"
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                    </select> 
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">SSP Code</label>
                    <input 
                      type="text" 
                      v-model="config.sspCode"
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="e.g. SSP1"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Sessions</label>
                    <input
                      type="number" 
                      v-model.number="config.sessions"
                      @input="updateSessionDetails(config)"
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      min="1"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      v-model="config.semester"
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                    </select>
                  </div>
                </div>

                <!-- Second Row: Session Title and Day Number -->
                <div class="border-t pt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Session Details</label>
                  <div class="max-h-60 overflow-y-auto space-y-3 pr-2">
                    <div
                      v-for="(session, sessionIndex) in config.sessionDetails"
                      :key="sessionIndex" 
                      class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                      :class="{'bg-blue-50 p-2 rounded-md': session.isExam}"
                    > 
                      <div class="md:col-span-1 flex items-center justify-center">
                        <span class="text-sm font-semibold text-gray-600">{{ session.day }}</span>
                      </div>
                      <div :class="session.isExam ? 'md:col-span-5' : 'md:col-span-8'">
                        <label class="block text-xs font-medium text-gray-500" :class="{'text-blue-700': session.isExam}">
                          {{ session.isExam ? 'Exam Title' : 'Session Title' }}
                        </label>
                        <input 
                          type="text" 
                          v-model="session.title"
                          :disabled="session.isExam"
                          class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          :class="{'font-semibold': session.isExam, 'bg-gray-100 cursor-not-allowed': session.isExam}"
                        />
                      </div>
                      <div v-if="session.isExam" class="md:col-span-4">
                        <label class="block text-xs font-medium text-blue-700">Exam Type</label>
                        <select
                          v-model="session.examType"
                          @change="updateExamTitle(session)"
                          class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary font-semibold"
                        >
                          <option value="Prelim">Prelim</option>
                          <option value="Midterm">Midterm</option>
                          <option value="Finals">Finals</option>
                        </select>
                      </div>
                      <div class="md:col-span-2 flex items-center justify-end space-x-2">
                        <label :for="`isExam-${config.year}-${config.semester}-${sessionIndex}`" class="text-xs text-gray-600">Is Exam?</label>
                        <input 
                          type="checkbox" 
                          v-model="session.isExam"
                          :id="`isExam-${config.year}-${config.semester}-${sessionIndex}`"
                          @change="handleIsExamChange(session, config)"
                          class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Button & Description -->
            <div class="mt-6">
              <button 
                @click="addSubjectYearLevel" 
                class="text-primary hover:text-primary-dark flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Add Configuration
              </button>
              <p class="mt-2 text-sm text-gray-500">Define year levels, their base SSP code, and session count.</p>
            </div>
          </div>
        </div>


        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">School Year</h3>
          <div class="space-y-2 mb-4">
            <input 
              type="text" 
              v-model="options.subject.schoolYear" 
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <p class="text-sm text-gray-500">This will be the fixed school year for all subjects</p>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">First Day Session</h3>
          <div class="space-y-2 mb-4">
            <input 
              type="text" 
              v-model="options.subject.defaultZeroDayTitle" 
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <p class="text-sm text-gray-500">This is the title for day zero session (automatically added to all subjects)</p>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Hours Options</h3>
          <div class="space-y-2 mb-4">
            <div v-for="(hour, index) in options.subject.hoursOptions" :key="index" class="flex items-center">
              <input 
                type="number" 
                v-model.number="options.subject.hoursOptions[index]" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <button 
                @click="removeHoursOption(index)" 
                class="ml-2 text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <button 
            @click="addHoursOption" 
            class="text-primary hover:text-primary-dark flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Hours Option
          </button>
        </div>
      </div>

      <!-- Consultation Settings Tab -->
      <div v-if="activeTab === 'consultation'" class="p-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Fixed Consultation Duration</h3>
          <div class="space-y-2 mb-4">
            <input 
              type="number" 
              v-model.number="options.consultation.fixedDuration" 
              min="1"
              max="8"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <p class="text-sm text-gray-500">Fixed duration in hours for all consultation sessions. This cannot be changed when creating consultations.</p>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Business Hours</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Start Time (AM)</label>
              <input 
                type="number" 
                v-model.number="options.consultation.businessHours.start" 
                min="6"
                max="12"
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <p class="text-sm text-gray-500 mt-1">Business hours start time (6-12 AM)</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">End Time (PM)</label>
              <input 
                type="number" 
                v-model.number="options.consultation.businessHours.end" 
                min="17"
                max="22"
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <p class="text-sm text-gray-500 mt-1">Business hours end time (5-10 PM)</p>
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-2">These settings control when consultations can be scheduled and how long they can run.</p>
        </div>
      </div>
    </div>
    
    <!-- Status Message -->
    <div v-if="statusMessage" class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md">
      <div class="flex items-center">
        <svg v-if="statusType === 'success'" class="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <svg v-if="statusType === 'error'" class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ statusMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { systemOptionsService } from '../../services/systemOptionsService'
import { notificationService } from '../../services/notificationService'

const loading = ref(true)
const activeTab = ref('class')
const statusMessage = ref('')
const statusType = ref('')
const activeMajorTab = ref('') // Active tab for majors section
const activeExamTab = ref('') // Active tab for exam sessions

const options = reactive({
  class: {
    yearLevels: ['2nd', '3rd', '4th'],
    majors: {
      '2nd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
      '3rd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
      '4th': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security']
    },
    defaultSessions: [
      { title: 'INTRODUCTION', count: 0 },
      { title: 'ORIENTATION', count: 0 }
    ],
    sections: {
      '2nd': ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'],
      '3rd': ['South-1', 'South-2', 'South-3'],
      '4th': ['South-1', 'South-2']
    },
    rooms: ['301', '302', '303', '304', '401', '402', '403', '404']
  },
  subject: {
    schoolYear: '2025 - 2026',
    defaultZeroDayTitle: 'INTRODUCTION',
    hoursOptions: [1, 2, 3],
    configurations: [
      { year: '1st', semester: '1st', sspCode: 'SSP1', sessions: 18, sessionDetails: [] },
      { year: '2nd', semester: '1st', sspCode: 'SSP2', sessions: 18, sessionDetails: [] },
      { year: '3rd', semester: '1st', sspCode: 'SSP3', sessions: 18, sessionDetails: [] },
      { year: '4th', semester: '1st', sspCode: 'SSP4', sessions: 18, sessionDetails: [] },
    ]
  },
  consultation: {
    fixedDuration: 3,
    businessHours: {
      start: 7,
      end: 18
    }
  }
})

// Default options for reset functionality
const defaultOptions = {
  class: {
    yearLevels: ['2nd', '3rd', '4th'],
    majors: {
      '2nd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
      '3rd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
      '4th': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security']
    },
    defaultSessions: [
      { title: 'INTRODUCTION', count: 0 },
      { title: 'ORIENTATION', count: 0 }
    ],
    sections: {
      '2nd': ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'],
      '3rd': ['South-1', 'South-2', 'South-3'],
      '4th': ['South-1', 'South-2']
    },
    rooms: ['301', '302', '303', '304', '401', '402', '403', '404']
  },
  subject: {
    schoolYear: '2025 - 2026',
    defaultZeroDayTitle: 'INTRODUCTION',
    hoursOptions: [1, 2, 3],
    configurations: [
      { year: '1st', semester: '1st', sspCode: 'SSP1', sessions: 18, sessionDetails: [] },
      { year: '2nd', semester: '1st', sspCode: 'SSP2', sessions: 18, sessionDetails: [] },
      { year: '3rd', semester: '1st', sspCode: 'SSP3', sessions: 18, sessionDetails: [] },
      { year: '4th', semester: '1st', sspCode: 'SSP4', sessions: 18, sessionDetails: [] },
    ]
  },
  consultation: {
    fixedDuration: 3,
    businessHours: {
      start: 7,
      end: 18
    }
  }
}
onMounted(async () => {
  await fetchOptions()
})

function updateSessionDetails(config) {
  const count = config.sessions || 0;
  const currentDetails = config.sessionDetails || [];
  
  if (currentDetails.length > count) {
    currentDetails.splice(count);
  } else if (currentDetails.length < count) {
    const semester = config.semester || '1st';
    const baseTitle = `${config.sspCode} ${semester === '1st' ? 'A' : 'B'}`;
    for (let i = currentDetails.length; i < count; i++) {
      currentDetails.push({ day: i + 1, title: `${baseTitle} - Session ${i + 1}`, isExam: false, examType: '' });
    }
  }
}
async function fetchOptions() {
  loading.value = true
  try {
    const data = await systemOptionsService.getAll()
    console.log('📦 DATA FROM DATABASE:', data)
    
    if (data) {
      // SIGURADUHING COMPLETE ANG DATA STRUCTURE BAGO I-ASSIGN
      // Data Migration: Convert old structure to new `configurations` array
      if (data.subject && data.subject.yearLevels) {
        const newConfigurations = [];
        data.subject.yearLevels.forEach(year => {
          const sessionDetails = data.subject.sessionDetailsPerYearLevel?.[year] || [];
          // Initialize session details if they don't exist
          const sessionCount = data.subject.sessionsPerYearLevel?.[year] || 18;
          if (sessionDetails.length < sessionCount) {
             const semester = data.subject.semesterPerYearLevel?.[year] || '1st';
             const sspCode = data.subject.sspCodePerYearLevel?.[year] || `SSP${year.charAt(0)}`;
             const baseTitle = `${sspCode} ${semester === '1st' ? 'A' : 'B'}`;
             for (let i = sessionDetails.length; i < sessionCount; i++) {
                sessionDetails.push({ day: i + 1, title: `${baseTitle} - Session ${i + 1}`, isExam: false, examType: '' });
             }
          }
          newConfigurations.push({
            year: year,
            semester: data.subject.semesterPerYearLevel?.[year] || '1st',
            sspCode: data.subject.sspCodePerYearLevel?.[year] || `SSP${year.charAt(0)}`,
            sessions: sessionCount,
            sessionDetails: sessionDetails
          });
        });
        data.subject.configurations = newConfigurations;
      }
      const completeData = ensureCompleteDataStructure(data)
      
      // COMPLETELY REPLACE ang options
      Object.keys(completeData).forEach(key => {
        if (completeData[key]) {
          options[key] = JSON.parse(JSON.stringify(completeData[key]))
        }
      })
      
      console.log('✅ OPTIONS AFTER LOADING:', {
        configurations: options.subject.configurations
      })

      showStatus('Settings loaded successfully', 'success')
    }
  } catch (error) {
    console.error('Error fetching system options:', error)
    notificationService.showWarning('Failed to load system options. Using defaults.')
    showStatus('Error loading settings. Using defaults.', 'error')
  } finally {
    loading.value = false
  }
}

// NEW FUNCTION: Siguraduhing complete ang data structure
function ensureCompleteDataStructure(data) {
  const completeData = JSON.parse(JSON.stringify(data))
  
  if (!completeData.subject) completeData.subject = {}
  if (!completeData.subject.configurations) {
    completeData.subject.configurations = JSON.parse(JSON.stringify(defaultOptions.subject.configurations));
  }

  // Clean up old properties
  delete completeData.subject.yearLevels;
  delete completeData.subject.sspCodePerYearLevel;
  delete completeData.subject.sessionsPerYearLevel;
  delete completeData.subject.semesterPerYearLevel;
  delete completeData.subject.sessionDetailsPerYearLevel;
  
  return completeData
}
async function saveOptions() {
  try {
    // Check if user is logged in first
    const token = localStorage.getItem('token');
    if (!token) {
      notificationService.showError('You must be logged in as an admin to save options');
      showStatus('Authentication required', 'error');
      return;
    }

    // Create a clean payload with only the new structure
    const payload = JSON.parse(JSON.stringify(options));
    if (payload.subject) {
      delete payload.subject.yearLevels;
      delete payload.subject.sspCodePerYearLevel;
      delete payload.subject.sessionsPerYearLevel;
      delete payload.subject.semesterPerYearLevel;
      delete payload.subject.sessionDetailsPerYearLevel;
    }
    
    await systemOptionsService.update(payload)
    notificationService.showSuccess('System options saved successfully')
    showStatus('Settings saved successfully', 'success')
  } catch (error) {
    console.error('Error saving system options:', error)
    
    if (error.response) {
      if (error.response.status === 401) {
        notificationService.showError('You must be logged in to save options');
      } else if (error.response.status === 403) {
        notificationService.showError('You must be an admin to save options');
      } else {
        notificationService.showError('Failed to save system options: ' + (error.response.data?.message || 'Server error'));
      }
    } else {
      notificationService.showError('Failed to save system options: Network error');
    }
    
    showStatus('Error saving settings', 'error')
  }
}

async function resetToDefaults() {
  if (confirm('Are you sure you want to reset all options to defaults? This cannot be undone.')) {
    try {
      // Check if user is logged in first
      const token = localStorage.getItem('token');
      if (!token) {
        notificationService.showError('You must be logged in as an admin to reset options');
        showStatus('Authentication required', 'error');
        return;
      }
      
      // Try API first
      await systemOptionsService.resetToDefaults();
      await fetchOptions(); // Refresh options from server
      
      notificationService.showSuccess('Options reset to defaults successfully.');
      showStatus('Settings reset to defaults', 'success');
    } catch (error) {
      console.error('Error resetting system options:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          notificationService.showError('You must be logged in to reset options');
        } else if (error.response.status === 403) {
          notificationService.showError('You must be an admin to reset options');
        } else {
          notificationService.showError('Failed to reset options: ' + (error.response.data?.message || 'Server error'));
        }
      } else {
        // Fallback to local reset
        options.class = JSON.parse(JSON.stringify(defaultOptions.class));
        options.subject = JSON.parse(JSON.stringify(defaultOptions.subject));
        notificationService.showWarning('Reset applied locally. Server reset failed.');
      }
      
      showStatus('Reset applied locally only', 'warning');
    }
  }
}

function showStatus(message, type) {
  statusMessage.value = message
  statusType.value = type
  
  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

// Class options functions
function addYearLevel() {
  // Add a unique default name to avoid key conflicts
  const newYearLevelName = `New Year Level ${options.class.yearLevels.length + 1}`;
  options.class.yearLevels.push(newYearLevelName);
  activeMajorTab.value = newYearLevelName; // Switch to the new tab
}

function removeYearLevel(index) {
  options.class.yearLevels.splice(index, 1)
}

// Majors functions - per year level
function getMajorsForYearLevel(yearLevel) {
  if (!options.class.majors[yearLevel]) {
    options.class.majors[yearLevel] = [];
  }
  return options.class.majors[yearLevel];
}

function addMajorForYearLevel(yearLevel) {
  if (!options.class.majors[yearLevel]) {
    options.class.majors[yearLevel] = [];
  }
  options.class.majors[yearLevel].push('');
}

function removeMajorForYearLevel(yearLevel, index) {
  if (options.class.majors[yearLevel]) {
    options.class.majors[yearLevel].splice(index, 1);
  }
}

function addDefaultSession() {
  options.class.defaultSessions.push({ title: '', count: 0 })
}

function removeDefaultSession(index) {
  // Don't allow removing the INTRODUCTION session
  if (index === 0) return
  options.class.defaultSessions.splice(index, 1)
}

// Room configuration functions
function addRoom() {
  options.class.rooms.push('')
}

function removeRoom(index) {
  options.class.rooms.splice(index, 1)
}

// Subject options functions
function addHoursOption() {
  options.subject.hoursOptions.push(1)
}

function removeHoursOption(index) {
  options.subject.hoursOptions.splice(index, 1)
}

// Functions for section management
function getSectionsForYearLevel(yearLevel) {
  if (!options.class.sections[yearLevel]) {
    options.class.sections[yearLevel] = [];
  }
  return options.class.sections[yearLevel];
}

function addSectionForYearLevel(yearLevel) {
  if (!options.class.sections[yearLevel]) {
    options.class.sections[yearLevel] = [];
  }
  options.class.sections[yearLevel].push('');
}

function removeSectionForYearLevel(yearLevel, index) {
  if (options.class.sections[yearLevel]) {
    options.class.sections[yearLevel].splice(index, 1);
  }
}

function addSubjectYearLevel() {
  const newConfig = {
    year: '1st',
    semester: '2nd', // Default to 2nd semester for new entries
    sspCode: 'SSP1',
    sessions: 18,
    sessionDetails: []
  };
  updateSessionDetails(newConfig); // Populate session details
  options.subject.configurations.push(newConfig);
}

function removeSubjectYearLevel(index) {
  options.subject.configurations.splice(index, 1);
}

function handleIsExamChange(session, config) {
  if (session.isExam) {
    // VALIDATION: Check if we are exceeding the max number of exams
    const examCount = config.sessionDetails.filter(s => s.isExam).length;
    if (examCount > 3) {
      notificationService.showWarning('You can only set a maximum of 3 exams per configuration.');
      // Revert the change since v-model has already updated it
      session.isExam = false; 
      return; // Stop further execution
    }

    // When checked, set default exam type and update title
    session.examType = 'Prelim';
    session.title = 'Prelim Exam';
  } else {
    // When unchecked, reset exam type and title
    session.examType = '';
    const baseTitle = `${config.sspCode} ${config.semester === '1st' ? 'A' : 'B'}`;
    session.title = `${baseTitle} - Session ${session.day}`;
  }
}

function updateExamTitle(session) {
  if (session.isExam && session.examType) {
    session.title = `${session.examType} Exam`;
  }
}
</script> 