<template>
  <div class="mm-submissions">
    <div class="max-w-6xl mx-auto p-6">
      <!-- Title -->
      <div class="text-center mb-8">
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-primary mb-2">M&M</h1>
            <p class="text-gray-600">Upload your M&M response forms organized by year level and semester</p>
        </div>
          <router-link 
            to="/student/mm-history" 
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View History
          </router-link>
        </div>
      </div>
      
      <!-- Loading Year Level -->
      <div v-if="loadingYearLevel" class="flex justify-center my-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Year Level Display -->
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Year Level Header -->
        <div class="bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-6">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <span class="text-2xl font-bold">{{ getYearNumber(currentYearLevel) }}</span>
              </div>
        <div>
                <h2 class="text-2xl font-bold">{{ getYearLevelText(currentYearLevel) }}</h2>
                <p class="text-blue-100 mt-1">
                  M&M Response Submissions
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-blue-100">Total Submissions</div>
              <div class="text-2xl font-bold">{{ getTotalSubmissions() }}/6</div>
            </div>
          </div>
        </div>
        
        <!-- Semester Tabs -->
        <div class="border-b border-gray-200 bg-gray-50">
          <nav class="flex -mb-px">
            <button 
              @click="handleSemesterTabClick('1st')"
              :disabled="currentSemester === '2nd'"
              :class="[
                'py-4 px-6 text-sm font-medium border-b-2 focus:outline-none transition-colors',
                currentSemester === '2nd' ? 'opacity-50 cursor-not-allowed' : '',
                selectedSemester === '1st' 
                  ? 'border-blue-500 text-blue-600 bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              1st Semester
              <span class="ml-2 py-1 px-2 text-xs rounded-full"
                    :class="selectedSemester === '1st' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'">
                {{ getSemesterSubmissionCount('1st') }}/3
              </span>
              <span v-if="currentSemester === '2nd'" class="ml-2 text-xs text-gray-400">(Completed)</span>
            </button>
            <button 
              @click="handleSemesterTabClick('2nd')"
              :disabled="currentSemester === '1st'"
              :class="[
                'py-4 px-6 text-sm font-medium border-b-2 focus:outline-none transition-colors',
                currentSemester === '1st' ? 'opacity-50 cursor-not-allowed' : '',
                selectedSemester === '2nd' 
                  ? 'border-green-500 text-green-600 bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              2nd Semester
              <span class="ml-2 py-1 px-2 text-xs rounded-full"
                    :class="selectedSemester === '2nd' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'">
                {{ getSemesterSubmissionCount('2nd') }}/3
              </span>
              
            </button>
          </nav>
        </div>
        
        <!-- Exam Upload Cards -->
        <div class="p-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- P1 Response -->
            <div class="bg-white rounded-lg border-2 transition-colors">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-800">P1 Response</h3>
                  <span v-if="getSubmissionStatus(selectedSemester, 'P1')" 
                        class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="getStatusBadgeClass(getSubmissionStatus(selectedSemester, 'P1'))">
                    {{ getSubmissionStatus(selectedSemester, 'P1') }}
                  </span>
                </div>

                <!-- Upload Area -->
                <div v-if="!getSubmissionImage(selectedSemester, 'P1')" 
                     class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                     :class="[
                       (selectedSemester !== currentSemester) 
                         ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                         : examEligibility.P1
                           ? 'border-gray-300 hover:border-gray-400 cursor-pointer'
                           : 'border-red-200 bg-red-50 cursor-not-allowed'
                     ]"
                     @click="() => (selectedSemester === currentSemester && examEligibility.P1) ? handleUploadClick('P1') : null"
                     @dragover.prevent
                     @drop.prevent="(e) => (selectedSemester === currentSemester && examEligibility.P1) ? handleFileDrop(e, 'P1') : null">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       class="h-12 w-12 mx-auto mb-4"
                       :class="(selectedSemester !== currentSemester) ? 'text-gray-300' : examEligibility.P1 ? 'text-gray-400' : 'text-red-300'"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p class="mb-2" 
                     :class="(selectedSemester !== currentSemester) ? 'text-gray-400' : examEligibility.P1 ? 'text-gray-600' : 'text-red-500'">
                    {{ (selectedSemester !== currentSemester) ? 'Semester Locked' : 
                       examEligibility.P1 ? 'Click to upload or drag and drop' : 'Complete sessions before P1 exam to unlock' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ (selectedSemester !== currentSemester) ? 
                       (currentSemester === '1st' ? 'Your class has not been promoted to 2nd semester' : 'Your class is now in 2nd semester') : 
                       'PNG, JPG up to 10MB' }}
                  </p>
                </div>

                <!-- Uploaded Image Preview -->
                <div v-else class="relative">
                  <img :src="getSubmissionImage(selectedSemester, 'P1') || ''" 
                       alt="P1 Response" 
                       class="w-full h-64 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                       @click="() => viewSubmissionImage(getSubmissionImage(selectedSemester, 'P1'), 'P1 M&M Response')">
                  <button @click="() => removeImage('P1')"
                          class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <!-- Change image button -->
                  <button v-if="!isSubmitted(selectedSemester, 'P1') && getPermitStatus(selectedSemester, 'P1') !== 'validated'"
                          @click="() => handleUploadClick('P1')"
                          class="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                          title="Change M&M image">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>

                <!-- Upload Button -->
                <button v-if="pendingImages['P1'] && !isSubmitted(selectedSemester, 'P1') && getPermitStatus(selectedSemester, 'P1') !== 'validated'"
                        @click="() => submitExam('P1')"
                        :disabled="uploading.P1"
                        class="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span v-if="uploading.P1">Uploading...</span>
                  <span v-else>Submit P1 Response</span>
                </button>

                <!-- Hidden File Input -->
                <input type="file" 
                       :ref="el => { if (el) P1FileInput = el }"
                       @change="(e) => handleFileSelect(e, 'P1')" 
                       accept="image/*" 
                       class="hidden">
              </div>
            </div>

            <!-- P2 Response -->
            <div class="bg-white rounded-lg border-2 transition-colors">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-800">P2 Response</h3>
                  <span v-if="getSubmissionStatus(selectedSemester, 'P2')" 
                        class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="getStatusBadgeClass(getSubmissionStatus(selectedSemester, 'P2'))">
                    {{ getSubmissionStatus(selectedSemester, 'P2') }}
                  </span>
                </div>

                <!-- Upload Area -->
                <div v-if="!getSubmissionImage(selectedSemester, 'P2')" 
                     class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                     :class="[
                       (selectedSemester !== currentSemester) 
                         ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                         : examEligibility.P2
                           ? 'border-gray-300 hover:border-gray-400 cursor-pointer'
                           : 'border-red-200 bg-red-50 cursor-not-allowed'
                     ]"
                     @click="() => (selectedSemester === currentSemester && examEligibility.P2) ? handleUploadClick('P2') : null"
                     @dragover.prevent
                     @drop.prevent="(e) => (selectedSemester === currentSemester && examEligibility.P2) ? handleFileDrop(e, 'P2') : null">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       class="h-12 w-12 mx-auto mb-4"
                       :class="(selectedSemester !== currentSemester) ? 'text-gray-300' : examEligibility.P2 ? 'text-gray-400' : 'text-red-300'"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p class="mb-2" 
                     :class="(selectedSemester !== currentSemester) ? 'text-gray-400' : examEligibility.P2 ? 'text-gray-600' : 'text-red-500'">
                    {{ (selectedSemester !== currentSemester) ? 'Semester Locked' : 
                       examEligibility.P2 ? 'Click to upload or drag and drop' : 'Complete P1 exam and sessions before P2 to unlock' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ (selectedSemester !== currentSemester) ? 
                       (currentSemester === '1st' ? 'Your class has not been promoted to 2nd semester' : 'Your class is now in 2nd semester') : 
                       'PNG, JPG up to 10MB' }}
                  </p>
                </div>

                <!-- Uploaded Image Preview -->
                <div v-else class="relative">
                  <img :src="getSubmissionImage(selectedSemester, 'P2') || ''" 
                       alt="P2 Response" 
                       class="w-full h-64 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                       @click="() => viewSubmissionImage(getSubmissionImage(selectedSemester, 'P2'), 'P2 M&M Response')">
                  <button @click="() => removeImage('P2')"
                          class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <!-- Change image button -->
                  <button v-if="!isSubmitted(selectedSemester, 'P2') && getPermitStatus(selectedSemester, 'P2') !== 'validated'"
                          @click="() => handleUploadClick('P2')"
                          class="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                          title="Change M&M image">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>

                <!-- Upload Button -->
                <button v-if="pendingImages['P2'] && !isSubmitted(selectedSemester, 'P2') && getPermitStatus(selectedSemester, 'P2') !== 'validated'"
                        @click="() => submitExam('P2')"
                        :disabled="uploading.P2"
                        class="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span v-if="uploading.P2">Uploading...</span>
                  <span v-else>Submit P2 Response</span>
                </button>

                <!-- Hidden File Input -->
                <input type="file" 
                       :ref="el => { if (el) P2FileInput = el }"
                       @change="(e) => handleFileSelect(e, 'P2')" 
                       accept="image/*" 
                       class="hidden">
              </div>
            </div>

            <!-- P3 Exam -->
            <div class="bg-white rounded-lg border-2 transition-colors">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-800">P3 Response</h3>
                  <span v-if="getSubmissionStatus(selectedSemester, 'P3')" 
                        class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="getStatusBadgeClass(getSubmissionStatus(selectedSemester, 'P3'))">
                    {{ getSubmissionStatus(selectedSemester, 'P3') }}
                  </span>
                </div>

                <!-- Upload Area -->
                <div v-if="!getSubmissionImage(selectedSemester, 'P3')" 
                     class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                     :class="[
                       (selectedSemester !== currentSemester) 
                         ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                         : examEligibility.P3
                           ? 'border-gray-300 hover:border-gray-400 cursor-pointer'
                           : 'border-red-200 bg-red-50 cursor-not-allowed'
                     ]"
                     @click="() => (selectedSemester === currentSemester && examEligibility.P3) ? handleUploadClick('P3') : null"
                     @dragover.prevent
                     @drop.prevent="(e) => (selectedSemester === currentSemester && examEligibility.P3) ? handleFileDrop(e, 'P3') : null">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       class="h-12 w-12 mx-auto mb-4"
                       :class="(selectedSemester !== currentSemester) ? 'text-gray-300' : examEligibility.P3 ? 'text-gray-400' : 'text-red-300'"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p class="mb-2" 
                     :class="(selectedSemester !== currentSemester) ? 'text-gray-400' : examEligibility.P3 ? 'text-gray-600' : 'text-red-500'">
                    {{ (selectedSemester !== currentSemester) ? 'Semester Locked' : 
                       examEligibility.P3 ? 'Click to upload or drag and drop' : 'Complete P2 exam and sessions before P3 to unlock' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ (selectedSemester !== currentSemester) ? 
                       (currentSemester === '1st' ? 'Your class has not been promoted to 2nd semester' : 'Your class is now in 2nd semester') : 
                       'PNG, JPG up to 10MB' }}
                  </p>
                </div>

                <!-- Uploaded Image Preview -->
                <div v-else class="relative">
                  <img :src="getSubmissionImage(selectedSemester, 'P3') || ''" 
                       alt="P3 Response" 
                       class="w-full h-64 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                       @click="() => viewSubmissionImage(getSubmissionImage(selectedSemester, 'P3'), 'P3 M&M Response')">
                  <button @click="() => removeImage('P3')"
                          class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <!-- Change image button -->
                  <button v-if="!isSubmitted(selectedSemester, 'P3') && getPermitStatus(selectedSemester, 'P3') !== 'validated'"
                          @click="() => handleUploadClick('P3')"
                          class="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                          title="Change M&M image">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>

                <!-- Upload Button -->
                <button v-if="pendingImages['P3'] && !isSubmitted(selectedSemester, 'P3') && getPermitStatus(selectedSemester, 'P3') !== 'validated'"
                        @click="() => submitExam('P3')"
                        :disabled="uploading.P3"
                        class="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span v-if="uploading.P3">Uploading...</span>
                  <span v-else>Submit P3 Response</span>
                </button>

                <!-- Hidden File Input -->
                <input type="file" 
                       :ref="el => { if (el) P3FileInput = el }"
                       @change="(e) => handleFileSelect(e, 'P3')" 
                       accept="image/*" 
                       class="hidden">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Exam Permit Upload Section -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mt-6">
        <div class="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold">Exam Permit Upload</h2>
              <p class="text-green-100 mt-1">Upload your exam permits for P1, P2, P3 verification</p>
            </div>
          </div>
        </div>

        <!-- Permit Upload Cards -->
        <div class="p-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- P1 Permit -->
            <div class="bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-800">P1 Permit</h3>
                  <div class="flex items-center space-x-2">
                    <span v-if="getPermitStatus(selectedSemester, 'P1')" 
                          class="px-2 py-1 text-xs rounded-full font-medium"
                          :class="getPermitStatusBadgeClass(getPermitStatus(selectedSemester, 'P1'))">
                      {{ getPermitStatus(selectedSemester, 'P1') }}
                    </span>
                  </div>
                </div>

                <!-- Upload Area -->
                <div v-if="!getPermitImage(selectedSemester, 'P1')" 
                     class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                     :class="[
                       (selectedSemester !== currentSemester) 
                         ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                         : examEligibility.P1
                           ? 'border-gray-300 hover:border-gray-400 cursor-pointer'
                           : 'border-red-200 bg-red-50 cursor-not-allowed'
                     ]"
                     @click="() => (selectedSemester === currentSemester && examEligibility.P1) ? handlePermitUploadClick('P1') : null"
                     @dragover.prevent
                     @drop.prevent="(e) => (selectedSemester === currentSemester && examEligibility.P1) ? handlePermitFileDrop(e, 'P1') : null">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       class="h-12 w-12 mx-auto mb-4"
                       :class="(selectedSemester !== currentSemester) ? 'text-gray-300' : examEligibility.P1 ? 'text-gray-400' : 'text-red-300'"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="mb-2" 
                     :class="(selectedSemester !== currentSemester) ? 'text-gray-400' : examEligibility.P1 ? 'text-gray-600' : 'text-red-500'">
                    {{ (selectedSemester !== currentSemester) ? 'Semester Locked' : 
                       examEligibility.P1 ? 'Click to upload or drag and drop' : 'Complete sessions before P1 exam to unlock permit submission' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ (selectedSemester !== currentSemester) ? 
                       (currentSemester === '1st' ? 'Your class has not been promoted to 2nd semester' : 'Your class is now in 2nd semester') : 
                       'PNG, JPG, PDF up to 10MB' }}
                  </p>
                </div>

                <!-- Uploaded Preview (image or PDF) -->
                <div v-else class="relative">
                  <div class="w-full h-64 rounded-lg border overflow-hidden flex items-center justify-center bg-white">
                    <template v-if="getPermitMimetype(selectedSemester, 'P1') === 'application/pdf'">
                      <a :href="getPermitImage(selectedSemester, 'P1')" target="_blank" rel="noopener" class="px-3 py-2 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700">
                        Open PDF
                      </a>
                    </template>
                    <img v-else :src="getPermitImage(selectedSemester, 'P1')" 
                         alt="P1 Permit" 
                         class="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                         @click="() => viewPermitImage(getPermitImage(selectedSemester, 'P1'), 'P1 Permit')">
                  </div>
                  <button @click="() => removePermitImage('P1')"
                          class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Upload Button -->
                <!-- Upload button removed; card click already opens file picker -->

                <!-- Submit Button -->
                <div v-if="permitImages['P1_file'] && getPermitStatus(selectedSemester, 'P1') !== 'validated'" class="mt-4">
                  <button @click="() => submitPermit('P1')"
                          :disabled="permitUploading.P1"
                          class="w-full py-2 px-4 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                    <span v-if="permitUploading.P1">Uploading...</span>
                    <span v-else>Submit P1 Permit</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- P2 Permit -->
            <div class="bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-800">P2 Permit</h3>
                  <div class="flex items-center space-x-2">
                    <span v-if="getPermitStatus(selectedSemester, 'P2')" 
                          class="px-2 py-1 text-xs rounded-full font-medium"
                          :class="getPermitStatusBadgeClass(getPermitStatus(selectedSemester, 'P2'))">
                      {{ getPermitStatus(selectedSemester, 'P2') }}
                    </span>
                  </div>
                </div>

                <!-- Upload Area -->
                <div v-if="!getPermitImage(selectedSemester, 'P2')" 
                     class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                     :class="[
                       (selectedSemester !== currentSemester) 
                         ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                         : examEligibility.P2
                           ? 'border-gray-300 hover:border-gray-400 cursor-pointer'
                           : 'border-red-200 bg-red-50 cursor-not-allowed'
                     ]"
                     @click="() => (selectedSemester === currentSemester && examEligibility.P2) ? handlePermitUploadClick('P2') : null"
                     @dragover.prevent
                     @drop.prevent="(e) => (selectedSemester === currentSemester && examEligibility.P2) ? handlePermitFileDrop(e, 'P2') : null">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       class="h-12 w-12 mx-auto mb-4"
                       :class="(selectedSemester !== currentSemester) ? 'text-gray-300' : examEligibility.P2 ? 'text-gray-400' : 'text-red-300'"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="mb-2" 
                     :class="(selectedSemester !== currentSemester) ? 'text-gray-400' : examEligibility.P2 ? 'text-gray-600' : 'text-red-500'">
                    {{ (selectedSemester !== currentSemester) ? 'Semester Locked' : 
                       examEligibility.P2 ? 'Click to upload or drag and drop' : 'Complete P1 exam and sessions before P2 to unlock permit submission' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ (selectedSemester !== currentSemester) ? 
                       (currentSemester === '1st' ? 'Your class has not been promoted to 2nd semester' : 'Your class is now in 2nd semester') : 
                       'PNG, JPG, PDF up to 10MB' }}
                  </p>
                </div>

                <!-- Uploaded Preview (image or PDF) -->
                <div v-else class="relative">
                  <div class="w-full h-64 rounded-lg border overflow-hidden flex items-center justify-center bg-white">
                    <template v-if="getPermitMimetype(selectedSemester, 'P2') === 'application/pdf'">
                      <a :href="getPermitImage(selectedSemester, 'P2')" target="_blank" rel="noopener" class="px-3 py-2 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700">
                        Open PDF
                      </a>
                    </template>
                    <img v-else :src="getPermitImage(selectedSemester, 'P2')" 
                         alt="P2 Permit" 
                         class="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                         @click="() => viewPermitImage(getPermitImage(selectedSemester, 'P2'), 'P2 Permit')">
                  </div>
                  <button @click="() => removePermitImage('P2')"
                          class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Upload Button -->
                <!-- Upload button removed; card click already opens file picker -->

                <!-- Submit Button -->
                <div v-if="permitImages['P2_file'] && getPermitStatus(selectedSemester, 'P2') !== 'validated'" class="mt-4">
                  <button @click="() => submitPermit('P2')"
                          :disabled="permitUploading.P2"
                          class="w-full py-2 px-4 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                    <span v-if="permitUploading.P2">Uploading...</span>
                    <span v-else>Submit P2 Permit</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- P3 Permit -->
            <div class="bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-800">P3 Permit</h3>
                  <div class="flex items-center space-x-2">
                    <span v-if="getPermitStatus(selectedSemester, 'P3')" 
                          class="px-2 py-1 text-xs rounded-full font-medium"
                          :class="getPermitStatusBadgeClass(getPermitStatus(selectedSemester, 'P3'))">
                      {{ getPermitStatus(selectedSemester, 'P3') }}
                    </span>
                  </div>
                </div>

                <!-- Upload Area -->
                <div v-if="!getPermitImage(selectedSemester, 'P3')" 
                     class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                     :class="[
                       (selectedSemester !== currentSemester) 
                         ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                         : examEligibility.P3
                           ? 'border-gray-300 hover:border-gray-400 cursor-pointer'
                           : 'border-red-200 bg-red-50 cursor-not-allowed'
                     ]"
                     @click="() => (selectedSemester === currentSemester && examEligibility.P3) ? handlePermitUploadClick('P3') : null"
                     @dragover.prevent
                     @drop.prevent="(e) => (selectedSemester === currentSemester && examEligibility.P3) ? handlePermitFileDrop(e, 'P3') : null">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       class="h-12 w-12 mx-auto mb-4"
                       :class="(selectedSemester !== currentSemester) ? 'text-gray-300' : examEligibility.P3 ? 'text-gray-400' : 'text-red-300'"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="mb-2" 
                     :class="(selectedSemester !== currentSemester) ? 'text-gray-400' : examEligibility.P3 ? 'text-gray-600' : 'text-red-500'">
                    {{ (selectedSemester !== currentSemester) ? 'Semester Locked' : 
                       examEligibility.P3 ? 'Click to upload or drag and drop' : 'Complete P2 exam and sessions before P3 to unlock permit submission' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ (selectedSemester !== currentSemester) ? 
                       (currentSemester === '1st' ? 'Your class has not been promoted to 2nd semester' : 'Your class is now in 2nd semester') : 
                       'PNG, JPG, PDF up to 10MB' }}
                  </p>
                </div>

                <!-- Uploaded Preview (image or PDF) -->
                <div v-else class="relative">
                  <div class="w-full h-64 rounded-lg border overflow-hidden flex items-center justify-center bg-white">
                    <template v-if="getPermitMimetype(selectedSemester, 'P3') === 'application/pdf'">
                      <a :href="getPermitImage(selectedSemester, 'P3')" target="_blank" rel="noopener" class="px-3 py-2 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700">
                        Open PDF
                      </a>
                    </template>
                    <img v-else :src="getPermitImage(selectedSemester, 'P3')" 
                         alt="P3 Permit" 
                         class="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                         @click="() => viewPermitImage(getPermitImage(selectedSemester, 'P3'), 'P3 Permit')">
                  </div>
                  <button @click="() => removePermitImage('P3')"
                          class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Upload Button -->
                <!-- Upload button removed; card click already opens file picker -->

                <!-- Submit Button -->
                <div v-if="permitImages['P3_file'] && getPermitStatus(selectedSemester, 'P3') !== 'validated'" class="mt-4">
                  <button @click="() => submitPermit('P3')"
                          :disabled="permitUploading.P3"
                          class="w-full py-2 px-4 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                    <span v-if="permitUploading.P3">Uploading...</span>
                    <span v-else>Submit P3 Permit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hidden File Inputs for Permits -->
      <input
        ref="P1PermitFileInput"
        type="file"
        accept="image/*,application/pdf"
        @change="(e) => handlePermitFileSelect(e.target.files[0], 'P1')"
        class="hidden">
      <input
        ref="P2PermitFileInput"
        type="file"
        accept="image/*,application/pdf"
        @change="(e) => handlePermitFileSelect(e.target.files[0], 'P2')"
        class="hidden">
      <input
        ref="P3PermitFileInput"
        type="file"
        accept="image/*,application/pdf"
        @change="(e) => handlePermitFileSelect(e.target.files[0], 'P3')"
        class="hidden">

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="mt-6 p-4 bg-green-100 text-green-700 rounded-md">
        {{ successMessage }}
      </div>
      
      <div v-if="errorMessage" class="mt-6 p-4 bg-red-100 text-red-700 rounded-md">
        {{ errorMessage }}
      </div>
    </div>
  </div>

  <!-- Image View Modal -->
  <div v-if="showImageModal" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" @click="closeImageModal">
    <div class="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden" @click.stop>
      <div class="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <h3 class="text-lg font-medium">{{ modalImageTitle }}</h3>
        <button @click="closeImageModal" class="text-gray-300 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-4">
        <img :src="modalImageSrc" :alt="modalImageTitle" class="max-w-full max-h-96 mx-auto object-contain rounded">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { mmService } from '../../services/midtermFinalsService';
