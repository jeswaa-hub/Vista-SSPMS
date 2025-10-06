// Navigation configuration for different user types
// Using string references for icons that will be resolved in the UnifiedSidebar component

// Admin navigation
export const adminNavigation = [
  { label: 'Dashboard', path: '/admin', icon: 'HomeIcon' },
  { label: 'Analytics', path: '/admin/analytics', icon: 'ChartBarIcon' },
  {
    label: 'Advisers',
    key: 'advisers',
    icon: 'UsersIcon',
    children: [
      { label: 'Advisers List', path: '/admin/advisers' },
      { label: 'Advisory Classes', path: '/admin/advisory-classes' },
      { label: 'Adviser Archive', path: '/admin/adviser-archive' },
    ],
  },
  {
    label: 'Classes',
    key: 'classes',
    icon: 'AcademicCapIcon',
    children: [
      { label: 'Classes List', path: '/admin/classes' },
      { label: 'Class Archive', path: '/admin/class-archive' },
      { label: 'SSP Subjects', path: '/admin/subjects' },
      // Removed Classes History per request
    ],
  },
  {
    label: 'Management',
    key: 'management',
    icon: 'Squares2X2Icon',
    children: [
      { label: 'Students', path: '/admin/students' },
      { label: 'Student Archive', path: '/admin/student-archive' },
      { label: 'Pending Registrations', path: '/admin/pending-registrations' },
      { label: 'Announcements', path: '/admin/announcements' },
      { label: 'Resolved Reports', path: '/admin/resolved-reports' },
      { label: 'Consultations', path: '/admin/consultations' },
      { label: 'Dropping Request', path: '/admin/notifications' },
    ],
  },
  {
    label: 'System',
    key: 'system',
    icon: 'Cog6ToothIcon',
    children: [
      { label: 'System Options', path: '/admin/system-options' },
    ],
  },
];

// Adviser navigation
export const adviserNavigation = [
  { label: 'Dashboard', path: '/adviser', icon: 'HomeIcon' },
  { label: 'Profile', path: '/adviser/profile', icon: 'UserCircleIcon' },
  { label: 'Announcements', path: '/adviser/announcements', icon: 'MegaphoneIcon' },
  {
    label: 'Consultations',
    key: 'consultations',
    icon: 'CalendarDaysIcon',
    children: [
      { label: 'My Consultations', path: '/adviser/consultations' },
    ],
  },
  {
    label: 'Classes',
    key: 'classes',
    icon: 'AcademicCapIcon',
    children: [
      { label: 'My Classes', path: '/adviser/classes' },
      { label: 'Classes History', path: '/adviser/classes-history' },
    ],
  },
  {
    label: 'Odyssey Plan',
    key: 'odyssey',
    icon: 'MapIcon',
    children: [
      { label: 'Student Plans', path: '/adviser/odyssey' },
    ],
  },
  {
    label: 'M & M',
    key: 'mm',
    icon: 'ClipboardDocumentListIcon',
    children: [
      { label: 'M&M Submissions', path: '/adviser/mm' },
      { label: 'Permit Submissions', path: '/adviser/permit-submissions' },
    ],
  },
];

// Student navigation
export const studentNavigation = [
  { label: 'Dashboard', path: '/student', icon: 'HomeIcon' },
  { label: 'Profile', path: '/student/profile', icon: 'UserCircleIcon' },
  { label: 'Announcements', path: '/student/announcements', icon: 'MegaphoneIcon' },
  { label: 'Notifications', path: '/student/notifications', icon: 'BellIcon' },
  {
    label: 'Consultations',
    key: 'consultations',
    icon: 'CalendarDaysIcon',
    children: [
      { label: 'Book Consultation', path: '/student/consultations' },
      { label: 'My Bookings', path: '/student/my-bookings' },
    ],
  },
  {
    label: 'SSP',
    key: 'ssp',
    icon: 'DocumentTextIcon',
    children: [
      { label: 'Current Sessions', path: '/student/ssp' },
      { label: 'Session History', path: '/student/ssp-history' },
    ],
  },
  {
    label: 'Odyssey Plan',
    key: 'odyssey',
    icon: 'MapIcon',
    children: [
      { label: 'Current Plan', path: '/student/odyssey-plan' },
      { label: 'Archive Odyssey Plan', path: '/student/archived-odyssey-plans' },
    ],
  },
  {
    label: 'M & M',
    key: 'mm',
    icon: 'ClipboardDocumentListIcon',
    children: [
      { label: 'Submit M&M', path: '/student/surveys' },
      { label: 'M&M History', path: '/student/mm-history' },
    ],
  },
];