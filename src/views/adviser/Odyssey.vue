<template>
  <div class="min-h-screen p-6" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-8">
    <!-- Filters Section -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-800">Odyssey Plans</h3>
        <button @click="refreshData" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Refresh Data">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <div class="flex items-center space-x-3">
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-2">School Year</label>
          <select v-model="selectedSchoolYear" class="block w-full p-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:border-transparent">
            <option value="">All School Years</option>
            <option v-for="y in availableSchoolYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
          <select v-model="selectedYearLevel" class="block w-full p-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:border-transparent">
            <option value="">All Year Levels</option>
            <option value="2nd">2nd Year</option>
            <option value="3rd">3rd Year</option>
            <option value="4th">4th Year</option>
          </select>
        </div>
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-2">Section</label>
          <select v-model="selectedSection" class="block w-full p-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:border-transparent">
            <option value="">All Sections</option>
            <option v-for="s in availableSections" :key="s" :value="s">{{ s }}</option>
          </select>
    </div>
        <div v-if="selectedYearLevel !== '2nd'" class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-2">Major</label>
          <select v-model="selectedMajor" class="block w-full p-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:border-transparent">
            <option value="">All Majors</option>
            <option v-for="m in availableMajors" :key="m" :value="m">{{ m }}</option>
        </select>
        </div>
      </div>
    </div>
    </div>

    <div class="max-w-7xl mx-auto">
    <!-- Counter Section -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
      <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
        <div class="text-2xl font-semibold text-gray-800">{{ totalStudents }}</div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Total Students</div>
      </div>
      <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
        <div class="text-2xl font-semibold text-gray-500">{{ completedStudents }}</div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Complete</div>
      </div>
      <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
        <div class="text-2xl font-semibold text-gray-500">{{ totalStudents - completedStudents }}</div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Incomplete</div>
      </div>
      <div class="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100" style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
        <div class="text-2xl font-semibold text-gray-500">{{ completionRate }}%</div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mt-2">Completion Rate</div>
      </div>
    </div>

    <!-- Removed semester tabs; we'll show both semesters in table -->

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mt-6" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        <span class="ml-3 text-gray-600">Loading Odyssey Plans...</span>
      </div>
    </div>

    <!-- Class Groups -->
    <div v-else class="space-y-6 mt-6">

      <!-- Grouped by class like MM.vue -->
      <div v-for="classGroup in groupedClassView" :key="classGroup.key" class="border border-gray-200 rounded-lg overflow-hidden">
        <div class="bg-[#166534] px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-lg font-medium text-white">{{ classGroup.yearLevel }} Year - Section {{ classGroup.section }} <span v-if="classGroup.major" class="text-white">({{ classGroup.major }})</span></h4>
              <p class="text-sm text-white mt-1">School Year: {{ classGroup.schoolYear }}</p>
            </div>
            <div class="flex items-center space-x-6">
              <div class="text-center">
                <div class="text-sm font-medium text-white">Total</div>
                <div class="text-lg font-semibold text-white">{{ classGroup.students.length }}</div>
            </div>
              <div class="text-center">
                <div class="text-sm font-medium text-white">Submitted</div>
                <div class="text-lg font-semibold text-white">{{ classGroup.submittedCount }}</div>
          </div>
              <div class="text-center">
                <div class="text-sm font-medium text-white">Rate</div>
                <div class="text-lg font-semibold text-white">{{ classGroup.rate }}%</div>
            </div>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto bg-white">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student No.</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">1st Sem</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">2nd Sem</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="student in classGroup.students" :key="student.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">{{ getInitials(student.name) }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-500">{{ student.idNumber }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span v-if="student.hasPlan1" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Submitted</span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Missing</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span v-if="student.hasPlan2" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Submitted</span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Missing</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button @click="viewPlan(student)" class="text-blue-600 hover:text-blue-800">Compare Plans</button>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button @click="openNoteModal(student)" class="text-gray-700 hover:text-gray-900">Add Note</button>
                  </td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>
    </div>

    <!-- Comparative Plan Details Modal -->
    <div v-if="showPlanModal" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm min-h-screen" @click.self="closePlanModal">
      <div class="w-11/12 max-w-7xl bg-white rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            Odyssey Plan Comparison - {{ selectedStudent?.name }}
          </h3>
          <button @click="closePlanModal" class="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Side by Side Semester Comparison -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 1st Semester -->
          <div class="bg-blue-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-blue-900">1st Semester</h4>
              <span v-if="firstSemesterPlan" :class="getStatusClass(firstSemesterPlan.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ firstSemesterPlan.status }}
              </span>
              <span v-else class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Not Submitted
              </span>
            </div>
            
            <div v-if="firstSemesterPlan" class="space-y-4">
              <!-- Submission Date -->
              <div class="text-sm text-blue-700 mb-4">
                <span class="font-medium">Submitted:</span> {{ formatDate(firstSemesterPlan.submittedAt) }}
              </div>
              
              <!-- Goals -->
              <div>
                <h5 class="font-medium text-blue-900 mb-2 flex items-center">
                  Goals
                </h5>
                <div v-if="firstSemesterPlan.goals && firstSemesterPlan.goals.length > 0" class="space-y-3">
                  <div v-for="(goal, index) in firstSemesterPlan.goals" :key="index" class="bg-white rounded-lg p-4 border border-blue-100">
                    <div class="flex items-start justify-between">
                      <div>
                        <p class="text-base font-semibold text-gray-800">Goal {{ index + 1 }}</p>
                        <p class="text-base text-gray-800 mt-1">{{ goal.description }}</p>
                      </div>
                    </div>
                    <div v-if="goal.steps && goal.steps.length > 0" class="mt-3">
                      <p class="text-sm font-medium text-gray-700 mb-1">Steps:</p>
                      <ul class="text-sm text-gray-800 space-y-1 list-disc pl-5">
                        <li v-for="(step, stepIndex) in goal.steps" :key="stepIndex">{{ step.description }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 italic">No goals specified</div>
              </div>
            </div>
            
            <div v-else class="flex items-center justify-center py-12">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="text-gray-500 font-medium">No 1st Semester Plan</p>
                <p class="text-gray-400 text-sm">Student hasn't submitted their plan yet</p>
              </div>
            </div>
          </div>
          
          <!-- 2nd Semester -->
          <div class="bg-green-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-green-900">2nd Semester</h4>
              <span v-if="secondSemesterPlan" :class="getStatusClass(secondSemesterPlan.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ secondSemesterPlan.status }}
              </span>
              <span v-else class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Not Submitted
              </span>
            </div>
            
            <div v-if="secondSemesterPlan" class="space-y-4">
              <!-- Submission Date -->
              <div class="text-sm text-green-700 mb-4">
                <span class="font-medium">Submitted:</span> {{ formatDate(secondSemesterPlan.submittedAt) }}
              </div>
              
              <!-- Goals -->
              <div>
                <h5 class="font-medium text-green-900 mb-2 flex items-center">
                  Goals
                </h5>
                <div v-if="secondSemesterPlan.goals && secondSemesterPlan.goals.length > 0" class="space-y-3">
                  <div v-for="(goal, index) in secondSemesterPlan.goals" :key="index" class="bg-white rounded-lg p-4 border border-green-100">
                    <div class="flex items-start justify-between">
                      <div>
                        <p class="text-base font-semibold text-gray-800">Goal {{ index + 1 }}</p>
                        <p class="text-base text-gray-800 mt-1">{{ goal.description }}</p>
                      </div>
                    </div>
                    <div v-if="goal.steps && goal.steps.length > 0" class="mt-3">
                      <p class="text-sm font-medium text-gray-700 mb-1">Steps:</p>
                      <ul class="text-sm text-gray-800 space-y-1 list-disc pl-5">
                        <li v-for="(step, stepIndex) in goal.steps" :key="stepIndex">{{ step.description }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 italic">No goals specified</div>
              </div>
            </div>
            
            <div v-else class="flex items-center justify-center py-12">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="text-gray-500 font-medium">No 2nd Semester Plan</p>
                <p class="text-gray-400 text-sm">Student hasn't submitted their plan yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Note Modal -->
    <div v-if="showNoteModal" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="showNoteModal = false">
      <div class="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-800">Add Adviser Note</h3>
          <button @click="showNoteModal = false" class="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <textarea v-model="noteText" rows="5" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent" placeholder="Write your note for the student's Odyssey plan..."></textarea>
        <div class="mt-4 flex justify-end space-x-3">
          <button @click="showNoteModal = false" class="px-4 py-2 rounded-lg border border-gray-200 text-gray-700">Cancel</button>
          <button @click="submitNote" class="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800">Save Note</button>
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
const odysseyPlans = ref([])
const showPlanModal = ref(false)
const selectedStudent = ref(null)
const firstSemesterPlan = ref(null)
const secondSemesterPlan = ref(null)
const activeSemester = ref('1st')
const selectedSchoolYear = ref('')
const selectedYearLevel = ref('')
const selectedSection = ref('')
const selectedMajor = ref('')
const availableSchoolYears = ref([])
const availableSections = ref([])
const availableMajors = ref([])
const showNoteModal = ref(false)
const noteText = ref('')
const noteTargetPlanId = ref(null)

// Computed properties
const filteredPlans = computed(() => {
  let plans = Array.isArray(odysseyPlans.value) ? odysseyPlans.value : []
  return plans.filter(p => {
    const cls = p.class || {}
    const syOk = !selectedSchoolYear.value || cls.schoolYear === selectedSchoolYear.value
    const ylOk = !selectedYearLevel.value || (cls.yearLevel === selectedYearLevel.value)
    const secOk = !selectedSection.value || (cls.section === selectedSection.value)
    const majOk = !selectedMajor.value || (cls.major === selectedMajor.value)
    return syOk && ylOk && secOk && majOk
  })
})
const allStudents = computed(() => {
  // Derive students from plans; fallback to class list if available
  const fromPlans = odysseyPlans.value
    .map(p => p.studentObj || p.student)
    .filter(Boolean)
    .reduce((map, s) => {
      const id = s._id || s.id
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: s.user ? `${s.user.firstName} ${s.user.lastName}` : s.name || 'Unknown',
          idNumber: s.user ? s.user.idNumber : s.idNumber || 'Unknown',
          yearLevel: (s.class && s.class.yearLevel) || 'Unknown',
            submissions: [],
            hasPlan1: false,
            hasPlan2: false
        })
      }
      return map
    }, new Map())

  odysseyPlans.value.forEach(p => {
    const s = p.studentObj || p.student
    if (!s) return
    const id = s._id || s.id
    const rec = fromPlans.get(id)
    if (rec) {
      rec.submissions.push({ semester: p.semester, planId: p._id })
        if (p.semester === 1 || p.semester === '1' || p.semester === '1st') rec.hasPlan1 = true
        if (p.semester === 2 || p.semester === '2' || p.semester === '2nd') rec.hasPlan2 = true
    }
  })

  return Array.from(fromPlans.values())
})

