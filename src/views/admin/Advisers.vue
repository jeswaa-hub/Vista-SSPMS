<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">Advisers Management</h1>
            <p class="text-gray-500 mt-1 font-normal">Manage adviser accounts and assignments</p>
          </div>
          <button 
            @click="openAddModal" 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Adviser
            </span>
          </button>
        </div>
      </div>

      <!-- Advisers Table -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <!-- Search Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center">
            <div class="relative max-w-md">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input 
                v-model="search" 
                type="text" 
                placeholder="Search by name or ID" 
                class="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
        
        <!-- Table Content -->
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span class="ml-3 text-gray-500">Loading advisers...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredAdvisers.length === 0">
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <h3 class="text-base font-normal text-gray-800 mb-1">
                    {{ search ? 'No advisers found' : 'No advisers yet' }}
                  </h3>
                  <p class="text-gray-500 font-normal">
                    {{ search ? 'Try adjusting your search criteria' : 'Add your first adviser to get started' }}
                  </p>
                </td>
              </tr>
              <tr v-for="adviser in filteredAdvisers" :key="adviser._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ adviser.idNumber || 'N/A' }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span class="text-sm font-normal text-blue-600">
                        {{ adviser.firstName?.charAt(0) }}{{ adviser.lastName?.charAt(0) }}
                      </span>
                    </div>
                    <div>
                      <div class="text-sm font-normal text-gray-800">
                        {{ adviser.salutation || '' }} {{ adviser.firstName || '' }} {{ adviser.middleName ? adviser.middleName + ' ' : '' }}{{ adviser.lastName || '' }} {{ adviser.nameExtension && adviser.nameExtension !== 'N/A' ? adviser.nameExtension : '' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ adviser.email || 'N/A' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ adviser.contactNumber || 'N/A' }}
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-normal rounded-md"
                    :class="adviser.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-700 border border-gray-200'"
                  >
                    {{ adviser.status ? (adviser.status.charAt(0).toUpperCase() + adviser.status.slice(1)) : 'Unknown' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button 
                      @click="viewAdviser(adviser)" 
                      class="px-3 py-1.5 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                    >
                      View
                    </button>
                    <button 
                      @click="editAdviser(adviser)" 
                      class="px-3 py-1.5 text-xs font-normal text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeAddModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Add New Adviser</h3>
          <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Salutation</label>
              <select
                v-model="newAdviser.salutation"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Salutation</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                v-model="newAdviser.firstName"
                type="text"
                placeholder="First Name"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.firstName }"
              />
              <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
              <input
                v-model="newAdviser.middleName"
                type="text"
                placeholder="Middle Name"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                v-model="newAdviser.lastName"
                type="text"
                placeholder="Last Name"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.lastName }"
              />
              <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name Extension</label>
              <input
                v-model="newAdviser.nameExtension"
                type="text"
                placeholder="e.g., Jr., Sr., III"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ID Number *</label>
              <input
                v-model="newAdviser.idNumber"
                type="text"
                placeholder="ID Number"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.idNumber }"
              />
              <p v-if="errors.idNumber" class="mt-1 text-sm text-red-600">{{ errors.idNumber }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                v-model="newAdviser.email"
                type="email"
                placeholder="Email"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.email }"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
              <input
                v-model="newAdviser.contactNumber"
                type="text"
                placeholder="e.g., 09123456789"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.contactNumber }"
              />
              <p v-if="errors.contactNumber" class="mt-1 text-sm text-red-600">{{ errors.contactNumber }}</p>
            </div>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex">
              <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <div class="ml-3">
                <h4 class="text-sm font-medium text-blue-800">Important Notice</h4>
                <p class="text-sm text-blue-700 mt-1">The adviser will receive an email with login instructions. They will be required to change their password on first login.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
          <button
            @click="closeAddModal"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="addAdviser"
            class="px-4 py-2 text-sm font-normal text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add Adviser
          </button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeDetailsModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Adviser Details</h3>
          <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6 space-y-4">
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-blue-200">
                <span class="text-lg font-normal text-blue-600">
                  {{ selectedAdviser.firstName?.charAt(0) }}{{ selectedAdviser.lastName?.charAt(0) }}
                </span>
              </div>
              <div>
                <h4 class="text-base font-medium text-gray-800">
                  {{ selectedAdviser.salutation || '' }} {{ selectedAdviser.firstName || '' }} {{ selectedAdviser.middleName ? selectedAdviser.middleName + ' ' : '' }}{{ selectedAdviser.lastName || '' }} {{ selectedAdviser.nameExtension && selectedAdviser.nameExtension !== 'N/A' ? selectedAdviser.nameExtension : '' }}
                </h4>
                <p class="text-sm text-gray-600">{{ selectedAdviser.idNumber || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="flex items-center space-x-3">
                <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <div class="flex-1">
                  <p class="text-xs text-gray-500">Email</p>
                  <p class="text-sm text-gray-800">{{ selectedAdviser.email || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="flex items-center space-x-3">
                <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <div class="flex-1">
                  <p class="text-xs text-gray-500">Contact Number</p>
                  <p class="text-sm text-gray-800">{{ selectedAdviser.contactNumber || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedAdviser.advisoryClasses && selectedAdviser.advisoryClasses.length > 0">
            <h5 class="text-sm font-medium text-gray-700 mb-3">Advisory Classes</h5>
            <div class="space-y-2">
              <div v-for="(aClass, index) in selectedAdviser.advisoryClasses" :key="index" 
                   class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p class="text-sm text-gray-800">
                  {{ aClass.yearLevel }} Year - {{ aClass.section }} ({{ aClass.major }})
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            @click="closeDetailsModal"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
          <button
            @click="() => { editAdviser(selectedAdviser); closeDetailsModal(); }"
            class="px-4 py-2 text-sm font-normal text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Edit Adviser
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeEditModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Edit Adviser</h3>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Salutation</label>
              <select
                v-model="editedAdviser.salutation"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Salutation</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                v-model="editedAdviser.firstName"
                type="text"
                placeholder="First Name"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.firstName }"
              />
              <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
              <input
                v-model="editedAdviser.middleName"
                type="text"
                placeholder="Middle Name"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                v-model="editedAdviser.lastName"
                type="text"
                placeholder="Last Name"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.lastName }"
              />
              <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name Extension</label>
              <input
                v-model="editedAdviser.nameExtension"
                type="text"
                placeholder="e.g., Jr., Sr., III"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ID Number *</label>
              <input
                v-model="editedAdviser.idNumber"
                type="text"
                placeholder="ID Number"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.idNumber }"
              />
              <p v-if="errors.idNumber" class="mt-1 text-sm text-red-600">{{ errors.idNumber }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                v-model="editedAdviser.email"
                type="email"
                placeholder="Email"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.email }"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
              <input
                v-model="editedAdviser.contactNumber"
                type="text"
                placeholder="e.g., 09123456789"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.contactNumber }"
              />
              <p v-if="errors.contactNumber" class="mt-1 text-sm text-red-600">{{ errors.contactNumber }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                v-model="editedAdviser.status"
                class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            @click="archiveAdviser"
            class="px-4 py-2 text-sm font-normal text-white bg-amber-600 rounded-md hover:bg-amber-700"
          >
            Archive
          </button>
          <div class="flex space-x-3">
            <button
              @click="closeEditModal"
              class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              @click="updateAdviser"
              class="px-4 py-2 text-sm font-normal text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watchEffect } from 'vue'
import { adviserService } from '../../services/adviserService'
import { notificationService } from '../../services/notificationService'
import api from '../../services/api'

// State
const advisers = ref([])
const allAdvisers = ref([])
const loading = ref(true)
const search = ref('')
const showAddModal = ref(false)
const showDetailsModal = ref(false)
const showEditModal = ref(false)
const selectedAdviser = ref(null)

// Form state
const newAdviser = reactive({
  salutation: '',
  firstName: '',
  middleName: '',
  lastName: '',
  nameExtension: '',
  contactNumber: '',
  idNumber: '',
  email: '',
  status: 'active',
  role: 'adviser'
})

const editedAdviser = reactive({
  salutation: '',
  firstName: '',
  middleName: '',
  lastName: '',
  nameExtension: '',
  contactNumber: '',
  idNumber: '',
  email: '',
  status: 'active'
})

// Error state
const errors = reactive({
  firstName: '',
  lastName: '',
  idNumber: '',
  email: '',
  contactNumber: ''
})

onMounted(() => {
  console.log('Advisers component mounted')
  fetchAdvisers()
})

// Filter advisers based on search
const filteredAdvisers = computed(() => {
  if (!search.value) return advisers.value
  
  const searchTerm = search.value.toLowerCase()
  return advisers.value.filter(adviser => {
    const fullName = `${adviser.salutation || ''} ${adviser.firstName || ''} ${adviser.lastName || ''}`.toLowerCase()
    const idNumber = adviser.idNumber?.toLowerCase() || ''
    const email = adviser.email?.toLowerCase() || ''
    
    return fullName.includes(searchTerm) || 
           idNumber.includes(searchTerm) ||
           email.includes(searchTerm)
  })
})

// Watch for search changes
watchEffect(() => {
  console.log('Search changed:', search.value)
  // Just reference search.value to trigger the watcher
  const searchTerm = search.value
  // No need to do anything in the body, the computed property will handle filtering
})

async function fetchAdvisers() {
  try {
    console.log('Starting to fetch advisers')
    loading.value = true
    const response = await adviserService.getAll()
    console.log('Advisers API response:', response)
    if (response && response.data) {
      advisers.value = response.data
      allAdvisers.value = response.data
      console.log('Advisers loaded:', advisers.value.length)
    } else {
      console.error('Invalid response format:', response)
      advisers.value = []
      allAdvisers.value = []
    }
  } catch (error) {
    console.error('Error fetching advisers:', error)
    notificationService.showError('Failed to load advisers. Please try again.')
    advisers.value = []
    allAdvisers.value = []
  } finally {
    loading.value = false
  }
}

async function openAddModal() {
  console.log('Opening add adviser modal')
  
  // Reset form first
  Object.keys(newAdviser).forEach(key => {
    if (key === 'status') {
      newAdviser[key] = 'active'
    } else if (key === 'role') {
      newAdviser[key] = 'adviser'
    } else {
      newAdviser[key] = ''
    }
  })
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  // Show the modal
  showAddModal.value = true
  console.log('Modal visibility set to:', showAddModal.value)
}

function closeAddModal() {
  showAddModal.value = false
}

function validateForm() {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  if (!newAdviser.firstName) {
    errors.firstName = 'First name is required'
    isValid = false
  }
  
  if (!newAdviser.lastName) {
    errors.lastName = 'Last name is required'
    isValid = false
  }
  
  if (!newAdviser.idNumber) {
    errors.idNumber = 'ID number is required'
    isValid = false
  }
  
  if (!newAdviser.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(newAdviser.email)) {
    errors.email = 'Invalid email format'
    isValid = false
  }
  
  if (!newAdviser.contactNumber) {
    errors.contactNumber = 'Contact number is required'
    isValid = false
  }
  
  return isValid
}

async function addAdviser() {
  if (!validateForm()) {
    return
  }
  
  try {
    // Prepare the adviser object with role and welcome email request
    const adviserData = {
      ...newAdviser,
      role: 'adviser',
      sendWelcomeEmail: true // Changed from sendPasswordResetEmail to match backend
    }
    
    // Log what we're sending
    console.log('Creating adviser account with data:', adviserData)
    
    const response = await adviserService.create(adviserData)
    
    // Refresh the advisers list
    await fetchAdvisers()
    
    notificationService.showSuccess('Adviser account created successfully. A password reset link has been sent to their email.')
    closeAddModal()
  } catch (error) {
    console.error('Error adding adviser:', error)
    let errorMessage = 'Failed to add adviser. Please try again later.'
    
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    }
    
    notificationService.showError(errorMessage)
  }
}

function viewAdviser(adviser) {
  // Save selected adviser for view
  selectedAdviser.value = adviser
  showDetailsModal.value = true
}

function editAdviser(adviser) {
  // Reset form and errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  // Set current adviser data to form
  selectedAdviser.value = { ...adviser }
  
  // Set edited adviser fields with fallbacks to empty strings
  editedAdviser.salutation = adviser.salutation || ''
  editedAdviser.firstName = adviser.firstName || ''
  editedAdviser.lastName = adviser.lastName || ''
  editedAdviser.idNumber = adviser.idNumber || ''
  editedAdviser.email = adviser.email || ''
  editedAdviser.status = adviser.status || 'active'
  editedAdviser.contactNumber = adviser.contactNumber || ''
  editedAdviser._id = adviser._id
  
  // Show the edit modal
  showEditModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedAdviser.value = null
}

function closeEditModal() {
  showEditModal.value = false
}

async function updateAdviser() {
  if (!validateAdviserForm(editedAdviser)) {
    return
  }
  
  try {
    console.log('Updating adviser with data:', editedAdviser)
    const response = await adviserService.update(selectedAdviser.value._id, editedAdviser)
    
    // Refresh advisers list
    await fetchAdvisers()
    
    notificationService.showSuccess('Adviser updated successfully')
    closeEditModal()
  } catch (error) {
    console.error('Error updating adviser:', error)
    let errorMessage = 'Failed to update adviser. Please try again later.'
    
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    }
    
    notificationService.showError(errorMessage)
  }
}

function validateAdviserForm(adviser) {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  if (!adviser.firstName) {
    errors.firstName = 'First name is required'
    isValid = false
  }
  
  if (!adviser.lastName) {
    errors.lastName = 'Last name is required'
    isValid = false
  }
  
  if (!adviser.idNumber) {
    errors.idNumber = 'ID number is required'
    isValid = false
  }
  
  if (!adviser.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(adviser.email)) {
    errors.email = 'Invalid email format'
    isValid = false
  }
  
  if (!adviser.contactNumber) {
    errors.contactNumber = 'Contact number is required'
    isValid = false
  }
  
  return isValid
}

async function archiveAdviser() {
  try {
    if (!confirm(`Are you sure you want to archive ${selectedAdviser.value.firstName} ${selectedAdviser.value.lastName}? This adviser will be moved to the archive list.`)) {
      return;
    }
    
    // Set status to inactive to archive
    await api.put(`/advisers/${selectedAdviser.value._id}`, {
      ...selectedAdviser.value,
      status: 'inactive'
    });
    
    await fetchAdvisers();
    notificationService.showSuccess('Adviser archived successfully');
    closeEditModal();
  } catch (error) {
    console.error('Error archiving adviser:', error);
    let errorMessage = 'Failed to archive adviser. Please try again later.';
    
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    
    notificationService.showError(errorMessage);
  }
}
</script>