import { notificationService } from '../../services/notificationService';
import { studentService } from '../../services/studentService';
import { sessionService } from '../../services/sessionService';
import { examPermitService } from '../../services/examPermitService';
// Derive API origin for absolute file URLs (works in dev/prod)
const apiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://sspms-backend.onrender.com/api');
const apiOrigin = apiBase.replace(/\/api$/, '');
import Tesseract from 'tesseract.js';

// State
const loadingYearLevel = ref(true);
const currentYearLevel = ref('2nd');
const currentSemester = ref('1st');
const selectedSemester = ref('1st');
const submissions = ref([]);
const successMessage = ref('');
const errorMessage = ref('');

// Session checkpoint tracking
const sessionData = ref([]);
const studentDetails = ref(null);

// Image handling
const pendingImages = reactive({
  P1: null,
  P2: null,
  P3: null
});

const uploading = reactive({
  P1: false,
  P2: false,
  P3: false
});

// File input refs
const P1FileInput = ref(null);
const P2FileInput = ref(null);
const P3FileInput = ref(null);

// Image viewing state
const showImageModal = ref(false);
const modalImageSrc = ref('');
const modalImageTitle = ref('');

// Image viewing functions
function viewSubmissionImage(imageSrc, title) {
  modalImageSrc.value = imageSrc;
  modalImageTitle.value = title;
  showImageModal.value = true;
}

