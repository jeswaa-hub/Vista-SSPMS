<template>
  <div class="min-h-screen p-6" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-8">

    <!-- M&M Submission Filters -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-800">M&M Submissions</h3>
        <button
          @click="refreshData"
          class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="Refresh Data"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
    </div>


      <div class="flex items-center space-x-3">
        <!-- School Year Filter -->
        <div class="w-48">
          <label for="schoolYearFilter" class="block text-sm font-medium text-gray-700 mb-2">School Year</label>
          <select 
            id="schoolYearFilter" 
            v-model="selectedSchoolYear" 
            @change="applyFilters"
            class="block w-full p-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          >
            <option value="">All School Years</option>
            <option v-for="year in availableSchoolYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        
        <!-- Year Level Filter -->
        <div class="w-48">
          <label for="yearLevelFilter" class="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
          <select 
            id="yearLevelFilter" 
            v-model="selectedYearLevel" 
            @change="applyFilters"
            class="block w-full p-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          >
            <option value="">All Year Levels</option>
            <option value="2nd">2nd Year</option>
            <option value="3rd">3rd Year</option>
            <option value="4th">4th Year</option>
          </select>
        </div>
        
        <!-- Section Filter -->
        <div class="w-48">
          <label for="sectionFilter" class="block text-sm font-medium text-gray-700 mb-2">Section</label>
        <select 
            id="sectionFilter" 
            v-model="selectedSection" 
            @change="applyFilters"
            class="block w-full p-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          >
            <option value="">All Sections</option>
            <option v-for="section in availableSections" :key="section" :value="section">
              {{ section }}
          </option>
        </select>
        </div>
        
        <!-- Major Filter (hidden for 2nd year) -->
        <div v-if="selectedYearLevel !== '2nd'" class="w-48">
          <label for="majorFilter" class="block text-sm font-medium text-gray-700 mb-2">Major</label>
          <select 
            id="majorFilter" 
            v-model="selectedMajor" 
            @change="applyFilters"
            class="block w-full p-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          >
            <option value="">All Majors</option>
            <option v-for="major in availableMajors" :key="major" :value="major">
              {{ major }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        <span class="ml-3 text-gray-600">Loading M&M submissions...</span>
      </div>
    </div>

    <!-- M&M Submissions Data -->
    <div v-else class="space-y-8">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <div class="text-2xl font-semibold text-gray-800">{{ totalStudents }}</div>
          <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Total Students</div>
        </div>
        
        <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <div class="text-2xl font-semibold text-gray-500">{{ completedStudents }}</div>
          <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Complete</div>
        </div>
        
        <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <div class="text-2xl font-semibold ttext-gray-500">{{ incompleteStudents }}</div>
          <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Incomplete</div>
        </div>
        
        <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <div class="text-2xl font-semibold text-gray-500">{{ completionRate }}%</div>
          <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Completion Rate</div>
        </div>
      </div>

      <!-- M&M Submissions Section -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <h3 class="text-lg font-medium text-gray-800 mb-6">M&M Submission Status</h3>
        
        <!-- Semester Tabs -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              v-for="semester in ['1st', '2nd']"
              :key="semester"
              @click="activeSemester = semester"
              :class="[
                activeSemester === semester
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              {{ semester }} Semester
            </button>
          </nav>
        </div>

        <!-- Class-Based Groups -->
        <div class="mt-6">
          <div v-if="groupedClassView.length === 0" class="text-center py-12">
            <div class="bg-gray-50 rounded-lg p-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <h3 class="mt-4 text-sm font-medium text-gray-900">No students found</h3>
              <p class="mt-2 text-sm text-gray-500">
                No students match the current filters for {{ activeSemester }} semester
              </p>
            </div>
          </div>
          
          <!-- Class Groups -->
          <div v-else class="space-y-6">
            <div 
              v-for="classGroup in sortedClassGroups" 
              :key="classGroup.key" 
              class="border border-gray-200 rounded-lg overflow-hidden"
            >
              <!-- Class Header -->
              <div class="bg-[#166534] px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-lg font-medium text-white">
                      {{ classGroup.yearLevel }} Year - Section {{ classGroup.section }}
                      <span v-if="classGroup.major !== 'General'" class="text-white">
                        ({{ classGroup.major }})
                      </span>
                    </h4>
                    <p class="text-sm text-white mt-1">
                      School Year: {{ classGroup.schoolYear }} • {{ activeSemester }} Semester
                    </p>
                  </div>
                  
                  <!-- Class Summary Stats -->
                  <div class="flex items-center space-x-6">
                    <div class="text-center">
                      <div class="text-sm font-medium text-white">Total</div>
                      <div class="text-lg font-semibold text-white">{{ classGroup.students.length }}</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm font-medium text-white">Complete</div>
                      <div class="text-lg font-semibold text-white">
                        {{ getClassCompletedCount(classGroup) }}
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm font-medium text-white">Rate</div>
                      <div class="text-lg font-semibold text-white">
                        {{ getClassCompletionRate(classGroup) }}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Students Table for this Class -->
              <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P1 Exam
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P2 Exam
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P3 Exam
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="student in classGroup.students" :key="student.id" class="hover:bg-gray-50">
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
                  
                  <!-- P1 Exam -->
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span v-if="getSubmissionStatus(student, 'P1')" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Submitted
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ✗ Missing
                    </span>
                  </td>
                  
                  <!-- P2 Exam -->
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span v-if="getSubmissionStatus(student, 'P2')" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Submitted
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ✗ Missing
                    </span>
                  </td>
                  
                  <!-- P3 Exam -->
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span v-if="getSubmissionStatus(student, 'P3')" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Submitted
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ✗ Missing
                    </span>
                  </td>
                  
                  <!-- Overall Status -->
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span v-if="isStudentComplete(student)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Complete
                    </span>
                        <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Incomplete ({{ getMissingCount(student) }}/3 missing)
                    </span>
                  </td>
                  
                  <!-- Actions -->
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      @click="viewSubmissions(student)"
                          class="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      View Details
                    </button>
                    <button
                      v-if="!isStudentComplete(student)"
                      @click="sendReminder(student)"
                          class="text-red-600 hover:text-red-800"
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
      </div>

    </div>

    <!-- Submission Details Modal -->
    <teleport to="body">
      <div v-if="showSubmissionModal" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="closeSubmissionModal">
        <div class="w-11/12 max-w-5xl bg-white rounded-2xl shadow-2xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-800">M&M Submissions - {{ selectedStudent?.name }}</h3>
          <button @click="closeSubmissionModal" class="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div v-if="selectedStudent">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="examType in ['P1', 'P2', 'P3']" :key="examType" class="border border-gray-200 rounded-lg overflow-hidden">
              <div class="px-4 py-3 border-b bg-gray-50">
                <h4 class="font-medium text-gray-800">{{ examType }} Exam</h4>
              </div>
              <div v-if="getSubmissionForExam(selectedStudent, examType)" class="p-4">
                <img
                  :src="getSubmissionForExam(selectedStudent, examType).imageUrl"
                  :alt="`${examType} Submission`"
                  class="w-full h-56 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                  @click="() => window.open(getSubmissionForExam(selectedStudent, examType).imageUrl, '_blank')"
                >
              </div>
              <div v-else class="p-4 text-gray-500 text-sm">✗ Not submitted</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { adviserService } from '../../services/adviserService'
import { mmService } from '../../services/midtermFinalsService'
import { notificationService } from '../../services/notificationService'
import api from '../../services/api'

// Reactive data
const loading = ref(false)
const classes = ref([])
const classById = ref({})
const allStudents = ref([])
const activeSemester = ref('1st')
const selectedStudent = ref(null)
const showSubmissionModal = ref(false)
const submissions = ref([])

// Filter state
const selectedSchoolYear = ref('')
const selectedYearLevel = ref('')
const availableSchoolYears = ref([])
// New: Section/Major filter state
const selectedSection = ref('')
const selectedMajor = ref('')
const availableSections = ref([])
const availableMajors = ref([])

// Sorting state
const sortBy = ref('yearLevel')
const sortOrder = ref('asc')
// Helpers
const getClassIdKey = (cid) => {
  if (!cid) return null
  if (typeof cid === 'string') return cid
  if (typeof cid === 'object') {
    if (cid._id) return cid._id
    if (cid.toString) return cid.toString()
  }
  return String(cid)
}

// Returns unified class metadata from a submission: prefers populated sub.class, falls back to classById map
const getSubmissionClassMeta = (sub) => {
  if (!sub) return null
  // If populated class object exists use it directly
  if (sub.class && typeof sub.class === 'object') {
    return {
      section: sub.class.section,
      major: sub.class.major,
      yearLevel: sub.class.yearLevel,
      schoolYear: sub.schoolYear || sub.class.schoolYear
    }
  }
  // Fallback: use classId map
  const key = getClassIdKey(sub.classId)
  const meta = key ? classById.value[key] : null
  if (meta) return meta
  return null
}

// Normalize a student entity (could be ObjectId string or populated object)
const getStudentIdKey = (s) => {
  if (!s) return null
  if (typeof s === 'string') return s
  if (typeof s === 'object') {
    if (s._id) return s._id
    if (s.id) return s.id
    if (s.toString) return s.toString()
  }
  return String(s)
}



// Computed properties based on grouped class view
const totalStudents = computed(() => {
  return groupedClassView.value.reduce((total, classGroup) => {
    return total + (classGroup.students?.length || 0)
  }, 0)
})

const completedStudents = computed(() => {
  return groupedClassView.value.reduce((total, classGroup) => {
    return total + getClassCompletedCount(classGroup)
  }, 0)
})

const incompleteStudents = computed(() => {
  return totalStudents.value - completedStudents.value
})

const completionRate = computed(() => {
  if (totalStudents.value === 0) return 0
  return Math.round((completedStudents.value / totalStudents.value) * 100)
})

// Filtered submissions based on current filters
const filteredSubmissions = computed(() => {
  let filtered = submissions.value
  
  // Filter by school year (strictly from populated class.schoolYear)
  if (selectedSchoolYear.value && selectedSchoolYear.value !== '') {
    filtered = filtered.filter(sub => (sub.class && sub.class.schoolYear) === selectedSchoolYear.value)
  }
  
  // Filter by year level
  if (selectedYearLevel.value && selectedYearLevel.value !== '') {
    filtered = filtered.filter(sub => sub.yearLevel === selectedYearLevel.value)
  }

  // Filter by section (via classId → class metadata)
  if (selectedSection.value && selectedSection.value !== '') {
    filtered = filtered.filter(sub => {
      const meta = getSubmissionClassMeta(sub)
      return meta && meta.section === selectedSection.value
    })
  }

  // Filter by major (skip for 2nd year)
  if (selectedMajor.value && selectedMajor.value !== '' && selectedYearLevel.value !== '2nd') {
    filtered = filtered.filter(sub => {
      const meta = getSubmissionClassMeta(sub)
      return meta && meta.major === selectedMajor.value
    })
  }
  
  return filtered
})

// Group filtered submissions by class for the active semester
const groupedClassView = computed(() => {
  const subs = filteredSubmissions.value.filter(sub => sub.semester === activeSemester.value)
  if (!subs || subs.length === 0) return []

  const groupMap = new Map()

  for (const sub of subs) {
    const meta = getSubmissionClassMeta(sub) || {}
    const classId = getClassIdKey(sub.class?._id || sub.classId)
    const key = classId || `${meta.yearLevel || 'Unknown'}-${meta.section || 'Unknown'}-${meta.major || 'General'}-${(sub.class && sub.class.schoolYear) || 'Unknown'}`

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        classId,
        yearLevel: meta.yearLevel || sub.yearLevel || 'Unknown',
        section: meta.section || 'Unknown',
        major: meta.major || 'General',
        schoolYear: (sub.class && sub.class.schoolYear) || 'Unknown',
        students: new Map()
      })
    }

    const group = groupMap.get(key)
    const sid = getStudentIdKey(sub.student)
    if (!group.students.has(sid)) {
      const cached = allStudents.value.find(s => getStudentIdKey(s) === sid)
      const name = cached && cached.user ? `${cached.user.firstName || 'Unknown'} ${cached.user.lastName || ''}`.trim() : 'Unknown'
      const idNumber = cached && cached.user ? cached.user.idNumber || 'Unknown' : 'Unknown'
      group.students.set(sid, { id: sid, name, idNumber, submissions: [] })
    }
    group.students.get(sid).submissions.push(sub)
  }

  return Array.from(groupMap.values()).map(g => ({ ...g, students: Array.from(g.students.values()) }))
})

