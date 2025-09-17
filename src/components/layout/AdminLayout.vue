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
            <p class="text-xs text-blue-200 font-medium">Admin Portal</p>
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
          <!-- Dashboard -->
          <router-link 
            to="/admin" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-all duration-300 ease-in-out group relative overflow-hidden transform hover:scale-105"
            :class="isActive('/admin') ? 'bg-blue-800 text-white shadow-lg' : 'text-blue-300 hover:bg-blue-800 hover:text-white hover:shadow-md'"
            exact-active-class="bg-blue-800 text-white shadow-lg"
            :title="sidebarCollapsed ? 'Dashboard' : ''"
          >
            <!-- Active indicator bar -->
            <div 
              v-if="isActive('/admin')" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-pulse"
            ></div>
            <!-- Hover effect background -->
            <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md"></div>
            <svg class="w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span v-if="!sidebarCollapsed" class="relative z-10 transition-all duration-300">Dashboard</span>
          </router-link>
          
          <!-- Analytics -->
          <router-link 
            to="/admin/analytics" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-normal transition-all duration-300 ease-in-out group relative overflow-hidden transform hover:scale-105"
            :class="isActive('/admin/analytics') ? 'bg-blue-800 text-white shadow-lg' : 'text-blue-300 hover:bg-blue-800 hover:text-white hover:shadow-md'"
            :title="sidebarCollapsed ? 'Analytics' : ''"
          >
            <!-- Active indicator bar -->
            <div 
              v-if="isActive('/admin/analytics')" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-pulse"
            ></div>
            <!-- Hover effect background -->
            <div class="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md"></div>
            <svg class="w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-2.25m2.25 0l.5 1.5m.5-1.5l1 1.5" />
            </svg>
            <span v-if="!sidebarCollapsed" class="relative z-10 transition-all duration-300">Analytics</span>
          </router-link>
          
          <!-- Advisers Group -->
          <div class="py-1">
            <button 
              @click="toggleSection('advisers')" 
              class="w-full flex items-center justify-between px-3 py-2 text-left rounded-md text-sm font-normal transition-colors group"
              :class="isSectionActive('advisers') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
              :title="sidebarCollapsed ? 'Advisers' : ''"
            >
              <div class="flex items-center">
                <svg class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <span v-if="!sidebarCollapsed">Advisers</span>
              </div>
              <svg 
                v-if="!sidebarCollapsed"
                class="w-4 h-4 transition-transform duration-200" 
                :class="openSections.advisers ? 'rotate-180' : ''"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            <div v-if="(openSections.advisers || sidebarCollapsed) && !sidebarCollapsed" class="ml-6 mt-1 space-y-1">
              <router-link 
                to="/admin/advisers" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/advisers') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Advisers List
              </router-link>
              
              <router-link 
                to="/admin/advisory-classes" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/advisory-classes') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Advisory Classes
              </router-link>
              
              <router-link 
                to="/admin/adviser-archive" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/adviser-archive') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Advisory Archive
              </router-link>
            </div>
          </div>
          
          <!-- Classes Group -->
          <div class="py-1">
            <button 
              @click="toggleSection('classes')" 
              class="w-full flex items-center justify-between px-3 py-2 text-left rounded-md text-sm font-normal transition-colors group"
              :class="isSectionActive('classes') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
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
                :class="openSections.classes ? 'rotate-180' : ''"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            <div v-if="(openSections.classes || sidebarCollapsed) && !sidebarCollapsed" class="ml-6 mt-1 space-y-1">
              <router-link 
                to="/admin/classes" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/classes') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Classes List
              </router-link>
              
              <router-link 
                to="/admin/class-archive" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/class-archive') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Class Archive
              </router-link>
              
              <router-link 
                to="/admin/subjects" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/subjects') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                SSP Subjects
              </router-link>
            </div>
          </div>
          
          <!-- Management Group -->
          <div class="py-1">
            <button 
              @click="toggleSection('management')" 
              class="w-full flex items-center justify-between px-3 py-2 text-left rounded-md text-sm font-normal transition-colors group"
              :class="isSectionActive('management') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
              :title="sidebarCollapsed ? 'Management' : ''"
            >
              <div class="flex items-center">
                <svg class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span v-if="!sidebarCollapsed">Management</span>
              </div>
              <svg 
                v-if="!sidebarCollapsed"
                class="w-4 h-4 transition-transform duration-200" 
                :class="openSections.management ? 'rotate-180' : ''"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            <div v-if="(openSections.management || sidebarCollapsed) && !sidebarCollapsed" class="ml-6 mt-1 space-y-1">
              <router-link 
                to="/admin/students" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/students') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Students
              </router-link>
              
              <router-link 
                to="/admin/student-archive" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/student-archive') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Student Archive
              </router-link>
              
              <router-link 
                to="/admin/pending-registrations" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/pending-registrations') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Pending Registrations
              </router-link>
              
              <router-link 
                to="/admin/announcements" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/announcements') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Announcements
              </router-link>
              
              <router-link 
                to="/admin/resolved-reports" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/resolved-reports') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Resolved Reports
              </router-link>
              
              <router-link 
                to="/admin/consultations" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/consultations') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Consultations
              </router-link>
              
              <router-link 
                to="/admin/notifications" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/notifications') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                Dropping Request
              </router-link>
            </div>
          </div>
          
          <!-- System Group -->
          <div class="py-1">
            <button 
              @click="toggleSection('system')" 
              class="w-full flex items-center justify-between px-3 py-2 text-left rounded-md text-sm font-normal transition-colors group"
              :class="isSectionActive('system') ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'"
              :title="sidebarCollapsed ? 'System' : ''"
            >
              <div class="flex items-center">
                <svg class="w-5 h-5 flex-shrink-0" :class="sidebarCollapsed ? 'mx-auto' : 'mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span v-if="!sidebarCollapsed">System</span>
              </div>
              <svg 
                v-if="!sidebarCollapsed"
                class="w-4 h-4 transition-transform duration-200" 
                :class="openSections.system ? 'rotate-180' : ''"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            <div v-if="(openSections.system || sidebarCollapsed) && !sidebarCollapsed" class="ml-6 mt-1 space-y-1">
              <router-link 
                to="/admin/system-options" 
                class="block px-3 py-2 rounded-md text-sm font-normal transition-colors"
                :class="isActive('/admin/system-options') ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'"
              >
                System Options
              </router-link>
            </div>
          </div>
        </div>
      </nav>
    </div>
    
    <!-- Main Content -->
    <div class="flex-1 transition-all duration-300" :class="sidebarCollapsed ? 'pl-16' : 'pl-64'">
      <!-- Top Navbar -->
      <header class="bg-white shadow-sm h-16 flex items-center px-6 sticky top-0 z-20 border-b border-gray-200">
        <div class="flex-1">
          <h2 class="text-xl font-normal text-gray-800">{{ pageTitle }}</h2>
        </div>
        
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
              <div class="text-xs text-gray-500">Administrator</div>
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
            <router-link to="/admin/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
      <main>
        <router-view></router-view>
      </main>
    </div>

    <!-- Collapsed Sidebar Dropdown Overlay -->
    <div 
      v-if="sidebarCollapsed && hoveredSection"
      class="fixed left-16 bg-blue-900 shadow-xl rounded-r-lg z-40 py-2 min-w-48"
      :style="{ top: dropdownPosition + 'px' }"
      @mouseenter="keepDropdownOpen = true"
      @mouseleave="closeDropdown"
    >
      <div class="px-3 py-2 border-b border-blue-800 mb-2">
        <h3 class="text-sm font-medium text-white capitalize">{{ hoveredSection }}</h3>
      </div>
      <div class="space-y-1 px-2">
        <template v-if="hoveredSection === 'advisers'">
          <router-link 
            to="/admin/advisers" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/advisers') ? 'bg-blue-700 text-white' : ''"
          >
            Advisers List
          </router-link>
          <router-link 
            to="/admin/advisory-classes" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/advisory-classes') ? 'bg-blue-700 text-white' : ''"
          >
            Advisory Classes
          </router-link>
          <router-link 
            to="/admin/adviser-archive" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/adviser-archive') ? 'bg-blue-700 text-white' : ''"
          >
            Advisory Archive
          </router-link>
        </template>
        
        <template v-if="hoveredSection === 'classes'">
          <router-link 
            to="/admin/classes" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/classes') ? 'bg-blue-700 text-white' : ''"
          >
            Classes List
          </router-link>
          <router-link 
            to="/admin/class-archive" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/class-archive') ? 'bg-blue-700 text-white' : ''"
          >
            Class Archive
          </router-link>
          <router-link 
            to="/admin/subjects" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/subjects') ? 'bg-blue-700 text-white' : ''"
          >
            SSP Subjects
          </router-link>
        </template>
        
        <template v-if="hoveredSection === 'management'">
          <router-link 
            to="/admin/students" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/students') ? 'bg-blue-700 text-white' : ''"
          >
            Students
          </router-link>
          <router-link 
            to="/admin/student-archive" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/student-archive') ? 'bg-blue-700 text-white' : ''"
          >
            Student Archive
          </router-link>
          <router-link 
            to="/admin/pending-registrations" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/pending-registrations') ? 'bg-blue-700 text-white' : ''"
          >
            Pending Registrations
          </router-link>
          <router-link 
            to="/admin/announcements" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/announcements') ? 'bg-blue-700 text-white' : ''"
          >
            Announcements
          </router-link>
          <router-link 
            to="/admin/resolved-reports" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/resolved-reports') ? 'bg-blue-700 text-white' : ''"
          >
            Resolved Reports
          </router-link>
          <router-link 
            to="/admin/consultations" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/consultations') ? 'bg-blue-700 text-white' : ''"
          >
            Consultations
          </router-link>
          <router-link 
            to="/admin/notifications" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/notifications') ? 'bg-blue-700 text-white' : ''"
          >
            Dropping Request
          </router-link>
        </template>
        
        <template v-if="hoveredSection === 'system'">
          <router-link 
            to="/admin/system-options" 
            class="block px-3 py-2 rounded-md text-sm font-normal text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
            :class="isActive('/admin/system-options') ? 'bg-blue-700 text-white' : ''"
          >
            System Options
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Sidebar state
const sidebarCollapsed = ref(false)
const hoveredSection = ref(null)
const dropdownPosition = ref(0)
const keepDropdownOpen = ref(false)