function viewPermitImage(imageSrc, title) {
  modalImageSrc.value = imageSrc;
  modalImageTitle.value = title;
  showImageModal.value = true;
}

function closeImageModal() {
  showImageModal.value = false;
  modalImageSrc.value = '';
  modalImageTitle.value = '';
}
const permits = ref([]);
const permitImages = reactive({
  P1: null,
  P2: null,
  P3: null
});
// Track when user clears the current preview to re-enable dropzone
const permitCleared = reactive({ P1: false, P2: false, P3: false });
const permitUploading = reactive({
  P1: false,
  P2: false,
  P3: false
});
const P1PermitFileInput = ref(null);
const P2PermitFileInput = ref(null);
const P3PermitFileInput = ref(null);

// Computed properties
const submissionsByKey = computed(() => {
  const map = new Map();
  submissions.value.forEach(submission => {
    const key = `${submission.yearLevel}-${submission.semester}-${submission.examType}`;
    map.set(key, submission);
  });
  return map;
});

// Exam eligibility checker - P1 unlocks after completing sessions up to day 5, P2 after day 10, P3 after day 15
const examEligibility = computed(() => {
  const eligibility = {
    P1: false,
    P2: false,
    P3: false
  };

  if (!sessionData.value || sessionData.value.length === 0) {
    return eligibility;
  }

  // Filter sessions for the selected semester
  const semesterSessions = sessionData.value.filter(session => {
    if (selectedSemester.value === '1st') {
      return !session.semester || session.semester === '1st Semester';
    } else {
      return session.semester === '2nd Semester';
    }
  });

  // Count completed sessions before each exam checkpoint
  const completedSessions = semesterSessions.filter(s => s.completed);
  
  // P1 exam at day 5 - need to complete sessions 0-4 (5 sessions)
  const sessionsBeforeP1 = semesterSessions.filter(s => s.sessionDay < 5);
  const completedBeforeP1 = sessionsBeforeP1.filter(s => s.completed);
  eligibility.P1 = completedBeforeP1.length >= sessionsBeforeP1.length && sessionsBeforeP1.length > 0;
  
  // P2 exam at day 10 - need P1 requirement passed AND complete sessions 5-9
  const sessionsBeforeP2 = semesterSessions.filter(s => s.sessionDay < 10);
  const completedBeforeP2 = sessionsBeforeP2.filter(s => s.completed);
  const hasP1Submission = getSubmissionStatus(selectedSemester.value, 'P1') === 'approved';
  eligibility.P2 = eligibility.P1 && hasP1Submission && completedBeforeP2.length >= sessionsBeforeP2.length;
  
  // P3 exam at day 15 - need P2 requirement passed AND complete sessions 10-14  
  const sessionsBeforeP3 = semesterSessions.filter(s => s.sessionDay < 15);
  const completedBeforeP3 = sessionsBeforeP3.filter(s => s.completed);
  const hasP2Submission = getSubmissionStatus(selectedSemester.value, 'P2') === 'approved';
  eligibility.P3 = eligibility.P2 && hasP2Submission && completedBeforeP3.length >= sessionsBeforeP3.length;

  console.log('Exam eligibility:', eligibility, {
    semesterSessions: semesterSessions.length,
    completedSessions: completedSessions.length,
    hasP1Submission,
    hasP2Submission
  });

  return eligibility;
});

