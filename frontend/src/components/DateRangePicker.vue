<template>
  <div class="drp-wrapper">
    <!-- Trigger Button -->
    <button class="drp-trigger" @click="open = !open">
      <span>📅</span>
      <span>{{ displayLabel }}</span>
      <span class="drp-arrow">▾</span>
    </button>

    <!-- Popup -->
    <div v-if="open" class="drp-popup">
      <div class="drp-calendars">

        <!-- Linker Monat -->
        <div class="drp-calendar">
          <div class="drp-cal-header">
            <button @click="prevMonth">‹</button>
            <span>{{ monthLabel(leftYear, leftMonth) }}</span>
            <button @click="nextMonth">›</button>
          </div>
          <div class="drp-grid">
            <div v-for="d in weekdays" :key="d" class="drp-weekday">{{ d }}</div>
            <div v-for="cell in leftCells" :key="cell.key"
                 class="drp-day"
                 :class="dayClass(cell)"
                 @click="selectDay(cell)"
                 @mouseenter="onHoverDay(cell)"
            >
              {{ cell.day }}
            </div>
          </div>
        </div>

        <!-- Rechter Monat -->
        <div class="drp-calendar">
          <div class="drp-cal-header">
            <span>{{ monthLabel(rightYear, rightMonth) }}</span>
          </div>
          <div class="drp-grid">
            <div v-for="d in weekdays" :key="d" class="drp-weekday">{{ d }}</div>
            <div v-for="cell in rightCells" :key="cell.key"
                 class="drp-day"
                 :class="dayClass(cell)"
                 @click="selectDay(cell)"
                 @mouseenter="onHoverDay(cell)"
            >
              {{ cell.day }}
            </div>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="drp-footer">
        <span class="drp-range-label">
          {{ startDate ? formatDisplay(startDate) : '—' }}
          →
          {{ endDate ? formatDisplay(endDate) : '—' }}
        </span>
        <button class="drp-apply" @click="apply" :disabled="!startDate || !endDate">
          Anwenden
        </button>
        <button class="drp-reset" @click="reset">Zurücksetzen</button>
      </div>
    </div>

    <!-- Overlay -->
    <div v-if="open" class="drp-overlay" @click="open = false"></div>
  </div>
</template>

<script setup>
import {ref, computed, watchEffect} from 'vue'

const props = defineProps({
  availableDates: {type: Array, required: true},
})

const emit = defineEmits(['update:range'])

const open = ref(false)
const startDate = ref(null)
const endDate = ref(null)
const hoverDate = ref(null)

const leftMonth = ref(0)
const leftYear = ref(2026)

// Initialisiere Kalender beim ersten verfügbaren Datum
watchEffect(() => {
  if (props.availableDates.length > 0) {
    const d = new Date(props.availableDates[0] + 'T00:00:00')
    leftMonth.value = d.getMonth()
    leftYear.value = d.getFullYear()
  }
})

const rightMonth = computed(() => (leftMonth.value + 1) % 12)
const rightYear = computed(() => leftMonth.value === 11 ? leftYear.value + 1 : leftYear.value)

const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const availableSet = computed(() => new Set(props.availableDates))

const displayLabel = computed(() => {
  if (startDate.value && endDate.value) {
    return `${formatDisplay(startDate.value)} – ${formatDisplay(endDate.value)}`
  }
  if (props.availableDates.length > 0) {
    const first = props.availableDates[0]
    const last = props.availableDates[props.availableDates.length - 1]
    return `${formatDisplay(first)} – ${formatDisplay(last)}`
  }
  return 'Zeitraum wählen'
})

function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString('de-DE', {month: 'long', year: 'numeric'})
}