// Navigation sections
const openSections = reactive({
  advisers: false,
  classes: false,
  management: false,
  system: false
})

// Check if path matches a section and auto-expand it
onMounted(() => {
  // Auto-expand sections based on current route
  checkAndExpandSection()
  
  // Add event listener for route changes
  router.afterEach(() => {
    checkAndExpandSection()
  })

  // Add mouse event listeners for collapsed sidebar dropdowns
  if (typeof window !== 'undefined') {
    const sidebarButtons = document.querySelectorAll('[data-section]')
    sidebarButtons.forEach(button => {
      button.addEventListener('mouseenter', handleSectionHover)
      button.addEventListener('mouseleave', handleSectionLeave)
    })
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    const sidebarButtons = document.querySelectorAll('[data-section]')
    sidebarButtons.forEach(button => {
      button.removeEventListener('mouseenter', handleSectionHover)
      button.removeEventListener('mouseleave', handleSectionLeave)
    })
  }
})

function checkAndExpandSection() {
  const path = route.path
  
  // Reset all sections
  if (path.includes('/admin/advisers') || path.includes('/admin/advisory-classes') || path.includes('/admin/adviser-archive')) {
    openSections.advisers = true
  }
  
  if (path.includes('/admin/classes') || path.includes('/admin/class-archive') || path.includes('/admin/subjects')) {
    openSections.classes = true
  }
  
  if (path.includes('/admin/students') || path.includes('/admin/pending-registrations') || path.includes('/admin/announcements') || path.includes('/admin/consultations') || path.includes('/admin/resolved-reports') || path.includes('/admin/notifications')) {
    openSections.management = true
  }
  
  if (path.includes('/admin/system-options')) {
    openSections.system = true
  }
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  // Close any open dropdowns when toggling
  hoveredSection.value = null
}