const totalStudents = computed(() => allStudents.value.length)

const completedStudents = computed(() => {
  return allStudents.value.filter(student => hasAnyOdysseyPlan(student)).length
})

const incompleteStudents = computed(() => {
  return totalStudents.value - completedStudents.value
})

const completionRate = computed(() => {
  if (totalStudents.value === 0) return 0
  return Math.round((completedStudents.value / totalStudents.value) * 100)
})

// Methods
const getInitials = (name) => {
  return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase()
}

const getStudentYearLevel = (student) => student.yearLevel || 'Unknown'

const hasOdysseyPlanForSemester = (student, semester) => student.submissions?.some(s => s.semester === semester)

const hasAnyOdysseyPlan = (student) => hasOdysseyPlanForSemester(student, 1) || hasOdysseyPlanForSemester(student, 2)

const getOdysseyPlanForSemester = (student, semester) => student.submissions?.find(s => s.semester === semester)

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
  try {
    loading.value = true
    const plans = await odysseyPlanService.getAdviserPlans()
    odysseyPlans.value = Array.isArray(plans) ? plans : (plans?.plans || [])
    // derive filter options
    const years = new Set(), sections = new Set(), majors = new Set()
    odysseyPlans.value.forEach(p => { if (p.class?.schoolYear) years.add(p.class.schoolYear); if (p.class?.section) sections.add(p.class.section); if (p.class?.major) majors.add(p.class.major); })
    availableSchoolYears.value = Array.from(years).sort()
    availableSections.value = Array.from(sections).sort()
    availableMajors.value = Array.from(majors).sort()
  } catch (error) {
    notificationService.showError('Failed to load Odyssey Plans')
  } finally {
    loading.value = false
  }
}

