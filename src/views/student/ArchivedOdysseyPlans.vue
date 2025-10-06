<template>
  <div class="min-h-screen py-8" style="background-color: #F6FBF9;">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Header Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Archived Odyssey Plans
        </h1>
        <p class="text-gray-600 mt-1">View your submitted odyssey plans</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-8 text-center">
        <div class="flex justify-center mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
        </div>
        <p class="text-gray-500">Loading your odyssey plans...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="plans.length === 0" class="bg-white rounded-lg shadow-md p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">No archived odyssey plans found</h3>
        <p class="text-gray-500 mb-4">You haven't submitted any odyssey plans yet.</p>
        <router-link to="/student/odyssey-plan" class="inline-flex items-center px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Plan
        </router-link>
      </div>

      <!-- Plans List: Grouped by Year with 1st and 2nd Semester side-by-side -->
      <div v-else class="space-y-6">
        <div v-for="year in years" :key="year" class="bg-white rounded-lg shadow-md overflow-hidden">
          <!-- Year Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
              <h3 class="text-lg font-semibold text-gray-800">{{ getYearLevelText(year) }} - Odyssey Plans</h3>
              <p class="text-sm text-gray-500">Compare your 1st and 2nd semester plans</p>
            </div>
          </div>

          <!-- Semester Comparison Grid -->
          <div class="px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 1st Semester -->
            <div class="border rounded-lg">
              <div class="px-4 py-3 border-b bg-blue-50 flex items-center justify-between">
                <h4 class="font-medium text-blue-800">1st Semester</h4>
                <span v-if="getPlanFor(year, 1)" class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(getPlanFor(year, 1).status)">
                  {{ getPlanFor(year, 1).status }}
                </span>
              </div>
              <div class="p-4" v-if="getPlanFor(year, 1)">
                <p class="text-xs text-gray-500 mb-3">Submitted on {{ formatDate(getPlanFor(year, 1).submittedAt) }}</p>

                <!-- Goals (from saved plan.goals) -->
                <div v-if="getPlanFor(year, 1).goals && getPlanFor(year, 1).goals.length" class="space-y-3 mb-4">
                  <div v-for="(goal, gi) in getPlanFor(year, 1).goals" :key="'first-goal-' + gi" class="bg-blue-50 rounded-lg p-4">
                    <h5 class="font-medium text-blue-800 mb-2">Goal {{ gi + 1 }}</h5>
                    <p class="text-base text-blue-900 mb-3">{{ goal.description }}</p>
                    <div v-if="goal.steps && goal.steps.length" class="ml-4 space-y-1">
                      <h6 class="text-sm font-medium text-blue-700">Steps:</h6>
                      <div v-for="(st, si) in goal.steps" :key="'first-step-' + si" class="flex items-start">
                        <span class="text-blue-600 mr-2">•</span>
                        <p class="text-blue-900 text-sm">{{ st.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Adviser Notes (1st Sem) -->
                <div v-if="getPlanFor(year, 1).adviserNotes && getPlanFor(year, 1).adviserNotes.length" class="mb-4">
                  <h6 class="text-sm font-medium text-gray-700 mb-2">Adviser Notes</h6>
                  <div class="space-y-2">
                    <div v-for="(n, ni) in getPlanFor(year, 1).adviserNotes" :key="'first-note-' + ni" class="bg-gray-50 border border-gray-100 rounded p-3">
                      <p class="text-gray-800 text-sm">{{ n.note }}</p>
                      <p class="text-[11px] text-gray-500 mt-1">{{ formatDate(n.createdAt) }}</p>
                    </div>
                  </div>
                </div>

            <!-- Academic Goals -->
                <div v-if="getPlanFor(year, 1).academicGoals && getPlanFor(year, 1).academicGoals.length" class="mb-4">
                  <button @click="toggleGoalsSection(getPlanFor(year, 1)._id, 'academic')" class="flex items-center justify-between w-full text-left py-2">
                    <span class="font-medium text-blue-800">Academic Goals ({{ getPlanFor(year, 1).academicGoals.length }})</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 transition-transform" :class="{'transform rotate-180': isGoalsSectionExpanded(getPlanFor(year, 1)._id, 'academic')}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div v-if="isGoalsSectionExpanded(getPlanFor(year, 1)._id, 'academic')" class="mt-2 space-y-3">
                    <div v-for="(goal, index) in getPlanFor(year, 1).academicGoals" :key="'first-academic-' + index" class="bg-blue-50 rounded-lg p-4">
                      <h5 class="font-medium text-blue-800 mb-2">Goal {{ index + 1 }}</h5>
                      <p class="text-blue-700 mb-3">{{ goal.description }}</p>
                      <div v-if="goal.steps && goal.steps.length" class="ml-4 space-y-1">
                        <h6 class="text-sm font-medium text-blue-600">Steps:</h6>
                        <div v-for="(step, sIdx) in goal.steps" :key="'first-academic-step-' + sIdx" class="flex items-start">
                          <span class="text-blue-500 mr-2">•</span>
                          <p class="text-blue-600 text-sm">{{ step.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Personal Goals -->
                <div v-if="getPlanFor(year, 1).personalGoals && getPlanFor(year, 1).personalGoals.length" class="mb-4">
                  <button @click="toggleGoalsSection(getPlanFor(year, 1)._id, 'personal')" class="flex items-center justify-between w-full text-left py-2">
                    <span class="font-medium text-green-800">Personal Goals ({{ getPlanFor(year, 1).personalGoals.length }})</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600 transition-transform" :class="{'transform rotate-180': isGoalsSectionExpanded(getPlanFor(year, 1)._id, 'personal')}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div v-if="isGoalsSectionExpanded(getPlanFor(year, 1)._id, 'personal')" class="mt-2 space-y-3">
                    <div v-for="(goal, index) in getPlanFor(year, 1).personalGoals" :key="'first-personal-' + index" class="bg-green-50 rounded-lg p-4">
                      <h5 class="font-medium text-green-800 mb-2">Goal {{ index + 1 }}</h5>
                      <p class="text-green-700 mb-3">{{ goal.description }}</p>
                      <div v-if="goal.steps && goal.steps.length" class="ml-4 space-y-1">
                        <h6 class="text-sm font-medium text-green-600">Steps:</h6>
                        <div v-for="(step, sIdx) in goal.steps" :key="'first-personal-step-' + sIdx" class="flex items-start">
                          <span class="text-green-500 mr-2">•</span>
                          <p class="text-green-600 text-sm">{{ step.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Financial Goals -->
                <div v-if="getPlanFor(year, 1).financialGoals && getPlanFor(year, 1).financialGoals.length">
                  <button @click="toggleGoalsSection(getPlanFor(year, 1)._id, 'financial')" class="flex items-center justify-between w-full text-left py-2">
                    <span class="font-medium text-yellow-800">Financial Goals ({{ getPlanFor(year, 1).financialGoals.length }})</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-600 transition-transform" :class="{'transform rotate-180': isGoalsSectionExpanded(getPlanFor(year, 1)._id, 'financial')}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
                  <div v-if="isGoalsSectionExpanded(getPlanFor(year, 1)._id, 'financial')" class="mt-2 space-y-3">
                    <div v-for="(goal, index) in getPlanFor(year, 1).financialGoals" :key="'first-financial-' + index" class="bg-yellow-50 rounded-lg p-4">
                      <h5 class="font-medium text-yellow-800 mb-2">Goal {{ index + 1 }}</h5>
                      <p class="text-yellow-700 mb-3">{{ goal.description }}</p>
                      <div v-if="goal.steps && goal.steps.length" class="ml-4 space-y-1">
                        <h6 class="text-sm font-medium text-yellow-600">Steps:</h6>
                        <div v-for="(step, sIdx) in goal.steps" :key="'first-financial-step-' + sIdx" class="flex items-start">
                          <span class="text-yellow-500 mr-2">•</span>
                          <p class="text-yellow-600 text-sm">{{ step.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="p-6 text-center text-gray-500">No 1st semester plan for this year</div>
            </div>

            <!-- 2nd Semester -->
            <div class="border rounded-lg">
              <div class="px-4 py-3 border-b bg-purple-50 flex items-center justify-between">
                <h4 class="font-medium text-purple-800">2nd Semester</h4>
                <span v-if="getPlanFor(year, 2)" class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(getPlanFor(year, 2).status)">
                  {{ getPlanFor(year, 2).status }}
                </span>
              </div>
              <div class="p-4" v-if="getPlanFor(year, 2)">
                <p class="text-xs text-gray-500 mb-3">Submitted on {{ formatDate(getPlanFor(year, 2).submittedAt) }}</p>

                <!-- Goals (from saved plan.goals) -->
                <div v-if="getPlanFor(year, 2).goals && getPlanFor(year, 2).goals.length" class="space-y-3 mb-4">
                  <div v-for="(goal, gi) in getPlanFor(year, 2).goals" :key="'second-goal-' + gi" class="bg-purple-50 rounded-lg p-4">
                    <h5 class="font-medium text-purple-800 mb-2">Goal {{ gi + 1 }}</h5>
                    <p class="text-base text-purple-900 mb-3">{{ goal.description }}</p>
                    <div v-if="goal.steps && goal.steps.length" class="ml-4 space-y-1">
                      <h6 class="text-sm font-medium text-purple-700">Steps:</h6>
                      <div v-for="(st, si) in goal.steps" :key="'second-step-' + si" class="flex items-start">
                        <span class="text-purple-600 mr-2">•</span>
                        <p class="text-purple-900 text-sm">{{ st.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Adviser Notes (2nd Sem) -->
                <div v-if="getPlanFor(year, 2).adviserNotes && getPlanFor(year, 2).adviserNotes.length" class="mb-4">
                  <h6 class="text-sm font-medium text-gray-700 mb-2">Adviser Notes</h6>
                  <div class="space-y-2">
                    <div v-for="(n, ni) in getPlanFor(year, 2).adviserNotes" :key="'second-note-' + ni" class="bg-gray-50 border border-gray-100 rounded p-3">
                      <p class="text-gray-800 text-sm">{{ n.note }}</p>
                      <p class="text-[11px] text-gray-500 mt-1">{{ formatDate(n.createdAt) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Academic Goals -->
                <div v-if="getPlanFor(year, 2).academicGoals && getPlanFor(year, 2).academicGoals.length" class="mb-4">
                  <button @click="toggleGoalsSection(getPlanFor(year, 2)._id, 'academic')" class="flex items-center justify-between w-full text-left py-2">
                    <span class="font-medium text-blue-800">Academic Goals ({{ getPlanFor(year, 2).academicGoals.length }})</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 transition-transform" :class="{'transform rotate-180': isGoalsSectionExpanded(getPlanFor(year, 2)._id, 'academic')}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div v-if="isGoalsSectionExpanded(getPlanFor(year, 2)._id, 'academic')" class="mt-2 space-y-3">
                    <div v-for="(goal, index) in getPlanFor(year, 2).academicGoals" :key="'second-academic-' + index" class="bg-blue-50 rounded-lg p-4">
                  <h5 class="font-medium text-blue-800 mb-2">Goal {{ index + 1 }}</h5>
                  <p class="text-blue-700 mb-3">{{ goal.description }}</p>
                      <div v-if="goal.steps && goal.steps.length" class="ml-4 space-y-1">
                    <h6 class="text-sm font-medium text-blue-600">Steps:</h6>
                        <div v-for="(step, sIdx) in goal.steps" :key="'second-academic-step-' + sIdx" class="flex items-start">
                      <span class="text-blue-500 mr-2">•</span>
                      <p class="text-blue-600 text-sm">{{ step.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Personal Goals -->
                <div v-if="getPlanFor(year, 2).personalGoals && getPlanFor(year, 2).personalGoals.length" class="mb-4">
                  <button @click="toggleGoalsSection(getPlanFor(year, 2)._id, 'personal')" class="flex items-center justify-between w-full text-left py-2">
                    <span class="font-medium text-green-800">Personal Goals ({{ getPlanFor(year, 2).personalGoals.length }})</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600 transition-transform" :class="{'transform rotate-180': isGoalsSectionExpanded(getPlanFor(year, 2)._id, 'personal')}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
                  <div v-if="isGoalsSectionExpanded(getPlanFor(year, 2)._id, 'personal')" class="mt-2 space-y-3">
                    <div v-for="(goal, index) in getPlanFor(year, 2).personalGoals" :key="'second-personal-' + index" class="bg-green-50 rounded-lg p-4">
                  <h5 class="font-medium text-green-800 mb-2">Goal {{ index + 1 }}</h5>
                  <p class="text-green-700 mb-3">{{ goal.description }}</p>
                      <div v-if="goal.steps && goal.steps.length" class="ml-4 space-y-1">
                    <h6 class="text-sm font-medium text-green-600">Steps:</h6>
                        <div v-for="(step, sIdx) in goal.steps" :key="'second-personal-step-' + sIdx" class="flex items-start">
                      <span class="text-green-500 mr-2">•</span>
                      <p class="text-green-600 text-sm">{{ step.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Goals -->
                <div v-if="getPlanFor(year, 2).financialGoals && getPlanFor(year, 2).financialGoals.length">
                  <button @click="toggleGoalsSection(getPlanFor(year, 2)._id, 'financial')" class="flex items-center justify-between w-full text-left py-2">
                    <span class="font-medium text-yellow-800">Financial Goals ({{ getPlanFor(year, 2).financialGoals.length }})</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-600 transition-transform" :class="{'transform rotate-180': isGoalsSectionExpanded(getPlanFor(year, 2)._id, 'financial')}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
                  <div v-if="isGoalsSectionExpanded(getPlanFor(year, 2)._id, 'financial')" class="mt-2 space-y-3">
                    <div v-for="(goal, index) in getPlanFor(year, 2).financialGoals" :key="'second-financial-' + index" class="bg-yellow-50 rounded-lg p-4">
                  <h5 class="font-medium text-yellow-800 mb-2">Goal {{ index + 1 }}</h5>
                  <p class="text-yellow-700 mb-3">{{ goal.description }}</p>
                      <div v-if="goal.steps && goal.steps.length" class="ml-4 space-y-1">
                    <h6 class="text-sm font-medium text-yellow-600">Steps:</h6>
                        <div v-for="(step, sIdx) in goal.steps" :key="'second-financial-step-' + sIdx" class="flex items-start">
                      <span class="text-yellow-500 mr-2">•</span>
                      <p class="text-yellow-600 text-sm">{{ step.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
                </div>
              </div>
              <div v-else class="p-6 text-center text-gray-500">No 2nd semester plan for this year</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { odysseyPlanService } from '../../services/odysseyPlanService';
import { notificationService } from '../../services/notificationService';

// State
const plans = ref([]);
const loading = ref(true);
const expandedGoalsSections = ref({});

// Computed
const years = computed(() => {
  const set = new Set(plans.value.map(p => p.year))
  return Array.from(set).sort((a, b) => b - a)
});

// Methods
function getYearLevelText(year) {
  if (year === 1) return '1st Year';
  if (year === 2) return '2nd Year';
  if (year === 3) return '3rd Year';
  if (year === 4) return '4th Year';
  return `${year} Year`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getStatusClass(status) {
  switch(status) {
    case 'Approved':
      return 'bg-green-100 text-green-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

function getPlanFor(year, semester) {
  return plans.value.find(p => p.year === year && p.semester === semester) || null
}

function toggleGoalsSection(planId, goalType) {
  const key = `${planId}-${goalType}`;
  expandedGoalsSections.value[key] = !expandedGoalsSections.value[key];
}

function isGoalsSectionExpanded(planId, goalType) {
  const key = `${planId}-${goalType}`;
  return expandedGoalsSections.value[key] || false;
}

// Load data
async function fetchPlans() {
  try {
    loading.value = true;
    const data = await odysseyPlanService.getAllPlans();
    
    console.log('Raw API response:', data);
    
    // The API directly returns an array of plans, not a wrapped response
    if (Array.isArray(data)) {
      plans.value = data;
    } else if (data && Array.isArray(data.plans)) {
      // Fallback in case the API format changes
      plans.value = data.plans;
    } else {
      console.error('Unexpected response format:', data);
      plans.value = [];
    }
    
    console.log('Loaded plans:', plans.value);
  } catch (error) {
    console.error('Error fetching odyssey plans:', error);
    plans.value = [];
    notificationService.showError('Failed to load odyssey plans');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchPlans();
});
</script>

<style scoped>
.text-primary {
  color: #3B82F6;
}

.bg-primary {
  background-color: #3B82F6;
}

.bg-primary-dark {
  background-color: #2563EB;
}

.hover\:bg-primary-dark:hover {
  background-color: #2563EB;
}
</style> 