// Permit methods
async function loadPermits() {
  try {
    // Load current student's own permits (no adviser requirement)
    const response = await examPermitService.getMyPermits({
      semester: selectedSemester.value === '1st' ? '1st Semester' : '2nd Semester'
    });
    permits.value = response.permits || [];
  } catch (error) {
    console.error('Error loading permits:', error);
    // Silent fail; permits are supplementary to M&M UI
  }
}

async function uploadPermit() {
  if (!permitFile.value || !permitPeriod.value) {
    notificationService.showError('Please select a file and period');
    return;
  }
  
  try {
    permitUploading.value = true;
    
    const permitData = {
      file: permitFile.value,
      studentId: studentDetails.value._id,
      classId: studentDetails.value.class._id,
      semester: currentSemester.value
    };
    
    const result = await examPermitService.uploadPermit(permitData);
    
    if (result.success) {
      notificationService.showSuccess('Permit uploaded and processed successfully');
      await loadPermits();
      closePermitModal();
    } else {
      notificationService.showError(result.message || 'Failed to upload permit');
    }
  } catch (error) {
    console.error('Error uploading permit:', error);
    notificationService.showError('Failed to upload permit');
  } finally {
    permitUploading.value = false;
  }
}

function openPermitModal() {
  showPermitModal.value = true;
  permitFile.value = null;
  permitPeriod.value = '1';
}

