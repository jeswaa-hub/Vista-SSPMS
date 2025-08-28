<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <div 
      class="bg-blue-900 shadow-lg fixed h-full overflow-y-auto transition-all duration-300 z-30 rounded-r-2xl"
      :class="sidebarCollapsed ? 'w-16' : 'w-64'"
    >
      <!-- Logo and title -->
      <div class="px-4 py-6 border-b border-blue-800">
        <div class="flex items-center" :class="sidebarCollapsed ? 'justify-center' : 'space-x-4'">
          <!-- University Logo with enhanced styling -->
          <div class="flex-shrink-0 relative">
            <div v-if="!sidebarCollapsed" class="absolute inset-0 bg-white/10 rounded-full blur-lg"></div>
            <img 
              src="/src/assets/18.png" 
              alt="PHINMA Araullo University" 
              :class="sidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'"
              class="object-contain relative z-10 drop-shadow-lg transition-all duration-300"
            />
          </div>
          
          <div v-if="!sidebarCollapsed" class="flex-1">
            <h1 class="text-xl font-semibold text-white tracking-wide">SSCMS</h1>
            <p class="text-xs text-blue-200 font-medium">Adviser Portal</p>
          </div>
        </div>
      </div>
      
      <!-- Collapse Toggle -->
      <div class="px-4 py-3 border-b border-blue-800">
        <button 
          @click="toggleSidebar"
          class="w-full flex items-center justify-center p-2 text-blue-300 hover:text-white hover:bg-blue-800 rounded-md transition-colors"
          :class="sidebarCollapsed ? 'justify-center' : 'justify-start'"
        >
          <svg 
            class="w-5 h-5 transition-transform duration-300" 
            :class="sidebarCollapsed ? 'rotate-180' : ''"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            stroke-width="1.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
          </svg>
          <span v-if="!sidebarCollapsed" class="ml-2 text-sm">Collapse</span>
        </button>
      </div>
      
      <!-- Navigation -->
      <nav class="px-2 py-4">
        <div class="space-y-1">
          <!-- Password Change Required Alert -->
          <div v-if="authStore.passwordChangeRequired" class="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-md mb-4">
            <p class="font-medium">Password Change Required</p>
            <p class="text-sm">Please update your password before continuing.</p>
          </div>

          <!-- Dashboard -->
          <router-link 
            to="/adviser" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-all duration-300 ease-in-out group relative overflow-hidden transform hover:scale-105"
            :class="isActive('/adviser') ? 'bg-blue-800 text-white shadow-lg' : 'text-blue-300 hover:bg-blue-800 hover:text-white hover:shadow-md'"
            exact-active-class="bg-blue-800 text-white shadow-lg"
            :title="sidebarCollapsed ? 'Dashboard' : ''"
          >
            <!-- Active indicator bar -->
            <div 
              v-if="isActive('/adviser')" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-pulse"
            ></div>
            <!-- Hover effect background -->
            <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md"></div>
            <svg class="w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span v-if="!sidebarCollapsed" class="relative z-10 transition-all duration-300">Dashboard</span>
          </router-link>
          
          <!-- Profile -->
          <router-link 
            to="/adviser/profile" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-colors group"
            :class="isActive('/adviser/profile') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
            :title="sidebarCollapsed ? 'Profile' : ''"
          >
            <svg class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span v-if="!sidebarCollapsed">Profile</span>
          </router-link>
          
          <!-- Classes Group -->
          <div class="py-1">
            <button 
              @click="toggleClassesDropdown" 
              class="w-full flex items-center justify-between px-3 py-2 text-left rounded-md text-sm font-normal transition-colors group"
              :class="(isActive('/adviser/classes') || isActive('/adviser/classes-history')) ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
              :title="sidebarCollapsed ? 'Classes' : ''"
            >
              <div class="flex items-center">
                <svg class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443a55.381 55.381 0 015.25 2.882V15" />
                </svg>
                <span v-if="!sidebarCollapsed">Classes</span>
              </div>
              <svg 
                v-if="!sidebarCollapsed"
                class="w-4 h-4 transition-transform duration-200" 
                :class="classesDropdownOpen ? 'rotate-180' : ''"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            <div v-if="(classesDropdownOpen || sidebarCollapsed) && !sidebarCollapsed" class="ml-6 mt-1 space-y-1">
              <router-link 
                to="/adviser/classes" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/adviser/classes') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Current Classes
              </router-link>
              
              <router-link 
                to="/adviser/classes-history" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/adviser/classes-history') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Class History
              </router-link>
            </div>
          </div>
          
          <!-- Consultations -->
          <router-link 
            to="/adviser/consultations" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-colors group"
            :class="isActive('/adviser/consultations') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
            :title="sidebarCollapsed ? 'Consultations' : ''"
          >
            <svg class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
            </svg>
            <span v-if="!sidebarCollapsed">Consultations</span>
          </router-link>
          
          <!-- M&M -->
          <router-link 
            to="/adviser/mm" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-colors group"
            :class="isActive('/adviser/mm') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
            :title="sidebarCollapsed ? 'M&M' : ''"
          >
            <svg class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <span v-if="!sidebarCollapsed">M&M</span>
          </router-link>
          
          <!-- Odyssey -->
          <router-link 
            to="/adviser/odyssey" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-colors group"
            :class="isActive('/adviser/odyssey') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
            :title="sidebarCollapsed ? 'Odyssey Plans' : ''"
          >
            <svg class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-2.25m2.25 0l.5 1.5m.5-1.5l1 1.5" />
            </svg>
            <span v-if="!sidebarCollapsed">Odyssey Plans</span>
          </router-link>
          
          <!-- Attendance -->
          <router-link 
            to="/adviser/attendance" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-colors group"
            :class="isActive('/adviser/attendance') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
            :title="sidebarCollapsed ? 'Attendance' : ''"
          >
            <svg class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span v-if="!sidebarCollapsed">Attendance</span>
          </router-link>
          
          <!-- Monitoring -->
          <router-link 
            to="/adviser/monitoring" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-colors group"
            :class="isActive('/adviser/monitoring') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
            :title="sidebarCollapsed ? 'Monitoring' : ''"
          >
            <svg class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
            <span v-if="!sidebarCollapsed">Monitoring</span>
          </router-link>
          
          <!-- Announcements -->
          <router-link 
            to="/adviser/announcements" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-colors group"
            :class="isActive('/adviser/announcements') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
            :title="sidebarCollapsed ? 'Announcements' : ''"
          >
            <svg class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
            </svg>
            <span v-if="!sidebarCollapsed">Announcements</span>
          </router-link>
        </div>
      </nav>
    </div>
    
    <!-- Mobile Sidebar Toggle -->
    <div class="md:hidden fixed bottom-4 right-4 z-10">
      <button 
        @click="showMobileMenu = !showMobileMenu" 
        class="bg-primary text-white p-3 rounded-full shadow-lg"
      >
        <svg v-if="!showMobileMenu" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Mobile Menu -->
    <div 
      v-if="showMobileMenu" 
      class="fixed inset-0 bg-gray-800 bg-opacity-75 z-20 md:hidden"
      @click="showMobileMenu = false"
    >
      <div 
        class="bg-white w-64 h-full overflow-y-auto"
        @click.stop
      >
        <div class="px-6 py-4 border-b border-gray-200">
          <h1 class="text-xl font-bold text-primary">SSP Management</h1>
          <p class="text-sm text-gray-600">Adviser Portal</p>
        </div>
        
        <nav class="px-4 py-4">
          <div class="space-y-2">
            <!-- Same content as desktop menu but with @click="showMobileMenu = false" on each router-link -->
            <router-link 
              to="/adviser" 
              class="block px-4 py-2 rounded-md transition-colors"
              :class="isActive('/adviser') ? 'bg-primary-light text-primary-dark' : 'text-gray-700 hover:bg-gray-100'"
              exact-active-class="bg-primary-light text-primary-dark"
              @click="showMobileMenu = false"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </div>
            </router-link>
            
            <router-link 
              to="/adviser/profile" 
              class="block px-4 py-2 rounded-md transition-colors"
              :class="isActive('/adviser/profile') ? 'bg-primary-light text-primary-dark' : 'text-gray-700 hover:bg-gray-100'"
              @click="showMobileMenu = false"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </div>
            </router-link>
            
            <!-- Mobile Classes dropdown -->
            <div class="relative">
              <button 
                @click="toggleMobileClassesDropdown" 
                class="block w-full text-left px-4 py-2 rounded-md transition-colors"
                :class="isActive('/adviser/classes') || isActive('/adviser/classes-history') ? 'bg-primary-light text-primary-dark' : 'text-gray-700 hover:bg-gray-100'"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Classes
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-4 w-4 transition-transform duration-200" 
                    :class="{'transform rotate-180': mobileClassesDropdownOpen}"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <!-- Mobile Classes Dropdown Items -->
              <div v-if="mobileClassesDropdownOpen" class="pl-8 mt-1 space-y-1">
                <router-link 
                  to="/adviser/classes" 
                  class="block px-4 py-2 rounded-md transition-colors"
                  :class="isActive('/adviser/classes') ? 'bg-primary-light text-primary-dark' : 'text-gray-700 hover:bg-gray-100'"
                  @click="showMobileMenu = false"
                >
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Current Classes
                  </div>
                </router-link>
                
                <router-link 
                  to="/adviser/classes-history" 
                  class="block px-4 py-2 rounded-md transition-colors"
                  :class="isActive('/adviser/classes-history') ? 'bg-primary-light text-primary-dark' : 'text-gray-700 hover:bg-gray-100'"
                  @click="showMobileMenu = false"
                >
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Class History
                  </div>
                </router-link>
              </div>
            </div>
            
            <!-- Mobile Odyssey Link -->
            <router-link 
              to="/adviser/odyssey" 
              class="block px-4 py-2 rounded-md transition-colors"
              :class="isActive('/adviser/odyssey') ? 'bg-primary-light text-primary-dark' : 'text-gray-700 hover:bg-gray-100'"
              @click="showMobileMenu = false"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Odyssey Plans
              </div>
            </router-link>
            
            <!-- Mobile Announcements Link -->
            <router-link 
              to="/adviser/announcements" 
              class="block px-4 py-2 rounded-md transition-colors"
              :class="isActive('/adviser/announcements') ? 'bg-primary-light text-primary-dark' : 'text-gray-700 hover:bg-gray-100'"
              @click="showMobileMenu = false"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Announcements
              </div>
            </router-link>
          </div>
        </nav>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="flex-1 transition-all duration-300" :class="sidebarCollapsed ? 'pl-16' : 'pl-64'">
      <!-- Top Navbar -->
      <header class="bg-white shadow-sm h-16 flex items-center px-6 sticky top-0 z-20 border-b border-gray-200">
        <div class="flex-1">
          <h2 class="text-xl font-normal text-gray-800">{{ pageTitle }}</h2>
        </div>
        
        <!-- Theme Selector -->
        
        
        <!-- User Profile -->
        <div class="relative">
          <button 
            @click="toggleProfileMenu" 
            class="flex items-center space-x-3 focus:outline-none hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
          >
            <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-normal">
              {{ userInitials }}
            </div>
            <div class="hidden md:block text-left">
              <div class="text-sm font-normal text-gray-800">{{ userName }}</div>
              <div class="text-xs text-gray-500">Adviser</div>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          
          <!-- Profile Menu -->
          <div 
            v-if="showProfileMenu"
            class="absolute right-0 z-30 mt-2 w-48 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-200 focus:outline-none"
          >
            <router-link to="/adviser/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Profile
              </div>
            </router-link>
            <div class="border-t border-gray-100 my-1"></div>
            <a @click.prevent="logout" href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Sign out
              </div>
            </a>
          </div>
        </div>
      </header>
      
      <!-- Page Content -->
      <main class="px-6 py-6">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationService } from '../../services/notificationService';
 

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const notificationService = useNotificationService();

