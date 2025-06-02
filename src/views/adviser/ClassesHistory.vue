<template>
  <div>
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <div>
        <h2 class="text-xl font-medium">Classes History</h2>
          <p class="text-gray-600 mt-2">View archived session data separated by semesters for better organization</p>
        </div>
        <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          Archived Sessions
        </span>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="py-10 text-center">
        <div class="flex justify-center items-center">
          <svg class="animate-spin h-5 w-5 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading class history...</span>
        </div>
      </div>
      
      <!-- No classes state -->
      <div v-else-if="!classes || classes.length === 0" class="py-10 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 class="text-lg font-medium text-gray-800 mb-2">No Archived Classes Found</h3>
        <p class="text-gray-500 max-w-md mx-auto">
          You don't have any archived class history yet. Once you complete a semester for a class, the data will appear here.
        </p>
      </div>
      
      <!-- Class list -->
      <div v-else>
        <!-- Class selection -->
        <div class="mb-6">
          <label for="classSelector" class="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <div class="flex space-x-2">
            <select 
              id="classSelector" 
              v-model="selectedClassId" 
              class="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select a class to view history</option>
              <option v-for="cls in classes" :key="cls._id" :value="cls._id">
                {{ cls.yearLevel }} Year - {{ cls.section }} - {{ cls.major || 'Unknown Major' }}
              </option>
            </select>
            <button 
              @click="loadHistory" 
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-300 flex items-center"
              title="Refresh history data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- School Year Filter (only show when class is selected and has history) -->
        <div v-if="selectedClassId && availableSchoolYears.length > 0" class="mb-6">
          <label for="schoolYearSelector" class="block text-sm font-medium text-gray-700 mb-2">School Year</label>
          <select 
            id="schoolYearSelector" 
            v-model="selectedSchoolYear" 
            @change="loadHistory"
            class="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          >
            <option v-for="schoolYear in availableSchoolYears" :key="schoolYear" :value="schoolYear">
              {{ schoolYear }}
            </option>
          </select>
        </div>
        
        <!-- History card when no class is selected -->
        <div v-if="!selectedClassId" class="bg-blue-50 p-6 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-blue-800">Please select a class from the dropdown to view its semester history.</p>
        </div>
        
        <!-- History loading -->
        <div v-else-if="historyLoading" class="py-10 text-center">
          <div class="flex justify-center items-center">
            <svg class="animate-spin h-5 w-5 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading session history...</span>
          </div>
        </div>
        
        <!-- No history for selected class -->
        <div v-else-if="!sessionHistory || sessionHistory.length === 0" class="bg-gray-50 p-6 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-500">No session history found for this class. The class may not have completed any semesters yet.</p>
        </div>
        
        <!-- Class Information -->
        <div v-else>
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 class="text-lg font-medium text-gray-800 mb-2">{{ selectedClass.yearLevel }} Year - {{ selectedClass.section }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-white p-3 rounded-lg shadow-sm border">
                <p class="text-sm text-gray-500">Subject (1st Sem)</p>
                <p class="font-medium">{{ getFirstSemesterSubject() }}</p>
              </div>
              <div class="bg-white p-3 rounded-lg shadow-sm border">
                <p class="text-sm text-gray-500">Subject (2nd Sem)</p>
                <p class="font-medium">{{ getSecondSemesterSubject() }}</p>
              </div>
              <div class="bg-white p-3 rounded-lg shadow-sm border">
                <p class="text-sm text-gray-500">Major</p>
                <p class="font-medium">{{ selectedClass.major || selectedClass.program || 'General' }}</p>
              </div>
              <div class="bg-white p-3 rounded-lg shadow-sm border">
                <p class="text-sm text-gray-500">Room ({{ selectedSemester }})</p>
                <p class="font-medium">{{ getCurrentSemesterRoom() }}</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div class="bg-white p-3 rounded-lg shadow-sm border">
                <p class="text-sm text-gray-500">Total Students</p>
                <p class="font-medium">{{ getTotalStudentCount() }}</p>
              </div>
              <div class="bg-white p-3 rounded-lg shadow-sm border">
                <p class="text-sm text-gray-500">Schedule ({{ selectedSemester }})</p>
                <p class="font-medium">{{ getCurrentSemesterSchedule() }}</p>
              </div>
            </div>
          </div>
          
          <!-- Semester Tabs -->
          <div class="mb-6">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  @click="selectedSemester = '1st'"
                  class="py-2 px-1 border-b-2 font-medium text-sm"
                  :class="selectedSemester === '1st' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                >
                  1st Semester ({{ getFirstSemesterSubject() }})
                  <span class="ml-2 py-0.5 px-2 text-xs rounded-full"
                        :class="selectedSemester === '1st' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'">
                    {{ getFirstSemesterStudentCount() }}
                  </span>
                </button>
                <button
                  @click="selectedSemester = '2nd'"
                  class="py-2 px-1 border-b-2 font-medium text-sm"
                  :class="selectedSemester === '2nd' 
                    ? 'border-green-500 text-green-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                >
                  2nd Semester ({{ getSecondSemesterSubject() }})
                  <span class="ml-2 py-0.5 px-2 text-xs rounded-full"
                        :class="selectedSemester === '2nd' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-600'">
                    {{ getSecondSemesterStudentCount() }}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          <!-- Current Semester Content -->
          <div class="space-y-6">
            <!-- 1st Semester -->
            <div v-if="selectedSemester === '1st'">
              <div v-if="firstSemesterStudents.length === 0" class="bg-blue-50 p-6 rounded-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="text-lg font-medium text-blue-800 mb-2">No 1st Semester History Found</h3>
                <p class="text-blue-600">No archived 1st semester sessions found for this class.</p>
              </div>
              
              <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="bg-blue-50 px-6 py-4 border-b border-blue-200">
                  <div class="flex justify-between items-center">
                  <div>
                      <h3 class="text-lg font-semibold text-blue-900">1st Semester Session History</h3>
                      <p class="text-sm text-blue-700">
                        {{ firstSemesterStudents.length }} Students | 
                        {{ calculateSemesterCompletionRate(firstSemesterStudents) }}% Overall Completion Rate
                      </p>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span class="text-sm text-blue-700">{{ calculateSemesterCompletedSessions(firstSemesterStudents) }} Sessions Completed</span>
                    </div>
                  </div>
                </div>
                
                <div class="p-6">
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion %</th>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr 
                          v-for="student in firstSemesterStudents" 
                          :key="student.student.id"
                          class="hover:bg-gray-50"
                        >
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span class="text-xs font-medium text-blue-800">{{ getInitials(student.student.name) }}</span>
                              </div>
                              <div class="text-sm font-medium text-gray-900">{{ student.student.name }}</div>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-500">{{ student.student.idNumber }}</div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">
                              <span class="font-medium">{{ getCompletedSessionCount(student, '1st') }}</span><span class="text-gray-400">/{</span><span class="font-medium">{{ getSemesterSessionCount(student, '1st') }}</span>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span 
                              class="px-3 py-1 text-xs rounded-full font-medium"
                              :class="getCompletionBadgeClass(calculateSemesterCompletionPercentage(student, '1st'))"
                            >
                              {{ calculateSemesterCompletionPercentage(student, '1st') }}%
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span 
                              class="px-3 py-1 text-xs rounded-full font-medium"
                              :class="calculateSemesterCompletionPercentage(student, '1st') >= 90 ? 'bg-green-100 text-green-800' : calculateSemesterCompletionPercentage(student, '1st') >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'"
                            >
                              {{ getStatusText(calculateSemesterCompletionPercentage(student, '1st')) }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2nd Semester -->
            <div v-if="selectedSemester === '2nd'">
              <div v-if="secondSemesterStudents.length === 0" class="bg-green-50 p-6 rounded-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="text-lg font-medium text-green-800 mb-2">No 2nd Semester History Found</h3>
                <p class="text-green-600">No archived 2nd semester sessions found for this class.</p>
              </div>
              
              <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="bg-green-50 px-6 py-4 border-b border-green-200">
                  <div class="flex justify-between items-center">
                    <div>
                      <h3 class="text-lg font-semibold text-green-900">2nd Semester Session History</h3>
                      <p class="text-sm text-green-700">
                        {{ secondSemesterStudents.length }} Students | 
                        {{ calculateSemesterCompletionRate(secondSemesterStudents) }}% Overall Completion Rate
                      </p>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-3 h-3 rounded-full bg-green-500"></div>
                      <span class="text-sm text-green-700">{{ calculateSemesterCompletedSessions(secondSemesterStudents) }} Sessions Completed</span>
                    </div>
                      </div>
                    </div>
                    
                <div class="p-6">
                    <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion %</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                          <tr 
                          v-for="student in secondSemesterStudents" 
                            :key="student.student.id"
                            class="hover:bg-gray-50"
                          >
                            <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <span class="text-xs font-medium text-green-800">{{ getInitials(student.student.name) }}</span>
                              </div>
                              <div class="text-sm font-medium text-gray-900">{{ student.student.name }}</div>
                            </div>
                      </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="text-sm text-gray-500">{{ student.student.idNumber }}</div>
                      </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="text-sm text-gray-900">
                              <span class="font-medium">{{ getCompletedSessionCount(student, '2nd') }}</span><span class="text-gray-400">/{</span><span class="font-medium">{{ getSemesterSessionCount(student, '2nd') }}</span>
                              </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span 
                              class="px-3 py-1 text-xs rounded-full font-medium"
                          :class="getCompletionBadgeClass(calculateSemesterCompletionPercentage(student, '2nd'))"
                        >
                          {{ calculateSemesterCompletionPercentage(student, '2nd') }}%
                        </span>
                      </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <span 
                              class="px-3 py-1 text-xs rounded-full font-medium"
                              :class="calculateSemesterCompletionPercentage(student, '2nd') >= 90 ? 'bg-green-100 text-green-800' : calculateSemesterCompletionPercentage(student, '2nd') >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'"
                              >
                              {{ getStatusText(calculateSemesterCompletionPercentage(student, '2nd')) }}
                              </span>
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
const selectedClassId = ref('');
const selectedSchoolYear = ref('');
const availableSchoolYears = ref([]);
const sessionHistory = ref([]);
const expandedSemesters = ref({});
const expandedYearLevels = ref({});
const authStore = useAuthStore();
const selectedSemester = ref('1st');

// Watch for selected class changes
watch(selectedClassId, async (newId) => {
  if (newId) {
    await loadHistory();
  } else {
    sessionHistory.value = [];
  }
});

// Computed properties
const selectedClass = computed(() => {
  return classes.value.find(c => c._id === selectedClassId.value) || {};
});

const groupedSessionHistory = computed(() => {
  if (!sessionHistory.value || sessionHistory.value.length === 0) return [];
  
  // Group students by year level based on their session data
  const yearLevelMap = new Map();
  
  sessionHistory.value.forEach(student => {
    // Get unique year levels from the student's session history
    const yearLevels = new Set();
    
    student.sessions.forEach(session => {
      const yearLevel = session.class?.yearLevel || session.classDetails?.yearLevel || 'Unknown';
      yearLevels.add(yearLevel);
    });
    
    // For each year level, organize sessions by semester
    yearLevels.forEach(yearLevel => {
      if (!yearLevelMap.has(yearLevel)) {
        yearLevelMap.set(yearLevel, {
          yearLevel,
          semesters: []
        });
      }
      
      const yearGroup = yearLevelMap.get(yearLevel);
      
      // Group sessions by semester within this year level
      const sessionsBySemester = new Map();
      
      student.sessions
        .filter(session => {
          const sessionYearLevel = session.class?.yearLevel || session.classDetails?.yearLevel || 'Unknown';
          return sessionYearLevel === yearLevel;
        })
        .forEach(session => {
          const semester = session.semester || '1st Semester';
          
          if (!sessionsBySemester.has(semester)) {
            sessionsBySemester.set(semester, {
              id: `${yearLevel}_${semester}`,
              semester,
              class: session.class || session.classDetails || {},
              subject: session.subject || session.subjectDetails || {},
              students: []
            });
          }
          
          const semesterGroup = sessionsBySemester.get(semester);
          
          // Check if this student is already in the semester group
          let existingStudent = semesterGroup.students.find(s => s.student.id === student.student.id);
          
          if (!existingStudent) {
            existingStudent = {
              student: student.student,
              sessions: []
            };
            semesterGroup.students.push(existingStudent);
          }
          
          existingStudent.sessions.push(session);
        });
      
      // Add semester groups to year level
      sessionsBySemester.forEach(semesterGroup => {
        const existingSemester = yearGroup.semesters.find(s => s.semester === semesterGroup.semester);
        if (!existingSemester) {
          yearGroup.semesters.push(semesterGroup);
        }
      });
    });
  });
  
  // Convert map to array and sort
  const result = Array.from(yearLevelMap.values());
  
  // Sort year levels
  result.sort((a, b) => {
    const getYearNumber = (yearStr) => {
      const match = /(\d+)/.exec(yearStr);
      return match ? parseInt(match[1], 10) : 0;
    };
    return getYearNumber(a.yearLevel) - getYearNumber(b.yearLevel);
  });
  
  // Sort semesters within each year level
  result.forEach(yearGroup => {
    yearGroup.semesters.sort((a, b) => {
      if (a.semester.includes('1st') && b.semester.includes('2nd')) return -1;
      if (a.semester.includes('2nd') && b.semester.includes('1st')) return 1;
      return 0;
    });
  });
  
  return result;
});

const firstSemesterStudents = computed(() => {
  if (!sessionHistory.value || sessionHistory.value.length === 0) return [];
  
  const firstSemStudents = [];
  
  sessionHistory.value.forEach(student => {
    const firstSemSessions = student.sessions.filter(session => 
      session.semester === '1st Semester' || (!session.semester && session.title !== 'Completed')
    );
    
    if (firstSemSessions.length > 0) {
      firstSemStudents.push({
        student: student.student,
        sessions: firstSemSessions
      });
    }
  });
  
  return firstSemStudents;
});

const secondSemesterStudents = computed(() => {
  if (!sessionHistory.value || sessionHistory.value.length === 0) return [];
  
  const secondSemStudents = [];
  
  sessionHistory.value.forEach(student => {
    const secondSemSessions = student.sessions.filter(session => 
      session.semester === '2nd Semester'
    );
    
    if (secondSemSessions.length > 0) {
      secondSemStudents.push({
        student: student.student,
        sessions: secondSemSessions
      });
    }
  });
  
  return secondSemStudents;
});

// Lifecycle hooks
onMounted(async () => {
  await loadClasses();
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

async function loadHistory() {
  if (!selectedClassId.value) {
    sessionHistory.value = [];
    availableSchoolYears.value = [];
    return;
  }
  
  historyLoading.value = true;
  
  try {
    console.log(`Loading history for class ${selectedClassId.value}${selectedSchoolYear.value ? ` with school year ${selectedSchoolYear.value}` : ''}`);
    
    // Build query parameters
    const params = {};
    if (selectedSchoolYear.value) {
      params.schoolYear = selectedSchoolYear.value;
    }
    
    // Get session history with optional school year filter
    const response = await sessionService.getSessionHistory(selectedClassId.value, params);
    
    if (response && response.data) {
      console.log('History API response:', response.data);
      
      // Update available school years
      if (response.data.schoolYears && Array.isArray(response.data.schoolYears)) {
        availableSchoolYears.value = response.data.schoolYears;
        console.log('Available school years:', availableSchoolYears.value);
        
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
          console.log('Auto-selected most recent school year:', selectedSchoolYear.value);
        }
      }
      
      // Process the history data
      if (response.data.data && Array.isArray(response.data.data)) {
        sessionHistory.value = response.data.data;
        console.log(`Loaded ${response.data.data.length} history entries`);
      } else {
        console.warn('Unexpected response format:', response.data);
        sessionHistory.value = [];
      }
      
      // Process each student's sessions to normalize data
      sessionHistory.value = sessionHistory.value.map(student => {
        // Process each student's sessions to normalize data
        const processedSessions = (student.sessions || []).map(session => ({
          id: session.id || session._id,
          day: session.day || session.sessionDay || 0,
          title: session.title || session.sessionTitle || `Day ${session.day || session.sessionDay || 0}`,
          completed: !!session.completed,
          completionDate: session.completionDate || session.completedAt,
          semester: session.semester || '1st Semester',
          schoolYear: session.schoolYear || 'Unknown'
        }));
        
        return {
          student: {
            id: student.student?.id || student.id,
            name: student.student?.name || student.studentName || 'Unknown Student',
            idNumber: student.student?.idNumber || student.studentIdNumber || 'Unknown ID',
            schoolYear: student.student?.schoolYear || 'Unknown'
          },
          sessions: processedSessions
        };
      });
      
      // Log processed history for debugging
      console.log('Processed history:', sessionHistory.value);
    } else {
      console.warn('No history data returned from API');
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

function toggleSemester(yearIndex, semesterId) {
  expandedSemesters.value[`${yearIndex}_${semesterId}`] = !expandedSemesters.value[`${yearIndex}_${semesterId}`];
}

function getStudentsForSemester(semester) {
  return semester.students || [];
}

function getCompletedSessionCount(student, semester = null) {
  if (!student.sessions) return 0;
  
  if (semester) {
    // Get sessions for the specific semester
    const semesterSessions = student.sessions.filter(session => {
      if (semester === '1st') {
        return session.semester === '1st Semester' || (!session.semester && session.title !== 'Completed');
      } else {
        return session.semester === '2nd Semester';
      }
    });
    return semesterSessions.filter(session => session.completed).length;
  }
  
  return student.sessions.filter(session => session.completed).length;
}

function calculateSemesterCompletionPercentage(student, semester) {
  if (!student.sessions) return 0;
  
  // Get sessions for the specific semester
  const semesterSessions = student.sessions.filter(session => {
    if (semester === '1st') {
      return session.semester === '1st Semester' || (!session.semester && session.title !== 'Completed');
    } else {
      return session.semester === '2nd Semester';
    }
  });
  
  if (semesterSessions.length === 0) return 0;
  
  const completedCount = semesterSessions.filter(session => session.completed).length;
  return Math.round((completedCount / semesterSessions.length) * 100);
}

function getCompletionBadgeClass(percentage) {
  if (percentage >= 90) return 'bg-green-100 text-green-800';
  if (percentage >= 70) return 'bg-blue-100 text-blue-800';
  if (percentage >= 40) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

function getStatusText(percentage) {
  if (percentage >= 90) return 'Completed';
  if (percentage >= 70) return 'Partial';
  return 'Incomplete';
}

function getYearNumber(yearLevel) {
  const match = /(\d+)/.exec(yearLevel);
  return match ? match[1] : '?';
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  return parts.map(part => part.charAt(0).toUpperCase()).join('');
}

function toggleYearLevel(yearIndex) {
  expandedYearLevels.value[yearIndex] = !expandedYearLevels.value[yearIndex];
}

function getTotalStudentCount() {
  const allStudents = new Set();
  
  if (sessionHistory.value) {
    sessionHistory.value.forEach(student => {
      allStudents.add(student.student.id);
    });
  }
  
  return allStudents.size;
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

function countSemesterRecords(semesterType) {
  if (semesterType === '1st') {
    return firstSemesterStudents.value.length;
  } else if (semesterType === '2nd') {
    return secondSemesterStudents.value.length;
  }
  return 0;
}

function getFirstSemesterSubject() {
  if (selectedClass.value.firstSemester?.sspSubject?.sspCode) {
    return selectedClass.value.firstSemester.sspSubject.sspCode;
  } else if (selectedClass.value.sspSubject?.sspCode) {
    return selectedClass.value.sspSubject.sspCode;
  }
  return 'SSP';
}

function getSecondSemesterSubject() {
  if (selectedClass.value.secondSemester?.sspSubject?.sspCode) {
    return selectedClass.value.secondSemester.sspSubject.sspCode;
  } else if (selectedClass.value.sspSubject?.sspCode) {
    return selectedClass.value.sspSubject.sspCode;
  }
  return 'SSP';
}

function getCurrentSemesterRoom() {
  if (selectedSemester.value === '1st') {
    if (selectedClass.value.firstSemester?.room) {
      return selectedClass.value.firstSemester.room;
    }
  } else if (selectedSemester.value === '2nd') {
    if (selectedClass.value.secondSemester?.room) {
      return selectedClass.value.secondSemester.room;
    }
  }
  
  // Fallback to main class room
  return selectedClass.value.room || 'Not specified';
}

function getCurrentSemesterSchedule() {
  let daySchedule, timeSchedule;
  
  if (selectedSemester.value === '1st') {
    daySchedule = selectedClass.value.firstSemester?.daySchedule;
    timeSchedule = selectedClass.value.firstSemester?.timeSchedule;
  } else if (selectedSemester.value === '2nd') {
    daySchedule = selectedClass.value.secondSemester?.daySchedule;
    timeSchedule = selectedClass.value.secondSemester?.timeSchedule;
  }
  
  // Fallback to main class schedule
  if (!daySchedule) daySchedule = selectedClass.value.daySchedule;
  if (!timeSchedule) timeSchedule = selectedClass.value.timeSchedule;
  
  if (daySchedule && timeSchedule) {
    return `${daySchedule} ${timeSchedule}`;
  } else if (daySchedule) {
    return daySchedule;
  } else if (timeSchedule) {
    return timeSchedule;
  }
  
  return 'Not specified';
}

function getSemesterSessionCount(student, semester) {
  if (!student.sessions) return 0;
  
  const semesterFilter = semester === '1st' ? '1st Semester' : '2nd Semester';
  return student.sessions.filter(session => {
    // Handle both new format with explicit semester and legacy format
    if (semester === '1st') {
      return session.semester === '1st Semester' || (!session.semester && session.title !== 'Completed');
    } else {
      return session.semester === '2nd Semester';
    }
  }).length;
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
  font-size: 0.65rem;
  line-height: 0.8rem;
}
</style> 