const currentSemesterStudents = computed(() => {
  if (!allStudents.value || allStudents.value.length === 0) return []

  // Only include students that have submissions matching the current filters and active semester
  const hasActiveFilters = !!(selectedSchoolYear.value || selectedYearLevel.value || selectedSection.value || selectedMajor.value)

  return allStudents.value
    .map(student => {
      const sid = getStudentIdKey(student)
      const studentSubmissions = filteredSubmissions.value.filter(sub => 
        getStudentIdKey(sub.student) === sid && sub.semester === activeSemester.value
    )
    
    return {
      id: student._id,
      name: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
      idNumber: student.user ? student.user.idNumber : 'Unknown',
      submissions: studentSubmissions
    }
  })
    .filter(student => {
      // If any filter is applied, require at least one matching submission
      return hasActiveFilters ? (student.submissions && student.submissions.length > 0) : true
    })
})

// Methods
const getInitials = (name) => {
  return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase()
}

const getSubmissionStatus = (student, examType) => {
  return student.submissions.some(sub => sub.examType === examType)
}

const getSubmissionForExam = (student, examType) => {
  return student.submissions.find(sub => sub.examType === examType)
}

const isStudentComplete = (student) => {
  const requiredExams = ['P1', 'P2', 'P3']
  return requiredExams.every(exam => getSubmissionStatus(student, exam))
}

