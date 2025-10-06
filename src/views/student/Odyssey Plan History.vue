<template>
  <div class="container mx-auto px-4 py-8" style="background-color: #F6FBF9;">
    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">ARCHIVED ODYSSEY PLANS</h1>
          <p class="text-gray-600 mt-1">View your submitted plans from previous semesters</p>
        </div>
      </div>
    </div>

    <!-- Year Filter -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Filter by Year</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="year in availableYears"
          :key="year"
          @click="selectedYear = year"
          class="px-4 py-2 rounded-md transition-colors"
          :class="selectedYear === year ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          Year {{ year }}
        </button>
        <button
          @click="selectedYear = null"
          class="px-4 py-2 rounded-md transition-colors"
          :class="!selectedYear ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          All Years
        </button>
      </div>
    </div>

    <!-- Archived Plans List -->
    <div class="space-y-6">
      <div v-if="filteredPlans.length === 0" class="bg-white rounded-lg shadow-md p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-500 text-lg">No archived plans found for the selected year</p>
      </div>

      <div v-else v-for="plan in filteredPlans" :key="plan._id" class="bg-white rounded-lg shadow-md p-6">
        <!-- Plan Header -->
        <div class="border-b border-gray-200 pb-4 mb-4">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-semibold text-gray-800">Y{{ plan.year }}S{{ plan.semester }}</h2>
              <p class="text-sm text-gray-500">Submitted on {{ formatDate(plan.submittedAt) }}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-sm" :class="getStatusClass(plan.status)">{{ plan.status }}</span>
          </div>
        </div>

        <!-- Goals Section (from saved goals/steps) -->
        <div class="space-y-6">
          <div v-if="Array.isArray(plan.goals) && plan.goals.length" class="space-y-4">
            <div v-for="(goal, gi) in plan.goals" :key="gi" class="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Goal {{ gi + 1 }}</h3>
              <p class="text-base text-gray-800 mb-3">{{ goal.description }}</p>
              <div v-if="goal.steps && goal.steps.length" class="mt-2">
                <p class="text-sm font-medium text-gray-700 mb-1">Steps</p>
                <ul class="list-disc pl-6 space-y-1">
                  <li v-for="(st, si) in goal.steps" :key="si" class="text-base text-gray-800">{{ st.description }}</li>
                </ul>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500">No goals provided.</div>

          <!-- Adviser Notes -->
          <div v-if="plan.adviserNotes && plan.adviserNotes.length" class="bg-white rounded-lg border border-gray-100 p-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Adviser Notes</h3>
            <div class="space-y-3">
              <div v-for="(n, ni) in plan.adviserNotes" :key="ni" class="border border-gray-100 rounded-md p-3 bg-gray-50">
                <p class="text-base text-gray-800">{{ n.note }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(n.createdAt) }}</p>
              </div>
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
const selectedYear = ref(null);
const archivedPlans = ref([]);

onMounted(async () => {
  try {
    const plans = await odysseyPlanService.getAllPlans();
    archivedPlans.value = Array.isArray(plans) ? plans : (plans?.plans || []);
  } catch (e) {
    notificationService.showError('Failed to load Odyssey history');
  }
});

// Computed properties
const availableYears = computed(() => {
  const years = new Set(archivedPlans.value.map(plan => plan.year));
  return Array.from(years).sort();
});

const filteredPlans = computed(() => {
  if (!selectedYear.value) return archivedPlans.value;
  return archivedPlans.value.filter(plan => plan.year === selectedYear.value);
});

// Methods
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
</script>

<style scoped>
.text-primary {
  color: #3B82F6;
}

.bg-primary {
  background-color: #3B82F6;
}

.bg-primary-light {
  background-color: #EFF6FF;
}
</style> 