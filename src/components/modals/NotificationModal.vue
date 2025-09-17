<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h2 class="text-xl font-semibold text-gray-800">Notification Details</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div v-if="notification" class="space-y-6">
        <!-- Notification Header -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center space-x-3 mb-2">
            <div :class="[
              'w-3 h-3 rounded-full',
              getNotificationColor(notification.type)
            ]"></div>
            <h3 class="text-lg font-medium text-gray-900">{{ notification.title }}</h3>
            <span :class="[
              'px-2 py-1 text-xs rounded-full font-medium',
              getPriorityClass(notification.priority)
            ]">
              {{ notification.priority }}
            </span>
          </div>
          
          <p class="text-gray-700 mb-3">{{ notification.message }}</p>
          
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <span>{{ formatDate(notification.createdAt) }}</span>
            <span v-if="notification.requesterInfo">
              From: <span class="font-medium">{{ notification.requesterInfo.name }}</span>
            </span>
          </div>
        </div>

        <!-- Drop Request Details (if applicable) -->
        <div v-if="notification.type === 'drop_request'" class="space-y-4">
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 class="text-md font-medium text-orange-800 mb-3">Student Drop Request</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="text-sm font-medium text-gray-700">Student</label>
                <p class="text-sm text-gray-900 mt-1">{{ notification.studentInfo?.name || 'Unknown' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">Student ID</label>
                <p class="text-sm text-gray-900 mt-1">{{ notification.studentInfo?.idNumber || 'Unknown' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">Class</label>
                <p class="text-sm text-gray-900 mt-1">{{ notification.classInfo?.name || 'Unknown' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">Requested By</label>
                <p class="text-sm text-gray-900 mt-1">{{ notification.requesterInfo?.name || 'Unknown' }}</p>
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-700">Reason</label>
              <p class="text-sm text-gray-900 mt-1 p-3 bg-white rounded border">
                {{ notification.reason || 'No reason provided' }}
              </p>
            </div>
          </div>

          <!-- Action Buttons for Drop Requests -->
          <div v-if="notification.status === 'pending'" class="flex justify-end space-x-3">
            <button
              @click="showRejectModal = true"
              class="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Reject Request
            </button>
            <button
              @click="$emit('approve', notification)"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              Approve & Drop Student
            </button>
          </div>
          
          <!-- Status Display for Processed Requests -->
          <div v-else class="text-center py-4">
            <span :class="[
              'px-4 py-2 rounded-full text-sm font-medium',
              notification.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            ]">
              {{ notification.status === 'approved' ? 'Request Approved' : 'Request Rejected' }}
            </span>
          </div>
        </div>

        <!-- System Notification Details -->
        <div v-else-if="notification.type === 'system'" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="text-md font-medium text-blue-800 mb-2">System Notification</h4>
          <p class="text-sm text-blue-700">{{ notification.details || 'No additional details available.' }}</p>
        </div>

        <!-- General Information -->
        <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 class="text-md font-medium text-gray-800 mb-2">Information</h4>
          <p class="text-sm text-gray-700">{{ notification.details || 'No additional details available.' }}</p>
        </div>
      </div>
      
      <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
        <button
          v-if="!notification?.read"
          @click="$emit('markRead', notification)"
          class="px-4 py-2 mr-3 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Mark as Read
        </button>
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-60 flex justify-center items-center">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Reject Drop Request</h3>
          <button @click="showRejectModal = false" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection</label>
            <textarea
              v-model="rejectionReason"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
              placeholder="Please provide a reason for rejecting this drop request..."
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="showRejectModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="submitRejection" 
              :disabled="!rejectionReason.trim()"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject Request
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  notification: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'approve', 'reject', 'markRead'])

const showRejectModal = ref(false)
const rejectionReason = ref('')

function getNotificationColor(type) {
  switch (type) {
    case 'drop_request': return 'bg-orange-500'
    case 'system': return 'bg-blue-500'
    case 'info': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

function getPriorityClass(priority) {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(date) {
  if (!date) return 'Unknown date'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function submitRejection() {
  if (!rejectionReason.value.trim()) return
  
  emit('reject', props.notification, rejectionReason.value.trim())
  showRejectModal.value = false
  rejectionReason.value = ''
}
</script>

<style scoped>
.z-60 {
  z-index: 60;
}
</style>
