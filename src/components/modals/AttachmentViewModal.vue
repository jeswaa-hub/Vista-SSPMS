<template>
                 <BaseModal 
                 :isOpen="isOpen" 
                 @close="$emit('close')"
                 :title="`Attachments (${attachmentCount})`"
                 size="lg"
               >
    <div class="space-y-4">
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Loading attachments...</span>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>

                         <!-- Attachment Display -->
                   <div v-else-if="attachmentList.length > 0" class="space-y-4">
                     
                     <!-- Image Gallery (for images only) -->
                     <div v-if="imageAttachments.length > 0" class="bg-gray-50 rounded-lg p-4">
                       <h4 class="text-sm font-medium text-gray-700 mb-4 flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                         Images ({{ imageAttachments.length }})
                       </h4>
                       
                                               <!-- Current Image Display -->
                        <div class="relative bg-white rounded-lg border border-gray-200 mb-4">
                          <div class="flex items-center justify-center p-4" style="min-height: 300px;">
                            <img 
                              v-if="currentImageUrl"
                              :src="currentImageUrl" 
                              :alt="currentImageAttachment?.name"
                              class="max-w-full max-h-80 object-contain rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                              @click="maximizeImage"
                              title="Click to view full size"
                            />
                            <div v-else class="text-gray-500">Loading image...</div>
                          </div>
                         
                         <!-- Navigation Buttons (only show if more than 1 image) -->
                         <div v-if="imageAttachments.length > 1" class="absolute inset-y-0 left-0 flex items-center">
                           <button 
                             @click="previousImage"
                             class="ml-2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                             </svg>
                           </button>
                         </div>
                         
                         <div v-if="imageAttachments.length > 1" class="absolute inset-y-0 right-0 flex items-center">
                           <button 
                             @click="nextImage"
                             class="mr-2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                             </svg>
                           </button>
                         </div>
                       </div>
                       
                       <!-- Image Navigation Dots (only show if more than 1 image) -->
                       <div v-if="imageAttachments.length > 1" class="flex justify-center space-x-2 mb-4">
                         <button
                           v-for="(image, index) in imageAttachments"
                           :key="index"
                           @click="selectImage(index)"
                           class="w-3 h-3 rounded-full transition-colors"
                           :class="currentImageIndex === index ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'"
                         ></button>
                       </div>
                       
                       <!-- Current Image Info -->
                       <div v-if="currentImageAttachment" class="text-center text-sm text-gray-600">
                         <p class="font-medium">{{ currentImageAttachment.name }}</p>
                         <p>{{ formatFileSize(currentImageAttachment.size) }}</p>
                         <p v-if="imageAttachments.length > 1" class="text-xs mt-1">
                           Image {{ currentImageIndex + 1 }} of {{ imageAttachments.length }}
                         </p>
                       </div>
                     </div>
                     
                     <!-- Document List (for non-image files) -->
                     <div v-if="documentAttachments.length > 0" class="bg-gray-50 rounded-lg p-4">
                       <h4 class="text-sm font-medium text-gray-700 mb-4 flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                         Documents ({{ documentAttachments.length }})
                       </h4>
                       
                       <div class="space-y-3">
                         <div 
                           v-for="(attachment, index) in documentAttachments"
                           :key="index"
                           class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                         >
                           <div class="flex items-center space-x-3 flex-1 min-w-0">
                             <!-- File type icon -->
                             <div class="flex-shrink-0">
                               <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                               </svg>
                             </div>
                             
                             <!-- File info -->
                             <div class="flex-1 min-w-0">
                               <p class="text-sm font-medium text-gray-900 truncate">
                                 {{ attachment.name }}
                               </p>
                               <p class="text-xs text-gray-500">
                                 Document • {{ formatFileSize(attachment.size) }}
                               </p>
                             </div>
                           </div>
                           
                           <!-- Download button -->
                           <div class="flex-shrink-0">
                             <button 
                               @click="downloadSpecificAttachment(attachment.originalIndex)"
                               class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                             >
                               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                               </svg>
                               Download
                             </button>
                           </div>
                         </div>
                       </div>
                     </div>

        <!-- Adviser rejection controls -->
        <div v-if="isAdviser" class="border-t border-gray-200 pt-4">
          <div v-if="!showRejectForm" class="flex justify-end">
            <button 
              @click="showRejectForm = true"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject All {{ attachmentList.length }} Attachments
            </button>
          </div>

          <!-- Rejection form -->
          <div v-if="showRejectForm" class="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
            <div class="flex items-start space-x-3">
              <svg class="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div class="flex-1">
                <h4 class="text-lg font-medium text-red-800">Reject All Attachments</h4>
                <p class="text-sm text-red-700 mt-1">This will remove all {{ attachmentList.length }} attachments and notify the student.</p>
              </div>
            </div>
            
            <div>
              <label for="rejection-reason" class="block text-sm font-medium text-red-800 mb-2">
                Reason for rejection
              </label>
              <textarea
                id="rejection-reason"
                v-model="rejectionReason"
                placeholder="Please explain why you are rejecting these attachments..."
                rows="3"
                class="w-full px-3 py-2 border border-red-300 rounded-md text-sm placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button 
                @click="cancelReject"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button 
                @click="confirmReject" 
                :disabled="rejecting || !rejectionReason.trim()"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="rejecting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-if="rejecting">Rejecting...</span>
                <span v-else>Reject All {{ attachmentList.length }} Attachments</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No attachments state -->
      <div v-else class="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
        <p class="text-sm text-gray-500">No attachments found</p>
                         </div>
                 </div>
               </BaseModal>
               
               <!-- Fullscreen Image Overlay (Outside Modal) -->
               <div 
                 v-if="isImageMaximized" 
                 class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center"
                 style="z-index: 9999;"
                 @click="closeMaximizedImage"
                 @keydown.esc="closeMaximizedImage"
                 tabindex="0"
               >
                 <div class="relative w-full h-full flex items-center justify-center p-2">
                   <!-- Close button -->
                   <button 
                     @click="closeMaximizedImage"
                     class="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all"
                     style="z-index: 10000;"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                   
                   <!-- Maximized image -->
                   <img 
                     v-if="currentImageUrl"
                     :src="currentImageUrl" 
                     :alt="currentImageAttachment?.name"
                     class="shadow-2xl"
                     @click.stop
                     style="max-height: 95vh; max-width: 95vw; height: auto; width: auto;"
                   />
                   
                   <!-- Navigation buttons for fullscreen (only show if more than 1 image) -->
                   <div v-if="imageAttachments.length > 1" class="absolute inset-y-0 left-0 flex items-center">
                     <button 
                       @click.stop="previousImage"
                       class="ml-4 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                       </svg>
                     </button>
                   </div>
                   
                   <div v-if="imageAttachments.length > 1" class="absolute inset-y-0 right-0 flex items-center">
                     <button 
                       @click.stop="nextImage"
                       class="mr-4 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                       </svg>
                     </button>
                   </div>
                 </div>
               </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import BaseModal from '../ui/BaseModal.vue'
