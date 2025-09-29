<template>
  <div 
    class="bg-gradient-to-b from-green-800 to-green-900 fixed h-full overflow-y-auto transition-all duration-500 ease-in-out z-30"
    :class="sidebarCollapsed ? 'w-24 rounded-r-3xl shadow-2xl' : 'w-80 rounded-r-2xl shadow-2xl'"
    style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05);"
  >
    <!-- Logo and title -->
    <div class="px-6 py-8 border-b border-green-700/30">
      <div class="flex items-center transition-all duration-500 ease-in-out" :class="sidebarCollapsed ? 'justify-center' : 'space-x-6'">
        <div class="flex-shrink-0">
          <!-- Clean white background for logo -->
          <div class="bg-white rounded-2xl p-3 shadow-lg">
            <img 
              src="/src/assets/18.png" 
              alt="PHINMA Araullo University" 
              :class="sidebarCollapsed ? 'w-8 h-8' : 'w-12 h-12'"
              class="object-contain rounded-lg"
            />
          </div>
        </div>
        <div v-if="!sidebarCollapsed" class="flex-1 transition-all duration-500 ease-in-out">
          <h1 class="text-2xl font-bold text-white tracking-wide">SSCMS</h1>
          <p class="text-sm text-green-200 font-medium">{{ userType }} Portal</p>
        </div>
      </div>
    </div>
    
    <!-- Navigation -->
    <nav class="px-4 py-6">
      <div class="space-y-2">
        <template v-for="item in navigationItems" :key="item.label">
          <!-- Single Link -->
          <router-link 
            v-if="!item.children"
            :to="item.path" 
            class="flex items-center px-4 py-4 text-base font-medium transition-all duration-300 ease-in-out group relative"
            :class="[
              sidebarCollapsed ? 'rounded-2xl justify-center' : 'rounded-xl',
              isActive(item.path) ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50 hover:text-white'
            ]"
            exact-active-class="bg-green-700 text-white"
            :title="sidebarCollapsed ? item.label : ''"
          >
            
            <!-- Icon -->
            <component 
              :is="getIconComponent(item.icon)" 
              class="transition-all duration-300"
              :class="sidebarCollapsed ? 'w-7 h-7' : 'w-6 h-6 mr-4'"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              stroke-width="1.5"
            />
            
            <span v-if="!sidebarCollapsed" class="font-medium transition-all duration-500 ease-in-out">{{ item.label }}</span>
          </router-link>
          
          <!-- Dropdown Section -->
          <div v-else class="relative">
            <button 
              @click="toggleSection(item.key)" 
              class="w-full flex items-center justify-between px-4 py-4 text-left text-base font-medium transition-all duration-300 group"
              :class="[
                sidebarCollapsed ? 'rounded-2xl justify-center' : 'rounded-xl',
                isSectionActive(item.key) ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50 hover:text-white'
              ]"
              :title="sidebarCollapsed ? item.label : ''"
            >
              <div class="flex items-center">
                
                <!-- Icon -->
                <component 
                  :is="getIconComponent(item.icon)" 
                  class="transition-all duration-300"
                  :class="sidebarCollapsed ? 'w-7 h-7' : 'w-6 h-6 mr-4'"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  stroke-width="1.5"
                />
                
                <span v-if="!sidebarCollapsed" class="font-medium transition-all duration-500 ease-in-out">{{ item.label }}</span>
                
                <svg 
                  v-if="!sidebarCollapsed" 
                  class="ml-auto w-4 h-4 transition-all duration-300" 
                  :class="openSections[item.key] ? 'rotate-180' : ''"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </button>
            
            <div v-if="(openSections[item.key] || sidebarCollapsed) && !sidebarCollapsed" class="ml-8 mt-2 space-y-2 transition-all duration-300">
              <router-link 
                v-for="child in item.children"
                :key="child.label"
                :to="child.path" 
                class="block px-4 py-3 rounded-lg text-base font-normal transition-all duration-300"
                :class="isActive(child.path) ? 'bg-green-700 text-white' : 'text-green-200 hover:bg-green-700/50 hover:text-white'"
              >
                {{ child.label }}
              </router-link>
            </div>
          </div>
        </template>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import * as HeroIcons from '@heroicons/vue/24/outline';

const props = defineProps({
  userType: {
    type: String,
    required: true,
  },
  navigationItems: {
    type: Array,
    required: true,
  },
  sidebarCollapsed: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['toggle-sidebar']);

const route = useRoute();

const openSections = ref({});

// Function to get icon component from string name
function getIconComponent(iconName) {
  return HeroIcons[iconName] || HeroIcons.QuestionMarkCircleIcon;
}

// Initialize openSections based on navigationItems
onMounted(() => {
  props.navigationItems.forEach(item => {
    if (item.children) {
      openSections.value[item.key] = false;
    }
  });
  checkAndExpandSection();
});

// Watch for route changes to automatically open relevant sections
watch(
  () => route.path,
  () => {
    checkAndExpandSection();
  }
);

function isActive(path) {
  // Special handling for dashboard routes - only match exact dashboard paths
  if (path === '/admin/dashboard' || path === '/adviser/dashboard' || path === '/student/dashboard') {
    return route.path === path;
  }
  return route.path === path || route.path.startsWith(`${path}/`);
}

function isSectionActive(sectionKey) {
  const section = props.navigationItems.find(item => item.key === sectionKey);
  if (!section || !section.children) return false;
  return section.children.some(child => isActive(child.path));
}

function toggleSection(sectionKey) {
  if (props.sidebarCollapsed) {
    // In collapsed mode, emit event to uncollapse sidebar and then open section
    emit('toggle-sidebar');
    // Wait for sidebar to expand, then open the section
    setTimeout(() => {
      const wasOpen = openSections.value[sectionKey];
      // Close all sections first
      Object.keys(openSections.value).forEach(key => {
        openSections.value[key] = false;
      });
      // Open the clicked section
      openSections.value[sectionKey] = !wasOpen;
    }, 300); // Wait for sidebar animation to complete
    return;
  }
  
  const wasOpen = openSections.value[sectionKey];
  
  // Close all sections first
  Object.keys(openSections.value).forEach(key => {
    openSections.value[key] = false;
  });
  
  // Toggle the clicked section (if it was closed, open it; if it was open, keep it closed)
  openSections.value[sectionKey] = !wasOpen;
}

function checkAndExpandSection() {
  props.navigationItems.forEach(item => {
    if (item.children) {
      openSections.value[item.key] = item.children.some(child => isActive(child.path));
    }
  });
}
</script>

<style scoped>
/* Custom scrollbar for sidebar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>