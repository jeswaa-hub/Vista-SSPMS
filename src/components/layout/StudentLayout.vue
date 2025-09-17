<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar (desktop) -->
    <div 
      class="bg-blue-900 shadow-lg fixed h-full overflow-y-auto transition-all duration-300 z-30 rounded-r-2xl hidden md:block"
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
            <p class="text-xs text-blue-200 font-medium">Student Portal</p>
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
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
          </svg>
          <span v-if="!sidebarCollapsed" class="ml-2 text-sm">Collapse</span>
        </button>
      </div>
      
      <!-- Navigation -->
      <nav class="px-2 py-4">
        <div class="space-y-2">
          <!-- Dashboard -->
          <router-link 
            to="/student" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-all duration-300 ease-in-out group relative overflow-hidden transform hover:scale-105"
            :class="isActive('/student') && !route.path.includes('/student/') ? 'bg-blue-800 text-white shadow-lg' : 'text-blue-300 hover:bg-blue-800 hover:text-white hover:shadow-md'"
            exact-active-class="bg-blue-800 text-white shadow-lg"
          >
            <!-- Active indicator bar -->
            <div 
              v-if="isActive('/student') && !route.path.includes('/student/')" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-pulse"
            ></div>
            <!-- Hover effect background -->
            <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md"></div>
            <div class="flex items-center relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span v-if="!sidebarCollapsed" class="transition-all duration-300">Dashboard</span>
            </div>
          </router-link>
          
          <!-- Profile -->
          <router-link 
            to="/student/profile" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-all duration-300 ease-in-out group relative overflow-hidden transform hover:scale-105"
            :class="isActive('/student/profile') ? 'bg-blue-800 text-white shadow-lg' : 'text-blue-300 hover:bg-blue-800 hover:text-white hover:shadow-md'"
          >
            <!-- Active indicator bar -->
            <div 
              v-if="isActive('/student/profile')" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-pulse"
            ></div>
            <!-- Hover effect background -->
            <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md"></div>
            <div class="flex items-center relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span v-if="!sidebarCollapsed" class="transition-all duration-300">Profile</span>
            </div>
          </router-link>
          
          <!-- Announcements -->
          <router-link 
            to="/student/announcements" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-colors group"
            :class="isActive('/student/announcements') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
          >
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span v-if="!sidebarCollapsed">Announcements</span>
            </div>
          </router-link>
          
          <!-- Notifications -->
          <router-link 
            to="/student/notifications" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-colors group"
            :class="isActive('/student/notifications') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
          >
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span v-if="!sidebarCollapsed">Notifications</span>
              </div>
              <span 
                v-if="unreadNotificationsCount > 0" 
                class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full"
              >
                {{ unreadNotificationsCount }}
              </span>
            </div>
          </router-link>
          
          <!-- Consultations with dropdown -->
          <div class="relative">
            <button 
              @click="toggleConsultationDropdown" 
              class="w-full flex items-center justify-between px-3 py-2 text-left rounded-md text-sm font-normal transition-colors group"
              :class="(isActive('/student/consultations') || isActive('/student/my-bookings')) ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
            >
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span v-if="!sidebarCollapsed">Consultations</span>
                </div>
                <svg v-if="!sidebarCollapsed" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200" :class="consultationDropdownOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </div>
            </button>
            
            <!-- Consultation Dropdown Items -->
            <div v-if="consultationDropdownOpen && !sidebarCollapsed" class="ml-6 mt-1 space-y-1">
              <router-link 
                to="/student/consultations" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/student/consultations') && !isActive('/student/my-bookings') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
                @click="showMobileMenu = false"
              >
                Book Consultation
              </router-link>
              
              <router-link 
                to="/student/my-bookings" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/student/my-bookings') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
                @click="showMobileMenu = false"
              >
                My Bookings
              </router-link>
            </div>
          </div>
          
          <!-- SSP with dropdown -->
          <div class="relative">
            <button 
              @click="toggleSSPDropdown" 
              class="w-full flex items-center justify-between px-3 py-2 text-left rounded-md text-sm font-normal transition-colors group"
              :class="(isActive('/student/ssp') || isActive('/student/ssp-history')) ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
            >
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span v-if="!sidebarCollapsed">SSP</span>
                </div>
                <svg v-if="!sidebarCollapsed" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200" :class="sspDropdownOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </div>
            </button>
            
            <!-- SSP Dropdown Items -->
            <div v-if="sspDropdownOpen && !sidebarCollapsed" class="ml-6 mt-1 space-y-1">
              <router-link 
                to="/student/ssp" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/student/ssp') && !isActive('/student/ssp-history') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
                @click="showMobileMenu = false"
              >
                Current Sessions
              </router-link>
              
              <router-link 
                to="/student/ssp-history" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/student/ssp-history') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
                @click="showMobileMenu = false"
              >
                Session History
              </router-link>
            </div>
          </div>
          
          <!-- Odyssey Plan with dropdown -->
          <div class="relative">
            <button 
              @click="toggleOdysseyDropdown" 
              class="w-full flex items-center justify-between px-3 py-2 text-left rounded-md text-sm font-normal transition-colors group"
              :class="(isActive('/student/odyssey-plan') || isActive('/student/archived-odyssey-plans')) ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
            >
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span v-if="!sidebarCollapsed">Odyssey Plan</span>
                </div>
                <svg v-if="!sidebarCollapsed" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200" :class="odysseyDropdownOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </div>
            </button>
            
            <!-- Odyssey Plan Dropdown Items -->
            <div v-if="odysseyDropdownOpen && !sidebarCollapsed" class="ml-6 mt-1 space-y-1">
              <router-link 
                to="/student/odyssey-plan" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/student/odyssey-plan') && !isActive('/student/archived-odyssey-plans') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
                @click="showMobileMenu = false"
              >
                Current Plan
              </router-link>
              
              <router-link 
                to="/student/archived-odyssey-plans" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/student/archived-odyssey-plans') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
                @click="showMobileMenu = false"
              >
                Archive Odyssey Plan
              </router-link>
            </div>
          </div>
          
          <!-- M&M with dropdown -->
          <div class="relative">
            <button 
              @click="toggleMMDropdown" 
              class="w-full flex items-center justify-between px-3 py-2 text-left rounded-md text-sm font-normal transition-colors group"
              :class="(isActive('/student/surveys') || isActive('/student/mm-history')) ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
            >
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span v-if="!sidebarCollapsed">M & M</span>
                </div>
                <svg v-if="!sidebarCollapsed" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200" :class="mmDropdownOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </div>
            </button>
            
            <!-- M&M Dropdown Items -->
            <div v-if="mmDropdownOpen && !sidebarCollapsed" class="ml-6 mt-1 space-y-1">
              <router-link 
                to="/student/surveys" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/student/surveys') && !isActive('/student/mm-history') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
                @click="showMobileMenu = false"
              >
                Submit M&M
              </router-link>
              
              <router-link 
                to="/student/mm-history" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/student/mm-history') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
                @click="showMobileMenu = false"
              >
                M&M History
              </router-link>
            </div>
          </div>
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
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showMobileMenu"
            class="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 md:hidden"
            @click="showMobileMenu = false"
          >
            <transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="transform translate-x-full"
              enter-to-class="transform translate-x-0"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="transform translate-x-0"
              leave-to-class="transform translate-x-full"
            >
              <div
                class="bg-blue-900 w-80 h-full overflow-y-auto shadow-2xl"
                @click.stop
              >
            <!-- Mobile Header with Logo -->
            <div class="px-6 py-6 border-b border-blue-800">
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0 relative">
                  <div class="absolute inset-0 bg-white/10 rounded-full blur-lg"></div>
                  <img 
                    src="/src/assets/18.png" 
                    alt="PHINMA Araullo University" 
                    class="w-12 h-12 object-contain relative z-10 drop-shadow-lg"
                  />
                </div>
                <div class="flex-1">
                  <h1 class="text-xl font-semibold text-white tracking-wide">SSCMS</h1>
                  <p class="text-xs text-blue-200 font-medium">Student Portal</p>
                </div>
              </div>
            </div>
            
            <nav class="px-4 py-4">
              <div class="space-y-2">
                <!-- Dashboard -->
                <router-link 
                  to="/student" 
                  class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-all duration-300 ease-in-out group relative overflow-hidden transform hover:scale-105"
                  :class="isActive('/student') && !route.path.includes('/student/') ? 'bg-blue-800 text-white shadow-lg' : 'text-blue-300 hover:bg-blue-800 hover:text-white hover:shadow-md'"
                  exact-active-class="bg-blue-800 text-white shadow-lg"
                  @click="showMobileMenu = false"
                >
                  <!-- Active indicator bar -->
                  <div 
                    v-if="isActive('/student') && !route.path.includes('/student/')" 
                    class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-pulse"
                  ></div>
                  <!-- Hover effect background -->
                  <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md"></div>
                  <div class="flex items-center relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span class="transition-all duration-300">Dashboard</span>
                  </div>
                </router-link>
                
                <!-- Profile -->
                <router-link 
                  to="/student/profile" 
                  class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-all duration-300 ease-in-out group relative overflow-hidden transform hover:scale-105"
                  :class="isActive('/student/profile') ? 'bg-blue-800 text-white shadow-lg' : 'text-blue-300 hover:bg-blue-800 hover:text-white hover:shadow-md'"
                  @click="showMobileMenu = false"
                >
                  <!-- Active indicator bar -->
                  <div 
                    v-if="isActive('/student/profile')" 
                    class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-pulse"
                  ></div>
                  <!-- Hover effect background -->
                  <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md"></div>
                  <div class="flex items-center relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="transition-all duration-300">Profile</span>
                  </div>
                </router-link>
                
                <!-- Announcements -->
                <router-link 
                  to="/student/announcements" 
                  class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-all duration-300 ease-in-out group relative overflow-hidden transform hover:scale-105"
                  :class="isActive('/student/announcements') ? 'bg-blue-800 text-white shadow-lg' : 'text-blue-300 hover:bg-blue-800 hover:text-white hover:shadow-md'"
                  @click="showMobileMenu = false"
                >
                  <!-- Active indicator bar -->
                  <div 
                    v-if="isActive('/student/announcements')" 
                    class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-pulse"
                  ></div>
                  <!-- Hover effect background -->
                  <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md"></div>
                  <div class="flex items-center relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    <span class="transition-all duration-300">Announcements</span>
                  </div>
                </router-link>
                
                <!-- SSP -->
                <router-link 
                  to="/student/ssp" 
                  class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-all duration-300 ease-in-out group relative overflow-hidden transform hover:scale-105"
                  :class="isActive('/student/ssp') ? 'bg-blue-800 text-white shadow-lg' : 'text-blue-300 hover:bg-blue-800 hover:text-white hover:shadow-md'"
                  @click="showMobileMenu = false"
                >
                  <!-- Active indicator bar -->
                  <div 
                    v-if="isActive('/student/ssp')" 
                    class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-pulse"
                  ></div>
                  <!-- Hover effect background -->
                  <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md"></div>
                  <div class="flex items-center relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span class="transition-all duration-300">SSP</span>
                  </div>
                </router-link>
                
                <!-- Consultations -->
                <router-link 
                  to="/student/consultations" 
                  class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-all duration-300 ease-in-out group relative overflow-hidden transform hover:scale-105"
                  :class="isActive('/student/consultations') ? 'bg-blue-800 text-white shadow-lg' : 'text-blue-300 hover:bg-blue-800 hover:text-white hover:shadow-md'"
                  @click="showMobileMenu = false"
                >
                  <!-- Active indicator bar -->
                  <div 
                    v-if="isActive('/student/consultations')" 
                    class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-pulse"
                  ></div>
                  <!-- Hover effect background -->
                  <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md"></div>
                  <div class="flex items-center relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="transition-all duration-300">Consultations</span>
                  </div>
                </router-link>
                
                <!-- M&M -->
                <router-link 
                  to="/student/surveys" 
                  class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-all duration-300 ease-in-out group relative overflow-hidden transform hover:scale-105"
                  :class="isActive('/student/surveys') ? 'bg-blue-800 text-white shadow-lg' : 'text-blue-300 hover:bg-blue-800 hover:text-white hover:shadow-md'"
                  @click="showMobileMenu = false"
                >
                  <!-- Active indicator bar -->
                  <div 
                    v-if="isActive('/student/surveys')" 
                    class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-pulse"
                  ></div>
                  <!-- Hover effect background -->
                  <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md"></div>
                  <div class="flex items-center relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="transition-all duration-300">M&M</span>
                  </div>
                </router-link>
                
                <!-- M&M History -->
                <router-link 
                  to="/student/mm-history" 
                  class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-all duration-300 ease-in-out group relative overflow-hidden transform hover:scale-105"
                  :class="isActive('/student/mm-history') ? 'bg-blue-800 text-white shadow-lg' : 'text-blue-300 hover:bg-blue-800 hover:text-white hover:shadow-md'"
                  @click="showMobileMenu = false"
                >
                  <!-- Active indicator bar -->
                  <div 
                    v-if="isActive('/student/mm-history')" 
                    class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-pulse"
                  ></div>
                  <!-- Hover effect background -->
                  <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md"></div>
                  <div class="flex items-center relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="transition-all duration-300">M&M History</span>
                  </div>
                </router-link>
              </div>
            </nav>
          </div>
        </transition>
      </div>
    </transition>
    
    <!-- Main Content -->
    <div class="flex-1 transition-all duration-300" :class="sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'">
      <!-- Top Navbar -->
      <header class="bg-white shadow-sm h-16 flex items-center px-6 sticky top-0 z-20 border-b border-gray-200">
        <div class="flex-1">
          <h2 class="text-xl font-normal text-gray-800">{{ pageTitle }}</h2>
        </div>
        
        <!-- Theme Selector -->
        
        
        <!-- User Profile -->
        <div class="relative">
          <div class="flex items-center space-x-4">
            <div class="relative">
              <router-link 
                to="/student/notifications"
                class="relative p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span 
                  v-if="unreadNotificationsCount > 0" 
                  class="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
                >
                  {{ unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount }}
                </span>
              </router-link>
            </div>
            
        <div class="relative">
          <button 
            @click="profileMenuOpen = !profileMenuOpen" 
                class="flex items-center font-medium text-gray-800 hover:text-primary transition-colors"
          >
            <div class="h-8 w-8 rounded-full bg-primary-light text-primary flex items-center justify-center mr-2">
              {{ userInitials }}
            </div>
            <span class="hidden md:inline-block font-medium text-gray-700">{{ userName }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
            </div>
          </div>
          
          <!-- Profile Dropdown Menu -->
          <div 
            v-if="profileMenuOpen" 
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
            @click.outside="profileMenuOpen = false"
          >
            <router-link 
              to="/student/profile" 
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="profileMenuOpen = false"
            >
              Your Profile
            </router-link>
            
            <button 
              @click="logout" 
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      
      <!-- Page Content -->
      <main class="py-6 px-6">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { notificationApiService } from '../../services/notificationApiService';
 

// Router and route
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State variables
const showMobileMenu = ref(false);
const sidebarCollapsed = ref(false)
const profileMenuOpen = ref(false);
const sspDropdownOpen = ref(false);
const consultationDropdownOpen = ref(false);
const mobileSSPDropdownOpen = ref(false);
const odysseyDropdownOpen = ref(false);
const mmDropdownOpen = ref(false);
const mobileMMDropdownOpen = ref(false);
const unreadNotificationsCount = ref(0);

// Computed properties
const pageTitle = computed(() => {
  return route.meta.title || 'Student Portal';
});

const userName = computed(() => {
  if (!authStore.user) return 'Student';
  return `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`;
});

const userInitials = computed(() => {
  if (!authStore.user) return 'S';
  const firstInitial = authStore.user.firstName ? authStore.user.firstName.charAt(0) : '';
  const lastInitial = authStore.user.lastName ? authStore.user.lastName.charAt(0) : '';
  return (firstInitial + lastInitial).toUpperCase() || 'S';
});

// Check if a route is active
function isActive(path) {
  return route.path.startsWith(path);
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// Logout function
function logout() {
  authStore.logout();
  router.push('/login');
}

// Helper function to close all dropdowns
function closeAllDropdowns() {
  sspDropdownOpen.value = false;
  consultationDropdownOpen.value = false;
  odysseyDropdownOpen.value = false;
  mmDropdownOpen.value = false;
  mobileSSPDropdownOpen.value = false;
  mobileMMDropdownOpen.value = false;
}

// Toggle SSP dropdown
function toggleSSPDropdown() {
  const wasOpen = sspDropdownOpen.value;
  closeAllDropdowns();
  sspDropdownOpen.value = !wasOpen;
}

// Toggle mobile SSP dropdown
function toggleMobileSSPDropdown() {
  const wasOpen = mobileSSPDropdownOpen.value;
  closeAllDropdowns();
  mobileSSPDropdownOpen.value = !wasOpen;
}

// Add toggleOdysseyDropdown function
function toggleOdysseyDropdown() {
  const wasOpen = odysseyDropdownOpen.value;
  closeAllDropdowns();
  odysseyDropdownOpen.value = !wasOpen;
}

// Toggle M&M dropdown
function toggleMMDropdown() {
  const wasOpen = mmDropdownOpen.value;
  closeAllDropdowns();
  mmDropdownOpen.value = !wasOpen;
}

// Toggle mobile M&M dropdown
function toggleMobileMMDropdown() {
  const wasOpen = mobileMMDropdownOpen.value;
  closeAllDropdowns();
  mobileMMDropdownOpen.value = !wasOpen;
}

// Toggle consultation dropdown
function toggleConsultationDropdown() {
  const wasOpen = consultationDropdownOpen.value;
  closeAllDropdowns();
  consultationDropdownOpen.value = !wasOpen;
}

// Watch for route changes to close dropdowns
watch(
  () => route.path,
  () => {
    closeAllDropdowns();
  }
);

// Fetch unread notifications count
async function fetchUnreadCount() {
  try {
    const count = await notificationApiService.getUnreadCount();
    unreadNotificationsCount.value = count;
  } catch (error) {
    console.error('Failed to fetch unread notifications count:', error);
    // On error, don't update the count, but don't show an error to the user
    // as this is a background operation
  }
}

// Set up polling for notifications
onMounted(() => {
  // Initial fetch
  fetchUnreadCount();
  
  // Set up polling every 15 seconds (increased from 30 seconds for more responsive UI)
  const pollInterval = setInterval(fetchUnreadCount, 15000);
  
  // Clean up on component unmount
  onUnmounted(() => {
    clearInterval(pollInterval);
  });
});
</script>

<style scoped>
.bg-background {
  background-color: #f9fafb;
}

.bg-primary {
  background-color: #3B82F6;
}

.bg-primary-light {
  background-color: #EFF6FF;
}

.text-primary {
  color: #3B82F6;
}

.text-primary-dark {
  color: #2563EB;
}

.hover\:bg-primary-dark:hover {
  background-color: #2563EB;
}

.transition-colors {
  transition: color 0.2s, background-color 0.2s;
}

/* Add styles for dropdown */
.relative {
  position: relative;
}

.z-50 {
  z-index: 50;
}
</style> 