// Group by class like MM.vue
const groupedClassView = computed(() => {
  const plans = filteredPlans.value
  if (!plans || plans.length === 0) return []

  const groupMap = new Map()

  for (const p of plans) {
    const cls = p.class || {}
    const classId = cls._id || 'unknown'
    if (!groupMap.has(classId)) {
      groupMap.set(classId, {
        key: classId,
        classId,
        yearLevel: cls.yearLevel || 'Unknown',
        section: cls.section || 'Unknown',
        major: cls.major || 'General',
        schoolYear: cls.schoolYear || 'Unknown',
        students: new Map(),
        submittedCount: 0,
        rate: 0
      })
    }

    const group = groupMap.get(classId)
    const s = p.student || p.studentObj || {}
    const sid = s._id || s.id
    if (!sid) continue
    if (!group.students.has(sid)) {
      group.students.set(sid, {
        id: sid,
        name: s.user ? `${s.user.firstName} ${s.user.lastName}` : (s.name || 'Unknown'),
        idNumber: s.user ? s.user.idNumber : (s.idNumber || 'Unknown'),
        hasPlan1: false,
        hasPlan2: false
      })
    }
    const rec = group.students.get(sid)
    if (p.semester === 1 || p.semester === '1' || p.semester === '1st') rec.hasPlan1 = true
    if (p.semester === 2 || p.semester === '2' || p.semester === '2nd') rec.hasPlan2 = true
  }

  // finalize counts
  const groups = Array.from(groupMap.values()).map(g => {
    const students = Array.from(g.students.values())
    const submitted = students.filter(s => s.hasPlan1 || s.hasPlan2).length
    const rate = students.length ? Math.round((submitted / students.length) * 100) : 0
    return { ...g, students, submittedCount: submitted, rate }
  })

  return groups
})

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

