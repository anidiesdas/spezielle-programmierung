<template>
  <main class="dashboard-page">
    <header class="dashboard-header">
      <div>
        <h1>Google Trends Analyse</h1>
        <p>Supplements in Deutschland – {{ periodLabel }}</p>
      </div>

      <div class="period-select">
        <span>Zeitraum wählen</span>
        <select v-model="selectedPeriod">
          <option value="1">Letzter 1 Tag</option>
          <option value="5">Letzte 5 Tage</option>
          <option value="15">Letzte 15 Tage</option>
          <option value="30">Letzte 30 Tage</option>
        </select>
      </div>
    </header>

    <div v-if="loading" style="text-align:center; padding: 60px; color: #667085;">
      Daten werden geladen...
    </div>

    <section v-else class="dashboard-grid">
      <aside class="left-column">
        <TermSelector :terms="terms" @toggle-term="toggleTerm" />
        <AiAnalysisCard
            :analysis="aiAnalysis"
            :best-average="bestAverageTerm"
            :highest-peak="highestPeakTerm"
            :rising-trend="risingTrendTerm"
            :active-count="activeTerms.length"
        />
      </aside>

      <div class="content-column">
        <section class="top-grid">
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
        </section>

        <section class="charts-grid">
          <LineChart :terms="activeTerms" :labels="filteredLabels" />
          <DonutChart :terms="activeTerms" />
        </section>

        <section class="bottom-grid">
          <RankingChart :terms="activeTerms" />

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
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref, onMounted } from "vue"
import { getMetrics, getTopQueries, getRisingQueries, getAiAnalysis } from "../services/api.js"

import MetricCard from "../components/MetricCard.vue"
import TermSelector from "@/components/TermSelector.vue"
import AiAnalysisCard from "@/components/AiAnalysisCard.vue"
import LineChart from "@/components/LineChart.vue"
import DonutChart from "@/components/DonutChart.vue"
import QueryTable from "@/components/QueryTable.vue"
import RankingChart from "@/components/RankingChart.vue"

const TERM_COLORS = {
  "Vitamin D":    { color: "#1557ff", bg: "#eef4ff" },
  "Omega 3":      { color: "#43a047", bg: "#edf8ee" },
  "Kreatin":      { color: "#ec2f8c", bg: "#ffe8f3" },
  "Kollagen":     { color: "#e10436", bg: "rgba(165,9,44,0.06)" },
  "Whey Protein": { color: "#8328a7", bg: "rgba(131,40,167,0.04)" },
}

const loading = ref(true)
const selectedPeriod = ref("30")
const selectedTopQueryTerm = ref("Vitamin D")
const selectedRisingQueryTerm = ref("Kreatin")
const allDateLabels = ref([])
const terms = ref([])
const queryRows = ref({})
const risingRows = ref({})
const aiAnalysis = ref("")

onMounted(async () => {
  try {
    // Metrics laden
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

    // Datum Labels generieren
    const count = terms.value[0]?.values?.length || 30
    const labels = []
    const today = new Date()
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      labels.push(`${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
    allDateLabels.value = labels

    // Top Queries laden
    const topData = await getTopQueries()
    Object.keys(topData.data).forEach(termKey => {
      const termName = terms.value.find(t =>
          t.name.toLowerCase().replace(/ /g, '_') === termKey
      )?.name || termKey
      queryRows.value[termName] = topData.data[termKey].map((row, i) => ({
        rank: i + 1,
        query: row.query,
        value: row.searchInterest
      }))
    })

    // Rising Queries laden
    const risingData = await getRisingQueries()
    Object.keys(risingData.data).forEach(termKey => {
      const termName = terms.value.find(t =>
          t.name.toLowerCase().replace(/ /g, '_') === termKey
      )?.name || termKey
      risingRows.value[termName] = risingData.data[termKey].map((row, i) => ({
        rank: i + 1,
        query: row.query,
        value: row.increasePercent
      }))
    })

    // AI Analyse laden
    const analysisData = await getAiAnalysis()
    aiAnalysis.value = analysisData.analysis

  } catch (err) {
    console.error('Fehler beim Laden der Daten:', err)
  } finally {
    loading.value = false
  }
})

const periodLabel = computed(() => {
  if (selectedPeriod.value === "1") return "Letzter 1 Tag"
  return `Letzte ${selectedPeriod.value} Tage`
})

const filteredTerms = computed(() => {
  const days = Number(selectedPeriod.value)
  return terms.value
      .filter(term => term.active)
      .map(term => {
        const filteredValues = term.values.slice(-days)
        const average = filteredValues.reduce((sum, v) => sum + v, 0) / filteredValues.length
        const peak = Math.max(...filteredValues.map(Number))
        return {...term, values: filteredValues, average: Number(average.toFixed(1)), peak}
      })
})

const filteredLabels = computed(() => {
  const days = Number(selectedPeriod.value)
  return allDateLabels.value.slice(-days)
})

const activeTerms = computed(() => filteredTerms.value)

const bestAverageTerm = computed(() =>
    [...activeTerms.value].sort((a, b) => b.average - a.average)[0]
)

const highestPeakTerm = computed(() =>
    [...activeTerms.value].sort((a, b) => b.peak - a.peak)[0]
)

const risingTrendTerm = computed(() =>
    activeTerms.value.find(t => t.trend === "increasing") || activeTerms.value[0]
)

function toggleTerm(termName) {
  const term = terms.value.find(item => item.name === termName)
  if (!term) return
  if (term.active && activeTerms.value.length === 1) return
  term.active = !term.active
}
</script>