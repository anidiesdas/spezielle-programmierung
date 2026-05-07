<template>
  <main class="dashboard-page">

    <header class="dashboard-header">
      <div>
        <h1>Google Trends Analyse</h1>
        <p>Supplements in Deutschland</p>
      </div>
      <DateRangePicker
          :available-dates="allDatesRaw"
          @update:range="onRangeUpdate"
      />
    </header>

    <div v-if="loading" class="loading">Daten werden geladen...</div>

    <template v-else>

      <!-- AI Overview -->
      <section class="ai-card">
        <h3>✨ AI-Analyse</h3>
        <div class="ai-text-wrapper" :class="{ expanded: aiExpanded }">
          <div v-if="aiAnalysis" class="ai-text" v-html="renderedAnalysis"></div>
          <p v-else class="ai-placeholder">Analyse wird geladen...</p>
          <div v-if="!aiExpanded" class="ai-fade"></div>
        </div>
        <button class="ai-toggle-btn" @click="aiExpanded = !aiExpanded">
          {{ aiExpanded ? '▲ Weniger anzeigen' : '▼ Mehr anzeigen' }}
        </button>
      </section>

      <!-- Term Selector -->
      <section class="terms-row">
        <button
            v-for="term in terms"
            :key="term.name"
            class="term-button"
            :class="{ active: term.active }"
            :style="{ '--term-color': term.color, '--term-bg': term.bg }"
            @click="toggleTerm(term.name)"
        >
          <span>{{ term.name }}</span>
          <span class="term-dot">{{ term.active ? "✓" : "" }}</span>
        </button>
      </section>

      <!-- Zeitstrahl + Metric Cards -->
      <section class="timeline-metrics-row">
        <div class="timeline-col">
          <LineChart :terms="activeTerms" :labels="filteredLabels" />
        </div>
        <div class="metrics-col">
          <MetricCard
              label="Höchstes Interesse"
              :title="bestAverageTerm?.name"
              :value="`Ø ${bestAverageTerm?.average}`"
              icon="🏆"
              :color="bestAverageTerm?.color"
              icon-background="#eef4ff"
          />
          <MetricCard
              label="Höchster Peak"
              :title="highestPeakTerm?.name"
              :value="`${highestPeakTerm?.peak}`"
              icon="⌁"
              color="#7c3cff"
              icon-background="#f2eaff"
          />
          <MetricCard
              label="Steigender Trend"
              :title="risingTrendTerm?.name"
              value=""
              icon="↗"
              :color="risingTrendTerm?.color"
              icon-background="#ffe8f3"
          />
        </div>
      </section>

      <!-- Ranking + Donut -->
      <section class="charts-row">
        <RankingChart :terms="activeTerms" />
        <DonutChart :terms="activeTerms" />
      </section>

      <!-- Queries -->
      <section class="queries-row">
        <QueryTable
            title="Top Queries"
            v-model:selected="selectedTopQueryTerm"
            :terms="terms"
            :growth="false"
            :rows="queryRows[selectedTopQueryTerm] || []"
        />
        <QueryTable
            title="Rising Queries"
            v-model:selected="selectedRisingQueryTerm"
            :terms="terms"
            :growth="true"
            :rows="risingRows[selectedRisingQueryTerm] || []"
        />
      </section>

    </template>
  </main>
</template>

<script setup>
import {computed, ref, onMounted} from "vue"
import {marked} from "marked"
import {getMetrics, getTopQueries, getRisingQueries, getAiAnalysis} from "../services/api.js"

import MetricCard from "../components/MetricCard.vue"
import LineChart from "@/components/LineChart.vue"
import DonutChart from "@/components/DonutChart.vue"
import QueryTable from "@/components/QueryTable.vue"
import RankingChart from "@/components/RankingChart.vue"
import DateRangePicker from "@/components/DateRangePicker.vue"

const TERM_COLORS = {
  "Vitamin D": {color: "#1557ff", bg: "#eef4ff"},
  "Omega 3": {color: "#43a047", bg: "#edf8ee"},
  "Kreatin": {color: "#ec2f8c", bg: "#ffe8f3"},
  "Kollagen": {color: "#e10436", bg: "rgba(165,9,44,0.06)"},
  "Whey Protein": {color: "#8328a7", bg: "rgba(131,40,167,0.04)"},
}

