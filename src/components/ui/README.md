# UI Components Usage Guide

## SmoothLoader

A versatile loading component that provides smooth transitions between loading and content states.

### Basic Usage
```vue
<template>
  <SmoothLoader :loading="isLoading">
    <YourContent />
  </SmoothLoader>
</template>
```

### With Skeleton Loading
```vue
<template>
  <SmoothLoader 
    :loading="isLoading" 
    show-skeleton 
    skeleton-type="table"
    :skeleton-rows="5"
  >
    <DataTable />
  </SmoothLoader>
</template>
```

### With Progress Indicator
```vue
<template>
  <SmoothLoader 
    :loading="isLoading"
    show-progress
    :progress="loadingProgress"
    progress-text="Loading dashboard..."
    size="lg"
  >
    <Dashboard />
  </SmoothLoader>
</template>
```

### Props
- `loading` (Boolean): Controls loading state
- `size` (String): 'sm', 'md', 'lg', 'xl' - spinner size
- `showSkeleton` (Boolean): Show skeleton instead of spinner
- `skeletonType` (String): 'table', 'card', 'stats', 'list', 'text', 'calendar'
- `skeletonRows` (Number): Number of skeleton rows
- `skeletonLines` (Number): Number of text lines for text skeleton
- `fullHeight` (Boolean): Take full screen height
- `showProgress` (Boolean): Show progress bar
- `progress` (Number): Progress percentage (0-100)
- `progressText` (String): Custom progress text

## SkeletonLoader

A standalone skeleton loading component for different content types.

### Usage Examples

#### Table Skeleton
```vue
<SkeletonLoader type="table" :rows="10" />
```

#### Card Skeleton
```vue
<SkeletonLoader type="card" />
```

#### Dashboard Stats Skeleton
```vue
<SkeletonLoader type="stats" />
```

#### List Skeleton
```vue
<SkeletonLoader type="list" :rows="6" />
```

#### Text Skeleton
```vue
<SkeletonLoader type="text" :lines="4" />
```

#### Calendar Skeleton
```vue
<SkeletonLoader type="calendar" />
```

### Props
- `type` (String): 'table', 'card', 'stats', 'list', 'text', 'calendar', 'custom'
- `rows` (Number): Number of rows for table/list skeletons
- `lines` (Number): Number of lines for text skeleton

## Implementation in Views

### Replace Basic Loading Spinners

**Before:**
```vue
<div v-if="loading" class="flex justify-center p-8">
  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
</div>
<div v-else>
  <Content />
</div>
```

**After:**
```vue
<SmoothLoader :loading="loading" show-skeleton skeleton-type="table">
  <Content />
</SmoothLoader>
```

### For Data Tables
```vue
<SmoothLoader 
  :loading="loadingStudents" 
  show-skeleton 
  skeleton-type="table"
  :skeleton-rows="10"
>
  <StudentsTable :students="students" />
</SmoothLoader>
```

### For Dashboard Cards
```vue
<SmoothLoader 
  :loading="loadingStats" 
  show-skeleton 
  skeleton-type="stats"
>
  <StatsCards :stats="dashboardStats" />
</SmoothLoader>
```

### For Forms
```vue
<SmoothLoader 
  :loading="loadingForm" 
  show-skeleton 
  skeleton-type="card"
>
  <UserForm />
</SmoothLoader>
```

## Fast Loading Integration

### Using with useFastLoading composable
```vue
<script setup>
import { useFastLoading } from '@/composables/useLoading'
import SmoothLoader from '@/components/ui/SmoothLoader.vue'

const { isLoading, fetchWithCache } = useFastLoading()

const loadData = async () => {
  const data = await fetchWithCache(
    'students-list',
    () => api.get('/students'),
    { ttl: 300000 } // 5 minutes cache
  )
  // Process data...
}
</script>

<template>
  <SmoothLoader :loading="isLoading('students-list')" show-skeleton skeleton-type="table">
    <StudentsTable />
  </SmoothLoader>
</template>
```

## Best Practices

1. **Choose Appropriate Skeleton Types**: Match skeleton type to content structure
2. **Use Caching**: Implement `useFastLoading` for data that doesn't change frequently
3. **Progressive Loading**: Load critical content first, secondary content later
4. **Consistent Timing**: Use similar loading durations across the application
5. **Error States**: Handle error states gracefully with appropriate feedback

## Migration Guide

To migrate existing views to use the new loading components:

1. Import the components:
   ```vue
   import SmoothLoader from '@/components/ui/SmoothLoader.vue'
   import { useFastLoading } from '@/composables/useLoading'
   ```

2. Replace loading conditionals with SmoothLoader wrapper
3. Add appropriate skeleton types based on content
4. Implement caching for API calls using useFastLoading
5. Test loading states and adjust skeleton configurations as needed