function closePermitModal() {
  showPermitModal.value = false;
  permitFile.value = null;
  permitPeriod.value = '1';
}

function onPermitFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      notificationService.showError('Please select a valid image or PDF file');
      return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      notificationService.showError('File size must be less than 10MB');
      return;
    }
    
    permitFile.value = file;
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

// Permit helper methods
function getPermitImage(semester, examType) {
  // Prefer local preview if present
  if (permitImages[examType]) return permitImages[examType];

  // If user cleared the preview, force no image so dropzone shows
  if (permitCleared[examType]) return null;

  // Otherwise, try to load from existing submitted permit
  const period = examType.replace('P', '');
  const semesterText = semester === '1st' ? '1st Semester' : '2nd Semester';
  const permit = permits.value.find(p => p.period === period && p.semester === semesterText);

  if (permit && permit._id) {
    // Use backend attachment route to display the stored file
    // Note: PDFs will not preview as images; frontend will still show a placeholder when uploading PDFs
    return `${apiOrigin}/api/exam-permits/attachment/${permit._id}`;
  }

  return null;
}

// Return mimetype (to decide image vs pdf rendering)
function getPermitMimetype(semester, examType) {
  const period = examType.replace('P', '');
  const semesterText = semester === '1st' ? '1st Semester' : '2nd Semester';
  const permit = permits.value.find(p => p.period === period && p.semester === semesterText);
  return permit?.permitAttachment?.mimetype || null;
}

function getPermitStatus(semester, examType) {
  // Check if permit exists in permits array
  const period = examType.replace('P', ''); // Convert P1 to 1, P2 to 2, etc.
  const semesterText = semester === '1st' ? '1st Semester' : '2nd Semester';
  
  const permit = permits.value.find(p => 
    p.period === period && p.semester === semesterText
  );
  
  if (permit) {
    // If rejected: auto clear local preview and notify once
    if (permit.status === 'rejected') {
      permitImages[examType] = null;
      permitImages[`${examType}_file`] = null;
      if (!localStorage.getItem(`permitRejectedNotified_${semesterText}_${period}`)) {
        notificationService.showError(`Your ${examType} permit was rejected. Please re-upload a valid permit.`);
        localStorage.setItem(`permitRejectedNotified_${semesterText}_${period}`, 'true');
      }
    }
    return permit.status;
  }
  return null;
}