import api from '../../services/api'
import { sessionService } from '../../services/sessionService'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'attachment-rejected'])

// Reactive state
const loading = ref(false)
const error = ref(null)
const attachmentCount = ref(0)
const attachmentList = ref([])

// Image gallery state
const currentImageIndex = ref(0)
const currentImageUrl = ref(null)
const imageUrls = ref([])
const isImageMaximized = ref(false)

// Rejection functionality
const showRejectForm = ref(false)
const rejectionReason = ref('')
const rejecting = ref(false)

// Auth
const authStore = useAuthStore()
const isAdviser = computed(() => authStore.user?.role === 'adviser' || authStore.user?.role === 'admin')

// Computed properties for separating images and documents
const imageAttachments = computed(() => 
  attachmentList.value.filter(attachment => attachment.isImage)
)

const documentAttachments = computed(() => 
  attachmentList.value.filter((attachment, originalIndex) => {
    if (!attachment.isImage) {
      attachment.originalIndex = originalIndex // Store original index for download
      return true
    }
    return false
  })
)

const currentImageAttachment = computed(() => 
  imageAttachments.value[currentImageIndex.value] || null
)

// Watch for modal opening
watch(() => props.isOpen, (newValue) => {
  if (newValue && props.sessionId) {
    loadAttachments()
    // Add keyboard event listener for ESC key
    document.addEventListener('keydown', handleKeydown)
  } else {
    resetState()
    // Remove keyboard event listener
    document.removeEventListener('keydown', handleKeydown)
  }
})

// Handle keyboard events
function handleKeydown(event) {
  if (event.key === 'Escape') {
    if (isImageMaximized.value) {
      closeMaximizedImage()
    }
  } else if (isImageMaximized.value && imageAttachments.value.length > 1) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      nextImage()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      previousImage()
    }
  }
}