const loading = ref(true)
const selectedRange = ref(null)
const selectedTopQueryTerm = ref("Vitamin D")
const selectedRisingQueryTerm = ref("Kreatin")
const allDateLabels = ref([])
const allDatesRaw = ref([])
const terms = ref([])
const queryRows = ref({})
const risingRows = ref({})
const aiAnalysis = ref("")
const aiExpanded = ref(false)

const renderedAnalysis = computed(() => aiAnalysis.value ? marked(aiAnalysis.value) : "")

onMounted(async () => {
  try {
    const metricsData = await getMetrics()
    terms.value = metricsData.terms.map(term => ({
      name: term.name,
      color: TERM_COLORS[term.name]?.color || "#666",
      bg: TERM_COLORS[term.name]?.bg || "#eee",
      active: true,
      average: term.mean,
      peak: term.peak,
      trend: term.trend,
      values: term.values
    }))

    // Rohdaten für Range-Filter
    allDatesRaw.value = metricsData.dates

    // Labels für Anzeige und DateRangePicker
    allDateLabels.value = metricsData.dates.map(d => {
      const [, month, day] = d.split('-')
      return `${day}.${month}`
    })

    const topData = await getTopQueries()
    Object.keys(topData.data).forEach(termKey => {
      const termName = terms.value.find(t =>
          t.name.toLowerCase().replace(/ /g, '_') === termKey
      )?.name || termKey
      queryRows.value[termName] = topData.data[termKey].map((row, i) => ({
        rank: i + 1, query: row.query, value: row.searchInterest
      })).slice(0, 20)
    })

    const risingData = await getRisingQueries()
    Object.keys(risingData.data).forEach(termKey => {
      const termName = terms.value.find(t =>
          t.name.toLowerCase().replace(/ /g, '_') === termKey
      )?.name || termKey
      risingRows.value[termName] = risingData.data[termKey].map((row, i) => ({
        rank: i + 1, query: row.query, value: row.increasePercent
      })).slice(0, 20)
    })

    const analysisData = await getAiAnalysis()
    aiAnalysis.value = analysisData.analysis

  } catch (err) {
    console.error('Fehler beim Laden:', err)
  } finally {
    loading.value = false
  }
})

function onRangeUpdate(range) {
  selectedRange.value = range
}

// Index-basierter Filter anhand des gewählten Datumsbereichs
const filteredIndices = computed(() => {
  if (!selectedRange.value) {
    return {start: 0, end: allDatesRaw.value.length - 1}
  }
  const startIdx = allDatesRaw.value.findIndex(d => d >= selectedRange.value.start)
  const endIdx = allDatesRaw.value.findLastIndex(d => d <= selectedRange.value.end)
  return {
    start: startIdx === -1 ? 0 : startIdx,
    end: endIdx === -1 ? allDatesRaw.value.length - 1 : endIdx
  }
})

const filteredTerms = computed(() => {
  const {start, end} = filteredIndices.value
  return terms.value
      .filter(term => term.active)
      .map(term => {
        const filteredValues = term.values.slice(start, end + 1)
        const average = filteredValues.reduce((sum, v) => sum + v, 0) / filteredValues.length
        const peak = Math.max(...filteredValues.map(Number))
        return {...term, values: filteredValues, average: Number(average.toFixed(1)), peak}
      })
})

const filteredLabels = computed(() => {
  const {start, end} = filteredIndices.value
  return allDateLabels.value.slice(start, end + 1)
})

const activeTerms = computed(() => filteredTerms.value)
const bestAverageTerm = computed(() => [...activeTerms.value].sort((a, b) => b.average - a.average)[0])
const highestPeakTerm = computed(() => [...activeTerms.value].sort((a, b) => b.peak - a.peak)[0])
const risingTrendTerm = computed(() => activeTerms.value.find(t => t.trend === "increasing") || activeTerms.value[0])

function toggleTerm(termName) {
  const term = terms.value.find(item => item.name === termName)
  if (!term) return
  if (term.active && activeTerms.value.length === 1) return
  term.active = !term.active
}
</script>