function getPermitStatusBadgeClass(status) {
  switch (status) {
    case 'validated':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Card highlight color per permit status
function getPermitCardClass(examType) {
  const status = getPermitStatus(selectedSemester.value, examType);
  if (status === 'pending') return 'border-yellow-300 bg-yellow-50';
  if (status === 'validated') return 'border-green-300 bg-green-50';
  if (status === 'rejected') return 'border-red-300 bg-red-50';
  return 'border-gray-200 hover:border-gray-300';
}

function handlePermitUploadClick(examType) {
  if (examType === 'P1' && P1PermitFileInput.value) {
    P1PermitFileInput.value.click();
  } else if (examType === 'P2' && P2PermitFileInput.value) {
    P2PermitFileInput.value.click();
  } else if (examType === 'P3' && P3PermitFileInput.value) {
    P3PermitFileInput.value.click();
  }
}

function handlePermitFileDrop(event, examType) {
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    handlePermitFileSelect(files[0], examType);
  }
}

function handlePermitFileSelect(file, examType) {
  if (!file) return;
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    notificationService.showError('Please select a valid image or PDF file');
    return;
  }
  
  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    notificationService.showError('File size must be less than 10MB');
    return;
  }
  
  // Create preview for images
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      permitImages[examType] = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    // For PDFs, show a placeholder
    permitImages[examType] = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkgxNlYyMEgyMFYyNEgxNlYyOEgxMlYyNEg4VjIwSDEyVjE2WiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K';
  }
  
  // Store the file for submission
  permitImages[`${examType}_file`] = file;
  permitCleared[examType] = false;
}

async function removePermitImage(examType) {
  try {
    // Determine current period and semester text
    const period = examType.replace('P', '');
    const semesterText = selectedSemester.value === '1st' ? '1st Semester' : '2nd Semester';

    // Check if there is an existing submitted permit for this slot
    const existing = permits.value.find(p => p.period === period && p.semester === semesterText);

    // If there is a submitted permit and it's not validated, delete it from the server
    if (existing && existing.status !== 'validated') {
      const result = await examPermitService.deletePermit(existing._id);
      if (result?.success) {
        notificationService.showSuccess(`${examType} permit submission removed`);
        await loadPermits();
      } else {
        notificationService.showError(result?.message || `Failed to remove ${examType} permit`);
      }
    }
  } catch (err) {
    console.error(`Error removing ${examType} permit submission:`, err);
    notificationService.showError(`Failed to remove ${examType} permit`);
  } finally {
    // Always clear local preview/file and show upload dropzone again
    permitImages[examType] = null;
    permitImages[`${examType}_file`] = null;
    permitCleared[examType] = true;
  }
}

// Function to remove a submitted permit
async function removeSubmittedPermit(examType) {
  try {
    const period = examType.replace('P', ''); // Convert P1 to 1, P2 to 2, etc.
    const semesterText = selectedSemester.value === '1st' ? '1st Semester' : '2nd Semester';
    
    // Find the permit to remove
    const permit = permits.value.find(p => 
      p.period === period && p.semester === semesterText
    );
    
    if (!permit) {
      notificationService.showError('Permit not found');
      return;
    }
    
    if (permit.status === 'validated') {
      notificationService.showError('Cannot remove a validated permit');
      return;
    }
    
    if (confirm(`Are you sure you want to remove your ${examType} permit submission?`)) {
      const result = await examPermitService.deletePermit(permit._id);
      
      if (result.success) {
        notificationService.showSuccess(`${examType} permit removed successfully`);
        // Refresh permits to show updated status
        await loadPermits();
      } else {
        notificationService.showError(result.message || `Failed to remove ${examType} permit`);
      }
    }
  } catch (error) {
    console.error(`Error removing ${examType} permit:`, error);
    notificationService.showError(`Failed to remove ${examType} permit`);
  }
}

async function submitPermit(examType) {
  const file = permitImages[`${examType}_file`];
  if (!file) {
    notificationService.showError('No file selected');
    return;
  }

  // Check if trying to submit for wrong semester
  if (selectedSemester.value !== currentSemester.value) {
    if (currentSemester.value === '1st') {
      notificationService.showError('2nd semester is locked. Your class has not been promoted to 2nd semester yet.');
    } else {
      notificationService.showError('1st semester is completed. Your class is now in 2nd semester.');
    }
    return;
  }

  // Check exam eligibility before allowing permit submission
  if (!examEligibility.value[examType]) {
    let message = '';
    if (examType === 'P1') {
      message = 'Complete sessions before P1 exam to unlock permit submission';
    } else if (examType === 'P2') {
      message = 'Complete P1 exam and sessions before P2 to unlock permit submission';
    } else if (examType === 'P3') {
      message = 'Complete P2 exam and sessions before P3 to unlock permit submission';
    }
    notificationService.showError(message);
    return;
  }

  try {
    permitUploading[examType] = true;
    errorMessage.value = '';
    
    const permitData = {
      file: file,
      period: examType.replace('P', ''), // Convert P1 to 1, P2 to 2, etc.
      semester: selectedSemester.value === '1st' ? '1st Semester' : '2nd Semester'
    };
    
    const result = await examPermitService.studentUploadPermit(permitData);
    
    if (result.success) {
      notificationService.showSuccess(`${examType} permit uploaded successfully and is pending validation`);
      removePermitImage(examType);
      // Refresh permits to show updated status
      await loadPermits();
    } else {
      notificationService.showError(result.message || `Failed to upload ${examType} permit`);
    }
  } catch (error) {
    console.error(`Error uploading ${examType} permit:`, error);
    const message = error?.message || error?.response?.data?.message || `Failed to upload ${examType} permit`;
    notificationService.showError(message);
  } finally {
    permitUploading[examType] = false;
  }
}

// Lifecycle
onMounted(async () => {
  await loadStudentYear();
  await loadCurrentSemester();
  await loadStudentSessionData();
  await loadSubmissions();
  await loadPermits();
  
  // Auto-refresh on focus disabled per requirement to prevent M&M section from refreshing
});

