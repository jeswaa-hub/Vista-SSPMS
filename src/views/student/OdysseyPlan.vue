<template>
  <div class="odyssey-plan">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Title -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary mb-2">Odyssey Plan</h1>
        <p class="text-gray-600">Create your life plan for the semester</p>
      </div>

      <!-- Year and Semester Selection -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <!-- Year Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <select 
              v-model="selectedYear" 
              class="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              :disabled="loading"
            >
              <option value="">Select Year</option>
              <option v-for="year in 4" :key="year" :value="year">
                {{ year }}st Year
              </option>
            </select>
          </div>

          <!-- Semester Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select 
              v-model="selectedSemester" 
              class="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              :disabled="loading || !selectedYear"
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
            <p v-if="selectedSemester === '2' && !canSelectSemester2" class="text-red-500 text-sm mt-1">
              You must complete Semester 1 first
            </p>
          </div>
        </div>
      </div>

      <!-- Plan Form -->
      <div v-if="selectedYear && selectedSemester" class="bg-white rounded-lg shadow-md p-6">
        <form @submit.prevent="submitPlan">
          <!-- Academic Goals -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-primary mb-4">Academic Goals</h3>
            <div v-for="(goal, index) in academicGoals" :key="'academic-' + index" class="mb-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Goal {{ index + 1 }}
                  </label>
                  <input
                    v-model="goal.description"
                    type="text"
                    class="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    :placeholder="'Enter your academic goal ' + (index + 1)"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Steps to Achieve
                  </label>
                  <input
                    v-model="goal.steps[0].description"
                    type="text"
                    class="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter steps to achieve this goal"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Goals -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-primary mb-4">Personal Goals</h3>
            <div v-for="(goal, index) in personalGoals" :key="'personal-' + index" class="mb-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Goal {{ index + 1 }}
                  </label>
                  <input
                    v-model="goal.description"
                    type="text"
                    class="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    :placeholder="'Enter your personal goal ' + (index + 1)"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Steps to Achieve
                  </label>
                  <input
                    v-model="goal.steps[0].description"
                    type="text"
                    class="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter steps to achieve this goal"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Goals -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-primary mb-4">Financial Goals</h3>
            <div v-for="(goal, index) in financialGoals" :key="'financial-' + index" class="mb-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Goal {{ index + 1 }}
                  </label>
                  <input
                    v-model="goal.description"
                    type="text"
                    class="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    :placeholder="'Enter your financial goal ' + (index + 1)"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Steps to Achieve
                  </label>
                  <input
                    v-model="goal.steps[0].description"
                    type="text"
                    class="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter steps to achieve this goal"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="text-center">
            <button
              type="submit"
              class="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
              :disabled="loading || !isFormValid"
            >
              {{ loading ? 'Submitting...' : 'Submit Plan' }}
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
import { notificationService } from '../../services/notificationService';

export default {
  name: 'OdysseyPlan',
  data() {
    return {
      selectedYear: '',
      selectedSemester: '',
      academicGoals: [
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] }
      ],
      personalGoals: [
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] }
      ],
      financialGoals: [
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] }
      ],
      loading: false,
      error: null,
      completedPlans: []
    };
  },
  computed: {
    canSelectSemester2() {
      if (!this.selectedYear) return false;
      return true;
    },
    isFormValid() {
      const allGoals = [
        ...this.academicGoals,
        ...this.personalGoals,
        ...this.financialGoals
      ];

      return allGoals.every(goal => 
        goal.description.trim() !== '' && 
        goal.steps[0].description.trim() !== ''
      );
    }
  },
  methods: {
    async fetchCompletedPlans() {
      try {
        // TODO: Replace with actual API call
        // const response = await axios.get('/api/odyssey-plans/completed');
        // this.completedPlans = response.data;
        this.completedPlans = [];
      } catch (error) {
        console.error('Error fetching completed plans:', error);
        this.error = 'Failed to fetch completed plans';
      }
    },
    async submitPlan() {
      if (!this.isFormValid) {
        this.error = 'Please fill in all required fields';
        return;
      }

      if (this.selectedSemester === '2' && !this.canSelectSemester2) {
        this.error = 'You must complete Semester 1 before submitting Semester 2';
        return;
      }

      try {
        this.loading = true;
        this.error = null;

        const planData = {
          year: parseInt(this.selectedYear),
          semester: parseInt(this.selectedSemester),
          academicGoals: this.academicGoals,
          personalGoals: this.personalGoals,
          financialGoals: this.financialGoals
        };

        // TODO: Replace with actual API call
        // await axios.post('/api/odyssey-plans', planData);
        
        // Reset form
        this.resetForm();
        
        // Show success message using notificationService
        notificationService.showSuccess('Plan submitted successfully');
      } catch (error) {
        console.error('Error submitting plan:', error);
        this.error = 'Failed to submit plan';
        notificationService.showError('Failed to submit plan');
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.selectedYear = '';
      this.selectedSemester = '';
      this.academicGoals = [
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] }
      ];
      this.personalGoals = [
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] }
      ];
      this.financialGoals = [
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] },
        { description: '', steps: [{ description: '' }] }
      ];
    }
  },
  async created() {
    await this.fetchCompletedPlans();
  },
  watch: {
    selectedYear() {
      this.selectedSemester = '';
    },
    selectedSemester(newValue) {
      if (newValue === '2' && !this.canSelectSemester2) {
        this.selectedSemester = '';
      }
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

.focus\:ring-primary:focus {
  --tw-ring-color: #3B82F6;
}

.focus\:border-primary:focus {
  border-color: #3B82F6;
}
</style> 