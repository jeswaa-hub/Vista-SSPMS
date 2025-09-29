// Route preloading utilities for better performance

const preloadedRoutes = new Set()

// Critical admin routes that should be preloaded
const CRITICAL_ADMIN_ROUTES = [
  'Dashboard',
  'Students', 
  'Classes',
  'Advisers'
]

// Preload a specific route component
export async function preloadRoute(routeName) {
  if (preloadedRoutes.has(routeName)) {
    return // Already preloaded
  }

  try {
    const routeMap = {
      // Admin routes
      Dashboard: () => import('../views/admin/Dashboard.vue'),
      Analytics: () => import('../views/admin/Analytics.vue'),
      Advisers: () => import('../views/admin/Advisers.vue'),
      AdvisoryClasses: () => import('../views/admin/AdvisoryClasses.vue'),
      AdviserArchive: () => import('../views/admin/AdviserArchive.vue'),
      Classes: () => import('../views/admin/Classes.vue'),
      ClassArchive: () => import('../views/admin/ClassArchive.vue'),
      Subjects: () => import('../views/admin/Subjects.vue'),
      Students: () => import('../views/admin/Students.vue'),
      StudentArchive: () => import('../views/admin/StudentArchive.vue'),
      PendingRegistrations: () => import('../views/admin/PendingRegistrations.vue'),
      Announcements: () => import('../views/admin/Announcements.vue'),
      Profile: () => import('../views/admin/Profile.vue'),
      SystemOptions: () => import('../views/admin/SystemOptions.vue'),
      Consultations: () => import('../views/admin/Consultations.vue'),
      Notifications: () => import('../views/admin/Notifications.vue'),
      ResolvedReports: () => import('../views/admin/ResolvedReports.vue'),
      
      // Adviser routes
      AdviserDashboard: () => import('../views/adviser/Dashboard.vue'),
      AdviserProfile: () => import('../views/adviser/Profile.vue'),
      AdviserClasses: () => import('../views/adviser/Classes.vue'),
      AdviserConsultations: () => import('../views/adviser/Consultations.vue'),
      
      // Student routes  
      StudentDashboard: () => import('../views/student/Dashboard.vue'),
      StudentProfile: () => import('../views/student/Profile.vue'),
      StudentConsultations: () => import('../views/student/Consultations.vue')
    }

    const importFn = routeMap[routeName]
    if (importFn) {
      await importFn()
      preloadedRoutes.add(routeName)
      console.log(`✅ Preloaded route: ${routeName}`)
    }
  } catch (error) {
    console.warn(`Failed to preload route ${routeName}:`, error)
  }
}

// Preload critical admin routes in background
export async function preloadCriticalAdminRoutes() {
  const preloadPromises = CRITICAL_ADMIN_ROUTES.map(route => 
    preloadRoute(route).catch(err => console.warn(`Failed to preload ${route}:`, err))
  )
  
  await Promise.allSettled(preloadPromises)
  console.log('🚀 Critical admin routes preloaded')
}

// Preload routes based on user navigation patterns
export function preloadBasedOnRoute(currentRoute) {
  const routePreloadMap = {
    // When on dashboard, preload commonly accessed routes
    'Dashboard': ['Students', 'Classes', 'Analytics'],
    
    // When on students, preload related routes  
    'Students': ['Classes', 'PendingRegistrations', 'StudentArchive'],
    
    // When on classes, preload related routes
    'Classes': ['Students', 'Subjects', 'ClassArchive'],
    
    // When on advisers, preload related routes
    'Advisers': ['AdvisoryClasses', 'AdviserArchive'],
    
    // Management section
    'Announcements': ['Students', 'Consultations'],
    'Consultations': ['Students', 'Advisers'],
    
    // System section
    'SystemOptions': ['Profile', 'Analytics']
  }

  const routesToPreload = routePreloadMap[currentRoute] || []
  
  // Preload in background with small delays to avoid blocking
  routesToPreload.forEach((route, index) => {
    setTimeout(() => {
      preloadRoute(route)
    }, index * 100) // Stagger preloading
  })
}

// Preload based on hover intent (for nav items)
export function preloadOnHover(routeName, delay = 200) {
  let timeoutId
  
  return {
    onMouseEnter: () => {
      timeoutId = setTimeout(() => {
        preloadRoute(routeName)
      }, delay)
    },
    onMouseLeave: () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }
}

// Get preloading stats
export function getPreloadingStats() {
  return {
    preloadedCount: preloadedRoutes.size,
    preloadedRoutes: Array.from(preloadedRoutes)
  }
}
