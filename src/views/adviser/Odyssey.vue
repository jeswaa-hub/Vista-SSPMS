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

      <!-- Semester Tabs -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="semester in ['1st', '2nd']"
              :key="semester"
              @click="activeSemester = semester"
              :class="[
                activeSemester === semester
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              {{ semester }} Semester
            </button>
          </nav>
        </div>

        <!-- Students Table -->
        <div class="p-6">
          <div v-if="currentSemesterStudents.length === 0" class="text-center py-8">
            <p class="text-gray-500">No students found for {{ activeSemester }} semester</p>
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
                    Odyssey Plan Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission Date
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in currentSemesterStudents" :key="student.id" class="hover:bg-gray-50">
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
                    <span v-if="hasOdysseyPlan(student)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      Submitted
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      Not Submitted
                    </span>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    <span v-if="hasOdysseyPlan(student)">
                      {{ formatDate(getOdysseyPlan(student).submittedAt) }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      v-if="hasOdysseyPlan(student)"
                      @click="viewPlan(student)"
                      class="text-purple-600 hover:text-purple-900 mr-3"
                    >
                      View Plan
                    </button>
                    <button
                      v-if="!hasOdysseyPlan(student)"
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

    <!-- Plan Details Modal -->
    <div v-if="showPlanModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closePlanModal">
      <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            Odyssey Plan - {{ selectedStudent?.name }}
          </h3>
          <button @click="closePlanModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="selectedPlan" class="space-y-6">
          <!-- Plan Details -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="font-medium">Year Level:</span> {{ selectedPlan.year }}
              </div>
              <div>
                <span class="font-medium">Semester:</span> {{ selectedPlan.semester }}
              </div>
              <div>
                <span class="font-medium">Status:</span> 
                <span :class="getStatusClass(selectedPlan.status)">{{ selectedPlan.status }}</span>
              </div>
            </div>
          </div>
          
          <!-- Goals Sections -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Academic Goals -->
            <div class="space-y-4">
              <h4 class="font-medium text-gray-900">Academic Goals</h4>
              <div v-if="selectedPlan.academicGoals && selectedPlan.academicGoals.length > 0" class="space-y-3">
                <div v-for="(goal, index) in selectedPlan.academicGoals" :key="index" class="border rounded-lg p-3">
                  <p class="text-sm font-medium text-gray-900 mb-2">{{ goal.description }}</p>
                  <div v-if="goal.steps && goal.steps.length > 0" class="space-y-1">
                    <p class="text-xs text-gray-500 mb-1">Steps:</p>
                    <ul class="list-disc list-inside text-xs text-gray-600 space-y-1">
                      <li v-for="(step, stepIndex) in goal.steps" :key="stepIndex">
                        {{ step.description }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-500">No academic goals specified</div>
            </div>
            
            <!-- Personal Goals -->
            <div class="space-y-4">
              <h4 class="font-medium text-gray-900">Personal Goals</h4>
              <div v-if="selectedPlan.personalGoals && selectedPlan.personalGoals.length > 0" class="space-y-3">
                <div v-for="(goal, index) in selectedPlan.personalGoals" :key="index" class="border rounded-lg p-3">
                  <p class="text-sm font-medium text-gray-900 mb-2">{{ goal.description }}</p>
                  <div v-if="goal.steps && goal.steps.length > 0" class="space-y-1">
                    <p class="text-xs text-gray-500 mb-1">Steps:</p>
                    <ul class="list-disc list-inside text-xs text-gray-600 space-y-1">
                      <li v-for="(step, stepIndex) in goal.steps" :key="stepIndex">
                        {{ step.description }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-500">No personal goals specified</div>
            </div>
            
            <!-- Financial Goals -->
            <div class="space-y-4">
              <h4 class="font-medium text-gray-900">Financial Goals</h4>
              <div v-if="selectedPlan.financialGoals && selectedPlan.financialGoals.length > 0" class="space-y-3">
                <div v-for="(goal, index) in selectedPlan.financialGoals" :key="index" class="border rounded-lg p-3">
                  <p class="text-sm font-medium text-gray-900 mb-2">{{ goal.description }}</p>
                  <div v-if="goal.steps && goal.steps.length > 0" class="space-y-1">
                    <p class="text-xs text-gray-500 mb-1">Steps:</p>
                    <ul class="list-disc list-inside text-xs text-gray-600 space-y-1">
                      <li v-for="(step, stepIndex) in goal.steps" :key="stepIndex">
                        {{ step.description }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-500">No financial goals specified</div>
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
const activeSemester = ref('1st')
const showPlanModal = ref(false)
const selectedStudent = ref(null)
const selectedPlan = ref(null)

// Computed properties
const totalStudents = computed(() => {
  return currentSemesterStudents.value.length
})

const completedStudents = computed(() => {
  return currentSemesterStudents.value.filter(student => hasOdysseyPlan(student)).length
})

const incompleteStudents = computed(() => {
  return totalStudents.value - completedStudents.value
})

const completionRate = computed(() => {
  if (totalStudents.value === 0) return 0
  return Math.round((completedStudents.value / totalStudents.value) * 100)
})

const currentSemesterStudents = computed(() => {
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

// Methods
const getInitials = (name) => {
  return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase()
}

const getStudentYearLevel = (student) => {
  return student.yearLevel || selectedClass.value?.yearLevel || 'Unknown'
}

const hasOdysseyPlan = (student) => {
  const yearNum = extractYearNumber(getStudentYearLevel(student))
  const semesterNum = activeSemester.value === '1st' ? 1 : 2
  
  return odysseyPlans.value.some(plan => 
    plan.student === student.id && 
    plan.year === yearNum && 
    plan.semester === semesterNum
  )
}

const getOdysseyPlan = (student) => {
  const yearNum = extractYearNumber(getStudentYearLevel(student))
  const semesterNum = activeSemester.value === '1st' ? 1 : 2
  
  return odysseyPlans.value.find(plan => 
    plan.student === student.id && 
    plan.year === yearNum && 
    plan.semester === semesterNum
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
  selectedPlan.value = getOdysseyPlan(student)
  showPlanModal.value = true
}

const closePlanModal = () => {
  showPlanModal.value = false
  selectedStudent.value = null
  selectedPlan.value = null
}

const sendReminder = async (student) => {
  try {
    const yearNum = extractYearNumber(getStudentYearLevel(student))
    const semesterText = activeSemester.value === '1st' ? '1st Semester' : '2nd Semester'
    
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

// Watchers
watch(activeSemester, () => {
  // Data will automatically update since computed properties depend on activeSemester
})

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