const getMissingCount = (student) => {
  const requiredExams = ['P1', 'P2', 'P3']
  return requiredExams.filter(exam => !getSubmissionStatus(student, exam)).length
}

// Class-based helper methods
const getClassCompletedCount = (classGroup) => {
  if (!classGroup.students) return 0
  return classGroup.students.filter(student => isStudentComplete(student)).length
}

const getClassCompletionRate = (classGroup) => {
  if (!classGroup.students || classGroup.students.length === 0) return 0
  const completed = getClassCompletedCount(classGroup)
  return Math.round((completed / classGroup.students.length) * 100)
}

const clearFilters = () => {
  selectedSchoolYear.value = ''
  selectedYearLevel.value = ''
  selectedSection.value = ''
  selectedMajor.value = ''
  
  // Auto-select latest school year if available
  if (availableSchoolYears.value.length > 0) {
    selectedSchoolYear.value = availableSchoolYears.value[availableSchoolYears.value.length - 1]
  }
}

// Enhanced filter helper methods
const hasActiveFilters = computed(() => {
  return !!(selectedSchoolYear.value || selectedYearLevel.value || selectedSection.value || selectedMajor.value)
})

// Sorting functionality
const sortedClassGroups = computed(() => {
  const groups = [...groupedClassView.value]
  
  return groups.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy.value) {
      case 'yearLevel':
        aValue = parseInt(a.yearLevel.replace(/\D/g, '')) || 0
        bValue = parseInt(b.yearLevel.replace(/\D/g, '')) || 0
        break
      case 'section':
        aValue = a.section || ''
        bValue = b.section || ''
        break
      case 'completionRate':
        aValue = getClassCompletionRate(a)
        bValue = getClassCompletionRate(b)
        break
      case 'totalStudents':
        aValue = a.students?.length || 0
        bValue = b.students?.length || 0
        break
      default:
        aValue = a.yearLevel || ''
        bValue = b.yearLevel || ''
    }
    
    let result = 0
    if (typeof aValue === 'string') {
      result = aValue.localeCompare(bValue)
    } else {
      result = aValue - bValue
    }
    
    return sortOrder.value === 'desc' ? -result : result
  })
})

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const applySorting = () => {
  // Sorting is reactive through computed property
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Load submissions and filter options from consolidated backend endpoint
const loadAdviserMMData = async () => {
  try {
    loading.value = true
    const response = await api.get('/mm-submissions/adviser/my')
    const data = response?.data || {}
    const subs = Array.isArray(data.submissions) ? data.submissions : []

    // Set submissions directly (already populated with class)
    submissions.value = subs
    console.log('MM Page - Loaded submissions (consolidated endpoint):', submissions.value.length)

    // Build students list from submissions (unique)
    const studentsMap = new Map()
    for (const s of subs) {
      const sid = getStudentIdKey(s.student)
      if (!sid) continue
      if (!studentsMap.has(sid)) {
        // Normalize to { _id, user: { firstName, lastName, idNumber } }
        let studentObj = s.student
        let normalized = null
        if (studentObj && typeof studentObj === 'object') {
          const user = studentObj.user || {}
          normalized = { _id: studentObj._id || sid, user: { firstName: user.firstName, lastName: user.lastName, idNumber: user.idNumber } }
        } else {
          normalized = { _id: sid, user: { firstName: 'Unknown', lastName: '', idNumber: '' } }
        }
        studentsMap.set(sid, normalized)
      }
    }
    allStudents.value = Array.from(studentsMap.values())

    // Filter options from backend; override schoolYears to derive from class.schoolYear strictly
    const fo = data.filterOptions || {}
    const derivedYears = new Set()
    subs.forEach(s => { if (s.class && s.class.schoolYear) derivedYears.add(s.class.schoolYear) })
    availableSchoolYears.value = Array.from(derivedYears).sort()
    availableSections.value = Array.isArray(fo.sections) ? fo.sections : []
    availableMajors.value = Array.isArray(fo.majors) ? fo.majors : []

    // Auto-select latest school year if none selected
    if (availableSchoolYears.value.length > 0 && !selectedSchoolYear.value) {
      selectedSchoolYear.value = availableSchoolYears.value[availableSchoolYears.value.length - 1]
    }
  } catch (error) {
    console.error('Error loading adviser M&M data:', error)
    notificationService.showError('Failed to load M&M data')
  } finally {
    loading.value = false
  }
}

// Deprecated: per-student loader replaced by consolidated endpoint
const loadSubmissions = async () => {
  await loadAdviserMMData()
}

// onClassChange removed; view is driven by filters now

// Apply filters (reactive - no need to reload data)
const applyFilters = () => {
  // Filters are applied reactively through computed properties
  console.log('Filters applied:', {
    schoolYear: selectedSchoolYear.value,
    yearLevel: selectedYearLevel.value,
    section: selectedSection.value,
    major: selectedMajor.value
  })
}

const refreshData = async () => {
  await loadAdviserMMData()
}

const viewSubmissions = (student) => {
  selectedStudent.value = student
  showSubmissionModal.value = true
}

const closeSubmissionModal = () => {
  selectedStudent.value = null
  showSubmissionModal.value = false
}

const sendReminder = async (student) => {
  try {
    const missingExams = ['P1', 'P2', 'P3'].filter(exam => !getSubmissionStatus(student, exam))
    const message = `M&M Submission Reminder: You need to complete your M&M submissions for ${activeSemester.value} semester. Missing exams: ${missingExams.join(', ')}. Please upload your exam images as soon as possible.`
    
    // Find student's user ID from the allStudents array
    const studentRecord = allStudents.value.find(s => s._id === student.id || s._id === student._id)
    if (studentRecord && studentRecord.user) {
      await api.post('/notifications/create', {
        userId: studentRecord.user._id || studentRecord.user.id,
        title: `M&M Submission Required - ${activeSemester.value} Semester`,
        message: message,
        type: 'warning',
        link: '/student/surveys'
      })
      
      notificationService.showSuccess(`Reminder sent to ${student.name}`)
    } else {
      // Alternative: try to find by submission data
      const studentSubmission = submissions.value.find(sub => 
        getStudentIdKey(sub.student) === student.id && 
        sub.student && 
        typeof sub.student === 'object' && 
        sub.student.user
      )
      
      if (studentSubmission && studentSubmission.student.user) {
        await api.post('/notifications/create', {
          userId: studentSubmission.student.user._id || studentSubmission.student.user.id,
        title: `M&M Submission Required - ${activeSemester.value} Semester`,
        message: message,
        type: 'warning',
        link: '/student/surveys'
      })
      
      notificationService.showSuccess(`Reminder sent to ${student.name}`)
    } else {
      notificationService.showError('Could not find student user ID')
      }
    }
  } catch (error) {
    console.error('Error sending reminder:', error)
    notificationService.showError('Failed to send reminder')
  }
}



// Watchers
watch(activeSemester, () => {
  // Refresh data when semester changes
    loadSubmissions()
})

// Lifecycle
onMounted(async () => {
  await loadAdviserMMData()
})
</script>

<style scoped>
/* Minimal styling - following Dashboard.vue approach */
</style> 