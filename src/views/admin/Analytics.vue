<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header + Filters -->
      <div class="bg-white rounded-xl shadow-md ring-1 ring-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-medium text-gray-800">System Analytics</h1>
            <p class="text-gray-500 mt-1 font-normal">Insights derived from consultations and reports</p>
          </div>
          <div class="flex gap-3">
            <select v-model="filters.rangeDays" class="px-3 py-2 border border-gray-300 rounded-md text-sm font-normal focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option :value="7">Last 7 days</option>
              <option :value="30">Last 30 days</option>
              <option :value="90">Last 3 months</option>
              <option :value="365">Last year</option>
            </select>
            <select v-model="filters.adviserName" class="px-3 py-2 border border-gray-300 rounded-md text-sm font-normal focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Advisers</option>
              <option v-for="name in adviserOptions" :key="name" :value="name">{{ name }}</option>
            </select>
            <select v-model="filters.yearLevel" class="px-3 py-2 border border-gray-300 rounded-md text-sm font-normal focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Years</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>
            <select v-model="filters.section" class="px-3 py-2 border border-gray-300 rounded-md text-sm font-normal focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Sections</option>
              <option v-for="s in sectionOptions" :key="s" :value="s">{{ s }}</option>
            </select>
            <select v-model="filters.major" class="px-3 py-2 border border-gray-300 rounded-md text-sm font-normal focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Majors</option>
              <option v-for="m in majorOptions" :key="m" :value="m">{{ m }}</option>
            </select>
            <button @click="applyFilters" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Apply</button>
            <button @click="resetFilters" class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Reset</button>
          </div>
        </div>

        <!-- Interpretive KPI cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Average Fill Rate with ring -->
          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-4">
            <div class="relative w-12 h-12 rounded-full grid place-items-center" :style="ringStyle(kpis.fillRate, '#10b981')">
              <div class="w-9 h-9 rounded-full bg-white grid place-items-center text-xs font-medium text-gray-800">{{ kpis.fillRate }}%</div>
              </div>
            <div>
              <p class="text-xs text-gray-500">Average Fill Rate</p>
              <p class="text-lg font-medium text-gray-900">Consultations</p>
              </div>
            </div>
          <!-- Quick Resolution with ring -->
          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-4">
            <div class="relative w-12 h-12 rounded-full grid place-items-center" :style="ringStyle(kpis.quickResolution, '#3b82f6')">
              <div class="w-9 h-9 rounded-full bg-white grid place-items-center text-xs font-medium text-gray-800">{{ kpis.quickResolution }}%</div>
          </div>
            <div>
              <p class="text-xs text-gray-500">Resolved &lt; 3 days</p>
              <p class="text-lg font-medium text-gray-900">Session Issues</p>
              </div>
            </div>
          <!-- Peak window -->
          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6.75h18M3 12h18M3 17.25h18"/></svg>
          </div>
              <div>
                <p class="text-xs text-gray-500">Peak Consultation Window</p>
                <p class="text-lg font-medium text-gray-900">{{ kpis.peakWindow || '—' }}</p>
              </div>
            </div>
          </div>
          <!-- Top issue -->
          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2"/></svg>
              </div>
              <div>
                <p class="text-xs text-gray-500">Top Issue Category</p>
                <p class="text-lg font-medium text-gray-900">{{ kpis.topIssue || '—' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Graph Visibility Controls -->
      <div class="bg-white rounded-xl shadow-md ring-1 ring-gray-200 p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-800">Visible Charts</h3>
          <div class="flex flex-wrap gap-3 text-sm">
            <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="visible.workload"> Adviser Workload</label>
            <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="visible.reports"> Reports Over Time</label>
            <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="visible.issuePie"> Issue Mix</label>
            <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="visible.topClasses"> Top Classes by Session Issues</label>
            <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="visible.resolveTime"> Session Issue Resolution Time</label>
            </div>
          </div>
        </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-6 gap-6">
        <div v-if="visible.workload" class="bg-white rounded-xl shadow-md ring-1 ring-gray-200 p-4 lg:col-span-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-800">Adviser Workload & Fill</h3>
            <span class="text-xs text-gray-500">Top advisers</span>
          </div>
          <div ref="workloadRef" class="h-80 w-full"></div>
            </div>
        <div v-if="visible.issuePie" class="bg-white rounded-xl shadow-md ring-1 ring-gray-200 p-4 lg:col-span-2">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-800">Issue Breakdown</h3>
            <span class="text-xs text-gray-500">Share</span>
          </div>
          <div ref="issuePieRef" class="h-80 w-full"></div>
        </div>

        <div v-if="visible.reports" class="bg-white rounded-xl shadow-md ring-1 ring-gray-200 p-4 lg:col-span-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-800">Report Categories Over Time</h3>
            <span class="text-xs text-gray-500">Daily</span>
          </div>
          <div ref="reportsRef" class="h-80 w-full"></div>
            </div>

        <div v-if="visible.topClasses" class="bg-white rounded-xl shadow-md ring-1 ring-gray-200 p-4 lg:col-span-3">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-800">Top Classes by Session Issues</h3>
            <span class="text-xs text-gray-500">Counts</span>
          </div>
          <div ref="topClassesRef" class="h-80 w-full"></div>
        </div>

        <div v-if="visible.resolveTime" class="bg-white rounded-xl shadow-md ring-1 ring-gray-200 p-4 lg:col-span-3">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-800">Session Issue Resolution Time</h3>
            <span class="text-xs text-gray-500">Distribution</span>
            </div>
          <div ref="resolveTimeRef" class="h-80 w-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import api from '../../services/api'

// Filters
const filters = reactive({
  rangeDays: 30,
  adviserName: '',
  yearLevel: '',
  section: '',
  major: ''
})

// Options
const adviserOptions = ref([])
const sectionOptions = ref([])
const majorOptions = ref([])

// Raw data
const consultations = ref([])
const reports = ref([])

// KPI values
const kpis = reactive({ peakWindow: '', topIssue: '', fillRate: 0, escalationDelta: 0, quickResolution: 0 })

// Chart refs
const workloadRef = ref(null)
const reportsRef = ref(null)
const issuePieRef = ref(null)
const topClassesRef = ref(null)
const resolveTimeRef = ref(null)
let echarts = null
let charts = { workload: null, reports: null, issuePie: null, topClasses: null, resolveTime: null }

// Visibility toggles (persisted)
const visible = reactive({ workload: true, reports: true, issuePie: true, topClasses: true, resolveTime: true })
function loadVisibility() {
  try { const s = localStorage.getItem('analytics_visible'); if (s) Object.assign(visible, JSON.parse(s)) } catch {}
}
watch(visible, () => { localStorage.setItem('analytics_visible', JSON.stringify(visible)) }, { deep: true })

function resetFilters() {
  filters.rangeDays = 30
  filters.adviserName = ''
  filters.yearLevel = ''
  filters.section = ''
  filters.major = ''
  applyFilters()
}

function applyFilters() {
  computeKpis()
  renderCharts()
}

const now = () => new Date()
const withinRange = (d) => {
  const dt = new Date(d)
  const from = new Date()
  from.setDate(from.getDate() - Number(filters.rangeDays || 30))
  return dt >= from && dt <= now()
}

const filteredConsultations = computed(() => {
  return consultations.value.filter(c => {
    const inRange = c.createdAt ? withinRange(c.createdAt) : true
    const adviserName = (c.adviser?.firstName || '') + ' ' + (c.adviser?.lastName || '')
    const adviserOk = !filters.adviserName || adviserName.trim() === filters.adviserName
    return inRange && adviserOk
  })
})

const filteredReports = computed(() => {
  return reports.value.filter(r => {
    const inRange = r.createdAt ? withinRange(r.createdAt) : true
    const ylOk = !filters.yearLevel || r.student?.class?.yearLevel === filters.yearLevel
    const secOk = !filters.section || r.student?.class?.section === filters.section
    const majOk = !filters.major || r.student?.class?.major === filters.major
    return inRange && ylOk && secOk && majOk
  })
})

async function loadData() {
  try {
    const [consultRes, reportsRes] = await Promise.all([
      api.get('/consultations'),
      api.get('/admin/reports')
    ])
    consultations.value = Array.isArray(consultRes.data) ? consultRes.data : []
    reports.value = Array.isArray(reportsRes.data?.reports) ? reportsRes.data.reports : []

    // Options
    const adviserSet = new Set()
    consultations.value.forEach(c => {
      const name = ((c.adviser?.firstName || '') + ' ' + (c.adviser?.lastName || '')).trim()
      if (name) adviserSet.add(name)
    })
    adviserOptions.value = Array.from(adviserSet).sort()

    const sectionSet = new Set(), majorSet = new Set()
    reports.value.forEach(r => {
      const s = r.student?.class?.section, m = r.student?.class?.major
      if (s) sectionSet.add(s)
      if (m) majorSet.add(m)
    })
    sectionOptions.value = Array.from(sectionSet).sort()
    majorOptions.value = Array.from(majorSet).sort()

    computeKpis()
    await ensureEcharts()
    renderCharts()
  } catch (e) {
    console.error('Analytics load failed', e)
  }
}

function computeKpis() {
  // Fill rate
  const cons = filteredConsultations.value
  const totals = cons.reduce((acc, c) => {
    acc.booked += Number(c.bookedStudents || 0)
    acc.max += Number(c.maxStudents || 0)
    return acc
  }, { booked: 0, max: 0 })
  kpis.fillRate = totals.max > 0 ? Math.round((totals.booked / totals.max) * 100) : 0

  // Peak window (weekday + hour block)
  const bucket = {}
  cons.forEach(c => {
    const dayIdx = Number(c.dayOfWeek)
    const start = Number(c.startTime)
    if (isFinite(dayIdx) && isFinite(start)) {
      const key = `${dayIdx}-${start}`
      bucket[key] = (bucket[key] || 0) + 1
    }
  })
  let peak = { key: '', val: 0 }
  Object.entries(bucket).forEach(([k, v]) => { if (v > peak.val) peak = { key: k, val: v } })
  if (peak.key) {
    const [d, h] = peak.key.split('-').map(Number)
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    const labelHour = (hr) => {
      const ampm = hr >= 12 ? 'PM' : 'AM'
      const disp = hr > 12 ? hr - 12 : (hr === 0 ? 12 : hr)
      return `${disp}:00 ${ampm}`
    }
    kpis.peakWindow = `${days[(d % 7 + 6) % 7]} ${labelHour(h)}`
  } else kpis.peakWindow = ''

  // Top issue
  const issueCounts = filteredReports.value.reduce((acc, r) => {
    acc[r.issueType] = (acc[r.issueType] || 0) + 1
    return acc
  }, {})
  const issueMap = { session_submission: 'Session Issues', enrollment_risk: 'Enrollment Risk', consultation_escalation: 'Escalations' }
  let topIssue = Object.entries(issueCounts).sort((a,b) => b[1]-a[1])[0]
  kpis.topIssue = topIssue ? (issueMap[topIssue[0]] || topIssue[0]) : ''

  // Escalation delta vs previous equal period
  const days = Number(filters.rangeDays || 30)
  const start = new Date(); start.setDate(start.getDate() - days)
  const prevStart = new Date(); prevStart.setDate(prevStart.getDate() - days * 2)
  const prevEnd = new Date(); prevEnd.setDate(prevEnd.getDate() - days)
  const inRange = (d, a, b) => (new Date(d) >= a && new Date(d) < b)
  const cur = reports.value.filter(r => r.issueType === 'consultation_escalation' && r.createdAt && inRange(r.createdAt, start, new Date())).length
  const prev = reports.value.filter(r => r.issueType === 'consultation_escalation' && r.createdAt && inRange(r.createdAt, prevStart, prevEnd)).length
  kpis.escalationDelta = prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100)

  // Quick resolution rate (<3 days) for session issues
  const issues = filteredReports.value.filter(r => r.issueType === 'session_submission')
  let quick = 0, total = 0
  issues.forEach(r => {
    if (!r.createdAt) return
    total++
    if ((r.status || '').toLowerCase() === 'resolved' && r.updatedAt) {
      const diff = (new Date(r.updatedAt) - new Date(r.createdAt)) / (1000*60*60*24)
      if (diff < 3) quick++
    }
  })
  kpis.quickResolution = total > 0 ? Math.round((quick/total)*100) : 0
}

async function ensureEcharts() {
  if (echarts) return
  await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js'
    script.onload = () => { echarts = window.echarts; resolve() }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function disposeCharts() {
  Object.keys(charts).forEach(k => { if (charts[k]) { charts[k].dispose(); charts[k] = null } })
}

function renderCharts() {
  if (!echarts) return
  disposeCharts()

  // Adviser workload stacked bar
  const adviserAgg = {}
  filteredConsultations.value.forEach(c => {
    const name = ((c.adviser?.firstName || '') + ' ' + (c.adviser?.lastName || '')).trim() || 'Unknown'
    if (!adviserAgg[name]) adviserAgg[name] = { booked: 0, capacity: 0 }
    adviserAgg[name].booked += Number(c.bookedStudents || 0)
    adviserAgg[name].capacity += Number(c.maxStudents || 0)
  })
  const topAdvisers = Object.entries(adviserAgg).sort((a,b)=> (b[1].capacity)-(a[1].capacity)).slice(0,6)
  charts.workload = echarts.init(workloadRef.value)
  charts.workload.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Booked','Remaining'] },
    grid: { left: 40, right: 20, bottom: 40, top: 20 },
    xAxis: { type: 'category', data: topAdvisers.map(([n])=>n) },
    yAxis: { type: 'value' },
    series: [
      { name: 'Booked', type: 'bar', stack: 'total', itemStyle: { color: '#60a5fa' }, data: topAdvisers.map(([,v])=>v.booked) },
      { name: 'Remaining', type: 'bar', stack: 'total', itemStyle: { color: '#a7f3d0' }, data: topAdvisers.map(([,v])=> Math.max(0, v.capacity - v.booked)) }
    ]
  })

  // Reports over time (lines per category)
  const byDay = {}
  const issues = ['session_submission','enrollment_risk','consultation_escalation']
  filteredReports.value.forEach(r => {
    const d = r.createdAt ? new Date(r.createdAt) : null
    if (!d) return
    const key = d.toISOString().slice(0,10)
    if (!byDay[key]) byDay[key] = { session_submission:0, enrollment_risk:0, consultation_escalation:0 }
    if (issues.includes(r.issueType)) byDay[key][r.issueType]++
  })
  const daysSorted = Object.keys(byDay).sort()
  charts.reports = echarts.init(reportsRef.value)
  charts.reports.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Session Issues','Enrollment Risk','Escalations'] },
    grid: { left: 40, right: 20, bottom: 40, top: 20 },
    xAxis: { type: 'category', data: daysSorted },
    yAxis: { type: 'value' },
    series: [
      { name: 'Session Issues', type: 'line', smooth: true, data: daysSorted.map(d=>byDay[d].session_submission), lineStyle:{width:2} },
      { name: 'Enrollment Risk', type: 'line', smooth: true, data: daysSorted.map(d=>byDay[d].enrollment_risk), lineStyle:{width:2} },
      { name: 'Escalations', type: 'line', smooth: true, data: daysSorted.map(d=>byDay[d].consultation_escalation), lineStyle:{width:2} }
    ]
  })

  // Issue pie
  const issueCounts = issues.map(k => ({ key: k, label: k==='session_submission'?'Session Issues':k==='enrollment_risk'?'Enrollment Risk':'Escalations', value: filteredReports.value.filter(r=>r.issueType===k).length }))
  charts.issuePie = echarts.init(issuePieRef.value)
  charts.issuePie.setOption({
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [{
      type: 'pie', radius: ['35%','65%'], itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      data: issueCounts.map(i => ({ name: i.label, value: i.value }))
    }]
  })

  // Top classes by session issues (horizontal bar)
  const sessionIssueReports = filteredReports.value.filter(r => r.issueType === 'session_submission')
  const classCounts = {}
  sessionIssueReports.forEach(r => {
    const cl = r.student?.class
    const label = cl ? `${cl.yearLevel || ''} ${cl.section || ''} ${cl.major ? '('+cl.major+')' : ''}`.trim() : 'Unknown Class'
    classCounts[label] = (classCounts[label] || 0) + 1
  })
  const topClasses = Object.entries(classCounts).sort((a,b)=>b[1]-a[1]).slice(0,8)
  charts.topClasses = echarts.init(topClassesRef.value)
  charts.topClasses.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 120, right: 20, bottom: 20, top: 10 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: topClasses.map(([k])=>k) },
    series: [{ type: 'bar', data: topClasses.map(([,v])=>v), itemStyle: { color: '#a78bfa' } }]
  })

  // Resolution time distribution (bars)
  const buckets = { '<1d':0, '1-3d':0, '3-7d':0, '7d+':0 }
  sessionIssueReports.forEach(r => {
    if ((r.status || '').toLowerCase() !== 'resolved' || !r.createdAt || !r.updatedAt) return
    const diff = (new Date(r.updatedAt) - new Date(r.createdAt)) / (1000*60*60*24)
    if (diff < 1) buckets['<1d']++
    else if (diff < 3) buckets['1-3d']++
    else if (diff < 7) buckets['3-7d']++
    else buckets['7d+']++
  })
  charts.resolveTime = echarts.init(resolveTimeRef.value)
  charts.resolveTime.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, bottom: 20, top: 10 },
    xAxis: { type: 'category', data: Object.keys(buckets) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: Object.values(buckets), itemStyle: { color: '#34d399' } }]
  })

  setTimeout(() => { Object.values(charts).forEach(ch => ch && ch.resize()) }, 0)
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', () => { Object.values(charts).forEach(ch => ch && ch.resize()) })
  loadVisibility()
})

watch(() => ({...filters}), () => { /* reactive if fields change directly */ }, { deep: true })

// KPI ring style helper
function ringStyle(pct, color) {
  const clamped = Math.max(0, Math.min(100, Number(pct)||0))
  return {
    background: `conic-gradient(${color} ${clamped}%, #e5e7eb 0)`
  }
}
</script>

<style scoped>
.h-80 { height: 20rem; }
</style>