function formatDisplay(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${d}.${m}`
}

function buildCells(year, month) {
  const cells = []
  const first = new Date(year, month, 1)
  let startDow = first.getDay() - 1
  if (startDow < 0) startDow = 6

  for (let i = 0; i < startDow; i++) {
    cells.push({key: `e-${month}-${i}`, day: '', dateStr: null})
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    const dateStr = `${year}-${mm}-${dd}`
    cells.push({key: dateStr, day: d, dateStr})
  }
  return cells
}

const leftCells = computed(() => buildCells(leftYear.value, leftMonth.value))
const rightCells = computed(() => buildCells(rightYear.value, rightMonth.value))

function dayClass(cell) {
  if (!cell.dateStr) return 'drp-empty'
  const available = availableSet.value.has(cell.dateStr)
  const isStart = cell.dateStr === startDate.value
  const isEnd = cell.dateStr === endDate.value
  const hover = hoverDate.value
  const inRange = startDate.value && (endDate.value || hover) &&
      cell.dateStr > startDate.value &&
      cell.dateStr < (endDate.value || hover)

  return {
    'drp-available': available,
    'drp-unavailable': !available,
    'drp-start': isStart,
    'drp-end': isEnd,
    'drp-in-range': inRange,
  }
}

function selectDay(cell) {
  if (!cell.dateStr || !availableSet.value.has(cell.dateStr)) return

  if (!startDate.value || (startDate.value && endDate.value)) {
    startDate.value = cell.dateStr
    endDate.value = null
    hoverDate.value = null
  } else {
    if (cell.dateStr < startDate.value) {
      endDate.value = startDate.value
      startDate.value = cell.dateStr
    } else {
      endDate.value = cell.dateStr
    }
  }
}

function onHoverDay(cell) {
  if (!cell.dateStr || !startDate.value || endDate.value) return
  hoverDate.value = cell.dateStr
}

function prevMonth() {
  if (leftMonth.value === 0) {
    leftMonth.value = 11
    leftYear.value--
  } else {
    leftMonth.value--
  }
}

function nextMonth() {
  if (leftMonth.value === 11) {
    leftMonth.value = 0
    leftYear.value++
  } else {
    leftMonth.value++
  }
}

function apply() {
  if (!startDate.value || !endDate.value) return
  emit('update:range', {start: startDate.value, end: endDate.value})
  open.value = false
}

function reset() {
  startDate.value = null
  endDate.value = null
  hoverDate.value = null
  emit('update:range', null)
}
</script>

<style scoped>
.drp-wrapper {
  position: relative;
  z-index: 100;
}

.drp-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e6ebf2;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #344054;
  cursor: pointer;
  white-space: nowrap;
}

.drp-arrow {
  color: #98a2b3;
}

.drp-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.drp-popup {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 200;
  background: #ffffff;
  border: 1px solid #e6ebf2;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 20px;
  min-width: 560px;
}

.drp-calendars {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.drp-cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 14px;
}

.drp-cal-header button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #667085;
  padding: 2px 8px;
  border-radius: 6px;
}

.drp-cal-header button:hover {
  background: #f2f4f7;
}

.drp-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.drp-weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 800;
  color: #98a2b3;
  padding: 4px 0;
}

.drp-day {
  text-align: center;
  padding: 7px 4px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  cursor: default;
}

.drp-empty {
  visibility: hidden;
}

.drp-unavailable {
  color: #d0d5dd;
  cursor: not-allowed;
}

.drp-available {
  color: #344054;
  cursor: pointer;
}

.drp-available:hover {
  background: #eef4ff;
  color: #1557ff;
}

.drp-start, .drp-end {
  background: #1557ff !important;
  color: #ffffff !important;
  border-radius: 6px;
}

.drp-in-range {
  background: #eef4ff;
  color: #1557ff;
  border-radius: 0;
}

.drp-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e6ebf2;
}

.drp-range-label {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: #344054;
}

.drp-apply {
  background: #1557ff;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.drp-apply:disabled {
  background: #d0d5dd;
  cursor: not-allowed;
}

.drp-reset {
  background: none;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  color: #667085;
}
</style>