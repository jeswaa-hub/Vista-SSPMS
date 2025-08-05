<template>
  <div class="odyssey-plan">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Title -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary mb-2">Odyssey Plan</h1>
        <p class="text-gray-600">Create your life plan for the semester</p>
      </div>

      <!-- No Class Assignment Message -->
      <div v-if="!loadingYearLevel && !hasClassAssignment" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div class="flex items-center">
          <svg class="h-8 w-8 text-yellow-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 class="text-lg font-medium text-yellow-800">Class Assignment Required</h3>
            <p class="text-yellow-700 mt-1">
              You are not assigned to a class yet. Please contact your administrator to get assigned to a class before you can create your Odyssey Plan.
            </p>
          </div>
        </div>
      </div>

      <!-- Year and Semester Selection (Improved UI) -->
      <div v-if="hasClassAssignment" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-primary mb-4">Select Academic Period</h2>
        
        <!-- Loading indicator -->
        <div v-if="loadingYearLevel" class="flex justify-center my-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <div v-else>
          <!-- Year Level Selector (Card Style) -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <div class="grid grid-cols-1 gap-3">
              <button
                v-for="year in availableYears"
                :key="year"
                @click="selectedYear = year"
                class="py-3 px-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                :class="selectedYear === year ? 'border-primary bg-primary-light text-primary font-medium' : 'border-gray-200 hover:border-gray-300 text-gray-700'"
              >
                {{ getYearLevelText(year) }}
              </button>
            </div>
          </div>
          
          <!-- Semester Selector (Card Style) -->
          <div v-if="selectedYear">
            <label class="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="sem in [1, 2]"
                :key="sem"
                @click="selectSemester(sem)"
                class="py-3 px-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                :class="[
                  selectedSemester === sem ? 'border-primary bg-primary-light text-primary font-medium' : 'border-gray-200 hover:border-gray-300 text-gray-700',
                  ((!canSelectSemester2 && sem === 2) || isAlreadySubmitted(selectedYear, sem)) ? 'opacity-50 cursor-not-allowed' : ''
                ]"
                :disabled="(!canSelectSemester2 && sem === 2) || isAlreadySubmitted(selectedYear, sem)"
              >
                {{ sem === 1 ? '1st Semester' : '2nd Semester' }}
              </button>
            </div>
            <p v-if="selectedSemester === 2 && !canSelectSemester2" class="text-red-500 text-sm mt-1">
              You must complete 1st Semester first
            </p>
            <p v-if="selectedSemester && isAlreadySubmitted(selectedYear, selectedSemester)" class="text-blue-600 text-sm mt-1">
              This plan has already been submitted. View it in the <router-link to="/student/archived-odyssey-plans" class="underline">Archive</router-link>.
            </p>
          </div>
        </div>
      </div>

      <!-- Plan Form -->
      <div v-if="hasClassAssignment && selectedYear && selectedSemester" class="bg-white rounded-lg shadow-md p-6">
        <form @submit.prevent="submitPlan">
          <!-- Academic Goals -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-primary mb-4">Academic Goals</h3>
            <div v-for="(goal, index) in academicGoals" :key="'academic-' + index" class="mb-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Goal {{ index + 1 }}
                  </label>
                  <textarea
                    v-model="goal.description"
                    rows="4"
                    class="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    :placeholder="'Enter your academic goal ' + (index + 1)"
                    required
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Steps to Achieve
                  </label>
                  <textarea
                    v-model="goal.steps[0].description"
                    rows="4"
                    class="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter steps to achieve this goal"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Goals -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-primary mb-4">Personal Goals</h3>
            <div v-for="(goal, index) in personalGoals" :key="'personal-' + index" class="mb-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Goal {{ index + 1 }}
                  </label>
                  <textarea
                    v-model="goal.description"
                    rows="4"
                    class="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    :placeholder="'Enter your personal goal ' + (index + 1)"
                    required
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Steps to Achieve
                  </label>
                  <textarea
                    v-model="goal.steps[0].description"
                    rows="4"
                    class="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter steps to achieve this goal"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Goals -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-primary mb-4">Financial Goals</h3>
            <div v-for="(goal, index) in financialGoals" :key="'financial-' + index" class="mb-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Goal {{ index + 1 }}
                  </label>
                  <textarea
                    v-model="goal.description"
                    rows="4"
                    class="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    :placeholder="'Enter your financial goal ' + (index + 1)"
                    required
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Steps to Achieve
                  </label>
                  <textarea
                    v-model="goal.steps[0].description"
                    rows="4"
                    class="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter steps to achieve this goal"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="text-center">
            <button
              type="submit"
              class="bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              :disabled="loading || !isFormValid"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
              <span v-else>Submit Plan</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { notificationService } from '../../services/notificationService';
