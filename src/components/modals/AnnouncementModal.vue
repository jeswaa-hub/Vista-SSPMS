<template>
  <BaseModal 
    :is-open="isOpen"
    :title="modalTitle"
    confirm-text="Save"
    @close="close"
    @confirm="saveAnnouncement"
    size="lg"
  >
    <form @submit.prevent="saveAnnouncement">
      <div class="space-y-4">
        <BaseInput
          v-model="form.title"
          label="Title"
          placeholder="Enter announcement title"
          :error="errors.title"
          required
        />
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Content <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.content"
            rows="6"
            class="w-full p-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            :class="errors.content ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'"
            placeholder="Enter announcement content"
            required
          ></textarea>
          <p v-if="errors.content" class="mt-1 text-sm text-red-600">{{ errors.content }}</p>
        </div>

        <!-- Image Upload Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Image (Optional)
          </label>
          
          <!-- Existing Image Display -->
          <div v-if="form.existingImage && !form.removeImage" class="mb-3">
            <div class="relative inline-block">
              <img 
                :src="getImageUrl(form.existingImage)" 
                alt="Current announcement image"
                class="max-w-xs max-h-32 object-cover rounded-md border border-gray-300"
              />
              <button
                type="button"
                @click="removeExistingImage"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
            <p class="text-sm text-gray-500 mt-1">Current image</p>
          </div>
          
          <!-- File Input -->
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            @change="handleImageChange"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <p v-if="errors.image" class="mt-1 text-sm text-red-600">{{ errors.image }}</p>
          <p class="text-sm text-gray-500 mt-1">Accepted formats: JPG, PNG, GIF (Max 5MB)</p>
          
          <!-- Image Preview -->
          <div v-if="imagePreview" class="mt-3">
            <img 
              :src="imagePreview" 
              alt="Image preview"
              class="max-w-xs max-h-32 object-cover rounded-md border border-gray-300"
            />
            <p class="text-sm text-gray-500 mt-1">New image preview</p>
          </div>
        </div>
        
        <BaseSelect
          v-model="form.targetAudience"
          label="Target Audience"
          :error="errors.targetAudience"
          required
          @change="handleAudienceChange"
        >
          <option value="all">Everyone</option>
          <option value="advisers">Advisers Only</option>
          <option value="students">Students Only</option>
        </BaseSelect>

        <!-- Class Selection for Students -->
        <div v-if="form.targetAudience === 'students'" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Target Classes (Optional)
          </label>
          <p class="text-sm text-gray-500">Leave empty to send to all student classes</p>
          
          <div v-if="loadingClasses" class="flex items-center justify-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            <span class="text-sm text-gray-500">Loading classes...</span>
          </div>
          
          <div v-else-if="availableClasses.length > 0" class="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
            <div v-for="classItem in availableClasses" :key="classItem._id" class="flex items-center p-2 hover:bg-gray-50">
              <input
                :id="`class-${classItem._id}`"
                v-model="form.targetClasses"
                :value="classItem._id"
                type="checkbox"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-3"
              />
              <label :for="`class-${classItem._id}`" class="text-sm text-gray-700 cursor-pointer flex-1">
                {{ classItem.yearLevel }} Year - {{ classItem.section }} ({{ classItem.major }})
              </label>
            </div>
          </div>
          
          <div v-else class="text-sm text-gray-500 py-2">
            No active classes found
          </div>
        </div>
        
        <div class="flex items-center">
          <input
            id="isPinned"
            v-model="form.isPinned"
            type="checkbox"
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label for="isPinned" class="ml-2 block text-sm text-gray-700">
            Pin this announcement
          </label>
        </div>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import { announcementService } from '../../services/announcementService'
import notificationService from '../../services/notification'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  announcement: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const form = ref({
  title: '',
  content: '',
  targetAudience: 'all',
  targetClasses: [],
  isPinned: false,
  image: null,
  existingImage: null,
  removeImage: false
})

const errors = ref({
  title: '',
  content: '',
  targetAudience: '',
  image: ''
})

const imageInput = ref(null)
const imagePreview = ref(null)
const availableClasses = ref([])
const loadingClasses = ref(false)