// Mobile menu state
const showMobileMenu = ref(false);

// Sidebar state
const sidebarCollapsed = ref(false);

// User info
const userName = computed(() => {
  if (!authStore.user) return 'Adviser User';
  return `${authStore.user.firstName} ${authStore.user.lastName}`;
});

const userInitials = computed(() => {
  if (!authStore.user) return 'AU';
  return `${authStore.user.firstName?.charAt(0) || ''}${authStore.user.lastName?.charAt(0) || ''}`;
});

// Profile menu toggle
const showProfileMenu = ref(false);

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value;
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

// Page title based on route
const pageTitle = computed(() => {
  return route.meta.title || 'Dashboard';
});

// Watch for route changes to close mobile menu
watch(
  () => route.path,
  () => {
    showMobileMenu.value = false;
  }
);

// Check if route is active
function isActive(path) {
  return route.path === path || route.path.startsWith(`${path}/`);
}

// Close profile menu when clicking outside
function handleClickOutside(event) {
  if (showProfileMenu.value && !event.target.closest('.relative')) {
    showProfileMenu.value = false;
  }
}

// Mount and unmount event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  authStore.logout();
  router.push('/login');
}

// Navigate to a specific route
function navigateTo(path) {
  // If password change is required, only allow navigation to profile page
  if (authStore.passwordChangeRequired && path !== '/adviser/profile') {
    // Show a notification and redirect to profile page
    notificationService.showWarning('Please change your password before accessing other pages.');
    router.push('/adviser/profile');
  } else {
    // Normal navigation
    router.push(path);
  }
}

// Classes dropdown state
const classesDropdownOpen = ref(false);

function toggleClassesDropdown() {
  classesDropdownOpen.value = !classesDropdownOpen.value;
}

// Mobile Classes dropdown state
const mobileClassesDropdownOpen = ref(false);

function toggleMobileClassesDropdown() {
  mobileClassesDropdownOpen.value = !mobileClassesDropdownOpen.value;
}
</script>

<style scoped>
/* Custom scrollbar for sidebar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(59, 130, 246, 0.1);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}
</style> 