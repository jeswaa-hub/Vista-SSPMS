<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 relative overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute -top-20 -right-20 w-40 h-40 bg-blue-100 rounded-full opacity-50"></div>
      <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-100 rounded-full opacity-50"></div>
      
      <!-- Content with relative positioning to appear above the decorative elements -->
      <div class="relative">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-800">Reset Password</h1>
          <div class="h-1 w-16 bg-blue-500 mx-auto mt-2 rounded-full"></div>
          <p class="mt-3 text-sm text-gray-600">
            <span v-if="step === 1">Enter your email to receive a verification code</span>
            <span v-else-if="step === 2">Enter the 6-digit code sent to your email</span>
            <span v-else>Create a new password for your account</span>
          </p>
        </div>
        
        <!-- Alert for errors and success -->
        <div v-if="message.text" :class="[
          'p-3 mb-4 rounded-md text-sm',
          message.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 
          'bg-green-50 text-green-700 border-l-4 border-green-500'
        ]">
          {{ message.text }}
        </div>
        
        <!-- Step 1: Request OTP -->
        <form v-if="step === 1" @submit.prevent="requestOTP" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                v-model="email"
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                class="pl-10 py-2.5 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                :class="{'border-red-300': errors.email, 'border-gray-300': !errors.email}"
              />
            </div>
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>
          
          <div>
            <button
              type="submit"
              class="w-full py-2.5 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
              <span v-else>Send Verification Code</span>
            </button>
          </div>
        </form>
        
        <!-- Step 2: Verify OTP -->
        <form v-if="step === 2" @submit.prevent="verifyOTP" class="space-y-6">
          <div>
            <label for="otp" class="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
            <div class="flex justify-center space-x-2">
              <input
                v-for="(digit, index) in 6"
                :key="index"
                v-model="otpDigits[index]"
                type="text"
                maxlength="1"
                class="w-10 h-12 text-center rounded-lg border text-lg font-semibold focus:ring-blue-500 focus:border-blue-500"
                :class="{'border-red-300': errors.otp, 'border-gray-300': !errors.otp}"
                @input="handleOtpInput($event, index)"
                @keydown="handleKeyDown($event, index)"
                ref="otpInputs"
              />
            </div>
            <p v-if="errors.otp" class="mt-1 text-sm text-red-600 text-center">{{ errors.otp }}</p>
            <p class="mt-4 text-sm text-center text-gray-600">
              Didn't receive a code? 
              <button 
                type="button" 
                class="text-blue-600 hover:text-blue-500 font-medium"
                @click="requestOTP"
                :disabled="resendCountdown > 0 || loading"
              >
                {{ resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code' }}
              </button>
            </p>
          </div>
          
          <div>
            <button
              type="submit"
              class="w-full py-2.5 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              :disabled="loading || !isOtpComplete"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
              <span v-else>Verify Code</span>
            </button>
          </div>
        </form>
        
        <!-- Step 3: Reset Password -->
        <form v-if="step === 3" @submit.prevent="resetPassword" class="space-y-6">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                v-model="password"
                id="password"
                type="password"
                required
                placeholder="••••••••"
                class="pl-10 py-2.5 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                :class="{'border-red-300': errors.password, 'border-gray-300': !errors.password}"
              />
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                v-model="confirmPassword"
                id="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                class="pl-10 py-2.5 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                :class="{'border-red-300': errors.confirmPassword, 'border-gray-300': !errors.confirmPassword}"
              />
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>
          
          <div>
            <button
              type="submit"
              class="w-full py-2.5 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
              <span v-else>Reset Password</span>
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <router-link to="/login" class="text-sm font-medium text-blue-600 hover:text-blue-500">
            Back to Login
          </router-link>
        </div>
        
        <div class="mt-8 text-center text-xs text-gray-500">
          © 2023 PHINMA Education. All rights reserved.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';

const router = useRouter();
const email = ref('');
const otpDigits = ref(['', '', '', '', '', '']);
const password = ref('');
const confirmPassword = ref('');
const step = ref(1);
const loading = ref(false);
const errors = ref({});
const message = ref({ text: '', type: '' });
const resendCountdown = ref(0);
const otpInputs = ref([]);

// Computed properties
const isOtpComplete = computed(() => {
  return otpDigits.value.every(digit => digit !== '');
});

const otp = computed(() => {
  return otpDigits.value.join('');
});

// Reset form errors
const resetErrors = () => {
  errors.value = {};
  message.value = { text: '', type: '' };
};

// Request OTP function
const requestOTP = async () => {
  resetErrors();
  
  // Validate email
  if (!email.value) {
    errors.value.email = 'Email address is required';
    return;
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email address';
    return;
  }
  
  try {
    loading.value = true;
    
    // Call the API to request OTP
    const response = await authService.requestPasswordReset(email.value);
    
    // If successful, move to next step
    message.value = { text: 'A verification code has been sent to your email', type: 'success' };
    step.value = 2;
    
    // Start countdown for resend
    startResendCountdown();
    
    // Focus on first OTP input after render
    nextTick(() => {
      if (otpInputs.value[0]) {
        otpInputs.value[0].focus();
      }
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    const errorMessage = error.response?.data?.message || 'Failed to send verification code. Please try again.';
    message.value = { text: errorMessage, type: 'error' };
  } finally {
    loading.value = false;
  }
};

// Start the resend countdown
const startResendCountdown = () => {
  resendCountdown.value = 60; // 60 seconds
  const timer = setInterval(() => {
    resendCountdown.value--;
    if (resendCountdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

// Handle OTP input
const handleOtpInput = (event, index) => {
  const value = event.target.value;
  
  // Only allow digits
  if (/^\d*$/.test(value)) {
    otpDigits.value[index] = value;
    
    // Auto-focus next input if value is filled
    if (value && index < otpInputs.value.length - 1) {
      otpInputs.value[index + 1].focus();
    }
  } else {
    // Clear non-digit input
    otpDigits.value[index] = '';
  }
};

// Handle keydown for OTP inputs
const handleKeyDown = (event, index) => {
  // Handle backspace
  if (event.key === 'Backspace') {
    if (!otpDigits.value[index] && index > 0) {
      // If current input is empty and backspace is pressed, focus previous input
      otpInputs.value[index - 1].focus();
    }
  }
};

// Verify OTP
const verifyOTP = async () => {
  resetErrors();
  
  // Validate OTP
  if (!isOtpComplete.value) {
    errors.value.otp = 'Please enter the 6-digit verification code';
    return;
  }
  
  // Move to password reset step
  // In a real app, you might verify the OTP with the backend first
  try {
    loading.value = true;
    
    // Simulate OTP verification (in a real app, verify with backend)
    // For now, we'll just proceed to the next step
    step.value = 3;
    message.value = { text: 'Verification successful. Please set your new password.', type: 'success' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    errors.value.otp = 'Invalid verification code. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Reset password
const resetPassword = async () => {
  resetErrors();
  
  // Validate password
  if (!password.value) {
    errors.value.password = 'Password is required';
    return;
  }
  
  if (password.value.length < 8) {
    errors.value.password = 'Password must be at least 8 characters long';
    return;
  }
  
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match';
    return;
  }
  
  try {
    loading.value = true;
    
    // Call API to reset password with OTP
    await authService.verifyOtpAndResetPassword({
      email: email.value,
      otp: otp.value,
      newPassword: password.value
    });
    
    // Show success message
    notificationService.showSuccess('Password reset successful. Please login with your new password.');
    
    // Redirect to login page
    router.push('/login');
  } catch (error) {
    console.error('Error resetting password:', error);
    const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
    message.value = { text: errorMessage, type: 'error' };
  } finally {
    loading.value = false;
  }
};

// When component mounts
onMounted(() => {
  // Initialize if needed
});
</script>

<style scoped>
/* Add a subtle shadow to the form container */
.shadow-lg {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Style for input fields */
input {
  @apply bg-gray-50;
  border-width: 1px;
}

input:focus {
  @apply bg-white;
  outline: none;
}
</style> 