function toggleSection(section) {
  if (sidebarCollapsed.value) {
    // In collapsed mode, sections are handled by hover
    return
  }
  
  // Auto-collapse all other sections when opening a new one
  const wasOpen = openSections[section]
  
  // Close all sections first
  Object.keys(openSections).forEach(key => {
    openSections[key] = false
  })
  
  // Toggle the clicked section (if it was closed, open it; if it was open, keep it closed)
  openSections[section] = !wasOpen
}

function isSectionActive(section) {
  const path = route.path
  
  if (section === 'advisers') {
    return path.includes('/admin/advisers') || path.includes('/admin/advisory-classes') || path.includes('/admin/adviser-archive')
  }
  
  if (section === 'classes') {
    return path.includes('/admin/classes') || path.includes('/admin/class-archive') || path.includes('/admin/subjects')
  }
  
  if (section === 'management') {
    return path.includes('/admin/students') || path.includes('/admin/pending-registrations') || path.includes('/admin/announcements') || path.includes('/admin/consultations') || path.includes('/admin/resolved-reports') || path.includes('/admin/notifications')
  }
  
  if (section === 'system') {
    return path.includes('/admin/system-options')
  }
  
  return false
}

function handleSectionHover(event) {
  if (!sidebarCollapsed.value) return
  
  const section = event.currentTarget.getAttribute('data-section')
  if (section) {
    hoveredSection.value = section
    dropdownPosition.value = event.currentTarget.getBoundingClientRect().top
    keepDropdownOpen.value = true
  }
}

function handleSectionLeave() {
  if (!sidebarCollapsed.value) return
  
  setTimeout(() => {
    if (!keepDropdownOpen.value) {
      hoveredSection.value = null
    }
  }, 100)
}

function closeDropdown() {
  keepDropdownOpen.value = false
  setTimeout(() => {
    if (!keepDropdownOpen.value) {
      hoveredSection.value = null
    }
  }, 100)
}

// User info
const userName = computed(() => {
  if (!authStore.user) return 'Admin User'
  return `${authStore.user.firstName} ${authStore.user.lastName}`
})

const userInitials = computed(() => {
  if (!authStore.user) return 'AU'
  return `${authStore.user.firstName.charAt(0)}${authStore.user.lastName.charAt(0)}`
})

// Profile dropdown
const showProfileMenu = ref(false)

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value
}

// Close profile menu when clicking outside
const handleClickOutside = (event) => {
  const profileButton = document.querySelector('[data-profile-button]')
  const profileMenu = document.querySelector('[data-profile-menu]')
  
  if (profileButton && !profileButton.contains(event.target) && profileMenu && !profileMenu.contains(event.target)) {
    showProfileMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Page title
const pageTitle = computed(() => {
  return route.meta.title || 'Admin Dashboard'
})

// Check if a route is active
function isActive(path) {
  return route.path.startsWith(path)
}

// Logout function
function logout() {
  authStore.logout()
  router.push('/login')
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