// Methods
async function loadStudentYear() {
  try {
    loadingYearLevel.value = true;
    
    // Always fetch fresh student data to get current year level
    const studentDetails = await studentService.getStudentDetails();
    if (studentDetails.data && studentDetails.data.class) {
      const classYearLevel = studentDetails.data.class.yearLevel;
      if (classYearLevel) {
        currentYearLevel.value = classYearLevel;
        console.log('Current year level from class:', currentYearLevel.value);
      }
    }
    
    // Also get from M&M service as fallback
    const response = await mmService.getStudentYear();
    if (response.yearLevel && !currentYearLevel.value) {
      currentYearLevel.value = response.yearLevel;
    }
    
    console.log('Final current year level:', currentYearLevel.value);
  } catch (error) {
    console.error('Error loading student year:', error);
    notificationService.showError('Failed to load student year level');
  } finally {
    loadingYearLevel.value = false;
  }
}

async function loadStudentSessionData() {
  try {
    console.log('Loading student session data for exam eligibility...');
    
    // Get student details first
    const details = await studentService.getStudentDetails();
    if (details.data) {
      studentDetails.value = details.data;
      
      // Get session completions for this student
      if (details.data._id && details.data.class?._id) {
        const response = await sessionService.getSessionsForStudent(
          details.data._id, 
          details.data.class._id
        );
        
        if (response && Array.isArray(response.data)) {
          sessionData.value = response.data;
          console.log(`Loaded ${sessionData.value.length} sessions for exam eligibility check`);
        }
      }
    }
  } catch (error) {
    console.error('Error loading student session data:', error);
  }
}

async function loadCurrentSemester() {
  try {
    console.log('Loading current semester for M&M submissions...')
    
    // Get student's current class semester based on session categorization (like Odyssey Plan)
    const response = await mmService.getCurrentClassSemester();
    console.log('M&M semester response:', response)
    
    if (response && response.semester) {
      currentSemester.value = response.semester;
      
      // Always default to showing the student's current class semester
      selectedSemester.value = response.semester;
      
      console.log('Current M&M class semester:', currentSemester.value);
      console.log('Class semester details:', {
        semester: response.semester,
        yearLevel: response.yearLevel,
        hasClass: response.hasClass,
        classId: response.classId,
        section: response.section
      });
      
      // Show success message if student was just promoted
      if (response.semester === '2nd' && !localStorage.getItem('shown2ndSemesterMessage')) {
        successMessage.value = `✅ You have been promoted to 2nd semester! You can now submit M&M for 2nd semester.`;
        localStorage.setItem('shown2ndSemesterMessage', 'true');
        setTimeout(() => { 
          successMessage.value = ''; 
        }, 5000);
      }
    } else {
      // Fallback if API fails
      console.warn('No semester response, defaulting to 1st semester')
      currentSemester.value = '1st';
      selectedSemester.value = '1st';
    }
  } catch (error) {
    console.error('Error loading current class semester:', error);
    // Default to 1st semester if can't determine
    currentSemester.value = '1st';
    selectedSemester.value = '1st';
  }
}

async function loadSubmissions() {
  try {
    console.log('Loading M&M submissions...');
    const response = await mmService.getMySubmissions();
    submissions.value = response.data || [];
    console.log('Loaded submissions:', submissions.value);
    
    // Log each submission's imageUrl to debug
    submissions.value.forEach(submission => {
      console.log(`Submission ${submission.examType} (${submission.semester}):`, {
        id: submission._id,
        imageUrl: submission.imageUrl,
        status: submission.status
      });
    });
  } catch (error) {
    console.error('Error loading submissions:', error);
    notificationService.showError('Failed to load submissions');
  }
}

function getYearNumber(yearLevel) {
  const match = /(\d+)/.exec(yearLevel);
  return match ? match[1] : '?';
}

function getYearLevelText(yearLevel) {
  return `${yearLevel} Year`;
}

function getTotalSubmissions() {
  return submissions.value.filter(s => s.yearLevel === currentYearLevel.value).length;
}

function getSemesterSubmissionCount(semester) {
  return submissions.value.filter(s => 
    s.yearLevel === currentYearLevel.value && s.semester === semester
  ).length;
}

function getSubmissionStatus(semester, examType) {
  const submission = submissionsByKey.value.get(`${currentYearLevel.value}-${semester}-${examType}`);
  return submission ? submission.status : null;
}

