<template>
  <div class="animate-pulse">
    <!-- Table skeleton -->
    <div v-if="type === 'table'" class="space-y-4">
      <div class="h-4 bg-gray-200 rounded w-1/4"></div>
      <div class="space-y-2">
        <div v-for="i in rows" :key="i" class="flex space-x-4">
          <div class="h-10 bg-gray-200 rounded w-10"></div>
          <div class="flex-1 space-y-2 py-1">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card skeleton -->
    <div v-else-if="type === 'card'" class="border border-gray-200 rounded-lg p-6 space-y-4">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 rounded w-32"></div>
          <div class="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div class="space-y-2">
        <div class="h-3 bg-gray-200 rounded"></div>
        <div class="h-3 bg-gray-200 rounded w-5/6"></div>
        <div class="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>

    <!-- Dashboard stats skeleton -->
    <div v-else-if="type === 'stats'" class="grid grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
        <div class="h-6 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
      </div>
    </div>

    <!-- List skeleton -->
    <div v-else-if="type === 'list'" class="space-y-3">
      <div v-for="i in rows" :key="i" class="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
        <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div class="w-20 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Text skeleton -->
    <div v-else-if="type === 'text'" class="space-y-2">
      <div v-for="i in lines" :key="i" class="h-4 bg-gray-200 rounded"
           :class="{
             'w-full': i === 1,
             'w-5/6': i === 2,
             'w-4/6': i === 3,
             'w-3/6': i > 3
           }"></div>
    </div>

    <!-- Calendar skeleton -->
    <div v-else-if="type === 'calendar'" class="space-y-4">
      <div class="grid grid-cols-6 gap-px bg-gray-200 rounded-lg overflow-hidden">
        <div v-for="i in 6" :key="i" class="bg-gray-50 p-3 text-center">
          <div class="h-3 bg-gray-200 rounded w-8 mx-auto"></div>
        </div>
      </div>
      <div class="space-y-px">
        <div v-for="i in 8" :key="i" class="grid grid-cols-6 gap-px">
          <div class="bg-gray-50 p-2 border-r border-gray-200">
            <div class="h-3 bg-gray-200 rounded w-12"></div>
          </div>
          <div v-for="j in 5" :key="j" class="relative p-2 min-h-[40px] bg-white">
            <div v-if="Math.random() > 0.7" class="h-6 bg-blue-100 rounded text-xs p-1">
              <div class="h-2 bg-blue-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom content -->
    <div v-else class="space-y-3">
      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      <div class="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['table', 'card', 'stats', 'list', 'text', 'calendar', 'custom'].includes(value)
  },
  rows: {
    type: Number,
    default: 5
  },
  lines: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