// Methods
async function loadAttachments() {
  if (!props.sessionId) return
  
  loading.value = true
  error.value = null
  
  try {
    // Try to detect total number of attachments by attempting to load multiple indices
    let totalCount = 1
    
    // Try loading indices 0, 1, 2, 3, 4 to detect how many attachments exist
    for (let i = 0; i < 5; i++) {
      try {
        const testResponse = await api.get(`/sessions/${props.sessionId}/attachment?index=${i}`, {
          responseType: 'blob'
        })
        if (testResponse.status === 200) {
          totalCount = i + 1
        }
      } catch {
        // If we get an error, this index doesn't exist, so stop counting
        break
      }
    }
    
    attachmentCount.value = totalCount
    console.log(`Found ${attachmentCount.value} attachments for session ${props.sessionId}`)
    
    // Load all attachments
    await loadAttachmentList()
    
  } catch (err) {
    console.error('Error loading attachments:', err)
    error.value = err.response?.data?.message || 'Failed to load attachments'
  } finally {
    loading.value = false
  }
}

async function loadAttachmentList() {
  const attachments = []
  const urls = []
  
  for (let i = 0; i < attachmentCount.value; i++) {
    try {
      const response = await api.get(`/sessions/${props.sessionId}/attachment?index=${i}`, {
        responseType: 'blob'
      })
      
      const blob = response.data
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition']
      let fileName = `attachment_${i + 1}`
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = contentDisposition.match(/filename="([^"]+)"/)
        if (matches) {
          fileName = matches[1]
        }
      }
      
      // Check if it's an image
      const isImageType = blob.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName)
      
      // Create object URL for images
      let imageUrl = null
      if (isImageType) {
        imageUrl = URL.createObjectURL(blob)
        urls.push(imageUrl)
      }
      
      attachments.push({
        name: fileName,
        index: i,
        type: blob.type,
        size: blob.size,
        isImage: isImageType,
        url: imageUrl
      })
    } catch (err) {
      console.warn(`Failed to load attachment ${i}:`, err)
    }
  }
  
  console.log(`Loaded ${attachments.length} attachments:`, attachments)
  attachmentList.value = attachments
  imageUrls.value = urls
  
  // Set first image as current if images exist
  if (urls.length > 0) {
    currentImageIndex.value = 0
    currentImageUrl.value = urls[0]
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function downloadSpecificAttachment(index) {
  try {
    const response = await api.get(`/sessions/${props.sessionId}/attachment?index=${index}`, {
      responseType: 'blob'
    })
    
    const blob = response.data
    const contentDisposition = response.headers['content-disposition']
    let fileName = `attachment_${index + 1}`
    if (contentDisposition && contentDisposition.includes('filename=')) {
      const matches = contentDisposition.match(/filename="([^"]+)"/)
      if (matches) {
        fileName = matches[1]
      }
    }
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error downloading attachment:', err)
  }
}

function cancelReject() {
  showRejectForm.value = false
  rejectionReason.value = ''
}

async function confirmReject() {
  if (!rejectionReason.value.trim()) return
  
  try {
    rejecting.value = true
    
    await sessionService.rejectAttachment(props.sessionId, rejectionReason.value)
    
    showRejectForm.value = false
    rejectionReason.value = ''
    
    // Emit event to parent component
    emit('attachment-rejected')
    
    // Close modal
    emit('close')
    
  } catch (error) {
    console.error('Error rejecting attachment:', error)
  } finally {
    rejecting.value = false
  }
}

// Gallery navigation methods
function nextImage() {
  if (currentImageIndex.value < imageAttachments.value.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0 // Loop back to first image
  }
  currentImageUrl.value = imageAttachments.value[currentImageIndex.value]?.url
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = imageAttachments.value.length - 1 // Loop to last image
  }
  currentImageUrl.value = imageAttachments.value[currentImageIndex.value]?.url
}

function selectImage(index) {
  currentImageIndex.value = index
  currentImageUrl.value = imageAttachments.value[index]?.url
}

function maximizeImage() {
  isImageMaximized.value = true
  // Focus the overlay for keyboard events
  document.body.style.overflow = 'hidden' // Prevent background scrolling
}

function closeMaximizedImage() {
  isImageMaximized.value = false
  document.body.style.overflow = '' // Restore scrolling
}

function resetState() {
  loading.value = false
  error.value = null
  attachmentCount.value = 0
  attachmentList.value = []
  currentImageIndex.value = 0
  currentImageUrl.value = null
  imageUrls.value = []
  isImageMaximized.value = false
  showRejectForm.value = false
  rejectionReason.value = ''
  rejecting.value = false
  
  // Restore body overflow
  document.body.style.overflow = ''
  
  // Clean up object URLs to prevent memory leaks
  imageUrls.value.forEach(url => {
    if (url) URL.revokeObjectURL(url)
  })
}
</script>

<style scoped>
.transition-colors {
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out;
}
</style> 