const isEditMode = computed(() => !!props.announcement?._id)
const modalTitle = computed(() => isEditMode.value ? 'Edit Announcement' : 'Add New Announcement')

// Initialize form when announcement changes
watch(() => props.announcement, (newAnnouncement) => {
  if (newAnnouncement) {
    form.value = {
      title: newAnnouncement.title || '',
      content: newAnnouncement.content || '',
      targetAudience: newAnnouncement.targetAudience || 'all',
      targetClasses: newAnnouncement.targetClasses?.map(c => c._id || c) || [],
      isPinned: newAnnouncement.isPinned || false,
      image: null,
      existingImage: newAnnouncement.image || null,
      removeImage: false
    }
    
    // Load classes if targeting students
    if (newAnnouncement.targetAudience === 'students') {
      loadActiveClasses()
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch modal open state
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && !props.announcement) {
    resetForm()
  }
})

function resetForm() {
  form.value = {
    title: '',
    content: '',
    targetAudience: 'all',
    targetClasses: [],
    isPinned: false,
    image: null,
    existingImage: null,
    removeImage: false
  }
  errors.value = {
    title: '',
    content: '',
    targetAudience: '',
    image: ''
  }
  imagePreview.value = null
  
  // Reset file input
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

async function loadActiveClasses() {
  try {
    loadingClasses.value = true
    console.log('Loading active classes...')
    
    const classes = await announcementService.getActiveClasses()
    availableClasses.value = classes
    
    console.log(`Loaded ${classes.length} active classes:`, classes)
  } catch (error) {
    console.error('Error loading classes:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    notificationService.error('Failed to load classes: ' + (error.response?.data?.message || error.message))
  } finally {
    loadingClasses.value = false
  }
}

function handleAudienceChange() {
  // Clear target classes when changing audience
  form.value.targetClasses = []
  
  // Load classes if switching to students
  if (form.value.targetAudience === 'students') {
    loadActiveClasses()
  }
}

function handleImageChange(event) {
  const file = event.target.files[0]
  
  if (!file) {
    form.value.image = null
    imagePreview.value = null
    return
  }
  
  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.value.image = 'Image size must be less than 5MB'
    event.target.value = ''
    return
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    errors.value.image = 'Only JPEG, PNG, and GIF images are allowed'
    event.target.value = ''
    return
  }
  
  errors.value.image = ''
  form.value.image = file
  form.value.removeImage = false
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeExistingImage() {
  form.value.removeImage = true
  form.value.existingImage = null
}

function getImageUrl(filename) {
  return announcementService.getImageUrl(filename)
}

function validateForm() {
  let isValid = true
  errors.value = {
    title: '',
    content: '',
    targetAudience: '',
    image: ''
  }

  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required'
    isValid = false
  }

  if (!form.value.content.trim()) {
    errors.value.content = 'Content is required'
    isValid = false
  }

  if (!form.value.targetAudience) {
    errors.value.targetAudience = 'Target audience is required'
    isValid = false
  }

  return isValid
}

async function saveAnnouncement() {
  if (!validateForm()) return

  try {
    const submissionData = {
      title: form.value.title,
      content: form.value.content,
      targetAudience: form.value.targetAudience,
      targetClasses: form.value.targetClasses,
      isPinned: form.value.isPinned,
      image: form.value.image,
      removeImage: form.value.removeImage
    }

    console.log('Submitting announcement data:', {
      ...submissionData,
      image: submissionData.image ? `File: ${submissionData.image.name}` : 'No image'
    })

    if (isEditMode.value) {
      const result = await announcementService.update(props.announcement._id, submissionData)
      console.log('Update result:', result)
    } else {
      const result = await announcementService.create(submissionData)
      console.log('Create result:', result)
    }
    
    emit('saved')
    close()
  } catch (error) {
    console.error('Error saving announcement:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    
    // Handle validation errors from the server
    if (error.response && error.response.data && error.response.data.errors) {
      errors.value = { ...errors.value, ...error.response.data.errors }
      notificationService.error('Please correct the errors in the form')
    } else {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save announcement. Please try again.'
      notificationService.error(errorMessage)
    }
  }
}

function close() {
  resetForm()
  emit('close')
}
</script> 