function getSubmissionImage(semester, examType) {
  // Check if there's a pending image first
  if (pendingImages[examType]) {
    console.log(`Using pending image for ${examType}:`, pendingImages[examType]);
    return pendingImages[examType];
  }
  
  // Check if there's a submitted image
  const submission = submissionsByKey.value.get(`${currentYearLevel.value}-${semester}-${examType}`);
  const imageUrl = submission ? submission.imageUrl : null;
  console.log(`Getting submission image for ${semester} ${examType}:`, {
    submission: submission,
    imageUrl: imageUrl,
    submissionsByKey: submissionsByKey.value
  });
  if (!imageUrl) return null;
  // Ensure absolute URL for backend-served uploads (e.g., /uploads/mm-submissions/...)
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const normalized = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${apiOrigin}${normalized}`;
}

function isSubmitted(semester, examType) {
  const submission = submissionsByKey.value.get(`${currentYearLevel.value}-${semester}-${examType}`);
  return !!submission;
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

function triggerFileInput(examType) {
  let input;
  if (examType === 'P1') {
    input = P1FileInput.value;
  } else if (examType === 'P2') {
    input = P2FileInput.value;
  } else if (examType === 'P3') {
    input = P3FileInput.value;
  }
  
  if (input) {
    input.click();
  } else {
    console.error(`File input not found for ${examType}`);
  }
}

function handleFileSelect(event, examType) {
  const file = event.target.files[0];
  if (file) {
    handleFile(file, examType);
  }
}

function handleFileDrop(event, examType) {
  // Check if trying to upload for wrong semester
  if (selectedSemester.value !== currentSemester.value) {
    if (currentSemester.value === '1st') {
      errorMessage.value = '2nd semester is locked. Your class has not been promoted to 2nd semester yet.';
    } else {
      errorMessage.value = '1st semester is completed. Your class is now in 2nd semester.';
    }
    setTimeout(() => { errorMessage.value = ''; }, 5000);
    return;
  }
  
  const file = event.dataTransfer.files[0];
  if (file) {
    handleFile(file, examType);
  }
}

function handleFile(file, examType) {
  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'File size must be less than 10MB';
    setTimeout(() => { errorMessage.value = ''; }, 5000);
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Only image files are allowed';
    setTimeout(() => { errorMessage.value = ''; }, 5000);
    return;
  }

  // Additional validation for M&M format
  validateMMImageFormat(file, examType);
}

function validateMMImageFormat(file, examType) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      // Basic dimension checks
      const minWidth = 100;
      const minHeight = 100;
      
      if (img.width < minWidth || img.height < minHeight) {
        errorMessage.value = 'Image invalid';
        setTimeout(() => { errorMessage.value = ''; }, 3000);
        return;
      }
      
      // Show loading message during analysis
      successMessage.value = `Analyzing ${examType} image...`;
      
      try {
        // Enhanced OCR with better preprocessing
        console.log('Starting enhanced OCR analysis...');
        
        // Create preprocessed image for better OCR
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw and enhance image for OCR
        ctx.drawImage(img, 0, 0);
        
        // Convert to grayscale and enhance contrast for better text detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          // Enhance contrast
          const enhanced = gray < 128 ? Math.max(0, gray - 20) : Math.min(255, gray + 20);
          data[i] = enhanced;     // Red
          data[i + 1] = enhanced; // Green  
          data[i + 2] = enhanced; // Blue
        }
        
        ctx.putImageData(imageData, 0, 0);
        const preprocessedImage = canvas.toDataURL();
        
        // Use Tesseract with enhanced settings
        const ocrResult = await Tesseract.recognize(preprocessedImage, 'eng', {
          logger: m => console.log('OCR:', m.status, m.progress),
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
          tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        });
        
        const detectedText = ocrResult.data.text.toLowerCase().replace(/[^a-z\s]/g, '');
        console.log('Enhanced OCR Text:', detectedText);
        
        // Improved text detection with multiple patterns
        const successPatterns = [
          'response successfully saved',
          'response success saved',
          'successfully saved',
          'response saved successfully',
          'saved successfully'
        ];
        
        const hasValidText = successPatterns.some(pattern => {
          const words = pattern.split(' ');
          return words.every(word => detectedText.includes(word));
        });
        
        console.log('Text validation result:', hasValidText);
        
        if (!hasValidText) {
          // Try alternative OCR approach with original image
          console.log('Trying alternative OCR approach...');
          const altOcrResult = await Tesseract.recognize(e.target.result, 'eng', {
            tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
          });
          
          const altText = altOcrResult.data.text.toLowerCase().replace(/[^a-z\s]/g, '');
          console.log('Alternative OCR Text:', altText);
          
          const altHasValidText = successPatterns.some(pattern => {
            const words = pattern.split(' ');
            return words.every(word => altText.includes(word));
          });
          
          if (!altHasValidText) {
            errorMessage.value = 'Image invalid';
            setTimeout(() => { errorMessage.value = ''; }, 3000);
            successMessage.value = '';
            return;
          }
        }
        
        // If text detected, create preview
        pendingImages[examType] = e.target.result;
        pendingImages[`${examType}_file`] = file;
        
        successMessage.value = `Image valid`;
        setTimeout(() => { successMessage.value = ''; }, 3000);
        
      } catch (ocrError) {
        console.error('OCR Error:', ocrError);
        errorMessage.value = 'Image invalid';
        setTimeout(() => { errorMessage.value = ''; }, 3000);
        successMessage.value = '';
      }
    };
    
    img.onerror = () => {
      errorMessage.value = 'Image invalid';
      setTimeout(() => { errorMessage.value = ''; }, 3000);
    };
    
    img.src = e.target.result;
  };
  
  reader.onerror = () => {
    errorMessage.value = 'Image invalid';
    setTimeout(() => { errorMessage.value = ''; }, 3000);
  };
  
  reader.readAsDataURL(file);
}

function removeImage(examType) {
  pendingImages[examType] = null;
  pendingImages[`${examType}_file`] = null;
}

async function submitExam(examType) {
  const file = pendingImages[`${examType}_file`];
  if (!file) {
    errorMessage.value = 'No file selected';
    return;
  }

  // Check if trying to submit for wrong semester
  if (selectedSemester.value !== currentSemester.value) {
    if (currentSemester.value === '1st') {
      errorMessage.value = '2nd semester is locked. Your class has not been promoted to 2nd semester yet.';
    } else {
      errorMessage.value = '1st semester is completed. Your class is now in 2nd semester.';
    }
    setTimeout(() => { errorMessage.value = ''; }, 5000);
    return;
  }

  try {
    uploading[examType] = true;
    errorMessage.value = '';
    
    const examData = {
      image: file,
      yearLevel: currentYearLevel.value,
      semester: selectedSemester.value,
      examType: examType
    };

    await mmService.submitExam(examData);
    
    // Clear pending image after successful upload
    pendingImages[examType] = null;
    pendingImages[`${examType}_file`] = null;
    
    // Reload submissions
    await loadSubmissions();
    
    successMessage.value = `${examType} response submitted successfully!`;
    setTimeout(() => { successMessage.value = ''; }, 5000);
    
  } catch (error) {
    console.error('Error submitting exam:', error);
    errorMessage.value = error.response?.data?.message || `Failed to submit ${examType} exam`;
    setTimeout(() => { errorMessage.value = ''; }, 5000);
  } finally {
    uploading[examType] = false;
  }
}

function handleSemesterTabClick(semester) {
  if (currentSemester.value === '1st' && semester === '2nd') {
    errorMessage.value = '2nd semester is locked. Your class has not been promoted to 2nd semester yet.';
    setTimeout(() => { errorMessage.value = ''; }, 5000);
    // Don't change the selected semester - keep it as 1st
    return;
  } else if (currentSemester.value === '2nd' && semester === '1st') {
    errorMessage.value = '1st semester is completed. Your class is now in 2nd semester.';
    setTimeout(() => { errorMessage.value = ''; }, 5000);
    // Don't change the selected semester - keep it as 2nd
    return;
  } else {
    selectedSemester.value = semester;
  }
}

function handleUploadClick(examType) {
  // Check if trying to upload for wrong semester
  if (selectedSemester.value !== currentSemester.value) {
    if (currentSemester.value === '1st') {
      errorMessage.value = '2nd semester is locked. Your class has not been promoted to 2nd semester yet.';
    } else {
      errorMessage.value = '1st semester is completed. Your class is now in 2nd semester.';
    }
    setTimeout(() => { errorMessage.value = ''; }, 5000);
    return;
  }
  
  // If current semester, proceed with file input trigger
  triggerFileInput(examType);
}
</script>

<style scoped>
.bg-primary {
  background-color: #3B82F6;
}
.text-primary {
  color: #3B82F6;
}
.border-primary {
  border-color: #3B82F6;
}
.bg-primary-light {
  background-color: #EFF6FF;
}
</style> 