const refreshData = async () => { await loadOdysseyPlans() }

const viewPlan = (student) => {
  selectedStudent.value = student
  // find full plan objects from original list for richer modal detail
  const sId = student.id
  firstSemesterPlan.value = filteredPlans.value.find(p => (p.student?._id || p.student?.id) === sId && (p.semester === 1 || p.semester === '1' || p.semester === '1st')) || null
  secondSemesterPlan.value = filteredPlans.value.find(p => (p.student?._id || p.student?.id) === sId && (p.semester === 2 || p.semester === '2' || p.semester === '2nd')) || null
  showPlanModal.value = true
}

const openNoteModal = (student) => {
  // prefer current semester plan, fallback to first existing
  const sId = student.id
  const candidate = filteredPlans.value.find(p => (p.student?._id || p.student?.id) === sId) || null
  noteTargetPlanId.value = candidate?._id || null
  noteText.value = ''
  showNoteModal.value = true
}

const submitNote = async () => {
  try {
    if (!noteTargetPlanId.value) {
      notificationService.showError('No plan selected')
      return
    }
    if (!noteText.value.trim()) {
      notificationService.showError('Please enter a note')
      return
    }
    await odysseyPlanService.addNote(noteTargetPlanId.value, noteText.value.trim())
    notificationService.showSuccess('Note added')
    showNoteModal.value = false
    await loadOdysseyPlans()
  } catch (e) {
    notificationService.showError('Failed to add note')
  }
}

const closePlanModal = () => {
  showPlanModal.value = false
  selectedStudent.value = null
  firstSemesterPlan.value = null
  secondSemesterPlan.value = null
}

const sendReminder = async (student) => {
  try {
    const yearNum = extractYearNumber(getStudentYearLevel(student))
    
    // Check which semesters are missing
    const missing1st = !hasOdysseyPlanForSemester(student, 1)
    const missing2nd = !hasOdysseyPlanForSemester(student, 2)
    
    let semesterText = ''
    if (missing1st && missing2nd) {
      semesterText = 'both 1st and 2nd Semester'
    } else if (missing1st) {
      semesterText = '1st Semester'
    } else if (missing2nd) {
      semesterText = '2nd Semester'
    }
    
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

// Lifecycle
onMounted(async () => { await loadOdysseyPlans() })
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