import { odysseyPlanService } from '../../services/odysseyPlanService';

export default {
  name: 'OdysseyPlan',
  setup() {
    // State
    const studentYearLevel = ref(null);
    const selectedYear = ref('');
    const selectedSemester = ref('');
    const academicGoals = ref([
      { description: '', steps: [{ description: '' }] },
      { description: '', steps: [{ description: '' }] },
      { description: '', steps: [{ description: '' }] }
    ]);
    const personalGoals = ref([
      { description: '', steps: [{ description: '' }] },
      { description: '', steps: [{ description: '' }] },
      { description: '', steps: [{ description: '' }] }
    ]);
    const financialGoals = ref([
      { description: '', steps: [{ description: '' }] },
      { description: '', steps: [{ description: '' }] },
      { description: '', steps: [{ description: '' }] }
    ]);
    const loading = ref(false);
    const loadingYearLevel = ref(true);
    const error = ref(null);
    const completedPlans = ref([]);
    const student4thYearAccess = ref(false);
    const hasClassAssignment = ref(true); // Default to true, will be updated from API

    // Computed properties
    const availableYears = computed(() => {
      if (!studentYearLevel.value) return [];
      
      // Get the student's current year level
      const currentYear = studentYearLevel.value;
      
      // Only return the student's current year level
      // If they're in 4th year or have special access, also include 4th year
      if (currentYear === 4 || student4thYearAccess.value) {
        return [currentYear];
      }
      
      return [currentYear];
    });

    const canSelectSemester2 = computed(() => {
      if (!selectedYear.value) return false;
      
      // Check if semester 1 is completed for the selected year
      return completedPlans.value.some(plan => 
        plan.year === selectedYear.value && plan.semester === 1 && plan.completed
      );
    });

    const isFormValid = computed(() => {
      const allGoals = [
        ...academicGoals.value,
        ...personalGoals.value,
        ...financialGoals.value
      ];

      return allGoals.every(goal => 
        goal.description.trim() !== '' && 
        goal.steps[0].description.trim() !== ''
      );
    });

    // Methods
    function getYearLevelText(year) {
      if (year === 1) return '1st Year';
      if (year === 2) return '2nd Year';
      if (year === 3) return '3rd Year';
      if (year === 4) return '4th Year';
      return `${year} Year`;
    }

    function selectSemester(semester) {
      if (semester === 2 && !canSelectSemester2.value) {
        error.value = 'You must complete 1st Semester before selecting 2nd Semester';
        return;
      }
      selectedSemester.value = semester;
      error.value = null;
      loadExistingPlan();
    }

    async function fetchCompletedPlans() {
      try {
        loading.value = true;
        const plans = await odysseyPlanService.getCompletedPlans();
        completedPlans.value = plans;
        console.log('Completed plans:', plans);
      } catch (err) {
        console.error('Error fetching completed plans:', err);
        error.value = 'Failed to fetch completed plans';
      } finally {
        loading.value = false;
      }
    }

    async function fetchStudentYearLevel() {
      try {
        loadingYearLevel.value = true;
        const response = await odysseyPlanService.getStudentYear();
        
        // Check if student has class assignment
        if (response.hasClassAssignment === false) {
          hasClassAssignment.value = false;
          studentYearLevel.value = null;
          student4thYearAccess.value = false;
          console.log('Student has no class assignment');
          return;
        }
        
        hasClassAssignment.value = true;
        studentYearLevel.value = response.yearLevel || 1;
        
        // Check if student has been explicitly granted access to 4th year plans
        if (response.canAccess4thYearOdysseyPlan) {
          student4thYearAccess.value = true;
        }
        
        console.log('Student year level:', studentYearLevel.value, 'Can access 4th year:', student4thYearAccess.value);
      } catch (err) {
        console.error('Error fetching student year level:', err);
        
        // Check if it's a class assignment error (400 status)
        if (err.response && err.response.status === 400) {
          hasClassAssignment.value = false;
          studentYearLevel.value = null;
          student4thYearAccess.value = false;
          error.value = err.response.data.message || 'You are not assigned to a class yet.';
        } else {
          // Other errors - keep default behavior
          studentYearLevel.value = 1;
          hasClassAssignment.value = true;
        }
      } finally {
        loadingYearLevel.value = false;
      }
    }

    async function loadExistingPlan() {
      if (!selectedYear.value || !selectedSemester.value) return;
      
      try {
        loading.value = true;
        error.value = null;
        
        const plan = await odysseyPlanService.getPlan(selectedYear.value, selectedSemester.value);
        
        // Populate form with existing data
        academicGoals.value = plan.academicGoals;
        personalGoals.value = plan.personalGoals;
        financialGoals.value = plan.financialGoals;
        
      } catch (err) {
        // If 404 (plan not found), that's fine - just use the empty form
        if (err.response && err.response.status === 404) {
          resetForm();
        } else {
          console.error('Error loading existing plan:', err);
          error.value = 'Failed to load existing plan';
        }
      } finally {
        loading.value = false;
      }
    }

    async function submitPlan() {
      if (!isFormValid.value) {
        error.value = 'Please fill in all required fields';
        return;
      }

      if (selectedSemester.value === 2 && !canSelectSemester2.value) {
        error.value = 'You must complete 1st Semester before submitting 2nd Semester';
        return;
      }

      try {
        loading.value = true;
        error.value = null;

        const planData = {
          year: parseInt(selectedYear.value),
          semester: parseInt(selectedSemester.value),
          academicGoals: academicGoals.value,
          personalGoals: personalGoals.value,
          financialGoals: financialGoals.value
        };

        await odysseyPlanService.savePlan(planData);
        
        // Refresh completed plans
        await fetchCompletedPlans();
        
        // Show success message
        notificationService.showSuccess('Plan submitted successfully');
        
        // Reset the form
        selectedYear.value = '';
        selectedSemester.value = '';
        resetForm();
      } catch (err) {
        console.error('Error submitting plan:', err);
        if (err.response && err.response.data && err.response.data.message) {
          error.value = err.response.data.message;
        } else {
          error.value = 'Failed to submit plan. Please try again.';
        }
        notificationService.showError(error.value);
      } finally {
        loading.value = false;
      }
    }

    function resetForm() {
      academicGoals.value = [
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] }
      ];
      personalGoals.value = [
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] }
      ];
      financialGoals.value = [
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] }
      ];
    }

    function isAlreadySubmitted(year, semester) {
      return completedPlans.value.some(plan => 
        plan.year === year && plan.semester === semester && plan.completed
      );
    }

    // Lifecycle hooks
    onMounted(async () => {
      await fetchStudentYearLevel();
      await fetchCompletedPlans();
    });

    // Watch for year changes
    const watchSelectedYear = (newValue) => {
      if (newValue) {
        selectedSemester.value = '';
        error.value = null;
      }
    };

    return {
      studentYearLevel,
      selectedYear,
      selectedSemester,
      academicGoals,
      personalGoals,
      financialGoals,
      loading,
      loadingYearLevel,
      error,
      completedPlans,
      availableYears,
      canSelectSemester2,
      isFormValid,
      getYearLevelText,
      selectSemester,
      submitPlan,
      watchSelectedYear,
      isAlreadySubmitted,
      student4thYearAccess,
      hasClassAssignment
    };
  },
  watch: {
    selectedYear(newValue) {
      this.watchSelectedYear(newValue);
    }
  }
};
</script>

<style scoped>
.odyssey-plan {
  padding: 2rem;
}

.text-primary {
  color: #3B82F6;
}

.text-primary-dark {
  color: #2563EB;
}

.bg-primary {
  background-color: #3B82F6;
}

.bg-primary-dark {
  background-color: #2563EB;
}

.bg-primary-light {
  background-color: rgba(59, 130, 246, 0.1);
}

.focus\:ring-primary:focus {
  --tw-ring-color: #3B82F6;
}

.focus\:border-primary:focus {
  border-color: #3B82F6;
}
</style> 